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

  var makeRow = function(title, st, bg, brColor) {
    return React.createElement("div", {
      style: { background: bg, padding: 8, borderRadius: 6, marginBottom: 4, borderLeft: "3px solid " + brColor }
    },
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 4 } }, title),
      React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-around" } },
        StatCell("件数", st.total + "件"),
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
    makeRow("全体", allStats, "#fff", "#1a1a1a"),
    entered.length > 0 && makeRow("実エントリーあり", enteredStats, "#E8F5E9", "#2E7D32"),
    skipped.length > 0 && makeRow("見送り", skippedStats, "#f5f4f0", "#888")
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
  
  var _uSvSort = useState("desc"), _uSvSortA = _slicedToArray(_uSvSort, 2),
    svDateSort = _uSvSortA[0], setSvDateSort = _uSvSortA[1];
  var _uSvExp = useState(null), _uSvExpA = _slicedToArray(_uSvExp, 2),
    svDateExpand = _uSvExpA[0], setSvDateExpand = _uSvExpA[1];
  var _uSvRec = useState({}), _uSvRecA = _slicedToArray(_uSvRec, 2),
    svRecExpand = _uSvRecA[0], setSvRecExpand = _uSvRecA[1];
  var _uE17 = useState("entered"), 
    _uE18 = _slicedToArray(_uE17, 2),
    crossMode = _uE18[0], setCrossMode = _uE18[1];
  var _uCM = useState("plan"), _uCMA = _slicedToArray(_uCM, 2),
    crossMetric = _uCMA[0], setCrossMetric = _uCMA[1];

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
  var _uSigDA = useState(null), _uSigDAA = _slicedToArray(_uSigDA, 2),
    sigDateAlpha = _uSigDAA[0], setSigDateAlpha = _uSigDAA[1];
  var _uSigDC = useState(null), _uSigDCA = _slicedToArray(_uSigDC, 2),
    sigDateCut = _uSigDCA[0], setSigDateCut = _uSigDCA[1];
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
  var _uTExpA = useState("10"), _uTExpAA = _slicedToArray(_uTExpA, 2),
    tExpAlpha = _uTExpAA[0], setTExpAlpha = _uTExpAA[1];
  var _uTExpC = useState("10"), _uTExpCA = _slicedToArray(_uTExpC, 2),
    tExpCut = _uTExpCA[0], setTExpCut = _uTExpCA[1];
  var _uTStkF = useState(""), _uTStkFA = _slicedToArray(_uTStkF, 2),
    timeStockFil = _uTStkFA[0], setTimeStockFil = _uTStkFA[1];
  var _uCStkF = useState(""), _uCStkFA = _slicedToArray(_uCStkF, 2),
    calStockFil = _uCStkFA[0], setCalStockFil = _uCStkFA[1];
  var _uCSigF = useState(""), _uCSigFA = _slicedToArray(_uCSigF, 2),
    calSigFil = _uCSigFA[0], setCalSigFil = _uCSigFA[1];
  var _uCResF = useState(""), _uCResFA = _slicedToArray(_uCResF, 2),
    calResFil = _uCResFA[0], setCalResFil = _uCResFA[1];
  
  var _uSimAlpha = useState("10"), _uSimAlphaA = _slicedToArray(_uSimAlpha, 2),
    simAlphaStr = _uSimAlphaA[0], setSimAlphaStr = _uSimAlphaA[1];
  var _uSimCut = useState("10"), _uSimCutA = _slicedToArray(_uSimCut, 2),
    simCutStr = _uSimCutA[0], setSimCutStr = _uSimCutA[1];
  var _uDiffRA = useState("10"), _uDiffRAA = _slicedToArray(_uDiffRA, 2),
    diffResAlpha = _uDiffRAA[0], setDiffResAlpha = _uDiffRAA[1];
  var _uSimMode = useState("month"), _uSimModeA = _slicedToArray(_uSimMode, 2),
    simPeriodMode = _uSimModeA[0], setSimPeriodMode = _uSimModeA[1];
  var _uSimFrom = useState(""), _uSimFromA = _slicedToArray(_uSimFrom, 2),
    simFrom = _uSimFromA[0], setSimFrom = _uSimFromA[1];
  var _uSimTo = useState(""), _uSimToA = _slicedToArray(_uSimTo, 2),
    simTo = _uSimToA[0], setSimTo = _uSimToA[1];
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
    var sumSec = React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
      [["記録数", osCount + "件"], ["入力率", inputRate + "%"], ["平均", osAvg + "円"],
       ["中央値", osMedian + "円"], ["最大", osMax + "円"], ["最小", osMin + "円"]].map(function(kv) {
        return React.createElement("div", { key: kv[0],
          style: { background: "#f5f4f0", border: "1px solid #e0ddd6", borderRadius: 6,
            padding: "6px 10px", minWidth: 62, textAlign: "center", flexShrink: 0 } },
          React.createElement("div", { style: { fontSize: 9, color: "#888", fontWeight: 600 } }, kv[0]),
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#333", marginTop: 2 } }, kv[1])
        );
      })
    );
    
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
    var _dra = (diffResAlpha !== "" && !isNaN(Number(diffResAlpha))) ? Number(diffResAlpha) : 10;
    var _diffResMap = {};
    osRecs.forEach(function(r) {
      var s = r.signal; var d = s.difficulty || "(未設定)";
      if (!_diffResMap[d]) _diffResMap[d] = { ok: 0, draw: 0, ng: 0, miss: 0, cnt: 0, plan: 0, hold: 0, holdCnt: 0 };
      var m = _diffResMap[d]; var _cl = _elAlphaInfo(r, data).cutLine;
      var _res = _elDynResult(s, _dra, _cl);
      m.cnt++;
      if (_res === "ok") m.ok++; else if (_res === "draw") m.draw++; else if (_res === "ng") m.ng++; else if (_res === "miss") m.miss++;
      var _pp = _elDynPlanned(s, _dra, _cl); if (_pp != null) m.plan += _pp;
      var _hp = _elDynHold(s, _dra, _cl); if (_hp != null) { m.hold += _hp; m.holdCnt++; }
    });
    var _diffResKeys = Object.keys(_diffResMap).sort(function(a, b) { var ra = _diffRank[a] != null ? _diffRank[a] : 98, rb = _diffRank[b] != null ? _diffRank[b] : 98; return ra - rb; });
    var _drTh = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "2px 5px", fontWeight: 700, fontSize: 10, color: "#9A3412", borderBottom: "2px solid #FB923C", textAlign: "center", whiteSpace: "nowrap" }, ex || {}) }, t); };
    var _drTd = function(c, col, ex) { return React.createElement("td", { style: Object.assign({ padding: "2px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", color: col || "#333", fontWeight: 700, fontVariantNumeric: "tabular-nums" }, ex || {}) }, c); };
    var _drPnlFmt = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    var _drPnlCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _drStepBtn = function(lbl, fn) { return React.createElement("button", { onClick: fn, style: { width: 24, height: 24, fontSize: 13, border: "1px solid #ccc", background: "#f5f4f0", borderRadius: 4, cursor: "pointer", color: "#555", lineHeight: 1 } }, lbl); };
    var resSec = React.createElement("div", null,
      _secH("🎯 E難易度別 結果（α値で再判定）"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 6, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 600 } }, "α値"),
        _drStepBtn("−", function() { setDiffResAlpha(function(v) { return String(Math.max(0, (Number(v) || 0) - 1)); }); }),
        React.createElement("input", { type: "number", inputMode: "numeric", min: "0", max: "30", step: "1", value: diffResAlpha, onChange: function(e) { var v = e.target.value; if (v === "") { setDiffResAlpha(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 30) n = 30; if (n < 0) n = 0; setDiffResAlpha(String(n)); }, style: { width: 50, padding: "3px 6px", fontSize: 12, border: "1px solid #ccc", borderRadius: 4, textAlign: "right", fontWeight: 700, boxSizing: "border-box" } }),
        _drStepBtn("＋", function() { setDiffResAlpha(function(v) { return String(Math.min(30, (Number(v) || 0) + 1)); }); }),
        React.createElement("span", { style: { fontSize: 10, color: "#888" } }, "円で全件の結果(○△×ー)を再判定")
      ),
      _diffResKeys.length === 0
        ? React.createElement("div", { style: { fontSize: 10, color: "#aaa", padding: "2px 0" } }, "難易度の記録がありません")
        : React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
              React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
                _drTh("難易度", { textAlign: "left" }), _drTh("件"),
                _drTh(React.createElement("span", { style: { color: "#1E8449" } }, "○")),
                _drTh(React.createElement("span", { style: { color: "#6B7280" } }, "△")),
                _drTh(React.createElement("span", { style: { color: "#C0392B" } }, "×")),
                _drTh(React.createElement("span", { style: { color: "#B45309" } }, "ー")),
                _drTh("勝率"), _drTh("想定利益"), _drTh("H利益")
              )),
              React.createElement("tbody", null, _diffResKeys.map(function(k) {
                var m = _diffResMap[k]; var _wd = m.ok + m.ng; var _wp = _wd > 0 ? Math.round(m.ok / _wd * 100) : null;
                return React.createElement("tr", { key: k },
                  React.createElement("td", { style: { padding: "2px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, k === "(未設定)" ? "(未設定)" : "難易度" + k),
                  _drTd(m.cnt, "#333", { fontWeight: 600 }),
                  _drTd(m.ok || "—", m.ok ? "#1E8449" : "#ccc"),
                  _drTd(m.draw || "—", m.draw ? "#6B7280" : "#ccc"),
                  _drTd(m.ng || "—", m.ng ? "#C0392B" : "#ccc"),
                  _drTd(m.miss || "—", m.miss ? "#B45309" : "#ccc"),
                  _drTd(_wp != null ? _wp + "%" : "—", _wp != null ? (_wp >= 50 ? "#C0392B" : "#1E8449") : "#ccc"),
                  _drTd(_drPnlFmt(m.plan), _drPnlCol(m.plan), { fontWeight: 600 }),
                  _drTd(m.holdCnt > 0 ? _drPnlFmt(m.hold) : "—", m.holdCnt > 0 ? _drPnlCol(m.hold) : "#ccc", { fontWeight: 600 })
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
    var alphaResSec = React.createElement("div", null,
      _secH("💰 α値別 想定利益（α値ごとに全件を再計算）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "各α値に固定していた場合の想定利益合計（確定値ベース・100株換算）。損切りラインは各銘柄日の設定値（既定10円）。★＝最も利益が大きいα値。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#FFF7ED" } },
              _aTh2("α値", { textAlign: "left" }),
              _aTh2("想定利益合計"),
              _aTh2("1件平均"),
              _aTh2("件数"),
              _aTh2("未確定")
            )
          ),
          React.createElement("tbody", null,
            alphaRows.map(function(x) {
              var _best = x.cntP > 0 && x.sumP === _bestProfit && _bestProfit > -Infinity;
              return React.createElement("tr", { key: x.a, style: { background: _best ? "#FEF3C7" : "transparent" } },
                React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, x.a + "円", _best ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 4 } }, "★最高") : null),
                React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: _best ? 800 : 600, color: x.cntP > 0 ? _apCol(x.sumP) : "#ccc", fontVariantNumeric: "tabular-nums" } }, x.cntP > 0 ? _apFmt(x.sumP) : "—"),
                _aTd2(x.avgP != null ? _apFmt(x.avgP) : "—", x.avgP != null ? _apCol(x.avgP) : "#ccc"),
                _aTd2(x.cntP > 0 ? x.cntP : "—", x.cntP > 0 ? "#333" : "#ccc"),
                _aTd2(x.unk > 0 ? x.unk : "—", "#bbb")
              );
            })
          )
        )
      )
    );

    var holdAlphaRows = [];
    for (var _avH2 = 0; _avH2 <= 30; _avH2++) {
      var _sumH2 = 0, _cntH2 = 0;
      osRecs.forEach(function(r) { var _hp = _elDynHold(r.signal, _avH2, _cutLineOf(r)); if (_hp != null) { _sumH2 += _hp; _cntH2++; } });
      holdAlphaRows.push({ a: _avH2, sumH: _sumH2, cntH: _cntH2, avgH: _cntH2 > 0 ? Math.round(_sumH2 / _cntH2) : null });
    }
    var _bestHoldA = Math.max.apply(null, holdAlphaRows.map(function(x){ return x.cntH > 0 ? x.sumH : -Infinity; }));
    var holdAlphaSec = React.createElement("div", null,
      _secH("💹 α値別 想定 vs ホールド利益（α値ごとに全件を再計算）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "各α値で全件を「利確（想定）」と「ホールド」した場合の利益合計（100株換算）。差＝ホールド−想定（赤＝ホールド有利）。★＝ホールド利益が最大のα値。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#FFF7ED" } },
              _aTh2("α値", { textAlign: "left" }), _aTh2("想定利益"), _aTh2("ホールド利益"), _aTh2("差(H−想定)"), _aTh2("件数")
            )
          ),
          React.createElement("tbody", null,
            holdAlphaRows.map(function(x) {
              var _p = alphaRows[x.a] ? alphaRows[x.a].sumP : 0;
              var _pCnt = alphaRows[x.a] ? alphaRows[x.a].cntP : 0;
              var _diff = x.sumH - _p;
              var _best = x.cntH > 0 && x.sumH === _bestHoldA && _bestHoldA > -Infinity;
              return React.createElement("tr", { key: x.a, style: { background: _best ? "#FEF3C7" : "transparent" } },
                React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, x.a + "円", _best ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 4 } }, "★最高") : null),
                _aTd2(_pCnt > 0 ? _apFmt(_p) : "—", _pCnt > 0 ? _apCol(_p) : "#ccc"),
                React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: _best ? 800 : 600, color: x.cntH > 0 ? _apCol(x.sumH) : "#ccc", fontVariantNumeric: "tabular-nums" } }, x.cntH > 0 ? _apFmt(x.sumH) : "—"),
                _aTd2((x.cntH > 0 && _pCnt > 0) ? _apFmt(_diff) : "—", (x.cntH > 0 && _pCnt > 0) ? _apCol(_diff) : "#ccc"),
                _aTd2(x.cntH > 0 ? x.cntH : "—", x.cntH > 0 ? "#333" : "#ccc")
              );
            })
          )
        )
      )
    );

    var _cmpP = { sum: 0, cnt: 0, win: 0, ws: 0, ls: 0, lc: 0 }, _cmpH = { sum: 0, cnt: 0, win: 0, ws: 0, ls: 0, lc: 0 };
    var _cmpAdd = function(o, v) { if (v == null) return; o.sum += v; o.cnt++; if (v > 0) { o.win++; o.ws += v; } else if (v < 0) { o.ls += v; o.lc++; } };
    osRecs.forEach(function(r) {
      var s = r.signal; var _ai = _elAlphaInfo(r, data);
      _cmpAdd(_cmpP, _elDynPlanned(s, _ai.alpha, _ai.cutLine));
      _cmpAdd(_cmpH, _elDynHold(s, _ai.alpha, _ai.cutLine));
    });
    var _cmpMax = Math.max(Math.abs(_cmpP.sum), Math.abs(_cmpH.sum), 1);
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
      _secH("⚖️ 利確（想定） vs ホールド 総合比較"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "各銘柄の設定α値で全件を再計算（100株換算）。バー＝利益合計。期待値＝1件平均。"),
      _cmpBar("利確（想定）", _cmpP, "#0EA5E9"),
      _cmpBar("ホールド", _cmpH, "#FB923C"),
      React.createElement("div", { style: { fontSize: 11, fontWeight: 700, marginTop: 4, color: _cmpH.sum > _cmpP.sum ? "#C0392B" : _cmpH.sum < _cmpP.sum ? "#1E8449" : "#888" } },
        _cmpH.sum > _cmpP.sum ? "→ ホールドの方が +" + (_cmpH.sum - _cmpP.sum).toLocaleString() + "円 有利" : _cmpH.sum < _cmpP.sum ? "→ 利確の方が +" + (_cmpP.sum - _cmpH.sum).toLocaleString() + "円 有利" : "→ 拮抗")
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
    var _flowMin = 0, _flowMax = 0;
    _flowPts.forEach(function(p) { p.forEach(function(y) { if (y != null) { if (y < _flowMin) _flowMin = y; if (y > _flowMax) _flowMax = y; } }); });
    _flowMin = Math.floor(_flowMin / 5) * 5; _flowMax = Math.ceil(_flowMax / 5) * 5; if (_flowMax === _flowMin) _flowMax = _flowMin + 5;
    var _fTicks = []; for (var _ft = _flowMin; _ft <= _flowMax; _ft += 5) _fTicks.push(_ft);
    var _flowAvg = [0,1,2,3].map(function(i) { var vs = _flowPts.map(function(p){ return p[i]; }).filter(function(y){ return y != null; }); return vs.length ? Math.round(vs.reduce(function(a,b){ return a+b; }, 0) / vs.length) : null; });
    var _fW = 340, _fH = 180, _fPadX = 40, _fPadTop = 14, _fPadBot = 28;
    var _fXOf = function(i) { return _fPadX + i * (_fW - _fPadX - 12) / 3; };
    var _fRange = (_flowMax - _flowMin) || 1;
    var _fYOf = function(y) { return _fPadTop + (_flowMax - y) / _fRange * (_fH - _fPadTop - _fPadBot); };
    var _fPath = function(p) { var d = "", first = true; for (var i = 0; i < 4; i++) { if (p[i] == null) continue; d += (first ? "M" : "L") + _fXOf(i).toFixed(1) + " " + _fYOf(p[i]).toFixed(1) + " "; first = false; } return d; };
    var priceFlowSec = _flowPts.length === 0 ? null : React.createElement("div", null,
      _secH("📉 価格フロー（OS値→確定値→H高値→H確定値）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "水準線(0)基準・上=赤側/下=緑側。薄線＝各記録(" + _flowPts.length + "件)、太線＝平均。※OS値の上下は確定値と同じ側と仮定。"),
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
          ["OS値", "確定値", "H高値", "H確定値"].map(function(lb, i) { return React.createElement("text", { key: "x" + i, x: _fXOf(i), y: _fH - 9, fontSize: 9, fill: "#555", textAnchor: "middle", fontWeight: 600 }, lb); })
        )
      )
    );

    var _osHoldMap = {};
    osRecs.forEach(function(r) { var s = r.signal; var _ai = _elAlphaInfo(r, data); var _hp = _elDynHold(s, _ai.alpha, _ai.cutLine); if (_hp == null) return; var k = _osBucketKey(Number(s.osVal)); if (!_osHoldMap[k]) _osHoldMap[k] = { sum: 0, cnt: 0, win: 0 }; _osHoldMap[k].sum += _hp; _osHoldMap[k].cnt++; if (_hp > 0) _osHoldMap[k].win++; });
    var _osHoldKeys = Object.keys(_osHoldMap).map(Number).sort(function(a, b) { return a - b; });
    var osHoldProfitSec = _osHoldKeys.length === 0 ? null : React.createElement("div", null,
      _secH("📊 OS値別 ホールド結果利益（設定α）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "各銘柄の設定α値でホールドした場合の、OS値帯ごとの結果利益（100株換算）。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } }, _aTh2("OS値帯", { textAlign: "left" }), _aTh2("ホールド利益合計"), _aTh2("1件平均"), _aTh2("勝率"), _aTh2("件数"))),
          React.createElement("tbody", null, _osHoldKeys.map(function(k) {
            var m = _osHoldMap[k]; var _avg = m.cnt > 0 ? Math.round(m.sum / m.cnt) : null; var _wp = m.cnt > 0 ? Math.round(m.win / m.cnt * 100) : null;
            return React.createElement("tr", { key: k },
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, _osBucketLabel(k)),
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: 700, color: _apCol(m.sum), fontVariantNumeric: "tabular-nums" } }, _apFmt(m.sum)),
              _aTd2(_avg != null ? _apFmt(_avg) : "—", _avg != null ? _apCol(_avg) : "#ccc"),
              _aTd2(_wp != null ? _wp + "%" : "—", _wp != null && _wp >= 50 ? "#C0392B" : "#1E8449"),
              _aTd2(m.cnt, "#333"));
          }))
        )
      )
    );

    var _reachTot = 0, _reach = 0, _reachWin = 0, _reachSum = 0, _reachCnt = 0;
    osRecs.forEach(function(r) { var s = r.signal; _reachTot++; var _ai = _elAlphaInfo(r, data); if (s.holdHighSign === "-" && s.holdHighVal != null && Number(s.holdHighVal) >= _ai.alpha) { _reach++; var _hp = _elDynHold(s, _ai.alpha, _ai.cutLine); if (_hp != null) { _reachSum += _hp; _reachCnt++; if (_hp > 0) _reachWin++; } } });
    var _reachPct = _reachTot > 0 ? Math.round(_reach / _reachTot * 100) : null;
    var _reachWp = _reachCnt > 0 ? Math.round(_reachWin / _reachCnt * 100) : null;
    var _reachAvg = _reachCnt > 0 ? Math.round(_reachSum / _reachCnt) : null;
    var reachSec = React.createElement("div", null,
      _secH("🎯 ホールド到達率（H高値≧α）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "H高値が設定α値以上＝ホールドでエントリー成立した割合と、その成績。"),
      React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
        React.createElement("div", { style: { flex: "1 1 90px", padding: "6px 8px", background: "#f9f8f5", borderRadius: 6, border: "1px solid #e8e5de" } },
          React.createElement("div", { style: { fontSize: 9, color: "#888" } }, "到達率"),
          React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#9A3412" } }, _reachPct != null ? _reachPct + "%" : "—"),
          React.createElement("div", { style: { fontSize: 9, color: "#aaa" } }, _reach + "/" + _reachTot + "件")),
        React.createElement("div", { style: { flex: "1 1 90px", padding: "6px 8px", background: "#f9f8f5", borderRadius: 6, border: "1px solid #e8e5de" } },
          React.createElement("div", { style: { fontSize: 9, color: "#888" } }, "到達時の勝率"),
          React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: _reachWp != null && _reachWp >= 50 ? "#C0392B" : "#1E8449" } }, _reachWp != null ? _reachWp + "%" : "—")),
        React.createElement("div", { style: { flex: "1 1 90px", padding: "6px 8px", background: "#f9f8f5", borderRadius: 6, border: "1px solid #e8e5de" } },
          React.createElement("div", { style: { fontSize: 9, color: "#888" } }, "到達時の平均利益"),
          React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: _reachAvg != null ? _apCol(_reachAvg) : "#ccc" } }, _reachAvg != null ? _apFmt(_reachAvg) : "—"))
      )
    );

    var _cutRows = [];
    for (var _cl = 5; _cl <= 20; _cl++) {
      var _csum = 0, _ccnt = 0;
      osRecs.forEach(function(r) { var s = r.signal; var _ai = _elAlphaInfo(r, data); var _hp = _elDynHold(s, _ai.alpha, _cl); if (_hp != null) { _csum += _hp; _ccnt++; } });
      _cutRows.push({ cl: _cl, sum: _csum, cnt: _ccnt, avg: _ccnt > 0 ? Math.round(_csum / _ccnt) : null });
    }
    var _bestCut = Math.max.apply(null, _cutRows.map(function(x) { return x.cnt > 0 ? x.sum : -Infinity; }));
    var cutHoldSec = React.createElement("div", null,
      _secH("📏 損切りライン別 ホールド利益（設定α）"),
      React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "損切りラインを5〜20円に変えた場合のホールド結果利益（100株換算）。★＝最大。"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } }, _aTh2("損切り", { textAlign: "left" }), _aTh2("ホールド利益合計"), _aTh2("1件平均"), _aTh2("件数"))),
          React.createElement("tbody", null, _cutRows.map(function(x) {
            var _best = x.cnt > 0 && x.sum === _bestCut && _bestCut > -Infinity;
            return React.createElement("tr", { key: x.cl, style: { background: _best ? "#FEF3C7" : "transparent" } },
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, fontWeight: 700, color: "#9A3412", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" } }, x.cl + "円", _best ? React.createElement("span", { style: { fontSize: 9, color: "#B45309", marginLeft: 4 } }, "★最高") : null),
              React.createElement("td", { style: { padding: "1px 5px", fontSize: 11, textAlign: "center", borderBottom: "1px solid #f0ede6", fontWeight: _best ? 800 : 600, color: x.cnt > 0 ? _apCol(x.sum) : "#ccc", fontVariantNumeric: "tabular-nums" } }, x.cnt > 0 ? _apFmt(x.sum) : "—"),
              _aTd2(x.avg != null ? _apFmt(x.avg) : "—", x.avg != null ? _apCol(x.avg) : "#ccc"),
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
        })
      );
    }
    var svgSec = (function() {
      var pts = osRecs.filter(function(r) { return !!r.date; })
        .map(function(r) { return { date: r.date, val: Number(r.signal.osVal) }; })
        .sort(function(a, b) { return a.date.localeCompare(b.date); });
      if (!pts.length) return null;
      var uDates = []; var dMap = {};
      pts.forEach(function(p) { if (dMap[p.date] == null) { dMap[p.date] = uDates.length; uDates.push(p.date); } });
      var nd = uDates.length;
      var dGrp = {};
      pts.forEach(function(p) { if (!dGrp[p.date]) dGrp[p.date] = []; dGrp[p.date].push(p); });
      var SVW = Math.max(560, nd * 24 + 90);
      var SVH = 360, PL = 48, PR = 30, PT = 24, PB = 46;
      var cW = SVW - PL - PR; var cH = SVH - PT - PB;
      var mxV = Math.max.apply(null, pts.map(function(p) { return p.val; }));
      var yTop = (mxV * 1.12 + 1) || 1;
      var maxJit = 8;
      var tX = function(di) { return PL + (nd > 1 ? di / (nd - 1) : 0.5) * cW; };
      var tY = function(v) { return PT + (1 - v / yTop) * cH; };
      var avgY = tY(osAvg);
      var medY = tY(osMedian);
      var yStep = mxV <= 20 ? 5 : mxV <= 50 ? 10 : mxV <= 100 ? 20 : mxV <= 200 ? 50 : 100;
      var yTks = []; for (var yv = 0; yv <= mxV; yv += yStep) { yTks.push(yv); }
      var lStep = Math.max(1, Math.ceil(nd / 16));
      var _ptCol = function(v) {
        var t = mxV > 0 ? Math.min(v / mxV, 1) : 0;
        var r = Math.round(253 - t * (253 - 154));
        var g = Math.round(186 - t * (186 - 52));
        var b = Math.round(116 - t * (116 - 18));
        return "rgb(" + r + "," + g + "," + b + ")";
      };
      return React.createElement("div", null,
        _secH("📈 時系列散布図（日付 × OS値）"),
        React.createElement("div", { style: { fontSize: 10, color: "#888", display: "flex", gap: 12, marginBottom: 6, flexWrap: "wrap", alignItems: "center" } },
          React.createElement("span", null, "点 = 各OS値（色の濃さ＝OS値の大きさ）"),
          React.createElement("span", { style: { color: "#FB923C" } }, "— 平均 " + osAvg + "円"),
          React.createElement("span", { style: { color: "#3B82F6" } }, "··· 中央値 " + osMedian + "円"),
          React.createElement("span", { style: { marginLeft: "auto", color: "#aaa" } }, osCount + "件 / " + nd + "日")
        ),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("svg", { width: SVW, height: SVH, style: { display: "block" } },
            yTks.map(function(yv) {
              return React.createElement("line", { key: "yg" + yv, x1: PL, y1: tY(yv), x2: PL + cW, y2: tY(yv), stroke: "#f0ede6", strokeWidth: 1 });
            }),
            React.createElement("line", { key: "med", x1: PL, y1: medY, x2: PL + cW, y2: medY, stroke: "#3B82F6", strokeWidth: 1.5, strokeDasharray: "2,3" }),
            React.createElement("line", { key: "avg", x1: PL, y1: avgY, x2: PL + cW, y2: avgY, stroke: "#FB923C", strokeWidth: 1.5, strokeDasharray: "6,3" }),
            React.createElement("line", { key: "xax", x1: PL, y1: PT + cH, x2: PL + cW, y2: PT + cH, stroke: "#ccc", strokeWidth: 1 }),
            React.createElement("line", { key: "yax", x1: PL, y1: PT, x2: PL, y2: PT + cH, stroke: "#ccc", strokeWidth: 1 }),
            React.createElement("g", { key: "pts" },
              pts.map(function(p, i) {
                var grp = dGrp[p.date]; var gi = grp.indexOf(p);
                var _jw = Math.min(maxJit, (cW / Math.max(nd, 1)) / Math.max(grp.length, 1));
                var jit = grp.length > 1 ? (gi - (grp.length - 1) / 2) * _jw : 0;
                var cx = tX(dMap[p.date]) + jit; var cy = tY(p.val);
                if (cx < PL + 3) cx = PL + 3; if (cx > PL + cW - 3) cx = PL + cW - 3;
                return React.createElement("circle", { key: i, cx: cx, cy: cy, r: 5, fill: _ptCol(p.val), fillOpacity: 0.8, stroke: "#fff", strokeWidth: 0.8 },
                  React.createElement("title", null, p.date + "  " + p.val + "円"));
              })
            ),
            React.createElement("g", { key: "xl" },
              uDates.filter(function(d, i) { return i % lStep === 0; }).map(function(d) {
                return React.createElement("text", { key: d, x: tX(dMap[d]), y: PT + cH + 18, fontSize: 9, textAnchor: "middle", fill: "#999" }, d.slice(5));
              })
            ),
            React.createElement("g", { key: "yl" },
              yTks.map(function(yv) {
                return React.createElement("text", { key: yv, x: PL - 6, y: tY(yv) + 4, fontSize: 9, textAnchor: "end", fill: "#999" }, yv);
              })
            ),
            React.createElement("text", { key: "yaxlabel", x: 13, y: PT + cH / 2, fontSize: 9, fill: "#999", textAnchor: "middle", transform: "rotate(-90 13 " + (PT + cH / 2) + ")" }, "OS値(円)"),
            React.createElement("text", { key: "avgtxt", x: PL + cW + 3, y: avgY + 3, fontSize: 8, fill: "#FB923C" }, "平均"),
            React.createElement("text", { key: "medtxt", x: PL + cW + 3, y: medY + 3, fontSize: 8, fill: "#3B82F6" }, "中央")
          )
        )
      );
    })();
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
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "ホールド損益−想定損益。100株換算 / 赤＝ホールドで良化・緑＝悪化（転化＝想定と損益の符号が逆転）"),
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
        React.createElement("div", { style: { fontSize: 10, color: "#666", marginBottom: 6 } }, "OS値帯ごとの平均。確定値・H高値・H確定値は水準線比（↑上=赤/↓下=緑、カッコ内は件数）、損益変化はホールド損益−想定損益(100株)"),
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
    return React.createElement("div", { style: { marginTop: 8 } },
      sumSec,
      cmpKpiSec,
      resSec,
      reachSec,
      holdSec,
      priceFlowSec,
      React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" } },
        React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, osHoldTrendSec),
        React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, osHoldProfitSec)
      ),
      React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
        React.createElement("div", { style: { flex: "1 1 260px", minWidth: 0 } }, histSec, hrSec),
        React.createElement("div", { style: { flex: "1 1 260px", minWidth: 0 } }, sigSec)
      ),
      React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" } },
        React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, holdAlphaSec),
        React.createElement("div", { style: { flex: "1 1 280px", minWidth: 0 } }, cutHoldSec)
      ),
      devSec,
      svgSec
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
              if (_abP === 0 && _allP === 0) return React.createElement("span", { style: { color: "#ccc" } }, "想定 —");
              return React.createElement("span", { style: { whiteSpace: "nowrap" } },
                "想定 ",
                React.createElement("span", { style: { fontWeight: 600, color: _colFS(_abP) } }, _abP !== 0 ? _fmtFS(_abP) : "—"),
                _abP !== _allP ? React.createElement("span", { style: { color: _colFS(_allP), fontSize: 10 } }, "(" + (_allP !== 0 ? _fmtFS(_allP) : "—") + ")") : null
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
        
        var _simA = simAlphaStr !== "" && !isNaN(Number(simAlphaStr)) ? Number(simAlphaStr) : null;
        
        var _simWeekRange = (function() {
          var _td = new Date(); var _dow = _td.getDay();
          var _diffToMon = _dow === 0 ? -6 : 1 - _dow;
          var _mon = new Date(_td); _mon.setDate(_td.getDate() + _diffToMon);
          var _fri = new Date(_mon); _fri.setDate(_mon.getDate() + 4);
          var _p = function(n) { return n < 10 ? "0" + n : "" + n; };
          var _mStr = _mon.getFullYear() + "-" + _p(_mon.getMonth()+1) + "-" + _p(_mon.getDate());
          var _fStr = _fri.getFullYear() + "-" + _p(_fri.getMonth()+1) + "-" + _p(_fri.getDate());
          return { from: _mStr, to: _fStr, label: _mStr.slice(5).replace("-","/") + "〜" + _fStr.slice(5).replace("-","/") };
        })();
        
        var _tSimCalc = function(recs, simAlpha) {
          if (simAlpha == null || !recs || !recs.length) return null;
          var _sOk = 0, _sNg = 0, _sMiss = 0, _sPlan = null, _sHold = null;
          var _sPlanAB = null, _sHoldCap = null, _sHoldCapAB = null;
          recs.forEach(function(r) {
            var s = r.signal;
            var _cRs = (data.charts || {})[r.stock + "_" + r.date];
            var _cutLs = _cRs && _cRs.cutLine != null ? _cRs.cutLine : 10;
            var _isAB = (s.difficulty === "A" || s.difficulty === "B");
            if (s.osVal != null && Number(s.osVal) >= 0) {
              var _dv = Number(s.osVal) - simAlpha;
              var _dynR = null;
              if (_dv < 0) _dynR = "miss";
              else if (_dv >= _cutLs) _dynR = "ng";
              else if (s.osConfVal != null && s.osConfVal !== "") {
                var _cf0 = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
                _dynR = _cf0 < simAlpha ? "ok" : _cf0 === simAlpha ? "draw" : "ng";
              }
              if (_dynR === "ok") _sOk++;
              else if (_dynR === "ng") _sNg++;
              else if (_dynR === "miss") _sMiss++;
            }
            var _dpVal = null;
            if (s.osVal != null) {
              var _cf1 = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
              var _df = Number(s.osVal) - simAlpha;
              var _pStop = _df >= _cutLs;
              var _dp = _df < 0 ? 0 : _pStop ? -Math.round(_df * 100) : (_cf1 != null ? Math.round((simAlpha - _cf1) * 100) : null);
              if (_dp != null) {
                _dpVal = _dp;
                _sPlan = (_sPlan || 0) + _dp;
                if (_isAB) _sPlanAB = (_sPlanAB || 0) + _dp;
              }
            }
            var _hp = _elDynHold(s, simAlpha, _cutLs);
            if (_hp != null) {
              // 結果損益: 想定が損切りの行はホールドでも同水準で損切りされる前提で想定額にキャップ。
              var _planStopH = _elPlanIsStop(s, simAlpha, _cutLs);
              var _hCapV = (_planStopH && _dpVal != null) ? _dpVal : _hp;
              _sHold = (_sHold || 0) + _hp;
              _sHoldCap = (_sHoldCap || 0) + _hCapV;
              if (_isAB) _sHoldCapAB = (_sHoldCapAB || 0) + _hCapV;
            }
          });
          var _sTot = _sOk + _sNg;
          return { ok: _sOk, ng: _sNg, miss: _sMiss, winPct: _sTot > 0 ? Math.round(_sOk / _sTot * 100) : null,
            plan: _sPlan, planAB: _sPlanAB, hold: _sHold, holdCap: _sHoldCap, holdCapAB: _sHoldCapAB };
        };
        var _tCapNote = function(hasStop, capSum) {
          return (hasStop && capSum != null) ? _elCapNoteAmt(capSum) : null;
        };
        // B以上(A・B難易度)を主表示、全体(C含む)をカッコで併記。
        var _tAB2 = function(abV, allV) {
          var _f = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
          var _c = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
          if (abV == null && allV == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
          return React.createElement("span", { style: { whiteSpace: "nowrap" } },
            React.createElement("span", { style: { fontWeight: 700, color: _c(abV) } }, _f(abV)),
            (abV !== allV) ? React.createElement("span", { style: { fontSize: 10, color: _c(allV), marginLeft: 1 } }, "（" + _f(allV) + "）") : null
          );
        };
        var _tRow = function(date, st, gradeReal, gradePlan, gradeMax, tags, recs) {
          var isHoliday = !!_tblHolidaySet[date];
          var hasRecs = !isHoliday && st.total > 0;
          var isExp = hasRecs && calTblExpand === date;
          var _simSt = hasRecs ? _tSimCalc(recs, _simA) : null;
          var _simActive = _simSt != null;
          var bg = isExp ? "#FFF7ED" : (_simActive && hasRecs ? "#FFFDF5" : "transparent");
          var bb = "1px solid #e0ddd6", br = "1px solid #e0ddd6";
          var dateRef = date;
          var _dash = React.createElement("span", { style: { color: "#ccc" } }, "ー");
          var _dOk = _simActive ? _simSt.ok : st.ok;
          var _dNg = _simActive ? _simSt.ng : st.ng;
          var _dMiss = _simActive ? _simSt.miss : st.miss;
          var _dWinPct = _simActive ? _simSt.winPct : st.winPct;
          var _dPlan = _simActive ? _simSt.plan : null;
          var _dHold = _simActive ? _simSt.hold : st.sumHold;
          var _simFmt = function(v) { return v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円"); };
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
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br, color: _simActive ? "#C0392B" : "inherit" } }, isHoliday ? _dash : (_dOk || "0")),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: br, color: _simActive ? "#1E8449" : "inherit" } }, isHoliday ? _dash : (_dNg || "0")),
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
              isHoliday ? _dash : (function() {
                var _cfRt = recs.filter(function(r) { return r.signal.osConfVal != null && r.signal.osConfVal !== ""; });
                if (!_cfRt.length) return React.createElement("span", { style: { color: "#ddd" } }, "\u2014");
                var _cfAt = Math.round(_cfRt.reduce(function(a, r) { var s = r.signal; return a + (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)); }, 0) / _cfRt.length * 10) / 10;
                return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, (_cfAt > 0 ? "+" : "") + _cfAt + "\u5186");
              })()
            ),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : _tSlash(st.sumPnl, st.expected, gradeReal)),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : (_simActive ? _tAB2(_simSt.planAB, _simSt.plan) : _tABAll(recs, st.sumPlanned, st.expectedPlanned, gradePlan, "sumPlanned", "expectedPlanned"))),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
              isHoliday ? _dash : (_simActive ? _tAB2(_simSt.holdCapAB, _simSt.holdCap) : (function() { var _h = st.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })())),
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
          var _ovA = (tExpAlpha !== "" && !isNaN(Number(tExpAlpha))) ? Number(tExpAlpha) : 10;
          var _ovC = (tExpCut !== "" && !isNaN(Number(tExpCut))) ? Number(tExpCut) : 10;
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
          var _totPlanAB = null;
          var _totPlanABCnt = 0;
          recs.forEach(function(r) {
            var rKey = r.stock + "_" + (r.signal.id || r.signal.time || "");
            var rExp = !!calTblRecExp[rKey];
            var s = r.signal, item = r.item;
            var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
            var _per100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
            var realPnl = (item && item.pnl != null) ? Number(item.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
            var planPnlN = _elDynPlanned(s, _ovA, _ovC);
            var holdPnl = _elDynHold(s, _ovA, _ovC);
            var _dynRes = _elDynResult(s, _ovA, _ovC);
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
              _totHoldPlanCap = (_totHoldPlanCap || 0) + ((_pStopH && planPnlN != null) ? planPnlN : holdPnl);
              if (_pStopH && planPnlN != null && holdPnl !== planPnlN) _totHoldPlanStopDiff = true; }
            var _isABt = (s.difficulty === "A" || s.difficulty === "B");
            if (planPnlN != null && _isABt) { _totPlanAB = (_totPlanAB || 0) + planPnlN; _totPlanABCnt++; }
            if (holdPnl != null && _isABt) {
              var _pStopHab = _elPlanIsStop(s, _ovA, _ovC);
              _totHoldAB = (_totHoldAB || 0) + ((_pStopHab && planPnlN != null) ? planPnlN : holdPnl); _totHoldABCnt++; }
            var entLabel = entered
              ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "実エントリー")
              : React.createElement("span", { style: { color: "#888" } }, "見送り");
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
                    ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } }, _sigParts.map(function(_t, _i) { return React.createElement("div", { key: _i, style: { whiteSpace: "normal", wordBreak: "break-word" } }, _t); }))
                    : "(未設定)"),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6",
                  color: s.difficulty ? (_DIFF_COL[s.difficulty] || "#555") : "#ccc", fontWeight: s.difficulty ? 700 : 400 } },
                  s.difficulty || "—"),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  s.osVal != null ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.osVal, true), fontWeight: s.osVal >= 10 ? 700 : 600 } }, s.osVal + "\u5186") : React.createElement("span", { style: { color: "#ddd" } }, "\u2014")),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  Number(s.osConfVal) === 0
                    ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#888" } }, "0\u5186")
                    : s.osConfSign
                      ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.osConfVal, s.osConfSign === "+"), fontWeight: Number(s.osConfVal) >= 10 ? 700 : 600 } },
                          (s.osConfSign === "+" ? "\u2191" : s.osConfSign === "-" ? "\u2193" : "\u2195") + (s.osConfVal != null ? Math.abs(Number(s.osConfVal)) + "\u5186" : ""))
                      : React.createElement("span", { style: { color: "#ddd" } }, "\u2014")),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  (function() {
                    if (_ovA == null || s.osConfVal == null || s.osConfVal === "") return React.createElement("span", { style: { color: "#ddd" } }, "\u2014");
                    var _cfEw = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
                    var _ew = _ovA - _cfEw;
                    if (_ew === 0) return React.createElement("span", { style: { color: "#888" } }, "0");
                    var _ewAbs = Math.abs(_ew);
                    return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewAbs, _ew < 0), fontWeight: _ewAbs >= 10 ? 700 : 600 } }, (_ew > 0 ? "\u2193" : "\u2191") + _ewAbs);
                  })()),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } }, entLabel),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
                  _slashCell(_dynRes === "ok" ? {ch:"○",col:"#1E8449"} : _dynRes === "ng" ? {ch:"×",col:"#C0392B"} : _dynRes === "draw" ? {ch:"△",col:"#6B7280"} : _dynRes === "miss" ? {ch:"ー",col:"#B45309"} : null, planGrade, planPnlN, _dynRes === "miss"),
                  _elPlanIsStop(s, _ovA, _ovC) ? _elCapNote(_ovC) : null),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  s.holdHighVal != null
                    ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdHighVal, s.holdHighSign === "-"), fontWeight: s.holdHighVal >= 10 ? 700 : 600 } },
                        (s.holdHighSign === "+" ? "↓" : s.holdHighSign === "-" ? "↑" : "") + s.holdHighVal)
                    : React.createElement("span", { style: { color: "#ddd" } }, "—")),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  s.holdWidth != null
                    ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdWidth, s.holdWidthSign === "-"), fontWeight: s.holdWidth >= 10 ? 700 : 600 } }, (s.holdWidthSign === "-" ? "↑" : s.holdWidthSign === "+" ? "↓" : "↕") + s.holdWidth)
                    : React.createElement("span", { style: { color: "#ddd" } }, "—")),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
                  (function() {
                    if (holdPnl == null) return _dynRes === "miss" ? _slashCell({ch:"ー",col:"#B45309"}, null, null, true) : React.createElement("span", { style: { color: "#ccc" } }, "—");
                    var _symH = _dynHP === "yes" ? {ch:"○",col:"#1E8449"} : _dynHP === "mid" ? {ch:"△",col:"#B45309"} : _dynHP === "none" ? {ch:"ー",col:"#888"} : _dynHP === "no" ? {ch:"×",col:"#C0392B"} : null;
                    if (!_symH && holdPnl == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
                    // 想定損益が損切りの行は、ホールドでも同水準で損切りされる前提で結果損益額を想定額にキャップ表示する。
                    var _planStopH = _elPlanIsStop(s, _ovA, _ovC);
                    var _capV = (_planStopH && planPnlN != null) ? planPnlN : holdPnl;
                    var _capG = _capV != null ? _profitGradeFromPnl(_capV, 1) : null;
                    return _slashCell(_symH, _capG, _capV, false);
                  })(),
                  (holdPnl != null && _elHoldIsStop(s, _ovA, _ovC)) ? _elCapNote(_ovC) : null,
                  (_elPlanIsStop(s, _ovA, _ovC) && planPnlN != null && holdPnl != null && holdPnl !== planPnlN)
                    ? React.createElement("div", { title: "損切りせず保有し続けた場合の本来の結果損益（100株換算）", style: { fontSize: 11, color: "#333", fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.2, marginTop: 1 } }, "（" + holdPnl.toLocaleString() + "円）")
                    : null),
                React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" } }, _tradeAlphaChip(s), _rPnlDisp(realPnlN, realGrade))
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
            var _fmtAB = function(v) { return v != null ? (v > 0 ? "+" : "") + v.toLocaleString() + "円" : "—"; };
            var _colAB = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
            if (abV == null && allV == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _mkSmBadge = function(g) {
              var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
              return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color,
                border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 1, flexShrink: 0 } }, g);
            };
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              abGrade ? _tBadge(abGrade) : null,
              React.createElement("span", { style: { fontWeight: 600, color: _colAB(abV) } }, _fmtAB(abV)),
              abV !== allV ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
                React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "("),
                allGrade ? _mkSmBadge(allGrade) : null,
                React.createElement("span", { style: { color: _colAB(allV), fontSize: 10 } }, _fmtAB(allV)),
                React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, ")")
              ) : null
            );
          };
          var _lblCtot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
          var totRow = React.createElement("tr", { key: "__ctot__", style: { background: "#FFF7ED" } },
            React.createElement("td", { style: { textAlign: "left", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, "合計"),
            React.createElement("td", { colSpan: 7, style: { borderTop: "2px solid #FB923C" } }),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }, _lblCtot("想定損益"), _rPnlDispABAll(_totPlanAB, _totPlan, _totPlanGradeAB, _totPlanGrade),
              (_totPlanStop && _totPlanCap != null) ? _elCapNoteAmt(_totPlanCap) : null),
            React.createElement("td", { colSpan: 2, style: { borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } },
              _lblCtot("H結果損益"),
              _totHoldCnt > 0
                ? _rPnlDispABAll(_totHoldAB, _totHoldPlanCap, _totHoldABGrade, _totHoldPlanCapGrade)
                : React.createElement("span", { style: { color: "#ccc" } }, "—"),
              (_totHoldStop && _totHoldCap != null) ? _elCapNoteAmt(_totHoldCap) : null,
              (_totHoldPlanStopDiff && _totHold != null) ? React.createElement("div", { title: "損切りせず保有し続けた場合の本来の結果損益合計（100株換算）", style: { fontSize: 11, color: "#333", fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.2, marginTop: 1 } }, "（" + _totHold.toLocaleString() + "円）") : null),
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
          var _tAlphaBar = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "2px 8px 6px", flexWrap: "wrap" } },
            React.createElement("span", { style: { fontSize: 10, color: "#0369A1", fontWeight: 700 } }, "α値"),
            React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #BAE6FD", borderRadius: 4, overflow: "hidden" } },
              React.createElement("input", {
                type: "number", inputMode: "numeric", min: "0", max: "30", step: "1", value: tExpAlpha,
                onChange: function(e) { var v = e.target.value; if (v === "") { setTExpAlpha(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 30) n = 30; if (n < 0) n = 0; setTExpAlpha(String(n)); },
                style: { width: 46, padding: "2px 4px", fontSize: 11, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { setTExpAlpha(function(v) { return String(Math.min(30, (Number(v)||0) + 1)); }); },
                function() { setTExpAlpha(function(v) { return String(Math.max(0, (Number(v)||0) - 1)); }); }
              )
            ),
            React.createElement("span", { style: { fontSize: 10, color: "#888" } }, "円"),
            React.createElement("span", { style: { fontSize: 10, color: "#555", fontWeight: 700, marginLeft: 4 } }, "損切り"),
            React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" } },
              React.createElement("input", {
                type: "number", inputMode: "numeric", min: "0", step: "1", value: tExpCut,
                onChange: function(e) { var v = e.target.value; if (v === "") { setTExpCut(""); return; } var n = Number(v); if (isNaN(n)) return; if (n < 0) n = 0; setTExpCut(String(n)); },
                style: { width: 42, padding: "2px 4px", fontSize: 11, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { setTExpCut(function(v) { return String((Number(v)||0) + 1); }); },
                function() { setTExpCut(function(v) { return String(Math.max(1, (Number(v)||0) - 1)); }); }
              )
            ),
            React.createElement("span", { style: { fontSize: 10, color: "#888" } }, "円"),
            React.createElement("button", {
              onClick: function() { setTExpAlpha("10"); setTExpCut("10"); },
              style: { fontSize: 10, padding: "1px 8px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", color: "#555", whiteSpace: "nowrap" }
            }, "リセット"),
            React.createElement("span", { style: { fontSize: 9, color: "#aaa", whiteSpace: "nowrap" } }, "※この日全体にα/損切りを適用して試算")
          );
          return React.createElement("tr", { key: date + "_texp" },
            React.createElement("td", { colSpan: 12, style: { padding: 0, background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
              _tSortToggle,
              _tAlphaBar,
              React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "auto", borderCollapse: "collapse", fontSize: 11 } },
                  React.createElement("thead", null,
                    React.createElement("tr", null,
                      _rTh("銘柄", { textAlign: "left", width: 60 }), _rTh("時間", { width: 48 }), _rTh("シグナル", { width: 190 }), _rTh(React.createElement("span", null, "E", React.createElement("span", { style: { display: "block", whiteSpace: "nowrap" } }, "難易度")), { width: 46 }), _rTh("OS値", { width: 48 }), _rTh("確定値", { width: 58 }), _rTh("α値比値幅", { width: 54 }), _rTh("E", { width: 74 }),
                      _rTh("想定損益", { width: 112 }), _rTh(React.createElement("span", null, "H", React.createElement("span", { style: { display: "block", whiteSpace: "nowrap" } }, "高値")), { width: 46 }), _rTh(React.createElement("span", null, "H", React.createElement("span", { style: { display: "block", whiteSpace: "nowrap" } }, "確定値")), { width: 54 }), _rTh("H勝敗/結果損益", { width: 108 }), _rTh("実現損益", { width: 88 })
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
            mkRow("想定損益", { A:"2501+", B:"1001～2500", C:"1～1000", D:"0", E:"-1～-1000", F:"-1001～-2500", G:"-2501-", Q:"E基準未達のため非表示" })
          );
        })();
        var sortToggle = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "並び替え:"),
          [["desc", "新しい順"], ["asc", "古い順"], ["difficulty", "🎯 E難易度順"]].map(function(kv) {
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
            _tTh("件数"), _tTh("勝"), _tTh("負"), _tTh("E未達"), _tTh("勝率"), _tTh("平均OS値"), _tTh("平均確定値"),
            _tTh("実現損益"),
            React.createElement("th", { style: { padding: "5px 4px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%" } },
              React.createElement("div", null, "想定損益"),
              React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(100株)")
            ),
            React.createElement("th", { style: { padding: "5px 4px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%" } },
              React.createElement("div", null, "H損益"),
              React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(α比/100株)")
            ),
            _tTh("タグ", { width: "auto" })
          )
        );
        
        var _tMonthRecs = [];
        tblDates.forEach(function(date) { (byDate[date] || []).forEach(function(r) { _tMonthRecs.push(r); }); });
        var _tMonthSt  = _tMonthRecs.length > 0 ? _calcD(_tMonthRecs) : { total: 0, ok: 0, ng: 0, winPct: null, sumPnl: 0, expected: null, sumPlanned: 0, expectedPlanned: null, sumMax: 0, expectedMax: null, sumHold: null };
        var _tMonthEnt = _tMonthRecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
        var _tMonthGradeReal = _tMonthSt.total > 0 ? _profitGradeFromPnlReal(_tMonthSt.sumPnl, _tMonthEnt.length) : null;
        var _tMonthGradePlan = _tMonthSt.total > 0 ? _profitGradeFromPnl(_tMonthSt.sumPlanned, _tMonthSt.total) : null;
        var _tMSimSt = _tSimCalc(_tMonthRecs, _simA);
        var _tMSimActive = _tMSimSt != null;
        var _tMdOk = _tMSimActive ? _tMSimSt.ok : _tMonthSt.ok;
        var _tMdNg = _tMSimActive ? _tMSimSt.ng : _tMonthSt.ng;
        var _tMdMiss = _tMSimActive ? _tMSimSt.miss : _tMonthSt.miss;
        var _tMdWinPct = _tMSimActive ? _tMSimSt.winPct : _tMonthSt.winPct;
        var _tMSimFmt = function(v) { return v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円"); };
        var _bb2 = "2px solid #c0b8a8";
        var _tMonthRow = React.createElement("tr", { key: "__monthtot__", style: { background: "#F5F0E8" } },
          React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", width: "1%", color: "#9A3412", borderBottom: _bb2, borderTop: "2px solid #c0b8a8" } }, "📊 " + curM + " 合計"),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, fontSize: 11, borderBottom: _bb2, borderTop: _bb2 } }, _tMonthSt.total || 0),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: _bb2, borderTop: _bb2, color: _tMSimActive ? "#C0392B" : "inherit" } }, _tMdOk || 0),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, borderBottom: _bb2, borderTop: _bb2, color: _tMSimActive ? "#1E8449" : "inherit" } }, _tMdNg || 0),
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
            (function() {
              var _cfRm = _tMonthRecs.filter(function(r) { return r.signal.osConfVal != null && r.signal.osConfVal !== ""; });
              if (!_cfRm.length) return React.createElement("span", { style: { color: "#ddd" } }, "\u2014");
              var _cfAm = Math.round(_cfRm.reduce(function(a, r) { var s = r.signal; return a + (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)); }, 0) / _cfRm.length * 10) / 10;
              return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums" } }, (_cfAm > 0 ? "+" : "") + _cfAm + "\u5186");
            })()
          ),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            _tSlash(_tMonthSt.sumPnl, _tMonthSt.expected, _tMonthGradeReal)),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            _tMSimActive ? _tAB2(_tMSimSt.planAB, _tMSimSt.plan) : _tABAll(_tMonthRecs, _tMonthSt.sumPlanned, _tMonthSt.expectedPlanned, _tMonthGradePlan, "sumPlanned", "expectedPlanned")),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb2, borderTop: _bb2 } },
            _tMSimActive ? _tAB2(_tMSimSt.holdCapAB, _tMSimSt.holdCap) : (function() { var _h = _tMonthSt.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })()),
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
        
        var _simEl = (function() {
          
          var _simRecs = allRecords.slice();
          if (simPeriodMode === "1w") {
            _simRecs = _simRecs.filter(function(r) { return r.date >= _simWeekRange.from && r.date <= _simWeekRange.to; });
          } else if (simPeriodMode === "month") {
            _simRecs = _simRecs.filter(function(r) { return r.date && r.date.slice(0,7) === curM; });
          } else if (simPeriodMode === "3m") {
            var _now = new Date(); _now.setDate(1);
            _now.setMonth(_now.getMonth() - 3);
            var _3mFrom = _now.getFullYear() + "-" + (String(_now.getMonth()+1).padStart(2,"0")) + "-01";
            _simRecs = _simRecs.filter(function(r) { return r.date >= _3mFrom; });
          } else if (simPeriodMode === "custom") {
            if (simFrom) _simRecs = _simRecs.filter(function(r) { return r.date >= simFrom; });
            if (simTo)   _simRecs = _simRecs.filter(function(r) { return r.date <= simTo; });
          }
          
          var _simCut = (simCutStr !== "" && !isNaN(Number(simCutStr))) ? Number(simCutStr) : 10;
          var _capYen = -Math.round(_simCut * 100);
          var _sTotPlan = null, _sTotHold = null;
          var _sTotPlanAB = null, _sTotHoldCapAll = null, _sTotHoldCapAB = null;
          var _sTotPlanCnt = 0, _sTotHoldCnt = 0, _sHoldUnrec = 0;
          var _sPlanDays = {}, _sHoldDays = {};
          // 詳細表と同じ共有ロジック(_elDynPlanned/_elDynHold/_elPlanIsStop)で集計。一律 _simCut を適用。
          _simRecs.forEach(function(r) {
            var s = r.signal;
            var _isABb = (s.difficulty === "A" || s.difficulty === "B");
            var _dpB = _elDynPlanned(s, _simA, _simCut);
            if (_dpB != null) {
              _sTotPlan = (_sTotPlan||0) + _dpB; _sTotPlanCnt++; _sPlanDays[r.date] = 1;
              if (_isABb) _sTotPlanAB = (_sTotPlanAB||0) + _dpB;
            }
            var _hpB = _elDynHold(s, _simA, _simCut);
            if (_hpB != null) {
              // 想定が損切りの行は結果損益を想定額にキャップ。
              var _hCapVb = (_elPlanIsStop(s, _simA, _simCut) && _dpB != null) ? _dpB : _hpB;
              _sTotHold = (_sTotHold||0) + _hpB; _sTotHoldCnt++; _sHoldDays[r.date] = 1;
              _sTotHoldCapAll = (_sTotHoldCapAll||0) + _hCapVb;
              if (_isABb) _sTotHoldCapAB = (_sTotHoldCapAB||0) + _hCapVb;
            } else if (s.osVal != null && Number(s.osVal) >= _simA && s.holdOsConf == null && s.holdWidth == null && s.holdHighVal == null) {
              _sHoldUnrec++;
            }
          });
          var _nPlanDays = Object.keys(_sPlanDays).length;
          var _nHoldDays = Object.keys(_sHoldDays).length;
          var _avgPlanDay = _nPlanDays > 0 ? Math.round((_sTotPlan||0) / _nPlanDays) : null;
          var _avgPlanDayAB = _nPlanDays > 0 && _sTotPlanAB != null ? Math.round(_sTotPlanAB / _nPlanDays) : _avgPlanDay;
          var _avgHoldDay = _nHoldDays > 0 ? Math.round((_sTotHoldCapAll||0) / _nHoldDays) : null;
          var _avgHoldDayAB = _nHoldDays > 0 && _sTotHoldCapAB != null ? Math.round(_sTotHoldCapAB / _nHoldDays) : _avgHoldDay;
          var _pFmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
          var _pCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
          // B以上を主表示、全体(C含む)をカッコ併記。
          var _pAB2 = function(abV, allV) {
            if (abV == null && allV == null) return React.createElement("span", { style: { fontSize: 16, fontWeight: 700, color: "#ccc" } }, "—");
            return React.createElement("span", { style: { whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 16, fontWeight: 700, color: _pCol(abV) } }, _pFmt(abV)),
              (abV !== allV) ? React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: _pCol(allV), marginLeft: 2 } }, "（" + _pFmt(allV) + "）") : null
            );
          };
          var _periodLabels = [["1w","1週間（月〜金）"], ["month","今月"], ["3m","3ヶ月"], ["all","全期間"], ["custom","カスタム"]];
          return React.createElement("div", { style: { margin: "14px 0 10px", padding: "12px 14px", background: "#FFFBF5", border: "1.5px solid #FB923C", borderRadius: 8 } },
            React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#9A3412", marginBottom: 10 } }, "📊 一括α値シミュレーション"),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 } },
              React.createElement("span", { style: { fontSize: 12, color: "#555", fontWeight: 600, whiteSpace: "nowrap" } }, "α値:"),
              React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
                React.createElement("input", {
                  type: "number", inputMode: "numeric", step: "1", min: "0", max: "30", placeholder: "0〜30",
                  value: simAlphaStr,
                  onChange: function(e) { var v = e.target.value; if (v === "") { setSimAlphaStr(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 30) n = 30; if (n < 0) n = 0; setSimAlphaStr(String(n)); },
                  style: { width: 70, padding: "5px 6px", fontSize: 13, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
                }),
                _stepBtn(
                  function() { setSimAlphaStr(function(v) { return String(Math.min(30, (Number(v)||0) + 1)); }); },
                  function() { setSimAlphaStr(function(v) { return String(Math.max(0, (Number(v)||0) - 1)); }); }
                )
              ),
              React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
              React.createElement("span", { style: { fontSize: 12, color: "#555", fontWeight: 600, whiteSpace: "nowrap", marginLeft: 4 } }, "損切り値:"),
              React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
                React.createElement("input", {
                  type: "number", inputMode: "numeric", step: "1", min: "0", max: "30", placeholder: "0〜30",
                  value: simCutStr,
                  onChange: function(e) { var v = e.target.value; if (v === "") { setSimCutStr(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 30) n = 30; if (n < 0) n = 0; setSimCutStr(String(n)); },
                  style: { width: 70, padding: "5px 6px", fontSize: 13, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
                }),
                _stepBtn(
                  function() { setSimCutStr(function(v) { return String(Math.min(30, (Number(v)||0) + 1)); }); },
                  function() { setSimCutStr(function(v) { return String(Math.max(0, (Number(v)||0) - 1)); }); }
                )
              ),
              React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
              React.createElement("button", {
                onClick: function() { setSimAlphaStr("10"); setSimCutStr("10"); },
                style: { fontSize: 11, padding: "3px 8px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#555" }
              }, "クリア"),
              React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                _periodLabels.map(function(kv) {
                  var on = simPeriodMode === kv[0];
                  return React.createElement("button", { key: kv[0], onClick: function() { setSimPeriodMode(kv[0]); },
                    style: { padding: "3px 10px", fontSize: 11, fontWeight: on ? 700 : 400, borderRadius: 4, cursor: "pointer",
                      border: on ? "1.5px solid #FB923C" : "1px solid #ddd",
                      background: on ? "#FFEDD5" : "#fff", color: on ? "#9A3412" : "#666" }
                  }, kv[1]);
                })
              )
            ),
            simPeriodMode === "custom" && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" } },
              React.createElement("span", { style: { fontSize: 11, color: "#666" } }, "開始:"),
              React.createElement("input", { type: "date", value: simFrom, onChange: function(e) { setSimFrom(e.target.value); },
                style: { fontSize: 11, padding: "3px 6px", border: "1px solid #ccc", borderRadius: 4 } }),
              React.createElement("span", { style: { fontSize: 11, color: "#666" } }, "〜"),
              React.createElement("input", { type: "date", value: simTo, onChange: function(e) { setSimTo(e.target.value); },
                style: { fontSize: 11, padding: "3px 6px", border: "1px solid #ccc", borderRadius: 4 } })
            ),
            _simA == null
              ? React.createElement("div", { style: { fontSize: 12, color: "#aaa" } }, "α値を入力するとシミュレーション結果が表示されます")
              : React.createElement("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" } },
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 2 } }, "想定損益合計（" + _sTotPlanCnt + "件・B以上／全体）"),
                    _pAB2(_sTotPlanAB, _sTotPlan)
                  ),
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 2 } },
                      "H結果損益合計（" + _sTotHoldCnt + "件・B以上／全体）",
                      _sHoldUnrec > 0 ? React.createElement("span", { style: { color: "#aaa", marginLeft: 4 } }, "※" + _sHoldUnrec + "件未記録") : null
                    ),
                    _pAB2(_sTotHoldCapAB, _sTotHoldCapAll)
                  ),
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 2 } }, "1日当たり平均想定損益（" + _nPlanDays + "日）"),
                    _pAB2(_avgPlanDayAB, _avgPlanDay)
                  ),
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 2 } }, "1日当たり平均結果損益（" + _nHoldDays + "日）"),
                    _pAB2(_avgHoldDayAB, _avgHoldDay)
                  ),
                  React.createElement("div", { style: { fontSize: 10, color: "#aaa" } },
                    "対象期間: ",
                    simPeriodMode === "1w" ? "今週（" + _simWeekRange.label + "）" :
                    simPeriodMode === "month" ? curM + "の全営業日" :
                    simPeriodMode === "3m" ? "直近3ヶ月" :
                    simPeriodMode === "all" ? "全期間" :
                    (simFrom || "?") + " 〜 " + (simTo || "?"),
                    " / " + _simRecs.length + "シグナル"
                  )
                )
          );
        })();
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
            _simEl,
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff" } },
                thead, tbody
              )
            )
          ),
          React.createElement("div", { style: { marginTop: 16 } },
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, "📆 曜日別集計"),
            React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "損益は100株あたり換算"),
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff" } },
                React.createElement("thead", null,
                  React.createElement("tr", { style: { background: "#f5f4f0" } },
                    React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "曜日"),
                    _tTh("件"), _tTh("勝"), _tTh("負"), _tTh("勝率"),
                    _tTh("実現損益"),
                    React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
                      React.createElement("div", null, "想定損益"),
                      React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(100株あたり)")
                    ),
                    React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
                      React.createElement("div", null, "H損益（α値比）"),
                      React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(100株あたり)")
                    )
                  )
                ),
                React.createElement("tbody", null,
                  [1, 2, 3, 4, 5].map(function(wd) {
                    var wrecs = _dtByDow[wd];
                    var wst = _calcD(wrecs);
                    var wEnt = wrecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
                    var gradeReal = _profitGradeFromPnlReal(wst.sumPnl, wEnt.length);
                    var gradePlan = _profitGradeFromPnl(wst.sumPlanned, wst.total);
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
                        wrecs.length > 0 ? _tSlash(wst.sumPnl, wst.expected, gradeReal) : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
                        wrecs.length > 0 ? _tABAll(wrecs, wst.sumPlanned, wst.expectedPlanned, gradePlan, "sumPlanned", "expectedPlanned") : _dash),
                      React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: bb } },
                        wrecs.length > 0 ? (function() { var _h = wst.sumHold; if (_h == null) return _dash; return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })() : _dash)
                    );
                  })
                )
              )
            )
          ),
          React.createElement("div", { style: { marginTop: 16 } },
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, "🎯 E難易度別集計"),
            React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "損益は100株あたり換算 / H勝敗は ○勝・△分・ー無・×負"),
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff" } },
                React.createElement("thead", null,
                  React.createElement("tr", { style: { background: "#f5f4f0" } },
                    React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "E難易度"),
                    _tTh("件"),
                    _tTh("実現損益"),
                    React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
                      React.createElement("div", null, "想定損益"),
                      React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(100株あたり)")
                    ),
                    React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
                      React.createElement("div", null, "H損益（α値比）"),
                      React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(100株あたり)")
                    ),
                    _tTh("H勝敗")
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
                      return React.createElement("tr", null, React.createElement("td", { colSpan: 6, style: { padding: 10, textAlign: "center", color: "#aaa", fontSize: 11 } }, "該当なし"));
                    }
                    var _bbd = "1px solid #e0ddd6";
                    var _dashD = React.createElement("span", { style: { color: "#ccc" } }, "ー");
                    return _dtDiffKeys.map(function(dk) {
                      var drecs = _dtByDiff[dk];
                      var dst = _calcD(drecs);
                      var dEnt = drecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
                      var gradeReal = _profitGradeFromPnlReal(dst.sumPnl, dEnt.length);
                      var gradePlan = _profitGradeFromPnl(dst.sumPlanned, dst.total);
                      return React.createElement("tr", { key: dk },
                        React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", width: "1%", borderBottom: _bbd, borderRight: _bbd } }, dk === "(未設定)" ? "(未設定)" : dk),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, borderBottom: _bbd, borderRight: _bbd } }, dst.total),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd } }, _tSlash(dst.sumPnl, dst.expected, gradeReal)),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd } }, _tABAll(drecs, dst.sumPlanned, dst.expectedPlanned, gradePlan, "sumPlanned", "expectedPlanned")),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 12, whiteSpace: "nowrap", borderBottom: _bbd, borderRight: _bbd } }, (function() { var _h = dst.sumHold; if (_h == null) return _dashD; return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })()),
                        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bbd, color: "#7C3AED", fontWeight: 700 } }, dst.holdResTotal > 0 ? (dst.hYes + "/" + dst.hMid + "/" + dst.hNone + "/" + dst.hNo) : _dashD)
                      );
                    });
                  })()
                )
              )
            )
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
          isHoliday ? _dash : _svSlash(st.sumPnl, st.expected, gradeReal)),
        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
          isHoliday ? _dash : _tABAll(_svDateRecs, st.sumPlanned, st.expectedPlanned, gradePlanned, "sumPlanned", "expectedPlanned")),
        React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: br } },
          isHoliday ? _dash : (function() { var _h = st.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })()),
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
      recs.forEach(function(r) {
        var rKey = r.stock + "_" + (r.signal.id || r.signal.time || "");
        var rExp = !!svRecExpand[rKey];
        var s = r.signal;
        var item = r.item;
        var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
        var _per100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
        var realPnl = (item && item.pnl != null) ? Number(item.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        var _aiSv = _elAlphaInfo(r, data);
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
          _totHoldPlanCap = (_totHoldPlanCap || 0) + ((_pStopH && planPnlN != null) ? planPnlN : holdPnl);
          if (_pStopH && planPnlN != null && holdPnl !== planPnlN) _totHoldPlanStopDiff = true; }
        var _isABsv = (s.difficulty === "A" || s.difficulty === "B");
        if (planPnlN != null && _isABsv) { _totPlanABsv = (_totPlanABsv || 0) + planPnlN; _totPlanABCntsv++; }
        if (holdPnl != null && _isABsv) {
          var _pStopHabSv = _elPlanIsStop(s, _aiSv.alpha, _aiSv.cutLine);
          _totHoldABsv = (_totHoldABsv || 0) + ((_pStopHabSv && planPnlN != null) ? planPnlN : holdPnl); _totHoldABCntsv++; }
        var entLabel = entered
          ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "実エントリー")
          : React.createElement("span", { style: { color: "#888" } }, "見送り");
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
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              s.osVal != null
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.osVal, true), fontWeight: s.osVal >= 10 ? 700 : 600 } }, s.osVal + "\u5186")
                : React.createElement("span", { style: { color: "#ddd" } }, "\u2014")),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              Number(s.osConfVal) === 0
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#888" } }, "0\u5186")
                : s.osConfSign
                  ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.osConfVal, s.osConfSign === "+"), fontWeight: Number(s.osConfVal) >= 10 ? 700 : 600 } },
                      (s.osConfSign === "+" ? "\u2191" : s.osConfSign === "-" ? "\u2193" : "\u2195") + (s.osConfVal != null ? Math.abs(Number(s.osConfVal)) + "\u5186" : ""))
                  : React.createElement("span", { style: { color: "#ddd" } }, "\u2014")),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              (function() {
                if (_aiSv.alpha == null || s.osConfVal == null || s.osConfVal === "") return React.createElement("span", { style: { color: "#ddd" } }, "\u2014");
                var _cfEw = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
                var _ew = _aiSv.alpha - _cfEw;
                if (_ew === 0) return React.createElement("span", { style: { color: "#888" } }, "0");
                var _ewAbs = Math.abs(_ew);
                return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewAbs, _ew < 0), fontWeight: _ewAbs >= 10 ? 700 : 600 } }, (_ew > 0 ? "\u2193" : "\u2191") + _ewAbs);
              })()),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, _tradeAlphaChip(s), _rPnlDisp(realPnlN, realGrade)),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, _dynResSv === "miss" ? _qMissCell() : React.createElement(React.Fragment, null, _rPnlDisp(planPnlN, planGrade), _elPlanIsStop(s, _aiSv.alpha, _aiSv.cutLine) ? _elCapNote(_aiSv.cutLine) : null)),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              s.holdHighVal != null
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdHighVal, s.holdHighSign === "-"), fontWeight: s.holdHighVal >= 10 ? 700 : 600 } },
                    (s.holdHighSign === "+" ? "↓" : s.holdHighSign === "-" ? "↑" : "") + s.holdHighVal)
                : React.createElement("span", { style: { color: "#ddd" } }, "—")),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              s.holdWidth != null
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdWidth, s.holdWidthSign === "-"), fontWeight: s.holdWidth >= 10 ? 700 : 600 } }, (s.holdWidthSign === "-" ? "↑" : s.holdWidthSign === "+" ? "↓" : "↕") + s.holdWidth)
                : React.createElement("span", { style: { color: "#ddd" } }, "—")),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" } },
              (function() {
                if (holdPnl == null) return _dynResSv === "miss" ? _qMissCell() : React.createElement("span", { style: { color: "#ccc" } }, "—");
                var _sym = _dynHPsv === "yes" ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "○")
                  : _dynHPsv === "mid" ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700 } }, "△")
                  : _dynHPsv === "none" ? React.createElement("span", { style: { color: "#888", fontWeight: 700 } }, "ー")
                  : _dynHPsv === "no" ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "×") : null;
                if (!_sym && holdPnl == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
                // 想定損益が損切りの行は、ホールドでも同水準で損切りされる前提で結果損益額を想定額にキャップ表示する。
                var _planStopH = _elPlanIsStop(s, _aiSv.alpha, _aiSv.cutLine);
                var _capV = (_planStopH && planPnlN != null) ? planPnlN : holdPnl;
                var _capG = _capV != null ? _profitGradeFromPnl(_capV, 1) : null;
                return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _lane(_sym || React.createElement("span", { style: { color: "#ccc" } }, "—"), 16), _rPnlDisp(_capV, _capG));
              })(),
              (holdPnl != null && _elHoldIsStop(s, _aiSv.alpha, _aiSv.cutLine)) ? _elCapNote(_aiSv.cutLine) : null,
              (_elPlanIsStop(s, _aiSv.alpha, _aiSv.cutLine) && planPnlN != null && holdPnl != null && holdPnl !== planPnlN)
                ? React.createElement("div", { title: "損切りせず保有し続けた場合の本来の結果損益（100株換算）", style: { fontSize: 11, color: "#333", fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.2, marginTop: 1 } }, "（" + holdPnl.toLocaleString() + "円）")
                : null)
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
        var _fmtAB = function(v) { return v != null ? (v > 0 ? "+" : "") + v.toLocaleString() + "円" : "—"; };
        var _colAB = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
        if (abV == null && allV == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        var _mkSmBadge = function(g) {
          var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
          return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color,
            border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 1, flexShrink: 0 } }, g);
        };
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          abGrade ? _svBadge(abGrade) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _colAB(abV) } }, _fmtAB(abV)),
          abV !== allV ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
            React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "("),
            allGrade ? _mkSmBadge(allGrade) : null,
            React.createElement("span", { style: { color: _colAB(allV), fontSize: 10 } }, _fmtAB(allV)),
            React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, ")")
          ) : null
        );
      };
      var _lblSvtot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
      var totRow = React.createElement("tr", { key: "__svtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 6, style: { textAlign: "right", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C" } }, "合計 →"),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }, _lblSvtot("実現損益"), _rPnlDisp(_totReal, _totRealGrade)),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }, _lblSvtot("想定損益"), _rPnlDispABAllSv(_totPlanABsv, _totPlan, _totPlanGradeABsv, _totPlanGrade),
          (_totPlanStop && _totPlanCap != null) ? _elCapNoteAmt(_totPlanCap) : null),
        React.createElement("td", { style: { borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }),
        React.createElement("td", { style: { borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } }),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6" } },
          _lblSvtot("H結果損益"),
          _totHoldCnt > 0
            ? _rPnlDispABAllSv(_totHoldABsv, _totHoldPlanCap, _totHoldABGradeSv, _totHoldPlanCapGradeSv)
            : React.createElement("span", { style: { color: "#ccc" } }, "—"),
          (_totHoldStop && _totHoldCap != null) ? _elCapNoteAmt(_totHoldCap) : null,
          (_totHoldPlanStopDiff && _totHold != null) ? React.createElement("div", { title: "損切りせず保有し続けた場合の本来の結果損益合計（100株換算）", style: { fontSize: 11, color: "#333", fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.2, marginTop: 1 } }, "（" + _totHold.toLocaleString() + "円）") : null)
      );
      var _svAddDateRef = date;
      return React.createElement("tr", { key: date + "_exp" },
        React.createElement("td", { colSpan: 9, style: { padding: 0, background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", null,
                  _rTh("時間", { textAlign: "left" }),
                  _rTh("エントリー"),
                  _rTh("シグナル"),
                  _rTh("OS値", { width: "1%" }),
                  _rTh("確定値", { width: "1%" }),
                  _rTh("α値比値幅", { width: "1%" }),
                  _rTh("実現損益"),
                  _rTh("想定損益"),
                  _rTh("H高値", { width: "1%" }),
                  _rTh("H確定値", { width: "1%" }),
                  _rTh("H勝敗/結果損益")
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
        mkRow("想定損益", { A:"2501+", B:"1001～2500", C:"1～1000", D:"0", E:"-1～-1000", F:"-1001～-2500", G:"-2501-", Q:"E基準未達のため非表示" })
      );
    })();

    
    var thead = React.createElement("thead", null,
      React.createElement("tr", null,
        React.createElement("th", { style: { padding: "5px 8px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "left" } }, "日付"),
        _svTh("件数"),
        _svTh("実現損益"),
        React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
          React.createElement("div", null, "想定損益"),
          React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(100株あたり)")
        ),
        React.createElement("th", { style: { padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" } },
          React.createElement("div", null, "H損益（α値比）"),
          React.createElement("div", { style: { fontWeight: 400, fontSize: 9, color: "#888" } }, "(100株あたり)")
        ),
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
      [["desc", "新しい順"], ["asc", "古い順"], ["difficulty", "🎯 E難易度順"]].map(function(kv) {
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
        var _kpi = React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", padding: "12px", background: "#FFF7ED", borderBottom: "1px solid #e0ddd6" } },
          _elvKpiCard("銘柄数", stocks.length + "銘柄", "#333"),
          _elvKpiCard("件数", _allSt.total + "件", "#333", _allEnt.length + "実/" + (_allSt.total - _allEnt.length) + "見"),
          _elvKpiCard("勝率", _allSt.winPct != null ? _allSt.winPct + "%" : "—", _elvWpCol(_allSt.winPct), (_allSt.ok || 0) + "勝" + (_allSt.ng || 0) + "敗"),
          _elvKpiCard("E未達", (_allSt.miss || 0) + "件", _allSt.miss ? "#7C3AED" : "#bbb"),
          _elvKpiCard("期待値", _allSt.expectedPlanned != null ? _elvYen(_allSt.expectedPlanned) : "—", _elvPnlCol(_allSt.expectedPlanned), "想定1件平均"),
          _elvKpiCard("想定損益", _allSt.sumPlanned !== 0 ? _elvYen(_allSt.sumPlanned) : "—", _elvPnlCol(_allSt.sumPlanned), "合計")
        );
        var _rowsData = stocks.map(function(stk) { return { key: stk, recs: byStock[stk], st: _calcD(byStock[stk]) }; });
        var _perf = _rowsData.filter(function(d) { return d.st.expectedPlanned != null && d.recs.length >= 2; });
        var _best = null, _worst = null;
        if (_perf.length >= 2) { var _s = _perf.slice().sort(function(a, b) { return b.st.expectedPlanned - a.st.expectedPlanned; }); _best = _s[0].key; if (_s[0].st.expectedPlanned !== _s[_s.length - 1].st.expectedPlanned) _worst = _s[_s.length - 1].key; }
        var _hh = function(t, ex) { return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%", fontSize: 10, color: "#9A3412" }, ex || {}) }, t); };
        var _cell = function(c, ex) { return React.createElement("td", { style: Object.assign({ padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede8" }, ex || {}) }, c); };
        var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
        var _cmpTable = React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #e0ddd6" } },
          React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, "📊 銘柄別 比較"),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "行をタップでその銘柄の明細へ / 損益は100株換算・期待値＝想定1件平均 / 最頻OS値＝最も多いOS値(×件数) / 平均H値幅＝H水準値比(＋利益方向) / ▲得意▼苦手は期待値(2件以上)"),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null, React.createElement("tr", { style: { background: "#f5f4f0" } },
                _hh("銘柄", { textAlign: "left", paddingLeft: 8 }), _hh("件"), _hh("勝率"), _hh("E未達"), _hh("平均OS値"), _hh("最頻OS値"), _hh("平均確定値"), _hh("平均H値幅"), _hh("想定損益"), _hh("期待値")
              )),
              React.createElement("tbody", null,
                _rowsData.map(function(d) {
                  var st = d.st, recs = d.recs;
                  var os = _elvAvgOS(recs), mode = _elvModeOS(recs), cf = _elvAvgConf(recs), hw = _elvAvgHoldWidth(recs);
                  var isBest = d.key === _best, isWorst = d.key === _worst;
                  var on = d.key === selStock, stRef = d.key;
                  var lb = isBest ? "3px solid #1E8449" : isWorst ? "3px solid #C0392B" : "3px solid transparent";
                  return React.createElement("tr", { key: d.key, onClick: function() { setExpandKey("stock_" + stRef); setSvDateExpand(null); setSvRecExpand({}); }, style: { cursor: "pointer", background: on ? "#FFF7ED" : "transparent" } },
                    React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", width: "1%", borderBottom: "1px solid #f0ede8", borderLeft: lb, color: "#9A3412" } },
                      d.key,
                      isBest ? React.createElement("span", { style: { marginLeft: 4, fontSize: 9, color: "#1E8449", fontWeight: 800 } }, "▲得意") : null,
                      isWorst ? React.createElement("span", { style: { marginLeft: 4, fontSize: 9, color: "#C0392B", fontWeight: 800 } }, "▼苦手") : null
                    ),
                    _cell(recs.length, { fontWeight: 700 }),
                    _cell(st.winPct != null ? st.winPct + "%" : _dash, { color: _elvWpCol(st.winPct), fontWeight: st.winPct != null ? 700 : 400 }),
                    _cell(st.miss ? st.miss : _dash, { color: st.miss ? "#7C3AED" : "#ccc", fontWeight: st.miss ? 700 : 400 }),
                    _cell(os != null ? os + "円" : _dash, { fontVariantNumeric: "tabular-nums" }),
                    _cell(mode != null ? React.createElement("span", null, mode.val + "円", React.createElement("span", { style: { fontSize: 9, color: "#aaa", marginLeft: 2 } }, "×" + mode.n)) : _dash),
                    _cell(cf != null ? (cf > 0 ? "+" : "") + cf + "円" : _dash, { fontVariantNumeric: "tabular-nums" }),
                    _cell(hw != null ? React.createElement("span", { style: { color: _elvPnlCol(hw), fontWeight: 600 } }, (hw > 0 ? "+" : "") + hw + "円") : _dash),
                    _cell(st.sumPlanned !== 0 ? React.createElement("span", { style: { fontWeight: 600, color: _elvPnlCol(st.sumPlanned) } }, _elvYen(st.sumPlanned)) : _dash),
                    _cell(st.expectedPlanned != null ? React.createElement("span", { style: { fontWeight: 800, color: _elvPnlCol(st.expectedPlanned) } }, _elvYen(st.expectedPlanned)) : _dash)
                  );
                })
              )
            )
          )
        );
        return React.createElement(React.Fragment, null, _kpi, _cmpTable);
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
  var _DIFF_COL = { A: "#1a1a1a", B: "#1a1a1a", C: "#1a1a1a" };
  var _tDiffBreak = function(recs, totalSum, totalEv, grade, sumKey, evKey) {
    var top = _tSlash(totalSum, totalEv, grade);
    if (!recs || !recs.length) return top;
    var lines = ["A", "B", "C"].reduce(function(acc, d) {
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
    var abRecs = (recs || []).filter(function(r) {
      var d = r.signal && r.signal.difficulty;
      return d === "A" || d === "B";
    });
    var abSum = 0;
    if (abRecs.length > 0) {
      var abSt = _calcD(abRecs);
      abSum = abSt[sumKey] || 0;
    }
    if (allSum === 0 && allEv == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    var fmt = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    var col = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var allCnt = (recs || []).length;
    var abGrade = abRecs.length > 0 ? _profitGradeFromPnl(abSum, abRecs.length) : null;
    var allGrade = allCnt > 0 ? _profitGradeFromPnl(allSum, allCnt) : null;
    var _mkSmBadge = function(g) {
      var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
      return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color,
        border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 1, flexShrink: 0 } }, g);
    };
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
      abGrade ? _tBadge(abGrade) : null,
      React.createElement("span", { style: { fontWeight: 600, color: col(abSum) } }, fmt(abSum)),
      abSum !== allSum ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "("),
        allGrade ? _mkSmBadge(allGrade) : null,
        React.createElement("span", { style: { color: col(allSum), fontSize: 10 } }, fmt(allSum)),
        React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, ")")
      ) : null
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
      var perf = rows.map(function(r) { return { key: r.key, ev: _calcD(r.recs).expectedPlanned, n: r.recs.length }; })
                     .filter(function(p) { return p.ev != null && p.n >= 2; });
      var bestKey = null, worstKey = null;
      if (perf.length >= 2) {
        var sorted = perf.slice().sort(function(a, b) { return b.ev - a.ev; });
        bestKey = sorted[0].key; worstKey = sorted[sorted.length - 1].key;
        if (bestKey === worstKey || sorted[0].ev === sorted[sorted.length - 1].ev) { bestKey = sorted[0].key; worstKey = null; }
      }
      var _hh = function(t, extra) { return React.createElement("th", { style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center", width: "1%", fontSize: 10, color: "#9A3412" }, extra || {}) }, t); };
      var allRecs = rows.reduce(function(a, r) { return a.concat(r.recs); }, []);
      var _cell = function(content, isTot, extra) {
        return React.createElement("td", { style: Object.assign({ padding: "5px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: isTot ? "2px solid #ccc" : "1px solid #f0ede8" }, extra || {}) }, content);
      };
      var _dash = React.createElement("span", { style: { color: "#ccc" } }, "—");
      var _mkRow = function(label, labelColor, recs, isTot, tagKey) {
        var st = _calcD(recs);
        var wp = st.winPct, os = _sigAvgOS(recs), cf = _sigAvgConf(recs);
        var isBest = !isTot && tagKey != null && tagKey === bestKey;
        var isWorst = !isTot && tagKey != null && tagKey === worstKey;
        var canExp = !isTot && opts.expandPrefix && recs.length > 0;
        var isOn = canExp && sigSubExpand === opts.expandPrefix + tagKey;
        var lb = isBest ? "3px solid #1E8449" : isWorst ? "3px solid #C0392B" : "3px solid transparent";
        return React.createElement("tr", {
          key: isTot ? "__tot__" : tagKey,
          onClick: canExp ? function() { setSigSubExpand(isOn ? null : opts.expandPrefix + tagKey); } : undefined,
          style: { background: isTot ? "#F5F0E8" : (isOn ? "#FFF7ED" : "transparent"), cursor: canExp ? "pointer" : "default" }
        },
          React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", width: "1%", borderBottom: isTot ? "2px solid #ccc" : "1px solid #f0ede8", borderLeft: lb, color: labelColor || "#333" } },
            (isOn ? "▶ " : "") + label,
            isBest ? React.createElement("span", { style: { marginLeft: 4, fontSize: 9, color: "#1E8449", fontWeight: 800 } }, "▲得意") : null,
            isWorst ? React.createElement("span", { style: { marginLeft: 4, fontSize: 9, color: "#C0392B", fontWeight: 800 } }, "▼苦手") : null
          ),
          _cell(recs.length, isTot, { fontWeight: 700 }),
          _cell(wp != null ? wp + "%" : _dash, isTot, { color: _sigWpCol(wp), fontWeight: wp != null ? 700 : 400 }),
          _cell(st.miss ? st.miss : _dash, isTot, { color: st.miss ? "#7C3AED" : "#ccc", fontWeight: st.miss ? 700 : 400 }),
          _cell(os != null ? os + "円" : _dash, isTot, { fontVariantNumeric: "tabular-nums" }),
          _cell(cf != null ? (cf > 0 ? "+" : "") + cf + "円" : _dash, isTot, { fontVariantNumeric: "tabular-nums" }),
          _cell(st.sumPlanned !== 0 ? React.createElement("span", { style: { fontWeight: 600, color: _sigPnlCol(st.sumPlanned) } }, _sigYen(st.sumPlanned)) : _dash, isTot),
          _cell(st.expectedPlanned != null ? React.createElement("span", { style: { fontWeight: 800, color: _sigPnlCol(st.expectedPlanned) } }, _sigYen(st.expectedPlanned)) : _dash, isTot)
        );
      };
      return React.createElement("div", { style: { padding: "10px 12px", background: "#fff" } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 2 } }, opts.icon + " " + opts.title),
        React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "損益は100株あたり換算 / 期待値＝1トレード平均見込み（想定）/ ▲得意▼苦手は期待値で判定（2件以上）"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { background: "#f5f4f0" } },
                _hh(opts.headLabel, { textAlign: "left", paddingLeft: 8 }), _hh("件"), _hh("勝率"), _hh("E未達"), _hh("平均OS値"), _hh("平均確定値"), _hh("想定損益"), _hh("期待値")
              )
            ),
            React.createElement("tbody", null,
              [_mkRow("合計", "#9A3412", allRecs, true, null)].concat(
                rows.map(function(r) { return _mkRow(r.label, r.labelColor, r.recs, false, r.key); })
              )
            )
          )
        ),
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
      var _ovA = sigDateAlpha, _ovC = sigDateCut;
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
      var _hHighCell = function(s) { return s.holdHighVal != null ? React.createElement("span", { style: { color: _vcol(s.holdHighVal, s.holdHighSign === "-"), fontWeight: Number(s.holdHighVal) >= 10 ? 700 : 600 } }, (s.holdHighSign === "+" ? "↓" : s.holdHighSign === "-" ? "↑" : "") + s.holdHighVal) : _dash; };
      var _hConfCell = function(s) { return s.holdWidth != null ? React.createElement("span", { style: { color: _vcol(s.holdWidth, s.holdWidthSign === "-"), fontWeight: Number(s.holdWidth) >= 10 ? 700 : 600 } }, (s.holdWidthSign === "-" ? "↑" : s.holdWidthSign === "+" ? "↓" : "↕") + s.holdWidth) : _dash; };
      var _numInput = function(val, onCh, color, ph) {
        return React.createElement("input", { type: "number", inputMode: "numeric", step: "1", placeholder: ph,
          value: val != null ? String(val) : "",
          onChange: onCh,
          style: { width: 54, padding: "3px 6px", fontSize: 12, fontWeight: 700, border: "1px solid " + color, borderRadius: 4, textAlign: "right", boxSizing: "border-box", outline: "none" } });
      };
      var _hasOv = (_ovA != null || _ovC != null);
      var header = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, opts.icon + " " + opts.title),
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginLeft: 6 } }, "一括α値"),
        _numInput(_ovA, function(e){ var v=e.target.value; var n=v===""?null:(isNaN(Number(v))?null:Number(v)); if(n!=null){ if(n>30)n=30; if(n<0)n=0; } setSigDateAlpha(n); }, "#BAE6FD", "各日"),
        React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "円"),
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#B91C1C", marginLeft: 6 } }, "損切り値"),
        _numInput(_ovC, function(e){ var v=e.target.value; var n=v===""?null:(isNaN(Number(v))?null:Number(v)); if(n!=null && n<1)n=1; setSigDateCut(n); }, "#FECACA", "各日"),
        React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "円"),
        _hasOv ? React.createElement("button", { onClick: function(){ setSigDateAlpha(null); setSigDateCut(null); }, style: { fontSize: 11, padding: "2px 8px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#555" } }, "リセット") : null,
        _hasOv ? React.createElement("span", { style: { fontSize: 10, color: "#B45309" } }, "※全エントリーに一括適用中") : null
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
          var planPnl = _elDynPlanned(s, aAlpha, aCut);
          var holdPnl = _elDynHold(s, aAlpha, aCut);
          var isMiss = _elDynResult(s, aAlpha, aCut) === "miss";
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
            _td(_confCell(s)),
            _td(_hHighCell(s)),
            _td(_hConfCell(s)),
            _td(isMiss ? _qMissCell() : _pnlCell(planPnl)),
            _td(_pnlCell(holdPnl))
          ));
          if (_on) {
            bodyRows.push(React.createElement("tr", { key: _ek + "_card" },
              React.createElement("td", { colSpan: 9, style: { padding: "4px 8px 8px", background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
                React.createElement(EntryLogCard, { record: r, alpha: aAlpha, cutLine: aCut, data: data, onEdit: handleEdit, onGoDate: handleGoDate })
              )
            ));
          }
        });
      });
      return React.createElement("div", { style: { padding: "10px 12px", background: "#fff" } },
        header,
        React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "1行=1エントリー（日付順）／値は水準線比・損益は100株換算。空欄=各日の設定値・行タップで明細"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { background: "#f5f4f0" } },
                _hh("日付", { textAlign: "left", paddingLeft: 8 }), _hh("時間"), _hh("銘柄"), _hh("OS値"), _hh("確定値"), _hh("H高値"), _hh("H確定値"), _hh("想定損益"), _hh("結果損益(H)")
              )
            ),
            React.createElement("tbody", null, bodyRows)
          )
        )
      );
    };

    
    var renderTimeSubTab = function() {
      var timeSlotRows = slotStats.reduce(function(acc, ss, i) {
        if (i === 10) {
          acc.push(React.createElement("tr", { key: "sep_lunch" },
            React.createElement("td", { colSpan: 8, style: { padding: "2px 6px", background: "#eee9e0", fontSize: 10, color: "#aaa", textAlign: "center" } }, "— 昼休み —")
          ));
        }
        var slotOn = !!(timeFil && timeFil[0] === ss.slot[0]);
        var hasRecs = ss.recs.length > 0;
        var slRef = ss.slot;
        acc.push(React.createElement("tr", {
          key: ss.slot[0],
          onClick: hasRecs ? function() {
            setTimeFil(function(prev) { return (prev && prev[0] === slRef[0]) ? null : slRef; });
            setTimeStockFil("");
          } : undefined,
          style: { background: slotOn ? "#FFF7ED" : "transparent", cursor: hasRecs ? "pointer" : "default", opacity: hasRecs ? 1 : 0.35 }
        },
          React.createElement("td", { style: { padding: "5px 8px", borderBottom: slotOn ? "none" : "1px solid #f0ede8", fontWeight: slotOn ? 700 : 400, whiteSpace: "nowrap", fontSize: 11, width: "1%" } },
            (slotOn ? "▶ " : "") + ss.slot[0] + "〜" + ss.slot[1]),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", borderBottom: slotOn ? "none" : "1px solid #f0ede8", fontWeight: 700, fontSize: 11 } }, hasRecs ? ss.recs.length : "—"),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: slotOn ? "none" : "1px solid #f0ede8",
            fontSize: 11, whiteSpace: "nowrap",
            color: hasRecs && ss.stats.sumPnl !== 0 ? (ss.stats.sumPnl > 0 ? "#C0392B" : "#1E8449") : "#ccc",
            fontWeight: hasRecs && ss.stats.sumPnl !== 0 ? 600 : 400 } },
            hasRecs && ss.stats.sumPnl !== 0 ? (ss.stats.sumPnl > 0 ? "+" : "") + ss.stats.sumPnl + "円" : "—"),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: slotOn ? "none" : "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
            hasRecs ? _tABAll(ss.recs, ss.stats.sumPlanned, ss.stats.expectedPlanned, null, "sumPlanned", "expectedPlanned")
                    : React.createElement("span", { style: { color: "#ccc" } }, "—")),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: slotOn ? "none" : "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
            hasRecs ? (function() { var _h = ss.stats.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })()
                    : React.createElement("span", { style: { color: "#ccc" } }, "—"))
        ));
        
        if (slotOn && hasRecs) {
          var slotStocks = [];
          ss.recs.forEach(function(r) { if (slotStocks.indexOf(r.stock) < 0) slotStocks.push(r.stock); });
          slotStocks.sort();
          var filteredSlotRecs = timeStockFil
            ? ss.recs.filter(function(r) { return r.stock === timeStockFil; })
            : ss.recs;
          var sortedSlotRecs = filteredSlotRecs.slice().sort(function(a, b) {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return (b.signal.time || "").localeCompare(a.signal.time || "");
          });
          acc.push(React.createElement("tr", { key: ss.slot[0] + "_detail" },
            React.createElement("td", { colSpan: 8, style: { padding: 0, background: "#FFFCF8", borderBottom: "2px solid #FB923C" } },
              React.createElement("div", { style: { padding: "8px 12px" } },
                
                slotStocks.length > 1 && React.createElement("div", {
                  style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8, alignItems: "center" }
                },
                  React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "銘柄:"),
                  React.createElement("button", {
                    onClick: function() { setTimeStockFil(""); },
                    style: { padding: "3px 9px", fontSize: 10, fontWeight: 700,
                      background: !timeStockFil ? "#1a1a1a" : "#f0eeea",
                      color: !timeStockFil ? "#fff" : "#555",
                      border: "none", borderRadius: 12, cursor: "pointer" }
                  }, "全て"),
                  slotStocks.map(function(stk) {
                    var isStk = timeStockFil === stk;
                    var stkRef = stk;
                    return React.createElement("button", {
                      key: stk,
                      onClick: function() { setTimeStockFil(isStk ? "" : stkRef); },
                      style: { padding: "3px 9px", fontSize: 10, fontWeight: 700,
                        background: isStk ? "#9A3412" : "#f0eeea",
                        color: isStk ? "#fff" : "#555",
                        border: "none", borderRadius: 12, cursor: "pointer" }
                    }, stk);
                  })
                ),
                
                React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 6 } },
                  sortedSlotRecs.length + "件" + (timeStockFil ? " ・ " + timeStockFil : "")),
                
                sortedSlotRecs.length === 0
                  ? React.createElement("div", { style: { textAlign: "center", color: "#bbb", padding: "12px 0", fontSize: 12 } }, "記録なし")
                  : sortedSlotRecs.map(function(r) {
                      return React.createElement(EntryLogCard, { key: r.stock + "_" + r.signal.id, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate });
                    })
              )
            )
          ));
        }
        return acc;
      }, []);
      return React.createElement("div", null,
        React.createElement("div", { style: { padding: "10px 12px", background: "#fff" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 } },
            "⏰ 時間帯別集計",
            timeFil && React.createElement("span", { style: { fontSize: 11, color: "#9A3412", fontWeight: 600 } }, timeFil[0] + "〜" + timeFil[1]),
            timeFil && React.createElement("button", {
              onClick: function() { setTimeFil(null); setTimeStockFil(""); },
              style: { padding: "1px 7px", fontSize: 10, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#666" }
            }, "× 解除")
          ),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { background: "#f5f4f0" } },
                  React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "時間帯"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #ddd", width: "1%" } }, "件"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計想定損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計H損益（α値比）")
                )
              ),
              React.createElement("tbody", null,
        (function() {
          var at = _calcD(grp.records);
          return React.createElement("tr", { style: { background: "#F5F0E8", borderBottom: "2px solid #ccc" } },
            React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, whiteSpace: "nowrap", fontSize: 11, width: "1%", borderBottom: "2px solid #ccc" } }, "全時間帯合計"),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, fontSize: 11, borderBottom: "2px solid #ccc" } }, grp.records.length),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "2px solid #ccc", fontSize: 11, whiteSpace: "nowrap",
              color: at.sumPnl !== 0 ? (at.sumPnl > 0 ? "#C0392B" : "#1E8449") : "#ccc", fontWeight: at.sumPnl !== 0 ? 600 : 400 } },
              at.sumPnl !== 0 ? (at.sumPnl > 0 ? "+" : "") + at.sumPnl + "円" : "—"),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "2px solid #ccc", fontSize: 11, whiteSpace: "nowrap" } },
              _tABAll(grp.records, at.sumPlanned, at.expectedPlanned, null, "sumPlanned", "expectedPlanned")),
            React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "2px solid #ccc", fontSize: 11, whiteSpace: "nowrap" } },
              (function() { var _h = at.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })())
          );
        })(),
        timeSlotRows
      )
            )
          ),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginTop: 4 } }, "※ 行をタップして選択 → 直下に記録が展開  ／  損益は100株あたり換算")
        )
      );
    };

    
    var renderDateSubTab = function() {
      var byDate2 = {};
      grp.records.forEach(function(r) {
        if (!byDate2[r.date]) byDate2[r.date] = [];
        byDate2[r.date].push(r);
      });
      var dkeys = Object.keys(byDate2).sort(function(a, b) { return b.localeCompare(a); });
      var _byDow = { 1: [], 2: [], 3: [], 4: [], 5: [] };
      var _dowLabel = ["", "月", "火", "水", "木", "金"];
      grp.records.forEach(function(r) {
        var _dp = r.date.split("-");
        var _wd = new Date(+_dp[0], +_dp[1]-1, +_dp[2]).getDay();
        if (_wd >= 1 && _wd <= 5) _byDow[_wd].push(r);
      });
      return React.createElement("div", null,
        React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #f0ede8" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, "📅 日別集計"),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "損益は100株あたり換算"),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { background: "#f5f4f0" } },
                  React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "日付"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #ddd", width: "1%" } }, "件"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計想定損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計最大損益")
                )
              ),
              React.createElement("tbody", null,
                dkeys.map(function(dk) {
                  var drecs = byDate2[dk];
                  var dst = _calcD(drecs);
                  var isOn = sigSubExpand === "date_" + dk;
                  var dkRef = dk;
                  var _dp = dk.split("-"); var _dow = ["日","月","火","水","木","金","土"][new Date(+_dp[0], +_dp[1]-1, +_dp[2]).getDay()];
                  return React.createElement("tr", {
                    key: dk,
                    onClick: function() { setSigSubExpand(isOn ? null : "date_" + dkRef); },
                    style: { background: isOn ? "#FFF7ED" : "transparent", cursor: "pointer" }
                  },
                    React.createElement("td", { style: { padding: "5px 8px", borderBottom: "1px solid #f0ede8", fontWeight: isOn ? 700 : 400, fontSize: 11, whiteSpace: "nowrap", width: "1%" } },
                      (isOn ? "▶ " : "") + dk + " (" + _dow + ")"),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", borderBottom: "1px solid #f0ede8", fontWeight: 700, fontSize: 11 } }, drecs.length),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8",
                      fontSize: 11, whiteSpace: "nowrap",
                      color: dst.sumPnl !== 0 ? (dst.sumPnl > 0 ? "#C0392B" : "#1E8449") : "#ccc",
                      fontWeight: dst.sumPnl !== 0 ? 600 : 400 } },
                      dst.sumPnl !== 0 ? (dst.sumPnl > 0 ? "+" : "") + dst.sumPnl + "円" : "—"),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
                      _tABAll(drecs, dst.sumPlanned, dst.expectedPlanned, null, "sumPlanned", "expectedPlanned")),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
                      (function() { var _h = dst.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })())
                  );
                })
              )
            )
          )
        ),
        
        React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #f0ede8" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, "📆 曜日別集計"),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "損益は100株あたり換算"),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { background: "#f5f4f0" } },
                  React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", width: "1%" } }, "曜日"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #ddd", width: "1%" } }, "件"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計想定損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計H損益（α値比）")
                )
              ),
              React.createElement("tbody", null,
                [1, 2, 3, 4, 5].map(function(wd) {
                  var wrecs = _byDow[wd];
                  var wst = _calcD(wrecs);
                  return React.createElement("tr", { key: wd },
                    React.createElement("td", { style: { padding: "5px 8px", borderBottom: "1px solid #f0ede8", fontWeight: 700, fontSize: 12 } }, _dowLabel[wd]),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", borderBottom: "1px solid #f0ede8", fontWeight: 700, fontSize: 11 } },
                      wrecs.length > 0 ? wrecs.length : React.createElement("span", { style: { color: "#ccc" } }, "—")),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8",
                      fontSize: 11, whiteSpace: "nowrap",
                      color: wst.sumPnl !== 0 ? (wst.sumPnl > 0 ? "#C0392B" : "#1E8449") : "#ccc",
                      fontWeight: wst.sumPnl !== 0 ? 600 : 400 } },
                      wrecs.length > 0 ? (wst.sumPnl !== 0 ? (wst.sumPnl > 0 ? "+" : "") + wst.sumPnl + "円" : "—") : React.createElement("span", { style: { color: "#ccc" } }, "—")),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
                      wrecs.length > 0
                        ? _tABAll(wrecs, wst.sumPlanned, wst.expectedPlanned, null, "sumPlanned", "expectedPlanned")
                        : React.createElement("span", { style: { color: "#ccc" } }, "—")),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
                      wrecs.length > 0
                        ? (function() { var _h = wst.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })()
                        : React.createElement("span", { style: { color: "#ccc" } }, "—"))
                  );
                })
              )
            )
          )
        ),
        
        sigSubExpand && sigSubExpand.indexOf("date_") === 0 && (function() {
          var expDate = sigSubExpand.slice(5);
          var expRecs = (byDate2[expDate] || []).slice().sort(function(a, b) {
            return (b.signal.time || "").localeCompare(a.signal.time || "");
          });
          if (!expRecs.length) return null;
          return React.createElement("div", { style: { padding: "8px 0 0" } },
            React.createElement("div", { style: { padding: "4px 12px 6px", fontSize: 11, color: "#9A3412", fontWeight: 700 } },
              "▶ " + _fmtDow(expDate) + "  " + expRecs.length + "件"),
            expRecs.map(function(r) {
              return React.createElement(EntryLogCard, { key: r.stock + "_" + r.signal.id, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate });
            })
          );
        })()
      );
    };

    
    var renderStockSubTab = function() {
      var byStock2 = {};
      grp.records.forEach(function(r) {
        if (!byStock2[r.stock]) byStock2[r.stock] = [];
        byStock2[r.stock].push(r);
      });
      var skeys = Object.keys(byStock2).sort(function(a, b) { return byStock2[b].length - byStock2[a].length; });
      return React.createElement("div", null,
        React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #f0ede8" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, "📈 銘柄別集計"),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "損益は100株あたり換算"),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { background: "#f5f4f0" } },
                  React.createElement("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "銘柄"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #ddd", width: "1%" } }, "件"),
                  React.createElement("th", { style: { padding: "5px 6px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計想定損益"),
                  React.createElement("th", { style: { padding: "5px 12px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd", whiteSpace: "nowrap", width: "1%" } }, "累計H損益（α値比）")
                )
              ),
              React.createElement("tbody", null,
                skeys.map(function(sk) {
                  var srecs = byStock2[sk];
                  var sst = _calcD(srecs);
                  var isOn = sigSubExpand === "stock_" + sk;
                  var skRef = sk;
                  return React.createElement("tr", {
                    key: sk,
                    onClick: function() { setSigSubExpand(isOn ? null : "stock_" + skRef); },
                    style: { background: isOn ? "#FFF7ED" : "transparent", cursor: "pointer" }
                  },
                    React.createElement("td", { style: { padding: "5px 8px", borderBottom: "1px solid #f0ede8", fontWeight: isOn ? 700 : 400, fontSize: 11, color: "#9A3412", whiteSpace: "nowrap", width: "1%" } },
                      (isOn ? "▶ " : "") + sk),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", borderBottom: "1px solid #f0ede8", fontWeight: 700, fontSize: 11 } }, srecs.length),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8",
                      fontSize: 11, whiteSpace: "nowrap",
                      color: sst.sumPnl !== 0 ? (sst.sumPnl > 0 ? "#C0392B" : "#1E8449") : "#ccc",
                      fontWeight: sst.sumPnl !== 0 ? 600 : 400 } },
                      sst.sumPnl !== 0 ? (sst.sumPnl > 0 ? "+" : "") + sst.sumPnl + "円" : "—"),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
                      _tABAll(srecs, sst.sumPlanned, sst.expectedPlanned, null, "sumPlanned", "expectedPlanned")),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
                      (function() { var _h = sst.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })())
                  );
                })
              )
            )
          )
        ),
        
        sigSubExpand && sigSubExpand.indexOf("stock_") === 0 && (function() {
          var expStock = sigSubExpand.slice(6);
          var expRecs = (byStock2[expStock] || []).slice().sort(function(a, b) { return b.date.localeCompare(a.date); });
          if (!expRecs.length) return null;
          return React.createElement("div", { style: { padding: "8px 0 0" } },
            React.createElement("div", { style: { padding: "4px 12px 6px", fontSize: 11, color: "#9A3412", fontWeight: 700 } },
              "▶ " + expStock + "  " + expRecs.length + "件"),
            expRecs.map(function(r) {
              return React.createElement(EntryLogCard, { key: r.stock + "_" + r.signal.id, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate });
            })
          );
        })()
      );
    };

    
    var renderDiffSubTab = function() {
      var DIFF_ORDER = ["A", "B", "C"];
      var DIFF_LABEL = { A: "A（易）", B: "B（普）", C: "C（難）" };
      var _groupByField = function(field) {
        var grpMap = { A: [], B: [], C: [], "__none__": [] };
        grp.records.forEach(function(r) {
          var v = r.signal[field] || "__none__";
          if (!grpMap[v]) grpMap[v] = [];
          grpMap[v].push(r);
        });
        return grpMap;
      };
      var byEntDiff  = _groupByField("difficulty");
      var byTpDiff   = _groupByField("tpDifficulty");
      var hasTpAny   = grp.records.some(function(r) { return r.signal.tpDifficulty; });

      
      var _th = function(txt, align, extra) {
        return React.createElement("th", {
          style: Object.assign({ padding: "5px 6px", fontWeight: 700, borderBottom: "2px solid #ddd",
            whiteSpace: "nowrap", width: "1%",
            textAlign: align || "center" }, extra || {})
        }, txt);
      };
      var _pnlColor = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#ccc"; };
      var _pnlStr  = function(v) { return v !== 0 ? (v > 0 ? "+" : "") + v + "円" : "—"; };
      var _evStr   = function(v) { return v != null ? (v > 0 ? "+" : "") + v + "円" : "—"; };
      var _slashCell = function(sum, ev, sumP, evP, sumH) {
        return [
          React.createElement("td", { key: "pnl", style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8",
            fontSize: 11, whiteSpace: "nowrap", color: _pnlColor(sum), fontWeight: sum !== 0 ? 600 : 400 } },
            _pnlStr(sum)),
          React.createElement("td", { key: "plan", style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
            sumP !== 0
              ? React.createElement("span", { style: { fontWeight: 600, color: _pnlColor(sumP) } }, _pnlStr(sumP))
              : React.createElement("span", { style: { color: "#ccc" } }, "—")),
          React.createElement("td", { key: "hold", style: { padding: "5px 6px", textAlign: "right", borderBottom: "1px solid #f0ede8", fontSize: 11, whiteSpace: "nowrap" } },
            sumH != null
              ? React.createElement("span", { style: { fontWeight: 700, color: _pnlColor(sumH) } }, _pnlStr(sumH))
              : React.createElement("span", { style: { color: "#ccc" } }, "—"))
        ];
      };

      var _renderDiffTable = function(byMap, label, expandPrefix, icon) {
        var rows = DIFF_ORDER.concat("__none__")
          .filter(function(k) { return (byMap[k] || []).length > 0; })
          .map(function(k) {
            var recs = byMap[k] || [];
            return { key: k, recs: recs, st: _calcD(recs),
              label: k === "__none__" ? "未設定" : DIFF_LABEL[k] };
          });
        if (rows.length === 0) {
          return React.createElement("div", { style: { color: "#bbb", textAlign: "center", padding: "12px 0", fontSize: 12 } }, "記録なし");
        }
        var allSt = _calcD(byMap.A.concat(byMap.B).concat(byMap.C).concat(byMap.__none__ || []));
        return React.createElement("div", { style: { padding: "10px 12px", background: "#fff", borderBottom: "1px solid #f0ede8" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 2 } }, icon + " " + label),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginBottom: 6 } }, "損益は100株あたり換算"),
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { background: "#f5f4f0" } },
                  _th("難易度", "left", { paddingLeft: 8 }),
                  _th("件"),
                  _th("損益", "right"),
                  _th("累計想定損益", "right", { paddingLeft: 12, paddingRight: 12 }),
                  _th("累計H損益（α値比）", "right", { paddingLeft: 12, paddingRight: 12 })
                )
              ),
              React.createElement("tbody", null,
                
                React.createElement("tr", { style: { background: "#F5F0E8", borderBottom: "2px solid #ccc" } },
                  React.createElement("td", { style: { padding: "5px 8px", fontWeight: 700, fontSize: 11, width: "1%", borderBottom: "2px solid #ccc" } }, "合計"),
                  React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, fontSize: 11, borderBottom: "2px solid #ccc" } }, rows.reduce(function(s,r){return s+r.recs.length;},0)),
                  _slashCell(allSt.sumPnl, allSt.expected, 0, null, null)
                    .slice(0, 1)
                    .map(function(c, i) { return React.cloneElement(c, { key: "tot_"+i, style: Object.assign({}, c.props.style, { borderBottom: "2px solid #ccc" }) }); }),
                  React.createElement("td", { key: "tot_2", style: { padding: "5px 6px", textAlign: "right", borderBottom: "2px solid #ccc", fontSize: 11, whiteSpace: "nowrap" } },
                    _tABAll(byMap.A.concat(byMap.B).concat(byMap.C).concat(byMap.__none__ || []), allSt.sumPlanned, allSt.expectedPlanned, null, "sumPlanned", "expectedPlanned")),
                  React.createElement("td", { key: "tot_3", style: { padding: "5px 6px", textAlign: "right", borderBottom: "2px solid #ccc", fontSize: 11, whiteSpace: "nowrap" } },
                    (function() { var _h = allSt.sumHold; if (_h == null) return React.createElement("span", { style: { color: "#ccc" } }, "—"); return React.createElement("span", { style: { fontWeight: 700, whiteSpace: "nowrap", color: _h > 0 ? "#C0392B" : _h < 0 ? "#1E8449" : "#888" } }, (_h > 0 ? "+" : "") + _h.toLocaleString() + "円"); })())
                ),
                
                rows.map(function(row) {
                  var isOn = sigSubExpand === expandPrefix + row.key;
                  var kRef = row.key;
                  var wpColor = row.st.winPct != null ? (row.st.winPct >= 60 ? "#C0392B" : row.st.winPct >= 40 ? "#888" : "#1E8449") : "#ccc";
                  var diffColor = row.key === "A" ? "#1E8449" : row.key === "B" ? "#9A3412" : row.key === "C" ? "#7C3AED" : "#aaa";
                  return React.createElement("tr", {
                    key: row.key,
                    onClick: function() { setSigSubExpand(isOn ? null : expandPrefix + kRef); },
                    style: { background: isOn ? "#FFF7ED" : "transparent", cursor: "pointer" }
                  },
                    React.createElement("td", { style: { padding: "5px 8px", fontWeight: isOn ? 700 : 600, fontSize: 12,
                      color: diffColor, borderBottom: "1px solid #f0ede8", width: "1%", whiteSpace: "nowrap" } },
                      (isOn ? "▶ " : "") + row.label),
                    React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", borderBottom: "1px solid #f0ede8", fontWeight: 700, fontSize: 11 } }, row.recs.length),
                    _slashCell(row.st.sumPnl, row.st.expected, row.st.sumPlanned, row.st.expectedPlanned, row.st.sumHold)
                  );
                })
              )
            )
          ),
          
          sigSubExpand && sigSubExpand.indexOf(expandPrefix) === 0 && (function() {
            var expKey = sigSubExpand.slice(expandPrefix.length);
            var expRecs = (byMap[expKey] || []).slice().sort(function(a, b) { return b.date.localeCompare(a.date); });
            if (!expRecs.length) return null;
            var expLabel = expKey === "__none__" ? "未設定" : DIFF_LABEL[expKey];
            return React.createElement("div", { style: { padding: "8px 0 0" } },
              React.createElement("div", { style: { padding: "4px 12px 6px", fontSize: 11, fontWeight: 700, color: "#9A3412" } },
                "▶ " + expLabel + "  " + expRecs.length + "件"),
              expRecs.map(function(r) {
                return React.createElement(EntryLogCard, { key: r.stock + "_" + r.signal.id, record: r, data: data, onEdit: handleEdit, onGoDate: handleGoDate });
              })
            );
          })()
        );
      };

      return React.createElement("div", null,
        _renderDiffTable(byEntDiff, "エントリー難易度別", "diff_", "🎚"),
        hasTpAny && _renderDiffTable(byTpDiff, "利確難易度別", "tpdiff_", "🎯")
      );
    };


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
      var DIFF_LABEL = { A: "A（易）", B: "B（普）", C: "C（難）" };
      var DIFF_COLOR = { A: "#1E8449", B: "#9A3412", C: "#7C3AED" };
      var mk = function(field) { var m = { A: [], B: [], C: [], "__none__": [] }; grp.records.forEach(function(r) { var v = r.signal[field] || "__none__"; if (!m[v]) m[v] = []; m[v].push(r); }); return m; };
      var rowsOf = function(m) { return ["A","B","C","__none__"].filter(function(k) { return (m[k] || []).length > 0; }).map(function(k) { return { key: k, label: k === "__none__" ? "未設定" : DIFF_LABEL[k], recs: m[k], labelColor: DIFF_COLOR[k] || "#aaa" }; }); };
      var byEnt = mk("difficulty"); var byTp = mk("tpDifficulty");
      var hasTp = grp.records.some(function(r) { return r.signal.tpDifficulty; });
      return React.createElement(React.Fragment, null,
        _sigRichTable({ title: "エントリー難易度別", icon: "🎚", headLabel: "難易度", rows: rowsOf(byEnt), expandPrefix: "diff_" }),
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
        _sigKpiCard("勝率", stats.winPct != null ? stats.winPct + "%" : "—", _sigWpCol(stats.winPct), (stats.ok || 0) + "勝" + (stats.ng || 0) + "敗"),
        _sigKpiCard("E未達", (stats.miss || 0) + "件", stats.miss ? "#7C3AED" : "#bbb", "α>OS値"),
        _sigKpiCard("期待値", stats.expectedPlanned != null ? _sigYen(stats.expectedPlanned) : "—", _sigPnlCol(stats.expectedPlanned), "1トレード平均"),
        _sigKpiCard("想定損益", stats.sumPlanned !== 0 ? _sigYen(stats.sumPlanned) : "—", _sigPnlCol(stats.sumPlanned), "合計"),
        _sigKpiCard("実現損益", stats.sumPnl !== 0 ? _sigYen(stats.sumPnl) : "—", _sigPnlCol(stats.sumPnl), "合計")
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
        "【期待値とは】1トレードあたりの平均損益の見込み額。「勝率 × 平均利益 ＋ 負け率 × 平均損失」で算出。プラスなら長期的に利益が期待できる戦略、マイナスなら改善が必要。"
      )
    );
  };

  var renderCrossView = function() {
    
    var rowRecs = filtered;
    if (crossMode === "entered") rowRecs = rowRecs.filter(function(r) { return _elIsEntered(r.signal, r.item); });
    else if (crossMode === "skipped") rowRecs = rowRecs.filter(function(r) { return !_elIsEntered(r.signal, r.item); });
    
    var colKeys = {};
    var rowKeys = {};
    rowRecs.forEach(function(r) {
      _elTagEntries(r.signal).forEach(function(e) { colKeys[e.key] = e.label; });
      rowKeys[r.stock] = true;
    });
    var cols = Object.keys(colKeys).sort();
    var rows = Object.keys(rowKeys).sort();
    if (cols.length === 0 || rows.length === 0) {
      return React.createElement("div", { style: { color: "#aaa", textAlign: "center", padding: 30 } }, "該当なし");
    }
    
    var getCell = function(stock, ck) {
      var recs = rowRecs.filter(function(r) {
        return r.stock === stock && _elTagEntries(r.signal).some(function(e) { return e.key === ck; });
      });
      return { recs: recs, stats: _calcD(recs) };
    };
    var _xFmt = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    var _METRICS = [["count", "件数"], ["plan", "想定損益"], ["win", "勝率"], ["ev", "期待値"]];
    var _mLabel = (function() { for (var i = 0; i < _METRICS.length; i++) if (_METRICS[i][0] === crossMetric) return _METRICS[i][1]; return "想定損益"; })();
    var _metricVal = function(s) {
      if (crossMetric === "count") return s.total > 0 ? s.total : null;
      if (crossMetric === "win") return s.winPct;
      if (crossMetric === "ev") return s.expectedPlanned;
      return s.total > 0 ? s.sumPlanned : null;
    };
    var _isMoney = crossMetric === "plan" || crossMetric === "ev";
    var _metricFmt = function(s) {
      var v = _metricVal(s);
      if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      if (crossMetric === "count") return v + "件";
      if (crossMetric === "win") return v + "%";
      return _xFmt(v);
    };
    var _xMaxAbs = 0;
    if (_isMoney) rows.forEach(function(stk) { cols.forEach(function(c) {
      var s = getCell(stk, c).stats;
      if (s.total >= 3) { var v = _metricVal(s); if (v != null && Math.abs(v) > _xMaxAbs) _xMaxAbs = Math.abs(v); }
    }); });
    var cellColor = function(s) {
      if (s.total === 0) return "#fafafa";
      if (s.total < 3) return "#f5f4f0";
      if (crossMetric === "count") return "#EEF2FF";
      if (crossMetric === "win") { var w = s.winPct; if (w == null) return "#f5f4f0"; return w >= 60 ? "#FFEBEE" : w >= 40 ? "#FFFDE7" : "#E8F5E9"; }
      var p = _metricVal(s);
      if (p == null) return "#f5f4f0";
      if (p === 0) return "#FFFDE7";
      var r = _xMaxAbs > 0 ? Math.min(Math.abs(p) / _xMaxAbs, 1) : 0;
      if (p > 0) return r > 0.66 ? "#EF9A9A" : r > 0.33 ? "#FFCDD2" : "#FFEBEE";
      return r > 0.66 ? "#A5D6A7" : r > 0.33 ? "#C8E6C9" : "#E8F5E9";
    };
    var _valColor = function(s) {
      var v = _metricVal(s);
      if (crossMetric === "count") return "#3730A3";
      if (crossMetric === "win") return _elvWpCol(v);
      return _elvPnlCol(v);
    };
    var _rowTotal = function(stk) { return _calcD(rowRecs.filter(function(r) { return r.stock === stk; })); };
    var _colTotal = function(c) { return _calcD(rowRecs.filter(function(r) { return _elTagEntries(r.signal).some(function(e) { return e.key === c; }); })); };
    var _grandSt = _calcD(rowRecs);
    var _totCellStyle = { padding: 6, border: "1px solid #d8c9a8", background: "#F5F0E8", textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" };
    return React.createElement("div", null,
      React.createElement("div", { style: { marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } },
        React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "対象:"),
        [["entered", "実エントリーあり"], ["all", "全体"], ["skipped", "見送りのみ"]].map(function(kv) {
          var on = crossMode === kv[0];
          return React.createElement("button", {
            key: kv[0],
            onClick: function() { setCrossMode(kv[0]); },
            style: {
              padding: "5px 10px", fontSize: 11, fontWeight: 600,
              border: on ? "1.5px solid #1a1a1a" : "1px solid #ddd",
              background: on ? "#1a1a1a" : "#fff",
              color: on ? "#fff" : "#555",
              borderRadius: 5, cursor: "pointer"
            }
          }, kv[1]);
        })
      ),
      React.createElement("div", { style: { marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } },
        React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "表示指標:"),
        _METRICS.map(function(kv) {
          var on = crossMetric === kv[0];
          return React.createElement("button", {
            key: kv[0],
            onClick: function() { setCrossMetric(kv[0]); },
            style: {
              padding: "5px 12px", fontSize: 11, fontWeight: on ? 700 : 400,
              border: on ? "1.5px solid #FB923C" : "1px solid #ddd",
              background: on ? "#FFEDD5" : "#fff",
              color: on ? "#9A3412" : "#666",
              borderRadius: 5, cursor: "pointer"
            }
          }, kv[1]);
        })
      ),
      React.createElement("div", { style: { overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e0ddd6" } },
        React.createElement("table", { style: { borderCollapse: "collapse", minWidth: "100%", fontSize: 11 } },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: { padding: 6, border: "1px solid #e0ddd6", background: "#f5f4f0", fontSize: 10, position: "sticky", left: 0, zIndex: 1 } }, "銘柄＼シグナル"),
              cols.map(function(c) {
                return React.createElement("th", {
                  key: c,
                  style: { padding: 6, border: "1px solid #e0ddd6", background: "#f5f4f0", fontSize: 10, minWidth: 80, writingMode: "horizontal-tb" }
                }, colKeys[c]);
              }),
              React.createElement("th", { style: { padding: 6, border: "1px solid #d8c9a8", background: "#F5F0E8", fontSize: 10, color: "#9A3412" } }, "合計")
            )
          ),
          React.createElement("tbody", null,
            rows.map(function(st) {
              var _rt = _rowTotal(st);
              return React.createElement("tr", { key: st },
                React.createElement("td", {
                  style: { padding: 6, border: "1px solid #e0ddd6", background: "#f8f7f4", fontWeight: 700, color: "#9A3412", position: "sticky", left: 0, zIndex: 1 }
                }, st),
                cols.map(function(c) {
                  var cell = getCell(st, c);
                  var s = cell.stats;
                  var bg = cellColor(s);
                  return React.createElement("td", {
                    key: c,
                    onClick: function() {
                      if (cell.recs.length === 0) return;
                      setStockFil(st);
                      setView("signal");
                      setExpandKey(c);
                    },
                    style: { padding: 6, border: "1px solid #e0ddd6", background: bg, textAlign: "center", cursor: s.total > 0 ? "pointer" : "default", opacity: s.total > 0 && s.total < 3 ? 0.55 : 1 }
                  },
                    s.total === 0
                      ? React.createElement("span", { style: { color: "#ccc" } }, "—")
                      : React.createElement("div", null,
                          React.createElement("div", { style: { fontWeight: 700, fontSize: 11, color: _valColor(s) } }, _metricFmt(s)),
                          React.createElement("div", { style: { fontSize: 9, color: "#777" } }, "(" + s.total + "件" + (s.winPct != null ? "・" + s.winPct + "%" : "") + ")")
                        )
                  );
                }),
                React.createElement("td", { style: _totCellStyle },
                  React.createElement("div", { style: { fontSize: 11, color: _valColor(_rt) } }, _metricFmt(_rt)),
                  React.createElement("div", { style: { fontSize: 9, color: "#999", fontWeight: 400 } }, "(" + _rt.total + "件)")
                )
              );
            }).concat([
              React.createElement("tr", { key: "__coltot__" },
                React.createElement("td", { style: { padding: 6, border: "1px solid #d8c9a8", background: "#F5F0E8", fontWeight: 700, color: "#9A3412", position: "sticky", left: 0, zIndex: 1 } }, "合計"),
                cols.map(function(c) {
                  var _ct = _colTotal(c);
                  return React.createElement("td", { key: c, style: _totCellStyle },
                    _ct.total === 0 ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("div", null,
                      React.createElement("div", { style: { fontSize: 11, color: _valColor(_ct) } }, _metricFmt(_ct)),
                      React.createElement("div", { style: { fontSize: 9, color: "#999", fontWeight: 400 } }, "(" + _ct.total + "件)")
                    )
                  );
                }),
                React.createElement("td", { style: Object.assign({}, _totCellStyle, { background: "#EADFCB" }) },
                  React.createElement("div", { style: { fontSize: 11, color: _valColor(_grandSt) } }, _metricFmt(_grandSt)),
                  React.createElement("div", { style: { fontSize: 9, color: "#999", fontWeight: 400 } }, "(" + _grandSt.total + "件)")
                )
              )
            ])
          )
        )
      ),
      React.createElement("div", { style: { fontSize: 10, color: "#888", marginTop: 6, lineHeight: 1.5 } },
        "※ 表示指標＝" + _mLabel + "（" + (_isMoney ? "α実計算・100株換算／赤=利益・緑=損失で濃淡" : crossMetric === "win" ? "勝率／赤=高・緑=低" : "件数") + "）。各セル下段は(件数" + "・勝率)。件数3未満は薄く表示。合計行/列は銘柄・シグナルごとの全体。セルをタップでシグナル別へ。")
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
    var _planSum = 0, _holdSum = 0, _realSumAll = 0;
    var _daySet = {}, _realDaySet = {};
    _pnlAllRecs.forEach(function(r) {
      var ai = _elAlphaInfo(r, data);
      var pp = _elDynPlanned(r.signal, ai.alpha, ai.cutLine);
      var hp = _elDynHold(r.signal, ai.alpha, ai.cutLine);
      if (pp != null) { _planSum += pp; _daySet[r.date] = 1; }
      if (hp != null) { _holdSum += hp; }
      if (_elIsEntered(r.signal, r.item)) {
        var rv = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
        if (rv != null) { _realSumAll += rv; _realDaySet[r.date] = 1; }
      }
    });
    var _nDays = Object.keys(_daySet).length;
    var _nRealDays = Object.keys(_realDaySet).length;
    var _avgPlanDay = _nDays > 0 ? Math.round(_planSum / _nDays) : null;
    var _avgHoldDay = _nDays > 0 ? Math.round(_holdSum / _nDays) : null;
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
            React.createElement("span", { style: { color: "#888" } }, "1日平均 想定損益 "),
            React.createElement("span", { style: { fontWeight: 800, color: _avgCol(_avgPlanDay) } }, _avgFmt(_avgPlanDay))),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "1日平均 結果損益(H) "),
            React.createElement("span", { style: { fontWeight: 800, color: _avgCol(_avgHoldDay) } }, _avgFmt(_avgHoldDay))),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "1日平均 実現損益 "),
            React.createElement("span", { style: { fontWeight: 800, color: _avgCol(_avgRealDay) } }, _avgFmt(_avgRealDay))),
          React.createElement("div", null,
            React.createElement("span", { style: { color: "#888" } }, "対象 "),
            React.createElement("span", { style: { fontWeight: 700 } }, _nDays + "日"))
        ),
        React.createElement("div", { style: { fontSize: 10, color: "#999", marginTop: 4 } },
          "※ 1日平均＝期間内の合計÷記録のある日数（想定・結果は全シグナル基準、実現は実エントリーのみ・100株換算）"),

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
      [["date", "📅 日別"], ["stock", "📈 銘柄別"], ["signal", "🎯 シグナル別"], ["cross", "⚡ クロス集計"], ["pnl", "💰 損益"], ["os", "📊 OS値"]].map(function(kv) {
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
    
    React.createElement(EntryStatsSummary, { records: filtered, data: data, showWin: (view === "date" || view === "pnl") }),
    
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
    view === "cross" && renderCrossView(),
    view === "pnl" && renderPnlView(),
    view === "os" && renderOsView(),
    
    (showForm || editTarget) && React.createElement(EntryRecordForm, {
      data: data, save: save,
      initial: editTarget,
      onClose: handleFormClose
    })
  );
}










