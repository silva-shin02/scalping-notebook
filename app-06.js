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
function _elOsBucketLabel(key) { return key === "neg" ? "下落" : key === "0-4" ? "0〜4円" : key === "25+" ? "25円〜" : (key + "円"); }
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
  var recs = _elCollectAllSignals(data).filter(function(r) { return r.stock === stock && _elInclTotal(r.signal); });
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
  recs = (recs || []).filter(function(r) { return !(r.signal && _elIsReview(r.signal)); });   // 要審議は合計損益（累積）に不算入（_elTotAccumと同基準）2026-07-14c
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
// 推奨α＝理想α−_EL_ALPHA_OFFSET（2026-07-13 ユーザー方針）: 理想αちょうどに指値すると「ギリギリ入らない」ことが多いので、1円下げてフィルしやすくする。理想α=到達率ベースの★／推奨α=実際に置く値（フォーム/EPナビ/本日採用α/シミュへ流れる）。max(0,…)で負にしない。固定1（調整UIなし・ユーザー指定）。
var _EL_ALPHA_OFFSET = 1;
// B案（膝／ひざ）2026-07-15 ユーザー方針: ★選定を「ゲートを満たす最も高いα」から「累計損益(Σ最終損益)がほぼ最大を保てる範囲で質が最良のα」へ変更。平均が高くてもエントリー数が少なく累計が痩せる高α側を選ばないための膝フィルタ。_EL_KNEE_FRAC＝Σが候補中の最大値のこの割合以上を膝（累計をほぼ落とさない）とみなす閾値。1に近いほど累計優先。基本α・応用α・追加α・浮き足で共通。
var _EL_KNEE_FRAC = 0.95;
// ゲート通過候補をΣ最終損益が候補中の最大の_EL_KNEE_FRAC以上に絞る（累計をほぼ落とさない膝の範囲）。sigOf(x)=xのΣ最終損益。最大が0以下/全滅は元配列のまま返し質ソートは呼び出し側に委ねる。2026-07-15。
function _elKneeFilter(cands, sigOf) { if (!cands || !cands.length) return cands || []; var mx = -Infinity; cands.forEach(function(x) { var v = sigOf(x); if (v != null && v > mx) mx = v; }); if (!(mx > 0)) return cands; var near = cands.filter(function(x) { var v = sigOf(x); return v != null && v >= mx * _EL_KNEE_FRAC; }); return near.length ? near : cands; }
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
// 推奨基本αの選定パラメータ【再設計 2026-06-22】。後で調整可。
var _EL_BASE_MIN_N = 10;          // 最低エントリー件数（H1結果が判定できる記録数 scN）の絶対下限。未満のαは推奨対象外＝薄い標本の偶然採用を防ぐ。2026-07-08 3→10（推奨基本α/追加α/損切り共通の下限・件数の信頼性重視・ユーザー要望＝全推奨一律。10件未満は(仮)/参考表示に）。
var _EL_BASE_MIN_FRAC = 0.5;     // 件数フロア（実データ連動）: 最も件数(scN)の多いαの何割以上を要求するか。高αの薄い標本(選抜バイアスでスコア上振れ)を除外 2026-06-22b。後で調整可。※2026-07-13以降は旧スコア方式(_elBaseAlphaPickScore)のみで使用。
var _EL_BASE_N_PREF = 20;        // ★選定の有効件数(E成立)フロア第1候補（2026-07-13 条件式化・ユーザー方針=20件、無ければ_EL_BASE_MIN_N(10件)へ自動緩和）。
var _EL_BASE_MAX_STOPRATE = 0.25;   // ★選定の損切り率(手じまい基準)上限（2026-07-13=20%→2026-07-14e ユーザー緩和=25%以下）。基本α/応用α共通。
var _EL_BASE_MAX_STOPRATE_2 = 0.30; // 該当なし時の緩和上限（30%・status=na参考）。
var _EL_FREQ_MAX = 5;               // ★選定の頻度ゲート（2026-07-13c 導入→2026-07-13d 理想を4→5に緩和 ユーザー方針=理想は5営業日に1回以内）＝活動営業日span÷そのαの到達実日数 ≤ これ。損切り率30%まで緩和しても該当なしなら最後にこのゲートを外す（status=na）。span算出不能/到達0はゲート素通り。
// ===== 前提損切り値（2026-07-13 ユーザー指定）＝推奨α分析（基本α/追加αのスイープ・★選定・詳細データ表）はこの損切り値を前提に評価 =====
// 「損切り値が何円であることを前提として、分析の結果、推奨α値はこうなった」。既定15円・custom.anaCutPremiseに保存（全端末同期）。
// 対象＝推奨系スイープのみ（_elBaseAlphaPick/Score・_elAddAlphaPickDate/RecoScore・詳細データ表の表示スイープ）。
// 非対象＝実績損益・損切りタブ（損切り値を振る分析）・推奨損切り(_elCutPick)・α意思決定表/感応度（採用値明記済み）・効果検証（実績）。
// _elAnaCutCurの同期は_elAlphaInfo(app-05)内＝aiOf構築のたびにdataから更新（各画面のaiOfは全て_elAlphaInfo経由のため描画時に必ず最新化される）。
var _EL_ANA_CUT_DEF = 15;
var _elAnaCutCur = _EL_ANA_CUT_DEF;
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
// ===== 到達率の下限（2026-07-13 ユーザー指定）＝基本α★の付け方＝「この到達率以上・黒字を満たすαのうち累計Σがほぼ最大を保てる範囲で質が最良のα（膝・2026-07-15 B案）」を推奨 =====
// 既定50%（2026-07-14e 60→50に緩和）・10刻みで調整可・custom.anaReachFloorに保存（全端末同期）。同期は_elAlphaInfo(app-05)内で_elAnaCutと並んで実施。2026-07-14e以降＝基本α★(_elBaseAlphaPick)＋応用α★(_elSpecialAlphaPick)の両方が全条件ゲートでこの到達率下限を使用（旧「応用αは平均最終損益最大のまま」は失効）。
var _EL_ANA_REACH_DEF = 50;
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
    React.createElement("span", { style: { fontSize: 8.5, color: "#0369A1" } }, "基本αの★＝この到達率以上・頻度" + _EL_FREQ_MAX + "以内・黒字を満たすαのうち累計Σがほぼ最大を保てる範囲で質が最良のα（膝）・既定" + _EL_ANA_REACH_DEF + "%"));
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
    if (t2 && t2.main != null) { h2Sum += t2.main; h2Cnt++; if (t2.main > 0) takeN++; }
  });
  var stopRate = decided > 0 ? stopN / decided : null;
  var takeRate = decided > 0 ? takeN / decided : null;
  var score = decided > 0 ? (_EL_BASE_W_STOP * (1 - stopRate) + _EL_BASE_W_H1 * takeRate) : null;
  return { n: n, entered: entered, eRate: n > 0 ? entered / n : 0, decided: decided, stopN: stopN, stopRate: stopRate, takeN: takeN, takeRate: takeRate, h2Sum: h2Cnt ? h2Sum : null, h2Cnt: h2Cnt, avgH2: h2Cnt ? (h2Sum / h2Cnt) : null, score: score };
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
// ===== RNまたぎ加算の分析ボード（シグナル総合「🔢RN」・承認④ 2026-07-12）=====
// 浮き足%ボードと同思想＝最終損益(手じまい)基準(_elH2EvalByFn)。母数=渡されたv2算入記録のうちRN〇(signal.rnUsed・_elRnYes)。
// 上段=現実(採用α=記録どおり) vs 反実仮想(RN加算を外す=採用α−RN値・EP到達から再判定)＝「またぎまで待つ判断は割に合っているか」。
// 下段=RN加算値別の現実成績。E成立<_EL_BASE_MIN_Nは（仮）。※RN×側との比較は「RNまたぎ状況だったか」のフラグが記録に無く不可能＝出さない。
function _elRnBoardV2(recs, aiOf) {
  var pool = (recs || []).filter(function(r) { return r && _elRnYes(r.signal); });
  var _th2 = function(t, k) { return React.createElement("th", { key: k, style: { padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
  var _td2 = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #F0EDE7", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  if (!pool.length) return React.createElement("div", { style: { color: "#94A3B8", textAlign: "center", padding: "24px 12px", fontSize: 12, border: "1px dashed #e0ddd6", borderRadius: 10 } }, "RNまたぎ加算〇の記録がまだありません（記録フォーム/EPナビでRN〇を付けると貯まります・2026-07-08導入）");
  var real = _elH2EvalByFn(pool, aiOf, function(r) { return aiOf(r).alpha; });
  var cf = _elH2EvalByFn(pool, aiOf, function(r) { var a = aiOf(r).alpha; if (a == null) return null; return Math.max(0, a - _elRnAdd(r.signal)); });
  var _better = (real.h2Sum != null && cf.h2Sum != null) ? (real.h2Sum - cf.h2Sum) : null;
  var _rowOf = function(label, e, hot) {
    var thin = e.decided < _EL_BASE_MIN_N;
    return React.createElement("tr", { key: label, style: { background: hot ? "#FEF3C7" : "transparent" } },
      _td2(React.createElement("span", { style: { fontWeight: 700, color: "#334155" } }, label, thin ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 3, fontWeight: 700 } }, "（仮）") : null), { textAlign: "left", paddingLeft: 8 }),
      _td2(e.n + "件"),
      _td2(_elPctCell(e.eRate)),
      _td2(e.decided + "件"),
      _td2(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _td2(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _td2(e.h2Sum == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(e.h2Sum), fontWeight: 800 } }, _elPnlFmt(e.h2Sum))),
      _td2(e.avgH2 == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(e.avgH2), fontWeight: 700 } }, _elPnlFmt(Math.round(e.avgH2)))));
  };
  var byVal = {};
  pool.forEach(function(r) { var v = _elRnAdd(r.signal); (byVal[v] = byVal[v] || []).push(r); });
  var valRows = Object.keys(byVal).map(Number).sort(function(a, b) { return a - b; }).map(function(v) {
    var e = _elH2EvalByFn(byVal[v], aiOf, function(r) { return aiOf(r).alpha; });
    return React.createElement("tr", { key: "v" + v },
      _td2(React.createElement("span", { style: { fontWeight: 700, color: "#1D4ED8" } }, "+" + v + "円"), { textAlign: "left", paddingLeft: 8 }),
      _td2(byVal[v].length + "件"),
      _td2(_elPctCell(e.eRate)),
      _td2(e.decided + "件"),
      _td2(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _td2(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _td2(e.h2Sum == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(e.h2Sum), fontWeight: 800 } }, _elPnlFmt(e.h2Sum))));
  });
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9.5, color: "#A79E92", marginBottom: 6 } }, "母数＝RN〇の全記録（" + pool.length + "件）。反実仮想＝RN加算を外した採用α（−RN値）でEP到達から再判定＝「またぎまで待たなかったら」。最終損益（手じまい・○途切れ）基準。"),
    React.createElement(_HScrollBox, null, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", null, ["", "母数", "到達率", "E成立", "損切り率", "利確率", "Σ最終損益", "平均"].map(function(h, i) { return _th2(h, i); }))),
      React.createElement("tbody", null, _rowOf("RN込み（記録どおり）", real, _better != null && _better > 0), _rowOf("RN無しなら（α−RN）", cf, _better != null && _better < 0)))),
    _better != null ? React.createElement("div", { style: { fontSize: 10.5, color: "#555", marginTop: 6 } }, "RNまたぎ加算の寄与（Σ最終損益の差）: ", React.createElement("b", { style: { color: _elPnlColor(_better) } }, (_better > 0 ? "+" : "") + Math.round(_better).toLocaleString() + "円"), React.createElement("span", { style: { color: "#94A3B8", marginLeft: 6 } }, _better > 0 ? "＝RNまで待つ判断が効いている" : _better < 0 ? "＝RNを外した方が良かった（浅いαで到達が増える効果）" : "")) : null,
    valRows.length > 1 ? React.createElement("div", { style: { marginTop: 12 } },
      React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", marginBottom: 4 } }, "RN加算値別（記録どおり・現実成績）"),
      React.createElement(_HScrollBox, null, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", null, ["RN値", "件数", "到達率", "E成立", "損切り率", "利確率", "Σ最終損益"].map(function(h, i) { return _th2(h, i); }))),
        React.createElement("tbody", null, valRows)))) : null);
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
// 「黒字(Σ最終損益>0)かつ 到達率≥下限(_elAnaReachCur%・既定60・10刻み調整可)かつ 頻度≤_EL_FREQ_MAX」のαのうち【最も高いα】を理想α（＝その到達率・頻度は保てる範囲でいちばん有利な高いα）2026-07-13頻度も選定に組込。全滅時は黒字/到達最大へ緩和(na)。
// 推奨α＝max(0,理想−_EL_ALPHA_OFFSET)＝指値を通しやすくするため理想から1円下げた実際に置く値（返り値.alpha＝推奨・消費者へ流れる／.idealAlpha＝理想）。stats・★は推奨αのもの。
// 赤★(status ok)=さらに 損切り率(最終)≤_EL_BASE_MAX_STOPRATE(20%)・E成立≥_EL_BASE_MIN_N(10件)・頻度≤_EL_FREQ_MAX の自信条件も満たす／青★(na)=条件を一部満たさない参考。
// 下限を満たすα無し(相場が荒い)→黒字αのうち最も到達率が高い(最も届きやすい)αを参考(na)。黒字α皆無→件数最大を参考。次点=推奨より高い黒字αの最小値（もう一段クッション）。
// 返り値shapeは旧版互換（score/h1win/scN/pnl等はH1基準を同αで併記・低αpickはH1参考列がnull）＋decided/takeRate/h2Sum/avgH2/h2sweep/reachFloor。旧スコア方式は_elBaseAlphaPickScoreに保存（「旧基準」チップで併記）。
function _elBaseAlphaPick(recs, aiOf) {
  if (!recs || !recs.length) return null;
  recs = recs.filter(_elIsBaseAlphaPoolRec);
  if (!recs.length) return null;
  aiOf = _elAnaAiOf(aiOf);   // 前提損切り値（既定15円・custom.anaCutPremise）で評価＝「損切り値が◯円である前提での推奨α」2026-07-13b
  var sweep = _EL_BASE_ALPHAS.map(function(a) { return _elBaseAlphaEval(recs, aiOf, a); });   // H1基準（5〜20・旧表示互換の参考列用）
  var full = _EL_BASE_ALPHAS_FULL.map(function(a) { var e = _elH2EvalByFn(recs, aiOf, function() { return a; }); e.a = a; return e; });   // 手じまい基準・0〜20（★選定はこちら）
  var h2sweep = full.filter(function(e) { return e.a >= 5; });   // 返り値互換（従来は5〜20）
  var h1At = {}; sweep.forEach(function(e) { h1At[e.a] = e; });
  var reachFloor = (_elAnaReachCur != null ? _elAnaReachCur : _EL_ANA_REACH_DEF) / 100;   // 到達率の下限（既定0.60・custom.anaReachFloor・_elAlphaInfoで同期）
  var _fspan = _elBizSpanDays(recs);   // 頻度ゲート用（2026-07-13c）: 活動営業日span。0なら頻度ゲート素通り
  var _freqOk = function(a) { if (!(_fspan > 0)) return true; var ed = _elEnteredDays(recs, function() { return a; }); return ed > 0 && (_fspan / ed) <= _EL_FREQ_MAX; };
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
  // 【2026-07-14d ユーザー要望】理想/推奨は全条件（黒字・到達率≥下限・損切り率(最終)≤上限・E成立≥10・頻度≤_EL_FREQ_MAX）を満たすαのみ。1つも無ければ status:"nomin"（条件適合無し）＝na緩和(参考値/青★)は全廃。※10件以上E成立でも他条件を満たさなければ条件適合無し。
  var _confFull = function(e) { return e.entered > 0 && e.h2Sum != null && e.h2Sum > 0 && e.eRate != null && e.eRate >= reachFloor && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && _minOk(e) && _freqOk(e.a); };
  var okCands = full.filter(_confFull);
  if (okCands.length) {
    var _knee = _elKneeFilter(okCands, function(e) { return e.h2Sum; });   // B案（膝）2026-07-15: 累計Σがほぼ最大を保てる範囲に絞る
    _knee.sort(function(x, y) { return ((x.score == null ? -Infinity : x.score) - (y.score == null ? -Infinity : y.score)) || ((x.avgH2 == null ? -Infinity : x.avgH2) - (y.avgH2 == null ? -Infinity : y.avgH2)) || (x.a - y.a); });   // 質(スコア=0.7×損切り回避+0.3×利確率)最大→平均最終損益大→高α
    return _finish(_knee[_knee.length - 1], "ok", 0);   // 膝＝理想＝推奨（フィルマージン−1は付けない）
  }
  var _anyEntry = full.some(function(e) { return e.entered > 0; });   // 全条件を満たすα無し→到達記録が全く無ければデータ無し(none)・到達はあるが条件適合無し(nomin)
  return { alpha: null, idealAlpha: null, score: null, stopRate: null, h1win: null, eRate: null, entered: 0, scN: 0, pnl: null, epPnl: null, stopN: null, ewin: null, status: _anyEntry ? "nomin" : "none", sweep: sweep, h2sweep: h2sweep, minN: _EL_BASE_MIN_N, decided: 0, takeRate: null, h2Sum: null, avgH2: null, reachFloor: reachFloor, alpha2: null, score2: null, stopRate2: null, h1win2: null, eRate2: null, scN2: null, h2Sum2: null };
}
// ===== 推奨応用α（応用〇局面）＝基本αと同じ到達率ベース＋理想−1＋「基本αより大きく」クランプ（2026-07-13 ユーザー承認）=====
// 母数=応用〇（呼び出し側で浮き足〇/RN〇除外を渡す）。各α0〜20円を前提損切り値で評価し「黒字かつ到達率≥下限かつ頻度≤_EL_FREQ_MAX」のうち最も高いα＝理想／推奨＝max(0,理想−_EL_ALPHA_OFFSET)。2026-07-13頻度も選定に組込。
// minIdeal（＝基本αの理想・任意）を渡すと「応用の理想≥基本の理想+1」にクランプ＝応用α（理想・推奨とも）が基本αより大きくなる。返り値shape＝旧互換＋idealAlpha/reachFloor。
var _EL_TOTAL_ALPHAS = (function() { var _a = []; for (var _i = 0; _i <= 20; _i++) _a.push(_i); return _a; })();
function _elSpecialAlphaPick(pool, aiOf, minIdeal) {
  if (!pool || !pool.length) return null;
  var ai = _elAnaAiOf(aiOf);
  var sweep = _EL_TOTAL_ALPHAS.map(function(a) { var e = _elH2EvalByFn(pool, ai, function() { return a; }); e.a = a; return e; });
  var byA = {}; sweep.forEach(function(e) { byA[e.a] = e; });
  var reachFloor = (_elAnaReachCur != null ? _elAnaReachCur : _EL_ANA_REACH_DEF) / 100;
  var _fspan = _elBizSpanDays(pool);   // 頻度ゲート（基本αと同一）
  var _freqOk = function(a) { if (!(_fspan > 0)) return true; var ed = _elEnteredDays(pool, function() { return a; }); return ed > 0 && (_fspan / ed) <= _EL_FREQ_MAX; };
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
  // 【2026-07-14e ユーザー要望】応用αも基本αと同じ全条件ゲート＝黒字・到達率≥下限・損切り率(最終)≤上限・E成立≥_EL_BASE_MIN_N・頻度≤_EL_FREQ_MAX を満たすαのみ。1つも無ければ status:"nomin"（条件適合無し）＝na緩和(参考値/青★)は全廃。クランプ（応用理想≥基本理想+1）は_finishで温存。
  var _minOk = function(e) { return e.decided != null && e.decided >= _EL_BASE_MIN_N; };
  var _confFull = function(e) { return e.entered > 0 && e.h2Sum != null && e.h2Sum > 0 && e.eRate != null && e.eRate >= reachFloor && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && _minOk(e) && _freqOk(e.a); };
  var okCands = sweep.filter(_confFull);
  if (okCands.length) {
    var _knee = _elKneeFilter(okCands, function(e) { return e.h2Sum; });   // B案（膝）2026-07-15: 累計Σがほぼ最大を保てる範囲に絞る
    _knee.sort(function(x, y) { return ((x.score == null ? -Infinity : x.score) - (y.score == null ? -Infinity : y.score)) || ((x.avgH2 == null ? -Infinity : x.avgH2) - (y.avgH2 == null ? -Infinity : y.avgH2)) || (x.a - y.a); });
    return _finish(_knee[_knee.length - 1], "ok", 0);   // 膝＝理想＝推奨（−1は付けない・クランプは_finishで温存）
  }
  var _anyEntry = sweep.some(function(e) { return e.entered > 0; });   // 全条件を満たすα無し→到達記録なし=none／到達はあるが条件適合無し=nomin
  return { alpha: null, idealAlpha: null, status: _anyEntry ? "nomin" : "none", minN: _EL_BASE_MIN_N, sweep: sweep, decided: 0, eRate: null, stopRate: null, takeRate: null, h2Sum: null, avgH2: null, reachFloor: reachFloor, alpha2: null, avgH2_2: null, h2Sum2: null };
}
// 推奨合計α セクション（追加α〇局面・2026-07-13c）: 母数=追加α〇（浮き足〇/RN〇除外）＝追加α詳細表と同一。結論バー＋母数内訳＋合計α別総当たり（0〜20・手じまい基準）。
// recs=スコープ（根拠フィルタ後の全記録）を渡し内部で〇を抽出＝追加α詳細表と母数一致。holiSet=頻度列用（任意）。
function _elTotalAlphaSectionV2(recs, aiOf, holiSet, onPick, curSel) {
  var _yesN = 0, _exUki = 0, _exRn = 0;
  var pool = (recs || []).filter(function(r) { var s = r && r.signal; if (!s || !_elSpecialUsed(s)) return false; _yesN++; if (_elHasNumReason(s)) { _exUki++; return false; } if (_elRnYes(s)) { _exRn++; return false; } return true; });
  if (!pool.length) return React.createElement("div", { style: { fontSize: 11, color: "#94A3B8", padding: "4px 0" } }, "応用〇を明示した記録がありません（浮き足〇・RN〇を除く）");
  var _bp = _elBaseAlphaPick(recs, aiOf);   // 基本αの理想＝応用αを基本αより大きくクランプ 2026-07-13
  var pick = _elSpecialAlphaPick(pool, aiOf, _bp ? _bp.idealAlpha : null);
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
    _nomin ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412" } }, "全条件（到達率" + reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度≤" + _EL_FREQ_MAX + "）を満たす応用αが1つも無いため推奨を出せません（下表は参考）") : null,
    _nomin ? null : React.createElement("span", { style: { fontSize: 11, color: "#555" } },
      "平均最終損益 ", React.createElement("b", { style: { color: _elPnlColor(pick.avgH2) } }, pick.avgH2 != null ? _elPnlFmt(Math.round(pick.avgH2)) : "—"),
      React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "（Σ" + (pick.h2Sum != null ? _elPnlFmt(Math.round(pick.h2Sum)) : "—") + "）"),
      "／損切り率(最終) ", React.createElement("b", null, _pctS(pick.stopRate)),
      "／利確率 ", React.createElement("b", null, _pctS(pick.takeRate)),
      "／E成立 ", React.createElement("b", null, (pick.decided || 0) + "件"),
      "／到達率 ", React.createElement("b", null, _pctS(pick.eRate))));
  var _span = _elBizSpanDays(pool, holiSet);
  var rows = pick.sweep.filter(function(e) { return e.entered > 0 || e.a === a || e.a === ideal; }).map(function(e) {
    var on = e.a === a, _isIdeal = (e.a === ideal && ideal !== a);
    var pass = e.eRate != null && e.eRate >= reachFloor && e.h2Sum != null && e.h2Sum > 0;
    var _isCur = !!(onPick && curSel != null && e.a === curSel);
    var _cells = [
      _elv2Td(React.createElement("span", { style: { fontWeight: (on || _isIdeal) ? 800 : 600, color: "#9A3412" } }, e.a + "円", on ? _elStarNode(pick.status) : null, _isIdeal ? React.createElement("span", { style: { fontSize: 8.5, fontWeight: 700, color: "#B98A5E", marginLeft: 3 } }, "理想") : null), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(_elFreqCell(_span, _elEnteredDays(pool, (function(_a) { return function() { return _a; }; })(e.a)))),
      _elv2Td(e.decided + "件"),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _elv2Td(e.avgH2 == null ? "—" : React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("b", { style: { color: _elPnlColor(e.avgH2) } }, _elPnlFmt(Math.round(e.avgH2))), React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8" } }, "Σ" + _elPnlFmt(Math.round(e.h2Sum)))))
    ];
    if (onPick) _cells.push(_elv2Td(React.createElement("span", { style: { color: "#B45309", fontWeight: 800, fontSize: 10, whiteSpace: "nowrap" } }, _isCur ? "採用中" : "選択")));
    return React.createElement.apply(null, ["tr", { key: e.a, onClick: onPick ? function() { onPick(e.a); } : null, style: { background: on ? "#FFF7ED" : (_isCur ? "#FEF3C7" : "transparent"), opacity: pass ? 1 : 0.4, cursor: onPick ? "pointer" : "default" } }].concat(_cells));
  });
  var insight = _nomin ? null : _elInsightBoxV2([
    React.createElement("span", null, "応用〇で採用する独立α値の", _elInsightEmV2("推奨は応用α " + a + "円"), "（累計をほぼ落とさず質が最良の膝・平均最終損益 ", _elInsightEmV2(pick.avgH2 != null ? _elPnlFmt(Math.round(pick.avgH2)) : "—"), "・損切り率(最終) ", _elInsightEmV2(_pctS(pick.stopRate)), "・E成立 ", _elInsightEmV2((pick.decided || 0) + "件"), "）。"),
    React.createElement("span", { style: { color: "#64748B" } }, "応用αは基本αより大きくクランプ。通常局面の推奨基本αは①基本αゾーン。")
  ], { note: "母数＝応用〇（浮き足〇・RN〇除外）。各応用α0〜20円を前提損切り値" + _elAnaCutCur + "円で評価。★＝黒字・到達率" + reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・頻度" + _EL_FREQ_MAX + "以内を満たすαのうち、累計損益Σがほぼ最大（" + Math.round(_EL_KNEE_FRAC * 100) + "%以上）を保てる範囲で質が最良の膝（基本αより大きくクランプ）。フォーム/EPナビの推奨応用αと同じ算出（銘柄全体母数）。" });
  return React.createElement("div", null,
    concl,
    React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", margin: "8px 0 0" } }, "母数の内訳: 応用〇 " + _yesN + "件 → 浮き足〇 " + _exUki + "件・RN〇 " + _exRn + "件を除外 → " + pool.length + "件"),
    _lbl("応用α別の総当たり（0〜20円・淡色＝全条件未達／★＝全条件（到達率" + reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度≤" + _EL_FREQ_MAX + "・黒字）を満たすαのうち累計損益Σがほぼ最大（" + Math.round(_EL_KNEE_FRAC * 100) + "%以上）を保てる範囲で質が最良の膝（基本α+1以上）／全条件を満たすαが無ければ条件適合無し／前提損切り値" + _elAnaCutCur + "円で評価／頻度＝数字が小さいほど高頻度）"),
    _elv2Table(["応用α", "到達率", "頻度", "E成立", "損切り率(最終)", "利確率(最終)", "最終損益(平均/Σ)"].concat(onPick ? ["選択"] : []), rows),
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
// X=0円＝足さない（その日の推奨基本αのまま）＝基準行。選定＝基本αと同一条件式（到達率≥50%・損切り率(手じまい)≤20%・E成立≥20件→10件緩和・黒字）の中で平均最終損益（1件あたり）最大（同点はE成立多→小さいX）。
// 該当なしは損切り率≤30%へ緩和(status na=参考)。★がX=0なら「追加αは足さない方が良い」＝improved:false＋zeroBest:true（KPI/ゾーンヘッドが専用文言・フォーム/EPナビは従来どおり推奨無し扱い）。
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
  var _fspan = _elBizSpanDays(pool);   // 頻度ゲート（2026-07-13c・基本αと同一・実効α=recoFn(日)+X の到達実日数で判定）
  var _freqOkX = function(X) { if (!(_fspan > 0)) return true; var ed = _elEnteredDays(pool, alphaOfAt(X)); return ed > 0 && (_fspan / ed) <= _EL_FREQ_MAX; };
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
  var _near = _elKneeFilter(sel.cand, function(row) { return row.h2.h2Sum; });   // B案（膝）2026-07-15: 累計Σがほぼ最大を保てる加算Xに絞る（旧＝平均最終損益最大）
  var byBest = function(x, y) { return ((x.h2.score != null ? x.h2.score : -Infinity) - (y.h2.score != null ? y.h2.score : -Infinity)) || ((x.h2.avgH2 != null ? x.h2.avgH2 : -Infinity) - (y.h2.avgH2 != null ? y.h2.avgH2 : -Infinity)) || (x.X - y.X); };   // 質(スコア)最大→平均最終損益大→高X
  var cand2 = _near.slice().sort(byBest);
  var picked = cand2[cand2.length - 1];
  var larger = _near.filter(function(row) { return row.X > picked.X; }).sort(byBest);
  var p2 = larger.length ? larger[larger.length - 1] : null;
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
  return _elCollectAllSignals(data).filter(function(r) { return r && r.stock === stock && _epIsV2(r.signal) && _elInclTotal(r.signal) && (!before || r.date < before); });
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
function _elBaseAlphaA(recs, aiOf) {
  var pick = _elBaseAlphaPick(recs, aiOf);   // 内部で応用〇記録を除外＝基本αの母数は「応用なし（通常）」
  if (!pick || pick.alpha == null) return null;
  // 推奨応用α（2026-07-13 応用α化）: 応用〇の記録だけを母数に、独立α値の最適(_elSpecialAlphaPick＝0〜20円1本)を算出。浮き足〇/RN〇は評価一貫性のため母数から除外。
  // 返り値 .add は応用shape {alpha,alpha2,status,minN,sweep,decided,eRate,stopRate,takeRate,h2Sum,avgH2,...}（旧増分shape{add,total,improved}は廃止）。使えない時はnull。
  var add = null;
  var spPool = (recs || []).filter(_elIsSpecialAlphaPoolRec);
  if (spPool.length) { var _sp = _elSpecialAlphaPick(spPool, aiOf, pick.idealAlpha); if (_sp && _sp.alpha != null && _sp.status !== "none") add = _sp; }   // minIdeal=基本αの理想＝応用αを基本αより大きくクランプ 2026-07-13
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
  ].filter(Boolean), { note: "各期間で「黒字・到達率が下限(既定" + _EL_ANA_REACH_DEF + "%)以上・頻度" + _EL_FREQ_MAX + "以内を満たすαのうち累計Σがほぼ最大を保てる範囲で質が最良のα（膝）」（2026-07-15 膝ベース・手じまいベース・前提損切り値" + _elAnaCutCur + "円で評価）。件数が少ない期間も参考(橙「参考」)で表示。0〜20円。件数が少ない期間は振れやすい" }) : null;
  return React.createElement("div", null, chart, _elv2Table(["期間", "推奨基本α", "損切り率(最終)", "利確率", "最終損益(平均/Σ)", "E成立"], rows), insight);
}
// 推奨基本αの「期間まとめ」: 1つの推奨値＋追加α＋α別の 損切り率(H1)/H1勝率/スコア 早見表（★=推奨）＋読み取り。2026-06-22再設計。
function _elBaseAlphaSummary(recs, aiOf) {
  var _A = _elBaseAlphaA(recs, aiOf);
  var pick = _A ? _A.pick : _elBaseAlphaPick(recs, aiOf);
  if (!pick || pick.status === "none" || pick.alpha == null) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var na = pick.status === "na";
  var minN = pick.minN || _EL_BASE_MIN_N;
  var noteSub = "★（2026-07-13新基準）＝到達率" + Math.round(_EL_BASE_MIN_ERATE * 100) + "%以上・損切り率(最終)" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%以下・頻度≤" + _EL_FREQ_MAX + "営業日/回・E成立" + _EL_BASE_N_PREF + "件以上（無ければ" + _EL_BASE_MIN_N + "件に自動緩和）・黒字のαの中で平均最終損益（手じまい・1件あたり）が最大のα。同点はE成立多→低α。該当なしは損切り率30%→頻度ゲート解除の順に緩和して参考（青★）。★赤＝条件充足／★青＝参考。5〜20円1円刻み";
  var _h2s = pick.h2sweep || [];
  var sweepRows = _h2s.filter(function(e) { return e.entered > 0; }).map(function(e) {
    var on = e.a === pick.alpha;
    var pass = e.decided >= minN && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && e.h2Sum != null && e.h2Sum > 0;
    return React.createElement("tr", { key: e.a, style: { background: on ? "#FEF3C7" : "transparent", opacity: pass ? 1 : 0.45 } },
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
  var banner = na ? React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6, padding: "5px 8px", marginBottom: 6 } }, "⚠ 到達率下限以上を保てるαが無い、または自信条件（損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度≤" + _EL_FREQ_MAX + "）を満たさず → 参考のα " + pick.alpha + "円 を青★で表示（信頼度低）") : null;
  return React.createElement("div", null, banner, cards,
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "8px 0 2px" } }, "α別の 到達率・損切り率(最終)・利確率・E成立・最終損益(平均/Σ)（★＝到達率下限以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・頻度" + _EL_FREQ_MAX + "以内を満たすαのうち累計損益Σがほぼ最大（" + Math.round(_EL_KNEE_FRAC * 100) + "%以上）を保てる範囲で質が最良の膝・淡色は下限未満/赤字・前提損切り値" + _elAnaCutCur + "円）"),
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
function _elBaseAlphaDetailV2(recs, aiOf, holiSet, onPick, curSel) {
  var _A = _elBaseAlphaA(recs, aiOf);
  var pick = _A ? _A.pick : _elBaseAlphaPick(recs, aiOf);
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
      ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#B45309" } }, "参考値（青★）：自信条件（損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度≤" + _EL_FREQ_MAX + "営業日/回）を満たさない、または到達率" + Math.round((pick.reachFloor != null ? pick.reachFloor : (_EL_ANA_REACH_DEF / 100)) * 100) + "%以上のαが無く緩和（E成立 " + (pick.decided != null ? pick.decided : 0) + "件）")
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
  var _baseSpan = _elBizSpanDays(_baseRecs, holiSet);   // 頻度列（何営業日に1回）用: 母数の活動期間の営業日数（全行共通・分母は固定でαごとに到達実日数だけ変わる）2026-07-07
  var aiOfAna = _elAnaAiOf(aiOf);   // 表示スイープも★（pick内部でwrap済み）と同じ前提損切り値で評価 2026-07-13b
  var _lowSweep = [0, 1, 2, 3, 4].map(function(la) { return _elBaseAlphaEval(_baseRecs, aiOfAna, la); });
  var _dispSweep = _lowSweep.concat(pick.sweep);   // [0..4]（表示のみ）＋[5..20]（H1参考列）＝昇順
  var _reachFloor = pick.reachFloor != null ? pick.reachFloor : (_EL_ANA_REACH_DEF / 100);   // 淡色判定の到達率下限（★選定と同一・2026-07-13）
  var _reachP = Math.round(_reachFloor * 100);
  var _h2ByA = {};   // 最終損益デュアル列（利確率(最終)/最終損益・承認① 2026-07-12）: 表示各αの最終基準評価を母数一致(_baseRecs)で並走
  _dispSweep.forEach(function(e) { _h2ByA[e.a] = _elH2EvalByFn(_baseRecs, aiOfAna, function() { return e.a; }); });
  var sweepRows = _dispSweep.filter(function(e) { return e.entered > 0; }).map(function(e) {
    var _h2r = _h2ByA[e.a];
    var on = e.a === a, _isIdeal = (e.a === ideal && ideal !== a), pass = !!(_h2r && _h2r.eRate != null && _h2r.eRate >= _reachFloor && _h2r.h2Sum != null && _h2r.h2Sum > 0);   // 淡色でない＝到達率下限以上かつ黒字（★＝推奨α・理想αは「理想」タグ）2026-07-13
    var _isCur = !!(onPick && curSel != null && e.a === curSel);   // EPナビ「表を参照」ポップアップで現在の採用α値を青ハイライト 2026-07-13d
    var _cells = [
      _elv2Td(React.createElement("span", { style: { fontWeight: (on || _isIdeal) ? 800 : 600, color: on ? "#B45309" : "#0369A1" } }, e.a + "円", on ? _elStarNode(pick.status) : null, _isIdeal ? React.createElement("span", { style: { fontSize: 8.5, fontWeight: 700, color: "#64748B", marginLeft: 3 } }, "理想") : null), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(_elFreqCell(_baseSpan, _elEnteredDays(_baseRecs, function() { return e.a; }))),
      _elv2Td((_h2r ? _h2r.decided : 0) + "件"),
      _elv2Td((!_h2r || _h2r.stopRate == null) ? "—" : _elStopRateCell(_h2r.stopRate)),
      _elv2Td(e.h1win == null ? "—" : _elPctCell(e.h1win)),
      _elv2Td((function() { var _av = (e.pnl != null && e.scN > 0) ? Math.round(e.pnl / e.scN) : null; return _av == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(_av), fontWeight: 700 } }, _elPnlFmt(_av)); })()),
      _elv2Td((function() { var _h2 = _h2ByA[e.a]; return (_h2 && _h2.takeRate != null) ? _elPctCell(_h2.takeRate) : "—"; })()),
      _elv2Td((function() { var _h2 = _h2ByA[e.a]; if (!_h2 || _h2.avgH2 == null) return "—"; return React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("b", { style: { color: _elPnlColor(_h2.avgH2) } }, _elPnlFmt(Math.round(_h2.avgH2))), React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8" } }, "Σ" + _elPnlFmt(Math.round(_h2.h2Sum)))); })()),
      _elv2Td(_elScoreCell(e.score))
    ];
    if (onPick) _cells.push(_elv2Td(React.createElement("span", { style: { color: "#1D4ED8", fontWeight: 800, fontSize: 10, whiteSpace: "nowrap" } }, _isCur ? "採用中" : "選択")));
    return React.createElement.apply(null, ["tr", { key: e.a, onClick: onPick ? function() { onPick(e.a); } : null, style: { background: on ? "#FEF3C7" : (_isCur ? "#EFF6FF" : "transparent"), opacity: pass ? 1 : 0.4, cursor: onPick ? "pointer" : "default" } }].concat(_cells));
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
    React.createElement("span", null, "★＝", _elInsightEmV2("全条件（到達率" + _reachP + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度≤" + _EL_FREQ_MAX + "・黒字）を満たすαのうち、累計損益Σがほぼ最大（" + Math.round(_EL_KNEE_FRAC * 100) + "%以上）を保てる範囲で質が最良のα（膝）"), "（到達率下限は🎯で調整可）。", "平均が高くてもエントリー数が少なく累計が痩せる高α側は選ばない。全条件を満たすαが1つも無ければ『条件適合無し』。スコア列は旧基準の参考。")
  ], { note: "この銘柄のv2・算入記録（素の記録のみ）に各αを当ててシミュレーション（前提損切り値" + _elAnaCutCur + "円＝各記録の実損切り値ではなくこの前提で評価）。E成立・損切り率(最終)・利確率・最終損益(平均/Σ)＝最終損益(手じまい・EP/H1/H2損切り込み)基準・★＝全条件を満たすαのうち累計損益Σがほぼ最大（" + Math.round(_EL_KNEE_FRAC * 100) + "%以上）を保てる範囲で質が最良のα（膝）。H1勝率・平均H1損益・スコア＝旧H1基準の参考列。" });
  }
  return React.createElement("div", null,
    concl,
    _elv2Table(["基本α", "到達率", "頻度", "E成立", "損切り率(最終)", "H1勝率", "平均H1損益", "利確率(最終)", "最終損益(平均/Σ)", "スコア"].concat(onPick ? ["選択"] : []), sweepRows),
    insight);
}
// 推奨追加α 詳細データ（この銘柄/グループ）2026-07-03: 推奨基本α詳細データ(_elBaseAlphaDetailV2)の追加α版＝結論バー＋加算値別の総当たり（基本α＋加算ごとの到達率/件数/損切り率/H1勝率/想定損益・★＝推奨）＋読み取り。母数＝追加α〇（数値根拠＝底抜け前足浮きは除外・_elAddAlphaRecoと同一）。集計タブ銘柄別パネルで追加α母数トグル〇のとき、畳んだ基本α詳細の下に表示。想定損益＝ΣH1損益（_elBaseAlphaEval.pnl＝_elSimPnlByDay.sumと同値）。
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
    na ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#B45309" } }, "参考値（青★・損切り率20%以下かつ頻度≤" + _EL_FREQ_MAX + "営業日/回の加算が無く条件を緩和）") : null,
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
    var e = row.h2, h1 = row.h1;
    var on = _hasPick && row.X === add.add;
    var pass = e.decided >= minN && e.eRate != null && e.eRate >= _EL_BASE_MIN_ERATE && e.stopRate != null && e.stopRate <= _EL_BASE_MAX_STOPRATE && e.h2Sum != null && e.h2Sum > 0;
    return React.createElement("tr", { key: row.X, style: { background: on ? "#FFF7ED" : "transparent", opacity: pass ? 1 : 0.4 } },
      _elv2Td(React.createElement("span", { style: { fontWeight: on ? 800 : 600, color: row.X === 0 ? "#64748B" : "#9A3412", whiteSpace: "nowrap" } }, "+" + row.X + "円" + (row.X === 0 ? "（足さない）" : ""), on ? _elStarNode(add.status) : null), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(_elFreqCell(_dsSpan, _elEnteredDays(addPool, function(r) { var b = recoFn(r.date); return b == null ? null : b + row.X; }))),
      _elv2Td(e.decided + "件"),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(h1.h1win == null ? "—" : _elPctCell(h1.h1win)),
      _elv2Td((function() { var _av = (h1.pnl != null && h1.scN > 0) ? Math.round(h1.pnl / h1.scN) : null; return _av == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(_av), fontWeight: 700 } }, _elPnlFmt(_av)); })()),
      _elv2Td(e.takeRate == null ? "—" : _elPctCell(e.takeRate)),
      _elv2Td(e.avgH2 == null ? "—" : React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("b", { style: { color: _elPnlColor(e.avgH2) } }, _elPnlFmt(Math.round(e.avgH2))), React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8" } }, "Σ" + _elPnlFmt(Math.round(e.h2Sum))))));
  });
  var _zeroRow = (add && add.sweepDate && add.sweepDate[0]) ? add.sweepDate[0].h2 : null;
  var insight = _elInsightBoxV2([
    _hasPick
      ? React.createElement("span", null, "各記録日の推奨基本αに", _elInsightEmV2("+" + add.add + "円" + (_zero ? "（＝足さない）" : "")), "が最良（平均最終損益 ", _elInsightEmV2(add.avgH2 != null ? _elPnlFmt(Math.round(add.avgH2)) : "—"), "・損切り率(最終) ", _elInsightEmV2(_pctS(add.stopRate)), "・E成立 ", _elInsightEmV2((add.decided || 0) + "件"), "）。")
      : React.createElement("span", null, "条件（到達率50%・損切り率(最終)30%以下まで緩和・E成立" + _EL_BASE_MIN_N + "件・黒字）を満たす加算が無く", _elInsightEmV2("推奨無し"), "。"),
    (_hasPick && !_zero && _zeroRow && _zeroRow.avgH2 != null && add.avgH2 != null)
      ? React.createElement("span", null, "足さなかった場合（+0円）の平均最終損益は", _elInsightEmV2(_elPnlFmt(Math.round(_zeroRow.avgH2))), "＝上乗せの効果は1件あたり", _elInsightEmV2(_elPnlFmt(Math.round(add.avgH2 - _zeroRow.avgH2)), (add.avgH2 - _zeroRow.avgH2) >= 0 ? "#C0392B" : "#1E8449"), "。")
      : null
  ], { note: "母数＝追加α〇（浮き足〇・RN〇除外）。主表＝各記録に「その記録日時点の推奨基本α（前日までの直近50→100件→全期間・現在の★基準で再計算）＋加算X円」を当て、手じまい（最終損益・EP/H1/H2損切り込み）で評価する反実仮想。★＝到達率50%以上・損切り率(最終)20%以下・E成立" + _EL_BASE_N_PREF + "件（無ければ" + _EL_BASE_MIN_N + "件に緩和）・黒字の中で平均最終損益（1件あたり）最大＝基本αと同じ条件式。H1勝率・平均H1損益＝参考列。参考表＝旧方式（現在の推奨基本α" + base + "円を土台に一様加算・H1基準）。" });
  return React.createElement("div", null,
    concl,
    _uzuLine,
    _lbl("日付別カウンターファクタル（主表）: 各記録日の推奨基本α＋加算X円で入っていたら手仕舞いでどうだったか（0円＝足さない・★赤＝条件を満たす推奨／★青＝条件緩和の参考推奨・淡色＝条件[到達50%・損切り(最終)20%以下・頻度≤" + _EL_FREQ_MAX + "営業日/回・E成立・黒字]を満たさない加算／前提損切り値" + _elAnaCutCur + "円で評価／頻度＝数字が小さいほど高頻度）"),
    _dateRows.length ? _elv2Table(["追加α", "到達率", "頻度", "E成立", "損切り率(最終)", "H1勝率", "平均H1損益", "利確率(最終)", "最終損益(平均/Σ)"], _dateRows) : React.createElement("div", { style: { fontSize: 10.5, color: "#bbb", padding: "4px 0" } }, "推奨基本αが算出できる記録がありません（履歴不足）"),
    _lbl("（参考）現在の推奨基本α" + base + "円＋加算の固定スイープ（＋1〜" + _EL_BASE_ADD_MAX + "円・H1基準・旧方式＝記録日に依らず今の推奨基本αを土台に一様加算・★なし）"),
    _elv2Table(["追加α", "合計α", "到達率", "有効件数", "損切り率", "H1勝率", "想定損益"], addRows),
    insight);
}
// 推奨基本α表（銘柄/期間グループ別）: groups=[{label,recs}]・cutFn(r)→損切り値。各グループの推奨基本α(_elBaseAlphaPick・5〜20・
// 件数フロア＋合成スコア最大・該当なしは件数最大)を1値表示＋損切り率/H1勝率の小書き＋追加α目安。旧 _elIdealAlphaTableV2(EP/H1/H2別・0〜50)を置換 2026-06-21→条件再設計 2026-06-22。
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
  var _okR = function(r) { return r && r.date && _epIsV2(r.signal) && _elInclTotal(r.signal); };
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
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "この銘柄の記録を期間別（本日/直近25件/50件/100件/全期間）に集計。本日＝" + refDate + "当日の記録、それ以外は前日まで（当日を含めない）。各期間で「到達率50%以上・損切り率(手じまい)20%以下・E成立20件（無ければ10件に緩和）・黒字」を満たすαの中で平均最終損益（手じまい・1件あたり）が最大のα（2026-07-13新基準・該当なしは損切り30%へ緩和して参考）。基本αは応用α〇・浮き足〇・RN〇以外（応用なし）が母数。想定損益＝推奨基本αをこの母数に当てたH1損益の『1営業日あたり平均／期間累計（営業日数）』＝記録の無い日・ノーシグナル日（エントリー成立なし）は除外。「推奨損切り」＝実現H1損益をほぼ維持できる範囲で最小（タイト）の損切り値（10〜30円・応用α〇も含む全記録が母数。基本αとは別軸の損切り最適化）。「応用α」＝応用α〇の記録だけを母数に、応用局面で採用する独立α値（0〜20円）を手じまい基準で評価した推奨（★＝到達50%・損切り率(最終)20%以下・E成立条件で平均最終損益最大）。次点（2番目の候補）は基本α・応用αとも各行にインライン「（次点：X円）」で併記＝専用行は無し。"),
    React.createElement(_ElRecoAlphaDetail, { recs: recs, aiOf: aiOf, holiSet: _buildHolidayDateSet((data || {}).trades, ((data || {}).custom || {}).eventCategories) }));   // 2026-07-13 期間別表→取引/記録帳と同じ基本↔応用トグル付き総当たり詳細表(常時展開)。期間別は_ElRecoAlphaDetail内の「直近参考」サブ行で残す。
}
// DayView「チャート」タブで早見表の下に出す推奨αブロック（2026-06-24）。各銘柄テーブル(ChartSection)の_elBaseAlphaPeriodBlockV2と同等に充実＝説明文＋本日行付き期間表(_elBaseAlphaPeriodTableV2＝基本αに追加αの└サブ行も内包)。さらに「今日の推奨◯円」の大見出し(headNode)を併載＝いいとこ取り 2026-06-24c（2026-07-01 追加α独立テーブル(_elAddAlphaPeriodTableV2)を廃し基本α表へ統合・最上位見出しを🎯推奨α値に改称）。
// 見出し＝直近50件（データ不足なら100件→全期間にフォールバック）の推奨基本α＋追加α。本日のみ記録の銘柄でも本日行を出すためガードは「前日まで or 本日」のどちらかにデータがあれば表示。
// recs=銘柄の全記録(_elCollectAllSignals→stock絞り)・aiOf(r)→{alpha,cutLine}・refDate=基準日(当日除外=r.date<refDate)。履歴ゼロはnull。
function _elBaseAlphaDayBlockV2(recs, aiOf, refDate) {
  var all = (recs || []).filter(function(r) { return r && r.date && r.date < refDate && _epIsV2(r.signal) && _elInclTotal(r.signal); });
  var _todayN = (recs || []).filter(function(r) { return r && r.date === refDate && _epIsV2(r.signal) && _elInclTotal(r.signal); }).length;
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
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginTop: 8, marginBottom: 6 } }, "この銘柄の記録を期間別（本日/直近25件/50件/100件/全期間）に集計。本日＝" + refDate + "当日の記録、それ以外は前日まで（当日を含めない）。各期間で「到達率50%以上・損切り率(手じまい)20%以下・E成立20件（無ければ10件に緩和）・黒字」を満たすαの中で平均最終損益（手じまい・1件あたり）が最大のα（2026-07-13新基準・該当なしは損切り30%へ緩和して参考）。基本αは応用α〇・浮き足〇・RN〇以外（応用なし）が母数。想定損益＝推奨基本αをこの母数に当てたH1損益の『1営業日あたり平均／期間累計（営業日数）』＝記録の無い日・ノーシグナル日（エントリー成立なし）は除外。「推奨損切り」＝実現H1損益をほぼ維持できる範囲で最小（タイト）の損切り値（10〜30円・応用α〇も含む全記録が母数。基本αとは別軸の損切り最適化）。「応用α」＝応用α〇の記録だけを母数に、応用局面で採用する独立α値（0〜20円）を手じまい基準で評価した推奨（★＝到達50%・損切り率(最終)20%以下・E成立条件で平均最終損益最大）。次点（2番目の候補）は基本α・応用αとも各行にインライン「（次点：X円）」で併記＝専用行は無し。"),
    _elBaseAlphaPeriodTableV2(recs, aiOf, refDate, true));
}

// 前日まで(refDate未満)にv2かつ算入のエントリー記録がある銘柄の一覧。orderHint(主要銘柄の優先順)→件数多い順→名前順でソート 2026-06-25。
// 簡略版「本日の推奨基本α値」ボードで、本日エントリーが無い時のフォールバック銘柄（＝よく取引する＝前日までに記録のある銘柄）を出すために使う。
function _elStocksWithV2Before(data, refDate, orderHint) {
  var seen = {};
  _elCollectAllSignals(data).forEach(function(r) {
    if (r && r.stock && r.date && r.date < refDate && _epIsV2(r.signal) && _elInclTotal(r.signal)) seen[r.stock] = (seen[r.stock] || 0) + 1;
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
  var _byDate = (recs || []).filter(function(r) { return r && r.date && _epIsV2(r.signal) && _elInclTotal(r.signal); }).sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
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
  var totalV2 = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclTotal(r.signal); });
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
  var totalV2 = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclTotal(r.signal); });
  var _num = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
  // 基本α/追加α（残差）の導出は浮き足加算(_elUkiAdd)込みの合計αから引き算＝浮き足記録でbaseAlphaVal欠損でも正しい基本αになる 2026-07-03。
  var _baseOf = function(s) { return _elBaseLevelAlpha(s); };   // base-levelα（応用α化 2026-07-13・逆算撤去）
  var _addOf = function(s) { return 0; };   // 追加α増分は廃止（応用α化 2026-07-13）＝残差0
  var _enteredAt = function(s, a) { var rr = _epResolve(s, a); return !!(rr && rr.judge === "ok"); };
  var _h1At = function(s, a, cut) { if (a == null || !_enteredAt(s, a)) return 0; var h = _elDynHold(s, a, cut); return h == null ? 0 : h; };
  var _addFmt = function(v, suf) { return v == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#9A3412" : "#94A3B8" } }, "+" + v + "円" + (suf || "")); };
  var floatRecs = totalV2.filter(function(r) { return _elUkiYes(r.signal); });   // 母数＝浮き足〇の記録（旧: 追加α〇＋数値根拠）2026-07-03
  if (!floatRecs.length) return null;
  // 浮き足加算率スイープ 2026-07-12: 採用α（基本＋追加＋RN）は実績のまま浮き足加算だけをP=0〜100%(10刻み)で振り、最終損益(H2)で評価。全銘柄版(シグナル総合)と同じ_elUkiPctSweepに統一（旧「基本α＋浮き足%・ΣH1最大」から刷新）。母数=浮き値>0の浮き足〇記録。
  var _ukiPool = floatRecs.filter(function(r) { var f = _elUkiVal(r.signal); return f != null && f > 0; });
  var _sweep = _ukiPool.length ? _elUkiPctSweep(_ukiPool, aiOf) : null;
  var simNode = _sweep ? React.createElement("div", { style: { marginTop: 8 } },
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "0 0 2px" } }, "📐 浮き足の何%を加算すると最適か（浮き足〇＝α＝浮き足加算＋RN・浮き足%だけ振り・最終損益で評価・★＝スコア最大＝現行の推奨%）"),
    _elUkiPctSweepNode(_sweep)) : null;
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
    React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", margin: "0 0 4px", lineHeight: 1.5 } }, "浮き足〇の記録を1件ずつ、現実（採用した浮き足加算α）と推奨（推奨%どおりの浮き足加算）で上下2段に対比。浮き足〇はα＝浮き足加算（＋RN）のみ＝基本α/応用αは無し。OS＝OS1〜3の到達最高値（×で打ち切り）。乖離度＝到達最高OSと各段の浮き足加算αの差（＋到達／−未達）。推奨の加算＝浮き値×推奨%（下の📐%シミュ）。日付の「記録」でその日の記録を開閉。"),
    _floatTable,
    simNode);
}
// 浮き足加算率スイープ 2026-07-12: 採用α（基本＋追加＋RN）は実績のまま、浮き足加算だけをP=0〜100%(10刻み)で振り、最終損益で評価。alphaOf(r)=（採用α−現行浮き足加算floor(v/2)）＋floor(浮き値×P/100)＝P=50%で現行(半額)に一致＝実績と同値。母数poolは呼び出し側で浮き足〇&浮き値>0に絞る。best=件数(E成立)≥_EL_BASE_MIN_N&想定損益>0でスコア最大。シグナル総合タブ(全銘柄)＋シグナル別「浮き足」サブタブ(_elFloatReasonSectionV2)で共用。
function _elUkiPctSweep(pool, aiOf) {
  var _mk = function(P) {
    return function(r) {
      var s = r.signal, uv = _elUkiVal(s);
      if (uv == null || uv <= 0) return null;
      var a = (s.alphaVal != null && s.alphaVal !== "" && !isNaN(Number(s.alphaVal))) ? Number(s.alphaVal) : null;
      if (a == null) return null;
      return (a - _elUkiAdd(s)) + Math.floor(uv * P / 100);
    };
  };
  var rows = [];
  for (var P = 0; P <= 100; P += 10) rows.push({ P: P, ev: _elH2EvalByFn(pool, aiOf, _mk(P)) });
  var _qual = function(x) { return x.ev.decided >= _EL_BASE_MIN_N && x.ev.h2Sum != null && x.ev.h2Sum > 0 && x.ev.score != null; };
  var _pickFrom = _elKneeFilter(rows.filter(_qual), function(x) { return x.ev.h2Sum; });   // B案（膝）2026-07-15: 累計Σがほぼ最大を保てる%に絞ってから質(score)最大
  var best = null;
  _pickFrom.forEach(function(x) { if (!best || x.ev.score > best.ev.score) best = x; });
  var runnerUp = null;   // 次点＝best以外で膝内のスコア最大 2026-07-12→2026-07-15膝内
  _pickFrom.forEach(function(x) { if (best && x.P === best.P) return; if (!runnerUp || x.ev.score > runnerUp.ev.score) runnerUp = x; });
  return { rows: rows, best: best, runnerUp: runnerUp };
}
// フォーム/EPナビ向け: 全銘柄の浮き足〇記録(refDate未満=記録日前日まで)から推奨浮き足加算率(reco=best.P)と次点(runnerUp.P)を算出 2026-07-12。データ不足はnull（呼び出し側で50%フォールバック）。母数はシグナル総合の浮き足%分析と同一。
function _elUkiRecoPcts(data, refDate) {
  var all = _elCollectAllSignals(data) || [];
  var pool = all.filter(function(r) {
    if (!r || !r.signal) return false;
    if (refDate && r.date && r.date >= refDate) return false;   // 記録日前日まで（当日除外＝look-ahead回避）
    return _epIsV2(r.signal) && _elInclTotal(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0;
  });
  if (!pool.length) return { reco: null, runnerUp: null, n: 0 };
  var sweep = _elUkiPctSweep(pool, function(r) { return _elAlphaInfo(r, data); });
  return { reco: sweep.best ? sweep.best.P : null, runnerUp: sweep.runnerUp ? sweep.runnerUp.P : null, n: pool.length };
}
// 浮き足加算率スイープの推奨バー＋表を描画 2026-07-12。列＝浮き足%/到達率/件数(E成立)/損切り率/利確率/平均最終/スコア/想定損益(計)。★推奨＝最良（フォーム自動入力に使う値）・次点も表示・件数_EL_BASE_MIN_N未満は薄字「参考」。
function _elUkiPctSweepNode(sweep) {
  var rows = sweep.rows, best = sweep.best, runnerUp = sweep.runnerUp;
  var _dash = React.createElement("span", { style: { color: "#bbb" } }, "—");
  var _reco = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: best ? "#0369A1" : "#94A3B8" } },
    best
      ? React.createElement("span", null, "推奨 浮き足加算率 ", React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, best.P + "%"),
          "（損切り" + Math.round((best.ev.stopRate || 0) * 100) + "%・利確" + Math.round((best.ev.takeRate || 0) * 100) + "%・想定損益計" + _elPnlFmt(Math.round(best.ev.h2Sum)) + "・" + best.ev.decided + "件）",
          runnerUp ? React.createElement("span", { style: { color: "#64748B", fontWeight: 600 } }, "　｜　次点 " + runnerUp.P + "%（スコア" + Math.round(runnerUp.ev.score * 100) + "）") : null)
      : "推奨：件数" + _EL_BASE_MIN_N + "以上で想定損益プラスの加算率は出ていません（データ不足／50%で十分の傾向）");
  var _trs = rows.map(function(x) {
    var e = x.ev, isBest = !!(best && x.P === best.P), isRunner = !!(runnerUp && x.P === runnerUp.P), low = e.decided < _EL_BASE_MIN_N;
    var bg = isBest ? "#FEF3C7" : (isRunner ? "#EFF6FF" : null);
    var lblColor = isBest ? "#B45309" : (isRunner ? "#0369A1" : "#9A3412");
    var label = React.createElement("span", { style: { fontWeight: 700, color: lblColor } }, x.P + "%" + (isBest ? " ★推奨" : "") + (isRunner ? " 次点" : "") + (low ? " 参考" : ""));
    return React.createElement("tr", { key: x.P, style: Object.assign({}, bg ? { background: bg } : {}, low ? { opacity: 0.5 } : {}) },
      _elv2Td(label, { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(e.eRate != null ? _elPctCell(e.eRate) : _dash),
      _elv2Td(e.decided + "件"),
      _elv2Td(e.stopRate != null ? _elStopRateCell(e.stopRate) : _dash),
      _elv2Td(e.takeRate != null ? _elPctCell(e.takeRate) : _dash),
      _elv2Td(e.avgH2 == null ? _dash : React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(Math.round(e.avgH2)) } }, _elPnlFmt(Math.round(e.avgH2)))),
      _elv2Td(e.score != null ? _elScoreCell(e.score) : _dash),
      _elv2Td(e.h2Sum == null ? _dash : React.createElement("span", { style: { fontWeight: 800, color: _elPnlColor(Math.round(e.h2Sum)) } }, _elPnlFmt(Math.round(e.h2Sum)))));
  });
  return React.createElement("div", { style: { marginTop: 4 } },
    _reco,
    _elv2Table(["浮き足%", "到達率", "件数", "損切り率", "利確率", "平均最終", "スコア", "想定損益(計)"], _trs));
}
// 全銘柄共通の浮き足加算率最適化ボード（シグナル総合タブ）2026-07-12。母数=全銘柄の浮き足〇・浮き値>0のv2記録。
function _elUkiPctBoardV2(recs, aiOf) {
  var pool = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclTotal(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0; });
  if (!pool.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "浮き足〇（浮き値あり）の記録がまだありません");
  var sweep = _elUkiPctSweep(pool, aiOf);
  return React.createElement(React.Fragment, null,
    React.createElement("div", { style: { fontSize: 11, color: "#64748B", lineHeight: 1.6, marginBottom: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px" } },
      "母数＝全銘柄の浮き足〇記録 " + pool.length + "件（浮き値あり）。各記録は実際に使った加算率で採用αに畳み込み済み。ここでは浮き足の加算だけを0〜100%（10刻み）で振り直して最終損益で評価。★推奨＝件数（E成立）" + _EL_BASE_MIN_N + "以上で想定損益プラスの中でスコア最大＝新規記録の浮き足加算の自動入力に使う推奨率（次点も表示）。"),
    _elUkiPctSweepNode(sweep));
}
// 浮き足の基本/応用プール別 加算率ボード（詳細表）2026-07-14g: 母数＝浮き足〇&浮き値>0&算入&v2 のうち mode で基本(応用フラグ無)/応用(応用フラグ有)に分岐。各プールに%スイープ(_elUkiPctSweep)を当て推奨%を出す＝基本α/応用αのタグ別プールと同じ発想。※フォーム📊詳細表ボタンから開く（配線は第2弾）。
function _elUkiPctBoardScoped(recs, aiOf, mode, reasons) {
  var _sp = mode === "special";
  var pool = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclTotal(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0 && (_sp ? _elUkiSpecialUsed(r.signal) : !_elUkiSpecialUsed(r.signal)); });
  var byReason = false;   // 浮き足応用の根拠別＝選んだ根拠を持つ記録に絞る（≥下限で採用・薄ければ全応用に戻す）2026-07-14g
  if (_sp && reasons && reasons.length) {
    var byR = pool.filter(function(r) { var rs = (r.signal && Array.isArray(r.signal.ukiReasons)) ? r.signal.ukiReasons : []; return rs.filter(function(x) { return reasons.indexOf(x) >= 0; }).length > 0; });
    if (byR.length >= _EL_BASE_MIN_N) { pool = byR; byReason = true; }
  }
  if (!pool.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _sp ? "浮き足応用〇（浮き値あり）の記録がまだありません" : "浮き足基本〇（浮き値あり）の記録がまだありません");
  var sweep = _elUkiPctSweep(pool, aiOf);
  return React.createElement(React.Fragment, null,
    React.createElement("div", { style: { fontSize: 11, color: "#64748B", lineHeight: 1.6, marginBottom: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px" } },
      "母数＝" + (_sp ? "浮き足応用" : "浮き足基本") + (byReason ? "（選択根拠）" : "") + "〇の記録 " + pool.length + "件（浮き値あり）。加算率を0〜100%（10刻み）で振り直し最終損益で評価。★推奨＝件数（E成立）" + _EL_BASE_MIN_N + "以上で想定損益プラスの中でスコア最大＝" + (_sp ? "浮き足応用" : "浮き足基本") + "加算率の推奨（次点も表示）。"),
    _elUkiPctSweepNode(sweep));
}
// フォーム/EPナビ向け: 全銘柄の浮き足(基本 or 応用)記録(refDate=記録日前日まで)から推奨加算率(reco)/次点(runnerUp)を算出 2026-07-14g。データ不足は{reco:null}。_elUkiRecoPctsのmode分岐版。
function _elUkiPctPickScoped(data, refDate, mode, reasons) {
  var _sp = mode === "special";
  var all = _elCollectAllSignals(data) || [];
  var pool = all.filter(function(r) { if (!r || !r.signal) return false; if (refDate && r.date && r.date >= refDate) return false; return _epIsV2(r.signal) && _elInclTotal(r.signal) && _elUkiYes(r.signal) && _elUkiVal(r.signal) != null && _elUkiVal(r.signal) > 0 && (_sp ? _elUkiSpecialUsed(r.signal) : !_elUkiSpecialUsed(r.signal)); });
  var byReason = false, fellBack = false;   // 浮き足応用の根拠別（≥下限で採用・薄ければ全応用にフォールバック＝応用αと同じ）2026-07-14g
  if (_sp && reasons && reasons.length) {
    var byR = pool.filter(function(r) { var rs = (r.signal && Array.isArray(r.signal.ukiReasons)) ? r.signal.ukiReasons : []; return rs.filter(function(x) { return reasons.indexOf(x) >= 0; }).length > 0; });
    if (byR.length >= _EL_BASE_MIN_N) { pool = byR; byReason = true; } else if (pool.length) { fellBack = true; }
  }
  if (!pool.length) return { reco: null, runnerUp: null, n: 0, byReason: byReason, fellBack: fellBack };
  var sweep = _elUkiPctSweep(pool, function(r) { return _elAlphaInfo(r, data); });
  return { reco: sweep.best ? sweep.best.P : null, runnerUp: sweep.runnerUp ? sweep.runnerUp.P : null, n: pool.length, byReason: byReason, fellBack: fellBack };
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
        _th("日付", { width: 50 }), _th("時間", { width: 42 }), _th("シグナル"), _th("α値", { width: 34 }), _th("E", { width: 24 }), _th("取引", { width: 26 }), _th("最終損益・詳細", { width: 84 }),
        React.createElement("th", { colSpan: 2, style: { padding: "2px 4px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", textAlign: "center", fontSize: 10, color: "#9A9186", whiteSpace: "nowrap" } }, "OS・損益詳細"),
        _th("実現損益", { width: 80 }))),
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
  var simTbl = _elv2Table(["損切り値", "損切り回数", "損切り率", "最終損益"], sim.map(function(x, i) {
    return React.createElement("tr", { key: x.cut, style: i === bestI ? { background: "#FEF3C7" } : null },
      _elv2Td(React.createElement("span", null, x.cut + "円", i === bestI ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", fontWeight: 800, marginLeft: 4 } }, "★手じまい最大") : null), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _elv2Td(x.sN + "回"),
      _elv2Td(_elStopRateCell(x.rate)),
      _elv2Td(React.createElement("b", { style: { color: _elPnlColor(x.h2) } }, _elPnlFmt(Math.round(x.h2)))));
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
    _h("🎚 損切り値の最適化（損切り値別シミュ）", "全記録に同じ損切り値を当てたときの損切り回数・最終損益。★=最終損益が最大の損切り値。狭いほど損切り増・損失浅／広いほど損切り減・損失大"),
    simTbl,
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
    var all = (baseRecs || []).filter(function(r) { return r && r.date && r.date < dateStr && _epIsV2(r.signal) && _elInclTotal(r.signal); });
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
// 1段（1建値）の評価。α<0は0にクランプ・cutLine未設定は10（_elPlanIsStopの既定と同一）。
// 【2026-07-03 案C】損益は本日の損益データ欄と同一の期待度別算入（_elHold1TotParts＝（）外main/（）内ref）に統一。
//  main100=（）外（○のみH1本算入・△/×/損切りはEP想定額）／ref100=（）内差分（△・損切り済のみ／H1保有額−main）。pnl100はmain100の別名（既存の（）外消費箇所と互換）。
// 返り値 { built, skip('unreached'|'x'|'noalpha'|null), pnl100/main100/ref100(100株換算・判定不可はnull), stop, indet, a(実効α) }。
function _elKabuTierEval(s, a, cut) {
  if (a == null || a === "" || isNaN(Number(a))) return { built: false, skip: "noalpha", pnl100: null, main100: null, ref100: null, stop: false, indet: false, a: null };
  var _a = Math.max(0, Math.round(Number(a)));
  var _cl = (cut != null && cut !== "" && !isNaN(Number(cut))) ? Number(cut) : 10;
  var rr = _epResolve(s, _a);
  if (!rr || rr.epIdx < 0 || rr.epIdx > 2) return { built: false, skip: "unreached", pnl100: null, main100: null, ref100: null, stop: false, indet: false, a: _a };
  if (rr.judge !== "ok") return { built: false, skip: "x", pnl100: null, main100: null, ref100: null, stop: false, indet: false, a: _a };
  var stop = _elPlanIsStop(s, _a, _cl) || _elHoldIsStop(s, _a, _cl);
  var parts = _elHold1TotParts(s, _a, _cl);   // { main:（）外, ref:（）内差分 } ＝本日の損益データ欄と同一基準
  if (parts.main == null && parts.ref == null) return { built: true, skip: null, pnl100: null, main100: null, ref100: null, stop: stop, indet: true, a: _a };
  return { built: true, skip: null, pnl100: parts.main, main100: parts.main, ref100: parts.ref, stop: stop, indet: false, a: _a };
}
// ラダーを記録群へ一括適用。tiersOf(r)→[{a(実効α・nullは算出不可), add(この取引で建てる株数)}]。各取引は独立ショート＝addだけ空売り（2026-07-05: 手動は各取引の株数そのまま／自動はs1・s2）。
// sum=通算損益（判定可能な段のみ）・builtRecN=建玉あり（1段以上約定し損益判定できた記録）・stopRecN=うち損切り段あり・indetRecN=判定不可段あり・xRecN=×見送りのみ・noBaseRecN=推奨α不明段あり。
// tier積算コア（2026-07-14 系統3共通化）: 1記録のtier列を積算し（）外recPnl/（）内recRef＋各フラグを返す。マスター表(_elKabuLadderCalc)と自動配分ランキングの二重実装を1本化＝ドリフト（ランキング≠マスター表）を構造的に防止。
// evalOf(t,ctx)→ev（_elKabuTierEval or キャッシュ_evAt。base-levelα不明のtierはevalOf側で_EL_TIER_SKIPを返す＝旧ランキングの `_bl==null→continue` と同値・キャッシュ非汚染）／weightOf(t,ctx)→株数／collectCells=falseで表用cells配列を作らない（ランキングのperf維持）。旧実装とバイト等価（積算条件・丸め位置は不変）。
var _EL_TIER_SKIP = { skip: "noalpha" };
function _elKabuAccumTiers(tiers, evalOf, weightOf, collectCells, ctx) {
  var recPnl = 0, recRef = 0, any = false, hasMain = false, anyStop = false, anyIndet = false, anyNoBase = false, anyX = false;
  var cells = collectCells ? [] : null;
  for (var i = 0; i < tiers.length; i++) {
    var t = tiers[i], w = weightOf(t, ctx), ev = evalOf(t, ctx);
    if (ev.skip === "noalpha" && w > 0) anyNoBase = true;
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
  return { recPnl: recPnl, recRef: recRef, any: any, hasMain: hasMain, anyStop: anyStop, anyIndet: anyIndet, anyNoBase: anyNoBase, anyX: anyX, cells: cells };
}
function _elKabuLadderCalc(recs, aiOf, tiersOf) {
  var rows = [], sum = 0, sumRef = 0, builtRecN = 0, stopRecN = 0, indetRecN = 0, xRecN = 0, noBaseRecN = 0;
  (recs || []).forEach(function(r) {
    var s = r && r.signal; if (!s) return;
    var cut = aiOf(r).cutLine;
    var tiers = tiersOf(r) || [];
    var acc = _elKabuAccumTiers(tiers, function(t) { return _elKabuTierEval(s, t.a, cut); }, _elKabuTierAdd, true);
    if (acc.any) { sum += acc.recPnl; sumRef += acc.recRef; builtRecN++; if (acc.anyStop) stopRecN++; }
    if (acc.anyIndet) indetRecN++;
    if (acc.anyX && !acc.any) xRecN++;
    if (acc.anyNoBase) noBaseRecN++;
    // recPnl: （）外を持つ取引が1つも無い記録（EP△＝△確信度エントリーで（）内のみ等）はnull＝表示「—」。従来列（_elHold1TotParts直・main null→—）と表示規約を一致 2026-07-04c。合計へは0円として算入（従来どおり）。
    rows.push({ r: r, cells: acc.cells, recPnl: (acc.any && acc.hasMain) ? Math.round(acc.recPnl) : null, recRef: acc.any ? Math.round(acc.recRef) : 0, anyStop: acc.anyStop, anyIndet: acc.anyIndet });
  });
  return { rows: rows, sum: Math.round(sum), sumRef: Math.round(sumRef), builtRecN: builtRecN, stopRecN: stopRecN, indetRecN: indetRecN, xRecN: xRecN, noBaseRecN: noBaseRecN, n: rows.length };
}
function _elKabuTierAdd(t) { return t.add; }
// UI本体（α値タブ④）。props: recs=シミュ母数（シグナル×内訳サブタブのスコープ）/ baseRecs=推奨α算出用（銘柄全体・全シグナル＝日別ページ/記録フォームと同じ母数 2026-07-03t。旧: シグナル全体_selSigRecs）/ aiOf / floatMode。
// 手動ラダー（取引ごとに入力方式=絶対値/推奨α±X/推奨基本α値を選択・各取引{method,off,株数}・実効αを記録ごとに算出し各取引の株数をそのまま空売り＝合計は総和・2026-07-05累積廃止）と自動配分（合計株数→第1取引α0〜推奨基本α未満×100株刻み配分を総当たり・第2取引=記録日時点の推奨α・★最適+上位ランキング）の2モード。
function _elKabuLadderSimV2(props) {
  var recs = props.recs || [], baseRecs = props.baseRecs || recs, aiOf = props.aiOf, floatMode = !!props.floatMode;
  var _uM = useState("manual"), mode = _uM[0], setMode = _uM[1];
  var _uF = useState("no"), addFil = _uF[0], setAddFil = _uF[1];
  var _uAo = useState("act"), addOn = _uAo[0], setAddOn = _uAo[1];   // 追加α〇記録への上乗せ: act=実追加α(既定)/reco=記録日時点の推奨追加α/none=なし。〇記録がシミュ対象にいる時だけピル表示 2026-07-06
  var _uEx = useState({ uki: true, lc: true, rn: true }), exFlags = _uEx[0], setExFlags = _uEx[1];   // 除外チェック（⑥ 2026-07-13）: 浮き足〇/ライン併存〇/RN〇の記録をシミュ母数から外す（既定＝全て除外＝素の基本α母数で見る・ユーザー要望2026-07-13）。floatModeでは浮き足除外は無効
  var _uPd = useState("all"), period = _uPd[0], setPeriod = _uPd[1];   // 対象取引の期間絞り込み（本日/1週/1月/3月/6月/1年/全期間）既定=全期間 2026-07-03q
  var _uRw = useState([{ method: "", off: "", cum: "", addMethod: "act", addOff: "" }, { method: "", off: "", cum: "", addMethod: "act", addOff: "" }]), rows = _uRw[0], setRows = _uRw[1];   // 取引ごとに入力方式(method)＋追加α方式(addMethod/addOff)を持つ 2026-07-03→2026-07-06追加α取引ごと化。初期は基本α未選択・追加αは実追加α(act)既定（触らなければ実際の追加αを反映＝シミュ=従来で差額0・×+未選択母数では実追加α=0で従来値不変）
  var _uAP = useState(false), addPicker = _uAP[0], setAddPicker = _uAP[1];   // 取引追加時の入力方式ピッカー表示 2026-07-03
  var _METHODS = [{ key: "abs", label: "絶対値（0円基準）でα○円", short: "絶対値" }, { key: "reco", label: "推奨α±X（記録日時点）", short: "推奨α±X" }, { key: "recobase", label: "推奨基本α値で（株数だけ）", short: "推奨基本α値" }];   // 手動ラダーの基本α入力方式マスター
  var _ADD_METHODS = [{ key: "abs", label: "絶対値で追加α○円", short: "絶対値" }, { key: "reco", label: "各日の推奨追加α±X", short: "推奨追加α±X" }, { key: "recoadd", label: "各取引日の推奨追加α値", short: "推奨追加α値" }, { key: "act", label: "実追加α（記録の値）", short: "実追加α" }];   // 手動ラダーの追加α入力方式マスター（取引ごと）2026-07-06。推奨追加α系は「推奨基本αに何円足すか」の値＝任意の基本αに乗せられるが推奨基本α値との併用が前提
  var _uTt = useState("500"), total = _uTt[0], setTotal = _uTt[1];
  var _uAX = useState(null), autoExp = _uAX[0], setAutoExp = _uAX[1];
  var _uMt = useState(null), mtExp = _uMt[0], setMtExp = _uMt[1];   // 案Aマスター表の行展開キー 2026-07-03
  var _uSo = useState("10"), stopOff = _uSo[0], setStopOff = _uSo[1];   // 手動ラダーのシミュ損切り値＝推奨基本α値+Xのオフセット（既定10＝推奨基本α+10円・空欄にすると各記録の実際の損切り値）2026-07-05
  var _kbSan = function(v) { return String(v == null ? "" : v).replace(/[０-９]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); }).replace(/[ー−―‐]/g, "-").replace(/[^0-9\-]/g, ""); };
  var _kbInt = function(v) { var t = _kbSan(v); if (t === "" || t === "-") return null; var n = parseInt(t, 10); return isNaN(n) ? null : n; };
  // 対象取引を期間で絞り込み（記録日基準・本日=当日/相対=今日からN遡り以降/全期間=無制限）2026-07-03q。推奨α(baseRecs/recoOf)は各記録日の履歴で別途算出＝ここでは絞らない。
  var _periodRecs = (function() {
    if (period === "all") return recs;
    var _t = todayStr();
    if (period === "today") return recs.filter(function(r) { return r && r.date === _t; });
    var _cd = new Date(_t + "T00:00:00");
    if (period === "1w") _cd.setDate(_cd.getDate() - 7);
    else if (period === "1m") _cd.setMonth(_cd.getMonth() - 1);
    else if (period === "3m") _cd.setMonth(_cd.getMonth() - 3);
    else if (period === "6m") _cd.setMonth(_cd.getMonth() - 6);
    else if (period === "1y") _cd.setFullYear(_cd.getFullYear() - 1);
    var _cut = _cd.getFullYear() + "-" + String(_cd.getMonth() + 1).padStart(2, "0") + "-" + String(_cd.getDate()).padStart(2, "0");
    return recs.filter(function(r) { return r && r.date && r.date >= _cut; });
  })();
  var pool = floatMode ? _periodRecs : (addFil === "no" ? _periodRecs.filter(function(r) { return r && !_elSpecialUsed(r.signal); }) : addFil === "yes" ? _periodRecs.filter(function(r) { return r && _elSpecialUsed(r.signal); }) : _periodRecs);
  var _poolBeforeEx = pool.length;
  if (exFlags.uki || exFlags.lc || exFlags.rn) pool = pool.filter(function(r) { var s = r && r.signal; if (!s) return true; if (!floatMode && exFlags.uki && _elUkiYes(s)) return false; if (exFlags.lc && s.lineCoexist === true) return false; if (exFlags.rn && _elRnYes(s)) return false; return true; });   // 除外チェック（⑥ 2026-07-13・floatModeでは浮き足除外は無効＝母数が浮き足記録のため）
  var _exCount = _poolBeforeEx - pool.length;   // 除外中の件数（バッジ表示・0=該当記録なし＝フラグ未設定の可能性を可視化）2026-07-13b
  // 日付時点推奨α（重い計算）はrefキャッシュ＝スコープ/データが実際に変わった時だけ再構築（EntryLogViewは毎レンダーで配列を作り直すため参照同一性では判定できない→内容署名で判定）。
  var recoRef = useRef(null);
  // 署名にOS/H足の実データ(_epLegs=高値/確定値/期待度)・浮き足〇も含める＝OS値や期待度だけ編集しても推奨αが再計算されるように（旧: alphaVal/addAlphaUsed/cutLine/dateのみ→OS編集で古い推奨のまま）2026-07-04c
  var recoSig = "c" + _elAnaCutCur + "!" + baseRecs.length + "|" + baseRecs.map(function(r) { var s = r && r.signal; if (!s) return (r && r.date) || ""; return (r.date || "") + "." + (s.alphaVal != null ? s.alphaVal : "") + "." + (s.specialUsed === true ? ("s" + (s.specialAlpha != null ? s.specialAlpha : "")) : "n") + (_elUkiYes(s) ? "U" : "") + "." + (aiOf(r).cutLine != null ? aiOf(r).cutLine : "") + "." + (_epIsV2(s) ? _epLegs(s).map(function(l) { return l.h + "," + l.c + "," + (l.exp || ""); }).join("|") : ""); }).join(";");   // 前提損切り値+応用α(specialAlpha)もキーに（推奨α/base-levelが依存）2026-07-13
  if (!recoRef.current || recoRef.current.sig !== recoSig) {
    // 推奨基本α（単一値）＝日別ページ「今日の推奨」・記録フォームと同一の算出＝v2＋算入・本日の前日まで・直近50→100→全期間で最初に値が出た窓（statusも保持＝na参考バッジ用）。
    // 旧: 生baseRecs（非v2が母数nを膨らませ到達率を希釈・不算入記録も混入）・窓なし・当日込みの_elBaseAlphaPick直当て＝日別ページとズレていた 2026-07-04c修正。
    var _bpT = todayStr();
    var _bpAll = baseRecs.filter(function(r) { return r && r.date && r.date < _bpT && _epIsV2(r.signal) && _elInclTotal(r.signal); }).sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
    var _bpLastN = function(n) { return _bpAll.length > n ? _bpAll.slice(_bpAll.length - n) : _bpAll.slice(); };
    var _bpCand = [_bpLastN(_EL_PERIOD_COUNTS[1]), _bpLastN(_EL_PERIOD_COUNTS[2]), _bpAll];
    var _bpPick = null;
    for (var _bpI = 0; _bpI < _bpCand.length && !_bpPick; _bpI++) { var _bpA = _elBaseAlphaA(_bpCand[_bpI], aiOf); if (_bpA && _bpA.pick && _bpA.pick.alpha != null) _bpPick = _bpA.pick; }
    recoRef.current = { sig: recoSig, fn: _elKabuRecoBaseFn(baseRecs, aiOf), basePick: _bpPick };
  }
  var recoOf = recoRef.current.fn;
  // この銘柄の推奨基本α（単一値・日別ページ「今日の推奨」と同一基準）。表示＋自動配分の第1取引α上限（推奨基本α未満）に使用。recoRefに同梱キャッシュ。2026-07-03→2026-07-04c基準統一
  var _recoBasePick = recoRef.current.basePick;
  var _recoBaseAlpha = (_recoBasePick && _recoBasePick.alpha != null) ? _recoBasePick.alpha : null;
  // 元の損益（実際の実現損益・参考）＝母数の全記録の signed realizedPnl 合計。シミュは総株数・これは実際に建てた株数なのでスケールは別（参考）。2026-07-03
  var _origPnl = (function() { var s = 0, has = false; pool.forEach(function(r) { var sg = r && r.signal; if (sg && _elIsEntered(sg, r.item)) { var v = (r.item && r.item.pnl != null) ? Number(r.item.pnl) : _elSignedVal(sg.realizedPnl, sg.realizedPnlSign); if (v != null && !isNaN(v)) { s += v; has = true; } } }); return has ? Math.round(s) : null; })();
  // 記録固有の上乗せ＝浮き足加算（常時・floor(浮き値÷2)・浮き足×/対象外は0）＋追加α上乗せ（〇記録のみ・addOnセレクタ）。シミュの入力α/自動配分の探索αは「基本α部分」・実効α＝入力＋この上乗せ＝実運用ルール（α＝基本α＋浮き足加算＋追加α）の基本α部分だけ差し替える反実仮想 2026-07-06。
  // 既定母数（×+未選択・その他サブタブ）では全記録0＝従来の数値と完全一致。損切りは相対幅(cutLine)なので自動的に実効α起点＝変更不要。
  var _simAddOf = function(r) { var s = r && r.signal; return s ? _elUkiAdd(s) : 0; };   // 記録固有の上乗せ＝浮き足加算のみ（追加α増分は廃止＝応用は基底α置換 2026-07-13）
  // 応用〇の記録は候補（swept）基本αを specialAlpha へ置換＝base-levelα。通常記録は候補のまま。実効α＝base-levelα＋浮き足加算（意味反転: 増分上乗せ→基底置換）2026-07-13。
  var _simBaseLevel = function(r, candidateBase) { var s = r && r.signal; if (s && _elUkiYes(s)) return 0; if (s && _elSpecialUsed(s)) { var sp = _elBaseLevelAlpha(s); if (sp != null) return sp; } return candidateBase; };   // 2026-07-14g 浮き足〇＝土台α無し＝基底0（採用α＝浮き足加算のみ・候補は無視）
  var _poolHasYes = pool.some(function(r) { return r && r.signal && _elSpecialUsed(r.signal); });   // 応用〇の記録がシミュ母数にいるか（表示条件用）
  // ===== 手動ラダー: 取引ごとに入力方式（絶対値/推奨α±X/推奨基本α値）→実効αを記録ごとに算出し、各取引の株数をそのまま空売り（足し算＝自動配分と同じ）2026-07-05 =====
  // ★2026-07-05 累積(累計)方式を廃止＝各取引の株数はその取引で建てる株数そのもの。第1取引100株＋第2取引400株＝合計500株（旧: 累積400なら増し300株の差分方式）。
  // 各取引の実効α: abs=off(絶対値・0未満は0) / reco=推奨α(日付時点)+off / recobase=推奨α(日付時点)。推奨不明(reco系)はこの記録では建てない(a=null)。α昇順ソートは表示（シミュα列・内訳）と揃えるためで、足し算なので合計は順序に依らない。
  // 注: state のフィールド名は歴史的に `cum` だが意味は「この取引の株数」（累積ではない）2026-07-05。
  var _manTiersOf = function(r) {
    var reco;   // recoOf(r.date)は必要時のみ算出（キャッシュ済）。undefined=未算出
    var _recoAt = function() { if (reco === undefined) reco = recoOf(r.date); return reco; };
    var _uki = _elUkiAdd(r.signal);   // 浮き足加算＝記録固有・常時（取引ごとオプションの対象外）2026-07-06
    return rows.map(function(rw) {
      var sh = _kbInt(rw.cum); if (sh == null || sh <= 0) return null;   // この取引の株数（そのまま）
      var a;
      if (rw.method === "abs") { var off = _kbInt(rw.off); a = (off == null) ? null : Math.max(0, off); }
      else if (rw.method === "recobase") { var b1 = _recoAt(); a = (b1 == null) ? null : b1; }
      else if (rw.method === "reco") { var b2 = _recoAt(); if (b2 == null) { a = null; } else { var o = _kbInt(rw.off); a = Math.max(0, b2 + (o == null ? 0 : o)); } }   // 0未満はエンジン(_elKabuTierEval)と同じく0にクランプ＝シミュα列/内訳の表示と実効αを一致 2026-07-04c
      else { a = null; }   // 未選択（method空）は建てない 2026-07-03p
      var _bl = _simBaseLevel(r, a);   // 応用〇＝specialAlphaで基底αを置換（候補は無視）2026-07-13
      return { a: (_bl == null ? null : _bl + _uki), add: sh, _uki: _uki, _addA: null };   // 実効α＝base-levelα＋浮き足加算。_addA=null（追加α増分は廃止＝取引ごと追加α列は非表示）
    }).filter(function(t) { return t != null && t.a != null; }).sort(function(x, y) { return x.a - y.a; });
  };
  // シミュの損切り値: 空欄→各記録の実際の損切り値(aiOf.cutLine)／設定時→その記録日時点の推奨基本α(recoOf)+オフセット（1円未満は1にクランプ・推奨α不明は記録値へフォールバック）。手動ラダー専用（自動配分は各記録の実際の損切り値のまま）2026-07-05。
  var _stopOffN = _kbInt(stopOff);   // 損切りオフセット（null=空欄）
  var _simCutOf = function(r) {
    if (_stopOffN == null) return aiOf(r).cutLine;
    var rb = recoOf(r.date);
    if (rb == null) return aiOf(r).cutLine;
    var c = rb + _stopOffN;
    return c >= 1 ? c : 1;
  };
  var _simCutInfo = function(r) { var c = _simCutOf(r); var ov = (_stopOffN != null && recoOf(r.date) != null); return { cut: c, ov: ov }; };   // ov=推奨基本α+オフセットで上書き中か（表示色用）
  var _aiSim = function(r) { return { alpha: aiOf(r).alpha, cutLine: _simCutOf(r) }; };
  var manCalc = (mode === "manual" && pool.length) ? _elKabuLadderCalc(pool, _aiSim, _manTiersOf) : null;   // 手動は損切りオフセットを反映（_aiSim）2026-07-05
  // ===== 自動配分: 第1・第2取引の各αを候補セット（絶対値0/3/5・各日の推奨基本α・推奨α±1〜±5）から選び、総株数を100株刻みで2取引に配分して総当たり 2026-07-07 =====
  // 候補α方式（14種）: 絶対値0/3/5（定数）＋推奨基本α（＝推奨α±0）＋推奨α±1〜±5（記録日時点・推奨不明の日は建てない）。旧: 第1取引を0〜推奨基本α未満の全整数×第2取引固定＝推奨α。
  var _AUTO_CANDS = [{ key: "abs0", kind: "abs", v: 0 }, { key: "abs3", kind: "abs", v: 3 }, { key: "abs5", kind: "abs", v: 5 }, { key: "r0", kind: "reco", x: 0 }];
  for (var _rx = 1; _rx <= 5; _rx++) { _AUTO_CANDS.push({ key: "r+" + _rx, kind: "reco", x: _rx }); _AUTO_CANDS.push({ key: "r-" + _rx, kind: "reco", x: -_rx }); }
  var _candIdx = {}; _AUTO_CANDS.forEach(function(c, i) { _candIdx[c.key] = i; });
  // 候補の基本α（rb＝その記録日時点の推奨α・null可）。絶対値は定数／推奨系は rb+x を0クランプ・推奨不明(null)は建てない。実効α＝この基本α＋記録固有の上乗せ（浮き足加算＋追加α上乗せ）。
  var _candBaseFromReco = function(cand, rb) { if (cand.kind === "abs") return cand.v; if (rb == null) return null; var b = rb + cand.x; return b < 0 ? 0 : b; };
  var _candLabel = function(cand) { if (cand.kind === "abs") return "α" + cand.v + "円"; if (cand.x === 0) return "推奨α"; return "推奨α" + (cand.x > 0 ? "+" + cand.x : cand.x); };
  var totalN = (function() { var t = _kbInt(total); if (t == null || t <= 0) return 0; return Math.max(100, Math.round(t / 100) * 100); })();
  var autoRes = null;
  if (mode === "auto" && totalN > 0 && pool.length) {
    var _evCache = pool.map(function() { return {}; });
    var _evAt = function(pi, a) { var m = _evCache[pi]; if (!m.hasOwnProperty(a)) m[a] = _elKabuTierEval(pool[pi].signal, a, aiOf(pool[pi]).cutLine); return m[a]; };
    var _recoAs = pool.map(function(r) { return recoOf(r.date); });
    var _exAs = pool.map(function(r) { return _simAddOf(r); });   // 記録固有の上乗せ（浮き足加算＋追加α上乗せ）＝候補の基本αにこれを足して実効α評価 2026-07-06
    // tier積算コア(_elKabuAccumTiers)へ渡す評価/株数コールバック（ループ外で1回定義＝ホットループでクロージャを再生成しない・perf維持 2026-07-14 系統3）。ctx=pool index。base-levelα不明は_EL_TIER_SKIP＝旧 `_bl==null→continue` と同値（_evAt未呼出でキャッシュ非汚染）。
    var _rankEvalOf = function(tr, pi) { var _base = _candBaseFromReco(tr.cand, _recoAs[pi]); var _bl = _simBaseLevel(pool[pi], _base); return (_bl == null) ? _EL_TIER_SKIP : _evAt(pi, _bl + _exAs[pi]); };
    var _rankSharesOf = function(tr) { return tr.shares; };
    var _noRecoN = 0; _recoAs.forEach(function(v) { if (v == null) _noRecoN++; });
    var _combos = [], _seen = {};
    for (var _s1 = 0; _s1 <= totalN; _s1 += 100) {
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
    autoRes = { combos: _combos, best: _combos[0] || null, noRecoN: _noRecoN, comboN: _combos.length };
  }
  var _autoTiersOfFor = function(cb) { return function(r) { var _ex = _simAddOf(r), _rb = recoOf(r.date); return (cb.tranches || []).map(function(tr) { var _base = _candBaseFromReco(tr.cand, _rb); var _bl = _simBaseLevel(r, _base); return { a: (_bl == null ? null : _bl + _ex), add: tr.shares }; }); }; };   // 総当たり(_evAt)と同じ実効α（base-levelα+浮き足）＝ランキングとマスター表が一致 2026-07-07→応用α化 2026-07-13
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
      if (ev.skip === "noalpha") txt = React.createElement("span", { style: { color: "#bbb" } }, "推奨α不明（取引対象外）");
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
  var _mtSimCell = function(m) {
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
    var botRow = React.createElement("div", { style: { whiteSpace: "nowrap", borderTop: "1px dotted #cbd5e1", marginTop: 1, paddingTop: 1 }, title: "（）内＝○△を含む＝H1まで保有した場合の参考額" }, botKids);
    return React.createElement("div", { style: { lineHeight: 1.35, display: "inline-block" } }, topRow, botRow);
  };
  // 従来＝損益データ欄と同一の理論値（採用α・_elHold1TotParts＝（）外/（）内）を100株→総株数へ単純按分。シミュエンジン（取引ラダー・第1/第2取引）は一切通さない（ユーザー仕様 2026-07-04）。
  var _kbConvParts = function(r, nSh) {
    var s = r && r.signal; if (!s) return { main: null, ref: null };
    var _cai = aiOf(r);
    var p = _elHold1TotParts(s, _cai.alpha, _cai.cutLine);
    return { main: p.main != null ? Math.round(p.main * nSh / 100) : null, ref: p.ref != null ? Math.round(p.ref * nSh / 100) : null };
  };
  var _kbConvSums = function(nSh) { var m = 0, rf = 0; pool.forEach(function(r) { var p = _kbConvParts(r, nSh); if (p.main != null) m += p.main; if (p.ref != null) rf += p.ref; }); return { sum: Math.round(m), sumRef: Math.round(rf) }; };
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
      var _exU = _elUkiAdd(s);   // 浮き足加算（記録固有）
      var _perTx = (row.cells || []).some(function(c) { return c.t && c.t._addA != null; });   // 手動＝tierに取引ごと追加αを持つ／自動＝持たない
      var _addAs = [];
      if (_perTx) { (row.cells || []).forEach(function(c) { var v = c.t && c.t._addA; if (v != null && v > 0 && _addAs.indexOf(v) < 0) _addAs.push(v); }); _addAs.sort(function(p, q) { return p - q; }); }   // 取引ごとに異なりうる追加αの実値（>0のみ・昇順）
      else { var _g = _simAddOf(r) - _exU; if (_g > 0) _addAs.push(_g); }   // 自動配分＝グローバルaddOn（据え置き）
      mrecs.push({ oi: i, r: r, s: s, a: aiOf(r).alpha, recoA: recoOf(r.date), simA: _sa, simUki: _exU, simAddOn: _addAs, simCut: _cc.cut, simCutOv: _cc.ov, cfgPnl: row.recPnl, cfgRef: row.recRef, basePnl: _cv.main, baseRef: _cv.ref, cells: row.cells, anyStop: row.anyStop });
    });
    mrecs.sort(function(x, y) { var dx = (x.r.date || "") + (x.s.time || ""), dy = (y.r.date || "") + (y.s.time || ""); return dx < dy ? 1 : dx > dy ? -1 : 0; });
    var _sumRow = function(k) { return React.createElement("tr", { key: k, style: { background: "#E1F5EE" } },
      React.createElement("td", { colSpan: 7, style: { padding: "4px 6px", fontSize: 10, fontWeight: 700, color: "#0F766E", whiteSpace: "nowrap" } }, "合計（" + mrecs.length + "件）"),
      _mtTd(_mtPnlNode2(baseSum, baseRef), "right"), _mtTd(_mtPnlNode2(cfgSum, cfgRef), "center", true), _mtTd(_mtPnlNode2(upl, uplRef), "right"), React.createElement("td", null)); };
    var brows = [];
    mrecs.forEach(function(m, i) {
      var s = m.s, a = m.a, diff = (m.basePnl == null && m.cfgPnl == null) ? null : ((m.cfgPnl || 0) - (m.basePnl || 0)), diffRef = (m.cfgRef || 0) - (m.baseRef || 0);   // 両方—なら—・片側—は0円扱いで常にシミュ−従来（従来のみ数値の時に符号が＋になるバグ修正 2026-07-04）。diffRef=（）内側の差額差分 2026-07-04b
      var key = "mt" + m.oi, open = mtExp === key;   // 元インデックス基準の安定キー（ソート非依存）2026-07-03
      var dstr = (m.r.date || "").slice(5).replace("-", "/") + (s.time ? " " + s.time : "");
      var alphaNode = _elAlphaTypeCell(s, a);
      brows.push(React.createElement("tr", { key: key, onClick: function() { setMtExp(open ? null : key); }, style: { cursor: "pointer", background: open ? "#F0FDFA" : (m.anyStop ? "#F4FBF5" : "transparent") } },
        _mtTd(dstr), _mtTd(_epOsChainCell(s, a)), _mtTd(_epECell(s, a), "center"), _mtTd(React.createElement("span", { style: { color: "#0369A1", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, m.recoA != null ? (m.recoA + "円") : "—")), _mtTd(alphaNode), _mtTd(React.createElement("div", { style: { lineHeight: 1.15 } }, React.createElement("span", { style: { color: "#0F766E", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, m.simA.length ? m.simA.map(function(v) { return v + "円"; }).join("/") : "—"), (m.simA.length && (m.simUki > 0 || (m.simAddOn && m.simAddOn.length))) ? React.createElement("div", { style: { fontSize: 8, color: "#0D9488", fontWeight: 400, whiteSpace: "nowrap" } }, "（" + [m.simUki > 0 ? "浮" + m.simUki : null, (m.simAddOn && m.simAddOn.length) ? "追" + m.simAddOn.join("/") : null].filter(function(x) { return x; }).join("+") + "込）") : null)), _mtTd(React.createElement("span", { style: { color: m.simCutOv ? "#B45309" : "#94a3b8", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" } }, m.simCut != null ? (m.simCut + "円") : "—"), "center"), _mtTd(_mtPnlNode2(m.basePnl, m.baseRef), "right"), _mtTd(_mtSimCell(m), "center", true), _mtTd(_mtPnlNode2(diff, diffRef), "right"), _mtTd(React.createElement("span", { style: { color: "#0F766E", fontSize: 9 } }, open ? "▲" : "▼"), "center")));
      if (open) brows.push(React.createElement("tr", { key: key + "_d" }, React.createElement("td", { colSpan: 11, style: { padding: "6px 10px", background: "#FBFEFD", borderBottom: "1px solid #eee", fontSize: 9.5, color: "#9A3412" } }, React.createElement("span", { style: { fontWeight: 700 } }, "取引内訳: "), _mtTierNodes(m.cells))));
    });
    return React.createElement("div", { style: { marginTop: 8 } },
      React.createElement("div", { style: { overflowX: "auto", border: "0.5px solid #e8e3d8", borderBottom: "none", borderRadius: "10px 10px 0 0" } },
        React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 730 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#F0FDFA", color: "#0F766E" } },
              _mtTh("日付"), _mtTh("OS連鎖（次足期待度）"), _mtTh("E", "center"), _mtTh("推奨α"), _mtTh("採用α"), _mtTh("シミュα"), _mtTh("シミュ損切", "center"), _mtTh("従来", "right"), _mtTh("シミュレーション", "center", true), _mtTh("差額", "right"), _mtTh(""))),
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
  var _notesLine = function(calc) {
    var parts = [];
    if (calc.xRecN) parts.push("×見送りのみ" + calc.xRecN + "件（建てない）");
    if (calc.indetRecN) parts.push("判定不可の取引あり" + calc.indetRecN + "件（その取引は損益に不算入）");
    if (calc.noBaseRecN) parts.push("推奨α不明" + calc.noBaseRecN + "件（その取引は建てない）");
    return parts.length ? React.createElement("div", { style: { fontSize: 9, color: "#B45309", marginTop: 3 } }, "※ " + parts.join("・")) : null;
  };
  // ===== 本体 =====
  var head = React.createElement(React.Fragment, null,
    React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0F766E" } }, "対象期間:"),
      [["today", "本日"], ["1w", "1週間"], ["1m", "1か月"], ["3m", "3か月"], ["6m", "6か月"], ["1y", "1年"], ["all", "全期間"]].map(function(kv) { return _pill(period === kv[0], kv[1], function() { setPeriod(kv[0]); setAutoExp(null); setMtExp(null); }, "#0F766E"); }),
      React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "（" + _periodRecs.length + "件）")),
    floatMode
      ? React.createElement("div", { style: { fontSize: 9.5, color: "#aaa", marginBottom: 6 } }, "母数＝浮き足の記録（" + pool.length + "件）・シミュαには各記録の浮き足加算（浮き値÷2切捨て）を上乗せ")
      : React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "分類:"),
          [["all", "全記録"], ["no", "基本α"], ["yes", "応用α"]].map(function(kv) { return _pill(addFil === kv[0], kv[1], function() { setAddFil(kv[0]); setAutoExp(null); setMtExp(null); }, "#9A3412"); }),   // mtExpも解除＝母数が変わると展開キー(oi)が別記録を指すため 2026-07-04c
          React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "（" + pool.length + "件）既定＝基本α＝応用αを使わなかった記録（浮き足/RN加算は含みうる）")),
    React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#B45309" } }, "除外:"),
      [(!floatMode ? ["uki", "浮き足〇"] : null), ["lc", "ライン併存〇"], ["rn", "RN〇"]].filter(Boolean).map(function(kv) {
        var on = !!exFlags[kv[0]];
        return React.createElement("button", { key: kv[0], type: "button", onClick: function() { var nf = Object.assign({}, exFlags); nf[kv[0]] = !on; setExFlags(nf); setAutoExp(null); setMtExp(null); },
          style: { padding: "3px 10px", fontSize: 10.5, fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid " + (on ? "#B45309" : "#ddd"), background: on ? "#FFF7ED" : "#fff", color: on ? "#B45309" : "#666", whiteSpace: "nowrap" } }, (on ? "☑ " : "☐ ") + kv[1]);
      }),
      (exFlags.uki || exFlags.lc || exFlags.rn)
        ? React.createElement("span", { style: { fontSize: 9.5, fontWeight: 800, color: _exCount > 0 ? "#B45309" : "#C0392B", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 5, padding: "1px 7px" } }, _exCount > 0 ? (_exCount + "件を除外中（対象 " + pool.length + "件）") : "除外0件＝チェック中のフラグ（〇）が付いた記録がこの母数にありません")
        : React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "チェックした記録をシミュ母数から除外（現在 " + pool.length + "件）")),
    (mode === "auto" && _poolHasYes) ? React.createElement("div", { style: { fontSize: 9, color: "#9A3412", marginBottom: 6 } }, "応用〇の記録はその記録の応用α値を基底αに採用（候補αの掃引対象外）。通常記録は候補αを掃引。") : null);
  if (!pool.length) {
    return React.createElement("div", null, head,
      React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この母数に該当する記録がありません"));
  }
  var body;
  if (mode === "manual") {
    var _ladderPrev = (function() {   // 各取引の株数をそのまま足す（累積ではない）＝「α0円で100株 ＋ 推奨基本α値で400株 ＝ 合計500株」2026-07-05
      var parts = [], tot = 0;
      rows.forEach(function(rw) {
        if (rw.method !== "abs" && rw.method !== "reco" && rw.method !== "recobase") return;   // 未選択は除外
        var sh = _kbInt(rw.cum); if (sh == null || sh <= 0) return;
        var off = _kbInt(rw.off); off = (off == null ? 0 : off);
        var lbl = rw.method === "abs" ? ("α" + Math.max(0, off) + "円") : rw.method === "recobase" ? "推奨基本α値" : ("推奨α" + (off >= 0 ? "+" : "") + off + "円");
        parts.push(lbl + "で" + sh + "株"); tot += sh;
      });
      return parts.length ? (parts.join(" ＋ ") + " ＝ 合計" + tot + "株") : "有効な取引がありません";
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
      return React.createElement(React.Fragment, null, React.createElement("span", { style: { fontSize: 10.5 } }, rw.method === "abs" ? "α" : "推奨α"), _offIn, React.createElement("span", { style: { fontSize: 10.5 } }, "円で"), _cumIn, React.createElement("span", { style: { fontSize: 10.5 } }, "株"));
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
    var _manTot = 0; rows.forEach(function(x) { if (x.method !== "abs" && x.method !== "reco" && x.method !== "recobase") return; var c = _kbInt(x.cum); if (c != null && c > 0) _manTot += c; });   // 手動ラダーの合計株数＝各取引の株数の総和（旧: 最大累積）2026-07-05。未選択行は数えない
    var _convMan = _manTot > 0 ? _kbConvSums(_manTot) : null;   // 従来（損益データ欄と同じ理論値×総株数按分）＝差額の基準（_kbMasterTableのbaseSumと同一計算）2026-07-04
    var _uplMan = (_convMan && manCalc) ? (manCalc.sum - _convMan.sum) : null;   // 差額＝シミュ−従来（＝マスター表の合計差額と一致）
    var _uplManRef = (_convMan && manCalc) ? (manCalc.sumRef - _convMan.sumRef) : null;   // 差額の（）内側差分（0なら（）非表示）2026-07-04b
    var _winN = 0; if (manCalc) manCalc.rows.forEach(function(_r) { if (_r.recPnl != null && _r.recPnl > 0) _winN++; });   // 勝ち＝建玉ありでシミュ損益プラス 2026-07-03r
    var _winRate = (manCalc && manCalc.builtRecN) ? _winN / manCalc.builtRecN : null;
    var _stopRate = (manCalc && manCalc.builtRecN) ? manCalc.stopRecN / manCalc.builtRecN : null;
    var _perShare = (manCalc && _manTot > 0) ? Math.round(manCalc.sum / _manTot * 10) / 10 : null;   // 1株あたり損益＝通算÷総株数
    body = React.createElement(React.Fragment, null,
      React.createElement("div", { style: { fontSize: 9.5, color: "#0F766E", fontWeight: 700, marginBottom: 6 } }, "取引ごとに『基本α』を選べます（絶対値／推奨α±X／推奨基本α値）。応用〇の記録はその記録の応用α値を基底に採用（掃引対象外）・実効α＝基底α＋浮き足加算"),
      React.createElement("div", { style: { marginBottom: 6 } },
        rows.map(function(rw, i) {
          var _baseSel = React.createElement("select", { value: rw.method || "", onChange: function(e) { _upd(i, { method: e.target.value }); }, style: { padding: "3px 6px", fontSize: 10.5, fontWeight: 700, color: rw.method ? "#0F766E" : "#aaa", border: "1px solid #ddd", borderRadius: 5, background: "#fff" } }, [React.createElement("option", { key: "_none", value: "" }, "（未選択）")].concat(_METHODS.map(function(m) { return React.createElement("option", { key: m.key, value: m.key }, m.short); })));
          var _addSel = React.createElement("select", { value: rw.addMethod || "", onChange: function(e) { var v = e.target.value; var patch = { addMethod: v }; if (v === "abs" && (rw.addOff === "" || rw.addOff == null)) patch.addOff = "3"; _upd(i, patch); }, style: { padding: "3px 6px", fontSize: 10.5, fontWeight: 700, color: rw.addMethod ? "#9A3412" : "#aaa", border: "1px solid #E7C6B5", borderRadius: 5, background: "#fff" } }, [React.createElement("option", { key: "_none", value: "" }, "（なし）")].concat(_ADD_METHODS.map(function(m) { return React.createElement("option", { key: m.key, value: m.key }, m.short); })));
          return React.createElement("div", { key: i, style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", marginBottom: 6, background: "#fff" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 } },
              React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E", whiteSpace: "nowrap" } }, "第" + (i + 1) + "取引"),
              React.createElement("div", { style: { display: "flex", gap: 4 } },
                React.createElement("button", { onClick: function() { _upd(i, { method: "", off: "", cum: "", addMethod: "act", addOff: "" }); }, title: "この取引の条件を無に（リセット）", style: { padding: "2px 8px", fontSize: 10, fontWeight: 700, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#0F766E", cursor: "pointer", whiteSpace: "nowrap" } }, "↺ リセット"),
                rows.length > 1 ? React.createElement("button", { onClick: function() { setRows(rows.filter(function(x, j) { return j !== i; })); }, style: { padding: "2px 8px", fontSize: 10, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#888", cursor: "pointer" } }, "🗑") : null)),
            React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 } },
              React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, color: "#64748b", minWidth: 34 } }, "基本α"),
              _baseSel,
              (rw.method === "abs" || rw.method === "reco" || rw.method === "recobase") ? _rowInputs(rw, i) : React.createElement("span", { style: { fontSize: 10, color: "#bbb" } }, "入力方式を選択")));
        }),
        addPicker
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
      React.createElement("div", { style: { fontSize: 9.5, color: "#666", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 8px", marginBottom: 8 } }, "各取引の株数をそのまま空売り: " + _ladderPrev + " ※推奨系（推奨α±X・推奨基本α値）の実効αは記録ごと（日付時点）に変わります。実効α＝基底α（応用〇の記録は応用α値・候補αの掃引対象外）＋浮き足加算（浮き足〇の記録・浮き値÷2切捨て・常時）"),
      manCalc ? React.createElement(React.Fragment, null,
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 } },
          _card("通算損益", (function() { var _m = manCalc.sum, _rf = manCalc.sumRef; return React.createElement("span", { style: { whiteSpace: "normal" } }, React.createElement("span", { style: { color: _elPnlColor(_m), fontSize: 17, whiteSpace: "nowrap" } }, _elPnlFmt(_m)), (_rf ? React.createElement("span", { style: { color: _elPnlColor(_m), fontSize: 17, marginLeft: 2, whiteSpace: "nowrap", display: "inline-block" } }, "（" + _elPnlFmt(_m + _rf) + "）") : null)); })(), manCalc.n + "記録中 建玉あり" + manCalc.builtRecN + "件"),
          _card("差額", _uplMan == null ? "—" : (function() { return React.createElement("span", { style: { whiteSpace: "normal" } }, React.createElement("span", { style: { color: _elPnlColor(_uplMan), fontSize: 17, whiteSpace: "nowrap" } }, _elPnlFmt(_uplMan)), (_uplManRef ? React.createElement("span", { style: { color: _elPnlColor(_uplMan), fontSize: 17, marginLeft: 2, whiteSpace: "nowrap", display: "inline-block" } }, "（" + _elPnlFmt(_uplMan + _uplManRef) + "）") : null)); })(), "シミュ−従来"),
          _card("1記録あたり", manCalc.builtRecN ? _pnlNode(Math.round(manCalc.sum / manCalc.builtRecN)) : "—", "建玉ありの平均"),
          _card("建玉あり", manCalc.builtRecN + "件", "全取引未到達・×見送り除く"),
          _card("勝率", _winRate == null ? "—" : React.createElement("b", { style: { color: _winRate >= 0.5 ? "#1E8449" : "#B45309" } }, Math.round(_winRate * 100) + "%"), "建玉あり中プラス"),
          _card("損切り率", _stopRate == null ? "—" : React.createElement("b", { style: { color: _stopRate <= 0.3 ? "#1E8449" : _stopRate <= 0.5 ? "#B45309" : "#C0392B" } }, Math.round(_stopRate * 100) + "%"), manCalc.stopRecN + "件／建玉あり"),
          _card("1株あたり損益", _perShare == null ? "—" : React.createElement("b", { style: { color: _elPnlColor(_perShare) } }, (_perShare >= 0 ? "+" : "") + _perShare + "円"), "通算÷" + _manTot + "株")),
        _kbMasterTable(manCalc, "シミュレーション・" + _manTot + "株", _manTot, _simCutInfo),
        _notesLine(manCalc)) : null);
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
    body = React.createElement(React.Fragment, null,
      React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700 } }, "合計"),
        React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff", verticalAlign: "middle" } },
          React.createElement("input", { type: "text", inputMode: "numeric", value: total, onChange: function(e) { setTotal(e.target.value); setAutoExp(null); }, style: Object.assign({}, _inpSty, { border: "none", borderRadius: 0 }) }),
          _stepBtn(function() { _stepTotal(100); }, function() { _stepTotal(-100); })),
        React.createElement("span", { style: { fontSize: 11 } }, "株（100株刻み" + (totalN ? "・実効" + totalN + "株" : "") + "）")),
      React.createElement("div", { style: { fontSize: 11.5, fontWeight: 700, color: "#0F766E", marginBottom: 6 } }, "推奨基本α値＝", _recoBaseAlpha != null ? React.createElement("b", null, _recoBaseAlpha + "円") : React.createElement("span", { style: { color: "#94A3B8" } }, "データ不足"), (_recoBaseAlpha != null && _recoBasePick && _recoBasePick.status === "na") ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#B45309", marginLeft: 4 } }, "（参考・件数不足）") : null),
      React.createElement("div", { style: { fontSize: 9.5, color: "#aaa", marginBottom: 8 } }, "第1・第2取引の各αを候補（絶対値0/3/5・各日の推奨基本α・推奨α±1〜±5）から選び、総株数を100株刻みで2取引に配分して総当たり。探索・表示のα＝基本α部分＝浮き足〇/追加α〇の記録は浮き足加算・上乗せセレクタ分を加えた実効αで評価。" + (autoRes && autoRes.noRecoN ? " ※推奨α不明" + autoRes.noRecoN + "件は推奨α系の候補を建てない扱い（絶対値0/3/5は建てる）。" : "")),
      _bestTxt,
      (function() {   // 選択配分のマスター表＋注記行（判定不可/推奨α不明/×見送り件数＝手動と同じ_notesLine・従来は自動配分に注記が無かった）2026-07-04c
        if (!_selCb) return null;
        var _selCalc = _elKabuLadderCalc(pool, aiOf, _autoTiersOfFor(_selCb));
        return React.createElement(React.Fragment, null,
          _kbMasterTable(_selCalc, (_selCb === (autoRes && autoRes.best) ? "★最適配分・" : "選択配分・") + totalN + "株", totalN),
          _notesLine(_selCalc));
      })(),
      _rankRows.length ? _elv2Table(["順位", "配分（α方式×株数）", "建玉あり", "損切り", "通算損益", ""], _rankRows)
        : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "12px 0", fontSize: 11 } }, "合計株数を入力してください"));
  }
  var _periodLbl = ({ today: "本日", "1w": "1週間", "1m": "1か月", "3m": "3か月", "6m": "6か月", "1y": "1年", all: "全期間" })[period] || "全期間";
  var _targetList = React.createElement("div", { style: { marginBottom: 10 } },   // 期間で絞った対象取引をまず表示（＝シミュの母数）2026-07-03q
    React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E", marginBottom: 4 } }, "対象取引（" + pool.length + "件）",
      React.createElement("span", { style: { fontSize: 9, fontWeight: 600, color: "#94A3B8", marginLeft: 6 } }, _periodLbl + "・シミュの母数")),
    React.createElement("div", { style: { maxHeight: 300, overflowY: "auto", border: "1px solid #E2E8F0", borderRadius: 8, padding: "2px 4px" } }, _elOsTradeMini(pool, aiOf, { plain: true })));
  var _modeToggle = React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 } },   // 手動/自動トグルは対象取引の下へ移動（母数を確認してから方式を選ぶ）2026-07-04d
    _pill(mode === "manual", "✍ 手動ラダー", function() { setMode("manual"); }, "#0F766E"),
    _pill(mode === "auto", "🤖 自動配分", function() { setMode("auto"); setAutoExp(null); }, "#0F766E"));
  return React.createElement("div", null, head,
    _targetList,
    _modeToggle,
    React.createElement("div", { style: { fontSize: 9, color: "#aaa", margin: "0 0 8px" } }, "手仕舞い＝実際のH1（推奨基本α・応用α・%シミュと同一基準・損切りルール適用後）／損切り＝「シミュ損切」列の値で取引ごと独立（手動ラダーで『推奨基本α値+X円』を設定するとその記録日時点の推奨基本α+X＝橙字・空欄や推奨α不明・自動配分は各記録の実際の損切り値＝灰字）／×見送り・H1判定不可の取引は建てない（既存シミュと同じ母数ルール）。損益は空売り・100株換算×株数按分。※損益は本日の損益データ欄と同じ（）外/（）内方式（○のみH1本算入＝（）外／△・損切り済はEP想定額を（）外にしH1まで保有した場合との差を（）内へ／×・未設定・EP×はEP想定額のみで（）内なし）。金額の（括弧内）＝（）内合計（○△を含む参考額）。従来列＝損益データ欄と同じ（）外/（）内理論値（採用α・100株当たり）を総株数に単純按分した値（シミュの取引構成・第1/第2取引とは無関係）。シミュ列の下段＝取引ごとの内訳（（）外・建たなかった取引は—）。"),
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
  var _uP = useState("all"), period = _uP[0], setPeriod = _uP[1];
  var _uRF = useState(""), rngFrom = _uRF[0], setRngFrom = _uRF[1];
  var _uRT = useState(""), rngTo = _uRT[0], setRngTo = _uRT[1];
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
  var _uAlS = useState("base"), alphaSub = _uAlS[0], setAlphaSub = _uAlS[1];   // α値タブのサブタブ: 基本α(base)/追加α(add)/共通ツール(tools) 2026-06-29（タブ内サブタブ式＝基本αと追加αを別画面に分離）
  var _uOsF = useState("no"), osDistFil = _uOsF[0], setOsDistFil = _uOsF[1];   // 追加α母数トグル: 全記録(all)/基本α母数=×+未選択(no・既定)/追加α〇のみ(yes)。集計KPI・OS分布・損切り・未達で共有。既定×+未選択＝〇(高α)混入で損切り率/未達率が上振れするのを回避 2026-07-01
  // OS値分布の基準トグルは2026-07-13に廃止（ユーザー承認③）＝実現OS(白枠・統計/棒クリックの主基準)と生の最高OS(色棒)をヒストグラムに同時表示（案A重ね棒・濃淡逆）。α目安(7割=α)は従来どおり生固定。
  var _osValFn = function(s) { return _elOsMaxFiltered(s); };   // OS値分布の主基準＝実現OS（×/損切りで打ち切り）。生(_elOsMaxAll)は各所でrawVals/併記として追加 2026-07-13
  var osValMode = "real", setOsValMode = null;   // 互換用の残置（消費側の分岐は撤去済み・シグネチャ互換のため）
  var _uFS = useState("other"), floatSub = _uFS[0], setFloatSub = _uFS[1];   // シグナル内サブタブ: 底抜け前足浮き(float)/その他(other・既定)。選択中シグナルの記録を数値根拠(底抜け前足浮き＝_elHasNumReason)で二分し、集計/α値/損切り/未達/深掘りの母数を分ける（OS値分布ほか）。既定=その他 2026-07-02
  var _uDS = useState({}), detScopes = _uDS[0], setDetScopes = _uDS[1];   // 詳細スコープ（セクション独立 2026-07-08e・旧detSubサブタブ→各セクションのプルダウンへ）: secKey→"all"(まとめて)/"__cmp__"(詳細ごと比較)/詳細名/"__none__"(未分類)。銘柄/シグナル切替でリセット。候補が無いシグナルではプルダウン非表示＝従来と同一母数。
  var _uAR = useState("all"), alphaReasonFil = _uAR[0], setAlphaReasonFil = _uAR[1];   // α値タブ 根拠セレクタ（2026-07-06）: 全体(all)/各根拠/根拠なし(__none__)で基本α・共通ツールの母数を絞る第4の軸。追加αタブは④⑤根拠別を内蔵するため対象外。全体選択時は従来と完全同一。
  var _uDTM = useState(false), detTagMode = _uDTM[0], setDetTagMode = _uDTM[1];   // 集計タブ銘柄側の分析軸: false=シグナル別(既定)/true=詳細タグ別（銘柄内・全シグナル横断で選んだsigDetailタグの記録を分析）2026-07-07
  var _uSDT = useState(null), selDetTag = _uSDT[0], setSelDetTag = _uSDT[1];   // 詳細タグ別モードの選択タグ（"セクションキー|タグ名"）
  var _uSGT = useState("uki"), sigSub = _uSGT[0], setSigSub = _uSGT[1];   // 📡シグナル総合ピルのサブタブ: uki(浮き足%)/tod(時間帯)/dow(曜日)/rn(RN) 2026-07-12
  var _uJF = useState(false), anaJul = _uJF[0], setAnaJul = _uJF[1];   // 分析母数トグル（承認③+ 2026-07-12）: true=7月以降（EMA修正後）のみを記録帳全体（推奨・表・一覧）の母数に。既定false=全期間（従来どおり不変）。
  var _selSty = { padding: "5px 8px", fontSize: 11, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#333" };
  var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
  var _ai = function(r) { return _elAlphaInfo(r, data); };
  // 2026年6月以前（EMAの位置に間違い）の損益は参考程度 2026-07-12: 境界=2026-07-01（月別キーは2026-07）。上部バナー＋期間別表の該当行に「※参考」。
  var _elIsEmaRefPeriod = function(k, g) { return (g === "month") ? (String(k) < "2026-07") : (String(k) < "2026-07-01"); };
  var _elEmaRefNote = function(isRef) { return isRef ? React.createElement("span", { title: "6月以前の損益はEMAの位置に間違いがあったため参考程度", style: { fontSize: 8.5, color: "#B45309", fontWeight: 700, marginLeft: 4, whiteSpace: "nowrap" } }, "※参考") : null; };
  var _elPreEmaN = function(rs) { var n = 0; (rs || []).forEach(function(r) { if (((r && r.date) || "") < "2026-07-01") n++; }); return n; };
  var _elPreEmaBadge = function(rs) {   // 推奨カード用（承認③ 2026-07-12）: 母数にEMA修正前(6月以前)の記録が混ざっている件数を琥珀で明示。母数トグル「7月〜」ON時は自然に消える。
    var n = _elPreEmaN(rs);
    if (!n) return null;
    return React.createElement("span", { title: "母数に2026年6月以前（EMAの位置修正前＝参考期）の記録が含まれます。推奨値はこの分の影響を受けます（ヘッダーの母数トグル「7月〜」で除外できます）", style: { display: "inline-flex", alignItems: "center", fontSize: 9, fontWeight: 800, color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 4, padding: "1px 6px", marginLeft: 4, verticalAlign: "middle", whiteSpace: "nowrap" } }, "6月以前" + n + "件");
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
  // 分析母数トグル（承認③+ 2026-07-12）: 「7月〜」ON時はEMA修正後（2026-07-01以降）の記録だけを記録帳全体の母数にする。顔ぶれ(_tickerList)は固定のまま。
  var _anaRecs = anaJul ? allRecs.filter(function(r) { return ((r && r.date) || "") >= "2026-07-01"; }) : allRecs;
  var _periodRecs = (period === "range")
    ? _anaRecs.filter(function(r) { var d = r.date || ""; return d && (!rngFrom || d >= rngFrom) && (!rngTo || d <= rngTo); })
    : _elFilterPeriod(_anaRecs, period);
  // 銘柄タブのバッジ件数: 選択期間内・銘柄未限定の記録数（顔ぶれは固定、件数だけ期間連動）
  var _cntByStock = (function() { var m = {}; _periodRecs.forEach(function(r) { if (r.stock) m[r.stock] = (m[r.stock] || 0) + 1; }); return m; })();
  var filtered = (_isAllStock || _isSigTotal) ? _periodRecs : _periodRecs.filter(function(r) { return r.stock === _selStock; });
  // 合計額算入: includeInTotal===false の記録は集計/分析の母集団から除外（一覧 filtered は全件のまま）。2026-06-18
  // _v2recsAll=銘柄/期間で絞ったv2算入記録（追加α〇/×/未選択は混在）＝推奨基本α/追加αタブはこれを使い全体トグルと独立。
  var _v2recsAll = filtered.filter(function(r) { return _epIsV2(r.signal) && _elInclTotal(r.signal); });
  // v2recs=全体トグル（追加α 全部/〇/×/未選択）で絞った分析母数。集計・損益・OS値・損切り・シグナル別等の分析タブが従う 2026-06-24。
  var v2recs = (addAlphaFil === "all") ? _v2recsAll : _v2recsAll.filter(function(r) { return addAlphaFil === "yes" ? _elSpecialUsed(r.signal) : !_elSpecialUsed(r.signal); });   // 2状態化 2026-07-13: yes=応用あり／no=応用なし（旧×+未選択を統合）
  // 旧記録件数は算入フラグと独立に数える（除外した新形式記録を「旧記録」に混ぜない）。2026-06-18
  var oldCnt = filtered.filter(function(r) { return !_epIsV2(r.signal); }).length;
  // 未達タブのバッジ件数は、選択中シグナルの母数で数える（シグナル軸の下で _missCnt を定義 2026-07-01）。
  // 記録帳のサブタブ集合は表示中ピルで出し分け: 全銘柄合算「💰損益」は集計/期間のみ・各銘柄タブはフル分析タブ＋未達（銘柄別＝全項目を分析する方針）。2026-06-22
  var _tabs = _isAllStock
    ? [["sum", "📊 集計"], ["period", "📆 期間"]]
    : [["sum", "📊 集計"], ["alpha", "📐 α値"], ["stop", "🛑 損切り"], ["miss", "❌ 未達"], ["period", "📆 期間"], ["deep", "🔬 深掘り"], ["sim", "🧮 シミュ"]];
  var _SIG_TABS = [["uki", "⚡ 浮き足%"], ["tod", "🕘 時間帯"], ["dow", "📅 曜日"], ["rn", "🔢 RN"]];   // 📡シグナル総合のサブタブ 2026-07-12
  var _byDateDesc = function(a, b) { return (b.date + (b.signal.time || "")).localeCompare(a.date + (a.signal.time || "")); };
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
  // 損益（期間別）テーブル＝全銘柄合算をday/week/monthで集計。各損益セルに合計＋平均を併記・損切り(件数/平均額/率)列・行タップでその期間の取引記録を展開。「損益」タブの集計ビュー頭 2026-06-22d。損益基準は_elTotAccum（取引/銘柄別記録と同一）。2026-07-09 EP損益/H1損益列を廃し「最終損益」1列に集約（＝旧H2損益・_elHold2TotPartsの（）外=○が途切れた所で手じまい/（）内=△含む・値は不変）。
  var _ovPnlTbl = function(rs, g) {
    var keyOf = function(ds) {
      if (g === "day") return ds;
      if (g === "month") return ds.slice(0, 7);
      var d = new Date(ds + "T00:00:00"); var mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return mon.getFullYear() + "-" + ("0" + (mon.getMonth() + 1)).slice(-2) + "-" + ("0" + mon.getDate()).slice(-2);
    };
    var labelOf = function(k) {
      if (g === "day") return k.slice(5) + "(" + _dow(k) + ")";
      if (g === "month") return k.replace("-", "/");
      var mon = new Date(k + "T00:00:00"); var fri = new Date(mon); fri.setDate(mon.getDate() + 4);
      return (mon.getMonth() + 1) + "/" + mon.getDate() + "〜" + (fri.getMonth() + 1) + "/" + fri.getDate();
    };
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
    var keys = Object.keys(byP).sort().reverse();
    if (!keys.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 12 } }, "v2記録なし");
    var oth = function(t) { return React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, t); };
    var otd = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
    // 最終損益・実現損益とも「1日あたり平均」＝合計÷日数(営業日数)に統一 2026-07-09（旧: 実現損益は1トレード平均avgLine→ユーザー要望で1日平均に）
    var avgDayLine = function(v, days) { if (!days || v == null) return null; var a = Math.round(v / days); return React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "1日平均" + (a >= 0 ? "+" : "") + a.toLocaleString()); };
    var pnlCell = function(v, cnt, ref, refCnt, days, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenNR(v, cnt, ref, refCnt), avgDayLine(v, days)), ex); };
    var realCell = function(v, cnt, days, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenN(v, cnt), avgDayLine(v, days)), ex); };
    var stopCell = function(st, ex) {
      if (!st || st.n === 0) return otd(React.createElement("span", { style: { color: "#bbb" } }, "—"), ex);
      return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
        React.createElement("span", { style: { fontWeight: 700, color: "#1E8449" } }, st.n + "件・" + (st.rate != null ? st.rate + "%" : "—")),
        React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "平均" + (st.avg != null ? st.avg.toLocaleString() : "—") + "円")), ex);
    };
    // 到達セル: EP到達件数（主）＋到達率（対 件数=全記録・小書き）2026-07-09
    var reachCell = function(rn, tot, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
      React.createElement("span", { style: { fontWeight: 700, color: "#9A3412" } }, rn + "件"),
      tot ? React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, Math.round(rn / tot * 100) + "%") : null), ex); };
    // 利確セル: 利益で手じまいした件数・率（旧勝率の位置・色分けは勝率と同じ緑/橙）2026-07-09
    var winTakeCell = function(wt, ex) {
      if (!wt || wt.rate == null) return otd(React.createElement("span", { style: { color: "#bbb" } }, "—"), ex);
      return otd(React.createElement("span", { style: { fontWeight: 700, color: wt.rate >= 50 ? "#1E8449" : "#B45309" } }, wt.n + "件・" + wt.rate + "%"), ex);
    };
    var rows = [];
    keys.forEach(function(k) {
      var x = byP[k], t = totOf(x), st = stopsOf(x), dn = _bizDaysIn(k), on = ovExp === k;
      rows.push(React.createElement("tr", { key: k, onClick: function() { setOvExp(on ? null : k); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
        otd(React.createElement("span", null, React.createElement("span", { style: { color: "#F97316", marginRight: 3, fontSize: 9 } }, on ? "▼" : "▶"), labelOf(k), _elEmaRefNote(_elIsEmaRefPeriod(k, g))), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
        otd(dn + "日", { fontWeight: 600, color: "#555" }),
        otd(x.length + "件", { fontWeight: 700 }),
        reachCell(reachOf(x), x.length),
        winTakeCell(winTakeOf(x)),
        stopCell(st),
        pnlCell(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, dn),
        realCell(t.real, t.realCnt, dn)));
      if (on) rows.push(React.createElement("tr", { key: k + "_d" }, React.createElement("td", { colSpan: 8, style: { padding: "4px 6px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
        React.createElement("div", { style: { fontSize: 10, color: "#9A3412", fontWeight: 700, margin: "2px 0 4px" } }, labelOf(k) + " の取引記録（" + x.length + "件）"),
        _recTable(x, "full", "ovp_" + k + "_", null))));
    });
    var tt = totOf(rs), bt = { borderTop: "2px solid #FB923C" };
    var _ovTotDays = keys.reduce(function(s, k) { return s + _bizDaysIn(k); }, 0);
    var totRow = React.createElement("tr", { key: "__ovtot__", style: { background: "#FFF7ED" } },
      otd("合計", Object.assign({ textAlign: "left", paddingLeft: 8, fontWeight: 800, color: "#555" }, bt)),
      otd(_ovTotDays + "日", Object.assign({ fontWeight: 700, color: "#555" }, bt)),
      otd(rs.length + "件", Object.assign({ fontWeight: 800 }, bt)),
      reachCell(reachOf(rs), rs.length, Object.assign({ fontWeight: 800 }, bt)),
      winTakeCell(winTakeOf(rs), Object.assign({ fontWeight: 800 }, bt)),
      stopCell(stopsOf(rs), bt),
      pnlCell(tt.hold2, tt.hold2Cnt, tt.hold2Ref, tt.hold2RefCnt, _ovTotDays, bt),
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
    var colN = mode === "day" ? 8 : 11;
    var body = [];
    shown.forEach(function(r) {
      var s = r.signal, a = _ai(r);
      var ek = keyPfx + r.stock + "_" + (s.id || s.time || "");
      var on = expKey === ek;
      var cells = [
        _td((on ? "▶ " : "") + r.date.slice(5) + "(" + _dow(r.date) + ")", { textAlign: "left", paddingLeft: 8, fontWeight: 700 }),
        _td(React.createElement("span", null, React.createElement("div", null, s.time || _dash, _minBarBadge(s)), _epIncompleteMark(s), _elCollMarkNode(data, r, _collScope), _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge(null, s)) : null), { color: "#666" }),
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
          _td(_epECell(s, a.alpha)),
          _td(entered
            ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 13 } }, "〇")
            : _elIsThru(s)
              ? React.createElement("span", { title: "スルー", style: { color: "#6B7280", fontWeight: 700, fontSize: 11 } }, "ス")
              : _elIsReview(s)
                ? React.createElement("span", { title: "要審議", style: { color: "#DB2777", fontWeight: 700, fontSize: 11 } }, "審")
                : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 13 } }, "×")),
          _td(React.createElement(React.Fragment, null, _elHold2AmtNode(s, a.alpha, a.cutLine), _elRideMiniNode(s, a.alpha, a.cutLine)), { background: "#FFFBF0" }),
          React.createElement("td", { key: "dtl", colSpan: 2, style: { padding: "4px 6px", textAlign: "left", fontSize: 11, borderTop: "1px solid #f0ede8", background: "#F8FBFE" } }, _elDetailFlowStack(s, a.alpha, a.cutLine))
        ]).concat([_td(entered ? _elRPnlDispW(realN, realN != null ? _profitGradeFromPnlReal(realN, 1) : null, 60) : _dash)]);
      }
      body.push(React.createElement("tr", { key: ek, onClick: function() { setExpKey(on ? null : ek); }, style: Object.assign({ background: on ? "#FFF7ED" : "transparent", cursor: "pointer" }, _elRowStyleWithColl(data, r, _collScope)) }, cells));
      if (on) body.push(React.createElement("tr", { key: ek + "_c" },
        React.createElement("td", { colSpan: colN, style: { padding: "4px 8px 8px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
          React.createElement(EntryLogCard, { record: r, data: data, collScope: _collScope, onEdit: function(rec) { setEditTarget(rec); }, onGoDate: onSelectDate }))));
    });
    var head = mode === "day"
      ? [_th("日付", { textAlign: "left", paddingLeft: 8 }), _th("時間"), _th("銘柄"), _th("OS"), _th("E"), _th("OS帯"), _th("H中最高値"), _th("実現結果")]
      : [_th("日付", { textAlign: "left", paddingLeft: 8 }), _th("時間"), _th("銘柄"), _th("シグナル", { textAlign: "left" }), _th("α値"), _th("E"), _th("取引"),
         _th("最終損益・詳細"), React.createElement("th", { key: "hh", colSpan: 2, style: { padding: "5px 6px", fontWeight: 700, borderBottom: "1px solid #E4DFD7", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A9186" } }, "OS・損益詳細"), _th("実現損益")];
    return React.createElement(React.Fragment, null,
      React.createElement(_HScrollBox, null,
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "transparent" } }, head)),
          React.createElement("tbody", null, body))),
      (function() {   // 時間かぶりの凡例（表示中に該当行がある時だけ・tooltipはスマホで見えないため明記）2026-07-07
        var _hasColl = shown.some(function(r) { return _elCollMarked(data, r, _collScope) || _elCollExcluded(data, r, _collScope); });
        if (!_hasColl) return null;
        return React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", padding: "4px 6px 0", lineHeight: 1.5 } },
          "凡例: ", React.createElement("b", { style: { color: "#B45309" } }, "※被り有"), "＝同日5分以内ペアの残した側（早い方／同時刻なら損益が小さい方＝合計に算入）／",
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
          _recTable(recs.slice().sort(_byDateDesc), "full", ek + "_r_"))));
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
  var _kpiBlockOf = function(rs) {
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
    return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 } },
      _kpiCard("件数", n + "件", "#333", "v2記録のみ" + (_collXN > 0 ? "・被り除外" + _collXN + "件" : "")),
      _kpiCard("E到達率", reach != null ? reach + "%" : "—", "#0369A1", "○" + ok + "・×" + x + "・未達" + miss),
      _kpiCard("E後の勝率", _ewin != null ? _ewin + "%" : "—", _ewin != null ? (_ewin >= 50 ? "#1E8449" : "#B45309") : "#bbb", "勝" + _wOk + "・負" + _wNg + (_wDr ? "・分" + _wDr : "") + "／E成立" + _ewinD + "件"),
      _kpiCard("最終損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), null, t.hold2Cnt + "件・○途切れで手じまい"),
      _kpiCard("損切り", (ss && ss.any || 0) + "回", ss && ss.any > 0 ? "#1E8449" : "#bbb", ss && ss.rate != null ? "率" + ss.rate + "%（想" + ss.plan + "・H1 " + ss.h1 + "・H2 " + ss.h2 + "）" : null),
      _kpiCard("×見送り", x + "件", x > 0 ? "#1E8449" : "#bbb", "×宣言後の到達"),
      _kpiCard("実現損益", _yenN(t.real, t.realCnt), null, t.realCnt + "件"),
      _kpiCard("1日あたり損益", _perDay != null ? (_elPnlFmt(_perDay) + "/日") : "—", _perDay != null ? _elPnlColor(_perDay) : "#bbb", "手じまい基準・" + _entDays + "日エントリー"));
  };
  // 銘柄別 集計タブの本体（KPI＋各分析セクション）。今月/全期間で同じ構成を共用＝引数の記録集合rsだけ差し替える。
  var _sumStockContent = function(rs) {
    return React.createElement(React.Fragment, null,
      _kpiBlockOf(rs),
      rs.length ? React.createElement(React.Fragment, null,
        _secH("📊 OS値の分析", "初動の強さ＝OS値の中央値・帯別成績とα設定の目安（重視すべきは平均でなく中央値＝α到達確率と直結）"), _elOsSectionV2(rs, _ai, _osValFn, osValMode, setOsValMode)) : null,
      rs.length >= 2 ? React.createElement(React.Fragment, null,
        _secH("📈 累積損益（記録順）", "最終損益/実現損益の累積推移・合計行と同一基準"), React.createElement(_elCumPnlSectionV2, { recs: rs, aiOf: _ai, data: data, scopeStock: _collScope })) : null,
      rs.length >= 2 ? React.createElement(React.Fragment, null,
        _secH("📉 連勝連敗・最大ドローダウン", "実現損益のストリークと最大DD（損失管理）"), _elStreakDDSectionV2(rs, _ai)) : null);
  };
  // 集計「今月」: 銘柄スコープ（全銘柄合算では全銘柄）の全期間v2記録（top期間ドロップダウンに依存しない）からその月のみ抽出。月は←→で移動・既定は当月。全銘柄合算の集計タブは常に今月（2026-06-26）。
  var _stockAllV2 = _anaRecs.filter(function(r) { return (_isAllStock || r.stock === _selStock) && _epIsV2(r.signal) && _elInclTotal(r.signal) && (addAlphaFil === "all" || (addAlphaFil === "yes" ? _elSpecialUsed(r.signal) : !_elSpecialUsed(r.signal))); });   // 母数トグル追従（2状態化 2026-07-13: yes=応用あり/no=応用なし）
  var _curSumYM = sumYM || (function() { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1 }; })();
  var _sumMonthRecs = _stockAllV2.filter(function(r) { var p = (r.date || "").split("-"); return (+p[0]) === _curSumYM.y && (+p[1]) === _curSumYM.m; });
  var _shiftSumM = function(delta) { var m = _curSumYM.m + delta, y = _curSumYM.y; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } setSumYM({ y: y, m: m }); setExpKey(null); };
  var _sumNavBtn = function(lbl, fn) { return React.createElement("button", { onClick: fn, style: { padding: "3px 14px", fontSize: 16, fontWeight: 800, background: "#fff", border: "1px solid #E4DFD7", borderRadius: 9, cursor: "pointer", color: "#9A3412" } }, lbl); };
  var _sumMonthNav = React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "6px 0 10px" } },
    _sumNavBtn("←", function() { _shiftSumM(-1); }),
    React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: "#9A3412", minWidth: 170, textAlign: "center" } }, _curSumYM.y + "年" + _curSumYM.m + "月データ早見"),
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
  var _sigGroups = _buildSigGroups(v2recs);
  var _sigGroupsAll = _buildSigGroups(_v2recsAll);   // トグル非適用＝推奨基本αパネルの母数固定用 2026-06-24i
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
  var _groupPanel = function(recs, stkKey, fixedRecs, useDet) {
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
    // デュアル評価（承認① 2026-07-12）: 最終損益基準の並走pick＋6月以前混入バッジ（承認③）。実母数（浮き足/RN/追加α除外）でバッジ件数を出す。
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
        _kpiCard("一番引っ張った損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), null, "○で最深（○△）・" + t.hold2Cnt + "件"),
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
      // 追加α母数トグル〇のとき: 推奨基本α詳細は畳んで（要約はKPIカードに常時表示）、代わりに推奨追加α詳細（加算値別の総当たり）をフル表示。×/全記録・前足浮きタブは従来どおり基本α詳細をフル表示。2026-07-03
      (!_floatMode && osDistFil === "yes")
        ? [_elCard(_gDet ? _detCtlRow("gp_ba", _baRecs) : null,
            React.createElement(_SNCollapse, { title: "🔬 推奨基本α 詳細データ（推奨値の根拠・タップで展開）", render: function() { return _bodyOf("gp_ba", _baRecs, function(_drs) { return _elBaseAlphaDetailV2(_drs, _ai, _holiSet); }); } })),
            _secH("🔬 推奨応用α 詳細データ（応用〇・手仕舞い基準）", "応用〇の記録だけを母数に、独立α値0〜20円を手仕舞い基準で評価（★＝到達50%・損切り(最終)20%以下・E成立条件で平均最終損益最大）。母数＝応用〇（浮き足・RN除外）", _ctl("gp_baAdd", _baRecs)),
            _bodyOf("gp_baAdd", _baRecs, function(_drs) { return _elTotalAlphaSectionV2(_drs, _ai, _holiSet); })]
        : [_secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝α別の総当たり（各αの到達率/件数/損切り率/H1勝率/スコア）", _ctl("gp_ba", _baRecs)),
            _bodyOf("gp_ba", _baRecs, function(_drs) { return _elBaseAlphaDetailV2(_drs, _ai, _holiSet); })],
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
            if (_cn <= 0) return null;
            return React.createElement("div", { style: { marginBottom: 6 } },
              React.createElement("button", { type: "button", onClick: function(){ setCollOnly(!collOnly); },
                style: { padding: "3px 11px", fontSize: 11, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: "1px solid " + (collOnly ? "#6D28D9" : "#C4B5FD"), background: collOnly ? "#6D28D9" : "#F5F3FF", color: collOnly ? "#fff" : "#6D28D9" } },
                (collOnly ? "✓ " : "") + "被り除外のみ（" + _cn + "件）"),
              collOnly ? React.createElement("span", { style: { marginLeft: 8, fontSize: 10, color: "#6D28D9", fontWeight: 700 } }, "時間かぶりで合計から除外した記録だけ表示中（タップで解除）") : null);
          })(),
          _recTable((collOnly ? _fr.filter(function(r){ return _elCollExcluded(data, r, _collScope); }) : _fr).slice().sort(_byDateDesc), "full", "gp_" + (_dv === "all" ? "" : _dv + "_")));
      })]);
  };

  // ===== タブ本体 =====
  var _tabBody;
  if (_isSigTotal) {
    // 📡シグナル総合＝全銘柄共通の分析（銘柄別に分ける必要のないデータ）。母数は常に全銘柄(_v2recsAll)。2026-07-12
    _tabBody = (sigSub === "tod")
      ? _cardify([_secH("🕘 時間帯別の成績（寄り付き重視・全銘柄）"), _elTimeOfDaySectionV2(_v2recsAll, _ai)])
      : (sigSub === "dow")
      ? _cardify([_secH("📅 曜日別の成績（全銘柄）"), _elDowSectionV2(_v2recsAll, _ai)])
      : (sigSub === "rn")
      ? _cardify([_secH("🔢 RNまたぎ加算の分析（全銘柄共通）", "※最終損益（手じまい）基準。現実（RN込み）vs 反実仮想（RN加算を外した場合）＋RN値別。件数が薄いうちは（仮）表示"), _elRnBoardV2(_v2recsAll, _ai)])
      : _cardify([_secH("⚡ 浮き足加算率の最適化（全銘柄共通）"), _elUkiPctBoardV2(_v2recsAll, _ai)]);
  } else if (view === "sum") {
    if (_isAllStock) {
      // KPI早見だけ「今月」＝〇年〇月データ早見（←→で月移動）。「全体損益（期間別）」以降（累積・連勝連敗）は今月縛り無し＝v2recs（top期間ドロップダウン準拠）。2026-06-26。
      _tabBody = _cardify([
        _sumMonthNav,
        _sumMonthRecs.length ? _kpiBlockOf(_sumMonthRecs)
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, _curSumYM.y + "年" + _curSumYM.m + "月の記録はありません（←→で月を移動）"),
        [
          _secH("💰 全体損益（期間別）", "全銘柄合算（今月縛り無し）。下のボタンで日別/週別/月別を切替。最終損益＝期待度○が途切れた所で手じまい・（）内=△含む（旧H2損益と同一基準・取引・銘柄別記録と同一・v2記録のみ）"),
          React.createElement("div", { style: { display: "flex", marginBottom: 8 } },
            React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 10, padding: 3, gap: 2 } },
              [["day", "日別"], ["week", "週別"], ["month", "月別"]].map(function(g) {
                var on = (gran === "custom" ? "week" : gran) === g[0];
                return React.createElement("button", { key: g[0], onClick: function() { setGran(g[0]); },
                  style: { padding: "5px 14px", fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? "#9A3412" : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none", whiteSpace: "nowrap" } }, g[1]);
              }))),
          _ovPnlTbl(v2recs, gran === "custom" ? "week" : gran)],
        v2recs.length >= 2 ? [
          _secH("📈 累積損益（記録順）", "最終損益/実現損益の累積推移・合計行と同一基準"), React.createElement(_elCumPnlSectionV2, { recs: v2recs, aiOf: _ai, data: data, scopeStock: _collScope })] : null,
        v2recs.length >= 2 ? [
          _secH("📉 連勝連敗・最大ドローダウン", "実現損益のストリークと最大DD（損失管理）"), _elStreakDDSectionV2(v2recs, _ai)] : null]);
    } else {
      // 銘柄別の集計＝選択中シグナルの総合パネル（旧🎯シグナル別タブを昇格・上のシグナル軸で切替）。母数は選択中シグナル×サブタブ（前足浮き/その他）の固定母数（_selSigRecsScoped）。推奨基本α/追加αカードだけはシグナル全体（_selSigRecs）で算出＝サブタブ間で一貫。2026-07-01→前足浮き対応 2026-07-02
      // 分析軸トグル（2026-07-07）: 🎯シグナル別（従来）／🏷詳細タグ別（銘柄内・全シグナル横断で選んだ詳細タグの記録を _groupPanel で分析）。詳細タグが1件も無い銘柄ではトグル非表示＝従来どおり。
      var _detTagToggle = _hasDetTags ? React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "分析軸:"),
        [["sig", "🎯 シグナル別", false], ["det", "🏷 詳細タグ別", true]].map(function(kv) {
          var on = detTagMode === kv[2];
          return React.createElement("button", { key: kv[0], onClick: function() { setDetTagMode(kv[2]); if (kv[2]) setFloatSub("other"); setExpKey(null); },
            style: { padding: "4px 12px", fontSize: 11, fontWeight: 700, borderRadius: 14, cursor: "pointer", whiteSpace: "nowrap", border: "1px solid " + (on ? "#9A3412" : "#E0DAD1"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#6B6459" } }, kv[1]);
        }),
        React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "詳細タグ別＝この銘柄の全シグナル横断・件数は重複しうる")) : null;
      if (detTagMode && _hasDetTags) {
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
      if (_alSel === "base") {
        _alBody = [
          _alZoneHead("#0369A1", "#F0F9FF", "#BAE6FD", "基本αゾーン ― まず取る土台（最低限とる利幅）", _alBaseSum),
          _secH("🎯 成立率の目安（OS値→α分位）", "OS値（OS1〜3最高）の分位から、各成立率に対応するαの目安。基本αを決める前の“α候補レンジ”。分位は" + (_floatMode ? "浮き足" : "その他") + "の母数（" + _alReasonRecsScoped.length + "件" + (_reasonSel !== "all" ? "・根拠「" + _reasonLabel + "」" : "") + "）", _detCtl("al_pctl", _alReasonRecsScoped)),
          _detBody("al_pctl", _alReasonRecsScoped, function(_drs) { return _elOsAlphaPctlTableV2(_drs); }),
          _secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝α別の総当たり（各αの到達率/件数/損切り率/H1勝率/スコア）。基本αはシグナル共通母数で算出" + (_reasonSel !== "all" ? "（根拠「" + _reasonLabel + "」で絞込）" : ""), _detCtl("al_baD", _alReasonRecsFull)),
          _detBody("al_baD", _alReasonRecsFull, function(_drs) { return _elBaseAlphaDetailV2(_drs, _ai); })];
      } else if (_alSel === "add") {
        // 前足浮きタブ＝底抜け前足浮き（数値根拠）専用の追加α分析（前足浮き値の何%を追加αにすべきか）。その他タブ＝通常の追加α分析。
        // 【2026-07-13 刷新・ユーザー承認】根拠セレクタを追加αタブにも適用（旧④⑤根拠別は撤去）＋詳細データ（日付別・手仕舞い基準）を新設。
        var _alHoliSet = _buildHolidayDateSet(data.trades, custom.eventCategories);
        _alBody = _floatMode
          ? [_alZoneHead("#9A3412", "#FFF7ED", "#FED7AA", "浮き足加算αゾーン ― 前足浮き（浮き値×採用加算率・推奨%/既定50%）", null),
              _elCard(_detCtlRow("al_float", _selSigRecs),
              _detBody("al_float", _selSigRecs, function(_drs) {
                return (_elFloatReasonSectionV2(_drs, _ai, data, _secH, _alPick, { expKey: expKey, setExpKey: setExpKey, onEdit: function(rec) { setEditTarget(rec); }, onGoDate: onSelectDate })
                  || React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "浮き足〇（浮き値入り）の記録がありません"));
              }))]
          : [_alZoneHead("#9A3412", "#FFF7ED", "#FED7AA", "応用αゾーン" + (_reasonSel !== "all" ? "（根拠「" + _reasonLabel + "」）" : ""), _alAddSum),
              _secH("🔬 推奨応用α 詳細データ（応用〇・手仕舞い基準）", "応用〇の記録だけを母数に、独立α値0〜20円を前提損切り値で一律に当て手仕舞いで評価（★＝到達50%・損切り(最終)20%以下・E成立条件で平均最終損益（1件あたり）最大）。母数＝応用〇（浮き足・RN除外）" + (_reasonSel !== "all" ? "（根拠「" + _reasonLabel + "」で絞込）" : ""), _detCtl("al_totA", _alReasonRecsFull)),
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
    _tabBody = React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 10, color: "#9A3412", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "5px 9px", marginBottom: 8 } }, "🎯 期間タブはこの銘柄の全シグナル合算（時系列の俯瞰）。上のシグナル軸の選択では絞り込まれません。"), _elWeeklyTargetSummaryV2(v2recs, _ai, data, _collScope), (function() {
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
        return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 10 } },
          _kpiCard("件数", rs.length + "件", "#333", (function() { var _cn = _elCollExclCountRecs(data, rs, _collScope); return _cn > 0 ? "被り除外" + _cn + "件" : null; })()),
          _kpiCard("実現損益", _yenN(t.real, t.realCnt), null, t.realCnt + "件"),
          _kpiCard("最終損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), null, t.hold2Cnt + "件・○途切れで手じまい"),
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
        var _crecs = v2recs.filter(function(r) { return (!cFrom || r.date >= cFrom) && (!cTo || r.date <= cTo); });
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
      v2recs.forEach(function(r) { var k = _keyOf(r.date); (_byP[k] = _byP[k] || []).push(r); });
      var _keys = Object.keys(_byP).sort().reverse();
      if (!_keys.length) return _cardify([_secH("📆 期間集計"), _granBtns, React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "v2記録なし")]);
      var _chartKeys = _keys.slice().reverse();
      var _metInfo = { real: { label: "実現損益", get: function(t) { return t.real || 0; } }, h2: { label: "最終損益", get: function(t) { return t.hold2 || 0; } } };
      var _mi = _metInfo[chartMet] || _metInfo.h2;   // 旧plan/h1選択の残存stateは手じまいへフォールバック 2026-07-09
      var _xt = [], _step = Math.max(1, Math.ceil(_chartKeys.length / 6));
      var _per = _chartKeys.map(function(k, i) { var t = _periodTot(_byP[k]), rr = _ratesOf(_byP[k]); if (i % _step === 0 || i === _chartKeys.length - 1) _xt.push({ i: i, label: _labelOf(k) }); return { label: _labelOf(k), value: _mi.get(t), win: rr.takeRate }; });   // 破線=利確(最終損益>0)に統一 2026-07-09
      var _cum = [], _cs = 0; _per.forEach(function(p) { _cs += p.value; _cum.push(_cs); });
      var _dayBy = {}; v2recs.forEach(function(r) { (_dayBy[r.date] = _dayBy[r.date] || []).push(r); });
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
      var _rows = [];
      _keys.forEach(function(k) {
        var rs = _byP[k], t = _periodTot(rs), rr = _ratesOf(rs), dn = _bizDaysIn(k), _reach = rs.length - rr.miss, on = perExp === k;
        _rows.push(React.createElement("tr", { key: k, onClick: function() { setPerExp(on ? null : k); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
          _tdP(React.createElement("span", null, React.createElement("span", { style: { color: "#F97316", marginRight: 3, fontSize: 9 } }, on ? "▼" : "▶"), _labelOf(k), _elEmaRefNote(_elIsEmaRefPeriod(k, gran))), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
          _tdP(dn + "日", { fontWeight: 600, color: "#555" }),
          _tdP(rs.length + "件", { fontWeight: 700 }),
          _tdP(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, React.createElement("span", { style: { fontWeight: 700, color: "#9A3412" } }, _reach + "件"), rs.length ? React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, Math.round(_reach / rs.length * 100) + "%") : null)),
          _tdP(rr.takeRate != null ? React.createElement("span", { style: { fontWeight: 700, color: rr.takeRate >= 50 ? "#1E8449" : "#B45309" } }, rr.take + "件・" + rr.takeRate + "%") : React.createElement("span", { style: { color: "#bbb" } }, "—")),
          _tdP(rr.stop + "%", { color: rr.stop > 0 ? "#1E8449" : "#bbb", fontWeight: rr.stop > 0 ? 700 : 400 }),
          _tdP(rr.soft + "%", { color: rr.soft > 0 ? "#B45309" : "#bbb", fontWeight: rr.soft > 0 ? 700 : 400 }),
          _tdP(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), (dn && t.hold2 != null) ? React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "1日平均" + (Math.round(t.hold2 / dn) >= 0 ? "+" : "") + Math.round(t.hold2 / dn).toLocaleString()) : null)),
          _tdP(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenN(t.real, t.realCnt), (dn && t.real != null) ? React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "1日平均" + (Math.round(t.real / dn) >= 0 ? "+" : "") + Math.round(t.real / dn).toLocaleString()) : null))));
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
  } else if (view === "sim") {
    // 🧮 シミュタブ 2026-07-03: 株数シミュ（建て株数ラダーの空売りバックテスト）をα値タブ④から独立タブへ昇格（ユーザー決定＝案A・深掘りの右）。シミュ母数＝内訳スコープ（前足浮き/その他）・推奨αの算出は銘柄全体（全シグナル）＝日別ページ/記録フォームと一致 2026-07-03t（旧: baseRecs=_selSigRecsでシグナル別→値ズレのため銘柄全体へ）。
    _tabBody = _selSigRecs.length ? _cardify([
      React.createElement("div", { style: { background: "#F0FDFA", border: "1px solid #99F6E4", borderLeft: "4px solid #0F766E", borderRadius: 11, padding: "8px 12px", marginBottom: 6 } },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#0F766E" } }, "株数シミュ ― 建て株数ラダーの空売りバックテスト")),
      _elCard(_detCtlRow("sim", _selSigRecsScoped),
      _detBody("sim", _selSigRecsScoped, function(_drs) {
        return _drs.length ? React.createElement(_elKabuLadderSimV2, { recs: _drs, baseRecs: (_isAllStock ? _selSigRecs : allRecs.filter(function(r) { return r && r.stock === _selStock; })), aiOf: _ai, floatMode: _floatMode })
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

  var _rngISty = { padding: "5px 7px", fontSize: 12, border: "1px solid #ddd", borderRadius: 6, background: "#fff", color: "#1a1a1a" };
  var _rngBtn = function(lbl, f, t) {
    return React.createElement("button", { onClick: function() { setRngFrom(f); setRngTo(t); }, style: { padding: "4px 10px", fontSize: 11, fontWeight: 700, background: "#fff", border: "1px solid #FED7AA", borderRadius: 14, cursor: "pointer", color: "#9A3412" } }, lbl);
  };
  var _rngBar = (period !== "range") ? null : (function() {
    var _p2 = function(n) { return (n < 10 ? "0" : "") + n; };
    var _iso = function(dt) { return dt.getFullYear() + "-" + _p2(dt.getMonth() + 1) + "-" + _p2(dt.getDate()); };
    var _now = new Date();
    var _today = _iso(_now);
    var _mFrom = _iso(new Date(_now.getFullYear(), _now.getMonth(), 1));
    var _pmFrom = _iso(new Date(_now.getFullYear(), _now.getMonth() - 1, 1));
    var _pmTo = _iso(new Date(_now.getFullYear(), _now.getMonth(), 0));
    var _ymVal = (rngFrom && rngTo && rngFrom.slice(8) === "01" && rngFrom.slice(0, 7) === rngTo.slice(0, 7) && rngTo === _iso(new Date(+rngFrom.slice(0, 4), +rngFrom.slice(5, 7), 0))) ? rngFrom.slice(0, 7) : "";
    var _setYM = function(ym) {
      if (!ym) { setRngFrom(""); setRngTo(""); return; }
      setRngFrom(ym + "-01");
      setRngTo(_iso(new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0)));
    };
    return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 6, padding: "7px 9px", marginBottom: 8 } },
      React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#9A3412" } }, "🗓 期間指定"),
      React.createElement("input", { type: "month", value: _ymVal, onChange: function(e) { _setYM(e.target.value); }, title: "月を選ぶと その月の1日〜末日 が入る", style: _rngISty }),
      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#FDBA74" } }, "｜"),
      React.createElement("input", { type: "date", value: rngFrom, max: rngTo || _today, onChange: function(e) { setRngFrom(e.target.value); }, style: _rngISty }),
      React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: "#9A3412" } }, "〜"),
      React.createElement("input", { type: "date", value: rngTo, min: rngFrom || undefined, onChange: function(e) { setRngTo(e.target.value); }, style: _rngISty }),
      _rngBtn("今月", _mFrom, ""),
      _rngBtn("先月", _pmFrom, _pmTo),
      _rngBtn("今日まで", rngFrom, ""),
      _rngBtn("クリア", "", ""),
      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, color: "#9A3412", marginLeft: "auto" } },
        (rngFrom || "最古") + " 〜 " + (rngTo || "今日(" + _today + ")") + " ・ " + _periodRecs.length + "件"));
  })();

  // レイアウト刷新・案A（2026-07-12）: ヘッダー=アイコン＋タイトル＋スコープサブタイトル。期間はチップ風セレクト・＋新規は右端。
  return React.createElement("div", { style: { padding: "12px 14px", maxWidth: 1100, margin: "0 auto" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, marginBottom: 8, flexWrap: "wrap" } },
      onBack ? React.createElement("button", { onClick: onBack, title: "戻る", style: { padding: "6px 11px", fontSize: 13, fontWeight: 700, background: "#fff", border: "1px solid #E4DFD7", borderRadius: 9, cursor: "pointer", color: "#5C554B" } }, "←") : null,
      React.createElement("div", { style: { width: 30, height: 30, borderRadius: 9, background: "#FBEDE6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 } }, "📒"),
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#1A1714", lineHeight: 1.2 } }, "エントリー記録帳"),
        React.createElement("div", { style: { fontSize: 10, color: "#9A9186", fontWeight: 700, marginTop: 1 } }, (_isSigTotal ? "シグナル総合" : _isAllStock ? "全銘柄" : _selStock) + " ・ " + filtered.length + "件")),
      React.createElement("select", { value: period, onChange: function(e) { setPeriod(e.target.value); }, style: { marginLeft: "auto", padding: "6px 9px", fontSize: 11.5, fontWeight: 700, border: "1px solid #E4DFD7", borderRadius: 9, background: "#fff", color: "#5C554B", cursor: "pointer" } },
        [["all", "全期間"], ["1w", "今週"], ["1m", "1ヶ月"], ["3m", "3ヶ月"], ["6m", "6ヶ月"], ["1y", "1年"], ["range", "🗓 期間指定"]].map(function(kv) { return React.createElement("option", { key: kv[0], value: kv[0] }, kv[1]); })),
      React.createElement("div", { title: "分析母数（承認③+）: 「7月〜」＝EMA修正後（2026-07-01以降）の記録だけで記録帳全体（推奨α・損切り・浮き足%・各表・一覧）を計算。既定＝全期間", style: { display: "inline-flex", alignItems: "center", background: anaJul ? "#FFF7ED" : "#EFEBE4", border: "1px solid " + (anaJul ? "#FDBA74" : "transparent"), borderRadius: 9, padding: 2, gap: 2 } },
        React.createElement("span", { style: { fontSize: 9, fontWeight: 800, color: anaJul ? "#C2410C" : "#9A9186", padding: "0 2px 0 6px" } }, "母数"),
        [[false, "全期間"], [true, "7月〜"]].map(function(kv) {
          var on = anaJul === kv[0];
          return React.createElement("button", { key: String(kv[0]), onClick: function() { setAnaJul(kv[0]); setExpKey(null); },
            style: { padding: "4px 10px", fontSize: 10.5, fontWeight: 700, border: "none", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap", background: on ? "#fff" : "transparent", color: on ? (kv[0] ? "#C2410C" : "#1A1714") : "#6B6459", boxShadow: on ? "0 1px 2px rgba(0,0,0,.08)" : "none" } }, kv[1]);
        })),
      React.createElement("button", { onClick: function() { setEditTarget({}); }, style: { padding: "7px 13px", fontSize: 12, fontWeight: 800, background: "#1A1714", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" } }, "＋新規")),
    _rngBar,
    React.createElement("div", { style: { fontSize: 9.5, color: "#B45309", margin: "0 2px 7px", lineHeight: 1.4 } }, "※ 2026年6月以前の損益は、EMAの位置に間違いがあったため参考程度です（7月以降が正）。" + (anaJul ? " 現在、母数トグルにより7月以降のみで分析中。" : "")),
    React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 6px", marginBottom: 6 } },
      React.createElement("button", { key: "__allbtn__", onClick: function() { setStockFil(_ALL_STOCK); setExpKey(null); setSelDate(null); setSelSig(null); setFloatSub("other"); setDetScopes({}); setPerExp(null); setAddAlphaFil("all"); setDetTagMode(false); setSelDetTag(null); if (view !== "sum" && view !== "period") setView("sum"); },
        style: { flexShrink: 0, padding: "6px 15px", fontSize: 12, fontWeight: 800, borderRadius: 15, cursor: "pointer", whiteSpace: "nowrap",
          border: "1px solid " + (_isAllStock ? "#1A1714" : "#E0DAD1"), background: _isAllStock ? "#1A1714" : "#fff", color: _isAllStock ? "#fff" : "#6B6459" } },
        "💰 損益 (" + _periodRecs.length + ")"),
      React.createElement("button", { key: "__sigtotalbtn__", onClick: function() { setStockFil(_SIG_TOTAL); setExpKey(null); setSelDate(null); setSelSig(null); setFloatSub("other"); setDetScopes({}); setPerExp(null); setAddAlphaFil("all"); setDetTagMode(false); setSelDetTag(null); },
        style: { flexShrink: 0, padding: "6px 13px", fontSize: 12, fontWeight: 800, borderRadius: 15, cursor: "pointer", whiteSpace: "nowrap",
          border: "1px solid " + (_isSigTotal ? "#0F766E" : "#E0DAD1"), background: _isSigTotal ? "#0F766E" : "#fff", color: _isSigTotal ? "#fff" : "#6B6459" } },
        "📡 シグナル総合"),
      _tickerList.length ? _tickerList.map(function(s) {
        var on = _selStock === s;
        return React.createElement("button", { key: s, onClick: function() { setStockFil(s); setExpKey(null); setSelDate(null); setSelSig(null); setFloatSub("other"); setDetScopes({}); setPerExp(null); setDetTagMode(false); setSelDetTag(null); },
          style: { flexShrink: 0, padding: "6px 13px", fontSize: 12, fontWeight: 800, borderRadius: 15, cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid " + (on ? "#9A3412" : "#E0DAD1"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#6B6459" } },
          s + " (" + (_cntByStock[s] || 0) + ")");
      }) : null),
    (!_isAllStock && !_isSigTotal && _sigAxisGroups.length && !(view === "sum" && detTagMode && _hasDetTags)) ? React.createElement("div", { style: { margin: "0 0 10px", background: "#fff", border: "1px solid #ECE7DE", borderRadius: 13, padding: "10px 12px", boxShadow: "0 1px 2px rgba(0,0,0,.03)" } },   // 文脈カード（案A 2026-07-12）: 旧シグナル行＋内訳行を1枚に統合。内訳（浮き足/その他 2026-07-02）は右上のセグメント・シグナルは折返しチップ。
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
          return React.createElement("button", { key: g.key, onClick: function() { setSelSig(g.key); setExpKey(null); setFloatSub("other"); setDetScopes({}); setDetTagMode(false); setSelDetTag(null); },
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
