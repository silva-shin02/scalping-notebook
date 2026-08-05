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
  // シグナル詳細タグ（sigDetail）の全名称を平坦化（新形式{b,k,f}・旧フラット配列・旧単一文字列すべて対応）2026-07-07。検索の詳細タグ絞り込み用。
  var _sigDetailNames = function(s) {
    var out = [], sd = s && s.sigDetail;
    if (!sd || typeof sd !== "object") return out;
    Object.keys(sd).forEach(function(k) {
      var v = sd[k];
      if (v == null) return;
      if (Array.isArray(v)) { v.forEach(function(x) { if (x && out.indexOf(x) < 0) out.push(x); }); return; }
      if (typeof v === "string") { if (out.indexOf(v) < 0) out.push(v); return; }
      if (typeof v === "object") { [v.b, v.k].forEach(function(x) { if (x && out.indexOf(x) < 0) out.push(x); }); (Array.isArray(v.f) ? v.f : []).forEach(function(x) { if (x && out.indexOf(x) < 0) out.push(x); }); }
    });
    return out;
  };
  var _sigHasDetail = function(s, det) { return _sigDetailNames(s).indexOf(det) >= 0; };
  var deleteExtraTag = function deleteExtraTag(tag) {
    // 関数アップデータで最新stateにマージ＝古いdataスナップショットでcharts/tradesを上書きしない。2026-06-20
    save(function (prev) {
      var ch = _objectSpread({}, prev.charts),
        tr = _objectSpread({}, prev.trades);
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
      return _objectSpread(_objectSpread({}, prev), {}, {
        charts: ch,
        trades: tr
      });
    }, { immediate: true });
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
          return [s.tag || "", s.customTagText || "", s.rationale || "", s.reflection || "", s.thruMemo || "", s.reviewMemo || "", s.tradeType || ""].concat(_sigDetailNames(s));
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
          } else if (tag.startsWith("__detail:")) {
            var det = tag.slice(9);
            if (!chartArr.some(function (c) {
              return c && (c.signals || []).some(function(s) { return _sigHasDetail(s, det); });
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
          if (tag.startsWith("__signal:") || tag.startsWith("__tradetype:") || tag.startsWith("__result:") || tag.startsWith("__entered:") || tag.startsWith("__detail:")) return {
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
          return (s.rationale || "").toLowerCase().includes(kw) || (s.reflection || "").toLowerCase().includes(kw) || (s.thruMemo || "").toLowerCase().includes(kw) || (s.reviewMemo || "").toLowerCase().includes(kw) || (s.tradeType || "").toLowerCase().includes(kw);
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
  (function() {
    // 🔖 詳細タグ（sigDetail）で絞り込み 2026-07-07。候補=マスターcustom.sigDetails2{b,k,f}∪旧custom.sigDetails∪記録に実在する詳細名。
    var _detNames = {}, _detOrd = [];
    var _addDet = function(n) { if (n && !_detNames[n]) { _detNames[n] = 1; _detOrd.push(n); } };
    var _sd2 = custom.sigDetails2 || {};
    Object.keys(_sd2).forEach(function(k) { var v = _sd2[k]; if (v && typeof v === "object") ["b", "k", "f"].forEach(function(sk) { (Array.isArray(v[sk]) ? v[sk] : []).forEach(_addDet); }); });
    var _sd1 = custom.sigDetails || {};
    Object.keys(_sd1).forEach(function(k) { (Array.isArray(_sd1[k]) ? _sd1[k] : []).forEach(_addDet); });
    Object.keys(data.charts || {}).forEach(function(ck) { var c = data.charts[ck]; (c && c.signals || []).forEach(function(s) { _sigDetailNames(s).forEach(_addDet); }); });
    return _detOrd.length ? React.createElement(React.Fragment, null,
      React.createElement(SH, { label: "🔖 詳細タグ" }),
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 1 } },
        _detOrd.map(function(t) { return React.createElement(TC, { key: "__detail:" + t, tagKey: "__detail:" + t, label: t, color: ["#FFF7ED", "#FDBA74", "#B45309"] }); }))) : null;
  })(),
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
  
  selTags.some(function(t){ return t.startsWith("__signal:") || t.startsWith("__tradetype:") || t.startsWith("__result:") || t.startsWith("__entered:") || t.startsWith("__detail:"); }) && (function() {
    var sigTags = selTags.filter(function(t){ return t.startsWith("__signal:"); }).map(function(t){ return t.slice(9); });
    var ttFilters = selTags.filter(function(t){ return t.startsWith("__tradetype:"); }).map(function(t){ return t.slice(12); });
    var resFilters = selTags.filter(function(t){ return t.startsWith("__result:"); }).map(function(t){ return t.slice(9); });
    var entFilters = selTags.filter(function(t){ return t.startsWith("__entered:"); }).map(function(t){ return t.slice(10); });
    var detFilters = selTags.filter(function(t){ return t.startsWith("__detail:"); }).map(function(t){ return t.slice(9); });
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
        if (detFilters.length > 0 && !detFilters.some(function(d) { return _sigHasDetail(s, d); })) return;
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
      var _cSV = data.charts[k] || {};
      var _cutSV = _cSV.cutLine != null ? Number(_cSV.cutLine) : 15;
      var _stkSV = k.slice(0, k.lastIndexOf("_"));
      return (_cSV.signals || []).filter(function(sig) { return _elIsEntered(sig, null); })
        .map(function(sig) { return { sig: sig, cut: _cutSV, stock: _stkSV }; });
    });
    // 合計額算入: 検索日カードの損益/勝敗は除外記録(includeInTotal===false)を抜く。タグ表示(entryTagLabels)は全件のまま。2026-06-18
    // 検索日カードは全銘柄横断のグランド日合計＝②データのみ（候補で未指定）も除外 2026-07-22e。
    var _enteredSigsT = enteredSigs.filter(function(e) { return _elInclTotalAmt(data, { stock: e.stock, date: date, signal: e.sig }); });
    // 時間かぶり除外: 実現損益合計だけ良い方を抜く（勝敗カウントは件数系＝全件のまま）2026-07-07
    var pnl = _enteredSigsT.filter(function(e) { return !_elCollExcludedSig(data, e.stock, date, e.sig); }).reduce(function(acc, e) {
      var v = _elSignedVal(e.sig.realizedPnl, e.sig.realizedPnlSign);
      return acc + (v != null ? v : 0);
    }, 0);
    var _collExclN = _enteredSigsT.filter(function(e) { return _elCollExcludedSig(data, e.stock, date, e.sig); }).length;   // その日の時間かぶり除外件数（全銘柄横断＝実現損益合計と同じ母数）2026-07-08
    // 勝敗はライブα基準（v2/v3はresult=null保存のためEP足から導出）
    var _resSV = function(e) { return _elDynResult(e.sig, _epOwnAlpha(e.sig), e.cut); };
    var w = _enteredSigsT.filter(function(e) { return _resSV(e) === "ok"; }).length;
    var l = _enteredSigsT.filter(function(e) { return _resSV(e) === "ng"; }).length;

    var entryTagLabels = enteredSigs.map(function(e) { return _elTagLabel(e.sig); }).filter(Boolean);
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
    _collExclN > 0 && React.createElement("span", {
      title: "\u6642\u9593\u304B\u3076\u308A\u3067\u5408\u8A08\u304B\u3089\u9664\u5916\u3057\u305F\u8A18\u9332\u306E\u4EF6\u6570\uFF08\u540C\u65E55\u5206\u4EE5\u5185\u30DA\u30A2\u306E\u9045\u3044\u65B9\uFF0F\u540C\u6642\u523B\u306A\u3089\u640D\u76CA\u304C\u5927\u304D\u3044\u65B9\uFF09",
      style: { fontSize: 10, fontWeight: 700, color: "#6D28D9", background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }
    }, "\u88AB\u308A\u9664\u5916 " + _collExclN + "\u4EF6"),
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
  var _saSt = useState(null), _stAudit = _saSt[0], _setStAudit = _saSt[1];
  var _saBz = useState(""), _stBusy = _saBz[0], _setStBusy = _saBz[1];
  var _saRc = useState(null), _stRc = _saRc[0], _setStRc = _saRc[1];
  var _saRcP = useState(null), _stRcP = _saRcP[0], _setStRcP = _saRcP[1];
  var _saBd = useState(null), _stBd = _saBd[0], _setStBd = _saBd[1];
  var _saBdP = useState(null), _stBdP = _saBdP[0], _setStBdP = _saBdP[1];
  var _saCat = useState(null), _stCat = _saCat[0], _setStCat = _saCat[1];
  var _saCatP = useState(null), _stCatP = _saCatP[0], _setStCatP = _saCatP[1];
  var _defNewsCut = (function() { var d = new Date(); d.setMonth(d.getMonth() - 3); var mm = ("0" + (d.getMonth() + 1)).slice(-2), dd2 = ("0" + d.getDate()).slice(-2); return d.getFullYear() + "-" + mm + "-" + dd2; })();
  var _saNc = useState(_defNewsCut), _stNewsCut = _saNc[0], _setStNewsCut = _saNc[1];
  var _saNp = useState(null), _stNewsPrev = _saNp[0], _setStNewsPrev = _saNp[1];
  var _nadInitDays = (function(){ var x = data && data.custom && data.custom.newsImgAutoDelete; return (x && typeof x.periodDays === "number" && x.periodDays > 0) ? x.periodDays : 7; })();
  var _saNdU = useState(_nadInitDays % 7 === 0 ? "week" : "day"), _stNdU = _saNdU[0], _setStNdU = _saNdU[1];
  var _saNdV = useState(_nadInitDays % 7 === 0 ? String(_nadInitDays / 7) : String(_nadInitDays)), _stNdV = _saNdV[0], _setStNdV = _saNdV[1];
  var _saTab = useState("sync"), _stTab = _saTab[0], _setStTab = _saTab[1];
  var _saTh = useState(_snGetTheme()), _thMode = _saTh[0], _setThMode = _saTh[1];
  var _stFmtMB = function(b) { return (b >= 1048576) ? (b / 1048576).toFixed(2) + " MB" : Math.round(b / 1024) + " KB"; };
  var _runStAudit = function() {
    if (_stBusy) return;
    if (!_fbStorageRef) { window._snAlert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    _setStBusy("audit"); _setStAudit(null);
    _snStorageAudit(data, cfg).then(function(r) {
      _setStBusy("");
      if (!r || !r.ok) { window._snAlert("Storageの診断に失敗しました（" + ((r && r.reason) || "error") + "）。通信状態を確認してください。"); return; }
      _setStAudit(r);
    });
  };
  var _runStDelete = function(graceDays) {
    if (_stBusy) return;
    graceDays = (graceDays == null ? 30 : graceDays);
    // 安全ガード: dataが読めていない可能性がある時は中止（全消し事故防止）。
    if (!data || (!data.charts && !data.trades)) { window._snAlert("記録データが読み込めていないため中止しました。"); return; }
    _setStBusy("delete");
    // 削除直前に最新を取り直す（多端末リモート＋CA参照を含む完全な参照集合で判定）。
    _snStorageAudit(data, cfg).then(function(r) {
      if (!r || !r.ok) { _setStBusy(""); window._snAlert("再診断に失敗しました。通信状態を確認してください。"); return; }
      _setStAudit(r);
      // 多端末: notebookリモートを取得できなかった＝他端末だけが参照する画像を巻き込む恐れ→中止。
      if (cfg && cfg.fbUrl && (r.remoteOk === false || r.caOk === false)) { _setStBusy(""); window._snAlert("⚠️ 最新データ（または分析ツールの参照情報）を取得できなかったため中止しました。\n全端末で同期し、通信が安定した状態で再実行してください。"); return; }
      // 参照が1件も拾えない＝データ未読込/取得失敗の疑い→安全側で中止。
      if (r.refSetSize === 0 && r.total > 0) { _setStBusy(""); window._snAlert("⚠️ 参照中の画像が見つかりませんでした。データ未読込の可能性があるため中止しました。"); return; }
      var cutoff = Date.now() - graceDays * 86400000;
      // created不明(0)は安全側で常に残す。grace=0なら「作成日が判明している未参照孤児すべて」が対象。
      var delable = r.orphans.filter(function(o) { return o.created && o.created < cutoff; });
      if (!delable.length) { _setStBusy(""); window._snAlert("削除できる孤児（" + (graceDays > 0 ? (graceDays + "日以上前・") : "") + "未参照）はありませんでした。"); return; }
      var bytes = delable.reduce(function(s2, o) { return s2 + o.size; }, 0);
      var msg = (graceDays > 0)
        ? ("未参照の孤児画像 " + delable.length + "件（約" + _stFmtMB(bytes) + "）をFirebase Storageから削除します。\n※このアプリが作成し、記録・CAのどこからも参照されず、" + graceDays + "日以上前のものだけが対象です。表示中の画像・記録には影響しません。\n実行しますか？")
        : ("⚠️ 新しいものも含め、未参照の孤児画像を「すべて」削除します（" + delable.length + "件・約" + _stFmtMB(bytes) + "）。\n※記録・リモート・CAのどこからも参照されていない画像だけが対象です（圧縮で置き換えた古い画像など。表示中の画像は保護されます）。\n※他の端末で同期前の画像を巻き込まないよう、全端末を同期してから実行してください。\n実行しますか？");
      window._snConfirm(msg).then(function(_okc){ if(!_okc) { _setStBusy(""); return; }
      _snStorageDeleteOrphans(delable, graceDays, Date.now()).then(function(res) {
        _setStBusy("");
        window._snAlert("孤児画像を削除しました（" + res.deleted + "件 / 約" + _stFmtMB(res.freed) + "解放" + (res.errs ? " / 失敗" + res.errs + "件" : "") + "）。");
        _runStAudit();
      });
      });
    });
  };
  var _runRecompress = function() {
    if (_stBusy) return;
    if (!_fbStorageRef) { window._snAlert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    if (!data || (!data.charts && !data.trades)) { window._snAlert("記録データが読み込めていないため中止しました。"); return; }
    window._snConfirm("過去の画像（ニュース・チャート・メモなど）をWebP形式・長辺1600pxに再圧縮して、Firebase Storageの容量を削減します。\n\n・画質はほぼ保ったまま1枚あたりの容量を大きく削減します（すでに最適化済みの画像はそのまま）。\n・同じ内容の「表示用」と「原画像(orig)」の重複は1つに集約されます。注釈付き画像の原画像は再編集用に温存します。\n・現在の画像をクラウドから読み込むため、通信量を少し消費します（端末にキャッシュ済みの分は消費しません）。\n・圧縮後、古い画像はクラウドにしばらく残ります。同期完了後に下の「🗂 クラウド画像の整理 → 使用量を診断 → 孤児を削除」を実行すると実際に容量が解放されます。\n\n実行しますか？").then(function(_okc){ if(!_okc) return;
    _setStBusy("recompress"); _setStRc(null); _setStRcP({ done: 0, total: 0 });
    _snRecompressImages(data, function(p) { _setStRcP(p); }).then(function(r) {
      if (!r || !r.ok) { _setStBusy(""); _setStRcP(null); window._snAlert("画像の圧縮に失敗しました（" + ((r && r.reason) || "error") + "）。Firebase設定・通信状態を確認してください。"); return; }
      if (r.compressed === 0) {
        _setStBusy(""); _setStRcP(null); _setStRc(r);
        window._snAlert("圧縮できる画像はありませんでした。\n（対象 " + r.total + "件はすべて最適化済み" + (r.errs ? " / 取得失敗 " + r.errs + "件" : "") + "）");
        return;
      }
      // 参照を新URL（圧縮済みの小さい画像）へ張り替えて保存＝旧オブジェクトは孤児になり、既存GCで回収可能になる。
      save(function(prev) { return _snApplyImgMaps(prev, r.urlMap, r.localMap); });
      _setStBusy(""); _setStRcP(null); _setStRc(r);
      window._snAlert("画像 " + r.compressed + "件を圧縮しました（約" + _stFmtMB(r.savedBytes) + "削減見込み" + (r.errs ? " / 取得失敗 " + r.errs + "件" : "") + "）。\n\n古い画像はまだクラウドに残っています。数十秒待って同期の完了を確認してから、下の「🗂 クラウド画像の整理 → 使用量を診断 → 孤児を削除」を実行すると、実際に容量が解放されます。");
    })["catch"](function(e) { _setStBusy(""); _setStRcP(null); window._snAlert("画像の圧縮中にエラーが発生しました: " + (e && e.message ? e.message : e)); });
    });
  };
  var _runBreakdown = function() {
    if (_stBusy) return;
    if (!_fbStorageRef) { window._snAlert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    _setStBusy("breakdown"); _setStBd(null); _setStBdP({ done: 0, total: 0 });
    _snStorageBreakdown(function(p) { _setStBdP(p); }).then(function(r) {
      _setStBusy(""); _setStBdP(null);
      if (!r || !r.ok) { window._snAlert("内訳の測定に失敗しました（" + ((r && r.reason) || "error") + "）。通信状態を確認してください。"); return; }
      _setStBd(r);
    })["catch"](function(e) { _setStBusy(""); _setStBdP(null); window._snAlert("内訳の測定中にエラーが発生しました: " + (e && e.message ? e.message : e)); });
  };
  var _runCatAudit = function() {
    if (_stBusy) return;
    if (!_fbStorageRef) { window._snAlert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    if (!data || (!data.charts && !data.trades)) { window._snAlert("記録データが読み込めていないため中止しました。"); return; }
    _setStBusy("cat"); _setStCat(null); _setStCatP({ done: 0, total: 0 });
    _snStorageCategoryAudit(data, cfg, function(p) { _setStCatP(p); }).then(function(r) {
      _setStBusy(""); _setStCatP(null);
      if (!r || !r.ok) { window._snAlert("種類別の分析に失敗しました（" + ((r && r.reason) || "error") + "）。通信状態を確認してください。"); return; }
      _setStCat(r);
    })["catch"](function(e) { _setStBusy(""); _setStCatP(null); window._snAlert("種類別の分析中にエラーが発生しました: " + (e && e.message ? e.message : e)); });
  };
  var _runNewsPreview = function() {
    if (!data || !data.trades) { window._snAlert("記録データが読み込めていません。"); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(_stNewsCut || "")) { window._snAlert("日付を YYYY-MM-DD 形式で指定してください。"); return; }
    var r = _snStripOldNewsImages(data, _stNewsCut);
    _setStNewsPrev({ count: r.count, cutoff: _stNewsCut });
  };
  var _runNewsStrip = function() {
    if (!data || !data.trades) { window._snAlert("記録データが読み込めていません。"); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(_stNewsCut || "")) { window._snAlert("日付を YYYY-MM-DD 形式で指定してください。"); return; }
    var r = _snStripOldNewsImages(data, _stNewsCut);
    if (!r.count) { window._snAlert(_stNewsCut + " より前のニュース画像はありませんでした。"); _setStNewsPrev({ count: 0, cutoff: _stNewsCut }); return; }
    window._snConfirm(_stNewsCut + " より前のニュース画像 " + r.count + "枚を記録から外します。\n※テキスト・タグ・記録は残ります（画像だけ削除）。元に戻せません。\n外した画像は、このあと「🗂 使用量を診断 → 新しい孤児も含めて全部削除」を実行するとクラウドから消えて容量が解放されます。\n実行しますか？").then(function(_okc){ if(!_okc) return;
    save(function(prev) { return _snStripOldNewsImages(prev, _stNewsCut).data; });
    _setStNewsPrev({ count: 0, cutoff: _stNewsCut, doneCount: r.count });
    window._snAlert("ニュース画像 " + r.count + "枚を記録から外しました。\n続けて下の「🗂 使用量を診断 → 新しい孤児も含めて全部削除」を実行すると、クラウドの容量が解放されます。");
    });
  };
  var _ndCalcDays = function(v, u) { var n = Number(typeof _toHankakuNum === "function" ? _toHankakuNum(v) : v); if (!(n > 0)) return 0; return u === "week" ? Math.round(n * 7) : Math.round(n); };
  var _ndSaveEnabled = function(en) { if (!save) return; save(function(prev) { var pc = prev.custom || {}; var pn = pc.newsImgAutoDelete || {}; return Object.assign({}, prev, { custom: Object.assign({}, pc, { newsImgAutoDelete: Object.assign({}, pn, { enabled: !!en }) }) }); }); };
  var _ndSaveDaysVal = function(v, u) { var days = _ndCalcDays(v, u); if (!(days > 0) || !save) return; save(function(prev) { var pc = prev.custom || {}; var pn = pc.newsImgAutoDelete || {}; return Object.assign({}, prev, { custom: Object.assign({}, pc, { newsImgAutoDelete: Object.assign({}, pn, { periodDays: days }) }) }); }); };
  var _nadEnabled = !!(data && data.custom && data.custom.newsImgAutoDelete && data.custom.newsImgAutoDelete.enabled === true);
  var _ndPreview = (function() { if (!data || !data.trades) return null; var days = _ndCalcDays(_stNdV, _stNdU); if (!(days > 0)) return null; try { return _snAutoPruneNewsImages(data, Date.now() - days * 86400000).count; } catch(e) { return null; } })();
  // 未参照(孤児)画像の自動削除トグル（2026-07-05）。実処理はapp-08の起動時useEffect。ここは有効/無効の切替のみ（graceDays/intervalDaysは既定7・表示のみ）。
  var _oadSaveEnabled = function(en) { if (!save) return; save(function(prev) { var pc = prev.custom || {}; var po = pc.orphanAutoDelete || {}; return Object.assign({}, prev, { custom: Object.assign({}, pc, { orphanAutoDelete: Object.assign({}, po, { enabled: !!en }) }) }); }); };
  var _oadEnabled = !!(data && data.custom && data.custom.orphanAutoDelete && data.custom.orphanAutoDelete.enabled === true);
  var _oadGrace = (function(){ var x = data && data.custom && data.custom.orphanAutoDelete; return (x && typeof x.graceDays === "number" && x.graceDays >= 0) ? x.graceDays : 7; })();
  var _oadInterval = (function(){ var x = data && data.custom && data.custom.orphanAutoDelete; return (x && typeof x.intervalDays === "number" && x.intervalDays > 0) ? x.intervalDays : 7; })();
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
  }, "\u2699\uFE0F \u8A2D\u5B9A"),
  React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 18, borderBottom: "1px solid #eee", paddingBottom: 10 } },
    [["sync", "\uD83D\uDD04 \u540C\u671F"], ["data", "\uD83D\uDCCA \u30C7\u30FC\u30BF\u30FB\u9298\u67C4"], ["maint", "\uD83D\uDDBC \u753B\u50CF\u30FB\u30E1\u30F3\u30C6"], ["display", "\uD83C\uDFA8 \u8868\u793A"]].map(function(t) {
      var on = _stTab === t[0];
      return React.createElement("button", {
        key: t[0], onClick: function() { _setStTab(t[0]); },
        style: { padding: "6px 11px", fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: "pointer", flex: 1,
          border: on ? "1px solid #BAE6FD" : "1px solid #e0ddd6",
          background: on ? "#E0F2FE" : "#fff", color: on ? "#0C4A6E" : "#888" }
      }, t[1]);
    })
  ),
  _stTab === "display" && React.createElement("div", {
    style: { marginBottom: 20 }
  },
    React.createElement("div", {
      style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 4 }
    }, "🎨 テーマ（ダークモード）"),
    React.createElement("div", {
      style: { fontSize: 12, color: "#777", lineHeight: 1.8, marginBottom: 12 }
    }, "画面全体の色を切り替えます。チャート・画像はそのまま、損益の赤／緑などの色も保たれます。文字が見えにくくならないよう、明るさだけを反転します。"),
    React.createElement("div", { style: { display: "flex", gap: 8 } },
      [["light", "☀️ ライト"], ["dark", "🌙 ダーク"], ["auto", "🖥️ 自動"]].map(function(t) {
        var on = _thMode === t[0];
        return React.createElement("button", {
          key: t[0],
          onClick: function() { _snApplyTheme(t[0]); _setThMode(t[0]); },
          style: { flex: 1, padding: "12px 8px", fontSize: 13, fontWeight: 700, borderRadius: 9, cursor: "pointer",
            border: on ? "2px solid #38BDF8" : "1px solid #e0ddd6",
            background: on ? "#E0F2FE" : "#fff", color: on ? "#0C4A6E" : "#666" }
        }, t[1]);
      })
    ),
    React.createElement("div", {
      style: { fontSize: 11, color: "#999", marginTop: 10, lineHeight: 1.7 }
    }, "「自動」は端末（OS）の設定に追従します。設定はこの端末に保存されます（他の端末とは同期しません）。")
  ),
  _stTab === "sync" && React.createElement("div", {
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
  }, "Firebase Console"), " \u3067\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u4F5C\u6210", React.createElement("br", null), "2. Realtime Database \u3092\u4F5C\u6210", React.createElement("br", null), "3. Database URL \u3068\u4E0B\u306E Database Secret \u3092\u5165\u529B", React.createElement("br", null), "4. \u540C\u671F\u3067\u304D\u305F\u3089\u30EB\u30FC\u30EB\u3067 .read/.write \u3092 false \u306B\u3057\u3066\u5916\u90E8\u906E\u65AD\uFF08Secret\u3067\u672C\u30A2\u30D7\u30EA\u306F\u52D5\u4F5C\uFF09"), [["fbUrl", "Database URL", "text"], ["fbSecret", "Database Secret（ルールを閉じるなら必須）", "password"], ["apiKey", "API Key（Storage用）", "text"]].map(function (_ref55) {
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
  ), null,

  false && React.createElement("div", {
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
          window._snConfirm("\u4ECA\u6708\u306E\u901A\u4FE1\u91CF\u30AB\u30A6\u30F3\u30BF\u30FC\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3059\u304B\uFF1F").then(function(_ok){ if(!_ok) return;
            try { localStorage.removeItem(_fbUsageKey()); _fbWarnShown = {}; } catch(e){}
            window._snAlert("\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3057\u305F");
          });
        },
        style: { marginTop: 8, fontSize: 11, color: "#999", background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }
      }, "\u30AB\u30A6\u30F3\u30BF\u30FC\u30EA\u30BB\u30C3\u30C8")
    );
  }()),
  
  _stTab === "data" && data && save ? (function() {
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
      window._snConfirm("「" + stock + "」を完全削除しますか？\nチャートデータも含めて全て消去され、戻せません。").then(function(_ok){ if(!_ok) return;
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
  
  _stTab === "data" && data && save ? (function() {
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
  _stTab === "data" && data && save ? (function() {
    // 株価帯の境界（2026-07-22）: custom.priceBandBounds（円・昇順）。「本日の株価帯」(DayView)と記録帳「株価帯別」分析の帯分けに使う。動的判定なので変更は過去分にも即追従（手動選択済みの日は帯番号のまま）。
    var _pbCur = _pbBoundsOf(data.custom);
    var _pbLabels = (function() { var ls = []; for (var i = 0; i <= _pbCur.length; i++) ls.push(_pbBandLabel(i, _pbCur)); return ls.join(" ／ "); })();
    var _PBINP = { padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5, fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box", background: "#fff" };
    return React.createElement("div", { style: { marginBottom: 22 } },
      React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6 } }, "💴 株価帯の境界"),
      React.createElement("div", { style: { fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 10 } },
        "「本日の株価帯」の帯分け境界（円・カンマ区切り）。前日終値がこの境界で帯に分類されます。境界を変えると過去の自動判定・株価帯別分析も即追従します（手動選択した日は帯番号のまま）。"),
      React.createElement("div", { style: { background: "#f8f7f4", borderRadius: 8, padding: 10 } },
        React.createElement(FastInput, {
          type: "text", inputMode: "numeric",
          value: _pbCur.join(", "),
          onChange: function(v) {
            var arr = [];
            String(v || "").split(/[,、　\s]+/).forEach(function(s) {
              var n = Number(String(s).replace(/[^\d.]/g, ""));
              if (!isNaN(n) && n > 0 && arr.indexOf(n) < 0) arr.push(n);
            });
            save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { priceBandBounds: arr }) }); });
          },
          debounceMs: 800,
          placeholder: "4000, 5000",
          style: _PBINP
        }),
        React.createElement("div", { style: { fontSize: 10, color: "#999", marginTop: 6, lineHeight: 1.5 } },
          "現在の帯: " + _pbLabels + "　＊空欄＝既定 4000, 5000")
      )
    );
  })() : null,
  _stTab === "data" && data && save ? (function() {
    // 日替わり銘柄の指定（2026-07-22）: custom.rotatingStocks。指定した銘柄は日別ページの銘柄タブに個別タブを作らず「📅日替わり」タブ1つに集約（記録・分析は通常銘柄と同じ）。
    var stocks = (data.custom && data.custom.stocks && data.custom.stocks.length > 0) ? data.custom.stocks : _DEF_STOCKS_FROZEN;
    var rot = (data.custom && Array.isArray(data.custom.rotatingStocks)) ? data.custom.rotatingStocks : [];
    var tgl = function(nm) {
      save(function(prev) {
        var pc = prev.custom || {};
        var cur = Array.isArray(pc.rotatingStocks) ? pc.rotatingStocks.slice() : [];
        var i = cur.indexOf(nm);
        if (i >= 0) cur.splice(i, 1); else cur.push(nm);
        return Object.assign({}, prev, { custom: Object.assign({}, pc, { rotatingStocks: cur }) });
      });
    };
    return React.createElement("div", { style: { marginBottom: 22 } },
      React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6 } }, "📅 日替わり銘柄"),
      React.createElement("div", { style: { fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 10 } },
        "日替わりに指定した銘柄は、日別ページの銘柄タブに個別タブを作らず「📅日替わり」タブ1つに集約します（記録・分析は通常銘柄と同じ）。タップで切替。"),
      React.createElement("div", { style: { background: "#f8f7f4", borderRadius: 8, padding: 10, display: "flex", flexWrap: "wrap", gap: 6 } },
        stocks.filter(function(s) { return s !== "日経平均株価"; }).map(function(s) {
          var on = rot.indexOf(s) >= 0;
          return React.createElement("button", { key: s, onClick: function() { tgl(s); },
            style: { padding: "5px 12px", fontSize: 12, fontWeight: 600, borderRadius: 14, cursor: "pointer", whiteSpace: "nowrap",
              border: on ? "1.5px solid #4338CA" : "1px solid #ccc",
              background: on ? "#EEF2FF" : "#fff", color: on ? "#4338CA" : "#666" } },
            (on ? "📅 " : "") + s);
        })),
      React.createElement("div", { style: { fontSize: 10, color: "#999", marginTop: 6 } }, "📅＝日替わり指定中。常設（JX金属・フジクラ・SBG等）はそのまま個別タブに残します。")
    );
  })() : null,
  _stTab === "data" && data && save ? (function() {
    var signalTags = (data.custom && Array.isArray(data.custom.signalTags)) ? data.custom.signalTags : [];
    var _sigAdd = function(nm) { save(function(prev) { var cur = (prev.custom && Array.isArray(prev.custom.signalTags)) ? prev.custom.signalTags : []; if (cur.indexOf(nm) >= 0) return prev; return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { signalTags: cur.concat([nm]) }) }); }); };
    var _sigDelete = function(nm) { save(function(prev) { var cur = (prev.custom && Array.isArray(prev.custom.signalTags)) ? prev.custom.signalTags : []; return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { signalTags: cur.filter(function(x) { return x !== nm; }) }) }); }); };
    var _sigReorder = function(list) { save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { signalTags: list.slice() }) }); }); };
    var _sigRename = function(oldNm, newNm) { save(function(prev) { return _elSignalRenameData(prev, oldNm, newNm); }); };
    return React.createElement("div", { style: { marginBottom: 22 } },
      React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6 } }, "📡 シグナル管理"),
      React.createElement("div", { style: { fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 10 } }, "シグナル名の追加・改名・削除・並び替え。「✎編集」を押すと各チップに改名(✎)・削除(×)が出ます。改名すると過去の全記録・分析・EPナビ等でその名前が新しい名前へ移行します（既存の名前へ改名した場合は統合）。削除は候補リストから外すだけで、過去の記録に付いた名前は残ります。"),
      React.createElement(_EpnChipMgr, { items: signalTags, accent: { b: "#EA580C", bg: "#FFEDD5", c: "#9A3412" }, addPh: "シグナル名", onAdd: _sigAdd, onRename: _sigRename, onDelete: _sigDelete, onReorder: _sigReorder }));
  })() : null,
  // 2026-08-03e ニュースの分類（カテゴリ／サブ）。日々のボードからタブを全廃したので、名前の管理はここに集約した（app-03 NewsClassSettings）。
  _stTab === "data" && data && save ? React.createElement("div", { style: { marginBottom: 22 } },
    React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6 } }, "📰 ニュースの分類"),
    React.createElement(NewsClassSettings, { data: data, save: save })
  ) : null,
  _stTab === "maint" && React.createElement("div", { style: { marginTop: 18, paddingTop: 14, borderTop: "1px solid #eee" } },
    React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" } }, "🧹 メンテナンス"),
    (function() {   // 端末localStorage使用量メーター（事前見える化）2026-06-29。満杯になると記録の保存に失敗するので、満杯前に整理を促す。タブを開いた時だけ計測。
      var used = 0; try { for (var i = 0; i < localStorage.length; i++) { var _k = localStorage.key(i); var _v = localStorage.getItem(_k) || ""; used += ((_k ? _k.length : 0) + _v.length) * 2; } } catch (e) {}
      var cap = 5 * 1048576;   // 端末差(5〜10MB)はあるが安全側の目安5MB
      var pct = Math.min(100, Math.round(used / cap * 100));
      var col = pct >= 85 ? "#DC2626" : pct >= 65 ? "#D97706" : "#0EA5E9";
      return React.createElement("div", { style: { marginTop: 4, marginBottom: 14, padding: "12px 14px", background: pct >= 85 ? "#FEF2F2" : "#FFFBEB", border: "1px solid " + (pct >= 85 ? "#FCA5A5" : "#FDE68A"), borderRadius: 10 } },
        React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, gap: 8, flexWrap: "wrap" } },
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#92400E" } }, "💾 端末の保存容量（localStorage）"),
          React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: col } }, _stFmtMB(used) + " / 目安 5 MB（" + pct + "%）")),
        React.createElement("div", { style: { height: 10, borderRadius: 5, background: "#F3F4F6", overflow: "hidden" } },
          React.createElement("div", { style: { width: pct + "%", height: "100%", background: col } })),
        React.createElement("div", { style: { fontSize: 10, color: pct >= 85 ? "#DC2626" : "#999", marginTop: 6, lineHeight: 1.6 } },
          pct >= 85 ? "⚠ 残りわずかです。下の「不要キャッシュを削除」や「画像の整理」で空けてください（満杯になると記録の保存に失敗します）。" : "記録・設定・日足キャッシュ等の合計。満杯前に下のメンテナンスで整理できます。端末により上限は5〜10MBと差があり、5MBは安全側の目安です。"));
    })(),
    React.createElement("div", { style: { marginTop: 4, marginBottom: 14, padding: "12px 14px", background: "#F0F9FF", border: "2px solid #BAE6FD", borderRadius: 10 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#0C4A6E" } }, "🗞 ニュース画像の自動削除"),
        React.createElement("button", {
          onClick: function() { _ndSaveEnabled(!_nadEnabled); },
          title: _nadEnabled ? "オン" : "オフ",
          style: { width: 46, height: 25, borderRadius: 13, border: "none", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0, background: _nadEnabled ? "#0EA5E9" : "#cbd5e1" }
        }, React.createElement("span", { style: { position: "absolute", top: 3, left: _nadEnabled ? 24 : 3, width: 19, height: 19, borderRadius: "50%", background: "#fff" } }))
      ),
      React.createElement("div", { style: { fontSize: 11, color: "#555", lineHeight: 1.7, marginBottom: 10 } }, "追加してから一定期間がたったニュース画像を、起動時に自動で削除します（テキスト・タグ・記録は残ります）。ニュース欄のカードで「この記事を保存」を押した記事は、記事ごと保護されて画像も削除されません（2026-08-03に画像1枚ごとの鍵から記事単位へ変更）。"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, opacity: _nadEnabled ? 1 : 0.5 } },
        React.createElement("span", { style: { fontSize: 12, color: "#555", fontWeight: 600 } }, "削除する期間"),
        React.createElement("input", { type: "text", inputMode: "numeric", value: _stNdV, disabled: !_nadEnabled,
          onChange: function(e) { _setStNdV(e.target.value); },
          onBlur: function() { _ndSaveDaysVal(_stNdV, _stNdU); },
          style: { width: 52, textAlign: "center", padding: "6px 8px", border: "1px solid #BAE6FD", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#0C4A6E", background: "#fff", outline: "none" } }),
        React.createElement("select", { value: _stNdU, disabled: !_nadEnabled,
          onChange: function(e) { var uu = e.target.value; _setStNdU(uu); _ndSaveDaysVal(_stNdV, uu); },
          style: { padding: "6px 8px", border: "1px solid #BAE6FD", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none" } },
          React.createElement("option", { value: "week" }, "週間"),
          React.createElement("option", { value: "day" }, "日")
        ),
        React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, "＝" + (_ndCalcDays(_stNdV, _stNdU) || "?") + "日")
      ),
      (_nadEnabled && _ndPreview != null) ? React.createElement("div", { style: { marginTop: 8, fontSize: 11, fontWeight: 600, background: "#fff", borderRadius: 6, padding: "6px 10px", color: _ndPreview > 0 ? "#B45309" : "#15803D" } },
        _ndPreview > 0 ? ("現在この設定だと 保存していないニュース画像 " + _ndPreview + "枚 が削除対象です（次回起動時にまとめて確認します）") : "現在、削除対象の画像はありません"
      ) : null
    ),
    React.createElement("div", { style: { marginTop: 4, marginBottom: 14, padding: "12px 14px", background: "#FEF2F2", border: "2px solid #FECACA", borderRadius: 10 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#7F1D1D" } }, "🗑 未参照（孤児）画像の自動削除"),
        React.createElement("button", {
          onClick: function() { _oadSaveEnabled(!_oadEnabled); },
          title: _oadEnabled ? "オン" : "オフ",
          style: { width: 46, height: 25, borderRadius: 13, border: "none", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0, background: _oadEnabled ? "#EF4444" : "#cbd5e1" }
        }, React.createElement("span", { style: { position: "absolute", top: 3, left: _oadEnabled ? 24 : 3, width: 19, height: 19, borderRadius: "50%", background: "#fff" } }))
      ),
      React.createElement("div", { style: { fontSize: 11, color: "#555", lineHeight: 1.7 } }, "どの記録・分析ツールからも参照されていない画像（圧縮で置き換えた古い画像・削除済みチャートの残骸など）を、起動時に自動でFirebase Storageから削除します。約" + _oadInterval + "日ごとにチェックし、作成から" + _oadGrace + "日以上前・未参照のものだけが対象。表示中の画像・記録には影響しません。最新データ／分析ツールの参照が取得できないときは安全のため実行しません。")
    ),
    React.createElement("button", {
      onClick: function() {
        var keys = [], bytes = 0;
        try {
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && (k.indexOf("sn_dc_csv_v1_") === 0 || k.indexOf("sn_dcc_ca_bar_v1_") === 0)) { keys.push(k); bytes += (localStorage.getItem(k) || "").length; }
          }
        } catch(e){}
        if (!keys.length) { window._snAlert("削除できる不要キャッシュはありませんでした。"); return; }
        window._snConfirm("チャートのキャッシュ " + keys.length + "件（約" + Math.round(bytes / 1024) + "KB）を削除します。\n記録・設定・画像は消えません。次にチャートを見るとき再取得されます。\n実行しますか？").then(function(_okc){ if(!_okc) return;
        var removed = _snEvictExpendableCaches();
        window._snAlert("不要キャッシュを削除しました（" + removed + "件 / 約" + Math.round(bytes / 1024) + "KB）。");
        });
      },
      style: { display: "block", marginTop: 14, padding: "9px 14px", fontSize: 13, fontWeight: 600, background: "#EAF3FB", color: "#1A5276", border: "1px solid #A9CCE3", borderRadius: 7, cursor: "pointer" }
    }, "🧽 不要キャッシュを削除（記録は残す）"),
    React.createElement("div", { style: { fontSize: 10, color: "#999", marginTop: 6, lineHeight: 1.6 } }, "日足チャート/CAのキャッシュ(sn_dc_csv_v1_*・sn_dcc_ca_bar_v1_*)を削除して端末の保存領域を空けます。記録・設定・画像本体(Firebase)は消えません。容量警告が出た時に。"),
    React.createElement("div", { style: { marginTop: 16, paddingTop: 12, borderTop: "1px dashed #eee" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 4 } }, "📊 Storage全体の内訳を測定"),
      React.createElement("div", { style: { fontSize: 10, color: "#999", lineHeight: 1.6, marginBottom: 8 } }, "バケット全フォルダ（notebook-images=このアプリ / chart-images・chart-thumbs=チャート分析ツール 等）を走査し、どこが容量を食っているかを件数・合計サイズ・大きいファイル上位で表示します。読み取りのみ（削除しません）。ファイル数が多いと数十秒かかります。"),
      React.createElement("button", {
        onClick: _runBreakdown,
        disabled: _stBusy === "breakdown",
        style: { padding: "8px 14px", fontSize: 13, fontWeight: 600, background: _stBusy === "breakdown" ? "#eee" : "#EAF3FB", color: "#1A5276", border: "1px solid #A9CCE3", borderRadius: 7, cursor: _stBusy === "breakdown" ? "default" : "pointer" }
      }, _stBusy === "breakdown" ? ((_stBdP && _stBdP.total) ? ("測定中… " + _stBdP.done + "/" + _stBdP.total) : "一覧取得中…") : "全フォルダの内訳を測定"),
      (_stBd && _stBd.ok) ? React.createElement("div", { style: { marginTop: 10, fontSize: 12, color: "#555", lineHeight: 1.8, background: "#f8f7f4", borderRadius: 8, padding: "8px 12px" } },
        React.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, "合計 " + _stBd.total + "件 / " + _stFmtMB(_stBd.totalBytes)),
        Object.keys(_stBd.folders).sort(function(a, b) { return _stBd.folders[b].bytes - _stBd.folders[a].bytes; }).map(function(name) {
          var f = _stBd.folders[name];
          return React.createElement("div", { key: "fld_" + name, style: { display: "flex", justifyContent: "space-between" } },
            React.createElement("span", null, name + "/"),
            React.createElement("span", { style: { fontWeight: 600 } }, _stFmtMB(f.bytes) + "（" + f.count + "件）"));
        }),
        React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 6, marginBottom: 2 } }, "大きいファイル上位:"),
        (_stBd.largest || []).slice(0, 8).map(function(it, i) {
          return React.createElement("div", { key: "lg_" + i, style: { fontSize: 10, color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, _stFmtMB(it.size) + "  " + it.path);
        }),
        React.createElement("div", { style: { fontSize: 10, color: "#999", marginTop: 6, lineHeight: 1.6 } }, "※ chart-images / chart-thumbs はチャート分析ツール(別アプリ)の画像です。削除はそのツール側で。notebook-images はこのアプリの画像で、下の「画像を圧縮」「孤児を削除」で削減できます。")
      ) : null,
      React.createElement("button", {
        onClick: _runCatAudit,
        disabled: _stBusy === "cat",
        style: { display: "block", marginTop: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, background: _stBusy === "cat" ? "#eee" : "#EAF3FB", color: "#1A5276", border: "1px solid #A9CCE3", borderRadius: 7, cursor: _stBusy === "cat" ? "default" : "pointer" }
      }, _stBusy === "cat" ? ((_stCatP && _stCatP.total) ? ("分析中… " + _stCatP.done + "/" + _stCatP.total) : "一覧取得中…") : "📋 notebook-images を種類別に分析"),
      (_stCat && _stCat.ok) ? React.createElement("div", { style: { marginTop: 10, fontSize: 12, color: "#555", lineHeight: 1.8, background: "#f8f7f4", borderRadius: 8, padding: "8px 12px" } },
        React.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, "種類別（notebook-images 合計 " + _stFmtMB(_stCat.totalBytes) + " / " + _stCat.total + "件）"),
        Object.keys(_stCat.cats).sort(function(a, b) { return _stCat.cats[b].bytes - _stCat.cats[a].bytes; }).map(function(name) {
          var c = _stCat.cats[name];
          return React.createElement("div", { key: "cat_" + name, style: { display: "flex", justifyContent: "space-between" } },
            React.createElement("span", null, name),
            React.createElement("span", { style: { fontWeight: 600 } }, _stFmtMB(c.bytes) + "（" + c.count + "件）"));
        }),
        (_stCat.origCnt > 0) ? React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 4 } }, "うち注釈の原画像(orig): " + _stFmtMB(_stCat.origBytes) + "（" + _stCat.origCnt + "件・各種類に内数）") : null,
        (_stCat.remoteOk === false) ? React.createElement("div", { style: { fontSize: 11, color: "#C0392B", marginTop: 4 } }, "⚠ リモート取得失敗。他端末だけが参照する画像が「未参照(孤児)」に混じる可能性（同期・通信を確認し再実行）。") : null
      ) : null
    ),
    React.createElement("div", { style: { marginTop: 16, paddingTop: 12, borderTop: "1px dashed #eee" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 4 } }, "📉 画像を圧縮（ニュース＋チャート・容量削減）"),
      React.createElement("div", { style: { fontSize: 10, color: "#999", lineHeight: 1.6, marginBottom: 8 } }, "notebook-imagesの過去画像（ニュース・チャート・メモ）をWebP・長辺1600pxに再圧縮し、表示用とorigの同一内容の重複を1つに集約します。画質はほぼ保たれ最適化済みは対象外。注釈付き画像の原画像は再編集用に温存。圧縮後、古い画像は下の「孤児を削除」で回収できます。実行時に画像の読み込みで通信を少し消費します。"),
      React.createElement("button", {
        onClick: _runRecompress,
        disabled: _stBusy === "recompress",
        style: { padding: "8px 14px", fontSize: 13, fontWeight: 600, background: _stBusy === "recompress" ? "#eee" : "#FFF7E6", color: "#B45309", border: "1px solid #F0C27B", borderRadius: 7, cursor: _stBusy === "recompress" ? "default" : "pointer" }
      }, _stBusy === "recompress" ? ((_stRcP && _stRcP.total) ? ("圧縮中… " + _stRcP.done + "/" + _stRcP.total) : "準備中…") : "画像を圧縮して容量削減"),
      (_stRc && _stRc.ok && _stRc.compressed > 0) ? React.createElement("div", { style: { marginTop: 10, fontSize: 12, color: "#555", lineHeight: 1.9, background: "#f8f7f4", borderRadius: 8, padding: "8px 12px" } },
        React.createElement("div", { style: { color: "#1E8449", fontWeight: 600 } }, "✓ " + _stRc.compressed + "件を圧縮（約" + _stFmtMB(_stRc.savedBytes) + "削減見込み）"),
        React.createElement("div", { style: { fontSize: 11, color: "#888" } }, "古い画像はクラウドに残存中。同期後に下の「孤児を削除」で解放されます。")
      ) : null
    ),
    React.createElement("div", { style: { marginTop: 16, paddingTop: 12, borderTop: "1px dashed #eee" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 4 } }, "🗞 古いニュース画像を削除（テキストは残す）"),
      React.createElement("div", { style: { fontSize: 10, color: "#999", lineHeight: 1.6, marginBottom: 8 } }, "指定した日付より前のニュース記録から「画像だけ」を外します（テキスト・タグ・記録は残ります）。容量の大半はニュース画像なので古い分の整理が一番効きます。外した画像は下の「全部削除」でクラウドから解放。元に戻せません。"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
        React.createElement("span", { style: { fontSize: 12, color: "#555" } }, "この日付より前:"),
        React.createElement("input", { type: "date", value: _stNewsCut, onChange: function(e) { _setStNewsCut(e.target.value); _setStNewsPrev(null); }, style: { padding: "6px 8px", border: "1px solid #ccc", borderRadius: 6, fontSize: 13 } }),
        React.createElement("button", { onClick: _runNewsPreview, style: { padding: "7px 12px", fontSize: 12, fontWeight: 600, background: "#EAF3FB", color: "#1A5276", border: "1px solid #A9CCE3", borderRadius: 7, cursor: "pointer" } }, "対象を確認")
      ),
      (_stNewsPrev) ? React.createElement("div", { style: { marginTop: 8, fontSize: 12, color: "#555" } },
        React.createElement("div", null, _stNewsPrev.cutoff + " より前のニュース画像: " + _stNewsPrev.count + "枚"),
        (_stNewsPrev.count > 0) ? React.createElement("button", { onClick: _runNewsStrip, style: { marginTop: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, background: "#FFF1F0", color: "#C0392B", border: "1px solid #F5A6A0", borderRadius: 7, cursor: "pointer" } }, "この " + _stNewsPrev.count + "枚を削除（テキストは残す）") : null,
        (_stNewsPrev.doneCount) ? React.createElement("div", { style: { color: "#1E8449", fontWeight: 600, marginTop: 4 } }, "✓ " + _stNewsPrev.doneCount + "枚を外しました。続けて下の「使用量を診断 → 全部削除」で容量解放を。") : null
      ) : null
    ),
    (function() {
      var a = _stAudit;
      var deletable = 0, deletableBytes = 0;
      if (a && a.ok) {
        var _ct = Date.now() - 30 * 86400000;
        a.orphans.forEach(function(o) { if (o.created && o.created < _ct) { deletable++; deletableBytes += o.size; } });
      }
      return React.createElement("div", { style: { marginTop: 16, paddingTop: 12, borderTop: "1px dashed #eee" } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 4 } }, "🗂 クラウド画像の整理（Firebase Storage）"),
        React.createElement("div", { style: { fontSize: 10, color: "#999", lineHeight: 1.6, marginBottom: 8 } }, "削除済みの記録などで参照されなくなった「孤児画像」がStorageに残り容量を圧迫します。診断し、どこからも参照されず30日以上前の孤児だけを安全に削除します（表示中の画像・記録には影響しません）。対象はこのアプリがアップロードした画像のみ。診断は最新データの取得など通信を多少消費します。"),
        React.createElement("button", {
          onClick: _runStAudit,
          disabled: _stBusy === "audit",
          style: { padding: "8px 14px", fontSize: 13, fontWeight: 600, background: _stBusy === "audit" ? "#eee" : "#EAF3FB", color: "#1A5276", border: "1px solid #A9CCE3", borderRadius: 7, cursor: _stBusy === "audit" ? "default" : "pointer" }
        }, _stBusy === "audit" ? "診断中…" : "使用量を診断"),
        (a && a.ok) ? React.createElement("div", { style: { marginTop: 10, fontSize: 12, color: "#555", lineHeight: 1.9, background: "#f8f7f4", borderRadius: 8, padding: "8px 12px" } },
          React.createElement("div", null, "総オブジェクト: " + a.total + "件 / " + _stFmtMB(a.totalBytes)),
          React.createElement("div", null, "参照中: " + a.refCnt + "件 / " + _stFmtMB(a.refBytes)),
          React.createElement("div", { style: { color: a.orphans.length ? "#B45309" : "#1E8449", fontWeight: 600 } }, "孤児(未参照): " + a.orphans.length + "件 / " + _stFmtMB(a.orphanBytes)),
          React.createElement("div", { style: { fontSize: 11, color: "#888" } }, "うち削除可能(30日以上前): " + deletable + "件 / " + _stFmtMB(deletableBytes)),
          (a.remoteOk === false || a.caOk === false) ? React.createElement("div", { style: { fontSize: 11, color: "#C0392B", marginTop: 4 } }, "⚠ 最新データ（または分析ツール参照）を取得できず。削除は安全のため中止されます（同期・通信を確認して再診断）。") : null,
          React.createElement("div", { style: { marginTop: 8 } },
            deletable > 0 ? React.createElement("button", {
              onClick: function() { _runStDelete(30); },
              disabled: _stBusy === "delete",
              style: { padding: "8px 14px", fontSize: 13, fontWeight: 700, background: _stBusy === "delete" ? "#eee" : "#FFF1F0", color: "#C0392B", border: "1px solid #F5A6A0", borderRadius: 7, cursor: _stBusy === "delete" ? "default" : "pointer" }
            }, _stBusy === "delete" ? "削除中…" : ("孤児を削除（30日以上前・" + deletable + "件・約" + _stFmtMB(deletableBytes) + "）")) : null,
            (a.orphans.length > 0) ? React.createElement("button", {
              onClick: function() { _runStDelete(0); },
              disabled: _stBusy === "delete",
              style: { display: "block", marginTop: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, background: _stBusy === "delete" ? "#eee" : "#C0392B", color: "#fff", border: "1px solid #C0392B", borderRadius: 7, cursor: _stBusy === "delete" ? "default" : "pointer" }
            }, _stBusy === "delete" ? "削除中…" : ("新しい孤児も含めて全部削除（" + a.orphans.length + "件・約" + _stFmtMB(a.orphanBytes) + "）")) : null,
            (a.orphans.length > 0) ? React.createElement("div", { style: { fontSize: 10, color: "#999", marginTop: 6, lineHeight: 1.6 } }, "「全部削除」は圧縮で置き換えた直後（30日以内）の古い画像も対象にします。記録・リモート・CAで参照中の画像は保護。全端末を同期してから実行してください。") : null
          )
        ) : null
      );
    }())
  ),
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
    var cutoff = new Date(last + "T00:00:00");
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
  var save = _props_qrt.save;
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


  var isNikkei = activeStock === "日経平均株価";

  var _qrMkBadge = function(g) {
    var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
    return React.createElement("span", { style: {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 16, height: 16, borderRadius: "50%", background: gs.bg, color: gs.color,
      border: "1.5px solid " + gs.border, fontWeight: 800, fontSize: 10, lineHeight: 1, flexShrink: 0
    } }, g);
  };
  var _qrAmtCol = function(v) { return v == null ? "#aaa" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
  var _qrFmtAmt = function(v) { return v == null ? "" : (v > 0 ? "+" : "") + v.toLocaleString(); };
  var _qrAmtSpan = function(v, suffix) {
    return React.createElement("span", {
      style: { fontSize: 11, fontWeight: 700, color: _qrAmtCol(v), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }
    }, _qrFmtAmt(v) + (suffix != null ? suffix : "円"));
  };

  var _qrMkBadgeSm = function(g) {
    var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
    return React.createElement("span", { style: {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 13, height: 13, borderRadius: "50%", background: gs.bg, color: gs.color,
      border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, lineHeight: 1, flexShrink: 0
    } }, g);
  };
  // 金額を固定幅・右寄せにして、カッコや内側の数字が縦にそろうようにする。
  var _qrAmtR = function(v, w, fs) {
    return React.createElement("span", { style: { display: "inline-flex", justifyContent: "flex-end", width: w, minWidth: w, fontSize: fs, fontWeight: 700, color: _qrAmtCol(v), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } }, _qrFmtAmt(v) + "円");
  };
  var _qrPlanChip = function(g) {
    if (!g || g.plan === "Z") return React.createElement("span", { style: { color: "#ccc", fontSize: 11 } }, "—");
    var badgeNode, numNode;
    if (g.planAB == null) {
      badgeNode = _qrMkBadge(g.plan);
      numNode = _qrAmtR(g.planSum, 52, 11);
    } else {
      var _abAmt = g.planSumAB != null ? g.planSumAB : g.planSum;
      var _showParen = _abAmt !== g.planSum;
      badgeNode = _qrMkBadge(g.planAB);
      numNode = React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2 } },
        _qrAmtR(_abAmt, 52, 11),
        _showParen ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 1, marginLeft: 1 } },
          React.createElement("span", { style: { fontSize: 10, color: "#d6c8b8", fontWeight: 400, lineHeight: 1, marginRight: 2 } }, "/"),
          _qrMkBadgeSm(g.plan),
          _qrAmtR(g.planSum, 44, 9)
        ) : null
      );
    }
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3 } }, badgeNode, numNode);
  };
  var _qrHoldChip = function(g) {
    if (!g || g.hold === "Z") return React.createElement("span", { style: { color: "#ccc", fontSize: 11 } }, "—");
    // 結果損益は「損切を踏まえたキャップ後」値で、B以上を主表示・全体をカッコ併記。
    var badgeNode, numNode;
    if (g.holdPlanCapAB == null) {
      badgeNode = _qrMkBadge(g.holdPlanCap);
      numNode = _qrAmtR(g.holdSumPlanCap, 52, 11);
    } else {
      var _abAmt = g.holdSumPlanCapAB != null ? g.holdSumPlanCapAB : g.holdSumPlanCap;
      var _showParen = _abAmt !== g.holdSumPlanCap;
      badgeNode = _qrMkBadge(g.holdPlanCapAB);
      numNode = React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2 } },
        _qrAmtR(_abAmt, 52, 11),
        _showParen ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 1, marginLeft: 1 } },
          React.createElement("span", { style: { fontSize: 10, color: "#d6c8b8", fontWeight: 400, lineHeight: 1, marginRight: 2 } }, "/"),
          _qrMkBadgeSm(g.holdPlanCap),
          _qrAmtR(g.holdSumPlanCap, 44, 9)
        ) : null
      );
    }
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3 } }, badgeNode, numNode);
  };

  var _qrALab = function(n) {
    return React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#92400E",
      background: "#FFFBF0", border: "1px solid #FDE68A", borderRadius: 4, padding: "0 4px", whiteSpace: "nowrap" } }, "α" + n);
  };
  var _qrMLab = function(t) {
    return React.createElement("span", { style: { fontSize: 9, color: "#aaa", fontWeight: 600,
      width: 16, display: "inline-block", flexShrink: 0 } }, t);
  };
  var _qrSep = function() { return React.createElement("span", { style: { color: "#ddd", margin: "0 1px" } }, "｜"); };

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
          style: { fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6 }
        },
          React.createElement("span", null, activeStock + " 早見表")
        ),
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
        style: { width: "100%", minWidth: isNikkei ? 312 : 540, fontSize: 12, borderCollapse: "collapse" }
      },
        React.createElement("thead", null,
          React.createElement("tr", { style: { background: "#f5f4f0" } },
            (isNikkei
              ? [
                  { label: "日付", pad: "6px 4px" },
                  { label: "地合い", pad: "6px 6px" },
                  { label: "イベント・タグ", pad: "6px 6px" }
                ]
              : [
                  { label: "日付", pad: "6px 4px" },
                  { label: "地合い", pad: "6px 6px" },
                  { label: "最終損益", pad: "6px 7px" },
                  { label: "実現損益", pad: "6px 7px" },
                  { label: "イベント・タグ", pad: "6px 6px" }
                ]
            ).map(function(h, _hi, _harr) {
              return React.createElement("th", {
                key: h.label,
                style: { textAlign: "center", padding: h.pad, fontWeight: 600,
                  fontSize: 11, color: "#888", whiteSpace: "nowrap",
                  borderRight: _hi < _harr.length - 1 ? "1px solid #e3e0da" : "none" }
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
              style: { padding: "7px 4px",
                fontWeight: isHL ? 700 : (isHoliday ? 700 : 400),
                whiteSpace: "nowrap",
                color: dateColor, borderRight: "1px solid #efece7" }
            }, d.slice(5) + "（" + dow2 + "）"),
            React.createElement("td", {
              style: { padding: "7px 6px", whiteSpace: "nowrap", borderRight: "1px solid #efece7" }
            },
              (function() {
                var _pill = isHoliday
                  ? React.createElement("span", { style: { display: "inline-block", padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: "#F3E8FF", color: _holidayPurple, border: "1px solid " + _holidayPurple } }, "祝日休場")
                  : (c2 && c2.macroLocal
                    ? React.createElement(CPill, { label: c2.macroLocal, color: getMC(c2.macroLocal), sm: true })
                    : React.createElement("span", { style: { color: "#ddd" } }, "—"));
                var _hasData = !isHoliday && !isSun && !isSat && c2;
                var _numTxt = (_hasData && typeof c2.dayClose === "number")
                  ? (activeStock === "日経平均株価" ? c2.dayClose.toLocaleString(undefined, { maximumFractionDigits: 2 }) : Math.round(c2.dayClose).toLocaleString())
                  : null;
                var _chg = null;
                if (_hasData && activeStock === "日経平均株価" && typeof c2.prevDayChange === "number") _chg = React.createElement("span", { style: { color: c2.prevDayChange >= 0 ? "#DC2626" : "#16A34A" } }, "(" + (c2.prevDayChange >= 0 ? "+" : "") + c2.prevDayChange.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "円)");
                else if (_hasData && activeStock !== "日経平均株価" && typeof c2.prevDayPct === "number") _chg = React.createElement("span", { style: { color: c2.prevDayPct >= 0 ? "#DC2626" : "#16A34A" } }, "(" + (c2.prevDayPct >= 0 ? "+" : "") + c2.prevDayPct.toFixed(2) + "%)");
                return React.createElement("div", { style: { display: "inline-flex", alignItems: "center" } },
                  React.createElement("span", { style: { display: "inline-flex", justifyContent: "center", alignItems: "center", width: 58, flexShrink: 0 } }, _pill),
                  React.createElement("span", { style: { display: "inline-flex", justifyContent: "flex-end", alignItems: "center", width: 50, flexShrink: 0, fontSize: 10, fontWeight: 700, color: "#333" } }, _numTxt),
                  React.createElement("span", { style: { display: "inline-flex", justifyContent: "flex-start", alignItems: "center", width: 52, flexShrink: 0, paddingLeft: 3, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" } }, _chg)
                );
              })()
            ),
            isNikkei ? null : React.createElement("td", {
              style: { padding: "6px 7px", whiteSpace: "nowrap", borderRight: "1px solid #efece7" }
            }, (function() {
              // 最終損益＝期待度○が途切れた所で手じまい（（）外・旧H2損益と同一基準・（）内=△含む）。EP損益/H1損益列を集約 2026-07-09。
              if (!c2 || isHoliday) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _ttMark = _elTradeTagMarker(c2);   // 取引カテゴリタグ日: ノーシグナル→DNFピル / 有効シグナルなし等→Z（取引なし）2026-07-23
              if (_ttMark) return _ttMark;
              var _cutA = c2.cutLine != null ? Number(c2.cutLine) : 15;
              var _g = _elCalcChartGrades(c2.signals, null, _cutA, function(_sg) { return _elCollExcludedSig(data, activeStock, d, _sg, activeStock); });
              if (_g.allMissH) return _qZeroCell();
              if (_g.hold2Sum == null) return (_g.hold2RefCnt > 0)
                ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, _elHold2RefSuffix(_g.hold2Sum, _g.hold2RefSum, _g.hold2RefCnt))
                : React.createElement("span", { style: { fontSize: 11, color: "#ccc" } }, "—");
              return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
                _g.hold2Grade ? _qrMkBadge(_g.hold2Grade) : null, _qrAmtSpan(_g.hold2Sum, "円"),
                _elHold2RefSuffix(_g.hold2Sum, _g.hold2RefSum, _g.hold2RefCnt));
            })()),
            isNikkei ? null : React.createElement("td", {
              style: { padding: "6px 7px", whiteSpace: "nowrap", borderRight: "1px solid #efece7" }
            }, (function() {
              if (!c2 || isHoliday) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _cutR = c2.cutLine != null ? Number(c2.cutLine) : 15;
              var _gR = _elCalcChartGrades(c2.signals, null, _cutR, function(_sg) { return _elCollExcludedSig(data, activeStock, d, _sg, activeStock); });
              if (_gR.real === "Z") return React.createElement("span", { style: { fontSize: 11, color: "#ccc" } }, "—");
              return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
                _qrMkBadge(_gR.real), _qrAmtSpan(_gR.realSum, "円"));
            })()),
            null,
            React.createElement("td", {
              style: { padding: "7px 6px", width: "30%" }
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


// ===== ⚡EPナビ（場中のEP計算・保存早見 2026-07-07）=====
// 日別ページ取引タブ「エントリー記録」の【上】に独立表示。①基準分足②シグナル③底抜け/起点④その他⑤ライン併存ルールを選ぶと
// 記録フォームと同じ段階フォールバック（詳細別→シグナル別→銘柄全体・前日まで全期間・この日より前の記録のみ／直近件数窓は2026-07-14に廃止）で
// 推奨基本α/推奨追加α（根拠別）を表示し、予定EP＝水準線価格＋実効α（基本α＋浮き足加算＋追加α）を算出。
// 「💾保存」で charts[銘柄_日付].epNavi に保存（Firebase同期・×2タップ削除・過去日を開くと当時の保存が残る）。
// 早見は銘柄を横並び＋各銘柄でEP高い順に縦積み・追加αありは赤字/5分足基準は緑・✎で計算パネルへ読込んで更新。
// 推奨ロジックは EntryRecordForm の _refSigAlpha/_pickWin（app-05）と同一。※2026-07-14: ユーザー指示で記録フォーム・EPナビ両方とも「直近50→100件窓を廃止＝前日まで全期間pick」に変更（見出し/推奨★と詳細表を一致させるため）。両者は再び同一ロジック＝変更時は両方直すこと（app-05 _pickWin と app-04 _epnPickWin）。仮値の扱いのみ差（記録フォーム=okのみ／EPナビ=場中は仮値も採る＝_elCascadePick allowProvisional）。
function _epnTagsOf(s) { return (s.tags && s.tags.length) ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : []); }
function _epnReasonsOf(s) {
  if (!s) return [];
  if (Array.isArray(s.specialReasons)) return s.specialReasons.filter(function(x) { return x; });
  if (s.addAlphaReason) return [s.addAlphaReason];
  return [];
}
function _epnPickWin(rs, aiOf) { if (!rs || !rs.length) return { alpha: null, idealAlpha: null, ok: false, n: 0, add: null }; var _A = _elBaseAlphaA(rs, aiOf); var p = _A ? _A.pick : null; if (!p || p.alpha == null || p.status === "none") return { alpha: null, idealAlpha: null, ok: false, n: rs.length, add: _A ? _A.add : null }; return { alpha: p.alpha, idealAlpha: p.idealAlpha, ok: p.status === "ok", n: rs.length, add: _A ? _A.add : null }; }   // 2026-07-14: 直近件数窓(_elWinPick)を廃止＝前日まで全期間pick。記録フォーム_pickWin(app-05)と同一ロジックに再統一＝EPナビの推奨★と「表を参照」全期間詳細表(_elBaseAlphaDetailV2 over casc.all)を一致させる（ユーザー指示）。返り値shapeは_elWinPickと同一。
// _elCollectAllSignals(data) の単一スロット・同一性キャッシュ（2026-07-08f）: _epnCascade は計算フォーム最大3列＋追加α〇カードごとに呼ばれ、同一data参照の全チャート走査が重複する。dataはsaveで必ず新オブジェクトになる＝参照が変われば自動失効・結果は純粋関数で不変なので安全。返り値配列は_epnCascade側でfilter（新配列生成）してから使うためキャッシュ配列は不変。
var _epnSigCacheData = null, _epnSigCacheOut = null;
function _epnCollectSignals(data) {
  if (data === _epnSigCacheData && _epnSigCacheOut) return _epnSigCacheOut;
  _epnSigCacheOut = _elCollectAllSignals(data);
  _epnSigCacheData = data;
  return _epnSigCacheOut;
}
function _epnCascade(data, stock, tag, sel, beforeDate) {
  var all = _epnCollectSignals(data).filter(function(r) {
    return r.stock === stock && _epIsV2(r.signal) && _elInclData(r.signal) && (!beforeDate || r.date < beforeDate);   // _epnCascade＝推奨α（分析母数・データ算入）2026-07-22f
  });
  var aiOf = function(r) { return _elAlphaInfo(r, data); };
  var stk = _epnPickWin(all, aiOf);
  // 株価帯フォールバック（第2弾 2026-07-22f）: 銘柄全体が確信推奨を出せないとき（!stk.ok）だけ、その銘柄の対象日の株価帯と同じ帯の全銘柄記録（銘柄横断・前日まで・材料日除外）から推奨基本αを計算＝薄い銘柄を似た株価帯の銘柄で補う。perf: 銘柄okまたは帯不明のときは計算しない。カスケードは詳細→シグナル→銘柄→帯の順で最後のフォールバック。
  var band = null;
  if (!(stk && stk.ok) && beforeDate) {
    var _bi = _pbDayBandOf(data, stock, beforeDate);
    if (_bi && !_bi.material && _bi.idx != null) { var _bpool = _pbBandPoolFor(data, _bi.idx, beforeDate); if (_bpool.length) band = _epnPickWin(_bpool, aiOf); }
  }
  if (!tag) return { all: all, sigRecs: null, detRecs: null, stk: stk, sig: null, det: null, band: band, aiOf: aiOf };
  var recs = all.filter(function(r) { return _epnTagsOf(r.signal).indexOf(tag) >= 0; });
  var _selB = (sel && sel.b) || null, _selK = (sel && sel.k) || null, _selF = (sel && sel.f) || [];
  var detRecs = (_selB || _selK || _selF.length) ? recs.filter(function(r) {
    var _sc = _elSigDetailSec(r.signal, tag);
    if (_selB && _sc.b !== _selB) return false;
    if (_selK && _sc.k !== _selK) return false;
    for (var i = 0; i < _selF.length; i++) { if (_sc.f.indexOf(_selF[i]) < 0) return false; }
    return true;
  }) : null;
  return { all: all, sigRecs: recs, detRecs: detRecs, stk: stk, sig: _epnPickWin(recs, aiOf), det: detRecs ? _epnPickWin(detRecs, aiOf) : null, band: band, aiOf: aiOf };
}
// 保存/更新を一本化: 同一idの既存エントリー（同日どの銘柄でも）を除去してから stock に追加＝新規追加も編集更新（銘柄変更含む）も同経路。
function _epnPut(save, date, stock, item) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var suf = "_" + date;
    Object.keys(charts).forEach(function(ck) {
      var pos = ck.length - suf.length;
      if (pos <= 0 || ck.indexOf(suf, pos) !== pos) return;
      var c = charts[ck];
      if (!c || !Array.isArray(c.epNavi)) return;
      var filtered = c.epNavi.filter(function(x) { return !x || x.id !== item.id; });
      if (filtered.length !== c.epNavi.length) charts[ck] = Object.assign({}, c, { epNavi: filtered });
    });
    var ck2 = stock + suf;
    var c2 = charts[ck2] || {};
    var arr = Array.isArray(c2.epNavi) ? c2.epNavi.slice() : [];
    arr.push(item);
    charts[ck2] = Object.assign({}, c2, { epNavi: arr });
    return Object.assign({}, prev, { charts: charts });
  });
}
function _epnDelete(save, stock, date, id) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    var c = charts[ck]; if (!c) return prev;
    var arr = (Array.isArray(c.epNavi) ? c.epNavi : []).filter(function(x) { return x && x.id !== id; });
    // 2026-07-18 削除トムストーン: 物理削除に加え削除idを_delEpNaviに記録＝多端末同期でEP保存が復活しない（signalsの_delSig:app-05 _elDeleteSignalと同型）。保存/更新(_epnSave側)ではidを積まない＝再追加が消えるのを回避。
    var _dels = Array.isArray(c._delEpNavi) ? c._delEpNavi.slice() : [];
    var _eid = String(id);
    if (_dels.indexOf(_eid) < 0) _dels.push(_eid);
    charts[ck] = Object.assign({}, c, { epNavi: arr, _delEpNavi: _dels });
    return Object.assign({}, prev, { charts: charts });
  });
}
// 「本日の採用α値」の保存（2026-07-13d）: charts[銘柄_日付].epNaviDayAlpha に数値で保持（null=未設定＝推奨基本αに追従）。EP保存(epNavi)と同じチャートオブジェクトの別フィールド＝日付ごと・銘柄ごと。下の計算フォームの基本α初期値に反映（_EpnCalcFormへdayAlpha propで受け渡し）。
function _epnDayAlphaGet(data, stock, date) {
  var c = ((data && data.charts) || {})[stock + "_" + date];
  var v = c ? c.epNaviDayAlpha : null;
  return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null;
}
function _epnDayAlphaSet(save, stock, date, val) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    charts[ck] = Object.assign({}, charts[ck] || {}, { epNaviDayAlpha: (val == null ? null : val) });
    return Object.assign({}, prev, { charts: charts });
  });
}
// 「本日の採用α値（応用α）」の保存（2026-07-13 task3）: charts[銘柄_日付].epNaviDaySpecialAlpha。基本α(epNaviDayAlpha)と対の独立フィールド。null=未設定＝推奨応用αに追従。
function _epnDaySpecialAlphaGet(data, stock, date) {
  var c = ((data && data.charts) || {})[stock + "_" + date];
  var v = c ? c.epNaviDaySpecialAlpha : null;
  return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null;
}
function _epnDaySpecialAlphaSet(save, stock, date, val) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    charts[ck] = Object.assign({}, charts[ck] || {}, { epNaviDaySpecialAlpha: (val == null ? null : val) });
    return Object.assign({}, prev, { charts: charts });
  });
}
// ===== 株価帯（price band）2026-07-22 =====
// 「本日の株価帯」＝日×銘柄の属性。判定は動的: 手動上書き(charts[ck].dayPriceBand) > 前日終値からの自動(日足CSV sn_dc_csv_v1_*) > null(未設定)。
// 境界はcustom.priceBandBounds（昇順の円・既定[4000,5000]＝〜4000/4001〜5000/5001〜）。境界変更で過去分の自動判定・株価帯別分析も即追従（保存するのは手動上書きと材料フラグのみ）。
// 材料フラグ(charts[ck].dayMaterial)＝前日大引け後に材料があった日。株価帯別分析では帯から外して「⚡材料あり」独立グループ。
var _PB_DEF_BOUNDS = [4000, 5000];
function _pbBoundsOf(custom) {
  var b = custom && custom.priceBandBounds;
  if (!Array.isArray(b) || !b.length) return _PB_DEF_BOUNDS;
  var v = [];
  b.forEach(function(x) { var n = Number(x); if (!isNaN(n) && n > 0 && v.indexOf(n) < 0) v.push(n); });
  v.sort(function(a, b2) { return a - b2; });
  return v.length ? v : _PB_DEF_BOUNDS;
}
function _pbBandIdx(price, bounds) {
  if (price == null || isNaN(Number(price))) return null;
  var p = Number(price);
  for (var i = 0; i < bounds.length; i++) { if (p <= bounds[i]) return i; }
  return bounds.length;
}
function _pbBandLabel(idx, bounds) {
  if (idx == null || idx < 0 || idx > bounds.length) return "";
  if (idx === 0) return "〜" + bounds[0];
  if (idx === bounds.length) return (bounds[bounds.length - 1] + 1) + "〜";
  return (bounds[idx - 1] + 1) + "〜" + bounds[idx];
}
// 前日終値ルックアップ（2026-07-22b修正）: 早見表(StockQuickRefTable)と同一源＝charts[銘柄_日付].dayClose（CAツールの当日1分足終値・開くたび自動取得）。
// 旧実装は日足CSV(sn_dc_csv_v1_*)を別途読んでいたため早見表と食い違った（stale/別フィード＝JX金属で4,653を誤表示）。dayCloseを読めば定義上一致し銘柄別に正しい・移行不要・早見表が新鮮化されれば即追従。
function _pbPrevClose(data, stock, date) {
  if (!stock || !date) return null;
  var charts = (data && data.charts) || {};
  var pre = stock + "_", best = null;
  Object.keys(charts).forEach(function(k) {
    if (k.indexOf(pre) !== 0) return;
    var dt = k.slice(pre.length);
    if (dt >= date) return;
    var c = charts[k];
    var v = (c && typeof c.dayClose === "number" && !isNaN(c.dayClose)) ? c.dayClose : null;
    if (v == null) return;
    if (best === null || dt > best.dt) best = { dt: dt, val: v };
  });
  return best ? Math.round(best.val) : null;   // 早見表の地合い列と同じくMath.round
}
// 固有材料タグ改名（2026-07-22b）: custom.materialTags の改名＋charts[*].dayMaterialTags の旧名も追従（重複排除・既存名への統合可）。固有材料は名前ベース保存なので改名はこのcascadeで整合を保つ（削除は候補からのみ＝過去の選択は残す＝signalTagsと同方針）。
function _matRenameData(prev, oldNm, newNm) {
  oldNm = String(oldNm == null ? "" : oldNm).trim();
  newNm = String(newNm == null ? "" : newNm).trim();
  if (!oldNm || !newNm || oldNm === newNm) return prev;
  var pc = prev.custom || {};
  var cur = Array.isArray(pc.materialTags) ? pc.materialTags.slice() : [];
  var oi = cur.indexOf(oldNm);
  // マスターに旧名がある時だけ配列を更新。孤児（記録だけに残った旧名＝マスター削除済みだが過去日に選択が残存）は下のchartsカスケードで改名/統合する（_elSignalRenameDataと同型＝カスケードは無条件）。oi<0で早期returnすると孤児チップの✎改名が無反応になる。
  if (oi >= 0) { if (cur.indexOf(newNm) >= 0) cur.splice(oi, 1); else cur[oi] = newNm; }
  var charts = prev.charts || {}, nch = null;
  Object.keys(charts).forEach(function(k) {
    var c = charts[k];
    if (!c || !Array.isArray(c.dayMaterialTags) || c.dayMaterialTags.indexOf(oldNm) < 0) return;
    var nt = [];
    c.dayMaterialTags.forEach(function(x) { var y = (x === oldNm) ? newNm : x; if (nt.indexOf(y) < 0) nt.push(y); });
    if (!nch) nch = Object.assign({}, charts);
    nch[k] = Object.assign({}, c, { dayMaterialTags: nt });
  });
  return Object.assign({}, prev, { custom: Object.assign({}, pc, { materialTags: cur }), charts: nch || charts });
}
// 日×銘柄の帯解決（単一源）。返り値 {idx, src:"manual"|"auto"|null, prevClose, material, bounds}。idx=null＝帯不明。手動値は境界縮小後も範囲内へ丸める。
function _pbDayBandOf(data, stock, date) {
  var custom = (data && data.custom) || {};
  var bounds = _pbBoundsOf(custom);
  var c = ((data && data.charts) || {})[stock + "_" + date] || {};
  var material = !!c.dayMaterial;
  var materialTags = Array.isArray(c.dayMaterialTags) ? c.dayMaterialTags : [];
  var mv = c.dayPriceBand;
  var manual = (mv != null && mv !== "" && !isNaN(Number(mv))) ? Math.max(0, Math.min(bounds.length, Math.round(Number(mv)))) : null;
  if (manual != null) return { idx: manual, src: "manual", prevClose: null, material: material, materialTags: materialTags, bounds: bounds };
  var pc = _pbPrevClose(data, stock, date);
  if (pc != null) return { idx: _pbBandIdx(pc, bounds), src: "auto", prevClose: pc, material: material, materialTags: materialTags, bounds: bounds };
  return { idx: null, src: null, prevClose: null, material: material, materialTags: materialTags, bounds: bounds };
}
function _pbDayBandSet(save, stock, date, idx) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    charts[ck] = Object.assign({}, charts[ck] || {}, { dayPriceBand: (idx == null ? null : idx) });
    return Object.assign({}, prev, { charts: charts });
  });
}
function _pbDayMaterialSet(save, stock, date, on) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    charts[ck] = Object.assign({}, charts[ck] || {}, { dayMaterial: !!on });
    return Object.assign({}, prev, { charts: charts });
  });
}
// 本日の取引銘柄（per-day 2026-07-22d）: その日に「実際に取引した1銘柄」を指定＝data.dailyStock[日付]（候補プール=custom.rotatingStocks）。trades/foreignMarketsと同じ日付キーのtop-levelマップ＝汎用マージで同期。
// 指定銘柄＝合計＋分析に算入。候補で未指定の記録＝データのみ（合計除外・分析は残す）。固定銘柄は従来通り。
function _dailyStockGet(data, date) { var m = (data && data.dailyStock) || {}; return (date && m[date]) || ""; }
function _dailyStockSet(save, date, stock) {
  save(function(prev) {
    var m = Object.assign({}, prev.dailyStock || {});
    if (stock) m[date] = stock; else delete m[date];
    return Object.assign({}, prev, { dailyStock: m });
  });
}
// EPナビの日替わり列の「表示銘柄」（端末ローカル・per-date 2026-07-22i）: dailyStock（合計算入の指定）とは別で、EPナビでどの候補のEPを計算・早見するかの表示選択だけ。既定は指定銘柄。Firebase同期しない＝localStorage（ユーザー決定＝▽は表示切替のみ・指定は変えない）。
var _EPN_ROT_LS = "scalping_epn_rot_v1";
function _epnRotGet(date) { try { var m = JSON.parse(localStorage.getItem(_EPN_ROT_LS) || "{}"); return (date && m[date]) || ""; } catch (_e) { return ""; } }
function _epnRotSet(date, stock) { try { var m = JSON.parse(localStorage.getItem(_EPN_ROT_LS) || "{}"); if (stock) m[date] = stock; else delete m[date]; localStorage.setItem(_EPN_ROT_LS, JSON.stringify(m)); } catch (_e) {} }
// ===== 株価帯の推奨α（第2弾 2026-07-22f）=====
// _pbBandPoolFor: 指定した株価帯idxと同じ帯だった全記録（銘柄横断・beforeDateより前・データ算入・v2・材料日は帯から除外）。各(stock,date)の帯は_pbDayBandOfで動的判定（手動＞前日終値）。chartsごとに(bandIdx,before)キーでメモ化。
var _pbBandPoolCache = { charts: null, bsig: null, out: {} };
function _pbBandPoolFor(data, bandIdx, beforeDate) {
  if (bandIdx == null) return [];
  var charts = (data && data.charts) || null;
  var _bsig = _pbBoundsOf((data && data.custom) || {}).join(",");   // 境界(priceBandBounds)はchartsに含まれない＝境界だけ変えた時のstale回避（敵対レビューBUG1修正 2026-07-22f）
  if (_pbBandPoolCache.charts !== charts || _pbBandPoolCache.bsig !== _bsig) _pbBandPoolCache = { charts: charts, bsig: _bsig, out: {} };
  var _k = bandIdx + "|" + (beforeDate || "");
  if (Object.prototype.hasOwnProperty.call(_pbBandPoolCache.out, _k)) return _pbBandPoolCache.out[_k];
  var out = [];
  _elCollectAllSignals(data).forEach(function(r) {
    if (!r || !r.signal || !r.date || !_epIsV2(r.signal) || !_elInclData(r.signal)) return;
    if (beforeDate && r.date >= beforeDate) return;
    var bi = _pbDayBandOf(data, r.stock, r.date);
    if (bi.material || bi.idx !== bandIdx) return;
    out.push(r);
  });
  _pbBandPoolCache.out[_k] = out;
  return out;
}
// _pbBandBizDays（頻度の分母 2026-07-22f・ユーザー定義）: プールの各銘柄について、プールの日付範囲[min,max]の営業日のうち「その銘柄がその帯だった日数」を合計＝(銘柄×営業日)セル数。祝日はholiSetで除外。「その株価帯であった営業日の中で（EP到達が）何日に1回か」の分母。
function _pbBandBizDays(data, bandIdx, pool, holiSet) {
  if (bandIdx == null || !pool || !pool.length) return 0;
  var minD = null, maxD = null, stocks = {};
  pool.forEach(function(r) { if (!r || !r.date) return; if (minD == null || r.date < minD) minD = r.date; if (maxD == null || r.date > maxD) maxD = r.date; if (r.stock) stocks[r.stock] = 1; });
  if (minD == null) return 0;
  var _p2 = function(n) { return ("0" + n).slice(-2); };
  var total = 0;
  Object.keys(stocks).forEach(function(stk) {
    var cur = new Date(minD + "T00:00:00"), end = new Date(maxD + "T00:00:00");
    while (cur <= end) {
      var ds = cur.getFullYear() + "-" + _p2(cur.getMonth() + 1) + "-" + _p2(cur.getDate());
      if (_fmIsBizDay(ds, holiSet)) { var bi = _pbDayBandOf(data, stk, ds); if (!bi.material && bi.idx === bandIdx) total++; }
      cur.setDate(cur.getDate() + 1);
    }
  });
  return total;
}
// 「本日の株価帯」バー（DayView銘柄タブ直下 2026-07-22・A1案・2026-07-22b縦2段化）: 上段=帯チップ＋判定根拠（自動=前日終値[早見表と同一のdayClose]/手動/未設定）、下段=固有材料〇×＋材料タグ選択。
// チップタップ=手動選択（保存）・選択中の手動チップ再タップ or ↺=自動判定へ戻す（dayPriceBand=null）。固有材料〇（dayMaterial=true）のとき材料タグ一覧（_EpnChipMgr＝選択＋追加/改名/削除/ドラッグ並替）を出す。
function _PbDayBandBar(_p) {
  var data = _p.data, save = _p.save, stock = _p.stock, date = _p.date;
  if (!stock || !date) return null;
  var info = _pbDayBandOf(data, stock, date);
  var bounds = info.bounds;
  var chips = [];
  for (var i = 0; i <= bounds.length; i++) chips.push(i);
  var srcNote = info.src === "auto" ? ("自動: 前日終値 " + Number(info.prevClose).toLocaleString() + "円")
    : info.src === "manual" ? "手動選択" : "未設定（前日終値なし・タップで選択）";
  var _rowSty = { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" };
  // 固有材料タグのマスター（custom.materialTags）＆選択（charts[ck].dayMaterialTags）ハンドラ
  var matMaster = (data.custom && Array.isArray(data.custom.materialTags)) ? data.custom.materialTags : [];
  var _matAdd = function(nm) { save(function(prev) { var pc = prev.custom || {}; var cur = Array.isArray(pc.materialTags) ? pc.materialTags : []; if (cur.indexOf(nm) >= 0) return prev; return Object.assign({}, prev, { custom: Object.assign({}, pc, { materialTags: cur.concat([nm]) }) }); }); };
  var _matDelete = function(nm) { save(function(prev) { var pc = prev.custom || {}; var cur = Array.isArray(pc.materialTags) ? pc.materialTags : []; return Object.assign({}, prev, { custom: Object.assign({}, pc, { materialTags: cur.filter(function(x) { return x !== nm; }) }) }); }); };
  var _matReorder = function(list) { save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { materialTags: list.slice() }) }); }); };
  var _matRename = function(o, n) { save(function(prev) { return _matRenameData(prev, o, n); }); };
  var _matToggle = function(nm) { save(function(prev) { var charts = Object.assign({}, prev.charts || {}); var ck = stock + "_" + date; var c = charts[ck] || {}; var cur = Array.isArray(c.dayMaterialTags) ? c.dayMaterialTags : []; var nt = cur.indexOf(nm) >= 0 ? cur.filter(function(x) { return x !== nm; }) : cur.concat([nm]); charts[ck] = Object.assign({}, c, { dayMaterialTags: nt }); return Object.assign({}, prev, { charts: charts }); }); };
  return React.createElement("div", { style: { background: "#fff", border: "1px solid #ECE7DE", borderRadius: 13, padding: "8px 12px", margin: "10px 0", boxShadow: "0 1px 2px rgba(0,0,0,.03)", display: "flex", flexDirection: "column", gap: 8 } },
    // 上段: 本日の株価帯
    React.createElement("div", { style: _rowSty },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0369A1", whiteSpace: "nowrap" } }, "💴 本日の株価帯"),
      chips.map(function(bi) {
        var on = info.idx === bi;
        var manual = on && info.src === "manual";
        return React.createElement("button", {
          key: bi,
          onClick: function() { if (manual) { _pbDayBandSet(save, stock, date, null); } else { _pbDayBandSet(save, stock, date, bi); } },
          title: manual ? "再タップで自動判定（前日終値）に戻す" : "タップで手動選択（この日のこの銘柄に保存）",
          style: { padding: "4px 11px", fontSize: 11, fontWeight: 700, borderRadius: 13, cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid " + (on ? "#0369A1" : "#E0DAD1"),
            background: on ? (manual ? "#0369A1" : "#E0F2FE") : "#fff",
            color: on ? (manual ? "#fff" : "#0369A1") : "#6B6459", minHeight: IS_TOUCH ? 34 : 26 }
        }, _pbBandLabel(bi, bounds));
      }),
      info.src === "manual" ? React.createElement("button", {
        onClick: function() { _pbDayBandSet(save, stock, date, null); },
        title: "手動選択を解除して自動判定（前日終値）に戻す",
        style: { padding: "4px 9px", fontSize: 11, fontWeight: 700, borderRadius: 13, cursor: "pointer", whiteSpace: "nowrap", border: "1px solid #BAE6FD", background: "#F0F9FF", color: "#0369A1", minHeight: IS_TOUCH ? 34 : 26 }
      }, "↺ 自動") : null,
      React.createElement("span", { style: { fontSize: 9.5, color: "#94A3B8", whiteSpace: "nowrap" } }, srcNote)
    ),
    // 下段: 固有材料〇×
    React.createElement("div", { style: { borderTop: "1px dashed #EFE9DF", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 } },
      React.createElement("div", { style: _rowSty },
        React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#B45309", whiteSpace: "nowrap" } }, "⚡ 固有材料"),
        React.createElement("div", { style: { display: "flex", gap: 4 } },
          [["yes", "〇", true], ["no", "×", false]].map(function(kv) {
            var on = info.material === kv[2];
            return React.createElement("button", {
              key: kv[0],
              onClick: function() { _pbDayMaterialSet(save, stock, date, kv[2]); },
              title: kv[2] ? "前日大引け後に固有の材料が出た日（〇）" : "固有材料なし（×・既定）",
              style: { padding: "4px 15px", fontSize: 12, fontWeight: 700, borderRadius: 13, cursor: "pointer", whiteSpace: "nowrap",
                border: "1px solid " + (on ? (kv[2] ? "#F59E0B" : "#94A3B8") : "#E0DAD1"),
                background: on ? (kv[2] ? "#FEF3C7" : "#F1F5F9") : "#fff",
                color: on ? (kv[2] ? "#B45309" : "#475569") : "#C4BDB2", minHeight: IS_TOUCH ? 34 : 26 }
            }, kv[1]);
          })),
        React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", whiteSpace: "nowrap" } }, "前日大引け後に固有の材料が出た日")
      ),
      info.material ? React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 9.5, color: "#94A3B8", marginBottom: 4 } }, "材料タグ（タップで選択・「✎編集」で改名/削除・ドラッグで並替。「＋追加」で新規）"),
        React.createElement(_EpnChipMgr, {
          items: matMaster,
          selected: info.materialTags,
          accent: { b: "#F59E0B", bg: "#FEF3C7", c: "#B45309" },
          addPh: "材料タグ名",
          onToggle: _matToggle, onAdd: _matAdd, onRename: _matRename, onDelete: _matDelete, onReorder: _matReorder
        })) : null
    ),
    React.createElement(_PbDayBandReco, { data: data, save: save, stock: stock, date: date, info: info })
  );
}
// 本日の推奨α（株価帯）＝固有材料の下（第2弾 2026-07-22f）: その銘柄の本日の株価帯と同じ帯だった全記録（銘柄横断・前日まで・データ算入）から推奨基本α/応用αを算出＋頻度（帯営業日/EP到達日で「N日に1回」）＋📊帯別α詳細表ボタン。材料日/帯不明は非表示。
function _PbDayBandReco(_p) {
  var data = _p.data, stock = _p.stock, date = _p.date, info = _p.info;
  var _m = useState(null), modal = _m[0], setModal = _m[1];   // null | "base" | "special"
  var bandIdx = (info && !info.material && info.idx != null) ? info.idx : null;
  var bandLabel = bandIdx != null ? _pbBandLabel(bandIdx, info.bounds) : null;
  var band = useMemo(function() {
    if (!stock || !date || bandIdx == null) return null;
    var aiOf = function(r) { return _elAlphaInfo(r, data); };
    var pool = _pbBandPoolFor(data, bandIdx, date);
    if (!pool.length) return { pool: pool, base: null, sp: null, freq: null, span: 0, ent: 0, n: 0 };
    var holi = _buildHolidayDateSet(data.trades, (data.custom || {}).eventCategories);
    var span = _pbBandBizDays(data, bandIdx, pool, holi);
    var A = _elBaseAlphaA(pool, aiOf, span);   // 頻度分母を帯基準（span）に＝ピル/詳細表/★選定を一致 2026-07-22j
    // EP到達した(銘柄×日)セル数＝分母_pbBandBizDays(銘柄×営業日セル)と単位を合わせる（敵対レビューBUG2修正 2026-07-22f・_elEnteredDaysは日付のみ集約で銘柄横断だと単位不一致だった）
    var _entSeen = {}, ent = 0;
    pool.forEach(function(r) { if (!r || !r.signal || !r.date || !r.stock) return; var a = aiOf(r).alpha; if (a == null) return; var rr = _epResolve(r.signal, a); if (rr && rr.epIdx >= 0 && rr.epIdx <= 2) { var _ek = r.stock + "|" + r.date; if (!_entSeen[_ek]) { _entSeen[_ek] = 1; ent++; } } });
    var fr = (span > 0 && ent > 0) ? span / ent : null;
    return { pool: pool, base: (A && A.pick && A.pick.alpha != null) ? A.pick.alpha : null, sp: (A && A.add && A.add.alpha != null) ? A.add.alpha : null, freq: fr == null ? null : (fr < 10 ? Math.round(fr * 10) / 10 : Math.round(fr)), span: span, ent: ent, n: pool.length };
  }, [data, stock, date, bandIdx]);
  if (bandIdx == null) {
    return React.createElement("div", { style: { borderTop: "1px dashed #EFE9DF", paddingTop: 8 } },
      React.createElement("span", { style: { fontSize: 9.5, color: "#94A3B8" } }, (info && info.material) ? "⚡ 材料あり日＝株価帯の推奨αは対象外（材料日専用）" : "株価帯が未判定のため推奨αは出せません（前日終値なし）"));
  }
  var aiOf = function(r) { return _elAlphaInfo(r, data); };
  var holi = _buildHolidayDateSet(data.trades, (data.custom || {}).eventCategories);
  var _pill = function(lbl, val, color, bd, bg) {
    return React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", background: bg, border: "1px solid " + bd, borderRadius: 8, padding: "3px 12px", minWidth: 54 } },
      React.createElement("span", { style: { fontSize: 8.5, fontWeight: 700, color: color } }, lbl),
      React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: (val == null) ? "#C4BDB2" : color, lineHeight: 1.1 } }, (val == null) ? "—" : (val + "円")));
  };
  var _modalEl = (modal && band) ? React.createElement("div", { onClick: function() { setModal(null); }, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" } },
    React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: "#fff", borderRadius: 10, padding: 14, maxWidth: 760, width: "100%", maxHeight: "88vh", overflowY: "auto" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 } },
        React.createElement("span", { style: { fontSize: 12.5, fontWeight: 800, color: modal === "base" ? "#0369A1" : "#9A3412" } }, (modal === "base" ? "🔬 推奨基本α 詳細（株価帯別）" : "🔬 推奨応用α 詳細（株価帯別）") + "｜" + bandLabel + "・銘柄横断・前日まで"),
        React.createElement("button", { type: "button", onClick: function() { setModal(null); }, style: { fontSize: 12, fontWeight: 700, border: "1px solid #ddd", borderRadius: 6, background: "#f5f4f0", padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap" } }, "閉じる")),
      React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", marginBottom: 6 } }, "同じ株価帯だった全銘柄の記録を合算した分析です（この帯のα共通化の検証）"),
      modal === "base" ? _elBaseAlphaDetailV2(band.pool, aiOf, holi, undefined, undefined, band.span) : _elTotalAlphaSectionV2(band.pool, aiOf, holi, undefined, undefined, band.span))) : null;
  return React.createElement("div", { style: { borderTop: "1px dashed #EFE9DF", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#0369A1", whiteSpace: "nowrap" } }, "🎯 本日の推奨α（帯）"),
      React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", whiteSpace: "nowrap" } }, bandLabel + "・" + band.n + "件"),
      _pill("基本α", band.base, "#0369A1", "#93C5FD", "#EFF6FF"),
      _pill("応用α", band.sp, "#9A3412", "#FDBA74", "#FFF7ED"),
      React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "3px 10px" } },
        React.createElement("span", { style: { fontSize: 8.5, fontWeight: 700, color: "#64748B" } }, "頻度"),
        React.createElement("span", { style: { fontSize: 12.5, fontWeight: 800, color: (band.freq == null) ? "#C4BDB2" : "#0369A1", lineHeight: 1.1, whiteSpace: "nowrap" } }, (band.freq == null) ? "—" : (band.freq + "日に1回"))),
      React.createElement("button", { type: "button", onClick: function() { if (band.n) setModal("base"); }, style: { fontSize: 9.5, fontWeight: 700, color: "#0369A1", background: "#fff", border: "1px solid #93C5FD", borderRadius: 6, padding: "4px 8px", cursor: band.n ? "pointer" : "default", whiteSpace: "nowrap", minHeight: IS_TOUCH ? 28 : 22, opacity: band.n ? 1 : 0.4 } }, "📊 基本α詳細"),
      React.createElement("button", { type: "button", onClick: function() { if (band.n) setModal("special"); }, style: { fontSize: 9.5, fontWeight: 700, color: "#9A3412", background: "#fff", border: "1px solid #FDBA74", borderRadius: 6, padding: "4px 8px", cursor: band.n ? "pointer" : "default", whiteSpace: "nowrap", minHeight: IS_TOUCH ? 28 : 22, opacity: band.n ? 1 : 0.4 } }, "📊 応用α詳細")),
    (band.freq != null) ? React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8" } }, "頻度＝この帯だった " + band.span + "（銘柄×営業日）÷ EP到達 " + band.ent + "（銘柄×日）＝同じ帯の銘柄を合算") : (band.n ? React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8" } }, "EP到達日が無いため頻度は—") : React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8" } }, "この帯の前日までの記録がまだありません")),
    _modalEl);
}
// 「本日の採用α値」欄（基本α＋応用α・案B横並び2カラム 2026-07-13 task3）: 銘柄別記録テーブル/取引テーブルの推奨α欄に置く。母数＝この銘柄の「開いている日付の前日まで全期間」（詳細データ表・EPナビ・記録フォームと同じ）。
// 各カラム＝入力＋▲▼＋「表を参照」（詳細データ表をポップアップし行タップで取込）。基本α＝charts.epNaviDayAlpha（EPナビと共有）／応用α＝charts.epNaviDaySpecialAlpha。
function _ElDayAlphaPair(_p) {
  var data = _p.data, save = _p.save, date = _p.date, stock = _p.stock, stacked = _p.stacked;   // stacked=true＝縦積み（EPナビの狭い列用）2026-07-13
  var _m = useState(null), modal = _m[0], setModal = _m[1];   // null | "base" | "special"
  var _ts = useState("band"), tblScope = _ts[0], setTblScope = _ts[1];   // 表を参照の母数: "band"=株価帯別（既定・この銘柄の本日の帯と同じ帯だった全記録）/"stock"=銘柄別。帯不明/材料日は銘柄別へフォールバック 2026-07-22i
  var recs = useMemo(function() {
    if (!stock) return [];
    return _elStockRecsBefore(data, stock, date);
  }, [data, stock, date]);
  var _A = useMemo(function() { return recs.length ? _elBaseAlphaA(recs, function(r) { return _elAlphaInfo(r, data); }) : null; }, [recs, data]);
  var baseReco = (_A && _A.pick && _A.pick.alpha != null) ? _A.pick.alpha : null;
  var spReco = (_A && _A.add && _A.add.alpha != null) ? _A.add.alpha : null;
  var baseStored = _epnDayAlphaGet(data, stock, date);
  var spStored = _epnDaySpecialAlphaGet(data, stock, date);
  var _bs = useState(baseStored != null ? String(baseStored) : ""), bVal = _bs[0], setBVal = _bs[1];
  var _ss = useState(spStored != null ? String(spStored) : ""), sVal = _ss[0], setSVal = _ss[1];
  useEffect(function() { setBVal(baseStored != null ? String(baseStored) : ""); }, [baseStored, stock, date]);
  useEffect(function() { setSVal(spStored != null ? String(spStored) : ""); }, [spStored, stock, date]);
  var _bRef = useRef(bVal); _bRef.current = bVal;
  var _sRef = useRef(sVal); _sRef.current = sVal;
  var _bStRef = useRef(baseStored); _bStRef.current = baseStored;
  var _sStRef = useRef(spStored); _sStRef.current = spStored;
  var _bRcRef = useRef(baseReco); _bRcRef.current = baseReco;
  var _sRcRef = useRef(spReco); _sRcRef.current = spReco;
  var _step = function(isBase, delta) {
    var cur = isBase ? _bRef.current : _sRef.current;
    var st = isBase ? _bStRef.current : _sStRef.current, rc = isBase ? _bRcRef.current : _sRcRef.current;
    var b = (cur !== "" && !isNaN(Number(cur))) ? Number(cur) : (st != null ? st : (rc != null ? rc : 0));
    var n = b + delta; if (n > 50) n = 50; if (n < 0) n = 0;
    (isBase ? setBVal : setSVal)(String(n));
    if (n !== st) (isBase ? _epnDayAlphaSet : _epnDaySpecialAlphaSet)(save, stock, date, n);
  };
  var _col = function(isBase, val, setVal, stored, reco, color, bd, lbl) {
    return React.createElement("div", { style: { flex: "1 1 0", minWidth: 0, background: "#fff", border: "1px solid " + bd, borderRadius: 7, padding: "5px 7px" } },
      React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: color, marginBottom: 3 } }, lbl),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" } },
        React.createElement("input", { type: "text", inputMode: "numeric", value: val, placeholder: reco != null ? String(reco) : "—",
          onChange: function(ev) { var v = _toHankakuNum(ev.target.value); if (v === "" || !isNaN(Number(v))) setVal(v); },
          onBlur: function() { if (val === "" || isNaN(Number(val))) { if (stored != null) (isBase ? _epnDayAlphaSet : _epnDaySpecialAlphaSet)(save, stock, date, null); return; } var n = Math.max(0, Math.min(50, Number(val))); if (n !== stored) (isBase ? _epnDayAlphaSet : _epnDaySpecialAlphaSet)(save, stock, date, n); },
          style: { width: 40, padding: "2px 4px", fontSize: 14, fontWeight: 700, color: color, border: "1px solid " + bd, borderRadius: 5, textAlign: "right", boxSizing: "border-box", outline: "none" } }),
        React.createElement("span", { style: { fontSize: 9, color: "#64748B" } }, "円"),
        _stepBtn((function(_ib) { return function() { _step(_ib, 1); }; })(isBase), (function(_ib) { return function() { _step(_ib, -1); }; })(isBase))),
      React.createElement("button", { type: "button", onClick: (function(_ib) { return function() { setModal(_ib ? "base" : "special"); }; })(isBase), style: { marginTop: 4, fontSize: 9, fontWeight: 700, color: color, background: "#fff", border: "1px solid " + bd, borderRadius: 5, padding: "2px 6px", cursor: "pointer", whiteSpace: "nowrap", minHeight: IS_TOUCH ? 24 : 18 } }, "表を参照"),
      React.createElement("div", { style: { fontSize: 8, color: "#94A3B8", marginTop: 2, whiteSpace: "nowrap" } }, reco != null ? ("推奨 " + reco + "円（銘柄別）") : "推奨データ無し"));   // 銘柄別プールの推奨（帯の推奨は「表を参照」の株価帯別または_PbDayBandReco）＝混同回避 2026-07-22i
  };
  var _modalEl = modal ? (function() {
    var aiOf = function(r) { return _elAlphaInfo(r, data); };
    var _hs = _buildHolidayDateSet(data.trades, (data.custom || {}).eventCategories);
    var isBase = modal === "base";
    var curEff = isBase ? (baseStored != null ? baseStored : baseReco) : (spStored != null ? spStored : spReco);
    // 株価帯別トグル（2026-07-22i・ユーザー要望）: 既定=株価帯別＝この銘柄の本日の株価帯と同じ帯だった全記録（銘柄横断・前日まで・データ算入）。帯不明/材料日は帯プール無し→銘柄別へフォールバック。取込先は常にこの銘柄の本日採用α値。
    var _bandInfo = _pbDayBandOf(data, stock, date);
    var _bandIdx = (_bandInfo && !_bandInfo.material && _bandInfo.idx != null) ? _bandInfo.idx : null;
    var _bandPool = _bandIdx != null ? _pbBandPoolFor(data, _bandIdx, date) : [];
    var _bandOk = _bandPool.length > 0;
    var _useBand = (tblScope === "band") && _bandOk;
    var _pool = _useBand ? _bandPool : recs;
    var _bandSpan = _useBand ? _pbBandBizDays(data, _bandIdx, _bandPool, _hs) : undefined;   // 帯選択時は頻度分母を帯基準に＝_PbDayBandReco/記録帳帯パネルと一致（銘柄別時はundefined＝記録スパン）2026-07-22j
    var _bandLbl = _bandIdx != null ? _pbBandLabel(_bandIdx, _bandInfo.bounds) : null;
    var _scopeBtn = function(k, lbl, dis) {
      var on = (k === "band") ? _useBand : !_useBand;
      return React.createElement("button", { type: "button", disabled: dis, onClick: function() { if (!dis) setTblScope(k); },
        style: { padding: "3px 11px", fontSize: 10.5, fontWeight: 700, borderRadius: 12, cursor: dis ? "default" : "pointer", whiteSpace: "nowrap", opacity: dis ? 0.4 : 1, minHeight: IS_TOUCH ? 28 : 22,
          border: "1px solid " + (on ? "#0369A1" : "#E0DAD1"), background: on ? "#0369A1" : "#fff", color: on ? "#fff" : "#6B6459" } }, lbl);
    };
    return React.createElement("div", { onClick: function() { setModal(null); }, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" } },
      React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: "#fff", borderRadius: 10, padding: 14, maxWidth: 760, width: "100%", maxHeight: "88vh", overflowY: "auto" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 } },
          React.createElement("span", { style: { fontSize: 12.5, fontWeight: 800, color: isBase ? "#0369A1" : "#9A3412" } }, isBase ? "🔬 推奨基本α 詳細データ" : "🔬 推奨応用α 詳細データ"),
          React.createElement("button", { type: "button", onClick: function() { setModal(null); }, style: { fontSize: 12, fontWeight: 700, border: "1px solid #ddd", borderRadius: 6, background: "#f5f4f0", padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap" } }, "閉じる")),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, color: "#64748B", whiteSpace: "nowrap" } }, "母数:"),
          _scopeBtn("band", "💴 株価帯別" + (_bandLbl ? "（" + _bandLbl + "）" : ""), !_bandOk),
          _scopeBtn("stock", "🏷 銘柄別（" + stock + "）", false),
          React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8" } }, _useBand ? ("同じ帯だった全銘柄・前日まで・" + _pool.length + "件") : (tblScope === "band" && !_bandOk ? (_bandIdx == null ? "この日は株価帯が未判定/材料日のため銘柄別で表示" : ("株価帯" + (_bandLbl || "") + "の前日までの記録が0件のため銘柄別で表示")) : (stock + "・前日まで全期間")))),
        React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", marginBottom: 6 } }, "行をタップすると本日の採用" + (isBase ? "基本α" : "応用α") + "値に取り込みます"),
        isBase
          ? _elBaseAlphaDetailV2(_pool, aiOf, _hs, function(av) { _epnDayAlphaSet(save, stock, date, av); setModal(null); }, curEff, _bandSpan)
          : _elTotalAlphaSectionV2(_pool, aiOf, _hs, function(av) { _epnDaySpecialAlphaSet(save, stock, date, av); setModal(null); }, curEff, _bandSpan)));
  })() : null;
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#334155", marginBottom: 3 } }, "本日の採用α値（この銘柄・前日まで基準）"),
    React.createElement("div", { style: { display: "flex", flexDirection: stacked ? "column" : "row", gap: 6 } },
      _col(true, bVal, setBVal, baseStored, baseReco, "#0369A1", "#93C5FD", "基本α"),
      _col(false, sVal, setSVal, spStored, spReco, "#9A3412", "#FDBA74", "応用α")),
    _modalEl);
}
// 旧 _EpnDayAlphaField（本日の採用α値の単一版）は _ElDayAlphaPair（基本α＋応用αの2カラム版）へ差し替え済みで未マウント＝死コードのため削除。関連の _tableModal / onOpenTable も死コード化（表参照は _ElDayAlphaPair に集約）2026-07-22j
// 早見のインライン編集（③起点/④その他/⑤ライン併存の変更）用: 新しい詳細から推奨基本αを再導出（ライン併存ルール〇なら1）してepを再計算。
// _EpnCalcForm.autoPick と同じ段階フォールバック（詳細別→シグナル別→銘柄全体・okが無ければ仮値）＝変更時は両方直す。推奨が全く無ければbaseは据え置き。
// 予定EPの正本計算（2026-07-14 共通化・監査finding#1）: base-levelα＝応用〇なら応用α・通常は基本α。予定EP＝round((水準線+base-levelα+浮き足+RN)*100)/100。保存EPを書く全ハンドラはこの2関数経由に統一＝式のズレ・応用α落ち・廃止add項の混入を防ぐ。
function _epnBaseLevelOf(it) { if (it && (it.ukiUsed === true || (Number(it.uki) || 0) > 0)) return 0; return (it && it.specialUsed === true && it.special != null) ? (Number(it.special) || 0) : (Number(it && it.base) || 0); }   // 2026-07-14g 浮き足〇＝土台α無し（採用α＝浮き足加算＋RNのみ）。uki>0でも0＝旧保存カード（ukiUsed無し）も同じ扱い
function _epnComputeEp(level, baseLevel, uki, rn) { return Math.round(((Number(level) || 0) + (Number(baseLevel) || 0) + (Number(uki) || 0) + (Number(rn) || 0)) * 100) / 100; }
// RN加算の自動再判定（早見カード用・2026-07-30 ユーザー指摘「早見で基本α→応用αに切り替えたときもRN加算は自動でやってくれる？」）。
// 早見カードのインライン編集（採用αの切替・基本α/応用α値・③④/ライン併存）はEPを組み直すのに rn を据え置いていたため、
// 切替後の予定EPが…41〜49/…91〜99でもRNが乗らず（逆に対象外になっても乗ったまま）＝計算フォームの自動判定と食い違っていた。
// 判定本体は記録フォーム/計算フォームと同じ単一源 _elRnAutoFrom(app-05)＝RN“前”EP（水準線＋base-levelα＋浮き足加算）で判定＝循環しない。
// it.rnAuto === false（＝カードでRNを手動操作した）だけ据え置き。未設定＝自動（エントリー記録の _migRnAutoOn と同じ扱い）。
// 水準線が無い(≤0)／判定不可(null)は現状維持。変化が無ければ同じ参照を返す＝無駄な保存をしない。
function _epnApplyRnAuto(item) {
  if (!item || item.rnAuto === false) return item;
  var level = Number(item.level) || 0;
  if (!(level > 0)) return item;
  var bl = _epnBaseLevelOf(item), uki = Number(item.uki) || 0;
  var add = (typeof _elRnAutoFrom === "function") ? _elRnAutoFrom(level, bl + uki) : null;
  if (add == null) return item;
  var rn = add > 0 ? add : 0;
  if ((Number(item.rn) || 0) === rn && (item.rnUsed === true) === (rn > 0)) return item;
  return Object.assign({}, item, { rnUsed: rn > 0, rn: rn, ep: _epnComputeEp(level, bl, uki, rn) });
}
function _epnRecalcBase(data, stock, date, item) {
  var _f = Array.isArray(item.f) ? item.f : [];
  var base = Number(item.base) || 0, src = item.src || null;
  var _followReco = !!(data && data.custom && data.custom.epnFollowReco);   // 「詳細で更新」トグル（既定false=固定）2026-07-13
  var _dayA = _epnDayAlphaGet(data, stock, date);   // 本日の採用α値（設定済みなら最優先で固定）
  if (item.lineCoexist === true) { base = 1; src = "ライン併存"; }   // ライン併存ルール（独自欄 2026-07-08g・旧「併存ライン」チップ検知から移行）＝基本α1固定
  else if (_dayA != null) { base = _dayA; src = "本日の採用α値"; }   // 本日の採用α値で固定（詳細変更で動かさない）2026-07-13
  else {
    var casc = _epnCascade(data, stock, item.tag || null, { b: item.b || null, k: item.k || null, f: _f }, date);
    var det = casc && casc.det, sig = casc && casc.sig, stk = casc && casc.stk, band = casc && casc.band;
    // 2026-07-14 共通化: 固定(!_followReco)=stk段のみ／追従=det→sig→stk→帯。仮値含む選定を_elCascadePickへ集約（autoPick/_epnBaseLevelKeyと同一梯子）。全滅時はbase/src据え置き。帯＝第2弾フォールバック 2026-07-22f
    var _bandLeg = { key: "band", label: "株価帯", alpha: band ? band.alpha : null, ok: !!(band && band.ok) };
    var _cp = !_followReco
      ? _elCascadePick([{ key: "stk", label: "銘柄全体", alpha: stk ? stk.alpha : null, ok: !!(stk && stk.ok) }, _bandLeg], true)
      : _elCascadePick([
          { key: "det", label: "詳細別", alpha: det ? det.alpha : null, ok: !!(det && det.ok) },
          { key: "sig", label: "シグナル別", alpha: sig ? sig.alpha : null, ok: !!(sig && sig.ok) },
          { key: "stk", label: "銘柄全体", alpha: stk ? stk.alpha : null, ok: !!(stk && stk.ok) },
          _bandLeg
        ], true);
    if (_cp.alpha != null) { base = _cp.alpha; src = _cp.src; }
  }
  var level = Number(item.level) || 0, uki = Number(item.uki) || 0, rn = Number(item.rn) || 0;   // rn=RN加算（そのまま加算）2026-07-08h
  var special = (item.specialUsed === true && item.special != null) ? Number(item.special) : null;
  var baseLevel = (special != null) ? special : base;   // base-levelα＝応用〇なら応用α、通常は再導出した基本α（2026-07-13応用α化）
  var ep = _epnComputeEp(level, baseLevel, uki, rn);
  return Object.assign({}, item, { base: base, src: src, ep: ep });
}
// 推奨応用α（EPナビ用・_EpnCalcFormと早見カードで共有 2026-07-08f→2026-07-13応用α化）: cascadeの採用段（詳細別ok→シグナル別ok→銘柄全体ok→各仮値の順＝autoPick.keyと同一導出）の記録を母数に、
// 応用〇・浮き足/RN除外・根拠一致で絞って _elSpecialAlphaPick で推奨応用α（独立α値）を出す。計算欄とカードで同一ロジック＝変更時は両方に効く。
function _epnBaseLevelKey(casc) {
  var det = casc && casc.det, sig = casc && casc.sig, stk = casc && casc.stk, band = casc && casc.band;
  return _elCascadePick([   // 2026-07-14 共通化: autoPick/_autoBaseと同一梯子。帯＝第2弾フォールバック 2026-07-22f
    { key: "det", label: "詳細別", alpha: det ? det.alpha : null, ok: !!(det && det.ok) },
    { key: "sig", label: "シグナル別", alpha: sig ? sig.alpha : null, ok: !!(sig && sig.ok) },
    { key: "stk", label: "銘柄全体", alpha: stk ? stk.alpha : null, ok: !!(stk && stk.ok) },
    { key: "band", label: "株価帯", alpha: band ? band.alpha : null, ok: !!(band && band.ok) }
  ], true).key;
}
function _epnSpecialRecoFrom(casc, reasons) {
  if (!casc) return null;
  // 応用αの母数は銘柄全体（全応用〇・浮き足〇/RN〇除外）。根拠別はその中を根拠で絞り、プール件数（その根拠の応用〇記録数・EP到達/判定は問わない＝画面のn=）が下限_elSpecialMinDecidedCur以上のときだけ「根拠別」を採用＝未満は銘柄全体へフォールバック（ユーザー方針 2026-07-13・E成立でなくプール件数で判定）。
  var allSp = (casc.all || []).filter(_elIsSpecialAlphaPoolRec);
  if (!allSp.length) return null;
  var key = _epnBaseLevelKey(casc);
  var _bp = key === "det" ? casc.det : (key === "sig" ? casc.sig : (key === "band" ? casc.band : casc.stk));   // 採用した基本α段の理想＝応用αを基本αより大きくクランプ 2026-07-13。帯段も対応 2026-07-22f
  var _minIdeal = (_bp && _bp.idealAlpha != null) ? _bp.idealAlpha : ((_bp && _bp.alpha != null) ? _bp.alpha : null);
  var rs = reasons || [];
  var _floor = (typeof _elSpecialMinDecidedCur === "number") ? _elSpecialMinDecidedCur : (typeof _EL_SPECIAL_MIN_DECIDED_DEF === "number" ? _EL_SPECIAL_MIN_DECIDED_DEF : 15);
  if (rs.length) {
    var poolR = allSp.filter(function(r) { var rr = _epnReasonsOf(r.signal); for (var i = 0; i < rs.length; i++) { if (rr.indexOf(rs[i]) >= 0) return true; } return false; });
    if (poolR.length >= _floor) {   // プール件数（その根拠の応用〇記録数）で判定 2026-07-13
      var recoR = _elSpecialAlphaPick(poolR, casc.aiOf, _minIdeal);
      if (recoR && recoR.alpha != null && recoR.status !== "none") {
        return { v: recoR.alpha, v2: recoR.alpha2, n: poolR.length, decided: recoR.decided || 0, byReason: true, fellBack: false };   // 根拠別を採用（プール件数≥下限）
      }
    }
  }
  var reco = _elSpecialAlphaPick(allSp, casc.aiOf, _minIdeal);   // 銘柄全体（根拠不問）フォールバック
  if (reco && reco.alpha != null && reco.status !== "none") return { v: reco.alpha, v2: reco.alpha2, n: allSp.length, decided: reco.decided || 0, byReason: false, fellBack: rs.length > 0 };
  return (reco && reco.status === "nomin") ? { nomin: true, n: allSp.length } : null;   // 全条件を満たす応用αが無い＝条件適合無し 2026-07-14e
}
function _epnSpecialReco(data, stock, date, tag, sel, reasons) {
  if (!stock) return null;
  return _epnSpecialRecoFrom(_epnCascade(data, stock, tag || null, sel, date), reasons);
}
// 追加α根拠マスター（custom.specialReasons）の純データ変換（_EpnCalcFormと早見カードで共有 2026-07-08f）。改名は過去記録（charts.signals）＋保存EP（charts.epNavi.reasons）も一括追従＝既存名への改名は中断。
function _rsnMaster(prev) { return (prev.custom && Array.isArray(prev.custom.specialReasons)) ? prev.custom.specialReasons : _DEF_SPECIAL_REASONS.slice(); }
function _rsnSetMaster(prev, arr) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { specialReasons: arr }) }); }
function _rsnAddData(prev, nm) { var cur = _rsnMaster(prev); if (cur.indexOf(nm) >= 0) return prev; return _rsnSetMaster(prev, cur.concat([nm])); }
function _rsnDeleteData(prev, nm) { return _rsnSetMaster(prev, _rsnMaster(prev).filter(function(x) { return x !== nm; })); }
function _rsnReorderData(prev, list) { return _rsnSetMaster(prev, list.slice()); }
function _rsnRenameData(prev, oldNm, newNm) {
  var cur = _rsnMaster(prev);
  if (cur.indexOf(newNm) >= 0) return prev;
  var charts = prev.charts || {}, newCharts = {};
  Object.keys(charts).forEach(function(ck) {
    var c = charts[ck]; if (!c) { newCharts[ck] = c; return; }
    var nc = c, changed = false;
    if (Array.isArray(c.signals)) {
      var sChanged = false;
      var sigs = c.signals.map(function(s) {
        if (!s) return s; var ns = s, hit = false;
        if (Array.isArray(s.specialReasons) && s.specialReasons.indexOf(oldNm) >= 0) { ns = Object.assign({}, ns, { specialReasons: s.specialReasons.map(function(x) { return x === oldNm ? newNm : x; }).filter(function(x, i, a) { return x && a.indexOf(x) === i; }) }); hit = true; }
        if (s.addAlphaReason === oldNm) { ns = Object.assign({}, ns, { addAlphaReason: newNm }); hit = true; }
        if (hit) sChanged = true; return ns;
      });
      if (sChanged) { nc = Object.assign({}, nc, { signals: sigs }); changed = true; }
    }
    if (Array.isArray(c.epNavi)) {
      var eChanged = false;
      var eps = c.epNavi.map(function(x) {
        if (x && Array.isArray(x.reasons) && x.reasons.indexOf(oldNm) >= 0) { eChanged = true; return Object.assign({}, x, { reasons: x.reasons.map(function(y) { return y === oldNm ? newNm : y; }).filter(function(y, i, a) { return y && a.indexOf(y) === i; }) }); }
        return x;
      });
      if (eChanged) { nc = Object.assign({}, nc, { epNavi: eps }); changed = true; }
    }
    newCharts[ck] = changed ? nc : c;
  });
  return Object.assign({}, _rsnSetMaster(prev, cur.map(function(x) { return x === oldNm ? newNm : x; })), { charts: newCharts });
}
// ===== EPナビ用チップ管理（選択＋追加/改名/削除/ドラッグ並び替え）=====
// items=マスター配列（並び替え/改名/削除の対象）。orphans=マスター外だが選択肢に出す（記録由来など・編集不可）。selected=選択中の名前配列。
// 記録フォームのシグナル詳細チップと同方式（setPointerCaptureはドラッグ開始まで遅延＝タップ選択とドラッグの両立 2026-07-06g）。
function _EpnChipMgr(_p) {
  var items = _p.items || [];
  var orphans = _p.orphans || [];
  var selected = _p.selected || [];
  var acc = _p.accent || { b: "#D97706", bg: "#FEF3C7", c: "#92400E" };
  var countOf = _p.countOf;
  var _s1 = useState(false), _s1a = _slicedToArray(_s1, 2), edit = _s1a[0], setEdit = _s1a[1];
  var _s2 = useState(false), _s2a = _slicedToArray(_s2, 2), addOpen = _s2a[0], setAddOpen = _s2a[1];
  var _s3 = useState(null), _s3a = _slicedToArray(_s3, 2), renOld = _s3a[0], setRenOld = _s3a[1];
  var _s4 = useState(null), _s4a = _slicedToArray(_s4, 2), ord = _s4a[0], setOrd = _s4a[1];
  var _s5 = useState(""), _s5a = _slicedToArray(_s5, 2), inpVal = _s5a[0], setInpVal = _s5a[1];
  var valRef = useRef(""), dragRef = useRef(null), movedRef = useRef(false);
  var master = ord || items;
  var display = master.slice();
  orphans.forEach(function(x) { if (display.indexOf(x) < 0) display.push(x); });
  selected.forEach(function(x) { if (display.indexOf(x) < 0) display.push(x); });
  var _commit = function() {
    var nm = (valRef.current || "").trim();
    if (!nm) { setAddOpen(false); setRenOld(null); return; }
    if (renOld != null) { if (nm !== renOld && _p.onRename) _p.onRename(renOld, nm); setRenOld(null); }
    else { if (_p.onAdd) _p.onAdd(nm); setAddOpen(false); }
    valRef.current = ""; setInpVal("");
  };
  return React.createElement("div", null,
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" } },
      display.map(function(nm) {
        var on = selected.indexOf(nm) >= 0;
        var isOrphan = master.indexOf(nm) < 0;
        var d = dragRef.current;
        var dragging = !!(d && d.started && d.name === nm);
        return React.createElement("span", { key: nm, "data-epnchip": nm,
          onPointerDown: isOrphan ? null : function(e) { dragRef.current = { name: nm, sx: e.clientX, sy: e.clientY, started: false, list: null }; },
          onPointerMove: function(e) {
            var d = dragRef.current; if (!d || d.name !== nm) return;
            if (!d.started) {
              if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 7) return;
              d.started = true;
              try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_e0) {}
              d.list = master.slice(); movedRef.current = true; setOrd(d.list.slice()); return;
            }
            var el = document.elementFromPoint(e.clientX, e.clientY);
            var chip = (el && el.closest) ? el.closest("[data-epnchip]") : null;
            if (!chip) return;
            var over = chip.getAttribute("data-epnchip");
            if (!over || over === d.name) return;
            var lst = d.list.slice(), fi = lst.indexOf(d.name), ti = lst.indexOf(over);
            if (fi < 0 || ti < 0 || fi === ti) return;
            lst.splice(fi, 1); lst.splice(ti, 0, d.name); d.list = lst; setOrd(lst.slice());
          },
          onPointerUp: function() { var d = dragRef.current; dragRef.current = null; if (d && d.started && d.list) { var fin = d.list.slice(); if (_p.onReorder) _p.onReorder(fin); setTimeout(function() { movedRef.current = false; }, 0); } setOrd(null); },
          onPointerCancel: function() { dragRef.current = null; movedRef.current = false; setOrd(null); },
          style: { display: "inline-flex", alignItems: "center", gap: 1, touchAction: "none", boxShadow: dragging ? "0 2px 8px rgba(0,0,0,0.3)" : null, transform: dragging ? "scale(1.06)" : null, opacity: dragging ? 0.9 : null } },
          React.createElement("button", { type: "button",
            onClick: function() { if (movedRef.current) { movedRef.current = false; return; } if (_p.onToggle) _p.onToggle(nm); },
            style: { padding: "4px 9px", fontSize: 11, fontWeight: 600, border: on ? ("1.5px solid " + acc.b) : "1px solid #ddd", background: on ? acc.bg : "#fff", color: on ? acc.c : "#777", borderRadius: 6, cursor: "pointer" } },
            nm, (countOf && !isOrphan) ? React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", marginLeft: 3 } }, "(" + countOf(nm) + ")") : null),
          edit ? React.createElement(React.Fragment, null,
            React.createElement("button", { type: "button", title: isOrphan ? "改名（記録だけに残った旧名。既存の候補名にすると統合されます）" : "名前を変更（過去の記録も追従）", onClick: function() { if (movedRef.current) { movedRef.current = false; return; } valRef.current = nm; setInpVal(nm); setAddOpen(false); setRenOld(nm); }, style: { padding: "1px 5px", fontSize: 11, fontWeight: 800, border: "1px solid #93C5FD", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, cursor: "pointer" } }, "✎"),
            (!isOrphan) ? React.createElement("button", { type: "button", title: "候補から削除（過去の記録は残る）", onClick: function() { if (movedRef.current) { movedRef.current = false; return; } if (_p.onDelete) _p.onDelete(nm); }, style: { padding: "1px 5px", fontSize: 11, fontWeight: 800, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", borderRadius: 4, cursor: "pointer" } }, "×") : null
          ) : null);
      }),
      React.createElement("button", { type: "button", onClick: function() { if (addOpen) { setAddOpen(false); return; } valRef.current = ""; setInpVal(""); setRenOld(null); setAddOpen(true); }, style: { padding: "3px 8px", fontSize: 10, fontWeight: 600, border: addOpen ? "1px solid #0369A1" : "1px dashed #bbb", background: addOpen ? "#EFF6FF" : "#fff", color: addOpen ? "#0369A1" : "#888", borderRadius: 5, cursor: "pointer" } }, addOpen ? "✕" : "＋追加"),
      (master.length || orphans.length) ? React.createElement("button", { type: "button", onClick: function() { setEdit(!edit); setAddOpen(false); setRenOld(null); }, title: "名前変更・削除モード（✎改名・×削除・ドラッグで並び替え）", style: { padding: "3px 7px", fontSize: 9, fontWeight: 700, border: "1px solid " + (edit ? "#B91C1C" : "#ddd"), background: edit ? "#FEF2F2" : "#fff", color: edit ? "#B91C1C" : "#999", borderRadius: 5, cursor: "pointer" } }, edit ? "完了" : "✎編集") : null),
    (addOpen || renOld != null) ? React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 5, alignItems: "center", flexWrap: "wrap" } },
      renOld != null ? React.createElement("span", { style: { fontSize: 10, color: "#1D4ED8", fontWeight: 700 } }, "『" + renOld + "』を改名:") : null,
      React.createElement(FastInput, { key: renOld != null ? ("ren_" + renOld) : "add", type: "text", value: inpVal, onChange: function(v) { valRef.current = v; setInpVal(v); }, placeholder: renOld != null ? "新しい名前" : (_p.addPh || "名前"), style: { flex: 1, minWidth: 110, padding: "5px 8px", fontSize: 12, border: "1px solid #93C5FD", borderRadius: 6, background: "#fff", boxSizing: "border-box" } }),
      React.createElement("button", { type: "button", onClick: function() { _fiFlushAll(); _commit(); }, style: { padding: "5px 12px", fontSize: 12, fontWeight: 700, background: "#1D4ED8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" } }, renOld != null ? "改名" : "追加")
    ) : null);
}
// 早見カードの追加αインライン編集（計算フォームと同じ〇×→根拠 2026-07-08f）: 〇×ボタン→〇のとき数値入力＋根拠チップ（追加/改名/削除/並び替え＝_EpnChipMgr）＋推奨追加α表示。
// 値入力はローカルstate（onBlurで確定＝1文字ごとの全体保存を避ける）。推奨cascadeはuseMemoでキャッシュ。〇初期値（推奨値・無ければ5）は親onUsedが決定。
function _EpnAddSection(_p) {
  var e = _p.item, data = _p.data, date = _p.date, stock = _p.stock;
  var specialUsed = (e.specialUsed === true);
  var _s = useState(e.special != null ? String(e.special) : ""), _sa = _slicedToArray(_s, 2), addStr = _sa[0], setAddStr = _sa[1];
  useEffect(function() { setAddStr(e.special != null ? String(e.special) : ""); }, [e.special]);
  var _bs = useState(e.base != null ? String(e.base) : ""), _bsa = _slicedToArray(_bs, 2), baseStr = _bsa[0], setBaseStr = _bsa[1];   // 基本α値のローカル編集（2026-07-14 採用αセレクタ化）
  useEffect(function() { setBaseStr(e.base != null ? String(e.base) : ""); }, [e.base]);
  var _fJoin = Array.isArray(e.f) ? e.f.join("|") : "";
  var _rJoin = Array.isArray(e.specialReasons) ? e.specialReasons.join("|") : "";
  var casc = useMemo(function() {
    if (!specialUsed || !stock) return null;
    return _epnCascade(data, stock, e.tag || null, { b: e.b || null, k: e.k || null, f: Array.isArray(e.f) ? e.f : [] }, date);
  }, [specialUsed, data, stock, e.tag, e.b, e.k, _fJoin, date]);
  var reco = useMemo(function() { return casc ? _epnSpecialRecoFrom(casc, Array.isArray(e.specialReasons) ? e.specialReasons : []) : null; }, [casc, _rJoin]);
  // ▲▼ステッパー（2026-07-10b）: クリック即_epnPut保存（onValue）＝○×・チップと同じ即時反映（onBlur待ちだと押しただけでは保存されないため）。
  // 長押しリピート(_stepBtn)は古いクロージャから呼ばれ続けるので、表示中の値(addStr)と確定値(e.special)はrefで最新を参照＝連打でも正しく積み上がる。0〜50。
  var _addStrRef = useRef(addStr); _addStrRef.current = addStr;
  var _addCurRef = useRef(0); _addCurRef.current = Number(e.special) || 0;
  var _stepAdd = function(delta) {
    var cur = _addStrRef.current;
    var b = (cur !== "" && !isNaN(Number(cur))) ? Number(cur) : _addCurRef.current;
    var n = b + delta; if (n > 50) n = 50; if (n < 0) n = 0;
    setAddStr(String(n));
    if (n !== _addCurRef.current) _p.onValue(n);
  };
  // ▲▼ステッパー（基本α値・2026-07-14 採用αセレクタ化）: 基本α選択時に基本α値を直接編集＝即_epnPut保存＋EP再計算（refで最新値参照＝連打対応・0〜50）。
  var _baseStrRef = useRef(baseStr); _baseStrRef.current = baseStr;
  var _baseCurRef = useRef(0); _baseCurRef.current = Number(e.base) || 0;
  var _stepBase = function(delta) {
    var cur = _baseStrRef.current;
    var b = (cur !== "" && !isNaN(Number(cur))) ? Number(cur) : _baseCurRef.current;
    var n = b + delta; if (n > 50) n = 50; if (n < 0) n = 0;
    setBaseStr(String(n));
    if (n !== _baseCurRef.current) _p.onBase(n);
  };
  // 採用α セグメントセレクタ（基本α/応用α・計算フォーム/記録フォームと同じ 2026-07-14）: 選択＝onUsed(true/false)＝既存 onSetSpecialUsed 流用。
  var _segBtn = function(label, on, color, onClick, title) {
    return React.createElement("button", { type: "button", title: title, onClick: onClick,
      style: { padding: "2px 11px", fontSize: 10.5, fontWeight: 800, borderRadius: 6, cursor: "pointer", border: "none", background: on ? "#fff" : "transparent", color: on ? color : "#6B6459", boxShadow: on ? "0 1px 3px rgba(0,0,0,.12)" : "none", minHeight: IS_TOUCH ? 24 : 20 } }, label);
  };
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3 } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8", fontWeight: 700 } }, "採用α"),
      React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 8, padding: 2, gap: 2 } },
        _segBtn("基本α", !specialUsed, "#0369A1", function() { _p.onUsed(false); }, "通常はこちら＝基本α値を採用"),
        _segBtn("応用α", specialUsed, "#9A3412", function() { _p.onUsed(true); }, "応用α値を採用"))),
    !specialUsed ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" } },
      React.createElement("input", { type: "text", inputMode: "numeric", value: baseStr,
        onChange: function(ev) { var v = _toHankakuNum(ev.target.value); if (v === "" || !isNaN(Number(v))) setBaseStr(v); },
        onBlur: function() { var n = (baseStr === "" || isNaN(Number(baseStr))) ? 0 : Math.max(0, Number(baseStr)); if (n !== (Number(e.base) || 0)) _p.onBase(n); },
        style: { width: 38, padding: "2px 5px", fontSize: 11, fontWeight: 700, color: "#0369A1", border: "1px solid #CBD5E1", borderRadius: 5, background: "#fff", textAlign: "right", boxSizing: "border-box", outline: "none" } }),
      React.createElement("span", { style: { fontSize: 9, color: "#64748B" } }, "円"),
      _stepBtn(function() { _stepBase(1); }, function() { _stepBase(-1); })) : null,
    specialUsed ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" } },
      React.createElement("input", { type: "text", inputMode: "numeric", value: addStr,
        onChange: function(ev) { var v = _toHankakuNum(ev.target.value); if (v === "" || !isNaN(Number(v))) setAddStr(v); },
        onBlur: function() { var n = (addStr === "" || isNaN(Number(addStr))) ? 0 : Math.max(0, Number(addStr)); if (n !== (Number(e.special) || 0)) _p.onValue(n); },
        style: { width: 38, padding: "2px 5px", fontSize: 11, fontWeight: 700, color: "#B91C1C", border: "1px solid #CBD5E1", borderRadius: 5, background: "#fff", textAlign: "right", boxSizing: "border-box", outline: "none" } }),
      React.createElement("span", { style: { fontSize: 9, color: "#64748B" } }, "円"),
      _stepBtn(function() { _stepAdd(1); }, function() { _stepAdd(-1); })) : null,
    specialUsed ? React.createElement("div", null,
      React.createElement("div", { style: { fontSize: 8.5, color: reco ? "#9A3412" : "#94A3B8", marginTop: 2 } },
        reco ? (reco.nomin ? "推奨応用α ー（条件適合無し）" : ("推奨応用α " + reco.v + "円" + (reco.byReason ? "（選択根拠・n=" + reco.n + "・手動変更可）" : reco.fellBack ? "（根拠別はデータ不足→銘柄全体・n=" + reco.n + "・手動変更可）" : "（銘柄全体・n=" + reco.n + "・手動変更可）"))) : "推奨応用α データ無し（手動入力）")) : null);
}
// 早見カードのRN加算インライン編集（2026-07-08h）: 〇×ボタン→〇のとき数値入力（円・そのまま加算）。値入力はローカルstate（onBlur確定＝1文字ごとの全体保存を避ける）。根拠なし＝追加αより単純。
function _EpnRnSection(_p) {
  var e = _p.item;
  var rnUsed = (e.rnUsed === true) || (e.rnUsed == null && (Number(e.rn) || 0) > 0);
  var _s = useState(e.rn != null ? String(e.rn) : ""), _sa = _slicedToArray(_s, 2), rnStr = _sa[0], setRnStr = _sa[1];
  useEffect(function() { setRnStr(e.rn != null ? String(e.rn) : ""); }, [e.rn]);
  var _oxBtn = function(sym, on, color, bg, onClick) {
    return React.createElement("button", { type: "button", onClick: onClick,
      style: { padding: "1px 8px", fontSize: 11, fontWeight: on ? 800 : 600, border: on ? "2px solid " + color : "1px solid #ddd", background: on ? bg : "#fff", color: on ? color : "#999", borderRadius: 5, cursor: "pointer", lineHeight: 1.5, minHeight: IS_TOUCH ? 24 : 20 } }, sym);
  };
  return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" } },
    React.createElement("span", { style: { fontSize: 8.5, color: "#94A3B8", fontWeight: 700, flexShrink: 0 } }, "RN加算"),
    _oxBtn("○", rnUsed, "#1D4ED8", "#EFF6FF", function() { _p.onUsed(true); }),
    _oxBtn("×", !rnUsed, "#1E8449", "#EAF3DE", function() { _p.onUsed(false); }),
    rnUsed ? React.createElement("input", { type: "text", inputMode: "numeric", value: rnStr,
      onChange: function(ev) { var v = _toHankakuNum(ev.target.value); if (v === "" || !isNaN(Number(v))) setRnStr(v); },
      onBlur: function() { var n = (rnStr === "" || isNaN(Number(rnStr))) ? 0 : Math.max(0, Number(rnStr)); if (n !== (Number(e.rn) || 0)) _p.onValue(n); },
      style: { width: 38, padding: "2px 5px", fontSize: 11, fontWeight: 700, color: "#1D4ED8", border: "1px solid #CBD5E1", borderRadius: 5, background: "#fff", textAlign: "right", boxSizing: "border-box", outline: "none" } }) : null,
    rnUsed ? React.createElement("span", { style: { fontSize: 9, color: "#64748B" } }, "円") : null,
    // 自動判定の状態（2026-07-30）: 自動中は淡いラベル・手動で触った後は「↺自動」ボタンで復帰（計算フォームの表示と対）。
    (e.rnAuto === false)
      ? React.createElement("button", { type: "button", onClick: function() { _p.onAuto(); }, title: "RN加算の自動判定に戻す（予定EPの下二桁41〜49→…50／91〜99→…00）",
          style: { padding: "0 5px", fontSize: 8.5, fontWeight: 800, color: "#0F766E", background: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 4, cursor: "pointer", lineHeight: 1.7, whiteSpace: "nowrap" } }, "↺自動")
      : React.createElement("button", { type: "button", onClick: function() { _p.onAuto(); }, title: "自動判定ON: 採用α（基本α/応用α）や詳細を変えると、予定EPの下二桁41〜49→…50／91〜99→…00 になるようRN加算を自動で乗せ直します。〇×か数値に触ると手動に切り替わります。タップすると今すぐ再判定（この変更より前に作ったカード用）",
          style: { padding: 0, fontSize: 8.5, color: "#94A3B8", fontWeight: 700, whiteSpace: "nowrap", background: "none", border: "none", cursor: "pointer" } }, "自動"));
}
// ===== EPナビ 列ごとの独立計算フォーム（2026-07-08 案A: 2段整列）=====
// 各銘柄列に1フォームを常設＝最大3銘柄を同時に独立計算。銘柄はprops.stockに固定（旧①銘柄セレクタは廃止・番号は①基準分足〜④その他特徴へ繰り上げ）。
// 旧計算パネルの左右2カラム（左=選択系/右=α計算）は列幅に合わせて縦積み1カラム化。
// 親(EpNaviPanel)はregister(stock, api)で{loadForEdit, onDeleted}を受け取り、早見カードのタップ編集読込・削除時の編集解除に使う。
function _EpnCalcForm(_p) {
  var data = _p.data, save = _p.save, date = _p.date, stock = _p.stock, signalTags = _p.signalTags, reasonsMaster = _p.reasonsMaster, register = _p.register;
  var custom = data.custom || EMPTY.custom;
  var _useStateEPNmb = useState(["1"]), _useStateEPNmbA = _slicedToArray(_useStateEPNmb, 2), nMinBars = _useStateEPNmbA[0], setNMinBars = _useStateEPNmbA[1];
  var _useStateEPN3 = useState(""), _useStateEPN3A = _slicedToArray(_useStateEPN3, 2), nTag = _useStateEPN3A[0], setNTag = _useStateEPN3A[1];
  var _useStateEPN4 = useState(null), _useStateEPN4A = _slicedToArray(_useStateEPN4, 2), nSelB = _useStateEPN4A[0], setNSelB = _useStateEPN4A[1];
  var _useStateEPN5 = useState(null), _useStateEPN5A = _slicedToArray(_useStateEPN5, 2), nSelK = _useStateEPN5A[0], setNSelK = _useStateEPN5A[1];
  var _useStateEPN6 = useState([]), _useStateEPN6A = _slicedToArray(_useStateEPN6, 2), nSelF = _useStateEPN6A[0], setNSelF = _useStateEPN6A[1];
  var _useStateEPN7 = useState(""), _useStateEPN7A = _slicedToArray(_useStateEPN7, 2), nBase = _useStateEPN7A[0], setNBase = _useStateEPN7A[1];
  var _useStateEPN8 = useState("×"), _useStateEPN8A = _slicedToArray(_useStateEPN8, 2), nSpecialUsed = _useStateEPN8A[0], setNSpecialUsed = _useStateEPN8A[1];   // 応用α使用〇×（既定×＝通常＝基本α）2026-07-13
  var _useStateEPN9 = useState(""), _useStateEPN9A = _slicedToArray(_useStateEPN9, 2), nSpecialAlpha = _useStateEPN9A[0], setNSpecialAlpha = _useStateEPN9A[1];   // 応用α値（独立）
  var _useStateEPNrs = useState([]), _useStateEPNrsA = _slicedToArray(_useStateEPNrs, 2), nSpecialReasons = _useStateEPNrsA[0], setNSpecialReasons = _useStateEPNrsA[1];
  var _useStateEPN10 = useState("×"), _useStateEPN10A = _slicedToArray(_useStateEPN10, 2), nUkiUsed = _useStateEPN10A[0], setNUkiUsed = _useStateEPN10A[1];
  var _useStateEPN11 = useState(""), _useStateEPN11A = _slicedToArray(_useStateEPN11, 2), nUkiVal = _useStateEPN11A[0], setNUkiVal = _useStateEPN11A[1];
  var _useStateEPN11b = useState(""), _useStateEPN11bA = _slicedToArray(_useStateEPN11b, 2), nUkiPrev = _useStateEPN11bA[0], setNUkiPrev = _useStateEPN11bA[1];   // 底抜け前足の価格 2026-07-21: 浮き値=max(0,前足-水準線nLevel)をuseEffectでnUkiValへ
  var _useStateEPN11B = useState(""), _useStateEPN11BA = _slicedToArray(_useStateEPN11B, 2), nUkiPct = _useStateEPN11BA[0], setNUkiPct = _useStateEPN11BA[1];   // 浮き足加算率(%)・""=自動(推奨) 2026-07-12
  var _useStateEPN11S = useState(false), _useStateEPN11SA = _slicedToArray(_useStateEPN11S, 2), nUkiSpecial = _useStateEPN11SA[0], setNUkiSpecial = _useStateEPN11SA[1];   // 浮き足応用〇＝大きめ加算率プール（false=浮基本）2026-07-14g
  var _useStateEPN11T = useState(false), _useStateEPN11TA = _slicedToArray(_useStateEPN11T, 2), _epnUkiTbl = _useStateEPN11TA[0], _setEpnUkiTbl = _useStateEPN11TA[1];   // 浮き足加算率 詳細表モーダル 2026-07-14g
  var _useStateEPNrn1 = useState("×"), _useStateEPNrn1A = _slicedToArray(_useStateEPNrn1, 2), nRnUsed = _useStateEPNrn1A[0], setNRnUsed = _useStateEPNrn1A[1];   // RN加算（第5のα要素 2026-07-08h・全シグナル・そのまま加算）
  var _useStateEPNrn2 = useState(""), _useStateEPNrn2A = _slicedToArray(_useStateEPNrn2, 2), nRnVal = _useStateEPNrn2A[0], setNRnVal = _useStateEPNrn2A[1];
  var _useStateEPNrn3 = useState(true), _useStateEPNrn3A = _slicedToArray(_useStateEPNrn3, 2), nRnAuto = _useStateEPNrn3A[0], setNRnAuto = _useStateEPNrn3A[1];   // RN加算自動判定が有効か 2026-07-20b（false=手動で上書き済み＝自動を止める。「↺自動」で復帰）
  var _useStateEPN12 = useState(""), _useStateEPN12A = _slicedToArray(_useStateEPN12, 2), nLevel = _useStateEPN12A[0], setNLevel = _useStateEPN12A[1];
  var _useStateEPNlc = useState(false), _useStateEPNlcA = _slicedToArray(_useStateEPNlc, 2), nLineCoexist = _useStateEPNlcA[0], setNLineCoexist = _useStateEPNlcA[1];   // ⑤ライン併存ルール（〇×独立欄 2026-07-08g）: 〇で基本α1自動入力（下effect）
  var _useStateEPNed = useState(null), _useStateEPNedA = _slicedToArray(_useStateEPNed, 2), editId = _useStateEPNedA[0], setEditId = _useStateEPNedA[1];
  var _useStateEPNea = useState(null), _useStateEPNeaA = _slicedToArray(_useStateEPNea, 2), editAt = _useStateEPNeaA[0], setEditAt = _useStateEPNeaA[1];
  var _useStateEPNdn = useState(false), _useStateEPNdnA = _slicedToArray(_useStateEPNdn, 2), editDone = _useStateEPNdnA[0], setEditDone = _useStateEPNdnA[1];
  var _useStateEPNdo = useState(false), _useStateEPNdoA = _slicedToArray(_useStateEPNdo, 2), detOpen = _useStateEPNdoA[0], setDetOpen = _useStateEPNdoA[1];   // ③起点〜⑤詳細の開閉（案A 2026-07-10・③底抜けは2026-07-13で畳みの外へ）: 既定は畳み・編集読込で詳細値があれば自動展開・保存対象外のUI状態
  // 旧 showSpTable state は削除（_spModal を死コード化＝未使用）2026-07-22j
  var _rootRef = useRef(null);
  // ライン併存ルール（独自欄nLineCoexist 2026-07-08g）: 〇にすると基本α欄へ1を自動入力＝切替の瞬間だけ効き、手修正可・×へ戻すと1なら空に戻す（推奨に戻る）。記録フォームEntryRecordFormと同ルール＝二重実装・変更時は両方直す。旧・併存ラインチップ検知はmigrateData _migLineCoexistで本フラグへ移行済み。
  var _kyozPrevRef = useRef(nLineCoexist);
  useEffect(function() {
    if (nLineCoexist === _kyozPrevRef.current) return;
    _kyozPrevRef.current = nLineCoexist;
    if (nLineCoexist) setNBase("1");
    else setNBase(function(_p) { return _p === "1" ? "" : _p; });
  }, [nLineCoexist]);
  // 列フォーム常設化に伴い推奨カスケードは常時計算（旧epnOpenゲートは廃止・銘柄ごとuseMemo）。
  var casc = useMemo(function() {
    if (!stock) return null;
    return _epnCascade(data, stock, nTag || null, { b: nSelB, k: nSelK, f: nSelF }, date);
  }, [data, stock, nTag, nSelB, nSelK, nSelF, date]);
  var tagCount = useMemo(function() {
    var cnt = {};
    if (casc && casc.all) casc.all.forEach(function(r) { _epnTagsOf(r.signal).forEach(function(t) { cnt[t] = (cnt[t] || 0) + 1; }); });
    return cnt;
  }, [casc]);
  var sigOrphans = useMemo(function() {
    var out = [];
    Object.keys(tagCount).forEach(function(t) { if (signalTags.indexOf(t) < 0) out.push(t); });
    return out;
  }, [tagCount, signalTags]);
  var cands = useMemo(function() {
    if (!nTag) return { b: [], k: [], f: [] };
    var m2 = (custom.sigDetails2 || {})[nTag];
    if (m2 && typeof m2 === "object" && !Array.isArray(m2)) return { b: Array.isArray(m2.b) ? m2.b : [], k: Array.isArray(m2.k) ? m2.k : [], f: Array.isArray(m2.f) ? m2.f : [] };
    var old = (custom.sigDetails || {})[nTag];
    var oldArr = Array.isArray(old) ? old : [];
    return { b: oldArr, k: oldArr, f: oldArr };
  }, [custom, nTag]);
  var det = casc && casc.det, sig = casc && casc.sig, stk = casc && casc.stk, band = casc && casc.band;
  // 採用基本α: 詳細別ok→シグナル別ok→銘柄全体ok→株価帯ok。全段データ不足なら仮値（参考推奨）を同順で採用＝フォームと違い場中は値を出すのが仕事（（仮）表示で明示）。帯＝第2弾フォールバック 2026-07-22f
  var autoPick = (function() {
    var _cp = _elCascadePick([   // 2026-07-14 共通化: det→sig→stk→帯（仮値含む）の選定を_elCascadePickへ集約（記録フォーム_autoBase/_epnBaseLevelKey/_epnRecalcBaseと同一梯子）
      { key: "det", label: "詳細別", alpha: det ? det.alpha : null, ok: !!(det && det.ok) },
      { key: "sig", label: "シグナル別", alpha: sig ? sig.alpha : null, ok: !!(sig && sig.ok) },
      { key: "stk", label: "銘柄全体", alpha: stk ? stk.alpha : null, ok: !!(stk && stk.ok) },
      { key: "band", label: "株価帯", alpha: band ? band.alpha : null, ok: !!(band && band.ok) }
    ], true);
    return { a: _cp.alpha, key: _cp.key, src: _cp.src, ok: _cp.ok };
  })();
  // 本日の採用α値（見出し下欄・_EpnDayAlphaField）が設定されていれば基本αの既定に採用＝「上で一度決めれば下の計算が従う」。未設定はnull＝従来どおりautoPick（シグナル別に絞れる）。手入力nBaseは常に最優先。2026-07-13d
  var dayAlpha = (_p.dayAlpha != null && !isNaN(Number(_p.dayAlpha))) ? Number(_p.dayAlpha) : null;
  var daySpecialAlpha = (_p.daySpecialAlpha != null && !isNaN(Number(_p.daySpecialAlpha))) ? Number(_p.daySpecialAlpha) : null;   // 本日の採用応用α値（epNaviDaySpecialAlpha）＝応用α既定に優先採用 2026-07-21（基本αのdayAlphaと対称・記録フォームと揃える）
  // 「詳細で更新」トグル（custom.epnFollowReco・既定false=固定 2026-07-13）: OFF＝②③④の詳細を選んでも基本αの既定を動かさず、本日の採用α値→無ければ銘柄全体(stk・詳細非依存)の推奨で固定（ユーザー「一度止めたい・本日の採用α値で固定」）。ON＝従来の詳細別→シグナル別→銘柄全体の追従。手入力nBaseは常に最優先。
  var followReco = !!(data && data.custom && data.custom.epnFollowReco);
  var _stkBase = (stk && stk.alpha != null) ? stk.alpha : (autoPick.a != null ? autoPick.a : null);   // 銘柄全体（詳細非依存）＝固定時の既定
  var _autoBase = followReco ? (autoPick.a != null ? autoPick.a : null) : _stkBase;
  var _baseDefault = dayAlpha != null ? dayAlpha : _autoBase;
  var _baseSrc = (dayAlpha != null) ? "本日の採用α値" : (followReco ? autoPick.src : ((stk && stk.alpha != null) ? (stk.ok ? "銘柄全体" : "銘柄全体（仮）") : autoPick.src));   // 保存EPのsrc表記＝実際に採用した既定の出所
  var showUki = true;   // 浮き足加算は全シグナルで表示・入力可（記録フォームと同じ_showUki=true。旧＝底抜け系のみ_elUkiSignalNamesゲート→2026-07-13解除・推奨/次点/手入力%は従来どおり適用）
  var baseV = (nBase !== "" && !isNaN(Number(nBase))) ? Number(nBase) : _baseDefault;
  // 推奨応用α（応用〇の記録から算出・浮き足/RN除外）。根拠を選ぶとその根拠を持つ記録に絞る。共有ヘルパー_epnSpecialRecoFrom（早見カードと同一）。
  var specialReco = _epnSpecialRecoFrom(casc, nSpecialReasons);
  var specialV = (nSpecialUsed === "○") ? ((nSpecialAlpha !== "" && !isNaN(Number(nSpecialAlpha))) ? Number(nSpecialAlpha) : (daySpecialAlpha != null ? daySpecialAlpha : (specialReco && specialReco.v != null ? specialReco.v : (baseV != null ? baseV : 0)))) : null;   // 手入力＞本日の採用応用α値＞推奨応用α＞基本α 2026-07-21
  var _epnBaseLevel = (specialV != null) ? specialV : baseV;   // base-levelα＝応用〇なら応用α、通常は基本α（場中版の採用α選択）
  // 浮き足加算率: 記録日前日までの全銘柄浮き足〇記録から推奨/次点（_elUkiPctSweep）。nUkiPct=""は自動=推奨(無ければ50%)。2026-07-12
  var _ukiReco = useMemo(function() { return _elUkiPctPickScoped(data, date, nUkiSpecial ? "special" : "basic", null, stock); }, [data, date, nUkiSpecial, stock]);   // 2026-07-14g 浮基本/浮応用でプールを分けて推奨%（記録フォームと同じ）。2026-07-25 stockを渡して株価帯優先（帯が薄ければ全銘柄へフォールバック）
  var _effUkiPct = _elUkiEffPct(nUkiPct, _ukiReco.reco);   // 2026-07-14 共通化
  var _ukiRecoAct = nUkiPct === "" || (_ukiReco.reco != null && Number(nUkiPct) === _ukiReco.reco);
  var _ukiRunAct = _ukiReco.runnerUp != null && nUkiPct !== "" && Number(nUkiPct) === _ukiReco.runnerUp;
  var _ukiCustAct = !_ukiRecoAct && !_ukiRunAct;
  var _setNUkiPct = function(val) { var v = _toHankakuNum(val); if (v === "") { setNUkiPct(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 100) n = 100; if (n < 0) n = 0; setNUkiPct(String(n)); };
  var _stepNUkiPct = _elMkPctStepper(setNUkiPct);   // 手入力の↑↓: 空欄→50・以降±10（2026-07-14 共通化）
  var ukiAddV = _elUkiAddVal(showUki && nUkiUsed === "○", nUkiVal, _effUkiPct);   // 2026-07-14 共通化
  var rnAddV = _elRnAddVal(nRnUsed === "○", nRnVal);   // RN加算（そのまま加算・全シグナル 2026-07-08h→2026-07-14共通化）
  // RN加算自動判定 2026-07-20b（記録フォームと同じ挙動）: RN前α＝浮き足〇なら浮き足加算のみ／通常は基底α＋浮き足加算。RNは含めない＝予定EPが循環しないように。
  var _nRnPre = (nUkiUsed === "○") ? ukiAddV : ((_epnBaseLevel != null) ? (_epnBaseLevel + ukiAddV) : null);
  var _nRnAutoAdd = _elRnAutoFrom(nLevel, _nRnPre);   // null=判定不可（水準線未入力/基底α未確定） / 0=対象外(自動×) / >0=加算額
  // 底抜け前足−底抜けライン（水準線nLevel）＝浮き値を自動計算しnUkiValへ（記録フォームと対称）。前足orライン未入力なら据え置き＝過去記録の保存値を維持。2026-07-21
  useEffect(function() {
    if (nUkiUsed !== "○") return;
    if (nUkiPrev === "" || isNaN(Number(nUkiPrev))) return;
    if (nLevel === "" || isNaN(parseFloat(nLevel))) return;
    var _d = Math.max(0, Number(nUkiPrev) - parseFloat(nLevel));
    var _s = String(_d);
    if (nUkiVal !== _s) setNUkiVal(_s);
  }, [nUkiPrev, nLevel, nUkiUsed]);
  useEffect(function() {
    if (!nRnAuto || _nRnAutoAdd == null) return;
    var _w = _nRnAutoAdd > 0 ? "○" : "×";
    if (nRnUsed !== _w) setNRnUsed(_w);
    var _wv = _nRnAutoAdd > 0 ? String(_nRnAutoAdd) : "";
    if (nRnVal !== _wv) setNRnVal(_wv);
  }, [nRnAuto, _nRnAutoAdd, nRnUsed, nRnVal]);
  var effA = (nUkiUsed === "○") ? (ukiAddV + rnAddV) : ((_epnBaseLevel != null) ? (_epnBaseLevel + ukiAddV + rnAddV) : null);   // 2026-07-14g 浮き足〇＝土台α不使用（採用α＝浮き足加算＋RN）
  var levelN = (nLevel !== "" && !isNaN(parseFloat(nLevel))) ? parseFloat(nLevel) : null;
  var epV = (levelN != null && effA != null) ? Math.round((levelN + effA) * 100) / 100 : null;
  var _epnCutLine = (function() { var _ck = stock + "_" + date; var _cd = data.charts && data.charts[_ck]; return (_cd != null && _cd.cutLine != null) ? Number(_cd.cutLine) : 15; })();   // 予定損切りライン用の損切り値（水準線比・既定15）2026-07-18
  var _resetForm = function() {
    setEditId(null); setEditAt(null); setEditDone(false); setNMinBars(["1"]); setNTag(""); setNSelB(null); setNSelK(null); setNSelF([]);
    setNBase(""); setNSpecialUsed("×"); setNSpecialAlpha(""); setNSpecialReasons([]); setNUkiUsed("×"); setNUkiVal(""); setNUkiPrev(""); setNUkiPct(""); setNUkiSpecial(false); setNRnUsed("×"); setNRnVal(""); setNRnAuto(true); setNLevel(""); setNLineCoexist(false); setDetOpen(false);
    _kyozPrevRef.current = false;
  };
  var doSave = function() {
    if (epV == null || !stock) return;
    var _item = {
      id: editId || ("epn_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7)),
      tag: nTag || null, b: nSelB || null, k: nSelK || null, f: nSelF.slice(), minBars: nMinBars.slice(),
      base: baseV, special: specialV, uki: ukiAddV, ukiUsed: nUkiUsed === "○", ukiSpecial: (nUkiUsed === "○") ? nUkiSpecial : null, ukiVal: ukiAddV > 0 ? Number(nUkiVal) : null, ukiPrevBar: (nUkiUsed === "○" && nUkiPrev !== "" && !isNaN(Number(nUkiPrev))) ? Number(nUkiPrev) : null, ukiPct: ukiAddV > 0 ? _effUkiPct : null,
      rn: rnAddV, rnUsed: nRnUsed === "○", rnAuto: nRnAuto,   // rnAuto 2026-07-20b（false=手動上書き済み＝編集で開き直しても自動が上書きしない）
      specialUsed: (nUkiUsed === "○") ? false : (nSpecialUsed === "○"), specialReasons: (nUkiUsed !== "○" && nSpecialUsed === "○") ? nSpecialReasons.slice() : [],
      lineCoexist: nLineCoexist,
      level: levelN, ep: epV, src: _baseSrc || null, at: editAt || Date.now()
    };
    if (editId && editDone) _item.done = true;
    _epnPut(save, date, stock, _item);
    _resetForm();
  };
  // ✎編集: 保存済みEPの全項目をこの列のフォームへ読込んで更新モードに（あとから追加αを取る等）。
  var loadForEdit = function(e) {
    setNMinBars((Array.isArray(e.minBars) && e.minBars.length) ? e.minBars.slice() : ["1"]);
    setNTag(e.tag || "");
    setNSelB(e.b || null); setNSelK(e.k || null); setNSelF(Array.isArray(e.f) ? e.f.slice() : []);
    setNBase(e.base != null ? String(e.base) : "");
    var _spUsed = (e.specialUsed === true);
    setNSpecialUsed(_spUsed ? "○" : "×"); setNSpecialAlpha(_spUsed && e.special != null ? String(e.special) : "");
    setNSpecialReasons(Array.isArray(e.specialReasons) ? e.specialReasons.slice() : (Array.isArray(e.reasons) ? e.reasons.slice() : []));
    var hasUki = (Number(e.uki) || 0) > 0;
    setNUkiUsed(hasUki ? "○" : "×"); setNUkiVal(hasUki && e.ukiVal != null ? String(e.ukiVal) : ""); setNUkiPrev(hasUki && e.ukiPrevBar != null ? String(e.ukiPrevBar) : ""); setNUkiPct(e.ukiPct != null ? String(e.ukiPct) : (hasUki ? "50" : "")); setNUkiSpecial(e.ukiSpecial === true);
    var hasRn = (e.rnUsed === true) || ((Number(e.rn) || 0) > 0);   // RN加算の復元（rnUsed明示・旧itemはrn>0で推定）2026-07-08h
    setNRnUsed(hasRn ? "○" : "×"); setNRnVal(hasRn ? String(Number(e.rn) || 0) : ""); setNRnAuto(e.rnAuto !== false);   // 2026-07-30 未設定＝自動（早見カードの_epnApplyRnAutoと同じ扱い）。明示的なfalse＝カード/フォームで手動に倒した分だけ手動を維持（旧: ===true＝保存済みカードは既定手動 2026-07-20b）
    setNLevel(e.level != null ? String(e.level) : "");
    setNLineCoexist(e.lineCoexist === true);
    setDetOpen(!!(e.b || e.k || (Array.isArray(e.f) && e.f.length) || e.lineCoexist === true));   // 詳細入りの保存EPは③〜⑤を自動展開＝入力済みが隠れたまま上書き保存される事故を防ぐ（案A 2026-07-10）
    setEditId(e.id); setEditAt(e.at || null); setEditDone(!!e.done);
    _kyozPrevRef.current = (e.lineCoexist === true);
  };
  // 親へAPI登録（毎レンダー再登録＝最新クロージャ維持・アンマウントで解除）。
  useEffect(function() {
    if (register) register(stock, { loadForEdit: loadForEdit, save: doSave, focus: function() { if (_rootRef.current && _rootRef.current.scrollIntoView) _rootRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, onDeleted: function(id) { if (editId === id) _resetForm(); } });
    return function() { if (register) register(stock, null); };
  });
  // 編集モード（editId）の変化を親EpNaviPanelへ通知＝早見カードの「編集」ボタンを編集中だけ「💾保存」に切替（onEditing）。
  // 注意: 上のregister useEffectはdeps無し＝毎レンダー再実行。そのcleanupでonEditingを呼ぶと親再描画のたびnullで打ち消される→通知はこの専用effect（deps[editId,stock]）のみ、unmountクリアは別effectに分離。
  useEffect(function() { if (_p.onEditing) _p.onEditing(stock, editId); }, [editId, stock]);
  useEffect(function() { return function() { if (_p.onEditing) _p.onEditing(stock, null); }; }, []);
  // ===== 選択肢の管理（追加/改名/削除/並び替え・改名は過去記録も追従）=====
  var _sigToggle = function(t) { setNTag(nTag === t ? "" : t); setNSelB(null); setNSelK(null); setNSelF([]); };
  var _sigAdd = function(nm) { save(function(prev) { var cur = (prev.custom && Array.isArray(prev.custom.signalTags)) ? prev.custom.signalTags : []; if (cur.indexOf(nm) >= 0) return prev; return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { signalTags: cur.concat([nm]) }) }); }); };
  var _sigDelete = function(nm) { save(function(prev) { var cur = (prev.custom && Array.isArray(prev.custom.signalTags)) ? prev.custom.signalTags : []; return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { signalTags: cur.filter(function(x) { return x !== nm; }) }) }); }); };
  var _sigReorder = function(list) { save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { signalTags: list.slice() }) }); }); };
  var _sigRename = function(oldNm, newNm) {
    // 改名は過去記録も全域追従（_elSignalRenameData・app-05）。旧実装は改名先が既存名だと中断＝マスターと記録がズレる事故の元だったため、
    // 既存名への改名も「統合」として実行する（記録/詳細候補/浮き足対象/出現欄メモ/EPナビ保存まで追従）2026-07-07g。削除(_sigDelete)は従来どおり記録に触らない。
    save(function(prev) { return _elSignalRenameData(prev, oldNm, newNm); });
    if (nTag === oldNm) setNTag(newNm);
  };
  var _detWrite = function(prev, secKey, listOrFn) {
    var _c = Object.assign({}, prev.custom || {});
    var _all = Object.assign({}, _c.sigDetails2 || {});
    var _cur = _all[nTag];
    var _base = (_cur && typeof _cur === "object") ? { b: (_cur.b || []).slice(), k: (_cur.k || []).slice(), f: (_cur.f || []).slice() } : (function() { var _s0 = (((prev.custom || {}).sigDetails || {})[nTag] || []); return { b: _s0.slice(), k: _s0.slice(), f: _s0.slice() }; })();
    _base[secKey] = (typeof listOrFn === "function") ? listOrFn(_base[secKey]) : listOrFn;
    _all[nTag] = _base; _c.sigDetails2 = _all; return _c;
  };
  var _detAdd = function(secKey, nm) { save(function(prev) { return Object.assign({}, prev, { custom: _detWrite(prev, secKey, function(l) { return l.indexOf(nm) >= 0 ? l : l.concat([nm]); }) }); }); };
  var _detDelete = function(secKey, nm) {
    save(function(prev) { return Object.assign({}, prev, { custom: _detWrite(prev, secKey, function(l) { return l.filter(function(x) { return x !== nm; }); }) }); });
    if (secKey === "b" && nSelB === nm) setNSelB(null);
    if (secKey === "k" && nSelK === nm) setNSelK(null);
    if (secKey === "f") setNSelF(function(p) { return p.filter(function(x) { return x !== nm; }); });
  };
  var _detReorder = function(secKey, list) { save(function(prev) { return Object.assign({}, prev, { custom: _detWrite(prev, secKey, list.slice()) }); }); };
  var _detRename = function(secKey, oldNm, newNm) {
    save(function(prev) {
      var _curList = (function() { var _cur = ((prev.custom || {}).sigDetails2 || {})[nTag]; if (_cur && typeof _cur === "object") return (_cur[secKey] || []); return (((prev.custom || {}).sigDetails || {})[nTag] || []); })();
      // 既存名への改名も「統合」として実行（候補はdedupe・記録側は_elSigDetailRenameSigがf重複を除去）2026-07-07g（旧: 同名ありは中断）
      var _renamed = _curList.map(function(x) { return x === oldNm ? newNm : x; });
      var _c = _detWrite(prev, secKey, _renamed.filter(function(x, i) { return x && _renamed.indexOf(x) === i; }));
      var _pCharts = prev.charts || {}, _nCharts = {};
      Object.keys(_pCharts).forEach(function(ck) {
        var cc = _pCharts[ck];
        if (!cc || !Array.isArray(cc.signals)) { _nCharts[ck] = cc; return; }
        var _ch = false;
        var sigs = cc.signals.map(function(s) { var _ns = _elSigDetailRenameSig(s, nTag, secKey, oldNm, newNm); if (_ns !== s) _ch = true; return _ns; });
        _nCharts[ck] = _ch ? Object.assign({}, cc, { signals: sigs }) : cc;
      });
      return Object.assign({}, prev, { custom: _c, charts: _nCharts });
    });
    if (secKey === "b" && nSelB === oldNm) setNSelB(newNm);
    if (secKey === "k" && nSelK === oldNm) setNSelK(newNm);
    if (secKey === "f") setNSelF(function(p) { return p.map(function(x) { return x === oldNm ? newNm : x; }); });
  };
  // 根拠マスター操作は共有データ変換（_rsn*Data・早見カードの_rsn*Gと同一ロジック）＋フォーム選択状態の追従。改名は_rsnRenameDataが過去記録/保存EPも一括追従。
  var _rsnAdd = function(nm) { save(function(prev) { return _rsnAddData(prev, nm); }); };
  var _rsnDelete = function(nm) { save(function(prev) { return _rsnDeleteData(prev, nm); }); setNAddReasons(function(p) { return p.filter(function(x) { return x !== nm; }); }); };
  var _rsnReorder = function(list) { save(function(prev) { return _rsnReorderData(prev, list); }); };
  var _rsnRename = function(oldNm, newNm) { save(function(prev) { return _rsnRenameData(prev, oldNm, newNm); }); setNAddReasons(function(p) { return p.map(function(x) { return x === oldNm ? newNm : x; }); }); };
  // ===== 表示ヘルパー =====
  var _NUMC = "#1D4ED8";
  var _nl = function(num, text) { return React.createElement("span", null, React.createElement("span", { style: { color: _NUMC, fontWeight: 800, marginRight: 3 } }, num), text); };
  var _lrow = function(label, node) {
    return React.createElement("div", { style: { marginBottom: 7 } },
      React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#64748B", marginBottom: 3 } }, label),
      node);
  };
  var _inpStyle = { padding: "3px 6px", fontSize: 12, fontWeight: 700, color: "#334155", border: "1px solid #CBD5E1", borderRadius: 5, background: "#fff", width: 56, textAlign: "right", boxSizing: "border-box", outline: "none" };
  var _oxBtns = function(cur, setFn) {
    return React.createElement("div", { style: { display: "inline-flex", gap: 4 } },
      [["○", "#C0392B", "#FCEBEB"], ["×", "#1E8449", "#EAF3DE"]].map(function(kv) {
        var on = cur === kv[0];
        return React.createElement("button", { key: kv[0], type: "button", onClick: function() { setFn(kv[0]); },
          style: { padding: "1px 9px", fontSize: 11, fontWeight: on ? 800 : 600, border: on ? "2px solid " + kv[1] : "1px solid #ddd", background: on ? kv[2] : "#fff", color: on ? kv[1] : "#999", borderRadius: 5, cursor: "pointer", lineHeight: 1.5 } }, kv[0]);
      }));
  };
  var _pickLine = function(key, label, p) {
    if (!p) return null;
    return React.createElement("div", { key: key, style: { fontSize: 10, color: "#475569", lineHeight: 1.6 } },
      React.createElement("span", { style: { color: "#94A3B8" } }, label + "："),
      (p.alpha != null && p.ok)
        ? React.createElement("span", { style: { fontWeight: 800, color: "#B91C1C" } }, p.alpha + "円")
        : React.createElement("span", { style: { color: "#94A3B8" } }, "データ不足", p.alpha != null ? "（仮" + p.alpha + "円）" : ""),
      React.createElement("span", { style: { color: "#94A3B8", fontSize: 8.5 } }, "（n=" + p.n + "）"),
      autoPick.key === key ? React.createElement("span", { style: { color: "#B91C1C", fontSize: 8.5, fontWeight: 800, marginLeft: 2 } }, "★採用") : null);
  };
  var _mgmtHead = function(num, text) {
    return React.createElement("span", null, _nl(num, text), React.createElement("span", { style: { fontSize: 8, color: "#C4B5A4", fontWeight: 600, marginLeft: 6 } }, "＋追加・✎編集・ドラッグで並び替え"));
  };
  // ③〜⑤の畳み中要約（案A 2026-07-10）: 選択済みの詳細をトグル行に圧縮表示＝畳んでいても入力済みが分かる。
  var _detSummary = [nSelK ? "起:" + nSelK : null, nSelF.length ? "特×" + nSelF.length : null, nLineCoexist ? "併存○" : null].filter(Boolean).join("・");   // ③底抜けは畳みの外＝要約からは除外 2026-07-13
  // ===== 描画（縦積み1カラム＝列幅に収まる）=====
  // 編集中（editId有り）は計算欄を琥珀色に＝どの列を編集中か一目で分かる（保存済みバナー＋更新保存ボタンと同系色）。2026-07-08
  var _editing = !!editId;
  // 「応用α 詳細データ表」ポップアップ（基本αの下のボタン→ 2026-07-13）: 記録帳と同じ_elTotalAlphaSectionV2（＝推奨合計α＝応用αの実体・母数は追加α〇[浮き/RN除外]）を、この銘柄のv2記録（この日より前＝_epnCascade.all）でオーバーレイ表示。本移行後は正式な応用α表に自動で切替わる。
  var _spModal = null;   // 旧・応用α詳細ポップアップは開くボタンが撤去され到達不能（setShowSpTable(true)の呼出無し）＝死コードのため本体を削除。「表を参照」は_ElDayAlphaPairに集約済み 2026-07-22j
  return React.createElement("div", { ref: _rootRef, style: { minWidth: 0, boxSizing: "border-box", background: _editing ? "#FFFBEB" : "#fff", border: _editing ? "2px solid #F59E0B" : "1px solid #BFDBFE", borderRadius: 8, padding: _editing ? 7 : 8 } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, color: _editing ? "#B45309" : "#1D4ED8", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, (_editing ? "✎ 編集：" : "計算：") + stock),
      React.createElement("button", { type: "button", onClick: _resetForm, title: "計算内容をリセット（シグナル/α/水準線などを初期化）",
        style: { flexShrink: 0, padding: "3px 9px", fontSize: 10.5, fontWeight: 700, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", borderRadius: 5, cursor: "pointer", whiteSpace: "nowrap", minHeight: IS_TOUCH ? 30 : 22 } }, "↺ リセット")),
    editId ? React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 6, padding: "4px 8px", background: "#FEF9C3", border: "1px solid #FDE68A", borderRadius: 6, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, color: "#92400E" } }, "✎ 保存済みEPを編集中（保存で上書き）"),
      React.createElement("button", { type: "button", onClick: _resetForm, style: { padding: "2px 8px", fontSize: 10, fontWeight: 700, border: "1px solid #FDBA74", background: "#fff", color: "#9A3412", borderRadius: 5, cursor: "pointer" } }, "編集をやめる")) : null,
    _lrow(_nl("①", "基準分足"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
      ["1", "5"].map(function(_mb) {
        var on = nMinBars.indexOf(_mb) >= 0;
        return React.createElement("button", { key: _mb, type: "button", onClick: function() { setNMinBars(function(p) { return p.indexOf(_mb) >= 0 ? p.filter(function(x) { return x !== _mb; }) : p.concat([_mb]); }); },
          style: { minWidth: 36, padding: "4px 12px", fontSize: 13, fontWeight: 800, border: on ? "1.5px solid #166534" : "1px solid #ddd", background: on ? "#EAF7EE" : "#fff", color: on ? "#166534" : "#888", borderRadius: 6, cursor: "pointer" } }, _mb);
      }),
      React.createElement("span", { style: { fontSize: 10, color: "#94A3B8", fontWeight: 600 } }, "分足（両方選択可・5分は早見で緑）"))),
    _lrow(_mgmtHead("②", "シグナル"), React.createElement(_EpnChipMgr, { items: signalTags, orphans: sigOrphans, selected: nTag ? [nTag] : [], countOf: function(t) { return tagCount[t] || 0; }, accent: { b: "#EA580C", bg: "#FFEDD5", c: "#9A3412" }, addPh: "シグナル名", onToggle: _sigToggle, onAdd: _sigAdd, onRename: _sigRename, onDelete: _sigDelete, onReorder: _sigReorder })),
    nTag ? _lrow(_mgmtHead("③", "底抜け"), React.createElement(_EpnChipMgr, { items: cands.b, selected: nSelB ? [nSelB] : [], accent: { b: "#D97706", bg: "#FEF3C7", c: "#92400E" }, addPh: "底抜け名（例: 前日安値）", onToggle: function(nm) { setNSelB(nSelB === nm ? null : nm); }, onAdd: function(nm) { _detAdd("b", nm); }, onRename: function(o, n) { _detRename("b", o, n); }, onDelete: function(nm) { _detDelete("b", nm); }, onReorder: function(l) { _detReorder("b", l); } })) : null,   // ③底抜けは②シグナルの直下に常時表示（底抜けライン欄のみ復活 2026-07-24）
    React.createElement("div", { title: "記録フォームと同じ段階フォールバック（詳細別→シグナル別→銘柄全体・直近50→100→全期間の件数窓・この日より前の記録のみ・応用〇/浮き足〇は母数から除外）。★＝EP計算に採用中の段。データ不足＝件数フロア未満（仮＝参考値）", style: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 7px", marginBottom: 7 } },
      React.createElement("div", { style: { fontSize: 9, fontWeight: 800, color: "#94A3B8", marginBottom: 1 } }, "推奨基本α"),
      nTag ? _pickLine("sig", "シグナル別", sig) : null,
      _pickLine("stk", "銘柄全体", stk),
      (!det && !nTag) ? React.createElement("div", { style: { fontSize: 9, color: "#CBD5E1" } }, "シグナルを選ぶと絞った推奨が出ます") : null),
    _lrow("水準線", React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } },
      React.createElement("input", { type: "text", inputMode: "decimal", value: nLevel, placeholder: "—",
        onChange: function(e) { setNLevel(_toHankakuDecimal(e.target.value)); }, style: Object.assign({}, _inpStyle, { width: 72 }) }),
      React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, "円"),
      _stepBtn(function() { setNLevel(function(v) { return String(Math.round(((parseFloat(v) || 0) + 1) * 100) / 100); }); },
        function() { setNLevel(function(v) { return String(Math.max(0, Math.round(((parseFloat(v) || 0) - 1) * 100) / 100)); }); }))),
    // 浮き足加算（底抜け前足−底抜けライン[=水準線nLevel]＝差額×加算率＝合計α値へ上乗せ 2026-07-21b。差額はuseEffectでnUkiValへ。旧: 浮き値の直接入力 2026-07-14f）
    showUki ? _lrow("浮き足加算（前足−ライン）", React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },   // 1段目: 要/不要・浮き基本/応用 2026-07-21
        _oxBtns(nUkiUsed, setNUkiUsed),
        (nUkiUsed === "○") ? React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 7, padding: 2, gap: 2 } },   // 浮基本/浮応用トグル（記録フォームと同じ・プールを分けて推奨%）2026-07-14g
          [["basic", "浮き基本", false], ["special", "浮き応用", true]].map(function(_uk) {
            var _uon = nUkiSpecial === _uk[2];
            return React.createElement("button", { key: _uk[0], type: "button", onClick: (function(_v) { return function() { setNUkiSpecial(_v); }; })(_uk[2]),
              title: _uk[2] ? "浮き足応用＝大きめの加算率（根拠つき）で採用" : "浮き足基本＝通常の加算率で採用",
              style: { padding: "3px 11px", fontSize: 11, fontWeight: _uon ? 800 : 600, borderRadius: 5, cursor: "pointer", border: "none", background: _uon ? "#fff" : "transparent", color: _uon ? "#15803D" : "#6B6459", boxShadow: _uon ? "0 1px 2px rgba(0,0,0,.1)" : "none" } }, _uk[1]);
          })) : null
      ),
      (nUkiUsed === "○") ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },   // 2段目: 率（推奨%＋手入力）＋📊詳細表 2026-07-21
        React.createElement("span", { style: { fontSize: 10, color: "#94A3B8" } }, "率"),
        nUkiUsed === "○" ? React.createElement("button", { type: "button", onClick: function() { setNUkiPct(""); }, title: "推奨加算率" + (_ukiReco.n ? "（" + _ukiReco.n + "件）" : "") + "・データ不足時50%",
          style: { padding: "2px 6px", fontSize: 10, fontWeight: _ukiRecoAct ? 800 : 600, borderRadius: 5, cursor: "pointer", lineHeight: 1.2, whiteSpace: "nowrap", border: _ukiRecoAct ? "2px solid #15803D" : "1px solid #ddd", background: _ukiRecoAct ? "#EAF3DE" : "#fff", color: _ukiRecoAct ? "#15803D" : "#999" } }, "推奨" + (_ukiReco.reco != null ? _ukiReco.reco : 50) + "%") : null,
        (nUkiUsed === "○" && _ukiReco.byBand) ? React.createElement("span", { title: "この日のこの銘柄の株価帯（" + _ukiReco.bandLabel + "円）と同じ帯の記録" + _ukiReco.n + "件（銘柄横断）から算出。帯の記録が" + _EL_BASE_MIN_N + "件未満・帯不明・⚡固有材料日は全銘柄プールに戻ります",
          style: { fontSize: 9, fontWeight: 700, color: "#0369A1", background: "#E0F2FE", border: "1px solid #BAE6FD", borderRadius: 4, padding: "1px 4px", whiteSpace: "nowrap" } }, "💴 " + _ukiReco.bandLabel + "円") : null,
        (nUkiUsed === "○" && _ukiReco.runnerUp != null) ? React.createElement("button", { type: "button", onClick: function() { setNUkiPct(String(_ukiReco.runnerUp)); }, title: "次点の加算率",
          style: { padding: "2px 6px", fontSize: 10, fontWeight: _ukiRunAct ? 800 : 600, borderRadius: 5, cursor: "pointer", lineHeight: 1.2, whiteSpace: "nowrap", border: _ukiRunAct ? "2px solid #0369A1" : "1px solid #ddd", background: _ukiRunAct ? "#EFF6FF" : "#fff", color: _ukiRunAct ? "#0369A1" : "#999" } }, "次点" + _ukiReco.runnerUp + "%") : null,
        nUkiUsed === "○" ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", border: _ukiCustAct ? "2px solid #B45309" : "1px solid #ddd", borderRadius: 5, overflow: "hidden", background: "#fff" } },
          React.createElement("input", { type: "text", inputMode: "numeric", value: _ukiCustAct ? nUkiPct : "", onChange: function(e) { _setNUkiPct(e.target.value); }, placeholder: "50", style: { width: 30, padding: "2px 4px", fontSize: 10, fontWeight: 700, border: "none", outline: "none", background: "transparent", textAlign: "right", color: "#B45309" } }),
          React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", paddingRight: 3 } }, "%"),
          _stepBtn(function() { _stepNUkiPct(10); }, function() { _stepNUkiPct(-10); })) : null,
        nUkiUsed === "○" ? React.createElement("button", { type: "button", onClick: function() { _setEpnUkiTbl(true); }, title: "浮き足加算率の詳細データ表（全銘柄・前日まで＝推奨%と同母数）", style: { fontSize: 10, fontWeight: 700, color: "#15803D", background: "#fff", border: "1px solid #86EFAC", borderRadius: 5, padding: "2px 8px", cursor: "pointer", whiteSpace: "nowrap" } }, "📊 詳細表") : null
      ) : null,
      (nUkiUsed === "○") ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },   // 3段目: 底抜け前足−底抜けライン＋浮き○円→＋×円 2026-07-21（底抜け前足はグレー＝底抜けラインに統一）
        nUkiUsed === "○" ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3 } },
          React.createElement("span", { style: { fontSize: 10, color: "#64748B", fontWeight: 700 } }, "底抜け前足"),
          React.createElement("input", { type: "text", inputMode: "decimal", value: nUkiPrev, placeholder: "—",
            onChange: function(e) { setNUkiPrev(_toHankakuDecimal(e.target.value)); }, style: Object.assign({}, _inpStyle, { width: 58 }) }),
          _stepBtn(function() { setNUkiPrev(function(v) { return String((parseFloat(v) || 0) + 1); }); }, function() { setNUkiPrev(function(v) { return String(Math.max(0, (parseFloat(v) || 0) - 1)); }); })) : null,
        nUkiUsed === "○" ? React.createElement("span", { style: { fontSize: 11, color: "#94A3B8", fontWeight: 700 } }, "−") : null,
        nUkiUsed === "○" ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3 } },
          React.createElement("span", { style: { fontSize: 10, color: "#64748B", fontWeight: 700 } }, "底抜けライン"),
          React.createElement("input", { type: "text", inputMode: "decimal", value: nLevel, placeholder: "水準線",
            onChange: function(e) { setNLevel(_toHankakuDecimal(e.target.value)); }, style: Object.assign({}, _inpStyle, { width: 58 }) }),
          _stepBtn(function() { setNLevel(function(v) { return String(Math.round(((parseFloat(v) || 0) + 1) * 100) / 100); }); }, function() { setNLevel(function(v) { return String(Math.max(0, Math.round(((parseFloat(v) || 0) - 1) * 100) / 100)); }); })) : null,
        nUkiUsed === "○" ? React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#15803D", whiteSpace: "nowrap", background: "#EAF3DE", borderRadius: 5, padding: "2px 7px" } }, "浮き " + ((nUkiVal !== "" && !isNaN(Number(nUkiVal))) ? Number(nUkiVal) : 0) + "円") : null,
        nUkiUsed === "○" ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#14532D" } }, "→ +" + ukiAddV + "円") : null
      ) : null,
      (nUkiUsed === "○" && _epnUkiTbl) ? React.createElement("div", { onClick: function() { _setEpnUkiTbl(false); }, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 10001, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" } }, React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: "#fff", borderRadius: 10, padding: 14, maxWidth: 760, width: "100%", maxHeight: "88vh", overflowY: "auto" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 } }, React.createElement("span", { style: { fontSize: 12.5, fontWeight: 800, color: "#15803D" } }, "⚡ " + (nUkiSpecial ? "浮き足応用" : "浮き足基本") + "加算率 詳細データ（全銘柄・前日まで）"), React.createElement("button", { type: "button", onClick: function() { _setEpnUkiTbl(false); }, style: { fontSize: 12, fontWeight: 700, border: "1px solid #ddd", borderRadius: 6, background: "#f5f4f0", padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap" } }, "閉じる")), React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", marginBottom: 6 } }, "浮き足に入力した値の何％を加算すると最終損益が良かったか（0〜100%・10刻み）。★＝推奨加算率＝" + (nUkiSpecial ? "浮き足応用" : "浮き足基本") + "の記録が母数（全銘柄・前日まで）。"), _elUkiPctBoardScoped(_elCollectAllSignals(data).filter(function(r) { return r && (!date || r.date < date); }), function(r) { return _elAlphaInfo(r, data); }, nUkiSpecial ? "special" : "basic", null, _buildHolidayDateSet(data.trades, (data.custom || {}).eventCategories)))) : null)) : null,
    // ⑤ライン併存ルール欄は廃止（2026-07-16）＝新規EPで〇にできない。過去の lineCoexist は保存のまま（記録一覧の「併存」バッジ_elAlphaTypeCellで識別・基本α自動1入力も廃止）。
    // 採用α（基本α/応用α セレクタ・記録フォームと同じ 2026-07-13・旧「基本α入力＋📊応用α詳細ボタン＋応用α〇×」を統合。応用α詳細表は上「本日の採用α値」の応用α『表を参照』で代替）
    (nUkiUsed !== "○") ? _lrow("採用α", React.createElement("div", null,
      React.createElement("div", { style: { display: "inline-flex", background: "#EFEBE4", borderRadius: 9, padding: 3, gap: 3, marginBottom: 5 } },
        [["base", "基本α", "#0369A1"], ["special", "応用α", "#9A3412"]].map(function(_kk) {
          var _on = (_kk[0] === "special") === (nSpecialUsed === "○");
          return React.createElement("button", { key: _kk[0], type: "button", title: _kk[0] === "base" ? "通常はこちら＝基本α値を採用" : "応用α値を採用",
            onClick: (function(_k) { return function() { setNSpecialUsed(_k === "special" ? "○" : "×"); }; })(_kk[0]),
            style: { padding: "4px 14px", fontSize: 12, fontWeight: 800, borderRadius: 7, cursor: "pointer", border: "none", background: _on ? "#fff" : "transparent", color: _on ? _kk[2] : "#6B6459", boxShadow: _on ? "0 1px 3px rgba(0,0,0,.12)" : "none" } }, _kk[1]);
        })),
      nSpecialUsed !== "○" ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" } },
        React.createElement("input", { type: "text", inputMode: "numeric", value: nBase, placeholder: _baseDefault != null ? String(_baseDefault) : "—",
          onChange: function(e) { var v = _toHankakuNum(e.target.value); if (v === "" || !isNaN(Number(v))) setNBase(v); }, style: _inpStyle }),
        React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, "円"),
        _stepBtn(function() { setNBase(function(prev) { var b = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : (_baseDefault != null ? _baseDefault : 0); var n = b + 1; if (n > 50) n = 50; return String(n); }); },
          function() { setNBase(function(prev) { var b = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : (_baseDefault != null ? _baseDefault : 0); var n = b - 1; if (n < 0) n = 0; return String(n); }); }),
        React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "空欄＝" + (dayAlpha != null ? "本日の採用α値" : "推奨値") + "を自動採用")) : null,
      nSpecialUsed === "○" ? React.createElement("div", null,
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
          React.createElement("input", { type: "text", inputMode: "numeric", value: nSpecialAlpha, placeholder: specialReco && specialReco.v != null ? String(specialReco.v) : (baseV != null ? String(baseV) : "0"),
            onChange: function(e) { var v = _toHankakuNum(e.target.value); if (v === "" || !isNaN(Number(v))) setNSpecialAlpha(v); }, style: Object.assign({}, _inpStyle, { width: 44 }) }),
          React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, "円"),
          _stepBtn(function() { setNSpecialAlpha(function(prev) { var b = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : ((specialReco && specialReco.v != null) ? specialReco.v : (baseV != null ? baseV : 0)); var n = b + 1; if (n > 50) n = 50; return String(n); }); },
            function() { setNSpecialAlpha(function(prev) { var b = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : ((specialReco && specialReco.v != null) ? specialReco.v : (baseV != null ? baseV : 0)); var n = b - 1; if (n < 0) n = 0; return String(n); }); })),
        React.createElement("div", { style: { marginTop: 4 } },
          React.createElement("div", { style: { fontSize: 9.5, color: specialReco ? "#9A3412" : "#94A3B8", marginTop: 3 } },
            specialReco ? (specialReco.nomin ? "推奨応用α ー（条件適合無し）" : ("推奨応用α " + specialReco.v + "円" + (specialReco.byReason ? "（選択根拠・n=" + specialReco.n + "・空欄＝自動採用）" : specialReco.fellBack ? "（根拠別はデータ不足→銘柄全体・n=" + specialReco.n + "・空欄＝自動採用）" : "（銘柄全体・n=" + specialReco.n + "・空欄＝自動採用）"))) : "推奨応用α データ無し（空欄＝基本α）"))) : null)) : null,
    _lrow("RN加算", React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },   // RN加算欄（浮き足加算の下＝α加算系の最後・予定EPの直前）2026-07-08h。〇で入力値をそのまま実効αに加算。
      _oxBtns(nRnUsed, function(v) { setNRnAuto(false); setNRnUsed(v); if (v === "○" && nRnVal === "") setNRnVal("5"); }),   // 手動操作＝自動判定を止める 2026-07-20b
      nRnUsed === "○" ? React.createElement("input", { type: "text", inputMode: "numeric", value: nRnVal, placeholder: "5",
        onChange: function(e) { setNRnAuto(false); var v = _toHankakuNum(e.target.value); if (v === "") { setNRnVal(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 50) n = 50; if (n < 0) n = 0; setNRnVal(String(n)); }, style: Object.assign({}, _inpStyle, { width: 48 }) }) : null,
      nRnUsed === "○" ? _stepBtn(function() { setNRnAuto(false); setNRnVal(function(prev) { var base = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : 0; var n = base + 1; if (n > 50) n = 50; return String(n); }); }, function() { setNRnAuto(false); setNRnVal(function(prev) { var base = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : 0; var n = base - 1; if (n < 0) n = 0; return String(n); }); }) : null,
      nRnUsed === "○" ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#1D4ED8" } }, "→ +" + rnAddV + "円") : null,
      // 2026-07-20b 自動判定の状態（記録フォームと同じ挙動）。自動中＝バッジ／手動中＝「↺自動」で復帰。
      nRnAuto
        ? React.createElement("span", { title: "予定EP（水準線＋基底α＋浮き足加算）の下二桁が41〜49／91〜99なら自動で〇にして…50/…00ちょうどまで加算します。〇×か数値を手で変えると自動は止まります。", style: { fontSize: 9, fontWeight: 700, color: "#1D4ED8", background: "#DBEAFE", border: "1px solid #93C5FD", borderRadius: 5, padding: "1px 6px", whiteSpace: "nowrap" } },
            _nRnAutoAdd == null ? "自動：水準線値待ち" : (_nRnAutoAdd > 0 ? "自動判定中" : "自動判定中（対象外）"))
        : React.createElement("button", { type: "button", onClick: function() { setNRnAuto(true); }, title: "自動判定に戻す",
            style: { fontSize: 9, fontWeight: 700, color: "#B45309", background: "#FFF7ED", border: "1px solid #FDBA74", borderRadius: 5, padding: "1px 7px", cursor: "pointer", whiteSpace: "nowrap" } }, "↺ 自動に戻す"))),
    React.createElement("div", { style: { margin: "8px 0 6px", padding: "7px 6px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, textAlign: "center" } },
      React.createElement("span", { style: { fontSize: 10, color: "#1D4ED8", fontWeight: 800 } }, "予定EP "),
      React.createElement("span", { style: { fontSize: 20, fontWeight: 800, color: "#1E3A8A", fontVariantNumeric: "tabular-nums" } }, epV != null ? String(epV) : "—"),
      React.createElement("span", { style: { fontSize: 10, color: "#1D4ED8" } }, "円"),
      effA != null ? React.createElement("div", { style: { fontSize: 9, color: "#3B82F6", marginTop: 1 } }, (nUkiUsed === "○")
        ? ("合計α値" + effA + "円＝" + (nUkiSpecial ? "浮応" : "浮") + ukiAddV + (rnAddV ? "＋RN" + rnAddV : "") + "（浮き足〇＝基本α/応用α無し）")
        : ("合計α値" + effA + "円＝" + (specialV != null ? ("応用" + specialV) : ("基" + (baseV != null ? baseV : 0))) + (ukiAddV ? "＋浮" + ukiAddV : "") + (rnAddV ? "＋RN" + rnAddV : "") + (nBase === "" && specialV == null ? (dayAlpha != null ? "・本日採用α" : (autoPick.src ? "・推奨" + autoPick.src : "")) : "")))
        : React.createElement("div", { style: { fontSize: 9, color: "#94A3B8", marginTop: 1 } }, baseV == null ? "記録が無い銘柄は基本αを手入力" : "水準線を入力")),
    React.createElement("div", { style: { margin: "0 0 6px", padding: "6px 6px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, textAlign: "center" } },   // 予定損切りライン＝予定EP＋損切り値（逆行したら撤退する価格の目安＝引き金であって約定値ではない・触れた足の終値で撤退）2026-07-18／2026-07-29 終値撤退方式へ文言追従
      React.createElement("span", { style: { fontSize: 10, color: "#B91C1C", fontWeight: 800 } }, "予定損切りライン "),
      React.createElement("span", { style: { fontSize: 17, fontWeight: 800, color: "#991B1B", fontVariantNumeric: "tabular-nums" } }, epV != null ? String(Math.round((epV + _epnCutLine) * 100) / 100) : "—"),
      React.createElement("span", { style: { fontSize: 10, color: "#B91C1C" } }, "円"),
      epV != null ? React.createElement("div", { style: { fontSize: 9, color: "#EF4444", marginTop: 1 } }, "予定EP" + epV + "＋損切り" + _epnCutLine) : null),
    React.createElement("button", { type: "button", onClick: doSave, disabled: epV == null,
      style: { width: "100%", padding: "7px 0", fontSize: 12, fontWeight: 800, background: epV != null ? (editId ? "#B45309" : "#1D4ED8") : "#E2E8F0", color: epV != null ? "#fff" : "#94A3B8", border: "none", borderRadius: 6, cursor: epV != null ? "pointer" : "default", minHeight: IS_TOUCH ? 38 : 28 } }, editId ? "💾 更新保存" : "💾 保存（早見に追加）"), _spModal);
}
function EpNaviPanel(_refEPN) {
  var data = _refEPN.data, save = _refEPN.save, date = _refEPN.date, stocks = _refEPN.stocks;
  var custom = data.custom || EMPTY.custom;
  var signalTags = (custom && Array.isArray(custom.signalTags)) ? custom.signalTags : [];
  var reasonsMaster = (custom && Array.isArray(custom.specialReasons)) ? custom.specialReasons : _DEF_SPECIAL_REASONS;
  var _EPN_MAX_STOCKS = 3;
  // 早見に横並び表示する銘柄（最大3・EPナビの「⚙表示銘柄」で選択＝custom.epnStocksに保存・Firebase同期）。
  // 未設定時の既定＝全銘柄の先頭3（日替わり銘柄rotatingStocksは固定表示の既定から除外＝rotStocksの日替わり列へ・ピッカーで戻せる）2026-07-23一般化（旧: 「古河電工」をハードコード除外）。
  var _epnAllStocks = (stocks && stocks.length) ? stocks : [];
  var _epnRot = Array.isArray(custom.rotatingStocks) ? custom.rotatingStocks : [];
  var epnStocks = (custom && Array.isArray(custom.epnStocks) && custom.epnStocks.length)
    ? custom.epnStocks.filter(function(s) { return _epnAllStocks.indexOf(s) >= 0; }).slice(0, _EPN_MAX_STOCKS)
    : _epnAllStocks.filter(function(s) { return _epnRot.indexOf(s) < 0; }).slice(0, _EPN_MAX_STOCKS);
  // 日替わり列（📅・右端 2026-07-22i・ユーザー要望）: custom.rotatingStocks＝候補プール（マスター実在のみ・日経＋固定表示銘柄は除外＝二重表示回避）。見出しの▽で1銘柄を選び右端の列に表示（表示のみ＝指定dailyStock/合計算入は変えない）。
  var rotStocks = (Array.isArray(custom.rotatingStocks) ? custom.rotatingStocks : []).filter(function(s) { return _epnAllStocks.indexOf(s) >= 0 && s !== "日経平均株価" && epnStocks.indexOf(s) < 0; });
  var _hasRot = rotStocks.length > 0;
  var _dayStock = _dailyStockGet(data, date);   // その日の指定銘柄（合計算入）。▽の既定表示に使う（指定は変えない）
  var _rotDefault = (_dayStock && rotStocks.indexOf(_dayStock) >= 0) ? _dayStock : (rotStocks[0] || "");
  var _epnStockToggle = function(st) {
    var cur = epnStocks.slice();
    var i = cur.indexOf(st);
    if (i >= 0) cur.splice(i, 1);
    else { if (cur.length >= _EPN_MAX_STOCKS) return; cur.push(st); }
    save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { epnStocks: cur }) }); });
  };
  var _epnStockReorder = function(list) {
    save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { epnStocks: list.slice() }) }); });
  };
  // 計算フォームは銘柄列ごとに常設（_EpnCalcForm 2026-07-08）＝旧単一計算パネルのフォーム状態（epnOpen/nStock/nTag等）は各フォームへ移設。
  var _useStateEPN13 = useState(null), _useStateEPN13A = _slicedToArray(_useStateEPN13, 2), delArm = _useStateEPN13A[0], setDelArm = _useStateEPN13A[1];
  var _useStateEPNsp = useState(false), _useStateEPNspA = _slicedToArray(_useStateEPNsp, 2), showStockPicker = _useStateEPNspA[0], setShowStockPicker = _useStateEPNspA[1];
  var _useStateEPNso = useState(null), _useStateEPNsoA = _slicedToArray(_useStateEPNso, 2), _stkOrd = _useStateEPNsoA[0], setStkOrd = _useStateEPNsoA[1];
  // 旧 tableStock state は削除（_tableModal を死コード化＝未使用・表参照は_ElDayAlphaPairへ集約）2026-07-22j
  var _uRotSel = useState(""), rotSelRaw = _uRotSel[0], setRotSelRaw = _uRotSel[1];   // 日替わり列の表示銘柄（端末ローカル・表示のみ）2026-07-22i
  useEffect(function() { setRotSelRaw(_epnRotGet(date)); }, [date]);   // 日付ごとにlocalStorageの表示選択を読込（未設定/失効時は下の_rotSelで指定銘柄→候補先頭にフォールバック）
  var _rotSel = (rotSelRaw && rotStocks.indexOf(rotSelRaw) >= 0) ? rotSelRaw : _rotDefault;
  var _delTimerRef = useRef(null);
  var _stkDragRef = useRef(null), _stkMovedRef = useRef(false);
  useEffect(function() { return function() { if (_delTimerRef.current) clearTimeout(_delTimerRef.current); }; }, []);
  // 各列フォームのAPI（loadForEdit/onDeleted）をrefマップで保持＝カードタップ編集読込・削除通知を命令的に連携（再レンダー不要）。
  var _formApisRef = useRef({});
  var _regForm = function(st, api) { if (api) _formApisRef.current[st] = api; else delete _formApisRef.current[st]; };
  // 早見カードのインライン編集（③起点/④その他/⑤ライン併存/追加α）＝「編集」ボタン無しで直接編集・変更は即_epnPut保存。EPは③④⑤で推奨基本αを再導出（_epnRecalcBase・ライン併存ルール〇→1）、追加αは直接再計算。
  // 2026-07-30: α（＝予定EP）が動く編集は _epnApplyRnAuto を通す＝RN加算を自動で乗せ直す（rnAuto:false＝手動のカードは据え置き）。
  var onEditK = function(st, e, k) { _epnPut(save, date, st, _epnApplyRnAuto(_epnRecalcBase(data, st, date, Object.assign({}, e, { k: k || null })))); };
  var onToggleF = function(st, e, f) {
    var cur = Array.isArray(e.f) ? e.f.slice() : []; var i = cur.indexOf(f);
    if (i >= 0) cur.splice(i, 1); else cur.push(f);
    _epnPut(save, date, st, _epnApplyRnAuto(_epnRecalcBase(data, st, date, Object.assign({}, e, { f: cur }))));
  };
  // ライン併存ルール 〇×（早見カード 2026-07-08g）: 〇＝lineCoexist:true→_epnRecalcBaseで基本α1・EP再計算／×＝false→推奨基本αを再導出。計算欄⑤と同ルール。
  var onSetLineCoexist = function(st, e, used) {
    _epnPut(save, date, st, _epnApplyRnAuto(_epnRecalcBase(data, st, date, Object.assign({}, e, { lineCoexist: !!used }))));
  };
  var onSetSpecial = function(st, e, newSpecial) {
    var nS = Math.max(0, Number(newSpecial) || 0);
    var uki = Number(e.uki) || 0, level = Number(e.level) || 0, rn = Number(e.rn) || 0;
    _epnPut(save, date, st, _epnApplyRnAuto(Object.assign({}, e, { special: nS, specialUsed: true, ep: _epnComputeEp(level, nS, uki, rn) })));   // base-levelα=応用α=nS
  };
  // 基本α値のインライン編集（早見カード 2026-07-14 採用αセレクタ化）: 基本α選択時（specialUsed=false）に基本α値を直接編集＝base-levelα=基本αでEP再計算。
  var onSetBase = function(st, e, newBase) {
    var nB = Math.max(0, Number(newBase) || 0);
    var uki = Number(e.uki) || 0, level = Number(e.level) || 0, rn = Number(e.rn) || 0;
    _epnPut(save, date, st, _epnApplyRnAuto(Object.assign({}, e, { base: nB, ep: _epnComputeEp(level, nB, uki, rn) })));
  };
  // 応用α 〇×トグル（計算欄と同じ仕組み 2026-07-08f→2026-07-13応用α化）: 選択時のデフォルト値は「本日の採用α値」を最優先（2026-07-23・計算フォームと揃える）。〇＝本日の採用応用α値（無ければ推奨応用α→基本α）／×＝本日の採用α値（無ければ既存の基本α値）でEP再計算・根拠クリア。値・根拠はあとで手動変更可。
  var onSetSpecialUsed = function(st, e, used) {
    var base = Number(e.base) || 0, uki = Number(e.uki) || 0, level = Number(e.level) || 0, rn = Number(e.rn) || 0;
    if (used) {
      var _daySp = _epnDaySpecialAlphaGet(data, st, date);   // 本日の採用応用α値を最優先（無ければ推奨応用α→基本α）2026-07-23
      var nS;
      if (_daySp != null) { nS = _daySp; }
      else { var reco = _epnSpecialReco(data, st, date, e.tag, { b: e.b || null, k: e.k || null, f: Array.isArray(e.f) ? e.f : [] }, Array.isArray(e.specialReasons) ? e.specialReasons : []); nS = (reco && reco.v != null) ? reco.v : base; }
      _epnPut(save, date, st, _epnApplyRnAuto(Object.assign({}, e, { specialUsed: true, special: nS, ep: _epnComputeEp(level, nS, uki, rn) })));
    } else {
      var _dayB = _epnDayAlphaGet(data, st, date);   // 本日の採用α値（基本α）を最優先（無ければ既存の基本α値）2026-07-23
      var nB = (_dayB != null) ? _dayB : base;
      _epnPut(save, date, st, _epnApplyRnAuto(Object.assign({}, e, { specialUsed: false, special: null, specialReasons: [], base: nB, ep: _epnComputeEp(level, nB, uki, rn) })));
    }
  };
  // RN加算 〇×＋値（早見カード 2026-07-08h）: 〇＝rn値（既定5・既存値あればそれ）を入れてEP再計算／×＝rn0。追加α・ライン併存と同じ即_epnPut保存パターン。
  // 2026-07-30: 手動で〇×/値に触ったら rnAuto:false＝以後このカードでは自動判定を止める（計算フォーム・記録フォームと同じ規約）。「↺自動」で復帰。
  var onSetRnUsed = function(st, e, used) {
    var uki = Number(e.uki) || 0, level = Number(e.level) || 0, bl = _epnBaseLevelOf(e);   // base-levelα(応用〇なら応用α)で統一＝RN操作で応用α分が落ちる不整合を修正 2026-07-14（旧: base固定＋廃止add項）
    if (used) {
      var nR = (Number(e.rn) || 0) > 0 ? Number(e.rn) : 5;
      _epnPut(save, date, st, Object.assign({}, e, { rnUsed: true, rn: nR, rnAuto: false, ep: _epnComputeEp(level, bl, uki, nR) }));
    } else {
      _epnPut(save, date, st, Object.assign({}, e, { rnUsed: false, rn: 0, rnAuto: false, ep: _epnComputeEp(level, bl, uki, 0) }));
    }
  };
  var onSetRn = function(st, e, newRn) {
    var nR = Math.max(0, Number(newRn) || 0);
    var uki = Number(e.uki) || 0, level = Number(e.level) || 0, bl = _epnBaseLevelOf(e);
    _epnPut(save, date, st, Object.assign({}, e, { rn: nR, rnUsed: true, rnAuto: false, ep: _epnComputeEp(level, bl, uki, nR) }));
  };
  // 「↺自動」: 自動判定に戻して即その場で乗せ直す（判定不可なら値は据え置き＝フラグだけ戻る）2026-07-30
  var onSetRnAuto = function(st, e) {
    _epnPut(save, date, st, _epnApplyRnAuto(Object.assign({}, e, { rnAuto: true })));
  };
  var onToggleReason = function(st, e, nm) {
    var cur = Array.isArray(e.specialReasons) ? e.specialReasons.slice() : []; var i = cur.indexOf(nm);
    if (i >= 0) cur.splice(i, 1); else cur.push(nm);
    _epnPut(save, date, st, Object.assign({}, e, { specialReasons: cur, specialUsed: true }));
  };
  var _rsnAddG = function(nm) { save(function(prev) { return _rsnAddData(prev, nm); }); };
  var _rsnDeleteG = function(nm) { save(function(prev) { return _rsnDeleteData(prev, nm); }); };
  var _rsnReorderG = function(list) { save(function(prev) { return _rsnReorderData(prev, list); }); };
  var _rsnRenameG = function(oldNm, newNm) { save(function(prev) { return _rsnRenameData(prev, oldNm, newNm); }); };
  // 編集中（editId）を銘柄→id で保持＝該当カードの「編集」を「💾保存」に切替＋そのカードのインライン編集を抑止（フォーム編集との二重編集の衝突回避）。
  var _useStateEPNem = useState({}), _useStateEPNemA = _slicedToArray(_useStateEPNem, 2), _editingMap = _useStateEPNemA[0], setEditingMap = _useStateEPNemA[1];
  var _onFormEditing = function(st, eid) {
    setEditingMap(function(m) {
      var cur = m[st] || null, nv = eid || null;
      if (cur === nv) return m;
      var n = Object.assign({}, m); if (nv == null) delete n[st]; else n[st] = nv; return n;
    });
  };
  // 早見: 銘柄ごとにまとめ、各銘柄内はEP高い順。銘柄の並びは「その銘柄の最高EP」の降順。
  var savedByStock = useMemo(function() {
    var map = {};
    var suf = "_" + date;
    var charts = data.charts || {};
    Object.keys(charts).forEach(function(ck) {
      var pos = ck.length - suf.length;
      if (pos <= 0 || ck.indexOf(suf, pos) !== pos) return;
      var arr = (charts[ck] || {}).epNavi;
      if (!Array.isArray(arr)) return;
      var st = ck.slice(0, pos);
      arr.forEach(function(e) { if (e && e.id != null) (map[st] = map[st] || []).push(e); });
    });
    // 並び: 未済みをEP高い順→その下に済み（済み同士もEP高い順）2026-07-08b
    Object.keys(map).forEach(function(st) { map[st].sort(function(a, b) {
      var d = (a.done ? 1 : 0) - (b.done ? 1 : 0);
      if (d) return d;
      return (Number(b.ep) || 0) - (Number(a.ep) || 0);
    }); });
    var order = Object.keys(map).sort(function(a, b) { return (map[b][0] ? Number(map[b][0].ep) || 0 : 0) - (map[a][0] ? Number(map[a][0].ep) || 0 : 0); });
    return { map: map, stocks: order };
  }, [data.charts, date]);
  // ×は2タップ確認（window.confirmはiPad standaloneで無反応のため使わない）。削除後は該当列フォームへ通知＝編集中なら解除。
  var onDel = function(stock, id) {
    if (delArm === id) {
      if (_delTimerRef.current) { clearTimeout(_delTimerRef.current); _delTimerRef.current = null; }
      setDelArm(null);
      _epnDelete(save, stock, date, id);
      var _api = _formApisRef.current[stock];
      if (_api) _api.onDeleted(id);
    } else {
      setDelArm(id);
      if (_delTimerRef.current) clearTimeout(_delTimerRef.current);
      _delTimerRef.current = setTimeout(function() { setDelArm(null); }, 3000);
    }
  };
  // 「済」トグル: 押すと灰色に薄く＋列の一番下へ（再タップで解除）。_epnPut（同一id除去→追加）でid/at維持のまま更新＝Firebase同期。
  var onDone = function(st, e) {
    var ne = Object.assign({}, e);
    if (ne.done) delete ne.done; else ne.done = true;
    _epnPut(save, date, st, ne);
  };
  // 保存済みEPカード（面=分足色: 5分=黄緑(lime)/1分=オレンジ・EP数字=採用α色(基本α=青#1D4ED8/応用α=赤#B91C1C・分足に依らず)・済み=灰色薄く 2026-07-24。旧: 面=分足色(5分緑)/応用αのみEP赤 2026-07-08b）
  var _renderCard = function(st, e) {
    var hasSpecial = e.specialUsed === true && !((e.ukiUsed === true) || ((Number(e.uki) || 0) > 0));   // 2026-07-14g 浮き足〇カードは応用α扱いにしない（旧保存の残特殊フラグも無視）
    var mb = Array.isArray(e.minBars) ? e.minBars : [];
    var has5 = mb.indexOf("5") >= 0, has1 = mb.indexOf("1") >= 0;
    var isDone = !!e.done;
    var _isUkiCard = (e.ukiUsed === true) || ((Number(e.uki) || 0) > 0);   // 2026-07-14g 浮き足〇カード＝土台α無し（採用α＝浮き足加算＋RN）
    var _cardBL = _epnBaseLevelOf(e);   // base-levelα（浮き足〇＝0／応用〇＝応用α／通常＝基本α）
    var alphaSum = _cardBL + (Number(e.uki) || 0) + (Number(e.rn) || 0);
    var bk = _isUkiCard
      ? ((e.ukiSpecial === true ? "浮応" : "浮") + (Number(e.uki) || 0) + (e.rn ? "＋RN" + e.rn : ""))   // 浮き足〇＝基本α/応用α無し・浮き足加算＋RNのみ
      : ((e.specialUsed === true && e.special != null ? "応" + e.special : "基" + (e.base != null ? e.base : "—")) + (e.uki ? "＋浮" + e.uki : "") + (e.rn ? "＋RN" + e.rn : ""));
    var armed = delArm === e.id;
    var C = has5
      ? { bd: "#A3E635", bg: "#F7FEE7", main: "#4D7C0F", sub: "#65A30D", bbg: "#ECFCCB", bc: "#3F6212" }   // 5分＝黄緑(lime) 2026-07-24
      : { bd: "#FDBA74", bg: "#FFF7ED", main: "#C2410C", sub: "#EA580C", bbg: "#FFEDD5", bc: "#9A3412" };   // 1分＝オレンジ
    if (isDone) C = { bd: "#CBD5E1", bg: "#F1F5F9", main: "#94A3B8", sub: "#94A3B8", bbg: "#E2E8F0", bc: "#94A3B8" };
    var _applied = _isUkiCard ? (e.ukiSpecial === true) : (e.specialUsed === true);   // 応用α相当か（浮き足カードは浮応＝応用扱い）2026-07-24
    var epColor = isDone ? C.main : (_applied ? "#B91C1C" : "#1D4ED8");   // EP数字の色＝採用α: 基本α=青/応用α=赤（分足に依らず・済=灰）2026-07-24
    var subColor = C.sub;   // 起点行は分足色のまま（EP数字だけでαを示す）2026-07-24
    var mbBadge = (has5 || has1) ? React.createElement("span", { style: { fontSize: 8, fontWeight: 800, borderRadius: 3, padding: "0 3px", marginRight: 3, color: C.bc, background: C.bbg, border: "0.5px solid " + C.bd } }, mb.join("・") + "分") : null;
    var _isEditingThis = _editingMap[st] === e.id;
    var _cand = (custom.sigDetails2 || {})[e.tag] || {};
    var _candK = Array.isArray(_cand.k) ? _cand.k.slice() : [];
    if (e.k && _candK.indexOf(e.k) < 0) _candK.unshift(e.k);
    var _candF = Array.isArray(_cand.f) ? _cand.f.slice() : [];
    (e.f || []).forEach(function(x) { if (_candF.indexOf(x) < 0) _candF.push(x); });
    // 早見カードのインライン編集（③起点=select単一/④その他=トグルチップ/⑤ライン併存=〇×/追加α=計算欄と同じ〇×→根拠 2026-07-08f→g）＝「編集」ボタン無しで直接編集・即保存。フォーム編集中（_isEditingThis）は抑止し「下の計算フォームで編集中」表示。
    var _inlineEditor = _isEditingThis
      ? React.createElement("div", { style: { fontSize: 8.5, color: "#B45309", marginTop: 4, fontWeight: 700 } }, "✎ 下の計算フォームで編集中（💾保存で確定）")
      : React.createElement("div", { style: { marginTop: 4, paddingTop: 4, borderTop: "1px dashed " + C.bd, display: "flex", flexDirection: "column", gap: 3 } },
          // ライン併存ルール（早見カード）欄は廃止（2026-07-16）＝新規EPで〇にできない。過去の識別は記録一覧の「併存」バッジ（_elAlphaTypeCell）。onSetLineCoexistは未使用となるが保持（無害）。
          _isUkiCard ? null : React.createElement(_EpnAddSection, { data: data, save: save, date: date, stock: st, item: e, reasonsMaster: reasonsMaster,
            onUsed: function(u) { onSetSpecialUsed(st, e, u); },
            onValue: function(n) { onSetSpecial(st, e, n); },
            onBase: function(n) { onSetBase(st, e, n); },
            onToggleReason: function(nm) { onToggleReason(st, e, nm); },
            onAddReason: _rsnAddG, onRenameReason: _rsnRenameG, onDeleteReason: _rsnDeleteG, onReorderReason: _rsnReorderG }),
          React.createElement(_EpnRnSection, { item: e, onUsed: function(u) { onSetRnUsed(st, e, u); }, onValue: function(n) { onSetRn(st, e, n); }, onAuto: function() { onSetRnAuto(st, e); } }));
    return React.createElement("div", { key: e.id, style: { border: "1px solid " + C.bd, borderRadius: 6, padding: "5px 7px", background: C.bg, marginBottom: 5, opacity: isDone ? 0.72 : 1 } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 } },
        React.createElement("span", { style: { display: "flex", alignItems: "center", minWidth: 0, flex: 1 } }, mbBadge,
          e.tag ? React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, color: isDone ? "#94A3B8" : "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.tag) : null,
          hasSpecial ? React.createElement("span", { style: { fontSize: 8.5, fontWeight: 800, color: isDone ? "#94A3B8" : "#DC2626", marginLeft: 3 } }, "応") : null),
        React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 3, flexShrink: 0 } },
          _isEditingThis
            ? React.createElement("button", { type: "button", onClick: function(ev) { ev.stopPropagation(); var _api = _formApisRef.current[st]; if (_api && _api.save) _api.save(); }, title: "下の計算フォームで編集中の内容をこのEPに上書き保存",
                style: { padding: "1px 7px", fontSize: 9.5, fontWeight: 800, lineHeight: 1.5, border: "1.5px solid #B45309", background: "#B45309", color: "#fff", borderRadius: 4, cursor: "pointer", minHeight: IS_TOUCH ? 24 : 18 } }, "💾保存")
            : React.createElement("button", { type: "button", onClick: function(ev) { ev.stopPropagation(); var _api = _formApisRef.current[st]; if (_api) { _api.loadForEdit(e); if (_api.focus) _api.focus(); } }, title: "計算フォームに読み込んで全体を編集（基準分足・シグナル・水準線・基本α等も）",
                style: { padding: "1px 6px", fontSize: 9.5, fontWeight: 800, lineHeight: 1.5, border: "1px solid #93C5FD", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, cursor: "pointer", minHeight: IS_TOUCH ? 24 : 18 } }, "編集"),
          React.createElement("button", { type: "button", onClick: function(ev) { ev.stopPropagation(); onDone(st, e); }, title: isDone ? "済みを解除（未済みに戻して上へ）" : "済みにする（薄い灰色で一番下へ）",
            style: { padding: "1px 6px", fontSize: 9.5, fontWeight: 800, lineHeight: 1.5, border: isDone ? "1.5px solid #64748B" : "1px solid #CBD5E1", background: isDone ? "#64748B" : "#fff", color: isDone ? "#fff" : "#94A3B8", borderRadius: 4, cursor: "pointer", minHeight: IS_TOUCH ? 24 : 18 } }, "済"),
          React.createElement("button", { type: "button", onClick: function(ev) { ev.stopPropagation(); onDel(st, e.id); }, title: armed ? "もう一度タップで削除" : "この保存EPを削除（2タップ確認）",
            style: { padding: "1px 6px", fontSize: armed ? 9 : 11, fontWeight: 800, lineHeight: 1.5, border: armed ? "1.5px solid #DC2626" : "1px solid " + C.bd, background: armed ? "#DC2626" : "#fff", color: armed ? "#fff" : "#94A3B8", borderRadius: 4, cursor: "pointer", minHeight: IS_TOUCH ? 24 : 18 } }, armed ? "削除?" : "×"))),
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", lineHeight: 1.25 } },
        React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: epColor, fontVariantNumeric: "tabular-nums" } }, "EP " + e.ep + "円"),
        e.b ? React.createElement("span", { style: { fontSize: 16, fontWeight: 700, color: "#475569" } }, e.b) : null),   // ③底抜けをEP価格の右に同サイズで表示（プレーン・底抜けライン欄のみ復活 2026-07-24）
      React.createElement("div", { style: { fontSize: 9, color: subColor } }, _isUkiCard ? ("起点" + e.level + "＋α" + alphaSum + "（" + bk + "）") : ("起点" + e.level + (e.uki ? "＋浮" + e.uki : "") + "＋α" + (alphaSum - (Number(e.uki) || 0)) + "（" + bk + "）")),
      e.src ? React.createElement("div", { style: { fontSize: 8.5, color: "#94A3B8", marginTop: 1 } }, "（" + e.src + "）") : null, _inlineEditor);
  };
  // 早見（上段: 銘柄ヘッダー＋EPカード）と計算フォーム（下段: _EpnCalcForm常設）を銘柄列ごとにグリッドで2段整列（案A 2026-07-08）。
  // 「＋計算」ボタンは廃止＝フォームは常時表示。gridの自動配置で前半n個=上段・後半n個=下段となり、フォームの上端が列間で揃う。
  var _cellsTop = epnStocks.map(function(st) {
    var _cards = savedByStock.map[st] || [];
    return React.createElement("div", { key: "epnc_" + st, style: { minWidth: 0 } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#1E3A8A", background: "#DBEAFE", borderRadius: 5, padding: "3px 7px", marginBottom: 5, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, st),
      React.createElement(_ElDayAlphaPair, { key: "epnda_" + st, data: data, save: save, date: date, stock: st, stacked: true }),
      _cards.map(function(e) { return _renderCard(st, e); }),
      _cards.length ? null : React.createElement("div", { style: { fontSize: 9, color: "#CBD5E1", textAlign: "center", padding: "1px 0 4px" } }, "EPなし"));
  });
  var _cellsForm = epnStocks.map(function(st) {
    return React.createElement(_EpnCalcForm, { key: "epnf_" + st, data: data, save: save, date: date, stock: st, dayAlpha: _epnDayAlphaGet(data, st, date), daySpecialAlpha: _epnDaySpecialAlphaGet(data, st, date), signalTags: signalTags, reasonsMaster: reasonsMaster, register: _regForm, onEditing: _onFormEditing });
  });
  // 日替わり列（📅・右端 2026-07-22i）: 見出しは候補銘柄の▽（表示切替のみ・既定は指定銘柄）。選んだ銘柄で本日採用α値/早見カード/計算フォームが固定銘柄と全く同じに動く。列は固定銘柄の右端に1つ追加。
  var _rotCards = (_hasRot && _rotSel) ? (savedByStock.map[_rotSel] || []) : [];
  var _rotTop = _hasRot ? React.createElement("div", { key: "epncrot", style: { minWidth: 0, borderLeft: "2px solid #A5B4FC", paddingLeft: 6 } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, background: "#EEF2FF", borderRadius: 5, padding: "3px 5px", marginBottom: 5 } },
      React.createElement("span", { title: "日替わり銘柄（その日の取引銘柄を候補から選択・表示のみ）", style: { fontSize: 12, whiteSpace: "nowrap" } }, "📅"),
      React.createElement("select", { value: _rotSel, onChange: function(ev) { var v = ev.target.value; setRotSelRaw(v); _epnRotSet(date, v); },
        style: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, color: "#3730A3", background: "#fff", border: "1px solid #C7D2FE", borderRadius: 4, padding: "3px 4px", boxSizing: "border-box", minHeight: IS_TOUCH ? 30 : 24 } },
        rotStocks.map(function(s) { var _c = data.charts[s + "_" + date]; var cnt = (_c && Array.isArray(_c.signals)) ? _c.signals.length : 0; return React.createElement("option", { key: s, value: s }, s + (cnt ? "（" + cnt + "）" : "")); }))),
    _rotSel ? React.createElement(React.Fragment, null,
      React.createElement(_ElDayAlphaPair, { key: "epndarot_" + _rotSel, data: data, save: save, date: date, stock: _rotSel, stacked: true }),
      _rotCards.map(function(e) { return _renderCard(_rotSel, e); }),
      _rotCards.length ? null : React.createElement("div", { style: { fontSize: 9, color: "#CBD5E1", textAlign: "center", padding: "1px 0 4px" } }, "EPなし"))
      : React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", textAlign: "center", padding: "6px 0" } }, "候補を選択")) : null;
  var _rotForm = (_hasRot && _rotSel) ? React.createElement(_EpnCalcForm, { key: "epnfrot_" + _rotSel, data: data, save: save, date: date, stock: _rotSel, dayAlpha: _epnDayAlphaGet(data, _rotSel, date), daySpecialAlpha: _epnDaySpecialAlphaGet(data, _rotSel, date), signalTags: signalTags, reasonsMaster: reasonsMaster, register: _regForm, onEditing: _onFormEditing }) : (_hasRot ? React.createElement("div", { key: "epnfrot_empty" }) : null);
  var _topAll = _hasRot ? _cellsTop.concat([_rotTop]) : _cellsTop;
  var _formAll = _hasRot ? _cellsForm.concat([_rotForm]) : _cellsForm;
  var _colN = epnStocks.length + (_hasRot ? 1 : 0);
  var savedView = _colN
    ? React.createElement("div", { style: { overflowX: "auto", paddingBottom: 2 } },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(" + _colN + ", minmax(200px, 1fr))", gap: 8, alignItems: "stretch" } },
          _topAll.concat(_formAll)))
    : React.createElement("div", { style: { fontSize: 10, color: "#94A3B8", padding: "4px 0" } }, "「⚙表示銘柄」から銘柄を選ぶと、銘柄ごとの早見と計算フォームが並びます");
  var _stockPicker = showStockPicker ? React.createElement("div", { style: { marginBottom: 8, padding: "6px 8px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 6 } },
    React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: "#64748B", marginBottom: 4 } }, "表示銘柄（最大" + _EPN_MAX_STOCKS + "・ドラッグで並び替え・タップで外す）"),
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", minHeight: 26 } },
      (_stkOrd || epnStocks).map(function(st) {
        var _d = _stkDragRef.current;
        var _dragging = !!(_d && _d.started && _d.name === st);
        return React.createElement("span", { key: st, "data-epnstk": st,
          onPointerDown: function(e) { _stkDragRef.current = { name: st, sx: e.clientX, sy: e.clientY, started: false, list: null }; },
          onPointerMove: function(e) {
            var d = _stkDragRef.current; if (!d || d.name !== st) return;
            if (!d.started) {
              if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 7) return;
              d.started = true;
              try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_e0) {}
              d.list = epnStocks.slice(); _stkMovedRef.current = true; setStkOrd(d.list.slice()); return;
            }
            var el = document.elementFromPoint(e.clientX, e.clientY);
            var chip = (el && el.closest) ? el.closest("[data-epnstk]") : null;
            if (!chip) return;
            var over = chip.getAttribute("data-epnstk");
            if (!over || over === d.name) return;
            var lst = d.list.slice(), fi = lst.indexOf(d.name), ti = lst.indexOf(over);
            if (fi < 0 || ti < 0 || fi === ti) return;
            lst.splice(fi, 1); lst.splice(ti, 0, d.name); d.list = lst; setStkOrd(lst.slice());
          },
          onPointerUp: function() { var d = _stkDragRef.current; _stkDragRef.current = null; if (d && d.started && d.list) { _epnStockReorder(d.list.slice()); setTimeout(function() { _stkMovedRef.current = false; }, 0); } setStkOrd(null); },
          onPointerCancel: function() { _stkDragRef.current = null; _stkMovedRef.current = false; setStkOrd(null); },
          style: { touchAction: "none", boxShadow: _dragging ? "0 2px 8px rgba(0,0,0,0.3)" : null, transform: _dragging ? "scale(1.06)" : null, opacity: _dragging ? 0.9 : null } },
          React.createElement("button", { type: "button", onClick: function() { if (_stkMovedRef.current) { _stkMovedRef.current = false; return; } _epnStockToggle(st); }, title: "ドラッグで並び替え・タップで表示から外す",
            style: { padding: "3px 9px", fontSize: 11, fontWeight: 800, border: "1.5px solid #1D4ED8", background: "#DBEAFE", color: "#1E3A8A", borderRadius: 5, cursor: "pointer" } }, st));
      }),
      epnStocks.length === 0 ? React.createElement("span", { style: { fontSize: 10, color: "#CBD5E1" } }, "↓ から銘柄を選択") : null),
    (function() {
      var avail = _epnAllStocks.filter(function(s) { return epnStocks.indexOf(s) < 0; });
      if (!avail.length) return null;
      var full = epnStocks.length >= _EPN_MAX_STOCKS;
      return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", marginTop: 5, paddingTop: 5, borderTop: "1px dashed #E2E8F0" } },
        React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", marginRight: 2 } }, full ? "最大" + _EPN_MAX_STOCKS + "銘柄（外すと追加可）" : "追加:"),
        avail.map(function(st) {
          return React.createElement("button", { key: st, type: "button", onClick: function() { _epnStockToggle(st); }, disabled: full,
            style: { padding: "3px 9px", fontSize: 11, fontWeight: 600, border: "1px solid #ddd", background: full ? "#F8FAFC" : "#fff", color: full ? "#CBD5E1" : "#555", borderRadius: 5, cursor: full ? "default" : "pointer" } }, "＋ " + st);
        }));
    })()) : null;
  // 「表を参照」ポップアップ（2026-07-13d）: 記録帳と同じ推奨α値詳細表(_elBaseAlphaDetailV2)を全く同じ列でオーバーレイ表示。母数＝この銘柄のv2・算入記録（この日より前＝_epnCascade.all）＝計算フォーム推奨と同一。行タップ(onPick)でその基本α値を本日の採用α値に取り込み閉じる。現在の採用値(_curEff)を青ハイライト。
  var _tableModal = null;   // 旧・_EpnDayAlphaField用の「表を参照」ポップアップは_EpnDayAlphaField自体が未マウント＝到達不能（setTableStock(stock)呼出無し）＝死コードのため本体を削除。現行の表参照は_ElDayAlphaPairに集約 2026-07-22j
  return React.createElement("div", { style: { border: "1.5px solid #BFDBFE", borderRadius: 8, padding: 10, background: "#F8FAFF", boxSizing: "border-box", marginBottom: 12 } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 6, flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: 13.5, fontWeight: 800, color: "#1D4ED8", whiteSpace: "nowrap" } }, "⚡ EPナビ"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
        React.createElement("button", { type: "button", title: "OFF（固定）＝②③④の詳細を選んでも基本αの既定を動かさず、本日の採用α値（無ければ銘柄全体の推奨）で固定／ON＝詳細に合わせて推奨αへ更新（従来の挙動）", onClick: function() { save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { epnFollowReco: !(prev.custom && prev.custom.epnFollowReco) }) }); }); },
          style: { padding: "4px 10px", fontSize: 10, fontWeight: 700, border: "1px solid " + ((custom && custom.epnFollowReco) ? "#F59E0B" : "#BFDBFE"), background: (custom && custom.epnFollowReco) ? "#FFFBEB" : "#fff", color: (custom && custom.epnFollowReco) ? "#B45309" : "#64748B", borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 34 : 24, whiteSpace: "nowrap" } }, (custom && custom.epnFollowReco) ? "詳細で更新：ON" : "詳細で更新：OFF（固定）"),
        React.createElement("button", { type: "button", onClick: function() { setShowStockPicker(!showStockPicker); },
          style: { padding: "4px 10px", fontSize: 11, fontWeight: 700, border: "1px solid " + (showStockPicker ? "#1D4ED8" : "#BFDBFE"), background: showStockPicker ? "#EFF6FF" : "#fff", color: "#1D4ED8", borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 34 : 24 } }, "⚙ 表示銘柄"))),
    _stockPicker,
    savedView,
    _tableModal);
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
  // 日替わり銘柄（📅タブ 2026-07-22→per-day 2026-07-22d）: custom.rotatingStocks＝候補プール（マスター実在のみ・日経除く）。改名はhandleRenameStockで追従・削除は実在フィルタで自然に無効化。外国市場の右に固定した1タブ。
  var rotStocks = (Array.isArray(custom.rotatingStocks) ? custom.rotatingStocks : []).filter(function(s) { return allStocks.indexOf(s) >= 0 && s !== "日経平均株価"; });
  var _uRotAdd = useState(false), rotAddOpen = _uRotAdd[0], setRotAddOpen = _uRotAdd[1];
  var _uRotVal = useState(""), rotAddVal = _uRotVal[0], setRotAddVal = _uRotVal[1];
  var _uRotTab = useState(false), rotTabActive = _uRotTab[0], setRotTabActive = _uRotTab[1];   // 📅日替わりタブ(per-day)が選択中か。fmActiveと並列の明示フラグ 2026-07-22d
  var _uRotView = useState(""), rotViewStock = _uRotView[0], setRotViewStock = _uRotView[1];   // タブ内で表示/記録中の候補銘柄（指定=dailyStockとは別。表示切替用）
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

  var _useStateSAL = useState({}),
    _useStateSALA = _slicedToArray(_useStateSAL, 2),
    simAlpha = _useStateSALA[0],
    setSimAlpha = _useStateSALA[1];
  useEffect(function() { setSimAlpha({}); }, [date]);
  var _useStateSCL = useState({}), _useStateSCLA = _slicedToArray(_useStateSCL, 2),
    simCut = _useStateSCLA[0], setSimCut = _useStateSCLA[1];
  useEffect(function() { setSimCut({}); }, [date]);

  // 今週の損益データの週送り（表示中の日付が属する週からのオフセット）
  var _uWkOff = useState(0), _uWkOffA = _slicedToArray(_uWkOff, 2),
    wkWeekOffset = _uWkOffA[0], setWkWeekOffset = _uWkOffA[1];
  var _useStateSALWk = useState({}), _useStateSALWkA = _slicedToArray(_useStateSALWk, 2),
    simAlphaWk = _useStateSALWkA[0], setSimAlphaWk = _useStateSALWkA[1];
  useEffect(function() { setSimAlphaWk({}); }, [date, wkWeekOffset]);
  var _useStateSCLWk = useState({}), _useStateSCLWkA = _slicedToArray(_useStateSCLWk, 2),
    simCutWk = _useStateSCLWkA[0], setSimCutWk = _useStateSCLWkA[1];
  useEffect(function() { setSimCutWk({}); }, [date, wkWeekOffset]);
  
  
  
  
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
  var _regStocks = allStocks.filter(function(s) { return s !== "日経平均株価" && rotStocks.indexOf(s) < 0; });   // 通常タブに出る固定銘柄（日経・候補プールを除く）2026-07-22d
  var activeStock = (allStocks.includes(cs) && rotStocks.indexOf(cs) < 0) ? cs : (_regStocks[0] || allStocks[0] || "");
  var dayStock = _dailyStockGet(data, date);   // その日の本日の取引銘柄（指定・赤マーク・合計算入）
  var _rotView = (rotViewStock && rotStocks.indexOf(rotViewStock) >= 0) ? rotViewStock : (dayStock || rotStocks[0] || "");   // タブ内の表示銘柄（指定優先→候補先頭）
  var dispStock = rotTabActive ? _rotView : activeStock;   // フル表示に渡す銘柄（タブ時=表示中の候補／通常時=固定銘柄）
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
    // 関数アップデータで最新stateにマージ＝削除直前に他経路(同期受信/自動保存)で入った
    // custom配下の変更を古いdataスナップショットで巻き戻さない。2026-06-20
    save(function(prev) {
      var pc = prev.custom || {};
      var ps = (pc.stocks && pc.stocks.length > 0) ? pc.stocks.slice() : [].concat(DEF_STOCKS);
      var pns = ps.filter(function(s) { return s !== stock; });
      return Object.assign({}, prev, { custom: Object.assign({}, pc, { stocks: pns }) });
    });
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
      // 銘柄名で保持している他のcustomも追従（2026-07-07g・従来の追従漏れ）: EPナビ表示銘柄・銘柄情報タブ(stockInfoTabs)
      // 2026-08-03e ニュース参照は custom.stockSubCatRefs（サブカテゴリ単位）を廃止し、記事の keep.stocks（記事単位）へ移した＝下の trades 走査で追従させる。
      var _rnStockKey = function(m) { if (!m || typeof m !== "object" || !(oldName in m)) return m; var n = Object.assign({}, m); if (!(newName in n)) n[newName] = n[oldName]; delete n[oldName]; return n; };
      var _pepn = Array.isArray(pc.epnStocks) ? pc.epnStocks.map(function(s) { return s === oldName ? newName : s; }) : pc.epnStocks;
      var _prot = Array.isArray(pc.rotatingStocks) ? pc.rotatingStocks.map(function(s) { return s === oldName ? newName : s; }) : pc.rotatingStocks;   // 日替わり属性も追従 2026-07-22
      next.custom = Object.assign({}, pc, { stocks: ps, stockCodes: psc, epnStocks: _pepn, rotatingStocks: _prot, stockInfoTabs: _rnStockKey(pc.stockInfoTabs) });
      
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
      // 2026-08-03e 保存したニュース記事の紐付け銘柄（keep.stocks）も名前で持っているので一緒に付け替える。
      var _rnKeepStocks = function(dayObj) {
        if (!dayObj || !dayObj.newsCats || typeof dayObj.newsCats !== "object") return dayObj;
        var nc = {}, ch = false;
        Object.keys(dayObj.newsCats).forEach(function(c) {
          var cd = dayObj.newsCats[c];
          if (!cd || typeof cd !== "object" || !Array.isArray(cd.newsItems)) { nc[c] = cd; return; }
          var icg = false;
          var arr = cd.newsItems.map(function(nItem) {
            var st = _snNiKeepStocks(nItem);
            if (st.indexOf(oldName) < 0) return nItem;
            icg = true;
            var nx = st.map(function(s) { return s === oldName ? newName : s; });
            nx = nx.filter(function(s, i2) { return nx.indexOf(s) === i2; });
            return Object.assign({}, nItem, { keep: Object.assign({}, nItem.keep, { stocks: nx }) });
          });
          if (icg) { nc[c] = Object.assign({}, cd, { newsItems: arr }); ch = true; } else nc[c] = cd;
        });
        return ch ? Object.assign({}, dayObj, { newsCats: nc }) : dayObj;
      };
      Object.keys(ptr).forEach(function(dk) {
        var dayObj = _rnKeepStocks(ptr[dk]);
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
      // 本日の取引銘柄（②データのみ除外 2026-07-22e）: data.dailyStock は値が銘柄名＝改名追従しないと、指定した銘柄の記録が「候補で未指定」＝データのみ扱いに落ちてグランド合計から消える（指定●も外れる）。値をoldName→newNameへ付替。
      if (prev.dailyStock && typeof prev.dailyStock === "object") {
        var _nds = {};
        Object.keys(prev.dailyStock).forEach(function(_dsk) { _nds[_dsk] = (prev.dailyStock[_dsk] === oldName) ? newName : prev.dailyStock[_dsk]; });
        next.dailyStock = _nds;
      }
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
    // 2026-08-04b realSum=100株換算（下段の参考値）／realSumRaw=実額（フッターの主表示・実額スケールのランク用）。
    // 勝敗ok/ngは廃止し、利確/同値/損失（うち損切り）を数える。2026-08-04eに判定を【実現損益の符号】へ変更（下のループのコメント参照）。
    var realSum = 0, realSumRaw = 0, realHasSh = false, ok = 0, ng = 0;
    var cWin = 0, cEven = 0, cLoss = 0, cStop = 0;
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
        if (_elInclTotalAmt(data, { date: date, stock: _trStock, signal: s })) {  // 合計額算入: 除外記録は合計/成功失敗カウントに入れない（行は表示する）2026-06-18。全銘柄横断のグランド日集計＝②データのみも除外 2026-07-22e
        // 表の合計行(_elTotAccum)と一致させる: item.pnl優先＋per-100換算。2026-06-20
        // 監査所見2（2026-07-12）: 実現損益合計にも時間かぶり除外を適用＝同タブの合計行(_elTotAccum=除外済)とフッターの不一致を解消（勝敗ok/ngは件数系なので従来どおり全件）。
        var _prTr = _elRealPnlPair(s, item);
        if (_prTr.real != null && !_elCollExcludedSig(data, _trStock, date, s)) {
          realSum += (_prTr.per100 != null ? _prTr.per100 : _prTr.real);
          realSumRaw += _prTr.real;
          if (_prTr.shares > 0) realHasSh = true;
        }
        // 勝敗はライブα基準（v2/v3はresult=null保存のためEP足から導出・旧記録も全表ライブα計算方針に統一）
        var _cutTr = _trC.cutLine != null ? Number(_trC.cutLine) : 15;
        var _resTr = _elDynResult(s, _epOwnAlpha(s), _cutTr);
        if (_resTr === "ok") ok++;
        else if (_resTr === "ng") ng++;
        // 2026-08-04e 利確/同値/損失は【実現損益の符号】で数える（ユーザー指摘「実現損益では次足期待度関係ないよ」）。
        // 旧: _elWinBucket＝計算上の手じまい位置（_epNextExpAtの次足期待度で決まる）で判定していたため、
        //     実現損益が-8,400円の記録が「利確」に入っていた。実際に出た金額と数え方の基準を揃える。
        // 「うち損切り」は損切りライン到達(_elHoldIsStop)＝値が損切り値ぶん逆行したかという価格の事実だけで判定（期待度は見ない）。
        // 実現損益が未記録の記録はどれにも数えない（損益合計にも入っていないため）。
        if (_prTr.real != null) {
          if (_prTr.real > 0) cWin++;
          else if (_prTr.real === 0) cEven++;
          else { cLoss++; if (_elHoldIsStop(s, _epOwnAlpha(s), _cutTr)) cStop++; }
        }
        }
      });
    });
    records.sort(function(a, b) {
      var ta = (a.signal && a.signal.time) || "99:99";
      var tb = (b.signal && b.signal.time) || "99:99";
      return ta.localeCompare(tb);
    });
    return { records: records, totRecords: records.filter(function(r) { return _elInclTotalAmt(data, r); }),
      realSum: realSum, realSumRaw: realSumRaw, realHasSh: realHasSh, ok: ok, ng: ng,
      cWin: cWin, cEven: cEven, cLoss: cLoss, cStop: cStop };
  }, [data.charts, dd.items, allStocks, date]);
  var _trEntryRecords = _trEntryAgg.records;
  var _trTotRecs = _trEntryAgg.totRecords;  // 合計額算入: 集計専用（除外記録を抜いた版）2026-06-18
  var _trRealSum = _trEntryAgg.realSum;          // 100株換算（フッターの下段）
  var _trRealRaw = _trEntryAgg.realSumRaw;       // 実額（フッターの主表示）2026-08-04b
  // 2026-08-04b 「N勝N敗」表示を利確/同値/損失の内訳に置き換えたため _trSuccessCount/_trFailCount は撤去。
  // 集計側の ok/ng（_elDynResult基準）は他で使うかもしれないので _trEntryAgg には残してある。
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
  // 外国市場は開くだけで value:null の既定テーブルが自動生成されるため、length>0 では「未入力でも点が付く」。
  // 実際に値かメモが入っている時だけ「データあり」とする（他の銘柄タブと同様の挙動）。2026-06-18
  var hasFmData = (function() {
    var fm = data.foreignMarkets && data.foreignMarkets[date];
    if (!fm) return false;
    var _any = function(arr) { return (arr || []).some(function(it) { return it && ((it.value != null && it.value !== "") || (it.memo != null && String(it.memo).trim() !== "")); }); };
    return _any(fm.indicators) || _any(fm.stocks);
  })();
  var hasChartData = allStocks.some(stockHasData) || hasFmData;
  // 「本日の取引銘柄」バー（📅日替わりタブ最上部 2026-07-22d）: 候補プール(rotStocks)を「銘柄名（件数）」で並べる。名前タップ=表示/記録の切替(setRotViewStock)。各チップの指定●=その日の本日の取引銘柄に指定(dailyStock[date]・赤マーク・合計算入)。未指定の候補の記録はデータのみ(合計除外・分析は残す)。＋でその場追加(候補プール＋マスターへ)。
  var _rotRecCount = function(stk) { var c = data.charts[stk + "_" + date]; return (c && c.signals) ? c.signals.length : 0; };
  var _rotHasTradeTag = function(stk) { var c = data.charts[stk + "_" + date]; return !!(c && Array.isArray(c.chartShapeTags) && c.chartShapeTags.filter(function(t) { return t.indexOf("取引:") === 0; }).length); };   // 「取引」カテゴリタグ（ノーシグナル/有効シグナルなし等）が付いた銘柄＝取引0件を（0）で明示 2026-07-23
  var _rotCodeOf = function(stk) { var c = (custom.stockCodes || {})[stk]; var n = (c != null && c !== "") ? parseInt(String(c).replace(/\D/g, ""), 10) : NaN; return isNaN(n) ? Infinity : n; };   // 銘柄コード（数値）・未登録は末尾 2026-07-24
  var _rotSorted = rotStocks.slice().sort(function(a, b) { var ca = _rotCodeOf(a), cb = _rotCodeOf(b); if (ca !== cb) return ca - cb; return a < b ? -1 : a > b ? 1 : 0; });   // 本日の取引銘柄チップを銘柄コード昇順で左から並べる（同/無コードは名前順）2026-07-24
  var _rotPickerBar = React.createElement("div", { style: { background: "#fff", border: "1px solid #E0E7FF", borderRadius: 13, padding: "8px 12px", margin: "0 0 10px", boxShadow: "0 1px 2px rgba(0,0,0,.03)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
    React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#4338CA", whiteSpace: "nowrap" } }, "📅 本日の取引銘柄"),
    _rotSorted.map(function(s) {
      var viewing = _rotView === s;
      var designated = dayStock === s;
      var cnt = _rotRecCount(s);
      return React.createElement("span", { key: s, style: { display: "inline-flex", alignItems: "center", borderRadius: 14, border: "1px solid " + (viewing ? "#4338CA" : "#E0DAD1"), background: viewing ? "#EEF2FF" : "#fff", overflow: "hidden" } },
        React.createElement("button", {
          onClick: function() { setRotViewStock(s); },
          title: "表示・記録に切替",
          style: { padding: "5px 8px 5px 10px", fontSize: 12, fontWeight: 600, border: "none", background: "transparent", color: viewing ? "#3730A3" : "#6B6459", cursor: "pointer", whiteSpace: "nowrap", minHeight: IS_TOUCH ? 36 : 28 }
        }, s, cnt > 0 ? React.createElement("span", { style: { fontSize: 10, color: "#94A3B8", marginLeft: 2 } }, "（" + cnt + "）") : (_rotHasTradeTag(s) ? React.createElement("span", { title: "ノーシグナル等（取引0件）", style: { fontSize: 10, color: "#94A3B8", marginLeft: 2 } }, "（0）") : null)),
        React.createElement("button", {
          onClick: function() { _dailyStockSet(save, date, designated ? "" : s); },
          title: designated ? "本日の取引銘柄の指定を解除" : "この銘柄を本日の取引銘柄に指定（合計に算入・赤マーク）",
          style: { padding: "5px 8px", fontSize: 11, border: "none", borderLeft: "1px solid " + (viewing ? "#C7D2FE" : "#EEE"), background: designated ? "#E53935" : "transparent", color: designated ? "#fff" : "#CBD5E1", cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
        }, "●"));
    }),
    !rotAddOpen ? React.createElement("button", {
      onClick: function() { setRotAddOpen(true); },
      title: "取引銘柄を追加（候補プール＋銘柄マスターに登録されます）",
      style: { padding: "5px 12px", fontSize: 12, color: "#888", border: "1.5px dashed #ccc", borderRadius: 14, background: "#fff", cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
    }, "＋") : React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
      React.createElement(FastInput, {
        value: rotAddVal,
        onChange: function(v) { setRotAddVal(v); },
        debounceMs: 100,
        placeholder: "銘柄名",
        style: { padding: "5px 8px", border: "1px solid #ccc", borderRadius: 6, fontSize: 12, width: 110, boxSizing: "border-box", background: "#fff" }
      }),
      React.createElement("button", {
        onClick: function() {
          var nm = String(rotAddVal || "").trim();
          if (!nm || nm === "日経平均株価" || rotStocks.indexOf(nm) >= 0) { setRotAddOpen(false); setRotAddVal(""); return; }
          save(function(prev) {
            var pc = prev.custom || {};
            var ps = (pc.stocks && pc.stocks.length > 0) ? pc.stocks.slice() : [].concat(DEF_STOCKS);
            if (ps.indexOf(nm) < 0) ps.push(nm);
            var rot = Array.isArray(pc.rotatingStocks) ? pc.rotatingStocks.slice() : [];
            if (rot.indexOf(nm) < 0) rot.push(nm);
            return Object.assign({}, prev, { custom: Object.assign({}, pc, { stocks: ps, rotatingStocks: rot }) });
          });
          setRotViewStock(nm);
          setRotAddOpen(false); setRotAddVal("");
        },
        style: { padding: "5px 10px", fontSize: 11, fontWeight: 600, background: "#4338CA", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
      }, "追加"),
      React.createElement("button", {
        onClick: function() { setRotAddOpen(false); setRotAddVal(""); },
        style: { padding: "5px 8px", fontSize: 11, background: "#fff", color: "#888", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
      }, "✕")),
    React.createElement("span", { style: { marginLeft: "auto", fontSize: 9, color: "#94A3B8", whiteSpace: "nowrap" } }, dayStock ? ("● " + dayStock + "＝本日の取引銘柄（合計算入）") : "●で本日の取引銘柄を指定（未指定の候補はデータのみ）")
  );
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
        data: data, activeStock: "日経平均株価", save: save,
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
    stocks: allStocks.filter(function(s) { return s !== "日経平均株価" && rotStocks.indexOf(s) < 0; }),
    active: (fmActive || rotTabActive) ? "" : activeStock,
    onSelect: function(s) { setCs(s); setFmActive(false); setRotTabActive(false); },
    onReorder: function onReorder(reordered) {
      // タブに出していない銘柄（日経平均・日替わり）を末尾で保持＝並べ替えでマスターから消さない 2026-07-22
      var kept = allStocks.filter(function(s) { return reordered.indexOf(s) < 0; });
      return updCustom({
        stocks: reordered.concat(kept)
      });
    },
    onAdd: addStock,
    onDel: handleDelStock,
    onRename: handleRenameStock,
    onRestore: handleRestoreStock,
    onPurge: handlePurgeStock,
    hiddenStocks: hiddenStocks,
    hasData: stockHasData,
    exclCount: function(s) { return _elDayStockExclCount(data, s, date); },
    collCount: function(s) { return _elDayStockCollCount(data, s, date); },
    fmActive: fmActive,
    onFmSelect: function() { setFmActive(true); },
    hasFmData: hasFmData,
    rotStocks: rotStocks,
    rotActive: rotTabActive,
    rotLabel: "📅 日替わり",
    rotDayStock: dayStock || "",
    onRotSelect: function() { setRotTabActive(true); setFmActive(false); },
    rotHasData: dayStock ? stockHasData(dayStock) : rotStocks.some(stockHasData)
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
  rotTabActive ? _rotPickerBar : null,
  React.createElement(_PbDayBandBar, { data: data, save: save, stock: dispStock, date: date }),
  React.createElement(StockQuickRefTableWithChart, {
    data: data,
    activeStock: dispStock,
    onSelectDate: onSelectDate,
    save: save,
    highlightDate: date,
    weekOffset: weekOffset,
    setWeekOffset: setWeekOffset
  }),
  React.createElement("div", null,
    React.createElement(ChartSectionDailyCandle, {
      stock: dispStock, data: data, custom: custom, cfg: cfg, highlightDate: date
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
  }, dispStock, " \u2014 ", date), React.createElement(ChartSection, {
    stock: dispStock,
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
        setChartReturnCtx({ stock: dispStock });
      } else if (catName) {
        
        try {
          var _sv = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
          localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, _sv, { newsCat: catName })));
        } catch(e){}
      }
      _safeSetTab("news");
    }
  })), React.createElement(_elDayStockBenchV2, { data: data, date: date, stock: dispStock }))), tab === "trades" && React.createElement("div", null,
  React.createElement(EpNaviPanel, { data: data, save: save, date: date, stocks: allStocks }),
  React.createElement("div", { style: Card },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
      React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "実エントリー記録"),
      React.createElement("div", { style: { display: "flex", gap: 6 } },
        React.createElement("button", {
          onClick: function() { try { window.open(CA_URL, "_blank", "noopener"); } catch(e){} },
          title: "チャート分析ツールを開く",
          style: { padding: "9px 12px", fontSize: 12, fontWeight: 600, background: "#EEF2FF", border: "1.5px solid #C7D2FE", borderRadius: 6, cursor: "pointer", color: "#4338CA", minHeight: IS_TOUCH ? 40 : 32 }
        }, "📐 チャート分析"),
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
      // 共通ヘルパー(app-05)のエイリアス（旧ローカル実装を統合 2026-06-12）
      var _trRPnlCol = _elPnlColor;
      var _trRPnlFmt = _elPnlFmt;
      var _trBadge = _elGradeBadge18;
      var _trLane = _elLane;
      var _trRPnlDisp = function(v, grade, sub) { return _elRPnlDispW(v, grade, 72, false, sub); };   // sub=100株換算の下段（実現損益欄だけ渡す）2026-08-04
      var _trRPnlDispABAll = _elRPnlDispABAll;
      var _trTh = function(label, extra) {
        return React.createElement("th", { style: Object.assign({ padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" }, extra || {}) }, label);
      };
      var _trRecKey = function(r) { return r.stock + "_" + (r.signal.id || r.signal.time || ""); };
      // 合計集計は共通アキュムレータ(_elTotAccum)へ統合（最大損益のみ取引固有のため残留ループ）
      var _trTT = _elTotAccum(_trTotRecs, {
        signal: function(r) { return r.signal; },
        alpha: function(r) { return _elAlphaInfo(r, data).alpha; },
        cut: function(r) { return _elAlphaInfo(r, data).cutLine; },
        excluded: function(r) { return _elCollExcluded(data, r); },
        realPair: function(r) { return _elRealPnlPair(r.signal, r.item); }   // 2026-08-04 実額と100株換算を両方もらう（従来のrealは100株換算だけだった）
      });
      var _trTotReal = _trTT.real, _trTotRealCnt = _trTT.realCnt;
      var _trTotPlan = _trTT.plan, _trTotPlanCnt = _trTT.planCnt;
      var _trTotPlanRef = _trTT.planRef, _trTotPlanRefCnt = _trTT.planRefCnt;
      var _trTotPlanAB = _trTT.planAB, _trTotPlanABCnt = _trTT.planABCnt;
      var _trTotHold = _trTT.holdRaw, _trTotHoldCnt = _trTT.holdCnt;
      var _trTotHoldCap = _trTT.holdPlanCap, _trTotHoldCapAB = _trTT.holdAB, _trTotHoldABCnt = _trTT.holdABCnt;
      var _trTotHoldPlanStopDiff = _trTT.holdPlanStopDiff;
      var _trTotHoldRef = _trTT.holdRef, _trTotHoldRefCnt = _trTT.holdRefCnt;
      var _trTotHold2 = _trTT.hold2, _trTotHold2Cnt = _trTT.hold2Cnt, _trTotHold2Ref = _trTT.hold2Ref, _trTotHold2RefCnt = _trTT.hold2RefCnt;
      var _trTotMax = null, _trTotMaxCnt = 0, _trTotMaxAB = null, _trTotMaxABCnt = 0;
      _trTotRecs.forEach(function(r) {
        var s = r.signal;
        var mp = _elSignedVal(s.maxPnl, s.maxPnlSign);
        if (mp == null) return;
        var sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
        var mpN = sh > 0 ? Math.round(mp / sh * 100) : Math.round(mp);
        _trTotMax = (_trTotMax || 0) + mpN; _trTotMaxCnt++;
        if (s.difficulty === "A" || s.difficulty === "B") { _trTotMaxAB = (_trTotMaxAB || 0) + mpN; _trTotMaxABCnt++; }
      });
      var _trTotRealGrade = _trTotRealCnt > 0 ? _profitGradeFromPnlReal(_trTT.realRaw != null ? _trTT.realRaw : 0, _trTotRealCnt) : null;   // 実額スケールのグレードには実額合計 2026-08-04
      var _trTotPlanGrade = _trTotPlanCnt > 0 ? _profitGradeFromPnl(_trTotPlan != null ? _trTotPlan : 0, _trTotPlanCnt) : null;
      var _trTotMaxGrade  = _trTotMaxCnt  > 0 ? _profitGradeFromPnl(_trTotMax  != null ? _trTotMax  : 0, _trTotMaxCnt)  : null;
      var _trTotPlanGradeAB = _trTotPlanABCnt > 0 ? _profitGradeFromPnl(_trTotPlanAB != null ? _trTotPlanAB : 0, _trTotPlanABCnt) : null;
      var _trTotMaxGradeAB  = _trTotMaxABCnt  > 0 ? _profitGradeFromPnl(_trTotMaxAB  != null ? _trTotMaxAB  : 0, _trTotMaxABCnt)  : null;
      var _trTotHoldCapGrade = _trTotHoldCnt > 0 ? _profitGradeFromPnl(_trTotHoldCap != null ? _trTotHoldCap : 0, _trTotHoldCnt) : null;
      var _trTotHoldCapGradeAB = _trTotHoldABCnt > 0 ? _profitGradeFromPnl(_trTotHoldCapAB != null ? _trTotHoldCapAB : 0, _trTotHoldABCnt) : null;
      var allTrExp = _trEntryRecords.every(function(r) { return !!trTableRecExp[_trRecKey(r)]; });
      var _trAllMiss = _elAllMissRow(_trTotRecs, function(_r){ return _elAlphaInfo(_r, data).alpha; }, function(_r){ return _elAlphaInfo(_r, data).cutLine; });
      var totRow = React.createElement("tr", { key: "__trtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 8, style: { textAlign: "center", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C", borderBottom: "1px solid #f0ede6" } }, "合計"),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6", background: "#FFFBF0" } },
          React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, "最終損益"),
          React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _trTotHold2Cnt > 0 ? (function() { var _g2 = _profitGradeFromPnl(_trTotHold2 != null ? _trTotHold2 : 0, _trTotHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2 ? _trBadge(_g2) : null, React.createElement("span", { style: { fontWeight: 600, color: _trTotHold2 > 0 ? "#C0392B" : _trTotHold2 < 0 ? "#1E8449" : "#888" } }, (_trTotHold2 > 0 ? "+" : "") + (_trTotHold2 || 0).toLocaleString() + "円")); })() : (_trTotHold2RefCnt > 0 ? null : (_trAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_trTotHold2, _trTotHold2Ref, _trTotHold2RefCnt))
        ),
        React.createElement("td", { colSpan: 2, style: { padding: "4px 6px", textAlign: "left", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6", background: "#F8FBFE" } },
          React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "EP："),
              _trAllMiss ? _qZeroCell() : React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _trRPnlDispABAll(_trTotPlanAB, _trTotPlan, _trTotPlanGradeAB, _trTotPlanGrade), _elHold2RefSuffix(_trTotPlan, _trTotPlanRef, _trTotPlanRefCnt))),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H１："),
              _trTotHoldCnt > 0 ? _trRPnlDispABAll(_trTotHoldCapAB, _trTotHoldCap, _trTotHoldCapGradeAB, _trTotHoldCapGrade) : (_trTotHoldRefCnt > 0 ? null : (_trAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_trTotHoldCap, _trTotHoldRef, _trTotHoldRefCnt)),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H２："),
              React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _trTotHold2Cnt > 0 ? (function() { var _g2b = _profitGradeFromPnl(_trTotHold2 != null ? _trTotHold2 : 0, _trTotHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2b ? _trBadge(_g2b) : null, React.createElement("span", { style: { fontWeight: 600, color: _trTotHold2 > 0 ? "#C0392B" : _trTotHold2 < 0 ? "#1E8449" : "#888" } }, (_trTotHold2 > 0 ? "+" : "") + (_trTotHold2 || 0).toLocaleString() + "円")); })() : (_trTotHold2RefCnt > 0 ? null : (_trAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_trTotHold2, _trTotHold2Ref, _trTotHold2RefCnt))))),
        React.createElement("td", { style: { borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } }),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
          _trTotRealCnt > 0 ? _trRPnlDisp(_trTT.realRaw, _trTotRealGrade, _trTT.realHasShares ? _trTotReal : null) : React.createElement("span", { style: { color: "#ccc" } }, "—")
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
        var _dynHPtr = _elDeriveHoldProfit(_hpTr, planPnlN, _dynResTr, s.holdProfit);
        var realPnlN = realPnl != null ? _p100(realPnl) : null;
        var entered = _elIsEntered(s, rIt);
        // 2026-08-04 実現損益は実額を主に。_profitGradeFromPnlReal は実額スケール（通常の10倍）なので換算値を渡すと1桁ずれたランクになる。
        var realGrade = (entered && realPnl != null) ? _profitGradeFromPnlReal(realPnl, 1) : null;
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
          ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 14 } }, "〇")
          : _elIsThru(s)
            ? React.createElement("span", { title: "スルー", style: { color: "#6B7280", fontWeight: 700, fontSize: 11 } }, "ス")
            : _elIsReview(s)
              ? React.createElement("span", { title: "要審議", style: { color: "#DB2777", fontWeight: 700, fontSize: 11 } }, "審")
              : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×");
        var _sigParts = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).map(function(_t) { return _elTagDisp(s, _t); }).concat(s.isCustomTag ? [s.customTagText || "(その他)"] : []);
        var sigLabel = _sigParts.length > 0 ? _sigParts.join(" / ") : "(未設定)";
        var resultEl = _dynResTr === "ok"
          ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 13 } }, "○")
          : _dynResTr === "ng"
            ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700, fontSize: 13 } }, "×")
            : React.createElement("span", { style: { color: "#ccc" } }, "—");
        var rKeyRef = rKey;
        dataRows.push(
          React.createElement("tr", { key: rKey,
            style: Object.assign({ cursor: "pointer", background: rExp ? "#FFFBF5" : "transparent" }, _elRowStyleWithColl(data, r)),
            onClick: function() { setTrTableRecExp(function(prev) { var n = Object.assign({}, prev); if (n[rKeyRef]) delete n[rKeyRef]; else n[rKeyRef] = true; return n; }); }
          },
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
              React.createElement("div", null,
                React.createElement("span", { style: { marginRight: 3, color: "#F97316", fontSize: 9 } }, rExp ? "▼" : "▶"),
                s.time || "—", _minBarBadge(s)),
              _epIncompleteMark(s), _elCollMarkNode(data, r), _elFillRiskNode(r),
              (function() { var _ob = _elOutOfTotalBadge(data, r); return _ob ? React.createElement("div", { style: { marginTop: 1 } }, _ob) : null; })()   // 2026-07-29 選外(データのみ)も無印にしない
            ),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", color: "#9A3412" } }, r.stock),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", whiteSpace: "nowrap" } }, _elSigCell(s, "flex-start")),
            React.createElement("td", { style: { padding: "4px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%", background: _elSpecialUsed(s) ? "#FEF3C7" : null } },
              _elAlphaTypeCell(s, _aiTr.alpha)),
            React.createElement("td", { style: { padding: "4px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              _elCutValNode(_aiTr.cutLine)),
            _elLineCell(s, _aiTr.alpha, _aiTr.cutLine, "1px solid #f0ede6"),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
              _epECell(s, _aiTr.alpha)),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, entLabel),
            _elPnlDetailCells(s, _aiTr.alpha, _aiTr.cutLine, "1px solid #f0ede6", "4px 6px", "1px 5px"),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" } }, _trRPnlDisp(realPnl, realGrade, realPnlN != null && _sh > 0 ? realPnlN : null))   // 2026-08-05 採用αチップはα値欄へ移設
          )
        );
        if (rExp) {
          dataRows.push(
            React.createElement("tr", { key: rKey + "_card" },
              React.createElement("td", { colSpan: 13, style: { padding: "4px 8px 8px", background: "#FFFBF5", borderBottom: "1px solid #f0ede6" } },
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
                _trTh("シグナル", { width: 1, whiteSpace: "nowrap" }),
                _trTh("α値", { width: "1%" }),
                _trTh("損切", { width: "1%" }),
                _trTh("ライン", { width: "1%" }),
                _trTh("E", { width: "1%" }),
                _trTh("取引", { width: 1, padding: "4px 2px" }),
                _trTh("最終損益・詳細"),
                React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "OS・損益詳細"),
                _trTh(React.createElement("span", { title: "EP足〜手じまい足の保有時間（1分足換算・時間かぶり判定と同基準）" }, "保有"), { width: "1%" }),
                _trTh("実現損益")
              )
            ),
            React.createElement("tbody", null, [totRow].concat(dataRows))
          )
        ),
        // 2026-08-04 「α値シミュレーション」(VirtualAlphaCalc)はこの欄から撤去（ユーザー指示・不要）。
        // 部品(app-05 VirtualAlphaCalc)は残置＝他から呼びたくなったとき用。ここでは組み立て(_trVirtByStk)ごと削除。
        null
      );
    })(),
    // 2026-08-04b 縦積みに変更: 1行目=損益合計（実額・下に100株換算）＋ランク凡例／2行目=利確/同値/損失の内訳。
    _trEntryRecords.length > 0 && React.createElement("div", {
      style: { display: "flex", flexDirection: "column", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid #e0ddd6", fontSize: 14 }
    },
      (function() {
        var _trCount = _trTotRecs.filter(function(r){ return _elIsEntered(r.signal, r.item); }).length;
        var _tg = _profitGradeFromPnlReal(_trRealRaw, _trCount);   // 実額スケールのランクには実額合計を渡す 2026-08-04b
        var _ts = _GRADE_STYLE[_tg] || _GRADE_STYLE.Z;
        var _trLegendPairs = [["A+","25000円~"],["A-","20000~24999円"],["B","10000~19999円"],["C","1~9999円"],["D","0円"],["E","-1~-9999円"],["F","-10000~-19999円"],["G-","-20000~-24999円"],["G+","-25000円~"],["Z","取引なし"]];
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
            React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start" } },
              React.createElement("span", {
                style: { fontWeight: 700, color: _trRealRaw >= 0 ? "#C0392B" : "#1E8449" }
              }, (_trRealRaw > 0 ? "+" : "") + _trRealRaw.toLocaleString() + "円"),
              _trEntryAgg.realHasSh ? React.createElement("span", {
                style: { display: "inline-flex", alignItems: "center", gap: 3, lineHeight: 1.2 }
              },
                _elGradeBadge18(_profitGradeFromPnl(_trRealSum, 1)),   // 100株換算は通常スケール 2026-08-05
                React.createElement("span", { style: { fontSize: 9, color: "#94A3B8" } }, "100株"),
                React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(_trRealSum) } }, _elPnlFmt(_trRealSum))) : null
            ),
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
      // 2026-08-04b 「成功/失敗 N勝N敗」→「利確N件/同値N件/損失N件（うち損切りN件）」。損益合計の下へ移動。
      // 同値(_elWinBucketのeven)は0件なら出さない。損失は確定損＋損切りの合計で、その内訳として損切り件数を括弧で添える。
      (function() {
        var _cW = _trEntryAgg.cWin || 0;
        var _cE = _trEntryAgg.cEven || 0;
        var _cL = _trEntryAgg.cLoss || 0;
        var _cS = _trEntryAgg.cStop || 0;   // 損失の内数（損切りライン到達）
        var _num = function(n, col) { return React.createElement("span", { style: { fontWeight: 700, color: col } }, n + "件"); };
        var _parts = [React.createElement("span", { key: "w" }, "利確 ", _num(_cW, "#C0392B"))];
        if (_cE > 0) _parts.push(React.createElement("span", { key: "e" }, " / 同値 ", _num(_cE, "#D97706")));
        _parts.push(React.createElement("span", { key: "l" }, " / 損失 ", _num(_cL, "#1E8449"),
          _cS > 0 ? React.createElement("span", { style: { fontSize: 11, color: "#777" } }, "（うち損切り " + _cS + "件）") : null));
        return React.createElement("div", { style: { fontSize: 13, color: "#555", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 } }, _parts);
      })()
    )
  ),
  
  (function() {
    
    var _pbByStk = {};
    var _pbRealByStk = {}; 
    var _pbEntByStk = {};  
    var _pbCharts = data.charts || {};
    // α解決: signal.alphaVal(各記録の採用α値) > 予想OS度
    var _pbRecKey = function(r) { return r.stock + "_" + (r.signal.id || r.signal.time || ""); };
    var _pbAlphaActualOf = function(r) {
      var s = r.signal;
      return s && s.alphaVal != null && s.alphaVal !== "" ? Number(s.alphaVal) : _gradeAlpha(s && s.difficulty);
    };
    // α値シミュ(非永続)を最優先。未設定なら実際の採用α値。本日の損益データ表(サマリー＋明細)のみで使用。
    var _pbAlphaOf = function(r) {
      var _ov = simAlpha[_pbRecKey(r)];
      if (_ov != null && _ov !== "" && !isNaN(Number(_ov))) return Number(_ov);
      return _pbAlphaActualOf(r);
    };
    var _pbCutActualOf = function(r) {
      var _c = _pbCharts[r.stock + "_" + date];
      return _c && _c.cutLine != null ? _c.cutLine : 15;
    };
    // 損切り値シミュ(非永続)を最優先。未設定なら実際の損切り値。本日の損益データ表(サマリー＋明細)で使用。
    var _pbCutOf = function(r) {
      var _ov = simCut[_pbRecKey(r)];
      if (_ov != null && _ov !== "" && !isNaN(Number(_ov))) return Number(_ov);
      return _pbCutActualOf(r);
    };
    // ランクバッジ（_pnlDetailTableEl が週パネル描画時にも使うため、ここで早期定義）
    var _pbBadge = function(grade) {
      return _elGradeBadge18(grade);
    };
    // 一括α理想値ボタン＋リセットボタン。records各記録のα値シミュに推奨基本α値を一括入力／全クリアして採用α値に戻す（非保存）。
    var _bulkIdealCtrl = function(records, simVal, simSet, keyOf, cutOf) { return null;   // 一括α理想値バー撤去 2026-07-07
      // 適用中=表示中の全記録のα値シミュが各記録の推奨基本α値と一致している状態。trueならボタンに✓＋塗りつぶし表示。
      var _bav = (function() { var _ba = _elBaseAlphaPick(records, function(r) { return { cutLine: cutOf(r) }; }); return (_ba && _ba.alpha != null) ? String(_ba.alpha) : null; })();
      var _applied = !!(_bav != null && records && records.length > 0 && records.every(function(r) { return simVal && simVal[keyOf(r)] === _bav; }));
      return React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
        React.createElement("button", {
          onClick: function(e) { if (e && e.stopPropagation) e.stopPropagation(); if (_bav == null) return; var _m = {}; (records || []).forEach(function(r) { _m[keyOf(r)] = _bav; }); simSet(_m); },
          title: _applied ? "適用中: 表示中の全記録のα値シミュが推奨基本α値です" : "表示中の全記録のα値シミュに、推奨基本α値（この期間の5〜20）を一括入力（非保存）",
          style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, padding: "3px 10px", border: "1px solid #0369A1", borderRadius: 5, background: _applied ? "#0369A1" : "#E0F2FE", color: _applied ? "#fff" : "#0369A1", cursor: "pointer", whiteSpace: "nowrap" }
        }, _applied ? React.createElement("span", { key: "mk", style: { fontWeight: 800 } }, "✓") : null, "一括 推奨基本α"),
        React.createElement("button", {
          onClick: function(e) { if (e && e.stopPropagation) e.stopPropagation(); simSet({}); },
          title: "α値シミュを全て各記録の採用α値（既定）に戻す",
          style: { fontSize: 11, fontWeight: 600, padding: "3px 10px", border: "1px solid #ddd", borderRadius: 5, background: "#f5f4f0", color: "#555", cursor: "pointer", whiteSpace: "nowrap" }
        }, "リセット")
      );
    };
    // 本日／今週の損益データ共通：1記録ごとの明細テーブル（thead＋subRows＋totRow）を返す。
    // records は呼び出し側でフィルタ済み。内部で時間昇順にソート。α/損切りは alphaOf/cutOf で解決。
    var _pnlDetailTableEl = function(records, alphaOf, cutOf, sortMode, simCtx, cutCtx, showBulk, amtScope) {   // amtScope=true: グランド（全銘柄横断/週）の合計行なので②データのみも除外。銘柄別展開はfalse＝据置 2026-07-22e
      var expRecs = (records || []).slice().sort(function(a, b) {
        if (sortMode === "stock") {
          if (a.stock !== b.stock) return a.stock.localeCompare(b.stock);
          return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99");
        }
        return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99") || a.stock.localeCompare(b.stock);
      });
      if (!expRecs.length) return null;
      var _rPnlCol = _elPnlColor;
      var _rPnlFmt = _elPnlFmt;
      var _rTh = function(label, extra) {
        return React.createElement("th", { style: Object.assign({ padding: "1px 3px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "center", fontSize: 10, lineHeight: 1.15, color: "#9A3412" }, extra || {}) }, label);
      };
      var _lane = _elLane;
      var _rPnlDisp = function(v, grade, sub) { return _elRPnlDispW(v, grade, 72, false, sub); };   // sub=100株換算の下段。この表の実現損益はもともと実額なので下段を足すだけ 2026-08-04
      var _sl = function() { return React.createElement("span", { style: { color: "#d6c8b8", margin: "0", fontWeight: 400 } }, "/"); };
      var _pbSlashCell = function(symObj, grade, pnl, missFlag) {
        var sym = symObj ? React.createElement("span", { style: { fontWeight: 700, color: symObj.col } }, symObj.ch) : React.createElement("span", { style: { color: "#ccc" } }, "—");
        var badge = missFlag ? _pbBadge("Z") : (grade && grade !== "Z" ? _pbBadge(grade) : React.createElement("span", { style: { color: "#ccc" } }, "—"));
        var amt = missFlag ? React.createElement("span", { style: { color: "#888" } }, "—") : (pnl != null ? React.createElement("span", { style: { fontWeight: 600, color: _rPnlCol(pnl) } }, _rPnlFmt(pnl)) : React.createElement("span", { style: { color: "#ccc" } }, "—"));
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, _lane(sym, 14), _sl(), _lane(badge, 18), _sl(), _lane(amt, 52, "flex-start"));
      };
      var _renderSimAlphaInput = function(r, _sc) { return null;   // α値シミュ撤去 2026-07-07
        var k = _sc.keyOf(r);
        var actualA = _sc.actualOf(r);
        var raw = _sc.val[k];
        var hasOv = raw != null && raw !== "";
        var curStr = (raw != null) ? raw : (actualA != null ? String(actualA) : "");
        var isSim = hasOv && actualA != null && Number(raw) !== actualA;
        var stop = function(e) { if (e && e.stopPropagation) e.stopPropagation(); };
        var baseNum = function() { return (raw != null && raw !== "") ? Number(raw) : (actualA != null ? actualA : 0); };
        var setVal = function(v) { _sc.set(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
        return React.createElement("div", { onClick: stop, style: { marginTop: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } },
          React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 2 } },
            React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid " + (isSim ? "#0369A1" : "#cbd5e1"), borderRadius: 5, overflow: "hidden", background: "#fff" } },
              React.createElement("input", { type: "text", inputMode: "numeric", step: "1", min: "0", value: curStr, onClick: stop,
                onChange: function(e) { setVal(_toHankakuNum(e.target.value)); },
                style: { width: 20, padding: "2px 3px", border: "none", outline: "none", background: "transparent", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#0369A1", fontVariantNumeric: "tabular-nums" } }),
              React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", alignSelf: "center", padding: "0 1px" } }, "円"),
              _stepBtn(function() { setVal(String(baseNum() + 1)); }, function() { setVal(String(Math.max(0, baseNum() - 1))); })
            ),
            React.createElement("button", { onClick: function(e) { stop(e); var _ia = _elIdealAlpha(r.signal, cutOf(r)); if (_ia == null) return; if (actualA != null && _ia === Number(actualA)) { _sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); } else { setVal(String(_ia)); } },
              title: "損切りにならず『EP損益＋H1結果損益』が最大になるα(0〜50円・1円刻み)をこの行に入力。該当が無ければ一番マシな値。※全記録に一括は『一括 推奨基本α』を使用。",
              style: { fontSize: 8, padding: "1px 4px", border: "1px solid #0369A1", borderRadius: 3, background: "#E0F2FE", color: "#0369A1", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", fontWeight: 700 } }, "理想"),
            React.createElement("button", { onClick: function(e) { stop(e); if (!isSim) return; _sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); },
              style: { fontSize: 8, padding: "0 4px", border: "1px solid #cbd5e1", borderRadius: 3, background: "#F1F5F9", color: "#0369A1", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", display: isSim ? "inline-block" : "none" } }, "↺")
          )
        );
      };
      // 損切り値シミュ欄（α値シミュと全く同じ形。色は紫で区別）。理想損切り値=10/15/20で損切り回避できる最小値。
      var _renderSimCutInput = function(r, _sc) { return null;   // 損切り値シミュ撤去 2026-07-07
        var k = _sc.keyOf(r);
        var actualC = _sc.actualOf(r);
        var raw = _sc.val[k];
        var hasOv = raw != null && raw !== "";
        var curStr = (raw != null) ? raw : (actualC != null ? String(actualC) : "");
        var isSim = hasOv && actualC != null && Number(raw) !== actualC;
        var stop = function(e) { if (e && e.stopPropagation) e.stopPropagation(); };
        var baseNum = function() { return (raw != null && raw !== "") ? Number(raw) : (actualC != null ? actualC : 0); };
        var setVal = function(v) { _sc.set(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
        return React.createElement("div", { onClick: stop, style: { marginTop: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } },
          React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 2 } },
            React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid " + (isSim ? "#9333EA" : "#cbd5e1"), borderRadius: 5, overflow: "hidden", background: "#fff" } },
              React.createElement("input", { type: "text", inputMode: "numeric", step: "1", min: "0", value: curStr, onClick: stop,
                onChange: function(e) { setVal(_toHankakuNum(e.target.value)); },
                style: { width: 20, padding: "2px 3px", border: "none", outline: "none", background: "transparent", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#9333EA", fontVariantNumeric: "tabular-nums" } }),
              React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", alignSelf: "center", padding: "0 1px" } }, "円"),
              _stepBtn(function() { setVal(String(baseNum() + 1)); }, function() { setVal(String(Math.max(0, baseNum() - 1))); })
            ),
            React.createElement("button", { onClick: function(e) { stop(e); var _ic = _elIdealCut(r.signal, alphaOf(r)); if (_ic == null) return; if (actualC != null && _ic === Number(actualC)) { _sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); } else { setVal(String(_ic)); } },
              title: "現在のα値（α値シミュ中ならその値）を考慮し、損切りを回避できる最小の損切り値(10/15/20)を入力。回避できなければ最小の10。",
              style: { fontSize: 8, padding: "1px 4px", border: "1px solid #9333EA", borderRadius: 3, background: "#F3E8FF", color: "#9333EA", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", fontWeight: 700 } }, "理想"),
            React.createElement("button", { onClick: function(e) { stop(e); if (!isSim) return; _sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); },
              style: { fontSize: 8, padding: "0 4px", border: "1px solid #cbd5e1", borderRadius: 3, background: "#F1F5F9", color: "#9333EA", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", display: isSim ? "inline-block" : "none" } }, "↺")
          )
        );
      };
      var subRows = [];
      var _totReal = null, _totPlan = null, _totHold = null;
      var _totRealP100 = null, _totRealHasSh = false;   // 2026-08-04 実現損益の下段（100株換算）用。_totRealは従来どおり実額の合計。
      var _totRealCnt = 0, _totPlanCnt = 0, _totHoldCnt = 0;
      var _totPlanABpb = null;
      var _totPlanABCntpb = 0;
      var _totHoldPlanCap = null, _totHoldPlanCapAB = null, _totHoldPlanCapABCnt = 0, _totHoldPlanStopDiffPb = false;
      var _totHoldRef = null, _totHoldRefCnt = 0;
      var _totHold2 = null, _totHold2Cnt = 0, _totHold2Ref = null, _totHold2RefCnt = 0;
      var _totPlanRef = null, _totPlanRefCnt = 0;
      expRecs.forEach(function(r) {
        var rKey = r.stock + "_" + (r.signal.id || r.signal.time || "");
        var rExp = !!pnlRecordExpandSet[rKey];
        var s = r.signal;
        var item = r.item;
        var realPnl = (item && item.pnl != null) ? Number(item.pnl)
          : (s.realizedPnl != null ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null);
        var _alphaRec = alphaOf(r);
        var _cutLrec = cutOf(r);
        // EP損益/H損益/結果は共通ヘルパーで算出（EP起算v2はEP足基準。行表示の_epPnlCell等と同一基準＝EP=OS2/3の損切り額も合計に算入される）
        var planPnl = _elDynPlanned(s, _alphaRec, _cutLrec);
        var holdPnl = _elDynHold(s, _alphaRec, _cutLrec);
        var entered = _elIsEntered(s, item);
        var _dispResExp = _elDynResult(s, _alphaRec, _cutLrec);
        var isOk = _dispResExp === "ok";
        var isNg = _dispResExp === "ng";
        var isDraw = _dispResExp === "draw";
        var isMiss = _dispResExp === "miss";
        var bb = "1px solid #e8e5de";
        var _isXskipPb = _epIsXSkip(s, _alphaRec);  // E×（×見送り）→ 本合計に算入せず参考(ref)へ
        var _inclTpb = amtScope ? _elInclTotalAmt(data, r) : _elInclTotal(s);  // 合計額算入: false の記録は合計から除外（行は表示し編集可）2026-06-18。2026-07-18g 要審議も合計算入（見送りと同じ）＝_elIsReview除外を撤回。amtScope時は②データのみも除外 2026-07-22e
        var _collXpb = _elCollExcluded(data, r);  // 時間かぶり除外: 良い方はフッター合計からも全スキップ（行表示は全件のまま）2026-07-07
        if (entered && _inclTpb && !_collXpb) _totRealCnt++;
        if (realPnl != null && _inclTpb && !_collXpb) {
          _totReal = (_totReal || 0) + realPnl;
          var _prPb = _elRealPnlPair(s, item);
          _totRealP100 = (_totRealP100 || 0) + (_prPb.per100 != null ? _prPb.per100 : _prPb.real);
          if (_prPb.shares > 0) _totRealHasSh = true;
        }
        var _h2tpb = _elHoldFinalParts(s, _alphaRec, _cutLrec);
        if (_isXskipPb || !_inclTpb || _collXpb) {
          // EP×（×見送り）→ EP/H1/H2とも完全に算入無し（参考にも入れない）。
        } else {
        var _epTriPb = _epIsTriEntry(s, _alphaRec);  // EP-OS△（△の確信度でエントリー）→ EP損益は（）内のみ・（）外は0
        if (planPnl != null) {
          if (_epTriPb) { _totPlanRef = (_totPlanRef || 0) + planPnl; _totPlanRefCnt++; }
          else { _totPlan = (_totPlan || 0) + planPnl; _totPlanCnt++; }
        }
        if (holdPnl != null && !_epTriPb) { _totHold = (_totHold || 0) + holdPnl; _totHoldCnt++; }  // EP△はH1も（）外0＝主計数に入れない（下で参考へ）
        var _isABpb = (s.difficulty === "A" || s.difficulty === "B");
        if (planPnl != null && _isABpb && !_epTriPb) { _totPlanABpb = (_totPlanABpb || 0) + planPnl; _totPlanABCntpb++; }
        if (_h2tpb.main != null) { _totHold2 = (_totHold2 || 0) + _h2tpb.main; _totHold2Cnt++; }
        if (_h2tpb.ref != null) { _totHold2Ref = (_totHold2Ref || 0) + _h2tpb.ref; _totHold2RefCnt++; }
        if (holdPnl != null) {
          // 想定が損切りの行は結果損益を想定額にキャップした合計（per-row のキャップ表示と一致）。本来額は _totHold に保持。
          var _pStopH = (_alphaRec != null && _elPlanIsStop(s, _alphaRec, _cutLrec));
          var _hCapPb = (_pStopH && planPnl != null) ? planPnl : holdPnl;
          var _hxPb = _elH1ExpAt(s, _alphaRec);   // 2026-07-06e
          if (_epTriPb) {
            // EP△→H1も（）外0。○/△/損切り済は（）内（参考）へ・×/未設定は完全除外（1段下0を継承）。
            if (_hxPb && _hxPb !== "×") { _totHoldRef = (_totHoldRef || 0) + _hCapPb; _totHoldRefCnt++; }
          } else {
            var _fbPb = (_hxPb !== "○");  // ○以外（×/△/損切り済/未設定）は想定額へフォールバック。未設定=×扱い
            var _mvPb = (_fbPb && planPnl != null) ? planPnl : _hCapPb;
            _totHoldPlanCap = (_totHoldPlanCap || 0) + _mvPb;
            if (_isABpb) { _totHoldPlanCapAB = (_totHoldPlanCapAB || 0) + _mvPb; _totHoldPlanCapABCnt++; }
            if ((_hxPb === "△" || _hxPb === "損切り済") && planPnl != null && (_hCapPb - planPnl) !== 0) { _totHoldRef = (_totHoldRef || 0) + (_hCapPb - planPnl); _totHoldRefCnt++; }  // △/損切り済のみ参考（×/未設定は無し）
            if (_pStopH && planPnl != null && holdPnl !== planPnl) _totHoldPlanStopDiffPb = true;
          }
        }
        }
        var gReal = entered && realPnl != null ? _profitGradeFromPnlReal(realPnl, 1) : null;
        var gPlan = planPnl != null ? _profitGradeFromPnl(planPnl, 1) : null;
        subRows.push(React.createElement("tr", {
          key: rKey + "_row",
          style: Object.assign({ background: rExp ? "#FFF7ED" : "transparent", cursor: "pointer" }, _elRowStyleWithColl(data, r)),
          onClick: function() {
            var next = Object.assign({}, pnlRecordExpandSet);
            if (rExp) { delete next[rKey]; } else { next[rKey] = true; }
            setPnlRecordExpandSet(next);
          }
        },
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: bb, color: "#F97316", width: "1%" } },
            rExp ? "▼" : "▶"),
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontWeight: 700, fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", width: "1%", color: "#9A3412" } },
            React.createElement("div", null, r.stock),
            simCtx ? _renderSimAlphaInput(r, simCtx) : null,
            cutCtx ? _renderSimCutInput(r, cutCtx) : null),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", width: "1%", color: "#666" } },
            React.createElement("div", null, s.time || "—", _minBarBadge(s)),
            _epIncompleteMark(s), _elCollMarkNode(data, r), _elFillRiskNode(r),
            (function() { var _ob = _elOutOfTotalBadge(data, r); return _ob ? React.createElement("div", { style: { marginTop: 1 } }, _ob) : null; })()),   // 2026-07-29 選外(データのみ)も無印にしない
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", color: "#555", minWidth: 60 } },
            _elSigCell(s, "center")),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%", background: _elSpecialUsed(s) ? "#FEF3C7" : null } },
            _elAlphaTypeCell(s, _alphaRec)),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            _elCutValNode(_cutLrec)),
          _elLineCell(s, _alphaRec, _cutLrec, bb),
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            _epECell(s, _alphaRec)),
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", width: "1%" } },
            entered
              ? React.createElement("span", { style: { color: "#2E7D32", fontWeight: 700, fontSize: 14 } }, "〇")
              : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×")
          ),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", background: "#FFFBF0" } },
            _elHold2AmtNode(s, _alphaRec, _cutLrec), _elRideMiniNode(s, _alphaRec, _cutLrec)),
          React.createElement("td", { colSpan: 2, style: { padding: "1px 5px", textAlign: "left", fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", background: "#F8FBFE" } },
            _elDetailFlowStack(s, _alphaRec, _cutLrec)),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de" } },
            _elHoldMinNode(s, _alphaRec, _cutLrec)),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: bb, whiteSpace: "nowrap" } },
            _rPnlDisp(realPnl, gReal, _elPer100Of(realPnl, s)))
        ));
        if (rExp) {
          subRows.push(React.createElement("tr", { key: rKey + "_detail" },
            React.createElement("td", { colSpan: 14, style: { padding: "0 0 4px 0", borderBottom: "1px solid #e0ddd6" } },
              React.createElement(EntryLogCard, {
                record: r,
                alpha: alphaOf(r),
                cutLine: cutOf(r),
                onEdit: function(rec) { setTradeEditTarget(rec); setShowForm(true); }
              })
            )
          ));
        }
      });
      var _pbTotDays = _elBizDaysOf(expRecs, data);
      var _pdAvg = function(_x) { return _pbTotDays > 0 ? Math.round(_x / _pbTotDays) : _x; };
      var _totRealGrade = _totRealCnt > 0 ? _profitGradeFromPnlReal(_pdAvg(_totReal != null ? _totReal : 0), _totRealCnt) : null;
      var _totPlanGrade = _totPlanCnt > 0 ? _profitGradeFromPnl(_pdAvg(_totPlan != null ? _totPlan : 0), _totPlanCnt) : null;
      var _totPlanGradeABpb = _totPlanABCntpb > 0 ? _profitGradeFromPnl(_pdAvg(_totPlanABpb != null ? _totPlanABpb : 0), _totPlanABCntpb) : null;
      var _totHoldCapGradePb = _totHoldCnt > 0 ? _profitGradeFromPnl(_pdAvg(_totHoldPlanCap != null ? _totHoldPlanCap : 0), _totHoldCnt) : null;
      var _totHoldCapGradeABpb = _totHoldPlanCapABCnt > 0 ? _profitGradeFromPnl(_pdAvg(_totHoldPlanCapAB != null ? _totHoldPlanCapAB : 0), _totHoldPlanCapABCnt) : null;
      var _rPnlDispABAllPb = function(abV, allV, abGrade, allGrade) {
        // 全ランク(全体)のみ表示。B以上/全ランクのAB分割は廃止。
        var _fmtAB = _elPnlFmt;   // 共通化 2026-07-14: _elPnlFmt と同一実装（符号+千区切り+円・null→—）
        var _colAB = _elPnlColor;   // 共通化 2026-07-14: _elPnlColor と同一実装（正負色・null→#ccc）
        var _v = allV != null ? allV : abV;
        var _g = allGrade || abGrade;
        if (_v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          _g ? _pbBadge(_g) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _colAB(_v) } }, _fmtAB(_v))
        );
      };
      var _lblTot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
      var _pbAllMiss = _elAllMissRow(expRecs.filter(function(r) { return amtScope ? _elInclTotalAmt(data, r) : _elInclTotal(r.signal); }), alphaOf, cutOf);
      var totRow = React.createElement("tr", { key: "__subtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 2, style: { padding: "1px 6px", textAlign: "left", fontWeight: 700, fontSize: 11, borderTop: "2px solid #FB923C", color: "#555", whiteSpace: "nowrap" } }, "合計"),
        React.createElement("td", { colSpan: 7, style: { borderTop: "2px solid #FB923C" } }),
        React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap", background: "#FFFBF0" } }, _lblTot("最終損益"),
          React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _totHold2Cnt > 0 ? (function() { var _g2f = _profitGradeFromPnl(_pdAvg(_totHold2 != null ? _totHold2 : 0), _totHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2f ? _pbBadge(_g2f) : null, React.createElement("span", { style: { fontWeight: 600, color: _totHold2 > 0 ? "#C0392B" : _totHold2 < 0 ? "#1E8449" : "#888" } }, (_totHold2 > 0 ? "+" : "") + (_totHold2 || 0).toLocaleString() + "円")); })() : (_totHold2RefCnt > 0 ? null : (_pbAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHold2, _totHold2Ref, _totHold2RefCnt))),
        React.createElement("td", { colSpan: 2, style: { padding: "1px 4px", textAlign: "left", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap", background: "#F8FBFE" } },
          React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "EP："),
              _pbAllMiss ? _qZeroCell() : React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _rPnlDispABAllPb(_totPlanABpb, _totPlan, _totPlanGradeABpb, _totPlanGrade), _elHold2RefSuffix(_totPlan, _totPlanRef, _totPlanRefCnt))),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H１："),
              _totHoldCnt > 0 ? _rPnlDispABAllPb(_totHoldPlanCapAB, _totHoldPlanCap, _totHoldCapGradeABpb, _totHoldCapGradePb) : (_totHoldRefCnt > 0 ? null : (_pbAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHoldPlanCap, _totHoldRef, _totHoldRefCnt)),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H２："),
              _totHold2Cnt > 0 ? (function() { var _g2g = _profitGradeFromPnl(_pdAvg(_totHold2 != null ? _totHold2 : 0), _totHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2g ? _pbBadge(_g2g) : null, React.createElement("span", { style: { fontWeight: 600, color: _totHold2 > 0 ? "#C0392B" : _totHold2 < 0 ? "#1E8449" : "#888" } }, (_totHold2 > 0 ? "+" : "") + (_totHold2 || 0).toLocaleString() + "円")); })() : (_totHold2RefCnt > 0 ? null : (_pbAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHold2, _totHold2Ref, _totHold2RefCnt)))),
        React.createElement("td", { style: { borderTop: "2px solid #FB923C" } }),
        React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, _lblTot("実現損益"), _rPnlDisp(_totReal, _totRealGrade, _totRealHasSh ? _totRealP100 : null))
      );
      var _cntCtx = function(_ctx) { return _ctx ? Object.keys(_ctx.val).filter(function(_k) { var _v = _ctx.val[_k]; return _v != null && _v !== ""; }).length : 0; };
      var _simAlphaCnt = _cntCtx(simCtx), _simCutCnt = _cntCtx(cutCtx), _simActiveCnt = _simAlphaCnt + _simCutCnt;
      return React.createElement("div", { style: { overflowX: "auto" } },
        (simCtx || cutCtx) ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 2px", whiteSpace: "nowrap", flexWrap: "wrap" } },
          _simActiveCnt > 0
            ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#0369A1" } }, "シミュ中: α " + _simAlphaCnt + "件 / 損切り " + _simCutCnt + "件")
            : React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#94A3B8" } }, "α値・損切り値シミュ：行の数値を変えると再計算（非保存）"),
          (showBulk && simCtx) ? _bulkIdealCtrl(records, simCtx.val, simCtx.set, simCtx.keyOf, cutOf) : null,
          React.createElement("button", { onClick: function(e) { if (e && e.stopPropagation) e.stopPropagation(); if (simCtx) simCtx.set({}); if (cutCtx) cutCtx.set({}); },
            style: { fontSize: 10, padding: "2px 8px", border: "1px solid #0369A1", borderRadius: 4, background: "#E0F2FE", color: "#0369A1", cursor: "pointer", fontWeight: 700, visibility: _simActiveCnt > 0 ? "visible" : "hidden" } }, "↺ 全シミュ解除")
        ) : null,
        React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", fontSize: 10 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#FFF7ED" } },
              _rTh("", { width: 20 }),
              _rTh("銘柄", { width: 52 }),
              _rTh("時間", { width: 44 }),
              _rTh("シグナル", { width: 1, whiteSpace: "nowrap" }),
              _rTh("α値", { width: 32 }),
              _rTh("損切", { width: 34 }),
              _rTh("ライン", { width: 1 }),
              _rTh("E", { width: 26 }),
              _rTh("取引", { width: 26 }),
              _rTh("最終損益・詳細", { width: 84 }),
              React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "OS・損益詳細"),
              _rTh(React.createElement("span", { title: "EP足〜手じまい足の保有時間（1分足換算・時間かぶり判定と同基準）" }, "保有"), { width: 30 }),
              _rTh("実現損益", { width: 82 })
            )
          ),
          React.createElement("tbody", null, subRows),
          React.createElement("tfoot", null, totRow)
        )
      );
    };
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
        if (_elInclTotal(s)) {  // 合計額算入: 除外記録は実現損益/エントリー数スカラーに加えない（行表示は全件）2026-06-18
          var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
          if (rv != null) _pbRealByStk[stk] += rv;
          if (s.entered === true) _pbEntByStk[stk]++;
        }
      });
    });
    var _pbStkOrder = ["JX金属", "フジクラ", "SBG"];
    var _pbStks = Object.keys(_pbByStk).sort(function(a, b) {
      var ia = _pbStkOrder.indexOf(a), ib = _pbStkOrder.indexOf(b);
      if (ia !== -1 || ib !== -1) { if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; }
      return a < b ? -1 : a > b ? 1 : 0;
    });

    // ===== 今週の損益データ（表示中の日付が属する週の月〜金）=====
    var _wkMon = getMondayOf(new Date(date + "T00:00:00"));
    _wkMon.setDate(_wkMon.getDate() + wkWeekOffset * 7);
    var _wkDates = Array.from({ length: 5 }, function(_, _wi0) {
      var _wd0 = new Date(_wkMon); _wd0.setDate(_wd0.getDate() + _wi0);
      return _wd0.getFullYear() + "-" + String(_wd0.getMonth() + 1).padStart(2, "0") + "-" + String(_wd0.getDate()).padStart(2, "0");
    });
    var _wkByDay = {}, _wkAllRecs = [];
    _wkDates.forEach(function(_wd) {
      var _arr = [];
      var _itemsW = (data.trades && data.trades[_wd] && data.trades[_wd].items) || [];
      allStocks.forEach(function(_stk) {
        var _cW = _pbCharts[_stk + "_" + _wd];
        var _sigsW = (_cW && Array.isArray(_cW.signals)) ? _cW.signals : [];
        _sigsW.forEach(function(_sig) {
          var _s = _compatSignal(_sig);
          var _it = null;
          if (_s.itemId != null) { for (var _wj = 0; _wj < _itemsW.length; _wj++) { if (String(_itemsW[_wj].id) === String(_s.itemId)) { _it = _itemsW[_wj]; break; } } }
          var _rec = { date: _wd, stock: _stk, signal: _s, item: _it };
          _arr.push(_rec); _wkAllRecs.push(_rec);
        });
      });
      _wkByDay[_wd] = _arr;
    });
    // 週用α解決（r.date基準）: signal.alphaVal > 予想OS度
    var _wkRecKey = function(r) { return r.stock + "_" + r.date + "_" + (r.signal.id || r.signal.time || ""); };
    var _wkAlphaActualOf = function(r) {
      var s = r.signal;
      return s && s.alphaVal != null && s.alphaVal !== "" ? Number(s.alphaVal) : _gradeAlpha(s && s.difficulty);
    };
    // α値シミュ(非永続・今週用)を最優先。未設定なら実際の採用α値。サマリー＋明細の両方で使用（本日と同仕様）。
    var _wkAlphaOf = function(r) {
      var _ov = simAlphaWk[_wkRecKey(r)];
      if (_ov != null && _ov !== "" && !isNaN(Number(_ov))) return Number(_ov);
      return _wkAlphaActualOf(r);
    };
    var _wkCutActualOf = function(r) {
      var _c = _pbCharts[r.stock + "_" + r.date];
      return _c && _c.cutLine != null ? _c.cutLine : 15;
    };
    // 損切り値シミュ(非永続・今週用)を最優先。未設定なら実際の損切り値。サマリー＋明細で使用。
    var _wkCutOf = function(r) {
      var _ov = simCutWk[_wkRecKey(r)];
      if (_ov != null && _ov !== "" && !isNaN(Number(_ov))) return Number(_ov);
      return _wkCutActualOf(r);
    };
    var _wkMainEl = (function() {
      var _DOWJP = ["日", "月", "火", "水", "木", "金", "土"];
      var _wkHoli = _buildHolidayDateSet(data && data.trades, data && data.custom && data.custom.eventCategories);   // 休場日（カレンダーの「祝日・休場」イベント）＝日付行に「休」表示 2026-07-14e
      var _wkBadge = function(g) {
        var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
        return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border, fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 } }, g);
      };
      // sub=100株換算の下段（実現損益列だけ渡す）2026-08-04
      // 2026-08-05b ラベル／グレードバッジ／額を3列gridで縦ぞろえするセル（ユーザー要望
      // 「1日平均 A+ 3367円 みたいな並び」「グレードバッジ・額がきれいに縦ぞろいするように」）。
      // 旧は補助行を [バッジ][ラベル][額] の順でinline-flexに並べていたため、行ごとにラベル幅が
      // 違うとバッジも額もガタついていた。gridにすると列が揃う。
      // rows = [{ label: node|null, grade: string|null, amount: number, ref: node|null }]
      var _wkAvgLabel = React.createElement(React.Fragment, null, "1日", React.createElement("br"), "平均");   // 「1日」「平均」の2行構成（ユーザー指定）
      var _wkRefNode = function(v) {
        if (v == null) return null;
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", color: "#9CA3AF", fontWeight: 600, marginLeft: 2 } },
          "（", _elHoldGradeBadge(_profitGradeFromPnl(v, 1)),
          React.createElement("span", { style: { color: _elPnlColor(v) } }, _elPnlFmt(v)), "）");
      };
      var _wkStack = function(rows) {
        var cells = [];
        rows.forEach(function(r, i) {
          cells.push(React.createElement("span", { key: "l" + i, style: { fontSize: 9, color: "#94A3B8", fontWeight: 700, lineHeight: 1.15, textAlign: "right", justifySelf: "end", whiteSpace: "nowrap" } }, r.label || null));
          cells.push(React.createElement("span", { key: "b" + i, style: { display: "inline-flex", alignItems: "center" } }, r.grade ? _wkBadge(r.grade) : null));
          cells.push(React.createElement("span", { key: "a" + i, style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
            React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(r.amount) } }, _elPnlFmt(r.amount)), r.ref || null));
        });
        return React.createElement("span", { style: { display: "inline-grid", gridTemplateColumns: "auto auto auto", columnGap: 3, rowGap: 2, alignItems: "center", justifyItems: "start" } }, cells);
      };
      // 実現損益セル。sub=100株換算（株数がある時だけ）／avg=1日平均（週合計かつ複数営業日の時だけ）。
      // 最終損益と同じく、この列のバッジも「総額÷営業日数」で判定しているので平均額を出して根拠を見せる。
      var _wkPnlCell = function(grade, sum, sub, avg, avgGrade) {
        if (!grade || grade === "Z" || sum == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        var rows = [{ label: null, grade: grade, amount: sum, ref: null }];
        if (sub != null) rows.push({ label: "100株", grade: _profitGradeFromPnl(sub, 1), amount: sub, ref: null });   // 100株換算は通常スケール 2026-08-05
        if (avg != null) rows.push({ label: _wkAvgLabel, grade: avgGrade, amount: avg, ref: null });
        return _wkStack(rows);
      };
      var _wkTh = function(label, extra) {
        return React.createElement("th", { style: Object.assign({ padding: "4px 3px", fontWeight: 700, borderBottom: "2px solid #ddd", textAlign: "center", fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap", color: "#555" }, extra || {}) }, label);
      };
      var _wkEntCnt = function(rs) { return rs.filter(function(r) { return _elIsEntered(r.signal, r.item); }).length; };
      var _wkAvgOs = function(rs) {
        var a = rs.map(function(r) { return r.signal.osVal; }).filter(function(v) { return v != null && v !== ""; }).map(Number);
        return a.length ? Math.round(a.reduce(function(x, y) { return x + y; }, 0) / a.length * 10) / 10 : null;
      };
      // 2026-08-05b タグ列は撤去（ユーザー要望「週間データ・月間データについてはタグ欄は不要」）。
      // 集約していた_wkTagsも呼び出し元が無くなったので削除した（本日の損益データのタグ列は据置）。
      // 2026-08-05b 第6引数tradeTags（「ノーシグナル／有効シグナルなし」を最終損益欄に出すチップ）は
      // ユーザー要望「最終損益欄にノーシグナルなどの表記は不要」で撤去。集約元の_wdTradeTagsごと削除した。
      var _wkRow = function(label, labelColor, recs, isTotal, rowKey) {
        // 合計額算入: 除外記録(includeInTotal===false)はサマリ集計から外す。明細展開(_wkExpRow)は全件のまま。2026-06-18
        // 今週テーブルの各行（週合計・日別）は全銘柄横断のグランド集計＝②データのみ（候補で未指定）も除外 2026-07-22e（銘柄別のα推奨は_wkGroupsで別途・据置）。
        // 2026-07-29 除外件数を「合計から外れた記録すべて」に拡張。旧実装は _elIsExcluded（不算入/スルー）だけを
        //   数えていたが、下の行は _elInclTotalAmt で【選外銘柄（②データのみ）】も落とす。選外は新規記録なら
        //   自動で includeInTotal=false が入り不算入として数えられるものの、includeInTotal 未設定の旧記録は
        //   _isDataOnly 側でしか落ちない（app-05.js:3135 で両者は排他）ため、件数からも除外列からも黙って消えていた。
        //   件 = st.total + _exclN なので、ここを揃えると「件＝生の記録数」「除外＝合計に入らなかった内訳」が復活する。
        var _wkAllRecs = recs || [];
        var _exclN = _wkAllRecs.filter(function(r) { return !_elInclTotalAmt(data, r); }).length;  // 合計から外れた記録があれば青点を出す
        recs = _wkAllRecs.filter(function(r) { return _elInclTotalAmt(data, r); });
        var st = _elCalcStats(recs, data);
        // 時間かぶり除外: 金額集計(EP/H1/H2/実現)は_wkRecsM＝被り除外後・件数系(st/件/到達等)はrecsのまま 2026-07-07
        var _wkRecsM = recs.filter(function(r) { return !_elCollExcluded(data, r); });   // 金額集計母数＝時間かぶり除外のみ（2026-07-18g 要審議も算入＝見送りと同じ・_elIsReview除外を撤回）
        var _wkStM = _wkRecsM.length === recs.length ? st : _elCalcStats(_wkRecsM, data);
        var _wkRowDays = _elBizDaysOf(_wkRecsM, data);
        var _ent = _wkEntCnt(recs);
        var _osv = _wkAvgOs(recs);
        var _isExp = !!pnlTableExpandSet[rowKey];
        var _allExcl = recs.length === 0 && _exclN > 0;  // 取引はあるが全部不算入
        var _allMiss = _elAllMissRow(recs, _wkAlphaOf, _wkCutOf);  // 全記録E基準未達(全miss)→想定/H1/H2に「Q 0」
        var bb = isTotal ? "2px solid #ddd" : "1px solid #e0ddd6";
        var bt = isTotal ? "2px solid #ccc" : "none";
        var br = "1px solid #e0ddd6";
        var _td = function(child, extra) { return React.createElement("td", { style: Object.assign({ padding: "3px 4px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, whiteSpace: "nowrap" }, extra || {}) }, child); };
        return React.createElement("tr", {
          key: rowKey,
          style: Object.assign({ background: _isExp ? "#FFF7ED" : (isTotal ? "#F5F0E8" : "transparent"), cursor: "pointer" }, _allExcl ? { background: "#EFF8FF", borderLeft: "3px solid #38BDF8", opacity: 0.72 } : null),
          onClick: function() { setPnlTableExpandSet(function(prev) { var n = Object.assign({}, prev); if (n[rowKey]) delete n[rowKey]; else n[rowKey] = true; return n; }); }
        },
          React.createElement("td", { style: { padding: "3px 5px", textAlign: "left", fontWeight: isTotal ? 700 : 600, fontSize: 11, whiteSpace: "nowrap", color: labelColor || "#9A3412", borderBottom: bb, borderTop: bt, borderRight: br } },
            React.createElement("span", { style: { marginRight: 4, color: "#F97316", fontSize: 10 } }, _isExp ? "▼" : "▶"), label,
            (!isTotal && _exclN > 0) ? _elExclDot(_exclN, { marginLeft: 5, verticalAlign: "middle" }) : null),
          _td(st.total + (_exclN || 0), { fontWeight: isTotal ? 700 : 400 }),
          _td(st.reach || "0", { color: "#374151", fontWeight: isTotal ? 700 : ((st.reach || 0) > 0 ? 700 : 400) }),
          _td(((st.win || 0) + (st.tri || 0)) || "0", { color: "#1E8449", fontWeight: ((st.win || 0) + (st.tri || 0)) ? 700 : 400 }),
          _td(st.even || "0", { color: "#D97706", fontWeight: (st.even || 0) > 0 ? 700 : 400 }),
          _td(st.loss || "0", { color: "#DC2626", fontWeight: st.loss ? 700 : 400 }),
          _td(st.stop || "0", { color: "#7F1D1D", fontWeight: st.stop ? 700 : 400 }),
          _td(st.miss || "0", { color: "#6B7280" }),
          _td(_exclN || "0", { color: "#0284C7", fontWeight: (_exclN || 0) > 0 ? 700 : 400 }),
          _td((function() {
            var _pnlNode = (function() {
            if (_allExcl) return _elNotInclBadge();
            if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _h2Tot = null, _h2Cnt = 0, _h2Ref = null, _h2RefCnt = 0;
            _wkRecsM.forEach(function(r) {
              var s = r.signal;
              var _aR = _wkAlphaOf(r); var _cutLR = _wkCutOf(r);
              var _h2p = _elHoldFinalParts(s, _aR, _cutLR);
              if (_h2p.main != null) { _h2Tot = (_h2Tot || 0) + _h2p.main; _h2Cnt++; }
              if (_h2p.ref != null) { _h2Ref = (_h2Ref || 0) + _h2p.ref; _h2RefCnt++; }
            });
            if (_h2Cnt === 0 && _h2RefCnt === 0) return _allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—");
            // 本体0件で参考(（）内)だけある行は、旧実装どおり「— （…）」の1行で出す（gridは額が必須なので通さない）。
            if (_h2Cnt === 0) return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { color: "#ccc" } }, "—"), _elHold2RefSuffix(_h2Tot, _h2Ref, _h2RefCnt));
            var _h2g = _profitGradeFromPnl(_wkRowDays > 0 ? Math.round(_h2Tot / _wkRowDays) : _h2Tot, _h2Cnt);
            var _h2Rows = [{ label: null, grade: _h2g, amount: _h2Tot, ref: _elHold2RefSuffix(_h2Tot, _h2Ref, _h2RefCnt) }];
            // 週合計だけ、最終損益額の下に1日平均を出す（2026-08-05・ユーザー要望）。
            // この表のグレードバッジは元々「総額÷_wkRowDays」で判定しているのに表示は総額だけだったため、
            // 例えば総額+9,400円にA+が付いていても判定の実体（3営業日で1日平均+3,133円）が見えなかった。
            // _wkRowDays=_elBizDaysOf＝記録の初日〜最終日の営業日数（休場除く。取引が無い中日も数える＝
            // 記録のある日数ではない）。バッジ判定と割る数を必ず同じにするため、ここでも_wkRowDaysを使う。
            // 日別行と_wkRowDays<=1の週は平均＝総額で同じ数字が2行並ぶだけなので出さない。
            // 2026-08-05b （）内の参考額（△も保有し続けた場合）も同じ日数で割って平均行に添える＝
            // 本行に（）が出ているのに平均行だけ無い、という食い違いを無くす（ユーザー指摘）。
            if (isTotal && _wkRowDays > 1) {
              var _h2Avg = Math.round(_h2Tot / _wkRowDays);
              var _h2AvgRef = (_h2RefCnt > 0 && _h2Ref != null) ? Math.round((_h2Tot + _h2Ref) / _wkRowDays) : null;
              _h2Rows.push({ label: _wkAvgLabel, grade: _profitGradeFromPnl(_h2Avg, _h2Cnt), amount: _h2Avg, ref: _wkRefNode(_h2AvgRef) });
            }
            return React.createElement("span", { title: isTotal && _wkRowDays > 1 ? ("1営業日あたりの最終損益。記録の初日〜最終日の営業日数" + _wkRowDays + "日で割った額（休場日は除く。取引が無かった中日も日数に入る）。この表のグレードバッジはこの平均額で判定している。") : undefined }, _wkStack(_h2Rows));
          })()),
          _td(_allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _elDetailPnlStackNode(_wkRecsM, _wkAlphaOf, _wkCutOf, _wkBadge, _allMiss, _wkRowDays)),
          _td(_allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : (function() {
            var _rvRaw = _ent > 0 ? _wkStM.sumPnlRaw : null;
            var _rvAvg = (isTotal && _wkRowDays > 1 && _rvRaw != null) ? Math.round(_rvRaw / _wkRowDays) : null;
            return _wkPnlCell(
              _profitGradeFromPnlReal(_wkRowDays > 0 ? Math.round(_wkStM.sumPnlRaw / _wkRowDays) : _wkStM.sumPnlRaw, (_ent > 0 && _wkStM.sumPnlRaw !== 0) ? _ent : 0),
              _rvRaw,
              (_ent > 0 && _wkStM.realHasShares) ? _wkStM.sumPnl : null,
              _rvAvg,
              _rvAvg != null ? _profitGradeFromPnlReal(_rvAvg, _ent) : null);
          })())
        );
      };
      // 週: 銘柄別グルーピング + 推奨基本α値（5〜20円・1円刻み）計算
      var _wkByStk = {};
      _wkAllRecs.forEach(function(r) { if (!_wkByStk[r.stock]) _wkByStk[r.stock] = []; _wkByStk[r.stock].push(r); });
      var _wkStks = Object.keys(_wkByStk).sort(function(a, b) { var ia = _pbStkOrder.indexOf(a), ib = _pbStkOrder.indexOf(b); if (ia !== -1 || ib !== -1) { if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; } return a < b ? -1 : a > b ? 1 : 0; });
      var _wkGroups = _wkStks.map(function(sk) { return { label: sk, recs: _wkByStk[sk].filter(function(r) { return _elInclData(r.signal); }) }; });   // 今週の推奨α表＝分析母数（データ算入）2026-07-22f
      var _wkIdealEl = React.createElement("div", { style: { marginTop: 0, marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "α 推奨基本α値（5〜20円・週間）"),
        React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "週(月〜金)の各銘柄の全記録に同じαを当てて、到達率" + _EL_ANA_REACH_DEF + "%以上・損切り率(最終)≤" + Math.round(_EL_BASE_MAX_STOPRATE * 100) + "%・E成立≥" + _EL_BASE_MIN_N + "件・頻度" + _EL_FREQ_MAX + "未満・黒字を満たすαの中でΣ最終損益（手じまい・累計）が最大のα（該当なしは到達率" + _EL_ANA_REACH_FLOOR2 + "%へ緩和して参考・薄い高α/約定しにくい高α/赤字αは除外・データ不足時は参考表示）。応用α目安＝応用〇局面で採用する独立α値（応用〇の記録から算出）。"),
        _elBaseAlphaTableV2(_wkGroups, _wkCutOf));
      var _wkExpRow = function(recs, rowKey) {
        var _isTotal = rowKey === "wk__total__";
        return React.createElement("tr", { key: rowKey + "_exp" },
          React.createElement("td", { colSpan: 13, style: { padding: "6px 8px", background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
            _isTotal ? _wkIdealEl : null,
            recs.length ? React.createElement("div", { style: { margin: "2px 4px 8px 18px", border: "1px solid #FDBA74", borderRadius: 8, background: "#fff", padding: "6px 8px", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, _pnlDetailTableEl(recs, _wkAlphaOf, _wkCutOf, "time", { val: simAlphaWk, set: setSimAlphaWk, keyOf: _wkRecKey, actualOf: _wkAlphaActualOf }, { val: simCutWk, set: setSimCutWk, keyOf: _wkRecKey, actualOf: _wkCutActualOf }, true, true)) : React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "記録なし")
          )
        );
      };
      var _wkNavBtn = function(_lbl, _onCl) { return React.createElement("button", { onClick: _onCl, style: { padding: "2px 9px", fontSize: 13, fontWeight: 700, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#555", lineHeight: 1.2 } }, _lbl); };
      return React.createElement("div", { style: Card },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" } },
          _wkNavBtn("←", function() { setWkWeekOffset(function(o) { return o - 1; }); }),
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#333" } }, "📅 今週の損益データ"),
          _wkNavBtn("→", function() { setWkWeekOffset(function(o) { return o + 1; }); }),
          wkWeekOffset !== 0 ? React.createElement("button", { onClick: function() { setWkWeekOffset(0); }, style: { padding: "2px 8px", fontSize: 11, fontWeight: 600, background: "#FFEDD5", border: "1px solid #FB923C", borderRadius: 6, cursor: "pointer", color: "#9A3412" } }, "今週へ") : null,
          (function(){ var _xc = _elExclCountRecs(_wkAllRecs); return _xc > 0 ? React.createElement("span", { title: "計算・データに算入しない記録の件数", style: { fontSize: 10, fontWeight: 700, color: "#0284C7", background: "#E0F2FE", border: "1px solid #7DD3FC", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" } }, "不算入 " + _xc + "件") : null; })(),
          (function(){ var _cc = _elCollExclCountRecs(data, _wkAllRecs); return _cc > 0 ? React.createElement("span", { title: "時間かぶりで合計から除外した記録の件数（同日5分以内ペアの遅い方／同時刻なら損益が大きい方・件数系には残る）", style: { fontSize: 10, fontWeight: 700, color: "#6D28D9", background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" } }, "被り除外 " + _cc + "件") : null; })()
        ),
        React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 6, fontWeight: 400 } }, _wkDates[0].slice(5).replace("-", "/") + "（月）〜 " + _wkDates[4].slice(5).replace("-", "/") + "（金）"),
        _wkAllRecs.length ? React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 10 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { background: "#f5f4f0" } },
                _wkTh("曜日", { textAlign: "left" }), _wkTh("件"),
                _wkTh(React.createElement("span", { style: { color: "#374151" }, title: "EPに到達した件数＝利確＋△＋確損＋損切の合計。件＝到達＋未達＋除外" }, "到達")), _wkTh(React.createElement("span", { style: { color: "#1E8449" } }, "利確")), _wkTh(React.createElement("span", { style: { color: "#D97706" }, title: "最終損益が±0（トントン）" }, "△")), _wkTh(React.createElement("span", { style: { color: "#DC2626" }, title: "確定損" }, "確損")), _wkTh(React.createElement("span", { style: { color: "#7F1D1D" }, title: "損切り" }, "損切")), _wkTh(React.createElement("span", { style: { color: "#6B7280" } }, "未達")), _wkTh(React.createElement("span", { style: { color: "#0284C7" }, title: "不算入＋スルー（集計に算入しない記録）" }, "除外")),
                _wkTh(React.createElement("span", { title: "○が途切れた所（×/△/損切り）で手じまいした最終PnL＝（）外。（）内=△も保有し続けた場合。旧H２結果損益と同一基準" }, "最終損益")), _wkTh(React.createElement("span", { title: "EP損益（○のみ）／H1損益／最終損益を縦積み。最終＝○が続く限り手じまい足まで保有した損益＝最終損益列と同値" }, "詳細損益")), _wkTh("実現損益")
              )
            ),
            React.createElement("tbody", null,
              [
                _wkRow("週合計", "#555", _wkAllRecs, true, "wk__total__"),
                !!pnlTableExpandSet["wk__total__"] ? _wkExpRow(_wkAllRecs, "wk__total__") : null
              ].concat(
                _wkDates.map(function(_wd) {
                  var _dobj = new Date(_wd + "T00:00:00");
                  var _lbl = React.createElement(React.Fragment, null, _DOWJP[_dobj.getDay()] + " " + _wd.slice(5).replace("-", "/"), _wkHoli[_wd] ? React.createElement("span", { title: "休場日（祝日・休場）", style: { marginLeft: 4, fontSize: 9, fontWeight: 700, color: "#7C3AED", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 3, padding: "0 3px", verticalAlign: "middle" } }, "休") : null);
                  var _rk = "wk_" + _wd;
                  return [
                    _wkRow(_lbl, null, _wkByDay[_wd], false, _rk),
                    !!pnlTableExpandSet[_rk] ? _wkExpRow(_wkByDay[_wd], _rk) : null
                  ];
                })
              )
            )
          )
        ) : React.createElement("div", { style: { fontSize: 12, color: "#bbb", textAlign: "center", padding: "16px 0" } }, "この週は記録がありません")
      );
    })();
    var _soukatsuEl = React.createElement("div", { style: Card }, React.createElement(MemoSection, {
      memo: dd.tradesSummaryMemo || (dd.summary ? { text: (dd.summary || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"), images: [] } : { text: "", images: [] }),
      onChange: function(v) { updDay("tradesSummaryMemo", v); if (dd.summary) updDay("summary", ""); },
      title: "📝 本日の総括",
      guardKey: "tradesSummary_" + date
    }));
    // 2026-08-04 「🎯 本日の推奨基本α値（簡略・銘柄別）」欄は撤去（ユーザー指示・不要）。組み立てごと削除＝毎レンダーの計算も走らない。
    // 部品 _elBaseAlphaSimpleBoardV2(app-06) は残置＝記録帳側の推奨α表示は不変。
    // 並びも変更: 今週の損益データ(_wkMainEl)を本日の損益データの直後へ移し、本日の総括(_soukatsuEl)を一番下にした。
    if (!_pbStks.length) return React.createElement(React.Fragment, null, _wkMainEl, _soukatsuEl);
    
    // ===== 選外銘柄（その日の日替わり銘柄に選ばれなかった候補）を主表から切り出す 2026-07-29 =====
    // 判定は【銘柄レベル】＝候補プール(custom.rotatingStocks)に居て、その日のdailyStockでない銘柄。
    //   記録レベルの includeInTotal / _isDataOnly は2経路に分かれており（新規記録は自動でincludeInTotal=false、
    //   未設定の旧記録は_isDataOnly側で合計除外）、_elIsExcluded だけで切ると後者が主表に残って
    //   「合計行と銘柄行の数字が理由不明でズレる」状態が解消しない。銘柄レベルなら両経路とも同じ表に入る。
    // ただし手動で合計算入にした記録（includeInTotal=true / totalOverride:"in"）は合計に効いているので主表側へ残す
    //   ＝「主表の合計＝主表に見えている行」が常に成立する（ユーザー選択 2026-07-29）。
    var _pbRotPool = (data.custom && Array.isArray(data.custom.rotatingStocks)) ? data.custom.rotatingStocks : [];
    var _pbDayStk = (data.dailyStock || {})[date] || "";
    var _pbIsRotOut = function(stk) { return _pbRotPool.indexOf(stk) >= 0 && stk !== _pbDayStk; };
    var _pbOutOf = function(r) { return _pbIsRotOut(r.stock) && !_elInclTotalAmt(data, r); };
    var _pbByStkMain = {}, _pbByStkOut = {};
    _pbStks.forEach(function(sk) {
      var _m = [], _o = [];
      _pbByStk[sk].forEach(function(r) { (_pbOutOf(r) ? _o : _m).push(r); });
      if (_m.length) _pbByStkMain[sk] = _m;
      if (_o.length) _pbByStkOut[sk] = _o;
    });
    var _pbStksMain = _pbStks.filter(function(sk) { return !!_pbByStkMain[sk]; });
    var _pbStksOut = _pbStks.filter(function(sk) { return !!_pbByStkOut[sk]; });
    // 銘柄別の実現損益/エントリー数をバケット単位で出し直す。1銘柄が主表と選外表に割れた場合に
    // 銘柄スカラー(_pbRealByStk/_pbEntByStk=全記録ぶん)を使うと主表側へ選外分が混じるため。
    // 割れていない銘柄では従来値と完全一致する（同じ_elInclTotalフィルタ・同じ記録）。
    var _pbRealOf = function(recs) { var t = 0; (recs || []).forEach(function(r) { if (_elInclTotal(r.signal)) { var v = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign); if (v != null) t += v; } }); return t; };
    var _pbEntOf = function(recs) { var n = 0; (recs || []).forEach(function(r) { if (_elInclTotal(r.signal) && r.signal.entered === true) n++; }); return n; };
    // 行キー→記録の対応（明細展開_pbExpRow用）。選外表の行は "__out__"+銘柄 で主表と別キーにする
    // ＝同じ銘柄が両表に出ても展開状態(pnlTableExpandSet)が連動しない。
    var _pbRowRecs = {};

    var _pbAllRecs = [];
    _pbStksMain.forEach(function(sk) { _pbAllRecs = _pbAllRecs.concat(_pbByStkMain[sk]); _pbRowRecs[sk] = _pbByStkMain[sk]; });
    var _pbOutRecs = [];
    _pbStksOut.forEach(function(sk) { _pbOutRecs = _pbOutRecs.concat(_pbByStkOut[sk]); _pbRowRecs["__out__" + sk] = _pbByStkOut[sk]; });
    _pbRowRecs["__total__"] = _pbAllRecs;
    _pbRowRecs["__outtotal__"] = _pbOutRecs;
    // 合計額算入: 統計/合計は除外記録を抜いた _pbAllRecsT で計算（明細・行表示は _pbAllRecs/_pbByStkMain の全件のまま）2026-06-18。
    // 本日「合計」行は全銘柄横断のグランド集計＝②データのみ（候補で未指定）も除外 2026-07-22e。
    var _pbAllRecsT = _pbAllRecs.filter(function(r) { return _elInclTotalAmt(data, r); });
    // 実現損益/エントリー数のグランド積上げも_pbAllRecsT（②データのみ除外済）から再計算＝銘柄別スカラーの単純合算だと候補銘柄が混入するため（override差も正しく反映）2026-07-22e。
    var _pbAllReal = 0, _pbAllEnt = 0;
    _pbAllRecsT.forEach(function(r) {
      var _rvAll = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
      if (_rvAll != null) _pbAllReal += _rvAll;
      if (r.signal.entered === true) _pbAllEnt++;
    });
    var _pbAll = _elCalcStats(_pbAllRecsT, data, function(r) { return { alpha: _pbAlphaOf(r), cutLine: _pbCutOf(r) }; });
    // 勝敗カウント（αシミュ対応）: EP起算v2/v3もEP足基準で判定（_elDynResult。旧式はEP=OS2/3成立を未達に誤算入していた）
    var _pbDynOkNg = function(recs) { var ok = 0, ng = 0, draw = 0, miss = 0, win = 0, tri = 0, even = 0, loss = 0, stop = 0; (recs || []).forEach(function(r) { var s = r.signal; var _a = _pbAlphaOf(r), _c = _pbCutOf(r); var res = _elDynResult(s, _a, _c); if (res === "ok") ok++; else if (res === "ng") ng++; else if (res === "draw") draw++; else if (res === "miss") miss++; var wb = _elWinBucket(s, _a, _c); if (wb === "win") win++; else if (wb === "tri") tri++; else if (wb === "even") even++; else if (wb === "loss") loss++; else if (wb === "stop") stop++; }); var tot = ok + ng; return { ok: ok, ng: ng, draw: draw, miss: miss, reach: win + tri + even + loss + stop, win: win, tri: tri, even: even, loss: loss, stop: stop, winPct: tot > 0 ? Math.round(ok / tot * 100) : null }; };
    var _pbFmt = function(v) { return (v > 0 ? "+" : "") + v + "円"; };
    var _pbCol = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
    var _pbTh = function(label, extra) {
      return React.createElement("th", { style: Object.assign({ padding: "4px 3px", fontWeight: 700, borderBottom: "2px solid #ddd", width: "1%", textAlign: "center", fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap" }, extra || {}) }, label);
    };
    var _pbSlash = function(sum, ev, grade, sumFw) {
      if (sum === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        grade ? _pbBadge(grade) : null,
        React.createElement("span", { style: { fontWeight: sumFw || 600, color: _pbCol(sum) } }, _pbFmt(sum))
      );
    };
    var _pbABAll = function(recs, allSum, allEv, grade, sumKey, evKey, dynAbSum) {
      // 全ランク(全体)の合計のみ表示。B以上/全ランクのAB分割は廃止。
      if (allSum === 0 && allEv == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      var allCnt = (recs || []).length;
      var allGrade = allCnt > 0 ? _profitGradeFromPnl(allSum, allCnt) : null;
      return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        allGrade ? _pbBadge(allGrade) : null,
        React.createElement("span", { style: { fontWeight: 600, color: _pbCol(allSum) } }, _pbFmt(allSum))
      );
    };
    
    var _pbRealABAll = function(recs) {
      // 全ランク(全体)の実現損益のみ表示。AB分割は廃止。
      if (!recs || !recs.length) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      var allSt = _elCalcStats(recs, data);
      var _rawPnl = function(rs) {
        return rs.reduce(function(a, r) {
          var v = (r.item && r.item.pnl != null) ? Number(r.item.pnl)
                : _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
          return a + (v != null ? v : 0);
        }, 0);
      };
      var _entCnt = function(rs) { return rs.filter(function(r) { return _elIsEntered(r.signal, r.item); }).length; };
      var allRaw = _rawPnl(recs), allEnt = _entCnt(recs);
      if (allSt.sumPnlRaw === 0 && allEnt === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      // 2026-08-04 実額を主に。_profitGradeFromPnlReal は実額スケール（A+=25000円）＝凡例と同じなので、実額合計で判定する。
      // 旧: per-100換算の allSt.sumPnl を渡していたため、凡例の目盛りと1桁ずれたランクが出ていた。
      var allGrade = allEnt > 0 ? _profitGradeFromPnlReal(allSt.sumPnlRaw, allEnt) : "D";
      var _allMain = React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        _pbBadge(allGrade),
        React.createElement("span", { style: { fontWeight: 600, color: _pbCol(allSt.sumPnlRaw) } }, _pbFmt(allSt.sumPnlRaw))
      );
      if (!allSt.realHasShares) return _allMain;
      return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap" } },
        _allMain, React.createElement("span", { style: { fontSize: 9, fontWeight: 600, color: "#94A3B8" } }, "100株 " + _elPnlFmt(allSt.sumPnl)));
    };
    var _pbRow = function(label, st, isTotal, labelColor, gradeReal, gradePlanned, gradeMax, hasEntry, rowKey, tags, recs, exclN) {
      var bb = isTotal ? "2px solid #ddd" : "1px solid #e0ddd6";
      var bt = isTotal ? "2px solid #ccc" : "none";
      var br = "1px solid #e0ddd6";
      var isExp = !!pnlTableExpandSet[rowKey];
      var bg = isExp ? "#FFF7ED" : (isTotal ? "#F5F0E8" : "transparent");
      var keyRef = rowKey;
      var _allExcl = (!recs || recs.length === 0) && (exclN || 0) > 0;  // 取引はあるが全部不算入(算入0件)
      var _allMiss = _elAllMissRow(recs, _pbAlphaOf, _pbCutOf);  // 全記録E基準未達(全miss)→想定/H1/H2に「Q 0」
      var _pbRecsM = (recs || []).filter(function(r) { return !_elCollExcluded(data, r); });  // 時間かぶり除外のみ（金額集計用。2026-07-18g 要審議も算入＝見送りと同じ・_elIsReview除外を撤回）
      return React.createElement("tr", {
        style: Object.assign({ background: bg, cursor: rowKey ? "pointer" : "default" }, _allExcl ? { background: "#EFF8FF", borderLeft: "3px solid #38BDF8", opacity: 0.72 } : null),
        onClick: rowKey ? function() { setPnlTableExpandSet(function(prev) { var n = Object.assign({}, prev); if (n[keyRef]) delete n[keyRef]; else n[keyRef] = true; return n; }); if (isExp) setPnlRecordExpandSet({}); } : undefined
      },
        React.createElement("td", { style: { padding: "3px 5px", textAlign: "left", fontWeight: isTotal ? 700 : 600, fontSize: 11, whiteSpace: "nowrap", width: "auto",
          color: labelColor || "#9A3412", borderBottom: bb, borderTop: bt, borderRight: br } },
          rowKey ? React.createElement("span", { style: { marginRight: 4, color: "#F97316", fontSize: 10 } }, isExp ? "▼" : "▶") : null,
          label,
          (exclN > 0) ? _elExclDot(exclN, { marginLeft: 5, verticalAlign: "middle" }) : null,
          !isTotal && React.createElement("div", { style: { fontSize: 9, fontWeight: 400, color: "#0369A1", marginTop: 1 } }, "α:各記録"),
          isExp ? React.createElement("button", {
            onClick: function(e) { e.stopPropagation(); setPnlTableExpandSet(function(prev) { var n = Object.assign({}, prev); delete n[keyRef]; return n; }); },
            style: { marginLeft: 6, fontSize: 10, padding: "1px 5px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", color: "#666", lineHeight: 1.3, verticalAlign: "middle" }
          }, "閉じる") : null
        ),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, fontWeight: isTotal ? 700 : 400 } }, st.total + (exclN || 0)),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#374151", fontWeight: isTotal ? 700 : ((st.reach || 0) > 0 ? 700 : 400) } }, st.reach || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#1E8449", fontWeight: ((st.win || 0) + (st.tri || 0)) ? 700 : 400 } }, ((st.win || 0) + (st.tri || 0)) || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#D97706", fontWeight: (st.even || 0) > 0 ? 700 : 400 } }, st.even || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#DC2626", fontWeight: st.loss ? 700 : 400 } }, st.loss || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#7F1D1D", fontWeight: st.stop ? 700 : 400 } }, st.stop || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#6B7280", fontWeight: (st.miss || 0) > 0 ? 700 : 400 } }, st.miss || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#0284C7", fontWeight: (exclN || 0) > 0 ? 700 : 400 } }, exclN || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          (function() {
            if (_allExcl) return _elNotInclBadge();
            if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _h2Tot = null, _h2Cnt = 0, _h2Ref = null, _h2RefCnt = 0;
            _pbRecsM.forEach(function(r) {
              var s = r.signal;
              var _aR = _pbAlphaOf(r); var _cutLR = _pbCutOf(r);
              var _h2p = _elHoldFinalParts(s, _aR, _cutLR);
              if (_h2p.main != null) { _h2Tot = (_h2Tot || 0) + _h2p.main; _h2Cnt++; }
              if (_h2p.ref != null) { _h2Ref = (_h2Ref || 0) + _h2p.ref; _h2RefCnt++; }
            });
            if (_h2Cnt === 0 && _h2RefCnt === 0) return _allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—");
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
              _h2Cnt > 0 ? (function() { var _h2g = _profitGradeFromPnl(_h2Tot, _h2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _h2g ? _pbBadge(_h2g) : null, React.createElement("span", { style: { fontWeight: 700, color: _h2Tot > 0 ? "#C0392B" : _h2Tot < 0 ? "#1E8449" : "#888" } }, (_h2Tot > 0 ? "+" : "") + _h2Tot.toLocaleString() + "円")); })() : (_h2RefCnt > 0 ? null : React.createElement("span", { style: { color: "#ccc" } }, "—")),
              _elHold2RefSuffix(_h2Tot, _h2Ref, _h2RefCnt));
          })()),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          _allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _elDetailPnlStackNode(_pbRecsM, _pbAlphaOf, _pbCutOf, _pbBadge, _allMiss)),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          _allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _pbRealABAll(_pbRecsM)),
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
      // 2026-07-29 行キー→記録は _pbRowRecs 経由（銘柄キー＝主表ぶん／"__out__"+銘柄＝選外表ぶん／
      //   "__total__"＝主表の合計／"__outtotal__"＝選外表の参考合計）。同じ銘柄が両表に出ても展開が連動しない。
      var _isTotKey = (rowKey === "__total__" || rowKey === "__outtotal__");
      var _isOutKey = (rowKey === "__outtotal__" || rowKey.indexOf("__out__") === 0);   // 選外表の行（"__outtotal__"は"__out__"で始まらないので衝突しない）
      var _stkOfKey = (rowKey.indexOf("__out__") === 0) ? rowKey.slice(7) : rowKey;     // 行キーから実銘柄名（損切りライン入力のcharts参照に使う）
      var expRecs = _isTotKey
        ? (_pbRowRecs[rowKey] || []).slice().sort(function(a, b) {
            if (pnlSortOrder === "time") {
              var ta = (a.signal.time || "99:99"), tb = (b.signal.time || "99:99");
              if (ta !== tb) return ta.localeCompare(tb);
              return a.stock.localeCompare(b.stock);
            }
            if (a.stock !== b.stock) return a.stock.localeCompare(b.stock);
            return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99");
          })
        : (_pbRowRecs[rowKey] || []).slice().sort(function(a, b) {
            return (a.signal.time || "99:99").localeCompare(b.signal.time || "99:99");
          });
      if (!expRecs.length) return null;
      var sortToggle = _isTotKey
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
        React.createElement("td", { colSpan: 13, style: { padding: 0, background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
          _isTotKey ? null : React.createElement("div", {
            style: { display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderBottom: "1px solid #f0ede6", flexWrap: "wrap" }
          },
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#555", whiteSpace: "nowrap" } }, "損切りライン"),
            React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
              React.createElement("input", {
                type: "number", inputMode: "numeric", step: "1",
                value: (function() { var _avc2 = _pbCharts[_stkOfKey + "_" + date]; return _avc2 && _avc2.cutLine != null ? String(_avc2.cutLine) : "15"; })(),
                onChange: function(e) {
                  var v = _toHankaku(e.target.value).trim();
                  var n = v === "" ? null : (isNaN(Number(v)) ? null : Number(v));
                  var _ck2 = _stkOfKey + "_" + date;
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
                function() { var _ckRef2 = _stkOfKey + "_" + date; save(function(prev) { var pCharts = Object.assign({}, (prev && prev.charts) || {}); var _ce2 = Object.assign({}, pCharts[_ckRef2] || {}); var _n2 = _ce2.cutLine != null ? _ce2.cutLine : 15; _ce2.cutLine = _n2 + 1; pCharts[_ckRef2] = _ce2; return Object.assign({}, prev, { charts: pCharts }); }); },
                function() { var _ckRef2 = _stkOfKey + "_" + date; save(function(prev) { var pCharts = Object.assign({}, (prev && prev.charts) || {}); var _ce2 = Object.assign({}, pCharts[_ckRef2] || {}); var _n2 = _ce2.cutLine != null ? _ce2.cutLine : 15; if (_n2 <= 1) return prev; _ce2.cutLine = _n2 - 1; pCharts[_ckRef2] = _ce2; return Object.assign({}, prev, { charts: pCharts }); }); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
            (function() {
              // 監査所見1（2026-07-12）: 旧=EP損益合計/結果損益合計(H1)・不算入/被り込み → 最終損益合計（手じまい・_elHoldFinalParts.main）＋_elInclTotal＋被り除外に統一＝折り畳み行/明細表と同一基準。
              var _recs = (expRecs || []).filter(function(r) { return r && (_isOutKey ? !_elIsThru(r.signal) : (rowKey === "__total__" ? _elInclTotalAmt(data, r) : _elInclTotal(r.signal))) && !_elCollExcluded(data, r); });   // 2026-07-29 選外表は算入フラグを見ない（選外は既定で算入OFFが入るため・スルーだけ外す）   // 2026-07-18g 要審議も最終損益合計バッジに算入（見送りと同じ・姉妹の_inclTpb:5627と統一）。グランド展開(__total__)は②データのみも除外 2026-07-22e
              var _totH2 = null, _totH2Cnt = 0;
              _recs.forEach(function(r) {
                var s = r.signal;
                var t2 = _elHoldFinalParts(s, _pbAlphaOf(r), _pbCutOf(r));
                if (t2 && t2.main != null) { _totH2 = (_totH2 || 0) + t2.main; _totH2Cnt++; }
              });
              if (_totH2Cnt === 0) return null;
              return React.createElement("span", { style: { display: "inline-flex", gap: 10, marginLeft: 8, paddingLeft: 8, borderLeft: "1px solid #f0ede6", flexWrap: "wrap" } },
                React.createElement("span", { style: { fontSize: 11, color: "#555", whiteSpace: "nowrap" } },
                  "最終損益合計: ",
                  React.createElement("span", { style: { fontWeight: 700, color: (_totH2||0) > 0 ? "#C0392B" : (_totH2||0) < 0 ? "#1E8449" : "#888" } },
                    ((_totH2||0) > 0 ? "+" : "") + (_totH2||0).toLocaleString() + "円"),
                  React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", marginLeft: 3 } }, "（" + _totH2Cnt + "件・○途切れ手じまい・被り除外後）"))
              );
            })()
          ),
          sortToggle,
          React.createElement("div", { style: { margin: "2px 4px 8px 18px", border: "1px solid #FDBA74", borderRadius: 8, background: "#fff", padding: "6px 8px", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, _pnlDetailTableEl(expRecs, _pbAlphaOf, _pbCutOf, pnlSortOrder, { val: simAlpha, set: setSimAlpha, keyOf: _pbRecKey, actualOf: _pbAlphaActualOf }, { val: simCut, set: setSimCut, keyOf: _pbRecKey, actualOf: _pbCutActualOf }, false, rowKey === "__total__")),
        )
      );
    };
    var _pbStockTags = function(stk) {
      var c = _pbCharts[stk + "_" + date] || {};
      return [].concat(c.chartShapeTags || [], c.stockTags || []).map(stripCat);
    };
    var _pbGradeLegend = (function() {
      var grades = ["A+","A-","B","C","D","E","F","G-","G+"];
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
        mkRow("実現損益", { "A+":"25000+", "A-":"20000～24999", B:"10000～19999", C:"1～9999", D:"0", E:"-1～-9999", F:"-10000～-19999", "G-":"-20000～-24999", "G+":"-25000-" }),
        mkRow("損益（EP/H1/H2/最終）", { "A+":"2500+", "A-":"2000～2499", B:"1000～1999", C:"1～999", D:"0", E:"-1～-999", F:"-1000～-1999", "G-":"-2000～-2499", "G+":"-2500-" })
      );
    })();
    
    
    
    
    // 2026-07-29 ヘッダ行は主表と選外表で共有（列構成を1箇所に保つ）。React要素は記述オブジェクトなので毎回生成する。
    var _pbHeadTr = function() {
      return React.createElement("tr", { style: { background: "#f5f4f0" } },
        _pbTh("銘柄", { width: 120, textAlign: "left" }),
        _pbTh("件", { width: 34 }),
        _pbTh(React.createElement("span", { style: { color: "#374151" } }, "到達"), { width: 36 }),
        _pbTh(React.createElement("span", { style: { color: "#1E8449" } }, "利確"), { width: 36 }),
        _pbTh(React.createElement("span", { style: { color: "#D97706" }, title: "最終損益が±0（トントン）" }, "△"), { width: 28 }),
        _pbTh(React.createElement("span", { style: { color: "#DC2626" }, title: "確定損" }, "確損"), { width: 42 }),
        _pbTh(React.createElement("span", { style: { color: "#7F1D1D" }, title: "損切り" }, "損切"), { width: 42 }),
        _pbTh(React.createElement("span", { style: { color: "#6B7280" } }, "未達"), { width: 40 }),
        _pbTh(React.createElement("span", { style: { color: "#0284C7" }, title: "不算入＋スルー（集計に算入しない記録）。選外銘柄表ではスルーのみ" }, "除外"), { width: 40 }),
        _pbTh(React.createElement("span", { title: "○が途切れた所（×/△/損切り）で手じまいした最終PnL＝（）外。（）内=△も保有し続けた場合。旧H２損益と同一基準（100株換算）" }, "最終損益", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#999", display: "block", whiteSpace: "normal", maxWidth: 76, margin: "0 auto", lineHeight: 1.2 } }, "○途切れで手じまい ()=△")), { width: 100 }),
        _pbTh(React.createElement("span", { title: "EP損益（○のみ）／H1損益／最終損益を縦積み。（）内=△も保有し続けた場合。最終＝○が続く限り手じまい足まで保有した損益＝最終損益列と同値（100株換算）" }, "詳細損益", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#999", display: "block" } }, "EP / H1 / H2")), { width: 150 }),
        _pbTh("実現損益", { width: 80 }),
        _pbTh("タグ", { width: 120, textAlign: "left" })
      );
    };
    // ===== 選外銘柄（本日の取引銘柄に未選択）の行 2026-07-29 =====
    // 主表と同じ列構成。行の統計は【算入フラグを見ない】＝選外の記録は既定で includeInTotal=false が入るため
    //   _elInclTotal でフィルタすると全行「—」になり情報がゼロになる。判断の土俵に乗せなかったスルーだけを外す。
    // 除外列にはそのスルー件数を渡す。件 = st.total + 除外 なので、ここに不算入件数を渡すと二重計上になる。
    // 2026-08-04d 別カードをやめ主表のtbodyへ差し込むため、定義を _pbMainEl の前へ移動（中身は不変）。
    var _pbOutStatOf = function(recs) { return (recs || []).filter(function(r) { return !_elIsThru(r.signal); }); };
    var _pbRealRawOf = function(recs) { var t = 0; (recs || []).forEach(function(r) { var v = _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign); if (v != null) t += v; }); return t; };
    var _pbEntRawOf = function(recs) { var n = 0; (recs || []).forEach(function(r) { if (r.signal.entered === true) n++; }); return n; };
    var _pbOutRowOf = function(label, recs, rowKey, isTotal, tags) {
      var _oT = _pbOutStatOf(recs);
      var _oSt = Object.assign({}, _elCalcStats(_oT, data, function(r) { return { alpha: _pbAlphaOf(r), cutLine: _pbCutOf(r) }; }), _pbDynOkNg(_oT));
      var _oReal = _pbRealRawOf(_oT), _oEnt = _pbEntRawOf(_oT);
      return [
        _pbRow(label, _oSt, isTotal, "#4338CA",
          _profitGradeFromPnlReal(_oReal, _oEnt),
          _profitGradeFromPnl(_oSt.sumPlanned, _oSt.sumPlanned !== 0 ? _oSt.total : 0),
          _profitGradeFromPnl(_oSt.sumMax, _oSt.sumMax !== 0 ? _oSt.total : 0),
          _oEnt > 0, rowKey, tags || null, _oT, recs.length - _oT.length),
        !!pnlTableExpandSet[rowKey] ? _pbExpRow(rowKey) : null
      ];
    };
    var _pbMainEl = React.createElement("div", { style: Object.assign({}, Card, { marginTop: 0, borderTop: "none", borderRadius: "0 0 8px 8px", paddingTop: 10 }) },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, "📊 本日の損益データ",
        (function(){ var _xc = _elExclCountRecs(_pbAllRecs); return _xc > 0 ? React.createElement("span", { title: "計算・データに算入しない記録の件数", style: { fontSize: 10, fontWeight: 700, color: "#0284C7", background: "#E0F2FE", border: "1px solid #7DD3FC", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" } }, "不算入 " + _xc + "件") : null; })(),
        (function(){ var _cc = _elCollExclCountRecs(data, _pbAllRecs); return _cc > 0 ? React.createElement("span", { title: "時間かぶりで合計から除外した記録の件数（同日5分以内ペアの遅い方／同時刻なら損益が大きい方・件数系には残る）", style: { fontSize: 10, fontWeight: 700, color: "#6D28D9", background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" } }, "被り除外 " + _cc + "件") : null; })()),
      _pbGradeLegend,
      _pbAllRecs.length ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, margin: "2px 0 8px", flexWrap: "wrap" } }, _bulkIdealCtrl(_pbAllRecs, simAlpha, setSimAlpha, _pbRecKey, _pbCutOf)) : null,
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 10 } },
          React.createElement("thead", null, _pbHeadTr()),
          React.createElement("tbody", null,
            _pbStksMain.length > 1 ? [
              _pbRow("合計", Object.assign({}, _pbAll, _pbDynOkNg(_pbAllRecsT)), true, "#555",
                _profitGradeFromPnlReal(_pbAllReal, _pbAllEnt),
                _profitGradeFromPnl(_pbAll.sumPlanned, _pbAll.sumPlanned !== 0 ? _pbAll.total : 0),
                _profitGradeFromPnl(_pbAll.sumMax, _pbAll.sumMax !== 0 ? _pbAll.total : 0),
                _pbAllEnt > 0, "__total__", null, _pbAllRecsT, _elExclCountRecs(_pbAllRecs)),
              !!pnlTableExpandSet["__total__"] ? _pbExpRow("__total__") : null
            ] : null,
            _pbStksMain.map(function(sk) {
              var _skRecs = _pbByStkMain[sk];   // 2026-07-29 選外ぶんを除いた主表側の記録
              var _skT = _skRecs.filter(function(r) { return _elInclTotal(r.signal); });  // 合計額算入: 統計用（明細展開_pbExpRowは全件）2026-06-18
              var skSt = Object.assign({}, _elCalcStats(_skT, data, function(r) { return { alpha: _pbAlphaOf(r), cutLine: _pbCutOf(r) }; }), _pbDynOkNg(_skT));
              var _skReal = _pbRealOf(_skRecs), _skEnt = _pbEntOf(_skRecs);
              return [
                _pbRow(sk, skSt, false, null,
                  _profitGradeFromPnlReal(_skReal, _skEnt),
                  _profitGradeFromPnl(skSt.sumPlanned, skSt.sumPlanned !== 0 ? skSt.total : 0),
                  _profitGradeFromPnl(skSt.sumMax, skSt.sumMax !== 0 ? skSt.total : 0),
                  _skEnt > 0, sk, _pbStockTags(sk), _skT, _elExclCountRecs(_skRecs)),
                !!pnlTableExpandSet[sk] ? _pbExpRow(sk) : null
              ];
            }),
            !_pbStksMain.length ? React.createElement("tr", { key: "__nomain__" },
              React.createElement("td", { colSpan: 13, style: { padding: "10px 8px", textAlign: "center", fontSize: 11, color: "#94A3B8" } },
                "本日の取引銘柄に指定した銘柄の記録はありません（下の「選外銘柄」の行を参照）")) : null,
            // 2026-08-04d 選外銘柄は別カードをやめ、同じ表の続きに差し込む（ユーザー選択A「別枠に見えすぎ」）。
            // 列ヘッダーを共有できるので数字が主表と縦に揃い、見出し・注記・列ヘッダーの二重表示も消える。
            // 合計と混ざらないよう、区切り行（濃い上罫線＋淡い地色＋注記）で仕切り、行のラベル色は従来の藍色のまま。
            _pbStksOut.length ? React.createElement("tr", { key: "__outsep__" },
              React.createElement("td", { colSpan: 13, style: { padding: "6px 8px", borderTop: "2px solid #C7D2FE", background: "#F8FAFF", fontSize: 10, lineHeight: 1.6 } },
                React.createElement("span", { style: { fontWeight: 700, color: "#4338CA" } }, "選外銘柄（本日の取引銘柄に未選択） " + _pbOutRecs.length + "件"),
                React.createElement("span", { style: { color: "#94A3B8", marginLeft: 6 } },
                  "候補プール（設定→📅日替わり銘柄）に入っていて、この日の「本日の取引銘柄」に指定しなかった銘柄。数字は「選んでいたらどうだったか」の参考値で、"),
                React.createElement("b", { style: { color: "#4338CA" } }, "上の合計には足さないでください"),
                React.createElement("span", { style: { color: "#94A3B8" } }, "。選外でも手動で合計算入にした記録は上の行に残しています。除外列はスルーのみ。"))) : null,
            _pbStksOut.length > 1 ? _pbOutRowOf("参考合計", _pbOutRecs, "__outtotal__", true, null) : null,
            _pbStksOut.map(function(sk) { return _pbOutRowOf(sk, _pbByStkOut[sk], "__out__" + sk, false, _pbStockTags(sk)); })
          )
        )
      )
    );
    // 2026-08-04d 選外銘柄の独立カード(_pbOutEl)は廃止＝主表の tbody に差し込んだ（上の __outsep__ 以降）。
    // 2026-08-04 並び: 本日の損益データ（選外の行を含む）→ 今週の損益データ → 本日の総括（一番下）。
    return React.createElement(React.Fragment, null, _pbMainEl, _wkMainEl, _soukatsuEl);
  })(),

  showForm && React.createElement(EntryRecordForm, {
    data: data,
    save: save,
    initial: tradeEditTarget
      ? { stock: tradeEditTarget.stock, date: tradeEditTarget.date, signal: tradeEditTarget.signal }
      : { date: date, stock: activeStock || allStocks[0] || "" },   // 新規は選択中の銘柄タブ(activeStock)を初期銘柄に＝見出し下の本日の採用α欄と一致 2026-07-21
    onClose: function() { setShowForm(false); setTradeEditTarget(null); }
  })));
}


