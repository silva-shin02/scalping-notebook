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
    window._snPrompt(type === "indicator" ? "指標名を入力" : "銘柄名を入力").then(function(name){
      if (!name || !name.trim()) return;
      updArr(type, function(arr){ return arr.concat([{ id: String(Date.now()), name: name.trim(), value: null }]); });
    });
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
                          window._snPrompt("名前を変更", entry.name).then(function(nn){
                          if (nn && nn.trim() && nn.trim() !== entry.name) renameRow(type, entry.id, nn.trim());
                          });
                        }
                      }, "✎"),
                      React.createElement("span", {
                        title: "削除", style: iconBtn,
                        onClick: function() {
                          window._snConfirm(entry.name + " を削除しますか？").then(function(_ok){ if(_ok) delRow(type, entry.id); });
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
    collCount = _ref34.collCount,
    fmActive = _ref34.fmActive,
    onFmSelect = _ref34.onFmSelect,
    hasFmData = _ref34.hasFmData,
    rotStocks = _ref34.rotStocks,
    rotActive = _ref34.rotActive,
    rotLabel = _ref34.rotLabel,
    onRotSelect = _ref34.onRotSelect,
    rotHasData = _ref34.rotHasData;
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
  // 📅日替わりタブ（per-day 2026-07-22d）: 外国市場の右に固定。その日の本日の取引銘柄(dailyStock[date])1つを表示。ラベルrotLabel(=📅 銘柄名/📅 日替わり)。常時表示(onRotSelect提供時)。
  onRotSelect ? React.createElement("button", {
    key: "__rot__",
    onClick: function() { if (!touchState.current.on) onRotSelect(); },
    style: {
      position: "relative", flexShrink: 0,
      padding: "8px 14px",
      fontSize: 13, fontWeight: 600,
      border: rotActive ? "1.5px solid #4338CA" : "1px solid #C7D2FE",
      borderRadius: 7, cursor: "pointer",
      background: rotActive ? "#4338CA" : "#EEF2FF",
      color: rotActive ? "#fff" : "#4338CA",
      whiteSpace: "nowrap",
      minHeight: IS_TOUCH ? 40 : 32,
      userSelect: "none"
    }
  },
    rotHasData && React.createElement("span", {
      style: { position: "absolute", top: 4, left: 5, width: 7, height: 7,
        borderRadius: "50%", background: "#E53935", pointerEvents: "none" }
    }),
    rotLabel || "📅 日替わり"
  ) : null,
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
    }), (exclCount && exclCount(s) > 0) ? _elExclDot(exclCount(s), { position: "absolute", top: 4, left: 15, pointerEvents: "none" }) : null, (collCount && collCount(s) > 0) ? _elCollDot(collCount(s), { position: "absolute", top: 4, left: (exclCount && exclCount(s) > 0) ? 24 : 15, pointerEvents: "none" }) : null, s, (onRename && s !== "日経平均株価") && React.createElement("span", {
      onClick: function onClickRn(e) {
        e.stopPropagation();
        window._snPrompt("銘柄名を変更", s).then(function(nn){
        try {
          if (nn == null) return;
          nn = String(nn).trim();
          if (!nn || nn === s) return;
          if (nn === "日経平均株価") { window._snAlert("その名前は使用できません"); return; }
          if (((stocks || []).concat(rotStocks || []).concat(hiddenStocks || [])).indexOf(nn) !== -1) { window._snAlert("同じ名前の銘柄が既にあります（表示中・日替わり候補・非表示のいずれか）"); return; }
          onRename(s, nn);
        } catch(_e) {}
        });
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
// 2026-08-03e ニュースの分類（カテゴリ／サブ）の管理。日々のボードからタブを全廃したので、
// 追加・改名・削除・並べ替えはここ（設定画面）に集約する。記事への分類付け自体はカードの「この記事を保存」シート側。
// 分類の正本は記事の keep{cat,sub} なので、改名／削除は keep も追従させる
// ＝分類が黙って消えたり、存在しない名前を指したままにならないように。
// カテゴリ名は保存キー trades[日付].newsCats[カテゴリ] でもあるので、改名時は中身も引っ越す（旧キーに残さない）。
function _ncsMapNewsItems(prevData, fn) {
  var newTrades = Object.assign({}, prevData.trades || {});
  var changed = false;
  Object.keys(newTrades).forEach(function(dt) {
    var dd = newTrades[dt];
    if (!dd || !dd.newsCats || typeof dd.newsCats !== "object") return;
    var nc = {}, ddCh = false;
    Object.keys(dd.newsCats).forEach(function(c) {
      var cd = dd.newsCats[c];
      if (!cd || typeof cd !== "object" || !Array.isArray(cd.newsItems)) { nc[c] = cd; return; }
      var chg = false;
      var arr = cd.newsItems.map(function(ni) {
        var u = fn(ni, c);
        if (!u || u === ni) return ni;
        chg = true; return u;
      });
      if (chg) { nc[c] = Object.assign({}, cd, { newsItems: arr }); ddCh = true; } else nc[c] = cd;
    });
    if (ddCh) { newTrades[dt] = Object.assign({}, dd, { newsCats: nc }); changed = true; }
  });
  return changed ? Object.assign({}, prevData, { trades: newTrades }) : prevData;
}
function NewsClassSettings(_ref_ncs) {
  var data = _ref_ncs.data, save = _ref_ncs.save;
  var custom = (data && data.custom) || {};
  var cats = (custom.newsCategories && custom.newsCategories.length > 0) ? custom.newsCategories : _DEF_NEWS_CATS_FROZEN;
  var subsMap = custom.newsSubCats || {};
  var _uOC = useState(""), _uOCS = _slicedToArray(_uOC, 2), openCat = _uOCS[0], setOpenCat = _uOCS[1];
  var _uNC = useState(""), _uNCS = _slicedToArray(_uNC, 2), newCatName = _uNCS[0], setNewCatName = _uNCS[1];
  var _uNS = useState(""), _uNSS = _slicedToArray(_uNS, 2), newSubName = _uNSS[0], setNewSubName = _uNSS[1];
  var _uRN = useState(null), _uRNS = _slicedToArray(_uRN, 2), renTarget = _uRNS[0], setRenTarget = _uRNS[1];
  var _uRV = useState(""), _uRVS = _slicedToArray(_uRV, 2), renValue = _uRVS[0], setRenValue = _uRVS[1];

  // 分類ごとの「保存済み記事」件数。削除していい名前かどうかの判断材料になるので見せる。
  var counts = useMemo(function() {
    var byCat = {}, bySub = {};
    var trades = (data && data.trades) || {};
    Object.keys(trades).forEach(function(dt) {
      var dd = trades[dt]; if (!dd) return;
      var all = getAllNewsCatsData(dd);
      Object.keys(all).forEach(function(c) {
        ((all[c] && all[c].newsItems) || []).forEach(function(ni) {
          if (!_snNiKept(ni)) return;
          var kc = ni.keep.cat || "", ks = ni.keep.sub || "";
          if (kc) byCat[kc] = (byCat[kc] || 0) + 1;
          if (kc && ks) bySub[kc + "::" + ks] = (bySub[kc + "::" + ks] || 0) + 1;
        });
      });
    });
    return { cat: byCat, sub: bySub };
  }, [data && data.trades]);

  var updCustom = function(nc) {
    save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, nc) }); });
  };
  var addCat = function(name) {
    var nm = (name || "").trim();
    if (!nm || cats.indexOf(nm) >= 0) return;
    updCustom({ newsCategories: cats.concat([nm]) });
  };
  var reorderCat = function(name, dir) {
    var i = cats.indexOf(name); if (i < 0) return;
    var j = i + dir; if (j < 0 || j >= cats.length) return;
    var arr = cats.slice(); var tmp = arr[j]; arr[j] = arr[i]; arr[i] = tmp;
    updCustom({ newsCategories: arr });
  };
  var renameCat = function(oldName, newName) {
    var nm = (newName || "").trim();
    if (!nm || nm === oldName || cats.indexOf(nm) >= 0) return false;
    save(function(prevData) {
      var pc = prevData.custom || {};
      var newCats = (pc.newsCategories || []).map(function(c) { return c === oldName ? nm : c; });
      var newSubs = Object.assign({}, pc.newsSubCats || {});
      if (newSubs[oldName] != null) { newSubs[nm] = newSubs[oldName]; delete newSubs[oldName]; }
      // 銘柄側の「このカテゴリも拾う」指定(shvExtraCats)も名前で持っているので追従させる
      var pec = (pc.shvExtraCats && typeof pc.shvExtraCats === "object" && !Array.isArray(pc.shvExtraCats)) ? pc.shvExtraCats : {};
      var nec = {}, pfx = oldName + "::";
      Object.keys(pec).forEach(function(stk) {
        var arr = (pec[stk] || []).map(function(k) {
          if (k === oldName) return nm;
          if (k.indexOf(pfx) === 0) return nm + "::" + k.slice(pfx.length);
          return k;
        });
        if (arr.length) nec[stk] = arr;
      });
      // 保存キーを引っ越す。引っ越し先に既に中身があれば上書きせず newsItems をマージ（データ消失防止）。
      var newTrades = Object.assign({}, prevData.trades || {});
      Object.keys(newTrades).forEach(function(dt) {
        var dd = newTrades[dt];
        if (!dd || !dd.newsCats || dd.newsCats[oldName] == null) return;
        var nc = Object.assign({}, dd.newsCats);
        if (nc[nm] != null) {
          nc[nm] = Object.assign({}, nc[nm], { newsItems: ((nc[nm] || {}).newsItems || []).concat((nc[oldName] || {}).newsItems || []) });
        } else nc[nm] = nc[oldName];
        delete nc[oldName];
        newTrades[dt] = Object.assign({}, dd, { newsCats: nc });
      });
      var withTrades = Object.assign({}, prevData, { trades: newTrades });
      var withKeep = _ncsMapNewsItems(withTrades, function(ni) {
        if (!_snNiKept(ni) || ni.keep.cat !== oldName) return null;
        return Object.assign({}, ni, { keep: Object.assign({}, ni.keep, { cat: nm }) });
      });
      return Object.assign({}, withKeep, {
        custom: Object.assign({}, pc, { newsCategories: newCats, newsSubCats: newSubs, shvExtraCats: nec })
      });
    });
    return true;
  };
  var delCat = function(name) {
    // 一覧から外すだけ。過去の記事本体は trades 側に残す（ボードは串刺しなので引き続き見える）。
    // ただし keep.cat は存在しない名前を指したままになるので未分類へ戻す。
    save(function(prevData) {
      var pc = prevData.custom || {};
      var ns = (pc.newsCategories || []).filter(function(c) { return c !== name; });
      var newSubs = Object.assign({}, pc.newsSubCats || {});
      delete newSubs[name];
      var pec = (pc.shvExtraCats && typeof pc.shvExtraCats === "object" && !Array.isArray(pc.shvExtraCats)) ? pc.shvExtraCats : {};
      var nec = {}, pfx = name + "::";
      Object.keys(pec).forEach(function(stk) {
        var arr = (pec[stk] || []).filter(function(k) { return k !== name && k.indexOf(pfx) !== 0; });
        if (arr.length) nec[stk] = arr;
      });
      var withKeep = _ncsMapNewsItems(prevData, function(ni) {
        if (!_snNiKept(ni) || ni.keep.cat !== name) return null;
        return Object.assign({}, ni, { keep: Object.assign({}, ni.keep, { cat: "", sub: "" }) });
      });
      return Object.assign({}, withKeep, {
        custom: Object.assign({}, pc, {
          newsCategories: ns.length > 0 ? ns : [].concat(DEF_NEWS_CATS),
          newsSubCats: newSubs, shvExtraCats: nec
        })
      });
    });
  };
  var subsOf = function(c) { return (subsMap && Array.isArray(subsMap[c])) ? subsMap[c] : []; };
  var addSub = function(c, name) {
    var nm = (name || "").trim();
    if (!c || !nm || subsOf(c).indexOf(nm) >= 0) return;
    var ns = Object.assign({}, subsMap); ns[c] = subsOf(c).concat([nm]);
    updCustom({ newsSubCats: ns });
  };
  var reorderSub = function(c, name, dir) {
    var arr = subsOf(c).slice();
    var i = arr.indexOf(name); if (i < 0) return;
    var j = i + dir; if (j < 0 || j >= arr.length) return;
    var tmp = arr[j]; arr[j] = arr[i]; arr[i] = tmp;
    var ns = Object.assign({}, subsMap); ns[c] = arr;
    updCustom({ newsSubCats: ns });
  };
  var renameSub = function(c, oldName, newName) {
    var nm = (newName || "").trim();
    if (!c || !nm || nm === oldName || subsOf(c).indexOf(nm) >= 0) return false;
    save(function(prevData) {
      var pc = prevData.custom || {};
      var ns = Object.assign({}, pc.newsSubCats || {});
      ns[c] = (ns[c] || []).map(function(s) { return s === oldName ? nm : s; });
      var withKeep = _ncsMapNewsItems(prevData, function(ni, itemCat) {
        var hitKeep = _snNiKept(ni) && ni.keep.cat === c && ni.keep.sub === oldName;
        var hitOld = (itemCat === c && ni && ni.subCat === oldName);
        if (!hitKeep && !hitOld) return null;
        var nn = Object.assign({}, ni);
        if (hitKeep) nn.keep = Object.assign({}, ni.keep, { sub: nm });
        if (hitOld) nn.subCat = nm;
        return nn;
      });
      return Object.assign({}, withKeep, { custom: Object.assign({}, pc, { newsSubCats: ns }) });
    });
    return true;
  };
  var delSub = function(c, name) {
    save(function(prevData) {
      var pc = prevData.custom || {};
      var ns = Object.assign({}, pc.newsSubCats || {});
      var arr = (ns[c] || []).filter(function(s) { return s !== name; });
      if (arr.length === 0) delete ns[c]; else ns[c] = arr;
      var withKeep = _ncsMapNewsItems(prevData, function(ni, itemCat) {
        var hitKeep = _snNiKept(ni) && ni.keep.cat === c && ni.keep.sub === name;
        var hitOld = (itemCat === c && ni && ni.subCat === name);
        if (!hitKeep && !hitOld) return null;
        var nn = Object.assign({}, ni);
        if (hitKeep) nn.keep = Object.assign({}, ni.keep, { sub: "" });
        if (hitOld) delete nn.subCat;
        return nn;
      });
      return Object.assign({}, withKeep, { custom: Object.assign({}, pc, { newsSubCats: ns }) });
    });
  };

  var miniBtn = { padding: "2px 7px", fontSize: 11, fontWeight: 700, background: "#fff",
    color: "#555", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" };
  var renderRen = function(kind, c, name) {
    return React.createElement("div", { style: { display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", marginTop: 5 } },
      React.createElement(FastInput, {
        type: "text", value: renValue, debounceMs: 0, autoFocus: true,
        onChange: function(v) { setRenValue(v); },
        style: { flex: 1, minWidth: 120, padding: "5px 7px", fontSize: 13, border: "1px solid #ccc", borderRadius: 5 }
      }),
      React.createElement("button", {
        onClick: function() {
          var ok = (kind === "cat") ? renameCat(name, renValue) : renameSub(c, name, renValue);
          if (ok !== false) { setRenTarget(null); setRenValue(""); }
        },
        style: Object.assign({}, miniBtn, { background: "#10B981", color: "#fff", border: "1px solid #10B981" })
      }, "決定"),
      React.createElement("button", {
        onClick: function() { setRenTarget(null); setRenValue(""); },
        style: miniBtn
      }, "やめる")
    );
  };
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 8 } },
      "ニュースは日々の画面では1つのボードに串刺しで並びます。ここの分類は「この記事を保存」した時の選択肢と、\uD83D\uDCF0ニュース一覧の絞込に使います。"),
    cats.map(function(c, ci) {
      var subs = subsOf(c);
      var open = openCat === c;
      return React.createElement("div", {
        key: "ncs_" + c,
        style: { border: "1px solid #e0ddd6", borderRadius: 8, marginBottom: 6, background: "#fff" }
      },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "7px 9px", flexWrap: "wrap" } },
          React.createElement("button", {
            onClick: function() { setOpenCat(open ? "" : c); setNewSubName(""); },
            style: { flex: 1, minWidth: 120, textAlign: "left", padding: 0, border: "none", background: "none",
              fontSize: 13, fontWeight: 700, color: "#1a1a1a", cursor: "pointer" }
          }, (open ? "▾ " : "▸ ") + c,
            React.createElement("span", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginLeft: 6 } },
              "保存 " + (counts.cat[c] || 0) + "件" + (subs.length ? " / サブ " + subs.length : ""))),
          React.createElement("button", { onClick: function() { reorderCat(c, -1); }, disabled: ci === 0,
            style: Object.assign({}, miniBtn, { opacity: ci === 0 ? 0.35 : 1 }) }, "↑"),
          React.createElement("button", { onClick: function() { reorderCat(c, 1); }, disabled: ci === cats.length - 1,
            style: Object.assign({}, miniBtn, { opacity: ci === cats.length - 1 ? 0.35 : 1 }) }, "↓"),
          React.createElement("button", { onClick: function() { setRenTarget({ kind: "cat", cat: c, name: c }); setRenValue(c); },
            style: miniBtn }, "改名"),
          React.createElement("button", {
            onClick: function() {
              window._snConfirm("「" + c + "」を分類の一覧から外しますか？\n記事自体は消えません（ボードには引き続き並びます）。\nこの分類で保存していた " + (counts.cat[c] || 0) + " 件は未分類に戻ります。").then(function(ok) {
                if (ok) delCat(c);
              });
            },
            style: Object.assign({}, miniBtn, { color: "#DC2626", border: "1px solid #FCA5A5" })
          }, "削除")
        ),
        renTarget && renTarget.kind === "cat" && renTarget.name === c
          ? React.createElement("div", { style: { padding: "0 9px 9px" } }, renderRen("cat", c, c)) : null,
        open ? React.createElement("div", { style: { padding: "0 9px 9px", borderTop: "1px dashed #e8e5df" } },
          subs.length === 0
            ? React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "7px 0" } }, "(サブはありません)")
            : subs.map(function(s, si) {
                return React.createElement("div", { key: "ncs_s_" + c + "_" + s, style: { paddingTop: 6 } },
                  React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" } },
                    React.createElement("span", { style: { flex: 1, minWidth: 110, fontSize: 12, color: "#444", fontWeight: 600 } },
                      "› " + s,
                      React.createElement("span", { style: { fontSize: 10, color: "#999", fontWeight: 600, marginLeft: 5 } },
                        (counts.sub[c + "::" + s] || 0) + "件")),
                    React.createElement("button", { onClick: function() { reorderSub(c, s, -1); }, disabled: si === 0,
                      style: Object.assign({}, miniBtn, { opacity: si === 0 ? 0.35 : 1 }) }, "↑"),
                    React.createElement("button", { onClick: function() { reorderSub(c, s, 1); }, disabled: si === subs.length - 1,
                      style: Object.assign({}, miniBtn, { opacity: si === subs.length - 1 ? 0.35 : 1 }) }, "↓"),
                    React.createElement("button", { onClick: function() { setRenTarget({ kind: "sub", cat: c, name: s }); setRenValue(s); },
                      style: miniBtn }, "改名"),
                    React.createElement("button", {
                      onClick: function() {
                        window._snConfirm("サブ「" + s + "」を削除しますか？\n記事自体は消えません。このサブで保存していた " + (counts.sub[c + "::" + s] || 0) + " 件はカテゴリのみの保存になります。").then(function(ok) {
                          if (ok) delSub(c, s);
                        });
                      },
                      style: Object.assign({}, miniBtn, { color: "#DC2626", border: "1px solid #FCA5A5" })
                    }, "削除")
                  ),
                  renTarget && renTarget.kind === "sub" && renTarget.cat === c && renTarget.name === s
                    ? renderRen("sub", c, s) : null
                );
              }),
          React.createElement("div", { style: { display: "flex", gap: 5, alignItems: "center", marginTop: 8 } },
            React.createElement(FastInput, {
              type: "text", value: newSubName, debounceMs: 0,
              onChange: function(v) { setNewSubName(v); },
              placeholder: "＋ サブを追加",
              style: { flex: 1, minWidth: 100, padding: "5px 7px", fontSize: 12, border: "1px solid #ccc", borderRadius: 5 }
            }),
            React.createElement("button", {
              onClick: function() { addSub(c, newSubName); setNewSubName(""); },
              style: Object.assign({}, miniBtn, { background: "#1a1a1a", color: "#fff", border: "1px solid #1a1a1a" })
            }, "追加")
          )
        ) : null
      );
    }),
    React.createElement("div", { style: { display: "flex", gap: 5, alignItems: "center", marginTop: 8 } },
      React.createElement(FastInput, {
        type: "text", value: newCatName, debounceMs: 0,
        onChange: function(v) { setNewCatName(v); },
        placeholder: "＋ カテゴリを追加",
        style: { flex: 1, minWidth: 120, padding: "6px 8px", fontSize: 13, border: "1px solid #ccc", borderRadius: 5 }
      }),
      React.createElement("button", {
        onClick: function() { addCat(newCatName); setNewCatName(""); },
        style: { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#1a1a1a",
          color: "#fff", border: "1px solid #1a1a1a", borderRadius: 5, cursor: "pointer" }
      }, "追加")
    )
  );
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
    window._snConfirm("\u3053\u306E\u4E88\u5B9A\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F").then(function(_ok){ if(!_ok) return;
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
    });
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
// 2026-08-03i ボードの並び順。ドラッグで並べ替えると、その日の全札に ord(0,1,2…) を焼き込むので以後は ord 順。
// ord が無い札（まだ一度も並べ替えていない／並べ替えた後に足した札）は ord 付きの後ろに回り、id（＝追加時刻）の昇順で並ぶ。
// 2026-08-03m 横長スクショの「列」を検出する。ニュースサイトのPC表示を撮ると本文の横に別記事や関連情報が並ぶので、
// 左端のブロックだけを大きく見せたい。縦にずっと伸びる「余白の帯（ガター）」を探し、その左右をブロックとみなす。
// 画像はcanvasへ小さく描いて読む。Storage経由(imageUrl)の画像はCORSでcanvasが汚染されて読めないことがあるので、
// その場合はnullを返して従来どおり全体表示にフォールバックする（例外を投げない）。
// 2026-08-03o 縦横比による足切りは廃止。実物は2段組でも全体が縦長(比0.78)になることがあり、
// 比で絞ると取りこぼす。1段組の記事は下の受け入れ条件（ブロック幅の下限・上限）で弾かれるので、全部の画像を調べる。
// 横長・正方形スクショの「列」を検出する。ニュースサイトのPC表示を撮ると本文の横に別記事が並ぶので、
// 左端のブロックだけを大きく見せたい。縦に伸びる「余白の帯（ガター）」を探し、その左右をブロックとみなす。
// 難しいのは全幅のヘッダ・フッタ・区切りバーが縦の帯を必ず横切ること。「中身が全く無い列」を探すと実物では見つからない。
// そこで絶対値ではなく本文列との相対で判定する＝本文列の1/4も中身が無い列はガター。
// canvasが汚染されて画素を読めない場合（Storage経由のimageUrl等）はnullを返し、従来どおり全体表示にする。
// 2026-08-03p 画面に出ているニュース札の画像を診断する。コンソールで _snNewsColDebug() と打つと、
// 各札の実寸・画素を読めたか・列を検出できたかが分かる。実物で効かないときの切り分け用。
function _snNewsColDebug() {
  var out = [];
  var cards = document.querySelectorAll("[data-niid]");
  for (var i = 0; i < cards.length; i++) {
    var im = cards[i].querySelector("img");
    if (!im) { out.push({ id: cards[i].getAttribute("data-niid"), 画像: "なし" }); continue; }
    var r = _snDetectImgColumns(im);
    var pf = null;
    try { pf = _snColProfile(im); } catch (e2) { pf = null; }
    var prof = "";
    if (pf && pf !== "blocked") {
      var gcnt = 0, k2;
      for (k2 = 0; k2 < pf.W; k2++) if (pf.run[k2] >= _COL_GUTTER_RUN) gcnt++;
      var top = [], step = Math.max(1, Math.round(pf.W / 24));
      for (k2 = 0; k2 < pf.W; k2 += step) top.push(Math.round(pf.run[k2] * 99));
      prof = "ガター列数=" + gcnt + "/" + pf.W + " 縦空白の分布=" + top.join(",");
    }
    out.push({
      id: cards[i].getAttribute("data-niid"),
      実寸: im.naturalWidth + "x" + im.naturalHeight,
      比: (im.naturalWidth / im.naturalHeight).toFixed(2),
      src: (im.src || "").slice(0, 40),
      結果: (r === "blocked") ? "画素を読めない(CORS汚染)" : (r ? (r.length + "ブロック 左w=" + r[0].width.toFixed(3)) : "列なし"),
      詳細: prof
    });
  }
  return out;
}
// 2026-08-03q 列の切れ目は「縦にどれだけ連続して空白が続くか」で見る。
// 旧: 列全体の中身の平均が薄いか。これは紙面の内容量に左右されて不安定だった＝右カラムが下半分空白だと平均が下がって
// 「ここも余白だ」と誤り、左カラムが写真とグラフで埋まっていると基準が上がって本文列を余白と誤る。
// 目で見て「太い余白の帯」と分かるのは、上から下までつながっているから。その特徴をそのまま測る。
// 全幅のヘッダや区切り線が横切っても、短い中断は許容して1本の帯として数える。
function _snColProfile(imgEl) {
  var NW = imgEl.naturalWidth, NH = imgEl.naturalHeight;
  if (!NW || !NH) return null;
  var W = Math.min(420, NW);
  var H = Math.min(560, Math.max(1, Math.round(NH * (W / NW))));
  var cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  var ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(imgEl, 0, 0, W, H);
  // Storage経由(imageUrl)の画像はcanvasが汚染されて読めない。「列が無い」と区別するため blocked を返す。
  var d;
  try { d = ctx.getImageData(0, 0, W, H).data; }
  catch (se) { return "blocked"; }
  // 背景色はふちの画素の最頻色で決める（白とは限らない＝灰色地のサイトもある）
  var bins = {}, best = null, bestN = 0, i4, key, bx, by;
  var edge = function(x, y) {
    i4 = (y * W + x) * 4;
    key = ((d[i4] >> 4) << 8) | ((d[i4 + 1] >> 4) << 4) | (d[i4 + 2] >> 4);
    bins[key] = (bins[key] || 0) + 1;
    if (bins[key] > bestN) { bestN = bins[key]; best = [d[i4], d[i4 + 1], d[i4 + 2]]; }
  };
  for (bx = 0; bx < W; bx++) { edge(bx, 0); edge(bx, H - 1); }
  for (by = 0; by < H; by++) { edge(0, by); edge(W - 1, by); }
  if (!best) return null;
  // サイトのヘッダは必ず全幅で入るので上端を少し外す。下端は広告や余白なのでそのまま見る。
  var y0 = Math.floor(H * 0.08), y1 = H;
  var rows = y1 - y0;
  if (rows < 20) return null;
  // 画素が背景色かどうか
  var isBgAt = function(x, y) {
    var p4 = (y * W + x) * 4;
    return (Math.abs(d[p4] - best[0]) + Math.abs(d[p4 + 1] - best[1]) + Math.abs(d[p4 + 2] - best[2])) <= 45;
  };
  // 2026-08-03q 全幅の帯（サイトのヘッダ・区切り線・全幅の広告や写真）は縦の余白を分断するので、行ごと除外する。
  // 「短い中断なら帯を切らない」という許容を入れると、今度は本文の行間まで空白としてつながってしまい、
  // 本文列が丸ごと余白に見えてしまった。中断を許すのではなく、横に伸びるものを先に取り除くのが正しい。
  var x, y, band = new Array(H), rowInk;
  for (y = y0; y < y1; y++) {
    rowInk = 0;
    for (x = 0; x < W; x++) if (!isBgAt(x, y)) rowInk++;
    band[y] = (rowInk / W) > 0.85;
  }
  var ink = new Array(W), run = new Array(W), n, cur, bestRun, seen;
  for (x = 0; x < W; x++) {
    n = 0; cur = 0; bestRun = 0; seen = 0;
    for (y = y0; y < y1; y++) {
      if (band[y]) continue;                 // 全幅の帯は無かったことにする（数えない・帯も切らない）
      seen++;
      if (isBgAt(x, y)) { cur++; if (cur > bestRun) bestRun = cur; }
      else { n++; cur = 0; }
    }
    ink[x] = seen ? (n / seen) : 0;
    run[x] = seen ? (bestRun / seen) : 0;   // 縦に連続した空白の最長割合
  }
  return { W: W, H: H, rows: rows, bg: best, ink: ink, run: run };
}
// これ以上の割合で縦に空白が続いていれば「余白の帯（ガター）」とみなす。
// 本物のガターは上から下までほぼ通るので実測0.99。一方、本文が途中で終わる列（記事が短く下が空白）は実測0.65前後。
// 0.62〜0.80のどこに置いても判定結果は変わらなかったので、間を広く取れる0.75にした。
var _COL_GUTTER_RUN = 0.75;
function _snDetectImgColumns(imgEl) {
  try {
    var pf = _snColProfile(imgEl);
    if (pf === "blocked") return "blocked";
    if (!pf) return null;
    var W = pf.W, run = pf.run, x;
    var isG = new Array(W);
    for (x = 0; x < W; x++) isG[x] = run[x] >= _COL_GUTTER_RUN;
    // 細い隙間（行間・字間）はガターにしない。細い断片（縦罫線・アイコン列）はブロックにしない。
    var MIN_GUT = Math.max(3, Math.round(W * 0.012));
    var MIN_BLOCK = Math.max(8, Math.round(W * 0.10));
    var fillRuns = function(arr, val, minLen) {
      var s = -1, i2, k;
      for (i2 = 0; i2 <= arr.length; i2++) {
        if (i2 < arr.length && arr[i2] === val) { if (s < 0) s = i2; }
        else if (s >= 0) { if (i2 - s < minLen) { for (k = s; k < i2; k++) arr[k] = !val; } s = -1; }
      }
    };
    fillRuns(isG, true, MIN_GUT);
    fillRuns(isG, false, MIN_BLOCK);
    var blocks = [], s2 = -1;
    for (x = 0; x <= W; x++) {
      if (x < W && !isG[x]) { if (s2 < 0) s2 = x; }
      else if (s2 >= 0) { blocks.push({ left: s2 / W, width: (x - s2) / W }); s2 = -1; }
    }
    if (blocks.length < 2) return null;
    // 受け入れ条件: 1段組の記事を誤って割らないための歯止め。
    if (blocks[0].width < 0.18 || blocks[0].width > 0.78) return null;
    if (blocks[1].width < 0.12) return null;
    return blocks;
  } catch (e) { return null; }
}
function _snNiOrderCmp(a, b) {
  var ao = (a && typeof a.ord === "number") ? a.ord : null;
  var bo = (b && typeof b.ord === "number") ? b.ord : null;
  if (ao !== null && bo !== null) {
    if (ao !== bo) return ao - bo;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  }
  if (ao !== null) return -1;
  if (bo !== null) return 1;
  return (Number(a.id) || 0) - (Number(b.id) || 0);
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
  
  var addBtnFileRef = useRef(null);
  var addBtnPasteRef = useRef(null);
  // 2026-08-03i カードのドラッグ並べ替え（PC＝画像そのものを掴める／タッチ＝☰ハンドル）。
  var newsGridRef = useRef(null);
  var newsDragRef = useRef(null);
  var dragClickGuardRef = useRef(0);
  var _colProbeRef = useRef({});   // 2026-08-03p CORSで読み直した画像を覚えておく（何度も取りに行かない）
  var _usDF = useState(null), _usDFS = _slicedToArray(_usDF, 2), dragFromId = _usDFS[0], setDragFromId = _usDFS[1];
  var _usDO = useState(null), _usDOS = _slicedToArray(_usDO, 2), dragOverId = _usDOS[0], setDragOverId = _usDOS[1];
  // 2026-08-03j 横長の画像はカードを2列ぶんに広げる。縦横比はデータに持っていないので、
  // 描画後にDOMのnaturalWidth/Heightから実測する＝以前から入っている画像にも効く。
  var _usAR = useState({}), _usARS = _slicedToArray(_usAR, 2), imgAspects = _usARS[0], setImgAspects = _usARS[1];

  var _usABD = useState(false), _usABDS = _slicedToArray(_usABD, 2), addBtnDrag = _usABDS[0], setAddBtnDrag = _usABDS[1];
  // 2026-08-03e 「この記事を保存」シート。カード単位でカテゴリ・サブ・銘柄（複数可）を選ぶ。
  // 全部任意＝何も選ばずに保存だけでも通る（keep があれば保存済、中身が空なら未分類）。
  var _usKS = useState(null), _usKSS = _slicedToArray(_usKS, 2), keepSheet = _usKSS[0], setKeepSheet = _usKSS[1];
  useModalBack(keepSheet != null, function(){ setKeepSheet(null); }, "news-keep-sheet");
  // ボード上部の「使用中の材料タグ」チップ。押すとそのタグで絞り込む（複数選択＝AND）。
  var _usBTF = useState([]), _usBTFS = _slicedToArray(_usBTF, 2), boardTagFilter = _usBTFS[0], setBoardTagFilter = _usBTFS[1];
  var _usMv = useState(null), _usMvS = _slicedToArray(_usMv, 2), moveTarget = _usMvS[0], setMoveTarget = _usMvS[1];
  var _usMvC = useState(""), _usMvCS = _slicedToArray(_usMvC, 2), moveToCat = _usMvCS[0], setMoveToCat = _usMvCS[1];
  var _usMvSc = useState(""), _usMvScS = _slicedToArray(_usMvSc, 2), moveToSubCat = _usMvScS[0], setMoveToSubCat = _usMvScS[1];
  
  var _usMvD = useState(date), _usMvDS = _slicedToArray(_usMvD, 2), moveToDate = _usMvDS[0], setMoveToDate = _usMvDS[1];
  
  var _usMvMd = useState("move"), _usMvMdS = _slicedToArray(_usMvMd, 2), moveMode = _usMvMdS[0], setMoveMode = _usMvMdS[1];
  
  var _usCT = useState([]), _usCTS = _slicedToArray(_usCT, 2), cloneTargets = _usCTS[0], setCloneTargets = _usCTS[1];
  
  useModalBack(moveTarget != null, function(){ setMoveTarget(null); }, "news-move");
  
  var _usDC = useState(null), _usDCS = _slicedToArray(_usDC, 2), delConfirmTarget = _usDCS[0], setDelConfirmTarget = _usDCS[1];
  useModalBack(delConfirmTarget != null, function(){ setDelConfirmTarget(null); }, "news-del-confirm");
  var newsCategories = custom.newsCategories && custom.newsCategories.length > 0 ? custom.newsCategories : _DEF_NEWS_CATS_FROZEN;
  var allCatsData = getAllNewsCatsData(dd);
  var orphanCats = Object.keys(allCatsData).filter(function (cat) {
    return !newsCategories.includes(cat) && hasCatContent(allCatsData[cat]);
  });
  var displayCats = [].concat(_toConsumableArray(newsCategories), _toConsumableArray(orphanCats));
  // 2026-08-03e カテゴリは画面の概念ではなくなった（ボードは全カテゴリ串刺し）。
  // 保存キー trades[日付].newsCats[カテゴリ] としてだけ残るので、新規カードの置き場所＝受け皿を1つ決めておく。
  // 分類自体は記事の keep が持つので、このキーはもう意味を持たない。
  var inboxCat = displayCats[0] || "マーケット";
  useEffect(function() {
    if (!jumpTarget || !jumpTarget.niId) return;
    // 2026-08-03e タブが無くなり全カテゴリを1つのボードに並べるので、カテゴリ／サブを切り替える必要がない＝ハイライトとスクロールだけ。
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
  // 2026-08-03e 受け皿カテゴリへの書き込み。新規カードの追加だけが使う（既存カードの編集は id で全カテゴリを横断する）。
  var updCatField = function updCatField(k, vOrFn) {
    save(function(prevData) {
      var prevDd = prevData.trades[date] || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      var prevCatData = prevAllCats[inboxCat] || {};
      var v = typeof vOrFn === 'function' ? vOrFn(prevCatData[k]) : vOrFn;
      var newCats = _objectSpread(_objectSpread({}, prevAllCats), {}, _defineProperty({}, inboxCat, _objectSpread(_objectSpread({}, prevCatData), {}, _defineProperty({}, k, v))));
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
  
  // 2026-08-03e ボード（B案・画像主役）。その日の全カテゴリの newsItems を串刺しで1本にする。
  // クローン（groupId）は1枚だけ出す。並びは id（＝追加時刻）の昇順＝追加順。
  // カテゴリをまたいで１列に混ぜる以上、カテゴリ配列内での手並べ替えは画面の並びと対応できないので、ドラッグ並べ替えは廃止した。
  var boardItems = useMemo(function() {
    var out = [], seen = {};
    var all = getAllNewsCatsData(dd);
    Object.keys(all).forEach(function(c) {
      var arr = (all[c] && all[c].newsItems) || [];
      arr.forEach(function(ni) {
        if (!ni) return;
        var gid = ni.groupId;
        if (gid) { if (seen[gid]) return; seen[gid] = true; }
        out.push({ cat: c, ni: ni });
      });
    });
    out.sort(function(a, b) { return _snNiOrderCmp(a.ni, b.ni); });
    return out;
  }, [dd]);
  // 使用中の材料タグ（件数付き）。多い順→名前順。
  var boardTagChips = useMemo(function() {
    var m = {}, order = [];
    boardItems.forEach(function(e) {
      ((e.ni && e.ni.tags) || []).forEach(function(tg) {
        if (!tg) return;
        if (m[tg] == null) { m[tg] = 0; order.push(tg); }
        m[tg]++;
      });
    });
    order.sort(function(a, b) { return (m[b] - m[a]) || a.localeCompare(b, "ja"); });
    return order.map(function(tg) { return { tag: tg, n: m[tg] }; });
  }, [boardItems]);
  var shownItems = (boardTagFilter.length === 0) ? boardItems : boardItems.filter(function(e) {
    var tgs = (e.ni && e.ni.tags) || [];
    return boardTagFilter.every(function(tg) { return tgs.indexOf(tg) >= 0; });
  });
  // 画像ビューア／注釈のカード間送りが参照する配列（画面の並びと一致させる）
  var newsItems = shownItems.map(function(e) { return e.ni; });
  var keptCount = boardItems.filter(function(e) { return _snNiKept(e.ni); }).length;
  var togBoardTag = function(tg) {
    setBoardTagFilter(function(prev) {
      return (prev.indexOf(tg) >= 0) ? prev.filter(function(x) { return x !== tg; }) : prev.concat([tg]);
    });
  };
  // 2026-08-03o 画像の実寸と列構成の計測。描画後の一括走査だけでなく、<img>のonLoadからも呼ぶ。
  // 画像はIDB/Storageから後で差し込まれることがあり、一括走査のタイミングだけでは取りこぼしていた（実物で列検出が効かない原因のひとつ）。
  var _blockToCrop = function(w, h, blocks) {
    if (!blocks || blocks.length < 2) return null;
    var b0 = blocks[0];
    return { left: b0.left, width: b0.width, ratio: (w * b0.width) / h, blocks: blocks.length };
  };
  var measureNiImg = function(id, im) {
    if (!im) return;
    var w = im.naturalWidth, h = im.naturalHeight;
    if (!w || !h) return;
    var res = _snDetectImgColumns(im);
    setImgAspects(function(prev) {
      var cur = prev[id];
      if (cur && cur.w === w && cur.h === h && !(cur.blocked && res !== "blocked")) return prev;
      var nx = Object.assign({}, prev);
      nx[id] = { w: w, h: h, r: w / h, crop: (res === "blocked") ? null : _blockToCrop(w, h, res),
                 blocked: (res === "blocked") };
      return nx;
    });
    // 2026-08-03p 画素を読めなかった＝Storage経由でcanvasが汚染された。CORS指定の別画像で読み直す。
    // 表示中の<img>にcrossOriginを付けると、CORSヘッダが無いサーバでは画像自体が出なくなるので、
    // 表示は触らず裏で取り直す。取れなければ何もしない＝従来どおり全体表示のまま。
    if (res === "blocked" && im.src && im.src.indexOf("data:") !== 0 && !_colProbeRef.current[id]) {
      _colProbeRef.current[id] = 1;
      var probe = new Image();
      probe.crossOrigin = "anonymous";
      probe.onload = function() {
        var r2 = _snDetectImgColumns(probe);
        if (r2 === "blocked" || !r2) return;
        setImgAspects(function(prev) {
          var nx = Object.assign({}, prev);
          nx[id] = { w: w, h: h, r: w / h, crop: _blockToCrop(w, h, r2), blocked: false };
          return nx;
        });
      };
      probe.src = im.src;
    }
  };
  var _shownKey = shownItems.map(function(e) { return e.ni.id; }).join(",");
  useEffect(function() {
    var cont = newsGridRef.current;
    if (!cont) return;
    var cleanups = [];
    var imgs = cont.querySelectorAll("[data-niid] img");
    for (var i = 0; i < imgs.length; i++) {
      (function(im) {
        var card = im.closest ? im.closest("[data-niid]") : null;
        var id = card && card.getAttribute("data-niid");
        if (!id) return;
        if (im.complete && im.naturalWidth) { measureNiImg(id, im); return; }
        var onL = function() { measureNiImg(id, im); };
        im.addEventListener("load", onL);
        cleanups.push(function() { im.removeEventListener("load", onL); });
      })(imgs[i]);
    }
    return function() { cleanups.forEach(function(f) { f(); }); };
  }, [_shownKey]);
  // 2026-08-03k 画像の形でカードの出し方を変える。判定は実測した naturalWidth/Height。
  //  ・横長(16:9より横長)かつ元が大きい → 2列ぶんに広げる。潰れて読めなくなるのを防ぐ。
  //    元が小さい横長を2列にすると、拡大されずに右側が丸ごと余るだけなので幅の下限を付ける。
  //  ・縦長 → 高さを揃えてカード幅いっぱいに敷く（上端そろえ・下をトリミング）。行の高さが揃い、左右の余白も消える。
  //  ・正方形〜ゆるい横長 → そのままの比率。cover にすると左右が切れて記事の端が失われるため。
  var _WIDE_RATIO = 1.6;      // これ以上で「横長」
  var _WIDE_MIN_W = 600;      // 2列(約614px)を埋められる元の大きさ
  var _TALL_RATIO = 0.95;     // これ以下で「縦長」
  // 2026-08-03q 縦長を収める枠の縦横比（幅/高さ。1=正方形）。固定pxをやめて幅に追従させたので、
  // 列幅が変わっても札の形は変わらない。もっと縦を出したいときだけこの値を下げる。
  var _NEWS_BOX_R = 1;
  var _niShape = function(ni) { return imgAspects[String(ni.id)] || null; };
  var niCrop = function(ni) { var s = _niShape(ni); return (s && s.crop) ? s.crop : null; };
  // 2026-08-03m 列を切り出したら、以後の判定は「切り出した後の形」で行う。
  // 例: 1600x700の2段組は左ブロック780x700＝比1.11になるので、2列に広げず1列で出す（それでも元の2倍に見える）。
  var _effShape = function(ni) {
    var s = _niShape(ni);
    if (!s) return null;
    if (!s.crop) return s;
    var cw = s.w * s.crop.width;
    return { w: cw, h: s.h, r: cw / s.h };
  };
  var isWideNi = function(ni) { var s = _effShape(ni); return !!s && s.r >= _WIDE_RATIO && s.w >= _WIDE_MIN_W; };
  // 正方形の枠(fillAspect)に収める条件。切り出した札は object-fit を使えず「幅で決まる高さ」になるが、
  // 枠が正方形になったので比1以下なら下に空きは出ない。＝切り出し済みも通常と同じ _TALL_RATIO で判定できる。
  var isTallNi = function(ni) {
    var s = _effShape(ni);
    if (!s) return false;
    return s.r <= _TALL_RATIO;
  };
  // 2026-08-03e 自動タグ（newsCatDefaults/newsSubCatDefaults）は廃止。タグは手で付ける。サブは保存シートで選ぶ。
  var addNews = function addNews() {
    return updCatField("newsItems", function(prev) {
      var item = { id: Date.now(), text: "", images: [], tags: [] };
      return [].concat(_toConsumableArray(prev || []), [item]);
    });
  };
  // 2026-08-03f まとめて追加（複数ドロップ／複数ファイル選択／複数枚の貼り付け）。1枚＝1札で並べる。
  // 全部読み終えてから1回だけ書き込む＝同じミリ秒に複数枚できても id が衝突しない（衝突時は既存idを避けて採番）。
  var addNewsWithFiles = function addNewsWithFiles(fileList) {
    var files = [];
    for (var i = 0; i < (fileList ? fileList.length : 0); i++) {
      var f = fileList[i];
      if (f && (!f.type || f.type.indexOf("image/") === 0)) files.push(f);
    }
    if (!files.length) return;
    // 2026-08-03h 並び順は「ファイルの更新日時(lastModified)の早い順」＝スクショを撮った順＝時系列。
    // ドロップされる順はエクスプローラの表示設定しだいで変わる（名前順にも新しい順にもなる）ので、そちらは当てにしない。
    // 日時が同じ／取れない分は渡された順のまま（Array#sortは安定）。
    files.sort(function(a, b) { return (a.lastModified || 0) - (b.lastModified || 0); });
    Promise.all(files.map(function(f) {
      return Promise.resolve(fileToImg(f))["catch"](function() { return null; });
    })).then(function(imgs) {
      var ok = imgs.filter(function(x) { return x; });
      if (!ok.length) return;
      updCatField("newsItems", function(prev) {
        var arr = (prev || []).slice();
        var used = {};
        arr.forEach(function(n) { if (n && n.id != null) used[n.id] = 1; });
        var nid = Date.now();
        ok.forEach(function(img) {
          while (used[nid]) nid++;
          used[nid] = 1;
          arr.push({ id: nid, text: "", images: [img], tags: [] });
          nid++;
        });
        return arr;
      });
    });
  };
  var addNewsWithFile = function addNewsWithFile(f) { return addNewsWithFiles([f]); };
  var updNews = function updNews(id, uOrFn) {
    save(function(prevData) {
      return _propagateClones(prevData, id, function(n) {
        return typeof uOrFn === 'function' ? uOrFn(n) : uOrFn;
      });
    });
  };
  
  // 2026-08-03e カードは全カテゴリ串刺しなので、削除も id で全カテゴリを横断する（旧＝現在タブのカテゴリだけを見ていた）。
  var _delThisClone = function(id) {
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      var newCats = {}, changed = false;
      Object.keys(prevAllCats).forEach(function(c) {
        var cd = prevAllCats[c];
        var arr = (cd && cd.newsItems) || [];
        var kept = arr.filter(function(n) { return n.id !== id; });
        if (kept.length !== arr.length) { changed = true; newCats[c] = _objectSpread(_objectSpread({}, cd), {}, { newsItems: kept }); }
        else newCats[c] = cd;
      });
      if (!changed) return prevData;
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date,
          _objectSpread(_objectSpread({}, prevDd), {}, { newsCats: newCats })))
      });
    });
  };
  // 「この記事を保存」＝記事に keep を1つ足す。クローンにも同じ分類を配る（同じ記事なので）。
  var saveNiKeep = function(niId, kCat, kSub, kStocks) {
    save(function(prevData) {
      return _propagateClones(prevData, niId, function(n) {
        var at = (n.keep && typeof n.keep.at === "number" && n.keep.at > 0) ? n.keep.at : Date.now();
        return { keep: { at: at, cat: kCat || "", sub: kSub || "", stocks: (kStocks || []).slice() } };
      });
    });
  };
  // 保存をやめる＝keep ごと外す。_propagateClones はマージなのでフィールド削除には使えず、自前で全カテゴリを歩く。
  var unsaveNiKeep = function(niId) {
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      var orig = null;
      Object.keys(prevAllCats).some(function(c) {
        return ((prevAllCats[c] && prevAllCats[c].newsItems) || []).some(function(n) {
          if (n.id === niId) { orig = n; return true; } return false;
        });
      });
      if (!orig) return prevData;
      var gid = orig.groupId || null;
      var matches = function(n) {
        if (n.id === niId) return true;
        if (gid && (n.groupId === gid || n.id === gid)) return true;
        return false;
      };
      var newCats = {}, changed = false;
      Object.keys(prevAllCats).forEach(function(c) {
        var cd = prevAllCats[c];
        var arr = (cd && cd.newsItems) || [];
        newCats[c] = _objectSpread(_objectSpread({}, cd), {}, { newsItems: arr.map(function(n) {
          if (!matches(n) || !n.keep) return n;
          var nn = _objectSpread({}, n); delete nn.keep; changed = true; return nn;
        }) });
      });
      if (!changed) return prevData;
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date,
          _objectSpread(_objectSpread({}, prevDd), {}, { newsCats: newCats })))
      });
    });
  };
  // 2026-08-03i ドラッグ並べ替え。fromId を toId の位置へ移し、その日の全札に ord(0,1,2…) を焼き直す。
  // カテゴリをまたいで1列に混ぜているので、カテゴリ配列の順番ではなく ord を正本にする（カテゴリのキー自体は動かさない）。
  // クローン（同じ groupId）は同じ ord にする＝どのカテゴリに置かれていても画面上は1枚として同じ位置。
  var reorderNiTo = function(fromId, toId) {
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      var flat = [], seen = {};
      Object.keys(prevAllCats).forEach(function(c) {
        ((prevAllCats[c] && prevAllCats[c].newsItems) || []).forEach(function(n) {
          if (!n) return;
          var gid = n.groupId;
          if (gid) { if (seen[gid]) return; seen[gid] = true; }
          flat.push(n);
        });
      });
      flat.sort(_snNiOrderCmp);
      var fi = -1, ti = -1;
      for (var i = 0; i < flat.length; i++) {
        if (String(flat[i].id) === String(fromId)) fi = i;
        if (String(flat[i].id) === String(toId)) ti = i;
      }
      if (fi < 0 || ti < 0 || fi === ti) return prevData;
      var moved = flat.splice(fi, 1)[0];
      flat.splice(ti, 0, moved);
      var ordById = {}, ordByGid = {};
      flat.forEach(function(n, i2) {
        ordById[n.id] = i2;
        if (n.groupId != null) ordByGid[n.groupId] = i2;
        else ordByGid[n.id] = i2;
      });
      var newCats = {};
      Object.keys(prevAllCats).forEach(function(c) {
        var cd = prevAllCats[c];
        var arr = (cd && cd.newsItems) || [];
        newCats[c] = _objectSpread(_objectSpread({}, cd), {}, { newsItems: arr.map(function(n) {
          var o = (ordById[n.id] != null) ? ordById[n.id]
                : (n.groupId != null && ordByGid[n.groupId] != null) ? ordByGid[n.groupId] : null;
          if (o == null || n.ord === o) return n;
          return _objectSpread(_objectSpread({}, n), {}, { ord: o });
        }) });
      });
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date,
          _objectSpread(_objectSpread({}, prevDd), {}, { newsCats: newCats })))
      });
    });
  };
  // 掴んだ位置にいちばん近いカードを落とし先にする（gridなので上下左右＝中心との距離で判定）。
  var onNewsDragStart = function(fromId, e, isTouch) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    var p0 = (e.touches && e.touches[0]) ? e.touches[0] : e;
    newsDragRef.current = { id: fromId, moved: false, x: p0.clientX, y: p0.clientY };
    setDragFromId(fromId);
    setDragOverId(fromId);
    var pick = function(px, py) {
      var cont = newsGridRef.current;
      if (!cont) return null;
      var cards = cont.querySelectorAll("[data-niid]");
      var best = null, bestD = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = cards[i].getAttribute("data-niid"); }
      }
      return best;
    };
    var onMove = function(ev) {
      var st = newsDragRef.current;
      if (!st) return;
      var pp = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
      if (Math.abs(pp.clientX - st.x) > 4 || Math.abs(pp.clientY - st.y) > 4) st.moved = true;
      if (ev.cancelable) ev.preventDefault();
      var over = pick(pp.clientX, pp.clientY);
      if (over != null) setDragOverId(over);
    };
    var onEnd = function() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove, { passive: false });
      document.removeEventListener("touchend", onEnd);
      var st = newsDragRef.current;
      newsDragRef.current = null;
      setDragFromId(null);
      // ドラッグ直後のclickで画像が開かないように少しだけ蓋をする
      if (st && st.moved) dragClickGuardRef.current = Date.now();
      setDragOverId(function(overId) {
        if (st && st.moved && overId != null && String(overId) !== String(st.id)) reorderNiTo(st.id, overId);
        return null;
      });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  };
  var dragJustHappened = function() { return (Date.now() - dragClickGuardRef.current) < 300; };
  var openKeepSheet = function(e) {
    var ni = e.ni, k = _snNiKept(ni) ? ni.keep : null;
    setKeepSheet({
      niId: ni.id, cat: (k && k.cat) || "", sub: (k && k.sub) || "",
      stocks: (k && Array.isArray(k.stocks)) ? k.stocks.slice() : [],
      wasKept: !!k, addCat: false, catDraft: "", addSub: false, subDraft: ""
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
  
  keepSheet != null && (function() {
    var ks = keepSheet;
    var subOpts = (ks.cat && custom.newsSubCats && Array.isArray(custom.newsSubCats[ks.cat])) ? custom.newsSubCats[ks.cat] : [];
    var setKS = function(u) { setKeepSheet(function(p) { return p ? Object.assign({}, p, u) : p; }); };
    var chip = function(on) {
      return { padding: "5px 11px", fontSize: 12, fontWeight: on ? 700 : 500,
        background: on ? "#1a1a1a" : "#fff", color: on ? "#fff" : "#555",
        border: "1px solid " + (on ? "#1a1a1a" : "#ddd"), borderRadius: 999,
        cursor: "pointer", whiteSpace: "nowrap", minHeight: IS_TOUCH ? 34 : 26 };
    };
    var chipAdd = { padding: "5px 11px", fontSize: 12, fontWeight: 600, background: "#f5f4f0",
      color: "#888", border: "1.5px dashed #bbb", borderRadius: 999, cursor: "pointer",
      whiteSpace: "nowrap", minHeight: IS_TOUCH ? 34 : 26 };
    var secTitle = { fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 6 };
    var wrap = { display: "flex", flexWrap: "wrap", gap: 5 };
    var draftRow = { display: "flex", gap: 5, alignItems: "center", marginTop: 6 };
    var draftInput = { flex: 1, minWidth: 120, padding: "6px 8px", fontSize: 13,
      border: "1px solid #ccc", borderRadius: 5, boxSizing: "border-box" };
    var okBtn = { padding: "6px 12px", fontSize: 12, fontWeight: 700, background: "#1a1a1a",
      color: "#fff", border: "1px solid #1a1a1a", borderRadius: 5, cursor: "pointer" };
    var selStocks = ks.stocks || [];
    return React.createElement("div", {
      onClick: function() { setKeepSheet(null); },
      style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000,
        display: "flex", alignItems: "flex-end", justifyContent: "center" }
    }, React.createElement("div", {
      onClick: function(e) { e.stopPropagation(); },
      style: { background: "#fff", borderRadius: "14px 14px 0 0", width: "100%", maxWidth: 560,
        maxHeight: "88vh", display: "flex", flexDirection: "column" }
    },
      React.createElement("div", {
        style: { padding: "12px 16px", borderBottom: "1px solid #e0ddd6", display: "flex",
          alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }
      },
        React.createElement("span", { style: { fontSize: 15, fontWeight: 700 } }, "\uD83D\uDD16 この記事を保存"),
        React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "分類は全部任意です"),
        React.createElement("button", {
          onClick: function() { setKeepSheet(null); },
          style: { marginLeft: "auto", padding: "6px 14px", fontSize: 13, fontWeight: 600,
            background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 6,
            cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
        }, "キャンセル")
      ),
      React.createElement("div", {
        style: { padding: "12px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }
      },
        React.createElement("div", null,
          React.createElement("div", { style: secTitle }, "カテゴリ"),
          React.createElement("div", { style: wrap },
            React.createElement("button", { onClick: function() { setKS({ cat: "", sub: "" }); }, style: chip(!ks.cat) }, "なし"),
            displayCats.map(function(c) {
              return React.createElement("button", {
                key: "kc_" + c,
                onClick: function() { setKS({ cat: c, sub: "" }); },
                style: chip(ks.cat === c)
              }, c);
            }),
            React.createElement("button", {
              onClick: function() { setKS({ addCat: !ks.addCat, catDraft: "" }); },
              style: chipAdd
            }, "＋新規")
          ),
          ks.addCat ? React.createElement("div", { style: draftRow },
            React.createElement(FastInput, {
              type: "text", value: ks.catDraft || "", debounceMs: 0, autoFocus: true,
              onChange: function(v) { setKS({ catDraft: v }); },
              placeholder: "新しいカテゴリ名", style: draftInput
            }),
            React.createElement("button", {
              onClick: function() {
                var nm = String(ks.catDraft || "").trim();
                if (!nm) return;
                if (displayCats.indexOf(nm) < 0) updCustom({ newsCategories: newsCategories.concat([nm]) });
                setKS({ cat: nm, sub: "", addCat: false, catDraft: "" });
              }, style: okBtn
            }, "追加")
          ) : null
        ),
        React.createElement("div", null,
          React.createElement("div", { style: secTitle }, "サブ"),
          !ks.cat
            ? React.createElement("div", { style: { fontSize: 11, color: "#aaa" } }, "(カテゴリを選ぶとサブを選べます)")
            : React.createElement(React.Fragment, null,
                React.createElement("div", { style: wrap },
                  React.createElement("button", { onClick: function() { setKS({ sub: "" }); }, style: chip(!ks.sub) }, "なし"),
                  subOpts.map(function(s) {
                    return React.createElement("button", {
                      key: "ksb_" + s,
                      onClick: function() { setKS({ sub: s }); },
                      style: chip(ks.sub === s)
                    }, s);
                  }),
                  React.createElement("button", {
                    onClick: function() { setKS({ addSub: !ks.addSub, subDraft: "" }); },
                    style: chipAdd
                  }, "＋新規")
                ),
                ks.addSub ? React.createElement("div", { style: draftRow },
                  React.createElement(FastInput, {
                    type: "text", value: ks.subDraft || "", debounceMs: 0, autoFocus: true,
                    onChange: function(v) { setKS({ subDraft: v }); },
                    placeholder: "新しいサブ名", style: draftInput
                  }),
                  React.createElement("button", {
                    onClick: function() {
                      var nm = String(ks.subDraft || "").trim();
                      if (!nm) return;
                      if (subOpts.indexOf(nm) < 0) {
                        var ns = Object.assign({}, custom.newsSubCats || {});
                        ns[ks.cat] = subOpts.concat([nm]);
                        updCustom({ newsSubCats: ns });
                      }
                      setKS({ sub: nm, addSub: false, subDraft: "" });
                    }, style: okBtn
                  }, "追加")
                ) : null
              )
        ),
        React.createElement("div", null,
          React.createElement("div", { style: secTitle }, "銘柄（複数選択可）"),
          (allStocks && allStocks.length)
            ? React.createElement("div", { style: wrap }, allStocks.map(function(s) {
                var on = selStocks.indexOf(s) >= 0;
                return React.createElement("button", {
                  key: "kst_" + s,
                  // 複数選択なので直前のstateから積む（描画時のselStocksを使うと連打で先の選択が消える）
                  onClick: function() {
                    setKeepSheet(function(p) {
                      if (!p) return p;
                      var cur = p.stocks || [];
                      var has = cur.indexOf(s) >= 0;
                      return Object.assign({}, p, { stocks: has ? cur.filter(function(x) { return x !== s; }) : cur.concat([s]) });
                    });
                  },
                  style: chip(on)
                }, s);
              }))
            : React.createElement("div", { style: { fontSize: 11, color: "#aaa" } }, "(銘柄が登録されていません)")
        )
      ),
      React.createElement("div", {
        style: { padding: "10px 16px 14px", borderTop: "1px solid #e0ddd6", display: "flex",
          alignItems: "center", gap: 8, flexShrink: 0 }
      },
        ks.wasKept ? React.createElement("button", {
          onClick: function() { unsaveNiKeep(ks.niId); setKeepSheet(null); },
          style: { padding: "8px 14px", fontSize: 12, fontWeight: 700, background: "#fff",
            color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 6, cursor: "pointer",
            minHeight: IS_TOUCH ? 40 : 32 }
        }, "保存をやめる") : null,
        React.createElement("button", {
          onClick: function() { saveNiKeep(ks.niId, ks.cat, ks.sub, ks.stocks || []); setKeepSheet(null); },
          style: { marginLeft: "auto", padding: "9px 22px", fontSize: 14, fontWeight: 700,
            background: "#F59E0B", color: "#fff", border: "none", borderRadius: 7,
            cursor: "pointer", minHeight: IS_TOUCH ? 44 : 36 }
        }, ks.wasKept ? "保存を更新" : "保存")
      )
    ));
  })(),
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
  }(),

  // 2026-08-03r 札を少しでも広げるため、ニュース欄だけ外枠の左右余白を詰める（他のCard使用箇所は不変）。
  React.createElement("div", { style: _objectSpread(_objectSpread({}, Card), {}, { padding: "12px 8px" }) },
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }
    },
      React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "\uD83D\uDCF0 ニュース"),
      React.createElement("span", { style: { fontSize: 12, color: "#888", fontWeight: 600 } },
        boardItems.length + "件" + (keptCount ? "　\uD83D\uDD16 保存済み " + keptCount : "")),
      boardTagFilter.length > 0 ? React.createElement("button", {
        onClick: function() { setBoardTagFilter([]); },
        style: { marginLeft: "auto", padding: "3px 9px", fontSize: 11, fontWeight: 600,
          background: "#fff", color: "#DC2626", border: "1px solid #FCA5A5",
          borderRadius: 5, cursor: "pointer" }
      }, "✕ 絞込クリア（" + shownItems.length + "件表示）") : null
    ),
    boardTagChips.length > 0 ? React.createElement("div", {
      style: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10,
        paddingBottom: 9, borderBottom: "1px dashed #e8e5df" }
    }, boardTagChips.map(function(tc) {
      var on = boardTagFilter.indexOf(tc.tag) >= 0;
      var trip = _tagColorTriple((custom.tagColors || {})[tc.tag] || "#7A9CC8", on);
      return React.createElement("button", {
        key: "btc_" + tc.tag,
        onClick: function() { togBoardTag(tc.tag); },
        title: tc.tag,
        style: { padding: "3px 10px", fontSize: 11, fontWeight: on ? 700 : 600,
          background: trip[0], color: trip[2], border: "1px solid " + trip[1],
          borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap" }
      }, stripCat(tc.tag) + " " + tc.n);
    })) : null,
    // 2026-08-03i 横並びは最大3枚。列を絞ったぶん1枚あたりが広くなる＝サムネイルが大きく見える。
    React.createElement("div", {
      ref: newsGridRef,
      // 2026-08-03r gapを12→8、幅の頭打ちを1140→1600へ（広い画面で1140止まりだと札が広がらないため）。
      style: { display: "grid", alignItems: "start", gap: 8, maxWidth: 1600,
        gridTemplateColumns: "repeat(" + (IS_TOUCH ? 2 : 3) + ", minmax(0, 1fr))" }
    },
      shownItems.map(function(e, bIdx) {
        var ni = e.ni;
        var imgs = ni.images || [];
        var niTags = ni.tags || [];
        var kept = _snNiKept(ni);
        var kCat = kept ? (ni.keep.cat || "") : "";
        var kSub = kept ? (ni.keep.sub || "") : "";
        var kStocks = kept ? _snNiKeepStocks(ni) : [];
        var keepLabel = !kept ? "" : (kCat ? (kCat + (kSub ? " › " + kSub : "")) : "未分類");
        return React.createElement("div", {
          key: e.cat + "_" + ni.id,
          id: "ni-card-" + ni.id,
          "data-newscard": "1",
          "data-niid": String(ni.id),
          style: { position: "relative",
            background: highlightNiId === ni.id ? "#FEF3C7" : "#f8f7f4",
            boxShadow: highlightNiId === ni.id ? "0 0 0 3px #F59E0B" : "none",
            borderRadius: 10,
            border: kept ? "1.5px solid #F59E0B" : "1px solid #e8e5df",
            outline: (dragFromId != null && String(dragOverId) === String(ni.id) && String(dragFromId) !== String(ni.id)) ? "3px dashed #6366F1" : "none",
            outlineOffset: 2,
            opacity: String(dragFromId) === String(ni.id) ? 0.45 : 1,
            gridColumn: isWideNi(ni) ? "span 2" : "auto",
            // 2026-08-03q 上端に28pxの帯を空け、☰/↪/🔗/✕ はそこに収める。
            // 画像に重ねると記事の見出し（一番読みたい所）が隠れるため。
            paddingTop: 28,
            overflow: "hidden", transition: "background 0.4s, box-shadow 0.4s, opacity 0.15s" }
        },
          // ☰ ドラッグハンドル（タッチはこれで掴む。PCは画像を直接掴んでもよい）
          React.createElement("div", {
            onMouseDown: function(ev) { onNewsDragStart(ni.id, ev); },
            onTouchStart: function(ev) { onNewsDragStart(ni.id, ev, true); },
            title: "ドラッグで並べ替え",
            style: { position: "absolute", top: 3, left: 4, width: 22, height: 22,
              borderRadius: 5, background: "transparent", color: "#8a8478",
              border: "none", fontSize: 13, cursor: "grab", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3,
              touchAction: "none", userSelect: "none" }
          }, "☰"),
          React.createElement("button", {
            onClick: function() {
              setMoveToCat(e.cat);
              setMoveToSubCat(ni.subCat || "");
              setMoveToDate(date);
              setMoveMode("move");
              setCloneTargets([]);
              setMoveTarget({ niId: ni.id, fromCat: e.cat, fromSubCat: ni.subCat || "" });
            },
            title: "この記事を移動/複製",
            style: { position: "absolute", top: 3, right: 30, width: 22, height: 22,
              borderRadius: 5, background: "#fff", color: "#6b665c",
              border: "1px solid #d9d5cc", fontSize: 11, cursor: "pointer", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }
          }, "↪"),
          (function() {
            var clones = _findClones(ni.id);
            if (!clones.length) return null;
            var locsLabel = clones.map(function(l) { return l.cat + (l.subCat ? "/" + l.subCat : ""); }).join("\n");
            return React.createElement("div", {
              title: "クローン (編集連動):\n" + locsLabel,
              style: { position: "absolute", top: 3, right: 56, height: 22, padding: "0 6px",
                borderRadius: 5, background: "#EEF2FF", color: "#4F46E5",
                border: "1px solid #C7D2FE", boxSizing: "border-box",
                fontSize: 10, fontWeight: 700, zIndex: 2, display: "flex",
                alignItems: "center", justifyContent: "center", gap: 2, cursor: "help" }
            }, "\uD83D\uDD17", clones.length + 1);
          })(),
          React.createElement("button", {
            onClick: function() { return delNews(ni.id); },
            title: "削除",
            style: { position: "absolute", top: 3, right: 4, width: 22, height: 22,
              borderRadius: 5, background: "#fff", color: "#DC2626",
              border: "1px solid #EFBDBD", fontSize: 11, cursor: "pointer", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }
          }, "✕"),
          React.createElement("div", {
            onMouseDown: function(ev) {
              if (IS_TOUCH) return;
              if (ev.button != null && ev.button !== 0) return;
              onNewsDragStart(ni.id, ev);
            },
            style: { cursor: IS_TOUCH ? "default" : "grab" }
          },
          React.createElement(ImgGrid, {
            images: imgs,
            boxed: true,
            // 2026-08-03q 縦長・正方形はカード幅いっぱいの「正方形の枠」に収める（上端そろえ＝見出しと写真が必ず残る）。
            //   高さ固定(420px)だと縦に間延びしていたのを、幅に追従する縦横比に変更。行の高さは今までどおり揃う。
            //   切れるのは記事下部の本文で、そこは元々この幅では読めない。全体はクリックで拡大して見られる。
            // 横長（2列ぶんに広げた札）は幅が2倍あって潰れないので、従来どおり縦横比のまま出す。
            fillAspect: isTallNi(ni) ? _NEWS_BOX_R : 0,
            // 2026-08-03m 横長で列が分かれていたら左端のブロックだけを出す（無ければnull＝全体表示）。
            fillCrop: niCrop(ni),
            onImgLoad: function(el) { measureNiImg(String(ni.id), el); },
            maxHeight: IS_TOUCH ? 240 : 380,
            onRemove: function(i) {
              return updNews(ni.id, function(n) {
                return { images: (n.images || []).filter(function(_, j) { return j !== i; }) };
              });
            },
            onAnnotate: function(i) { if (dragJustHappened()) return; return setAnnotTarget({ nid: ni.id, idx: i }); },
            onEnlarge: function(i) {
              return setViewTarget({ imgs: imgs, idx: i, niIdx: bIdx,
                onUpdate: function(i2, ed) { updNews(ni.id, function(n) { var a = _toConsumableArray(n.images || []); a[i2] = ed; return { images: a }; }); }
              });
            },
            onUpdateImg: function(i, ed) { updNews(ni.id, function(n) { var a = _toConsumableArray(n.images || []); a[i] = ed; return { images: a }; }); }
          })),
          React.createElement("div", { style: { padding: "4px 6px" } },
            ni.fromMemo ? React.createElement("div", {
              style: { fontSize: 9, fontWeight: 700, color: "#92400E", background: "#FEF3C7",
                border: "1px solid #FDE68A", borderRadius: 4, padding: "1px 5px",
                display: "inline-block", marginBottom: 4 }
            }, "旧メモ欄から") : null,
            // 2026-08-03i 画像を持つ札に本文欄は出さない（1枚＝1記事で、画像そのものが記事なので書く場面が無い）。
            // 画像が無い札（旧メモ由来）と、すでに本文が入っている札にだけ出す＝移行したメモの中身が見えなくならない。
            (imgs.length === 0 || _hasText(ni.text)) ? React.createElement(MemoEditableField, {
              html: ni.text || "",
              onSave: function(h) { updNews(ni.id, { text: h }); },
              placeholder: "本文",
              autoEdit: false,
              guardOwner: "newsItemText_" + date + "_" + ni.id
            }) : null,
            (function() {
              if (!onJumpToStock || !allStocks || !allStocks.length) return null;
              var stockSet = {}, stockList = [];
              kStocks.forEach(function(s) { if (s && !stockSet[s]) { stockSet[s] = true; stockList.push(s); } });
              niTags.forEach(function(tg) {
                var s = _ntExtractStockFromTag(tg, allStocks);
                if (s && !stockSet[s]) { stockSet[s] = true; stockList.push(s); }
              });
              if (stockList.length === 0) return null;
              return React.createElement("div", {
                style: { display: "flex", flexWrap: "wrap", gap: 4, margin: "5px 0" }
              }, stockList.map(function(s) {
                return React.createElement("button", {
                  key: "j_" + s,
                  onClick: function(ev) { if (ev && ev.stopPropagation) ev.stopPropagation(); onJumpToStock(s); },
                  title: s + " の銘柄記録を見る",
                  style: { fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                    background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE",
                    cursor: "pointer", whiteSpace: "nowrap" }
                }, "→ " + s);
              }));
            })(),
            // 2026-08-03i 「タグ付け」と「記事を保存」は横並び（TagPickerのtrailingに保存ボタンを渡す）。
            React.createElement(TagPicker, _extends({
              cats: catTagPool.cats, tags: catTagPool.tags, sel: niTags,
              onToggle: function(tag) { return togNiTag(ni.id, tag); },
              onAdd: function(name, cat) { return onAddNiTag(ni.id, name, cat); }
            }, newsPool, {
              tagColors: custom.tagColors || {}, label: "材料タグ", hideAddRoot: true,
              addLabel: "🏷️ タグ付け",
              trailing: React.createElement("button", {
                onClick: function() { openKeepSheet(e); },
                title: kept ? "保存済み（自動削除されません）。押すと分類を変えられます" : "カテゴリ・サブ・銘柄を選んで保存（全部任意）",
                style: { flex: 1, minWidth: 0, padding: "6px 8px", fontSize: 12, fontWeight: 700,
                  background: kept ? "#F59E0B" : "#fff", color: kept ? "#fff" : "#666",
                  border: "1px solid " + (kept ? "#F59E0B" : "#ddd"), borderRadius: 7,
                  cursor: "pointer", minHeight: IS_TOUCH ? 38 : 30,
                  textAlign: "center", wordBreak: "break-word", lineHeight: 1.3 }
              },
                kept ? ("🔖 " + keepLabel + (kStocks.length ? " ・銘柄" + kStocks.length : ""))
                     : "🔖 記事を保存")
            })),
            // 2026-08-03g 「ニュース画像1枚＝記事1件」なので、画像を持つ札に貼り付け枠は出さない（2枚目を貼る場面が無い）。
            // 画像が無い札（旧メモ由来・自動削除で画像が消えた札）にだけ出し、受けるのも1枚だけ。
            imgs.length === 0 ? React.createElement(PasteZone, {
              onImage: function(img) { return updNews(ni.id, function(n) { return { images: [].concat(_toConsumableArray(n.images || []), [img]) }; }); },
              compact: true,
              single: true
            }) : null
          )
        );
      }),
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 },
        onDrop: function(e) { e.preventDefault(); setAddBtnDrag(false); addNewsWithFiles(e.dataTransfer.files); },
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
          ref: addBtnFileRef, type: "file", accept: "image/*", multiple: true, style: { display: "none" },
          onChange: function(e) { if (e.target.files && e.target.files.length) { addNewsWithFiles(e.target.files); e.target.value = ""; } }
        }),
        React.createElement("div", {
          style: { width: "100%", minHeight: 110, fontSize: 26, fontWeight: 300,
            background: addBtnDrag ? "#EEF2FF" : "#f5f4f0",
            border: addBtnDrag ? "2px dashed #6366F1" : "1.5px dashed #ccc",
            borderRadius: 12, cursor: "pointer", color: addBtnDrag ? "#6366F1" : "#999",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            transition: "border-color .15s, background .15s, color .15s" }
        }, "+",
          !IS_TOUCH ? React.createElement("textarea", {
            ref: addBtnPasteRef,
            title: "クリックでファイル選択 / 右クリック→貼り付けやCmd+Vで画像追加",
            onPaste: function(e) {
              e.preventDefault();
              // 2026-08-03f 貼り付けも複数枚まとめて（旧: 最初の1枚でbreakしていた）
              var it = e.clipboardData && e.clipboardData.items || [];
              var fs = [];
              for (var i = 0; i < it.length; i++) {
                if (it[i].type && it[i].type.indexOf("image/") === 0) {
                  var f = it[i].getAsFile();
                  if (f) fs.push(f);
                }
              }
              if (fs.length) addNewsWithFiles(fs);
              if (addBtnPasteRef.current) addBtnPasteRef.current.value = "";
            },
            onChange: function() { if (addBtnPasteRef.current) addBtnPasteRef.current.value = ""; },
            onKeyDown: function(e) {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (addBtnFileRef.current) addBtnFileRef.current.click();
              }
            },
            style: { position: "absolute", inset: 0, opacity: 0, resize: "none", border: "none",
              background: "transparent", width: "100%", height: "100%", cursor: "pointer", padding: 0 }
          }) : null
        )
      )
    ),
    boardItems.length === 0 ? React.createElement("div", {
      style: { fontSize: 12, color: "#aaa", marginTop: 10 }
    }, "まだニュースがありません。＋ から画像を貼り付けて追加できます。") : null
  ));
}

