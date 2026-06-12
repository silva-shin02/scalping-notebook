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
  var recs = _elCollectAllSignals(data).filter(function(r) { return r.stock === stock; });
  var b = _elBestAlphaV2(recs, data);
  if (!b) return null;
  var txt;
  if (b.h1 && b.h2 && b.h1.a === b.h2.a) txt = b.h1.a + "円";
  else txt = (b.h1 ? "H1 " + b.h1.a + "円" : "") + (b.h1 && b.h2 ? "・" : "") + (b.h2 ? "H2 " + b.h2.a + "円" : "");
  var _fy = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
  var tip = "全エントリー記録" + b.n + "件（OS値入力分）をα=0/5/10/15/20/25/30で再計算し、H1/H2結果損益の合計が最大になるα。損切り値は各記録の採用値・損益基準は取引/銘柄別記録と同一。" +
    (b.h1 ? "　H1最良: α" + b.h1.a + "円（" + _fy(b.h1.sum) + "）" : "") +
    (b.h2 ? "　H2最良: α" + b.h2.a + "円（" + _fy(b.h2.sum) + "）" : "");
  return React.createElement("span", { title: tip, style: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 10,
    background: "#E0F2FE", border: "1px solid #7DD3FC", fontSize: 10, fontWeight: 700, color: "#0369A1", whiteSpace: "nowrap", verticalAlign: "middle" } },
    "現時点の最良α値：" + txt,
    React.createElement("span", { style: { fontWeight: 400, fontSize: 9, color: "#0284C7" } }, "(" + b.n + "件)"));
}

function EntryStatsSummary(_ref_ess) {
  var records = _ref_ess.records;
  var data = _ref_ess.data;
  var showWin = _ref_ess.showWin;
  var _calcD = function(recs) { return _elCalcStats(recs, data); };
  var allStats = _calcD(records);
  var entered = records.filter(function(r) { return _elIsEntered(r.signal, r.item); });
  var skipped = records.filter(function(r) { return !_elIsEntered(r.signal, r.item); });
  var enteredStats = _calcD(entered);
  var skippedStats = _calcD(skipped);

  var StatCell = function(label, val, color) {
    return React.createElement("div", { style: { textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 10, color: "#999", fontWeight: 600 } }, label),
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: color || "#1a1a1a" } }, val));
  };

  var makeRow = function(title, st, recs, bg, brColor) {
    var _os = _elOsStatsV2(recs);
    var _ss = _elStopStatsV2(recs, data);
    return React.createElement("div", {
      style: { background: bg, padding: 8, borderRadius: 6, marginBottom: 4, borderLeft: "3px solid " + brColor }
    },
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 4 } }, title),
      React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-around" } },
        StatCell("件数", st.total + "件"),
        _os && StatCell("平均OS値", _os.avg + "円", "#9A3412"),
        _os && StatCell("OS中央値", _os.med + "円", "#9A3412"),
        _ss.os > 0 && StatCell("損切り", _ss.any + "回" + (_ss.rate != null ? "（" + _ss.rate + "%）" : ""), _ss.any > 0 ? "#1E8449" : "#bbb"),
        st.miss > 0 && StatCell("E未達", st.miss + "件", "#7C3AED"),
        showWin && StatCell("勝率", st.winPct != null ? st.winPct + "%" : "—", st.winPct != null && st.winPct >= 50 ? "#1E8449" : "#C0392B"),
        showWin && StatCell("○/✕", st.ok + "/" + st.ng),
        st.holdResTotal > 0 && StatCell("H○/△/ー/×", st.hYes + "/" + st.hMid + "/" + st.hNone + "/" + st.hNo, "#7C3AED"),
        st.sumPnl !== 0 && StatCell("実pnl合計", (st.sumPnl > 0 ? "+" : "") + st.sumPnl.toLocaleString() + "円", st.sumPnl > 0 ? "#C0392B" : "#1E8449")
      )
    );
  };

  return React.createElement("div", {
    style: { background: "#f8f7f4", padding: 10, borderRadius: 8, marginBottom: 10 }
  },
    makeRow("全体", allStats, records, "#fff", "#1a1a1a"),
    entered.length > 0 && makeRow("実エントリーあり", enteredStats, entered, "#E8F5E9", "#2E7D32"),
    skipped.length > 0 && makeRow("見送り", skippedStats, skipped, "#f5f4f0", "#888")
  );
}




function EntryLogView(_ref_elv) {
  var data = _ref_elv.data,
    save = _ref_elv.save,
    onBack = _ref_elv.onBack,
    onSelectDate = _ref_elv.onSelectDate,
    onSelectStock = _ref_elv.onSelectStock,
    initialEdit = _ref_elv.initialEdit;
  var custom = data.custom || {};
  var allStocks = custom.stocks && custom.stocks.length > 0 ? custom.stocks : _DEF_STOCKS_FROZEN;
  var signalTags = custom.signalTags || [];
  var _calcD = function(recs) { return _elCalcStats(recs, data); };

  var _elvPnlCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
  var _elvYen = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
  var _elvWpCol = function(wp) { return wp == null ? "#ccc" : wp >= 60 ? "#C0392B" : wp >= 40 ? "#888" : "#1E8449"; };
  var _elvAvgOS = function(recs) {
    var rs = recs.filter(function(r) { return r.signal.osVal != null; });
    if (!rs.length) return null;
    return Math.round(rs.reduce(function(a, r) { return a + Number(r.signal.osVal); }, 0) / rs.length * 10) / 10;
  };
  var _elvModeOS = function(recs) {
    var cnt = {}, best = null, bestN = 0;
    recs.forEach(function(r) { if (r.signal.osVal == null) return; var k = Math.round(Number(r.signal.osVal)); cnt[k] = (cnt[k] || 0) + 1; if (cnt[k] > bestN) { bestN = cnt[k]; best = k; } });
    return best == null ? null : { val: best, n: bestN };
  };
  var _elvAvgConf = function(recs) {
    var rs = recs.filter(function(r) { return r.signal.osConfVal != null && r.signal.osConfVal !== ""; });
    if (!rs.length) return null;
    return Math.round(rs.reduce(function(a, r) { var s = r.signal; return a + (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)); }, 0) / rs.length * 10) / 10;
  };
  var _elvAvgHoldWidth = function(recs) {
    var rs = recs.filter(function(r) { return r.signal.holdWidth != null; });
    if (!rs.length) return null;
    return Math.round(rs.reduce(function(a, r) { var s = r.signal; return a + (s.holdWidthSign === "-" ? -Number(s.holdWidth) : Number(s.holdWidth)); }, 0) / rs.length * 10) / 10;
  };
  var _elvKpiCard = function(label, val, color, sub) {
    return React.createElement("div", { key: label, style: { flex: "1 1 90px", minWidth: 88, background: "#fff", border: "1px solid #e8e3d8", borderRadius: 8, padding: "8px 10px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 3 } }, label),
      React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: color || "#333", lineHeight: 1.1, whiteSpace: "nowrap" } }, val),
      sub ? React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 2 } }, sub) : null
    );
  };
  // 記録ごとの理想α/理想損切りを集計（_elAlphaInfoで採用α/損切りを解決→app-05のidealヘルパー）。osVal無しは除外。
  var _elvIdealStats = function(recs) {
    var rs = recs.filter(function(r) { return r.signal.osVal != null; });
    var n = rs.length;
    if (!n) return null;
    var as = [], cs = [], aDiffs = [], cDiffs = [], optN = 0;
    var distA = { 0: 0, 5: 0, 10: 0, 15: 0, 20: 0 }, distC = { 10: 0, 15: 0, 20: 0 };
    rs.forEach(function(r) {
      var ai = _elAlphaInfo(r, data);
      var ia = _elIdealAlpha(r.signal, ai.cutLine), ic = _elIdealCut(r.signal, ai.alpha);
      if (ia != null) { as.push(ia); if (distA[ia] != null) distA[ia]++; aDiffs.push(ia - ai.alpha); }
      if (ic != null) { cs.push(ic); if (distC[ic] != null) distC[ic]++; cDiffs.push(ic - ai.cutLine); }
      if (ia != null && ic != null && ia === ai.alpha && ic === ai.cutLine) optN++;
    });
    var avg = function(a) { return a.length ? Math.round(a.reduce(function(x, y) { return x + y; }, 0) / a.length * 10) / 10 : null; };
    var med = function(a) { if (!a.length) return null; var s = a.slice().sort(function(x, y) { return x - y; }); var m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2 * 10) / 10; };
    var mode = function(a) { if (!a.length) return null; var c = {}, best = null, bn = 0; a.forEach(function(v) { c[v] = (c[v] || 0) + 1; if (c[v] > bn) { bn = c[v]; best = v; } }); return { val: best, n: bn }; };
    return { n: n, aAvg: avg(as), aMed: med(as), aMode: mode(as), cAvg: avg(cs), cMed: med(cs), cMode: mode(cs),
      aDiffAvg: avg(aDiffs), cDiffAvg: avg(cDiffs), optRate: Math.round(optN / n * 100), distA: distA, distC: distC };
  };

  var _uE1 = useState("signal"),
    _uE2 = _slicedToArray(_uE1, 2),
    view = _uE2[0], setView = _uE2[1];
  var _uE3 = useState("all"),
    _uE4 = _slicedToArray(_uE3, 2),
    period = _uE4[0], setPeriod = _uE4[1];
  var _uE5 = useState("all"), 
    _uE6 = _slicedToArray(_uE5, 2),
    entFil = _uE6[0], setEntFil = _uE6[1];
  var _uE7 = useState(""),  
    _uE8 = _slicedToArray(_uE7, 2),
    stockFil = _uE8[0], setStockFil = _uE8[1];
  var _uE9 = useState(""), 
    _uE10 = _slicedToArray(_uE9, 2),
    resFil = _uE10[0], setResFil = _uE10[1];
  var _uE11 = useState(initialEdit || null),
    _uE12 = _slicedToArray(_uE11, 2),
    editTarget = _uE12[0], setEditTarget = _uE12[1];
  var _uE13 = useState(false),
    _uE14 = _slicedToArray(_uE13, 2),
    showForm = _uE14[0], setShowForm = _uE14[1];
  var _uE15 = useState(null), 
    _uE16 = _slicedToArray(_uE15, 2),
    expandKey = _uE16[0], setExpandKey = _uE16[1];
  var _uOsSub = useState("basic"), _uOsSubA = _slicedToArray(_uOsSub, 2),
    osSub = _uOsSubA[0], setOsSub = _uOsSubA[1];
  
  var _uSvSort = useState("desc"), _uSvSortA = _slicedToArray(_uSvSort, 2),
    svDateSort = _uSvSortA[0], setSvDateSort = _uSvSortA[1];
  var _uSvExp = useState(null), _uSvExpA = _slicedToArray(_uSvExp, 2),
    svDateExpand = _uSvExpA[0], setSvDateExpand = _uSvExpA[1];
  var _uSvRec = useState({}), _uSvRecA = _slicedToArray(_uSvRec, 2),
    svRecExpand = _uSvRecA[0], setSvRecExpand = _uSvRecA[1];
  var _uE17 = useState(null), 
    _uE18 = _slicedToArray(_uE17, 2),
    stopAnaSel = _uE18[0], setStopAnaSel = _uE18[1];

  var _uPnl1 = useState("month"), _uPnl1A = _slicedToArray(_uPnl1, 2),
    pnlPeriod = _uPnl1A[0], setPnlPeriod = _uPnl1A[1];
  var _uPnl2 = useState(""), _uPnl2A = _slicedToArray(_uPnl2, 2),
    pnlFrom = _uPnl2A[0], setPnlFrom = _uPnl2A[1];
  var _uPnl3 = useState(""), _uPnl3A = _slicedToArray(_uPnl3, 2),
    pnlTo = _uPnl3A[0], setPnlTo = _uPnl3A[1];
  var _uPnl4 = useState("date"), _uPnl4A = _slicedToArray(_uPnl4, 2),
    pnlBreak = _uPnl4A[0], setPnlBreak = _uPnl4A[1]; 
  
  var _uMgr1 = useState(false), _uMgr1A = _slicedToArray(_uMgr1, 2),
    sigMgrOpen = _uMgr1A[0], setSigMgrOpen = _uMgr1A[1];
  var _uMgr2 = useState(null), _uMgr2A = _slicedToArray(_uMgr2, 2),
    editingSigIdx = _uMgr2A[0], setEditingSigIdx = _uMgr2A[1];
  var _uMgr3 = useState(""), _uMgr3A = _slicedToArray(_uMgr3, 2),
    editingSigText = _uMgr3A[0], setEditingSigText = _uMgr3A[1];
  var _uMgr4 = useState(""), _uMgr4A = _slicedToArray(_uMgr4, 2),
    newSigText = _uMgr4A[0], setNewSigText = _uMgr4A[1];
  
  var _uSigDef1 = useState({}), _uSigDef1A = _slicedToArray(_uSigDef1, 2),
    openSigDefs = _uSigDef1A[0], setOpenSigDefs = _uSigDef1A[1];
  
  var _uSigDD1 = useState(null), _uSigDD1A = _slicedToArray(_uSigDD1, 2),
    sigDragFrom = _uSigDD1A[0], setSigDragFrom = _uSigDD1A[1];
  var _uSigDD2 = useState(null), _uSigDD2A = _slicedToArray(_uSigDD2, 2),
    sigDragOver = _uSigDD2A[0], setSigDragOver = _uSigDD2A[1];
  
  
  var _uSort = useState(function() {
    try { var v = localStorage.getItem('sn_entrylog_sortmode'); return (v === "custom" || v === "category") ? v : "time"; }
    catch(e) { return "time"; }
  }), _uSortA = _slicedToArray(_uSort, 2),
    sortMode = _uSortA[0], setSortMode = _uSortA[1];
  
  useEffect(function() {
    try { localStorage.setItem('sn_entrylog_sortmode', sortMode); } catch(e){}
  }, [sortMode]);
  
  var _uDrag1 = useState(null), _uDrag1A = _slicedToArray(_uDrag1, 2),
    dragRecKey = _uDrag1A[0], setDragRecKey = _uDrag1A[1];
  var _uDrag2 = useState(null), _uDrag2A = _slicedToArray(_uDrag2, 2),
    dragOverKey = _uDrag2A[0], setDragOverKey = _uDrag2A[1];
  var _uSigTab = useState(""), _uSigTabA = _slicedToArray(_uSigTab, 2),
    sigTab = _uSigTabA[0], setSigTab = _uSigTabA[1];
  var _uTimeFil = useState(null), _uTimeFilA = _slicedToArray(_uTimeFil, 2),
    timeFil = _uTimeFilA[0], setTimeFil = _uTimeFilA[1];
  var _uSigSub = useState("time"), _uSigSubA = _slicedToArray(_uSigSub, 2),
    sigSubTab = _uSigSubA[0], setSigSubTab = _uSigSubA[1];
  var _uSigExp = useState(null), _uSigExpA = _slicedToArray(_uSigExp, 2),
    sigSubExpand = _uSigExpA[0], setSigSubExpand = _uSigExpA[1];
  var _uCalM = useState(""), _uCalMA = _slicedToArray(_uCalM, 2),
    calMonth = _uCalMA[0], setCalMonth = _uCalMA[1];
  var _uCalExp = useState(null), _uCalExpA = _slicedToArray(_uCalExp, 2),
    calExpandDate = _uCalExpA[0], setCalExpandDate = _uCalExpA[1];
  
  var _uCalTbl1 = useState("desc"), _uCalTbl1A = _slicedToArray(_uCalTbl1, 2),
    calTblSort = _uCalTbl1A[0], setCalTblSort = _uCalTbl1A[1];
  var _uCalTbl2 = useState(null), _uCalTbl2A = _slicedToArray(_uCalTbl2, 2),
    calTblExpand = _uCalTbl2A[0], setCalTblExpand = _uCalTbl2A[1];
  var _uCalTbl3 = useState({}), _uCalTbl3A = _slicedToArray(_uCalTbl3, 2),
    calTblRecExp = _uCalTbl3A[0], setCalTblRecExp = _uCalTbl3A[1];
  var _uCalTbl4 = useState("time"), _uCalTbl4A = _slicedToArray(_uCalTbl4, 2),
    calTblRowSort = _uCalTbl4A[0], setCalTblRowSort = _uCalTbl4A[1];
  var _uTStkF = useState(""), _uTStkFA = _slicedToArray(_uTStkF, 2),
    timeStockFil = _uTStkFA[0], setTimeStockFil = _uTStkFA[1];
  var _uCStkF = useState(""), _uCStkFA = _slicedToArray(_uCStkF, 2),
    calStockFil = _uCStkFA[0], setCalStockFil = _uCStkFA[1];
  var _uCSigF = useState(""), _uCSigFA = _slicedToArray(_uCSigF, 2),
    calSigFil = _uCSigFA[0], setCalSigFil = _uCSigFA[1];
  var _uCResF = useState(""), _uCResFA = _slicedToArray(_uCResF, 2),
    calResFil = _uCResFA[0], setCalResFil = _uCResFA[1];
  
  var _uOsSlot = useState(null), _uOsSlotA = _slicedToArray(_uOsSlot, 2),
    osSlotSel = _uOsSlotA[0], setOsSlotSel = _uOsSlotA[1];

  
  var allRecords = useMemo(function() {
    return _elCollectAllSignals(data);
  }, [data]);

  var filtered = useMemo(function() {
    var r = _elFilterPeriod(allRecords, period);
    if (entFil === "entered") r = r.filter(function(x) { return _elIsEntered(x.signal, x.item); });
    else if (entFil === "skipped") r = r.filter(function(x) { return !_elIsEntered(x.signal, x.item); });
    if (stockFil) r = r.filter(function(x) { return x.stock === stockFil; });
    if (resFil) r = r.filter(function(x) { return x.signal.result === resFil; });
    return r;
  }, [allRecords, period, entFil, stockFil, resFil]);

  
  var sortedByDate = useMemo(function() {
    return filtered.slice().sort(function(a, b) {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.signal.time || "").localeCompare(a.signal.time || "");
    });
  }, [filtered]);

  var handleEdit = function(record) { setEditTarget(record); };
  var handleFormClose = function() { setEditTarget(null); setShowForm(false); };
  var handleGoDate = function(date, tab) {
    if (onSelectDate) onSelectDate(date, tab);
  };
  var handleGoStock = function(stock) {
    if (onSelectStock) onSelectStock(stock);
  };

  
  
  var _recKey = function(r) { return r.stock + "_" + (r.signal && r.signal.id) || ""; };
  
  var _sortByTime = function(records) {
    return records.slice().sort(function(a, b) {
      var ta = (a.signal && a.signal.time) || "99:99";
      var tb = (b.signal && b.signal.time) || "99:99";
      if (ta !== tb) return ta.localeCompare(tb);
      return ((a.signal && a.signal.id) || "").localeCompare((b.signal && b.signal.id) || "");
    });
  };
  
  var _sortByCustom = function(records, date, dailyOrder) {
    var order = (dailyOrder && dailyOrder[date]) || [];
    var orderMap = {};
    order.forEach(function(k, i) { orderMap[k] = i; });
    return records.slice().sort(function(a, b) {
      var ka = _recKey(a), kb = _recKey(b);
      var ia = orderMap[ka] != null ? orderMap[ka] : 9999;
      var ib = orderMap[kb] != null ? orderMap[kb] : 9999;
      if (ia !== ib) return ia - ib;
      
      var ta = (a.signal && a.signal.time) || "99:99";
      var tb = (b.signal && b.signal.time) || "99:99";
      return ta.localeCompare(tb);
    });
  };
  
  
  var _groupByCategory = function(records, _signalTags) {
    var byTag = {};
    records.forEach(function(r) {
      _elTagEntries(r.signal).forEach(function(e) {
        if (!byTag[e.key]) byTag[e.key] = { records: [], label: e.label, isCustom: e.isCustom };
        byTag[e.key].records.push(r);
      });
    });
    
    var orderedKeys = (_signalTags || []).filter(function(t) { return byTag[t]; });
    var customKeys = Object.keys(byTag).filter(function(k) {
      return !(_signalTags || []).includes(k) && k !== "(未設定)";
    });
    var allKeys = orderedKeys.concat(customKeys);
    if (byTag["(未設定)"]) allKeys.push("(未設定)");
    return allKeys.map(function(k) {
      var grp = byTag[k];
      return { key: k, label: grp.label, records: _sortByTime(grp.records), isCustom: grp.isCustom };
    });
  };
  
  var _moveDailyRec = function(date, recKey, dir, currentOrder) {
    save(function(prev) {
      var c = prev.custom || {};
      var dailyOrder = Object.assign({}, c.dailyOrder || {});
      var arr = (dailyOrder[date] || []).slice();
      
      if (!arr.length || !arr.includes(recKey)) {
        arr = (currentOrder || []).slice();
      }
      var idx = arr.indexOf(recKey);
      if (idx < 0) return prev;
      var to = idx + dir;
      if (to < 0 || to >= arr.length) return prev;
      var tmp = arr[idx]; arr[idx] = arr[to]; arr[to] = tmp;
      dailyOrder[date] = arr;
      return Object.assign({}, prev, { custom: Object.assign({}, c, { dailyOrder: dailyOrder }) });
    });
  };
  
  var _dropDailyRec = function(date, fromKey, toKey, currentOrder) {
    if (!fromKey || !toKey || fromKey === toKey) return;
    save(function(prev) {
      var c = prev.custom || {};
      var dailyOrder = Object.assign({}, c.dailyOrder || {});
      var arr = (dailyOrder[date] || []).slice();
      if (!arr.length || !arr.includes(fromKey) || !arr.includes(toKey)) {
        arr = (currentOrder || []).slice();
      }
      var fromIdx = arr.indexOf(fromKey);
      var toIdx = arr.indexOf(toKey);
      if (fromIdx < 0 || toIdx < 0) return prev;
      var moved = arr.splice(fromIdx, 1)[0];
      arr.splice(toIdx, 0, moved);
      dailyOrder[date] = arr;
      return Object.assign({}, prev, { custom: Object.assign({}, c, { dailyOrder: dailyOrder }) });
    });
  };
  
  var _renderRecCardWithCtrl = function(r, idx, total, currentOrder, dateKey) {
    var recKey = _recKey(r);
    if (sortMode !== "custom") {
      return React.createElement(EntryLogCard, {
        key: recKey, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate
      });
    }
    var isDragging = dragRecKey === recKey;
    var isOver = dragOverKey === recKey && dragRecKey && dragRecKey !== recKey;
    return React.createElement("div", {
      key: recKey,
      style: { display: "flex", alignItems: "stretch", gap: 4,
        borderTop: isOver ? "2px solid #FB923C" : "2px solid transparent",
        opacity: isDragging ? 0.4 : 1, transition: "opacity 0.1s" }
    },
      
      React.createElement("div", {
        draggable: true,
        onDragStart: function(e) {
          try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", recKey); } catch(_e){}
          setDragRecKey(recKey);
        },
        onDragOver: function(e) {
          e.preventDefault();
          if (dragRecKey && dragRecKey !== recKey) setDragOverKey(recKey);
        },
        onDrop: function(e) {
          e.preventDefault();
          if (dragRecKey && dragRecKey !== recKey) {
            _dropDailyRec(dateKey, dragRecKey, recKey, currentOrder);
          }
          setDragRecKey(null); setDragOverKey(null);
        },
        onDragEnd: function() { setDragRecKey(null); setDragOverKey(null); },
        style: { display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", gap: 2, padding: "0 4px", flexShrink: 0,
          cursor: "grab", borderRight: "1px dashed #ddd",
          background: isDragging ? "#FFEDD5" : "transparent" }
      },
        React.createElement("span", {
          style: { fontSize: 14, color: "#999", lineHeight: 1, marginBottom: 2, userSelect: "none" },
          title: "ドラッグで並び替え (PC)"
        }, "⋮⋮"),
        React.createElement("button", {
          disabled: idx === 0,
          onClick: function() { _moveDailyRec(dateKey, recKey, -1, currentOrder); },
          title: "上に移動",
          style: { width: 24, height: 14, padding: 0, fontSize: 9, lineHeight: 1, border: "1px solid #ccc",
            background: "#fafafa", borderRadius: 2,
            cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1 }
        }, "▲"),
        React.createElement("button", {
          disabled: idx === total - 1,
          onClick: function() { _moveDailyRec(dateKey, recKey, 1, currentOrder); },
          title: "下に移動",
          style: { width: 24, height: 14, padding: 0, fontSize: 9, lineHeight: 1, border: "1px solid #ccc",
            background: "#fafafa", borderRadius: 2,
            cursor: idx === total - 1 ? "default" : "pointer", opacity: idx === total - 1 ? 0.3 : 1 }
        }, "▼")
      ),
      
      React.createElement("div", { style: { flex: 1, minWidth: 0 } },
        React.createElement(EntryLogCard, {
          record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate
        })
      )
    );
  };

  var renderOsView = function() {
    var osRecs = filtered.filter(function(r) { return r.signal.osVal != null; });
    var total = filtered.length;
    var osCount = osRecs.length;
    if (osCount === 0) {
      return React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: 40, fontSize: 13 } },
        "OS値のデータがまだありません。記録フォームからOS値を入力してください。");
    }
    var osVals = osRecs.map(function(r) { return Number(r.signal.osVal); });
    var osSum = osVals.reduce(function(a, b) { return a + b; }, 0);
    var osAvg = Math.round(osSum / osCount * 10) / 10;
    var osSorted = osVals.slice().sort(function(a, b) { return a - b; });
    var osMedian = osCount % 2 === 1
      ? osSorted[Math.floor(osCount / 2)]
      : Math.round((osSorted[osCount/2-1] + osSorted[osCount/2]) / 2 * 10) / 10;
    var osMax = Math.max.apply(null, osVals);
    var osMin = Math.min.apply(null, osVals);
    var inputRate = total > 0 ? Math.round(osCount / total * 100) : 0;
    var avgOf = function(arr) {
      return arr.length ? Math.round(arr.reduce(function(a, b) { return a + b; }) / arr.length * 10) / 10 : null;
    };
    var _secH = function(t) {
      return React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412",
        marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #f0ede6", marginTop: 14 } }, t);
    };
    var _bar = function(label, val, maxV, col, valTxt, onClick, active) {
      return React.createElement("div", { onClick: onClick || undefined, style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 3, cursor: onClick ? "pointer" : "default", background: active ? "#F3E8FF" : "transparent", borderRadius: 4 } },
        React.createElement("div", { style: { width: 90, fontSize: 10, color: "#555", textAlign: "right",
          flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, label),
        React.createElement("div", { style: { flex: 1, background: "#f5f4f0", borderRadius: 2, height: 16, overflow: "hidden" } },
          React.createElement("div", { style: { width: (maxV > 0 ? Math.min(val/maxV, 1)*100 : 0) + "%",
            background: col, height: "100%", borderRadius: 2 } })
        ),
        React.createElement("div", { style: { width: 70, fontSize: 10, fontWeight: 600, color: "#555",
          textAlign: "right", flexShrink: 0 } }, valTxt)
      );
    };
    var _osAllStats = _elOsStatsV2(osRecs);
    var sumSec = React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8, alignItems: "flex-start" } },
      React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", flex: "1 1 240px", minWidth: 0 } },
        [["記録数", osCount + "件"], ["入力率", inputRate + "%"], ["平均", osAvg + "円"],
         ["中央値", osMedian + "円"], ["最頻", _osAllStats ? _osAllStats.mode.val + "円×" + _osAllStats.mode.n : "—"], ["最大", osMax + "円"], ["最小", osMin + "円"]].map(function(kv) {
          return React.createElement("div", { key: kv[0],
            style: { background: "#f5f4f0", border: "1px solid #e0ddd6", borderRadius: 6,
              padding: "6px 10px", minWidth: 62, textAlign: "center", flexShrink: 0 } },
            React.createElement("div", { style: { fontSize: 9, color: "#888", fontWeight: 600 } }, kv[0]),
            React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#333", marginTop: 2 } }, kv[1])
          );
        })
      ),
      _osAllStats ? React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", flexShrink: 0, background: "#fff", border: "1px solid #e0ddd6", borderRadius: 8, padding: "8px 12px" } },
        _elOsPieV2(_osAllStats.dist, 88),
        React.createElement("div", { style: { maxWidth: 120 } },
          React.createElement("div", { style: { fontSize: 9, color: "#888", fontWeight: 700, marginBottom: 3 } }, "OS値帯の割合"),
          _elOsBandLegendV2())
      ) : null
    );
    var sumInsight = (function() {
      if (!_osAllStats || _osAllStats.n < 3) return null;
      var o = _osAllStats;
      var _cum = function(fi) { var c = 0; for (var i = fi; i < 5; i++) c += o.dist[i]; return Math.round(c / o.n * 100); };
      var bi = 0; for (var i = 1; i < 5; i++) { if (o.dist[i] > o.dist[bi]) bi = i; }
      var bandPct = Math.round(o.dist[bi] / o.n * 100);
      var medA = 0; [0, 5, 10, 15, 20, 25, 30].forEach(function(a) { if (a <= o.med) medA = a; });
      return _elInsightBoxV2([
        React.createElement("span", null, "OS値は ", _elInsightEmV2(_EL_OS_BANDS_V2[bi].label + "帯", _EL_OS_BANDS_V2[bi].color), " に出ることが最も多い（" + bandPct + "%・" + o.dist[bi] + "/" + o.n + "件）"),
        React.createElement("span", null, "中央値は " + o.med + "円 → ", _elInsightEmV2("α" + medA + "円", "#0369A1"), " までなら半数以上の場面でエントリーが成立する"),
        React.createElement("span", null, "成立率の目安: α10で待つと " + _cum(2) + "%・α15だと " + _cum(3) + "%・α20だと " + _cum(4) + "% の場面で成立")
      ], { title: "OS値サマリー" });
    })();
    
    var _osBucketKey = function(v) { return Math.round(Number(v)); };
    var _osBucketLabel = function(k) {
      return k + "円";
    };
    var hist = {};
    osVals.forEach(function(v) { var k = _osBucketKey(v); hist[k] = (hist[k] || 0) + 1; });

    var _maxBucket = _osBucketKey(osMax);
    var _allBuckets = [0];
    for (var _bk = 1; _bk <= _maxBucket; _bk += 1) { _allBuckets.push(_bk); }
    var hKeys = _allBuckets.slice().sort(function(a, b) { return b - a; });
    hKeys.forEach(function(k) { if (hist[k] == null) hist[k] = 0; });
    var hMax = Math.max.apply(null, hKeys.map(function(k) { return hist[k]; })) || 1;
    var histSec = React.createElement("div", null,
      _secH("📊 OS値 分布"),
      hKeys.map(function(k) { return _bar(_osBucketLabel(k), hist[k], hMax, "#FB923C", hist[k] + "件"); })
    );
    var _diffRank = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6 };
    var byDiff = {};
    osRecs.forEach(function(r) {
      var d = r.signal.difficulty || "(未設定)";
      if (!byDiff[d]) byDiff[d] = [];
      byDiff[d].push(Number(r.signal.osVal));
    });
    var diffKeys = Object.keys(byDiff).sort(function(a, b) {
      var ra = _diffRank[a] != null ? _diffRank[a] : 98, rb = _diffRank[b] != null ? _diffRank[b] : 98;
      return ra - rb;
    });
    var diffAvgs = diffKeys.map(function(k) { return { k: k, avg: avgOf(byDiff[k]), cnt: byDiff[k].length }; });
    var dMaxAv = diffAvgs.length ? Math.max.apply(null, diffAvgs.map(function(x) { return x.avg; })) : 0;
    var _dra = null;
    var _diffResMap = {};
    osRecs.forEach(function(r) {
      var s = r.signal; var d = s.difficulty || "(未設定)";
      if (!_diffResMap[d]) _diffResMap[d] = { ok: 0, draw: 0, ng: 0, miss: 0, cnt: 0, stopP: 0, stopH1: 0, stopH2: 0, osSum: 0 };
      var m = _diffResMap[d]; var _aiD = _elAlphaInfo(r, data); var _cl = _aiD.cutLine; var _draA = _dra != null ? _dra : _aiD.alpha;
      var _res = _elDynResult(s, _draA, _cl);
      m.cnt++;
      m.osSum += Number(s.osVal);
      if (_res === "ok") m.ok++; else if (_res === "draw") m.draw++; else if (_res === "ng") m.ng++; else if (_res === "miss") m.miss++;
      var _pStD = _elPlanIsStop(s, _draA, _cl);
      var _h1StD = !_pStD && _elHoldIsStop(s, _draA, _cl);
      var _h2StD = !_pStD && !_h1StD && _elHas2Data(s) && !_elH2Miss(s, _draA) && _elHoldIsStop2(s, _draA, _cl);
      if (_pStD) m.stopP++;
      if (_h1StD) m.stopH1++;
      if (_h2StD) m.stopH2++;
    });
    var _diffResKeys = Object.keys(_diffResMap).sort(function(a, b) { var ra = _diffRank[a] != null ? _diffRank[a] : 98, rb = _diffRank[b] != null ? _diffRank[b] : 98; return ra - rb; });
    var _drTh = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "2px 5px", fontWeight: 700, fontSize: 10, color: "#9A3412", borderBottom: "2px solid #FB923C", textAlign: "center", whiteSpace: "nowrap" }, ex || {}) }, t); };
    var _drTd = function(c, col, ex) { return React.createElement("td", { style: Object.assign({ padding: "2px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", color: col || "#333", fontWeight: 700, fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
    var _drPnlFmt = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    var _drPnlCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var resSec = React.createElement("div", null,
      _secH("🎯 予想OS度別 結果"),
      React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 6 } }, "○/△/×/ー＝採用αでの結果（ー＝E未達）。損切り回数＝想定・H1・H2いずれかで損切りライン到達（内訳は発生段階）。"),
      _diffResKeys.length === 0
        ? React.createElement("div", { style: { fontSize: 10, color: "#aaa", padding: "2px 0" } }, "予想OS度の記録がありません")
        : React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
              React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
                _drTh("予想OS度", { textAlign: "left" }), _drTh("件"),
                _drTh(React.createElement("span", { style: { color: "#1E8449" } }, "○")),
                _drTh(React.createElement("span", { style: { color: "#6B7280" } }, "△")),
                _drTh(React.createElement("span", { style: { color: "#C0392B" } }, "×")),
                _drTh(React.createElement("span", { style: { color: "#B45309" } }, "ー")),
                _drTh("損切り回数"), _drTh("平均OS値")
              )),
              React.createElement("tbody", null, _diffResKeys.map(function(k) {
                var m = _diffResMap[k]; var _stpSum = m.stopP + m.stopH1 + m.stopH2;
                return React.createElement("tr", { key: k },
                  React.createElement("td", { style: { padding: "2px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, k === "(未設定)" ? "(未設定)" : "予想OS度" + k),
                  _drTd(m.cnt, "#333", { fontWeight: 600 }),
                  _drTd(m.ok || "—", m.ok ? "#1E8449" : "#ccc"),
                  _drTd(m.draw || "—", m.draw ? "#6B7280" : "#ccc"),
                  _drTd(m.ng || "—", m.ng ? "#C0392B" : "#ccc"),
                  _drTd(m.miss || "—", m.miss ? "#B45309" : "#ccc"),
                  _drTd(_stpSum > 0
                    ? React.createElement("span", { style: { whiteSpace: "nowrap" } }, _stpSum + "回 (" + Math.round(_stpSum / m.cnt * 100) + "%)",
                        React.createElement("span", { style: { fontSize: 9, color: "#888", marginLeft: 3, fontWeight: 400 } }, "想" + m.stopP + "・H1 " + m.stopH1 + "・H2 " + m.stopH2))
                    : "0回", _stpSum > 0 ? "#1E8449" : "#bbb", { fontWeight: 700 }),
                  _drTd((Math.round(m.osSum / m.cnt * 10) / 10) + "円", "#9A3412", { fontWeight: 600 })
                );
              }))
            )
          )
    );
    
    var _OS_BANDS = { A: { min: 20, max: Infinity, label: "20円〜" }, B: { min: 15, max: 19, label: "15〜19円" }, C: { min: 10, max: 14, label: "10〜14円" }, D: { min: 5, max: 9, label: "5〜9円" }, E: { min: 0, max: 4, label: "0〜4円" } };
    var _osHitMap = {}; var _osHitTot = 0, _osHitOk = 0, _osHitDevSum = 0;
    osRecs.forEach(function(r) {
      var s = r.signal; var g = s.difficulty;
      if (!g || !_OS_BANDS[g] || s.osVal == null) return;
      var b = _OS_BANDS[g]; var act = Number(s.osVal);
      var hit = act >= b.min && act <= b.max;
      var dev = (b.max !== Infinity && act > b.max) ? (act - b.max) : (act < b.min ? act - b.min : 0);
      if (!_osHitMap[g]) _osHitMap[g] = { cnt: 0, ok: 0, devSum: 0, osSum: 0 };
      var m = _osHitMap[g]; m.cnt++; m.osSum += act; m.devSum += dev; if (hit) m.ok++;
      _osHitTot++; if (hit) _osHitOk++; _osHitDevSum += dev;
    });
    var _osHitKeys = ["A", "B", "C", "D", "E"].filter(function(k) { return _osHitMap[k]; });
    var _devCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _devFmt = function(v) { return (v > 0 ? "+" : "") + (Math.round(v * 10) / 10) + "円"; };
    var _osHitSec = _osHitTot === 0 ? null : React.createElement("div", null,
      _secH("🎯 予想OS度の的中（予想帯 vs 実OS値）"),
      React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 6 } }, "一致＝実OS値が予想帯に収まった割合。乖離＝帯からの外れ幅（＋上振れ／−下振れ・円、帯内は0）。"),
      React.createElement("div", { style: { fontSize: 12, color: "#555", marginBottom: 6, fontWeight: 600 } },
        "全体 一致率 ",
        React.createElement("span", { style: { fontWeight: 800, color: (_osHitOk / _osHitTot >= 0.6 ? "#1E8449" : _osHitOk / _osHitTot >= 0.4 ? "#B45309" : "#C0392B") } }, Math.round(_osHitOk / _osHitTot * 100) + "%"),
        "（" + _osHitOk + "/" + _osHitTot + "件） ／ 平均乖離 ",
        React.createElement("span", { style: { fontWeight: 700, color: _devCol(_osHitDevSum / _osHitTot) } }, _devFmt(_osHitDevSum / _osHitTot))
      ),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
            _drTh("予想OS度", { textAlign: "left" }), _drTh("帯"), _drTh("件"), _drTh("一致率"), _drTh("平均乖離"), _drTh("平均実OS値")
          )),
          React.createElement("tbody", null, _osHitKeys.map(function(k) {
            var m = _osHitMap[k]; var _hr = Math.round(m.ok / m.cnt * 100);
            return React.createElement("tr", { key: k },
              React.createElement("td", { style: { padding: "2px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, "予想OS度" + k),
              _drTd(_OS_BANDS[k].label, "#666", { fontWeight: 600 }),
              _drTd(m.cnt, "#333", { fontWeight: 600 }),
              _drTd(_hr + "%", _hr >= 60 ? "#1E8449" : _hr >= 40 ? "#B45309" : "#C0392B"),
              _drTd(_devFmt(m.devSum / m.cnt), _devCol(m.devSum / m.cnt), { fontWeight: 600 }),
              _drTd((Math.round(m.osSum / m.cnt * 10) / 10) + "円", "#333")
            );
          }))
        )
      )
    );
    var _osConfSigned = function(s) {
      if (s.osConfVal == null) return null;
      var v = Number(s.osConfVal);
      return s.osConfSign === "-" ? -v : v;
    };
    var _cutLineOf = function(r) {
      var c = (data.charts || {})[r.stock + "_" + r.date];
      return c && c.cutLine != null ? c.cutLine : 10;
    };
    var alphaRows = [];
    for (var _av = 0; _av <= 30; _av++) {
      var _sumP = 0, _cntP = 0, _miss = 0, _unk = 0;
      osRecs.forEach(function(r) {
        var s = r.signal;
        var osV = Number(s.osVal);
        var cutL = _cutLineOf(r);
        var conf = _osConfSigned(s);
        var diff = osV - _av;
        var pp = null, entered = false;
        if (diff < 0) { _miss++; pp = 0; }
        else if (diff >= cutL) { pp = -Math.round(diff * 100); entered = true; }
        else if (conf != null) { pp = Math.round((_av - conf) * 100); entered = true; }
        else { _unk++; }
        if (pp != null) _sumP += pp;
        if (entered) _cntP++;
      });
      var _avgP = _cntP > 0 ? Math.round(_sumP / _cntP) : null;
      alphaRows.push({ a: _av, sumP: _sumP, cntP: _cntP, avgP: _avgP, miss: _miss, unk: _unk });
    }
    var _bestProfit = Math.max.apply(null, alphaRows.map(function(x){ return x.cntP > 0 ? x.sumP : -Infinity; }));
    var _aTh2 = function(t, extra) {
      return React.createElement("th", { style: Object.assign({ padding: "2px 5px", fontWeight: 700, fontSize: 10, color: "#9A3412", borderBottom: "2px solid #FB923C", textAlign: "center", whiteSpace: "nowrap" }, extra || {}) }, t);
    };
    var _aTd2 = function(c, col) {
      return React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", color: col || "#333", fontVariantNumeric: "tabular-nums" } }, c);
    };
    var _apCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _apFmt = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    // H2(Hold2)集計セル: 期待度○/△=本集計(main)、×=参考(ref・括弧併記)。アプリ共通ルール。
    var _h2Cell = function(mainSum, mainCnt, refSum, refCnt, bold) {
      if ((mainCnt || 0) <= 0 && (refCnt || 0) <= 0) return _aTd2("—", "#ccc");
      return React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: bold ? 800 : 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } },
        (mainCnt || 0) > 0 ? React.createElement("span", { style: { color: _apCol(mainSum) } }, _apFmt(mainSum)) : React.createElement("span", { style: { color: "#bbb" } }, "—"),
        _elHold2RefSuffix((mainCnt || 0) > 0 ? mainSum : 0, refSum, refCnt));
    };
    // H2損益の集計: getA/getC は record→α/損切り を返す関数。{main,mainCnt,ref,refCnt,win}を返す。
    var _h2Acc = function(recsArr, getA, getC) {
      var o = { main: 0, mainCnt: 0, ref: 0, refCnt: 0, win: 0 };
      recsArr.forEach(function(r) {
        var p = _elHold2TotParts(r.signal, getA(r), getC(r));
        if (p.main != null) { o.main += p.main; o.mainCnt++; if (p.main > 0) o.win++; }
        if (p.ref != null) { o.ref += p.ref; o.refCnt++; }
      });
      return o;
    };
    var holdAlphaRows = [];
    for (var _avH1 = 0; _avH1 <= 30; _avH1++) {
      (function(_a) {
        var _sH1 = 0, _cH1 = 0, _stpA = 0, _msA = 0;
        osRecs.forEach(function(r) {
          var s = r.signal; var _clA = _cutLineOf(r);
          var _hp = _elDynHold(s, _a, _clA); if (_hp != null) { _sH1 += _hp; _cH1++; }
          if (_elDynResult(s, _a, _clA) === "miss") _msA++;
          if (_elHoldIsStop(s, _a, _clA) || (_elHas2Data(s) && !_elH2Miss(s, _a) && _elHoldIsStop2(s, _a, _clA))) _stpA++;
        });
        var _acc2 = _h2Acc(osRecs, function(){ return _a; }, function(r){ return _cutLineOf(r); });
        holdAlphaRows.push({ a: _a, sumH: _sH1, cntH: _cH1, sumH2: _acc2.main, cntH2: _acc2.mainCnt, refH2: _acc2.ref, refCntH2: _acc2.refCnt, stop: _stpA, miss: _msA });
      })(_avH1);
    }
    var _bestHoldA = Math.max.apply(null, holdAlphaRows.map(function(x){ return x.cntH > 0 ? x.sumH : -Infinity; }));
    var _bestHold2A = Math.max.apply(null, holdAlphaRows.map(function(x){ return x.cntH2 > 0 ? x.sumH2 : -Infinity; }));
    var holdAlphaInsight = (function() {
      if (osCount < 3) return null;
      var a1 = null, a2 = null, a0 = null;
      holdAlphaRows.forEach(function(x) {
        if (a1 == null && x.cntH > 0 && x.sumH === _bestHoldA && _bestHoldA > -Infinity) a1 = x;
        if (a2 == null && x.cntH2 > 0 && x.sumH2 === _bestHold2A && _bestHold2A > -Infinity) a2 = x;
        if (a0 == null && x.stop === 0) a0 = x.a;
      });
      var _curCnt = {}, _curA = null, _curN = 0;
      osRecs.forEach(function(r) { var a = _elAlphaInfo(r, data).alpha; if (a == null) return; _curCnt[a] = (_curCnt[a] || 0) + 1; if (_curCnt[a] > _curN) { _curN = _curCnt[a]; _curA = a; } });
      var _fy = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
      return _elInsightBoxV2([
        (a1 && a2 && a1.a === a2.a)
          ? React.createElement("span", null, "H1/H2とも ", _elInsightEmV2("α" + a1.a + "円", "#0369A1"), " が利益最大（H1 " + _fy(a1.sumH) + "・H2 " + _fy(a2.sumH2) + "）")
          : React.createElement("span", null, "利益最大は H1＝", _elInsightEmV2(a1 ? "α" + a1.a + "円" : "—", "#0369A1"), (a1 ? "（" + _fy(a1.sumH) + "）" : ""), "・H2＝", _elInsightEmV2(a2 ? "α" + a2.a + "円" : "—", "#0369A1"), (a2 ? "（" + _fy(a2.sumH2) + "）" : "")),
        _curA != null ? React.createElement("span", null, "現在よく使っているαは ", _elInsightEmV2(_curA + "円", "#0369A1"), "（最頻・" + _curN + "件）" + ((a1 && _curA < a1.a) || (a2 && _curA < a2.a) ? " → もう少し深いOSを待つ方が良い傾向" : (a1 && a2 && _curA > a1.a && _curA > a2.a ? " → もう少し浅めでも取れている傾向" : ""))) : null,
        a0 != null ? React.createElement("span", null, "α" + a0 + "円以上にすると、この期間の損切りは0回になる") : null
      ], { title: "α値別" });
    })();
    var holdAlphaSec = React.createElement("div", null,
      _secH("💹 α値別 想定 vs H1/H2ホールド利益（α値ごとに全件を再計算）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "各α値で全件を「利確（想定）」「H1ホールド」「H2ホールド」した場合の利益合計（100株換算）。H2は期待度○/△が本集計・×は（参考）併記。★＝各ホールド利益が最大のα値。損切り回数＝そのα値で損切りライン到達する記録数（想定/H1/H2いずれか）・E未達＝α>OS値で不成立の件数。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#FFF7ED" } },
              _aTh2("α値", { textAlign: "left" }), _aTh2("想定利益"), _aTh2("H1ホールド"), _aTh2("H2ホールド"), _aTh2("損切り回数"), _aTh2("E未達"), _aTh2("件数")
            )
          ),
          React.createElement("tbody", null,
            holdAlphaRows.map(function(x) {
              var _p = alphaRows[x.a] ? alphaRows[x.a].sumP : 0;
              var _pCnt = alphaRows[x.a] ? alphaRows[x.a].cntP : 0;
              var _best = x.cntH > 0 && x.sumH === _bestHoldA && _bestHoldA > -Infinity;
              var _best2 = x.cntH2 > 0 && x.sumH2 === _bestHold2A && _bestHold2A > -Infinity;
              return React.createElement("tr", { key: x.a, style: { background: (_best || _best2) ? "#FEF3C7" : "transparent" } },
                React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, x.a + "円", _best ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 4 } }, "★H1") : null, _best2 ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 3 } }, "★H2") : null),
                _aTd2(_pCnt > 0 ? _apFmt(_p) : "—", _pCnt > 0 ? _apCol(_p) : "#ccc"),
                React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: _best ? 800 : 600, color: x.cntH > 0 ? _apCol(x.sumH) : "#ccc", fontVariantNumeric: "tabular-nums" } }, x.cntH > 0 ? _apFmt(x.sumH) : "—"),
                _h2Cell(x.sumH2, x.cntH2, x.refH2, x.refCntH2, _best2),
                React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: 700, color: x.stop > 0 ? "#1E8449" : "#bbb", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } },
                  x.stop + "回", osCount > 0 ? React.createElement("span", { style: { fontSize: 9, color: "#888", fontWeight: 400, marginLeft: 2 } }, "(" + Math.round(x.stop / osCount * 100) + "%)") : null),
                _aTd2(x.miss > 0 ? x.miss : "—", x.miss > 0 ? "#B45309" : "#ccc"),
                _aTd2(x.cntH > 0 ? x.cntH : "—", x.cntH > 0 ? "#333" : "#ccc")
              );
            })
          )
        )
      )
    );

    var _cmpP = { sum: 0, cnt: 0, win: 0, ws: 0, ls: 0, lc: 0 }, _cmpH = { sum: 0, cnt: 0, win: 0, ws: 0, ls: 0, lc: 0 }, _cmpH2 = { sum: 0, cnt: 0, win: 0, ws: 0, ls: 0, lc: 0 };
    var _cmpAdd = function(o, v) { if (v == null) return; o.sum += v; o.cnt++; if (v > 0) { o.win++; o.ws += v; } else if (v < 0) { o.ls += v; o.lc++; } };
    osRecs.forEach(function(r) {
      var s = r.signal; var _ai = _elAlphaInfo(r, data);
      _cmpAdd(_cmpP, _elDynPlanned(s, _ai.alpha, _ai.cutLine));
      _cmpAdd(_cmpH, _elHold1TotParts(s, _ai.alpha, _ai.cutLine).main);
      _cmpAdd(_cmpH2, _elHold2TotParts(s, _ai.alpha, _ai.cutLine).main);
    });
    var _cmpMax = Math.max(Math.abs(_cmpP.sum), Math.abs(_cmpH.sum), Math.abs(_cmpH2.sum), 1);
    var _cmpBar = function(label, o, color) {
      var _avg = o.cnt > 0 ? Math.round(o.sum / o.cnt) : null;
      var _wp = o.cnt > 0 ? Math.round(o.win / o.cnt * 100) : null;
      var _aw = o.win > 0 ? Math.round(o.ws / o.win) : null;
      var _al = o.lc > 0 ? Math.round(o.ls / o.lc) : null;
      var _pf = o.ls < 0 ? Math.round(o.ws / -o.ls * 100) / 100 : (o.ws > 0 ? "∞" : null);
      return React.createElement("div", { style: { marginBottom: 8 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 2 } },
          React.createElement("span", { style: { color: color } }, label),
          React.createElement("span", { style: { color: o.sum > 0 ? "#C0392B" : o.sum < 0 ? "#1E8449" : "#888", fontVariantNumeric: "tabular-nums" } }, (o.sum > 0 ? "+" : "") + o.sum.toLocaleString() + "円")
        ),
        React.createElement("div", { style: { height: 10, background: "#f0ede6", borderRadius: 5, overflow: "hidden" } },
          React.createElement("div", { style: { width: Math.round(Math.abs(o.sum) / _cmpMax * 100) + "%", height: "100%", background: color, borderRadius: 5 } })
        ),
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginTop: 2 } },
          "期待値 " + (_avg != null ? (_avg > 0 ? "+" : "") + _avg.toLocaleString() + "円" : "—") + " / 勝率 " + (_wp != null ? _wp + "%" : "—") + " / " + o.cnt + "件"),
        React.createElement("div", { style: { fontSize: 10, color: "#888", marginTop: 1 } },
          "PF " + (_pf == null ? "—" : _pf) + " / 勝平均 " + (_aw != null ? "+" + _aw.toLocaleString() + "円" : "—") + " / 負平均 " + (_al != null ? _al.toLocaleString() + "円" : "—"))
      );
    };
    var cmpKpiSec = React.createElement("div", null,
      _secH("⚖️ 利確（想定） vs H1/H2ホールド 総合比較"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "各銘柄の設定α値で全件を再計算（100株換算）。バー＝利益合計。期待値＝1件平均。H2は期待度○/△のみ集計。"),
      _cmpBar("利確（想定）", _cmpP, "#0EA5E9"),
      _cmpBar("ホールド(H1)", _cmpH, "#FB923C"),
      _cmpBar("ホールド(H2)", _cmpH2, "#EA580C"),
      (function() {
        var _opts = [{ k: "利確", v: _cmpP.sum, c: _cmpP.cnt }, { k: "H1ホールド", v: _cmpH.sum, c: _cmpH.cnt }, { k: "H2ホールド", v: _cmpH2.sum, c: _cmpH2.cnt }].filter(function(o) { return o.c > 0; });
        if (_opts.length < 2) return null;
        _opts.sort(function(a, b) { return b.v - a.v; });
        return React.createElement("div", { style: { fontSize: 11, fontWeight: 700, marginTop: 4, color: "#9A3412" } },
          "→ 最有利: " + _opts[0].k + "（" + (_opts[0].v > 0 ? "+" : "") + _opts[0].v.toLocaleString() + "円／2位「" + _opts[1].k + "」より +" + (_opts[0].v - _opts[1].v).toLocaleString() + "円）");
      })()
    );

    var _flowPts = [];
    osRecs.forEach(function(r) {
      var s = r.signal;
      var os = s.osVal != null ? (s.osConfSign === "-" ? -Number(s.osVal) : Number(s.osVal)) : null;
      var conf = (s.osConfVal != null && (s.osConfSign || Number(s.osConfVal) === 0)) ? (s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0) : null;
      var hh = s.holdHighVal != null ? (s.holdHighSign === "+" ? -Number(s.holdHighVal) : Number(s.holdHighVal)) : null;
      var hc = s.holdWidth != null ? (s.holdWidthSign === "+" ? -Number(s.holdWidth) : s.holdWidthSign === "-" ? Number(s.holdWidth) : 0) : null;
      if (os != null || conf != null || hh != null || hc != null) _flowPts.push([os, conf, hh, hc]);
    });
    var _flow2Pts = [];
    osRecs.forEach(function(r) {
      var s = r.signal;
      if (!((s.hold2Exp === "○" || s.hold2Exp === "△") && _elHas2Data(s))) return;
      var conf = (s.osConfVal != null && (s.osConfSign || Number(s.osConfVal) === 0)) ? (s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0) : null;
      var hh2 = s.hold2HighVal != null ? (s.hold2HighSign === "+" ? -Number(s.hold2HighVal) : Number(s.hold2HighVal)) : null;
      var hc2 = s.hold2Width != null ? (s.hold2WidthSign === "+" ? -Number(s.hold2Width) : s.hold2WidthSign === "-" ? Number(s.hold2Width) : 0) : null;
      if (hh2 != null || hc2 != null) _flow2Pts.push([null, conf, hh2, hc2]);
    });
    var _flowMin = 0, _flowMax = 0;
    _flowPts.concat(_flow2Pts).forEach(function(p) { p.forEach(function(y) { if (y != null) { if (y < _flowMin) _flowMin = y; if (y > _flowMax) _flowMax = y; } }); });
    _flowMin = Math.floor(_flowMin / 5) * 5; _flowMax = Math.ceil(_flowMax / 5) * 5; if (_flowMax === _flowMin) _flowMax = _flowMin + 5;
    var _fTicks = []; for (var _ft = _flowMin; _ft <= _flowMax; _ft += 5) _fTicks.push(_ft);
    var _flowAvg = [0,1,2,3].map(function(i) { var vs = _flowPts.map(function(p){ return p[i]; }).filter(function(y){ return y != null; }); return vs.length ? Math.round(vs.reduce(function(a,b){ return a+b; }, 0) / vs.length) : null; });
    var _flow2Avg = [0,1,2,3].map(function(i) { var vs = _flow2Pts.map(function(p){ return p[i]; }).filter(function(y){ return y != null; }); return vs.length ? Math.round(vs.reduce(function(a,b){ return a+b; }, 0) / vs.length) : null; });
    var _fW = 340, _fH = 180, _fPadX = 40, _fPadTop = 14, _fPadBot = 28;
    var _fXOf = function(i) { return _fPadX + i * (_fW - _fPadX - 12) / 3; };
    var _fRange = (_flowMax - _flowMin) || 1;
    var _fYOf = function(y) { return _fPadTop + (_flowMax - y) / _fRange * (_fH - _fPadTop - _fPadBot); };
    var _fPath = function(p) { var d = "", first = true; for (var i = 0; i < 4; i++) { if (p[i] == null) continue; d += (first ? "M" : "L") + _fXOf(i).toFixed(1) + " " + _fYOf(p[i]).toFixed(1) + " "; first = false; } return d; };
    var priceFlowSec = _flowPts.length === 0 ? null : React.createElement("div", null,
      _secH("📉 価格フロー（OS値→確定値→H高値→H確定値）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "水準線(0)基準・上=赤側/下=緑側。薄線＝各記録(" + _flowPts.length + "件)、太赤線＝H1平均" + (_flow2Pts.length ? "、橙破線＝H2平均(○/△ " + _flow2Pts.length + "件)" : "") + "。※OS値の上下は確定値と同じ側と仮定。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("svg", { viewBox: "0 0 " + _fW + " " + _fH, style: { width: "100%", maxWidth: 560, height: "auto", display: "block" } },
          _fTicks.map(function(t) { return React.createElement("g", { key: "gl" + t },
            React.createElement("line", { x1: _fPadX, y1: _fYOf(t), x2: _fW - 12, y2: _fYOf(t), stroke: t === 0 ? "#bbb" : "#eee", strokeWidth: 1, strokeDasharray: t === 0 ? "3 3" : null }),
            React.createElement("text", { x: _fPadX - 4, y: _fYOf(t) + 3, fontSize: 7, fill: t === 0 ? "#999" : "#bbb", textAnchor: "end" }, (t > 0 ? "+" : "") + t + "円")
          ); }),
          _flowPts.map(function(p, i) { return React.createElement("path", { key: "f" + i, d: _fPath(p), fill: "none", stroke: "#9CA3AF", strokeWidth: 0.6, opacity: 0.22 }); }),
          React.createElement("path", { d: _fPath(_flowAvg), fill: "none", stroke: "#C0392B", strokeWidth: 2.5, opacity: 0.95 }),
          _flowAvg.map(function(y, i) { return y == null ? null : React.createElement("g", { key: "a" + i },
            React.createElement("circle", { cx: _fXOf(i), cy: _fYOf(y), r: 3, fill: "#C0392B" }),
            React.createElement("text", { x: _fXOf(i), y: _fYOf(y) - 6, fontSize: 8, fill: "#9A3412", textAnchor: "middle", fontWeight: 700 }, (y > 0 ? "+" : "") + y)
          ); }),
          _flow2Pts.length ? React.createElement("path", { key: "h2line", d: _fPath(_flow2Avg), fill: "none", stroke: "#EA580C", strokeWidth: 2, opacity: 0.9, strokeDasharray: "4 2" }) : null,
          _flow2Pts.length ? _flow2Avg.map(function(y, i) { return y == null ? null : React.createElement("circle", { key: "h2p" + i, cx: _fXOf(i), cy: _fYOf(y), r: 2.5, fill: "#EA580C" }); }) : null,
          ["OS値", "確定値", "H高値", "H確定値"].map(function(lb, i) { return React.createElement("text", { key: "x" + i, x: _fXOf(i), y: _fH - 9, fontSize: 9, fill: "#555", textAnchor: "middle", fontWeight: 600 }, lb); })
        )
      )
    );

    var _osHoldMap = {};
    osRecs.forEach(function(r) {
      var s = r.signal; if (s.osVal == null) return;
      var _ai = _elAlphaInfo(r, data);
      var _hp = _elDynHold(s, _ai.alpha, _ai.cutLine);
      var _h2p = _elHold2TotParts(s, _ai.alpha, _ai.cutLine);
      if (_hp == null && _h2p.main == null && _h2p.ref == null) return;
      var k = _osBucketKey(Number(s.osVal));
      if (!_osHoldMap[k]) _osHoldMap[k] = { sum: 0, cnt: 0, win: 0, m2: 0, m2c: 0, w2: 0, r2: 0, r2c: 0 };
      var m = _osHoldMap[k];
      var _h1o = _elHold1TotParts(s, _ai.alpha, _ai.cutLine); if (_h1o.main != null) { m.sum += _h1o.main; m.cnt++; if (_h1o.main > 0) m.win++; }
      if (_h2p.main != null) { m.m2 += _h2p.main; m.m2c++; if (_h2p.main > 0) m.w2++; }
      if (_h2p.ref != null) { m.r2 += _h2p.ref; m.r2c++; }
    });
    var _osHoldKeys = Object.keys(_osHoldMap).map(Number).sort(function(a, b) { return a - b; });
    var osHoldProfitSec = _osHoldKeys.length === 0 ? null : React.createElement("div", null,
      _secH("📊 OS値別 H1/H2ホールド結果利益（設定α）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "各銘柄の設定α値でホールドした場合の、OS値帯ごとの結果利益（100株換算）。H2は期待度○/△が本集計・×は（参考）併記。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } }, _aTh2("OS値帯", { textAlign: "left" }), _aTh2("H1利益合計"), _aTh2("H1平均"), _aTh2("H1勝率"), _aTh2("H2利益合計"), _aTh2("H2平均"), _aTh2("H2勝率"), _aTh2("件数"))),
          React.createElement("tbody", null, _osHoldKeys.map(function(k) {
            var m = _osHoldMap[k];
            var _avg = m.cnt > 0 ? Math.round(m.sum / m.cnt) : null; var _wp = m.cnt > 0 ? Math.round(m.win / m.cnt * 100) : null;
            var _avg2 = m.m2c > 0 ? Math.round(m.m2 / m.m2c) : null; var _wp2 = m.m2c > 0 ? Math.round(m.w2 / m.m2c * 100) : null;
            return React.createElement("tr", { key: k },
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, _osBucketLabel(k)),
              m.cnt > 0 ? React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: 700, color: _apCol(m.sum), fontVariantNumeric: "tabular-nums" } }, _apFmt(m.sum)) : _aTd2("—", "#ccc"),
              _aTd2(_avg != null ? _apFmt(_avg) : "—", _avg != null ? _apCol(_avg) : "#ccc"),
              _aTd2(_wp != null ? _wp + "%" : "—", _wp != null && _wp >= 50 ? "#C0392B" : "#1E8449"),
              _h2Cell(m.m2, m.m2c, m.r2, m.r2c, false),
              _aTd2(_avg2 != null ? _apFmt(_avg2) : "—", _avg2 != null ? _apCol(_avg2) : "#ccc"),
              _aTd2(_wp2 != null ? _wp2 + "%" : "—", _wp2 != null && _wp2 >= 50 ? "#C0392B" : "#1E8449"),
              _aTd2(m.cnt, "#333"));
          }))
        )
      )
    );

    var _reachTot = 0, _reach = 0, _reachWin = 0, _reachSum = 0, _reachCnt = 0;
    osRecs.forEach(function(r) { var s = r.signal; var _ai = _elAlphaInfo(r, data); if (_elPlanIsStop(s, _ai.alpha, _ai.cutLine)) return; _reachTot++; if (s.holdHighSign === "-" && s.holdHighVal != null && Number(s.holdHighVal) >= _ai.alpha) { _reach++; var _hp = _elDynHold(s, _ai.alpha, _ai.cutLine); if (_hp != null) { _reachSum += _hp; _reachCnt++; if (_hp > 0) _reachWin++; } } });
    var _reachPct = _reachTot > 0 ? Math.round(_reach / _reachTot * 100) : null;
    var _reachWp = _reachCnt > 0 ? Math.round(_reachWin / _reachCnt * 100) : null;
    var _reachAvg = _reachCnt > 0 ? Math.round(_reachSum / _reachCnt) : null;
    var _r2Tot = 0, _r2 = 0, _r2Win = 0, _r2Sum = 0, _r2Cnt = 0;
    osRecs.forEach(function(r) {
      var s = r.signal;
      if (!((s.hold2Exp === "○" || s.hold2Exp === "△") && _elHas2Data(s))) return;
      _r2Tot++;
      var _ai = _elAlphaInfo(r, data);
      if (s.hold2HighSign === "-" && s.hold2HighVal != null && Number(s.hold2HighVal) >= _ai.alpha) {
        _r2++;
        var _h2 = _elDynHold2(s, _ai.alpha, _ai.cutLine);
        if (_h2 != null) { _r2Sum += _h2; _r2Cnt++; if (_h2 > 0) _r2Win++; }
      }
    });
    var _r2Pct = _r2Tot > 0 ? Math.round(_r2 / _r2Tot * 100) : null;
    var _r2Wp = _r2Cnt > 0 ? Math.round(_r2Win / _r2Cnt * 100) : null;
    var _r2Avg = _r2Cnt > 0 ? Math.round(_r2Sum / _r2Cnt) : null;
    var _reachCard = function(title, big, bigColor, sub) {
      return React.createElement("div", { style: { flex: "1 1 90px", padding: "6px 8px", background: "#f9f8f5", borderRadius: 6, border: "1px solid #e8e5de" } },
        React.createElement("div", { style: { fontSize: 9, color: "#888" } }, title),
        React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: bigColor } }, big),
        sub ? React.createElement("div", { style: { fontSize: 9, color: "#aaa" } }, sub) : null);
    };
    var _reachRow = function(label, pct, reach, tot, wp, avg) {
      return React.createElement("div", { style: { marginBottom: 6 } },
        React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", marginBottom: 3 } }, label),
        React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
          _reachCard("到達率", pct != null ? pct + "%" : "—", "#9A3412", reach + "/" + tot + "件"),
          _reachCard("到達時の勝率", wp != null ? wp + "%" : "—", wp != null && wp >= 50 ? "#C0392B" : "#1E8449", null),
          _reachCard("到達時の平均利益", avg != null ? _apFmt(avg) : "—", avg != null ? _apCol(avg) : "#ccc", null)));
    };
    var reachSec = React.createElement("div", null,
      _secH("🎯 H1/H2 ホールド到達率（H高値≧α）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "H高値が設定α値以上＝ホールドでエントリー成立した割合と成績。H1＝全件、H2＝期待度○/△の記録のうちH2高値が到達した割合。"),
      _reachRow("H1ホールド", _reachPct, _reach, _reachTot, _reachWp, _reachAvg),
      _r2Tot > 0 ? _reachRow("H2ホールド", _r2Pct, _r2, _r2Tot, _r2Wp, _r2Avg) : null
    );

    var _cutRows = [];
    [5, 10, 15, 20].forEach(function(_clv) {
      (function(_cl) {
        var _csum = 0, _ccnt = 0, _cStpP = 0, _cStpH1 = 0, _cStpH2 = 0;
        osRecs.forEach(function(r) {
          var s = r.signal; var _ai = _elAlphaInfo(r, data);
          var _hp = _elDynHold(s, _ai.alpha, _cl); if (_hp != null) { _csum += _hp; _ccnt++; }
          var _pStC = _elPlanIsStop(s, _ai.alpha, _cl);
          var _h1StC = !_pStC && _elHoldIsStop(s, _ai.alpha, _cl);
          var _h2StC = !_pStC && !_h1StC && _elHas2Data(s) && !_elH2Miss(s, _ai.alpha) && _elHoldIsStop2(s, _ai.alpha, _cl);
          if (_pStC) _cStpP++;
          if (_h1StC) _cStpH1++;
          if (_h2StC) _cStpH2++;
        });
        var _acc2 = _h2Acc(osRecs, function(r){ return _elAlphaInfo(r, data).alpha; }, function(){ return _cl; });
        _cutRows.push({ cl: _cl, sum: _csum, cnt: _ccnt, avg: _ccnt > 0 ? Math.round(_csum / _ccnt) : null, sum2: _acc2.main, cnt2: _acc2.mainCnt, ref2: _acc2.ref, refCnt2: _acc2.refCnt, avg2: _acc2.mainCnt > 0 ? Math.round(_acc2.main / _acc2.mainCnt) : null,
          stopP: _cStpP, stopH1: _cStpH1, stopH2: _cStpH2, stopAny: _cStpP + _cStpH1 + _cStpH2 });
      })(_clv);
    });
    var _bestCut = Math.max.apply(null, _cutRows.map(function(x) { return x.cnt > 0 ? x.sum : -Infinity; }));
    var _bestCut2 = Math.max.apply(null, _cutRows.map(function(x) { return x.cnt2 > 0 ? x.sum2 : -Infinity; }));
    var cutInsight = (function() {
      if (osCount < 3) return null;
      var r10 = _cutRows[1], r15 = _cutRows[2];
      var bc = null;
      _cutRows.forEach(function(x) { if (bc == null && x.cnt > 0 && x.sum === _bestCut && _bestCut > -Infinity) bc = x; });
      var _fy = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
      return _elInsightBoxV2([
        React.createElement("span", null, "損切りラインを ", _elInsightEmV2("10→15円"), " に広げると損切りは " + r10.stopAny + "→" + r15.stopAny + "回・H1利益は " + (r10.cnt > 0 ? _fy(r10.sum) : "—") + "→" + (r15.cnt > 0 ? _fy(r15.sum) : "—")),
        bc ? React.createElement("span", null, "H1利益が最大になるのは損切りライン ", _elInsightEmV2(bc.cl + "円", "#9333EA"), "（" + _fy(bc.sum) + "）") : null
      ], { title: "損切りライン別" });
    })();
    var cutHoldSec = React.createElement("div", null,
      _secH("📏 損切りライン別 損切り回数＆ホールド利益（設定α）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "損切りラインを5〜20円に変えた場合に損切りが何回起きるか（α＝各記録の採用値・内訳は想定/H1/H2の発生段階）。H1/H2利益は参考（100株換算・H2は期待度○/△が本集計・×は（参考））。★＝利益最大。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } }, _aTh2("損切り", { textAlign: "left" }), _aTh2("損切り回数"), _aTh2("内訳(想/H1/H2)"), _aTh2("H1利益合計"), _aTh2("H2利益合計"), _aTh2("件数"))),
          React.createElement("tbody", null, _cutRows.map(function(x) {
            var _best = x.cnt > 0 && x.sum === _bestCut && _bestCut > -Infinity;
            var _best2 = x.cnt2 > 0 && x.sum2 === _bestCut2 && _bestCut2 > -Infinity;
            var _stpRate = osCount > 0 ? Math.round(x.stopAny / osCount * 100) : null;
            return React.createElement("tr", { key: x.cl, style: { background: (_best || _best2) ? "#FEF3C7" : "transparent" } },
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, x.cl + "円", _best ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 4 } }, "★H1") : null, _best2 ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 3 } }, "★H2") : null),
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: 700, color: x.stopAny > 0 ? "#1E8449" : "#bbb", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } },
                x.stopAny + "回", _stpRate != null ? React.createElement("span", { style: { fontSize: 9, color: "#888", fontWeight: 400, marginLeft: 2 } }, "(" + _stpRate + "%)") : null),
              _aTd2(x.stopAny > 0 ? (x.stopP + " / " + x.stopH1 + " / " + x.stopH2) : "—", x.stopAny > 0 ? "#555" : "#ccc"),
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: _best ? 800 : 600, color: x.cnt > 0 ? _apCol(x.sum) : "#ccc", fontVariantNumeric: "tabular-nums" } }, x.cnt > 0 ? _apFmt(x.sum) : "—"),
              _h2Cell(x.sum2, x.cnt2, x.ref2, x.refCnt2, _best2),
              _aTd2(x.cnt > 0 ? x.cnt : "—", x.cnt > 0 ? "#333" : "#ccc"));
          }))
        )
      )
    );

    var _tsSlotIdx = function(m) { return m <= 15 ? 0 : m <= 30 ? 1 : m <= 45 ? 2 : 3; };
    var _tsSlotKey = function(t) {
      if (!t) return null;
      var parts = t.split(":"); var h = parseInt(parts[0]), m = parseInt(parts[1]);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 4 + _tsSlotIdx(m);
    };
    var _tsSlotLabel = function(key) {
      var h = Math.floor(key / 4), si = key % 4;
      var p = function(n) { return n < 10 ? "0" + n : "" + n; };
      var ss = ["00","16","31","46"], es = ["15","30","45","00"];
      var eh = si === 3 ? h + 1 : h;
      return p(h) + ":" + ss[si] + "〜" + p(eh) + ":" + es[si];
    };
    var bySlot = {}, slotLabels = {};
    osRecs.forEach(function(r) {
      var k = _tsSlotKey(r.signal.time || ""); if (k == null) return;
      if (!bySlot[k]) { bySlot[k] = []; slotLabels[k] = _tsSlotLabel(k); }
      bySlot[k].push(r);
    });
    var slotKeys = Object.keys(bySlot).map(Number).sort(function(a, b) { return a - b; });
    var slotAvgs = slotKeys.map(function(k) { return { key: k, label: slotLabels[k], avg: avgOf(bySlot[k].map(function(r) { return Number(r.signal.osVal); })), cnt: bySlot[k].length }; });
    var hrMax2 = slotAvgs.length ? Math.max.apply(null, slotAvgs.map(function(x) { return x.avg; })) : 0;
    var hrSec = slotKeys.length > 0 ? React.createElement("div", null,
      _secH("⏱ 時間帯別 平均OS値（15分区切り）"),
      React.createElement("div", { style: { fontSize: 9, color: "#aaa", margin: "-4px 0 4px" } }, "※ 時間帯をタップでその時間帯の記録一覧を表示"),
      slotAvgs.map(function(x) {
        var _act = osSlotSel === x.key;
        return React.createElement("div", { key: x.key },
          _bar(x.label + " (" + x.cnt + "件)", x.avg, hrMax2, "#7C3AED", x.avg + "円", function() { setOsSlotSel(_act ? null : x.key); }, _act),
          _act ? React.createElement("div", { style: { margin: "3px 0 8px", paddingLeft: 6, borderLeft: "2px solid #7C3AED" } },
            bySlot[x.key].slice().sort(function(a, b) { return (a.signal.time || "").localeCompare(b.signal.time || ""); }).map(function(r) {
              return React.createElement(EntryLogCard, { key: r.stock + "_" + r.signal.id, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate });
            })
          ) : null
        );
      })
    ) : null;
    var bySig = {};
    osRecs.forEach(function(r) {
      var tags = (r.signal.tags && r.signal.tags.length > 0) ? r.signal.tags
        : (r.signal.tag && r.signal.tag !== "__custom__" ? [r.signal.tag] : []);
      if (!tags.length) tags = ["(未設定)"];
      tags.forEach(function(t) { if (!bySig[t]) bySig[t] = []; bySig[t].push(Number(r.signal.osVal)); });
    });
    var sigE = Object.keys(bySig).map(function(k) {
      return { k: k, avg: avgOf(bySig[k]), cnt: bySig[k].length };
    }).sort(function(a, b) { return b.avg - a.avg; });
    var sMax = sigE.length ? Math.max.apply(null, sigE.map(function(x) { return x.avg; })) : 0;
    var sigSec = sigE.length > 0 ? React.createElement("div", null,
      _secH("📍 シグナル別 平均OS値"),
      sigE.map(function(x) {
        var lbl = x.k.length > 12 ? x.k.slice(0, 12) + "…" : x.k;
        return _bar(lbl, x.avg, sMax, "#3B82F6", x.avg + "円 (" + x.cnt + "件)");
      })
    ) : null;
    var stopAnaSec = (function() {
      var _ssAll = _elStopStatsV2(osRecs, data);
      var _chip = function(label, val, color) {
        return React.createElement("div", { key: label, style: { background: "#f5f4f0", border: "1px solid #e0ddd6", borderRadius: 6, padding: "6px 10px", minWidth: 62, textAlign: "center", flexShrink: 0 } },
          React.createElement("div", { style: { fontSize: 9, color: "#888", fontWeight: 600 } }, label),
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: color || "#333", marginTop: 2 } }, val));
      };
      var _stopRecsOf = function(recsArr) {
        return recsArr.filter(function(r) {
          var s = r.signal; if (!s) return false;
          var ai = _elAlphaInfo(r, data);
          if (_elPlanIsStop(s, ai.alpha, ai.cutLine)) return true;
          if (_elHoldIsStop(s, ai.alpha, ai.cutLine)) return true;
          return _elHas2Data(s) && !_elH2Miss(s, ai.alpha) && _elHoldIsStop2(s, ai.alpha, ai.cutLine);
        });
      };
      var _mkStopBars = function(title, map, color, prefix) {
        var es = Object.keys(map).map(function(k) { return { k: k, ss: _elStopStatsV2(map[k], data) }; })
          .filter(function(x) { return x.ss.os > 0; })
          .sort(function(a, b) { return (b.ss.any - a.ss.any) || (b.ss.os - a.ss.os); });
        if (!es.length) return null;
        var mx = Math.max.apply(null, es.map(function(x) { return x.ss.any; }));
        if (mx <= 0) mx = 1;
        return React.createElement("div", { style: { flex: "1 1 260px", minWidth: 0 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", margin: "6px 0 4px" } }, title),
          es.map(function(x) {
            var lbl = x.k.length > 12 ? x.k.slice(0, 12) + "…" : x.k;
            var selKey = prefix + x.k;
            var act = stopAnaSel === selKey;
            var canExp = x.ss.any > 0;
            return React.createElement("div", { key: selKey },
              _bar(lbl + " (" + x.ss.os + "件)", x.ss.any, mx, color, x.ss.any + "回" + (x.ss.rate != null ? " (" + x.ss.rate + "%)" : ""),
                canExp ? function() { setStopAnaSel(act ? null : selKey); } : null, act),
              (act && canExp) ? React.createElement("div", { style: { margin: "3px 0 8px", paddingLeft: 6, borderLeft: "2px solid " + color } },
                React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#555", margin: "2px 0 4px" } }, "▼ 損切りになった記録（" + x.ss.any + "件）"),
                _stopRecsOf(map[x.k]).sort(function(a, b) { return (b.date + (b.signal.time || "")).localeCompare(a.date + (a.signal.time || "")); }).map(function(r) {
                  return React.createElement(EntryLogCard, { key: r.stock + "_" + r.signal.id, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate });
                })
              ) : null
            );
          })
        );
      };
      var _byStockStp = {};
      osRecs.forEach(function(r) { if (!_byStockStp[r.stock]) _byStockStp[r.stock] = []; _byStockStp[r.stock].push(r); });
      var _bySigStp = {};
      osRecs.forEach(function(r) {
        var tags = (r.signal.tags && r.signal.tags.length > 0) ? r.signal.tags
          : (r.signal.tag && r.signal.tag !== "__custom__" ? [r.signal.tag] : []);
        if (r.signal.isCustomTag) tags = tags.concat([r.signal.customTagText || "(その他)"]);
        if (!tags.length) tags = ["(未設定)"];
        tags.forEach(function(t) { if (!_bySigStp[t]) _bySigStp[t] = []; _bySigStp[t].push(r); });
      });
      var _bySlotStp = {};
      osRecs.forEach(function(r) {
        var k = _tsSlotKey(r.signal.time || ""); if (k == null) return;
        var lb = _tsSlotLabel(k);
        if (!_bySlotStp[lb]) _bySlotStp[lb] = [];
        _bySlotStp[lb].push(r);
      });
      return React.createElement("div", null,
        _secH("⛔ 損切り回数 分析（どこで損切りが起きているか）"),
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "損切り＝想定（OS値−α≧損切り値）・H1高値・H2高値のいずれかで損切りライン到達。各記録の採用α・損切り値で判定。率は各グループのOS値入力件数比。バーをタップで該当記録を表示。"),
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
          _chip("損切り合計", _ssAll.any + "回", _ssAll.any > 0 ? "#1E8449" : "#888"),
          _chip("損切り率", _ssAll.rate != null ? _ssAll.rate + "%" : "—", "#1E8449"),
          _chip("想定段階", _ssAll.plan + "回", "#1E8449"),
          _chip("H1段階", _ssAll.h1 + "回", "#0E7490"),
          _chip("H2段階", _ssAll.h2 + "回", "#7C3AED"),
          _chip("E未達", _ssAll.miss + "件", "#7C3AED")
        ),
        (function() {
          if (_ssAll.any <= 0) return _elInsightBoxV2([_ssAll.os >= 3 ? "現在の採用α・損切り値では損切りは1回も発生していない" : null], { title: "損切り" });
          var _topOf = function(map) {
            var best = null;
            Object.keys(map).forEach(function(k) {
              var ss = _elStopStatsV2(map[k], data);
              if (ss.any > 0 && (!best || ss.any > best.any)) best = { k: k, any: ss.any, rate: ss.rate };
            });
            return best;
          };
          var stage = [["想定", _ssAll.plan], ["H1", _ssAll.h1], ["H2", _ssAll.h2]].sort(function(a, b) { return b[1] - a[1]; })[0];
          var ts = _topOf(_byStockStp), tg = _topOf(_bySigStp), tt = _topOf(_bySlotStp);
          return _elInsightBoxV2([
            stage[1] > 0 ? React.createElement("span", null, "損切りは ", _elInsightEmV2(stage[0] + "段階", "#1E8449"), " で起きることが最も多い（" + stage[1] + "/" + _ssAll.any + "回）") : null,
            ts ? React.createElement("span", null, "銘柄では ", _elInsightEmV2("「" + ts.k + "」"), " が最多（" + ts.any + "回" + (ts.rate != null ? "・率" + ts.rate + "%" : "") + "）") : null,
            tg ? React.createElement("span", null, "シグナルでは ", _elInsightEmV2("「" + tg.k + "」"), " が最多（" + tg.any + "回）") : null,
            tt ? React.createElement("span", null, "時間帯では ", _elInsightEmV2(tt.k), " に多い（" + tt.any + "回）") : null
          ], { title: "損切り" });
        })(),
        React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          _mkStopBars("📈 銘柄別 損切り回数", _byStockStp, "#1E8449", "stk:"),
          _mkStopBars("📍 シグナル別 損切り回数", _bySigStp, "#0E7490", "sig:"),
          _mkStopBars("⏱ 時間帯別 損切り回数（15分区切り）", _bySlotStp, "#7C3AED", "slot:")
        )
      );
    })();
    var devRecs = osRecs.filter(function(r) { return r.signal.osConfVal != null; });
    var devSec = null;
    if (devRecs.length > 0) {
      var devs = devRecs.map(function(r) { return Number(r.signal.osVal) - Number(r.signal.osConfVal); });
      var devAvg = Math.round(avgOf(devs) * 10) / 10;
      var devHistM = {}; var dR = 5;
      devs.forEach(function(v) { var k = Math.floor(v / dR) * dR; devHistM[k] = (devHistM[k] || 0) + 1; });
      var dKeys = Object.keys(devHistM).map(Number).sort(function(a, b) { return b - a; });
      var dMax2 = Math.max.apply(null, dKeys.map(function(k) { return devHistM[k]; }));
      
      var _devAvgTxt = devAvg > 0 ? ("↑" + devAvg + "円") : devAvg < 0 ? ("↓" + Math.abs(devAvg) + "円") : "0円";
      var _devLabel = function(k) {
        if (k >= 0) return "↑ " + k + "〜" + (k + dR - 1) + "円";
        return "↓ " + Math.abs(k + dR - 1) + "〜" + Math.abs(k) + "円";
      };
      devSec = React.createElement("div", null,
        _secH("↕ OS値と確定値の乖離（OS値－確定値、" + devRecs.length + "件）"),
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 4 } }, "平均乖離: ", React.createElement("span", { style: { fontWeight: 700, color: devAvg > 0 ? "#C0392B" : devAvg < 0 ? "#3B82F6" : "#888" } }, _devAvgTxt)),
        dKeys.map(function(k) {
          return _bar(_devLabel(k), devHistM[k], dMax2, k >= 0 ? "#FB923C" : "#3B82F6", devHistM[k] + "件");
        }),
        (function() {
          if (devRecs.length < 3) return null;
          var posN = 0; devs.forEach(function(v) { if (v > 0) posN++; });
          var posPct = Math.round(posN / devs.length * 100);
          return _elInsightBoxV2([
            devAvg > 0
              ? React.createElement("span", null, "OSの先端から確定値までに平均 ", _elInsightEmV2(devAvg + "円", "#C0392B"), " 戻ることが多い（空売りの戻り幅の目安）")
              : React.createElement("span", null, "確定値がOS値から戻らない傾向（平均乖離 " + devAvg + "円）— 引かされやすい点に注意"),
            React.createElement("span", null, posPct + "% の場面で確定値はOS値より戻して終わっている")
          ], { title: "OS値と確定値の乖離" });
        })()
      );
    }
    var holdSec = (function() {
      var _liveA = !!(data && data.charts);
      var deltas = [], profUp = 0, profDn = 0, lossDn = 0, lossUp = 0, profConv = 0, lossConv = 0, flat = 0;
      osRecs.forEach(function(r) {
        var s = r.signal;
        var ai = _liveA ? _elAlphaInfo(r, data) : { alpha: null, cutLine: null };
        var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
        var _p100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
        var pp = _liveA ? _elDynPlanned(s, ai.alpha, ai.cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
        var hp = _liveA ? _elDynHold(s, ai.alpha, ai.cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
        if (pp == null || hp == null) return;
        var ppN = _liveA ? Math.round(pp) : _p100(pp);
        var hpN = _liveA ? Math.round(hp) : _p100(hp);
        var d = hpN - ppN;
        deltas.push(d);
        if (d === 0) flat++;
        else if (ppN >= 0 && hpN < 0) lossConv++;
        else if (ppN < 0 && hpN >= 0) profConv++;
        else if (hpN >= 0) { if (d > 0) profUp++; else profDn++; }
        else { if (d > 0) lossDn++; else lossUp++; }
      });
      if (!deltas.length) return null;
      var n = deltas.length;
      var avgD = Math.round(deltas.reduce(function(a, b) { return a + b; }, 0) / n);
      var better = profUp + lossDn + profConv, worse = profDn + lossUp + lossConv;
      var verdict = better > worse ? "ホールドした方が良いことが多い" : worse > better ? "想定通り利確した方が良いことが多い" : "良し悪し拮抗";
      var verdictCol = better > worse ? "#C0392B" : worse > better ? "#1E8449" : "#888";
      var _box = function(label, valTxt, col) {
        return React.createElement("div", { style: { background: "#f5f4f0", border: "1px solid #e0ddd6", borderRadius: 6, padding: "6px 10px", minWidth: 64, textAlign: "center", flexShrink: 0 } },
          React.createElement("div", { style: { fontSize: 9, color: "#888", fontWeight: 600 } }, label),
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: col || "#333", marginTop: 2 } }, valTxt));
      };
      return React.createElement("div", null,
        _secH("🔄 ホールドによる損益変化（" + n + "件）"),
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "ホールド損益−EP損益。100株換算 / 赤＝ホールドで良化・緑＝悪化（転化＝単独と損益の符号が逆転）"),
        React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: verdictCol, marginBottom: 8 } }, "→ " + verdict + "（良化" + better + "件 / 悪化" + worse + "件" + (flat ? " / 変動なし" + flat + "件" : "") + "）"),
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          _box("利益増加", profUp + "件", "#C0392B"),
          _box("利益転化", profConv + "件", "#C0392B"),
          _box("損失減少", lossDn + "件", "#C0392B"),
          _box("変動なし", flat + "件", "#888"),
          _box("利益減少", profDn + "件", "#1E8449"),
          _box("損失転化", lossConv + "件", "#1E8449"),
          _box("損失増加", lossUp + "件", "#1E8449"),
          _box("平均変化", (avgD > 0 ? "+" : "") + avgD.toLocaleString() + "円", avgD > 0 ? "#C0392B" : avgD < 0 ? "#1E8449" : "#888")
        )
      );
    })();
    var osHoldTrendSec = (function() {
      var _liveA = !!(data && data.charts);
      var buckets = {};
      osRecs.forEach(function(r) {
        var s = r.signal;
        var k = _osBucketKey(Number(s.osVal));
        if (!buckets[k]) buckets[k] = { cnt: 0, conf: [], high: [], hconf: [], delta: [] };
        var b = buckets[k]; b.cnt++;
        if (s.osConfVal != null && s.osConfVal !== "") b.conf.push(s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal));
        if (s.holdHighVal != null) b.high.push(s.holdHighSign === "-" ? Number(s.holdHighVal) : s.holdHighSign === "+" ? -Number(s.holdHighVal) : 0);
        if (s.holdWidth != null) b.hconf.push(s.holdWidthSign === "-" ? Number(s.holdWidth) : -Number(s.holdWidth));
        var ai = _liveA ? _elAlphaInfo(r, data) : { alpha: null, cutLine: null };
        var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
        var _p100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
        var pp = _liveA ? _elDynPlanned(s, ai.alpha, ai.cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
        var hp = _liveA ? _elDynHold(s, ai.alpha, ai.cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
        if (pp != null && hp != null) b.delta.push((_liveA ? Math.round(hp) : _p100(hp)) - (_liveA ? Math.round(pp) : _p100(pp)));
      });
      var keys = Object.keys(buckets).map(Number).sort(function(a, b) { return a - b; });
      if (!keys.length) return null;
      var _avg1 = function(arr) { return arr.length ? Math.round(arr.reduce(function(a, b) { return a + b; }, 0) / arr.length * 10) / 10 : null; };
      var _avgI = function(arr) { return arr.length ? Math.round(arr.reduce(function(a, b) { return a + b; }, 0) / arr.length) : null; };
      var _sCell = function(v, cnt) {
        if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        var col = v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888";
        var arr = v > 0 ? "↑" : v < 0 ? "↓" : "";
        return React.createElement("span", { style: { color: col, fontWeight: 700, fontVariantNumeric: "tabular-nums" } }, arr + Math.abs(v) + "円",
          cnt != null ? React.createElement("span", { style: { fontSize: 8, color: "#bbb", fontWeight: 400, marginLeft: 1 } }, "(" + cnt + ")") : null);
      };
      var _pCell = function(v) {
        if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        var col = v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888";
        return React.createElement("span", { style: { color: col, fontWeight: 700, fontVariantNumeric: "tabular-nums" } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円");
      };
      var _th = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "4px 6px", fontWeight: 700, fontSize: 10, color: "#9A3412", borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center" }, ex || {}) }, t); };
      var _td = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" }, ex || {}) }, c); };
      return React.createElement("div", null,
        _secH("📐 OS値別 ホールド傾向"),
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "OS値帯ごとの平均。確定値・H高値・H確定値は水準線比（↑上=赤/↓下=緑、カッコ内は件数）、損益変化はホールド損益−EP損益(100株)"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", null,
              _th("OS値", { textAlign: "left", paddingLeft: 8 }), _th("件"), _th("平均確定値"), _th("平均H高値"), _th("平均H確定値"), _th("損益変化")
            )),
            React.createElement("tbody", null,
              keys.map(function(k) {
                var b = buckets[k];
                return React.createElement("tr", { key: k },
                  _td(_osBucketLabel(k), { textAlign: "left", fontWeight: 700, color: "#9A3412", paddingLeft: 8 }),
                  _td(b.cnt + "件"),
                  _td(_sCell(_avg1(b.conf), b.conf.length)),
                  _td(_sCell(_avg1(b.high), b.high.length)),
                  _td(_sCell(_avg1(b.hconf), b.hconf.length)),
                  _td(_pCell(_avgI(b.delta)))
                );
              })
            )
          )
        )
      );
    })();
    var hold1ExpSec = (function() {
      var groups = { "○": [], "△": [], "×": [] };
      filtered.forEach(function(r) {
        var s = r.signal;
        if (!s.holdExp || !groups[s.holdExp]) return;
        var ai = _elAlphaInfo(r, data);
        groups[s.holdExp].push({ h1: _elDynHold(s, ai.alpha, ai.cutLine), pl: _elDynPlanned(s, ai.alpha, ai.cutLine) });
      });
      if (!["○", "△", "×"].some(function(k) { return groups[k].length > 0; })) return null;
      var _yen = function(v) { return (v > 0 ? "+" : "") + Math.round(v).toLocaleString() + "円"; };
      var _col = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
      var rows = ["○", "△", "×"].map(function(k) {
        var arr = groups[k];
        var withH1 = arr.filter(function(x) { return x.h1 != null; });
        var sumH1 = withH1.reduce(function(a, x) { return a + x.h1; }, 0);
        var avgH1 = withH1.length ? Math.round(sumH1 / withH1.length) : null;
        var winPct = withH1.length ? Math.round(withH1.filter(function(x) { return x.h1 > 0; }).length / withH1.length * 100) : null;
        var diffArr = arr.filter(function(x) { return x.h1 != null && x.pl != null; }).map(function(x) { return x.h1 - x.pl; });
        var avgDiff = diffArr.length ? Math.round(diffArr.reduce(function(a, b) { return a + b; }, 0) / diffArr.length) : null;
        var label = "—";
        if (arr.length > 0 && winPct != null) {
          if (k === "○") label = winPct >= 60 ? "期待的中◎" : winPct >= 40 ? "ばらつき" : "期待過剰▲";
          else if (k === "△") label = winPct >= 60 ? "好判断◎" : winPct >= 34 ? "read甘い" : "期待過剰▲";
          else label = winPct >= 50 ? "見逃し多▲" : "回避的中◎";
        }
        return { k: k, n: arr.length, sumH1: withH1.length ? sumH1 : null, avgH1: avgH1, winPct: winPct, avgDiff: avgDiff, label: label };
      });
      var _h1th = function(t) { return React.createElement("th", { style: { padding: "4px 6px", fontSize: 10, fontWeight: 700, color: "#9A3412", borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } }, t); };
      var _h1td = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", fontSize: 11, textAlign: "center", whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" }, ex || {}) }, c); };
      var _ec = { "○": "#1E8449", "△": "#B45309", "×": "#C0392B" };
      return React.createElement("div", null,
        _secH("🎯 Hold1期待度別 分析（期待 vs 実際）"),
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "○/△/×を選んだ後、実際にHold1がどうなったか。H1損益はα値比・100株換算。的中率＝H1損益が＋の割合、H1−単独＝EP損益からの上乗せ。×でも＋が多ければ「見逃し」傾向。"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
              _h1th("期待度"), _h1th("件"), _h1th("H1損益(合計)"), _h1th("H1損益(平均)"), _h1th("的中率"), _h1th("H1−単独(平均)"), _h1th("評価"))),
            React.createElement("tbody", null, rows.map(function(row) {
              return React.createElement("tr", { key: row.k },
                _h1td(React.createElement("span", { style: { color: _ec[row.k], fontWeight: 800, fontSize: 14 } }, row.k)),
                _h1td(row.n || "—", { fontWeight: 700 }),
                _h1td(row.sumH1 != null ? React.createElement("span", { style: { fontWeight: 700, color: _col(row.sumH1) } }, _yen(row.sumH1)) : "—"),
                _h1td(row.avgH1 != null ? React.createElement("span", { style: { fontWeight: 700, color: _col(row.avgH1) } }, _yen(row.avgH1)) : "—"),
                _h1td(row.winPct != null ? React.createElement("span", { style: { fontWeight: 700, color: row.winPct >= 60 ? "#C0392B" : row.winPct >= 40 ? "#888" : "#1E8449" } }, row.winPct + "%") : "—"),
                _h1td(row.avgDiff != null ? React.createElement("span", { style: { fontWeight: 700, color: _col(row.avgDiff) } }, _yen(row.avgDiff)) : "—"),
                _h1td(React.createElement("span", { style: { fontSize: 10, color: "#555" } }, row.label))
              );
            }))
          )
        )
      );
    })();
    var hold2ExpSec = (function() {
      var groups = { "○": [], "△": [], "×": [] };
      filtered.forEach(function(r) {
        var s = r.signal;
        if (!s.hold2Exp || !groups[s.hold2Exp]) return;
        if (!_elHas2Data(s)) return;
        var ai = _elAlphaInfo(r, data);
        groups[s.hold2Exp].push({ h2: _elDynHold2(s, ai.alpha, ai.cutLine), h1: _elDynHold(s, ai.alpha, ai.cutLine) });
      });
      if (!["○", "△", "×"].some(function(k) { return groups[k].length > 0; })) return null;
      var _yen = function(v) { return (v > 0 ? "+" : "") + Math.round(v).toLocaleString() + "円"; };
      var _col = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
      var rows = ["○", "△", "×"].map(function(k) {
        var arr = groups[k];
        var withH2 = arr.filter(function(x) { return x.h2 != null; });
        var sumH2 = withH2.reduce(function(a, x) { return a + x.h2; }, 0);
        var avgH2 = withH2.length ? Math.round(sumH2 / withH2.length) : null;
        var winPct = withH2.length ? Math.round(withH2.filter(function(x) { return x.h2 > 0; }).length / withH2.length * 100) : null;
        var diffArr = arr.filter(function(x) { return x.h2 != null && x.h1 != null; }).map(function(x) { return x.h2 - x.h1; });
        var avgDiff = diffArr.length ? Math.round(diffArr.reduce(function(a, b) { return a + b; }, 0) / diffArr.length) : null;
        var label = "—";
        if (arr.length > 0 && winPct != null) {
          if (k === "○") label = winPct >= 60 ? "期待的中◎" : winPct >= 40 ? "ばらつき" : "期待過剰▲";
          else if (k === "△") label = winPct >= 60 ? "好判断◎" : winPct >= 34 ? "read甘い" : "期待過剰▲";
          else label = winPct >= 50 ? "見逃し多▲" : "回避的中◎";
        }
        return { k: k, n: arr.length, sumH2: withH2.length ? sumH2 : null, avgH2: avgH2, winPct: winPct, avgDiff: avgDiff, label: label };
      });
      var _h2th = function(t) { return React.createElement("th", { style: { padding: "4px 6px", fontSize: 10, fontWeight: 700, color: "#9A3412", borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } }, t); };
      var _h2td = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", fontSize: 11, textAlign: "center", whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" }, ex || {}) }, c); };
      var _ec = { "○": "#1E8449", "△": "#B45309", "×": "#C0392B" };
      return React.createElement("div", null,
        _secH("🎯 Hold2期待度別 分析（期待 vs 実際）"),
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "○/△/×を選んだ後、実際にHold2がどうなったか。H2損益はα値比・100株換算。的中率＝H2損益が＋の割合、H2−H1＝ホールド延長の上乗せ。×でも＋が多ければ「見逃し」傾向。"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
              _h2th("期待度"), _h2th("件"), _h2th("H2損益(合計)"), _h2th("H2損益(平均)"), _h2th("的中率"), _h2th("H2−H1(平均)"), _h2th("評価"))),
            React.createElement("tbody", null, rows.map(function(row) {
              return React.createElement("tr", { key: row.k },
                _h2td(React.createElement("span", { style: { color: _ec[row.k], fontWeight: 800, fontSize: 14 } }, row.k)),
                _h2td(row.n || "—", { fontWeight: 700 }),
                _h2td(row.sumH2 != null ? React.createElement("span", { style: { fontWeight: 700, color: _col(row.sumH2) } }, _yen(row.sumH2)) : "—"),
                _h2td(row.avgH2 != null ? React.createElement("span", { style: { fontWeight: 700, color: _col(row.avgH2) } }, _yen(row.avgH2)) : "—"),
                _h2td(row.winPct != null ? React.createElement("span", { style: { fontWeight: 700, color: row.winPct >= 60 ? "#C0392B" : row.winPct >= 40 ? "#888" : "#1E8449" } }, row.winPct + "%") : "—"),
                _h2td(row.avgDiff != null ? React.createElement("span", { style: { fontWeight: 700, color: _col(row.avgDiff) } }, _yen(row.avgDiff)) : "—"),
                _h2td(React.createElement("span", { style: { fontSize: 10, color: "#555" } }, row.label))
              );
            }))
          )
        )
      );
    })();
    var idealSec = (function() {
      var st = _elvIdealStats(osRecs);
      if (!st) return null;
      var _f = function(v, u) { return v == null ? "—" : v + (u || ""); };
      var _modeTxt = function(m) { return m ? m.val + "円(×" + m.n + ")" : "—"; };
      var _diffNode = function(d) { if (d == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); var col = d > 0 ? "#C0392B" : d < 0 ? "#1E8449" : "#888"; return React.createElement("span", { style: { color: col, fontWeight: 700 } }, (d > 0 ? "+" : "") + d + "円"); };
      var kpis = React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
        _elvKpiCard("平均理想α", _f(st.aAvg, "円"), "#0369A1", "中央" + _f(st.aMed, "円") + " / 最頻" + _modeTxt(st.aMode)),
        _elvKpiCard("平均理想損切り", _f(st.cAvg, "円"), "#9333EA", "中央" + _f(st.cMed, "円") + " / 最頻" + _modeTxt(st.cMode)),
        _elvKpiCard("最適一致率", st.optRate + "%", "#1E8449", "採用値=理想だった割合(" + st.n + "件)")
      );
      var _dAmax = Math.max.apply(null, [0, 5, 10, 15, 20].map(function(k) { return st.distA[k]; })) || 1;
      var _dCmax = Math.max.apply(null, [10, 15, 20].map(function(k) { return st.distC[k]; })) || 1;
      var distBars = React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 } },
        React.createElement("div", { style: { flex: "1 1 240px", minWidth: 0 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "理想α値の分布"),
          [0, 5, 10, 15, 20].map(function(k) { return _bar(k + "円", st.distA[k], _dAmax, "#0369A1", st.distA[k] + "件"); })
        ),
        React.createElement("div", { style: { flex: "1 1 240px", minWidth: 0 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9333EA", marginBottom: 4 } }, "理想損切り値の分布"),
          [10, 15, 20].map(function(k) { return _bar(k + "円", st.distC[k], _dCmax, "#9333EA", st.distC[k] + "件"); })
        )
      );
      var diffBlock = React.createElement("div", { style: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8, fontSize: 12, color: "#555" } },
        React.createElement("div", null, "採用α→理想αの平均差: ", _diffNode(st.aDiffAvg), st.aDiffAvg ? React.createElement("span", { style: { fontSize: 10, color: "#888", marginLeft: 4 } }, st.aDiffAvg > 0 ? "(もっと大きいαが最適傾向)" : "(もっと小さいαが最適傾向)") : null),
        React.createElement("div", null, "採用→理想損切りの平均差: ", _diffNode(st.cDiffAvg), st.cDiffAvg ? React.createElement("span", { style: { fontSize: 10, color: "#888", marginLeft: 4 } }, st.cDiffAvg > 0 ? "(もっと広い損切りが最適傾向)" : "(もっと狭い損切りが最適傾向)") : null)
      );
      var _grpTable = function(title, groups) {
        return React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 4 } }, title),
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
              ["", "件", "平均理想α", "平均理想損切り"].map(function(h, i) { return React.createElement("th", { key: i, style: { padding: "3px 6px", fontWeight: 700, color: "#9A3412", fontSize: 10, borderBottom: "2px solid #ddd", textAlign: i === 0 ? "left" : "center", whiteSpace: "nowrap" } }, h); })
            )),
            React.createElement("tbody", null, groups.map(function(g) {
              var gst = _elvIdealStats(g.recs);
              return React.createElement("tr", { key: g.label, style: { borderBottom: "1px solid #f0ede6" } },
                React.createElement("td", { style: { padding: "3px 6px", fontWeight: 700, color: "#9A3412", whiteSpace: "nowrap" } }, g.label),
                React.createElement("td", { style: { padding: "3px 6px", textAlign: "center" } }, gst ? gst.n : 0),
                React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", color: "#0369A1", fontWeight: 700 } }, gst && gst.aAvg != null ? gst.aAvg + "円" : "—"),
                React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", color: "#9333EA", fontWeight: 700 } }, gst && gst.cAvg != null ? gst.cAvg + "円" : "—"));
            }))
          ));
      };
      var _byDiff = {}, _diffOrder = ["A", "B", "C", "D", "E", "(未設定)"];
      osRecs.forEach(function(r) { var d = r.signal.difficulty || "(未設定)"; (_byDiff[d] = _byDiff[d] || []).push(r); });
      var _diffGroups = _diffOrder.filter(function(d) { return _byDiff[d] && _byDiff[d].length; }).map(function(d) { return { label: d === "(未設定)" ? d : "予想OS度" + d, recs: _byDiff[d] }; });
      var _byRes = { ok: [], draw: [], ng: [], miss: [] };
      osRecs.forEach(function(r) { var ai = _elAlphaInfo(r, data); var res = _elDynResult(r.signal, ai.alpha, ai.cutLine); if (_byRes[res]) _byRes[res].push(r); });
      var _resLabels = { ok: "○ 成功", draw: "△ 同値", ng: "× 失敗", miss: "ー E未達" };
      var _resGroups = ["ok", "draw", "ng", "miss"].filter(function(k) { return _byRes[k].length; }).map(function(k) { return { label: _resLabels[k], recs: _byRes[k] }; });
      var grpTables = React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" } },
        _grpTable("予想OS度別", _diffGroups), _grpTable("結果別", _resGroups));
      return React.createElement("div", null,
        _secH("🎯 理想α値・理想損切り値 分析（記録ごとの最適値）"),
        React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 8 } }, "理想α=損切りにならず単独+H1結果損益が最大／理想損切り=損切り回避できる最小値。各記録の採用α・損切りを基準に算出。"),
        kpis, distBars, diffBlock, grpTables);
    })();
    var _osSubTabs = [["basic", "📊 基本・分布"], ["opt", "💰 α・損切り最適化"], ["hold", "📈 ホールド分析"]];
    return React.createElement("div", { style: { marginTop: 8 } },
      React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 10, borderBottom: "1px solid #e0ddd6", overflowX: "auto" } },
        _osSubTabs.map(function(kv) {
          var on = osSub === kv[0];
          return React.createElement("button", { key: kv[0], onClick: function() { setOsSub(kv[0]); },
            style: { padding: "6px 10px", fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer", borderBottom: on ? "2px solid #9A3412" : "2px solid transparent", color: on ? "#9A3412" : "#888", whiteSpace: "nowrap" } }, kv[1]);
        })
      ),
      osSub === "basic" && React.createElement("div", null,
        sumSec, sumInsight, resSec, _osHitSec, stopAnaSec,
        React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          React.createElement("div", { style: { flex: "1 1 260px", minWidth: 0 } }, histSec, hrSec),
          React.createElement("div", { style: { flex: "1 1 260px", minWidth: 0 } }, sigSec)
        ),
        devSec
      ),
      osSub === "opt" && React.createElement("div", null,
        React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" } },
          React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, holdAlphaSec, holdAlphaInsight),
          React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, cutHoldSec, cutInsight)
        ),
        idealSec
      ),
      osSub === "hold" && React.createElement("div", null,
        cmpKpiSec, reachSec, holdSec, hold1ExpSec, hold2ExpSec, priceFlowSec,
        React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" } },
          React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, osHoldTrendSec),
          React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, osHoldProfitSec)
        )
      )
    );
  };
  
  var renderDateView = function() {
    
    var byDate = {};
    sortedByDate.forEach(function(r) {
      if (!byDate[r.date]) byDate[r.date] = [];
      byDate[r.date].push(r);
    });
    var dates = Object.keys(byDate).sort(function(a, b) { return b.localeCompare(a); });
    if (dates.length === 0) return React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: 30 } }, "該当なし");
    
    var monthSet = {};
    dates.forEach(function(d) { monthSet[d.slice(0, 7)] = true; });
    var latestMonth = dates[0].slice(0, 7);
    var curM = (calMonth && monthSet[calMonth]) ? calMonth : latestMonth;
    var cy = parseInt(curM.slice(0, 4));
    var cm = parseInt(curM.slice(5, 7));
    var pad2 = function(n) { return n < 10 ? "0" + n : "" + n; };
    var prevM = cm > 1 ? cy + "-" + pad2(cm - 1) : (cy - 1) + "-12";
    var nextM = cm < 12 ? cy + "-" + pad2(cm + 1) : (cy + 1) + "-01";
    var firstDow = new Date(cy, cm - 1, 1).getDay(); 
    var daysInMonth = new Date(cy, cm, 0).getDate();
    var startOffset = (firstDow + 6) % 7; 
    var totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    var todayStr = (function() { var d = new Date(); return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); })();
    var cells = [];
    for (var ci = 0; ci < totalCells; ci++) {
      var dn = ci - startOffset + 1;
      if (dn < 1 || dn > daysInMonth) { cells.push(null); continue; }
      var ds = curM + "-" + pad2(dn);
      cells.push({ dn: dn, ds: ds, recs: byDate[ds] || [], dow: ci % 7 });
    }
    var DOW_LABELS = ["月", "火", "水", "木", "金", "土", "日"];
    var DOW_COLORS = ["#555","#555","#555","#555","#555","#3B82F6","#EF4444"];
    var cellBg = function(recs) {
      var st = _calcD(recs);
      if (!recs.length || st.winPct == null) return "transparent";
      if (st.winPct >= 70) return "#FFF3E0";
      if (st.winPct >= 50) return "#FFFDE7";
      if (st.winPct >= 30) return "#F1F8E9";
      return "#E8F5E9";
    };

    return React.createElement("div", null,
      
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 } },
        React.createElement("button", {
          onClick: function() { setCalMonth(prevM); setCalExpandDate(null); },
          style: { padding: "5px 14px", fontSize: 15, background: "#fff", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#555" }
        }, "←"),
        React.createElement("span", { style: { fontSize: 15, fontWeight: 700, color: "#1a1a1a", minWidth: 110, textAlign: "center" } },
          cy + "年" + cm + "月"),
        React.createElement("button", {
          onClick: function() { setCalMonth(nextM); setCalExpandDate(null); },
          style: { padding: "5px 14px", fontSize: 15, background: "#fff", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#555" }
        }, "→"),
        React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4 } }, Object.keys(monthSet).length + "ヶ月分")
      ),
      
      React.createElement("div", { style: { border: "1px solid #e0ddd6", borderRadius: 8, overflow: "hidden" } },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f5f4f0", borderBottom: "1px solid #e0ddd6" } },
          DOW_LABELS.map(function(h, i) {
            return React.createElement("div", { key: h, style: { padding: "6px 2px", textAlign: "center", fontSize: 11, fontWeight: 700, color: DOW_COLORS[i] } }, h);
          })
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)" } },
          cells.map(function(cell, ci) {
            if (!cell) {
              return React.createElement("div", { key: "e_" + ci, style: { minHeight: 62, background: "#fafaf8", borderTop: "1px solid #eeece8" } });
            }
            var st = _calcD(cell.recs);
            var hasData = cell.recs.length > 0;
            var isExp = calExpandDate === cell.ds;
            var bg = isExp ? "#FFE8CC" : cellBg(cell.recs);
            var dref = cell.ds;
            return React.createElement("div", {
              key: cell.ds,
              onClick: hasData ? function() {
                setCalExpandDate(isExp ? null : dref);
                setCalStockFil(""); setCalSigFil(""); setCalResFil("");
              } : undefined,
              style: {
                minHeight: 62, padding: "4px 5px",
                borderTop: "1px solid #eeece8",
                borderLeft: ci % 7 !== 0 ? "1px solid #eeece8" : "none",
                background: bg, cursor: hasData ? "pointer" : "default",
                outline: isExp ? "2.5px solid #FB923C" : "none", outlineOffset: -2,
                boxSizing: "border-box"
              }
            },
              React.createElement("div", {
                style: {
                  fontSize: 12, fontWeight: 700, width: 20, height: 20,
                  lineHeight: "20px", textAlign: "center", borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: cell.ds === todayStr ? "#1a1a1a" : "none",
                  color: cell.ds === todayStr ? "#fff" : DOW_COLORS[cell.dow]
                }
              }, cell.dn),
              hasData && React.createElement("div", { style: { marginTop: 2 } },
                React.createElement("div", { style: { fontSize: 9, color: "#666", lineHeight: 1.3 } },
                  cell.recs.length + "件" + (st.winPct != null ? "  " + st.winPct + "%" : "")),
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "1px", marginTop: 1 } },
                  cell.recs.slice(0, 7).map(function(r, ri) {
                    var res = r.signal.result;
                    return React.createElement("span", { key: ri, style: { fontSize: 7, color: res === "ok" ? "#C0392B" : res === "ng" ? "#1E8449" : "#bbb", lineHeight: 1 } },
                      res === "ok" ? "●" : res === "ng" ? "●" : "◌");
                  }),
                  cell.recs.length > 7 && React.createElement("span", { style: { fontSize: 7, color: "#aaa" } }, "…")
                )
              )
            );
          })
        )
      ),
      
      calExpandDate && byDate[calExpandDate] && (function() {
        var allRecs = byDate[calExpandDate];
        
        var calStocks = [], calSigs = [];
        allRecs.forEach(function(r) {
          if (calStocks.indexOf(r.stock) < 0) calStocks.push(r.stock);
          var sig = r.signal.isCustomTag ? (r.signal.customTagText || "(空)") : (r.signal.tag || "(未設定)");
          if (calSigs.indexOf(sig) < 0) calSigs.push(sig);
        });
        calStocks.sort(); calSigs.sort();
        
        var recs = allRecs.filter(function(r) {
          if (calStockFil && r.stock !== calStockFil) return false;
          if (calSigFil) {
            var sig = r.signal.isCustomTag ? (r.signal.customTagText || "(空)") : (r.signal.tag || "(未設定)");
            if (sig !== calSigFil) return false;
          }
          if (calResFil && r.signal.result !== calResFil) return false;
          return true;
        });
        var filtSt = _calcD(recs);
        var st = _calcD(allRecs);
        var _fsAbRecs = recs.filter(function(r) { var d = r.signal && r.signal.difficulty; return d === "A" || d === "B"; });
        var _fsAbSt = _fsAbRecs.length > 0 ? _calcD(_fsAbRecs) : {};
        var sorted, grouped = null;
        if (sortMode === "category") grouped = _groupByCategory(recs, signalTags);
        else if (sortMode === "time") sorted = _sortByTime(recs);
        else sorted = _sortByCustom(recs, calExpandDate, custom.dailyOrder || {});
        var currentOrder = (sorted || []).map(_recKey);
        var ChipBtn = function(label, active, onClick2) {
          return React.createElement("button", {
            onClick: onClick2,
            style: { padding: "3px 9px", fontSize: 10, fontWeight: 700,
              background: active ? "#1a1a1a" : "#f0eeea",
              color: active ? "#fff" : "#555",
              border: "none", borderRadius: 12, cursor: "pointer", whiteSpace: "nowrap" }
          }, label);
        };
        return React.createElement("div", { style: { marginTop: 10 } },
          
          React.createElement("div", {
            style: { fontSize: 13, fontWeight: 700, padding: "8px 12px", background: "#1a1a1a", color: "#fff", borderRadius: "6px 6px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }
          },
            React.createElement("span", null, _fmtDow(calExpandDate) + "  " + allRecs.length + "件"),
            React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
              React.createElement("span", { style: { fontSize: 11, opacity: 0.85 } },
                "○" + st.ok + " ✕" + st.ng + (st.winPct != null ? "  " + st.winPct + "%" : "")),
              React.createElement("button", {
                onClick: function() { setEditTarget({ date: calExpandDate, stock: "" }); },
                style: { fontSize: 10, padding: "2px 7px", background: "#FB923C", border: "1px solid #F97316", borderRadius: 4, cursor: "pointer", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }
              }, "＋ 追加"),
              React.createElement("button", {
                onClick: function() { handleGoDate(calExpandDate); },
                style: { fontSize: 10, padding: "2px 7px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 4, cursor: "pointer", color: "#fff", whiteSpace: "nowrap" }
              }, "詳細 →"),
              React.createElement("button", {
                onClick: function() { setCalExpandDate(null); },
                style: { fontSize: 15, background: "none", border: "none", cursor: "pointer", color: "#fff", lineHeight: 1, padding: "0 2px" }
              }, "×")
            )
          ),
          
          React.createElement("div", { style: { padding: "8px 12px", background: "#f8f7f4", borderLeft: "1px solid #e0ddd6", borderRight: "1px solid #e0ddd6", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" } },
            
            calStocks.length > 1 && React.createElement(React.Fragment, null,
              React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "銘柄:"),
              ChipBtn("全て", !calStockFil, function() { setCalStockFil(""); }),
              calStocks.map(function(s) { var sr = s; return ChipBtn(sr, calStockFil === sr, function() { setCalStockFil(calStockFil === sr ? "" : sr); }); })
            ),
            
            calSigs.length > 1 && React.createElement(React.Fragment, null,
              React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginLeft: calStocks.length > 1 ? 8 : 0 } }, "シグナル:"),
              ChipBtn("全て", !calSigFil, function() { setCalSigFil(""); }),
              calSigs.map(function(s) { var sr = s; return ChipBtn(sr, calSigFil === sr, function() { setCalSigFil(calSigFil === sr ? "" : sr); }); })
            ),
            
            React.createElement(React.Fragment, null,
              React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700, marginLeft: (calStocks.length > 1 || calSigs.length > 1) ? 8 : 0 } }, "結果:"),
              ChipBtn("全て", !calResFil, function() { setCalResFil(""); }),
              ChipBtn("○勝", calResFil === "ok",  function() { setCalResFil(calResFil === "ok"  ? "" : "ok"); }),
              ChipBtn("✕負", calResFil === "ng",  function() { setCalResFil(calResFil === "ng"  ? "" : "ng"); })
            )
          ),
          
          React.createElement("div", { style: { padding: "5px 12px", background: "#FAFAF8", borderLeft: "1px solid #e0ddd6", borderRight: "1px solid #e0ddd6", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", fontSize: 11 } },
            React.createElement("span", { style: { color: "#888", fontWeight: 700 } }, "合計:"),
            filtSt.sumPnl !== 0
              ? React.createElement("span", { style: { color: filtSt.sumPnl > 0 ? "#C0392B" : "#1E8449", fontWeight: 600 } }, "実現 " + (filtSt.sumPnl > 0 ? "+" : "") + filtSt.sumPnl + "円")
              : React.createElement("span", { style: { color: "#ccc" } }, "実現 —"),
            (function() {
              var _abP = _fsAbSt.sumPlanned || 0, _allP = filtSt.sumPlanned;
              var _fmtFS = function(v) { return (v > 0 ? "+" : "") + v + "円"; };
              var _colFS = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
              if (_abP === 0 && _allP === 0) return React.createElement("span", { style: { color: "#ccc" } }, "単独 —");
              return React.createElement("span", { style: { whiteSpace: "nowrap" } },
                "単独 ",
                React.createElement("span", { style: { fontWeight: 600, color: _colFS(_abP) } }, _abP !== 0 ? _fmtFS(_abP) : "—"),
                _abP !== _allP ? React.createElement("span", { style: { fontSize: 10, whiteSpace: "nowrap" } }, React.createElement("span", { style: { color: "#d6c8b8", fontWeight: 400, margin: "0 2px" } }, "/"), React.createElement("span", { style: { color: _colFS(_allP) } }, _allP !== 0 ? _fmtFS(_allP) : "—")) : null
              );
            })(),
            (function() {
              var _allH = filtSt.sumHold;
              var _fmtFS = function(v) { return (v > 0 ? "+" : "") + v + "円"; };
              var _colFS = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
              if (_allH == null) return React.createElement("span", { style: { color: "#ccc" } }, "H —");
              return React.createElement("span", { style: { whiteSpace: "nowrap" } },
                "H ",
                React.createElement("span", { style: { fontWeight: 600, color: _colFS(_allH) } }, _fmtFS(_allH))
              );
            })()
          ),
          
          React.createElement("div", { style: { padding: "6px 0", border: "1px solid #e0ddd6", borderTop: "none", borderRadius: "0 0 6px 6px" } },
            recs.length === 0
              ? React.createElement("div", { style: { textAlign: "center", color: "#bbb", padding: 20, fontSize: 13 } }, "該当なし")
              : grouped
                ? grouped.map(function(g) {
                    return React.createElement("div", { key: g.key, style: { marginBottom: 8 } },
                      React.createElement("div", { style: { padding: "4px 10px", fontSize: 11, fontWeight: 700,
                        color: g.isCustom ? "#4338CA" : "#9A3412",
                        background: g.isCustom ? "#EEF2FF" : "#FFEDD5",
                        marginBottom: 4, display: "flex", justifyContent: "space-between" }
                      },
                        React.createElement("span", null, "🎯 " + g.label),
                        React.createElement("span", { style: { color: "#888", fontWeight: 500 } }, g.records.length + "件")
                      ),
                      g.records.map(function(r) {
                        return React.createElement(EntryLogCard, { key: _recKey(r), record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate });
                      })
                    );
                  })
                : sorted.map(function(r, i) { return _renderRecCardWithCtrl(r, i, sorted.length, currentOrder, calExpandDate); })
          )
        );
      })(),
      
      (function() {
        var _tblHolidaySet = _buildHolidayDateSet(data.trades || {}, (data.custom && data.custom.eventCategories) || []);
        var tblDates = (function() {
          var result = [];
          var daysInM = new Date(cy, cm, 0).getDate();
          for (var i = 1; i <= daysInM; i++) {
            var dd2 = new Date(cy, cm - 1, i);
            var dow2 = dd2.getDay();
            var ds2 = curM + "-" + pad2(i);
            if (dow2 >= 1 && dow2 <= 5 && ds2 <= todayStr) result.push(ds2);
          }
          if (calTblSort === "asc") return result;
          if (calTblSort === "difficulty") {
            var _gRkD = { A:0, B:1, C:2 };
            return result.slice().sort(function(a, b) {
              var raA = byDate[a] || [], raB = byDate[b] || [];
              var rkA = raA.reduce(function(best, r) {
                var d = r.signal && r.signal.difficulty;
                var rk = _gRkD[d]; return (rk != null && rk < best) ? rk : best;
              }, 99);
              var rkB = raB.reduce(function(best, r) {
                var d = r.signal && r.signal.difficulty;
                var rk = _gRkD[d]; return (rk != null && rk < best) ? rk : best;
              }, 99);
              if (rkA !== rkB) return rkA - rkB;
              return a.localeCompare(b);
            });
          }
          return result.reverse();
        })();
        var _tTh = function(label, extra) {
          return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%", textAlign: "center" }, extra || {}) }, label);
        };
        var _tDateTags = function(date) {
          var seen = {}, result2 = [];
          var stocks = [];
          (byDate[date] || []).forEach(function(r) { if (stocks.indexOf(r.stock) < 0) stocks.push(r.stock); });
          stocks.sort();
          stocks.forEach(function(stk) {
            var c = (data.charts || {})[stk + "_" + date] || {};
            [].concat(c.chartShapeTags || [], c.stockTags || []).map(stripCat).forEach(function(t) {
              var key = stk + "\t" + t;
              if (!seen[key]) { seen[key] = true; result2.push({ stock: stk, tag: t }); }
            });
          });
          return result2;
        };
        
        var _tCapNote = function(hasStop, capSum) {
          return (hasStop && capSum != null) ? _elCapNoteAmt(capSum) : null;
        };
        // 全ランク(全体)のみ表示。B以上/全ランクのAB分割は廃止。
        var _tRow = function(date, st, gradeReal, gradePlan, gradeMax, tags, recs) {
          var isHoliday = !!_tblHolidaySet[date];
          var hasRecs = !isHoliday && st.total > 0;
          var isExp = hasRecs && calTblExpand === date;
          var bg = isExp ? "#FFF7ED" : "transparent";
          var bb = "1px solid #e0ddd6", br = "1px solid #e0ddd6";
          var dateRef = date;
          var _dash = React.createElement("span", { style: { color: "#ccc" } }, "ー");
          var _dOk = st.ok;
          var _dNg = st.ng;
          var _dMiss = st.miss;
          var _dWinPct = st.winPct;
          var _osRowT = isHoliday ? null : _elOsStatsV2(recs);
          var _ssRowT = isHoliday ? null : _elStopStatsV2(recs, data);
          return React.createElement("tr", { key: date,
            style: { background: bg, cursor: hasRecs ? "pointer" : "default" },
            onClick: hasRecs ? function() { setCalTblExpand(isExp ? null : dateRef); setCalTblRecExp({}); } : undefined
          },
            React.createElement("td", { style: { padding: "5px 8px", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", width: "1%",
              color: isHoliday ? "#7C3AED" : (hasRecs ? "#9A3412" : "#bbb"), borderBottom: bb, borderRight: br } },
              hasRecs ? React.createElement("span", { style: { marginRight: 4, color: "#F97316", fontSize: 10 } }, isExp ? "▼" : "▶")
                      : React.createElement("span", { style: { marginRight: 4, fontSize: 10 } }, "　"),
              _fmtDow(date),
              isHoliday ? React.createElement("span", { style: { marginLeft: 4, fontSize: 10, fontWeight: 400, color: "#7C3AED" } }, "(祝日・休場)") : null,
              hasRecs ? React.createElement("button", {
                onClick: function(e) { e.stopPropagation(); handleGoDate(dateRef, "trades"); },
                title: date + " の取引タブへ",
                style: { marginLeft: 6, fontSize: 9, padding: "1px 5px", background: "#EFF6FF", border: "1px solid #93C5FD",
                  borderRadius: 3, cursor: "pointer", color: "#1D4ED8", lineHeight: 1.3, verticalAlign: "middle", fontWeight: 600 }
              }, "→取引") : null,
              isExp ? React.createElement("button", {
                onClick: function(e) { e.stopPropagation(); setCalTblExpand(null); setCalTblRecExp({}); },
                style: { marginLeft: 6, fontSize: 10, padding: "1px 5px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", color: "#666", lineHeight: 1.3, verticalAlign: "middle" }
              }, "閉じる") : null
            ),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br } }, isHoliday ? _dash : st.total),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br, color: "inherit" } }, isHoliday ? _dash : (_dOk || "0")),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br, color: "inherit" } }, isHoliday ? _dash : (_dNg || "0")),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br, color: (_dMiss ? "#7C3AED" : "#ccc") } }, isHoliday ? _dash : (_dMiss || "0")),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br,
              color: _dWinPct != null ? (_dWinPct >= 60 ? "#C0392B" : _dWinPct >= 40 ? "#888" : "#1E8449") : "#ccc",
              fontWeight: _dWinPct != null ? 700 : 400 } }, isHoliday ? _dash : (_dWinPct != null ? _dWinPct + "%" : "—")),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : (function() {
                var _osRt = recs.filter(function(r) { return r.signal.osVal != null; });
                if (!_osRt.length) return React.createElement("span", { style: { color: "#ddd" } }, "—");
                var _osAt = Math.round(_osRt.reduce(function(a, r) { return a + Number(r.signal.osVal); }, 0) / _osRt.length * 10) / 10;
                return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, _osAt + "\u5186");
              })()
            ),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : (_osRowT ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, _osRowT.med + "\u5186") : React.createElement("span", { style: { color: "#ddd" } }, "\u2014"))),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : _elOsDistBarV2(_osRowT ? _osRowT.dist : null, 64, 10)),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : _elStopCellV2(_ssRowT)),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : (function() {
                var _cfRt = recs.filter(function(r) { return r.signal.osConfVal != null && r.signal.osConfVal !== ""; });
                if (!_cfRt.length) return React.createElement("span", { style: { color: "#ddd" } }, "\u2014");
                var _cfAt = Math.round(_cfRt.reduce(function(a, r) { var s = r.signal; return a + (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)); }, 0) / _cfRt.length * 10) / 10;
                return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, (_cfAt > 0 ? "+" : "") + _cfAt + "\u5186");
              })()
            ),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : _tSlash(st.sumPnl, st.expected, gradeReal)),
            React.createElement("td", { style: { padding: "4px 6px", borderBottom: bb, verticalAlign: "top" } },
              !isHoliday && tags && tags.length > 0
                ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 } },
                    tags.map(function(item, i) {
                      return React.createElement("span", { key: i, style: { display: "inline-flex", alignItems: "center", gap: 2,
                        padding: "1px 5px", fontSize: 9, fontWeight: 600,
                        background: "#FFEDD5", color: "#9A3412", borderRadius: 3, border: "1px solid #FB923C", whiteSpace: "nowrap" } },
                        React.createElement("span", { style: { color: "#F97316", fontWeight: 700 } }, item.stock),
                        React.createElement("span", { style: { color: "#bbb", margin: "0 1px" } }, ":"),
                        item.tag
                      );
                    })
                  )
                : null
            )
          );
        };
        var _tExpRow = function(date) {
          var recs = (byDate[date] || []).slice().sort(function(a, b) {
            if (calTblRowSort === "time") {
              var ta = a.signal.time || "99:99", tb = b.signal.time || "99:99";
              if (ta !== tb) return ta.localeCompare(tb);
              return a.stock.localeCompare(b.stock);
            }
            if (a.stock !== b.stock) return a.stock.localeCompare(b.stock);
            return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99");
          });
          if (!recs.length) return null;
          // 各記録の採用α値(signal.alphaVal)・損切り値を使用。
          var _ovAraw = null;
          var _ovCraw = null;
          var _rPnlCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
          var _rPnlFmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
          var _rTh = function(label, extra) {
            return React.createElement("th", { style: Object.assign({ padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" }, extra || {}) }, label);
          };
          var _rPnlDisp = function(v, grade) {
            if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            // ランク・金額を固定幅レーンに入れて列内で縦そろえ。
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
              _lane(grade && grade !== "Z" ? _tBadge(grade) : null, 20),
              _lane(React.createElement("span", { style: { fontWeight: 600, color: _rPnlCol(v) } }, _rPnlFmt(v)), 72, "flex-start")
            );
          };
          var _sl = function() { return React.createElement("span", { style: { color: "#d6c8b8", margin: "0 1px", fontWeight: 400 } }, "/"); };
          var _lane = function(child, w, align) { return React.createElement("span", { style: { display: "inline-flex", width: w, minWidth: w, justifyContent: align || "center", alignItems: "center", flexShrink: 0 } }, child); };
          var _slashCell = function(symObj, grade, pnl, missFlag) {
            var sym = symObj ? React.createElement("span", { style: { fontWeight: 700, color: symObj.col } }, symObj.ch) : React.createElement("span", { style: { color: "#ccc" } }, "—");
            var badge = missFlag ? _tBadge("Q") : (grade && grade !== "Z" ? _tBadge(grade) : React.createElement("span", { style: { color: "#ccc" } }, "—"));
            var amt = missFlag ? React.createElement("span", { style: { color: "#888" } }, "—") : (pnl != null ? React.createElement("span", { style: { fontWeight: 600, color: _rPnlCol(pnl) } }, _rPnlFmt(pnl)) : React.createElement("span", { style: { color: "#ccc" } }, "—"));
            // 記号・ランク・金額を固定幅レーンに入れて全体幅を一定化し、行ごとに縦の列がそろうようにする。
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
              _lane(sym, 16), _sl(), _lane(badge, 20), _sl(), _lane(amt, 72, "flex-start"));
          };
          var subRows = [];
          var _totReal = null, _totPlan = null, _totHold = null;
          var _totRealCnt = 0, _totPlanCnt = 0, _totHoldCnt = 0;
          var _totPlanCap = null, _totHoldCap = null, _totPlanStop = false, _totHoldStop = false;
          var _totHoldPlanCap = null, _totHoldPlanStopDiff = false;
          var _totHoldAB = null, _totHoldABCnt = 0;
          var _totHoldRef = null, _totHoldRefCnt = 0;
          var _totPlanAB = null;
          var _totPlanABCnt = 0;
          var _totHold2 = null, _totHold2Cnt = 0, _totHold2Ref = null, _totHold2RefCnt = 0;
          recs.forEach(function(r) {
            var rKey = r.stock + "_" + (r.signal.id || r.signal.time || "");
            var rExp = !!calTblRecExp[rKey];
            var s = r.signal, item = r.item;
            var _aiBT = _elAlphaInfo(r, data);
            var _ovA = _ovAraw != null ? _ovAraw : _aiBT.alpha;
            var _ovC = _ovCraw != null ? _ovCraw : _aiBT.cutLine;
            var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
            var _per100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
            var realPnl = (item && item.pnl != null) ? Number(item.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
            var planPnlN = _elDynPlanned(s, _ovA, _ovC);
            var holdPnl = _elDynHold(s, _ovA, _ovC);
            var _dynRes = _elDynResult(s, _ovA, _ovC);
            var _idA = s.osVal != null ? _elIdealAlpha(s, _ovC) : null;
            var _idC = s.osVal != null ? _elIdealCut(s, _ovA) : null;
            var _dynHP = (function() {
              var hp = holdPnl, pp = planPnlN;
              if (hp == null) return s.holdProfit;
              if (_dynRes === "miss") return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
              if (_dynRes === "draw") return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
              if (pp == null) return s.holdProfit;
              if (pp > 0 && hp > 0) return hp > pp ? "yes" : hp < pp ? "mid" : "none";
              if (pp < 0 && hp < 0) return "no";
              if (pp > 0 && hp < 0) return "no";
              if (pp < 0 && hp > 0) return "yes";
              if (hp === 0) return "none";
              return s.holdProfit;
            })();
            var realPnlN = realPnl != null ? _per100(realPnl) : null;
            var entered = _elIsEntered(s, item);
            var realGrade = (entered && realPnlN != null) ? _profitGradeFromPnlReal(realPnlN, 1) : null;
            var planGrade = planPnlN != null ? _profitGradeFromPnl(planPnlN, 1) : null;
            if (realPnlN != null) { _totReal = (_totReal || 0) + realPnlN; _totRealCnt++; }
            if (planPnlN != null) { _totPlan = (_totPlan || 0) + planPnlN; _totPlanCnt++;
              var _pStopT = _elPlanIsStop(s, _ovA, _ovC); if (_pStopT) _totPlanStop = true;
              _totPlanCap = (_totPlanCap || 0) + (_pStopT ? _elCapLossYen(_ovC) : planPnlN); }
            if (holdPnl  != null) { _totHold = (_totHold || 0) + holdPnl;  _totHoldCnt++;
              var _hStopT = _elHoldIsStop(s, _ovA, _ovC); if (_hStopT) _totHoldStop = true;
              _totHoldCap = (_totHoldCap || 0) + (_hStopT ? _elCapLossYen(_ovC) : holdPnl);
              var _pStopH = _elPlanIsStop(s, _ovA, _ovC);
              var _hpcOv = (_pStopH && planPnlN != null) ? planPnlN : holdPnl;
              var _xOv = (s.holdExp === "×" || s.holdExp === "損切り済");
              _totHoldPlanCap = (_totHoldPlanCap || 0) + ((_xOv && planPnlN != null) ? planPnlN : _hpcOv);
              if (_xOv && planPnlN != null && (_hpcOv - planPnlN) !== 0) { _totHoldRef = (_totHoldRef || 0) + (_hpcOv - planPnlN); _totHoldRefCnt++; }
              if (_pStopH && planPnlN != null && holdPnl !== planPnlN) _totHoldPlanStopDiff = true; }
            var _h2tt = _elHold2TotParts(s, _ovA, _ovC);
            if (_h2tt.main != null) { _totHold2 = (_totHold2 || 0) + _h2tt.main; _totHold2Cnt++; }
            if (_h2tt.ref != null) { _totHold2Ref = (_totHold2Ref || 0) + _h2tt.ref; _totHold2RefCnt++; }
            var _isABt = (s.difficulty === "A" || s.difficulty === "B");
            if (planPnlN != null && _isABt) { _totPlanAB = (_totPlanAB || 0) + planPnlN; _totPlanABCnt++; }
            if (holdPnl != null && _isABt) {
              var _pStopHab = _elPlanIsStop(s, _ovA, _ovC);
              var _xAbOv = (s.holdExp === "×" || s.holdExp === "損切り済"); _totHoldAB = (_totHoldAB || 0) + ((_xAbOv && planPnlN != null) ? planPnlN : ((_pStopHab && planPnlN != null) ? planPnlN : holdPnl)); _totHoldABCnt++; }
            var entLabel = entered
              ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 14 } }, "〇")
              : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×");
            var _sigParts = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
            var sigLabel = _sigParts.length > 0 ? _sigParts.join(" / ") : "(未設定)";
            var rKeyRef = rKey;
            subRows.push(
              React.createElement("tr", { key: rKey,
                style: { cursor: "pointer", background: rExp ? "#FFFBF5" : "transparent" },
                onClick: function() { setCalTblRecExp(function(prev) { var n = Object.assign({}, prev); if (n[rKeyRef]) delete n[rKeyRef]; else n[rKeyRef] = true; return n; }); }
              },
                React.createElement("td", { style: { padding: "4px 8px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", fontWeight: 700, color: "#9A3412" } },
                  React.createElement("span", { style: { marginRight: 3, color: "#F97316", fontSize: 9 } }, rExp ? "▼" : "▶"),
                  r.stock
                ),
                React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, s.time || "—"),
                React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
                  _sigParts.length > 0
                    ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } }, _sigParts.map(function(_t, _i) { return _sigNameNode(_t, _i); }))
                    : "(未設定)"),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6",
                  color: s.difficulty ? (_DIFF_COL[s.difficulty] || "#555") : "#ccc", fontWeight: s.difficulty ? 700 : 400 } },
                  s.difficulty || "—"),
                React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
                    _ovA != null ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#0369A1", fontWeight: 600 } }, _ovA + "円") : React.createElement("span", { style: { color: "#ddd" } }, "—"),
                    _idA != null ? React.createElement("span", { style: { fontSize: 9, color: "#0369A1", opacity: 0.85, fontWeight: 700, whiteSpace: "nowrap" } }, "理" + _idA) : null)),
                React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
                    _ovC != null ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#555", fontWeight: 600 } }, _ovC + "円") : React.createElement("span", { style: { color: "#ddd" } }, "—"),
                    _idC != null ? React.createElement("span", { style: { fontSize: 9, color: "#9333EA", opacity: 0.9, fontWeight: 700, whiteSpace: "nowrap" } }, "理" + _idC) : null)),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  _epOsChainCell(s)),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  _epECell(s, _ovA)),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } }, entLabel),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
                  _epPnlCell(s, _ovA, _ovC, _rPnlDisp(planPnlN, planGrade))),
                _elHoldTd2(s, _ovA, _ovC, { padding: "4px 6px", textAlign: "center", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" }, (holdPnl != null && _elHoldIsStop(s, _ovA, _ovC)) ? _elCapNote(_ovC) : null),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" } }, _lane(_tradeAlphaChip(s), 26, "flex-end"), _rPnlDisp(realPnlN, realGrade))
              )
            );
            if (rExp) {
              subRows.push(
                React.createElement("tr", { key: rKey + "_card" },
                  React.createElement("td", { colSpan: 13, style: { padding: "4px 8px 8px", background: "#FFFBF5", borderBottom: "1px solid #f0ede6" } },
                    React.createElement(EntryLogCard, { record: r, alpha: _ovA, cutLine: _ovC, onEdit: handleEdit, onGoDate: handleGoDate })
                  )
                )
              );
            }
          });
          var _totRealGrade = _totRealCnt > 0 ? _profitGradeFromPnlReal(_totReal != null ? _totReal : 0, _totRealCnt) : null;
          var _totPlanGrade = _totPlanCnt > 0 ? _profitGradeFromPnl(_totPlan != null ? _totPlan : 0, _totPlanCnt) : null;
          var _totPlanGradeAB = _totPlanABCnt > 0 ? _profitGradeFromPnl(_totPlanAB != null ? _totPlanAB : 0, _totPlanABCnt) : null;
          var _totHoldGrade = _totHoldCnt > 0 ? _profitGradeFromPnl(_totHold != null ? _totHold : 0, _totHoldCnt) : null;
          var _totHoldPlanCapGrade = _totHoldCnt > 0 ? _profitGradeFromPnl(_totHoldPlanCap != null ? _totHoldPlanCap : 0, _totHoldCnt) : null;
          var _totHoldABGrade = _totHoldABCnt > 0 ? _profitGradeFromPnl(_totHoldAB != null ? _totHoldAB : 0, _totHoldABCnt) : null;
          var _rPnlDispABAll = function(abV, allV, abGrade, allGrade) {
            // 全ランク(全体)のみ表示。B以上/全ランクのAB分割は廃止。
            var _fmtAB = function(v) { return v != null ? (v > 0 ? "+" : "") + v.toLocaleString() + "円" : "—"; };
            var _colAB = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
            var _v = allV != null ? allV : abV;
            var _g = allGrade || abGrade;
            if (_v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              _g ? _tBadge(_g) : null,
              React.createElement("span", { style: { fontWeight: 600, color: _colAB(_v) } }, _fmtAB(_v))
            );
          };
          var _lblCtot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
          var _ctAllMiss = _elAllMissRow(recs, function(_r){ var _a = _elAlphaInfo(_r, data); return _ovAraw != null ? _ovAraw : _a.alpha; }, function(_r){ var _a = _elAlphaInfo(_r, data); return _ovCraw != null ? _ovCraw : _a.cutLine; });
          var totRow = React.createElement("tr", { key: "__ctot__", style: { background: "#FFF7ED" } },
            React.createElement("td", { style: { textAlign: "left", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, "合計"),
            React.createElement("td", { colSpan: 8, style: { borderTop: "2px solid #FB923C" } }),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }, _lblCtot("EP損益"), (_ctAllMiss ? _qZeroCell() : _rPnlDispABAll(_totPlanAB, _totPlan, _totPlanGradeAB, _totPlanGrade)),
              (_totPlanStop && _totPlanCap != null) ? _elCapNoteAmt(_totPlanCap) : null),
            React.createElement("td", { colSpan: 2, style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } },
              React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
                React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H１："),
                  _totHoldCnt > 0 ? _rPnlDispABAll(_totHoldAB, _totHoldPlanCap, _totHoldABGrade, _totHoldPlanCapGrade) : (_totHoldRefCnt > 0 ? null : (_ctAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHoldPlanCap, _totHoldRef, _totHoldRefCnt)),
                React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H２："),
                  React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _totHold2Cnt > 0 ? (function() { var _g2 = _profitGradeFromPnl(_totHold2 != null ? _totHold2 : 0, _totHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2 ? _tBadge(_g2) : null, React.createElement("span", { style: { fontWeight: 600, color: _totHold2 > 0 ? "#C0392B" : _totHold2 < 0 ? "#1E8449" : "#888" } }, (_totHold2 > 0 ? "+" : "") + (_totHold2 || 0).toLocaleString() + "円")); })() : (_totHold2RefCnt > 0 ? null : (_ctAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHold2, _totHold2Ref, _totHold2RefCnt))))),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }, _lblCtot("実現損益"), _rPnlDisp(_totReal, _totRealGrade))
          );
          var _tAddDateRef = date;
          var _tSortToggle = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" } },
            React.createElement("span", { style: { fontSize: 10, color: "#888", alignSelf: "center" } }, "並び順:"),
            [["time", "⏱ 時間順"], ["stock", "📋 銘柄順"]].map(function(kv) {
              var on = calTblRowSort === kv[0];
              return React.createElement("button", { key: kv[0],
                onClick: function(e) { e.stopPropagation(); setCalTblRowSort(kv[0]); },
                style: { fontSize: 10, padding: "1px 7px", borderRadius: 3, cursor: "pointer",
                  border: "1px solid " + (on ? "#F97316" : "#ddd"),
                  background: on ? "#FFF7ED" : "#f5f4f0",
                  color: on ? "#9A3412" : "#666",
                  fontWeight: on ? 700 : 400 }
              }, kv[1]);
            })
          );
          return React.createElement("tr", { key: date + "_texp" },
            React.createElement("td", { colSpan: 13, style: { padding: 0, background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
              _tSortToggle,
              React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "auto", borderCollapse: "collapse", fontSize: 11 } },
                  React.createElement("thead", null,
                    React.createElement("tr", null,
                      _rTh("銘柄", { textAlign: "left", width: 60 }), _rTh("時間", { width: 44 }), _rTh("シグナル", { width: 1, whiteSpace: "nowrap" }), _rTh(React.createElement("span", null, "予想", React.createElement("span", { style: { display: "block", whiteSpace: "nowrap" } }, "OS度")), { width: 40 }), _rTh("α値", { width: 42 }), _rTh("損切り", { width: 42 }), _rTh("OS", { width: 70 }), _rTh("E", { width: 24 }), _rTh("取引", { width: 1, padding: "4px 2px" }),
                      _rTh("EP損益", { width: 96 }), React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "H損益"), _rTh("実現損益", { width: 84 })
                    )
                  ),
                  React.createElement("tbody", null, subRows),
                  React.createElement("tfoot", null, totRow)
                )
              ),
              React.createElement("div", { style: { padding: "6px 10px", borderTop: "1px solid #f0ede6" } },
                React.createElement("button", {
                  onClick: function() { setEditTarget({ date: _tAddDateRef, stock: "" }); },
                  style: { padding: "4px 14px", fontSize: 11, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }
                }, "＋ 追加")
              )
            )
          );
        };
        var _tGradeLegend = (function() {
          var grades = ["A","B","C","D","E","F","G","Q"];
          var mkRow = function(title, descs) {
            return React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px 6px", marginBottom: 2 } },
              React.createElement("span", { style: { fontSize: 9, color: "#888", minWidth: 70, flexShrink: 0 } }, title),
              grades.map(function(g) {
                var gs = _GRADE_STYLE[g];
                return React.createElement("span", { key: g, style: { display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, whiteSpace: "nowrap" } },
                  React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border,
                    fontWeight: 800, fontSize: 8, flexShrink: 0 } }, g),
                  React.createElement("span", { style: { color: "#888" } }, descs[g])
                );
              })
            );
          };
          return React.createElement("div", { style: { background: "#f9f8f5", border: "1px solid #e8e5de", borderRadius: 6, padding: "5px 8px", marginBottom: 8 } },
            mkRow("実現損益", { A:"25001+", B:"10001～25000", C:"1～10000", D:"0", E:"-1～-10000", F:"-10001～-25000", G:"-25001-", Q:"E基準未達のため非表示" }),
            mkRow("EP損益", { A:"2501+", B:"1001～2500", C:"1～1000", D:"0", E:"-1～-1000", F:"-1001～-2500", G:"-2501-", Q:"E基準未達のため非表示" })
          );
        })();
        var sortToggle = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "並び替え:"),
          [["desc", "新しい順"], ["asc", "古い順"], ["difficulty", "🎯 予想OS度順"]].map(function(kv) {
            var on = calTblSort === kv[0];
            return React.createElement("button", { key: kv[0],
              onClick: function() { setCalTblSort(kv[0]); },
              style: { padding: "2px 8px", fontSize: 10, fontWeight: on ? 700 : 400, cursor: "pointer",
                background: on ? "#FB923C" : "#f5f4f0", color: on ? "#fff" : "#555",
                border: "1px solid " + (on ? "#F97316" : "#ddd"), borderRadius: 4 }
            }, kv[1]);
          })
        );
        var thead = React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: { padding: "5px 8px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "left" } }, "日付"),
            _tTh("件数"), _tTh("勝"), _tTh("負"), _tTh("E未達"), _tTh("勝率"), _tTh("平均OS値"), _tTh("OS中央値"),
            React.createElement("th", { style: { padding: "5px 4px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%" } },
              React.createElement("div", null, "OS分布"),
              React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(0〜4…20円〜)")
            ),
            React.createElement("th", { style: { padding: "5px 4px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%" } },
              React.createElement("div", null, "損切り"),
              React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(想定/H1/H2)")
            ),
            _tTh("平均確定値"),
            _tTh("実現損益"),
            _tTh("タグ", { width: "auto" })
          )
        );
        
        var _tMonthRecs = [];
        tblDates.forEach(function(date) { (byDate[date] || []).forEach(function(r) { _tMonthRecs.push(r); }); });
        var _tMonthSt  = _tMonthRecs.length > 0 ? _calcD(_tMonthRecs) : { total: 0, ok: 0, ng: 0, winPct: null, sumPnl: 0, expected: null, sumPlanned: 0, expectedPlanned: null, sumMax: 0, expectedMax: null, sumHold: null, sumHoldRef: null, holdRefCnt: 0 };
        var _tMonthEnt = _tMonthRecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
        var _tMonthGradeReal = _tMonthSt.total > 0 ? _profitGradeFromPnlReal(_tMonthSt.sumPnl, _tMonthEnt.length) : null;
        var _tMonthGradePlan = _tMonthSt.total > 0 ? _profitGradeFromPnl(_tMonthSt.sumPlanned, _tMonthSt.total) : null;
        var _tMdOk = _tMonthSt.ok;
        var _tMdNg = _tMonthSt.ng;
        var _tMdMiss = _tMonthSt.miss;
        var _tMdWinPct = _tMonthSt.winPct;
        var _tMonthOs = _elOsStatsV2(_tMonthRecs);
        var _tMonthSs = _elStopStatsV2(_tMonthRecs, data);
        var _bb2 = "2px solid #c0b8a8";
        var _tMonthRow = React.createElement("tr", { key: "__monthtot__", style: { background: "#F5F0E8" } },
          React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", width: "1%", color: "#9A3412", borderBottom: _bb2, borderTop: "2px solid #c0b8a8" } }, "📊 " + curM + " 合計"),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, fontSize: 11, borderBottom: _bb2, borderTop: _bb2 } }, _tMonthSt.total || 0),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: _bb2, borderTop: _bb2, color: "inherit" } }, _tMdOk || 0),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: _bb2, borderTop: _bb2, color: "inherit" } }, _tMdNg || 0),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: _bb2, borderTop: _bb2, color: (_tMdMiss ? "#7C3AED" : "#ccc") } }, _tMdMiss || 0),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: _bb2, borderTop: _bb2,
            color: _tMdWinPct != null ? (_tMdWinPct >= 60 ? "#C0392B" : _tMdWinPct >= 40 ? "#888" : "#1E8449") : "#ccc",
            fontWeight: _tMdWinPct != null ? 700 : 400 } }, _tMdWinPct != null ? _tMdWinPct + "%" : "—"),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            (function() {
              var _osRm = _tMonthRecs.filter(function(r) { return r.signal.osVal != null; });
              if (!_osRm.length) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _osAm = Math.round(_osRm.reduce(function(a, r) { return a + Number(r.signal.osVal); }, 0) / _osRm.length * 10) / 10;
              return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, _osAm + "\u5186");
            })()
          ),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            _tMonthOs ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, _tMonthOs.med + "\u5186") : React.createElement("span", { style: { color: "#ddd" } }, "\u2014")),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            _elOsDistBarV2(_tMonthOs ? _tMonthOs.dist : null, 64, 10)),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            _elStopCellV2(_tMonthSs)),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            (function() {
              var _cfRm = _tMonthRecs.filter(function(r) { return r.signal.osConfVal != null && r.signal.osConfVal !== ""; });
              if (!_cfRm.length) return React.createElement("span", { style: { color: "#ddd" } }, "\u2014");
              var _cfAm = Math.round(_cfRm.reduce(function(a, r) { var s = r.signal; return a + (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)); }, 0) / _cfRm.length * 10) / 10;
              return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, (_cfAm > 0 ? "+" : "") + _cfAm + "\u5186");
            })()
          ),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            _tSlash(_tMonthSt.sumPnl, _tMonthSt.expected, _tMonthGradeReal)),
          React.createElement("td", { style: { borderBottom: _bb2, borderTop: _bb2 } })
        );
        var tbody = React.createElement("tbody", null,
          _tMonthRow,
          tblDates.map(function(date) {
            var dateRecs = byDate[date] || [];
            var dateSt = _calcD(dateRecs);
            var dateEnt = dateRecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
            var gradeReal = _profitGradeFromPnlReal(dateSt.sumPnl, dateEnt.length);
            var gradePlan = _profitGradeFromPnl(dateSt.sumPlanned, dateSt.total);
            var tags = _tDateTags(date);
            return [
              _tRow(date, dateSt, gradeReal, gradePlan, null, tags, dateRecs),
              calTblExpand === date ? _tExpRow(date) : null
            ];
          })
        );
        var _dtByDow = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        var _dtDowLabel = ["", "月", "火", "水", "木", "金"];
        Object.keys(byDate).forEach(function(dk) {
          var _dp2 = dk.split("-");
          var _wd2 = new Date(+_dp2[0], +_dp2[1]-1, +_dp2[2]).getDay();
          if (_wd2 >= 1 && _wd2 <= 5) (byDate[dk] || []).forEach(function(r) { _dtByDow[_wd2].push(r); });
        });
        
        return React.createElement(React.Fragment, null,
          React.createElement("div", { style: { marginTop: 16 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 } },
              React.createElement("button", { onClick: function() { setCalMonth(prevM); setCalExpandDate(null); },
                style: { padding: "4px 14px", fontSize: 14, background: "#fff", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#555" } }, "← 前月"),
              React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: "#9A3412", minWidth: 96, textAlign: "center" } }, cy + "年" + cm + "月"),
              React.createElement("button", { onClick: function() { setCalMonth(nextM); setCalExpandDate(null); },
                style: { padding: "4px 14px", fontSize: 14, background: "#fff", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#555" } }, "翌月 →")
            ),
            _tGradeLegend,
            sortToggle,
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff" } },
                thead, tbody
              )
            ),
            (function() {
              if (_tMonthRecs.length < 3) return null;
              var bestD = null, worstD = null;
              tblDates.forEach(function(dt) {
                var rs = byDate[dt] || [];
                if (!rs.length) return;
                var st2 = _calcD(rs);
                if (st2.sumPnl !== 0) {
                  if (!bestD || st2.sumPnl > bestD.v) bestD = { d: dt, v: st2.sumPnl };
                  if (!worstD || st2.sumPnl < worstD.v) worstD = { d: dt, v: st2.sumPnl };
                }
              });
              var _fy = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
              return _elInsightBoxV2([
                React.createElement("span", null, cy + "年" + cm + "月は " + _tMonthSt.total + "件" + (_tMonthOs ? "・平均OS値 " + _tMonthOs.avg + "円" : "") + "・損切り ", _elInsightEmV2(_tMonthSs.any + "回", "#1E8449"), (_tMonthSs.rate != null ? "（率" + _tMonthSs.rate + "%）" : "") + "・E未達 " + (_tMonthSt.miss || 0) + "件"),
                bestD ? React.createElement("span", null, "実現損益が最も良かった日は ", _elInsightEmV2(_fmtDow(bestD.d), "#C0392B"), "（" + _fy(bestD.v) + "）" + (worstD && worstD.d !== bestD.d ? "・最も悪かった日は " + _fmtDow(worstD.d) + "（" + _fy(worstD.v) + "）" : "")) : null
              ], { title: cy + "年" + cm + "月の傾向" });
            })()
          ),
          React.createElement("div", { style: { marginTop: 16 } },
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, "📆 曜日別集計"),
            React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "OS分布＝0〜4／5〜9／10〜14／15〜19／20円〜の帯別件数バー。損切り＝想定・H1・H2いずれかで損切りライン到達した回数（率はOS値入力件数比）"),
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff" } },
                React.createElement("thead", null,
                  React.createElement("tr", { style: { background: "#f5f4f0" } },
                    React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "曜日"),
                    _tTh("件"), _tTh("勝"), _tTh("負"), _tTh("勝率"),
                    _tTh("平均OS値"), _tTh("OS中央値"), _tTh("OS分布"), _tTh("損切り"), _tTh("E未達"),
                    _tTh("実現損益")
                  )
                ),
                React.createElement("tbody", null,
                  [1, 2, 3, 4, 5].map(function(wd) {
                    var wrecs = _dtByDow[wd];
                    var wst = _calcD(wrecs);
                    var wEnt = wrecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
                    var gradeReal = _profitGradeFromPnlReal(wst.sumPnl, wEnt.length);
                    var wos = wrecs.length > 0 ? _elOsStatsV2(wrecs) : null;
                    var wss = wrecs.length > 0 ? _elStopStatsV2(wrecs, data) : null;
                    var bb = "1px solid #e0ddd6";
                    var br = "1px solid #e0ddd6";
                    var _dash = React.createElement("span", { style: { color: "#ccc" } }, "ー");
                    return React.createElement("tr", { key: wd },
                      React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", width: "1%", borderBottom: bb, borderRight: br } }, _dtDowLabel[wd]),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, borderBottom: bb, borderRight: br } }, wrecs.length > 0 ? wst.total : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, borderBottom: bb, borderRight: br } }, wrecs.length > 0 ? (wst.ok || "0") : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, borderBottom: bb, borderRight: br } }, wrecs.length > 0 ? (wst.ng || "0") : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, borderBottom: bb, borderRight: br,
                        color: wst.winPct != null ? (wst.winPct >= 60 ? "#C0392B" : wst.winPct >= 40 ? "#888" : "#1E8449") : "#ccc",
                        fontWeight: wst.winPct != null ? 700 : 400 } }, wrecs.length > 0 ? (wst.winPct != null ? wst.winPct + "%" : "—") : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
                        wos ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, wos.avg + "円") : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
                        wos ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, wos.med + "円") : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
                        wrecs.length > 0 ? _elOsDistBarV2(wos ? wos.dist : null, 72, 11) : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
                        wrecs.length > 0 ? _elStopCellV2(wss) : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb, borderRight: br, color: wst.miss ? "#7C3AED" : "#ccc", fontWeight: wst.miss ? 700 : 400 } },
                        wrecs.length > 0 ? (wst.miss || "0") : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb } },
                        wrecs.length > 0 ? _tSlash(wst.sumPnl, wst.expected, gradeReal) : _dash)
                    );
                  })
                )
              )
            ),
            (function() {
              var qual = [1, 2, 3, 4, 5].map(function(wd) {
                var rs = _dtByDow[wd];
                if (!rs || rs.length < 2) return null;
                var st2 = _calcD(rs);
                return { lbl: _dtDowLabel[wd] + "曜", n: rs.length, wp: st2.winPct, os: _elOsStatsV2(rs), ss: _elStopStatsV2(rs, data) };
              }).filter(function(x) { return !!x; });
              if (qual.length < 2) return null;
              var items = [];
              var withWp = qual.filter(function(q) { return q.wp != null; });
              if (withWp.length >= 2) {
                var byWp = withWp.slice().sort(function(a, b) { return b.wp - a.wp; });
                if (byWp[0].wp !== byWp[byWp.length - 1].wp) items.push(React.createElement("span", null, "勝率が高いのは ", _elInsightEmV2(byWp[0].lbl, "#C0392B"), "（" + byWp[0].wp + "%）・低いのは ", _elInsightEmV2(byWp[byWp.length - 1].lbl, "#1E8449"), "（" + byWp[byWp.length - 1].wp + "%）"));
              }
              var withOs = qual.filter(function(q) { return q.os && q.os.n >= 2; });
              if (withOs.length >= 2) {
                var byAvg = withOs.slice().sort(function(a, b) { return b.os.avg - a.os.avg; });
                items.push(React.createElement("span", null, "OSが大きく出やすいのは ", _elInsightEmV2(byAvg[0].lbl), "（平均" + byAvg[0].os.avg + "円）"));
              }
              var withStop = qual.filter(function(q) { return q.ss.any > 0; }).sort(function(a, b) { return b.ss.any - a.ss.any; });
              if (withStop.length) items.push(React.createElement("span", null, "損切りは ", _elInsightEmV2(withStop[0].lbl, "#1E8449"), " に多い（" + withStop[0].ss.any + "回）"));
              return _elInsightBoxV2(items, { title: "曜日別" });
            })()
          ),
          React.createElement("div", { style: { marginTop: 16 } },
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, "🎯 予想OS度別集計"),
            React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "的中率＝実OS値が予想帯（A20円〜/B15〜19/C10〜14/D5〜9/E0〜4）に収まった割合。損切り＝想定・H1・H2いずれかで損切りライン到達した回数"),
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff" } },
                React.createElement("thead", null,
                  React.createElement("tr", { style: { background: "#f5f4f0" } },
                    React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "予想OS度"),
                    _tTh("α値"),
                    _tTh("件"),
                    _tTh("平均OS値"),
                    _tTh("的中率"),
                    _tTh("OS分布"),
                    _tTh("損切り"),
                    _tTh("E未達"),
                    _tTh("実現損益")
                  )
                ),
                React.createElement("tbody", null,
                  (function() {
                    var _diffRankDt = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6 };
                    var _dtByDiff = {};
                    _tMonthRecs.forEach(function(r) {
                      var d = (r.signal && r.signal.difficulty) || "(未設定)";
                      if (!_dtByDiff[d]) _dtByDiff[d] = [];
                      _dtByDiff[d].push(r);
                    });
                    var _dtDiffKeys = Object.keys(_dtByDiff).sort(function(a, b) {
                      var ra = _diffRankDt[a] != null ? _diffRankDt[a] : 98, rb = _diffRankDt[b] != null ? _diffRankDt[b] : 98;
                      return ra - rb;
                    });
                    if (_dtDiffKeys.length === 0) {
                      return React.createElement("tr", null, React.createElement("td", { colSpan: 9, style: { padding: 10, textAlign: "center", color: "#aaa", fontSize: 11 } }, "該当なし"));
                    }
                    var _bbd = "1px solid #e0ddd6";
                    var _dashD = React.createElement("span", { style: { color: "#ccc" } }, "ー");
                    return _dtDiffKeys.map(function(dk) {
                      var drecs = _dtByDiff[dk];
                      var dst = _calcD(drecs);
                      var dEnt = drecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
                      var gradeReal = _profitGradeFromPnlReal(dst.sumPnl, dEnt.length);
                      var dos = _elOsStatsV2(drecs);
                      var dss = _elStopStatsV2(drecs, data);
                      var _hitNode = (function() {
                        var bi = -1;
                        for (var _b = 0; _b < _EL_OS_BANDS_V2.length; _b++) { if (_EL_OS_BANDS_V2[_b].key === dk) { bi = _b; break; } }
                        if (bi < 0 || !dos) return _dashD;
                        var hit = 0;
                        drecs.forEach(function(r) { var s = r.signal; if (s.osVal == null || s.osVal === "") return; if (_elOsBandIdxV2(s.osVal) === bi) hit++; });
                        var pct = Math.round(hit / dos.n * 100);
                        return React.createElement("span", { style: { fontWeight: 700, color: pct >= 60 ? "#1E8449" : pct >= 40 ? "#B45309" : "#C0392B" } }, pct + "%",
                          React.createElement("span", { style: { fontWeight: 400, fontSize: 9, color: "#999", marginLeft: 2 } }, "(" + hit + "/" + dos.n + ")"));
                      })();
                      return React.createElement("tr", { key: dk },
                        React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", width: "1%", borderBottom: _bbd, borderRight: _bbd } }, dk === "(未設定)" ? "(未設定)" : dk),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd, color: "#0369A1", fontWeight: 600 } }, _gradeAlpha(dk === "(未設定)" ? null : dk) + "円"),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, borderBottom: _bbd, borderRight: _bbd } }, dst.total),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd } }, dos ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, dos.avg + "円") : _dashD),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd } }, _hitNode),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd } }, _elOsDistBarV2(dos ? dos.dist : null, 72, 11)),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd } }, _elStopCellV2(dss)),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd, color: dst.miss ? "#7C3AED" : "#ccc", fontWeight: dst.miss ? 700 : 400 } }, dst.miss || "0"),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd } }, _tSlash(dst.sumPnl, dst.expected, gradeReal))
                      );
                    });
                  })()
                )
              )
            ),
            (function() {
              var m = {};
              _tMonthRecs.forEach(function(r) { var d = r.signal && r.signal.difficulty; if (!d) return; if (!m[d]) m[d] = []; m[d].push(r); });
              var ks = Object.keys(m).filter(function(k) { return m[k].length >= 2; });
              if (!ks.length) return null;
              var items = [];
              var hits = ks.map(function(k) {
                var bi = -1;
                for (var b = 0; b < _EL_OS_BANDS_V2.length; b++) { if (_EL_OS_BANDS_V2[b].key === k) { bi = b; break; } }
                if (bi < 0) return null;
                var osN = 0, hit = 0;
                m[k].forEach(function(r) { var s = r.signal; if (s.osVal == null || s.osVal === "") return; osN++; if (_elOsBandIdxV2(s.osVal) === bi) hit++; });
                if (!osN) return null;
                return { k: k, pct: Math.round(hit / osN * 100), n: osN };
              }).filter(function(x) { return !!x; }).sort(function(a, b) { return b.pct - a.pct; });
              if (hits.length >= 2) items.push(React.createElement("span", null, "予想の的中率が高いのは ", _elInsightEmV2("予想" + hits[0].k, "#1E8449"), "（" + hits[0].pct + "%）・低いのは ", _elInsightEmV2("予想" + hits[hits.length - 1].k, "#C0392B"), "（" + hits[hits.length - 1].pct + "%）"));
              else if (hits.length === 1) items.push("予想" + hits[0].k + "の的中率は" + hits[0].pct + "%（" + hits[0].n + "件）");
              var stops = ks.map(function(k) { var ss = _elStopStatsV2(m[k], data); return ss.any > 0 ? { k: k, c: ss.any } : null; })
                .filter(function(x) { return !!x; }).sort(function(a, b) { return b.c - a.c; });
              if (stops.length) items.push(React.createElement("span", null, "損切りが多いのは ", _elInsightEmV2("予想" + stops[0].k, "#1E8449"), "（" + stops[0].c + "回）"));
              return _elInsightBoxV2(items, { title: "予想OS度別" });
            })()
          )
        );
      })()
    );
  };

  var renderStockView = function() {
    var byStock = {};
    filtered.forEach(function(r) {
      if (!byStock[r.stock]) byStock[r.stock] = [];
      byStock[r.stock].push(r);
    });
    var stocks = Object.keys(byStock).sort();
    if (stocks.length === 0) return React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: 30 } }, "該当なし");
    var selStock = (expandKey && expandKey.indexOf("stock_") === 0 && byStock[expandKey.slice(6)])
      ? expandKey.slice(6) : stocks[0];
    var selRecs = byStock[selStock];
    var selSt = _calcD(selRecs);
    var selEnt = selRecs.filter(function(x) { return _elIsEntered(x.signal, x.item); });
    var selSkp = selRecs.filter(function(x) { return !_elIsEntered(x.signal, x.item); });
    var selEntSt = _calcD(selEnt);
    var selSkpSt = _calcD(selSkp);

    
    var byDate = {};
    selRecs.forEach(function(r) {
      if (!byDate[r.date]) byDate[r.date] = [];
      byDate[r.date].push(r);
    });
    
    var dates = (function() {
      
      var _localDateStr = function(d) {
        return d.getFullYear() + '-' +
          String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0');
      };
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var startDate, endDate = new Date(today);
      if (period === "1w") {
        var dow = today.getDay();
        var diffToMon = dow === 0 ? -6 : 1 - dow;
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() + diffToMon);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 4);
      } else {
        startDate = new Date(today);
        if (period === "1m") startDate.setMonth(startDate.getMonth() - 1);
        else if (period === "3m") startDate.setMonth(startDate.getMonth() - 3);
        else if (period === "6m") startDate.setMonth(startDate.getMonth() - 6);
        else if (period === "1y") startDate.setFullYear(startDate.getFullYear() - 1);
        else if (selRecs.length > 0) {
          var minDate = selRecs.reduce(function(m, r) { return r.date < m ? r.date : m; }, selRecs[0].date);
          
          var parts = minDate.split('-');
          startDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
      }
      var result = [];
      var cur = new Date(startDate);
      cur.setHours(0, 0, 0, 0);
      while (cur <= endDate) {
        var d = cur.getDay();
        if (d >= 1 && d <= 5) result.push(_localDateStr(cur));
        cur.setDate(cur.getDate() + 1);
      }
      if (svDateSort === "difficulty") {
        var _gRkSv = { A:0, B:1, C:2 };
        return result.slice().sort(function(a, b) {
          var raA = byDate[a] || [], raB = byDate[b] || [];
          var rkA = raA.reduce(function(best, r) {
            var d = r.signal && r.signal.difficulty;
            var rk = _gRkSv[d]; return (rk != null && rk < best) ? rk : best;
          }, 99);
          var rkB = raB.reduce(function(best, r) {
            var d = r.signal && r.signal.difficulty;
            var rk = _gRkSv[d]; return (rk != null && rk < best) ? rk : best;
          }, 99);
          if (rkA !== rkB) return rkA - rkB;
          return a.localeCompare(b);
        });
      }
      return result.sort(function(a, b) { return svDateSort === "desc" ? b.localeCompare(a) : a.localeCompare(b); });
    })();

    
    var _svHolidaySet = _buildHolidayDateSet(data.trades || {}, (data.custom && data.custom.eventCategories) || []);

    
    var _svFmt = function(v) { return (v > 0 ? "+" : "") + v + "円"; };
    var _svCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _svBadge = function(grade) {
      var gs = _GRADE_STYLE[grade] || _GRADE_STYLE.Z;
      return React.createElement("span", { title: grade,
        style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: "50%",
          background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
          fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 }
      }, grade);
    };
    var _svTh = function(label, extra) {
      return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%", textAlign: "center" }, extra || {}) }, label);
    };
    var _svSlash = function(sum, ev, grade) {
      if (sum === 0) return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        grade ? _svBadge(grade) : null,
        React.createElement("span", { style: { color: "#ccc" } }, "—")
      );
      return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        grade ? _svBadge(grade) : null,
        React.createElement("span", { style: { fontWeight: 600, color: _svCol(sum) } }, _svFmt(sum))
      );
    };
    var _svDateTags = function(date) {
      var c = (data.charts || {})[selStock + "_" + date] || {};
      return [].concat(c.chartShapeTags || [], c.stockTags || []).map(stripCat);
    };

    
    var _svRow = function(date, st, gradeReal, gradePlanned, gradeMax, tags) {
      var isHoliday = !!_svHolidaySet[date];
      var hasRecs = !isHoliday && st.total > 0;
      var _svDateRecs = byDate[date] || [];
      var isExp = hasRecs && svDateExpand === date;
      var bg = isExp ? "#FFF7ED" : "transparent";
      var bb = "1px solid #e0ddd6";
      var br = "1px solid #e0ddd6";
      var dateRef = date;
      var _dash = React.createElement("span", { style: { color: "#ccc" } }, "ー");
      return React.createElement("tr", { key: date,
        style: { background: bg, cursor: hasRecs ? "pointer" : "default" },
        onClick: hasRecs ? function() { setSvDateExpand(isExp ? null : dateRef); setSvRecExpand({}); } : undefined
      },
        React.createElement("td", { style: { padding: "5px 8px", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", width: "1%",
          color: isHoliday ? "#7C3AED" : (hasRecs ? "#9A3412" : "#bbb"), borderBottom: bb, borderRight: br } },
          hasRecs ? React.createElement("span", { style: { marginRight: 4, color: "#F97316", fontSize: 10 } }, isExp ? "▼" : "▶")
                  : React.createElement("span", { style: { marginRight: 4, fontSize: 10 } }, "　"),
          _fmtDow(date),
          isHoliday ? React.createElement("span", { style: { marginLeft: 4, fontSize: 10, fontWeight: 400, color: "#7C3AED" } }, "(祝日・休場)") : null,
          React.createElement("button", {
            onClick: function(e) { e.stopPropagation(); handleGoDate(dateRef, "trades"); },
            title: date + " の取引タブへ",
            style: { marginLeft: 6, fontSize: 9, padding: "1px 5px", background: "#EFF6FF", border: "1px solid #93C5FD",
              borderRadius: 3, cursor: "pointer", color: "#1D4ED8", lineHeight: 1.3, verticalAlign: "middle", fontWeight: 600 }
          }, "→取引"),
          isExp ? React.createElement("button", {
            onClick: function(e) { e.stopPropagation(); setSvDateExpand(null); setSvRecExpand({}); },
            style: { marginLeft: 6, fontSize: 10, padding: "1px 5px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", color: "#666", lineHeight: 1.3, verticalAlign: "middle" }
          }, "閉じる") : null
        ),
        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br } }, isHoliday ? _dash : st.total),
        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
          isHoliday ? _dash : (function() {
            var _ovs = [];
            _svDateRecs.slice().sort(function(a, b) { return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99"); }).forEach(function(r) {
              var s = r.signal; if (s.osVal != null && s.osVal !== "") { var n = Number(s.osVal); if (!isNaN(n)) _ovs.push(n); }
            });
            if (!_ovs.length) return React.createElement("span", { style: { color: "#ddd" } }, "—");
            return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } },
              _ovs.map(function(v, i) {
                var bi = _elOsBandIdxV2(v);
                return React.createElement("span", { key: i },
                  i > 0 ? React.createElement("span", { style: { color: "#ccc" } }, "・") : null,
                  React.createElement("span", { style: { color: bi != null ? _EL_OS_BANDS_V2[bi].color : "#555", fontWeight: 700 } }, v));
              }),
              React.createElement("span", { style: { color: "#888" } }, "円"));
          })()),
        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
          isHoliday ? _dash : _elStopCellV2(_elStopStatsV2(_svDateRecs, data))),
        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br, color: (!isHoliday && st.miss) ? "#7C3AED" : "#ccc", fontWeight: (!isHoliday && st.miss) ? 700 : 400 } },
          isHoliday ? _dash : (st.miss || "0")),
        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
          isHoliday ? _dash : _svSlash(st.sumPnl, st.expected, gradeReal)),
        React.createElement("td", { style: { padding: "4px 6px", borderBottom: bb } },
          !isHoliday && tags && tags.length > 0
            ? React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 2 } },
                tags.map(function(t, i) {
                  return React.createElement("span", { key: i, style: { display: "inline-block", padding: "1px 5px", fontSize: 9, fontWeight: 600,
                    background: "#FFEDD5", color: "#9A3412", borderRadius: 3, border: "1px solid #FB923C", whiteSpace: "nowrap" } }, t);
                })
              )
            : null
        )
      );
    };

    
    var _svExpRow = function(date) {
      var recs = (byDate[date] || []).slice().sort(function(a, b) {
        return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99");
      });
      if (!recs.length) return null;
      var _rPnlCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
      var _rPnlFmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
      var _rTh = function(label, extra) {
        return React.createElement("th", { style: Object.assign({ padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" }, extra || {}) }, label);
      };
      var _lane = function(child, w, align) { return React.createElement("span", { style: { display: "inline-flex", width: w, minWidth: w, justifyContent: align || "center", alignItems: "center", flexShrink: 0 } }, child); };
      var _rPnlDisp = function(v, grade) {
        if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        // ランク・金額を固定幅レーンに入れて列内で縦そろえ。
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
          _lane(grade && grade !== "Z" ? _svBadge(grade) : null, 20),
          _lane(React.createElement("span", { style: { fontWeight: 600, color: _rPnlCol(v) } }, _rPnlFmt(v)), 72, "flex-start")
        );
      };
      var subRows = [];
      var _totReal = null, _totPlan = null, _totHold = null;
      var _totRealCnt = 0, _totPlanCnt = 0, _totHoldCnt = 0;
      var _totPlanCap = null, _totHoldCap = null, _totPlanStop = false, _totHoldStop = false;
      var _totHoldPlanCap = null, _totHoldPlanStopDiff = false;
      var _totPlanABsv = null;
      var _totPlanABCntsv = 0;
      var _totHoldABsv = null, _totHoldABCntsv = 0;
      var _totHoldRef = null, _totHoldRefCnt = 0;
      var _totHold2 = null, _totHold2Cnt = 0, _totHold2Ref = null, _totHold2RefCnt = 0;
      recs.forEach(function(r) {
        var rKey = r.stock + "_" + (r.signal.id || r.signal.time || "");
        var rExp = !!svRecExpand[rKey];
        var s = r.signal;
        var item = r.item;
        var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
        var _per100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
        var realPnl = (item && item.pnl != null) ? Number(item.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        var _aiSv = _elAlphaInfo(r, data);
        var _idAsv = s.osVal != null ? _elIdealAlpha(s, _aiSv.cutLine) : null;
        var _idCsv = s.osVal != null ? _elIdealCut(s, _aiSv.alpha) : null;
        var planPnlN = _elDynPlanned(s, _aiSv.alpha, _aiSv.cutLine);
        var holdPnl = _elDynHold(s, _aiSv.alpha, _aiSv.cutLine);
        var _dynResSv = _elDynResult(s, _aiSv.alpha, _aiSv.cutLine);
        var _dynHPsv = (function() {
          var hp = holdPnl, pp = planPnlN;
          if (hp == null) return s.holdProfit;
          if (_dynResSv === "miss" || _dynResSv === "draw") return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
          if (pp == null) return s.holdProfit;
          if (pp > 0 && hp > 0) return hp > pp ? "yes" : hp < pp ? "mid" : "none";
          if (pp < 0 && hp < 0) return "no";
          if (pp > 0 && hp < 0) return "no";
          if (pp < 0 && hp > 0) return "yes";
          if (hp === 0) return "none";
          return s.holdProfit;
        })();
        var realPnlN = realPnl != null ? _per100(realPnl) : null;
        var entered = _elIsEntered(s, item);
        var realGrade = (entered && realPnlN != null) ? _profitGradeFromPnlReal(realPnlN, 1) : null;
        var planGrade = planPnlN != null ? _profitGradeFromPnl(planPnlN, 1) : null;
        if (realPnlN != null) { _totReal = (_totReal || 0) + realPnlN; _totRealCnt++; }
        if (planPnlN != null) { _totPlan = (_totPlan || 0) + planPnlN; _totPlanCnt++;
          var _pStopT = _elPlanIsStop(s, _aiSv.alpha, _aiSv.cutLine); if (_pStopT) _totPlanStop = true;
          _totPlanCap = (_totPlanCap || 0) + (_pStopT ? _elCapLossYen(_aiSv.cutLine) : planPnlN); }
        if (holdPnl  != null) { _totHold = (_totHold || 0) + holdPnl;  _totHoldCnt++;
          var _hStopT = _elHoldIsStop(s, _aiSv.alpha, _aiSv.cutLine); if (_hStopT) _totHoldStop = true;
          _totHoldCap = (_totHoldCap || 0) + (_hStopT ? _elCapLossYen(_aiSv.cutLine) : holdPnl);
          var _pStopH = _elPlanIsStop(s, _aiSv.alpha, _aiSv.cutLine);
          var _hpcSv = (_pStopH && planPnlN != null) ? planPnlN : holdPnl;
          var _xSv = (s.holdExp === "×" || s.holdExp === "損切り済");
          _totHoldPlanCap = (_totHoldPlanCap || 0) + ((_xSv && planPnlN != null) ? planPnlN : _hpcSv);
          if (_xSv && planPnlN != null && (_hpcSv - planPnlN) !== 0) { _totHoldRef = (_totHoldRef || 0) + (_hpcSv - planPnlN); _totHoldRefCnt++; }
          if (_pStopH && planPnlN != null && holdPnl !== planPnlN) _totHoldPlanStopDiff = true; }
        var _h2tt = _elHold2TotParts(s, _aiSv.alpha, _aiSv.cutLine);
        if (_h2tt.main != null) { _totHold2 = (_totHold2 || 0) + _h2tt.main; _totHold2Cnt++; }
        if (_h2tt.ref != null) { _totHold2Ref = (_totHold2Ref || 0) + _h2tt.ref; _totHold2RefCnt++; }
        var _isABsv = (s.difficulty === "A" || s.difficulty === "B");
        if (planPnlN != null && _isABsv) { _totPlanABsv = (_totPlanABsv || 0) + planPnlN; _totPlanABCntsv++; }
        if (holdPnl != null && _isABsv) {
          var _pStopHabSv = _elPlanIsStop(s, _aiSv.alpha, _aiSv.cutLine);
          var _xAbSv = (s.holdExp === "×" || s.holdExp === "損切り済"); _totHoldABsv = (_totHoldABsv || 0) + ((_xAbSv && planPnlN != null) ? planPnlN : ((_pStopHabSv && planPnlN != null) ? planPnlN : holdPnl)); _totHoldABCntsv++; }
        var entLabel = entered
          ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 14 } }, "〇")
          : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×");
        var _svSigParts = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
        var sigLabel = _svSigParts.length > 0 ? _svSigParts.join(" / ") : "(未設定)";
        var rKeyRef = rKey;
        subRows.push(
          React.createElement("tr", { key: rKey,
            style: { cursor: "pointer", background: rExp ? "#FFFBF5" : "transparent" },
            onClick: function() { setSvRecExpand(function(prev) { var n = Object.assign({}, prev); if (n[rKeyRef]) delete n[rKeyRef]; else n[rKeyRef] = true; return n; }); }
          },
            React.createElement("td", { style: { padding: "4px 8px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
              React.createElement("span", { style: { marginRight: 3, color: "#F97316", fontSize: 9 } }, rExp ? "▼" : "▶"),
              s.time || "—"
            ),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, entLabel),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, sigLabel),
            React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
                _aiSv.alpha != null ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#0369A1", fontWeight: 600 } }, _aiSv.alpha + "\u5186") : React.createElement("span", { style: { color: "#ddd" } }, "\u2014"),
                _idAsv != null ? React.createElement("span", { style: { fontSize: 9, color: "#0369A1", opacity: 0.85, fontWeight: 700, whiteSpace: "nowrap" } }, "\u7406" + _idAsv) : null)),
            React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 } },
                _aiSv.cutLine != null ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#555", fontWeight: 600 } }, _aiSv.cutLine + "\u5186") : React.createElement("span", { style: { color: "#ddd" } }, "\u2014"),
                _idCsv != null ? React.createElement("span", { style: { fontSize: 9, color: "#9333EA", opacity: 0.9, fontWeight: 700, whiteSpace: "nowrap" } }, "\u7406" + _idCsv) : null)),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              _epOsChainCell(s)),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              _epECell(s, _aiSv.alpha)),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, _epPnlCell(s, _aiSv.alpha, _aiSv.cutLine, _rPnlDisp(planPnlN, planGrade))),
            _elHoldTd2(s, _aiSv.alpha, _aiSv.cutLine, { padding: "4px 6px", textAlign: "center", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" }, (holdPnl != null && _elHoldIsStop(s, _aiSv.alpha, _aiSv.cutLine)) ? _elCapNote(_aiSv.cutLine) : null),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" } }, _lane(_tradeAlphaChip(s), 26, "flex-end"), _rPnlDisp(realPnlN, realGrade))
          )
        );
        if (rExp) {
          subRows.push(
            React.createElement("tr", { key: rKey + "_card" },
              React.createElement("td", { colSpan: 11, style: { padding: "4px 8px 8px", background: "#FFFBF5", borderBottom: "1px solid #f0ede6" } },
                React.createElement(EntryLogCard, { record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate })
              )
            )
          );
        }
      });
      var _totRealGrade = _totRealCnt > 0 ? _profitGradeFromPnlReal(_totReal != null ? _totReal : 0, _totRealCnt) : null;
      var _totPlanGrade = _totPlanCnt > 0 ? _profitGradeFromPnl(_totPlan != null ? _totPlan : 0, _totPlanCnt) : null;
      var _totPlanGradeABsv = _totPlanABCntsv > 0 ? _profitGradeFromPnl(_totPlanABsv != null ? _totPlanABsv : 0, _totPlanABCntsv) : null;
      var _totHoldPlanCapGradeSv = _totHoldCnt > 0 ? _profitGradeFromPnl(_totHoldPlanCap != null ? _totHoldPlanCap : 0, _totHoldCnt) : null;
      var _totHoldABGradeSv = _totHoldABCntsv > 0 ? _profitGradeFromPnl(_totHoldABsv != null ? _totHoldABsv : 0, _totHoldABCntsv) : null;
      var _rPnlDispABAllSv = function(abV, allV, abGrade, allGrade) {
        // 全ランク(全体)のみ表示。B以上/全ランクのAB分割は廃止。
        var _fmtAB = function(v) { return v != null ? (v > 0 ? "+" : "") + v.toLocaleString() + "円" : "—"; };
        var _colAB = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
        var _v = allV != null ? allV : abV;
        var _g = allGrade || abGrade;
        if (_v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          _g ? _svBadge(_g) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _colAB(_v) } }, _fmtAB(_v))
        );
      };
      var _lblSvtot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
      var _ctAllMiss = _elAllMissRow(recs, function(_r){ return _elAlphaInfo(_r, data).alpha; }, function(_r){ return _elAlphaInfo(_r, data).cutLine; });
      var totRow = React.createElement("tr", { key: "__svtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 7, style: { textAlign: "right", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C" } }, "合計 →"),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }, _lblSvtot("EP損益"), (_ctAllMiss ? _qZeroCell() : _rPnlDispABAllSv(_totPlanABsv, _totPlan, _totPlanGradeABsv, _totPlanGrade)),
          (_totPlanStop && _totPlanCap != null) ? _elCapNoteAmt(_totPlanCap) : null),
        React.createElement("td", { colSpan: 2, style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } },
          React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H１："),
              _totHoldCnt > 0 ? _rPnlDispABAllSv(_totHoldABsv, _totHoldPlanCap, _totHoldABGradeSv, _totHoldPlanCapGradeSv) : (_totHoldRefCnt > 0 ? null : (_ctAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHoldPlanCap, _totHoldRef, _totHoldRefCnt)),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H２："),
              React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _totHold2Cnt > 0 ? (function() { var _g2 = _profitGradeFromPnl(_totHold2 != null ? _totHold2 : 0, _totHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2 ? _svBadge(_g2) : null, React.createElement("span", { style: { fontWeight: 600, color: _totHold2 > 0 ? "#C0392B" : _totHold2 < 0 ? "#1E8449" : "#888" } }, (_totHold2 > 0 ? "+" : "") + (_totHold2 || 0).toLocaleString() + "円")); })() : (_totHold2RefCnt > 0 ? null : (_ctAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHold2, _totHold2Ref, _totHold2RefCnt))))),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }, _lblSvtot("実現損益"), _rPnlDisp(_totReal, _totRealGrade))
      );
      var _svAddDateRef = date;
      return React.createElement("tr", { key: date + "_exp" },
        React.createElement("td", { colSpan: 7, style: { padding: 0, background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", null,
                  _rTh("時間", { textAlign: "left" }),
                  _rTh("取引", { width: 1, padding: "4px 2px" }),
                  _rTh("シグナル", { width: 1, whiteSpace: "nowrap" }),
                  _rTh("α値", { width: "1%" }),
                  _rTh("損切り", { width: "1%" }),
                  _rTh("OS", { width: "1%" }),
                  _rTh("E", { width: "1%" }),
                  _rTh("EP損益"),
                  React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "H損益"),
                  _rTh("実現損益")
                )
              ),
              React.createElement("tbody", null, subRows),
              React.createElement("tfoot", null, totRow)
            )
          ),
          React.createElement("div", { style: { padding: "6px 10px", borderTop: "1px solid #f0ede6" } },
            React.createElement("button", {
              onClick: function() { setEditTarget({ date: _svAddDateRef, stock: selStock }); },
              style: { padding: "4px 14px", fontSize: 11, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }
            }, "＋ 追加")
          )
        )
      );
    };

    
    var _svGradeLegend = (function() {
      var grades = ["A","B","C","D","E","F","G","Q"];
      var mkRow = function(title, descs) {
        return React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px 6px", marginBottom: 2 } },
          React.createElement("span", { style: { fontSize: 9, color: "#888", minWidth: 70, flexShrink: 0 } }, title),
          grades.map(function(g) {
            var gs = _GRADE_STYLE[g];
            return React.createElement("span", { key: g, style: { display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, whiteSpace: "nowrap" } },
              React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border,
                fontWeight: 800, fontSize: 8, flexShrink: 0 } }, g),
              React.createElement("span", { style: { color: "#888" } }, descs[g])
            );
          })
        );
      };
      return React.createElement("div", { style: { background: "#f9f8f5", border: "1px solid #e8e5de", borderRadius: 6, padding: "5px 8px", marginBottom: 8, marginTop: 6 } },
        mkRow("実現損益", { A:"25001+", B:"10001～25000", C:"1～10000", D:"0", E:"-1～-10000", F:"-10001～-25000", G:"-25001-", Q:"E基準未達のため非表示" }),
        mkRow("EP損益", { A:"2501+", B:"1001～2500", C:"1～1000", D:"0", E:"-1～-1000", F:"-1001～-2500", G:"-2501-", Q:"E基準未達のため非表示" })
      );
    })();

    
    var thead = React.createElement("thead", null,
      React.createElement("tr", null,
        React.createElement("th", { style: { padding: "5px 8px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "left" } }, "日付"),
        _svTh("件数"),
        React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
          React.createElement("div", null, "OS値"),
          React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(帯色・時間順)")
        ),
        React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
          React.createElement("div", null, "損切り"),
          React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(想定/H1/H2)")
        ),
        _svTh("E未達"),
        _svTh("実現損益"),
        _svTh("タグ", { width: "auto" })
      )
    );

    
    var tbody = React.createElement("tbody", null,
      dates.map(function(date) {
        var dateRecs = byDate[date] || [];
        var dateSt = _calcD(dateRecs);
        var dateEnt = dateRecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
        var gradeReal = _profitGradeFromPnlReal(dateSt.sumPnl, dateEnt.length);
        var gradePlan = _profitGradeFromPnl(dateSt.sumPlanned, dateSt.total);
        var tags = _svDateTags(date);
        return [
          _svRow(date, dateSt, gradeReal, gradePlan, null, tags),
          svDateExpand === date ? _svExpRow(date) : null
        ];
      })
    );

    
    var sortToggle = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "並び替え:"),
      [["desc", "新しい順"], ["asc", "古い順"], ["difficulty", "🎯 予想OS度順"]].map(function(kv) {
        var on = svDateSort === kv[0];
        return React.createElement("button", { key: kv[0],
          onClick: function() { setSvDateSort(kv[0]); },
          style: { padding: "2px 8px", fontSize: 10, fontWeight: on ? 700 : 400, cursor: "pointer",
            background: on ? "#FB923C" : "#f5f4f0", color: on ? "#fff" : "#555",
            border: "1px solid " + (on ? "#F97316" : "#ddd"), borderRadius: 4 }
        }, kv[1]);
      })
    );

    return React.createElement("div", null,

      (function() {
        var _allSt = _calcD(filtered);
        var _allEnt = filtered.filter(function(r) { return _elIsEntered(r.signal, r.item); });
        var _allOs = _elOsStatsV2(filtered);
        var _allSs = _elStopStatsV2(filtered, data);
        var _kpi = React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", padding: "12px", background: "#FFF7ED", borderBottom: "1px solid #e0ddd6" } },
          _elvKpiCard("銘柄数", stocks.length + "銘柄", "#333"),
          _elvKpiCard("件数", _allSt.total + "件", "#333", _allEnt.length + "実/" + (_allSt.total - _allEnt.length) + "見"),
          _elvKpiCard("平均OS値", _allOs ? _allOs.avg + "円" : "—", "#9A3412", _allOs ? "OS入力 " + _allOs.n + "件" : null),
          _elvKpiCard("OS中央値", _allOs ? _allOs.med + "円" : "—", "#9A3412", _allOs ? "最頻 " + _allOs.mode.val + "円×" + _allOs.mode.n : null),
          _elvKpiCard("損切り", _allSs.any + "回", _allSs.any > 0 ? "#1E8449" : "#bbb", _allSs.rate != null ? "率" + _allSs.rate + "%（想" + _allSs.plan + "・H1 " + _allSs.h1 + "・H2 " + _allSs.h2 + "）" : null),
          _elvKpiCard("E未達", (_allSt.miss || 0) + "件", _allSt.miss ? "#7C3AED" : "#bbb", "α>OS値")
        );
        var _rowsData = stocks.map(function(stk) { return { key: stk, recs: byStock[stk], st: _calcD(byStock[stk]) }; });
        var _hh = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%", fontSize: 10, color: "#9A3412" }, ex || {}) }, t); };
        var _cell = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede8" }, ex || {}) }, c); };
        var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
        var _cmpTable = React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #e0ddd6" } },
          React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📊 銘柄別 比較"),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "行をタップでその銘柄の明細へ / OS統計＝入力済みOS値のみ・最頻＝最も多いOS値(×件数) / 損切り＝想定・H1・H2いずれかで損切りライン到達した回数（率はOS値入力件数比）/ E未達＝α>OS値でエントリー不成立 / 最有利＝単独・H1・H2のうち損益合計が最大の持ち方（採用α基準・100株換算）"),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
                _hh("銘柄", { textAlign: "left", paddingLeft: 8 }), _hh("件"), _hh("OS入力"), _hh("平均OS値"), _hh("中央値"), _hh("最頻"), _hh("最小〜最大"), _hh("OS分布"), _hh("損切り"), _hh("E未達"), _hh("平均確定値"), _hh("最有利")
              )),
              React.createElement("tbody", null,
                _rowsData.map(function(d) {
                  var st = d.st, recs = d.recs;
                  var os = _elOsStatsV2(recs), ss = _elStopStatsV2(recs, data), cf = _elvAvgConf(recs);
                  var _bh = (function() {
                    var p = 0, pc = 0, h1 = 0, h1c = 0, h2 = 0, h2c = 0;
                    recs.forEach(function(r) {
                      var s = r.signal; var ai = _elAlphaInfo(r, data);
                      var pp = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pp != null) { p += pp; pc++; }
                      var t1 = _elHold1TotParts(s, ai.alpha, ai.cutLine); if (t1.main != null) { h1 += t1.main; h1c++; }
                      var t2 = _elHold2TotParts(s, ai.alpha, ai.cutLine); if (t2.main != null) { h2 += t2.main; h2c++; }
                    });
                    var opts = [];
                    if (pc > 0) opts.push({ k: "単独", v: p });
                    if (h1c > 0) opts.push({ k: "H1", v: h1 });
                    if (h2c > 0) opts.push({ k: "H2", v: h2 });
                    if (!opts.length) return null;
                    opts.sort(function(a, b) { return b.v - a.v; });
                    return opts[0];
                  })();
                  var on = d.key === selStock, stRef = d.key;
                  return React.createElement("tr", { key: d.key, onClick: function() { setExpandKey("stock_" + stRef); setSvDateExpand(null); setSvRecExpand({}); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
                    React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", width: "1%", borderBottom: "1px solid #f0ede8", color: "#9A3412" } },
                      d.key
                    ),
                    _cell(recs.length, { fontWeight: 700 }),
                    _cell(os ? os.n : _dash, { color: "#666" }),
                    _cell(os ? os.avg + "円" : _dash, { fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "#9A3412" }),
                    _cell(os ? os.med + "円" : _dash, { fontVariantNumeric: "tabular-nums" }),
                    _cell(os ? React.createElement("span", null, os.mode.val + "円", React.createElement("span", { style: { fontSize: 9, color: "#aaa", marginLeft: 2 } }, "×" + os.mode.n)) : _dash),
                    _cell(os ? os.min + "〜" + os.max + "円" : _dash, { fontVariantNumeric: "tabular-nums", color: "#666" }),
                    _cell(_elOsDistBarV2(os ? os.dist : null, 72, 11)),
                    _cell(_elStopCellV2(ss)),
                    _cell(st.miss ? st.miss : _dash, { color: st.miss ? "#7C3AED" : "#ccc", fontWeight: st.miss ? 700 : 400 }),
                    _cell(cf != null ? (cf > 0 ? "+" : "") + cf + "円" : _dash, { fontVariantNumeric: "tabular-nums" }),
                    _cell(_bh ? React.createElement("span", { style: { whiteSpace: "nowrap" } },
                      React.createElement("span", { style: { fontWeight: 800, color: "#9A3412" } }, _bh.k),
                      React.createElement("span", { style: { fontWeight: 600, marginLeft: 3, color: _bh.v > 0 ? "#C0392B" : _bh.v < 0 ? "#1E8449" : "#888" } }, (_bh.v > 0 ? "+" : "") + _bh.v.toLocaleString() + "円")) : _dash)
                  );
                })
              )
            )
          )
        );
        var _pieGrid = React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #e0ddd6" } },
          React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "🥧 銘柄別 OS値分布（円グラフ）"),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 8 } }, "各銘柄のOS値がどの帯に出やすいか（中央＝OS値入力件数・タップでその銘柄の明細へ）。成立率＝3本以内（OS1〜3）にα値到達した割合＝そのαで待った場合にエントリーできた率（旧記録はOS値≧α）"),
          React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" } },
            _rowsData.map(function(d) {
              var os = _elOsStatsV2(d.recs);
              if (!os) return null;
              var stRef = d.key;
              return React.createElement("div", { key: d.key,
                onClick: function() { setExpandKey("stock_" + stRef); setSvDateExpand(null); setSvRecExpand({}); },
                style: { border: "1px solid #e8e3d8", borderRadius: 8, padding: "8px 12px", textAlign: "center", cursor: "pointer",
                  background: d.key === selStock ? "#FFF7ED" : "#fff", flex: "0 0 auto" } },
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", marginBottom: 4 } }, d.key),
                _elOsPieV2(os.dist, 92),
                React.createElement("div", { style: { fontSize: 9, color: "#666", marginTop: 5, lineHeight: 1.6 } },
                  "平均 " + os.avg + "円 ／ 中央 " + os.med + "円",
                  React.createElement("br", null),
                  "最頻 " + os.mode.val + "円×" + os.mode.n + " ／ " + os.min + "〜" + os.max + "円"),
                (function() {
                  // 成立率=EP起算: 3本以内にα値到達した率（旧記録はOS値≥α）。OS値入力済みの記録が分母。
                  var _recsA = d.recs.filter(function(r) { return r.signal && r.signal.osVal != null && r.signal.osVal !== ""; });
                  var _cumA = function(aV) { if (!_recsA.length) return 0; var c = 0; _recsA.forEach(function(r) { if (_epReachedAt(r.signal, aV)) c++; }); return Math.round(c / _recsA.length * 100); };
                  return React.createElement("div", { style: { fontSize: 9, color: "#0369A1", fontWeight: 600, marginTop: 2, whiteSpace: "nowrap" } },
                    "成立率 α5:" + _cumA(5) + "% α10:" + _cumA(10) + "% α15:" + _cumA(15) + "% α20:" + _cumA(20) + "%");
                })()
              );
            })
          ),
          React.createElement("div", { style: { marginTop: 8 } }, _elOsBandLegendV2())
        );
        var _stkInsight = (function() {
          var qual = _rowsData.map(function(d) {
            var os = _elOsStatsV2(d.recs);
            if (!os || os.n < 2) return null;
            return { k: d.key, os: os, ss: _elStopStatsV2(d.recs, data) };
          }).filter(function(x) { return !!x; });
          if (!qual.length) return null;
          var items = [];
          if (qual.length >= 2) {
            var byAvg = qual.slice().sort(function(a, b) { return b.os.avg - a.os.avg; });
            var hi = byAvg[0], lo = byAvg[byAvg.length - 1];
            items.push(React.createElement("span", null, "OSが大きく出やすいのは ", _elInsightEmV2("「" + hi.k + "」"), "（平均" + hi.os.avg + "円・最頻" + hi.os.mode.val + "円）、小さめなのは ", _elInsightEmV2("「" + lo.k + "」"), "（平均" + lo.os.avg + "円）→ 銘柄ごとにαを変える余地"));
          } else {
            items.push(React.createElement("span", null, _elInsightEmV2("「" + qual[0].k + "」"), " のOS値は平均" + qual[0].os.avg + "円・中央値" + qual[0].os.med + "円に出ることが多い"));
          }
          var withStop = qual.filter(function(q) { return q.ss.any > 0; }).sort(function(a, b) { return (b.ss.rate || 0) - (a.ss.rate || 0); });
          if (withStop.length) items.push(React.createElement("span", null, "損切りになりやすいのは ", _elInsightEmV2("「" + withStop[0].k + "」", "#1E8449"), "（率" + (withStop[0].ss.rate != null ? withStop[0].ss.rate : 0) + "%・" + withStop[0].ss.any + "回）"));
          var bhCnt = { "単独": 0, "H1": 0, "H2": 0 }, bhTot = 0;
          _rowsData.forEach(function(d) {
            var p = 0, pc = 0, h1 = 0, h1c = 0, h2 = 0, h2c = 0;
            d.recs.forEach(function(r) {
              var s = r.signal; var ai = _elAlphaInfo(r, data);
              var pp = _elDynPlanned(s, ai.alpha, ai.cutLine); if (pp != null) { p += pp; pc++; }
              var t1 = _elHold1TotParts(s, ai.alpha, ai.cutLine); if (t1.main != null) { h1 += t1.main; h1c++; }
              var t2 = _elHold2TotParts(s, ai.alpha, ai.cutLine); if (t2.main != null) { h2 += t2.main; h2c++; }
            });
            var opts2 = [];
            if (pc > 0) opts2.push(["単独", p]);
            if (h1c > 0) opts2.push(["H1", h1]);
            if (h2c > 0) opts2.push(["H2", h2]);
            if (!opts2.length) return;
            opts2.sort(function(a, b) { return b[1] - a[1]; });
            bhCnt[opts2[0][0]]++; bhTot++;
          });
          if (bhTot >= 2) {
            var bhTop = ["単独", "H1", "H2"].sort(function(a, b) { return bhCnt[b] - bhCnt[a]; })[0];
            if (bhCnt[bhTop] > 0) items.push(React.createElement("span", null, bhTot + "銘柄中 " + bhCnt[bhTop] + "銘柄で ", _elInsightEmV2("「" + bhTop + "」"), " の持ち方が最有利"));
          }
          return _elInsightBoxV2(items, { title: "銘柄別比較・OS値分布" });
        })();
        return React.createElement(React.Fragment, null, _kpi, _cmpTable, _pieGrid, _stkInsight);
      })(),

      React.createElement("div", { style: { display: "flex", gap: 0, overflowX: "auto", borderBottom: "2px solid #e0ddd6", background: "#faf9f7" } },
        stocks.map(function(st) {
          var stRecs = byStock[st];
          var stSt = _calcD(stRecs);
          var on = st === selStock;
          var stRef = st;
          return React.createElement("button", { key: st,
            onClick: function() { setExpandKey("stock_" + stRef); setSvDateExpand(null); setSvRecExpand({}); },
            style: { padding: "8px 14px 6px", border: "none", cursor: "pointer", flexShrink: 0,
              background: on ? "#fff" : "transparent",
              borderBottom: on ? "2px solid #9A3412" : "2px solid transparent",
              marginBottom: -2 }
          },
            React.createElement("div", { style: { fontSize: 13, fontWeight: on ? 700 : 500, color: on ? "#9A3412" : "#555" } }, st),
            React.createElement("div", { style: { fontSize: 10, color: "#888", marginTop: 1 } },
              stRecs.length + "件")
          );
        })
      ),
      
      React.createElement("div", { style: { padding: "8px 14px", background: "#fff", borderBottom: "1px solid #e0ddd6", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", fontSize: 11 } },
        React.createElement("span", { style: { fontWeight: 700, color: "#9A3412", fontSize: 13, marginRight: 4 } }, selStock),
        React.createElement("span", { style: { color: "#555" } }, "全" + selSt.total + "件"),
        selSt.sumPnl !== 0 && React.createElement("span", { style: { color: selSt.sumPnl > 0 ? "#C0392B" : "#1E8449", fontWeight: 600 } },
          "損益 " + (selSt.sumPnl > 0 ? "+" : "") + selSt.sumPnl + "円"),
        React.createElement("span", { style: { color: "#666", marginLeft: 4 } },
          "実エントリー" + selEnt.length + "件　見送り" + selSkp.length + "件"),
        (function() {
          var _osSv = selRecs.filter(function(r) { return r.signal.osVal != null; });
          if (!_osSv.length) return null;
          var _osStatSel = _elOsStatsV2(selRecs);
          var _ssStatSel = _elStopStatsV2(selRecs, data);
          if (_osStatSel) return React.createElement("span", { style: { fontSize: 11, color: "#555", whiteSpace: "nowrap" } },
            "OS値 平均" + _osStatSel.avg + "円・中央" + _osStatSel.med + "円・最頻" + _osStatSel.mode.val + "円",
            React.createElement("span", { style: { color: _ssStatSel.any > 0 ? "#1E8449" : "#999", fontWeight: 600, marginLeft: 8 } }, "損切り" + _ssStatSel.any + "回"));
          var _osAvSv = Math.round(_osSv.reduce(function(a, r) { return a + Number(r.signal.osVal); }, 0) / _osSv.length * 10) / 10;
          return React.createElement("span", { style: { fontSize: 11, color: "#555", whiteSpace: "nowrap" } }, "平均OS値 " + _osAvSv + "\u5186");
        })(),
        React.createElement("button", {
          onClick: function() {
            var d = new Date(); var pad = function(n) { return n < 10 ? "0" + n : "" + n; };
            var today = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
            setEditTarget({ date: today, stock: selStock });
          },
          style: { marginLeft: "auto", padding: "4px 12px", fontSize: 11, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", flexShrink: 0 }
        }, "＋ 追加")
      ),
      
      (function() {
        var ALPHAS = [0, 5, 10, 15, 20];
        var _aRecs = selRecs.filter(function(r) { return r.signal.osVal != null && r.signal.osVal !== ""; });
        if (!_aRecs.length) return null;
        var _aiRows = ALPHAS.map(function(a) {
          var ent = 0, miss = 0, stpP = 0, stpH1 = 0, stpH2 = 0;
          var sumP = 0, pc = 0, sumH1 = 0, h1c = 0, sumH2 = 0, h2c = 0, ref2 = 0, ref2c = 0;
          _aRecs.forEach(function(r) {
            var s = r.signal;
            var cut = _elAlphaInfo(r, data).cutLine;
            if (_epReachedAt(s, a)) ent++; else miss++;  // 成立=EP起算(3本以内α到達)・旧記録はOS値≥α
            var p = _elPlanIsStop(s, a, cut);
            var h1 = !p && _elHoldIsStop(s, a, cut);
            var h2 = !p && !h1 && _elHas2Data(s) && !_elH2Miss(s, a) && _elHoldIsStop2(s, a, cut);
            if (p) stpP++;
            if (h1) stpH1++;
            if (h2) stpH2++;
            var pp = _elDynPlanned(s, a, cut); if (pp != null) { sumP += pp; pc++; }
            var t1 = _elHold1TotParts(s, a, cut); if (t1.main != null) { sumH1 += t1.main; h1c++; }
            var t2 = _elHold2TotParts(s, a, cut); if (t2.main != null) { sumH2 += t2.main; h2c++; }
            if (t2.ref != null) { ref2 += t2.ref; ref2c++; }
          });
          return { a: a, ent: ent, miss: miss, entPct: Math.round(ent / _aRecs.length * 100),
            stpP: stpP, stpH1: stpH1, stpH2: stpH2, stpAny: stpP + stpH1 + stpH2,
            sumP: sumP, pc: pc, sumH1: sumH1, h1c: h1c, sumH2: sumH2, h2c: h2c, ref2: ref2, ref2c: ref2c };
        });
        var _bestH1v = Math.max.apply(null, _aiRows.map(function(x) { return x.h1c > 0 ? x.sumH1 : -Infinity; }));
        var _bestH2v = Math.max.apply(null, _aiRows.map(function(x) { return x.h2c > 0 ? x.sumH2 : -Infinity; }));
        var _curCnt = {}, _curA = null, _curN = 0;
        selRecs.forEach(function(r) { var a = _elAlphaInfo(r, data).alpha; if (a == null) return; _curCnt[a] = (_curCnt[a] || 0) + 1; if (_curCnt[a] > _curN) { _curN = _curCnt[a]; _curA = a; } });
        var _ist = _elvIdealStats(selRecs);
        var _aiTh = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" }, ex || {}) }, t); };
        var _aiTd = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede8", fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
        var _aiPnl = function(v, cnt, best) {
          if (cnt <= 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
          return React.createElement("span", { style: { fontWeight: best ? 800 : 600, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円");
        };
        return React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #e0ddd6" } },
          React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "🎯 " + selStock + " のα値別シミュレーション（α意思決定表）"),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } },
            "この銘柄の全記録（OS値入力 " + _aRecs.length + "件）をα＝0〜20円で再計算。成立率＝3本以内にα値到達（そのαで待った場合にエントリーできた率・旧記録はOS値≧α）。損切り＝想定・H1・H2いずれか（損切り値は各記録の採用値）。損益は銘柄別記録・取引と同一基準（100株換算・H2は期待度○/△が本集計・×は括弧参考）。★＝H1/H2それぞれの利益最大α。"),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
                _aiTh("α値", { textAlign: "left", paddingLeft: 8 }), _aiTh("成立率"), _aiTh("E未達"), _aiTh("損切り回数"), _aiTh("EP損益"), _aiTh("H１損益"), _aiTh("H２損益")
              )),
              React.createElement("tbody", null, _aiRows.map(function(x) {
                var _b1 = x.h1c > 0 && x.sumH1 === _bestH1v && _bestH1v > -Infinity;
                var _b2 = x.h2c > 0 && x.sumH2 === _bestH2v && _bestH2v > -Infinity;
                var _isCur = _curA != null && x.a === _curA;
                return React.createElement("tr", { key: x.a, style: { background: (_b1 || _b2) ? "#FEF3C7" : "transparent" } },
                  React.createElement("td", { style: { padding: "4px 8px", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede8", color: "#0369A1" } },
                    x.a + "円",
                    _isCur ? React.createElement("span", { style: { marginLeft: 4, fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#E0F2FE", color: "#0369A1", fontWeight: 700 } }, "採用中") : null,
                    _b1 ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 3, fontWeight: 800 } }, "★H1") : null,
                    _b2 ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 3, fontWeight: 800 } }, "★H2") : null),
                  _aiTd(React.createElement("span", { style: { fontWeight: 700, color: x.entPct >= 60 ? "#1E8449" : x.entPct >= 30 ? "#B45309" : "#C0392B" } }, x.entPct + "%",
                    React.createElement("span", { style: { fontWeight: 400, fontSize: 9, color: "#999", marginLeft: 2 } }, "(" + x.ent + "/" + _aRecs.length + ")"))),
                  _aiTd(x.miss > 0 ? x.miss : "—", { color: x.miss > 0 ? "#B45309" : "#ccc" }),
                  _aiTd(x.stpAny > 0
                    ? React.createElement("span", { style: { whiteSpace: "nowrap" } },
                        React.createElement("span", { style: { fontWeight: 700, color: "#1E8449" } }, x.stpAny + "回"),
                        React.createElement("span", { style: { fontSize: 9, color: "#888", marginLeft: 3 } }, "想" + x.stpP + "・H1 " + x.stpH1 + "・H2 " + x.stpH2))
                    : React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "0回")),
                  _aiTd(_aiPnl(x.sumP, x.pc, false)),
                  _aiTd(_aiPnl(x.sumH1, x.h1c, _b1)),
                  _aiTd(React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" } }, _aiPnl(x.sumH2, x.h2c, _b2), _elHold2RefSuffix(x.h2c > 0 ? x.sumH2 : 0, x.ref2, x.ref2c)))
                );
              }))
            )
          ),
          React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap" } },
            _curA != null ? React.createElement("span", null, "現在の採用α(最頻): ", React.createElement("b", { style: { color: "#0369A1" } }, _curA + "円"), React.createElement("span", { style: { color: "#999" } }, " ×" + _curN + "件")) : null,
            _ist && _ist.aAvg != null ? React.createElement("span", null, "理想α: 平均 ", React.createElement("b", { style: { color: "#0369A1" } }, _ist.aAvg + "円"), _ist.aMode ? React.createElement("span", { style: { color: "#999" } }, "・最頻 " + _ist.aMode.val + "円×" + _ist.aMode.n) : null) : null,
            _ist && _ist.cAvg != null ? React.createElement("span", null, "理想損切り: 平均 ", React.createElement("b", { style: { color: "#9333EA" } }, _ist.cAvg + "円"), _ist.cMode ? React.createElement("span", { style: { color: "#999" } }, "・最頻 " + _ist.cMode.val + "円×" + _ist.cMode.n) : null) : null
          ),
          (function() {
            var b1Row = null, b2Row = null;
            _aiRows.forEach(function(x) {
              if (b1Row == null && x.h1c > 0 && x.sumH1 === _bestH1v && _bestH1v > -Infinity) b1Row = x;
              if (b2Row == null && x.h2c > 0 && x.sumH2 === _bestH2v && _bestH2v > -Infinity) b2Row = x;
            });
            var items = [];
            if (_aRecs.length < 3) {
              items.push("OS値入力が" + _aRecs.length + "件と少ないため参考程度（件数が増えると精度が上がる）");
            }
            if (b1Row && b2Row && b1Row.a === b2Row.a) {
              items.push(React.createElement("span", null, "この銘柄は ", _elInsightEmV2("α" + b1Row.a + "円", "#0369A1"), " で待つとH1/H2とも最も利益が出ている（成立率" + b1Row.entPct + "%・損切り" + b1Row.stpAny + "回）"));
            } else if (b1Row || b2Row) {
              items.push(React.createElement("span", null, "利益最大は H1＝", _elInsightEmV2(b1Row ? "α" + b1Row.a + "円" : "—", "#0369A1"), "・H2＝", _elInsightEmV2(b2Row ? "α" + b2Row.a + "円" : "—", "#0369A1"), "（どちらも基本のため両方を目安に）"));
            }
            if (_curA != null && (b1Row || b2Row)) {
              var refA = b1Row && b2Row ? Math.round((b1Row.a + b2Row.a) / 2) : (b1Row ? b1Row.a : b2Row.a);
              if (refA > _curA) items.push(React.createElement("span", null, "採用中のα" + _curA + "円より ", _elInsightEmV2("深めのOSを待つ方が良い傾向")));
              else if (refA < _curA) items.push(React.createElement("span", null, "採用中のα" + _curA + "円より ", _elInsightEmV2("浅めでも取れている傾向")));
              else items.push("採用中のα" + _curA + "円が最適と一致している");
            }
            var rA = _aiRows[2], rB = _aiRows[4];
            if (rA && rB && rA.ent !== rB.ent) {
              items.push("α10→20にすると成立率 " + rA.entPct + "%→" + rB.entPct + "%・損切り " + rA.stpAny + "→" + rB.stpAny + "回（機会と損切りのトレードオフ）");
            }
            return _elInsightBoxV2(items, { title: selStock + " のα選択" });
          })()
        );
      })(),

      React.createElement("div", { style: { padding: "8px 8px 0" } },
        _svGradeLegend,
        sortToggle,
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff" } },
            thead,
            tbody
          )
        )
      )
    );
  };

  
  var saveSignalDef = function(tagName, field, htmlVal) {
    save(function(prev) {
      var c = prev.custom || {};
      var defs = Object.assign({}, c.signalDefs || {});
      var entry = Object.assign({}, defs[tagName] || {});
      entry[field] = htmlVal;
      defs[tagName] = entry;
      return Object.assign({}, prev, { custom: Object.assign({}, c, { signalDefs: defs }) });
    });
  };
  
  var reorderSignalTags = function(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    save(function(prev) {
      var c = prev.custom || {};
      var tags = (c.signalTags || []).slice();
      if (fromIdx < 0 || toIdx < 0 || fromIdx >= tags.length || toIdx >= tags.length) return prev;
      var item = tags.splice(fromIdx, 1)[0];
      tags.splice(toIdx, 0, item);
      return Object.assign({}, prev, { custom: Object.assign({}, c, { signalTags: tags }) });
    });
  };
  
  var _addSignalTag = function(text) {
    var t = (text || "").trim();
    if (!t) { window.alert("シグナル名を入力してください"); return false; }
    if (signalTags.includes(t)) { window.alert("「" + t + "」は既に登録されています"); return false; }
    save(function(prev) {
      var c = prev.custom || {};
      var tags = (c.signalTags || []).slice();
      if (!tags.includes(t)) tags.push(t);
      return Object.assign({}, prev, { custom: Object.assign({}, c, { signalTags: tags }) });
    });
    return true;
  };
  var _renameSignalTagMaster = function(oldName, newName) {
    var t = (newName || "").trim();
    if (!t) { window.alert("シグナル名を入力してください"); return false; }
    if (t === oldName) { return true; } 
    var isMerge = signalTags.includes(t);
    if (isMerge && !window.confirm("「" + t + "」は既に登録されています。\n「" + oldName + "」を「" + t + "」に統合しますか？\n既存の記録も全て書き換えられます。")) return false;
    save(function(prev) {
      var c = prev.custom || {};
      var tags = (c.signalTags || []).slice();
      var idx = tags.indexOf(oldName);
      if (idx < 0) return prev;
      if (isMerge) {
        tags.splice(idx, 1); 
      } else {
        tags[idx] = t;
      }
      
      var charts = Object.assign({}, prev.charts || {});
      Object.keys(charts).forEach(function(ck) {
        var cc = charts[ck];
        if (!cc || !Array.isArray(cc.signals)) return;
        var changed = false;
        var sigs = cc.signals.map(function(s) {
          if (s.isCustomTag) return s;
          var tagMatch = s.tag === oldName;
          var tagsMatch = Array.isArray(s.tags) && s.tags.includes(oldName);
          if (!tagMatch && !tagsMatch) return s;
          changed = true;
          var updated = Object.assign({}, s);
          if (tagMatch) updated.tag = t;
          if (tagsMatch) {
            
            var newTags = s.tags.map(function(x) { return x === oldName ? t : x; });
            updated.tags = newTags.filter(function(x, i) { return newTags.indexOf(x) === i; });
          }
          return updated;
        });
        if (changed) charts[ck] = Object.assign({}, cc, { signals: sigs });
      });
      return Object.assign({}, prev, { custom: Object.assign({}, c, { signalTags: tags }), charts: charts });
    });
    return true;
  };
  var _deleteSignalTagMaster = function(name) {
    if (!window.confirm("「" + name + "」をシグナルマスタから削除しますか？\n既存の戦績記録は残ります（選択肢から外れるだけ）。")) return false;
    save(function(prev) {
      var c = prev.custom || {};
      var tags = (c.signalTags || []).filter(function(x) { return x !== name; });
      return Object.assign({}, prev, { custom: Object.assign({}, c, { signalTags: tags }) });
    });
    return true;
  };
  var _moveSignalTag = function(idx, dir) {
    var to = idx + dir;
    if (idx < 0 || idx >= signalTags.length || to < 0 || to >= signalTags.length) return;
    save(function(prev) {
      var c = prev.custom || {};
      var tags = (c.signalTags || []).slice();
      if (idx >= tags.length || to >= tags.length || idx < 0 || to < 0) return prev;
      var tmp = tags[idx]; tags[idx] = tags[to]; tags[to] = tmp;
      return Object.assign({}, prev, { custom: Object.assign({}, c, { signalTags: tags }) });
    });
  };

  
  var renderSignalMgr = function() {
    return React.createElement("div", {
      style: { marginBottom: 10, border: "1px solid #e0ddd6", borderRadius: 8, overflow: "hidden", background: "#fff" }
    },
      
      React.createElement("div", {
        onClick: function() {
          if (editingSigIdx !== null) return; 
          setSigMgrOpen(!sigMgrOpen);
        },
        style: { padding: "8px 12px", background: "#f5f4f0",
          borderBottom: sigMgrOpen ? "1px solid #e0ddd6" : "none",
          cursor: "pointer", display: "flex", alignItems: "center",
          fontSize: 13, fontWeight: 600, color: "#555", userSelect: "none" }
      },
        "⚙ シグナル管理 (" + signalTags.length + "件)",
        React.createElement("span", { style: { marginLeft: "auto", color: "#888", fontSize: 12 } },
          sigMgrOpen ? "▲" : "▼")
      ),
      
      sigMgrOpen && React.createElement("div", null,
        signalTags.length === 0 && React.createElement("div", {
          style: { padding: "12px", textAlign: "center", color: "#888", fontSize: 12 }
        }, "シグナルが登録されていません。下の入力欄から追加してください。"),
        signalTags.map(function(name, i) {
          var isEdit = editingSigIdx === i;
          var isOtherEdit = editingSigIdx !== null && editingSigIdx !== i;
          var isFirst = i === 0;
          var isLast = i === signalTags.length - 1;
          var rowDis = isOtherEdit;
          return React.createElement("div", {
            key: i + "_" + name,
            style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 10px",
              borderBottom: "1px solid #eee", background: isEdit ? "#EEF6FF" : "#fff",
              opacity: rowDis ? 0.5 : 1, fontSize: 13 }
          },
            
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 } },
              React.createElement("button", {
                disabled: rowDis || isEdit || isFirst,
                onClick: function() { _moveSignalTag(i, -1); },
                title: "上に移動",
                style: { width: 26, height: 14, padding: 0, fontSize: 9, lineHeight: 1, border: "1px solid #ccc",
                  background: "#fafafa", borderRadius: 2,
                  cursor: (rowDis || isEdit || isFirst) ? "default" : "pointer",
                  opacity: (rowDis || isEdit || isFirst) ? 0.3 : 1 }
              }, "▲"),
              React.createElement("button", {
                disabled: rowDis || isEdit || isLast,
                onClick: function() { _moveSignalTag(i, 1); },
                title: "下に移動",
                style: { width: 26, height: 14, padding: 0, fontSize: 9, lineHeight: 1, border: "1px solid #ccc",
                  background: "#fafafa", borderRadius: 2,
                  cursor: (rowDis || isEdit || isLast) ? "default" : "pointer",
                  opacity: (rowDis || isEdit || isLast) ? 0.3 : 1 }
              }, "▼")
            ),
            
            React.createElement("span", { style: { fontSize: 14, flexShrink: 0 } }, "🎯"),
            
            isEdit
              ? React.createElement("input", {
                  type: "text",
                  value: editingSigText,
                  onChange: function(e) { setEditingSigText(e.target.value); },
                  onKeyDown: function(e) {
                    if (e.key === "Enter") {
                      if (_renameSignalTagMaster(name, editingSigText)) {
                        setEditingSigIdx(null); setEditingSigText("");
                      }
                    } else if (e.key === "Escape") {
                      setEditingSigIdx(null); setEditingSigText("");
                    }
                  },
                  autoFocus: true,
                  style: { flex: 1, minWidth: 0, padding: "4px 6px", border: "1px solid #6366F1",
                    borderRadius: 4, fontSize: 13, fontWeight: 500, color: "#9A3412", outline: "none" }
                })
              : React.createElement("span", {
                  style: { flex: 1, minWidth: 0, color: "#9A3412", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                }, name),
            
            isEdit
              ? React.createElement(React.Fragment, null,
                  React.createElement("button", {
                    onClick: function() {
                      if (_renameSignalTagMaster(name, editingSigText)) {
                        setEditingSigIdx(null); setEditingSigText("");
                      }
                    },
                    style: { padding: "3px 8px", fontSize: 11, background: "#10B981", color: "#fff",
                      border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600, flexShrink: 0 }
                  }, "💾 保存"),
                  React.createElement("button", {
                    onClick: function() { setEditingSigIdx(null); setEditingSigText(""); },
                    style: { padding: "3px 8px", fontSize: 11, background: "#888", color: "#fff",
                      border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600, flexShrink: 0 }
                  }, "✕ 取消")
                )
              : React.createElement(React.Fragment, null,
                  React.createElement("button", {
                    disabled: rowDis,
                    onClick: function() {
                      if (rowDis) return;
                      setEditingSigIdx(i); setEditingSigText(name);
                    },
                    title: "リネーム",
                    style: { padding: "3px 9px", fontSize: 12, background: "#fff", color: "#555",
                      border: "1px solid #ccc", borderRadius: 4,
                      cursor: rowDis ? "default" : "pointer", flexShrink: 0 }
                  }, "✎"),
                  React.createElement("button", {
                    disabled: rowDis,
                    onClick: function() { if (!rowDis) _deleteSignalTagMaster(name); },
                    title: "削除",
                    style: { padding: "3px 9px", fontSize: 12, background: "#fff", color: "#dc2626",
                      border: "1px solid #fca5a5", borderRadius: 4,
                      cursor: rowDis ? "default" : "pointer", flexShrink: 0 }
                  }, "🗑")
                )
          );
        }),
        
        React.createElement("div", {
          style: { display: "flex", gap: 6, padding: "8px 10px", background: "#f5f4f0",
            borderTop: "1px solid #e0ddd6" }
        },
          React.createElement("input", {
            type: "text",
            value: newSigText,
            placeholder: "新しいシグナル名を入力",
            onChange: function(e) { setNewSigText(e.target.value); },
            onKeyDown: function(e) {
              if (e.key === "Enter" && editingSigIdx === null) {
                if (_addSignalTag(newSigText)) setNewSigText("");
              }
            },
            disabled: editingSigIdx !== null,
            style: { flex: 1, minWidth: 0, padding: "5px 8px", fontSize: 13,
              border: "1px solid #ccc", borderRadius: 4, outline: "none",
              opacity: editingSigIdx !== null ? 0.5 : 1 }
          }),
          React.createElement("button", {
            disabled: editingSigIdx !== null,
            onClick: function() { if (editingSigIdx === null && _addSignalTag(newSigText)) setNewSigText(""); },
            style: { padding: "5px 12px", fontSize: 13, background: "#6366F1", color: "#fff",
              border: "none", borderRadius: 4, fontWeight: 600, flexShrink: 0,
              cursor: editingSigIdx !== null ? "default" : "pointer",
              opacity: editingSigIdx !== null ? 0.5 : 1 }
          }, "➕ 追加")
        ),
        
        React.createElement("div", {
          style: { padding: "6px 10px", fontSize: 10, color: "#666",
            background: "#fefdf8", borderTop: "1px solid #eee", lineHeight: 1.5 }
        }, "ℹ 削除しても既存の戦績記録は残ります（選択肢から外れるだけ）。リネームは既存記録にも反映されます。")
      )
    );
  };

  
  var _tFmt = function(v) { return (v > 0 ? "+" : "") + v + "円"; };
  var _tCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
  var _tBadge = function(grade) {
    var gs = _GRADE_STYLE[grade] || _GRADE_STYLE.Z;
    return React.createElement("span", { title: grade,
      style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 18, height: 18, borderRadius: "50%",
        background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
        fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 }
    }, grade);
  };
  var _tSlash = function(sum, ev, grade) {
    if (sum === 0) return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
      grade ? _tBadge(grade) : null,
      React.createElement("span", { style: { color: "#ccc" } }, "—")
    );
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
      grade ? _tBadge(grade) : null,
      React.createElement("span", { style: { fontWeight: 600, color: _tCol(sum) } }, _tFmt(sum))
    );
  };
  var _DIFF_COL = { A: "#1a1a1a", B: "#1a1a1a", C: "#1a1a1a", D: "#1a1a1a", E: "#1a1a1a" };
  var _tDiffBreak = function(recs, totalSum, totalEv, grade, sumKey, evKey) {
    var top = _tSlash(totalSum, totalEv, grade);
    if (!recs || !recs.length) return top;
    var lines = ["A", "B", "C", "D", "E"].reduce(function(acc, d) {
      var gr = recs.filter(function(r) { return r.signal.difficulty === d; });
      if (!gr.length) return acc;
      var gs = _calcD(gr);
      var v = gs[sumKey], e = gs[evKey];
      acc.push(
        React.createElement("span", { key: d + "_l", style: { color: _DIFF_COL[d], fontWeight: 700, textAlign: "right" } }, d),
        React.createElement("span", { key: d + "_c", style: { color: "#ccc", textAlign: "center" } }, ":"),
        React.createElement("span", { key: d + "_v", style: { fontWeight: v !== 0 ? 600 : 400, color: v !== 0 ? (v > 0 ? "#C0392B" : "#1E8449") : "#999", textAlign: "right", whiteSpace: "nowrap" } },
          v !== 0 ? (v > 0 ? "+" : "") + v + "円" : "—"),
        React.createElement("span", { key: d + "_s", style: { color: "#bbb", textAlign: "center" } }, "/"),
        React.createElement("span", { key: d + "_e", style: { color: e != null ? (e > 0 ? "#C0392B" : e < 0 ? "#1E8449" : "#888") : "#999", textAlign: "right", whiteSpace: "nowrap" } },
          e != null ? (e > 0 ? "+" : "") + e + "円" : "—")
      );
      return acc;
    }, []);
    if (!lines.length) return top;
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "stretch", gap: 1, width: "100%" } },
      React.createElement("div", { style: { textAlign: "center" } }, top),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "10px 8px auto 10px auto", alignItems: "center", justifyContent: "center", columnGap: 2, rowGap: 1, fontSize: 10, marginTop: 2, paddingTop: 2, borderTop: "1px dashed #ccc" } }, lines)
    );
  };

  
  var _tABAll = function(recs, allSum, allEv, grade, sumKey, evKey) {
    // 全ランク(全体)のみ表示。B以上/全ランクのAB分割は廃止。
    if (allSum === 0 && allEv == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    var fmt = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    var col = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var allCnt = (recs || []).length;
    var allGrade = allCnt > 0 ? _profitGradeFromPnl(allSum, allCnt) : null;
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
      allGrade ? _tBadge(allGrade) : null,
      React.createElement("span", { style: { fontWeight: 600, color: col(allSum) } }, fmt(allSum))
    );
  };

  var renderSignalView = function() {
    var byTag = {};
    
    filtered.forEach(function(r) {
      _elTagEntries(r.signal).forEach(function(e) {
        if (!byTag[e.key]) byTag[e.key] = { records: [], label: e.label, isCustom: e.isCustom, customText: e.isCustom ? (r.signal.customTagText || "") : "" };
        byTag[e.key].records.push(r);
      });
    });
    var keys = Object.keys(byTag)
      .filter(function(k) { return byTag[k].isCustom || signalTags.indexOf(k) >= 0; })
      .sort(function(a, b) {
        var ia = signalTags.indexOf(a), ib = signalTags.indexOf(b);
        if (ia >= 0 && ib >= 0) return ia - ib;
        if (ia >= 0) return -1;
        if (ib >= 0) return 1;
        return byTag[b].records.length - byTag[a].records.length;
      });
    var curKey = (sigTab && keys.indexOf(sigTab) >= 0) ? sigTab : (keys[0] || "");
    var signalDefs = custom.signalDefs || {};
    
    var addBar = React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 10 } },
      React.createElement("input", {
        type: "text", value: newSigText, placeholder: "新しいシグナル名を入力",
        onChange: function(e) { setNewSigText(e.target.value); },
        onKeyDown: function(e) {
          if (e.key === "Enter" && editingSigIdx === null) { if (_addSignalTag(newSigText)) setNewSigText(""); }
        },
        style: { flex: 1, padding: "6px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none", background: "#fff" }
      }),
      React.createElement("button", {
        onClick: function() { if (editingSigIdx === null && _addSignalTag(newSigText)) setNewSigText(""); },
        style: { padding: "6px 14px", fontSize: 13, fontWeight: 700, background: "#FB923C", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }
      }, "＋ 追加")
    );
    if (keys.length === 0) {
      return React.createElement("div", null, addBar,
        React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: 30 } }, "該当なし"));
    }
    var grp = byTag[curKey];
    if (!grp) {
      return React.createElement("div", null, addBar,
        React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: 30 } }, "該当なし"));
    }
    var stats = _calcD(grp.records);
    var grpOs = _elOsStatsV2(grp.records);
    var grpSs = _elStopStatsV2(grp.records, data);
    var ent = grp.records.filter(function(x) { return _elIsEntered(x.signal, x.item); });
    var skp = grp.records.filter(function(x) { return !_elIsEntered(x.signal, x.item); });
    var entSt = _calcD(ent);
    var skpSt = _calcD(skp);
    var sigIdx = grp.isCustom ? -1 : signalTags.indexOf(curKey);
    var isCardEditing = sigIdx >= 0 && editingSigIdx === sigIdx;
    var sigDef = signalDefs[curKey] || {};

    
    var TIME_SLOTS = [
      ["09:00","09:15"],["09:16","09:30"],["09:31","09:45"],["09:46","10:00"],
      ["10:01","10:15"],["10:16","10:30"],["10:31","10:45"],["10:46","11:00"],
      ["11:01","11:15"],["11:16","11:30"],
      ["12:30","12:45"],["12:46","13:00"],["13:01","13:15"],["13:16","13:30"],
      ["13:31","13:45"],["13:46","14:00"],["14:01","14:15"],["14:16","14:30"],
      ["14:31","14:45"],["14:46","15:00"],["15:01","15:15"],["15:16","15:30"]
    ];
    var slotStats = TIME_SLOTS.map(function(s) {
      var recs = grp.records.filter(function(r) { var t = r.signal.time; return t && t >= s[0] && t <= s[1]; });
      return { slot: s, recs: recs, stats: _calcD(recs) };
    });


    var _sigPnlCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _sigYen = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    var _sigWpCol = function(wp) { return wp == null ? "#ccc" : wp >= 60 ? "#C0392B" : wp >= 40 ? "#888" : "#1E8449"; };
    var _sigAvgOS = function(recs) {
      var rs = recs.filter(function(r) { return r.signal.osVal != null; });
      if (!rs.length) return null;
      return Math.round(rs.reduce(function(a, r) { return a + Number(r.signal.osVal); }, 0) / rs.length * 10) / 10;
    };
    var _sigAvgConf = function(recs) {
      var rs = recs.filter(function(r) { return r.signal.osConfVal != null && r.signal.osConfVal !== ""; });
      if (!rs.length) return null;
      return Math.round(rs.reduce(function(a, r) { var s = r.signal; return a + (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)); }, 0) / rs.length * 10) / 10;
    };
    var _sigKpiCard = function(label, val, color, sub) {
      return React.createElement("div", { key: label, style: { flex: "1 1 90px", minWidth: 90, background: "#fff", border: "1px solid #e8e3d8",
        borderRadius: 8, padding: "8px 10px", textAlign: "center" } },
        React.createElement("div", { style: { fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 3 } }, label),
        React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: color || "#333", lineHeight: 1.1, whiteSpace: "nowrap" } }, val),
        sub ? React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginTop: 2 } }, sub) : null
      );
    };

    var _sigRichTable = function(opts) {
      var rows = opts.rows.filter(function(r) { return r.recs.length > 0; });
      if (rows.length === 0) {
        return React.createElement("div", { style: { padding: "10px 12px", background: "#fff" } },
          React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 4 } }, opts.icon + " " + opts.title),
          React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "12px 0", fontSize: 12 } }, "記録なし"));
      }
      var _hh = function(t, extra) { return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%", fontSize: 10, color: "#9A3412" }, extra || {}) }, t); };
      var allRecs = rows.reduce(function(a, r) { return a.concat(r.recs); }, []);
      var _cell = function(content, isTot, extra) {
        return React.createElement("td", { style: Object.assign({ padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: isTot ? "2px solid #ccc" : "1px solid #f0ede8" }, extra || {}) }, content);
      };
      var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
      var _mkRow = function(label, labelColor, recs, isTot, tagKey) {
        var st = _calcD(recs);
        var osS = _elOsStatsV2(recs), ssS = _elStopStatsV2(recs, data), cf = _sigAvgConf(recs);
        var canExp = !isTot && opts.expandPrefix && recs.length > 0;
        var isOn = canExp && sigSubExpand === opts.expandPrefix + tagKey;
        return React.createElement("tr", {
          key: isTot ? "__tot__" : tagKey,
          onClick: canExp ? function() { setSigSubExpand(isOn ? null : opts.expandPrefix + tagKey); } : undefined,
          style: { background: isTot ? "#F5F0E8" : (isOn ? "#FFF7ED" : "transparent"), cursor: canExp ? "pointer" : "default" }
        },
          React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", width: "1%", borderBottom: isTot ? "2px solid #ccc" : "1px solid #f0ede8", color: labelColor || "#333" } },
            (isOn ? "▶ " : "") + label
          ),
          _cell(recs.length, isTot, { fontWeight: 700 }),
          _cell(osS ? osS.avg + "円" : _dash, isTot, { fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "#9A3412" }),
          _cell(osS ? osS.med + "円" : _dash, isTot, { fontVariantNumeric: "tabular-nums" }),
          _cell(osS ? React.createElement("span", null, osS.mode.val + "円", React.createElement("span", { style: { fontSize: 9, color: "#aaa", marginLeft: 2 } }, "×" + osS.mode.n)) : _dash, isTot),
          _cell(_elOsDistBarV2(osS ? osS.dist : null, 72, 11), isTot),
          _cell(_elStopCellV2(ssS), isTot),
          _cell(st.miss ? st.miss : _dash, isTot, { color: st.miss ? "#7C3AED" : "#ccc", fontWeight: st.miss ? 700 : 400 }),
          _cell(cf != null ? (cf > 0 ? "+" : "") + cf + "円" : _dash, isTot, { fontVariantNumeric: "tabular-nums" })
        );
      };
      return React.createElement("div", { style: { padding: "10px 12px", background: "#fff" } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, opts.icon + " " + opts.title),
        React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "OS統計＝入力済みOS値のみ（最頻＝最も多いOS値×件数）/ OS分布＝0〜4／5〜9／10〜14／15〜19／20円〜の帯別件数 / 損切り＝想定・H1・H2いずれかで損切りライン到達した回数（率はOS値入力件数比）"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { background: "#f5f4f0" } },
                _hh(opts.headLabel, { textAlign: "left", paddingLeft: 8 }), _hh("件"), _hh("平均OS値"), _hh("中央値"), _hh("最頻"), _hh("OS分布"), _hh("損切り"), _hh("E未達"), _hh("平均確定値")
              )
            ),
            React.createElement("tbody", null,
              [_mkRow("合計", "#9A3412", allRecs, true, null)].concat(
                rows.map(function(r) { return _mkRow(r.label, r.labelColor, r.recs, false, r.key); })
              )
            )
          )
        ),
        (function() {
          if (rows.length < 2) return null;
          var qual = rows.map(function(r) {
            return { label: r.label, n: r.recs.length, os: _elOsStatsV2(r.recs), ss: _elStopStatsV2(r.recs, data) };
          });
          var items = [];
          var byN = qual.slice().sort(function(a, b) { return b.n - a.n; });
          if (byN[0].n >= 2 && byN[0].n > byN[1].n) items.push(React.createElement("span", null, "記録が最も多いのは ", _elInsightEmV2("「" + byN[0].label + "」"), "（" + byN[0].n + "件）"));
          var withOs = qual.filter(function(q) { return q.os && q.os.n >= 2; });
          if (withOs.length >= 2) {
            var byAvg = withOs.slice().sort(function(a, b) { return b.os.avg - a.os.avg; });
            items.push(React.createElement("span", null, "OSが大きく出やすいのは ", _elInsightEmV2("「" + byAvg[0].label + "」"), "（平均" + byAvg[0].os.avg + "円）、小さめなのは ", _elInsightEmV2("「" + byAvg[byAvg.length - 1].label + "」"), "（平均" + byAvg[byAvg.length - 1].os.avg + "円）"));
          }
          var withStop = qual.filter(function(q) { return q.ss.any > 0; }).sort(function(a, b) { return (b.ss.any - a.ss.any) || ((b.ss.rate || 0) - (a.ss.rate || 0)); });
          if (withStop.length) items.push(React.createElement("span", null, "損切りが多いのは ", _elInsightEmV2("「" + withStop[0].label + "」", "#1E8449"), "（" + withStop[0].ss.any + "回" + (withStop[0].ss.rate != null ? "・率" + withStop[0].ss.rate + "%" : "") + "）"));
          return _elInsightBoxV2(items, { title: opts.title });
        })(),
        opts.expandPrefix && sigSubExpand && sigSubExpand.indexOf(opts.expandPrefix) === 0 && (function() {
          var ek = sigSubExpand.slice(opts.expandPrefix.length);
          var row = null;
          for (var i = 0; i < rows.length; i++) { if (String(rows[i].key) === ek) { row = rows[i]; break; } }
          if (!row) return null;
          var er = row.recs.slice().sort(function(a, b) { return (b.date + (b.signal.time || "")).localeCompare(a.date + (a.signal.time || "")); });
          return React.createElement("div", { style: { padding: "6px 0 0" } },
            React.createElement("div", { style: { padding: "4px 4px 6px", fontSize: 11, fontWeight: 700, color: "#9A3412" } }, "▶ " + row.label + "  " + er.length + "件"),
            er.map(function(r) { return React.createElement(EntryLogCard, { key: r.stock + "_" + r.signal.id, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate }); })
          );
        })()
      );
    };

    var _sigDateFlat = function(opts) {
      var rows = opts.rows.filter(function(r) { return r.recs.length > 0; });
      var _ovA = null, _ovC = null;
      var _hh = function(t, extra) { return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%", fontSize: 10, color: "#9A3412" }, extra || {}) }, t); };
      var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
      var _gBadge = function(g) { if (!g || g === "Z") return null; var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z; return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 2, flexShrink: 0 } }, g); };
      var _pnlCell = function(v) { if (v == null) return _dash; var col = v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: col, whiteSpace: "nowrap" } }, _gBadge(_profitGradeFromPnl(v, 1)), (v > 0 ? "+" : "") + v.toLocaleString() + "円"); };
      var _osCell = function(s) { return s.osVal != null ? React.createElement("span", { style: { color: _vcol(s.osVal, true), fontWeight: Number(s.osVal) >= 10 ? 700 : 600 } }, s.osVal + "円") : _dash; };
      var _confCell = function(s) {
        if (s.osConfVal != null && Number(s.osConfVal) === 0) return React.createElement("span", { style: { color: "#888" } }, "0円");
        if (!s.osConfSign) return _dash;
        return React.createElement("span", { style: { color: _vcol(s.osConfVal, s.osConfSign === "+"), fontWeight: Number(s.osConfVal) >= 10 ? 700 : 600 } }, (s.osConfSign === "+" ? "↑" : s.osConfSign === "-" ? "↓" : "↕") + Math.abs(Number(s.osConfVal)) + "円");
      };
      var _ewCell = function(s, alpha) {
        if (alpha == null || s.osConfVal == null || s.osConfVal === "") return _dash;
        var _cfEw = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
        var _ew = alpha - _cfEw;
        if (_ew === 0) return React.createElement("span", { style: { color: "#888" } }, "0");
        var _ewAbs = Math.abs(_ew);
        return React.createElement("span", { style: { color: _vcol(_ewAbs, _ew < 0), fontWeight: _ewAbs >= 10 ? 700 : 600 } }, (_ew > 0 ? "↓" : "↑") + _ewAbs);
      };
      var _hHighCell = function(s) { return s.holdHighVal != null ? React.createElement("span", { style: { color: _vcol(s.holdHighVal, s.holdHighSign === "-"), fontWeight: Number(s.holdHighVal) >= 10 ? 700 : 600 } }, (s.holdHighSign === "+" ? "↓" : s.holdHighSign === "-" ? "↑" : "") + s.holdHighVal) : _dash; };
      var _hConfCell = function(s) { return s.holdWidth != null ? React.createElement("span", { style: { color: _vcol(s.holdWidth, s.holdWidthSign === "-"), fontWeight: Number(s.holdWidth) >= 10 ? 700 : 600 } }, (s.holdWidthSign === "-" ? "↑" : s.holdWidthSign === "+" ? "↓" : "↕") + s.holdWidth) : _dash; };
      var _hEwCell = function(s, alpha) {
        if (alpha == null || s.holdWidth == null || s.holdWidth === "") return _dash;
        var _hcf = s.holdWidthSign === "-" ? Number(s.holdWidth) : s.holdWidthSign === "+" ? -Number(s.holdWidth) : 0;
        var _ewH = alpha - _hcf;
        if (_ewH === 0) return React.createElement("span", { style: { color: "#888" } }, "0");
        var _ewHAbs = Math.abs(_ewH);
        return React.createElement("span", { style: { color: _vcol(_ewHAbs, _ewH < 0), fontWeight: _ewHAbs >= 10 ? 700 : 600 } }, (_ewH > 0 ? "↓" : "↑") + _ewHAbs);
      };
      var header = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, opts.icon + " " + opts.title)
      );
      if (rows.length === 0) {
        return React.createElement("div", { style: { padding: "10px 12px", background: "#fff" } }, header,
          React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "12px 0", fontSize: 12 } }, "記録なし"));
      }
      var bodyRows = [];
      rows.forEach(function(grpRow, gi) {
        var recs = grpRow.recs.slice().sort(function(a, b) {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return (a.signal.time || "").localeCompare(b.signal.time || "");
        });
        recs.forEach(function(r, ri) {
          var s = r.signal;
          var aiBase = _elAlphaInfo(r, data);
          var aAlpha = _ovA != null ? _ovA : aiBase.alpha;
          var aCut = _ovC != null ? _ovC : aiBase.cutLine;
          var isMiss = _elDynResult(s, aAlpha, aCut) === "miss";
          var _stpP = _elPlanIsStop(s, aAlpha, aCut);
          var _stpH1 = !_stpP && _elHoldIsStop(s, aAlpha, aCut);
          var _stpH2 = !_stpP && !_stpH1 && _elHas2Data(s) && !_elH2Miss(s, aAlpha) && _elHoldIsStop2(s, aAlpha, aCut);
          var _bandI = (s.osVal != null && s.osVal !== "") ? _elOsBandIdxV2(s.osVal) : null;
          var _ek = "sigdflat::" + r.stock + "_" + r.signal.id;
          var _on = sigSubExpand === _ek;
          var _dp = r.date.split("-");
          var _dow = ["日","月","火","水","木","金","土"][new Date(+_dp[0], +_dp[1]-1, +_dp[2]).getDay()];
          var _topB = (gi > 0 && ri === 0) ? "3px solid #c8a26a" : "1px solid #f0ede8";
          var _td = function(content, extra) { return React.createElement("td", { style: Object.assign({ padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: _topB, fontVariantNumeric: "tabular-nums" }, extra || {}) }, content); };
          bodyRows.push(React.createElement("tr", {
            key: _ek,
            onClick: function() { setSigSubExpand(_on ? null : _ek); },
            style: { background: _on ? "#FFF7ED" : "transparent", cursor: "pointer" }
          },
            _td((_on ? "▶ " : "") + r.date.slice(5) + "(" + _dow + ")", { textAlign: "left", paddingLeft: 8, fontWeight: 700 }),
            _td(s.time || _dash, { color: "#666" }),
            _td(r.stock, { color: "#9A3412", fontWeight: 700 }),
            _td(_osCell(s)),
            _td(_elHoldMaxHighCell(s)),
            _td(_bandI != null
              ? React.createElement("span", { style: { display: "inline-block", padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700, color: "#fff", background: _EL_OS_BANDS_V2[_bandI].color, whiteSpace: "nowrap" } }, _EL_OS_BANDS_V2[_bandI].label)
              : _dash),
            _td(_elOutcomeCell(s, aAlpha, aCut))
          ));
          if (_on) {
            bodyRows.push(React.createElement("tr", { key: _ek + "_card" },
              React.createElement("td", { colSpan: 7, style: { padding: "4px 8px 8px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
                React.createElement(EntryLogCard, { record: r, alpha: aAlpha, cutLine: aCut, data: data, onEdit: handleEdit, onGoDate: handleGoDate })
              )
            ));
          }
        });
      });
      return React.createElement("div", { style: { padding: "10px 12px", background: "#fff" } },
        header,
        React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "1行=1エントリー（日付順）／値は水準線比。OS帯＝OS1値の帯（A20円〜…E0〜4円の色分け）。H中最高値＝OS〜H2で出た最高値（×除く・括弧内は×含む最高値）。実現結果＝E未達/×見送り/利益/損失/損切り。行タップで明細"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { background: "#f5f4f0" } },
                _hh("日付", { textAlign: "left", paddingLeft: 8 }), _hh("時間"), _hh("銘柄"), _hh("OS値"), _hh("H中最高値"), _hh("OS帯"), _hh("実現結果")
              )
            ),
            React.createElement("tbody", null, bodyRows)
          )
        )
      );
    };

    
    var renderTimeSubTab, renderDateSubTab, renderStockSubTab, renderDiffSubTab;


    renderTimeSubTab = function() {
      var rows = slotStats.map(function(ss) { return { key: ss.slot[0], label: ss.slot[0] + "〜" + ss.slot[1], recs: ss.recs }; });
      return _sigRichTable({ title: "時間帯別集計", icon: "⏰", headLabel: "時間帯", rows: rows, expandPrefix: "time_" });
    };
    renderDateSubTab = function() {
      var byDate2 = {};
      grp.records.forEach(function(r) { if (!byDate2[r.date]) byDate2[r.date] = []; byDate2[r.date].push(r); });
      var dkeys = Object.keys(byDate2).sort(function(a, b) { return b.localeCompare(a); });
      var dateRows = dkeys.map(function(dk) { var _dp = dk.split("-"); var _dow = ["日","月","火","水","木","金","土"][new Date(+_dp[0], +_dp[1]-1, +_dp[2]).getDay()]; return { key: dk, label: dk + " (" + _dow + ")", recs: byDate2[dk] }; });
      var _byDow = { 1: [], 2: [], 3: [], 4: [], 5: [] }; var _dowLabel = ["", "月", "火", "水", "木", "金"];
      grp.records.forEach(function(r) { var _dp = r.date.split("-"); var _wd = new Date(+_dp[0], +_dp[1]-1, +_dp[2]).getDay(); if (_wd >= 1 && _wd <= 5) _byDow[_wd].push(r); });
      var dowRows = [1,2,3,4,5].map(function(wd) { return { key: "dow" + wd, label: _dowLabel[wd] + "曜", recs: _byDow[wd] }; });
      return React.createElement(React.Fragment, null,
        _sigDateFlat({ title: "日別集計", icon: "📅", headLabel: "日付", rows: dateRows }),
        React.createElement("div", { style: { borderTop: "1px solid #f0ede8" } }, _sigRichTable({ title: "曜日別集計", icon: "📆", headLabel: "曜日", rows: dowRows, expandPrefix: null }))
      );
    };
    renderStockSubTab = function() {
      var byStock2 = {};
      grp.records.forEach(function(r) { if (!byStock2[r.stock]) byStock2[r.stock] = []; byStock2[r.stock].push(r); });
      var skeys = Object.keys(byStock2).sort(function(a, b) { return byStock2[b].length - byStock2[a].length; });
      var rows = skeys.map(function(sk) { return { key: sk, label: sk, recs: byStock2[sk], labelColor: "#9A3412" }; });
      return _sigRichTable({ title: "銘柄別集計", icon: "📈", headLabel: "銘柄", rows: rows, expandPrefix: "stock_" });
    };
    renderDiffSubTab = function() {
      var DIFF_LABEL = { A: "A（20円〜）", B: "B（15〜19円）", C: "C（10〜14円）", D: "D（5〜9円）", E: "E（0〜4円）" };
      var DIFF_COLOR = { A: "#1E8449", B: "#9A3412", C: "#7C3AED", D: "#0E7490", E: "#BE185D" };
      var mk = function(field) { var m = { A: [], B: [], C: [], D: [], E: [], "__none__": [] }; grp.records.forEach(function(r) { var v = r.signal[field] || "__none__"; if (!m[v]) m[v] = []; m[v].push(r); }); return m; };
      var rowsOf = function(m) { return ["A","B","C","D","E","__none__"].filter(function(k) { return (m[k] || []).length > 0; }).map(function(k) { return { key: k, label: k === "__none__" ? "未設定" : DIFF_LABEL[k], recs: m[k], labelColor: DIFF_COLOR[k] || "#aaa" }; }); };
      var byEnt = mk("difficulty"); var byTp = mk("tpDifficulty");
      var hasTp = grp.records.some(function(r) { return r.signal.tpDifficulty; });
      return React.createElement(React.Fragment, null,
        _sigRichTable({ title: "予想OS度別", icon: "🎚", headLabel: "予想OS度", rows: rowsOf(byEnt), expandPrefix: "diff_" }),
        hasTp ? React.createElement("div", { style: { borderTop: "1px solid #f0ede8" } }, _sigRichTable({ title: "利確難易度別", icon: "🎯", headLabel: "難易度", rows: rowsOf(byTp), expandPrefix: "tpdiff_" })) : null
      );
    };

    return React.createElement("div", null,
      addBar,
      
      React.createElement("div", { style: { display: "flex", gap: 0, overflowX: "auto", borderBottom: "2px solid #e0ddd6", marginBottom: 0 } },
        keys.map(function(k) {
          var g = byTag[k];
          var on = k === curKey;
          var st = _calcD(g.records);
          return React.createElement("button", {
            key: k,
            onClick: function() { setSigTab(k); setTimeFil(null); setSigSubExpand(null); },
            style: {
              padding: "8px 14px", fontSize: 12, fontWeight: 700,
              background: on ? "#FFEDD5" : "#fafaf8",
              border: "none", borderBottom: on ? "2.5px solid #9A3412" : "2.5px solid transparent",
              color: on ? "#9A3412" : "#888", cursor: "pointer", whiteSpace: "nowrap",
              display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 1, marginBottom: -2
            }
          },
            React.createElement("span", null, "🎯 " + g.label),
            React.createElement("span", { style: { fontSize: 10, fontWeight: 500, color: on ? "#9A3412" : "#aaa" } },
              st.total + "戦")
          );
        })
      ),
      
      isCardEditing
        ? React.createElement("div", { style: { padding: "10px 12px", background: "#EEF6FF", display: "flex", alignItems: "center", gap: 8, border: "1px solid #e0ddd6", borderTop: "none" } },
            React.createElement("input", {
              type: "text", value: editingSigText,
              onChange: function(e) { setEditingSigText(e.target.value); },
              onKeyDown: function(e) {
                if (e.key === "Enter") {
                  if (_renameSignalTagMaster(curKey, editingSigText)) { setEditingSigIdx(null); setEditingSigText(""); }
                } else if (e.key === "Escape") { setEditingSigIdx(null); setEditingSigText(""); }
              },
              autoFocus: true,
              style: { flex: 1, padding: "5px 8px", fontSize: 14, fontWeight: 700, border: "1.5px solid #6366F1", borderRadius: 5, outline: "none", color: "#9A3412", background: "#fff" }
            }),
            React.createElement("button", {
              onClick: function() { if (_renameSignalTagMaster(curKey, editingSigText)) { setEditingSigIdx(null); setEditingSigText(""); } },
              style: { padding: "4px 12px", fontSize: 12, fontWeight: 700, background: "#10B981", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", flexShrink: 0 }
            }, "💾 保存"),
            React.createElement("button", {
              onClick: function() { setEditingSigIdx(null); setEditingSigText(""); },
              style: { padding: "4px 10px", fontSize: 12, fontWeight: 700, background: "#888", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", flexShrink: 0 }
            }, "✕")
          )
        : React.createElement("div", {
            style: { padding: "10px 12px", background: grp.isCustom ? "#EEF2FF" : "#FFEDD5",
              border: "1px solid #e0ddd6", borderTop: "none",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start" }
          },
            React.createElement("div", { style: { flex: 1, minWidth: 0 } },
              React.createElement("div", { style: { fontSize: 11, color: "#555", lineHeight: 1.6 } },
                "全体: " + stats.total + "戦"
              ),
              ent.length > 0 && React.createElement("div", { style: { fontSize: 10, color: "#666", marginTop: 1 } },
                "├ 実エントリー: " + ent.length + "戦" +
                (entSt.sumPnl !== 0 ? " 実pnl " + (entSt.sumPnl > 0 ? "+" : "") + entSt.sumPnl.toLocaleString() + "円" : "")
              ),
              skp.length > 0 && React.createElement("div", { style: { fontSize: 10, color: "#666" } },
                "└ 見送り: " + skp.length + "戦"
              ),
              (function() {
                var _osRsg = grp.records.filter(function(r) { return r.signal.osVal != null; });
                if (!_osRsg.length) return null;
                var _osAsg = Math.round(_osRsg.reduce(function(a, r) { return a + Number(r.signal.osVal); }, 0) / _osRsg.length * 10) / 10;
                return React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 2 } },
                  "平均OS値: " + _osAsg + "\u5186  (" + _osRsg.length + "件入力済)");
              })()
            ),
            !grp.isCustom && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 8 } },
              React.createElement("button", {
                title: "名前変更",
                onClick: function() { if (editingSigIdx !== null) return; setEditingSigIdx(sigIdx); setEditingSigText(curKey); },
                style: { padding: "3px 9px", fontSize: 13, background: "rgba(255,255,255,0.75)", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", color: "#555" }
              }, "✎"),
              React.createElement("button", {
                title: "削除",
                onClick: function() { if (editingSigIdx !== null) return; _deleteSignalTagMaster(curKey); },
                style: { padding: "3px 9px", fontSize: 13, background: "rgba(255,255,255,0.75)", border: "1px solid #fca5a5", borderRadius: 4, cursor: "pointer", color: "#dc2626" }
              }, "×")
            )
          ),

      React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", padding: "12px", background: "#FFF7ED", border: "1px solid #e0ddd6", borderTop: "none" } },
        _sigKpiCard("件数", stats.total + "戦", "#333", ent.length > 0 ? "実" + ent.length + "/見送" + skp.length : null),
        _sigKpiCard("平均OS値", grpOs ? grpOs.avg + "円" : "—", "#9A3412", grpOs ? "OS入力 " + grpOs.n + "件" : null),
        _sigKpiCard("OS中央値", grpOs ? grpOs.med + "円" : "—", "#9A3412", grpOs ? grpOs.min + "〜" + grpOs.max + "円" : null),
        _sigKpiCard("最頻OS値", grpOs ? grpOs.mode.val + "円" : "—", "#9A3412", grpOs ? "×" + grpOs.mode.n + "回" : null),
        _sigKpiCard("損切り", grpSs.any + "回", grpSs.any > 0 ? "#1E8449" : "#bbb", grpSs.rate != null ? "率" + grpSs.rate + "%（想" + grpSs.plan + "・H1 " + grpSs.h1 + "・H2 " + grpSs.h2 + "）" : null),
        _sigKpiCard("E未達", (stats.miss || 0) + "件", stats.miss ? "#7C3AED" : "#bbb", "α>OS値")
      ),

      !grp.isCustom && React.createElement("div", { style: { border: "1px solid #e0ddd6", borderTop: "none" } },
        React.createElement("div", null,
          React.createElement("div", {
            onClick: function() { setOpenSigDefs(function(prev) { var n = Object.assign({}, prev); var key2 = curKey + "__sit"; if (n[key2]) delete n[key2]; else n[key2] = true; return n; }); },
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", cursor: "pointer", userSelect: "none",
              background: openSigDefs[curKey + "__sit"] ? "#FFF7ED" : "#fdfcfa",
              borderBottom: openSigDefs[curKey + "__sit"] ? "1px solid #f0ede8" : "none" }
          },
            React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } },
              "📍 シチュエーション" + (sigDef.situation && sigDef.situation.replace(/<[^>]*>/g, "").trim() ? " ✓" : "")),
            React.createElement("span", { style: { fontSize: 11, color: "#bbb" } }, openSigDefs[curKey + "__sit"] ? "▲" : "▼")
          ),
          openSigDefs[curKey + "__sit"] && React.createElement("div", { style: { padding: "8px 12px", background: "#fffdf5" } },
            React.createElement(MemoEditableField, { key: "sigdef_sit_" + curKey, html: sigDef.situation || "",
              onSave: function(h) { saveSignalDef(curKey, "situation", h); },
              placeholder: "このシグナルが発生する場面・相場状況を記述", autoEdit: false, guardOwner: "sigdef_sit_" + curKey })
          )
        ),
        React.createElement("div", null,
          React.createElement("div", {
            onClick: function() { setOpenSigDefs(function(prev) { var n = Object.assign({}, prev); var key2 = curKey + "__ent"; if (n[key2]) delete n[key2]; else n[key2] = true; return n; }); },
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", cursor: "pointer", userSelect: "none",
              background: openSigDefs[curKey + "__ent"] ? "#FFF7ED" : "#fdfcfa",
              borderBottom: openSigDefs[curKey + "__ent"] ? "1px solid #f0ede8" : "none" }
          },
            React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } },
              "🔑 エントリー条件" + (sigDef.entryConditions && sigDef.entryConditions.replace(/<[^>]*>/g, "").trim() ? " ✓" : "")),
            React.createElement("span", { style: { fontSize: 11, color: "#bbb" } }, openSigDefs[curKey + "__ent"] ? "▲" : "▼")
          ),
          openSigDefs[curKey + "__ent"] && React.createElement("div", { style: { padding: "8px 12px", background: "#fffdf5" } },
            React.createElement(MemoEditableField, { key: "sigdef_ent_" + curKey, html: sigDef.entryConditions || "",
              onSave: function(h) { saveSignalDef(curKey, "entryConditions", h); },
              placeholder: "エントリーの具体的な条件・トリガーを記述", autoEdit: false, guardOwner: "sigdef_ent_" + curKey })
          )
        )
      ),
      
      React.createElement("div", { style: { marginTop: 12 } },
        [["time", renderTimeSubTab], ["date", renderDateSubTab], ["stock", renderStockSubTab], ["diff", renderDiffSubTab]].map(function(_rs) {
          return React.createElement("div", { key: _rs[0],
            style: { border: "1px solid #e0ddd6", borderRadius: 8, overflow: "hidden", marginBottom: 12 } },
            _rs[1]()
          );
        })
      ),
      React.createElement("div", { style: { fontSize: 11, color: "#999", padding: "8px 14px 4px", lineHeight: 1.7 } },
        "【表の見方】OS分布バー＝OS値の帯別件数（左から 0〜4／5〜9／10〜14／15〜19／20円〜）。損切り＝想定（OS値−α≧損切り値）・H1高値・H2高値のいずれかで損切りライン到達した回数で、内訳「想/H1/H2」はどの段階で起きたか。E未達＝α>OS値でエントリー不成立。"
      )
    );
  };

  
  var renderPnlView = function() {
    
    var _pnlBase = _elPnlPeriodFilter(allRecords, pnlPeriod, pnlFrom, pnlTo)
      .filter(function(r) { return _elIsEntered(r.signal, r.item); });

    var _pnlSum = _pnlBase.reduce(function(acc, r) {
      var v = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
      return acc + (v != null ? v : 0);
    }, 0);
    var _pnlWin  = _pnlBase.filter(function(r) { return r.signal.result === "ok"; }).length;
    var _pnlLoss = _pnlBase.filter(function(r) { return r.signal.result === "ng"; }).length;
    var _pnlWinRate = (_pnlWin + _pnlLoss) > 0 ? Math.round(100 * _pnlWin / (_pnlWin + _pnlLoss)) : null;
    var _pnlAvgWin = (function() {
      var ws = _pnlBase.filter(function(r) { return r.signal.result === "ok" && r.signal.realizedPnl != null; });
      if (!ws.length) return null;
      return Math.round(ws.reduce(function(a, r) { return a + (_elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) || 0); }, 0) / ws.length);
    })();
    var _pnlAvgLoss = (function() {
      var ls = _pnlBase.filter(function(r) { return r.signal.result === "ng" && r.signal.realizedPnl != null; });
      if (!ls.length) return null;
      return Math.round(ls.reduce(function(a, r) { return a + (_elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) || 0); }, 0) / ls.length);
    })();
    var _pnlRR = (_pnlAvgWin != null && _pnlAvgLoss != null && _pnlAvgLoss < 0)
      ? Math.round(10 * _pnlAvgWin / Math.abs(_pnlAvgLoss)) / 10 : null;
    var _pnlGrade = _profitGradeFromPnl(_pnlSum, _pnlBase.length);
    var _pnlGS = _GRADE_STYLE[_pnlGrade] || _GRADE_STYLE.Z;

    
    var _pnlWithVal = _pnlBase.filter(function(r) { return r.signal.realizedPnl != null; });
    var _pnlBest  = _pnlWithVal.length ? _pnlWithVal.reduce(function(a, b) {
      return (_elSignedVal(b.signal.realizedPnl, b.signal.realizedPnlSign) || 0) > (_elSignedVal(a.signal.realizedPnl, a.signal.realizedPnlSign) || 0) ? b : a;
    }) : null;
    var _pnlWorst = _pnlWithVal.length ? _pnlWithVal.reduce(function(a, b) {
      return (_elSignedVal(b.signal.realizedPnl, b.signal.realizedPnlSign) || 0) < (_elSignedVal(a.signal.realizedPnl, a.signal.realizedPnlSign) || 0) ? b : a;
    }) : null;


    var _pnlAllRecs = _elPnlPeriodFilter(allRecords, pnlPeriod, pnlFrom, pnlTo);
    var _planSum = 0, _holdSum = 0, _realSumAll = 0, _hold2Sum = 0, _hold2Cnt = 0;
    var _daySet = {}, _realDaySet = {};
    _pnlAllRecs.forEach(function(r) {
      var ai = _elAlphaInfo(r, data);
      var pp = _elDynPlanned(r.signal, ai.alpha, ai.cutLine);
      var hp = _elDynHold(r.signal, ai.alpha, ai.cutLine);
      if (pp != null) { _planSum += pp; _daySet[r.date] = 1; }
      var _h1y = _elHold1TotParts(r.signal, ai.alpha, ai.cutLine); if (_h1y.main != null) { _holdSum += _h1y.main; }
      var _h2tA = _elHold2TotParts(r.signal, ai.alpha, ai.cutLine); if (_h2tA.main != null) { _hold2Sum += _h2tA.main; _hold2Cnt++; }
      if (_elIsEntered(r.signal, r.item)) {
        var rv = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
        if (rv != null) { _realSumAll += rv; _realDaySet[r.date] = 1; }
      }
    });
    var _nDays = Object.keys(_daySet).length;
    var _nRealDays = Object.keys(_realDaySet).length;
    var _avgPlanDay = _nDays > 0 ? Math.round(_planSum / _nDays) : null;
    var _avgHoldDay = _nDays > 0 ? Math.round(_holdSum / _nDays) : null;
    var _avgHold2Day = (_nDays > 0 && _hold2Cnt > 0) ? Math.round(_hold2Sum / _nDays) : null;
    var _avgRealDay = _nRealDays > 0 ? Math.round(_realSumAll / _nRealDays) : null;
    var _avgCol = function(v) { return v == null ? "#888" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _avgFmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円/日"; };

    
    var _byGroup = {};
    _pnlBase.forEach(function(r) {
      var k = pnlBreak === "stock" ? r.stock : r.date;
      if (!_byGroup[k]) _byGroup[k] = { pnl: 0, count: 0, win: 0, loss: 0 };
      var v = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
      _byGroup[k].pnl += (v != null ? v : 0);
      _byGroup[k].count += 1;
      if (r.signal.result === "ok") _byGroup[k].win += 1;
      if (r.signal.result === "ng") _byGroup[k].loss += 1;
    });
    
    var _groupKeys = Object.keys(_byGroup).sort(function(a, b) {
      if (pnlBreak === "stock") return _byGroup[b].pnl - _byGroup[a].pnl;
      return b.localeCompare(a);
    });

    
    var _pnlSorted = _pnlBase.slice().sort(function(a, b) {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.signal.time || "").localeCompare(a.signal.time || "");
    });

    
    var _cumRecs = _pnlBase.slice().sort(function(a, b) {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.signal.time || "").localeCompare(b.signal.time || "");
    });
    var _cumTotal = 0;
    var _cumVals = _cumRecs.map(function(r) {
      var v = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) || 0;
      _cumTotal += v;
      return _cumTotal;
    });

    
    var _renderCumChart = function() {
      if (_cumVals.length < 2) return null;
      var W = 200, H = 40, PAD = 4;
      var minV = Math.min.apply(null, _cumVals), maxV = Math.max.apply(null, _cumVals);
      var range = maxV - minV || 1;
      var toX = function(i) { return PAD + (i / (_cumVals.length - 1)) * (W - PAD * 2); };
      var toY = function(v) { return PAD + (1 - (v - minV) / range) * (H - PAD * 2); };
      var pts = _cumVals.map(function(v, i) { return toX(i) + "," + toY(v); }).join(" ");
      var zeroY = toY(0);
      var isPos = _cumVals[_cumVals.length - 1] >= 0;
      return React.createElement("svg", { width: W, height: H, style: { display: "block" } },
        
        React.createElement("line", { x1: PAD, y1: zeroY, x2: W - PAD, y2: zeroY,
          stroke: "#ddd", strokeWidth: 1, strokeDasharray: "2,2" }),
        React.createElement("polyline", { fill: "none",
          stroke: isPos ? "#C0392B" : "#1E8449",
          strokeWidth: 1.5, points: pts })
      );
    };

    var _PNL_PERIODS = [
      ["today", "今日"], ["week", "今週"], ["month", "今月"],
      ["year", "今年"], ["all", "全期間"], ["custom", "選択"]
    ];
    var _BREAK_OPTIONS = [["date", "日別"], ["stock", "銘柄別"]];

    var _BtnStyle = function(on, col) { return {
      padding: "5px 10px", fontSize: 12, fontWeight: 600, borderRadius: 5,
      border: on ? "1.5px solid " + (col || "#1a1a1a") : "1px solid #ddd",
      background: on ? (col || "#1a1a1a") : "#fff",
      color: on ? "#fff" : "#666", cursor: "pointer"
    }; };

    return React.createElement("div", { style: { paddingTop: 4 } },
      
      React.createElement("div", {
        style: { display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }
      },
        React.createElement("span", { style: { fontSize: 11, color: "#888", fontWeight: 700, whiteSpace: "nowrap" } }, "期間:"),
        _PNL_PERIODS.map(function(kv) {
          return React.createElement("button", {
            key: kv[0], onClick: function() { setPnlPeriod(kv[0]); },
            style: _BtnStyle(pnlPeriod === kv[0])
          }, kv[1]);
        })
      ),
      pnlPeriod === "custom" && React.createElement("div", {
        style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 10, flexWrap: "wrap",
          background: "#f5f4f0", padding: "8px 10px", borderRadius: 6 }
      },
        React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "開始:"),
        React.createElement("input", { type: "date", value: pnlFrom,
          onChange: function(e) { setPnlFrom(e.target.value); },
          style: { padding: "5px 8px", fontSize: 12, border: "1px solid #ddd", borderRadius: 4 } }),
        React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "〜 終了:"),
        React.createElement("input", { type: "date", value: pnlTo,
          onChange: function(e) { setPnlTo(e.target.value); },
          style: { padding: "5px 8px", fontSize: 12, border: "1px solid #ddd", borderRadius: 4 } })
      ),

      
      React.createElement("div", {
        style: { background: _pnlGS.bg, border: "1.5px solid " + _pnlGS.border,
          borderRadius: 10, padding: "12px 16px", marginBottom: 12 }
      },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: "#444" } }, "実現損益合計"),
          pnlPeriod === "today" && React.createElement("span", {
            style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: "50%", background: _pnlGS.bg,
              color: _pnlGS.color, border: "2px solid " + _pnlGS.border, fontWeight: 800, fontSize: 14 }
          }, _pnlGrade),
          pnlPeriod === "today" && React.createElement("span", { style: { fontSize: 10, color: _pnlGS.color } }, "(" + (_GRADE_DESC[_pnlGrade] || "") + ")")
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 10, flexWrap: "wrap" } },
          React.createElement("div", { style: { fontSize: 28, fontWeight: 800, color: _pnlSum >= 0 ? "#C0392B" : "#1E8449" } },
            (_pnlSum > 0 ? "+" : "") + _pnlSum.toLocaleString() + " 円"),
          _renderCumChart()
        ),
        React.createElement("div", { style: { display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13 } },
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "取引 "),
            React.createElement("span", { style: { fontWeight: 700 } }, _pnlBase.length, " 件")),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "勝/負 "),
            React.createElement("span", { style: { fontWeight: 700, color: "#C0392B" } }, _pnlWin, "勝"),
            React.createElement("span", { style: { fontWeight: 700, color: "#1E8449" } }, _pnlLoss, "敗"),
            _pnlWinRate != null && React.createElement("span", { style: { color: "#555", marginLeft: 4 } }, "(", _pnlWinRate, "%)")),
          _pnlAvgWin != null && React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "平均益 "),
            React.createElement("span", { style: { fontWeight: 700, color: "#C0392B" } }, "+" + _pnlAvgWin.toLocaleString() + "円")),
          _pnlAvgLoss != null && React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "平均損 "),
            React.createElement("span", { style: { fontWeight: 700, color: "#1E8449" } }, _pnlAvgLoss.toLocaleString() + "円")),
          _pnlRR != null && React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "損益比 "),
            React.createElement("span", { style: { fontWeight: 700, color: _pnlRR >= 1 ? "#C0392B" : "#1E8449" } }, _pnlRR + " : 1"))
        ),

        React.createElement("div", { style: { display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13, marginTop: 8, paddingTop: 8, borderTop: "1px dashed " + _pnlGS.border } },
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "1日平均 EP損益 "),
            React.createElement("span", { style: { fontWeight: 800, color: _avgCol(_avgPlanDay) } }, _avgFmt(_avgPlanDay))),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "1日平均 H１結果損益 "),
            React.createElement("span", { style: { fontWeight: 800, color: _avgCol(_avgHoldDay) } }, _avgFmt(_avgHoldDay))),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "1日平均 H２結果損益 "),
            React.createElement("span", { style: { fontWeight: 800, color: _avgCol(_avgHold2Day) } }, _avgHold2Day != null ? _avgFmt(_avgHold2Day) : "—")),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "1日平均 実現損益 "),
            React.createElement("span", { style: { fontWeight: 800, color: _avgCol(_avgRealDay) } }, _avgFmt(_avgRealDay))),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "対象 "),
            React.createElement("span", { style: { fontWeight: 700 } }, _nDays + "日"))
        ),
        React.createElement("div", { style: { fontSize: 10, color: "#999", marginTop: 4 } },
          "※ 1日平均＝期間内の合計÷記録のある日数（単独・結果は全シグナル基準、実現は実エントリーのみ・100株換算）"),

        (_pnlBest || _pnlWorst) && React.createElement("div", {
          style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }
        },
          _pnlBest && (function() {
            var bv = _elSignedVal(_pnlBest.signal.realizedPnl, _pnlBest.signal.realizedPnlSign);
            return React.createElement("div", {
              style: { flex: 1, background: "#FDECEA", border: "1px solid #FFCDD2", borderRadius: 6, padding: "6px 10px", fontSize: 11 }
            },
              React.createElement("div", { style: { color: "#C0392B", fontWeight: 700, marginBottom: 2 } }, "🏆 ベスト取引"),
              React.createElement("div", { style: { fontWeight: 700, color: "#C0392B", fontSize: 13 } }, _tradeAlphaChip(_pnlBest.signal), (bv > 0 ? "+" : "") + (bv || 0).toLocaleString() + "円"),
              React.createElement("div", { style: { color: "#555", marginTop: 2 } },
                React.createElement("button", {
                  onClick: function() { handleGoStock(_pnlBest.stock); },
                  style: { background: "none", border: "none", padding: 0, cursor: "pointer", color: "#C0392B", fontWeight: 700, fontSize: 11, textDecoration: "underline" }
                }, _pnlBest.stock),
                " ", _pnlBest.date)
            );
          })(),
          _pnlWorst && _pnlBest !== _pnlWorst && (function() {
            var wv = _elSignedVal(_pnlWorst.signal.realizedPnl, _pnlWorst.signal.realizedPnlSign);
            return React.createElement("div", {
              style: { flex: 1, background: "#EAF3DE", border: "1px solid #A9DFBF", borderRadius: 6, padding: "6px 10px", fontSize: 11 }
            },
              React.createElement("div", { style: { color: "#1E8449", fontWeight: 700, marginBottom: 2 } }, "📉 ワースト取引"),
              React.createElement("div", { style: { fontWeight: 700, color: "#1E8449", fontSize: 13 } }, _tradeAlphaChip(_pnlWorst.signal), (wv > 0 ? "+" : "") + (wv || 0).toLocaleString() + "円"),
              React.createElement("div", { style: { color: "#555", marginTop: 2 } },
                React.createElement("button", {
                  onClick: function() { handleGoStock(_pnlWorst.stock); },
                  style: { background: "none", border: "none", padding: 0, cursor: "pointer", color: "#1E8449", fontWeight: 700, fontSize: 11, textDecoration: "underline" }
                }, _pnlWorst.stock),
                " ", _pnlWorst.date)
            );
          })()
        )
      ),

      _pnlBase.length > 0 && (function() {
        var _ev = Math.round(_pnlSum / _pnlBase.length);
        var _grossWin = 0, _grossLoss = 0;
        _pnlWithVal.forEach(function(r) { var v = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign) || 0; if (v > 0) _grossWin += v; else if (v < 0) _grossLoss += v; });
        var _pf = _grossLoss < 0 ? Math.round(_grossWin / Math.abs(_grossLoss) * 100) / 100 : null;
        var _maxW = 0, _maxL = 0, _cW = 0, _cL = 0;
        _cumRecs.forEach(function(r) { var res = r.signal.result; if (res === "ok") { _cW++; _cL = 0; if (_cW > _maxW) _maxW = _cW; } else if (res === "ng") { _cL++; _cW = 0; if (_cL > _maxL) _maxL = _cL; } });
        return React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 } },
          _elvKpiCard("期待値", _elvYen(_ev), _elvPnlCol(_ev), "実現1件平均"),
          _elvKpiCard("PF", _pf != null ? "×" + _pf : (_grossWin > 0 ? "∞" : "—"), _pf != null ? (_pf >= 1 ? "#C0392B" : "#1E8449") : "#888", "利益÷損失"),
          _elvKpiCard("総利益", "+" + _grossWin.toLocaleString() + "円", "#C0392B", _pnlWin + "勝"),
          _elvKpiCard("総損失", _grossLoss.toLocaleString() + "円", "#1E8449", _pnlLoss + "敗"),
          _elvKpiCard("最大連勝", _maxW + "連", _maxW > 0 ? "#C0392B" : "#bbb"),
          _elvKpiCard("最大連敗", _maxL + "連", _maxL > 0 ? "#1E8449" : "#bbb")
        );
      })(),

      _pnlBase.length > 0 && React.createElement("div", {
        style: { display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }
      },
        React.createElement("span", { style: { fontSize: 11, color: "#888", fontWeight: 700 } }, "集計:"),
        _BREAK_OPTIONS.map(function(kv) {
          var on = pnlBreak === kv[0];
          return React.createElement("button", {
            key: kv[0], onClick: function() { setPnlBreak(kv[0]); },
            style: { padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 4,
              border: on ? "1.5px solid #6366F1" : "1px solid #ddd",
              background: on ? "#EEF2FF" : "#fff",
              color: on ? "#4338CA" : "#888", cursor: "pointer" }
          }, kv[1]);
        }),
        React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4 } },
          pnlBreak === "date" ? "※ 日付クリックで取引タブへ" : "※ 銘柄クリックで銘柄別記録へ")
      ),
      _pnlBase.length > 0 && React.createElement("div", { style: { marginBottom: 14, overflowX: "auto" } },
        React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#f5f4f0", borderBottom: "1px solid #e0ddd6" } },
              React.createElement("th", { style: { padding: "6px 8px", textAlign: "left", fontWeight: 700 } },
                pnlBreak === "stock" ? "銘柄" : "日付"),
              React.createElement("th", { style: { padding: "6px 8px", textAlign: "right", fontWeight: 700 } }, "損益"),
              React.createElement("th", { style: { padding: "6px 8px", textAlign: "center", fontWeight: 700 } }, "勝/負"),
              React.createElement("th", { style: { padding: "6px 8px", textAlign: "center", fontWeight: 700 } }, "件数"),
              React.createElement("th", { style: { padding: "6px 8px", textAlign: "center", fontWeight: 700 } }, "G")
            )
          ),
          React.createElement("tbody", null,
            _groupKeys.map(function(k) {
              var g = _byGroup[k];
              var gr = _profitGradeFromPnl(g.pnl, g.count);
              var gs = _GRADE_STYLE[gr] || _GRADE_STYLE.Z;
              var isClickable = pnlBreak === "date"
                ? typeof onSelectDate === "function"
                : typeof onSelectStock === "function";
              return React.createElement("tr", {
                key: k,
                onClick: isClickable ? function() {
                  if (pnlBreak === "date") handleGoDate(k, "trades");
                  else handleGoStock(k);
                } : undefined,
                style: { borderBottom: "1px solid #eee",
                  cursor: isClickable ? "pointer" : "default",
                  transition: "background .1s" },
                onMouseEnter: isClickable ? function(e) { e.currentTarget.style.background = "#F0F4FF"; } : undefined,
                onMouseLeave: isClickable ? function(e) { e.currentTarget.style.background = ""; } : undefined
              },
                React.createElement("td", { style: { padding: "7px 8px", fontWeight: 600 } },
                  isClickable && React.createElement("span", {
                    style: { color: pnlBreak === "date" ? "#4338CA" : "#1E8449",
                      textDecoration: "underline", textDecorationStyle: "dotted" }
                  }, pnlBreak === "date" ? _fmtDow(k) : k),
                  !isClickable && (pnlBreak === "date" ? _fmtDow(k) : k)
                ),
                React.createElement("td", { style: { padding: "7px 8px", textAlign: "right", fontWeight: 700,
                  color: g.pnl >= 0 ? "#C0392B" : "#1E8449" } },
                  (g.pnl > 0 ? "+" : "") + g.pnl.toLocaleString() + "円"),
                React.createElement("td", { style: { padding: "7px 8px", textAlign: "center" } },
                  React.createElement("span", { style: { color: "#C0392B", fontWeight: 600 } }, g.win, "勝"),
                  " / ",
                  React.createElement("span", { style: { color: "#1E8449", fontWeight: 600 } }, g.loss, "敗")),
                React.createElement("td", { style: { padding: "7px 8px", textAlign: "center", color: "#555" } }, g.count),
                React.createElement("td", { style: { padding: "7px 8px", textAlign: "center" } },
                  React.createElement("span", {
                    style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 20, height: 20, borderRadius: "50%", background: gs.bg,
                      color: gs.color, border: "1.5px solid " + gs.border, fontWeight: 800, fontSize: 11 }
                  }, gr))
              );
            })
          )
        )
      ),

      
      _pnlBase.length === 0
        ? React.createElement("div", { style: { textAlign: "center", color: "#bbb", fontSize: 13, padding: 24 } },
            "この期間の実エントリー記録がありません")
        : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } },
            React.createElement("div", { style: { fontSize: 11, color: "#999", marginBottom: 4 } },
              "明細（" + _pnlBase.length + "件）"),
            _pnlSorted.map(function(r, i) {
              var v = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
              var isBest  = _pnlBest  === r;
              var isWorst = _pnlWorst === r && _pnlBest !== _pnlWorst;
              return React.createElement("div", {
                key: r.stock + "_" + (r.signal.id || i),
                style: { display: "flex", gap: 6, alignItems: "center", padding: "8px 10px",
                  background: isBest ? "#FFF5F5" : isWorst ? "#F0FBF4" : "#fff",
                  border: "1px solid " + (isBest ? "#F5C6CB" : isWorst ? "#A9DFBF" : "#e0ddd6"),
                  borderRadius: 7, fontSize: 12, flexWrap: "wrap" }
              },
                
                React.createElement("button", {
                  onClick: function() { handleGoDate(r.date, "trades"); },
                  title: r.date + " の取引タブを開く",
                  style: { background: "none", border: "none", padding: 0, cursor: "pointer",
                    fontWeight: 700, fontSize: 12, color: "#4338CA",
                    textDecoration: "underline", textDecorationStyle: "dotted", minWidth: 78 }
                }, _fmtDow(r.date)),
                r.signal.time && React.createElement("span", { style: { color: "#888", minWidth: 34, fontSize: 11 } }, r.signal.time),
                
                React.createElement("button", {
                  onClick: function() { handleGoStock(r.stock); },
                  title: r.stock + " の銘柄別記録を開く",
                  style: { background: "none", border: "none", padding: 0, cursor: "pointer",
                    fontWeight: 700, fontSize: 13, color: "#1E8449",
                    textDecoration: "underline", textDecorationStyle: "dotted" }
                }, r.stock),
                React.createElement("span", { style: {
                  fontSize: 10, padding: "2px 5px", borderRadius: 4,
                  background: r.signal.tradeType === "空売" ? "#FCEBEB" : "#EAF3DE",
                  color: r.signal.tradeType === "空売" ? "#C0392B" : "#1E8449"
                } }, r.signal.tradeType || ""),
                React.createElement("span", { style: { fontSize: 10, padding: "2px 5px", borderRadius: 4,
                  background: "#f5f4f0", color: "#666" } }, _elTagLabel(r.signal)),
                v != null
                  ? React.createElement("span", { style: { fontWeight: 700,
                      color: v >= 0 ? "#C0392B" : "#1E8449", marginLeft: "auto", display: "inline-flex", alignItems: "center" } },
                      _tradeAlphaChip(r.signal),
                      (v > 0 ? "+" : "") + v.toLocaleString() + "円")
                  : React.createElement("span", { style: { color: "#bbb", marginLeft: "auto", fontSize: 11 } }, "損益未入力"),
                r.signal.result && React.createElement("span", {
                  style: { fontSize: 11, padding: "2px 6px", borderRadius: 4,
                    background: r.signal.result === "ok" ? "#D5F5E3" : "#FCEBEB",
                    color: r.signal.result === "ok" ? "#1E8449" : "#C0392B", fontWeight: 700 }
                }, r.signal.result === "ok" ? "○勝" : "✕負"),
                
                React.createElement("button", {
                  onClick: function() { setEditTarget(r); },
                  title: "この記録を編集",
                  style: { background: "none", border: "1px solid #ddd", borderRadius: 4,
                    fontSize: 11, color: "#888", cursor: "pointer", padding: "2px 6px",
                    marginLeft: 2 }
                }, "✎")
              );
            })
          )
    );
  };

  
  var SelStyle = {
    padding: "6px 8px", fontSize: 11, borderRadius: 5,
    border: "1px solid #ddd", background: "#fff"
  };

  return React.createElement("div", {
    style: { padding: 0 }
  },
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }
    },
      React.createElement("button", {
        onClick: onBack,
        style: { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555", padding: "4px 8px" }
      }, "←"),
      React.createElement("div", { style: { fontSize: 17, fontWeight: 700, flex: 1 } }, "📖 エントリー記録帳"),
      React.createElement("button", {
        onClick: function() { setShowForm(true); },
        style: { padding: "8px 12px", fontSize: 12, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }
      }, "＋ 新規記録")
    ),
    
    React.createElement("div", {
      style: { display: "flex", gap: 4, marginBottom: 10, borderBottom: "1px solid #e0ddd6", overflowX: "auto" }
    },
      [["date", "📅 日別"], ["stock", "📈 銘柄別"], ["signal", "🎯 シグナル別"], ["pnl", "💰 損益"], ["os", "📊 OS値"]].map(function(kv) {
        var on = view === kv[0];
        return React.createElement("button", {
          key: kv[0],
          onClick: function() { setView(kv[0]); setExpandKey(null); },
          style: {
            padding: "8px 12px", fontSize: 12, fontWeight: 700,
            background: "none", border: "none", cursor: "pointer",
            borderBottom: on ? "2px solid #1a1a1a" : "2px solid transparent",
            color: on ? "#1a1a1a" : "#888",
            whiteSpace: "nowrap"
          }
        }, kv[1]);
      })
    ),
    
    React.createElement("div", {
      style: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }
    },
      React.createElement("span", { style: { fontSize: 10, color: "#999", fontWeight: 700 } }, "絞込:"),
      React.createElement("select", { value: period, onChange: function(e) { setPeriod(e.target.value); }, style: SelStyle },
        [["all", "全期間"], ["1w", "今週"], ["1m", "1ヶ月"], ["3m", "3ヶ月"], ["6m", "6ヶ月"], ["1y", "1年"]].map(function(kv) {
          return React.createElement("option", { key: kv[0], value: kv[0] }, kv[1]);
        })
      ),
      React.createElement("select", { value: entFil, onChange: function(e) { setEntFil(e.target.value); }, style: SelStyle },
        [["all", "実エントリー:全て"], ["entered", "あり"], ["skipped", "見送り"]].map(function(kv) {
          return React.createElement("option", { key: kv[0], value: kv[0] }, kv[1]);
        })
      ),
      React.createElement("select", { value: stockFil, onChange: function(e) { setStockFil(e.target.value); }, style: SelStyle },
        [React.createElement("option", { key: "__all__", value: "" }, "銘柄:全て")].concat(
          allStocks.map(function(s) { return React.createElement("option", { key: s, value: s }, s); })
        )
      ),
      React.createElement("select", { value: resFil, onChange: function(e) { setResFil(e.target.value); }, style: SelStyle },
        [["", "結果:全て"], ["ok", "○ 勝ち"], ["ng", "✕ 負け"]].map(function(kv) {
          return React.createElement("option", { key: kv[0] || "none", value: kv[0] }, kv[1]);
        })
      ),
      (stockFil || resFil || entFil !== "all" || period !== "all") && React.createElement("button", {
        onClick: function() { setStockFil(""); setResFil(""); setEntFil("all"); setPeriod("all"); },
        style: { padding: "4px 8px", fontSize: 10, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#666" }
      }, "クリア")
    ),
    
    view === "date" && React.createElement(EntryStatsSummary, { records: filtered, data: data, showWin: true }),
    
    view === "date" && React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
        background: "#f5f4f0", borderRadius: 6, marginTop: 8, marginBottom: 10,
        fontSize: 12, flexWrap: "wrap" }
    },
      React.createElement("span", { style: { color: "#666", fontWeight: 600, flexShrink: 0 } }, "並び替え:"),
      React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
        [["time", "⏱ 時間順"], ["custom", "🖐 カスタム"], ["category", "🏷 カテゴリ別"]].map(function(kv) {
          var val = kv[0], label = kv[1];
          var on = sortMode === val;
          return React.createElement("button", {
            key: val,
            onClick: function() { setSortMode(val); },
            style: {
              padding: "4px 10px", fontSize: 12, fontWeight: 600,
              border: on ? "1.5px solid #FB923C" : "1px solid #ddd",
              background: on ? "#FFEDD5" : "#fff",
              color: on ? "#9A3412" : "#888",
              borderRadius: 4, cursor: "pointer"
            }
          }, label);
        })
      ),
      sortMode === "custom" && React.createElement("span", {
        style: { fontSize: 10, color: "#666", marginLeft: "auto" }
      }, "⋮⋮ ドラッグ または ▲▼ で並び替え")
    ),
    
    view === "date" && renderDateView(),
    view === "stock" && renderStockView(),
    view === "signal" && renderSignalView(),
    view === "pnl" && renderPnlView(),
    view === "os" && renderOsView(),
    
    (showForm || editTarget) && React.createElement(EntryRecordForm, {
      data: data, save: save,
      initial: editTarget,
      onClose: handleFormClose
    })
  );
}










