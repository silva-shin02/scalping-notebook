function TradeForm(_ref37) {
  var onSave = _ref37.onSave,
    onCancel = _ref37.onCancel,
    stocks = _ref37.stocks;
  var _useState119 = useState({
      stock: stocks[0] || "",
      time: "",
      type: "空売",
      priceIn: "",
      priceOut: "",
      pnl: "",
      gB: "B",
      gA: "B",
      memo: ""
    }),
    _useState120 = _slicedToArray(_useState119, 2),
    f = _useState120[0],
    setF = _useState120[1];
  var u = function u(k, v) {
    return setF(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, k, v));
    });
  };
  var I = {
    padding: "9px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    background: "#fff",
    width: "100%"
  };
  var L = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 12,
    color: "#888",
    fontWeight: 600
  };
  return React.createElement("div", {
    style: {
      background: "#f8f7f4",
      borderRadius: 10,
      padding: 16,
      marginTop: 12
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, React.createElement("label", {
    style: L
  }, "\u9298\u67C4", React.createElement("select", {
    value: f.stock,
    onChange: function onChange(e) {
      return u("stock", e.target.value);
    },
    style: I
  }, stocks.map(function (s) {
    return React.createElement("option", {
      key: s
    }, s);
  }))), React.createElement("label", {
    style: L
  }, "\u6642\u9593", React.createElement(FastInput, {
    value: f.time,
    onChange: function(v) { return u("time", v); },
    placeholder: "9:30\u21929:31",
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u58F2/\u8CB7", React.createElement("select", {
    value: f.type,
    onChange: function onChange(e) {
      return u("type", e.target.value);
    },
    style: I
  }, React.createElement("option", null, "\u7A7A\u58F2"), React.createElement("option", null, "\u8CB7\u3044"))), React.createElement("label", {
    style: L
  }, "\u640D\u76CA(\u5186)", React.createElement(FastInput, {
    type: "number",
    inputMode: "decimal",
    value: f.pnl,
    onChange: function(v) { return u("pnl", v); },
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u4FA1\u683C(\u5165)", React.createElement(FastInput, {
    value: f.priceIn,
    onChange: function(v) { return u("priceIn", v); },
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u4FA1\u683C(\u51FA)", React.createElement(FastInput, {
    value: f.priceOut,
    onChange: function(v) { return u("priceOut", v); },
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u8A55\u4FA1(\u524D)", React.createElement("select", {
    value: f.gB,
    onChange: function onChange(e) {
      return u("gB", e.target.value);
    },
    style: I
  }, GRADES.map(function (g) {
    return React.createElement("option", {
      key: g
    }, g);
  }))), React.createElement("label", {
    style: L
  }, "\u8A55\u4FA1(\u5F8C)", React.createElement("select", {
    value: f.gA,
    onChange: function onChange(e) {
      return u("gA", e.target.value);
    },
    style: I
  }, GRADES.map(function (g) {
    return React.createElement("option", {
      key: g
    }, g);
  })))), React.createElement("label", {
    style: _objectSpread(_objectSpread({}, L), {}, {
      marginTop: 10
    })
  }, "\u6839\u62E0\u30FB\u53CD\u7701", React.createElement(AutoTextarea, {
    value: f.memo,
    onChange: function onChange(e) {
      return u("memo", e.target.value);
    },
    placeholder: "",
    style: _objectSpread({}, I)
  })), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 12
    }
  }, React.createElement("button", {
    onClick: function onClick() {
      return onSave(_objectSpread(_objectSpread({}, f), {}, {
        gradeBefore: f.gB,
        gradeAfter: f.gA,
        id: Date.now()
      }));
    },
    style: {
      padding: "10px 20px",
      fontSize: 13,
      fontWeight: 600,
      background: "#1a1a1a",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      flex: 1
    }
  }, "\u4FDD\u5B58"), React.createElement("button", {
    onClick: onCancel,
    style: {
      padding: "10px 20px",
      fontSize: 13,
      fontWeight: 600,
      background: "#fff",
      color: "#666",
      border: "1px solid #ccc",
      borderRadius: 6,
      cursor: "pointer"
    }
  }, "\u30AD\u30E3\u30F3\u30BB\u30EB")));
}
function TradeItemCard(_ref38) {
  var t = _ref38.t,
    stocks = _ref38.stocks,
    onUpdate = _ref38.onUpdate,
    onDelete = _ref38.onDelete,
    date = _ref38.date,
    custom = _ref38.custom;
  var _useState121 = useState(false),
    _useState122 = _slicedToArray(_useState121, 2),
    editing = _useState122[0],
    setEditing = _useState122[1];
  var _useState123 = useState(_objectSpread({}, t)),
    _useState124 = _slicedToArray(_useState123, 2),
    f = _useState124[0],
    setF = _useState124[1];
  var u = function u(k, v) {
    return setF(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, k, v));
    });
  };
  var I = {
    padding: "7px 9px",
    border: "1px solid #ccc",
    borderRadius: 5,
    fontSize: 13,
    outline: "none",
    background: "#fff",
    width: "100%"
  };
  var L = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    fontSize: 11,
    color: "#888",
    fontWeight: 600
  };
  var pnl = Number(t.pnl) || 0;
  if (editing) return React.createElement("div", {
    style: {
      padding: 12,
      marginBottom: 6,
      background: "#f8f7f4",
      borderRadius: 8,
      border: "1px solid #e0ddd6"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
      marginBottom: 8
    }
  }, React.createElement("label", {
    style: L
  }, "\u9298\u67C4", React.createElement("select", {
    value: f.stock,
    onChange: function onChange(e) {
      return u("stock", e.target.value);
    },
    style: I
  }, stocks.map(function (s) {
    return React.createElement("option", {
      key: s
    }, s);
  }))), React.createElement("label", {
    style: L
  }, "\u6642\u9593", React.createElement(FastInput, {
    value: f.time || "",
    onChange: function(v) { return u("time", v); },
    placeholder: "9:30\u21929:31",
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u58F2/\u8CB7", React.createElement("select", {
    value: f.type,
    onChange: function onChange(e) {
      return u("type", e.target.value);
    },
    style: I
  }, React.createElement("option", null, "\u7A7A\u58F2"), React.createElement("option", null, "\u8CB7\u3044"))), React.createElement("label", {
    style: L
  }, "\u640D\u76CA(\u5186)", React.createElement(FastInput, {
    type: "number",
    inputMode: "decimal",
    value: f.pnl || "",
    onChange: function(v) { return u("pnl", v); },
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u4FA1\u683C(\u5165)", React.createElement(FastInput, {
    value: f.priceIn || "",
    onChange: function(v) { return u("priceIn", v); },
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u4FA1\u683C(\u51FA)", React.createElement(FastInput, {
    value: f.priceOut || "",
    onChange: function(v) { return u("priceOut", v); },
    style: I
  })), React.createElement("label", {
    style: L
  }, "\u8A55\u4FA1(\u524D)", React.createElement("select", {
    value: f.gradeBefore || "B",
    onChange: function onChange(e) {
      return u("gradeBefore", e.target.value);
    },
    style: I
  }, GRADES.map(function (g) {
    return React.createElement("option", {
      key: g
    }, g);
  }))), React.createElement("label", {
    style: L
  }, "\u8A55\u4FA1(\u5F8C)", React.createElement("select", {
    value: f.gradeAfter || "B",
    onChange: function onChange(e) {
      return u("gradeAfter", e.target.value);
    },
    style: I
  }, GRADES.map(function (g) {
    return React.createElement("option", {
      key: g
    }, g);
  })))), React.createElement("label", {
    style: _objectSpread(_objectSpread({}, L), {}, {
      marginBottom: 8
    })
  }, "\u6839\u62E0\u30FB\u53CD\u7701", React.createElement(AutoTextarea, {
    value: f.memo || "",
    onChange: function onChange(e) {
      return u("memo", e.target.value);
    },
    placeholder: "",
    style: _objectSpread({}, I)
  })), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("button", {
    onClick: function onClick() {
      onUpdate(f);
      setEditing(false);
    },
    style: {
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: 600,
      background: "#1a1a1a",
      color: "#fff",
      border: "none",
      borderRadius: 5,
      cursor: "pointer",
      flex: 1
    }
  }, "\u4FDD\u5B58"), React.createElement("button", {
    onClick: function onClick() {
      setF(_objectSpread({}, t));
      setEditing(false);
    },
    style: {
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: 600,
      background: "#fff",
      color: "#666",
      border: "1px solid #ccc",
      borderRadius: 5,
      cursor: "pointer"
    }
  }, "\u30AD\u30E3\u30F3\u30BB\u30EB")));
  var Cell = function Cell(_ref39) {
    var label = _ref39.label,
      children = _ref39.children,
      w = _ref39.w;
    return React.createElement("div", {
      style: {
        minWidth: w || 60
      }
    }, React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#aaa",
        fontWeight: 600,
        marginBottom: 2
      }
    }, label), React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#333"
      }
    }, children));
  };
  return React.createElement("div", {
    style: {
      padding: "12px 0",
      borderBottom: "1px solid #f0eeea"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "flex-start",
      marginBottom: t.memo ? 6 : 0
    }
  }, React.createElement(Cell, {
    label: "\u9298\u67C4",
    w: 72
  }, React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, t.stock || "—")), React.createElement(Cell, {
    label: "\u58F2/\u8CB7",
    w: 48
  }, React.createElement(CPill, {
    label: t.type || "—",
    color: t.type === "空売" ? ["#FCEBEB", "#C0392B", "#791F1F"] : ["#EAF3DE", "#2E7D32", "#27500A"],
    sm: true
  })), React.createElement(Cell, {
    label: "\u6642\u9593",
    w: 80
  }, t.time || "—"), React.createElement(Cell, {
    label: "\u640D\u76CA"
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: pnl > 0 ? "#C0392B" : pnl < 0 ? "#1E8449" : "#888"
    }
  }, pnl > 0 ? "+" : "", pnl.toLocaleString(), "\u5186")), React.createElement(Cell, {
    label: "\u4FA1\u683C\uFF08\u5165\u2192\u51FA\uFF09",
    w: 100
  }, t.priceIn || "—", " \u2192 ", t.priceOut || "—"), React.createElement(Cell, {
    label: "\u8A55\u4FA1\uFF08\u524D\u2192\u5F8C\uFF09",
    w: 90
  }, t.gradeBefore || "—", " \u2192 ", t.gradeAfter || "—")), t.memo && React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#666",
      lineHeight: 1.7,
      paddingLeft: 6,
      borderLeft: "2px solid #e0ddd6",
      whiteSpace: "pre-wrap"
    }
  }, t.memo), t.signalId && React.createElement("div", {
    style: {
      marginTop: 6, padding: "4px 8px", background: "#FFEDD5",
      border: "1px solid #FB923C", borderRadius: 5, fontSize: 11,
      color: "#9A3412", fontWeight: 600, display: "inline-block"
    }
  }, "\uD83C\uDFAF \u30B7\u30B0\u30CA\u30EB\u8A18\u9332\u3042\u308A")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flexShrink: 0
    }
  }, date && custom && (function() {
    var info = _caGetStockInfo(t.stock, custom);
    if (!info.caTicker && !info.code) return null;
    return React.createElement("button", {
      onClick: function() { _caOpen(info.code, date); },
      title: "チャート分析ツールで開く",
      style: {
        padding: IS_TOUCH ? "8px 10px" : "5px 9px",
        background: "#EEF2FF",
        border: "1px solid #C7D2FE",
        color: "#4338CA",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 6
      }
    }, "\uD83D\uDCD0 \u5206\u6790");
  })(), React.createElement("button", {
    onClick: function onClick() {
      return setEditing(true);
    },
    style: {
      padding: IS_TOUCH ? "8px 12px" : "5px 10px",
      background: "#f5f4f0",
      border: "1px solid #ddd",
      color: "#555",
      cursor: "pointer",
      fontSize: 13,
      borderRadius: 6,
      fontWeight: 600
    }
  }, "\u270E\uFE0F"), React.createElement("button", {
    onClick: onDelete,
    style: {
      padding: IS_TOUCH ? "8px 12px" : "5px 10px",
      background: "none",
      border: "none",
      color: "#ccc",
      cursor: "pointer",
      fontSize: 16
    }
  }, "\u2715"))));
}
function CalendarPreview(_ref40) {
  var date = _ref40.date,
    data = _ref40.data,
    save = _ref40.save;
  if (!date) return null;
  var _useState125 = useState(null),
    _useState126 = _slicedToArray(_useState125, 2),
    viewTarget = _useState126[0],
    setViewTarget = _useState126[1],
    _useState127 = useState(null),
    _useState128 = _slicedToArray(_useState127, 2),
    annotTarget = _useState128[0],
    setAnnotTarget = _useState128[1];
  useModalBack(viewTarget != null, function(){ setViewTarget(null); }, "tv-view");
  useModalBack(annotTarget != null, function(){ setAnnotTarget(null); }, "tv-annot");
  var dd = data.trades[date] || {};
  var items = dd.items || [];
  
  
  var dayEvents = (function() {
    var out = [];
    var trades = (data && data.trades) || {};
    Object.keys(trades).forEach(function(dt) {
      var ev = trades[dt] && trades[dt].events;
      if (!Array.isArray(ev)) return;
      ev.forEach(function(e) {
        if (!e || e._deleted) return;
        var start = dt;
        var end = e.endDate && e.endDate >= start ? e.endDate : start;
        if (date >= start && date <= end) out.push(e);
      });
    });
    out.sort(function(a, b) {
      
      var _tk = function(ev) {
        if (!ev) return 99999;
        if (ev.allDay) return -1;
        var t = ev.startTime || "";
        var mm = /^(\d{1,2}):(\d{2})/.exec(t);
        if (!mm) return -1;
        return parseInt(mm[1], 10) * 60 + parseInt(mm[2], 10);
      };
      var ta = _tk(a), tb = _tk(b);
      if (ta !== tb) return ta - tb;
      var ia = (a && a.id) || 0, ib = (b && b.id) || 0;
      return ia < ib ? -1 : ia > ib ? 1 : 0;
    });
    return out;
  })();
  var eventCategories = (data && data.custom && Array.isArray(data.custom.eventCategories) && data.custom.eventCategories.length > 0)
    ? data.custom.eventCategories
    : [{ id: "evcat_other", name: "\u305D\u306E\u4ED6", color: "#6366F1" }];
  var pnl = items.reduce(function (s, t) {
    return s + (Number(t.pnl) || 0);
  }, 0);
  var w = items.filter(function (t) {
      return Number(t.pnl) > 0;
    }).length,
    l = items.filter(function (t) {
      return Number(t.pnl) < 0;
    }).length;
  var dow = DAYS_JP[new Date(date + "T00:00:00").getDay()];
  var hasChartContent = function hasChartContent(c) {
    return !!(c && (c.chartImg || c.macroLocal || c.flowCodes && c.flowCodes.length || (c.stockTags && c.stockTags.length || c.chartShapeTags && c.chartShapeTags.length) || c.signals && c.signals.length || (c.chartMemoHtml && c.chartMemoHtml.length > 0) || c.chartMemo && (_hasText(c.chartMemo.text) || c.chartMemo.images && c.chartMemo.images.length)));
  };
  var chartKeys = Object.keys(data.charts).filter(function (k) {
    return k.endsWith("_" + date) && hasChartContent(data.charts[k]);
  });
  var nikkeiChart = data.charts["日経平均株価_" + date];
  var allNewsCatsData = getAllNewsCatsData(dd);
  var allMktTags = _toConsumableArray(new Set(Object.values(allNewsCatsData).flatMap(function (c) {
    return [].concat(_toConsumableArray(c.marketTags || []), _toConsumableArray((c.newsItems || []).flatMap(function (n) {
      return n.tags || [];
    })));
  })));
  var hasNewsContent = Object.values(allNewsCatsData).some(hasCatContent);
  var hasAny = chartKeys.length > 0 || items.length > 0 || hasNewsContent || dayEvents.length > 0;
  var SH = function SH(_ref41) {
    var icon = _ref41.icon,
      label = _ref41.label;
    return React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: "#888",
        marginBottom: 5,
        marginTop: 10,
        display: "flex",
        alignItems: "center",
        gap: 3
      }
    }, icon, " ", label);
  };

  
  var openImgs = function openImgs(imgs, idx, onUpdate) {
    return setViewTarget({
      imgs: imgs,
      idx: idx,
      onUpdate: save ? onUpdate : null
    });
  };

  
  var updateNewsImg = function updateNewsImg(cat, niId, imgIdx, ed) {
    if (!save) return;
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var allCats = getAllNewsCatsData(prevDd);
      var catData = allCats[cat] || {};
      var newItems = (catData.newsItems || []).map(function (n) {
        if (n.id !== niId) return n;
        var imgs = _toConsumableArray(n.images || []);
        imgs[imgIdx] = ed;
        return _objectSpread(_objectSpread({}, n), {}, {
          images: imgs
        });
      });
      var newCats = _objectSpread(_objectSpread({}, allCats), {}, _defineProperty({}, cat, _objectSpread(_objectSpread({}, catData), {}, {
        newsItems: newItems
      })));
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, {
          newsCats: newCats
        })))
      });
    });
  };
  
  var updateNewsMemoImg = function updateNewsMemoImg(cat, imgIdx, ed) {
    if (!save) return;
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var allCats = getAllNewsCatsData(prevDd);
      var catData = allCats[cat] || {};
      var memo = catData.newsMemo || {
        text: "",
        images: []
      };
      var imgs = _toConsumableArray(memo.images || []);
      imgs[imgIdx] = ed;
      var newCats = _objectSpread(_objectSpread({}, allCats), {}, _defineProperty({}, cat, _objectSpread(_objectSpread({}, catData), {}, {
        newsMemo: _objectSpread(_objectSpread({}, memo), {}, {
          images: imgs
        })
      })));
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, {
          newsCats: newCats
        })))
      });
    });
  };
  
  var updateChartImg = function updateChartImg(chartKey, ed) {
    if (!save) return;
    save(function(prevData) {
      return _objectSpread(_objectSpread({}, prevData), {}, {
        charts: _objectSpread(_objectSpread({}, prevData.charts), {}, _defineProperty({}, chartKey, _objectSpread(_objectSpread({}, (prevData.charts && prevData.charts[chartKey]) || {}), {}, {
          chartImg: ed
        })))
      });
    });
  };
  
  var updateChartMemoImg = function updateChartMemoImg(chartKey, imgIdx, ed) {
    if (!save) return;
    save(function(prevData) {
      var c = (prevData.charts && prevData.charts[chartKey]) || {};
      var memo = c.chartMemo || {
        text: "",
        images: []
      };
      var imgs = _toConsumableArray(memo.images || []);
      imgs[imgIdx] = ed;
      return _objectSpread(_objectSpread({}, prevData), {}, {
        charts: _objectSpread(_objectSpread({}, prevData.charts), {}, _defineProperty({}, chartKey, _objectSpread(_objectSpread({}, c), {}, {
          chartMemo: _objectSpread(_objectSpread({}, memo), {}, {
            images: imgs
          })
        })))
      });
    });
  };
  
  var updateTradeMemoImg = function updateTradeMemoImg(imgIdx, ed) {
    if (!save) return;
    var memo = dd.tradesMemo || {
      text: "",
      images: []
    };
    var imgs = _toConsumableArray(memo.images || []);
    imgs[imgIdx] = ed;
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var prevMemo = prevDd.tradesMemo || {
        text: "",
        images: []
      };
      var prevImgs = _toConsumableArray(prevMemo.images || []);
      prevImgs[imgIdx] = ed;
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, {
          tradesMemo: _objectSpread(_objectSpread({}, prevMemo), {}, {
            images: prevImgs
          })
        })))
      });
    });
  };

  
  var ImgRow = function ImgRow(_ref42) {
    var images = _ref42.images,
      onUpdate = _ref42.onUpdate;
    if (!images || !images.length) return null;
    return React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 6
      }
    }, images.map(function (img, i) {
      return React.createElement("div", {
        key: i,
        style: { position: "relative" }
      }, React.createElement(ImgThumb, {
        img: img,
        onClick: function onClick() {
          if (save && onUpdate) {
            return setAnnotTarget({
              img: img,
              onSave: function onSave(ed) {
                return onUpdate(i, ed);
              }
            });
          }
          return openImgs(images, i, onUpdate);
        },
        imgStyle: {
          height: IMG_H,
          borderRadius: 5,
          cursor: (save && onUpdate) ? "pointer" : "zoom-in",
          border: "1px solid #e0ddd6"
        }
      }));
    }));
  };
  return React.createElement("div", null, viewTarget && function () {
    var vt = viewTarget,
      imgs = vt.imgs,
      i = vt.idx,
      img = imgs[i];
    if (!img) return null;
    var src = imgSrc(img);
    var ap = vt.onUpdate ? {
      img: img,
      onSave: function onSave(ed) {
        vt.onUpdate(i, ed);
        setViewTarget(function (t) {
          return _objectSpread(_objectSpread({}, t), {}, {
            imgs: t.imgs.map(function (x, j) {
              return j === i ? ed : x;
            })
          });
        });
      }
    } : null;
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
      navLabel: imgs.length > 1 ? i + 1 + "/" + imgs.length : null
    });
  }(), annotTarget && React.createElement(ImageAnnotator, {
    img: annotTarget.img,
    onSave: function onSave(ed) {
      annotTarget.onSave(ed);
      setAnnotTarget(null);
    },
    onClose: function onClose() {
      return setAnnotTarget(null);
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
      paddingBottom: 8,
      borderBottom: "1px solid #f0eeea",
      flexWrap: "wrap"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, date, "\uFF08", dow, "\uFF09"), nikkeiChart && nikkeiChart.macroLocal && React.createElement(React.Fragment, null, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#888"
    }
  }, "\u65E5\u7D4C:"), React.createElement(CPill, {
    label: nikkeiChart.macroLocal,
    color: getMC(nikkeiChart.macroLocal)
  })), !hasAny && React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#ccc",
      marginLeft: 8
    }
  }, "\u30C7\u30FC\u30BF\u306A\u3057")),
  
  dayEvents.length > 0 && React.createElement("div", {
    style: { marginBottom: 10 }
  },
    React.createElement(SH, {
      icon: "\uD83D\uDCC5",
      label: "\u4ECA\u65E5\u306E\u4E88\u5B9A"
    }),
    React.createElement("div", {
      style: { display: "flex", flexDirection: "column", gap: 4 }
    },
      dayEvents.map(function(ev, ei) {
        var bg = getEventColor(ev, eventCategories);
        var catName = getEventCategoryName(ev, eventCategories);
        var title = ev.title || (ev.contentHtml ? stripHtml(ev.contentHtml).slice(0, 40) : (ev.content || "(\u7121\u984C)").slice(0, 40));
        var timeLabel = "";
        if (ev.allDay !== false && !ev.startTime && !ev.endTime) {
          timeLabel = "\u7D42\u65E5";
        } else if (ev.startTime && ev.endTime) {
          timeLabel = ev.startTime + "\u301C" + ev.endTime;
        } else if (ev.startTime) {
          timeLabel = ev.startTime + "\u301C";
        } else if (ev.endTime) {
          timeLabel = "\u301C" + ev.endTime;
        }
        return React.createElement("div", {
          key: ev.id != null ? ev.id : ei,
          style: {
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 6,
            background: "#fafaf8", border: "1px solid #eeece6",
            borderLeft: "4px solid " + bg
          }
        },
          React.createElement("div", {
            style: { fontSize: 11, color: "#888", fontWeight: 600, minWidth: 80, fontVariantNumeric: "tabular-nums" }
          }, timeLabel),
          React.createElement("div", {
            style: { fontSize: 13, fontWeight: 600, color: "#1a1a1a", flex: 1, wordBreak: "break-word" }
          }, title),
          catName && React.createElement("span", {
            style: {
              fontSize: 10, fontWeight: 600, padding: "1px 7px",
              background: bg, color: "#fff", borderRadius: 10, flexShrink: 0
            }
          }, catName)
        );
      })
    )
  ),
  hasNewsContent && React.createElement("div", null, React.createElement(SH, {
    icon: "\uD83D\uDCF0",
    label: "\u30CB\u30E5\u30FC\u30B9\u30FB\u5E02\u5834\u6750\u6599"
  }), allMktTags.length > 0 && React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 2,
      marginBottom: 6
    }
  }, allMktTags.map(function (t) {
    return React.createElement("span", {
      key: t,
      style: {
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 600,
        background: "#EEF4FF",
        color: "#1a1a1a",
        border: "1px solid #7A9CC8",
        margin: "1px"
      }
    }, stripCat(t));
  })), Object.entries(allNewsCatsData).map(function (_ref43) {
    var _ref44 = _slicedToArray(_ref43, 2),
      cat = _ref44[0],
      cd = _ref44[1];
    var catItems = (cd.newsItems || []).filter(function (n) {
      return n.images && n.images.length;
    });
    if (!catItems.length) return null;
    return React.createElement("div", {
      key: cat,
      style: { marginBottom: 8 }
    },
    React.createElement("div", {
      style: { fontSize: 11, fontWeight: 700, color: "#6366F1", marginBottom: 3 }
    }, "\u3010", cat, "\u3011"),
    React.createElement("div", {
      style: { display: "flex", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }
    }, catItems.map(function (n, i) {
      return (n.images || []).map(function (img, j) {
        return React.createElement("img", {
          key: i + "-" + j,
          src: imgSrc(img),
          style: { height: 160, borderRadius: 6, flexShrink: 0, cursor: "pointer", objectFit: "cover" },
          onClick: function() {
            return openImgs(n.images, j, function(i2, ed) { return updateNewsImg(cat, n.id, i2, ed); });
          }
        });
      });
    })));
  })), chartKeys.length > 0 && React.createElement("div", null, React.createElement(SH, {
    icon: "\uD83D\uDCCA",
    label: "\u30C1\u30E3\u30FC\u30C8\u5206\u6790"
  }), chartKeys.map(function (k) {
    var c = data.charts[k],
      s = k.replace(/_\d{4}-\d{2}-\d{2}$/, "");
    var chartImg = c && c.chartImg;
    var chartSrc = chartImg ? imgSrc(chartImg) : null;
    var hasMemo = c && ((c.chartMemoHtml && c.chartMemoHtml.length > 0) || (c.chartMemo && (_hasText(c.chartMemo.text) || c.chartMemo.images && c.chartMemo.images.length)));
    return React.createElement("div", {
      key: k,
      style: {
        background: "#f5f4f0",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 6
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
        flexWrap: "wrap"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700
      }
    }, s), c && c.macroLocal && React.createElement(CPill, {
      label: c.macroLocal,
      color: getMC(c.macroLocal),
      sm: true
    }), React.createElement(FlowChips, {
      codes: c && c.flowCodes || [],
      tiny: true
    })), chartSrc && React.createElement("div", {
      style: {
        position: "relative",
        display: "inline-block",
        maxWidth: "100%"
      }
    }, React.createElement("img", {
      src: chartSrc,
      onClick: function onClick() {
        return openImgs([chartImg], 0, function (i, ed) {
          return updateChartImg(k, ed);
        });
      },
      style: {
        maxWidth: "100%",
        maxHeight: 300,
        borderRadius: 6,
        display: "block",
        cursor: "zoom-in",
        border: "1px solid #e0ddd6",
        marginBottom: 6
      },
      alt: ""
    }), save && React.createElement("button", {
      onClick: function onClick() {
        return setAnnotTarget({
          img: chartImg,
          onSave: function onSave(ed) {
            return updateChartImg(k, ed);
          }
        });
      },
      style: {
        position: "absolute",
        top: 4,
        right: 4,
        padding: "4px 8px",
        fontSize: 11,
        fontWeight: 700,
        background: "#6366F1",
        color: "#fff",
        border: "none",
        borderRadius: 5,
        cursor: "pointer"
      }
    }, "\u270E\uFE0F")), c && (((c.stockTags && c.stockTags.length || c.chartShapeTags && c.chartShapeTags.length) > 0) || (c.chartShapeTags && c.chartShapeTags.length > 0)) && React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        marginBottom: 4
      }
    }, [].concat(_toConsumableArray(c.chartShapeTags || []), _toConsumableArray(c.stockTags || [])).map(function (t) {
      return React.createElement("span", {
        key: t,
        style: {
          padding: "2px 7px",
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 600,
          background: "#EEF4FF",
          color: "#1a1a1a",
          border: "1px solid #7A9CC8"
        }
      }, stripCat(t));
    })), hasMemo && React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#666",
        paddingLeft: 6,
        borderLeft: "2px solid #e0ddd6"
      }
    }, c.chartMemo && _hasText(c.chartMemo.text) && React.createElement("div", {
      style: {
        lineHeight: 1.7,
        fontStyle: "italic",
        whiteSpace: "pre-wrap"
      }
    }, (c.chartMemo && c.chartMemo.text) || ""), React.createElement(ImgRow, {
      images: (c.chartMemo && c.chartMemo.images) || [],
      onUpdate: function onUpdate(imgIdx, ed) {
        return updateChartMemoImg(k, imgIdx, ed);
      }
    })));
  })), items.length > 0 && React.createElement("div", null, React.createElement(SH, {
    icon: "\uD83D\uDCCB",
    label: "\u53D6\u5F15\u8A18\u9332"
  }), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: pnl > 0 ? "#C0392B" : pnl < 0 ? "#1E8449" : "#888"
    }
  }, pnl > 0 ? "+" : "", pnl.toLocaleString(), "\u5186"), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#999"
    }
  }, items.length, "\u4EF6 ", w, "\u52DD", l, "\u6557")), items.map(function (t) {
    return React.createElement("div", {
      key: t.id,
      style: {
        fontSize: 12,
        background: "#f5f4f0",
        borderRadius: 6,
        padding: "6px 9px",
        marginBottom: 4
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 700
      }
    }, t.stock), React.createElement(CPill, {
      label: t.type,
      color: t.type === "空売" ? ["#FCEBEB", "#C0392B", "#791F1F"] : ["#EAF3DE", "#2E7D32", "#27500A"],
      sm: true
    }), t.time && React.createElement("span", {
      style: {
        color: "#888"
      }
    }, t.time), (t.priceIn || t.priceOut) && React.createElement("span", {
      style: {
        color: "#777"
      }
    }, t.priceIn || "—", "\u2192", t.priceOut || "—"), React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontWeight: 700,
        color: Number(t.pnl) > 0 ? "#C0392B" : Number(t.pnl) < 0 ? "#1E8449" : "#888"
      }
    }, Number(t.pnl) > 0 ? "+" : "", t.pnl, "\u5186")), t.memo && React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#666",
        marginTop: 3,
        lineHeight: 1.6,
        paddingLeft: 4,
        borderLeft: "2px solid #ddd",
        whiteSpace: "pre-wrap"
      }
    }, t.memo));
  }), _hasText(dd.summary) && React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#888",
      marginTop: 6,
      fontStyle: "italic",
      lineHeight: 1.7
    }
  }, "\uD83D\uDCAD ", dd.summary), dd.tradesMemo && (_hasText(dd.tradesMemo.text) || dd.tradesMemo.images && dd.tradesMemo.images.length) && React.createElement("div", {
    style: {
      marginTop: 6,
      paddingLeft: 6,
      borderLeft: "2px solid #e0ddd6"
    }
  }, _hasText(dd.tradesMemo.text) && React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#666",
      lineHeight: 1.7,
      fontStyle: "italic",
      whiteSpace: "pre-wrap"
    }
  }, dd.tradesMemo.text), React.createElement(ImgRow, {
    images: dd.tradesMemo.images || [],
    onUpdate: function onUpdate(imgIdx, ed) {
      return updateTradeMemoImg(imgIdx, ed);
    }
  }))));
}
function SearchView(_ref45) {
  var data = _ref45.data,
    save = _ref45.save,
    onSelectDate = _ref45.onSelectDate,
    onClose = _ref45.onClose;
  var custom = data.custom || EMPTY.custom;
  var pool = makeTagPoolHandlers(data, save, custom);
  var deleteExtraTag = function deleteExtraTag(tag) {
    var ch = _objectSpread({}, data.charts),
      tr = _objectSpread({}, data.trades);
    Object.keys(ch).forEach(function (k) {
      if (ch[k].stockTags) ch[k] = _objectSpread(_objectSpread({}, ch[k]), {}, {
        stockTags: ch[k].stockTags.filter(function (t) {
          return t !== tag;
        })
      });
    });
    Object.keys(tr).forEach(function (k) {
      var dd = tr[k];
      if (dd.newsCats) {
        var nc = {};
        Object.entries(dd.newsCats).forEach(function (_ref46) {
          var _ref47 = _slicedToArray(_ref46, 2),
            cat = _ref47[0],
            cd = _ref47[1];
          nc[cat] = _objectSpread(_objectSpread({}, cd), {}, {
            marketTags: (cd.marketTags || []).filter(function (t) {
              return t !== tag;
            })
          });
        });
        tr[k] = _objectSpread(_objectSpread({}, dd), {}, {
          newsCats: nc
        });
      }
    });
    save(_objectSpread(_objectSpread({}, data), {}, {
      charts: ch,
      trades: tr
    }), { immediate: true });
  };
  var _useState129 = useState(""),
    _useState130 = _slicedToArray(_useState129, 2),
    keyword = _useState130[0],
    setKeyword = _useState130[1],
    _useState131 = useState([]),
    _useState132 = _slicedToArray(_useState131, 2),
    selTags = _useState132[0],
    setSelTags = _useState132[1],
    _useState133 = useState(null),
    _useState134 = _slicedToArray(_useState133, 2),
    enlarged = _useState134[0],
    setEnlarged = _useState134[1],
    _useState135 = useState(null),
    _useState136 = _slicedToArray(_useState135, 2),
    searchDlg = _useState136[0],
    setSearchDlg = _useState136[1];
  useModalBack(enlarged != null, function(){ setEnlarged(null); }, "search-enlarged");
  useModalBack(searchDlg != null, function(){ setSearchDlg(null); }, "search-dlg");
  var togTag = function togTag(tag) {
    return setSelTags(function (p) {
      return p.includes(tag) ? p.filter(function (t) {
        return t !== tag;
      }) : [].concat(_toConsumableArray(p), [tag]);
    });
  };
  var allDates = function () {
    var s = new Set(Object.keys(data.trades));
    Object.keys(data.charts).forEach(function (k) {
      var m = k.match(/(\d{4}-\d{2}-\d{2})$/);
      if (m) s.add(m[1]);
    });
    return Array.from(s).sort().reverse();
  }();
  var results = keyword || selTags.length > 0 ? allDates.filter(function (date) {
    var dd = data.trades[date] || {},
      chartKeys = Object.keys(data.charts).filter(function (k) {
        return k.endsWith("_" + date);
      }),
      chartArr = chartKeys.map(function (k) {
        return data.charts[k];
      });
    var allCatsData = getAllNewsCatsData(dd);
    var allNewsText = Object.values(allCatsData).flatMap(function (c) {
      return (c.newsItems || []).map(function (n) {
        return stripHtml(n.text) || "";
      });
    });
    var allMTags = Object.values(allCatsData).flatMap(function (c) {
      return c.marketTags || [];
    });
    var allS = chartArr.flatMap(function (c) {
      return c && c.stockTags || [];
    });
    if (keyword) {
      var kw = keyword.toLowerCase();
      var hay = [dd.summary || ""].concat(_toConsumableArray(allNewsText), _toConsumableArray((dd.items || []).map(function (t) {
        return (t.memo || " ") + (t.stock || "");
      })), _toConsumableArray(allMTags), _toConsumableArray(allMTags.map(stripCat)), _toConsumableArray(allS), _toConsumableArray(allS.map(stripCat)), _toConsumableArray(chartArr.flatMap(function (c) {
        return [].concat(_toConsumableArray(c && c.flowCodes || []), [stripHtml(c && c.chartMemo && c.chartMemo.text)]);
      })), _toConsumableArray(chartKeys.map(function (k) {
        return k.replace(/_\d{4}-\d{2}-\d{2}$/, "");
      })), _toConsumableArray(chartArr.flatMap(function (c) {
        return (c && c.signals || []).flatMap(function(s) {
          return [s.tag || "", s.customTagText || "", s.rationale || "", s.reflection || "", s.tradeType || ""];
        });
      }))).join(" ").toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    var _iterator = _createForOfIteratorHelper(selTags),
      _step;
    try {
      var _loop = function _loop() {
          var tag = _step.value;
          if (tag.startsWith("__macro:")) {
            var lvl = tag.slice(8);
            if (!chartArr.some(function (c) {
              return c && c.macroLocal === lvl;
            })) return {
              v: false
            };
          } else if (tag.startsWith("__flow:")) {
            var flow = tag.slice(7);
            if (!chartArr.some(function (c) {
              return c && c.flowCodes && c.flowCodes.includes(flow);
            })) return {
              v: false
            };
          } else if (tag.startsWith("__signal:")) {
            var sig = tag.slice(9);
            if (!chartArr.some(function (c) {
              return c && (c.signals || []).some(function(s) { return s.tag === sig; });
            })) return {
              v: false
            };
          } else if (tag.startsWith("__tradetype:")) {
            var tt = tag.slice(12);
            if (!chartArr.some(function (c) {
              return c && (c.signals || []).some(function(s) { return s.tradeType === tt; });
            })) return { v: false };
          } else if (tag.startsWith("__result:")) {
            var res = tag.slice(9);
            if (!chartArr.some(function (c) {
              return c && (c.signals || []).some(function(s) { return s.result === res; });
            })) return { v: false };
          } else if (tag.startsWith("__entered:")) {
            var entVal = tag.slice(10) === "true";
            if (!chartArr.some(function (c) {
              return c && (c.signals || []).some(function(s) { return _elIsEntered(s, null) === entVal; });
            })) return { v: false };
          } else {
            var inM = allMTags.includes(tag),
              inS = allS.includes(tag);
            if (!inM && !inS) return {
              v: false
            };
          }
        },
        _ret;
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        _ret = _loop();
        if (_ret) return _ret.v;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return true;
  }) : [];
  var determineTab = function determineTab(date) {
    var dd = data.trades[date] || {};
    var chartKeys = Object.keys(data.charts).filter(function (k) {
      return k.endsWith("_" + date);
    });
    var chartArr = chartKeys.map(function (k) {
      return data.charts[k];
    });
    var allCatsData = getAllNewsCatsData(dd);
    var allMTags = Object.values(allCatsData).flatMap(function (c) {
      return c.marketTags || [];
    });
    var _iterator2 = _createForOfIteratorHelper(selTags),
      _step2;
    try {
      var _loop2 = function _loop2() {
          var tag = _step2.value;
          if (tag.startsWith("__macro:") || tag.startsWith("__flow:")) return {
            v: "charts"
          };
          if (tag.startsWith("__signal:") || tag.startsWith("__tradetype:") || tag.startsWith("__result:") || tag.startsWith("__entered:")) return {
            v: "charts"
          };
          if (allMTags.includes(tag)) return {
            v: "news"
          };
          if (chartArr.some(function (c) {
            return c && (c.stockTags || []).includes(tag);
          })) return {
            v: "charts"
          };
        },
        _ret2;
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        _ret2 = _loop2();
        if (_ret2) return _ret2.v;
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    if (keyword) {
      var kw = keyword.toLowerCase();
      var allNewsText = Object.values(allCatsData).flatMap(function (c) {
        return (c.newsItems || []).map(function (n) {
          return stripHtml(n.text) || "";
        });
      });
      if (allNewsText.some(function (t) {
        return t.toLowerCase().includes(kw);
      })) return "news";
      if (allMTags.some(function (t) {
        return t.toLowerCase().includes(kw) || stripCat(t).toLowerCase().includes(kw);
      })) return "news";
      if (chartArr.some(function (c) {
        return c && ((c.flowCodes || []).some(function (f) {
          return f.toLowerCase().includes(kw);
        }) || (c.stockTags || []).some(function (t) {
          return t.toLowerCase().includes(kw);
        }) || stripHtml(c.chartMemo && c.chartMemo.text).toLowerCase().includes(kw));
      })) return "charts";
      if (chartKeys.some(function (k) {
        return k.replace(/_\d{4}-\d{2}-\d{2}$/, "").toLowerCase().includes(kw);
      })) return "charts";
      if (chartArr.some(function (c) {
        return c && (c.signals || []).some(function(s) {
          return (s.rationale || "").toLowerCase().includes(kw) || (s.reflection || "").toLowerCase().includes(kw) || (s.tradeType || "").toLowerCase().includes(kw);
        });
      })) return "charts";
      if ((dd.items || []).some(function (t) {
        return (t.memo || "").toLowerCase().includes(kw) || (t.stock || "").toLowerCase().includes(kw);
      })) return "trades";
      if ((dd.summary || "").toLowerCase().includes(kw)) return "trades";
    }
    return "news";
  };
  var hasTags = Object.keys(custom.cats || {}).length > 0 || (custom.tags || []).length > 0;
  var allDataTagsSet = new Set();
  Object.values(data.trades).forEach(function (dd) {
    Object.values(getAllNewsCatsData(dd)).forEach(function (c) {
      return (c.marketTags || []).forEach(function (t) {
        return allDataTagsSet.add(t);
      });
    });
  });
  Object.values(data.charts).forEach(function (c) {
    return (c.stockTags || []).forEach(function (t) {
      return allDataTagsSet.add(t);
    });
  });
  var poolTagsSet = new Set();
  Object.entries(custom.cats || {}).forEach(function (_ref48) {
    var _ref49 = _slicedToArray(_ref48, 2),
      cat = _ref49[0],
      items = _ref49[1];
    return (items || []).forEach(function (item) {
      return poolTagsSet.add(cat + ":" + item);
    });
  });
  (custom.tags || []).forEach(function (t) {
    return poolTagsSet.add(t);
  });
  var extraTags = Array.from(allDataTagsSet).filter(function (t) {
    return !poolTagsSet.has(t);
  });
  var TC = function TC(_ref50) {
    var tagKey = _ref50.tagKey,
      label = _ref50.label,
      color = _ref50.color,
      onDel = _ref50.onDel;
    var on = selTags.includes(tagKey);
    var _customTagColor = custom && custom.tagColors && custom.tagColors[tagKey];
    var _color3 = _customTagColor
      ? _tagColorTriple(_customTagColor, on)
      : _slicedToArray(color, 3);
    var bg = _color3[0], bd = _color3[1], fg = _color3[2];
    return React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "stretch",
        margin: "3px"
      }
    }, React.createElement("span", {
      onClick: function onClick() {
        return togTag(tagKey);
      },
      style: _objectSpread(_objectSpread({
        display: "inline-block",
        padding: IS_TOUCH ? "7px 14px" : "5px 12px",
        borderRadius: onDel ? "7px 0 0 7px" : "7px",
        fontSize: 12,
        fontWeight: 600,
        background: on ? bg : "#fff",
        color: on ? fg : "#555",
        border: "1.5px solid " + (on ? bd : "#ddd")
      }, onDel ? {
        borderRight: "none"
      } : {}), {}, {
        cursor: "pointer",
        userSelect: "none",
        boxShadow: on ? "0 1px 4px rgba(0,0,0,.12)" : "none"
      })
    }, label), onDel && React.createElement("span", {
      onClick: function onClick(e) {
        e.stopPropagation();
        setSearchDlg({
          msg: "「" + label + "」タグを削除しますか？",
          fn: onDel
        });
      },
      style: {
        display: "flex",
        alignItems: "center",
        padding: IS_TOUCH ? "0 12px" : "0 7px",
        borderRadius: "0 7px 7px 0",
        background: "#f5f5f5",
        border: "1.5px solid #ddd",
        borderLeft: "1px solid #eee",
        cursor: "pointer",
        fontSize: IS_TOUCH ? 13 : 10,
        color: "#bbb"
      },
      onMouseEnter: function onMouseEnter(e) {
        e.currentTarget.style.background = "#FCEBEB";
        e.currentTarget.style.color = "#C0392B";
      },
      onMouseLeave: function onMouseLeave(e) {
        e.currentTarget.style.background = "#f5f5f5";
        e.currentTarget.style.color = "#bbb";
      }
    }, "\u2715"));
  };
  var SH = function SH(_ref51) {
    var label = _ref51.label;
    return React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#777",
        fontWeight: 700,
        marginBottom: 6,
        marginTop: 12,
        paddingBottom: 4,
        borderBottom: "1px solid #eee"
      }
    }, label);
  };
  return React.createElement("div", null, enlarged && React.createElement(ZoomLightbox, {
    src: enlarged,
    onClose: function onClose() {
      return setEnlarged(null);
    }
  }), searchDlg && React.createElement(DeleteDlg, {
    msg: searchDlg.msg,
    onOk: function onOk() {
      searchDlg.fn();
      setSearchDlg(null);
    },
    onCancel: function onCancel() {
      return setSearchDlg(null);
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 14
    }
  }, React.createElement("button", {
    onClick: onClose,
    style: {
      padding: "8px 16px",
      fontSize: 16,
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: 7,
      cursor: "pointer",
      minHeight: 40
    }
  }, "\u2190"), React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 18,
      fontWeight: 700
    }
  }, "\uD83D\uDD0D \u691C\u7D22"), selTags.length > 0 && React.createElement("button", {
    onClick: function onClick() {
      return setSelTags([]);
    },
    style: {
      fontSize: 12,
      color: "#6366F1",
      background: "#EEF2FF",
      border: "1px solid #C7D2FE",
      borderRadius: 6,
      padding: "6px 12px",
      cursor: "pointer"
    }
  }, "\u30AF\u30EA\u30A2(", selTags.length, ")")), React.createElement(FastInput, {
    value: keyword,
    onChange: function(v) { return setKeyword(v); },
    debounceMs: 300,
    placeholder: "\u30AD\u30FC\u30EF\u30FC\u30C9\u691C\u7D22\uFF08\u9298\u67C4\u30FB\u30BF\u30B0\u30FB\u30CB\u30E5\u30FC\u30B9\u30FB\u30E1\u30E2...\uFF09",
    style: {
      width: "100%",
      padding: "11px 14px",
      border: "2px solid #6366F1",
      borderRadius: 9,
      fontSize: 14,
      outline: "none",
      marginBottom: 14
    }
  }), React.createElement("div", {
    style: {
      background: "#f8f7f4",
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#444"
    }
  }, "\u30BF\u30B0\u3067\u7D5E\u308A\u8FBC\u307F ", React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 400,
      color: "#aaa"
    }
  }, "\u8907\u6570\u2192AND\u691C\u7D22")), React.createElement(SH, {
    label: "\uD83D\uDCC8 \u5730\u5408\u3044"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 1
    }
  }, MACRO_LEVELS.map(function (l) {
    return React.createElement(TC, {
      key: l,
      tagKey: "__macro:" + l,
      label: MACRO_LABELS[l],
      color: getMC(l)
    });
  })), (hasTags || extraTags.length > 0) && React.createElement(React.Fragment, null, React.createElement(SH, {
    label: "\uD83C\uDFF7\uFE0F \u6750\u6599\u30BF\u30B0"
  }), Object.entries(custom.cats || {}).map(function (_ref52) {
    var _ref53 = _slicedToArray(_ref52, 2),
      cat = _ref53[0],
      items = _ref53[1];
    return React.createElement("div", {
      key: cat,
      style: {
        marginBottom: 4
      }
    }, React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#333",
        marginRight: 5,
        fontWeight: 600
      }
    }, cat), (items || []).map(function (item) {
      var tag = cat + ":" + item;
      return React.createElement(TC, {
        key: tag,
        tagKey: tag,
        label: item,
        color: TAG_SEL,
        onDel: function onDel() {
          return pool.onDelTagFromCat(cat, item);
        }
      });
    }));
  }), (custom.tags || []).map(function (tag) {
    return React.createElement(TC, {
      key: tag,
      tagKey: tag,
      label: stripCat(tag),
      color: TAG_SEL,
      onDel: function onDel() {
        return pool.onDelTag(tag);
      }
    });
  }), extraTags.length > 0 && React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, extraTags.map(function (tag) {
    return React.createElement(TC, {
      key: tag,
      tagKey: tag,
      label: stripCat(tag),
      color: TAG_SEL,
      onDel: function onDel() {
        return deleteExtraTag(tag);
      }
    });
  }))), React.createElement(SH, {
    label: "\uD83D\uDD37 \u5BC4\u308A\u4ED8\u304D\u5F62\u72B6"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 1
    }
  }, [].concat(OPEN_TAGS, _toConsumableArray(custom.flowOpenTags || [])).map(function (t) {
    return React.createElement(TC, {
      key: t,
      tagKey: "__flow:" + t,
      label: t,
      color: getFC(t)
    });
  })), React.createElement(SH, {
    label: "\uD83D\uDCC9 \u5024\u52D5\u304D\u5F62\u72B6"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 1
    }
  }, [].concat(MOVE_TAGS, _toConsumableArray(custom.flowMoveTags || [])).map(function (t) {
    return React.createElement(TC, {
      key: t,
      tagKey: "__flow:" + t,
      label: t,
      color: getFC(t)
    });
  })),
  
  (custom.signalTags || []).length > 0 && React.createElement(React.Fragment, null,
    React.createElement(SH, { label: "\uD83C\uDFAF \u30A8\u30F3\u30C8\u30EA\u30FC\u5206\u6790" }),
    React.createElement("div", { style:{display:"flex",flexWrap:"wrap",gap:1} },
      (custom.signalTags || []).map(function(t) {
        return React.createElement(TC, {
          key: "__signal:" + t,
          tagKey: "__signal:" + t,
          label: t,
          color: ["#FFEDD5","#FB923C","#9A3412"]
        });
      })
    )
  ),
  React.createElement(SH, { label: "📊 売買・結果" }),
  React.createElement("div", { style:{display:"flex",flexWrap:"wrap",gap:1} },
    React.createElement(TC, { tagKey: "__tradetype:空売", label: "空売", color: ["#FCEBEB","#F5C6CB","#C0392B"] }),
    React.createElement(TC, { tagKey: "__tradetype:買い", label: "買い", color: ["#EAF3DE","#A9DFBF","#1E8449"] }),
    React.createElement(TC, { tagKey: "__result:ok", label: "成功", color: ["#EAF3DE","#A9DFBF","#1E8449"] }),
    React.createElement(TC, { tagKey: "__result:ng", label: "失敗", color: ["#FCEBEB","#F5C6CB","#C0392B"] }),
    React.createElement(TC, { tagKey: "__entered:true", label: "実エントリー", color: ["#E8F5E9","#A9DFBF","#2E7D32"] }),
    React.createElement(TC, { tagKey: "__entered:false", label: "見送り", color: ["#f5f4f0","#ddd","#888"] })
  )
  ), (keyword || selTags.length > 0) && React.createElement("div", null,
  
  selTags.some(function(t){ return t.startsWith("__signal:") || t.startsWith("__tradetype:") || t.startsWith("__result:") || t.startsWith("__entered:"); }) && (function() {
    var sigTags = selTags.filter(function(t){ return t.startsWith("__signal:"); }).map(function(t){ return t.slice(9); });
    var ttFilters = selTags.filter(function(t){ return t.startsWith("__tradetype:"); }).map(function(t){ return t.slice(12); });
    var resFilters = selTags.filter(function(t){ return t.startsWith("__result:"); }).map(function(t){ return t.slice(9); });
    var entFilters = selTags.filter(function(t){ return t.startsWith("__entered:"); }).map(function(t){ return t.slice(10); });
    var hits = [];
    Object.entries(data.charts || {}).forEach(function(e) {
      var k = e[0], c = e[1];
      var idx = k.lastIndexOf("_");
      if (idx < 0) return;
      var st = k.slice(0, idx), dt = k.slice(idx + 1);
      (c.signals || []).forEach(function(s) {
        if (sigTags.length > 0 && !sigTags.includes(s.tag)) return;
        if (ttFilters.length > 0 && !ttFilters.includes(s.tradeType)) return;
        if (resFilters.length > 0 && !resFilters.includes(s.result)) return;
        if (entFilters.length > 0) {
          var ent = _elIsEntered(s, null);
          if (!entFilters.some(function(f) { return (f === "true") === ent; })) return;
        }
        hits.push({ stock: st, date: dt, tag: s.tag, tags: s.tags, isCustomTag: s.isCustomTag, customTagText: s.customTagText, result: s.result, tradeType: s.tradeType, entered: _elIsEntered(s, null), rationale: s.rationale, priceIn: s.priceIn, priceOut: s.priceOut, chartImg: c.chartImg });
      });
    });
    hits.sort(function(a, b) { return b.date.localeCompare(a.date) || a.stock.localeCompare(b.stock); });
    return React.createElement("div", { style:{marginBottom:16} },
      React.createElement("div", { style:{fontSize:13,fontWeight:700,color:"#9A3412",marginBottom:8} },
        "\uD83C\uDFAF \u30B7\u30B0\u30CA\u30EB\u691C\u7D22\u7D50\u679C: ", hits.length, "\u4EF6"),
      hits.length === 0 && React.createElement("div", { style:{fontSize:12,color:"#aaa"} }, "\u8A72\u5F53\u306A\u3057"),
      hits.map(function(h, i) {
        var src = h.chartImg ? imgSrc(h.chartImg) : null;
        return React.createElement("div", {
          key: h.date + "|" + h.stock + "|" + i,
          onClick: function() { onSelectDate(h.date, "charts"); },
          style: { display:"flex",gap:10,alignItems:"center",padding:"10px 12px",marginBottom:6,
                   background:"#fff",borderRadius:8,border:"1px solid #FDE68A",cursor:"pointer" },
          onMouseEnter: function(e) { e.currentTarget.style.borderColor = "#F97316"; },
          onMouseLeave: function(e) { e.currentTarget.style.borderColor = "#FDE68A"; }
        },
        src && React.createElement("img", {
          src: src, onClick: function(e) { e.stopPropagation(); setEnlarged(src); },
          style: { width:56,height:42,objectFit:"cover",borderRadius:5,cursor:"zoom-in",border:"1px solid #e0ddd6",flexShrink:0 },
          alt: ""
        }),
        React.createElement("div", { style:{flex:1,minWidth:0} },
          React.createElement("div", { style:{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:3} },
            React.createElement("span", { style:{fontSize:13,fontWeight:700,color:"#1a1a1a"} }, _fmtDow(h.date)),
            React.createElement("span", { style:{fontSize:12,fontWeight:600,color:"#9A3412"} }, h.stock),
            React.createElement("span", {
              style: { padding:"2px 6px",fontSize:10,fontWeight:600,
                       background: h.entered ? "#E8F5E9" : "#f5f4f0",
                       color: h.entered ? "#2E7D32" : "#888",
                       borderRadius:4, border:"1px solid " + (h.entered ? "#A9DFBF" : "#ddd") }
            }, h.entered ? "\u5B9F\u30A8\u30F3\u30C8\u30EA\u30FC" : "\u898B\u9001\u308A"),
            (h.tags && h.tags.length > 0 ? h.tags : (h.tag && h.tag !== "__custom__" ? [h.tag] : [])).map(function(t) {
              return React.createElement("span", {
                key: t,
                style: { padding:"2px 8px",fontSize:11,fontWeight:600,
                         background:"#FFEDD5", color:"#9A3412",
                         borderRadius:5, border:"1px solid #FB923C" }
              }, t);
            }),
            h.isCustomTag && React.createElement("span", {
              style: { padding:"2px 8px",fontSize:11,fontWeight:600,
                       background:"#EEF2FF", color:"#4338CA",
                       borderRadius:5, border:"1px solid #C7D2FE" }
            }, h.customTagText || "(その他)"),
            h.tradeType && React.createElement("span", {
              style: { padding:"2px 6px",fontSize:10,fontWeight:700,
                       background: h.tradeType === "\u7A7A\u58F2" ? "#FCEBEB" : "#EAF3DE",
                       color: h.tradeType === "\u7A7A\u58F2" ? "#C0392B" : "#1E8449",
                       borderRadius:4,
                       border:"1px solid " + (h.tradeType === "\u7A7A\u58F2" ? "#F5C6CB" : "#A9DFBF") }
            }, h.tradeType),
            h.result && React.createElement("span", {
              style: { padding:"2px 6px",fontSize:10,fontWeight:700,
                       background: h.result === "ok" ? "#EAF3DE" : h.result === "ng" ? "#FCEBEB" : "#f5f4f0",
                       color: h.result === "ok" ? "#1E8449" : h.result === "ng" ? "#C0392B" : "#888",
                       borderRadius:4,
                       border:"1px solid " + (h.result === "ok" ? "#A9DFBF" : h.result === "ng" ? "#F5C6CB" : "#ddd") }
            }, h.result === "ok" ? "\u6210\u529F" : h.result === "ng" ? "\u5931\u6557" : "\u2014")
          ),
          (h.priceIn || h.priceOut) && React.createElement("div", {
            style: { fontSize:11,color:"#555",marginBottom:2 }
          },
            h.priceIn && React.createElement("span", null, "\u5165", h.priceIn),
            h.priceIn && h.priceOut && " \u2192 ",
            h.priceOut && React.createElement("span", null, "\u51FA", h.priceOut)
          ),
          h.rationale && React.createElement("div", {
            style: { fontSize:11,color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }
          }, h.rationale)
        ));
      })
    );
  })(),
  React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#555",
      marginBottom: 10
    }
  }, results.length > 0 ? results.length + "件ヒット（全" + allDates.length + "日中）" : "該当なし"), results.map(function (date) {
    var dd = data.trades[date] || {};
    var dow = DAYS_JP[new Date(date + "T00:00:00").getDay()];
    var chartKeys = Object.keys(data.charts).filter(function (k) {
      return k.endsWith("_" + date);
    });
    
    var enteredSigs = chartKeys.flatMap(function(k) {
      return (data.charts[k] && data.charts[k].signals || []).filter(function(sig) { return _elIsEntered(sig, null); });
    });
    var pnl = enteredSigs.reduce(function(acc, sig) {
      var v = _elSignedVal(sig.realizedPnl, sig.realizedPnlSign);
      return acc + (v != null ? v : 0);
    }, 0);
    var w = enteredSigs.filter(function(sig) { return sig.result === "ok"; }).length;
    var l = enteredSigs.filter(function(sig) { return sig.result === "ng"; }).length;
    
    var entryTagLabels = enteredSigs.map(function(sig) { return _elTagLabel(sig); }).filter(Boolean);
    var allCatsData = getAllNewsCatsData(dd);
    var allMTags = _toConsumableArray(new Set(Object.values(allCatsData).flatMap(function (c) {
      return c.marketTags || [];
    })));
    return React.createElement("div", {
      key: date,
      onClick: function onClick() {
        return onSelectDate(date, determineTab(date));
      },
      style: {
        background: "#fff",
        border: "1.5px solid #e0ddd6",
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 10,
        cursor: "pointer"
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.borderColor = "#6366F1";
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.borderColor = "#e0ddd6";
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
        flexWrap: "wrap"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700
      }
    }, date, "\uFF08", dow, "\uFF09"),
    enteredSigs.length > 0 && React.createElement("div", {
      style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }
    },
      pnl !== 0 && React.createElement("span", {
        style: { fontSize: 13, fontWeight: 700, color: pnl > 0 ? "#C0392B" : "#1E8449" }
      }, (pnl > 0 ? "+" : "") + pnl.toLocaleString() + "\u5186"),
      (w > 0 || l > 0) && React.createElement("span", { style: { fontSize: 12, color: "#666" } },
        w > 0 && React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, w + "\u6210\u529F"),
        w > 0 && l > 0 && " ",
        l > 0 && React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, l + "\u5931\u6557")
      )
    )),
    entryTagLabels.length > 0 && React.createElement("div", {
      style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }
    }, entryTagLabels.map(function(tl, ti) {
      return React.createElement("span", {
        key: ti,
        style: { padding: "2px 7px", fontSize: 11, fontWeight: 600, background: "#FFEDD5", color: "#9A3412", borderRadius: 5, border: "1px solid #FB923C" }
      }, tl);
    })), chartKeys.length > 0 && React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 6
      }
    }, chartKeys.map(function (k) {
      var c = data.charts[k],
        s = k.replace(/_\d{4}-\d{2}-\d{2}$/, "");
      var src = c && c.chartImg ? imgSrc(c.chartImg) : null;
      return React.createElement("div", {
        key: k,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "#f5f4f0",
          borderRadius: 7,
          padding: "4px 8px"
        }
      }, src && React.createElement("img", {
        src: src,
        onClick: function onClick(e) {
          e.stopPropagation();
          setEnlarged(src);
        },
        style: {
          height: 40,
          width: 56,
          objectFit: "cover",
          borderRadius: 4,
          cursor: "zoom-in"
        },
        alt: ""
      }), React.createElement("div", null, React.createElement("div", {
        style: {
          fontSize: 11,
          fontWeight: 700
        }
      }, s), React.createElement(FlowChips, {
        codes: c && c.flowCodes || [],
        tiny: true
      })));
    }), " "), allMTags.length > 0 && React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        marginBottom: 4
      }
    }, allMTags.map(function (t) {
      return React.createElement("span", {
        key: t,
        style: {
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: 5,
          fontSize: 11,
          fontWeight: 600,
          background: "#EEF4FF",
          color: "#1a1a1a",
          border: "1px solid #7A9CC8",
          margin: "1px"
        }
      }, stripCat(t));
    })), Object.values(allCatsData).flatMap(function (c) {
      return (c.newsItems || []).filter(function (n) {
        return stripHtml(n.text).trim();
      });
    }).slice(0, 2).map(function (n, i) {
      var pt = stripHtml(n.text);
      return React.createElement("div", {
        key: i,
        style: {
          fontSize: 12,
          color: "#555",
          marginTop: 3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          background: "#f8f7f4",
          borderRadius: 5,
          padding: "2px 8px"
        }
      }, "\uD83D\uDCF0 ", pt.slice(0, 90), pt.length > 90 ? "…" : "");
    }), dd.summary && React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
        fontStyle: "italic",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, "\uD83D\uDCAD ", dd.summary));
  })), !keyword && selTags.length === 0 && React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "48px 20px",
      color: "#ccc",
      fontSize: 14
    }
  }, "\u8A18\u9332\u306F\u5168", allDates.length, "\u65E5\u5206\u3042\u308A\u307E\u3059", React.createElement("br", null), "\u30AD\u30FC\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u30BF\u30B0\u3092\u30BF\u30C3\u30D7\u3057\u3066\u691C\u7D22\u3057\u3066\u304F\u3060\u3055\u3044"));
}
function SettingsModal(_ref54) {
  var cfg = _ref54.cfg,
    onSave = _ref54.onSave,
    onClose = _ref54.onClose,
    data = _ref54.data,
    save = _ref54.save;
  var _useState137 = useState(cfg),
    _useState138 = _slicedToArray(_useState137, 2),
    s = _useState138[0],
    setS = _useState138[1];
  var u = function u(k, v) {
    return setS(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, k, v));
    });
  };
  var I = {
    padding: "9px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    width: "100%"
  };
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.5)",
      zIndex: 5000,
      display: "flex",
      alignItems: IS_TOUCH ? "flex-end" : "center",
      justifyContent: "center",
      padding: IS_TOUCH ? 0 : 16
    }
  }, React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: IS_TOUCH ? "14px 14px 0 0" : 14,
      padding: 24,
      maxWidth: 480,
      width: "100%",
      maxHeight: "90vh",
      overflowY: "auto",
      paddingBottom: IS_TOUCH ? "max(24px,env(safe-area-inset-bottom,24px))" : 24
    }
  }, React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 20
    }
  }, "\u2699\uFE0F \u8A2D\u5B9A"), React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#444",
      marginBottom: 10
    }
  }, "\uD83D\uDD25 Firebase Realtime Database\uFF08\u30DE\u30EB\u30C1\u30C7\u30D0\u30A4\u30B9\u540C\u671F\uFF09"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#777",
      lineHeight: 1.9,
      background: "#f5f4f0",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 12
    }
  }, "1. ", React.createElement("a", {
    href: "https://console.firebase.google.com",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: "#6366F1"
    }
  }, "Firebase Console"), " \u3067\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u4F5C\u6210", React.createElement("br", null), "2. Realtime Database \u2192\u300C\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u958B\u59CB\u300D", React.createElement("br", null), "3. Database URL \u3092\u5165\u529B"), [["fbUrl", "Database URL", "text"], ["fbSecret", "Database Secret（テストモードは不要）", "password"], ["apiKey", "API Key（Storage用）", "text"]].map(function (_ref55) {
    var _ref56 = _slicedToArray(_ref55, 3),
      k = _ref56[0],
      lb = _ref56[1],
      tp = _ref56[2];
    return React.createElement("div", {
      key: k,
      style: {
        marginBottom: 10
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#888",
        marginBottom: 4
      }
    }, lb), React.createElement("input", {
      value: s[k] || "",
      onChange: function onChange(e) {
        return u(k, e.target.value);
      },
      placeholder: lb,
      style: I,
      type: tp
    }));
  }),
  
  React.createElement("div", {
    style: { fontSize: 11, color: "#999", marginTop: 6, marginBottom: 2 }
  }, "\uD83D\uDCE6 Storage: " + _FB_STORAGE_BUCKET),
  
  React.createElement("div", {
    style: { display: "flex", alignItems: "center", gap: 10, marginTop: 12, marginBottom: 4,
             padding: "10px 12px", background: s.fbPaused !== false ? "#FFF3E0" : "#E8F5E9",
             borderRadius: 8, cursor: "pointer", userSelect: "none",
             border: s.fbPaused !== false ? "1px solid #FFB74D" : "1px solid #81C784" },
    onClick: function() { u("fbPaused", s.fbPaused !== false ? false : true); }
  },
  React.createElement("div", {
    style: { width: 40, height: 22, borderRadius: 11, position: "relative",
             background: s.fbPaused !== false ? "#FFB74D" : "#66BB6A", transition: "background 0.2s" }
  }, React.createElement("div", {
    style: { width: 18, height: 18, borderRadius: 9, background: "#fff",
             position: "absolute", top: 2,
             left: s.fbPaused !== false ? 2 : 20, transition: "left 0.2s",
             boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }
  })),
  React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } },
    s.fbPaused !== false ? "\u26A0\uFE0F \u540C\u671F\u4E00\u6642\u505C\u6B62\u4E2D\uFF08localStorage\u306E\u307F\uFF09" : "\u2705 Firebase\u540C\u671F\u6709\u52B9"
  )),
  ), React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#444",
      marginBottom: 8
    }
  }, "\uD83E\uDD16 Claude API Key\uFF08\u30C1\u30E3\u30FC\u30C8AI\u81EA\u52D5\u89E3\u6790\uFF09"), React.createElement("input", {
    value: s.claudeKey || "",
    onChange: function onChange(e) {
      return u("claudeKey", e.target.value);
    },
    placeholder: "sk-ant-...",
    type: "password",
    style: I
  })),
  
  React.createElement("div", {
    style: { marginBottom: 20, padding: "12px 14px", background: "#f5f4f0", borderRadius: 10, border: "1px solid #e8e5df" }
  },
  React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 10 } },
    "\uD83D\uDCCA Firebase \u901A\u4FE1\u91CF\u30E2\u30CB\u30BF\u30FC\uFF08\u4ECA\u6708\uFF09"),
  function() {
    var u = _fbUsageGet();
    var rows = [
      { label: "DB \u30C0\u30A6\u30F3\u30ED\u30FC\u30C9", val: u.db_dl, free: _FB_FREE.db_dl, color: "#4CAF50", unit: "bytes" },
      { label: "Storage \u30C0\u30A6\u30F3\u30ED\u30FC\u30C9", val: u.st_dl, free: _FB_FREE.st_dl, color: "#FF9800", unit: "bytes" },
      { label: "Storage \u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u64CD\u4F5C", val: u.st_ul_ops || 0, free: _FB_FREE.st_ul_ops, color: "#9C27B0", unit: "ops" },
      { label: "Storage \u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u64CD\u4F5C", val: u.st_dl_ops || 0, free: _FB_FREE.st_dl_ops, color: "#2196F3", unit: "ops" }
    ];
    return React.createElement(React.Fragment, null,
      rows.map(function(r) {
        var pct = Math.min(100, (r.val / r.free) * 100);
        var valStr = r.unit === "bytes" ? _fbUsageFormat(r.val) : (r.val || 0).toLocaleString();
        var freeStr = r.unit === "bytes" ? _fbUsageFormat(r.free) : r.free.toLocaleString();
        return React.createElement("div", { key: r.label, style: { marginBottom: 8 } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 2 } },
            React.createElement("span", null, r.label),
            React.createElement("span", { style: { fontWeight: pct > 80 ? 700 : 400, color: pct > 80 ? "#D32F2F" : pct > 50 ? "#E65100" : "#666" } },
              valStr + " / " + freeStr + " (" + pct.toFixed(1) + "%)")
          ),
          React.createElement("div", { style: { height: 6, background: "#e0e0e0", borderRadius: 3 } },
            React.createElement("div", { style: { height: 6, borderRadius: 3, background: pct > 80 ? "#D32F2F" : pct > 50 ? "#FF9800" : r.color, width: Math.max(pct, 0.5) + "%", transition: "width 0.3s" } })
          )
        );
      }),
      React.createElement("div", { style: { fontSize: 11, color: "#999", marginTop: 10, lineHeight: 1.8, borderTop: "1px solid #e0e0e0", paddingTop: 8 } },
        "\u30DD\u30FC\u30EA\u30F3\u30B0: " + (u.polls || 0) + "\u56DE\u3000DB PUT: " + (u.puts || 0) + "\u56DE",
        React.createElement("br", null),
        "\u26A0 80%\u3067\u8B66\u544A\u3000\u26D4 90%\u3067\u540C\u671F\u81EA\u52D5\u505C\u6B62"),
      React.createElement("button", {
        onClick: function() {
          if (confirm("\u4ECA\u6708\u306E\u901A\u4FE1\u91CF\u30AB\u30A6\u30F3\u30BF\u30FC\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3059\u304B\uFF1F")) {
            try { localStorage.removeItem(_fbUsageKey()); _fbWarnShown = {}; } catch(e){}
            alert("\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3057\u305F");
          }
        },
        style: { marginTop: 8, fontSize: 11, color: "#999", background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }
      }, "\u30AB\u30A6\u30F3\u30BF\u30FC\u30EA\u30BB\u30C3\u30C8")
    );
  }()),
  
  data && save ? (function() {
    var stocksArr = (data.custom && data.custom.stocks && data.custom.stocks.length > 0)
      ? data.custom.stocks : _DEF_STOCKS_FROZEN;
    var chartsObj = data.charts || {};
    var seen = {};
    Object.keys(chartsObj).forEach(function(k) {
      var idx = k.lastIndexOf("_");
      if (idx < 0) return;
      var nm = k.slice(0, idx);
      if (!nm) return;
      if (stocksArr.indexOf(nm) !== -1) return;
      seen[nm] = (seen[nm] || 0) + 1;
    });
    var hiddenList = Object.keys(seen).sort(function(a, b){ return seen[b] - seen[a]; });
    var restoreOne = function(stock) {
      save(function(prev) {
        var pc = prev.custom || {};
        var ps = (pc.stocks && pc.stocks.length > 0) ? pc.stocks.slice() : [].concat(DEF_STOCKS);
        if (ps.indexOf(stock) === -1) ps.push(stock);
        return Object.assign({}, prev, { custom: Object.assign({}, pc, { stocks: ps }) });
      });
    };
    var purgeOne = function(stock) {
      if (!window.confirm("「" + stock + "」を完全削除しますか？\nチャートデータも含めて全て消去され、戻せません。")) return;
      save(function(prev) {
        var pc = prev.custom || {};
        var ps = (pc.stocks && pc.stocks.length > 0) ? pc.stocks.slice() : [].concat(DEF_STOCKS);
        var ns = ps.filter(function(s){ return s !== stock; });
        var nc = Object.assign({}, prev.charts || {});
        Object.keys(nc).forEach(function(k){ if (k.indexOf(stock + "_") === 0) delete nc[k]; });
        var psc = Object.assign({}, pc.stockCodes || {});
        delete psc[stock];
        return Object.assign({}, prev, {
          custom: Object.assign({}, pc, { stocks: ns, stockCodes: psc }),
          charts: nc
        });
      });
    };
    return React.createElement("div", { style: { marginBottom: 22 } },
      React.createElement("div", {
        style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6 }
      }, "\uD83D\uDDD1 \u975E\u8868\u793A\u4E2D\u306E\u9298\u67C4\u7BA1\u7406"),
      React.createElement("div", {
        style: { fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 10 }
      }, "\u30BF\u30D6\u304B\u3089\u524A\u9664\u3057\u305F\u9298\u67C4\u306E\u30C1\u30E3\u30FC\u30C8\u30C7\u30FC\u30BF\u306F\u4FDD\u6301\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u5FA9\u6D3B\u3084\u5B8C\u5168\u524A\u9664\u304C\u3067\u304D\u307E\u3059\u3002"),
      hiddenList.length === 0 ? React.createElement("div", {
        style: { fontSize: 12, color: "#999", padding: "10px 4px" }
      }, "\u975E\u8868\u793A\u4E2D\u306E\u9298\u67C4\u306F\u3042\u308A\u307E\u305B\u3093") :
      React.createElement("div", {
        style: { background: "#f8f7f4", borderRadius: 8, padding: 10,
          display: "flex", flexDirection: "column", gap: 6 }
      },
        hiddenList.map(function(hs) {
          return React.createElement("div", {
            key: hs,
            style: { display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px", background: "#fff", borderRadius: 6,
              border: "1px solid #e0ddd6" }
          },
            React.createElement("div", {
              style: { flex: 1, fontSize: 13, fontWeight: 600, color: "#444",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
            }, hs),
            React.createElement("span", {
              style: { fontSize: 10, color: "#999", whiteSpace: "nowrap" }
            }, seen[hs] + "\u65E5\u5206"),
            React.createElement("button", {
              onClick: function(){ restoreOne(hs); },
              style: { padding: "5px 12px", fontSize: 11, fontWeight: 600,
                background: "#6366F1", color: "#fff", border: "none",
                borderRadius: 5, cursor: "pointer" }
            }, "\u5FA9\u6D3B"),
            React.createElement("button", {
              onClick: function(){ purgeOne(hs); },
              style: { padding: "5px 10px", fontSize: 11, fontWeight: 600,
                background: "#fff", color: "#C0392B",
                border: "1px solid #E8BBBB", borderRadius: 5, cursor: "pointer" }
            }, "\u5B8C\u5168\u524A\u9664")
          );
        })
      )
    );
  }()) : null,
  
  data && save ? (function() {
    var stocks = (data.custom && data.custom.stocks && data.custom.stocks.length > 0)
      ? data.custom.stocks : _DEF_STOCKS_FROZEN;
    var codes = (data.custom && data.custom.stockCodes) || {};
    var updCode = function(stock, field, val) {
      save(function(prev) {
        var c = Object.assign({}, (prev.custom && prev.custom.stockCodes) || {});
        var cur = Object.assign({}, c[stock] || _caGetStockInfo(stock, prev.custom));
        cur[field] = val;
        c[stock] = cur;
        return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { stockCodes: c }) });
      });
    };
    var INP = {
      padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5,
      fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box", background: "#fff"
    };
    return React.createElement("div", { style: { marginBottom: 22 } },
      React.createElement("div", {
        style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6 }
      }, "\uD83D\uDCD0 \u30C1\u30E3\u30FC\u30C8\u5206\u6790\u30C4\u30FC\u30EB\u9023\u643A"),
      React.createElement("div", {
        style: { fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 10 }
      }, "\u5404\u9298\u67C4\u306E\u3010\u5206\u6790\u30C4\u30FC\u30EB\u5074\u306E\u9298\u67C4\u540D\u3011\u3068\u3010\u9298\u67C4\u30B3\u30FC\u30C9\u3011\u3092\u8A2D\u5B9A\u3002 URL: " + CA_URL),
      React.createElement("div", {
        style: { background: "#f8f7f4", borderRadius: 8, padding: 10 }
      },
        React.createElement("div", {
          style: { display: "grid", gridTemplateColumns: "1fr 1.4fr 0.9fr", gap: 6, fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 4, padding: "0 4px" }
        },
          React.createElement("div", null, "\u9298\u67C4\u540D"),
          React.createElement("div", null, "\u5206\u6790\u30C4\u30FC\u30EB\u5074\u540D"),
          React.createElement("div", null, "\u30B3\u30FC\u30C9")
        ),
        stocks.map(function(st) {
          var info = _caGetStockInfo(st, data.custom);
          return React.createElement("div", {
            key: st,
            style: { display: "grid", gridTemplateColumns: "1fr 1.4fr 0.9fr", gap: 6, marginBottom: 4, alignItems: "center" }
          },
            React.createElement("div", {
              style: { fontSize: 12, fontWeight: 600, color: "#555", padding: "0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
            }, st),
            React.createElement(FastInput, {
              type: "text", value: info.caTicker || "",
              onChange: function(v) { updCode(st, "caTicker", v); },
              debounceMs: 400,
              placeholder: "(\u672A\u5BFE\u5FDC\u306A\u3089\u7A7A\u6B04)",
              style: INP
            }),
            React.createElement(FastInput, {
              type: "text", value: info.code || "",
              onChange: function(v) { updCode(st, "code", String(v).replace(/[^0-9A-Za-z]/g, "")); },
              debounceMs: 400,
              placeholder: "1234",
              style: INP
            })
          );
        }),
        React.createElement("div", {
          style: { fontSize: 10, color: "#999", marginTop: 6, lineHeight: 1.5 }
        }, "* \u7A7A\u6B04\u306E\u5834\u5408\u306F\u30C7\u30D5\u30A9\u30EB\u30C8\u5024\u304C\u4F7F\u308F\u308C\u307E\u3059 (INPEX=1605/JX\u91D1\u5C5E=5016/\u30D5\u30B8\u30AF\u30E9=5803/\u5DDD\u5D0E\u91CD\u5DE5\u696D=7012/IHI=7013/\u30BD\u30D5\u30C8\u30D0\u30F3\u30AF=9984)")
      )
    );
  })() : null,
  React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("button", {
    onClick: function onClick() {
      return onSave(s);
    },
    style: {
      padding: "12px 20px",
      fontSize: 14,
      fontWeight: 600,
      background: "#1a1a1a",
      color: "#fff",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      flex: 1
    }
  }, "\u4FDD\u5B58"), React.createElement("button", {
    onClick: onClose,
    style: {
      padding: "12px 20px",
      fontSize: 14,
      fontWeight: 600,
      background: "#fff",
      color: "#666",
      border: "1px solid #ccc",
      borderRadius: 7,
      cursor: "pointer"
    }
  }, "\u30AD\u30E3\u30F3\u30BB\u30EB"))));
}


function NikkeiPriceChart(_p) {
  var data = _p.data, onSelectDate = _p.onSelectDate, highlightDate = _p.highlightDate;
  var _uPer = useState("3m"), _uPerA = _slicedToArray(_uPer, 2),
      chartPeriod = _uPerA[0], setChartPeriod = _uPerA[1];
  var _uHov = useState(null), _uHovA = _slicedToArray(_uHov, 2),
      hovIdx = _uHovA[0], setHovIdx = _uHovA[1];

  var allPoints = useMemo(function() {
    var charts = (data && data.charts) || {};
    var pts = [];
    Object.keys(charts).forEach(function(k) {
      var idx = k.indexOf("_");
      if (idx < 0) return;
      var st = k.slice(0, idx), dt = k.slice(idx + 1);
      if (st !== "日経平均株価") return;
      var c = charts[k];
      if (!c || typeof c.dayClose !== "number") return;
      pts.push({ date: dt, close: c.dayClose, macroLocal: c.macroLocal || null });
    });
    pts.sort(function(a, b) { return a.date.localeCompare(b.date); });
    return pts;
  }, [data && data.charts]);

  var filteredPoints = useMemo(function() {
    if (!allPoints.length) return [];
    var last = allPoints[allPoints.length - 1].date;
    if (chartPeriod === "all") return allPoints;
    var cutoff = new Date(last);
    if (chartPeriod === "1m")  cutoff.setMonth(cutoff.getMonth() - 1);
    if (chartPeriod === "3m")  cutoff.setMonth(cutoff.getMonth() - 3);
    if (chartPeriod === "6m")  cutoff.setMonth(cutoff.getMonth() - 6);
    if (chartPeriod === "1y")  cutoff.setFullYear(cutoff.getFullYear() - 1);
    var cutStr = cutoff.getFullYear() + "-" + String(cutoff.getMonth() + 1).padStart(2, "0") + "-" + String(cutoff.getDate()).padStart(2, "0");
    return allPoints.filter(function(p) { return p.date >= cutStr; });
  }, [allPoints, chartPeriod]);


  if (filteredPoints.length < 2) {
    return React.createElement("div", {
      style: { padding: "16px", textAlign: "center", color: "#bbb", fontSize: 12,
        border: "1px solid #e0ddd6", borderRadius: 8, marginTop: 10 }
    }, "終値データが2件以上必要です。各日の終値を入力すると表示されます。");
  }

  var W = 680, H = 180, PL = 52, PR = 12, PT = 12, PB = 32;
  var cW = W - PL - PR, cH = H - PT - PB;
  var n = filteredPoints.length;
  var closes = filteredPoints.map(function(p) { return p.close; });
  var minC = Math.min.apply(null, closes);
  var maxC = Math.max.apply(null, closes);
  var pad = Math.max((maxC - minC) * 0.05, 50);
  var yMin = minC - pad, yMax = maxC + pad;
  var yRange = yMax - yMin;

  var toX = function(i) { return PL + (i / (n - 1)) * cW; };
  var toY = function(v) { return PT + (1 - (v - yMin) / yRange) * cH; };

  var mainPath = filteredPoints.map(function(p, i) {
    return (i === 0 ? "M" : "L") + toX(i).toFixed(1) + "," + toY(p.close).toFixed(1);
  }).join(" ");
  var areaPath = mainPath + " L" + toX(n-1).toFixed(1) + "," + (PT + cH) + " L" + PL.toFixed(1) + "," + (PT + cH) + " Z";


  var yTicks = [];
  var nTicks = 4;
  var tickStep = Math.ceil((yRange / nTicks) / 100) * 100;
  if (tickStep === 0) tickStep = 100;
  var tickStart = Math.ceil(yMin / tickStep) * tickStep;
  for (var ti = tickStart; ti <= yMax; ti += tickStep) { yTicks.push(ti); }

  var xLabels = [];
  var labelStep = n <= 15 ? 1 : n <= 30 ? 2 : n <= 60 ? 5 : 10;
  filteredPoints.forEach(function(p, i) {
    var isMonthStart = p.date.slice(8) === "01";
    if (i === 0 || i === n - 1 || i % labelStep === 0 || isMonthStart) {
      xLabels.push({ i: i, label: p.date.slice(5, 7) + "/" + p.date.slice(8), monthStart: isMonthStart });
    }
  });

  var hovPt = (hovIdx !== null && hovIdx >= 0 && hovIdx < n) ? filteredPoints[hovIdx] : null;
  var lastPt = filteredPoints[n - 1];
  var periodLabels = [["1m","1ヶ月"],["3m","3ヶ月"],["6m","6ヶ月"],["1y","1年"],["all","全期間"]];

  
  var prevDayDiff = null;
  if (highlightDate && allPoints.length >= 2) {
    var hlIdx = allPoints.findIndex(function(p) { return p.date === highlightDate; });
    if (hlIdx > 0) {
      var hlClose = allPoints[hlIdx].close;
      var prevClose = allPoints[hlIdx - 1].close;
      var prevDate = allPoints[hlIdx - 1].date;
      var prevDow = DAYS_JP[(new Date(prevDate + "T00:00:00")).getDay()];
      var prevMD = (prevDate.slice(5,7)).replace(/^0/,"") + "/" + prevDate.slice(8);
      prevDayDiff = { diff: hlClose - prevClose, prevMD: prevMD, prevDow: prevDow };
    }
  }

  return React.createElement("div", {
    style: { marginTop: 10, border: "1px solid #e0ddd6", borderRadius: 8, background: "#fff", overflow: "hidden" }
  },
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderBottom: "1px solid #f0ede8", background: "#fafaf8", flexWrap: "wrap", gap: 6 }
    },
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8 } },
        React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "#333" } }, "📈 日経平均チャート"),
        prevDayDiff && React.createElement("span", {
          style: { fontSize: 11, color: prevDayDiff.diff >= 0 ? "#DC2626" : "#16A34A", fontWeight: 600 }
        }, "前日（" + prevDayDiff.prevMD + "・" + prevDayDiff.prevDow + "）比 " +
          (prevDayDiff.diff >= 0 ? "+" : "") + Math.round(prevDayDiff.diff).toLocaleString() + "円")
      ),
      React.createElement("div", { style: { display: "flex", gap: 4 } },
        periodLabels.map(function(kv) {
          var on = chartPeriod === kv[0];
          return React.createElement("button", {
            key: kv[0],
            onClick: function() { setChartPeriod(kv[0]); setHovIdx(null); },
            style: { padding: "3px 8px", fontSize: 11, fontWeight: 600,
              border: on ? "1.5px solid #1a1a1a" : "1px solid #ddd",
              background: on ? "#1a1a1a" : "#fff", color: on ? "#fff" : "#888",
              borderRadius: 4, cursor: "pointer" }
          }, kv[1]);
        })
      )
    ),
    React.createElement("div", {
      style: { minHeight: 22, padding: "3px 12px", fontSize: 11, color: "#555",
        background: "#fafaf8", borderBottom: "1px solid #f0ede8", display: "flex", alignItems: "center", gap: 12 }
    },
      hovPt
        ? React.createElement(React.Fragment, null,
            React.createElement("span", { style: { fontWeight: 700 } }, _fmtDow(hovPt.date)),
            React.createElement("span", null, "終値: ",
              React.createElement("span", { style: { fontWeight: 700, color: "#333" } },
                Math.round(hovPt.close).toLocaleString() + "円")),
            hovPt.macroLocal && React.createElement("span", {
              style: { fontWeight: 600, color: "#9A3412", background: "#FFEDD5",
                padding: "1px 6px", borderRadius: 4, fontSize: 10 }
            }, hovPt.macroLocal)
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
          var fi = Math.round((mx - PL) / cW * (n - 1));
          setHovIdx(Math.max(0, Math.min(n - 1, fi)));
        },
        onMouseLeave: function() { setHovIdx(null); },
        onClick: function(e) { if (hovPt && onSelectDate) onSelectDate(hovPt.date); }
      },
        yTicks.map(function(tv) {
          var y = toY(tv);
          return React.createElement("g", { key: tv },
            React.createElement("line", { x1: PL, y1: y, x2: PL + cW, y2: y, stroke: "#f0ede8", strokeWidth: 1 }),
            React.createElement("text", {
              x: PL - 4, y: y + 4, textAnchor: "end",
              fontSize: 9, fill: "#aaa"
            }, Math.round(tv).toLocaleString())
          );
        }),
        xLabels.map(function(xl) {
          return React.createElement("g", { key: xl.i },
            React.createElement("line", { x1: toX(xl.i), y1: PT + cH, x2: toX(xl.i), y2: PT + cH + 4, stroke: xl.monthStart ? "#999" : "#ddd", strokeWidth: 1 }),
            React.createElement("text", {
              x: toX(xl.i), y: H - 2,
              textAnchor: "middle", fontSize: 9, fill: xl.monthStart ? "#666" : "#bbb",
              fontWeight: xl.monthStart ? 700 : 400
            }, xl.label)
          );
        }),
        React.createElement("defs", null,
          React.createElement("linearGradient", { id: "nikkeiAreaGrad", x1: "0", y1: "0", x2: "0", y2: "1" },
            React.createElement("stop", { offset: "0%", stopColor: "#DC2626", stopOpacity: 0.12 }),
            React.createElement("stop", { offset: "100%", stopColor: "#DC2626", stopOpacity: 0 })
          )
        ),
        React.createElement("path", { d: areaPath, fill: "url(#nikkeiAreaGrad)", stroke: "none" }),
        React.createElement("path", {
          d: mainPath, fill: "none", stroke: "#DC2626", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round"
        }),
        filteredPoints.map(function(p, i) {
          return React.createElement("circle", {
            key: "dot_" + i,
            cx: toX(i), cy: toY(p.close),
            r: hovIdx === i ? 5 : 3,
            fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5,
            style: { cursor: "pointer" }
          });
        }),
        hovIdx !== null && React.createElement("g", null,
          React.createElement("line", {
            x1: toX(hovIdx), y1: PT, x2: toX(hovIdx), y2: PT + cH,
            stroke: "#888", strokeWidth: 1, strokeDasharray: "3,2"
          }),
          React.createElement("circle", {
            cx: toX(hovIdx), cy: toY(filteredPoints[hovIdx].close),
            r: 4, fill: "#DC2626", stroke: "#fff", strokeWidth: 2
          })
        )
      )
    ),
    React.createElement("div", {
      style: { display: "flex", gap: 16, padding: "7px 12px", flexWrap: "wrap",
        borderTop: "1px solid #f0ede8", fontSize: 11, color: "#666" }
    },
      React.createElement("span", null, "最高値: ",
        React.createElement("span", { style: { fontWeight: 700, color: "#DC2626" } }, Math.round(maxC).toLocaleString() + "円")),
      React.createElement("span", null, "最安値: ",
        React.createElement("span", { style: { fontWeight: 700, color: "#16A34A" } }, Math.round(minC).toLocaleString() + "円")),
      React.createElement("span", null, "データ: ",
        React.createElement("span", { style: { fontWeight: 700 } }, n + "日分")),
      React.createElement("span", null, "直近: ",
        React.createElement("span", { style: { fontWeight: 700, color: "#333" } }, Math.round(lastPt.close).toLocaleString() + "円"))
    )
  );
}




function StockQuickRefTable(_props_qrt) {
  var data = _props_qrt.data;
  var activeStock = _props_qrt.activeStock;
  var onSelectDate = _props_qrt.onSelectDate;
  var highlightDate = _props_qrt.highlightDate;
  var weekOffset = _props_qrt.weekOffset;
  var setWeekOffset = _props_qrt.setWeekOffset;

  
  var _us_qrt_wo = useState(0), _us_qrt_woA = _slicedToArray(_us_qrt_wo, 2),
      localWO = _us_qrt_woA[0], setLocalWO = _us_qrt_woA[1];
  var effectiveWO = (typeof weekOffset === "number") ? weekOffset : localWO;
  var setWO = setWeekOffset || setLocalWO;

  
  var _qrtLocalStr = function(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  var baseDate = highlightDate ? new Date(highlightDate + "T00:00:00") : new Date();
  baseDate.setDate(baseDate.getDate() + effectiveWO * 14);
  var weekDates = Array.from({ length: 14 }, function(_, i) {
    var d = new Date(baseDate);
    d.setDate(d.getDate() - 13 + i);
    return _qrtLocalStr(d);
  });
  var weekLabel = weekDates[0].slice(5).replace("-", "/") + " 〜 " + weekDates[13].slice(5).replace("-", "/");

  
  var _qrtHolidaySet = useMemo(function() {
    var ec = (data && data.custom && data.custom.eventCategories) || [];
    return _buildHolidayDateSet((data && data.trades) || {}, ec);
  }, [data && data.trades, data && data.custom && data.custom.eventCategories]);
  var _holidayPurple = "#9333EA";

  return React.createElement("div", {
    style: { background: "#fff", borderRadius: 12, padding: 14,
      border: "1px solid #ddd", marginBottom: 12 }
  },
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, gap: 8 }
    },
      React.createElement("button", {
        onClick: function(){ setWO(function(o){ return o - 1; }); },
        style: { padding: "7px 12px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", border: "1px solid #ddd",
          borderRadius: 6, cursor: "pointer", color: "#555",
          minHeight: IS_TOUCH ? 40 : 32 }
      }, "＜"),
      React.createElement("div", {
        style: { textAlign: "center", flex: 1 }
      },
        React.createElement("div", {
          style: { fontSize: 13, fontWeight: 700 }
        }, activeStock + " 早見表"),
        React.createElement("div", {
          style: { fontSize: 11, color: "#888" }
        }, weekLabel)
      ),
      React.createElement("button", {
        onClick: function(){ setWO(function(o){ return o + 1; }); },
        style: { padding: "7px 12px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", border: "1px solid #ddd",
          borderRadius: 6, cursor: "pointer", color: "#555",
          minHeight: IS_TOUCH ? 40 : 32 }
      }, "＞")
    ),
    React.createElement("div", {
      style: { overflowX: "auto", width: "100%" }
    },
      React.createElement("table", {
        style: { width: "100%", minWidth: 340, fontSize: 12, borderCollapse: "collapse" }
      },
        React.createElement("thead", null,
          React.createElement("tr", { style: { background: "#f5f4f0" } },
            [
              { label: "日付", pad: "6px 8px" },
              { label: "地合い", pad: "6px 12px" },
              { label: "利益獲得度（実/想/H）", pad: "6px 8px" },
              { label: "イベント・タグ", pad: "6px 12px" }
            ].map(function(h) {
              return React.createElement("th", {
                key: h.label,
                style: { textAlign: "left", padding: h.pad, fontWeight: 600,
                  fontSize: 11, color: "#888", whiteSpace: "nowrap" }
              }, h.label);
            })
          )
        ),
        React.createElement("tbody", null, weekDates.map(function(d) {
          var c2 = data.charts && data.charts[activeStock + "_" + d];
          var dow2 = DAYS_JP[new Date(d + "T00:00:00").getDay()];
          var isSun = new Date(d + "T00:00:00").getDay() === 0;
          var isSat = new Date(d + "T00:00:00").getDay() === 6;
          var isHL = highlightDate && d === highlightDate;
          var isHoliday = !!_qrtHolidaySet[d];
          
          var dateColor = isHoliday ? _holidayPurple
                        : isSun ? "#C0392B"
                        : isSat ? "#2874A6"
                        : "inherit";
          return React.createElement("tr", {
            key: d,
            style: { borderBottom: "1px solid #f0eeea",
              background: isHL ? "#EEF2FF" : "transparent",
              cursor: "pointer" },
            onClick: function(){ if (onSelectDate) onSelectDate(d); }
          },
            React.createElement("td", {
              style: { padding: "7px 8px",
                fontWeight: isHL ? 700 : (isHoliday ? 700 : 400),
                whiteSpace: "nowrap",
                color: dateColor }
            }, d.slice(5) + "（" + dow2 + "）"),
            React.createElement("td", {
              style: { padding: "7px 12px", whiteSpace: "nowrap" }
            },
              isHoliday
                ? React.createElement("span", {
                    style: {
                      display: "inline-block", padding: "2px 8px", borderRadius: 5,
                      fontSize: 10, fontWeight: 700,
                      background: "#F3E8FF", color: _holidayPurple,
                      border: "1px solid " + _holidayPurple
                    }
                  }, "祝日休場")
              : (c2 && c2.macroLocal
                ? React.createElement(CPill, { label: c2.macroLocal, color: getMC(c2.macroLocal), sm: true })
                : React.createElement("span", { style: { color: "#ddd" } }, "—")),
              !isHoliday && !isSun && !isSat && c2 &&
                (typeof c2.dayClose === "number" || typeof c2.prevDayPct === "number" || typeof c2.prevDayChange === "number")
                ? React.createElement("span", {
                    style: { marginLeft: 6, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }
                  },
                    typeof c2.dayClose === "number"
                      ? React.createElement("span", { style: { color: "#333" } },
                          Math.round(c2.dayClose).toLocaleString())
                      : null,
                    
                    activeStock === "日経平均株価" && typeof c2.prevDayChange === "number"
                      ? React.createElement("span", {
                          style: { marginLeft: typeof c2.dayClose === "number" ? 4 : 0,
                            color: c2.prevDayChange >= 0 ? "#DC2626" : "#16A34A" }
                        }, "(" + (c2.prevDayChange >= 0 ? "+" : "") + Math.round(c2.prevDayChange).toLocaleString() + "\u5186)")
                      : (activeStock !== "日経平均株価" && typeof c2.prevDayPct === "number"
                        ? React.createElement("span", {
                            style: { marginLeft: typeof c2.dayClose === "number" ? 4 : 0,
                              color: c2.prevDayPct >= 0 ? "#DC2626" : "#16A34A" }
                          }, "(" + (c2.prevDayPct >= 0 ? "+" : "") + c2.prevDayPct.toFixed(2) + "%)")
                        : null)
                  )
                : null
            ),
            React.createElement("td", {
              style: { padding: "5px 14px", whiteSpace: "nowrap" }
            }, (function() {
              if (!c2 || isHoliday) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _cgA = c2.alphaVal != null ? Number(c2.alphaVal) : 5;
              var _cgC = c2.cutLine != null ? Number(c2.cutLine) : 10;
              var _cg = _elCalcChartGrades(c2.signals, _cgA, _cgC);
              if (_cg.real === "Z" && _cg.plan === "Z" && _cg.hold === "Z" && _cg.osAvg == null) {
                return React.createElement("span", { style: { fontSize: 11, color: "#ccc" } }, "—");
              }
              var _rawItem = function(lbl, v) {
                if (v == null) return null;
                return React.createElement("span", { style: { whiteSpace: "nowrap" } }, lbl, React.createElement("b", { style: { color: "#555", fontWeight: 700 } }, (v > 0 ? "+" : "") + v));
              };
              return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" } },
                React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 3 } },
                  React.createElement(_GradeBadges3, { grades: _cg, size: 18 }),
                  React.createElement("span", { style: { fontSize: 8, color: "#aaa", whiteSpace: "nowrap" }, title: "想定/Hグレードはα値依存（このα値での試算）" }, "α" + _cgA)
                ),
                (_cg.osAvg != null || _cg.confAvg != null || _cg.holdConfAvg != null) && React.createElement("div", { style: { display: "flex", gap: 6, fontSize: 9, color: "#888", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
                  _rawItem("OS", _cg.osAvg),
                  _rawItem("確", _cg.confAvg),
                  _rawItem("H確", _cg.holdConfAvg)
                )
              );
            })()),
            React.createElement("td", {
              style: { padding: "7px 12px", width: "100%" }
            }, (function() {
              var _dayEvents = ((data.trades && data.trades[d] && data.trades[d].events) || []).filter(function(e){ return e && !e._deleted; });
              var _tags = [].concat(_toConsumableArray((c2 && c2.chartShapeTags) || []),
                                    _toConsumableArray((c2 && c2.stockTags) || [])).slice(0, 8);
              var _hasContent = _dayEvents.length > 0 || _tags.length > 0;
              if (!_hasContent) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" } },
                _dayEvents.map(function(ev, ei) {
                  var _evTitle = ev.title || (ev.contentHtml ? stripHtml(ev.contentHtml) : (ev.content || "(無題)"));
                  var _prefix = (ev.allDay === false && ev.startTime) ? ev.startTime + " " : "";
                  return React.createElement("span", {
                    key: "ev_" + ei,
                    title: _evTitle,
                    style: { display: "inline-block", padding: "1px 6px", borderRadius: 5,
                      fontSize: 10, fontWeight: 600, background: "#F0FDF4",
                      color: "#166534", border: "1px solid #86EFAC", margin: "1px",
                      maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                  }, "📅 " + _prefix + _evTitle);
                }),
                _tags.map(function(t) {
                  return React.createElement("span", {
                    key: t,
                    style: { display: "inline-block", padding: "1px 6px", borderRadius: 5,
                      fontSize: 10, fontWeight: 600, background: "#EEF4FF",
                      color: "#1a1a1a", border: "1px solid #7A9CC8", margin: "1px" }
                  }, stripCat(t));
                })
              );
            })())
          );
        }))
      )
    )
  );
}


function StockQuickRefTableWithChart(_props_qrtc) {
  return React.createElement(StockQuickRefTable, _props_qrtc);
}


function DayView(_ref57) {
  var date = _ref57.date,
    data = _ref57.data,
    save = _ref57.save,
    onBack = _ref57.onBack,
    onSelectDate = _ref57.onSelectDate,
    cfg = _ref57.cfg,
    initialTab = _ref57.initialTab,
    onOpenEntryLog = _ref57.onOpenEntryLog;
  var custom = data.custom || EMPTY.custom;
  var allStocks = custom.stocks && custom.stocks.length > 0 ? custom.stocks : _DEF_STOCKS_FROZEN;
  var _useState139 = useState(function(){
      try { var _sv=localStorage.getItem("scalping_cs_v1"); return (_sv&&allStocks.includes(_sv))?_sv:(allStocks[0]||""); } catch(e){ return allStocks[0]||""; }
    }),
    _useState140 = _slicedToArray(_useState139, 2),
    cs = _useState140[0],
    setCs = _useState140[1],
    _useState141 = useState(false),
    _useState142 = _slicedToArray(_useState141, 2),
    showForm = _useState142[0],
    setShowForm = _useState142[1],
    _useState143 = useState(function(){
      
      
      
      if (initialTab) return initialTab;
      try { var _v=JSON.parse(localStorage.getItem("scalping_view_v1")||"{}"); return _v.tab || "news"; } catch(e){ return "news"; }
    }),
    _useState144 = _slicedToArray(_useState143, 2),
    tab = _useState144[0],
    setTab = _useState144[1];
  
  var _useStateFMA = useState(false),
    _useStateFMA2 = _slicedToArray(_useStateFMA, 2),
    fmActive = _useStateFMA2[0],
    setFmActive = _useStateFMA2[1];
  var _useStateFMS = useState(false),
    _useStateFMS2 = _slicedToArray(_useStateFMS, 2),
    showFmSettings = _useStateFMS2[0],
    setShowFmSettings = _useStateFMS2[1];
  
  var _useStateIT = useState(function() { try { return localStorage.getItem("scalping_ind_tab_v1") || "fm"; } catch(e) { return "fm"; } }),
    _useStateITA = _slicedToArray(_useStateIT, 2),
    indTab = _useStateITA[0], setIndTab = _useStateITA[1];
  var _setIndTab = function(t) { try { localStorage.setItem("scalping_ind_tab_v1", t); } catch(e) {} setIndTab(t); };
  var indTabDragRef = useRef(null);
  
  var _useStateTET = useState(null),
    _useStateTETA = _slicedToArray(_useStateTET, 2),
    tradeEditTarget = _useStateTETA[0],
    setTradeEditTarget = _useStateTETA[1];
  
  var _useStatePTE = useState({}),
    _useStatePTEA = _slicedToArray(_useStatePTE, 2),
    pnlTableExpandSet = _useStatePTEA[0],
    setPnlTableExpandSet = _useStatePTEA[1];
  
  var _useStatePRS = useState({}),
    _useStatePRSA = _slicedToArray(_useStatePRS, 2),
    pnlRecordExpandSet = _useStatePRSA[0],
    setPnlRecordExpandSet = _useStatePRSA[1];
  
  var _useStateTTRE = useState({}),
    _useStateTTREA = _slicedToArray(_useStateTTRE, 2),
    trTableRecExp = _useStateTTREA[0],
    setTrTableRecExp = _useStateTTREA[1];
  
  var _useStatePSO = useState("time"),
    _useStatePSOA = _slicedToArray(_useStatePSO, 2),
    pnlSortOrder = _useStatePSOA[0],
    setPnlSortOrder = _useStatePSOA[1];
  
  var _uPbSim = useState(null), _uPbSimA = _slicedToArray(_uPbSim, 2),
    pbSimAlpha = _uPbSimA[0], setPbSimAlpha = _uPbSimA[1];
  var _uPbSimCL = useState(null), _uPbSimCLA = _slicedToArray(_uPbSimCL, 2),
    pbSimCutLine = _uPbSimCLA[0], setPbSimCutLine = _uPbSimCLA[1];
  var _uPbAMode = useState("stock"), _uPbAModeA = _slicedToArray(_uPbAMode, 2),
    pbAlphaMode = _uPbAModeA[0], setPbAlphaMode = _uPbAModeA[1];
  
  
  
  
  useEffect(function() {
    if (initialTab && initialTab !== tab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  
  
  var _safeSetTab = function(t) {
    var doSwitch = function() {
      try {
        var ae = document.activeElement;
        if (ae && ae !== document.body && typeof ae.blur === "function") ae.blur();
      } catch(e){}
      setTab(t);
    };
    if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
      window.__snEditingGuard.canLeave(doSwitch);
    } else {
      doSwitch();
    }
  };
  var _useState145 = useState(0),
    _useState146 = _slicedToArray(_useState145, 2),
    weekOffset = _useState146[0],
    setWeekOffset = _useState146[1];
  useEffect(function(){
    try { localStorage.setItem("scalping_cs_v1", cs); } catch(e){}
  }, [cs]);
  useEffect(function(){
    try { var _sv=JSON.parse(localStorage.getItem("scalping_view_v1")||"{}"); localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({},_sv,{tab:tab}))); } catch(e){}
  }, [tab]);
  var activeStock = allStocks.includes(cs) ? cs : allStocks[0] || "";
  useEffect(function () {
    return setWeekOffset(0);
  }, [activeStock]);
  
  
  
  var jumpTo = function(d, stock, t) {
    var doJump = function() {
      if (onSelectDate) onSelectDate(d, stock);
      if (t) setTab(t);
    };
    if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
      window.__snEditingGuard.canLeave(doJump);
    } else {
      doJump();
    }
  };
  
  var _useStateJT = useState(null), _useStateJTS = _slicedToArray(_useStateJT, 2),
    jumpTarget = _useStateJTS[0], setJumpTarget = _useStateJTS[1];
  
  var _useStateCRC = useState(null), _useStateCRCS = _slicedToArray(_useStateCRC, 2),
    chartReturnCtx = _useStateCRCS[0], setChartReturnCtx = _useStateCRCS[1];
  
  useEffect(function() {
    if (tab !== "news" && chartReturnCtx) setChartReturnCtx(null);
  }, [tab]);
  var dd = data.trades[date] || {
    items: [],
    summary: "",
    tradesMemo: {
      text: "",
      images: []
    }
  };
  var updDay = function updDay(k, v) {
    return save(function(prevData) {
      var prevDd = prevData.trades[date] || {};
      return _objectSpread(_objectSpread({}, prevData), {}, {
        trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, date, _objectSpread(_objectSpread({}, prevDd), {}, _defineProperty({}, k, v))))
      });
    });
  };
  var updCustom = function updCustom(nc) {
    return save(function(prevData) {
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevData.custom || {}), nc)
      });
    });
  };
  var addStock = function addStock(name) {
    if (!allStocks.includes(name)) {
      updCustom({
        stocks: [].concat(_toConsumableArray(allStocks), [name])
      });
      setCs(name);
    }
  };
  var handleDelStock = function handleDelStock(stock) {
    var ns = allStocks.filter(function (s) {
      return s !== stock;
    });
    
    save(_objectSpread(_objectSpread({}, data), {}, {
      custom: _objectSpread(_objectSpread({}, custom), {}, {
        stocks: ns
      })
    }));
    if (activeStock === stock) setCs(ns[0] || "");
  };
  
  var handlePurgeStock = function handlePurgeStock(stock) {
    save(function(prev) {
      var pc = prev.custom || {};
      var ps = (pc.stocks && pc.stocks.length > 0) ? pc.stocks.slice() : [].concat(DEF_STOCKS);
      var ns = ps.filter(function(s) { return s !== stock; });
      var nc = Object.assign({}, prev.charts || {});
      Object.keys(nc).forEach(function(k) {
        if (k.indexOf(stock + "_") === 0) delete nc[k];
      });
      var psc = Object.assign({}, pc.stockCodes || {});
      delete psc[stock];
      return Object.assign({}, prev, {
        custom: Object.assign({}, pc, { stocks: ns, stockCodes: psc }),
        charts: nc
      });
    });
    if (activeStock === stock) setCs(allStocks.filter(function(s){ return s !== stock; })[0] || "");
  };
  
  var handleRestoreStock = function handleRestoreStock(stock) {
    if (allStocks.includes(stock)) return;
    save(function(prev) {
      var pc = prev.custom || {};
      var ps = (pc.stocks && pc.stocks.length > 0) ? pc.stocks.slice() : [].concat(DEF_STOCKS);
      if (ps.indexOf(stock) === -1) ps.push(stock);
      return Object.assign({}, prev, {
        custom: Object.assign({}, pc, { stocks: ps })
      });
    });
    setCs(stock);
  };
  
  var hiddenStocks = (function() {
    var seen = {};
    var chartsObj = data.charts || {};
    Object.keys(chartsObj).forEach(function(k) {
      var idx = k.lastIndexOf("_");
      if (idx < 0) return;
      var nm = k.slice(0, idx);
      if (!nm) return;
      if (allStocks.indexOf(nm) !== -1) return;
      seen[nm] = (seen[nm] || 0) + 1;
    });
    return Object.keys(seen).sort(function(a, b) { return seen[b] - seen[a]; });
  })();
  var handleRenameStock = function handleRenameStock(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    if (oldName === "日経平均株価" || newName === "日経平均株価") return;
    save(function(prev) {
      var next = Object.assign({}, prev);
      
      var pc = prev.custom || {};
      var ps = (pc.stocks && pc.stocks.length > 0) ? pc.stocks.slice() : [].concat(DEF_STOCKS);
      var idx = ps.indexOf(oldName);
      if (idx >= 0) ps[idx] = newName;
      
      var psc = Object.assign({}, pc.stockCodes || {});
      if (Object.prototype.hasOwnProperty.call(psc, oldName)) {
        psc[newName] = psc[oldName];
        delete psc[oldName];
      }
      next.custom = Object.assign({}, pc, { stocks: ps, stockCodes: psc });
      
      var pch = prev.charts || {};
      var nch = {};
      var pref = oldName + "_";
      Object.keys(pch).forEach(function(k) {
        if (k.indexOf(pref) === 0) {
          var suffix = k.slice(pref.length);
          nch[newName + "_" + suffix] = pch[k];
        } else {
          nch[k] = pch[k];
        }
      });
      next.charts = nch;
      
      var ptr = prev.trades || {};
      var ntr = {};
      Object.keys(ptr).forEach(function(dk) {
        var dayObj = ptr[dk];
        if (!dayObj || !Array.isArray(dayObj.items)) { ntr[dk] = dayObj; return; }
        var ni = dayObj.items.map(function(it) {
          var changed = null;
          if (it && it.stock === oldName) { changed = Object.assign({}, it, { stock: newName }); }
          if (it && it.signalStock === oldName) {
            changed = Object.assign({}, changed || it, { signalStock: newName });
          }
          return changed || it;
        });
        ntr[dk] = Object.assign({}, dayObj, { items: ni });
      });
      next.trades = ntr;
      return next;
    });
    
    try {
      var sv = localStorage.getItem("scalping_cs_v1");
      if (sv === oldName) localStorage.setItem("scalping_cs_v1", newName);
    } catch(_e) {}
    if (activeStock === oldName) setCs(newName);
  };
  var getMondayOf = function getMondayOf(d) {
    var day = d.getDay(),
      diff = day === 0 ? -6 : 1 - day,
      r = new Date(d);
    r.setDate(r.getDate() + diff);
    r.setHours(0, 0, 0, 0);
    return r;
  };
  var baseMonday = getMondayOf(new Date());
  baseMonday.setDate(baseMonday.getDate() + weekOffset * 7);
  var weekDates = Array.from({
    length: 7
  }, function (_, i) {
    var d = new Date(baseMonday);
    d.setDate(d.getDate() + i);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  });
  var weekLabel = weekDates[0].slice(5).replace("-", "/") + "\uFF08\u6708\uFF09\u301C " + weekDates[6].slice(5).replace("-", "/") + "\uFF08\u65E5\uFF09";
  var tp = (dd.items || []).reduce(function (s, t) {
    return s + (Number(t.pnl) || 0);
  }, 0);
  var w = (dd.items || []).filter(function (t) {
      return Number(t.pnl) > 0;
    }).length,
    l = (dd.items || []).filter(function (t) {
      return Number(t.pnl) < 0;
    }).length;
  
  var _trEntryAgg = useMemo(function() {
    var records = [];
    var realSum = 0, ok = 0, ng = 0;
    var _trItems = dd.items || [];
    var charts = data.charts || {};
    allStocks.forEach(function(_trStock) {
      var _trC = charts[_trStock + "_" + date] || {};
      var _trSigs = Array.isArray(_trC.signals) ? _trC.signals : [];
      _trSigs.forEach(function(sig) {
        var s = _compatSignal(sig);
        if (s.entered !== true) return;
        var item = null;
        if (s.itemId != null) {
          for (var _ii = 0; _ii < _trItems.length; _ii++) {
            if (String(_trItems[_ii].id) === String(s.itemId)) { item = _trItems[_ii]; break; }
          }
        }
        records.push({ date: date, stock: _trStock, signal: s, item: item });
        var v = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        if (v != null) realSum += v;
        if (s.result === "ok") ok++;
        else if (s.result === "ng") ng++;
      });
    });
    records.sort(function(a, b) {
      var ta = (a.signal && a.signal.time) || "99:99";
      var tb = (b.signal && b.signal.time) || "99:99";
      return ta.localeCompare(tb);
    });
    return { records: records, realSum: realSum, ok: ok, ng: ng };
  }, [data.charts, dd.items, allStocks, date]);
  var _trEntryRecords = _trEntryAgg.records;
  var _trRealSum = _trEntryAgg.realSum;
  var _trSuccessCount = _trEntryAgg.ok;
  var _trFailCount = _trEntryAgg.ng;
  var dow = DAYS_JP[new Date(date + "T00:00:00").getDay()];
  
  var _dvCurD = new Date(date + "T00:00:00");
  var _dvPrevD = new Date(_dvCurD.getTime() - 86400000);
  var _dvNextD = new Date(_dvCurD.getTime() + 86400000);
  var _dvFmt2 = function(n){ return n < 10 ? "0"+n : ""+n; };
  var _dvToYMD = function(d){ return d.getFullYear()+"-"+_dvFmt2(d.getMonth()+1)+"-"+_dvFmt2(d.getDate()); };
  var _dvToMD = function(d){ return _dvFmt2(d.getMonth()+1)+"-"+_dvFmt2(d.getDate()); };
  var prevDateStr = _dvToYMD(_dvPrevD);
  var nextDateStr = _dvToYMD(_dvNextD);
  var prevDateLabel = _dvToMD(_dvPrevD) + "（" + DAYS_JP[_dvPrevD.getDay()] + "）";
  var nextDateLabel = _dvToMD(_dvNextD) + "（" + DAYS_JP[_dvNextD.getDay()] + "）";
  
  var _dvTodayD = new Date();
  var _todayStr = _dvToYMD(_dvTodayD);
  var isToday = date === _todayStr;
  var I = {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    background: "#fff",
    width: "100%"
  };
  var Card = {
    background: "#fff",
    border: "1px solid #e0ddd6",
    borderRadius: 10,
    padding: IS_TOUCH ? "14px 12px" : "16px 20px",
    marginBottom: 12
  };
  var hasNewsData = Object.values(getAllNewsCatsData(dd)).some(hasCatContent);
  var hasEventsData = hasEventsContent(dd);
  var hasTradeData = _trEntryRecords.length > 0 || (dd.items || []).length > 0 || _hasText(dd.summary) || !!(dd.tradesMemo && (_hasText(dd.tradesMemo.text) || dd.tradesMemo.images && dd.tradesMemo.images.length)) || !!(dd.tradesSummaryMemo && (_hasText(dd.tradesSummaryMemo.text) || dd.tradesSummaryMemo.images && dd.tradesSummaryMemo.images.length));
  var hasSummaryData = !!(_hasText(dd.summaryHtml) ||
    (dd.summaryMemo && (_hasText(dd.summaryMemo.text) ||
      dd.summaryMemo.images && dd.summaryMemo.images.length)));
  var stockHasData = function stockHasData(s) {
    var c = data.charts[s + "_" + date];
    return !!(c && (c.chartImg || c.macroLocal || c.flowCodes && c.flowCodes.length || (c.stockTags && c.stockTags.length || c.chartShapeTags && c.chartShapeTags.length) || c.signals && c.signals.length || (c.chartMemoHtml && c.chartMemoHtml.length > 0) || c.chartMemo && (_hasText(c.chartMemo.text) || c.chartMemo.images && c.chartMemo.images.length)));
  };
  var hasFmData = !!(data.foreignMarkets && data.foreignMarkets[date] &&
    ((data.foreignMarkets[date].indicators || []).length > 0 ||
     (data.foreignMarkets[date].stocks || []).length > 0));
  var hasChartData = allStocks.some(stockHasData) || hasFmData;
  var RedDot = function RedDot() {
    return React.createElement("span", {
      style: {
        position: "absolute",
        top: 5,
        left: 6,
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#E53935",
        pointerEvents: "none"
      }
    });
  };
  return React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 960,
      margin: "0 auto"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
      flexWrap: "nowrap"
    }
  }, React.createElement("button", {
    onClick: onBack,
    style: {
      padding: IS_TOUCH ? "8px 10px" : "8px 14px",
      fontSize: IS_TOUCH ? 12 : 13,
      fontWeight: 500,
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: 7,
      cursor: "pointer",
      minHeight: 40,
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, "\u30DB\u30FC\u30E0\u753B\u9762\u306B\u623B\u308B"), React.createElement("button", {
    onClick: function(){ if (typeof onSelectDate === "function") onSelectDate(prevDateStr); },
    title: "前日: " + prevDateStr,
    style: {
      padding: IS_TOUCH ? "8px 10px" : "8px 12px",
      fontSize: IS_TOUCH ? 12 : 13,
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: 7,
      cursor: "pointer",
      minHeight: 40,
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, "\u2190 " + prevDateLabel), React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center",
      fontSize: IS_TOUCH ? 15 : 18,
      fontWeight: 700,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: isToday ? "#E53935" : undefined
    }
  }, date, "\uFF08", isToday ? "\u672C\u65E5" : dow, "\uFF09"), React.createElement("button", {
    onClick: function(){ if (typeof onSelectDate === "function") onSelectDate(nextDateStr); },
    title: "翌日: " + nextDateStr,
    style: {
      padding: IS_TOUCH ? "8px 10px" : "8px 12px",
      fontSize: IS_TOUCH ? 12 : 13,
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: 7,
      cursor: "pointer",
      minHeight: 40,
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, nextDateLabel + " \u2192"), date !== todayStr() && React.createElement("button", {
    onClick: function(){ if (typeof onSelectDate === "function") onSelectDate(todayStr()); },
    style: {
      padding: IS_TOUCH ? "6px 10px" : "5px 10px",
      fontSize: 11,
      fontWeight: 700,
      background: "#EEF2FF",
      color: "#4338CA",
      border: "1px solid #C7D2FE",
      borderRadius: 7,
      cursor: "pointer",
      minHeight: IS_TOUCH ? 40 : 32,
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, "\u4eca\u65e5")), React.createElement("div", {
    style: {
      display: "flex",
      marginBottom: 14,
      borderBottom: "2px solid #1a1a1a",
      overflowX: "auto"
    }
  }, [["events", "\uD83D\uDCC5 \u4ECA\u65E5\u306E\u4E88\u5B9A\u30FB\u30E1\u30E2", hasEventsData || hasSummaryData], ["news", "📰 ニュース", hasNewsData], ["indicators", "📊 指標", hasFmData], ["charts", "銘柄別記録", hasChartData], ["trades", "📋 取引", hasTradeData]].map(function (_ref58) {
    var _ref59 = _slicedToArray(_ref58, 3),
      k = _ref59[0],
      la = _ref59[1],
      hasDot = _ref59[2];
    return React.createElement("button", {
      key: k,
      onClick: function onClick() {
        return _safeSetTab(k);
      },
      style: {
        position: "relative",
        padding: IS_TOUCH ? "10px 14px" : "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        background: tab === k ? "#1a1a1a" : "transparent",
        color: tab === k ? "#fff" : "#888",
        cursor: "pointer",
        borderRadius: "8px 8px 0 0",
        whiteSpace: "nowrap",
        minHeight: IS_TOUCH ? 44 : 36
      }
    }, hasDot && React.createElement(RedDot, null), la);
  })), tab === "events" && React.createElement("div", null,
    React.createElement(EventsTab, {
      dd: dd,
      date: date,
      save: save,
      allStocks: allStocks,
      custom: custom,
      data: data
    }),
    React.createElement("div", {
      style: { fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginTop: 24, marginBottom: 8 }
    }, "📝 本日の全体メモ・アイディア"),
    React.createElement("div", { style: Card },
      React.createElement(MemoEditableField, {
        key: "mef_summary_" + date,
        html: dd.summaryHtml || _summaryMemoToHtml(dd.summaryMemo),
        onSave: function(h) { updDay("summaryHtml", h); },
        placeholder: "",
        autoEdit: false,
        guardOwner: "summaryMemo_" + date
      })
    )
  ), tab === "news" && React.createElement(NewsTab, {
    dd: dd,
    date: date,
    data: data,
    save: save,
    custom: custom,
    allStocks: allStocks,
    jumpTarget: jumpTarget,
    onJumpTargetConsumed: function() { setJumpTarget(null); },
    chartReturnCtx: chartReturnCtx,
    onChartReturn: function() {
      var ctx = chartReturnCtx;
      setChartReturnCtx(null);
      if (ctx && ctx.stock) setCs(ctx.stock);
      _safeSetTab("charts");
    },
    onJumpToStock: function(s) {
      if (!s) return;
      setCs(s);
      setFmActive(false);
      _safeSetTab("charts");
    }
  }), tab === "indicators" && React.createElement("div", null,
    React.createElement("div", {
      style: { display: "flex", gap: 2, marginBottom: 14, borderBottom: "2px solid #1a1a1a", overflowX: "auto" }
    },
      (function() {
        var _itL = { "fm": "🌏 外国市場", "nikkei": "📈 日経平均株価" };
        var _ito = (custom.indTabOrder && custom.indTabOrder.length === 2 && custom.indTabOrder.every(function(k) { return !!_itL[k]; }))
          ? custom.indTabOrder : ["fm", "nikkei"];
        return _ito.map(function(k, i) {
          return React.createElement("button", {
            key: k,
            draggable: true,
            onClick: function() { _setIndTab(k); },
            onDragStart: function(e) { indTabDragRef.current = i; e.dataTransfer.effectAllowed = "move"; },
            onDragOver: function(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; },
            onDrop: function(e) {
              e.preventDefault();
              var from = indTabDragRef.current;
              indTabDragRef.current = null;
              if (from === null || from === i) return;
              var no = _ito.slice();
              no.splice(i, 0, no.splice(from, 1)[0]);
              updCustom({ indTabOrder: no });
            },
            onDragEnd: function() { indTabDragRef.current = null; },
            style: { padding: IS_TOUCH ? "10px 14px" : "10px 16px", fontSize: 13, fontWeight: 600,
              border: "none", background: indTab === k ? "#1a1a1a" : "transparent",
              color: indTab === k ? "#fff" : "#888", cursor: IS_TOUCH ? "pointer" : "grab",
              borderRadius: "8px 8px 0 0", whiteSpace: "nowrap", minHeight: IS_TOUCH ? 44 : 36 }
          }, _itL[k]);
        });
      })()
    ),
    indTab === "fm" && React.createElement(React.Fragment, null,
      React.createElement(ForeignMarketTable, {
        date: date, data: data, save: save, custom: custom,
        showSections: ["indicator"],
        hideSectionLabel: true,
        onOpenSettings: function() { setShowFmSettings(true); }
      }),
      showFmSettings && React.createElement(ForeignMarketSettingsModal, {
        custom: custom, save: save, onClose: function() { setShowFmSettings(false); }
      })
    ),
    indTab === "nikkei" && React.createElement(React.Fragment, null,
      React.createElement(StockQuickRefTableWithChart, {
        data: data, activeStock: "日経平均株価",
        onSelectDate: onSelectDate, highlightDate: date,
        weekOffset: weekOffset, setWeekOffset: setWeekOffset
      }),
      React.createElement("div", null,
        React.createElement(ChartSectionDailyCandle, {
          stock: "日経平均株価", data: data, custom: custom, cfg: cfg, highlightDate: date
        })
      ),
      React.createElement("div", { style: Card },
        React.createElement("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 12 } },
          "日経平均株価 — ", date),
        React.createElement(ChartSection, {
          stock: "日経平均株価", date: date, data: data, save: save,
          custom: custom, cfg: cfg, onSelectDate: jumpTo,
          hideSignals: true,
          onOpenEntryLog: onOpenEntryLog || null,
          onJumpToNews: function(catName, niId) {
            if (catName && niId) {
              setJumpTarget({ catName: catName, niId: niId, ts: Date.now() });
              setChartReturnCtx({ stock: "日経平均株価" });
            } else if (catName) {
              try {
                var _svN = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
                localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, _svN, { newsCat: catName })));
              } catch(e){}
            }
            _safeSetTab("news");
          }
        })
      )
    )
  ), tab === "charts" && React.createElement("div", null, React.createElement(StockTabs, {
    stocks: allStocks.filter(function(s) { return s !== "日経平均株価"; }),
    active: fmActive ? "" : activeStock,
    onSelect: function(s) { setCs(s); setFmActive(false); },
    onReorder: function onReorder(stocks) {
      return updCustom({
        stocks: stocks
      });
    },
    onAdd: addStock,
    onDel: handleDelStock,
    onRename: handleRenameStock,
    onRestore: handleRestoreStock,
    onPurge: handlePurgeStock,
    hiddenStocks: hiddenStocks,
    hasData: stockHasData,
    fmActive: fmActive,
    onFmSelect: function() { setFmActive(true); },
    hasFmData: hasFmData
  }),
  fmActive
    ? React.createElement(React.Fragment, null,
        React.createElement(ForeignMarketTable, {
          date: date, data: data, save: save, custom: custom,
          showSections: ["stock"],
          onOpenSettings: function() { setShowFmSettings(true); }
        }),
        showFmSettings && React.createElement(ForeignMarketSettingsModal, {
          custom: custom, save: save, onClose: function() { setShowFmSettings(false); }
        })
      )
    : React.createElement(React.Fragment, null,
  React.createElement(StockQuickRefTableWithChart, {
    data: data,
    activeStock: activeStock,
    onSelectDate: onSelectDate,
    highlightDate: date,
    weekOffset: weekOffset,
    setWeekOffset: setWeekOffset
  }),
  React.createElement("div", null,
    React.createElement(ChartSectionDailyCandle, {
      stock: activeStock, data: data, custom: custom, cfg: cfg, highlightDate: date
    })
  ),
  React.createElement("div", {
    style: Card
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 12
    }
  }, activeStock, " \u2014 ", date), React.createElement(ChartSection, {
    stock: activeStock,
    date: date,
    data: data,
    save: save,
    custom: custom,
    cfg: cfg,
    onSelectDate: jumpTo,
    onOpenEntryLog: onOpenEntryLog || null,
    onJumpToNews: function(catName, niId) {
      
      
      
      if (catName && niId) {
        setJumpTarget({ catName: catName, niId: niId, ts: Date.now() });
        setChartReturnCtx({ stock: activeStock });
      } else if (catName) {
        
        try {
          var _sv = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
          localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, _sv, { newsCat: catName })));
        } catch(e){}
      }
      _safeSetTab("news");
    }
  })))), tab === "trades" && React.createElement("div", null,
  React.createElement("div", { style: Card },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
      React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "エントリー記録"),
      React.createElement("div", { style: { display: "flex", gap: 6 } },
        React.createElement("button", {
          onClick: function() { try { window.open(CA_URL, "_blank", "noopener"); } catch(e){} },
          title: "チャート分析ツールを開く",
          style: { padding: "9px 12px", fontSize: 12, fontWeight: 600, background: "#EEF2FF", border: "1.5px solid #C7D2FE", borderRadius: 6, cursor: "pointer", color: "#4338CA", minHeight: IS_TOUCH ? 40 : 32 }
        }, "📐 チャート分析"),
        onOpenEntryLog && React.createElement("button", {
          onClick: onOpenEntryLog,
          title: "エントリー記録帳を開く",
          style: { padding: "9px 12px", fontSize: 12, fontWeight: 600, background: "#FFF7ED", border: "1.5px solid #FDBA74", borderRadius: 6, cursor: "pointer", color: "#9A3412", minHeight: IS_TOUCH ? 40 : 32 }
        }, "📖 記録帳"),
        React.createElement("button", {
          onClick: function() { setTradeEditTarget(null); setShowForm(true); },
          style: { padding: "9px 18px", fontSize: 13, fontWeight: 600, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 40 : 32 }
        }, "＋ 追加")
      )
    ),
    _trEntryRecords.length === 0 && !showForm && React.createElement("div", {
      style: { textAlign: "center", padding: 20, color: "#ccc", fontSize: 13 }
    }, "記録なし"),
    _trEntryRecords.length > 0 && (function() {
      var _trRPnlCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
      var _trRPnlFmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
      var _trBadge = function(grade) {
        if (!grade) return null;
        var gs = _GRADE_STYLE[grade] || _GRADE_STYLE.Z;
        return React.createElement("span", { title: grade,
          style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 18, height: 18, borderRadius: "50%",
            background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
            fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 }
        }, grade);
      };
      var _trRPnlDisp = function(v, grade) {
        if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          grade && grade !== "Z" ? _trBadge(grade) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _trRPnlCol(v) } }, _trRPnlFmt(v))
        );
      };
      var _trRPnlDispABAll = function(abV, allV, abGrade, allGrade) {
        if (abV == null && allV == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        var _mkSmBadge = function(g) {
          var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
          return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color,
            border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 1, flexShrink: 0 } }, g);
        };
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          abGrade ? _trBadge(abGrade) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _trRPnlCol(abV) } }, _trRPnlFmt(abV)),
          abV !== allV ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
            React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "("),
            allGrade ? _mkSmBadge(allGrade) : null,
            React.createElement("span", { style: { color: _trRPnlCol(allV), fontSize: 10 } }, _trRPnlFmt(allV)),
            React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, ")")
          ) : null
        );
      };
      var _trTh = function(label, extra) {
        return React.createElement("th", { style: Object.assign({ padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" }, extra || {}) }, label);
      };
      var _trRecKey = function(r) { return r.stock + "_" + (r.signal.id || r.signal.time || ""); };
      var _trTotReal = null, _trTotPlan = null, _trTotMax = null, _trTotHold = null;
      var _trTotRealCnt = 0, _trTotPlanCnt = 0, _trTotMaxCnt = 0, _trTotHoldCnt = 0;
      var _trTotPlanAB = null, _trTotMaxAB = null;
      var _trTotPlanABCnt = 0, _trTotMaxABCnt = 0;
      _trEntryRecords.forEach(function(r) {
        var s = r.signal, rIt = r.item;
        var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
        var _p100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
        var rp = (rIt && rIt.pnl != null) ? Number(rIt.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        var _aiTr0 = _elAlphaInfo(r, data);
        var pp = _elDynPlanned(s, _aiTr0.alpha, _aiTr0.cutLine);
        var mp = _elSignedVal(s.maxPnl, s.maxPnlSign);
        var hp = _elDynHold(s, _aiTr0.alpha, _aiTr0.cutLine);
        var rpN = rp != null ? _p100(rp) : null;
        var ppN = pp;
        var mpN = mp != null ? _p100(mp) : null;
        var hpN = hp;
        if (rpN != null) { _trTotReal = (_trTotReal || 0) + rpN; _trTotRealCnt++; }
        if (ppN != null) { _trTotPlan = (_trTotPlan || 0) + ppN; _trTotPlanCnt++; }
        if (mpN != null) { _trTotMax  = (_trTotMax  || 0) + mpN; _trTotMaxCnt++; }
        if (hpN != null) { _trTotHold = (_trTotHold || 0) + hpN; _trTotHoldCnt++; }
        var _isAB = (s.difficulty === "A" || s.difficulty === "B");
        if (ppN != null && _isAB) { _trTotPlanAB = (_trTotPlanAB || 0) + ppN; _trTotPlanABCnt++; }
        if (mpN != null && _isAB) { _trTotMaxAB  = (_trTotMaxAB  || 0) + mpN; _trTotMaxABCnt++; }
      });
      var _trTotRealGrade = _trTotRealCnt > 0 ? _profitGradeFromPnlReal(_trTotReal != null ? _trTotReal : 0, _trTotRealCnt) : null;
      var _trTotPlanGrade = _trTotPlanCnt > 0 ? _profitGradeFromPnl(_trTotPlan != null ? _trTotPlan : 0, _trTotPlanCnt) : null;
      var _trTotMaxGrade  = _trTotMaxCnt  > 0 ? _profitGradeFromPnl(_trTotMax  != null ? _trTotMax  : 0, _trTotMaxCnt)  : null;
      var _trTotPlanGradeAB = _trTotPlanABCnt > 0 ? _profitGradeFromPnl(_trTotPlanAB != null ? _trTotPlanAB : 0, _trTotPlanABCnt) : null;
      var _trTotMaxGradeAB  = _trTotMaxABCnt  > 0 ? _profitGradeFromPnl(_trTotMaxAB  != null ? _trTotMaxAB  : 0, _trTotMaxABCnt)  : null;
      var allTrExp = _trEntryRecords.every(function(r) { return !!trTableRecExp[_trRecKey(r)]; });
      var totRow = React.createElement("tr", { key: "__trtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 9, style: { textAlign: "center", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C", borderBottom: "1px solid #f0ede6" } }, "合計"),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
          _trTotRealCnt > 0 ? _trRPnlDisp(_trTotReal, _trTotRealGrade) : React.createElement("span", { style: { color: "#ccc" } }, "—")
        ),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
          _trRPnlDispABAll(_trTotPlanAB, _trTotPlan, _trTotPlanGradeAB, _trTotPlanGrade)
        ),
        React.createElement("td", { style: { borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } }),
        React.createElement("td", { style: { borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } }),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
          _trTotHoldCnt > 0
            ? React.createElement("span", { style: { fontWeight: 700, fontSize: 11, color: (_trTotHold||0) > 0 ? "#C0392B" : (_trTotHold||0) < 0 ? "#1E8449" : "#888" } },
                ((_trTotHold||0) > 0 ? "+" : "") + (_trTotHold||0).toLocaleString() + "円")
            : React.createElement("span", { style: { color: "#ccc" } }, "—")
        )
      );
      var dataRows = [];
      _trEntryRecords.forEach(function(r) {
        var rKey = _trRecKey(r);
        var rExp = !!trTableRecExp[rKey];
        var s = r.signal, rIt = r.item;
        var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
        var _p100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
        var realPnl = (rIt && rIt.pnl != null) ? Number(rIt.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        var _aiTr = _elAlphaInfo(r, data);
        var planPnlN = _elDynPlanned(s, _aiTr.alpha, _aiTr.cutLine);
        var maxPnlN  = planPnlN;
        var _hpTr = _elDynHold(s, _aiTr.alpha, _aiTr.cutLine);
        var _dynResTr = _elDynResult(s, _aiTr.alpha, _aiTr.cutLine);
        var _dynHPtr = (function() {
          var hp = _hpTr, pp = planPnlN;
          if (hp == null) return s.holdProfit;
          if (_dynResTr === "miss" || _dynResTr === "draw") return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
          if (pp == null) return s.holdProfit;
          if (pp > 0 && hp > 0) return hp > pp ? "yes" : hp < pp ? "mid" : "none";
          if (pp < 0 && hp < 0) return "no";
          if (pp > 0 && hp < 0) return "no";
          if (pp < 0 && hp > 0) return "yes";
          if (hp === 0) return "none";
          return s.holdProfit;
        })();
        var realPnlN = realPnl != null ? _p100(realPnl) : null;
        var entered = _elIsEntered(s, rIt);
        var realGrade = (entered && realPnlN != null) ? _profitGradeFromPnlReal(realPnlN, 1) : null;
        var planGrade = planPnlN != null ? _profitGradeFromPnl(planPnlN, 1) : null;
        var holdResultEl = _dynHPtr === "yes"
          ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "○")
          : _dynHPtr === "mid"
            ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700 } }, "△")
            : _dynHPtr === "none"
              ? React.createElement("span", { style: { color: "#888", fontWeight: 700 } }, "ー")
              : _dynHPtr === "no"
                ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "×")
                : React.createElement("span", { style: { color: "#ccc" } }, "—");
        var entLabel = entered
          ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "実エントリー")
          : React.createElement("span", { style: { color: "#888" } }, "見送り");
        var _sigParts = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
        var sigLabel = _sigParts.length > 0 ? _sigParts.join(" / ") : "(未設定)";
        var resultEl = _dynResTr === "ok"
          ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 13 } }, "○")
          : _dynResTr === "ng"
            ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700, fontSize: 13 } }, "×")
            : React.createElement("span", { style: { color: "#ccc" } }, "—");
        var rKeyRef = rKey;
        dataRows.push(
          React.createElement("tr", { key: rKey,
            style: { cursor: "pointer", background: rExp ? "#FFFBF5" : "transparent" },
            onClick: function() { setTrTableRecExp(function(prev) { var n = Object.assign({}, prev); if (n[rKeyRef]) delete n[rKeyRef]; else n[rKeyRef] = true; return n; }); }
          },
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
              React.createElement("span", { style: { marginRight: 3, color: "#F97316", fontSize: 9 } }, rExp ? "▼" : "▶"),
              s.time || "—"
            ),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", color: "#9A3412" } }, r.stock),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, sigLabel),
            React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%",
              color: s.difficulty ? (s.difficulty === "A" ? "#B71C1C" : s.difficulty === "B" ? "#C62828" : "#666") : "#ccc",
              fontWeight: s.difficulty ? 700 : 400 } }, s.difficulty || "—"),
            React.createElement("td", {
              style: { padding: "1px 2px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%", minWidth: 52 },
              onClick: function(e) { e.stopPropagation(); }
            },
              (function(_osR) {
                var _osS = _osR.signal;
                return React.createElement(FastInput, {
                  type: "text", inputMode: "decimal",
                  value: _osS.osVal != null ? String(_osS.osVal) : "",
                  transformInput: _toHankaku,
                  placeholder: "\u2014",
                  debounceMs: 86400000,
                  onChange: function(v) {
                    var _ov = _toHankaku(v).trim();
                    var n = _ov === "" ? null : (isNaN(Number(_ov)) ? null : Number(_ov));
                    _elSaveSignal(save, _osR.stock, date, Object.assign({}, _osS, { osVal: n }), false);
                  },
                  onKeyDown: function(e) {
                    if (e.key === "Enter") { e.target.__fiCommit && e.target.__fiCommit(); e.target.blur(); return; }
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault();
                      var _cur = _toHankaku(e.target.value).trim();
                      var _n = _cur === "" ? 0 : (isNaN(Number(_cur)) ? 0 : Number(_cur));
                      var _newN = _n + (e.key === "ArrowUp" ? 1 : -1);
                      e.target.value = String(_newN);
                      _elSaveSignal(save, _osR.stock, date, Object.assign({}, _osS, { osVal: _newN }), false);
                    }
                  },
                  style: { width: "100%", fontSize: 11, border: "none", outline: "none",
                    textAlign: "right", padding: "3px 4px", background: "transparent",
                    fontVariantNumeric: "tabular-nums",
                    color: _osS.osVal != null ? _vcol(_osS.osVal, true) : "#333",
                    fontWeight: (_osS.osVal != null && Number(_osS.osVal) >= 10) ? 700 : 600 }
                });
              })(r)
            ),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              s.osConfVal != null && Number(s.osConfVal) === 0
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#888" } }, "0")
                : s.osConfSign
                  ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.osConfVal, s.osConfSign === "+"), fontWeight: Number(s.osConfVal) >= 10 ? 700 : 600 } },
                      "\u2195" + (s.osConfVal != null ? String(Math.abs(Number(s.osConfVal))) : ""))
                  : React.createElement("span", { style: { color: "#ddd" } }, "\u2014")),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              (function() {
                if (s.osConfVal == null || s.osConfVal === "") return React.createElement("span", { style: { color: "#ddd" } }, "\u2014");
                var _cf = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
                var _ew = (_aiTr.alpha != null ? _aiTr.alpha : 5) - _cf;
                if (_ew === 0) return React.createElement("span", { style: { color: "#888" } }, "0");
                var _ewAbs = Math.abs(_ew);
                return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewAbs, _ew < 0), fontWeight: _ewAbs >= 10 ? 700 : 600 } }, (_ew > 0 ? "\u2193" : "\u2191") + _ewAbs);
              })()),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, entLabel),
            React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } }, resultEl),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, _tradeAlphaChip(s), _trRPnlDisp(realPnlN, realGrade)),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, _trRPnlDisp(planPnlN, planGrade)),
            React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              s.holdHighVal != null
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdHighVal, s.holdHighSign === "-"), fontWeight: s.holdHighVal >= 10 ? 700 : 600 } },
                    (s.holdHighSign === "+" ? "↓" : s.holdHighSign === "-" ? "↑" : "") + s.holdHighVal)
                : React.createElement("span", { style: { color: "#ddd" } }, "—")),
            React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              s.holdWidthSign != null && s.holdWidth != null
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdWidth, s.holdWidthSign === "-"), fontWeight: s.holdWidth >= 10 ? 700 : 600 } }, "↕" + s.holdWidth)
                : React.createElement("span", { style: { color: "#ddd" } }, "—")),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" } }, (function() {
              var _hp = _hpTr;
              var _isMiss = _dynResTr === "miss";
              var _hg = _hp != null ? _profitGradeFromPnl(_hp, 1) : null;
              var _pnlEl = _hp == null ? null : (function() {
                var _col = _isMiss ? (_hp > 0 ? "#E07070" : _hp < 0 ? "#70A888" : "#aaa") : (_hp > 0 ? "#C0392B" : _hp < 0 ? "#1E8449" : "#888");
                var _txt = (_hp > 0 ? "+" : "") + _hp.toLocaleString() + "円";
                return React.createElement("span", { style: { fontWeight: _isMiss ? 400 : 600, color: _col, fontSize: 10 } }, _isMiss ? "(" + _txt + ")" : _txt);
              })();
              return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" } },
                holdResultEl, !_isMiss && _hg ? _trBadge(_hg) : null, _pnlEl
              );
            })())
          )
        );
        if (rExp) {
          dataRows.push(
            React.createElement("tr", { key: rKey + "_card" },
              React.createElement("td", { colSpan: 14, style: { padding: "4px 8px 8px", background: "#FFFBF5", borderBottom: "1px solid #f0ede6" } },
                React.createElement(EntryLogCard, { record: r, data: data, onEdit: function(rec) { setTradeEditTarget(rec); setShowForm(true); } })
              )
            )
          );
        }
      });
      return React.createElement(React.Fragment, null,
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "0 0 8px 0" } },
          React.createElement("button", {
            onClick: function() {
              if (allTrExp) { setTrTableRecExp({}); }
              else { setTrTableRecExp(function() { var n = {}; _trEntryRecords.forEach(function(r) { n[_trRecKey(r)] = true; }); return n; }); }
            },
            style: { padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #ddd", background: "#fff", color: "#555", borderRadius: 4, cursor: "pointer" }
          }, allTrExp ? "▲ すべて折りたたむ" : "▼ すべて展開")
        ),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } },
            React.createElement("thead", null,
              React.createElement("tr", null,
                _trTh("時間", { textAlign: "left" }),
                _trTh("銘柄"),
                _trTh("シグナル"),
                _trTh("難易度", { width: "1%" }),
                _trTh("OS値", { width: "1%" }),
                _trTh("確定値", { width: "1%" }),
                _trTh("α値比値幅", { width: "1%" }),
                _trTh("エントリー"),
                _trTh("結果", { width: "1%" }),
                _trTh("実現損益"),
                _trTh("想定損益"),
                _trTh("H高値", { width: "1%" }),
                _trTh("H確定値", { width: "1%" }),
                _trTh("H勝敗/結果損益（α値比）")
              )
            ),
            React.createElement("tbody", null, [totRow].concat(dataRows))
          )
        ),
        (function() {
          var _trVirtByStk = {};
          var _trCutLineByStk = {};
          _trEntryRecords.forEach(function(r) {
            var s = r.signal;
            if (!_trVirtByStk[r.stock]) _trVirtByStk[r.stock] = [];
            var conf = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
            _trVirtByStk[r.stock].push({ osVal: s.osVal != null ? Number(s.osVal) : null, conf: conf, holdOsConf: s.holdOsConf != null ? Number(s.holdOsConf) : null, holdHighVal: s.holdHighVal != null ? Number(s.holdHighVal) : null, holdHighSign: s.holdHighSign || null });
            var _cTr = (data.charts || {})[r.stock + "_" + date];
            _trCutLineByStk[r.stock] = _cTr && _cTr.cutLine != null ? _cTr.cutLine : 10;
          });
          if (!Object.keys(_trVirtByStk).length) return null;
          
          var _trStks = Object.keys(_trVirtByStk);
          var _trAlphaByStk = {};
          _trStks.forEach(function(sk) {
            var sigs = _trVirtByStk[sk];
            var cutLine = _trCutLineByStk[sk] != null ? _trCutLineByStk[sk] : 10;
            var calcProfit = function(alpha) {
              var total = 0, hasAny = false;
              sigs.forEach(function(d) {
                if (d.osVal == null) return;
                hasAny = true;
                if (alpha > d.osVal) {  }
                else if (d.osVal - alpha >= cutLine) { total += -(d.osVal - alpha) * 100; }
                else { if (d.conf == null) { hasAny = false; return; } total += (alpha - d.conf) * 100; }
              });
              return hasAny ? Math.round(total) : null;
            };
            var minA = null, tgtA = null, maxA = null, maxP = null;
            for (var _a = 0; _a <= 20; _a++) {
              var _p = calcProfit(_a);
              if (_p == null) continue;
              if (minA == null && _p >= 1) minA = _a;
              if (tgtA == null && _p >= 2500) tgtA = _a;
              if (maxP == null || _p > maxP) { maxP = _p; maxA = _a; }
            }
            if (tgtA == null && maxA != null) tgtA = maxA;
            _trAlphaByStk[sk] = {
              minAlpha: minA, tgtAlpha: tgtA, maxAlpha: maxA,
              minProfit: minA != null ? calcProfit(minA) : null,
              tgtProfit: tgtA != null ? calcProfit(tgtA) : null,
              maxProfit: maxA != null ? calcProfit(maxA) : null
            };
          });
          var _trHasAlpha = _trStks.some(function(sk) {
            var d = _trAlphaByStk[sk]; return d.minAlpha != null || d.tgtAlpha != null || d.maxAlpha != null;
          });
          var _fmtA = function(v) { return v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, v + "円"); };
          var _fmtP = function(v) {
            if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            return React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円");
          };
          var _aTh = function(label, extra) { return React.createElement("th", { style: Object.assign({ padding: "2px 6px", fontWeight: 700, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center" }, extra || {}) }, label); };
          var _idealAlphaTable = _trHasAlpha ? React.createElement("div", { style: { marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "α 理想α値（0〜20円）"),
            React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "α値を何円に固定していたら最適だったか（確定値の平均ベース・100株換算）"),
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 11, width: "100%" } },
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    _aTh("銘柄", { textAlign: "left" }),
                    _aTh("最低利益α値", { borderLeft: "1px solid #dbeafe" }),
                    _aTh("想定利益", { fontWeight: 600 }),
                    _aTh("目標利益α値", { borderLeft: "1px solid #dbeafe" }),
                    _aTh("想定利益", { fontWeight: 600 }),
                    _aTh("最大利益α値", { borderLeft: "1px solid #dbeafe" }),
                    _aTh("想定利益", { fontWeight: 600 })
                  )
                ),
                React.createElement("tbody", null,
                  _trStks.map(function(sk) {
                    var d = _trAlphaByStk[sk];
                    return React.createElement("tr", { key: sk, style: { borderBottom: "1px solid #dbeafe" } },
                      React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#9A3412", fontSize: 11 } }, sk),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #dbeafe" } }, _fmtA(d.minAlpha)),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 11 } }, _fmtP(d.minProfit)),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #dbeafe" } }, _fmtA(d.tgtAlpha)),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 11 } }, _fmtP(d.tgtProfit)),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #dbeafe" } }, _fmtA(d.maxAlpha)),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 11 } }, _fmtP(d.maxProfit))
                    );
                  })
                )
              )
            )
          ) : null;
          return React.createElement(React.Fragment, null,
            _idealAlphaTable,
            React.createElement(VirtualAlphaCalc, { sigsByStock: _trVirtByStk, cutLineByStock: _trCutLineByStk })
          );
        })()
      );
    })(),
    _trEntryRecords.length > 0 && React.createElement("div", {
      style: { display: "flex", gap: 20, marginTop: 12, paddingTop: 10, borderTop: "1px solid #e0ddd6", fontSize: 14, alignItems: "center", flexWrap: "wrap" }
    },
      (function() {
        var _trCount = _trEntryRecords.filter(function(r){ return _elIsEntered(r.signal, r.item); }).length;
        var _tg = _profitGradeFromPnlReal(_trRealSum, _trCount);
        var _ts = _GRADE_STYLE[_tg] || _GRADE_STYLE.Z;
        var _trLegendPairs = [["A","25001円~"],["B","10001~25000円"],["C","1~10000円"],["D","0円"],["E","-1~-10000円"],["F","-10001~-25000円"],["G","-25001円~"],["Z","取引なし"]];
        var _trRenderLegendRow = function(items) {
          return React.createElement("div", { style: { display: "flex", gap: "3px 8px", flexWrap: "wrap" } },
            items.map(function(pair) {
              var pgs = _GRADE_STYLE[pair[0]] || _GRADE_STYLE.Z;
              return React.createElement("div", { key: pair[0], style: { display: "flex", gap: 3, alignItems: "center", whiteSpace: "nowrap" } },
                React.createElement("span", {
                  style: { fontWeight: 800, color: pgs.color, fontSize: 9,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 13, height: 13, borderRadius: "50%",
                    background: pgs.bg, border: "1px solid " + pgs.border }
                }, pair[0]),
                React.createElement("span", null, pair[1])
              );
            })
          );
        };
        return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
            "損益合計 ",
            React.createElement("span", {
              style: { fontWeight: 700, color: _trRealSum >= 0 ? "#C0392B" : "#1E8449" }
            }, (_trRealSum > 0 ? "+" : "") + _trRealSum.toLocaleString() + "円"),
            React.createElement("span", {
              title: "実現損益ランク: " + _tg + " (" + (_GRADE_DESC_REAL[_tg] || "") + ")",
              style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: _ts.bg, color: _ts.color, border: "1.5px solid " + _ts.border, fontWeight: 800, fontSize: 12 }
            }, _tg)
          ),
          React.createElement("div", {
            style: { fontSize: 9, color: "#999", background: "#f9f8f6",
              border: "1px solid #e0ddd6", borderRadius: 6, padding: "3px 7px",
              display: "flex", flexDirection: "column", gap: 2 }
          },
            _trRenderLegendRow(_trLegendPairs.slice(0, 4)),
            _trRenderLegendRow(_trLegendPairs.slice(4))
          )
        );
      })(),
      React.createElement("div", null, "成功/失敗 ", React.createElement("span", {
        style: { fontWeight: 600 }
      }, _trSuccessCount, "勝", _trFailCount, "敗"))
    )
  ),
  
  (function() {
    
    var _pbByStk = {};
    var _pbRealByStk = {}; 
    var _pbEntByStk = {};  
    var _pbCharts = data.charts || {};
    var _pbItems = dd.items || [];
    allStocks.forEach(function(stk) {
      var _pbC = _pbCharts[stk + "_" + date] || {};
      var _pbSigs = Array.isArray(_pbC.signals) ? _pbC.signals : [];
      if (!_pbSigs.length) return;
      _pbSigs.forEach(function(sig) {
        var s = _compatSignal(sig);
        var item = null;
        if (s.itemId != null) {
          for (var _ii = 0; _ii < _pbItems.length; _ii++) {
            if (String(_pbItems[_ii].id) === String(s.itemId)) { item = _pbItems[_ii]; break; }
          }
        }
        if (!_pbByStk[stk]) { _pbByStk[stk] = []; _pbRealByStk[stk] = 0; _pbEntByStk[stk] = 0; }
        _pbByStk[stk].push({ date: date, stock: stk, signal: s, item: item });
        var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        if (rv != null) _pbRealByStk[stk] += rv;
        if (s.entered === true) _pbEntByStk[stk]++;
      });
    });
    var _pbStks = Object.keys(_pbByStk).sort();
    if (!_pbStks.length) return null;
    
    var _pbAllRecs = [];
    var _pbAllReal = 0, _pbAllEnt = 0;
    _pbStks.forEach(function(sk) {
      _pbAllRecs = _pbAllRecs.concat(_pbByStk[sk]);
      _pbAllReal += _pbRealByStk[sk];
      _pbAllEnt  += _pbEntByStk[sk];
    });
    var _pbAll = _elCalcStats(_pbAllRecs);
    var _pbDynOkNg = function(recs) { var ok = 0, ng = 0, draw = 0, miss = 0; (recs || []).forEach(function(r) { var s = r.signal; var _cR = _pbCharts[r.stock + "_" + date]; var _aR = pbSimAlpha !== null ? pbSimAlpha : (_cR && _cR.alphaVal != null ? _cR.alphaVal : 5); var _cutLOkNg = (pbSimAlpha !== null && pbSimCutLine !== null) ? pbSimCutLine : (_cR && _cR.cutLine != null ? _cR.cutLine : 10); var dynR = null; if (_aR != null && s.osVal != null && Number(s.osVal) > 0) { var _dv = Number(s.osVal) - _aR; if (_dv < 0) dynR = "miss"; else if (_dv >= _cutLOkNg) dynR = "ng"; else if (s.osConfVal != null && s.osConfVal !== "") { var _cf = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0; dynR = _cf < _aR ? "ok" : _cf === _aR ? "draw" : "ng"; } } var res = dynR !== null ? dynR : s.result; if (res === "ok") ok++; else if (res === "ng") ng++; else if (res === "draw") draw++; else if (res === "miss") miss++; }); var tot = ok + ng; return { ok: ok, ng: ng, draw: draw, miss: miss, winPct: tot > 0 ? Math.round(ok / tot * 100) : null }; };
    var _pbFmt = function(v) { return (v > 0 ? "+" : "") + v + "円"; };
    var _pbCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _pbTh = function(label, extra) {
      return React.createElement("th", { style: Object.assign({ padding: "4px 3px", fontWeight: 700, borderBottom: "2px solid #ddd", width: "1%", textAlign: "center", fontSize: 10, lineHeight: 1.2 }, extra || {}) }, label);
    };
    var _pbBadge = function(grade) {
      var gs = _GRADE_STYLE[grade] || _GRADE_STYLE.Z;
      return React.createElement("span", {
        title: grade,
        style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: "50%",
          background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
          fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 }
      }, grade);
    };
    var _pbSlash = function(sum, ev, grade, sumFw) {
      if (sum === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        grade ? _pbBadge(grade) : null,
        React.createElement("span", { style: { fontWeight: sumFw || 600, color: _pbCol(sum) } }, _pbFmt(sum))
      );
    };
    var _pbABAll = function(recs, allSum, allEv, grade, sumKey, evKey, dynAbSum) {
      var abRecs = (recs || []).filter(function(r) {
        var d = r.signal && r.signal.difficulty;
        return d === "A" || d === "B";
      });
      var abSum = 0;
      if (dynAbSum !== undefined) {
        abSum = dynAbSum !== null ? dynAbSum : 0;
      } else if (abRecs.length > 0) {
        var abSt = _elCalcStats(abRecs);
        abSum = abSt[sumKey] || 0;
      }
      if (allSum === 0 && allEv == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
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
        abGrade ? _pbBadge(abGrade) : null,
        React.createElement("span", { style: { fontWeight: 600, color: _pbCol(abSum) } }, _pbFmt(abSum)),
        abSum !== allSum ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "("),
          allGrade ? _mkSmBadge(allGrade) : null,
          React.createElement("span", { style: { color: _pbCol(allSum), fontSize: 10 } }, _pbFmt(allSum)),
          React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, ")")
        ) : null
      );
    };
    
    var _pbRealABAll = function(recs) {
      if (!recs || !recs.length) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      var abRecs = recs.filter(function(r) {
        var d = r.signal && r.signal.difficulty;
        return d === "A" || d === "B";
      });
      var allSt = _elCalcStats(recs);
      var abSt  = abRecs.length > 0 ? _elCalcStats(abRecs) : null;
      
      var _rawPnl = function(rs) {
        return rs.reduce(function(a, r) {
          var v = (r.item && r.item.pnl != null) ? Number(r.item.pnl)
                : _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
          return a + (v != null ? v : 0);
        }, 0);
      };
      var _entCnt = function(rs) { return rs.filter(function(r) { return _elIsEntered(r.signal, r.item); }).length; };
      var allRaw = _rawPnl(recs), allEnt = _entCnt(recs);
      var abRaw  = _rawPnl(abRecs), abEnt  = _entCnt(abRecs);
      if (allSt.sumPnl === 0 && allEnt === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      var abGrade  = abEnt  > 0 ? _profitGradeFromPnlReal(abRaw,  abEnt)  : null;
      var allGrade = allEnt > 0 ? _profitGradeFromPnlReal(allRaw, allEnt) : null;
      
      var mainGrade = abEnt > 0 ? abGrade : "D";
      var mainSum   = abEnt > 0 ? (abSt ? abSt.sumPnl : 0) : 0;
      var allSum    = allSt.sumPnl;
      var _mkSm = function(g) {
        var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
        return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color,
          border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 1, flexShrink: 0 } }, g);
      };
      return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        _pbBadge(mainGrade),
        React.createElement("span", { style: { fontWeight: 600, color: _pbCol(mainSum) } }, _pbFmt(mainSum)),
        
        allEnt > 0
          ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "("),
              allGrade ? _mkSm(allGrade) : null,
              React.createElement("span", { style: { color: _pbCol(allSum), fontSize: 10 } }, _pbFmt(allSum)),
              React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, ")")
            )
          : null
      );
    };
    var _pbRow = function(label, st, isTotal, labelColor, gradeReal, gradePlanned, gradeMax, hasEntry, rowKey, tags, recs) {
      var bb = isTotal ? "2px solid #ddd" : "1px solid #e0ddd6";
      var bt = isTotal ? "2px solid #ccc" : "none";
      var br = "1px solid #e0ddd6";
      var isExp = !!pnlTableExpandSet[rowKey];
      var bg = isExp ? "#FFF7ED" : (isTotal ? "#F5F0E8" : "transparent");
      var keyRef = rowKey;
      return React.createElement("tr", {
        style: { background: bg, cursor: rowKey ? "pointer" : "default" },
        onClick: rowKey ? function() { setPnlTableExpandSet(function(prev) { var n = Object.assign({}, prev); if (n[keyRef]) delete n[keyRef]; else n[keyRef] = true; return n; }); if (isExp) setPnlRecordExpandSet({}); } : undefined
      },
        React.createElement("td", { style: { padding: "3px 5px", textAlign: "left", fontWeight: isTotal ? 700 : 600, fontSize: 11, whiteSpace: "nowrap", width: "auto",
          color: labelColor || "#9A3412", borderBottom: bb, borderTop: bt, borderRight: br } },
          rowKey ? React.createElement("span", { style: { marginRight: 4, color: "#F97316", fontSize: 10 } }, isExp ? "▼" : "▶") : null,
          label,
          !isTotal && (function() { var _avc = _pbCharts[rowKey + "_" + date]; var _av = _avc && _avc.alphaVal != null ? _avc.alphaVal : 5; return _av != null ? React.createElement("div", { style: { fontSize: 9, fontWeight: 400, color: "#0369A1", marginTop: 1 } }, "α:" + _av + "円") : null; })(),
          isExp ? React.createElement("button", {
            onClick: function(e) { e.stopPropagation(); setPnlTableExpandSet(function(prev) { var n = Object.assign({}, prev); delete n[keyRef]; return n; }); },
            style: { marginLeft: 6, fontSize: 10, padding: "1px 5px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", color: "#666", lineHeight: 1.3, verticalAlign: "middle" }
          }, "閉じる") : null
        ),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, fontWeight: isTotal ? 700 : 400 } }, st.total),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#1E8449", fontWeight: st.ok ? 700 : 400 } }, st.ok || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#6B7280", fontWeight: (st.draw || 0) > 0 ? 700 : 400 } }, st.draw || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#C0392B", fontWeight: st.ng ? 700 : 400 } }, st.ng || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#B45309", fontWeight: (st.miss || 0) > 0 ? 700 : 400 } }, st.miss || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br,
          color: st.winPct != null ? (st.winPct >= 60 ? "#C0392B" : st.winPct >= 40 ? "#888" : "#1E8449") : "#ccc",
          fontWeight: st.winPct != null ? 700 : 400 } }, st.winPct != null ? st.winPct + "%" : "—"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          _pbRealABAll(recs)),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          (function() {
            var _dynSP = null, _dynSPAB = null;
            (recs || []).forEach(function(r) {
              var s = r.signal;
              var _cD = _pbCharts[r.stock + "_" + date]; var _aD = pbSimAlpha !== null ? pbSimAlpha : (_cD && _cD.alphaVal != null ? _cD.alphaVal : 5);
              var _cutLpbD = (pbSimAlpha !== null && pbSimCutLine !== null) ? pbSimCutLine : (_cD && _cD.cutLine != null ? _cD.cutLine : 10);
              var pp = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
              if (_aD != null && s.osVal != null) {
                var _cfD = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
                var _dfD = Number(s.osVal) - _aD;
                var _pD = _dfD < 0 ? 0 : _dfD >= _cutLpbD ? -Math.round(_dfD * 100) : (_cfD != null ? Math.round((_aD - _cfD) * 100) : null);
                if (_pD != null) pp = _pD;
              }
              if (pp != null) { _dynSP = (_dynSP || 0) + pp; if (s.difficulty === "A" || s.difficulty === "B") _dynSPAB = (_dynSPAB || 0) + pp; }
            });
            var _hasAlpha = (recs || []).some(function(r) { var _cD = _pbCharts[r.stock + "_" + date]; return pbSimAlpha !== null || (_cD && _cD.alphaVal != null); });
            return _pbABAll(recs, _dynSP !== null ? _dynSP : st.sumPlanned, st.expectedPlanned, gradePlanned, "sumPlanned", "expectedPlanned", _hasAlpha ? _dynSPAB : undefined);
          })()),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          (function() {
            if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _hTot = null;
            recs.forEach(function(r) { var s = r.signal; var _cR = _pbCharts[r.stock + "_" + date]; var _aR = pbSimAlpha !== null ? pbSimAlpha : (_cR && _cR.alphaVal != null ? _cR.alphaVal : 5); var _cutLR = (pbSimAlpha !== null && pbSimCutLine !== null) ? pbSimCutLine : (_cR && _cR.cutLine != null ? _cR.cutLine : 10); var hp; if (_aR != null) { var _hpC = false; if (s.osVal != null && _aR > Number(s.osVal)) { hp = null; _hpC = true; } if (!_hpC && s.holdHighSign === "-" && s.holdHighVal != null) { var _hhE = Number(s.holdHighVal) - _aR; if (_hhE >= _cutLR) { hp = -Math.round(_hhE * 100); _hpC = true; } } if (!_hpC && s.osVal != null && (Number(s.osVal) - _aR) >= _cutLR) { hp = -Math.round((Number(s.osVal) - _aR) * 100); _hpC = true; } if (!_hpC) { if (s.holdOsConf != null) { hp = Math.round((_aR + (_aR - Number(s.holdOsConf))) * 100); } else if (s.holdWidthSign != null && s.holdWidth != null) { hp = Math.round((_aR + (s.holdWidthSign === "+" ? Number(s.holdWidth) : -Number(s.holdWidth))) * 100); } else { hp = _elSignedVal(s.holdPnl, s.holdPnlSign); } } } else { hp = _elSignedVal(s.holdPnl, s.holdPnlSign); } if (hp != null) { _hTot = (_hTot||0) + hp; } });
            if (_hTot == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            return React.createElement("span", { style: { fontWeight: 700, color: _hTot > 0 ? "#C0392B" : _hTot < 0 ? "#1E8449" : "#888" } },
              (_hTot > 0 ? "+" : "") + _hTot.toLocaleString() + "円");
          })()),
        React.createElement("td", { style: { padding: "4px 6px", borderBottom: bb, borderTop: bt } },
          tags && tags.length > 0
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
    var _pbExpRow = function(rowKey) {
      var expRecs = rowKey === "__total__"
        ? _pbAllRecs.slice().sort(function(a, b) {
            if (pnlSortOrder === "time") {
              var ta = (a.signal.time || "99:99"), tb = (b.signal.time || "99:99");
              if (ta !== tb) return ta.localeCompare(tb);
              return a.stock.localeCompare(b.stock);
            }
            if (a.stock !== b.stock) return a.stock.localeCompare(b.stock);
            return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99");
          })
        : (_pbByStk[rowKey] || []).slice().sort(function(a, b) {
            return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99");
          });
      if (!expRecs.length) return null;
      var _rPnlCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
      var _rPnlFmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
      var _rTh = function(label, extra) {
        return React.createElement("th", { style: Object.assign({ padding: "3px 3px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "center", fontSize: 10, lineHeight: 1.15, color: "#9A3412" }, extra || {}) }, label);
      };
      var _rPnlDisp = function(v, grade) {
        if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          grade && grade !== "Z" ? _pbBadge(grade) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _rPnlCol(v) } }, _rPnlFmt(v))
        );
      };
      var subRows = [];
      var _totReal = null, _totPlan = null, _totHold = null;
      var _totRealCnt = 0, _totPlanCnt = 0, _totHoldCnt = 0;
      var _totPlanABpb = null;
      var _totPlanABCntpb = 0;
      expRecs.forEach(function(r) {
        var rKey = r.stock + "_" + (r.signal.id || r.signal.time || "");
        var rExp = !!pnlRecordExpandSet[rKey];
        var s = r.signal;
        var item = r.item;
        var realPnl = (item && item.pnl != null) ? Number(item.pnl)
          : (s.realizedPnl != null ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null);
        var planPnl = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
        var holdPnl = _elSignedVal(s.holdPnl, s.holdPnlSign);
        
        var _alphaRec = pbSimAlpha !== null ? pbSimAlpha : (function(){ var _c = _pbCharts[r.stock + "_" + date]; return _c && _c.alphaVal != null ? _c.alphaVal : 5; })();
        var _cutLrec = (pbSimAlpha !== null && pbSimCutLine !== null) ? pbSimCutLine : (function(){ var _cR2 = _pbCharts[r.stock + "_" + date]; return _cR2 && _cR2.cutLine != null ? _cR2.cutLine : 10; })();
        if (_alphaRec != null && s.osVal != null) {
          var _confR = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
          var _diffR = Number(s.osVal) - _alphaRec;
          var _dpR = _diffR < 0 ? 0 : _diffR >= _cutLrec ? -Math.round(_diffR * 100) : (_confR != null ? Math.round((_alphaRec - _confR) * 100) : null);
          if (_dpR != null) planPnl = _dpR;
        }
        if (_alphaRec != null) { var _hpCE = false; if (s.osVal != null && _alphaRec > Number(s.osVal)) { holdPnl = null; _hpCE = true; } if (!_hpCE && s.holdHighSign === "-" && s.holdHighVal != null) { var _hhEE = Number(s.holdHighVal) - _alphaRec; if (_hhEE >= _cutLrec) { holdPnl = -Math.round(_hhEE * 100); _hpCE = true; } } if (!_hpCE && s.osVal != null && (Number(s.osVal) - _alphaRec) >= _cutLrec) { holdPnl = -Math.round((Number(s.osVal) - _alphaRec) * 100); _hpCE = true; } if (!_hpCE) { if (s.holdOsConf != null) { holdPnl = Math.round((_alphaRec + (_alphaRec - Number(s.holdOsConf))) * 100); } else if (s.holdWidthSign != null && s.holdWidth != null) { holdPnl = Math.round((_alphaRec + (s.holdWidthSign === "+" ? Number(s.holdWidth) : -Number(s.holdWidth))) * 100); } } }
        var entered = _elIsEntered(s, item);
        var _dynResExp = (function() { if (_alphaRec == null || s.osVal == null || Number(s.osVal) <= 0) return null; var _dv = Number(s.osVal) - _alphaRec; if (_dv < 0) return "miss"; if (_dv >= _cutLrec) return "ng"; if (s.osConfVal == null || s.osConfVal === "") return null; var _cf = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0; return _cf < _alphaRec ? "ok" : _cf === _alphaRec ? "draw" : "ng"; })();
        var _dispResExp = _dynResExp !== null ? _dynResExp : s.result;
        var isOk = _dispResExp === "ok";
        var isNg = _dispResExp === "ng";
        var isDraw = _dispResExp === "draw";
        var isMiss = _dispResExp === "miss";
        var bb = "1px solid #e8e5de";
        if (entered) _totRealCnt++;
        if (realPnl != null) { _totReal = (_totReal || 0) + realPnl; }
        if (planPnl != null) { _totPlan = (_totPlan || 0) + planPnl; _totPlanCnt++; }
        if (holdPnl != null) { _totHold = (_totHold || 0) + holdPnl; _totHoldCnt++; }
        var _isABpb = (s.difficulty === "A" || s.difficulty === "B");
        if (planPnl != null && _isABpb) { _totPlanABpb = (_totPlanABpb || 0) + planPnl; _totPlanABCntpb++; }
        var gReal = entered && realPnl != null ? _profitGradeFromPnlReal(realPnl, 1) : null;
        var gPlan = planPnl != null ? _profitGradeFromPnl(planPnl, 1) : null;
        subRows.push(React.createElement("tr", {
          key: rKey + "_row",
          style: { background: rExp ? "#FFF7ED" : "transparent", cursor: "pointer" },
          onClick: function() {
            var next = Object.assign({}, pnlRecordExpandSet);
            if (rExp) { delete next[rKey]; } else { next[rKey] = true; }
            setPnlRecordExpandSet(next);
          }
        },
          React.createElement("td", { style: { padding: "5px 4px", textAlign: "center", fontSize: 11, borderBottom: bb, color: "#F97316", width: "1%" } },
            rExp ? "▼" : "▶"),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontWeight: 700, fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", width: "1%", color: "#9A3412" } },
            r.stock),
          React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", width: "1%", color: "#666" } },
            s.time || "—"),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", color: "#555" } },
            (s.tags && s.tags.length > 0 ? s.tags : (s.categories && s.categories.length > 0 ? s.categories : [])).join(" / ") || "—"),
          React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            s.osVal != null ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.osVal, true), fontWeight: s.osVal >= 10 ? 700 : 600 } }, s.osVal + "円") : React.createElement("span", { style: { color: "#ddd" } }, "—")),
          React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            s.osConfVal != null && Number(s.osConfVal) === 0
              ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#888" } }, "0円")
              : s.osConfSign
                ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.osConfVal, s.osConfSign === "+"), fontWeight: Number(s.osConfVal) >= 10 ? 700 : 600 } },
                    "↕" + (s.osConfVal != null ? Math.abs(Number(s.osConfVal)) + "円" : ""))
                : React.createElement("span", { style: { color: "#ddd" } }, "—")),
          React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            (function() {
              if (_alphaRec == null || s.osConfVal == null) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _cfEw = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
              var _ew = _alphaRec - _cfEw;
              if (_ew === 0) return React.createElement("span", { style: { color: "#888" } }, "0");
              var _ewAbs = Math.abs(_ew);
              return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewAbs, _ew < 0), fontWeight: _ewAbs >= 10 ? 700 : 600 } }, (_ew > 0 ? "↓" : "↑") + _ewAbs);
            })()),
          React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            isOk ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "○") :
            isNg ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "×") :
            isDraw ? React.createElement("span", { style: { color: "#6B7280", fontWeight: 700 } }, "△") :
            isMiss ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700, fontSize: 10 } }, "ー") :
            React.createElement("span", { style: { color: "#ccc" } }, "—")
          ),
          React.createElement("td", { style: { padding: "5px 4px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            s.difficulty ? _pbBadge(s.difficulty) : React.createElement("span", { style: { color: "#ccc" } }, "—")),
          React.createElement("td", { style: { padding: "5px 6px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", width: "1%" } },
            entered
              ? React.createElement("span", { style: { color: "#2E7D32", fontWeight: 700 } }, "実エントリー")
              : React.createElement("span", { style: { color: "#888" } }, "見送り")
          ),
          React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap" } },
            _tradeAlphaChip(s), _rPnlDisp(realPnl, gReal)),
          React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap" } },
            _rPnlDisp(planPnl, gPlan)),
          React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            s.holdHighVal != null
              ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdHighVal, s.holdHighSign === "-"), fontWeight: s.holdHighVal >= 10 ? 700 : 600 } },
                  (s.holdHighSign === "-" ? "↑" : "↓") + s.holdHighVal)
              : React.createElement("span", { style: { color: "#ddd" } }, "—")),
          React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            s.holdWidthSign != null && s.holdWidth != null
              ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(s.holdWidth, s.holdWidthSign === "-"), fontWeight: s.holdWidth >= 10 ? 700 : 600 } },
                  "↕" + s.holdWidth)
              : React.createElement("span", { style: { color: "#ddd" } }, "—")),
          React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, borderBottom: bb, whiteSpace: "nowrap" } },
            (function() {
              var _hg = holdPnl != null ? _profitGradeFromPnl(holdPnl, 1) : null;
              var _dynHpExp = (function() {
                var hp = holdPnl, pp = planPnl;
                if (hp == null) return s.holdProfit;
                if (_dispResExp === "draw") { return hp > 0 ? "yes" : hp < 0 ? "no" : "none"; }
                if (pp == null) return s.holdProfit;
                if (pp > 0 && hp > 0) { return hp > pp ? "yes" : hp < pp ? "mid" : "none"; }
                if (pp < 0 && hp < 0) return "no";
                if (pp > 0 && hp < 0) return "no";
                if (pp < 0 && hp > 0) return "yes";
                if (hp === 0) return "none";
                return s.holdProfit;
              })();
              var _sym = _dynHpExp === "yes" ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "○")
                : _dynHpExp === "mid" ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700 } }, "△")
                : _dynHpExp === "none" ? React.createElement("span", { style: { color: "#888", fontWeight: 700 } }, "ー")
                : _dynHpExp === "no" ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "×") : null;
              if (!_sym && holdPnl == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
              return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" } }, _sym, _rPnlDisp(holdPnl, _hg));
            })())
        ));
        if (rExp) {
          subRows.push(React.createElement("tr", { key: rKey + "_detail" },
            React.createElement("td", { colSpan: 15, style: { padding: "0 0 4px 0", borderBottom: "1px solid #e0ddd6" } },
              React.createElement(EntryLogCard, {
                record: r,
                alpha: (pbSimAlpha !== null ? pbSimAlpha : (function(){ var _c = _pbCharts[r.stock + "_" + date]; return _c && _c.alphaVal != null ? _c.alphaVal : 5; })()),
                cutLine: ((pbSimAlpha !== null && pbSimCutLine !== null) ? pbSimCutLine : (function(){ var _c = _pbCharts[r.stock + "_" + date]; return _c && _c.cutLine != null ? _c.cutLine : 10; })()),
                onEdit: function(rec) { setTradeEditTarget(rec); setShowForm(true); }
              })
            )
          ));
        }
      });
      var _totRealGrade = _totRealCnt > 0 ? _profitGradeFromPnlReal(_totReal != null ? _totReal : 0, _totRealCnt) : null;
      var _totPlanGrade = _totPlanCnt > 0 ? _profitGradeFromPnl(_totPlan != null ? _totPlan : 0, _totPlanCnt) : null;
      var _totPlanGradeABpb = _totPlanABCntpb > 0 ? _profitGradeFromPnl(_totPlanABpb != null ? _totPlanABpb : 0, _totPlanABCntpb) : null;
      var _rPnlDispABAllPb = function(abV, allV, abGrade, allGrade) {
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
          abGrade ? _pbBadge(abGrade) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _colAB(abV) } }, _fmtAB(abV)),
          abV !== allV ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
            React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, "("),
            allGrade ? _mkSmBadge(allGrade) : null,
            React.createElement("span", { style: { color: _colAB(allV), fontSize: 10 } }, _fmtAB(allV)),
            React.createElement("span", { style: { color: "#bbb", fontSize: 10 } }, ")")
          ) : null
        );
      };
      var _lblTot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
      var totRow = React.createElement("tr", { key: "__subtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 12, style: { padding: "5px 8px", textAlign: "right", fontWeight: 700, fontSize: 11, borderTop: "2px solid #FB923C", color: "#555" } }, "合計 →"),
        React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, _lblTot("実現損益"), _rPnlDisp(_totReal, _totRealGrade)),
        React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, _lblTot("想定損益"), _rPnlDispABAllPb(_totPlanABpb, _totPlan, _totPlanGradeABpb, _totPlanGrade)),
        React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } },
          _lblTot("H結果損益"),
          _totHoldCnt > 0
            ? React.createElement("span", { style: { fontWeight: 700, color: (_totHold||0) > 0 ? "#C0392B" : (_totHold||0) < 0 ? "#1E8449" : "#888" } },
                ((_totHold||0) > 0 ? "+" : "") + (_totHold||0).toLocaleString() + "円")
            : React.createElement("span", { style: { color: "#ccc" } }, "—"))
      );
      var sortToggle = rowKey === "__total__"
        ? React.createElement("div", { style: { display: "flex", gap: 4, padding: "4px 6px" } },
            React.createElement("span", { style: { fontSize: 10, color: "#888", alignSelf: "center" } }, "並び順:"),
            React.createElement("button", {
              onClick: function(e) { e.stopPropagation(); setPnlSortOrder("stock"); },
              style: { fontSize: 10, padding: "1px 7px", borderRadius: 3, cursor: "pointer", border: "1px solid " + (pnlSortOrder !== "time" ? "#F97316" : "#ddd"), background: pnlSortOrder !== "time" ? "#FFF7ED" : "#f5f4f0", color: pnlSortOrder !== "time" ? "#9A3412" : "#666", fontWeight: pnlSortOrder !== "time" ? 700 : 400 }
            }, "銘柄順"),
            React.createElement("button", {
              onClick: function(e) { e.stopPropagation(); setPnlSortOrder("time"); },
              style: { fontSize: 10, padding: "1px 7px", borderRadius: 3, cursor: "pointer", border: "1px solid " + (pnlSortOrder === "time" ? "#F97316" : "#ddd"), background: pnlSortOrder === "time" ? "#FFF7ED" : "#f5f4f0", color: pnlSortOrder === "time" ? "#9A3412" : "#666", fontWeight: pnlSortOrder === "time" ? 700 : 400 }
            }, "時間順")
          )
        : null;
      return React.createElement("tr", { key: rowKey + "_exprow" },
        React.createElement("td", { colSpan: 11, style: { padding: 0, background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
          rowKey === "__total__" ? React.createElement(React.Fragment, null,
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderBottom: "1px solid #f0ede6", flexWrap: "wrap" } },
              React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#555", whiteSpace: "nowrap" } }, "α値の入力方法:"),
              [["stock", "銘柄別α値"], ["all", "全銘柄一括α値"]].map(function(_m) {
                var _on = pbAlphaMode === _m[0];
                return React.createElement("button", { key: _m[0],
                  onClick: function() { if (_m[0] === "stock") { setPbSimAlpha(null); setPbSimCutLine(null); } else { setPbSimAlpha(function(p) { return p == null ? 5 : p; }); } setPbAlphaMode(_m[0]); },
                  style: { padding: "3px 12px", fontSize: 11, fontWeight: _on ? 700 : 400, cursor: "pointer", borderRadius: 5,
                    border: _on ? "1.5px solid #FB923C" : "1px solid #ddd", background: _on ? "#FFEDD5" : "#fff", color: _on ? "#9A3412" : "#666" }
                }, _m[1]);
              }),
              React.createElement("span", { style: { fontSize: 10, color: "#aaa", whiteSpace: "nowrap" } }, "※どちらか一方のみ有効")
            ),
            pbAlphaMode === "all" && React.createElement("div", {
            style: { display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderBottom: "1px solid #f0ede6", flexWrap: "wrap", background: pbSimAlpha !== null ? "#FFFBF0" : "transparent" }
          },
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", whiteSpace: "nowrap" } }, "全銘柄α値（水準線比）"),
            React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
              React.createElement("input", {
                type: "number", inputMode: "numeric", step: "1", min: "0", max: "20", placeholder: "—",
                value: pbSimAlpha !== null ? String(pbSimAlpha) : "",
                onChange: function(e) {
                  var v = e.target.value;
                  var _n = v === "" ? null : isNaN(Number(v)) ? null : Number(v);
                  if (_n != null) { if (_n > 20) _n = 20; if (_n < 0) _n = 0; }
                  setPbSimAlpha(_n);
                },
                style: { width: 64, padding: "4px", fontSize: 12, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { setPbSimAlpha(function(p) { var n = p !== null ? p : 5; return n < 20 ? n + 1 : n; }); },
                function() { setPbSimAlpha(function(p) { var n = p !== null ? p : 5; return n > 0 ? n - 1 : 0; }); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
            React.createElement("button", {
              onClick: function() { setPbSimAlpha(null); setPbSimCutLine(null); },
              style: { fontSize: 11, padding: "2px 8px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#555", whiteSpace: "nowrap" }
            }, "リセット"),
            React.createElement("span", { style: { color: "#ddd", fontSize: 14, margin: "0 2px" } }, "|"),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#555", whiteSpace: "nowrap" } }, "損切りライン"),
            React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
              React.createElement("input", {
                type: "number", inputMode: "numeric", step: "1", placeholder: "10",
                value: pbSimCutLine !== null ? String(pbSimCutLine) : "",
                onChange: function(e) {
                  var v = _toHankaku(e.target.value).trim();
                  setPbSimCutLine(v === "" ? null : isNaN(Number(v)) ? null : Number(v));
                },
                style: { width: 52, padding: "4px", fontSize: 12, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { setPbSimCutLine(function(p) { var n = p !== null ? p : 10; return n + 1; }); },
                function() { setPbSimCutLine(function(p) { var n = p !== null ? p : 10; return n > 1 ? n - 1 : 1; }); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
            pbSimAlpha !== null && React.createElement("span", { style: { fontSize: 10, color: "#B45309", marginLeft: 6 } }, "※各銘柄のα値を上書きしてシミュレーション中")
          ),
          pbAlphaMode === "stock" && _pbStks.length > 0 && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderBottom: "1px solid #f0ede6", flexWrap: "wrap" } },
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#555", whiteSpace: "nowrap", flexShrink: 0 } }, "銘柄別α値"),
            _pbStks.map(function(sk) {
              var _skCk = sk + "_" + date;
              var _skAlpha = (_pbCharts[_skCk] && _pbCharts[_skCk].alphaVal != null) ? _pbCharts[_skCk].alphaVal : 5;
              var _saveSkAlpha = function(n) {
                save(function(prev) {
                  var pCharts = Object.assign({}, (prev && prev.charts) || {});
                  var _ce = Object.assign({}, pCharts[_skCk] || {});
                  if (n != null) _ce.alphaVal = n; else delete _ce.alphaVal;
                  if (n != null && Array.isArray(_ce.signals)) {
                    var _cutLsk = _ce.cutLine != null ? _ce.cutLine : 10;
                    _ce.signals = _ce.signals.map(function(s) {
                      if (s.osVal == null) return s;
                      var _osV = Number(s.osVal);
                      var _conf = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
                      var _diff = _osV - n;
                      var _pnl = null;
                      if (_diff < 0) _pnl = 0;
                      else if (_diff >= _cutLsk) _pnl = -Math.round(_diff * 100);
                      else if (_conf != null) _pnl = Math.round((n - _conf) * 100);
                      var _updSig = s;
                      if (_pnl != null) { var _sg = _pnl >= 0 ? "+" : "-"; _updSig = Object.assign({}, s, { plannedPnl: Math.abs(_pnl), plannedPnlSign: _sg, maxPnl: Math.abs(_pnl), maxPnlSign: _sg }); }
                      if (s.holdOsConf != null) { var _hw = n - Number(s.holdOsConf); var _hwSg = _hw >= 0 ? "+" : "-"; var _hp = Math.round((n + _hw) * 100); _updSig = Object.assign({}, _updSig, { holdWidthSign: _hwSg, holdWidth: Math.abs(_hw), holdPnl: Math.abs(_hp), holdPnlSign: _hp >= 0 ? "+" : "-" }); }
                      return _updSig;
                    });
                  }
                  pCharts[_skCk] = _ce;
                  return Object.assign({}, prev, { charts: pCharts });
                });
              };
              return React.createElement("div", { key: sk, style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#f9f8f6", border: "1px solid #e8e5de", borderRadius: 5, padding: "2px 6px" } },
                React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", whiteSpace: "nowrap" } }, sk),
                React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" } },
                  React.createElement("input", {
                    type: "number", inputMode: "numeric", step: "1",
                    value: String(_skAlpha),
                    onChange: function(e) { var v = e.target.value; _saveSkAlpha(v === "" ? null : isNaN(Number(v)) ? null : Number(v)); },
                    style: { width: 52, padding: "3px 4px", fontSize: 12, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
                  }),
                  _stepBtn(
                    function() { _saveSkAlpha(_skAlpha < 20 ? _skAlpha + 1 : _skAlpha); },
                    function() { _saveSkAlpha(_skAlpha > 0 ? _skAlpha - 1 : 0); }
                  )
                ),
                React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "円")
              );
            })
          )
        ) : React.createElement("div", {
            style: { display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderBottom: "1px solid #f0ede6", flexWrap: "wrap" }
          },
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#555", whiteSpace: "nowrap" } }, "この日のα値（水準線比）"),
            React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
              React.createElement("input", {
                type: "number", inputMode: "numeric", step: "1", min: "0", max: "20",
                value: (function() { var _avc = _pbCharts[rowKey + "_" + date]; return _avc && _avc.alphaVal != null ? String(_avc.alphaVal) : "5"; })(),
                onChange: function(e) {
                  var v = e.target.value;
                  var n = v === "" ? null : (isNaN(Number(v)) ? null : Number(v));
                  if (n != null) { if (n > 20) n = 20; if (n < 0) n = 0; }
                  var _ck = rowKey + "_" + date;
                  save(function(prev) {
                    var pCharts = Object.assign({}, (prev && prev.charts) || {});
                    var _ce = Object.assign({}, pCharts[_ck] || {});
                    if (n != null) _ce.alphaVal = n; else delete _ce.alphaVal;
                    if (n != null && Array.isArray(_ce.signals)) {
                      var _cutLpb = _ce.cutLine != null ? _ce.cutLine : 10;
                      _ce.signals = _ce.signals.map(function(s) {
                        if (s.osVal == null) return s;
                        var _osV = Number(s.osVal);
                        var _conf = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
                        var _diff = _osV - n;
                        var _pnl = null;
                        if (_diff < 0) _pnl = 0;
                        else if (_diff >= _cutLpb) _pnl = -Math.round(_diff * 100);
                        else if (_conf != null) _pnl = Math.round((n - _conf) * 100);
                        var _updSig = s;
                        if (_pnl != null) { var _sg = _pnl >= 0 ? "+" : "-"; _updSig = Object.assign({}, s, { plannedPnl: Math.abs(_pnl), plannedPnlSign: _sg, maxPnl: Math.abs(_pnl), maxPnlSign: _sg }); }
                        if (s.holdOsConf != null) { var _hw = n - Number(s.holdOsConf); var _hwSg = _hw >= 0 ? "+" : "-"; var _hp = Math.round((n + _hw) * 100); _updSig = Object.assign({}, _updSig, { holdWidthSign: _hwSg, holdWidth: Math.abs(_hw), holdPnl: Math.abs(_hp), holdPnlSign: _hp >= 0 ? "+" : "-" }); }
                        return _updSig;
                      });
                    }
                    pCharts[_ck] = _ce;
                    return Object.assign({}, prev, { charts: pCharts });
                  });
                },
                placeholder: "0",
                style: { width: 60, padding: "4px", fontSize: 12, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { var _ckRef = rowKey + "_" + date; save(function(prev) { var pCharts = Object.assign({}, (prev && prev.charts) || {}); var _ce = Object.assign({}, pCharts[_ckRef] || {}); var _n = _ce.alphaVal != null ? _ce.alphaVal : 5; if (_n >= 20) return prev; _ce.alphaVal = _n + 1; pCharts[_ckRef] = _ce; return Object.assign({}, prev, { charts: pCharts }); }); },
                function() { var _ckRef = rowKey + "_" + date; save(function(prev) { var pCharts = Object.assign({}, (prev && prev.charts) || {}); var _ce = Object.assign({}, pCharts[_ckRef] || {}); var _n = _ce.alphaVal != null ? _ce.alphaVal : 5; if (_n <= 0) return prev; _ce.alphaVal = _n - 1; pCharts[_ckRef] = _ce; return Object.assign({}, prev, { charts: pCharts }); }); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
            React.createElement("button", {
              onClick: function() {
                var _ck = rowKey + "_" + date;
                save(function(prev) {
                  var pCharts = Object.assign({}, (prev && prev.charts) || {});
                  var _ce = Object.assign({}, pCharts[_ck] || {});
                  delete _ce.alphaVal;
                  if (Array.isArray(_ce.signals)) {
                    var _cutLpbReset = _ce.cutLine != null ? _ce.cutLine : 10;
                    _ce.signals = _ce.signals.map(function(s) {
                      if (s.osVal == null) return s;
                      var _osV = Number(s.osVal), _n = 5;
                      var _conf = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
                      var _diff = _osV - _n;
                      var _pnl = null;
                      if (_diff < 0) _pnl = 0;
                      else if (_diff >= _cutLpbReset) _pnl = -Math.round(_diff * 100);
                      else if (_conf != null) _pnl = Math.round((_n - _conf) * 100);
                      var _updSig = s;
                      if (_pnl != null) { var _sg = _pnl >= 0 ? "+" : "-"; _updSig = Object.assign({}, s, { plannedPnl: Math.abs(_pnl), plannedPnlSign: _sg, maxPnl: Math.abs(_pnl), maxPnlSign: _sg }); }
                      if (s.holdOsConf != null) { var _hw = _n - Number(s.holdOsConf); var _hwSg = _hw >= 0 ? "+" : "-"; var _hp = Math.round((_n + _hw) * 100); _updSig = Object.assign({}, _updSig, { holdWidthSign: _hwSg, holdWidth: Math.abs(_hw), holdPnl: Math.abs(_hp), holdPnlSign: _hp >= 0 ? "+" : "-" }); }
                      return _updSig;
                    });
                  }
                  pCharts[_ck] = _ce;
                  return Object.assign({}, prev, { charts: pCharts });
                });
              },
              style: { fontSize: 11, padding: "2px 8px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#555", whiteSpace: "nowrap" }
            }, "リセット"),
            React.createElement("span", { style: { color: "#ddd", fontSize: 14, margin: "0 2px" } }, "|"),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#555", whiteSpace: "nowrap" } }, "損切りライン"),
            React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
              React.createElement("input", {
                type: "number", inputMode: "numeric", step: "1",
                value: (function() { var _avc2 = _pbCharts[rowKey + "_" + date]; return _avc2 && _avc2.cutLine != null ? String(_avc2.cutLine) : "10"; })(),
                onChange: function(e) {
                  var v = _toHankaku(e.target.value).trim();
                  var n = v === "" ? null : (isNaN(Number(v)) ? null : Number(v));
                  var _ck2 = rowKey + "_" + date;
                  save(function(prev) {
                    var pCharts = Object.assign({}, (prev && prev.charts) || {});
                    var _ce2 = Object.assign({}, pCharts[_ck2] || {});
                    if (n != null) _ce2.cutLine = n; else delete _ce2.cutLine;
                    pCharts[_ck2] = _ce2;
                    return Object.assign({}, prev, { charts: pCharts });
                  });
                },
                placeholder: "10",
                style: { width: 48, padding: "4px", fontSize: 12, border: "none", outline: "none", background: "#fff", textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { var _ckRef2 = rowKey + "_" + date; save(function(prev) { var pCharts = Object.assign({}, (prev && prev.charts) || {}); var _ce2 = Object.assign({}, pCharts[_ckRef2] || {}); var _n2 = _ce2.cutLine != null ? _ce2.cutLine : 10; _ce2.cutLine = _n2 + 1; pCharts[_ckRef2] = _ce2; return Object.assign({}, prev, { charts: pCharts }); }); },
                function() { var _ckRef2 = rowKey + "_" + date; save(function(prev) { var pCharts = Object.assign({}, (prev && prev.charts) || {}); var _ce2 = Object.assign({}, pCharts[_ckRef2] || {}); var _n2 = _ce2.cutLine != null ? _ce2.cutLine : 10; if (_n2 <= 1) return prev; _ce2.cutLine = _n2 - 1; pCharts[_ckRef2] = _ce2; return Object.assign({}, prev, { charts: pCharts }); }); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
            (function() {
              var _ck = rowKey + "_" + date;
              var _recs = expRecs || [];
              var _totPb = null, _totPbCnt = 0, _totHPb = null, _totHPbCnt = 0;
              _recs.forEach(function(r) {
                var s = r.signal;
                var pp = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
                var hp = _elSignedVal(s.holdPnl, s.holdPnlSign);
                var _aW = pbSimAlpha !== null ? pbSimAlpha : (function(){ var _c = _pbCharts[r.stock + "_" + date]; return _c && _c.alphaVal != null ? _c.alphaVal : 5; })();
                var _cutLW = (pbSimAlpha !== null && pbSimCutLine !== null) ? pbSimCutLine : (function(){ var _cR3 = _pbCharts[r.stock + "_" + date]; return _cR3 && _cR3.cutLine != null ? _cR3.cutLine : 10; })();
                if (_aW != null && s.osVal != null) {
                  var _cW = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
                  var _dW = Number(s.osVal) - _aW;
                  var _pW = _dW < 0 ? 0 : _dW >= _cutLW ? -Math.round(_dW * 100) : (_cW != null ? Math.round((_aW - _cW) * 100) : null);
                  if (_pW != null) pp = _pW;
                }
                if (_aW != null) { var _hpWC = false; if (s.osVal != null && _aW > Number(s.osVal)) { hp = null; _hpWC = true; } if (!_hpWC && s.holdHighSign === "-" && s.holdHighVal != null) { var _hhW = Number(s.holdHighVal) - _aW; if (_hhW >= _cutLW) { hp = -Math.round(_hhW * 100); _hpWC = true; } } if (!_hpWC && s.osVal != null && (Number(s.osVal) - _aW) >= _cutLW) { hp = -Math.round((Number(s.osVal) - _aW) * 100); _hpWC = true; } if (!_hpWC && s.holdOsConf != null) { hp = Math.round((_aW + (_aW - Number(s.holdOsConf))) * 100); } else if (!_hpWC && s.holdWidthSign != null && s.holdWidth != null) { hp = Math.round((_aW + (s.holdWidthSign === "+" ? Number(s.holdWidth) : -Number(s.holdWidth))) * 100); } }
                if (pp != null) { _totPb = (_totPb || 0) + pp; _totPbCnt++; }
                if (hp != null) { _totHPb = (_totHPb || 0) + hp; _totHPbCnt++; }
              });
              if (_totPbCnt === 0 && _totHPbCnt === 0) return null;
              return React.createElement("span", { style: { display: "inline-flex", gap: 10, marginLeft: 8, paddingLeft: 8, borderLeft: "1px solid #f0ede6", flexWrap: "wrap" } },
                _totPbCnt > 0 ? React.createElement("span", { style: { fontSize: 11, color: "#555", whiteSpace: "nowrap" } },
                  "想定損益合計: ",
                  React.createElement("span", { style: { fontWeight: 700, color: (_totPb||0) > 0 ? "#C0392B" : (_totPb||0) < 0 ? "#1E8449" : "#888" } },
                    ((_totPb||0) > 0 ? "+" : "") + (_totPb||0).toLocaleString() + "円")
                ) : null,
                _totHPbCnt > 0 ? React.createElement("span", { style: { fontSize: 11, color: "#555", whiteSpace: "nowrap" } },
                  "結果損益合計: ",
                  React.createElement("span", { style: { fontWeight: 700, color: (_totHPb||0) > 0 ? "#C0392B" : (_totHPb||0) < 0 ? "#1E8449" : "#888" } },
                    ((_totHPb||0) > 0 ? "+" : "") + (_totHPb||0).toLocaleString() + "円")
                ) : null
              );
            })()
          ),
          sortToggle,
          React.createElement("div", { style: { overflowX: "auto" } },
            React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 10 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { background: "#FFF7ED" } },
                  _rTh("", { width: "1%" }),
                  _rTh("銘柄", { width: "1%" }),
                  _rTh("時間", { width: "1%" }),
                  _rTh("シグナル"),
                  _rTh("OS値", { width: "1%" }),
                  _rTh("確定値", { width: "1%" }),
                  _rTh("α値比値幅", { width: "1%" }),
                  _rTh("勝敗", { width: "1%" }),
                  _rTh("E難易度", { width: "1%" }),
                  _rTh("区分", { width: "1%" }),
                  _rTh("実現損益"),
                  _rTh(React.createElement("span", null, "想定損益", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "(100株)"))),
                  _rTh("H高値", { width: "1%" }),
                  _rTh("H確定値", { width: "1%" }),
                  _rTh(React.createElement("span", null, "H勝敗/", React.createElement("span", { style: { display: "block" } }, "結果損益")))
                )
              ),
              React.createElement("tbody", null, subRows),
              React.createElement("tfoot", null, totRow)
            )
          ),
        )
      );
    };
    var _pbStockTags = function(stk) {
      var c = _pbCharts[stk + "_" + date] || {};
      return [].concat(c.chartShapeTags || [], c.stockTags || []).map(stripCat);
    };
    var _pbGradeLegend = (function() {
      var grades = ["A","B","C","D","E","F","G"];
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
      return React.createElement("div", { style: { background: "#f9f8f5", border: "1px solid #e8e5de", borderRadius: 6, padding: "5px 8px", marginBottom: 8, fontSize: 9 } },
        mkRow("実現損益", { A:"25001+", B:"10001～25000", C:"1～10000", D:"0", E:"-1～-10000", F:"-10001～-25000", G:"-25001-" }),
        mkRow("想定損益", { A:"2501+", B:"1001～2500", C:"1～1000", D:"0", E:"-1～-1000", F:"-1001～-2500", G:"-2501-" })
      );
    })();
    
    
    
    
    var _pbAlphaByStk = {};
    _pbStks.forEach(function(sk) {
      var recs = _pbByStk[sk] || [];
      var confSum = 0, confCnt = 0, osSum = 0, osCnt = 0;
      var sigData = [];
      recs.forEach(function(rec) {
        var sig = rec.signal;
        var conf = sig.osConfVal != null ? (sig.osConfSign === "-" ? -(Number(sig.osConfVal)) : Number(sig.osConfVal)) : null;
        var osV = sig.osVal != null ? Number(sig.osVal) : null;
        if (conf != null) { confSum += conf; confCnt++; }
        if (osV != null) { osSum += osV; osCnt++; }
        var _skCutL = (_pbCharts[sk + "_" + date] && _pbCharts[sk + "_" + date].cutLine != null) ? _pbCharts[sk + "_" + date].cutLine : 10;
        sigData.push({ conf: conf, osVal: osV, cutLine: _skCutL });
      });
      var calcProfit = function(alpha) {
        var total = 0, hasAny = false;
        sigData.forEach(function(d) {
          if (d.osVal == null) return;
          hasAny = true;
          var _cl = d.cutLine != null ? d.cutLine : 10;
          if (alpha > d.osVal) {
            
          } else if (d.osVal - alpha >= _cl) {
            
            total += -(d.osVal - alpha) * 100;
          } else {
            
            if (d.conf == null) { hasAny = false; return; }
            total += (alpha - d.conf) * 100;
          }
        });
        return hasAny ? Math.round(total) : null;
      };
      
      var minA = null, tgtA = null, maxA = null, maxP = null;
      for (var _a = 0; _a <= 20; _a++) {
        var _p = calcProfit(_a);
        if (_p == null) continue;
        if (minA == null && _p >= 1) minA = _a;
        if (tgtA == null && _p >= 2500) tgtA = _a;
        if (maxP == null || _p > maxP) { maxP = _p; maxA = _a; }
      }
      
      var tgtIsFallback = false;
      if (tgtA == null && maxA != null) { tgtA = maxA; tgtIsFallback = true; }
      _pbAlphaByStk[sk] = {
        minAlpha: minA, tgtAlpha: tgtA, maxAlpha: maxA,
        minProfit: minA != null ? calcProfit(minA) : null,
        tgtProfit: tgtA != null ? calcProfit(tgtA) : null,
        maxProfit: maxA != null ? calcProfit(maxA) : null,
        tgtIsFallback: tgtIsFallback,
        sigData: sigData
      };
    });
    var _pbTotMinProfit = null, _pbTotTgtProfit = null, _pbTotMaxProfit = null;
    _pbStks.forEach(function(sk) {
      var d = _pbAlphaByStk[sk];
      if (d.minProfit != null) _pbTotMinProfit = (_pbTotMinProfit || 0) + d.minProfit;
      if (d.tgtProfit != null) _pbTotTgtProfit = (_pbTotTgtProfit || 0) + d.tgtProfit;
      if (d.maxProfit != null) _pbTotMaxProfit = (_pbTotMaxProfit || 0) + d.maxProfit;
    });
    
    var _pbAllAlphaResult = (function() {
      if (_pbStks.length <= 1) return null;
      var allSigData = [];
      _pbStks.forEach(function(sk) { allSigData = allSigData.concat(_pbAlphaByStk[sk].sigData); });
      if (!allSigData.length) return null;
      var calcAll = function(alpha) {
        var total = 0, hasAny = false;
        allSigData.forEach(function(d) {
          if (d.osVal == null) return;
          hasAny = true;
          var _cl2 = d.cutLine != null ? d.cutLine : 10;
          if (alpha > d.osVal) {  }
          else if (d.osVal - alpha >= _cl2) { total += -(d.osVal - alpha) * 100; }
          else { if (d.conf == null) { hasAny = false; return; } total += (alpha - d.conf) * 100; }
        });
        return hasAny ? Math.round(total) : null;
      };
      var minA = null, tgtA = null, maxA = null, maxP = null;
      for (var _aa = 0; _aa <= 20; _aa++) {
        var _pp = calcAll(_aa);
        if (_pp == null) continue;
        if (minA == null && _pp >= 1) minA = _aa;
        if (tgtA == null && _pp >= 2500) tgtA = _aa;
        if (maxP == null || _pp > maxP) { maxP = _pp; maxA = _aa; }
      }
      if (tgtA == null && maxA != null) tgtA = maxA;
      return { minAlpha: minA, tgtAlpha: tgtA, maxAlpha: maxA,
               minProfit: minA != null ? calcAll(minA) : null,
               tgtProfit: tgtA != null ? calcAll(tgtA) : null,
               maxProfit: maxA != null ? calcAll(maxA) : null };
    })();
    var _pbHasAlpha = _pbStks.some(function(sk) {
      var d = _pbAlphaByStk[sk];
      return d.minAlpha != null || d.tgtAlpha != null || d.maxAlpha != null;
    });
    
    var _haEl = (function() {
      if (!_pbAllRecs.length) return null;
      var _hpFmtHA = function(v) { if (v == null) return React.createElement("span",{style:{color:"#ccc"}},"—"); var col=v>0?"#C0392B":v<0?"#1E8449":"#888"; return React.createElement("span",{style:{fontWeight:700,color:col}},(v>0?"+":"")+v.toLocaleString()+"円"); };
      var _hwFmtHA = function(v) { if (v == null) return React.createElement("span",{style:{color:"#ccc"}},"—"); var col=v>0?"#C0392B":v<0?"#1E8449":"#888"; return React.createElement("span",{style:{fontWeight:700,color:col}},(v>0?"+":Math.abs(v)===v?"+":"")+v+"円"); };
      var _thHA = function(l,e){ return React.createElement("th",{style:Object.assign({padding:"4px 8px",fontWeight:700,borderBottom:"2px solid #ddd",whiteSpace:"nowrap",textAlign:"center",fontSize:10,color:"#555"},e||{})},l); };
      var _tdHA = function(c,e){ return React.createElement("td",{style:Object.assign({padding:"4px 8px",textAlign:"center",fontSize:11,borderBottom:"1px solid #f0ede6"},e||{})},c); };
      var _haRecs = _pbAllRecs.map(function(r) {
        var s = r.signal;
        var _aR = pbSimAlpha !== null ? pbSimAlpha : (function(){ var _c = _pbCharts[r.stock+"_"+date]; return _c&&_c.alphaVal!=null?_c.alphaVal:5; })();
        var hp = _elSignedVal(s.holdPnl, s.holdPnlSign);
        var _cutLHA = (pbSimAlpha !== null && pbSimCutLine !== null) ? pbSimCutLine : (function(){ var _cRHA = _pbCharts[r.stock+"_"+date]; return _cRHA&&_cRHA.cutLine!=null?_cRHA.cutLine:10; })();
        if (_aR != null) {
          var _hpCH = false;
          if(s.osVal!=null&&_aR>Number(s.osVal)){hp=null;_hpCH=true;}
          if (!_hpCH&&s.holdHighSign==="-"&&s.holdHighVal!=null){var _hhEH=Number(s.holdHighVal)-_aR;if(_hhEH>=_cutLHA){hp=-Math.round(_hhEH*100);_hpCH=true;}}
          if(!_hpCH&&s.osVal!=null&&(Number(s.osVal)-_aR)>=_cutLHA){hp=-Math.round((Number(s.osVal)-_aR)*100);_hpCH=true;}
          if (!_hpCH){if(s.holdOsConf!=null){hp=Math.round((_aR+(_aR-Number(s.holdOsConf)))*100);}else if(s.holdWidthSign!=null&&s.holdWidth!=null){hp=Math.round((_aR+(s.holdWidthSign==="+"?Number(s.holdWidth):-Number(s.holdWidth)))*100);}}
        }
        var pp = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
        if (_aR!=null&&s.osVal!=null){var _cfH=s.osConfVal!=null?(s.osConfSign==="-"?-(Number(s.osConfVal)):Number(s.osConfVal)):null;var _dfH=Number(s.osVal)-_aR;var _pxH=_dfH<0?0:_dfH>=_cutLHA?-Math.round(_dfH*100):(_cfH!=null?Math.round((_aR-_cfH)*100):null);if(_pxH!=null)pp=_pxH;}
        var _drH=(function(){if(_aR==null||s.osVal==null||Number(s.osVal)<=0)return null;var _dv=Number(s.osVal)-_aR;if(_dv<0)return"miss";if(_dv>=_cutLHA)return"ng";if(s.osConfVal==null||s.osConfVal==="")return null;var _cf3=s.osConfSign==="+"?Number(s.osConfVal):s.osConfSign==="-"?-Number(s.osConfVal):0;return _cf3<_aR?"ok":_cf3===_aR?"draw":"ng";})();
        var dispRH=_drH!==null?_drH:s.result;
        var dynHpH=(function(){if(hp==null)return s.holdProfit;if(dispRH==="draw"){return hp>0?"yes":hp<0?"no":"none";}if(pp==null)return s.holdProfit;if(pp>0&&hp>0){return hp>pp?"yes":hp<pp?"mid":"none";}if(pp<0&&hp<0)return"no";if(pp>0&&hp<0)return"no";if(pp<0&&hp>0)return"yes";if(hp===0)return"none";return s.holdProfit;})();
        var hw=null;
        if(_aR!=null&&s.holdOsConf!=null){hw=_aR-Number(s.holdOsConf);}else if(s.holdWidthSign!=null&&s.holdWidth!=null){hw=s.holdWidthSign==="+"?Number(s.holdWidth):-Number(s.holdWidth);}
        return {s:s,stock:r.stock,hp:hp,pp:pp,dynHp:dynHpH,hw:hw,aR:_aR,cutL:_cutLHA};
      }).filter(function(h){return h.dynHp!=null||h.hp!=null;});
      if (!_haRecs.length) return null;
      var _hCatH={yes:[],mid:[],none:[],no:[]};
      _haRecs.forEach(function(h){if(_hCatH[h.dynHp])_hCatH[h.dynHp].push(h);});
      var _hTotalH=_haRecs.length;
      var _avgH=function(arr,key){var vals=arr.map(function(h){return h[key];}).filter(function(v){return v!=null;});return vals.length?Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length):null;};
      var _hwHasDataH=_haRecs.some(function(h){return h.hw!=null;});
      
      var _hAlphaEVH=[];
      for(var _haI=0;_haI<=20;_haI++){(function(_av2){var _hpA2=_pbAllRecs.map(function(r){var s=r.signal;var _cRev=_pbCharts[r.stock+"_"+date];var _clEV=(pbSimAlpha!==null&&pbSimCutLine!==null)?pbSimCutLine:(_cRev&&_cRev.cutLine!=null?_cRev.cutLine:10);var hp2=null;var _hpC4=false;if(s.osVal!=null&&_av2>Number(s.osVal)){return null;}if(s.holdHighSign==="-"&&s.holdHighVal!=null){var _hhE4=Number(s.holdHighVal)-_av2;if(_hhE4>=_clEV){hp2=-Math.round(_hhE4*100);_hpC4=true;}}if(!_hpC4&&s.osVal!=null&&(Number(s.osVal)-_av2)>=_clEV){hp2=-Math.round((Number(s.osVal)-_av2)*100);_hpC4=true;}if(!_hpC4){if(s.holdOsConf!=null){hp2=Math.round((_av2+(_av2-Number(s.holdOsConf)))*100);}else if(s.holdWidthSign!=null&&s.holdWidth!=null){hp2=Math.round((_av2+(s.holdWidthSign==="+"?Number(s.holdWidth):-Number(s.holdWidth)))*100);}}return hp2;}).filter(function(v){return v!=null;});if(_hpA2.length>0){_hAlphaEVH.push({alpha:_av2,ev:Math.round(_hpA2.reduce(function(a,b){return a+b;},0)/_hpA2.length),cnt:_hpA2.length});}})(_haI);}
      
      var _hByStkH={};
      _haRecs.forEach(function(h){if(!_hByStkH[h.stock])_hByStkH[h.stock]={yes:0,mid:0,none:0,no:0,hpArr:[],hwArr:[]};if(_hByStkH[h.stock][h.dynHp]!=null)_hByStkH[h.stock][h.dynHp]++;if(h.hp!=null)_hByStkH[h.stock].hpArr.push(h.hp);if(h.hw!=null)_hByStkH[h.stock].hwArr.push(h.hw);});
      var _stkKeysH=Object.keys(_hByStkH).sort();
      return React.createElement("div",{style:Object.assign({},Card,{marginTop:8})},
        React.createElement("div",{style:{fontSize:13,fontWeight:700,marginBottom:10,color:"#333"}},"📐 ホールド変動分析"),
        
        React.createElement("div",{style:{marginBottom:14}},
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#555",marginBottom:6,borderBottom:"1px solid #e0ddd6",paddingBottom:4}},"ホールド成績"),
          React.createElement("div",{style:{overflowX:"auto"}},
            React.createElement("table",{style:{borderCollapse:"collapse",width:"100%",fontSize:11}},
              React.createElement("thead",null,React.createElement("tr",{style:{background:"#f5f4f0"}},_thHA("銘柄",{textAlign:"left"}),_thHA("件"),_thHA("○"),_thHA("△"),_thHA("ー"),_thHA("×"),_thHA("勝率"),_thHA("期待値"),_hwHasDataH?_thHA("avg変動幅"):null)),
              React.createElement("tbody",null,
                _stkKeysH.map(function(sk){
                  var d=_hByStkH[sk];var tot=d.yes+d.mid+d.none+d.no;
                  var winPct=tot>0?Math.round((d.yes+d.mid)/tot*100):null;
                  var ev=d.hpArr.length?Math.round(d.hpArr.reduce(function(a,b){return a+b;},0)/d.hpArr.length):null;
                  var hwAvg=d.hwArr.length?Math.round(d.hwArr.reduce(function(a,b){return a+b;},0)/d.hwArr.length*10)/10:null;
                  var _cav=(function(){var _cc=_pbCharts[sk+"_"+date];return _cc&&_cc.alphaVal!=null?_cc.alphaVal:5;})();
                  return React.createElement("tr",{key:sk},
                    _tdHA(React.createElement("span",{style:{fontWeight:700,color:"#9A3412"}},sk,_cav!=null?React.createElement("span",{style:{fontSize:9,fontWeight:400,color:"#0369A1",marginLeft:4}},"α:"+_cav+"円"):null),{textAlign:"left",whiteSpace:"nowrap"}),
                    _tdHA(tot),
                    _tdHA(React.createElement("span",{style:{color:"#1E8449",fontWeight:d.yes?700:400}},d.yes||0)),
                    _tdHA(React.createElement("span",{style:{color:"#B45309",fontWeight:d.mid?700:400}},d.mid||0)),
                    _tdHA(React.createElement("span",{style:{color:"#888"}},d.none||0)),
                    _tdHA(React.createElement("span",{style:{color:"#C0392B",fontWeight:d.no?700:400}},d.no||0)),
                    _tdHA(winPct!=null?React.createElement("span",{style:{color:winPct>=50?"#C0392B":"#1E8449",fontWeight:700}},winPct+"%"):React.createElement("span",{style:{color:"#ccc"}},"—")),
                    _tdHA(_hpFmtHA(ev)),
                    _hwHasDataH?_tdHA(hwAvg!=null?_hwFmtHA(hwAvg):React.createElement("span",{style:{color:"#ccc"}},"—")):null
                  );
                }).concat([React.createElement("tr",{key:"__tot__",style:{background:"#f5f4f0",fontWeight:700}},
                  _tdHA(React.createElement("span",{style:{fontWeight:700,color:"#555"}},"合計"),{textAlign:"left"}),
                  _tdHA(_hTotalH),
                  _tdHA(React.createElement("span",{style:{color:"#1E8449",fontWeight:700}},_hCatH.yes.length)),
                  _tdHA(React.createElement("span",{style:{color:"#B45309",fontWeight:700}},_hCatH.mid.length)),
                  _tdHA(React.createElement("span",{style:{color:"#888"}},_hCatH.none.length)),
                  _tdHA(React.createElement("span",{style:{color:"#C0392B",fontWeight:700}},_hCatH.no.length)),
                  _tdHA((function(){var t=_hCatH.yes.length+_hCatH.mid.length+_hCatH.none.length+_hCatH.no.length;return t>0?React.createElement("span",{style:{color:Math.round((_hCatH.yes.length+_hCatH.mid.length)/t*100)>=50?"#C0392B":"#1E8449",fontWeight:700}},Math.round((_hCatH.yes.length+_hCatH.mid.length)/t*100)+"%"):React.createElement("span",{style:{color:"#ccc"}},"—");})()),
                  _tdHA(_hpFmtHA(_avgH(_haRecs,"hp"))),
                  _hwHasDataH?_tdHA(_avgH(_haRecs,"hw")!=null?_hwFmtHA(_avgH(_haRecs,"hw")):React.createElement("span",{style:{color:"#ccc"}},"—")):null
                )])
              )
            )
          )
        ),
        
        _hwHasDataH?React.createElement("div",{style:{marginBottom:14}},
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#555",marginBottom:6,borderBottom:"1px solid #e0ddd6",paddingBottom:4}},"ホールド中の値動き（確定値からの上下）",React.createElement("span",{style:{fontSize:9,fontWeight:400,color:"#888",marginLeft:6}},"確定値基準・1株あたり / 上方向＝赤・下方向＝緑 ／ H高値=確定値からの上昇・損切ライン(α+cutLine)越え")),
          (function(){
            var _cats=[
              {key:"__all__",label:"全体",col:"#9A3412",recs:_haRecs},
              {key:"yes",label:"○ 完全利益",col:"#1E8449",recs:_hCatH.yes},
              {key:"mid",label:"△ 部分利益",col:"#B45309",recs:_hCatH.mid},
              {key:"no",label:"× 損失",col:"#C0392B",recs:_hCatH.no},
              {key:"none",label:"ー 変化なし",col:"#888",recs:_hCatH.none}
            ];
            var _avgArr=function(arr){return arr.length?Math.round(arr.reduce(function(a,b){return a+b;},0)/arr.length*10)/10:null;};

            var _confUp=function(s){if(s.osConfVal==null||s.osConfVal==="")return null;return s.osConfSign==="+"?Number(s.osConfVal):s.osConfSign==="-"?-Number(s.osConfVal):0;};
            var _highUp=function(s){if(s.holdHighVal==null)return null;return s.holdHighSign==="-"?Number(s.holdHighVal):s.holdHighSign==="+"?-Number(s.holdHighVal):0;};
            var _hcUp=function(s){if(s.holdWidth==null||s.holdWidthSign==null)return null;return s.holdWidthSign==="-"?Number(s.holdWidth):-Number(s.holdWidth);};
            return React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
              _cats.map(function(c){

                var highRises=[],crossed=0;
                c.recs.forEach(function(h){
                  var s=h.s,cu=_confUp(s),hu=_highUp(s);
                  if(cu!=null&&hu!=null)highRises.push(hu-cu);
                  if(s.holdHighSign==="-"&&s.holdHighVal!=null&&h.aR!=null&&h.cutL!=null&&(Number(s.holdHighVal)-h.aR)>=h.cutL)crossed++;
                });

                var hcDiffs=[];
                c.recs.forEach(function(h){var s=h.s,cu=_confUp(s),hc=_hcUp(s);if(cu!=null&&hc!=null)hcDiffs.push(hc-cu);});
                if(!highRises.length&&!hcDiffs.length)return null;
                var highAvg=_avgArr(highRises);
                var hcUp=hcDiffs.filter(function(v){return v>0;});
                var hcDn=hcDiffs.filter(function(v){return v<0;}).map(function(v){return -v;});
                var hcUpAvg=_avgArr(hcUp),hcDnAvg=_avgArr(hcDn);
                var isAll=c.key==="__all__";
                return React.createElement("div",{key:c.key,style:{flex:isAll?"1 1 100%":"1 1 220px",minWidth:200,background:isAll?"#FFF7ED":"#fff",border:"1px solid "+(isAll?"#FB923C":"#e8e3d8"),borderRadius:8,padding:"8px 12px"}},
                  React.createElement("div",{style:{fontSize:11,fontWeight:700,color:c.col,marginBottom:6}},c.label+" ("+c.recs.length+"件)"),
                  React.createElement("div",{style:{display:"flex",gap:18,alignItems:"flex-end",flexWrap:"wrap"}},
                    React.createElement("div",null,
                      React.createElement("div",{style:{fontSize:9,color:"#888",fontWeight:700,marginBottom:1}},"H高値↑ 確定値からの上昇"),
                      React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#C0392B",lineHeight:1}},highAvg!=null?highAvg+"円":React.createElement("span",{style:{color:"#ccc"}},"—")),
                      React.createElement("div",{style:{fontSize:9,color:crossed>0?"#C0392B":"#aaa",marginTop:2,fontWeight:crossed>0?700:400}},"損切ライン越え "+crossed+"件")
                    ),
                    React.createElement("div",null,
                      React.createElement("div",{style:{fontSize:9,color:"#888",fontWeight:700,marginBottom:1}},"H確定値 確定値から"),
                      React.createElement("div",{style:{display:"flex",gap:10,alignItems:"flex-end"}},
                        React.createElement("div",null,
                          React.createElement("div",{style:{fontSize:8,color:"#aaa",fontWeight:700}},"↑ 上方向"),
                          React.createElement("div",{style:{fontSize:16,fontWeight:800,color:"#C0392B",lineHeight:1}},hcUpAvg!=null?hcUpAvg+"円":React.createElement("span",{style:{color:"#ccc"}},"—")),
                          React.createElement("div",{style:{fontSize:9,color:"#aaa",marginTop:2}},hcUp.length+"件")
                        ),
                        React.createElement("div",null,
                          React.createElement("div",{style:{fontSize:8,color:"#aaa",fontWeight:700}},"↓ 下方向"),
                          React.createElement("div",{style:{fontSize:16,fontWeight:800,color:"#1E8449",lineHeight:1}},hcDnAvg!=null?hcDnAvg+"円":React.createElement("span",{style:{color:"#ccc"}},"—")),
                          React.createElement("div",{style:{fontSize:9,color:"#aaa",marginTop:2}},hcDn.length+"件")
                        )
                      )
                    )
                  )
                );
              }).filter(Boolean)
            );
          })()
        ):null,
        
        _hAlphaEVH.length>0?React.createElement("div",null,
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#555",marginBottom:6,borderBottom:"1px solid #e0ddd6",paddingBottom:4}},"α値別ホールド期待値"),
          React.createElement("div",{style:{overflowX:"auto"}},
            React.createElement("div",{style:{display:"flex",gap:4,alignItems:"flex-end",flexWrap:"wrap",padding:"4px 0"}},
              (function(){
                var maxEvH=Math.max.apply(null,_hAlphaEVH.map(function(d){return Math.abs(d.ev)||0;}));
                return _hAlphaEVH.map(function(d){
                  var barH=maxEvH>0?Math.round(Math.abs(d.ev)/maxEvH*48):4;
                  var isPos=d.ev>=0;var col=isPos?"#C0392B":"#1E8449";
                  var isCur=(pbSimAlpha!==null&&pbSimAlpha===d.alpha)||(pbSimAlpha===null&&_pbStks.some(function(sk){var _cc2=_pbCharts[sk+"_"+date];return _cc2&&_cc2.alphaVal===d.alpha;}));
                  return React.createElement("div",{key:d.alpha,style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:28}},
                    React.createElement("span",{style:{fontSize:9,fontWeight:700,color:col,whiteSpace:"nowrap"}},(d.ev>0?"+":"")+d.ev+"円"),
                    React.createElement("div",{style:{width:22,height:barH||4,background:isPos?"#FEE2E2":"#D1FAE5",border:"1.5px solid "+col,borderRadius:2,boxSizing:"border-box",outline:isCur?"2px solid #0369A1":"none"}}),
                    React.createElement("span",{style:{fontSize:9,color:isCur?"#0369A1":"#888",fontWeight:isCur?700:400}},d.alpha+"円")
                  );
                });
              })()
            )
          ),
          React.createElement("div",{style:{fontSize:9,color:"#aaa",marginTop:4}},"※ 青枠＝現在のα値 / 棒＝期待値の相対比較")
        ):null
      );
    })();
    var _pbMainEl = React.createElement("div", { style: Object.assign({}, Card, { marginTop: 0, borderTop: "none", borderRadius: "0 0 8px 8px", paddingTop: 10 }) },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" } }, "📊 本日の損益データ"),
      _pbGradeLegend,
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 10 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#f5f4f0" } },
              _pbTh("銘柄", { width: "auto", textAlign: "left" }),
              _pbTh("件"),
              _pbTh(React.createElement("span", { style: { color: "#1E8449" } }, "勝")),
              _pbTh(React.createElement("span", { style: { color: "#6B7280" } }, "引")),
              _pbTh(React.createElement("span", { style: { color: "#C0392B" } }, "負")),
              _pbTh(React.createElement("span", { style: { color: "#B45309" } }, "未達")),
              _pbTh("勝率"),
              _pbTh("実現損益"),
              _pbTh(React.createElement("span", null, "想定損益", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#999", display: "block" } }, "(100株)"))),
              _pbTh(React.createElement("span", null, "H勝敗/", React.createElement("span", { style: { display: "block" } }, "結果損益"))),
              _pbTh("タグ", { width: "auto", textAlign: "left" })
            )
          ),
          React.createElement("tbody", null,
            _pbStks.length > 1 ? [
              _pbRow("合計", Object.assign({}, _pbAll, _pbDynOkNg(_pbAllRecs)), true, "#555",
                _profitGradeFromPnlReal(_pbAllReal, _pbAllEnt),
                _profitGradeFromPnl(_pbAll.sumPlanned, _pbAll.sumPlanned !== 0 ? _pbAll.total : 0),
                _profitGradeFromPnl(_pbAll.sumMax, _pbAll.sumMax !== 0 ? _pbAll.total : 0),
                _pbAllEnt > 0, "__total__", null, _pbAllRecs),
              !!pnlTableExpandSet["__total__"] ? _pbExpRow("__total__") : null
            ] : null,
            _pbStks.map(function(sk) {
              var skSt = Object.assign({}, _elCalcStats(_pbByStk[sk]), _pbDynOkNg(_pbByStk[sk]));
              return [
                _pbRow(sk, skSt, false, null,
                  _profitGradeFromPnlReal(_pbRealByStk[sk], _pbEntByStk[sk]),
                  _profitGradeFromPnl(skSt.sumPlanned, skSt.sumPlanned !== 0 ? skSt.total : 0),
                  _profitGradeFromPnl(skSt.sumMax, skSt.sumMax !== 0 ? skSt.total : 0),
                  _pbEntByStk[sk] > 0, sk, _pbStockTags(sk), _pbByStk[sk]),
                !!pnlTableExpandSet[sk] ? _pbExpRow(sk) : null
              ];
            })
          )
        )
      ),
      _pbHasAlpha && React.createElement("div", { style: { marginTop: 10, padding: "8px 10px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "α 理想α値（0〜20円）"),
        React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "α値を何円に固定していたら最適だったか（確定値の平均ベース・100株換算）"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 11, width: "100%" } },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: { padding: "2px 8px", fontWeight: 700, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "left" } }, "銘柄"),
                React.createElement("th", { style: { padding: "2px 6px", fontWeight: 700, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center", borderLeft: "1px solid #dbeafe" } }, "最低利益α値"),
                React.createElement("th", { style: { padding: "2px 6px", fontWeight: 600, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center" } }, "想定利益"),
                React.createElement("th", { style: { padding: "2px 6px", fontWeight: 700, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center", borderLeft: "1px solid #dbeafe" } }, "目標利益α値"),
                React.createElement("th", { style: { padding: "2px 6px", fontWeight: 600, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center" } }, "想定利益"),
                React.createElement("th", { style: { padding: "2px 6px", fontWeight: 700, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center", borderLeft: "1px solid #dbeafe" } }, "最大利益α値"),
                React.createElement("th", { style: { padding: "2px 6px", fontWeight: 600, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center" } }, "想定利益")
              )
            ),
            React.createElement("tbody", null,
              _pbStks.map(function(sk) {
                var d = _pbAlphaByStk[sk];
                var fmtA = function(v) { return v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, v + "円"); };
                var fmtP = function(v) {
                  if (v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
                  var col = v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888";
                  return React.createElement("span", { style: { fontWeight: 700, color: col } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円");
                };
                return React.createElement("tr", { key: sk, style: { borderBottom: "1px solid #dbeafe" } },
                  React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#9A3412", fontSize: 11 } }, sk),
                  React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #dbeafe" } }, fmtA(d.minAlpha)),
                  React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 11 } }, fmtP(d.minProfit)),
                  React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #dbeafe" } }, fmtA(d.tgtAlpha)),
                  React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 11 } }, fmtP(d.tgtProfit)),
                  React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #dbeafe" } }, fmtA(d.maxAlpha)),
                  React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 11 } }, fmtP(d.maxProfit))
                );
              }).concat(
                _pbStks.length > 1 && (_pbTotMinProfit != null || _pbTotTgtProfit != null || _pbTotMaxProfit != null)
                  ? [React.createElement("tr", { key: "__total__", style: { borderTop: "2px solid #BAE6FD", background: "#EFF6FF" } },
                      React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#555", fontSize: 10 } }, "合計"),
                      React.createElement("td", { style: { borderLeft: "1px solid #dbeafe" } }),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, fontWeight: 800, color: _pbTotMinProfit > 0 ? "#C0392B" : _pbTotMinProfit < 0 ? "#1E8449" : "#888" } },
                        _pbTotMinProfit != null ? (_pbTotMinProfit > 0 ? "+" : "") + _pbTotMinProfit.toLocaleString() + "円" : "—"),
                      React.createElement("td", { style: { borderLeft: "1px solid #dbeafe" } }),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, fontWeight: 800, color: _pbTotTgtProfit > 0 ? "#C0392B" : _pbTotTgtProfit < 0 ? "#1E8449" : "#888" } },
                        _pbTotTgtProfit != null ? (_pbTotTgtProfit > 0 ? "+" : "") + _pbTotTgtProfit.toLocaleString() + "円" : "—"),
                      React.createElement("td", { style: { borderLeft: "1px solid #dbeafe" } }),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, fontWeight: 800, color: _pbTotMaxProfit > 0 ? "#C0392B" : _pbTotMaxProfit < 0 ? "#1E8449" : "#888" } },
                        _pbTotMaxProfit != null ? (_pbTotMaxProfit > 0 ? "+" : "") + _pbTotMaxProfit.toLocaleString() + "円" : "—")
                    ),
                    _pbAllAlphaResult ? React.createElement("tr", { key: "__allalpha__", style: { borderTop: "1px solid #BAE6FD", background: "#DBEAFE" } },
                      React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#0369A1", fontSize: 10, whiteSpace: "nowrap" } }, "全銘柄",
                        React.createElement("div", { style: { fontSize: 8, fontWeight: 400, color: "#64748B", marginTop: 1 } }, "統合最適α")),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #93C5FD" } },
                        _pbAllAlphaResult.minAlpha != null ? React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, _pbAllAlphaResult.minAlpha + "円") : React.createElement("span", { style: { color: "#ccc" } }, "—")),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, fontWeight: 800, color: (_pbAllAlphaResult.minProfit||0) > 0 ? "#C0392B" : (_pbAllAlphaResult.minProfit||0) < 0 ? "#1E8449" : "#888" } },
                        _pbAllAlphaResult.minProfit != null ? (_pbAllAlphaResult.minProfit > 0 ? "+" : "") + _pbAllAlphaResult.minProfit.toLocaleString() + "円" : "—"),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #93C5FD" } },
                        _pbAllAlphaResult.tgtAlpha != null ? React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, _pbAllAlphaResult.tgtAlpha + "円") : React.createElement("span", { style: { color: "#ccc" } }, "—")),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, fontWeight: 800, color: (_pbAllAlphaResult.tgtProfit||0) > 0 ? "#C0392B" : (_pbAllAlphaResult.tgtProfit||0) < 0 ? "#1E8449" : "#888" } },
                        _pbAllAlphaResult.tgtProfit != null ? (_pbAllAlphaResult.tgtProfit > 0 ? "+" : "") + _pbAllAlphaResult.tgtProfit.toLocaleString() + "円" : "—"),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, borderLeft: "1px solid #93C5FD" } },
                        _pbAllAlphaResult.maxAlpha != null ? React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, _pbAllAlphaResult.maxAlpha + "円") : React.createElement("span", { style: { color: "#ccc" } }, "—")),
                      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", fontSize: 12, fontWeight: 800, color: (_pbAllAlphaResult.maxProfit||0) > 0 ? "#C0392B" : (_pbAllAlphaResult.maxProfit||0) < 0 ? "#1E8449" : "#888" } },
                        _pbAllAlphaResult.maxProfit != null ? (_pbAllAlphaResult.maxProfit > 0 ? "+" : "") + _pbAllAlphaResult.maxProfit.toLocaleString() + "円" : "—")
                    ) : null]
                  : []
              )
            )
          )
        )
      )
    );
    return React.createElement(React.Fragment, null, _pbMainEl, _haEl);
  })(),
  React.createElement("div", {
    style: Card
  },
  React.createElement(MemoSection, {
    memo: dd.tradesSummaryMemo || (dd.summary
      ? { text: (dd.summary || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"), images: [] }
      : { text: "", images: [] }),
    onChange: function onChange(v) {
      
      
      updDay("tradesSummaryMemo", v);
      
      if (dd.summary) updDay("summary", "");
    },
    title: "📝 本日の総括",
    guardKey: "tradesSummary_" + date
  })),
  
  (function() {
    var _dtCharts = data.charts || {};
    var _dtItems = dd.items || [];
    var _dtAllRecs = [];
    allStocks.forEach(function(stk) {
      var _dtC = _dtCharts[stk + "_" + date] || {};
      var _dtSigs = Array.isArray(_dtC.signals) ? _dtC.signals : [];
      _dtSigs.forEach(function(sig) {
        var s = _compatSignal(sig);
        var item = null;
        if (s.itemId != null) {
          for (var _ii2 = 0; _ii2 < _dtItems.length; _ii2++) {
            if (String(_dtItems[_ii2].id) === String(s.itemId)) { item = _dtItems[_ii2]; break; }
          }
        }
        _dtAllRecs.push({ date: date, stock: stk, signal: s, item: item });
      });
    });
    if (!_dtAllRecs.length) return null;
    _dtAllRecs.sort(function(a, b) {
      var ta = a.signal.time || "99:99", tb = b.signal.time || "99:99";
      if (ta !== tb) return ta.localeCompare(tb);
      return a.stock.localeCompare(b.stock);
    });
    var _dtFmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
    var _dtCol = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _dtRecData = _dtAllRecs.map(function(r) {
      var s = r.signal, item = r.item;
      var entered = _elIsEntered(s, item);
      var sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
      var per100 = function(v) { return sh > 0 ? Math.round(v / sh * 100) : Math.round(v); };
      var realRaw = (item && item.pnl != null) ? Number(item.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
      var planRaw = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
      var maxRaw  = _elSignedVal(s.maxPnl, s.maxPnlSign);
      return {
        stock: r.stock, time: s.time || "99:99", entered: entered,
        result: s.result, difficulty: s.difficulty,
        realN: realRaw != null ? per100(realRaw) : null,
        planN: planRaw != null ? per100(planRaw) : null,
        maxN:  maxRaw  != null ? per100(maxRaw)  : null
      };
    });
    
    var _entRecs = _dtRecData.filter(function(d) { return d.entered; });
    var _maxWin = 0, _maxLose = 0, _sc = 0;
    var _streakArr = _entRecs.map(function(d) {
      if (d.result === "ok") { _sc = _sc > 0 ? _sc + 1 : 1; _maxWin = Math.max(_maxWin, _sc); }
      else if (d.result === "ng") { _sc = _sc < 0 ? _sc - 1 : -1; _maxLose = Math.max(_maxLose, -_sc); }
      else { _sc = 0; }
      return _sc;
    });
    
    var _BANDS = ["9:00","9:15","9:30","9:45","10:00","10:15","10:30","10:45","11:00","11:15","11:30","11:45","12:00","12:15","12:30","12:45","13:00","13:15","13:30","13:45","14:00","14:15","14:30","14:45","15:00"];
    var _bandKey = function(t) {
      if (!t || t === "99:99") return null;
      var pts = t.split(":"), mins = parseInt(pts[0]) * 60 + parseInt(pts[1] || 0);
      for (var bi = _BANDS.length - 2; bi >= 0; bi--) {
        var bp = _BANDS[bi].split(":"), bm = parseInt(bp[0]) * 60 + parseInt(bp[1]);
        if (mins >= bm) return _BANDS[bi];
      }
      return _BANDS[0];
    };
    
    var _bandMap = {};
    _dtRecData.forEach(function(d) {
      if (!d.entered) return;
      var bk = _bandKey(d.time); if (!bk) return;
      if (!_bandMap[bk]) _bandMap[bk] = { ok: 0, ng: 0, sum: 0 };
      if (d.result === "ok") _bandMap[bk].ok++;
      else if (d.result === "ng") _bandMap[bk].ng++;
      if (d.realN != null) _bandMap[bk].sum += d.realN;
    });
    var _usedBands = _BANDS.filter(function(b) { return !!_bandMap[b]; });
    
    var _diffMap = { A: { ok: 0, ng: 0, sum: 0, cnt: 0, skip: 0, skipPlan: 0 }, B: { ok: 0, ng: 0, sum: 0, cnt: 0, skip: 0, skipPlan: 0 }, C: { ok: 0, ng: 0, sum: 0, cnt: 0, skip: 0, skipPlan: 0 } };
    _dtRecData.forEach(function(d) {
      var dm = _diffMap[d.difficulty]; if (!dm) return;
      dm.cnt++;
      if (d.entered) {
        if (d.result === "ok") dm.ok++;
        else if (d.result === "ng") dm.ng++;
        if (d.realN != null) dm.sum += d.realN;
      } else {
        dm.skip++;
        if (d.planN != null) dm.skipPlan += d.planN;
      }
    });
    
    var _skipped = _dtRecData.filter(function(d) { return !d.entered; });
    var _skipFail = _skipped.filter(function(d) { return d.planN != null && d.planN > 0; });
    var _skipOk   = _skipped.filter(function(d) { return d.planN == null || d.planN <= 0; });
    var _skipFailSum = _skipFail.reduce(function(s, d) { return s + (d.planN || 0); }, 0);
    
    var _hmStks = allStocks.filter(function(stk) { return (_dtCharts[stk + "_" + date] || {}).signals; });
    var _hmUsedBands = {};
    var _hmMap = {};
    _dtRecData.forEach(function(d) {
      var bk = _bandKey(d.time); if (!bk) return;
      _hmUsedBands[bk] = true;
      var key = d.stock + "_" + bk;
      if (!_hmMap[key]) _hmMap[key] = [];
      _hmMap[key].push(d);
    });
    var _hmBands = _BANDS.filter(function(b) { return _hmUsedBands[b]; });
    
    var _hd = function(txt, icon) {
      return React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 } },
        React.createElement("span", null, icon), " ", txt);
    };
    var _card = function(children, extra) {
      return React.createElement("div", { style: Object.assign({ background: "#fff", border: "1px solid #e8e5de", borderRadius: 8, padding: "12px 14px" }, extra || {}) }, children);
    };
    return React.createElement("div", { style: Object.assign({}, Card, { marginTop: 0 }) },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#333" } }, "📊 本日のデータ"),
      
      _card([
        _hd("勝敗シーケンス", "🔵"),
        _entRecs.length === 0
          ? React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "エントリー記録なし")
          : React.createElement("div", null,
              React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3 } },
                _entRecs.map(function(d, i) {
                  var isOk = d.result === "ok", isNg = d.result === "ng";
                  var sc = _streakArr[i];
                  return React.createElement("span", { key: i, title: d.time + " " + d.stock,
                    style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 22, height: 22, borderRadius: "50%",
                      background: isOk ? "#DCFCE7" : isNg ? "#FEE2E2" : "#f5f4f0",
                      border: "1.5px solid " + (isOk ? "#86EFAC" : isNg ? "#FCA5A5" : "#ddd"),
                      color: isOk ? "#15803D" : isNg ? "#DC2626" : "#aaa",
                      fontWeight: 700, fontSize: 12,
                      boxShadow: Math.abs(sc) >= 3 ? ("0 0 0 2px " + (sc > 0 ? "#4ADE80" : "#F87171")) : "none"
                    }
                  }, isOk ? "○" : isNg ? "×" : "—");
                })
              ),
              React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: "#666" } },
                React.createElement("span", null, "最大連勝: ", React.createElement("b", { style: { color: "#15803D" } }, _maxWin, "連")),
                React.createElement("span", null, "最大連敗: ", React.createElement("b", { style: { color: "#DC2626" } }, _maxLose, "連"))
              )
            )
      ], { marginBottom: 10 }),
      
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 10 } },
        _card([
          _hd("時間帯別成績", "⏱"),
          _usedBands.length === 0
            ? React.createElement("div", { style: { color: "#aaa", fontSize: 11 } }, "データなし")
            : React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
                React.createElement("thead", null,
                  React.createElement("tr", { style: { borderBottom: "1px solid #eee" } },
                    React.createElement("th", { style: { textAlign: "left", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "時間帯"),
                    React.createElement("th", { style: { textAlign: "center", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "勝/負"),
                    React.createElement("th", { style: { textAlign: "right", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "実現損益")
                  )
                ),
                React.createElement("tbody", null,
                  _usedBands.map(function(b) {
                    var m = _bandMap[b], tot = m.ok + m.ng;
                    var wp = tot > 0 ? Math.round(m.ok / tot * 100) : null;
                    return React.createElement("tr", { key: b, style: { borderBottom: "1px solid #f5f4f0" } },
                      React.createElement("td", { style: { padding: "3px 4px", color: "#666", whiteSpace: "nowrap" } },
                        (function() { var bi = _BANDS.indexOf(b); return b + "〜" + (_BANDS[bi + 1] || ""); })()),
                      React.createElement("td", { style: { padding: "3px 4px", textAlign: "center", whiteSpace: "nowrap" } },
                        React.createElement("span", { style: { color: "#15803D" } }, m.ok), "勝",
                        React.createElement("span", { style: { color: "#DC2626", marginLeft: 4 } }, m.ng), "敗",
                        wp != null ? React.createElement("span", { style: { color: "#888", marginLeft: 4, fontSize: 10 } }, wp + "%") : null
                      ),
                      React.createElement("td", { style: { padding: "3px 4px", textAlign: "right", fontWeight: 600, color: _dtCol(m.sum), whiteSpace: "nowrap" } },
                        m.sum !== 0 ? _dtFmt(m.sum) : "—")
                    );
                  })
                )
              )
        ]),
        _card([
          _hd("難易度別成績", "🏅"),
          React.createElement("div", { style: { fontSize: 10, color: "#9A3412", fontWeight: 600, marginBottom: 3 } }, "エントリー時"),
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { borderBottom: "1px solid #eee" } },
                React.createElement("th", { style: { textAlign: "center", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "難易度"),
                React.createElement("th", { style: { textAlign: "center", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "勝/負"),
                React.createElement("th", { style: { textAlign: "right", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "実現損益")
              )
            ),
            React.createElement("tbody", null,
              ["A","B","C"].map(function(dif) {
                var m = _diffMap[dif]; if (m.cnt === 0) return null;
                var ent = m.ok + m.ng, wp = ent > 0 ? Math.round(m.ok / ent * 100) : null;
                var gs = _GRADE_STYLE[dif] || _GRADE_STYLE.Z;
                return React.createElement("tr", { key: dif, style: { borderBottom: "1px solid #f5f4f0" } },
                  React.createElement("td", { style: { padding: "4px 4px", textAlign: "center" } },
                    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 18, height: 18, borderRadius: "50%",
                      background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
                      fontWeight: 800, fontSize: 10 } }, dif)
                  ),
                  React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", whiteSpace: "nowrap" } },
                    ent > 0
                      ? [React.createElement("span", { key: "o", style: { color: "#15803D" } }, m.ok), "勝",
                         React.createElement("span", { key: "n", style: { color: "#DC2626", marginLeft: 4 } }, m.ng), "敗",
                         wp != null ? React.createElement("span", { key: "w", style: { color: "#888", marginLeft: 4, fontSize: 10 } }, wp + "%") : null]
                      : React.createElement("span", { style: { color: "#aaa" } }, "—")
                  ),
                  React.createElement("td", { style: { padding: "4px 4px", textAlign: "right", fontWeight: 600, color: _dtCol(m.sum), whiteSpace: "nowrap" } },
                    m.sum !== 0 ? _dtFmt(m.sum) : "—")
                );
              })
            )
          ),
          React.createElement("div", { style: { fontSize: 10, color: "#666", fontWeight: 600, marginTop: 10, marginBottom: 3 } }, "見送り時"),
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { borderBottom: "1px solid #eee" } },
                React.createElement("th", { style: { textAlign: "center", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "難易度"),
                React.createElement("th", { style: { textAlign: "center", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "件数"),
                React.createElement("th", { style: { textAlign: "right", padding: "2px 4px", fontWeight: 600, color: "#888", fontSize: 10 } }, "想定損益")
              )
            ),
            React.createElement("tbody", null,
              ["A","B","C"].map(function(dif) {
                var m = _diffMap[dif]; if (m.skip === 0) return null;
                var gs = _GRADE_STYLE[dif] || _GRADE_STYLE.Z;
                return React.createElement("tr", { key: dif, style: { borderBottom: "1px solid #f5f4f0" } },
                  React.createElement("td", { style: { padding: "4px 4px", textAlign: "center" } },
                    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 18, height: 18, borderRadius: "50%",
                      background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
                      fontWeight: 800, fontSize: 10 } }, dif)
                  ),
                  React.createElement("td", { style: { padding: "4px 4px", textAlign: "center", color: "#666" } }, m.skip, "件"),
                  React.createElement("td", { style: { padding: "4px 4px", textAlign: "right", fontWeight: 600, color: _dtCol(m.skipPlan), whiteSpace: "nowrap" } },
                    m.skipPlan !== 0 ? _dtFmt(m.skipPlan) : "—")
                );
              })
            )
          )
        ]),
        _card([
          _hd("見送り検証", "🔍"),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7, fontSize: 11 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f5f4f0", paddingBottom: 5 } },
              React.createElement("span", { style: { color: "#666" } }, "見送り総数"),
              React.createElement("b", null, _skipped.length, "件")
            ),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #f5f4f0", paddingBottom: 5 } },
              React.createElement("span", { style: { color: "#DC2626" } }, "見送り失敗"),
              React.createElement("span", null,
                React.createElement("b", { style: { color: "#DC2626" } }, _skipFail.length, "件"),
                _skipFail.length > 0
                  ? React.createElement("span", { style: { color: "#DC2626", marginLeft: 5, fontSize: 10 } }, _dtFmt(_skipFailSum), "機会損失")
                  : null
              )
            ),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", paddingBottom: 5 } },
              React.createElement("span", { style: { color: "#15803D" } }, "見送り正解"),
              React.createElement("b", { style: { color: "#15803D" } }, _skipOk.length, "件")
            ),
            _skipped.length > 0 ? React.createElement("div", { style: { padding: "4px 8px", background: "#f9f8f6", borderRadius: 4, fontSize: 10, color: "#888", textAlign: "center" } },
              "見送り正解率 ",
              React.createElement("b", { style: { fontSize: 13, color: _skipOk.length >= _skipFail.length ? "#15803D" : "#DC2626" } },
                Math.round(_skipOk.length / _skipped.length * 100) + "%")
            ) : null
          )
        ])
      ),
      
      _card([
        _hd("シグナル分布", "🗓"),
        _hmStks.length === 0 || _hmBands.length === 0
          ? React.createElement("div", { style: { color: "#aaa", fontSize: 11 } }, "データなし")
          : React.createElement("div", null,
              React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { borderCollapse: "separate", borderSpacing: 2, fontSize: 10 } },
                  React.createElement("thead", null,
                    React.createElement("tr", null,
                      React.createElement("th", { style: { padding: "2px 6px", fontWeight: 600, color: "#888" } }, ""),
                      _hmBands.map(function(b) {
                        return React.createElement("th", { key: b, style: { padding: "2px 4px", fontWeight: 600, color: "#888", textAlign: "center", minWidth: 34, whiteSpace: "nowrap" } }, b);
                      })
                    )
                  ),
                  React.createElement("tbody", null,
                    _hmStks.map(function(stk) {
                      return React.createElement("tr", { key: stk },
                        React.createElement("td", { style: { padding: "3px 6px", fontWeight: 700, color: "#9A3412", whiteSpace: "nowrap" } }, stk),
                        _hmBands.map(function(b) {
                          var cells = _hmMap[stk + "_" + b] || [];
                          if (cells.length === 0) return React.createElement("td", { key: b, style: { padding: "3px 4px", textAlign: "center", color: "#ddd", background: "#fafaf8", borderRadius: 3 } }, "·");
                          var hasOk = cells.some(function(c) { return c.result === "ok" && c.entered; });
                          var hasNg = cells.some(function(c) { return c.result === "ng" && c.entered; });
                          var anyEnt = cells.some(function(c) { return c.entered; });
                          var bg = hasOk && !hasNg ? "#DCFCE7" : hasNg && !hasOk ? "#FEE2E2" : anyEnt ? "#FEF9C3" : "#FFEDD5";
                          var col = hasOk && !hasNg ? "#15803D" : hasNg && !hasOk ? "#DC2626" : anyEnt ? "#854D0E" : "#9A3412";
                          var lbl = cells.length > 1 ? cells.length + "" : (anyEnt ? (hasOk ? "○" : hasNg ? "×" : "△") : "△");
                          return React.createElement("td", { key: b, title: stk + " " + b + ": " + cells.length + "件",
                            style: { padding: "3px 5px", textAlign: "center", background: bg, color: col,
                              fontWeight: 700, borderRadius: 3, border: "1px solid #e8e5de" } }, lbl);
                        })
                      );
                    })
                  )
                )
              ),
              React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "3px 12px", marginTop: 7, fontSize: 9, color: "#888", alignItems: "center" } },
                [
                  { bg: "#DCFCE7", col: "#15803D", lbl: "○", desc: "勝ち" },
                  { bg: "#FEE2E2", col: "#DC2626", lbl: "×", desc: "負け" },
                  { bg: "#FEF9C3", col: "#854D0E", lbl: "△", desc: "勝敗混在／結果未記録" },
                  { bg: "#FFEDD5", col: "#9A3412", lbl: "△", desc: "見送り" },
                  { bg: "#FEE2E2", col: "#DC2626", lbl: "2", desc: "複数シグナル（件数）" }
                ].map(function(item, i) {
                  return React.createElement("span", { key: i, style: { display: "inline-flex", alignItems: "center", gap: 3 } },
                    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 16, height: 14, background: item.bg, border: "1px solid #e8e5de", borderRadius: 2,
                      color: item.col, fontWeight: 700, fontSize: 9 } }, item.lbl),
                    item.desc
                  );
                }).concat([
                  React.createElement("span", { key: "none", style: { display: "inline-flex", alignItems: "center", gap: 3 } },
                    React.createElement("span", { style: { color: "#ddd", fontWeight: 700 } }, "·"),
                    "シグナルなし"
                  )
                ])
              )
            )
      ])
    );
  })(),
  showForm && React.createElement(EntryRecordForm, {
    data: data,
    save: save,
    initial: tradeEditTarget
      ? { stock: tradeEditTarget.stock, date: tradeEditTarget.date, signal: tradeEditTarget.signal }
      : { date: date, stock: allStocks[0] || "" },
    onClose: function() { setShowForm(false); setTradeEditTarget(null); }
  })));
}


