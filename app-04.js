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
      var _cSV = data.charts[k] || {};
      var _cutSV = _cSV.cutLine != null ? Number(_cSV.cutLine) : 10;
      return (_cSV.signals || []).filter(function(sig) { return _elIsEntered(sig, null); })
        .map(function(sig) { return { sig: sig, cut: _cutSV }; });
    });
    // 合計額算入: 検索日カードの損益/勝敗は除外記録(includeInTotal===false)を抜く。タグ表示(entryTagLabels)は全件のまま。2026-06-18
    var _enteredSigsT = enteredSigs.filter(function(e) { return _elInclTotal(e.sig); });
    var pnl = _enteredSigsT.reduce(function(acc, e) {
      var v = _elSignedVal(e.sig.realizedPnl, e.sig.realizedPnlSign);
      return acc + (v != null ? v : 0);
    }, 0);
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
    if (!_fbStorageRef) { window.alert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    _setStBusy("audit"); _setStAudit(null);
    _snStorageAudit(data, cfg).then(function(r) {
      _setStBusy("");
      if (!r || !r.ok) { window.alert("Storageの診断に失敗しました（" + ((r && r.reason) || "error") + "）。通信状態を確認してください。"); return; }
      _setStAudit(r);
    });
  };
  var _runStDelete = function(graceDays) {
    if (_stBusy) return;
    graceDays = (graceDays == null ? 30 : graceDays);
    // 安全ガード: dataが読めていない可能性がある時は中止（全消し事故防止）。
    if (!data || (!data.charts && !data.trades)) { window.alert("記録データが読み込めていないため中止しました。"); return; }
    _setStBusy("delete");
    // 削除直前に最新を取り直す（多端末リモート＋CA参照を含む完全な参照集合で判定）。
    _snStorageAudit(data, cfg).then(function(r) {
      if (!r || !r.ok) { _setStBusy(""); window.alert("再診断に失敗しました。通信状態を確認してください。"); return; }
      _setStAudit(r);
      // 多端末: notebookリモートを取得できなかった＝他端末だけが参照する画像を巻き込む恐れ→中止。
      if (cfg && cfg.fbUrl && (r.remoteOk === false || r.caOk === false)) { _setStBusy(""); window.alert("⚠️ 最新データ（または分析ツールの参照情報）を取得できなかったため中止しました。\n全端末で同期し、通信が安定した状態で再実行してください。"); return; }
      // 参照が1件も拾えない＝データ未読込/取得失敗の疑い→安全側で中止。
      if (r.refSetSize === 0 && r.total > 0) { _setStBusy(""); window.alert("⚠️ 参照中の画像が見つかりませんでした。データ未読込の可能性があるため中止しました。"); return; }
      var cutoff = Date.now() - graceDays * 86400000;
      // created不明(0)は安全側で常に残す。grace=0なら「作成日が判明している未参照孤児すべて」が対象。
      var delable = r.orphans.filter(function(o) { return o.created && o.created < cutoff; });
      if (!delable.length) { _setStBusy(""); window.alert("削除できる孤児（" + (graceDays > 0 ? (graceDays + "日以上前・") : "") + "未参照）はありませんでした。"); return; }
      var bytes = delable.reduce(function(s2, o) { return s2 + o.size; }, 0);
      var msg = (graceDays > 0)
        ? ("未参照の孤児画像 " + delable.length + "件（約" + _stFmtMB(bytes) + "）をFirebase Storageから削除します。\n※このアプリが作成し、記録・CAのどこからも参照されず、" + graceDays + "日以上前のものだけが対象です。表示中の画像・記録には影響しません。\n実行しますか？")
        : ("⚠️ 新しいものも含め、未参照の孤児画像を「すべて」削除します（" + delable.length + "件・約" + _stFmtMB(bytes) + "）。\n※記録・リモート・CAのどこからも参照されていない画像だけが対象です（圧縮で置き換えた古い画像など。表示中の画像は保護されます）。\n※他の端末で同期前の画像を巻き込まないよう、全端末を同期してから実行してください。\n実行しますか？");
      if (!window.confirm(msg)) { _setStBusy(""); return; }
      _snStorageDeleteOrphans(delable, graceDays, Date.now()).then(function(res) {
        _setStBusy("");
        window.alert("孤児画像を削除しました（" + res.deleted + "件 / 約" + _stFmtMB(res.freed) + "解放" + (res.errs ? " / 失敗" + res.errs + "件" : "") + "）。");
        _runStAudit();
      });
    });
  };
  var _runRecompress = function() {
    if (_stBusy) return;
    if (!_fbStorageRef) { window.alert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    if (!data || (!data.charts && !data.trades)) { window.alert("記録データが読み込めていないため中止しました。"); return; }
    if (!window.confirm("過去の画像（ニュース・チャート・メモなど）をWebP形式・長辺1600pxに再圧縮して、Firebase Storageの容量を削減します。\n\n・画質はほぼ保ったまま1枚あたりの容量を大きく削減します（すでに最適化済みの画像はそのまま）。\n・同じ内容の「表示用」と「原画像(orig)」の重複は1つに集約されます。注釈付き画像の原画像は再編集用に温存します。\n・現在の画像をクラウドから読み込むため、通信量を少し消費します（端末にキャッシュ済みの分は消費しません）。\n・圧縮後、古い画像はクラウドにしばらく残ります。同期完了後に下の「🗂 クラウド画像の整理 → 使用量を診断 → 孤児を削除」を実行すると実際に容量が解放されます。\n\n実行しますか？")) return;
    _setStBusy("recompress"); _setStRc(null); _setStRcP({ done: 0, total: 0 });
    _snRecompressImages(data, function(p) { _setStRcP(p); }).then(function(r) {
      if (!r || !r.ok) { _setStBusy(""); _setStRcP(null); window.alert("画像の圧縮に失敗しました（" + ((r && r.reason) || "error") + "）。Firebase設定・通信状態を確認してください。"); return; }
      if (r.compressed === 0) {
        _setStBusy(""); _setStRcP(null); _setStRc(r);
        window.alert("圧縮できる画像はありませんでした。\n（対象 " + r.total + "件はすべて最適化済み" + (r.errs ? " / 取得失敗 " + r.errs + "件" : "") + "）");
        return;
      }
      // 参照を新URL（圧縮済みの小さい画像）へ張り替えて保存＝旧オブジェクトは孤児になり、既存GCで回収可能になる。
      save(function(prev) { return _snApplyImgMaps(prev, r.urlMap, r.localMap); });
      _setStBusy(""); _setStRcP(null); _setStRc(r);
      window.alert("画像 " + r.compressed + "件を圧縮しました（約" + _stFmtMB(r.savedBytes) + "削減見込み" + (r.errs ? " / 取得失敗 " + r.errs + "件" : "") + "）。\n\n古い画像はまだクラウドに残っています。数十秒待って同期の完了を確認してから、下の「🗂 クラウド画像の整理 → 使用量を診断 → 孤児を削除」を実行すると、実際に容量が解放されます。");
    })["catch"](function(e) { _setStBusy(""); _setStRcP(null); window.alert("画像の圧縮中にエラーが発生しました: " + (e && e.message ? e.message : e)); });
  };
  var _runBreakdown = function() {
    if (_stBusy) return;
    if (!_fbStorageRef) { window.alert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    _setStBusy("breakdown"); _setStBd(null); _setStBdP({ done: 0, total: 0 });
    _snStorageBreakdown(function(p) { _setStBdP(p); }).then(function(r) {
      _setStBusy(""); _setStBdP(null);
      if (!r || !r.ok) { window.alert("内訳の測定に失敗しました（" + ((r && r.reason) || "error") + "）。通信状態を確認してください。"); return; }
      _setStBd(r);
    })["catch"](function(e) { _setStBusy(""); _setStBdP(null); window.alert("内訳の測定中にエラーが発生しました: " + (e && e.message ? e.message : e)); });
  };
  var _runCatAudit = function() {
    if (_stBusy) return;
    if (!_fbStorageRef) { window.alert("Firebase（Storage）が未設定です。先にFirebase設定を保存してください。"); return; }
    if (!data || (!data.charts && !data.trades)) { window.alert("記録データが読み込めていないため中止しました。"); return; }
    _setStBusy("cat"); _setStCat(null); _setStCatP({ done: 0, total: 0 });
    _snStorageCategoryAudit(data, cfg, function(p) { _setStCatP(p); }).then(function(r) {
      _setStBusy(""); _setStCatP(null);
      if (!r || !r.ok) { window.alert("種類別の分析に失敗しました（" + ((r && r.reason) || "error") + "）。通信状態を確認してください。"); return; }
      _setStCat(r);
    })["catch"](function(e) { _setStBusy(""); _setStCatP(null); window.alert("種類別の分析中にエラーが発生しました: " + (e && e.message ? e.message : e)); });
  };
  var _runNewsPreview = function() {
    if (!data || !data.trades) { window.alert("記録データが読み込めていません。"); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(_stNewsCut || "")) { window.alert("日付を YYYY-MM-DD 形式で指定してください。"); return; }
    var r = _snStripOldNewsImages(data, _stNewsCut);
    _setStNewsPrev({ count: r.count, cutoff: _stNewsCut });
  };
  var _runNewsStrip = function() {
    if (!data || !data.trades) { window.alert("記録データが読み込めていません。"); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(_stNewsCut || "")) { window.alert("日付を YYYY-MM-DD 形式で指定してください。"); return; }
    var r = _snStripOldNewsImages(data, _stNewsCut);
    if (!r.count) { window.alert(_stNewsCut + " より前のニュース画像はありませんでした。"); _setStNewsPrev({ count: 0, cutoff: _stNewsCut }); return; }
    if (!window.confirm(_stNewsCut + " より前のニュース画像 " + r.count + "枚を記録から外します。\n※テキスト・タグ・記録は残ります（画像だけ削除）。元に戻せません。\n外した画像は、このあと「🗂 使用量を診断 → 新しい孤児も含めて全部削除」を実行するとクラウドから消えて容量が解放されます。\n実行しますか？")) return;
    save(function(prev) { return _snStripOldNewsImages(prev, _stNewsCut).data; });
    _setStNewsPrev({ count: 0, cutoff: _stNewsCut, doneCount: r.count });
    window.alert("ニュース画像 " + r.count + "枚を記録から外しました。\n続けて下の「🗂 使用量を診断 → 新しい孤児も含めて全部削除」を実行すると、クラウドの容量が解放されます。");
  };
  var _ndCalcDays = function(v, u) { var n = Number(typeof _toHankakuNum === "function" ? _toHankakuNum(v) : v); if (!(n > 0)) return 0; return u === "week" ? Math.round(n * 7) : Math.round(n); };
  var _ndSaveEnabled = function(en) { if (!save) return; save(function(prev) { var pc = prev.custom || {}; var pn = pc.newsImgAutoDelete || {}; return Object.assign({}, prev, { custom: Object.assign({}, pc, { newsImgAutoDelete: Object.assign({}, pn, { enabled: !!en }) }) }); }); };
  var _ndSaveDaysVal = function(v, u) { var days = _ndCalcDays(v, u); if (!(days > 0) || !save) return; save(function(prev) { var pc = prev.custom || {}; var pn = pc.newsImgAutoDelete || {}; return Object.assign({}, prev, { custom: Object.assign({}, pc, { newsImgAutoDelete: Object.assign({}, pn, { periodDays: days }) }) }); }); };
  var _nadEnabled = !!(data && data.custom && data.custom.newsImgAutoDelete && data.custom.newsImgAutoDelete.enabled === true);
  var _ndPreview = (function() { if (!data || !data.trades) return null; var days = _ndCalcDays(_stNdV, _stNdU); if (!(days > 0)) return null; try { return _snAutoPruneNewsImages(data, Date.now() - days * 86400000).count; } catch(e) { return null; } })();
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
          if (confirm("\u4ECA\u6708\u306E\u901A\u4FE1\u91CF\u30AB\u30A6\u30F3\u30BF\u30FC\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3059\u304B\uFF1F")) {
            try { localStorage.removeItem(_fbUsageKey()); _fbWarnShown = {}; } catch(e){}
            alert("\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3057\u305F");
          }
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
      React.createElement("div", { style: { fontSize: 11, color: "#555", lineHeight: 1.7, marginBottom: 10 } }, "追加してから一定期間がたったニュース画像を、起動時に自動で削除します（テキスト・タグ・記録は残ります）。各画像の鍵マーク🔒を押すと「保存済み」になり、期限を過ぎても削除されません。"),
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
    React.createElement("button", {
      onClick: function() {
        var keys = [], bytes = 0;
        try {
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && (k.indexOf("sn_dc_csv_v1_") === 0 || k.indexOf("sn_dcc_ca_bar_v1_") === 0)) { keys.push(k); bytes += (localStorage.getItem(k) || "").length; }
          }
        } catch(e){}
        if (!keys.length) { window.alert("削除できる不要キャッシュはありませんでした。"); return; }
        if (!window.confirm("チャートのキャッシュ " + keys.length + "件（約" + Math.round(bytes / 1024) + "KB）を削除します。\n記録・設定・画像は消えません。次にチャートを見るとき再取得されます。\n実行しますか？")) return;
        var removed = _snEvictExpendableCaches();
        window.alert("不要キャッシュを削除しました（" + removed + "件 / 約" + Math.round(bytes / 1024) + "KB）。");
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
  var _qrCapGrid = function(badgeNode, numNode, capAmt) {
    var g = _profitGradeFromPnl(capAmt, 1);
    var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
    var col = capAmt < 0 ? "#1E8449" : capAmt > 0 ? "#C0392B" : "#888";
    var capBadge = (g && g !== "Z") ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border, fontWeight: 800, fontSize: 10, lineHeight: 1, flexShrink: 0 } }, g) : React.createElement("span", null);
    var _pr = function(ch) { return React.createElement("span", { style: { fontSize: 11, color: "#bbb", lineHeight: 1 } }, ch); };
    return React.createElement("div", { title: "損切り値ちょうどで損切りできていた場合の損失額（100株換算）",
      style: { display: "grid", gridTemplateColumns: "auto auto auto auto", columnGap: 3, rowGap: 1, alignItems: "center", justifyItems: "start", width: "fit-content" } },
      React.createElement("span", null), badgeNode, numNode, React.createElement("span", null),
      _pr("（"), capBadge,
      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } }, _qrFmtAmt(capAmt) + "円"),
      _pr("）")
    );
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
                  { label: "EP損益", pad: "6px 7px" },
                  { label: "H損益", pad: "6px 7px" },
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
              if (!c2 || isHoliday) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _cutA = c2.cutLine != null ? Number(c2.cutLine) : 10;
              var _g = _elCalcChartGrades(c2.signals, null, _cutA);
              if (_g.allMiss) return _qZeroCell();
              if (_g.plan === "Z" && _g.planRefCnt <= 0) return React.createElement("span", { style: { fontSize: 11, color: "#ccc" } }, "—");
              return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
                _g.plan === "Z" ? null : _qrMkBadge(_g.plan), _g.plan === "Z" ? null : _qrAmtSpan(_g.planSum, "円"), _elHold2RefSuffix(_g.planSum, _g.planRefSum, _g.planRefCnt));
            })()),
            isNikkei ? null : React.createElement("td", {
              style: { padding: "2px 6px", whiteSpace: "nowrap", borderRight: "1px solid #efece7" }
            }, (function() {
              if (!c2 || isHoliday) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _cutA = c2.cutLine != null ? Number(c2.cutLine) : 10;
              var _g = _elCalcChartGrades(c2.signals, null, _cutA);
              if (_g.allMissH) return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "stretch", lineHeight: 1.25 } },
                React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap", borderBottom: "1px solid #e0d8c8", paddingBottom: 1 } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700 } }, "H１："), _qZeroCell()),
                React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap", paddingTop: 1 } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700 } }, "H２："), _qZeroCell()));
              if (_g.holdPlanCap === "Z" && _g.hold2Sum == null) return React.createElement("span", { style: { fontSize: 11, color: "#ccc" } }, "—");
              return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "stretch", lineHeight: 1.25 } },
                React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap", borderBottom: "1px solid #e0d8c8", paddingBottom: 1 } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700 } }, "H１："),
                  _qrMkBadge(_g.holdPlanCap), _qrAmtSpan(_g.holdSumPlanCap, "円"), _elHold2RefSuffix(_g.holdSumPlanCap, _g.holdRefSum, _g.holdRefCnt)),
                React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap", paddingTop: 1 } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700 } }, "H２："),
                  _g.hold2Sum != null ? (_g.hold2Grade ? _qrMkBadge(_g.hold2Grade) : null) : null,
                  _g.hold2Sum != null ? _qrAmtSpan(_g.hold2Sum, "円") : (_g.hold2RefCnt > 0 ? null : React.createElement("span", { style: { fontSize: 11, color: "#ccc" } }, "—")),
                  _elHold2RefSuffix(_g.hold2Sum, _g.hold2RefSum, _g.hold2RefCnt)));
            })()),
            isNikkei ? null : React.createElement("td", {
              style: { padding: "6px 7px", whiteSpace: "nowrap", borderRight: "1px solid #efece7" }
            }, (function() {
              if (!c2 || isHoliday) return React.createElement("span", { style: { color: "#ddd" } }, "—");
              var _cutR = c2.cutLine != null ? Number(c2.cutLine) : 10;
              var _gR = _elCalcChartGrades(c2.signals, null, _cutR);
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
        if (_elInclTotal(s)) {  // 合計額算入: 除外記録は合計/成功失敗カウントに入れない（行は表示する）2026-06-18
        // 表の合計行(_elTotAccum)と一致させる: item.pnl優先＋per-100換算。2026-06-20
        var _it0 = item;
        var _v0 = (_it0 && _it0.pnl != null) ? Number(_it0.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        if (_v0 != null) { var _sh0 = Number(s.shares) > 0 ? Number(s.shares) : 0; realSum += _sh0 > 0 ? Math.round(_v0 / _sh0 * 100) : Math.round(_v0); }
        // 勝敗はライブα基準（v2/v3はresult=null保存のためEP足から導出・旧記録も全表ライブα計算方針に統一）
        var _resTr = _elDynResult(s, _epOwnAlpha(s), _trC.cutLine != null ? Number(_trC.cutLine) : 10);
        if (_resTr === "ok") ok++;
        else if (_resTr === "ng") ng++;
        }
      });
    });
    records.sort(function(a, b) {
      var ta = (a.signal && a.signal.time) || "99:99";
      var tb = (b.signal && b.signal.time) || "99:99";
      return ta.localeCompare(tb);
    });
    return { records: records, totRecords: records.filter(function(r) { return _elInclTotal(r.signal); }), realSum: realSum, ok: ok, ng: ng };
  }, [data.charts, dd.items, allStocks, date]);
  var _trEntryRecords = _trEntryAgg.records;
  var _trTotRecs = _trEntryAgg.totRecords;  // 合計額算入: 集計専用（除外記録を抜いた版）2026-06-18
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
  // 外国市場は開くだけで value:null の既定テーブルが自動生成されるため、length>0 では「未入力でも点が付く」。
  // 実際に値かメモが入っている時だけ「データあり」とする（他の銘柄タブと同様の挙動）。2026-06-18
  var hasFmData = (function() {
    var fm = data.foreignMarkets && data.foreignMarkets[date];
    if (!fm) return false;
    var _any = function(arr) { return (arr || []).some(function(it) { return it && ((it.value != null && it.value !== "") || (it.memo != null && String(it.memo).trim() !== "")); }); };
    return _any(fm.indicators) || _any(fm.stocks);
  })();
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
  }, [["events", "\uD83D\uDCC5 \u4ECA\u65E5\u306E\u4E88\u5B9A\u30FB\u30E1\u30E2", hasEventsData || hasSummaryData], ["news", "📰 ニュース", hasNewsData], ["indicators", "📊 指標", hasFmData], ["charts", "銘柄別記録", hasChartData], ["trades", "📋 取引", hasTradeData], ["sim", "🧪 シミュレーション", true]].map(function (_ref58) {
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
    exclCount: function(s) { return _elDayStockExclCount(data, s, date); },
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
    save: save,
    highlightDate: date,
    weekOffset: weekOffset,
    setWeekOffset: setWeekOffset
  }),
  _elBaseAlphaDayBlockV2(_elCollectAllSignals(data).filter(function(r) { return r.stock === activeStock; }), function(r) { return _elAlphaInfo(r, data); }, date),
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
  })), React.createElement(_elDayStockBenchV2, { data: data, date: date, stock: activeStock }))), tab === "sim" && React.createElement("div", { style: { padding: "2px 0" } }, React.createElement("div", { style: { fontSize: 10, color: "#8a8a80", marginBottom: 8 } }, "この日/今週などで対象を絞り、仮の基本α/追加α/損切りを置いて現実と比べます（保存しません）"), React.createElement(AlphaSimBody, { data: data, initial: { date: date, period: "day" } })), tab === "trades" && React.createElement("div", null,
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
      // 共通ヘルパー(app-05)のエイリアス（旧ローカル実装を統合 2026-06-12）
      var _trRPnlCol = _elPnlColor;
      var _trRPnlFmt = _elPnlFmt;
      var _trBadge = _elGradeBadge18;
      var _trLane = _elLane;
      var _trRPnlDisp = function(v, grade) { return _elRPnlDispW(v, grade, 72); };
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
        real: function(r) {
          var s0 = r.signal, it0 = r.item;
          var v = (it0 && it0.pnl != null) ? Number(it0.pnl) : _elSignedVal(s0.realizedPnl, s0.realizedPnlSign);
          if (v == null) return null;
          var sh0 = Number(s0.shares) > 0 ? Number(s0.shares) : 0;
          return sh0 > 0 ? Math.round(v / sh0 * 100) : Math.round(v);
        }
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
      var _trTotRealGrade = _trTotRealCnt > 0 ? _profitGradeFromPnlReal(_trTotReal != null ? _trTotReal : 0, _trTotRealCnt) : null;
      var _trTotPlanGrade = _trTotPlanCnt > 0 ? _profitGradeFromPnl(_trTotPlan != null ? _trTotPlan : 0, _trTotPlanCnt) : null;
      var _trTotMaxGrade  = _trTotMaxCnt  > 0 ? _profitGradeFromPnl(_trTotMax  != null ? _trTotMax  : 0, _trTotMaxCnt)  : null;
      var _trTotPlanGradeAB = _trTotPlanABCnt > 0 ? _profitGradeFromPnl(_trTotPlanAB != null ? _trTotPlanAB : 0, _trTotPlanABCnt) : null;
      var _trTotMaxGradeAB  = _trTotMaxABCnt  > 0 ? _profitGradeFromPnl(_trTotMaxAB  != null ? _trTotMaxAB  : 0, _trTotMaxABCnt)  : null;
      var _trTotHoldCapGrade = _trTotHoldCnt > 0 ? _profitGradeFromPnl(_trTotHoldCap != null ? _trTotHoldCap : 0, _trTotHoldCnt) : null;
      var _trTotHoldCapGradeAB = _trTotHoldABCnt > 0 ? _profitGradeFromPnl(_trTotHoldCapAB != null ? _trTotHoldCapAB : 0, _trTotHoldABCnt) : null;
      var allTrExp = _trEntryRecords.every(function(r) { return !!trTableRecExp[_trRecKey(r)]; });
      var _trAllMiss = _elAllMissRow(_trTotRecs, function(_r){ return _elAlphaInfo(_r, data).alpha; }, function(_r){ return _elAlphaInfo(_r, data).cutLine; });
      var totRow = React.createElement("tr", { key: "__trtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C", borderBottom: "1px solid #f0ede6" } }, "合計"),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
          _trAllMiss ? _qZeroCell() : React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _trRPnlDispABAll(_trTotPlanAB, _trTotPlan, _trTotPlanGradeAB, _trTotPlanGrade), _elHold2RefSuffix(_trTotPlan, _trTotPlanRef, _trTotPlanRefCnt))
        ),
        React.createElement("td", { colSpan: 2, style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
          React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H１："),
              _trTotHoldCnt > 0 ? _trRPnlDispABAll(_trTotHoldCapAB, _trTotHoldCap, _trTotHoldCapGradeAB, _trTotHoldCapGrade) : (_trTotHoldRefCnt > 0 ? null : (_trAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_trTotHoldCap, _trTotHoldRef, _trTotHoldRefCnt)),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H２："),
              React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _trTotHold2Cnt > 0 ? (function() { var _g2 = _profitGradeFromPnl(_trTotHold2 != null ? _trTotHold2 : 0, _trTotHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2 ? _trBadge(_g2) : null, React.createElement("span", { style: { fontWeight: 600, color: _trTotHold2 > 0 ? "#C0392B" : _trTotHold2 < 0 ? "#1E8449" : "#888" } }, (_trTotHold2 > 0 ? "+" : "") + (_trTotHold2 || 0).toLocaleString() + "円")); })() : (_trTotHold2RefCnt > 0 ? null : (_trAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_trTotHold2, _trTotHold2Ref, _trTotHold2RefCnt))))),
        React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
          _trTotRealCnt > 0 ? _trRPnlDisp(_trTotReal, _trTotRealGrade) : React.createElement("span", { style: { color: "#ccc" } }, "—")
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
          ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 14 } }, "〇")
          : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×");
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
            style: Object.assign({ cursor: "pointer", background: rExp ? "#FFFBF5" : "transparent" }, _elNotInclRowStyle(s)),
            onClick: function() { setTrTableRecExp(function(prev) { var n = Object.assign({}, prev); if (n[rKeyRef]) delete n[rKeyRef]; else n[rKeyRef] = true; return n; }); }
          },
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
              React.createElement("div", null,
                React.createElement("span", { style: { marginRight: 3, color: "#F97316", fontSize: 9 } }, rExp ? "▼" : "▶"),
                s.time || "—", _minBarBadge(s)),
              _epIncompleteMark(s),
              _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge()) : null
            ),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", color: "#9A3412" } }, r.stock),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", whiteSpace: "nowrap" } }, sigLabel),
            React.createElement("td", { style: { padding: "4px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%", background: _elAddAlphaYes(s) ? "#FEF3C7" : null } },
              _aiTr.alpha != null ? React.createElement("div", null, React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#0369A1", fontWeight: 600 } }, _aiTr.alpha + "円"), _elAlphaBreakdownNode(s, _aiTr.alpha)) : React.createElement("span", { style: { color: "#ddd" } }, "—")),
            React.createElement("td", {
              style: { padding: "1px 2px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%", minWidth: 52 },
              onClick: function(e) { e.stopPropagation(); }
            },
              _epIsV2(s) ? _epOsChainCell(s, _aiTr.alpha) : (function(_osR) {
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
              _epECell(s, _aiTr.alpha)),
            React.createElement("td", { style: { padding: "4px 6px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, entLabel),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } }, _epPnlCell(s, _aiTr.alpha, _aiTr.cutLine, _trRPnlDisp(planPnlN, planGrade))),
            _elHoldTd2(s, _aiTr.alpha, _aiTr.cutLine, { padding: "4px 6px", textAlign: "center", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" }, (_hpTr != null && _elHoldIsStop(s, _aiTr.alpha, _aiTr.cutLine)) ? _elCapNote(_aiTr.cutLine) : null),
            React.createElement("td", { style: { padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6" } }, _trLane(_tradeAlphaChip(s), 26, "flex-end"), _trRPnlDisp(realPnlN, realGrade))
          )
        );
        if (rExp) {
          dataRows.push(
            React.createElement("tr", { key: rKey + "_card" },
              React.createElement("td", { colSpan: 11, style: { padding: "4px 8px 8px", background: "#FFFBF5", borderBottom: "1px solid #f0ede6" } },
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
                _trTh("OS", { width: "1%" }),
                _trTh("E", { width: "1%" }),
                _trTh("取引", { width: 1, padding: "4px 2px" }),
                _trTh("EP損益"),
                React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "H損益"),
                _trTh("実現損益")
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
            // v2/v3のH1は採用αで解決した役割の足（EPの次）の値を渡す（旧記録はそのまま）
            var _hvV = _epHoldView(s, _elAlphaInfo(r, data).alpha, false);
            _trVirtByStk[r.stock].push({ osVal: s.osVal != null ? Number(s.osVal) : null, conf: conf, holdOsConf: _hvV.holdOsConf != null ? Number(_hvV.holdOsConf) : null, holdHighVal: _hvV.holdHighVal != null ? Number(_hvV.holdHighVal) : null, holdHighSign: _hvV.holdHighSign || null });
            var _cTr = (data.charts || {})[r.stock + "_" + date];
            _trCutLineByStk[r.stock] = _cTr && _cTr.cutLine != null ? _cTr.cutLine : 10;
          });
          if (!Object.keys(_trVirtByStk).length) return null;
          
          return React.createElement(VirtualAlphaCalc, { sigsByStock: _trVirtByStk, cutLineByStock: _trCutLineByStk });
        })()
      );
    })(),
    _trEntryRecords.length > 0 && React.createElement("div", {
      style: { display: "flex", gap: 20, marginTop: 12, paddingTop: 10, borderTop: "1px solid #e0ddd6", fontSize: 14, alignItems: "center", flexWrap: "wrap" }
    },
      (function() {
        var _trCount = _trTotRecs.filter(function(r){ return _elIsEntered(r.signal, r.item); }).length;
        var _tg = _profitGradeFromPnlReal(_trRealSum, _trCount);
        var _ts = _GRADE_STYLE[_tg] || _GRADE_STYLE.Z;
        var _trLegendPairs = [["A","25001円~"],["B","10001~25000円"],["C","1~10000円"],["D","0円"],["E","-1~-10000円"],["F","-10001~-25000円"],["G","-25001円~"],["Z","取引なし"],["Q","E基準未達のため非表示"]];
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
      return _c && _c.cutLine != null ? _c.cutLine : 10;
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
    var _bulkIdealCtrl = function(records, simVal, simSet, keyOf, cutOf) {
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
    var _pnlDetailTableEl = function(records, alphaOf, cutOf, sortMode, simCtx, cutCtx, showBulk) {
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
      var _rPnlDisp = function(v, grade) { return _elRPnlDispW(v, grade, 72); };
      var _sl = function() { return React.createElement("span", { style: { color: "#d6c8b8", margin: "0", fontWeight: 400 } }, "/"); };
      var _pbSlashCell = function(symObj, grade, pnl, missFlag) {
        var sym = symObj ? React.createElement("span", { style: { fontWeight: 700, color: symObj.col } }, symObj.ch) : React.createElement("span", { style: { color: "#ccc" } }, "—");
        var badge = missFlag ? _pbBadge("Q") : (grade && grade !== "Z" ? _pbBadge(grade) : React.createElement("span", { style: { color: "#ccc" } }, "—"));
        var amt = missFlag ? React.createElement("span", { style: { color: "#888" } }, "—") : (pnl != null ? React.createElement("span", { style: { fontWeight: 600, color: _rPnlCol(pnl) } }, _rPnlFmt(pnl)) : React.createElement("span", { style: { color: "#ccc" } }, "—"));
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, _lane(sym, 14), _sl(), _lane(badge, 18), _sl(), _lane(amt, 52, "flex-start"));
      };
      var _renderSimAlphaInput = function(r, _sc) {
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
      var _renderSimCutInput = function(r, _sc) {
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
      var _totRealCnt = 0, _totPlanCnt = 0, _totHoldCnt = 0;
      var _totPlanABpb = null;
      var _totPlanABCntpb = 0;
      var _totPlanCap = null, _totHoldCap = null, _totPlanStop = false, _totHoldStop = false;
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
        var _inclTpb = _elInclTotal(s);  // 合計額算入: false の記録は合計から除外（行は表示し編集可）2026-06-18
        if (entered && _inclTpb) _totRealCnt++;
        if (realPnl != null && _inclTpb) { _totReal = (_totReal || 0) + realPnl; }
        var _h2tpb = _elHold2TotParts(s, _alphaRec, _cutLrec);
        if (_isXskipPb || !_inclTpb) {
          // EP×（×見送り）→ EP/H1/H2とも完全に算入無し（参考にも入れない）。
        } else {
        var _epTriPb = _epIsTriEntry(s, _alphaRec);  // EP-OS△（△の確信度でエントリー）→ EP損益は（）内のみ・（）外は0
        if (planPnl != null) {
          if (_epTriPb) { _totPlanRef = (_totPlanRef || 0) + planPnl; _totPlanRefCnt++; }
          else { _totPlan = (_totPlan || 0) + planPnl; _totPlanCnt++;
            var _pStopT = (_alphaRec != null && _elPlanIsStop(s, _alphaRec, _cutLrec));
            if (_pStopT) _totPlanStop = true;
            _totPlanCap = (_totPlanCap || 0) + (_pStopT ? _elCapLossYen(_cutLrec) : planPnl); }
        }
        if (holdPnl != null && !_epTriPb) { _totHold = (_totHold || 0) + holdPnl; _totHoldCnt++;  // EP△はH1も（）外0＝主計数に入れない（下で参考へ）
          var _hStopT = (_alphaRec != null && _elHoldIsStop(s, _alphaRec, _cutLrec));
          if (_hStopT) _totHoldStop = true;
          _totHoldCap = (_totHoldCap || 0) + (_hStopT ? _elCapLossYen(_cutLrec) : holdPnl); }
        var _isABpb = (s.difficulty === "A" || s.difficulty === "B");
        if (planPnl != null && _isABpb && !_epTriPb) { _totPlanABpb = (_totPlanABpb || 0) + planPnl; _totPlanABCntpb++; }
        if (_h2tpb.main != null) { _totHold2 = (_totHold2 || 0) + _h2tpb.main; _totHold2Cnt++; }
        if (_h2tpb.ref != null) { _totHold2Ref = (_totHold2Ref || 0) + _h2tpb.ref; _totHold2RefCnt++; }
        if (holdPnl != null) {
          // 想定が損切りの行は結果損益を想定額にキャップした合計（per-row のキャップ表示と一致）。本来額は _totHold に保持。
          var _pStopH = (_alphaRec != null && _elPlanIsStop(s, _alphaRec, _cutLrec));
          var _hCapPb = (_pStopH && planPnl != null) ? planPnl : holdPnl;
          if (_epTriPb) {
            // EP△→H1も（）外0。○/△/損切り済は（）内（参考）へ・×/未設定は完全除外（1段下0を継承）。
            if (s.holdExp && s.holdExp !== "×") { _totHoldRef = (_totHoldRef || 0) + _hCapPb; _totHoldRefCnt++; }
          } else {
            var _fbPb = (s.holdExp !== "○");  // ○以外（×/△/損切り済/未設定）は想定額へフォールバック。未設定=×扱い
            var _mvPb = (_fbPb && planPnl != null) ? planPnl : _hCapPb;
            _totHoldPlanCap = (_totHoldPlanCap || 0) + _mvPb;
            if (_isABpb) { _totHoldPlanCapAB = (_totHoldPlanCapAB || 0) + _mvPb; _totHoldPlanCapABCnt++; }
            if ((s.holdExp === "△" || s.holdExp === "損切り済") && planPnl != null && (_hCapPb - planPnl) !== 0) { _totHoldRef = (_totHoldRef || 0) + (_hCapPb - planPnl); _totHoldRefCnt++; }  // △/損切り済のみ参考（×/未設定は無し）
            if (_pStopH && planPnl != null && holdPnl !== planPnl) _totHoldPlanStopDiffPb = true;
          }
        }
        }
        var gReal = entered && realPnl != null ? _profitGradeFromPnlReal(realPnl, 1) : null;
        var gPlan = planPnl != null ? _profitGradeFromPnl(planPnl, 1) : null;
        subRows.push(React.createElement("tr", {
          key: rKey + "_row",
          style: Object.assign({ background: rExp ? "#FFF7ED" : "transparent", cursor: "pointer" }, _elNotInclRowStyle(s)),
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
            _epIncompleteMark(s),
            _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge()) : null),
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", color: "#555", minWidth: 60 } },
            (function() {
              var _sigs = (s.tags && s.tags.length > 0 ? s.tags : (s.categories && s.categories.length > 0 ? s.categories : []));
              if (!_sigs.length) return "—";
              return React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } },
                _sigs.map(function(_t, _i) { return _sigNameNode(_t, _i); }));
            })()),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%", background: _elAddAlphaYes(s) ? "#FEF3C7" : null } },
            _alphaRec != null ? React.createElement("div", null, React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "#0369A1", fontWeight: 600 } }, _alphaRec + "円"), _elAlphaBreakdownNode(s, _alphaRec)) : React.createElement("span", { style: { color: "#ddd" } }, "—")),
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            _epOsChainCell(s, _alphaRec)),
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: bb, borderRight: "1px solid #e8e5de", width: "1%" } },
            _epECell(s, _alphaRec)),
          React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap", width: "1%" } },
            entered
              ? React.createElement("span", { style: { color: "#2E7D32", fontWeight: 700, fontSize: 14 } }, "〇")
              : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×")
          ),
          React.createElement("td", { style: { padding: "1px 1px", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de", whiteSpace: "nowrap" } },
            _epPnlCell(s, _alphaRec, _cutLrec)),
          _elHoldTd2(s, _alphaRec, _cutLrec, { padding: "1px 0", textAlign: "center", fontSize: 11, borderBottom: bb, borderRight: "1px solid #e8e5de" }, (holdPnl != null && _elHoldIsStop(s, _alphaRec, _cutLrec)) ? _elCapNote(_cutLrec) : null),
          React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: bb, whiteSpace: "nowrap" } },
            _lane(_tradeAlphaChip(s), 26, "flex-end"), _rPnlDisp(realPnl, gReal))
        ));
        if (rExp) {
          subRows.push(React.createElement("tr", { key: rKey + "_detail" },
            React.createElement("td", { colSpan: 12, style: { padding: "0 0 4px 0", borderBottom: "1px solid #e0ddd6" } },
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
      var _totRealGrade = _totRealCnt > 0 ? _profitGradeFromPnlReal(_totReal != null ? _totReal : 0, _totRealCnt) : null;
      var _totPlanGrade = _totPlanCnt > 0 ? _profitGradeFromPnl(_totPlan != null ? _totPlan : 0, _totPlanCnt) : null;
      var _totPlanGradeABpb = _totPlanABCntpb > 0 ? _profitGradeFromPnl(_totPlanABpb != null ? _totPlanABpb : 0, _totPlanABCntpb) : null;
      var _totHoldCapGradePb = _totHoldCnt > 0 ? _profitGradeFromPnl(_totHoldPlanCap != null ? _totHoldPlanCap : 0, _totHoldCnt) : null;
      var _totHoldCapGradeABpb = _totHoldPlanCapABCnt > 0 ? _profitGradeFromPnl(_totHoldPlanCapAB != null ? _totHoldPlanCapAB : 0, _totHoldPlanCapABCnt) : null;
      var _rPnlDispABAllPb = function(abV, allV, abGrade, allGrade) {
        // 全ランク(全体)のみ表示。B以上/全ランクのAB分割は廃止。
        var _fmtAB = function(v) { return v != null ? (v > 0 ? "+" : "") + v.toLocaleString() + "円" : "—"; };
        var _colAB = function(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
        var _v = allV != null ? allV : abV;
        var _g = allGrade || abGrade;
        if (_v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
          _g ? _pbBadge(_g) : null,
          React.createElement("span", { style: { fontWeight: 600, color: _colAB(_v) } }, _fmtAB(_v))
        );
      };
      var _lblTot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
      var _pbAllMiss = _elAllMissRow(expRecs.filter(function(r) { return _elInclTotal(r.signal); }), alphaOf, cutOf);
      var totRow = React.createElement("tr", { key: "__subtot__", style: { background: "#FFF7ED" } },
        React.createElement("td", { colSpan: 2, style: { padding: "1px 6px", textAlign: "left", fontWeight: 700, fontSize: 11, borderTop: "2px solid #FB923C", color: "#555", whiteSpace: "nowrap" } }, "合計"),
        React.createElement("td", { colSpan: 6, style: { borderTop: "2px solid #FB923C" } }),
        React.createElement("td", { style: { padding: "1px 1px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, _lblTot("EP損益"), (_pbAllMiss ? _qZeroCell() : React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _rPnlDispABAllPb(_totPlanABpb, _totPlan, _totPlanGradeABpb, _totPlanGrade), _elHold2RefSuffix(_totPlan, _totPlanRef, _totPlanRefCnt))),
          (_totPlanStop && _totPlanCap != null) ? _elCapNoteAmt(_totPlanCap) : null),
        React.createElement("td", { colSpan: 2, style: { padding: "1px 0", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } },
          React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H１："),
              _totHoldCnt > 0 ? _rPnlDispABAllPb(_totHoldPlanCapAB, _totHoldPlanCap, _totHoldCapGradeABpb, _totHoldCapGradePb) : (_totHoldRefCnt > 0 ? null : (_pbAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHoldPlanCap, _totHoldRef, _totHoldRefCnt)),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
              React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H２："),
              React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _totHold2Cnt > 0 ? (function() { var _g2 = _profitGradeFromPnl(_totHold2 != null ? _totHold2 : 0, _totHold2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _g2 ? _pbBadge(_g2) : null, React.createElement("span", { style: { fontWeight: 600, color: _totHold2 > 0 ? "#C0392B" : _totHold2 < 0 ? "#1E8449" : "#888" } }, (_totHold2 > 0 ? "+" : "") + (_totHold2 || 0).toLocaleString() + "円")); })() : (_totHold2RefCnt > 0 ? null : (_pbAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_totHold2, _totHold2Ref, _totHold2RefCnt))))),
        React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, _lblTot("実現損益"), _rPnlDisp(_totReal, _totRealGrade))
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
              _rTh("OS", { width: 80 }),
              _rTh("E", { width: 26 }),
              _rTh("取引", { width: 26 }),
              _rTh(React.createElement("span", null, "EP損益", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#b07050", display: "block" } }, "勝敗/ランク/額")), { width: 104 }),
              React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "H損益"),
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
      return _c && _c.cutLine != null ? _c.cutLine : 10;
    };
    // 損切り値シミュ(非永続・今週用)を最優先。未設定なら実際の損切り値。サマリー＋明細で使用。
    var _wkCutOf = function(r) {
      var _ov = simCutWk[_wkRecKey(r)];
      if (_ov != null && _ov !== "" && !isNaN(Number(_ov))) return Number(_ov);
      return _wkCutActualOf(r);
    };
    var _wkMainEl = (function() {
      var _DOWJP = ["日", "月", "火", "水", "木", "金", "土"];
      var _wkBadge = function(g) {
        var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
        return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border, fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 } }, g);
      };
      var _wkAmt = function(v) { return React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } }, (v > 0 ? "+" : "") + (v || 0).toLocaleString() + "円"); };
      var _wkPnlCell = function(grade, sum) {
        if (!grade || grade === "Z" || sum == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _wkBadge(grade), _wkAmt(sum));
      };
      var _wkTh = function(label, extra) {
        return React.createElement("th", { style: Object.assign({ padding: "4px 3px", fontWeight: 700, borderBottom: "2px solid #ddd", textAlign: "center", fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap", color: "#555" }, extra || {}) }, label);
      };
      var _wkEntCnt = function(rs) { return rs.filter(function(r) { return _elIsEntered(r.signal, r.item); }).length; };
      var _wkAvgOs = function(rs) {
        var a = rs.map(function(r) { return r.signal.osVal; }).filter(function(v) { return v != null && v !== ""; }).map(Number);
        return a.length ? Math.round(a.reduce(function(x, y) { return x + y; }, 0) / a.length * 10) / 10 : null;
      };
      var _wkTags = function(rs) {
        var seen = {}, out = [], ckSeen = {};
        rs.forEach(function(r) {
          var ck = r.stock + "_" + r.date;
          if (ckSeen[ck]) return; ckSeen[ck] = 1;
          var c = _pbCharts[ck] || {};
          [].concat(c.chartShapeTags || [], c.stockTags || []).forEach(function(t) {
            var st = stripCat(t);
            if (st && !seen[st]) { seen[st] = 1; out.push(st); }
          });
        });
        return out.slice(0, 6);
      };
      var _wkRow = function(label, labelColor, recs, isTotal, rowKey) {
        // 合計額算入: 除外記録(includeInTotal===false)はサマリ集計から外す。明細展開(_wkExpRow)は全件のまま。2026-06-18
        var _exclN = (recs || []).filter(function(r) { return _elIsExcluded(r.signal); }).length;  // この日に不算入があれば青点を出す
        recs = (recs || []).filter(function(r) { return _elInclTotal(r.signal); });
        var st = _elCalcStats(recs, data);
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
          _td(st.total, { fontWeight: isTotal ? 700 : 400 }),
          _td(st.reach || "0", { color: "#374151", fontWeight: isTotal ? 700 : ((st.reach || 0) > 0 ? 700 : 400) }),
          _td(st.win || "0", { color: "#1E8449", fontWeight: st.win ? 700 : 400 }),
          _td(st.tri || "0", { color: "#D97706", fontWeight: (st.tri || 0) > 0 ? 700 : 400 }),
          _td(st.even || "0", { color: "#9CA3AF" }),
          _td(st.loss || "0", { color: "#DC2626", fontWeight: st.loss ? 700 : 400 }),
          _td(st.stop || "0", { color: "#7F1D1D", fontWeight: st.stop ? 700 : 400 }),
          _td(st.miss || "0", { color: "#6B7280" }),
          _td((function() {
            if (_allExcl) return _elNotInclBadge();
            if (_allMiss) return _qZeroCell();
            var _dynSP = null, _dynSPRef = null, _dynSPRefCnt = 0;
            (recs || []).forEach(function(r) {
              var s = r.signal;
              var _aD = _wkAlphaOf(r);
              var _cutLwkD = _wkCutOf(r);
              if (_epIsXSkip(s, _aD)) return;  // EP×（×見送り）→ 完全に算入無し
              var pp = _elDynPlanned(s, _aD, _cutLwkD);  // EP起算v2対応（EP=OS2/3の損切り額も算入）
              if (pp != null) {
                if (_epIsTriEntry(s, _aD)) { _dynSPRef = (_dynSPRef || 0) + pp; _dynSPRefCnt++; }  // EP-OS△→（）内のみ・（）外は0
                else _dynSP = (_dynSP || 0) + pp;
              }
            });
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _wkPnlCell(_profitGradeFromPnl(_dynSP != null ? _dynSP : 0, (_dynSP != null && _dynSP !== 0) ? st.total : 0), _dynSP), _elHold2RefSuffix(_dynSP, _dynSPRef, _dynSPRefCnt));
          })()),
          _td((function() {
            if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _hMain = null, _hRef = null, _hRefCnt = 0, _hCnt = 0;
            recs.forEach(function(r) {
              var s = r.signal;
              var _aR = _wkAlphaOf(r);
              var _cutLR = _wkCutOf(r);
              if (_epIsXSkip(s, _aR)) return;  // EP×（×見送り）→ 完全に算入無し
              var hp = (_aR != null) ? _elDynHold(s, _aR, _cutLR) : _elSignedVal(s.holdPnl, s.holdPnlSign);
              if (hp == null) return;
              var pp = _elDynPlanned(s, _aR, _cutLR);  // EP起算v2対応（想定損切り時のキャップ基準もEP足の額になる）
              var _pStop = (_aR != null && _elPlanIsStop(s, _aR, _cutLR));
              var _cap = (_pStop && pp != null) ? pp : hp;
              if (_epIsTriEntry(s, _aR)) {
                // EP△→H1も（）外0。○/△/損切り済は（）内（参考）へ・×/未設定は完全除外（1段下0を継承）。
                if (s.holdExp && s.holdExp !== "×") { _hRef = (_hRef || 0) + _cap; _hRefCnt++; }
              } else {
                var _fbW = (s.holdExp !== "○");  // ○以外（×/△/損切り済/未設定）→想定額(手仕舞い)へフォールバック。未設定=×扱い
                _hMain = (_hMain || 0) + ((_fbW && pp != null) ? pp : _cap);
                if ((s.holdExp === "△" || s.holdExp === "損切り済") && pp != null && (_cap - pp) !== 0) { _hRef = (_hRef || 0) + (_cap - pp); _hRefCnt++; }  // △/損切り済のみH1保有時との差を参考（×/未設定は無し・差0除外）
                _hCnt++;
              }
            });
            if (_hMain == null) return (_hRefCnt > 0) ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _elHold2RefSuffix(0, _hRef, _hRefCnt)) : (_allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"));
            var _hgCap = _profitGradeFromPnl(_hMain, _hCnt);
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
              _hgCap ? _wkBadge(_hgCap) : null,
              React.createElement("span", { style: { fontWeight: 700, color: _hMain > 0 ? "#C0392B" : _hMain < 0 ? "#1E8449" : "#888" } }, (_hMain > 0 ? "+" : "") + _hMain.toLocaleString() + "円"),
              _elHold2RefSuffix(_hMain, _hRef, _hRefCnt));
          })()),
          _td((function() {
            if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _h2Tot = null, _h2Cnt = 0, _h2Ref = null, _h2RefCnt = 0;
            recs.forEach(function(r) {
              var s = r.signal;
              var _aR = _wkAlphaOf(r); var _cutLR = _wkCutOf(r);
              var _h2p = _elHold2TotParts(s, _aR, _cutLR);
              if (_h2p.main != null) { _h2Tot = (_h2Tot || 0) + _h2p.main; _h2Cnt++; }
              if (_h2p.ref != null) { _h2Ref = (_h2Ref || 0) + _h2p.ref; _h2RefCnt++; }
            });
            if (_h2Cnt === 0 && _h2RefCnt === 0) return _allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—");
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" } },
              _h2Cnt > 0 ? (function() { var _h2g = _profitGradeFromPnl(_h2Tot, _h2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _h2g ? _wkBadge(_h2g) : null, React.createElement("span", { style: { fontWeight: 700, color: _h2Tot > 0 ? "#C0392B" : _h2Tot < 0 ? "#1E8449" : "#888" } }, (_h2Tot > 0 ? "+" : "") + _h2Tot.toLocaleString() + "円")); })() : (_h2RefCnt > 0 ? React.createElement("span", { style: { color: "#ccc" } }, "—") : null),
              _elHold2RefSuffix(_h2Tot, _h2Ref, _h2RefCnt));
          })()),
          _td(_allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _wkPnlCell(_profitGradeFromPnlReal(st.sumPnl, (_ent > 0 && st.sumPnl !== 0) ? _ent : 0), _ent > 0 ? st.sumPnl : null)),
          React.createElement("td", { style: { padding: "4px 6px", borderBottom: bb, borderTop: bt } },
            (function() { var tg = _wkTags(recs); return tg.length ? React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 2 } }, tg.map(function(t, i) { return React.createElement("span", { key: i, style: { display: "inline-block", padding: "1px 5px", fontSize: 9, fontWeight: 600, background: "#FFEDD5", color: "#9A3412", borderRadius: 3, border: "1px solid #FB923C", whiteSpace: "nowrap" } }, stripCat(t)); })) : null; })())
        );
      };
      // 週: 銘柄別グルーピング + 推奨基本α値（5〜20円・1円刻み）計算
      var _wkByStk = {};
      _wkAllRecs.forEach(function(r) { if (!_wkByStk[r.stock]) _wkByStk[r.stock] = []; _wkByStk[r.stock].push(r); });
      var _wkStks = Object.keys(_wkByStk).sort(function(a, b) { var ia = _pbStkOrder.indexOf(a), ib = _pbStkOrder.indexOf(b); if (ia !== -1 || ib !== -1) { if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; } return a < b ? -1 : a > b ? 1 : 0; });
      var _wkGroups = _wkStks.map(function(sk) { return { label: sk, recs: _wkByStk[sk].filter(function(r) { return _elInclTotal(r.signal); }) }; });
      var _wkIdealEl = React.createElement("div", { style: { marginTop: 0, marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "α 推奨基本α値（5〜20円・週間）"),
        React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "週(月〜金)の各銘柄の全記録に同じαを当てて、件数フロア（最も件数の多いαの半分以上）かつ到達率50%以上かつ想定損益がプラスのαから 損切り率(EP〜H1)の低さ×0.7＋H1勝率×0.3 の合成スコアが最大のα（薄い高α・約定しにくい高α・赤字αは除外・データ不足時は件数最大を参考表示）。追加α目安＝基本αに何円足せば損切りしにくくH1利益が出たか。"),
        _elBaseAlphaTableV2(_wkGroups, _wkCutOf));
      var _wkExpRow = function(recs, rowKey) {
        var _isTotal = rowKey === "wk__total__";
        return React.createElement("tr", { key: rowKey + "_exp" },
          React.createElement("td", { colSpan: 12, style: { padding: "6px 8px", background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
            _isTotal ? _wkIdealEl : null,
            recs.length ? React.createElement("div", { style: { margin: "2px 4px 8px 18px", border: "1px solid #FDBA74", borderRadius: 8, background: "#fff", padding: "6px 8px", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, _pnlDetailTableEl(recs, _wkAlphaOf, _wkCutOf, "time", { val: simAlphaWk, set: setSimAlphaWk, keyOf: _wkRecKey, actualOf: _wkAlphaActualOf }, { val: simCutWk, set: setSimCutWk, keyOf: _wkRecKey, actualOf: _wkCutActualOf }, true)) : React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "記録なし")
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
          (function(){ var _xc = _elExclCountRecs(_wkAllRecs); return _xc > 0 ? React.createElement("span", { title: "計算・データに算入しない記録の件数", style: { fontSize: 10, fontWeight: 700, color: "#0284C7", background: "#E0F2FE", border: "1px solid #7DD3FC", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" } }, "不算入 " + _xc + "件") : null; })()
        ),
        React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 6, fontWeight: 400 } }, _wkDates[0].slice(5).replace("-", "/") + "（月）〜 " + _wkDates[4].slice(5).replace("-", "/") + "（金）"),
        _wkAllRecs.length ? React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 10 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { background: "#f5f4f0" } },
                _wkTh("曜日", { textAlign: "left" }), _wkTh("件"),
                _wkTh(React.createElement("span", { style: { color: "#374151" } }, "到達")), _wkTh(React.createElement("span", { style: { color: "#1E8449" } }, "利確")), _wkTh(React.createElement("span", { style: { color: "#D97706" } }, "△")), _wkTh(React.createElement("span", { style: { color: "#9CA3AF" } }, "建値")), _wkTh(React.createElement("span", { style: { color: "#DC2626" } }, "確定損")), _wkTh(React.createElement("span", { style: { color: "#7F1D1D" } }, "損切り")), _wkTh(React.createElement("span", { style: { color: "#6B7280" } }, "未達")),
                _wkTh("EP損益"), _wkTh("H１結果損益"), _wkTh("H２結果損益"), _wkTh("実現損益"), _wkTh("タグ", { textAlign: "left" })
              )
            ),
            React.createElement("tbody", null,
              [
                _wkRow("週合計", "#555", _wkAllRecs, true, "wk__total__"),
                !!pnlTableExpandSet["wk__total__"] ? _wkExpRow(_wkAllRecs, "wk__total__") : null
              ].concat(
                _wkDates.map(function(_wd) {
                  var _dobj = new Date(_wd + "T00:00:00");
                  var _lbl = _DOWJP[_dobj.getDay()] + " " + _wd.slice(5).replace("-", "/");
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
    // 簡略版「本日の推奨基本α値」: 本日の取引記録が無くても表示する（前日までの記録から推奨）2026-06-25。
    // 本日エントリーした銘柄(_pbStks)があればそれを、無ければ前日までにv2記録のある銘柄（_pbStkOrder優先→件数順）を母数にする。
    var _alphaBoardNoTrade = !_pbStks.length;
    // 推奨α欄はマスター登録の全銘柄を対象に（本日取引が無い銘柄も表示）2026-06-29。日経平均株価＝指数(エントリーα対象外)は除外。本日エントリー銘柄(_pbStks)を先頭、その後にマスター順の残り（本日取引なし）。
    var _alphaMaster = (data.custom && data.custom.stocks && data.custom.stocks.length > 0) ? data.custom.stocks : _DEF_STOCKS_FROZEN;
    var _alphaBoardStks = _pbStks.concat(_alphaMaster.filter(function(s) { return s !== "日経平均株価" && _pbStks.indexOf(s) < 0; }));
    var _simpleAlphaEl = _alphaBoardStks.length ? React.createElement("div", { style: Card },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#0369A1", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } }, "🎯 本日の推奨基本α値（簡略・銘柄別）",
        React.createElement("span", { style: { fontSize: 9, fontWeight: 600, color: "#94A3B8" } }, "再推奨＋次点／直近50件メイン")),
      _alphaBoardNoTrade ? React.createElement("div", { style: { fontSize: 10, color: "#9A3412", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6, padding: "4px 8px", marginBottom: 8, fontWeight: 700 } }, "本日の取引記録はまだありません。マスター登録の全銘柄について、前日までの記録から推奨を表示しています。") : null,
      _elBaseAlphaSimpleBoardV2(data, _alphaBoardStks, date)) : null;
    if (!_pbStks.length) return React.createElement(React.Fragment, null, _simpleAlphaEl, _soukatsuEl, _wkMainEl);
    
    var _pbAllRecs = [];
    var _pbAllReal = 0, _pbAllEnt = 0;
    _pbStks.forEach(function(sk) {
      _pbAllRecs = _pbAllRecs.concat(_pbByStk[sk]);
      _pbAllReal += _pbRealByStk[sk];
      _pbAllEnt  += _pbEntByStk[sk];
    });
    // 合計額算入: 統計/合計は除外記録を抜いた _pbAllRecsT で計算（明細・行表示は _pbAllRecs/_pbByStk の全件のまま）2026-06-18
    var _pbAllRecsT = _pbAllRecs.filter(function(r) { return _elInclTotal(r.signal); });
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
      if (allSt.sumPnl === 0 && allEnt === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
      // ランクは表示額(per-100換算の allSt.sumPnl)で判定＝凡例・表示額・兄弟の_wkRowと一致。2026-06-20
      var allGrade = allEnt > 0 ? _profitGradeFromPnlReal(allSt.sumPnl, allEnt) : "D";
      return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        _pbBadge(allGrade),
        React.createElement("span", { style: { fontWeight: 600, color: _pbCol(allSt.sumPnl) } }, _pbFmt(allSt.sumPnl))
      );
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
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, fontWeight: isTotal ? 700 : 400 } }, st.total),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#374151", fontWeight: isTotal ? 700 : ((st.reach || 0) > 0 ? 700 : 400) } }, st.reach || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#1E8449", fontWeight: st.win ? 700 : 400 } }, st.win || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#D97706", fontWeight: (st.tri || 0) > 0 ? 700 : 400 } }, st.tri || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#9CA3AF", fontWeight: (st.even || 0) > 0 ? 700 : 400 } }, st.even || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#DC2626", fontWeight: st.loss ? 700 : 400 } }, st.loss || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#7F1D1D", fontWeight: st.stop ? 700 : 400 } }, st.stop || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, color: "#6B7280", fontWeight: (st.miss || 0) > 0 ? 700 : 400 } }, st.miss || "0"),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          (function() {
            if (_allExcl) return _elNotInclBadge();
            if (_allMiss) return _qZeroCell();
            var _dynSP = null, _dynSPAB = null, _dynSPRef = null, _dynSPRefCnt = 0;
            (recs || []).forEach(function(r) {
              var s = r.signal;
              var _aD = _pbAlphaOf(r);
              var _cutLpbD = _pbCutOf(r);
              if (_epIsXSkip(s, _aD)) return;  // EP×（×見送り）→ 完全に算入無し
              var pp = _elDynPlanned(s, _aD, _cutLpbD);  // EP起算v2対応（EP=OS2/3の損切り額も算入）
              if (pp != null) {
                if (_epIsTriEntry(s, _aD)) { _dynSPRef = (_dynSPRef || 0) + pp; _dynSPRefCnt++; }  // EP-OS△→（）内のみ・（）外は0
                else { _dynSP = (_dynSP || 0) + pp; if (s.difficulty === "A" || s.difficulty === "B") _dynSPAB = (_dynSPAB || 0) + pp; }
              }
            });
            var _hasAlpha = (recs || []).some(function(r) { return r.signal && r.signal.alphaVal != null; });
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _pbABAll(recs, _dynSP !== null ? _dynSP : st.sumPlanned, st.expectedPlanned, gradePlanned, "sumPlanned", "expectedPlanned", _hasAlpha ? _dynSPAB : undefined), _elHold2RefSuffix(_dynSP, _dynSPRef, _dynSPRefCnt));
          })()),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          (function() {
            if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _hMain = null, _hRef = null, _hRefCnt = 0, _hCnt = 0;
            recs.forEach(function(r) {
              var s = r.signal;
              var _aR = _pbAlphaOf(r);
              var _cutLR = _pbCutOf(r);
              if (_epIsXSkip(s, _aR)) return;  // EP×（×見送り）→ 完全に算入無し
              var hp = (_aR != null) ? _elDynHold(s, _aR, _cutLR) : _elSignedVal(s.holdPnl, s.holdPnlSign);
              if (hp == null) return;
              var pp = _elDynPlanned(s, _aR, _cutLR);  // EP起算v2対応（想定損切り時のキャップ基準もEP足の額になる）
              var _pStop = (_aR != null && _elPlanIsStop(s, _aR, _cutLR));
              var _cap = (_pStop && pp != null) ? pp : hp;
              if (_epIsTriEntry(s, _aR)) {
                // EP△→H1も（）外0。○/△/損切り済は（）内（参考）へ・×/未設定は完全除外（1段下0を継承）。
                if (s.holdExp && s.holdExp !== "×") { _hRef = (_hRef || 0) + _cap; _hRefCnt++; }
              } else {
                var _fbW = (s.holdExp !== "○");  // ○以外（×/△/損切り済/未設定）→想定額(手仕舞い)へフォールバック。未設定=×扱い
                _hMain = (_hMain || 0) + ((_fbW && pp != null) ? pp : _cap);
                if ((s.holdExp === "△" || s.holdExp === "損切り済") && pp != null && (_cap - pp) !== 0) { _hRef = (_hRef || 0) + (_cap - pp); _hRefCnt++; }  // △/損切り済のみH1保有時との差を参考（×/未設定は無し・差0除外）
                _hCnt++;
              }
            });
            if (_hMain == null) return (_hRefCnt > 0) ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _elHold2RefSuffix(0, _hRef, _hRefCnt)) : (_allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"));
            var _hgCap = _profitGradeFromPnl(_hMain, _hCnt);
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
              _hgCap ? _pbBadge(_hgCap) : null,
              React.createElement("span", { style: { fontWeight: 700, color: _hMain > 0 ? "#C0392B" : _hMain < 0 ? "#1E8449" : "#888" } }, (_hMain > 0 ? "+" : "") + _hMain.toLocaleString() + "円"),
              _elHold2RefSuffix(_hMain, _hRef, _hRefCnt));
          })()),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          (function() {
            if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
            var _h2Tot = null, _h2Cnt = 0, _h2Ref = null, _h2RefCnt = 0;
            recs.forEach(function(r) {
              var s = r.signal;
              var _aR = _pbAlphaOf(r); var _cutLR = _pbCutOf(r);
              var _h2p = _elHold2TotParts(s, _aR, _cutLR);
              if (_h2p.main != null) { _h2Tot = (_h2Tot || 0) + _h2p.main; _h2Cnt++; }
              if (_h2p.ref != null) { _h2Ref = (_h2Ref || 0) + _h2p.ref; _h2RefCnt++; }
            });
            if (_h2Cnt === 0 && _h2RefCnt === 0) return _allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—");
            return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
              _h2Cnt > 0 ? (function() { var _h2g = _profitGradeFromPnl(_h2Tot, _h2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _h2g ? _pbBadge(_h2g) : null, React.createElement("span", { style: { fontWeight: 700, color: _h2Tot > 0 ? "#C0392B" : _h2Tot < 0 ? "#1E8449" : "#888" } }, (_h2Tot > 0 ? "+" : "") + _h2Tot.toLocaleString() + "円")); })() : (_h2RefCnt > 0 ? null : React.createElement("span", { style: { color: "#ccc" } }, "—")),
              _elHold2RefSuffix(_h2Tot, _h2Ref, _h2RefCnt));
          })()),
        React.createElement("td", { style: { padding: "3px 3px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: bb, borderTop: bt, borderRight: br } },
          _allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _pbRealABAll(recs)),
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
        React.createElement("td", { colSpan: 12, style: { padding: 0, background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
          rowKey === "__total__" ? null : React.createElement("div", {
            style: { display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderBottom: "1px solid #f0ede6", flexWrap: "wrap" }
          },
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
                var _aW = _pbAlphaOf(r);
                var _cutLW = _pbCutOf(r);
                var pp = _elDynPlanned(s, _aW, _cutLW);  // EP起算v2対応
                var hp = _elDynHold(s, _aW, _cutLW);
                if (pp != null) { _totPb = (_totPb || 0) + pp; _totPbCnt++; }
                if (hp != null) { _totHPb = (_totHPb || 0) + hp; _totHPbCnt++; }
              });
              if (_totPbCnt === 0 && _totHPbCnt === 0) return null;
              return React.createElement("span", { style: { display: "inline-flex", gap: 10, marginLeft: 8, paddingLeft: 8, borderLeft: "1px solid #f0ede6", flexWrap: "wrap" } },
                _totPbCnt > 0 ? React.createElement("span", { style: { fontSize: 11, color: "#555", whiteSpace: "nowrap" } },
                  "EP損益合計: ",
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
          React.createElement("div", { style: { margin: "2px 4px 8px 18px", border: "1px solid #FDBA74", borderRadius: 8, background: "#fff", padding: "6px 8px", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, _pnlDetailTableEl(expRecs, _pbAlphaOf, _pbCutOf, pnlSortOrder, { val: simAlpha, set: setSimAlpha, keyOf: _pbRecKey, actualOf: _pbAlphaActualOf }, { val: simCut, set: setSimCut, keyOf: _pbRecKey, actualOf: _pbCutActualOf })),
        )
      );
    };
    var _pbStockTags = function(stk) {
      var c = _pbCharts[stk + "_" + date] || {};
      return [].concat(c.chartShapeTags || [], c.stockTags || []).map(stripCat);
    };
    var _pbGradeLegend = (function() {
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
      return React.createElement("div", { style: { background: "#f9f8f5", border: "1px solid #e8e5de", borderRadius: 6, padding: "5px 8px", marginBottom: 8, fontSize: 9 } },
        mkRow("実現損益", { A:"25001+", B:"10001～25000", C:"1～10000", D:"0", E:"-1～-10000", F:"-10001～-25000", G:"-25001-", Q:"E基準未達のため非表示" }),
        mkRow("EP損益", { A:"2501+", B:"1001～2500", C:"1～1000", D:"0", E:"-1～-1000", F:"-1001～-2500", G:"-2501-", Q:"E基準未達のため非表示" })
      );
    })();
    
    
    
    
    var _pbMainEl = React.createElement("div", { style: Object.assign({}, Card, { marginTop: 0, borderTop: "none", borderRadius: "0 0 8px 8px", paddingTop: 10 }) },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, "📊 本日の損益データ",
        (function(){ var _xc = _elExclCountRecs(_pbAllRecs); return _xc > 0 ? React.createElement("span", { title: "計算・データに算入しない記録の件数", style: { fontSize: 10, fontWeight: 700, color: "#0284C7", background: "#E0F2FE", border: "1px solid #7DD3FC", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" } }, "不算入 " + _xc + "件") : null; })()),
      _pbGradeLegend,
      _pbAllRecs.length ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, margin: "2px 0 8px", flexWrap: "wrap" } }, _bulkIdealCtrl(_pbAllRecs, simAlpha, setSimAlpha, _pbRecKey, _pbCutOf)) : null,
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 10 } },
          React.createElement("thead", null,
            React.createElement("tr", { style: { background: "#f5f4f0" } },
              _pbTh("銘柄", { width: 120, textAlign: "left" }),
              _pbTh("件", { width: 34 }),
              _pbTh(React.createElement("span", { style: { color: "#374151" } }, "到達"), { width: 36 }),
              _pbTh(React.createElement("span", { style: { color: "#1E8449" } }, "利確"), { width: 36 }),
              _pbTh(React.createElement("span", { style: { color: "#D97706" } }, "△"), { width: 28 }),
              _pbTh(React.createElement("span", { style: { color: "#9CA3AF" } }, "建値"), { width: 34 }),
              _pbTh(React.createElement("span", { style: { color: "#DC2626" } }, "確定損"), { width: 42 }),
              _pbTh(React.createElement("span", { style: { color: "#7F1D1D" } }, "損切り"), { width: 42 }),
              _pbTh(React.createElement("span", { style: { color: "#6B7280" } }, "未達"), { width: 40 }),
              _pbTh(React.createElement("span", null, "EP損益", React.createElement("span", { style: { fontWeight: 400, fontSize: 8, color: "#999", display: "block" } }, "(100株)")), { width: 128 }),
              _pbTh(React.createElement("span", null, "H１損益"), { width: 78 }),
              _pbTh(React.createElement("span", null, "H２損益"), { width: 78 }),
              _pbTh("実現損益", { width: 80 }),
              _pbTh("タグ", { width: 120, textAlign: "left" })
            )
          ),
          React.createElement("tbody", null,
            _pbStks.length > 1 ? [
              _pbRow("合計", Object.assign({}, _pbAll, _pbDynOkNg(_pbAllRecsT)), true, "#555",
                _profitGradeFromPnlReal(_pbAllReal, _pbAllEnt),
                _profitGradeFromPnl(_pbAll.sumPlanned, _pbAll.sumPlanned !== 0 ? _pbAll.total : 0),
                _profitGradeFromPnl(_pbAll.sumMax, _pbAll.sumMax !== 0 ? _pbAll.total : 0),
                _pbAllEnt > 0, "__total__", null, _pbAllRecsT, _elExclCountRecs(_pbAllRecs)),
              !!pnlTableExpandSet["__total__"] ? _pbExpRow("__total__") : null
            ] : null,
            _pbStks.map(function(sk) {
              var _skT = _pbByStk[sk].filter(function(r) { return _elInclTotal(r.signal); });  // 合計額算入: 統計用（明細展開_pbExpRowは全件）2026-06-18
              var skSt = Object.assign({}, _elCalcStats(_skT, data, function(r) { return { alpha: _pbAlphaOf(r), cutLine: _pbCutOf(r) }; }), _pbDynOkNg(_skT));
              return [
                _pbRow(sk, skSt, false, null,
                  _profitGradeFromPnlReal(_pbRealByStk[sk], _pbEntByStk[sk]),
                  _profitGradeFromPnl(skSt.sumPlanned, skSt.sumPlanned !== 0 ? skSt.total : 0),
                  _profitGradeFromPnl(skSt.sumMax, skSt.sumMax !== 0 ? skSt.total : 0),
                  _pbEntByStk[sk] > 0, sk, _pbStockTags(sk), _skT, _elExclCountRecs(_pbByStk[sk])),
                !!pnlTableExpandSet[sk] ? _pbExpRow(sk) : null
              ];
            })
          )
        )
      )
    );
    var _benchEl = (_pbStks && _pbStks.length) ? React.createElement("div", { style: Object.assign({}, Card, { marginTop: 0 }) },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#333" } }, "📊 α比較・深掘り（本日／今週／今月／全期間・銘柄別）"),
      React.createElement("div", { style: { fontSize: 9, color: "#aaa", marginBottom: 2 } }, "各銘柄のα関連データを集約（推奨基本α・理想α・到達率別α・E到達／損切り・EP／H1／H2損益・推奨基本αの期間推移）"),
      _pbStks.map(function(_sk) { return React.createElement(_elDayStockBenchV2, { key: _sk, data: data, date: date, stock: _sk }); })) : null;
    return React.createElement(React.Fragment, null, _pbMainEl, _simpleAlphaEl, _soukatsuEl, _wkMainEl, _benchEl);
  })(),

  (function() {
    // === 本日のデータ分析（EP→OS5ホールド検証・銘柄別OS値分析）2026-06-13 ===
    var _aCharts = data.charts || {};
    var _ymd2 = function(d) { return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0"+d.getDate()).slice(-2); };
    var _dayRecs = [];
    allStocks.forEach(function(stk) {
      var c = _aCharts[stk + "_" + date] || {};
      var cut = c.cutLine != null ? Number(c.cutLine) : 10;
      (Array.isArray(c.signals) ? c.signals : []).forEach(function(sig) {
        var s = _compatSignal(sig);
        if (!_epIsV2(s) || !_elInclTotal(s)) return;
        var a = (s.alphaVal != null && s.alphaVal !== "") ? Number(s.alphaVal) : _gradeAlpha(s.difficulty);
        _dayRecs.push({ stock: stk, signal: s, alpha: a, cut: cut, time: s.time || "" });
      });
    });
    _dayRecs.sort(function(a,b){ return (a.time||"99:99").localeCompare(b.time||"99:99"); });
    var _aCard = { background:"#fff", border:"1px solid #e8e5de", borderRadius:8, padding:"10px 12px", marginBottom:10 };
    var _hdr = function(t, sub) { return React.createElement("div",{style:{marginBottom:6}}, React.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#9A3412"}},t), sub?React.createElement("div",{style:{fontSize:9,color:"#aaa",marginTop:1}},sub):null); };
    if (!_dayRecs.length) {
      return React.createElement("div", { style: Object.assign({}, Card, { marginTop: 0 }) },
        React.createElement("div",{style:{fontSize:13,fontWeight:700,marginBottom:8,color:"#333"}},"📊 本日のデータ分析"),
        React.createElement("div",{style:{color:"#aaa",fontSize:12}},"本日のエントリー記録（EP起算）がありません"));
    }
    var _yenN2 = function(v){ if(v==null) return React.createElement("span",{style:{color:"#ccc"}},"—"); return React.createElement("span",{style:{fontWeight:700,color:_elPnlColor(v)}}, _elPnlFmt(v)); };
    var _th2 = function(t,ex){ return React.createElement("th",{style:Object.assign({padding:"3px 5px",fontWeight:700,borderBottom:"2px solid #ddd",whiteSpace:"nowrap",textAlign:"center",fontSize:10,color:"#9A3412"},ex||{})},t); };
    var _td2 = function(c,ex){ return React.createElement("td",{style:Object.assign({padding:"3px 5px",textAlign:"center",fontSize:11,whiteSpace:"nowrap",borderTop:"1px solid #f0ede8",fontVariantNumeric:"tabular-nums"},ex||{})},c); };

    // ===== A. EP→OS5 ホールド検証 =====
    var _ladders = _dayRecs.map(function(r){ return { r: r, lad: _epHoldLadder(r.signal, r.alpha, r.cut) }; }).filter(function(x){ return x.lad; });
    var _maxDepth = 0; _ladders.forEach(function(x){ x.lad.items.forEach(function(it){ if(it.depth>_maxDepth)_maxDepth=it.depth; }); });
    var _ladderTable = null, _ladderInsight = null;
    if (_ladders.length) {
      var _depthCols = []; for (var _di=0; _di<=_maxDepth; _di++) _depthCols.push(_di);
      var _ladRows = _ladders.map(function(x, ri){
        var lad = x.lad, r = x.r;
        var cells = [ _td2(r.stock, {textAlign:"left",fontWeight:700,color:"#9A3412"}), _td2(React.createElement("span", null, React.createElement("div", null, r.time||"—"), _epIncompleteMark(r.signal)), {color:"#666"}) ];
        _depthCols.forEach(function(d){
          var it = null; lad.items.forEach(function(_it){ if(_it.depth===d) it=_it; });
          if (!it) { cells.push(_td2("",{})); return; }
          var node;
          if (it.isStop) node = React.createElement("span",{style:{display:"inline-block",padding:"0 4px",borderRadius:4,background:"#1E8449",color:"#fff",fontWeight:700,fontSize:10,whiteSpace:"nowrap"}}, "損切" + (it.pnl!=null?" "+it.pnl.toLocaleString():""));
          else if (it.afterStop) node = React.createElement("span",{style:{color:"#ccc"}},"—");
          else node = _yenN2(it.pnl);
          cells.push(_td2(React.createElement("span",null, React.createElement("div",{style:{fontSize:8,color:"#bbb",lineHeight:1}}, it.depth===0?"EP":("+"+it.depth+"本")), node), it.isStop?{background:"#EAF3DE"}:null));
        });
        var verdict;
        if (lad.stopDepth >= 0) verdict = React.createElement("span",{style:{color:"#1E8449",fontWeight:700,fontSize:10}}, "OS"+(lad.epIdx+lad.stopDepth+1)+"で損切り");
        else {
          var ep0 = lad.items[0] ? lad.items[0].pnl : null;
          var grew = (lad.finalPnl!=null && ep0!=null) ? (lad.finalPnl > ep0 ? "伸ばせた" : lad.finalPnl < ep0 ? "戻した" : "横ばい") : "";
          verdict = React.createElement("span",{style:{fontSize:10}}, React.createElement("span",{style:{color:"#0369A1",fontWeight:700}},"損切りなし"), React.createElement("span",{style:{color:"#888",marginLeft:3}}, "最大", _yenN2(lad.maxPnl), "("+(lad.maxDepth===0?"EP":"+"+lad.maxDepth+"本")+")"), grew?React.createElement("span",{style:{marginLeft:3,fontWeight:700,color:grew==="伸ばせた"?"#C0392B":grew==="戻した"?"#1E8449":"#888"}},grew):null);
        }
        cells.push(_td2(verdict,{textAlign:"left"}));
        return React.createElement("tr",{key:ri}, cells);
      });
      var _ladHead = [ _th2("銘柄",{textAlign:"left"}), _th2("時間") ].concat(_depthCols.map(function(d){ return _th2(d===0?"EP":("+"+d+"本")); })).concat([ _th2("判定",{textAlign:"left"}) ]);
      _ladderTable = React.createElement("div",{style:{overflowX:"auto"}}, React.createElement("table",{style:{borderCollapse:"collapse",width:"100%",fontSize:11}}, React.createElement("thead",null,React.createElement("tr",{style:{background:"#f5f4f0"}},_ladHead)), React.createElement("tbody",null,_ladRows)));
      var _nStop=0, _nExtend=0, _nShrink=0, _sumMax=0, _cntMax=0;
      _ladders.forEach(function(x){ var lad=x.lad; if(lad.stopDepth>=0)_nStop++; else { var ep0=lad.items[0]?lad.items[0].pnl:null; if(lad.finalPnl!=null&&ep0!=null){ if(lad.finalPnl>ep0)_nExtend++; else if(lad.finalPnl<ep0)_nShrink++; } } if(lad.maxPnl!=null){_sumMax+=lad.maxPnl;_cntMax++;} });
      var _ins = [];
      _ins.push(React.createElement("span",null,"E成立",_elInsightEmV2(_ladders.length+"件"),"をEPからホールドし続けた場合、",_elInsightEmV2(_nStop+"件"),"が途中で損切り、",_elInsightEmV2((_ladders.length-_nStop)+"件"),"は損切りにならず到達。"));
      if (_nExtend+_nShrink>0) _ins.push(React.createElement("span",null,"損切りにならなかった記録のうち、EPより利益を伸ばせたのが",_elInsightEmV2(_nExtend+"件"),"・縮小したのが",_elInsightEmV2(_nShrink+"件"),"。"));
      if (_cntMax) _ins.push(React.createElement("span",null,"1件あたり到達可能だった最大損益の平均は",_elInsightEmV2(Math.round(_sumMax/_cntMax).toLocaleString()+"円"),"。"));
      _ladderInsight = _elInsightBoxV2(_ins, { note: "各足で手仕舞いした場合の損益。損切り＝高値−α≧損切り値に達した足（以降は損切り額で固定）。" });
    }

    // ===== B. 銘柄別OS値分析（本日/今週/全期間）=====
    var _d0 = new Date(date + "T00:00:00");
    var _dowN = _d0.getDay();
    var _mon = new Date(_d0.getTime()); _mon.setDate(_d0.getDate() - ((_dowN+6)%7));
    var _fri = new Date(_mon.getTime()); _fri.setDate(_mon.getDate()+4);
    var _wkS = _ymd2(_mon), _wkE = _ymd2(_fri);
    var _collectOS = function(pred){
      var by = {};
      Object.keys(_aCharts).forEach(function(k){
        var idx=k.lastIndexOf("_"); if(idx<0)return;
        var stk=k.slice(0,idx), dt=k.slice(idx+1);
        if(!pred(dt))return;
        var c=_aCharts[k];
        (Array.isArray(c.signals)?c.signals:[]).forEach(function(sig){
          var s=_compatSignal(sig); if(!_epIsV2(s)||!_elInclTotal(s)||s.osVal==null||s.osVal==="")return;
          (by[stk]=by[stk]||[]).push({signal:s});
        });
      });
      return by;
    };
    var _osDay = _collectOS(function(dt){ return dt===date; });
    var _osWk = _collectOS(function(dt){ return dt>=_wkS && dt<=_wkE; });
    var _osAll = _collectOS(function(){ return true; });
    var _dayStocks = Object.keys(_osDay).sort();
    var _osTable = null, _osInsight = null;
    if (_dayStocks.length) {
      var _osRows = _dayStocks.map(function(stk, ri){
        var sd=_elOsStatsV2(_osDay[stk], _elOsMaxAll), sw=_elOsStatsV2(_osWk[stk], _elOsMaxAll), sa=_elOsStatsV2(_osAll[stk], _elOsMaxAll);
        var _avgNode = function(st){ return st ? React.createElement("span",{style:{display:"inline-flex",flexDirection:"column",alignItems:"center",lineHeight:1.15}}, React.createElement("span",{style:{fontWeight:700,color:_vcol(st.med,true)}}, "中"+st.med+"円"), React.createElement("span",{style:{fontSize:9,color:"#888"}}, "平"+st.avg+"円")) : React.createElement("span",{style:{color:"#ccc"}},"—"); };
        var _cmp = (sd&&sa) ? (sd.med>sa.med?React.createElement("span",{style:{color:"#C0392B",fontWeight:700}},"↑高い"):sd.med<sa.med?React.createElement("span",{style:{color:"#1E8449",fontWeight:700}},"↓低い"):React.createElement("span",{style:{color:"#888"}},"≈同等")) : React.createElement("span",{style:{color:"#ccc"}},"—");   // セル主表示(中央値)に矢印基準を統一＝確立ルール(OS比較は中央値) 2026-06-24i
        return React.createElement("tr",{key:ri},
          _td2(stk,{textAlign:"left",fontWeight:700,color:"#9A3412"}),
          _td2(React.createElement("span",null,_avgNode(sd), sd?React.createElement("span",{style:{fontSize:9,color:"#bbb",marginLeft:2}},"("+sd.n+")"):null)),
          _td2(React.createElement("span",null,_avgNode(sw), sw?React.createElement("span",{style:{fontSize:9,color:"#bbb",marginLeft:2}},"("+sw.n+")"):null)),
          _td2(React.createElement("span",null,_avgNode(sa), sa?React.createElement("span",{style:{fontSize:9,color:"#bbb",marginLeft:2}},"("+sa.n+")"):null)),
          _td2(sa?_elOsDistBarV2(sa.vals,72,11):React.createElement("span",{style:{color:"#ccc"}},"—")),
          _td2(_cmp));
      });
      _osTable = React.createElement("div",{style:{overflowX:"auto"}}, React.createElement("table",{style:{borderCollapse:"collapse",width:"100%",fontSize:11}}, React.createElement("thead",null,React.createElement("tr",{style:{background:"#f5f4f0"}}, _th2("銘柄",{textAlign:"left"}), _th2("本日OS値"), _th2("今週"), _th2("全期間"), _th2("全期間分布"), _th2("本日vs全期間"))), React.createElement("tbody",null,_osRows)));
      var _flat = function(by){ var out=[]; Object.keys(by).forEach(function(k){ out=out.concat(by[k]); }); return out; };
      var _allDay=_elOsStatsV2(_flat(_osDay), _elOsMaxAll), _allAll=_elOsStatsV2(_flat(_osAll), _elOsMaxAll);
      if (_allDay && _allAll) {
        _osInsight = _elInsightBoxV2([ React.createElement("span",null,"本日のOS値平均は",_elInsightEmV2(_allDay.avg+"円"),"（全期間平均",_elInsightEmV2(_allAll.avg+"円"),"）＝",_elInsightEmV2(_allDay.avg>_allAll.avg?"全体より大きめ（オーバーシュートが深い傾向）":_allDay.avg<_allAll.avg?"全体より小さめ（オーバーシュートが浅い傾向）":"全体と同程度"),"。") ], { title:"OS値平均", note:"OS値＝OS1〜3の最高値（水準線比）。大きいほどオーバーシュートが深い。" });
      }
    }

    return React.createElement("div", { style: Object.assign({}, Card, { marginTop: 0 }) },
      React.createElement("div",{style:{fontSize:13,fontWeight:700,marginBottom:10,color:"#333"}},"📊 本日のデータ分析"),
      (!_ladderTable && !_osTable) ? React.createElement("div",{style:{color:"#aaa",fontSize:12}},"分析できるEP起算記録がありません") : null,
      React.createElement("div",{style:_aCard}, _hdr("📍 EP位置別の損益傾向","OS1/OS2/OS3のどれがEPになったか別の勝率・平均損益・損切り率（本日）"), _elEpPosSectionV2(_dayRecs, function(r){ return { alpha: r.alpha, cutLine: r.cut }; })),
      _ladderTable ? React.createElement("div",{style:_aCard}, _hdr("📈 EP→OS5 ホールド検証","EPからその後の足を持ち続けた場合の損益推移（損切りが先か・利益を伸ばせたか）"), _ladderTable, _ladderInsight) : null,
      _osTable ? React.createElement("div",{style:_aCard}, _hdr("📊 銘柄別 OS値分析","本日・今週・全期間の比較（OS値＝OS1〜3の最高値）"), _osTable, _osInsight) : null,
      React.createElement("div",{style:_aCard}, _hdr("🔗 OS連鎖分析","OS1→OS2→OS3…の数値帯ごとの次OS分布・遷移と成績（本日）"), React.createElement(_elOsChainSection, { recs: _dayRecs, data: data, aiOf: function(r){ return { alpha: r.alpha, cutLine: r.cut }; }, dense: true }))
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


