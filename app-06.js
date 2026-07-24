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
// ===== OS値バケット【1円刻み・新方式 2026-06-25】=====
// 0〜4=帯 / 5〜24=1円刻み / 25〜=帯(選択で1円内訳に展開) / 下落(<0)=帯(OS連鎖のみ・includeNeg時)。
// 色は赤系の単色グラデーション＝OS値が高いほど濃い（下落のみグレー）。旧の5円帯(_EL_OS_BANDS_V2/_EL_OSC_BANDS)を段階的に置換。
var _EL_OS_TOP = 25;                                   // これ以上は「25円〜」帯にまとめる（選択で展開）
var _EL_OS_GLO = "#F4A6A6", _EL_OS_GHI = "#6E1414";    // グラデ: 薄赤→濃赤
function _elOsLerpHex(a, b, t) {
  var p = function(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  var x = function(n) { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? "0" : "") + n.toString(16); };
  var A = p(a), B = p(b);
  return "#" + x(A[0] + (B[0] - A[0]) * t) + x(A[1] + (B[1] - A[1]) * t) + x(A[2] + (B[2] - A[2]) * t);
}
// 代表値v(0〜25)→グラデ色。0〜4帯はv=2・25〜帯はv=25で評価。
function _elOsShade(v) { var t = Math.max(0.06, Math.min(0.98, v / (_EL_OS_TOP + 1))); return _elOsLerpHex(_EL_OS_GLO, _EL_OS_GHI, t); }
// OS値→バケットキー（文字列）。includeNeg時のみ負値を"neg"(下落)に。非数/対象外はnull。
function _elOsBucketKey(v, includeNeg) {
  if (v == null || v === "") return null;
  var n = Number(v); if (isNaN(n)) return null;
  if (n < 0) return includeNeg ? "neg" : null;
  if (n <= 4) return "0-4";
  if (n >= _EL_OS_TOP) return "25+";
  return String(Math.round(n));
}
// バケットキー→ソート用数値（neg=-1 / 0-4=0 / 整数 / 25+=大）。
function _elOsBucketOrd(key) { return key === "neg" ? -1 : key === "0-4" ? 0 : key === "25+" ? 9999 : Number(key); }
// バケットキー→ラベル。
function _elOsBucketLabel(key) { return (key == null) ? "—" : key === "neg" ? "下落" : key === "0-4" ? "0〜4円" : key === "25+" ? "25円〜" : (key + "円"); }
// バケットキー→色（neg=グレー・他は代表値のグラデ色）。
function _elOsBucketColor(key) { if (key === "neg") return "#6B7280"; var v = key === "0-4" ? 2 : key === "25+" ? _EL_OS_TOP : Number(key); return _elOsShade(v); }
// 展開可能なバケット（25〜のみ。0〜4・下落は帯のまま＝ユーザー決定 2026-06-25）。
function _elOsBucketExpandable(key) { return key === "25+"; }
// 値配列→{ vc:{整数:件数}, neg:下落件数, tot:総件数 }。1円内訳(展開)と帯集計の両方に使う。
function _elOsCountMap(vals) {
  var vc = {}, neg = 0, tot = 0;
  (vals || []).forEach(function(v) { var n = Number(v); if (v == null || v === "" || isNaN(n)) return; tot++; if (n < 0) { neg++; return; } var k = Math.round(n); vc[k] = (vc[k] || 0) + 1; });
  return { vc: vc, neg: neg, tot: tot };
}
// 整数件数マップ→グループ済みバケット件数 { key: 件数 }（includeNeg時は下落も）。0〜4と25〜は集約。
function _elOsBucketCounts(vc, neg, includeNeg) {
  var out = {};
  if (includeNeg && neg) out["neg"] = neg;
  for (var k in vc) { if (!vc.hasOwnProperty(k)) continue; var key = _elOsBucketKey(Number(k), includeNeg); if (key == null) continue; out[key] = (out[key] || 0) + vc[k]; }
  return out;
}
// バケットチップ（色付きピル）。big=やや大きめ。
function _elOsBucketChip(key, big) {
  return React.createElement("span", { style: { display: "inline-block", padding: big ? "2px 8px" : "1px 7px", borderRadius: 8, fontSize: big ? 11 : 10, fontWeight: 700, color: "#fff", background: _elOsBucketColor(key), whiteSpace: "nowrap" } }, _elOsBucketLabel(key));
}
// OS値の凡例（赤系グラデの目盛り＋下落グレー）。旧_elOsBandLegendV2の置換用ノード。
function _elOsGradLegend() {
  var stops = ["0-4", "8", "14", "20", "25+"];
  return React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px 10px" } },
    React.createElement("span", { style: { fontSize: 9, color: "#888", fontWeight: 700 } }, "OS値"),
    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", height: 11, borderRadius: 3, overflow: "hidden" } },
      stops.map(function(k) { return React.createElement("span", { key: k, title: _elOsBucketLabel(k), style: { width: 16, height: 11, background: _elOsBucketColor(k), display: "inline-block" } }); })),
    React.createElement("span", { style: { fontSize: 9, color: "#888" } }, "薄い=低い／濃い=高い"),
    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, color: "#888" } }, React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: "#6B7280", display: "inline-block" } }), "下落"));
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
    if (rr && rr.epIdx >= 0) b.eOk++;   // E到達率＝3本以内にα到達（×見送り含む）＝他表(_epReachedAt)と母数統一 2026-06-27
    if (rr && rr.judge === "ok") {
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
// OS連鎖のバケットチップ（数値キー・新方式の赤系グラデ／下落グレー）2026-06-25。
function _elOscChip(bi, big) {
  return React.createElement("span", { style: { display: "inline-block", padding: big ? "2px 8px" : "1px 6px", borderRadius: 8, fontSize: big ? 11 : 9, fontWeight: 700, color: "#fff", background: _elOscBucketColor(bi), whiteSpace: "nowrap" } }, _elOscBucketLabel(bi));
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
// OS高値→バケットキー（数値）【1円刻み・新方式 2026-06-25】。下落=-1 / 0〜4=0 / 5〜24=整数 / 25〜=25。gran引数は廃止(常に1円刻み)。非数はnull。
function _elOscBucket(v, gran) {
  if (v == null || v === "") return null;
  var n = Number(v); if (isNaN(n)) return null;
  if (n < 0) return -1;
  if (n <= 4) return 0;
  if (n >= _EL_OS_TOP) return _EL_OS_TOP;
  return Math.round(n);
}
// バケットキー(数値)→ラベル。下落=-1 / 0〜4円=0 / 25円〜=25 / 他は整数円。
function _elOscBucketLabel(key, gran) { var k = Number(key); return k < 0 ? "下落" : k === 0 ? "0〜4円" : k >= _EL_OS_TOP ? "25円〜" : (k + "円"); }
// バケットキー(数値)→色（下落=グレー・他は代表値の赤系グラデ）。
function _elOscBucketColor(key, gran) { var k = Number(key); if (k < 0) return "#6B7280"; var v = (k === 0) ? 2 : (k >= _EL_OS_TOP ? _EL_OS_TOP : k); return _elOsShade(v); }
// バケットチップ（gran廃止・数値キー）。
function _elOscChipG(key, gran, big) { return _elOscChip(key, big); }
// OS連鎖分析コンポーネント（記録帳タブ＋DayViewで共用）。props: recs/data/aiOf?/dense?。
// 状態: path=選んだ帯index配列（OS1→OS2…と絞り込み）。深さdepthでOS(depth+1)の分布を分析。
function _elOsChainSection(_ref_osc) {
  var recs = _ref_osc.recs || [];
  var data = _ref_osc.data;
  var aiOf = _ref_osc.aiOf || function(r) { return _elAlphaInfo(r, data); };
  var dense = !!_ref_osc.dense;
  var _uP = useState([]), path = _uP[0], setPath = _uP[1];
  var _uS = useState(""), sigFil = _uS[0], setSigFil = _uS[1];
  var _uG = useState("each"), gran = _uG[0], setGran = _uG[1];
  var _setGran = function(v) { setGran(v); setPath([]); };
  var bLab = function(k) { return _elOscBucketLabel(k, gran); };
  var bCol = function(k) { return _elOscBucketColor(k, gran); };
  var granBar = null;   // 粒度トグル廃止＝常に1円刻み（0〜4と25〜は帯・下落グレー）2026-06-25
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
    heat = React.createElement(_HScrollBox, { style: { marginBottom: 10 } },
      React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 3 } }, "遷移ヒートマップ（セル＝件数・濃いほど多い）"),
      React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 10 } },
        React.createElement("tbody", null, [hHead].concat(hRows))));
  }

  var _pnl = function(sum, cnt) { if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var a = Math.round(sum / cnt); return React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)); };
  var _pctN = function(num, den) { if (!den) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var p = Math.round(num / den * 100); return React.createElement("span", { style: { fontWeight: 700, color: p >= 50 ? "#1E8449" : "#B45309" } }, p + "%"); };
  var headLabels = [(gran === "each" ? "OS" + curNo + "値" : "OS" + curNo + "帯"), "件数", "E到達率"].concat(hasNext ? ["OS" + (curNo + 1) + "値"] : []).concat(["E後の勝率", "EP損益", "H1損益", "見切り率", "損切り率"]);
  var thead = React.createElement("tr", { style: { background: "transparent" } }, headLabels.map(function(t, i) { return React.createElement("th", { key: i, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: _hc } }, t); }));
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
  var table = React.createElement(_HScrollBox, null,
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
    insight = _elInsightBoxV2(items, { note: "OS" + curNo + "＝" + (curNo <= 3 ? curNo + "本目" : curNo === 4 ? "EP後H1" : "EP後H2") + "の高値（水準線比）。E到達率＝3本以内にα到達（×見送り含む）。E後の勝率＝取引（E成立）後にEP損益が利益だった割合。EP損益/H1/見切り率/損切り率は取引（E成立）分のみ。" });
  }

  var _bw = gran === "each" ? "値" : "帯";
  var intro = dense ? null : React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 8, lineHeight: 1.5 } }, "OS1の数値" + (gran === "each" ? "" : "帯") + "から始めて、行（またはヒートマップの行）をタップするごとに「その" + _bw + "のときの次のOS」へ絞り込みます。各" + _bw + "の件数・次OSの中央値/分布・成績（E到達率・E後の勝率・損益・損切り）を同時に確認できます。");

  return React.createElement("div", null, intro, sigSel, granBar, crumbBar, head, heat, table, insight);
}

// （_elOsLegsSectionV2＝各足のOS値プロファイルは記録帳の旧「OS連鎖」タブ専用だったため、タブ撤去に伴い2026-06-28に削除。OS連鎖の遷移分析_elOsChainSectionはDayView(app-04)で使用継続。）

// records配列のOS値統計（平均/中央値/最頻値/最小/最大/帯別分布dist[5]）。OS値入力なしならnull。
// osOf(s)=各記録のOS値の取り方（既定=OS1単独 s.osVal）。OS総合分析は_elOsMaxAll（OS1〜3最高値）を渡して統一。
function _elOsStatsV2(recs, osOf) {
  var _os = osOf || function(s) { return (s && s.osVal != null && s.osVal !== "") ? Number(s.osVal) : null; };
  var vals = [];
  (recs || []).forEach(function(r) {
    var s = r && r.signal ? r.signal : r;
    var n = _os(s); if (n != null && !isNaN(n)) vals.push(n);
  });
  if (!vals.length) return null;
  var sorted = vals.slice().sort(function(a, b) { return a - b; });
  var sum = 0; vals.forEach(function(v) { sum += v; });
  var mid = Math.floor(vals.length / 2);
  var med = vals.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 10) / 10;
  var cntMap = {}, modeVal = null, modeN = 0;
  vals.forEach(function(v) { var k = Math.round(v); cntMap[k] = (cntMap[k] || 0) + 1; if (cntMap[k] > modeN) { modeN = cntMap[k]; modeVal = k; } });
  var cm = _elOsCountMap(vals);
  var bcounts = _elOsBucketCounts(cm.vc, cm.neg, false);
  var bmKey = null, bmN = 0; for (var bk in bcounts) { if (bcounts.hasOwnProperty(bk) && bcounts[bk] > bmN) { bmN = bcounts[bk]; bmKey = bk; } }
  return { n: vals.length, avg: Math.round(sum / vals.length * 10) / 10, med: med,
    mode: { val: modeVal, n: modeN }, bmode: { key: bmKey, n: bmN, pct: Math.round(bmN / vals.length * 100) },
    min: sorted[0], max: sorted[sorted.length - 1], vals: vals, bcounts: bcounts };
}
// 損切り回数の集計。plan=想定(OS値−α≧損切り値)・h1=H1高値で新規・h2=H2高値で新規(H2データあり)・any=いずれか。
// rate=any÷E成立件数(_elDynResult=ok/ng/draw・%)＝他セクション(時間帯別/損切りタブ等)と母数統一 2026-06-24i。miss=E基準未達(α>OS値)件数。αと損切り値は各記録の採用値(_elAlphaInfo)
// ＝銘柄別記録(app-02)・取引(app-04)テーブルの損益計算と同一基準。H2は_elH2Miss(H1までE基準未達=H2非成立・
// 表でも合計除外)をガードして数えない。
function _elStopStatsV2(recs, data) {
  var o = { n: (recs || []).length, os: 0, entered: 0, plan: 0, h1: 0, h2: 0, any: 0, miss: 0, rate: null };
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s) return;
    var ai = _elAlphaInfo(r, data);
    if (s.osVal != null && s.osVal !== "") o.os++;
    var _dr = _elDynResult(s, ai.alpha, ai.cutLine);
    if (_dr === "miss") o.miss++; else if (_dr === "ok" || _dr === "ng" || _dr === "draw") o.entered++;   // E成立=損切り率の母数 2026-06-24i
    var p = _elPlanIsStop(s, ai.alpha, ai.cutLine);
    var h1 = !p && _elHoldIsStop(s, ai.alpha, ai.cutLine);
    var h2 = !p && !h1 && _elHas2Data(s) && !_elH2Miss(s, ai.alpha) && _elHoldIsStop2(s, ai.alpha, ai.cutLine);
    if (p) o.plan++;
    if (h1) o.h1++;
    if (h2) o.h2++;
    if (p || h1 || h2) o.any++;
  });
  if (o.entered > 0) o.rate = Math.round(o.any / o.entered * 100);   // 分母をE成立件数に(未達missは除外)＝他の損切り率と統一 2026-06-24i
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
// OS値の積み上げ分布バー（表セル用ミニバー・ホバーでバケット別件数）。引数 vals=OS値の配列・1円バケット＋赤系グラデ色 2026-06-25。
function _elOsDistBarV2(vals, w, h, incNeg) {
  var cm = _elOsCountMap(vals || []);
  var bc = _elOsBucketCounts(cm.vc, cm.neg, !!incNeg);
  var keys = Object.keys(bc).sort(function(a, b) { return _elOsBucketOrd(a) - _elOsBucketOrd(b); });
  var tot = 0; keys.forEach(function(k) { tot += bc[k]; });
  if (!tot) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var tip = keys.map(function(k) { return _elOsBucketLabel(k) + ": " + bc[k] + "件"; }).join(" / ");
  return React.createElement("span", { title: tip, style: { display: "inline-flex", width: w || 72, height: h || 10, borderRadius: 3, overflow: "hidden", background: "#f0ede6", verticalAlign: "middle" } },
    keys.map(function(k) { return React.createElement("span", { key: k, style: { width: (bc[k] / tot * 100) + "%", background: _elOsBucketColor(k), height: "100%" } }); }));
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
// OS値の凡例（赤系グラデ＋下落グレー）。旧の5円帯チップ凡例を置換 2026-06-25。
function _elOsBandLegendV2() { return _elOsGradLegend(); }
// OS値の1円刻みヒストグラム【2026-06-25／0〜24を1円刻みに変更 2026-07-03】。props: vals(値配列) / includeNeg? / w? / barH?。
// 0〜24=1円／25〜=帯(棒タップで1円内訳に展開)。色は赤系グラデ(高いほど濃い)・下落はグレー。各棒の上に件数。hoverで「ラベル: N件 (P%)」。
function _elOsHistV2(_ref) {
  var vals = _ref.vals || [];
  var includeNeg = !!_ref.includeNeg;
  var barH = _ref.barH || 96;
  var _histRecs = _ref.recs, _histAiOf = _ref.aiOf;
  var _histClickable = !!(_histRecs && _histAiOf);
  var cm = _elOsCountMap(vals);
  var xcm = _elOsCountMap(_ref.xVals || []);   // 期待度×(見送り)記録のOS最高値分布＝棒の中で「×見送り」割合を点線枠で示す用 2026-07-01→点線枠化2026-07-05
  // 同時表示（2026-07-13 ユーザー承認③・案A重ね棒/濃淡逆）: rawVals=生の最高OS(_elOsMaxAll)の配列を渡すと、生＝色付きの棒（背面・全幅）／実現(vals)＝白地に濃枠の棒（前面・細め）で同じ列に重ねる。
  // rawVals無しの呼び出し（未達タブ等）は従来どおり単系列。統計・棒クリックの取引一覧・×見送り枠は実現(vals)基準のまま。
  var rcm = _elOsCountMap(_ref.rawVals || []);
  var _dual = !!(_ref.rawVals && _ref.rawVals.length);
  var _uE = useState(false), exp = _uE[0], setExp = _uE[1];
  var _uSel = useState(null), _selKey = _uSel[0], _setSelKey = _uSel[1];
  if (!cm.tot && !rcm.tot) return React.createElement("div", { style: { color: "#ccc", fontSize: 11, padding: "6px 0" } }, "—");
  // マーカー数値（推奨基本α/＋追加α/＋損切り）を先に取得＝25円以上の展開時、データの無いマーカー値にもゼロ枠を用意して▲を載せるため。keyは_EL_OS_TOP/expに依存するので後段で算出 2026-07-01。
  var markVal = (_ref.markVal != null && !isNaN(Number(_ref.markVal))) ? Math.round(Number(_ref.markVal)) : null;
  var markVal2 = (_ref.markVal2 != null && !isNaN(Number(_ref.markVal2))) ? Math.round(Number(_ref.markVal2)) : null;
  var markVal3 = (_ref.markVal3 != null && !isNaN(Number(_ref.markVal3))) ? Math.round(Number(_ref.markVal3)) : null;
  var _xTopTot = 0; for (var _xtk in xcm.vc) { if (xcm.vc.hasOwnProperty(_xtk) && Number(_xtk) >= _EL_OS_TOP) _xTopTot += xcm.vc[_xtk]; }
  var _rTopTot = 0; for (var _rtk in rcm.vc) { if (rcm.vc.hasOwnProperty(_rtk) && Number(_rtk) >= _EL_OS_TOP) _rTopTot += rcm.vc[_rtk]; }
  var bars = [];
  if (includeNeg && (cm.neg || (_dual && rcm.neg))) bars.push({ key: "neg", x: "下落", full: "下落", cnt: cm.neg, rcnt: rcm.neg || 0, xcnt: xcm.neg || 0, color: "#6B7280", band: true });
  for (var v = 0; v < _EL_OS_TOP; v++) bars.push({ key: String(v), x: String(v), full: v + "円", cnt: cm.vc[v] || 0, rcnt: rcm.vc[v] || 0, xcnt: xcm.vc[v] || 0, color: _elOsShade(v) });   // 0〜24を1円刻みの個別バーに（旧: 0〜4は帯）2026-07-03
  var _topSet0 = {};
  for (var tk in cm.vc) { if (cm.vc.hasOwnProperty(tk) && Number(tk) >= _EL_OS_TOP) _topSet0[Number(tk)] = 1; }
  for (var rk0 in rcm.vc) { if (rcm.vc.hasOwnProperty(rk0) && Number(rk0) >= _EL_OS_TOP) _topSet0[Number(rk0)] = 1; }   // 生だけに存在する高OSのバーも展開に含める（同時表示 2026-07-13）
  var topKeys = Object.keys(_topSet0).map(Number).sort(function(a, b) { return a - b; });
  var topTot = 0; topKeys.forEach(function(k) { topTot += (cm.vc[k] || 0); });
  if (exp && topKeys.length) {
    var _topSet = {}; topKeys.forEach(function(k) { _topSet[k] = 1; });
    [markVal, markVal2, markVal3].forEach(function(mv) { if (mv != null && mv >= _EL_OS_TOP) _topSet[mv] = 1; });   // マーカー値(≥25)はデータが無くてもゼロ本数の枠を用意して▲を載せる 2026-07-01
    Object.keys(_topSet).map(Number).sort(function(a, b) { return a - b; }).forEach(function(k) { bars.push({ key: "t" + k, x: String(k), full: k + "円", cnt: cm.vc[k] || 0, rcnt: rcm.vc[k] || 0, xcnt: xcm.vc[k] || 0, color: _elOsShade(_EL_OS_TOP), collapse: true }); });
  } else {
    bars.push({ key: "25+", x: "25〜", full: "25円〜", cnt: topTot, rcnt: _rTopTot, xcnt: _xTopTot, color: _elOsBucketColor("25+"), band: true, expand: topKeys.length > 0 });
  }
  var maxC = 1; bars.forEach(function(b) { if (b.cnt > maxC) maxC = b.cnt; if (_dual && b.rcnt > maxC) maxC = b.rcnt; });
  var _xTot = (_ref.xVals || []).length;   // 期待度×(見送り)の総件数（凡例用）
  // マーカーのbucketキー算出（数値markVal/2/3は上部で取得済。keyは_EL_OS_TOP/expに依存＝ここで算出）。"0".."24" / 25+ / 展開時"t"+値。
  var markKey = null;
  if (markVal != null) {
    if (markVal >= _EL_OS_TOP) markKey = exp ? ("t" + markVal) : "25+";
    else markKey = String(markVal);   // 0〜24は個別バー 2026-07-03
  }
  var markKey2 = null;
  if (markVal2 != null) {
    if (markVal2 >= _EL_OS_TOP) markKey2 = exp ? ("t" + markVal2) : "25+";
    else markKey2 = String(markVal2);   // 0〜24は個別バー 2026-07-03
  }
  var markKey3 = null;
  if (markVal3 != null) {
    if (markVal3 >= _EL_OS_TOP) markKey3 = exp ? ("t" + markVal3) : "25+";
    else markKey3 = String(markVal3);   // 0〜24は個別バー 2026-07-03
  }
  var mark3Label = _ref.mark3Label || "推奨応用α＋損切り値";   // 赤マークの意味ラベル（応用あり＝応用α＋損切り／応用なし＝基本α＋損切り）2026-07-13
  var colNodes = bars.map(function(b) {
    var pct = cm.tot ? Math.round(b.cnt / cm.tot * 100) : 0;
    var _isSel = _histClickable && _selKey === b.key;
    var _isMark = markKey != null && b.key === markKey;
    var _isMark2 = markKey2 != null && b.key === markKey2;
    var _isMark3 = markKey3 != null && b.key === markKey3;
    var click = _histClickable
      ? function() { _setSelKey(_selKey === b.key ? null : b.key); }
      : (b.expand ? function() { setExp(true); } : (b.collapse ? function() { setExp(false); } : null));
    var _outline = _isSel ? "2px solid #9A3412" : (_isMark ? "2px solid #0369A1" : (_isMark2 ? "2px solid #EA580C" : (_isMark3 ? "2px solid #C0392B" : (b.band ? "1.5px dashed rgba(120,53,15,0.5)" : "none"))));
    var _title = b.full + ": " + (_dual ? ("実現" + b.cnt + "件・生" + (b.rcnt || 0) + "件") : (b.cnt + "件 (" + pct + "%)")) + (b.xcnt ? "・うち期待度×(見送り)" + b.xcnt + "件" : "") + (_isMark ? "（現在の推奨基本α " + markVal + "円）" : "") + (_isMark2 ? "（推奨応用α " + markVal2 + "円）" : "") + (_isMark3 ? "（" + mark3Label + " " + markVal3 + "円）" : "") + (_histClickable ? "（クリックで取引一覧＝実現OS基準）" : "");
    var cntNode = _dual
      ? React.createElement("div", { style: { marginBottom: 2, lineHeight: 1.05, textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 10, color: _isSel ? "#9A3412" : (b.cnt ? "#9A3412" : "#ccc"), fontWeight: 700 } }, b.cnt),
          React.createElement("div", { style: { fontSize: 8.5, color: b.rcnt ? "#999" : "#ddd" } }, b.rcnt || 0))
      : React.createElement("div", { style: { fontSize: 10, color: _isSel ? "#9A3412" : (b.cnt ? "#555" : "#ccc"), fontWeight: _isSel ? 700 : 400, marginBottom: 2, lineHeight: 1 } }, b.cnt);
    var barNode;
    if (_dual) {
      // 案A重ね棒（濃淡逆・2026-07-13）: 背面=生（色付き・全幅）／前面=実現（白地＋濃枠・細め）。×見送りの点線は実現バー内の割合表示。
      var hR = b.cnt ? Math.max(2, Math.round(b.cnt / maxC * barH)) : 0;
      var hG = b.rcnt ? Math.max(2, Math.round(b.rcnt / maxC * barH)) : 0;
      var hBox = Math.max(hR, hG, 2);
      var xPct = (b.cnt && b.xcnt) ? Math.min(100, Math.round(b.xcnt / b.cnt * 100)) : 0;
      barNode = React.createElement("div", { style: { width: "100%", height: hBox + "px", position: "relative", outline: _outline, outlineOffset: 1 } },
        hG ? React.createElement("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: hG + "px", background: b.color, borderRadius: "2px 2px 0 0" } }) : null,
        hR ? React.createElement("div", { style: { position: "absolute", bottom: 0, left: "18%", width: "64%", height: hR + "px", background: "#fff", border: "1.5px solid #9A3412", boxSizing: "border-box", borderRadius: "2px 2px 0 0" } },
          xPct ? React.createElement("div", { title: "期待度×（見送り）" + b.xcnt + "件", style: { width: "100%", height: xPct + "%", boxSizing: "border-box", borderBottom: "1.5px dotted #9A3412", display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", lineHeight: 1 } }, b.xcnt)) : null) : null,
        (!hG && !hR) ? React.createElement("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#eee" } }) : null);
    } else {
      barNode = React.createElement("div", { style: { width: "100%", height: (b.cnt ? Math.max(2, Math.round(b.cnt / maxC * barH)) : 2) + "px", background: b.cnt ? "transparent" : "#eee", borderRadius: "2px 2px 0 0", overflow: "hidden", outline: _outline, outlineOffset: 1 } },
        (b.cnt && b.xcnt) ? React.createElement("div", { title: "期待度×（見送り）" + b.xcnt + "件", style: { width: "100%", height: Math.min(100, Math.round(b.xcnt / b.cnt * 100)) + "%", boxSizing: "border-box", border: "1.5px dotted #9A3412", borderRadius: "2px 2px 0 0", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#9A3412", lineHeight: 1 } }, b.xcnt)) : null,
        b.cnt ? React.createElement("div", { style: { width: "100%", height: (100 - (b.xcnt ? Math.min(100, Math.round(b.xcnt / b.cnt * 100)) : 0)) + "%", background: b.color } }) : null);
    }
    return React.createElement("div", { key: b.key, title: _title, onClick: click,
        style: { flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", cursor: click ? "pointer" : "default" } },
      cntNode, barNode);
  });
  var xNodes = bars.map(function(b) {
    var _isMark = markKey != null && b.key === markKey;
    var _isMark2 = markKey2 != null && b.key === markKey2;
    var _isMark3 = markKey3 != null && b.key === markKey3;
    return React.createElement("div", { key: b.key, style: { flex: "1 1 0", minWidth: 0, textAlign: "center", fontSize: 9, color: _isMark ? "#0369A1" : (_isMark2 ? "#EA580C" : (_isMark3 ? "#C0392B" : (b.band ? "#9A3412" : "#999"))), fontWeight: (_isMark || _isMark2 || _isMark3 || b.band) ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } },
      _isMark ? React.createElement("div", { style: { fontSize: 8, color: "#0369A1", lineHeight: 1 } }, "▲") : (_isMark2 ? React.createElement("div", { style: { fontSize: 8, color: "#EA580C", lineHeight: 1 } }, "▲") : (_isMark3 ? React.createElement("div", { style: { fontSize: 8, color: "#C0392B", lineHeight: 1 } }, "▲") : null)), b.x);
  });
  var toggle = topKeys.length ? React.createElement("div", { style: { fontSize: 10, color: "#9A3412", marginTop: 4, cursor: "pointer", fontWeight: 700 }, onClick: function() { setExp(!exp); } }, exp ? "▲ 25円〜をまとめる" : "▼ 25円〜の内訳を見る（" + topKeys.length + "種・" + topTot + "件）") : null;
  var _selEl = null;
  if (_histClickable && _selKey != null) {
    var _selRecs = (_histRecs || []).filter(function(r) {
      var ov = (_ref.osOf || _elOsMaxAll)(r.signal); if (ov == null) return false;   // 棒タップの絞り込みも分布と同じOS基準（実現/生）で 2026-07-09
      var nv = Number(ov); if (isNaN(nv) || nv < 0) return false;
      if (_selKey === "0-4") return nv <= 4;
      if (_selKey === "25+") return Math.round(nv) >= _EL_OS_TOP;
      if (String(_selKey).charAt(0) === "t") return Math.round(nv) === Number(String(_selKey).slice(1));
      return Math.round(nv) === Number(_selKey);
    });
    var _selLbl = _selKey === "0-4" ? "0〜4円" : _selKey === "25+" ? (_EL_OS_TOP + "円〜") : (String(_selKey).charAt(0) === "t" ? (String(_selKey).slice(1) + "円") : (_selKey + "円"));
    _selEl = React.createElement("div", { style: { marginTop: 8, border: "1px solid #FB923C", borderRadius: 6, overflow: "hidden" } },
      React.createElement("div", { style: { background: "#FFF7ED", padding: "4px 8px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #FB923C", display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "OS " + _selLbl + " の取引（" + _selRecs.length + "件）"),
        React.createElement("span", { onClick: function() { _setSelKey(null); }, style: { cursor: "pointer", color: "#bbb", fontWeight: 400 } }, "×閉じる")),
      React.createElement("div", { style: { padding: "0 6px 6px" } }, _elOsTradeMini(_selRecs, _histAiOf)));
  }
  var _markCapBase = (markVal != null && markKey != null && bars.some(function(b) { return b.key === markKey; }))
    ? React.createElement("div", { style: { fontSize: 9, color: "#0369A1", fontWeight: 700, marginTop: 4 } }, "▲ 青字＝現在の推奨基本α（" + markVal + "円）")
    : null;
  var _markCap2 = (markVal2 != null && markKey2 != null && bars.some(function(b) { return b.key === markKey2; }))
    ? React.createElement("div", { style: { fontSize: 9, color: "#EA580C", fontWeight: 700, marginTop: 2 } }, "▲ オレンジ字＝推奨応用α（" + markVal2 + "円）")
    : null;
  var _markCap3 = (markVal3 != null && markKey3 != null && bars.some(function(b) { return b.key === markKey3; }))
    ? React.createElement("div", { style: { fontSize: 9, color: "#C0392B", fontWeight: 700, marginTop: 2 } }, "▲ 赤字＝" + mark3Label + "（" + markVal3 + "円）")
    : null;
  var markCap = (_markCapBase || _markCap2 || _markCap3) ? React.createElement(React.Fragment, null, _markCapBase, _markCap2, _markCap3) : null;
  var _xCap = _xTot > 0 ? React.createElement("div", { style: { fontSize: 9, color: "#6B7280", fontWeight: 700, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 } },
    React.createElement("span", { style: { display: "inline-block", width: 14, height: 9, borderRadius: 2, boxSizing: "border-box", backgroundColor: "transparent", border: "1.5px dotted #9A3412" } }),
    "点線枠＝期待度×（見送り） " + _xTot + "件・枠外 " + (cm.tot - _xTot) + "件（この母数のうち・棒内の割合で表示）") : null;
  var _dualCap = _dual ? React.createElement("div", { style: { fontSize: 9, color: "#6B7280", fontWeight: 700, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" } },
    React.createElement("span", { style: { display: "inline-block", width: 14, height: 9, borderRadius: 2, background: "#D97706" } }),
    "色棒＝生の最高OS（" + rcm.tot + "件）",
    React.createElement("span", { style: { display: "inline-block", width: 10, height: 9, borderRadius: 2, background: "#fff", border: "1.5px solid #9A3412", boxSizing: "border-box", marginLeft: 6 } }),
    "白枠＝実現OS（×/損切り打ち切り・" + cm.tot + "件）・数字は上＝実現／下＝生") : null;
  return React.createElement("div", { style: { width: _ref.w || "100%", minWidth: 0 } },
    React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 2, height: (barH + (_dual ? 26 : 14)) + "px" } }, colNodes),
    React.createElement("div", { style: { display: "flex", gap: 2, borderTop: "1.5px solid #e0ddd6", paddingTop: 3 } }, xNodes),
    toggle, _dualCap, markCap, _xCap, _selEl);
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
  var recs = _elCollectAllSignals(data).filter(function(r) { return r.stock === stock && _elInclData(r.signal); });   // 最良α badge＝分析母数（データ算入）2026-07-22f
  var b = _elBestAlphaV2(recs, data);
  if (!b) return null;
  var txt;
  if (b.h1 && b.h2 && b.h1.a === b.h2.a) txt = b.h1.a + "円";
  else txt = (b.h1 ? "H1 " + b.h1.a + "円" : "") + (b.h1 && b.h2 ? "・" : "") + (b.h2 ? "H2 " + b.h2.a + "円" : "");
  var _fy = _elPnlFmt;   // 共通化 2026-07-14: 非null呼び出しのみ＝_elPnlFmtと同一出力
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
  var _thE = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
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
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 8 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
        _thE("EP位置"), _thE("件数"), _thE("OS値"), _thE("E後の勝率"), _thE("最終損益"), _thE("見切り率"), _thE("損切り率"))),
      React.createElement("tbody", null, ["ep0", "ep1", "ep2"].map(function(k, i) {
        var d = _EL_EPPOS_DEFS[i], o = st[k];
        return React.createElement("tr", { key: k },
          _tdE(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
            React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: d.color, display: "inline-block" } }), d.label), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
          _tdE(o.cnt ? o.cnt + "件（" + _pct(o.cnt) + "%）" : "0件", { fontWeight: 700 }),
          _tdE(_elOsMMCell(o.osv)), _tdE(_elEwinCell(o.ok, o.ng, o.draw)),
          _tdE(_elPnlMMCell(o.h2Arr)),
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
    // 読み取りの基準を表と同じ最終損益(h2)へ統一（旧=H1基準で表とズレていた・監査F4 2026-07-12）
    ["ep0", "ep1", "ep2"].forEach(function(k, i) { var o = st[k]; if (o.h2Cnt && (hbest == null || o.h2 / o.h2Cnt > hbest.v)) hbest = { v: o.h2 / o.h2Cnt, i: i }; });
    if (hbest) items.push(React.createElement("span", null, "1件あたりの最終損益が最も良いのは", _elInsightEmV2(["EP=OS1", "EP=OS2", "EP=OS3"][hbest.i]), "（平均", _elInsightEmV2(Math.round(hbest.v).toLocaleString() + "円"), "）。"));
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
    var _ov = _elOsMaxAll(s); if (_ov != null) o.osv.push(_ov);
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
  var _thT = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
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
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 8 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
        _thT("時間帯"), _thT("件数"), _thT("OS値"), _thT("E到達率"), _thT("E後の勝率"), _thT("見切り率"), _thT("損切り率"), _thT("EP損益"), _thT("H1損益"))),
      React.createElement("tbody", null, bodyRows)));
  var _cum = function(keys) { var o = mk(); keys.forEach(function(k) { var b = st[k]; for (var p in b) { if (b.hasOwnProperty(p)) { if (typeof b[p] === "number") o[p] += b[p]; else if (Array.isArray(b[p])) o[p] = o[p].concat(b[p]); } } }); return o; };
  var c915 = st.b1, c930 = _cum(["b1", "b2"]), late = _cum(["b3", "b4"]);
  var _line = function(label, o) {
    if (!o.cnt) return null;
    var avgOs = _elMedian(o.osv);
    var t = o.ok + o.ng + o.draw, win = t ? Math.round(o.ok / t * 100) : null;
    return React.createElement("span", null, label, "は ", _elInsightEmV2(o.cnt + "件"),
      avgOs != null ? React.createElement("span", null, "・中央OS ", _elInsightEmV2(avgOs + "円")) : null,
      "・E到達率 ", _elInsightEmV2(Math.round(o.reach / o.cnt * 100) + "%"),
      "・損切り率 ", _elInsightEmV2(((o.ok + o.ng + o.draw) ? Math.round(o.stop / (o.ok + o.ng + o.draw) * 100) : 0) + "%"),
      win != null ? "（勝率 " + win + "%）" : null, "。");
  };
  var items = [];
  var l1 = _line("寄り〜9:15に出た寄り足OS", c915); if (l1) items.push(l1);
  var l2 = _line("寄り〜9:30（累計）", c930); if (l2) items.push(l2);
  if (c930.cnt && late.cnt) {
    var s930 = (c930.ok + c930.ng + c930.draw) ? Math.round(c930.stop / (c930.ok + c930.ng + c930.draw) * 100) : 0, sLate = (late.ok + late.ng + late.draw) ? Math.round(late.stop / (late.ok + late.ng + late.draw) * 100) : 0;
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
  var _thS = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
  var _tdS = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var _rate = function(n, d, hi) { if (!d) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var p = Math.round(n / d * 100); return React.createElement("span", { style: { fontWeight: 700, color: p >= (hi || 50) ? "#1E8449" : "#B45309" } }, p + "%"); };
  var _avg = function(sum, cnt) { if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var a = Math.round(sum / cnt); return React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)); };
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 4 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
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
  var _thX = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
  var _tdX = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 2 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
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
  var _thX = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
  var _tdX = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 2 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
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
    React.createElement(_HScrollBox, null,
      React.createElement("svg", { viewBox: "0 0 " + W + " " + H, style: { width: "100%", minWidth: 480, height: "auto", display: "block" } }, kids)),
    legend);
}
// 期間別の損益バー＋勝率（複合）。periods=[{label,value,win(0〜100)}]（古い→新しい）。バー=赤(利益)/緑(損失)・勝率=破線(右軸0〜100%)。2026-06-22d。
function _elBarChartV2(periods, opts) {
  opts = opts || {};
  var ps = periods || [];
  if (!ps.length) return null;
  var W = 680, H = opts.height || 200, padL = 56, padR = 40, padT = 10, padB = 22;
  var yMin = 0, yMax = 0;
  ps.forEach(function(p) { var v = p.value || 0; if (v < yMin) yMin = v; if (v > yMax) yMax = v; });
  if (yMin === yMax) yMax = yMin + 100;
  var _niceStep = function(raw) { if (!(raw > 0)) return 1; var pw = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)); var f = raw / pw; var nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10; return nf * pw; };
  var _step = _niceStep((yMax - yMin) / 5); if (!(_step > 0)) _step = 1;
  yMin = Math.floor(yMin / _step) * _step; yMax = Math.ceil(yMax / _step) * _step; if (yMax <= yMin) yMax = yMin + _step;
  var n = ps.length, plotW = W - padL - padR, plotH = H - padT - padB;
  var xC = function(i) { return padL + plotW * (i + 0.5) / n; };
  var yAt = function(v) { return padT + plotH * (1 - (v - yMin) / (yMax - yMin)); };
  var wy = function(w) { return padT + plotH * (1 - (w == null ? 0 : w) / 100); };
  var bw = Math.max(3, Math.min(40, plotW / n * 0.6));
  var kids = [];
  for (var gv = yMin, gi = 0; gv <= yMax + _step * 1e-6 && gi < 100; gv += _step, gi++) {
    var gy = yAt(gv);
    kids.push(React.createElement("line", { key: "g" + gi, x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eee9e0", strokeWidth: 1 }));
    kids.push(React.createElement("text", { key: "gl" + gi, x: padL - 4, y: gy + 3, textAnchor: "end", fontSize: 9, fill: "#999" }, Math.round(gv).toLocaleString()));
  }
  [0, 50, 100].forEach(function(w) { kids.push(React.createElement("text", { key: "wl" + w, x: W - padR + 4, y: wy(w) + 3, textAnchor: "start", fontSize: 8, fill: "#B45309" }, w + "%")); });
  var y0 = yAt(0);
  ps.forEach(function(p, i) { var v = p.value || 0, yv = yAt(v); kids.push(React.createElement("rect", { key: "b" + i, x: xC(i) - bw / 2, y: Math.min(yv, y0), width: bw, height: Math.max(0.5, Math.abs(yv - y0)), rx: 2, fill: v >= 0 ? "#C0392B" : "#1E8449", opacity: 0.88 })); });
  kids.push(React.createElement("line", { key: "zero", x1: padL, y1: y0, x2: W - padR, y2: y0, stroke: "#cbb89a", strokeWidth: 1.2 }));
  var wpts = ps.map(function(p, i) { return p.win != null ? (xC(i) + "," + wy(p.win)) : null; }).filter(Boolean);
  if (wpts.length >= 2) kids.push(React.createElement("polyline", { key: "winl", points: wpts.join(" "), fill: "none", stroke: "#B45309", strokeWidth: 1.6, strokeDasharray: "4 3" }));
  ps.forEach(function(p, i) { if (p.win == null) return; kids.push(React.createElement("circle", { key: "wc" + i, cx: xC(i), cy: wy(p.win), r: 2.5, fill: "#fff", stroke: "#B45309", strokeWidth: 1.4 })); });
  var step = Math.max(1, Math.ceil(n / 8));
  ps.forEach(function(p, i) { if (i % step !== 0 && i !== n - 1) return; kids.push(React.createElement("text", { key: "xt" + i, x: xC(i), y: H - 6, textAnchor: "middle", fontSize: 8, fill: "#999" }, p.label)); });
  var legend = React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 2, fontSize: 10, color: "#666" } },
    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { width: 10, height: 10, background: "#C0392B", borderRadius: 2, display: "inline-block" } }), "利益"),
    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { width: 10, height: 10, background: "#1E8449", borderRadius: 2, display: "inline-block" } }), "損失"),
    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { width: 14, height: 0, borderTop: "2px dashed #B45309", display: "inline-block" } }), opts.winLabel || "勝率(右軸)"));
  return React.createElement("div", null,
    React.createElement(_HScrollBox, null, React.createElement("svg", { viewBox: "0 0 " + W + " " + H, style: { width: "100%", minWidth: 480, height: "auto", display: "block" } }, kids)),
    legend);
}
// 曜日揃えヒートマップ（カレンダー型）。days=[{date:"YYYY-MM-DD",value}]（日別）。列=月〜金・行=週(上が古い→下が最新)。曜日ごとの傾向を縦で見る。記録の無い営業日枠は薄い空セル。セルは「M/D ＋ 損益円」をフル表記。2026-06-22d（並び順・表記を2026-06-22に変更）。
function _elWeekdayHeatV2(days, opts) {
  opts = opts || {};
  var ds = (days || []).filter(function(d) { return d && d.date; });
  if (!ds.length) return null;
  var map = {}, maxAbs = 1;
  ds.forEach(function(d) { map[d.date] = d.value; var a = Math.abs(d.value || 0); if (a > maxAbs) maxAbs = a; });
  var dates = ds.map(function(d) { return d.date; }).sort();
  var fmt = function(dd) { return dd.getFullYear() + "-" + ("0" + (dd.getMonth() + 1)).slice(-2) + "-" + ("0" + dd.getDate()).slice(-2); };
  var mondayOf = function(s) { var dd = new Date(s + "T00:00:00"); dd.setDate(dd.getDate() - ((dd.getDay() + 6) % 7)); return dd; };
  var m0 = mondayOf(dates[0]), mE = mondayOf(dates[dates.length - 1]);
  var weeks = []; for (var w = new Date(m0); w <= mE && weeks.length < 80; w = new Date(w.getTime() + 7 * 86400000)) weeks.push(new Date(w));
  if (weeks.length > 53) weeks = weeks.slice(weeks.length - 53);
  // 古い順（上が古い週・下が最新週）。以前は weeks.reverse() で最新を上にしていた。2026-06-22
  var dows = ["月", "火", "水", "木", "金"];
  var kids = [React.createElement("div", { key: "h0" }, "")];
  dows.forEach(function(dn, i) { kids.push(React.createElement("div", { key: "h" + i, style: { fontSize: 10, color: "#9A3412", fontWeight: 700, textAlign: "center", paddingBottom: 2 } }, dn)); });
  weeks.forEach(function(mon, wi) {
    kids.push(React.createElement("div", { key: "wl" + wi, style: { fontSize: 9, color: "#888", fontWeight: 600, textAlign: "right", paddingRight: 4, alignSelf: "center", whiteSpace: "nowrap" } }, (mon.getMonth() + 1) + "/" + mon.getDate()));
    for (var i = 0; i < 5; i++) {
      var dd = new Date(mon.getTime() + i * 86400000), dkey = fmt(dd);
      if (!Object.prototype.hasOwnProperty.call(map, dkey)) { kids.push(React.createElement("div", { key: "c" + wi + "_" + i, style: { borderRadius: 5, minHeight: 28, background: "#faf9f5", border: "1px dashed #eee9e0" } })); continue; }
      var v = map[dkey] || 0, inten = Math.min(1, Math.abs(v) / maxAbs);
      var bg = v === 0 ? "#f1efe8" : (v > 0 ? "rgba(192,57,43," : "rgba(30,132,73,") + (0.16 + inten * 0.74).toFixed(2) + ")";
      var txt = (inten > 0.4 && v !== 0) ? "#fff" : (v > 0 ? "#7F1D1D" : v < 0 ? "#13502D" : "#999");
      kids.push(React.createElement("div", { key: "c" + wi + "_" + i, title: dkey + " " + (v >= 0 ? "+" : "") + Math.round(v).toLocaleString() + "円",
        style: { borderRadius: 5, padding: "5px 2px", textAlign: "center", background: bg, color: txt, fontSize: 9, lineHeight: 1.2, minWidth: 0 } },
        React.createElement("div", { style: { fontWeight: 700 } }, (dd.getMonth() + 1) + "/" + dd.getDate()),
        React.createElement("div", null, (v >= 0 ? "+" : "") + Math.round(v).toLocaleString() + "円")));
    }
  });
  return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "auto repeat(5, 1fr)", gap: 4 } }, kids);
}
// 累積損益（記録順）: 最終損益/実現の累積線。寄与は合計行と同一基準（手じまい=_elHold2TotParts.main）。2026-07-09 EP/H1系列を廃止＝最終損益に集約。
function _elCumPnlSectionV2(props) {
  var recs = props.recs, aiOf = props.aiOf;
  // 時間かぶり除外: dataが渡された場合は良い方を累積から抜く＝合計行と同一基準を維持。scopeStock指定時は同一銘柄内のみ（銘柄別ビュー）2026-07-08
  if (props.data) recs = (recs || []).filter(function(r) { return !_elCollExcluded(props.data, r, props.scopeStock); });
  // 2026-07-18g 要審議も累積損益に算入（見送りと同じ・_elTotAccumと同基準）。旧＝ここで_elIsReviewをfilter除外していた（2026-07-14c）
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
  var c2 = 0, cr = 0;
  var pH2 = [], pReal = [], xTicks = [], xLabels = [], lastDate = null;
  _filtered.forEach(function(r, i) {
    var s = r.signal, ai = aiOf(r);
    var h2p = _elHold2TotParts(s, ai.alpha, ai.cutLine);
    if (h2p.main != null) c2 += h2p.main;
    var rv = _elIsEntered(s, r.item) ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null;
    if (rv != null) cr += rv;
    pH2.push(c2); pReal.push(cr);
    xLabels.push((r.date || "") + (s.time ? (" " + s.time) : ""));
    if (r.date !== lastDate) { xTicks.push({ i: i, label: (r.date || "").slice(5) }); lastDate = r.date; }
  });
  var _stp = Math.max(1, Math.ceil(xTicks.length / 6));
  xTicks = xTicks.filter(function(_x, ti) { return ti % _stp === 0; });
  var chart = _elLineChartV2([
    { label: "最終損益", color: "#D97706", pts: pH2 },
    { label: "実現損益", color: "#7C3AED", pts: pReal }
  ], { height: 300, targetTicks: 10, xTicks: xTicks, xLabels: xLabels, hoverIdx: hoverIdx, onHover: function(idx) { setHoverIdx(idx); } });
  return React.createElement("div", null, sel, chart);
}
// α感応度カーブ: α=0〜20円の各値で全記録を再計算した最終損益（＝旧H2・（）外）の合計。読み取りに手じまい最大α。2026-07-09 EP/H1系列を廃止＝最終損益に集約。
function _elAlphaCurveSectionV2(recs, aiOf) {
  if (!recs || !recs.length) return null;
  var pH2 = [], xTicks = [];
  for (var a = 0; a <= 20; a++) {
    var t = _elTotAccum(recs, {
      signal: function(r) { return r.signal; },
      alpha: (function(_a) { return function() { return _a; }; })(a),
      cut: function(r) { return aiOf(r).cutLine; }
    });
    pH2.push(t.hold2 || 0);
    if (a % 5 === 0) xTicks.push({ i: a, label: "α" + a + "円" });
  }
  var b2 = 0;
  pH2.forEach(function(v, i) { if (v > pH2[b2]) b2 = i; });
  var chart = _elLineChartV2([
    { label: "最終損益", color: "#D97706", pts: pH2 }
  ], { xTicks: xTicks, height: 200 });
  return React.createElement("div", null, chart,
    _elInsightBoxV2([
      React.createElement("span", null, "最終損益の合計が最大になるのは", _elInsightEmV2("α=" + b2 + "円"), "（", _elInsightEmV2(_elPnlFmt(pH2[b2])), "）。")
    ], { note: "損切り値は各記録の採用値・最終損益＝期待度○が途切れた所で手じまい（（）外・旧H2損益と同一基準）" }));
}

// ===== 推奨基本α値【条件再設計 2026-06-22／ユーザー方針】=====
// 銘柄ごと、その期間の全トレードに同じα(5〜20円)を当ててシミュレーションしたとき、①損切りにならない ②H1で利益が出ている を重視して選ぶ。
// 選定【2026-06-22c】: 件数フロア（最大scN×_EL_BASE_MIN_FRAC・最低_EL_BASE_MIN_N件）かつ 到達率≥_EL_BASE_MIN_ERATE のαの中で、合成スコア = _EL_BASE_W_STOP×(1−損切り率) + _EL_BASE_W_H1×H1勝率 が最大。
//       高αは到達率が下がり標本が薄い「いいとこ取り(選抜バイアス)」でスコアが上振れるため、件数＋到達率フロアで除外する。同点は件数の多い方→低α。フロア皆無なら件数最大のαを参考(status="na")。
// 損切り率=EP〜H1で損切りした割合(H2は含めない)・H1勝率=H1損益>0の割合。いずれも「OS1〜3でEP到達し、H1結果が判定できる記録」だけが母数。
// 追加α(_elAddAlphaReco)は基本αへの上乗せを実データ総当たりで評価＝補助。詳細は各関数のコメント。[[project_scalping_analysis_design]]
// 推奨基本αの探索範囲（5〜20円・1円刻み）。0〜4円は推奨しない（ユーザー方針 2026-06-21）。内部の理想α計算(_EL_IDEAL_ALPHAS=0〜50)とは別＝基本αは現実的に5〜20で設定する前提。
var _EL_BASE_ALPHAS = (function() { var _a = []; for (var _i = 5; _i <= 20; _i++) _a.push(_i); return _a; })();
// ★選定用の探索範囲は0〜20円（2026-07-13 到達率ベース化＝低いαも★になりうる。表示・H1参考列は従来どおり5〜20が主・0〜4は_lowSweepで参考表示）。
var _EL_BASE_ALPHAS_FULL = (function() { var _a = []; for (var _i = 0; _i <= 20; _i++) _a.push(_i); return _a; })();
// 推奨α＝理想α−_EL_ALPHA_OFFSET（2026-07-13 ユーザー方針・2026-07-22 オフセット1→2）: 理想αちょうどに指値すると「指値同値」でギリギリ約定しないことが多いので、オフセットぶん下げてフィルしやすくする。理想α=到達率ベースの★／推奨α=実際に置く値（フォーム/EPナビ/本日採用α/シミュへ流れる）。max(0,…)で負にしない。既定2（調整UIなし・ユーザー指定）。
var _EL_ALPHA_OFFSET = 2;   // 推奨α＝理想α−この値（0未満にしない）。理想αちょうどに指値すると「指値同値」でギリギリ約定しないことが多いので下げてフィルしやすくするマージン。基本α・応用α共通。2026-07-22 1→2（ユーザー決定）
// 理想α選定 2026-07-15f ユーザー方針: 前提ゲート通過候補のうち、平均最終損益（1件あたり・avgH2）が最大のα＝理想。同点は累計Σが大きい（標本が厚い）方→値が小さい方。旧・順位和方式(2026-07-15e)を置換。基本α・応用α・追加α・浮き足で共通。
// 平均最大で最良候補を返す 2026-07-15f: cands（ゲート通過済み）のうち平均(avgOf)が最大の候補を返す。同点は累計Σ(sigOf)大→値(aOf)小。旧・順位和方式を置換（関数名_elBordaBestは互換のため据え置き）。
function _elBordaBest(cands, sigOf, avgOf, aOf) { if (!cands || !cands.length) return null; var A = aOf || function() { return 0; }; var S = sigOf || function() { return 0; }; var V = avgOf || function() { return 0; }; return cands.slice().sort(function(x, y) { return (V(y) - V(x)) || (S(y) - S(x)) || (A(x) - A(y)); })[0]; }
// 日付→期間バケットキー（month=YYYY-MM / week=その週の月曜YYYY-MM-DD / 他=all）。週ロジックは期間タブと共通。
function _elBucketKey(date, gran) {
  if (gran === "day") return date;
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
  if (gran === "day") return key.slice(5).replace("-", "/");
  if (gran === "month") return key.replace("-", "/");
  if (gran === "week") {
    var mon = new Date(key + "T00:00:00");
    var fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    return (mon.getMonth() + 1) + "/" + mon.getDate() + "〜" + (fri.getMonth() + 1) + "/" + fri.getDate();
  }
  return "全期間";
}
// ===== EMA修正前（2026年4月以前）の判定 2026-07-20i =====
// EntryLogView内のローカル定義からトップレベルへ移動（年月週日ピッカーが選択肢の足切りにも使うため＝単一源）。
// 境界=2026-05-01（月別キーは2026-05）。g==="month"なら"YYYY-MM"、それ以外は"YYYY-MM-DD"で比較。
function _elIsEmaRefPeriod(k, g) { return (g === "month") ? (String(k) < "2026-05") : (String(k) < "2026-05-01"); }

// ===== 年月週日カスケード期間選択 2026-07-20i =====
// 選択値 sel = { y:[2026,…]|null, m:["2026-07",…]|null, w:["2026-07-13",…]|null, d:["2026-07-13",…]|null }
//   null＝その階層は「全て」（無制限）。全階層nullなら全期間＝素通し。各階層はAND（積）で効く。
//   週キーは月曜日＝_elBucketKey(date,"week")と同一。週の所属判定は必ずこのヘルパー経由（自前の曜日計算を書かない）。
// ⚠️旧_elFilterPeriodの「今週」はローカル深夜0時をtoISOString()していたためJSTで窓が1日前へずれ、金曜が落ちて日曜が入っていた。
//   こちらは_elBucketKey（ローカルgetter）だけを使うので同じ穴を踏まない。
var _EL_PSEL_Y0 = 2026;   // 選択肢に出す最初の年（記録の開始年）
var _EL_PSEL_LV = ["y", "m", "w", "d"];
function _elPSelAll() { return { y: null, m: null, w: null, d: null }; }
function _elPSelIsAll(sel) { return !sel || (!sel.y && !sel.m && !sel.w && !sel.d); }
function _elPSelThisMonth() { var t = todayStr(); return { y: [Number(t.slice(0, 4))], m: [t.slice(0, 7)], w: null, d: null }; }   // シミュの既定＝今月のみ（週日は全て）
// 上位階層を変えたら下位はリセット＝下位の選択（週/日）が範囲外を指したまま残るのを防ぐ。
function _elPSelSet(sel, lvl, val) {
  var s = { y: sel.y, m: sel.m, w: sel.w, d: sel.d };
  s[lvl] = (val && val.length) ? val : null;
  for (var j = _EL_PSEL_LV.indexOf(lvl) + 1; j < _EL_PSEL_LV.length; j++) s[_EL_PSEL_LV[j]] = null;
  return s;
}
function _elPSelToggle(sel, lvl, key) {
  var cur = sel[lvl];
  if (!cur) return _elPSelSet(sel, lvl, [key]);            // 「全て」状態から1つ選ぶ＝そのキーだけに絞る
  var i = -1; cur.forEach(function(v, ix) { if (String(v) === String(key)) i = ix; });
  var next = (i >= 0) ? cur.filter(function(v, ix) { return ix !== i; }) : cur.concat([key]);
  return _elPSelSet(sel, lvl, next);                        // 空になったら_elPSelSetがnull＝「全て」へ戻す
}
function _elPSelMatch(sel, date) {
  if (!date) return false;
  // 2026-07-20j EMA修正前（2026年4月以前）はフィルタ側でも常に落とす＝「全て」でも通さない（ユーザー選択）。
  // 旧: 選択肢から隠すだけだったため、月チップに5〜7月しか出ないのに「全て」では4月が通り、見た目と実態が食い違っていた。
  // ⚠️この一行により4月の記録は記録帳から一切見えなくなる（🗂記録一覧含む）＝「算入しない」の徹底。
  if (_elIsEmaRefPeriod(date)) return false;
  if (sel.y && sel.y.indexOf(Number(date.slice(0, 4))) < 0) return false;
  if (sel.m && sel.m.indexOf(date.slice(0, 7)) < 0) return false;
  if (sel.w && sel.w.indexOf(_elBucketKey(date, "week")) < 0) return false;
  if (sel.d && sel.d.indexOf(date) < 0) return false;
  return true;
}
// 2026-07-20j 「全て」でも素通しにしない＝_elPSelMatchの4月除外を必ず通すため早期returnを撤去。
function _elPSelFilter(recs, sel) {
  return (recs || []).filter(function(r) { return _elPSelMatch(sel, r && r.date); });
}
function _elPSelSig(sel) { return _elPSelIsAll(sel) ? "all" : (_EL_PSEL_LV.map(function(k) { return sel[k] ? sel[k].join(",") : "*"; }).join("|")); }   // 署名（_autoSig等の再計算判定用）
// 選択肢の列挙＋各期間の件数。年=2026〜今年／月=1月〜今月（未来は出さない・EMA修正前は隠す）／週=選択中の月に1日でも重なる月曜週／日=選択中の週(無ければ月)の平日で今日まで。
function _elPSelOpts(recs, sel) {
  var t = todayStr(), curY = Number(t.slice(0, 4)), curM = Number(t.slice(5, 7));
  var cy = {}, cm = {}, cw = {}, cd = {};
  (recs || []).forEach(function(r) {
    var dt = r && r.date; if (!dt) return;
    cy[dt.slice(0, 4)] = (cy[dt.slice(0, 4)] || 0) + 1;
    cm[dt.slice(0, 7)] = (cm[dt.slice(0, 7)] || 0) + 1;
    var wk = _elBucketKey(dt, "week"); cw[wk] = (cw[wk] || 0) + 1;
    cd[dt] = (cd[dt] || 0) + 1;
  });
  var _p2 = function(n) { return ("0" + n).slice(-2); };
  var years = [];
  for (var y = _EL_PSEL_Y0; y <= curY; y++) years.push({ key: y, label: y + "", n: cy[String(y)] || 0 });
  var selY = (sel.y && sel.y.length) ? sel.y.slice().sort(function(a, b) { return a - b; }) : years.map(function(o) { return o.key; });
  var months = [], multiY = selY.length > 1;
  selY.forEach(function(yy) {
    var last = (yy === curY) ? curM : 12;
    for (var m = 1; m <= last; m++) {
      var k = yy + "-" + _p2(m);
      if (_elIsEmaRefPeriod(k, "month")) continue;   // 2026年1〜4月は選択肢に出さない（EMA修正前＝算入しない）
      months.push({ key: k, label: (multiY ? (yy + "/") : "") + m + "月", n: cm[k] || 0 });
    }
  });
  var selM = (sel.m && sel.m.length) ? sel.m : months.map(function(o) { return o.key; });
  var wSeen = {}, weeks = [];
  selM.forEach(function(mk) {
    var last = new Date(Number(mk.slice(0, 4)), Number(mk.slice(5, 7)), 0).getDate();
    for (var dd = 1; dd <= last; dd++) {
      var ds = mk + "-" + _p2(dd);
      if (ds > t) break;
      if (_elIsEmaRefPeriod(ds)) continue;
      var wk = _elBucketKey(ds, "week");
      if (wSeen[wk]) continue;
      wSeen[wk] = 1;
      weeks.push({ key: wk, label: _elBucketLabel(wk, "week"), n: cw[wk] || 0 });
    }
  });
  weeks.sort(function(a, b) { return a.key < b.key ? -1 : 1; });
  var days = [], dSeen = {};
  var _pushDay = function(ds) {
    if (ds > t || dSeen[ds] || _elIsEmaRefPeriod(ds)) return;
    var dw = new Date(ds + "T00:00:00").getDay();
    if (dw === 0 || dw === 6) return;   // 土日は市場が休みで記録が存在しないので選択肢に出さない
    dSeen[ds] = 1;
    days.push({ key: ds, label: Number(ds.slice(5, 7)) + "/" + Number(ds.slice(8, 10)), n: cd[ds] || 0 });
  };
  if (sel.w && sel.w.length) {
    sel.w.forEach(function(wk) {
      var b = new Date(wk + "T00:00:00");
      for (var i = 0; i < 5; i++) {
        var d2 = new Date(b); d2.setDate(b.getDate() + i);
        var ds = d2.getFullYear() + "-" + _p2(d2.getMonth() + 1) + "-" + _p2(d2.getDate());
        if (!sel.m || sel.m.indexOf(ds.slice(0, 7)) >= 0) _pushDay(ds);   // 月をまたぐ週は選択中の月の側だけ出す
      }
    });
  } else {
    selM.forEach(function(mk) {
      var last = new Date(Number(mk.slice(0, 4)), Number(mk.slice(5, 7)), 0).getDate();
      for (var dd = 1; dd <= last; dd++) _pushDay(mk + "-" + _p2(dd));
    });
  }
  days.sort(function(a, b) { return a.key < b.key ? -1 : 1; });
  return { years: years, months: months, weeks: weeks, days: days };
}
// 折りたたみ時のサマリー「2026年 ▸ 7月 ▸ 全週 ▸ 全日」
function _elPSelSummary(sel, opts) {
  var _lb = function(list, arr, allTxt, suf) {
    if (!arr || !arr.length) return allTxt;
    if (arr.length === 1) { var f = null; (list || []).forEach(function(o) { if (String(o.key) === String(arr[0])) f = o; }); return (f ? f.label : String(arr[0])) + (suf || ""); }
    return arr.length + "件選択";
  };
  return _lb(opts.years, sel.y, "全年", "年") + " ▸ " + _lb(opts.months, sel.m, "全月") + " ▸ " + _lb(opts.weeks, sel.w, "全週") + " ▸ " + _lb(opts.days, sel.d, "全日");
}
// UI本体（案B: 折りたたみサマリー＋変更▾で4段チップ展開）。props: value(sel) / onChange(sel) / recs(件数表示の母数) / label
function _ElPeriodPicker(props) {
  var sel = props.value || _elPSelAll(), onSet = props.onChange, recs = props.recs || [];
  var _uo = useState(false), open = _uo[0], setOpen = _uo[1];
  var opts = _elPSelOpts(recs, sel);
  var hitN = _elPSelFilter(recs, sel).length;
  var _chip = function(on, txt, n, dim, onClick, key) {
    return React.createElement("button", { key: key, type: "button", onClick: onClick,
      style: { padding: "3px 10px", fontSize: 10.5, fontWeight: on ? 800 : 600, borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap",
        border: "1px solid " + (on ? "#0F766E" : "#ddd"), background: on ? "#0F766E" : "#fff", color: on ? "#fff" : (dim ? "#C4C0B8" : "#666") } },
      txt, (n != null) ? React.createElement("span", { style: { fontSize: 8.5, marginLeft: 4, opacity: 0.75 } }, n) : null);
  };
  var _row = function(lvl, lbl, list) {
    var cur = sel[lvl];
    return React.createElement("div", { key: lvl, style: { display: "flex", gap: 5, alignItems: "flex-start", flexWrap: "nowrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E", minWidth: 20, paddingTop: 4, flexShrink: 0 } }, lbl),
      React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap", flex: 1 } },
        [_chip(!cur, "全て", null, false, function() { onSet(_elPSelSet(sel, lvl, null)); }, "__all__")].concat(
          list.map(function(o) {
            var on = !!cur && cur.some(function(v) { return String(v) === String(o.key); });
            return _chip(on, o.label, o.n, o.n === 0, function() { onSet(_elPSelToggle(sel, lvl, o.key)); }, String(o.key));
          }))));
  };
  return React.createElement("div", { style: { marginBottom: 8 } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 8, padding: "6px 10px" } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E", whiteSpace: "nowrap" } }, props.label || "対象期間"),
      React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, color: "#0F6E56" } }, _elPSelSummary(sel, opts)),
      React.createElement("span", { style: { fontSize: 9, color: "#7FA9A0" } }, hitN + "件"),
      React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 5 } },
        // ラベルは「クリア」＝すぐ隣の母数トグルにも「全期間」があり、同じ文言が2つ並ぶと紛らわしいため 2026-07-20i
        (!_elPSelIsAll(sel)) ? React.createElement("button", { type: "button", title: "選択を解除して全期間に戻す", onClick: function() { onSet(_elPSelAll()); },
          style: { padding: "2px 9px", fontSize: 10, fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid #99F6E4", background: "#fff", color: "#0F766E" } }, "クリア") : null,
        React.createElement("button", { type: "button", onClick: function() { setOpen(!open); },
          style: { padding: "2px 11px", fontSize: 10.5, fontWeight: 800, borderRadius: 6, cursor: "pointer", border: "1px solid #99F6E4", background: "#fff", color: "#0F766E", whiteSpace: "nowrap" } }, open ? "閉じる ▴" : "変更 ▾"))),
    open ? React.createElement("div", { style: { border: "1px dashed #99F6E4", borderRadius: 8, padding: "9px 10px", marginTop: 6, background: "#fff" } },
      _row("y", "年", opts.years), _row("m", "月", opts.months), _row("w", "週", opts.weeks), _row("d", "日", opts.days),
      React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 2 } }, "上の階層を変えると下の階層は「全て」に戻ります。数字は各期間の記録件数（0件は薄字）。2026年1〜4月はEMA修正前のため選択肢に出しません。")) : null);
}
// 推奨基本αの選定パラメータ【再設計 2026-06-22】。後で調整可。
var _EL_BASE_MIN_N = 10;          // 最低エントリー件数（H1結果が判定できる記録数 scN）の絶対下限。未満のαは推奨対象外＝薄い標本の偶然採用を防ぐ。2026-07-08 3→10（推奨基本α/追加α/損切り共通の下限・件数の信頼性重視・ユーザー要望＝全推奨一律。10件未満は(仮)/参考表示に）。
var _EL_BASE_MIN_FRAC = 0.5;     // 件数フロア（実データ連動）: 最も件数(scN)の多いαの何割以上を要求するか。高αの薄い標本(選抜バイアスでスコア上振れ)を除外 2026-06-22b。後で調整可。※2026-07-13以降は旧スコア方式(_elBaseAlphaPickScore)のみで使用。
var _EL_BASE_N_PREF = 20;        // ★選定の有効件数(E成立)フロア第1候補（2026-07-13 条件式化・ユーザー方針=20件、無ければ_EL_BASE_MIN_N(10件)へ自動緩和）。
var _EL_BASE_MAX_STOPRATE = 0.40;   // ★選定の損切り率(手じまい基準)上限（2026-07-13=20%→2026-07-14e=25%→2026-07-15h=30%→2026-07-21 ユーザー緩和=40%以下）。基本α/応用α/追加α共通。
var _EL_BASE_MAX_STOPRATE_2 = 0.40; // 該当なし時の緩和上限（40%・status=na参考。主ゲート_EL_BASE_MAX_STOPRATEに追従 2026-07-21）。
var _EL_FREQ_MAX = 5;               // ★選定の頻度ゲート（2026-07-13c 導入→2026-07-13d 理想を4→5に緩和 ユーザー方針=理想は5営業日に1回以内）＝活動営業日span÷そのαの到達実日数 < これ（＝頻度5未満・2026-07-15d ユーザーで≤→<に厳格化）。損切り率40%まで緩和しても該当なしなら最後にこのゲートを外す（status=na）。span算出不能/到達0はゲート素通り。
// ===== 前提損切り値（2026-07-13 ユーザー指定）＝推奨α分析（基本α/追加αのスイープ・★選定・詳細データ表）はこの損切り値を前提に評価 =====
// 「損切り値が何円であることを前提として、分析の結果、推奨α値はこうなった」。既定15円・custom.anaCutPremiseに保存（全端末同期）。
// 対象＝推奨系スイープのみ（_elBaseAlphaPick/Score・_elAddAlphaPickDate/RecoScore・詳細データ表の表示スイープ）。
// 非対象＝実績損益・損切りタブ（損切り値を振る分析）・推奨損切り(_elCutPick)・α意思決定表/感応度（採用値明記済み）・効果検証（実績）。
// _elAnaCutCurの同期は_elAlphaInfo(app-05)内＝aiOf構築のたびにdataから更新（各画面のaiOfは全て_elAlphaInfo経由のため描画時に必ず最新化される）。
var _EL_ANA_CUT_DEF = 15;
var _elAnaCutCur = _EL_ANA_CUT_DEF;
// 頻度ゲート用の休場日カレンダー（祝日も除外）のモジュール同期先 2026-07-15g: 選定の_freqOkが表示の頻度列と同じ「祝日も除外」で評価できるようにする（_elAlphaInfo app-05でdataごとにメモして書き込む）。null=土日のみ除外にフォールバック。
var _elHoliCur = null;
function _elAnaCut(data) { var v = data && data.custom ? data.custom.anaCutPremise : null; var n = Number(v); return (v != null && v !== "" && !isNaN(n) && n >= 1 && n <= 50) ? Math.round(n) : _EL_ANA_CUT_DEF; }
function _elAnaAiOf(aiOf) { return function(r) { var ai = aiOf(r) || {}; return { alpha: ai.alpha, cutLine: _elAnaCutCur }; }; }
// 前提損切り値のステッパー（記録帳のα値タブ/集計タブ詳細データ上に設置・保存はcustom.anaCutPremise＝全推奨が連動）。
function _ElAnaCutCtl(props) {
  var v = _elAnaCut(props.data), save = props.save;
  var _set = function(nv) { if (nv < 1) nv = 1; if (nv > 50) nv = 50; save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { anaCutPremise: nv }) }); }); };
  var _btn = function(lbl, d) { return React.createElement("button", { type: "button", onClick: function() { _set(v + d); }, style: { padding: "0 7px", fontSize: 10, fontWeight: 800, lineHeight: 1.5, border: "1px solid #FCD34D", borderRadius: 4, background: "#fff", color: "#B45309", cursor: "pointer" } }, lbl); };
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 7, padding: "3px 9px", whiteSpace: "nowrap" } },
    React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#B45309" } }, "🛑 前提損切り値"),
    React.createElement("b", { style: { fontSize: 14, color: "#B45309", fontVariantNumeric: "tabular-nums" } }, v + "円"),
    React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", gap: 1 } }, _btn("↑", 1), _btn("↓", -1)),
    React.createElement("span", { style: { fontSize: 8.5, color: "#B45309" } }, "推奨α分析（基本/追加・フォーム/EPナビ/シミュの推奨含む）はこの損切り値を前提に評価・既定" + _EL_ANA_CUT_DEF + "円"));
}
// ===== 到達率の下限（2026-07-13 ユーザー指定）＝基本α★の付け方＝「この到達率以上・黒字を満たすαのうち平均最終損益（1件あたり）が最大のα（2026-07-15f）を理想とし推奨＝理想−_EL_ALPHA_OFFSET」 =====
// 既定70%（2026-07-14e 60→50→2026-07-15j 50→60→2026-07-22f 60→70 ユーザー要望「推奨条件に到達率70%以上を加えて」）・10刻みで調整可・custom.anaReachFloorに保存（全端末同期）。同期は_elAlphaInfo(app-05)内で_elAnaCutと並んで実施。基本α★(_elBaseAlphaPick)＋応用α★(_elSpecialAlphaPick)の両方が全条件ゲートでこの到達率下限を使用。※目標到達率を満たすαが1つも無い時は_EL_ANA_REACH_FLOOR2(50%)まで引き下げて参考(na/青★)選定（2026-07-15j）。
var _EL_ANA_REACH_DEF = 70;
var _EL_ANA_REACH_FLOOR2 = 50;   // 到達率フォールバックの下限（2026-07-15j ユーザー要望）: 目標到達率で該当αが無い時ここまで引き下げて再選定＝参考(na/青★)。これ以下には下げない安全網。基本α/応用α共通。
var _elAnaReachCur = _EL_ANA_REACH_DEF;
function _elAnaReach(data) { var v = data && data.custom ? data.custom.anaReachFloor : null; var n = Number(v); return (v != null && v !== "" && !isNaN(n) && n >= 0 && n <= 100) ? Math.round(n / 10) * 10 : _EL_ANA_REACH_DEF; }
// 到達率下限のステッパー（前提損切り値の隣に設置・10刻み・保存はcustom.anaReachFloor＝基本αの★が連動）。
function _ElAnaReachCtl(props) {
  var v = _elAnaReach(props.data), save = props.save;
  var _set = function(nv) { if (nv < 0) nv = 0; if (nv > 100) nv = 100; save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { anaReachFloor: nv }) }); }); };
  var _btn = function(lbl, d) { return React.createElement("button", { type: "button", onClick: function() { _set(v + d); }, style: { padding: "0 7px", fontSize: 10, fontWeight: 800, lineHeight: 1.5, border: "1px solid #BAE6FD", borderRadius: 4, background: "#fff", color: "#0369A1", cursor: "pointer" } }, lbl); };
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 7, padding: "3px 9px", whiteSpace: "nowrap" } },
    React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0369A1" } }, "🎯 到達率の下限"),
    React.createElement("b", { style: { fontSize: 14, color: "#0369A1", fontVariantNumeric: "tabular-nums" } }, v + "%"),
    React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", gap: 1 } }, _btn("↑", 10), _btn("↓", -10)),
    React.createElement("span", { style: { fontSize: 8.5, color: "#0369A1" } }, "基本αの理想＝この到達率以上・頻度" + _EL_FREQ_MAX + "未満・黒字を満たすαのうち平均最終損益（1件あたり）が最大のα／推奨＝理想−" + _EL_ALPHA_OFFSET + "円・既定" + _EL_ANA_REACH_DEF + "%（満たすαが無ければ" + _EL_ANA_REACH_FLOOR2 + "%まで引き下げて参考=青★）"));
}
// ===== 根拠別 推奨応用αの下限（2026-07-13 ユーザー指定）＝根拠で絞った母数のプール件数（その根拠の応用〇記録数＝画面のn=・EP到達/判定は問わない）がこの数以上のときだけ「根拠別」を採用。未満は銘柄全体の応用αへフォールバック =====
// 既定15件・custom.specialMinDecidedに保存（全端末同期）。同期は_elAlphaInfo(app-05)内。対象＝EPナビ/早見の根拠別推奨応用α（_epnSpecialRecoFrom app-04）のみ。記録フォームの推奨応用αは元々銘柄全体母数なので対象外。
var _EL_SPECIAL_MIN_DECIDED_DEF = 15;
var _elSpecialMinDecidedCur = _EL_SPECIAL_MIN_DECIDED_DEF;
function _elSpecialMinDecided(data) { var v = data && data.custom ? data.custom.specialMinDecided : null; var n = Number(v); return (v != null && v !== "" && !isNaN(n) && n >= 1 && n <= 100) ? Math.round(n) : _EL_SPECIAL_MIN_DECIDED_DEF; }
function _ElSpecialMinCtl(props) {
  var v = _elSpecialMinDecided(props.data), save = props.save;
  var _set = function(nv) { if (nv < 1) nv = 1; if (nv > 100) nv = 100; save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { specialMinDecided: nv }) }); }); };
  var _btn = function(lbl, d) { return React.createElement("button", { type: "button", onClick: function() { _set(v + d); }, style: { padding: "0 7px", fontSize: 10, fontWeight: 800, lineHeight: 1.5, border: "1px solid #FED7AA", borderRadius: 4, background: "#fff", color: "#9A3412", cursor: "pointer" } }, lbl); };
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 7, padding: "3px 9px", whiteSpace: "nowrap" } },
    React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "🧩 根拠別応用αの下限"),
    React.createElement("b", { style: { fontSize: 14, color: "#9A3412", fontVariantNumeric: "tabular-nums" } }, v + "件"),
    React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", gap: 1 } }, _btn("↑", 1), _btn("↓", -1)),
    React.createElement("span", { style: { fontSize: 8.5, color: "#9A3412" } }, "EPナビの根拠別推奨応用αはプール件数（n=）がこの件数以上で採用・未満は銘柄全体へフォールバック・既定" + _EL_SPECIAL_MIN_DECIDED_DEF + "件"));
}
var _EL_BASE_MIN_ERATE = 0.5;    // 到達率フロア: EP到達率(OS3まで)がこの値未満のαは推奨対象外＝約定しにくい高αを除外（ユーザー方針 2026-06-22c）。後で調整可。
var _EL_BASE_W_STOP = 0.7;       // 合成スコアの重み: 損切り回避 (1−損切り率)。
var _EL_BASE_W_H1 = 0.3;         // 合成スコアの重み: H1勝率。
var _EL_BASE_SCORE_EPS = 0.03;   // スコアの僅差判定。最大スコアからこの幅以内は同点扱い→件数(到達率)の多い方を優先。
var _EL_BASE_ADD_MAX = 30;       // 追加αの探索上限（基本α+1〜+30円・合計は最大50円）。
var _EL_ADD_STOPRATE_2 = 0.30;   // 推奨追加α 第2段の損切り率しきい値（30%以下）。第1段は0%（完全回避）・第2段は≤これ・どちらも無ければ損切り率が最も低いものを選ぶ。後で調整可（2026-06-29d）。
var _EL_ADD_MIN_ERATE = 0.4;     // 推奨追加α 到達率フロア: EP到達率(OS3まで)がこの値未満の加算は第1・第2段では推奨しない＝届かない高αを除外（基本αの_EL_BASE_MIN_ERATEと同思想・独立つまみ）。第3段(最後の砦)には課さない。後で調整可（2026-06-30）。
// 指定αを全recに一律適用したシミュレーション集計。
// 対象=「OS1〜OS3でEP到達した記録」だけ（3本以内にEP到達しない記録は未到達扱い）。entered=対象件数・eRate=entered/n=OS3までのEP到達率。
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
    var within2 = !!(rr && rr.epIdx >= 0 && rr.epIdx <= 2);   // OS1〜OS3でEP到達（=「OS3まで」）2026-07-01: 到達判定をOS2→OS3へ拡大
    if (!within2) return;   // OS3までにEP未到達は集計対象外（基本α上は未到達扱い）
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
// _elBaseAlphaEval の一般化（記録ごとにαを変えられる版）2026-07-07: alphaOf(r)→そのレコードのα（null=このαが算出できない記録＝母数から除外＝nに数えない）。返り値shapeは_elBaseAlphaEvalと同一（a=null）。各記録日の推奨基本α＋追加αの総当たり（_elAddAlphaDetailV2の日付別表）用。固定α版と挙動一致（alphaOfが常に同一値を返せば_elBaseAlphaEvalと同一）。
function _elAlphaEvalByFn(recs, aiOf, alphaOf) {
  var pnl = 0, epPnl = 0, stopN = 0, epStopN = 0, n = 0, entered = 0, hasPnl = false, hasEp = false, wOk = 0, wNg = 0, wDr = 0;
  var scN = 0, stopH1N = 0, h1WinN = 0;
  (recs || []).forEach(function(r) {
    var s = r.signal; if (!s) return;
    var _a = alphaOf(r); if (_a == null) return;   // このαが算出できない記録（推奨基本α履歴不足など）は母数外＝nに数えない
    var c = aiOf(r).cutLine;
    n++;
    var rr = _epResolve(s, _a);
    var within2 = !!(rr && rr.epIdx >= 0 && rr.epIdx <= 2);
    if (!within2) return;
    entered++;
    var epStop = _elPlanIsStop(s, _a, c);
    var h1Stop = _elHoldIsStop(s, _a, c);
    var hd = _elDynHold(s, _a, c);
    var pl = _elDynPlanned(s, _a, c);
    if (pl != null) { epPnl += pl; hasEp = true; }
    if (hd != null) { pnl += hd; hasPnl = true; }
    if (epStop) epStopN++;
    var res = _elDynResult(s, _a, c);
    if (res === "ok") wOk++; else if (res === "ng") wNg++; else if (res === "draw") wDr++;
    var hasH2 = _elHas2Data(s);
    if (epStop || h1Stop || (hasH2 && !_elH2Miss(s, _a) && _elHoldIsStop2(s, _a, c))) stopN++;
    var determinable = epStop || h1Stop || hd != null;
    if (determinable) {
      scN++;
      if (epStop || h1Stop) stopH1N++;
      else if (hd != null && hd > 0) h1WinN++;
    }
  });
  var decided = wOk + wNg + wDr;
  var stopRate = scN > 0 ? stopH1N / scN : null;
  var h1win = scN > 0 ? h1WinN / scN : null;
  var score = scN > 0 ? (_EL_BASE_W_STOP * (1 - stopRate) + _EL_BASE_W_H1 * h1win) : null;
  return { a: null, pnl: hasPnl ? pnl : null, epPnl: hasEp ? epPnl : null, stopN: stopN, epStopN: epStopN, n: n, entered: entered, eRate: n > 0 ? entered / n : 0, hasPnl: hasPnl, hasEp: hasEp, wOk: wOk, wNg: wNg, wDr: wDr, decided: decided, ewin: decided > 0 ? wOk / decided : 0, scN: scN, stopH1N: stopH1N, h1WinN: h1WinN, stopRate: stopRate, h1win: h1win, score: score };
}
// 最終損益(H2)ベースの反実仮想エバリュエータ 2026-07-12: alphaOf(r)→そのレコードの総合α（null=母数外）。_elAlphaEvalByFn(H1版)の最終損益版＝到達(entered)/E成立(decided)/損切り率/利確率(最終損益>0)/想定損益(Σ最終損益h2Sum)/平均(avgH2)/スコアを返す。損益は取引・銘柄別記録と同一基準(_elHold2TotParts.main=（）外最終損益)。損切り率・利確率の分母＝E成立(_elDynResult ok/ng/draw)。スコア＝0.7×(1−損切り率)+0.3×利確率。浮き足加算率スイープ(_elUkiPctSweep)で使用。
function _elH2EvalByFn(recs, aiOf, alphaOf) {
  var n = 0, entered = 0, decided = 0, stopN = 0, takeN = 0, h2Sum = 0, h2Cnt = 0;
  // 2026-07-16e 追加: medH2(中央値)・avgWin/avgLoss(勝ち/負け平均)を既存1パス内で収集＝プール再走査なし（α毎のsortが1回増えるだけ）。
  // 母数は平均/Σと同じ h2Cnt（_elHold2TotParts.main が非null＝最終損益が確定した件数）＝decided と一致しないことがある（EP×見送り・H2未達で main=null）。
  var h2Vals = [], winSum = 0, lossSum = 0, lossN = 0;
  (recs || []).forEach(function(r) {
    var s = r.signal; if (!s) return;
    var a = alphaOf(r); if (a == null) return;
    var c = aiOf(r).cutLine;
    n++;
    var rr = _epResolve(s, a);
    if (!(rr && rr.epIdx >= 0 && rr.epIdx <= 2)) return;   // OS1〜3でEP未到達＝到達せず
    entered++;
    var res = _elDynResult(s, a, c);
    if (!(res === "ok" || res === "ng" || res === "draw")) return;   // E成立(decided)のみ損切り/利確/損益の母数
    decided++;
    if (_elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c))) stopN++;
    var t2 = _elHold2TotParts(s, a, c);
    if (t2 && t2.main != null) {
      h2Sum += t2.main; h2Cnt++; h2Vals.push(t2.main);
      if (t2.main > 0) { takeN++; winSum += t2.main; } else { lossN++; lossSum += t2.main; }   // 勝ち/負けの境界は利確率(takeN)と同一＝main>0が勝ち
    }
  });
  var stopRate = decided > 0 ? stopN / decided : null;
  var takeRate = decided > 0 ? takeN / decided : null;
  var score = decided > 0 ? (_EL_BASE_W_STOP * (1 - stopRate) + _EL_BASE_W_H1 * takeRate) : null;
  var medH2 = null;
  if (h2Cnt) { var _sv = h2Vals.slice().sort(function(x, y) { return x - y; }), _mi = (_sv.length - 1) / 2; medH2 = (_sv.length % 2) ? _sv[_mi] : (_sv[Math.floor(_mi)] + _sv[Math.ceil(_mi)]) / 2; }   // 昇順ソートの中央（偶数件は中2値の平均）＝_elOsPctlV2の_q(0.5)と同型
  return { n: n, entered: entered, eRate: n > 0 ? entered / n : 0, decided: decided, stopN: stopN, stopRate: stopRate, takeN: takeN, takeRate: takeRate, h2Sum: h2Cnt ? h2Sum : null, h2Cnt: h2Cnt, avgH2: h2Cnt ? (h2Sum / h2Cnt) : null, score: score, medH2: medH2, avgWin: takeN ? (winSum / takeN) : null, avgLoss: lossN ? (lossSum / lossN) : null };
}
// ===== 推奨のデュアル評価（最終損益基準の並走 2026-07-12・承認①）=====
// 主軸のH1推奨（_elBaseAlphaPick等）はそのまま、同じ母数・同じフロア思想で最終損益(手じまい・_elH2EvalByFn)のスイープを並走し「最終基準ならどの値か」を併記する。
// 意図＝UI損益は最終損益に統一済み(07-09〜10)なのに意思決定だけH1基準という分裂の可視化。数ヶ月併走して両者の乖離を見てから主軸を決める。
// 推奨基本αの最終損益版: 母数=_elBaseAlphaPickと同一（追加α〇/浮き足〇/RN〇除外）。選定=E成立数(decided)≥フロア かつ 到達率≥_EL_BASE_MIN_ERATE かつ Σ最終損益>0 の中でスコア(0.7×(1−損切り率)+0.3×利確率)最大（同点は件数多→低α）。
function _elBaseAlphaH2Pick(recs, aiOf) {
  if (!recs || !recs.length) return null;
  var pool = recs.filter(_elIsBaseAlphaPoolRec);
  if (!pool.length) return null;
  var sweep = _EL_BASE_ALPHAS.map(function(a) { var e = _elH2EvalByFn(pool, aiOf, function() { return a; }); e.a = a; return e; });
  var maxN = sweep.reduce(function(m, e) { return Math.max(m, e.decided || 0); }, 0);
  var floorN = Math.max(_EL_BASE_MIN_N, Math.round(maxN * _EL_BASE_MIN_FRAC));
  var cand = sweep.filter(function(e) { return e.decided >= floorN && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.score != null && e.h2Sum != null && e.h2Sum > 0; });
  if (!cand.length) return { alpha: null, status: "none", sweep: sweep, minN: floorN };
  cand.sort(function(x, y) { return (x.score - y.score) || (x.decided - y.decided) || (y.a - x.a); });
  var p = cand[cand.length - 1];
  return { alpha: p.a, score: p.score, stopRate: p.stopRate, takeRate: p.takeRate, h2Sum: p.h2Sum, decided: p.decided, eRate: p.eRate, status: "ok", sweep: sweep, minN: floorN };
}
// 推奨追加αの最終損益版: 母数=追加α〇（浮き足/RN除外・呼び出し側で絞り済みを渡す）。基本α+addの一様スイープをE成立≥_EL_BASE_MIN_N かつ Σ最終>0で絞り、損切り率最小→最小加算。
function _elAddAlphaH2Pick(recs, aiOf, baseAlpha) {
  if (!recs || !recs.length || baseAlpha == null) return null;
  var cands = [];
  for (var add = 1; add <= _EL_BASE_ADD_MAX; add += 1) {
    var tot = baseAlpha + add;
    if (tot > 50) break;
    var e = _elH2EvalByFn(recs, aiOf, function() { return tot; });
    if (e.decided >= _EL_BASE_MIN_N && e.h2Sum != null && e.h2Sum > 0) cands.push({ add: add, e: e });
  }
  if (!cands.length) return null;
  cands.sort(function(x, y) { return ((x.e.stopRate == null ? 1 : x.e.stopRate) - (y.e.stopRate == null ? 1 : y.e.stopRate)) || (x.add - y.add); });
  var p = cands[0];
  return { add: p.add, stopRate: p.e.stopRate, takeRate: p.e.takeRate, h2Sum: p.e.h2Sum, decided: p.e.decided };
}
// 推奨損切りの最終損益版: 採用α実値のままcutだけ置換（H1版_elCutEvalと同意味論）・平均最終損益でH1版と同じ「タイト優先」ルール。
function _elCutH2Eval(recs, aiOf, cut) {
  var sum = 0, nn = 0, stopN = 0, takeN = 0;
  (recs || []).forEach(function(r) {
    var s = r.signal; if (!s) return;
    var alpha = aiOf(r).alpha; if (alpha == null) return;
    var rr = _epResolve(s, alpha);
    if (!(rr && rr.epIdx >= 0 && rr.epIdx <= 2)) return;
    var res = _elDynResult(s, alpha, cut);
    if (!(res === "ok" || res === "ng" || res === "draw")) return;
    var t2 = _elHold2TotParts(s, alpha, cut);
    if (!t2 || t2.main == null) return;
    nn++; sum += t2.main;
    if (_elPlanIsStop(s, alpha, cut) || _elHoldIsStop(s, alpha, cut) || (_elHas2Data(s) && !_elH2Miss(s, alpha) && _elHoldIsStop2(s, alpha, cut))) stopN++;
    else if (t2.main > 0) takeN++;
  });
  return { cut: cut, n: nn, sum: nn ? sum : null, mean: nn ? sum / nn : null, stopRate: nn ? stopN / nn : null, takeRate: nn ? takeN / nn : null };
}
function _elCutPickH2(recs, aiOf) {
  if (!recs || !recs.length) return null;
  var sweep = _EL_CUT_CANDS.map(function(c) { return _elCutH2Eval(recs, aiOf, c); });
  var cand = sweep.filter(function(e) { return e.n >= _EL_BASE_MIN_N && e.mean != null; });
  if (!cand.length) return null;
  var maxMean = cand.reduce(function(m, e) { return Math.max(m, e.mean); }, -Infinity);
  var tol = Math.max(_EL_CUT_TOL_MIN, Math.abs(maxMean) * _EL_CUT_TOL_FRAC);
  var near = cand.filter(function(e) { return e.mean >= maxMean - tol; });
  near.sort(function(x, y) { return x.cut - y.cut; });
  return { cut: near[0].cut, mean: near[0].mean, stopRate: near[0].stopRate, takeRate: near[0].takeRate, n: near[0].n, status: "ok", sweep: sweep };
}
// デュアル評価バッジ: H1主軸の推奨値に最終損益基準の答え合わせを添える（一致=緑✓・不一致=紫で最終基準値・算出不可=非表示）。
function _elH2AgreeNode(h1Val, h2Val, unit, pfx) {
  if (h2Val == null || h1Val == null) return null;
  var same = h2Val === h1Val;
  return React.createElement("span", { title: "最終損益（手じまい・旧H2）基準で同じスイープを評価した結果。スコア＝0.7×(1−損切り率)＋0.3×利確率・黒字条件＝Σ最終損益>0。主軸のH1推奨と数ヶ月併走して乖離を見るためのデュアル表示 2026-07-12", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontSize: 9, fontWeight: 800, borderRadius: 4, padding: "1px 6px", marginLeft: 4, verticalAlign: "middle", color: same ? "#1E8449" : "#6D28D9", background: same ? "#EAF3DE" : "#F5F3FF", border: "1px solid " + (same ? "#A7D28D" : "#DDD6FE") } }, same ? ("✓最終基準も" + (pfx || "") + h2Val + unit) : ("最終基準 " + (pfx || "") + h2Val + unit));
}
// ===== RNまたぎ加算の分析ボード（シグナル総合「🔢RN」・2026-07-16d 全面刷新）=====
// RNまたぎ＝EPの下二桁が90台(91〜99・90ちょうどは除く)のとき、RN加算(rnVal=100−下二桁)でEPをRNちょうど(例5391〜99→5400)に乗せる運用。
// 母数=渡されたv2算入記録のうちRN〇(signal.rnUsed・_elRnYes)。最終損益(手じまい)基準(_elH2EvalByFn)。
// ①EP位置スイープ＝EPをRN−3〜RN+3の各位置に置き直して再判定（採用α+オフセット）＋RN無し(素のα=採用α−RN値)の参考行。「本当にRNちょうどでいいのか」。
//   ★＝E成立≥_EL_BASE_MIN_N かつ Σ黒字 の候補で平均最終損益が最大（浮き足%ボードと同流儀・薄いうちは全行（仮））。現行=RNちょうど行は琥珀ハイライト。RN無しが★を取ることもある＝そもそも不要のサイン。
// ②寄与の内訳＝現実−RN無しの差を「両方成立の値幅改善」「RN待ちで入れなかった取引の仮想損益（負=待って正解）」に分解＋記録ごとの得/損/同件数。「そもそも採る必要があるのか」。
// ③RN距離別＝rnVal別に Σ現実/ΣRN無し/寄与。近い距離(+1〜3)は誤差か・遠い距離(+7〜9)でも待つ価値があるか。
// ※旧「RN込みvsRN無し2行表」「RN加算値別(現実のみ)」は①③に吸収＝撤去(2026-07-16d)。RN×側との比較は「RNまたぎ状況だったか」のフラグが記録に無く不可能＝出さない。
function _elRnBoardV2(recs, aiOf, holiSet) {
  var pool = (recs || []).filter(function(r) { return r && _elRnYes(r.signal); });
  var _span = _elBizSpanDays(pool, holiSet);   // ①EP位置スイープの頻度列用（α詳細表と同基準）2026-07-18: 母数の活動営業日数（全行共通・EP位置ごとに到達実日数だけ変わる）。
  var _th2 = function(t, k) { return React.createElement("th", { key: k, style: { padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
  var _td2 = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #F0EDE7", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  if (!pool.length) return React.createElement("div", { style: { color: "#94A3B8", textAlign: "center", padding: "24px 12px", fontSize: 12, border: "1px dashed #e0ddd6", borderRadius: 10 } }, "RNまたぎ加算〇の記録がまだありません（記録フォーム/EPナビでRN〇を付けると貯まります・2026-07-08導入）");
  var _aReal = function(r) { return aiOf(r).alpha; };
  var _aNone = function(r) { var a = aiOf(r).alpha; if (a == null) return null; return Math.max(0, a - _elRnAdd(r.signal)); };
  var _aOff = function(off) { return function(r) { var a = aiOf(r).alpha; if (a == null) return null; return Math.max(0, a + off); }; };
  var _sumCell = function(v, w) { return v == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: w || 800 } }, _elPnlFmt(Math.round(v))); };
  // ---- ① EP位置スイープ（RN−3〜+3＋RN無し参考行） ----
  var rows = [{ key: "none", label: "RN無し（素のα・下二桁のまま）", ref: true, af: _aNone, e: _elH2EvalByFn(pool, aiOf, _aNone) }];
  [-3, -2, -1, 0, 1, 2, 3].forEach(function(off) {
    var lbl = off === 0 ? "RNちょうど" : (off < 0 ? "RN−" + (-off) + "（" + (-off) + "円手前）" : "RN+" + off + "（" + off + "円超え）");
    var _f = off === 0 ? _aReal : _aOff(off);
    rows.push({ key: "o" + off, label: lbl, cur: off === 0, af: _f, e: _elH2EvalByFn(pool, aiOf, _f) });
  });
  var _gated = rows.filter(function(rw) { return rw.e.decided >= _EL_BASE_MIN_N && rw.e.h2Sum != null && rw.e.h2Sum > 0; });
  _gated.sort(function(x, y) { return (x.e.avgH2 - y.e.avgH2) || (x.e.h2Sum - y.e.h2Sum); });
  var _star = _gated.length ? _gated[_gated.length - 1] : null;
  var _swRow = function(rw) {
    var e = rw.e, thin = e.decided < _EL_BASE_MIN_N;
    var isStar = _star && _star.key === rw.key;
    return React.createElement("tr", { key: rw.key, style: { background: rw.cur ? "#FEF3C7" : (isStar ? "#E1F5EE" : "transparent") } },
      _td2(React.createElement("span", { style: { fontWeight: 700, color: rw.ref ? "#94A3B8" : "#334155" } },
        isStar ? React.createElement("span", { style: { color: "#0F766E", marginRight: 3 } }, "★") : null,
        rw.label,
        rw.cur ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#9A3412", background: "#FFEDD5", border: "1px solid #FDBA74", borderRadius: 8, padding: "0 6px", marginLeft: 5, verticalAlign: "middle" } }, "現行") : null,
        rw.ref ? React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8", marginLeft: 4 } }, "参考") : null,
        thin ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 3, fontWeight: 700 } }, "（仮）") : null), { textAlign: "left", paddingLeft: 8 }),
      _td2(e.n + "件"),
      _td2(_elPctCell(e.eRate)),
      _td2(e.decided + "件"),
      _td2(_elFreqCell(_span, _elEnteredDays(pool, rw.af))),
      _td2(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _td2(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _td2(_sumCell(e.h2Sum)),
      _td2(_sumCell(e.avgH2, 700)));
  };
  // ---- ② 寄与の内訳（記録単位・判定は_elH2EvalByFnと同一） ----
  var _pnlAt = function(r, a) {
    var s = r.signal, c = aiOf(r).cutLine;
    if (a == null) return null;
    var rr = _epResolve(s, a);
    if (!(rr && rr.epIdx >= 0 && rr.epIdx <= 2)) return null;
    var res = _elDynResult(s, a, c);
    if (!(res === "ok" || res === "ng" || res === "draw")) return null;
    var t2 = _elHold2TotParts(s, a, c);
    return (t2 && t2.main != null) ? t2.main : null;
  };
  var bothN = 0, bothDiff = 0, cfOnlyN = 0, cfOnlySum = 0, realOnlyN = 0, realOnlySum = 0, winN = 0, loseN = 0, evenN = 0;
  pool.forEach(function(r) {
    var pr = _pnlAt(r, _aReal(r)), pc = _pnlAt(r, _aNone(r));
    if (pr != null && pc != null) { bothN++; bothDiff += pr - pc; }
    else if (pc != null) { cfOnlyN++; cfOnlySum += pc; }
    else if (pr != null) { realOnlyN++; realOnlySum += pr; }
    var d = (pr || 0) - (pc || 0);
    if (d > 0) winN++; else if (d < 0) loseN++; else evenN++;
  });
  var net = bothDiff - cfOnlySum + realOnlySum;
  var _statCard = function(title, amt, desc, hot) {
    return React.createElement("div", { key: title, style: { flex: "1 1 170px", minWidth: 170, background: hot ? "#E1F5EE" : "#FFFBF5", border: "1px solid " + (hot ? "#9FE1CB" : "#F0E6D2"), borderRadius: 8, padding: "8px 12px" } },
      React.createElement("div", { style: { fontSize: 10, color: hot ? "#085041" : "#B08968", fontWeight: 700 } }, title),
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: amt == null ? "#94A3B8" : _elPnlColor(amt), fontVariantNumeric: "tabular-nums" } }, amt == null ? "—" : _elPnlFmt(Math.round(amt))),
      React.createElement("div", { style: { fontSize: 10, color: hot ? "#0F6E56" : "#777", lineHeight: 1.4 } }, desc));
  };
  // ---- ③ RN距離別の寄与 ----
  var byVal = {};
  pool.forEach(function(r) { var v = _elRnAdd(r.signal); (byVal[v] = byVal[v] || []).push(r); });
  var valRows = Object.keys(byVal).map(Number).sort(function(a, b) { return a - b; }).map(function(v) {
    var g = byVal[v];
    var e = _elH2EvalByFn(g, aiOf, _aReal);
    var ec = _elH2EvalByFn(g, aiOf, _aNone);
    var d = (e.h2Sum == null && ec.h2Sum == null) ? null : (e.h2Sum || 0) - (ec.h2Sum || 0);
    return React.createElement("tr", { key: "v" + v },
      _td2(React.createElement("span", { style: { fontWeight: 700, color: "#1D4ED8" } }, "+" + v + "円"), { textAlign: "left", paddingLeft: 8 }),
      _td2(g.length + "件"),
      _td2(_elPctCell(e.eRate)),
      _td2(_sumCell(e.h2Sum)),
      _td2(_sumCell(ec.h2Sum, 700)),
      _td2(_sumCell(d)));
  });
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9.5, color: "#A79E92", marginBottom: 6 } }, "母数＝RN〇の全記録（" + pool.length + "件）。EPを各位置に置き直して再判定（採用α±オフセットでEP到達〜最終損益[手じまい・○途切れ]まで同一基準で再計算）。RN無し＝RN加算を外した素のα＝EPは下二桁91〜99のまま（記録ごとに位置が違う参考行）。"),
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#0F766E", margin: "2px 0 4px" } }, "① EP位置スイープ 〜本当にRNちょうどでいいのか〜"),
    React.createElement(_HScrollBox, null, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", null, ["EP位置", "母数", "到達率", "E成立", "頻度", "損切り率", "利確率", "Σ最終損益", "平均"].map(function(h, i) { return _th2(h, i); }))),
      React.createElement("tbody", null, rows.map(_swRow)))),
    React.createElement("div", { style: { fontSize: 9.5, color: "#94A3B8", marginTop: 4 } }, "上（手前）ほど早く入れて到達が増え、下（超え）ほど1件あたりが良くなるトレードオフ。★＝E成立" + _EL_BASE_MIN_N + "件以上かつΣ黒字の位置で平均最終損益が最大（該当なしなら★なし）。RN無しが★なら「そもそもまたぎ不要」のサイン。"),
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#0F766E", margin: "12px 0 4px" } }, "② RN待ちの寄与・内訳 〜そもそも採る必要があるのか〜"),
    React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 } },
      _statCard("両方成立した取引（" + bothN + "件）", bothN ? bothDiff : null, "RN値ぶんエントリーが有利になった値幅改善（判定変化の影響含む）"),
      _statCard("RN待ちで入れなかった取引（" + cfOnlyN + "件）", cfOnlyN ? cfOnlySum : null, "入っていたらの仮想損益。マイナスなら「待って正解＝損失回避」・プラスなら機会損失"),
      _statCard("差し引き（寄与）", net, net > 0 ? "＝RNまで待つ判断が効いている" : net < 0 ? "＝RNを外した方が良かった（浅いαで到達が増える効果）" : "＝差なし", true)),
    realOnlyN ? React.createElement("div", { style: { fontSize: 9.5, color: "#B45309", marginBottom: 4 } }, "※現実のみ成立 " + realOnlyN + "件（Σ" + _elPnlFmt(Math.round(realOnlySum)) + "・差し引きに加算済み）") : null,
    React.createElement("div", { style: { fontSize: 11, color: "#555" } }, "記録ごとの勝敗（Σが1件に引っ張られていないか）: ",
      React.createElement("b", { style: { color: "#C0392B" } }, "得 " + winN + "件"), " ・ ",
      React.createElement("b", { style: { color: "#1E8449" } }, "損 " + loseN + "件"), " ・ 同等 " + evenN + "件（両方未達含む）"),
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#0F766E", margin: "12px 0 4px" } }, "③ RN距離別の寄与 〜遠くても待つ価値はあるか〜"),
    React.createElement(_HScrollBox, null, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", null, ["RN値（またぎ距離）", "件数", "到達率", "Σ現実", "ΣRN無しなら", "寄与（差）"].map(function(h, i) { return _th2(h, i); }))),
      React.createElement("tbody", null, valRows))));
}
// ===== RNまたぎ閾値スイープ「RNは何円手前から〇にすべきか」2026-07-20e =====
// ③RN距離別(_elRnBoardV2)は _elRnAdd でグループ分けする実績の内訳＝母数が「実際に〇にした記録」に偏り、〇にしなかった距離のデータが入らない。
// こちらは RN× の記録も含む全記録の反実仮想＝「RNまでの距離≤T円なら〇にする」というルールのTを0〜_EL_RN_T_MAXで振って成績を比べる。
var _EL_RN_T_MAX = 12;   // 閾値スイープの上限T。現行バンド＝9（41-49/91-99）・10以上は…40／…90も含む＝「現行バンド外」とグレー表示。40・90を外した2026-07-20の判断をこの表で再検証するために12まで見る。
// 段別トグル（全体／…50の段／…00の段）。…40台と…00台で効きが違う可能性を切り分ける。作法は_ukiScopeToggleに合わせる。
function _rnTierToggle(tier, onSet) {
  return React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 7, padding: 2, gap: 2 } },
    [["all", "全体"], ["50", "…50の段"], ["00", "…00の段"]].map(function(_tk) {
      var _on = (tier || "all") === _tk[0];
      return React.createElement("button", { key: _tk[0], type: "button", onClick: function() { onSet(_tk[0]); },
        title: _tk[0] === "all" ? "…50/…00の両方を合算して母数にする" : ("RN前EPの下二桁が" + (_tk[0] === "50" ? "1〜49（…50へ寄せる記録）" : "51〜99（…00へ寄せる記録）") + "だけを母数にする"),
        style: { padding: "3px 11px", fontSize: 11, fontWeight: _on ? 800 : 600, borderRadius: 5, cursor: "pointer", border: "none", background: _on ? "#fff" : "transparent", color: _on ? "#0F766E" : "#6B6459", boxShadow: _on ? "0 1px 2px rgba(0,0,0,.1)" : "none" } }, _tk[1]);
    }));
}
// 閾値スイープの母数抽出（ボード本体とサブタブの件数バッジが同じ条件を使うための単一源）。tier: "all"／"50"／"00"。
// 除外の理由別件数も返す＝「母数が薄いから判断保留」をユーザーが読めるようにするため。
function _elRnThrPool(recs, aiOf, tier) {
  var _tier = tier || "all", out = { pool: [], noLv: 0, onRn: 0, offTier: 0, rnYesN: 0, badPre: 0 };
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s) return;
    if (!_epIsV2(s)) return;                                                // 2026-07-20h v2ガード＝再利用可能な単一源として非v2を弾く（_rnCandRecsと同じ線引き。_epResolveが弾く記録で母数/バッジを膨らませない）
    var a = aiOf(r).alpha; if (a == null) return;
    // 2026-07-20h RN加算“前”αが負の記録は除外＝採用αよりRN加算のほうが大きい不整合データ（αを下げてRN〇を消し忘れた等）。
    // ボードは実効αを Math.max(0, a - _elRnAdd) でクランプする一方、距離は未クランプのEPから測るため、残すと「クランプ後のαではキリ番に乗らない」矛盾した反実仮想を出す。
    if ((a - _elRnAdd(s)) < 0) { out.badPre++; return; }
    var ep = _elRnPreEpOfRec(s, a);
    if (ep == null || isNaN(ep)) { out.noLv++; return; }                    // 水準線未入力＝下二桁が出せない（NaNもここで判定不可に寄せる）
    var d = _elRnDistAt(ep);
    if (d == null || d <= 0) { out.onRn++; return; }                        // すでに…50/…00ちょうど＝どのTでも不変
    if (_tier !== "all" && _elRnTierAt(ep) !== _tier) { out.offTier++; return; }
    if (_elRnYes(s)) out.rnYesN++;
    out.pool.push(r);
  });
  return out;
}
function _tierName(t) { return t === "50" ? "…50の段（下二桁1〜49）のみ" : (t === "00" ? "…00の段（下二桁51〜99）のみ" : "…50/…00 合算"); }   // 段別トグルの表示名（注記と空状態で共用）2026-07-20h
// 母数＝水準線値入り かつ RN前EPが…50/…00ちょうどでない記録（ちょうど＝どのTでも動かないので除外）。tier: "all"／"50"／"00"。
function _elRnThresholdBoardV2(recs, aiOf, holiSet, tier) {
  var _tier = tier || "all";
  var _th2 = function(t, k) { return React.createElement("th", { key: k, style: { padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
  var _td2 = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #F0EDE7", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var _sumCell = function(v, w) { return v == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: w || 800 } }, _elPnlFmt(Math.round(v))); };
  var _sel = _elRnThrPool(recs, aiOf, _tier);
  var pool = _sel.pool, noLv = _sel.noLv, onRn = _sel.onRn, offTier = _sel.offTier, rnYesN = _sel.rnYesN, badPre = _sel.badPre;
  // 2026-07-20h 空状態が「未入力N件」しか言わず、段別トグルで絞って0件になった時に「水準線値を入れろ」と誤った指示を出していたので理由別に出し分ける
  if (!pool.length) return React.createElement("div", { style: { color: "#94A3B8", textAlign: "center", padding: "24px 12px", fontSize: 12, border: "1px dashed #e0ddd6", borderRadius: 10 } },
    offTier > 0
      ? React.createElement("span", null, "この段に該当する記録がありません（" + _tierName(_tier) + "・他の段に" + offTier + "件）。上の段別トグルを「全体」に戻すと表示されます")
      : React.createElement("span", null, "母数になる記録がまだありません（水準線値入りが必要・未入力" + noLv + "件" + (onRn ? "／すでに…50・…00ちょうど" + onRn + "件" : "") + "）。記録フォームのOS見出し右／EPナビの分足欄右で水準線値を入れると貯まります"));
  // ---- 閾値Tのα関数。T=0＝またぎ無し（素のα）＝_elRnBoardV2の「RN無し」行と同じ式 ----
  var _alphaAtT = function(T) {
    return function(r) {
      var s = r && r.signal; if (!s) return null;
      var a = aiOf(r).alpha; if (a == null) return null;
      var ep = _elRnPreEpOfRec(s, a); if (ep == null) return null;
      return Math.max(0, a - _elRnAdd(s)) + (_elRnAddAtT(ep, T) || 0);
    };
  };
  var _span = _elBizSpanDays(pool, holiSet);
  var _dists = pool.map(function(r) { return _elRnDistAt(_elRnPreEpOfRec(r.signal, aiOf(r).alpha)); });   // poolと同じ並び。距離はαに依らず不変なので1回だけ算出（aiOfは重いので13行×N回の再計算を避ける）
  var rows = [], _t, _i;
  for (_t = 0; _t <= _EL_RN_T_MAX; _t++) {
    var _f = _alphaAtT(_t), _hit = 0;
    for (_i = 0; _i < _dists.length; _i++) { if (_dists[_i] <= _t) _hit++; }
    rows.push({ t: _t, af: _f, hit: _hit, e: _elH2EvalByFn(pool, aiOf, _f) });
  }
  // ★＝①EP位置スイープと同じ軽いゲート（E成立≥_EL_BASE_MIN_N かつ Σ黒字のうち平均最終損益 最大）。推奨基本αの4条件フルゲートは使わない
  //   ＝全T行が同じ母数・ほぼ同じ到達率/頻度になるためゲートが効かず「条件適合無し」しか出ないため。T=0が★なら「そもそもまたぎ不要」のサイン。
  var _gated = rows.filter(function(rw) { return rw.e.decided >= _EL_BASE_MIN_N && rw.e.h2Sum != null && rw.e.h2Sum > 0; });
  _gated.sort(function(x, y) { return (x.e.avgH2 - y.e.avgH2) || (x.e.h2Sum - y.e.h2Sum); });
  var _star = _gated.length ? _gated[_gated.length - 1] : null;
  var _base = rows[0].e.h2Sum;
  var _tRow = function(rw) {
    var e = rw.e, thin = e.decided < _EL_BASE_MIN_N, out = rw.t >= 10, cur = rw.t === 9, ref = rw.t === 0;
    var isStar = _star && _star.t === rw.t;
    var diff = (e.h2Sum == null || _base == null) ? null : (e.h2Sum - _base);
    return React.createElement("tr", { key: "t" + rw.t, style: { background: cur ? "#FEF3C7" : (isStar ? "#E1F5EE" : "transparent") } },
      _td2(React.createElement("span", { style: { fontWeight: 700, color: ref ? "#94A3B8" : (out ? "#888780" : "#334155") } },
        isStar ? React.createElement("span", { style: { color: "#0F766E", marginRight: 3 } }, "★") : null,
        ref ? "T=0 またぎ無し" : ("T=" + rw.t + "（" + rw.t + "円以内）"),
        cur ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#9A3412", background: "#FFEDD5", border: "1px solid #FDBA74", borderRadius: 8, padding: "0 6px", marginLeft: 5, verticalAlign: "middle" } }, "現行") : null,
        out ? React.createElement("span", { style: { fontSize: 8.5, color: "#888780", marginLeft: 4 } }, "現行バンド外") : null,
        ref ? React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8", marginLeft: 4 } }, "参考") : null,
        thin ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 3, fontWeight: 700 } }, "（仮）") : null), { textAlign: "left", paddingLeft: 8 }),
      _td2(ref ? React.createElement("span", { style: { color: "#94A3B8" } }, "—") : (rw.hit + "件")),
      _td2(_elPctCell(e.eRate)),
      _td2(e.decided + "件"),
      _td2(_elFreqCell(_span, _elEnteredDays(pool, rw.af))),
      _td2(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _td2(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _td2(_sumCell(e.h2Sum)),
      _td2(_sumCell(e.avgH2, 700)),
      _td2(ref ? React.createElement("span", { style: { color: "#94A3B8" } }, "—") : _sumCell(diff, 700)));
  };
  // ---- 距離別の限界寄与（どこで符号が反転するか）。距離dの記録はT=dでちょうど〇になる＝差の累計が主表のT=0比と一致する（相互検算）----
  var byDist = {}, farN = 0;
  pool.forEach(function(r, i) { var d = _dists[i]; (byDist[d] = byDist[d] || []).push(r); });
  var distKeys = Object.keys(byDist).map(Number).sort(function(a, b) { return a - b; });
  distKeys.forEach(function(d) { if (d > _EL_RN_T_MAX) farN += byDist[d].length; });
  var _cum = 0, _firstNeg = null, distData = [];
  distKeys.filter(function(d) { return d <= _EL_RN_T_MAX; }).forEach(function(d) {
    var g = byDist[d];
    var eOn = _elH2EvalByFn(g, aiOf, _alphaAtT(d)), eOff = _elH2EvalByFn(g, aiOf, _alphaAtT(0));
    var diff = (eOn.h2Sum == null && eOff.h2Sum == null) ? null : (eOn.h2Sum || 0) - (eOff.h2Sum || 0);
    if (diff != null) _cum += diff;
    if (_firstNeg == null && diff != null && diff < 0) _firstNeg = d;
    distData.push({ d: d, n: g.length, on: eOn.h2Sum, off: eOff.h2Sum, diff: diff, cum: _cum });
  });
  var distRows = distData.map(function(x) {
    var out = x.d >= 10, flip = _firstNeg === x.d;
    return React.createElement("tr", { key: "d" + x.d, style: { background: flip ? "#FCEBEB" : "transparent" } },
      _td2(React.createElement("span", { style: { fontWeight: 700, color: out ? "#888780" : "#1D4ED8" } }, x.d + "円手前",
        flip ? React.createElement("span", { style: { fontSize: 8.5, color: "#A32D2D", marginLeft: 5, fontWeight: 700 } }, "符号反転") : null,
        out ? React.createElement("span", { style: { fontSize: 8.5, color: "#888780", marginLeft: 4, fontWeight: 400 } }, "現行バンド外") : null), { textAlign: "left", paddingLeft: 8 }),
      _td2(x.n + "件"),
      _td2(_sumCell(x.on)),
      _td2(_sumCell(x.off)),
      _td2(_sumCell(x.diff, 700)),
      _td2(_sumCell(x.cum, 700)));
  });
  var _tierLbl = _tierName(_tier);
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9.5, color: "#A79E92", marginBottom: 6, lineHeight: 1.5 } },
      "母数＝水準線値入りの記録 " + pool.length + "件（RN〇 " + rnYesN + "／RN× " + (pool.length - rnYesN) + "・" + _tierLbl + "）。RN加算“前”のEP（水準線＋基底α＋浮き足加算）の下二桁から直近のキリ番までの距離を測り、距離≤T円なら〇にするルールで採用αを組み直して再判定（EP到達〜最終損益[手じまい・○途切れ]まで推奨α系と同一基準）。",
      React.createElement("span", { style: { color: "#B08968" } }, "除外＝水準線未入力 " + noLv + "件／すでに…50・…00ちょうど " + onRn + "件" + (offTier ? "／他の段 " + offTier + "件" : "") + (badPre ? "／採用αよりRN加算が大きい不整合 " + badPre + "件" : "") + "。")),
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#0F766E", margin: "2px 0 4px" } }, "① 閾値スイープ 〜何円手前までなら待つ価値があるのか〜"),
    React.createElement(_HScrollBox, null, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", null, ["閾値T", "該当", "到達率", "E成立", "頻度", "損切り率", "利確率", "Σ最終損益", "平均", "T=0比"].map(function(h, i) { return _th2(h, i); }))),
      React.createElement("tbody", null, rows.map(_tRow)))),
    React.createElement("div", { style: { fontSize: 9.5, color: "#94A3B8", marginTop: 4, lineHeight: 1.5 } },
      "該当＝そのTで〇になる記録数（Tが上がるほど積み上がる）。★＝E成立" + _EL_BASE_MIN_N + "件以上かつΣ黒字のTで平均最終損益が最大（該当なしなら★なし）。T=0が★なら「そもそもRNまたぎ不要」のサイン。RNの間隔は50円なのでTを1上げても該当は全体の約2%ずつしか増えない＝Σの差が小さく見えるため、右端の「T=0比」と下の距離別で判断する。"),
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#0F766E", margin: "12px 0 4px" } }, "② 距離別の限界寄与 〜どこで符号が反転するか〜"),
    React.createElement(_HScrollBox, null, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", null, ["RNまでの距離", "件数", "またぐΣ", "またがないΣ", "差", "累計差"].map(function(h, i) { return _th2(h, i); }))),
      React.createElement("tbody", null, distRows))),
    React.createElement("div", { style: { fontSize: 9.5, color: "#94A3B8", marginTop: 4, lineHeight: 1.5 } },
      "距離dの記録はT=dでちょうど〇になるので、差を1円手前から積み上げた「累計差」は主表の同じTの「T=0比」と一致する（ズレていたら実装バグ）。最初に差がマイナスへ転じた距離の1つ手前が、Σ最終損益を最大にするT。"
      + "⚠️①の★は『平均』最終損益が最大のTなので、この2つはしばしば違うTを指す（Tを上げるほどEPが深くなり到達が減る＝残った少数の強い記録だけで平均が上がるため、★は深いTへ寄りやすい）。総額を積みたいならこの累計差、1件あたりの質を見たいなら★。★のTが極端に少ないE成立で選ばれていないか件数列も確認。" + (farN ? "距離" + (_EL_RN_T_MAX + 1) + "円以上 " + farN + "件は表示範囲外（どのTでも〇にならない）。" : "")));
}
// 「何営業日に1日エントリーできたか」用 2026-07-07（ユーザー要望・全営業日ベース）: 母数の活動期間（初回〜直近の記録日）の営業日数。holiSet省略時は土日のみ除外・渡せば祝日も除外（_fmIsBizDay app-03）。validOf(r)=母数に含めるか（推奨α算出不能などの除外・省略時は全記録）。
function _elBizSpanDays(recs, holiSet, validOf) {
  var minD = null, maxD = null;
  (recs || []).forEach(function(r) {
    if (!r || !r.date || !r.signal) return;
    if (validOf && !validOf(r)) return;
    if (minD == null || r.date < minD) minD = r.date;
    if (maxD == null || r.date > maxD) maxD = r.date;
  });
  if (minD == null) return 0;
  var span = 0, cur = new Date(minD + "T00:00:00"), end = new Date(maxD + "T00:00:00"), _p = function(n) { return ("0" + n).slice(-2); };
  while (cur <= end) {
    var ds = cur.getFullYear() + "-" + _p(cur.getMonth() + 1) + "-" + _p(cur.getDate());
    if (_fmIsBizDay(ds, holiSet)) span++;
    cur.setDate(cur.getDate() + 1);
  }
  return span;
}
// alphaOf(r)で各記録にαを当て、EP到達した「実日数」（distinct日付）＝「何営業日に1日」の分子。2026-07-07。
function _elEnteredDays(recs, alphaOf) {
  var d = {};
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s || !r.date) return;
    var a = alphaOf(r); if (a == null) return;
    var rr = _epResolve(s, a);
    if (rr && rr.epIdx >= 0 && rr.epIdx <= 2) d[r.date] = 1;
  });
  return Object.keys(d).length;
}
// EP到達した「(銘柄×日付)セル数」＝銘柄横断プール（株価帯等）の頻度分母。_elEnteredDaysはdistinct日付のみ集約なので、分母を_pbBandBizDays（銘柄×営業日セル）に合わせる帯コンテキストで単位を一致させる用。_PbDayBandReco/_ElDayAlphaPairピルの_entSeenと同一の(stock|date)キー 2026-07-22k（ユーザー指摘の単位不一致修正）。
function _elEnteredCells(recs, alphaOf) {
  var d = {};
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s || !r.date || !r.stock) return;
    var a = alphaOf(r); if (a == null) return;
    var rr = _epResolve(s, a);
    if (rr && rr.epIdx >= 0 && rr.epIdx <= 2) d[r.stock + "|" + r.date] = 1;
  });
  return Object.keys(d).length;
}
// 頻度セル 2026-07-07→2026-07-13c 数字のみ表記（ユーザー指定「3.8」）: span(活動営業日)÷enteredDays(到達実日数)=X営業日に1回。10未満は小数1桁・以上は整数。到達0/期間0は—。ツールチップに意味を残す。
function _elFreqCell(span, enteredDays) {
  if (!(enteredDays > 0) || !(span > 0)) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var r = span / enteredDays;
  var num = (r < 10 ? (Math.round(r * 10) / 10) : Math.round(r));
  return React.createElement("span", { style: { fontWeight: 700, color: "#0369A1", fontSize: 10.5, whiteSpace: "nowrap" }, title: "約" + num + "営業日に1回（活動" + span + "営業日中 到達" + enteredDays + "日）" }, num);
}
// 次点（2番目の推奨α）を1番目の真下に「（次点：〇円）」で小書き（1番目と同サイズ・同色）。次点が無ければ「（次点なし）」を淡色で表示。ユーザー方針 2026-06-24。text例 "9円"/"+5円"。
function _elReco2Node(text, fontSize, color) {
  var _has = (text != null && text !== "");
  return React.createElement("div", { style: { fontSize: fontSize, fontWeight: 700, color: _has ? color : "#94A3B8", lineHeight: 1.1, whiteSpace: "nowrap" } }, _has ? ("（次点：" + text + "）") : "（次点なし）");
}
// 推奨基本α(5〜20)を選定【2026-06-22c】: 件数フロア＝最大件数(scN)×_EL_BASE_MIN_FRAC（最低_EL_BASE_MIN_N件）かつ 到達率≥_EL_BASE_MIN_ERATE のαから、合成スコア(0.7×(1−損切り率)+0.3×H1勝率)が最大。
// 高αは到達率が下がり標本が薄い「いいとこ取り(選抜バイアスでスコア上振れ)」になるため、件数フロア＋到達率フロアで薄い高α・約定しにくい高αを除外＝厚く約定しやすい標本の中で最良のαを選ぶ。同点は件数最大→低α。フロア皆無なら件数(scN)最大のαを参考(status="na")・entered皆無は"none"。
// 返り値 { alpha, score, stopRate, h1win, eRate, entered, scN, pnl, epPnl, stopN, ewin, status('ok'|'na'|'none'), sweep, minN(=採用した件数フロア) }。
// 旧・合成スコア方式の選定（〜2026-07-12の_elBaseAlphaPick本体）。2026-07-13に★基準を「条件式＋Σ最終損益」へ刷新した際、
// 乖離確認用の「旧基準」チップ（結論バー/KPIカード）のために保存。ロジックは刷新前と同一（0.7×損切り回避+0.3×H1勝率・H1基準）。
function _elBaseAlphaPickScore(recs, aiOf) {
  if (!recs || !recs.length) return null;
  // 推奨基本αの母数: 追加α=〇(上乗せあり)以外＝×(不要)＋未選択(未判断)の記録。未選択はaddAlphaVal無し＝基本αのみの記録なので母数に算入する（〇だけ除外）2026-06-24。
  // 浮き足〇（_elUkiYes）も除外＝浮き足加算で嵩上げされる特殊状況の記録を素の基本α評価に混ぜない（旧: 追加α〇として除外されていた挙動を移行後も維持）2026-07-03。
  // RN〇（_elRnYes）も同思想で除外 2026-07-12: RNまたぎ加算込みの採用αを一様置換すると加算成分が消えて評価が歪むため、素の基本α母数から外す（浮き足と対称）。
  recs = recs.filter(_elIsBaseAlphaPoolRec);
  if (!recs.length) return null;
  aiOf = _elAnaAiOf(aiOf);   // 旧基準チップも同じ前提損切り値で比較（公平）2026-07-13b
  var sweep = _EL_BASE_ALPHAS.map(function(a) { return _elBaseAlphaEval(recs, aiOf, a); });
  // 件数フロア(実データ連動): 最も件数(scN)の多いαの_EL_BASE_MIN_FRAC以上を要求＝高αの薄い標本(選抜バイアス)を除外。最低でも_EL_BASE_MIN_N件 2026-06-22b。
  var maxScN = sweep.reduce(function(m, e) { return Math.max(m, e.scN || 0); }, 0);
  var floorN = Math.max(_EL_BASE_MIN_N, Math.round(maxScN * _EL_BASE_MIN_FRAC));
  var _ret = function(p, status) { return { alpha: p.a, score: p.score, stopRate: p.stopRate, h1win: p.h1win, eRate: p.eRate, entered: p.entered, scN: p.scN, pnl: p.pnl, epPnl: p.epPnl, stopN: p.stopN, ewin: p.ewin, status: status, sweep: sweep, minN: floorN, alpha2: null, score2: null, stopRate2: null, h1win2: null, eRate2: null, scN2: null }; };
  // 件数フロア＋到達率フロア(_EL_BASE_MIN_ERATE)を満たすαの中で合成スコア最大（薄い高α・約定しにくい高αを母数から外す）。同点は件数の多い＝信頼できる方→低α。
  // 【2026-06-26 A】候補に「想定損益(累計ΣH1)>0」を追加＝赤字αは推奨しない。スコアは率(損切り回避/H1勝率)だけで金額を見ないため、損切りに当たらず小負けを重ねるαが上位に来るのを防ぐ。黒字αが皆無なら下のフォールバック(件数最大・参考)へ。
  var cand = sweep.filter(function(e) { return e.scN >= floorN && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.score != null && e.pnl != null && e.pnl > 0; });
  if (cand.length) {
    cand.sort(function(x, y) { return (x.score - y.score) || (x.scN - y.scN) || (y.a - x.a); });   // 昇順→末尾が最良（スコア最大・同点は件数最大→低α）
    var _picked = cand[cand.length - 1];
    // 次点（2番目の推奨基本α）= 同フロア候補のうち1番目より大きいαでスコア最大。ユーザー方針＝2番目は1番目より大きい値に限る 2026-06-24。
    var _larger = cand.filter(function(e) { return e.a > _picked.a; });
    _larger.sort(function(x, y) { return (x.score - y.score) || (x.scN - y.scN) || (y.a - x.a); });
    var _p2 = _larger.length ? _larger[_larger.length - 1] : null;
    var _rk = _ret(_picked, "ok");
    if (_p2) { _rk.alpha2 = _p2.a; _rk.score2 = _p2.score; _rk.stopRate2 = _p2.stopRate; _rk.h1win2 = _p2.h1win; _rk.eRate2 = _p2.eRate; _rk.scN2 = _p2.scN; }
    return _rk;
  }
  // フロアを満たすα皆無（標本が全体に薄い）: 件数(scN)最大のαを参考返し（status="na"・信頼度低）
  var withEntry = sweep.filter(function(e) { return e.entered > 0; });
  if (!withEntry.length) return { alpha: null, score: null, stopRate: null, h1win: null, eRate: null, entered: 0, scN: 0, pnl: null, epPnl: null, stopN: null, ewin: null, status: "none", sweep: sweep, minN: floorN, alpha2: null, score2: null, stopRate2: null, h1win2: null, eRate2: null, scN2: null };
  withEntry.sort(function(x, y) { return (x.scN - y.scN) || (x.a - y.a); });
  return _ret(withEntry[withEntry.length - 1], "na");
}
// ★選定【2026-07-13 到達率ベースに全面刷新・ユーザー承認】: 母数=素の記録（追加α〇/浮き足〇/RN〇除外・従来どおり）。各α(0〜20円)を最終損益(手じまい)基準 _elH2EvalByFn で評価し、
// 「黒字(Σ最終損益>0)かつ 到達率≥下限(_elAnaReachCur%・既定70・10刻み調整可)かつ 頻度<_EL_FREQ_MAX」のαのうち【最も高いα】を理想α（＝その到達率・頻度は保てる範囲でいちばん有利な高いα）2026-07-13頻度も選定に組込。全滅時は黒字/到達最大へ緩和(na)。
// 推奨α＝max(0,理想−_EL_ALPHA_OFFSET)＝指値を通しやすくするため理想からオフセットぶん下げた実際に置く値（返り値.alpha＝推奨・消費者へ流れる／.idealAlpha＝理想）。stats・★は推奨αのもの。
// 赤★(status ok)=さらに 損切り率(最終)≤_EL_BASE_MAX_STOPRATE(40%)・E成立≥_EL_BASE_MIN_N(10件)・頻度<_EL_FREQ_MAX の自信条件も満たす／青★(na)=条件を一部満たさない参考。
// 下限を満たすα無し(相場が荒い)→黒字αのうち最も到達率が高い(最も届きやすい)αを参考(na)。黒字α皆無→件数最大を参考。次点=推奨より高い黒字αの最小値（もう一段クッション）。
// 返り値shapeは旧版互換（score/h1win/scN/pnl等はH1基準を同αで併記・低αpickはH1参考列がnull）＋decided/takeRate/h2Sum/avgH2/h2sweep/reachFloor。旧スコア方式は_elBaseAlphaPickScoreに保存（「旧基準」チップで併記）。
function _elBaseAlphaPick(recs, aiOf, spanOverride) {   // spanOverride: 頻度ゲートの分母（活動営業日span）を外から指定＝株価帯コンテキストで_pbBandBizDays（その帯だった営業日）を渡す。未指定は従来どおり記録スパン 2026-07-22j
  if (!recs || !recs.length) return null;
  recs = recs.filter(_elIsBaseAlphaPoolRec);
  if (!recs.length) return null;
  aiOf = _elAnaAiOf(aiOf);   // 前提損切り値（既定15円・custom.anaCutPremise）で評価＝「損切り値が◯円である前提での推奨α」2026-07-13b
  var sweep = _EL_BASE_ALPHAS.map(function(a) { return _elBaseAlphaEval(recs, aiOf, a); });   // H1基準（5〜20・旧表示互換の参考列用）
  var full = _EL_BASE_ALPHAS_FULL.map(function(a) { var e = _elH2EvalByFn(recs, aiOf, function() { return a; }); e.a = a; return e; });   // 手じまい基準・0〜20（★選定はこちら）
  var h2sweep = full.filter(function(e) { return e.a >= 5; });   // 返り値互換（従来は5〜20）
  var h1At = {}; sweep.forEach(function(e) { h1At[e.a] = e; });
  var reachFloor = (_elAnaReachCur != null ? _elAnaReachCur : _EL_ANA_REACH_DEF) / 100;   // 到達率の下限（既定0.70・custom.anaReachFloor・_elAlphaInfoで同期）
  var _fspan = (spanOverride != null) ? spanOverride : _elBizSpanDays(recs, _elHoliCur);   // 頻度ゲート用（2026-07-13c／2026-07-15g 祝日も除外＝表示の頻度列と一致）: 活動営業日span。0なら頻度ゲート素通り。spanOverrideあり=帯基準 2026-07-22j
  var _freqOk = function(a) { if (!(_fspan > 0)) return true; var ed = (spanOverride != null) ? _elEnteredCells(recs, function() { return a; }) : _elEnteredDays(recs, function() { return a; }); return ed > 0 && (_fspan / ed) < _EL_FREQ_MAX; };   // 帯基準(spanOverride)時は分母も(銘柄×日)セルで単位一致 2026-07-22k
  var _conf = function(e) { return e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && e.decided != null && e.decided >= _EL_BASE_MIN_N && _freqOk(e.a); };   // 赤★の自信条件
  var fullByA = {}; full.forEach(function(e) { fullByA[e.a] = e; });
  var _mk = function(p, status, idealA) {
    var h1 = h1At[p.a] || {};
    return { alpha: p.a, idealAlpha: (idealA != null ? idealA : p.a), score: (h1.score != null ? h1.score : null), stopRate: p.stopRate, h1win: (h1.h1win != null ? h1.h1win : null), eRate: p.eRate, entered: p.entered, scN: (h1.scN != null ? h1.scN : 0), pnl: (h1.pnl != null ? h1.pnl : null), epPnl: (h1.epPnl != null ? h1.epPnl : null), stopN: p.stopN, ewin: (h1.ewin != null ? h1.ewin : null), status: status, sweep: sweep, h2sweep: h2sweep, minN: _EL_BASE_MIN_N, decided: p.decided, takeRate: p.takeRate, h2Sum: p.h2Sum, avgH2: p.avgH2, reachFloor: reachFloor, alpha2: null, score2: null, stopRate2: null, h1win2: null, eRate2: null, scN2: null, h2Sum2: null };
  };
  // 理想α（idealE.a）から推奨α＝max(0,理想−_EL_ALPHA_OFFSET)を作る（指値のフィルマージン）。返り値.alpha=推奨（消費者へ）／.idealAlpha=理想／stats・★は推奨αのもの。
  var _finish = function(idealE, status, off) {
    var recA = Math.max(0, idealE.a - (off != null ? off : _EL_ALPHA_OFFSET));
    var recE = fullByA[recA] || idealE;
    return _mk(recE, status, idealE.a);
  };
  var _minOk = function(e) { return e.decided != null && e.decided >= _EL_BASE_MIN_N; };   // E成立(decided)≥_EL_BASE_MIN_N(10件)
  // 【2026-07-14d ユーザー要望】理想/推奨は全条件（黒字・到達率≥下限・損切り率(最終)≤上限・E成立≥10・頻度<_EL_FREQ_MAX）を満たすαのみ。1つも無ければ status:"nomin"（条件適合無し）＝損切り率/頻度の緩和は全廃。※10件以上E成立でも他条件を満たさなければ条件適合無し。ただし到達率のみ_EL_ANA_REACH_FLOOR2(50%)へのフォールバックは2026-07-15jで復活（下の_rf2ブロック＝na/青★）。
  var _confAt = function(rf) { return function(e) { return e.entered > 0 && e.h2Sum != null && e.h2Sum > 0 && e.eRate != null && e.eRate >= rf && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && _minOk(e) && _freqOk(e.a); }; };
  var okCands = full.filter(_confAt(reachFloor));
  if (okCands.length) {
    var _best = _elBordaBest(okCands, function(e) { return e.h2Sum; }, function(e) { return e.avgH2; }, function(e) { return e.a; });   // 平均最終損益 最大 2026-07-15f
    return _finish(_best, "ok");   // 理想＝平均最大／推奨＝理想−_EL_ALPHA_OFFSET（指値フィルマージン）
  }
  // 到達率フォールバック 2026-07-15j: 目標到達率で該当αが無ければ_EL_ANA_REACH_FLOOR2(50%)まで引き下げて再選定＝参考(na/青★)。reachFloorも引き下げた値にして表示・淡色を50%基準に。
  var _rf2 = _EL_ANA_REACH_FLOOR2 / 100;
  if (_rf2 < reachFloor) {
    var okLo = full.filter(_confAt(_rf2));
    if (okLo.length) {
      reachFloor = _rf2;
      var _bestLo = _elBordaBest(okLo, function(e) { return e.h2Sum; }, function(e) { return e.avgH2; }, function(e) { return e.a; });   // 平均最終損益 最大（50%引き下げ）
      return _finish(_bestLo, "na");   // 到達率50%に引き下げた参考(青★)
    }
  }
  var _anyEntry = full.some(function(e) { return e.entered > 0; });   // 全条件を満たすα無し→到達記録が全く無ければデータ無し(none)・到達はあるが条件適合無し(nomin)
  return { alpha: null, idealAlpha: null, score: null, stopRate: null, h1win: null, eRate: null, entered: 0, scN: 0, pnl: null, epPnl: null, stopN: null, ewin: null, status: _anyEntry ? "nomin" : "none", sweep: sweep, h2sweep: h2sweep, minN: _EL_BASE_MIN_N, decided: 0, takeRate: null, h2Sum: null, avgH2: null, reachFloor: reachFloor, alpha2: null, score2: null, stopRate2: null, h1win2: null, eRate2: null, scN2: null, h2Sum2: null };
}
// ===== 推奨応用α（応用〇局面）＝基本αと同じ到達率ベース＋理想−_EL_ALPHA_OFFSET（＝2・指値同値マージン 2026-07-22で1→2）＋「基本αより大きく」クランプ（2026-07-13 ユーザー承認）=====
// 母数=応用〇（呼び出し側で浮き足〇/RN〇除外を渡す）。各α0〜20円を前提損切り値で評価し「黒字かつ到達率≥下限かつ頻度<_EL_FREQ_MAX」のうち最も高いα＝理想／推奨＝max(0,理想−_EL_ALPHA_OFFSET)。2026-07-13頻度も選定に組込。
// minIdeal（＝基本αの理想・任意）を渡すと「応用の理想≥基本の理想+1」にクランプ＝応用α（理想・推奨とも）が基本αより大きくなる。返り値shape＝旧互換＋idealAlpha/reachFloor。
var _EL_TOTAL_ALPHAS = (function() { var _a = []; for (var _i = 0; _i <= 20; _i++) _a.push(_i); return _a; })();
function _elSpecialAlphaPick(pool, aiOf, minIdeal, spanOverride) {   // spanOverride: 頻度ゲートの分母（帯基準_pbBandBizDays）。未指定は記録スパン 2026-07-22j
  if (!pool || !pool.length) return null;
  var ai = _elAnaAiOf(aiOf);
  var sweep = _EL_TOTAL_ALPHAS.map(function(a) { var e = _elH2EvalByFn(pool, ai, function() { return a; }); e.a = a; return e; });
  var byA = {}; sweep.forEach(function(e) { byA[e.a] = e; });
  var reachFloor = (_elAnaReachCur != null ? _elAnaReachCur : _EL_ANA_REACH_DEF) / 100;
  var _fspan = (spanOverride != null) ? spanOverride : _elBizSpanDays(pool, _elHoliCur);   // 頻度ゲート（基本αと同一・2026-07-15g 祝日も除外＝表示の頻度列と一致）。spanOverrideあり=帯基準 2026-07-22j
  var _freqOk = function(a) { if (!(_fspan > 0)) return true; var ed = (spanOverride != null) ? _elEnteredCells(pool, function() { return a; }) : _elEnteredDays(pool, function() { return a; }); return ed > 0 && (_fspan / ed) < _EL_FREQ_MAX; };   // 帯基準(spanOverride)時は分母も(銘柄×日)セルで単位一致 2026-07-22k
  var _conf = function(e) { return e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && e.decided != null && e.decided >= _EL_BASE_MIN_N && _freqOk(e.a); };
  var _clampFloor = (minIdeal != null && !isNaN(Number(minIdeal))) ? (Number(minIdeal) + 1) : null;   // 応用の理想は基本の理想+1以上（応用α>基本α 2026-07-13）
  var _mk = function(e, st, idealA) { return { alpha: e.a, idealAlpha: (idealA != null ? idealA : e.a), status: st, minN: _EL_BASE_MIN_N, sweep: sweep, decided: e.decided, eRate: e.eRate, stopRate: e.stopRate, takeRate: e.takeRate, h2Sum: e.h2Sum, avgH2: e.avgH2, reachFloor: reachFloor, alpha2: null, avgH2_2: null, h2Sum2: null }; };
  var _finish = function(idealE, status, off) {
    var idealA = idealE.a;
    if (_clampFloor != null && idealA < _clampFloor) idealA = _clampFloor;   // 基本αより大きくクランプ
    if (idealA > 20) idealA = 20;
    var recA = Math.max(0, idealA - (off != null ? off : _EL_ALPHA_OFFSET));
    var recE = byA[recA] || byA[idealA] || idealE;
    return _mk(recE, status, idealA);
  };
  // 【2026-07-14e ユーザー要望】応用αも基本αと同じ全条件ゲート＝黒字・到達率≥下限・損切り率(最終)≤上限・E成立≥_EL_BASE_MIN_N・頻度<_EL_FREQ_MAX を満たすαのみ。1つも無ければ status:"nomin"（条件適合無し）＝na緩和(参考値/青★)は全廃。クランプ（応用理想≥基本理想+1）は_finishで温存。
  var _minOk = function(e) { return e.decided != null && e.decided >= _EL_BASE_MIN_N; };
  var _confAt = function(rf) { return function(e) { return e.entered > 0 && e.h2Sum != null && e.h2Sum > 0 && e.eRate != null && e.eRate >= rf && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && _minOk(e) && _freqOk(e.a); }; };
  var okCands = sweep.filter(_confAt(reachFloor));
  if (okCands.length) {
    var _best = _elBordaBest(okCands, function(e) { return e.h2Sum; }, function(e) { return e.avgH2; }, function(e) { return e.a; });   // 平均最終損益 最大 2026-07-15f
    return _finish(_best, "ok");   // 理想＝平均最大／推奨＝理想−_EL_ALPHA_OFFSET（クランプは_finishで温存）
  }
  // 到達率フォールバック 2026-07-15j: 目標到達率で該当αが無ければ_EL_ANA_REACH_FLOOR2(50%)まで引き下げて再選定＝参考(na/青★)。クランプは_finishで温存。
  var _rf2 = _EL_ANA_REACH_FLOOR2 / 100;
  if (_rf2 < reachFloor) {
    var okLo = sweep.filter(_confAt(_rf2));
    if (okLo.length) {
      reachFloor = _rf2;
      var _bestLo = _elBordaBest(okLo, function(e) { return e.h2Sum; }, function(e) { return e.avgH2; }, function(e) { return e.a; });   // 平均最終損益 最大（50%引き下げ）
      return _finish(_bestLo, "na");   // 到達率50%に引き下げた参考(青★)
    }
  }
  var _anyEntry = sweep.some(function(e) { return e.entered > 0; });   // 全条件を満たすα無し→到達記録なし=none／到達はあるが条件適合無し=nomin
  return { alpha: null, idealAlpha: null, status: _anyEntry ? "nomin" : "none", minN: _EL_BASE_MIN_N, sweep: sweep, decided: 0, eRate: null, stopRate: null, takeRate: null, h2Sum: null, avgH2: null, reachFloor: reachFloor, alpha2: null, avgH2_2: null, h2Sum2: null };
}
// 推奨合計α セクション（追加α〇局面・2026-07-13c）: 母数=追加α〇（浮き足〇/RN〇除外）＝追加α詳細表と同一。結論バー＋母数内訳＋合計α別総当たり（0〜20・手じまい基準）。
// recs=スコープ（根拠フィルタ後の全記録）を渡し内部で〇を抽出＝追加α詳細表と母数一致。holiSet=頻度列用（任意）。
function _elTotalAlphaSectionV2(recs, aiOf, holiSet, onPick, curSel, spanOverride) {   // spanOverride: 頻度列＋★頻度ゲートの分母を帯基準に（株価帯コンテキスト）2026-07-22j
  var _yesN = 0, _exUki = 0, _exRn = 0;
  var pool = (recs || []).filter(function(r) { var s = r && r.signal; if (!s || !_elSpecialUsed(s)) return false; _yesN++; if (_elHasNumReason(s)) { _exUki++; return false; } if (_elRnYes(s)) { _exRn++; return false; } return true; });
  if (!pool.length) return React.createElement("div", { style: { fontSize: 11, color: "#94A3B8", padding: "4px 0" } }, "応用〇を明示した記録がありません（浮き足〇・RN〇を除く）");
  var _bp = _elBaseAlphaPick(recs, aiOf, spanOverride);   // 基本αの理想＝応用αを基本αより大きくクランプ 2026-07-13
  var pick = _elSpecialAlphaPick(pool, aiOf, _bp ? _bp.idealAlpha : null, spanOverride);
  if (!pick || pick.status === "none") return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "この母数では応用αを評価できる記録がありません（EP到達なし）");
  var na = pick.status === "na";
  var _nomin = (pick.status === "nomin");   // 全条件を満たす応用αが無い＝条件適合無し 2026-07-14e
  var a = pick.alpha, ideal = (pick.idealAlpha != null ? pick.idealAlpha : pick.alpha);
  var reachFloor = pick.reachFloor != null ? pick.reachFloor : (_EL_ANA_REACH_DEF / 100), reachP = Math.round(reachFloor * 100);
  var minN = pick.minN || _EL_BASE_MIN_N;
  var _pctS = function(v) { return v != null ? Math.round(v * 100) + "%" : "—"; };
  var _lbl = function(t) { return React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "10px 0 2px" } }, t); };
  var concl = React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 10px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 8, padding: "8px 12px" } },   // 応用αは茶基調（nominでも警告琥珀にせず茶系のまま）2026-07-14f
    React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, "推奨応用α"),
    _nomin
      ? React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: "#9A3412" } }, "ー（条件適合無し）")
      : React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } },
          React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: na ? "#B45309" : "#9A3412" } }, a + "円", (ideal !== a) ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#B98A5E", marginLeft: 6 } }, "（理想 " + ideal + "円 −" + _EL_ALPHA_OFFSET + "）") : null),
          _elReco2Node(pick.alpha2 != null ? (pick.alpha2 + "円") : null, 20, na ? "#B45309" : "#9A3412")),
    _nomin ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412" } }, "全条件（到達率" + reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "未満）を満たす応用αが1つも無いため推奨を出せません（下表は参考）") : null,
    _nomin ? null : React.createElement("span", { style: { fontSize: 11, color: "#555" } },
      "平均最終損益 ", React.createElement("b", { style: { color: _elPnlColor(pick.avgH2) } }, pick.avgH2 != null ? _elPnlFmt(Math.round(pick.avgH2)) : "—"),
      React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "（Σ" + (pick.h2Sum != null ? _elPnlFmt(Math.round(pick.h2Sum)) : "—") + "）"),
      "／損切り率(最終) ", React.createElement("b", null, _pctS(pick.stopRate)),
      "／利確率 ", React.createElement("b", null, _pctS(pick.takeRate)),
      "／E成立 ", React.createElement("b", null, (pick.decided || 0) + "件"),
      "／到達率 ", React.createElement("b", null, _pctS(pick.eRate))));
  var _span = (spanOverride != null) ? spanOverride : _elBizSpanDays(pool, holiSet);   // spanOverride=帯基準頻度（ピルと一致）2026-07-22j
  var _aiAna = _elAnaAiOf(aiOf);   // H1参考列（H1勝率/平均H1損益/スコア）を基本α詳細表と同じ前提損切り値で評価 2026-07-15f
  var _h1ByA = {}; pick.sweep.forEach(function(e) { _h1ByA[e.a] = _elBaseAlphaEval(pool, _aiAna, e.a); });   // 基本αに列を合わせる: 応用プールのH1評価
  var rows = pick.sweep.filter(function(e) { return e.entered > 0 || e.a === a || e.a === ideal; }).map(function(e) {
    var on = e.a === a, _isIdeal = (e.a === ideal && ideal !== a);
    var _ed = (spanOverride != null) ? _elEnteredCells(pool, (function(_a) { return function() { return _a; }; })(e.a)) : _elEnteredDays(pool, (function(_a) { return function() { return _a; }; })(e.a));   // 帯基準時は分母も(銘柄×日)セルで単位一致（ピルと同じ）2026-07-22k
    var _freqVal = (_span > 0 && _ed > 0) ? (_span / _ed) : null;   // 表示の頻度列と同じ値（祝日除外）
    // 淡色でない(pass)＝全最低条件（到達率・E成立・頻度・損切り率・黒字）を満たす 2026-07-15g。
    // 2026-07-16e: 基本α表と同じく「未達」列用に&&をほどく（判定は等価）。※応用表は主スイープが_elH2EvalByFn＝e自体がH2評価（基本表の_h2ByA[e.a]に相当）。
    var _ng = [];
    if (!(e.eRate != null && e.eRate >= reachFloor)) _ng.push(["到", "到達率が下限" + reachP + "%未満"]);
    if (!(e.decided != null && e.decided >= _EL_BASE_MIN_N)) _ng.push(["件", "E成立が下限" + _EL_BASE_MIN_N + "件未満"]);
    if (!(_freqVal != null && _freqVal < _EL_FREQ_MAX)) _ng.push(["頻", "頻度が" + _EL_FREQ_MAX + "営業日/回以上（低頻度すぎ）"]);
    if (!(e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE)) _ng.push(["損", "損切り率(最終)が上限" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%超"]);
    if (!(e.h2Sum != null && e.h2Sum > 0)) _ng.push(["赤", "Σ最終損益が赤字（または損益なし）"]);
    var pass = !_ng.length;
    var _isCur = !!(onPick && curSel != null && e.a === curSel);
    var _h1 = _h1ByA[e.a];   // スコア列（旧H1基準の参考値）用。H1勝率・平均H1損益の列は2026-07-16eに削除（最終損益と重複）
    var _cells = [
      _elv2Td(React.createElement("span", { style: { fontWeight: (on || _isIdeal) ? 800 : 600, color: "#9A3412" } }, e.a + "円", on ? _elStarNode(pick.status) : null, _isIdeal ? React.createElement("span", { style: { fontSize: 8.5, fontWeight: 700, color: "#B98A5E", marginLeft: 3 } }, "理想") : null), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(e.decided + "件"),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(_elFreqCell(_span, _ed)),
      _elv2Td(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(_elH2AmtCell(e)),
      _elv2Td(_elH2WinLossCell(e)),
      _elv2Td(_elScoreCell(_h1 ? _h1.score : null)),
      _elv2Td(_elGateBadges(_ng))
    ];
    if (onPick) _cells.push(_elv2Td(React.createElement("span", { style: { color: "#B45309", fontWeight: 800, fontSize: 10, whiteSpace: "nowrap" } }, _isCur ? "採用中" : "選択")));
    return React.createElement.apply(null, ["tr", { key: e.a, onClick: onPick ? function() { onPick(e.a); } : null, style: { background: on ? "#FFF7ED" : (_isCur ? "#FEF3C7" : "transparent"), opacity: pass ? 1 : 0.65, cursor: onPick ? "pointer" : "default" } }].concat(_cells));
  });
  var insight = _nomin ? null : _elInsightBoxV2([
    React.createElement("span", null, "応用〇で採用する独立α値の", _elInsightEmV2("理想は応用α " + ideal + "円"), "、", _elInsightEmV2("推奨は " + a + "円（理想−" + _EL_ALPHA_OFFSET + "）"), "（平均最終損益 ", _elInsightEmV2(pick.avgH2 != null ? _elPnlFmt(Math.round(pick.avgH2)) : "—"), "・損切り率(最終) ", _elInsightEmV2(_pctS(pick.stopRate)), "・E成立 ", _elInsightEmV2((pick.decided || 0) + "件"), "）。"),
    React.createElement("span", { style: { color: "#64748B" } }, "応用αは基本αより大きくクランプ。通常局面の推奨基本αは①基本αゾーン。")
  ], { note: "母数＝応用〇（浮き足〇・RN〇除外）。各応用α0〜20円を前提損切り値" + _elAnaCutCur + "円で評価。理想＝黒字・到達率" + reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・頻度" + _EL_FREQ_MAX + "未満を満たすαのうち、平均最終損益（1件あたり）が最大のα（基本αより大きくクランプ）／推奨＝理想−" + _EL_ALPHA_OFFSET + "円。フォーム/EPナビの推奨応用αと同じ算出（銘柄全体母数）。中央値が平均から大きく下なら、その平均は少数の大勝ちで作られている（＝毎回は取れない）。未達列＝★のどの条件で落ちたか（到=到達率・件=E成立・頻=頻度・損=損切り率・赤=Σ赤字）。最終損益(平均/中央/Σ)と勝ち/負け平均の母数＝最終損益が確定した件数でE成立とはズレることがある。勝ち/負けの境界は利確率と同じ（プラス＝勝ち／0円のトントンは負け側）。スコア＝旧H1基準の参考値［0.7×(1−H1損切り率)+0.3×H1勝率］＝★選定には不使用（H1勝率・平均H1損益の列は最終損益と重複のため2026-07-16に削除・列構成は基本α詳細表と同一）。" });
  return React.createElement("div", null,
    concl,
    React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", margin: "8px 0 0" } }, "母数の内訳: 応用〇 " + _yesN + "件 → 浮き足〇 " + _exUki + "件・RN〇 " + _exRn + "件を除外 → " + pool.length + "件"),
    _lbl("応用α別の総当たり（0〜20円・淡色＝全条件未達／「理想」＝全条件（到達率" + reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "未満・黒字）を満たすαのうち平均最終損益（1件あたり）が最大のα（基本α+1以上）／★＝推奨＝理想−" + _EL_ALPHA_OFFSET + "円／全条件を満たすαが無ければ条件適合無し／前提損切り値" + _elAnaCutCur + "円で評価／頻度＝数字が小さいほど高頻度）"),
    _elv2Table(["応用α", "E成立", "到達率", "頻度", "利確率(最終)", "損切り率(最終)", "最終損益(平均/中央/Σ)", "勝ち/負け平均", "スコア", "未達"].concat(onPick ? ["選択"] : []), rows),
    insight);
}
// 推奨α★ノード（2026-07-13c ユーザー指定）: 濃い字（条件を満たす＝status ok）の推奨は赤★、薄い字（条件緩和の参考＝status na）の推奨は青★。詳細データ表の★セルで共用。
function _elStarNode(status) {
  var col = (status === "na") ? "#0369A1" : "#C0392B";
  return React.createElement("span", { style: { color: col, fontWeight: 800, marginLeft: 2 } }, "★");
}
// 「旧基準」チップ（2026-07-13）: ★基準刷新の乖離確認用＝旧方式（基本α=合成スコア／追加α=固定基本α+段階選抜）なら選ばれていた値を、新推奨と異なる時だけグレーで併記。pfx="+"で追加α用。
function _elOldPickChip(newVal, oldVal, pfx) {
  if (oldVal == null || newVal == null || oldVal === newVal) return null;
  return React.createElement("span", { title: "旧方式（基本α=0.7×損切り回避+0.3×H1勝率の合成スコア／追加α=現在の推奨基本α+加算の段階選抜・いずれもH1基準・〜2026-07-12）ならこの値。新基準への移行で乖離を確認する用", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontSize: 9, fontWeight: 800, borderRadius: 4, padding: "1px 6px", marginLeft: 4, verticalAlign: "middle", color: "#64748B", background: "#F1F5F9", border: "1px solid #CBD5E1" } }, "旧基準 " + (pfx || "") + oldVal + "円");
}
// 旧・推奨追加αの段階選抜（〜2026-07-13の_elAddAlphaReco本体・固定基本α＋加算のH1基準）。刷新後は「旧基準」チップ用に保存。
// 基本αに +1〜+_EL_BASE_ADD_MAX(合計≤50)を上乗せした合計αを〇プールに当て、「黒字(ΣH1>0)かつscN≥10」に絞り、
// 損切り率0%＆到達40%→最小加算／損切り≤30%＆到達40%→最小加算／黒字中損切り最小、の段階選抜。
function _elAddAlphaRecoScore(recs, aiOf, baseAlpha) {
  if (!recs || baseAlpha == null) return null;
  aiOf = _elAnaAiOf(aiOf);   // 旧基準チップも同じ前提損切り値で比較（公平）2026-07-13b
  var evals = [];
  for (var add = 1; add <= _EL_BASE_ADD_MAX; add += 1) {   // 追加αは1円刻み(1/2/3…)＝ユーザー方針 2026-06-25
    var tot = baseAlpha + add;
    if (tot > 50) break;   // 合計αの上限（理想α候補と同レンジ）
    var e = _elBaseAlphaEval(recs, aiOf, tot);
    var sim = _elSimPnlByDay(recs, aiOf, tot);
    evals.push({ add: add, total: tot, e: e, sim: sim, pnl: (sim && sim.sum != null) ? sim.sum : null });
  }
  // 黒字(想定損益>0)かつ標本フロア scN≥_EL_BASE_MIN_N を満たす加算（黒字は全段共通の必須条件＝赤字の上乗せは推奨しない・1〜2件の偶然も除外）。evalsはadd昇順なのでこの並びも昇順。
  var black = evals.filter(function(x) { return x.e.scN >= _EL_BASE_MIN_N && x.pnl != null && x.pnl > 0; });
  // 損切り回避の優先順で段階選抜（ユーザー方針 2026-06-29d／到達率フロア追加 2026-06-30）: 第1=損切り0%かつ到達率≥_EL_ADD_MIN_ERATE→最小加算／第2=損切り≤_EL_ADD_STOPRATE_2(30%)かつ到達率≥_EL_ADD_MIN_ERATE→最小加算／第3(最後の砦)=それも無ければ黒字の中で損切り率が最も低いもの（同率は最小加算・到達率フロアは課さない）。
  var pool, p;
  var _reachOk = function(x) { return x.e.eRate != null && x.e.eRate >= _EL_ADD_MIN_ERATE; };   // EP到達率(OS3まで)が40%(既定)以上か。第1・第2段のみに課す＝届かない高αを除外（基本αと同思想）。第3段は安全網なので非課。
  var t1 = black.filter(function(x) { return x.e.stopRate === 0 && _reachOk(x); });                                                  // 第1: 損切り0% かつ 到達率≥フロア
  var t2 = black.filter(function(x) { return x.e.stopRate != null && x.e.stopRate <= _EL_ADD_STOPRATE_2 && _reachOk(x); });           // 第2: 損切り≤30% かつ 到達率≥フロア（0%も含むが第1優先）
  if (t1.length) { pool = t1; p = t1[0]; }
  else if (t2.length) { pool = t2; p = t2[0]; }
  else if (black.length) { pool = black; p = black.slice().sort(function(a, b) { return ((a.e.stopRate == null ? 1 : a.e.stopRate) - (b.e.stopRate == null ? 1 : b.e.stopRate)) || (a.add - b.add); })[0]; }   // 第3: 損切り率が最も低い（同率は最小加算）
  else return { add: 0, total: baseAlpha, improved: false, stopRate: null, h1win: null, eRate: null, scN: null, pnl: null, sim: null, add2: null, total2: null, stopRate2: null, h1win2: null, eRate2: null, scN2: null, pnl2: null, sim2: null };
  var p2 = (function() { for (var i = 0; i < pool.length; i++) { if (pool[i].add > p.add) return pool[i]; } return null; })();   // 次点＝選抜プール内で1番目より大きい最小の加算（poolはadd昇順）
  var _w = function(x) { return x ? { stopRate: x.e.stopRate, h1win: x.e.h1win, eRate: x.e.eRate, scN: x.e.scN, pnl: x.pnl, sim: x.sim } : null; };
  var f = _w(p), g = _w(p2);
  return { add: p.add, total: p.total, improved: true, stopRate: f.stopRate, h1win: f.h1win, eRate: f.eRate, scN: f.scN, pnl: f.pnl, sim: f.sim,
    add2: p2 ? p2.add : null, total2: p2 ? p2.total : null, stopRate2: g ? g.stopRate : null, h1win2: g ? g.h1win : null, eRate2: g ? g.eRate : null, scN2: g ? g.scN : null, pnl2: g ? g.pnl : null, sim2: g ? g.sim : null };
}
// ===== 推奨追加α【2026-07-13 全面刷新・ユーザー承認】＝日付別カウンターファクタル =====
// 「各記録日の推奨基本α(recoFn(r.date))＋加算X円で入っていたら手仕舞い(最終損益)でどうだったか」をX=0〜_EL_ADD_SWEEP_MAX(10円)でスイープ。
// X=0円＝足さない（その日の推奨基本αのまま）＝基準行。選定＝追加α条件式（到達率≥50%[_EL_BASE_MIN_ERATE]・損切り率(手じまい)≤40%[_EL_BASE_MAX_STOPRATE]・E成立≥件数条件・黒字）の中で平均最終損益（1件あたり）最大（同点はE成立多→小さいX）。
// 該当なしは頻度ゲートを外して緩和(status na=参考)。★がX=0なら「追加αは足さない方が良い」＝improved:false＋zeroBest:true（KPI/ゾーンヘッドが専用文言・フォーム/EPナビは従来どおり推奨無し扱い）。
// 返り値は旧_elAddAlphaReco互換 {add,total,improved,stopRate,h1win,eRate,scN,pnl,sim,add2,...}＋新fields {zeroBest,status,minN,nBase,decided,takeRate,h2Sum,avgH2,h2Sum2,sweepDate}。
// stopRate/takeRate/h2Sum/decided/eRate＝手じまい基準(_elH2EvalByFn)・h1win/scN/pnl＝H1基準の参考(_elAlphaEvalByFn)。recoFn未算出の記録(履歴不足)は母数外。
var _EL_ADD_SWEEP_MAX = 10;
function _elAddAlphaPickDate(pool, aiOf, recoFn, baseAlpha) {
  if (!pool || !pool.length || typeof recoFn !== "function") return null;
  aiOf = _elAnaAiOf(aiOf);   // 前提損切り値で評価（基本αと同じ前提）2026-07-13b
  var alphaOfAt = function(X) { return function(r) { var b = recoFn(r.date); return b == null ? null : b + X; }; };
  var sweep = [];
  for (var X = 0; X <= _EL_ADD_SWEEP_MAX; X++) sweep.push({ X: X, h2: _elH2EvalByFn(pool, aiOf, alphaOfAt(X)), h1: _elAlphaEvalByFn(pool, aiOf, alphaOfAt(X)) });
  var nBase = sweep[0].h2.n;   // 推奨基本αが算出できた（母数に入った）記録数
  var _fspan = _elBizSpanDays(pool, _elHoliCur);   // 頻度ゲート（2026-07-13c・基本αと同一・2026-07-15g 祝日も除外＝表示の頻度列と一致）
  var _freqOkX = function(X) { if (!(_fspan > 0)) return true; var ed = _elEnteredDays(pool, alphaOfAt(X)); return ed > 0 && (_fspan / ed) < _EL_FREQ_MAX; };
  var _selFrom = function(maxStop, useFreq) {
    var floors = [_EL_BASE_N_PREF, _EL_BASE_MIN_N];
    for (var fi = 0; fi < floors.length; fi++) {
      var f = floors[fi];
      var cand = sweep.filter(function(row) { var e = row.h2; return e.decided >= f && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.stopRate != null && e.stopRate <= maxStop && e.h2Sum != null && e.h2Sum > 0 && (!useFreq || _freqOkX(row.X)); });
      if (cand.length) return { cand: cand, floor: f };
    }
    return null;
  };
  var sel = _selFrom(_EL_BASE_MAX_STOPRATE, true), status = "ok";
  if (!sel) { sel = _selFrom(_EL_BASE_MAX_STOPRATE_2, true); if (sel) status = "na"; }
  if (!sel) { sel = _selFrom(_EL_BASE_MAX_STOPRATE_2, false); if (sel) status = "na"; }
  if (!sel) {
    return { add: 0, total: baseAlpha != null ? baseAlpha : null, improved: false, zeroBest: false, status: "none", minN: _EL_BASE_MIN_N, nBase: nBase,
      stopRate: null, takeRate: null, h2Sum: null, avgH2: null, decided: sweep[0].h2.decided || 0, eRate: null, h1win: null, scN: 0, pnl: null, sim: null,
      add2: null, total2: null, stopRate2: null, h1win2: null, eRate2: null, scN2: null, pnl2: null, h2Sum2: null, sim2: null, sweepDate: sweep };
  }
  var _sigOf = function(row) { return row.h2.h2Sum; }, _avgOf = function(row) { return row.h2.avgH2; }, _xOf = function(row) { return row.X; };   // 平均最終損益 最大 2026-07-15f（旧＝順位和）
  var picked = _elBordaBest(sel.cand, _sigOf, _avgOf, _xOf);
  var larger = sel.cand.filter(function(row) { return row.X > picked.X; });   // 次点＝pickedより大きい加算Xの中で平均最大
  var p2 = larger.length ? _elBordaBest(larger, _sigOf, _avgOf, _xOf) : null;
  var e = picked.h2, h1 = picked.h1;
  return { add: picked.X, total: baseAlpha != null ? baseAlpha + picked.X : null, improved: picked.X > 0, zeroBest: picked.X === 0,
    status: status, minN: sel.floor, nBase: nBase,
    stopRate: e.stopRate, takeRate: e.takeRate, h2Sum: e.h2Sum, avgH2: e.avgH2, decided: e.decided, eRate: e.eRate,
    h1win: h1.h1win, scN: h1.scN, pnl: h1.pnl, sim: null,
    add2: p2 ? p2.X : null, total2: (p2 && baseAlpha != null) ? baseAlpha + p2.X : null,
    stopRate2: p2 ? p2.h2.stopRate : null, h1win2: p2 ? p2.h1.h1win : null, eRate2: p2 ? p2.h2.eRate : null, scN2: p2 ? p2.h2.decided : null, pnl2: p2 ? p2.h1.pnl : null, h2Sum2: p2 ? p2.h2.h2Sum : null, sim2: null, sweepDate: sweep };
}
// 日付時点推奨基本αfnのモジュールキャッシュ（2026-07-13）: _elAddAlphaReco（フォーム/EPナビ/KPI等から高頻度で呼ばれる）が毎回recoFnを作り直すと重いので、
// 内容署名（日付/α/損切り値/足データ/期待度/〇浮RNフラグ）で同一スコープを再利用。シミュのrecoSigと同レシピ。上限24エントリのLRU。
var _elRecoFnMemo = [];
function _elRecoFnCached(recs, aiOf) {
  var sig = (recs || []).length + "|" + (recs || []).map(function(r) { var s = r && r.signal; if (!s) return (r && r.date) || ""; return (r.date || "") + "." + (s.alphaVal != null ? s.alphaVal : "") + "." + (s.addAlphaUsed === true ? "y" : s.addAlphaUsed === false ? "n" : "u") + (_elUkiYes(s) ? "U" : "") + (_elRnYes(s) ? "R" : "") + "." + (aiOf(r).cutLine != null ? aiOf(r).cutLine : "") + "." + (_epIsV2(s) ? _epLegs(s).map(function(l) { return l.h + "," + l.c + "," + (l.exp || ""); }).join("|") : "") + "." + (s.holdExp || "") + (s.hold2Exp || ""); }).join(";");
  sig = "c" + _elAnaCutCur + "!" + sig;   // 前提損切り値もキーに＝変更時に古いrecoFn（旧前提で算出済みの日付キャッシュ）を使い回さない 2026-07-13b
  for (var i = 0; i < _elRecoFnMemo.length; i++) {
    if (_elRecoFnMemo[i].sig === sig) { var hit = _elRecoFnMemo.splice(i, 1)[0]; _elRecoFnMemo.push(hit); return hit.fn; }
  }
  var fn = _elKabuRecoBaseFn(recs, aiOf);
  _elRecoFnMemo.push({ sig: sig, fn: fn });
  if (_elRecoFnMemo.length > 24) _elRecoFnMemo.shift();
  return fn;
}
// 推奨追加α（正本・2026-07-13から日付別方式のラッパー）: recs=追加α〇プール（呼び出し側で絞り済み）・baseAlpha=表示用total算出のための現在の推奨基本α（null可）・
// fullRecs=recoFn（各記録日の推奨基本α）を作る母数＝銘柄/シグナルの全記録（省略時はrecsで代用＝プールだけだと基本α履歴が痩せるので必ず渡すのが望ましい）。
function _elAddAlphaReco(recs, aiOf, baseAlpha, fullRecs) {
  if (!recs || !recs.length) return null;
  var recoFn = _elRecoFnCached((fullRecs && fullRecs.length) ? fullRecs : recs, aiOf);
  return _elAddAlphaPickDate(recs, aiOf, recoFn, baseAlpha != null ? baseAlpha : null);
}
// 浮き足加算α値（signal.ukiUsed=〇）の記録判定。旧: 追加α根拠「底抜け前足浮き（数値根拠）」を含む判定＝2026-07-03に浮き足フィールドへ載せ替え（過去記録はmigrateData(_migUkiAlpha app-01)で移行済み・関数名は互換のため据え置き・_EL_NUM_REASON/app-08同期は廃止）。
// 用途は従来どおり: 推奨追加α値の母数から除外＝固定の＋X円推奨に馴染まない数値ベース加算を外す（記録帳のシグナル内サブタブ・根拠別分析④/⑤・浮き足専用分析と同基準）。
function _elHasNumReason(s) { return _elUkiYes(s); }
// 推奨α母数の正本プール判定（2026-07-14 系統4共通化）: 基本α母数＝応用×・浮き足×・RN×／応用α母数＝応用〇・浮き足×・RN×。_elHasNumReason===_elUkiYes なのでフォーム系(!_elUkiYes)と分析系(!_elHasNumReason)は同一＝1本化。副作用カウント付きの母数構築(_yesN/_exUki/_exRn)とRN除外を省く旧サイト(app-06:2429)は構造が別なので対象外。
function _elIsBaseAlphaPoolRec(r) { return r && !_elSpecialUsed(r.signal) && !_elUkiYes(r.signal) && !_elRnYes(r.signal); }
function _elIsSpecialAlphaPoolRec(r) { return r && _elSpecialUsed(r.signal) && !_elUkiYes(r.signal) && !_elRnYes(r.signal); }
// 一括: { pick(推奨基本α本体・追加α無し母数), add(推奨追加α・追加α〇の記録だけを母数に算出) }。二プール設計 2026-06-22→2026-06-24g: pick.statusがna(件数不足)でも追加αを算出（ユーザー方針＝1件でも参考表示）。
// 浮き足加算率(%)・RN加算の共通数値ロジック（2026-07-14 共通化・監査finding2）: EPナビ_EpnCalcFormと記録フォームEntryRecordFormで字面まで二重だった実効%/加算値/ステッパーを1本化＝既定50%/floor/クランプ/空欄=自動のズレ防止。浮き値/RN値は入力で0〜にクランプ済み前提。
function _elUkiEffPct(pctStr, recoPct) { return (pctStr !== "" && !isNaN(Number(pctStr))) ? Number(pctStr) : (recoPct != null ? recoPct : 50); }   // 実効%＝手入力→推奨(_elUkiRecoPcts.reco)→50
function _elUkiAddVal(useOn, valStr, effPct) { var v = Number(valStr); return (useOn && valStr !== "" && !isNaN(v) && v > 0) ? Math.floor(v * effPct / 100) : 0; }   // 浮き足加算＝floor(浮き値×実効%/100)
function _elRnAddVal(useOn, valStr) { var v = Number(valStr); return (useOn && valStr !== "" && !isNaN(v) && v > 0) ? v : 0; }   // RN加算＝そのまま加算
function _elMkPctStepper(setFn) { return function(delta) { setFn(function(prev) { var cur = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : null; if (cur == null) return "50"; var n = cur + delta; if (n > 100) n = 100; if (n < 0) n = 0; return String(n); }); }; }   // 加算率↑↓: 空欄→50・以降±delta(0〜100)
// det→sig→stk 段階フォールバックの共通選定（2026-07-14 共通化・監査finding7/9）: legs=[{key,label,alpha,ok},...]を順に、まずok段、無ければ(allowProvisional時のみ)仮値段を同順で採用。返り値{alpha,key,src,ok}。src=label（仮値は label+「（仮）」）。全滅は{alpha:null,key:null,src:null,ok:false}。EPナビ(autoPick/_epnBaseLevelKey/_epnRecalcBase)=allowProvisional:true(場中は値を出す)／記録フォーム(_autoBase)=false(okのみ自動入力)。
function _elCascadePick(legs, allowProvisional) {
  var i, L;
  for (i = 0; i < legs.length; i++) { L = legs[i]; if (L && L.alpha != null && L.ok) return { alpha: L.alpha, key: L.key, src: L.label, ok: true }; }
  if (allowProvisional) for (i = 0; i < legs.length; i++) { L = legs[i]; if (L && L.alpha != null) return { alpha: L.alpha, key: L.key, src: L.label + "（仮）", ok: false }; }
  return { alpha: null, key: null, src: null, ok: false };
}
// 「この銘柄・EP起算(v2)・損益算入・(任意)基準日より前」の共通母数（2026-07-14 共通化・監査findingA）: 推奨α/EP計算の母数正本。before指定で当日以降を除外(後知恵回避)・null=全期間。EPナビ(_ElDayAlphaPair)/記録フォーム(_refBaseAlpha[全期間]/_alTblRecs/_refCutPick/_refSpecial)/日別ブロックが共用。※EPナビ_epnCascadeはキャッシュ_epnCollectSignals維持のため対象外。
function _elStockRecsBefore(data, stock, before) {
  return _elCollectAllSignals(data).filter(function(r) { return r && r.stock === stock && _epIsV2(r.signal) && _elInclData(r.signal) && (!before || r.date < before); });   // 分析母数（データ算入）2026-07-22f
}
// 直近件数窓の段階pick（2026-07-14 共通化・監査finding#3/25）: recsを日付昇順で直近50→100→全期間の窓に切り、最初にstatus==="ok"の推奨基本αを返す。無ければ全期間pick(仮値)。EPナビ_epnPickWinと記録フォーム_pickWinの共通正本＝窓刻み/フォールバック/idealAlphaのズレ防止。返り値{alpha,idealAlpha,ok,n,add}。
function _elWinPick(rs, aiOf) {
  if (!rs || !rs.length) return { alpha: null, idealAlpha: null, ok: false, n: 0, add: null };
  var _sorted = rs.slice().sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
  var _wins = [];
  [_EL_PERIOD_COUNTS[1], _EL_PERIOD_COUNTS[2]].forEach(function(n) { if (_sorted.length > n) _wins.push(_sorted.slice(_sorted.length - n)); });
  _wins.push(_sorted);
  var _lastA = null;
  for (var i = 0; i < _wins.length; i++) {
    var A = _elBaseAlphaA(_wins[i], aiOf); _lastA = A;
    if (A && A.pick && A.pick.alpha != null && A.pick.status === "ok") return { alpha: A.pick.alpha, idealAlpha: A.pick.idealAlpha, ok: true, n: rs.length, add: A.add };
  }
  return { alpha: (_lastA && _lastA.pick && _lastA.pick.alpha != null && _lastA.pick.status !== "none") ? _lastA.pick.alpha : null, idealAlpha: (_lastA && _lastA.pick) ? _lastA.pick.idealAlpha : null, ok: false, n: rs.length, add: (_lastA && _lastA.add) ? _lastA.add : null };
}
function _elBaseAlphaA(recs, aiOf, spanOverride) {   // spanOverride: 頻度ゲート分母を帯基準にする（株価帯コンテキスト）2026-07-22j
  var pick = _elBaseAlphaPick(recs, aiOf, spanOverride);   // 内部で応用〇記録を除外＝基本αの母数は「応用なし（通常）」
  if (!pick || pick.alpha == null) return null;
  // 推奨応用α（2026-07-13 応用α化）: 応用〇の記録だけを母数に、独立α値の最適(_elSpecialAlphaPick＝0〜20円1本)を算出。浮き足〇/RN〇は評価一貫性のため母数から除外。
  // 返り値 .add は応用shape {alpha,alpha2,status,minN,sweep,decided,eRate,stopRate,takeRate,h2Sum,avgH2,...}（旧増分shape{add,total,improved}は廃止）。使えない時はnull。
  var add = null;
  var spPool = (recs || []).filter(_elIsSpecialAlphaPoolRec);
  if (spPool.length) { var _sp = _elSpecialAlphaPick(spPool, aiOf, pick.idealAlpha, spanOverride); if (_sp && _sp.alpha != null && _sp.status !== "none") add = _sp; }   // minIdeal=基本αの理想＝応用αを基本αより大きくクランプ 2026-07-13。spanOverride=帯基準頻度 2026-07-22j
  return { pick: pick, add: add };
}
// ===== 推奨損切り値【実現H1損益をほぼ維持できる最小の損切り 2026-06-22d／ユーザー方針＝タイト優先】=====
// 平均最大化だけだと「1回の損失額(リスク)」を見ず大きい損切りに張り付く（回復する玉が多いと平均は損切りが大きいほど上がる・たまの大損が平均で薄まる）。
// そこで「実現H1損益（損切りルール適用後）の平均が最大値から tol(_EL_CUT_TOL_*)以内」に収まる中で【一番小さい】損切り値を選ぶ＝儲けをほぼ落とさず一番タイトに。
// 損切り回避率・H1勝率はその損切り値での根拠として併記。母数=「OS1〜3でEP到達しH1損益が判定できる記録」。各記録の採用α(aiOf(r).alpha)を使い損切り値だけを振る。
var _EL_CUT_CANDS = (function() { var _c = []; for (var _ci = 10; _ci <= 30; _ci++) _c.push(_ci); return _c; })();   // 推奨損切りの候補は10〜30円＝最低10円（ユーザー方針 2026-06-22d）。
// タイト優先の許容幅: 平均実現H1損益が「最大値−tol」以上の損切り値の中で最小を採用。tol=max(_EL_CUT_TOL_MIN円, |最大平均|×_EL_CUT_TOL_FRAC)。大きいほど小さい(タイトな)損切りになる。後で調整可 2026-06-22d。
var _EL_CUT_TOL_FRAC = 0.2;
var _EL_CUT_TOL_MIN = 200;
function _elCutEval(recs, aiOf, cut) {
  var sum = 0, nn = 0, stopN = 0, winN = 0;
  (recs || []).forEach(function(r) {
    var s = r.signal; if (!s) return;
    var ai = aiOf(r), alpha = ai.alpha; if (alpha == null) return;
    var rr = _epResolve(s, alpha);
    if (!(rr && rr.epIdx >= 0 && rr.epIdx <= 2)) return;   // OS1〜3でEP到達のみ
    var hd = _elDynHold(s, alpha, cut); if (hd == null) return;   // H1損益が判定できる記録のみ
    nn++; sum += hd;
    if (_elPlanIsStop(s, alpha, cut) || _elHoldIsStop(s, alpha, cut)) stopN++;
    else if (hd > 0) winN++;
  });
  return { cut: cut, n: nn, sum: nn ? sum : null, mean: nn ? sum / nn : null, stopRate: nn ? stopN / nn : null, h1win: nn ? winN / nn : null };
}
// 推奨損切り値を選定: 件数フロア(_EL_BASE_MIN_N)を満たす損切り値のうち、実現H1損益の平均が最大値から tol 以内に収まる中で【最小】の損切り値を採用（P&Lをほぼ維持できる範囲で一番タイト＝リスク小）。tol=max(_EL_CUT_TOL_MIN, |最大平均|×_EL_CUT_TOL_FRAC) 2026-06-22d。
// フロアを満たす損切り値が皆無なら件数最大の損切り値を参考(status="na")。返り値 { cut, mean, sum, stopRate, h1win, n, status, sweep }。
function _elCutPick(recs, aiOf) {
  if (!recs || !recs.length) return null;
  var sweep = _EL_CUT_CANDS.map(function(c) { return _elCutEval(recs, aiOf, c); });
  var ret = function(e, status) { return { cut: e.cut, mean: e.mean, sum: e.sum, stopRate: e.stopRate, h1win: e.h1win, n: e.n, status: status, sweep: sweep }; };
  var cand = sweep.filter(function(e) { return e.n >= _EL_BASE_MIN_N && e.mean != null; });
  if (cand.length) {
    var maxMean = cand.reduce(function(m, e) { return Math.max(m, e.mean); }, -Infinity);
    // P&Lをほぼ維持できる最小の損切り: 平均が「最大値−tol」以上の中で一番小さい損切り値を採用＝1回の損失額(リスク)を抑えるためタイト優先。
    var tol = Math.max(_EL_CUT_TOL_MIN, Math.abs(maxMean) * _EL_CUT_TOL_FRAC);
    var near = cand.filter(function(e) { return e.mean >= maxMean - tol; });
    near.sort(function(x, y) { return x.cut - y.cut; });
    return ret(near[0], "ok");
  }
  var anyN = sweep.filter(function(e) { return e.n > 0; });
  if (!anyN.length) return { cut: null, mean: null, sum: null, stopRate: null, h1win: null, n: 0, status: "none", sweep: sweep };
  anyN.sort(function(x, y) { return (y.n - x.n) || ((y.mean || -1e9) - (x.mean || -1e9)) || (x.cut - y.cut); });
  return ret(anyN[0], "na");
}
// 推奨損切り値セル（期間別表用・値のみ簡潔）: _elCutPick の cut を表示。na(件数フロア未満=参考)は橙＋「参考」、データ無しは—。損切り＝赤系で推奨基本α(青)と区別。母数はrecs全体（_elCutPick自身はv2/incl/追加α絞りをしないので呼び出し側で絞り済みのものを渡す）。2026-06-29。
function _elCutPickCell(recs, aiOf) {
  var p = _elCutPick(recs, aiOf);
  if (!p || p.cut == null || p.status === "none") return React.createElement("span", { style: { color: "#bbb" } }, "—");
  var na = p.status === "na";
  var h2 = _elCutPickH2(recs, aiOf);   // 最終損益基準の並走pick（承認① 2026-07-12・タイト優先ルールはH1版と同一）
  return React.createElement("span", { style: { whiteSpace: "nowrap", fontWeight: 800, fontSize: 13, color: na ? "#B45309" : "#C0392B" } },
    p.cut + "円",
    na ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 2, fontWeight: 700 } }, "参考") : null,
    _elH2AgreeNode(p.cut, h2 ? h2.cut : null, "円"));
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
// ===== α詳細表の共通セル（2026-07-16e 列再編で基本α/応用α/追加αの3表が共用）=====
// 「未達」セル: その行が★のどの最低条件で落ちたかを短い記号バッジで示す（淡色の理由の可視化）。ngs=[[記号, ツールチップ], ...]・空=全通過→緑✓。
// ゲート条件そのものは各表の pass 判定をほどいて渡す＝この関数は表示専用（判定ロジックを二重に持たない）。
function _elGateBadges(ngs) {
  if (!ngs || !ngs.length) return React.createElement("span", { title: "★の全最低条件を満たす", style: { color: "#1E8449", fontWeight: 800, fontSize: 11 } }, "✓");
  return React.createElement("span", { style: { display: "inline-flex", gap: 2, justifyContent: "center", whiteSpace: "nowrap" } },
    ngs.map(function(g, i) { return React.createElement("span", { key: i, title: g[1], style: { display: "inline-block", padding: "0 4px", borderRadius: 3, fontSize: 9, fontWeight: 700, background: "#FCEBEB", color: "#A32D2D", border: "1px solid #F09595" } }, g[0]); }));
}
// 「最終損益(平均/中央/Σ)」セル: 平均[太字]／中央[9px・同色]／Σ[8.5pxグレー]の3段。h2=_elH2EvalByFnの返り値。
// 中央値の追加理由（2026-07-16e）: ★選定が平均最終損益(avgH2)最大の一点張りなので、その平均が1件の大勝ちで作られていないかを検算する手段がこれまで表に無かった。
function _elH2AmtCell(h2) {
  if (!h2 || h2.avgH2 == null) return React.createElement("span", { style: { color: "#bbb" } }, "—");
  return React.createElement("div", { style: { lineHeight: 1.15 } },
    React.createElement("b", { style: { color: _elPnlColor(h2.avgH2) } }, _elPnlFmt(Math.round(h2.avgH2))),
    h2.medH2 != null ? React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: _elPnlColor(h2.medH2) } }, "中央 " + _elPnlFmt(Math.round(h2.medH2))) : null,
    React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8" } }, "Σ" + _elPnlFmt(Math.round(h2.h2Sum))));
}
// 「勝ち/負け平均」セル: 勝ったときの平均（上段）／負けたときの平均（下段）の2段。境界は利確率と同一(main>0が勝ち)。
// 追加理由（2026-07-16e）: 利確率と平均の1式では勝ち平均・負け平均の2値が決まらない＝情報の分解。負け平均は前提損切り値が効いているかの実測でもある。
function _elH2WinLossCell(h2) {
  if (!h2 || (h2.avgWin == null && h2.avgLoss == null)) return React.createElement("span", { style: { color: "#bbb" } }, "—");
  var _l = function(v, n) { return v == null ? React.createElement("div", { style: { color: "#ccc" } }, "—") : React.createElement("div", { style: { color: _elPnlColor(v), fontWeight: 700 }, title: n }, _elPnlFmt(Math.round(v))); };
  return React.createElement("div", { style: { lineHeight: 1.15 } },
    _l(h2.avgWin, "勝ったとき(" + (h2.takeN || 0) + "件)の平均"),
    _l(h2.avgLoss, "負け・トントン(" + (h2.h2Cnt != null && h2.takeN != null ? (h2.h2Cnt - h2.takeN) : 0) + "件)の平均＝プラスにならなかった全件（0円含む・利確率の裏返し）"));
}
// 推奨基本αの期間別トレンド本体（gran=month/week）。期間ごとに推奨基本αを出し、折れ線＋表＋最初vs直近の読み取り。2026-06-22再設計で単一推奨α＋損切り率/H1勝率/スコア表示。
function _elBaseAlphaTrendBody(recs, aiOf, gran) {
  var byB = {};
  (recs || []).forEach(function(r) { if (!r || !r.date) return; var k = _elBucketKey(r.date, gran); (byB[k] = byB[k] || []).push(r); });
  var buckets = Object.keys(byB).sort().map(function(k) {
    var rs = byB[k];
    return { key: k, label: _elBucketLabel(k, gran), pick: _elBaseAlphaPick(rs, aiOf), n: rs.length };
  }).filter(function(b) { return b.pick && b.pick.alpha != null && b.pick.status !== "none"; });   // 週別/月別も件数が少ない期間を参考(na)で表示＝1シグナルだと確定(ok)に届く期間が少なく行が出ないため（日別廃止に伴い）2026-07-01
  if (!buckets.length) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var pts = buckets.map(function(b) { return b.pick.alpha; });
  var xTicks = [], step = Math.max(1, Math.ceil(buckets.length / 6));
  buckets.forEach(function(b, i) { if (i % step === 0 || i === buckets.length - 1) xTicks.push({ i: i, label: b.label }); });
  var chart = buckets.length >= 2 ? _elLineChartV2([{ label: "推奨基本α", color: "#0369A1", pts: pts }], { xTicks: xTicks, height: 170, targetTicks: 6 }) : null;
  var rows = buckets.map(function(b, i) {
    var p = b.pick;
    return React.createElement("tr", { key: i },
      _elv2Td(b.label, { fontWeight: 700, color: "#9A3412" }),
      _elv2Td(React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("span", { style: { fontWeight: 700, color: p.status === "na" ? "#B45309" : "#0369A1" } }, p.alpha + "円", p.status === "na" ? React.createElement("span", { style: { fontSize: 8, fontWeight: 700, marginLeft: 2 } }, "参考") : null), _elReco2Node(p.alpha2 != null ? (p.alpha2 + "円") : null, 11, p.status === "na" ? "#B45309" : "#0369A1"))),
      _elv2Td(p.stopRate == null ? "—" : _elStopRateCell(p.stopRate)),
      _elv2Td(p.takeRate == null ? "—" : _elPctCell(p.takeRate)),
      _elv2Td(p.avgH2 == null ? "—" : React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("b", { style: { color: _elPnlColor(p.avgH2) } }, _elPnlFmt(Math.round(p.avgH2))), React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8" } }, "Σ" + (p.h2Sum != null ? _elPnlFmt(Math.round(p.h2Sum)) : "—")))),
      _elv2Td((p.decided != null ? p.decided : 0) + "件"));   // 新基準（最終損益ベース・平均主軸）の統計に統一 2026-07-13
  });
  var first = buckets[0], last = buckets[buckets.length - 1];
  var insight = (buckets.length >= 2) ? _elInsightBoxV2([
    React.createElement("span", null, "〜", _elInsightEmV2(first.label), "の推奨基本αは", _elInsightEmV2(first.pick.alpha + "円"), "、直近の", _elInsightEmV2(last.label), "は", _elInsightEmV2(last.pick.alpha + "円"), "。"),
    (last.pick.alpha !== first.pick.alpha) ? React.createElement("span", null, "最近は", _elInsightEmV2((last.pick.alpha > first.pick.alpha ? "高め" : "低め") + "（" + (last.pick.alpha > first.pick.alpha ? "+" : "") + (last.pick.alpha - first.pick.alpha) + "円）"), "の傾向。") : null
  ].filter(Boolean), { note: "各期間で「黒字・到達率が下限(既定" + _EL_ANA_REACH_DEF + "%)以上・頻度" + _EL_FREQ_MAX + "未満を満たすαのうち平均最終損益（1件あたり）が最大のα＝理想、推奨＝理想−" + _EL_ALPHA_OFFSET + "円」（2026-07-15f 平均最大・手じまいベース・前提損切り値" + _elAnaCutCur + "円で評価）。件数が少ない期間も参考(橙「参考」)で表示。0〜20円。件数が少ない期間は振れやすい" }) : null;
  return React.createElement("div", null, chart, _elv2Table(["期間", "推奨基本α", "損切り率(最終)", "利確率", "最終損益(平均/Σ)", "E成立"], rows), insight);
}
// 推奨基本αの「期間まとめ」: 1つの推奨値＋追加α＋α別の 損切り率(H1)/H1勝率/スコア 早見表（★=推奨）＋読み取り。2026-06-22再設計。
function _elBaseAlphaSummary(recs, aiOf) {
  var _A = _elBaseAlphaA(recs, aiOf);
  var pick = _A ? _A.pick : _elBaseAlphaPick(recs, aiOf);
  if (!pick || pick.status === "none" || pick.alpha == null) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var na = pick.status === "na";
  var minN = pick.minN || _EL_BASE_MIN_N;
  var noteSub = "★（2026-07-13新基準）＝到達率" + Math.round(pick.reachFloor * 100) + "%以上・損切り率(最終)" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%以下・頻度" + _EL_FREQ_MAX + "営業日/回未満・E成立" + _EL_BASE_N_PREF + "件以上（無ければ" + _EL_BASE_MIN_N + "件に自動緩和）・黒字のαの中で平均最終損益（手じまい・1件あたり）が最大のα。同点はE成立多→低α。該当なしは到達率" + _EL_ANA_REACH_FLOOR2 + "%へ緩和して参考（青★）。★赤＝条件充足／★青＝参考。5〜20円1円刻み";
  var _h2s = pick.h2sweep || [];
  var sweepRows = _h2s.filter(function(e) { return e.entered > 0; }).map(function(e) {
    var on = e.a === pick.alpha;
    var pass = e.decided >= minN && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && e.h2Sum != null && e.h2Sum > 0;
    return React.createElement("tr", { key: e.a, style: { background: on ? "#FEF3C7" : "transparent", opacity: pass ? 1 : 0.65 } },
      _elv2Td(React.createElement("span", { style: { fontWeight: on ? 800 : 600, color: on ? "#B45309" : "#0369A1" } }, e.a + "円", on ? _elStarNode(pick.status) : null), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _elv2Td(e.decided + "件"),
      _elv2Td(e.avgH2 == null ? "—" : React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("b", { style: { color: _elPnlColor(e.avgH2) } }, _elPnlFmt(Math.round(e.avgH2))), React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8" } }, "Σ" + _elPnlFmt(Math.round(e.h2Sum))))));
  });
  var _sweepHead = ["基本α", "到達率", "損切り率(最終)", "利確率(最終)", "E成立", "最終損益(平均/Σ)"];
  var stopP = pick.stopRate != null ? Math.round(pick.stopRate * 100) : null;
  var takeP = pick.takeRate != null ? Math.round(pick.takeRate * 100) : null;
  var cards = _elv2CardRow([
    _elv2Card("推奨基本α", React.createElement(React.Fragment, null, React.createElement("span", { style: { color: na ? "#B45309" : "#0369A1" } }, pick.alpha + "円"), _elReco2Node(pick.alpha2 != null ? (pick.alpha2 + "円") : null, 15, na ? "#B45309" : "#0369A1")), na ? "#B45309" : "#0369A1", na ? "条件緩和の参考" : "平均最終損益 最大"),
    _elv2Card("損切り率(最終)", stopP != null ? stopP + "%" : "—", stopP != null ? (stopP <= 20 ? "#1E8449" : stopP <= 40 ? "#B45309" : "#C0392B") : "#333", "推奨αで"),
    _elv2Card("利確率(最終)", takeP != null ? takeP + "%" : "—", takeP != null ? (takeP >= 70 ? "#1E8449" : takeP >= 50 ? "#B45309" : "#C0392B") : "#333", "推奨αで"),
    _elv2Card("平均最終損益", pick.avgH2 != null ? _elPnlFmt(Math.round(pick.avgH2)) : "—", _elPnlColor(pick.avgH2), "1件あたり・Σ" + (pick.h2Sum != null ? _elPnlFmt(Math.round(pick.h2Sum)) : "—")),
    _elv2Card("EP到達率", _elPctCell(pick.eRate), null),
    _elv2Card("E成立", (pick.decided != null ? pick.decided : 0) + "件", null, "勝敗判定できたE")
  ]);
  var banner = na ? React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6, padding: "5px 8px", marginBottom: 6 } }, "⚠ 到達率下限以上を保てるαが無い、または自信条件（損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "未満）を満たさず → 参考のα " + pick.alpha + "円 を青★で表示（信頼度低）") : null;
  return React.createElement("div", null, banner, cards,
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "8px 0 2px" } }, "α別の 到達率・損切り率(最終)・利確率・E成立・最終損益(平均/Σ)（理想＝到達率下限以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・頻度" + _EL_FREQ_MAX + "未満を満たすαのうち平均最終損益（1件あたり）が最大のα／★＝推奨＝理想−" + _EL_ALPHA_OFFSET + "・淡色は最低条件（到達率・損切り率・E成立・頻度<5・黒字）のどれかを満たさない・前提損切り値" + _elAnaCutCur + "円）"),
    _elv2Table(_sweepHead, sweepRows),
    _elInsightBoxV2([React.createElement("span", null, "推奨基本αは", _elInsightEmV2(pick.alpha + "円"), "（", (na ? "条件緩和の参考" : ("平均最終損益" + (pick.avgH2 != null ? _elPnlFmt(Math.round(pick.avgH2)) : "—") + "・損切り率" + (stopP != null ? stopP + "%" : "—") + "・利確率" + (takeP != null ? takeP + "%" : "—"))), "）。", "（応用αは「② 応用α」タブで）")], { note: noteSub }));
}
// 🎯 推奨基本α値: 週別/月別/期間まとめを切替（ステートフル・既定=週別）。日別は廃止（1シグナルだと1件/日で参考だらけ）。件数が少ない期間も参考(na)で表示。2026-07-01
function _elBaseAlphaTrendV2(props) {
  var recs = props.recs, aiOf = props.aiOf;
  var _g = useState("week"), gran = _g[0], setGran = _g[1];   // 既定=週別（日別廃止）2026-07-01
  var _tg = function(val, lbl) {
    var on = gran === val;
    return React.createElement("button", { key: val, onClick: function() { setGran(val); },
      style: { padding: "3px 12px", fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid " + (on ? "#0369A1" : "#ddd"), background: on ? "#0369A1" : "#fff", color: on ? "#fff" : "#666" } }, lbl);
  };
  var toggle = React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8 } }, _tg("week", "週別"), _tg("month", "月別"), _tg("period", "期間まとめ"));
  var body = gran === "period" ? _elBaseAlphaSummary(recs, aiOf) : _elBaseAlphaTrendBody(recs, aiOf, gran);
  return React.createElement("div", null, toggle, body);
}
// 推奨基本α 詳細データ（この銘柄/グループ）2026-06-22: 推奨値が出た根拠＝結論バー＋α別の総当たり(スコア内訳付き)＋読み取り。②採用αでの母数記録の内訳テーブルは2026-06-26にユーザー要望で削除（集計値は読み取りに残す）。
function _elBaseAlphaDetailV2(recs, aiOf, holiSet, onPick, curSel, spanOverride) {   // spanOverride: 頻度列＋★頻度ゲートの分母を帯基準（_pbBandBizDays）に。株価帯コンテキストでピルと一致させる 2026-07-22j
  var _A = _elBaseAlphaA(recs, aiOf, spanOverride);
  var pick = _A ? _A.pick : _elBaseAlphaPick(recs, aiOf, spanOverride);
  if (!pick || pick.status === "none" || (pick.alpha == null && pick.status !== "nomin")) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var _nomin = (pick.status === "nomin");   // E成立≥_EL_BASE_MIN_N件のαが1つも無い＝条件適合無し（推奨は出さず参考に総当たり表のみ表示）2026-07-14d
  var a = pick.alpha, ideal = (pick.idealAlpha != null ? pick.idealAlpha : pick.alpha), na = pick.status === "na", minN = pick.minN || _EL_BASE_MIN_N;
  var add = _A ? _A.add : null;
  var _lg = _elBaseAlphaPickScore(recs, aiOf);   // 旧・合成スコア方式なら選ばれていた値（乖離確認チップ用 2026-07-13・旧_elBaseAlphaH2Pickバッジを置換）
  var stopP = pick.stopRate != null ? Math.round(pick.stopRate * 100) : null;
  var winP = pick.h1win != null ? Math.round(pick.h1win * 100) : null;
  var _lbl = function(t) { return React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "10px 0 2px" } }, t); };
  var concl = React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 10px", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8, padding: "8px 12px" } },   // 基本αは青基調（nominでも警告琥珀にせず青系のまま）2026-07-14f
    React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, "推奨基本α"),
    _nomin
      ? React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: "#0369A1" } }, "ー（条件適合無し）")
      : React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } },
          React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: na ? "#B45309" : "#0369A1" } }, a + "円", (ideal !== a) ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#64748B", marginLeft: 6 } }, "（理想 " + ideal + "円 −" + _EL_ALPHA_OFFSET + "）") : null),
          _elReco2Node(pick.alpha2 != null ? (pick.alpha2 + "円") : null, 20, na ? "#B45309" : "#0369A1")),
    _nomin ? null : _elOldPickChip(a, _lg ? _lg.alpha : null),
    _nomin
      ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#0369A1" } }, "E成立" + _EL_BASE_MIN_N + "件以上のαが1つも無いため推奨を出せません（下表は参考）")
      : na
      ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#B45309" } }, "参考値（青★）：自信条件（損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "営業日/回未満）を満たさない、または到達率" + Math.round((pick.reachFloor != null ? pick.reachFloor : (_EL_ANA_REACH_DEF / 100)) * 100) + "%以上のαが無く緩和（E成立 " + (pick.decided != null ? pick.decided : 0) + "件）")
      : React.createElement("span", { style: { fontSize: 11, color: "#555" } },
          "平均最終損益 ", React.createElement("b", { style: { color: _elPnlColor(pick.avgH2) } }, pick.avgH2 != null ? _elPnlFmt(Math.round(pick.avgH2)) : "—"),
          React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "（Σ" + (pick.h2Sum != null ? _elPnlFmt(Math.round(pick.h2Sum)) : "—") + "）"),
          "／損切り率(最終) ", React.createElement("b", null, stopP != null ? stopP + "%" : "—"),
          "／利確率 ", React.createElement("b", null, pick.takeRate != null ? Math.round(pick.takeRate * 100) + "%" : "—"),
          "／E成立 ", React.createElement("b", null, (pick.decided || 0) + "件"),
          "／到達率 ", React.createElement("b", null, Math.round((pick.eRate || 0) * 100) + "%")),
    add
      ? React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } },
          React.createElement("span", { style: { fontSize: 11, color: "#9A3412", fontWeight: 700 } }, "応用α " + add.alpha + "円" + ((add.idealAlpha != null && add.idealAlpha !== add.alpha) ? "（理想" + add.idealAlpha + "円 −" + _EL_ALPHA_OFFSET + "）" : "") + (add.avgH2 != null ? "（平均" + (add.avgH2 > 0 ? "+" : "") + Math.round(add.avgH2).toLocaleString() + "円）" : "")),
          _elReco2Node(add.alpha2 != null ? (add.alpha2 + "円") : null, 11, "#9A3412"))
      : null);
  // α別総当たりの表示は0円から（推奨対象範囲_EL_BASE_ALPHAS=5〜20・★選定は不変／0〜4円は参考行として追加表示のみ）2026-07-02→0円を追加 2026-07-03。母数は推奨基本αと同じ×+未選択（_elBaseAlphaPickが内部で〇を除外するのに揃える）。
  // 2026-07-12: 浮き足〇/RN〇の除外も_elBaseAlphaPickに完全一致させる（旧=追加α〇だけ除外で、0〜4円行・頻度・母数集計にだけ浮き足〇が混入し5〜20円行と母数がズレていた）。
  var _baseRecs = (recs || []).filter(_elIsBaseAlphaPoolRec);
  // 母数内訳（⑤透明化 2026-07-13）: シグナル全体N件がどう絞られて母数になったかを表の上に明示（〇同士は重複しうるが除外判定は_baseRecsと同一）。
  var _exAddN = 0, _exUkiN = 0, _exRnN = 0;
  (recs || []).forEach(function(r) { var s = r && r.signal; if (!s) return; if (_elSpecialUsed(s)) _exAddN++; if (_elUkiYes(s)) _exUkiN++; if (_elRnYes(s)) _exRnN++; });
  var _baseSpan = (spanOverride != null) ? spanOverride : _elBizSpanDays(_baseRecs, holiSet);   // 頻度列（何営業日に1回）用: 母数の活動期間の営業日数（全行共通・分母は固定でαごとに到達実日数だけ変わる）2026-07-07。spanOverride=帯基準（ピルと一致）2026-07-22j
  var aiOfAna = _elAnaAiOf(aiOf);   // 表示スイープも★（pick内部でwrap済み）と同じ前提損切り値で評価 2026-07-13b
  var _lowSweep = [0, 1, 2, 3, 4].map(function(la) { return _elBaseAlphaEval(_baseRecs, aiOfAna, la); });
  var _dispSweep = _lowSweep.concat(pick.sweep);   // [0..4]（表示のみ）＋[5..20]（H1参考列）＝昇順
  var _reachFloor = pick.reachFloor != null ? pick.reachFloor : (_EL_ANA_REACH_DEF / 100);   // 淡色判定の到達率下限（★選定と同一・2026-07-13）
  var _reachP = Math.round(_reachFloor * 100);
  var _h2ByA = {};   // 最終損益デュアル列（利確率(最終)/最終損益・承認① 2026-07-12）: 表示各αの最終基準評価を母数一致(_baseRecs)で並走
  _dispSweep.forEach(function(e) { _h2ByA[e.a] = _elH2EvalByFn(_baseRecs, aiOfAna, function() { return e.a; }); });
  var sweepRows = _dispSweep.filter(function(e) { return e.entered > 0; }).map(function(e) {
    var _h2r = _h2ByA[e.a];
    var _ed = (spanOverride != null) ? _elEnteredCells(_baseRecs, function() { return e.a; }) : _elEnteredDays(_baseRecs, function() { return e.a; });   // 帯基準時は分母も(銘柄×日)セルで単位一致（ピルと同じ）2026-07-22k
    var _freqVal = (_baseSpan > 0 && _ed > 0) ? (_baseSpan / _ed) : null;   // 表示の頻度列と同じ値（祝日除外）
    var on = e.a === a, _isIdeal = (e.a === ideal && ideal !== a);
    // 淡色でない(pass)＝★の全最低条件（到達率・E成立・頻度・損切り率・黒字）を満たす 2026-07-15g。
    // 2026-07-16e: &&の連結を「未達」列用にほどく（判定は完全に等価＝全てANDなので順序不問）。_ng が空＝pass。
    var _ng = [];
    if (!(_h2r && _h2r.eRate != null && _h2r.eRate >= _reachFloor)) _ng.push(["到", "到達率が下限" + _reachP + "%未満"]);
    if (!(_h2r && _h2r.decided != null && _h2r.decided >= _EL_BASE_MIN_N)) _ng.push(["件", "E成立が下限" + _EL_BASE_MIN_N + "件未満"]);
    if (!(_freqVal != null && _freqVal < _EL_FREQ_MAX)) _ng.push(["頻", "頻度が" + _EL_FREQ_MAX + "営業日/回以上（低頻度すぎ）"]);
    if (!(_h2r && _h2r.stopRate != null && _h2r.stopRate <= _EL_BASE_MAX_STOPRATE)) _ng.push(["損", "損切り率(最終)が上限" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%超"]);
    if (!(_h2r && _h2r.h2Sum != null && _h2r.h2Sum > 0)) _ng.push(["赤", "Σ最終損益が赤字（または損益なし）"]);
    var pass = !_ng.length;
    var _isCur = !!(onPick && curSel != null && e.a === curSel);   // EPナビ「表を参照」ポップアップで現在の採用α値を青ハイライト 2026-07-13d
    var _cells = [
      _elv2Td(React.createElement("span", { style: { fontWeight: (on || _isIdeal) ? 800 : 600, color: on ? "#B45309" : "#0369A1" } }, e.a + "円", on ? _elStarNode(pick.status) : null, _isIdeal ? React.createElement("span", { style: { fontSize: 8.5, fontWeight: 700, color: "#64748B", marginLeft: 3 } }, "理想") : null), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td((_h2r ? _h2r.decided : 0) + "件"),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(_elFreqCell(_baseSpan, _ed)),
      _elv2Td((!_h2r || _h2r.takeRate == null) ? "—" : _elPctCell(_h2r.takeRate)),
      _elv2Td((!_h2r || _h2r.stopRate == null) ? "—" : _elStopRateCell(_h2r.stopRate)),
      _elv2Td(_elH2AmtCell(_h2r)),
      _elv2Td(_elH2WinLossCell(_h2r)),
      _elv2Td(_elScoreCell(e.score)),
      _elv2Td(_elGateBadges(_ng))
    ];
    if (onPick) _cells.push(_elv2Td(React.createElement("span", { style: { color: "#1D4ED8", fontWeight: 800, fontSize: 10, whiteSpace: "nowrap" } }, _isCur ? "採用中" : "選択")));
    return React.createElement.apply(null, ["tr", { key: e.a, onClick: onPick ? function() { onPick(e.a); } : null, style: { background: on ? "#FEF3C7" : (_isCur ? "#EFF6FF" : "transparent"), opacity: pass ? 1 : 0.65, cursor: onPick ? "pointer" : "default" } }].concat(_cells));
  });
  // ②の母数記録テーブルは2026-06-26にユーザー要望で削除。母数集計（scN/損切り/勝ち/その他/対象外）だけ残し読み取りに使用。母数＝追加α〇を除く（×・未選択のみ）＝_baseRecs。
  var _mRecs = _baseRecs;
  var scN = 0, stopN = 0, winN = 0, otherN = 0, offN = 0;
  var insight = null;
  if (!_nomin) {   // 条件適合無し（推奨α無し・a=null）時は母数集計・読み取りを出さない 2026-07-14d
  _mRecs.forEach(function(r) {
    var s = r.signal; if (!s) return;
    var c = aiOfAna(r).cutLine, rr = _epResolve(s, a), epIdx = rr ? rr.epIdx : -1;   // 前提損切り値で判定（★と同一）2026-07-13b
    if (!(epIdx >= 0 && epIdx <= 2)) { offN++; return; }   // OS1〜3以外（未到達）は対象外
    var epStop = _elPlanIsStop(s, a, c), h1Stop = _elHoldIsStop(s, a, c), hd = _elDynHold(s, a, c);
    if (!(epStop || h1Stop || hd != null)) return;   // 判定不可は母数外
    scN++;
    if (epStop || h1Stop) stopN++;
    else if (hd != null && hd > 0) winN++;
    else otherN++;
  });
  insight = _elInsightBoxV2([
    React.createElement("span", null, "採用α", _elInsightEmV2(a + "円"), "の母数は", _elInsightEmV2(scN + "件"), "（OS3までにEP到達しH1判定可能）。うち損切り", _elInsightEmV2(stopN + "件"), "・H1勝ち", _elInsightEmV2(winN + "件"), "・その他", _elInsightEmV2(otherN + "件"), "、対象外", _elInsightEmV2(offN + "件"), "（未到達）。"),
    React.createElement("span", null, "理想α＝", _elInsightEmV2("全条件（到達率" + _reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "未満・黒字）を満たすαのうち、平均最終損益（1件あたり）が最大のα"), "（到達率下限は🎯で調整可）。", _elInsightEmV2("推奨α＝理想−" + _EL_ALPHA_OFFSET + "円"), "（指値をギリギリで外さないよう理想より少し下げた実際に置く値）。同点は累計Σが大きい方→低α。全条件を満たすαが1つも無ければ『条件適合無し』。"),
    React.createElement("span", null, _elInsightEmV2("中央値"), "が平均から大きく下なら、その平均は少数の大勝ちで作られている（＝毎回は取れない）。", _elInsightEmV2("未達列"), "はその行が★のどの条件で落ちたかを示す（到=到達率・件=E成立・頻=頻度・損=損切り率・赤=Σ赤字）。")
  ], { note: "この銘柄のv2・算入記録（素の記録のみ）に各αを当ててシミュレーション（前提損切り値" + _elAnaCutCur + "円＝各記録の実損切り値ではなくこの前提で評価）。E成立・利確率・損切り率(最終)・最終損益(平均/中央/Σ)・勝ち/負け平均＝最終損益(手じまい・EP/H1/H2損切り込み)基準・理想＝全条件を満たすαのうち平均最終損益（1件あたり）が最大のα・推奨α＝理想−" + _EL_ALPHA_OFFSET + "円。最終損益(平均/中央/Σ)と勝ち/負け平均の母数＝最終損益が確定した件数で、隣のE成立とはEP×見送り等でズレることがある。勝ち/負けの境界は利確率と同じ（プラス＝勝ち／0円のトントンは負け側）。スコア＝旧H1基準の参考値［0.7×(1−H1損切り率)+0.3×H1勝率］＝★選定には不使用（H1勝率・平均H1損益の列は最終損益と重複のため2026-07-16に削除）。" });
  }
  return React.createElement("div", null,
    concl,
    _elv2Table(["基本α", "E成立", "到達率", "頻度", "利確率(最終)", "損切り率(最終)", "最終損益(平均/中央/Σ)", "勝ち/負け平均", "スコア", "未達"].concat(onPick ? ["選択"] : []), sweepRows),
    insight);
}
// 推奨追加α 詳細データ（この銘柄/グループ）2026-07-03: 推奨基本α詳細データ(_elBaseAlphaDetailV2)の追加α版＝結論バー＋加算値別の総当たり（基本α＋加算ごとの到達率/件数/損切り率/H1勝率/想定損益・★＝推奨）＋読み取り。母数＝追加α〇（数値根拠＝底抜け前足浮きは除外・_elAddAlphaRecoと同一）。集計タブ銘柄別パネルで追加α母数トグル〇のとき、畳んだ基本α詳細の下に表示。想定損益＝ΣH1損益（_elBaseAlphaEval.pnl＝_elSimPnlByDay.sumと同値）。
// 【未配線・2026-07-16e 明記】この関数はどこからも呼ばれていない（呼出0件＝定義とコメント参照のみ）。2026-07-13f の応用α移行で配線を外したまま「当面残置」になっている（FILEMAP.md:77）。
// ＝ここの列・文言を直しても画面には一切出ない。復活させるなら基本α詳細表(_elBaseAlphaDetailV2)と列を揃えること。専用の _elAddAlphaPickDate/_elAddAlphaRecoScore も同様に未配線。
function _elAddAlphaDetailV2(recs, aiOf, holiSet, fullRecs) {
  var _A = _elBaseAlphaA(recs, aiOf);
  var pick = _A ? _A.pick : null;
  if (!pick || pick.alpha == null) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "基本αが未確定のため追加αを算出できません");
  var addPool = (recs || []).filter(_elIsSpecialAlphaPoolRec);
  if (!addPool.length) return React.createElement("div", { style: { fontSize: 11, color: "#94A3B8", padding: "4px 0" } }, "追加α〇（要）を明示した記録がありません（このスコープ）");
  // 【2026-07-13 全面刷新・ユーザー承認】主表＝日付別カウンターファクタル（各記録日の推奨基本α＋加算X・手じまい基準）。fullRecs=recoFn母数（銘柄/シグナル全体・省略時recs）。
  var base = pick.alpha;
  var recoFn = _elRecoFnCached((fullRecs && fullRecs.length) ? fullRecs : recs, aiOf);
  var add = _elAddAlphaPickDate(addPool, aiOf, recoFn, base);
  var _lg = _elAddAlphaRecoScore(addPool, aiOf, base);   // 旧・段階選抜（固定基本α+加算・H1基準）＝「旧基準」チップ用
  var _addImproved = !!(add && add.improved);
  var _zero = !!(add && add.zeroBest);
  var _hasPick = !!(add && add.status !== "none");
  var na = !!(add && add.status === "na");
  var minN = (add && add.minN) || _EL_BASE_MIN_N;
  var _lbl = function(t) { return React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "10px 0 2px" } }, t); };
  var _pctS = function(v) { return v != null ? Math.round(v * 100) + "%" : "—"; };
  var _yesN = 0, _exUki = 0, _exRn = 0;
  (recs || []).forEach(function(r) { var s = r && r.signal; if (!s || !_elSpecialUsed(s)) return; _yesN++; if (_elHasNumReason(s)) _exUki++; else if (_elRnYes(s)) _exRn++; });
  var _uzuLine = React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", margin: "6px 0 0" } },
    "母数の内訳: 追加α〇 " + _yesN + "件 → 浮き足〇 " + _exUki + "件・RN〇 " + _exRn + "件を除外 → " + addPool.length + "件（うち記録日の推奨基本αを算出できた " + (add ? add.nBase : 0) + "件が評価対象）");
  var concl = React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 10px", background: na ? "#FEF3C7" : (_hasPick ? "#FFF7ED" : "#F8FAFC"), border: "1px solid " + (na ? "#FCD34D" : (_hasPick ? "#FED7AA" : "#E2E8F0")), borderRadius: 8, padding: "8px 12px" } },
    React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, "推奨追加α"),
    _hasPick
      ? React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } },
          React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: na ? "#B45309" : (_zero ? "#64748B" : "#9A3412") } }, "+" + add.add + "円" + (_zero ? "（足さない）" : "")),
          _elReco2Node(add.add2 != null ? ("+" + add.add2 + "円") : null, 20, na ? "#B45309" : "#9A3412"))
      : React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "#94A3B8" } }, "推奨無し（条件を満たす加算なし・履歴/件数不足）"),
    _elOldPickChip(_hasPick ? add.add : null, (_lg && _lg.improved) ? _lg.add : null, "+"),
    na ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#B45309" } }, "参考値（青★・損切り率" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%以下かつ頻度" + _EL_FREQ_MAX + "営業日/回未満の加算が無く、頻度条件を外して選定）") : null,   // 2026-07-16e: 損切り率のリテラル20%を定数参照に（実ゲートは_EL_BASE_MAX_STOPRATE＝40%）＋naの実体は頻度ゲート解除なので文言も実装に合わせた
    _hasPick
      ? React.createElement("span", { style: { fontSize: 11, color: "#555" } },
          "平均最終損益 ", React.createElement("b", { style: { color: _elPnlColor(add.avgH2) } }, add.avgH2 != null ? _elPnlFmt(Math.round(add.avgH2)) : "—"),
          React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "（Σ" + (add.h2Sum != null ? _elPnlFmt(Math.round(add.h2Sum)) : "—") + "）"),
          "／損切り率(最終) ", React.createElement("b", null, _pctS(add.stopRate)),
          "／利確率 ", React.createElement("b", null, _pctS(add.takeRate)),
          "／E成立 ", React.createElement("b", null, (add.decided || 0) + "件"),
          "／到達率 ", React.createElement("b", null, _pctS(add.eRate)))
      : null);
  var sweep = [];
  for (var ad = 1; ad <= _EL_BASE_ADD_MAX; ad += 1) {
    var tot = base + ad; if (tot > 50) break;
    sweep.push({ ad: ad, tot: tot, e: _elBaseAlphaEval(addPool, aiOf, tot) });
  }
  var pickedAdd = null;   // 参考表（固定スイープ）に★は付けない＝★は日付別の主表とだけ一致させる 2026-07-13
  var addRows = sweep.filter(function(x) { return x.e.entered > 0; }).map(function(x) {
    var on = pickedAdd != null && x.ad === pickedAdd, pass = x.e.scN >= _EL_BASE_MIN_N;
    return React.createElement("tr", { key: x.ad, style: { background: on ? "#FFF7ED" : "transparent", opacity: pass ? 1 : 0.4 } },
      _elv2Td(React.createElement("span", { style: { fontWeight: on ? 800 : 600, color: "#9A3412" } }, "+" + x.ad + "円" + (on ? " ★" : "")), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, x.tot + "円")),
      _elv2Td(_elPctCell(x.e.eRate)),
      _elv2Td(x.e.scN + "件"),
      _elv2Td(x.e.stopRate == null ? "—" : _elStopRateCell(x.e.stopRate)),
      _elv2Td(x.e.h1win == null ? "—" : _elPctCell(x.e.h1win)),
      _elv2Td((function() { var _p = x.e.pnl; return _p == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(Math.round(_p)), fontWeight: 700 } }, _elPnlFmt(Math.round(_p))); })()));
  });
  // 主表（2026-07-13刷新・ユーザー承認）: 日付別カウンターファクタル＝「各記録日の推奨基本α＋加算X円(0〜10)で入っていたら手仕舞い(最終損益)でどうだったか」。
  // 行データは_elAddAlphaPickDateのsweepDateを流用（★・結論バーと完全一致）。0円行＝足さなかった場合＝基準行。
  var _dsSpan = _elBizSpanDays(addPool, holiSet, function(r) { return recoFn(r.date) != null; });
  var _dateRows = (add && add.sweepDate ? add.sweepDate : []).filter(function(row) { return row.h2.entered > 0 || row.X === 0; }).map(function(row) {
    var e = row.h2;
    var on = _hasPick && row.X === add.add;
    var pass = e.decided >= minN && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && e.h2Sum != null && e.h2Sum > 0;
    // 2026-07-16e: 基本α/応用α詳細表に合わせ H1勝率・平均H1損益を削除（最終損益と重複）＋列順を E成立→到達率／利確率→損切り率 に＋中央値・勝ち/負け平均を追加。
    // 「未達」列は入れない＝この表の pass(上行)は★選定(_elAddAlphaPickDate)と別系統のゲート（到達率は固定_EL_BASE_MIN_ERATE・頻度ゲート無し）なので、バッジにすると★と矛盾して見える。
    return React.createElement("tr", { key: row.X, style: { background: on ? "#FFF7ED" : "transparent", opacity: pass ? 1 : 0.4 } },
      _elv2Td(React.createElement("span", { style: { fontWeight: on ? 800 : 600, color: row.X === 0 ? "#64748B" : "#9A3412", whiteSpace: "nowrap" } }, "+" + row.X + "円" + (row.X === 0 ? "（足さない）" : ""), on ? _elStarNode(add.status) : null), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(e.decided + "件"),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(_elFreqCell(_dsSpan, _elEnteredDays(addPool, function(r) { var b = recoFn(r.date); return b == null ? null : b + row.X; }))),
      _elv2Td(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(_elH2AmtCell(e)),
      _elv2Td(_elH2WinLossCell(e)));
  });
  var _zeroRow = (add && add.sweepDate && add.sweepDate[0]) ? add.sweepDate[0].h2 : null;
  var insight = _elInsightBoxV2([
    _hasPick
      ? React.createElement("span", null, "各記録日の推奨基本αに", _elInsightEmV2("+" + add.add + "円" + (_zero ? "（＝足さない）" : "")), "が最良（平均最終損益 ", _elInsightEmV2(add.avgH2 != null ? _elPnlFmt(Math.round(add.avgH2)) : "—"), "・損切り率(最終) ", _elInsightEmV2(_pctS(add.stopRate)), "・E成立 ", _elInsightEmV2((add.decided || 0) + "件"), "）。")
      : React.createElement("span", null, "条件（到達率" + Math.round(_EL_BASE_MIN_ERATE * 100) + "%・損切り率(最終)" + Math.round(_EL_BASE_MAX_STOPRATE_2 * 100) + "%以下まで緩和・E成立" + _EL_BASE_MIN_N + "件・黒字）を満たす加算が無く", _elInsightEmV2("推奨無し"), "。"),   // 2026-07-16e: リテラルを定数参照に（この関数から手書き閾値を一掃）
    (_hasPick && !_zero && _zeroRow && _zeroRow.avgH2 != null && add.avgH2 != null)
      ? React.createElement("span", null, "足さなかった場合（+0円）の平均最終損益は", _elInsightEmV2(_elPnlFmt(Math.round(_zeroRow.avgH2))), "＝上乗せの効果は1件あたり", _elInsightEmV2(_elPnlFmt(Math.round(add.avgH2 - _zeroRow.avgH2)), (add.avgH2 - _zeroRow.avgH2) >= 0 ? "#C0392B" : "#1E8449"), "。")
      : null
  ], { note: "母数＝追加α〇（浮き足〇・RN〇除外）。主表＝各記録に「その記録日時点の推奨基本α（前日までの直近50→100件→全期間・現在の★基準で再計算）＋加算X円」を当て、手じまい（最終損益・EP/H1/H2損切り込み）で評価する反実仮想。★＝到達率" + Math.round(_EL_BASE_MIN_ERATE * 100) + "%以上・損切り率(最終)" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%以下・E成立" + _EL_BASE_N_PREF + "件（無ければ" + _EL_BASE_MIN_N + "件に緩和）・黒字の中で平均最終損益（1件あたり）最大＝基本αと同じ条件式。中央値が平均から大きく下なら、その平均は少数の大勝ちで作られている（＝毎回は取れない）。勝ち/負けの境界は利確率と同じ（プラス＝勝ち）。参考表＝旧方式（現在の推奨基本α" + base + "円を土台に一様加算・H1基準）。" });
  return React.createElement("div", null,
    concl,
    _uzuLine,
    _lbl("日付別カウンターファクタル（主表）: 各記録日の推奨基本α＋加算X円で入っていたら手仕舞いでどうだったか（0円＝足さない・★赤＝条件を満たす推奨／★青＝条件緩和の参考推奨・淡色＝条件[到達" + Math.round(_EL_BASE_MIN_ERATE * 100) + "%・損切り(最終)" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%以下・E成立" + minN + "件・黒字]を満たさない加算／前提損切り値" + _elAnaCutCur + "円で評価／頻度＝数字が小さいほど高頻度）"),
    _dateRows.length ? _elv2Table(["追加α", "E成立", "到達率", "頻度", "利確率(最終)", "損切り率(最終)", "最終損益(平均/中央/Σ)", "勝ち/負け平均"], _dateRows) : React.createElement("div", { style: { fontSize: 10.5, color: "#bbb", padding: "4px 0" } }, "推奨基本αが算出できる記録がありません（履歴不足）"),
    _lbl("（参考）現在の推奨基本α" + base + "円＋加算の固定スイープ（＋1〜" + _EL_BASE_ADD_MAX + "円・H1基準・旧方式＝記録日に依らず今の推奨基本αを土台に一様加算・★なし）"),
    _elv2Table(["追加α", "合計α", "到達率", "有効件数", "損切り率", "H1勝率", "想定損益"], addRows),
    insight);
}
// 推奨基本α表（銘柄/期間グループ別）: groups=[{label,recs}]・cutFn(r)→損切り値。各グループの推奨基本α(_elBaseAlphaPick・5〜20・
// 全条件ゲート＋平均最終損益最大・該当なしは到達率50%緩和)を1値表示＋損切り率/H1勝率の小書き＋追加α目安。旧 _elIdealAlphaTableV2(EP/H1/H2別・0〜50)を置換 2026-06-21→条件再設計 2026-06-22→選定は合成スコア→平均最終損益へ(コメント更新 2026-07-22j)。
function _elBaseAlphaTableV2(groups, cutFn) {
  var _cf = cutFn || function() { return 10; };
  var aiOf = function(r) { return { cutLine: _cf(r) }; };
  var _th = function(t) { return React.createElement("th", { style: { padding: "3px 8px", fontWeight: 700, color: "#9A9186", fontSize: 10, borderBottom: "1px solid #E4DFD7", textAlign: "center", whiteSpace: "nowrap" } }, t); };
  var _aLine = function(pk) {
    if (!pk || pk.alpha == null) return React.createElement("div", { style: { fontSize: 10, color: "#aaa", whiteSpace: "nowrap" } }, "—");
    var na = pk.status === "na";
    return React.createElement("div", { style: { whiteSpace: "nowrap", lineHeight: 1.3 } },
      React.createElement("div", null,
        React.createElement("span", { style: { fontWeight: 800, color: na ? "#B45309" : "#0369A1", fontSize: 14 } }, pk.alpha + "円"),
        na ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 3, fontWeight: 700 } }, "データ不足 " + (pk.scN != null ? pk.scN : 0) + "件/最低" + (pk.minN || 3) + "件・参考") : React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", marginLeft: 3 } }, "損切" + Math.round((pk.stopRate || 0) * 100) + "%・H1勝" + Math.round((pk.h1win || 0) * 100) + "%・" + (pk.scN || 0) + "件")),
      _elReco2Node(pk.alpha2 != null ? (pk.alpha2 + "円") : null, 14, na ? "#B45309" : "#0369A1"));
  };
  var rows = (groups || []).filter(function(g) { return g.recs && g.recs.length; }).map(function(g, gi) {
    var A = _elBaseAlphaA(g.recs, aiOf);
    var cell;
    if (!A) cell = React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "データ無し");
    else cell = React.createElement("div", null,
      _aLine(A.pick),
      A.add ? React.createElement("div", { style: { whiteSpace: "nowrap", marginTop: 1, lineHeight: 1.2 } }, React.createElement("div", { style: { fontSize: 9, color: "#9A3412" } }, "応用α " + A.add.alpha + "円"), _elReco2Node(A.add.alpha2 != null ? (A.add.alpha2 + "円") : null, 9, "#9A3412")) : null);
    return React.createElement("tr", { key: gi, style: { borderBottom: "1px solid #dbeafe" } },
      React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#9A3412", fontSize: 11, whiteSpace: "nowrap", verticalAlign: "top" } }, g.label),
      React.createElement("td", { style: { padding: "3px 8px", textAlign: "left", borderLeft: "1px solid #dbeafe" } }, cell));
  });
  if (!rows.length) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  return React.createElement(_HScrollBox, null,
    React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 11, width: "100%" } },
      React.createElement("thead", null, React.createElement("tr", null, _th("銘柄"), _th("推奨基本α／応用α"))),
      React.createElement("tbody", null, rows)));
}
// 直近件数ベースの窓のサイズ【件数ベース化 2026-06-26】: 直近N件(25/50/100)。銘柄別だとカレンダー窓(1週/1月…)は標本が痩せ「参考」表示が頻発するため、件数で標本数を安定させフロア(_EL_BASE_MIN_*)を確実に効かせる。取引密度に合わせて後で調整可。
var _EL_PERIOD_COUNTS = [25, 50, 100];
// 期間別の窓【件数ベース 2026-06-26】: recsをrefDate基準で「前日まで(当日除外=r.date<refDate)」に絞り、日付順に並べた末尾から直近N件(_EL_PERIOD_COUNTS)と全期間の窓を返す。includeToday時は先頭に当日の「本日」窓。_okRでv2&算入のみ。基本α表/追加α表/簡略ボードで共用（旧カレンダー移動窓1週/1月/3月から変更）。
function _elPeriodWindows(recs, refDate, includeToday) {
  var _okR = function(r) { return r && r.date && _epIsV2(r.signal) && _elInclData(r.signal); };   // 期間窓（推奨α表の母数）＝分析母数（データ算入）2026-07-22f
  var all = (recs || []).filter(function(r) { return _okR(r) && r.date < refDate; });
  // 前日までを日付昇順に整列（末尾＝直近・同日内は元の並びを保持）。直近N件＝末尾からN件。
  var sorted = all.slice().sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
  var _lastN = function(n) { return sorted.length > n ? sorted.slice(sorted.length - n) : sorted.slice(); };
  var today = includeToday ? (recs || []).filter(function(r) { return _okR(r) && r.date === refDate; }) : [];
  var _p = String(refDate).split("-");
  var periods = [];
  if (includeToday) periods.push({ label: "本日（" + Number(_p[1]) + "/" + Number(_p[2]) + "）", recs: today });   // 「本日」＝開いているページの日付なのでM/Dを併記 2026-06-24i
  _EL_PERIOD_COUNTS.forEach(function(n) { periods.push({ label: "直近" + n + "件", recs: _lastN(n), main: (n === _EL_PERIOD_COUNTS[1]) }); });   // main=直近50件＝推奨基本/追加αのおすすめ主期間（★ハイライト用）2026-06-27
  periods.push({ label: "全期間", recs: all });
  return { periods: periods, hasAny: (all.length > 0 || today.length > 0) };
}
// 期間ラベルのノード: おすすめ窓（pd.main=直近50件＝推奨基本/追加αの主期間）は★＋「おすすめ」バッジ付き 2026-06-27。
function _elPeriodLabelNode(pd) {
  if (!pd || !pd.main) return pd ? pd.label : "";
  return React.createElement("span", { style: { whiteSpace: "nowrap" } },
    React.createElement("span", { style: { color: "#F59E0B", marginRight: 2 } }, "★"),
    pd.label,
    React.createElement("span", { style: { fontSize: 8, fontWeight: 700, color: "#0369A1", background: "#fff", border: "1px solid #93C5FD", borderRadius: 4, padding: "0 4px", marginLeft: 4 } }, "おすすめ"));
}
// 指定αを母数recに一律適用したH1想定損益（_elBaseAlphaEvalのpnlと同基準＝OS1〜3でEP到達しH1損益が判定できる記録のΣ_elDynHold）と、その記録の異なる営業日数。
// 「1営業日あたり」＝Σ想定損益÷エントリー成立日数（記録の無い日・ノーシグナル日は母数に入らず自然に除外）。返り値 { sum, n, days, avg } 2026-06-24。
function _elSimPnlByDay(recs, aiOf, alpha) {
  if (alpha == null) return { sum: null, n: 0, days: 0, avg: null };
  var sum = 0, n = 0, has = false, dmap = {};
  (recs || []).forEach(function(r) {
    var s = r.signal; if (!s) return;
    var c = aiOf(r).cutLine;
    var rr = _epResolve(s, alpha);
    if (!(rr && rr.epIdx >= 0 && rr.epIdx <= 2)) return;   // OS1〜3でEP到達のみ
    var hd = _elDynHold(s, alpha, c);
    if (hd == null) return;                                  // H1損益が判定できる記録のみ
    sum += hd; has = true; n++;
    if (r.date) dmap[r.date] = true;
  });
  var days = 0; for (var k in dmap) { if (dmap.hasOwnProperty(k)) days++; }
  return { sum: has ? sum : null, n: n, days: days, avg: (has && days > 0) ? sum / days : null };
}
// 想定損益セル: 上段「+X円/日」（1営業日あたり平均）＋下段「1件 +Z円」（1件あたり期待損益＝想定損益÷件数・件数/頻度に左右されず窓間で比較しやすい）2026-06-27（旧: 下段は期間累計）。データ無しは—。利益=赤/損=緑（当アプリ慣習）。
function _elSimPnlCell(sim) {
  if (!sim || sim.sum == null || sim.days <= 0) return React.createElement("span", { style: { color: "#bbb" } }, "—");
  var avg = Math.round(sim.avg);
  var per = (sim.n > 0) ? Math.round(sim.sum / sim.n) : null;   // 1件あたり期待損益（想定損益÷件数）2026-06-27
  return React.createElement("span", { style: { whiteSpace: "nowrap", lineHeight: 1.3, display: "inline-block" } },
    React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: _elPnlColor(avg) } }, _elPnlFmt(avg) + "/日"),
    React.createElement("br", null),
    (per != null) ? React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: _elPnlColor(per) } }, "1件" + _elPnlFmt(per)) : React.createElement("span", { style: { color: "#bbb" } }, "—"),
    (per != null) ? React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", marginLeft: 2 } }, "・" + sim.n + "件") : null);
}
// 期間別の推奨基本α（前日まで・移動窓）: recsをrefDate未満(=その日の前日まで・当日を含めない)に絞り、直近25件/50件/100件/全期間で推奨基本α(_elBaseAlphaA)を出す表。銘柄別記録の「前日まで」分析用 2026-06-22c。
// aiOf(r)→{cutLine}（採用は各記録のcutLine）。期間窓はrefDate起点の件数窓（銘柄別でカレンダー窓が痩せるのを避ける）。
function _elBaseAlphaPeriodTableV2(recs, aiOf, refDate, includeToday) {
  var W = _elPeriodWindows(recs, refDate, includeToday);
  if (!W.hasAny) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var dash = React.createElement("span", { style: { color: "#bbb" } }, "—");
  var rows = [];
  W.periods.forEach(function(pd, i) {
    var A = _elBaseAlphaA(pd.recs, aiOf);
    var pk = A ? A.pick : null;
    var add = A ? A.add : null;
    var basePool = pd.recs.filter(_elIsBaseAlphaPoolRec);   // 想定損益の母数も推奨基本α(_elBaseAlphaPick)と同じ三重除外に揃える 2026-07-13
    var alphaCell, simBase = null;
    if (!pk || pk.alpha == null) alphaCell = dash;
    else {
      var na = pk.status === "na";
      alphaCell = React.createElement("div", { style: { whiteSpace: "nowrap", lineHeight: 1.15 } },
        React.createElement("span", { style: { fontWeight: 800, fontSize: 13, color: na ? "#B45309" : "#0369A1" } }, pk.alpha + "円"),
        na ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 2, fontWeight: 700 } }, "参考") : null,
        (pk.alpha2 != null) ? React.createElement("span", { style: { fontSize: 11, color: "#64748B", marginLeft: 4 } }, "（次点：" + pk.alpha2 + "円）") : React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", marginLeft: 4 } }, "（次点なし）"));
      simBase = _elSimPnlByDay(basePool, aiOf, pk.alpha);
    }
    var _pdiv = (i > 0) ? { borderTop: "2px solid #7DD3FC" } : null;   // 期間どうしの明確な区切り線（先頭期間以外の主行の上）2026-06-24g
    var _mainBg = pd.main ? { background: "#EFF6FF" } : null;   // おすすめ窓（直近50件）の行ハイライト 2026-06-27
    var _cEx = (_pdiv || _mainBg) ? Object.assign({}, _pdiv || {}, _mainBg || {}) : null;
    rows.push(React.createElement("tr", { key: "m" + i },
      _elv2Td(_elPeriodLabelNode(pd), Object.assign({ fontWeight: 700, color: "#9A3412", textAlign: "left", paddingLeft: 8 }, _pdiv || {}, _mainBg || {})),
      _elv2Td(alphaCell, _cEx),
      _elv2Td(_elCutPickCell(pd.recs, aiOf), _cEx),
      _elv2Td(pk && pk.stopRate != null ? _elStopRateCell(pk.stopRate) : dash, _cEx),
      _elv2Td(pk && pk.h1win != null ? _elPctCell(pk.h1win) : dash, _cEx),
      _elv2Td(pk && pk.eRate != null ? _elPctCell(pk.eRate) : dash, _cEx),
      _elv2Td((pk && pk.scN != null ? pk.scN : 0) + "件", _cEx),
      _elv2Td(_elSimPnlCell(simBase), _cEx)));
    // 推奨追加α（└サブ行・基本αに足した時の損切り率〜想定損益も並べる）2026-06-30。母数は追加α〇プール＝基本行(×・未選択)とは別母集団。
    if (add) {
      var _dadd = { borderTop: "1px dashed #FDBA74" };
      rows.push(React.createElement("tr", { key: "a" + i },
        _elv2Td(React.createElement("span", { style: { fontSize: 10, color: "#9A3412", fontWeight: 700 } }, "└ 応用α"), Object.assign({ textAlign: "left", paddingLeft: 14 }, _dadd)),
        _elv2Td(React.createElement("span", { style: { whiteSpace: "nowrap" } },
          React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: "#9A3412" } }, add.alpha + "円"),
          (add.alpha2 != null) ? React.createElement("span", { style: { fontSize: 11, color: "#94A3B8", marginLeft: 4 } }, "（次点：" + add.alpha2 + "円）") : null), _dadd),
        _elv2Td(dash, _dadd),
        _elv2Td(add.stopRate != null ? _elStopRateCell(add.stopRate) : dash, _dadd),
        _elv2Td(add.takeRate != null ? _elPctCell(add.takeRate) : dash, _dadd),
        _elv2Td(add.eRate != null ? _elPctCell(add.eRate) : dash, _dadd),
        _elv2Td((add.decided != null ? add.decided : 0) + "件", _dadd),
        _elv2Td(add.avgH2 != null ? React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: _elPnlColor(add.avgH2) } }, "1件" + _elPnlFmt(Math.round(add.avgH2))) : dash, _dadd)));
    }
    // 次点（基本α・追加αとも）は主行にインライン「（次点：X円）」で併記＝専用の└次点行は廃止 2026-07-01。次点の個別成績列は非表示（主のαの成績のみ）。
  });
  return _elv2Table(["期間", "推奨基本α", "推奨損切り", "損切り率", "H1勝率", "到達率", "有効件数", "想定損益(1日/1件)"], rows);
}
// 推奨追加α値の期間別表（母数＝追加α〇の記録だけ＝基本α表とは別プール）2026-06-24→24g。各期間で「基本α＋推奨追加α」を〇記録に当てた 損切り率/H1勝率/到達率/件数/想定損益。
// 推奨追加α＝_elBaseAlphaA().add（基本αに足して損切りを避けH1黒字にできる最小加算＝想定損益はプラス・改善無しは「推奨無し」）。次点は点線区切りで1行追加。〇記録の無い期間は—。
function _elAddAlphaPeriodTableV2(recs, aiOf, refDate, includeToday) {
  var W = _elPeriodWindows(recs, refDate, includeToday);
  if (!W.hasAny) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var dash = React.createElement("span", { style: { color: "#bbb" } }, "—");
  var rows = [];
  W.periods.forEach(function(pd, i) {
    var addPool = (pd.recs || []).filter(function(r) { return r && _elSpecialUsed(r.signal) && !_elHasNumReason(r.signal); });   // 数値根拠(底抜け前足浮き)を母数から除外 2026-06-24i
    var A = _elBaseAlphaA(pd.recs, aiOf);
    var pk = A ? A.pick : null;
    var add = A ? A.add : null;
    var noPool = !addPool.length;
    var _has = !!(add && add.status !== "none");
    var _zero = !!(add && add.zeroBest);
    var _na = !!(add && add.status === "na");
    var addCell;
    if (noPool) addCell = React.createElement("span", { style: { fontSize: 9, color: "#bbb" } }, "〇記録なし");
    else if (_has) addCell = React.createElement("div", { style: { whiteSpace: "nowrap", lineHeight: 1.15 } },
      React.createElement("span", { style: { fontWeight: 800, fontSize: 13, color: _na ? "#B45309" : (_zero ? "#64748B" : "#9A3412") } }, "+" + add.add + "円" + (_zero ? "（足さない）" : "")),
      _na ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 3, fontWeight: 700 } }, "参考") : null,
      (add.add2 != null) ? React.createElement("span", { style: { fontSize: 11, color: "#94A3B8", marginLeft: 4 } }, "（次点：+" + add.add2 + "円）") : React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", marginLeft: 4 } }, "（次点なし）"));
    else addCell = React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#94A3B8", whiteSpace: "nowrap" } }, "推奨無し");
    var _pdiv = (i > 0) ? { borderTop: "2px solid #7DD3FC" } : null;   // 期間どうしの明確な区切り線 2026-06-24g
    var _mainBg = pd.main ? { background: "#EFF6FF" } : null;   // おすすめ窓（直近50件）の行ハイライト 2026-06-27
    var _cEx = (_pdiv || _mainBg) ? Object.assign({}, _pdiv || {}, _mainBg || {}) : null;
    // 2026-07-13: 統計列は新pick（日付別・手じまい基準）の同梱値をそのまま表示＝固定合計αの再評価(_elBaseAlphaEval/_elSimPnlByDay)は廃止。
    rows.push(React.createElement("tr", { key: "m" + i },
      _elv2Td(_elPeriodLabelNode(pd), Object.assign({ fontWeight: 700, color: "#9A3412", textAlign: "left", paddingLeft: 8 }, _pdiv || {}, _mainBg || {})),
      _elv2Td(addCell, _cEx),
      _elv2Td((_has && add.stopRate != null) ? _elStopRateCell(add.stopRate) : dash, _cEx),
      _elv2Td((_has && add.takeRate != null) ? _elPctCell(add.takeRate) : dash, _cEx),
      _elv2Td((_has && add.eRate != null) ? _elPctCell(add.eRate) : dash, _cEx),
      _elv2Td(noPool ? dash : ((_has ? (add.decided || 0) : 0) + "件"), _cEx),
      _elv2Td((_has && add.avgH2 != null) ? React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("b", { style: { color: _elPnlColor(add.avgH2) } }, _elPnlFmt(Math.round(add.avgH2))), React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8" } }, "Σ" + (add.h2Sum != null ? _elPnlFmt(Math.round(add.h2Sum)) : "—"))) : dash, _cEx)));
    // 次点は主行にインライン「（次点：+X円）」で併記＝専用の└次点行は廃止 2026-07-01。次点の個別成績列は非表示。
  });
  return _elv2Table(["期間", "推奨追加α", "損切り率(最終)", "利確率(最終)", "到達率", "E成立", "最終損益(平均/Σ)"], rows);
}

// 銘柄ごとの「α 推奨α値（{stock}・期間別）」ブロック（見出し＋説明＋期間別表_elBaseAlphaPeriodTableV2＝基本αに追加αの└サブ行も内包）。ChartSection(app-02)と取引テーブルの本日損益データ(app-04)で共用＝同じ見た目に統一 2026-06-24（2026-07-01 追加α独立テーブルを廃し基本α表へ統合・見出しを推奨α値に改称）。
// data・stock・refDate(基準日=本日行は当日・他は前日まで)。recsは内部で全記録(_elCollectAllSignals→stock絞り)を集計。
function _elBaseAlphaPeriodBlockV2(data, stock, refDate, save) {
  var recs = _elStockRecsBefore(data, stock, refDate);   // 母数＝前日まで全期間（当日以降は含めない）＝上段_ElDayAlphaPair/フォーム/EPナビ/取引ボードと同一（2026-07-14 _elStockRecsBefore共通化）
  var aiOf = function(r) { return _elAlphaInfo(r, data); };
  return React.createElement("div", { style: { marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "α 推奨α値（" + stock + "）"),
    (save && typeof _ElDayAlphaPair === "function") ? React.createElement("div", { style: { marginBottom: 6 } }, React.createElement(_ElDayAlphaPair, { data: data, save: save, date: refDate, stock: stock })) : null,   // 本日の採用α値（基本α+応用α）＝見出し直下 2026-07-13 task3
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "この銘柄の記録を期間別（本日/直近25件/50件/100件/全期間）に集計。本日＝" + refDate + "当日の記録、それ以外は前日まで（当日を含めない）。各期間で「到達率" + _EL_ANA_REACH_DEF + "%以上・損切り率(手じまい)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "未満・黒字」を満たすαの中で平均最終損益（手じまい・1件あたり）が最大のα（該当なしは到達率" + _EL_ANA_REACH_FLOOR2 + "%へ緩和して参考）。基本αは応用α〇・浮き足〇・RN〇以外（応用なし）が母数。想定損益＝推奨基本αをこの母数に当てたH1損益の『1営業日あたり平均／期間累計（営業日数）』＝記録の無い日・ノーシグナル日（エントリー成立なし）は除外。「推奨損切り」＝実現H1損益をほぼ維持できる範囲で最小（タイト）の損切り値（10〜30円・応用α〇も含む全記録が母数。基本αとは別軸の損切り最適化）。「応用α」＝応用α〇の記録だけを母数に、応用局面で採用する独立α値（0〜20円）を手じまい基準で評価した推奨（★＝到達率" + _EL_ANA_REACH_DEF + "%・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立条件で平均最終損益最大）。次点（2番目の候補）は基本α・応用αとも各行にインライン「（次点：X円）」で併記＝専用行は無し。"),
    React.createElement(_ElRecoAlphaDetail, { recs: recs, aiOf: aiOf, holiSet: _buildHolidayDateSet((data || {}).trades, ((data || {}).custom || {}).eventCategories) }));   // 2026-07-13 期間別表→取引/記録帳と同じ基本↔応用トグル付き総当たり詳細表(常時展開)。期間別は_ElRecoAlphaDetail内の「直近参考」サブ行で残す。
}
// DayView「チャート」タブで早見表の下に出す推奨αブロック（2026-06-24）。各銘柄テーブル(ChartSection)の_elBaseAlphaPeriodBlockV2と同等に充実＝説明文＋本日行付き期間表(_elBaseAlphaPeriodTableV2＝基本αに追加αの└サブ行も内包)。さらに「今日の推奨◯円」の大見出し(headNode)を併載＝いいとこ取り 2026-06-24c（2026-07-01 追加α独立テーブル(_elAddAlphaPeriodTableV2)を廃し基本α表へ統合・最上位見出しを🎯推奨α値に改称）。
// 見出し＝直近50件（データ不足なら100件→全期間にフォールバック）の推奨基本α＋追加α。本日のみ記録の銘柄でも本日行を出すためガードは「前日まで or 本日」のどちらかにデータがあれば表示。
// recs=銘柄の全記録(_elCollectAllSignals→stock絞り)・aiOf(r)→{alpha,cutLine}・refDate=基準日(当日除外=r.date<refDate)。履歴ゼロはnull。
function _elBaseAlphaDayBlockV2(recs, aiOf, refDate) {
  var all = (recs || []).filter(function(r) { return r && r.date && r.date < refDate && _epIsV2(r.signal) && _elInclData(r.signal); });   // 分析母数（データ算入）2026-07-22f
  var _todayN = (recs || []).filter(function(r) { return r && r.date === refDate && _epIsV2(r.signal) && _elInclData(r.signal); }).length;
  if (!all.length && !_todayN) return null;   // 前日まで・本日のどちらにもデータが無ければ非表示
  // 見出しの窓は件数ベース（直近50件→100件→全期間の順でデータがある最初の窓）。下の期間表(_elPeriodWindows)と方式統一 2026-06-26。旧: 直近1か月→3か月のカレンダー窓。
  var _byDate = all.slice().sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
  var _lastN = function(n) { return _byDate.length > n ? _byDate.slice(_byDate.length - n) : _byDate.slice(); };
  var cand = [
    { label: "直近" + _EL_PERIOD_COUNTS[1] + "件", recs: _lastN(_EL_PERIOD_COUNTS[1]) },
    { label: "直近" + _EL_PERIOD_COUNTS[2] + "件", recs: _lastN(_EL_PERIOD_COUNTS[2]) },
    { label: "全期間", recs: all }
  ];
  var head = null;
  for (var i = 0; i < cand.length; i++) { var A = _elBaseAlphaA(cand[i].recs, aiOf); if (A && A.pick && A.pick.alpha != null) { head = { A: A, label: cand[i].label, recs: cand[i].recs }; break; } }
  var _pct = function(v) { return v != null ? Math.round(v * 100) + "%" : "—"; };
  var headNode;
  if (!head) headNode = React.createElement("div", { style: { fontSize: 12, color: "#94A3B8", fontWeight: 600 } }, "推奨基本α：データ不足");
  else {
    var pk = head.A.pick, add = head.A.add, na = pk.status === "na";
    var hCut = _elCutPick(head.recs, aiOf);   // 推奨損切り値（headと同じ窓・母数）2026-06-29
    headNode = React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 12, color: "#0369A1", fontWeight: 700 } }, "今日の推奨"),
      React.createElement("span", { style: { fontSize: 22, fontWeight: 800, color: na ? "#B45309" : "#0369A1", lineHeight: 1 } }, pk.alpha + "円"),
      React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: na ? "#B45309" : "#0369A1" } }, pk.alpha2 != null ? "（次点：" + pk.alpha2 + "円）" : "（次点なし）"),
      na ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", fontWeight: 700 } }, "参考") : null,
      (add && add.alpha != null && add.status !== "none") ? React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } }, React.createElement("span", { style: { fontSize: 11, color: "#9A3412", fontWeight: 700 } }, "応用α " + add.alpha + "円"), _elReco2Node(add.alpha2 != null ? (add.alpha2 + "円") : null, 11, "#9A3412")) : null,
      (hCut && hCut.cut != null && hCut.status !== "none") ? React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: hCut.status === "na" ? "#B45309" : "#C0392B" } }, "推奨損切り" + hCut.cut + "円" + (hCut.status === "na" ? "（参考）" : "")) : null,
      React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, head.label + "ベース・損切(最終)" + _pct(pk.stopRate) + " 利確" + _pct(pk.takeRate) + " E成立" + (pk.decided || 0) + "件"));
  }
  return React.createElement("div", { style: { marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
    React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#0369A1", marginBottom: 6 } }, "🎯 推奨α値（" + refDate + "）"),
    headNode,
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginTop: 8, marginBottom: 6 } }, "この銘柄の記録を期間別（本日/直近25件/50件/100件/全期間）に集計。本日＝" + refDate + "当日の記録、それ以外は前日まで（当日を含めない）。各期間で「到達率" + _EL_ANA_REACH_DEF + "%以上・損切り率(手じまい)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "未満・黒字」を満たすαの中で平均最終損益（手じまい・1件あたり）が最大のα（該当なしは到達率" + _EL_ANA_REACH_FLOOR2 + "%へ緩和して参考）。基本αは応用α〇・浮き足〇・RN〇以外（応用なし）が母数。想定損益＝推奨基本αをこの母数に当てたH1損益の『1営業日あたり平均／期間累計（営業日数）』＝記録の無い日・ノーシグナル日（エントリー成立なし）は除外。「推奨損切り」＝実現H1損益をほぼ維持できる範囲で最小（タイト）の損切り値（10〜30円・応用α〇も含む全記録が母数。基本αとは別軸の損切り最適化）。「応用α」＝応用α〇の記録だけを母数に、応用局面で採用する独立α値（0〜20円）を手じまい基準で評価した推奨（★＝到達率" + _EL_ANA_REACH_DEF + "%・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立条件で平均最終損益最大）。次点（2番目の候補）は基本α・応用αとも各行にインライン「（次点：X円）」で併記＝専用行は無し。"),
    _elBaseAlphaPeriodTableV2(recs, aiOf, refDate, true));
}

// 前日まで(refDate未満)にv2かつ算入のエントリー記録がある銘柄の一覧。orderHint(主要銘柄の優先順)→件数多い順→名前順でソート 2026-06-25。
// 簡略版「本日の推奨基本α値」ボードで、本日エントリーが無い時のフォールバック銘柄（＝よく取引する＝前日までに記録のある銘柄）を出すために使う。
function _elStocksWithV2Before(data, refDate, orderHint) {
  var seen = {};
  _elCollectAllSignals(data).forEach(function(r) {
    if (r && r.stock && r.date && r.date < refDate && _epIsV2(r.signal) && _elInclData(r.signal)) seen[r.stock] = (seen[r.stock] || 0) + 1;   // 分析母数（データ算入）2026-07-22f
  });
  var list = []; for (var k in seen) { if (seen.hasOwnProperty(k)) list.push(k); }
  var ord = orderHint || [];
  list.sort(function(a, b) {
    var ia = ord.indexOf(a), ib = ord.indexOf(b);
    if (ia !== -1 || ib !== -1) { if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; }
    return (seen[b] - seen[a]) || (a < b ? -1 : a > b ? 1 : 0);
  });
  return list;
}
// 簡略版「本日の推奨基本α値」ボード（取引タブ・本日の総括の直前）2026-06-25。各銘柄の前日までの移動窓（直近25件/50件/100件/全期間）で
// 推奨基本α・推奨応用α（いずれも再推奨＋次点）を出す。前日まで全期間をメイン（大きく・2026-07-13ユーザー要望＝詳細データ表と同母数）、直近25/50/100件はサブ行（小さく・参考）。
// 指標（損切り率/勝率/想定損益）は出さずα値だけのシンプル表示＝詳細は各銘柄テーブル(ChartSection)の期間別表(_elBaseAlphaPeriodBlockV2)で（取引タブの重複フル版は2026-06-26削除）。
// data・stocks(本日エントリーした銘柄=_pbStks)・refDate(基準日=本日。各窓は当日を含めない前日まで=_elPeriodWindows(...,false))。
// 本日の推奨基本α値ボードの銘柄カード（2026-07-13）: 簡略ボード（body）＋「▼この銘柄の詳細データ表」トグルで記録帳と同じ_elBaseAlphaDetailV2をインライン展開。母数＝メイン直近50件（前日まで）＝ボードの推奨基本αと同一なので★が一致。
function _ElBaseAlphaBoardCard(_p) {
  var _u = useState(false), open = _u[0], setOpen = _u[1];
  return React.createElement("div", { style: { background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8, padding: "8px 10px", marginBottom: 8 } },
    _p.body,
    React.createElement("button", { type: "button", onClick: function() { setOpen(function(o) { return !o; }); }, style: { marginTop: 6, fontSize: 10, fontWeight: 700, color: "#0369A1", background: "#fff", border: "1px solid #93C5FD", borderRadius: 5, padding: "3px 9px", cursor: "pointer", minHeight: IS_TOUCH ? 28 : 22 } }, open ? "▲ 詳細データ表を閉じる" : "▼ この銘柄の詳細データ表（記録帳と同じ・前日まで全期間）"),
    open ? React.createElement("div", { style: { marginTop: 6, paddingTop: 6, borderTop: "1px dashed #93C5FD", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, React.createElement(_ElRecoAlphaDetail, { recs: _p.recs, aiOf: _p.aiOf, holiSet: _p.holiSet })) : null);
}
// 推奨α詳細（基本α↔応用αトグル＋総当たり詳細表＋期間別「直近参考」サブ行）2026-07-13 ユーザー要望。銘柄別記録(_elBaseAlphaPeriodBlockV2)と取引ボード(_ElBaseAlphaBoardCard)で共用＝両箇所に同じトグル。詳細表の母数＝渡されたrecs（前日まで全期間）。期間別(25/50/100件)は表を差し替えず「直近参考」1行で残す（記録フォームの直近期間別参考と同パターン・値=各窓の_elBaseAlphaA pick/add）。
function _ElRecoAlphaDetail(_p) {
  var recs = _p.recs, aiOf = _p.aiOf, holiSet = _p.holiSet;
  var _k = useState("base"), kind = _k[0], setKind = _k[1];
  var _byDate = (recs || []).filter(function(r) { return r && r.date && _epIsV2(r.signal) && _elInclData(r.signal); }).sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });   // 分析母数（データ算入）2026-07-22f
  var _lastN = function(n) { return _byDate.length > n ? _byDate.slice(_byDate.length - n) : _byDate.slice(); };
  var _winStr = function(n) { var A = _byDate.length ? _elBaseAlphaA(_lastN(n), aiOf) : null; if (!A) return "—"; if (kind === "special") { return (A.add && A.add.alpha != null) ? (A.add.alpha + "円") : "—"; } return (A.pick && A.pick.alpha != null) ? (A.pick.alpha + "円" + (A.pick.status === "ok" ? "" : "（仮）")) : "—"; };
  var _pill = function(kk, lbl, col) {
    var on = kind === kk;
    return React.createElement("button", { key: kk, type: "button", onClick: function() { setKind(kk); },
      style: { padding: "3px 14px", fontSize: 12, fontWeight: 800, borderRadius: 7, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? col : "#8a8378", boxShadow: on ? "0 1px 3px rgba(0,0,0,.12)" : "none" } }, lbl);
  };
  return React.createElement("div", null,
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" } },
      React.createElement("span", { style: { display: "inline-flex", background: "#E2DED6", borderRadius: 9, padding: 3, gap: 3 } },
        _pill("base", "基本α", "#0369A1"), _pill("special", "応用α", "#9A3412")),
      React.createElement("span", { style: { fontSize: 9.5, color: "#94A3B8" } }, "直近参考　" + _EL_PERIOD_COUNTS[0] + "件:" + _winStr(_EL_PERIOD_COUNTS[0]) + "　" + _EL_PERIOD_COUNTS[1] + "件:" + _winStr(_EL_PERIOD_COUNTS[1]) + "　" + _EL_PERIOD_COUNTS[2] + "件:" + _winStr(_EL_PERIOD_COUNTS[2]))),
    kind === "special" ? _elTotalAlphaSectionV2(recs, aiOf, holiSet) : _elBaseAlphaDetailV2(recs, aiOf, holiSet));
}
function _elBaseAlphaSimpleBoardV2(data, stocks, refDate, save) {
  var aiOf = function(r) { return _elAlphaInfo(r, data); };
  var allSig = _elCollectAllSignals(data);
  var holiSet = _buildHolidayDateSet(data.trades, (data.custom || {}).eventCategories);   // 詳細表の頻度列用 2026-07-13
  // 推奨基本αノード（big=メイン直近50件／小=サブ）。再推奨＋次点。na(件数不足)は橙＋「参考」。
  var _baseNode = function(pk, big) {
    if (!pk || pk.alpha == null) return React.createElement("span", { style: { color: "#94A3B8", fontSize: big ? 13 : 10, fontWeight: 700 } }, "データ不足");
    var na = pk.status === "na", col = na ? "#B45309" : "#0369A1";
    if (big) return React.createElement("div", { style: { lineHeight: 1.12 } },
      React.createElement("div", { style: { whiteSpace: "nowrap" } },
        React.createElement("span", { style: { fontWeight: 800, fontSize: 20, color: col } }, pk.alpha + "円"),
        na ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", fontWeight: 700, marginLeft: 3 } }, "参考") : null),
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: pk.alpha2 != null ? col : "#94A3B8", marginTop: 2 } }, pk.alpha2 != null ? ("次点 " + pk.alpha2 + "円") : "次点なし"));
    return React.createElement("span", { style: { whiteSpace: "nowrap" } },
      React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: col } }, pk.alpha + "円"),
      React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: pk.alpha2 != null ? col : "#94A3B8", marginLeft: 3 } }, pk.alpha2 != null ? ("(次" + pk.alpha2 + ")") : "(次点なし)"),
      na ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", fontWeight: 700, marginLeft: 3 } }, "参考") : null);
  };
  // 推奨追加αノード（big=メイン／小=サブ）。改善なしは「推奨無し」、母数なし/不明は「—」。メインは加算＋次点（次点は（次点：+X円）でインライン）、サブは加算のみ簡潔。合計（計）表記は廃止 2026-07-01。
  var _addNode = function(add, big) {
    if (!add || add.alpha == null) return React.createElement("span", { style: { color: "#94A3B8", fontSize: big ? 13 : 10, fontWeight: 700 } }, "推奨無し");
    if (!big) return React.createElement("span", { style: { whiteSpace: "nowrap" } }, React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: "#9A3412" } }, add.alpha + "円"));
    return React.createElement("div", { style: { lineHeight: 1.12 } },
      React.createElement("div", { style: { whiteSpace: "nowrap" } },
        React.createElement("span", { style: { fontWeight: 800, fontSize: 20, color: "#9A3412" } }, add.alpha + "円")),
      (add.alpha2 != null) ? React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#94A3B8", marginTop: 2 } }, "（次点：" + add.alpha2 + "円）") : null);
  };
  // 推奨損切りノード（big=メイン直近50件／小=サブ）。値のみ簡潔・na(件数フロア未満)は橙＋参考。損切り＝赤系で基本α(青)と区別 2026-06-29。
  var _cutNode = function(p, big) {
    if (!p || p.cut == null || p.status === "none") return React.createElement("span", { style: { color: "#94A3B8", fontSize: big ? 13 : 10, fontWeight: 700 } }, "—");
    var na = p.status === "na";
    if (big) return React.createElement("div", { style: { lineHeight: 1.12 } },
      React.createElement("div", { style: { whiteSpace: "nowrap" } },
        React.createElement("span", { style: { fontWeight: 800, fontSize: 20, color: na ? "#B45309" : "#C0392B" } }, p.cut + "円")),
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#B45309", marginTop: 2 } }, na ? "参考" : " "));
    return React.createElement("span", { style: { whiteSpace: "nowrap" } },
      React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: na ? "#B45309" : "#C0392B" } }, p.cut + "円"),
      na ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", fontWeight: 700, marginLeft: 3 } }, "参考") : null);
  };
  // 本日の記録との乖離用 2026-06-25: 採用基本α(_baseOf)・乖離ノード(_devNode=実際−推奨α・+赤=深い/−緑=浅い/0グレー)。
  var _num = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
  var _baseOf = function(s) { return _elBaseLevelAlpha(s); };   // base-levelα＝応用α採用時は specialAlpha／通常は baseAlphaVal（2026-07-13 応用α化・逆算_baseOf撤去）
  var _devNode = function(actual, ref) {
    if (actual == null || ref == null) return React.createElement("span", { style: { color: "#cbd5e1" } }, "—");
    var d = actual - ref, col = d > 0 ? "#C0392B" : d < 0 ? "#1E8449" : "#94A3B8", lbl = d < 0 ? "未達" : "到達";
    return React.createElement("span", { style: { fontWeight: 700, color: col } }, (d > 0 ? "+" : "") + d + " " + lbl);
  };
  var cards = (stocks || []).map(function(stock, si) {
    var recs = allSig.filter(function(r) { return r.stock === stock; });
    var W = _elPeriodWindows(recs, refDate, false);   // [直近25件,直近50件,直近100件,全期間]・前日まで（当日除外）
    var As = W.periods.map(function(pd) { return _elBaseAlphaA(pd.recs, aiOf); });
    var mainA = As[3];   // 前日まで全期間＝メイン（2026-07-13 ユーザー要望・詳細データ表/EPナビ/記録フォームと同母数。旧＝直近50件）
    var hasAny = As.some(function(A) { return A && A.pick && A.pick.alpha != null; });
    var _lbl = function(t, col) { return React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: col, marginBottom: 2 } }, t); };
    var mainBlock;
    if (mainA && mainA.pick && mainA.pick.alpha != null) {
      mainBlock = React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 } },
        React.createElement("div", { style: { minWidth: 0 } }, _lbl("推奨基本α", "#0369A1"), _baseNode(mainA.pick, true)),
        React.createElement("div", { style: { minWidth: 0 } }, _lbl("推奨応用α", "#9A3412"), _addNode(mainA.add, true)),
        React.createElement("div", { style: { minWidth: 0 } }, _lbl("推奨損切り", "#C0392B"), _cutNode(_elCutPick(W.periods[3].recs, aiOf), true)));
    } else {
      mainBlock = React.createElement("div", { style: { fontSize: 12, color: "#94A3B8", fontWeight: 700, padding: "2px 0" } }, hasAny ? "前日まで全期間：データ不足（下のサブ参照）" : "推奨基本αのデータがまだありません");
    }
    var subDefs = [{ i: 0, label: "直近25件" }, { i: 1, label: "直近50件" }, { i: 2, label: "直近100件" }];
    var subRows = subDefs.map(function(sd, k) {
      var A = As[sd.i];
      return React.createElement("div", { key: k, style: { display: "flex", alignItems: "baseline", gap: 5, fontSize: 10, lineHeight: 1.6, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontWeight: 700, color: "#64748B", minWidth: 40 } }, sd.label),
        React.createElement("span", { style: { color: "#94A3B8" } }, "基"), _baseNode(A ? A.pick : null, false),
        React.createElement("span", { style: { color: "#94A3B8", marginLeft: 4 } }, "特"), _addNode(A ? A.add : null, false),
        React.createElement("span", { style: { color: "#94A3B8", marginLeft: 4 } }, "切"), _cutNode(_elCutPick(W.periods[sd.i].recs, aiOf), false));
    });
    // 本日の記録との乖離（記録1件ごと・追加α〇/×で到達の基準を切替 2026-06-27）。推奨基本α=メイン直近50件を優先・無ければ100件→全期間→25件。追加α〇は基本α+追加α分まで伸ばす前提なので到達OSを「推奨基本α+推奨追加α」と比較（×・未選択は推奨基本α）＝母数で〇を除外している推奨基本αとの整合をとる。推奨基本αと推奨追加αは同じ件数窓から取る。
    var refAObj = (function() { var order = [3, 2, 1, 0]; for (var oi = 0; oi < order.length; oi++) { var A = As[order[oi]]; if (A && A.pick && A.pick.alpha != null) return A; } return null; })();   // 前日まで全期間→100件→50件→25件（2026-07-13 メインを全期間化に合わせ優先順を変更）
    var refBase = refAObj ? refAObj.pick.alpha : null;   // 推奨基本α（通常＝応用なしの到達基準）
    var refSpecial = (refAObj && refAObj.add && refAObj.add.alpha != null) ? refAObj.add.alpha : null;   // 推奨応用α（応用〇の到達基準・独立値）
    var dayRecs = recs.filter(function(r) { return r && r.date === refDate && r.signal && _epIsV2(r.signal); });
    dayRecs.sort(function(a, b) { var ta = a.signal.time || "", tb = b.signal.time || ""; return ta < tb ? -1 : ta > tb ? 1 : 0; });
    var _dvTh = function(t) { return React.createElement("th", { style: { fontSize: 9, fontWeight: 700, color: "#64748B", padding: "2px 4px", whiteSpace: "nowrap", textAlign: "center" } }, t); };
    var _dvTd = function(c, ex) { return React.createElement("td", { style: Object.assign({ fontSize: 10, padding: "2px 4px", textAlign: "center", whiteSpace: "nowrap", borderTop: "1px solid #E0F2FE", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
    var _regBadge = function(yes, uki) { var _t = (yes && uki) ? "浮＋応用" : yes ? "応用α" : uki ? "浮き足〇" : "基本のみ"; var _bg = yes ? "#FEF3C7" : uki ? "#DCFCE7" : "#F1F5F9"; var _cl = yes ? "#9A3412" : uki ? "#166534" : "#64748B"; return React.createElement("span", { style: { padding: "1px 5px", fontSize: 9, fontWeight: 700, borderRadius: 4, whiteSpace: "nowrap", background: _bg, color: _cl } }, _t); };
    var _dvTdSpan = function(c, ex) { return React.createElement("td", { rowSpan: 2, style: Object.assign({ fontSize: 10, padding: "2px 4px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "middle", borderTop: "1px solid #E0F2FE", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
    var devRows = [];
    dayRecs.forEach(function(r, ri) {
      var s = r.signal, base = _baseOf(s), osMax = _elOsMaxAll(s);
      var yes = _elSpecialUsed(s);
      var uki = _elUkiAdd(s), rnv = _elRnAdd(s);   // 上乗せ＝浮き足＋RN（採用α＝base-levelα＋浮き＋RN）2026-07-13
      var isUki = _elUkiYes(s);
      var onTop = uki + rnv;
      var adoptTot = (base != null) ? (base + onTop) : null;
      var recoBaseLevel = isUki ? 0 : (yes ? (refSpecial != null ? refSpecial : refBase) : refBase);   // 浮き足〇＝土台α0（採用α＝浮き足加算＋RN）／応用〇＝推奨応用α／通常＝推奨基本α 2026-07-14g
      var recoTot = (recoBaseLevel != null) ? (recoBaseLevel + onTop) : null;
      var _top = ri > 0 ? { borderTop: "2px solid #7DD3FC" } : null;
      var _dash = { borderTop: "1px dashed #BAE6FD" };
      var _onTopSub = function() { return onTop > 0 ? React.createElement("div", { style: { fontSize: 8.5, color: "#16A34A", fontWeight: 700 } }, (uki > 0 ? "浮" + uki : "") + (rnv > 0 ? ((uki > 0 ? "+" : "") + "RN" + rnv) : "")) : null; };
      devRows.push(React.createElement("tr", { key: ri + "r" },
        _dvTdSpan(s.time || "—", Object.assign({ color: "#64748B", fontWeight: 700 }, _top || {})),
        _dvTdSpan(_regBadge(yes, isUki), _top || {}),
        _dvTd("現実", Object.assign({ color: "#64748B", fontWeight: 700 }, _top || {})),
        _dvTd(base != null ? (base + "円") : "—", _top || {}),
        _dvTd(onTop > 0 ? React.createElement("span", null, "+" + onTop + "円", _onTopSub()) : "—", Object.assign({ color: onTop > 0 ? "#9A3412" : "#cbd5e1" }, _top || {})),
        _dvTd(adoptTot != null ? (adoptTot + "円") : "—", Object.assign({ fontWeight: 700 }, _top || {})),
        _dvTdSpan(osMax != null ? (osMax + "円") : "—", Object.assign({ fontWeight: 700 }, _top || {})),
        _dvTd(_devNode(osMax, adoptTot), _top || {})));
      devRows.push(React.createElement("tr", { key: ri + "p" },
        _dvTd("推奨", Object.assign({ color: "#0369A1", fontWeight: 700 }, _dash)),
        _dvTd(recoBaseLevel != null ? (recoBaseLevel + "円") : "—", Object.assign({ color: "#0369A1" }, _dash)),
        _dvTd(onTop > 0 ? React.createElement("span", null, "+" + onTop + "円", _onTopSub()) : "—", Object.assign({ color: onTop > 0 ? "#0369A1" : "#cbd5e1" }, _dash)),
        _dvTd(recoTot != null ? (recoTot + "円") : "—", Object.assign({ fontWeight: 700, color: "#0369A1" }, _dash)),
        _dvTd(_devNode(osMax, recoTot), _dash)));
    });
    var devBlock = dayRecs.length ? React.createElement("div", { style: { marginTop: 6, paddingTop: 5, borderTop: "1px dashed #93C5FD" } },
      React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📊 本日の記録との乖離（現実＝採用したα／推奨＝推奨どおりのα。乖離＝到達最高OSと採用αの差・プラス＝到達／マイナス＝未達。推奨基本α " + (refBase != null ? refBase + "円" : "—") + "／応用〇は推奨応用α " + (refSpecial != null ? (refSpecial + "円") : "—") + "・浮き足/RN〇は現実/推奨とも＋その記録の上乗せ）"),
      React.createElement(_HScrollBox, null,
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%" } },
          React.createElement("thead", null, React.createElement("tr", null, _dvTh("時刻"), _dvTh("種別"), _dvTh(""), _dvTh("基本/応用α"), _dvTh("上乗せ"), _dvTh("採用α"), _dvTh("到達最高OS"), _dvTh("乖離"))),
          React.createElement("tbody", null, devRows)))) : null;
    var _body = React.createElement("div", null,
      React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 5, paddingBottom: 4, borderBottom: "1px solid #BAE6FD" } }, stock,
        React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#0369A1", marginLeft: 6 } }, "メイン＝前日まで全期間")),
      (save && typeof _ElDayAlphaPair === "function") ? React.createElement("div", { style: { marginBottom: 6 } }, React.createElement(_ElDayAlphaPair, { data: data, save: save, date: refDate, stock: stock })) : null,   // 本日の採用α値（基本α+応用α）2026-07-13 task3
      mainBlock,
      React.createElement("div", { style: { marginTop: 6, paddingTop: 5, borderTop: "1px dashed #93C5FD" } },
        React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#94A3B8", marginBottom: 1 } }, "他期間（サブ）"),
        subRows),
      devBlock);
    return React.createElement(_ElBaseAlphaBoardCard, { key: si, stock: stock, recs: W.periods[3].recs, aiOf: aiOf, holiSet: holiSet, body: _body });
  });
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 8 } }, "前日までの記録で集計（当日は含めない）。前日まで全期間をメインに、直近25/50/100件はサブ参考（詳細データ表・EPナビ・記録フォームと同じ母数）。各値は再推奨（次点）。基本α＝応用なし・浮き足〇以外が母数、応用α＝応用〇記録（浮き足〇除く）だけが母数・基本αより大きくクランプ、推奨損切り＝実現H1損益をほぼ維持できる最小（タイト）の損切り値（15〜30円・応用α含む全記録が母数）。「📊本日の記録との乖離」は当日の記録1件ごとに、到達した最高OSが採用α（通常＝推奨基本α／応用〇＝推奨応用α／さらに浮き足・RN〇は＋その記録の上乗せ）からどれだけ離れたか（到達−採用α）。損切り率・勝率・想定損益などの詳細は銘柄別・期間別の詳細表を参照。"),
    cards);
}

// 各記録の理想の追加α（基本αに何円足すべきだったか）2026-06-24。base=基本α・cut=損切り値。add=0〜_EL_BASE_ADD_MAX(30)を総当たり：
//   winMin=損切り回避かつH1損益>0を満たす最小の追加α（無ければnull＝足しても勝てなかった／0＝足さず勝ち）。
//   fillMax=OS1〜3でEP到達を保てる最大の追加α（約定上限・base自体で未到達ならnull）。αを増やすほど高値≥αが難化＝EP到達は退化方向なので「約定の観点」は上限で表す。
function _elIdealAddForRec(s, base, cut) {
  if (base == null) return { winMin: null, fillMax: null };
  var winMin = null, fillMax = null;
  for (var add = 0; add <= _EL_BASE_ADD_MAX; add++) {
    var a = base + add;
    if (a > 50) break;
    var rr = _epResolve(s, a);
    var reached = !!(rr && rr.epIdx >= 0);
    if (reached) fillMax = add;
    if (reached && winMin == null) {
      var hd = _elDynHold(s, a, cut);
      var stop = _elPlanIsStop(s, a, cut) || _elHoldIsStop(s, a, cut);
      if (!stop && hd != null && hd > 0) winMin = add;
    }
  }
  return { winMin: winMin, fillMax: fillMax };
}
// ピアソン相関係数（pairs=[[x,y],...]）。n<2 or 分散0はnull。2026-06-24。
function _elCorr(pairs) {
  var n = pairs.length; if (n < 2) return null;
  var sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (var i = 0; i < n; i++) { var x = pairs[i][0], y = pairs[i][1]; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; }
  var cov = sxy - sx * sy / n, vx = sxx - sx * sx / n, vy = syy - sy * sy / n;
  if (vx <= 0 || vy <= 0) return null;
  return cov / Math.sqrt(vx * vy);
}
// 📐 追加α値の分析（記録帳のα値タブ・2026-06-24）。母数＝追加α〇明示の記録(_elSpecialUsed)。
// ①概況KPI ②効果検証(採用α=基本+追加 vs 基本αだけ の反実仮想＝足して正解だったか・2026-07-13から手じまい基準) ③実際に足した幅別の実績。
// ④根拠別成績・⑤根拠別明細は2026-07-13撤去（ユーザー承認）＝②追加αタブの根拠セレクタ＋日付別詳細データ表に役割を移譲。
// recs=スコープのv2記録(×/〇/未選択混在)・aiOf(r)→{alpha(採用=基本+追加),cutLine}・data。
function _elAddAlphaSectionV2(recs, aiOf, data) {
  var totalV2 = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclData(r.signal); });   // α分析（追加α/浮き足）＝分析母数（データ算入）2026-07-22f
  var pool = totalV2.filter(function(r) { return _elSpecialUsed(r.signal) && !_elUkiYes(r.signal); });   // 浮き足〇は応用α扱いにしない＝float-onlyなので追加α（応用α）分析の母数から除外 2026-07-14g
  if (!pool.length) return React.createElement("div", { style: { fontSize: 12, color: "#94A3B8", padding: "10px 0" } }, "追加α〇（要）を明示した記録がありません（このスコープ）。記録を開いて追加α欄で〇を選ぶと、ここに分析が出ます。");
  var _num = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
  var _baseOf = function(s) { var b = _num(s.baseAlphaVal); if (b == null) { var a = _num(s.alphaVal), ad = _num(s.addAlphaVal); b = (a != null) ? (a - (ad != null ? ad : 0) - _elUkiAdd(s) - _elRnAdd(s)) : null; } return b; };   // 逆算は浮き足/RNも控除（監査F9 2026-07-12・採用α=基本+浮+追+RNのため）
  var _addOf = function(s) { var v = _num(s.addAlphaVal); if (v == null) { var a = _num(s.alphaVal), b = _num(s.baseAlphaVal); v = (a != null && b != null) ? (a - b) : null; } return v; };
  var _enteredAt = function(s, a) { var rr = _epResolve(s, a); return !!(rr && rr.judge === "ok"); };
  var _h1At = function(s, a, cut) { if (a == null || !_enteredAt(s, a)) return 0; var h = _elDynHold(s, a, cut); return h == null ? 0 : h; };
  var _h2At = function(s, a, cut) { if (a == null || !_enteredAt(s, a)) return 0; var t = _elHold2TotParts(s, a, cut); return (t && t.main != null) ? t.main : 0; };   // 手じまい（最終損益・（）外）基準 2026-07-13
  var _stopAt = function(s, a, cut) { return _enteredAt(s, a) && (_elPlanIsStop(s, a, cut) || _elHoldIsStop(s, a, cut) || (_elHas2Data(s, a) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, cut))); };   // H2損切りも含む（手じまい基準）2026-07-13

  // 効果計算（採用α=基本+追加 vs 基本αだけ・手じまい基準 2026-07-13＝旧H1比較を置換。変数名h1A/h1Bは互換のため据え置き）
  var eff = [];
  pool.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), adopted = ai.alpha, cut = ai.cutLine, base = _baseOf(s);
    if (adopted == null || base == null || adopted <= base) return;
    var h1A = _h2At(s, adopted, cut), h1B = _h2At(s, base, cut);
    eff.push({ s: s, cut: cut, base: base, adopted: adopted, add: adopted - base, h1A: h1A, h1B: h1B, delta: h1A - h1B,
      stopBase: _stopAt(s, base, cut), stopAd: _stopAt(s, adopted, cut),
      reasons: (Array.isArray(s.addAlphaReasons) ? s.addAlphaReasons.filter(Boolean) : (s.addAlphaReason ? [s.addAlphaReason] : [])) });
  });

  // ① 概況KPI
  var addVals = pool.map(function(r) { return _addOf(r.signal); }).filter(function(v) { return v != null; });
  var poolOk = 0, poolNg = 0;
  pool.forEach(function(r) { var res = _elDynResult(r.signal, aiOf(r).alpha, aiOf(r).cutLine); if (res === "ok") poolOk++; else if (res === "ng") poolNg++; });
  var ss = _elStopStatsV2(pool, data);
  var ratio = totalV2.length ? Math.round(pool.length / totalV2.length * 100) : 0;
  var kpi = _elv2CardRow([
    _elv2Card("追加α〇 件数", pool.length + "件", "#9A3412", "全記録の" + ratio + "%"),
    _elv2Card("上乗せ幅", (addVals.length ? _elMedian(addVals) : "—") + "円", "#0369A1", "平均 " + (addVals.length ? _elMean(addVals) : "—") + "円"),
    _elv2Card("〇局面のE後勝率", (poolOk + poolNg) ? Math.round(poolOk / (poolOk + poolNg) * 100) + "%" : "—", null, poolOk + "勝" + poolNg + "敗"),
    _elv2Card("〇局面の損切り率", (ss && ss.rate != null) ? ss.rate + "%" : "—", (ss && ss.any > 0) ? "#1E8449" : "#bbb", (ss ? ss.any : 0) + "回")
  ]);

  // ② 効果検証（反実仮想）
  var effNode;
  if (!eff.length) effNode = React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "6px 0" } }, "基本α・採用αが揃った記録がありません（基本α値の保存が必要）。");
  else {
    var win = 0, lose = 0, sumDelta = 0, savedStop = 0;
    eff.forEach(function(e) { if (e.delta > 0) win++; else if (e.delta < 0) lose++; sumDelta += e.delta; if (e.stopBase && !e.stopAd) savedStop++; });
    var same = eff.length - win - lose;
    var avgDelta = Math.round(sumDelta / eff.length);
    var winPct = Math.round(win / eff.length * 100);
    effNode = React.createElement(React.Fragment, null,
      _elv2CardRow([
        _elv2Card("追加αが活きた率", winPct + "%", win >= lose ? "#1E8449" : "#B45309", win + "/" + eff.length + "件 改善"),
        _elv2Card("平均改善額(手じまい)", (avgDelta > 0 ? "+" : "") + avgDelta + "円", _elPnlColor(avgDelta), "計" + (sumDelta > 0 ? "+" : "") + Math.round(sumDelta).toLocaleString() + "円"),
        _elv2Card("内訳（活/同/裏）", win + "・" + same + "・" + lose, "#555", "活きた・同じ・裏目"),
        _elv2Card("損切り回避", savedStop + "件", savedStop > 0 ? "#1E8449" : "#bbb", "基本αなら損切り→回避")
      ]),
      _elInsightBoxV2([
        React.createElement("span", null, "追加αを足した記録のうち ", _elInsightEmV2(winPct + "%"), "（", _elInsightEmV2(win + "/" + eff.length + "件"), "）で実際に手じまい損益が改善し、平均 ", _elInsightEmV2((avgDelta > 0 ? "+" : "") + avgDelta + "円"), "（合計 ", _elInsightEmV2((sumDelta > 0 ? "+" : "") + Math.round(sumDelta).toLocaleString() + "円"), "）の効果。",
          same > 0 ? React.createElement("span", null, " ", _elInsightEmV2(same + "件"), "は足さなくても同じ。") : null,
          lose > 0 ? React.createElement("span", null, " ", _elInsightEmV2(lose + "件"), "は裏目（足さない方が良かった）。") : null,
          savedStop > 0 ? React.createElement("span", null, " うち ", _elInsightEmV2(savedStop + "件"), "は基本αなら損切りだったのを回避。") : null)
      ], { note: "各追加α〇記録で『実際の採用α（基本＋追加）の手じまい損益（最終損益・EP/H1/H2損切り込み）』と『基本αだけだった場合の手じまい損益』を、同じ値動き・同じ損切り値で比較（未達＝取引なし＝0円・2026-07-13にH1基準から手じまい基準へ変更）。差の合計＝追加αの判断が生んだ損益。" })
    );
  }

  // ③ 上乗せ幅別の効果＋推奨追加α
  var _A = _elBaseAlphaA(recs, aiOf);
  var recoAdd = (_A && _A.add && _A.add.improved) ? _A.add : null;
  var _recoZero = !!(_A && _A.add && _A.add.zeroBest);   // ★=+0円（足さない方が良い）2026-07-13
  var recoNode = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: recoAdd ? "#0369A1" : "#94A3B8" } },
    recoAdd ? React.createElement(React.Fragment, null, React.createElement("span", null, "推奨追加α ＝ ", React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, "＋" + recoAdd.add + "円")), _elReco2Node(recoAdd.add2 != null ? ("＋" + recoAdd.add2 + "円") : null, 16, "#0369A1"))
      : (_recoZero ? "推奨追加α ＝ ＋0円（足さない方が良い＝日付別評価で0円が最良）" : "推奨追加α：条件を満たす上乗せがありません（基本αで十分の傾向）"));
  var effNoNum = eff.filter(function(e) { return !_elHasNumReason(e.s); });   // 数値根拠(底抜け前足浮き)は上乗せ幅別/根拠別から除外＝floatNode専用・推奨追加α(_A.add)と母数一致 2026-06-24i
  var byAdd = {};
  effNoNum.forEach(function(e) { (byAdd[e.add] = byAdd[e.add] || []).push(e); });
  var addKeys = Object.keys(byAdd).map(Number).sort(function(a, b) { return a - b; });
  var addRows = addKeys.map(function(k) {
    var es = byAdd[k], w = 0, sd = 0; es.forEach(function(e) { if (e.delta > 0) w++; sd += e.delta; });
    return React.createElement("tr", { key: k },
      _elv2Td("＋" + k + "円", { fontWeight: 700, color: "#9A3412", textAlign: "left", paddingLeft: 8 }),
      _elv2Td(es.length + "件"),
      _elv2Td(_elPctCell(w / es.length)),
      _elv2Td(_elv2Avg(sd, es.length)));
  });
  var optNode = React.createElement(React.Fragment, null, recoNode,
    addRows.length ? _elv2Table(["上乗せ幅", "件数", "活きた率", "平均改善(手じまい)"], addRows) : React.createElement("div", { style: { fontSize: 11, color: "#aaa" } }, "上乗せ幅データなし"));

  var _miniH = function(t) { return React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "12px 0 2px" } }, t); };

  // ④根拠別成績・⑤根拠別明細は2026-07-13撤去（ユーザー承認）＝根拠の深掘りは②追加αタブの根拠セレクタ（全体/各根拠/根拠なし）＋日付別詳細データ表で行う。
  return React.createElement(React.Fragment, null,
    kpi,
    _miniH("🎯 足して正解だったか（効果検証・手じまい基準）"), effNode,
    _miniH("📊 実際に足した幅別の実績"), optNode);
}

// 浮き足加算α値（signal.ukiUsed/ukiVal＝旧「底抜け前足浮き」数値根拠の後継）の専用分析。2026-06-28にα値タブ(_elAddAlphaSectionV2)からシグナル別パネル(_groupPanel)へ移設→2026-07-03浮き足フィールドへ載せ替え。
// recs=そのシグナル(底抜け水準線OS)スコープのv2記録 / aiOf(r)→{alpha,cutLine} / data / secH=見出しヘルパー。浮き値（前足浮き値）入力前提なので固定の＋X円ではなく「浮き値の何%を加算すべきだったか」で分析（理想加算 winMin÷浮き値＝理想%）＋%別シミュで最適%を推奨＝現行ルール（50%＝半額・切捨て）の妥当性検証。
// 浮き足〇の記録が無ければ null（＝浮き足記録の無いシグナルのタブには何も出ない）。
function _elFloatReasonSectionV2(recs, aiOf, data, secH, basePick, recCtx) {
  var totalV2 = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclData(r.signal); });   // α分析（追加α/浮き足）＝分析母数（データ算入）2026-07-22f
  var _num = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
  // 基本α/追加α（残差）の導出は浮き足加算(_elUkiAdd)込みの合計αから引き算＝浮き足記録でbaseAlphaVal欠損でも正しい基本αになる 2026-07-03。
  var _baseOf = function(s) { return _elBaseLevelAlpha(s); };   // base-levelα（応用α化 2026-07-13・逆算撤去）
  var _addOf = function(s) { return 0; };   // 追加α増分は廃止（応用α化 2026-07-13）＝残差0
  var _enteredAt = function(s, a) { var rr = _epResolve(s, a); return !!(rr && rr.judge === "ok"); };
  var _h1At = function(s, a, cut) { if (a == null || !_enteredAt(s, a)) return 0; var h = _elDynHold(s, a, cut); return h == null ? 0 : h; };
  var _addFmt = function(v, suf) { return v == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#9A3412" : "#94A3B8" } }, "+" + v + "円" + (suf || "")); };
  var floatAll = totalV2.filter(function(r) { return _elUkiYes(r.signal); });   // 母数＝浮き足〇の記録（旧: 追加α〇＋数値根拠）2026-07-03
  if (!floatAll.length) return null;
  // 2026-07-18 浮き足加算率の基本/応用スコープ（recCtx.ukiSp）で母数を絞る＝採用αの浮基本/浮応用と分析を揃える。トグルは常に描画（片方0件でも切替可）。
  var _ukiSp = !!(recCtx && recCtx.ukiSp);
  var _ukiScopeTgl = (recCtx && recCtx.setUkiSp) ? React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", margin: "0 0 4px" } }, _ukiScopeToggle(_ukiSp, recCtx.setUkiSp)) : null;
  var floatRecs = floatAll.filter(function(r) { return _ukiSp ? _elUkiSpecialUsed(r.signal) : !_elUkiSpecialUsed(r.signal); });
  if (!floatRecs.length) return React.createElement(React.Fragment, null,
    secH("🔻 浮き足の記録（採用α・推奨α・OS・乖離の一覧）"),
    _ukiScopeTgl,
    React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "浮き足" + (_ukiSp ? "応用" : "基本") + "〇（浮き値入り）の記録がまだありません"));
  // 浮き足加算率スイープ 2026-07-12: 採用α（基本＋追加＋RN）は実績のまま浮き足加算だけをP=0〜100%(10刻み)で振り、最終損益(H2)で評価。全銘柄版(シグナル総合)と同じ_elUkiPctSweepに統一（旧「基本α＋浮き足%・ΣH1最大」から刷新）。母数=浮き値>0の浮き足〇記録。
  var _ukiPool = floatRecs.filter(function(r) { var f = _elUkiVal(r.signal); return f != null && f > 0; });
  var _ukiHoli = _buildHolidayDateSet(data.trades, (data.custom || {}).eventCategories);
  var _sweep = _ukiPool.length ? _elUkiPctSweep(_ukiPool, aiOf, _ukiHoli) : null;
  var simNode = _sweep ? React.createElement("div", { style: { marginTop: 8 } },
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "0 0 2px" } }, "📐 浮き足の何%を加算すると最適か（浮き足〇＝α＝浮き足加算＋RN・浮き足%だけ振り・最終損益で評価・★＝スコア最大＝現行の推奨%）"),
    _elUkiPctSweepNode(_sweep),
    _elUkiValBoardBlock(_ukiPool, aiOf, _ukiHoli)) : null;
  // ===== 2段テーブル（案B・2026-07-01刷新）: 1記録＝現実(採用したα)／推奨(推奨どおりのα)の上下2段。列＝日付(＋記録ボタン)/種別/基本α/追加α/合計α/OS/乖離度。 =====
  var recoBase = (basePick && basePick.alpha != null && basePick.status !== "none") ? basePick.alpha : null;   // 推奨基本α（シグナル単一値・_elBaseAlphaPick由来）
  var bestP = (_sweep && _sweep.best) ? _sweep.best.P : null;   // 推奨%（浮き足加算率スイープの最良%）。null=該当%なし
  var simRan = _ukiPool.length > 0;
  var _devNode = function(actual, ref) {   // 到達最高OS−採用合計α（＋到達＝赤/−未達＝緑/0グレー）
    if (actual == null || ref == null) return React.createElement("span", { style: { color: "#cbd5e1" } }, "—");
    var d = actual - ref, col = d > 0 ? "#C0392B" : d < 0 ? "#1E8449" : "#94A3B8", lbl = d < 0 ? "未達" : "到達";
    return React.createElement("span", { style: { fontWeight: 700, color: col } }, (d > 0 ? "+" : "") + d + " " + lbl);
  };
  var _fTh = function(t) { return React.createElement("th", { style: { fontSize: 10, fontWeight: 700, color: "#9A9186", padding: "4px 6px", whiteSpace: "nowrap", textAlign: "center", borderBottom: "1px solid #E4DFD7" } }, t); };
  var _fTd = function(c, ex) { return React.createElement("td", { style: Object.assign({ fontSize: 10.5, padding: "3px 6px", textAlign: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var _fTdSpan = function(c, ex) { return React.createElement("td", { rowSpan: 2, style: Object.assign({ fontSize: 10.5, padding: "3px 6px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "middle", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var devRows = [];
  floatRecs.slice().sort(function(x, y) { var dx = x.date || "", dy = y.date || ""; return dx < dy ? 1 : dx > dy ? -1 : 0; }).forEach(function(r, i) {
    var s = r.signal, ai = aiOf(r), cut = ai.cutLine, base = _baseOf(s);
    var _rAdd = _addOf(s);   // 残差の追加α（他根拠分・浮き足加算は含まない）2026-07-03
    var actAdd = _elUkiAdd(s) + ((_rAdd != null && _rAdd > 0) ? _rAdd : 0);   // 現実の加算合計＝浮き足加算（採用%切捨て）＋追加α
    var actualTot = (base != null) ? (base + actAdd) : (ai.alpha != null ? ai.alpha : null);
    var floatV = _elUkiVal(s);
    var osMax = _elOsMaxFiltered(s, actualTot != null ? actualTot : ai.alpha);   // OS1〜3の到達最高値（×で打ち切り＝実現分）
    var recoAdd = (bestP != null && floatV != null && floatV > 0) ? Math.floor(floatV * bestP / 100) : ((bestP == null && simRan) ? 0 : null);   // 推奨加算＝浮き値×推奨%（切捨て＝現行ルール整合）。%が黒字化せず→0（不要）／算出不能→null
    var recoTot = (recoBase != null && recoAdd != null) ? (recoBase + recoAdd) : null;
    // 乖離度＝到達最高OSと各段のαの差を2段それぞれに出す（現実行=OS−採用合計α／推奨行=OS−推奨合計α）。理想の追加α（不要/勝てず/+X円必要）は撤去 2026-07-01b。
    var dstr = (r.date || "").slice(5).replace("-", "/");
    var ek = "float_" + r.stock + "_" + (s.id || s.time || i);
    var on = !!(recCtx && recCtx.expKey === ek);
    var dateCell = React.createElement("div", null,
      React.createElement("div", { style: { fontWeight: 700, color: "#333" } }, dstr),
      recCtx ? React.createElement("button", { onClick: function() { recCtx.setExpKey(on ? null : ek); }, style: { marginTop: 3, fontSize: 9, padding: "1px 7px", border: "1px solid " + (on ? "#F97316" : "#ddd"), borderRadius: 4, background: on ? "#FFF7ED" : "#f5f4f0", color: on ? "#9A3412" : "#666", cursor: "pointer" } }, on ? "閉じる" : "記録") : null);
    var topB = i > 0 ? { borderTop: "2px solid #F5D0B5" } : null;
    var dashB = { borderTop: "1px dashed #F5D0B5" };
    var addRealNode = React.createElement("span", null,
      actAdd != null ? React.createElement("span", { style: { color: "#9A3412", fontWeight: 700 } }, "+" + actAdd + "円") : React.createElement("span", { style: { color: "#cbd5e1" } }, "—"),
      floatV != null ? React.createElement("div", { style: { fontSize: 8.5, color: "#aaa" } }, "浮き" + floatV + "円→+" + _elUkiAdd(s) + ((_rAdd != null && _rAdd > 0) ? "・追+" + _rAdd : "")) : null);
    devRows.push(React.createElement("tr", { key: ek + "_r" },
      _fTdSpan(dateCell, Object.assign({ textAlign: "left", paddingLeft: 8 }, topB || {})),
      _fTd("現実", Object.assign({ color: "#64748B", fontWeight: 700 }, topB || {})),
      _fTd(addRealNode, Object.assign({ fontWeight: 700 }, topB || {})),
      _fTdSpan(osMax != null ? (osMax + "円") : "—", Object.assign({ fontWeight: 700 }, topB || {})),
      _fTd(_devNode(osMax, actAdd), topB || {})));
    var recoAddNode = (recoAdd == null) ? React.createElement("span", { style: { color: "#cbd5e1" } }, "—") : recoAdd === 0 ? React.createElement("span", { style: { color: "#0369A1" } }, "+0円") : React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, "+" + recoAdd + "円");
    devRows.push(React.createElement("tr", { key: ek + "_p" },
      _fTd("推奨", Object.assign({ color: "#0369A1", fontWeight: 700 }, dashB)),
      _fTd(recoAddNode, Object.assign({ fontWeight: 700 }, dashB)),
      _fTd(_devNode(osMax, recoAdd), dashB)));
    if (on && recCtx) devRows.push(React.createElement("tr", { key: ek + "_c" },
      React.createElement("td", { colSpan: 5, style: { padding: "4px 8px 8px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
        React.createElement(EntryLogCard, { record: r, data: data, onEdit: recCtx.onEdit, onGoDate: recCtx.onGoDate }))));
  });
  var _floatTable = React.createElement(_HScrollBox, { style: { marginTop: 6 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%" } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } }, _fTh("日付"), _fTh("種別"), _fTh("α（浮き足加算）"), _fTh("OS"), _fTh("乖離度"))),
      React.createElement("tbody", null, devRows)));
  return React.createElement(React.Fragment, null,
    secH("🔻 浮き足の記録（採用α・推奨α・OS・乖離の一覧）"),
    _ukiScopeTgl,
    React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", margin: "0 0 4px", lineHeight: 1.5 } }, "浮き足〇の記録を1件ずつ、現実（採用した浮き足加算α）と推奨（推奨%どおりの浮き足加算）で上下2段に対比。浮き足〇はα＝浮き足加算（＋RN）のみ＝基本α/応用αは無し。OS＝OS1〜3の到達最高値（×で打ち切り）。乖離度＝到達最高OSと各段の浮き足加算αの差（＋到達／−未達）。推奨の加算＝浮き値×推奨%（下の📐%シミュ）。日付の「記録」でその日の記録を開閉。"),
    _floatTable,
    simNode);
}
// 浮き足加算率スイープ 2026-07-12: 採用α（基本＋追加＋RN）は実績のまま、浮き足加算だけをP=0〜100%(10刻み)で振り、最終損益で評価。alphaOf(r)=（採用α−現行浮き足加算floor(v/2)）＋floor(浮き値×P/100)＝P=50%で現行(半額)に一致＝実績と同値。母数poolは呼び出し側で浮き足〇&浮き値>0に絞る。best=件数(E成立)≥_EL_BASE_MIN_N&想定損益>0でスコア最大。シグナル総合タブ(全銘柄)＋シグナル別「浮き足」サブタブ(_elFloatReasonSectionV2)で共用。
function _elUkiPctSweep(pool, aiOf, holiSet) {
  var _mk = function(P) {
    return function(r) {
      var s = r.signal, uv = _elUkiVal(s);
      if (uv == null || uv <= 0) return null;
      var a = (s.alphaVal != null && s.alphaVal !== "" && !isNaN(Number(s.alphaVal))) ? Number(s.alphaVal) : null;
      if (a == null) return null;
      return (a - _elUkiAdd(s)) + Math.floor(uv * P / 100);
    };
  };
  var _span = _elBizSpanDays(pool, holiSet);   // 頻度列用（α詳細表と同基準）2026-07-18: 母数の活動営業日数（全行共通・分母固定でαごとに到達実日数だけ変わる）。holiSet省略時は土日のみ除外。
  var rows = [];
  for (var P = 0; P <= 100; P += 10) { var _af = _mk(P); rows.push({ P: P, ev: _elH2EvalByFn(pool, aiOf, _af), entDays: _elEnteredDays(pool, _af) }); }
  var _qual = function(x) { return x.ev.decided >= _EL_BASE_MIN_N && x.ev.h2Sum != null && x.ev.h2Sum > 0 && x.ev.score != null; };
  var _quals = rows.filter(_qual);
  var _sigOf = function(x) { return x.ev.h2Sum; }, _avgOf = function(x) { return x.ev.avgH2; }, _pOf = function(x) { return x.P; };   // 平均最終損益 最大 2026-07-15f
  var best = _elBordaBest(_quals, _sigOf, _avgOf, _pOf);
  var _rest = _quals.filter(function(x) { return !best || x.P !== best.P; });   // 次点＝best以外で平均最大
  var runnerUp = _rest.length ? _elBordaBest(_rest, _sigOf, _avgOf, _pOf) : null;
  return { rows: rows, best: best, runnerUp: runnerUp, span: _span };
}
// フォーム/EPナビ向け: 全銘柄の浮き足〇記録(refDate未満=記録日前日まで)から推奨浮き足加算率(reco=best.P)と次点(runnerUp.P)を算出 2026-07-12。データ不足はnull（呼び出し側で50%フォールバック）。母数はシグナル総合の浮き足%分析と同一。
function _elUkiRecoPcts(data, refDate) {
  var all = _elCollectAllSignals(data) || [];
  var pool = all.filter(function(r) {
    if (!r || !r.signal) return false;
    if (refDate && r.date && r.date >= refDate) return false;   // 記録日前日まで（当日除外＝look-ahead回避）
    return _epIsV2(r.signal) && _elInclData(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0;   // 浮き足分析＝データ算入 2026-07-22f
  });
  if (!pool.length) return { reco: null, runnerUp: null, n: 0 };
  var sweep = _elUkiPctSweep(pool, function(r) { return _elAlphaInfo(r, data); });
  return { reco: sweep.best ? sweep.best.P : null, runnerUp: sweep.runnerUp ? sweep.runnerUp.P : null, n: pool.length };
}
// 浮き足加算率スイープの推奨バー＋表を描画 2026-07-12→2026-07-18 α詳細表(_elBaseAlphaDetailV2)と同じ列立てに刷新。列＝浮き足%/E成立/到達率/頻度/利確率/損切り率/最終損益(平均/中央/Σ)/勝ち負け平均/スコア。★推奨＝最良（フォーム自動入力に使う値）・次点も表示・件数_EL_BASE_MIN_N未満は薄字「参考」。頻度はsweep.span(活動営業日)÷行のentDays(到達実日数)。
// 2026-07-18: %版/円版で共有する描画コア。cfg.keyOf(行→P or X)・cfg.unit("%"/"円")・cfg.head(第1列見出し)・cfg.recoWord(推奨バー語)・cfg.noneTail(推奨無し時の末尾)。列立て/スタイル/ロジックは%版と完全等価。
function _elUkiSweepNodeCore(sweep, cfg) {
  var rows = sweep.rows, best = sweep.best, runnerUp = sweep.runnerUp, _k = cfg.keyOf, _u = cfg.unit;
  var _dash = React.createElement("span", { style: { color: "#bbb" } }, "—");
  var _reco = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: best ? "#0369A1" : "#94A3B8" } },
    best
      ? React.createElement("span", null, "推奨 " + cfg.recoWord + " ", React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, _k(best) + _u),
          "（損切り" + Math.round((best.ev.stopRate || 0) * 100) + "%・利確" + Math.round((best.ev.takeRate || 0) * 100) + "%・想定損益計" + _elPnlFmt(Math.round(best.ev.h2Sum)) + "・" + best.ev.decided + "件）",
          runnerUp ? React.createElement("span", { style: { color: "#64748B", fontWeight: 600 } }, "　｜　次点 " + _k(runnerUp) + _u + "（スコア" + Math.round(runnerUp.ev.score * 100) + "）") : null)
      : "推奨：件数" + _EL_BASE_MIN_N + "以上で想定損益プラスの" + cfg.recoWord + "は出ていません" + (cfg.noneTail || "（データ不足）"));
  var _trs = rows.map(function(x) {
    var e = x.ev, isBest = !!(best && _k(x) === _k(best)), isRunner = !!(runnerUp && _k(x) === _k(runnerUp)), low = e.decided < _EL_BASE_MIN_N;
    var bg = isBest ? "#FEF3C7" : (isRunner ? "#EFF6FF" : null);
    var lblColor = isBest ? "#B45309" : (isRunner ? "#0369A1" : "#9A3412");
    var label = React.createElement("span", { style: { fontWeight: 700, color: lblColor } }, _k(x) + _u + (isBest ? " ★推奨" : "") + (isRunner ? " 次点" : "") + (low ? " 参考" : ""));
    return React.createElement("tr", { key: _k(x), style: Object.assign({}, bg ? { background: bg } : {}, low ? { opacity: 0.5 } : {}) },
      _elv2Td(label, { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(e.decided + "件"),
      _elv2Td(e.eRate != null ? _elPctCell(e.eRate) : _dash),
      _elv2Td(_elFreqCell(sweep.span, x.entDays)),
      _elv2Td(e.takeRate != null ? _elPctCell(e.takeRate) : _dash),
      _elv2Td(e.stopRate != null ? _elStopRateCell(e.stopRate) : _dash),
      _elv2Td(_elH2AmtCell(e)),
      _elv2Td(_elH2WinLossCell(e)),
      _elv2Td(e.score != null ? _elScoreCell(e.score) : _dash));
  });
  return React.createElement("div", { style: { marginTop: 4 } },
    _reco,
    _elv2Table([cfg.head, "E成立", "到達率", "頻度", "利確率", "損切り率", "最終損益(平均/中央/Σ)", "勝ち/負け平均", "スコア"], _trs));
}
function _elUkiPctSweepNode(sweep) {
  return _elUkiSweepNodeCore(sweep, { keyOf: function(x) { return x.P; }, unit: "%", head: "浮き足%", recoWord: "浮き足加算率", noneTail: "（データ不足／50%で十分の傾向）" });
}
// 浮き足α値（円）版スイープ 2026-07-18: 加算率%でなく浮き足α値=固定X円(0〜20)を全記録に上乗せして最終損益で評価＝基本α詳細表(_elBaseAlphaDetailV2)と同じ「円」の土俵。実効α=(採用α−現在の浮き足加算)+X（%版_elUkiPctSweepのuv*P/100をXへ置換）。母数/評価/★選定は%版と同一（推奨は表示のみ・フォーム自動入力は%版が正本）。
function _elUkiValSweep(pool, aiOf, holiSet) {
  var _MAX = 20;   // 基本α詳細表(_elBaseAlphaDetailV2)と同レンジ（0〜20円・1円刻み）
  var _mk = function(X) {
    return function(r) {
      var s = r.signal, uv = _elUkiVal(s);
      if (uv == null || uv <= 0) return null;
      var a = (s.alphaVal != null && s.alphaVal !== "" && !isNaN(Number(s.alphaVal))) ? Number(s.alphaVal) : null;
      if (a == null) return null;
      return (a - _elUkiAdd(s)) + X;
    };
  };
  var _span = _elBizSpanDays(pool, holiSet);
  var rows = [];
  for (var X = 0; X <= _MAX; X += 1) { var _af = _mk(X); rows.push({ X: X, ev: _elH2EvalByFn(pool, aiOf, _af), entDays: _elEnteredDays(pool, _af) }); }
  var _qual = function(x) { return x.ev.decided >= _EL_BASE_MIN_N && x.ev.h2Sum != null && x.ev.h2Sum > 0 && x.ev.score != null; };
  var _quals = rows.filter(_qual);
  var _sigOf = function(x) { return x.ev.h2Sum; }, _avgOf = function(x) { return x.ev.avgH2; }, _xOf = function(x) { return x.X; };
  var best = _elBordaBest(_quals, _sigOf, _avgOf, _xOf);
  var _rest = _quals.filter(function(x) { return !best || x.X !== best.X; });
  var runnerUp = _rest.length ? _elBordaBest(_rest, _sigOf, _avgOf, _xOf) : null;
  return { rows: rows, best: best, runnerUp: runnerUp, span: _span };
}
function _elUkiValSweepNode(sweep) {
  return _elUkiSweepNodeCore(sweep, { keyOf: function(x) { return x.X; }, unit: "円", head: "浮き足α値", recoWord: "浮き足α値" });
}
// 浮き足α値（円）版ブロック（%表の下に併記）2026-07-18: 見出し＋説明＋_elUkiValSweepNode。%表がある全箇所（シグナル総合_elUkiPctBoardV2・シグナル別_elFloatReasonSectionV2・フォーム/EPナビ📊_elUkiPctBoardScoped）で共用。poolは呼び出し側で浮き足〇&浮き値>0に絞り済み（%表と同母数）。
function _elUkiValBoardBlock(pool, aiOf, holiSet) {
  return React.createElement("div", { style: { marginTop: 14, borderTop: "1px dashed #D6E7D2", paddingTop: 10 } },
    React.createElement("div", { style: { fontSize: 11, color: "#15803D", fontWeight: 700, marginBottom: 4 } }, "⚡ 浮き足α値（円）で見る＝基本αと同じ土俵"),
    React.createElement("div", { style: { fontSize: 11, color: "#64748B", lineHeight: 1.6, marginBottom: 8, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 10px" } },
      "上の%表と同じ母数を、浮き足の加算を『固定X円』（0〜20円・1円刻み）に振り直して最終損益で評価。%は記録ごとに加算円が変わるのに対し、こちらは全記録に同じ円を上乗せ＝基本α詳細表と同じ見方。★＝件数（E成立）" + _EL_BASE_MIN_N + "以上で想定損益プラスの中でスコア最大の浮き足α値（表示のみ・フォームの自動入力は%が正本）。"),
    _elUkiValSweepNode(_elUkiValSweep(pool, aiOf, holiSet)));
}
// 全銘柄共通の浮き足加算率最適化ボード（シグナル総合タブ）2026-07-12。母数=全銘柄の浮き足〇・浮き値>0のv2記録。
function _elUkiPctBoardV2(recs, aiOf, holiSet) {
  var pool = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclData(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0; });   // 浮き足分析＝データ算入 2026-07-22f
  if (!pool.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "浮き足〇（浮き値あり）の記録がまだありません");
  var sweep = _elUkiPctSweep(pool, aiOf, holiSet);
  return React.createElement(React.Fragment, null,
    React.createElement("div", { style: { fontSize: 11, color: "#64748B", lineHeight: 1.6, marginBottom: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px" } },
      "母数＝全銘柄の浮き足〇記録 " + pool.length + "件（浮き値あり）。各記録は実際に使った加算率で採用αに畳み込み済み。ここでは浮き足の加算だけを0〜100%（10刻み）で振り直して最終損益で評価。★推奨＝件数（E成立）" + _EL_BASE_MIN_N + "以上で想定損益プラスの中でスコア最大＝新規記録の浮き足加算の自動入力に使う推奨率（次点も表示）。"),
    _elUkiPctSweepNode(sweep),
    _elUkiValBoardBlock(pool, aiOf, holiSet));
}
// 浮き足の基本/応用プール別 加算率ボード（詳細表）2026-07-14g: 母数＝浮き足〇&浮き値>0&算入&v2 のうち mode で基本(応用フラグ無)/応用(応用フラグ有)に分岐。各プールに%スイープ(_elUkiPctSweep)を当て推奨%を出す＝基本α/応用αのタグ別プールと同じ発想。※フォーム📊詳細表ボタンから開く（配線は第2弾）。
function _elUkiPctBoardScoped(recs, aiOf, mode, reasons, holiSet) {
  var _sp = mode === "special";
  var pool = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclData(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0 && (_sp ? _elUkiSpecialUsed(r.signal) : !_elUkiSpecialUsed(r.signal)); });   // 浮き足分析＝データ算入 2026-07-22f
  var byReason = false;   // 浮き足応用の根拠別＝選んだ根拠を持つ記録に絞る（≥下限で採用・薄ければ全応用に戻す）2026-07-14g
  if (_sp && reasons && reasons.length) {
    var byR = pool.filter(function(r) { var rs = (r.signal && Array.isArray(r.signal.ukiReasons)) ? r.signal.ukiReasons : []; return rs.filter(function(x) { return reasons.indexOf(x) >= 0; }).length > 0; });
    if (byR.length >= _EL_BASE_MIN_N) { pool = byR; byReason = true; }
  }
  if (!pool.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _sp ? "浮き足応用〇（浮き値あり）の記録がまだありません" : "浮き足基本〇（浮き値あり）の記録がまだありません");
  var sweep = _elUkiPctSweep(pool, aiOf, holiSet);
  return React.createElement(React.Fragment, null,
    React.createElement("div", { style: { fontSize: 11, color: "#64748B", lineHeight: 1.6, marginBottom: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px" } },
      "母数＝" + (_sp ? "浮き足応用" : "浮き足基本") + (byReason ? "（選択根拠）" : "") + "〇の記録 " + pool.length + "件（浮き値あり）。加算率を0〜100%（10刻み）で振り直し最終損益で評価。★推奨＝件数（E成立）" + _EL_BASE_MIN_N + "以上で想定損益プラスの中でスコア最大＝" + (_sp ? "浮き足応用" : "浮き足基本") + "加算率の推奨（次点も表示）。"),
    _elUkiPctSweepNode(sweep),
    _elUkiValBoardBlock(pool, aiOf, holiSet));
}
// フォーム/EPナビ向け: 全銘柄の浮き足(基本 or 応用)記録(refDate=記録日前日まで)から推奨加算率(reco)/次点(runnerUp)を算出 2026-07-14g。データ不足は{reco:null}。_elUkiRecoPctsのmode分岐版。
function _elUkiPctPickScoped(data, refDate, mode, reasons) {
  var _sp = mode === "special";
  var all = _elCollectAllSignals(data) || [];
  var pool = all.filter(function(r) { if (!r || !r.signal) return false; if (refDate && r.date && r.date >= refDate) return false; return _epIsV2(r.signal) && _elInclData(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0 && (_sp ? _elUkiSpecialUsed(r.signal) : !_elUkiSpecialUsed(r.signal)); });   // 浮き足分析＝データ算入 2026-07-22f
  var byReason = false, fellBack = false;   // 浮き足応用の根拠別（≥下限で採用・薄ければ全応用にフォールバック＝応用αと同じ）2026-07-14g
  if (_sp && reasons && reasons.length) {
    var byR = pool.filter(function(r) { var rs = (r.signal && Array.isArray(r.signal.ukiReasons)) ? r.signal.ukiReasons : []; return rs.filter(function(x) { return reasons.indexOf(x) >= 0; }).length > 0; });
    if (byR.length >= _EL_BASE_MIN_N) { pool = byR; byReason = true; } else if (pool.length) { fellBack = true; }
  }
  if (!pool.length) return { reco: null, runnerUp: null, n: 0, byReason: byReason, fellBack: fellBack };
  var sweep = _elUkiPctSweep(pool, function(r) { return _elAlphaInfo(r, data); });
  var _reco = sweep.best ? sweep.best.P : null;
  var _runnerUp = sweep.runnerUp ? sweep.runnerUp.P : null;
  // 浮き足応用の推奨%は必ず基本の推奨%より大きく（同値不可・10%刻み→基本+10以上へクランプ）2026-07-21。基本の推奨は同条件(refDate前日まで)のbasic pickから再帰取得（basicは_spでないので再帰しない）。
  if (_sp && _reco != null) {
    var _bp = _elUkiPctPickScoped(data, refDate, "basic", null);
    if (_bp && _bp.reco != null) {
      var _floor = Math.min(100, _bp.reco + 10);
      if (_reco < _floor) _reco = _floor;
      if (_runnerUp != null && _runnerUp < _floor) _runnerUp = _floor;
      if (_runnerUp === _reco) _runnerUp = null;
    }
  }
  return { reco: _reco, runnerUp: _runnerUp, n: pool.length, byReason: byReason, fellBack: fellBack };
}
// 浮き足加算率ボードの基本/応用スコープ切替トグル（フォームの浮き足[浮き基本|浮き応用]と同スタイル）2026-07-18。sp=true→応用。onSet(boolean)で切替。分析ボード(シグナル総合/シグナル別)を_elUkiPctBoardScopedのmodeに連動させる。
function _ukiScopeToggle(sp, onSet) {
  return React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 7, padding: 2, gap: 2 } },
    [["basic", "浮き基本", false], ["special", "浮き応用", true]].map(function(_uk) {
      var _uon = sp === _uk[2];
      return React.createElement("button", { key: _uk[0], type: "button", onClick: function() { onSet(_uk[2]); },
        title: _uk[2] ? "浮き足応用〇の記録だけを母数に加算率を最適化" : "浮き足基本〇の記録だけを母数に加算率を最適化",
        style: { padding: "3px 11px", fontSize: 11, fontWeight: _uon ? 800 : 600, borderRadius: 5, cursor: "pointer", border: "none", background: _uon ? "#fff" : "transparent", color: _uon ? "#15803D" : "#6B6459", boxShadow: _uon ? "0 1px 2px rgba(0,0,0,.1)" : "none" } }, _uk[1]);
    }));
}

// ===== 追加分析セクション群の共通小物（2026-06-14）=====
function _elv2Th(t) { return React.createElement("th", { style: { padding: "4px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); }
function _elv2Td(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); }
function _elv2Table(head, bodyRows) {
  return React.createElement(_HScrollBox, { style: { marginTop: 6 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } }, head.map(function(h) { return React.isValidElement(h) ? h : _elv2Th(h); }))),
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
function _elOsPctlV2(recs, osOf) {
  var _os = osOf || function(s) { return (s && s.osVal != null && s.osVal !== "") ? Number(s.osVal) : null; };
  var vals = [];
  (recs || []).forEach(function(r) {
    var s = r && r.signal ? r.signal : r;
    var n = _os(s); if (n != null && !isNaN(n)) vals.push(n);
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
  var _cm = _elOsCountMap(vals);
  var _bc = _elOsBucketCounts(_cm.vc, _cm.neg, false);
  var bmKey = null, bmN = 0; for (var bk in _bc) { if (_bc.hasOwnProperty(bk) && _bc[bk] > bmN) { bmN = _bc[bk]; bmKey = bk; } }
  var r1 = function(x) { return Math.round(x * 10) / 10; };
  return { n: n, mean: r1(mean), p25: r1(p25), p50: r1(p50), p75: r1(p75), iqr: r1(p75 - p25),
    skewRight: (mean - p50) > Math.max(1, p50 * 0.15),
    a50: _aFor(0.5), a70: _aFor(0.7), a80: _aFor(0.8), a90: _aFor(0.9),
    bucketMode: { key: bmKey, cnt: bmN, pct: Math.round(bmN / n * 100) } };
}

// OS値の分析の数値（ヒストの棒／OS値別の成績の行）クリックで開く、読み取り専用の取引明細。本日の損益データ欄と同じ列構成（α/損切りは採用値・行ごとのシミュ入力は無し）。recs={stock,signal,date,item?}・aiOf(r)→{alpha,cutLine}。2026-06-25
function _elOsTradeMini(recs, aiOf, opts) {
  var list = (recs || []).filter(function(r) { return r && r.signal; });
  if (!list.length) return React.createElement("div", { style: { color: "#aaa", fontSize: 11, padding: "6px 4px" } }, "記録なし");
  var sorted = list.slice().sort(function(a, b) { return (a.date + (a.signal.time || "99:99")).localeCompare(b.date + (b.signal.time || "99:99")); });
  var _bb = "1px solid #e8e5de";
  var _th = function(label, extra) { return React.createElement("th", { style: Object.assign({ padding: "2px 4px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", textAlign: "center", fontSize: 10, lineHeight: 1.15, color: "#9A9186", whiteSpace: "nowrap" }, extra || {}) }, label); };
  var rows = sorted.map(function(r, i) {
    var s = r.signal, item = r.item;
    var ai = aiOf(r), a = ai.alpha, c = ai.cutLine;
    var entered = _elIsEntered(s, item);
    var realPnl = (item && item.pnl != null) ? Number(item.pnl) : (s.realizedPnl != null ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null);
    var gReal = entered && realPnl != null ? _profitGradeFromPnlReal(realPnl, 1) : null;
    return React.createElement("tr", { key: i, style: { background: i % 2 ? "#fafafa" : "transparent" } },
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontWeight: 700, fontSize: 10, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap", color: "#9A3412" } }, (r.date || "").slice(5)),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 10, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap", color: "#666" } }, s.time || "—"),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: _bb, borderRight: _bb, color: "#555", minWidth: 60 } },
        (function() { var _sigs = (s.tags && s.tags.length > 0 ? s.tags : (s.categories && s.categories.length > 0 ? s.categories : [])); if (!_sigs.length) return "—"; return React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } }, _sigs.map(function(_t, _i) { return _sigNameNode(_t, _i); })); })()),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb, background: _elSpecialUsed(s) ? "#FEF3C7" : null } },
        _elAlphaTypeCell(s, a)),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb } },
        _elCutValNode(c)),
      _elLineCell(s, a, c, _bb),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb } }, _epECell(s, a)),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap" } },
        entered ? React.createElement("span", { style: { color: "#2E7D32", fontWeight: 700, fontSize: 14 } }, "〇") : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×")),
      _elPnlDetailCells(s, a, c, _bb, "1px 3px", "1px 5px"),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: _bb, whiteSpace: "nowrap" } },
        _elLane(_tradeAlphaChip(s), 26, "flex-end"), _elRPnlDispW(realPnl, gReal, 72))
    );
  });
  return React.createElement(_HScrollBox, { style: { marginTop: 4 }, plain: !!(opts && opts.plain) },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", fontSize: 10 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
        _th("日付", { width: 50 }), _th("時間", { width: 42 }), _th("シグナル"), _th("α値", { width: 34 }), _th("損切り", { width: 34 }), _th("ライン", { width: 1 }), _th("E", { width: 24 }), _th("取引", { width: 26 }), _th("最終損益・詳細", { width: 84 }),
        React.createElement("th", { colSpan: 2, style: { padding: "2px 4px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", textAlign: "center", fontSize: 10, color: "#9A9186", whiteSpace: "nowrap" } }, "OS・損益詳細"),
        _th(React.createElement("span", { title: "EP足〜手じまい足の保有時間（1分足換算・時間かぶり判定と同基準）" }, "保有"), { width: 30 }), _th("実現損益", { width: 80 }))),
      React.createElement("tbody", null, rows)));
}
// OS値別の成績テーブル【1円刻み 2026-06-25】。0〜4=帯／5〜24=1円／25〜=帯(ボタンで1円内訳に展開)。集計タブ「OS値の分析」内。aiOf(r)→{alpha,cutLine}。
// 集計ルールは採用α・E成立分のみ（他のOS分析と一致）。OS値=OS1〜3最高到達(_elOsMaxAll)。
function _elOsBandPerfV2(_ref) {
  var recs = _ref.recs || [];
  var aiOf = _ref.aiOf;
  var _uE = useState(false), exp = _uE[0], setExp = _uE[1];
  var _uO = useState(null), openKey = _uO[0], setOpenKey = _uO[1];
  var mk = function() { return { cnt: 0, reach: 0, ok: 0, ng: 0, draw: 0, miss: 0, plan: 0, planCnt: 0, planArr: [], h1: 0, h1Cnt: 0, h1Arr: [], stop: 0, soft: 0 }; };
  var agg = {};
  var recsByKey = {};
  recs.forEach(function(r) {
    var s = r.signal; if (!s) return; var _ov = (_ref.osFn || _elOsMaxAll)(s); if (_ov == null) return;   // osFn=実現/生の帯分類基準（_elOsSectionV2から伝播）2026-07-09
    var nv = Number(_ov); if (isNaN(nv) || nv < 0) return;
    var fk = (nv <= 4) ? "0-4" : String(Math.round(nv));
    (recsByKey[fk] || (recsByKey[fk] = [])).push(r);
    var ai = aiOf(r); var o = agg[fk] || (agg[fk] = mk()); o.cnt++;
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
  var merge = function(t, s) { ["cnt", "reach", "ok", "ng", "draw", "miss", "plan", "planCnt", "h1", "h1Cnt", "stop", "soft"].forEach(function(k) { t[k] += s[k]; }); t.planArr = t.planArr.concat(s.planArr); t.h1Arr = t.h1Arr.concat(s.h1Arr); return t; };
  var fineKeys = Object.keys(agg);
  var topFine = fineKeys.filter(function(k) { return k !== "0-4" && Number(k) >= _EL_OS_TOP; }).map(Number).sort(function(a, b) { return a - b; });
  var rowDefs = [];
  fineKeys.filter(function(k) { return k === "0-4" || (Number(k) >= 5 && Number(k) < _EL_OS_TOP); }).forEach(function(k) {
    rowDefs.push({ key: k, ord: _elOsBucketOrd(k), color: _elOsBucketColor(k), label: _elOsBucketLabel(k), agg: agg[k], recs: recsByKey[k] || [] });
  });
  if (topFine.length) {
    if (exp) {
      topFine.forEach(function(v) { rowDefs.push({ key: "t" + v, ord: v, color: _elOsShade(_EL_OS_TOP), label: v + "円", agg: agg[String(v)], recs: recsByKey[String(v)] || [] }); });
    } else {
      var m = mk(); var mr = []; topFine.forEach(function(v) { merge(m, agg[String(v)]); mr = mr.concat(recsByKey[String(v)] || []); });
      rowDefs.push({ key: "25+", ord: 9999, color: _elOsBucketColor("25+"), label: "25円〜", agg: m, expandable: true, recs: mr });
    }
  }
  rowDefs.sort(function(a, b) { return a.ord - b.ord; });
  var chip = function(rd) {
    return React.createElement("span", { onClick: rd.expandable ? function(e) { e.stopPropagation(); setExp(true); } : null,
      style: { display: "inline-block", fontSize: 10, fontWeight: 700, color: "#fff", background: rd.color, borderRadius: 8, padding: "1px 7px", cursor: rd.expandable ? "pointer" : "default", whiteSpace: "nowrap" } },
      rd.label + (rd.expandable ? " ▼" : ""));
  };
  var bRows = rowDefs.map(function(rd) {
    var ob = rd.agg;
    var _open = openKey === rd.key;
    var _row = React.createElement("tr", { key: rd.key, onClick: function() { setOpenKey(_open ? null : rd.key); }, style: { cursor: "pointer", background: _open ? "#FFF7ED" : "transparent" } },
      _elv2Td(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { color: "#F97316", fontSize: 10 } }, _open ? "▼" : "▶"), chip(rd)), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(ob.cnt + "件", { fontWeight: 700 }),
      _elv2Td(_elv2Rate(ob.reach, ob.cnt)),
      _elv2Td(_elEwinCell(ob.ok, ob.ng, ob.draw)),
      _elv2Td(_elPnlMMCell(ob.planArr)),
      _elv2Td(_elPnlMMCell(ob.h1Arr)),
      _elv2Td((ob.ok + ob.ng + ob.draw) ? Math.round(ob.soft / (ob.ok + ob.ng + ob.draw) * 100) + "%" : "—", { color: ob.soft ? "#B45309" : "#bbb", fontWeight: ob.soft ? 700 : 400 }),
      _elv2Td((ob.ok + ob.ng + ob.draw) ? Math.round(ob.stop / (ob.ok + ob.ng + ob.draw) * 100) + "%" : "—", { color: ob.stop ? "#1E8449" : "#bbb", fontWeight: ob.stop ? 700 : 400 }));
    if (!_open) return _row;
    return React.createElement(React.Fragment, { key: rd.key + "_f" }, _row,
      React.createElement("tr", { key: rd.key + "_x" }, React.createElement("td", { colSpan: 8, style: { padding: "2px 6px 8px", background: "#FFFBF5", borderBottom: "2px solid #FB923C" } }, _elOsTradeMini(rd.recs, aiOf))));
  });
  return React.createElement("div", null,
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, margin: "8px 0 0", flexWrap: "wrap" } },
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412" } }, "OS値（1円刻み・OS1〜3最高到達）別の成績"),
      topFine.length ? React.createElement("button", { type: "button", onClick: function() { setExp(!exp); }, style: { padding: "2px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid #9A3412", background: exp ? "#9A3412" : "#fff", color: exp ? "#fff" : "#9A3412", borderRadius: 5 } }, exp ? "25円〜をまとめる" : "25円〜を展開") : null),
    bRows.length ? _elv2Table(["OS値", "件数", "E到達率", "E後の勝率", "EP損益", "H1損益", "見切り率", "損切り率"], bRows)
      : React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "OS値の記録がありません"));
}
// OS値の総合分析（記録帳・集計タブ／2026-06-14）: 中央値主軸の統計＋右偏バッジ＋OS値帯別の成績。成立率→α分位表(α目安)は2026-06-28にα値タブ(_elOsAlphaPctlTableV2)へ移設。
// 2026-06-23: OS値=OS1〜3最高値(_elOsMaxAll)基準へ統一＝α目安(到達確率)の整合性向上・選択バイアス回避。DayViewの銘柄別OS1値分析(寄り付き専用)はOS1のまま。
// 「重視すべきは平均でなく中央値（α到達確率と直結）」という方針をUIに落とし込む。aiOf(r)→{alpha,cutLine}。
function _elOsSectionV2(recs, aiOf, osFn, osValMode, setOsValMode) {
  var _of = osFn || _elOsMaxAll;   // 実現OSの抽出関数（親EntryLogViewの_osValFn・未指定は従来=生）2026-07-09
  var os = _elOsStatsV2(recs, _of), pc = _elOsPctlV2(recs, _of);
  if (!os || !pc) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "OS値の記録がありません");
  // OS基準トグルは2026-07-13廃止（ユーザー承認③）＝実現OS（主基準・統計/帯別/棒クリック）＋生の最高OS（ヒストの色棒・統計は括弧併記）を同時表示。
  var osRaw = _elOsStatsV2(recs, _elOsMaxAll);
  var _rawEm = function(v) { return (osRaw && v != null) ? React.createElement("span", { style: { fontSize: 10, color: "#94A3B8", marginLeft: 2 } }, "（生" + v + "円）") : null; };
  var _baPickAlpha = (function() { var _p = _elBaseAlphaPick(recs, aiOf); return (_p && _p.alpha != null) ? _p.alpha : null; })();   // OS値分布に現在の推奨基本αを青字マーク 2026-06-28
  var skewBadge = pc.skewRight ? React.createElement("span", { title: "平均が一部の大きいOS値に引っ張られています。典型値は中央値で読むのが安全です。", style: { display: "inline-block", fontSize: 9, fontWeight: 800, color: "#fff", background: "#B45309", borderRadius: 4, padding: "1px 6px", marginLeft: 6 } }, "右偏") : null;
  var statLine = React.createElement("div", { style: { display: "flex", gap: "6px 18px", flexWrap: "wrap", alignItems: "baseline", marginBottom: 6 } },
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginRight: 3 } }, "中央値"), React.createElement("b", { style: { fontSize: 18, color: "#9A3412" } }, os.med + "円"), _rawEm(osRaw ? osRaw.med : null), skewBadge),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "平均"), React.createElement("b", { style: { fontSize: 13, color: "#555" } }, os.avg + "円"), _rawEm(osRaw ? osRaw.avg : null)),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "最頻"), _elOsBucketChip(pc.bucketMode.key), React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 3 } }, pc.bucketMode.pct + "%")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "中位50%"), React.createElement("b", { style: { fontSize: 12, color: "#555" } }, pc.p25 + "〜" + pc.p75 + "円")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "範囲"), React.createElement("b", { style: { fontSize: 12, color: "#555" } }, os.min + "〜" + os.max + "円")),
    React.createElement("span", { style: { fontSize: 10, color: "#aaa" } }, "OS入力 " + os.n + "件（実現・統計はこちら基準）"));
  var pieRow = React.createElement("div", { style: { marginBottom: 8 } },
    React.createElement("div", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginBottom: 4 } }, "OS値の分布（1円刻み・色棒＝生の最高OS／白枠＝実現OS・数字は上＝実現/下＝生）"),
    React.createElement(_elOsHistV2, { vals: os.vals, rawVals: osRaw ? osRaw.vals : [], recs: recs, aiOf: aiOf, osOf: _of, markVal: _baPickAlpha }),
    React.createElement("div", { style: { marginTop: 6 } }, _elOsBandLegendV2()));
  var mk = function() { return { cnt: 0, reach: 0, ok: 0, ng: 0, miss: 0, plan: 0, planCnt: 0, h1: 0, h1Cnt: 0, stop: 0 }; };
  var bands = {};
  (recs || []).forEach(function(r) {
    var s = r.signal; var _ov = _of(s); if (_ov == null) return; var bi = _elOsBucketKey(_ov, false); if (bi == null) return;
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
  var bTable = React.createElement(_elOsBandPerfV2, { recs: recs, aiOf: aiOf, osFn: _of });
  var items = [];
  items.push(React.createElement("span", null, "OS値（OS1〜3最高）は", _elInsightEmV2(_elOsBucketLabel(pc.bucketMode.key), _elOsBucketColor(pc.bucketMode.key)), "が最多（" + pc.bucketMode.pct + "%）。典型値＝", _elInsightEmV2("中央値 " + os.med + "円"), pc.skewRight ? React.createElement("span", null, "（平均 " + os.avg + "円は一部の大きいOSに上振れ＝", _elInsightEmV2("中央値で読むのが安全", "#B45309"), "）") : null, "。"));
  var bw = null; for (var bk2 in bands) { if (!bands.hasOwnProperty(bk2)) continue; var o2 = bands[bk2]; var dn = o2.ok + o2.ng; if (dn >= 3 && (bw == null || o2.ok / dn > bw.v)) bw = { v: o2.ok / dn, k: bk2 }; }
  if (bw) items.push(React.createElement("span", null, "勝率が最も高いOS値は", _elInsightEmV2(_elOsBucketLabel(bw.k), _elOsBucketColor(bw.k)), "（", _elInsightEmV2(Math.round(bw.v * 100) + "%"), "・3件以上で比較）。"));
  return React.createElement("div", null, statLine, pieRow, bTable, _elInsightBoxV2(items, { note: "分布は実現OS（×/損切りで降りた足以降を除外＝白枠・統計/帯別/棒クリックの主基準）と生の最高OS（アウトカム盲目＝色棒・統計は（生◯円）併記）の同時表示（2026-07-13トグル廃止）。中央値=ちょうど半数がそれ以上のOSになる値。平均は合計・期待値の計算向き。最頻=最も多く出るOS値（0〜4円と25円〜は帯）。E後の勝率=エントリー（E成立）後にEP損益が利益だった割合（敗率・未達率はE到達率の裏返しなので省略）。成績は採用α基準・E成立分のみ。※α到達確率の目安はα値タブ「成立率の目安」（生基準固定）を参照。" }));
}

// OS値（OS1〜3最高）の分位→成立率別のα目安テーブル。2026-06-28にα値タブへ移設（集計タブの_elOsSectionV2内「成立率の目安」を切り出し）。各成立率（このα以下なら約その割合でα到達＝取引機会）に対応するαの目安。aiOf不要（_elOsPctlV2はOS抽出器_elOsMaxAllを使う）。
function _elOsAlphaPctlTableV2(recs) {
  var pc = _elOsPctlV2(recs, _elOsMaxAll);
  if (!pc) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "OS値の記録がありません");
  var aRows = [["50%（中央値）", pc.a50], ["70%", pc.a70], ["80%", pc.a80], ["90%", pc.a90]].map(function(kv) {
    return React.createElement("tr", { key: kv[0] }, _elv2Td(kv[0], { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#0369A1" }), _elv2Td(React.createElement("b", { style: { color: "#9A3412" } }, "α" + kv[1] + "円")));
  });
  return React.createElement("div", null,
    _elv2Table(["想定成立率", "α（目安）"], aRows));
}

// 1日の目標利益（100株換算・円）。既存の理想α目標(_elIdealAlphaV2 tgtA=2500)と一致。
var _EL_DAY_TARGET_YEN = 2500;
// 横長テーブル用ラッパー（記録帳）2026-07-13: ヒント/ロック全廃＝常に素の横スクロール（旧「👆タップで横スクロール」ピル・タップロック・右端フェードを削除・ユーザー指示）。plainプロップは互換のため受けるが挙動は同一。props.styleは外枠へ。
function _HScrollBox(props) {
  return React.createElement("div", { style: Object.assign({ overflowX: "auto", WebkitOverflowScrolling: "touch" }, props.style || {}) }, props.children);
}
// 週間サマリー（記録帳・期間タブ先頭／全銘柄合算・銘柄別の両方）2026-06-26: 「1取引日あたり平均損益(＋5営業日換算/週)」と「目標(2500円/100株換算)達成率(＋5日換算の達成日数/週)」を実現損益(100株換算)/EP/H1/H2の4基準で表示。
// 2026-06-26b: 週合計の単純平均は休場で短い週があると下振れるバイアスがあるため、日ベース(1取引日あたり=Σ損益÷取引日／達成率=達成日÷取引日)へ変更。週イメージは×5営業日の換算で目安表示。週別内訳表は各週の実額のまま。
// 日別損益は本日の損益データの合計と同基準＝_elTotAccum（EP=plan / H1=holdPlanCap / H2=hold2・（）外＝○のみ・採用α基準・EP/H1/H2は値幅×100で既に100株換算）。週=月〜金(_elBucketKey)。平均の分母=取引のあった週だけ。recs=現スコープのv2算入記録・aiOf(r)→{alpha,cutLine}。
function _elWeeklyTargetSummaryV2(recs, aiOf, dataOpt, scopeStock) {
  var TARGET = _EL_DAY_TARGET_YEN;
  var list = (recs || []).filter(function(r) { return r && r.signal && r.date; });
  if (!list.length) return null;
  // 実現損益は本日の損益データ/取引テーブルと同じ100株換算（損益÷株数×100・株数未入力はそのまま・E成立分のみ）。app-04の_elTotAccum real getterと同一。
  var _get = { signal: function(r) { return r.signal; }, alpha: function(r) { return aiOf(r).alpha; }, cut: function(r) { return aiOf(r).cutLine; }, excluded: dataOpt ? function(r) { return _elCollExcluded(dataOpt, r, scopeStock); } : null, real: function(r) {
    if (!_elIsEntered(r.signal, r.item)) return null;
    var v = (r.item && r.item.pnl != null) ? Number(r.item.pnl) : _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
    if (v == null) return null;
    var sh = Number(r.signal.shares) > 0 ? Number(r.signal.shares) : 0;
    return sh > 0 ? Math.round(v / sh * 100) : Math.round(v);
  } };
  var byDate = {};
  list.forEach(function(r) { (byDate[r.date] = byDate[r.date] || []).push(r); });
  var wk = {};
  Object.keys(byDate).forEach(function(d) {
    var t = _elTotAccum(byDate[d], _get);
    var re = t.real || 0, ep = t.plan || 0, h1 = t.holdPlanCap || 0, h2 = t.hold2 || 0;
    var k = _elBucketKey(d, "week");
    var o = wk[k] || (wk[k] = { re: 0, ep: 0, h1: 0, h2: 0, days: 0, reD: 0, epD: 0, h1D: 0, h2D: 0 });
    o.re += re; o.ep += ep; o.h1 += h1; o.h2 += h2; o.days++;
    if (re >= TARGET) o.reD++;
    if (ep >= TARGET) o.epD++;
    if (h1 >= TARGET) o.h1D++;
    if (h2 >= TARGET) o.h2D++;
  });
  var keys = Object.keys(wk).sort();
  var W = keys.length;
  if (!W) return null;
  var S = { re: 0, ep: 0, h1: 0, h2: 0, reD: 0, epD: 0, h1D: 0, h2D: 0, days: 0 };
  keys.forEach(function(k) { var o = wk[k]; S.re += o.re; S.ep += o.ep; S.h1 += o.h1; S.h2 += o.h2; S.reD += o.reD; S.epD += o.epD; S.h1D += o.h1D; S.h2D += o.h2D; S.days += o.days; });
  var _pnl = function(v) { return React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: 800 } }, _elPnlFmt(Math.round(v))); };
  var _th = function(label, ex) { return React.createElement("th", { style: Object.assign({ padding: "4px 8px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", textAlign: "center", fontSize: 11, color: "#9A9186", whiteSpace: "nowrap" }, ex || {}) }, label); };
  var _td = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 8px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var bases = [{ key: "re", label: "実現損益(100株)" }, { key: "h2", label: "最終損益" }];
  var _pnlLite = function(v) { return React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: 600, fontSize: 10 } }, "≈" + _elPnlFmt(Math.round(v))); };
  var sumRows = bases.map(function(b) {
    var perDay = S.days > 0 ? S[b.key] / S.days : 0;
    var rate = S.days > 0 ? Math.round(S[b.key + "D"] / S.days * 100) : null;
    var ach5 = S.days > 0 ? (S[b.key + "D"] / S.days * 5) : 0;
    return React.createElement("tr", { key: b.key },
      _td(b.label, { textAlign: "left", paddingLeft: 10, fontWeight: 700, color: "#0369A1" }),
      _td(_pnl(perDay)),
      _td(_pnlLite(perDay * 5)),
      _td(rate == null ? "—" : React.createElement("b", { style: { color: rate >= 50 ? "#1E8449" : "#9A3412", fontSize: 13 } }, rate + "%")),
      _td(React.createElement("span", { style: { color: "#888", fontSize: 10, fontWeight: 600 } }, "≈" + ach5.toFixed(1) + " 日")));
  });
  var summaryTable = React.createElement(_HScrollBox, { style: { marginBottom: 10 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#FBEEDA" } },
        _th("基準", { textAlign: "left", paddingLeft: 10 }), _th("1取引日あたり平均"), _th("5営業日換算 / 週"), _th("達成率（達成日/取引日）"), _th("達成日数/週（5日換算）"))),
      React.createElement("tbody", null, sumRows)));
  var _cellWP = function(v, dn) { return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _pnl(v), React.createElement("span", { style: { fontSize: 9, color: dn > 0 ? "#B45309" : "#bbb", fontWeight: dn > 0 ? 700 : 400 } }, "達成 " + dn + "日")); };
  var wkRows = keys.slice().reverse().map(function(k) {
    var o = wk[k];
    return React.createElement("tr", { key: k },
      _td(_elBucketLabel(k, "week"), { textAlign: "left", paddingLeft: 10, fontWeight: 700, color: "#9A3412" }),
      _td(o.days + " 日", { color: "#555" }),
      _td(_cellWP(o.re, o.reD)),
      _td(_cellWP(o.h2, o.h2D)));
  });
  var weekTable = React.createElement(_HScrollBox, null,
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
        _th("週（月〜金）", { textAlign: "left", paddingLeft: 10, color: "#555", borderBottomColor: "#ddd" }), _th("取引日", { color: "#555", borderBottomColor: "#ddd" }), _th("実現損益", { color: "#555", borderBottomColor: "#ddd" }), _th("最終損益", { color: "#555", borderBottomColor: "#ddd" }))),
      React.createElement("tbody", null, wkRows)));
  return React.createElement("div", { style: { marginBottom: 14, padding: "10px 12px", border: "1px solid #FB923C", borderRadius: 8, background: "#FFFCF8" } },
    React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📅 週間サマリー（目標 1日 " + TARGET.toLocaleString() + "円／100株換算）"),
    React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", marginBottom: 8 } }, "全 " + S.days + "取引日 / " + W + "週。平均は1取引日あたり（Σ損益÷取引日）＝休場・祝日に依存しない。5営業日換算/週＝1日平均×5の目安。達成率＝1日の損益が2,500円以上だった割合（達成日÷取引日）。達成日数/週＝達成率×5の換算。実現損益＝確定損益を100株換算（損益÷株数×100・E成立分）／最終損益＝期待度○が途切れた所で手じまい（（）外＝○のみ・旧H2損益と同一基準）・採用α基準・既に100株換算。週別表は各週の実額。上の期間フィルタに連動。"),
    summaryTable,
    weekTable);
}
// 指定recs（{stock,signal,date}配列）の記録系フル指標を集計（採用α基準・E成立分のEP/H1/損切り・OS=中央値）。OS値入力0件ならnull。
// aiOf(r)→{alpha,cutLine}。_elOsSectionV2の帯別集計と同一ルール＝銘柄別記録/取引テーブルの損益計算基準に一致。2026-06-15。
function _elPeriodStatsV2(recs, aiOf) {
  var osv = [], cnt = 0, reach = 0, ok = 0, ng = 0, planSum = 0, planCnt = 0, h1Sum = 0, h1Cnt = 0, h2Sum = 0, h2Cnt = 0, stop = 0, soft = 0, draw = 0, realSum = 0, realCnt = 0;
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s || s.osVal == null || s.osVal === "") return;
    var ai = aiOf(r);
    var nv = _elOsMaxFiltered(s); if (nv != null) osv.push(nv);  // OS中央値＝実現OS（×/損切りで打ち切り＝ホールドで降りた足以降を除外・記録の採用α基準）2026-07-09（旧: _elOsMaxAllの生最高値。未判定の当日記録は×無し→実現＝生に一致）
    cnt++;
    if (_elIsEntered(s, r.item) && s.realizedPnl != null && s.realizedPnl !== "") { var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign); if (rv != null) { realSum += rv; realCnt++; } }   // 実現損益はE成立(エントリー)分のみ＝他の全実現損益集計と統一 2026-06-24i
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
// 折りたたみ（遅延描画）2026-06-29: 閉じている間は中身 render() を呼ばない＝重いセクションを計算しない＝体感速度。ネイティブ<details>は閉でも子をDOM生成して計算するため、stateで出し分ける。render は関数で渡す（開いて初めて子要素を生成）。
function _SNCollapse(props) {
  var _u = useState(!!props.defaultOpen), open = _u[0], setOpen = _u[1];
  return React.createElement("div", { style: Object.assign({ marginTop: 10, marginBottom: 4, border: "1px solid #e8e3d8", borderRadius: 8, background: "#fbfaf7" }, props.style || {}) },
    React.createElement("div", { onClick: function() { setOpen(!open); }, style: { cursor: "pointer", padding: "9px 12px", fontSize: 12, fontWeight: 700, color: "#9A3412", display: "flex", alignItems: "center", gap: 6, userSelect: "none" } },
      React.createElement("span", { style: { fontSize: 10, color: "#C2722C" } }, open ? "▼" : "▶"), props.title),
    open ? React.createElement("div", { style: { padding: "0 12px 10px" } }, props.render()) : null);
}
function _elDayStockBenchV2(_ref) {
  var data = _ref.data, date = _ref.date, stock = _ref.stock;
  var charts = (data && data.charts) || {};
  // 旧カレンダー窓（今週/今月）の未使用変数（_mon/_fri/wkS/wkE/ym）は撤去（承認⑦ 2026-07-12・窓は件数ベース直近25/50/100が正）。
  var collect = function(pred) {
    var out = [];
    Object.keys(charts).forEach(function(k) {
      var idx = k.lastIndexOf("_"); if (idx < 0) return;
      var stk = k.slice(0, idx), dt = k.slice(idx + 1);
      if (stk !== stock || !pred(dt)) return;
      var c = charts[k];
      (Array.isArray(c.signals) ? c.signals : []).forEach(function(sig) {
        var s = _compatSignal(sig); if (!_epIsV2(s) || !_elInclData(s)) return;   // 分析母数（データ算入）2026-07-22f
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
    var ba = _elBaseAlphaPick(recs, aiOf);            // 推奨基本α（平均最終損益・単一 ※旧コメント「合成スコア」は誤り 2026-07-22j）
    st.baseAlpha = (ba && ba.alpha != null && ba.status !== "none") ? ba.alpha : null;
    return st;
  };
  // 件数ベース化（他の分析表と統一）2026-06-29: wk/mo列を「今週/今月」(カレンダー窓)から「直近50件/直近100件」(前日まで・当日除外)へ。変数名wk/moは据え置き＝描画コードの差分を最小化。
  var _recsBefore = collect(function(dt) { return dt < date; }).sort(function(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  var _lastN = function(n) { return _recsBefore.slice(Math.max(0, _recsBefore.length - n)); };
  var P = { day: mk(recsDay), q: mk(_lastN(_EL_PERIOD_COUNTS[0])), wk: mk(_lastN(_EL_PERIOD_COUNTS[1])), mo: mk(_lastN(_EL_PERIOD_COUNTS[2])), all: mk(recsAll) };   // 直近25件列を追加（承認⑦ 2026-07-12＝正本の件数窓25/50/100に完全一致）
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
    { key: "h2", label: "最終損益", cell: function(st) { return pnlMT(st.h2Avg, st.h2Sum, st.h2Cnt); }, dir: "up", num: function(st) { return st.h2Avg; } },
    { key: "real", label: "実現損益", cell: function(st) { return pnlMT(st.realAvg, st.realSum, st.realCnt); }, dir: "up", num: function(st) { return st.realAvg; } }
  ];
  var EPS = { os: 0.5, base: 0.5, reach: 0.03, stop: 0.03, win: 0.03, h2: 50, real: 50 };
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
      _elv2Td(cellSafe(m, P.q)),
      _elv2Td(cellSafe(m, P.wk)),
      _elv2Td(cellSafe(m, P.mo)),
      _elv2Td(cellSafe(m, P.all)));
  });
  var table = _elv2Table(["指標", "本日", "直近" + _EL_PERIOD_COUNTS[0] + "件", "直近" + _EL_PERIOD_COUNTS[1] + "件", "直近" + _EL_PERIOD_COUNTS[2] + "件", "全期間"], rows);
  var items = [];
  if (P.day && P.day.osMed != null && P.all.osMed != null) {
    items.push(React.createElement("span", null, "本日のOS中央値は", _elInsightEmV2(P.day.osMed + "円"), "（全期間", _elInsightEmV2(P.all.osMed + "円"), "）＝", _elInsightEmV2(P.day.osMed > P.all.osMed ? "実現OSが高め" : P.day.osMed < P.all.osMed ? "実現OSが低め" : "同程度", P.day.osMed > P.all.osMed ? "#C0392B" : P.day.osMed < P.all.osMed ? "#1E8449" : "#888"), "。"));
  }
  if (P.day && P.day.baseAlpha != null && P.all.baseAlpha != null) {
    items.push(React.createElement("span", null, "推奨基本αは 本日", _elInsightEmV2(P.day.baseAlpha + "円"), (P.mo && P.mo.baseAlpha != null ? React.createElement("span", null, "／直近" + _EL_PERIOD_COUNTS[2] + "件", _elInsightEmV2(P.mo.baseAlpha + "円")) : null), "／全期間", _elInsightEmV2(P.all.baseAlpha + "円"), "。"));
  }
  if (P.day && (P.day.ok + P.day.ng + P.day.draw)) {
    var dDen = P.day.ok + P.day.ng + P.day.draw, aDen = P.all.ok + P.all.ng + P.all.draw;
    var dStop = Math.round(P.day.stop / dDen * 100), aStop = aDen ? Math.round(P.all.stop / aDen * 100) : 0;
    items.push(React.createElement("span", null, "損切り率は 本日", _elInsightEmV2(dStop + "%"), "（全期間", _elInsightEmV2(aStop + "%"), "）＝", _elInsightEmV2(dStop < aStop ? "本日は少なめ" : dStop > aStop ? "本日は多め" : "同程度", dStop < aStop ? "#C0392B" : dStop > aStop ? "#1E8449" : "#888"), "。"));
  }
  var insight = items.length ? _elInsightBoxV2(items, { note: "本日列の↑↓は全期間比（↑赤=良い方向／↓緑=悪い方向・推奨基本αは▲▼で高低のみ）。OS=中央値・損益=平均（計＝合計・E成立分）・採用α基準。直近件数窓は当日を除く前日まで。件数 本日" + (P.day ? P.day.n : 0) + "／直近" + _EL_PERIOD_COUNTS[1] + "件窓" + (P.wk ? P.wk.n : 0) + "／直近" + _EL_PERIOD_COUNTS[2] + "件窓" + (P.mo ? P.mo.n : 0) + "／直近" + _EL_PERIOD_COUNTS[0] + "件窓" + (P.q ? P.q.n : 0) + "／全期間" + P.all.n + "件。" }) : null;
  var pctlB = _elOsPctlV2(recsAll, _elOsMaxAll);
  var _aPill = function(v) { return v == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, v + "円"); };
  var deepBlock = React.createElement("div", { style: { marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "到達率別α（全期間）"),
    React.createElement("div", { style: { fontSize: 11, color: "#555", display: "flex", flexWrap: "wrap", gap: "2px 14px" } },
      React.createElement("span", null, "到達率別α 70%→", _aPill(pctlB ? pctlB.a70 : null), " ／ 80%→", _aPill(pctlB ? pctlB.a80 : null))),
    React.createElement("div", { style: { fontSize: 8, color: "#aaa", marginTop: 2 } }, "到達率別α＝OS値分位からの目安（a70＝7割の足で到達）。"));
  return React.createElement("div", { style: { background: "#fff", border: "1px solid #e8e5de", borderRadius: 8, padding: "10px 12px", marginTop: 10 } },
    React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📊 " + stock + "：α比較・深掘り"),
    React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginBottom: 6 } }, "本日 / 直近" + _EL_PERIOD_COUNTS[0] + "・" + _EL_PERIOD_COUNTS[1] + "・" + _EL_PERIOD_COUNTS[2] + "件 / 全期間（直近件数窓は前日まで・件数ベース）＋ 到達率別α（この銘柄・v2記録・採用α基準）"),
    table, insight, deepBlock);
}

// 損切りの上振れ・損切り値シミュ（記録帳・深掘りタブ／2026-06-18）: 損切りになった記録について、
// 損切りライン(α＋損切り値)から最高値がさらに何円上か（超過幅）を1円ブロックで集計し、「損切りせず保有し続けた着地」
// 「最良手仕舞い」だったら何円だったかを併記。損切りが早すぎないかを検証する。aiOf(r)→{alpha,cutLine}。
//   超過幅 = _elHoldMaxHigh(s).all − α − cutLine（損切りラインを超えて伸びた円・水準線比）。
//   損切り損失 = _epHoldLadder(s,α,cut).finalPnl（損切りラインで止めた損益・深掘り「最適ホールド本数」と同基準）。
//   保有なら = _elRuleHoldPnl（損切りせず、確定値が前の足より悪化したらその足で手仕舞い・悪化しなければ最後まで＝実運用ルール 2026-07-13）、ベスト = _epHoldLadder(s,α,BIG).maxPnl（損切り後の最良手仕舞い）。
// ===== 逆行(MAE)分析 2026-07-16f =====
// 逆行＝「損切りを免れた取引が、EP足から手じまい足までに最大何円踏まれたか」＝ mx − α（水準線比の円・**損益ではない**）。
// 母数＝損切り値Cで stopped===false の取引だけ。損切りになった記録は _elStopOvershootSectionV2（超過幅・鏡像）の担当＝排他。
// 【この分析の中核定理】非損切り＝深さ0.._expD のどの足も「高値−α≥C」を満たさない（_elPlanIsStop/_elHoldIsStop/_elHoldIsStop2 の判定式の対偶）。
//   mx は同じ 0..exitD(=_expD) の最大なので **逆行 < C が構造的に保証される**。また _epResolve が legs[i].h>=alpha でEPを立てるので **逆行 >= 0** も保証。
//   ⇒ 損切り値を C' = 最悪逆行+1 に詰めても、全生存者の逆行 < C' なので **生存者は1件も損切りに変わらず、手じまい足も損益も完全に不変**。
//   一方 _epHoldLadder は「最初に h−α≥C に触れた足の高値」で損失を決めるので、C を詰めると損切り組の停止足は早まるか同じ＝**損失は縮むか同額**（実測: C20→15 で -12,000円→-12,000円＝同額のケースあり＝「必ず縮む」ではない）。
//   ⇒ C' = 最悪逆行+1 は「この標本では損切り率も生存損益も悪化させず、損切り組の負け額は縮むか同額」のパレート改善。★はここに置く。
//   実測検証(2026-07-16f): C=20/生存12件/最悪逆行14 → C'=15 で生存者12件が顔ぶれ・損益とも完全同一・損切り組の損失も悪化なし。単調性(C5→最悪4/C8→7/C10→8/C12→11/C15→14/C20→14)も確認＝常に「最悪<C」。
// ※ただし最悪値は標本の max ＝1件の外れ値に全依存。件数が薄いうちは参考表示に留め、「将来これを超える逆行が出ない保証はない」を明示する。
function _elMaeStats(entered, aiOf, C) {
  var rows = [], stopN = 0;
  (entered || []).forEach(function(r) {
    var s = r && r.signal; if (!s) return;
    var a = aiOf(r).alpha; if (a == null) return;
    var v = _elRideVals(s, a, C);   // Cは必ず明示（省略すると_elRideVals内で15円に化ける・app-05:4802）
    if (!v) return;
    if (v.stopped) { stopN++; return; }   // 損切り組は母数外
    if (v.mx == null) return;
    var mae = Math.round((v.mx - a) * 10) / 10;
    if (mae < 0) mae = 0;   // 理屈上起きないがクランプ
    var L = _epHoldLadder(s, a, C);
    rows.push({ r: r, s: s, a: a, mae: mae, pnl: (L ? L.finalPnl : null), lbl: v.lbl, exitD: v.exitD });
  });
  var arr = rows.map(function(o) { return o.mae; });
  var srt = arr.slice().sort(function(x, y) { return x - y; });
  return { n: rows.length, stopN: stopN, rows: rows, arr: arr,
    max: srt.length ? srt[srt.length - 1] : null,
    mean: arr.length ? _elMean(arr) : null,
    med: arr.length ? _elMedian(arr) : null,
    p90: srt.length ? srt[Math.min(srt.length - 1, Math.ceil(srt.length * 0.9) - 1)] : null };
}
// 逆行セクション本体。cutOf(r)=各記録の採用損切り値。表示色は「深いほど赤」＝損益色(_elPnlColor: 赤=利益)とは意味が逆なので絶対に流用しない。
function _elStopMaeSectionV2(entered, aiOf) {
  var _cutOf = function(r) { var c = aiOf(r).cutLine; return c != null ? c : 15; };
  var _cuts = {}; (entered || []).forEach(function(r) { _cuts[_cutOf(r)] = 1; });
  var _cutKeys = Object.keys(_cuts).map(Number).sort(function(a, b) { return a - b; });
  var _cutLbl = _cutKeys.length === 1 ? (_cutKeys[0] + "円") : (_cutKeys[0] + "〜" + _cutKeys[_cutKeys.length - 1] + "円");
  // 母数は各記録の採用損切り値で評価（記録ごとにcutが違ってもよい）
  var rows = [], stopN = 0;
  (entered || []).forEach(function(r) {
    var s = r.signal, a = aiOf(r).alpha; if (a == null) return;
    var C = _cutOf(r);
    var v = _elRideVals(s, a, C);
    if (!v) return;
    if (v.stopped) { stopN++; return; }
    if (v.mx == null) return;
    var mae = Math.round((v.mx - a) * 10) / 10; if (mae < 0) mae = 0;
    var L = _epHoldLadder(s, a, C);
    rows.push({ r: r, s: s, a: a, cut: C, mae: mae, pnl: (L ? L.finalPnl : null), lbl: v.lbl, exitD: v.exitD, margin: Math.round((C - mae) * 10) / 10 });
  });
  if (!rows.length) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "損切りを免れた記録がありません（E成立 " + (entered || []).length + "件・うち損切り " + stopN + "件）");
  var arr = rows.map(function(o) { return o.mae; });
  var srt = arr.slice().sort(function(x, y) { return x - y; });
  var maxMae = srt[srt.length - 1], meanMae = _elMean(arr), medMae = _elMedian(arr);
  var minCut = _cutKeys[0];
  var floorCut = Math.round((maxMae + 1) * 10) / 10;   // 詰められる下限
  var canTighten = floorCut < minCut;
  var _thin = rows.length < _EL_BASE_MIN_N;   // 薄い標本＝推奨を出さず参考表示（★選定の件数フロアに合わせる）
  var cards = _elv2CardRow([
    _elv2Card("損切りを免れた", rows.length + "件", "#9A3412", "E成立" + (entered || []).length + "件中・損切り" + stopN + "件"),
    _elv2Card("逆行（平均/中央）", "平均" + meanMae + " / 中央" + medMae + "円", "#555", "EP足〜手じまい足の最高値−α"),
    _elv2Card("最悪逆行", maxMae + "円", (minCut - maxMae) <= 2 ? "#C0392B" : "#B45309", "この母数でギリギリ生き残った深さ"),
    _elv2Card("詰められる下限", _thin ? "—（参考）" : (canTighten ? floorCut + "円" : "—"), _thin ? "#94A3B8" : (canTighten ? "#1E8449" : "#94A3B8"),
      _thin ? "件数" + _EL_BASE_MIN_N + "件未満＝判断保留" : (canTighten ? ("現在 " + _cutLbl + " → −" + Math.round((minCut - floorCut) * 10) / 10 + "円") : "既に最小（余地なし）"))
  ]);
  // 分布（浅い→深い）。深いほど赤＝損切りに近かった。
  var BK = [[0, 0, "0"], [0.1, 2, "1-2"], [2.1, 4, "3-4"], [4.1, 6, "5-6"], [6.1, 9, "7-9"], [9.1, 9999, "10+"]];
  var cum = 0;
  var distRows = BK.map(function(b) {
    var cnt = arr.filter(function(v) { return v >= b[0] && v <= b[1]; }).length;
    return { lbl: b[2], cnt: cnt, lo: b[0] };
  }).filter(function(b) { return b.cnt > 0; }).map(function(b) {
    cum += b.cnt;
    var _c = cum;
    return React.createElement("tr", { key: b.lbl },
      _elv2Td(React.createElement("b", { style: { color: b.lo >= 6.1 ? "#C0392B" : b.lo >= 2.1 ? "#B45309" : "#555" } }, b.lbl + "円"), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(b.cnt + "件"),
      _elv2Td(_elv2Rate(b.cnt, rows.length)),
      _elv2Td(React.createElement("span", { style: { color: "#64748B" } }, Math.round(_c / rows.length * 100) + "%")));
  });
  var distTbl = _elv2Table(["逆行(円)", "件数", "構成比", "累積"], distRows);
  // 個別（深い順＝損切りに一番近かった順）
  var top = rows.slice().sort(function(x, y) { return y.mae - x.mae; });
  var _detRow = function(o, i) {
    return React.createElement("tr", { key: i },
      _elv2Td(React.createElement("span", { style: { fontWeight: 700, color: "#9A3412" } }, (o.r.date || "").slice(5)), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(React.createElement("span", { style: { color: "#555" } }, o.r.stock), { textAlign: "left" }),
      _elv2Td(React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, o.a + " / " + o.cut + "円")),
      _elv2Td(React.createElement("b", { style: { color: o.margin <= 2 ? "#C0392B" : o.margin <= 4 ? "#B45309" : "#555" } }, "+" + o.mae + "円")),
      _elv2Td(React.createElement("span", { style: { color: o.margin <= 2 ? "#C0392B" : "#94A3B8", fontWeight: o.margin <= 2 ? 700 : 400 } }, "残" + o.margin + "円")),
      _elv2Td(React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, o.lbl + "・" + o.exitD + "分")),
      _elv2Td(React.createElement("b", { style: { color: _elPnlColor(o.pnl) } }, _elPnlFmt(o.pnl != null ? Math.round(o.pnl) : null))));
  };
  var detTbl = _elv2Table(["日付", "銘柄", "α/損切", "逆行(円)", "損切りまで", "手じまい", "最終損益(100株)"], top.map(_detRow));
  var nearN = rows.filter(function(o) { return o.margin <= 2; }).length;
  var items = [
    React.createElement("span", null, "損切りを免れた", _elInsightEmV2(rows.length + "件"), "の逆行は平均", _elInsightEmV2(meanMae + "円"), "・中央", _elInsightEmV2(medMae + "円"), "・最悪", _elInsightEmV2(maxMae + "円", "#C0392B"), "。"),
    (!_thin && canTighten)
      ? React.createElement("span", null, "損切り値", _elInsightEmV2(_cutLbl), "に対し最悪でも", _elInsightEmV2(maxMae + "円"), "で収まっている＝", _elInsightEmV2(floorCut + "円まで詰めても"), "この母数では損切り率も生存側の損益も1円も変わらず、", _elInsightEmV2("損切りになった記録の負け額は縮むか同額（悪化しない）", "#1E8449"), "。")
      : (_thin
        ? React.createElement("span", null, "件数が", _elInsightEmV2(_EL_BASE_MIN_N + "件未満"), "のため「詰められる下限」は参考値（最悪値は1件の外れ値で簡単に動く）。")
        : React.createElement("span", null, "最悪逆行が損切り値に肉薄＝", _elInsightEmV2("詰める余地なし"), "。")),
    nearN ? React.createElement("span", null, "損切りまで残り2円以内まで踏まれた記録が", _elInsightEmV2(nearN + "件", "#C0392B"), "＝ここを詰めると真っ先にこれが損切りに変わる。") : null,
    (meanMae != null && minCut > 0 && (meanMae / minCut) >= 0.6)
      ? React.createElement("span", null, "平均逆行が損切り値の", _elInsightEmV2(Math.round(meanMae / minCut * 100) + "%"), "＝場が荒く、EPからほぼ毎回ライン近くまで踏まれている。詰める余地は小さい。") : null
  ].filter(Boolean);
  return React.createElement("div", null, cards,
    React.createElement("div", { style: { marginTop: 10 } }, distTbl),
    React.createElement("div", { style: { marginTop: 10 } },
      React.createElement(_SNCollapse, { title: "📋 個別（逆行の深い順・" + rows.length + "件）", render: function() { return React.createElement("div", { style: { maxHeight: 320, overflowY: "auto" } }, detTbl); } })),
    React.createElement("div", { style: { marginTop: 8 } },
      _elInsightBoxV2(items, { note: "対象＝E成立(judge ok)のEP起算v2記録のうち、採用α・採用損切り値で**損切りにならなかった**もの（" + rows.length + "件／損切り " + stopN + "件）。逆行＝EP足〜手じまい足の高値の最大 − α（水準線比の円・100株換算ではない・**損益ではないので深いほど赤**）。手じまい足＝次足期待度×/未設定で降りた足＝記録表の「最終損益・詳細」「保有」列と同基準。※上の「損切り回数」カードとこの「損切り" + stopN + "件」は基準が違う（カードは期待度キャップ無しで損切りラインへの接触を数え、こちらは期待度×で先に降りた後の接触は『免れた』側に数える）ため一致しないことがある。損切りになった記録は下の『📐 損切りの上振れ』が担当（そちらの超過幅は全足の非キャップ最高値基準＝母数も物差しも別）。「詰められる下限」はこの標本の実績値＝将来これを超える逆行が出る可能性は排除できない。" })));
}
function _elStopOvershootSectionV2(recs, aiOf) {
  var BIG = 99999;
  var rows = [];
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s || !_epIsV2(s)) return;
    var ai = aiOf(r), a = ai.alpha, cut = (ai.cutLine != null ? ai.cutLine : 15);
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
      actual: Lc.finalPnl, held: _elRuleHoldPnl(s, a), best: Lb.maxPnl,
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
  return React.createElement("div", null, cards, distTable, listTable, _elInsightBoxV2(items, { note: "対象＝実現結果が「損切り」のEP起算(v2)記録。超過幅＝最高値(水準線比)−(α＋損切り値)。損切り損失＝損切りラインで止めた損益(_epHoldLadder・採用α基準・100株換算)。保有なら＝損切りせず実運用ルール（確定値が前の足より悪化したらその足の確定値で手仕舞い・悪化しなければ最後まで保有）で降りた損益（2026-07-13変更・旧=無条件で最後の足まで）、ベスト＝損切り後の各足で最も良い手仕舞い(maxPnl)。改善額＝保有なら−損切り損失。損益色は赤=利益/緑=損失。" }));
}

// ===== 損切りの分析（記録帳・銘柄別タブ「🛑損切り」／2026-06-22）=====
// エントリー成立(E成立=judge"ok")記録の損切りを多角的に分析。recs=対象v2記録・aiOf=α情報・data。
// ①損切りサマリー ②損切り値(cutLine)別シミュ＝全記録に同じ損切り値を当てた損切り回数/率・最終損益（★=最終損益最大の損切り値＝意思決定表・2026-07-09 EP/H1列廃止） ③損切りの上振れ・早すぎ検証(_elStopOvershootSectionV2を移設) ④シグナル別の損切り率。
function _elStopTabSectionV2(recs, aiOf, data, hideSig) {
  aiOf = aiOf || function(r) { return _elAlphaInfo(r, data); };
  var BIG = 99999;
  var _h = function(t, sub) {
    return React.createElement("div", { style: { margin: "14px 0 6px" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, t),
      (sub && typeof sub === "string" && sub.indexOf("※") === 0) ? React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginTop: 2 } }, sub) : null);   // 見出し下の定型説明は非表示・※で始まる注記/補足のみ残す 2026-07-03
  };
  var _sigOf = function(s) {
    var tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
    return tags.length ? tags : ["(未設定)"];
  };
  var _isStop = function(s, a, c) { return _elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || _elHoldIsStop2(s, a, c); };
  var rs = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal); });
  var entered = rs.filter(function(r) { var a = aiOf(r).alpha; if (a == null) return false; var rr = _epResolve(r.signal, a); return !!(rr && rr.judge === "ok"); });
  if (!entered.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "18px 0", fontSize: 12 } }, "エントリー成立（E成立）のv2記録がありません。損切り分析はエントリーできた記録が対象です。");

  // ① サマリー
  var ss = _elStopStatsV2(rs, data);
  var enteredStopN = 0, lossArr = [], savedArr = [];
  entered.forEach(function(r) {
    var s = r.signal, a = aiOf(r).alpha, c = aiOf(r).cutLine;
    if (!_isStop(s, a, c)) return;
    enteredStopN++;
    var Lc = _epHoldLadder(s, a, c), _rh = _elRuleHoldPnl(s, a);
    if (Lc && Lc.finalPnl != null) { lossArr.push(Lc.finalPnl); if (_rh != null) savedArr.push(_rh - Lc.finalPnl); }
  });
  var stopRate = entered.length ? Math.round(enteredStopN / entered.length * 100) : 0;
  var lossTotal = lossArr.reduce(function(a, b) { return a + b; }, 0);
  var stopBreak = [ss.plan ? ("想" + ss.plan) : null, ss.h1 ? ("H1 " + ss.h1) : null, ss.h2 ? ("H2 " + ss.h2) : null].filter(Boolean).join("・") || "内訳なし";
  var cards = _elv2CardRow([
    _elv2Card("損切り回数", enteredStopN + "回", enteredStopN > 0 ? "#1E8449" : "#bbb", stopBreak),
    _elv2Card("損切り率", stopRate + "%", stopRate >= 30 ? "#C0392B" : stopRate >= 15 ? "#B45309" : "#1E8449", "E成立" + entered.length + "件中"),
    _elv2Card("損切り損失 合計", _elPnlFmt(lossArr.length ? Math.round(lossTotal) : null), _elPnlColor(lossArr.length ? lossTotal : null), lossArr.length + "件"),
    _elv2Card("平均損切り額", _elPnlFmt(lossArr.length ? Math.round(_elMean(lossArr)) : null), _elPnlColor(lossArr.length ? _elMean(lossArr) : null), "1件あたり")
  ]);

  // ② 損切り値別シミュ
  var cuts = [5, 8, 10, 12, 15, 20];
  var sim = cuts.map(function(C) {
    var sN = 0;
    entered.forEach(function(r) { if (_isStop(r.signal, aiOf(r).alpha, C)) sN++; });
    var t = _elTotAccum(rs, { signal: function(r) { return r.signal; }, alpha: function(r) { return aiOf(r).alpha; }, cut: function() { return C; }, real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; } });
    return { cut: C, sN: sN, rate: entered.length ? sN / entered.length : 0, h2: t.hold2 };
  });
  var bestI = 0; sim.forEach(function(x, i) { if (x.h2 > sim[bestI].h2) bestI = i; });
  // 2026-07-16f: 各損切り値での「生存側の逆行」を併記＝その損切り値がどれだけ余裕を持って生き残らせているか。
  // 最悪逆行は cut が広いほど単調非減少になるはず（広い＝生存者が増える＝より深い逆行が母数に入る）＝逆転したらバグの検算になる。
  var simM = cuts.map(function(C) { return _elMaeStats(entered, aiOf, C); });
  var simTbl = _elv2Table(["損切り値", "損切り回数", "損切り率", "最終損益", "平均逆行", "最悪逆行"], sim.map(function(x, i) {
    return React.createElement("tr", { key: x.cut, style: i === bestI ? { background: "#FEF3C7" } : null },
      _elv2Td(React.createElement("span", null, x.cut + "円", i === bestI ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", fontWeight: 800, marginLeft: 4 } }, "★手じまい最大") : null), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _elv2Td(x.sN + "回"),
      _elv2Td(_elStopRateCell(x.rate)),
      _elv2Td(React.createElement("b", { style: { color: _elPnlColor(x.h2) } }, _elPnlFmt(Math.round(x.h2)))),
      _elv2Td(simM[i].mean != null ? React.createElement("span", { style: { color: "#555" } }, simM[i].mean + "円") : "—"),
      _elv2Td(simM[i].max != null ? React.createElement("b", { style: { color: (x.cut - simM[i].max) <= 2 ? "#C0392B" : "#555" } }, simM[i].max + "円") : "—"));
  }));

  // ④ シグナル別 損切り率
  var sigMap = {};
  entered.forEach(function(r) {
    var s = r.signal, a = aiOf(r).alpha, c = aiOf(r).cutLine, stopped = _isStop(s, a, c), loss = null;
    if (stopped) { var L = _epHoldLadder(s, a, c); if (L && L.finalPnl != null) loss = L.finalPnl; }
    _sigOf(s).forEach(function(tg) { if (!sigMap[tg]) sigMap[tg] = { tot: 0, stop: 0, loss: [] }; sigMap[tg].tot++; if (stopped) { sigMap[tg].stop++; if (loss != null) sigMap[tg].loss.push(loss); } });
  });
  var sigArr = Object.keys(sigMap).map(function(k) { var v = sigMap[k]; return { tag: k, tot: v.tot, stop: v.stop, rate: v.stop / v.tot, lossAvg: _elMean(v.loss) }; }).sort(function(a, b) { return b.rate - a.rate || b.stop - a.stop; });
  var sigTbl = _elv2Table(["シグナル", "E成立", "損切り", "損切り率", "平均損切り額"], sigArr.map(function(x, i) {
    return React.createElement("tr", { key: i },
      _elv2Td(stripCat(x.tag), { textAlign: "left" }),
      _elv2Td(x.tot + "件"),
      _elv2Td(x.stop + "件", { color: x.stop > 0 ? "#1E8449" : "#bbb" }),
      _elv2Td(_elStopRateCell(x.rate)),
      _elv2Td(x.lossAvg != null ? React.createElement("span", { style: { color: _elPnlColor(x.lossAvg) } }, _elPnlFmt(Math.round(x.lossAvg))) : React.createElement("span", { style: { color: "#ccc" } }, "—")));
  }));

  // ⑤ 理想損切り値（あと何円広げれば回避できたか）: 損切りした記録ごとに、損切り値を最小いくつまで広げれば損切りを回避できたか＋その時の保有損益。
  var avRows = [];
  entered.forEach(function(r) {
    var s = r.signal, a = aiOf(r).alpha, c = aiOf(r).cutLine;
    if (!_isStop(s, a, c)) return;
    var Lc = _epHoldLadder(s, a, c), loss = (Lc ? Lc.finalPnl : null), avoid = null;
    for (var C = c + 1; C <= 40; C++) { if (!_isStop(s, a, C)) { avoid = C; break; } }
    var avPnl = null;
    if (avoid != null) avPnl = _elRuleHoldPnl(s, a);   // 広げて損切りを回避した場合の着地＝保有ならと同じ実運用ルール（確定値悪化で手仕舞い）2026-07-13
    avRows.push({ cut: c, avoid: avoid, inc: (avoid != null ? avoid - c : null), loss: loss, avPnl: avPnl });
  });
  var avDefs = [{ lim: 2, label: "+1〜2円" }, { lim: 5, label: "+3〜5円" }, { lim: 10, label: "+6〜10円" }, { lim: Infinity, label: "+11円〜" }];
  var avBk = avDefs.map(function(d) { return { label: d.label, lim: d.lim, cnt: 0, loss: 0, av: 0 }; });
  var avUn = { cnt: 0, loss: 0 };
  avRows.forEach(function(o) {
    if (o.inc == null) { avUn.cnt++; if (o.loss != null) avUn.loss += o.loss; return; }
    for (var i = 0; i < avBk.length; i++) { if (o.inc <= avBk[i].lim) { avBk[i].cnt++; if (o.loss != null) avBk[i].loss += o.loss; if (o.avPnl != null) avBk[i].av += o.avPnl; break; } }
  });
  var _avp = function(v) { return React.createElement("span", { style: { color: _elPnlColor(v) } }, _elPnlFmt(Math.round(v))); };
  var avTblRows = avBk.filter(function(b) { return b.cnt; }).map(function(b, i) {
    return React.createElement("tr", { key: i },
      _elv2Td(b.label, { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _elv2Td(b.cnt + "件", { fontWeight: 700 }),
      _elv2Td(_avp(b.loss)),
      _elv2Td(React.createElement("b", null, _avp(b.av))),
      _elv2Td(React.createElement("b", { style: { color: _elPnlColor(b.av - b.loss) } }, (b.av - b.loss > 0 ? "+" : "") + Math.round(b.av - b.loss).toLocaleString() + "円")));
  });
  if (avUn.cnt) avTblRows.push(React.createElement("tr", { key: "un", style: { background: "#FBFBF9" } },
    _elv2Td("回避不能（+40円超）", { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#6B7280" }),
    _elv2Td(avUn.cnt + "件", { fontWeight: 700 }),
    _elv2Td(_avp(avUn.loss)),
    _elv2Td(React.createElement("span", { style: { color: "#ccc" } }, "—")),
    _elv2Td(React.createElement("span", { style: { color: "#ccc" } }, "—"))));
  var avTbl = avRows.length
    ? _elv2Table(["必要な引き上げ", "件数", "実損失(計)", "広げて保有なら(計)", "改善(計)"], avTblRows)
    : React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "損切りになった記録がありません");
  var avAvoidable = avRows.filter(function(o) { return o.avoid != null; });
  var avIncMean = avAvoidable.length ? _elMean(avAvoidable.map(function(o) { return o.inc; })) : null;
  var avImpTotal = 0; avBk.forEach(function(b) { avImpTotal += (b.av - b.loss); });

  // ⑥ 損切り vs ×見送り 比較: 入って損切りした記録 vs 事前に×宣言して見送った（α到達）記録の精度。×を_epAsTradedで「取引していたら」のEP損益化。
  var xRecs = rs.filter(function(r) { return _epIsXSkip(r.signal, aiOf(r).alpha); });
  var xMissCnt = 0, xMissSum = 0, xAvoidCnt = 0, xAvoidSum = 0;
  xRecs.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), tr = _epAsTraded(s), ep = _elDynPlanned(tr, ai.alpha, ai.cutLine);
    if (ep == null) return;
    if (ep > 0) { xMissCnt++; xMissSum += ep; } else if (ep < 0) { xAvoidCnt++; xAvoidSum += ep; }
  });
  var xDecided = xMissCnt + xAvoidCnt, xAcc = xDecided ? Math.round(xAvoidCnt / xDecided * 100) : null;
  var xCompare = React.createElement(React.Fragment, null,
    _elv2CardRow([
      _elv2Card("入って損切り", enteredStopN + "件", "#9A3412", "損失計 " + _elPnlFmt(Math.round(lossTotal))),
      _elv2Card("×で見送り", xRecs.length + "件", "#9A3412", "×宣言後にα到達"),
      _elv2Card("×=損失回避", xAvoidCnt + "件", xAvoidCnt ? "#1E8449" : "#bbb", xAvoidSum ? "避けた損失 " + Math.round(xAvoidSum).toLocaleString() + "円" : "—"),
      _elv2Card("×=機会損失", xMissCnt + "件", xMissCnt ? "#C0392B" : "#bbb", xMissSum ? "逃した利益 +" + Math.round(xMissSum).toLocaleString() + "円" : "—"),
      _elv2Card("×見送り正解率", xAcc != null ? xAcc + "%" : "—", xAcc != null ? (xAcc >= 50 ? "#1E8449" : "#B45309") : "#bbb", "損失回避/" + xDecided + "件")
    ]),
    xRecs.length ? null : React.createElement("div", { style: { color: "#bbb", fontSize: 11, padding: "4px 0" } }, "※ ×見送り（期待度×を宣言した後にα到達）の記録がまだありません。"));

  // 読み取り
  var best = sim[bestI], savedTotal = savedArr.reduce(function(a, b) { return a + b; }, 0);
  var worstSig = sigArr.filter(function(x) { return x.tot >= 2 && x.stop > 0; })[0];
  var insight = _elInsightBoxV2([
    React.createElement("span", null, "E成立 ", _elInsightEmV2(entered.length + "件"), " のうち損切り ", _elInsightEmV2(enteredStopN + "件（" + stopRate + "%）"), "・損失合計 ", _elInsightEmV2(_elPnlFmt(Math.round(lossTotal))), "。"),
    React.createElement("span", null, "損切り値を ", _elInsightEmV2(best.cut + "円"), " にすると最終損益が最大（", _elInsightEmV2(_elPnlFmt(Math.round(best.h2))), "・損切り率 ", _elInsightEmV2(Math.round(best.rate * 100) + "%"), "）。狭め＝損切り増・浅い損失／広め＝損切り減・大きい損失のトレードオフ。"),
    savedArr.length ? React.createElement("span", null, "損切りした記録を損切りせず保有していたら合計 ", _elInsightEmV2(_elPnlFmt(Math.round(savedTotal)), savedTotal > 0 ? "#B45309" : "#1E8449"), " の差（プラス＝我慢した方が良かった／マイナス＝損切りが正解）。詳細は下の「上振れ」分析。") : null,
    worstSig ? React.createElement("span", null, "損切り率が高いシグナルは ", _elInsightEmV2("「" + stripCat(worstSig.tag) + "」（" + Math.round(worstSig.rate * 100) + "%・" + worstSig.stop + "/" + worstSig.tot + "件）"), "。") : null,
    xDecided ? React.createElement("span", null, "事前の×見送りは ", _elInsightEmV2(xRecs.length + "件"), "・正解率 ", _elInsightEmV2(xAcc + "%"), "（損失回避 ", _elInsightEmV2(xAvoidCnt + "件"), "／機会損失 ", _elInsightEmV2(xMissCnt + "件"), "）＝", _elInsightEmV2(xAcc >= 50 ? "損切りを避ける×判断は機能している" : "×判断はやや保守的（利益も逃している）"), "。") : null
  ], { note: "対象＝E成立（エントリーできた）v2記録 " + entered.length + "件。損切り＝想定/H1/H2いずれかで損切りライン（高値−α≥損切り値）到達。損切り値別シミュは全記録に同じ損切り値を当てた場合の合計（採用α基準・100株換算・損益色は赤=利益/緑=損失）。×見送り＝事前に期待度×を宣言した後にα到達した記録を「取引していたら」のEP損益で評価。" });

  return React.createElement(React.Fragment, null,
    cards,
    React.createElement("div", { style: { margin: "8px 0" } },
      React.createElement(_SNCollapse, { title: "📋 対象記録（E成立 " + entered.length + "件・タップで展開）", render: function() {
        return React.createElement("div", { style: { maxHeight: 320, overflowY: "auto" } }, _elOsTradeMini(entered, aiOf, { plain: true }));
      } })),
    _h("🎚 損切り値の最適化（損切り値別シミュ）", "※全記録に同じ損切り値を当てたときの損切り回数・最終損益（★=最終損益が最大）。逆行＝その損切り値で生き残った取引が踏まれた深さ＝損切り値との差が余裕。損益色は赤=利益だが、逆行は損益ではなく深いほど悪い（赤=損切りに肉薄）"),
    simTbl,
    _h("📉 逆行（MAE）＝損切りを免れた取引は何円踏まれたか", "※対象＝採用損切り値で損切りにならなかった取引。最悪逆行＋1円がその損切り値を詰められる下限（この母数では損切り率も生存側の損益も変わらず、損切り組の負け額は縮むか同額）"),
    _elStopMaeSectionV2(entered, aiOf),
    _h("📐 損切りの上振れ・早すぎ検証", "損切りラインを何円超えて伸びたか＋損切りせず保有/最良手仕舞いなら何円だったか＝損切りが早すぎないかの検証"),
    _elStopOvershootSectionV2(rs, aiOf),
    hideSig ? null : _h("🎯 シグナル別 損切り率", "どのシグナルが損切りになりやすいか（損切り率の高い順・平均損切り額）。複数タグは各タグに算入"),
    hideSig ? null : sigTbl,
    _h("🆚 損切り vs ×見送り（事前判断の精度）", "入って損切りした記録と、事前に期待度×で見送った（α到達）記録の比較。×が損失回避なら事前判断が機能・機会損失が多ければ保守的すぎ"),
    xCompare,
    insight);
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
    var _ov = _elOsMaxAll(s); if (_ov != null) o.osv.push(_ov);
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
    var byWin = avail.filter(function(x) { return (x.o.ok + x.o.ng + x.o.draw) > 0; }).sort(function(a, b) { return (b.o.ok / (b.o.ok + b.o.ng + b.o.draw)) - (a.o.ok / (a.o.ok + a.o.ng + a.o.draw)); });
    if (byWin.length) {
      var bw = byWin[0], ww = byWin[byWin.length - 1];
      items.push(React.createElement("span", null, "勝率が最も高いのは", _elInsightEmV2(bw.d.label + "曜"), "（", _elInsightEmV2(Math.round(bw.o.ok / (bw.o.ok + bw.o.ng + bw.o.draw) * 100) + "%"), "）", (ww !== bw) ? React.createElement("span", null, "・最も低いのは", _elInsightEmV2(ww.d.label + "曜"), "（" + Math.round(ww.o.ok / (ww.o.ok + ww.o.ng + ww.o.draw) * 100) + "%）") : null, "。"));
    }
    var byEp = avail.filter(function(x) { return x.o.planCnt > 0; }).sort(function(a, b) { return (b.o.plan / b.o.planCnt) - (a.o.plan / a.o.planCnt); });
    if (byEp.length) items.push(React.createElement("span", null, "1件あたり平均EP損益が最良の曜日は", _elInsightEmV2(byEp[0].d.label + "曜"), "（", _elInsightEmV2(_elPnlFmt(Math.round(byEp[0].o.plan / byEp[0].o.planCnt))), "）。"));
    var byStop = avail.filter(function(x) { return x.o.cnt >= 2; }).sort(function(a, b) { return (b.o.stop / ((b.o.ok + b.o.ng + b.o.draw) || 1)) - (a.o.stop / ((a.o.ok + a.o.ng + a.o.draw) || 1)); });
    if (byStop.length && byStop[0].o.stop > 0) items.push(React.createElement("span", null, "損切り率が最も高いのは", _elInsightEmV2(byStop[0].d.label + "曜"), "（" + Math.round(byStop[0].o.stop / ((byStop[0].o.ok + byStop[0].o.ng + byStop[0].o.draw) || 1) * 100) + "%）＝この曜日は慎重に。"));
  }
  return React.createElement("div", null, bar, tbl, items.length ? _elInsightBoxV2(items, { note: "曜日は記録日付から算出。OS値=寄り足の高値（水準線比）の中央値（主）と平均（副）を併記（OS値は右偏なので典型値は中央値）／E到達率=3本以内にα到達（×見送り含む）／E後の勝率=エントリー（E成立）後にEP損益が利益だった割合（敗率・未達率はE到達率の裏返しなので省略）／損切り率=想定orH1orH2で損切り発生。EP/H1損益はE成立（エントリーできた）分のみの平均＋合計。未達（α未到達）・×見送りは母数に含めない。採用α基準。" }) : null);
}

// ===== 未達記録の分析（記録帳・銘柄別タブ「未達」／2026-06-22）=====
// αに3本以内（OS1〜OS3）で届かずエントリーできなかった記録（_epResolve judge==="miss"・×見送りは除く）の詳細分析。
// ①OS1〜3最高値の分布＋一覧 ②α不足額（α−最高値）の分布 ③α下げシミュ（何円下げれば救えたか） ④シグナル別の未達率。
// recs=対象v2記録（銘柄スコープ）・aiOf=α情報(_elAlphaInfo)。
function _elMissSectionV2(recs, aiOf, hideSig) {
  aiOf = aiOf || function(r) { return _elAlphaInfo(r, null); };
  var _h = function(t, sub) {
    return React.createElement("div", { style: { margin: "14px 0 6px" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, t),
      (sub && typeof sub === "string" && sub.indexOf("※") === 0) ? React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginTop: 2 } }, sub) : null);   // 見出し下の定型説明は非表示・※で始まる注記/補足のみ残す 2026-07-03
  };
  var _msg = function(m, ok) { return React.createElement("div", { style: { color: ok ? "#065F46" : "#bbb", textAlign: "center", padding: "16px 12px", fontSize: 12.5, fontWeight: ok ? 700 : 400, background: ok ? "#ECFDF5" : "transparent", border: ok ? "1px solid #A7F3D0" : "none", borderRadius: 8 } }, m); };
  var _sigOf = function(s) {
    var tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
    return tags.length ? tags : ["(未設定)"];
  };
  var _osv = function(v) { return v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { color: v < 0 ? "#6B7280" : "#555" } }, v + "円"); };
  var _bar = function(w, col, full) { return React.createElement("div", { style: { background: "#eee", borderRadius: 3, height: 8, width: full } }, React.createElement("div", { style: { background: col, height: 8, borderRadius: 3, width: Math.round(w) + "px" } })); };
  // 収集
  var base = [], missAll = 0, miss = [];
  (recs || []).forEach(function(r) {
    var s = r.signal, a = aiOf(r).alpha;
    if (a == null || a === "") return;
    var rr = _epResolve(s, a);
    if (!rr) return;
    base.push(r);
    if (rr.judge !== "miss") return;
    missAll++;
    var hs = _elOscHighs(s), o3 = [hs[0], hs[1], hs[2]].filter(function(v) { return v != null; });
    if (!o3.length) return;
    var mx = Math.max.apply(null, o3);
    miss.push({ date: r.date, alpha: a, os1: hs[0], os2: hs[1], os3: hs[2], mx: mx, short: Math.round((a - mx) * 10) / 10, tags: _sigOf(s) });
  });
  if (!base.length) return _msg("EP起算（v2）の記録がありません");
  if (!missAll) return _msg("🎉 未達はありません（このスコープの" + base.length + "件はすべてαに到達）", true);
  if (!miss.length) return _msg("未達は" + missAll + "件ありますが、OS値が未入力のため詳細分析できません");
  var n = base.length, anal = miss.length;
  var mxVals = miss.map(function(m) { return m.mx; }), shVals = miss.map(function(m) { return m.short; });
  var mxMed = _elMedian(mxVals), mxMean = _elMean(mxVals), shMed = _elMedian(shVals), shMean = _elMean(shVals);
  var negN = miss.filter(function(m) { return m.mx < 0; }).length;
  var missRate = missAll / n;

  var _cards = _elv2CardRow([
    _elv2Card("未達件数", missAll + "件", "#C0392B", "全" + n + "件中"),
    _elv2Card("未達率", Math.round(missRate * 100) + "%", missRate >= 0.4 ? "#C0392B" : missRate >= 0.2 ? "#B45309" : "#1E8449"),
    _elv2Card("OS1〜3最高値 中央", (mxMed != null ? mxMed : "—") + "円", "#9A3412", "平均 " + (mxMean != null ? mxMean : "—") + "円"),
    _elv2Card("α不足額 中央", (shMed != null ? shMed : "—") + "円", "#0369A1", "平均 " + (shMean != null ? shMean : "—") + "円")
  ]);

  // ① 最高値の1円刻み分布（0〜4と25〜は帯・下落=グレー）2026-06-25
  var _distTbl = React.createElement("div", null,
    React.createElement(_elOsHistV2, { vals: miss.map(function(m) { return m.mx; }), includeNeg: true }),
    React.createElement("div", { style: { marginTop: 6 } }, _elOsGradLegend()));

  // ② α不足額の分布
  var shDefs = [{ lim: 1, label: "1円以下" }, { lim: 2, label: "1〜2円" }, { lim: 3, label: "2〜3円" }, { lim: 4, label: "3〜4円" }, { lim: 5, label: "4〜5円" }, { lim: Infinity, label: "5円超" }];
  var shCnt = shDefs.map(function() { return 0; });
  miss.forEach(function(m) { for (var i = 0; i < shDefs.length; i++) { if (m.short <= shDefs[i].lim) { shCnt[i]++; break; } } });
  var shMaxC = Math.max.apply(null, shCnt.concat([1]));
  var _shTbl = _elv2Table(["α不足額", "件数", "割合", "分布"], shDefs.map(function(b, i) {
    return React.createElement("tr", { key: i },
      _elv2Td(b.label, { textAlign: "left", fontWeight: 700 }),
      _elv2Td(shCnt[i] + "件"),
      _elv2Td(Math.round(shCnt[i] / anal * 100) + "%"),
      _elv2Td(_bar(shCnt[i] / shMaxC * 90, "#0369A1", 90), { textAlign: "left", width: 100 }));
  }));

  // 一覧（惜しい順＝α不足額の小さい順）
  var _listTbl = _elv2Table(["日付", "シグナル", "α", "OS1", "OS2", "OS3", "最高値", "不足"], miss.slice().sort(function(a, b) { return a.short - b.short; }).map(function(m, i) {
    return React.createElement("tr", { key: i },
      _elv2Td(m.date.slice(5), { textAlign: "left", whiteSpace: "nowrap", color: "#888" }),
      _elv2Td(stripCat(m.tags[0]) + (m.tags.length > 1 ? " 他" : ""), { textAlign: "left" }),
      _elv2Td(m.alpha + "円", { color: "#0369A1", fontWeight: 700 }),
      _elv2Td(_osv(m.os1)), _elv2Td(_osv(m.os2)), _elv2Td(_osv(m.os3)),
      _elv2Td(React.createElement("b", { style: { color: m.mx < 0 ? "#6B7280" : "#9A3412" } }, m.mx + "円")),
      _elv2Td(React.createElement("b", { style: { color: "#0369A1" } }, m.short + "円")));
  }));

  // ③ α下げシミュ
  var _simTbl = _elv2Table(["α下げ幅", "救える件数", "累積%", "（未達中）"], [1, 2, 3, 4, 5].map(function(d) {
    var saved = miss.filter(function(m) { return m.short <= d; }).length;
    return React.createElement("tr", { key: d },
      _elv2Td("−" + d + "円", { fontWeight: 700, color: "#0369A1" }),
      _elv2Td(saved + "件"),
      _elv2Td(Math.round(saved / anal * 100) + "%", { fontWeight: 700, color: "#1E8449" }),
      _elv2Td(_bar(saved / anal * 110, "#1E8449", 110), { textAlign: "left", width: 120 }));
  }));

  // ④ シグナル別 未達率
  var sigMap = {};
  base.forEach(function(r) {
    var s = r.signal, a = aiOf(r).alpha, rr = _epResolve(s, a), isMiss = !!(rr && rr.judge === "miss");
    var sh = null;
    if (isMiss) { var hs = _elOscHighs(s), o3 = [hs[0], hs[1], hs[2]].filter(function(v) { return v != null; }); if (o3.length) sh = a - Math.max.apply(null, o3); }
    _sigOf(s).forEach(function(tg) {
      if (!sigMap[tg]) sigMap[tg] = { tot: 0, miss: 0, sh: [] };
      sigMap[tg].tot++;
      if (isMiss) { sigMap[tg].miss++; if (sh != null) sigMap[tg].sh.push(sh); }
    });
  });
  var sigArr = Object.keys(sigMap).map(function(k) { var v = sigMap[k]; return { tag: k, tot: v.tot, miss: v.miss, rate: v.miss / v.tot, shMed: _elMedian(v.sh) }; }).sort(function(a, b) { return b.rate - a.rate || b.miss - a.miss; });
  var _sigTbl = _elv2Table(["シグナル", "件数", "未達", "未達率", "不足中央"], sigArr.map(function(x, i) {
    return React.createElement("tr", { key: i },
      _elv2Td(stripCat(x.tag), { textAlign: "left" }),
      _elv2Td(x.tot + "件"),
      _elv2Td(x.miss + "件", { color: x.miss > 0 ? "#C0392B" : "#bbb" }),
      _elv2Td(_elStopRateCell(x.rate)),
      _elv2Td(x.shMed != null ? (Math.round(x.shMed * 10) / 10) + "円" : "—", { color: "#0369A1" }));
  }));

  // 読み取り
  var le1 = miss.filter(function(m) { return m.short <= 1; }).length;
  var le2 = miss.filter(function(m) { return m.short <= 2; }).length;
  var worst = sigArr.filter(function(x) { return x.tot >= 2 && x.miss > 0; })[0];
  var _insight = _elInsightBoxV2([
    React.createElement("span", null, "未達 ", _elInsightEmV2(missAll + "件"), "／全" + n + "件（未達率 ", _elInsightEmV2(Math.round(missRate * 100) + "%"), "）。OS1〜3最高値の中央値は ", _elInsightEmV2((mxMed != null ? mxMed : "—") + "円"), "、α不足額の中央値は ", _elInsightEmV2((shMed != null ? shMed : "—") + "円"), "。"),
    React.createElement("span", null, "α不足 ", _elInsightEmV2("1円以下 " + Math.round(le1 / anal * 100) + "%"), "・", _elInsightEmV2("2円以下 " + Math.round(le2 / anal * 100) + "%"), "＝その分αを下げていれば届いた水準（下げ過ぎは到達後の損切り増とのトレードオフに注意）。"),
    negN ? React.createElement("span", null, "最高値がマイナス（基準線割れ＝ほぼOSせず）が ", _elInsightEmV2(negN + "件（" + Math.round(negN / anal * 100) + "%）"), "＝α調整では救えない見立て外れ。") : null,
    worst ? React.createElement("span", null, "未達率が高いシグナルは ", _elInsightEmV2("「" + stripCat(worst.tag) + "」（" + Math.round(worst.rate * 100) + "%・" + worst.miss + "/" + worst.tot + "件）"), "＝だまし傾向かα過大の可能性。") : null
  ], { note: "未達＝OS1〜3の3本以内に高値がαへ一度も届かずエントリーできなかった記録（×見送りは除く・採用α基準）。詳細分析の母数は" + anal + "件（OS値入力あり）。最高値・OS値は水準線比（マイナス＝基準線割れ＝下落）。" });

  return React.createElement(React.Fragment, null,
    _cards,
    _h("📈 OS1〜3 最高値の分布", "未達記録が「どこまでオーバーシュートしたか」＝最高値の1円刻み件数（0〜4と25〜は帯）"),
    _distTbl,
    _h("📉 α不足額の分布（あと何円で届かなかったか）", "α − OS1〜3最高値。1〜2円が多いほど“あと少し”＝αが僅かに高い"),
    _shTbl,
    _h("📋 未達記録の一覧（惜しい順）", "α不足額の小さい順。OS1〜3の各高値・最高値・不足額"),
    _listTbl,
    _h("🔻 α下げシミュ（何円下げれば救えたか）", "αを各幅だけ下げていた場合、未達のうち何件がEP成立（最高値≥下げ後α）になったか（累積）"),
    _simTbl,
    hideSig ? null : _h("🎯 シグナル別 未達率", "このスコープのシグナル別。未達率が高い順（だまし／α過大の発見）。複数タグは各タグに算入"),
    hideSig ? null : _sigTbl,
    _insight);
}

// ===== 🧮 株数ラダー・シミュレーション 2026-07-03（α値タブ④）=====
// 「基本αを〇円で〇株、×円で×株から空売りしていたら、このシグナルで通算何円だったか」を記録ごとの内訳つきで試算。
// 確定仕様【2026-07-05累積方式を廃止】: 各取引の株数をそのまま空売り（取引={α,株数}・届いた取引だけ約定・合計=各取引の株数の総和＝第1取引100株＋第2取引400株なら500株）／手仕舞い=実際のH1（_elDynHold＝推奨基本α・追加α・%シミュと同一基準・損切りルール適用後）／
// 損切り=段ごと独立（各段は自分のαで建てた独立ショートとして記録の損切り値で評価）／×見送り(judge x)・H1判定不可の段は建てない=既存シミュの母数ルールと同じ。
// 「推奨α」基準＝その記録日時点の推奨基本α。日別ページ「今日の推奨」(_elBaseAlphaDayBlockV2の見出し)・記録フォームの推奨基本αと完全一致させる 2026-07-03t（ユーザー指摘＝シミュとの値ズレ修正）:
//   ①母数は呼び出し側で銘柄全体（全シグナル）を渡す＝記録フォーム/日別ページと同じ（旧: そのシグナルだけ=_selSigRecs）。
//   ②前日まで（look-ahead回避）を日付順に並べ、直近50→100→全期間の順で「最初に値が出た窓」(_elBaseAlphaA.pick.alpha!=null)を採用＝okを優先しない（日別ページと同じ「参考値でも直近50を先に採る」）。
function _elKabuRecoBaseFn(baseRecs, aiOf) {
  var cache = {};
  var _ent = function(dateStr) {
    if (!dateStr) return null;
    if (cache.hasOwnProperty(dateStr)) return cache[dateStr];
    var all = (baseRecs || []).filter(function(r) { return r && r.date && r.date < dateStr && _epIsV2(r.signal) && _elInclData(r.signal); });   // 分析母数（データ算入）2026-07-22f
    if (!all.length) { cache[dateStr] = null; return null; }
    var _byDate = all.slice().sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
    var _lastN = function(n) { return _byDate.length > n ? _byDate.slice(_byDate.length - n) : _byDate.slice(); };
    var cand = [_lastN(_EL_PERIOD_COUNTS[1]), _lastN(_EL_PERIOD_COUNTS[2]), all];   // 直近50件→100件→全期間（_elBaseAlphaDayBlockV2と同一）
    var ent = null;
    // 【2026-07-13 再構築】基本αは_elBaseAlphaPick（追加α計算を含まない）で窓ごとに直接算出＝内部で_elBaseAlphaAを呼ばない。
    // 理由: 推奨追加αが日付別方式(_elAddAlphaPickDate＝内部でrecoFnを使う)になったため、_elBaseAlphaA経由だと再帰爆発する。窓を保持しaddAtは遅延評価。
    for (var i = 0; i < cand.length && !ent; i++) { var p = _elBaseAlphaPick(cand[i], aiOf); if (p && p.alpha != null) ent = { a: p.alpha, w: cand[i], add: undefined }; }
    cache[dateStr] = ent;
    return ent;
  };
  var fn = function(dateStr) { var e = _ent(dateStr); return e ? e.a : null; };
  fn.specialAt = function(dateStr) {   // 記録日時点の推奨応用α（独立α値・無しはnull）2026-07-13 応用α化（旧 addAt＝増分から絶対値へ意味反転）
    var e = _ent(dateStr);
    if (!e) return null;
    if (e.add === undefined) {
      var pool = (e.w || []).filter(_elIsSpecialAlphaPoolRec);
      var pk = pool.length ? _elSpecialAlphaPick(pool, aiOf) : null;
      e.add = (pk && pk.status !== "none" && pk.alpha != null) ? pk.alpha : null;
      e.w = null;   // 窓の参照を解放
    }
    return e.add;
  };
  return fn;
}
// 1段（1建値）の評価。α<0は0にクランプ・cutLine未設定は10（※他所の既定は15＝_elPlanIsStop等。実際にはaiOf/_simCutOfが必ず数値を返すので到達しない）。
// 【2026-07-20b】損益は記録表/損益データ欄の「最終損益」と同一の期待度別算入（_elHold2TotParts＝（）外main/（）内ref）に統一。
//  旧＝_elHold1TotParts（H1基準）だったが、アプリ全体が2026-07-09〜07-13で最終損益へ移行し推奨α選定(_elBaseAlphaPick)も最終損益基準なのに、シミュだけH1で採点していた＝H2まで持った勝ちを取りこぼす構造的なズレだったため切替。
//  main100=（）外／ref100=（）内差分（△・損切り済のみ）。pnl100はmain100の別名（既存の（）外消費箇所と互換）。
// 返り値 { built, skip('unreached'|'x'|'noalpha'|null), pnl100/main100/ref100(100株換算・判定不可はnull), stop, indet, a(実効α) }。
function _elKabuTierEval(s, a, cut) {
  if (a == null || a === "" || isNaN(Number(a))) return { built: false, skip: "noalpha", pnl100: null, main100: null, ref100: null, stop: false, indet: false, a: null };
  var _a = Math.max(0, Math.round(Number(a)));
  var _cl = (cut != null && cut !== "" && !isNaN(Number(cut))) ? Number(cut) : 10;
  var rr = _epResolve(s, _a);
  if (!rr || rr.epIdx < 0 || rr.epIdx > 2) return { built: false, skip: "unreached", pnl100: null, main100: null, ref100: null, stop: false, indet: false, a: _a };
  if (rr.judge !== "ok") return { built: false, skip: "x", pnl100: null, main100: null, ref100: null, stop: false, indet: false, a: _a };
  var stop = _elPlanIsStop(s, _a, _cl) || _elHoldIsStop(s, _a, _cl);
  var parts = _elHold2TotParts(s, _a, _cl);   // { main:（）外, ref:（）内差分 } ＝最終損益（手じまい・○が途切れた所で手仕舞い）＝記録表/損益データ欄の「最終損益」と同一基準。2026-07-20b にH1(_elHold1TotParts)から切替＝アプリ全体(07-09〜07-13で最終損益へ移行)・推奨α選定(_elBaseAlphaPick=_elH2EvalByFn)と基準を統一。α可変でも正しい（内部で_epResolve(s,alpha)を引く）
  if (parts.main == null && parts.ref == null) return { built: true, skip: null, pnl100: null, main100: null, ref100: null, stop: stop, indet: true, a: _a };
  return { built: true, skip: null, pnl100: parts.main, main100: parts.main, ref100: parts.ref, stop: stop, indet: false, a: _a };
}
// ラダーを記録群へ一括適用。tiersOf(r)→[{a(実効α・nullは算出不可), add(この取引で建てる株数)}]。各取引は独立ショート＝addだけ空売り（2026-07-05: 手動は各取引の株数そのまま／自動はs1・s2）。
// sum=通算損益（判定可能な段のみ）・builtRecN=建玉あり（1段以上約定し損益判定できた記録）・stopRecN=うち損切り段あり・indetRecN=判定不可段あり・xRecN=×見送りのみ・noBaseRecN=推奨α不明段あり。
// tier積算コア（2026-07-14 系統3共通化）: 1記録のtier列を積算し（）外recPnl/（）内recRef＋各フラグを返す。マスター表(_elKabuLadderCalc)と自動配分ランキングの二重実装を1本化＝ドリフト（ランキング≠マスター表）を構造的に防止。
// evalOf(t,ctx)→ev（_elKabuTierEval or キャッシュ_evAt。base-levelα不明のtierはevalOf側で_EL_TIER_SKIPを返す＝旧ランキングの `_bl==null→continue` と同値・キャッシュ非汚染）／weightOf(t,ctx)→株数／collectCells=falseで表用cells配列を作らない（ランキングのperf維持）。旧実装とバイト等価（積算条件・丸め位置は不変）。
var _EL_TIER_SKIP = { skip: "noalpha" };
function _elKabuAccumTiers(tiers, evalOf, weightOf, collectCells, ctx) {
  var recPnl = 0, recRef = 0, any = false, hasMain = false, anyStop = false, anyIndet = false, anyNoBase = false, anyX = false, anyUnreached = false;
  var cells = collectCells ? [] : null;
  for (var i = 0; i < tiers.length; i++) {
    var t = tiers[i], w = weightOf(t, ctx), ev = evalOf(t, ctx);
    if (ev.skip === "noalpha" && w > 0) anyNoBase = true;
    if (ev.skip === "unreached" && w > 0) anyUnreached = true;   // 2026-07-20f EP未到達＝掃引αにOS1〜3で届かず建たない。従来はフラグが立たず注記にも出ないため「対象−建玉あり」の最大の塊が引き算しないと見えなかった
    if (ev.skip === "x") anyX = true;
    if (ev.built && ev.indet && w > 0) anyIndet = true;
    if (ev.built && !ev.indet && w > 0) {
      if (ev.main100 != null) { recPnl += ev.main100 * w / 100; hasMain = true; }   // （）外
      if (ev.ref100 != null) recRef += ev.ref100 * w / 100;     // （）内差分（△・損切り済）
      any = true;
      if (ev.stop) anyStop = true;
    }
    if (collectCells) cells.push({ t: t, ev: ev });
  }
  return { recPnl: recPnl, recRef: recRef, any: any, hasMain: hasMain, anyStop: anyStop, anyIndet: anyIndet, anyNoBase: anyNoBase, anyX: anyX, anyUnreached: anyUnreached, cells: cells };
}
// 建玉ゼロの記録に「建たなかった理由」を1つだけ割り当てる（銘柄別内訳が 対象＝建玉あり＋各理由 でぴったり合うように排他化）2026-07-20f。
// 優先順 x > noalpha > unreached: ×見送りはαもEP到達も確定したうえでの意思決定＝最も情報が確か／α不明はその方式が適用できないデータ側の問題／どちらでもなければ純粋にαへ届かなかった。
function _elKabuNoBuildReason(acc) {
  if (!acc || acc.any) return null;
  if (acc.anyX) return "x";
  if (acc.anyNoBase) return "noalpha";
  if (acc.anyUnreached) return "unreached";
  return "other";   // 有効な取引行が1つも無い（株数0・方式未選択）等
}
function _elKabuLadderCalc(recs, aiOf, tiersOf) {
  var rows = [], sum = 0, sumRef = 0, builtRecN = 0, stopRecN = 0, indetRecN = 0, xRecN = 0, noBaseRecN = 0, unreachedRecN = 0;
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s) return;
    var cut = aiOf(r).cutLine;
    var tiers = tiersOf(r) || [];
    var acc = _elKabuAccumTiers(tiers, function(t) { return _elKabuTierEval(s, t.a, cut); }, _elKabuTierAdd, true);
    if (acc.any) { sum += acc.recPnl; sumRef += acc.recRef; builtRecN++; if (acc.anyStop) stopRecN++; }
    if (acc.anyIndet) indetRecN++;
    if (acc.anyX && !acc.any) xRecN++;
    if (acc.anyNoBase) noBaseRecN++;
    var _nbr = _elKabuNoBuildReason(acc);   // 2026-07-20f 建玉ゼロの記録の理由（排他・銘柄別内訳と注記で共用）
    if (_nbr === "unreached") unreachedRecN++;
    // recPnl: （）外を持つ取引が1つも無い記録（EP△＝△確信度エントリーで（）内のみ等）はnull＝表示「—」。従来列（_elHold1TotParts直・main null→—）と表示規約を一致 2026-07-04c。合計へは0円として算入（従来どおり）。
    rows.push({ r: r, cells: acc.cells, recPnl: (acc.any && acc.hasMain) ? Math.round(acc.recPnl) : null, recRef: acc.any ? Math.round(acc.recRef) : 0, anyStop: acc.anyStop, anyIndet: acc.anyIndet, built: acc.any, noBuild: _nbr });
  });
  return { rows: rows, sum: Math.round(sum), sumRef: Math.round(sumRef), builtRecN: builtRecN, stopRecN: stopRecN, indetRecN: indetRecN, xRecN: xRecN, noBaseRecN: noBaseRecN, unreachedRecN: unreachedRecN, n: rows.length };
}
function _elKabuTierAdd(t) { return t.add; }
// UI本体。マウント元は2箇所＝①銘柄タブの「🧮 シミュ」（旧α値タブ④）②💰損益タブの「🧮 シミュ」＝全銘柄一括（2026-07-20f）。
// props: recs=シミュ母数（①シグナル×内訳サブタブのスコープ／②_v2recsAll＝全銘柄・全シグナル）／baseRecs=推奨α算出用（①その銘柄の全記録＝日別ページ/記録フォームと同じ母数 2026-07-03t／②allRecs＝銘柄ごとに分けてrecoFnを作る）／
//   aiOf／floatMode（浮き足サブタブ＝浮き足〇の除外を無効化）／data＋scopeStock=時間かぶり除外（2026-07-20b・scopeStock=nullで銘柄横断）／allStock=全銘柄一括モード（2026-07-20f）。
// 手動ラダー（取引ごとに入力方式=絶対値/推奨α±X/推奨基本α値を選択・各取引{method,off,株数}・実効αを記録ごとに算出し各取引の株数をそのまま空売り＝合計は総和・2026-07-05累積廃止）と自動配分（合計株数→第1取引α0〜推奨基本α未満×100株刻み配分を総当たり・第2取引=記録日時点の推奨α・★最適+上位ランキング）の2モード。
function _elKabuLadderSimV2(props) {
  var recs = props.recs || [], baseRecs = props.baseRecs || recs, aiOf = props.aiOf, floatMode = !!props.floatMode;
  // allStock＝💰損益タブの全銘柄一括モード 2026-07-20f。推奨α系（推奨α±X・推奨基本α値）は**銘柄ごと**に算出する＝各記録は自分の銘柄の、その日時点の推奨基本αを使う。
  // ⚠️全銘柄の記録を1本のrecoFnに混ぜてはいけない: αは値幅の絶対値なので、株価水準の違う銘柄をまたいで平均した推奨αには意味がない（銘柄別シミュとも数字が合わなくなる）。
  // 絶対値/採用α±X方式は元から銘柄非依存なので影響なし。
  // ⚠️2026-07-20h 訂正: 当初コメント/画面に書いた「全銘柄シミュ＝各銘柄シミュの合算」は**誤り**。α（＝1記録あたりの実効α）は銘柄ごとで正しいが、母数の定義が3点で違う:
  //   ①時間かぶり除外のスコープ（全銘柄=null＝銘柄をまたいだ被りも除外／銘柄別=その銘柄内だけ）②銘柄別シミュの母数は**選択中シグナルのみ**（全銘柄は全シグナル）③floatMode（浮き足サブタブ）の有無で浮き足〇の除外が反転。
  //   同一シグナル1本・時間かぶり無し・浮き足無しの銘柄なら結果的に一致するが、一般には一致しない。
  var allStock = !!props.allStock;
  var _simData = props.data || null, _simCollScope = props.scopeStock;   // 時間かぶり除外用（2026-07-20b）＝他のP&L集計(_elTotAccum の excluded)と同じ線引きをシミュにも適用。data未渡しなら従来どおり無効
  var _uM = useState("manual"), mode = _uM[0], setMode = _uM[1];
  var _uF = useState("no"), addFil = _uF[0], setAddFil = _uF[1];
  var _uSk = useState("__all__"), stkFil = _uSk[0], setStkFil = _uSk[1];   // 対象銘柄フィルタ（全銘柄モードのみ表示・__all__=全て・既定＝全て）2026-07-22
  var _uAo = useState("act"), addOn = _uAo[0], setAddOn = _uAo[1];   // 追加α〇記録への上乗せ: act=実追加α(既定)/reco=記録日時点の推奨追加α/none=なし。〇記録がシミュ対象にいる時だけピル表示 2026-07-06
  // 除外チェック（⑥ 2026-07-13）→ 2026-07-20k **浮き足〇だけに縮小**（ユーザー決定）:
  //   ・RN〇の除外は意味を失った＝除外しても保存値rnUsedの記録を母数から外すだけで、掃引αに対する動的再判定(_simRnAt)は止まらず、
  //     RNを使っていない記録にも加算が乗っていた。誤解を招くだけのチェックだったので撤去。
  //   ・ライン併存はユーザーが概念として使わなくなったため撤去。
  // 既定＝浮き足〇を除外（floatModeでは浮き足除外は無効＝母数が浮き足記録のため）。
  var _uEx = useState({ uki: true }), exFlags = _uEx[0], setExFlags = _uEx[1];
  // RN自動加算トグル 2026-07-21a（ユーザー要望＝既定ONで戻す）: ONなら掃引αの予定EP下二桁が41-49/91-99のとき…50/…00まで自動で乗せる（記録フォーム/EPナビと同じ）。
  //   全方式（絶対値・推奨α系）に一律。OFFなら入力αがそのまま効く（下二桁に依らず建つ/建たないが安定）。採用α±X系はRNが採用αに内包済みなので対象外（別経路_adoptOf）。
  var _uRnA = useState(true), rnAuto = _uRnA[0], setRnAuto = _uRnA[1];
  // 2026-07-20i 対象期間を年月週日カスケード選択へ置換（旧: 本日/1週/1月/3月/6月/1年/全期間のローリング）。
  // 既定＝今月のみ（週日は「全て」）＝ユーザー選択。記録帳の外側バーは既定「全期間」なので、こちらだけ今月に寄せている点に注意。
  var _uPd = useState(_elPSelThisMonth), pSel = _uPd[0], setPSel = _uPd[1];
  var _uRw = useState([{ method: "adopt", off: "0", cum: "", addMethod: "act", addOff: "" }]), rows = _uRw[0], setRows = _uRw[1];   // 2026-07-20g 初期1行（既定＝「複数回の取引」×＝1回だけ建てる）。〇に切り替えた時に第2取引の空行を足す（旧: 初期2行）   // 取引ごとに入力方式(method)＋追加α方式(addMethod/addOff)を持つ 2026-07-03→2026-07-06追加α取引ごと化。初期は基本α未選択・追加αは実追加α(act)既定（触らなければ実際の追加αを反映＝シミュ=従来で差額0・×+未選択母数では実追加α=0で従来値不変）
  var _uAP = useState(false), addPicker = _uAP[0], setAddPicker = _uAP[1];   // 取引追加時の入力方式ピッカー表示 2026-07-03
  // 「複数回の取引 〇×」2026-07-20g（ユーザー要望＝そもそも分割するかを最初に選ぶ）。既定×＝1回だけ建てる。
  // ×のときは rows の先頭1件だけを使う（rowsは消さずに保持＝〇に戻すと第2取引以降がそのまま復活）。effRowsがrowsの**先頭からの部分列**なので_upd/_stepCum等のindexはそのまま通用する。
  // 自動配分も連動: ×＝全株を1方式に寄せる25通りのみ／〇＝現行の2取引ぶんの総当たり（1,225通り・単一取引の配分も探索範囲に含む上位集合）。3取引以上は手動ラダーのみ（自動は約33万通りで破綻するため）。
  var _uMT = useState(false), multiTrade = _uMT[0], setMultiTrade = _uMT[1];
  var _METHODS = [{ key: "abs", label: "絶対値（0円基準）でα○円", short: "絶対値" }, { key: "reco", label: "推奨α±X（記録日時点）", short: "推奨α±X" }, { key: "recobase", label: "推奨基本α値で（株数だけ）", short: "推奨基本α値" }, { key: "adopt", label: "採用α値±X（その記録の実際のα）", short: "採用α±X" }];   // 手動ラダーの基本α入力方式マスター。adopt＝採用α（合計α・浮き足/RN込み）起点＝上乗せ無しでそのまま実効α 2026-07-20
  var _ADD_METHODS = [{ key: "abs", label: "絶対値で追加α○円", short: "絶対値" }, { key: "reco", label: "各日の推奨追加α±X", short: "推奨追加α±X" }, { key: "recoadd", label: "各取引日の推奨追加α値", short: "推奨追加α値" }, { key: "act", label: "実追加α（記録の値）", short: "実追加α" }];   // 手動ラダーの追加α入力方式マスター（取引ごと）2026-07-06。推奨追加α系は「推奨基本αに何円足すか」の値＝任意の基本αに乗せられるが推奨基本α値との併用が前提
  var _uTt = useState("500"), total = _uTt[0], setTotal = _uTt[1];
  var _uAX = useState(null), autoExp = _uAX[0], setAutoExp = _uAX[1];
  var _uARun = useState(null), autoRunSig = _uARun[0], setAutoRunSig = _uARun[1];   // 全銘柄モードの自動配分＝「計算する」を押した時の入力署名。現在の署名と一致する間だけ総当たりを実行（母数が銘柄数倍でタブを開くたび固まるのを防ぐ）2026-07-20f。銘柄別モードは従来どおり即時
  var _uMt = useState(null), mtExp = _uMt[0], setMtExp = _uMt[1];   // 案Aマスター表の行展開キー 2026-07-03
  var _uSo = useState("15"), stopOff = _uSo[0], setStopOff = _uSo[1];   // 手動ラダーのシミュ損切り値＝推奨基本α値+Xのオフセット（既定15＝推奨基本α+15円・空欄にすると各記録の実際の損切り値）2026-07-05→2026-07-22 既定10→15（EPナビ/前提損切りの15に統一）
  // ===== A/B比較モード（2026-07-24）: 設定A・設定Bにそれぞれ独立のラダー＋損切りを組み、同じ母数で損益を対比する（差額＝設定B−設定A）。手動の単一ラダー(rows/stopOff)とは別state＝手動モードに影響しない。
  //   既定は両方「採用α±0・100株・損切り+15」＝差額0（±0で記録どおり再現）から開始。片方を採用α±0のままにすれば「実際のα vs もし○○していたら」の対比＝旧「従来 vs シミュ」に相当する。
  var _uRwA = useState([{ method: "adopt", off: "0", cum: "100", addMethod: "act", addOff: "" }]), rowsA = _uRwA[0], setRowsA = _uRwA[1];
  var _uRwB = useState([{ method: "adopt", off: "0", cum: "100", addMethod: "act", addOff: "" }]), rowsB = _uRwB[0], setRowsB = _uRwB[1];
  var _uSoA = useState("15"), stopOffA = _uSoA[0], setStopOffA = _uSoA[1];
  var _uSoB = useState("15"), stopOffB = _uSoB[0], setStopOffB = _uSoB[1];
  var _uCmpX = useState(null), cmpExp = _uCmpX[0], setCmpExp = _uCmpX[1];   // A/B比較マスター表の行展開キー
  var _kbSan = function(v) { return String(v == null ? "" : v).replace(/[０-９]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); }).replace(/[ー−―‐]/g, "-").replace(/[^0-9\-]/g, ""); };
  var _kbInt = function(v) { var t = _kbSan(v); if (t === "" || t === "-") return null; var n = parseInt(t, 10); return isNaN(n) ? null : n; };
  // 対象取引を期間で絞り込み（記録日基準・本日=当日/相対=今日からN遡り以降/全期間=無制限）2026-07-03q。推奨α(baseRecs/recoOf)は各記録日の履歴で別途算出＝ここでは絞らない。
  var _periodRecs = _elPSelFilter(recs, pSel);   // 2026-07-20i 年月週日カスケード選択（_elPSelFilter）。旧＝今日起点のローリング窓
  // 対象銘柄セレクタ（2026-07-22）＝全銘柄モードで銘柄を絞れる。候補＝この期間に記録がある銘柄をマスター順に（記録のある銘柄だけ・extraは末尾）。stkFil=__all__で全て。
  var _stkOpts = (function() { if (!allStock) return []; var m = {}; _periodRecs.forEach(function(r) { if (r && r.stock) m[r.stock] = 1; }); var ord = (_simData && _simData.custom && _simData.custom.stocks) ? _simData.custom.stocks : []; var out = ord.filter(function(s) { return m[s]; }); Object.keys(m).forEach(function(s) { if (out.indexOf(s) < 0) out.push(s); }); return out; })();
  var _stkRecs = (allStock && stkFil !== "__all__") ? _periodRecs.filter(function(r) { return r && r.stock === stkFil; }) : _periodRecs;   // 銘柄別モードは元から単一銘柄なので無効。ここで絞ると下流（pool・_stkN・_origPnl・_kbStockTable・時間かぶり・自動配分）に一律で効く
  var pool = floatMode ? _stkRecs : (addFil === "no" ? _stkRecs.filter(function(r) { return r && !_elSpecialUsed(r.signal); }) : addFil === "yes" ? _stkRecs.filter(function(r) { return r && _elSpecialUsed(r.signal); }) : _stkRecs);
  var _poolBeforeEx = pool.length;
  if (exFlags.uki && !floatMode) pool = pool.filter(function(r) { var s = r && r.signal; return !(s && _elUkiYes(s)); });   // 2026-07-20k 浮き足〇のみ（ライン併存/RN〇の除外は撤去）。floatModeでは無効＝母数が浮き足記録のため
  var _exCount = _poolBeforeEx - pool.length;   // 除外中の件数（バッジ表示・0=該当記録なし＝フラグ未設定の可能性を可視化）2026-07-13b
  // 時間かぶり除外（2026-07-20b）＝保有時間が重なる記録は早い方だけ残す。他の全P&L集計(_elTotAccum の excluded)と同じ線引きで、シミュだけ二重計上していたのを解消。poolを直接絞るのでシミュ損益・従来列・_origPnl・対象取引リストの全部に一律で効く。
  var _collN = 0;
  if (_simData) { var _pbColl = pool.length; pool = pool.filter(function(r) { return !_elCollExcluded(_simData, r, _simCollScope); }); _collN = _pbColl - pool.length; }
  // 日付時点推奨α（重い計算）はrefキャッシュ＝スコープ/データが実際に変わった時だけ再構築（EntryLogViewは毎レンダーで配列を作り直すため参照同一性では判定できない→内容署名で判定）。
  var recoRef = useRef(null);
  // 署名にOS/H足の実データ(_epLegs=高値/確定値/期待度)・浮き足〇も含める＝OS値や期待度だけ編集しても推奨αが再計算されるように（旧: alphaVal/addAlphaUsed/cutLine/dateのみ→OS編集で古い推奨のまま）2026-07-04c
  var recoSig = "c" + _elAnaCutCur + (allStock ? "A" : "") + "!" + baseRecs.length + "|" + baseRecs.map(function(r) { var s = r && r.signal; if (!s) return (r && r.date) || ""; return (allStock ? ((r.stock || "") + "@") : "") + (r.date || "") + "." + (s.alphaVal != null ? s.alphaVal : "") + "." + (s.specialUsed === true ? ("s" + (s.specialAlpha != null ? s.specialAlpha : "")) : "n") + (_elUkiYes(s) ? "U" : "") + "." + (aiOf(r).cutLine != null ? aiOf(r).cutLine : "") + "." + (_epIsV2(s) ? _epLegs(s).map(function(l) { return l.h + "," + l.c + "," + (l.exp || ""); }).join("|") : ""); }).join(";");   // 前提損切り値+応用α(specialAlpha)もキーに（推奨α/base-levelが依存）2026-07-13
  if (!recoRef.current || recoRef.current.sig !== recoSig) {
    // 推奨基本α（単一値）＝日別ページ「今日の推奨」・記録フォームと同一の算出＝v2＋算入・本日の前日まで・直近50→100→全期間で最初に値が出た窓（statusも保持＝na参考バッジ用）。
    // 旧: 生baseRecs（非v2が母数nを膨らませ到達率を希釈・不算入記録も混入）・窓なし・当日込みの_elBaseAlphaPick直当て＝日別ページとズレていた 2026-07-04c修正。
    // 本日時点の推奨基本α（表示用・日別ページ「今日の推奨」と同一基準＝前日まで・直近50→100→全期間で最初に値が出た窓）。銘柄別/全銘柄で共用するため関数化 2026-07-20f
    var _todayPickOf = function(rs) {
      var _bpT = todayStr();
      var _bpAll = (rs || []).filter(function(r) { return r && r.date && r.date < _bpT && _epIsV2(r.signal) && _elInclData(r.signal); }).sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });   // 分析母数（データ算入）2026-07-22f
      var _bpLastN = function(n) { return _bpAll.length > n ? _bpAll.slice(_bpAll.length - n) : _bpAll.slice(); };
      var _bpCand = [_bpLastN(_EL_PERIOD_COUNTS[1]), _bpLastN(_EL_PERIOD_COUNTS[2]), _bpAll];
      var _bpPick = null;
      for (var _bpI = 0; _bpI < _bpCand.length && !_bpPick; _bpI++) { var _bpA = _elBaseAlphaA(_bpCand[_bpI], aiOf); if (_bpA && _bpA.pick && _bpA.pick.alpha != null) _bpPick = _bpA.pick; }
      return _bpPick;
    };
    if (allStock) {
      // 銘柄ごとにrecoFnと本日時点のpickを持つ。baseRecsはその銘柄の全記録（全シグナル）＝日別ページ/記録フォームと同じ母数。
      var _byStk = {};
      baseRecs.forEach(function(r) { var st = r && r.stock; if (!st) return; (_byStk[st] = _byStk[st] || []).push(r); });
      var _fnByStk = {}, _pickByStk = {};
      Object.keys(_byStk).forEach(function(st) { _fnByStk[st] = _elKabuRecoBaseFn(_byStk[st], aiOf); _pickByStk[st] = _todayPickOf(_byStk[st]); });
      recoRef.current = { sig: recoSig, fn: null, basePick: null, fnByStock: _fnByStk, pickByStock: _pickByStk };
    } else {
      recoRef.current = { sig: recoSig, fn: _elKabuRecoBaseFn(baseRecs, aiOf), basePick: _todayPickOf(baseRecs), fnByStock: null, pickByStock: null };
    }
  }
  var recoOf = recoRef.current.fn;
  // 記録→その日時点の推奨基本α。全銘柄モードは自分の銘柄のrecoFnを引く（銘柄の記録が無い/薄い＝null＝推奨α系の取引は建てない）2026-07-20f
  var _recoOfRec = function(r) {
    if (!allStock) return recoOf(r.date);
    var f = (r && r.stock) ? recoRef.current.fnByStock[r.stock] : null;
    return f ? f(r.date) : null;
  };
  // この銘柄の推奨基本α（単一値・日別ページ「今日の推奨」と同一基準）。表示＋自動配分の第1取引α上限（推奨基本α未満）に使用。recoRefに同梱キャッシュ。2026-07-03→2026-07-04c基準統一
  var _recoBasePick = recoRef.current.basePick;
  var _recoBaseAlpha = (_recoBasePick && _recoBasePick.alpha != null) ? _recoBasePick.alpha : null;
  // 元の損益（実際の実現損益・参考）＝母数の全記録の signed realizedPnl 合計。シミュは総株数・これは実際に建てた株数なのでスケールは別（参考）。2026-07-03
  var _origPnl = (function() { var s = 0, has = false; pool.forEach(function(r) { var sg = r && r.signal; if (sg && _elIsEntered(sg, r.item)) { var v = (r.item && r.item.pnl != null) ? Number(r.item.pnl) : _elSignedVal(sg.realizedPnl, sg.realizedPnlSign); if (v != null && !isNaN(v)) { s += v; has = true; } } }); return has ? Math.round(s) : null; })();
  // 記録固有の上乗せ＝浮き足加算（常時・floor(浮き値÷2)・浮き足×/対象外は0）＋追加α上乗せ（〇記録のみ・addOnセレクタ）。シミュの入力α/自動配分の探索αは「基本α部分」・実効α＝入力＋この上乗せ＝実運用ルール（α＝基本α＋浮き足加算＋追加α）の基本α部分だけ差し替える反実仮想 2026-07-06。
  // 既定母数（×+未選択・その他サブタブ）では全記録0＝従来の数値と完全一致。損切りは相対幅(cutLine)なので自動的に実効α起点＝変更不要。
  // 2026-07-20b RN加算を追加＝採用α（＝base-levelα＋浮き足＋RN・app-05:3141）と成分を一致させる。旧＝浮き足のみでRNが欠落し、RN〇を母数に入れると実効αが採用α−RN値になっていた（既定除外で普段は表面化しないがチェックを外すと発生・損切り判定まで歪む）。
  var _simAddOf = function(r) { var s = r && r.signal; return s ? (_elUkiAdd(s) + _elRnAdd(s)) : 0; };   // 記録固有の上乗せ＝浮き足加算＋RNまたぎ加算（追加α増分は廃止＝応用は基底α置換 2026-07-13）
  // ===== RNまたぎ自動判定（動的）2026-07-20c =====
  // シミュはαを動かす＝予定EPが動く＝下二桁も変わるので、RNは記録の保存値ではなく「掃引したαで判定し直す」（ユーザー決定 2026-07-20）。
  // _simRnAt(r, preAlpha)＝そのRN前α（基底α＋浮き足加算）での自動RN加算額。水準線(levelPrice)未入力＝判定不可はRN無し(0)で建てる（ユーザー決定・件数は_noLvNでバッジ表示）。
  var _simRnAt = function(r, preAlpha) { var s = r && r.signal; if (!s) return 0; var v = _elRnAutoFrom(s.levelPrice, preAlpha); return (v == null) ? 0 : v; };
  var _simHasLv = function(r) { var s = r && r.signal; return !!(s && s.levelPrice != null && s.levelPrice !== "" && !isNaN(Number(s.levelPrice))); };
  var _noLvN = 0; pool.forEach(function(r) { if (!_simHasLv(r)) _noLvN++; });   // 水準線未入力＝RN自動判定ができない記録の件数（バッジ表示）
  // 応用〇の記録は候補（swept）基本αを specialAlpha へ置換＝base-levelα。通常記録は候補のまま。実効α＝base-levelα＋浮き足加算（意味反転: 増分上乗せ→基底置換）2026-07-13。
  // 2026-07-20d 修正: 候補αが無い（未選択・空欄・その日の推奨α不明）ときは浮き足〇/応用〇でも **null＝建てない**。
  // 旧＝先にuki/応用を判定していたため candidateBase=null でも 0 / specialAlpha を返して建ってしまい、「未選択は建てない」の不変条件に反していた。
  // かつ _manTot（合計株数）はその行を数えないので、従来列の按分株数だけが小さくなり差額・通算損益が食い違っていた。
  var _simBaseLevel = function(r, candidateBase) { if (candidateBase == null) return null; var s = r && r.signal; if (s && _elUkiYes(s)) return 0; if (s && _elSpecialUsed(s)) { var sp = _elBaseLevelAlpha(s); if (sp != null) return sp; } return candidateBase; };   // 2026-07-14g 浮き足〇＝土台α無し＝基底0（採用α＝浮き足加算のみ・候補は無視）
  // 「採用α値±X」の起点＝その記録の実際の採用α（合計α＝土台α＋浮き足加算＋RN加算）。他方式と違い _simBaseLevel／浮き足加算を通さず、採用α＋X をそのまま実効αにする（浮き足を二重に足さないため）＝この方式なら浮き足〇・応用〇の記録も初めてα掃引の対象になる。採用α未入力(null)はこの取引を建てない 2026-07-20。
  // ⚠️aiOf(r).alphaは使わない＝_elAlphaInfo(app-05:3318)がalphaVal未入力時に_gradeAlpha(難度・既定10)へフォールバックするため決してnullにならず「未入力は建てない」が効かない（2026-07-20b修正）。signal.alphaValを直読みする。
  var _adoptOf = function(r) { var s = r && r.signal; if (!s) return null; var v = s.alphaVal; return (v == null || v === "" || isNaN(Number(v))) ? null : Number(v); };
  var _poolHasYes = pool.some(function(r) { return r && r.signal && _elSpecialUsed(r.signal); });   // 応用〇の記録がシミュ母数にいるか（表示条件用）
  // ===== 手動ラダー／A/B比較 の共通コア（実効α・損切り・株数の単一源）2026-07-24 =====
  // ⚠️_cfgTierOfRow(rw,r)＝1取引×1記録→tier {a(実効α・null=算出不可),add(株数),_uki,_rn,_addA}｜null。**手動の_manTiersOfとA/B比較(_mkCmpCfg)の両方がこれを共有**＝実効αのドリフト（片方だけ直る事故）を構造的に防ぐ。式は旧_manTiersOfのmapコールバックと同一。ここを直したら両モードに一律で効く。
  var _cfgTierOfRow = function(rw, r) {
    var sh = _kbInt(rw.cum); if (sh == null || sh <= 0) return null;   // この取引の株数（そのまま）
    if (rw.method === "adopt") {   // 採用α値±X＝合計α（浮き足/RN込み）起点。基底置換(_simBaseLevel)も浮き足加算も通さない＝二重加算回避・浮き足〇/応用〇も掃引可
      var ad = _adoptOf(r); if (ad == null) return null;   // 採用α未入力＝この記録では建てない
      var oa = _kbInt(rw.off);
      return { a: Math.max(0, ad + (oa == null ? 0 : oa)), add: sh, _uki: 0, _rn: 0, _addA: null };   // _uki/_rn=0＝採用αに内包済み
    }
    var _uki = _elUkiAdd(r.signal), _rn = _elRnAdd(r.signal);   // 浮き足加算・RNまたぎ加算＝記録固有・常時
    var a;
    if (rw.method === "abs") { var off = _kbInt(rw.off); a = (off == null) ? null : Math.max(0, off); }
    else if (rw.method === "recobase") { var b1 = _recoOfRec(r); a = (b1 == null) ? null : b1; }
    else if (rw.method === "reco") { var b2 = _recoOfRec(r); if (b2 == null) { a = null; } else { var o = _kbInt(rw.off); a = Math.max(0, b2 + (o == null ? 0 : o)); } }   // 0未満は0クランプ（_elKabuTierEvalと一致）
    else { a = null; }   // 未選択（method空）は建てない
    var _bl = _simBaseLevel(r, a);   // 応用〇＝specialAlphaで基底α置換（候補は無視）／浮き足〇＝基底0
    if (_bl == null) return { a: null, add: sh, _uki: _uki, _rn: 0, _addA: null };
    var _pre = _bl + _uki, _rnD = rnAuto ? _simRnAt(r, _pre) : 0;   // 実効α＝基底α＋浮き足加算＋自動RN加算（掃引αで再判定・トグルOFFで0）
    return { a: _pre + _rnD, add: sh, _uki: _uki, _rn: _rnD, _addA: null };
  };
  var _tierSort = function(tiers) { return tiers.filter(function(t) { return t != null; }).sort(function(x, y) { return (x.a == null ? Infinity : x.a) - (y.a == null ? Infinity : y.a); }); };   // α昇順（nullは末尾）＝表示順のみ・足し算なので合計は順序不変
  // シミュ損切り値: stopN(=損切りオフセット・null=空欄)→空欄は各記録の実際の損切り／設定時はその記録日時点の推奨基本α+stopN（1円未満は1・推奨α不明は記録値）。_simCutOf(手動)とA/B比較で共有。
  var _cfgCutOf = function(stopN, r) { if (stopN == null) return aiOf(r).cutLine; var rb = _recoOfRec(r); if (rb == null) return aiOf(r).cutLine; var c = rb + stopN; return c >= 1 ? c : 1; };
  // 合計株数＝各取引の株数の総和（未選択・絶対値でα欄空の行は_cfgTierOfRowが建てないので数えない）。_manTot(手動)とA/B比較で共有。
  var _cfgTot = function(eRows) { var t = 0; eRows.forEach(function(x) { if (x.method !== "abs" && x.method !== "reco" && x.method !== "recobase" && x.method !== "adopt") return; if (x.method === "abs" && _kbInt(x.off) == null) return; var c = _kbInt(x.cum); if (c != null && c > 0) t += c; }); return t; };
  // A/B比較: 1つの設定（rows配列＋損切りoffset文字列）→ {eRows, tiersOf, cutInfo, calc, manTot}。手動と同じ_cfgTierOfRow/_cfgCutOf/_cfgTotを通す＝手動・設定A・設定Bで実効αが完全に一致。multiTradeは共通（×なら先頭1取引だけ）。
  var _mkCmpCfg = function(cfgRows, cfgStop) {
    var eRows = multiTrade ? cfgRows : cfgRows.slice(0, 1);
    var tiersOf = function(r) { return _tierSort(eRows.map(function(rw) { return _cfgTierOfRow(rw, r); })); };
    var stopN = _kbInt(cfgStop);
    var cutInfo = function(r) { return { cut: _cfgCutOf(stopN, r), ov: (stopN != null && _recoOfRec(r) != null) }; };
    var aiSim = function(r) { return { alpha: aiOf(r).alpha, cutLine: _cfgCutOf(stopN, r) }; };
    var manTot = _cfgTot(eRows);
    var calc = pool.length ? _elKabuLadderCalc(pool, aiSim, tiersOf) : null;
    return { eRows: eRows, tiersOf: tiersOf, cutInfo: cutInfo, calc: calc, manTot: manTot };
  };
  // ===== 手動ラダー: 取引ごとに入力方式（絶対値/推奨α±X/推奨基本α値）→実効αを記録ごとに算出し、各取引の株数をそのまま空売り（足し算＝自動配分と同じ）2026-07-05 =====
  // ★2026-07-05 累積(累計)方式を廃止＝各取引の株数はその取引で建てる株数そのもの。第1取引100株＋第2取引400株＝合計500株（旧: 累積400なら増し300株の差分方式）。
  // 各取引の実効α: abs=off(絶対値・0未満は0) / reco=推奨α(日付時点)+off / recobase=推奨α(日付時点) / adopt=採用α(その記録の実際のα)+off。推奨不明(reco系)・採用α未入力(adopt)はこの記録では建てない(a=null)。α昇順ソートは表示（シミュα列・内訳）と揃えるためで、足し算なので合計は順序に依らない。
  // 注: state のフィールド名は歴史的に `cum` だが意味は「この取引の株数」（累積ではない）2026-07-05。
  // effRows＝「複数回の取引」×のときは先頭1件だけ（2026-07-20g）。以降の計算・プレビュー・株数合計・行描画は全部これを見る（rows直参照を残すと×なのに第2取引が効いてしまう）。
  var effRows = multiTrade ? rows : rows.slice(0, 1);
  // 2026-07-24 実効αの単一源を _cfgTierOfRow に共通化（A/B比較と共有・旧: この関数内にmapインライン展開・式は同一）。α不明のtierも捨てず_elKabuTierEvalへ渡す（skip:"noalpha"）＝消費側は c.t.a != null でガード済み。
  var _manTiersOf = function(r) { return _tierSort(effRows.map(function(rw) { return _cfgTierOfRow(rw, r); })); };
  // シミュの損切り値: 空欄→各記録の実際の損切り値(aiOf.cutLine)／設定時→その記録日時点の推奨基本α(recoOf)+オフセット（1円未満は1にクランプ・推奨α不明は記録値へフォールバック）。手動ラダー専用（自動配分は各記録の実際の損切り値のまま）2026-07-05。
  var _stopOffN = _kbInt(stopOff);   // 損切りオフセット（null=空欄）
  var _simCutOf = function(r) { return _cfgCutOf(_stopOffN, r); };   // 2026-07-24 _cfgCutOf共通化（式は同一・A/B比較と共有）
  var _simCutInfo = function(r) { var c = _simCutOf(r); var ov = (_stopOffN != null && _recoOfRec(r) != null); return { cut: c, ov: ov }; };   // ov=推奨基本α+オフセットで上書き中か（表示色用）
  var _aiSim = function(r) { return { alpha: aiOf(r).alpha, cutLine: _simCutOf(r) }; };
  var manCalc = (mode === "manual" && pool.length) ? _elKabuLadderCalc(pool, _aiSim, _manTiersOf) : null;   // 手動は損切りオフセットを反映（_aiSim）2026-07-05
  // ===== 自動配分: 第1・第2取引の各αを候補セット（絶対値0/3/5・各日の推奨基本α・推奨α±1〜±5・各記録の採用α±0〜±5）から選び、総株数を100株刻みで2取引に配分して総当たり 2026-07-07→2026-07-20採用α系を追加 =====
  // 候補α方式（25種）: 絶対値0/3/5（定数）＋推奨基本α（＝推奨α±0）＋推奨α±1〜±5（記録日時点・推奨不明の日は建てない）＋採用α±0〜±5（その記録の実際のα・採用α未入力の記録は建てない）。旧: 第1取引を0〜推奨基本α未満の全整数×第2取引固定＝推奨α。
  var _AUTO_CANDS = [{ key: "abs0", kind: "abs", v: 0 }, { key: "abs3", kind: "abs", v: 3 }, { key: "abs5", kind: "abs", v: 5 }, { key: "r0", kind: "reco", x: 0 }];
  for (var _rx = 1; _rx <= 5; _rx++) { _AUTO_CANDS.push({ key: "r+" + _rx, kind: "reco", x: _rx }); _AUTO_CANDS.push({ key: "r-" + _rx, kind: "reco", x: -_rx }); }
  _AUTO_CANDS.push({ key: "a0", kind: "adopt", x: 0 });
  for (var _ax = 1; _ax <= 5; _ax++) { _AUTO_CANDS.push({ key: "a+" + _ax, kind: "adopt", x: _ax }); _AUTO_CANDS.push({ key: "a-" + _ax, kind: "adopt", x: -_ax }); }
  var _candIdx = {}; _AUTO_CANDS.forEach(function(c, i) { _candIdx[c.key] = i; });
  // 候補の基本α（rb＝その記録日時点の推奨α・null可）。絶対値は定数／推奨系は rb+x を0クランプ・推奨不明(null)は建てない。実効α＝この基本α＋記録固有の上乗せ（浮き足加算＋追加α上乗せ）。採用系は _candEffAlpha 側で処理（ここは通らない）。
  var _candBaseFromReco = function(cand, rb) { if (cand.kind === "abs") return cand.v; if (rb == null) return null; var b = rb + cand.x; return b < 0 ? 0 : b; };
  // 候補方式→その記録の実効α（この1関数に集約＝ランキング(_rankEvalOf)とマスター表(_autoTiersOfFor)の一致を構造的に保証）。
  // adopt＝採用α（合計α・浮き足/RN込み）+x をそのまま（_simBaseLevel／浮き足加算を通さない＝二重加算回避・浮き足〇/応用〇も掃引可）／abs・reco＝従来どおり 基底α（応用〇は応用α値・浮き足〇は0）＋浮き足加算。null＝この記録では建てない。2026-07-20
  // 2026-07-20c 非adopt系は「基底α＋浮き足加算」を出してからRNを自動再判定して足す（掃引αでEPが動く＝下二桁も動くため保存値は使わない）。
  // adopt系は採用α（RN込みの実績値）そのものが起点なので再判定しない＝採用α±0が記録どおりを再現する不変条件を保つ。
  var _candEffAlpha = function(cand, r, rb, ex, ad) {
    if (cand.kind === "adopt") { if (ad == null) return null; var v = ad + cand.x; return v < 0 ? 0 : v; }
    var b = _candBaseFromReco(cand, rb);
    var bl = _simBaseLevel(r, b);
    if (bl == null) return null;
    var pre = bl + _elUkiAdd(r && r.signal);
    return pre + (rnAuto ? _simRnAt(r, pre) : 0);   // 2026-07-21a RN自動加算トグル（既定ON）。手動ラダーの_rnDと同じ扱い＝OFFで入力αがそのまま効く。採用系(adopt)は上のearly returnで別処理
  };
  var _candLabel = function(cand) { if (cand.kind === "abs") return "α" + cand.v + "円"; if (cand.kind === "adopt") return cand.x === 0 ? "採用α" : ("採用α" + (cand.x > 0 ? "+" + cand.x : cand.x)); if (cand.x === 0) return "推奨α"; return "推奨α" + (cand.x > 0 ? "+" + cand.x : cand.x); };
  var totalN = (function() { var t = _kbInt(total); if (t == null || t <= 0) return 0; return Math.max(100, Math.round(t / 100) * 100); })();
  // 自動配分の入力署名＝これが変われば結果は無効＝再度「計算する」を要求（全銘柄モードのみ）。銘柄別は_autoReady常時trueで従来の即時計算のまま。
  var _autoSig = totalN + "|" + pool.length + "|" + _elPSelSig(pSel) + "|" + addFil + "|" + (exFlags.uki ? 1 : 0) + "|" + _elAnaCutCur + "|" + (floatMode ? 1 : 0) + "|" + recoSig.length + "|" + (multiTrade ? 1 : 0) + "|" + (rnAuto ? 1 : 0) + "|" + stkFil;   // multiTrade/rnAutoも署名に＝切り替えたら再計算が必要 2026-07-20g→2026-07-21a
  var _autoReady = !allStock || !multiTrade || autoRunSig === _autoSig;   // 2026-07-20h ×は25通りで軽いのでゲートせず即時（_autoGateと条件を揃える）
  var autoRes = null;
  if (mode === "auto" && totalN > 0 && pool.length && _autoReady) {
    var _evCache = pool.map(function() { return {}; });
    var _evAt = function(pi, a) { var m = _evCache[pi]; if (!m.hasOwnProperty(a)) m[a] = _elKabuTierEval(pool[pi].signal, a, aiOf(pool[pi]).cutLine); return m[a]; };
    var _recoAs = pool.map(function(r) { return _recoOfRec(r); });
    var _exAs = pool.map(function(r) { return _simAddOf(r); });   // 記録固有の上乗せ（浮き足加算＋追加α上乗せ）＝候補の基本αにこれを足して実効α評価 2026-07-06
    var _adoptAs = pool.map(function(r) { return _adoptOf(r); });   // その記録の採用α（合計α）＝採用α系候補の起点 2026-07-20
    // tier積算コア(_elKabuAccumTiers)へ渡す評価/株数コールバック（ループ外で1回定義＝ホットループでクロージャを再生成しない・perf維持 2026-07-14 系統3）。ctx=pool index。base-levelα不明は_EL_TIER_SKIP＝旧 `_bl==null→continue` と同値（_evAt未呼出でキャッシュ非汚染）。
    var _rankEvalOf = function(tr, pi) { var _a = _candEffAlpha(tr.cand, pool[pi], _recoAs[pi], _exAs[pi], _adoptAs[pi]); return (_a == null) ? _EL_TIER_SKIP : _evAt(pi, _a); };
    var _rankSharesOf = function(tr) { return tr.shares; };
    var _noRecoN = 0; _recoAs.forEach(function(v) { if (v == null) _noRecoN++; });
    var _noAdoptN = 0; _adoptAs.forEach(function(v) { if (v == null) _noAdoptN++; });   // 採用α未入力＝採用α系候補を建てない件数（注記表示用）2026-07-20
    var _combos = [], _seen = {};
    // 2026-07-20g「複数回の取引」×＝全株を第1取引に寄せた1周だけ回す＝単一取引の25通りだけを総当たり（_s2=0で_c2s=[null]）。
    // 〇＝従来どおり100株刻みの2分割（1,225通り）。〇の探索範囲は単一取引の配分（_s1=0/_s1=totalN）も含む上位集合なので、★が単一なら「分割不要」と読める。
    for (var _s1 = (multiTrade ? 0 : totalN); _s1 <= totalN; _s1 += 100) {
      var _s2 = totalN - _s1;
      var _c1s = _s1 > 0 ? _AUTO_CANDS : [null], _c2s = _s2 > 0 ? _AUTO_CANDS : [null];
      for (var _i1 = 0; _i1 < _c1s.length; _i1++) {
        for (var _i2 = 0; _i2 < _c2s.length; _i2++) {
          var _cd1 = _c1s[_i1], _cd2 = _c2s[_i2];
          var _agg = {};   // 同一方式は株数を合算＝配分の正準形（第1/第2の入替や同方式重複を1件に集約）
          if (_cd1 && _s1 > 0) _agg[_cd1.key] = { cand: _cd1, shares: _s1 };
          if (_cd2 && _s2 > 0) { if (_agg[_cd2.key]) _agg[_cd2.key].shares += _s2; else _agg[_cd2.key] = { cand: _cd2, shares: _s2 }; }
          var _ks = Object.keys(_agg); if (!_ks.length) continue;
          var _trs = _ks.map(function(k) { return _agg[k]; }).sort(function(a, b) { return _candIdx[a.cand.key] - _candIdx[b.cand.key]; });
          var _sig = _trs.map(function(t) { return t.cand.key + ":" + t.shares; }).join("|");
          if (_seen[_sig]) continue; _seen[_sig] = 1;
          var _sum = 0, _refSum = 0, _builtN = 0, _stopN = 0;
          for (var _pi = 0; _pi < pool.length; _pi++) {
            var _acc = _elKabuAccumTiers(_trs, _rankEvalOf, _rankSharesOf, false, _pi);   // マスター表(_elKabuLadderCalc)と同一の積算コア＝ランキング＝マスター表を構造的に保証・cells非生成でperf維持 2026-07-14
            if (_acc.any) { _sum += _acc.recPnl; _refSum += _acc.recRef; _builtN++; if (_acc.anyStop) _stopN++; }
          }
          _combos.push({ tranches: _trs, sig: _sig, sum: Math.round(_sum), sumRef: Math.round(_refSum), builtN: _builtN, stopN: _stopN });
        }
      }
    }
    _combos.sort(function(x, y) { return (y.sum - x.sum) || (x.tranches.length - y.tranches.length) || (_candIdx[x.tranches[0].cand.key] - _candIdx[y.tranches[0].cand.key]); });
    autoRes = { combos: _combos, best: _combos[0] || null, noRecoN: _noRecoN, noAdoptN: _noAdoptN, comboN: _combos.length };
  }
  var _autoTiersOfFor = function(cb) { return function(r) { var _ex = _simAddOf(r), _rb = _recoOfRec(r), _ad = _adoptOf(r), _u = _elUkiAdd(r.signal); return (cb.tranches || []).map(function(tr) { var _isAd = (tr.cand.kind === "adopt"); var _a = _candEffAlpha(tr.cand, r, _rb, _ex, _ad); return { a: _a, add: tr.shares, _uki: (_isAd ? 0 : _u), _rn: (_isAd || _a == null) ? 0 : Math.max(0, _a - _simBaseLevel(r, _candBaseFromReco(tr.cand, _rb)) - _u) }; }); }; };   // _rn は表示用＝実効αから基底α・浮き足を引いた自動RN分 2026-07-20c   // 総当たり(_rankEvalOf)と同じ_candEffAlphaを共有＝ランキングとマスター表が一致 2026-07-07→応用α化 2026-07-13→採用α系追加 2026-07-20
  // ===== 表示部品 =====
  var _pill = function(on, label, onClick, color) {
    return React.createElement("button", { key: label, onClick: onClick,
      style: { flexShrink: 0, padding: "5px 13px", fontSize: 11.5, fontWeight: 700, borderRadius: 14, cursor: "pointer", whiteSpace: "nowrap", border: "1px solid " + (on ? color : "#ddd"), background: on ? color : "#fff", color: on ? "#fff" : "#666" } }, label);
  };
  var _inpSty = { width: 56, padding: "3px 6px", fontSize: 11.5, border: "1px solid #ddd", borderRadius: 5, textAlign: "right" };
  // ===== 案A マスター表（記録詳細＝本日の損益データ欄準拠＋シミュ3列＋上下合計バー）2026-07-03 =====
  var _mtBar = function(cfgSum, cfgRef, cfgLabel, baseSum, baseRef, upl, uplRef, reshow) {
    var _in = function(m, r, col) { return (m != null && r) ? React.createElement("span", { style: { fontSize: 10, opacity: 0.8, marginLeft: 1, color: col } }, "（" + _elPnlFmt(m + r) + "）") : null; };
    return React.createElement("div", { style: { background: "#0F766E", color: "#fff", padding: "8px 12px", display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", borderRadius: reshow ? "0 0 10px 10px" : "10px 10px 0 0" } },
      React.createElement("span", { style: { fontSize: 9.5, opacity: 0.85 } }, "合計"),
      React.createElement("span", { style: { fontSize: 11 } }, "従来 ", React.createElement("b", { style: { fontSize: 15 } }, baseSum == null ? "—" : _elPnlFmt(baseSum)), _in(baseSum, baseRef)),
      React.createElement("span", { style: { fontSize: 11, background: "#fff", color: "#0F766E", borderRadius: 6, padding: "1px 8px" } }, cfgLabel + " ", React.createElement("b", { style: { fontSize: 15 } }, _elPnlFmt(cfgSum)), _in(cfgSum, cfgRef, "#0F766E")),
      React.createElement("span", { style: { fontSize: 11 } }, "差額 ", React.createElement("b", { style: { fontSize: 15 } }, upl == null ? "—" : _elPnlFmt(upl)), _in(upl, uplRef)),
      (_origPnl != null) ? React.createElement("span", { style: { marginLeft: "auto", fontSize: 9.5, opacity: 0.9 } }, "元の損益(実際) " + _elPnlFmt(_origPnl)) : null);   // 2026-07-03uで上部バー削除後、!reshow条件で常に非表示になっていたのを下部バーに表示 2026-07-04
  };
  var _mtTh = function(label, align, hi) { return React.createElement("td", { style: { padding: "5px 6px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", textAlign: align || "left", background: hi ? "#FEF3C7" : undefined } }, label); };
  var _mtTd = function(node, align, hi) { return React.createElement("td", { style: { padding: "5px 6px", fontSize: 10.5, borderTop: "0.5px solid #eee", verticalAlign: "middle", textAlign: align || "left", whiteSpace: "nowrap", background: hi ? "#FEF7E0" : undefined } }, node); };
  var _mtPnlNode = function(v) { return v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("b", { style: { color: _elPnlColor(v) } }, _elPnlFmt(v)); };
  // （）外main＋（）内=main+ref（△・損切り済がある時だけ括弧併記）。本日の損益データ欄と同じ2値表示 2026-07-03
  var _mtPnlNode2 = function(main, ref) {
    if (main == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    return React.createElement("span", { style: { whiteSpace: "nowrap" } },
      React.createElement("b", { style: { color: _elPnlColor(main) } }, _elPnlFmt(main)),
      (ref ? React.createElement("span", { style: { color: "#999", fontSize: 9, marginLeft: 1 } }, "（" + _elPnlFmt(main + ref) + "）") : null));
  };
  // 展開行の取引内訳（各取引のα×株数と（）外損益・（）内は△/損切り済がある時だけ括弧）。手動は各取引の株数そのまま 2026-07-05。
  var _mtTierNodes = function(cells) {
    var out = [];
    (cells || []).forEach(function(c, j) {
      if (!(c.t.add > 0)) return;
      var ev = c.ev, txt;
      if (ev.skip === "noalpha") txt = React.createElement("span", { style: { color: "#bbb" } }, "α不明（取引対象外）");   // 推奨α不明／採用α未入力の両方 2026-07-20
      else if (ev.skip === "unreached") txt = React.createElement("span", { style: { color: "#94A3B8" } }, "α" + ev.a + "円×" + c.t.add + "株 未到達");
      else if (ev.skip === "x") txt = React.createElement("span", { style: { color: "#0369A1" } }, "α" + ev.a + "円×" + c.t.add + "株 ×見送り");
      else if (ev.indet) txt = React.createElement("span", { style: { color: "#B45309" } }, "α" + ev.a + "円×" + c.t.add + "株 判定不可");
      else { var amtM = ev.main100 != null ? Math.round(ev.main100 * c.t.add / 100) : 0; var amtR = ev.ref100 != null ? Math.round(ev.ref100 * c.t.add / 100) : 0; txt = React.createElement("span", null, "α" + ev.a + "円×" + c.t.add + "株 ", React.createElement("b", { style: { color: _elPnlColor(amtM) } }, _elPnlFmt(amtM)), (amtR ? React.createElement("span", { style: { color: "#999", fontSize: 8.5, marginLeft: 1 } }, "（" + _elPnlFmt(amtM + amtR) + "）") : null), ev.stop ? React.createElement("span", { style: { fontSize: 8.5, fontWeight: 800, color: "#1E8449", marginLeft: 3 } }, "損切") : null); }
      out.push(React.createElement("span", { key: j, style: { marginRight: 12, whiteSpace: "nowrap" } }, txt));
    });
    return out.length ? out : React.createElement("span", { style: { color: "#ccc" } }, "—");
  };
  // シミュ列セルの全体（2026-07-05 ユーザー要望で再設計）: 上段＝（）外の取引内訳＋「=合計」／下段＝（（）内の取引内訳＋「＝合計」）を括弧で囲む。
  //   例: 上段「+300円/+3,200円=+3,500円」・下段「（0円/+2,000円＝+2,000円）」。合計（=の右）は少し大きく表示。
  //   合計は行の正準値 m.cfgPnl（（）外）/ m.cfgPnl+m.cfgRef（（）内）を使う（内訳の和と一致・株数が100の倍数なので端数なし）。
  //   取引が1件だけ（内訳なし）は「=」を出さず合計だけ。ref皆無（△・損切り済なし）は（）外の1段のみ。全取引未成立は「—」。
  //   並びはα昇順＝シミュα列と1:1対応・同一αは合算・α不明は末尾—。
  var _SIM_SUM_FS = 13;   // 合計の文字サイズ（セル既定10.5より少し大きい）
  // 2026-07-20k 建たなかった記録は「—」ではなく理由を出す（未到達／×見送り／α不明）。
  // 「オプション通りなら建つはずなのに建たない」が画面から追えなかったため＝銘柄別内訳と同じ_elKabuNoBuildReasonの分類を記録単位でも見せる。
  var _mtNoBuildChip = function(nb) {
    var k = null; (_KB_NB || []).forEach(function(x) { if (x[0] === nb) k = x; });
    if (!k) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    return React.createElement("span", { title: nb === "unreached" ? "掃引αにOS1〜3で届かなかった（αを下げれば拾える可能性）" : nb === "x" ? "×見送り宣言の後にαへ到達＝実際には降りているので建てない" : nb === "noalpha" ? "この取引のαが出せない（推奨α不明／採用α未入力）" : "有効な取引行が無い（株数0・方式未選択）",
      style: { fontSize: 9, fontWeight: 700, color: k[2], background: k[3], border: "1px solid " + k[4], borderRadius: 4, padding: "0 5px", whiteSpace: "nowrap" } }, k[1]);
  };
  var _mtSimCell = function(m) {
    if (m.noBuild) return _mtNoBuildChip(m.noBuild);
    if (m.cfgPnl == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");   // （）外が無い記録（全未成立・EP△のみ等）
    var items = [];
    (m.cells || []).forEach(function(c) {
      if (!(c.t.add > 0)) return;
      var built = c.ev.built && !c.ev.indet;
      var mn = (built && c.ev.main100 != null) ? Math.round(c.ev.main100 * c.t.add / 100) : null;
      var rf = (built && c.ev.ref100 != null) ? Math.round(c.ev.ref100 * c.t.add / 100) : 0;
      items.push({ a: (c.ev && c.ev.a != null) ? c.ev.a : null, m: mn, r: rf });
    });
    var merged = [];
    items.forEach(function(it) {
      var f = null;
      for (var k = 0; k < merged.length; k++) { if (merged[k].a != null && it.a != null && merged[k].a === it.a) { f = merged[k]; break; } }
      if (f) { f.m = (f.m == null && it.m == null) ? null : ((f.m || 0) + (it.m || 0)); f.r = (f.r || 0) + (it.r || 0); }
      else merged.push({ a: it.a, m: it.m, r: it.r });
    });
    merged.sort(function(x, y) { return ((x.a == null ? Infinity : x.a) - (y.a == null ? Infinity : y.a)); });
    var multi = merged.length >= 2;
    var sumMain = m.cfgPnl, sumIncl = (m.cfgPnl || 0) + (m.cfgRef || 0);
    var _parts = function(getVal, sep) { var out = []; merged.forEach(function(it, i) { if (i) out.push(React.createElement("span", { key: "s" + i, style: { color: "#d8d8d8", margin: "0 1px" } }, "/")); out.push(getVal(it, i)); }); return out; };
    // 上段（）外: 内訳 = 合計（合計は少し大きく・符号色）
    var topKids = [];
    if (multi) { topKids = topKids.concat(_parts(function(it, i) { return it.m == null ? React.createElement("span", { key: i, style: { color: "#bbb" } }, "—") : React.createElement("span", { key: i, style: { color: _elPnlColor(it.m) } }, _elPnlFmt(it.m)); })); topKids.push(React.createElement("span", { key: "eq", style: { color: "#94a3b8", margin: "0 3px" } }, "=")); }
    topKids.push(React.createElement("b", { key: "sum", style: { color: _elPnlColor(sumMain), fontSize: _SIM_SUM_FS } }, _elPnlFmt(sumMain)));
    var topRow = React.createElement("div", { style: { whiteSpace: "nowrap" } }, topKids);
    // ref皆無なら（）内は（）外と同値＝出さない
    if (!merged.some(function(it) { return it.r; })) return React.createElement("div", { style: { lineHeight: 1.35, display: "inline-block" } }, topRow);
    // 下段（）内: （内訳 ＝ 合計）を丸括弧で囲む・グレー
    var botKids = [React.createElement("span", { key: "lp", style: { color: "#999" } }, "（")];
    if (multi) { botKids = botKids.concat(_parts(function(it, i) { var incl = (it.m == null && !it.r) ? null : ((it.m || 0) + (it.r || 0)); return incl == null ? React.createElement("span", { key: i, style: { color: "#ccc" } }, "—") : React.createElement("span", { key: i, style: { color: "#999" } }, _elPnlFmt(incl)); })); botKids.push(React.createElement("span", { key: "beq", style: { color: "#bbb", margin: "0 3px" } }, "＝")); }
    botKids.push(React.createElement("b", { key: "bsum", style: { color: "#777", fontSize: _SIM_SUM_FS } }, _elPnlFmt(sumIncl)));
    botKids.push(React.createElement("span", { key: "rp", style: { color: "#999" } }, "）"));
    var botRow = React.createElement("div", { style: { whiteSpace: "nowrap", borderTop: "1px dotted #cbd5e1", marginTop: 1, paddingTop: 1 }, title: "（）内＝○△を含む参考額（△・損切り済ぶんの差分を上乗せした値）" }, botKids);
    return React.createElement("div", { style: { lineHeight: 1.35, display: "inline-block" } }, topRow, botRow);
  };
  // 従来＝損益データ欄と同一の理論値（採用α・_elHold1TotParts＝（）外/（）内）を100株→総株数へ単純按分。シミュエンジン（取引ラダー・第1/第2取引）は一切通さない（ユーザー仕様 2026-07-04）。
  var _kbConvParts = function(r, nSh) {
    var s = r && r.signal; if (!s) return { main: null, ref: null };
    var _cai = aiOf(r);
    var p = _elHold2TotParts(s, _cai.alpha, _cai.cutLine);   // 最終損益（手じまい）＝記録表の「最終損益」列と同一関数。2026-07-20b にH1から切替＝「従来」列が記録表と同じ数字になる
    return { main: p.main != null ? Math.round(p.main * nSh / 100) : null, ref: p.ref != null ? Math.round(p.ref * nSh / 100) : null };
  };
  var _kbConvSums = function(nSh) { var m = 0, rf = 0; pool.forEach(function(r) { var p = _kbConvParts(r, nSh); if (p.main != null) m += p.main; if (p.ref != null) rf += p.ref; }); return { sum: Math.round(m), sumRef: Math.round(rf) }; };
  // 銘柄別の内訳（全銘柄モード）2026-07-20f: 合計が1〜2銘柄に引っ張られていないかを見る＋「建たなかった理由」を銘柄ごとに出す。
  // 同じ「16/21件」でも、EP未到達なら“αが高すぎる＝下げれば拾える”、推奨α不明なら“その銘柄の記録がまだ薄いだけ＝ラダーの問題ではない”＝打ち手が正反対になるため。
  // 従来Σは_kbConvSumsと同じくpool全記録（シミュで建たなかった記録も含む）＝「実際の採用αでnShares建てていたら」の基準。合計行はシミュ合計（calc.sum）と一致する。
  var _KB_NB = [["unreached", "未到達", "#B45309", "#FFF7ED", "#FED7AA"], ["x", "×見送り", "#1E8449", "#F0FDF4", "#BBF7D0"], ["noalpha", "α不明", "#6B7280", "#F3F4F6", "#D1D5DB"], ["other", "取引なし", "#6B7280", "#F3F4F6", "#D1D5DB"]];
  var _kbStockTable = function(calc, nShares) {
    if (!calc || !calc.rows.length || !(nShares > 0)) return null;
    var by = {}, order = [];
    calc.rows.forEach(function(row) {
      var st = (row.r && row.r.stock) || "（銘柄なし）";
      if (!by[st]) { by[st] = { stock: st, n: 0, built: 0, sim: 0, simHas: false, conv: 0, convHas: false, unreached: 0, x: 0, noalpha: 0, other: 0 }; order.push(st); }
      var g = by[st];
      g.n++;
      if (row.built) { g.built++; if (row.recPnl != null) { g.sim += row.recPnl; g.simHas = true; } }
      else if (row.noBuild) g[row.noBuild]++;
      var cp = _kbConvParts(row.r, nShares);
      if (cp.main != null) { g.conv += cp.main; g.convHas = true; }
    });
    var list = order.map(function(st) { return by[st]; });
    list.sort(function(a, b) { return (b.simHas ? b.sim : -Infinity) - (a.simHas ? a.sim : -Infinity) || b.n - a.n; });   // シミュΣの大きい順＝寄与の大きい銘柄が上
    var _amt = function(v, has, w) { return has ? React.createElement("span", { style: { color: _elPnlColor(v), fontWeight: w || 800 } }, _elPnlFmt(Math.round(v))) : React.createElement("span", { style: { color: "#ccc" } }, "—"); };
    var _nbCell = function(g) {
      var chips = _KB_NB.filter(function(k) { return g[k[0]] > 0; }).map(function(k) {
        return React.createElement("span", { key: k[0], title: k[0] === "unreached" ? "掃引αにOS1〜3で届かなかった＝αを下げれば拾える可能性" : k[0] === "x" ? "×見送り宣言後の到達＝実際には降りているので建てない" : k[0] === "noalpha" ? "その銘柄の推奨αが出せない（記録が薄い）／採用α未入力＝その取引は建てない" : "有効な取引行が無い（株数0・方式未選択）",
          style: { fontSize: 9, fontWeight: 700, color: k[2], background: k[3], border: "1px solid " + k[4], borderRadius: 4, padding: "0 5px", marginRight: 3, whiteSpace: "nowrap" } }, k[1] + g[k[0]]);
      });
      return chips.length ? React.createElement("span", null, chips) : React.createElement("span", { style: { color: "#ccc" } }, "—");
    };
    var tot = { n: 0, built: 0, sim: 0, conv: 0 };
    list.forEach(function(g) { tot.n += g.n; tot.built += g.built; if (g.simHas) tot.sim += g.sim; if (g.convHas) tot.conv += g.conv; });
    var rows2 = list.map(function(g) {
      var d = (g.simHas || g.convHas) ? (g.sim - g.conv) : null;
      return React.createElement("tr", { key: g.stock, style: { background: (g.simHas && g.sim < 0) ? "#FEF2F2" : "transparent" } },
        _elv2Td(React.createElement("span", { style: { fontWeight: 700, color: g.built ? "#334155" : "#94A3B8" } }, g.stock), { textAlign: "left", paddingLeft: 8 }),
        _elv2Td(g.n + "件"),
        _elv2Td(React.createElement("span", { style: { fontWeight: 700, color: g.built ? "#0F766E" : "#94A3B8" } }, g.built + "件")),
        _elv2Td(_nbCell(g), { textAlign: "left" }),
        _elv2Td(_amt(g.conv, g.convHas, 700)),
        _elv2Td(_amt(g.sim, g.simHas)),
        _elv2Td(d == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _amt(d, true)));
    });
    return React.createElement("div", { style: { marginTop: 10 } },
      React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#0F766E", margin: "2px 0 4px" } }, "銘柄別の内訳 〜合計が1銘柄に引っ張られていないか〜"),
      React.createElement(_HScrollBox, null, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        // 2026-07-20j 列順を 従来Σ → シミュΣ → 差額 に修正＝マスター表(_kbMasterTableの_sumRow)と同じ「従来はシミュの左」に揃える（ユーザー指摘）
        React.createElement("thead", null, React.createElement("tr", null, ["銘柄", "対象", "建った", "建たなかった理由", "従来Σ", "シミュΣ", "差額"].map(function(h, i) { return React.createElement("th", { key: i, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, h); }))),   // 2026-07-20h _elv2Th(h,i)はkeyを受け取らない実装＝配列に渡すとReactのkey警告が出るため直接createElement
        React.createElement("tbody", null, rows2),
        React.createElement("tfoot", null, React.createElement("tr", { style: { background: "#FFFBF5" } },
          _elv2Td(React.createElement("b", null, "合計"), { textAlign: "left", paddingLeft: 8, borderTop: "2px solid #E4DFD7" }),
          _elv2Td(tot.n + "件", { borderTop: "2px solid #E4DFD7" }),
          _elv2Td(React.createElement("b", { style: { color: "#0F766E" } }, tot.built + "件"), { borderTop: "2px solid #E4DFD7" }),
          _elv2Td("", { borderTop: "2px solid #E4DFD7" }),
          _elv2Td(_amt(tot.conv, true, 700), { borderTop: "2px solid #E4DFD7" }),
          _elv2Td(_amt(tot.sim, true), { borderTop: "2px solid #E4DFD7" }),
          _elv2Td(_amt(tot.sim - tot.conv, true), { borderTop: "2px solid #E4DFD7" }))))),
      React.createElement("div", { style: { fontSize: 9.5, color: "#94A3B8", marginTop: 4, lineHeight: 1.5 } },
        "対象＝建った＋建たなかった理由の各件数（理由は1記録に1つ・×見送り＞α不明＞未到達の優先順）。従来Σはシミュで建たなかった記録も含む全対象＝「実際の採用αで" + nShares + "株建てていたら」の基準なので、建った件数が少ない銘柄ほど差額は不利に出る。"));
  };
  var _kbMasterTable = function(cfgCalc, cfgLabel, nShares, cutOf) {
    if (!cfgCalc || !(nShares > 0)) return null;
    var _cutOf = cutOf || function(r) { return { cut: aiOf(r).cutLine, ov: false }; };   // シミュ損切列の値（{cut,ov}）。省略時＝各記録の実際の損切り値 2026-07-05
    var _bAgg = _kbConvSums(nShares);
    var cfgSum = cfgCalc.sum, baseSum = _bAgg.sum, upl = (cfgSum != null && baseSum != null) ? (cfgSum - baseSum) : null;
    var cfgRef = cfgCalc.sumRef, baseRef = _bAgg.sumRef;   // （）内差分の合計 2026-07-03
    var uplRef = cfgRef - baseRef;   // 差額の（）内側＝（）内合計（main+ref）同士の差と（）外差額の差分。0なら（）外差額と同じ＝括弧非表示 2026-07-04
    var mrecs = [];
    cfgCalc.rows.forEach(function(row, i) {
      var r = row.r, s = r && r.signal; if (!s) return;
      var _cv = _kbConvParts(r, nShares);
      var _sa = []; (row.cells || []).forEach(function(c) { if (c.t.add > 0 && c.t.a != null && !isNaN(c.t.a)) { var av = Math.round(c.t.a); if (_sa.indexOf(av) < 0) _sa.push(av); } }); _sa.sort(function(p, q) { return p - q; });   // この配分(シミュ)が各記録で使ったα＝推奨基本α値なら recoOf(日付)。採用αとの差の理由を可視化 2026-07-03
      var _cc = _cutOf(r);
      // 実効αに実際に乗った浮き足加算／RN加算＝tierの_uki・_rnの最大（採用α±X方式のtierは0＝どちらも採用αに内包済み）。フィールドを持たない旧経路は記録値へフォールバック 2026-07-20／RNは07-20b
      var _tMax = function(key, fb) { var m = null; (row.cells || []).forEach(function(c) { if (!(c.t && c.t.add > 0 && c.t.a != null)) return; var v = (c.t[key] != null) ? c.t[key] : fb; if (m == null || v > m) m = v; }); return (m == null) ? fb : m; };
      var _exU = _tMax("_uki", _elUkiAdd(s)), _exR = _tMax("_rn", _elRnAdd(s));
      var _perTx = (row.cells || []).some(function(c) { return c.t && c.t._addA != null; });   // 手動＝tierに取引ごと追加αを持つ／自動＝持たない
      var _addAs = [];
      if (_perTx) { (row.cells || []).forEach(function(c) { var v = c.t && c.t._addA; if (v != null && v > 0 && _addAs.indexOf(v) < 0) _addAs.push(v); }); _addAs.sort(function(p, q) { return p - q; }); }   // 取引ごとに異なりうる追加αの実値（>0のみ・昇順）
      else { var _g = _simAddOf(r) - _elUkiAdd(s) - _elRnAdd(s); if (_g > 0) _addAs.push(_g); }   // 自動配分＝グローバルaddOn（据え置き・現行は_simAddOf=浮き足+RNなので常に0）。_exU/_exRと切り離す＝採用α方式で0でも浮き足/RNを「追」に誤表示しない 2026-07-20b
      mrecs.push({ oi: i, r: r, s: s, a: aiOf(r).alpha, recoA: _recoOfRec(r), simA: _sa, simUki: _exU, simRn: _exR, simAddOn: _addAs, simCut: _cc.cut, simCutOv: _cc.ov, cfgPnl: row.recPnl, cfgRef: row.recRef, basePnl: _cv.main, baseRef: _cv.ref, cells: row.cells, anyStop: row.anyStop, noBuild: row.noBuild });   // noBuild=建たなかった理由（2026-07-20k・シミュ列に表示）
    });
    mrecs.sort(function(x, y) { var dx = (x.r.date || "") + (x.s.time || ""), dy = (y.r.date || "") + (y.s.time || ""); return dx < dy ? 1 : dx > dy ? -1 : 0; });
    var _sumRow = function(k) { return React.createElement("tr", { key: k, style: { background: "#E1F5EE" } },
      React.createElement("td", { colSpan: 8, style: { padding: "4px 6px", fontSize: 10, fontWeight: 700, color: "#0F766E", whiteSpace: "nowrap" } }, "合計（" + mrecs.length + "件）"),
      _mtTd(_mtPnlNode2(baseSum, baseRef), "right"), _mtTd(_mtPnlNode2(cfgSum, cfgRef), "center", true), _mtTd(_mtPnlNode2(upl, uplRef), "right"), React.createElement("td", null)); };
    var brows = [];
    mrecs.forEach(function(m, i) {
      var s = m.s, a = m.a, diff = (m.basePnl == null && m.cfgPnl == null) ? null : ((m.cfgPnl || 0) - (m.basePnl || 0)), diffRef = (m.cfgRef || 0) - (m.baseRef || 0);   // 両方—なら—・片側—は0円扱いで常にシミュ−従来（従来のみ数値の時に符号が＋になるバグ修正 2026-07-04）。diffRef=（）内側の差額差分 2026-07-04b
      var key = "mt" + m.oi, open = mtExp === key;   // 元インデックス基準の安定キー（ソート非依存）2026-07-03
      var dstr = (m.r.date || "").slice(5).replace("-", "/") + (s.time ? " " + s.time : "");
      var alphaNode = _elAlphaTypeCell(s, a);
      brows.push(React.createElement("tr", { key: key, onClick: function() { setMtExp(open ? null : key); }, style: { cursor: "pointer", background: open ? "#F0FDFA" : (m.anyStop ? "#F4FBF5" : "transparent") } },
        _mtTd(dstr), _mtTd(_epOsChainCell(s, a)), _mtTd(_epECell(s, a), "center"), _mtTd(React.createElement("span", { style: { color: "#0369A1", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, m.recoA != null ? (m.recoA + "円") : "—")), _mtTd(alphaNode), _mtTd(React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("span", { style: { color: "#0F766E", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, m.simA.length ? m.simA.map(function(v) { return v + "円"; }).join("/") : "—"), (m.simA.length && (m.simUki > 0 || m.simRn > 0 || (m.simAddOn && m.simAddOn.length))) ? React.createElement("div", { style: { fontSize: 8, color: "#0D9488", fontWeight: 400, whiteSpace: "nowrap" } }, "（" + [m.simUki > 0 ? "浮" + m.simUki : null, m.simRn > 0 ? "RN" + m.simRn : null, (m.simAddOn && m.simAddOn.length) ? "追" + m.simAddOn.join("/") : null].filter(function(x) { return x; }).join("+") + "込）") : null)), _mtTd(React.createElement("span", { style: { color: "#0F766E", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, (function() { var lv = (s && s.levelPrice != null && s.levelPrice !== "" && !isNaN(Number(s.levelPrice))) ? Number(s.levelPrice) : null; return (lv != null && m.simA.length) ? m.simA.map(function(v) { return (Math.round((lv + v) * 100) / 100) + "円"; }).join("/") : "—"; })()), "right"), _mtTd(React.createElement("span", { style: { color: m.simCutOv ? "#B45309" : "#94a3b8", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, m.simCut != null ? (m.simCut + "円") : "—"), "center"), _mtTd(_mtPnlNode2(m.basePnl, m.baseRef), "right"), _mtTd(_mtSimCell(m), "center", true), _mtTd(_mtPnlNode2(diff, diffRef), "right"), _mtTd(React.createElement("span", { style: { color: "#0F766E", fontSize: 9 } }, open ? "▲" : "▼"), "center")));
      if (open) brows.push(React.createElement("tr", { key: key + "_d" }, React.createElement("td", { colSpan: 12, style: { padding: "6px 10px", background: "#FBFEFD", borderBottom: "1px solid #eee", fontSize: 9.5, color: "#9A3412" } }, React.createElement("span", { style: { fontWeight: 700 } }, "取引内訳: "), _mtTierNodes(m.cells))));
    });
    return React.createElement("div", { style: { marginTop: 8 } },
      React.createElement("div", { style: { overflowX: "auto", border: "0.5px solid #e8e3d8", borderBottom: "none", borderRadius: "10px 10px 0 0" } },
        React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 730 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#F0FDFA", color: "#0F766E" } },
              _mtTh("日付"), _mtTh("OS連鎖（次足期待度）"), _mtTh("E", "center"), _mtTh("推奨α"), _mtTh("採用α"), _mtTh("シミュα"), _mtTh("予定EP", "right"), _mtTh("シミュ損切", "center"), _mtTh("従来", "right"), _mtTh("シミュレーション", "center", true), _mtTh("差額", "right"), _mtTh(""))),
          React.createElement("tbody", null, brows),
          React.createElement("tfoot", null, _sumRow("f")))),
      _mtBar(cfgSum, cfgRef, cfgLabel, baseSum, baseRef, upl, uplRef, true));
  };
  var _card = function(label, node, sub) {
    return React.createElement("div", { key: label, style: { flex: "1 1 148px", minWidth: 138, background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "8px 12px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 9.5, color: "#999", fontWeight: 700, marginBottom: 2 } }, label),
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800, lineHeight: 1.2, whiteSpace: "normal", wordBreak: "keep-all" } }, node),
      sub ? React.createElement("div", { style: { fontSize: 8.5, color: "#aaa", marginTop: 2, whiteSpace: "normal" } }, sub) : null);
  };
  var _pnlNode = function(v, big) { return React.createElement("span", { style: { color: _elPnlColor(v), fontSize: big ? 17 : undefined } }, _elPnlFmt(v)); };
  var _pnlNode2 = function(main, ref, big) { return React.createElement("span", { style: { whiteSpace: "nowrap" } }, React.createElement("span", { style: { color: _elPnlColor(main), fontSize: big ? 17 : undefined } }, _elPnlFmt(main)), (ref ? React.createElement("span", { style: { color: "#999", fontSize: big ? 11 : 9, marginLeft: 1 } }, "（" + _elPnlFmt(main + ref) + "）") : null)); };   // （）外＋（）内併記 2026-07-03
  // 掃引αがOS高値の最大とちょうど一致した記録の件数（＝シミュ版の「指値同値」2026-07-20d）。
  // シミュの到達判定は _epResolve の `高値 >= α` なので、αがOS高値ちょうどでも「刺さった」扱いになる＝予定EPに触れただけの可能性を含む楽観側。
  // 実績の指値同値(_elFillRisk・app-05)はα総当たり系に配線しない方針（同関数のコメント）なので損益からは除外せず、件数だけ出して可視化する。
  // ただし「その記録の採用αと一致し、かつ実際に約定している(_elIsEntered)」ケースは約定した証拠があるので数えない。
  var _fillEqN = function(calc) {
    var n = 0;
    (calc.rows || []).forEach(function(row) {
      var r = row.r, s = r && r.signal; if (!s) return;
      var osMax = _elOsMaxAll(s); if (osMax == null) return;
      var adoptA = aiOf(r).alpha, entered = _elIsEntered(s, r.item);
      var hit = (row.cells || []).some(function(c) {
        if (!(c.t && c.t.add > 0 && c.t.a != null)) return false;
        if (Math.round(c.t.a) !== Math.round(osMax)) return false;
        return !(entered && adoptA != null && Math.round(c.t.a) === Math.round(adoptA));
      });
      if (hit) n++;
    });
    return n;
  };
  var _notesLine = function(calc) {
    var parts = [];
    if (calc.unreachedRecN) parts.push("EP未到達" + calc.unreachedRecN + "件（掃引αにOS1〜3で届かず建たない）");   // 2026-07-20f 追加＝「対象−建玉あり」の最大の塊。従来はフラグが無く注記に出ていなかった
    if (calc.xRecN) parts.push("×見送りのみ" + calc.xRecN + "件（建てない）");
    if (calc.indetRecN) parts.push("判定不可の取引あり" + calc.indetRecN + "件（その取引は損益に不算入）");
    if (calc.noBaseRecN) parts.push("推奨α不明" + calc.noBaseRecN + "件（その取引は建てない）");
    var _fq = _fillEqN(calc);
    if (_fq) parts.push("指値同値" + _fq + "件（掃引αがOS高値の最大とちょうど一致＝予定EPに触れただけで約定しなかった可能性あり・損益からは除外していません）");
    return parts.length ? React.createElement("div", { style: { fontSize: 9, color: "#B45309", marginTop: 3 } }, "※ " + parts.join("・")) : null;
  };
  // ===== A/B比較モードの表示部品（案3＝左右2カラム）2026-07-24 =====
  var _cmpBar = function(aSum, aRef, bSum, bRef) {   // 合計バー: 設定A / 設定B(白ピル) / 差額(B−A)
    var diff = (aSum != null && bSum != null) ? (bSum - aSum) : null, diffRef = (bRef || 0) - (aRef || 0);
    var _in = function(m, rf) { return (m != null && rf) ? React.createElement("span", { style: { fontSize: 10, opacity: 0.8, marginLeft: 1 } }, "（" + _elPnlFmt(m + rf) + "）") : null; };
    return React.createElement("div", { style: { background: "#0F766E", color: "#fff", padding: "8px 12px", display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", borderRadius: "10px 10px 0 0" } },
      React.createElement("span", { style: { fontSize: 9.5, opacity: 0.85 } }, "合計"),
      React.createElement("span", { style: { fontSize: 11 } }, "設定A ", React.createElement("b", { style: { fontSize: 15 } }, aSum == null ? "—" : _elPnlFmt(aSum)), _in(aSum, aRef)),
      React.createElement("span", { style: { fontSize: 11, background: "#fff", color: "#0F766E", borderRadius: 6, padding: "1px 8px" } }, "設定B ", React.createElement("b", { style: { fontSize: 15 } }, bSum == null ? "—" : _elPnlFmt(bSum)), _in(bSum, bRef)),
      React.createElement("span", { style: { fontSize: 11 } }, "差額(B−A) ", React.createElement("b", { style: { fontSize: 15 } }, diff == null ? "—" : _elPnlFmt(diff)), _in(diff, diffRef)));
  };
  // 比較マスター表: 記録ごとに 設定A / 設定B / 差額(B−A)。cA/cB=_mkCmpCfg結果（pool同一なのでrowsはindex整合）。_mtSimCell/_mtTierNodes/_mtPnlNode2を流用。
  var _kbCmpTable = function(cA, cB) {
    if (!cA.calc || !cB.calc) return null;
    var rowsA = cA.calc.rows, rowsB = cB.calc.rows;
    var _saOf = function(cells) { var sa = []; (cells || []).forEach(function(c) { if (c.t.add > 0 && c.t.a != null && !isNaN(c.t.a)) { var av = Math.round(c.t.a); if (sa.indexOf(av) < 0) sa.push(av); } }); sa.sort(function(p, q) { return p - q; }); return sa; };
    var recs2 = [];
    for (var i = 0; i < rowsA.length; i++) { var rA = rowsA[i], rB = rowsB[i]; var r = rA.r, s = r && r.signal; if (!s) continue; recs2.push({ oi: i, r: r, s: s, rA: rA, rB: rB }); }
    recs2.sort(function(x, y) { var dx = (x.r.date || "") + (x.s.time || ""), dy = (y.r.date || "") + (y.s.time || ""); return dx < dy ? 1 : dx > dy ? -1 : 0; });
    var aSum = cA.calc.sum, aRef = cA.calc.sumRef, bSum = cB.calc.sum, bRef = cB.calc.sumRef;
    var diff = bSum - aSum, diffRef = (bRef || 0) - (aRef || 0);
    var _mCell = function(row) { return _mtSimCell({ noBuild: row.noBuild, cfgPnl: row.recPnl, cfgRef: row.recRef, cells: row.cells }); };
    var brows = [];
    recs2.forEach(function(m) {
      var key = "cmp" + m.oi, open = cmpExp === key;
      var dstr = (m.r.date || "").slice(5).replace("-", "/") + (m.s.time ? " " + m.s.time : "") + (allStock && m.r.stock ? " " + m.r.stock : "");
      var dA = (m.rA.recPnl == null && m.rB.recPnl == null) ? null : ((m.rB.recPnl || 0) - (m.rA.recPnl || 0));   // 差額＝設定B−設定A（片側—は0円扱い・両方—なら—）
      var dRef = (m.rB.recRef || 0) - (m.rA.recRef || 0);
      var adoptA = aiOf(m.r).alpha;
      brows.push(React.createElement("tr", { key: key, onClick: function() { setCmpExp(open ? null : key); }, style: { cursor: "pointer", background: open ? "#F0FDFA" : "transparent" } },
        _mtTd(dstr), _mtTd(React.createElement("span", { style: { color: "#334155", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, adoptA != null ? (adoptA + "円") : "—"), "center"),
        _mtTd(_mCell(m.rA), "center"), _mtTd(_mCell(m.rB), "center", true), _mtTd(_mtPnlNode2(dA, dRef), "right"),
        _mtTd(React.createElement("span", { style: { color: "#0F766E", fontSize: 9 } }, open ? "▲" : "▼"), "center")));
      if (open) {
        var saA = _saOf(m.rA.cells), saB = _saOf(m.rB.cells);
        var cutA = cA.cutInfo(m.r).cut, cutB = cB.cutInfo(m.r).cut;
        brows.push(React.createElement("tr", { key: key + "_d" }, React.createElement("td", { colSpan: 6, style: { padding: "6px 10px", background: "#FBFEFD", borderBottom: "1px solid #eee", fontSize: 9.5, lineHeight: 1.6 } },
          React.createElement("div", { style: { marginBottom: 3 } }, React.createElement("b", { style: { color: "#0F6E56" } }, "設定A"), React.createElement("span", { style: { color: "#64748b", margin: "0 4px" } }, "α" + (saA.length ? saA.map(function(v) { return v + "円"; }).join("/") : "—") + "・損切り" + (cutA != null ? cutA + "円" : "—") + "："), _mtTierNodes(m.rA.cells)),
          React.createElement("div", null, React.createElement("b", { style: { color: "#0C447C" } }, "設定B"), React.createElement("span", { style: { color: "#64748b", margin: "0 4px" } }, "α" + (saB.length ? saB.map(function(v) { return v + "円"; }).join("/") : "—") + "・損切り" + (cutB != null ? cutB + "円" : "—") + "："), _mtTierNodes(m.rB.cells)))));
      }
    });
    var _sumRow = React.createElement("tr", { style: { background: "#E1F5EE" } },
      React.createElement("td", { colSpan: 2, style: { padding: "4px 6px", fontSize: 10, fontWeight: 700, color: "#0F766E", whiteSpace: "nowrap" } }, "合計（" + recs2.length + "件）"),
      _mtTd(_mtPnlNode2(aSum, aRef), "center"), _mtTd(_mtPnlNode2(bSum, bRef), "center", true), _mtTd(_mtPnlNode2(diff, diffRef), "right"), React.createElement("td", null));
    return React.createElement("div", { style: { marginTop: 8 } },
      _cmpBar(aSum, aRef, bSum, bRef),
      React.createElement("div", { style: { overflowX: "auto", border: "0.5px solid #e8e3d8", borderTop: "none", borderRadius: "0 0 10px 10px" } },
        React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 520 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "#F0FDFA", color: "#0F766E" } },
            _mtTh("日付"), _mtTh("採用α", "center"), _mtTh("設定A", "center"), _mtTh("設定B", "center", true), _mtTh("差額(B−A)", "right"), _mtTh(""))),
          React.createElement("tbody", null, brows),
          React.createElement("tfoot", null, _sumRow))));
  };
  // A/B比較の1設定ぶんの編集カラム。tag="A"/"B"・cfg=_mkCmpCfg結果。手動ラダーのUI helpers(_upd/_stepCum/_stepOff/_rowInputs/_addRow)を設定ごとにbindし直したもの（取引ごと追加α行は現行未描画なので省略）。
  var _cmpCol = function(tag, cfgRows, cfgSet, cfgStop, cfgSetStop, cfg, accent, bg) {
    var eRows = cfg.eRows;
    var _upd = function(i, patch) { cfgSet(cfgRows.map(function(x, j) { return j === i ? Object.assign({}, x, patch) : x; })); };
    var _stepCum = function(i, d) { cfgSet(cfgRows.map(function(x, j) { if (j !== i) return x; var c = _kbInt(x.cum); c = (c == null ? 0 : c) + d; if (c < 0) c = 0; return Object.assign({}, x, { cum: String(c) }); })); };
    var _stepOff = function(i, d) { cfgSet(cfgRows.map(function(x, j) { if (j !== i) return x; var c = _kbInt(x.off); c = (c == null ? 0 : c) + d; if (x.method === "abs" && c < 0) c = 0; return Object.assign({}, x, { off: String(c) }); })); };
    var _stepStop = function(d) { cfgSetStop(function(prev) { var c = _kbInt(prev); c = (c == null ? 0 : c) + d; return String(c); }); };
    var _addRow = function() { cfgSet(cfgRows.concat([{ method: "", off: "0", cum: "100", addMethod: "act", addOff: "" }])); };
    var _rowInputs = function(rw, i) {
      var _cumIn = React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
        React.createElement("input", { type: "text", inputMode: "numeric", value: rw.cum, onChange: function(e) { _upd(i, { cum: e.target.value }); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
        _stepBtn(function() { _stepCum(i, 100); }, function() { _stepCum(i, -100); }));
      if (rw.method === "recobase") return React.createElement(React.Fragment, null, React.createElement("span", { style: { fontSize: 10.5 } }, "推奨基本α値で"), _cumIn, React.createElement("span", { style: { fontSize: 10.5 } }, "株"));
      var _offIn = React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
        React.createElement("input", { type: "text", inputMode: "numeric", value: rw.off, onChange: function(e) { _upd(i, { off: e.target.value }); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
        _stepBtn(function() { _stepOff(i, 1); }, function() { _stepOff(i, -1); }));
      return React.createElement(React.Fragment, null, React.createElement("span", { style: { fontSize: 10.5 } }, rw.method === "abs" ? "α" : rw.method === "adopt" ? "採用α" : "推奨α"), _offIn, React.createElement("span", { style: { fontSize: 10.5 } }, "円で"), _cumIn, React.createElement("span", { style: { fontSize: 10.5 } }, "株"));
    };
    var _prev = (function() {
      var parts = [], tot = 0;
      eRows.forEach(function(rw) {
        if (rw.method !== "abs" && rw.method !== "reco" && rw.method !== "recobase" && rw.method !== "adopt") return;
        var sh = _kbInt(rw.cum); if (sh == null || sh <= 0) return;
        if (rw.method === "abs" && _kbInt(rw.off) == null) return;
        var off = _kbInt(rw.off); off = (off == null ? 0 : off);
        var lbl = rw.method === "abs" ? ("α" + Math.max(0, off) + "円") : rw.method === "recobase" ? "推奨基本α値" : rw.method === "adopt" ? ("採用α" + (off >= 0 ? "+" : "") + off + "円") : ("推奨α" + (off >= 0 ? "+" : "") + off + "円");
        parts.push(lbl + "で" + sh + "株"); tot += sh;
      });
      return parts.length ? (parts.join(" ＋ ") + (parts.length > 1 ? (" ＝ 合計" + tot + "株") : "")) : "有効な取引がありません";
    })();
    var rowNodes = eRows.map(function(rw, i) {
      var _baseSel = React.createElement("select", { value: rw.method || "", onChange: function(e) { _upd(i, { method: e.target.value }); }, style: { padding: "3px 6px", fontSize: 10.5, fontWeight: 700, color: rw.method ? "#0F766E" : "#aaa", border: "1px solid #ddd", borderRadius: 5, background: "#fff" } }, [React.createElement("option", { key: "_none", value: "" }, "（未選択）")].concat(_METHODS.map(function(mm) { return React.createElement("option", { key: mm.key, value: mm.key }, mm.short); })));
      return React.createElement("div", { key: i, style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", marginBottom: 6, background: "#fff" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 } },
          React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: accent, whiteSpace: "nowrap" } }, multiTrade ? ("第" + (i + 1) + "取引") : "取引"),
          React.createElement("div", { style: { display: "flex", gap: 4 } },
            React.createElement("button", { onClick: function() { _upd(i, { method: "", off: "", cum: "", addMethod: "act", addOff: "" }); }, title: "この取引の条件を無に（リセット）", style: { padding: "2px 8px", fontSize: 10, fontWeight: 700, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#0F766E", cursor: "pointer", whiteSpace: "nowrap" } }, "↺"),
            (multiTrade && eRows.length > 1) ? React.createElement("button", { onClick: function() { cfgSet(cfgRows.filter(function(x, j) { return j !== i; })); }, style: { padding: "2px 8px", fontSize: 10, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#888", cursor: "pointer" } }, "🗑") : null)),
        React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } },
          React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, color: "#64748b", minWidth: 30 } }, "α値"),
          _baseSel,
          (rw.method === "abs" || rw.method === "reco" || rw.method === "recobase" || rw.method === "adopt") ? _rowInputs(rw, i) : React.createElement("span", { style: { fontSize: 10, color: "#bbb" } }, "方式を選択")));
    });
    var _totNode = cfg.calc ? React.createElement("span", { style: { fontSize: 11, whiteSpace: "nowrap" } }, React.createElement("b", { style: { color: _elPnlColor(cfg.calc.sum), fontSize: 15 } }, _elPnlFmt(cfg.calc.sum)), React.createElement("span", { style: { fontSize: 9, color: "#94a3b8", marginLeft: 4 } }, "建玉" + cfg.calc.builtRecN + "件・" + cfg.manTot + "株")) : React.createElement("span", { style: { fontSize: 10, color: "#bbb" } }, "株数未入力");
    return React.createElement("div", { style: { flex: "1 1 300px", minWidth: 268, border: "2px solid " + accent, borderRadius: 10, padding: "8px 10px", background: bg } },
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6, marginBottom: 6, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: accent } }, "設定" + tag),
        _totNode),
      rowNodes,
      multiTrade ? React.createElement("button", { onClick: _addRow, style: { padding: "3px 12px", fontSize: 10.5, fontWeight: 700, border: "1px dashed " + accent, borderRadius: 6, background: "#fff", color: accent, cursor: "pointer", marginBottom: 6 } }, "＋ 取引を追加") : null,
      React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "5px 8px" } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#B45309", whiteSpace: "nowrap" } }, "🛑 損切り"),
        React.createElement("span", { style: { fontSize: 10, whiteSpace: "nowrap" } }, "推奨基本α +"),
        React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff" } },
          React.createElement("input", { type: "text", inputMode: "numeric", value: cfgStop, onChange: function(e) { cfgSetStop(e.target.value); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0, width: 44 }) }),
          _stepBtn(function() { _stepStop(1); }, function() { _stepStop(-1); })),
        React.createElement("span", { style: { fontSize: 10 } }, "円"),
        cfgStop !== "" ? React.createElement("button", { onClick: function() { cfgSetStop(""); }, style: { padding: "2px 6px", fontSize: 9.5, fontWeight: 700, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#B45309", cursor: "pointer", whiteSpace: "nowrap" } }, "↺記録値") : React.createElement("span", { style: { fontSize: 9, color: "#94a3b8" } }, "空欄=記録値")),
      React.createElement("div", { style: { fontSize: 9, color: "#666", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "3px 7px" } }, _prev));
  };
  // ===== 本体 =====
  var _stkN = (function() { if (!allStock) return 0; var m = {}; pool.forEach(function(r) { if (r && r.stock) m[r.stock] = 1; }); return Object.keys(m).length; })();
  var head = React.createElement(React.Fragment, null,
    allStock ? React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E" } }, "母数:"),
      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, color: "#0F6E56", background: "#E4EFEC", borderRadius: 5, padding: "1px 8px" } }, _stkN + "銘柄・" + pool.length + "件"),
      React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "全銘柄・全シグナルの記録に同じラダーを一律適用")) : null,
    React.createElement(_ElPeriodPicker, { value: pSel, onChange: function(s) { setPSel(s); setAutoExp(null); setMtExp(null); }, recs: recs, label: "対象期間" }), (allStock ? React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } }, React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E" } }, "対象銘柄:"), [["__all__", "全て"]].concat(_stkOpts.map(function(s) { return [s, s]; })).map(function(kv) { return _pill(stkFil === kv[0], kv[1], function() { setStkFil(kv[0]); setAutoExp(null); setMtExp(null); }, "#0F766E"); }), React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, stkFil === "__all__" ? ("（" + _stkOpts.length + "銘柄）銘柄を選ぶと母数を絞り込みます") : ("（" + stkFil + "のみ）"))) : null),   // 2026-07-20i 年月週日カスケード（既定＝今月のみ）
    floatMode
      ? React.createElement("div", { style: { fontSize: 9.5, color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "4px 8px", marginBottom: 6 } }, "母数＝浮き足の記録（" + pool.length + "件）。浮き足〇は土台α無し＝実効α＝各記録の浮き足加算（採用加算率）＋RN自動加算のみ。※このタブでは絶対値／推奨α±X／推奨基本α値を選んでも実効αは変わりません（土台αが常に0のため）。αを掃引したいときは「採用α±X」方式を使ってください。")   // 2026-07-20d 明記（旧「浮き値÷2切捨てを上乗せ」＝加算率可変化で古く、かつ候補α＋浮き足と読めて誤解を招いた）
      : React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "分類:"),
          [["all", "全記録"], ["no", "基本α"], ["yes", "応用α"]].map(function(kv) { return _pill(addFil === kv[0], kv[1], function() { setAddFil(kv[0]); setAutoExp(null); setMtExp(null); }, "#9A3412"); }),   // mtExpも解除＝母数が変わると展開キー(oi)が別記録を指すため 2026-07-04c
          React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "（" + pool.length + "件）既定＝基本α＝応用αを使わなかった記録（浮き足/RN加算は含みうる）")),
    React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#B45309" } }, "除外:"),
      // 2026-07-20k 浮き足〇のみに縮小（ライン併存＝概念を使わなくなった／RN〇＝除外しても動的再判定は止まらず誤解を招くだけだった）
      (!floatMode ? [["uki", "浮き足〇"]] : []).map(function(kv) {
        var on = !!exFlags[kv[0]];
        return React.createElement("button", { key: kv[0], type: "button", onClick: function() { var nf = Object.assign({}, exFlags); nf[kv[0]] = !on; setExFlags(nf); setAutoExp(null); setMtExp(null); },
          style: { padding: "3px 10px", fontSize: 10.5, fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid " + (on ? "#B45309" : "#ddd"), background: on ? "#FFF7ED" : "#fff", color: on ? "#B45309" : "#666", whiteSpace: "nowrap" } }, (on ? "☑ " : "☐ ") + kv[1]);
      }),
      (exFlags.uki && !floatMode)
        ? React.createElement("span", { style: { fontSize: 9.5, fontWeight: 800, color: _exCount > 0 ? "#B45309" : "#C0392B", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 5, padding: "1px 7px" } }, _exCount > 0 ? (_exCount + "件を除外中（対象 " + pool.length + "件）") : "除外0件＝浮き足〇の記録がこの母数にありません")
        : React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "浮き足〇の記録をシミュ母数から除外（現在 " + pool.length + "件）"),
      _collN > 0 ? React.createElement("span", { style: { fontSize: 9.5, fontWeight: 800, color: "#6B7280", background: "#F3F4F6", border: "1px solid #D1D5DB", borderRadius: 5, padding: "1px 7px" } }, "時間かぶり除外 " + _collN + "件") : null,   // 2026-07-20b 他のP&L集計と同じ被り除外を適用中であることの可視化（常時ON・チェックではない）
      (rnAuto && _noLvN > 0) ? React.createElement("span", { title: "水準線値が未入力の記録は予定EPが出せないためRNまたぎ自動判定ができません。RN加算なし（0円）として掃引しています（母数からは外していません）。", style: { fontSize: 9.5, fontWeight: 800, color: "#1D4ED8", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 5, padding: "1px 7px" } }, "水準線未入力 " + _noLvN + "件（RN自動判定なし）") : null),   // 2026-07-20c／2026-07-21a RN自動加算OFF時はこのバッジも不要
    // RN自動加算トグル 2026-07-21a（既定ON）: 全方式一律。ONで予定EP下二桁41-49/91-99を…50/…00へ／OFFで入力αそのまま。採用α±X系は元からRN込みで対象外。
    React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E" } }, "RN自動加算:"),
      React.createElement("button", { type: "button", onClick: function() { setRnAuto(!rnAuto); setAutoExp(null); setMtExp(null); },
        title: "予定EPの下二桁が41〜49／91〜99のとき…50/…00ちょうどまでαを自動で引き上げる（記録フォーム/EPナビと同じキリ番調整）。OFFにすると入力したαがそのまま効く（下二桁に依らず判定が安定）。採用α±X系は元からRN込みのため対象外。",
        style: { padding: "3px 10px", fontSize: 10.5, fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid " + (rnAuto ? "#0F766E" : "#ddd"), background: rnAuto ? "#F0FDFA" : "#fff", color: rnAuto ? "#0F766E" : "#666", whiteSpace: "nowrap" } }, (rnAuto ? "☑ " : "☐ ") + "乗せる"),
      React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, rnAuto ? "予定EP下二桁41〜49/91〜99を…50/…00へ（採用α±X系は元から込み）" : "入力したαをそのまま評価（キリ番調整なし）")),
    (mode === "auto" && _poolHasYes) ? React.createElement("div", { style: { fontSize: 9, color: "#9A3412", marginBottom: 6 } }, "応用〇の記録はその記録の応用α値を基底αに採用（絶対値/推奨α系の掃引対象外）。通常記録は候補αを掃引。※採用α±X系の候補なら応用〇・浮き足〇の記録も掃引されます。") : null);
  if (!pool.length) {
    return React.createElement("div", null, head,
      React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この母数に該当する記録がありません"));
  }
  var body;
  if (mode === "manual") {
    var _ladderPrev = (function() {   // 各取引の株数をそのまま足す（累積ではない）＝「α0円で100株 ＋ 推奨基本α値で400株 ＝ 合計500株」2026-07-05
      var parts = [], tot = 0;
      effRows.forEach(function(rw) {
        if (rw.method !== "abs" && rw.method !== "reco" && rw.method !== "recobase" && rw.method !== "adopt") return;   // 未選択は除外
        var sh = _kbInt(rw.cum); if (sh == null || sh <= 0) return;
        if (rw.method === "abs" && _kbInt(rw.off) == null) return;   // 2026-07-20d 絶対値でα欄が空＝_manTiersOfはどの記録でも建てない→プレビューにも出さない（旧: nullを0扱いして「α0円で100株」と嘘の行を出していた）
        var off = _kbInt(rw.off); off = (off == null ? 0 : off);
        var lbl = rw.method === "abs" ? ("α" + Math.max(0, off) + "円") : rw.method === "recobase" ? "推奨基本α値" : rw.method === "adopt" ? ("採用α" + (off >= 0 ? "+" : "") + off + "円") : ("推奨α" + (off >= 0 ? "+" : "") + off + "円");
        parts.push(lbl + "で" + sh + "株"); tot += sh;
      });
      return parts.length ? (parts.join(" ＋ ") + (parts.length > 1 ? (" ＝ 合計" + tot + "株") : "")) : "有効な取引がありません";   // 2026-07-20g 単一取引のときは「＝合計N株」を出さない（同じ数字の繰り返しになるため）
    })();
    var _addRow = function(mk) {
      var off = "0"; if (mk === "abs") { var lastOff = 0; rows.forEach(function(x) { if (x.method === "abs") { var o = _kbInt(x.off); if (o != null) lastOff = Math.max(lastOff, o); } }); off = String(lastOff + 5); }
      setRows(rows.concat([{ method: mk, off: off, cum: "100", addMethod: "act", addOff: "" }])); setAddPicker(false);   // 新規取引の既定株数=100・追加αは実追加α(act)既定 2026-07-05→2026-07-06
    };
    var _upd = function(i, patch) { setRows(rows.map(function(x, j) { return j === i ? Object.assign({}, x, patch) : x; })); };
    var _stepCum = function(i, delta) { setRows(function(prev) { return prev.map(function(x, j) { if (j !== i) return x; var c = _kbInt(x.cum); c = (c == null ? 0 : c) + delta; if (c < 0) c = 0; return Object.assign({}, x, { cum: String(c) }); }); }); };   // 株数を±100（新規記録画面の_stepBtnと同じ縦▲▼・長押しリピート）2026-07-03p
    var _stepOff = function(i, delta) { setRows(function(prev) { return prev.map(function(x, j) { if (j !== i) return x; var c = _kbInt(x.off); c = (c == null ? 0 : c) + delta; if (x.method === "abs" && c < 0) c = 0; return Object.assign({}, x, { off: String(c) }); }); }); };   // α値を±1（絶対値は0未満不可・推奨α±Xはマイナス可）2026-07-03r
    var _stepAddOff = function(i, delta) { setRows(function(prev) { return prev.map(function(x, j) { if (j !== i) return x; var c = _kbInt(x.addOff); c = (c == null ? 0 : c) + delta; if (x.addMethod === "abs" && c < 0) c = 0; return Object.assign({}, x, { addOff: String(c) }); }); }); };   // 追加αオフセットを±1（絶対値は0未満不可・推奨追加α±Xはマイナス可）2026-07-06
    var _stepStopOff = function(delta) { setStopOff(function(prev) { var c = _kbInt(prev); c = (c == null ? 0 : c) + delta; return String(c); }); };   // 損切りオフセットを±1（α値と同じ縦▲▼・マイナス可）2026-07-05
    var _rowInputs = function(rw, i) {
      var _cumIn = React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
        React.createElement("input", { type: "text", inputMode: "numeric", value: rw.cum, onChange: function(e) { _upd(i, { cum: e.target.value }); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
        _stepBtn(function() { _stepCum(i, 100); }, function() { _stepCum(i, -100); }));
      if (rw.method === "recobase") return React.createElement(React.Fragment, null, React.createElement("span", { style: { fontSize: 10.5 } }, "推奨基本α値で"), _cumIn, React.createElement("span", { style: { fontSize: 10.5 } }, "株"), React.createElement("span", { style: { fontSize: 9.5, color: "#0F766E" } }, "（α入力なし）"));
      var _offIn = React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
        React.createElement("input", { type: "text", inputMode: "numeric", value: rw.off, onChange: function(e) { _upd(i, { off: e.target.value }); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
        _stepBtn(function() { _stepOff(i, 1); }, function() { _stepOff(i, -1); }));
      return React.createElement(React.Fragment, null, React.createElement("span", { style: { fontSize: 10.5 } }, rw.method === "abs" ? "α" : rw.method === "adopt" ? "採用α" : "推奨α"), _offIn, React.createElement("span", { style: { fontSize: 10.5 } }, "円で"), _cumIn, React.createElement("span", { style: { fontSize: 10.5 } }, "株"), rw.method === "adopt" ? React.createElement("span", { style: { fontSize: 9, color: "#0F766E" } }, "（±X・浮き足/RN込みの実際のα起点）") : null);
    };
    // 追加α行の入力部品（_rowInputsのミラー）2026-07-06。act/recoadd=入力なしテキスト・abs/reco=＋[__]▲▼円（recoは±Xでマイナス可）
    var _addInputs = function(rw, i) {
      var _coup = ((rw.addMethod === "recoadd" || rw.addMethod === "reco") && rw.method && rw.method !== "recobase") ? React.createElement("span", { style: { fontSize: 9, color: "#B45309" } }, "※推奨基本α値と併用推奨") : null;   // 推奨追加α＝推奨基本αに何円足すかのデルタ＝基本αが別方式だと土台がズレる注記（基本α未選択時は非表示）2026-07-06
      if (rw.addMethod === "act") return React.createElement("span", { style: { fontSize: 9.5, color: "#9A3412" } }, "実追加α（記録の値）");
      if (rw.addMethod === "recoadd") return React.createElement(React.Fragment, null, React.createElement("span", { style: { fontSize: 9.5, color: "#9A3412" } }, "各取引日の推奨追加α値"), _coup);
      var _addIn = React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
        React.createElement("input", { type: "text", inputMode: "numeric", value: rw.addOff, onChange: function(e) { _upd(i, { addOff: e.target.value }); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
        _stepBtn(function() { _stepAddOff(i, 1); }, function() { _stepAddOff(i, -1); }));
      return React.createElement(React.Fragment, null, React.createElement("span", { style: { fontSize: 10.5 } }, rw.addMethod === "abs" ? "＋" : "推奨追加α"), _addIn, React.createElement("span", { style: { fontSize: 10.5 } }, "円"), rw.addMethod === "reco" ? React.createElement("span", { style: { fontSize: 9, color: "#9A3412" } }, "（±X）") : null, _coup);
    };
    var _manTot = _cfgTot(effRows);   // 2026-07-24 _cfgTot共通化（式は同一）。手動ラダーの合計株数＝各取引の株数の総和・未選択/絶対値でα空の行は建てないので数えない
    var _convMan = _manTot > 0 ? _kbConvSums(_manTot) : null;   // 従来（損益データ欄と同じ理論値×総株数按分）＝差額の基準（_kbMasterTableのbaseSumと同一計算）2026-07-04
    var _uplMan = (_convMan && manCalc) ? (manCalc.sum - _convMan.sum) : null;   // 差額＝シミュ−従来（＝マスター表の合計差額と一致）
    var _uplManRef = (_convMan && manCalc) ? (manCalc.sumRef - _convMan.sumRef) : null;   // 差額の（）内側差分（0なら（）非表示）2026-07-04b
    var _winN = 0; if (manCalc) manCalc.rows.forEach(function(_r) { if (_r.recPnl != null && _r.recPnl > 0) _winN++; });   // 勝ち＝建玉ありでシミュ損益プラス 2026-07-03r
    var _winRate = (manCalc && manCalc.builtRecN) ? _winN / manCalc.builtRecN : null;
    var _stopRate = (manCalc && manCalc.builtRecN) ? manCalc.stopRecN / manCalc.builtRecN : null;
    var _perShare = (manCalc && _manTot > 0) ? Math.round(manCalc.sum / _manTot * 10) / 10 : null;   // 1株あたり損益＝通算÷総株数
    body = React.createElement(React.Fragment, null,
      React.createElement("div", { style: { fontSize: 9.5, color: "#0F766E", fontWeight: 700, marginBottom: 6 } }, "取引ごとに『α値』の決め方を選べます（既定＝採用α±X）。採用α±X＝その記録の実際の採用α（浮き足・RN込みの合計α）＋X をそのまま実効αに使う＝応用〇・浮き足〇を含む全記録をそのまま掃引できます（±0＝従来の採用αと一致）。絶対値／推奨α±X／推奨基本α値の3方式は土台α（基底）を差し替える反実仮想シミュ＝応用〇はその記録の応用α値・浮き足〇は0を基底に固定し、実効α＝基底α＋浮き足加算＋RN自動加算で評価します"),
      React.createElement("div", { style: { marginBottom: 6 } },
        effRows.map(function(rw, i) {
          var _baseSel = React.createElement("select", { value: rw.method || "", onChange: function(e) { _upd(i, { method: e.target.value }); }, style: { padding: "3px 6px", fontSize: 10.5, fontWeight: 700, color: rw.method ? "#0F766E" : "#aaa", border: "1px solid #ddd", borderRadius: 5, background: "#fff" } }, [React.createElement("option", { key: "_none", value: "" }, "（未選択）")].concat(_METHODS.map(function(m) { return React.createElement("option", { key: m.key, value: m.key }, m.short); })));
          var _addSel = React.createElement("select", { value: rw.addMethod || "", onChange: function(e) { var v = e.target.value; var patch = { addMethod: v }; if (v === "abs" && (rw.addOff === "" || rw.addOff == null)) patch.addOff = "3"; _upd(i, patch); }, style: { padding: "3px 6px", fontSize: 10.5, fontWeight: 700, color: rw.addMethod ? "#9A3412" : "#aaa", border: "1px solid #E7C6B5", borderRadius: 5, background: "#fff" } }, [React.createElement("option", { key: "_none", value: "" }, "（なし）")].concat(_ADD_METHODS.map(function(m) { return React.createElement("option", { key: m.key, value: m.key }, m.short); })));
          return React.createElement("div", { key: i, style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", marginBottom: 6, background: "#fff" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 } },
              React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E", whiteSpace: "nowrap" } }, multiTrade ? ("第" + (i + 1) + "取引") : "取引"),   // 2026-07-20g ×＝1回だけなので「第1」を付けない
              React.createElement("div", { style: { display: "flex", gap: 4 } },
                React.createElement("button", { onClick: function() { _upd(i, { method: "", off: "", cum: "", addMethod: "act", addOff: "" }); }, title: "この取引の条件を無に（リセット）", style: { padding: "2px 8px", fontSize: 10, fontWeight: 700, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#0F766E", cursor: "pointer", whiteSpace: "nowrap" } }, "↺ リセット"),
                (multiTrade && effRows.length > 1) ? React.createElement("button", { onClick: function() { setRows(rows.filter(function(x, j) { return j !== i; })); }, style: { padding: "2px 8px", fontSize: 10, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#888", cursor: "pointer" } }, "🗑") : null)),
            React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 } },
              React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, color: "#64748b", minWidth: 34 } }, "α値"),
              _baseSel,
              (rw.method === "abs" || rw.method === "reco" || rw.method === "recobase" || rw.method === "adopt") ? _rowInputs(rw, i) : React.createElement("span", { style: { fontSize: 10, color: "#bbb" } }, "入力方式を選択")));
        }),
        !multiTrade ? null : addPicker
          ? React.createElement("div", { style: { border: "1px dashed #0F766E", borderRadius: 8, background: "#F0FDFA", padding: "8px 10px", marginTop: 4, maxWidth: 320 } },
              React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E", marginBottom: 6 } }, "追加する取引の入力方式を選択"),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                _METHODS.map(function(m) { return React.createElement("button", { key: m.key, onClick: function() { _addRow(m.key); }, style: { textAlign: "left", padding: "7px 11px", fontSize: 11.5, fontWeight: 700, border: "1px solid " + (m.key === "recobase" ? "#0F766E" : "#ddd"), borderRadius: 7, background: "#fff", color: "#0F766E", cursor: "pointer" } }, m.label); })),
              React.createElement("button", { onClick: function() { setAddPicker(false); }, style: { marginTop: 6, padding: "2px 6px", fontSize: 9.5, border: "none", background: "none", color: "#888", cursor: "pointer" } }, "キャンセル"))
          : React.createElement("button", { onClick: function() { setAddPicker(true); }, style: { padding: "3px 12px", fontSize: 10.5, fontWeight: 700, border: "1px dashed #0F766E", borderRadius: 6, background: "#F0FDFA", color: "#0F766E", cursor: "pointer", marginTop: 4 } }, "＋ 取引を追加")),
      React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "5px 8px" } },   // 損切り値＝推奨基本α値+X円（α値と同じ入力・空欄=各記録の実際の損切り値）2026-07-05
        React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, color: "#B45309", whiteSpace: "nowrap" } }, "🛑 損切り値"),
        React.createElement("span", { style: { fontSize: 10.5, whiteSpace: "nowrap" } }, "推奨基本α値 +"),
        React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
          React.createElement("input", { type: "text", inputMode: "numeric", value: stopOff, onChange: function(e) { setStopOff(e.target.value); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
          _stepBtn(function() { _stepStopOff(1); }, function() { _stepStopOff(-1); })),
        React.createElement("span", { style: { fontSize: 10.5, whiteSpace: "nowrap" } }, "円"),
        stopOff !== "" ? React.createElement("button", { onClick: function() { setStopOff(""); }, style: { padding: "2px 8px", fontSize: 10, fontWeight: 700, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#B45309", cursor: "pointer", whiteSpace: "nowrap" } }, "↺ 記録の値に戻す")
          : React.createElement("span", { style: { fontSize: 9, color: "#94a3b8" } }, "（空欄＝各記録の実際の損切り値）"),
        React.createElement("span", { style: { fontSize: 9, color: "#94a3b8" } }, "※損切りライン＝各取引のEP＋この損切り値（円）")),
      React.createElement("div", { style: { fontSize: 9.5, color: "#666", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 8px", marginBottom: 8 } }, "各取引の株数をそのまま空売り: " + _ladderPrev + " ※推奨系（推奨α±X・推奨基本α値）の実効αは記録ごと（日付時点）に変わります。実効α＝基底α（応用〇の記録は応用α値・候補αの掃引対象外）＋浮き足加算（浮き足〇の記録・採用加算率）＋RNまたぎ自動加算。※RNは掃引したαで予定EP（水準線＋基底α＋浮き足）を出し直し、下二桁が41〜49／91〜99なら…50/…00ちょうどまで自動加算＝αを変えるとRNの有無も変わります（記録の保存値は使いません・水準線未入力の記録はRN無しで掃引）。※採用α±X＝その記録の採用α（浮き足・RN込みの実績合計α）＋X をそのまま実効αに（RNの再判定はしない＝±0で記録どおりを再現）"),
      manCalc ? React.createElement(React.Fragment, null,
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 } },
          _card("通算損益", (function() { var _m = manCalc.sum, _rf = manCalc.sumRef; return React.createElement("span", { style: { whiteSpace: "normal" } }, React.createElement("span", { style: { color: _elPnlColor(_m), fontSize: 17, whiteSpace: "nowrap" } }, _elPnlFmt(_m)), (_rf ? React.createElement("span", { style: { color: _elPnlColor(_m), fontSize: 17, marginLeft: 2, whiteSpace: "nowrap", display: "inline-block" } }, "（" + _elPnlFmt(_m + _rf) + "）") : null)); })(), manCalc.n + "記録中 建玉あり" + manCalc.builtRecN + "件"),
          _card("差額", _uplMan == null ? "—" : (function() { return React.createElement("span", { style: { whiteSpace: "normal" } }, React.createElement("span", { style: { color: _elPnlColor(_uplMan), fontSize: 17, whiteSpace: "nowrap" } }, _elPnlFmt(_uplMan)), (_uplManRef ? React.createElement("span", { style: { color: _elPnlColor(_uplMan), fontSize: 17, marginLeft: 2, whiteSpace: "nowrap", display: "inline-block" } }, "（" + _elPnlFmt(_uplMan + _uplManRef) + "）") : null)); })(), "シミュ−従来"),
          _card("1記録あたり", manCalc.builtRecN ? _pnlNode(Math.round(manCalc.sum / manCalc.builtRecN)) : "—", "建玉ありの平均"),
          _card("建玉あり", manCalc.builtRecN + "件", "全取引未到達・×見送り除く"),
          _card("勝率", _winRate == null ? "—" : React.createElement("b", { style: { color: _winRate >= 0.5 ? "#1E8449" : "#B45309" } }, Math.round(_winRate * 100) + "%"), "建玉あり中プラス"),
          _card("損切り率", _stopRate == null ? "—" : React.createElement("b", { style: { color: _stopRate <= 0.3 ? "#1E8449" : _stopRate <= 0.5 ? "#B45309" : "#C0392B" } }, Math.round(_stopRate * 100) + "%"), manCalc.stopRecN + "件／建玉あり"),
          _card("1株あたり損益", _perShare == null ? "—" : React.createElement("b", { style: { color: _elPnlColor(_perShare) } }, (_perShare >= 0 ? "+" : "") + _perShare + "円"), "通算÷" + _manTot + "株")),
        allStock ? _kbStockTable(manCalc, _manTot) : null,
        _kbMasterTable(manCalc, "シミュレーション・" + _manTot + "株", _manTot, _simCutInfo),
        _notesLine(manCalc)) : null);
  } else if (mode === "compare") {
    // A/B比較（案3＝左右2カラム）: 設定A・設定Bに別々のラダーを組んで差額(B−A)を見る。母数・期間・除外・複数回取引・RN自動加算は上部の共通設定を共有。
    var _cfgA = _mkCmpCfg(rowsA, stopOffA), _cfgB = _mkCmpCfg(rowsB, stopOffB);
    var _noteA = _cfgA.calc ? _notesLine(_cfgA.calc) : null, _noteB = _cfgB.calc ? _notesLine(_cfgB.calc) : null;
    body = React.createElement(React.Fragment, null,
      React.createElement("div", { style: { fontSize: 9.5, color: "#0F766E", fontWeight: 700, marginBottom: 6, lineHeight: 1.5 } }, "設定Aと設定Bに別々のラダー（『α値』の決め方×株数＋損切り）を組んで、同じ母数で損益を比べます。差額＝設定B−設定A。既定は両方「採用α±0・100株」＝差額0（±0で記録どおり再現）から始まります。片方を採用α±0のままにすれば「実際のα vs もし○○していたら」の対比になります。実効α・損切り・母数ルールは手動ラダーと完全に同一です。"),
      React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "stretch" } },
        _cmpCol("A", rowsA, setRowsA, stopOffA, setStopOffA, _cfgA, "#0F6E56", "#F0FDFA"),
        _cmpCol("B", rowsB, setRowsB, stopOffB, setStopOffB, _cfgB, "#185FA5", "#F3F8FE")),
      (_cfgA.manTot !== _cfgB.manTot && (_cfgA.manTot > 0 || _cfgB.manTot > 0)) ? React.createElement("div", { style: { fontSize: 9.5, color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "4px 8px", marginBottom: 6 } }, "※設定A＝総" + _cfgA.manTot + "株／設定B＝総" + _cfgB.manTot + "株。株数が違うため差額にはα差だけでなく株数差も含まれます（同じ株数にすると純粋なα差の比較になります）。") : null,
      (_cfgA.manTot > 0 || _cfgB.manTot > 0)
        ? React.createElement(React.Fragment, null,
            _kbCmpTable(_cfgA, _cfgB),
            (_noteA || _noteB) ? React.createElement("div", { style: { marginTop: 3 } },
              _noteA ? React.createElement("div", { style: { display: "flex", gap: 4, alignItems: "flex-start" } }, React.createElement("span", { style: { fontSize: 9, fontWeight: 800, color: "#0F6E56", flexShrink: 0, marginTop: 3 } }, "設定A"), _noteA) : null,
              _noteB ? React.createElement("div", { style: { display: "flex", gap: 4, alignItems: "flex-start" } }, React.createElement("span", { style: { fontSize: 9, fontWeight: 800, color: "#0C447C", flexShrink: 0, marginTop: 3 } }, "設定B"), _noteB) : null) : null)
        : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "12px 0", fontSize: 11 } }, "設定A・設定Bの株数を入力してください"));
  } else {
    var _stepTotal = function(delta) { setTotal(function(prev) { var c = _kbInt(prev); c = (c == null ? 0 : c) + delta; if (c < 0) c = 0; return String(c); }); setAutoExp(null); };   // 合計株数を±100（手動の株数欄_stepCumと対の縦▲▼）2026-07-06
    var _comboAllo = function(cb) { return (cb.tranches || []).map(function(t) { return _candLabel(t.cand) + " ×" + t.shares + "株"; }).join(" ＋ "); };
    var _rankRows = [];
    if (autoRes) {
      autoRes.combos.slice(0, 10).forEach(function(cb, i) {
        var key = cb.sig;
        var on = autoExp === key;
        _rankRows.push(React.createElement("tr", { key: key, onClick: function() { setAutoExp(on ? null : key); }, style: { cursor: "pointer", background: i === 0 ? "#FEF3C7" : (on ? "#F0FDFA" : "transparent") } },
          _elv2Td(React.createElement("span", { style: { fontWeight: i === 0 ? 800 : 600, color: i === 0 ? "#B45309" : "#666" } }, (i + 1) + (i === 0 ? " ★" : "")), { textAlign: "left", paddingLeft: 8 }),
          _elv2Td(React.createElement("span", { style: { fontWeight: 700, color: "#334155" } }, _comboAllo(cb)), { textAlign: "left", whiteSpace: "normal" }),
          _elv2Td(cb.builtN + "件"),
          _elv2Td(cb.stopN + "件"),
          _elv2Td(_pnlNode2(cb.sum, cb.sumRef)),
          _elv2Td(React.createElement("span", { style: { fontSize: 9, color: "#0F766E" } }, on ? "● 表示中" : "▷ 表示"))));
      });
    }
    var _bestTxt = null;
    if (autoRes && autoRes.best) {
      var _b = autoRes.best;
      _bestTxt = React.createElement("div", { style: { background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 8, padding: "8px 12px", marginBottom: 8 } },
        React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#B45309", marginBottom: 2 } }, "★ 最適だった配分（通算損益最大）"),
        React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#333" } },
          (_b.tranches || []).map(function(t) { return _candLabel(t.cand) + "で" + t.shares + "株"; }).join(" ＋ "), " → ", _pnlNode2(_b.sum, _b.sumRef, true)),
        React.createElement("div", { style: { fontSize: 9.5, color: "#888", marginTop: 2 } }, "建玉あり" + _b.builtN + "件・損切り" + _b.stopN + "件（" + pool.length + "記録・全" + autoRes.comboN + "通りの総当たり）"));
    }
    var _selCb = null;
    if (autoRes) { if (autoExp && autoRes.combos) { for (var _ci = 0; _ci < autoRes.combos.length; _ci++) { if (autoRes.combos[_ci].sig === autoExp) { _selCb = autoRes.combos[_ci]; break; } } } if (!_selCb) _selCb = autoRes.best; }
    // 全銘柄モードは総当たりが母数×銘柄数ぶん重いので「計算する」を押した時だけ走らせる（入力を変えると再度ボタンに戻る）2026-07-20f。銘柄別モードは_autoReady常時true＝従来どおり即時。
    // 2026-07-20h ×（単一取引）はゲート不要＝候補25通りだけで〇の約1/49。ボタンを挟む意味が無いので即時実行に戻す。
    var _autoGate = (allStock && multiTrade && !_autoReady) ? React.createElement("div", { style: { border: "1px dashed #D1D5DB", borderRadius: 10, padding: "16px 12px", textAlign: "center", marginBottom: 8 } },
      React.createElement("button", { type: "button", disabled: !(totalN > 0 && pool.length), onClick: function() { setAutoRunSig(_autoSig); setAutoExp(null); },
        style: { padding: "7px 20px", fontSize: 12, fontWeight: 800, borderRadius: 8, cursor: (totalN > 0 && pool.length) ? "pointer" : "default", border: "1px solid #0F766E", background: (totalN > 0 && pool.length) ? "#0F766E" : "#CBD5E1", color: "#fff" } }, "総当たりを計算する"),
      React.createElement("div", { style: { fontSize: 10.5, color: "#888780", marginTop: 8 } }, multiTrade ? ("候補25種 × " + totalN + "株の2取引配分 × 母数" + pool.length + "件") : ("候補25種（単一取引） × 母数" + pool.length + "件")),
      React.createElement("div", { style: { fontSize: 9.5, color: "#B4B2A9", marginTop: 3 } }, "全銘柄ぶんの総当たりは重いので、ボタンを押したときだけ計算します（数秒かかることがあります）。株数・期間・除外を変えると再計算が必要です")) : null;
    body = React.createElement(React.Fragment, null,
      React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700 } }, "合計"),
        React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
          React.createElement("input", { type: "text", inputMode: "numeric", value: total, onChange: function(e) { setTotal(e.target.value); setAutoExp(null); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
          _stepBtn(function() { _stepTotal(100); }, function() { _stepTotal(-100); })),
        React.createElement("span", { style: { fontSize: 11 } }, "株（100株刻み" + (totalN ? "・実効" + totalN + "株" : "") + "）")),
      allStock
        ? (function() {   // 全銘柄モード＝推奨αは銘柄ごと。1本の数字にまとめると意味が壊れるので銘柄別チップで出す 2026-07-20f
            var _pbs = recoRef.current.pickByStock || {};
            var _ks = Object.keys(_pbs).sort();
            return React.createElement("div", { style: { marginBottom: 6 } },
              React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E", marginBottom: 3 } }, "各銘柄の推奨基本α（本日時点）"),
              React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } },
                _ks.length ? _ks.map(function(st) {
                  var p = _pbs[st], a = (p && p.alpha != null) ? p.alpha : null, na = !!(p && p.status === "na");
                  return React.createElement("span", { key: st, style: { fontSize: 10.5, borderRadius: 5, padding: "1px 8px", whiteSpace: "nowrap", border: "1px solid " + (a == null ? "#D1D5DB" : na ? "#FAC775" : "#99F6E4"), background: a == null ? "#F3F4F6" : na ? "#FAEEDA" : "#F0FDFA", color: a == null ? "#888780" : na ? "#854F0B" : "#0F6E56" } },
                    st + " ", a == null ? "データ不足" : React.createElement("b", null, a + "円"), na ? React.createElement("span", { style: { fontSize: 9, marginLeft: 3 } }, "参考") : null);
                }) : React.createElement("span", { style: { fontSize: 10, color: "#94A3B8" } }, "—")),
              React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 3 } }, "推奨α系（推奨α±X・推奨基本α値）は各記録が自分の銘柄のこの値（記録日時点）を使います＝銘柄をまたいで平均しません。データ不足の銘柄はその取引を建てません。"));
          })()
        : React.createElement("div", { style: { fontSize: 11.5, fontWeight: 700, color: "#0F766E", marginBottom: 6 } }, "推奨基本α値＝", _recoBaseAlpha != null ? React.createElement("b", null, _recoBaseAlpha + "円") : React.createElement("span", { style: { color: "#94A3B8" } }, "データ不足"), (_recoBaseAlpha != null && _recoBasePick && _recoBasePick.status === "na") ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#B45309", marginLeft: 4 } }, "（参考・件数不足）") : null),
      React.createElement("div", { style: { fontSize: 9.5, color: "#aaa", marginBottom: 8 } }, multiTrade ? "第1・第2取引の各αを候補（絶対値0/3/5・各日の推奨基本α・推奨α±1〜±5・各記録の採用α±0〜±5）から選び、総株数を100株刻みで2取引に配分して総当たり。※自動配分が探すのは2取引まで（3取引以上は手動ラダーで組んでください）。" : "全株を1つのα方式で建てる候補（絶対値0/3/5・各日の推奨基本α・推奨α±1〜±5・各記録の採用α±0〜±5＝25通り）を総当たりして順位づけ。分割を検討するなら上の「複数回の取引」を〇にしてください。探索・表示のα＝基本α部分＝浮き足〇/追加α〇の記録は浮き足加算・上乗せセレクタ分を加えた実効αで評価。※採用α系だけは例外＝その記録の採用α（浮き足・RN込みの合計α）＋X がそのまま実効α。" + (autoRes && autoRes.noRecoN ? " ※推奨α不明" + autoRes.noRecoN + "件は推奨α系の候補を建てない扱い（絶対値0/3/5は建てる）。" : "") + (autoRes && autoRes.noAdoptN ? " ※採用α未入力" + autoRes.noAdoptN + "件は採用α系の候補を建てない扱い。" : "")),
      _autoGate,
      _autoGate ? null : _bestTxt,
      _autoGate ? null : (function() {   // 選択配分のマスター表＋注記行（判定不可/推奨α不明/×見送り件数＝手動と同じ_notesLine・従来は自動配分に注記が無かった）2026-07-04c
        if (!_selCb) return null;
        var _selCalc = _elKabuLadderCalc(pool, aiOf, _autoTiersOfFor(_selCb));
        return React.createElement(React.Fragment, null,
          allStock ? _kbStockTable(_selCalc, totalN) : null,
          _kbMasterTable(_selCalc, (_selCb === (autoRes && autoRes.best) ? "★最適配分・" : "選択配分・") + totalN + "株", totalN),
          _notesLine(_selCalc));
      })(),
      _autoGate ? null : (_rankRows.length ? _elv2Table(["順位", multiTrade ? "配分（α方式×株数）" : "α方式（全株）", "建玉あり", "損切り", "通算損益", ""], _rankRows)
        : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "12px 0", fontSize: 11 } }, "合計株数を入力してください")));
  }
  var _periodLbl = _elPSelIsAll(pSel) ? "全期間" : _elPSelSummary(pSel, _elPSelOpts(recs, pSel));   // 2026-07-20i 選択中の年月週日をそのまま見出しに出す
  var _targetList = React.createElement("div", { style: { marginBottom: 10 } },   // 期間で絞った対象取引をまず表示（＝シミュの母数）2026-07-03q
    React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E", marginBottom: 4 } }, "対象取引（" + pool.length + "件）",
      React.createElement("span", { style: { fontSize: 9, fontWeight: 600, color: "#94A3B8", marginLeft: 6 } }, _periodLbl + "・シミュの母数")),
    React.createElement("div", { style: { maxHeight: 300, overflowY: "auto", border: "1px solid #E2E8F0", borderRadius: 8, padding: "2px 4px" } }, _elOsTradeMini(pool, aiOf, { plain: true })));
  // 「複数回の取引 〇×」＝分割するかの大前提なので手動/自動トグルの上に置く（両モードに効く）2026-07-20g
  var _multiToggle = React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 8, padding: "6px 10px", marginBottom: 8 } },
    React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E", whiteSpace: "nowrap" } }, "複数回の取引"),
    React.createElement("div", { style: { display: "inline-flex", background: "#DDEDE9", borderRadius: 6, padding: 2, gap: 2 } },
      [[true, "〇"], [false, "×"]].map(function(kv) {
        var on = multiTrade === kv[0];
        return React.createElement("button", { key: String(kv[0]), type: "button",
          // 2026-07-20h 同値ガード: 既に〇の状態でもう一度〇を押すと、🗑で第2取引を消した直後なら空行が復活し、開いていた展開(autoExp/mtExp)まで畳まれていた
          onClick: function() { if (multiTrade === kv[0]) return; setMultiTrade(kv[0]); setAutoExp(null); setMtExp(null); setAddPicker(false); if (kv[0] && rows.length < 2) setRows(rows.concat([{ method: "", off: "", cum: "", addMethod: "act", addOff: "" }])); },
          style: { padding: "2px 15px", fontSize: 11.5, fontWeight: on ? 800 : 600, borderRadius: 4, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? "#0F766E" : "#6B6459", boxShadow: on ? "0 1px 2px rgba(0,0,0,.1)" : "none" } }, kv[1]);
      })),
    React.createElement("span", { style: { fontSize: 9.5, color: "#0F6E56" } }, multiTrade ? "αを変えて複数回に分けて建てる" : "1回だけ建てる（分割しない）"),
    // 隠れている第2取引以降に**中身がある時だけ**バッジを出す（空行を保持しているだけの初期状態で「保持中」と言われても意味が無いため）2026-07-20g
    (!multiTrade && rows.slice(1).some(function(x) { return (x.method || "") !== "" || _kbInt(x.cum) != null || _kbInt(x.off) != null; }))
      ? React.createElement("span", { title: "〇に戻すと第2取引以降の設定がそのまま復活します（消していません）", style: { fontSize: 9, fontWeight: 700, color: "#6B7280", background: "#F3F4F6", border: "1px solid #D1D5DB", borderRadius: 4, padding: "0 6px" } }, "第2取引以降は保持中") : null);
  var _modeToggle = React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 } },   // 手動/自動トグルは対象取引の下へ移動（母数を確認してから方式を選ぶ）2026-07-04d
    _pill(mode === "manual", "✍ 手動ラダー", function() { setMode("manual"); }, "#0F766E"),
    _pill(mode === "compare", "⚖️ A/B比較", function() { setMode("compare"); setCmpExp(null); }, "#0F766E"),
    _pill(mode === "auto", "🤖 自動配分", function() { setMode("auto"); setAutoExp(null); }, "#0F766E"));
  return React.createElement("div", null, head,
    _targetList,
    _multiToggle,
    _modeToggle,
    React.createElement("div", { style: { fontSize: 9, color: "#aaa", margin: "0 0 8px" } }, "手仕舞い＝最終損益（期待度○が途切れた所で手じまい・_elHold2TotParts）＝記録表/損益データ欄の「最終損益」列・推奨α選定と完全に同一基準（2026-07-20bにH1基準から切替）／損切り＝「シミュ損切」列の値で取引ごと独立（手動ラダーで『推奨基本α値+X円』を設定するとその記録日時点の推奨基本α+X＝橙字・空欄や推奨α不明・自動配分は各記録の実際の損切り値＝灰字）／×見送り・判定不可の取引は建てない（既存シミュと同じ母数ルール）。損益は空売り・100株換算×株数按分。※（）外/（）内は記録表と同じ方式（（）内＝△・損切り済ぶんの参考差分）。金額の（括弧内）＝（）内合計（○△を含む参考額）。従来列＝記録表の「最終損益」（採用α・100株当たり）を総株数に単純按分した値＝同じ記録・同じαなら記録表と一致する（シミュの取引構成・第1/第2取引とは無関係）。シミュ列の下段＝取引ごとの内訳（（）外・建たなかった取引は—）。※時間かぶり（保有時間の重なり）の記録は他のP&L集計と同じく早い方だけを残して除外。"),
    body);
}
// === エントリー記録帳（EP起算方式対応・タブ式 2026-06-12）===
// タブ: 集計(KPI+OS値の分析+EP位置+累積損益+連勝連敗最大DD+時間帯+曜日別+×見送り+△ホールド)/α値(推奨基本α詳細_elBaseAlphaDetailV2+α意思決定表+α感応度カーブ・2026-06-22)/期間/カレンダー/シグナル別/OS連鎖/深掘り(最適ホールド本数+期待度キャリブレーション+執行乖離+メモ×成績)/出現/一覧。集計系はv2記録のみ・一覧タブは旧記録も表示。
// 一覧・展開明細は1行=1記録のテーブル（行タップでEntryLogCard展開）でスクロール量を削減。
function EntryLogView(_ref_elv2) {
  var data = _ref_elv2.data, save = _ref_elv2.save, onBack = _ref_elv2.onBack,
    onSelectDate = _ref_elv2.onSelectDate, initialEdit = _ref_elv2.initialEdit;
  var custom = data.custom || {};
  var allStocks = custom.stocks && custom.stocks.length > 0 ? custom.stocks : _DEF_STOCKS_FROZEN;
  var _uV = useState("sum"), view = _uV[0], setView = _uV[1];
  // 2026-07-20i 期間の指定を年月週日カスケード選択へ置換。既定は全階層「全て」＝全期間（従来の既定と同じ見え方を維持・ユーザー選択）。
  // 旧 period/rngFrom/rngTo（全期間/今週/1ヶ月…＋🗓期間指定）は撤去。旧「今週」はJSTで金曜が落ちるバグがあった（_elFilterPeriodのtoISOString）。
  var _uPS = useState(_elPSelAll), pSel = _uPS[0], setPSel = _uPS[1];
  // 2026-07-20i rngFrom/rngTo（🗓期間指定の自由レンジ）は_ElPeriodPickerへ統合して撤去。
  var _uS = useState(""), stockFil = _uS[0], setStockFil = _uS[1];
  var _uE = useState(initialEdit || null), editTarget = _uE[0], setEditTarget = _uE[1];
  var _uX = useState(null), expKey = _uX[0], setExpKey = _uX[1];
  var _uL = useState(50), listLimit = _uL[0], setListLimit = _uL[1];
  var _uD = useState(null), selDate = _uD[0], setSelDate = _uD[1];   // setSelDateは銘柄/損益ボタンのリセットで使用（selDate値は未使用＝旧カレンダー名残）
  var _uSG = useState(null), selSig = _uSG[0], setSelSig = _uSG[1];
  var _uGr = useState("week"), gran = _uGr[0], setGran = _uGr[1];
  var _uCF = useState(""), cFrom = _uCF[0], setCFrom = _uCF[1];
  var _uCT = useState(""), cTo = _uCT[0], setCTo = _uCT[1];
  var _uPE = useState(null), perExp = _uPE[0], setPerExp = _uPE[1];
  var _uOvE = useState(null), ovExp = _uOvE[0], setOvExp = _uOvE[1];   // 損益タブ「損益（期間別）」表の期間行展開（取引記録）2026-06-22d
  var _uChM = useState("h2"), chartMet = _uChM[0], setChartMet = _uChM[1];   // 期間ビューのグラフ指標（実現/手じまい）2026-07-09 EP/H1廃止・既定=手じまい
  var _uSM = useState("month"), sumMode = _uSM[0], setSumMode = _uSM[1];   // 銘柄別 集計タブの今月/全期間トグル（既定=今月）2026-06-22
  var _uSY = useState(null), sumYM = _uSY[0], setSumYM = _uSY[1];        // 集計「今月」の対象年月 {y,m}（null=当月）2026-06-22
  var _uAA = useState("all"), addAlphaFil = _uAA[0], setAddAlphaFil = _uAA[1];   // 記録帳全体トグル: 追加α 全部(all)/〇(yes)/×(no)/未選択(unset)で分析を絞る 2026-06-24（推奨基本α/追加αタブは _v2recsAll を使い独立）
  var _uCO = useState(false), collOnly = _uCO[0], setCollOnly = _uCO[1];   // 🗂記録一覧の「被り除外のみ」絞り込み（表示のみ・集計/KPIは不変）2026-07-08
  var _uRO = useState(false), reviewOnly = _uRO[0], setReviewOnly = _uRO[1];   // 🗂記録一覧の「要審議のみ」絞り込み（表示のみ・集計/KPIは不変・行タップで明細→編集）2026-07-18g
  var _uFR = useState(false), riskOpen = _uFR[0], setRiskOpen = _uFR[1];   // 「指値同値」セクションの該当記録リスト開閉（表示のみ・集計は不変）2026-07-20
  var _uAlS = useState("base"), alphaSub = _uAlS[0], setAlphaSub = _uAlS[1];   // α値タブのサブタブ: 基本α(base)/追加α(add)/共通ツール(tools) 2026-06-29（タブ内サブタブ式＝基本αと追加αを別画面に分離）
  var _uOsF = useState("no"), osDistFil = _uOsF[0], setOsDistFil = _uOsF[1];   // 追加α母数トグル: 全記録(all)/基本α母数=×+未選択(no・既定)/追加α〇のみ(yes)。集計KPI・OS分布・損切り・未達で共有。既定×+未選択＝〇(高α)混入で損切り率/未達率が上振れするのを回避 2026-07-01
  // OS値分布の基準トグルは2026-07-13に廃止（ユーザー承認③）＝実現OS(白枠・統計/棒クリックの主基準)と生の最高OS(色棒)をヒストグラムに同時表示（案A重ね棒・濃淡逆）。α目安(7割=α)は従来どおり生固定。
  var _osValFn = function(s) { return _elOsMaxFiltered(s); };   // OS値分布の主基準＝実現OS（×/損切りで打ち切り）。生(_elOsMaxAll)は各所でrawVals/併記として追加 2026-07-13
  var osValMode = "real", setOsValMode = null;   // 互換用の残置（消費側の分岐は撤去済み・シグネチャ互換のため）
  var _uFS = useState("other"), floatSub = _uFS[0], setFloatSub = _uFS[1];   // シグナル内サブタブ: 底抜け前足浮き(float)/その他(other・既定)。選択中シグナルの記録を数値根拠(底抜け前足浮き＝_elHasNumReason)で二分し、集計/α値/損切り/未達/深掘りの母数を分ける（OS値分布ほか）。既定=その他 2026-07-02
  var _uUAS = useState(false), ukiAnaSp = _uUAS[0], setUkiAnaSp = _uUAS[1];   // 浮き足加算率ボードの基本/応用スコープ（false=浮き基本/true=浮き応用）。シグナル総合の全銘柄共通ボードとシグナル別「浮き足の記録」で共用＝採用αの浮基本/浮応用と分析母数を揃える 2026-07-18
  var _uDS = useState({}), detScopes = _uDS[0], setDetScopes = _uDS[1];   // 詳細スコープ（セクション独立 2026-07-08e・旧detSubサブタブ→各セクションのプルダウンへ）: secKey→"all"(まとめて)/"__cmp__"(詳細ごと比較)/詳細名/"__none__"(未分類)。銘柄/シグナル切替でリセット。候補が無いシグナルではプルダウン非表示＝従来と同一母数。
  var _uAR = useState("all"), alphaReasonFil = _uAR[0], setAlphaReasonFil = _uAR[1];   // α値タブ 根拠セレクタ（2026-07-06）: 全体(all)/各根拠/根拠なし(__none__)で基本α・共通ツールの母数を絞る第4の軸。追加αタブは④⑤根拠別を内蔵するため対象外。全体選択時は従来と完全同一。
  var _uDTM = useState("sig"), detTagMode = _uDTM[0], setDetTagMode = _uDTM[1];   // 集計タブの分析軸: "sig"=シグナル別(既定・全銘柄側は「全体」)/"det"=詳細タグ別（銘柄内・全シグナル横断）/"band"=株価帯別（日×銘柄の帯で分類・銘柄別タブ専用＝銘柄横断の帯共通分析はシグナル総合bandサブタブへ移設 2026-07-22i）2026-07-07→3値文字列化 2026-07-22
  var _uSDT = useState(null), selDetTag = _uSDT[0], setSelDetTag = _uSDT[1];   // 詳細タグ別モードの選択タグ（"セクションキー|タグ名"）
  var _uBSel = useState(null), bandSel = _uBSel[0], setBandSel = _uBSel[1];   // 株価帯別モードの選択帯キー（"b0".."bN"/"mat"=材料あり/"unk"=帯不明・null=件数最多帯に自動フォールバック）2026-07-22
  var _uSGT = useState("band"), sigSub = _uSGT[0], setSigSub = _uSGT[1];   // 📡シグナル総合ピルのサブタブ: band(株価帯別・先頭・既定)/uki(浮き足%)/rn(RN) 2026-07-12（tod/dowは2026-07-16撤去）。既定を"uki"→"band"に（移設先を前面・ユーザー決定 2026-07-22j）
  var _uRNS = useState("ana"), rnSub = _uRNS[0], setRnSub = _uRNS[1];   // 🔢RNまたぎタブ内の入れ子サブタブ: ana(分析)/list(記録一覧)/cand(候補記録)/thr(閾値スイープ) 2026-07-19→2026-07-20e thr追加
  var _uRNT = useState("all"), rnTier = _uRNT[0], setRnTier = _uRNT[1];   // 閾値タブの段別トグル: all(…50/…00合算)/50(…50の段)/00(…00の段) 2026-07-20e
  var _uUKS = useState("ana"), ukiSub = _uUKS[0], setUkiSub = _uUKS[1];   // ⚡浮き足%タブ内の入れ子サブタブ: ana(分析)/list(記録一覧) 2026-07-19
  // 2026-07-20j 分析母数トグル anaJul/setAnaJul（「全期間/5月〜」）を撤去＝_anaRecsで4月以前を常時除外にしたため両状態が同結果になり無意味になった。
  var _selSty = { padding: "5px 8px", fontSize: 11, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#333" };
  var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
  var _ai = function(r) { return _elAlphaInfo(r, data); };
  // 2026年4月のみ（EMAの位置に間違い）の損益は参考程度 2026-07-12→2026-07-18: 境界=2026-05-01（月別キーは2026-05）。5月以降が正（5・6月は再取込で修正済み）。上部バナー＋期間別表の該当行に「※参考」。
  // ※本体は2026-07-20iにトップレベル _elIsEmaRefPeriod へ移動（年月週日ピッカーが選択肢の足切りに使うため）。ここは参照するだけ＝ローカル定義は削除済み。
  var _elEmaRefNote = function(isRef) { return isRef ? React.createElement("span", { title: "4月の損益はEMAの位置に間違いがあったため参考程度（5月以降が正）", style: { fontSize: 8.5, color: "#B45309", fontWeight: 700, marginLeft: 4, whiteSpace: "nowrap" } }, "※参考") : null; };
  var _elPreEmaN = function(rs) { var n = 0; (rs || []).forEach(function(r) { if (((r && r.date) || "") < "2026-05-01") n++; }); return n; };
  var _elPreEmaBadge = function(rs) {   // 推奨カード用（承認③ 2026-07-12→2026-07-18 4月のみ）: 母数にEMA修正前(4月)の記録が混ざっている件数を琥珀で明示。母数トグル「5月〜」ON時は自然に消える。
    var n = _elPreEmaN(rs);
    if (!n) return null;
    return React.createElement("span", { title: "母数に2026年4月（EMAの位置修正前＝参考期）の記録が含まれます。推奨値はこの分の影響を受けます（ヘッダーの母数トグル「5月〜」で除外できます）", style: { display: "inline-flex", alignItems: "center", fontSize: 9, fontWeight: 800, color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 4, padding: "1px 6px", marginLeft: 4, verticalAlign: "middle", whiteSpace: "nowrap" } }, "4月" + n + "件");
  };
  var allRecs = _elCollectAllSignals(data);
  var _apAllRows = useMemo(function() { return _apCollectAll(data); }, [data]);  // 出現シグナル・テクニカルの全行（銘柄タブの顔ぶれ）。全chartを走査する純粋計算なのでdata不変なら再計算しない（メモ化 2026-06-29）
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
  // 「全体」タブ（一番左）＝全銘柄合算。stockFil が _ALL_STOCK か未選択(初期)なら全体を表示 2026-06-22d。
  var _ALL_STOCK = "__all__";
  var _SIG_TOTAL = "__sigtotal__";   // 📡シグナル総合ピル（全銘柄共通の分析＝浮き足加算率/時間帯/曜日/RN）2026-07-12。損益(_ALL_STOCK)とは別モード。
  var _isSigTotal = stockFil === _SIG_TOTAL;
  var _selStock = (stockFil === _ALL_STOCK || (stockFil && _tickerList.indexOf(stockFil) >= 0)) ? stockFil : _ALL_STOCK;
  var _isAllStock = !_isSigTotal && _selStock === _ALL_STOCK;
  // 時間かぶり除外のスコープ 2026-07-08: 全体タブ＝null（全銘柄横断＝従来）／銘柄タブ＝その銘柄（同一銘柄内の被りだけ除外＝別銘柄との時間かぶりでは落とさない）。
  // EntryLogView内の被り除外呼び出しは全てこの_collScopeを渡す＝タブに応じて母数が切り替わる。
  var _collScope = (_isAllStock || _isSigTotal) ? null : _selStock;
  // 2026-07-20j EMA修正前（2026年4月以前）を記録帳全体から常に除外＝ユーザー選択「算入しない」の徹底。
  // ここを根元にするのは_periodRecsだけでなく_stockAllV2（KPI早見の月カード・期間ピッカーに依存しない別経路 6111）も同じ母数にするため＝片方だけ4月が残る不整合を防ぐ。
  // 旧: 母数トグル「5月〜」(anaJul)で任意にON/OFFしていたが、常時除外になったのでトグルは撤去（常にONと同義）。顔ぶれ(_tickerList)は固定のまま。
  var _anaRecs = allRecs.filter(function(r) { return !_elIsEmaRefPeriod((r && r.date) || ""); });
  var _periodRecs = _elPSelFilter(_anaRecs, pSel);   // 2026-07-20i 年月週日カスケード選択（_elPSelFilter＝ローカル基準・_elBucketKey準拠）。旧_elFilterPeriod経路は廃止
  // 銘柄タブのバッジ件数: 選択期間内・銘柄未限定の記録数（顔ぶれは固定、件数だけ期間連動）
  var _cntByStock = (function() { var m = {}; _periodRecs.forEach(function(r) { if (r.stock) m[r.stock] = (m[r.stock] || 0) + 1; }); return m; })();
  var filtered = (_isAllStock || _isSigTotal) ? _periodRecs : _periodRecs.filter(function(r) { return r.stock === _selStock; });
  // 合計額算入: includeInTotal===false の記録は集計/分析の母集団から除外（一覧 filtered は全件のまま）。2026-06-18
  // _v2recsAll=銘柄/期間で絞ったv2算入記録（追加α〇/×/未選択は混在）＝推奨基本α/追加αタブはこれを使い全体トグルと独立。
  var _v2recsAll = filtered.filter(function(r) { return _epIsV2(r.signal) && _elInclTotal(r.signal); });
  // 分析母数の根（計算/データ分離 2026-07-22f）: 分析パネル（銘柄別軸_sigGroupsAll・浮き足/RNボード・株価帯別）は_elInclData（データ算入）で絞る＝「計算off/データon」の記録も分析に残す/「計算on/データoff」は分析から外す。合計損益ダッシュボード（_ovPnlTbl/KPI早見/期間タブ/累積）は_v2recsAll（_elInclTotal）のまま。未設定は_elInclTotalに追従＝分割前と一致。
  var _v2recsAllData = filtered.filter(function(r) { return _epIsV2(r.signal) && _elInclData(r.signal); });
  // v2recs=全体トグル（追加α 全部/〇/×/未選択）で絞った分析母数。集計・損益・OS値・損切り・シグナル別等の分析タブが従う 2026-06-24。
  var v2recs = (addAlphaFil === "all") ? _v2recsAll : _v2recsAll.filter(function(r) { return addAlphaFil === "yes" ? _elSpecialUsed(r.signal) : !_elSpecialUsed(r.signal); });   // 2状態化 2026-07-13: yes=応用あり／no=応用なし（旧×+未選択を統合）
  // 旧記録件数は算入フラグと独立に数える（除外した新形式記録を「旧記録」に混ぜない）。2026-06-18
  var oldCnt = filtered.filter(function(r) { return !_epIsV2(r.signal); }).length;
  // 未達タブのバッジ件数は、選択中シグナルの母数で数える（シグナル軸の下で _missCnt を定義 2026-07-01）。
  // 記録帳のサブタブ集合は表示中ピルで出し分け: 全銘柄合算「💰損益」は集計/期間のみ・各銘柄タブはフル分析タブ＋未達（銘柄別＝全項目を分析する方針）。2026-06-22
  var _tabs = _isAllStock
    ? [["sum", "📊 集計"], ["period", "📆 期間"], ["sim", "🧮 シミュ"]]   // 2026-07-20f 全銘柄一括シミュを期間の右に新設（ユーザー要望）
    : [["sum", "📊 集計"], ["alpha", "📐 α値"], ["stop", "🛑 損切り"], ["miss", "❌ 未達"], ["period", "📆 期間"], ["deep", "🔬 深掘り"], ["sim", "🧮 シミュ"]];
  var _SIG_TABS = [["band", "💴 株価帯別"], ["uki", "⚡ 浮き足%"], ["rn", "🔢 RNまたぎ"]];   // 📡シグナル総合のサブタブ 2026-07-12（時間帯/曜日は2026-07-16撤去＝ユーザー不要）。RN→RNまたぎ改名 2026-07-19。株価帯別を浮き足%の左へ移設 2026-07-22i（旧・全銘柄集計の分析軸トグルから移動）
  var _byDateAsc = function(a, b) { return (a.date + (a.signal.time || "")).localeCompare(b.date + (b.signal.time || "")); };   // 記録一覧は日時（日付＋時刻）の早い順（昇順）に統一 2026-07-18
  var _dow = function(ds) { var p = ds.split("-"); return ["日", "月", "火", "水", "木", "金", "土"][new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; };
  var _secH = function(t, sub, right) {   // right=見出し右端の追加コントロール（詳細スコープのプルダウン等）2026-07-08e。data-elsech=カード化の区切りマーカー（_cardify 2026-07-12）
    // 追加α分析トグルが効いている時だけ、各セクション見出しに現在の絞り込みをバッジで明示（スクロールで見出しが目に入っても「今どの母数か」が分かる）。
    // トグルは期間タブ限定に変更（集計/α値/損切り/未達/深掘りはシグナル軸の固定母数）なので、バッジも期間タブでのみ表示 2026-07-01。
    var _fb = (addAlphaFil !== "all" && view === "period" && !_isAllStock)
      ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", fontSize: 9, fontWeight: 700, color: "#C2410C", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 4, padding: "1px 6px", marginLeft: 6, verticalAlign: "middle", whiteSpace: "nowrap" } }, "🔍 " + (addAlphaFil === "yes" ? "応用α" : "基本α") + "のみ")
      : null;
    return React.createElement("div", { "data-elsech": 1, style: { margin: "2px 0 8px" } },
      React.createElement("div", { style: { fontSize: 12.5, fontWeight: 800, color: "#1A1714", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 } }, React.createElement("span", null, t, _fb), right ? React.createElement("span", { style: { marginLeft: "auto" } }, right) : null),
      (sub && typeof sub === "string" && sub.indexOf("※") === 0) ? React.createElement("div", { style: { fontSize: 9.5, color: "#A79E92", marginTop: 2 } }, sub) : null);   // 見出し下の定型説明は非表示・※で始まる注記/補足のみ残す 2026-07-03
  };
  // ===== セクション自動カード化（案A タブ内刷新 2026-07-12）=====
  // _cardify(nodes): 子ノード列（入れ子配列可・null/false除去）を_secH（data-elsechマーカー）で区切り、「見出し＋後続ブロック」を白カードで包む。
  // 見出しより前の要素（KPI/トグルバー等）と data-elcard 付き要素（_elCard=手動カード）はカード外/独立カードとしてそのまま出す。
  // 子はcreateElementの位置引数で渡す＝keyなし要素でも警告を出さない。各タブ本体と_groupPanelの組み立てで使用。
  var _secCardSty = { background: "#fff", border: "1px solid #ECE7DE", borderRadius: 13, padding: "12px 14px", marginBottom: 12, boxShadow: "0 1px 2px rgba(0,0,0,.03)" };
  var _elCard = function() { var kids = Array.prototype.slice.call(arguments); return React.createElement.apply(null, ["div", { "data-elcard": 1, style: _secCardSty }].concat(kids)); };
  var _cardify = function(nodes) {
    var flat = [];
    var _fl = function(n) { if (Array.isArray(n)) { n.forEach(_fl); } else if (n != null && n !== false) { flat.push(n); } };
    _fl(nodes);
    var out = [], cur = null;
    var _flush = function() { if (cur) { out.push(React.createElement.apply(null, ["div", { key: "sec" + out.length, style: _secCardSty }].concat(cur))); cur = null; } };
    flat.forEach(function(n) {
      var p = (n && n.props) || null;
      if (p && p["data-elsech"]) { _flush(); cur = [n]; }
      else if (p && p["data-elcard"]) { _flush(); out.push(n); }
      else if (cur) { cur.push(n); }
      else { out.push(n); }
    });
    _flush();
    return React.createElement.apply(null, [React.Fragment, null].concat(out));
  };
  var _kpiCard = function(label, val, color, sub) {
    return React.createElement("div", { key: label, style: { flex: "1 1 96px", minWidth: 92, background: "#fff", border: "1px solid #EEE9E1", borderRadius: 12, padding: "10px 12px", textAlign: "left" } },
      React.createElement("div", { style: { fontSize: 10, color: "#9A9186", fontWeight: 700, marginBottom: 3 } }, label),
      React.createElement("div", { style: { fontSize: 19, fontWeight: 800, color: color || "#1A1714", lineHeight: 1.1, whiteSpace: "nowrap", letterSpacing: "-0.01em" } }, val),
      sub ? React.createElement("div", { style: { fontSize: 9.5, color: "#A79E92", marginTop: 2 } }, sub) : null);
  };
  var _yenN = function(v, cnt, days) {
    if (cnt === 0 || v == null) return _dash;
    var _gv = (days && days > 0) ? Math.round(v / days) : v;   // days指定＝複数日合計は1日平均でグレード判定（表示は合計）2026-07-23
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, justifyContent: "center", whiteSpace: "nowrap" } },
      _elHoldGradeBadge(_profitGradeFromPnl(_gv, 1)),
      React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(v) } }, _elPnlFmt(v)));
  };
  // 金額＋（）内の○△参考値。EP/H1/H2の合計表示で「△を本算入(（）外)していたら」の○△合計を（Ⓐ+9,900円）で併記（2026-06-16: ×と未設定は算入も参考も無し）。
  // ref/refCnt は _elTotAccum の planRef/holdRef/hold2Ref 系（△/損切り済由来）。参考が無ければ通常表示。実現損益には付けない。
  var _yenNR = function(v, cnt, ref, refCnt, days) {
    var suf = _elHold2RefSuffix(v, ref, refCnt, days);
    if (!suf) return _yenN(v, cnt, days);
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 2, whiteSpace: "nowrap" } },
      _yenN(v, cnt, days),
      React.createElement("span", { style: { fontSize: 11, fontWeight: 600, lineHeight: 1.2 } }, suf));
  };
  // 損益（期間別）テーブル＝全銘柄合算をday/week/monthで集計。各損益セルに合計＋平均を併記・損切り(件数/平均額/率)列・行タップでその期間の取引記録を展開。「損益」タブの集計ビュー頭 2026-06-22d。損益基準は_elTotAccum（取引/銘柄別記録と同一）。2026-07-09 EP損益/H1損益列を廃し「最終損益」1列に集約（＝旧H2損益・_elHold2TotPartsの（）外=○が途切れた所で手じまい/（）内=△含む・値は不変）。
  // 期間キー/ラベル（日別=日付・週別=月曜起点の5営業日・月別=YYYY-MM）2026-07-20に共通化。
  // 「全体損益（期間別）」(_ovPnlTbl)と「指値同値」(_fillRiskSection)の日別/週別/月別で同じ区切りを使う＝二重実装しない。
  var _granKeyOf = function(ds, g) {
    if (g === "day") return ds;
    if (g === "month") return ds.slice(0, 7);
    var d = new Date(ds + "T00:00:00"); var mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return mon.getFullYear() + "-" + ("0" + (mon.getMonth() + 1)).slice(-2) + "-" + ("0" + mon.getDate()).slice(-2);
  };
  var _granLabelOf = function(k, g) {
    if (g === "day") return k.slice(5) + "(" + _dow(k) + ")";
    if (g === "month") return k.replace("-", "/");
    var mon = new Date(k + "T00:00:00"); var fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    return (mon.getMonth() + 1) + "/" + mon.getDate() + "〜" + (fri.getMonth() + 1) + "/" + fri.getDate();
  };
  // 日別/週別/月別の切替セグメント（全体損益・指値同値で共用）2026-07-20
  var _granSeg = function(cur, setFn, keyPfx) {
    return React.createElement("div", { style: { display: "flex", marginBottom: 8 } },
      React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 10, padding: 3, gap: 2 } },
        [["day", "日別"], ["week", "週別"], ["month", "月別"]].map(function(g) {
          var on = (cur === "custom" ? "week" : cur) === g[0];
          return React.createElement("button", { key: keyPfx + g[0], onClick: function() { setFn(g[0]); },
            style: { padding: "5px 14px", fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? "#9A3412" : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none", whiteSpace: "nowrap" } }, g[1]);
        })));
  };
  var _ovPnlTbl = function(rs, g) {
    var keyOf = function(ds) { return _granKeyOf(ds, g); };
    var labelOf = function(k) { return _granLabelOf(k, g); };
    // 日数: その期間に市場が開いていた営業日数（平日かつ非祝日・記録の有無に関係なく数える・当日までで頭打ち）。祝日＝記録した祝日/休場イベント(_buildHolidayDateSet)。期間集計タブの日数列と同基準 2026-06-27。
    var _holiSet = _buildHolidayDateSet(data.trades, custom.eventCategories);
    var _today2 = todayStr();
    var _p2 = function(nn) { return ("0" + nn).slice(-2); };
    var _bizDaysIn = function(k) {
      var days = [];
      if (g === "day") { days = [k]; }
      else if (g === "month") { var y = +k.slice(0, 4), m = +k.slice(5, 7), last = new Date(y, m, 0).getDate(); for (var dd = 1; dd <= last; dd++) days.push(k + "-" + _p2(dd)); }
      else { var mon = new Date(k + "T00:00:00"); for (var i = 0; i < 5; i++) { var d = new Date(mon.getTime() + i * 86400000); days.push(d.getFullYear() + "-" + _p2(d.getMonth() + 1) + "-" + _p2(d.getDate())); } }
      var c = 0; days.forEach(function(d) { if (d <= _today2 && _fmIsBizDay(d, _holiSet)) c++; });
      return c;
    };
    var totOf = function(x) { return _elTotAccum(x, { signal: function(r) { return r.signal; }, alpha: function(r) { return _ai(r).alpha; }, cut: function(r) { return _ai(r).cutLine; }, excluded: function(r) { return _elCollExcluded(data, r, _collScope); }, real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; } }); };
    // 「除外後」列の集計＝totOfの除外条件に「指値同値」(_elFillRiskRec)を足しただけ。母数・基準はtotOfと完全に同一なので同じ行で素直に比較できる 2026-07-20c
    var totExOf = function(x) { return _elTotAccum(x, { signal: function(r) { return r.signal; }, alpha: function(r) { return _ai(r).alpha; }, cut: function(r) { return _ai(r).cutLine; }, excluded: function(r) { return _elCollExcluded(data, r, _collScope) || _elFillRiskRec(r); }, real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; } }); };
    // 損切り: E成立(取引できた)記録のうち 想定orH1orH2で損切りした件数・平均損切り額(キャップ=−損切り値×100)・損切り率(E成立分母)＝_elStopStatsV2/時間帯別と同基準 2026-06-27。
    var stopsOf = function(x) {
      var sn = 0, sl = 0, wn = 0;
      x.forEach(function(r) { var s = r.signal, a = _ai(r).alpha, c = _ai(r).cutLine; if (a == null) return; var _dr = _elDynResult(s, a, c); if (!(_dr === "ok" || _dr === "ng" || _dr === "draw")) return; wn++; if (_elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c))) { sn++; sl += _elCapLossYen(c); } });
      return { n: sn, avg: sn ? Math.round(sl / sn) : null, rate: wn ? Math.round(sn / wn * 100) : null };
    };
    // 到達: EPに到達した件数（採用α基準・_epReachedAt）2026-07-09
    var reachOf = function(x) { var r = 0; x.forEach(function(rec) { if (_epReachedAt(rec.signal, _ai(rec).alpha)) r++; }); return r; };
    // 利確: E成立(EP到達して決着＝損切り率と同母数wn)のうち最終損益(（）外main)>0で手じまいした件数・率 2026-07-09
    var winTakeOf = function(x) {
      var wn = 0, tp = 0;
      x.forEach(function(r) { var s = r.signal, a = _ai(r).alpha, c = _ai(r).cutLine; if (a == null) return; var _dr = _elDynResult(s, a, c); if (!(_dr === "ok" || _dr === "ng" || _dr === "draw")) return; wn++; var _t2 = _elHold2TotParts(s, a, c); if (_t2 && _t2.main != null && _t2.main > 0) tp++; });
      return { n: tp, rate: wn ? Math.round(tp / wn * 100) : null };
    };
    var byP = {}; rs.forEach(function(r) { var k = keyOf(r.date); (byP[k] = byP[k] || []).push(r); });
    // 展開明細だけスルー記録も並べる（表示専用 2026-07-20 ユーザー選択「表示だけ」）。
    // 母数rs(=v2recs)は_elInclTotalでスルー(passThrough)を除外済＝件数/到達/利確/損切り/最終損益/実現/1日平均/合計行は一切不変。
    // 出典はfilteredの生記録（期間・銘柄の絞り込みはrsと同条件）。行のグレー表示と「ス」バッジは_recTableが_elRowStyleWithCollで自動描画。
    // 2026-07-20b: スルーだけの週/月も行として出す＝表示用keysにのみ_thruByPのキーを合流。
    // 集計用キー(_aggKeys)はbyP由来のまま＝合計行の日数(_ovTotDays)・※参考判定(_hasRef)は従来と完全に同一
    // （スルーだけの期間の営業日を合計日数に足すと1日平均が動いてしまうため、ここを分けるのが要）。
    var _thruByP = {};
    filtered.forEach(function(r) { if (r && r.date && r.signal && _epIsV2(r.signal) && _elIsThru(r.signal)) { var _kt = keyOf(r.date); (_thruByP[_kt] = _thruByP[_kt] || []).push(r); } });
    var _aggKeys = Object.keys(byP);   // 集計に使う期間＝算入記録がある期間のみ（従来どおり）
    var keys = _aggKeys.concat(Object.keys(_thruByP).filter(function(k) { return !byP[k]; })).sort().reverse();   // 表示用＝スルーのみの期間も行にする
    if (!keys.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 12 } }, "v2記録なし");
    var oth = function(t) { return React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
    var otd = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
    // 最終損益・実現損益とも「1日あたり平均」＝合計÷日数(営業日数)に統一 2026-07-09（旧: 実現損益は1トレード平均avgLine→ユーザー要望で1日平均に）
    var avgDayLine = function(v, days) { if (!days || v == null) return null; var a = Math.round(v / days); return React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "1日平均" + (a >= 0 ? "+" : "") + a.toLocaleString()); };
    // 件数の下の「（1日平均〇件）」＝件数÷日数(営業日数)。割り切れれば整数・端数は小数第1位まで（四捨五入後に整数化されれば整数表示）。日別(g==="day")は各行=1日で件数と同値になり冗長なので非表示 2026-07-19。
    var avgCntLine = function(cnt, days) { if (!days || g === "day" || !cnt) return null; var r1 = Math.round(cnt / days * 10) / 10; var disp = (r1 === Math.round(r1)) ? String(Math.round(r1)) : r1.toFixed(1); return React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "（1日平均" + disp + "件）"); };   // !cnt＝0件(スルーのみの期間)は「1日平均0件」が冗長なので出さない 2026-07-20b
    var cntCell = function(cnt, days, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, React.createElement("span", null, cnt + "件"), avgCntLine(cnt, days)), ex); };
    var pnlCell = function(v, cnt, ref, refCnt, days, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenNR(v, cnt, ref, refCnt, days), avgDayLine(v, days)), ex); };   // days渡し＝1日平均でグレード判定 2026-07-23
    var realCell = function(v, cnt, days, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenN(v, cnt, days), avgDayLine(v, days)), ex); };
    var stopCell = function(st, ex) {
      if (!st || st.n === 0) return otd(React.createElement("span", { style: { color: "#bbb" } }, "—"), ex);
      return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
        React.createElement("span", { style: { fontWeight: 700, color: "#1E8449" } }, st.n + "件・" + (st.rate != null ? st.rate + "%" : "—")),
        React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "平均" + (st.avg != null ? st.avg.toLocaleString() : "—") + "円")), ex);
    };
    // 到達セル: EP到達件数（主）＋到達率（対 件数=全記録・小書き）＋1日平均（到達÷営業日数・欄が狭いので「1日平均」「〇件」の2行）2026-07-24。日別(g==="day")は各行=1日で冗長・0件は非表示（avgCntLineと同扱い）。
    var reachAvg2 = function(rn, days) { if (!days || g === "day" || !rn) return null; var r1 = Math.round(rn / days * 10) / 10; var disp = (r1 === Math.round(r1)) ? String(Math.round(r1)) : r1.toFixed(1); return React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1, textAlign: "center", marginTop: 1 } }, React.createElement("span", { style: { display: "block" } }, "1日平均"), React.createElement("span", { style: { display: "block" } }, disp + "件")); };
    var reachCell = function(rn, tot, days, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
      React.createElement("span", { style: { fontWeight: 700, color: "#9A3412" } }, rn + "件"),
      tot ? React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, Math.round(rn / tot * 100) + "%") : null,
      reachAvg2(rn, days)), ex); };
    // 利確セル: 利益で手じまいした件数・率（旧勝率の位置・色分けは勝率と同じ緑/橙）2026-07-09
    var winTakeCell = function(wt, ex) {
      if (!wt || wt.rate == null) return otd(React.createElement("span", { style: { color: "#bbb" } }, "—"), ex);
      return otd(React.createElement("span", { style: { fontWeight: 700, color: wt.rate >= 50 ? "#1E8449" : "#B45309" } }, wt.n + "件・" + wt.rate + "%"), ex);
    };
    // 指値同値セル（最終損益の右・件数と除外後損益を1欄に統合 2026-07-20d ユーザー指示）:
    // 上＝該当件数（OS高値の最大＝採用α値＝予定EPを一度も上抜けなかった記録＝指値が約定しなかった可能性）＋対 件数の率、
    // 下＝その記録を除いた最終損益（除外後）。差額は小書きで併記（0＝該当無しのときは出さない＝最終損益と同額が一目で分かる）。
    // さらにその下に1日平均（除外後の金額÷営業日数・他の損益列と同じavgDayLine）2026-07-20f ユーザー指示。
    // 該当0件でも除外後の金額は出す＝最終損益と同額であることを示すため（列全体が「—」だと欠測と紛らわしい）。
    // 段の順: 件数(＋率) → 除外後の最終損益 → 差額 → 1日平均。
    var friskCell = function(n, tot, a, b, days, ex) {
      var df = (a.hold2 != null && b.hold2 != null) ? (b.hold2 - a.hold2) : null;
      return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 } },
        React.createElement("span", { style: { fontWeight: 800, color: n ? "#0F6E56" : "#bbb" } }, n + "件", (n && tot) ? React.createElement("span", { style: { fontSize: 9, fontWeight: 600, color: "#94A3B8", marginLeft: 3 } }, Math.round(n / tot * 100) + "%") : null),
        React.createElement("span", { style: { marginTop: 1 } }, _yenNR(b.hold2, b.hold2Cnt, b.hold2Ref, b.hold2RefCnt, days)),
        (df != null && df !== 0) ? React.createElement("span", { style: { display: "block", fontSize: 9, color: "#0F6E56", fontWeight: 700, lineHeight: 1.1 } }, "差額" + (df >= 0 ? "+" : "") + df.toLocaleString()) : null,
        avgDayLine(b.hold2, days)), ex);
    };
    var rows = [];
    keys.forEach(function(k) {
      var x = byP[k] || [], _thruRow = _thruByP[k] || [];   // x=算入記録（スルーのみの期間は空配列）／_thruRow=表示専用のスルー記録
      var t = totOf(x), st = stopsOf(x), dn = _bizDaysIn(k), on = ovExp === k;
      rows.push(React.createElement("tr", { key: k, onClick: function() { setOvExp(on ? null : k); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
        otd(React.createElement("span", null, React.createElement("span", { style: { color: "#F97316", marginRight: 3, fontSize: 9 } }, on ? "▼" : "▶"), labelOf(k), _elEmaRefNote(_elIsEmaRefPeriod(k, g)),
          (!x.length && _thruRow.length) ? React.createElement("span", { title: "この期間は算入記録が無く、スルー記録だけがあります（集計は全て—）", style: { fontSize: 8.5, fontWeight: 700, color: "#6B7280", background: "#F3F4F6", border: "1px solid #D1D5DB", borderRadius: 4, padding: "0 4px", marginLeft: 4, whiteSpace: "nowrap" } }, "スルーのみ") : null), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
        otd(dn + "日", { fontWeight: 600, color: "#555" }),
        cntCell(x.length, dn, { fontWeight: 700 }),
        reachCell(reachOf(x), x.length, dn),
        winTakeCell(winTakeOf(x)),
        stopCell(st),
        pnlCell(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, dn),
        friskCell(_elFillRiskCountRecs(x), x.length, t, totExOf(x), dn),
        realCell(t.real, t.realCnt, dn)));
      if (on) rows.push(React.createElement("tr", { key: k + "_d" }, React.createElement("td", { colSpan: 9, style: { padding: "4px 6px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
        React.createElement("div", { style: { fontSize: 10, color: "#9A3412", fontWeight: 700, margin: "2px 0 4px" } }, labelOf(k) + " の取引記録（" + x.length + "件" + (_thruRow.length ? "＋スルー" + _thruRow.length + "件" : "") + "）"),
        _thruRow.length ? React.createElement("div", { style: { fontSize: 9, color: "#9CA3AF", fontWeight: 600, margin: "0 0 4px" } }, "※グレーの「ス」行＝スルー記録。件数・損益の集計には入りません（表示のみ）") : null,
        _recTable(x.concat(_thruRow).sort(_byDateAsc), "full", "ovp_" + k + "_", null))));
    });
    // 合計・平均は「※参考」期間（EMA位置ズレの4月＝_elIsEmaRefPeriod）を除外。参考行自体は上に表示し、集計だけ除く。件数・日数・到達/利確/損切り率・1日平均も参考期間を抜いた母数で算出 2026-07-18
    var _isRefKey = function(k) { return _elIsEmaRefPeriod(k, g); };
    var rsInc = rs.filter(function(r) { return !_isRefKey(keyOf(r.date)); });
    var _hasRef = _aggKeys.some(_isRefKey);
    var tt = totOf(rsInc), bt = { borderTop: "2px solid #FB923C" };
    var _ovTotDays = _aggKeys.reduce(function(s, k) { return _isRefKey(k) ? s : s + _bizDaysIn(k); }, 0);   // 集計用キーのみ＝スルーだけの期間の営業日は合計日数に加算しない（1日平均を従来値のまま保つ）2026-07-20b
    var totRow = React.createElement("tr", { key: "__ovtot__", style: { background: "#FFF7ED" } },
      otd(React.createElement("span", null, "合計", _hasRef ? React.createElement("span", { title: "4月（EMA位置ズレの参考期間）は合計・平均から除外しています", style: { fontSize: 8.5, color: "#B45309", fontWeight: 700, marginLeft: 4, whiteSpace: "nowrap" } }, "※参考除く") : null), Object.assign({ textAlign: "left", paddingLeft: 8, fontWeight: 800, color: "#555" }, bt)),
      otd(_ovTotDays + "日", Object.assign({ fontWeight: 700, color: "#555" }, bt)),
      cntCell(rsInc.length, _ovTotDays, Object.assign({ fontWeight: 800 }, bt)),
      reachCell(reachOf(rsInc), rsInc.length, _ovTotDays, Object.assign({ fontWeight: 800 }, bt)),
      winTakeCell(winTakeOf(rsInc), Object.assign({ fontWeight: 800 }, bt)),
      stopCell(stopsOf(rsInc), bt),
      pnlCell(tt.hold2, tt.hold2Cnt, tt.hold2Ref, tt.hold2RefCnt, _ovTotDays, bt),
      friskCell(_elFillRiskCountRecs(rsInc), rsInc.length, tt, totExOf(rsInc), _ovTotDays, Object.assign({ fontWeight: 800 }, bt)),
      realCell(tt.real, tt.realCnt, _ovTotDays, bt));
    return React.createElement(_HScrollBox, null,
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
          oth(g === "day" ? "日" : g === "week" ? "週" : "月"), oth("日数"), oth("件数"),
          oth(React.createElement("span", null, "到達",
            React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "EP到達件数"))),
          oth(React.createElement("span", null, "利確",
            React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "利益で手じまい・E成立母数"))),
          oth("損切り"),
          oth(React.createElement("span", { title: "期待度○が途切れた所（×/△/損切り）で手じまいした損益＝（）外。（）内=△も保有し続けた場合。旧H2損益と同一基準" }, "最終損益",
            React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "○が途切れた所で手じまい・( )=△含む"))),
          oth(React.createElement("span", { title: "OS高値の最大が採用α値とちょうど一致＝予定EPを一度も上抜けなかった記録＝実際の指値注文は約定しなかった可能性がある（実エントリー済みは対象外）。上＝該当件数、下＝その記録を除いた最終損益。該当が無い期間は最終損益と同額（差額行なし）" }, "指値同値",
            React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "上=件数／下=除外後の損益"))),
          oth("実現損益"))),
        React.createElement("tbody", null, rows),
        React.createElement("tfoot", null, totRow)));
  };
  var _th = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", width: "1%", fontSize: 10, color: "#9A9186" }, ex || {}) }, t); };
  var _td = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };

  // ===== 記録テーブル（mode "day"=日別の簡易列 / "full"=一覧・展開明細の詳細列）。行タップで明細カード =====
  var _recTable = function(recs, mode, keyPfx, limit) {
    if (!recs.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 12 } }, "記録なし");
    var shown = (limit && recs.length > limit) ? recs.slice(0, limit) : recs;
    var colN = mode === "day" ? 8 : 14;   // full: 2026-07-16 損切り・保有列追加で11→13／2026-07-18 ライン列追加で13→14
    var body = [];
    shown.forEach(function(r) {
      var s = r.signal, a = _ai(r);
      var ek = keyPfx + r.stock + "_" + (s.id || s.time || "");
      var on = expKey === ek;
      var cells = [
        _td((on ? "▶ " : "") + r.date.slice(5) + "(" + _dow(r.date) + ")", { textAlign: "left", paddingLeft: 8, fontWeight: 700 }),
        _td(React.createElement("span", null, React.createElement("div", null, s.time || _dash, _minBarBadge(s)), _epIncompleteMark(s), _elCollMarkNode(data, r, _collScope), _elFillRiskNode(r), _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge(null, s)) : null), { color: "#666" }),
        _td(r.stock, { color: "#9A3412", fontWeight: 700 })
      ];
      if (mode === "day") {
        var _ovd = _elOsMaxAll(s); var _bkey = (_ovd != null) ? _elOsBucketKey(_ovd, false) : null;
        cells = cells.concat([
          _td(_epOsChainCell(s, a.alpha)),
          _td(_epECell(s, a.alpha)),
          _td(_bkey != null ? React.createElement("span", { style: { display: "inline-block", padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700, color: "#fff", background: _elOsBucketColor(_bkey), whiteSpace: "nowrap" } }, _elOsBucketLabel(_bkey)) : _dash),
          _td(_elHoldMaxHighCell(s)),
          _td(_elOutcomeCell(s, a.alpha, a.cutLine))
        ]);
      } else {
        var entered = _elIsEntered(s, r.item);
        var realN = entered ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null;
        var _sigParts = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).map(function(_t) { return _elTagDisp(s, _t); }).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
        cells = cells.concat([
          _td(_elSigCell(s, "flex-start"), { textAlign: "left" }),
          _td(_elAlphaTypeCell(s, a.alpha), { background: _elSpecialUsed(s) ? "#FEF3C7" : null }),
          _td(_elCutValNode(a.cutLine)),
          _td(_elLineInner(s, a.alpha, a.cutLine), { padding: "1px 2px", width: "1%" }),
          _td(_epECell(s, a.alpha)),
          _td(entered
            ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 13 } }, "〇")
            : _elIsThru(s)
              ? React.createElement("span", { title: "スルー", style: { color: "#6B7280", fontWeight: 700, fontSize: 11 } }, "ス")
              : _elIsReview(s)
                ? React.createElement("span", { title: "要審議", style: { color: "#DB2777", fontWeight: 700, fontSize: 11 } }, "審")
                : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 13 } }, "×")),
          _td(React.createElement(React.Fragment, null, _elHold2AmtNode(s, a.alpha, a.cutLine), _elRideMiniNode(s, a.alpha, a.cutLine)), { background: "#FFFBF0" }),
          React.createElement("td", { key: "dtl", colSpan: 2, style: { padding: "4px 6px", textAlign: "left", fontSize: 11, borderTop: "1px solid #f0ede8", background: "#F8FBFE" } }, _elDetailFlowStack(s, a.alpha, a.cutLine)),
          _td(_elHoldMinNode(s, a.alpha, a.cutLine))
        ]).concat([_td(entered ? _elRPnlDispW(realN, realN != null ? _profitGradeFromPnlReal(realN, 1) : null, 60) : _dash)]);
      }
      body.push(React.createElement("tr", { key: ek, onClick: function() { setExpKey(on ? null : ek); }, style: Object.assign({ background: on ? "#FFF7ED" : "transparent", cursor: "pointer" }, _elRowStyleWithColl(data, r, _collScope)) }, cells));
      if (on) body.push(React.createElement("tr", { key: ek + "_c" },
        React.createElement("td", { colSpan: colN, style: { padding: "4px 8px 8px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
          React.createElement(EntryLogCard, { record: r, data: data, collScope: _collScope, onEdit: function(rec) { setEditTarget(rec); }, onGoDate: onSelectDate }))));
    });
    var head = mode === "day"
      ? [_th("日付", { textAlign: "left", paddingLeft: 8 }), _th("時間"), _th("銘柄"), _th("OS"), _th("E"), _th("OS帯"), _th("H中最高値"), _th("実現結果")]
      : [_th("日付", { textAlign: "left", paddingLeft: 8 }), _th("時間"), _th("銘柄"), _th("シグナル", { textAlign: "left" }), _th("α値"), _th("損切り"), _th("ライン"), _th("E"), _th("取引"),
         _th("最終損益・詳細"), React.createElement("th", { key: "hh", colSpan: 2, style: { padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, "OS・損益詳細"), _th(React.createElement("span", { title: "EP足〜手じまい足の保有時間（1分足換算・時間かぶり判定と同基準）" }, "保有")), _th("実現損益")];
    return React.createElement(React.Fragment, null,
      React.createElement(_HScrollBox, null,
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } }, head)),
          React.createElement("tbody", null, body))),
      (function() {   // 時間かぶりの凡例（表示中に該当行がある時だけ・tooltipはスマホで見えないため明記）2026-07-07
        var _hasColl = shown.some(function(r) { return _elCollMarked(data, r, _collScope) || _elCollExcluded(data, r, _collScope); });
        if (!_hasColl) return null;
        return React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", padding: "4px 6px 0", lineHeight: 1.5 } },
          "凡例: ", React.createElement("b", { style: { color: "#B45309" } }, "※被り有"), "＝同日・早い方の保有時間（EP〜手じまい）に入ったペアの残した側（早い方／同時刻なら損益が小さい方＝合計に算入）／",
          React.createElement("b", { style: { color: "#6D28D9" } }, "被り除外"), "＝除外側（遅い方／同時刻なら損益が大きい方・薄紫の行・損益は合計額に入れない・件数は残る）");
      })(),
      (limit && recs.length > limit) ? React.createElement("button", {
        onClick: function() { setListLimit(listLimit + 100); },
        style: { width: "100%", padding: "8px", fontSize: 12, fontWeight: 700, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", marginTop: 6 }
      }, "さらに表示（残り" + (recs.length - limit) + "件）") : null);
  };

  // ===== グループ集計テーブル（シグナル別・銘柄別）。行タップで明細テーブル展開 =====
  var _grpTable = function(groups, headLabel, keyPfx, withOsStats) {
    groups = groups.filter(function(g) { return g.recs.length > 0; });
    if (!groups.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 12 } }, "v2記録なし");
    var colN = withOsStats ? 8 : 6;   // 2026-07-09 EP/H1列廃止で-2
    var rows = [];
    groups.forEach(function(g) {
      var recs = g.recs;
      var t = _elTotAccum(recs, {
        signal: function(r) { return r.signal; },
        alpha: function(r) { return _ai(r).alpha; },
        cut: function(r) { return _ai(r).cutLine; },
        excluded: function(r) { return _elCollExcluded(data, r, _collScope); },
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
        _td(_elOsDistBarV2(os ? os.vals : null, 72, 11))
      ]);
      cells = cells.concat([
        _td(recs.length ? React.createElement("span", { style: { fontWeight: 700, color: reach / recs.length >= 0.6 ? "#1E8449" : "#B45309" } }, Math.round(reach / recs.length * 100) + "%") : _dash),
        _td(_elStopCellV2(ss)),
        _td(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _yenN(t.hold2, t.hold2Cnt), _elHold2RefSuffix(t.hold2, t.hold2Ref, t.hold2RefCnt))),
        _td(_yenN(t.real, t.realCnt))
      ]);
      rows.push(React.createElement("tr", { key: ek, onClick: function() { setExpKey(on ? null : ek); }, style: { background: on ? "#FFF7ED" : "transparent", cursor: "pointer" } }, cells));
      if (on) rows.push(React.createElement("tr", { key: ek + "_d" },
        React.createElement("td", { colSpan: colN + 2, style: { padding: "4px 8px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
          _recTable(recs.slice().sort(_byDateAsc), "full", ek + "_r_"))));
    });
    var head = [_th(headLabel, { textAlign: "left", paddingLeft: 8 }), _th("件")];
    if (withOsStats) head = head.concat([_th("OS1平均"), _th("OS分布")]);
    head = head.concat([_th("E成立率"), _th("損切り"), _th("最終損益"), _th("実現損益")]);
    return React.createElement(_HScrollBox, null,
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } }, head)),
        React.createElement("tbody", null, rows)));
  };

  // ===== 集計タブ: KPIブロック（任意の記録集合から算出。今月/全期間で共用）+ α意思決定表(_alphaTable) =====
  var _kpiBlockOf = function(rs, _freqHoli) {
    var n = rs.length, ok = 0, x = 0, miss = 0;
    rs.forEach(function(r) { var rr = _epResolve(r.signal, _ai(r).alpha), j = rr ? rr.judge : null; if (j === "ok") ok++; else if (j === "x") x++; else if (j === "miss") miss++; });
    var t = _elTotAccum(rs, {
      signal: function(r) { return r.signal; },
      alpha: function(r) { return _ai(r).alpha; },
      cut: function(r) { return _ai(r).cutLine; },
      excluded: function(r) { return _elCollExcluded(data, r, _collScope); },
      real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; }
    });
    var ss = _elStopStatsV2(rs, data), reach = n ? Math.round((ok + x) / n * 100) : null;
    // E後の勝率（実トレード=ok/ng/draw母数・_elEwinCellと同じ ok/(ok+ng+draw)）と、1営業日あたりH1損益（ΣH1÷エントリー日数）2026-06-26
    var _wOk = 0, _wNg = 0, _wDr = 0, _daySet = {};
    rs.forEach(function(r) { var ai = _ai(r), res = _elDynResult(r.signal, ai.alpha, ai.cutLine); if (res === "ok" || res === "ng" || res === "draw") { if (res === "ok") _wOk++; else if (res === "ng") _wNg++; else _wDr++; if (r.date) _daySet[r.date] = 1; } });
    var _ewinD = _wOk + _wNg + _wDr, _ewin = _ewinD ? Math.round(_wOk / _ewinD * 100) : null;
    var _entDays = 0; for (var _dk in _daySet) { if (_daySet.hasOwnProperty(_dk)) _entDays++; }
    var _perDay = (_entDays > 0 && t.hold2 != null) ? Math.round(t.hold2 / _entDays) : null;   // 2026-07-09 H1基準→手じまい基準
    var _collXN = _elCollExclCountRecs(data, rs, _collScope);
    var _friskN = _elFillRiskCountRecs(rs);   // 指値同値（OS値＝α値）の該当件数＝件数カードの副文言に併記 2026-07-20
    // シグナル総合タブのKPI早見だけ頻度カードを足す（8枚→9枚・3×3）2026-07-18。_freqHoli未指定（集計タブ）は従来の8枚(4×2)のまま。頻度＝母数の活動営業日÷採用αでEP到達した実日数。
    var _freqCard = null, _gridN = 4;
    if (_freqHoli) {
      var _fSpan = _elBizSpanDays(rs, _freqHoli), _fEnt = _elEnteredDays(rs, function(r) { return _ai(r).alpha; });
      var _fR = (_fSpan > 0 && _fEnt > 0) ? _fSpan / _fEnt : null, _fNum = _fR == null ? null : (_fR < 10 ? (Math.round(_fR * 10) / 10) : Math.round(_fR));
      _freqCard = _kpiCard("頻度", _fNum == null ? "—" : ("" + _fNum), _fNum == null ? "#bbb" : "#0369A1", _fNum == null ? "到達日なし" : ("営業日に1回・到達" + _fEnt + "日/活動" + _fSpan + "営業日"));
      _gridN = 3;
    }
    return React.createElement.apply(null, ["div", { style: { display: "grid", gridTemplateColumns: "repeat(" + _gridN + ", minmax(0, 1fr))", gap: 8 } }].concat([
      _kpiCard("件数", n + "件", "#333", "v2記録のみ" + (_collXN > 0 ? "・被り除外" + _collXN + "件" : "") + (_friskN > 0 ? "・指値同値" + _friskN + "件" : "")),
      _freqCard,
      _kpiCard("E到達率", reach != null ? reach + "%" : "—", "#0369A1", "○" + ok + "・×" + x + "・未達" + miss),
      _kpiCard("E後の勝率", _ewin != null ? _ewin + "%" : "—", _ewin != null ? (_ewin >= 50 ? "#1E8449" : "#B45309") : "#bbb", "勝" + _wOk + "・負" + _wNg + (_wDr ? "・分" + _wDr : "") + "／E成立" + _ewinD + "件"),
      _kpiCard("最終損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, _elBizDaysOf(rs, data)), null, t.hold2Cnt + "件・○途切れで手じまい"),
      _kpiCard("損切り", (ss && ss.any || 0) + "回", ss && ss.any > 0 ? "#1E8449" : "#bbb", ss && ss.rate != null ? "率" + ss.rate + "%（想" + ss.plan + "・H1 " + ss.h1 + "・H2 " + ss.h2 + "）" : null),
      _kpiCard("×見送り", x + "件", x > 0 ? "#1E8449" : "#bbb", "×宣言後の到達"),
      _kpiCard("実現損益", _yenN(t.real, t.realCnt, _elBizDaysOf(rs, data)), null, t.realCnt + "件"),
      _kpiCard("1日あたり損益", _perDay != null ? (_elPnlFmt(_perDay) + "/日") : "—", _perDay != null ? _elPnlColor(_perDay) : "#bbb", "手じまい基準・" + _entDays + "日エントリー")
    ].filter(Boolean)));
  };
  // 指値同値（OS値＝α値）2026-07-20。判定は _elFillRisk（app-05）＝予定EPにちょうど到達しただけで
  // 一度も上抜けなかった記録＝実際の指値が約定しなかった可能性がある記録。
  // 集計器（exFill=false:通常／true:指値リスク除外）＝セクションの4カード用。通常側は既存KPIと同じ配線
  // （時間かぶり除外あり）なので、除外後は「そこに指値リスク分を足しただけ」＝2値は必ず同じ母数・同じ基準で比較できる。
  var _friskTotOf = function(x, exFill) {
    return _elTotAccum(x, {
      signal: function(r) { return r.signal; },
      alpha: function(r) { return _ai(r).alpha; },
      cut: function(r) { return _ai(r).cutLine; },
      excluded: function(r) { return _elCollExcluded(data, r, _collScope) || (exFill && _elFillRiskRec(r)); }
    });
  };
  var _fillRiskSection = function(rs, scopeNote) {
    var _riskRecs = (rs || []).filter(_elFillRiskRec);
    var t = _friskTotOf(rs, false), t2 = _friskTotOf(rs, true);
    var _frDays = _elBizDaysOf(rs, data);
    var _diff = (t.hold2 != null && t2.hold2 != null) ? (t2.hold2 - t.hold2) : null;
    var _cell = function(label, val, color, sub) {
      return React.createElement("div", { key: label },
        React.createElement("div", { style: { fontSize: 10, color: "#9A9186", fontWeight: 700, marginBottom: 3 } }, label),
        React.createElement("div", { style: { fontSize: 19, fontWeight: 800, color: color || "#1A1714", lineHeight: 1.1, whiteSpace: "nowrap", letterSpacing: "-0.01em" } }, val),
        sub ? React.createElement("div", { style: { fontSize: 9.5, color: "#A79E92", marginTop: 2 } }, sub) : null);
    };
    var _btn = _riskRecs.length ? React.createElement("button", { type: "button", onClick: function() { setRiskOpen(!riskOpen); },
      style: { padding: "3px 11px", fontSize: 11, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: "1px solid " + (riskOpen ? "#0F6E56" : "#5DCAA5"), background: riskOpen ? "#0F6E56" : "#E1F5EE", color: riskOpen ? "#fff" : "#0F6E56" } },
      (riskOpen ? "✓ " : "") + "該当のみ表示（" + _riskRecs.length + "件）") : null;
    return [
      _secH("🎯 指値同値（OS値＝α値）", "※ 予定EP（水準線＋採用α）にちょうど到達しただけで一度も上抜けなかった記録＝実際の指値が約定しなかった可能性がある。実エントリー済み（実現損益あり）は約定した証拠につき対象外。母数＝" + (scopeNote || "上の期間選択（v2記録のみ）") + "・時間かぶり除外は通常側にも適用済み", _btn),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 } },
        _cell("該当件数", _riskRecs.length + "件", _riskRecs.length > 0 ? "#0F6E56" : "#bbb", "OS高値の最大＝採用α値"),
        _cell("通常の最終損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, _frDays), null, t.hold2Cnt + "件"),
        _cell("除外後", _yenNR(t2.hold2, t2.hold2Cnt, t2.hold2Ref, t2.hold2RefCnt, _frDays), null, t2.hold2Cnt + "件"),
        _cell("差額", _diff == null ? _dash : _elPnlFmt(_diff), _diff == null ? "#bbb" : _elPnlColor(_diff), "刺さらなければ失う分")),
      // 日別/週別/月別の内訳はここに持たず「全体損益（期間別）」の指値同値列＋除外後列に統合（2026-07-20c ユーザー選択）。
      // 元表に載せることで1日平均が自動で付き、件数/指値同値/粒度トグルの二重持ちも解消。ここは一目での件数確認と対象記録の確認に絞る。
      (riskOpen && _riskRecs.length) ? _recTable(_riskRecs.slice().sort(_byDateAsc), "full", "frisk_") : null
    ];
  };
  // 旧_sumStockContent（銘柄別集計本体の未使用ヘルパー）は死関数だったので削除。復活させる場合はrsが_elInclTotal系母数で来る点に注意（分析母数は_elInclData）2026-07-22j
  // 集計「今月」: 銘柄スコープ（全銘柄合算では全銘柄）の全期間v2記録（top期間ドロップダウンに依存しない）からその月のみ抽出。月は←→で移動・既定は当月。全銘柄合算の集計タブは常に今月（2026-06-26）。
  var _stockAllV2 = _anaRecs.filter(function(r) { return (_isAllStock || r.stock === _selStock) && _epIsV2(r.signal) && _elInclTotal(r.signal) && (addAlphaFil === "all" || (addAlphaFil === "yes" ? _elSpecialUsed(r.signal) : !_elSpecialUsed(r.signal))); });   // 母数トグル追従（2状態化 2026-07-13: yes=応用あり/no=応用なし）
  var _curSumYM = sumYM || (function() { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1 }; })();
  var _sumMonthRecs = _stockAllV2.filter(function(r) { var p = (r.date || "").split("-"); return (+p[0]) === _curSumYM.y && (+p[1]) === _curSumYM.m; });
  var _sumMonthIsRef = _elIsEmaRefPeriod(_curSumYM.y + "-" + ("0" + _curSumYM.m).slice(-2), "month");   // 選択月が4月（EMA位置ズレの参考期間）ならKPI早見に「※参考」バッジ 2026-07-18
  var _shiftSumM = function(delta) { var m = _curSumYM.m + delta, y = _curSumYM.y; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } setSumYM({ y: y, m: m }); setExpKey(null); };
  var _sumNavBtn = function(lbl, fn) { return React.createElement("button", { onClick: fn, style: { padding: "3px 14px", fontSize: 16, fontWeight: 800, background: "#fff", border: "1px solid #E4DFD7", borderRadius: 9, cursor: "pointer", color: "#9A3412" } }, lbl); };
  var _sumMonthNav = React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "6px 0 10px" } },
    _sumNavBtn("←", function() { _shiftSumM(-1); }),
    React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: "#9A3412", minWidth: 170, textAlign: "center" } }, _curSumYM.y + "年" + _curSumYM.m + "月データ早見", _elEmaRefNote(_sumMonthIsRef)),
    _sumNavBtn("→", function() { _shiftSumM(1); }));
  var _sumModeBar = _isAllStock ? null : React.createElement("div", { style: { display: "flex", marginBottom: 6 } },
    React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 10, padding: 3, gap: 2 } },
      [["all", "📆 全期間"], ["month", "📅 今月"]].map(function(g) {
        var on = sumMode === g[0];
        return React.createElement("button", { key: g[0], onClick: function() { setSumMode(g[0]); setExpKey(null); },
          style: { padding: "5px 14px", fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? "#9A3412" : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none", whiteSpace: "nowrap" } }, g[1]);
      })));
  var _alphaTableFn = function(_atRecs) {
    var rs = (_atRecs || []).filter(function(r) { return r.signal.osVal != null && r.signal.osVal !== ""; });
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
    var b2 = Math.max.apply(null, rows.map(function(x) { return x.t.hold2Cnt > 0 ? x.t.hold2 : -Infinity; }));
    return React.createElement(_HScrollBox, null,
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
          _th("α値", { textAlign: "left", paddingLeft: 8 }), _th("成立率"), _th("損切り"), _th("最終損益"))),
        React.createElement("tbody", null, rows.map(function(x) {
          var i2 = x.t.hold2Cnt > 0 && x.t.hold2 === b2 && b2 > -Infinity;
          var _amt = function(v, c, hot, ref, refCnt) {
            if (c <= 0) return _dash;
            var node = React.createElement("span", { style: { fontWeight: hot ? 800 : 600, color: _elPnlColor(v) } }, _elPnlFmt(v));
            var suf = _elHold2RefSuffix(v, ref, refCnt);
            if (!suf) return node;
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 2 } }, node, React.createElement("span", { style: { fontSize: 10, fontWeight: 600 } }, suf));
          };
          return React.createElement("tr", { key: x.a, style: { background: i2 ? "#FEF3C7" : "transparent" } },
            _td(React.createElement("span", null, x.a + "円",
              i2 ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 3, fontWeight: 800 } }, "★手じまい最大") : null), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#0369A1" }),
            _td(Math.round(x.ent / rs.length * 100) + "%", { fontWeight: 700 }),
            _td(x.stp > 0 ? x.stp + "回" : "0回", { color: x.stp > 0 ? "#1E8449" : "#bbb" }),
            _td(_amt(x.t.hold2, x.t.hold2Cnt, i2, x.t.hold2Ref, x.t.hold2RefCnt)));
        }))));
  };

  // ===== グループ構築 =====
  var _buildSigGroups = function(arr) {
    var by = {};
    (arr || []).forEach(function(r) {
      var s = r.signal;
      var tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
      if (!tags.length) tags = ["(未設定)"];
      tags.forEach(function(tg) { (by[tg] = by[tg] || []).push(r); });
    });
    return Object.keys(by).sort(function(a, b) { return by[b].length - by[a].length; })
      .map(function(k) { return { key: k, label: stripCat(k), recs: by[k] }; });
  };
  var _sigGroupsAll = _buildSigGroups(_v2recsAllData);   // 旧_sigGroups(v2recs由来)は死変数だったので削除（分析母数は_v2recsAllData=データ算入）2026-07-22j   // トグル非適用＝推奨基本αパネルの母数固定用 2026-06-24i。分析軸なのでデータ算入母数（計算/データ分離 2026-07-22f）＝銘柄別の集計/α値/損切り/未達/深掘り/詳細タグ別/株価帯別と_selSigRecs(Scoped)が一括でデータ母数に
  // シグナル軸（第2階層に昇格 2026-07-01）: 銘柄の下でシグナルを常設ピルで選ぶ。母数はトグル非依存の固定母数（_sigGroupsAll）で統一。全シグナル合算は持たず、選んだ1シグナルで 集計/α値/損切り/未達/深掘り を分析（期間は全シグナルのまま）。既定＝件数最多のシグナル。
  var _sigAxisGroups = _sigGroupsAll;
  var _selSigKey = (selSig != null && _sigAxisGroups.some(function(g) { return g.key === selSig; })) ? selSig : (_sigAxisGroups[0] ? _sigAxisGroups[0].key : null);
  var _selSigGrp = _sigAxisGroups.filter(function(g) { return g.key === _selSigKey; })[0];
  var _selSigRecs = (_selSigGrp && _selSigGrp.recs) ? _selSigGrp.recs : [];
  // シグナル内サブタブ（底抜け前足浮き / その他）で選択中シグナルの記録を二分。数値根拠(底抜け前足浮き＝_elHasNumReason)の有無で分け、集計/α値/損切り/未達/深掘りの母数を切替える。既定=その他。前足浮き記録は実質「底抜け水準線」だけに付くが、サブタブは全シグナルで常時表示（前足浮き0件のシグナルでは前足浮きタブが空）2026-07-02。
  var _selSigFloat = _selSigRecs.filter(function(r) { return _elHasNumReason(r.signal); });
  var _selSigOther = _selSigRecs.filter(function(r) { return !_elHasNumReason(r.signal); });
  var _floatMode = (floatSub === "float");
  // シグナル詳細スコープ（2026-07-06・複数選択化 2026-07-06f）: 候補=マスター(custom.sigDetails[選択シグナル])∪記録に実在する詳細名（マスターから削除済みの過去詳細も拾う）。1記録に複数詳細が付く＝各詳細バケットに算入（件数は重複しうる）。
  var _detNames = (function() {
    var m = {}, ord = [];
    var _add = function(d) { if (d && !m[d]) { m[d] = 1; ord.push(d); } };
    (((custom || {}).sigDetails || {})[_selSigKey] || []).forEach(_add);
    // セクション別マスター（3セクション化 2026-07-07c）: custom.sigDetails2[タグ]={b,k,f}の全セクション候補も合流（サブタブは従来どおり名前ベース＝どのセクションに付いていても同じ名前は同じバケット）。
    var _m2 = ((custom || {}).sigDetails2 || {})[_selSigKey];
    if (_m2 && typeof _m2 === "object") ["b", "k", "f"].forEach(function(_sk) { (Array.isArray(_m2[_sk]) ? _m2[_sk] : []).forEach(_add); });
    _selSigRecs.forEach(function(r) { _elSigDetailList(r.signal, _selSigKey).forEach(_add); });
    return ord;
  })();
  var _detHas = function(r, name) { return _elSigDetailList(r.signal, _selSigKey).indexOf(name) >= 0; };
  var _detEmpty = function(r) { return _elSigDetailList(r.signal, _selSigKey).length === 0; };
  // 詳細スコープ（2026-07-08e 案C・セクション独立）: 旧・一括「詳細」チップバーを撤去し、各分析セクションの見出しに小型プルダウン（まとめて/詳細ごと比較/各詳細/未分類）を常設。
  // そのセクションだけ母数が切り替わる（セクション独立）。"__cmp__"＝全詳細（1件以上）を縦に並べて一括比較。候補に無い選択は自動で「まとめて」へフォールバック。
  var _detScopeOf = function(k) {
    var v = detScopes[k];
    if (v == null || !_detNames.length) return "all";
    if (v !== "all" && v !== "__cmp__" && v !== "__none__" && _detNames.indexOf(v) < 0) return "all";
    return v;
  };
  var _detFilterBy = function(v, rs) {
    if (v === "__none__") return (rs || []).filter(function(r) { return _detEmpty(r); });
    if (v && v !== "all" && v !== "__cmp__") return (rs || []).filter(function(r) { return _detHas(r, v); });
    return (rs || []);
  };
  var _detCtl = function(secKey, baseRecs) {
    if (!_detNames.length) return null;
    var v = _detScopeOf(secKey), base = baseRecs || [], on = v !== "all";
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 8, verticalAlign: "middle" } },
      React.createElement("span", { style: { fontSize: 9, fontWeight: 800, color: on ? "#B45309" : "#999" } }, "詳細:"),
      React.createElement("select", { value: v,
        onClick: function(e) { e.stopPropagation(); },
        onChange: function(e) { var nv = e.target.value; setDetScopes(function(m) { var n = Object.assign({}, m); n[secKey] = nv; return n; }); setExpKey(null); },
        style: { padding: "3px 6px", fontSize: 11, fontWeight: 700, maxWidth: 190, border: "1px solid " + (on ? "#B45309" : "#E0DAD1"), borderRadius: 7, background: on ? "#FFFBEB" : "#fff", color: on ? "#B45309" : "#5C554B" } },
        React.createElement("option", { value: "all" }, "まとめて（" + base.length + "件）"),
        React.createElement("option", { value: "__cmp__" }, "📊 詳細ごと比較"),
        _detNames.map(function(d) { return React.createElement("option", { key: d, value: d }, d + "（" + _detFilterBy(d, base).length + "件）"); }),
        React.createElement("option", { value: "__none__" }, "未分類（" + _detFilterBy("__none__", base).length + "件）")));
  };
  var _detCtlRow = function(secKey, baseRecs) {   // 見出し(_secH)を持たないブロック用: 右寄せの独立コントロール行
    var c = _detCtl(secKey, baseRecs);
    return c ? React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", margin: "0 0 6px" } }, c) : null;
  };
  var _detBody = function(secKey, baseRecs, renderFn) {   // renderFn(scopedRecs, scopeVal)。比較モードは詳細ごと（1件以上）に琥珀枠カードで縦積み
    var v = _detScopeOf(secKey);
    if (v !== "__cmp__") return renderFn(_detFilterBy(v, baseRecs), v);
    var _bks = _detNames.map(function(d) { return { nm: d, v: d, recs: _detFilterBy(d, baseRecs) }; })
      .concat([{ nm: "未分類", v: "__none__", recs: _detFilterBy("__none__", baseRecs) }])
      .filter(function(b) { return b.recs.length > 0; });
    if (!_bks.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 11 } }, "該当する記録がありません");
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
      _bks.map(function(b) {
        return React.createElement("div", { key: b.v, style: { border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 10px", background: "#FFFDF5" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#B45309", marginBottom: 6 } }, "🔖 " + b.nm + "（" + b.recs.length + "件）"),
          renderFn(b.recs, b.v));
      }));
  };
  var _selSigRecsScoped = _floatMode ? _selSigFloat : _selSigOther;   // 内訳スコープのみ（詳細の一括絞りは廃止 2026-07-08e＝各セクションのプルダウンが担当）
  // 詳細タグ別モード（2026-07-07・銘柄内シグナル横断）: この銘柄の全シグナル(_sigAxisGroups)を横断し、各記録の sigDetail を _elSigDetailSec でセクション別(b/k/f)に読み、詳細名ごとに記録をバケット化。件数降順。1記録が複数詳細を持つと各バケットに算入＝件数は重複しうる。同一タグ×同一詳細名の二重算入だけは記録同一性で排除。
  var _detTagGroups = (function() {
    var secMap = {};
    _EL_SIG_SECS.forEach(function(sec) { secMap[sec.key] = { order: [], byName: {} }; });
    var _put = function(secKey, name, r) {
      if (!name) return;
      var bk = secMap[secKey];
      if (!bk.byName[name]) { bk.byName[name] = []; bk.order.push(name); }
      if (bk.byName[name].indexOf(r) < 0) bk.byName[name].push(r);
    };
    _sigAxisGroups.forEach(function(g) {
      (g.recs || []).forEach(function(r) {
        var sec = _elSigDetailSec(r.signal, g.key);
        if (sec.b) _put("b", sec.b, r);
        if (sec.k) _put("k", sec.k, r);
        (sec.f || []).forEach(function(fn) { _put("f", fn, r); });
      });
    });
    return _EL_SIG_SECS.map(function(sec) {
      var bk = secMap[sec.key];
      var tags = bk.order.map(function(nm) { return { name: nm, recs: bk.byName[nm] }; });
      tags.sort(function(a, b) { return b.recs.length - a.recs.length; });
      return { key: sec.key, label: sec.label, tags: tags };
    });
  })();
  var _detTagFlat = [];
  _detTagGroups.forEach(function(sg) { sg.tags.forEach(function(t) { _detTagFlat.push({ sec: sg.key, secLabel: sg.label, name: t.name, recs: t.recs, tkey: sg.key + "|" + t.name }); }); });
  var _hasDetTags = _detTagFlat.length > 0;
  var _selDetTagKey = (selDetTag && _detTagFlat.some(function(t) { return t.tkey === selDetTag; })) ? selDetTag : (_detTagFlat[0] ? _detTagFlat[0].tkey : null);
  var _selDetTagObj = _detTagFlat.filter(function(t) { return t.tkey === _selDetTagKey; })[0] || null;
  // 株価帯別分析ボディ（2026-07-22）: pool（v2算入記録）を日×銘柄の帯（_pbDayBandOf＝手動＞前日終値自動・app-04）でグループ化し、帯ピル＋選択帯の総合パネル(_groupPanel)を描く。
  // 材料あり日（charts[ck].dayMaterial）は帯から外して「⚡材料あり」独立グループ＝材料日専用のα実態を分離。帯が判定できない日は「帯不明」。帯は0件でも表示（データが無いこと自体が情報）・材料/不明は0件なら非表示。
  // cross=true（全銘柄側）は見出しに銘柄種数を出す。_groupPanel(recs, null, recs)＝詳細タグ別と同型＝KPI・OS分布・推奨基本α/応用α・α詳細表まで既存パネルがそのまま出る。
  var _bandAxisBody = function(pool, cross) {
    var _pbB = _pbBoundsOf(custom);
    var _pbMemo = {};
    var _pbOf = function(r) { var k = r.stock + "_" + r.date; if (!(k in _pbMemo)) _pbMemo[k] = _pbDayBandOf(data, r.stock, r.date); return _pbMemo[k]; };
    var _bgs = [];
    for (var _bi2 = 0; _bi2 <= _pbB.length; _bi2++) _bgs.push({ key: "b" + _bi2, label: "💴 " + _pbBandLabel(_bi2, _pbB), recs: [] });
    var _bMat = { key: "mat", label: "⚡ 材料あり", recs: [] }, _bUnk = { key: "unk", label: "帯不明", recs: [] };
    (pool || []).forEach(function(r) {
      var bi = _pbOf(r);
      if (bi.material) { _bMat.recs.push(r); return; }
      if (bi.idx != null && _bgs[bi.idx]) { _bgs[bi.idx].recs.push(r); return; }
      _bUnk.recs.push(r);
    });
    var _bAll = _bgs.concat(_bMat.recs.length ? [_bMat] : []).concat(_bUnk.recs.length ? [_bUnk] : []);
    var _bSelKey = (bandSel && _bAll.some(function(g) { return g.key === bandSel; })) ? bandSel : (function() { var bst = _bAll[0]; _bAll.forEach(function(g) { if (g.recs.length > bst.recs.length) bst = g; }); return bst.key; })();
    var _bSel = _bAll.filter(function(g) { return g.key === _bSelKey; })[0] || null;
    var _bStkN = 0; if (_bSel) { var _bSeen = {}; _bSel.recs.forEach(function(r) { if (r.stock && !_bSeen[r.stock]) { _bSeen[r.stock] = 1; _bStkN++; } }); }
    // 頻度の帯基準化（2026-07-22j・ユーザー決定）: 実帯グループ（"bN"）は分母を_pbBandBizDays（その帯だった営業日）に＝本日の推奨α（帯）ピルと一致。材料あり/帯不明は帯基準の意味が無いのでundefined＝記録スパン。
    var _bandIdxSel = (_bSel && /^b\d+$/.test(_bSel.key)) ? parseInt(_bSel.key.slice(1), 10) : null;
    var _bandSpanSel = (_bandIdxSel != null && _bSel && _bSel.recs.length && typeof _pbBandBizDays === "function") ? _pbBandBizDays(data, _bandIdxSel, _bSel.recs, _buildHolidayDateSet(data.trades, custom.eventCategories)) : undefined;
    return React.createElement(React.Fragment, null,
      React.createElement("div", { style: { fontSize: 9, color: "#aaa", margin: "0 0 6px" } }, "帯＝日×銘柄で判定（手動選択＞前日終値の自動・日別ページの銘柄タブ上のバーで設定）。境界は設定「📊データ・銘柄」で変更可（現在: " + _pbB.join("・") + "円）"),
      _subTabBar(_bAll, _bSelKey, setBandSel),
      (_bSel && _bSel.recs.length)
        ? React.createElement(React.Fragment, null,
            React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0369A1", marginBottom: 6 } }, _bSel.label,
              React.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "#94A3B8", marginLeft: 6 } }, "（" + _bSel.recs.length + "件" + (cross ? "・銘柄" + _bStkN + "種・銘柄横断" : "") + "）")),
            _groupPanel(_bSel.recs, null, _bSel.recs, false, _bandSpanSel))
        : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この帯の記録がありません"));
  };
  // 追加α母数トグル（osDistFil）を集計KPI/OS分布・損切り・未達で共有。全記録/×+未選択(既定)/〇のみ。〇=高α(基本+追加)は損切り/未達に寄るため、既定×+未選択で基本α運用の素の姿を出す 2026-07-01。
  var _addFilOf = function(rs) {
    if (_floatMode) return (rs || []);   // 前足浮きタブは全件（前足浮き記録は数値根拠の追加α〇なので×+未選択トグルは無効）2026-07-02
    return osDistFil === "no" ? (rs || []).filter(function(r) { return r && !_elSpecialUsed(r.signal); })
      : osDistFil === "yes" ? (rs || []).filter(function(r) { return r && _elSpecialUsed(r.signal); })
      : (rs || []);
  };
  var _addFilBar = function() {
    if (_floatMode) return React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "母数:"),
      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, color: "#9A3412", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "3px 11px" } }, "浮き足の記録（" + _selSigFloat.length + "件）"),
      React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "数値根拠の浮き足＝前足浮きだけの母数（分類トグルは無効）"));
    return React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "分類:"),
      [["all", "全記録"], ["no", "基本α"], ["yes", "応用α"]].map(function(kv) {
        var on = osDistFil === kv[0];
        return React.createElement("button", { key: kv[0], onClick: function() { setOsDistFil(kv[0]); setExpKey(null); },
          style: { padding: "3px 12px", fontSize: 10.5, fontWeight: 700, borderRadius: 13, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#E0DAD1"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#6B6459" } }, kv[1]);
      }),
      React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, osDistFil === "no" ? "基本α運用の素の姿（応用αを除外）" : osDistFil === "yes" ? "応用αを使った記録のみ" : "基本α＋応用αの全記録"));
  };
  var _missCnt = _addFilOf(_selSigRecsScoped).filter(function(r) { var a = _ai(r).alpha; if (a == null || a === "") return false; var rr = _epResolve(r.signal, a); return !!(rr && rr.judge === "miss"); }).length;
  // ===== シグナル別タブ用：サブタブバー＋リッチ分析パネル =====
  var _subTabBar = function(groups, sel, setSel) {
    return React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 8px", marginBottom: 4 } },
      groups.map(function(g) {
        var on = sel === g.key;
        return React.createElement("button", { key: g.key, onClick: function() { setSel(g.key); setExpKey(null); },
          style: { flexShrink: 0, padding: "6px 12px", fontSize: 12, fontWeight: 700, borderRadius: 15, cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid " + (on ? "#9A3412" : "#E0DAD1"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#6B6459" } },
          g.label + " (" + g.recs.length + ")");
      }));
  };
  var _groupPanel = function(recs, stkKey, fixedRecs, useDet, bandSpan) {   // bandSpan: 株価帯別モード時、頻度列＋★頻度ゲートの分母を帯基準（_pbBandBizDays）に＝ピルと一致。非帯（シグナル別/詳細タグ別）はundefined＝記録スパン 2026-07-22j
    if (!recs || !recs.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "記録なし");
    var _baRecs = (fixedRecs && fixedRecs.length) ? fixedRecs : recs;   // 推奨基本αパネルはトグル非適用の母数固定(×+未選択)で算出＝α値タブと一致 2026-06-24i
    var _holiSet = _buildHolidayDateSet(data.trades, custom.eventCategories);   // 「何営業日に1回」用の営業日カレンダー（平日かつ非祝日）2026-07-07
    var _gDet = !!useDet;   // 詳細スコープUI（2026-07-08e）: シグナル別集計のみ表示（詳細タグ別モードは母数がすでに詳細バケット＝非表示）
    var _ctl = function(k, base) { return _gDet ? _detCtl(k, base) : null; };
    var _bodyOf = function(k, base, fn) { return _gDet ? _detBody(k, base, fn) : fn(base || [], "all"); };
    // 追加α母数トグル(osDistFil)で母数を切替: 全記録/×+未選択(基本α運用の素の姿・既定)/〇のみ。KPI(件数/E到達/一番引っ張った損益/損切り件数)・OS分布を同じ母数で揃える＝損切り率/未達率が〇(高α)混入で上振れするのを回避 2026-07-01。
    // KPIカード＋OS値分布＝1ブロック関数化（詳細スコープをrs=内訳母数/baRs=推奨α固定母数の両方に適用 2026-07-08e）
    var _kpiOs = function(rs, baRs) {
    var _osFilRecs = _addFilOf(rs);
    var t = _elTotAccum(_osFilRecs, {
      signal: function(r) { return r.signal; },
      alpha: function(r) { return _ai(r).alpha; },
      cut: function(r) { return _ai(r).cutLine; },
      excluded: function(r) { return _elCollExcluded(data, r, _collScope); },
      real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; }
    });
    var _osFn = _osValFn;   // 実現OS=×/損切りで打ち切り（記録の採用α基準）＝主基準。生=アウトカム盲目の最高値は同時表示（rawVals/併記）2026-07-13
    var _osAll = _elOsStatsV2(rs, _osFn);
    var os = _elOsStatsV2(_osFilRecs, _osFn), ss = _elStopStatsV2(_osFilRecs, data), pcg = _elOsPctlV2(_osFilRecs, _osFn);
    var osRaw = _elOsStatsV2(_osFilRecs, _elOsMaxAll);   // 生の最高OS（色棒＋括弧併記用）2026-07-13
    var _pcgRaw = _elOsPctlV2(_osFilRecs, _elOsMaxAll);   // α目安(7割=α)＝到達確率は選択バイアス回避のため常に生基準 2026-07-09
    var _baA = _elBaseAlphaA(baRs, _ai);   // {pick, add}＝推奨基本α(母数×+未選択)＋推奨追加α(母数〇のみ)。KPIカードとOS分布▲マークで共用 2026-07-01
    var _baPick = _baA ? _baA.pick : null, _baAdd = _baA ? _baA.add : null;
    var _baPickAlpha = (_baPick && _baPick.alpha != null) ? _baPick.alpha : null;   // OS値分布に推奨基本αを青字マーク（母数はトグル非依存の_baRecs＝推奨基本α表示と一致）
    var _baCutPick = _elCutPick(baRs, _ai);   // 推奨損切り値（母数はbaRs＝基本αと同じ・_elOsHistV2の赤マーク markVal3 用）2026-07-01
    var _baCutVal = (_baCutPick && _baCutPick.cut != null && _baCutPick.status !== "none") ? _baCutPick.cut : null;
    // OS分布の赤マーク(損切りライン位置): 浮き足タブ/応用あり＝推奨応用α＋損切り／応用なし＝推奨基本α＋損切り（全記録は出さない）2026-07-01→応用α化 2026-07-13
    var _osRedMark = null, _osRedLabel = null;
    if (_baCutVal != null) {
      if ((_floatMode || osDistFil === "yes") && _baAdd && _baAdd.alpha != null) { _osRedMark = _baAdd.alpha + _baCutVal; _osRedLabel = "推奨応用α＋損切り値"; }
      else if (!_floatMode && osDistFil === "no" && _baPickAlpha != null) { _osRedMark = _baPickAlpha + _baCutVal; _osRedLabel = "推奨基本α＋損切り値"; }
    }
    var ok = 0, x = 0, miss = 0, _osXVals = [];
    _osFilRecs.forEach(function(r) { var rr = _epResolve(r.signal, _ai(r).alpha), j = rr ? rr.judge : null; if (j === "ok") ok++; else if (j === "x") { x++; var _xv = _osFn(r.signal); if (_xv != null && !isNaN(_xv)) _osXVals.push(_xv); } else if (j === "miss") miss++; });
    // KPIカード（ユーザー指定6項目・件数/E到達/一番引っ張った損益/損切り件数は追加α母数トグルに連動 2026-07-01）: 件数／E到達数（到達率）／一番引っ張った損益／損切り件数（損切り率）／推奨基本α（次点も）／推奨追加α（次点も）。
    var _reach = ok + x, _reachRate = _osFilRecs.length ? Math.round(_reach / _osFilRecs.length * 100) : 0;
    // デュアル評価（承認① 2026-07-12）: 最終損益基準の並走pick＋4月混入バッジ（承認③）。実母数（浮き足/RN/追加α除外）でバッジ件数を出す。
    var _baBasePool = (baRs || []).filter(_elIsBaseAlphaPoolRec);
    var _baAddPool = (baRs || []).filter(_elIsSpecialAlphaPoolRec);
    var _baLg = _elBaseAlphaPickScore(baRs, _ai);   // 旧スコア基準の値（乖離確認チップ・旧_elBaseAlphaH2Pickバッジを置換 2026-07-13）
    var _baAddLg = null;   // 応用α化 2026-07-13: 旧基準（増分方式）チップは廃止＝応用αは独立値のため旧基準の比較対象なし
    var _kpiBase = (function() {
      if (!_baPick || _baPick.alpha == null) return _kpiCard("推奨基本α値", "—", "#94A3B8", "データ不足");
      var na = _baPick.status === "na";
      var sub = React.createElement("span", null, (_baPick.alpha2 != null) ? ("次点 " + _baPick.alpha2 + "円") : (na ? "条件緩和の参考値" : "次点なし"), _elOldPickChip(_baPick.alpha, _baLg ? _baLg.alpha : null), _elPreEmaBadge(_baBasePool));
      return _kpiCard("推奨基本α値", _baPick.alpha + "円" + (na ? "（参考）" : ""), na ? "#B45309" : "#0369A1", sub);
    })();
    var _kpiAdd = (function() {
      if (!_baAdd || _baAdd.status === "none") return _kpiCard("推奨応用α値", "—", "#94A3B8", _baAdd ? "推奨無し（条件を満たすαなし）" : "応用〇の記録なし");
      var _addNa = _baAdd.status === "na";
      var sub = React.createElement("span", null, (_baAdd.alpha2 != null) ? ("次点 " + _baAdd.alpha2 + "円") : (_addNa ? "条件緩和の参考値" : "次点なし"), _elPreEmaBadge(_baAddPool));
      return _kpiCard("推奨応用α値", _baAdd.alpha + "円" + (_addNa ? "（参考）" : ""), _addNa ? "#B45309" : "#9A3412", sub);
    })();
    return React.createElement(React.Fragment, null,
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 10 } },
        _kpiCard("件数", _osFilRecs.length + "件", "#333", (function() { var _cn = _elCollExclCountRecs(data, _osFilRecs, _collScope); return _cn > 0 ? "被り除外" + _cn + "件" : null; })()),
        _kpiCard("E到達数（到達率）", _reach + "件（" + _reachRate + "%）", "#0369A1", "○" + ok + "・×" + x + "・未達" + miss),
        _kpiCard("一番引っ張った損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, _elBizDaysOf(_osFilRecs, data)), null, "○で最深（○△）・" + t.hold2Cnt + "件"),
        _kpiCard("損切り件数（損切り率）", (ss.any || 0) + "回（" + (ss.rate != null ? ss.rate : 0) + "%）", ss.any > 0 ? "#1E8449" : "#bbb", "E成立が分母"),
        _kpiBase,
        _kpiAdd),
      _osAll ? React.createElement("div", { style: { background: "#fff", border: "1px solid #ECE7DE", borderRadius: 13, padding: "12px 14px", marginBottom: 12, boxShadow: "0 1px 2px rgba(0,0,0,.03)" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", marginBottom: 4 } }, "OS値分布（OS1〜3最高・1円刻み）"),
          React.createElement("div", { style: { fontSize: 9.5, color: "#aaa", marginBottom: 6 } }, _floatMode ? "母数＝浮き足〇の記録" :("母数は上の「分類」トグルに連動（" + (osDistFil === "no" ? "基本α" : osDistFil === "yes" ? "応用α" : "全記録") + "）。▲推奨基本αの母数はここからさらに浮き足〇/RN〇を除いたもの")),
          os ? React.createElement(React.Fragment, null,
            React.createElement("div", { style: { display: "flex", gap: "4px 16px", flexWrap: "wrap", fontSize: 12, color: "#555", marginBottom: 7, alignItems: "baseline" } },
              React.createElement("span", null, "中央 ", React.createElement("b", { style: { color: "#9A3412", fontSize: 15 } }, os.med + "円"), (osRaw ? React.createElement("span", { style: { fontSize: 10, color: "#94A3B8", marginLeft: 2 } }, "（生" + osRaw.med + "円）") : null), (pcg && pcg.skewRight) ? React.createElement("span", { title: "平均が大きいOS値に上振れ。典型値は中央値で読むのが安全。", style: { display: "inline-block", fontSize: 8, fontWeight: 800, color: "#fff", background: "#B45309", borderRadius: 3, padding: "0 4px", marginLeft: 4 } }, "右偏") : null),
              React.createElement("span", null, "平均 ", React.createElement("b", null, os.avg + "円"), (osRaw ? React.createElement("span", { style: { fontSize: 10, color: "#94A3B8", marginLeft: 2 } }, "（生" + osRaw.avg + "円）") : null)),
              React.createElement("span", null, "最頻 ", React.createElement("b", null, pcg ? _elOsBucketLabel(pcg.bucketMode.key) : os.mode.val + "円")),
              React.createElement("span", null, "範囲 ", React.createElement("b", null, os.min + "〜" + os.max + "円")),
              _pcgRaw ? React.createElement("span", { title: "OS到達確率の目安。選択バイアス回避のため常に生（アウトカム盲目）データで算出。" }, "α目安 ", React.createElement("b", { style: { color: "#0369A1" } }, "7割=α" + _pcgRaw.a70 + "円"), React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", marginLeft: 2 } }, "(生基準)")) : null,
              React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "（" + _osFilRecs.length + "件・統計は実現OS基準）")),
            React.createElement("div", { style: { margin: "4px 0 6px" } }, React.createElement(_elOsHistV2, { vals: os.vals, rawVals: osRaw ? osRaw.vals : [], recs: _osFilRecs, aiOf: _ai, osOf: _osFn, xVals: _osXVals, markVal: _baPickAlpha,
              markVal2: ((_floatMode || osDistFil === "yes") && _baAdd && _baAdd.alpha != null) ? _baAdd.alpha : null,
              markVal3: _osRedMark, mark3Label: _osRedLabel })),
            _elOsBandLegendV2())
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 11 } }, "この母数に該当する記録がありません")) : null);
    };
    return _cardify([
      _addFilBar(),
      React.createElement("div", { style: { margin: "2px 0 8px", display: "flex", flexWrap: "wrap", gap: 6 } }, React.createElement(_ElAnaCutCtl, { data: data, save: save }), React.createElement(_ElAnaReachCtl, { data: data, save: save }), React.createElement(_ElSpecialMinCtl, { data: data, save: save })),   // 前提損切り値＋到達率下限＋根拠別応用α下限ステッパー（推奨α分析の前提・2026-07-13b/2026-07-13）
      _gDet ? _detCtlRow("gp_kpi", recs) : null,
      _bodyOf("gp_kpi", recs, function(_drs, _dv) { return _kpiOs(_drs, _detFilterBy(_dv, _baRecs)); }),
      // 指値同値（OS値＝α値）2026-07-20。母数は上のKPI（_kpiOs）と同じ _addFilOf(recs) ＝「通常の最終損益」がKPIの最終損益と一致する。
      _fillRiskSection(_addFilOf(recs), "この分析パネルの母数（v2記録のみ・上の母数トグル準拠）"),
      // 追加α母数トグル〇のとき: 推奨基本α詳細は畳んで（要約はKPIカードに常時表示）、代わりに推奨追加α詳細（加算値別の総当たり）をフル表示。×/全記録・前足浮きタブは従来どおり基本α詳細をフル表示。2026-07-03
      (!_floatMode && osDistFil === "yes")
        ? [_elCard(_gDet ? _detCtlRow("gp_ba", _baRecs) : null,
            React.createElement(_SNCollapse, { title: "🔬 推奨基本α 詳細データ（推奨値の根拠・タップで展開）", render: function() { return _bodyOf("gp_ba", _baRecs, function(_drs) { return _elBaseAlphaDetailV2(_drs, _ai, _holiSet, null, null, bandSpan); }); } })),
            _secH("🔬 推奨応用α 詳細データ（応用〇・手仕舞い基準）", "応用〇の記録だけを母数に、独立α値0〜20円を手仕舞い基準で評価（★＝到達率" + _EL_ANA_REACH_DEF + "%以上［無ければ" + _EL_ANA_REACH_FLOOR2 + "%まで緩和し参考］・損切り率(最終)" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%以下・E成立" + _EL_BASE_MIN_N + "件以上・頻度" + _EL_FREQ_MAX + "未満・黒字を満たすαのうち平均最終損益最大）。母数＝応用〇（浮き足・RN除外）", _ctl("gp_baAdd", _baRecs)),
            _bodyOf("gp_baAdd", _baRecs, function(_drs) { return _elTotalAlphaSectionV2(_drs, _ai, _holiSet, null, null, bandSpan); })]
        : [_secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝α別の総当たり（各αのE成立/到達率/頻度/利確率/損切り率/最終損益）", _ctl("gp_ba", _baRecs)),
            _bodyOf("gp_ba", _baRecs, function(_drs) { return _elBaseAlphaDetailV2(_drs, _ai, _holiSet, null, null, bandSpan); })],
      _elCard(React.createElement(_SNCollapse, { title: "詳細分析（" + (_gDet ? "累積損益・時間帯別・曜日別" : "EP位置・累積損益・α感応度・時間帯別・曜日別・期待度×/△") + "）", render: function() {   // 遅延描画 2026-06-29。⑥重複整理 2026-07-12: シグナル別集計(_gDet)ではEP位置/α感応度/×/△を外し深掘り・α値タブへ案内（同一母数の三重掲載を解消）。詳細タグ別モード(_gDet=false)は深掘りタブに同スコープが無いためフル維持。
        var _jumpBtn = function(lbl, fn) { return React.createElement("button", { type: "button", onClick: fn, style: { padding: "2px 10px", fontSize: 10, fontWeight: 700, border: "1px solid #CBD5E1", background: "#fff", color: "#334155", borderRadius: 8, cursor: "pointer", marginLeft: 6 } }, lbl); };
        return React.createElement(React.Fragment, null,
          _addFilBar(),
          _gDet ? React.createElement("div", { style: { fontSize: 10, color: "#64748B", background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 10, padding: "6px 10px", marginBottom: 10, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 } },
            React.createElement("span", null, "EP位置・期待度×・期待度△は深掘りタブ、α感応度カーブはα値タブ（共通ツール）に集約しました（同じ母数の重複掲載を整理 2026-07-12）。"),
            _jumpBtn("🔬 深掘りへ", function() { setView("deep"); setExpKey(null); }),
            _jumpBtn("📐 α値へ", function() { setView("alpha"); setAlphaSub("tools"); setExpKey(null); })) : null,
          _gDet ? null : React.createElement(React.Fragment, null, _secH("📍 EP位置の分析", "EPがどの足で成立したか（採用α基準）", _ctl("gp_ep", recs)), _bodyOf("gp_ep", recs, function(_drs) { return _elEpPosSectionV2(_addFilOf(_drs), _ai); })),
          _addFilOf(recs).length >= 2 ? React.createElement(React.Fragment, null, _secH("📈 累積損益（記録順）", null, _ctl("gp_cum", recs)), _bodyOf("gp_cum", recs, function(_drs) { var _fr = _addFilOf(_drs); return _fr.length >= 2 ? React.createElement(_elCumPnlSectionV2, { recs: _fr, aiOf: _ai, data: data, scopeStock: _collScope }) : React.createElement("div", { style: { color: "#bbb", fontSize: 11, padding: "6px 0", textAlign: "center" } }, "記録2件未満のため累積グラフなし"); })) : null,
          _gDet ? null : React.createElement(React.Fragment, null, _secH("📉 α感応度カーブ", "α=0〜20円で再計算した合計の推移", _ctl("gp_ac", recs)), _bodyOf("gp_ac", recs, function(_drs) { return _elAlphaCurveSectionV2(_addFilOf(_drs), _ai); })),
          _secH("🕘 時間帯別の成績（寄り付き重視）", "寄り足OSが出た時刻で分類。9:15／9:30までの早い寄り足OSの成績", _ctl("gp_tod", recs)), _bodyOf("gp_tod", recs, function(_drs) { return _elTimeOfDaySectionV2(_addFilOf(_drs), _ai); }),
          _secH("📅 曜日別の成績", "月〜金別の件数・OS中央値・勝率・損切り率・平均EP/H1損益", _ctl("gp_dow", recs)), _bodyOf("gp_dow", recs, function(_drs) { return _elDowSectionV2(_addFilOf(_drs), _ai); }),
          _gDet ? null : React.createElement(React.Fragment, null,
            _secH("🚫 次足期待度×（見送り）の分析", "このグループの×見送りを取引していたらの損益と、見送り判断の精度（損失回避＝正解／機会損失＝逃した利益）", _ctl("gp_x", recs)), _bodyOf("gp_x", recs, function(_drs) { return _elXSkipSectionV2(_addFilOf(_drs), _ai); }),
            _secH("🔺 次足期待度△（ホールド）の分析", "△で保有したH1/H2を本算入(（）外算入)していたらの損益と、△保有の是非（活きた＝1段下より伸長／裏目＝1段下で手仕舞いが正解）", _ctl("gp_tri", recs)), _bodyOf("gp_tri", recs, function(_drs) { return _elTriangleHoldSectionV2(_addFilOf(_drs), _ai); })));
      } })),
      _secH("🗂 記録一覧（行タップで明細・分類トグルに連動）", null, _ctl("gp_recs", recs)), _addFilBar(),
      _bodyOf("gp_recs", recs, function(_drs, _dv) {
        var _fr = _addFilOf(_drs);
        return React.createElement(React.Fragment, null,
          (function(){
            var _cn = _elCollExclCountRecs(data, _fr, _collScope);
            var _rvN = _fr.filter(function(r){ return r.signal && _elIsReview(r.signal); }).length;   // この銘柄・このビューの要審議件数 2026-07-18g
            if (_cn <= 0 && _rvN <= 0) return null;
            return React.createElement("div", { style: { marginBottom: 6, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 } },
              _cn > 0 ? React.createElement("button", { type: "button", onClick: function(){ setCollOnly(!collOnly); },
                style: { padding: "3px 11px", fontSize: 11, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: "1px solid " + (collOnly ? "#6D28D9" : "#C4B5FD"), background: collOnly ? "#6D28D9" : "#F5F3FF", color: collOnly ? "#fff" : "#6D28D9" } },
                (collOnly ? "✓ " : "") + "被り除外のみ（" + _cn + "件）") : null,
              _rvN > 0 ? React.createElement("button", { type: "button", onClick: function(){ setReviewOnly(!reviewOnly); },
                style: { padding: "3px 11px", fontSize: 11, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: "1px solid " + (reviewOnly ? "#BE185D" : "#FBCFE8"), background: reviewOnly ? "#DB2777" : "#FDF2F8", color: reviewOnly ? "#fff" : "#BE185D" } },
                (reviewOnly ? "✓ " : "") + "要審議のみ（" + _rvN + "件）") : null,
              collOnly ? React.createElement("span", { style: { fontSize: 10, color: "#6D28D9", fontWeight: 700 } }, "時間かぶりで合計から除外した記録だけ表示中（タップで解除）") : null,
              reviewOnly ? React.createElement("span", { style: { fontSize: 10, color: "#BE185D", fontWeight: 700 } }, "要審議（審）の記録だけ表示中（タップで解除・行タップで明細→編集）") : null);
          })(),
          _recTable((function(){ var _sh = _fr; if (collOnly) _sh = _sh.filter(function(r){ return _elCollExcluded(data, r, _collScope); }); if (reviewOnly) _sh = _sh.filter(function(r){ return r.signal && _elIsReview(r.signal); }); return _sh; })().slice().sort(_byDateAsc), "full", "gp_" + (_dv === "all" ? "" : _dv + "_")));
      })]);
  };

  // ===== タブ本体 =====
  var _tabBody;
  if (_isSigTotal) {
    // 📡シグナル総合＝全銘柄共通の分析（銘柄別に分ける必要のないデータ）。母数は常に全銘柄(_v2recsAll)。2026-07-12
    // KPI早見（集計タブと同じ8枚＋頻度）をサブタブごとの母数で頭に出す 2026-07-18: 浮き足%タブ＝浮き足〇(浮き値あり)／RNタブ＝RN〇＝下の分析表と同母数（件数一致）。集計タブと同様、見出しの前に置くのでカード外にそのまま並ぶ。
    var _sigHoliSet = _buildHolidayDateSet(data.trades, custom.eventCategories);
    var _sigUkiPool = _v2recsAllData.filter(function(r) { return r && r.signal && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0; });   // 分析（データ算入）2026-07-22f
    var _sigRnPool = _v2recsAllData.filter(function(r) { return r && _elRnYes(r.signal); });
    var _sigKpiHead = function(t) { return React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#6B6459", margin: "2px 0 6px" } }, t); };
    var _sigKpiEmpty = function(t) { return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, t); };
    // 入れ子サブタブ 2026-07-19: RNまたぎ/浮き足%それぞれの内容（KPI＋分析ボード＋記録一覧）が縦長になったのでタブ式に分割。
    // 入れ子タブバー（トップの_SIG_TABSより小ぶり・teal系）。tabs=[[key,ラベル,件数],...]。
    var _sigInnerBar = function(tabs, cur, onSet) {
      return React.createElement("div", { style: { display: "flex", background: "#E4EFEC", borderRadius: 9, padding: 3, marginBottom: 10, gap: 2, overflowX: "auto" } },
        tabs.map(function(t) {
          var on = cur === t[0];
          return React.createElement("button", { key: t[0], type: "button", onClick: function() { onSet(t[0]); setExpKey(null); },
            style: { flexShrink: 0, padding: "5px 13px", fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 7, background: on ? "#fff" : "transparent", color: on ? "#0F766E" : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none", whiteSpace: "nowrap" } },
            t[1] + " (" + t[2] + ")");
        }));
    };
    if (sigSub === "band") {
      // 株価帯別を📡シグナル総合の先頭サブタブへ移設（2026-07-22i・ユーザー要望）＝全銘柄横断で同じ帯の銘柄を混ぜて帯共通αを検証。旧・全銘柄「集計」の分析軸トグル(_bandAxisBody(_v2recsAllData,true))から移動。
      _tabBody = _bandAxisBody(_v2recsAllData, true);
    } else if (sigSub === "rn") {
      var _rnListRecs = _v2recsAllData.filter(function(r) { return r && _elRnYes(r.signal); }).slice().sort(_byDateAsc);   // 分析（データ算入）2026-07-22f
      // RNまたぎ候補＝RNまたぎ加算×だが予定EP（水準線値＋採用α）の下2桁がバンド内の記録（＝50/00のキリ番をまたげた可能性）。
      // 母数=全記録（filtered＝スルー・要審議・合計除外も含む・_elInclTotalで絞らない）。levelPrice未入力/α未達は下2桁不明のため対象外。2026-07-19
      // 2026-07-20b 自前の下2桁判定（40〜49/90〜99）を廃し共通ヘルパー_elRnAutoOfRec(app-05)へ＝自動判定と同じバンド(41-49/91-99)・同じ式を単一源から使う（40・90を含めないのはユーザー決定）。
      var _rnCandRecs = filtered.filter(function(r) {
        var s = r && r.signal;
        if (!s || !_epIsV2(s) || _elRnYes(s)) return false;
        var _add = _elRnAutoOfRec(s, _ai(r).alpha);
        return _add != null && _add > 0;
      }).slice().sort(_byDateAsc);
      // 閾値タブの件数バッジ＝ボード本体と同じ仕分け（_elRnThrPool単一源）2026-07-20e。
      // 2026-07-20h 段別トグル(rnTier)を渡す＝旧: "all"固定だったため「…50の段」を選ぶとバッジ48件／ボード24件と食い違っていた。thrタブを開いている時だけ算出（他サブタブでは捨てるだけの重いaiOf全走査だった）。
      var _rnThrN = (rnSub === "thr") ? _elRnThrPool(_v2recsAllData, _ai, rnTier).pool.length : null;
      var _rnBody = (rnSub === "thr")
        ? _cardify([
            _secH("🎚 RNは何円手前から〇にすべきか（全銘柄共通）", "※最終損益（手じまい）基準。RN×の記録も含む全記録の反実仮想＝「RNまでの距離≤T円なら〇」のTを0〜" + _EL_RN_T_MAX + "でスイープ。①閾値スイープ ②距離別の限界寄与。母数はRN〇に限らない（③RN距離別＝実績の内訳とは別物）"),
            React.createElement("div", { key: "rntier", style: { display: "flex", justifyContent: "flex-end", margin: "0 0 6px" } }, _rnTierToggle(rnTier, setRnTier)),
            _elRnThresholdBoardV2(_v2recsAllData, _ai, _sigHoliSet, rnTier)])
        : (rnSub === "list")
        ? _cardify([
            _secH("🗂 RN〇の記録一覧（全銘柄）", "上の分析の母数そのもの＝RNまたぎ加算〇の全記録。行タップで明細カード・カードタップで編集フォーム"),
            _recTable(_rnListRecs, "full", "rntab_")])
        : (rnSub === "cand")
          ? _cardify([
              _secH("🎯 RNまたぎ候補の記録一覧（全銘柄・全記録）", "※RNまたぎ加算×だが予定EPの下2桁が41〜49／91〜99の記録＝50/00のキリ番をまたげた可能性。自動判定と同じ範囲（…40/…90は距離10で費用対効果が悪いため対象外）。スルー・要審議・合計除外も含む全記録が対象。予定EP＝水準線値＋採用α（ライン列に表示）"),
              _rnCandRecs.length ? _recTable(_rnCandRecs, "full", "rncand_") : _sigKpiEmpty("該当する候補記録がありません（RN加算×かつ予定EP下2桁41〜49/91〜99・水準線値入りの記録が対象）")])
          : _cardify([
              _sigKpiHead("📊 KPI早見｜RN〇の全記録（" + _sigRnPool.length + "件・採用αはRN加算込み・最終損益基準）"),
              _sigRnPool.length ? _kpiBlockOf(_sigRnPool, _sigHoliSet) : _sigKpiEmpty("RNまたぎ加算〇の記録がまだありません"),
              _secH("🔢 RNまたぎ加算の分析（全銘柄共通）", "※最終損益（手じまい）基準。①EP位置スイープ（RN−3〜+3・RN無し）②寄与の内訳 ③RN距離別。件数が薄いうちは（仮）表示"), _elRnBoardV2(_v2recsAllData, _ai, _sigHoliSet)]);
      _tabBody = React.createElement(React.Fragment, null,
        _sigInnerBar([["ana", "分析", _sigRnPool.length], ["list", "記録一覧", _rnListRecs.length], ["cand", "候補記録", _rnCandRecs.length], ["thr", "閾値", _rnThrN == null ? "—" : _rnThrN]], rnSub, setRnSub),
        _rnBody);
    } else {
      var _ukiListRecs = _sigUkiPool.slice().sort(_byDateAsc);
      var _ukiBody = (ukiSub === "list")
        ? _cardify([
            _secH("🗂 浮き足〇の記録一覧（全銘柄）", "上の分析の母数そのもの＝浮き足〇（浮き値あり）の全記録。行タップで明細カード・カードタップで編集フォーム"),
            _recTable(_ukiListRecs, "full", "ukitab_")])
        : _cardify([
            _sigKpiHead("📊 KPI早見｜浮き足〇の全記録（" + _sigUkiPool.length + "件・採用αは浮き足加算込み・最終損益基準）"),
            _sigUkiPool.length ? _kpiBlockOf(_sigUkiPool, _sigHoliSet) : _sigKpiEmpty("浮き足〇（浮き値あり）の記録がまだありません"),
            _secH("⚡ 浮き足加算率の最適化（全銘柄共通）"),
            React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", margin: "0 0 6px" } }, _ukiScopeToggle(ukiAnaSp, setUkiAnaSp)),
            _elUkiPctBoardScoped(_v2recsAllData, _ai, ukiAnaSp ? "special" : "basic", null, _sigHoliSet)]);   // 2026-07-18 浮き足加算率を浮基本/浮応用のプール別に最適化（上のトグル連動）。旧: _elUkiPctBoardV2（基本/応用混在1プール）。時間帯(tod)/曜日(dow)サブタブは2026-07-16撤去
      _tabBody = React.createElement(React.Fragment, null,
        _sigInnerBar([["ana", "分析", _sigUkiPool.length], ["list", "記録一覧", _ukiListRecs.length]], ukiSub, setUkiSub),
        _ukiBody);
    }
  } else if (view === "sum") {
    if (_isAllStock) {
      // KPI早見だけ「今月」＝〇年〇月データ早見（←→で月移動）。「全体損益（期間別）」以降（累積・連勝連敗）は今月縛り無し＝v2recs（top期間ドロップダウン準拠）。2026-06-26。
      // 累積損益カーブ・連勝連敗DDは4月（EMA位置ズレの参考期間）を除外＝_v2recsNonRef（期間別表の合計・平均と揃える）2026-07-18。
      // 株価帯別は📡シグナル総合タブへ移設（2026-07-22i・ユーザー要望）＝全銘柄「集計」は損益ダッシュボードに専念。旧・分析軸トグル（💰全体／💴株価帯別）は撤去（銘柄別タブの株価帯別軸は存続）。
      // ②データのみ除外（本日の取引銘柄システム 2026-07-22e）: 全銘柄側（全体タブ）の合計消費側だけ候補・未指定(データのみ)を外す。分析母数(v2recs/_v2recsAll)・銘柄別タブは据置。
      var _v2recsAmt = v2recs.filter(function(r) { return !_isDataOnly(data, r); });
      var _sumMonthRecs2 = _sumMonthRecs.filter(function(r) { return !_isDataOnly(data, r); });
      var _v2recsNonRef = _v2recsAmt.filter(function(r) { return !_elIsEmaRefPeriod((r.date || "").slice(0, 7), "month"); });
      _tabBody = _cardify([
        _sumMonthNav,
        _sumMonthRecs2.length ? _kpiBlockOf(_sumMonthRecs2)
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, _curSumYM.y + "年" + _curSumYM.m + "月の記録はありません（←→で月を移動）"),
        [
          _secH("💰 全体損益（期間別）", "全銘柄合算（今月縛り無し）。下のボタンで日別/週別/月別を切替。最終損益＝期待度○が途切れた所で手じまい・（）内=△含む（旧H2損益と同一基準・取引・銘柄別記録と同一・v2記録のみ）"),
          _granSeg(gran, setGran, "ov_"),
          _ovPnlTbl(_v2recsAmt, gran === "custom" ? "week" : gran)],
        _v2recsAmt.length ? _fillRiskSection(_v2recsAmt) : null,
        _v2recsNonRef.length >= 2 ? [
          _secH("📈 累積損益（記録順）", "最終損益/実現損益の累積推移・合計行と同一基準（4月＝EMA位置ズレの参考期間は除外）"), React.createElement(_elCumPnlSectionV2, { recs: _v2recsNonRef, aiOf: _ai, data: data, scopeStock: _collScope })] : null,
        _v2recsNonRef.length >= 2 ? [
          _secH("📉 連勝連敗・最大ドローダウン", "実現損益のストリークと最大DD（損失管理・4月＝参考期間は除外）"), _elStreakDDSectionV2(_v2recsNonRef, _ai)] : null]);
    } else {
      // 銘柄別の集計＝選択中シグナルの総合パネル（旧🎯シグナル別タブを昇格・上のシグナル軸で切替）。母数は選択中シグナル×サブタブ（前足浮き/その他）の固定母数（_selSigRecsScoped）。推奨基本α/追加αカードだけはシグナル全体（_selSigRecs）で算出＝サブタブ間で一貫。2026-07-01→前足浮き対応 2026-07-02
      // 分析軸トグル（2026-07-07）: 🎯シグナル別（従来）／🏷詳細タグ別（銘柄内・全シグナル横断で選んだ詳細タグの記録を _groupPanel で分析）。詳細タグが1件も無い銘柄ではトグル非表示＝従来どおり。
      var _axisBtns = [["sig", "🎯 シグナル別"]].concat(_hasDetTags ? [["det", "🏷 詳細タグ別"]] : []).concat([["band", "💴 株価帯別"]]);   // 株価帯別を第3の軸に追加 2026-07-22（詳細タグが無い銘柄でも帯別は出す＝トグル常時表示化）
      var _detTagToggle = React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "分析軸:"),
        _axisBtns.map(function(kv) {
          var on = detTagMode === kv[0] || (kv[0] === "sig" && detTagMode === "det" && !_hasDetTags);
          return React.createElement("button", { key: kv[0], onClick: function() { setDetTagMode(kv[0]); if (kv[0] !== "sig") setFloatSub("other"); setExpKey(null); },
            style: { padding: "4px 12px", fontSize: 11, fontWeight: 700, borderRadius: 14, cursor: "pointer", whiteSpace: "nowrap", border: "1px solid " + (on ? "#9A3412" : "#E0DAD1"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#6B6459" } }, kv[1]);
        }),
        React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, detTagMode === "band" ? "株価帯別＝この銘柄の記録を日ごとの帯で分類（シグナル横断）" : "詳細タグ別＝この銘柄の全シグナル横断・件数は重複しうる"));
      if (detTagMode === "band") {
        _tabBody = React.createElement(React.Fragment, null, _detTagToggle, _bandAxisBody(_v2recsAllData, false));
      } else if (detTagMode === "det" && _hasDetTags) {
        var _secLabelOf = function(sk) { for (var _si = 0; _si < _EL_SIG_SECS.length; _si++) { if (_EL_SIG_SECS[_si].key === sk) return _EL_SIG_SECS[_si].label; } return ""; };
        _tabBody = React.createElement(React.Fragment, null, _detTagToggle,
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 168px) minmax(0, 1fr)", gap: 14 } },
            React.createElement("div", { style: { borderRight: "1px solid #eee", paddingRight: 8 } },
              _detTagGroups.map(function(sg) {
                if (!sg.tags.length) return null;
                return React.createElement("div", { key: sg.key },
                  React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412", margin: "6px 0 3px" } }, sg.label),
                  sg.tags.map(function(t) {
                    var _tk = sg.key + "|" + t.name, on = _selDetTagKey === _tk;
                    return React.createElement("button", { key: _tk, onClick: function() { setSelDetTag(_tk); setExpKey(null); },
                      style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, width: "100%", textAlign: "left", padding: "5px 8px", marginBottom: 3, fontSize: 11.5, fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid " + (on ? "#B45309" : "#e0d8cf"), background: on ? "#FFF7ED" : "#fff", color: on ? "#B45309" : "#555" } },
                      React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, t.name),
                      React.createElement("span", { style: { fontSize: 10, color: on ? "#B45309" : "#aaa", flexShrink: 0 } }, t.recs.length));
                  }));
              })),
            React.createElement("div", { style: { minWidth: 0 } },
              _selDetTagObj ? React.createElement(React.Fragment, null,
                React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#B45309", marginBottom: 6 } }, _selDetTagObj.name,
                  React.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "#94A3B8", marginLeft: 6 } }, "（" + _secLabelOf(_selDetTagObj.sec) + "・" + _selDetTagObj.recs.length + "件・シグナル横断）")),
                _groupPanel(_selDetTagObj.recs, null, _selDetTagObj.recs))
                : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "左から詳細タグを選択"))));
      } else {
        _tabBody = React.createElement(React.Fragment, null, _detTagToggle,
          _sigAxisGroups.length
            ? (_selSigRecsScoped.length ? _groupPanel(_selSigRecsScoped, null, _selSigRecs, true)
                : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, _floatMode ? "このシグナルに浮き足の記録がありません（「その他」タブへ）" : "このシグナルの「その他」記録がありません（「浮き足」タブへ）"))
            : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この銘柄に集計できるシグナルがありません（EP起算v2の記録なし）"));
      }
    }
  } else if (view === "alpha") {
    if (!_selSigRecs.length) {
      _tabBody = React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _sigAxisGroups.length ? "このシグナルのEP起算（v2）記録がありません" : "EP起算（v2）の記録がありません");
    } else {
      // α値タブ＝タブ内サブタブ式（2026-06-29）: 基本α(青)/追加α(茶橙)/共通ツール(グレー)を別画面に分離し「ごっちゃ」を解消。母数は選択中シグナルの固定母数（_selSigRecs・トグル非依存）2026-07-01。
      var _alA = _elBaseAlphaA(_selSigRecs, _ai);   // 基本α/追加αの推奨はシグナル全体で算出（前足浮きは追加α〇のため基本α母数に入らず、サブタブ間で一貫させる）2026-07-02
      // 根拠セレクタ（2026-07-06）: 基本α・共通ツールの母数を「全体／各根拠／根拠なし」で絞る第4の軸。候補・件数は現在の内訳スコープ（前足浮き/その他＋詳細）の記録から。基本α詳細はシグナル全体母数(_alReasonRecsFull)に、OS分位/α感応度/意思決定表は内訳スコープ母数(_alReasonRecsScoped)に、同じ根拠フィルタを適用。追加αタブは対象外（④⑤根拠別を内蔵）。全体選択時は従来と完全同一。
      var _reasonsOfSig = function(s) { return (Array.isArray(s.specialReasons) ? s.specialReasons.filter(Boolean) : (s.addAlphaReason ? [s.addAlphaReason] : [])); };
      var _reasonCount = {}, _reasonOrder = [], _reasonNoneCount = 0;
      _selSigRecsScoped.forEach(function(r) { var rs = _reasonsOfSig(r.signal); if (!rs.length) { _reasonNoneCount++; return; } rs.forEach(function(rn) { if (_reasonCount[rn] == null) { _reasonCount[rn] = 0; _reasonOrder.push(rn); } _reasonCount[rn]++; }); });
      var _alReasonNames = _reasonOrder.sort(function(a, b) { return _reasonCount[b] - _reasonCount[a]; });
      var _alReasonHasNone = _reasonNoneCount > 0;
      var _reasonSel = ((_alReasonNames.indexOf(alphaReasonFil) >= 0) || (alphaReasonFil === "__none__" && _alReasonHasNone)) ? alphaReasonFil : "all";
      var _reasonFilter = function(rs) {
        if (_reasonSel === "all") return (rs || []);
        if (_reasonSel === "__none__") return (rs || []).filter(function(r) { return _reasonsOfSig(r.signal).length === 0; });
        return (rs || []).filter(function(r) { return _reasonsOfSig(r.signal).indexOf(_reasonSel) >= 0; });
      };
      var _reasonLabel = (_reasonSel === "__none__") ? "根拠なし" : _reasonSel;
      var _alReasonRecsFull = _reasonFilter(_selSigRecs);        // 基本α詳細用（シグナル全体母数に根拠フィルタ）
      var _alReasonRecsScoped = _reasonFilter(_selSigRecsScoped); // OS分位/α感応度/意思決定表用（内訳スコープ母数に根拠フィルタ）
      var _alABase = (_reasonSel === "all") ? _alA : _elBaseAlphaA(_alReasonRecsFull, _ai);   // 基本αゾーンヘッドの推奨＝選択根拠の母数（追加αゾーンヘッドは_alAのまま＝全体）
      var _alphaTable = _alphaTableFn(_alReasonRecsScoped);   // α意思決定表はサブタブ母数（前足浮き/その他）＋根拠フィルタで再計算 2026-07-02→2026-07-06
      var _alPick = _alABase ? _alABase.pick : null;
      // 追加α（2026-07-13 日付別方式・根拠セレクタ連動）: プール＝根拠フィルタ後の追加α〇（浮き足・RN除外）。recoFn（各記録日の推奨基本α）の母数はシグナル全体＝根拠に依らない基本α履歴。
      var _alAddPool = _reasonFilter(_selSigRecs).filter(_elIsSpecialAlphaPoolRec);
      var _alAdd = _alAddPool.length ? _elSpecialAlphaPick(_alAddPool, _ai) : null;   // 推奨応用α（応用〇プールの独立α最適・応用shape）2026-07-13
      // 旧基準チップ（2026-07-13・旧デュアル評価バッジを置換）: ゾーンヘッド用に旧方式の値を併記。母数はゾーンヘッドの主表示と同一スコープ。
      var _alH2Recs = (_reasonSel === "all") ? _selSigRecs : _alReasonRecsFull;
      var _alLgPick = _elBaseAlphaPickScore(_alH2Recs, _ai);
      var _alBasePoolBadge = (_alH2Recs || []).filter(_elIsBaseAlphaPoolRec);
      var _alAddLg = null;   // 応用α化 2026-07-13: 旧基準（増分方式）チップ廃止
      var _alphaSubs = [["base", "① 基本α", "#0369A1"], ["add", "② 応用α", "#9A3412"], ["tools", "③ α早見・ツール", "#64748B"]];   // ④株数シミュは独立タブ「🧮 シミュ」へ昇格（旧alphaSub="kabu"は_alSelがbaseへフォールバック）2026-07-03
      var _alSel = _alphaSubs.some(function(p) { return p[0] === alphaSub; }) ? alphaSub : "base";
      var _alphaPills = React.createElement("div", { style: { display: "flex", overflowX: "auto", padding: "2px 0 8px", marginBottom: 2 } },
        React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 11, padding: 3, gap: 2 } },
          _alphaSubs.map(function(p) {
            var on = _alSel === p[0];
            return React.createElement("button", { key: p[0], onClick: function() { setAlphaSub(p[0]); setExpKey(null); },
              style: { flexShrink: 0, padding: "6px 14px", fontSize: 12, fontWeight: 800, borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", border: "none", background: on ? "#fff" : "transparent", color: on ? p[2] : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none" } }, p[1]);
          })));
      // 根拠セレクタバー（2026-07-13から基本α・追加α・共通ツールの全サブタブに適用＝旧④⑤根拠別の後継・ユーザー承認 案A）。候補が1つも無いシグナルではバー非表示＝従来と同一。
      var _alReasonBar = null;
      if (_alReasonNames.length > 0) {
        var _rOpts = [{ k: "all", label: "全体", n: _selSigRecsScoped.length }];
        _alReasonNames.forEach(function(rn) { _rOpts.push({ k: rn, label: rn, n: _reasonCount[rn] }); });
        if (_alReasonHasNone) _rOpts.push({ k: "__none__", label: "根拠なし", n: _reasonNoneCount });
        _alReasonBar = React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" } },
          React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0369A1" } }, "根拠:"),
          _rOpts.map(function(o) {
            var on = _reasonSel === o.k;
            return React.createElement("button", { key: o.k, onClick: function() { setAlphaReasonFil(o.k); setExpKey(null); },
              style: { padding: "3px 12px", fontSize: 10.5, fontWeight: 700, borderRadius: 13, cursor: "pointer", border: "1px solid " + (on ? "#0369A1" : "#E0DAD1"), background: on ? "#0369A1" : "#fff", color: on ? "#fff" : "#6B6459" } }, o.label + "（" + o.n + "）");
          }),
          React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "基本α・応用α・共通ツールの母数を根拠で絞込（全体＝従来どおり）"));
      }
      var _alZoneHead = function(color, bg, brd, label, sub) {
        return React.createElement("div", { style: { background: bg, border: "1px solid " + brd, borderLeft: "4px solid " + color, borderRadius: 11, padding: "8px 12px", marginBottom: 8 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: color, marginBottom: sub ? 3 : 0 } }, label), sub);
      };
      var _alBaseSum;
      if (_alPick && _alPick.alpha != null) {
        var _bna = _alPick.status === "na";
        _alBaseSum = React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: _bna ? "#B45309" : "#0369A1" } }, "推奨基本α " + _alPick.alpha + "円", _alPick.alpha2 != null ? React.createElement("span", { style: { fontSize: 11, fontWeight: 700, marginLeft: 6 } }, "（次点 " + _alPick.alpha2 + "円）") : null, _bna ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, marginLeft: 4 } }, "参考") : null, _elOldPickChip(_alPick.alpha, _alLgPick ? _alLgPick.alpha : null), _elPreEmaBadge(_alBasePoolBadge));
      } else if (_alPick && _alPick.status === "nomin") {
        _alBaseSum = React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0369A1" } }, "推奨基本α ー（条件適合無し）");   // 全条件を満たすα無し（データはある）＝詳細表と同じ「条件適合無し」表記に統一・基本αは青基調 2026-07-14e/f
      } else {
        _alBaseSum = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#94A3B8" } }, "推奨基本α：データ不足");
      }
      var _alAddSum;
      if (_alAdd && _alAdd.status !== "none" && _alAdd.alpha != null) {
        var _alAddNa = _alAdd.status === "na";
        _alAddSum = React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: _alAddNa ? "#B45309" : "#9A3412" } }, "推奨応用α " + _alAdd.alpha + "円", _alAdd.alpha2 != null ? React.createElement("span", { style: { fontSize: 11, fontWeight: 700, marginLeft: 6, color: "#94A3B8" } }, "（次点：" + _alAdd.alpha2 + "円）") : null, _alAddNa ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, marginLeft: 4 } }, "参考") : null, _elPreEmaBadge(_alAddPool));
      } else if (_alAdd && _alAdd.status === "nomin") {
        _alAddSum = React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#9A3412" } }, "推奨応用α ー（条件適合無し）");   // 全条件を満たす応用α無し（データはある）＝詳細表と同じ「条件適合無し」表記に統一・応用αは茶基調 2026-07-14e/f
      } else {
        _alAddSum = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#94A3B8" } }, _alAddPool.length ? "推奨応用α：推奨無し（件数不足）" : "推奨応用α：応用〇の記録なし");
      }
      var _alBody;
      // 2026-07-16e 修正: 旧実装は _alHoliSet を「応用αゾーン」ブロック内でのみ宣言しており、基本αゾーンは _elBaseAlphaDetailV2(_drs, _ai) と holiSet 無しで呼んでいた
      // ＝この画面だけ頻度列と淡色が祝日を営業日として数え、★側(_elBaseAlphaPick は _elHoliCur で祝日除外)とズレていた。宣言をゾーン分岐の外に出して両方に渡す。
      var _alHoliSet = _buildHolidayDateSet(data.trades, custom.eventCategories);
      if (_alSel === "base") {
        _alBody = [
          _alZoneHead("#0369A1", "#F0F9FF", "#BAE6FD", "基本αゾーン ― まず取る土台（最低限とる利幅）", _alBaseSum),
          _secH("🎯 成立率の目安（OS値→α分位）", "OS値（OS1〜3最高）の分位から、各成立率に対応するαの目安。基本αを決める前の“α候補レンジ”。分位は" + (_floatMode ? "浮き足" : "その他") + "の母数（" + _alReasonRecsScoped.length + "件" + (_reasonSel !== "all" ? "・根拠「" + _reasonLabel + "」" : "") + "）", _detCtl("al_pctl", _alReasonRecsScoped)),
          _detBody("al_pctl", _alReasonRecsScoped, function(_drs) { return _elOsAlphaPctlTableV2(_drs); }),
          _secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝α別の総当たり（各αのE成立/到達率/頻度/利確率/損切り率/最終損益）。基本αはシグナル共通母数で算出" + (_reasonSel !== "all" ? "（根拠「" + _reasonLabel + "」で絞込）" : ""), _detCtl("al_baD", _alReasonRecsFull)),
          _detBody("al_baD", _alReasonRecsFull, function(_drs) { return _elBaseAlphaDetailV2(_drs, _ai, _alHoliSet); })];
      } else if (_alSel === "add") {
        // 前足浮きタブ＝底抜け前足浮き（数値根拠）専用の追加α分析（前足浮き値の何%を追加αにすべきか）。その他タブ＝通常の追加α分析。
        // 【2026-07-13 刷新・ユーザー承認】根拠セレクタを追加αタブにも適用（旧④⑤根拠別は撤去）＋詳細データ（日付別・手仕舞い基準）を新設。
        _alBody = _floatMode
          ? [_alZoneHead("#9A3412", "#FFF7ED", "#FED7AA", "浮き足加算αゾーン ― 前足浮き（浮き値×採用加算率・推奨%/既定50%）", null),
              _elCard(_detCtlRow("al_float", _selSigRecs),
              _detBody("al_float", _selSigRecs, function(_drs) {
                return (_elFloatReasonSectionV2(_drs, _ai, data, _secH, _alPick, { expKey: expKey, setExpKey: setExpKey, onEdit: function(rec) { setEditTarget(rec); }, onGoDate: onSelectDate, ukiSp: ukiAnaSp, setUkiSp: setUkiAnaSp })
                  || React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "浮き足〇（浮き値入り）の記録がありません"));
              }))]
          : [_alZoneHead("#9A3412", "#FFF7ED", "#FED7AA", "応用αゾーン" + (_reasonSel !== "all" ? "（根拠「" + _reasonLabel + "」）" : ""), _alAddSum),
              _secH("🔬 推奨応用α 詳細データ（応用〇・手仕舞い基準）", "応用〇の記録だけを母数に、独立α値0〜20円を前提損切り値で一律に当て手仕舞いで評価（★＝到達率" + _EL_ANA_REACH_DEF + "%以上［無ければ" + _EL_ANA_REACH_FLOOR2 + "%まで緩和し参考］・損切り率(最終)" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%以下・E成立" + _EL_BASE_MIN_N + "件以上・頻度" + _EL_FREQ_MAX + "未満・黒字を満たすαのうち平均最終損益（1件あたり）最大）。母数＝応用〇（浮き足・RN除外）" + (_reasonSel !== "all" ? "（根拠「" + _reasonLabel + "」で絞込）" : ""), _detCtl("al_totA", _alReasonRecsFull)),
              _detBody("al_totA", _alReasonRecsFull, function(_drs) { return _elTotalAlphaSectionV2(_drs, _ai, _alHoliSet); })];
      } else {
        _alBody = [
          _alZoneHead("#64748B", "#F8FAFC", "#E2E8F0", "共通ツール ― 基本/追加に依らないα全体の検証" + (_reasonSel !== "all" ? "（根拠「" + _reasonLabel + "」）" : ""), null),
          _alphaTable ? [_secH("🎯 α意思決定表", "※実効α基準＝記録の採用α（浮き足/応用/RN込み）を一様にそのαへ置換して再計算（0〜20円・損切り値は各記録の採用値・★＝最終損益（手じまい）が最大のα）", _detCtl("al_tbl", _alReasonRecsScoped)),
            _detBody("al_tbl", _alReasonRecsScoped, function(_drs, _dv) { var _tb = (_dv === "all") ? _alphaTable : _alphaTableFn(_drs); return _tb || React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 11 } }, "この母数で表を作れる記録がありません"); })] : null,
          _secH("📉 α感応度カーブ", "※実効α基準＝採用α（浮き足/応用/RN込み）を一様置換。この母数（" + (_floatMode ? "浮き足" : "その他") + "）をα=0〜20円で再計算した合計の推移（意思決定表のグラフ版）", _detCtl("al_curve", _alReasonRecsScoped)),
          _detBody("al_curve", _alReasonRecsScoped, function(_drs) { return _elAlphaCurveSectionV2(_drs, _ai); })];
      }
      _tabBody = _cardify([
        _alphaPills,
        React.createElement("div", { style: { marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 6 } }, React.createElement(_ElAnaCutCtl, { data: data, save: save }), React.createElement(_ElAnaReachCtl, { data: data, save: save }), React.createElement(_ElSpecialMinCtl, { data: data, save: save })),   // 前提損切り値＋到達率下限＋根拠別応用α下限ステッパー（推奨α分析の前提・2026-07-13b/2026-07-13）
        _alReasonBar,
        _alBody]);
    }
  } else if (view === "stop") {
    _tabBody = _selSigRecsScoped.length ? _cardify([
      _secH("🛑 損切りの分析（" + (_floatMode ? "浮き足" : "その他") + "）", "選択中シグナルのこの内訳（" + (_floatMode ? "浮き足" : "その他") + "）でエントリーできた記録の損切りを多角的に分析。損切り値の最適化（損切り値別シミュ）・上振れ（早すぎ検証）。母数は上のトグル（既定＝基本α＝基本α運用の素の損切り率。応用αは採用αが高く損切りに寄る）", _detCtl("st", _selSigRecsScoped)),
      _addFilBar(),
      _detBody("st", _selSigRecsScoped, function(_drs) {
        var _stRecs = _addFilOf(_drs);
        return _stRecs.length ? _elStopTabSectionV2(_stRecs, _ai, data, true) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この母数に該当する記録がありません（トグルを切替）");
      })])
      : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _floatMode ? "このシグナルに浮き足の記録がありません（「その他」タブへ）" : "このシグナルの「その他」記録がありません（「浮き足」タブへ）");
  } else if (view === "period") {
    // ②データのみ除外（2026-07-22e）: 全体タブ（全銘柄横断）の期間集計だけ候補・未指定(データのみ)を外す。銘柄別タブ（この銘柄の自データ＝自行相当）は据置＝v2recsのまま。件数/勝敗/損益とも一貫して除外。
    var _perRecs = _isAllStock ? v2recs.filter(function(r) { return !_isDataOnly(data, r); }) : v2recs;
    _tabBody = React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 10, color: "#9A3412", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "5px 9px", marginBottom: 8 } }, "🎯 期間タブはこの銘柄の全シグナル合算（時系列の俯瞰）。上のシグナル軸の選択では絞り込まれません。"), _elWeeklyTargetSummaryV2(_perRecs, _ai, data, _collScope), (function() {
      var _granBtns = React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", marginBottom: 8 } },
        React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 10, padding: 3, gap: 2 } },
          [["day", "日別"], ["week", "週別"], ["month", "月別"], ["custom", "指定期間"]].map(function(g) {
            var on = gran === g[0];
            return React.createElement("button", { key: g[0], onClick: function() { setGran(g[0]); setPerExp(null); },
              style: { padding: "5px 14px", fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? "#9A3412" : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none", whiteSpace: "nowrap" } }, g[1]);
          })));
      var _periodTot = function(rs) { return _elTotAccum(rs, { signal: function(r) { return r.signal; }, alpha: function(r) { return _ai(r).alpha; }, cut: function(r) { return _ai(r).cutLine; }, excluded: function(r) { return _elCollExcluded(data, r, _collScope); }, real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; } }); };
      var _ratesOf = function(rs) {
        var ok = 0, ng = 0, miss = 0, stop = 0, soft = 0, draw = 0, take = 0;   // take=利確(E成立かつ最終損益>0で手じまい) 2026-07-09
        rs.forEach(function(r) { var s = r.signal, a = _ai(r).alpha, c = _ai(r).cutLine; var res = _elDynResult(s, a, c); var _dec = (res === "ok" || res === "ng" || res === "draw"); if (res === "ok") ok++; else if (res === "ng") ng++; else if (res === "draw") draw++; if (!_epReachedAt(s, a)) miss++; var isStop = _elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c)); if (isStop) stop++; else if (res === "ng") soft++; if (_dec) { var _t2 = _elHold2TotParts(s, a, c); if (_t2 && _t2.main != null && _t2.main > 0) take++; } });
        var _d = ok + ng + draw;
        return { ok: ok, ng: ng, miss: miss, draw: draw, n: rs.length, win: _d ? Math.round(ok / _d * 100) : null, soft: _d ? Math.round(soft / _d * 100) : 0, stop: _d ? Math.round(stop / _d * 100) : 0, take: take, takeRate: _d ? Math.round(take / _d * 100) : null };
      };
      var _periodKpi = function(rs) {
        var t = _periodTot(rs), rr = _ratesOf(rs);
        var _pkDays = _elBizDaysOf(rs, data);
        return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 10 } },
          _kpiCard("件数", rs.length + "件", "#333", (function() { var _cn = _elCollExclCountRecs(data, rs, _collScope); return _cn > 0 ? "被り除外" + _cn + "件" : null; })()),
          _kpiCard("実現損益", _yenN(t.real, t.realCnt, _pkDays), null, t.realCnt + "件"),
          _kpiCard("最終損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, _pkDays), null, t.hold2Cnt + "件・○途切れで手じまい"),
          _kpiCard("利確", rr.takeRate != null ? rr.take + "件・" + rr.takeRate + "%" : "—", rr.takeRate != null ? (rr.takeRate >= 50 ? "#1E8449" : "#B45309") : "#0369A1", "利益で手じまい／E成立" + (rr.ok + rr.ng + rr.draw) + "件"),
          _kpiCard("見切り率", rr.soft + "%", rr.soft > 0 ? "#B45309" : "#bbb"),
          _kpiCard("損切り率", rr.stop + "%", rr.stop > 0 ? "#1E8449" : "#bbb"));
      };
      var _detailOf = function(rs) {
        return React.createElement(React.Fragment, null,
          _secH("🎯 シグナル別 成功度", "損失なし率・勝率で並べ替え＝どのシグナルが成功しやすいか（損失が出なかったか）"), _elSignalSuccessTableV2(rs, _ai),
          _secH("🕘 時間帯別の成績（寄り付き重視）"), _elTimeOfDaySectionV2(rs, _ai),
          _secH("📍 EP位置の分析"), _elEpPosSectionV2(rs, _ai),
          _secH("🚫 次足期待度×（見送り）の分析"), _elXSkipSectionV2(rs, _ai),
          _secH("🔺 次足期待度△（ホールド）の分析"), _elTriangleHoldSectionV2(rs, _ai));
      };
      if (gran === "custom") {
        var _crecs = _perRecs.filter(function(r) { return (!cFrom || r.date >= cFrom) && (!cTo || r.date <= cTo); });
        var _dInput = function(val, setFn, label) { return React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#555" } }, label, React.createElement("input", { type: "date", value: val, onChange: function(e) { setFn(e.target.value); }, style: { padding: "4px 6px", fontSize: 12, border: "1px solid #ddd", borderRadius: 5 } })); };
        return _cardify([
          _secH("📆 期間集計", "粒度を選択。指定期間は開始・終了日で絞り込み（v2記録のみ）"), _granBtns,
          React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 } }, _dInput(cFrom, setCFrom, "開始 "), _dInput(cTo, setCTo, "終了 "), React.createElement("span", { style: { fontSize: 11, color: "#888" } }, _crecs.length + "件")),
          (cFrom || cTo) ? (_crecs.length ? [_periodKpi(_crecs), _detailOf(_crecs)] : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この期間に記録なし")) : React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: "14px 0", fontSize: 12, border: "1px dashed #e0ddd6", borderRadius: 10 } }, "開始日・終了日を選ぶと、その期間の合計損益と詳細分析が表示されます")]);
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
      _perRecs.forEach(function(r) { var k = _keyOf(r.date); (_byP[k] = _byP[k] || []).push(r); });
      var _keys = Object.keys(_byP).sort().reverse();
      if (!_keys.length) return _cardify([_secH("📆 期間集計"), _granBtns, React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "v2記録なし")]);
      var _chartKeys = _keys.slice().reverse();
      var _metInfo = { real: { label: "実現損益", get: function(t) { return t.real || 0; } }, h2: { label: "最終損益", get: function(t) { return t.hold2 || 0; } } };
      var _mi = _metInfo[chartMet] || _metInfo.h2;   // 旧plan/h1選択の残存stateは手じまいへフォールバック 2026-07-09
      var _xt = [], _step = Math.max(1, Math.ceil(_chartKeys.length / 6));
      var _per = _chartKeys.map(function(k, i) { var t = _periodTot(_byP[k]), rr = _ratesOf(_byP[k]); if (i % _step === 0 || i === _chartKeys.length - 1) _xt.push({ i: i, label: _labelOf(k) }); return { label: _labelOf(k), value: _mi.get(t), win: rr.takeRate }; });   // 破線=利確(最終損益>0)に統一 2026-07-09
      var _cum = [], _cs = 0; _per.forEach(function(p) { _cs += p.value; _cum.push(_cs); });
      var _dayBy = {}; _perRecs.forEach(function(r) { (_dayBy[r.date] = _dayBy[r.date] || []).push(r); });
      var _dayPer = Object.keys(_dayBy).map(function(dk) { var t = _periodTot(_dayBy[dk]); return { date: dk, value: _mi.get(t) }; });
      var _metBtns = React.createElement("div", { style: { display: "flex", flexWrap: "wrap", marginBottom: 8 } },
        React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 10, padding: 3, gap: 2 } },
          [["real", "実現損益"], ["h2", "最終損益"]].map(function(m) {
            var on = chartMet === m[0] || (m[0] === "h2" && !_metInfo[chartMet]);
            return React.createElement("button", { key: m[0], onClick: function() { setChartMet(m[0]); }, style: { padding: "4px 12px", fontSize: 11, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? "#9A3412" : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none", whiteSpace: "nowrap" } }, m[1]);
          })));
      var _cumChart = _chartKeys.length >= 2 ? _elLineChartV2([{ label: "累積" + _mi.label, color: "#C0392B", pts: _cum }], { xTicks: _xt }) : null;
      var _charts = [
        _metBtns,
        _secH("📊 損益バー＋利確（" + _mi.label + "）", "各期間の損益を上下バー（赤=利益/緑=損失）＋利確率(最終損益>0)を破線(右軸)で重ねる"),
        _elBarChartV2(_per, { winLabel: "利確(右軸)" }),
        _cumChart ? [_secH("📈 累積損益カーブ（" + _mi.label + "）", "右肩上がりなら勝ち越し（資産曲線）"), _cumChart] : null,
        _secH("🟥 ヒートマップ（曜日揃え・日別・" + _mi.label + "）", "列＝曜日(月〜金)で縦に揃え、曜日ごとの傾向を見る。色の濃淡で損益（赤=利益/緑=損失）・上が古い週→下が最新週・記録の無い営業日枠は薄い空セル"),
        _elWeekdayHeatV2(_dayPer, {})];
      var _thP = function(t) { return React.createElement("th", { style: { padding: "5px 5px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
      var _tdP = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
      // 日数: その期間に市場が開いていた営業日数（平日かつ非祝日・記録の有無に関係なく数える・当日までで頭打ち）。祝日＝ユーザーが記録した祝日/休場イベント(_buildHolidayDateSet)。2026-06-22d
      var _holiSet = _buildHolidayDateSet(data.trades, custom.eventCategories);
      var _today2 = todayStr();
      var _p2 = function(nn) { return ("0" + nn).slice(-2); };
      var _bizDaysIn = function(k) {
        var days = [];
        if (gran === "day") { days = [k]; }
        else if (gran === "month") { var y = +k.slice(0, 4), m = +k.slice(5, 7), last = new Date(y, m, 0).getDate(); for (var dd = 1; dd <= last; dd++) days.push(k + "-" + _p2(dd)); }
        else { var mon = new Date(k + "T00:00:00"); for (var i = 0; i < 5; i++) { var d = new Date(mon.getTime() + i * 86400000); days.push(d.getFullYear() + "-" + _p2(d.getMonth() + 1) + "-" + _p2(d.getDate())); } }
        var c = 0; days.forEach(function(d) { if (d <= _today2 && _fmIsBizDay(d, _holiSet)) c++; });
        return c;
      };
      // 件数の下の「（1日平均〇件）」＝件数÷日数。割り切れれば整数・端数は小数第1位まで。日別は各行=1日で冗長なので非表示 2026-07-19（全体損益・期間別の_ovPnlTblと同扱い）。
      var _avgCntLine2 = function(cnt, days) { if (!days || gran === "day" || cnt == null) return null; var r1 = Math.round(cnt / days * 10) / 10; var disp = (r1 === Math.round(r1)) ? String(Math.round(r1)) : r1.toFixed(1); return React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "（1日平均" + disp + "件）"); };
      var _rows = [];
      _keys.forEach(function(k) {
        var rs = _byP[k], t = _periodTot(rs), rr = _ratesOf(rs), dn = _bizDaysIn(k), _reach = rs.length - rr.miss, on = perExp === k;
        _rows.push(React.createElement("tr", { key: k, onClick: function() { setPerExp(on ? null : k); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
          _tdP(React.createElement("span", null, React.createElement("span", { style: { color: "#F97316", marginRight: 3, fontSize: 9 } }, on ? "▼" : "▶"), _labelOf(k), _elEmaRefNote(_elIsEmaRefPeriod(k, gran))), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
          _tdP(dn + "日", { fontWeight: 600, color: "#555" }),
          _tdP(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, React.createElement("span", { style: { fontWeight: 700 } }, rs.length + "件"), _avgCntLine2(rs.length, dn))),
          _tdP(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, React.createElement("span", { style: { fontWeight: 700, color: "#9A3412" } }, _reach + "件"), rs.length ? React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, Math.round(_reach / rs.length * 100) + "%") : null, (dn && gran !== "day" && _reach) ? (function() { var r1 = Math.round(_reach / dn * 10) / 10; var disp = (r1 === Math.round(r1)) ? String(Math.round(r1)) : r1.toFixed(1); return React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1, textAlign: "center", marginTop: 1 } }, React.createElement("span", { style: { display: "block" } }, "1日平均"), React.createElement("span", { style: { display: "block" } }, disp + "件")); })() : null)),   // 到達の1日平均（2行）2026-07-24
          _tdP(rr.takeRate != null ? React.createElement("span", { style: { fontWeight: 700, color: rr.takeRate >= 50 ? "#1E8449" : "#B45309" } }, rr.take + "件・" + rr.takeRate + "%") : React.createElement("span", { style: { color: "#bbb" } }, "—")),
          _tdP(rr.stop + "%", { color: rr.stop > 0 ? "#1E8449" : "#bbb", fontWeight: rr.stop > 0 ? 700 : 400 }),
          _tdP(rr.soft + "%", { color: rr.soft > 0 ? "#B45309" : "#bbb", fontWeight: rr.soft > 0 ? 700 : 400 }),
          _tdP(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, dn), (dn && t.hold2 != null) ? React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "1日平均" + (Math.round(t.hold2 / dn) >= 0 ? "+" : "") + Math.round(t.hold2 / dn).toLocaleString()) : null)),
          _tdP(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenN(t.real, t.realCnt, dn), (dn && t.real != null) ? React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "1日平均" + (Math.round(t.real / dn) >= 0 ? "+" : "") + Math.round(t.real / dn).toLocaleString()) : null))));
        if (on) _rows.push(React.createElement("tr", { key: k + "_d" }, React.createElement("td", { colSpan: 9, style: { padding: "6px 8px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } }, _detailOf(rs))));
      });
      return _cardify([
        _secH("📆 期間集計（" + (gran === "day" ? "日別" : gran === "week" ? "週別" : "月別") + "・新しい順）", "行タップでその期間の詳細分析（シグナル成功度・時間帯傾向・EP位置）"), _granBtns,
        _charts,
        _elCard(React.createElement(_HScrollBox, null,
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } },
              _thP(gran === "day" ? "日" : gran === "week" ? "週" : "月"), _thP("日数"), _thP("件数"),
              _thP(React.createElement("span", null, "到達", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "EP到達件数"))),
              _thP(React.createElement("span", null, "利確", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "利益で手じまい・E成立母数"))),
              _thP("損切り率"), _thP("見切り率"),
              _thP("最終損益"), _thP("実現損益"))),
            React.createElement("tbody", null, _rows))))]);
    })());
  } else if (view === "deep") {
    _tabBody = _selSigRecsScoped.length ? _cardify([
      React.createElement("div", { style: { fontSize: 10, color: "#9A3412", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "5px 9px", marginBottom: 8 } }, "ℹ 深掘りは" + (_floatMode ? "浮き足" : "その他") + "の全記録（応用あり＋応用なし）を各記録の採用α基準で分析（本数最適化・EP位置・執行の学習が目的）。応用α〇は採用αが高いため損切り率は高め・未達で母数から抜けやすい点に注意。基本α/応用αの分離は集計/損切り/未達タブの「分類」トグルで。"),
      _secH("⏳ 最適ホールド本数", "EPから何本持つのが最も期待値が高いか（深さ別の平均損益・損切り率・EP比改善率）", _detCtl("dp_hold", _selSigRecsScoped)), _detBody("dp_hold", _selSigRecsScoped, function(_drs) { return _elHoldDepthSectionV2(_drs, _ai); }),
      _secH("🎯 次足期待度キャリブレーション", "事前のH期待が実結果とどれだけ一致したか（予想は当たっているか過信か）", _detCtl("dp_calib", _selSigRecsScoped)), _detBody("dp_calib", _selSigRecsScoped, function(_drs) { return _elExpCalibSectionV2(_drs, _ai); }),
      _secH("🚫 次足期待度×（見送り）の分析", "×見送りを取引していたらの損益と、見送り判断の精度（損失回避＝正解／機会損失＝逃した利益）。集計タブから移設", _detCtl("dp_x", _selSigRecsScoped)), _detBody("dp_x", _selSigRecsScoped, function(_drs) { return _elXSkipSectionV2(_drs, _ai); }),
      _secH("🔺 次足期待度△（ホールド）の分析", "△で保有したH1/H2を本算入(（）外算入)していたらの損益と、△保有の是非（活きた＝1段下より伸長／裏目＝1段下で手仕舞いが正解）。集計タブから移設", _detCtl("dp_tri", _selSigRecsScoped)), _detBody("dp_tri", _selSigRecsScoped, function(_drs) { return _elTriangleHoldSectionV2(_drs, _ai); }),
      _secH("📍 EP位置の分析", "EPがどの足で成立したか（採用α基準）とEP位置別の成績。集計タブから移設", _detCtl("dp_ep", _selSigRecsScoped)), _detBody("dp_ep", _selSigRecsScoped, function(_drs) { return _elEpPosSectionV2(_drs, _ai); }),
      _secH("🎯 計画EP vs 実エントリーの乖離", "計画したEP/αに対し実際の建玉・取引αがどれだけズレたか（執行の質・規律）", _detCtl("dp_exec", _selSigRecsScoped)), _detBody("dp_exec", _selSigRecsScoped, function(_drs) { return _elExecGapSectionV2(_drs, _ai); }),
      _secH("📝 メモ×成績", "根拠/反省を書いた記録ほど勝てているか＋負けた記録の頻出キーワード（敗因）", _detCtl("dp_memo", _selSigRecsScoped)), _detBody("dp_memo", _selSigRecsScoped, function(_drs) { return _elMemoPerfSectionV2(_drs, _ai); })
    ]) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _floatMode ? "このシグナルに浮き足の記録がありません（「その他」タブへ）" : "このシグナルの「その他」記録がありません（「浮き足」タブへ）");
  } else if (view === "sim" && _isAllStock) {
    // 🧮 全銘柄一括シミュ 2026-07-20f（💰損益タブ・期間の右）: 銘柄を問わず全記録に同じラダーを当てる。母数＝_v2recsAll（全銘柄・全シグナルのv2算入記録）＝シグナル選択も内訳(浮き足/その他)タブも持たない＝文字どおり一括。浮き足は除外チェックで扱う。
    // baseRecs＝allRecs（全銘柄・全期間）を渡し、コンポーネント側が**銘柄ごとに**推奨αを算出する（銘柄別シミュの baseRecs=allRecs.filter(その銘柄) と同じ母数を銘柄数ぶん持つ形）。
    // scopeStock=null＝時間かぶり除外は銘柄横断＝💰損益タブの他の集計と同じ線引き（銘柄別タブだけが同一銘柄内限定）。
    _tabBody = _v2recsAll.length ? _cardify([
      React.createElement("div", { style: { background: "#F0FDFA", border: "1px solid #99F6E4", borderLeft: "4px solid #0F766E", borderRadius: 11, padding: "8px 12px", marginBottom: 6 } },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E" } }, "株数シミュ ― 全銘柄一括の空売りバックテスト"),
        React.createElement("div", { style: { fontSize: 9.5, color: "#0F6E56", marginTop: 3, lineHeight: 1.5 } }, "同じラダーを全銘柄・全シグナルに一律で適用したら通算いくらだったか。推奨α系の方式は各記録が自分の銘柄の推奨αを使います（銘柄をまたいで平均しません）。",
          React.createElement("span", { style: { color: "#B45309" } }, "※銘柄別タブのシミュとは母数が違うので合計は一致しません＝あちらは選択中シグナルのみが母数、時間かぶり除外も同一銘柄内だけ。こちらは全シグナル・銘柄をまたいだ被りも除外します。"))),   // 2026-07-20h 「銘柄別タブのシミュを合算した値と一致します」は誤りだったので訂正（母数の定義が3点で異なる）
      _elCard(React.createElement(_elKabuLadderSimV2, { recs: _v2recsAll, baseRecs: allRecs, aiOf: _ai, data: data, scopeStock: null, allStock: true }))])
      : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "EP起算（v2）の記録がありません");
  } else if (view === "sim") {
    // 🧮 シミュタブ 2026-07-03: 株数シミュ（建て株数ラダーの空売りバックテスト）をα値タブ④から独立タブへ昇格（ユーザー決定＝案A・深掘りの右）。シミュ母数＝内訳スコープ（前足浮き/その他）・推奨αの算出は銘柄全体（全シグナル）＝日別ページ/記録フォームと一致 2026-07-03t（旧: baseRecs=_selSigRecsでシグナル別→値ズレのため銘柄全体へ）。
    _tabBody = _selSigRecs.length ? _cardify([
      React.createElement("div", { style: { background: "#F0FDFA", border: "1px solid #99F6E4", borderLeft: "4px solid #0F766E", borderRadius: 11, padding: "8px 12px", marginBottom: 6 } },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E" } }, "株数シミュ ― 建て株数ラダーの空売りバックテスト")),
      _elCard(_detCtlRow("sim", _selSigRecsScoped),
      _detBody("sim", _selSigRecsScoped, function(_drsRaw) {
        var _drs = _drsRaw.filter(function(r) { return _elInclTotal(r.signal); });   // シミュ＝損益のwhat-if＝計算算入(money)母数（分析根_v2recsAllData由来のデータonを除外・敵対レビューFinding1修正 2026-07-22f）
        return _drs.length ? React.createElement(_elKabuLadderSimV2, { recs: _drs, baseRecs: (_isAllStock ? _selSigRecs : allRecs.filter(function(r) { return r && r.stock === _selStock; })), aiOf: _ai, floatMode: _floatMode, data: data, scopeStock: _collScope })
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この詳細に該当する記録がありません");
      }))])
      : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _sigAxisGroups.length ? "このシグナルのEP起算（v2）記録がありません" : "EP起算（v2）の記録がありません");
  } else if (view === "miss") {
    _tabBody = _isAllStock
      ? React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "上の銘柄タブで銘柄を選ぶと、その銘柄の未達分析を表示します")
      : (_selSigRecsScoped.length
          ? _cardify([
              _secH("❌ 未達記録の分析（" + (_floatMode ? "浮き足" : "その他") + "）", "選択中シグナルのこの内訳（" + (_floatMode ? "浮き足" : "その他") + "）で、αに3本以内（OS1〜3）で届かずエントリーできなかった記録の詳細（×見送りは除く）。最高値の分布・α不足額・α下げシミュ。母数は上のトグル（既定＝基本α＝シグナル本来の到達性。応用αは採用αが高く未達に寄る）", _detCtl("ms", _selSigRecsScoped)),
              _addFilBar(),
              _detBody("ms", _selSigRecsScoped, function(_drs) {
                var _msRecs = _addFilOf(_drs);
                return _msRecs.length ? _elMissSectionV2(_msRecs, _ai, true) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この母数に該当する記録がありません（トグルを切替）");
              })])
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _floatMode ? "このシグナルに浮き足の記録がありません（「その他」タブへ）" : "このシグナルの「その他」記録がありません（「浮き足」タブへ）"));
  }

  // 2026-07-20i 旧「🗓 期間指定」バー（_rngISty/_rngBtn/_rngBar と rngFrom/rngTo state）は年月週日カスケード選択(_ElPeriodPicker)へ統合したため撤去。
  // 任意の開始日〜終了日という自由レンジは無くなるが、年→月→週→日を複数選択できるので実用上の指定はカバーできる。

  // レイアウト刷新・案A（2026-07-12）: ヘッダー=アイコン＋タイトル＋スコープサブタイトル。期間はチップ風セレクト・＋新規は右端。
  return React.createElement("div", { style: { padding: "12px 14px", maxWidth: 1100, margin: "0 auto" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, marginBottom: 8, flexWrap: "wrap" } },
      onBack ? React.createElement("button", { onClick: onBack, title: "戻る", style: { padding: "6px 11px", fontSize: 13, fontWeight: 700, background: "#fff", border: "1px solid #E4DFD7", borderRadius: 9, cursor: "pointer", color: "#5C554B" } }, "←") : null,
      React.createElement("div", { style: { width: 30, height: 30, borderRadius: 9, background: "#FBEDE6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 } }, "📒"),
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#1A1714", lineHeight: 1.2 } }, "エントリー記録帳"),
        React.createElement("div", { style: { fontSize: 10, color: "#9A9186", fontWeight: 700, marginTop: 1 } }, (_isSigTotal ? "シグナル総合" : _isAllStock ? "全銘柄" : _selStock) + " ・ " + filtered.length + "件")),
      React.createElement("div", { style: { marginLeft: "auto" } }),   // 2026-07-20i 期間の<select>は年月週日ピッカー（下の_periodPickerEl）へ置換。ここは右寄せ用のスペーサー
      // 2026-07-20j 母数トグル「全期間/5月〜」を撤去＝4月以前を常時除外にしたので両状態が同じ結果になり、押しても何も変わらないトグルになったため。
      React.createElement("button", { onClick: function() { setEditTarget({}); }, style: { padding: "7px 13px", fontSize: 12, fontWeight: 800, background: "#1A1714", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" } }, "＋新規")),
    // 2026-07-20i 期間の指定を年月週日カスケード選択へ置換（旧: 全期間/今週/1ヶ月…のローリング<select>＋🗓期間指定バー）。既定は全て「全て」＝全期間で、開いた時の見え方は従来と同じ。
    // 母数は_anaRecs（4月以前を除外済み）＝ピッカーの件数表示も同じ母数で数える。
    React.createElement(_ElPeriodPicker, { value: pSel, onChange: function(s) { setPSel(s); setExpKey(null); setPerExp(null); }, recs: _anaRecs, label: "期間" }),
    React.createElement("div", { style: { fontSize: 9.5, color: "#B45309", margin: "0 2px 7px", lineHeight: 1.4 } }, "※ 2026年4月以前はEMAの位置に間違いがあったため、記録帳の集計・分析・一覧すべてから除外しています（5月以降が正）。"),
    React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 6px", marginBottom: 6 } },
      React.createElement("button", { key: "__allbtn__", onClick: function() { setStockFil(_ALL_STOCK); setExpKey(null); setSelDate(null); setSelSig(null); setFloatSub("other"); setDetScopes({}); setPerExp(null); setAddAlphaFil("all"); setDetTagMode("sig"); setSelDetTag(null); if (view !== "sum" && view !== "period" && view !== "sim") setView("sum"); },   // 2026-07-20h "sim"を追加＝全銘柄タブに🧮シミュを新設(07-20f)した際にこのガードを更新し忘れ、銘柄タブでシミュを開いてから💰損益を押すと集計へ飛ばされて新タブに入れなかった
        style: { flexShrink: 0, padding: "6px 15px", fontSize: 12, fontWeight: 800, borderRadius: 15, cursor: "pointer", whiteSpace: "nowrap",
          border: "1px solid " + (_isAllStock ? "#1A1714" : "#E0DAD1"), background: _isAllStock ? "#1A1714" : "#fff", color: _isAllStock ? "#fff" : "#6B6459" } },
        "💰 損益 (" + _periodRecs.length + ")"),
      React.createElement("button", { key: "__sigtotalbtn__", onClick: function() { setStockFil(_SIG_TOTAL); setExpKey(null); setSelDate(null); setSelSig(null); setFloatSub("other"); setDetScopes({}); setPerExp(null); setAddAlphaFil("all"); setDetTagMode("sig"); setSelDetTag(null); },
        style: { flexShrink: 0, padding: "6px 13px", fontSize: 12, fontWeight: 800, borderRadius: 15, cursor: "pointer", whiteSpace: "nowrap",
          border: "1px solid " + (_isSigTotal ? "#0F766E" : "#E0DAD1"), background: _isSigTotal ? "#0F766E" : "#fff", color: _isSigTotal ? "#fff" : "#6B6459" } },
        "📡 シグナル総合"),
      _tickerList.length ? _tickerList.map(function(s) {
        var on = _selStock === s;
        return React.createElement("button", { key: s, onClick: function() { setStockFil(s); setExpKey(null); setSelDate(null); setSelSig(null); setFloatSub("other"); setDetScopes({}); setPerExp(null); setDetTagMode("sig"); setSelDetTag(null); },
          style: { flexShrink: 0, padding: "6px 13px", fontSize: 12, fontWeight: 800, borderRadius: 15, cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid " + (on ? "#9A3412" : "#E0DAD1"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#6B6459" } },
          s + " (" + (_cntByStock[s] || 0) + ")");
      }) : null),
    (!_isAllStock && !_isSigTotal && _sigAxisGroups.length && !(view === "sum" && ((detTagMode === "det" && _hasDetTags) || detTagMode === "band"))) ? React.createElement("div", { style: { margin: "0 0 10px", background: "#fff", border: "1px solid #ECE7DE", borderRadius: 13, padding: "10px 12px", boxShadow: "0 1px 2px rgba(0,0,0,.03)" } },   // 文脈カード（案A 2026-07-12）: 旧シグナル行＋内訳行を1枚に統合。内訳（浮き足/その他 2026-07-02）は右上のセグメント・シグナルは折返しチップ。
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontSize: 9.5, fontWeight: 800, color: "#9A3412", letterSpacing: ".04em" } }, "🎯 シグナル"),
        React.createElement("div", { style: { marginLeft: "auto", display: "flex", background: "#F1EEE8", borderRadius: 9, padding: 2, gap: 2 } },
          [["float", "浮き足", _selSigFloat.length], ["other", "その他", _selSigOther.length]].map(function(kv) {
            var on = floatSub === kv[0];
            return React.createElement("button", { key: kv[0], onClick: function() { setFloatSub(kv[0]); setExpKey(null); },
              style: { padding: "3px 10px", fontSize: 10.5, fontWeight: 700, border: "none", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap",
                background: on ? "#fff" : "transparent", color: on ? "#1A1714" : "#6B6459", boxShadow: on ? "0 1px 2px rgba(0,0,0,.08)" : "none" } },
              kv[1] + " (" + kv[2] + ")");
          }))),
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } },
        _sigAxisGroups.map(function(g) {
          var on = _selSigKey === g.key;
          var lowN = g.recs.length < _EL_BASE_MIN_N;
          return React.createElement("button", { key: g.key, onClick: function() { setSelSig(g.key); setExpKey(null); setFloatSub("other"); setDetScopes({}); setDetTagMode("sig"); setSelDetTag(null); },
            style: { padding: "5px 12px", fontSize: 11.5, fontWeight: 700, borderRadius: 14, cursor: "pointer", whiteSpace: "nowrap",
              border: "1px solid " + (on ? "#9A3412" : "#E0DAD1"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : (lowN ? "#c0b6ab" : "#6B6459") } },
            g.label + " (" + g.recs.length + ")" + (lowN ? " 参考" : ""));
        }))) : null,
    React.createElement("div", { style: { display: "flex", background: "#EFEBE4", borderRadius: 11, padding: 3, marginBottom: 10, gap: 2, overflowX: "auto" } },   // タブ=セグメントコントロール式（案A 2026-07-12・選択=白カード浮き・ラベルは絵文字なし）
      (_isSigTotal ? _SIG_TABS : _tabs).map(function(kv) {
        var on = _isSigTotal ? (sigSub === kv[0]) : (view === kv[0]);
        var cnt = (!_isSigTotal && kv[0] === "miss") ? _missCnt : null;
        var _acc = _isSigTotal ? "#0F766E" : "#9A3412";
        var _lbl = kv[1].indexOf(" ") > 0 ? kv[1].slice(kv[1].indexOf(" ") + 1) : kv[1];
        return React.createElement("button", { key: kv[0],
          onClick: function() { if (_isSigTotal) { setSigSub(kv[0]); } else { setView(kv[0]); } setExpKey(null); },
          style: { flexShrink: 0, padding: "6px 12px", fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 8,
            background: on ? "#fff" : "transparent", color: on ? _acc : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none", whiteSpace: "nowrap" }
        }, _lbl + (cnt != null ? "(" + cnt + ")" : ""));
      })),
    (view === "period" && !_isAllStock && !_isSigTotal) ? React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 5, padding: "6px 9px", borderRadius: 8, background: addAlphaFil !== "all" ? "#FFF7ED" : "#fff", border: "1px solid " + (addAlphaFil !== "all" ? "#FB923C" : "#f0ede8"), boxShadow: "0 2px 4px -2px rgba(0,0,0,0.12)" } },   // 追加α分析トグル＝期間タブ限定（集計/α値/損切り/未達/深掘りはシグナル軸の固定母数でトグル非適用・全銘柄合算=非表示）。絞り込み中は橙で強調 2026-07-01
      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412" } }, "分類:"),
      [["all", "全記録"], ["no", "基本α"], ["yes", "応用α"]].map(function(kv) {
        var on = addAlphaFil === kv[0];
        return React.createElement("button", { key: kv[0], onClick: function() { setAddAlphaFil(kv[0]); setExpKey(null); },
          style: { padding: "4px 12px", fontSize: 11, fontWeight: 700, borderRadius: 14, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } }, kv[1]);
      }),
      addAlphaFil !== "all" ? React.createElement("span", { style: { fontSize: 10, color: "#C2410C", fontWeight: 700 } }, "🔍 " + (addAlphaFil === "yes" ? "応用α" : "基本α") + " のみで母数を絞り込み中（「全記録」で解除）") : null) : null,
    _tabBody,
    editTarget ? React.createElement(EntryRecordForm, { data: data, save: save, initial: (editTarget && editTarget.signal) ? editTarget : null, onClose: function() { setEditTarget(null); } }) : null
  );
}
