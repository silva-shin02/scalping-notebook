// OS値帯の定義（予想OS度A〜Eの帯と同一区切り・色は予想OS度の配色を踏襲）
var _EL_OS_BANDS_V2 = [
  { key: "E", min: 0, max: 4, label: "0〜4円", color: "#BE185D" },
  { key: "D", min: 5, max: 9, label: "5〜9円", color: "#0E7490" },
  { key: "C", min: 10, max: 14, label: "10〜14円", color: "#7C3AED" },
  { key: "B", min: 15, max: 19, label: "15〜19円", color: "#9A3412" },
  { key: "A", min: 20, max: Infinity, label: "20円〜", color: "#1E8449" }
];
// OS値→帯index（0=0〜4円帯 … 4=20円〜帯）。負値・非数はnull。
function _elOsBandIdxV2(v) {
  var n = Number(v);
  if (isNaN(n) || n < 0) return null;
  for (var i = 0; i < _EL_OS_BANDS_V2.length; i++) {
    if (n >= _EL_OS_BANDS_V2[i].min && n <= _EL_OS_BANDS_V2[i].max) return i;
  }
  return _EL_OS_BANDS_V2.length - 1;
}
// ===== OS連鎖分析（OS1→OS2→OS3…の数値帯ごとの次OS分布・遷移＋成績）2026-06-14 =====
// OS帯。OS2以降は基準線割れ＝マイナスもあるため「下落」帯を先頭に追加（正帯は予想OS度と同区切り）。
var _EL_OSC_BANDS = [
  { key: "neg", label: "下落", color: "#6B7280" },
  { key: "E", label: "0〜4円", color: "#BE185D" },
  { key: "D", label: "5〜9円", color: "#0E7490" },
  { key: "C", label: "10〜14円", color: "#7C3AED" },
  { key: "B", label: "15〜19円", color: "#9A3412" },
  { key: "A", label: "20円〜", color: "#1E8449" }
];
// OS高値→帯index（0=下落 … 5=20円〜）。非数はnull。
function _elOscBandIdx(v) {
  if (v == null || v === "") return null;
  var n = Number(v); if (isNaN(n)) return null;
  if (n < 0) return 0;
  if (n <= 4) return 1;
  if (n <= 9) return 2;
  if (n <= 14) return 3;
  if (n <= 19) return 4;
  return 5;
}
// signalのOS1〜OS5高値を配列[0..4]で返す（_epLegsのrole→位置にマップ・未入力はnull）。OS4=H1/OS5=H2足。
function _elOscHighs(s) {
  var out = [null, null, null, null, null];
  var map = { os1: 0, os2: 1, os3: 2, h1: 3, h2: 4 };
  _epLegs(s).forEach(function(l) { var i = map[l.role]; if (i != null) out[i] = l.h; });
  return out;
}
// 指定OS足(legIdx=0..4)についてrecsを粒度別集計。gran="band"(帯)|"each"(1円刻み)。次OS(legIdx+1)中央値・遷移行列・成績(採用α基準・E成立分のみ)。
// bands/matrixのキーは数値バケットキー（band=帯index・each=整数値）。rows/colsは出現バケットキーの昇順。
function _elOscAgg(recs, legIdx, aiOf, gran) {
  gran = gran || "band";
  var mk = function() { return { cnt: 0, eOk: 0, nextVals: [], ok: 0, ng: 0, draw: 0, miss: 0, planSum: 0, planCnt: 0, planVals: [], h1Sum: 0, h1Cnt: 0, h1Vals: [], stop: 0, soft: 0 }; };
  var bands = {}, matrix = {}, rowP = {}, colP = {}, total = 0, maxCell = 0;
  recs.forEach(function(r) {
    var s = r.signal, hs = _elOscHighs(s), bi = _elOscBucket(hs[legIdx], gran);
    if (bi == null) return;
    if (!bands[bi]) bands[bi] = mk();
    var b = bands[bi]; b.cnt++; total++; rowP[bi] = true;
    var nv = (legIdx + 1 <= 4) ? hs[legIdx + 1] : null;
    if (nv != null) {
      b.nextVals.push(nv);
      var nbi = _elOscBucket(nv, gran);
      if (nbi != null) {
        colP[nbi] = true;
        if (!matrix[bi]) matrix[bi] = {};
        matrix[bi][nbi] = (matrix[bi][nbi] || 0) + 1;
        if (matrix[bi][nbi] > maxCell) maxCell = matrix[bi][nbi];
      }
    }
    var ai = aiOf(r), rr = _epResolve(s, ai.alpha);
    if (rr && rr.judge === "ok") {
      b.eOk++;
      var res = _elDynResult(s, ai.alpha, ai.cutLine);
      if (res === "ok") b.ok++; else if (res === "ng") b.ng++; else if (res === "draw") b.draw++;
      var pv = _elDynPlanned(s, ai.alpha, ai.cutLine);
      if (pv != null) { b.planSum += pv; b.planCnt++; b.planVals.push(pv); }
      var h1 = _elHold1TotParts(s, ai.alpha, ai.cutLine);
      if (h1 && h1.main != null) { b.h1Sum += h1.main; b.h1Cnt++; b.h1Vals.push(h1.main); }
      var isStop = _elPlanIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop2(s, ai.alpha, ai.cutLine);
      if (isStop) b.stop++; else if (res === "ng") b.soft++;
    } else if (rr && rr.judge === "miss") b.miss++;
  });
  var rows = Object.keys(rowP).map(function(k) { return Number(k); }).sort(function(a, b) { return a - b; });
  var cols = Object.keys(colP).map(function(k) { return Number(k); }).sort(function(a, b) { return a - b; });
  return { bands: bands, matrix: matrix, rows: rows, cols: cols, total: total, maxCell: maxCell };
}
// OS連鎖の帯チップ。
function _elOscChip(bi, big) {
  var d = _EL_OSC_BANDS[bi];
  return React.createElement("span", { style: { display: "inline-block", padding: big ? "2px 8px" : "1px 6px", borderRadius: 8, fontSize: big ? 11 : 9, fontWeight: 700, color: "#fff", background: d.color, whiteSpace: "nowrap" } }, d.label);
}
// ===== OS値分析の粒度（帯⇄1円刻み）共通 2026-06-15 =====
// 帯/1円刻みの切替トグル。gran="band"|"each"・setGranで切替。
function _elGranToggle(gran, setGran) {
  var opt = function(v, lab) {
    var on = gran === v;
    return React.createElement("button", { type: "button", key: v, onClick: function() { setGran(v); },
      style: { padding: "2px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#999", borderRadius: 5 } }, lab);
  };
  return React.createElement("div", { style: { display: "inline-flex", gap: 4, alignItems: "center", flexShrink: 0 } },
    React.createElement("span", { style: { fontSize: 9, color: "#aaa", fontWeight: 700, marginRight: 1 } }, "粒度"),
    opt("band", "帯"), opt("each", "1円刻み"));
}
// OS高値→粒度別バケットキー（数値）。band=帯index(0..5)・each=整数値そのもの（負値=下落含む）。非数はnull。
function _elOscBucket(v, gran) {
  if (gran === "each") { if (v == null || v === "") return null; var n = Number(v); if (isNaN(n)) return null; return Math.round(n); }
  return _elOscBandIdx(v);
}
// 粒度別バケットキー→ラベル。
function _elOscBucketLabel(key, gran) { return gran === "each" ? (key + "円") : _EL_OSC_BANDS[key].label; }
// 粒度別バケットキー→色（each時は値が属する帯色を継承）。
function _elOscBucketColor(key, gran) { var bi = gran === "each" ? _elOscBandIdx(key) : key; return (bi != null && _EL_OSC_BANDS[bi]) ? _EL_OSC_BANDS[bi].color : "#6B7280"; }
// 粒度別バケットチップ。
function _elOscChipG(key, gran, big) {
  if (gran !== "each") return _elOscChip(key, big);
  return React.createElement("span", { style: { display: "inline-block", padding: big ? "2px 8px" : "1px 6px", borderRadius: 8, fontSize: big ? 11 : 9, fontWeight: 700, color: "#fff", background: _elOscBucketColor(key, gran), whiteSpace: "nowrap" } }, key + "円");
}
// OS連鎖分析コンポーネント（記録帳タブ＋DayViewで共用）。props: recs/data/aiOf?/dense?。
// 状態: path=選んだ帯index配列（OS1→OS2…と絞り込み）。深さdepthでOS(depth+1)の分布を分析。
function _elOsChainSection(_ref_osc) {
  var recs = _ref_osc.recs || [];
  var data = _ref_osc.data;
  var aiOf = _ref_osc.aiOf || function(r) { return _elAlphaInfo(r, data); };
  var dense = !!_ref_osc.dense;
  var _uP = useState([]), path = _uP[0], setPath = _uP[1];
  var _uS = useState(""), sigFil = _uS[0], setSigFil = _uS[1];
  var _uG = useState("band"), gran = _uG[0], setGran = _uG[1];
  var _setGran = function(v) { setGran(v); setPath([]); };
  var bLab = function(k) { return _elOscBucketLabel(k, gran) + (gran === "band" ? "帯" : ""); };
  var bCol = function(k) { return _elOscBucketColor(k, gran); };
  var granBar = React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 6 } }, _elGranToggle(gran, _setGran));
  var _hc = "#9A3412";
  var base = recs.filter(function(r) { return r && r.signal && _epIsV2(r.signal); });
  var _tagsOf = function(s) {
    var tags = (s.tags && s.tags.length ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
    return tags.length ? tags : ["(未設定)"];
  };
  var sigCnt = {};
  base.forEach(function(r) { _tagsOf(r.signal).forEach(function(t) { sigCnt[t] = (sigCnt[t] || 0) + 1; }); });
  var sigOpts = Object.keys(sigCnt).sort(function(a, b) { return sigCnt[b] - sigCnt[a]; });
  var pool = sigFil ? base.filter(function(r) { return _tagsOf(r.signal).indexOf(sigFil) >= 0; }) : base;
  var scope = pool.filter(function(r) {
    var hs = _elOscHighs(r.signal);
    for (var i = 0; i < path.length; i++) { var bi = _elOscBucket(hs[i], gran); if (bi == null || bi !== path[i]) return false; }
    return true;
  });
  var depth = path.length, legIdx = depth, curNo = depth + 1, hasNext = curNo < 5;
  if (!base.length) return React.createElement("div", { style: { color: "#aaa", fontSize: 12, padding: "8px 0" } }, "EP起算（v2）記録がありません");

  var sigSel = sigOpts.length > 1 ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" } },
    React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "シグナル"),
    React.createElement("select", { value: sigFil, onChange: function(e) { setSigFil(e.target.value); setPath([]); }, style: { padding: "4px 8px", fontSize: 11, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#333" } },
      [React.createElement("option", { key: "_a", value: "" }, "全シグナル")].concat(sigOpts.map(function(t) { return React.createElement("option", { key: t, value: t }, stripCat(t) + "（" + sigCnt[t] + "）"); })))) : null;

  var crumbs = [React.createElement("span", { key: "_root", onClick: function() { setPath([]); }, style: { cursor: "pointer", color: path.length ? "#0369A1" : "#333", fontWeight: 700, textDecoration: path.length ? "underline" : "none" } }, "全体（" + pool.length + "件）")];
  path.forEach(function(bi, i) {
    crumbs.push(React.createElement("span", { key: "_s" + i, style: { color: "#bbb", margin: "0 5px" } }, "›"));
    crumbs.push(React.createElement("span", { key: "_c" + i, onClick: function() { setPath(path.slice(0, i)); }, style: { cursor: "pointer", color: "#0369A1", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 } }, "OS" + (i + 1) + ":", _elOscChipG(bi, gran)));
  });
  var crumbBar = React.createElement("div", { style: { fontSize: 11, marginBottom: 8, display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 4 } }, crumbs);

  if (!scope.length) {
    return React.createElement("div", null, sigSel, granBar, crumbBar,
      React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "12px 0", textAlign: "center", border: "1px dashed #e0ddd6", borderRadius: 8 } }, "この条件の記録がありません"),
      React.createElement("button", { onClick: function() { setPath(path.slice(0, -1)); }, style: { marginTop: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" } }, "← 1つ戻る"));
  }

  var agg = _elOscAgg(scope, legIdx, aiOf, gran);
  var drill = function(bi) { if (hasNext) setPath(path.concat([bi])); };

  var head = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: _hc, marginBottom: 6 } },
    "▶ OS" + curNo + " の数値分布" + (hasNext ? "（行タップでOS" + (curNo + 1) + "へ絞り込み）" : "（最終足）"));

  var heat = null;
  if (hasNext && agg.rows.length && agg.cols.length) {
    var corner = React.createElement("td", { key: "_corner", style: { fontSize: 9, color: "#aaa", padding: "2px 6px", whiteSpace: "nowrap" } }, "OS" + curNo + " ＼ OS" + (curNo + 1));
    var hHead = React.createElement("tr", { key: "_hh" }, [corner].concat(agg.cols.map(function(cj) { return React.createElement("td", { key: "h" + cj, style: { padding: "2px 3px", textAlign: "center" } }, _elOscChipG(cj, gran)); })));
    var hRows = agg.rows.map(function(ri) {
      var cells = [React.createElement("td", { key: "r" + ri, onClick: function() { drill(ri); }, style: { padding: "2px 6px", cursor: hasNext ? "pointer" : "default", whiteSpace: "nowrap" } }, _elOscChipG(ri, gran))];
      agg.cols.forEach(function(cj) {
        var c = (agg.matrix[ri] && agg.matrix[ri][cj]) || 0;
        var a = c ? (0.1 + 0.55 * (c / (agg.maxCell || 1))) : 0;
        cells.push(React.createElement("td", { key: "c" + ri + "_" + cj, onClick: function() { drill(ri); }, style: { padding: "3px 5px", textAlign: "center", fontSize: 10, fontWeight: 700, background: c ? "rgba(29,158,117," + a.toFixed(2) + ")" : "#fafafa", color: a >= 0.4 ? "#fff" : "#0F6E56", border: "1px solid #fff", cursor: hasNext ? "pointer" : "default", minWidth: 30 } }, c || ""));
      });
      return React.createElement("tr", { key: "row" + ri }, cells);
    });
    heat = React.createElement("div", { style: { overflowX: "auto", marginBottom: 10 } },
      React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 3 } }, "遷移ヒートマップ（セル＝件数・濃いほど多い）"),
      React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 10 } },
        React.createElement("tbody", null, [hHead].concat(hRows))));
  }

  var _pnl = function(sum, cnt) { if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var a = Math.round(sum / cnt); return React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)); };
  var _pctN = function(num, den) { if (!den) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var p = Math.round(num / den * 100); return React.createElement("span", { style: { fontWeight: 700, color: p >= 50 ? "#1E8449" : "#B45309" } }, p + "%"); };
  var headLabels = [(gran === "each" ? "OS" + curNo + "値" : "OS" + curNo + "帯"), "件数", "E到達率"].concat(hasNext ? ["OS" + (curNo + 1) + "値"] : []).concat(["E後の勝率", "EP損益", "H1損益", "見切り率", "損切り率"]);
  var thead = React.createElement("tr", { style: { background: "#f5f4f0" } }, headLabels.map(function(t, i) { return React.createElement("th", { key: i, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: _hc } }, t); }));
  var _tdx = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var rowsTbl = agg.rows.map(function(ri) {
    var b = agg.bands[ri];
    var cells = [
      _tdx(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, hasNext ? React.createElement("span", { style: { color: "#F97316", fontSize: 9 } }, "▶") : null, _elOscChipG(ri, gran, true)), { textAlign: "left", paddingLeft: 6 }),
      _tdx(b.cnt + "件", { fontWeight: 700 }),
      _tdx(_pctN(b.eOk, b.cnt))
    ];
    if (hasNext) cells.push(_tdx(_elOsMMCell(b.nextVals)));
    cells.push(_tdx(_elEwinCell(b.ok, b.ng, b.draw)));
    cells.push(_tdx(_elPnlMMCell(b.planVals)));
    cells.push(_tdx(_elPnlMMCell(b.h1Vals)));
    cells.push(_tdx((b.ok + b.ng + b.draw) ? React.createElement("span", { style: { color: b.soft ? "#B45309" : "#bbb", fontWeight: b.soft ? 700 : 400 } }, Math.round(b.soft / (b.ok + b.ng + b.draw) * 100) + "%") : React.createElement("span", { style: { color: "#ccc" } }, "—")));
    cells.push(_tdx((b.ok + b.ng + b.draw) ? React.createElement("span", { style: { color: b.stop ? "#1E8449" : "#bbb", fontWeight: b.stop ? 700 : 400 } }, Math.round(b.stop / (b.ok + b.ng + b.draw) * 100) + "%") : React.createElement("span", { style: { color: "#ccc" } }, "—")));
    return React.createElement.apply(null, ["tr", { key: "t" + ri, onClick: hasNext ? function() { drill(ri); } : null, style: { cursor: hasNext ? "pointer" : "default" } }].concat(cells));
  });
  var table = React.createElement("div", { style: { overflowX: "auto" } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, thead),
      React.createElement("tbody", null, rowsTbl)));

  var insight = null;
  if (agg.rows.length >= 2) {
    var items = [];
    var topB = agg.rows.slice().sort(function(a, b) { return agg.bands[b].cnt - agg.bands[a].cnt; })[0];
    items.push(React.createElement("span", null, "OS" + curNo + "は", _elInsightEmV2(bLab(topB), bCol(topB)), "が最も多い（" + agg.bands[topB].cnt + "/" + agg.total + "件）。"));
    if (hasNext) {
      var bestNext = null;
      agg.rows.forEach(function(ri) { var b = agg.bands[ri]; if (b.nextVals.length) { var mv = _elMedian(b.nextVals); if (bestNext == null || mv > bestNext.v) bestNext = { v: mv, ri: ri }; } });
      if (bestNext) items.push(React.createElement("span", null, "OS" + curNo + "が", _elInsightEmV2(bLab(bestNext.ri), bCol(bestNext.ri)), "のとき次のOS" + (curNo + 1) + "が中央", _elInsightEmV2(bestNext.v + "円"), "と最も伸びる。"));
    }
    var bestWin = null;
    agg.rows.forEach(function(ri) { var b = agg.bands[ri], t = b.ok + b.ng; if (t && (bestWin == null || b.ok / t > bestWin.v)) bestWin = { v: b.ok / t, ri: ri }; });
    if (bestWin) items.push(React.createElement("span", null, "勝率が最も高いのはOS" + curNo + "＝", _elInsightEmV2(bLab(bestWin.ri), bCol(bestWin.ri)), "（", _elInsightEmV2(Math.round(bestWin.v * 100) + "%"), "）。"));
    insight = _elInsightBoxV2(items, { note: "OS" + curNo + "＝" + (curNo <= 3 ? curNo + "本目" : curNo === 4 ? "EP後H1" : "EP後H2") + "の高値（水準線比）。E到達率＝α到達して取引できた割合。E後の勝率＝取引（E成立）後にEP損益が利益だった割合。EP損益/H1/見切り率/損切り率は取引（E成立）分のみ。" });
  }

  var _bw = gran === "each" ? "値" : "帯";
  var intro = dense ? null : React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 8, lineHeight: 1.5 } }, "OS1の数値" + (gran === "each" ? "" : "帯") + "から始めて、行（またはヒートマップの行）をタップするごとに「その" + _bw + "のときの次のOS」へ絞り込みます。各" + _bw + "の件数・次OSの中央値/分布・成績（E到達率・E後の勝率・損益・損切り）を同時に確認できます。");

  return React.createElement("div", null, intro, sigSel, granBar, crumbBar, head, heat, table, insight);
}

// 各足のOS値プロファイル（OS連鎖タブ／2026-06-14b）: OS1〜OS5(=固定の足位置・OS4=H1足/OS5=H2足)の高値(水準線比)の
// 中央値・平均・下落率(高値が基準線割れ=負の割合)・6帯分布。OS1専用の「OS値の分析」(_elOsSectionV2)を全足に拡張。
// OS2以降は基準線割れ(下落)があるため下落帯を含む_EL_OSC_BANDS/_elOscBandIdxで集計。役割は採用αで動くがここは固定足位置で集計。
function _elOsLegsSectionV2(_ref) {
  var recs = _ref.recs;
  var _uG = useState("band"), gran = _uG[0], setGran = _uG[1];
  var base = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal); });
  if (!base.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "EP起算（v2）記録がありません");
  var LEGS = [{ i: 0, label: "OS1" }, { i: 1, label: "OS2" }, { i: 2, label: "OS3" }, { i: 3, label: "OS4(H1)" }, { i: 4, label: "OS5(H2)" }];
  var rows = LEGS.map(function(L) {
    var vals = [];
    base.forEach(function(r) { var hs = _elOscHighs(r.signal); var v = hs[L.i]; if (v != null) vals.push(v); });
    var neg = 0, dist = [0, 0, 0, 0, 0, 0];
    vals.forEach(function(v) { if (v < 0) neg++; var bi = _elOscBandIdx(v); if (bi != null) dist[bi]++; });
    var mean = vals.length ? Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length * 10) / 10 : null;
    return { label: L.label, n: vals.length, med: _elMedian(vals), mean: mean, neg: neg, dist: dist, vals: vals };
  });
  var _bar6 = function(dist) {
    var tot = 0; dist.forEach(function(c) { tot += c; });
    if (!tot) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    var tip = _EL_OSC_BANDS.map(function(b, i) { return b.label + ": " + dist[i] + "件"; }).join(" / ");
    return React.createElement("span", { title: tip, style: { display: "inline-flex", width: 96, height: 11, borderRadius: 3, overflow: "hidden", background: "#f0ede6", verticalAlign: "middle" } },
      _EL_OSC_BANDS.map(function(b, i) { var c = dist[i]; if (!c) return null; return React.createElement("span", { key: i, style: { width: (c / tot * 100) + "%", background: b.color, height: "100%" } }); }));
  };
  // 1円刻みヒストグラム（整数値ごとの件数を棒で・色は属する帯。負値=下落も表示）。各棒hoverで「N円: M件」。
  var _bar1 = function(vals) {
    if (!vals.length) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    var cnt = {}, mn = Infinity, mx = -Infinity;
    vals.forEach(function(v) { var k = Math.round(v); cnt[k] = (cnt[k] || 0) + 1; if (k < mn) mn = k; if (k > mx) mx = k; });
    var maxC = 0, kk; for (kk in cnt) { if (cnt[kk] > maxC) maxC = cnt[kk]; }
    var bars = [];
    for (var x = mn; x <= mx; x++) {
      var c = cnt[x] || 0;
      var bi = _elOscBandIdx(x);
      var col = (bi != null && _EL_OSC_BANDS[bi]) ? _EL_OSC_BANDS[bi].color : "#ccc";
      bars.push(React.createElement("span", { key: x, title: x + "円: " + c + "件", style: { flex: "1 0 0", display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 2 } },
        React.createElement("span", { style: { height: (c ? Math.max(2, Math.round(c / maxC * 22)) : 0) + "px", background: c ? col : "transparent", borderRadius: 1 } })));
    }
    return React.createElement("span", { title: mn + "〜" + mx + "円（1円刻み）", style: { display: "inline-flex", alignItems: "flex-end", gap: 1, width: 150, height: 24, verticalAlign: "middle" } }, bars);
  };
  var _medNode = function(m) { return m == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("b", { style: { color: m >= 0 ? "#9A3412" : "#1E8449" } }, m + "円"); };
  // 前足比 伸長率: 記録ごとに「この足の高値 > 前の足の高値」だった割合（母数=両足とも高値入力ありの記録）＋伸びた時/縮んだ時の平均差。
  // オーバーシュート伸長が意味を持つOS1→OS2・OS2→OS3のみ算出（OS4/OS5=EP後の足は符号系が異なり「最適ホールド本数」が担当）。
  var ext = [null];
  for (var li = 1; li <= 2; li++) {
    (function(li) {
      var pairN = 0, upN = 0, upSum = 0, dnN = 0, dnSum = 0;
      base.forEach(function(r) {
        var hs = _elOscHighs(r.signal), cur = hs[li], prev = hs[li - 1];
        if (cur == null || prev == null) return;
        pairN++; var d = cur - prev;
        if (d > 0) { upN++; upSum += d; } else { dnN++; dnSum += d; }
      });
      ext.push(pairN ? { pairN: pairN, upN: upN, rate: Math.round(upN / pairN * 100), upAvg: upN ? Math.round(upSum / upN * 10) / 10 : null, dnAvg: dnN ? Math.round(dnSum / dnN * 10) / 10 : null } : null);
    })(li);
  }
  var _extNode = function(e) {
    if (!e) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    return React.createElement("span", { title: e.pairN + "件中 " + e.upN + "件で前足の高値を上回り", style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
      React.createElement("b", { style: { color: e.rate >= 50 ? "#C0392B" : "#1E8449" } }, e.rate + "%"),
      React.createElement("span", { style: { fontSize: 9, color: "#888" } }, (e.upAvg != null ? "+" + e.upAvg : "—") + " / " + (e.dnAvg != null ? e.dnAvg : "—")));
  };
  var body = rows.map(function(o, ri) {
    return React.createElement("tr", { key: o.label },
      _elv2Td(React.createElement("b", null, o.label), { textAlign: "left", paddingLeft: 8, color: "#9A3412" }),
      _elv2Td(o.n + "件", { fontWeight: 700 }),
      _elv2Td(_medNode(o.med)),
      _elv2Td(o.mean != null ? React.createElement("span", { style: { color: "#888" } }, o.mean + "円") : "—"),
      _elv2Td(o.n ? React.createElement("span", { style: { fontWeight: 700, color: o.neg ? "#1E8449" : "#bbb" } }, Math.round(o.neg / o.n * 100) + "%") : "—"),
      _elv2Td(_extNode(ext[ri])),
      _elv2Td(gran === "each" ? _bar1(o.vals) : _bar6(o.dist)));
  });
  var legend = React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "2px 8px", margin: "5px 0 0" } },
    _EL_OSC_BANDS.map(function(b, i) { return React.createElement("span", { key: i, style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, color: "#666" } }, React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: b.color, display: "inline-block" } }), b.label); }));
  var items = [];
  var os1 = rows[0], os2 = rows[1], os3 = rows[2], h1 = rows[3], h2 = rows[4];
  if (os1.med != null && os2.med != null) items.push(React.createElement("span", null, "高値の中央値はOS1=", _elInsightEmV2(os1.med + "円"), "→OS2=", _elInsightEmV2(os2.med + "円"), os3.med != null ? React.createElement("span", null, "→OS3=", _elInsightEmV2(os3.med + "円")) : null, "＝", (os2.med > os1.med ? "2本目も伸びやすい。" : "2本目で伸びは鈍る傾向。")));
  if (ext[1]) items.push(React.createElement("span", null, "記録ごとに見ると、OS2がOS1の高値を", _elInsightEmV2("上回ったのは" + ext[1].rate + "%"), "（" + ext[1].pairN + "件中" + ext[1].upN + "件）", ext[1].upAvg != null ? React.createElement("span", null, "・上回った時は平均", _elInsightEmV2("+" + ext[1].upAvg + "円"), "深い") : null, "＝", (ext[1].rate >= 50 ? "2本目も深押ししやすい。" : "2本目で止まりやすい（OS1で伸び切ることが多い）。")));
  var negLeg = rows.filter(function(o) { return o.n >= 3 && o.neg > 0; }).sort(function(a, b) { return (b.neg / b.n) - (a.neg / a.n); })[0];
  if (negLeg) items.push(React.createElement("span", null, _elInsightEmV2(negLeg.label), "は下落率", _elInsightEmV2(Math.round(negLeg.neg / negLeg.n * 100) + "%"), "＝高値が基準線割れになりやすい足（深追い注意）。"));
  if (h1.med != null) items.push(React.createElement("span", null, "EP後はH1(OS4)中央", _elInsightEmV2(h1.med + "円"), h2.med != null ? React.createElement("span", null, "・H2(OS5)中央", _elInsightEmV2(h2.med + "円")) : null, "＝保有中の典型的な高値。最適な手仕舞いは深掘りタブの「最適ホールド本数」を参照。"));
  return React.createElement("div", null,
    React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 4 } }, _elGranToggle(gran, setGran)),
    _elv2Table(["足", "入力", "中央値", "平均", "下落率", "前足比", gran === "each" ? "1円刻み分布" : "帯分布（6帯）"], body),
    legend,
    _elInsightBoxV2(items, { note: (gran === "each" ? "各足の高値（水準線比・↑正/↓負）を1円刻みで分布表示（棒の色＝属する帯・hoverで件数）。" : "各足の高値（水準線比・↑正/↓負）。") + "OS1=寄り足／OS2・OS3=待ち足／OS4=EP後H1足・OS5=H2足の固定位置。OS2以降は基準線割れ（高値が負＝下落）あり＝下落帯を含む。中央値=右偏のため典型値（平均は外れ値に上振れ）。下落率=高値が0未満の割合。前足比＝記録ごとに『この足の高値＞前の足の高値』だった割合（伸長率・母数=両足とも高値入力ありの記録）。下段＝上回った時の平均伸び幅／下回った時の平均（前足比・円）。OS1→OS2・OS2→OS3のオーバーシュート伸長のみ（EP後のH1/H2の伸びは深掘りタブ『最適ホールド本数』を参照）。" }));
}

// records配列のOS値統計（平均/中央値/最頻値/最小/最大/帯別分布dist[5]）。OS値入力なしならnull。
function _elOsStatsV2(recs) {
  var vals = [];
  (recs || []).forEach(function(r) {
    var s = r && r.signal ? r.signal : r;
    if (s && s.osVal != null && s.osVal !== "") { var n = Number(s.osVal); if (!isNaN(n)) vals.push(n); }
  });
  if (!vals.length) return null;
  var sorted = vals.slice().sort(function(a, b) { return a - b; });
  var sum = 0; vals.forEach(function(v) { sum += v; });
  var mid = Math.floor(vals.length / 2);
  var med = vals.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 10) / 10;
  var cntMap = {}, modeVal = null, modeN = 0;
  vals.forEach(function(v) { var k = Math.round(v); cntMap[k] = (cntMap[k] || 0) + 1; if (cntMap[k] > modeN) { modeN = cntMap[k]; modeVal = k; } });
  var dist = [0, 0, 0, 0, 0];
  vals.forEach(function(v) { var bi = _elOsBandIdxV2(v); if (bi != null) dist[bi]++; });
  return { n: vals.length, avg: Math.round(sum / vals.length * 10) / 10, med: med,
    mode: { val: modeVal, n: modeN }, min: sorted[0], max: sorted[sorted.length - 1], dist: dist };
}
// 損切り回数の集計。plan=想定(OS値−α≧損切り値)・h1=H1高値で新規・h2=H2高値で新規(H2データあり)・any=いずれか。
// rate=any÷OS値入力件数(%)。miss=E基準未達(α>OS値)件数。αと損切り値は各記録の採用値(_elAlphaInfo)
// ＝銘柄別記録(app-02)・取引(app-04)テーブルの損益計算と同一基準。H2は_elH2Miss(H1までE基準未達=H2非成立・
// 表でも合計除外)をガードして数えない。
function _elStopStatsV2(recs, data) {
  var o = { n: (recs || []).length, os: 0, plan: 0, h1: 0, h2: 0, any: 0, miss: 0, rate: null };
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s) return;
    var ai = _elAlphaInfo(r, data);
    if (s.osVal != null && s.osVal !== "") o.os++;
    if (_elDynResult(s, ai.alpha, ai.cutLine) === "miss") o.miss++;
    var p = _elPlanIsStop(s, ai.alpha, ai.cutLine);
    var h1 = !p && _elHoldIsStop(s, ai.alpha, ai.cutLine);
    var h2 = !p && !h1 && _elHas2Data(s) && !_elH2Miss(s, ai.alpha) && _elHoldIsStop2(s, ai.alpha, ai.cutLine);
    if (p) o.plan++;
    if (h1) o.h1++;
    if (h2) o.h2++;
    if (p || h1 || h2) o.any++;
  });
  if (o.os > 0) o.rate = Math.round(o.any / o.os * 100);
  return o;
}
// 損切り回数セルの標準表示「n回 (率%)」＋内訳「想a・H1 b・H2 c」。0回はグレー・回数ありは緑（損失方向）。
function _elStopCellV2(ss) {
  if (!ss || ss.os === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  if (ss.any === 0) return React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "0回");
  var parts = [];
  if (ss.plan) parts.push("想" + ss.plan);
  if (ss.h1) parts.push("H1 " + ss.h1);
  if (ss.h2) parts.push("H2 " + ss.h2);
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } },
    React.createElement("span", { style: { fontWeight: 700, color: "#1E8449", whiteSpace: "nowrap" } },
      ss.any + "回",
      ss.rate != null ? React.createElement("span", { style: { fontWeight: 400, fontSize: 9, color: "#888", marginLeft: 2 } }, "(" + ss.rate + "%)") : null),
    parts.length ? React.createElement("span", { style: { fontSize: 8, color: "#999", whiteSpace: "nowrap" } }, parts.join("・")) : null);
}
// OS値帯の積み上げ分布バー（表セル用ミニバー・ホバーで帯別件数）。
function _elOsDistBarV2(dist, w, h) {
  var tot = 0; (dist || []).forEach(function(c) { tot += c; });
  if (!tot) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var tip = _EL_OS_BANDS_V2.map(function(b, i) { return b.label + ": " + (dist[i] || 0) + "件"; }).join(" / ");
  return React.createElement("span", { title: tip, style: { display: "inline-flex", width: w || 72, height: h || 10, borderRadius: 3, overflow: "hidden", background: "#f0ede6", verticalAlign: "middle" } },
    _EL_OS_BANDS_V2.map(function(b, i) {
      var c = dist[i] || 0;
      if (!c) return null;
      return React.createElement("span", { key: b.key, style: { width: (c / tot * 100) + "%", background: b.color, height: "100%" } });
    }));
}
// OS値帯の円グラフ（SVGドーナツ・中央に件数）。distが全0ならnull。
function _elOsPieV2(dist, size) {
  var tot = 0; (dist || []).forEach(function(c) { tot += c; });
  if (!tot) return null;
  var sz = size || 96, cx = sz / 2, cy = sz / 2, R = sz / 2 - 2;
  var segs = [], start = -Math.PI / 2;
  _EL_OS_BANDS_V2.forEach(function(b, i) {
    var c = dist[i] || 0;
    if (!c) return;
    var ang = c / tot * Math.PI * 2;
    segs.push({ color: b.color, a0: start, a1: start + ang, frac: c / tot, label: b.label, cnt: c });
    start += ang;
  });
  var kids = segs.map(function(sg, i) {
    var title = React.createElement("title", null, sg.label + ": " + sg.cnt + "件 (" + Math.round(sg.frac * 100) + "%)");
    if (sg.frac >= 0.9999) {
      return React.createElement("circle", { key: i, cx: cx, cy: cy, r: R, fill: sg.color }, title);
    }
    var x0 = cx + R * Math.cos(sg.a0), y0 = cy + R * Math.sin(sg.a0);
    var x1 = cx + R * Math.cos(sg.a1), y1 = cy + R * Math.sin(sg.a1);
    var large = (sg.a1 - sg.a0) > Math.PI ? 1 : 0;
    var d = "M" + cx + " " + cy + " L" + x0.toFixed(2) + " " + y0.toFixed(2) +
      " A" + R + " " + R + " 0 " + large + " 1 " + x1.toFixed(2) + " " + y1.toFixed(2) + " Z";
    return React.createElement("path", { key: i, d: d, fill: sg.color }, title);
  });
  kids.push(React.createElement("circle", { key: "hole", cx: cx, cy: cy, r: R * 0.52, fill: "#fff" }));
  kids.push(React.createElement("text", { key: "n", x: cx, y: cy + 1, fontSize: Math.round(sz * 0.15), fontWeight: 700, fill: "#555", textAnchor: "middle", dominantBaseline: "middle" }, tot + "件"));
  return React.createElement("svg", { viewBox: "0 0 " + sz + " " + sz, style: { width: sz, height: sz, display: "block" } }, kids);
}
// OS値帯の色凡例（横並びチップ）。
function _elOsBandLegendV2() {
  return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "2px 10px", alignItems: "center" } },
    _EL_OS_BANDS_V2.map(function(b) {
      return React.createElement("span", { key: b.key, style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, color: "#666", whiteSpace: "nowrap" } },
        React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: b.color, display: "inline-block", flexShrink: 0 } }),
        b.label);
    }));
}
// 「💡 読み取り」欄。items=文字列/ノードの配列（null/falseは除外）。空ならnull。
// opts.title=見出しに添える分析名・opts.note=末尾の薄字注記。
function _elInsightBoxV2(items, opts) {
  var list = (items || []).filter(function(x) { return !!x; });
  if (!list.length) return null;
  return React.createElement("div", { style: { background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 12px", margin: "8px 0" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#92400E", marginBottom: 4 } },
      "💡 読み取り" + (opts && opts.title ? "（" + opts.title + "）" : "")),
    React.createElement("ul", { style: { margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 } },
      list.map(function(t, i) { return React.createElement("li", { key: i, style: { fontSize: 11, color: "#78350F", lineHeight: 1.6 } }, t); })),
    (opts && opts.note) ? React.createElement("div", { style: { fontSize: 9, color: "#B45309", marginTop: 4, opacity: 0.8 } }, opts.note) : null);
}
// 読み取り用の強調スパン。
function _elInsightEmV2(text, color) {
  return React.createElement("b", { style: { color: color || "#92400E" } }, text);
}
// 記録群からα候補(0/5/10/15/20)を総当たりし、H1/H2結果損益の合計が最大になるαを返す。
// 戻り値 {h1:{a,sum}|null, h2:{a,sum}|null, n} / OS値入力なしはnull。同点は小さいα優先。
// 損益は取引・銘柄別記録テーブルと同一基準（H1=_elHold1TotParts・H2=_elHold2TotParts・損切り値=各記録の採用値）。
function _elBestAlphaV2(recs, data) {
  var rs = (recs || []).filter(function(r) { var s = r.signal; return s && s.osVal != null && s.osVal !== ""; });
  if (!rs.length) return null;
  var bestH1 = null, bestH2 = null;
  [0, 5, 10, 15, 20].forEach(function(a) {
    var s1 = 0, c1 = 0, s2 = 0, c2 = 0;
    rs.forEach(function(r) {
      var s = r.signal;
      var cut = _elAlphaInfo(r, data).cutLine;
      var t1 = _elHold1TotParts(s, a, cut); if (t1.main != null) { s1 += t1.main; c1++; }
      var t2 = _elHold2TotParts(s, a, cut); if (t2.main != null) { s2 += t2.main; c2++; }
    });
    if (c1 > 0 && (bestH1 == null || s1 > bestH1.sum)) bestH1 = { a: a, sum: s1 };
    if (c2 > 0 && (bestH2 == null || s2 > bestH2.sum)) bestH2 = { a: a, sum: s2 };
  });
  if (!bestH1 && !bestH2) return null;
  return { h1: bestH1, h2: bestH2, n: rs.length };
}
// 早見表見出し用「現時点の最良α値」バッジ。銘柄の全エントリー記録からライブ算出（記録が増減すれば自動で変わる）。
// H1とH2の最良αが同じなら1つ・違えば両方表示。記録なしはnull。
function _elBestAlphaBadgeV2(data, stock) {
  var recs = _elCollectAllSignals(data).filter(function(r) { return r.stock === stock && _elInclTotal(r.signal); });
  var b = _elBestAlphaV2(recs, data);
  if (!b) return null;
  var txt;
  if (b.h1 && b.h2 && b.h1.a === b.h2.a) txt = b.h1.a + "円";
  else txt = (b.h1 ? "H1 " + b.h1.a + "円" : "") + (b.h1 && b.h2 ? "・" : "") + (b.h2 ? "H2 " + b.h2.a + "円" : "");
  var _fy = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
  var tip = "全エントリー記録" + b.n + "件（OS値入力分）をα=0/5/10/15/20円（5刻み・参考）で再計算し、H1/H2結果損益の合計が最大になるα。損切り値は各記録の採用値・損益基準は取引/銘柄別記録と同一。" +
    (b.h1 ? "　H1最良: α" + b.h1.a + "円（" + _fy(b.h1.sum) + "）" : "") +
    (b.h2 ? "　H2最良: α" + b.h2.a + "円（" + _fy(b.h2.sum) + "）" : "");
  return React.createElement("span", { title: tip, style: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 10,
    background: "#E0F2FE", border: "1px solid #7DD3FC", fontSize: 10, fontWeight: 700, color: "#0369A1", whiteSpace: "nowrap", verticalAlign: "middle" } },
    "現時点の最良α値：" + txt,
    React.createElement("span", { style: { fontWeight: 400, fontSize: 9, color: "#0284C7" } }, "(" + b.n + "件)"));
}





// === EP位置・累積損益・αカーブ分析（記録帳・集計タブ 2026-06-13）===
// EP位置別の集計: ep0/ep1/ep2(=EP=OS1/2/3・E成立) / miss(E未達) / x(×見送り)。aiOf(r)={alpha,cutLine}。
function _elEpPosStatsV2(recs, aiOf) {
  var _mk = function() { return { cnt: 0, plan: 0, planCnt: 0, planArr: [], h1: 0, h1Cnt: 0, h1Arr: [], h2: 0, h2Cnt: 0, h2Arr: [], stop: 0, soft: 0, draw: 0, ok: 0, ng: 0, osv: [] }; };
  var c = { ep0: _mk(), ep1: _mk(), ep2: _mk(), miss: _mk(), x: _mk() }, n = 0;
  (recs || []).forEach(function(r) {
    var s = r.signal, ai = aiOf(r);
    var rr = _epResolve(s, ai.alpha);
    if (!rr) return;
    var key = rr.judge === "miss" ? "miss" : rr.judge === "x" ? "x" : "ep" + rr.epIdx;
    var o = c[key];
    if (!o) return;
    o.cnt++; n++;
    if (rr.judge !== "ok") return;
    if (rr.ep && rr.ep.h != null) o.osv.push(rr.ep.h);  // EP足の高値（OS中央値で集計）
    var res = _elDynResult(s, ai.alpha, ai.cutLine);  // 勝敗（EP損益の結果）
    if (res === "ok") o.ok++; else if (res === "ng") o.ng++; else if (res === "draw") o.draw++;
    var pv = _elDynPlanned(s, ai.alpha, ai.cutLine);
    if (pv != null) { o.plan += pv; o.planCnt++; o.planArr.push(pv); }
    var h1p = _elHold1TotParts(s, ai.alpha, ai.cutLine);
    if (h1p.main != null) { o.h1 += h1p.main; o.h1Cnt++; o.h1Arr.push(h1p.main); }
    var h2p = _elHold2TotParts(s, ai.alpha, ai.cutLine);
    if (h2p.main != null) { o.h2 += h2p.main; o.h2Cnt++; o.h2Arr.push(h2p.main); }
    var isStop = _elPlanIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop2(s, ai.alpha, ai.cutLine);
    if (isStop) o.stop++; else if (res === "ng") o.soft++;
  });
  c.n = n;
  return c;
}
var _EL_EPPOS_DEFS = [
  { k: "ep0", label: "EP=OS1（即到達）", color: "#0369A1" },
  { k: "ep1", label: "EP=OS2（1本待ち）", color: "#0EA5E9" },
  { k: "ep2", label: "EP=OS3（2本待ち）", color: "#7DD3FC" },
  { k: "x", label: "×見送り", color: "#86EFAC" },
  { k: "miss", label: "E未達", color: "#C4B5FD" }
];
// EP位置の積み上げバー＋EP位置別成績表＋読み取り。
function _elEpPosSectionV2(recs, aiOf) {
  if (!recs || !recs.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "v2記録なし");
  var st = _elEpPosStatsV2(recs, aiOf);
  if (!st.n) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "記録なし");
  var _pct = function(v) { return Math.round(v / st.n * 100); };
  var bar = React.createElement("div", { style: { display: "flex", width: "100%", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e0d6" } },
    _EL_EPPOS_DEFS.map(function(d) {
      var o = st[d.k];
      if (!o.cnt) return null;
      return React.createElement("div", { key: d.k, title: d.label + " " + o.cnt + "件", style: { width: (o.cnt / st.n * 100) + "%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden" } }, o.cnt + "件");
    }));
  var legend = React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 } },
    _EL_EPPOS_DEFS.map(function(d) {
      var o = st[d.k];
      return React.createElement("span", { key: d.k, style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "#666" } },
        React.createElement("span", { style: { width: 10, height: 10, borderRadius: 2, background: d.color, display: "inline-block" } }),
        d.label + "：" + o.cnt + "件" + (o.cnt ? "（" + _pct(o.cnt) + "%）" : ""));
    }));
  var _thE = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
  var _tdE = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  // 平均損益セル: 平均（大）＋合計（小・グレー）。傾向＝1件あたりの平均が主役。
  var _avgE = function(sum, cnt) {
    if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    var a = Math.round(sum / cnt);
    return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } },
      React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)),
      React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, "計" + (sum > 0 ? "+" : "") + Math.round(sum).toLocaleString()));
  };
  var _winE = function(o) {
    var t = o.ok + o.ng;
    if (!t) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    var w = Math.round(o.ok / t * 100);
    return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } },
      React.createElement("span", { style: { fontWeight: 700, color: w >= 50 ? "#1E8449" : "#B45309" } }, w + "%"),
      React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, o.ok + "勝" + o.ng + "敗"));
  };
  var _osE = function(o) { var m = _elMedian(o.osv); return m != null ? React.createElement("span", { style: { fontWeight: 700, color: _vcol(m, true) } }, m + "円") : React.createElement("span", { style: { color: "#ccc" } }, "—"); };
  var tbl = React.createElement("div", { style: { overflowX: "auto", marginTop: 8 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
        _thE("EP位置"), _thE("件数"), _thE("OS値"), _thE("E後の勝率"), _thE("EP損益"), _thE("H1損益"), _thE("H2損益"), _thE("見切り率"), _thE("損切り率"))),
      React.createElement("tbody", null, ["ep0", "ep1", "ep2"].map(function(k, i) {
        var d = _EL_EPPOS_DEFS[i], o = st[k];
        return React.createElement("tr", { key: k },
          _tdE(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
            React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: d.color, display: "inline-block" } }), d.label), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
          _tdE(o.cnt ? o.cnt + "件（" + _pct(o.cnt) + "%）" : "0件", { fontWeight: 700 }),
          _tdE(_elOsMMCell(o.osv)), _tdE(_elEwinCell(o.ok, o.ng, o.draw)),
          _tdE(_elPnlMMCell(o.planArr)), _tdE(_elPnlMMCell(o.h1Arr)), _tdE(_elPnlMMCell(o.h2Arr)),
          _tdE((o.ok + o.ng + o.draw) ? Math.round(o.soft / (o.ok + o.ng + o.draw) * 100) + "%" : "—", { color: o.soft ? "#B45309" : "#bbb", fontWeight: o.soft ? 700 : 400 }),
          _tdE((o.ok + o.ng + o.draw) ? Math.round(o.stop / (o.ok + o.ng + o.draw) * 100) + "%" : "—", { color: o.stop ? "#1E8449" : "#bbb", fontWeight: o.stop ? 700 : 400 }));
      }))));
  var ok = st.ep0.cnt + st.ep1.cnt + st.ep2.cnt;
  var items = [];
  if (ok) {
    items.push(React.createElement("span", null, "E成立", _elInsightEmV2(ok + "件"), "のうち、OS1即到達が", _elInsightEmV2(Math.round(st.ep0.cnt / ok * 100) + "%"), "・2本目以降の到達（待ってから成立）が", _elInsightEmV2(Math.round((st.ep1.cnt + st.ep2.cnt) / ok * 100) + "%"), "。"));
    var wEnt = (st.ep1.ok + st.ep1.ng) + (st.ep2.ok + st.ep2.ng), wStop = st.ep1.stop + st.ep2.stop, e0Ent = st.ep0.ok + st.ep0.ng;
    if (wEnt && e0Ent) {
      var r0 = Math.round(st.ep0.stop / e0Ent * 100), rw = Math.round(wStop / wEnt * 100);
      items.push(React.createElement("span", null, "損切り率は OS1成立=", _elInsightEmV2(r0 + "%"), "・OS2/3成立=", _elInsightEmV2(rw + "%"), rw > r0 ? "。遅い到達ほど損切りになりやすい傾向。" : "。待ってからの成立でも損切りは増えていない。"));
    }
    var hbest = null;
    ["ep0", "ep1", "ep2"].forEach(function(k, i) { var o = st[k]; if (o.h1Cnt && (hbest == null || o.h1 / o.h1Cnt > hbest.v)) hbest = { v: o.h1 / o.h1Cnt, i: i }; });
    if (hbest) items.push(React.createElement("span", null, "1件あたりのH1損益が最も良いのは", _elInsightEmV2(["EP=OS1", "EP=OS2", "EP=OS3"][hbest.i]), "（平均", _elInsightEmV2(Math.round(hbest.v).toLocaleString() + "円"), "）。"));
    // 勝率の傾向
    var wbest = null;
    ["ep0", "ep1", "ep2"].forEach(function(k, i) { var o = st[k]; var t = o.ok + o.ng; if (t && (wbest == null || o.ok / t > wbest.v)) wbest = { v: o.ok / t, i: i, t: t }; });
    if (wbest) items.push(React.createElement("span", null, "勝率が最も高いのは", _elInsightEmV2(["EP=OS1", "EP=OS2", "EP=OS3"][wbest.i]), "（", _elInsightEmV2(Math.round(wbest.v * 100) + "%"), "）。"));
    // OS中央値の傾向（EP位置が遅いほどOS値が深い＝待った分強い動き）
    var _osArr = ["ep0", "ep1", "ep2"].map(function(k) { return _elMedian(st[k].osv); });
    if (_osArr[0] != null && (_osArr[1] != null || _osArr[2] != null)) {
      var _late = _osArr[2] != null ? _osArr[2] : _osArr[1];
      items.push(React.createElement("span", null, "EP足のOS値（高値）中央値は OS1=", _elInsightEmV2(_osArr[0] + "円"), _late != null ? React.createElement("span", null, "・遅い到達=" + _late + "円") : null, _late != null && _late > _osArr[0] ? "＝待つほど高値が伸びている傾向。" : "。"));
    }
  }
  if (st.miss.cnt) items.push(React.createElement("span", null, "E未達は", _elInsightEmV2(st.miss.cnt + "件（" + _pct(st.miss.cnt) + "%）"), "＝ノートレードで損失ゼロ。"));
  if (st.x.cnt) items.push(React.createElement("span", null, "×見送り（宣言後の到達）は", _elInsightEmV2(st.x.cnt + "件"), "＝集計上ノートレード（損益に一切算入しない）。"));
  return React.createElement("div", null, bar, legend, tbl, items.length ? _elInsightBoxV2(items) : null);
}
// 時間帯別の成績（寄り付き重視）: 寄り足OSが出た時刻で分類し、件数/OS中央値/E到達率/E後の勝率/損切り率/平均EP・H1損益を集計。
// 「9:15まで/9:30までに出た寄り足OSがどの程度OSし、成功/損切りしているか」を読む。採用α基準・aiOf(r)→{alpha,cutLine}。
function _elTimeOfDaySectionV2(recs, aiOf) {
  if (!recs || !recs.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "v2記録なし");
  var _toMin = function(t) { if (!t) return null; var m = String(t).match(/(\d{1,2})\s*[:：]\s*(\d{1,2})/); return m ? (Number(m[1]) * 60 + Number(m[2])) : null; };
  var DEFS = [
    { k: "b1", label: "寄り〜9:15", color: "#1D9E75", lo: -1, hi: 555 },
    { k: "b2", label: "9:16〜9:30", color: "#378ADD", lo: 555, hi: 570 },
    { k: "b3", label: "9:31〜10:00", color: "#EF9F27", lo: 570, hi: 600 },
    { k: "b4", label: "10:01〜", color: "#D85A30", lo: 600, hi: 9999 }
  ];
  var mk = function() { return { cnt: 0, osv: [], reach: 0, ok: 0, ng: 0, draw: 0, stop: 0, soft: 0, plan: 0, planCnt: 0, planArr: [], h1: 0, h1Cnt: 0, h1Arr: [], miss: 0, x: 0 }; };
  var st = {}; DEFS.forEach(function(d) { st[d.k] = mk(); });
  var noTime = mk(), total = mk(), _hasNoTime = false;
  var _acc = function(o, s, a, c) {
    o.cnt++;
    if (s.osVal != null && s.osVal !== "") o.osv.push(Number(s.osVal));
    if (_epReachedAt(s, a)) o.reach++;
    if (_epIsXSkip(s, a)) { o.x++; return; }
    var res = _elDynResult(s, a, c);
    if (res === "ok") o.ok++; else if (res === "ng") o.ng++; else if (res === "miss") o.miss++; else if (res === "draw") o.draw++;
    if (res !== "miss") {  // 損切り率・見切り率・損益平均はE成立（エントリーできた）分のみを母数に＝未達・×見送りは除外 2026-06-20
      var isStop = _elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c));
      if (isStop) o.stop++; else if (res === "ng") o.soft++;
      var plan = _elDynPlanned(s, a, c); if (plan != null) { o.plan += plan; o.planCnt++; o.planArr.push(plan); }
      var h1t = _elHold1TotParts(s, a, c); if (h1t.main != null) { o.h1 += h1t.main; o.h1Cnt++; o.h1Arr.push(h1t.main); }
    }
  };
  recs.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), a = ai.alpha, c = ai.cutLine;
    var min = _toMin(s.time), bucket = null;
    if (min == null) { bucket = noTime; _hasNoTime = true; }
    else { for (var i = 0; i < DEFS.length; i++) { if (min > DEFS[i].lo && min <= DEFS[i].hi) { bucket = st[DEFS[i].k]; break; } } }
    if (!bucket) bucket = noTime;
    _acc(bucket, s, a, c); _acc(total, s, a, c);
  });
  var _pct = function(n, d) { return d ? Math.round(n / d * 100) : 0; };
  var _rateCell = function(n, d) { if (!d) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var p = Math.round(n / d * 100); return React.createElement("span", { style: { fontWeight: 700, color: p >= 50 ? "#1E8449" : "#B45309" } }, p + "%"); };
  var _avg = function(sum, cnt) {
    if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    var a = Math.round(sum / cnt);
    return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } },
      React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)),
      React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, "計" + (sum > 0 ? "+" : "") + Math.round(sum).toLocaleString()));
  };
  var _osCell = function(o) { var m = _elMedian(o.osv); return m != null ? React.createElement("span", { style: { fontWeight: 700, color: _vcol(m, true) } }, m + "円") : React.createElement("span", { style: { color: "#ccc" } }, "—"); };
  var _winCell = function(o) { var t = o.ok + o.ng; if (!t) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var w = Math.round(o.ok / t * 100); return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } }, React.createElement("span", { style: { fontWeight: 700, color: w >= 50 ? "#1E8449" : "#B45309" } }, w + "%"), React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, o.ok + "勝" + o.ng + "敗")); };
  var bar = React.createElement("div", { style: { display: "flex", width: "100%", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e0d6" } },
    DEFS.map(function(d) { var o = st[d.k]; if (!o.cnt) return null; return React.createElement("div", { key: d.k, title: d.label + " " + o.cnt + "件", style: { width: (o.cnt / (total.cnt || 1) * 100) + "%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden" } }, o.cnt + "件"); }));
  var _thT = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
  var _tdT = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var _mkRow = function(label, color, o, bold) {
    return React.createElement("tr", { key: label, style: bold ? { background: "#FBF7EF" } : null },
      _tdT(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, color ? React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: color, display: "inline-block" } }) : null, label), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _tdT(o.cnt ? o.cnt + "件（" + _pct(o.cnt, total.cnt) + "%）" : "0件", { fontWeight: 700 }),
      _tdT(_elOsMMCell(o.osv)),
      _tdT(_rateCell(o.reach, o.cnt)),
      _tdT(_elEwinCell(o.ok, o.ng, o.draw)),
      _tdT((o.ok + o.ng + o.draw) ? Math.round(o.soft / (o.ok + o.ng + o.draw) * 100) + "%" : "—", { color: o.soft ? "#B45309" : "#bbb", fontWeight: o.soft ? 700 : 400 }),
      _tdT((o.ok + o.ng + o.draw) ? Math.round(o.stop / (o.ok + o.ng + o.draw) * 100) + "%" : "—", { color: o.stop ? "#1E8449" : "#bbb", fontWeight: o.stop ? 700 : 400 }),
      _tdT(_elPnlMMCell(o.planArr)),
      _tdT(_elPnlMMCell(o.h1Arr)));
  };
  var bodyRows = DEFS.map(function(d) { return _mkRow(d.label, d.color, st[d.k], false); });
  if (_hasNoTime) bodyRows.push(_mkRow("時刻未記録", "#bbb", noTime, false));
  bodyRows.push(_mkRow("全体", null, total, true));
  var tbl = React.createElement("div", { style: { overflowX: "auto", marginTop: 8 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
        _thT("時間帯"), _thT("件数"), _thT("OS値"), _thT("E到達率"), _thT("E後の勝率"), _thT("見切り率"), _thT("損切り率"), _thT("EP損益"), _thT("H1損益"))),
      React.createElement("tbody", null, bodyRows)));
  var _cum = function(keys) { var o = mk(); keys.forEach(function(k) { var b = st[k]; for (var p in b) { if (b.hasOwnProperty(p)) { if (typeof b[p] === "number") o[p] += b[p]; else if (Array.isArray(b[p])) o[p] = o[p].concat(b[p]); } } }); return o; };
  var c915 = st.b1, c930 = _cum(["b1", "b2"]), late = _cum(["b3", "b4"]);
  var _line = function(label, o) {
    if (!o.cnt) return null;
    var avgOs = _elMedian(o.osv);
    var t = o.ok + o.ng, win = t ? Math.round(o.ok / t * 100) : null;
    return React.createElement("span", null, label, "は ", _elInsightEmV2(o.cnt + "件"),
      avgOs != null ? React.createElement("span", null, "・中央OS ", _elInsightEmV2(avgOs + "円")) : null,
      "・E到達率 ", _elInsightEmV2(Math.round(o.reach / o.cnt * 100) + "%"),
      "・損切り率 ", _elInsightEmV2(((o.ok + o.ng) ? Math.round(o.stop / (o.ok + o.ng) * 100) : 0) + "%"),
      win != null ? "（勝率 " + win + "%）" : null, "。");
  };
  var items = [];
  var l1 = _line("寄り〜9:15に出た寄り足OS", c915); if (l1) items.push(l1);
  var l2 = _line("寄り〜9:30（累計）", c930); if (l2) items.push(l2);
  if (c930.cnt && late.cnt) {
    var s930 = (c930.ok + c930.ng) ? Math.round(c930.stop / (c930.ok + c930.ng) * 100) : 0, sLate = (late.ok + late.ng) ? Math.round(late.stop / (late.ok + late.ng) * 100) : 0;
    items.push(React.createElement("span", null, "寄り〜9:30と9:31以降では、損切り率が ", _elInsightEmV2(s930 + "%"), " vs ", _elInsightEmV2(sLate + "%"), s930 < sLate ? "＝早い寄り足OSの方が損切りになりにくい傾向。" : s930 > sLate ? "＝早い寄り足OSの方が損切りになりやすい傾向。" : "＝差は小さい。"));
    var o930 = _elMedian(c930.osv), oLate = _elMedian(late.osv);
    if (o930 != null && oLate != null) items.push(React.createElement("span", null, "OS中央値は 〜9:30=", _elInsightEmV2(o930 + "円"), "・9:31以降=", _elInsightEmV2(oLate + "円"), o930 > oLate ? "＝早い時間ほどOSが深い（強い初動）。" : "。"));
  }
  return React.createElement("div", null, bar, tbl, items.length ? _elInsightBoxV2(items, { note: "OS値=寄り足の高値（水準線比）の中央値（主）と平均（副）を併記（OS値は右偏なので典型値は中央値）／E到達率=3本以内にα到達（×見送り含む）／E後の勝率=エントリー（E成立）後にEP損益が利益だった割合（敗率・未達率はE到達率の裏返しなので省略）／損切り率=想定orH1orH2で損切り発生。EP/H1損益はE成立（エントリーできた）分のみの平均＋合計。未達（α未到達）・×見送りは母数に含めない。採用α基準。" }) : null);
}
// シグナル別の成功度ランキング: 「損失が出なかった割合(損失なし率)」と勝率で並べ替え＝どのシグナルが成功しやすいか。
// 複数タグの記録は各タグに算入。損失=損切り or EP損益<0（未達/×見送りは取引なし=損失なし扱い）。採用α基準・aiOf(r)→{alpha,cutLine}。
function _elSignalSuccessTableV2(recs, aiOf) {
  if (!recs || !recs.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "v2記録なし");
  var by = {};
  recs.forEach(function(r) {
    var s = r.signal;
    var tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
    if (!tags.length) tags = ["(未設定)"];
    tags.forEach(function(tg) { (by[tg] = by[tg] || []).push(r); });
  });
  var rows = Object.keys(by).map(function(k) {
    var rs = by[k];
    var o = { label: stripCat(k), cnt: rs.length, noLoss: 0, win: 0, decided: 0, reach: 0, miss: 0, stop: 0, soft: 0, draw: 0, plan: 0, planCnt: 0, planArr: [], h1: 0, h1Cnt: 0, h1Arr: [] };
    rs.forEach(function(r) {
      var s = r.signal, ai = aiOf(r), a = ai.alpha, c = ai.cutLine;
      if (_epReachedAt(s, a)) o.reach++; else o.miss++;
      var xskip = _epIsXSkip(s, a);
      var rr = _epResolve(s, a);
      var entered = !!(rr && rr.judge === "ok");  // E成立（エントリーできた）＝損益平均の母数
      var isStop = !xskip && (_elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c)));
      if (isStop) o.stop++;
      var pp = entered ? _elDynPlanned(s, a, c) : null;
      var isLoss = !xskip && (isStop || (pp != null && pp < 0));
      if (!isLoss) o.noLoss++;
      if (pp != null) { o.plan += pp; o.planCnt++; o.planArr.push(pp); if (pp > 0) { o.win++; o.decided++; } else if (pp < 0) { o.decided++; if (!isStop) o.soft++; } else { o.draw++; } }
      if (entered) { var h1t = _elHold1TotParts(s, a, c); if (h1t.main != null) { o.h1 += h1t.main; o.h1Cnt++; o.h1Arr.push(h1t.main); } }
    });
    return o;
  });
  rows.sort(function(a, b) { var na = a.noLoss / a.cnt, nb = b.noLoss / b.cnt; if (nb !== na) return nb - na; var pa = a.planCnt ? a.plan / a.planCnt : -1e9, pb = b.planCnt ? b.plan / b.planCnt : -1e9; return pb - pa; });
  var _thS = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
  var _tdS = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var _rate = function(n, d, hi) { if (!d) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var p = Math.round(n / d * 100); return React.createElement("span", { style: { fontWeight: 700, color: p >= (hi || 50) ? "#1E8449" : "#B45309" } }, p + "%"); };
  var _avg = function(sum, cnt) { if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var a = Math.round(sum / cnt); return React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)); };
  var tbl = React.createElement("div", { style: { overflowX: "auto", marginTop: 4 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
        _thS("シグナル"), _thS("件数"), _thS("損失なし率"), _thS("E後の勝率"), _thS("E到達率"), _thS("見切り率"), _thS("損切り率"), _thS("EP損益"), _thS("H1損益"))),
      React.createElement("tbody", null, rows.map(function(o, i) {
        return React.createElement("tr", { key: i, style: (i === 0 && o.cnt >= 2) ? { background: "#F1F8E9" } : null },
          _tdS(o.label, { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412", whiteSpace: "normal" }),
          _tdS(o.cnt + "件", { fontWeight: 700 }),
          _tdS(_rate(o.noLoss, o.cnt, 70)),
          _tdS(_elEwinCell(o.win, o.decided - o.win, o.draw)),
          _tdS(_rate(o.reach, o.cnt)),
          _tdS((o.decided + o.draw) ? Math.round(o.soft / (o.decided + o.draw) * 100) + "%" : "—", { color: o.soft ? "#B45309" : "#bbb", fontWeight: o.soft ? 700 : 400 }),
          _tdS((o.decided + o.draw) ? Math.round(o.stop / (o.decided + o.draw) * 100) + "%" : "—", { color: o.stop ? "#1E8449" : "#bbb", fontWeight: o.stop ? 700 : 400 }),
          _tdS(_elPnlMMCell(o.planArr)), _tdS(_elPnlMMCell(o.h1Arr)));
      }))));
  var items = [], best = rows[0], worst = rows[rows.length - 1];
  if (best && best.cnt >= 2) items.push(React.createElement("span", null, "損失が出にくい（成功しやすい）のは", _elInsightEmV2(best.label), "（損失なし率 ", _elInsightEmV2(Math.round(best.noLoss / best.cnt * 100) + "%"), "・" + best.cnt + "件）。"));
  if (worst && worst !== best && worst.cnt >= 2 && worst.noLoss / worst.cnt < 0.5) items.push(React.createElement("span", null, "逆に", _elInsightEmV2(worst.label), "は損失なし率 ", _elInsightEmV2(Math.round(worst.noLoss / worst.cnt * 100) + "%"), "＝損失が出やすい傾向。"));
  var pbest = null; rows.forEach(function(o) { if (o.planCnt && (pbest == null || o.plan / o.planCnt > pbest.v)) pbest = { v: o.plan / o.planCnt, l: o.label }; });
  if (pbest) items.push(React.createElement("span", null, "1件あたり平均EP損益が最良は", _elInsightEmV2(pbest.l), "（", _elInsightEmV2(_elPnlFmt(Math.round(pbest.v))), "）。"));
  return React.createElement("div", null, tbl, items.length ? _elInsightBoxV2(items, { note: "損失なし率=損切りもEP損益マイナスも出なかった割合（未達/×見送り=取引なし=損失なし）／E後の勝率=エントリー（E成立）後にEP損益が利益だった割合／E到達率=3本以内α到達／見切り率=損切りにならず損失で撤退した割合。採用α基準。" }) : null);
}
// 期待度×（×見送り）の分析: ×宣言後にα到達したが取引を見送った記録について、もし取引していたらのEP/H1損益と、
// 見送り判断の精度（取引EPがマイナス=損失回避=正解／プラス=機会損失=逃した利益）をシグナル別に集計。
// aiOf=記録→{alpha,cutLine}。『取引していたら』は_epAsTradedの仮想エントリー＝各表の（）参考値と同基準。
function _elXSkipSectionV2(recs, aiOf) {
  var all = recs || [];
  var xs = all.filter(function(r) { return _epIsXSkip(r.signal, aiOf(r).alpha); });
  if (!xs.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "10px 0" } }, "×見送り（期待度×・宣言後にα到達）の記録はありません");
  var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
  var rows = xs.map(function(r) {
    var s = r.signal, ai = aiOf(r), tr = _epAsTraded(s);
    return { r: r, s: s, ep: _elDynPlanned(tr, ai.alpha, ai.cutLine), h1: _elDynHold(tr, ai.alpha, ai.cutLine) };
  });
  var sumEp = 0, epCnt = 0, sumH1 = 0, h1Cnt = 0, missCnt = 0, missSum = 0, avoidCnt = 0, avoidSum = 0;
  rows.forEach(function(o) {
    if (o.ep != null) { sumEp += o.ep; epCnt++; if (o.ep > 0) { missCnt++; missSum += o.ep; } else if (o.ep < 0) { avoidCnt++; avoidSum += o.ep; } }
    if (o.h1 != null) { sumH1 += o.h1; h1Cnt++; }
  });
  var decided = missCnt + avoidCnt;
  var accuracy = decided ? Math.round(avoidCnt / decided * 100) : null;
  var ratio = all.length ? Math.round(xs.length / all.length * 100) : 0;
  var _pnl = function(v) { return React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: 800 } }, _elPnlFmt(v)); };
  var _card = function(label, valNode, color, sub) {
    return React.createElement("div", { style: { flex: "1 1 116px", minWidth: 110, background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "8px 10px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 3 } }, label),
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: color || "#333", lineHeight: 1.15, whiteSpace: "nowrap" } }, valNode),
      sub ? React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 2 } }, sub) : null);
  };
  var cards = React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 } },
    _card("×見送り", xs.length + "件", "#9A3412", "全" + all.length + "件中 " + ratio + "%"),
    _card("取引していたらEP", _pnl(sumEp), null, epCnt + "件" + (h1Cnt ? "・H1なら " + _elPnlFmt(sumH1) : "")),
    _card("機会損失（逃した利益）", missCnt + "件", missCnt ? "#C0392B" : "#bbb", missSum ? "+" + missSum.toLocaleString() + "円" : "—"),
    _card("損失回避（避けた損失）", avoidCnt + "件", avoidCnt ? "#1E8449" : "#bbb", avoidSum ? avoidSum.toLocaleString() + "円" : "—"),
    _card("見送り正解率", accuracy != null ? accuracy + "%" : "—", accuracy != null ? (accuracy >= 50 ? "#1E8449" : "#B45309") : "#bbb", "損失回避 / " + decided + "件中"));
  var by = {};
  rows.forEach(function(o) {
    var s = o.s;
    var tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
    if (!tags.length) tags = ["(未設定)"];
    tags.forEach(function(tg) { var k = stripCat(tg); (by[k] = by[k] || []).push(o); });
  });
  var bk = Object.keys(by).map(function(k) {
    var arr = by[k], se = 0, ec = 0, mc = 0, ac = 0;
    arr.forEach(function(o) { if (o.ep != null) { se += o.ep; ec++; if (o.ep > 0) mc++; else if (o.ep < 0) ac++; } });
    return { label: k, cnt: arr.length, sumEp: se, epCnt: ec, miss: mc, avoid: ac };
  });
  bk.sort(function(a, b) { return b.miss - a.miss || a.sumEp - b.sumEp; });
  var _thX = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
  var _tdX = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var tbl = React.createElement("div", { style: { overflowX: "auto", marginTop: 2 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
        _thX("シグナル"), _thX("×件数"), _thX("取引EP合計"), _thX("機会損失"), _thX("損失回避"), _thX("正解率"))),
      React.createElement("tbody", null, bk.map(function(o, i) {
        var acc = (o.miss + o.avoid) ? Math.round(o.avoid / (o.miss + o.avoid) * 100) : null;
        return React.createElement("tr", { key: i },
          _tdX(o.label, { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412", whiteSpace: "normal" }),
          _tdX(o.cnt + "件", { fontWeight: 700 }),
          _tdX(o.epCnt ? _pnl(o.sumEp) : _dash),
          _tdX(o.miss ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, o.miss + "件") : React.createElement("span", { style: { color: "#bbb" } }, "0")),
          _tdX(o.avoid ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, o.avoid + "件") : React.createElement("span", { style: { color: "#bbb" } }, "0")),
          _tdX(acc != null ? React.createElement("span", { style: { fontWeight: 700, color: acc >= 50 ? "#1E8449" : "#B45309" } }, acc + "%") : _dash));
      }))));
  var items = [];
  items.push(React.createElement("span", null, "×見送りは", _elInsightEmV2(xs.length + "件"), "（全" + all.length + "件中 " + ratio + "%）＝", _elInsightEmV2("損失回避 " + avoidCnt + "件"), "・", _elInsightEmV2("機会損失 " + missCnt + "件"), "。"));
  if (sumEp > 0) items.push(React.createElement("span", null, "見送った記録を全て取引していたらEP損益は", _elInsightEmV2(_elPnlFmt(sumEp), "#C0392B"), "＝トータルでは", _elInsightEmV2("取引した方が得だった"), "（機会損失が損失回避を上回る）。"));
  else if (sumEp < 0) items.push(React.createElement("span", null, "見送りにより合計", _elInsightEmV2(_elPnlFmt(sumEp), "#1E8449"), "の損失を回避できている（見送り判断はトータルでプラスに機能）。"));
  else items.push(React.createElement("span", null, "見送り分のEP損益合計は±0。"));
  if (accuracy != null) items.push(React.createElement("span", null, "見送り正解率（取引していたら損失だった＝回避できた割合）は", _elInsightEmV2(accuracy + "%"), "。", accuracy >= 60 ? "見送り判断の精度は高め。" : accuracy < 40 ? "利益を逃すケースが多め＝見送り基準の見直し余地あり。" : "おおむね半々。"));
  var wsig = bk.filter(function(o) { return o.miss > o.avoid && o.miss >= 2; })[0];
  if (wsig) items.push(React.createElement("span", null, _elInsightEmV2(wsig.label), "は機会損失", _elInsightEmV2(wsig.miss + "件"), "＞損失回避" + wsig.avoid + "件＝", _elInsightEmV2("見送らず取引した方が良い"), "傾向。"));
  return React.createElement("div", null, cards, tbl, _elInsightBoxV2(items, { note: "×見送り＝×宣言後にαへ到達した記録（取引せず・合計には一切算入しない）。『取引していたら』は×を無視した仮想エントリーのEP/H1損益（_epAsTradedベース・100株換算・採用α基準）。機会損失＝取引EPがプラス（取引すべきだった）／損失回避＝取引EPがマイナス（見送って正解）。" }));
}
// △ホールド分析（2026-06-16）: 期待度△のH1/H2ホールド記録について、本算入していたら（=△足の実損益）と
// 1段下フォールバック（H1△→EP損益・H2△→H1損益）の差＝（）内への参考寄与を集計し、△で保有/算入した判断の精度を見る。
// delta>0=保有が活きた（伸ばせた）／delta<0=裏目（1段下で手仕舞いが正解）。×見送り分析(_elXSkipSectionV2)の△版。aiOf(r)→{alpha,cutLine}。
function _elTriangleHoldSectionV2(recs, aiOf) {
  var all = recs || [];
  var rows = [];
  all.forEach(function(r) {
    var s = r.signal, ai = aiOf(r);
    if (_epIsXSkip(s, ai.alpha) || _elH2Miss(s, ai.alpha)) return;
    if (s.holdExp === "△") {
      var own1 = _elDynHold(s, ai.alpha, ai.cutLine);
      if (ai.alpha != null && _elPlanIsStop(s, ai.alpha, ai.cutLine)) { var pv1 = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pv1 != null) own1 = pv1; }
      var base1 = _elDynPlanned(s, ai.alpha, ai.cutLine);
      if (own1 != null && base1 != null) rows.push({ s: s, leg: "H1", own: own1, base: base1, delta: own1 - base1 });
    }
    var _h1Exited = (s.holdExp === "×" || s.holdExp === "損切り済" || !s.holdExp);
    if (s.hold2Exp === "△" && !_h1Exited && _elHas2Data(s, ai.alpha)) {
      var own2 = (ai.alpha != null && _elHoldIsStop(s, ai.alpha, ai.cutLine))
        ? (_elPlanIsStop(s, ai.alpha, ai.cutLine) ? _elDynPlanned(s, ai.alpha, ai.cutLine) : _elDynHold(s, ai.alpha, ai.cutLine))
        : _elDynHold2(s, ai.alpha, ai.cutLine);
      var base2 = _elH1HeldBase(s, ai.alpha, ai.cutLine);
      if (own2 != null && base2 != null) rows.push({ s: s, leg: "H2", own: own2, base: base2, delta: own2 - base2 });
    }
  });
  if (!rows.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "10px 0" } }, "期待度△のホールド記録はありません");
  var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
  var sumDelta = 0, win = 0, lose = 0, h1c = 0, h2c = 0;
  rows.forEach(function(o) { sumDelta += o.delta; if (o.delta > 0) win++; else if (o.delta < 0) lose++; if (o.leg === "H1") h1c++; else h2c++; });
  var decided = win + lose;
  var accuracy = decided ? Math.round(win / decided * 100) : null;
  var _pnl = function(v) { return React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: 800 } }, _elPnlFmt(v)); };
  var _card = function(label, valNode, color, sub) {
    return React.createElement("div", { style: { flex: "1 1 116px", minWidth: 110, background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "8px 10px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 3 } }, label),
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: color || "#333", lineHeight: 1.15, whiteSpace: "nowrap" } }, valNode),
      sub ? React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 2 } }, sub) : null);
  };
  var cards = React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 } },
    _card("△ホールド", rows.length + "件", "#B45309", "H1 " + h1c + "件・H2 " + h2c + "件"),
    _card("本算入時の寄与", _pnl(sumDelta), null, "（）外へ算入した場合の増減"),
    _card("活きた（伸長）", win + "件", win ? "#C0392B" : "#bbb", "保有で1段下より改善"),
    _card("裏目（縮小/逆行）", lose + "件", lose ? "#1E8449" : "#bbb", "1段下で手仕舞いが正解"),
    _card("△保有正解率", accuracy != null ? accuracy + "%" : "—", accuracy != null ? (accuracy >= 50 ? "#C0392B" : "#B45309") : "#bbb", "活きた / " + decided + "件中"));
  var by = {};
  rows.forEach(function(o) {
    var s = o.s;
    var tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
    if (!tags.length) tags = ["(未設定)"];
    tags.forEach(function(tg) { var k = stripCat(tg); (by[k] = by[k] || []).push(o); });
  });
  var bk = Object.keys(by).map(function(k) {
    var arr = by[k], sd = 0, w = 0, l = 0;
    arr.forEach(function(o) { sd += o.delta; if (o.delta > 0) w++; else if (o.delta < 0) l++; });
    return { label: k, cnt: arr.length, sumDelta: sd, win: w, lose: l };
  });
  bk.sort(function(a, b) { return b.cnt - a.cnt || b.sumDelta - a.sumDelta; });
  var _thX = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
  var _tdX = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var tbl = React.createElement("div", { style: { overflowX: "auto", marginTop: 2 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
        _thX("シグナル"), _thX("△件数"), _thX("本算入寄与"), _thX("活きた"), _thX("裏目"), _thX("正解率"))),
      React.createElement("tbody", null, bk.map(function(o, i) {
        var acc = (o.win + o.lose) ? Math.round(o.win / (o.win + o.lose) * 100) : null;
        return React.createElement("tr", { key: i },
          _tdX(o.label, { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412", whiteSpace: "normal" }),
          _tdX(o.cnt + "件", { fontWeight: 700 }),
          _tdX(_pnl(o.sumDelta)),
          _tdX(o.win ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, o.win + "件") : React.createElement("span", { style: { color: "#bbb" } }, "0")),
          _tdX(o.lose ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, o.lose + "件") : React.createElement("span", { style: { color: "#bbb" } }, "0")),
          _tdX(acc != null ? React.createElement("span", { style: { fontWeight: 700, color: acc >= 50 ? "#C0392B" : "#B45309" } }, acc + "%") : _dash));
      }))));
  var items = [];
  items.push(React.createElement("span", null, "△ホールドは", _elInsightEmV2(rows.length + "件"), "（H1 " + h1c + "・H2 " + h2c + "）。本算入(（）外算入)していたら合計は", _elInsightEmV2((sumDelta > 0 ? "+" : "") + _elPnlFmt(sumDelta), sumDelta > 0 ? "#C0392B" : "#1E8449"), "の増減。"));
  if (sumDelta > 0) items.push(React.createElement("span", null, "トータルでは", _elInsightEmV2("△でも保有を伸ばした方が得"), "だった（△ホールドが1段下を上回る）＝○寄りに見直す余地。"));
  else if (sumDelta < 0) items.push(React.createElement("span", null, "トータルでは", _elInsightEmV2("1段下で手仕舞いした方が良かった"), "（△ホールドは伸びず）。△保有は控えめが妥当。"));
  else items.push(React.createElement("span", null, "△ホールドの寄与は±0。"));
  if (accuracy != null) items.push(React.createElement("span", null, "△保有正解率（保有が1段下より良かった割合）は", _elInsightEmV2(accuracy + "%"), "。", accuracy >= 60 ? "△保有の判断は概ね良好。" : accuracy < 40 ? "△では伸ばさず手仕舞いが無難。" : "おおむね半々。"));
  return React.createElement("div", null, cards, tbl, _elInsightBoxV2(items, { note: "△ホールド＝期待度△で保有したH1/H2記録。新システムでは△は（）内（参考）に算入し本合計（）外には1段下（H1△→EP損益・H2△→H1損益）を算入。『本算入時の寄与』＝△足の実損益−1段下＝△を（）外に本算入した場合の増減（＝（）内参考差分の合計）。活きた＝保有で改善(delta>0)／裏目＝1段下が正解(delta<0)。採用α基準・E成立分のみ。" }));
}
// 汎用SVG折れ線チャート。series=[{label,color,pts:[number]}]（全系列同じ点数）。opts={height,xTicks:[{i,label}]}。
function _elLineChartV2(series, opts) {
  opts = opts || {};
  var sers = (series || []).filter(function(sr) { return sr && sr.pts && sr.pts.length; });
  if (!sers.length) return null;
  var n = 0;
  sers.forEach(function(sr) { if (sr.pts.length > n) n = sr.pts.length; });
  if (n < 2) return null;
  var W = 680, H = opts.height || 190, padL = 56, padR = 14, padT = 10, padB = 20;
  var yMin = 0, yMax = 0;
  sers.forEach(function(sr) { sr.pts.forEach(function(v) { if (v < yMin) yMin = v; if (v > yMax) yMax = v; }); });
  if (yMin === yMax) yMax = yMin + 100;
  // Y軸を「切りのいい数字」に揃える: 生のspanからniceなstep(1/2/2.5/5×10^k)を選び、yMin↓/yMax↑をstep倍数へ丸める。
  // ドメイン(yMin/yMax)・グリッド・ラベルが同じstep基準を共有するので目盛りが 0/20,000/40,000… の丸い値になる（2026-06-17）。
  var _niceStep = function(raw) {
    if (!(raw > 0)) return 1;
    var pw = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var f = raw / pw;
    var nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return nf * pw;
  };
  var _tt = opts.targetTicks || 5;  // 目盛り目標本数（多いほど縦軸が細かい。累積損益グラフは10＝約1万円おき）
  var _step = _niceStep((yMax - yMin) / _tt);
  if (!(_step > 0)) _step = 1;
  yMin = Math.floor(yMin / _step) * _step;
  yMax = Math.ceil(yMax / _step) * _step;
  if (yMax <= yMin) yMax = yMin + _step;
  var xAt = function(i) { return padL + (W - padL - padR) * i / (n - 1); };
  var yAt = function(v) { return padT + (H - padT - padB) * (1 - (v - yMin) / (yMax - yMin)); };
  var kids = [];
  var _gi = 0;
  for (var gv = yMin; gv <= yMax + _step * 1e-6 && _gi < 100; gv += _step, _gi++) {
    var gy = yAt(gv);
    kids.push(React.createElement("line", { key: "g" + _gi, x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eee9e0", strokeWidth: 1 }));
    kids.push(React.createElement("text", { key: "gl" + _gi, x: padL - 4, y: gy + 3, textAnchor: "end", fontSize: 9, fill: "#999" }, Math.round(gv).toLocaleString()));
  }
  if (yMin < 0 && yMax > 0) kids.push(React.createElement("line", { key: "zero", x1: padL, y1: yAt(0), x2: W - padR, y2: yAt(0), stroke: "#cbb89a", strokeWidth: 1.2 }));
  (opts.xTicks || []).forEach(function(tk, ti) {
    kids.push(React.createElement("line", { key: "xtl" + ti, x1: xAt(tk.i), y1: padT, x2: xAt(tk.i), y2: H - padB, stroke: "#f3efe7", strokeWidth: 1 }));
    kids.push(React.createElement("text", { key: "xt" + ti, x: xAt(tk.i), y: H - 6, textAnchor: "middle", fontSize: 9, fill: "#999" }, tk.label));
  });
  sers.forEach(function(sr, si) {
    var ptsStr = sr.pts.map(function(v, i) { return xAt(i) + "," + yAt(v); }).join(" ");
    kids.push(React.createElement("polyline", { key: "pl" + si, points: ptsStr, fill: "none", stroke: sr.color, strokeWidth: 2, strokeLinejoin: "round" }));
    kids.push(React.createElement("circle", { key: "lc" + si, cx: xAt(sr.pts.length - 1), cy: yAt(sr.pts[sr.pts.length - 1]), r: 3, fill: sr.color }));
  });
  // ホバー（カーソル/タッチ）でその日の各系列の値をツールチップ表示。opts.hoverIdx / opts.onHover / opts.xLabels[i]（2026-06-17）。
  var _hi = opts.hoverIdx;
  if (_hi != null && _hi >= 0 && _hi < n) {
    var _hx = xAt(_hi);
    kids.push(React.createElement("line", { key: "cross", x1: _hx, y1: padT, x2: _hx, y2: H - padB, stroke: "#bbb", strokeWidth: 1, strokeDasharray: "3 2" }));
    sers.forEach(function(sr, si) {
      if (sr.pts[_hi] == null) return;
      kids.push(React.createElement("circle", { key: "hd" + si, cx: _hx, cy: yAt(sr.pts[_hi]), r: 3.5, fill: "#fff", stroke: sr.color, strokeWidth: 2 }));
    });
    var _tw = 128, _lh = 14, _th = _lh * (sers.length + 1) + 8;
    var _tx = (_hi > (n - 1) / 2) ? (_hx - _tw - 8) : (_hx + 8);
    if (_tx < padL) _tx = padL;
    if (_tx + _tw > W - 2) _tx = W - 2 - _tw;
    var _tyB = padT + 2;
    var _ttk = [ React.createElement("rect", { key: "bg", x: _tx, y: _tyB, width: _tw, height: _th, rx: 4, fill: "#fff", stroke: "#ddd", strokeWidth: 1, opacity: 0.97 }) ];
    var _dl = (opts.xLabels && opts.xLabels[_hi]) ? opts.xLabels[_hi] : "";
    _ttk.push(React.createElement("text", { key: "dt", x: _tx + 7, y: _tyB + 12, fontSize: 9, fontWeight: 700, fill: "#555" }, _dl));
    sers.forEach(function(sr, si) {
      var v = sr.pts[_hi]; if (v == null) v = 0;
      var _ly = _tyB + 12 + _lh * (si + 1);
      _ttk.push(React.createElement("rect", { key: "sw" + si, x: _tx + 7, y: _ly - 7, width: 8, height: 8, rx: 1, fill: sr.color }));
      _ttk.push(React.createElement("text", { key: "tl" + si, x: _tx + 18, y: _ly, fontSize: 9, fill: "#444" }, sr.label));
      _ttk.push(React.createElement("text", { key: "tv" + si, x: _tx + _tw - 6, y: _ly, fontSize: 9, textAnchor: "end", fontWeight: 700, fill: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" }, (v > 0 ? "+" : "") + Math.round(v).toLocaleString() + "円"));
    });
    kids.push(React.createElement("g", { key: "tt", style: { pointerEvents: "none" } }, _ttk));
  }
  if (opts.onHover) {
    var _hov = function(e) {
      try {
        var _t = (e.touches && e.touches[0]) ? e.touches[0] : e;
        var _box = e.currentTarget.getBoundingClientRect();
        if (!_box.width) return;
        var _r = (_t.clientX - _box.left) / _box.width;
        var _idx = Math.round(_r * (n - 1));
        if (_idx < 0) _idx = 0;
        if (_idx > n - 1) _idx = n - 1;
        opts.onHover(_idx);
      } catch (_e) {}
    };
    kids.push(React.createElement("rect", { key: "ovl", x: padL, y: padT, width: (W - padL - padR), height: (H - padT - padB), fill: "transparent", style: { pointerEvents: "all", cursor: "crosshair" },
      onMouseMove: _hov, onMouseLeave: function() { opts.onHover(null); }, onTouchStart: _hov, onTouchMove: _hov }));
  }
  var legend = React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 2 } },
    sers.map(function(sr, si) {
      var lv = sr.pts[sr.pts.length - 1];
      return React.createElement("span", { key: si, style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#666" } },
        React.createElement("span", { style: { width: 14, height: 3, background: sr.color, display: "inline-block", borderRadius: 2 } }),
        sr.label + "：",
        React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(lv) } }, _elPnlFmt(lv)));
    }));
  return React.createElement("div", null,
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("svg", { viewBox: "0 0 " + W + " " + H, style: { width: "100%", minWidth: 480, height: "auto", display: "block" } }, kids)),
    legend);
}
// 累積損益（記録順）: EP損益/H1/H2/実現の累積線。寄与は合計行と同一基準（H1=_elHold1TotParts.main・H2=_elHold2TotParts.main）。
function _elCumPnlSectionV2(props) {
  var recs = props.recs, aiOf = props.aiOf;
  var _hs = useState(null), hoverIdx = _hs[0], setHoverIdx = _hs[1];
  var _dsS = useState(""), startDate = _dsS[0], setStartDate = _dsS[1];  // 起算日（""=最初から）
  if (!recs || recs.length < 2) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "記録が2件以上で表示されます");
  var sorted = recs.slice().sort(function(a, b) { return ((a.date || "") + (a.signal.time || "")).localeCompare((b.date || "") + (b.signal.time || "")); });
  var _dates = [], _seen = {};
  sorted.forEach(function(r) { if (r.date && !_seen[r.date]) { _seen[r.date] = 1; _dates.push(r.date); } });
  var _optNodes = [ React.createElement("option", { key: "_all", value: "" }, "最初から") ].concat(_dates.map(function(d) { return React.createElement("option", { key: d, value: d }, d); }));
  var sel = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, color: "#666", flexWrap: "wrap" } },
    React.createElement("span", null, "起算日:"),
    React.createElement("select", { value: startDate, onChange: function(e) { setStartDate(e.target.value); setHoverIdx(null); }, style: { fontSize: 11, padding: "2px 6px", border: "1px solid #ddd", borderRadius: 5, background: "#fff" } }, _optNodes),
    startDate ? React.createElement("button", { onClick: function() { setStartDate(""); setHoverIdx(null); }, style: { fontSize: 10, color: "#888", background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "2px 8px", cursor: "pointer" } }, "リセット") : null);
  var _filtered = startDate ? sorted.filter(function(r) { return (r.date || "") >= startDate; }) : sorted;
  if (_filtered.length < 2) return React.createElement("div", null, sel, React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "この起算日以降の記録が2件未満です"));
  var cp = 0, c1 = 0, c2 = 0, cr = 0;
  var pPlan = [], pH1 = [], pH2 = [], pReal = [], xTicks = [], xLabels = [], lastDate = null;
  _filtered.forEach(function(r, i) {
    var s = r.signal, ai = aiOf(r);
    // EP-OS△（△の確信度でエントリー）はEP損益（）外に算入しない＝期間別合計表/KPIのEP合計と一致させる。2026-06-20
    var pv = _epIsTriEntry(s, ai.alpha) ? null : _elDynPlanned(s, ai.alpha, ai.cutLine);
    if (pv != null) cp += pv;
    var h1p = _elHold1TotParts(s, ai.alpha, ai.cutLine);
    if (h1p.main != null) c1 += h1p.main;
    var h2p = _elHold2TotParts(s, ai.alpha, ai.cutLine);
    if (h2p.main != null) c2 += h2p.main;
    var rv = _elIsEntered(s, r.item) ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null;
    if (rv != null) cr += rv;
    pPlan.push(cp); pH1.push(c1); pH2.push(c2); pReal.push(cr);
    xLabels.push((r.date || "") + (s.time ? (" " + s.time) : ""));
    if (r.date !== lastDate) { xTicks.push({ i: i, label: (r.date || "").slice(5) }); lastDate = r.date; }
  });
  var _stp = Math.max(1, Math.ceil(xTicks.length / 6));
  xTicks = xTicks.filter(function(_x, ti) { return ti % _stp === 0; });
  var chart = _elLineChartV2([
    { label: "EP損益", color: "#0369A1", pts: pPlan },
    { label: "H1", color: "#DC2626", pts: pH1 },
    { label: "H2", color: "#D97706", pts: pH2 },
    { label: "実現損益", color: "#7C3AED", pts: pReal }
  ], { height: 300, targetTicks: 10, xTicks: xTicks, xLabels: xLabels, hoverIdx: hoverIdx, onHover: function(idx) { setHoverIdx(idx); } });
  return React.createElement("div", null, sel, chart);
}
// α感応度カーブ: α=0〜20円の各値で全記録を再計算した合計（EP損益・H1=想定額キャップ後・H2）。読み取りにH1/H2最大α。
function _elAlphaCurveSectionV2(recs, aiOf) {
  if (!recs || !recs.length) return null;
  var pPlan = [], pH1 = [], pH2 = [], xTicks = [];
  for (var a = 0; a <= 20; a++) {
    var t = _elTotAccum(recs, {
      signal: function(r) { return r.signal; },
      alpha: (function(_a) { return function() { return _a; }; })(a),
      cut: function(r) { return aiOf(r).cutLine; }
    });
    pPlan.push(t.plan || 0); pH1.push(t.holdPlanCap || 0); pH2.push(t.hold2 || 0);
    if (a % 5 === 0) xTicks.push({ i: a, label: "α" + a + "円" });
  }
  var b1 = 0, b2 = 0;
  pH1.forEach(function(v, i) { if (v > pH1[b1]) b1 = i; });
  pH2.forEach(function(v, i) { if (v > pH2[b2]) b2 = i; });
  var chart = _elLineChartV2([
    { label: "EP損益", color: "#0369A1", pts: pPlan },
    { label: "H1", color: "#DC2626", pts: pH1 },
    { label: "H2", color: "#D97706", pts: pH2 }
  ], { xTicks: xTicks, height: 200 });
  return React.createElement("div", null, chart,
    _elInsightBoxV2([
      React.createElement("span", null, "H1合計が最大になるのは", _elInsightEmV2("α=" + b1 + "円"), "（", _elInsightEmV2(_elPnlFmt(pH1[b1])), "）。"),
      React.createElement("span", null, "H2合計が最大になるのは", _elInsightEmV2("α=" + b2 + "円"), "（", _elInsightEmV2(_elPnlFmt(pH2[b2])), "）。")
    ], { note: "損切り値は各記録の採用値・H1は想定損切り時キャップ後の合計" }));
}

// ===== 推奨基本α値【条件再設計 2026-06-22／ユーザー方針】=====
// 銘柄ごと、その期間の全トレードに同じα(5〜20円)を当ててシミュレーションしたとき、①損切りにならない ②H1で利益が出ている を重視して選ぶ。
// 選定【2026-06-22c】: 件数フロア（最大scN×_EL_BASE_MIN_FRAC・最低_EL_BASE_MIN_N件）かつ 到達率≥_EL_BASE_MIN_ERATE のαの中で、合成スコア = _EL_BASE_W_STOP×(1−損切り率) + _EL_BASE_W_H1×H1勝率 が最大。
//       高αは到達率が下がり標本が薄い「いいとこ取り(選抜バイアス)」でスコアが上振れるため、件数＋到達率フロアで除外する。同点は件数の多い方→低α。フロア皆無なら件数最大のαを参考(status="na")。
// 損切り率=EP〜H1で損切りした割合(H2は含めない)・H1勝率=H1損益>0の割合。いずれも「OS1〜2でEP到達し、H1結果が判定できる記録」だけが母数。
// 追加α(_elAddAlphaReco)は基本αへの上乗せを実データ総当たりで評価＝補助。詳細は各関数のコメント。[[project_scalping_analysis_design]]
// 推奨基本αの探索範囲（5〜20円・1円刻み）。0〜4円は推奨しない（ユーザー方針 2026-06-21）。内部の理想α計算(_EL_IDEAL_ALPHAS=0〜50)とは別＝基本αは現実的に5〜20で設定する前提。
var _EL_BASE_ALPHAS = (function() { var _a = []; for (var _i = 5; _i <= 20; _i++) _a.push(_i); return _a; })();
// 日付→期間バケットキー（month=YYYY-MM / week=その週の月曜YYYY-MM-DD / 他=all）。週ロジックは期間タブと共通。
function _elBucketKey(date, gran) {
  if (gran === "month") return date.slice(0, 7);
  if (gran === "week") {
    var d = new Date(date + "T00:00:00");
    var mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return mon.getFullYear() + "-" + ("0" + (mon.getMonth() + 1)).slice(-2) + "-" + ("0" + mon.getDate()).slice(-2);
  }
  return "all";
}
// 期間バケットキー→表示ラベル。
function _elBucketLabel(key, gran) {
  if (gran === "month") return key.replace("-", "/");
  if (gran === "week") {
    var mon = new Date(key + "T00:00:00");
    var fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    return (mon.getMonth() + 1) + "/" + mon.getDate() + "〜" + (fri.getMonth() + 1) + "/" + fri.getDate();
  }
  return "全期間";
}
// 推奨基本αの選定パラメータ【再設計 2026-06-22】。後で調整可。
var _EL_BASE_MIN_N = 3;          // 最低エントリー件数（H1結果が判定できる記録数 scN）の絶対下限。未満のαは推奨対象外＝薄い標本の偶然採用を防ぐ。
var _EL_BASE_MIN_FRAC = 0.5;     // 件数フロア（実データ連動）: 最も件数(scN)の多いαの何割以上を要求するか。高αの薄い標本(選抜バイアスでスコア上振れ)を除外 2026-06-22b。後で調整可。
var _EL_BASE_MIN_ERATE = 0.5;    // 到達率フロア: EP到達率(OS2まで)がこの値未満のαは推奨対象外＝約定しにくい高αを除外（ユーザー方針 2026-06-22c）。後で調整可。
var _EL_BASE_W_STOP = 0.7;       // 合成スコアの重み: 損切り回避 (1−損切り率)。
var _EL_BASE_W_H1 = 0.3;         // 合成スコアの重み: H1勝率。
var _EL_BASE_SCORE_EPS = 0.03;   // スコアの僅差判定。最大スコアからこの幅以内は同点扱い→件数(到達率)の多い方を優先。
var _EL_BASE_ADD_MAX = 30;       // 追加αの探索上限（基本α+1〜+30円・合計は最大50円）。
// 指定αを全recに一律適用したシミュレーション集計。
// 対象=「OS1またはOS2でEP到達した記録」だけ（OS3でしか到達しない記録は基本α上は未到達扱い）。entered=対象件数・eRate=entered/n=OS2までのEP到達率。
// 【新スコア用 2026-06-22】scN=対象のうちH1までの結果が判定できる記録数（=母数）。stopH1N=EP足orH1足で損切り。h1WinN=損切りでなくH1損益>0。
//   stopRate=stopH1N/scN（損切り率・H1まで）・h1win=h1WinN/scN（H1勝率）・score=_EL_BASE_W_STOP×(1−stopRate)+_EL_BASE_W_H1×h1win。
// 参考: pnl(ΣH1保有損益)/epPnl(ΣEP)/stopN(H2まで含む損切り件数)/epStopN/E後勝率(wOk/decided=ewin)。
function _elBaseAlphaEval(recs, aiOf, a) {
  var pnl = 0, epPnl = 0, stopN = 0, epStopN = 0, n = 0, entered = 0, hasPnl = false, hasEp = false, wOk = 0, wNg = 0, wDr = 0;
  var scN = 0, stopH1N = 0, h1WinN = 0;
  (recs || []).forEach(function(r) {
    var s = r.signal; if (!s) return;
    var c = aiOf(r).cutLine;
    n++;
    var rr = _epResolve(s, a);
    var within2 = !!(rr && rr.epIdx >= 0 && rr.epIdx <= 1);   // OS1またはOS2でEP到達（=「OS2まで」）
    if (!within2) return;   // OS2までにEP未到達は集計対象外（基本α上は未到達扱い）
    entered++;
    var epStop = _elPlanIsStop(s, a, c);   // 入りの足（EP足）での損切り
    var h1Stop = _elHoldIsStop(s, a, c);   // H1足での損切り
    var hd = _elDynHold(s, a, c);          // H1保有（=次足）損益・損切りルール適用後
    var pl = _elDynPlanned(s, a, c);       // EP損益
    if (pl != null) { epPnl += pl; hasEp = true; }
    if (hd != null) { pnl += hd; hasPnl = true; }
    if (epStop) epStopN++;
    var res = _elDynResult(s, a, c);          // E後勝率の母数=実トレード（ok/ng/draw・miss/×見送りは除外）
    if (res === "ok") wOk++; else if (res === "ng") wNg++; else if (res === "draw") wDr++;
    var hasH2 = _elHas2Data(s);
    if (epStop || h1Stop || (hasH2 && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c))) stopN++;
    // ===== 新スコア（損切り率・H1勝率は「H1まで」で測る）=====
    var determinable = epStop || h1Stop || hd != null;   // H1までの結果が判定できる記録だけを母数に
    if (determinable) {
      scN++;
      if (epStop || h1Stop) stopH1N++;     // EP足 or H1足で損切り＝損切り扱い
      else if (hd != null && hd > 0) h1WinN++;   // 損切りでなく、H1損益>0＝H1勝ち
    }
  });
  var decided = wOk + wNg + wDr;
  var stopRate = scN > 0 ? stopH1N / scN : null;
  var h1win = scN > 0 ? h1WinN / scN : null;
  var score = scN > 0 ? (_EL_BASE_W_STOP * (1 - stopRate) + _EL_BASE_W_H1 * h1win) : null;
  return { a: a, pnl: hasPnl ? pnl : null, epPnl: hasEp ? epPnl : null, stopN: stopN, epStopN: epStopN, n: n, entered: entered, eRate: n > 0 ? entered / n : 0, hasPnl: hasPnl, hasEp: hasEp, wOk: wOk, wNg: wNg, wDr: wDr, decided: decided, ewin: decided > 0 ? wOk / decided : 0, scN: scN, stopH1N: stopH1N, h1WinN: h1WinN, stopRate: stopRate, h1win: h1win, score: score };
}
// 推奨基本α(5〜20)を選定【2026-06-22c】: 件数フロア＝最大件数(scN)×_EL_BASE_MIN_FRAC（最低_EL_BASE_MIN_N件）かつ 到達率≥_EL_BASE_MIN_ERATE のαから、合成スコア(0.7×(1−損切り率)+0.3×H1勝率)が最大。
// 高αは到達率が下がり標本が薄い「いいとこ取り(選抜バイアスでスコア上振れ)」になるため、件数フロア＋到達率フロアで薄い高α・約定しにくい高αを除外＝厚く約定しやすい標本の中で最良のαを選ぶ。同点は件数最大→低α。フロア皆無なら件数(scN)最大のαを参考(status="na")・entered皆無は"none"。
// 返り値 { alpha, score, stopRate, h1win, eRate, entered, scN, pnl, epPnl, stopN, ewin, status('ok'|'na'|'none'), sweep, minN(=採用した件数フロア) }。
function _elBaseAlphaPick(recs, aiOf) {
  if (!recs || !recs.length) return null;
  // 推奨基本αの母数: 追加α(〇)記録を除外（追っかけ等の変則局面で基本αの評価が歪むため）2026-06-22。
  recs = recs.filter(function(r) { return r && !_elAddAlphaUsed(r.signal); });
  if (!recs.length) return null;
  var sweep = _EL_BASE_ALPHAS.map(function(a) { return _elBaseAlphaEval(recs, aiOf, a); });
  // 件数フロア(実データ連動): 最も件数(scN)の多いαの_EL_BASE_MIN_FRAC以上を要求＝高αの薄い標本(選抜バイアス)を除外。最低でも_EL_BASE_MIN_N件 2026-06-22b。
  var maxScN = sweep.reduce(function(m, e) { return Math.max(m, e.scN || 0); }, 0);
  var floorN = Math.max(_EL_BASE_MIN_N, Math.round(maxScN * _EL_BASE_MIN_FRAC));
  var _ret = function(p, status) { return { alpha: p.a, score: p.score, stopRate: p.stopRate, h1win: p.h1win, eRate: p.eRate, entered: p.entered, scN: p.scN, pnl: p.pnl, epPnl: p.epPnl, stopN: p.stopN, ewin: p.ewin, status: status, sweep: sweep, minN: floorN }; };
  // 件数フロア＋到達率フロア(_EL_BASE_MIN_ERATE)を満たすαの中で合成スコア最大（薄い高α・約定しにくい高αを母数から外す）。同点は件数の多い＝信頼できる方→低α。
  var cand = sweep.filter(function(e) { return e.scN >= floorN && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.score != null; });
  if (cand.length) {
    cand.sort(function(x, y) { return (x.score - y.score) || (x.scN - y.scN) || (y.a - x.a); });   // 昇順→末尾が最良（スコア最大・同点は件数最大→低α）
    return _ret(cand[cand.length - 1], "ok");
  }
  // フロアを満たすα皆無（標本が全体に薄い）: 件数(scN)最大のαを参考返し（status="na"・信頼度低）
  var withEntry = sweep.filter(function(e) { return e.entered > 0; });
  if (!withEntry.length) return { alpha: null, score: null, stopRate: null, h1win: null, eRate: null, entered: 0, scN: 0, pnl: null, epPnl: null, stopN: null, ewin: null, status: "none", sweep: sweep, minN: floorN };
  withEntry.sort(function(x, y) { return (x.scN - y.scN) || (x.a - y.a); });
  return _ret(withEntry[withEntry.length - 1], "na");
}
// 追加α推奨（実データ総当たり 2026-06-22再設計）: 基本αに +1〜+_EL_BASE_ADD_MAX(合計≤50)を上乗せした合計αを、基本αと同じ合成スコアで総当たり評価。
// 基本αのスコア(baseScore)を有意(>_EL_BASE_SCORE_EPS)に上回る中で最良(最大スコア・同点は最小加算)の加算幅を返す。件数フロアは基本αと共通。
// 「基本αから何円足せば損切りしにくくH1利益が出たか」を実データで算出＝補助。改善が無ければ add=0(基本αで十分)。
// 返り値 { add, total, score, baseScore, stopRate, h1win, scN, improved } or null（baseScore不明/データ無し）。
function _elAddAlphaReco(recs, aiOf, baseAlpha, baseScore) {
  if (!recs || baseAlpha == null || baseScore == null) return null;
  var best = null;
  for (var add = 1; add <= _EL_BASE_ADD_MAX; add++) {
    var tot = baseAlpha + add;
    if (tot > 50) break;   // 合計αの上限（理想α候補と同レンジ）
    var e = _elBaseAlphaEval(recs, aiOf, tot);
    if (e.scN < _EL_BASE_MIN_N || e.score == null) continue;
    if (e.score <= baseScore + _EL_BASE_SCORE_EPS) continue;   // 有意な改善のみ
    if (!best || e.score > best.e.score) best = { add: add, e: e };   // 最大スコア（addは昇順なので同点は最小加算を維持）
  }
  if (!best) return { add: 0, total: baseAlpha, score: baseScore, baseScore: baseScore, stopRate: null, h1win: null, scN: null, improved: false };
  return { add: best.add, total: baseAlpha + best.add, score: best.e.score, baseScore: baseScore, stopRate: best.e.stopRate, h1win: best.e.h1win, scN: best.e.scN, improved: true };
}
// 一括: { pick(推奨基本α本体・追加α無し母数), add(推奨追加α・追加α〇の記録だけを母数に算出) }。二プール設計 2026-06-22。
function _elBaseAlphaA(recs, aiOf) {
  var pick = _elBaseAlphaPick(recs, aiOf);   // 内部で追加α(〇)記録を除外＝基本αの母数は「追加α無し」
  if (!pick || pick.alpha == null) return null;
  // 推奨追加α: 追加α(〇)記録だけを母数に「基本αから何円足すと損切り↓H1利益↑だったか」を算出。
  var add = null;
  if (pick.status === "ok") {
    var addPool = (recs || []).filter(function(r) { return r && _elAddAlphaUsed(r.signal); });
    if (addPool.length) {
      var baseEval = _elBaseAlphaEval(addPool, aiOf, pick.alpha);   // 基本αを追っかけ母数に当てた時のスコア（比較基準）
      add = _elAddAlphaReco(addPool, aiOf, pick.alpha, baseEval.score);
    }
  }
  return { pick: pick, add: add };
}
// ===== 推奨損切り値【合成スコア＝実現H1損益が最大の損切り値 2026-06-22／ユーザー方針】=====
// 損切り値を大きくするほど「損切り回避率」は単調に上がる（退化）ため、回避率＋勝率の単純合成は最大損切りに張り付く。
// そこで「実現H1損益（損切りルール適用後）の平均が最大」になる損切り値を主軸に選ぶ＝内部に最適点がある（小さすぎ＝勝ち玉を切る／大きすぎ＝損失拡大）。
// 損切り回避率・H1勝率はその損切り値での根拠として併記。母数=「OS1〜2でEP到達しH1損益が判定できる記録」。各記録の採用α(aiOf(r).alpha)を使い損切り値だけを振る。
var _EL_CUT_CANDS = (function() { var _c = []; for (var _ci = 5; _ci <= 30; _ci++) _c.push(_ci); return _c; })();
function _elCutEval(recs, aiOf, cut) {
  var sum = 0, nn = 0, stopN = 0, winN = 0;
  (recs || []).forEach(function(r) {
    var s = r.signal; if (!s) return;
    var ai = aiOf(r), alpha = ai.alpha; if (alpha == null) return;
    var rr = _epResolve(s, alpha);
    if (!(rr && rr.epIdx >= 0 && rr.epIdx <= 1)) return;   // OS1〜2でEP到達のみ
    var hd = _elDynHold(s, alpha, cut); if (hd == null) return;   // H1損益が判定できる記録のみ
    nn++; sum += hd;
    if (_elPlanIsStop(s, alpha, cut) || _elHoldIsStop(s, alpha, cut)) stopN++;
    else if (hd > 0) winN++;
  });
  return { cut: cut, n: nn, sum: nn ? sum : null, mean: nn ? sum / nn : null, stopRate: nn ? stopN / nn : null, h1win: nn ? winN / nn : null };
}
// 推奨損切り値を選定: 件数フロア(_EL_BASE_MIN_N)を満たす損切り値から実現H1損益の平均が最大。僅差(±max(20円,2%))は小さい損切り（リスク小）を優先。
// フロアを満たす損切り値が皆無なら件数最大の損切り値を参考(status="na")。返り値 { cut, mean, sum, stopRate, h1win, n, status, sweep }。
function _elCutPick(recs, aiOf) {
  if (!recs || !recs.length) return null;
  var sweep = _EL_CUT_CANDS.map(function(c) { return _elCutEval(recs, aiOf, c); });
  var ret = function(e, status) { return { cut: e.cut, mean: e.mean, sum: e.sum, stopRate: e.stopRate, h1win: e.h1win, n: e.n, status: status, sweep: sweep }; };
  var cand = sweep.filter(function(e) { return e.n >= _EL_BASE_MIN_N && e.mean != null; });
  if (cand.length) {
    var maxMean = cand.reduce(function(m, e) { return Math.max(m, e.mean); }, -Infinity);
    var eps = Math.max(20, Math.abs(maxMean) * 0.02);
    var near = cand.filter(function(e) { return e.mean >= maxMean - eps; });
    near.sort(function(x, y) { return x.cut - y.cut; });   // 僅差は小さい損切り優先
    return ret(near[0], "ok");
  }
  var anyN = sweep.filter(function(e) { return e.n > 0; });
  if (!anyN.length) return { cut: null, mean: null, sum: null, stopRate: null, h1win: null, n: 0, status: "none", sweep: sweep };
  anyN.sort(function(x, y) { return (y.n - x.n) || ((y.mean || -1e9) - (x.mean || -1e9)) || (x.cut - y.cut); });
  return ret(anyN[0], "na");
}
// 割合(0〜1)→%セル（70%以上=緑/50%以上=橙/未満=赤）。高いほど良い指標用。
function _elPctCell(rate) {
  var p = Math.round((rate || 0) * 100);
  return React.createElement("span", { style: { fontWeight: 700, color: p >= 70 ? "#1E8449" : p >= 50 ? "#B45309" : "#C0392B" } }, p + "%");
}
// 損切り率(0〜1)→%セル（低いほど良い＝20%以下=緑/40%以下=橙/超=赤）。2026-06-22。
function _elStopRateCell(rate) {
  var p = Math.round((rate || 0) * 100);
  return React.createElement("span", { style: { fontWeight: 700, color: p <= 20 ? "#1E8449" : p <= 40 ? "#B45309" : "#C0392B" } }, p + "%");
}
// 合成スコア(0〜1)→0〜100の点数セル（70以上=緑/50以上=橙/未満=赤）。2026-06-22。
function _elScoreCell(score) {
  if (score == null) return React.createElement("span", { style: { color: "#bbb" } }, "—");
  var p = Math.round(score * 100);
  return React.createElement("span", { style: { fontWeight: 800, color: p >= 70 ? "#1E8449" : p >= 50 ? "#B45309" : "#C0392B" } }, p);
}
// 推奨基本αの期間別トレンド本体（gran=month/week）。期間ごとに推奨基本αを出し、折れ線＋表＋最初vs直近の読み取り。2026-06-22再設計で単一推奨α＋損切り率/H1勝率/スコア表示。
function _elBaseAlphaTrendBody(recs, aiOf, gran) {
  var byB = {};
  (recs || []).forEach(function(r) { if (!r || !r.date) return; var k = _elBucketKey(r.date, gran); (byB[k] = byB[k] || []).push(r); });
  var buckets = Object.keys(byB).sort().map(function(k) {
    var rs = byB[k];
    return { key: k, label: _elBucketLabel(k, gran), pick: _elBaseAlphaPick(rs, aiOf), n: rs.length };
  }).filter(function(b) { return b.pick && b.pick.alpha != null && b.pick.status === "ok"; });
  if (!buckets.length) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var pts = buckets.map(function(b) { return b.pick.alpha; });
  var xTicks = [], step = Math.max(1, Math.ceil(buckets.length / 6));
  buckets.forEach(function(b, i) { if (i % step === 0 || i === buckets.length - 1) xTicks.push({ i: i, label: b.label }); });
  var chart = buckets.length >= 2 ? _elLineChartV2([{ label: "推奨基本α", color: "#0369A1", pts: pts }], { xTicks: xTicks, height: 170, targetTicks: 6 }) : null;
  var rows = buckets.map(function(b, i) {
    var p = b.pick;
    return React.createElement("tr", { key: i },
      _elv2Td(b.label, { fontWeight: 700, color: "#9A3412" }),
      _elv2Td(React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, p.alpha + "円")),
      _elv2Td(p.stopRate == null ? "—" : _elStopRateCell(p.stopRate)),
      _elv2Td(p.h1win == null ? "—" : _elPctCell(p.h1win)),
      _elv2Td(_elScoreCell(p.score)),
      _elv2Td(b.n + "件"));
  });
  var first = buckets[0], last = buckets[buckets.length - 1];
  var insight = (buckets.length >= 2) ? _elInsightBoxV2([
    React.createElement("span", null, "〜", _elInsightEmV2(first.label), "の推奨基本αは", _elInsightEmV2(first.pick.alpha + "円"), "、直近の", _elInsightEmV2(last.label), "は", _elInsightEmV2(last.pick.alpha + "円"), "。"),
    (last.pick.alpha !== first.pick.alpha) ? React.createElement("span", null, "最近は", _elInsightEmV2((last.pick.alpha > first.pick.alpha ? "高め" : "低め") + "（" + (last.pick.alpha > first.pick.alpha ? "+" : "") + (last.pick.alpha - first.pick.alpha) + "円）"), "の傾向。") : null
  ].filter(Boolean), { note: "各期間で「件数フロアを満たす中で合成スコア(損切り回避70%＋H1勝率30%)が最大のα」＝損切りしにくくH1で利益が出やすい土台。スコアは0〜100点。該当なしの期間は非表示。5〜20円。件数が少ない期間は振れやすい" }) : null;
  return React.createElement("div", null, chart, _elv2Table(["期間", "推奨基本α", "損切り率", "H1勝率", "スコア", "件数"], rows), insight);
}
// 推奨基本αの「期間まとめ」: 1つの推奨値＋追加α＋α別の 損切り率(H1)/H1勝率/スコア 早見表（★=推奨）＋読み取り。2026-06-22再設計。
function _elBaseAlphaSummary(recs, aiOf) {
  var _A = _elBaseAlphaA(recs, aiOf);
  var pick = _A ? _A.pick : _elBaseAlphaPick(recs, aiOf);
  if (!pick || pick.status === "none" || pick.alpha == null) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var na = pick.status === "na";
  var minN = pick.minN || _EL_BASE_MIN_N;
  var add = _A ? _A.add : null;
  var noteSub = "件数フロア" + minN + "件以上（最も件数の多いαの" + Math.round(_EL_BASE_MIN_FRAC * 100) + "%以上）のαから、合成スコア＝損切り回避" + Math.round(_EL_BASE_W_STOP * 100) + "%＋H1勝率" + Math.round(_EL_BASE_W_H1 * 100) + "%が最大のα。高αは到達率が下がり標本が薄い「いいとこ取り(選抜バイアス)」でスコアが上振れるため件数フロアで除外。同点は件数の多い方。該当なし時は件数最大のαを参考表示。5〜20円1円刻み";
  var sweepRows = pick.sweep.filter(function(e) { return e.entered > 0; }).map(function(e) {
    var on = e.a === pick.alpha;
    var pass = e.scN >= minN && e.score != null;
    return React.createElement("tr", { key: e.a, style: { background: on ? "#FEF3C7" : "transparent", opacity: pass ? 1 : 0.45 } },
      _elv2Td(React.createElement("span", { style: { fontWeight: on ? 800 : 600, color: on ? "#B45309" : "#0369A1" } }, e.a + "円" + (on ? " ★" : "")), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(e.h1win == null ? "—" : _elPctCell(e.h1win)),
      _elv2Td(e.scN + "件"),
      _elv2Td(_elScoreCell(e.score)));
  });
  var _sweepHead = ["基本α", "EP到達(OS2)", "損切り率(H1)", "H1勝率", "件数", "スコア"];
  var stopP = pick.stopRate != null ? Math.round(pick.stopRate * 100) : null;
  var winP = pick.h1win != null ? Math.round(pick.h1win * 100) : null;
  var cards = _elv2CardRow([
    _elv2Card("推奨基本α", React.createElement("span", { style: { color: na ? "#B45309" : "#0369A1" } }, pick.alpha + "円"), na ? "#B45309" : "#0369A1", na ? "該当なし→件数最大" : "スコア最大"),
    _elv2Card("追加α目安", (add && add.improved) ? ("+" + add.add + "円") : (add ? "+0円" : "—"), (add && add.improved) ? "#9A3412" : "#bbb", (add && add.improved) ? ("合計" + add.total + "円") : (add ? "基本αで十分" : null)),
    _elv2Card("損切り率(H1)", stopP != null ? stopP + "%" : "—", stopP != null ? (stopP <= 20 ? "#1E8449" : stopP <= 40 ? "#B45309" : "#C0392B") : "#333", "推奨αで"),
    _elv2Card("H1勝率", winP != null ? winP + "%" : "—", winP != null ? (winP >= 70 ? "#1E8449" : winP >= 50 ? "#B45309" : "#C0392B") : "#333", "推奨αで"),
    _elv2Card("スコア", _elScoreCell(pick.score), null, "0〜100"),
    _elv2Card("EP到達率(OS2)", _elPctCell(pick.eRate), null),
    _elv2Card("件数", (pick.scN != null ? pick.scN : 0) + "件", null, "判定可能なE")
  ]);
  var banner = na ? React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6, padding: "5px 8px", marginBottom: 6 } }, "⚠ 該当なし：件数フロア" + minN + "件以上のαがありません → 件数最大のα " + pick.alpha + "円 を参考表示（信頼度低）") : null;
  return React.createElement("div", null, banner, cards,
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "8px 0 2px" } }, "α別の EP到達率(OS2)・損切り率(H1)・H1勝率・スコア（★＝推奨基本α・フロア未満は淡色）"),
    _elv2Table(_sweepHead, sweepRows),
    _elInsightBoxV2([React.createElement("span", null, "推奨基本αは", _elInsightEmV2(pick.alpha + "円"), "（", (na ? "該当なし→件数最大" : ("損切り率" + (stopP != null ? stopP + "%" : "—") + "・H1勝率" + (winP != null ? winP + "%" : "—") + "・スコア" + (pick.score != null ? Math.round(pick.score * 100) : "—") + "点")), "）。", (add && add.improved) ? React.createElement("span", null, "さらに", _elInsightEmV2("+" + add.add + "円（合計" + add.total + "円）"), "足すと損切り回避とH1利益が改善。") : null)], { note: noteSub }));
}
// 🎯 推奨基本α値: 月別/週別/期間まとめを切替（ステートフル）。
function _elBaseAlphaTrendV2(props) {
  var recs = props.recs, aiOf = props.aiOf;
  var _g = useState("month"), gran = _g[0], setGran = _g[1];
  var _tg = function(val, lbl) {
    var on = gran === val;
    return React.createElement("button", { key: val, onClick: function() { setGran(val); },
      style: { padding: "3px 12px", fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid " + (on ? "#0369A1" : "#ddd"), background: on ? "#0369A1" : "#fff", color: on ? "#fff" : "#666" } }, lbl);
  };
  var toggle = React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8 } }, _tg("month", "月別"), _tg("week", "週別"), _tg("period", "期間まとめ"));
  var body = gran === "period" ? _elBaseAlphaSummary(recs, aiOf) : _elBaseAlphaTrendBody(recs, aiOf, gran);
  return React.createElement("div", null, toggle, body);
}
// 推奨基本α 詳細データ（この銘柄/グループ）2026-06-22: 推奨値が出た根拠を全部開示＝結論バー＋①α別の総当たり(スコア内訳付き)＋②採用αでの全記録の内訳(どの記録が母数で損切り/H1勝ち/対象外か)＋読み取り。
function _elBaseAlphaDetailV2(recs, aiOf) {
  var _A = _elBaseAlphaA(recs, aiOf);
  var pick = _A ? _A.pick : _elBaseAlphaPick(recs, aiOf);
  if (!pick || pick.status === "none" || pick.alpha == null) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var a = pick.alpha, na = pick.status === "na", minN = pick.minN || _EL_BASE_MIN_N;
  var add = _A ? _A.add : null;
  var stopP = pick.stopRate != null ? Math.round(pick.stopRate * 100) : null;
  var winP = pick.h1win != null ? Math.round(pick.h1win * 100) : null;
  var _lbl = function(t) { return React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "10px 0 2px" } }, t); };
  var concl = React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 10px", background: na ? "#FEF3C7" : "#F0F9FF", border: "1px solid " + (na ? "#FCD34D" : "#BAE6FD"), borderRadius: 8, padding: "8px 12px" } },
    React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, "推奨基本α"),
    React.createElement("span", { style: { fontSize: 20, fontWeight: 800, color: na ? "#B45309" : "#0369A1" } }, a + "円"),
    na
      ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#B45309" } }, "データ不足 " + (pick.scN != null ? pick.scN : 0) + "件/最低" + minN + "件・参考値")
      : React.createElement("span", { style: { fontSize: 11, color: "#555" } },
          "スコア ", React.createElement("b", { style: { color: "#0369A1" } }, pick.score != null ? Math.round(pick.score * 100) : "—"),
          "／損切り率 ", React.createElement("b", null, stopP != null ? stopP + "%" : "—"),
          "／H1勝率 ", React.createElement("b", null, winP != null ? winP + "%" : "—"),
          "／母数 ", React.createElement("b", null, (pick.scN || 0) + "件"),
          "／到達率 ", React.createElement("b", null, Math.round((pick.eRate || 0) * 100) + "%")),
    (add && add.improved)
      ? React.createElement("span", { style: { fontSize: 11, color: "#9A3412", fontWeight: 700 } }, "＋追加α +" + add.add + "円（合計" + add.total + "円・スコア" + Math.round(add.score * 100) + "）")
      : (add ? React.createElement("span", { style: { fontSize: 10, color: "#94A3B8" } }, "追加α＝基本αで十分(+0)") : null));
  var sweepRows = pick.sweep.filter(function(e) { return e.entered > 0; }).map(function(e) {
    var on = e.a === a, pass = e.scN >= minN && e.score != null;
    return React.createElement("tr", { key: e.a, style: { background: on ? "#FEF3C7" : "transparent", opacity: pass ? 1 : 0.4 } },
      _elv2Td(React.createElement("span", { style: { fontWeight: on ? 800 : 600, color: on ? "#B45309" : "#0369A1" } }, e.a + "円" + (on ? " ★" : "")), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(e.scN + "件"),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(e.h1win == null ? "—" : _elPctCell(e.h1win)),
      _elv2Td(e.score == null ? "—" : React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "0.7×" + Math.round((1 - e.stopRate) * 100) + "+0.3×" + Math.round(e.h1win * 100))),
      _elv2Td(_elScoreCell(e.score)));
  });
  var recsSorted = recs.slice().sort(function(x, y) { var dx = x.date || "", dy = y.date || ""; return dx < dy ? 1 : dx > dy ? -1 : 0; });
  var scN = 0, stopN = 0, winN = 0, otherN = 0, offN = 0;
  var _pnlCell = function(v) { return v == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: 700 } }, _elPnlFmt(v)); };
  var recRows = recsSorted.map(function(r, i) {
    var s = r.signal; if (!s) return null;
    var c = aiOf(r).cutLine;
    var rr = _epResolve(s, a);
    var epIdx = rr ? rr.epIdx : -1;
    var within2 = epIdx >= 0 && epIdx <= 1;
    var dateStr = (r.date || "").slice(5).replace("-", "/");
    var legLabel = epIdx === 0 ? "OS1" : epIdx === 1 ? "OS2" : epIdx === 2 ? "OS3" : "未到達";
    if (!within2) {
      offN++;
      return React.createElement("tr", { key: i, style: { opacity: 0.45 } },
        _elv2Td(dateStr, { textAlign: "left", paddingLeft: 8 }),
        _elv2Td(React.createElement("span", { style: { fontSize: 10, color: "#94A3B8" } }, r.stock || "")),
        _elv2Td(legLabel + "（対象外）"),
        _elv2Td("—"), _elv2Td("—"),
        _elv2Td(React.createElement("span", { style: { fontSize: 10, color: "#94A3B8", fontWeight: 700 } }, "対象外")));
    }
    var epStop = _elPlanIsStop(s, a, c), h1Stop = _elHoldIsStop(s, a, c);
    var hd = _elDynHold(s, a, c), pl = _elDynPlanned(s, a, c);
    var determinable = epStop || h1Stop || hd != null;
    var verdict, vcol;
    if (!determinable) { verdict = "判定不可"; vcol = "#94A3B8"; }
    else {
      scN++;
      if (epStop || h1Stop) { stopN++; verdict = "損切り"; vcol = "#1E8449"; }
      else if (hd != null && hd > 0) { winN++; verdict = "H1勝ち"; vcol = "#C0392B"; }
      else { otherN++; verdict = "H1負/±0"; vcol = "#1E8449"; }
    }
    return React.createElement("tr", { key: i, style: { background: (epStop || h1Stop) ? "#F0FDF4" : "transparent" } },
      _elv2Td(dateStr, { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, r.stock || "")),
      _elv2Td(legLabel),
      _elv2Td(_pnlCell(pl)),
      _elv2Td(_pnlCell(hd)),
      _elv2Td(React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: vcol } }, verdict)));
  }).filter(Boolean);
  var insight = _elInsightBoxV2([
    React.createElement("span", null, "採用α", _elInsightEmV2(a + "円"), "の母数は", _elInsightEmV2(scN + "件"), "（OS2までにEP到達しH1判定可能）。うち損切り", _elInsightEmV2(stopN + "件"), "・H1勝ち", _elInsightEmV2(winN + "件"), "・その他", _elInsightEmV2(otherN + "件"), "、対象外", _elInsightEmV2(offN + "件"), "（OS3のみ／未到達）。"),
    React.createElement("span", null, "スコア＝0.7×(1−損切り率", _elInsightEmV2((stopP != null ? stopP : "—") + "%"), ")＋0.3×H1勝率", _elInsightEmV2((winP != null ? winP : "—") + "%"), "＝", _elInsightEmV2((pick.score != null ? Math.round(pick.score * 100) : "—") + "点"), "。")
  ], { note: "この銘柄のv2・算入記録に各αを当ててシミュレーション。母数＝採用αでOS1〜2にEP到達しH1結果が判定できる記録。損切り率・H1勝率はこの母数で算出＝下表の各記録がそのまま推奨αの根拠。" + (na ? " ※データ不足（母数<" + minN + "件）のため参考値。" : "") });
  return React.createElement("div", null,
    concl,
    _lbl("① α別の総当たり（5〜20円・★＝採用・件数フロア" + minN + "件未満は淡色）"),
    _elv2Table(["基本α", "到達率", "件数", "損切り率", "H1勝率", "スコア内訳", "スコア"], sweepRows),
    _lbl("② 採用α " + a + "円 での全記録の内訳（母数＝この数値の根拠・損切りは薄緑）"),
    _elv2Table(["日付", "銘柄", "EP到達", "EP損益", "H1損益", "判定"], recRows),
    insight);
}
// 推奨基本α表（銘柄/期間グループ別）: groups=[{label,recs}]・cutFn(r)→損切り値。各グループの推奨基本α(_elBaseAlphaPick・5〜20・
// 件数フロア＋合成スコア最大・該当なしは件数最大)を1値表示＋損切り率/H1勝率の小書き＋追加α目安。旧 _elIdealAlphaTableV2(EP/H1/H2別・0〜50)を置換 2026-06-21→条件再設計 2026-06-22。
function _elBaseAlphaTableV2(groups, cutFn) {
  var _cf = cutFn || function() { return 10; };
  var aiOf = function(r) { return { cutLine: _cf(r) }; };
  var _th = function(t) { return React.createElement("th", { style: { padding: "3px 8px", fontWeight: 700, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center", whiteSpace: "nowrap" } }, t); };
  var _aLine = function(pk) {
    if (!pk || pk.alpha == null) return React.createElement("div", { style: { fontSize: 10, color: "#aaa", whiteSpace: "nowrap" } }, "—");
    var na = pk.status === "na";
    return React.createElement("div", { style: { whiteSpace: "nowrap", lineHeight: 1.3 } },
      React.createElement("span", { style: { fontWeight: 800, color: na ? "#B45309" : "#0369A1", fontSize: 14 } }, pk.alpha + "円"),
      na ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 3, fontWeight: 700 } }, "データ不足 " + (pk.scN != null ? pk.scN : 0) + "件/最低" + (pk.minN || 3) + "件・参考") : React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", marginLeft: 3 } }, "損切" + Math.round((pk.stopRate || 0) * 100) + "%・H1勝" + Math.round((pk.h1win || 0) * 100) + "%・" + (pk.scN || 0) + "件"));
  };
  var rows = (groups || []).filter(function(g) { return g.recs && g.recs.length; }).map(function(g, gi) {
    var A = _elBaseAlphaA(g.recs, aiOf);
    var cell;
    if (!A) cell = React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "データ無し");
    else cell = React.createElement("div", null,
      _aLine(A.pick),
      (A.add && A.add.improved) ? React.createElement("div", { style: { fontSize: 9, color: "#9A3412", whiteSpace: "nowrap", marginTop: 1 } }, "追加α +" + A.add.add + "円（合計" + A.add.total + "円）") : null);
    return React.createElement("tr", { key: gi, style: { borderBottom: "1px solid #dbeafe" } },
      React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#9A3412", fontSize: 11, whiteSpace: "nowrap", verticalAlign: "top" } }, g.label),
      React.createElement("td", { style: { padding: "3px 8px", textAlign: "left", borderLeft: "1px solid #dbeafe" } }, cell));
  });
  if (!rows.length) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  return React.createElement("div", { style: { overflowX: "auto" } },
    React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 11, width: "100%" } },
      React.createElement("thead", null, React.createElement("tr", null, _th("銘柄"), _th("推奨基本α（＋追加α）"))),
      React.createElement("tbody", null, rows)));
}
// 期間別の推奨基本α（その日まで・移動窓）: recsをrefDate以前に絞り、直近1週/1か月/3か月/全期間で推奨基本α(_elBaseAlphaA)を出す表。銘柄別記録の「その日まで」分析用 2026-06-22c。
// aiOf(r)→{cutLine}（採用は各記録のcutLine）。期間窓はrefDate起点の移動窓（週初/月初の標本不足を避ける）。
function _elBaseAlphaPeriodTableV2(recs, aiOf, refDate) {
  var all = (recs || []).filter(function(r) { return r && r.date && r.date <= refDate && _epIsV2(r.signal) && _elInclTotal(r.signal); });
  if (!all.length) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var _p = String(refDate).split("-");
  var _pad = function(nn) { return ("0" + nn).slice(-2); };
  var _ymd = function(dd) { return dd.getFullYear() + "-" + _pad(dd.getMonth() + 1) + "-" + _pad(dd.getDate()); };
  var _cut = function(mut) { var d = new Date(Number(_p[0]), Number(_p[1]) - 1, Number(_p[2])); mut(d); return _ymd(d); };
  var c1 = _cut(function(d) { d.setDate(d.getDate() - 7); });
  var c2 = _cut(function(d) { d.setMonth(d.getMonth() - 1); });
  var c3 = _cut(function(d) { d.setMonth(d.getMonth() - 3); });
  var _win = function(lo) { return all.filter(function(r) { return r.date >= lo; }); };
  var periods = [
    { label: "直近1週間", recs: _win(c1) },
    { label: "直近1か月", recs: _win(c2) },
    { label: "直近3か月", recs: _win(c3) },
    { label: "全期間", recs: all }
  ];
  var dash = React.createElement("span", { style: { color: "#bbb" } }, "—");
  var rows = periods.map(function(pd, i) {
    var A = _elBaseAlphaA(pd.recs, aiOf);
    var pk = A ? A.pick : null;
    var add = A ? A.add : null;
    var alphaCell;
    if (!pk || pk.alpha == null) alphaCell = dash;
    else {
      var na = pk.status === "na";
      alphaCell = React.createElement("span", { style: { whiteSpace: "nowrap" } },
        React.createElement("span", { style: { fontWeight: 800, fontSize: 13, color: na ? "#B45309" : "#0369A1" } }, pk.alpha + "円"),
        na ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 2, fontWeight: 700 } }, "参考") : null,
        (add && add.improved) ? React.createElement("span", { style: { fontSize: 9, color: "#9A3412", marginLeft: 3 } }, "+追加" + add.add + "(計" + add.total + ")") : null);
    }
    return React.createElement("tr", { key: i },
      _elv2Td(pd.label, { fontWeight: 700, color: "#9A3412", textAlign: "left", paddingLeft: 8 }),
      _elv2Td(alphaCell),
      _elv2Td(pk && pk.stopRate != null ? _elStopRateCell(pk.stopRate) : dash),
      _elv2Td(pk && pk.h1win != null ? _elPctCell(pk.h1win) : dash),
      _elv2Td(pk && pk.eRate != null ? _elPctCell(pk.eRate) : dash),
      _elv2Td((pk && pk.scN != null ? pk.scN : 0) + "件"));
  });
  return _elv2Table(["期間", "推奨基本α", "損切り率", "H1勝率", "到達率", "件数"], rows);
}

// ===== 追加分析セクション群の共通小物（2026-06-14）=====
function _elv2Th(t) { return React.createElement("th", { style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); }
function _elv2Td(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); }
function _elv2Table(head, bodyRows) {
  return React.createElement("div", { style: { overflowX: "auto", marginTop: 6 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } }, head.map(function(h) { return React.isValidElement(h) ? h : _elv2Th(h); }))),
      React.createElement("tbody", null, bodyRows)));
}
function _elv2Card(label, valNode, color, sub) {
  return React.createElement("div", { style: { flex: "1 1 116px", minWidth: 108, background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "8px 10px", textAlign: "center" } },
    React.createElement("div", { style: { fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 3 } }, label),
    React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: color || "#333", lineHeight: 1.15, whiteSpace: "nowrap" } }, valNode),
    sub ? React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 2 } }, sub) : null);
}
function _elv2CardRow(cards) { return React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 } }, cards); }
function _elv2Avg(sum, cnt) {
  if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var a = Math.round(sum / cnt);
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } },
    React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)),
    React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, "計" + (sum > 0 ? "+" : "") + Math.round(sum).toLocaleString()));
}
function _elv2Rate(n, d, hi) { if (!d) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var p = Math.round(n / d * 100); return React.createElement("span", { style: { fontWeight: 700, color: p >= (hi || 50) ? "#1E8449" : "#B45309" } }, p + "%"); }
// 数値配列の中央値（小数1位四捨五入・偶数件は中央2値平均）。右偏なOS値はグループ比較も平均でなく中央値で扱う（2026-06-14b）。
function _elMedian(arr) { if (!arr || !arr.length) return null; var s = arr.slice().sort(function(a, b) { return a - b; }); var m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2 * 10) / 10; }
// 平均（小数1位四捨五入）。空配列はnull。中央値(_elMedian)と対で使う（2026-06-15 平均・中央値の併記）。
function _elMean(arr) { if (!arr || !arr.length) return null; var s = 0; for (var i = 0; i < arr.length; i++) s += Number(arr[i]); return Math.round(s / arr.length * 10) / 10; }
// OS値など右偏指標のセル: 中央値（主・色付き）＋平均（副）を1セルに併記（2026-06-15）。arr=値配列。
function _elOsMMCell(arr) {
  if (!arr || !arr.length) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var md = _elMedian(arr), mn = _elMean(arr);
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
    React.createElement("span", { style: { fontWeight: 700, color: _vcol(md, true) } }, "中央" + md + "円"),
    React.createElement("span", { style: { fontSize: 9, color: "#888" } }, "平均" + mn + "円"));
}
// 損益セル: 平均（色付き）＋合計（計）を1セルに（2026-06-15・損益は平均のみ＝中央値併記は取りやめ）。
// arr=損益配列（円・E成立=エントリーできた分のみ＝平均の母数も同じ。未達/×見送りは各集計側で除外）。
function _elPnlMMCell(arr) {
  if (!arr || !arr.length) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var sum = 0; for (var i = 0; i < arr.length; i++) sum += Number(arr[i]);
  var mn = Math.round(sum / arr.length);
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
    React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(mn) } }, _elPnlFmt(mn)),
    React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, "計" + (sum > 0 ? "+" : "") + Math.round(sum).toLocaleString()));
}
// E後の勝率セル（2026-06-14b）: エントリー(E成立)後に利益が出た割合＝ok/(ok+ng)。取引(ok+ng)が0なら「—」。下に母数(E成立件数)。
// 敗率・未達率は出さない（未達率はE到達率の裏返し）。色は勝率≥50%で緑・未満で橙。
function _elEwinCell(ok, ng, draw) {
  ok = ok || 0; ng = ng || 0; draw = draw || 0;
  var d = ok + ng + draw;
  if (!d) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var w = Math.round(ok / d * 100);
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } },
    React.createElement("b", { style: { fontSize: 12, color: w >= 50 ? "#1E8449" : "#B45309" } }, w + "%"),
    React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, ok + "勝" + (draw ? " " + draw + "引" : "") + " " + ng + "敗"));
}

// OS値の分位点・歪み・到達率別α（右偏分布対応 2026-06-14）。
// p25/p50(中央値)/p75=昇順分位（線形補間）。aFor(p)=約p割が到達するα＝上側p割の下限=(1-p)分位を整数円に切り捨て。
// skewRight=平均-中央値が中央値の15%（最低1円）超で右偏。bandMode=最頻の帯。OS値入力なしならnull。
function _elOsPctlV2(recs) {
  var vals = [];
  (recs || []).forEach(function(r) {
    var s = r && r.signal ? r.signal : r;
    if (s && s.osVal != null && s.osVal !== "") { var n = Number(s.osVal); if (!isNaN(n)) vals.push(n); }
  });
  if (!vals.length) return null;
  vals.sort(function(a, b) { return a - b; });
  var n = vals.length;
  var _q = function(q) {
    if (n === 1) return vals[0];
    var pos = q * (n - 1), lo = Math.floor(pos), hi = Math.ceil(pos), frac = pos - lo;
    return vals[lo] + (vals[hi] - vals[lo]) * frac;
  };
  var mean = 0; vals.forEach(function(v) { mean += v; }); mean = mean / n;
  var p50 = _q(0.5), p25 = _q(0.25), p75 = _q(0.75);
  var _aFor = function(p) { return Math.max(0, Math.floor(_q(1 - p))); };
  var dist = [0, 0, 0, 0, 0];
  vals.forEach(function(v) { var bi = _elOsBandIdxV2(v); if (bi != null) dist[bi]++; });
  var bmi = 0; for (var i = 1; i < 5; i++) { if (dist[i] > dist[bmi]) bmi = i; }
  var r1 = function(x) { return Math.round(x * 10) / 10; };
  return { n: n, mean: r1(mean), p25: r1(p25), p50: r1(p50), p75: r1(p75), iqr: r1(p75 - p25),
    skewRight: (mean - p50) > Math.max(1, p50 * 0.15),
    a50: _aFor(0.5), a70: _aFor(0.7), a80: _aFor(0.8), a90: _aFor(0.9),
    bandMode: { i: bmi, cnt: dist[bmi], pct: Math.round(dist[bmi] / n * 100) } };
}

// OS値帯別の成績テーブル（帯⇄1円刻み切替・2026-06-15）。集計タブ「OS値の分析」内。aiOf(r)→{alpha,cutLine}。
// 集計は_elOsSectionV2の帯別集計と共通ルール（採用α・E成立分のみ）で値一致。each=OS1値を1円刻みで分割（OS1高値は0以上）。
function _elOsBandPerfV2(_ref) {
  var recs = _ref.recs || [];
  var aiOf = _ref.aiOf;
  var _uG = useState("band"), gran = _uG[0], setGran = _uG[1];
  var mk = function() { return { cnt: 0, reach: 0, ok: 0, ng: 0, draw: 0, miss: 0, plan: 0, planCnt: 0, planArr: [], h1: 0, h1Cnt: 0, h1Arr: [], stop: 0, soft: 0 }; };
  var buckets = {};
  recs.forEach(function(r) {
    var s = r.signal; if (!s || s.osVal == null || s.osVal === "") return;
    var key;
    if (gran === "each") { var nv = Number(s.osVal); if (isNaN(nv) || nv < 0) return; key = Math.round(nv); }
    else { key = _elOsBandIdxV2(s.osVal); if (key == null) return; }
    var ai = aiOf(r); var o = buckets[key] || (buckets[key] = mk()); o.cnt++;
    if (_epReachedAt(s, ai.alpha)) o.reach++;
    var rr = _epResolve(s, ai.alpha);
    if (rr && rr.judge === "ok") {
      var res = _elDynResult(s, ai.alpha, ai.cutLine); if (res === "ok") o.ok++; else if (res === "ng") o.ng++; else if (res === "draw") o.draw++;
      var pv = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pv != null) { o.plan += pv; o.planCnt++; o.planArr.push(pv); }
      var h1 = _elHold1TotParts(s, ai.alpha, ai.cutLine); if (h1.main != null) { o.h1 += h1.main; o.h1Cnt++; o.h1Arr.push(h1.main); }
      var isStop = _elPlanIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop2(s, ai.alpha, ai.cutLine);
      if (isStop) o.stop++; else if (res === "ng") o.soft++;
    } else if (rr && rr.judge === "miss") o.miss++;
  });
  var keys = Object.keys(buckets).map(function(k) { return Number(k); }).sort(function(a, b) { return a - b; });
  var chip = function(key) {
    var col, lab;
    if (gran === "each") { var bi = _elOsBandIdxV2(key); col = (bi != null && _EL_OS_BANDS_V2[bi]) ? _EL_OS_BANDS_V2[bi].color : "#888"; lab = key + "円"; }
    else { col = _EL_OS_BANDS_V2[key].color; lab = _EL_OS_BANDS_V2[key].label; }
    return React.createElement("span", { style: { display: "inline-block", fontSize: 10, fontWeight: 700, color: "#fff", background: col, borderRadius: 8, padding: "1px 7px" } }, lab);
  };
  var bRows = keys.map(function(key) {
    var ob = buckets[key];
    return React.createElement("tr", { key: key },
      _elv2Td(chip(key), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(ob.cnt + "件", { fontWeight: 700 }),
      _elv2Td(_elv2Rate(ob.reach, ob.cnt)),
      _elv2Td(_elEwinCell(ob.ok, ob.ng, ob.draw)),
      _elv2Td(_elPnlMMCell(ob.planArr)),
      _elv2Td(_elPnlMMCell(ob.h1Arr)),
      _elv2Td((ob.ok + ob.ng + ob.draw) ? Math.round(ob.soft / (ob.ok + ob.ng + ob.draw) * 100) + "%" : "—", { color: ob.soft ? "#B45309" : "#bbb", fontWeight: ob.soft ? 700 : 400 }),
      _elv2Td((ob.ok + ob.ng + ob.draw) ? Math.round(ob.stop / (ob.ok + ob.ng + ob.draw) * 100) + "%" : "—", { color: ob.stop ? "#1E8449" : "#bbb", fontWeight: ob.stop ? 700 : 400 }));
  });
  return React.createElement("div", null,
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, margin: "8px 0 0", flexWrap: "wrap" } },
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412" } }, gran === "each" ? "OS値（1円刻み）別の成績" : "OS値帯（初動の強さ）別の成績"),
      _elGranToggle(gran, setGran)),
    bRows.length ? _elv2Table([gran === "each" ? "OS1値" : "OS1帯", "件数", "E到達率", "E後の勝率", "EP損益", "H1損益", "見切り率", "損切り率"], bRows)
      : React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "OS値の記録がありません"));
}
// OS値の総合分析（記録帳・集計タブ／2026-06-14）: 中央値主軸の統計＋右偏バッジ＋成立率→α分位表＋OS値帯別の成績。
// 「重視すべきは平均でなく中央値（α到達確率と直結）」という方針をUIに落とし込む。aiOf(r)→{alpha,cutLine}。
function _elOsSectionV2(recs, aiOf) {
  var os = _elOsStatsV2(recs), pc = _elOsPctlV2(recs);
  if (!os || !pc) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "OS値の記録がありません");
  var skewBadge = pc.skewRight ? React.createElement("span", { title: "平均が一部の大きいOS値に引っ張られています。典型値は中央値で読むのが安全です。", style: { display: "inline-block", fontSize: 9, fontWeight: 800, color: "#fff", background: "#B45309", borderRadius: 4, padding: "1px 6px", marginLeft: 6 } }, "右偏") : null;
  var statLine = React.createElement("div", { style: { display: "flex", gap: "6px 18px", flexWrap: "wrap", alignItems: "baseline", marginBottom: 6 } },
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginRight: 3 } }, "中央値"), React.createElement("b", { style: { fontSize: 18, color: "#9A3412" } }, os.med + "円"), skewBadge),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "平均"), React.createElement("b", { style: { fontSize: 13, color: "#555" } }, os.avg + "円")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "最頻帯"), React.createElement("span", { style: { display: "inline-block", fontSize: 10, fontWeight: 700, color: "#fff", background: _EL_OS_BANDS_V2[pc.bandMode.i].color, borderRadius: 8, padding: "1px 7px" } }, _EL_OS_BANDS_V2[pc.bandMode.i].label), React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 3 } }, pc.bandMode.pct + "%")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "中位50%"), React.createElement("b", { style: { fontSize: 12, color: "#555" } }, pc.p25 + "〜" + pc.p75 + "円")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "範囲"), React.createElement("b", { style: { fontSize: 12, color: "#555" } }, os.min + "〜" + os.max + "円")),
    React.createElement("span", { style: { fontSize: 10, color: "#aaa" } }, "OS入力 " + os.n + "件"));
  var pieRow = React.createElement("div", { style: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 8 } },
    _elOsPieV2(os.dist, 96),
    React.createElement("div", { style: { flex: "1 1 200px" } }, React.createElement("div", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginBottom: 4 } }, "OS値帯の割合"), _elOsBandLegendV2()));
  var aRows = [["50%（中央値）", pc.a50], ["70%", pc.a70], ["80%", pc.a80], ["90%", pc.a90]].map(function(kv) {
    return React.createElement("tr", { key: kv[0] }, _elv2Td(kv[0], { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#0369A1" }), _elv2Td(React.createElement("b", { style: { color: "#9A3412" } }, "α" + kv[1] + "円")));
  });
  var aTable = React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "4px 0 0" } }, "成立率の目安（このα以下なら約その割合でα到達＝取引機会）"),
    _elv2Table(["想定成立率", "α（目安）"], aRows));
  var mk = function() { return { cnt: 0, reach: 0, ok: 0, ng: 0, miss: 0, plan: 0, planCnt: 0, h1: 0, h1Cnt: 0, stop: 0 }; };
  var bands = {};
  (recs || []).forEach(function(r) {
    var s = r.signal; if (s.osVal == null || s.osVal === "") return; var bi = _elOsBandIdxV2(s.osVal); if (bi == null) return;
    var ai = aiOf(r); var o = bands[bi] || (bands[bi] = mk()); o.cnt++;
    if (_epReachedAt(s, ai.alpha)) o.reach++;
    var rr = _epResolve(s, ai.alpha);
    if (rr && rr.judge === "ok") {
      var res = _elDynResult(s, ai.alpha, ai.cutLine); if (res === "ok") o.ok++; else if (res === "ng") o.ng++;
      var pv = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pv != null) { o.plan += pv; o.planCnt++; }
      var h1 = _elHold1TotParts(s, ai.alpha, ai.cutLine); if (h1.main != null) { o.h1 += h1.main; o.h1Cnt++; }
      if (_elPlanIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop2(s, ai.alpha, ai.cutLine)) o.stop++;
    } else if (rr && rr.judge === "miss") o.miss++;
  });
  // 帯別成績テーブルは帯⇄1円刻みトグル付きの子コンポーネントへ（集計ロジックは上のbandsと共通ルール）。
  var bTable = React.createElement(_elOsBandPerfV2, { recs: recs, aiOf: aiOf });
  var items = [];
  items.push(React.createElement("span", null, "OS値（初動）は", _elInsightEmV2(_EL_OS_BANDS_V2[pc.bandMode.i].label + "帯", _EL_OS_BANDS_V2[pc.bandMode.i].color), "が最多（" + pc.bandMode.pct + "%）。典型値＝", _elInsightEmV2("中央値 " + os.med + "円"), pc.skewRight ? React.createElement("span", null, "（平均 " + os.avg + "円は一部の大きいOSに上振れ＝", _elInsightEmV2("中央値で読むのが安全", "#B45309"), "）") : null, "。"));
  items.push(React.createElement("span", null, "α設定の目安：", _elInsightEmV2("α" + pc.a50 + "円", "#0369A1"), "で約半数、", _elInsightEmV2("α" + pc.a70 + "円", "#0369A1"), "で約7割、", _elInsightEmV2("α" + pc.a80 + "円", "#0369A1"), "で約8割の場面でα到達。深いαほど取れた時は大きいが見送りも増える。"));
  var bw = null; for (var k = 0; k < 5; k++) { var o2 = bands[k]; if (o2 && (o2.ok + o2.ng) && (bw == null || o2.ok / (o2.ok + o2.ng) > bw.v)) bw = { v: o2.ok / (o2.ok + o2.ng), k: k }; }
  if (bw) items.push(React.createElement("span", null, "勝率が最も高い初動帯は", _elInsightEmV2(_EL_OS_BANDS_V2[bw.k].label + "帯", _EL_OS_BANDS_V2[bw.k].color), "（", _elInsightEmV2(Math.round(bw.v * 100) + "%"), "）。"));
  return React.createElement("div", null, statLine, pieRow, aTable, bTable, _elInsightBoxV2(items, { note: "中央値=ちょうど半数がそれ以上のOSになる値（α到達確率と直結＝α設定はこちらが目安）。平均は合計・期待値の計算向き。最頻帯=最も多く出る5円帯。E後の勝率=エントリー（E成立）後にEP損益が利益だった割合（敗率・未達率はE到達率の裏返しなので省略）。成績は採用α基準・E成立分のみ。" }));
}

// 指定recs（{stock,signal,date}配列）の記録系フル指標を集計（採用α基準・E成立分のEP/H1/損切り・OS=中央値）。OS値入力0件ならnull。
// aiOf(r)→{alpha,cutLine}。_elOsSectionV2の帯別集計と同一ルール＝銘柄別記録/取引テーブルの損益計算基準に一致。2026-06-15。
function _elPeriodStatsV2(recs, aiOf) {
  var osv = [], cnt = 0, reach = 0, ok = 0, ng = 0, planSum = 0, planCnt = 0, h1Sum = 0, h1Cnt = 0, h2Sum = 0, h2Cnt = 0, stop = 0, soft = 0, draw = 0, realSum = 0, realCnt = 0;
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s || s.osVal == null || s.osVal === "") return;
    var nv = Number(s.osVal); if (!isNaN(nv)) osv.push(nv);
    cnt++;
    if (s.realizedPnl != null && s.realizedPnl !== "") { var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign); if (rv != null) { realSum += rv; realCnt++; } }
    var ai = aiOf(r);
    if (_epReachedAt(s, ai.alpha)) reach++;
    var rr = _epResolve(s, ai.alpha);
    if (rr && rr.judge === "ok") {
      var res = _elDynResult(s, ai.alpha, ai.cutLine); if (res === "ok") ok++; else if (res === "ng") ng++; else if (res === "draw") draw++;
      var pv = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pv != null) { planSum += pv; planCnt++; }
      var h1 = _elHold1TotParts(s, ai.alpha, ai.cutLine); if (h1 && h1.main != null) { h1Sum += h1.main; h1Cnt++; }
      var h2 = _elHold2TotParts(s, ai.alpha, ai.cutLine); if (h2 && h2.main != null) { h2Sum += h2.main; h2Cnt++; }
      var isStop = _elPlanIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop2(s, ai.alpha, ai.cutLine);
      if (isStop) stop++; else if (res === "ng") soft++;
    }
  });
  if (!cnt) return null;
  return { n: cnt, osMed: _elMedian(osv), osMean: _elMean(osv), reach: reach, cnt: cnt, ok: ok, ng: ng,
    planAvg: planCnt ? Math.round(planSum / planCnt) : null, planSum: planSum, planCnt: planCnt,
    h1Avg: h1Cnt ? Math.round(h1Sum / h1Cnt) : null, h1Sum: h1Sum, h1Cnt: h1Cnt,
    h2Avg: h2Cnt ? Math.round(h2Sum / h2Cnt) : null, h2Sum: h2Sum, h2Cnt: h2Cnt,
    realAvg: realCnt ? Math.round(realSum / realCnt) : null, realSum: realSum, realCnt: realCnt,
    stop: stop, soft: soft, draw: draw };
}
// 日別ページ用「比較データ」: 指定銘柄の「本日／今週／今月／全期間」を data.charts から集めて記録系フル指標を比較表示（採用α基準）。
// 本日列は全期間比で↑↓色付け（↑赤=良い方向／↓緑=悪い方向・推奨基本αは▲▼で高低のみ）。全期間にv2記録なし or 本日に記録なしなら非表示。2026-06-15→2026-06-21刷新（今月追加・推奨基本α/実現損益追加・損益は平均＋合計併記）。
function _elDayStockBenchV2(_ref) {
  var data = _ref.data, date = _ref.date, stock = _ref.stock;
  var charts = (data && data.charts) || {};
  var _pad = function(n) { return ("0" + n).slice(-2); };
  var _ymd = function(d) { return d.getFullYear() + "-" + _pad(d.getMonth() + 1) + "-" + _pad(d.getDate()); };
  var _d0 = new Date(date + "T00:00:00");
  var _dow = _d0.getDay();
  var _mon = new Date(_d0.getTime()); _mon.setDate(_d0.getDate() - ((_dow + 6) % 7));
  var _fri = new Date(_mon.getTime()); _fri.setDate(_mon.getDate() + 4);
  var wkS = _ymd(_mon), wkE = _ymd(_fri);
  var ym = date.slice(0, 7);
  var collect = function(pred) {
    var out = [];
    Object.keys(charts).forEach(function(k) {
      var idx = k.lastIndexOf("_"); if (idx < 0) return;
      var stk = k.slice(0, idx), dt = k.slice(idx + 1);
      if (stk !== stock || !pred(dt)) return;
      var c = charts[k];
      (Array.isArray(c.signals) ? c.signals : []).forEach(function(sig) {
        var s = _compatSignal(sig); if (!_epIsV2(s) || !_elInclTotal(s)) return;
        out.push({ stock: stk, date: dt, signal: s });
      });
    });
    return out;
  };
  var aiOf = function(r) { return _elAlphaInfo(r, data); };
  var recsAll = collect(function() { return true; });
  var recsDay = collect(function(dt) { return dt === date; });
  if (!recsAll.length) return null;   // その日に記録が無くても、過去データがあれば表示（本日列は「—」）2026-06-21
  var mk = function(recs) {
    var st = _elPeriodStatsV2(recs, aiOf);
    if (!st) return null;
    var ba = _elBaseAlphaPick(recs, aiOf);            // 推奨基本α（合成スコア・単一）
    st.baseAlpha = (ba && ba.alpha != null && ba.status !== "none") ? ba.alpha : null;
    return st;
  };
  var P = { day: mk(recsDay), wk: mk(collect(function(dt) { return dt >= wkS && dt <= wkE; })), mo: mk(collect(function(dt) { return dt.slice(0, 7) === ym; })), all: mk(recsAll) };
  if (!P.all) return null;   // P.day（本日分）は無くてもよい＝本日列は空表示 2026-06-21

  var dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
  var pct = function(num, den) { return den ? (Math.round(num / den * 100) + "%") : dash; };
  var osNode2 = function(med, mean) { if (med == null) return dash; return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, React.createElement("span", { style: { fontWeight: 700, color: _vcol(med, true) } }, "中央" + med + "円"), mean != null ? React.createElement("span", { style: { fontSize: 9, color: "#888" } }, "平均" + mean + "円") : null); };
  var pnlMT = function(avg, sum, cnt) {
    if (!cnt) return dash;
    return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
      React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(avg) } }, _elPnlFmt(avg)),
      React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, "計" + (sum > 0 ? "+" : "") + Math.round(sum).toLocaleString()));
  };
  var METRICS = [
    { key: "n", label: "件数", cell: function(st) { return st.n + "件"; }, dir: null, num: null },
    { key: "os", label: "OS値(中央)", cell: function(st) { return osNode2(st.osMed, st.osMean); }, dir: "up", num: function(st) { return st.osMed; } },
    { key: "base", label: "推奨基本α", cell: function(st) { return st.baseAlpha == null ? React.createElement("span", { style: { fontSize: 10, color: "#aaa" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, st.baseAlpha + "円"); }, dir: null, num: function(st) { return st.baseAlpha; } },
    { key: "reach", label: "E到達率", cell: function(st) { return pct(st.reach, st.cnt); }, dir: "up", num: function(st) { return st.cnt ? st.reach / st.cnt : null; } },
    { key: "stop", label: "損切り率", cell: function(st) { return pct(st.stop, st.ok + st.ng + st.draw); }, dir: "down", num: function(st) { var d = st.ok + st.ng + st.draw; return d ? st.stop / d : null; } },
    { key: "win", label: "E後の勝率", cell: function(st) { return pct(st.ok, st.ok + st.ng + st.draw); }, dir: "up", num: function(st) { var d = st.ok + st.ng + st.draw; return d ? st.ok / d : null; } },
    { key: "ep", label: "EP損益", cell: function(st) { return pnlMT(st.planAvg, st.planSum, st.planCnt); }, dir: "up", num: function(st) { return st.planAvg; } },
    { key: "h1", label: "H1損益", cell: function(st) { return pnlMT(st.h1Avg, st.h1Sum, st.h1Cnt); }, dir: "up", num: function(st) { return st.h1Avg; } },
    { key: "h2", label: "H2損益", cell: function(st) { return pnlMT(st.h2Avg, st.h2Sum, st.h2Cnt); }, dir: "up", num: function(st) { return st.h2Avg; } },
    { key: "real", label: "実現損益", cell: function(st) { return pnlMT(st.realAvg, st.realSum, st.realCnt); }, dir: "up", num: function(st) { return st.realAvg; } }
  ];
  var EPS = { os: 0.5, base: 0.5, reach: 0.03, stop: 0.03, win: 0.03, ep: 50, h1: 50, h2: 50, real: 50 };
  var dayMark = function(m) {
    if (!m.num) return null;
    var dv = P.day ? m.num(P.day) : null, av = m.num(P.all);
    if (dv == null || av == null) return null;
    var diff = dv - av;
    if (Math.abs(diff) <= (EPS[m.key] || 0)) return null;
    var up = diff > 0;
    if (!m.dir) return React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", fontWeight: 700, marginLeft: 3 } }, up ? "▲" : "▼");
    var fav = (m.dir === "up") ? up : !up;
    return React.createElement("span", { style: { fontSize: 10, color: fav ? "#C0392B" : "#1E8449", fontWeight: 800, marginLeft: 3 } }, up ? "↑" : "↓");
  };
  var cellSafe = function(m, st) { return st ? m.cell(st) : dash; };
  var rows = METRICS.map(function(m) {
    return React.createElement("tr", { key: m.key },
      _elv2Td(m.label, { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#555" }),
      _elv2Td(React.createElement("span", { style: { display: "inline-flex", alignItems: "center" } }, cellSafe(m, P.day), dayMark(m)), { background: "#FFFBF5" }),
      _elv2Td(cellSafe(m, P.wk)),
      _elv2Td(cellSafe(m, P.mo)),
      _elv2Td(cellSafe(m, P.all)));
  });
  var table = _elv2Table(["指標", "本日", "今週", "今月", "全期間"], rows);
  var items = [];
  if (P.day && P.day.osMed != null && P.all.osMed != null) {
    items.push(React.createElement("span", null, "本日のOS中央値は", _elInsightEmV2(P.day.osMed + "円"), "（全期間", _elInsightEmV2(P.all.osMed + "円"), "）＝", _elInsightEmV2(P.day.osMed > P.all.osMed ? "初動が強め" : P.day.osMed < P.all.osMed ? "初動が弱め" : "同程度", P.day.osMed > P.all.osMed ? "#C0392B" : P.day.osMed < P.all.osMed ? "#1E8449" : "#888"), "。"));
  }
  if (P.day && P.day.baseAlpha != null && P.all.baseAlpha != null) {
    items.push(React.createElement("span", null, "推奨基本αは 本日", _elInsightEmV2(P.day.baseAlpha + "円"), (P.mo && P.mo.baseAlpha != null ? React.createElement("span", null, "／今月", _elInsightEmV2(P.mo.baseAlpha + "円")) : null), "／全期間", _elInsightEmV2(P.all.baseAlpha + "円"), "。"));
  }
  if (P.day && (P.day.ok + P.day.ng + P.day.draw)) {
    var dDen = P.day.ok + P.day.ng + P.day.draw, aDen = P.all.ok + P.all.ng + P.all.draw;
    var dStop = Math.round(P.day.stop / dDen * 100), aStop = aDen ? Math.round(P.all.stop / aDen * 100) : 0;
    items.push(React.createElement("span", null, "損切り率は 本日", _elInsightEmV2(dStop + "%"), "（全期間", _elInsightEmV2(aStop + "%"), "）＝", _elInsightEmV2(dStop < aStop ? "本日は少なめ" : dStop > aStop ? "本日は多め" : "同程度", dStop < aStop ? "#C0392B" : dStop > aStop ? "#1E8449" : "#888"), "。"));
  }
  var insight = items.length ? _elInsightBoxV2(items, { note: "本日列の↑↓は全期間比（↑赤=良い方向／↓緑=悪い方向・推奨基本αは▲▼で高低のみ）。OS=中央値・損益=平均（計＝合計・E成立分）・採用α基準。件数 本日" + (P.day ? P.day.n : 0) + "／今週" + (P.wk ? P.wk.n : 0) + "／今月" + (P.mo ? P.mo.n : 0) + "／全期間" + P.all.n + "件。" }) : null;
  var idealB = _elIdealAlphaV2(recsAll, function(r) { return aiOf(r).cutLine; });
  var pctlB = _elOsPctlV2(recsAll);
  var _aPill = function(v) { return v == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, v + "円"); };
  var deepBlock = React.createElement("div", { style: { marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "理想α・到達率別α（全期間）"),
    React.createElement("div", { style: { fontSize: 11, color: "#555", display: "flex", flexWrap: "wrap", gap: "2px 14px" } },
      React.createElement("span", null, "理想α（0〜50で最大化） EP ", _aPill(idealB.ep.maxA), " ／ H1 ", _aPill(idealB.h1.maxA), " ／ H2 ", _aPill(idealB.h2.maxA)),
      React.createElement("span", null, "到達率別α 70%→", _aPill(pctlB ? pctlB.a70 : null), " ／ 80%→", _aPill(pctlB ? pctlB.a80 : null))),
    React.createElement("div", { style: { fontSize: 8, color: "#aaa", marginTop: 2 } }, "理想α＝EP/H1/H2損益の合計が最大になるα（行ごとの個別αボタンと同基準）。到達率別α＝OS値分位からの目安（a70＝7割の足で到達）。"));
  var trendBlock = React.createElement("div", { style: { marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "📈 推奨基本α 期間推移"),
    React.createElement(_elBaseAlphaTrendV2, { recs: recsAll, aiOf: aiOf }));
  return React.createElement("div", { style: { background: "#fff", border: "1px solid #e8e5de", borderRadius: 8, padding: "10px 12px", marginTop: 10 } },
    React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📊 " + stock + "：α比較・深掘り"),
    React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginBottom: 6 } }, "本日 / 今週 / 今月 / 全期間 ＋ 理想α・到達率別α・推奨基本αの期間推移（この銘柄・v2記録・採用α基準）"),
    table, insight, deepBlock, trendBlock);
}

// 損切りの上振れ・損切り値シミュ（記録帳・深掘りタブ／2026-06-18）: 損切りになった記録について、
// 損切りライン(α＋損切り値)から最高値がさらに何円上か（超過幅）を1円ブロックで集計し、「損切りせず保有し続けた着地」
// 「最良手仕舞い」だったら何円だったかを併記。損切りが早すぎないかを検証する。aiOf(r)→{alpha,cutLine}。
//   超過幅 = _elHoldMaxHigh(s).all − α − cutLine（損切りラインを超えて伸びた円・水準線比）。
//   損切り損失 = _epHoldLadder(s,α,cut).finalPnl（損切りラインで止めた損益・深掘り「最適ホールド本数」と同基準）。
//   保有なら = _epHoldLadder(s,α,BIG).finalPnl（損切り無効で最後の足まで保有）、ベスト = .maxPnl（損切り後の最良手仕舞い）。
function _elStopOvershootSectionV2(recs, aiOf) {
  var BIG = 99999;
  var rows = [];
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s || !_epIsV2(s)) return;
    var ai = aiOf(r), a = ai.alpha, cut = (ai.cutLine != null ? ai.cutLine : 10);
    if (a == null) return;
    if (_elRealizedOutcome(s, a, cut) !== "stop") return;
    var mh = _elHoldMaxHigh(s).all;
    if (mh == null) return;
    var Lc = _epHoldLadder(s, a, cut), Lb = _epHoldLadder(s, a, BIG);
    if (!Lc || !Lb) return;
    var over = Math.round((mh - a - cut) * 10) / 10; if (over < 0) over = 0;
    var idc = _elIdealCut(s, a);
    rows.push({
      r: r, s: s, a: a, cut: cut, over: over,
      actual: Lc.finalPnl, held: Lb.finalPnl, best: Lb.maxPnl,
      avoidCut: (!_elHoldIsStop(s, a, idc) ? idc : null)
    });
  });
  if (!rows.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "損切りになった記録（EP起算v2）がありません");

  var overArr = rows.map(function(o) { return o.over; });
  var actualArr = rows.map(function(o) { return o.actual; }).filter(function(v) { return v != null; });
  var heldBase = rows.filter(function(o) { return o.held != null; });
  var profitable = heldBase.filter(function(o) { return o.held > 0; }).length;
  var cards = _elv2CardRow([
    _elv2Card("損切り記録", rows.length + "件", "#9A3412", "実現結果=損切り"),
    _elv2Card("損切り値からの超過幅", "平均" + _elMean(overArr) + " / 中央" + _elMedian(overArr) + "円", "#555", "ラインを超えて伸びた幅"),
    _elv2Card("損切り損失(平均)", _elPnlFmt(actualArr.length ? Math.round(_elMean(actualArr)) : null), _elPnlColor(actualArr.length ? _elMean(actualArr) : null), rows.length + "件"),
    _elv2Card("保有なら利益化", heldBase.length ? Math.round(profitable / heldBase.length * 100) + "%" : "—", heldBase.length && profitable / heldBase.length >= 0.5 ? "#B45309" : "#1E8449", heldBase.length ? profitable + "/" + heldBase.length + "件が保有で利益" : "—")
  ]);

  // 超過幅分布（1円ブロック: 0/1/2/3/4/5円以上）
  var BK = ["0", "1", "2", "3", "4", "5+"];
  var byB = {}; BK.forEach(function(k) { byB[k] = { cnt: 0, aArr: [], hArr: [], bArr: [], iArr: [] }; });
  rows.forEach(function(o) {
    var fk = Math.floor(o.over); var k = fk >= 5 ? "5+" : String(fk);
    var b = byB[k]; b.cnt++;
    if (o.actual != null) b.aArr.push(o.actual);
    if (o.held != null) b.hArr.push(o.held);
    if (o.best != null) b.bArr.push(o.best);
    if (o.held != null && o.actual != null) b.iArr.push(o.held - o.actual);
  });
  var _mc = function(arr) { return arr.length ? React.createElement("span", { style: { color: _elPnlColor(_elMean(arr)) } }, _elPnlFmt(Math.round(_elMean(arr)))) : React.createElement("span", { style: { color: "#ccc" } }, "—"); };
  var bRows = BK.filter(function(k) { return byB[k].cnt; }).map(function(k) {
    var b = byB[k];
    return React.createElement("tr", { key: k },
      _elv2Td(React.createElement("b", null, k === "5+" ? "5円以上" : (k + "円超")), { textAlign: "left", paddingLeft: 8, color: "#9A3412" }),
      _elv2Td(b.cnt + "件", { fontWeight: 700 }),
      _elv2Td(_mc(b.aArr)),
      _elv2Td(_mc(b.hArr)),
      _elv2Td(_mc(b.bArr)),
      _elv2Td(b.iArr.length ? React.createElement("b", { style: { color: _elPnlColor(_elMean(b.iArr)) } }, _elPnlFmt(Math.round(_elMean(b.iArr)))) : React.createElement("span", { style: { color: "#ccc" } }, "—")));
  });
  var distTable = React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "6px 0 0" } }, "損切り値からの超過幅 × 損益（1円ブロック）"),
    _elv2Table(["損切り値から", "件数", "損切り損失", "保有なら", "ベスト手仕舞い", "改善額"], bRows));

  // 個別一覧（超過幅の小さい順＝損切りが早すぎた疑い順）
  var _dow = function(ds) { var p = ds.split("-"); return ["日", "月", "火", "水", "木", "金", "土"][new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; };
  var listed = rows.slice().sort(function(a, b) { return (a.over - b.over) || (a.r.date < b.r.date ? 1 : -1); });
  var listTable = React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "8px 0 0" } }, "損切り記録の一覧（超過幅の小さい順＝損切りが早すぎた疑い順・" + rows.length + "件）"),
    _elv2Table(["日付", "銘柄/シグナル", "α/損切値", "超過", "損切損失", "保有なら", "ベスト"], listed.map(function(o, i) {
      return React.createElement("tr", { key: i },
        _elv2Td(o.r.date.slice(5) + "(" + _dow(o.r.date) + ")", { textAlign: "left", paddingLeft: 8, whiteSpace: "nowrap" }),
        _elv2Td(React.createElement("span", null, React.createElement("b", { style: { color: "#9A3412" } }, o.r.stock), React.createElement("span", { style: { color: "#999", fontSize: 9, marginLeft: 4 } }, _elTagLabel(o.s))), { textAlign: "left" }),
        _elv2Td(o.a + "/" + o.cut + "円", { fontSize: 10, color: "#666" }),
        _elv2Td(React.createElement("b", { style: { color: o.over <= 1 ? "#C0392B" : "#555" } }, "+" + o.over + "円")),
        _elv2Td(React.createElement("span", { style: { color: _elPnlColor(o.actual) } }, _elPnlFmt(o.actual))),
        _elv2Td(React.createElement("b", { style: { color: _elPnlColor(o.held) } }, _elPnlFmt(o.held))),
        _elv2Td(React.createElement("span", { style: { color: _elPnlColor(o.best) } }, _elPnlFmt(o.best))));
    })));

  // 読み取り
  var small = rows.filter(function(o) { return o.over <= 1; });
  var smallHeld = small.filter(function(o) { return o.held != null; });
  var smallProfit = smallHeld.filter(function(o) { return o.held > 0; }).length;
  var avoidN = rows.filter(function(o) { return o.avoidCut != null; }).length;
  var items = [];
  items.push(React.createElement("span", null, "損切り", _elInsightEmV2(rows.length + "件"), "の損切り値からの超過幅は平均", _elInsightEmV2(_elMean(overArr) + "円"), "・中央", _elInsightEmV2(_elMedian(overArr) + "円"), "＝損切りライン到達後にさらにこれだけ伸びてから反転/継続している。"));
  if (small.length) items.push(React.createElement("span", null, "超過1円以下（損切りラインをほんの少し超えただけ）が", _elInsightEmV2(small.length + "件"), smallHeld.length ? React.createElement("span", null, "。うち保有していれば利益化したのは", _elInsightEmV2(smallProfit + "/" + smallHeld.length + "件"), "＝", (smallHeld.length && smallProfit / smallHeld.length >= 0.5 ? _elInsightEmV2("損切りが早すぎた可能性大", "#B45309") : "損切りは概ね妥当"), "。") : "。"));
  if (heldBase.length) items.push(React.createElement("span", null, "損切りした記録を全て損切りせず最後まで保有していたら、利益化したのは", _elInsightEmV2(profitable + "/" + heldBase.length + "件", profitable / heldBase.length >= 0.5 ? "#B45309" : "#1E8449"), "＝", (profitable / heldBase.length >= 0.5 ? "損切りを我慢する方が良かった場面が多い" : "損切りは機能している（保有しても損が増える方が多い）"), "。"));
  if (avoidN) items.push(React.createElement("span", null, "損切り値を", _elInsightEmV2("15〜20円"), "に上げていれば損切りを回避できたのは", _elInsightEmV2(avoidN + "件"), "。"));
  return React.createElement("div", null, cards, distTable, listTable, _elInsightBoxV2(items, { note: "対象＝実現結果が「損切り」のEP起算(v2)記録。超過幅＝最高値(水準線比)−(α＋損切り値)。損切り損失＝損切りラインで止めた損益(_epHoldLadder・採用α基準・100株換算)。保有なら＝損切りせず最後の足まで保有した損益(finalPnl)、ベスト＝損切り後の各足で最も良い手仕舞い(maxPnl)。改善額＝保有なら−損切り損失。損益色は赤=利益/緑=損失。" }));
}

// 最適ホールド本数（記録帳・深掘りタブ／2026-06-14）: EPから+0/+1/+2本…と持ち続けた場合の深さ別の平均損益・損切り率・EP比改善率を集計し、
// 全期間で最も期待値の高い手仕舞い本数を示す。_epHoldLadder（E成立分のみ・採用α/損切り基準）を深さ別に転置集計。aiOf(r)→{alpha,cutLine}。
function _elHoldDepthSectionV2(recs, aiOf) {
  var ladders = [];
  (recs || []).forEach(function(r) { var ai = aiOf(r); var L = _epHoldLadder(r.signal, ai.alpha, ai.cutLine); if (L && L.items && L.items.length) ladders.push(L); });
  if (!ladders.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "E成立（取引可能）の記録がありません");
  var maxD = 0; ladders.forEach(function(L) { L.items.forEach(function(it) { if (it.depth > maxD) maxD = it.depth; }); });
  var rows = [];
  for (var d = 0; d <= maxD; d++) {
    var cnt = 0, sum = 0, pnlCnt = 0, pnlArr = [], stop = 0, imp = 0, impBase = 0;
    ladders.forEach(function(L) {
      var it = null; for (var i = 0; i < L.items.length; i++) { if (L.items[i].depth === d) { it = L.items[i]; break; } }
      if (!it) return; cnt++;
      if (it.pnl != null) { sum += it.pnl; pnlCnt++; pnlArr.push(it.pnl); }
      if (L.stopDepth >= 0 && L.stopDepth <= d) stop++;
      if (d >= 1) { var ep = L.items[0]; if (ep && ep.pnl != null && it.pnl != null) { impBase++; if (it.pnl > ep.pnl) imp++; } }
    });
    rows.push({ d: d, cnt: cnt, sum: sum, pnlCnt: pnlCnt, pnlArr: pnlArr, avg: pnlCnt ? Math.round(sum / pnlCnt) : null, stop: stop, imp: imp, impBase: impBase });
  }
  var best = -1, bestV = -Infinity; rows.forEach(function(o) { if (o.pnlCnt > 0 && o.avg != null && o.avg > bestV) { bestV = o.avg; best = o.d; } });
  var _dl = function(d) { return d === 0 ? "EP（即手仕舞い）" : d === 1 ? "＋1本（H1）" : d === 2 ? "＋2本（H2）" : "＋" + d + "本"; };
  var body = rows.map(function(o) {
    var star = o.d === best;
    return React.createElement("tr", { key: o.d, style: star ? { background: "#FEF3C7" } : null },
      _elv2Td(React.createElement("span", null, _dl(o.d), star ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 4, fontWeight: 800 } }, "★平均最大") : null), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _elv2Td(o.cnt + "件", { fontWeight: 700 }),
      _elv2Td(o.avg != null ? React.createElement("b", { style: { color: _elPnlColor(o.avg) } }, _elPnlFmt(o.avg)) : "—"),
      _elv2Td(o.pnlCnt ? React.createElement("span", { style: { fontSize: 10, color: _elPnlColor(o.sum) } }, _elPnlFmt(o.sum)) : "—"),
      _elv2Td(o.cnt ? Math.round(o.stop / o.cnt * 100) + "%" : "—", { color: o.stop ? "#1E8449" : "#bbb", fontWeight: o.stop ? 700 : 400 }),
      _elv2Td(o.d === 0 ? React.createElement("span", { style: { color: "#ccc" } }, "—") : (o.impBase ? _elv2Rate(o.imp, o.impBase) : "—")));
  });
  var items = [], ep0 = rows[0];
  if (best >= 0) items.push(React.createElement("span", null, "1件あたりの平均損益が最大になる手仕舞いは", _elInsightEmV2(_dl(best)), "（平均", _elInsightEmV2(_elPnlFmt(bestV)), "）", best === 0 ? "＝EPで即手仕舞いが最も効率的（伸ばすほど平均は悪化する傾向）。" : "＝EPからもう少し伸ばす価値がある。"));
  if (ep0 && ep0.avg != null && best > 0) { var bd = rows[best]; items.push(React.createElement("span", null, "EP即手仕舞い（平均", _elInsightEmV2(_elPnlFmt(ep0.avg)), "）に対し", _dl(best), "まで持つと平均", _elInsightEmV2(_elPnlFmt(bd.avg)), "＝", _elInsightEmV2((bd.avg - ep0.avg >= 0 ? "+" : "") + (bd.avg - ep0.avg).toLocaleString() + "円"), "の差。")); }
  var h1r = rows[1];
  if (h1r && h1r.impBase) items.push(React.createElement("span", null, "EPからH1まで持って損益が改善した割合は", _elInsightEmV2(Math.round(h1r.imp / h1r.impBase * 100) + "%"), "。"));
  return React.createElement("div", null,
    _elv2Table(["手仕舞い位置", "件数(到達)", "平均損益", "合計", "損切り率(累積)", "EP比改善率"], body),
    _elInsightBoxV2(items, { note: "各記録をEPからその本数だけ持って手仕舞いした場合の損益（_epHoldLadder・採用α/損切り基準・100株換算）。深い本数はそこまで足がある記録のみの平均＝母数が減る点に注意（合計列も参考に）。損切り率(累積)=その本数までに損切りラインへ到達した割合。EP比改善率=EP即手仕舞いより損益が良くなった割合。★=平均損益が最大の本数。" }));
}

// 期待度キャリブレーション（記録帳・深掘りタブ／2026-06-14）: 事前のH期待 vs 実結果の的中検証。
// H期待○△×：保有の予想と実H1/H2損益の一致。「自分の予想は当たっているか過信か」を測る。aiOf(r)→{alpha,cutLine}。
// α到達予想(◎○△×)の的中検証は見立て廃止に伴い撤去 2026-06-22。
function _elExpCalibSectionV2(recs, aiOf) {
  var v2 = (recs || []).filter(function(r) { return _epIsV2(r.signal); });
  if (!v2.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "v2記録なし");
  // (A) α到達予想（◎○△×）の的中検証は見立て廃止に伴い撤去 2026-06-22。以降は (B) H期待の的中のみ。
  // (B) H期待 ○△× の的中
  var _calc = function(expKey, ptsFn) {
    var g = { "○": _mk(), "△": _mk(), "×": _mk() };
    function _mk() { return { cnt: 0, sum: 0, sumCnt: 0, arr: [], win: 0, dec: 0, stop: 0, hit: 0, hitBase: 0 }; }
    v2.forEach(function(r) {
      var s = r.signal, e = s[expKey]; if (e !== "○" && e !== "△" && e !== "×") return;
      var ai = aiOf(r), rr = _epResolve(s, ai.alpha); if (!rr || rr.judge !== "ok") return;
      var pr = ptsFn(s, ai); if (!pr) return; var pts = pr.pnl; if (pts == null) return;
      var o = g[e]; o.cnt++; o.sum += pts; o.sumCnt++; o.arr.push(pts);
      if (pts > 0) { o.win++; o.dec++; } else if (pts < 0) o.dec++;
      if (pr.stop) o.stop++;
      if (e === "○") { o.hitBase++; if (pts > 0) o.hit++; } else if (e === "×") { o.hitBase++; if (pts <= 0) o.hit++; }
    });
    return g;
  };
  var h1g = _calc("holdExp", function(s, ai) { return { pnl: _elDynHold(s, ai.alpha, ai.cutLine), stop: _elHoldIsStop(s, ai.alpha, ai.cutLine) }; });
  var h2g = _calc("hold2Exp", function(s, ai) { if (!_elHas2Data(s, ai.alpha) || _elH2Miss(s, ai.alpha)) return null; return { pnl: _elDynHold2(s, ai.alpha, ai.cutLine), stop: _elHoldIsStop2(s, ai.alpha, ai.cutLine) }; });
  var _expRows = function(g) {
    return ["○", "△", "×"].filter(function(e) { return g[e].cnt; }).map(function(e) {
      var o = g[e];
      return React.createElement("tr", { key: e },
        _elv2Td(React.createElement("b", { style: { fontSize: 13, color: e === "○" ? "#C0392B" : e === "×" ? "#1E8449" : "#B45309" } }, e), { textAlign: "left", paddingLeft: 8 }),
        _elv2Td(o.cnt + "件", { fontWeight: 700 }),
        _elv2Td(o.sumCnt ? _elPnlMMCell(o.arr) : "—"),
        _elv2Td(o.dec ? _elv2Rate(o.win, o.dec) : React.createElement("span", { style: { color: "#ccc" } }, "—")),
        _elv2Td(o.cnt ? Math.round(o.stop / o.cnt * 100) + "%" : "—", { color: o.stop ? "#1E8449" : "#bbb", fontWeight: o.stop ? 700 : 400 }),
        _elv2Td(o.hitBase ? _elv2Rate(o.hit, o.hitBase) : React.createElement("span", { style: { color: "#ccc" } }, "—")));
    });
  };
  var h1Rows = _expRows(h1g), h2Rows = _expRows(h2g);
  var hHead = ["H期待", "件数", "実損益", "実勝率", "損切り率", "予想的中率"];
  var h1Table = h1Rows.length ? React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "8px 0 0" } }, "H1期待（保有の予想）の的中"), _elv2Table(hHead, h1Rows)) : null;
  var h2Table = h2Rows.length ? React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "8px 0 0" } }, "H2期待（さらに保有）の的中"), _elv2Table(hHead, h2Rows)) : null;
  var items = [];
  var o1 = h1g["○"], x1 = h1g["×"];
  if (o1 && o1.hitBase) items.push(React.createElement("span", null, "H1で○（利益を予想）したうちの実勝率は", _elInsightEmV2(Math.round(o1.hit / o1.hitBase * 100) + "%"), Math.round(o1.hit / o1.hitBase * 100) >= 60 ? "＝予想は概ね妥当。" : "＝", _elInsightEmV2("やや過信ぎみ", "#B45309"), "（○予想でも外す場面が多い）。"));
  if (x1 && x1.hitBase) items.push(React.createElement("span", null, "×（損失を予想）の的中は", _elInsightEmV2(Math.round(x1.hit / x1.hitBase * 100) + "%"), "（予想どおり利益が出なかった割合）。"));
  return React.createElement("div", null, h1Table, h2Table, _elInsightBoxV2(items, { note: "H期待の的中=○なら実H1/H2損益>0、×なら≦0。実損益・損切りは採用α基準・E成立分のみ。" }));
}

// 計画EP vs 実エントリーの乖離（記録帳・深掘りタブ／2026-06-14）: 実エントリー記録について、計画EP高値と実際の建玉OS水準のズレ、
// 計画α(alphaVal)と実取引α(tradeAlpha)の規律遵守を集計。記録だけして未活用だったentryOsVal/exitOsVal/tradeAlphaを活かす。aiOf(r)→{alpha,cutLine}。
function _elExecGapSectionV2(recs, aiOf) {
  var ent = (recs || []).filter(function(r) { return _epIsV2(r.signal) && _elIsEntered(r.signal, r.item); });
  if (!ent.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "実エントリー（取引あり）の記録がありません");
  var aSame = 0, aDiff = 0, aDiffSum = 0, aDiffArr = [], aBase = 0;
  ent.forEach(function(r) { var s = r.signal; if (s.tradeAlpha != null && s.tradeAlpha !== "") { var av = aiOf(r).alpha, ta = Number(s.tradeAlpha); if (av != null && !isNaN(ta)) { aBase++; if (ta === av) aSame++; else { aDiff++; var _ad = Math.abs(ta - av); aDiffSum += _ad; aDiffArr.push(_ad); } } } });
  var gapRows = [], gSum = 0, gCnt = 0, exitSum = 0, exitCnt = 0, exitArr = [];
  ent.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), rr = _epResolve(s, ai.alpha);
    var planEP = (rr && rr.judge === "ok" && rr.ep) ? rr.ep.h : null;
    var eo = (s.entryOsVal != null && s.entryOsVal !== "") ? _elSignedVal(s.entryOsVal, s.entryOsSign) : null;
    var xo = (s.exitOsVal != null && s.exitOsVal !== "") ? _elSignedVal(s.exitOsVal, s.exitOsSign) : null;
    if (xo != null) { exitSum += xo; exitCnt++; exitArr.push(xo); }
    if (planEP != null && eo != null) { var gap = eo - planEP; gSum += gap; gCnt++; gapRows.push({ r: r, s: s, planEP: planEP, eo: eo, gap: gap }); }
  });
  var r1 = function(x) { return Math.round(x * 10) / 10; };
  var cards = _elv2CardRow([
    _elv2Card("実エントリー", ent.length + "件", "#9A3412", "取引ありの記録"),
    _elv2Card("計画αで取引", aBase ? Math.round(aSame / aBase * 100) + "%" : "—", aBase && aSame / aBase >= 0.7 ? "#1E8449" : "#B45309", aBase ? "規律遵守 " + aSame + "/" + aBase + "件" + (aDiff ? "・ズレ平均" + r1(aDiffSum / aDiff) + "/中央" + _elMedian(aDiffArr) + "円" : "") : "tradeAlpha未記録"),
    _elv2Card("建玉ズレ(実−計画EP)", gCnt ? ("平均" + (gSum / gCnt >= 0 ? "+" : "") + r1(gSum / gCnt) + " / 中央" + (function() { var _m = _elMedian(gapRows.map(function(x) { return x.gap; })); return (_m >= 0 ? "+" : "") + _m; })() + "円") : "—", gCnt ? (Math.abs(gSum / gCnt) <= 2 ? "#1E8449" : "#B45309") : "#bbb", gCnt ? gCnt + "件で比較" : "Entry-OS未記録"),
    _elv2Card("実Exit-OS", exitCnt ? ("平均" + r1(exitSum / exitCnt) + " / 中央" + _elMedian(exitArr) + "円") : "—", "#555", exitCnt ? exitCnt + "件" : "Exit-OS未記録")
  ]);
  gapRows.sort(function(a, b) { return Math.abs(b.gap) - Math.abs(a.gap); });
  var top = gapRows.slice(0, 6);
  var _dow = function(ds) { var p = ds.split("-"); return ["日", "月", "火", "水", "木", "金", "土"][new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; };
  var gTable = top.length ? React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "6px 0 0" } }, "計画EPからの乖離が大きい取引"),
    _elv2Table(["日付", "銘柄", "計画EP高値", "実Entry-OS", "ズレ", "取引α/計画α"], top.map(function(o, i) {
      var av = aiOf(o.r).alpha, ta = (o.s.tradeAlpha != null && o.s.tradeAlpha !== "") ? Number(o.s.tradeAlpha) : null;
      return React.createElement("tr", { key: i },
        _elv2Td(o.r.date.slice(5) + "(" + _dow(o.r.date) + ")", { textAlign: "left", paddingLeft: 8 }),
        _elv2Td(o.r.stock, { color: "#9A3412", fontWeight: 700 }),
        _elv2Td(r1(o.planEP) + "円"),
        _elv2Td(r1(o.eo) + "円"),
        _elv2Td(React.createElement("b", { style: { color: Math.abs(o.gap) <= 2 ? "#1E8449" : "#C0392B" } }, (o.gap >= 0 ? "+" : "") + r1(o.gap) + "円")),
        _elv2Td(React.createElement("span", { style: { color: (ta != null && av != null && ta !== av) ? "#C0392B" : "#555", fontWeight: (ta != null && av != null && ta !== av) ? 700 : 400 } }, (ta != null ? ta : "—") + " / " + (av != null ? av : "—")), {}));
    }))) : null;
  var items = [];
  if (gCnt) items.push(React.createElement("span", null, "実際の建玉OS水準は計画EP高値に対し平均", _elInsightEmV2((gSum / gCnt >= 0 ? "+" : "") + r1(gSum / gCnt) + "円"), gSum / gCnt > 1 ? "＝計画より深い位置で建てている（やや待ちすぎ/追いかけ気味）。" : gSum / gCnt < -1 ? "＝計画より浅い位置で建てている（早めの執行）。" : "＝計画どおりの位置で執行できている。"));
  if (aBase) items.push(React.createElement("span", null, "計画αどおりに取引できた割合（規律遵守率）は", _elInsightEmV2(Math.round(aSame / aBase * 100) + "%"), aDiff ? React.createElement("span", null, "（ズレた" + aDiff + "件は平均", _elInsightEmV2(r1(aDiffSum / aDiff) + "円"), "違う）") : null, "。"));
  if (!gCnt && !aBase) items.push(React.createElement("span", null, "実エントリーのEntry-OS値・取引αが記録されていないため乖離を集計できません。実エントリー欄に建玉/決済のOS水準と取引αを入れると、計画と執行のズレを検証できます。"));
  return React.createElement("div", null, cards, gTable, _elInsightBoxV2(items, { note: "計画EP高値＝採用αで解決したEP足の高値（水準線比）。実Entry-OS/Exit-OS＝実エントリー欄の建玉・決済OS水準。規律遵守＝取引α(tradeAlpha)が計画α(alphaVal/予想OS度α)と一致。符号は水準線比（↑正/↓負）。" }));
}

// メモ×成績（記録帳・深掘りタブ／2026-06-14）: 根拠/反省/H1/H2メモを書いた記録と書かない記録で成績を比較し、
// 負けた記録のメモに頻出するキーワード（敗因）を抽出。死蔵していた自由記述メモを学習ループに還元する。aiOf(r)→{alpha,cutLine}。
var _EL_MEMO_KW = ["損切り", "損切", "早", "遅", "我慢", "利確", "利食い", "伸ば", "戻", "反発", "飛びつ", "焦", "ルール", "待", "逆行", "ナンピン", "握", "欲", "高値", "ダマシ", "急落", "急騰", "板", "出来高", "寄り", "引け", "下げ", "上げ", "様子見", "見送"];
function _elMemoPerfSectionV2(recs, aiOf) {
  var v2 = (recs || []).filter(function(r) { return _epIsV2(r.signal); });
  if (!v2.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "v2記録なし");
  var _memoText = function(s) { return [s.rationale, s.reflection, s.holdMemo, s.hold2Memo].map(function(t) { return stripHtml(t || ""); }).join(" "); };
  var _has = function(s) { return _hasText(s.rationale) || _hasText(s.reflection) || _hasText(s.holdMemo) || _hasText(s.hold2Memo); };
  var mk = function() { return { cnt: 0, plan: 0, planCnt: 0, planArr: [], win: 0, dec: 0, h1: 0, h1Cnt: 0, h1Arr: [], stop: 0, soft: 0, draw: 0, realWin: 0, realDec: 0, chars: 0 }; };
  var grp = { yes: mk(), no: mk() };
  v2.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), g = _has(s) ? grp.yes : grp.no; g.cnt++; g.chars += _memoText(s).replace(/\s/g, "").length;
    var rr = _epResolve(s, ai.alpha);
    if (rr && rr.judge === "ok") {
      var isStop = _elPlanIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop2(s, ai.alpha, ai.cutLine);
      var pv = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pv != null) { g.plan += pv; g.planCnt++; g.planArr.push(pv); if (pv > 0) { g.win++; g.dec++; } else if (pv < 0) { g.dec++; if (!isStop) g.soft++; } else { g.draw++; } }
      var h1 = _elHold1TotParts(s, ai.alpha, ai.cutLine); if (h1.main != null) { g.h1 += h1.main; g.h1Cnt++; g.h1Arr.push(h1.main); }
      if (isStop) g.stop++;
    }
    if (_elIsEntered(s, r.item)) { var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign); if (rv != null) { if (rv > 0) { g.realWin++; g.realDec++; } else if (rv < 0) g.realDec++; } }
  });
  var _row = function(label, g) {
    return React.createElement("tr", { key: label },
      _elv2Td(label, { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _elv2Td(g.cnt + "件", { fontWeight: 700 }),
      _elv2Td(_elEwinCell(g.win, g.dec - g.win, g.draw)),
      _elv2Td(_elPnlMMCell(g.planArr)),
      _elv2Td(_elPnlMMCell(g.h1Arr)),
      _elv2Td((g.dec + g.draw) ? Math.round(g.soft / (g.dec + g.draw) * 100) + "%" : "—", { color: g.soft ? "#B45309" : "#bbb", fontWeight: g.soft ? 700 : 400 }),
      _elv2Td((g.dec + g.draw) ? Math.round(g.stop / (g.dec + g.draw) * 100) + "%" : "—", { color: g.stop ? "#1E8449" : "#bbb", fontWeight: g.stop ? 700 : 400 }),
      _elv2Td(g.realDec ? _elv2Rate(g.realWin, g.realDec) : React.createElement("span", { style: { color: "#ccc" } }, "—")));
  };
  var tot = grp.yes.cnt + grp.no.cnt;
  var memoTable = _elv2Table(["メモ", "件数", "勝率(EP)", "EP損益", "H1損益", "見切り率", "損切り率", "実現勝率"], [_row("メモ有", grp.yes), _row("メモ無", grp.no)]);
  // 敗因キーワード
  var kwCnt = {}, lossN = 0;
  v2.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), rr = _epResolve(s, ai.alpha), lost = false;
    if (rr && rr.judge === "ok") { var pv = _elDynPlanned(s, ai.alpha, ai.cutLine); if (_elPlanIsStop(s, ai.alpha, ai.cutLine) || _elHoldIsStop(s, ai.alpha, ai.cutLine) || (pv != null && pv < 0)) lost = true; }
    if (_elIsEntered(s, r.item)) { var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign); if (rv != null && rv < 0) lost = true; }
    if (!lost || !_has(s)) return; lossN++;
    var txt = _memoText(s); _EL_MEMO_KW.forEach(function(kw) { if (txt.indexOf(kw) >= 0) kwCnt[kw] = (kwCnt[kw] || 0) + 1; });
  });
  var kwTop = Object.keys(kwCnt).map(function(k) { return { k: k, n: kwCnt[k] }; }).sort(function(a, b) { return b.n - a.n; }).slice(0, 8);
  var kwBox = React.createElement("div", { style: { margin: "8px 0 0" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", marginBottom: 4 } }, "負けた記録のメモ頻出キーワード（敗因の手がかり・" + lossN + "件中）"),
    kwTop.length ? React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, kwTop.map(function(o) {
      return React.createElement("span", { key: o.k, style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#7c2d12", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 12, padding: "2px 9px" } }, o.k, React.createElement("span", { style: { fontSize: 9, color: "#B45309" } }, o.n));
    })) : React.createElement("div", { style: { fontSize: 11, color: "#bbb" } }, lossN ? "該当キーワードなし" : "負け記録のメモがありません"));
  var items = [];
  var yR = grp.yes.dec ? grp.yes.win / grp.yes.dec : null, nR = grp.no.dec ? grp.no.win / grp.no.dec : null;
  items.push(React.createElement("span", null, "メモ記入率は", _elInsightEmV2(tot ? Math.round(grp.yes.cnt / tot * 100) + "%" : "—"), "（" + grp.yes.cnt + "/" + tot + "件・平均" + (grp.yes.cnt ? Math.round(grp.yes.chars / grp.yes.cnt) : 0) + "字）。"));
  if (yR != null && nR != null) { var dp = Math.round((yR - nR) * 100); items.push(React.createElement("span", null, "メモ有の勝率は", _elInsightEmV2(Math.round(yR * 100) + "%"), "・メモ無は", _elInsightEmV2(Math.round(nR * 100) + "%"), "＝", _elInsightEmV2((dp >= 0 ? "+" : "") + dp + "pt"), dp >= 5 ? "。根拠を言語化した時ほど勝てている傾向。" : dp <= -5 ? "。メモ有でも勝てておらず内容の見直し余地。" : "。差は小さい。")); }
  if (kwTop.length) items.push(React.createElement("span", null, "負け記録のメモで最も多い語は", _elInsightEmV2("「" + kwTop[0].k + "」"), "（" + kwTop[0].n + "件）＝", _elInsightEmV2("繰り返している敗因の候補"), "。"));
  return React.createElement("div", null, memoTable, kwBox, _elInsightBoxV2(items, { note: "メモ＝根拠/反省/H1/H2メモのいずれかに記入あり。勝率(EP)=EP損益>0の割合・実現勝率=実エントリーの実現損益>0の割合。敗因キーワードは登録した語の単純出現数（簡易・採用α基準）。" }));
}

// 連勝連敗・最大ドローダウン（記録帳・集計タブ／2026-06-14）: 時系列でのストリークと最大DDを数値化。
// 実現損益（実トレード）を主軸に、EP損益（理論）のDDも併記。損切り回避志向のための損失管理指標。aiOf(r)→{alpha,cutLine}。
function _elStreakDDSectionV2(recs, aiOf) {
  var v2 = (recs || []).filter(function(r) { return _epIsV2(r.signal); });
  if (v2.length < 2) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "記録が2件以上で表示されます");
  var sorted = v2.slice().sort(function(a, b) { return ((a.date || "") + (a.signal.time || "")).localeCompare((b.date || "") + (b.signal.time || "")); });
  function _ddOf(seq) {
    var cum = 0, peak = 0, maxdd = 0, from = null, to = null, peakDate = null;
    seq.forEach(function(o) { cum += o.pnl; if (cum > peak) { peak = cum; peakDate = o.date; } var dd = peak - cum; if (dd > maxdd) { maxdd = dd; from = peakDate; to = o.date; } });
    return { dd: maxdd, from: from, to: to, final: cum };
  }
  var realSeq = []; sorted.forEach(function(r) { var s = r.signal; if (_elIsEntered(s, r.item)) { var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign); if (rv != null) realSeq.push({ date: r.date, pnl: rv }); } });
  var maxW = 0, maxL = 0, curW = 0, curL = 0;
  realSeq.forEach(function(o) { if (o.pnl > 0) { curW++; curL = 0; if (curW > maxW) maxW = curW; } else if (o.pnl < 0) { curL++; curW = 0; if (curL > maxL) maxL = curL; } });
  var curStreak = 0, curType = null;
  for (var i = realSeq.length - 1; i >= 0; i--) { var p = realSeq[i].pnl; if (p === 0) continue; if (curType == null) { curType = p > 0 ? "win" : "loss"; curStreak = 1; } else if ((p > 0 && curType === "win") || (p < 0 && curType === "loss")) curStreak++; else break; }
  var ddR = _ddOf(realSeq);
  var epSeq = []; sorted.forEach(function(r) { var s = r.signal, ai = aiOf(r); var pv = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pv != null) epSeq.push({ date: r.date, pnl: pv }); });
  var ddE = _ddOf(epSeq);
  var curTxt = curType ? (curStreak + (curType === "win" ? "連勝中" : "連敗中")) : "—";
  var cards = _elv2CardRow([
    _elv2Card("現在", curTxt, curType === "win" ? "#C0392B" : curType === "loss" ? "#1E8449" : "#888", "実現損益ベース"),
    _elv2Card("最大連勝", maxW ? maxW + "連勝" : "—", "#C0392B", realSeq.length + "トレード中"),
    _elv2Card("最大連敗", maxL ? maxL + "連敗" : "—", "#1E8449", realSeq.length + "トレード中"),
    _elv2Card("最大DD(実現)", ddR.dd ? "−" + Math.round(ddR.dd).toLocaleString() + "円" : (realSeq.length ? "0円" : "—"), ddR.dd ? "#1E8449" : "#bbb", ddR.from ? ddR.from.slice(5) + "〜" + ddR.to.slice(5) : "実現損益の記録待ち"),
    _elv2Card("最大DD(EP損益)", ddE.dd ? "−" + Math.round(ddE.dd).toLocaleString() + "円" : "0円", ddE.dd ? "#1E8449" : "#bbb", ddE.from ? ddE.from.slice(5) + "〜" + ddE.to.slice(5) : "理論値")
  ]);
  var items = [];
  if (maxL >= 3) items.push(React.createElement("span", null, "最大連敗は", _elInsightEmV2(maxL + "回", "#1E8449"), "。連敗時の枚数・ルールの再確認を。"));
  if (ddR.dd) items.push(React.createElement("span", null, "実現損益の最大ドローダウンは", _elInsightEmV2("−" + Math.round(ddR.dd).toLocaleString() + "円", "#1E8449"), "（" + (ddR.from ? ddR.from + "〜" + ddR.to : "") + "）。"));
  else if (epSeq.length && ddE.dd) items.push(React.createElement("span", null, "実トレードのDDは記録待ち。EP損益（理論）の最大DDは", _elInsightEmV2("−" + Math.round(ddE.dd).toLocaleString() + "円", "#1E8449"), "。"));
  if (curType === "loss" && curStreak >= 2) items.push(React.createElement("span", null, "現在", _elInsightEmV2(curStreak + "連敗中", "#1E8449"), "＝無理に取り返さず基準を満たす場面を待つ局面。"));
  return React.createElement("div", null, cards, items.length ? _elInsightBoxV2(items, { note: "連勝連敗・最大DD(実現)は実エントリーの実現損益（記録順）。最大DD(EP損益)は全E成立記録のEP損益累積の山→谷の最大下落（採用α基準）。" }) : null);
}

// 曜日別の成績（記録帳・集計タブ／2026-06-14b）: 月〜金（+土日）別に件数/OS中央値/E到達率/E後の勝率/損切り率/平均EP・H1損益を集計。
// 「どの曜日が成功しやすい／損切りしやすいか」を読む。時間帯別(_elTimeOfDaySectionV2)の曜日版。採用α基準・aiOf(r)→{alpha,cutLine}。
function _elDowSectionV2(recs, aiOf) {
  if (!recs || !recs.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "v2記録なし");
  var _dowIdx = function(ds) { if (!ds) return null; var p = String(ds).split("-"); if (p.length < 3) return null; var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d.getTime()) ? null : d.getDay(); };
  var DEFS = [
    { k: "d1", label: "月", color: "#1D9E75", dow: 1 },
    { k: "d2", label: "火", color: "#378ADD", dow: 2 },
    { k: "d3", label: "水", color: "#7C3AED", dow: 3 },
    { k: "d4", label: "木", color: "#EF9F27", dow: 4 },
    { k: "d5", label: "金", color: "#D85A30", dow: 5 }
  ];
  var mk = function() { return { cnt: 0, osv: [], reach: 0, ok: 0, ng: 0, draw: 0, stop: 0, soft: 0, plan: 0, planCnt: 0, planArr: [], h1: 0, h1Cnt: 0, h1Arr: [], miss: 0, x: 0 }; };
  var st = {}; DEFS.forEach(function(d) { st[d.k] = mk(); });
  var wknd = mk(), total = mk(), _hasWknd = false;
  var _acc = function(o, s, a, c) {
    o.cnt++;
    if (s.osVal != null && s.osVal !== "") o.osv.push(Number(s.osVal));
    if (_epReachedAt(s, a)) o.reach++;
    if (_epIsXSkip(s, a)) { o.x++; return; }
    var res = _elDynResult(s, a, c);
    if (res === "ok") o.ok++; else if (res === "ng") o.ng++; else if (res === "miss") o.miss++; else if (res === "draw") o.draw++;
    if (res !== "miss") {  // 損切り率・見切り率・損益平均はE成立（エントリーできた）分のみを母数に＝未達・×見送りは除外 2026-06-20
      var isStop = _elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c));
      if (isStop) o.stop++; else if (res === "ng") o.soft++;
      var plan = _elDynPlanned(s, a, c); if (plan != null) { o.plan += plan; o.planCnt++; o.planArr.push(plan); }
      var h1t = _elHold1TotParts(s, a, c); if (h1t.main != null) { o.h1 += h1t.main; o.h1Cnt++; o.h1Arr.push(h1t.main); }
    }
  };
  recs.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), a = ai.alpha, c = ai.cutLine;
    var di = _dowIdx(r.date), bucket = null;
    if (di === 0 || di === 6) { bucket = wknd; _hasWknd = true; }
    else if (di != null) { for (var i = 0; i < DEFS.length; i++) { if (DEFS[i].dow === di) { bucket = st[DEFS[i].k]; break; } } }
    if (bucket) _acc(bucket, s, a, c);
    _acc(total, s, a, c);
  });
  var _osCell = function(o) { var m = _elMedian(o.osv); return m != null ? React.createElement("span", { style: { fontWeight: 700, color: _vcol(m, true) } }, m + "円") : React.createElement("span", { style: { color: "#ccc" } }, "—"); };
  var _winCell = function(o) { var t = o.ok + o.ng; if (!t) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var w = Math.round(o.ok / t * 100); return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } }, React.createElement("span", { style: { fontWeight: 700, color: w >= 50 ? "#1E8449" : "#B45309" } }, w + "%"), React.createElement("span", { style: { fontSize: 8, color: "#bbb" } }, o.ok + "勝" + o.ng + "敗")); };
  var _pctc = function(n, d) { return d ? Math.round(n / d * 100) : 0; };
  var bar = React.createElement("div", { style: { display: "flex", width: "100%", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e0d6" } },
    DEFS.map(function(d) { var o = st[d.k]; if (!o.cnt) return null; return React.createElement("div", { key: d.k, title: d.label + " " + o.cnt + "件", style: { width: (o.cnt / (total.cnt || 1) * 100) + "%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden" } }, o.cnt + "件"); }));
  var _mkRow = function(label, color, o, bold) {
    return React.createElement("tr", { key: label, style: bold ? { background: "#FBF7EF" } : null },
      _elv2Td(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, color ? React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: color, display: "inline-block" } }) : null, label), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _elv2Td(o.cnt ? o.cnt + "件（" + _pctc(o.cnt, total.cnt) + "%）" : "0件", { fontWeight: 700 }),
      _elv2Td(_elOsMMCell(o.osv)),
      _elv2Td(_elv2Rate(o.reach, o.cnt)),
      _elv2Td(_elEwinCell(o.ok, o.ng, o.draw)),
      _elv2Td((o.ok + o.ng + o.draw) ? Math.round(o.soft / (o.ok + o.ng + o.draw) * 100) + "%" : "—", { color: o.soft ? "#B45309" : "#bbb", fontWeight: o.soft ? 700 : 400 }),
      _elv2Td((o.ok + o.ng + o.draw) ? Math.round(o.stop / (o.ok + o.ng + o.draw) * 100) + "%" : "—", { color: o.stop ? "#1E8449" : "#bbb", fontWeight: o.stop ? 700 : 400 }),
      _elv2Td(_elPnlMMCell(o.planArr)),
      _elv2Td(_elPnlMMCell(o.h1Arr)));
  };
  var bodyRows = DEFS.map(function(d) { return _mkRow(d.label, d.color, st[d.k], false); });
  if (_hasWknd) bodyRows.push(_mkRow("土日", "#bbb", wknd, false));
  bodyRows.push(_mkRow("全体", null, total, true));
  var tbl = _elv2Table(["曜日", "件数", "OS値", "E到達率", "E後の勝率", "見切り率", "損切り率", "EP損益", "H1損益"], bodyRows);
  // 読み取り
  var items = [];
  var avail = DEFS.map(function(d) { return { d: d, o: st[d.k] }; }).filter(function(x) { return x.o.cnt > 0; });
  if (avail.length) {
    var mostN = avail.slice().sort(function(a, b) { return b.o.cnt - a.o.cnt; })[0];
    items.push(React.createElement("span", null, "記録が最も多い曜日は", _elInsightEmV2(mostN.d.label + "曜"), "（" + mostN.o.cnt + "件）。"));
    var byWin = avail.filter(function(x) { return (x.o.ok + x.o.ng) > 0; }).sort(function(a, b) { return (b.o.ok / (b.o.ok + b.o.ng)) - (a.o.ok / (a.o.ok + a.o.ng)); });
    if (byWin.length) {
      var bw = byWin[0], ww = byWin[byWin.length - 1];
      items.push(React.createElement("span", null, "勝率が最も高いのは", _elInsightEmV2(bw.d.label + "曜"), "（", _elInsightEmV2(Math.round(bw.o.ok / (bw.o.ok + bw.o.ng) * 100) + "%"), "）", (ww !== bw) ? React.createElement("span", null, "・最も低いのは", _elInsightEmV2(ww.d.label + "曜"), "（" + Math.round(ww.o.ok / (ww.o.ok + ww.o.ng) * 100) + "%）") : null, "。"));
    }
    var byEp = avail.filter(function(x) { return x.o.planCnt > 0; }).sort(function(a, b) { return (b.o.plan / b.o.planCnt) - (a.o.plan / a.o.planCnt); });
    if (byEp.length) items.push(React.createElement("span", null, "1件あたり平均EP損益が最良の曜日は", _elInsightEmV2(byEp[0].d.label + "曜"), "（", _elInsightEmV2(_elPnlFmt(Math.round(byEp[0].o.plan / byEp[0].o.planCnt))), "）。"));
    var byStop = avail.filter(function(x) { return x.o.cnt >= 2; }).sort(function(a, b) { return (b.o.stop / ((b.o.ok + b.o.ng) || 1)) - (a.o.stop / ((a.o.ok + a.o.ng) || 1)); });
    if (byStop.length && byStop[0].o.stop > 0) items.push(React.createElement("span", null, "損切り率が最も高いのは", _elInsightEmV2(byStop[0].d.label + "曜"), "（" + Math.round(byStop[0].o.stop / ((byStop[0].o.ok + byStop[0].o.ng) || 1) * 100) + "%）＝この曜日は慎重に。"));
  }
  return React.createElement("div", null, bar, tbl, items.length ? _elInsightBoxV2(items, { note: "曜日は記録日付から算出。OS値=寄り足の高値（水準線比）の中央値（主）と平均（副）を併記（OS値は右偏なので典型値は中央値）／E到達率=3本以内にα到達（×見送り含む）／E後の勝率=エントリー（E成立）後にEP損益が利益だった割合（敗率・未達率はE到達率の裏返しなので省略）／損切り率=想定orH1orH2で損切り発生。EP/H1損益はE成立（エントリーできた）分のみの平均＋合計。未達（α未到達）・×見送りは母数に含めない。採用α基準。" }) : null);
}

// === エントリー記録帳（EP起算方式対応・タブ式 2026-06-12）===
// タブ: 集計(KPI+OS値の分析+EP位置+累積損益+連勝連敗最大DD+時間帯+曜日別+×見送り+△ホールド)/α値(推奨基本α詳細_elBaseAlphaDetailV2+期間推移_elBaseAlphaTrendV2+α意思決定表+α感応度カーブ・2026-06-22)/期間/カレンダー/シグナル別/OS連鎖/深掘り(最適ホールド本数+期待度キャリブレーション+執行乖離+メモ×成績)/出現/一覧。集計系はv2記録のみ・一覧タブは旧記録も表示。
// 一覧・展開明細は1行=1記録のテーブル（行タップでEntryLogCard展開）でスクロール量を削減。
function EntryLogView(_ref_elv2) {
  var data = _ref_elv2.data, save = _ref_elv2.save, onBack = _ref_elv2.onBack,
    onSelectDate = _ref_elv2.onSelectDate, initialEdit = _ref_elv2.initialEdit;
  var custom = data.custom || {};
  var allStocks = custom.stocks && custom.stocks.length > 0 ? custom.stocks : _DEF_STOCKS_FROZEN;
  var _uV = useState("sum"), view = _uV[0], setView = _uV[1];
  var _uP = useState("all"), period = _uP[0], setPeriod = _uP[1];
  var _uS = useState(""), stockFil = _uS[0], setStockFil = _uS[1];
  var _uE = useState(initialEdit || null), editTarget = _uE[0], setEditTarget = _uE[1];
  var _uX = useState(null), expKey = _uX[0], setExpKey = _uX[1];
  var _uL = useState(50), listLimit = _uL[0], setListLimit = _uL[1];
  var _uLX = useState(false), listExclOnly = _uLX[0], setListExclOnly = _uLX[1];  // 一覧「不算入のみ」絞り込み 2026-06-18
  var _uAK = useState("all"), apKindFil = _uAK[0], setApKindFil = _uAK[1];  // 出現タブ 種別絞り込み 2026-06-18
  var _uAN = useState(""), apNameFil = _uAN[0], setApNameFil = _uAN[1];      // 出現タブ 名前絞り込み
  var _uD = useState(null), selDate = _uD[0], setSelDate = _uD[1];
  var _uCM = useState(null), calYM = _uCM[0], setCalYM = _uCM[1];
  var _uSG = useState(null), selSig = _uSG[0], setSelSig = _uSG[1];
  var _uGr = useState("week"), gran = _uGr[0], setGran = _uGr[1];
  var _uCF = useState(""), cFrom = _uCF[0], setCFrom = _uCF[1];
  var _uCT = useState(""), cTo = _uCT[0], setCTo = _uCT[1];
  var _uPE = useState(null), perExp = _uPE[0], setPerExp = _uPE[1];
  var _selSty = { padding: "5px 8px", fontSize: 11, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#333" };
  var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
  var _ai = function(r) { return _elAlphaInfo(r, data); };
  var allRecs = _elCollectAllSignals(data);
  var _apAllRows = _apCollectAll(data);  // 出現シグナル・テクニカルの全行（銘柄タブの顔ぶれ＋出現タブで再利用）
  // 銘柄タブ（主ナビ）: 記録のある銘柄をマスター登録順で固定（顔ぶれは期間に依存しない）。記録帳は全項目を銘柄別に分析する。2026-06-22
  // 「記録のある銘柄」＝エントリー記録 or 出現記録のある銘柄。出現のみの銘柄も到達できるよう _apAllRows の銘柄も顔ぶれに含める。
  var _tickerList = (function() {
    var seen = {};
    allRecs.forEach(function(r) { if (r.stock) seen[r.stock] = 1; });
    _apAllRows.forEach(function(r) { if (r.stock) seen[r.stock] = 1; });
    var inMaster = allStocks.filter(function(s) { return seen[s]; });
    var extras = Object.keys(seen).filter(function(s) { return allStocks.indexOf(s) < 0; }).sort();
    return inMaster.concat(extras);
  })();
  var _selStock = (stockFil && _tickerList.indexOf(stockFil) >= 0) ? stockFil : (_tickerList[0] || "");
  var _periodRecs = _elFilterPeriod(allRecs, period);
  // 銘柄タブのバッジ件数: 選択期間内・銘柄未限定の記録数（顔ぶれは固定、件数だけ期間連動）
  var _cntByStock = (function() { var m = {}; _periodRecs.forEach(function(r) { if (r.stock) m[r.stock] = (m[r.stock] || 0) + 1; }); return m; })();
  var filtered = _periodRecs.filter(function(r) { return r.stock === _selStock; });
  // 合計額算入: includeInTotal===false の記録は集計/分析の母集団 v2recs から除外（一覧 filtered は全件のまま）。2026-06-18
  var v2recs = filtered.filter(function(r) { return _epIsV2(r.signal) && _elInclTotal(r.signal); });
  // 旧記録件数は算入フラグと独立に数える（除外した新形式記録を「旧記録」に混ぜない）。2026-06-18
  var oldCnt = filtered.filter(function(r) { return !_epIsV2(r.signal); }).length;
  var _byDateDesc = function(a, b) { return (b.date + (b.signal.time || "")).localeCompare(a.date + (a.signal.time || "")); };
  var _dow = function(ds) { var p = ds.split("-"); return ["日", "月", "火", "水", "木", "金", "土"][new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; };
  var _secH = function(t, sub) {
    return React.createElement("div", { style: { margin: "14px 0 6px" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, t),
      sub ? React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginTop: 2 } }, sub) : null);
  };
  var _kpiCard = function(label, val, color, sub) {
    return React.createElement("div", { key: label, style: { flex: "1 1 90px", minWidth: 88, background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "8px 10px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 3 } }, label),
      React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: color || "#333", lineHeight: 1.1, whiteSpace: "nowrap" } }, val),
      sub ? React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 2 } }, sub) : null);
  };
  var _yenN = function(v, cnt) {
    if (cnt === 0 || v == null) return _dash;
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, justifyContent: "center", whiteSpace: "nowrap" } },
      _elHoldGradeBadge(_profitGradeFromPnl(v, 1)),
      React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(v) } }, _elPnlFmt(v)));
  };
  // 金額＋（）内の○△参考値。EP/H1/H2の合計表示で「△を本算入(（）外)していたら」の○△合計を（Ⓐ+9,900円）で併記（2026-06-16: ×と未設定は算入も参考も無し）。
  // ref/refCnt は _elTotAccum の planRef/holdRef/hold2Ref 系（△/損切り済由来）。参考が無ければ通常表示。実現損益には付けない。
  var _yenNR = function(v, cnt, ref, refCnt) {
    var suf = _elHold2RefSuffix(v, ref, refCnt);
    if (!suf) return _yenN(v, cnt);
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 2, whiteSpace: "nowrap" } },
      _yenN(v, cnt),
      React.createElement("span", { style: { fontSize: 11, fontWeight: 600, lineHeight: 1.2 } }, suf));
  };
  var _th = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%", fontSize: 10, color: "#9A3412" }, ex || {}) }, t); };
  var _td = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };

  // ===== 記録テーブル（mode "day"=日別の簡易列 / "full"=一覧・展開明細の詳細列）。行タップで明細カード =====
  var _recTable = function(recs, mode, keyPfx, limit) {
    if (!recs.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 12 } }, "記録なし");
    var shown = (limit && recs.length > limit) ? recs.slice(0, limit) : recs;
    var colN = mode === "day" ? 8 : 11;
    var body = [];
    shown.forEach(function(r) {
      var s = r.signal, a = _ai(r);
      var ek = keyPfx + r.stock + "_" + (s.id || s.time || "");
      var on = expKey === ek;
      var cells = [
        _td((on ? "▶ " : "") + r.date.slice(5) + "(" + _dow(r.date) + ")", { textAlign: "left", paddingLeft: 8, fontWeight: 700 }),
        _td(React.createElement("span", null, React.createElement("div", null, s.time || _dash), _epIncompleteMark(s), _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge()) : null), { color: "#666" }),
        _td(r.stock, { color: "#9A3412", fontWeight: 700 })
      ];
      if (mode === "day") {
        var _bandI = (s.osVal != null && s.osVal !== "") ? _elOsBandIdxV2(s.osVal) : null;
        cells = cells.concat([
          _td(_epOsChainCell(s, a.alpha)),
          _td(_epECell(s, a.alpha)),
          _td(_bandI != null ? React.createElement("span", { style: { display: "inline-block", padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700, color: "#fff", background: _EL_OS_BANDS_V2[_bandI].color, whiteSpace: "nowrap" } }, _EL_OS_BANDS_V2[_bandI].label) : _dash),
          _td(_elHoldMaxHighCell(s)),
          _td(_elOutcomeCell(s, a.alpha, a.cutLine))
        ]);
      } else {
        var entered = _elIsEntered(s, r.item);
        var realN = entered ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null;
        var _sigParts = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
        cells = cells.concat([
          _td(_sigParts.length ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } }, _sigParts.map(function(_t, _i) { return _sigNameNode(_t, _i); })) : "(未設定)", { textAlign: "left" }),
          _td(a.alpha != null ? a.alpha + "円" : _dash, { color: "#0369A1", fontWeight: 600 }),
          _td(_epOsChainCell(s, a.alpha)),
          _td(_epECell(s, a.alpha)),
          _td(entered
            ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 13 } }, "〇")
            : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 13 } }, "×")),
          _td(_epPnlCell(s, a.alpha, a.cutLine))
        ]).concat(_elHoldTd2(s, a.alpha, a.cutLine, { padding: "4px 6px", textAlign: "center", fontSize: 11, borderTop: "1px solid #f0ede8" }))
          .concat([_td(entered ? _elRPnlDispW(realN, realN != null ? _profitGradeFromPnlReal(realN, 1) : null, 60) : _dash)]);
      }
      body.push(React.createElement("tr", { key: ek, onClick: function() { setExpKey(on ? null : ek); }, style: Object.assign({ background: on ? "#FFF7ED" : "transparent", cursor: "pointer" }, _elNotInclRowStyle(s)) }, cells));
      if (on) body.push(React.createElement("tr", { key: ek + "_c" },
        React.createElement("td", { colSpan: colN, style: { padding: "4px 8px 8px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
          React.createElement(EntryLogCard, { record: r, data: data, onEdit: function(rec) { setEditTarget(rec); }, onGoDate: onSelectDate }))));
    });
    var head = mode === "day"
      ? [_th("日付", { textAlign: "left", paddingLeft: 8 }), _th("時間"), _th("銘柄"), _th("OS"), _th("E"), _th("OS帯"), _th("H中最高値"), _th("実現結果")]
      : [_th("日付", { textAlign: "left", paddingLeft: 8 }), _th("時間"), _th("銘柄"), _th("シグナル", { textAlign: "left" }), _th("α値"), _th("OS"), _th("E"), _th("取引"),
         _th("EP損益"), React.createElement("th", { key: "hh", colSpan: 2, style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "H損益"), _th("実現損益")];
    return React.createElement(React.Fragment, null,
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } }, head)),
          React.createElement("tbody", null, body))),
      (limit && recs.length > limit) ? React.createElement("button", {
        onClick: function() { setListLimit(listLimit + 100); },
        style: { width: "100%", padding: "8px", fontSize: 12, fontWeight: 700, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", marginTop: 6 }
      }, "さらに表示（残り" + (recs.length - limit) + "件）") : null);
  };

  // ===== グループ集計テーブル（シグナル別・銘柄別）。行タップで明細テーブル展開 =====
  var _grpTable = function(groups, headLabel, keyPfx, withOsStats) {
    groups = groups.filter(function(g) { return g.recs.length > 0; });
    if (!groups.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 12 } }, "v2記録なし");
    var colN = withOsStats ? 10 : 8;
    var rows = [];
    groups.forEach(function(g) {
      var recs = g.recs;
      var t = _elTotAccum(recs, {
        signal: function(r) { return r.signal; },
        alpha: function(r) { return _ai(r).alpha; },
        cut: function(r) { return _ai(r).cutLine; },
        real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; }
      });
      var reach = recs.filter(function(r) { return _epReachedAt(r.signal, _ai(r).alpha); }).length;
      var ss = _elStopStatsV2(recs, data);
      var os = withOsStats ? _elOsStatsV2(recs) : null;
      var ek = keyPfx + g.key, on = expKey === ek;
      var cells = [
        _td((on ? "▶ " : "") + g.label, { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412", whiteSpace: "normal" }),
        _td(recs.length, { fontWeight: 700 })
      ];
      if (withOsStats) cells = cells.concat([
        _td(os ? os.avg + "円" : _dash, { fontWeight: 700, color: "#9A3412" }),
        _td(_elOsDistBarV2(os ? os.dist : null, 72, 11))
      ]);
      cells = cells.concat([
        _td(recs.length ? React.createElement("span", { style: { fontWeight: 700, color: reach / recs.length >= 0.6 ? "#1E8449" : "#B45309" } }, Math.round(reach / recs.length * 100) + "%") : _dash),
        _td(_elStopCellV2(ss)),
        _td(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _yenN(t.plan, t.planCnt), _elHold2RefSuffix(t.plan, t.planRef, t.planRefCnt))),
        _td(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _yenN(t.holdPlanCap, t.holdCnt), _elHold2RefSuffix(t.holdPlanCap, t.holdRef, t.holdRefCnt))),
        _td(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _yenN(t.hold2, t.hold2Cnt), _elHold2RefSuffix(t.hold2, t.hold2Ref, t.hold2RefCnt))),
        _td(_yenN(t.real, t.realCnt))
      ]);
      rows.push(React.createElement("tr", { key: ek, onClick: function() { setExpKey(on ? null : ek); }, style: { background: on ? "#FFF7ED" : "transparent", cursor: "pointer" } }, cells));
      if (on) rows.push(React.createElement("tr", { key: ek + "_d" },
        React.createElement("td", { colSpan: colN + 2, style: { padding: "4px 8px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
          _recTable(recs.slice().sort(_byDateDesc), "full", ek + "_r_"))));
    });
    var head = [_th(headLabel, { textAlign: "left", paddingLeft: 8 }), _th("件")];
    if (withOsStats) head = head.concat([_th("OS1平均"), _th("OS分布")]);
    head = head.concat([_th("E成立率"), _th("損切り"), _th("EP損益"), _th("H1損益"), _th("H2損益"), _th("実現損益")]);
    return React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } }, head)),
        React.createElement("tbody", null, rows)));
  };

  // ===== 集計/α値タブ共用: KPI + α意思決定表(_alphaTable) =====
  var _kpi = (function() {
    var n = v2recs.length, ok = 0, x = 0, miss = 0;
    v2recs.forEach(function(r) {
      var rr = _epResolve(r.signal, _ai(r).alpha), j = rr ? rr.judge : null;
      if (j === "ok") ok++; else if (j === "x") x++; else if (j === "miss") miss++;
    });
    var t = _elTotAccum(v2recs, {
      signal: function(r) { return r.signal; },
      alpha: function(r) { return _ai(r).alpha; },
      cut: function(r) { return _ai(r).cutLine; },
      real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; }
    });
    return { n: n, ok: ok, x: x, miss: miss, reach: n ? Math.round((ok + x) / n * 100) : null, t: t, ss: _elStopStatsV2(v2recs, data) };
  })();
  var _kpiBlock = React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 } },
    _kpiCard("件数", _kpi.n + "件", "#333", "v2記録のみ"),
    _kpiCard("E到達率", _kpi.reach != null ? _kpi.reach + "%" : "—", "#0369A1", "○" + _kpi.ok + "・×" + _kpi.x + "・未達" + _kpi.miss),
    _kpiCard("EP損益", _yenNR(_kpi.t.plan, _kpi.t.planCnt, _kpi.t.planRef, _kpi.t.planRefCnt), null, _kpi.t.planCnt + "件"),
    _kpiCard("H1損益", _yenNR(_kpi.t.holdPlanCap, _kpi.t.holdCnt, _kpi.t.holdRef, _kpi.t.holdRefCnt), null, _kpi.t.holdCnt + "件"),
    _kpiCard("H2損益", _yenNR(_kpi.t.hold2, _kpi.t.hold2Cnt, _kpi.t.hold2Ref, _kpi.t.hold2RefCnt), null, _kpi.t.hold2Cnt + "件"),
    _kpiCard("損切り", (_kpi.ss && _kpi.ss.any || 0) + "回", _kpi.ss && _kpi.ss.any > 0 ? "#1E8449" : "#bbb", _kpi.ss && _kpi.ss.rate != null ? "率" + _kpi.ss.rate + "%（想" + _kpi.ss.plan + "・H1 " + _kpi.ss.h1 + "・H2 " + _kpi.ss.h2 + "）" : null),
    _kpiCard("×見送り", _kpi.x + "件", _kpi.x > 0 ? "#1E8449" : "#bbb", "×宣言後の到達"),
    _kpiCard("実現損益", _yenN(_kpi.t.real, _kpi.t.realCnt), null, _kpi.t.realCnt + "件"));
  var _alphaTable = (function() {
    var rs = v2recs.filter(function(r) { return r.signal.osVal != null && r.signal.osVal !== ""; });
    if (!rs.length) return null;
    var rows = [0, 5, 10, 15, 20].map(function(a) {
      var ent = 0, stp = 0;
      rs.forEach(function(r) {
        var s = r.signal, cut = _ai(r).cutLine;
        if (_epReachedAt(s, a)) ent++;
        if (_elPlanIsStop(s, a, cut) || _elHoldIsStop(s, a, cut) || _elHoldIsStop2(s, a, cut)) stp++;
      });
      var t = _elTotAccum(rs, {
        signal: function(r) { return r.signal; },
        alpha: function() { return a; },
        cut: function(r) { return _ai(r).cutLine; }
      });
      return { a: a, ent: ent, stp: stp, t: t };
    });
    var b1 = Math.max.apply(null, rows.map(function(x) { return x.t.holdCnt > 0 ? x.t.holdPlanCap : -Infinity; }));
    var b2 = Math.max.apply(null, rows.map(function(x) { return x.t.hold2Cnt > 0 ? x.t.hold2 : -Infinity; }));
    return React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
          _th("α値", { textAlign: "left", paddingLeft: 8 }), _th("成立率"), _th("損切り"), _th("EP損益"), _th("H1損益"), _th("H2損益"))),
        React.createElement("tbody", null, rows.map(function(x) {
          var i1 = x.t.holdCnt > 0 && x.t.holdPlanCap === b1 && b1 > -Infinity, i2 = x.t.hold2Cnt > 0 && x.t.hold2 === b2 && b2 > -Infinity;
          var _amt = function(v, c, hot, ref, refCnt) {
            if (c <= 0) return _dash;
            var node = React.createElement("span", { style: { fontWeight: hot ? 800 : 600, color: _elPnlColor(v) } }, _elPnlFmt(v));
            var suf = _elHold2RefSuffix(v, ref, refCnt);
            if (!suf) return node;
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 2 } }, node, React.createElement("span", { style: { fontSize: 10, fontWeight: 600 } }, suf));
          };
          return React.createElement("tr", { key: x.a, style: { background: (i1 || i2) ? "#FEF3C7" : "transparent" } },
            _td(React.createElement("span", null, x.a + "円",
              i1 ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 3, fontWeight: 800 } }, "★H1") : null,
              i2 ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 3, fontWeight: 800 } }, "★H2") : null), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#0369A1" }),
            _td(Math.round(x.ent / rs.length * 100) + "%", { fontWeight: 700 }),
            _td(x.stp > 0 ? x.stp + "回" : "0回", { color: x.stp > 0 ? "#1E8449" : "#bbb" }),
            _td(_amt(x.t.plan, x.t.planCnt, false, x.t.planRef, x.t.planRefCnt)), _td(_amt(x.t.holdPlanCap, x.t.holdCnt, i1, x.t.holdRef, x.t.holdRefCnt)), _td(_amt(x.t.hold2, x.t.hold2Cnt, i2, x.t.hold2Ref, x.t.hold2RefCnt)));
        }))));
  })();

  // ===== グループ構築 =====
  var _sigGroups = (function() {
    var by = {};
    v2recs.forEach(function(r) {
      var s = r.signal;
      var tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
      if (!tags.length) tags = ["(未設定)"];
      tags.forEach(function(tg) { (by[tg] = by[tg] || []).push(r); });
    });
    return Object.keys(by).sort(function(a, b) { return by[b].length - by[a].length; })
      .map(function(k) { return { key: k, label: stripCat(k), recs: by[k] }; });
  })();
  // ===== シグナル別タブ用：サブタブバー＋リッチ分析パネル =====
  var _subTabBar = function(groups, sel, setSel) {
    return React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 8px", marginBottom: 4 } },
      groups.map(function(g) {
        var on = sel === g.key;
        return React.createElement("button", { key: g.key, onClick: function() { setSel(g.key); setExpKey(null); },
          style: { flexShrink: 0, padding: "6px 12px", fontSize: 12, fontWeight: 700, borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } },
          g.label + " (" + g.recs.length + ")");
      }));
  };
  var _groupPanel = function(recs, stkKey) {
    if (!recs || !recs.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "記録なし");
    var t = _elTotAccum(recs, {
      signal: function(r) { return r.signal; },
      alpha: function(r) { return _ai(r).alpha; },
      cut: function(r) { return _ai(r).cutLine; },
      real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; }
    });
    var os = _elOsStatsV2(recs), ss = _elStopStatsV2(recs, data), best = _elBestAlphaV2(recs, data), pcg = _elOsPctlV2(recs);
    var ok = 0, x = 0, miss = 0;
    recs.forEach(function(r) { var rr = _epResolve(r.signal, _ai(r).alpha), j = rr ? rr.judge : null; if (j === "ok") ok++; else if (j === "x") x++; else if (j === "miss") miss++; });
    var _baTxt = best ? [best.h1 ? ("H1 " + best.h1.a + "円") : null, best.h2 ? ("H2 " + best.h2.a + "円") : null].filter(Boolean).join(" / ") : "—";
    return React.createElement(React.Fragment, null,
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 10 } },
        _kpiCard("件数", recs.length + "件", "#333"),
        _kpiCard("E到達率", recs.length ? Math.round((ok + x) / recs.length * 100) + "%" : "—", "#0369A1", "○" + ok + "・×" + x + "・未達" + miss),
        _kpiCard("EP損益", _yenNR(t.plan, t.planCnt, t.planRef, t.planRefCnt), null, t.planCnt + "件"),
        _kpiCard("H1損益", _yenNR(t.holdPlanCap, t.holdCnt, t.holdRef, t.holdRefCnt), null, t.holdCnt + "件"),
        _kpiCard("H2損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), null, t.hold2Cnt + "件"),
        _kpiCard("実現損益", _yenN(t.real, t.realCnt), null, t.realCnt + "件"),
        _kpiCard("損切り", (ss.any || 0) + "回", ss.any > 0 ? "#1E8449" : "#bbb", ss.rate != null ? "率" + ss.rate + "%" : null),
        _kpiCard("最良α", _baTxt, "#0369A1")),
      os ? React.createElement("div", { style: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "10px 12px", marginBottom: 4 } },
        _elOsPieV2(os.dist, 100),
        React.createElement("div", { style: { flex: "1 1 220px" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", marginBottom: 5 } }, "OS値分布"),
          React.createElement("div", { style: { display: "flex", gap: "4px 16px", flexWrap: "wrap", fontSize: 12, color: "#555", marginBottom: 7, alignItems: "baseline" } },
            React.createElement("span", null, "中央 ", React.createElement("b", { style: { color: "#9A3412", fontSize: 15 } }, os.med + "円"), (pcg && pcg.skewRight) ? React.createElement("span", { title: "平均が大きいOS値に上振れ。典型値は中央値で読むのが安全。", style: { display: "inline-block", fontSize: 8, fontWeight: 800, color: "#fff", background: "#B45309", borderRadius: 3, padding: "0 4px", marginLeft: 4 } }, "右偏") : null),
            React.createElement("span", null, "平均 ", React.createElement("b", null, os.avg + "円")),
            React.createElement("span", null, "最頻帯 ", React.createElement("b", null, pcg ? _EL_OS_BANDS_V2[pcg.bandMode.i].label : os.mode.val + "円")),
            React.createElement("span", null, "範囲 ", React.createElement("b", null, os.min + "〜" + os.max + "円")),
            pcg ? React.createElement("span", null, "α目安 ", React.createElement("b", { style: { color: "#0369A1" } }, "7割=α" + pcg.a70 + "円")) : null),
          _elOsBandLegendV2())) : null,
      _secH("📍 EP位置の分析", "EPがどの足で成立したか（採用α基準）"), _elEpPosSectionV2(recs, _ai),
      recs.length >= 2 ? React.createElement(React.Fragment, null, _secH("📈 累積損益（記録順）"), React.createElement(_elCumPnlSectionV2, { recs: recs, aiOf: _ai })) : null,
      _secH("📉 α感応度カーブ", "α=0〜20円で再計算した合計の推移"), _elAlphaCurveSectionV2(recs, _ai),
      _secH("🎯 推奨基本α値（期間ごとの傾向）", "件数フロア（最も件数の多いαの半分以上）を満たすαから、損切り率(EP〜H1)の低さ×0.7＋H1勝率×0.3の合成スコアが最大のα。高αの薄い標本(選抜バイアス)は除外。月別/週別の推移と「期間まとめ」の早見表で「この時期はX円→最近はY円」が分かる"),
      React.createElement(_elBaseAlphaTrendV2, { recs: recs, aiOf: _ai }),
      _secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝①α別の総当たり（各αの到達率/件数/損切り率/H1勝率/スコア）＋②採用αでの全記録の内訳（どの記録が母数で損切り/H1勝ち/対象外か）"),
      _elBaseAlphaDetailV2(recs, _ai),
      _secH("🕘 時間帯別の成績（寄り付き重視）", "寄り足OSが出た時刻で分類。9:15／9:30までの早い寄り足OSの成績"), _elTimeOfDaySectionV2(recs, _ai),
      _secH("📅 曜日別の成績", "月〜金別の件数・OS中央値・勝率・損切り率・平均EP/H1損益"), _elDowSectionV2(recs, _ai),
      _secH("🚫 期待度×（見送り）の分析", "このグループの×見送りを取引していたらの損益と、見送り判断の精度（損失回避＝正解／機会損失＝逃した利益）"), _elXSkipSectionV2(recs, _ai),
      _secH("🔺 期待度△（ホールド）の分析", "△で保有したH1/H2を本算入(（）外算入)していたらの損益と、△保有の是非（活きた＝1段下より伸長／裏目＝1段下で手仕舞いが正解）"), _elTriangleHoldSectionV2(recs, _ai),
      _secH("🗂 記録一覧（行タップで明細）"), _recTable(recs.slice().sort(_byDateDesc), "full", "gp_"));
  };

  // ===== タブ本体 =====
  var _tabBody;
  if (view === "sum") {
    _tabBody = React.createElement(React.Fragment, null,
      _kpiBlock,
      v2recs.length ? React.createElement(React.Fragment, null,
        _secH("📊 OS値の分析", "初動の強さ＝OS値の中央値・帯別成績とα設定の目安（重視すべきは平均でなく中央値＝α到達確率と直結）"), _elOsSectionV2(v2recs, _ai)) : null,
      v2recs.length ? React.createElement(React.Fragment, null,
        _secH("📍 EP位置の分析", "EPがどの足で成立したか（採用α基準）とEP位置別の成績"), _elEpPosSectionV2(v2recs, _ai)) : null,
      v2recs.length >= 2 ? React.createElement(React.Fragment, null,
        _secH("📈 累積損益（記録順）", "EP損益/H1/H2/実現損益の累積推移・合計行と同一基準"), React.createElement(_elCumPnlSectionV2, { recs: v2recs, aiOf: _ai })) : null,
      v2recs.length >= 2 ? React.createElement(React.Fragment, null,
        _secH("📉 連勝連敗・最大ドローダウン", "実現損益のストリークと最大DD（損失管理）"), _elStreakDDSectionV2(v2recs, _ai)) : null,
      v2recs.length ? React.createElement(React.Fragment, null,
        _secH("🕘 時間帯別の成績（寄り付き重視）", "寄り足OSが出た時刻で分類。9:15／9:30までに出た寄り足OSがどの程度OSし、成功（E成立・勝率）／損切りしているか"), _elTimeOfDaySectionV2(v2recs, _ai)) : null,
      v2recs.length ? React.createElement(React.Fragment, null,
        _secH("📅 曜日別の成績", "月〜金別の件数・OS中央値・勝率・損切り率・平均EP/H1損益（どの曜日が成功しやすいか）"), _elDowSectionV2(v2recs, _ai)) : null,
      v2recs.length ? React.createElement(React.Fragment, null,
        _secH("🚫 期待度×（見送り）の分析", "×見送りを取引していたらの損益と、見送り判断の精度（損失回避＝正解／機会損失＝逃した利益）"), _elXSkipSectionV2(v2recs, _ai)) : null,
      v2recs.length ? React.createElement(React.Fragment, null,
        _secH("🔺 期待度△（ホールド）の分析", "△で保有したH1/H2を本算入(（）外算入)していたらの損益と、△保有の是非（活きた＝1段下より伸長／裏目＝1段下で手仕舞いが正解）"), _elTriangleHoldSectionV2(v2recs, _ai)) : null);
  } else if (view === "alpha") {
    _tabBody = v2recs.length ? React.createElement(React.Fragment, null,
      React.createElement("div", { style: { fontSize: 11, color: "#64748B", marginBottom: 6 } }, "この銘柄（" + _selStock + "）の推奨基本α値と、その数値が出た根拠データ。EP起算（v2）の" + v2recs.length + "件で算出。"),
      _secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝①α別の総当たり（各αの到達率/件数/損切り率/H1勝率/スコア）＋②採用αでの全記録の内訳（どの記録が母数で損切り/H1勝ち/対象外か）"),
      _elBaseAlphaDetailV2(v2recs, _ai),
      _secH("🎯 推奨基本α 期間推移", "件数3件以上のαから損切り率の低さ×0.7＋H1勝率×0.3の合成スコアが最大のα。月別/週別/期間まとめで「この時期はX円→最近はY円」が分かる"),
      React.createElement(_elBaseAlphaTrendV2, { recs: v2recs, aiOf: _ai }),
      _alphaTable ? React.createElement(React.Fragment, null,
        _secH("🎯 α意思決定表", "α=0〜20円で再計算・損切り値は各記録の採用値・★=H1/H2の利益最大α"), _alphaTable) : null,
      _secH("📉 α感応度カーブ", "α=0〜20円で全記録を再計算した合計の推移（意思決定表のグラフ版）"), _elAlphaCurveSectionV2(v2recs, _ai)
    ) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "EP起算（v2）の記録がありません");
  } else if (view === "date") {
    _tabBody = (function() {
      var byDate = {}; v2recs.forEach(function(r) { (byDate[r.date] = byDate[r.date] || []).push(r); });
      var allDates = Object.keys(byDate).sort();
      var _curYM = calYM || (allDates.length ? { y: +allDates[allDates.length - 1].slice(0, 4), m: +allDates[allDates.length - 1].slice(5, 7) } : (function() { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1 }; })());
      var _pad = function(n) { return ("0" + n).slice(-2); };
      var _dstr = function(d) { return _curYM.y + "-" + _pad(_curYM.m) + "-" + _pad(d); };
      var _startDow = new Date(_curYM.y, _curYM.m - 1, 1).getDay();
      var _dim = new Date(_curYM.y, _curYM.m, 0).getDate();
      var _cells = [];
      for (var _p = 0; _p < _startDow; _p++) _cells.push(null);
      for (var _dd = 1; _dd <= _dim; _dd++) _cells.push(_dd);
      while (_cells.length % 7 !== 0) _cells.push(null);
      var _shiftM = function(delta) { var m = _curYM.m + delta, y = _curYM.y; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } setCalYM({ y: y, m: m }); setSelDate(null); };
      var _wkC = ["#C0392B", "#666", "#666", "#666", "#666", "#666", "#0369A1"];
      var _navBtn = function(lbl, fn) { return React.createElement("button", { onClick: fn, style: { padding: "3px 12px", fontSize: 15, fontWeight: 800, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#9A3412" } }, lbl); };
      var _header = React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 8 } },
        _navBtn("‹", function() { _shiftM(-1); }),
        React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: "#9A3412", minWidth: 110, textAlign: "center" } }, _curYM.y + "年 " + _curYM.m + "月"),
        _navBtn("›", function() { _shiftM(1); }));
      var _grid = React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 } },
        ["日", "月", "火", "水", "木", "金", "土"].map(function(w, i) { return React.createElement("div", { key: "w" + i, style: { textAlign: "center", fontSize: 10, fontWeight: 700, color: _wkC[i], padding: "2px 0" } }, w); }),
        _cells.map(function(d, i) {
          if (d == null) return React.createElement("div", { key: "e" + i });
          var ds = _dstr(d), drecs = byDate[ds] || [], cnt = drecs.length, on = selDate === ds;
          var realSum = 0, hasReal = false;
          drecs.forEach(function(r) { var v = _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; if (v != null) { realSum += v; hasReal = true; } });
          return React.createElement("div", { key: "d" + i, onClick: cnt ? function() { setSelDate(ds); } : null,
            style: { minHeight: 48, border: "1px solid " + (on ? "#9A3412" : "#eee"), borderRadius: 6, padding: "2px 3px", cursor: cnt ? "pointer" : "default", background: on ? "#FFF7ED" : (cnt ? "#fff" : "#fafafa"), display: "flex", flexDirection: "column" } },
            React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: cnt ? "#555" : "#bbb", display: "flex", alignItems: "center", gap: 2 } }, d,
              (function() { var _xc = filtered.filter(function(r) { return r.date === ds && _elIsExcluded(r.signal); }).length; return _xc > 0 ? _elExclDot(_xc) : null; })()),
            cnt ? React.createElement("div", { style: { marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
              React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#fff", background: "#F97316", borderRadius: 8, padding: "0 5px" } }, cnt + "件"),
              hasReal ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: _elPnlColor(realSum) } }, _elPnlFmt(realSum)) : null) : null);
        }));
      var _detail = selDate ? React.createElement("div", { style: { marginTop: 12 } },
        _secH("📋 " + selDate + "（" + _dow(selDate) + "）の記録 " + (byDate[selDate] ? byDate[selDate].length : 0) + "件", "行タップで明細"),
        _recTable((byDate[selDate] || []).slice().sort(function(a, b) { return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99"); }), "day", "cal_"))
        : React.createElement("div", { style: { marginTop: 12, color: "#aaa", fontSize: 12, textAlign: "center", padding: "14px 0", border: "1px dashed #e0ddd6", borderRadius: 8 } }, "日付（件数バッジのある日）をタップすると、その日の記録一覧が表示されます");
      return React.createElement(React.Fragment, null,
        _secH("📅 カレンダー", "日付タップでその日の記録一覧／オレンジ＝件数・下段＝実現損益合計"),
        _header, _grid, _detail);
    })();
  } else if (view === "signal") {
    var _selSigKey = (selSig != null && _sigGroups.some(function(g) { return g.key === selSig; })) ? selSig : (_sigGroups[0] ? _sigGroups[0].key : null);
    var _selSigGrp = _sigGroups.filter(function(g) { return g.key === _selSigKey; })[0];
    _tabBody = _sigGroups.length ? React.createElement(React.Fragment, null,
      _secH("🎯 シグナル別（タブ切替・複数タグは各タグに算入）"),
      _subTabBar(_sigGroups, _selSigKey, setSelSig),
      _selSigGrp ? _groupPanel(_selSigGrp.recs) : null)
      : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "v2記録なし");
  } else if (view === "oschain") {
    _tabBody = React.createElement(React.Fragment, null,
      _secH("📊 各足のOS値プロファイル（OS1〜OS5）", "各足の高値（水準線比）の中央値・下落率・分布（帯⇄1円刻み切替可）。OS2以降は基準線割れ（下落）あり＝下落帯を含む"),
      React.createElement(_elOsLegsSectionV2, { recs: v2recs }),
      _secH("🔗 OS連鎖（数値帯の遷移）", "OS1の帯から行タップでOS2→OS3…へ絞り込み。各帯の次OS中央値・遷移・成績"),
      React.createElement(_elOsChainSection, { recs: v2recs, data: data }));
  } else if (view === "period") {
    _tabBody = (function() {
      var _granBtns = React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 } },
        [["day", "日別"], ["week", "週別"], ["month", "月別"], ["custom", "指定期間"]].map(function(g) {
          var on = gran === g[0];
          return React.createElement("button", { key: g[0], onClick: function() { setGran(g[0]); setPerExp(null); },
            style: { padding: "5px 14px", fontSize: 12, fontWeight: 700, borderRadius: 16, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } }, g[1]);
        }));
      var _periodTot = function(rs) { return _elTotAccum(rs, { signal: function(r) { return r.signal; }, alpha: function(r) { return _ai(r).alpha; }, cut: function(r) { return _ai(r).cutLine; }, real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; } }); };
      var _ratesOf = function(rs) {
        var ok = 0, ng = 0, miss = 0, stop = 0, soft = 0, draw = 0;
        rs.forEach(function(r) { var s = r.signal, a = _ai(r).alpha, c = _ai(r).cutLine; var res = _elDynResult(s, a, c); if (res === "ok") ok++; else if (res === "ng") ng++; else if (res === "draw") draw++; if (!_epReachedAt(s, a)) miss++; var isStop = _elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c)); if (isStop) stop++; else if (res === "ng") soft++; });
        return { ok: ok, ng: ng, miss: miss, draw: draw, n: rs.length, win: (ok + ng + draw) ? Math.round(ok / (ok + ng + draw) * 100) : null, soft: (ok + ng + draw) ? Math.round(soft / (ok + ng + draw) * 100) : 0, stop: (ok + ng + draw) ? Math.round(stop / (ok + ng + draw) * 100) : 0 };
      };
      var _periodKpi = function(rs) {
        var t = _periodTot(rs), rr = _ratesOf(rs);
        return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 10 } },
          _kpiCard("件数", rs.length + "件", "#333"),
          _kpiCard("実現損益", _yenN(t.real, t.realCnt), null, t.realCnt + "件"),
          _kpiCard("EP損益", _yenNR(t.plan, t.planCnt, t.planRef, t.planRefCnt), null, t.planCnt + "件"),
          _kpiCard("H1損益", _yenNR(t.holdPlanCap, t.holdCnt, t.holdRef, t.holdRefCnt), null, t.holdCnt + "件"),
          _kpiCard("H2損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), null, t.hold2Cnt + "件"),
          _kpiCard("E後の勝率", rr.win != null ? rr.win + "%" : "—", rr.win != null ? (rr.win >= 50 ? "#1E8449" : "#B45309") : "#0369A1", (rr.ok + rr.ng + rr.draw) + "件（E成立）"),
          _kpiCard("見切り率", rr.soft + "%", rr.soft > 0 ? "#B45309" : "#bbb"),
          _kpiCard("損切り率", rr.stop + "%", rr.stop > 0 ? "#1E8449" : "#bbb"));
      };
      var _detailOf = function(rs) {
        return React.createElement(React.Fragment, null,
          _secH("🎯 シグナル別 成功度", "損失なし率・勝率で並べ替え＝どのシグナルが成功しやすいか（損失が出なかったか）"), _elSignalSuccessTableV2(rs, _ai),
          _secH("🕘 時間帯別の成績（寄り付き重視）"), _elTimeOfDaySectionV2(rs, _ai),
          _secH("📍 EP位置の分析"), _elEpPosSectionV2(rs, _ai),
          _secH("🚫 期待度×（見送り）の分析"), _elXSkipSectionV2(rs, _ai),
          _secH("🔺 期待度△（ホールド）の分析"), _elTriangleHoldSectionV2(rs, _ai));
      };
      if (gran === "custom") {
        var _crecs = v2recs.filter(function(r) { return (!cFrom || r.date >= cFrom) && (!cTo || r.date <= cTo); });
        var _dInput = function(val, setFn, label) { return React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#555" } }, label, React.createElement("input", { type: "date", value: val, onChange: function(e) { setFn(e.target.value); }, style: { padding: "4px 6px", fontSize: 12, border: "1px solid #ddd", borderRadius: 5 } })); };
        return React.createElement(React.Fragment, null,
          _secH("📆 期間集計", "粒度を選択。指定期間は開始・終了日で絞り込み（v2記録のみ）"), _granBtns,
          React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 } }, _dInput(cFrom, setCFrom, "開始 "), _dInput(cTo, setCTo, "終了 "), React.createElement("span", { style: { fontSize: 11, color: "#888" } }, _crecs.length + "件")),
          (cFrom || cTo) ? (_crecs.length ? React.createElement(React.Fragment, null, _periodKpi(_crecs), _detailOf(_crecs)) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この期間に記録なし")) : React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: "14px 0", fontSize: 12, border: "1px dashed #e0ddd6", borderRadius: 8 } }, "開始日・終了日を選ぶと、その期間の合計損益と詳細分析が表示されます"));
      }
      var _keyOf = function(ds) {
        if (gran === "day") return ds;
        if (gran === "month") return ds.slice(0, 7);
        var d = new Date(ds + "T00:00:00"); var mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        return mon.getFullYear() + "-" + ("0" + (mon.getMonth() + 1)).slice(-2) + "-" + ("0" + mon.getDate()).slice(-2);
      };
      var _labelOf = function(k) {
        if (gran === "day") return k.slice(5) + "(" + _dow(k) + ")";
        if (gran === "month") return k.replace("-", "/");
        var mon = new Date(k + "T00:00:00"); var fri = new Date(mon); fri.setDate(mon.getDate() + 4);
        return (mon.getMonth() + 1) + "/" + mon.getDate() + "〜" + (fri.getMonth() + 1) + "/" + fri.getDate();
      };
      var _byP = {};
      v2recs.forEach(function(r) { var k = _keyOf(r.date); (_byP[k] = _byP[k] || []).push(r); });
      var _keys = Object.keys(_byP).sort().reverse();
      if (!_keys.length) return React.createElement(React.Fragment, null, _secH("📆 期間集計"), _granBtns, React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "v2記録なし"));
      var _chartKeys = _keys.slice().reverse();
      var _realPts = [], _planPts = [], _h1Pts = [], _h2Pts = [], _h2rPts = [], _xt = [], _step = Math.max(1, Math.ceil(_chartKeys.length / 6));
      _chartKeys.forEach(function(k, i) { var t = _periodTot(_byP[k]); _realPts.push(t.real || 0); _planPts.push(t.plan || 0); _h1Pts.push(t.holdPlanCap || 0); _h2Pts.push(t.hold2 || 0); _h2rPts.push((t.hold2 || 0) + (t.hold2Ref || 0)); if (i % _step === 0 || i === _chartKeys.length - 1) _xt.push({ i: i, label: _labelOf(k) }); });
      var _chart = _chartKeys.length >= 2 ? _elLineChartV2([{ label: "実現損益", color: "#2E7D32", pts: _realPts }, { label: "EP損益", color: "#0369A1", pts: _planPts }, { label: "H1損益", color: "#DC2626", pts: _h1Pts }, { label: "H2損益", color: "#D97706", pts: _h2Pts }, { label: "H2損益（）", color: "#DB2777", pts: _h2rPts }], { xTicks: _xt }) : null;
      var _thP = function(t) { return React.createElement("th", { style: { padding: "5px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
      var _tdP = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
      var _rows = [];
      _keys.forEach(function(k) {
        var rs = _byP[k], t = _periodTot(rs), rr = _ratesOf(rs), on = perExp === k;
        _rows.push(React.createElement("tr", { key: k, onClick: function() { setPerExp(on ? null : k); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
          _tdP(React.createElement("span", null, React.createElement("span", { style: { color: "#F97316", marginRight: 3, fontSize: 9 } }, on ? "▼" : "▶"), _labelOf(k)), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
          _tdP(rs.length + "件", { fontWeight: 700 }),
          _tdP(_yenNR(t.plan, t.planCnt, t.planRef, t.planRefCnt)),
          _tdP(_yenNR(t.holdPlanCap, t.holdCnt, t.holdRef, t.holdRefCnt)),
          _tdP(_yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt)),
          _tdP(_yenN(t.real, t.realCnt)),
          _tdP(_elEwinCell(rr.ok, rr.ng, rr.draw)),
          _tdP(rr.soft + "%", { color: rr.soft > 0 ? "#B45309" : "#bbb", fontWeight: rr.soft > 0 ? 700 : 400 }),
          _tdP(rr.stop + "%", { color: rr.stop > 0 ? "#1E8449" : "#bbb", fontWeight: rr.stop > 0 ? 700 : 400 })));
        if (on) _rows.push(React.createElement("tr", { key: k + "_d" }, React.createElement("td", { colSpan: 9, style: { padding: "6px 8px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } }, _detailOf(rs))));
      });
      return React.createElement(React.Fragment, null,
        _secH("📆 期間集計（" + (gran === "day" ? "日別" : gran === "week" ? "週別" : "月別") + "・新しい順）", "行タップでその期間の詳細分析（シグナル成功度・時間帯傾向・EP位置）"), _granBtns,
        _chart ? React.createElement("div", { style: { marginBottom: 8 } }, _chart) : null,
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
              _thP(gran === "day" ? "日" : gran === "week" ? "週" : "月"), _thP("件数"), _thP("EP損益"), _thP("H1損益"), _thP("H2損益"), _thP("実現損益"), _thP("E後の勝率"), _thP("見切り率"), _thP("損切り率"))),
            React.createElement("tbody", null, _rows))));
    })();
  } else if (view === "deep") {
    _tabBody = v2recs.length ? React.createElement(React.Fragment, null,
      _secH("🛑 損切りの上振れ・損切り値シミュ", "損切りになった記録が損切りラインを何円超えて伸びたか＋損切りせず保有/最良手仕舞いなら何円だったか"), _elStopOvershootSectionV2(v2recs, _ai),
      _secH("⏳ 最適ホールド本数", "EPから何本持つのが最も期待値が高いか（深さ別の平均損益・損切り率・EP比改善率）"), _elHoldDepthSectionV2(v2recs, _ai),
      _secH("🎯 期待度キャリブレーション", "事前のH期待が実結果とどれだけ一致したか（予想は当たっているか過信か）"), _elExpCalibSectionV2(v2recs, _ai),
      _secH("🎯 計画EP vs 実エントリーの乖離", "計画したEP/αに対し実際の建玉・取引αがどれだけズレたか（執行の質・規律）"), _elExecGapSectionV2(v2recs, _ai),
      _secH("📝 メモ×成績", "根拠/反省を書いた記録ほど勝てているか＋負けた記録の頻出キーワード（敗因）"), _elMemoPerfSectionV2(v2recs, _ai)
    ) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "EP起算（v2）の記録がありません");
  } else if (view === "appear") {
    _tabBody = (function() {
      // 出現シグナル・テクニカルの横断一覧。期間/銘柄は上の絞り込みに連動、種別/名前はタブ内で絞る。
      var _apAll = _elFilterPeriod(_apAllRows, period).filter(function(r) { return r.stock === _selStock; });
      var _apByKind = apKindFil === "all" ? _apAll : _apAll.filter(function(r) { return r.kind === apKindFil; });
      var _apNames = [], _apSeen = {};
      _apByKind.forEach(function(r) { if (r.name && !_apSeen[r.name]) { _apSeen[r.name] = 1; _apNames.push(r.name); } });
      _apNames.sort();
      var _apShown = (apNameFil ? _apByKind.filter(function(r) { return r.name === apNameFil; }) : _apByKind).slice()
        .sort(function(a, b) { var k = b.date.localeCompare(a.date); return k !== 0 ? k : (a.time || "99:99").localeCompare(b.time || "99:99"); });
      var _kc = function(kind) { var isSig = kind === "signal"; return React.createElement("span", { style: { display: "inline-block", fontSize: 9, fontWeight: 700, padding: "0 5px", borderRadius: 3, whiteSpace: "nowrap", color: isSig ? "#9A3412" : "#0369A1", background: isSig ? "#FFEDD5" : "#E0F2FE", border: "1px solid " + (isSig ? "#FB923C" : "#7DD3FC") } }, isSig ? "シグナル" : "テクニカル"); };
      var _aTh = function(label, extra) { return React.createElement("th", { style: Object.assign({ padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "left", fontSize: 10, color: "#9A3412", whiteSpace: "nowrap" }, extra || {}) }, label); };
      var _aTdS = { padding: "3px 6px", fontSize: 11, borderBottom: "1px solid #f0ede6", verticalAlign: "top" };
      return React.createElement(React.Fragment, null,
        _secH("📡 出現シグナル・テクニカル（" + _apShown.length + "件）", "取引記録のシグナル(自動)＋手動の出現を横断表示。期間・銘柄は上の絞り込みに連動"),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" } },
          React.createElement("div", { style: { display: "flex", gap: 2 } },
            [["all", "全て"], ["signal", "シグナル"], ["tech", "テクニカル"]].map(function(kv) {
              var on = apKindFil === kv[0];
              return React.createElement("span", { key: kv[0], onClick: function() { setApKindFil(kv[0]); setApNameFil(""); }, style: { cursor: "pointer", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, border: "1px solid " + (on ? "#1a1a1a" : "#ddd"), background: on ? "#1a1a1a" : "#fff", color: on ? "#fff" : "#666" } }, kv[1]);
            })),
          React.createElement("select", { value: apNameFil, onChange: function(e) { setApNameFil(e.target.value); }, style: _selSty },
            [React.createElement("option", { key: "_a", value: "" }, "名前:全て")].concat(_apNames.map(function(nm) { return React.createElement("option", { key: nm, value: nm }, nm); })))),
        _apShown.length ? React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
              _aTh("年月日", { width: 96 }), _aTh("銘柄", { width: 90 }), _aTh("時間", { width: 56 }), _aTh("種別", { width: 84 }), _aTh("シグナル・テクニカル"), _aTh("メモ"))),
            React.createElement("tbody", null, _apShown.map(function(r) {
              return React.createElement("tr", { key: r.stock + "_" + r.date + "_" + r.id, style: { background: r.src === "auto" ? "#FBFBF9" : "#fff" } },
                React.createElement("td", { style: Object.assign({}, _aTdS, { whiteSpace: "nowrap", color: "#555" }) }, r.date + "（" + _dow(r.date) + "）"),
                React.createElement("td", { style: Object.assign({}, _aTdS, { whiteSpace: "nowrap", fontWeight: 700, color: "#9A3412" }) }, r.stock),
                React.createElement("td", { style: Object.assign({}, _aTdS, { whiteSpace: "nowrap", color: "#666", fontVariantNumeric: "tabular-nums" }) }, r.time || "—"),
                React.createElement("td", { style: _aTdS }, _kc(r.kind)),
                React.createElement("td", { style: Object.assign({}, _aTdS, { fontWeight: 700, color: "#333" }) }, r.name || "—"),
                React.createElement("td", { style: Object.assign({}, _aTdS, { color: "#555", whiteSpace: "pre-wrap", wordBreak: "break-all" }) }, r.memo ? stripHtml(r.memo) : React.createElement("span", { style: { color: "#ccc" } }, "—")));
            })))
        ) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "出現記録がありません"));
    })();
  } else {
    var _listAll = filtered.slice().sort(_byDateDesc);
    var _listExclN = _elExclCountRecs(_listAll);
    var _listRecs = listExclOnly ? _listAll.filter(function(r) { return _elIsExcluded(r.signal); }) : _listAll;
    _tabBody = React.createElement(React.Fragment, null,
      _secH("🗂 一覧（旧記録含む全件・" + _listAll.length + "件）", "行タップで明細カード。編集は明細カードの編集ボタンから"),
      _listExclN > 0 ? React.createElement("div", { style: { marginBottom: 6 } },
        React.createElement("button", {
          onClick: function() { setListExclOnly(!listExclOnly); },
          style: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
            border: "1px solid " + (listExclOnly ? "#0284C7" : "#7DD3FC"),
            background: listExclOnly ? "#0284C7" : "#E0F2FE", color: listExclOnly ? "#fff" : "#0284C7" } },
          (listExclOnly ? "✓ " : "") + "不算入のみ " + _listExclN + "件")) : null,
      _recTable(_listRecs, "full", "l_", listLimit));
  }

  return React.createElement("div", { style: { padding: "12px 14px", maxWidth: 1100, margin: "0 auto" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" } },
      onBack ? React.createElement("button", { onClick: onBack, style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" } }, "← 戻る") : null,
      React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: "#1a1a1a" } }, "📒 エントリー記録帳"),
      React.createElement("button", { onClick: function() { setEditTarget({}); }, style: { padding: "7px 12px", fontSize: 12, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", marginLeft: "auto" } }, "＋ 新規記録"),
      React.createElement("select", { value: period, onChange: function(e) { setPeriod(e.target.value); }, style: _selSty },
        [["all", "全期間"], ["1w", "今週"], ["1m", "1ヶ月"], ["3m", "3ヶ月"], ["6m", "6ヶ月"], ["1y", "1年"]].map(function(kv) { return React.createElement("option", { key: kv[0], value: kv[0] }, kv[1]); }))),
    React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 8px", marginBottom: 2, borderBottom: "2px solid #f0ede8" } },
      _tickerList.length ? _tickerList.map(function(s) {
        var on = _selStock === s;
        return React.createElement("button", { key: s, onClick: function() { setStockFil(s); setExpKey(null); setSelDate(null); setSelSig(null); setPerExp(null); },
          style: { flexShrink: 0, padding: "7px 14px", fontSize: 12.5, fontWeight: 800, borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } },
          s + " (" + (_cntByStock[s] || 0) + ")");
      }) : React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "6px 0" } }, "記録のある銘柄がありません")),
    React.createElement("div", { style: { display: "flex", gap: 2, marginBottom: 6, borderBottom: "1px solid #e0ddd6", overflowX: "auto" } },
      [["sum", "📊 集計"], ["alpha", "📐 α値"], ["period", "📆 期間"], ["date", "📅 カレンダー"], ["signal", "🎯 シグナル別"], ["oschain", "🔗 OS連鎖"], ["deep", "🔬 深掘り"], ["appear", "📡 出現"], ["list", "🗂 一覧"]].map(function(kv) {
        var on = view === kv[0];
        var cnt = kv[0] === "list" ? filtered.length : (kv[0] === "date" ? v2recs.length : null);
        return React.createElement("button", { key: kv[0],
          onClick: function() { setView(kv[0]); setExpKey(null); },
          style: { padding: "8px 12px", fontSize: 12, fontWeight: 700, background: "none", border: "none", cursor: "pointer",
            borderBottom: on ? "2px solid #1a1a1a" : "2px solid transparent", color: on ? "#1a1a1a" : "#888", whiteSpace: "nowrap" }
        }, kv[1] + (cnt != null ? "(" + cnt + ")" : ""));
      })),
    React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "上の銘柄タブで選んだ銘柄に絞って分析します。集計・分析タブはEP起算方式（v2）の記録のみ。旧記録" + (oldCnt > 0 ? "（" + oldCnt + "件）" : "") + "は一覧タブでのみ表示。"),
    _tabBody,
    editTarget ? React.createElement(EntryRecordForm, { data: data, save: save, initial: (editTarget && editTarget.signal) ? editTarget : null, onClose: function() { setEditTarget(null); } }) : null
  );
}
