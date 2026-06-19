function _fmIsBizDay(d, holidaySet) {
  var dow = new Date(d + "T00:00:00").getDay();
  if (dow === 0 || dow === 6) return false;          
  if (holidaySet && holidaySet[d]) return false;     
  return true;
}

function _fmPrevValue(foreignMarkets, currentDate, name, type, holidaySet) {
  if (!foreignMarkets) return null;
  var dates = Object.keys(foreignMarkets)
    .filter(function(d) { return d < currentDate && _fmIsBizDay(d, holidaySet); })
    .sort().reverse();
  for (var i = 0; i < dates.length; i++) {
    var day = foreignMarkets[dates[i]];
    if (!day) continue;
    var arr = type === "indicator" ? (day.indicators || []) : (day.stocks || []);
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].name === name && typeof arr[j].value === "number") return arr[j].value;
    }
  }
  return null;
}

function _fmPrevValues(foreignMarkets, currentDate, name, type, n, holidaySet) {
  if (!foreignMarkets) return [];
  var dates = Object.keys(foreignMarkets)
    .filter(function(d) { return d <= currentDate && _fmIsBizDay(d, holidaySet); })
    .sort().reverse().slice(0, n);
  dates.reverse();
  return dates.map(function(d) {
    var day = foreignMarkets[d];
    if (!day) return null;
    var arr = type === "indicator" ? (day.indicators || []) : (day.stocks || []);
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].name === name && typeof arr[j].value === "number") return arr[j].value;
    }
    return null;
  });
}

function _fmPrevDates(foreignMarkets, currentDate, n, holidaySet) {
  if (!foreignMarkets) return [];
  return Object.keys(foreignMarkets)
    .filter(function(d) { return d <= currentDate && _fmIsBizDay(d, holidaySet); })
    .sort().reverse().slice(0, n).reverse();
}


function _FMSparkline(_p) {
  var values = _p.values, dates = _p.dates || [],
      w = _p.w || 120, h = _p.h || 52,
      fixedYMin = _p.yMin, fixedYMax = _p.yMax,
      variant = _p.variant || 1;
  var _hs = useState(null), hoverIdx = _hs[0], setHoverIdx = _hs[1];
  var uidRef = useRef(null);
  if (!uidRef.current) uidRef.current = "fm" + Math.random().toString(36).slice(2, 8);
  var uid = uidRef.current;
  var indexed = [];
  for (var _i = 0; _i < values.length; _i++) {
    if (typeof values[_i] === "number") indexed.push({ v: values[_i], date: dates[_i] || null });
  }
  if (indexed.length < 2) return null;
  var nums = indexed.map(function(d) { return d.v; });
  var lastVal = nums[nums.length - 1], firstVal = nums[0];
  var color = lastVal > firstVal ? "#DC2626" : lastVal < firstVal ? "#16A34A" : "#bbb";
  var pad = 4;
  var min = fixedYMin !== undefined ? fixedYMin : Math.min.apply(null, nums);
  var max = fixedYMax !== undefined ? fixedYMax : Math.max.apply(null, nums);
  var range = max - min;
  var fmtD = function(d) {
    if (!d) return "";
    var m = d.match(/\d{4}-(\d{2})-(\d{2})/);
    return m ? (m[1] * 1) + "/" + m[2] + "（" + DAYS_JP[new Date(d + "T00:00:00").getDay()] + "）" : d;
  };
  var startDate = indexed[0].date, endDate = indexed[indexed.length - 1].date;
  var dateRow = React.createElement("div", {
    style: { display: "flex", justifyContent: "space-between", fontSize: 9,
      color: "#c0bdba", marginTop: 1, padding: "0 " + pad + "px", boxSizing: "border-box", lineHeight: 1 }
  },
    React.createElement("span", null, fmtD(startDate)),
    React.createElement("span", null, fmtD(endDate))
  );
  if (range === 0) {
    return React.createElement("div", { style: { position: "relative", width: w } },
      React.createElement("svg", { width: w, height: h, style: { display: "block" } },
        React.createElement("line", { x1: pad, y1: h / 2, x2: w - pad, y2: h / 2,
          stroke: color, strokeWidth: 1.5, strokeLinecap: "round" })
      ), dateRow
    );
  }
  var pts = indexed.map(function(d, i) {
    var x = indexed.length > 1 ? pad + (i / (indexed.length - 1)) * (w - pad * 2) : w / 2;
    var y = h - pad - ((d.v - min) / range) * (h - pad * 2);
    return { x: x, y: y, v: d.v, date: d.date };
  });
  var linePath = pts.map(function(p, pi) {
    return (pi === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1);
  }).join(" ");
  var areaPath = linePath + " L" + pts[pts.length-1].x.toFixed(1) + "," + (h - pad + 1)
              + " L" + pts[0].x.toFixed(1) + "," + (h - pad + 1) + " Z";
  var hovPt = (hoverIdx !== null && pts[hoverIdx]) ? pts[hoverIdx] : null;
  var svgChildren = [];

  if (variant === 1) {
    
    var fillColor1 = lastVal > firstVal ? "rgba(220,38,38,0.13)" : lastVal < firstVal ? "rgba(22,163,74,0.13)" : "rgba(180,180,180,0.1)";
    svgChildren.push(React.createElement("path", { key: "area", d: areaPath, fill: fillColor1, stroke: "none" }));
    svgChildren.push(React.createElement("path", { key: "line", d: linePath, fill: "none", stroke: color,
      strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }));

  } else if (variant === 2) {
    
    var y0 = h - pad - ((0 - min) / range) * (h - pad * 2);
    y0 = Math.max(pad, Math.min(h - pad, y0));
    var clipAboveId = "fmca-" + uid, clipBelowId = "fmcb-" + uid;
    svgChildren.push(React.createElement("defs", { key: "defs" },
      React.createElement("clipPath", { id: clipAboveId },
        React.createElement("rect", { x: 0, y: 0, width: w, height: y0 })
      ),
      React.createElement("clipPath", { id: clipBelowId },
        React.createElement("rect", { x: 0, y: y0, width: w, height: h - y0 + pad })
      )
    ));
    svgChildren.push(React.createElement("path", { key: "fill-above", d: areaPath,
      fill: "rgba(220,38,38,0.18)", stroke: "none", clipPath: "url(#" + clipAboveId + ")" }));
    svgChildren.push(React.createElement("path", { key: "fill-below", d: areaPath,
      fill: "rgba(22,163,74,0.18)", stroke: "none", clipPath: "url(#" + clipBelowId + ")" }));
    svgChildren.push(React.createElement("line", { key: "zeroline",
      x1: pad, y1: y0, x2: w - pad, y2: y0,
      stroke: "#aaa", strokeWidth: 0.8, strokeDasharray: "3,2" }));
    svgChildren.push(React.createElement("path", { key: "line", d: linePath, fill: "none",
      stroke: "#444", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }));

  } else if (variant === 3) {
    
    var minIdx = 0, maxIdx = 0;
    for (var _mi = 1; _mi < pts.length; _mi++) {
      if (pts[_mi].v < pts[minIdx].v) minIdx = _mi;
      if (pts[_mi].v > pts[maxIdx].v) maxIdx = _mi;
    }
    svgChildren.push(React.createElement("path", { key: "line", d: linePath, fill: "none", stroke: color,
      strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }));
    
    svgChildren.push(React.createElement("circle", { key: "s-dot",
      cx: pts[0].x, cy: pts[0].y, r: 2.5, fill: "#fff", stroke: color, strokeWidth: 1.5 }));
    
    svgChildren.push(React.createElement("circle", { key: "e-dot",
      cx: pts[pts.length-1].x, cy: pts[pts.length-1].y, r: 4, fill: color, stroke: "#fff", strokeWidth: 1.5 }));
    
    if (minIdx !== 0 && minIdx !== pts.length - 1) {
      var mx = pts[minIdx].x, my = pts[minIdx].y;
      svgChildren.push(React.createElement("polygon", { key: "min-tri",
        points: mx + "," + (my+5) + " " + (mx-4) + "," + my + " " + (mx+4) + "," + my,
        fill: "#16A34A" }));
    }
    
    if (maxIdx !== 0 && maxIdx !== pts.length - 1) {
      var _mx2 = pts[maxIdx].x, _my2 = pts[maxIdx].y;
      svgChildren.push(React.createElement("polygon", { key: "max-tri",
        points: _mx2 + "," + (_my2-5) + " " + (_mx2-4) + "," + _my2 + " " + (_mx2+4) + "," + _my2,
        fill: "#DC2626" }));
    }
  }

  
  if (hovPt) {
    svgChildren.push(React.createElement("circle", { key: "hov",
      cx: hovPt.x, cy: hovPt.y, r: 3,
      fill: variant === 2 ? "#444" : color, stroke: "#fff", strokeWidth: 1.5 }));
  }

  return React.createElement("div", { style: { position: "relative", width: w, userSelect: "none" } },
    React.createElement("svg", {
      width: w, height: h, style: { display: "block", cursor: "crosshair" },
      onMouseMove: function(e) {
        var rect = e.currentTarget.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var best = 0, bestD = Infinity;
        for (var pi = 0; pi < pts.length; pi++) {
          var dist = Math.abs(pts[pi].x - mx);
          if (dist < bestD) { bestD = dist; best = pi; }
        }
        setHoverIdx(best);
      },
      onMouseLeave: function() { setHoverIdx(null); }
    }, svgChildren),
    hovPt && React.createElement("div", {
      style: {
        position: "absolute", pointerEvents: "none", zIndex: 10,
        left: Math.min(Math.max(0, hovPt.x - 28), w - 58),
        top: hovPt.y > h * 0.55 ? 2 : h - 30,
        background: "rgba(24,24,28,0.86)", color: "#fff",
        fontSize: 9, padding: "2px 5px", borderRadius: 4,
        whiteSpace: "nowrap", lineHeight: 1.6
      }
    },
      React.createElement("div", null, fmtD(hovPt.date)),
      React.createElement("div", null, hovPt.v.toLocaleString(undefined, { maximumFractionDigits: 4 }))
    ),
    dateRow
  );
}
function _toHankaku(s) {
  
  return (s || "").split("").map(function(c) {
    var code = c.charCodeAt(0);
    
    if (code >= 0xFF01 && code <= 0xFF5E) return String.fromCharCode(code - 0xFEE0);
    
    if (code === 0x3000) return " ";
    
    if (code === 0x3002) return ".";
    
    if (code === 0x3001) return ",";
    
    if (code === 0x30FC) return "-";
    return c;
  }).join("");
}
function _fmToHalfWidth(s) { return _toHankaku(s); }

function _FMValueInput(_p) {
  var initVal = _p.initVal, onCommit = _p.onCommit, onEnter = _p.onEnter;
  var _us = useState(initVal != null ? String(initVal) : ""),
    _usS = _slicedToArray(_us, 2), local = _usS[0], setLocal = _usS[1];
  var focusedRef = useRef(false);
  useEffect(function() {
    if (!focusedRef.current) setLocal(initVal != null ? String(initVal) : "");
  }, [initVal]);
  return React.createElement("input", {
    type: "text", inputMode: "decimal", value: local,
    placeholder: "0",
    "data-fminput": "1",
    style: { width: "100%", fontSize: 13, border: "none", outline: "none",
      textAlign: "right", padding: "5px 6px", background: "transparent",
      fontVariantNumeric: "tabular-nums" },
    onChange: function(e) { setLocal(_fmToHalfWidth(e.target.value)); },
    onFocus: function() { focusedRef.current = true; },
    onBlur: function() {
      focusedRef.current = false;
      var n = parseFloat((_fmToHalfWidth(local) || "").replace(/[^\d.\-]/g, ""));
      onCommit(isNaN(n) ? null : n);
    },
    onKeyDown: function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
        if (onEnter) onEnter();
      }
    }
  });
}

function _FMPriceChart(_p) {
  var foreignMarkets = _p.foreignMarkets, name = _p.name, type = _p.type,
      currentDate = _p.currentDate, holidaySet = _p.holidaySet || {};
  var _uPer = useState("1m"), _uPerA = _slicedToArray(_uPer, 2),
      period = _uPerA[0], setPeriod = _uPerA[1];
  var _uHov = useState(null), _uHovA = _slicedToArray(_uHov, 2),
      hovIdx = _uHovA[0], setHovIdx = _uHovA[1];
  var allVals = _fmPrevValues(foreignMarkets, currentDate, name, type, 500, holidaySet);
  var allDates = _fmPrevDates(foreignMarkets, currentDate, 500, holidaySet);
  var allPoints = [];
  for (var _pi = 0; _pi < allVals.length; _pi++) {
    if (typeof allVals[_pi] === "number") allPoints.push({ date: allDates[_pi] || "", value: allVals[_pi] });
  }
  var points = (function() {
    if (period === "all" || !allPoints.length) return allPoints;
    var cutoff = new Date(currentDate + "T00:00:00");
    if (period === "1w") cutoff.setDate(cutoff.getDate() - 7);
    else if (period === "1m") cutoff.setMonth(cutoff.getMonth() - 1);
    else if (period === "3m") cutoff.setMonth(cutoff.getMonth() - 3);
    else if (period === "6m") cutoff.setMonth(cutoff.getMonth() - 6);
    else if (period === "1y") cutoff.setFullYear(cutoff.getFullYear() - 1);
    var cutStr = cutoff.getFullYear() + "-" + String(cutoff.getMonth() + 1).padStart(2, "0") + "-" + String(cutoff.getDate()).padStart(2, "0");
    return allPoints.filter(function(p) { return p.date >= cutStr; });
  })();
  if (points.length < 2) {
    return React.createElement("div", {
      style: { padding: "10px 12px", textAlign: "center", color: "#ccc", fontSize: 11, background: "#fafaf8" }
    }, "データが不足しています");
  }
  var W = 580, H = 150, PL = 56, PR = 10, PT = 8, PB = 26;
  var cW = W - PL - PR, cH = H - PT - PB;
  var n = points.length;
  var vals = points.map(function(p) { return p.value; });
  var minC = Math.min.apply(null, vals), maxC = Math.max.apply(null, vals);
  var rawRange = maxC - minC;
  var pad = Math.max(rawRange * 0.08, maxC > 0 ? maxC * 0.005 : 0.01);
  var yMin = minC - pad, yMax = maxC + pad, yRange = yMax - yMin;
  var toX = function(i) { return n > 1 ? PL + (i / (n - 1)) * cW : PL + cW / 2; };
  var toY = function(v) { return yRange > 0 ? PT + (1 - (v - yMin) / yRange) * cH : PT + cH / 2; };
  var linePath = points.map(function(p, i) { return (i === 0 ? "M" : "L") + toX(i).toFixed(1) + "," + toY(p.value).toFixed(1); }).join(" ");
  var areaPath = linePath + " L" + toX(n-1).toFixed(1) + "," + (PT + cH) + " L" + PL.toFixed(1) + "," + (PT + cH) + " Z";
  var lastVal = points[n-1].value, firstVal = points[0].value;
  var lineColor = lastVal > firstVal ? "#DC2626" : lastVal < firstVal ? "#16A34A" : "#888";
  var gradId = "fmpc_" + name.replace(/[^a-zA-Z0-9]/g, "_") + "_" + period;
  var fmtV = function(v) { return Math.abs(v) < 10 ? v.toFixed(2) : Math.round(v).toLocaleString(); };
  var yTicks = [];
  var _ts = Math.pow(10, Math.floor(Math.log10(rawRange > 0 ? rawRange : 1))) / 2;
  if (_ts === 0) _ts = 0.1;
  for (var _ti = Math.ceil(yMin / _ts) * _ts, _tc = 0; _ti <= yMax && _tc < 8; _ti += _ts, _tc++) yTicks.push(_ti);
  var xLabels = [];
  var lStep = n <= 8 ? 1 : n <= 15 ? 2 : n <= 30 ? 5 : 10;
  points.forEach(function(p, i) { if (i === 0 || i === n - 1 || i % lStep === 0) xLabels.push({ i: i, label: p.date.slice(5, 7) + "/" + p.date.slice(8) }); });
  var hovPt = (hovIdx !== null && hovIdx >= 0 && hovIdx < n) ? points[hovIdx] : null;
  var prevDiff = n >= 2 ? (points[n-1].value - points[n-2].value) : null;
  var periodBtns = [["1w","1週間"], ["1m","1ヶ月"], ["3m","3ヶ月"], ["6m","6ヶ月"], ["1y","1年"], ["all","全期間"]];
  return React.createElement("div", { style: { borderTop: "1px solid #f0ede8", background: "#fff" } },
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "4px 8px 3px", borderBottom: "1px solid #f0ede8", background: "#fafaf8", flexWrap: "wrap", gap: 4 }
    },
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6 } },
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#333" } }, "📈 チャート"),
        prevDiff !== null && React.createElement("span", {
          style: { fontSize: 10, color: prevDiff >= 0 ? "#DC2626" : "#16A34A", fontWeight: 600 }
        }, "前日比 " + (prevDiff >= 0 ? "+" : "") + fmtV(prevDiff))
      ),
      React.createElement("div", { style: { display: "flex", gap: 3 } },
        periodBtns.map(function(kv) {
          var on = period === kv[0];
          return React.createElement("button", {
            key: kv[0],
            onClick: function() { setPeriod(kv[0]); setHovIdx(null); },
            style: { padding: "2px 6px", fontSize: 10, fontWeight: 600,
              border: on ? "1.5px solid #1a1a1a" : "1px solid #ddd",
              background: on ? "#1a1a1a" : "#fff", color: on ? "#fff" : "#888",
              borderRadius: 3, cursor: "pointer" }
          }, kv[1]);
        })
      )
    ),
    React.createElement("div", {
      style: { minHeight: 18, padding: "2px 8px", fontSize: 10, color: "#555",
        background: "#fafaf8", borderBottom: "1px solid #f0ede8", display: "flex", alignItems: "center", gap: 8 }
    },
      hovPt
        ? React.createElement(React.Fragment, null,
            React.createElement("span", { style: { fontWeight: 700 } }, hovPt.date.slice(5, 7) + "/" + hovPt.date.slice(8)),
            React.createElement("span", null, React.createElement("span", { style: { fontWeight: 700, color: "#333" } }, fmtV(hovPt.value)))
          )
        : React.createElement("span", { style: { color: "#ccc" } }, "グラフにカーソルを合わせると詳細表示")
    ),
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("svg", {
        width: W, height: H,
        style: { display: "block", minWidth: W, cursor: "crosshair" },
        onMouseMove: function(e) {
          var rect = e.currentTarget.getBoundingClientRect();
          var mx = e.clientX - rect.left;
          if (mx < PL || mx > PL + cW) { setHovIdx(null); return; }
          setHovIdx(Math.max(0, Math.min(n - 1, Math.round((mx - PL) / cW * (n - 1)))));
        },
        onMouseLeave: function() { setHovIdx(null); }
      },
        yTicks.map(function(tv, ti) {
          var y = toY(tv);
          return React.createElement("g", { key: ti },
            React.createElement("line", { x1: PL, y1: y, x2: PL + cW, y2: y, stroke: "#f0ede8", strokeWidth: 1 }),
            React.createElement("text", { x: PL - 4, y: y + 3, textAnchor: "end", fontSize: 8, fill: "#aaa" }, fmtV(tv))
          );
        }),
        xLabels.map(function(xl) {
          return React.createElement("g", { key: xl.i },
            React.createElement("line", { x1: toX(xl.i), y1: PT + cH, x2: toX(xl.i), y2: PT + cH + 4, stroke: "#ddd", strokeWidth: 1 }),
            React.createElement("text", { x: toX(xl.i), y: H - 2, textAnchor: "middle", fontSize: 8, fill: "#bbb" }, xl.label)
          );
        }),
        React.createElement("defs", null,
          React.createElement("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1" },
            React.createElement("stop", { offset: "0%", stopColor: lineColor, stopOpacity: 0.15 }),
            React.createElement("stop", { offset: "100%", stopColor: lineColor, stopOpacity: 0 })
          )
        ),
        React.createElement("path", { d: areaPath, fill: "url(#" + gradId + ")", stroke: "none" }),
        React.createElement("path", { d: linePath, fill: "none", stroke: lineColor, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }),
        n <= 60 && points.map(function(p, i) {
          return React.createElement("circle", {
            key: i, cx: toX(i), cy: toY(p.value),
            r: hovIdx === i ? 4 : 2, fill: lineColor, stroke: "#fff", strokeWidth: 1
          });
        }),
        hovIdx !== null && React.createElement("g", null,
          React.createElement("line", { x1: toX(hovIdx), y1: PT, x2: toX(hovIdx), y2: PT + cH, stroke: "#888", strokeWidth: 1, strokeDasharray: "3,2" }),
          React.createElement("circle", { cx: toX(hovIdx), cy: toY(points[hovIdx].value), r: 4, fill: lineColor, stroke: "#fff", strokeWidth: 1.5 })
        )
      )
    ),
    React.createElement("div", {
      style: { display: "flex", gap: 12, padding: "3px 8px 4px", borderTop: "1px solid #f0ede8",
        fontSize: 10, color: "#666", flexWrap: "wrap", background: "#fafaf8" }
    },
      React.createElement("span", null, "最高: ", React.createElement("span", { style: { fontWeight: 700, color: "#DC2626" } }, fmtV(maxC))),
      React.createElement("span", null, "最安: ", React.createElement("span", { style: { fontWeight: 700, color: "#16A34A" } }, fmtV(minC))),
      React.createElement("span", null, "直近: ", React.createElement("span", { style: { fontWeight: 700, color: "#333" } }, fmtV(lastVal))),
      React.createElement("span", { style: { color: "#aaa" } }, n + "日分")
    )
  );
}


function _FMHayamihyoTable(_p) {
  var foreignMarkets = _p.foreignMarkets, name = _p.name, type = _p.type,
      currentDate = _p.currentDate, holidaySet = _p.holidaySet || {};
  var _uWO = useState(0), _uWOA = _slicedToArray(_uWO, 2),
      wo = _uWOA[0], setWo = _uWOA[1];

  
  var _fmhFmt = function(s) { return s.replace(/^(\d{4})-(\d{2})-(\d{2})$/, function(_,y,m,d){ return (m*1) + "/" + d; }); };
  var _baseD = new Date(currentDate + "T00:00:00");
  _baseD.setDate(_baseD.getDate() + wo * 14);
  var windowDates = Array.from({ length: 14 }, function(_, i) {
    var d = new Date(_baseD); d.setDate(d.getDate() - 13 + i);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  });
  var weekLabel = _fmhFmt(windowDates[0]) + " 〜 " + _fmhFmt(windowDates[13]);

  var getValue = function(d) {
    var day = foreignMarkets[d]; if (!day) return null;
    var arr = type === "indicator" ? (day.indicators||[]) : (day.stocks||[]);
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].name === name && typeof arr[j].value === "number") return arr[j].value;
    }
    return null;
  };
  var fmtVal = function(v) {
    if (v === null) return "—";
    var abs = Math.abs(v);
    return abs >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 })
         : abs >= 1    ? (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, "")
         : v.toPrecision(4);
  };
  var fmtDiff = function(diff) {
    if (diff === null) return null;
    var abs = Math.abs(diff);
    var s = abs >= 100 ? Math.round(abs).toLocaleString()
          : abs >= 1   ? (Math.round(abs * 100) / 100).toFixed(2).replace(/\.?0+$/, "")
          : abs.toPrecision(3);
    return (diff >= 0 ? "+" : "-") + s;
  };

  return React.createElement("div", { style: { padding: "4px 8px 8px" } },
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8, gap: 8 }
    },
      React.createElement("button", {
        onClick: function(){ setWo(function(o){ return o-1; }); },
        style: { padding: "6px 12px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6,
          cursor: "pointer", color: "#555" }
      }, "＜"),
      React.createElement("span", { style: { fontSize: 12, color: "#888", fontWeight: 600 } }, weekLabel),
      React.createElement("button", {
        onClick: function(){ setWo(function(o){ return o+1; }); },
        style: { padding: "6px 12px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6,
          cursor: "pointer", color: "#555" }
      }, "＞")
    ),
    
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", {
        style: { width: "100%", fontSize: 12, borderCollapse: "collapse" }
      },
        React.createElement("thead", null,
          React.createElement("tr", { style: { background: "#f5f4f0" } },
            ["日付", "数値", "前日比", "前日比(%)"].map(function(h, _hi, _harr) {
              return React.createElement("th", {
                key: h,
                style: { textAlign: h === "日付" ? "left" : "right",
                  padding: "6px 10px", fontWeight: 600, fontSize: 11,
                  color: "#888", whiteSpace: "nowrap",
                  borderRight: _hi < _harr.length - 1 ? "1px solid #e3e0da" : "none" }
              }, h);
            })
          )
        ),
        React.createElement("tbody", null, windowDates.map(function(d) {
          var dow = new Date(d + "T00:00:00").getDay();
          var isSat = dow === 6, isSun = dow === 0;
          var isHL = d === currentDate;
          var isHoliday = !!holidaySet[d];
          var isOff = isSat || isSun || isHoliday;
          var dateColor = isHoliday ? "#9333EA" : isSun ? "#C0392B" : isSat ? "#2874A6" : "inherit";
          var val = isOff ? null : getValue(d);
          var prevVal = isOff ? null : _fmPrevValue(foreignMarkets, d, name, type, holidaySet);
          var diff = (val !== null && prevVal !== null) ? val - prevVal : null;
          var pct  = (diff !== null && prevVal !== 0) ? diff / Math.abs(prevVal) * 100 : null;
          var diffColor = diff === null ? "#bbb" : diff > 0 ? "#DC2626" : diff < 0 ? "#16A34A" : "#888";
          var arrow = diff === null ? "" : diff > 0 ? "▲" : diff < 0 ? "▼" : "→";
          return React.createElement("tr", {
            key: d,
            style: { borderBottom: "1px solid #f0eeea",
              background: isHL ? "#EEF2FF" : "transparent",
              opacity: isOff ? 0.38 : 1 }
          },
            React.createElement("td", {
              style: { padding: "7px 10px", whiteSpace: "nowrap",
                fontWeight: isHL ? 700 : 400, color: dateColor, borderRight: "1px solid #efece7" }
            }, _fmhFmt(d) + "（" + DAYS_JP[dow] + "）" + (isHoliday ? " 休" : "")),
            React.createElement("td", {
              style: { padding: "7px 10px", textAlign: "right",
                fontVariantNumeric: "tabular-nums", fontWeight: val !== null ? 600 : 400,
                color: val !== null ? "#222" : "#ccc", borderRight: "1px solid #efece7" }
            }, fmtVal(val)),
            React.createElement("td", {
              style: { padding: "7px 10px", textAlign: "right",
                fontVariantNumeric: "tabular-nums", color: diffColor, whiteSpace: "nowrap", borderRight: "1px solid #efece7" }
            }, diff !== null ? arrow + " " + fmtDiff(diff) : React.createElement("span", { style: { color: "#ddd" } }, "—")),
            React.createElement("td", {
              style: { padding: "7px 10px", textAlign: "right",
                fontVariantNumeric: "tabular-nums", color: diffColor, whiteSpace: "nowrap" }
            }, pct !== null
              ? React.createElement("span", {
                  style: { background: Math.abs(pct) >= 1 ? (pct > 0 ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)") : "transparent",
                    padding: Math.abs(pct) >= 1 ? "1px 4px" : 0, borderRadius: 3, fontWeight: Math.abs(pct) >= 1 ? 700 : 400 }
                }, (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%")
              : React.createElement("span", { style: { color: "#ddd" } }, "—"))
          );
        }))
      )
    )
  );
}

function ForeignMarketTable(_p) {
  var date = _p.date, data = _p.data, save = _p.save, custom = _p.custom, onOpenSettings = _p.onOpenSettings,
      showSections = _p.showSections || ["indicator", "stock"],
      hideSectionLabel = !!_p.hideSectionLabel;
  var foreignMarkets = data.foreignMarkets || {};
  var fmDay = foreignMarkets[date] || null;
  var defs = custom.foreignMarketDefaults || {};
  var defIndicators = defs.indicators != null ? defs.indicators : DEF_FM_INDICATORS;
  var defStocks = defs.stocks != null ? defs.stocks : DEF_FM_STOCKS;

  var updFm = function(fn) {
    save(function(prev) {
      var prevFm = prev.foreignMarkets || {};
      var prevDay = prevFm[date] || { indicators: [], stocks: [] };
      var newFm = Object.assign({}, prevFm);
      newFm[date] = fn(prevDay);
      return Object.assign({}, prev, { foreignMarkets: newFm });
    });
  };
  var createDefault = function() {
    var ts = Date.now();
    save(function(prev) {
      var prevFm = prev.foreignMarkets || {};
      var newFm = Object.assign({}, prevFm);
      newFm[date] = {
        indicators: defIndicators.map(function(name, i){ return { id: String(ts + i), name: name, value: null }; }),
        stocks: defStocks.map(function(name, i){ return { id: String(ts + 1000 + i), name: name, value: null }; })
      };
      return Object.assign({}, prev, { foreignMarkets: newFm });
    });
  };
  
  useEffect(function() {
    if (!fmDay) createDefault();
  }, [date]); 
  var updArr = function(type, fn) {
    updFm(function(day) {
      var key = type === "indicator" ? "indicators" : "stocks";
      var result = Object.assign({}, day);
      result[key] = fn((day[key] || []).slice());
      return result;
    });
  };
  var addRow = function(type) {
    var name = window.prompt(type === "indicator" ? "指標名を入力" : "銘柄名を入力");
    if (!name || !name.trim()) return;
    updArr(type, function(arr){ return arr.concat([{ id: String(Date.now()), name: name.trim(), value: null }]); });
  };
  var delRow = function(type, id) {
    updArr(type, function(arr){ return arr.filter(function(e){ return e.id !== id; }); });
  };
  var renameRow = function(type, id, newName) {
    var key = type === "indicator" ? "indicators" : "stocks";
    
    var curArr = (fmDay && fmDay[key]) || [];
    var entry = curArr.find(function(e) { return e.id === id; });
    var oldName = entry ? entry.name : null;
    if (!newName || !newName.trim()) return;
    save(function(prev) {
      var prevFm = prev.foreignMarkets || {};
      var newFm = {};
      Object.keys(prevFm).forEach(function(d) {
        var dayData = prevFm[d];
        if (!dayData) { newFm[d] = dayData; return; }
        var arr = (dayData[key] || []).slice();
        arr = arr.map(function(e) {
          
          if (d === date ? e.id === id : (oldName && e.name === oldName)) {
            return Object.assign({}, e, { name: newName.trim() });
          }
          return e;
        });
        newFm[d] = Object.assign({}, dayData, _defineProperty({}, key, arr));
      });
      
      var prevDefs = prev.custom && prev.custom.foreignMarketDefaults;
      var defArr = prevDefs && prevDefs[key === "indicators" ? "indicators" : "stocks"];
      var newCustom = prev.custom;
      if (oldName && defArr) {
        var newDefArr = defArr.map(function(n) { return n === oldName ? newName.trim() : n; });
        newCustom = Object.assign({}, prev.custom, {
          foreignMarketDefaults: Object.assign({}, prevDefs, _defineProperty({}, key === "indicators" ? "indicators" : "stocks", newDefArr))
        });
      }
      return Object.assign({}, prev, { foreignMarkets: newFm, custom: newCustom });
    });
  };
  var commitValue = function(type, id, val) {
    updArr(type, function(arr){
      return arr.map(function(e){ return e.id === id ? Object.assign({}, e, { value: val }) : e; });
    });
  };
  var reorderArr = function(type, fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    var key = type === "indicator" ? "indicators" : "stocks";
    save(function(prev) {
      var prevFm = prev.foreignMarkets || {};
      var prevDay = prevFm[date] || { indicators: [], stocks: [] };
      
      var curArr = (prevDay[key] || []).slice();
      var moved = curArr.splice(fromIdx, 1)[0];
      curArr.splice(toIdx, 0, moved);
      
      var nameOrder = curArr.map(function(x) { return x.name; });
      
      var newFm = {};
      Object.keys(prevFm).forEach(function(d) {
        var dayData = prevFm[d];
        if (!dayData) { newFm[d] = dayData; return; }
        var arr = (dayData[key] || []).slice();
        arr.sort(function(a, b) {
          var ia = nameOrder.indexOf(a.name);
          var ib = nameOrder.indexOf(b.name);
          if (ia === -1) ia = nameOrder.length;
          if (ib === -1) ib = nameOrder.length;
          return ia - ib;
        });
        newFm[d] = Object.assign({}, dayData);
        newFm[d][key] = arr;
      });
      return Object.assign({}, prev, { foreignMarkets: newFm });
    });
  };
  var fmtDiff = function(diff) {
    if (diff == null) return null;
    var abs = Math.abs(diff);
    var str = abs >= 100 ? Math.round(abs).toLocaleString() : (Math.round(abs * 100) / 100).toFixed(2).replace(/\.?0+$/, "");
    return (diff >= 0 ? "+" : "-") + str;
  };
  var iconBtn = { cursor: "pointer", fontSize: 10, color: "#ccc", flexShrink: 0, padding: "1px 3px",
    lineHeight: 1, userSelect: "none", transition: "color .1s" };

  var _uOM = useState({}), _uOMA = _slicedToArray(_uOM, 2),
    openMemos = _uOMA[0], setOpenMemos = _uOMA[1];
  
  var _uDrag = useState(null), _uDragA = _slicedToArray(_uDrag, 2),
    dragState = _uDragA[0], setDragState = _uDragA[1];
  
  var _fmHolidaySet = useMemo(function() {
    return _buildHolidayDateSet(data.trades || {}, (data.custom && data.custom.eventCategories) || []);
  }, [data.trades, data.custom && data.custom.eventCategories]);
  
  var _uSV = useState(function(){ try { return parseInt(localStorage.getItem("fm_sparkline_v")||"1",10)||1; } catch(e){return 1;} }),
      _uSVA = _slicedToArray(_uSV, 2),
      sparklineVariant = _uSVA[0], setSparklineVariant = _uSVA[1];
  var setVariant = function(v) {
    try { localStorage.setItem("fm_sparkline_v", String(v)); } catch(e) {}
    setSparklineVariant(v);
  };
  
  var _uHY = useState({}), _uHYA = _slicedToArray(_uHY, 2),
      openHayamihyos = _uHYA[0], setOpenHayamihyos = _uHYA[1];
  var toggleHayamihyo = function(id) {
    setOpenHayamihyos(function(prev) {
      var n = Object.assign({}, prev);
      if (n[id]) delete n[id]; else n[id] = true;
      return n;
    });
  };

  var commitMemo = function(type, id, memo) {
    updArr(type, function(arr) {
      return arr.map(function(e) { return e.id === id ? Object.assign({}, e, { memo: memo }) : e; });
    });
  };

  var renderSection = function(type, sLabel, sColor, sBg, arr, startIdx) {
    
    var _nameColW = (function() {
      try {
        var _c = document.createElement('canvas');
        var _ctx = _c.getContext('2d');
        _ctx.font = '600 13px -apple-system,"Helvetica Neue",sans-serif';
        var _max = 60;
        arr.forEach(function(e) { var w = _ctx.measureText(e.name).width; if (w > _max) _max = w; });
        return Math.ceil(_max) + 60; 
      } catch(_e) { return 140; }
    })();
    return React.createElement(React.Fragment, null,
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between",
          background: sBg, padding: "5px 8px", borderBottom: "1px solid #e0ddd6" }
      },
        !hideSectionLabel && React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: sColor } }, sLabel),
        React.createElement("button", {
          onClick: function(){ addRow(type); },
          style: { fontSize: 11, padding: "2px 8px", background: "#fff",
            border: "1px solid " + sColor, borderRadius: 4, cursor: "pointer", color: sColor }
        }, "+ 追加")
      ),
      arr.length === 0
        ? React.createElement("div", {
            style: { padding: "6px 10px", fontSize: 12, color: "#bbb", fontStyle: "italic" }
          }, "データなし")
        : React.createElement("div", { style: { padding: "6px 6px 2px" } },
            arr.map(function(entry, entryIdx) {
              var prevVal = _fmPrevValue(foreignMarkets, date, entry.name, type, _fmHolidaySet);
              var diff = (typeof entry.value === "number" && typeof prevVal === "number") ? entry.value - prevVal : null;
              var diffStr = fmtDiff(diff);
              var pct = (diff !== null && prevVal !== 0) ? diff / Math.abs(prevVal) * 100 : null;
              var pctStr = pct !== null ? (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%" : null;
              var diffColor = diff == null ? "#bbb" : diff >= 0 ? "#DC2626" : "#16A34A";
              var arrow = diff == null ? "" : diff > 0 ? "▲" : diff < 0 ? "▼" : "→";
              var hasBigMove = pct !== null && Math.abs(pct) >= 1;
              var _sv50 = _fmPrevValues(foreignMarkets, date, entry.name, type, 50, _fmHolidaySet);
              var _sv22 = _sv50.slice(-22);
              var _sv5  = _sv50.slice(-5);
              
              
              var _makeYRange = function(sv) {
                var nums = sv.filter(function(v) { return typeof v === "number"; });
                return { min: nums.length > 1 ? Math.min.apply(null, nums) : 0,
                         max: nums.length > 1 ? Math.max.apply(null, nums) : 0 };
              };
              var _yr50 = _makeYRange(_sv50);
              var _yr22 = _makeYRange(_sv22);
              var _yr5  = _makeYRange(_sv5);
              var _dates50 = _fmPrevDates(foreignMarkets, date, 50, _fmHolidaySet);
              var _dates22 = _dates50.slice(-22);
              var _dates5  = _dates50.slice(-5);
              var memoIsOpen = !!openMemos[entry.id];
              var isDragSrc = dragState && dragState.type === type && dragState.fromIdx === entryIdx;
              var isDragOver = dragState && dragState.type === type && dragState.overIdx === entryIdx && dragState.fromIdx !== entryIdx;
              return React.createElement("div", {
                key: entry.id,
                style: {
                  border: "1px solid " + (isDragOver ? "#4338CA" : "#e0ddd6"),
                  borderRadius: 8, marginBottom: 6, overflow: "hidden",
                  opacity: isDragSrc ? 0.45 : 1,
                  background: hasBigMove ? (diff > 0 ? "rgba(220,38,38,0.03)" : "rgba(22,163,74,0.03)") : "#fff",
                  transition: "opacity .1s"
                }
              },
                
                React.createElement("div", {
                  draggable: true,
                  onDragStart: function(e) {
                    setDragState({ type: type, fromIdx: entryIdx, overIdx: null });
                    e.dataTransfer.effectAllowed = "move";
                  },
                  onDragOver: function(e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragState && dragState.type === type && dragState.overIdx !== entryIdx) {
                      setDragState(function(ds) { return ds ? Object.assign({}, ds, { overIdx: entryIdx }) : ds; });
                    }
                  },
                  onDrop: function(e) {
                    e.preventDefault();
                    if (dragState && dragState.type === type && dragState.fromIdx !== entryIdx) {
                      reorderArr(type, dragState.fromIdx, entryIdx);
                    }
                    setDragState(null);
                  },
                  onDragEnd: function() { setDragState(null); },
                  style: { display: "flex", alignItems: "stretch", minHeight: 40,
                    borderBottom: "1px solid #f0ede8" }
                },
                  React.createElement("div", {
                    style: { width: 22, flexShrink: 0, display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "grab", color: "#ccc", fontSize: 14,
                      userSelect: "none", touchAction: "none", borderRight: "1px solid #f0ede8" }
                  }, "⋮⋮"),
                  React.createElement("div", {
                    style: { width: _nameColW, flexShrink: 0,
                      padding: "6px 8px", display: "flex", alignItems: "center",
                      gap: 4, boxSizing: "border-box", overflow: "hidden", borderRight: "1px solid #f0ede8" }
                  },
                    React.createElement("span", {
                      style: { fontSize: 13, fontWeight: 600, lineHeight: 1.4,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                    }, entry.name),
                    React.createElement("div", { style: { display: "flex", gap: 0, flexShrink: 0, opacity: 0.5 } },
                      React.createElement("span", {
                        title: "名前変更", style: iconBtn,
                        onClick: function() {
                          var nn = window.prompt("名前を変更", entry.name);
                          if (nn && nn.trim() && nn.trim() !== entry.name) renameRow(type, entry.id, nn.trim());
                        }
                      }, "✎"),
                      React.createElement("span", {
                        title: "削除", style: iconBtn,
                        onClick: function() {
                          if (window.confirm(entry.name + " を削除しますか？")) delRow(type, entry.id);
                        }
                      }, "×")
                    )
                  ),
                  React.createElement("div", {
                    style: { width: 76, flexShrink: 0, borderRight: "1px solid #f0ede8" }
                  },
                    React.createElement(_FMValueInput, {
                      key: entry.id, initVal: entry.value,
                      onCommit: function(v){ commitValue(type, entry.id, v); },
                      onEnter: function() {
                        var inputs = document.querySelectorAll('[data-fminput]');
                        var next = inputs[startIdx + entryIdx + 1];
                        if (next) next.focus();
                      }
                    })
                  ),
                  React.createElement("div", {
                    style: { width: 90, flexShrink: 0, padding: "3px 8px", display: "flex",
                      flexDirection: "column", alignItems: "flex-end", justifyContent: "center",
                      gap: 1, borderRight: "1px solid #f0ede8" }
                  },
                    React.createElement("div", {
                      style: { display: "flex", alignItems: "baseline", gap: 2, justifyContent: "flex-end" }
                    },
                      arrow && React.createElement("span", {
                        style: { fontSize: 9, color: diffColor, lineHeight: 1 }
                      }, arrow),
                      React.createElement("span", {
                        style: { fontSize: 12, fontWeight: 700, color: diffColor, fontVariantNumeric: "tabular-nums" }
                      }, diffStr || (typeof entry.value === "number" ? "—" : ""))
                    ),
                    pctStr && React.createElement("span", {
                      style: { fontSize: 10, fontWeight: 600, color: diffColor,
                        fontVariantNumeric: "tabular-nums",
                        background: hasBigMove ? (diff > 0 ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)") : "transparent",
                        padding: hasBigMove ? "0 3px" : 0, borderRadius: 3 }
                    }, pctStr)
                  ),
                  React.createElement("div", {
                    style: { width: 46, flexShrink: 0, display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", borderRight: "1px solid #f0ede8",
                      background: openHayamihyos[entry.id] ? "#EEF2FF" : "transparent" },
                    onClick: function() { toggleHayamihyo(entry.id); },
                    title: "早見表"
                  },
                    React.createElement("span", {
                      style: { fontSize: 12, lineHeight: 1,
                        color: openHayamihyos[entry.id] ? "#4338CA" : "#555", fontWeight: 600 }
                    }, "早見表")
                  ),
                  React.createElement("div", {
                    style: { width: 32, flexShrink: 0, display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer" },
                    onClick: function() {
                      setOpenMemos(function(prev) {
                        var n = Object.assign({}, prev);
                        if (n[entry.id]) delete n[entry.id]; else n[entry.id] = true;
                        return n;
                      });
                    },
                    title: "メモ"
                  },
                    React.createElement("span", {
                      style: { fontSize: 13, lineHeight: 1,
                        color: (entry.memo && entry.memo.trim()) ? sColor : "#d0cfc8" }
                    }, "💬")
                  )
                ),
                React.createElement(_FMPriceChart, {
                  foreignMarkets: foreignMarkets,
                  name: entry.name,
                  type: type,
                  currentDate: date,
                  holidaySet: _fmHolidaySet
                }),
                
                openHayamihyos[entry.id] && React.createElement("div", {
                  style: { borderTop: "1px solid #e0ddd6", background: "#f9f8f5" }
                },
                  React.createElement("div", {
                    style: { display: "flex", justifyContent: "flex-end", padding: "4px 8px 0" }
                  },
                    React.createElement("button", {
                      onClick: function() { toggleHayamihyo(entry.id); },
                      style: { fontSize: 11, color: "#888", background: "none", border: "none",
                        cursor: "pointer", padding: "2px 4px" }
                    }, "畳む ▲")
                  ),
                  React.createElement(_FMHayamihyoTable, {
                    foreignMarkets: foreignMarkets,
                    name: entry.name,
                    type: type,
                    currentDate: date,
                    holidaySet: _fmHolidaySet
                  })
                ),
                
                memoIsOpen && React.createElement("div", {
                  style: { padding: "4px 8px 6px", background: "#fffdf5",
                    borderTop: "1px solid #f0ede8" }
                },
                  React.createElement("textarea", {
                    value: entry.memo || "",
                    onChange: function(e) { commitMemo(type, entry.id, e.target.value); },
                    placeholder: "メモ（相場状況・ニュース等）",
                    rows: 2,
                    style: { width: "100%", fontSize: 12, border: "1px solid #e0ddd6", borderRadius: 4,
                      padding: "4px 6px", resize: "vertical", fontFamily: "inherit",
                      boxSizing: "border-box", outline: "none", background: "#fff", lineHeight: 1.5 }
                  })
                )
              );
            })
          )
    );
  };

  var tableHeader = null;
  var topBar = React.createElement("div", {
    style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }
  },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
      React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: "#333" } },
        "🌏 外国市場",
        React.createElement("span", { style: { fontSize: 12, fontWeight: 400, color: "#999", marginLeft: 8 } }, _fmtDow(date))
      ),
      React.createElement("a", {
        href: "https://www.google.com/finance/beta?hl=ja",
        target: "_blank",
        rel: "noopener noreferrer",
        style: { fontSize: 11, fontWeight: 600, color: "#4285F4", textDecoration: "none",
          padding: "3px 8px", border: "1px solid #4285F4", borderRadius: 4,
          background: "#F0F4FF", whiteSpace: "nowrap", lineHeight: 1 }
      }, "🔗 Google Financeで確認")
    ),
    React.createElement("button", {
      onClick: onOpenSettings,
      title: "デフォルト設定",
      style: { fontSize: 12, padding: "4px 10px", background: "#f5f4f0",
        border: "1px solid #ddd", borderRadius: 5, cursor: "pointer", color: "#555" }
    }, "⚙️ 設定")
  );
  
  if (!fmDay) {
    return React.createElement("div", { style: { padding: "16px 0" } }, topBar);
  }
  var indicators = fmDay.indicators || [];
  var stocks = fmDay.stocks || [];

  return React.createElement("div", null,
    topBar,
    React.createElement("div", {
      style: { border: "1px solid #e0ddd6", borderRadius: 8, overflow: "hidden", background: "#fff" }
    },
      tableHeader,
      (showSections.indexOf("indicator") >= 0) && renderSection("indicator", "📊 指標", "#4338CA", "#EEF2FF", indicators, 0),
      (showSections.indexOf("stock") >= 0) && renderSection("stock", "🏢 銘柄", "#15803D", "#F0FDF4", stocks, showSections.indexOf("indicator") >= 0 ? indicators.length : 0)
    )
  );
}

function ForeignMarketSettingsModal(_p) {
  var custom = _p.custom, save = _p.save, onClose = _p.onClose;
  useModalBack(true, onClose, "fm-settings");
  var defs = custom.foreignMarketDefaults || {};
  var indicators = defs.indicators != null ? defs.indicators : DEF_FM_INDICATORS;
  var stocks = defs.stocks != null ? defs.stocks : DEF_FM_STOCKS;
  var _usaI = useState(""), _usaSI = _slicedToArray(_usaI, 2), addInd = _usaSI[0], setAddInd = _usaSI[1];
  var _usaS = useState(""), _usaSS2 = _slicedToArray(_usaS, 2), addStk = _usaSS2[0], setAddStk = _usaSS2[1];
  var updDefs = function(fn) {
    save(function(prev) {
      var pc = prev.custom || {};
      var pd = pc.foreignMarketDefaults || {};
      return Object.assign({}, prev, { custom: Object.assign({}, pc, { foreignMarketDefaults: fn(pd) }) });
    });
  };
  var addItem = function(type, name) {
    if (!name || !name.trim()) return;
    var n = name.trim();
    updDefs(function(d) {
      var arr = (d[type] || []).slice();
      if (arr.indexOf(n) >= 0) return d;
      arr.push(n);
      var u = Object.assign({}, d); u[type] = arr; return u;
    });
  };
  var delItem = function(type, idx) {
    updDefs(function(d) {
      var arr = (d[type] || []).slice(); arr.splice(idx, 1);
      var u = Object.assign({}, d); u[type] = arr; return u;
    });
  };
  var renameItem = function(type, idx, newName) {
    if (!newName || !newName.trim()) return;
    updDefs(function(d) {
      var arr = (d[type] || []).slice(); arr[idx] = newName.trim();
      var u = Object.assign({}, d); u[type] = arr; return u;
    });
  };
  var moveItem = function(type, idx, dir) {
    updDefs(function(d) {
      var arr = (d[type] || []).slice();
      var ni = idx + dir;
      if (ni < 0 || ni >= arr.length) return d;
      var tmp = arr[ni]; arr[ni] = arr[idx]; arr[idx] = tmp;
      var u = Object.assign({}, d); u[type] = arr; return u;
    });
  };
  var _btnMove = { padding: "3px 7px", fontSize: 11, background: "#f5f4f0",
    border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#555", lineHeight: 1 };
  var renderDefSection = function(type, label, arr, addVal, setAddVal) {
    return React.createElement("div", { style: { marginBottom: 22 } },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 8 } }, label),
      arr.map(function(item, idx) {
        return React.createElement("div", { key: idx, style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 5 } },
          React.createElement("button", {
            style: Object.assign({}, _btnMove, { opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? "default" : "pointer" }),
            disabled: idx === 0,
            onClick: function(){ moveItem(type, idx, -1); }
          }, "↑"),
          React.createElement("button", {
            style: Object.assign({}, _btnMove, { opacity: idx === arr.length - 1 ? 0.3 : 1, cursor: idx === arr.length - 1 ? "default" : "pointer" }),
            disabled: idx === arr.length - 1,
            onClick: function(){ moveItem(type, idx, 1); }
          }, "↓"),
          React.createElement("input", {
            type: "text", value: item,
            style: { flex: 1, fontSize: 13, padding: "5px 8px", border: "1px solid #ddd", borderRadius: 5, outline: "none" },
            onChange: function(e){ renameItem(type, idx, e.target.value); }
          }),
          React.createElement("button", {
            style: { padding: "4px 10px", fontSize: 11, background: "#FFF0F0",
              border: "1px solid #FCC", borderRadius: 4, cursor: "pointer", color: "#C0392B" },
            onClick: function(){ delItem(type, idx); }
          }, "削除")
        );
      }),
      React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 6 } },
        React.createElement("input", {
          type: "text", placeholder: "追加...", value: addVal,
          style: { flex: 1, fontSize: 13, padding: "5px 8px", border: "1.5px dashed #bbb", borderRadius: 5, outline: "none" },
          onChange: function(e){ setAddVal(e.target.value); },
          onKeyDown: function(e){ if (e.key === "Enter") { addItem(type, addVal); setAddVal(""); } }
        }),
        React.createElement("button", {
          style: { padding: "5px 14px", fontSize: 12, background: "#1a1a1a",
            color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" },
          onClick: function(){ addItem(type, addVal); setAddVal(""); }
        }, "追加")
      )
    );
  };
  return React.createElement("div", {
    style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.45)", zIndex: 9000,
      display: "flex", alignItems: "center", justifyContent: "center" },
    onClick: onClose
  },
    React.createElement("div", {
      style: { background: "#fff", borderRadius: 12, padding: 24,
        width: "min(480px, 92vw)", maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)" },
      onClick: function(e){ e.stopPropagation(); }
    },
      React.createElement("div", {
        style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }
      },
        React.createElement("span", { style: { fontSize: 15, fontWeight: 700 } },
          "🌏 外国市場 デフォルト設定"),
        React.createElement("button", {
          onClick: onClose,
          style: { border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#888" }
        }, "×")
      ),
      React.createElement("p", { style: { fontSize: 12, color: "#999", marginBottom: 18 } },
        "「データを追加」ボタンで作成する表のデフォルト項目を設定します。"),
      renderDefSection("indicators", "📊 指標", indicators, addInd, setAddInd),
      renderDefSection("stocks", "🏢 銘柄", stocks, addStk, setAddStk)
    )
  );
}
function StockTabs(_ref34) {
  var stocks = _ref34.stocks,
    active = _ref34.active,
    onSelect = _ref34.onSelect,
    onReorder = _ref34.onReorder,
    onAdd = _ref34.onAdd,
    onDel = _ref34.onDel,
    onRename = _ref34.onRename,
    onRestore = _ref34.onRestore,
    onPurge = _ref34.onPurge,
    hiddenStocks = _ref34.hiddenStocks,
    hasData = _ref34.hasData,
    exclCount = _ref34.exclCount,
    fmActive = _ref34.fmActive,
    onFmSelect = _ref34.onFmSelect,
    hasFmData = _ref34.hasFmData;
  var _useState105 = useState(null),
    _useState106 = _slicedToArray(_useState105, 2),
    drag = _useState106[0],
    setDrag = _useState106[1],
    _useState107 = useState(null),
    _useState108 = _slicedToArray(_useState107, 2),
    over = _useState108[0],
    setOver = _useState108[1];
  var _useState109 = useState(null),
    _useState110 = _slicedToArray(_useState109, 2),
    stockDelTarget = _useState110[0],
    setStockDelTarget = _useState110[1];
  var _uSAO = useState(false), _uSAOS = _slicedToArray(_uSAO, 2),
    addOpen = _uSAOS[0], setAddOpen = _uSAOS[1];
  var _uSAV = useState(""), _uSAVS = _slicedToArray(_uSAV, 2),
    addVal = _uSAVS[0], setAddVal = _uSAVS[1];
  var addInputRef = useRef(null);
  var _uSHD = useState(false), _uSHDS = _slicedToArray(_uSHD, 2),
    hiddenDlgOpen = _uSHDS[0], setHiddenDlgOpen = _uSHDS[1];
  var _uSPT = useState(null), _uSPTS = _slicedToArray(_uSPT, 2),
    purgeTarget = _uSPTS[0], setPurgeTarget = _uSPTS[1];
  useEffect(function(){ if (addOpen && addInputRef.current) addInputRef.current.focus(); }, [addOpen]);
  var touchState = useRef({
    on: false,
    timer: null
  });
  var doReorder = function doReorder(f, t) {
    if (f == null || t == null || f === t) return;
    var a = _toConsumableArray(stocks);
    var _a$splice = a.splice(f, 1),
      _a$splice2 = _slicedToArray(_a$splice, 1),
      it = _a$splice2[0];
    a.splice(t, 0, it);
    onReorder && onReorder(a);
  };
  var tStart = function tStart(e, i) {
    touchState.current = {
      on: false,
      timer: setTimeout(function () {
        touchState.current.on = true;
        setDrag(i);
      }, 160)
    };
  };
  var tMove = function tMove(e) {
    if (!touchState.current.on) return;
    e.preventDefault();
    var _e$touches$7 = e.touches[0],
      clientX = _e$touches$7.clientX,
      clientY = _e$touches$7.clientY;
    var el = document.elementFromPoint(clientX, clientY);
    while (el) {
      if (el.dataset && el.dataset.si != null) {
        setOver(parseInt(el.dataset.si));
        break;
      }
      el = el.parentElement;
    }
  };
  var tEnd = function tEnd() {
    clearTimeout(touchState.current.timer);
    if (touchState.current.on && drag != null && over != null) doReorder(drag, over);
    setDrag(null);
    setOver(null);
    touchState.current = {
      on: false,
      timer: null
    };
  };
  return React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, stockDelTarget && React.createElement(DeleteDlg, {
    msg: "「" + stockDelTarget + "」を削除しますか？\nチャートデータは保存されます。",
    onOk: function onOk() {
      onDel && onDel(stockDelTarget);
      setStockDelTarget(null);
    },
    onCancel: function onCancel() {
      return setStockDelTarget(null);
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      alignItems: "center",
      overflowX: "auto",
      paddingBottom: 6
    },
    onTouchMove: tMove,
    onTouchEnd: tEnd,
    onTouchCancel: tEnd
  },
  
  onFmSelect && React.createElement("button", {
    key: "__fm__",
    onClick: function(){ if (onFmSelect) onFmSelect(); },
    style: {
      position: "relative", flexShrink: 0,
      padding: "8px 14px",
      fontSize: 13, fontWeight: 600,
      border: fmActive ? "1.5px solid #0369A1" : "1px solid #ccc",
      borderRadius: 7, cursor: "pointer",
      background: fmActive ? "#0369A1" : "#EFF6FF",
      color: fmActive ? "#fff" : "#0369A1",
      whiteSpace: "nowrap",
      minHeight: IS_TOUCH ? 40 : 32,
      userSelect: "none"
    }
  },
    hasFmData && React.createElement("span", {
      style: { position: "absolute", top: 4, left: 5, width: 7, height: 7,
        borderRadius: "50%", background: "#E53935", pointerEvents: "none" }
    }),
    "🌏 外国市場"
  ),
  stocks.map(function (s, i) {
    return React.createElement("button", {
      key: s,
      "data-si": i,
      draggable: true,
      onClick: function onClick() {
        if (!touchState.current.on) onSelect(s);
      },
      onDragStart: function onDragStart(e) {
        e.dataTransfer.effectAllowed = "move";
        setDrag(i);
      },
      onDragOver: function onDragOver(e) {
        e.preventDefault();
        setOver(i);
      },
      onDrop: function onDrop(e) {
        e.preventDefault();
        doReorder(drag, i);
        setDrag(null);
        setOver(null);
      },
      onDragEnd: function onDragEnd() {
        setDrag(null);
        setOver(null);
      },
      onTouchStart: function onTouchStart(e) {
        return tStart(e, i);
      },
      style: {
        position: "relative",
        flexShrink: 0,
        padding: "8px 14px",
        paddingRight: (s !== "日経平均株価") ? ((onDel ? 28 : 0) + (onRename ? 24 : 0) + 6) : 14,
        fontSize: 13,
        fontWeight: 600,
        border: active === s ? "1.5px solid #1a1a1a" : over === i && drag != null ? "2px solid #6366F1" : "1px solid #ccc",
        borderRadius: 7,
        cursor: "grab",
        background: active === s ? "#1a1a1a" : over === i && drag != null ? "#EEF2FF" : "#fff",
        color: active === s ? "#fff" : "#666",
        opacity: drag === i ? .4 : 1,
        whiteSpace: "nowrap",
        minHeight: IS_TOUCH ? 40 : 32,
        userSelect: "none"
      }
    }, hasData && hasData(s) && React.createElement("span", {
      style: {
        position: "absolute",
        top: 4,
        left: 5,
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#E53935",
        pointerEvents: "none"
      }
    }), (exclCount && exclCount(s) > 0) ? _elExclDot(exclCount(s), { position: "absolute", top: 4, left: 15, pointerEvents: "none" }) : null, s, (onRename && s !== "日経平均株価") && React.createElement("span", {
      onClick: function onClickRn(e) {
        e.stopPropagation();
        try {
          var nn = window.prompt("銘柄名を変更", s);
          if (nn == null) return;
          nn = String(nn).trim();
          if (!nn || nn === s) return;
          if (nn === "日経平均株価") { alert("その名前は使用できません"); return; }
          if (stocks.indexOf(nn) !== -1) { alert("同じ名前の銘柄が既にあります"); return; }
          onRename(s, nn);
        } catch(_e) {}
      },
      title: "名前を変更",
      style: {
        position: "absolute",
        top: "50%",
        right: onDel ? 30 : 7,
        transform: "translateY(-50%)",
        width: IS_TOUCH ? 20 : 16,
        height: IS_TOUCH ? 20 : 16,
        borderRadius: "50%",
        background: "rgba(130,130,130,.25)",
        color: "inherit",
        fontSize: IS_TOUCH ? 11 : 10,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        userSelect: "none",
        lineHeight: 1
      },
      onMouseEnter: function(e) { e.currentTarget.style.background = "#6366F1"; e.currentTarget.style.color = "#fff"; },
      onMouseLeave: function(e) { e.currentTarget.style.background = "rgba(130,130,130,.25)"; e.currentTarget.style.color = "inherit"; }
    }, "\u270E"), (onDel && s !== "日経平均株価") && React.createElement("span", {
      onClick: function onClick(e) {
        e.stopPropagation();
        setStockDelTarget(s);
      },
      style: {
        position: "absolute",
        top: "50%",
        right: 7,
        transform: "translateY(-50%)",
        width: IS_TOUCH ? 20 : 16,
        height: IS_TOUCH ? 20 : 16,
        borderRadius: "50%",
        background: "rgba(130,130,130,.35)",
        color: "inherit",
        fontSize: IS_TOUCH ? 12 : 10,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        userSelect: "none",
        lineHeight: 1
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.background = "#C0392B";
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.background = "rgba(130,130,130,.35)";
      }
    }, "\u2715"));
  }),
  
  React.createElement("span", {
    style: { display: "inline-flex", alignItems: "stretch", flexShrink: 0, position: "relative" }
  },
    !addOpen && React.createElement("span", {
      onClick: function(){ setAddOpen(true); },
      style: {
        cursor: "pointer", fontSize: 12, color: "#888",
        border: "1.5px dashed #ccc", borderRadius: 6,
        padding: "5px 12px", display: "inline-flex", alignItems: "center",
        lineHeight: 1.5, userSelect: "none", minHeight: IS_TOUCH ? 40 : 32
      }
    }, "\uFF0B"),
    addOpen && React.createElement("span", {
      style: { display: "inline-flex", alignItems: "center", gap: 4, position: "relative" }
    },
      React.createElement(FastInput, {
        inputRef: addInputRef,
        value: addVal,
        onChange: function(v){ setAddVal(v); },
        debounceMs: 0,
        placeholder: "\u9298\u67C4\u540D",
        onKeyDown: function(e){
          if (e.key === "Enter") {
            e.preventDefault();
            var v = (e.target.value || "").trim();
            if (v) { onAdd && onAdd(v); setAddVal(""); setAddOpen(false); }
          }
          if (e.key === "Escape") { setAddVal(""); setAddOpen(false); }
        },
        style: { fontSize: 13, border: "1.5px solid #6366F1", borderRadius: 6,
          padding: "6px 10px", width: 120, outline: "none" }
      }),
      React.createElement("span", {
        onMouseDown: _fiFlushAll,
        onClick: function(){
          var inp = addInputRef.current;
          var v = ((inp && inp.value) != null ? inp.value : addVal).trim();
          if (v) { onAdd && onAdd(v); setAddVal(""); setAddOpen(false); }
        },
        style: { cursor: "pointer", color: "#1E8449", fontWeight: 700, fontSize: 18, padding: "4px" }
      }, "\u2713"),
      React.createElement("span", {
        onClick: function(){ setAddVal(""); setAddOpen(false); },
        style: { cursor: "pointer", color: "#999", fontSize: 16, padding: "4px" }
      }, "\u2715"),
      
      hiddenStocks && hiddenStocks.length > 0 && React.createElement("div", {
        style: {
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          background: "#fff", border: "1px solid #e0ddd6", borderRadius: 8,
          padding: 8, zIndex: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: 320, display: "flex", flexDirection: "column", gap: 6
        }
      },
        React.createElement("div", {
          style: { fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: 1 }
        }, "\u975E\u8868\u793A\u4E2D\u306E\u9298\u67C4 ("+hiddenStocks.length+")"),
        React.createElement("div", {
          style: { display: "flex", flexWrap: "wrap", gap: 5 }
        },
          hiddenStocks.map(function(hs) {
            return React.createElement("span", {
              key: hs,
              onClick: function(){
                if (onRestore) onRestore(hs);
                setAddVal("");
                setAddOpen(false);
              },
              style: {
                cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: "#F5F4F0", color: "#555",
                border: "1px solid #e0ddd6", borderRadius: 6,
                padding: "5px 10px", userSelect: "none",
                display: "inline-flex", alignItems: "center", gap: 4
              },
              onMouseEnter: function(e){ e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.color = "#6366F1"; e.currentTarget.style.borderColor = "#C7D2FE"; },
              onMouseLeave: function(e){ e.currentTarget.style.background = "#F5F4F0"; e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#e0ddd6"; }
            }, "\u21B6 " + hs);
          })
        )
      )
    )
  ),
  
  onRestore && hiddenStocks && hiddenStocks.length > 0 && React.createElement("span", {
    onClick: function(){ setHiddenDlgOpen(true); },
    title: "非表示中の銘柄を管理",
    style: {
      cursor: "pointer", fontSize: 12, color: "#888",
      border: "1.5px solid #e0ddd6", borderRadius: 6,
      padding: "5px 10px", display: "inline-flex", alignItems: "center", gap: 4,
      background: "#fff", flexShrink: 0, marginLeft: 4,
      minHeight: IS_TOUCH ? 40 : 32, userSelect: "none"
    },
    onMouseEnter: function(e){ e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.color = "#6366F1"; },
    onMouseLeave: function(e){ e.currentTarget.style.borderColor = "#e0ddd6"; e.currentTarget.style.color = "#888"; }
  }, "\uD83D\uDDD1 " + hiddenStocks.length),
  
  hiddenDlgOpen && React.createElement("div", {
    onClick: function(){ setHiddenDlgOpen(false); },
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  },
    React.createElement("div", {
      onClick: function(e){ e.stopPropagation(); },
      style: {
        background: "#fff", borderRadius: 12, padding: 20,
        maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto"
      }
    },
      React.createElement("div", {
        style: { fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#1a1a1a" }
      }, "\u975E\u8868\u793A\u4E2D\u306E\u9298\u67C4"),
      React.createElement("div", {
        style: { fontSize: 11, color: "#888", marginBottom: 14, lineHeight: 1.6 }
      }, "\u300C\u5FA9\u6D3B\u300D\u3067\u30BF\u30D6\u306B\u623B\u3057\u307E\u3059\u3002\u300C\u5B8C\u5168\u524A\u9664\u300D\u3067\u30C1\u30E3\u30FC\u30C8\u30C7\u30FC\u30BF\u3082\u542B\u3081\u3066\u5168\u3066\u524A\u9664\u3055\u308C\u307E\u3059\uFF08\u6238\u305B\u307E\u305B\u3093\uFF09\u3002"),
      (hiddenStocks || []).length === 0 ? React.createElement("div", {
        style: { fontSize: 13, color: "#999", padding: "20px 0", textAlign: "center" }
      }, "\u975E\u8868\u793A\u4E2D\u306E\u9298\u67C4\u306F\u3042\u308A\u307E\u305B\u3093") :
      React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }
      },
        (hiddenStocks || []).map(function(hs) {
          return React.createElement("div", {
            key: hs,
            style: {
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", background: "#f5f4f0", borderRadius: 7
            }
          },
            React.createElement("div", {
              style: { flex: 1, fontSize: 14, fontWeight: 600, color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
            }, hs),
            React.createElement("button", {
              onClick: function(){
                if (onRestore) onRestore(hs);
              },
              style: {
                padding: "6px 12px", fontSize: 12, fontWeight: 600,
                background: "#6366F1", color: "#fff", border: "none",
                borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28
              }
            }, "\u5FA9\u6D3B"),
            React.createElement("button", {
              onClick: function(){ setPurgeTarget(hs); },
              style: {
                padding: "6px 12px", fontSize: 12, fontWeight: 600,
                background: "#fff", color: "#C0392B", border: "1px solid #E8BBBB",
                borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28
              }
            }, "\u5B8C\u5168\u524A\u9664")
          );
        })
      ),
      React.createElement("div", { style: { textAlign: "right" } },
        React.createElement("button", {
          onClick: function(){ setHiddenDlgOpen(false); },
          style: {
            padding: "8px 18px", fontSize: 13, fontWeight: 600,
            background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
            borderRadius: 7, cursor: "pointer", minHeight: IS_TOUCH ? 40 : 32
          }
        }, "\u9589\u3058\u308B")
      )
    )
  ),
  purgeTarget && React.createElement(DeleteDlg, {
    msg: "「" + purgeTarget + "」を完全削除しますか？\nチャートデータも含めて全て消去され、戻せません。",
    onOk: function(){
      if (onPurge) onPurge(purgeTarget);
      setPurgeTarget(null);
    },
    onCancel: function(){ setPurgeTarget(null); }
  })
  ));
}



function _RenameRow(_ref_rr) {
  var initialValue = _ref_rr.initialValue;
  var existingNames = _ref_rr.existingNames || [];
  var onApply = _ref_rr.onApply;
  var _us_rr = useState(initialValue || ""), _us_rrS = _slicedToArray(_us_rr, 2),
    val = _us_rrS[0], setVal = _us_rrS[1];
  
  useEffect(function() { setVal(initialValue || ""); }, [initialValue]);
  var v = (val || "").trim();
  var dup = v && existingNames.indexOf(v) >= 0;
  var canApply = v && v !== initialValue && !dup;
  return React.createElement("div", {
    style: { display: "flex", alignItems: "center", gap: 8 }
  },
    React.createElement(FastInput, {
      type: "text",
      value: val,
      onChange: function(v){ setVal(v); },
      debounceMs: 0,
      style: {
        flex: 1, fontSize: 13, padding: "6px 10px",
        border: "1px solid " + (dup ? "#FCA5A5" : "#ccc"),
        borderRadius: 5, boxSizing: "border-box"
      }
    }),
    dup ? React.createElement("span", {
      style: { fontSize: 10, color: "#B45309", fontWeight: 600 }
    }, "\u91CD\u8907") : null,
    React.createElement("button", {
      onClick: function(){ if (canApply) onApply(v); },
      disabled: !canApply,
      style: {
        padding: "6px 14px", fontSize: 13, fontWeight: 700,
        background: canApply ? "#10B981" : "#ccc",
        color: "#fff", border: "none", borderRadius: 6,
        cursor: canApply ? "pointer" : "not-allowed",
        whiteSpace: "nowrap"
      }
    }, "\u9069\u7528")
  );
}
function NewsCatTabs(_ref35) {
  var cats = _ref35.cats,
    active = _ref35.active,
    onSelect = _ref35.onSelect,
    _onAdd2 = _ref35.onAdd,
    onDel = _ref35.onDel,
    onMgmt = _ref35.onMgmt,
    hasData = _ref35.hasData,
    isOrphan = _ref35.isOrphan;
  var _useState111 = useState(null),
    _useState112 = _slicedToArray(_useState111, 2),
    delTarget = _useState112[0],
    setDelTarget = _useState112[1];
  return React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, delTarget && React.createElement(DeleteDlg, {
    msg: "「" + delTarget + "」を一覧から外しますか？\n過去のデータは保持されます。",
    onOk: function onOk() {
      onDel(delTarget);
      setDelTarget(null);
    },
    onCancel: function onCancel() {
      return setDelTarget(null);
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      alignItems: "center",
      overflowX: "auto",
      paddingBottom: 6
    }
  }, cats.map(function (cat) {
    var orphan = isOrphan && isOrphan(cat);
    var isActive = active === cat;
    return React.createElement("button", {
      key: cat,
      onClick: function onClick() {
        return onSelect(cat);
      },
      title: orphan ? "削除済み（データあり）" : "",
      style: {
        position: "relative",
        flexShrink: 0,
        padding: "7px 14px",
        paddingRight: orphan ? 14 : 28,
        fontSize: 13,
        fontWeight: 600,
        border: isActive ? "1.5px solid #1a1a1a" : orphan ? "1.5px dashed #aaa" : "1px solid #ccc",
        borderRadius: 7,
        cursor: "pointer",
        background: isActive ? "#1a1a1a" : orphan ? "#f5f5f5" : "#fff",
        color: isActive ? "#fff" : orphan ? "#888" : "#666",
        whiteSpace: "nowrap",
        minHeight: IS_TOUCH ? 40 : 32
      }
    }, hasData && hasData(cat) && React.createElement("span", {
      style: {
        position: "absolute",
        top: 4,
        left: 5,
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#E53935",
        pointerEvents: "none"
      }
    }), cat, orphan && React.createElement("span", {
      style: {
        fontSize: 10,
        marginLeft: 4,
        opacity: .6
      }
    }, "(\u524A\u9664\u6E08)"), !orphan && React.createElement("span", {
      onClick: function onClick(e) {
        e.stopPropagation();
        if (onMgmt) onMgmt(cat);
        else setDelTarget(cat);
      },
      title: onMgmt ? "\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u3092\u7BA1\u7406 (\u30EA\u30CD\u30FC\u30E0 / \u4E26\u3073\u66FF\u3048 / \u524A\u9664)" : "\u524A\u9664",
      style: {
        position: "absolute",
        top: "50%",
        right: 6,
        transform: "translateY(-50%)",
        width: IS_TOUCH ? 18 : 14,
        height: IS_TOUCH ? 18 : 14,
        borderRadius: "50%",
        background: "rgba(130,130,130,.3)",
        fontSize: IS_TOUCH ? 11 : 9,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        userSelect: "none",
        lineHeight: 1
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.background = onMgmt ? "#10B981" : "#C0392B";
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.background = "rgba(130,130,130,.3)";
      }
    }, onMgmt ? "\u2699" : "\u2715"));
  }), React.createElement(AddBtn, {
    onAdd: function onAdd(name) {
      if (name && !cats.includes(name)) _onAdd2(name);
    },
    ph: "\u5206\u985E\u540D"
  })));
}

function EventsTab(_ref_evt) {
  var dd = _ref_evt.dd,
      date = _ref_evt.date,
      save = _ref_evt.save,
      allStocks = _ref_evt.allStocks,
      custom = _ref_evt.custom,
      data = _ref_evt.data;
  var events = getDayEvents(dd);
  
  var weekDates = useMemo(function() {
    var d = new Date(date + "T00:00:00");
    var dow = d.getDay();
    var diffToMon = dow === 0 ? -6 : 1 - dow;
    var dates = [];
    for (var i = 0; i < 7; i++) {
      var cur = new Date(d);
      cur.setDate(d.getDate() + diffToMon + i);
      var y = cur.getFullYear();
      var m = String(cur.getMonth() + 1).padStart(2, "0");
      var day = String(cur.getDate()).padStart(2, "0");
      dates.push(y + "-" + m + "-" + day);
    }
    return dates;
  }, [date]);
  
  var weekEvents = useMemo(function() {
    if (!data) return [];
    var result = [];
    weekDates.forEach(function(d) {
      var dayData = (data.trades && data.trades[d]) || {};
      var dayEvs = (Array.isArray(dayData.events) ? dayData.events : []).filter(function(e){ return e && !e._deleted; });
      dayEvs.forEach(function(ev) { result.push({ date: d, ev: ev }); });
    });
    result.sort(function(a, b) {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.ev.startTime || "99:99").localeCompare(b.ev.startTime || "99:99");
    });
    return result;
  }, [data, weekDates]);
  
  var eventCategories = (custom && Array.isArray(custom.eventCategories) && custom.eventCategories.length > 0)
    ? custom.eventCategories
    : [{ id: "evcat_other", name: "\u305D\u306E\u4ED6", color: "#6366F1" }];
  
  var _usEvCM = useState(false), _usEvCMS = _slicedToArray(_usEvCM, 2),
      evCatMgmtOpen = _usEvCMS[0], setEvCatMgmtOpen = _usEvCMS[1];
  useModalBack(evCatMgmtOpen, function(){ setEvCatMgmtOpen(false); }, "events-catmgmt");
  
  var _usEdit = useState(null), _usEditS = _slicedToArray(_usEdit, 2),
      editId = _usEditS[0], setEditId = _usEditS[1];
  
  var _usDraft = useState(null), _usDraftS = _slicedToArray(_usDraft, 2),
      draft = _usDraftS[0], setDraft = _usDraftS[1];
  useModalBack(editId != null, function(){
    var doClose = function(){ setEditId(null); setDraft(null); };
    if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
      window.__snEditingGuard.canLeave(doClose);
    } else { doClose(); }
  }, "events-edit");
  var openNew = function(initialDate) {
    var d = initialDate || date;
    setDraft({
      id: "new",
      date: d,
      originalDate: d,
      title: "",
      allDay: true,
      startTime: "",
      endTime: "",
      content: "",
      contentHtml: "",
      endDate: "",
      relatedStocks: [],
      categoryId: (eventCategories[0] && eventCategories[0].id) || ""
    });
    setEditId("new");
  };
  var openEdit = function(ev, evDate) {
    var d = evDate || date;
    var initHtml = ev.contentHtml || "";
    if (!initHtml && ev.content) {
      var t = ev.content;
      initHtml = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    }
    setDraft({
      id: ev.id,
      date: d,
      originalDate: d,
      title: ev.title || "",
      allDay: ev.allDay !== false && !ev.startTime,
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      content: ev.content || "",
      contentHtml: initHtml,
      endDate: ev.endDate || "",
      relatedStocks: (ev.relatedStocks || []).slice(),
      categoryId: ev.categoryId || ""
    });
    setEditId(ev.id);
  };
  var saveDraft = function() {
    if (!draft) return;
    _fiFlushAll();
    var titleNow = draft.title;
    try {
      var inps = document.querySelectorAll("input[data-fi-key='evDraftTitle']");
      if (inps.length) titleNow = inps[inps.length - 1].value || "";
    } catch (_e) {}
    var html = (draft.contentHtml || "").trim();
    var hasHtml = _hasText(html);
    var clean = {
      id: (draft.id === "new") ? Date.now() : draft.id,
      title: (titleNow || "").trim(),
      allDay: !(draft.startTime || draft.endTime),
      startTime: draft.startTime || "",
      endTime: draft.endTime || "",
      content: (draft.id === "new") ? "" : (hasHtml ? "" : (draft.content || "")),
      contentHtml: hasHtml ? html : "",
      endDate: (draft.endDate || "").trim(),
      relatedStocks: (draft.relatedStocks || []).slice(),
      categoryId: draft.categoryId || ""
    };
    if (!clean.title && !hasHtml && !clean.content) {
      setEditId(null); setDraft(null); return;
    }
    var targetDate = (draft.date || "").trim() || date;
    var origDate = (draft.originalDate || "").trim() || date;
    save(function(prevData) {
      var newTrades = Object.assign({}, prevData.trades || {});
      
      if (draft.id !== "new" && origDate !== targetDate) {
        var origDd = newTrades[origDate] || {};
        var origEvs = Array.isArray(origDd.events) ? origDd.events : [];
        newTrades[origDate] = Object.assign({}, origDd, { events: origEvs.filter(function(e) { return e.id !== clean.id; }) });
      }
      var targetDd = newTrades[targetDate] || {};
      var targetEvs = Array.isArray(targetDd.events) ? targetDd.events : [];
      var newEvs;
      if (draft.id === "new") {
        newEvs = targetEvs.concat([clean]);
      } else if (origDate === targetDate) {
        newEvs = targetEvs.map(function(e) { return e.id === clean.id ? clean : e; });
      } else {
        newEvs = targetEvs.concat([clean]);
      }
      newTrades[targetDate] = Object.assign({}, targetDd, { events: newEvs });
      return Object.assign({}, prevData, { trades: newTrades });
    });
    setEditId(null); setDraft(null);
  };
  var deleteEvent = function(id) {
    if (!window.confirm("\u3053\u306E\u4E88\u5B9A\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")) return;
    var delDate = (draft && typeof draft.originalDate === "string" && draft.originalDate) ? draft.originalDate : date;
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[delDate]) || {};
      var prevEvents = Array.isArray(prevDd.events) ? prevDd.events : [];

      var newEvents = prevEvents.map(function(e) { return e && e.id === id ? _objectSpread(_objectSpread({}, e), {}, { _deleted: true }) : e; });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, delDate,
          _objectSpread(_objectSpread({}, prevDd), {}, { events: newEvents })))
      });
    });
    setEditId(null); setDraft(null);
  };
  var togRelStock = function(stk) {
    setDraft(function(prev) {
      if (!prev) return prev;
      var arr = (prev.relatedStocks || []).slice();
      var i = arr.indexOf(stk);
      if (i >= 0) arr.splice(i, 1); else arr.push(stk);
      return _objectSpread(_objectSpread({}, prev), {}, { relatedStocks: arr });
    });
  };
  var fmtTimeRange = function(ev) {
    if (ev.allDay !== false && !ev.startTime) return "\u7D42\u65E5";
    if (ev.startTime && ev.endTime) return ev.startTime + " - " + ev.endTime;
    if (ev.startTime) return ev.startTime + " ~";
    return "";
  };
  var weekLabel = weekDates[0].slice(5).replace("-", "/") + " 〜 " + weekDates[6].slice(5).replace("-", "/");
  return React.createElement("div", null,
    
    React.createElement("div", {
      style: { marginBottom: 16, border: "1px solid #D1FAE5", borderRadius: 8, overflow: "hidden" }
    },
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", background: "#ECFDF5", borderBottom: "1px solid #D1FAE5", flexWrap: "wrap", gap: 6 }
      },
        React.createElement("span", {
          style: { fontSize: 13, fontWeight: 700, color: "#065F46" }
        }, "📅 今週の予定 (", weekLabel, ")"),
        React.createElement("button", {
          onClick: function() { openNew(date); },
          style: { padding: "6px 12px", fontSize: 12, fontWeight: 700,
            background: "#10B981", color: "#fff", border: "none",
            borderRadius: 6, cursor: "pointer" }
        }, "+ 予定を追加")
      ),
      weekEvents.length === 0
        ? React.createElement("div", {
            style: { padding: "12px 14px", textAlign: "center", color: "#aaa", fontSize: 12 }
          }, "今週の予定はありません")
        : React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
            weekEvents.map(function(item, idx) {
              var d = item.date, ev = item.ev;
              var isToday = d === date;
              var tr = fmtTimeRange(ev);
              var dateLabel = d.slice(5).replace("-", "/") + "（" + DAYS_JP[new Date(d + "T00:00:00").getDay()] + "）";
              var evColor = getEventColor(ev, eventCategories);
              return React.createElement("div", {
                key: d + "_" + ev.id,
                onClick: function() { openEdit(ev, d); },
                style: {
                  display: "flex", alignItems: "stretch", gap: 8,
                  padding: "8px 10px",
                  background: isToday ? "#F0FDF4" : "#fff",
                  borderTop: idx > 0 ? "1px solid #F0F0F0" : "none",
                  cursor: "pointer"
                }
              },
                React.createElement("div", {
                  style: { width: 3, alignSelf: "stretch", background: evColor, borderRadius: 2, flexShrink: 0 }
                }),
                React.createElement("div", { style: { minWidth: 54, fontSize: 11, color: isToday ? "#065F46" : "#888", fontWeight: isToday ? 700 : 500, flexShrink: 0, paddingTop: 1 } }, dateLabel),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#1a1a1a", wordBreak: "break-word" } }, ev.title || "(無題)"),
                  tr && React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 1 } }, "⏰ ", tr)
                )
              );
            })
          )
    ),
    
    React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, gap: 8, flexWrap: "wrap"
      }
    },
      React.createElement("div", {
        style: { fontSize: 13, color: "#888", fontWeight: 600 }
      }, "\uD83D\uDCC5 ", events.length, " \u4EF6"),
      React.createElement("button", {
        onClick: function() { openNew(date); },
        style: {
          padding: "8px 14px", fontSize: 13, fontWeight: 700,
          background: "#10B981", color: "#fff", border: "none",
          borderRadius: 7, cursor: "pointer", minHeight: 36
        }
      }, "\u002B \u4E88\u5B9A\u3092\u8FFD\u52A0")
    ),
    
    events.length === 0 ? React.createElement("div", {
      style: {
        padding: 24, textAlign: "center", color: "#aaa", fontSize: 13,
        background: "#fafaf8", borderRadius: 8, border: "1px dashed #ddd"
      }
    }, "\u4E88\u5B9A\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093")
    : React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 8 }
      },
      events.map(function(ev) {
        var tr = fmtTimeRange(ev);
        var hasEnd = ev.endDate && ev.endDate !== date;
        return React.createElement("div", {
          key: ev.id,
          onClick: function(){ openEdit(ev); },
          style: {
            display: "flex", alignItems: "stretch", gap: 10,
            padding: "10px 12px", background: "#fff",
            border: "1px solid #e0ddd6", borderRadius: 8,
            cursor: "pointer"
          }
        },
          React.createElement("div", {
            style: {
              width: 4, alignSelf: "stretch", background: getEventColor(ev, eventCategories), borderRadius: 2
            }
          }),
          React.createElement("div", { style: { flex: 1, minWidth: 0 } },
            React.createElement("div", {
              style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }
            },
              React.createElement("div", {
                style: { fontSize: 14, fontWeight: 700, color: "#1a1a1a", wordBreak: "break-word" }
              }, ev.title || "(\u7121\u984C)"),
              ev.categoryId && (function(){
                var nm = getEventCategoryName(ev, eventCategories);
                if (!nm) return null;
                return React.createElement("span", {
                  style: {
                    fontSize: 10, fontWeight: 600, padding: "1px 7px",
                    background: getEventColor(ev, eventCategories), color: "#fff",
                    borderRadius: 10
                  }
                }, nm);
              })()
            ),
            tr && React.createElement("div", {
              style: { fontSize: 11, color: "#888", marginTop: 2 }
            }, "\u23F0 ", tr, hasEnd ? "  \u203A " + ev.endDate + " \u307E\u3067" : ""),
            
            ev.contentHtml ? React.createElement("div", {
              style: {
                fontSize: 12, color: "#555", marginTop: 4,
                wordBreak: "break-word", lineHeight: 1.5,
                maxHeight: 160, overflow: "hidden"
              },
              dangerouslySetInnerHTML: { __html: ev.contentHtml }
            }) : (ev.content && React.createElement("div", {
              style: { fontSize: 12, color: "#555", marginTop: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" }
            }, ev.content)),
            (ev.relatedStocks && ev.relatedStocks.length > 0) && React.createElement("div", {
              style: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }
            }, ev.relatedStocks.map(function(s) {
              return React.createElement("span", {
                key: s,
                style: {
                  fontSize: 10, fontWeight: 600, padding: "2px 6px",
                  background: "#EEF2FF", color: "#4F46E5",
                  border: "1px solid #C7D2FE", borderRadius: 4
                }
              }, s);
            }))
          )
        );
      })
    ),
    
    editId != null && draft && React.createElement("div", {
      onClick: function(){
        var doClose = function(){ setEditId(null); setDraft(null); };
        if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
          window.__snEditingGuard.canLeave(doClose);
        } else { doClose(); }
      },
      style: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16
      }
    },
      React.createElement("div", {
        onClick: function(e){ e.stopPropagation(); },
        style: {
          background: "#fff", borderRadius: 12,
          maxWidth: 520, width: "100%", maxHeight: "90vh",
          display: "flex", flexDirection: "column"
        }
      },
        React.createElement("div", {
          style: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: "1px solid #e0ddd6", flexShrink: 0
          }
        },
          React.createElement("span", {
            style: { fontSize: 14, fontWeight: 700 }
          }, draft.id === "new" ? "\uD83D\uDCC5 \u4E88\u5B9A\u3092\u8FFD\u52A0" : "\uD83D\uDCC5 \u4E88\u5B9A\u3092\u7DE8\u96C6"),
          React.createElement("button", {
            onClick: function(){
              var doClose = function(){ setEditId(null); setDraft(null); };
              if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
                window.__snEditingGuard.canLeave(doClose);
              } else { doClose(); }
            },
            style: {
              padding: "6px 14px", fontSize: 13, fontWeight: 600,
              background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
              borderRadius: 6, cursor: "pointer"
            }
          }, "\u30AD\u30E3\u30F3\u30BB\u30EB")
        ),
        React.createElement("div", {
          style: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }
        },
          
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } }, "日付"),
            React.createElement("input", {
              type: "date",
              value: draft.date || date,
              onChange: function(e) {
                var v = e.target.value;
                setDraft(function(p) { return _objectSpread(_objectSpread({}, p), {}, { date: v }); });
              },
              style: { fontSize: 14, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 6 }
            })
          ),
          
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } },
              "\u30BF\u30A4\u30C8\u30EB"),
            React.createElement(FastInput, {
              type: "text",
              "data-fi-key": "evDraftTitle",
              value: draft.title,
              onChange: function(v){ setDraft(function(p){ return _objectSpread(_objectSpread({},p),{},{title:v}); }); },
              placeholder: "\u4F8B: \u30C8\u30E8\u30BF\u6C7A\u7B97\u767A\u8868 / FOMC \u306A\u3069",
              style: {
                width: "100%", fontSize: 14, padding: "8px 10px",
                border: "1px solid #ccc", borderRadius: 6, boxSizing: "border-box"
              }
            })
          ),
          
          React.createElement("div", null,
            React.createElement("div", {
              style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }
            }, "\u30AB\u30C6\u30B4\u30EA",
              React.createElement("button", {
                onClick: function(){ setEvCatMgmtOpen(true); },
                style: {
                  fontSize: 10, padding: "1px 6px", background: "#fff",
                  border: "1px solid #ccc", borderRadius: 3, cursor: "pointer", color: "#666"
                }
              }, "\u2699 \u7BA1\u7406")
            ),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
              eventCategories.map(function(c) {
                var on = draft.categoryId === c.id;
                return React.createElement("button", {
                  key: c.id,
                  onClick: function(){ setDraft(function(p){ return _objectSpread(_objectSpread({}, p), {}, { categoryId: c.id }); }); },
                  style: {
                    padding: "5px 10px", fontSize: 12, fontWeight: 600,
                    background: on ? c.color : "#fff",
                    color: on ? "#fff" : "#444",
                    border: "1px solid " + (on ? c.color : "#ddd"),
                    borderRadius: 5, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4
                  }
                },
                  React.createElement("span", {
                    style: { width: 8, height: 8, borderRadius: 2, background: on ? "#fff" : c.color, opacity: on ? 0.9 : 1 }
                  }),
                  c.name
                );
              })
            )
          ),
          
          React.createElement("div", null,
            React.createElement("div", {
              style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }
            }, "\u6642\u9593\u5E2F"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }
            },
              React.createElement("input", {
                type: "time",
                value: draft.startTime || "",
                onChange: function(e){
                  var v = e.target.value;
                  setDraft(function(p){
                    return _objectSpread(_objectSpread({}, p), {}, { startTime: v, allDay: v ? false : p.allDay });
                  });
                },
                style: { fontSize: 14, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5 }
              }),
              React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "\u301C"),
              React.createElement("input", {
                type: "time",
                value: draft.endTime || "",
                onChange: function(e){
                  var v = e.target.value;
                  setDraft(function(p){
                    return _objectSpread(_objectSpread({}, p), {}, { endTime: v, allDay: v ? false : p.allDay });
                  });
                },
                style: { fontSize: 14, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5 }
              }),
              React.createElement("label", {
                style: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#666", cursor: "pointer", marginLeft: 6 }
              },
                React.createElement("input", {
                  type: "checkbox",
                  checked: !!draft.allDay && !draft.startTime && !draft.endTime,
                  onChange: function(e){
                    var v = e.target.checked;
                    setDraft(function(p){
                      return _objectSpread(_objectSpread({}, p), {}, {
                        allDay: v,
                        startTime: v ? "" : p.startTime,
                        endTime: v ? "" : p.endTime
                      });
                    });
                  }
                }),
                React.createElement("span", null, "\u7D42\u65E5")
              )
            ),
            React.createElement("div", {
              style: { fontSize: 10, color: "#aaa", marginTop: 3 }
            }, "\u7A7A\u6B04\u306E\u307E\u307E\u4FDD\u5B58\u3059\u308B\u3068\u300C\u7D42\u65E5\u300D\u3068\u3057\u3066\u8A18\u9332\u3055\u308C\u307E\u3059")
          ),
          
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } },
              "\u7D42\u4E86\u65E5 (\u8907\u6570\u65E5\u306B\u308F\u305F\u308B\u5834\u5408)"),
            React.createElement("input", {
              type: "date",
              value: draft.endDate,
              onChange: function(e){ var v=e.target.value; setDraft(function(p){ return _objectSpread(_objectSpread({},p),{},{endDate:v}); }); },
              style: {
                fontSize: 13, padding: "6px 8px",
                border: "1px solid #ccc", borderRadius: 5, boxSizing: "border-box"
              }
            }),
            draft.endDate && React.createElement("button", {
              onClick: function(){ setDraft(function(p){ return _objectSpread(_objectSpread({},p),{},{endDate:""}); }); },
              style: {
                marginLeft: 8, fontSize: 11, padding: "4px 10px",
                background: "#fff", color: "#888", border: "1px solid #ddd",
                borderRadius: 4, cursor: "pointer"
              }
            }, "\u30AF\u30EA\u30A2")
          ),
          
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } },
              "\u5185\u5BB9\u30E1\u30E2"),
            React.createElement(MemoEditableField, {
              key: "mef_event_" + (draft.id || "new"),
              html: draft.contentHtml || "",
              onChange: function(h){
                setDraft(function(p){
                  if (!p) return p;
                  return _objectSpread(_objectSpread({}, p), {}, { contentHtml: h });
                });
              },
              placeholder: "詳細、メモ、URL、画像貼り付けなど",
              autoEdit: true,
              inlineButtons: false,
              guardOwner: "eventEdit_" + (draft.id || "new")
            })
          ),
          
          (allStocks && allStocks.length > 0) && React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } },
              "\u95A2\u9023\u9298\u67C4 (\u4F8B: \u6C7A\u7B97\u767A\u8868)"),
            React.createElement("div", {
              style: { display: "flex", flexWrap: "wrap", gap: 5 }
            }, allStocks.filter(function(s){ return s !== "\u65E5\u7D4C\u5E73\u5747\u682A\u4FA1"; }).map(function(stk) {
              var on = (draft.relatedStocks || []).indexOf(stk) >= 0;
              return React.createElement("button", {
                key: stk,
                onClick: function(){ togRelStock(stk); },
                style: {
                  padding: "4px 10px", fontSize: 11, fontWeight: 600,
                  background: on ? "#4F46E5" : "#fff",
                  color: on ? "#fff" : "#444",
                  border: "1px solid " + (on ? "#4F46E5" : "#ddd"),
                  borderRadius: 5, cursor: "pointer"
                }
              }, (on ? "\u2713 " : "") + stk);
            }))
          ),
          
          React.createElement("div", {
            style: { display: "flex", alignItems: "center", gap: 8, paddingTop: 4 }
          },
            draft.id !== "new" && React.createElement("button", {
              onClick: function(){ deleteEvent(draft.id); },
              style: {
                padding: "8px 14px", fontSize: 13, fontWeight: 700,
                background: "#fff", color: "#DC2626", border: "1px solid #FCA5A5",
                borderRadius: 6, cursor: "pointer"
              }
            }, "\uD83D\uDDD1 \u524A\u9664"),
            React.createElement("button", {
              onMouseDown: _fiFlushAll,
              onTouchStart: _fiFlushAll,
              onClick: saveDraft,
              style: {
                marginLeft: "auto", padding: "8px 18px", fontSize: 13, fontWeight: 700,
                background: "#10B981", color: "#fff", border: "none",
                borderRadius: 6, cursor: "pointer"
              }
            }, "\u4FDD\u5B58")
          )
        )
      )
    ),
    
    evCatMgmtOpen && React.createElement(EventCategoryManagementModal, {
      eventCategories: eventCategories,
      save: save,
      onClose: function(){ setEvCatMgmtOpen(false); }
    })
  );
}
function NewsTab(_ref36) {
  var dd = _ref36.dd,
    date = _ref36.date,
    data = _ref36.data,
    save = _ref36.save,
    custom = _ref36.custom,
    allStocks = _ref36.allStocks,
    onJumpToStock = _ref36.onJumpToStock,
    jumpTarget = _ref36.jumpTarget,
    onJumpTargetConsumed = _ref36.onJumpTargetConsumed,
    chartReturnCtx = _ref36.chartReturnCtx,
    onChartReturn = _ref36.onChartReturn;
  
  var _usHL = useState(null), _usHLS = _slicedToArray(_usHL, 2),
      highlightNiId = _usHLS[0], setHighlightNiId = _usHLS[1];
  var _useState113 = useState(null),
    _useState114 = _slicedToArray(_useState113, 2),
    viewTarget = _useState114[0],
    setViewTarget = _useState114[1],
    _useState115 = useState(null),
    _useState116 = _slicedToArray(_useState115, 2),
    annotTarget = _useState116[0],
    setAnnotTarget = _useState116[1];
  
  useModalBack(annotTarget != null, function(){ setAnnotTarget(null); }, "news-annot");
  useModalBack(viewTarget != null, function(){ setViewTarget(null); }, "news-view");
  
  var newsDragRef = useRef(null);
  var _usND = useState(null), _usNDS = _slicedToArray(_usND, 2), dragFromIdx = _usNDS[0], setDragFromIdx = _usNDS[1];
  var _usNI = useState(null), _usNIS = _slicedToArray(_usNI, 2), dragInsert = _usNIS[0], setDragInsert = _usNIS[1];
  var newsContainerRef = useRef(null);
  var addBtnFileRef = useRef(null);
  var addBtnPasteRef = useRef(null);
  var _usABD = useState(false), _usABDS = _slicedToArray(_usABD, 2), addBtnDrag = _usABDS[0], setAddBtnDrag = _usABDS[1];
  var _usSCD = useState(null), _usSCDS = _slicedToArray(_usSCD, 2), subCatDrag = _usSCDS[0], setSubCatDrag = _usSCDS[1];

  var _usCDM = useState(false), _usCDMS = _slicedToArray(_usCDM, 2), catDefOpen = _usCDMS[0], setCatDefOpen = _usCDMS[1];
  useModalBack(catDefOpen, function(){ setCatDefOpen(false); }, "news-cat-def");
  
  var _usSCA = useState(false), _usSCAS = _slicedToArray(_usSCA, 2), subCatAddOpen = _usSCAS[0], setSubCatAddOpen = _usSCAS[1];
  var _usSCAN = useState(""), _usSCANS = _slicedToArray(_usSCAN, 2), subCatAddName = _usSCANS[0], setSubCatAddName = _usSCANS[1];
  var _usSCAStk = useState({}), _usSCAStkS = _slicedToArray(_usSCAStk, 2), subCatAddStocksMap = _usSCAStkS[0], setSubCatAddStocksMap = _usSCAStkS[1];
  useModalBack(subCatAddOpen, function(){ setSubCatAddOpen(false); }, "subcat-add");
  var _usSCM = useState(null), _usSCMS = _slicedToArray(_usSCM, 2), subCatMgmtTarget = _usSCMS[0], setSubCatMgmtTarget = _usSCMS[1];
  useModalBack(subCatMgmtTarget != null, function(){ setSubCatMgmtTarget(null); }, "subcat-mgmt");
  
  var _usCM = useState(null), _usCMS = _slicedToArray(_usCM, 2), catMgmtTarget = _usCMS[0], setCatMgmtTarget = _usCMS[1];
  useModalBack(catMgmtTarget != null, function(){ setCatMgmtTarget(null); }, "cat-mgmt");
  
  var _usMv = useState(null), _usMvS = _slicedToArray(_usMv, 2), moveTarget = _usMvS[0], setMoveTarget = _usMvS[1];
  var _usMvC = useState(""), _usMvCS = _slicedToArray(_usMvC, 2), moveToCat = _usMvCS[0], setMoveToCat = _usMvCS[1];
  var _usMvSc = useState(""), _usMvScS = _slicedToArray(_usMvSc, 2), moveToSubCat = _usMvScS[0], setMoveToSubCat = _usMvScS[1];
  
  var _usMvD = useState(date), _usMvDS = _slicedToArray(_usMvD, 2), moveToDate = _usMvDS[0], setMoveToDate = _usMvDS[1];
  
  var _usMvMd = useState("move"), _usMvMdS = _slicedToArray(_usMvMd, 2), moveMode = _usMvMdS[0], setMoveMode = _usMvMdS[1];
  
  var _usCT = useState([]), _usCTS = _slicedToArray(_usCT, 2), cloneTargets = _usCTS[0], setCloneTargets = _usCTS[1];
  
  var _usCMMvM = useState(""), _usCMMvMS = _slicedToArray(_usCMMvM, 2), catMgmtMoveToMain = _usCMMvMS[0], setCatMgmtMoveToMain = _usCMMvMS[1];
  var _usCMBT = useState(""), _usCMBTS = _slicedToArray(_usCMBT, 2), catMgmtBulkTo = _usCMBTS[0], setCatMgmtBulkTo = _usCMBTS[1];
  var _usCMBS = useState(""), _usCMBSS = _slicedToArray(_usCMBS, 2), catMgmtBulkToSub = _usCMBSS[0], setCatMgmtBulkToSub = _usCMBSS[1];
  
  var _usSCBT = useState(""), _usSCBTS = _slicedToArray(_usSCBT, 2), subCatMgmtBulkTo = _usSCBTS[0], setSubCatMgmtBulkTo = _usSCBTS[1];
  var _usSCBS2 = useState(""), _usSCBS2S = _slicedToArray(_usSCBS2, 2), subCatMgmtBulkToSub = _usSCBS2S[0], setSubCatMgmtBulkToSub = _usSCBS2S[1];
  useModalBack(moveTarget != null, function(){ setMoveTarget(null); }, "news-move");
  
  var _usDC = useState(null), _usDCS = _slicedToArray(_usDC, 2), delConfirmTarget = _usDCS[0], setDelConfirmTarget = _usDCS[1];
  useModalBack(delConfirmTarget != null, function(){ setDelConfirmTarget(null); }, "news-del-confirm");
  var newsCategories = custom.newsCategories && custom.newsCategories.length > 0 ? custom.newsCategories : _DEF_NEWS_CATS_FROZEN;
  var _useState117 = useState(function(){
      try {
        var _v=JSON.parse(localStorage.getItem("scalping_view_v1")||"{}");
        var _c=_v.newsCat;
        return (_c && newsCategories.includes(_c)) ? _c : (newsCategories[0] || "マーケット");
      } catch(e){ return newsCategories[0] || "マーケット"; }
    }),
    _useState118 = _slicedToArray(_useState117, 2),
    activeCat = _useState118[0],
    setActiveCat = _useState118[1];
  useEffect(function(){
    try {
      var _old=JSON.parse(localStorage.getItem("scalping_view_v1")||"{}");
      localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({},_old,{newsCat:activeCat})));
    } catch(e){}
  }, [activeCat]);
  var allCatsData = getAllNewsCatsData(dd);
  var orphanCats = Object.keys(allCatsData).filter(function (cat) {
    return !newsCategories.includes(cat) && hasCatContent(allCatsData[cat]);
  });
  var displayCats = [].concat(_toConsumableArray(newsCategories), _toConsumableArray(orphanCats));
  var currentCat = displayCats.includes(activeCat) ? activeCat : displayCats[0] || "マーケット";
  
  var subCatsForCur = (custom.newsSubCats && Array.isArray(custom.newsSubCats[currentCat])) ? custom.newsSubCats[currentCat] : [];
  var hasSubCats = subCatsForCur.length > 0;
  
  var _usSCs = useState(function() {
    try {
      var v = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
      return (v && typeof v.newsSubCatByCat === "object") ? v.newsSubCatByCat : {};
    } catch(e){ return {}; }
  });
  var _usSCsA = _slicedToArray(_usSCs, 2),
    subCatByCat = _usSCsA[0],
    setSubCatByCat = _usSCsA[1];
  var activeSubCat = subCatByCat[currentCat] || "__all__";
  
  if (hasSubCats && activeSubCat !== "__all__" && activeSubCat !== "__none__" && subCatsForCur.indexOf(activeSubCat) < 0) {
    activeSubCat = "__all__";
  }
  var setActiveSubCat = function(sc) {
    var nx = Object.assign({}, subCatByCat);
    nx[currentCat] = sc;
    setSubCatByCat(nx);
    try {
      var _o = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
      localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, _o, { newsSubCatByCat: nx })));
    } catch(e){}
  };
  
  useEffect(function() {
    if (!jumpTarget || !jumpTarget.niId || !jumpTarget.catName) return;
    
    if (newsCategories.indexOf(jumpTarget.catName) >= 0 ||
        Object.keys(getAllNewsCatsData(dd)).indexOf(jumpTarget.catName) >= 0) {
      setActiveCat(jumpTarget.catName);
    }
    
    try {
      var targetCatData = getCatData(dd, jumpTarget.catName);
      var item = (targetCatData.newsItems || []).find(function(n) { return n && n.id === jumpTarget.niId; });
      if (item) {
        var itemSubCat = item.subCat || "";
        var subCatList = (custom.newsSubCats && Array.isArray(custom.newsSubCats[jumpTarget.catName])) ? custom.newsSubCats[jumpTarget.catName] : [];
        if (subCatList.length > 0) {
          var nx = Object.assign({}, subCatByCat);
          if (itemSubCat && subCatList.indexOf(itemSubCat) >= 0) {
            nx[jumpTarget.catName] = itemSubCat;
          } else {
            nx[jumpTarget.catName] = "__none__";
          }
          setSubCatByCat(nx);
          try {
            var _o = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
            localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, _o, { newsSubCatByCat: nx })));
          } catch(e){}
        }
      }
    } catch(e) {}
    
    setHighlightNiId(jumpTarget.niId);
    
    if (typeof onJumpTargetConsumed === "function") onJumpTargetConsumed();
    
  }, [jumpTarget && jumpTarget.ts]);
  
  useEffect(function() {
    if (!highlightNiId) return;
    
    var t1 = setTimeout(function() {
      try {
        var el = document.getElementById("ni-card-" + highlightNiId);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
      } catch(e){}
    }, 80);
    var t2 = setTimeout(function() { setHighlightNiId(null); }, 2000);
    return function() { clearTimeout(t1); clearTimeout(t2); };
  }, [highlightNiId]);
  var catData = getCatData(dd, currentCat);
  var updCatField = function updCatField(k, vOrFn) {
    save(function(prevData) {
      var prevDd = prevData.trades[date] || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      var prevCatData = prevAllCats[currentCat] || {};
      var v = typeof vOrFn === 'function' ? vOrFn(prevCatData[k]) : vOrFn;
      var newCats = _objectSpread(_objectSpread({}, prevAllCats), {}, _defineProperty({}, currentCat, _objectSpread(_objectSpread({}, prevCatData), {}, _defineProperty({}, k, v))));
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, {
          newsCats: newCats
        })))
      });
    });
  };
  var pool = makeTagPoolHandlers(data, save, custom);
  
  var _usExC = useState({}), _usExCS = _slicedToArray(_usExC, 2),
      extraCats = _usExCS[0], setExtraCats = _usExCS[1];
  
  var catTagPool = useMemo(function() {
    return { cats: custom.cats || {}, tags: custom.tags || [] };
  }, [custom.cats, custom.tags]);
  
  var newsPool = Object.assign({}, pool, {
    onAddCat: function(name) {
      if (!name) return;
      pool.onAddCat(name);
      setExtraCats(function(prev) {
        if (prev[name]) return prev;
        var nx = Object.assign({}, prev); nx[name] = true; return nx;
      });
    }
  });
  
  var togNewsCatDef = function(tag) {
    var cur = (custom.newsCatDefaults && custom.newsCatDefaults[currentCat]) || [];
    var newSet = cur.indexOf(tag) >= 0 ? cur.filter(function(t){ return t !== tag; }) : cur.concat([tag]);
    var newDefs = Object.assign({}, custom.newsCatDefaults || {});
    if (newSet.length === 0) delete newDefs[currentCat]; else newDefs[currentCat] = newSet;
    updCustom({ newsCatDefaults: newDefs });
  };
  
  var addSubCat = function(name) {
    var nm = (name || "").trim();
    if (!nm) return;
    if (nm === "__all__" || nm === "__none__") return;
    var cur = subCatsForCur.slice();
    if (cur.indexOf(nm) >= 0) return;
    cur.push(nm);
    var newSubCats = Object.assign({}, custom.newsSubCats || {});
    newSubCats[currentCat] = cur;
    updCustom({ newsSubCats: newSubCats });
  };
  
  var addSubCatWithStocks = function(name, stocksMap) {
    var nm = (name || "").trim();
    if (!nm || nm === "__all__" || nm === "__none__") return;
    if (subCatsForCur.indexOf(nm) >= 0) return;
    var stocksToLink = Object.keys(stocksMap || {}).filter(function(k){ return stocksMap[k]; });
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var prevSubCats = prevCustom.newsSubCats || {};
      var curArr = (prevSubCats[currentCat] || []).slice();
      if (curArr.indexOf(nm) < 0) curArr.push(nm);
      var newSubCats = Object.assign({}, prevSubCats);
      newSubCats[currentCat] = curArr;
      
      var prevRefs = prevCustom.stockSubCatRefs || {};
      var newRefs = Object.assign({}, prevRefs);
      stocksToLink.forEach(function(stk) {
        if (stk === "日経平均株価") return;
        var arr = (newRefs[stk] || []).slice();
        if (!arr.some(function(r){ return r.cat === currentCat && r.subCat === nm; })) {
          arr.push({ cat: currentCat, subCat: nm });
        }
        newRefs[stk] = arr;
      });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, {
          newsSubCats: newSubCats,
          stockSubCatRefs: newRefs
        })
      });
    });
  };
  var delSubCat = function(name) {
    var cur = subCatsForCur.filter(function(x){ return x !== name; });
    var newSubCats = Object.assign({}, custom.newsSubCats || {});
    if (cur.length === 0) delete newSubCats[currentCat]; else newSubCats[currentCat] = cur;
    
    var newSubDefs = Object.assign({}, custom.newsSubCatDefaults || {});
    delete newSubDefs[currentCat + "::" + name];
    
    var newRefs = Object.assign({}, custom.stockSubCatRefs || {});
    Object.keys(newRefs).forEach(function(stk) {
      var arr = (newRefs[stk] || []).filter(function(r){ return !(r && r.cat === currentCat && r.subCat === name); });
      if (arr.length === 0) delete newRefs[stk]; else newRefs[stk] = arr;
    });
    
    if (activeSubCat === name) setActiveSubCat("__all__");
    updCustom({ newsSubCats: newSubCats, newsSubCatDefaults: newSubDefs, stockSubCatRefs: newRefs });
  };
  
  var renameSubCat = function(oldName, newName) {
    var nm = (newName || "").trim();
    if (!nm || nm === oldName) return false;
    if (nm === "__all__" || nm === "__none__") return false;
    if (subCatsForCur.indexOf(nm) >= 0) return false;
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      
      var newSubCats = Object.assign({}, prevCustom.newsSubCats || {});
      var arr = (newSubCats[currentCat] || []).map(function(x){ return x === oldName ? nm : x; });
      newSubCats[currentCat] = arr;
      
      var oldKey = currentCat + "::" + oldName;
      var newKey = currentCat + "::" + nm;
      var newSubDefs = Object.assign({}, prevCustom.newsSubCatDefaults || {});
      if (newSubDefs[oldKey] != null) {
        newSubDefs[newKey] = newSubDefs[oldKey];
        delete newSubDefs[oldKey];
      }
      
      var newRefs = {};
      Object.keys(prevCustom.stockSubCatRefs || {}).forEach(function(stk) {
        newRefs[stk] = (prevCustom.stockSubCatRefs[stk] || []).map(function(r) {
          if (r && r.cat === currentCat && r.subCat === oldName) return { cat: currentCat, subCat: nm };
          return r;
        });
      });
      
      
      
      var newTrades = Object.assign({}, prevData.trades || {});
      Object.keys(newTrades).forEach(function(dt) {
        var dd = newTrades[dt];
        if (!dd || !dd.newsCats || !dd.newsCats[currentCat]) return;
        var ccatData = dd.newsCats[currentCat];
        var newItems = (ccatData.newsItems || []).map(function(ni) {
          var nn = Object.assign({}, ni);
          if (nn.subCat === oldName) nn.subCat = nm;
          if (nn.tags && nn.tags.indexOf(oldName) >= 0) {
            var tagSeen = {};
            var newT = [];
            nn.tags.forEach(function(t) {
              var rep = (t === oldName) ? nm : t;
              if (!tagSeen[rep]) { tagSeen[rep] = true; newT.push(rep); }
            });
            nn.tags = newT;
          }
          return nn;
        });
        var newCcat = _objectSpread(_objectSpread({}, ccatData), {}, { newsItems: newItems });
        
        if (ccatData.subCatMemos && typeof ccatData.subCatMemos === "object" &&
            ccatData.subCatMemos[oldName] !== undefined) {
          var newScms = Object.assign({}, ccatData.subCatMemos);
          if (newScms[nm] === undefined) {
            newScms[nm] = newScms[oldName];
          }
          delete newScms[oldName];
          newCcat.subCatMemos = newScms;
        }
        var nc = _objectSpread({}, dd.newsCats);
        nc[currentCat] = newCcat;
        newTrades[dt] = _objectSpread(_objectSpread({}, dd), {}, { newsCats: nc });
      });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, {
          newsSubCats: newSubCats,
          newsSubCatDefaults: newSubDefs,
          stockSubCatRefs: newRefs
        }),
        trades: newTrades
      });
    });
    if (activeSubCat === oldName) setActiveSubCat(nm);
    return true;
  };
  var reorderSubCat = function(sc, dir) {
    var idx = subCatsForCur.indexOf(sc);
    if (idx < 0) return;
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= subCatsForCur.length) return;
    var arr = subCatsForCur.slice();
    var t = arr[newIdx]; arr[newIdx] = arr[idx]; arr[idx] = t;
    var newSubCats = Object.assign({}, custom.newsSubCats || {});
    newSubCats[currentCat] = arr;
    updCustom({ newsSubCats: newSubCats });
  };
  
  var togNewsSubCatDef = function(subCatName, tag) {
    var key = currentCat + "::" + subCatName;
    var cur = (custom.newsSubCatDefaults && custom.newsSubCatDefaults[key]) || [];
    var newSet = cur.indexOf(tag) >= 0 ? cur.filter(function(t){ return t !== tag; }) : cur.concat([tag]);
    var newDefs = Object.assign({}, custom.newsSubCatDefaults || {});
    if (newSet.length === 0) delete newDefs[key]; else newDefs[key] = newSet;
    updCustom({ newsSubCatDefaults: newDefs });
  };
  
  var togStockSubCatRefForMgmt = function(stk, subCatName) {
    if (!stk || !subCatName || stk === "日経平均株価") return;
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var prevRefs = prevCustom.stockSubCatRefs || {};
      var arr = (prevRefs[stk] || []).slice();
      var idx = arr.findIndex(function(r){ return r.cat === currentCat && r.subCat === subCatName; });
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push({ cat: currentCat, subCat: subCatName });
      var newRefs = Object.assign({}, prevRefs);
      if (arr.length === 0) delete newRefs[stk]; else newRefs[stk] = arr;
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, { stockSubCatRefs: newRefs })
      });
    });
  };
  var allNewsItems = catData.newsItems || [];
  
  
  var dedupedNewsItems = (function() {
    var seen = {};
    var out = [];
    allNewsItems.forEach(function(ni) {
      var gid = ni && ni.groupId;
      if (gid) {
        if (seen[gid]) return;
        seen[gid] = true;
      }
      out.push(ni);
    });
    return out;
  })();
  
  var newsItems = (function() {
    if (!hasSubCats) return dedupedNewsItems;
    if (activeSubCat === "__all__") return dedupedNewsItems;
    if (activeSubCat === "__none__") return allNewsItems.filter(function(ni) {
      return !ni.subCat || subCatsForCur.indexOf(ni.subCat) < 0;
    });
    return allNewsItems.filter(function(ni) { return ni.subCat === activeSubCat; });
  })();
  
  
  
  var _resolveAddSubCatMeta = function(subCatOverride) {
    var defaults = (custom.newsCatDefaults && Array.isArray(custom.newsCatDefaults[currentCat])) ? custom.newsCatDefaults[currentCat] : [];
    var subCat = null;
    var subDefaults = [];
    var effSubCat = (subCatOverride !== undefined && subCatOverride !== null) ? subCatOverride
      : ((hasSubCats && activeSubCat !== "__all__" && activeSubCat !== "__none__") ? activeSubCat : null);
    if (effSubCat) {
      subCat = effSubCat;
      var key = currentCat + "::" + effSubCat;
      if (custom.newsSubCatDefaults && Array.isArray(custom.newsSubCatDefaults[key])) {
        subDefaults = custom.newsSubCatDefaults[key];
      }
    }
    
    var seen = {};
    var mergedTags = [];
    [].concat(defaults, subDefaults).forEach(function(t) {
      if (t && !seen[t]) { seen[t] = true; mergedTags.push(t); }
    });
    return { subCat: subCat, tags: mergedTags };
  };
  var addNews = function addNews() {
    return updCatField("newsItems", function(prev) {
      var meta = _resolveAddSubCatMeta();
      var item = { id: Date.now(), text: "", images: [], tags: meta.tags };
      if (meta.subCat) item.subCat = meta.subCat;
      return [].concat(_toConsumableArray(prev || []), [item]);
    });
  };
  var addNewsWithFile = function addNewsWithFile(f, subCatOverride) {
    fileToImg(f).then(function(img) {
      if (img) {
        updCatField("newsItems", function(prev) {
          var meta = _resolveAddSubCatMeta(subCatOverride);
          var item = { id: Date.now(), text: "", images: [img], tags: meta.tags };
          if (meta.subCat) item.subCat = meta.subCat;
          return [].concat(_toConsumableArray(prev || []), [item]);
        });
      }
    });
  };
  var updNews = function updNews(id, uOrFn) {
    save(function(prevData) {
      return _propagateClones(prevData, id, function(n) {
        return typeof uOrFn === 'function' ? uOrFn(n) : uOrFn;
      });
    });
  };
  
  var setNiSubCat = function(niId, newSubCat) {
    updCatField("newsItems", function(prev) {
      return (prev || []).map(function(n) {
        if (n.id !== niId) return n;
        var nn = _objectSpread({}, n);
        if (newSubCat) {
          nn.subCat = newSubCat;
        } else {
          delete nn.subCat;
        }
        return nn;
      });
    });
  };
  
  var _delThisClone = function(id) {
    return updCatField("newsItems", function(prev) {
      return (prev || []).filter(function (n) { return n.id !== id; });
    });
  };
  
  var _delAllClones = function(id) {
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      
      var origItem = null;
      Object.keys(prevAllCats).some(function(c) {
        return (prevAllCats[c].newsItems || []).some(function(n) {
          if (n.id === id) { origItem = n; return true; }
          return false;
        });
      });
      if (!origItem) return prevData;
      var gid = origItem.groupId || null;
      
      var matches = function(n) {
        if (n.id === id) return true;
        if (gid && (n.groupId === gid || n.id === gid)) return true;
        return false;
      };
      var newCats = {};
      Object.keys(prevAllCats).forEach(function(c) {
        var cd = prevAllCats[c];
        var newItems = (cd.newsItems || []).filter(function(n) { return !matches(n); });
        newCats[c] = _objectSpread(_objectSpread({}, cd), {}, { newsItems: newItems });
      });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date,
          _objectSpread(_objectSpread({}, prevDd), {}, { newsCats: newCats })))
      });
    });
  };
  
  var delNews = function delNews(id) {
    var clones = _findClones(id);
    if (clones.length > 0) {
      
      setDelConfirmTarget({ niId: id, cloneCount: clones.length + 1 });
      return;
    }
    return _delThisClone(id);
  };
  
  
  
  
  var moveNewsItem = function(niId, fromCat, fromSubCat, toCat, toSubCat, toDate) {
    if (!niId || !fromCat || !toCat) return;
    var targetDate = toDate || date;
    save(function(prevData) {
      var prevTrades = prevData.trades || {};
      var prevFromDd = prevTrades[date] || {};
      var prevFromAllCats = getAllNewsCatsData(prevFromDd);
      var fromCatData = prevFromAllCats[fromCat] || { newsItems: [] };
      var fromItems = fromCatData.newsItems || [];
      var idx = fromItems.findIndex(function(n){ return n.id === niId; });
      if (idx < 0) return prevData;
      var theItem = fromItems[idx];
      var movedItem = _objectSpread({}, theItem);
      if (toSubCat) movedItem.subCat = toSubCat;
      else delete movedItem.subCat;
      
      var newFromItems = fromItems.slice();
      newFromItems.splice(idx, 1);
      var newFromCatData = _objectSpread(_objectSpread({}, fromCatData), {}, {
        newsItems: newFromItems
      });
      
      if (targetDate === date) {
        
        var toCatData = (fromCat === toCat) ? newFromCatData : (prevFromAllCats[toCat] || { newsItems: [] });
        var newToItems = (toCatData.newsItems || []).concat([movedItem]);
        var newToCatData = _objectSpread(_objectSpread({}, toCatData), {}, { newsItems: newToItems });
        var newCats = _objectSpread({}, prevFromAllCats);
        newCats[fromCat] = newFromCatData;
        newCats[toCat] = newToCatData;
        return _objectSpread(_objectSpread({}, prevData), {}, {
          trades: _objectSpread(_objectSpread({}, prevTrades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevFromDd), {}, {
            newsCats: newCats
          })))
        });
      } else {
        
        var newFromCats = _objectSpread({}, prevFromAllCats);
        newFromCats[fromCat] = newFromCatData;
        var prevToDd = prevTrades[targetDate] || {};
        var prevToAllCats = getAllNewsCatsData(prevToDd);
        var toCatData2 = prevToAllCats[toCat] || { newsItems: [] };
        var newToItems2 = (toCatData2.newsItems || []).concat([movedItem]);
        var newToCatData2 = _objectSpread(_objectSpread({}, toCatData2), {}, { newsItems: newToItems2 });
        var newToCats = _objectSpread({}, prevToAllCats);
        newToCats[toCat] = newToCatData2;
        var newTrades = _objectSpread({}, prevTrades);
        newTrades[date] = _objectSpread(_objectSpread({}, prevFromDd), {}, { newsCats: newFromCats });
        newTrades[targetDate] = _objectSpread(_objectSpread({}, prevToDd), {}, { newsCats: newToCats });
        return _objectSpread(_objectSpread({}, prevData), {}, { trades: newTrades });
      }
    });
  };
  
  
  
  var cloneNewsItem = function(niId, fromCat, targets) {
    if (!niId || !fromCat || !targets || !targets.length) return;
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      var fromCatData = prevAllCats[fromCat] || { newsItems: [] };
      var theItem = (fromCatData.newsItems || []).find(function(n){ return n.id === niId; });
      if (!theItem) return prevData;
      var groupId = theItem.groupId || theItem.id;
      
      var newCats = _objectSpread({}, prevAllCats);
      if (!theItem.groupId) {
        var newFromItems = (fromCatData.newsItems || []).map(function(n) {
          if (n.id !== niId) return n;
          return _objectSpread(_objectSpread({}, n), {}, { groupId: groupId });
        });
        newCats[fromCat] = _objectSpread(_objectSpread({}, fromCatData), {}, { newsItems: newFromItems });
      }
      
      targets.forEach(function(t) {
        if (!t || !t.cat) return;
        var tgtCatData = newCats[t.cat] || { newsItems: [] };
        var tgtItems = (tgtCatData.newsItems || []).slice();
        
        var sameKey = function(n){
          var sc1 = n.subCat || ""; var sc2 = t.subCat || "";
          return (n.groupId === groupId || n.id === groupId) && sc1 === sc2;
        };
        if (tgtItems.some(sameKey)) return;
        var newClone = _objectSpread(_objectSpread({}, theItem), {}, {
          id: Date.now() + Math.floor(Math.random() * 100000),
          groupId: groupId
        });
        if (t.subCat) newClone.subCat = t.subCat;
        else delete newClone.subCat;
        tgtItems.push(newClone);
        newCats[t.cat] = _objectSpread(_objectSpread({}, tgtCatData), {}, { newsItems: tgtItems });
      });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, {
          newsCats: newCats
        })))
      });
    });
  };
  
  
  var _propagateClones = function(prevData, niId, updateFn) {
    var prevDd = (prevData.trades && prevData.trades[date]) || {};
    var prevAllCats = getAllNewsCatsData(prevDd);
    
    var origItem = null;
    Object.keys(prevAllCats).some(function(c) {
      var arr = prevAllCats[c].newsItems || [];
      return arr.some(function(n) { if (n.id === niId) { origItem = n; return true; } return false; });
    });
    if (!origItem) return prevData;
    var groupId = origItem.groupId || null;
    var matches = function(n) {
      if (n.id === niId) return true;
      if (groupId && (n.groupId === groupId || n.id === groupId)) return true;
      return false;
    };
    var newCats = {};
    var changed = false;
    Object.keys(prevAllCats).forEach(function(c) {
      var cd = prevAllCats[c];
      var newItems = (cd.newsItems || []).map(function(n) {
        if (!matches(n)) return n;
        var u = updateFn(n);
        if (!u) return n;
        
        var preservedSubCat = n.subCat;
        var merged = _objectSpread(_objectSpread({}, n), u);
        if (preservedSubCat !== undefined) merged.subCat = preservedSubCat;
        else delete merged.subCat;
        merged.id = n.id;
        if (n.groupId) merged.groupId = n.groupId;
        changed = true;
        return merged;
      });
      newCats[c] = _objectSpread(_objectSpread({}, cd), {}, { newsItems: newItems });
    });
    if (!changed) return prevData;
    return _objectSpread(_objectSpread({}, prevData), {}, {
      trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, {
        newsCats: newCats
      })))
    });
  };
  
  var _findClones = function(niId) {
    var allCats = getAllNewsCatsData(dd);
    var origItem = null;
    Object.keys(allCats).some(function(c) {
      return (allCats[c].newsItems || []).some(function(n) { if (n.id === niId) { origItem = n; return true; } return false; });
    });
    if (!origItem) return [];
    var gid = origItem.groupId || null;
    if (!gid) return [];
    var locs = [];
    Object.keys(allCats).forEach(function(c) {
      (allCats[c].newsItems || []).forEach(function(n) {
        if (n.id === niId) return; 
        if (n.groupId === gid || n.id === gid) {
          locs.push({ cat: c, subCat: n.subCat || "", id: n.id });
        }
      });
    });
    return locs;
  };
  var togNiTag = function togNiTag(niId, tag) {
    save(function(prevData) {
      return _propagateClones(prevData, niId, function(n) {
        var tags = n.tags || [];
        return {
          tags: tags.includes(tag) ? tags.filter(function (x) { return x !== tag; }) : [].concat(_toConsumableArray(tags), [tag])
        };
      });
    });
  };
  var onAddNiTag = function onAddNiTag(niId, name, cat) {
    var tag = cat ? cat + ":" + name : "カスタム:" + name;
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var cur = prevCustom.cats || {};
      var nc = prevCustom;
      if (cat) {
        if (!(cur[cat] || []).includes(name)) nc = _objectSpread(_objectSpread({}, prevCustom), {}, {
          cats: _objectSpread(_objectSpread({}, cur), {}, _defineProperty({}, cat, [].concat(_toConsumableArray(cur[cat] || []), [name])))
        });
      } else {
        if (!(prevCustom.tags || []).includes(tag)) nc = _objectSpread(_objectSpread({}, prevCustom), {}, {
          tags: [].concat(_toConsumableArray(prevCustom.tags || []), [tag])
        });
      }
      
      var withTag = _propagateClones(prevData, niId, function(n) {
        var niTags = n.tags || [];
        return { tags: niTags.includes(tag) ? niTags : [].concat(_toConsumableArray(niTags), [tag]) };
      });
      return _objectSpread(_objectSpread({}, withTag), {}, { custom: nc });
    });
  };
  var updCustom = function updCustom(nc) {
    return save(function(prevData) {
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevData.custom || {}), nc)
      });
    });
  };
  var addNewsCat = function addNewsCat(name) {
    return updCustom({
      newsCategories: [].concat(_toConsumableArray(newsCategories), [name])
    });
  };
  var delNewsCat = function delNewsCat(name) {
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var ns = (prevCustom.newsCategories || []).filter(function (c) {
        return c !== name;
      });
      var newDefaults = Object.assign({}, prevCustom.newsCatDefaults || {});
      delete newDefaults[name];
      
      var prevExtraCats = (prevCustom.shvExtraCats && typeof prevCustom.shvExtraCats === "object" && !Array.isArray(prevCustom.shvExtraCats)) ? prevCustom.shvExtraCats : {};
      var newExtraCats = {};
      var _delPrefix = name + "::";
      Object.keys(prevExtraCats).forEach(function(stk) {
        var arr = (prevExtraCats[stk] || []).filter(function(k) {
          return k !== name && k.indexOf(_delPrefix) !== 0;
        });
        if (arr.length > 0) newExtraCats[stk] = arr;
      });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, {
          newsCategories: ns.length > 0 ? ns : [].concat(DEF_NEWS_CATS),
          newsCatDefaults: newDefaults,
          shvExtraCats: newExtraCats
        })
      });
    });
  };
  
  var renameNewsCat = function(oldName, newName) {
    var nm = (newName || "").trim();
    if (!nm || nm === oldName) return false;
    if (newsCategories.indexOf(nm) >= 0) return false; 
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      
      var newCats = (prevCustom.newsCategories || []).map(function(c){ return c === oldName ? nm : c; });
      
      var newCatDefs = Object.assign({}, prevCustom.newsCatDefaults || {});
      if (newCatDefs[oldName] != null) {
        newCatDefs[nm] = newCatDefs[oldName];
        delete newCatDefs[oldName];
      }
      
      var newSubCats = Object.assign({}, prevCustom.newsSubCats || {});
      if (newSubCats[oldName] != null) {
        newSubCats[nm] = newSubCats[oldName];
        delete newSubCats[oldName];
      }
      
      var newSubDefs = {};
      Object.keys(prevCustom.newsSubCatDefaults || {}).forEach(function(k) {
        var parts = k.split("::");
        if (parts.length === 2 && parts[0] === oldName) {
          newSubDefs[nm + "::" + parts[1]] = prevCustom.newsSubCatDefaults[k];
        } else {
          newSubDefs[k] = prevCustom.newsSubCatDefaults[k];
        }
      });
      
      var newRefs = {};
      Object.keys(prevCustom.stockSubCatRefs || {}).forEach(function(stk) {
        newRefs[stk] = (prevCustom.stockSubCatRefs[stk] || []).map(function(r) {
          if (r && r.cat === oldName) return { cat: nm, subCat: r.subCat };
          return r;
        });
      });
      
      var newTrades = Object.assign({}, prevData.trades || {});
      Object.keys(newTrades).forEach(function(dt) {
        var dd = newTrades[dt];
        if (!dd || !dd.newsCats) return;
        if (dd.newsCats[oldName] != null) {
          var nc = Object.assign({}, dd.newsCats);
          nc[nm] = nc[oldName];
          delete nc[oldName];
          newTrades[dt] = _objectSpread(_objectSpread({}, dd), {}, { newsCats: nc });
        }
      });
      
      var prevExtraCats = (prevCustom.shvExtraCats && typeof prevCustom.shvExtraCats === "object" && !Array.isArray(prevCustom.shvExtraCats)) ? prevCustom.shvExtraCats : {};
      var newExtraCats = {};
      var _renPrefix = oldName + "::";
      Object.keys(prevExtraCats).forEach(function(stk) {
        var arr = (prevExtraCats[stk] || []).map(function(k) {
          if (k === oldName) return nm;
          if (k.indexOf(_renPrefix) === 0) return nm + "::" + k.slice(_renPrefix.length);
          return k;
        });
        if (arr.length > 0) newExtraCats[stk] = arr;
      });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, {
          newsCategories: newCats,
          newsCatDefaults: newCatDefs,
          newsSubCats: newSubCats,
          newsSubCatDefaults: newSubDefs,
          stockSubCatRefs: newRefs,
          shvExtraCats: newExtraCats
        }),
        trades: newTrades
      });
    });
    if (activeCat === oldName) setActiveCat(nm);
    return true;
  };
  var reorderNewsCat = function(cat, dir) {
    var idx = newsCategories.indexOf(cat);
    if (idx < 0) return;
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= newsCategories.length) return;
    var arr = newsCategories.slice();
    var t = arr[newIdx]; arr[newIdx] = arr[idx]; arr[idx] = t;
    updCustom({ newsCategories: arr });
  };
  var moveMainCatToSubCat = function(cat, targetMainCat) {
    if (!cat || !targetMainCat || cat === targetMainCat) return;
    save(function(prevData) {
      var pc = prevData.custom || {};
      var newCats = (pc.newsCategories || []).filter(function(c) { return c !== cat; });
      var newSubCats = Object.assign({}, pc.newsSubCats || {});
      var targetSubs = (newSubCats[targetMainCat] || []).slice();
      if (targetSubs.indexOf(cat) < 0) targetSubs.push(cat);
      newSubCats[targetMainCat] = targetSubs;
      var newCatDefs = Object.assign({}, pc.newsCatDefaults || {});
      var newSubDefs = Object.assign({}, pc.newsSubCatDefaults || {});
      if (newCatDefs[cat]) { newSubDefs[targetMainCat + "::" + cat] = newCatDefs[cat]; delete newCatDefs[cat]; }
      var prevEC = pc.shvExtraCats || {}, newEC = {}, pfx = cat + "::";
      Object.keys(prevEC).forEach(function(stk) {
        newEC[stk] = (prevEC[stk] || []).map(function(k) {
          if (k === cat) return targetMainCat + "::" + cat;
          if (k.indexOf(pfx) === 0) return targetMainCat + "::" + k;
          return k;
        });
      });

      var newTrades = Object.assign({}, prevData.trades || {});
      Object.keys(newTrades).forEach(function(dt) {
        var dd2 = newTrades[dt];
        if (!dd2 || !dd2.newsCats || !dd2.newsCats[cat]) return;
        var fromData = dd2.newsCats[cat];
        var nc = Object.assign({}, dd2.newsCats);
        var toData = nc[targetMainCat] || {};
        var movedItems = (fromData.newsItems || []).map(function(ni) { return Object.assign({}, ni, { subCat: cat }); });
        var fm = fromData.newsMemo;
        if (fm && ((fm.text && String(fm.text).trim()) || (fm.images && fm.images.length))) {
          movedItems.push({ id: "nimemo_" + cat + "_" + dt, text: fm.text || "", images: (fm.images || []).slice(), subCat: cat });
        }
        var newToTags = (toData.marketTags || []).slice();
        (fromData.marketTags || []).forEach(function(t) { if (newToTags.indexOf(t) < 0) newToTags.push(t); });
        nc[targetMainCat] = Object.assign({}, toData, { newsItems: (toData.newsItems || []).concat(movedItems), marketTags: newToTags });
        delete nc[cat];
        newTrades[dt] = Object.assign({}, dd2, { newsCats: nc });
      });
      return Object.assign({}, prevData, { trades: newTrades, custom: Object.assign({}, pc, { newsCategories: newCats.length > 0 ? newCats : [].concat(DEF_NEWS_CATS), newsSubCats: newSubCats, newsCatDefaults: newCatDefs, newsSubCatDefaults: newSubDefs, shvExtraCats: newEC }) });
    });
  };
  var bulkMoveNewsData = function(fromKey, toKey, fromParentCat) {
    if (!fromKey || !toKey || fromKey === toKey) return;
    save(function(prevData) {
      var pc = prevData.custom || {};
      var newTrades = Object.assign({}, prevData.trades || {});
      Object.keys(newTrades).forEach(function(dt) {
        var dd2 = newTrades[dt];
        if (!dd2 || !dd2.newsCats || !dd2.newsCats[fromKey]) return;
        var fromData = dd2.newsCats[fromKey], toData = dd2.newsCats[toKey] || {};
        var nc = Object.assign({}, dd2.newsCats);
        nc[toKey] = Object.assign({}, toData, { newsItems: (toData.newsItems || []).concat(fromData.newsItems || []) });
        delete nc[fromKey];
        newTrades[dt] = Object.assign({}, dd2, { newsCats: nc });
      });
      var newCats = (pc.newsCategories || []).slice();
      var newSubCats = Object.assign({}, pc.newsSubCats || {});
      var isMain = newCats.indexOf(fromKey) >= 0;
      if (isMain) { newCats = newCats.filter(function(c) { return c !== fromKey; }); delete newSubCats[fromKey]; }
      if (fromParentCat) newSubCats[fromParentCat] = (newSubCats[fromParentCat] || []).filter(function(s) { return s !== fromKey; });
      return Object.assign({}, prevData, { custom: Object.assign({}, pc, { newsCategories: (isMain && newCats.length === 0) ? [].concat(DEF_NEWS_CATS) : newCats, newsSubCats: newSubCats }), trades: newTrades });
    });
  };
  var catHasData = function catHasData(cat) {
    return hasCatContent(getCatData(dd, cat));
  };
  var isOrphan = function isOrphan(cat) {
    return orphanCats.includes(cat);
  };
  
  var onNewsDragStart = function(idx, e) {
    e.preventDefault(); e.stopPropagation();
    var t = e.touches ? e.touches[0] : e;
    newsDragRef.current = { idx: idx, startX: t.clientX, startY: t.clientY, moved: false };
    setDragFromIdx(idx);
    setDragInsert(idx);
    var onMove = function(ev) {
      if (!newsDragRef.current) return;
      var p = ev.touches ? ev.touches[0] : ev;
      newsDragRef.current.moved = true;
      var cont = newsContainerRef.current;
      if (!cont) return;
      var cards = cont.querySelectorAll("[data-newscard]");
      var px = p.clientX;
      var best = newsDragRef.current.idx, bestDist = Infinity;
      cards.forEach(function(card, ci) {
        var r = card.getBoundingClientRect();
        var mid = r.left + r.width / 2;
        var d = Math.abs(px - mid);
        if (d < bestDist) { bestDist = d; best = ci; }
      });
      
      if (cards.length > 0) {
        var lastR = cards[cards.length - 1].getBoundingClientRect();
        if (px > lastR.right) best = cards.length;
      }
      setDragInsert(best);
    };
    var onEnd = function() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove, {passive: false});
      document.removeEventListener("touchend", onEnd);
      if (newsDragRef.current && newsDragRef.current.moved) {
        var from = newsDragRef.current.idx;
        
        var fromId = newsItems[from] && newsItems[from].id;
        setDragInsert(function(toIdx) {
          if (toIdx !== null && toIdx !== from && fromId != null) {
            var targetId = (toIdx >= newsItems.length) ? null : (newsItems[toIdx] && newsItems[toIdx].id);
            updCatField("newsItems", function(prev) {
              if (!prev) return prev;
              var arr = _toConsumableArray(prev);
              var realFrom = arr.findIndex(function(n){ return n.id === fromId; });
              if (realFrom < 0) return prev;
              var item = arr.splice(realFrom, 1)[0];
              var realTo;
              if (targetId == null) {
                realTo = arr.length;
              } else {
                realTo = arr.findIndex(function(n){ return n.id === targetId; });
                if (realTo < 0) realTo = arr.length;
              }
              arr.splice(realTo, 0, item);
              return arr;
            });
          }
          return null;
        });
      } else {
        setDragInsert(null);
      }
      newsDragRef.current = null;
      setDragFromIdx(null);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, {passive: false});
    document.addEventListener("touchend", onEnd);
  };
  var Card = {
    background: "#fff",
    border: "1px solid #e0ddd6",
    borderRadius: 10,
    padding: "16px 14px",
    marginBottom: 12
  };
  return React.createElement("div", null,
  
  chartReturnCtx && typeof onChartReturn === "function" && React.createElement("div", {
    style: { marginBottom: 10 }
  }, React.createElement("button", {
    onClick: function() { onChartReturn(); },
    style: {
      padding: "7px 12px", fontSize: 12, fontWeight: 600,
      background: "#EEF2FF", color: "#4F46E5",
      border: "1px solid #C7D2FE", borderRadius: 6,
      cursor: "pointer"
    }
  }, "\u2190 " + (chartReturnCtx.stock || "\u30C1\u30E3\u30FC\u30C8") + " \u306B\u623B\u308B")),
  
  delConfirmTarget != null && React.createElement("div", {
    onClick: function() { setDelConfirmTarget(null); },
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: {
      background: "#fff", borderRadius: 12,
      maxWidth: 420, width: "100%", display: "flex", flexDirection: "column"
    }
  },
    React.createElement("div", {
      style: { padding: "14px 16px", borderBottom: "1px solid #e0ddd6", fontSize: 14, fontWeight: 700 }
    }, "\uD83D\uDDD1 \u30AF\u30ED\u30FC\u30F3\u8A18\u4E8B\u306E\u524A\u9664"),
    React.createElement("div", {
      style: { padding: "12px 16px", fontSize: 13, color: "#444", lineHeight: 1.6 }
    },
      React.createElement("div", null,
        "\u3053\u306E\u8A18\u4E8B\u306F ",
        React.createElement("strong", { style: { color: "#6366F1" } }, delConfirmTarget.cloneCount + " \u4EF6"),
        " \u306E\u30AF\u30ED\u30FC\u30F3\u3068\u9023\u643A\u3057\u3066\u3044\u307E\u3059\u3002"),
      React.createElement("div", { style: { marginTop: 6, fontSize: 12, color: "#888" } },
        "\u3069\u306E\u7BC4\u56F2\u3067\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")
    ),
    React.createElement("div", {
      style: { padding: "10px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }
    },
      React.createElement("button", {
        onClick: function() {
          var t = delConfirmTarget; setDelConfirmTarget(null);
          _delThisClone(t.niId);
        },
        style: {
          padding: "10px 14px", fontSize: 13, fontWeight: 700, textAlign: "left",
          background: "#fff", color: "#1a1a1a", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer"
        }
      },
        React.createElement("div", null, "\u3053\u306E\u30AF\u30ED\u30FC\u30F3\u306E\u307F\u524A\u9664"),
        React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 400, marginTop: 2 } },
          "\u4ED6\u306E " + (delConfirmTarget.cloneCount - 1) + " \u4EF6\u306F\u6B8B\u308A\u307E\u3059")
      ),
      React.createElement("button", {
        onClick: function() {
          var t = delConfirmTarget; setDelConfirmTarget(null);
          _delAllClones(t.niId);
        },
        style: {
          padding: "10px 14px", fontSize: 13, fontWeight: 700, textAlign: "left",
          background: "#fff", color: "#DC2626", border: "1px solid #FCA5A5",
          borderRadius: 6, cursor: "pointer"
        }
      },
        React.createElement("div", null, "\u5168\u30AF\u30ED\u30FC\u30F3\u3092\u524A\u9664 (" + delConfirmTarget.cloneCount + " \u4EF6)"),
        React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 400, marginTop: 2 } },
          "\u3053\u306E\u8A18\u4E8B\u306F\u3069\u3053\u306B\u3082\u8868\u793A\u3055\u308C\u306A\u304F\u306A\u308A\u307E\u3059")
      ),
      React.createElement("button", {
        onClick: function() { setDelConfirmTarget(null); },
        style: {
          padding: "8px 14px", fontSize: 12, fontWeight: 600,
          background: "#f5f4f0", color: "#666", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer", marginTop: 4
        }
      }, "\u30AD\u30E3\u30F3\u30BB\u30EB")
    )
  )),
  
  moveTarget != null && React.createElement("div", {
    onClick: function() { setMoveTarget(null); },
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: {
      background: "#fff", borderRadius: 12,
      maxWidth: 520, width: "100%", maxHeight: "90vh",
      display: "flex", flexDirection: "column"
    }
  },
    React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #e0ddd6", flexShrink: 0
      }
    },
      React.createElement("span", {
        style: { fontSize: 14, fontWeight: 700 }
      }, moveMode === "clone" ? "\uD83D\uDD17 \u8A18\u4E8B\u3092\u8907\u88FD" : "\u21AA \u8A18\u4E8B\u3092\u79FB\u52D5"),
      React.createElement("button", {
        onClick: function(){ setMoveTarget(null); },
        style: {
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer"
        }
      }, "\u30AD\u30E3\u30F3\u30BB\u30EB")
    ),
    
    React.createElement("div", {
      style: {
        display: "flex", borderBottom: "1px solid #e0ddd6", flexShrink: 0
      }
    },
      [["move", "\u21AA \u79FB\u52D5"], ["clone", "\uD83D\uDD17 \u8907\u88FD"]].map(function(p) {
        var k = p[0], la = p[1];
        var on = moveMode === k;
        return React.createElement("button", {
          key: k,
          onClick: function(){ setMoveMode(k); },
          style: {
            flex: 1, padding: "9px 12px", fontSize: 13, fontWeight: 700,
            background: on ? "#1a1a1a" : "#fff",
            color: on ? "#fff" : "#888",
            border: "none", cursor: "pointer"
          }
        }, la);
      })
    ),
    React.createElement("div", {
      style: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }
    },
      React.createElement("div", {
        style: { fontSize: 12, color: "#666", lineHeight: 1.5 }
      },
        React.createElement("div", null, "\u73FE\u5728: ", date, " / ", moveTarget.fromCat, moveTarget.fromSubCat ? " \u203A " + moveTarget.fromSubCat : " \u203A (\u672A\u5206\u985E)")
      ),
      
      moveMode === "move" && React.createElement(React.Fragment, null,
        
        React.createElement("div", {
          style: { fontSize: 11, color: "#666", lineHeight: 1.5, padding: "6px 8px", background: "#E0F2FE", borderRadius: 6, border: "1px solid #BAE6FD" }
        }, "\uD83D\uDCCD \u8A18\u4E8B\u3092\u5225\u306E\u5834\u6240 (\u65E5\u4ED8\u30FB\u30AB\u30C6\u30B4\u30EA\u30FB\u30B5\u30D6\u30BF\u30D6) \u306B\u79FB\u3057\u307E\u3059\u3002\u5143\u306E\u5834\u6240\u304B\u3089\u306F\u6D88\u3048\u307E\u3059\u3002"),
        
        React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }
          }, "\u79FB\u52D5\u5148\u65E5\u4ED8"),
          React.createElement("input", {
            type: "date",
            value: moveToDate,
            onChange: function(e){ setMoveToDate(e.target.value); },
            style: {
              width: "100%", fontSize: 13, padding: "6px 8px",
              border: "1px solid #ccc", borderRadius: 5, background: "#fff",
              boxSizing: "border-box"
            }
          })
        ),
        
        React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }
          }, "\u79FB\u52D5\u5148\u30E1\u30A4\u30F3\u30AB\u30C6\u30B4\u30EA"),
          React.createElement("select", {
            value: moveToCat,
            onChange: function(e) {
              var c = e.target.value;
              setMoveToCat(c);
              setMoveToSubCat("");
            },
            style: {
              width: "100%", fontSize: 13, padding: "6px 8px",
              border: "1px solid #ccc", borderRadius: 5, background: "#fff"
            }
          }, displayCats.map(function(c) {
            return React.createElement("option", { key: c, value: c }, c);
          }))
        ),
        
        React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }
          }, "\u79FB\u52D5\u5148\u30B5\u30D6\u30BF\u30D6"),
          React.createElement("select", {
            value: moveToSubCat,
            onChange: function(e) { setMoveToSubCat(e.target.value); },
            style: {
              width: "100%", fontSize: 13, padding: "6px 8px",
              border: "1px solid #ccc", borderRadius: 5, background: "#fff"
            }
          },
            React.createElement("option", { value: "" }, "(\u672A\u5206\u985E)"),
            ((moveToCat && custom.newsSubCats && custom.newsSubCats[moveToCat]) || []).map(function(sc) {
              return React.createElement("option", { key: sc, value: sc }, sc);
            })
          )
        ),
        
        (function() {
          var same = moveToDate === date && moveTarget.fromCat === moveToCat && (moveTarget.fromSubCat || "") === (moveToSubCat || "");
          return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
            same ? React.createElement("span", {
              style: { fontSize: 11, color: "#888" }
            }, "\u540C\u3058\u5834\u6240\u3067\u3059") : null,
            React.createElement("button", {
              onClick: function() {
                if (same) { setMoveTarget(null); return; }
                moveNewsItem(moveTarget.niId, moveTarget.fromCat, moveTarget.fromSubCat, moveToCat, moveToSubCat, moveToDate);
                setMoveTarget(null);
              },
              disabled: same,
              style: {
                marginLeft: "auto", padding: "8px 18px", fontSize: 13, fontWeight: 700,
                background: same ? "#ccc" : "#10B981",
                color: "#fff", border: "none", borderRadius: 6,
                cursor: same ? "not-allowed" : "pointer"
              }
            }, "\u79FB\u52D5\u3059\u308B")
          );
        })()
      ),
      
      moveMode === "clone" && React.createElement(React.Fragment, null,
        React.createElement("div", {
          style: { fontSize: 11, color: "#666", lineHeight: 1.5, padding: "6px 8px", background: "#FEF3C7", borderRadius: 6, border: "1px solid #FDE68A" }
        }, "\uD83D\uDD17 \u8907\u88FD\u3055\u308C\u305F\u8A18\u4E8B\u306F\u300C\u30AF\u30ED\u30FC\u30F3\u300D\u3068\u3057\u3066\u30EA\u30F3\u30AF\u3055\u308C\u3001\u672C\u6587\u30FB\u753B\u50CF\u30FB\u30BF\u30B0\u306E\u7DE8\u96C6\u306F\u5168\u30AF\u30ED\u30FC\u30F3\u306B\u53CD\u6620\u3055\u308C\u307E\u3059\u3002",
          React.createElement("br", null),
          "\u26A0\uFE0F \u8907\u88FD\u306F\u540C\u3058\u65E5\u4ED8\u5185\u306E\u307F\u3002\u5225\u306E\u65E5\u4ED8\u306B\u30B3\u30D4\u30FC\u3057\u305F\u3044\u5834\u5408\u306F\u300C\u21AA \u79FB\u52D5\u300D\u30BF\u30D6\u3067\u65E5\u4ED8\u3092\u5909\u3048\u3066\u304F\u3060\u3055\u3044\u3002"),
        
        React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }
          }, "\u8907\u88FD\u5148 (\u8907\u6570\u9078\u629E\u53EF\u80FD)"),
          React.createElement("div", {
            style: {
              border: "1px solid #ddd", borderRadius: 6, padding: 8,
              maxHeight: 280, overflowY: "auto", background: "#fafaf8"
            }
          },
            displayCats.map(function(c) {
              var subs = (custom.newsSubCats && custom.newsSubCats[c]) || [];
              
              var entries = [["", c + " \u203A (\u672A\u5206\u985E)"]];
              subs.forEach(function(sc){ entries.push([sc, c + " \u203A " + sc]); });
              return React.createElement("div", {
                key: c,
                style: { marginBottom: 6 }
              }, entries.map(function(p) {
                var sc = p[0], la = p[1];
                
                var isOrig = (c === moveTarget.fromCat) && ((moveTarget.fromSubCat || "") === sc);
                var checked = cloneTargets.some(function(t){ return t.cat === c && (t.subCat || "") === sc; });
                return React.createElement("label", {
                  key: c + "::" + sc,
                  style: {
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 6px", fontSize: 12,
                    color: isOrig ? "#bbb" : "#333",
                    cursor: isOrig ? "not-allowed" : "pointer",
                    borderRadius: 4
                  }
                },
                  React.createElement("input", {
                    type: "checkbox",
                    checked: checked,
                    disabled: isOrig,
                    onChange: function(){
                      if (isOrig) return;
                      setCloneTargets(function(prev) {
                        var idx = prev.findIndex(function(t){ return t.cat === c && (t.subCat || "") === sc; });
                        if (idx >= 0) {
                          var nx = prev.slice(); nx.splice(idx, 1); return nx;
                        } else {
                          return prev.concat([{ cat: c, subCat: sc }]);
                        }
                      });
                    }
                  }),
                  React.createElement("span", null, la),
                  isOrig ? React.createElement("span", { style: { fontSize: 10, color: "#bbb", marginLeft: "auto" } }, "(\u73FE\u5728\u4F4D\u7F6E)") : null
                );
              }));
            })
          )
        ),
        
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          React.createElement("span", {
            style: { fontSize: 11, color: "#888" }
          }, cloneTargets.length, " \u4EF6\u9078\u629E\u4E2D"),
          React.createElement("button", {
            onClick: function() {
              if (cloneTargets.length === 0) { setMoveTarget(null); return; }
              cloneNewsItem(moveTarget.niId, moveTarget.fromCat, cloneTargets);
              setCloneTargets([]);
              setMoveTarget(null);
            },
            disabled: cloneTargets.length === 0,
            style: {
              marginLeft: "auto", padding: "8px 18px", fontSize: 13, fontWeight: 700,
              background: cloneTargets.length === 0 ? "#ccc" : "#6366F1",
              color: "#fff", border: "none", borderRadius: 6,
              cursor: cloneTargets.length === 0 ? "not-allowed" : "pointer"
            }
          }, "\u8907\u88FD\u3059\u308B")
        )
      )
    )
  )),
  
  subCatAddOpen && React.createElement("div", {
    onClick: function() { setSubCatAddOpen(false); },
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: {
      background: "#fff", borderRadius: 12,
      maxWidth: 520, width: "100%", maxHeight: "90vh",
      display: "flex", flexDirection: "column"
    }
  },
    React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #e0ddd6", flexShrink: 0
      }
    },
      React.createElement("span", {
        style: { fontSize: 14, fontWeight: 700 }
      }, "\uFF0B \u30B5\u30D6\u30BF\u30D6\u8FFD\u52A0\uFF08", currentCat, "\uFF09"),
      React.createElement("button", {
        onClick: function(){ setSubCatAddOpen(false); },
        style: {
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28
        }
      }, "\u30AD\u30E3\u30F3\u30BB\u30EB")
    ),
    React.createElement("div", {
      style: { padding: "12px 16px", overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }
    },
      
      React.createElement("div", null,
        React.createElement("div", {
          style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }
        }, "\u30B5\u30D6\u30BF\u30D6\u540D"),
        React.createElement(FastInput, {
          type: "text",
          value: subCatAddName,
          onChange: function(v){ setSubCatAddName(v); },
          debounceMs: 0,
          placeholder: "\u4F8B: \u9632\u885B\u3001INPEX",
          autoFocus: true,
          style: {
            width: "100%", fontSize: 14, padding: "8px 10px",
            border: "1px solid #ccc", borderRadius: 6, boxSizing: "border-box"
          }
        })
      ),
      
      React.createElement("div", null,
        React.createElement("div", {
          style: { display: "flex", alignItems: "center", marginBottom: 6 }
        },
          React.createElement("span", {
            style: { fontSize: 11, color: "#888", fontWeight: 600 }
          }, "\u7D10\u4ED8\u3051\u308B\u9298\u67C4 (\u9078\u629E\u3057\u305F\u9298\u67C4\u306E\u9298\u67C4\u8A18\u9332\u6B04\u306B\u95A2\u9023\u30CB\u30E5\u30FC\u30B9\u3068\u3057\u3066\u8868\u793A\u3055\u308C\u307E\u3059)"),
          React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 4 } },
            React.createElement("button", {
              onClick: function() {
                var m = {};
                (allStocks || []).forEach(function(s){ if (s !== "日経平均株価") m[s] = true; });
                setSubCatAddStocksMap(m);
              },
              style: {
                fontSize: 10, padding: "2px 7px", background: "#f5f4f0",
                color: "#666", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer"
              }
            }, "\u3059\u3079\u3066\u9078\u629E"),
            React.createElement("button", {
              onClick: function() { setSubCatAddStocksMap({}); },
              style: {
                fontSize: 10, padding: "2px 7px", background: "#f5f4f0",
                color: "#666", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer"
              }
            }, "\u3059\u3079\u3066\u89E3\u9664")
          )
        ),
        React.createElement("div", {
          style: {
            display: "flex", flexWrap: "wrap", gap: 5,
            padding: 8, border: "1px solid #e0ddd6", borderRadius: 6,
            maxHeight: 200, overflowY: "auto", background: "#fafaf7"
          }
        }, (allStocks || []).filter(function(s){ return s !== "日経平均株価"; }).map(function(stk) {
          var on = !!subCatAddStocksMap[stk];
          return React.createElement("label", {
            key: stk,
            style: {
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 9px", fontSize: 12, fontWeight: on ? 700 : 500,
              background: on ? "#10B981" : "#fff",
              color: on ? "#fff" : "#444",
              border: "1px solid " + (on ? "#10B981" : "#ddd"),
              borderRadius: 5, cursor: "pointer", userSelect: "none"
            }
          },
            React.createElement("input", {
              type: "checkbox",
              checked: on,
              onChange: function() {
                var nx = Object.assign({}, subCatAddStocksMap);
                if (on) delete nx[stk]; else nx[stk] = true;
                setSubCatAddStocksMap(nx);
              },
              style: { display: "none" }
            }),
            React.createElement("span", null, stk)
          );
        }))
      ),
      
      (function() {
        var nm = (subCatAddName || "").trim();
        var dup = nm && subCatsForCur.indexOf(nm) >= 0;
        var stockCount = Object.keys(subCatAddStocksMap).filter(function(k){ return subCatAddStocksMap[k]; }).length;
        var canAdd = nm && !dup;
        return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          dup ? React.createElement("span", {
            style: { fontSize: 11, color: "#B45309", fontWeight: 600 }
          }, "\u26A0\uFE0F \u3053\u306E\u540D\u524D\u306E\u30B5\u30D6\u30BF\u30D6\u306F\u3059\u3067\u306B\u5B58\u5728\u3057\u307E\u3059") : null,
          React.createElement("button", {
            onClick: function() {
              if (!canAdd) return;
              addSubCatWithStocks(nm, subCatAddStocksMap);
              setSubCatAddOpen(false);
            },
            disabled: !canAdd,
            style: {
              marginLeft: "auto", padding: "8px 18px", fontSize: 13, fontWeight: 700,
              background: canAdd ? "#10B981" : "#ccc",
              color: "#fff", border: "none", borderRadius: 6,
              cursor: canAdd ? "pointer" : "not-allowed"
            }
          }, stockCount > 0 ? "\u8FFD\u52A0 (" + stockCount + " \u9298\u67C4\u3092\u7D10\u4ED8\u3051)" : "\u8FFD\u52A0 (\u7D10\u4ED8\u3051\u306A\u3057)")
        );
      })()
    )
  )),
  
  catMgmtTarget != null && (function() {
    var cat = catMgmtTarget;
    var orphan = orphanCats.indexOf(cat) >= 0;
    var idx = newsCategories.indexOf(cat);
    return React.createElement("div", {
      onClick: function() { setCatMgmtTarget(null); },
      style: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16
      }
    }, React.createElement("div", {
      onClick: function(e){ e.stopPropagation(); },
      style: {
        background: "#fff", borderRadius: 12,
        maxWidth: 520, width: "100%", display: "flex", flexDirection: "column"
      }
    },
      React.createElement("div", {
        style: {
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: "1px solid #e0ddd6"
        }
      },
        React.createElement("span", {
          style: { fontSize: 14, fontWeight: 700 }
        }, "\u2699 \u30AB\u30C6\u30B4\u30EA\u7BA1\u7406\uFF1A", cat),
        React.createElement("button", {
          onClick: function(){ setCatMgmtTarget(null); },
          style: {
            padding: "6px 14px", fontSize: 13, fontWeight: 600,
            background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
            borderRadius: 6, cursor: "pointer"
          }
        }, "\u9589\u3058\u308B")
      ),
      React.createElement("div", {
        style: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }
      },
        
        !orphan && React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" }
          }, "\u270E \u30EA\u30CD\u30FC\u30E0"),
          React.createElement("div", {
            style: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 8 }
          }, "\u30AB\u30C6\u30B4\u30EA\u540D\u3092\u5909\u66F4\u3057\u307E\u3059\u3002\u95A2\u9023\u3059\u308B\u30B5\u30D6\u30BF\u30D6\u3001\u81EA\u52D5\u30BF\u30B0\u3001\u9298\u67C4\u53C2\u7167\u3001\u5168\u30C7\u30FC\u30BF\u306E\u30AD\u30FC\u3082\u81EA\u52D5\u3067\u8FFD\u5F93\u3055\u308C\u307E\u3059\u3002"),
          React.createElement(_RenameRow, {
            initialValue: cat,
            existingNames: newsCategories.filter(function(c){ return c !== cat; }),
            onApply: function(nm) {
              if (renameNewsCat(cat, nm)) setCatMgmtTarget(nm);
            }
          })
        ),
        
        !orphan && React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" }
          }, "\u2194 \u4E26\u3073\u66FF\u3048"),
          React.createElement("div", {
            style: { fontSize: 11, color: "#666", marginBottom: 8 }
          }, "\u73FE\u5728\u306E\u4F4D\u7F6E: ", (idx + 1), " / ", newsCategories.length),
          React.createElement("div", {
            style: { display: "flex", gap: 8 }
          },
            React.createElement("button", {
              onClick: function(){ reorderNewsCat(cat, -1); },
              disabled: idx <= 0,
              style: {
                padding: "6px 14px", fontSize: 13, fontWeight: 600,
                background: idx > 0 ? "#fff" : "#f5f4f0",
                color: idx > 0 ? "#555" : "#bbb",
                border: "1px solid " + (idx > 0 ? "#ccc" : "#ddd"),
                borderRadius: 6, cursor: idx > 0 ? "pointer" : "not-allowed"
              }
            }, "\u2190 \u5DE6\u3078"),
            React.createElement("button", {
              onClick: function(){ reorderNewsCat(cat, 1); },
              disabled: idx < 0 || idx >= newsCategories.length - 1,
              style: {
                padding: "6px 14px", fontSize: 13, fontWeight: 600,
                background: (idx >= 0 && idx < newsCategories.length - 1) ? "#fff" : "#f5f4f0",
                color: (idx >= 0 && idx < newsCategories.length - 1) ? "#555" : "#bbb",
                border: "1px solid " + ((idx >= 0 && idx < newsCategories.length - 1) ? "#ccc" : "#ddd"),
                borderRadius: 6, cursor: (idx >= 0 && idx < newsCategories.length - 1) ? "pointer" : "not-allowed"
              }
            }, "\u53F3\u3078 \u2192")
          )
        ),
        
        
        !orphan && React.createElement("div", { style: { borderTop: "1px solid #f0eeea", paddingTop: 12, marginTop: 4 } },
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" } }, "↪ 別カテゴリのサブカテゴリとして移動"),
          React.createElement("div", { style: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 8 } }, "「", cat, "」を選択したメインカテゴリの配下に移動します。データはそのまま引き継がれます。"),
          React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
            React.createElement("select", {
              value: catMgmtMoveToMain,
              onChange: function(e) { setCatMgmtMoveToMain(e.target.value); },
              style: { flex: 1, minWidth: 120, padding: "6px 8px", fontSize: 13, border: "1px solid #ccc", borderRadius: 6 }
            },
              React.createElement("option", { value: "" }, "移動先を選択…"),
              newsCategories.filter(function(c) { return c !== cat; }).map(function(c) {
                return React.createElement("option", { key: c, value: c }, c);
              })
            ),
            React.createElement("button", {
              disabled: !catMgmtMoveToMain,
              onClick: function() {
                if (!catMgmtMoveToMain) return;
                if (window.confirm("「" + cat + "」を「" + catMgmtMoveToMain + "」のサブカテゴリに移動しますか？")) {
                  moveMainCatToSubCat(cat, catMgmtMoveToMain);
                  setCatMgmtMoveToMain("");
                  setCatMgmtTarget(null);
                }
              },
              style: { padding: "6px 14px", fontSize: 13, fontWeight: 700, background: catMgmtMoveToMain ? "#EFF6FF" : "#f5f4f0", color: catMgmtMoveToMain ? "#1D4ED8" : "#bbb", border: "1px solid " + (catMgmtMoveToMain ? "#BFDBFE" : "#ddd"), borderRadius: 6, cursor: catMgmtMoveToMain ? "pointer" : "not-allowed" }
            }, "移動")
          )
        ),
        
        React.createElement("div", { style: { borderTop: "1px solid #f0eeea", paddingTop: 12, marginTop: 4 } },
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" } }, "📦 データを別カテゴリへ一括移動"),
          React.createElement("div", { style: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 8 } }, "「", cat, "」内の全画像・ニュースを別カテゴリに一括移動し、このカテゴリを削除します。"),
          React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
            React.createElement("select", {
              value: catMgmtBulkTo,
              onChange: function(e) { setCatMgmtBulkTo(e.target.value); setCatMgmtBulkToSub(""); },
              style: { flex: 1, minWidth: 120, padding: "6px 8px", fontSize: 13, border: "1px solid #ccc", borderRadius: 6 }
            },
              React.createElement("option", { value: "" }, "移動先カテゴリを選択…"),
              newsCategories.filter(function(c) { return c !== cat; }).map(function(c) {
                return React.createElement("option", { key: c, value: c }, c);
              })
            )
          ),
          catMgmtBulkTo && ((custom.newsSubCats || {})[catMgmtBulkTo] || []).length > 0 && React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
            React.createElement("span", { style: { fontSize: 11, color: "#666", whiteSpace: "nowrap" } }, "サブカテゴリ:"),
            React.createElement("select", {
              value: catMgmtBulkToSub,
              onChange: function(e) { setCatMgmtBulkToSub(e.target.value); },
              style: { flex: 1, minWidth: 120, padding: "6px 8px", fontSize: 13, border: "1px solid #ccc", borderRadius: 6 }
            },
              React.createElement("option", { value: "" }, "(サブなし = メイン直下)"),
              ((custom.newsSubCats || {})[catMgmtBulkTo] || []).map(function(s) {
                return React.createElement("option", { key: s, value: s }, s);
              })
            )
          ),
          React.createElement("button", {
            disabled: !catMgmtBulkTo,
            onClick: function() {
              if (!catMgmtBulkTo) return;
              var dest = catMgmtBulkToSub || catMgmtBulkTo;
              var destLabel = catMgmtBulkToSub ? (catMgmtBulkTo + " › " + catMgmtBulkToSub) : catMgmtBulkTo;
              if (window.confirm("「" + cat + "」の全データを「" + destLabel + "」に移動し、「" + cat + "」を削除しますか？\nこの操作は元に戻せません。")) {
                bulkMoveNewsData(cat, dest, null);
                setCatMgmtBulkTo(""); setCatMgmtBulkToSub("");
                setCatMgmtTarget(null);
              }
            },
            style: { padding: "6px 14px", fontSize: 13, fontWeight: 700, background: catMgmtBulkTo ? "#FFF7ED" : "#f5f4f0", color: catMgmtBulkTo ? "#9A3412" : "#bbb", border: "1px solid " + (catMgmtBulkTo ? "#FDBA74" : "#ddd"), borderRadius: 6, cursor: catMgmtBulkTo ? "pointer" : "not-allowed" }
          }, "📦 一括移動して削除")
        ),        React.createElement("div", {
          style: { borderTop: "1px solid #f0eeea", paddingTop: 12, marginTop: 4 }
        },
          React.createElement("button", {
            onClick: function() {
              if (window.confirm("\u300C" + cat + "\u300D\u30AB\u30C6\u30B4\u30EA\u3092\u4E00\u89A7\u304B\u3089\u5916\u3057\u307E\u3059\u304B\uFF1F\n\u904E\u53BB\u306E\u30C7\u30FC\u30BF\u306F\u4FDD\u6301\u3055\u308C\u307E\u3059\u3002")) {
                delNewsCat(cat);
                setCatMgmtTarget(null);
              }
            },
            style: {
              padding: "7px 16px", fontSize: 13, fontWeight: 700,
              background: "#fff", color: "#DC2626", border: "1px solid #FCA5A5",
              borderRadius: 6, cursor: "pointer"
            }
          }, "\uD83D\uDDD1 \u3053\u306E\u30AB\u30C6\u30B4\u30EA\u3092\u4E00\u89A7\u304B\u3089\u5916\u3059")
        )
      )
    ));
  })(),
  
  subCatMgmtTarget != null && React.createElement("div", {
    onClick: function() { setSubCatMgmtTarget(null); },
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: {
      background: "#fff", borderRadius: 12,
      maxWidth: 700, width: "100%", maxHeight: "90vh",
      display: "flex", flexDirection: "column"
    }
  },
    React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #e0ddd6", flexShrink: 0
      }
    },
      React.createElement("span", {
        style: { fontSize: 14, fontWeight: 700 }
      }, "\u2699 \u30B5\u30D6\u30BF\u30D6\u7BA1\u7406\uFF1A", currentCat, " \u203A ", subCatMgmtTarget),
      React.createElement("button", {
        onClick: function(){ setSubCatMgmtTarget(null); },
        style: {
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28
        }
      }, "\u9589\u3058\u308B")
    ),
    React.createElement("div", {
      style: { padding: "12px 16px", overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }
    },
      
      React.createElement("div", null,
        React.createElement("div", {
          style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" }
        }, "\u270E \u30EA\u30CD\u30FC\u30E0"),
        React.createElement("div", {
          style: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 8 }
        }, "\u30B5\u30D6\u30BF\u30D6\u540D\u3092\u5909\u66F4\u3057\u307E\u3059\u3002\u95A2\u9023\u3059\u308B\u81EA\u52D5\u30BF\u30B0\u3001\u9298\u67C4\u53C2\u7167\u3001\u30CB\u30E5\u30FC\u30B9\u306E subCat / \u30B5\u30D6\u30BF\u30D6\u540D\u30BF\u30B0\u3082\u81EA\u52D5\u8FFD\u5F93\u3055\u308C\u307E\u3059\u3002"),
        React.createElement(_RenameRow, {
          initialValue: subCatMgmtTarget,
          existingNames: subCatsForCur.filter(function(s){ return s !== subCatMgmtTarget; }),
          onApply: function(nm) {
            if (renameSubCat(subCatMgmtTarget, nm)) setSubCatMgmtTarget(nm);
          }
        })
      ),
      
      (function() {
        var idx = subCatsForCur.indexOf(subCatMgmtTarget);
        return React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" }
          }, "\u2194 \u4E26\u3073\u66FF\u3048"),
          React.createElement("div", {
            style: { fontSize: 11, color: "#666", marginBottom: 8 }
          }, "\u73FE\u5728\u306E\u4F4D\u7F6E: ", (idx + 1), " / ", subCatsForCur.length),
          React.createElement("div", {
            style: { display: "flex", gap: 8 }
          },
            React.createElement("button", {
              onClick: function(){ reorderSubCat(subCatMgmtTarget, -1); },
              disabled: idx <= 0,
              style: {
                padding: "6px 14px", fontSize: 13, fontWeight: 600,
                background: idx > 0 ? "#fff" : "#f5f4f0",
                color: idx > 0 ? "#555" : "#bbb",
                border: "1px solid " + (idx > 0 ? "#ccc" : "#ddd"),
                borderRadius: 6, cursor: idx > 0 ? "pointer" : "not-allowed"
              }
            }, "\u2190 \u5DE6\u3078"),
            React.createElement("button", {
              onClick: function(){ reorderSubCat(subCatMgmtTarget, 1); },
              disabled: idx < 0 || idx >= subCatsForCur.length - 1,
              style: {
                padding: "6px 14px", fontSize: 13, fontWeight: 600,
                background: (idx >= 0 && idx < subCatsForCur.length - 1) ? "#fff" : "#f5f4f0",
                color: (idx >= 0 && idx < subCatsForCur.length - 1) ? "#555" : "#bbb",
                border: "1px solid " + ((idx >= 0 && idx < subCatsForCur.length - 1) ? "#ccc" : "#ddd"),
                borderRadius: 6, cursor: (idx >= 0 && idx < subCatsForCur.length - 1) ? "pointer" : "not-allowed"
              }
            }, "\u53F3\u3078 \u2192")
          )
        );
      })(),
      
      React.createElement("div", null,
        React.createElement("div", {
          style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" }
        }, "\uD83C\uDFF7\uFE0F \u81EA\u52D5\u30BF\u30B0"),
        React.createElement("div", {
          style: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 8 }
        }, "\u3053\u306E\u30B5\u30D6\u30BF\u30D6\u3067\u65B0\u898F\u8FFD\u52A0\u3059\u308B\u30CB\u30E5\u30FC\u30B9\u306B\u3001\u9078\u629E\u3057\u305F\u30BF\u30B0\u304C\u81EA\u52D5\u4ED8\u4E0E\u3055\u308C\u307E\u3059\u3002\u30AB\u30C6\u30B4\u30EA\u306E\u81EA\u52D5\u30BF\u30B0\u306B\u8FFD\u52A0\u3055\u308C\u307E\u3059\u3002"),
        React.createElement(TagPicker, _extends({
          cats: custom.cats || {}, tags: custom.tags || [],
          sel: (custom.newsSubCatDefaults && custom.newsSubCatDefaults[currentCat + "::" + subCatMgmtTarget]) || [],
          onToggle: function(tag) { togNewsSubCatDef(subCatMgmtTarget, tag); },
          onAdd: function(name, cat) {
            if (cat && pool.onAdd) pool.onAdd(name, cat);
            else if (pool.onAddLoose) pool.onAddLoose(name);
            var fullName = cat ? (cat + ":" + name) : name;
            togNewsSubCatDef(subCatMgmtTarget, fullName);
          }
        }, pool, { tagColors: custom.tagColors || {}, label: "\u81EA\u52D5\u4ED8\u4E0E\u30BF\u30B0", hideAddRoot: true }))
      ),
      
      React.createElement("div", null,
        React.createElement("div", {
          style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" }
        }, "\uD83D\uDD17 \u7D10\u4ED8\u3051\u9298\u67C4"),
        React.createElement("div", {
          style: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 8 }
        }, "\u9078\u629E\u3057\u305F\u9298\u67C4\u306E\u9298\u67C4\u8A18\u9332\u6B04\u306B\u3001\u3053\u306E\u30B5\u30D6\u30BF\u30D6\u306E\u30CB\u30E5\u30FC\u30B9\u304C\u95A2\u9023\u30CB\u30E5\u30FC\u30B9\u3068\u3057\u3066\u8868\u793A\u3055\u308C\u307E\u3059\u3002"),
        React.createElement("div", {
          style: {
            display: "flex", flexWrap: "wrap", gap: 5,
            padding: 8, border: "1px solid #e0ddd6", borderRadius: 6,
            maxHeight: 240, overflowY: "auto", background: "#fafaf7"
          }
        }, (allStocks || []).filter(function(s){ return s !== "日経平均株価"; }).map(function(stk) {
          var refs = (custom.stockSubCatRefs && custom.stockSubCatRefs[stk]) || [];
          var on = refs.some(function(r){ return r.cat === currentCat && r.subCat === subCatMgmtTarget; });
          return React.createElement("button", {
            key: stk,
            onClick: function() { togStockSubCatRefForMgmt(stk, subCatMgmtTarget); },
            style: {
              padding: "4px 9px", fontSize: 12, fontWeight: on ? 700 : 500,
              background: on ? "#10B981" : "#fff",
              color: on ? "#fff" : "#444",
              border: "1px solid " + (on ? "#10B981" : "#ddd"),
              borderRadius: 5, cursor: "pointer", whiteSpace: "nowrap"
            }
          }, (on ? "\u2713 " : "") + stk);
        }))
      ),
      
      React.createElement("div", { style: { borderTop: "1px solid #f0eeea", paddingTop: 12, marginTop: 4 } },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" } }, "📦 データを別カテゴリへ一括移動"),
        React.createElement("div", { style: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 8 } }, "「", subCatMgmtTarget, "」内の全画像・ニュースを別カテゴリ（メイン・サブ）へ一括移動します。"),
        React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
          React.createElement("select", {
            value: subCatMgmtBulkTo,
            onChange: function(e) { setSubCatMgmtBulkTo(e.target.value); setSubCatMgmtBulkToSub(""); },
            style: { flex: 1, minWidth: 120, padding: "6px 8px", fontSize: 13, border: "1px solid #ccc", borderRadius: 6 }
          },
            React.createElement("option", { value: "" }, "移動先カテゴリを選択…"),
            newsCategories.map(function(c) {
              return React.createElement("option", { key: c, value: c }, c);
            })
          )
        ),
        subCatMgmtBulkTo && ((custom.newsSubCats || {})[subCatMgmtBulkTo] || []).filter(function(s) { return s !== subCatMgmtTarget; }).length > 0 && React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 11, color: "#666", whiteSpace: "nowrap" } }, "サブカテゴリ:"),
          React.createElement("select", {
            value: subCatMgmtBulkToSub,
            onChange: function(e) { setSubCatMgmtBulkToSub(e.target.value); },
            style: { flex: 1, minWidth: 120, padding: "6px 8px", fontSize: 13, border: "1px solid #ccc", borderRadius: 6 }
          },
            React.createElement("option", { value: "" }, "(サブなし = メイン直下)"),
            ((custom.newsSubCats || {})[subCatMgmtBulkTo] || []).filter(function(s) { return s !== subCatMgmtTarget; }).map(function(s) {
              return React.createElement("option", { key: s, value: s }, s);
            })
          )
        ),
        React.createElement("button", {
          disabled: !subCatMgmtBulkTo,
          onClick: function() {
            if (!subCatMgmtBulkTo) return;
            var dest = subCatMgmtBulkToSub || subCatMgmtBulkTo;
            var destLabel = subCatMgmtBulkToSub ? (subCatMgmtBulkTo + " › " + subCatMgmtBulkToSub) : subCatMgmtBulkTo;
            if (window.confirm("「" + subCatMgmtTarget + "」の全データを「" + destLabel + "」に移動し、「" + subCatMgmtTarget + "」を削除しますか？\nこの操作は元に戻せません。")) {
              bulkMoveNewsData(subCatMgmtTarget, dest, currentCat);
              setSubCatMgmtBulkTo(""); setSubCatMgmtBulkToSub("");
              setSubCatMgmtTarget(null);
            }
          },
          style: { padding: "6px 14px", fontSize: 13, fontWeight: 700, background: subCatMgmtBulkTo ? "#FFF7ED" : "#f5f4f0", color: subCatMgmtBulkTo ? "#9A3412" : "#bbb", border: "1px solid " + (subCatMgmtBulkTo ? "#FDBA74" : "#ddd"), borderRadius: 6, cursor: subCatMgmtBulkTo ? "pointer" : "not-allowed" }
        }, "📦 一括移動して削除")
      ),      
      React.createElement("div", {
        style: { borderTop: "1px solid #f0eeea", paddingTop: 12, marginTop: 4 }
      },
        React.createElement("button", {
          onClick: function() {
            if (window.confirm("\u300C" + subCatMgmtTarget + "\u300D\u30B5\u30D6\u30BF\u30D6\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\n\u30CB\u30E5\u30FC\u30B9\u81EA\u4F53\u306F\u6B8B\u308A\u672A\u5206\u985E\u306B\u79FB\u308A\u307E\u3059\u3002\n\u95A2\u9023\u3059\u308B\u9298\u67C4\u53C2\u7167\u3068\u81EA\u52D5\u30BF\u30B0\u8A2D\u5B9A\u3082\u524A\u9664\u3055\u308C\u307E\u3059\u3002")) {
              delSubCat(subCatMgmtTarget);
              setSubCatMgmtTarget(null);
            }
          },
          style: {
            padding: "7px 16px", fontSize: 13, fontWeight: 700,
            background: "#fff", color: "#DC2626", border: "1px solid #FCA5A5",
            borderRadius: 6, cursor: "pointer"
          }
        }, "\uD83D\uDDD1 \u3053\u306E\u30B5\u30D6\u30BF\u30D6\u3092\u524A\u9664")
      )
    )
  )),
  
  catDefOpen && React.createElement("div", {
    onClick: function() { setCatDefOpen(false); },
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: {
      background: "#fff", borderRadius: 12,
      maxWidth: 700, width: "100%", maxHeight: "90vh",
      display: "flex", flexDirection: "column"
    }
  },
    React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #e0ddd6", flexShrink: 0
      }
    },
      React.createElement("span", {
        style: { fontSize: 14, fontWeight: 700 }
      }, "\u2699\uFE0F \u300C", currentCat, "\u300D\u306E\u81EA\u52D5\u30BF\u30B0"),
      React.createElement("button", {
        onClick: function(){ setCatDefOpen(false); },
        style: {
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28
        }
      }, "\u9589\u3058\u308B")
    ),
    React.createElement("div", {
      style: { padding: "12px 16px", overflow: "auto" }
    },
      React.createElement("div", {
        style: { fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 12 }
      }, "\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u306B\u65B0\u898F\u8FFD\u52A0\u3059\u308B\u30CB\u30E5\u30FC\u30B9\u306B\u3001\u9078\u629E\u3057\u305F\u30BF\u30B0\u304C\u81EA\u52D5\u4ED8\u4E0E\u3055\u308C\u307E\u3059\u3002\u65E2\u5B58\u306E\u30CB\u30E5\u30FC\u30B9\u306B\u306F\u5F71\u97FF\u3057\u307E\u305B\u3093\u3002"),
      React.createElement(TagPicker, _extends({
        cats: custom.cats || {}, tags: custom.tags || [],
        sel: (custom.newsCatDefaults && custom.newsCatDefaults[currentCat]) || [],
        onToggle: togNewsCatDef,
        onAdd: function(name, cat) {
          if (cat && pool.onAdd) pool.onAdd(name, cat);
          else if (pool.onAddLoose) pool.onAddLoose(name);
          var fullName = cat ? (cat + ":" + name) : name;
          togNewsCatDef(fullName);
        }
      }, pool, { tagColors: custom.tagColors || {}, label: "\u81EA\u52D5\u4ED8\u4E0E\u30BF\u30B0", hideAddRoot: true }))
    )
  )),
  viewTarget && function () {
    var vt = viewTarget,
      imgs = vt.imgs,
      i = vt.idx,
      img = imgs[i];
    if (!img) return null;
    var src = imgSrc(img);
    var ap = {
      img: img,
      onSave: function onSave(ed) {
        vt.onUpdate(i, ed);
      }
    };
    
    var prevNiIdx = null;
    if (typeof vt.niIdx === "number") {
      for (var pi = vt.niIdx - 1; pi >= 0; pi--) {
        if ((newsItems[pi].images || []).length > 0) { prevNiIdx = pi; break; }
      }
    }
    
    var nextNiIdx = null;
    if (typeof vt.niIdx === "number") {
      for (var ni2 = vt.niIdx + 1; ni2 < newsItems.length; ni2++) {
        if ((newsItems[ni2].images || []).length > 0) { nextNiIdx = ni2; break; }
      }
    }
    var makeItemNav = function(targetIdx) {
      var targetNi = newsItems[targetIdx];
      var targetImgs = targetNi.images || [];
      return function() {
        setViewTarget({ imgs: targetImgs, idx: 0, niIdx: targetIdx,
          onUpdate: function(i2, ed) { updNews(targetNi.id, function(n) { var a = _toConsumableArray(n.images||[]); a[i2] = ed; return { images: a }; }); }
        });
      };
    };
    return React.createElement(ZoomLightbox, {
      src: src,
      annotProps: ap,
      onClose: function onClose() {
        return setViewTarget(null);
      },
      onPrev: i > 0 ? function () {
        return setViewTarget(function (t) {
          if (!t) return t;
          return _objectSpread(_objectSpread({}, t), {}, {
            idx: t.idx - 1
          });
        });
      } : null,
      onNext: i < imgs.length - 1 ? function () {
        return setViewTarget(function (t) {
          if (!t) return t;
          return _objectSpread(_objectSpread({}, t), {}, {
            idx: t.idx + 1
          });
        });
      } : null,
      navLabel: imgs.length > 1 ? i + 1 + "/" + imgs.length : null,
      onPrevItem: prevNiIdx !== null ? makeItemNav(prevNiIdx) : null,
      onNextItem: nextNiIdx !== null ? makeItemNav(nextNiIdx) : null
    });
  }(), annotTarget != null && function () {
    var ni = newsItems.find(function (n) {
      return n.id === annotTarget.nid;
    });
    var imgs = ni ? ni.images || [] : [];
    var i = annotTarget.idx;
    var img = imgs[i];
    if (!img) return null;
    
    var curNiIdx = newsItems.findIndex(function(n){ return n.id === annotTarget.nid; });
    
    var prevNiIdxA = null;
    if (curNiIdx >= 0) {
      for (var pi2 = curNiIdx - 1; pi2 >= 0; pi2--) {
        if ((newsItems[pi2].images || []).length > 0) { prevNiIdxA = pi2; break; }
      }
    }
    
    var nextNiIdxA = null;
    if (curNiIdx >= 0) {
      for (var ni3 = curNiIdx + 1; ni3 < newsItems.length; ni3++) {
        if ((newsItems[ni3].images || []).length > 0) { nextNiIdxA = ni3; break; }
      }
    }
    var jumpToItem = function(targetIdx) {
      var targetNi = newsItems[targetIdx];
      return function() { setAnnotTarget({ nid: targetNi.id, idx: 0 }); };
    };
    
    var itemNavLabelA = null;
    var itemsWithImgs = newsItems.filter(function(n){ return (n.images||[]).length > 0; });
    if (itemsWithImgs.length > 1 && curNiIdx >= 0) {
      var myPos = itemsWithImgs.findIndex(function(n){ return n.id === annotTarget.nid; });
      if (myPos >= 0) itemNavLabelA = (myPos + 1) + "/" + itemsWithImgs.length + "記";
    }
    return React.createElement(ImageAnnotator, {
      img: img,
      onSave: function onSave(ed) {
        var _nid = annotTarget.nid, _aidx = annotTarget.idx;
        updNews(_nid, function(ni) {
          var curImgs = _toConsumableArray(ni.images || []);
          curImgs[_aidx] = ed;
          return { images: curImgs };
        });
        
      },
      onClose: function onClose() {
        return setAnnotTarget(null);
      },
      onPrev: i > 0 ? function () {
        return setAnnotTarget(function (t) {
          if (!t) return t;
          return _objectSpread(_objectSpread({}, t), {}, {
            idx: t.idx - 1
          });
        });
      } : null,
      onNext: i < imgs.length - 1 ? function () {
        return setAnnotTarget(function (t) {
          if (!t) return t;
          return _objectSpread(_objectSpread({}, t), {}, {
            idx: t.idx + 1
          });
        });
      } : null,
      navLabel: imgs.length > 1 ? i + 1 + "/" + imgs.length : null,
      onPrevItem: prevNiIdxA !== null ? jumpToItem(prevNiIdxA) : null,
      onNextItem: nextNiIdxA !== null ? jumpToItem(nextNiIdxA) : null,
      itemNavLabel: itemNavLabelA
    });
  }(), React.createElement(NewsCatTabs, {
    cats: displayCats,
    active: currentCat,
    onSelect: setActiveCat,
    onAdd: addNewsCat,
    onDel: delNewsCat,
    onMgmt: function(cat) { setCatMgmtTarget(cat); },
    hasData: catHasData,
    isOrphan: isOrphan
  }),
  
  React.createElement("div", {
    style: {
      display: "flex", alignItems: "center", gap: 5,
      marginBottom: 12, overflowX: "auto", paddingBottom: 6
    }
  },
    
    hasSubCats ? React.createElement(React.Fragment, null,
      
      React.createElement("button", {
        onClick: function() { setActiveSubCat("__all__"); },
        style: {
          padding: "5px 10px", fontSize: 12, fontWeight: activeSubCat === "__all__" ? 700 : 500,
          background: activeSubCat === "__all__" ? "#4F46E5" : "#fff",
          color: activeSubCat === "__all__" ? "#fff" : "#666",
          border: "1px solid " + (activeSubCat === "__all__" ? "#4F46E5" : "#ddd"),
          borderRadius: 5, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
        }
      }, "\u3059\u3079\u3066 (" + dedupedNewsItems.length + ")"),
      
      (function() {
        var noneCount = allNewsItems.filter(function(ni) {
          return !ni.subCat || subCatsForCur.indexOf(ni.subCat) < 0;
        }).length;
        return React.createElement("button", {
          onClick: function() { setActiveSubCat("__none__"); },
          style: {
            padding: "5px 10px", fontSize: 12, fontWeight: activeSubCat === "__none__" ? 700 : 500,
            background: activeSubCat === "__none__" ? "#888" : "#fff",
            color: activeSubCat === "__none__" ? "#fff" : "#888",
            border: "1px solid " + (activeSubCat === "__none__" ? "#888" : "#ddd"),
            borderRadius: 5, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
          }
        }, "\u672A\u5206\u985E (" + noneCount + ")");
      })(),
      
      subCatsForCur.map(function(sc) {
        var cnt = allNewsItems.filter(function(ni) { return ni.subCat === sc; }).length;
        var on = activeSubCat === sc;
        var dragOn = subCatDrag === sc;
        return React.createElement("div", {
          key: sc,
          onDragOver: function(e) { e.preventDefault(); e.stopPropagation(); if (subCatDrag !== sc) setSubCatDrag(sc); },
          onDragLeave: function(e) { if (e.currentTarget.contains(e.relatedTarget)) return; setSubCatDrag(function(c){ return c === sc ? null : c; }); },
          onDrop: function(e) {
            e.preventDefault(); e.stopPropagation(); setSubCatDrag(null);
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) addNewsWithFile(e.dataTransfer.files[0], sc);
          },
          style: { display: "inline-flex", alignItems: "stretch", flexShrink: 0,
                   borderRadius: 6,
                   outline: dragOn ? "2px dashed #6366F1" : "none",
                   outlineOffset: 1,
                   background: dragOn ? "#EEF2FF" : "transparent" }
        },
          React.createElement("button", {
            onClick: function() { setActiveSubCat(sc); },
            style: {
              padding: "5px 10px", fontSize: 12, fontWeight: on ? 700 : 500,
              background: on ? "#10B981" : "#fff",
              color: on ? "#fff" : "#444",
              border: "1px solid " + (on ? "#10B981" : "#ddd"),
              borderRadius: on ? "5px 0 0 5px" : "5px",
              borderRight: on ? "none" : "1px solid #ddd",
              cursor: "pointer", whiteSpace: "nowrap"
            }
          }, sc + " (" + cnt + ")"),
          on && React.createElement("button", {
            onClick: function() {
              setSubCatMgmtTarget(sc);
            },
            title: "\u3053\u306E\u30B5\u30D6\u30BF\u30D6\u3092\u7BA1\u7406 (\u81EA\u52D5\u30BF\u30B0 / \u7D10\u4ED8\u3051\u9298\u67C4 / \u524A\u9664)",
            style: {
              padding: "5px 8px", fontSize: 12, fontWeight: 700,
              background: "#10B981", color: "#fff",
              border: "1px solid #10B981", borderLeft: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "0 5px 5px 0", cursor: "pointer"
            }
          }, "\u2699")
        );
      })
    ) : null,
    
    React.createElement("button", {
      onClick: function() {
        setSubCatAddName("");
        setSubCatAddStocksMap({});
        setSubCatAddOpen(true);
      },
      style: {
        padding: "5px 10px", fontSize: 12, fontWeight: 600,
        background: "#f5f4f0", color: "#888", border: "1.5px dashed #bbb",
        borderRadius: 5, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
      }
    }, "+ \u30B5\u30D6\u30BF\u30D6")
  ), React.createElement("div", {
    style: Card
  }, React.createElement("div", {
    style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }
  }, React.createElement("span", {
    style: { fontSize: 15, fontWeight: 600 }
  }, "\u4E3B\u8981\u30CB\u30E5\u30FC\u30B9\uFF08", currentCat, "\uFF09"),
  React.createElement("button", {
    onClick: function(){ setCatDefOpen(true); },
    title: "\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u306B\u65B0\u898F\u8FFD\u52A0\u3059\u308B\u30CB\u30E5\u30FC\u30B9\u306B\u81EA\u52D5\u4ED8\u4E0E\u3059\u308B\u30BF\u30B0\u3092\u8A2D\u5B9A",
    style: {
      marginLeft: "auto", padding: "3px 9px", fontSize: 11, fontWeight: 600,
      background: "#f5f4f0", color: "#666", border: "1px solid #ddd",
      borderRadius: 5, cursor: "pointer"
    }
  }, "\u2699\uFE0F \u81EA\u52D5\u30BF\u30B0" + (((custom.newsCatDefaults || {})[currentCat] || []).length > 0 ? " (" + ((custom.newsCatDefaults || {})[currentCat] || []).length + ")" : ""))),
  React.createElement("div", {
    ref: newsContainerRef,
    className: "news-hscroll",
    onWheel: function(e) {
      if (IS_TOUCH) return;
      
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        var el = e.currentTarget;
        if (el.scrollWidth > el.clientWidth) {
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }
    },
    style: { display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch",
             gap: 10, paddingBottom: 8, alignItems: "flex-start" }
  }, newsItems.map(function (ni, niIdx) {
    var imgs = ni.images || [];
    var niTags = ni.tags || [];
    var cardW = IS_TOUCH ? 220 : 200;
    var isDragging = dragFromIdx === niIdx;
    var showInsertBefore = dragFromIdx !== null && dragInsert === niIdx && dragInsert !== dragFromIdx && dragInsert !== dragFromIdx + 1;
    var showInsertAfter = dragFromIdx !== null && dragInsert === newsItems.length && niIdx === newsItems.length - 1 && dragFromIdx !== niIdx;
    return React.createElement(React.Fragment, { key: ni.id },
    showInsertBefore && React.createElement("div", {
      style: { width: 4, flexShrink: 0, background: "#6366F1", borderRadius: 2, alignSelf: "stretch", minHeight: 40 }
    }),
    React.createElement("div", {
      id: "ni-card-" + ni.id,
      "data-newscard": "1",
      style: { position: "relative",
               background: highlightNiId === ni.id ? "#FEF3C7" : "#f8f7f4",
               boxShadow: highlightNiId === ni.id ? "0 0 0 3px #F59E0B" : "none",
               borderRadius: 10,
               border: isDragging ? "2px solid #6366F1" : "1px solid #e8e5df",
               flexShrink: 0, width: cardW, overflow: "hidden",
               opacity: isDragging ? 0.5 : 1,
               transition: "opacity 0.15s, background 0.4s, box-shadow 0.4s" }
    },
    React.createElement("div", {
      onMouseDown: function(e) { onNewsDragStart(niIdx, e); },
      onTouchStart: function(e) { onNewsDragStart(niIdx, e); },
      style: { position: "absolute", top: 4, left: 4, width: 24, height: 24,
               borderRadius: "50%", background: "rgba(0,0,0,0.35)", color: "#fff",
               border: "none", fontSize: 14, cursor: "grab", fontWeight: 700,
               display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
               touchAction: "none", userSelect: "none" }
    }, "\u2630"),
    React.createElement("button", {
      onClick: function() {
        
        setMoveToCat(currentCat);
        setMoveToSubCat(ni.subCat || "");
        setMoveToDate(date);
        setMoveMode("move");
        setCloneTargets([]);
        setMoveTarget({ niId: ni.id, fromCat: currentCat, fromSubCat: ni.subCat || "" });
      },
      title: "\u3053\u306E\u8A18\u4E8B\u3092\u79FB\u52D5/\u8907\u88FD",
      style: { position: "absolute", top: 4, right: 30, width: 22, height: 22,
               borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff",
               border: "none", fontSize: 11, cursor: "pointer", fontWeight: 700,
               display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }
    }, "\u21AA"),
    
    (function() {
      var clones = _findClones(ni.id);
      if (!clones.length) return null;
      var locsLabel = clones.map(function(l){ return l.cat + (l.subCat ? "/" + l.subCat : ""); }).join("\n");
      return React.createElement("div", {
        title: "\u30AF\u30ED\u30FC\u30F3 (\u7DE8\u96C6\u9023\u52D5):\n" + locsLabel,
        style: {
          position: "absolute", top: 4, right: 56, height: 22,
          padding: "0 6px",
          borderRadius: 11, background: "rgba(99,102,241,0.85)", color: "#fff",
          fontSize: 10, fontWeight: 700, zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
          pointerEvents: "auto", cursor: "help"
        }
      }, "\uD83D\uDD17", clones.length + 1);
    })(),
    React.createElement("button", {
      onClick: function() { return delNews(ni.id); },
      style: { position: "absolute", top: 4, right: 4, width: 22, height: 22,
               borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff",
               border: "none", fontSize: 12, cursor: "pointer", fontWeight: 700,
               display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }
    }, "\u2715"),
    React.createElement(ImgGrid, {
      images: imgs,
      maxHeight: 320,
      onRemove: function(i) { 
        console.log("[ImgGrid onRemove] nid=" + ni.id + " imgIdx=" + i + " cat=" + currentCat);
        return updNews(ni.id, function(n) { 
          var newImgs = (n.images||[]).filter(function(_, j){ return j !== i; });
          console.log("[ImgGrid onRemove] before=" + (n.images||[]).length + " after=" + newImgs.length);
          return { images: newImgs }; 
        }); 
      },
      onAnnotate: function(i) { return setAnnotTarget({ nid: ni.id, idx: i }); },
      onEnlarge: function(i) {
        return setViewTarget({ imgs: imgs, idx: i, niIdx: niIdx,
          onUpdate: function(i2, ed) { updNews(ni.id, function(n) { var a = _toConsumableArray(n.images||[]); a[i2] = ed; return { images: a }; }); }
        });
      },
      onUpdateImg: function(i, ed) { updNews(ni.id, function(n) { var a = _toConsumableArray(n.images||[]); a[i] = ed; return { images: a }; }); },
      onToggleStar: function(i) { updNews(ni.id, function(n) { var a = _toConsumableArray(n.images||[]); a[i] = Object.assign({}, a[i], { star: !(a[i] && a[i].star) }); return { images: a }; }); }
    }),
    React.createElement("div", {
      style: { padding: "6px 8px" }
    },
    
    (function() {
      if (!onJumpToStock || !allStocks || !allStocks.length) return null;
      var stockSet = {};
      var stockList = [];
      niTags.forEach(function(t) {
        var s = _ntExtractStockFromTag(t, allStocks);
        if (s && !stockSet[s]) { stockSet[s] = true; stockList.push(s); }
      });
      if (stockList.length === 0) return null;
      return React.createElement("div", {
        style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 5 }
      }, stockList.map(function(s) {
        return React.createElement("button", {
          key: "j_" + s,
          onClick: function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            onJumpToStock(s);
          },
          title: s + " \u306E\u9298\u67C4\u8A18\u9332\u3092\u898B\u308B",
          style: {
            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
            background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE",
            cursor: "pointer", whiteSpace: "nowrap"
          }
        }, "\u2192 " + s);
      }));
    })(),
    
    hasSubCats && React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 5, fontSize: 10 }
    },
      React.createElement("span", {
        style: { color: "#999", fontWeight: 600, flexShrink: 0 }
      }, "\uD83D\uDCC2"),
      React.createElement("select", {
        value: ni.subCat || "",
        onChange: function(e) { setNiSubCat(ni.id, e.target.value || null); },
        onClick: function(e) { e.stopPropagation(); },
        style: {
          fontSize: 11, padding: "2px 4px", border: "1px solid #ddd",
          borderRadius: 4, background: "#fff", color: "#444",
          flex: 1, minWidth: 0, cursor: "pointer"
        }
      },
        React.createElement("option", { value: "" }, "(\u672A\u5206\u985E)"),
        subCatsForCur.map(function(sc) {
          return React.createElement("option", { key: sc, value: sc }, sc);
        })
      )
    ),
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }
    },
      React.createElement("button", {
        onClick: function(e) { e.stopPropagation(); updNews(ni.id, function(n) { return { starred: !n.starred }; }); },
        title: ni.starred ? "\u2605\u3092\u5916\u3059" : "\u2605\u3092\u3064\u3051\u308B",
        style: { padding: 0, border: "none", background: "none", cursor: "pointer",
          fontSize: 14, lineHeight: 1, color: ni.starred ? "#E53935" : "#ccc", flexShrink: 0 }
      }, "\u2605")
    ),
    React.createElement(TagPicker, _extends({
      cats: catTagPool.cats, tags: catTagPool.tags, sel: niTags,
      onToggle: function(tag) { return togNiTag(ni.id, tag); },
      onAdd: function(name, cat) { return onAddNiTag(ni.id, name, cat); }
    }, newsPool, { tagColors: custom.tagColors || {}, label: "\u6750\u6599\u30BF\u30B0", hideAddRoot: true })),
    React.createElement(PasteZone, {
      onImage: function(img) { return updNews(ni.id, function(n) { return { images: [].concat(_toConsumableArray(n.images || []), [img]) }; }); },
      compact: true
    }))),
    showInsertAfter && React.createElement("div", {
      style: { width: 4, flexShrink: 0, background: "#6366F1", borderRadius: 2, alignSelf: "stretch", minHeight: 40 }
    })
    );
  }),
  React.createElement("div", {
    style: { flexShrink: 0, display: "flex", alignSelf: "stretch", alignItems: "center", justifyContent: "center", padding: "0 4px" },
    onDrop: function(e) { e.preventDefault(); setAddBtnDrag(false); if (e.dataTransfer.files[0]) addNewsWithFile(e.dataTransfer.files[0]); },
    onDragOver: function(e) { e.preventDefault(); setAddBtnDrag(true); },
    onDragLeave: function() { setAddBtnDrag(false); },
    onClick: function() {
      
      if (!IS_TOUCH && addBtnPasteRef.current && document.activeElement !== addBtnPasteRef.current) {
        addBtnPasteRef.current.focus();
        return;
      }
      if (addBtnFileRef.current) addBtnFileRef.current.click();
    }
  },
  React.createElement("input", {
    ref: addBtnFileRef, type: "file", accept: "image/*", style: { display: "none" },
    onChange: function(e) { if (e.target.files[0]) { addNewsWithFile(e.target.files[0]); e.target.value = ""; } }
  }),
  React.createElement("div", {
    style: { width: IS_TOUCH ? 60 : 52, height: IS_TOUCH ? 60 : 52, fontSize: 26,
             fontWeight: 300, background: addBtnDrag ? "#EEF2FF" : "#f5f4f0",
             border: addBtnDrag ? "2px dashed #6366F1" : "1.5px dashed #ccc",
             borderRadius: 12, cursor: "pointer", color: addBtnDrag ? "#6366F1" : "#999",
             display: "flex", alignItems: "center", justifyContent: "center",
             position: "relative",
             transition: "border-color .15s, background .15s, color .15s" }
  }, "+",
    
    !IS_TOUCH && React.createElement("textarea", {
      ref: addBtnPasteRef,
      title: "クリックでファイル選択 / 右クリック→貼り付けやCmd+Vで画像追加",
      onPaste: function(e) {
        e.preventDefault();
        var it = e.clipboardData && e.clipboardData.items || [];
        for (var i = 0; i < it.length; i++) {
          if (it[i].type && it[i].type.indexOf("image/") === 0) {
            var f = it[i].getAsFile();
            if (f) addNewsWithFile(f);
            break;
          }
        }
        if (addBtnPasteRef.current) addBtnPasteRef.current.value = "";
      },
      onChange: function() {
        if (addBtnPasteRef.current) addBtnPasteRef.current.value = "";
      },
      onKeyDown: function(e) {
        
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (addBtnFileRef.current) addBtnFileRef.current.click();
        }
      },
      style: {
        position: "absolute", inset: 0, opacity: 0,
        resize: "none", border: "none", background: "transparent",
        width: "100%", height: "100%", cursor: "pointer", padding: 0
      }
    })
  )))), React.createElement("div", {
    style: Card
  }, (function() {
    
    
    
    if (!hasSubCats) {
      return React.createElement(MemoSection, {
        memo: catData.newsMemo || { text: "", images: [] },
        onChange: function(v) { return updCatField("newsMemo", v); },
        guardKey: "newsMemo_" + date + "_" + currentCat
      });
    }
    var _memoKey = activeSubCat;
    var _scms = catData.subCatMemos || {};
    var _curMemo = _scms[_memoKey] || { text: "", images: [] };
    var _suffix = (_memoKey === "__all__") ? "すべて"
                : (_memoKey === "__none__") ? "未分類"
                : _memoKey;
    var _onMemoChange = function(v) {
      save(function(prevData) {
        var prevDd = (prevData.trades && prevData.trades[date]) || {};
        var prevAllCats = getAllNewsCatsData(prevDd);
        var prevCatData = prevAllCats[currentCat] || {};
        var prevScms = prevCatData.subCatMemos || {};
        var newScms = Object.assign({}, prevScms);
        newScms[_memoKey] = v;
        var newCats = _objectSpread(_objectSpread({}, prevAllCats), {}, _defineProperty({}, currentCat, _objectSpread(_objectSpread({}, prevCatData), {}, { subCatMemos: newScms })));
        return _objectSpread(_objectSpread({}, prevData), {}, {
          trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, { newsCats: newCats })))
        });
      });
    };
    return React.createElement(MemoSection, {
      memo: _curMemo,
      onChange: _onMemoChange,
      titleSuffix: _suffix,
      guardKey: "newsMemo_" + date + "_" + currentCat + "_" + _memoKey
    });
  })()));
}
