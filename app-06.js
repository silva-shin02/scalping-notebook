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
// OS値の1円刻みヒストグラム【2026-06-25】。props: vals(値配列) / includeNeg? / w? / barH?。
// 0〜4=帯／5〜24=1円／25〜=帯(棒タップで1円内訳に展開)。色は赤系グラデ(高いほど濃い)・下落はグレー。各棒の上に件数。hoverで「ラベル: N件 (P%)」。
function _elOsHistV2(_ref) {
  var vals = _ref.vals || [];
  var includeNeg = !!_ref.includeNeg;
  var barH = _ref.barH || 96;
  var _histRecs = _ref.recs, _histAiOf = _ref.aiOf;
  var _histClickable = !!(_histRecs && _histAiOf);
  var cm = _elOsCountMap(vals);
  var xcm = _elOsCountMap(_ref.xVals || []);   // 期待度×(見送り)記録のOS最高値分布＝棒の中で「×見送り」割合を斜線で示す用 2026-07-01
  var _uE = useState(false), exp = _uE[0], setExp = _uE[1];
  var _uSel = useState(null), _selKey = _uSel[0], _setSelKey = _uSel[1];
  if (!cm.tot) return React.createElement("div", { style: { color: "#ccc", fontSize: 11, padding: "6px 0" } }, "—");
  // マーカー数値（推奨基本α/＋追加α/＋損切り）を先に取得＝25円以上の展開時、データの無いマーカー値にもゼロ枠を用意して▲を載せるため。keyは_EL_OS_TOP/expに依存するので後段で算出 2026-07-01。
  var markVal = (_ref.markVal != null && !isNaN(Number(_ref.markVal))) ? Math.round(Number(_ref.markVal)) : null;
  var markVal2 = (_ref.markVal2 != null && !isNaN(Number(_ref.markVal2))) ? Math.round(Number(_ref.markVal2)) : null;
  var markVal3 = (_ref.markVal3 != null && !isNaN(Number(_ref.markVal3))) ? Math.round(Number(_ref.markVal3)) : null;
  var _xc04 = 0; for (var _xi = 0; _xi <= 4; _xi++) _xc04 += (xcm.vc[_xi] || 0);
  var _xTopTot = 0; for (var _xtk in xcm.vc) { if (xcm.vc.hasOwnProperty(_xtk) && Number(_xtk) >= _EL_OS_TOP) _xTopTot += xcm.vc[_xtk]; }
  var bars = [];
  if (includeNeg && cm.neg) bars.push({ key: "neg", x: "下落", full: "下落", cnt: cm.neg, xcnt: xcm.neg || 0, color: "#6B7280", band: true });
  var c04 = 0; for (var i = 0; i <= 4; i++) c04 += (cm.vc[i] || 0);
  bars.push({ key: "0-4", x: "0〜4", full: "0〜4円", cnt: c04, xcnt: _xc04, color: _elOsBucketColor("0-4"), band: true });
  for (var v = 5; v < _EL_OS_TOP; v++) bars.push({ key: String(v), x: String(v), full: v + "円", cnt: cm.vc[v] || 0, xcnt: xcm.vc[v] || 0, color: _elOsShade(v) });
  var topKeys = []; for (var tk in cm.vc) { if (cm.vc.hasOwnProperty(tk) && Number(tk) >= _EL_OS_TOP) topKeys.push(Number(tk)); }
  topKeys.sort(function(a, b) { return a - b; });
  var topTot = 0; topKeys.forEach(function(k) { topTot += cm.vc[k]; });
  if (exp && topKeys.length) {
    var _topSet = {}; topKeys.forEach(function(k) { _topSet[k] = 1; });
    [markVal, markVal2, markVal3].forEach(function(mv) { if (mv != null && mv >= _EL_OS_TOP) _topSet[mv] = 1; });   // マーカー値(≥25)はデータが無くてもゼロ本数の枠を用意して▲を載せる 2026-07-01
    Object.keys(_topSet).map(Number).sort(function(a, b) { return a - b; }).forEach(function(k) { bars.push({ key: "t" + k, x: String(k), full: k + "円", cnt: cm.vc[k] || 0, xcnt: xcm.vc[k] || 0, color: _elOsShade(_EL_OS_TOP), collapse: true }); });
  } else {
    bars.push({ key: "25+", x: "25〜", full: "25円〜", cnt: topTot, xcnt: _xTopTot, color: _elOsBucketColor("25+"), band: true, expand: topKeys.length > 0 });
  }
  var maxC = 1; bars.forEach(function(b) { if (b.cnt > maxC) maxC = b.cnt; });
  var _xTot = (_ref.xVals || []).length;   // 期待度×(見送り)の総件数（凡例用）
  // マーカーのbucketキー算出（数値markVal/2/3は上部で取得済。keyは_EL_OS_TOP/expに依存＝ここで算出）。0-4 / "5".."24" / 25+ / 展開時"t"+値。
  var markKey = null;
  if (markVal != null) {
    if (markVal <= 4) markKey = "0-4";
    else if (markVal >= _EL_OS_TOP) markKey = exp ? ("t" + markVal) : "25+";
    else markKey = String(markVal);
  }
  var markKey2 = null;
  if (markVal2 != null) {
    if (markVal2 <= 4) markKey2 = "0-4";
    else if (markVal2 >= _EL_OS_TOP) markKey2 = exp ? ("t" + markVal2) : "25+";
    else markKey2 = String(markVal2);
  }
  var markKey3 = null;
  if (markVal3 != null) {
    if (markVal3 <= 4) markKey3 = "0-4";
    else if (markVal3 >= _EL_OS_TOP) markKey3 = exp ? ("t" + markVal3) : "25+";
    else markKey3 = String(markVal3);
  }
  var mark3Label = _ref.mark3Label || "推奨基本α＋追加α＋損切り値";   // 赤マークの意味ラベル（〇のみ＝基本α＋追加α＋損切り／×+未選択＝基本α＋損切り）2026-07-01
  var colNodes = bars.map(function(b) {
    var pct = Math.round(b.cnt / cm.tot * 100);
    var _isSel = _histClickable && _selKey === b.key;
    var _isMark = markKey != null && b.key === markKey;
    var _isMark2 = markKey2 != null && b.key === markKey2;
    var _isMark3 = markKey3 != null && b.key === markKey3;
    var click = _histClickable
      ? function() { _setSelKey(_selKey === b.key ? null : b.key); }
      : (b.expand ? function() { setExp(true); } : (b.collapse ? function() { setExp(false); } : null));
    return React.createElement("div", { key: b.key, title: b.full + ": " + b.cnt + "件 (" + pct + "%)" + (b.xcnt ? "・うち期待度×(見送り)" + b.xcnt + "件" : "") + (_isMark ? "（現在の推奨基本α " + markVal + "円）" : "") + (_isMark2 ? "（推奨基本α＋追加α " + markVal2 + "円）" : "") + (_isMark3 ? "（" + mark3Label + " " + markVal3 + "円）" : "") + (_histClickable ? "（クリックで取引一覧）" : ""), onClick: click,
        style: { flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", cursor: click ? "pointer" : "default" } },
      React.createElement("div", { style: { fontSize: 10, color: _isSel ? "#9A3412" : (b.cnt ? "#555" : "#ccc"), fontWeight: _isSel ? 700 : 400, marginBottom: 2, lineHeight: 1 } }, b.cnt),
      React.createElement("div", { style: { width: "100%", height: (b.cnt ? Math.max(2, Math.round(b.cnt / maxC * barH)) : 2) + "px", background: b.cnt ? b.color : "#eee", borderRadius: "2px 2px 0 0", overflow: "hidden", outline: _isSel ? "2px solid #9A3412" : (_isMark ? "2px solid #0369A1" : (_isMark2 ? "2px solid #EA580C" : (_isMark3 ? "2px solid #C0392B" : (b.band ? "1.5px dashed rgba(120,53,15,0.5)" : "none")))), outlineOffset: 1 } },
        (b.cnt && b.xcnt) ? React.createElement("div", { title: "期待度×（見送り）" + b.xcnt + "件", style: { width: "100%", height: Math.min(100, Math.round(b.xcnt / b.cnt * 100)) + "%", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.72) 0, rgba(255,255,255,0.72) 1.6px, transparent 1.6px, transparent 3.6px)" } }) : null));
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
      var ov = _elOsMaxAll(r.signal); if (ov == null) return false;
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
    ? React.createElement("div", { style: { fontSize: 9, color: "#EA580C", fontWeight: 700, marginTop: 2 } }, "▲ オレンジ字＝推奨基本α＋追加α（" + markVal2 + "円）")
    : null;
  var _markCap3 = (markVal3 != null && markKey3 != null && bars.some(function(b) { return b.key === markKey3; }))
    ? React.createElement("div", { style: { fontSize: 9, color: "#C0392B", fontWeight: 700, marginTop: 2 } }, "▲ 赤字＝" + mark3Label + "（" + markVal3 + "円）")
    : null;
  var markCap = (_markCapBase || _markCap2 || _markCap3) ? React.createElement(React.Fragment, null, _markCapBase, _markCap2, _markCap3) : null;
  var _xCap = _xTot > 0 ? React.createElement("div", { style: { fontSize: 9, color: "#6B7280", fontWeight: 700, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 } },
    React.createElement("span", { style: { display: "inline-block", width: 12, height: 8, borderRadius: 2, backgroundColor: "#9A3412", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.72) 0, rgba(255,255,255,0.72) 1.6px, transparent 1.6px, transparent 3.6px)" } }),
    "斜線＝期待度×（見送り） " + _xTot + "件（この母数のうち・棒内の割合で表示）") : null;
  return React.createElement("div", { style: { width: _ref.w || "100%", minWidth: 0 } },
    React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 2, height: (barH + 14) + "px" } }, colNodes),
    React.createElement("div", { style: { display: "flex", gap: 2, borderTop: "1.5px solid #e0ddd6", paddingTop: 3 } }, xNodes),
    toggle, markCap, _xCap, _selEl);
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
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 8 } },
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
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 8 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
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
  var _thS = function(t) { return React.createElement("th", { style: { padding: "4px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
  var _tdS = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 5px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var _rate = function(n, d, hi) { if (!d) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var p = Math.round(n / d * 100); return React.createElement("span", { style: { fontWeight: 700, color: p >= (hi || 50) ? "#1E8449" : "#B45309" } }, p + "%"); };
  var _avg = function(sum, cnt) { if (!cnt) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var a = Math.round(sum / cnt); return React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(a) } }, _elPnlFmt(a)); };
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 4 } },
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
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 2 } },
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
  var tbl = React.createElement(_HScrollBox, { style: { marginTop: 2 } },
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
    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { width: 14, height: 0, borderTop: "2px dashed #B45309", display: "inline-block" } }), "勝率(右軸)"));
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
// 損切り率=EP〜H1で損切りした割合(H2は含めない)・H1勝率=H1損益>0の割合。いずれも「OS1〜3でEP到達し、H1結果が判定できる記録」だけが母数。
// 追加α(_elAddAlphaReco)は基本αへの上乗せを実データ総当たりで評価＝補助。詳細は各関数のコメント。[[project_scalping_analysis_design]]
// 推奨基本αの探索範囲（5〜20円・1円刻み）。0〜4円は推奨しない（ユーザー方針 2026-06-21）。内部の理想α計算(_EL_IDEAL_ALPHAS=0〜50)とは別＝基本αは現実的に5〜20で設定する前提。
var _EL_BASE_ALPHAS = (function() { var _a = []; for (var _i = 5; _i <= 20; _i++) _a.push(_i); return _a; })();
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
var _EL_BASE_MIN_N = 3;          // 最低エントリー件数（H1結果が判定できる記録数 scN）の絶対下限。未満のαは推奨対象外＝薄い標本の偶然採用を防ぐ。
var _EL_BASE_MIN_FRAC = 0.5;     // 件数フロア（実データ連動）: 最も件数(scN)の多いαの何割以上を要求するか。高αの薄い標本(選抜バイアスでスコア上振れ)を除外 2026-06-22b。後で調整可。
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
// 次点（2番目の推奨α）を1番目の真下に「（次点：〇円）」で小書き（1番目と同サイズ・同色）。次点が無ければ「（次点なし）」を淡色で表示。ユーザー方針 2026-06-24。text例 "9円"/"+5円"。
function _elReco2Node(text, fontSize, color) {
  var _has = (text != null && text !== "");
  return React.createElement("div", { style: { fontSize: fontSize, fontWeight: 700, color: _has ? color : "#94A3B8", lineHeight: 1.1, whiteSpace: "nowrap" } }, _has ? ("（次点：" + text + "）") : "（次点なし）");
}
// 推奨基本α(5〜20)を選定【2026-06-22c】: 件数フロア＝最大件数(scN)×_EL_BASE_MIN_FRAC（最低_EL_BASE_MIN_N件）かつ 到達率≥_EL_BASE_MIN_ERATE のαから、合成スコア(0.7×(1−損切り率)+0.3×H1勝率)が最大。
// 高αは到達率が下がり標本が薄い「いいとこ取り(選抜バイアスでスコア上振れ)」になるため、件数フロア＋到達率フロアで薄い高α・約定しにくい高αを除外＝厚く約定しやすい標本の中で最良のαを選ぶ。同点は件数最大→低α。フロア皆無なら件数(scN)最大のαを参考(status="na")・entered皆無は"none"。
// 返り値 { alpha, score, stopRate, h1win, eRate, entered, scN, pnl, epPnl, stopN, ewin, status('ok'|'na'|'none'), sweep, minN(=採用した件数フロア) }。
function _elBaseAlphaPick(recs, aiOf) {
  if (!recs || !recs.length) return null;
  // 推奨基本αの母数: 追加α=〇(上乗せあり)以外＝×(不要)＋未選択(未判断)の記録。未選択はaddAlphaVal無し＝基本αのみの記録なので母数に算入する（〇だけ除外）2026-06-24。
  recs = recs.filter(function(r) { return r && !_elAddAlphaYes(r.signal); });
  if (!recs.length) return null;
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
// 推奨追加α【再設計 2026-06-29d／ユーザー方針＝損切り回避・段階フォールバック】: 基本αに +1〜+_EL_BASE_ADD_MAX(合計≤50)を上乗せした合計αを〇プールに当て、
// まず「黒字(想定損益ΣH1>0) かつ scN≥_EL_BASE_MIN_N」の加算に絞り（黒字は全段共通の必須条件＝赤字の上乗せは推奨しない）、損切り回避の優先順で選ぶ:
//   第1: 損切り率0%（完全回避）かつ到達率≥_EL_ADD_MIN_ERATE(40%)の中で【最小加算】／第2: 損切り率≤_EL_ADD_STOPRATE_2(30%)かつ到達率≥フロアの中で【最小加算】／第3(それも無し): 黒字の中で【損切り率が最も低い】加算（同率は最小加算・第3段は安全網なので到達率フロアは課さない）。
// 黒字の加算が皆無なら improved:false（推奨無し＝足しても黒字化しない）。想定損益は_elSimPnlByDay(ΣH1)。次点＝選抜プール内で1番目より大きい最小の加算。各統計(損切り率/H1勝率/到達率/件数/想定損益)を同梱。
// 返り値 { add, total, improved, stopRate, h1win, eRate, scN, pnl, sim, add2, total2, stopRate2, h1win2, eRate2, scN2, pnl2, sim2 } or null。
function _elAddAlphaReco(recs, aiOf, baseAlpha) {
  if (!recs || baseAlpha == null) return null;
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
// 数値根拠（底抜け前足浮き＝data.custom.addAlphaNumericReason）を根拠に含む記録の判定。推奨追加α値の母数から除外する＝固定の＋X円推奨に馴染まない数値根拠を外す（記録帳の根拠別分析④/⑤・floatNodeと同基準）2026-06-24i。
// _EL_NUM_REASONはリネーム可なのでApp(app-08)のレンダリングでdata.custom.addAlphaNumericReasonから実値に更新（App描画は子コンポーネントより先＝各α関数の母数算出時に最新）。既定「底抜け前足浮き」。
var _EL_NUM_REASON = "底抜け前足浮き";
function _elHasNumReason(s) {
  if (!s || !_EL_NUM_REASON) return false;
  var a = Array.isArray(s.addAlphaReasons) ? s.addAlphaReasons : (s.addAlphaReason ? [s.addAlphaReason] : []);
  return a.indexOf(_EL_NUM_REASON) >= 0;
}
// 一括: { pick(推奨基本α本体・追加α無し母数), add(推奨追加α・追加α〇の記録だけを母数に算出) }。二プール設計 2026-06-22→2026-06-24g: pick.statusがna(件数不足)でも追加αを算出（ユーザー方針＝1件でも参考表示）。
function _elBaseAlphaA(recs, aiOf) {
  var pick = _elBaseAlphaPick(recs, aiOf);   // 内部で追加α(〇)記録を除外＝基本αの母数は「追加α無し」
  if (!pick || pick.alpha == null) return null;
  // 推奨追加α: 追加α(〇)記録だけを母数に「基本αに何円足せば損切りを避けてH1黒字になるか」の最小加算を算出。pick.statusに関わらず算出。数値根拠(底抜け前足浮き)は母数から除外 2026-06-24i。
  var add = null;
  var addPool = (recs || []).filter(function(r) { return r && _elAddAlphaYes(r.signal) && !_elHasNumReason(r.signal); });
  if (addPool.length) add = _elAddAlphaReco(addPool, aiOf, pick.alpha);
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
  return React.createElement("span", { style: { whiteSpace: "nowrap", fontWeight: 800, fontSize: 13, color: na ? "#B45309" : "#C0392B" } },
    p.cut + "円",
    na ? React.createElement("span", { style: { fontSize: 8, color: "#B45309", marginLeft: 2, fontWeight: 700 } }, "参考") : null);
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
      _elv2Td(p.h1win == null ? "—" : _elPctCell(p.h1win)),
      _elv2Td(_elScoreCell(p.score)),
      _elv2Td((p.scN != null ? p.scN : 0) + "件"));   // 件数も推奨基本αの母数(×+未選択かつH1判定可能)に統一＝同行のα/損切り率/勝率/スコアと一致 2026-06-24i
  });
  var first = buckets[0], last = buckets[buckets.length - 1];
  var insight = (buckets.length >= 2) ? _elInsightBoxV2([
    React.createElement("span", null, "〜", _elInsightEmV2(first.label), "の推奨基本αは", _elInsightEmV2(first.pick.alpha + "円"), "、直近の", _elInsightEmV2(last.label), "は", _elInsightEmV2(last.pick.alpha + "円"), "。"),
    (last.pick.alpha !== first.pick.alpha) ? React.createElement("span", null, "最近は", _elInsightEmV2((last.pick.alpha > first.pick.alpha ? "高め" : "低め") + "（" + (last.pick.alpha > first.pick.alpha ? "+" : "") + (last.pick.alpha - first.pick.alpha) + "円）"), "の傾向。") : null
  ].filter(Boolean), { note: "各期間で「件数フロアを満たす中で合成スコア(損切り回避70%＋H1勝率30%)が最大のα」＝損切りしにくくH1で利益が出やすい土台。スコアは0〜100点。件数が少ない期間も参考(橙「参考」)で表示。5〜20円。件数が少ない期間は振れやすい" }) : null;
  return React.createElement("div", null, chart, _elv2Table(["期間", "推奨基本α", "損切り率", "H1勝率", "スコア", "有効件数"], rows), insight);
}
// 推奨基本αの「期間まとめ」: 1つの推奨値＋追加α＋α別の 損切り率(H1)/H1勝率/スコア 早見表（★=推奨）＋読み取り。2026-06-22再設計。
function _elBaseAlphaSummary(recs, aiOf) {
  var _A = _elBaseAlphaA(recs, aiOf);
  var pick = _A ? _A.pick : _elBaseAlphaPick(recs, aiOf);
  if (!pick || pick.status === "none" || pick.alpha == null) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  var na = pick.status === "na";
  var minN = pick.minN || _EL_BASE_MIN_N;
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
  var _sweepHead = ["基本α", "EP到達(OS2)", "損切り率(H1)", "H1勝率", "有効件数", "スコア"];
  var stopP = pick.stopRate != null ? Math.round(pick.stopRate * 100) : null;
  var winP = pick.h1win != null ? Math.round(pick.h1win * 100) : null;
  var cards = _elv2CardRow([
    _elv2Card("推奨基本α", React.createElement(React.Fragment, null, React.createElement("span", { style: { color: na ? "#B45309" : "#0369A1" } }, pick.alpha + "円"), _elReco2Node(pick.alpha2 != null ? (pick.alpha2 + "円") : null, 15, na ? "#B45309" : "#0369A1")), na ? "#B45309" : "#0369A1", na ? "該当なし→件数最大" : "スコア最大"),
    _elv2Card("損切り率(H1)", stopP != null ? stopP + "%" : "—", stopP != null ? (stopP <= 20 ? "#1E8449" : stopP <= 40 ? "#B45309" : "#C0392B") : "#333", "推奨αで"),
    _elv2Card("H1勝率", winP != null ? winP + "%" : "—", winP != null ? (winP >= 70 ? "#1E8449" : winP >= 50 ? "#B45309" : "#C0392B") : "#333", "推奨αで"),
    _elv2Card("スコア", _elScoreCell(pick.score), null, "0〜100"),
    _elv2Card("EP到達率(OS2)", _elPctCell(pick.eRate), null),
    _elv2Card("有効件数", (pick.scN != null ? pick.scN : 0) + "件", null, "判定可能なE")
  ]);
  var banner = na ? React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6, padding: "5px 8px", marginBottom: 6 } }, "⚠ 該当なし：件数フロア" + minN + "件以上のαがありません → 件数最大のα " + pick.alpha + "円 を参考表示（信頼度低）") : null;
  return React.createElement("div", null, banner, cards,
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "8px 0 2px" } }, "α別の EP到達率(OS2)・損切り率(H1)・H1勝率・スコア（★＝推奨基本α・フロア未満は淡色）"),
    _elv2Table(_sweepHead, sweepRows),
    _elInsightBoxV2([React.createElement("span", null, "推奨基本αは", _elInsightEmV2(pick.alpha + "円"), "（", (na ? "該当なし→件数最大" : ("損切り率" + (stopP != null ? stopP + "%" : "—") + "・H1勝率" + (winP != null ? winP + "%" : "—") + "・スコア" + (pick.score != null ? Math.round(pick.score * 100) : "—") + "点")), "）。", "（追加αは「② 追加α」タブで）")], { note: noteSub }));
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
    React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } },
      React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: na ? "#B45309" : "#0369A1" } }, a + "円"),
      _elReco2Node(pick.alpha2 != null ? (pick.alpha2 + "円") : null, 20, na ? "#B45309" : "#0369A1")),
    na
      ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#B45309" } }, "データ不足 " + (pick.scN != null ? pick.scN : 0) + "件/最低" + minN + "件・参考値")
      : React.createElement("span", { style: { fontSize: 11, color: "#555" } },
          "スコア ", React.createElement("b", { style: { color: "#0369A1" } }, pick.score != null ? Math.round(pick.score * 100) : "—"),
          "／損切り率 ", React.createElement("b", null, stopP != null ? stopP + "%" : "—"),
          "／H1勝率 ", React.createElement("b", null, winP != null ? winP + "%" : "—"),
          "／母数 ", React.createElement("b", null, (pick.scN || 0) + "件"),
          "／到達率 ", React.createElement("b", null, Math.round((pick.eRate || 0) * 100) + "%")),
    (add && add.improved)
      ? React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } },
          React.createElement("span", { style: { fontSize: 11, color: "#9A3412", fontWeight: 700 } }, "＋追加α +" + add.add + "円" + (add.pnl != null ? "（想定" + (add.pnl > 0 ? "+" : "") + Math.round(add.pnl).toLocaleString() + "円）" : "")),
          _elReco2Node(add.add2 != null ? ("+" + add.add2 + "円") : null, 11, "#9A3412"))
      : (add ? React.createElement("span", { style: { fontSize: 10, color: "#94A3B8" } }, "追加α＝推奨無し") : null));
  var sweepRows = pick.sweep.filter(function(e) { return e.entered > 0; }).map(function(e) {
    var on = e.a === a, pass = e.scN >= minN && e.score != null;
    return React.createElement("tr", { key: e.a, style: { background: on ? "#FEF3C7" : "transparent", opacity: pass ? 1 : 0.4 } },
      _elv2Td(React.createElement("span", { style: { fontWeight: on ? 800 : 600, color: on ? "#B45309" : "#0369A1" } }, e.a + "円" + (on ? " ★" : "")), { textAlign: "left", paddingLeft: 8 }),
      _elv2Td(_elPctCell(e.eRate)),
      _elv2Td(e.scN + "件"),
      _elv2Td(e.stopRate == null ? "—" : _elStopRateCell(e.stopRate)),
      _elv2Td(e.h1win == null ? "—" : _elPctCell(e.h1win)),
      _elv2Td((function() { var _av = (e.pnl != null && e.scN > 0) ? Math.round(e.pnl / e.scN) : null; return _av == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(_av), fontWeight: 700 } }, _elPnlFmt(_av)); })()),
      _elv2Td(e.score == null ? "—" : React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "0.7×" + Math.round((1 - e.stopRate) * 100) + "+0.3×" + Math.round(e.h1win * 100))),
      _elv2Td(_elScoreCell(e.score)));
  });
  // ②の母数記録テーブルは2026-06-26にユーザー要望で削除。母数集計（scN/損切り/勝ち/その他/対象外）だけ残し読み取りに使用。母数＝追加α〇を除く（×・未選択のみ）。
  var _mRecs = recs.filter(function(r) { return r && !_elAddAlphaYes(r.signal); });
  var scN = 0, stopN = 0, winN = 0, otherN = 0, offN = 0;
  _mRecs.forEach(function(r) {
    var s = r.signal; if (!s) return;
    var c = aiOf(r).cutLine, rr = _epResolve(s, a), epIdx = rr ? rr.epIdx : -1;
    if (!(epIdx >= 0 && epIdx <= 2)) { offN++; return; }   // OS1〜3以外（未到達）は対象外
    var epStop = _elPlanIsStop(s, a, c), h1Stop = _elHoldIsStop(s, a, c), hd = _elDynHold(s, a, c);
    if (!(epStop || h1Stop || hd != null)) return;   // 判定不可は母数外
    scN++;
    if (epStop || h1Stop) stopN++;
    else if (hd != null && hd > 0) winN++;
    else otherN++;
  });
  var insight = _elInsightBoxV2([
    React.createElement("span", null, "採用α", _elInsightEmV2(a + "円"), "の母数は", _elInsightEmV2(scN + "件"), "（OS3までにEP到達しH1判定可能）。うち損切り", _elInsightEmV2(stopN + "件"), "・H1勝ち", _elInsightEmV2(winN + "件"), "・その他", _elInsightEmV2(otherN + "件"), "、対象外", _elInsightEmV2(offN + "件"), "（未到達）。"),
    React.createElement("span", null, "スコア＝0.7×(1−損切り率", _elInsightEmV2((stopP != null ? stopP : "—") + "%"), ")＋0.3×H1勝率", _elInsightEmV2((winP != null ? winP : "—") + "%"), "＝", _elInsightEmV2((pick.score != null ? Math.round(pick.score * 100) : "—") + "点"), "。")
  ], { note: "この銘柄のv2・算入記録に各αを当ててシミュレーション。母数＝採用αでOS1〜3にEP到達しH1結果が判定できる記録。損切り率・H1勝率はこの母数で算出。" + (na ? " ※データ不足（母数<" + minN + "件）のため参考値。" : "") });
  return React.createElement("div", null,
    concl,
    _lbl("α別の総当たり（5〜20円・★＝採用・件数フロア" + minN + "件未満は淡色／平均H1損益＝ΣH1損益÷件数）"),
    _elv2Table(["基本α", "到達率", "有効件数", "損切り率", "H1勝率", "平均H1損益", "スコア内訳", "スコア"], sweepRows),
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
      (A.add && A.add.improved) ? React.createElement("div", { style: { whiteSpace: "nowrap", marginTop: 1, lineHeight: 1.2 } }, React.createElement("div", { style: { fontSize: 9, color: "#9A3412" } }, "追加α +" + A.add.add + "円"), _elReco2Node(A.add.add2 != null ? ("+" + A.add.add2 + "円") : null, 9, "#9A3412")) : null);
    return React.createElement("tr", { key: gi, style: { borderBottom: "1px solid #dbeafe" } },
      React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#9A3412", fontSize: 11, whiteSpace: "nowrap", verticalAlign: "top" } }, g.label),
      React.createElement("td", { style: { padding: "3px 8px", textAlign: "left", borderLeft: "1px solid #dbeafe" } }, cell));
  });
  if (!rows.length) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "データ無し");
  return React.createElement(_HScrollBox, null,
    React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 11, width: "100%" } },
      React.createElement("thead", null, React.createElement("tr", null, _th("銘柄"), _th("推奨基本α（＋追加α）"))),
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
    var basePool = pd.recs.filter(function(r) { return r && !_elAddAlphaYes(r.signal); });
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
    if (add && add.improved) {
      var _dadd = { borderTop: "1px dashed #FDBA74" };
      rows.push(React.createElement("tr", { key: "a" + i },
        _elv2Td(React.createElement("span", { style: { fontSize: 10, color: "#9A3412", fontWeight: 700 } }, "└ +追加α"), Object.assign({ textAlign: "left", paddingLeft: 14 }, _dadd)),
        _elv2Td(React.createElement("span", { style: { whiteSpace: "nowrap" } },
          React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: "#9A3412" } }, "+" + add.add + "円"),
          (add.add2 != null) ? React.createElement("span", { style: { fontSize: 11, color: "#94A3B8", marginLeft: 4 } }, "（次点：+" + add.add2 + "円）") : null), _dadd),
        _elv2Td(dash, _dadd),
        _elv2Td(add.stopRate != null ? _elStopRateCell(add.stopRate) : dash, _dadd),
        _elv2Td(add.h1win != null ? _elPctCell(add.h1win) : dash, _dadd),
        _elv2Td(add.eRate != null ? _elPctCell(add.eRate) : dash, _dadd),
        _elv2Td((add.scN != null ? add.scN : 0) + "件", _dadd),
        _elv2Td(_elSimPnlCell(add.sim), _dadd)));
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
    var addPool = (pd.recs || []).filter(function(r) { return r && _elAddAlphaYes(r.signal) && !_elHasNumReason(r.signal); });   // 数値根拠(底抜け前足浮き)を母数から除外 2026-06-24i
    var A = _elBaseAlphaA(pd.recs, aiOf);
    var pk = A ? A.pick : null;
    var add = A ? A.add : null;
    var noPool = !addPool.length;
    var improved = !!(add && add.improved);
    var total = improved ? add.total : (pk && pk.alpha != null ? pk.alpha : null);
    var ev = (!noPool && total != null) ? _elBaseAlphaEval(addPool, aiOf, total) : null;
    var sim = (!noPool && total != null) ? _elSimPnlByDay(addPool, aiOf, total) : null;
    var addCell;
    if (noPool) addCell = React.createElement("span", { style: { fontSize: 9, color: "#bbb" } }, "〇記録なし");
    else if (improved) addCell = React.createElement("div", { style: { whiteSpace: "nowrap", lineHeight: 1.15 } },
      React.createElement("span", { style: { fontWeight: 800, fontSize: 13, color: "#9A3412" } }, "+" + add.add + "円"),
      (add.add2 != null) ? React.createElement("span", { style: { fontSize: 11, color: "#94A3B8", marginLeft: 4 } }, "（次点：+" + add.add2 + "円）") : React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", marginLeft: 4 } }, "（次点なし）"));
    else addCell = (pk && pk.alpha != null)
      ? React.createElement("span", { style: { whiteSpace: "nowrap", lineHeight: 1.15 } },
          React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#94A3B8" } }, "推奨無し"),
          React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", marginLeft: 3 } }, "（下段は基本α" + pk.alpha + "円のみ）"))
      : React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#94A3B8", whiteSpace: "nowrap" } }, "推奨無し");
    var _pdiv = (i > 0) ? { borderTop: "2px solid #7DD3FC" } : null;   // 期間どうしの明確な区切り線 2026-06-24g
    var _mainBg = pd.main ? { background: "#EFF6FF" } : null;   // おすすめ窓（直近50件）の行ハイライト 2026-06-27
    var _cEx = (_pdiv || _mainBg) ? Object.assign({}, _pdiv || {}, _mainBg || {}) : null;
    rows.push(React.createElement("tr", { key: "m" + i },
      _elv2Td(_elPeriodLabelNode(pd), Object.assign({ fontWeight: 700, color: "#9A3412", textAlign: "left", paddingLeft: 8 }, _pdiv || {}, _mainBg || {})),
      _elv2Td(addCell, _cEx),
      _elv2Td(ev && ev.stopRate != null ? _elStopRateCell(ev.stopRate) : dash, _cEx),
      _elv2Td(ev && ev.h1win != null ? _elPctCell(ev.h1win) : dash, _cEx),
      _elv2Td(ev && ev.eRate != null ? _elPctCell(ev.eRate) : dash, _cEx),
      _elv2Td(noPool ? dash : ((ev && ev.scN != null ? ev.scN : 0) + "件"), _cEx),
      _elv2Td(_elSimPnlCell(sim), _cEx)));
    // 次点は主行にインライン「（次点：+X円）」で併記＝専用の└次点行は廃止 2026-07-01。次点の個別成績列は非表示。
  });
  return _elv2Table(["期間", "推奨追加α", "損切り率", "H1勝率", "到達率", "有効件数", "想定損益(1日/1件)"], rows);
}

// 銘柄ごとの「α 推奨α値（{stock}・期間別）」ブロック（見出し＋説明＋期間別表_elBaseAlphaPeriodTableV2＝基本αに追加αの└サブ行も内包）。ChartSection(app-02)と取引テーブルの本日損益データ(app-04)で共用＝同じ見た目に統一 2026-06-24（2026-07-01 追加α独立テーブルを廃し基本α表へ統合・見出しを推奨α値に改称）。
// data・stock・refDate(基準日=本日行は当日・他は前日まで)。recsは内部で全記録(_elCollectAllSignals→stock絞り)を集計。
function _elBaseAlphaPeriodBlockV2(data, stock, refDate) {
  var recs = _elCollectAllSignals(data).filter(function(r) { return r.stock === stock; });
  var aiOf = function(r) { return _elAlphaInfo(r, data); };
  return React.createElement("div", { style: { marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "α 推奨α値（" + stock + "・期間別）"),
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "この銘柄の記録を期間別（本日/直近25件/50件/100件/全期間）に集計。本日＝" + refDate + "当日の記録、それ以外は前日まで（当日を含めない）。各期間で件数フロア（最も件数の多いαの半分以上）かつ到達率50%以上かつ想定損益がプラスのαから、損切り率(EP〜H1)の低さ×0.7＋H1勝率×0.3 の合成スコアが最大のα（薄い高α・約定しにくい高α・赤字αは除外・データ不足時は件数最大を参考）。基本αは追加α〇以外（×・未選択）が母数。想定損益＝推奨基本αをこの母数に当てたH1損益の『1営業日あたり平均／期間累計（営業日数）』＝記録の無い日・ノーシグナル日（エントリー成立なし）は除外。「推奨損切り」＝実現H1損益をほぼ維持できる範囲で最小（タイト）の損切り値（10〜30円・追加α〇も含む全記録が母数。基本αとは別軸の損切り最適化）。表の「└ +追加α」＝追加α〇記録だけを母数に、基本αへ足すと損切りを避けてH1黒字になる推奨加算（黒字・3件以上・到達率40%以上等の基準）。次点（2番目の候補）は基本α・追加αとも各行にインライン「（次点：X円）」で併記＝専用行は無し。"),
    _elBaseAlphaPeriodTableV2(recs, aiOf, refDate, true));
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
      (add && add.improved) ? React.createElement("div", { style: { display: "inline-block", lineHeight: 1.05 } }, React.createElement("span", { style: { fontSize: 11, color: "#9A3412", fontWeight: 700 } }, "＋追加" + add.add + "円"), _elReco2Node(add.add2 != null ? ("+" + add.add2 + "円") : null, 11, "#9A3412")) : null,
      (hCut && hCut.cut != null && hCut.status !== "none") ? React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: hCut.status === "na" ? "#B45309" : "#C0392B" } }, "推奨損切り" + hCut.cut + "円" + (hCut.status === "na" ? "(参考)" : "")) : null,
      React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, head.label + "ベース・損切" + _pct(pk.stopRate) + " H1勝" + _pct(pk.h1win) + " " + (pk.scN || 0) + "件"));
  }
  return React.createElement("div", { style: { marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
    React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#0369A1", marginBottom: 6 } }, "🎯 推奨α値（" + refDate + "）"),
    headNode,
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginTop: 8, marginBottom: 6 } }, "この銘柄の記録を期間別（本日/直近25件/50件/100件/全期間）に集計。本日＝" + refDate + "当日の記録、それ以外は前日まで（当日を含めない）。各期間で件数フロア（最も件数の多いαの半分以上）かつ到達率50%以上かつ想定損益がプラスのαから、損切り率(EP〜H1)の低さ×0.7＋H1勝率×0.3 の合成スコアが最大のα（薄い高α・約定しにくい高α・赤字αは除外・データ不足時は件数最大を参考）。基本αは追加α〇以外（×・未選択）が母数。想定損益＝推奨基本αをこの母数に当てたH1損益の『1営業日あたり平均／期間累計（営業日数）』＝記録の無い日・ノーシグナル日（エントリー成立なし）は除外。「推奨損切り」＝実現H1損益をほぼ維持できる範囲で最小（タイト）の損切り値（10〜30円・追加α〇も含む全記録が母数。基本αとは別軸の損切り最適化）。表の「└ +追加α」＝追加α〇記録だけを母数に、基本αへ足すと損切りを避けてH1黒字になる推奨加算（黒字・3件以上・到達率40%以上等の基準）。次点（2番目の候補）は基本α・追加αとも各行にインライン「（次点：X円）」で併記＝専用行は無し。"),
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
// 推奨基本α・推奨追加α（いずれも再推奨＋次点）を出す。直近50件をメイン（大きく）、直近25件/100件/全期間はサブ行（小さく・次点併記）。
// 指標（損切り率/勝率/想定損益）は出さずα値だけのシンプル表示＝詳細は各銘柄テーブル(ChartSection)の期間別表(_elBaseAlphaPeriodBlockV2)で（取引タブの重複フル版は2026-06-26削除）。
// data・stocks(本日エントリーした銘柄=_pbStks)・refDate(基準日=本日。各窓は当日を含めない前日まで=_elPeriodWindows(...,false))。
function _elBaseAlphaSimpleBoardV2(data, stocks, refDate) {
  var aiOf = function(r) { return _elAlphaInfo(r, data); };
  var allSig = _elCollectAllSignals(data);
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
    if (!add) return React.createElement("span", { style: { color: "#94A3B8", fontSize: big ? 13 : 10 } }, "—");
    if (!add.improved) return React.createElement("span", { style: { color: "#94A3B8", fontSize: big ? 13 : 10, fontWeight: 700 } }, "推奨無し");
    if (!big) return React.createElement("span", { style: { whiteSpace: "nowrap" } }, React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: "#9A3412" } }, "+" + add.add + "円"));
    return React.createElement("div", { style: { lineHeight: 1.12 } },
      React.createElement("div", { style: { whiteSpace: "nowrap" } },
        React.createElement("span", { style: { fontWeight: 800, fontSize: 20, color: "#9A3412" } }, "+" + add.add + "円")),
      (add.add2 != null) ? React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#94A3B8", marginTop: 2 } }, "（次点：+" + add.add2 + "円）") : null);
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
  var _baseOf = function(s) { var b = _num(s.baseAlphaVal); if (b == null) { var a = _num(s.alphaVal), ad = _num(s.addAlphaVal); b = (a != null && ad != null) ? (a - ad) : a; } return b; };
  var _devNode = function(actual, ref) {
    if (actual == null || ref == null) return React.createElement("span", { style: { color: "#cbd5e1" } }, "—");
    var d = actual - ref, col = d > 0 ? "#C0392B" : d < 0 ? "#1E8449" : "#94A3B8", lbl = d < 0 ? "未達" : "到達";
    return React.createElement("span", { style: { fontWeight: 700, color: col } }, (d > 0 ? "+" : "") + d + " " + lbl);
  };
  var cards = (stocks || []).map(function(stock, si) {
    var recs = allSig.filter(function(r) { return r.stock === stock; });
    var W = _elPeriodWindows(recs, refDate, false);   // [直近25件,直近50件,直近100件,全期間]・前日まで（当日除外）
    var As = W.periods.map(function(pd) { return _elBaseAlphaA(pd.recs, aiOf); });
    var mainA = As[1];   // 直近50件＝メイン
    var hasAny = As.some(function(A) { return A && A.pick && A.pick.alpha != null; });
    var _lbl = function(t, col) { return React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: col, marginBottom: 2 } }, t); };
    var mainBlock;
    if (mainA && mainA.pick && mainA.pick.alpha != null) {
      mainBlock = React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 } },
        React.createElement("div", { style: { minWidth: 0 } }, _lbl("推奨基本α", "#0369A1"), _baseNode(mainA.pick, true)),
        React.createElement("div", { style: { minWidth: 0 } }, _lbl("推奨追加α", "#9A3412"), _addNode(mainA.add, true)),
        React.createElement("div", { style: { minWidth: 0 } }, _lbl("推奨損切り", "#C0392B"), _cutNode(_elCutPick(W.periods[1].recs, aiOf), true)));
    } else {
      mainBlock = React.createElement("div", { style: { fontSize: 12, color: "#94A3B8", fontWeight: 700, padding: "2px 0" } }, hasAny ? "直近50件：データ不足（下のサブ参照）" : "推奨基本αのデータがまだありません");
    }
    var subDefs = [{ i: 0, label: "直近25件" }, { i: 2, label: "直近100件" }, { i: 3, label: "全期間" }];
    var subRows = subDefs.map(function(sd, k) {
      var A = As[sd.i];
      return React.createElement("div", { key: k, style: { display: "flex", alignItems: "baseline", gap: 5, fontSize: 10, lineHeight: 1.6, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontWeight: 700, color: "#64748B", minWidth: 40 } }, sd.label),
        React.createElement("span", { style: { color: "#94A3B8" } }, "基"), _baseNode(A ? A.pick : null, false),
        React.createElement("span", { style: { color: "#94A3B8", marginLeft: 4 } }, "追"), _addNode(A ? A.add : null, false),
        React.createElement("span", { style: { color: "#94A3B8", marginLeft: 4 } }, "切"), _cutNode(_elCutPick(W.periods[sd.i].recs, aiOf), false));
    });
    // 本日の記録との乖離（記録1件ごと・追加α〇/×で到達の基準を切替 2026-06-27）。推奨基本α=メイン直近50件を優先・無ければ100件→全期間→25件。追加α〇は基本α+追加α分まで伸ばす前提なので到達OSを「推奨基本α+推奨追加α」と比較（×・未選択は推奨基本α）＝母数で〇を除外している推奨基本αとの整合をとる。推奨基本αと推奨追加αは同じ件数窓から取る。
    var refAObj = (function() { var order = [1, 2, 3, 0]; for (var oi = 0; oi < order.length; oi++) { var A = As[order[oi]]; if (A && A.pick && A.pick.alpha != null) return A; } return null; })();
    var refBase = refAObj ? refAObj.pick.alpha : null;   // 推奨基本α（×・未選択の到達基準）
    var refAdd = (refAObj && refAObj.add && refAObj.add.improved && refAObj.add.add != null) ? refAObj.add.add : 0;   // 推奨追加α（無ければ0＝合計は基本αに縮退）
    var refTotal = (refBase != null) ? (refBase + refAdd) : null;   // 推奨合計α（追加α〇の到達基準）
    var dayRecs = recs.filter(function(r) { return r && r.date === refDate && r.signal && _epIsV2(r.signal); });
    dayRecs.sort(function(a, b) { var ta = a.signal.time || "", tb = b.signal.time || ""; return ta < tb ? -1 : ta > tb ? 1 : 0; });
    var _dvTh = function(t) { return React.createElement("th", { style: { fontSize: 9, fontWeight: 700, color: "#64748B", padding: "2px 4px", whiteSpace: "nowrap", textAlign: "center" } }, t); };
    var _dvTd = function(c, ex) { return React.createElement("td", { style: Object.assign({ fontSize: 10, padding: "2px 4px", textAlign: "center", whiteSpace: "nowrap", borderTop: "1px solid #E0F2FE", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
    var _regBadge = function(yes) { return React.createElement("span", { style: { padding: "1px 5px", fontSize: 9, fontWeight: 700, borderRadius: 4, whiteSpace: "nowrap", background: yes ? "#FEF3C7" : "#F1F5F9", color: yes ? "#9A3412" : "#64748B" } }, yes ? "追加α〇" : "基本のみ"); };
    var _dvTdSpan = function(c, ex) { return React.createElement("td", { rowSpan: 2, style: Object.assign({ fontSize: 10, padding: "2px 4px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "middle", borderTop: "1px solid #E0F2FE", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
    var devRows = [];
    dayRecs.forEach(function(r, ri) {
      var s = r.signal, base = _baseOf(s), osMax = _elOsMaxAll(s);
      var yes = _elAddAlphaYes(s);
      var addv = yes ? _num(s.addAlphaVal) : null;
      var adoptTot = (base != null) ? ((yes && addv != null) ? (base + addv) : base) : null;
      var recoTot = yes ? refTotal : refBase;
      var _top = ri > 0 ? { borderTop: "2px solid #7DD3FC" } : null;
      var _dash = { borderTop: "1px dashed #BAE6FD" };
      devRows.push(React.createElement("tr", { key: ri + "r" },
        _dvTdSpan(s.time || "—", Object.assign({ color: "#64748B", fontWeight: 700 }, _top || {})),
        _dvTdSpan(_regBadge(yes), _top || {}),
        _dvTd("現実", Object.assign({ color: "#64748B", fontWeight: 700 }, _top || {})),
        _dvTd(base != null ? (base + "円") : "—", _top || {}),
        _dvTd(yes ? (addv != null ? ("+" + addv + "円") : "—") : "—", Object.assign({ color: yes ? "#9A3412" : "#cbd5e1" }, _top || {})),
        _dvTd(adoptTot != null ? (adoptTot + "円") : "—", Object.assign({ fontWeight: 700 }, _top || {})),
        _dvTdSpan(osMax != null ? (osMax + "円") : "—", Object.assign({ fontWeight: 700 }, _top || {})),
        _dvTd(_devNode(osMax, adoptTot), _top || {})));
      devRows.push(React.createElement("tr", { key: ri + "p" },
        _dvTd("推奨", Object.assign({ color: "#0369A1", fontWeight: 700 }, _dash)),
        _dvTd(refBase != null ? (refBase + "円") : "—", Object.assign({ color: "#0369A1" }, _dash)),
        _dvTd(yes ? (refAdd ? ("+" + refAdd + "円") : "—") : "—", Object.assign({ color: yes ? "#0369A1" : "#cbd5e1" }, _dash)),
        _dvTd(recoTot != null ? (recoTot + "円") : "—", Object.assign({ fontWeight: 700, color: "#0369A1" }, _dash)),
        _dvTd(_devNode(osMax, recoTot), _dash)));
    });
    var devBlock = dayRecs.length ? React.createElement("div", { style: { marginTop: 6, paddingTop: 5, borderTop: "1px dashed #93C5FD" } },
      React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📊 本日の記録との乖離（現実＝採用したα／推奨＝推奨どおりのα。乖離＝到達最高OSと合計αの差・プラス＝到達／マイナス＝未達。推奨基本α " + (refBase != null ? refBase + "円" : "—") + "／追加α〇は＋推奨追加α " + (refAdd ? (refAdd + "円") : "0円") + "）"),
      React.createElement(_HScrollBox, null,
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%" } },
          React.createElement("thead", null, React.createElement("tr", null, _dvTh("時刻"), _dvTh("種別"), _dvTh(""), _dvTh("基本α"), _dvTh("追加α"), _dvTh("合計α"), _dvTh("到達最高OS"), _dvTh("乖離"))),
          React.createElement("tbody", null, devRows)))) : null;
    return React.createElement("div", { key: si, style: { background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8, padding: "8px 10px", marginBottom: 8 } },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 5, paddingBottom: 4, borderBottom: "1px solid #BAE6FD" } }, stock,
        React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#0369A1", marginLeft: 6 } }, "メイン＝直近50件")),
      mainBlock,
      React.createElement("div", { style: { marginTop: 6, paddingTop: 5, borderTop: "1px dashed #93C5FD" } },
        React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#94A3B8", marginBottom: 1 } }, "他期間（サブ）"),
        subRows),
      devBlock);
  });
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 8 } }, "前日までの記録を件数窓で集計（当日は含めない）。直近50件をメインに、直近25件/100件/全期間はサブ。各値は再推奨（次点）。基本α＝追加α〇以外（×・未選択）が母数、追加α＝〇記録だけが母数、推奨損切り＝実現H1損益をほぼ維持できる最小（タイト）の損切り値（10〜30円・追加α〇も含む全記録が母数）。「📊本日の記録との乖離」は当日の記録1件ごとに、到達した最高OSが合計α（基本のみの記録＝推奨基本α／追加α〇の記録＝推奨基本α＋推奨追加α）からどれだけ離れたか（到達−合計α）。追加α〇は基本αだけでなく追加α分まで伸ばす前提なので、推奨基本αだけと比べず推奨合計αと比べる。損切り率・勝率・想定損益などの詳細は銘柄別・期間別の詳細表を参照。"),
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
// 📐 追加α値の分析（記録帳のα値タブ・2026-06-24）。母数＝追加α〇明示の記録(_elAddAlphaYes)。
// ①概況KPI ②効果検証(採用α=基本+追加 vs 基本αだけ のH1反実仮想＝足して正解だったか) ③上乗せ幅別の効果＋推奨追加α ④根拠別成績。
// recs=スコープのv2記録(×/〇/未選択混在)・aiOf(r)→{alpha(採用=基本+追加),cutLine}・data。
function _elAddAlphaSectionV2(recs, aiOf, data) {
  var totalV2 = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclTotal(r.signal); });
  var pool = totalV2.filter(function(r) { return _elAddAlphaYes(r.signal); });
  if (!pool.length) return React.createElement("div", { style: { fontSize: 12, color: "#94A3B8", padding: "10px 0" } }, "追加α〇（要）を明示した記録がありません（このスコープ）。記録を開いて追加α欄で〇を選ぶと、ここに分析が出ます。");
  var _num = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
  var _baseOf = function(s) { var b = _num(s.baseAlphaVal); if (b == null) { var a = _num(s.alphaVal), ad = _num(s.addAlphaVal); b = (a != null && ad != null) ? (a - ad) : a; } return b; };
  var _addOf = function(s) { var v = _num(s.addAlphaVal); if (v == null) { var a = _num(s.alphaVal), b = _num(s.baseAlphaVal); v = (a != null && b != null) ? (a - b) : null; } return v; };
  var _enteredAt = function(s, a) { var rr = _epResolve(s, a); return !!(rr && rr.judge === "ok"); };
  var _h1At = function(s, a, cut) { if (a == null || !_enteredAt(s, a)) return 0; var h = _elDynHold(s, a, cut); return h == null ? 0 : h; };
  var _stopAt = function(s, a, cut) { return _enteredAt(s, a) && (_elPlanIsStop(s, a, cut) || _elHoldIsStop(s, a, cut)); };

  // 効果計算（採用α=基本+追加 vs 基本αだけ）
  var eff = [];
  pool.forEach(function(r) {
    var s = r.signal, ai = aiOf(r), adopted = ai.alpha, cut = ai.cutLine, base = _baseOf(s);
    if (adopted == null || base == null || adopted <= base) return;
    var h1A = _h1At(s, adopted, cut), h1B = _h1At(s, base, cut);
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
        _elv2Card("平均H1改善額", (avgDelta > 0 ? "+" : "") + avgDelta + "円", _elPnlColor(avgDelta), "計" + (sumDelta > 0 ? "+" : "") + Math.round(sumDelta).toLocaleString() + "円"),
        _elv2Card("内訳（活/同/裏）", win + "・" + same + "・" + lose, "#555", "活きた・同じ・裏目"),
        _elv2Card("損切り回避", savedStop + "件", savedStop > 0 ? "#1E8449" : "#bbb", "基本αなら損切り→回避")
      ]),
      _elInsightBoxV2([
        React.createElement("span", null, "追加αを足した記録のうち ", _elInsightEmV2(winPct + "%"), "（", _elInsightEmV2(win + "/" + eff.length + "件"), "）で実際にH1が改善し、平均 ", _elInsightEmV2((avgDelta > 0 ? "+" : "") + avgDelta + "円"), "（合計 ", _elInsightEmV2((sumDelta > 0 ? "+" : "") + Math.round(sumDelta).toLocaleString() + "円"), "）の効果。",
          same > 0 ? React.createElement("span", null, " ", _elInsightEmV2(same + "件"), "は足さなくても同じ。") : null,
          lose > 0 ? React.createElement("span", null, " ", _elInsightEmV2(lose + "件"), "は裏目（足さない方が良かった）。") : null,
          savedStop > 0 ? React.createElement("span", null, " うち ", _elInsightEmV2(savedStop + "件"), "は基本αなら損切りだったのを回避。") : null)
      ], { note: "各追加α〇記録で『実際の採用α（基本＋追加）のH1損益』と『基本αだけだった場合のH1損益』を、同じ値動き・同じ損切り値で比較（未達＝取引なし＝0円）。差の合計＝追加αの判断が生んだ損益。" })
    );
  }

  // ③ 上乗せ幅別の効果＋推奨追加α
  var _A = _elBaseAlphaA(recs, aiOf);
  var recoAdd = (_A && _A.add && _A.add.improved) ? _A.add : null;
  var recoNode = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: recoAdd ? "#0369A1" : "#94A3B8" } },
    recoAdd ? React.createElement(React.Fragment, null, React.createElement("span", null, "推奨追加α ＝ ", React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, "＋" + recoAdd.add + "円")), _elReco2Node(recoAdd.add2 != null ? ("＋" + recoAdd.add2 + "円") : null, 16, "#0369A1"))
      : "推奨追加α：実データで有意な上乗せ改善は出ていません（基本αで十分の傾向）");
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
    addRows.length ? _elv2Table(["上乗せ幅", "件数", "活きた率", "平均H1改善"], addRows) : React.createElement("div", { style: { fontSize: 11, color: "#aaa" } }, "上乗せ幅データなし"));

  // ④ 根拠別（底抜け前足浮き＝数値根拠は分析から除外＝ユーザー方針 2026-06-24g・別途「さらに必要だった追加α」を下に表示）
  var _numReason = (data && data.custom && data.custom.addAlphaNumericReason) || "底抜け前足浮き";
  var byR = {};
  effNoNum.forEach(function(e) { (e.reasons.length ? e.reasons : ["（根拠なし）"]).forEach(function(rs) { (byR[rs] = byR[rs] || []).push(e); }); });   // 数値根拠記録は根拠別から除外(floatNode専用) 2026-06-24i
  var rKeys = Object.keys(byR).filter(function(k) { return k !== _numReason; }).sort(function(a, b) { var wa = byR[a].filter(function(e) { return e.delta > 0; }).length / byR[a].length, wb = byR[b].filter(function(e) { return e.delta > 0; }).length / byR[b].length; return wb - wa; });
  var rRows = rKeys.map(function(rs) {
    var es = byR[rs], w = 0, ok = 0, ng = 0, stop = 0, ad = [];
    es.forEach(function(e) { if (e.delta > 0) w++; if (e.stopAd) stop++; ad.push(e.add); var res = _elDynResult(e.s, e.adopted, e.cut); if (res === "ok") ok++; else if (res === "ng") ng++; });
    return React.createElement("tr", { key: rs },
      _elv2Td(rs, { fontWeight: 700, color: "#9A3412", textAlign: "left", paddingLeft: 8, whiteSpace: "normal" }),
      _elv2Td(es.length + "件"),
      _elv2Td((ad.length ? _elMedian(ad) : "—") + "円"),
      _elv2Td((ok + ng) ? Math.round(ok / (ok + ng) * 100) + "%" : "—"),
      _elv2Td(_elPctCell(w / es.length)),
      _elv2Td(es.length ? _elStopRateCell(stop / es.length) : React.createElement("span", { style: { color: "#bbb" } }, "—")));
  });

  var _miniH = function(t) { return React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", margin: "12px 0 2px" } }, t); };

  // ⑤ 根拠別の追加α明細（実際の追加α vs 理想・推奨追加α）2026-06-24。底抜け前足浮き（数値根拠）は除外し下の専用ブロックで表示。
  var baseAlphaAll = (_A && _A.pick && _A.pick.alpha != null) ? _A.pick.alpha : null;
  var _reasonsOf = function(s) { var a = (Array.isArray(s.addAlphaReasons) ? s.addAlphaReasons.filter(Boolean) : (s.addAlphaReason ? [s.addAlphaReason] : [])); return a.length ? a : ["（根拠なし）"]; };
  var _addFmt = function(v, suf) { return v == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#9A3412" : "#94A3B8" } }, "+" + v + "円" + (suf || "")); };
  var detByR = {};
  pool.filter(function(r) { return !_elHasNumReason(r.signal); }).forEach(function(r) {   // 数値根拠記録は根拠別明細から除外(floatNode専用)＝推奨追加α(radd)と母数一致 2026-06-24i
    var s = r.signal, ai = aiOf(r), cut = ai.cutLine, base = _baseOf(s), actAdd = _addOf(s);
    var ideal = (base != null) ? _elIdealAddForRec(s, base, cut) : { winMin: null, fillMax: null };
    var floatV = (_reasonsOf(s).indexOf(_numReason) >= 0) ? _num(s.addAlphaReasonVal) : null;
    var h1 = (base != null && actAdd != null) ? _h1At(s, base + actAdd, cut) : null;
    var rec = { date: r.date || "", base: base, actAdd: actAdd, winMin: ideal.winMin, fillMax: ideal.fillMax, floatV: floatV, h1: h1 };
    _reasonsOf(s).forEach(function(rs) { (detByR[rs] = detByR[rs] || []).push(rec); });
  });
  var detKeys = Object.keys(detByR).filter(function(k) { return k !== _numReason; }).sort(function(a, b) { return detByR[b].length - detByR[a].length; });
  var detSections = detKeys.map(function(rs, di) {
    var es = detByR[rs], isNum = (rs === _numReason);
    var reasonRecs = pool.filter(function(r) { return _reasonsOf(r.signal).indexOf(rs) >= 0 && !_elHasNumReason(r.signal); });   // 数値根拠併持記録を除外＝グローバル③推奨追加αと母数一致 2026-06-24i
    var radd = null;
    if (baseAlphaAll != null && reasonRecs.length) { radd = _elAddAlphaReco(reasonRecs, aiOf, baseAlphaAll); }
    var floats = es.map(function(e) { return e.floatV; }).filter(function(v) { return v != null; });
    var head = isNum ? ["日付", "実際", "理想①勝つ最小", "約定上限", rs + "(円)", "H1損益"] : ["日付", "実際", "理想①勝つ最小", "約定上限", "H1損益"];
    var recRows = es.slice().sort(function(x, y) { return (x.date < y.date) ? 1 : (x.date > y.date) ? -1 : 0; }).map(function(e, i) {
      var cells = [
        _elv2Td((e.date || "").slice(5).replace("-", "/"), { textAlign: "left", paddingLeft: 8 }),
        _elv2Td(_addFmt(e.actAdd)),
        _elv2Td(e.winMin == null ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#C0392B" } }, "勝てず") : _addFmt(e.winMin)),
        _elv2Td(e.fillMax == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : _addFmt(e.fillMax, "まで"))
      ];
      if (isNum) cells.push(_elv2Td(e.floatV == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : (e.floatV + "円")));
      cells.push(_elv2Td(e.h1 == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(e.h1) } }, _elPnlFmt(Math.round(e.h1)))));
      return React.createElement("tr", { key: i }, cells);
    });
    var corrNode = null;
    if (isNum) {
      var pairs = es.filter(function(e) { return e.floatV != null && e.winMin != null; }).map(function(e) { return [e.floatV, e.winMin]; });
      if (pairs.length >= 3) {
        var rc = _elCorr(pairs);
        var dir = rc == null ? "—" : (rc >= 0.3 ? "大きいほど理想の追加αも大きい傾向" : rc <= -0.3 ? "大きいほど理想の追加αは小さい傾向" : "はっきりした関係は薄い");
        corrNode = React.createElement("div", { style: { fontSize: 10, color: "#64748B", marginTop: 2 } }, "📈 相関：" + rs + "が" + dir + (rc != null ? "（r=" + rc.toFixed(2) + "・" + pairs.length + "件）" : ""));
      }
    }
    return React.createElement("div", { key: di, style: { marginTop: 8 } },
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", display: "flex", flexWrap: "wrap", gap: "2px 10px", alignItems: "baseline" } },
        React.createElement("span", null, "🏷 " + rs),
        React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, es.length + "件"),
        React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: (radd && radd.improved) ? "#0369A1" : "#94A3B8" } }, "推奨追加α " + ((radd && radd.improved) ? ("+" + radd.add + "円" + (radd.add2 != null ? "（次点：+" + radd.add2 + "円）" : "")) : "推奨無し")),
        (isNum && floats.length) ? React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, rs + "中央 " + _elMedian(floats) + "円") : null),
      _elv2Table(head, recRows),
      corrNode);
  });

  // 底抜け前足浮き（数値根拠）専用の分析は _elFloatReasonSectionV2 に切り出し、シグナル別パネル(_groupPanel)へ移設（2026-06-28）。根拠別分析(④/⑤)からは引き続き除外。

  return React.createElement(React.Fragment, null,
    kpi,
    _miniH("🎯 足して正解だったか（効果検証）"), effNode,
    _miniH("📊 いくら足すのが最適か（上乗せ幅別の効果）"), optNode,
    _miniH("🏷 根拠別の成績（活きた率の高い順）"),
    rRows.length ? _elv2Table(["根拠", "件数", "上乗せ中央", "E後勝率", "活きた率", "損切り率"], rRows) : React.createElement("div", { style: { fontSize: 11, color: "#aaa" } }, "根拠データなし"),
    _miniH("🧾 根拠別の追加α明細（実際 vs 理想・推奨追加α）"),
    React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", margin: "0 0 2px" } }, "実際＝記録の追加α値。理想①勝つ最小＝損切り回避＆H1黒字にできた最小の上乗せ（「勝てず」＝足しても勝てなかった）。約定上限＝これ以上足すと未約定になる上限（αを増やすほどEP到達は難化するため約定の観点は上限で表示）。推奨追加α＝その根拠の〇記録から算出（基本α" + (baseAlphaAll != null ? baseAlphaAll + "円" : "—") + "基準）。"),
    detSections.length ? React.createElement("div", null, detSections) : React.createElement("div", { style: { fontSize: 11, color: "#aaa" } }, "明細データなし"));
}

// 底抜け前足浮き（数値根拠＝data.custom.addAlphaNumericReason）の追加α分析。2026-06-28にα値タブ(_elAddAlphaSectionV2)からシグナル別パネル(_groupPanel)へ移設。
// recs=そのシグナル(底抜け水準線OS)スコープのv2記録 / aiOf(r)→{alpha,cutLine} / data / secH=見出しヘルパー。数値（前足浮き値）入力前提なので固定の＋X円ではなく「前足浮き値の何%を追加αにすべきだったか」で分析（理想追加α winMin÷前足浮き値＝理想%）＋%別シミュで最適%を推奨。
// 追加α〇かつ数値根拠を含む記録が無ければ null（＝底抜け記録の無いシグナルのタブには何も出ない）。
function _elFloatReasonSectionV2(recs, aiOf, data, secH, basePick, recCtx) {
  var totalV2 = (recs || []).filter(function(r) { return r && r.signal && _epIsV2(r.signal) && _elInclTotal(r.signal); });
  var pool = totalV2.filter(function(r) { return _elAddAlphaYes(r.signal); });
  var _numReason = (data && data.custom && data.custom.addAlphaNumericReason) || "底抜け前足浮き";
  var _num = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
  var _baseOf = function(s) { var b = _num(s.baseAlphaVal); if (b == null) { var a = _num(s.alphaVal), ad = _num(s.addAlphaVal); b = (a != null && ad != null) ? (a - ad) : a; } return b; };
  var _addOf = function(s) { var v = _num(s.addAlphaVal); if (v == null) { var a = _num(s.alphaVal), b = _num(s.baseAlphaVal); v = (a != null && b != null) ? (a - b) : null; } return v; };
  var _enteredAt = function(s, a) { var rr = _epResolve(s, a); return !!(rr && rr.judge === "ok"); };
  var _h1At = function(s, a, cut) { if (a == null || !_enteredAt(s, a)) return 0; var h = _elDynHold(s, a, cut); return h == null ? 0 : h; };
  var _reasonsOf = function(s) { var a = (Array.isArray(s.addAlphaReasons) ? s.addAlphaReasons.filter(Boolean) : (s.addAlphaReason ? [s.addAlphaReason] : [])); return a.length ? a : ["（根拠なし）"]; };
  var _addFmt = function(v, suf) { return v == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#9A3412" : "#94A3B8" } }, "+" + v + "円" + (suf || "")); };
  var floatRecs = pool.filter(function(r) { return _reasonsOf(r.signal).indexOf(_numReason) >= 0; });
  if (!floatRecs.length) return null;
  var _dash2 = React.createElement("span", { style: { color: "#bbb" } }, "—");
  var _pctTxt = function(v) { return v == null ? _dash2 : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, Math.round(v) + "%"); };
  var idealPcts = [];   // 各記録の理想%（winMin÷前足浮き×100）＝中央値・シミュ上限に使用
  // 理想%（winMin÷前足浮き×100）を集める＝%別シミュ(下の📐)の上限追従用。表示用の行は下の2段テーブルで別途構築。
  floatRecs.forEach(function(r) {
    var s = r.signal, base = _baseOf(s), cut = aiOf(r).cutLine;
    var floatV = _num(s.addAlphaReasonVal);
    var idealRaw = (base != null) ? _elIdealAddForRec(s, base, cut).winMin : undefined;
    var idealPct = (floatV != null && floatV > 0 && typeof idealRaw === "number") ? (idealRaw / floatV * 100) : null;
    if (idealPct != null) idealPcts.push(idealPct);
  });
  // %別シミュ: 前足浮き値のP%を追加αにして（addAmt=round(F×P/100)）基本αに足し、到達率/損切り率/H1勝率/想定損益(計=ΣH1)を評価→最適%（想定損益最大）を推奨。母数=前足浮き値と基本αが揃う底抜け記録。Pの上限は理想%の最大に追従（10刻み・最大200%）。
  var simRecs = floatRecs.filter(function(r) { var b = _baseOf(r.signal); var f = _num(r.signal.addAlphaReasonVal); return b != null && f != null && f > 0; });
  var simNode = null;
  if (simRecs.length) {
    var _maxIdeal = idealPcts.length ? Math.max.apply(null, idealPcts) : 100;
    var _maxP = Math.min(200, Math.max(100, Math.ceil(_maxIdeal / 10) * 10));
    var _cands = []; for (var _pp = 0; _pp <= _maxP; _pp += 10) _cands.push(_pp);
    var _evalP = function(P) {
      var scN = 0, stopN = 0, winN = 0, sum = 0, ent = 0;
      simRecs.forEach(function(r) {
        var s = r.signal, cut = aiOf(r).cutLine, b = _baseOf(s), f = _num(s.addAlphaReasonVal);
        var tot = b + Math.round(f * P / 100);
        var rr = _epResolve(s, tot);
        if (!(rr && rr.epIdx >= 0)) return;   // EP未到達
        ent++;
        var hd = _elDynHold(s, tot, cut);
        if (hd == null) return;
        scN++;
        if (_elPlanIsStop(s, tot, cut) || _elHoldIsStop(s, tot, cut)) stopN++;
        if (hd > 0) winN++;
        sum += hd;
      });
      return { P: P, scN: scN, stopRate: scN ? stopN / scN : null, h1win: scN ? winN / scN : null, eRate: simRecs.length ? ent / simRecs.length : null, sum: scN ? sum : null };
    };
    var _rowsP = _cands.map(_evalP);
    var _withPnl = _rowsP.filter(function(x) { return x.sum != null && x.sum > 0; });
    var _best = _withPnl.length ? _withPnl.reduce(function(a, b) { return b.sum > a.sum ? b : a; }) : null;
    var _recoNode = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, marginBottom: 4, color: _best ? "#0369A1" : "#94A3B8" } },
      _best ? React.createElement("span", null, "推奨 ＝ 前足浮きの ", React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, _best.P + "%"), " を追加αに（損切り" + Math.round((_best.stopRate || 0) * 100) + "%・H1勝" + Math.round((_best.h1win || 0) * 100) + "%・想定損益計" + _elPnlFmt(Math.round(_best.sum)) + "・" + _best.scN + "件）")
        : "推奨：前足浮き比でも想定損益がプラスになる%は出ていません（データ不足／基本α＋実際の追加αで十分）");
    var _pRows = _rowsP.map(function(x) {
      var on = _best && x.P === _best.P;
      return React.createElement("tr", { key: x.P, style: on ? { background: "#FEF3C7" } : null },
        _elv2Td(React.createElement("span", { style: { fontWeight: 700, color: on ? "#B45309" : "#9A3412" } }, x.P + "%" + (on ? " ★" : "")), { textAlign: "left", paddingLeft: 8 }),
        _elv2Td(x.eRate != null ? _elPctCell(x.eRate) : _dash2),
        _elv2Td((x.scN || 0) + "件"),
        _elv2Td(x.stopRate != null ? _elStopRateCell(x.stopRate) : _dash2),
        _elv2Td(x.h1win != null ? _elPctCell(x.h1win) : _dash2),
        _elv2Td(x.sum == null ? _dash2 : React.createElement("span", { style: { fontWeight: 800, color: _elPnlColor(Math.round(x.sum)) } }, _elPnlFmt(Math.round(x.sum)))));
    });
    simNode = React.createElement("div", { style: { marginTop: 8 } },
      React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", margin: "0 0 2px" } }, "📐 前足浮きの何%を追加αにすると最適か（%別シミュ・★＝想定損益最大）"),
      _recoNode,
      _elv2Table(["前足浮き%", "到達率", "件数", "損切り率", "H1勝率", "想定損益(計)"], _pRows));
  }
  // ===== 2段テーブル（案B・2026-07-01刷新）: 1記録＝現実(採用したα)／推奨(推奨どおりのα)の上下2段。列＝日付(＋記録ボタン)/種別/基本α/追加α/合計α/OS/乖離度。 =====
  var recoBase = (basePick && basePick.alpha != null && basePick.status !== "none") ? basePick.alpha : null;   // 推奨基本α（シグナル単一値・_elBaseAlphaPick由来）
  var bestP = _best ? _best.P : null;   // 推奨%（下の📐%別シミュの最適%）。null=黒字%なし
  var simRan = simRecs.length > 0;
  var _devNode = function(actual, ref) {   // 到達最高OS−採用合計α（＋到達＝赤/−未達＝緑/0グレー）
    if (actual == null || ref == null) return React.createElement("span", { style: { color: "#cbd5e1" } }, "—");
    var d = actual - ref, col = d > 0 ? "#C0392B" : d < 0 ? "#1E8449" : "#94A3B8", lbl = d < 0 ? "未達" : "到達";
    return React.createElement("span", { style: { fontWeight: 700, color: col } }, (d > 0 ? "+" : "") + d + " " + lbl);
  };
  var _fTh = function(t) { return React.createElement("th", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", padding: "4px 6px", whiteSpace: "nowrap", textAlign: "center", borderBottom: "2px solid #ddd" } }, t); };
  var _fTd = function(c, ex) { return React.createElement("td", { style: Object.assign({ fontSize: 10.5, padding: "3px 6px", textAlign: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var _fTdSpan = function(c, ex) { return React.createElement("td", { rowSpan: 2, style: Object.assign({ fontSize: 10.5, padding: "3px 6px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "middle", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var devRows = [];
  floatRecs.slice().sort(function(x, y) { var dx = x.date || "", dy = y.date || ""; return dx < dy ? 1 : dx > dy ? -1 : 0; }).forEach(function(r, i) {
    var s = r.signal, ai = aiOf(r), cut = ai.cutLine, base = _baseOf(s), actAdd = _addOf(s);
    var actualTot = (base != null && actAdd != null) ? (base + actAdd) : (ai.alpha != null ? ai.alpha : null);
    var floatV = _num(s.addAlphaReasonVal);
    var osMax = _elOsMaxFiltered(s, actualTot != null ? actualTot : ai.alpha);   // OS1〜3の到達最高値（×で打ち切り＝実現分）
    var recoAdd = (bestP != null && floatV != null && floatV > 0) ? Math.round(floatV * bestP / 100) : ((bestP == null && simRan) ? 0 : null);   // 推奨追加α＝前足浮き値×推奨%。%が黒字化せず→0（不要）／算出不能→null
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
      floatV != null ? React.createElement("div", { style: { fontSize: 8.5, color: "#aaa" } }, "浮き" + floatV + "円") : null);
    devRows.push(React.createElement("tr", { key: ek + "_r" },
      _fTdSpan(dateCell, Object.assign({ textAlign: "left", paddingLeft: 8 }, topB || {})),
      _fTd("現実", Object.assign({ color: "#64748B", fontWeight: 700 }, topB || {})),
      _fTd(base != null ? (base + "円") : "—", topB || {}),
      _fTd(addRealNode, topB || {}),
      _fTd(actualTot != null ? (actualTot + "円") : "—", Object.assign({ fontWeight: 700 }, topB || {})),
      _fTdSpan(osMax != null ? (osMax + "円") : "—", Object.assign({ fontWeight: 700 }, topB || {})),
      _fTd(_devNode(osMax, actualTot), topB || {})));
    var recoAddNode = (recoBase == null) ? React.createElement("span", { style: { color: "#cbd5e1" } }, "—") : (recoAdd == null) ? React.createElement("span", { style: { color: "#cbd5e1" } }, "—") : recoAdd === 0 ? React.createElement("span", { style: { color: "#0369A1" } }, "+0円") : React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, "+" + recoAdd + "円");
    devRows.push(React.createElement("tr", { key: ek + "_p" },
      _fTd("推奨", Object.assign({ color: "#0369A1", fontWeight: 700 }, dashB)),
      _fTd(recoBase != null ? (recoBase + "円") : "—", Object.assign({ color: "#0369A1" }, dashB)),
      _fTd(recoAddNode, dashB),
      _fTd(recoTot != null ? (recoTot + "円") : "—", Object.assign({ fontWeight: 700, color: "#0369A1" }, dashB)),
      _fTd(_devNode(osMax, recoTot), dashB)));
    if (on && recCtx) devRows.push(React.createElement("tr", { key: ek + "_c" },
      React.createElement("td", { colSpan: 7, style: { padding: "4px 8px 8px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
        React.createElement(EntryLogCard, { record: r, data: data, onEdit: recCtx.onEdit, onGoDate: recCtx.onGoDate }))));
  });
  var _floatTable = React.createElement(_HScrollBox, { style: { marginTop: 6 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%" } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } }, _fTh("日付"), _fTh("種別"), _fTh("基本α"), _fTh("追加α"), _fTh("合計α"), _fTh("OS"), _fTh("乖離度"))),
      React.createElement("tbody", null, devRows)));
  return React.createElement(React.Fragment, null,
    secH("🔻 " + _numReason + "（採用α・推奨α・OS・乖離の一覧）"),
    React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", margin: "0 0 4px", lineHeight: 1.5 } }, "「" + _numReason + "」の追加α〇記録を1件ずつ、現実（採用したα）と推奨（推奨どおりのα）で上下2段に対比。OS＝OS1〜3の到達最高値（×で打ち切り）。乖離度＝到達最高OSと各段αの差（現実＝OS−採用合計α／推奨＝OS−推奨合計α・＋到達／−未達）。推奨追加α＝前足浮き値×推奨%（下の📐%シミュ）" + (recoBase != null ? ("・推奨基本α " + recoBase + "円") : "") + "。日付の「記録」でその日の記録を開閉。"),
    _floatTable,
    simNode);
}

// ===== 追加分析セクション群の共通小物（2026-06-14）=====
function _elv2Th(t) { return React.createElement("th", { style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); }
function _elv2Td(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); }
function _elv2Table(head, bodyRows) {
  return React.createElement(_HScrollBox, { style: { marginTop: 6 } },
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
function _elOsTradeMini(recs, aiOf) {
  var list = (recs || []).filter(function(r) { return r && r.signal; });
  if (!list.length) return React.createElement("div", { style: { color: "#aaa", fontSize: 11, padding: "6px 4px" } }, "記録なし");
  var sorted = list.slice().sort(function(a, b) { return (a.date + (a.signal.time || "99:99")).localeCompare(b.date + (b.signal.time || "99:99")); });
  var _bb = "1px solid #e8e5de";
  var _th = function(label, extra) { return React.createElement("th", { style: Object.assign({ padding: "2px 4px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "center", fontSize: 10, lineHeight: 1.15, color: "#9A3412", whiteSpace: "nowrap" }, extra || {}) }, label); };
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
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb } },
        a != null ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#0369A1", fontWeight: 600 } }, a + "円") : React.createElement("span", { style: { color: "#ddd" } }, "—")),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb } }, _epOsChainCell(s, a)),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb } }, _epECell(s, a)),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap" } },
        entered ? React.createElement("span", { style: { color: "#2E7D32", fontWeight: 700, fontSize: 14 } }, "〇") : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×")),
      React.createElement("td", { style: { padding: "1px 1px", textAlign: "center", fontSize: 11, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap" } }, _epPnlCell(s, a, c)),
      _elHoldTd2(s, a, c, { padding: "1px 0", textAlign: "center", fontSize: 11, borderBottom: _bb, borderRight: _bb }, (_elDynHold(s, a, c) != null && _elHoldIsStop(s, a, c)) ? _elCapNote(c) : null),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: _bb, whiteSpace: "nowrap" } },
        _elLane(_tradeAlphaChip(s), 26, "flex-end"), _elRPnlDispW(realPnl, gReal, 72))
    );
  });
  return React.createElement(_HScrollBox, { style: { marginTop: 4 } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", fontSize: 10 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
        _th("日付", { width: 50 }), _th("時間", { width: 42 }), _th("シグナル"), _th("α値", { width: 34 }), _th("OS", { width: 78 }), _th("E", { width: 24 }), _th("取引", { width: 26 }), _th("EP損益", { width: 96 }),
        React.createElement("th", { colSpan: 2, style: { padding: "2px 4px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "center", fontSize: 10, color: "#9A3412", whiteSpace: "nowrap" } }, "H損益"),
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
    var s = r.signal; if (!s) return; var _ov = _elOsMaxAll(s); if (_ov == null) return;
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
function _elOsSectionV2(recs, aiOf) {
  var os = _elOsStatsV2(recs, _elOsMaxAll), pc = _elOsPctlV2(recs, _elOsMaxAll);
  if (!os || !pc) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "OS値の記録がありません");
  var _baPickAlpha = (function() { var _p = _elBaseAlphaPick(recs, aiOf); return (_p && _p.alpha != null) ? _p.alpha : null; })();   // OS値分布に現在の推奨基本αを青字マーク 2026-06-28
  var skewBadge = pc.skewRight ? React.createElement("span", { title: "平均が一部の大きいOS値に引っ張られています。典型値は中央値で読むのが安全です。", style: { display: "inline-block", fontSize: 9, fontWeight: 800, color: "#fff", background: "#B45309", borderRadius: 4, padding: "1px 6px", marginLeft: 6 } }, "右偏") : null;
  var statLine = React.createElement("div", { style: { display: "flex", gap: "6px 18px", flexWrap: "wrap", alignItems: "baseline", marginBottom: 6 } },
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginRight: 3 } }, "中央値"), React.createElement("b", { style: { fontSize: 18, color: "#9A3412" } }, os.med + "円"), skewBadge),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "平均"), React.createElement("b", { style: { fontSize: 13, color: "#555" } }, os.avg + "円")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "最頻"), _elOsBucketChip(pc.bucketMode.key), React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 3 } }, pc.bucketMode.pct + "%")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "中位50%"), React.createElement("b", { style: { fontSize: 12, color: "#555" } }, pc.p25 + "〜" + pc.p75 + "円")),
    React.createElement("span", null, React.createElement("span", { style: { fontSize: 10, color: "#888", marginRight: 3 } }, "範囲"), React.createElement("b", { style: { fontSize: 12, color: "#555" } }, os.min + "〜" + os.max + "円")),
    React.createElement("span", { style: { fontSize: 10, color: "#aaa" } }, "OS入力 " + os.n + "件"));
  var pieRow = React.createElement("div", { style: { marginBottom: 8 } },
    React.createElement("div", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginBottom: 4 } }, "OS値の分布（1円刻み・各棒に件数）"),
    React.createElement(_elOsHistV2, { vals: os.vals, recs: recs, aiOf: aiOf, markVal: _baPickAlpha }),
    React.createElement("div", { style: { marginTop: 6 } }, _elOsBandLegendV2()));
  var mk = function() { return { cnt: 0, reach: 0, ok: 0, ng: 0, miss: 0, plan: 0, planCnt: 0, h1: 0, h1Cnt: 0, stop: 0 }; };
  var bands = {};
  (recs || []).forEach(function(r) {
    var s = r.signal; var _ov = _elOsMaxAll(s); if (_ov == null) return; var bi = _elOsBucketKey(_ov, false); if (bi == null) return;
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
  items.push(React.createElement("span", null, "OS値（OS1〜3最高）は", _elInsightEmV2(_elOsBucketLabel(pc.bucketMode.key), _elOsBucketColor(pc.bucketMode.key)), "が最多（" + pc.bucketMode.pct + "%）。典型値＝", _elInsightEmV2("中央値 " + os.med + "円"), pc.skewRight ? React.createElement("span", null, "（平均 " + os.avg + "円は一部の大きいOSに上振れ＝", _elInsightEmV2("中央値で読むのが安全", "#B45309"), "）") : null, "。"));
  var bw = null; for (var bk2 in bands) { if (!bands.hasOwnProperty(bk2)) continue; var o2 = bands[bk2]; var dn = o2.ok + o2.ng; if (dn >= 3 && (bw == null || o2.ok / dn > bw.v)) bw = { v: o2.ok / dn, k: bk2 }; }
  if (bw) items.push(React.createElement("span", null, "勝率が最も高いOS値は", _elInsightEmV2(_elOsBucketLabel(bw.k), _elOsBucketColor(bw.k)), "（", _elInsightEmV2(Math.round(bw.v * 100) + "%"), "・3件以上で比較）。"));
  return React.createElement("div", null, statLine, pieRow, bTable, _elInsightBoxV2(items, { note: "中央値=ちょうど半数がそれ以上のOSになる値（α到達確率と直結＝α設定はこちらが目安）。平均は合計・期待値の計算向き。最頻=最も多く出るOS値（0〜4円と25円〜は帯）。E後の勝率=エントリー（E成立）後にEP損益が利益だった割合（敗率・未達率はE到達率の裏返しなので省略）。成績は採用α基準・E成立分のみ。" }));
}

// OS値（OS1〜3最高）の分位→成立率別のα目安テーブル。2026-06-28にα値タブへ移設（集計タブの_elOsSectionV2内「成立率の目安」を切り出し）。各成立率（このα以下なら約その割合でα到達＝取引機会）に対応するαの目安。aiOf不要（_elOsPctlV2はOS抽出器_elOsMaxAllを使う）。
function _elOsAlphaPctlTableV2(recs) {
  var pc = _elOsPctlV2(recs, _elOsMaxAll);
  if (!pc) return React.createElement("div", { style: { color: "#bbb", fontSize: 12, padding: "8px 0" } }, "OS値の記録がありません");
  var aRows = [["50%（中央値）", pc.a50], ["70%", pc.a70], ["80%", pc.a80], ["90%", pc.a90]].map(function(kv) {
    return React.createElement("tr", { key: kv[0] }, _elv2Td(kv[0], { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#0369A1" }), _elv2Td(React.createElement("b", { style: { color: "#9A3412" } }, "α" + kv[1] + "円")));
  });
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", margin: "0 0 4px" } }, "成立率の目安：このα以下なら約その割合でα到達（＝取引機会）。深いαほど取れた時は大きいが見送りも増える。OS値＝OS1〜3最高基準。"),
    _elv2Table(["想定成立率", "α（目安）"], aRows));
}

// 1日の目標利益（100株換算・円）。既存の理想α目標(_elIdealAlphaV2 tgtA=2500)と一致。
var _EL_DAY_TARGET_YEN = 2500;
// 横長テーブル用ラッパー（記録帳）2026-06-26: 内容が枠からはみ出す時だけ「タップして初めて横スクロール」。普段は固定でページの縦スクロールを妨げない＋右端フェードと「タップで横スクロール →」ピルで明示。タップで枠が光り横スクロール可、外をタップで解除。はみ出さない表は素通り（ピルもロックも出さない）。props.styleは外枠(余白)へ。
function _HScrollBox(props) {
  var _uA = useState(false), active = _uA[0], setActive = _uA[1];
  var _uO = useState(false), overflow = _uO[0], setOverflow = _uO[1];
  var wrapRef = useRef(null), innerRef = useRef(null);
  useEffect(function() {
    var measure = function() { var el = innerRef.current; if (el) setOverflow((el.scrollWidth - el.clientWidth) > 4); };
    measure();
    var t1 = setTimeout(measure, 250), t2 = setTimeout(measure, 1000);
    window.addEventListener("resize", measure);
    return function() { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("resize", measure); };
  }, []);
  useEffect(function() {
    if (!active) return;
    var onDoc = function(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setActive(false); };
    document.addEventListener("mousedown", onDoc, true);
    document.addEventListener("touchstart", onDoc, true);
    return function() { document.removeEventListener("mousedown", onDoc, true); document.removeEventListener("touchstart", onDoc, true); };
  }, [active]);
  var locked = overflow && !active;
  return React.createElement("div", { ref: wrapRef, style: Object.assign({ position: "relative" }, props.style || {}) },
    React.createElement("div", { ref: innerRef,
      onClickCapture: locked ? function(e) { e.preventDefault(); e.stopPropagation(); setActive(true); } : null,
      style: { overflowX: locked ? "hidden" : "auto", WebkitOverflowScrolling: "touch", borderRadius: 6, boxShadow: active ? "0 0 0 2px #FB923C" : "none", cursor: locked ? "pointer" : "auto" } },
      props.children),
    locked ? React.createElement(React.Fragment, null,
      React.createElement("div", { style: { position: "absolute", right: 0, top: 0, bottom: 0, width: 44, pointerEvents: "none", borderRadius: "0 6px 6px 0", background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,250,244,0.95))" } }),
      React.createElement("div", { onClick: function() { setActive(true); }, style: { position: "absolute", right: 6, top: 6, zIndex: 3, fontSize: 10, fontWeight: 700, color: "#9A3412", background: "rgba(255,247,237,0.97)", border: "1px solid #FB923C", borderRadius: 12, padding: "2px 10px", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" } }, "👆 タップで横スクロール →")
    ) : (active ? React.createElement("div", { style: { position: "absolute", right: 6, top: 6, zIndex: 3, fontSize: 9, fontWeight: 700, color: "#166534", background: "rgba(240,253,244,0.97)", border: "1px solid #86EFAC", borderRadius: 12, padding: "2px 10px", whiteSpace: "nowrap", pointerEvents: "none" } }, "↔ 横スクロール中・外をタップで解除") : null));
}
// 週間サマリー（記録帳・期間タブ先頭／全銘柄合算・銘柄別の両方）2026-06-26: 「1取引日あたり平均損益(＋5営業日換算/週)」と「目標(2500円/100株換算)達成率(＋5日換算の達成日数/週)」を実現損益(100株換算)/EP/H1/H2の4基準で表示。
// 2026-06-26b: 週合計の単純平均は休場で短い週があると下振れるバイアスがあるため、日ベース(1取引日あたり=Σ損益÷取引日／達成率=達成日÷取引日)へ変更。週イメージは×5営業日の換算で目安表示。週別内訳表は各週の実額のまま。
// 日別損益は本日の損益データの合計と同基準＝_elTotAccum（EP=plan / H1=holdPlanCap / H2=hold2・（）外＝○のみ・採用α基準・EP/H1/H2は値幅×100で既に100株換算）。週=月〜金(_elBucketKey)。平均の分母=取引のあった週だけ。recs=現スコープのv2算入記録・aiOf(r)→{alpha,cutLine}。
function _elWeeklyTargetSummaryV2(recs, aiOf) {
  var TARGET = _EL_DAY_TARGET_YEN;
  var list = (recs || []).filter(function(r) { return r && r.signal && r.date; });
  if (!list.length) return null;
  // 実現損益は本日の損益データ/取引テーブルと同じ100株換算（損益÷株数×100・株数未入力はそのまま・E成立分のみ）。app-04の_elTotAccum real getterと同一。
  var _get = { signal: function(r) { return r.signal; }, alpha: function(r) { return aiOf(r).alpha; }, cut: function(r) { return aiOf(r).cutLine; }, real: function(r) {
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
  var _th = function(label, ex) { return React.createElement("th", { style: Object.assign({ padding: "4px 8px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "center", fontSize: 11, color: "#9A3412", whiteSpace: "nowrap" }, ex || {}) }, label); };
  var _td = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 8px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
  var bases = [{ key: "re", label: "実現損益(100株)" }, { key: "ep", label: "EP損益" }, { key: "h1", label: "H1損益" }, { key: "h2", label: "H2損益" }];
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
      _td(_cellWP(o.ep, o.epD)),
      _td(_cellWP(o.h1, o.h1D)),
      _td(_cellWP(o.h2, o.h2D)));
  });
  var weekTable = React.createElement(_HScrollBox, null,
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
        _th("週（月〜金）", { textAlign: "left", paddingLeft: 10, color: "#555", borderBottomColor: "#ddd" }), _th("取引日", { color: "#555", borderBottomColor: "#ddd" }), _th("実現損益", { color: "#555", borderBottomColor: "#ddd" }), _th("EP損益", { color: "#555", borderBottomColor: "#ddd" }), _th("H1損益", { color: "#555", borderBottomColor: "#ddd" }), _th("H2損益", { color: "#555", borderBottomColor: "#ddd" }))),
      React.createElement("tbody", null, wkRows)));
  return React.createElement("div", { style: { marginBottom: 14, padding: "10px 12px", border: "1px solid #FB923C", borderRadius: 8, background: "#FFFCF8" } },
    React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📅 週間サマリー（目標 1日 " + TARGET.toLocaleString() + "円／100株換算）"),
    React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", marginBottom: 8 } }, "全 " + S.days + "取引日 / " + W + "週。平均は1取引日あたり（Σ損益÷取引日）＝休場・祝日に依存しない。5営業日換算/週＝1日平均×5の目安。達成率＝1日の損益が2,500円以上だった割合（達成日÷取引日）。達成日数/週＝達成率×5の換算。実現損益＝確定損益を100株換算（損益÷株数×100・E成立分）／EP/H1/H2＝（）外＝○のみ・採用α基準・既に100株換算。週別表は各週の実額。上の期間フィルタに連動。"),
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
    var nv = _elOsMaxAll(s); if (nv != null) osv.push(nv);  // 分析用OS値＝OS1〜3の最高値（結果に依らず全足・アウトカム盲目）2026-06-23
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
  // 件数ベース化（他の分析表と統一）2026-06-29: wk/mo列を「今週/今月」(カレンダー窓)から「直近50件/直近100件」(前日まで・当日除外)へ。変数名wk/moは据え置き＝描画コードの差分を最小化。
  var _recsBefore = collect(function(dt) { return dt < date; }).sort(function(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  var _lastN = function(n) { return _recsBefore.slice(Math.max(0, _recsBefore.length - n)); };
  var P = { day: mk(recsDay), wk: mk(_lastN(_EL_PERIOD_COUNTS[1])), mo: mk(_lastN(_EL_PERIOD_COUNTS[2])), all: mk(recsAll) };
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
  var table = _elv2Table(["指標", "本日", "直近" + _EL_PERIOD_COUNTS[1] + "件", "直近" + _EL_PERIOD_COUNTS[2] + "件", "全期間"], rows);
  var items = [];
  if (P.day && P.day.osMed != null && P.all.osMed != null) {
    items.push(React.createElement("span", null, "本日のOS中央値は", _elInsightEmV2(P.day.osMed + "円"), "（全期間", _elInsightEmV2(P.all.osMed + "円"), "）＝", _elInsightEmV2(P.day.osMed > P.all.osMed ? "OS最高到達が高め" : P.day.osMed < P.all.osMed ? "OS最高到達が低め" : "同程度", P.day.osMed > P.all.osMed ? "#C0392B" : P.day.osMed < P.all.osMed ? "#1E8449" : "#888"), "。"));
  }
  if (P.day && P.day.baseAlpha != null && P.all.baseAlpha != null) {
    items.push(React.createElement("span", null, "推奨基本αは 本日", _elInsightEmV2(P.day.baseAlpha + "円"), (P.mo && P.mo.baseAlpha != null ? React.createElement("span", null, "／直近" + _EL_PERIOD_COUNTS[2] + "件", _elInsightEmV2(P.mo.baseAlpha + "円")) : null), "／全期間", _elInsightEmV2(P.all.baseAlpha + "円"), "。"));
  }
  if (P.day && (P.day.ok + P.day.ng + P.day.draw)) {
    var dDen = P.day.ok + P.day.ng + P.day.draw, aDen = P.all.ok + P.all.ng + P.all.draw;
    var dStop = Math.round(P.day.stop / dDen * 100), aStop = aDen ? Math.round(P.all.stop / aDen * 100) : 0;
    items.push(React.createElement("span", null, "損切り率は 本日", _elInsightEmV2(dStop + "%"), "（全期間", _elInsightEmV2(aStop + "%"), "）＝", _elInsightEmV2(dStop < aStop ? "本日は少なめ" : dStop > aStop ? "本日は多め" : "同程度", dStop < aStop ? "#C0392B" : dStop > aStop ? "#1E8449" : "#888"), "。"));
  }
  var insight = items.length ? _elInsightBoxV2(items, { note: "本日列の↑↓は全期間比（↑赤=良い方向／↓緑=悪い方向・推奨基本αは▲▼で高低のみ）。OS=中央値・損益=平均（計＝合計・E成立分）・採用α基準。直近件数窓は当日を除く前日まで。件数 本日" + (P.day ? P.day.n : 0) + "／直近" + _EL_PERIOD_COUNTS[1] + "件窓" + (P.wk ? P.wk.n : 0) + "／直近" + _EL_PERIOD_COUNTS[2] + "件窓" + (P.mo ? P.mo.n : 0) + "／全期間" + P.all.n + "件。" }) : null;
  var pctlB = _elOsPctlV2(recsAll, _elOsMaxAll);
  var _aPill = function(v) { return v == null ? React.createElement("span", { style: { color: "#bbb" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, v + "円"); };
  var deepBlock = React.createElement("div", { style: { marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "到達率別α（全期間）"),
    React.createElement("div", { style: { fontSize: 11, color: "#555", display: "flex", flexWrap: "wrap", gap: "2px 14px" } },
      React.createElement("span", null, "到達率別α 70%→", _aPill(pctlB ? pctlB.a70 : null), " ／ 80%→", _aPill(pctlB ? pctlB.a80 : null))),
    React.createElement("div", { style: { fontSize: 8, color: "#aaa", marginTop: 2 } }, "到達率別α＝OS値分位からの目安（a70＝7割の足で到達）。"));
  return React.createElement("div", { style: { background: "#fff", border: "1px solid #e8e5de", borderRadius: 8, padding: "10px 12px", marginTop: 10 } },
    React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📊 " + stock + "：α比較・深掘り"),
    React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginBottom: 6 } }, "本日 / 直近" + _EL_PERIOD_COUNTS[1] + "件 / 直近" + _EL_PERIOD_COUNTS[2] + "件 / 全期間（直近件数窓は前日まで・件数ベース）＋ 到達率別α（この銘柄・v2記録・採用α基準）"),
    table, insight, deepBlock);
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

// ===== 損切りの分析（記録帳・銘柄別タブ「🛑損切り」／2026-06-22）=====
// エントリー成立(E成立=judge"ok")記録の損切りを多角的に分析。recs=対象v2記録・aiOf=α情報・data。
// ①損切りサマリー ②損切り値(cutLine)別シミュ＝全記録に同じ損切り値を当てた損切り回数/率・EP/H1/H2損益（★=H1損益最大の損切り値＝意思決定表） ③損切りの上振れ・早すぎ検証(_elStopOvershootSectionV2を移設) ④シグナル別の損切り率。
function _elStopTabSectionV2(recs, aiOf, data, hideSig) {
  aiOf = aiOf || function(r) { return _elAlphaInfo(r, data); };
  var BIG = 99999;
  var _h = function(t, sub) {
    return React.createElement("div", { style: { margin: "14px 0 6px" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, t),
      sub ? React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginTop: 2 } }, sub) : null);
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
    var Lc = _epHoldLadder(s, a, c), Lb = _epHoldLadder(s, a, BIG);
    if (Lc && Lc.finalPnl != null) { lossArr.push(Lc.finalPnl); if (Lb && Lb.finalPnl != null) savedArr.push(Lb.finalPnl - Lc.finalPnl); }
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
    return { cut: C, sN: sN, rate: entered.length ? sN / entered.length : 0, ep: t.plan, h1: t.holdPlanCap, h2: t.hold2 };
  });
  var bestI = 0; sim.forEach(function(x, i) { if (x.h1 > sim[bestI].h1) bestI = i; });
  var simTbl = _elv2Table(["損切り値", "損切り回数", "損切り率", "EP損益", "H1損益", "H2損益"], sim.map(function(x, i) {
    return React.createElement("tr", { key: x.cut, style: i === bestI ? { background: "#FEF3C7" } : null },
      _elv2Td(React.createElement("span", null, x.cut + "円", i === bestI ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", fontWeight: 800, marginLeft: 4 } }, "★H1最大") : null), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
      _elv2Td(x.sN + "回"),
      _elv2Td(_elStopRateCell(x.rate)),
      _elv2Td(React.createElement("span", { style: { color: _elPnlColor(x.ep) } }, _elPnlFmt(Math.round(x.ep)))),
      _elv2Td(React.createElement("b", { style: { color: _elPnlColor(x.h1) } }, _elPnlFmt(Math.round(x.h1)))),
      _elv2Td(React.createElement("span", { style: { color: _elPnlColor(x.h2) } }, _elPnlFmt(Math.round(x.h2)))));
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
    if (avoid != null) { var La = _epHoldLadder(s, a, avoid); avPnl = (La ? La.finalPnl : null); }
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
    React.createElement("span", null, "損切り値を ", _elInsightEmV2(best.cut + "円"), " にするとH1損益が最大（", _elInsightEmV2(_elPnlFmt(Math.round(best.h1))), "・損切り率 ", _elInsightEmV2(Math.round(best.rate * 100) + "%"), "）。狭め＝損切り増・浅い損失／広め＝損切り減・大きい損失のトレードオフ。"),
    savedArr.length ? React.createElement("span", null, "損切りした記録を損切りせず保有していたら合計 ", _elInsightEmV2(_elPnlFmt(Math.round(savedTotal)), savedTotal > 0 ? "#B45309" : "#1E8449"), " の差（プラス＝我慢した方が良かった／マイナス＝損切りが正解）。詳細は下の「上振れ」分析。") : null,
    worstSig ? React.createElement("span", null, "損切り率が高いシグナルは ", _elInsightEmV2("「" + stripCat(worstSig.tag) + "」（" + Math.round(worstSig.rate * 100) + "%・" + worstSig.stop + "/" + worstSig.tot + "件）"), "。") : null,
    xDecided ? React.createElement("span", null, "事前の×見送りは ", _elInsightEmV2(xRecs.length + "件"), "・正解率 ", _elInsightEmV2(xAcc + "%"), "（損失回避 ", _elInsightEmV2(xAvoidCnt + "件"), "／機会損失 ", _elInsightEmV2(xMissCnt + "件"), "）＝", _elInsightEmV2(xAcc >= 50 ? "損切りを避ける×判断は機能している" : "×判断はやや保守的（利益も逃している）"), "。") : null
  ], { note: "対象＝E成立（エントリーできた）v2記録 " + entered.length + "件。損切り＝想定/H1/H2いずれかで損切りライン（高値−α≥損切り値）到達。損切り値別シミュは全記録に同じ損切り値を当てた場合の合計（採用α基準・100株換算・損益色は赤=利益/緑=損失）。×見送り＝事前に期待度×を宣言した後にα到達した記録を「取引していたら」のEP損益で評価。" });

  return React.createElement(React.Fragment, null,
    cards,
    _h("🎚 損切り値の最適化（損切り値別シミュ）", "全記録に同じ損切り値を当てたときの損切り回数・EP/H1/H2損益。★=H1損益が最大の損切り値。狭いほど損切り増・損失浅／広いほど損切り減・損失大"),
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
      sub ? React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginTop: 2 } }, sub) : null);
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
  var _uChM = useState("h1"), chartMet = _uChM[0], setChartMet = _uChM[1];   // 期間ビューのグラフ指標（実現/EP/H1/H2）2026-06-22d
  var _uSM = useState("month"), sumMode = _uSM[0], setSumMode = _uSM[1];   // 銘柄別 集計タブの今月/全期間トグル（既定=今月）2026-06-22
  var _uSY = useState(null), sumYM = _uSY[0], setSumYM = _uSY[1];        // 集計「今月」の対象年月 {y,m}（null=当月）2026-06-22
  var _uAA = useState("all"), addAlphaFil = _uAA[0], setAddAlphaFil = _uAA[1];   // 記録帳全体トグル: 追加α 全部(all)/〇(yes)/×(no)/未選択(unset)で分析を絞る 2026-06-24（推奨基本α/追加αタブは _v2recsAll を使い独立）
  var _uAlS = useState("base"), alphaSub = _uAlS[0], setAlphaSub = _uAlS[1];   // α値タブのサブタブ: 基本α(base)/追加α(add)/共通ツール(tools) 2026-06-29（タブ内サブタブ式＝基本αと追加αを別画面に分離）
  var _uOsF = useState("no"), osDistFil = _uOsF[0], setOsDistFil = _uOsF[1];   // 追加α母数トグル: 全記録(all)/基本α母数=×+未選択(no・既定)/追加α〇のみ(yes)。集計KPI・OS分布・損切り・未達で共有。既定×+未選択＝〇(高α)混入で損切り率/未達率が上振れするのを回避 2026-07-01
  var _selSty = { padding: "5px 8px", fontSize: 11, border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#333" };
  var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
  var _ai = function(r) { return _elAlphaInfo(r, data); };
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
  var _selStock = (stockFil === _ALL_STOCK || (stockFil && _tickerList.indexOf(stockFil) >= 0)) ? stockFil : _ALL_STOCK;
  var _isAllStock = _selStock === _ALL_STOCK;
  var _periodRecs = _elFilterPeriod(allRecs, period);
  // 銘柄タブのバッジ件数: 選択期間内・銘柄未限定の記録数（顔ぶれは固定、件数だけ期間連動）
  var _cntByStock = (function() { var m = {}; _periodRecs.forEach(function(r) { if (r.stock) m[r.stock] = (m[r.stock] || 0) + 1; }); return m; })();
  var filtered = _isAllStock ? _periodRecs : _periodRecs.filter(function(r) { return r.stock === _selStock; });
  // 合計額算入: includeInTotal===false の記録は集計/分析の母集団から除外（一覧 filtered は全件のまま）。2026-06-18
  // _v2recsAll=銘柄/期間で絞ったv2算入記録（追加α〇/×/未選択は混在）＝推奨基本α/追加αタブはこれを使い全体トグルと独立。
  var _v2recsAll = filtered.filter(function(r) { return _epIsV2(r.signal) && _elInclTotal(r.signal); });
  // v2recs=全体トグル（追加α 全部/〇/×/未選択）で絞った分析母数。集計・損益・OS値・損切り・シグナル別等の分析タブが従う 2026-06-24。
  var v2recs = (addAlphaFil === "all") ? _v2recsAll : _v2recsAll.filter(function(r) { return addAlphaFil === "yes" ? _elAddAlphaYes(r.signal) : addAlphaFil === "no" ? _elAddAlphaNo(r.signal) : _elAddAlphaUnset(r.signal); });
  // 旧記録件数は算入フラグと独立に数える（除外した新形式記録を「旧記録」に混ぜない）。2026-06-18
  var oldCnt = filtered.filter(function(r) { return !_epIsV2(r.signal); }).length;
  // 未達タブのバッジ件数は、選択中シグナルの母数で数える（シグナル軸の下で _missCnt を定義 2026-07-01）。
  // 記録帳のサブタブ集合は表示中ピルで出し分け: 全銘柄合算「💰損益」は集計/期間のみ・各銘柄タブはフル分析タブ＋未達（銘柄別＝全項目を分析する方針）。2026-06-22
  var _tabs = _isAllStock
    ? [["sum", "📊 集計"], ["period", "📆 期間"]]
    : [["sum", "📊 集計"], ["alpha", "📐 α値"], ["stop", "🛑 損切り"], ["miss", "❌ 未達"], ["period", "📆 期間"], ["deep", "🔬 深掘り"]];
  var _byDateDesc = function(a, b) { return (b.date + (b.signal.time || "")).localeCompare(a.date + (a.signal.time || "")); };
  var _dow = function(ds) { var p = ds.split("-"); return ["日", "月", "火", "水", "木", "金", "土"][new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; };
  var _secH = function(t, sub) {
    // 追加α分析トグルが効いている時だけ、各セクション見出しに現在の絞り込みをバッジで明示（スクロールで見出しが目に入っても「今どの母数か」が分かる）。
    // トグルは期間タブ限定に変更（集計/α値/損切り/未達/深掘りはシグナル軸の固定母数）なので、バッジも期間タブでのみ表示 2026-07-01。
    var _fb = (addAlphaFil !== "all" && view === "period" && !_isAllStock)
      ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", fontSize: 9, fontWeight: 700, color: "#C2410C", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 4, padding: "1px 6px", marginLeft: 6, verticalAlign: "middle", whiteSpace: "nowrap" } }, "🔍 " + (addAlphaFil === "yes" ? "〇要" : addAlphaFil === "no" ? "×不要" : "未選択") + "のみ")
      : null;
    return React.createElement("div", { style: { margin: "14px 0 6px" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, t, _fb),
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
  // 損益（期間別）テーブル＝全銘柄合算をday/week/monthで集計。各損益セルに合計＋平均を併記・損切り(件数/平均額/率)列・行タップでその期間の取引記録を展開。「損益」タブの集計ビュー頭 2026-06-22d。損益基準は_elTotAccum（取引/銘柄別記録と同一）。
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
    var totOf = function(x) { return _elTotAccum(x, { signal: function(r) { return r.signal; }, alpha: function(r) { return _ai(r).alpha; }, cut: function(r) { return _ai(r).cutLine; }, real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; } }); };
    var winOf = function(x) { var ok = 0, dec = 0; x.forEach(function(r) { var s = r.signal, a = _ai(r).alpha, c = _ai(r).cutLine, res = _elDynResult(s, a, c); if (res === "ok") { ok++; dec++; } else if (res === "ng" || res === "draw") dec++; }); return dec ? Math.round(ok / dec * 100) : null; };
    // 損切り: E成立(取引できた)記録のうち 想定orH1orH2で損切りした件数・平均損切り額(キャップ=−損切り値×100)・損切り率(E成立分母)＝_elStopStatsV2/時間帯別と同基準 2026-06-27。
    var stopsOf = function(x) {
      var sn = 0, sl = 0, wn = 0;
      x.forEach(function(r) { var s = r.signal, a = _ai(r).alpha, c = _ai(r).cutLine; if (a == null) return; var _dr = _elDynResult(s, a, c); if (!(_dr === "ok" || _dr === "ng" || _dr === "draw")) return; wn++; if (_elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c) || (_elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, c))) { sn++; sl += _elCapLossYen(c); } });
      return { n: sn, avg: sn ? Math.round(sl / sn) : null, rate: wn ? Math.round(sn / wn * 100) : null };
    };
    var byP = {}; rs.forEach(function(r) { var k = keyOf(r.date); (byP[k] = byP[k] || []).push(r); });
    var keys = Object.keys(byP).sort().reverse();
    if (!keys.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 12 } }, "v2記録なし");
    var oth = function(t) { return React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
    var otd = function(ch, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, ch); };
    var winCell = function(w, ex) { return otd(w != null ? w + "%" : "—", Object.assign({ color: w != null ? (w >= 50 ? "#1E8449" : "#B45309") : "#bbb", fontWeight: 700 }, ex || {})); };
    var avgLine = function(v, cnt) { if (!cnt || v == null) return null; var a = Math.round(v / cnt); return React.createElement("span", { style: { display: "block", fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1 } }, "平均" + (a >= 0 ? "+" : "") + a.toLocaleString()); };
    var pnlCell = function(v, cnt, ref, refCnt, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenNR(v, cnt, ref, refCnt), avgLine(v, cnt)), ex); };
    var realCell = function(v, cnt, ex) { return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } }, _yenN(v, cnt), avgLine(v, cnt)), ex); };
    var stopCell = function(st, ex) {
      if (!st || st.n === 0) return otd(React.createElement("span", { style: { color: "#bbb" } }, "—"), ex);
      return otd(React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
        React.createElement("span", { style: { fontWeight: 700, color: "#1E8449" } }, st.n + "件・" + (st.rate != null ? st.rate + "%" : "—")),
        React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "平均" + (st.avg != null ? st.avg.toLocaleString() : "—") + "円")), ex);
    };
    var rows = [];
    keys.forEach(function(k) {
      var x = byP[k], t = totOf(x), st = stopsOf(x), on = ovExp === k;
      rows.push(React.createElement("tr", { key: k, onClick: function() { setOvExp(on ? null : k); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
        otd(React.createElement("span", null, React.createElement("span", { style: { color: "#F97316", marginRight: 3, fontSize: 9 } }, on ? "▼" : "▶"), labelOf(k)), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
        otd(_bizDaysIn(k) + "日", { fontWeight: 600, color: "#555" }),
        otd(x.length + "件", { fontWeight: 700 }),
        winCell(winOf(x)),
        pnlCell(t.plan, t.planCnt, t.planRef, t.planRefCnt),
        pnlCell(t.holdPlanCap, t.holdCnt, t.holdRef, t.holdRefCnt),
        pnlCell(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt),
        realCell(t.real, t.realCnt),
        stopCell(st)));
      if (on) rows.push(React.createElement("tr", { key: k + "_d" }, React.createElement("td", { colSpan: 9, style: { padding: "4px 6px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
        React.createElement("div", { style: { fontSize: 10, color: "#9A3412", fontWeight: 700, margin: "2px 0 4px" } }, labelOf(k) + " の取引記録（" + x.length + "件）"),
        _recTable(x, "full", "ovp_" + k + "_", null))));
    });
    var tt = totOf(rs), bt = { borderTop: "2px solid #FB923C" };
    var _ovTotDays = keys.reduce(function(s, k) { return s + _bizDaysIn(k); }, 0);
    var totRow = React.createElement("tr", { key: "__ovtot__", style: { background: "#FFF7ED" } },
      otd("合計", Object.assign({ textAlign: "left", paddingLeft: 8, fontWeight: 800, color: "#555" }, bt)),
      otd(_ovTotDays + "日", Object.assign({ fontWeight: 700, color: "#555" }, bt)),
      otd(rs.length + "件", Object.assign({ fontWeight: 800 }, bt)),
      winCell(winOf(rs), Object.assign({ fontWeight: 800 }, bt)),
      pnlCell(tt.plan, tt.planCnt, tt.planRef, tt.planRefCnt, bt),
      pnlCell(tt.holdPlanCap, tt.holdCnt, tt.holdRef, tt.holdRefCnt, bt),
      pnlCell(tt.hold2, tt.hold2Cnt, tt.hold2Ref, tt.hold2RefCnt, bt),
      realCell(tt.real, tt.realCnt, bt),
      stopCell(stopsOf(rs), bt));
    return React.createElement(_HScrollBox, null,
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
          oth(g === "day" ? "日" : g === "week" ? "週" : "月"), oth("日数"), oth("件数"), oth("勝率"), oth("EP損益"), oth("H1損益"), oth("H2損益"), oth("実現損益"), oth("損切り"))),
        React.createElement("tbody", null, rows),
        React.createElement("tfoot", null, totRow)));
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
        _td(React.createElement("span", null, React.createElement("div", null, s.time || _dash, _minBarBadge(s)), _epIncompleteMark(s), _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge()) : null), { color: "#666" }),
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
        var _sigParts = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
        cells = cells.concat([
          _td(_sigParts.length ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } }, _sigParts.map(function(_t, _i) { return _sigNameNode(_t, _i); })) : "(未設定)", { textAlign: "left" }),
          _td(a.alpha != null ? React.createElement("div", null, React.createElement("span", null, a.alpha + "円"), _elAlphaBreakdownNode(s, a.alpha)) : _dash, { color: "#0369A1", fontWeight: 600, background: _elAddAlphaYes(s) ? "#FEF3C7" : null }),
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
      React.createElement(_HScrollBox, null,
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
        _td(_elOsDistBarV2(os ? os.vals : null, 72, 11))
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
    return React.createElement(_HScrollBox, null,
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } }, head)),
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
      real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; }
    });
    var ss = _elStopStatsV2(rs, data), reach = n ? Math.round((ok + x) / n * 100) : null;
    // E後の勝率（実トレード=ok/ng/draw母数・_elEwinCellと同じ ok/(ok+ng+draw)）と、1営業日あたりH1損益（ΣH1÷エントリー日数）2026-06-26
    var _wOk = 0, _wNg = 0, _wDr = 0, _daySet = {};
    rs.forEach(function(r) { var ai = _ai(r), res = _elDynResult(r.signal, ai.alpha, ai.cutLine); if (res === "ok" || res === "ng" || res === "draw") { if (res === "ok") _wOk++; else if (res === "ng") _wNg++; else _wDr++; if (r.date) _daySet[r.date] = 1; } });
    var _ewinD = _wOk + _wNg + _wDr, _ewin = _ewinD ? Math.round(_wOk / _ewinD * 100) : null;
    var _entDays = 0; for (var _dk in _daySet) { if (_daySet.hasOwnProperty(_dk)) _entDays++; }
    var _perDay = (_entDays > 0 && t.holdPlanCap != null) ? Math.round(t.holdPlanCap / _entDays) : null;
    return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 } },
      _kpiCard("件数", n + "件", "#333", "v2記録のみ"),
      _kpiCard("E到達率", reach != null ? reach + "%" : "—", "#0369A1", "○" + ok + "・×" + x + "・未達" + miss),
      _kpiCard("E後の勝率", _ewin != null ? _ewin + "%" : "—", _ewin != null ? (_ewin >= 50 ? "#1E8449" : "#B45309") : "#bbb", "勝" + _wOk + "・負" + _wNg + (_wDr ? "・分" + _wDr : "") + "／E成立" + _ewinD + "件"),
      _kpiCard("EP損益", _yenNR(t.plan, t.planCnt, t.planRef, t.planRefCnt), null, t.planCnt + "件"),
      _kpiCard("H1損益", _yenNR(t.holdPlanCap, t.holdCnt, t.holdRef, t.holdRefCnt), null, t.holdCnt + "件"),
      _kpiCard("H2損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), null, t.hold2Cnt + "件"),
      _kpiCard("損切り", (ss && ss.any || 0) + "回", ss && ss.any > 0 ? "#1E8449" : "#bbb", ss && ss.rate != null ? "率" + ss.rate + "%（想" + ss.plan + "・H1 " + ss.h1 + "・H2 " + ss.h2 + "）" : null),
      _kpiCard("×見送り", x + "件", x > 0 ? "#1E8449" : "#bbb", "×宣言後の到達"),
      _kpiCard("実現損益", _yenN(t.real, t.realCnt), null, t.realCnt + "件"),
      _kpiCard("1日あたり損益", _perDay != null ? (_elPnlFmt(_perDay) + "/日") : "—", _perDay != null ? _elPnlColor(_perDay) : "#bbb", "H1基準・" + _entDays + "日エントリー"));
  };
  // 銘柄別 集計タブの本体（KPI＋各分析セクション）。今月/全期間で同じ構成を共用＝引数の記録集合rsだけ差し替える。
  var _sumStockContent = function(rs) {
    return React.createElement(React.Fragment, null,
      _kpiBlockOf(rs),
      rs.length ? React.createElement(React.Fragment, null,
        _secH("📊 OS値の分析", "初動の強さ＝OS値の中央値・帯別成績とα設定の目安（重視すべきは平均でなく中央値＝α到達確率と直結）"), _elOsSectionV2(rs, _ai)) : null,
      rs.length >= 2 ? React.createElement(React.Fragment, null,
        _secH("📈 累積損益（記録順）", "EP損益/H1/H2/実現損益の累積推移・合計行と同一基準"), React.createElement(_elCumPnlSectionV2, { recs: rs, aiOf: _ai })) : null,
      rs.length >= 2 ? React.createElement(React.Fragment, null,
        _secH("📉 連勝連敗・最大ドローダウン", "実現損益のストリークと最大DD（損失管理）"), _elStreakDDSectionV2(rs, _ai)) : null);
  };
  // 集計「今月」: 銘柄スコープ（全銘柄合算では全銘柄）の全期間v2記録（top期間ドロップダウンに依存しない）からその月のみ抽出。月は←→で移動・既定は当月。全銘柄合算の集計タブは常に今月（2026-06-26）。
  var _stockAllV2 = allRecs.filter(function(r) { return (_isAllStock || r.stock === _selStock) && _epIsV2(r.signal) && _elInclTotal(r.signal) && (addAlphaFil === "all" || (addAlphaFil === "yes" ? _elAddAlphaYes(r.signal) : addAlphaFil === "no" ? _elAddAlphaNo(r.signal) : _elAddAlphaUnset(r.signal))); });
  var _curSumYM = sumYM || (function() { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1 }; })();
  var _sumMonthRecs = _stockAllV2.filter(function(r) { var p = (r.date || "").split("-"); return (+p[0]) === _curSumYM.y && (+p[1]) === _curSumYM.m; });
  var _shiftSumM = function(delta) { var m = _curSumYM.m + delta, y = _curSumYM.y; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } setSumYM({ y: y, m: m }); setExpKey(null); };
  var _sumNavBtn = function(lbl, fn) { return React.createElement("button", { onClick: fn, style: { padding: "3px 14px", fontSize: 16, fontWeight: 800, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#9A3412" } }, lbl); };
  var _sumMonthNav = React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "6px 0 10px" } },
    _sumNavBtn("←", function() { _shiftSumM(-1); }),
    React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: "#9A3412", minWidth: 170, textAlign: "center" } }, _curSumYM.y + "年" + _curSumYM.m + "月データ早見"),
    _sumNavBtn("→", function() { _shiftSumM(1); }));
  var _sumModeBar = _isAllStock ? null : React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 6 } },
    [["all", "📆 全期間"], ["month", "📅 今月"]].map(function(g) {
      var on = sumMode === g[0];
      return React.createElement("button", { key: g[0], onClick: function() { setSumMode(g[0]); setExpKey(null); },
        style: { padding: "6px 16px", fontSize: 12, fontWeight: 700, borderRadius: 16, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } }, g[1]);
    }));
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
    var b1 = Math.max.apply(null, rows.map(function(x) { return x.t.holdCnt > 0 ? x.t.holdPlanCap : -Infinity; }));
    var b2 = Math.max.apply(null, rows.map(function(x) { return x.t.hold2Cnt > 0 ? x.t.hold2 : -Infinity; }));
    return React.createElement(_HScrollBox, null,
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
  // 追加α母数トグル（osDistFil）を集計KPI/OS分布・損切り・未達で共有。全記録/×+未選択(既定)/〇のみ。〇=高α(基本+追加)は損切り/未達に寄るため、既定×+未選択で基本α運用の素の姿を出す 2026-07-01。
  var _addFilOf = function(rs) {
    return osDistFil === "no" ? (rs || []).filter(function(r) { return r && !_elAddAlphaYes(r.signal); })
      : osDistFil === "yes" ? (rs || []).filter(function(r) { return r && _elAddAlphaYes(r.signal); })
      : (rs || []);
  };
  var _addFilBar = function() {
    return React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#9A3412" } }, "追加α母数:"),
      [["all", "全記録"], ["no", "×+未選択"], ["yes", "〇のみ"]].map(function(kv) {
        var on = osDistFil === kv[0];
        return React.createElement("button", { key: kv[0], onClick: function() { setOsDistFil(kv[0]); setExpKey(null); },
          style: { padding: "3px 11px", fontSize: 10.5, fontWeight: 700, borderRadius: 12, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#888" } }, kv[1]);
      }),
      React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, osDistFil === "no" ? "基本α運用の素の姿（追加α〇を除外）" : osDistFil === "yes" ? "追加α〇のみ" : "〇+×+未選択の全記録（〇は高αで損切り/未達に寄る）"));
  };
  var _missCnt = _addFilOf(_selSigRecs).filter(function(r) { var a = _ai(r).alpha; if (a == null || a === "") return false; var rr = _epResolve(r.signal, a); return !!(rr && rr.judge === "miss"); }).length;
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
  var _groupPanel = function(recs, stkKey, fixedRecs) {
    if (!recs || !recs.length) return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "記録なし");
    var _baRecs = (fixedRecs && fixedRecs.length) ? fixedRecs : recs;   // 推奨基本αパネルはトグル非適用の母数固定(×+未選択)で算出＝α値タブと一致 2026-06-24i
    // 追加α母数トグル(osDistFil)で母数を切替: 全記録/×+未選択(基本α運用の素の姿・既定)/〇のみ。KPI(件数/E到達/一番引っ張った損益/損切り件数)・OS分布を同じ母数で揃える＝損切り率/未達率が〇(高α)混入で上振れするのを回避 2026-07-01。
    var _osFilRecs = _addFilOf(recs);
    var t = _elTotAccum(_osFilRecs, {
      signal: function(r) { return r.signal; },
      alpha: function(r) { return _ai(r).alpha; },
      cut: function(r) { return _ai(r).cutLine; },
      real: function(r) { return _elIsEntered(r.signal, r.item) ? _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) : null; }
    });
    var _osAll = _elOsStatsV2(recs, _elOsMaxAll);
    var os = _elOsStatsV2(_osFilRecs, _elOsMaxAll), ss = _elStopStatsV2(_osFilRecs, data), pcg = _elOsPctlV2(_osFilRecs, _elOsMaxAll);
    var _baA = _elBaseAlphaA(_baRecs, _ai);   // {pick, add}＝推奨基本α(母数×+未選択)＋推奨追加α(母数〇のみ)。KPIカードとOS分布▲マークで共用 2026-07-01
    var _baPick = _baA ? _baA.pick : null, _baAdd = _baA ? _baA.add : null;
    var _baPickAlpha = (_baPick && _baPick.alpha != null) ? _baPick.alpha : null;   // OS値分布に推奨基本αを青字マーク（母数はトグル非依存の_baRecs＝推奨基本α表示と一致）
    var _baCutPick = _elCutPick(_baRecs, _ai);   // 推奨損切り値（母数は_baRecs＝基本αと同じ・_elOsHistV2の赤マーク markVal3 用）2026-07-01
    var _baCutVal = (_baCutPick && _baCutPick.cut != null && _baCutPick.status !== "none") ? _baCutPick.cut : null;
    // OS分布の赤マーク(損切りライン位置): 〇のみ＝基本α＋追加α＋損切り／×+未選択＝基本α＋損切り（全記録は出さない）2026-07-01
    var _osRedMark = null, _osRedLabel = null;
    if (_baPickAlpha != null && _baCutVal != null) {
      if (osDistFil === "yes" && _baAdd && _baAdd.improved && _baAdd.add != null) { _osRedMark = _baPickAlpha + _baAdd.add + _baCutVal; _osRedLabel = "推奨基本α＋追加α＋損切り値"; }
      else if (osDistFil === "no") { _osRedMark = _baPickAlpha + _baCutVal; _osRedLabel = "推奨基本α＋損切り値"; }
    }
    var ok = 0, x = 0, miss = 0, _osXVals = [];
    _osFilRecs.forEach(function(r) { var rr = _epResolve(r.signal, _ai(r).alpha), j = rr ? rr.judge : null; if (j === "ok") ok++; else if (j === "x") { x++; var _xv = _elOsMaxAll(r.signal); if (_xv != null && !isNaN(_xv)) _osXVals.push(_xv); } else if (j === "miss") miss++; });
    // KPIカード（ユーザー指定6項目・件数/E到達/一番引っ張った損益/損切り件数は追加α母数トグルに連動 2026-07-01）: 件数／E到達数（到達率）／一番引っ張った損益／損切り件数（損切り率）／推奨基本α（次点も）／推奨追加α（次点も）。
    var _reach = ok + x, _reachRate = _osFilRecs.length ? Math.round(_reach / _osFilRecs.length * 100) : 0;
    var _kpiBase = (function() {
      if (!_baPick || _baPick.alpha == null) return _kpiCard("推奨基本α値", "—", "#94A3B8", "データ不足");
      var na = _baPick.status === "na";
      var sub = (_baPick.alpha2 != null) ? ("次点 " + _baPick.alpha2 + "円") : (na ? "件数不足で参考値" : "次点なし");
      return _kpiCard("推奨基本α値", _baPick.alpha + "円" + (na ? "（参考）" : ""), na ? "#B45309" : "#0369A1", sub);
    })();
    var _kpiAdd = (function() {
      if (!_baAdd || !_baAdd.improved) return _kpiCard("推奨追加α値", "—", "#94A3B8", _baAdd ? "推奨無し（基本αで十分）" : "追加α〇の記録なし");
      var sub = (_baAdd.add2 != null) ? ("次点 +" + _baAdd.add2 + "円") : "次点なし";
      return _kpiCard("推奨追加α値", "+" + _baAdd.add + "円", "#9A3412", sub);
    })();
    return React.createElement(React.Fragment, null,
      _addFilBar(),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 10 } },
        _kpiCard("件数", _osFilRecs.length + "件", "#333"),
        _kpiCard("E到達数（到達率）", _reach + "件（" + _reachRate + "%）", "#0369A1", "○" + ok + "・×" + x + "・未達" + miss),
        _kpiCard("一番引っ張った損益", _yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt), null, "○で最深（○△）・" + t.hold2Cnt + "件"),
        _kpiCard("損切り件数（損切り率）", (ss.any || 0) + "回（" + (ss.rate != null ? ss.rate : 0) + "%）", ss.any > 0 ? "#1E8449" : "#bbb", "E成立が分母"),
        _kpiBase,
        _kpiAdd),
      _osAll ? React.createElement("div", { style: { background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "10px 12px", marginBottom: 4 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", marginBottom: 4 } }, "OS値分布（OS1〜3最高・1円刻み）"),
          React.createElement("div", { style: { fontSize: 9.5, color: "#aaa", marginBottom: 6 } }, "母数は上の「追加α母数」トグルに連動（" + (osDistFil === "no" ? "×+未選択＝▲推奨基本αと同じ母数" : osDistFil === "yes" ? "追加α〇のみ" : "全記録") + "）"),
          os ? React.createElement(React.Fragment, null,
            React.createElement("div", { style: { display: "flex", gap: "4px 16px", flexWrap: "wrap", fontSize: 12, color: "#555", marginBottom: 7, alignItems: "baseline" } },
              React.createElement("span", null, "中央 ", React.createElement("b", { style: { color: "#9A3412", fontSize: 15 } }, os.med + "円"), (pcg && pcg.skewRight) ? React.createElement("span", { title: "平均が大きいOS値に上振れ。典型値は中央値で読むのが安全。", style: { display: "inline-block", fontSize: 8, fontWeight: 800, color: "#fff", background: "#B45309", borderRadius: 3, padding: "0 4px", marginLeft: 4 } }, "右偏") : null),
              React.createElement("span", null, "平均 ", React.createElement("b", null, os.avg + "円")),
              React.createElement("span", null, "最頻 ", React.createElement("b", null, pcg ? _elOsBucketLabel(pcg.bucketMode.key) : os.mode.val + "円")),
              React.createElement("span", null, "範囲 ", React.createElement("b", null, os.min + "〜" + os.max + "円")),
              pcg ? React.createElement("span", null, "α目安 ", React.createElement("b", { style: { color: "#0369A1" } }, "7割=α" + pcg.a70 + "円")) : null,
              React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "（" + _osFilRecs.length + "件）")),
            React.createElement("div", { style: { margin: "4px 0 6px" } }, React.createElement(_elOsHistV2, { vals: os.vals, recs: _osFilRecs, aiOf: _ai, xVals: _osXVals, markVal: _baPickAlpha,
              markVal2: (osDistFil === "yes" && _baPickAlpha != null && _baAdd && _baAdd.improved && _baAdd.add != null) ? (_baPickAlpha + _baAdd.add) : null,
              markVal3: _osRedMark, mark3Label: _osRedLabel })),
            _elOsBandLegendV2())
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "10px 0", fontSize: 11 } }, "この母数に該当する記録がありません")) : null,
      _secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝α別の総当たり（各αの到達率/件数/損切り率/H1勝率/スコア）"),
      _elBaseAlphaDetailV2(_baRecs, _ai),
      _elFloatReasonSectionV2(_baRecs, _ai, data, _secH, _baPick, { expKey: expKey, setExpKey: setExpKey, onEdit: function(rec) { setEditTarget(rec); }, onGoDate: onSelectDate }),
      React.createElement(_SNCollapse, { title: "詳細分析（EP位置・累積損益・α感応度・時間帯別・曜日別・期待度×/△）", render: function() {   // 遅延描画 2026-06-29: 閉じている間は重い7セクションを計算しない＝シグナル別パネルの体感速度（汎用分析は各専用タブにも全体版あり）
        return React.createElement(React.Fragment, null,
          _addFilBar(),
          _secH("📍 EP位置の分析", "EPがどの足で成立したか（採用α基準）"), _elEpPosSectionV2(_osFilRecs, _ai),
          _osFilRecs.length >= 2 ? React.createElement(React.Fragment, null, _secH("📈 累積損益（記録順）"), React.createElement(_elCumPnlSectionV2, { recs: _osFilRecs, aiOf: _ai })) : null,
          _secH("📉 α感応度カーブ", "α=0〜20円で再計算した合計の推移"), _elAlphaCurveSectionV2(_osFilRecs, _ai),
          _secH("🕘 時間帯別の成績（寄り付き重視）", "寄り足OSが出た時刻で分類。9:15／9:30までの早い寄り足OSの成績"), _elTimeOfDaySectionV2(_osFilRecs, _ai),
          _secH("📅 曜日別の成績", "月〜金別の件数・OS中央値・勝率・損切り率・平均EP/H1損益"), _elDowSectionV2(_osFilRecs, _ai),
          _secH("🚫 期待度×（見送り）の分析", "このグループの×見送りを取引していたらの損益と、見送り判断の精度（損失回避＝正解／機会損失＝逃した利益）"), _elXSkipSectionV2(_osFilRecs, _ai),
          _secH("🔺 期待度△（ホールド）の分析", "△で保有したH1/H2を本算入(（）外算入)していたらの損益と、△保有の是非（活きた＝1段下より伸長／裏目＝1段下で手仕舞いが正解）"), _elTriangleHoldSectionV2(_osFilRecs, _ai));
      } }),
      _addFilBar(), _secH("🗂 記録一覧（行タップで明細・追加α母数トグルに連動）"), _recTable(_osFilRecs.slice().sort(_byDateDesc), "full", "gp_"));
  };

  // ===== タブ本体 =====
  var _tabBody;
  if (view === "sum") {
    if (_isAllStock) {
      // KPI早見だけ「今月」＝〇年〇月データ早見（←→で月移動）。「全体損益（期間別）」以降（累積・連勝連敗）は今月縛り無し＝v2recs（top期間ドロップダウン準拠）。2026-06-26。
      _tabBody = React.createElement(React.Fragment, null,
        _sumMonthNav,
        _sumMonthRecs.length ? _kpiBlockOf(_sumMonthRecs)
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, _curSumYM.y + "年" + _curSumYM.m + "月の記録はありません（←→で月を移動）"),
        React.createElement(React.Fragment, null,
          _secH("💰 全体損益（期間別）", "全銘柄合算（今月縛り無し）。下のボタンで日別/週別/月別を切替（損益基準は取引・銘柄別記録と同一・v2記録のみ）"),
          React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
            [["day", "日別"], ["week", "週別"], ["month", "月別"]].map(function(g) {
              var on = (gran === "custom" ? "week" : gran) === g[0];
              return React.createElement("button", { key: g[0], onClick: function() { setGran(g[0]); },
                style: { padding: "5px 14px", fontSize: 12, fontWeight: 700, borderRadius: 16, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } }, g[1]);
            })),
          _ovPnlTbl(v2recs, gran === "custom" ? "week" : gran)),
        v2recs.length >= 2 ? React.createElement(React.Fragment, null,
          _secH("📈 累積損益（記録順）", "EP損益/H1/H2/実現損益の累積推移・合計行と同一基準"), React.createElement(_elCumPnlSectionV2, { recs: v2recs, aiOf: _ai })) : null,
        v2recs.length >= 2 ? React.createElement(React.Fragment, null,
          _secH("📉 連勝連敗・最大ドローダウン", "実現損益のストリークと最大DD（損失管理）"), _elStreakDDSectionV2(v2recs, _ai)) : null);
    } else {
      // 銘柄別の集計＝選択中シグナルの総合パネル（旧🎯シグナル別タブを昇格・上のシグナル軸で切替）。母数はトグル非依存の固定母数（_selSigRecs）。2026-07-01
      _tabBody = _sigAxisGroups.length
        ? (_selSigRecs.length ? _groupPanel(_selSigRecs, null, _selSigRecs)
            : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "このシグナルのv2記録がありません"))
        : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この銘柄に集計できるシグナルがありません（EP起算v2の記録なし）");
    }
  } else if (view === "alpha") {
    if (!_selSigRecs.length) {
      _tabBody = React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, _sigAxisGroups.length ? "このシグナルのEP起算（v2）記録がありません" : "EP起算（v2）の記録がありません");
    } else {
      // α値タブ＝タブ内サブタブ式（2026-06-29）: 基本α(青)/追加α(茶橙)/共通ツール(グレー)を別画面に分離し「ごっちゃ」を解消。母数は選択中シグナルの固定母数（_selSigRecs・トグル非依存）2026-07-01。
      var _alA = _elBaseAlphaA(_selSigRecs, _ai);
      var _alphaTable = _alphaTableFn(_selSigRecs);
      var _alPick = _alA ? _alA.pick : null;
      var _alAdd = _alA ? _alA.add : null;
      var _alphaSubs = [["base", "① 基本α", "#0369A1"], ["add", "② 追加α", "#9A3412"], ["tools", "③ α早見・ツール", "#64748B"]];
      var _alSel = _alphaSubs.some(function(p) { return p[0] === alphaSub; }) ? alphaSub : "base";
      var _alphaPills = React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 8px", marginBottom: 2 } },
        _alphaSubs.map(function(p) {
          var on = _alSel === p[0];
          return React.createElement("button", { key: p[0], onClick: function() { setAlphaSub(p[0]); setExpKey(null); },
            style: { flexShrink: 0, padding: "7px 16px", fontSize: 12.5, fontWeight: 800, borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap", border: "1px solid " + (on ? p[2] : "#ddd"), background: on ? p[2] : "#fff", color: on ? "#fff" : "#666" } }, p[1]);
        }));
      var _alZoneHead = function(color, bg, brd, label, sub) {
        return React.createElement("div", { style: { background: bg, border: "1px solid " + brd, borderLeft: "4px solid " + color, borderRadius: 8, padding: "8px 12px", marginBottom: 6 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: color, marginBottom: sub ? 3 : 0 } }, label), sub);
      };
      var _alBaseSum;
      if (_alPick && _alPick.alpha != null) {
        var _bna = _alPick.status === "na";
        _alBaseSum = React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: _bna ? "#B45309" : "#0369A1" } }, "推奨基本α " + _alPick.alpha + "円", _alPick.alpha2 != null ? React.createElement("span", { style: { fontSize: 11, fontWeight: 700, marginLeft: 6 } }, "（次点 " + _alPick.alpha2 + "円）") : null, _bna ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, marginLeft: 4 } }, "参考") : null);
      } else {
        _alBaseSum = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#94A3B8" } }, "推奨基本α：データ不足");
      }
      var _alAddSum;
      if (_alAdd && _alAdd.improved) {
        _alAddSum = React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#9A3412" } }, "推奨追加α +" + _alAdd.add + "円", _alAdd.add2 != null ? React.createElement("span", { style: { fontSize: 11, fontWeight: 700, marginLeft: 6, color: "#94A3B8" } }, "（次点：+" + _alAdd.add2 + "円）") : null);
      } else {
        _alAddSum = React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#94A3B8" } }, _alAdd ? "推奨追加α：推奨無し（基本αで十分の傾向）" : "推奨追加α：追加α〇の記録なし");
      }
      var _alBody;
      if (_alSel === "base") {
        _alBody = React.createElement(React.Fragment, null,
          _alZoneHead("#0369A1", "#F0F9FF", "#BAE6FD", "基本αゾーン ― まず取る土台（最低限とる利幅）", React.createElement(React.Fragment, null, _alBaseSum, React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", marginTop: 3 } }, "このシグナル（" + _selSigRecs.length + "件）の推奨。期間別の推移は下の「期間推移」で。"))),
          _secH("🎯 成立率の目安（OS値→α分位）", "OS値（OS1〜3最高）の分位から、各成立率に対応するαの目安。基本αを決める前の“α候補レンジ”"),
          _elOsAlphaPctlTableV2(_selSigRecs),
          _secH("🔬 推奨基本α 詳細データ", "推奨値が出た根拠＝α別の総当たり（各αの到達率/件数/損切り率/H1勝率/スコア）"),
          _elBaseAlphaDetailV2(_selSigRecs, _ai));
      } else if (_alSel === "add") {
        _alBody = React.createElement(React.Fragment, null,
          _alZoneHead("#9A3412", "#FFF7ED", "#FED7AA", "追加αゾーン ― 局面で基本αへ上乗せする加算分", React.createElement(React.Fragment, null, _alAddSum, React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", marginTop: 3 } }, "母数は追加α〇（要）を明示した記録のみ（基本αとは別プール）。期間別は下の表で。"))),
          _secH("🎯 推奨追加α値（期間別）", "このシグナルの追加α〇の記録だけを母数に、各期間（直近25件/50件/100件/全期間・" + todayStr() + "の前日まで）で基本α＋推奨追加αを当てた 損切り率/H1勝率/到達率/想定損益。〇記録の無い期間は—"),
          _elAddAlphaPeriodTableV2(_selSigRecs, _ai, todayStr(), false),
          _secH("📐 追加α値の分析", "このシグナルで追加α〇（要）を明示した記録だけが母数。足した判断が当たっていたか（基本αだけの場合とのH1反実仮想比較）・最適な上乗せ幅・根拠別の成績。〇はもともと少なめ＝件数が薄いと「参考」表示になります"),
          _elAddAlphaSectionV2(_selSigRecs, _ai, data));
      } else {
        _alBody = React.createElement(React.Fragment, null,
          _alZoneHead("#64748B", "#F8FAFC", "#E2E8F0", "共通ツール ― 基本/追加に依らないα全体の検証", React.createElement("div", { style: { fontSize: 10, color: "#64748B" } }, "このシグナルの記録をα=0〜20円で再計算し、利益が最大になるα（★）を確認して最終微調整。")),
          _alphaTable ? React.createElement(React.Fragment, null, _secH("🎯 α意思決定表", "α=0〜20円で再計算・損切り値は各記録の採用値・★=H1/H2の利益最大α"), _alphaTable) : null,
          _secH("📉 α感応度カーブ", "このシグナルの記録をα=0〜20円で再計算した合計の推移（意思決定表のグラフ版）"),
          _elAlphaCurveSectionV2(_selSigRecs, _ai));
      }
      _tabBody = React.createElement(React.Fragment, null,
        React.createElement("div", { style: { fontSize: 11, color: "#64748B", marginBottom: 6 } }, "「" + stripCat(_selSigKey) + "」シグナル（" + _selStock + "）のα分析。EP起算（v2）の" + _selSigRecs.length + "件で算出。下のタブで 基本α／追加α／共通ツール を切替（母数はトグル非依存の固定母数）。上のシグナル軸で他シグナルへ切替できます。"),
        _alphaPills,
        _alBody);
    }
  } else if (view === "stop") {
    var _stRecs = _addFilOf(_selSigRecs);
    _tabBody = _selSigRecs.length ? React.createElement(React.Fragment, null,
      _addFilBar(),
      _secH("🛑 損切りの分析（このシグナル）", "選択中シグナルのエントリーできた記録の損切りを多角的に分析。損切り値の最適化（損切り値別シミュ）・上振れ（早すぎ検証）。母数は上のトグル（既定＝×+未選択＝基本α運用の素の損切り率。〇は高αで損切りに寄る）"),
      _stRecs.length ? _elStopTabSectionV2(_stRecs, _ai, data, true) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この母数に該当する記録がありません（トグルを切替）"))
      : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "このシグナルのEP起算（v2）記録がありません");
  } else if (view === "period") {
    var _timeScope = (gran === "custom") ? v2recs.filter(function(r) { return (!cFrom || r.date >= cFrom) && (!cTo || r.date <= cTo); }) : v2recs;   // 時間帯別/曜日別は指定期間モードのときその範囲(_crecs相当)に追従 2026-06-28
    _tabBody = React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 10, color: "#9A3412", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 6, padding: "5px 9px", marginBottom: 8 } }, "🎯 期間タブはこの銘柄の全シグナル合算（時系列の俯瞰）。上のシグナル軸の選択では絞り込まれません。"), _elWeeklyTargetSummaryV2(v2recs, _ai), (function() {
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
      var _metInfo = { real: { label: "実現損益", get: function(t) { return t.real || 0; } }, plan: { label: "EP損益", get: function(t) { return t.plan || 0; } }, h1: { label: "H1損益", get: function(t) { return t.holdPlanCap || 0; } }, h2: { label: "H2損益", get: function(t) { return t.hold2 || 0; } } };
      var _mi = _metInfo[chartMet] || _metInfo.h1;
      var _xt = [], _step = Math.max(1, Math.ceil(_chartKeys.length / 6));
      var _per = _chartKeys.map(function(k, i) { var t = _periodTot(_byP[k]), rr = _ratesOf(_byP[k]); if (i % _step === 0 || i === _chartKeys.length - 1) _xt.push({ i: i, label: _labelOf(k) }); return { label: _labelOf(k), value: _mi.get(t), win: rr.win }; });
      var _cum = [], _cs = 0; _per.forEach(function(p) { _cs += p.value; _cum.push(_cs); });
      var _dayBy = {}; v2recs.forEach(function(r) { (_dayBy[r.date] = _dayBy[r.date] || []).push(r); });
      var _dayPer = Object.keys(_dayBy).map(function(dk) { var t = _periodTot(_dayBy[dk]); return { date: dk, value: _mi.get(t) }; });
      var _metBtns = React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
        [["real", "実現損益"], ["plan", "EP損益"], ["h1", "H1損益"], ["h2", "H2損益"]].map(function(m) {
          var on = chartMet === m[0];
          return React.createElement("button", { key: m[0], onClick: function() { setChartMet(m[0]); }, style: { padding: "4px 12px", fontSize: 11, fontWeight: 700, borderRadius: 14, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } }, m[1]);
        }));
      var _cumChart = _chartKeys.length >= 2 ? _elLineChartV2([{ label: "累積" + _mi.label, color: "#C0392B", pts: _cum }], { xTicks: _xt }) : null;
      var _charts = React.createElement(React.Fragment, null,
        _metBtns,
        _secH("📊 損益バー＋勝率（" + _mi.label + "）", "各期間の損益を上下バー（赤=利益/緑=損失）＋勝率を破線(右軸)で重ねる"),
        _elBarChartV2(_per, {}),
        _cumChart ? React.createElement(React.Fragment, null, _secH("📈 累積損益カーブ（" + _mi.label + "）", "右肩上がりなら勝ち越し（資産曲線）"), _cumChart) : null,
        _secH("🟥 ヒートマップ（曜日揃え・日別・" + _mi.label + "）", "列＝曜日(月〜金)で縦に揃え、曜日ごとの傾向を見る。色の濃淡で損益（赤=利益/緑=損失）・上が古い週→下が最新週・記録の無い営業日枠は薄い空セル"),
        _elWeekdayHeatV2(_dayPer, {}));
      var _thP = function(t) { return React.createElement("th", { style: { padding: "5px 5px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, t); };
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
        var rs = _byP[k], t = _periodTot(rs), rr = _ratesOf(rs), on = perExp === k;
        _rows.push(React.createElement("tr", { key: k, onClick: function() { setPerExp(on ? null : k); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
          _tdP(React.createElement("span", null, React.createElement("span", { style: { color: "#F97316", marginRight: 3, fontSize: 9 } }, on ? "▼" : "▶"), _labelOf(k)), { textAlign: "left", paddingLeft: 8, fontWeight: 700, color: "#9A3412" }),
          _tdP(_bizDaysIn(k) + "日", { fontWeight: 600, color: "#555" }),
          _tdP(rs.length + "件", { fontWeight: 700 }),
          _tdP(_yenNR(t.plan, t.planCnt, t.planRef, t.planRefCnt)),
          _tdP(_yenNR(t.holdPlanCap, t.holdCnt, t.holdRef, t.holdRefCnt)),
          _tdP(_yenNR(t.hold2, t.hold2Cnt, t.hold2Ref, t.hold2RefCnt)),
          _tdP(_yenN(t.real, t.realCnt)),
          _tdP(_elEwinCell(rr.ok, rr.ng, rr.draw)),
          _tdP(rr.soft + "%", { color: rr.soft > 0 ? "#B45309" : "#bbb", fontWeight: rr.soft > 0 ? 700 : 400 }),
          _tdP(rr.stop + "%", { color: rr.stop > 0 ? "#1E8449" : "#bbb", fontWeight: rr.stop > 0 ? 700 : 400 })));
        if (on) _rows.push(React.createElement("tr", { key: k + "_d" }, React.createElement("td", { colSpan: 10, style: { padding: "6px 8px 10px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } }, _detailOf(rs))));
      });
      return React.createElement(React.Fragment, null,
        _secH("📆 期間集計（" + (gran === "day" ? "日別" : gran === "week" ? "週別" : "月別") + "・新しい順）", "行タップでその期間の詳細分析（シグナル成功度・時間帯傾向・EP位置）"), _granBtns,
        React.createElement("div", { style: { marginBottom: 8 } }, _charts),
        React.createElement(_HScrollBox, null,
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
              _thP(gran === "day" ? "日" : gran === "week" ? "週" : "月"), _thP("日数"), _thP("件数"), _thP("EP損益"), _thP("H1損益"), _thP("H2損益"), _thP("実現損益"), _thP("E後の勝率"), _thP("見切り率"), _thP("損切り率"))),
            React.createElement("tbody", null, _rows))));
    })(),
    _secH("🕘 時間帯別の成績（寄り付き重視）", "寄り足OSが出た時刻で分類。9:15／9:30までに出た寄り足OSがどの程度OSし、成功（E成立・勝率）／損切りしているか。集計タブから移設（指定期間のときはその範囲に追従）"), _elTimeOfDaySectionV2(_timeScope, _ai),
    _secH("📅 曜日別の成績", "月〜金別の件数・OS中央値・勝率・損切り率・平均EP/H1損益（どの曜日が成功しやすいか）。集計タブから移設（指定期間のときはその範囲に追従）"), _elDowSectionV2(_timeScope, _ai));
  } else if (view === "deep") {
    _tabBody = _selSigRecs.length ? React.createElement(React.Fragment, null,
      React.createElement("div", { style: { fontSize: 10, color: "#9A3412", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 6, padding: "5px 9px", marginBottom: 8 } }, "ℹ 深掘りは全記録（〇+×+未選択）を各記録の採用α基準で分析（本数最適化・EP位置・執行の学習が目的）。追加α〇は採用αが高いため損切り率は高め・未達で母数から抜けやすい点に注意。〇/×の分離は集計/損切り/未達タブの「追加α母数」トグルで。"),
      _secH("⏳ 最適ホールド本数", "EPから何本持つのが最も期待値が高いか（深さ別の平均損益・損切り率・EP比改善率）"), _elHoldDepthSectionV2(_selSigRecs, _ai),
      _secH("🎯 期待度キャリブレーション", "事前のH期待が実結果とどれだけ一致したか（予想は当たっているか過信か）"), _elExpCalibSectionV2(_selSigRecs, _ai),
      _secH("🚫 期待度×（見送り）の分析", "×見送りを取引していたらの損益と、見送り判断の精度（損失回避＝正解／機会損失＝逃した利益）。集計タブから移設"), _elXSkipSectionV2(_selSigRecs, _ai),
      _secH("🔺 期待度△（ホールド）の分析", "△で保有したH1/H2を本算入(（）外算入)していたらの損益と、△保有の是非（活きた＝1段下より伸長／裏目＝1段下で手仕舞いが正解）。集計タブから移設"), _elTriangleHoldSectionV2(_selSigRecs, _ai),
      _secH("📍 EP位置の分析", "EPがどの足で成立したか（採用α基準）とEP位置別の成績。集計タブから移設"), _elEpPosSectionV2(_selSigRecs, _ai),
      _secH("🎯 計画EP vs 実エントリーの乖離", "計画したEP/αに対し実際の建玉・取引αがどれだけズレたか（執行の質・規律）"), _elExecGapSectionV2(_selSigRecs, _ai),
      _secH("📝 メモ×成績", "根拠/反省を書いた記録ほど勝てているか＋負けた記録の頻出キーワード（敗因）"), _elMemoPerfSectionV2(_selSigRecs, _ai)
    ) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "このシグナルのEP起算（v2）記録がありません");
  } else if (view === "miss") {
    var _msRecs = _addFilOf(_selSigRecs);
    _tabBody = _isAllStock
      ? React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "上の銘柄タブで銘柄を選ぶと、その銘柄の未達分析を表示します")
      : (_selSigRecs.length
          ? React.createElement(React.Fragment, null,
              _addFilBar(),
              _secH("❌ 未達記録の分析（このシグナル）", "選択中シグナルで、αに3本以内（OS1〜3）で届かずエントリーできなかった記録の詳細（×見送りは除く）。最高値の分布・α不足額・α下げシミュ。母数は上のトグル（既定＝×+未選択＝シグナル本来の到達性。〇は高αで未達に寄る）"),
              _msRecs.length ? _elMissSectionV2(_msRecs, _ai, true) : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "16px 0", fontSize: 12 } }, "この母数に該当する記録がありません（トグルを切替）"))
          : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "20px 0", fontSize: 12 } }, "このシグナルのEP起算（v2）記録がありません"));
  }

  return React.createElement("div", { style: { padding: "12px 14px", maxWidth: 1100, margin: "0 auto" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" } },
      onBack ? React.createElement("button", { onClick: onBack, style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" } }, "← 戻る") : null,
      React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: "#1a1a1a" } }, "📒 エントリー記録帳"),
      _alphaSimBtn({ stock: _isAllStock ? undefined : _selStock, period: period === "1w" ? "week" : period === "all" ? "all" : "recent" }),
      React.createElement("button", { onClick: function() { setEditTarget({}); }, style: { padding: "7px 12px", fontSize: 12, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", marginLeft: "auto" } }, "＋ 新規記録"),
      React.createElement("select", { value: period, onChange: function(e) { setPeriod(e.target.value); }, style: _selSty },
        [["all", "全期間"], ["1w", "今週"], ["1m", "1ヶ月"], ["3m", "3ヶ月"], ["6m", "6ヶ月"], ["1y", "1年"]].map(function(kv) { return React.createElement("option", { key: kv[0], value: kv[0] }, kv[1]); }))),
    React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 8px", marginBottom: 2, borderBottom: "2px solid #f0ede8" } },
      React.createElement("button", { key: "__allbtn__", onClick: function() { setStockFil(_ALL_STOCK); setExpKey(null); setSelDate(null); setSelSig(null); setPerExp(null); setAddAlphaFil("all"); if (view !== "sum" && view !== "period") setView("sum"); },
        style: { flexShrink: 0, padding: "7px 16px", fontSize: 12.5, fontWeight: 800, borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap",
          border: "1px solid " + (_isAllStock ? "#1a1a1a" : "#ddd"), background: _isAllStock ? "#1a1a1a" : "#fff", color: _isAllStock ? "#fff" : "#666" } },
        "💰 損益 (" + _periodRecs.length + ")"),
      _tickerList.length ? _tickerList.map(function(s) {
        var on = _selStock === s;
        return React.createElement("button", { key: s, onClick: function() { setStockFil(s); setExpKey(null); setSelDate(null); setSelSig(null); setPerExp(null); },
          style: { flexShrink: 0, padding: "7px 14px", fontSize: 12.5, fontWeight: 800, borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } },
          s + " (" + (_cntByStock[s] || 0) + ")");
      }) : null),
    (!_isAllStock && _sigAxisGroups.length) ? React.createElement("div", { style: { marginBottom: 6 } },
      React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 6px", alignItems: "center" } },
        React.createElement("span", { style: { flexShrink: 0, fontSize: 10, fontWeight: 800, color: "#9A3412", marginRight: 2 } }, "🎯 シグナル"),
        _sigAxisGroups.map(function(g) {
          var on = _selSigKey === g.key;
          var lowN = g.recs.length < _EL_BASE_MIN_N;
          return React.createElement("button", { key: g.key, onClick: function() { setSelSig(g.key); setExpKey(null); },
            style: { flexShrink: 0, padding: "6px 13px", fontSize: 12, fontWeight: 700, borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap",
              border: "1px solid " + (on ? "#9A3412" : "#e0d8cf"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : (lowN ? "#c0b6ab" : "#666") } },
            g.label + " (" + g.recs.length + ")" + (lowN ? " 参考" : ""));
        })),
      React.createElement("div", { style: { fontSize: 9.5, color: "#aaa" } }, "銘柄の下でシグナルを選択＝集計/α値/損切り/未達/深掘りをそのシグナルで分析（母数はトグル非依存の固定母数）。「参考」＝件数" + _EL_BASE_MIN_N + "件未満で推奨がノイズになりやすい。複数タグは各タグに算入。期間は全シグナル合算。")) : null,
    React.createElement("div", { style: { display: "flex", gap: 2, marginBottom: 6, borderBottom: "1px solid #e0ddd6", overflowX: "auto" } },
      _tabs.map(function(kv) {
        var on = view === kv[0];
        var cnt = kv[0] === "miss" ? _missCnt : null;
        return React.createElement("button", { key: kv[0],
          onClick: function() { setView(kv[0]); setExpKey(null); },
          style: { padding: "8px 12px", fontSize: 12, fontWeight: 700, background: "none", border: "none", cursor: "pointer",
            borderBottom: on ? "2px solid #1a1a1a" : "2px solid transparent", color: on ? "#1a1a1a" : "#888", whiteSpace: "nowrap" }
        }, kv[1] + (cnt != null ? "(" + cnt + ")" : ""));
      })),
    (view === "period" && !_isAllStock) ? React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 5, padding: "6px 9px", borderRadius: 8, background: addAlphaFil !== "all" ? "#FFF7ED" : "#fff", border: "1px solid " + (addAlphaFil !== "all" ? "#FB923C" : "#f0ede8"), boxShadow: "0 2px 4px -2px rgba(0,0,0,0.12)" } },   // 追加α分析トグル＝期間タブ限定（集計/α値/損切り/未達/深掘りはシグナル軸の固定母数でトグル非適用・全銘柄合算=非表示）。絞り込み中は橙で強調 2026-07-01
      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412" } }, "追加α分析:"),
      [["all", "全部"], ["yes", "〇 要"], ["no", "× 不要"], ["unset", "未選択"]].map(function(kv) {
        var on = addAlphaFil === kv[0];
        return React.createElement("button", { key: kv[0], onClick: function() { setAddAlphaFil(kv[0]); setExpKey(null); },
          style: { padding: "4px 12px", fontSize: 11, fontWeight: 700, borderRadius: 14, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#666" } }, kv[1]);
      }),
      addAlphaFil !== "all" ? React.createElement("span", { style: { fontSize: 10, color: "#C2410C", fontWeight: 700 } }, "🔍 " + (addAlphaFil === "yes" ? "〇要" : addAlphaFil === "no" ? "×不要" : "未選択") + " のみで母数を絞り込み中（「全部」で解除）") : null) : null,
    React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "銘柄→シグナルの順に選択。集計/α値/損切り/未達/深掘りは選んだシグナルで分析（期間は全シグナル合算）。「損益」は全銘柄合算（集計・期間のみ）。分析タブはEP起算方式（v2）の記録のみ。"),
    _tabBody,
    editTarget ? React.createElement(EntryRecordForm, { data: data, save: save, initial: (editTarget && editTarget.signal) ? editTarget : null, onClose: function() { setEditTarget(null); } }) : null
  );
}

// ===== αシミュレーター（独立モーダル・2026-07-02）: 対象を絞る→仮の基本α/追加α/損切りを置く→現実とシミュを対比。α別早見＋記録明細。非永続。 =====
// window.__openAlphaSim(initial) で App がマウント。initial={period,date,stock,signal,addAlphaFil} は起動元(本日/今週/記録帳)からの既定。
function AlphaSimBody(_ref_asim) {
  var data = _ref_asim.data, initial = _ref_asim.initial || {};
  var _num = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
  var _uP = useState(initial.period || (initial.date ? "day" : "recent")), period = _uP[0], setPeriod = _uP[1];
  var _uStk = useState(initial.stock || "__all__"), stockFil = _uStk[0], setStockFil = _uStk[1];
  var _uSig = useState(initial.signal || "__all__"), sigFil = _uSig[0], setSigFil = _uSig[1];
  var _uAf = useState(initial.addAlphaFil || "all"), addFil = _uAf[0], setAddFil = _uAf[1];
  var _uBa = useState(""), simBase = _uBa[0], setSimBase = _uBa[1];
  var _uAa = useState(""), simAdd = _uAa[0], setSimAdd = _uAa[1];
  var _uCu = useState(""), simCutS = _uCu[0], setSimCut = _uCu[1];
  var _uDe = useState(false), showDetail = _uDe[0], setShowDetail = _uDe[1];
  var simDate = initial.date || null;
  var _ai = function(r) { return _elAlphaInfo(r, data); };

  var allRecs = _elCollectAllSignals(data).filter(function(r) { return _epIsV2(r.signal) && _elInclTotal(r.signal); });
  var _byPeriod;
  if (period === "day" && simDate) _byPeriod = allRecs.filter(function(r) { return r.date === simDate; });
  else if (period === "week") _byPeriod = _elFilterPeriod(allRecs, "1w");
  else if (period === "recent") { var _srt = allRecs.slice().sort(function(a, b) { return (a.date < b.date ? 1 : a.date > b.date ? -1 : 0); }); _byPeriod = _srt.slice(0, 50); }
  else _byPeriod = allRecs;
  var _byStock = (stockFil === "__all__") ? _byPeriod : _byPeriod.filter(function(r) { return r.stock === stockFil; });
  var _bySig = (sigFil === "__all__") ? _byStock : _byStock.filter(function(r) { return (r.signal.tags || []).some(function(t) { return stripCat(t) === sigFil; }); });
  var recs = (addFil === "all") ? _bySig : _bySig.filter(function(r) { return addFil === "yes" ? _elAddAlphaYes(r.signal) : addFil === "no" ? _elAddAlphaNo(r.signal) : _elAddAlphaUnset(r.signal); });

  var _stockOpts = (function() { var seen = {}, out = []; _byPeriod.forEach(function(r) { if (r.stock && !seen[r.stock]) { seen[r.stock] = 1; out.push(r.stock); } }); return out.sort(); })();
  var _sigOpts = (function() { var seen = {}, out = []; _byStock.forEach(function(r) { (r.signal.tags || []).forEach(function(t) { var k = stripCat(t); if (k && !seen[k]) { seen[k] = 1; out.push(k); } }); }); return out.sort(); })();

  var _recBase = _elBaseAlphaPick(recs, _ai);
  var _recBaseA = (_recBase && _recBase.alpha != null && _recBase.status !== "none") ? _recBase.alpha : null;
  var baseA = (_num(simBase) != null) ? _num(simBase) : (_recBaseA != null ? _recBaseA : 10);
  var addA = (_num(simAdd) != null) ? _num(simAdd) : 0;
  var _addPool = recs.filter(function(r) { return _elAddAlphaYes(r.signal); });
  var _recAdd = (_addPool.length) ? _elAddAlphaReco(_addPool, _ai, baseA) : null;
  var _recAddA = (_recAdd && _recAdd.improved && _recAdd.add != null) ? _recAdd.add : null;
  var _recCut = _elCutPick(recs, _ai);
  var _recCutV = (_recCut && _recCut.cut != null && _recCut.status !== "none") ? _recCut.cut : null;
  var cutV = (_num(simCutS) != null) ? _num(simCutS) : (_recCutV != null ? _recCutV : 10);
  var totalA = baseA + addA;
  var _aiSim = function() { return { cutLine: cutV }; };
  var _medianOf = function(arr) { if (!arr.length) return null; var s = arr.slice().sort(function(a, b) { return a - b; }); var m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
  var _idealBaseA = _medianOf(recs.map(function(r) { return _elIdealAlpha(r.signal, cutV); }).filter(function(v) { return v != null; }));
  var _idealCutV = _medianOf(recs.map(function(r) { return _elIdealCut(r.signal, totalA); }).filter(function(v) { return v != null; }));

  var _agg = function(recsX, alphaOf, cutOf) {
    var n = 0, ent = 0, scN = 0, stopN = 0, winN = 0, sum = 0, has = false, dmap = {};
    (recsX || []).forEach(function(r) {
      var s = r.signal; if (!s) return; n++;
      var a = alphaOf(r), c = cutOf(r); if (a == null) return;
      var rr = _epResolve(s, a); if (!(rr && rr.epIdx >= 0 && rr.epIdx <= 2)) return; ent++;
      var epStop = _elPlanIsStop(s, a, c), h1Stop = _elHoldIsStop(s, a, c), hd = _elDynHold(s, a, c);
      if (!(epStop || h1Stop || hd != null)) return; scN++;
      if (epStop || h1Stop) stopN++; else if (hd != null && hd > 0) winN++;
      if (hd != null) { sum += hd; has = true; if (r.date) dmap[r.date] = 1; }
    });
    return { n: n, ent: ent, eRate: n ? ent / n : 0, scN: scN, stopRate: scN ? stopN / scN : null, h1win: scN ? winN / scN : null, sum: has ? sum : null, days: Object.keys(dmap).length };
  };
  var realAgg = _agg(recs, function(r) { return _ai(r).alpha; }, function(r) { return _ai(r).cutLine; });
  var simAgg = _agg(recs, function() { return totalA; }, function() { return cutV; });

  var sweep = []; for (var _sa = 5; _sa <= 20; _sa++) { var _tot = _sa + addA; var _ev = _elBaseAlphaEval(recs, _aiSim, _tot); var _sp = _elSimPnlByDay(recs, _aiSim, _tot); sweep.push({ base: _sa, eRate: _ev.eRate, stopRate: _ev.stopRate, h1win: _ev.h1win, scN: _ev.scN, sum: (_sp && _sp.sum != null) ? _sp.sum : null }); }
  var _best = null; sweep.forEach(function(x) { if (x.sum != null && (_best == null || x.sum > _best.sum)) _best = x; });

  // ===== UI helpers =====
  var _pct = function(v) { return v == null ? "—" : Math.round(v * 100) + "%"; };
  var _pnl = function(v) { return v == null ? "—" : _elPnlFmt(Math.round(v)); };
  var _pill = function(lbl, on, oc) { return React.createElement("button", { key: lbl, onClick: oc, style: { padding: "2px 9px", fontSize: 10.5, fontWeight: 600, borderRadius: 11, cursor: "pointer", border: "1px solid " + (on ? "#9A3412" : "#ddd"), background: on ? "#9A3412" : "#fff", color: on ? "#fff" : "#888", whiteSpace: "nowrap" } }, lbl); };
  var _quick = function(lbl, val, setter, col) { if (val == null) return null; return React.createElement("button", { key: lbl, onClick: function() { setter(String(val)); }, style: { padding: "1px 7px", fontSize: 9.5, borderRadius: 9, cursor: "pointer", border: "1px solid " + col, background: "#fff", color: col, whiteSpace: "nowrap", fontWeight: 600 } }, lbl); };
  var _sel = function(val, opts, setter, allLbl) {
    return React.createElement("select", { value: val, onChange: function(e) { setter(e.target.value); }, style: { fontSize: 11, padding: "2px 4px", border: "1px solid #ddd", borderRadius: 5, background: "#fff", color: "#555", maxWidth: 130 } },
      [React.createElement("option", { key: "__all__", value: "__all__" }, allLbl)].concat(opts.map(function(o) { return React.createElement("option", { key: o, value: o }, o); })));
  };
  var _paramRow = function(name, col, val, setter, isAdd, quicks) {
    return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, marginBottom: 9, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 11, color: col, fontWeight: 600, width: 46 } }, name),
      React.createElement("button", { onClick: function() { setter(String(val - 1)); }, style: { width: 24, height: 24, borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 15, color: "#666", lineHeight: 1 } }, "−"),
      React.createElement("span", { style: { fontSize: 15, fontWeight: 700, color: col, minWidth: 52, textAlign: "center" } }, (isAdd && val >= 0 ? "+" : "") + val + "円"),
      React.createElement("button", { onClick: function() { setter(String(val + 1)); }, style: { width: 24, height: 24, borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 15, color: "#666", lineHeight: 1 } }, "+"),
      React.createElement("span", { style: { display: "inline-flex", gap: 4, flexWrap: "wrap" } }, quicks));
  };
  var _delCol = function(rv, sv, betterDown) { if (rv == null || sv == null) return "#0369A1"; var d = sv - rv; if (d === 0) return "#94A3B8"; var good = betterDown ? d < 0 : d > 0; return good ? "#1E8449" : "#DC2626"; };
  var _metricCard = function(lbl, realStr, simStr, simCol) {
    return React.createElement("div", { key: lbl, style: { background: "#F8FAFC", borderRadius: 8, padding: "7px 5px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", fontWeight: 600 } }, lbl),
      React.createElement("div", { style: { fontSize: 12, marginTop: 1, lineHeight: 1.25 } },
        React.createElement("span", { style: { color: "#94A3B8" } }, realStr),
        React.createElement("span", { style: { color: simCol, fontWeight: 700, marginLeft: 3 } }, "→" + simStr)));
  };

  var _filterBar = React.createElement("div", { style: { background: "#fff", border: "1px solid #e8e3d8", borderRadius: 10, padding: "9px 11px", marginBottom: 9 } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "#9A3412", marginBottom: 7 } }, "① 対象（母数）を絞る"),
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px 12px", alignItems: "center", fontSize: 11, marginBottom: 7 } },
      React.createElement("span", { style: { color: "#64748b" } }, "期間"),
      React.createElement("span", { style: { display: "inline-flex", gap: 4, flexWrap: "wrap" } },
        (simDate ? [_pill("この日", period === "day", function() { setPeriod("day"); })] : []).concat([
          _pill("今週", period === "week", function() { setPeriod("week"); }),
          _pill("直近50件", period === "recent", function() { setPeriod("recent"); }),
          _pill("全期間", period === "all", function() { setPeriod("all"); })
        ]))),
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px 12px", alignItems: "center", fontSize: 11, marginBottom: 7 } },
      React.createElement("span", { style: { color: "#64748b" } }, "銘柄"), _sel(stockFil, _stockOpts, setStockFil, "全体"),
      React.createElement("span", { style: { color: "#64748b" } }, "シグナル"), _sel(sigFil, _sigOpts, setSigFil, "全部")),
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px 8px", alignItems: "center", fontSize: 11 } },
      React.createElement("span", { style: { color: "#64748b" } }, "追加α状態"),
      _pill("全部", addFil === "all", function() { setAddFil("all"); }),
      _pill("〇", addFil === "yes", function() { setAddFil("yes"); }),
      _pill("×のみ", addFil === "no", function() { setAddFil("no"); }),
      _pill("未選択", addFil === "unset", function() { setAddFil("unset"); })),
    React.createElement("div", { style: { fontSize: 10.5, color: "#0369A1", fontWeight: 600, marginTop: 8 } }, "→ 対象 " + recs.length + "件"),
    recs.length ? React.createElement("div", { style: { marginTop: 6, maxHeight: 260, overflow: "auto", border: "1px solid #eee", borderRadius: 6 } }, _elOsTradeMini(recs, _ai)) : null);

  var _condBar = React.createElement("div", { style: { background: "#fff", border: "1px solid #e8e3d8", borderRadius: 10, padding: "9px 11px", marginBottom: 9 } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "#9A3412", marginBottom: 9 } }, "② 仮の条件を置く ", React.createElement("span", { style: { fontWeight: 400, color: "#94A3B8" } }, "（推奨/理想でワンタップ）")),
    _paramRow("基本α", "#0369A1", baseA, setSimBase, false, [_quick("推奨" + (_recBaseA != null ? _recBaseA : ""), _recBaseA, setSimBase, "#0369A1"), _quick("理想" + (_idealBaseA != null ? _idealBaseA : ""), _idealBaseA, setSimBase, "#0369A1")]),
    _paramRow("追加α", "#9A3412", addA, setSimAdd, true, [_quick("推奨+" + (_recAddA != null ? _recAddA : ""), _recAddA, setSimAdd, "#9A3412"), _quick("なし", 0, setSimAdd, "#9A3412")]),
    _paramRow("損切り", "#7F1D1D", cutV, setSimCut, false, [_quick("推奨" + (_recCutV != null ? _recCutV : ""), _recCutV, setSimCut, "#7F1D1D"), _quick("理想" + (_idealCutV != null ? _idealCutV : ""), _idealCutV, setSimCut, "#7F1D1D")]),
    React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", textAlign: "right" } }, "合計α ", React.createElement("b", { style: { color: "#333" } }, totalA + "円"), "（基本" + baseA + " ＋ 追加" + addA + "）"));

  var _sumBar = React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginBottom: 11 } },
    _metricCard("到達率", _pct(realAgg.eRate), _pct(simAgg.eRate), _delCol(realAgg.eRate, simAgg.eRate, false)),
    _metricCard("損切り率", _pct(realAgg.stopRate), _pct(simAgg.stopRate), _delCol(realAgg.stopRate, simAgg.stopRate, true)),
    _metricCard("H1勝率", _pct(realAgg.h1win), _pct(simAgg.h1win), _delCol(realAgg.h1win, simAgg.h1win, false)),
    _metricCard("想定損益", _pnl(realAgg.sum), _pnl(simAgg.sum), _delCol(realAgg.sum, simAgg.sum, false)));

  var _swTh = function(t) { return React.createElement("th", { style: { padding: "3px 6px", fontSize: 9.5, fontWeight: 600, color: "#9A3412", textAlign: "center", whiteSpace: "nowrap" } }, t); };
  var _swTd = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "3px 6px", fontSize: 10.5, textAlign: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var _sweepTable = React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 10, fontWeight: 600, color: "#9A3412", margin: "0 0 3px" } }, "α別早見（基本αを振ると？ ★＝想定損益最大・追加α+" + addA + "/損切り" + cutV + "円で固定）"),
    React.createElement(_HScrollBox, null,
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%" } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "#f2f0ea" } }, _swTh("基本α"), _swTh("到達率"), _swTh("損切り率"), _swTh("H1勝率"), _swTh("件数"), _swTh("想定損益"))),
        React.createElement("tbody", null, sweep.map(function(x) {
          var on = _best && x.base === _best.base;
          return React.createElement("tr", { key: x.base, style: on ? { background: "#FEF3C7" } : null, onClick: function() { setSimBase(String(x.base)); }, title: "クリックで基本αに反映" },
            _swTd(React.createElement("span", { style: { fontWeight: 700, color: on ? "#B45309" : "#0369A1", cursor: "pointer" } }, x.base + "円" + (on ? " ★" : "")), { textAlign: "left", paddingLeft: 8, borderTop: "0.5px solid #eee" }),
            _swTd(_pct(x.eRate), { borderTop: "0.5px solid #eee" }),
            _swTd(x.stopRate == null ? "—" : React.createElement("span", { style: { color: x.stopRate <= 0.2 ? "#1E8449" : x.stopRate >= 0.5 ? "#DC2626" : "#B45309" } }, _pct(x.stopRate)), { borderTop: "0.5px solid #eee" }),
            _swTd(_pct(x.h1win), { borderTop: "0.5px solid #eee" }),
            _swTd((x.scN || 0) + "件", { borderTop: "0.5px solid #eee", color: "#94A3B8" }),
            _swTd(x.sum == null ? "—" : React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(Math.round(x.sum)) } }, _pnl(x.sum)), { borderTop: "0.5px solid #eee" }));
        })))));

  var _judgeMark = function(s, a, c) {
    var rr = _epResolve(s, a); if (!rr || rr.epIdx < 0) return React.createElement("span", { style: { color: "#94A3B8" } }, "未達");
    if (rr.judge === "x") return React.createElement("span", { style: { color: "#B45309" } }, "×見送り");
    if (_elPlanIsStop(s, a, c) || _elHoldIsStop(s, a, c)) return React.createElement("span", { style: { color: "#DC2626", fontWeight: 700 } }, "損切り");
    return React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "到達");
  };
  var _dTh = function(t) { return React.createElement("th", { style: { padding: "3px 5px", fontSize: 9, fontWeight: 600, color: "#9A3412", textAlign: "center", whiteSpace: "nowrap" } }, t); };
  var _dTd = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "3px 5px", fontSize: 10, textAlign: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
  var _detailRows = [];
  recs.slice().sort(function(a, b) { return (a.date < b.date ? 1 : a.date > b.date ? -1 : 0); }).forEach(function(r, i) {
    var s = r.signal, ai = _ai(r), ra = ai.alpha, rc = ai.cutLine;
    var _top = i > 0 ? { borderTop: "2px solid #F5D0B5" } : null;
    _detailRows.push(React.createElement("tr", { key: i + "_r" },
      React.createElement("td", { rowSpan: 2, style: Object.assign({ padding: "3px 5px", fontSize: 9.5, textAlign: "left", verticalAlign: "middle", whiteSpace: "nowrap" }, _top || {}) }, (r.date || "").slice(5).replace("-", "/"), React.createElement("div", { style: { color: "#aaa", fontSize: 8.5 } }, r.stock)),
      _dTd("現実", Object.assign({ color: "#64748B", fontWeight: 700 }, _top || {})),
      _dTd(ra != null ? (ra + "円") : "—", _top || {}),
      _dTd((function() { var v = _elDynPlanned(s, ra, rc); return v == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(v) } }, _pnl(v)); })(), _top || {}),
      _dTd((function() { var v = _elDynHold(s, ra, rc); return v == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(v) } }, _pnl(v)); })(), _top || {}),
      _dTd(_judgeMark(s, ra, rc), _top || {})));
    _detailRows.push(React.createElement("tr", { key: i + "_s" },
      _dTd("シミュ", { color: "#0369A1", fontWeight: 700, borderTop: "1px dashed #F5D0B5" }),
      _dTd(React.createElement("span", { style: { color: "#0369A1" } }, totalA + "円"), { borderTop: "1px dashed #F5D0B5" }),
      _dTd((function() { var v = _elDynPlanned(s, totalA, cutV); return v == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(v) } }, _pnl(v)); })(), { borderTop: "1px dashed #F5D0B5" }),
      _dTd((function() { var v = _elDynHold(s, totalA, cutV); return v == null ? "—" : React.createElement("span", { style: { color: _elPnlColor(v) } }, _pnl(v)); })(), { borderTop: "1px dashed #F5D0B5" }),
      _dTd(_judgeMark(s, totalA, cutV), { borderTop: "1px dashed #F5D0B5" })));
  });
  var _detailTable = React.createElement("div", { style: { marginTop: 8 } },
    React.createElement("div", { onClick: function() { setShowDetail(!showDetail); }, style: { fontSize: 10.5, fontWeight: 700, color: "#9A3412", cursor: "pointer", marginBottom: 4 } }, (showDetail ? "▲ " : "▼ ") + "記録ごとの明細（現実 vs シミュ・" + recs.length + "件）"),
    showDetail ? React.createElement(_HScrollBox, null,
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%" } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "#f2f0ea" } }, _dTh("日付"), _dTh("種別"), _dTh("α"), _dTh("EP損益"), _dTh("H1損益"), _dTh("判定"))),
        React.createElement("tbody", null, _detailRows))) : null);

  var _resultCard = React.createElement("div", { style: { background: "#fff", border: "1px solid #e8e3d8", borderRadius: 10, padding: "9px 11px" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "#9A3412", marginBottom: 9 } }, "③ 結果（現実 → シミュ）"),
    recs.length ? React.createElement(React.Fragment, null, _sumBar, _sweepTable, _detailTable)
      : React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "12px 0", fontSize: 12 } }, "この条件に該当する記録がありません"));

  return React.createElement(React.Fragment, null, _filterBar, _condBar, _resultCard);
}

// αシミュレーターのモーダル殻（本体AlphaSimBodyを不透明オーバーレイで包む・×閉じる）。日別ページの🧪シミュタブは殻なしでAlphaSimBodyを直接描画。2026-07-02。
function AlphaSimulatorModal(_ref_asm) {
  var data = _ref_asm.data, onClose = _ref_asm.onClose, initial = _ref_asm.initial;
  return React.createElement("div", { style: { position: "fixed", left: 0, top: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.42)", zIndex: 4000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "18px 8px", WebkitOverflowScrolling: "touch" }, onClick: onClose },
    React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: "#faf9f6", borderRadius: 12, maxWidth: 680, width: "100%", padding: "13px 13px", boxShadow: "0 12px 44px rgba(0,0,0,0.28)" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } },
        React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#9A3412" } }, "🧪 αシミュレーター"),
        React.createElement("button", { onClick: onClose, style: { fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer" } }, "×閉じる")),
      React.createElement("div", { style: { fontSize: 10, color: "#8a8a80", marginBottom: 10 } }, "対象を絞る → 仮のα/損切りを置く → 現実とシミュを対比（保存はしません）"),
      React.createElement(AlphaSimBody, { data: data, initial: initial })));
}

// αシミュレーターの起動ボタン（本日/今週/記録帳の見出しに置く・window.__openAlphaSimでモーダルを開く）2026-07-02。
function _alphaSimBtn(initial, label) {
  return React.createElement("button", { key: "__alphasim", onClick: function() { if (window.__openAlphaSim) window.__openAlphaSim(initial || {}); }, style: { fontSize: 10.5, fontWeight: 700, padding: "2px 9px", border: "1px solid #C2410C", borderRadius: 12, background: "#FFF7ED", color: "#C2410C", cursor: "pointer", whiteSpace: "nowrap", marginLeft: 8 } }, label || "🧪 シミュ");
}
