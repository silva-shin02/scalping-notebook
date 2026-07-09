function Calendar(_ref60) {
  var year = _ref60.year,
    month = _ref60.month,
    data = _ref60.data,
    onSelect = _ref60.onSelect,
    save = _ref60.save;
  var _useState147 = useState(null),
    _useState148 = _slicedToArray(_useState147, 2),
    hovered = _useState148[0],
    setHovered = _useState148[1],
    _useState149 = useState(null),
    _useState150 = _slicedToArray(_useState149, 2),
    tapped = _useState150[0],
    setTapped = _useState150[1];
  var today = todayStr();
  var dim = new Date(year, month + 1, 0).getDate(),
    _jsFirstDow = new Date(year, month, 1).getDay(),
    sd = (_jsFirstDow + 6) % 7; 
  var cells = [].concat(_toConsumableArray(Array(sd).fill(0)), _toConsumableArray(Array.from({
    length: dim
  }, function (_, i) {
    return i + 1;
  })));
  while (cells.length % 7) cells.push(0);
  
  var DAYS_JP_MON = ["\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F", "\u65E5"];
  
  var eventCategories = (data && data.custom && Array.isArray(data.custom.eventCategories) && data.custom.eventCategories.length > 0)
    ? data.custom.eventCategories
    : [{ id: "evcat_other", name: "\u305D\u306E\u4ED6", color: "#6366F1" }];
  
  var _usQA = useState(null), _usQAS = _slicedToArray(_usQA, 2),
      quickAdd = _usQAS[0], setQuickAdd = _usQAS[1];
  useModalBack(quickAdd != null, function(){
    var doClose = function(){ setQuickAdd(null); };
    if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
      window.__snEditingGuard.canLeave(doClose);
    } else { doClose(); }
  }, "cal-quick-add");
  var _usCMG = useState(false), _usCMGS = _slicedToArray(_usCMG, 2),
      catMgmtOpen = _usCMGS[0], setCatMgmtOpen = _usCMGS[1];
  useModalBack(catMgmtOpen, function(){ setCatMgmtOpen(false); }, "cal-cat-mgmt");
  var stockHasContent = function stockHasContent(k) {
    var c = data.charts[k];
    return c && (c.chartImg || c.macroLocal || c.flowCodes && c.flowCodes.length || (c.stockTags && c.stockTags.length || c.chartShapeTags && c.chartShapeTags.length) || c.signals && c.signals.length || (c.chartMemoHtml && c.chartMemoHtml.length > 0) || c.chartMemo && (_hasText(c.chartMemo.text) || c.chartMemo.images && c.chartMemo.images.length));
  };
  
  var eventsByDate = useMemo(function() {
    var m = {};
    if (!data || !data.trades) return m;
    Object.keys(data.trades).forEach(function(dt) {
      var dd = data.trades[dt];
      if (!dd || !Array.isArray(dd.events)) return;
      dd.events.forEach(function(ev) {
        if (!ev || ev._deleted) return;

        if (!m[dt]) m[dt] = [];
        m[dt].push(ev);
        
        if (ev.endDate && ev.endDate > dt) {
          try {
            var s = new Date(dt + "T00:00");
            var e = new Date(ev.endDate + "T00:00");
            for (var d2 = new Date(s.getTime() + 86400000); d2 <= e; d2 = new Date(d2.getTime() + 86400000)) {
              var k2 = d2.getFullYear() + "-" + String(d2.getMonth() + 1).padStart(2, "0") + "-" + String(d2.getDate()).padStart(2, "0");
              if (!m[k2]) m[k2] = [];
              m[k2].push(ev);
            }
          } catch(e2){}
        }
      });
    });
    
    
    
    var _timeKey = function(ev) {
      if (!ev) return 99999;
      
      if (ev.allDay) return -1;
      var t = ev.startTime || "";
      var mm = /^(\d{1,2}):(\d{2})/.exec(t);
      if (!mm) return -1; 
      return parseInt(mm[1], 10) * 60 + parseInt(mm[2], 10);
    };
    Object.keys(m).forEach(function(dt) {
      m[dt].sort(function(a, b) {
        var ta = _timeKey(a), tb = _timeKey(b);
        if (ta !== tb) return ta - tb;
        var ia = (a && a.id) || 0;
        var ib = (b && b.id) || 0;
        if (ia < ib) return -1;
        if (ia > ib) return 1;
        return 0;
      });
    });
    return m;
  }, [data && data.trades]);
  
  var gradeByDate = useMemo(function() {
    var m = {};
    if (!data || !data.charts) return m;
    Object.keys(data.charts).forEach(function(ck) {
      
      var parts = ck.split("_");
      var dt = parts[parts.length - 1];
      if (!dt || !/^\d{4}-\d{2}-\d{2}$/.test(dt)) return;
      var c = data.charts[ck];
      if (!c || !Array.isArray(c.signals)) return;
      c.signals.forEach(function(sig) {
        var s = _compatSignal(sig);
        if (!_elInclTotal(s)) return;
        if (_elCollExcludedSig(data, ck.slice(0, ck.lastIndexOf("_")), dt, s)) return;
        if (!_elIsEntered(s, null)) return;
        if (!m[dt]) m[dt] = { sum: 0, count: 0 };
        var v = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        m[dt].sum += (v != null ? v : 0);
        m[dt].count += 1;
      });
    });
    var result = {};
    Object.keys(m).forEach(function(dt) {
      result[dt] = { grade: _profitGradeFromPnlReal(m[dt].sum, m[dt].count), sum: m[dt].sum };
    });
    return result;
  }, [data && data.charts]);
  
  var calHolidaySet = useMemo(function() {
    return _buildHolidayDateSet(data && data.trades, data && data.custom && data.custom.eventCategories);
  }, [data && data.trades, data && data.custom && data.custom.eventCategories]);
  var grid = React.createElement("div", {
    onMouseLeave: IS_TOUCH ? undefined : function () {
      return setHovered(null);
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2,
      marginBottom: 4
    }
  }, DAYS_JP_MON.map(function (d) {
    return React.createElement("div", {
      key: d,
      style: {
        textAlign: "center",
        fontSize: 12,
        fontWeight: 700,
        padding: "4px 0",
        color: d === "\u65E5" ? "#C0392B" : d === "\u571F" ? "#2874A6" : "#999"
      }
    }, d);
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2
    }
  }, cells.map(function (d, i) {
    if (!d) return React.createElement("div", {
      key: "e" + i,
      style: {
        background: "#fafaf8",
        borderRadius: 6,
        height: 130
      }
    });
    var key = dateFmt(year, month, d);
    var dayEvents = (eventsByDate && eventsByDate[key]) || [];
    var hasEvents = dayEvents.length > 0;
    
    var jsDow = new Date(year, month, d).getDay();
    var monDow = (jsDow + 6) % 7;
    var isHov = !IS_TOUCH && hovered === key;
    var isTap = tapped === key;
    var isToday = key === today;
    return React.createElement("div", {
      key: "c" + i,
      className: "cal-cell",
      onClick: function onClick() {
        return setTapped(function (p) {
          return p === key ? null : key;
        });
      },
      onMouseEnter: IS_TOUCH ? undefined : function () {
        return setHovered(key);
      },
      style: {
        position: "relative",
        background: isHov ? "#F0F4FF" : isTap ? "#EEF2FF" : isToday ? "#E0F4FF" : "#fff",
        border: "1px solid " + (isHov ? "#6366F1" : isTap ? "#6366F1" : isToday ? "#7DBFDC" : "#e0ddd6"),
        borderRadius: 8,
        padding: "4px 4px 4px 4px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height: 130,
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "background .1s,border-color .1s"
      }
    },
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", lineHeight: 1.3 }
      },
        React.createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 3 }
        },
          React.createElement("div", {
            className: "cal-date",
            style: {
              fontSize: 13,
              fontWeight: 700,
              color: monDow === 6 ? "#C0392B" : monDow === 5 ? "#2874A6" : "#1a1a1a"
            }
          }, d),
          (function() {
            var _gd = gradeByDate[key];
            if (_gd) {
              var _gs = _GRADE_STYLE[_gd.grade] || _GRADE_STYLE.Z;
              var _s = _gd.sum;
              var _sDisp = (_s > 0 ? "+" : "") + (_s >= 10000 || _s <= -10000
                ? (Math.round(_s / 100) / 10) + "k"
                : _s.toLocaleString());
              return React.createElement(React.Fragment, null,
                React.createElement("span", {
                  title: "損益グレード: " + _gd.grade + " (" + (_GRADE_DESC_REAL[_gd.grade] || "") + ")\n合計: " + (_s > 0 ? "+" : "") + _s.toLocaleString() + "円",
                  style: {
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 16, height: 16, borderRadius: "50%",
                    background: _gs.bg, color: _gs.color,
                    border: "1.5px solid " + _gs.border,
                    fontWeight: 800, fontSize: 10, lineHeight: 1, flexShrink: 0
                  }
                }, _gd.grade),
                React.createElement("span", {
                  style: {
                    fontSize: 9, fontWeight: 700, color: _s >= 0 ? "#C0392B" : "#1E8449",
                    lineHeight: 1, whiteSpace: "nowrap"
                  }
                }, _sDisp)
              );
            }
            
            if (monDow < 5 && !calHolidaySet[key] && key <= today) {
              var _zs = _GRADE_STYLE.Z;
              return React.createElement("span", {
                title: "取引なし",
                style: {
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 16, height: 16, borderRadius: "50%",
                  background: _zs.bg, color: _zs.color,
                  border: "1.5px solid " + _zs.border,
                  fontWeight: 800, fontSize: 10, lineHeight: 1, flexShrink: 0
                }
              }, "Z");
            }
            return null;
          })(),
          (function() { var _xc = _elDayExclCount(data, key); return _xc > 0 ? _elExclDot(_xc, { width: 8, height: 8 }) : null; })(),
          (function() { var _cc = _elDayCollCount(data, key); return _cc > 0 ? _elCollDot(_cc, { width: 8, height: 8 }) : null; })()
        ),
        React.createElement("button", {
          onClick: function(e) {
            e.stopPropagation();
            setQuickAdd({
              date: key,
              id: "new",
              title: "",
              allDay: true,
              startTime: "",
              endTime: "",
              endDate: "",
              contentHtml: "",
              categoryId: (eventCategories[0] && eventCategories[0].id) || ""
            });
          },
          title: "\u3053\u306E\u65E5\u306B\u4E88\u5B9A\u3092\u8FFD\u52A0",
          style: {
            width: 18, height: 18, borderRadius: "50%",
            background: isHov ? "#6366F1" : "rgba(99,102,241,0.18)",
            color: isHov ? "#fff" : "#6366F1",
            border: "none", fontSize: 12, fontWeight: 700, lineHeight: 1,
            cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: IS_TOUCH ? 0.85 : (isHov ? 1 : 0.55)
          }
        }, "+")
      ),
      
      hasEvents && React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }
      },
        dayEvents.slice(0, 4).map(function(ev, ei) {
          
          
          var label = ev.title || (ev.contentHtml ? stripHtml(ev.contentHtml) : (ev.content || "(\u7121\u984C)"));
          var bg = getEventColor(ev, eventCategories);
          var prefix = (ev.allDay === false && ev.startTime) ? (ev.startTime + " ") : "";
          return React.createElement("div", {
            key: ev.id != null ? ev.id : ei,
            style: {
              fontSize: 9.5, color: "#fff", background: bg,
              padding: "2px 4px", borderRadius: 3, lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: "100%", flexShrink: 0
            },
            title: (ev.title || "") + (prefix ? " (" + prefix.trim() + ")" : "")
          }, prefix + label);
        }),
        dayEvents.length > 4 && React.createElement("div", {
          style: { fontSize: 9, color: "#6366F1", fontWeight: 600 }
        }, "+", dayEvents.length - 4, " \u4EF6")
      )
    );
  })), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "center",
      marginTop: 10,
      fontSize: 11,
      color: "#888",
      flexWrap: "wrap"
    }
  },
    eventCategories.map(function(c) {
      return React.createElement("span", {
        key: c.id,
        style: {
          display: "inline-flex", alignItems: "center", gap: 4
        }
      },
        React.createElement("span", {
          style: { width: 8, height: 8, borderRadius: 2, background: c.color }
        }),
        c.name
      );
    }),
    React.createElement("button", {
      onClick: function(){ setCatMgmtOpen(true); },
      style: {
        marginLeft: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600,
        background: "#fff", color: "#666", border: "1px solid #ccc",
        borderRadius: 4, cursor: "pointer"
      }
    }, "\u2699 \u30AB\u30C6\u30B4\u30EA\u7BA1\u7406")
  ));

  
  var hoverPreview = !IS_TOUCH && (hovered ? React.createElement("div", {
    style: {
      marginTop: 12,
      background: "#fff",
      border: "2px solid #6366F1",
      borderRadius: 12,
      padding: "16px 18px",
      boxShadow: "0 4px 24px rgba(99,102,241,.18)",
      maxHeight: "calc(100vh - 340px)",
      minHeight: 120,
      overflowY: "auto"
    }
  }, React.createElement(CalendarPreview, {
    date: hovered,
    data: data,
    save: save
  })) : React.createElement("div", {
    style: {
      marginTop: 12,
      border: "2px dashed #e0ddd6",
      borderRadius: 12,
      padding: "28px 16px",
      textAlign: "center",
      color: "#ccc",
      fontSize: 12,
      lineHeight: 2,
      background: "#fafaf8"
    }
  }, "\uD83D\uDCC5", React.createElement("br", null), "\u65E5\u4ED8\u306B\u30AB\u30FC\u30BD\u30EB\u3092\u5408\u308F\u305B\u308B\u3068\u8A73\u7D30\u8868\u793A", React.createElement("br", null), "\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u3053\u306E\u65E5\u306E\u5168\u60C5\u5831\u3092\u8868\u793A"));

  
  var bottomSheet = tapped && ReactDOM.createPortal(React.createElement("div", {
    onClick: function onClick() {
      return setTapped(null);
    },
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.5)",
      zIndex: 5000,
      display: "flex",
      alignItems: "flex-end"
    }
  }, React.createElement("div", {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    style: {
      width: "100%",
      maxWidth: 1100,
      margin: "0 auto",
      maxHeight: "88vh",
      overflowY: "auto",
      background: "#fff",
      borderRadius: "16px 16px 0 0",
      paddingBottom: "env(safe-area-inset-bottom,0)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 16px 10px",
      borderBottom: "1px solid #f0eeea",
      position: "sticky",
      top: 0,
      background: "#fff",
      zIndex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, tapped, "\uFF08", DAYS_JP[new Date(tapped + "T00:00:00").getDay()], "\uFF09"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("button", {
    onClick: function onClick() {
      onSelect(tapped);
      setTapped(null);
    },
    style: {
      padding: "10px 20px",
      background: "#1a1a1a",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14
    }
  }, "\u3053\u306E\u65E5\u3092\u958B\u304F \u2192"), React.createElement("button", {
    onClick: function onClick() {
      return setTapped(null);
    },
    style: {
      padding: "10px 14px",
      background: "#f5f4f0",
      border: "1px solid #ddd",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 18,
      lineHeight: 1
    }
  }, "\u2715"))), React.createElement("div", {
    style: {
      padding: "12px 16px 24px"
    }
  }, React.createElement(CalendarPreview, {
    date: tapped,
    data: data,
    save: save
  })))), document.body);
  
  var quickAddModal = quickAdd != null && React.createElement("div", {
    onClick: function(){
      var doClose = function(){ setQuickAdd(null); };
      if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
        window.__snEditingGuard.canLeave(doClose);
      } else { doClose(); }
    },
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
      }, "\uD83D\uDCC5 ", quickAdd.date, " \u306B\u4E88\u5B9A\u3092\u8FFD\u52A0"),
      React.createElement("button", {
        onClick: function(){
          var doClose = function(){ setQuickAdd(null); };
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
        React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } }, "\u30BF\u30A4\u30C8\u30EB"),
        React.createElement(FastInput, {
          type: "text",
          "data-fi-key": "quickAddTitle",
          value: quickAdd.title,
          onChange: function(v){ setQuickAdd(function(p){ return _objectSpread(_objectSpread({}, p), {}, { title: v }); }); },
          autoFocus: true,
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
            onClick: function(){ setCatMgmtOpen(true); },
            style: {
              fontSize: 10, padding: "1px 6px", background: "#fff",
              border: "1px solid #ccc", borderRadius: 3, cursor: "pointer", color: "#666"
            }
          }, "\u2699 \u7BA1\u7406")
        ),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
          eventCategories.map(function(c) {
            var on = quickAdd.categoryId === c.id;
            return React.createElement("button", {
              key: c.id,
              onClick: function(){ setQuickAdd(function(p){ return _objectSpread(_objectSpread({}, p), {}, { categoryId: c.id }); }); },
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
            value: quickAdd.startTime || "",
            onChange: function(e){
              var v = e.target.value;
              setQuickAdd(function(p){
                return _objectSpread(_objectSpread({}, p), {}, { startTime: v, allDay: v ? false : p.allDay });
              });
            },
            style: { fontSize: 14, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5 }
          }),
          React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "\u301C"),
          React.createElement("input", {
            type: "time",
            value: quickAdd.endTime || "",
            onChange: function(e){
              var v = e.target.value;
              setQuickAdd(function(p){
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
              checked: !!quickAdd.allDay && !quickAdd.startTime && !quickAdd.endTime,
              onChange: function(e){
                var v = e.target.checked;
                setQuickAdd(function(p){
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
        React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } }, "\u7D42\u4E86\u65E5 (\u8907\u6570\u65E5\u306E\u5834\u5408)"),
        React.createElement("input", {
          type: "date",
          value: quickAdd.endDate,
          onChange: function(e){ var v=e.target.value; setQuickAdd(function(p){ return _objectSpread(_objectSpread({}, p), {}, { endDate: v }); }); },
          style: {
            fontSize: 13, padding: "6px 8px",
            border: "1px solid #ccc", borderRadius: 5, boxSizing: "border-box"
          }
        })
      ),
      
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 } }, "\u5185\u5BB9\u30E1\u30E2"),
        React.createElement(MemoEditableField, {
          key: "mef_qa_" + quickAdd.date,
          html: quickAdd.contentHtml || "",
          onChange: function(h){ setQuickAdd(function(p){ if (!p) return p; return _objectSpread(_objectSpread({}, p), {}, { contentHtml: h }); }); },
          placeholder: "詳細、URL、画像貼り付けなど",
          autoEdit: true,
          inlineButtons: false,
          guardOwner: "quickAdd_" + quickAdd.date
        })
      ),
      
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingTop: 4 } },
        React.createElement("button", {
          onMouseDown: _fiFlushAll,
          onTouchStart: _fiFlushAll,
          onClick: function() {
            if (!quickAdd) return;
            
            _fiFlushAll();
            var titleNow = quickAdd.title;
            try {
              var inps = document.querySelectorAll("input[data-fi-key='quickAddTitle']");
              if (inps.length) titleNow = inps[inps.length - 1].value || "";
            } catch (_e) {}
            var html = (quickAdd.contentHtml || "").trim();
            var hasHtml = _hasText(html);
            var clean = {
              id: Date.now(),
              title: (titleNow || "").trim(),
              allDay: !(quickAdd.startTime || quickAdd.endTime),
              startTime: quickAdd.startTime || "",
              endTime: quickAdd.endTime || "",
              content: "",
              contentHtml: hasHtml ? html : "",
              endDate: (quickAdd.endDate || "").trim(),
              relatedStocks: [],
              categoryId: quickAdd.categoryId || ""
            };
            if (!clean.title && !hasHtml) {
              setQuickAdd(null); return;
            }
            var dt = quickAdd.date;
            save(function(prevData) {
              var prevDd = (prevData.trades && prevData.trades[dt]) || {};
              var prevEvents = Array.isArray(prevDd.events) ? prevDd.events : [];
              var newEvents = prevEvents.concat([clean]);
              return _objectSpread(_objectSpread({}, prevData), {}, {
                trades: _objectSpread(_objectSpread({}, prevData.trades), {}, _defineProperty({}, dt,
                  _objectSpread(_objectSpread({}, prevDd), {}, { events: newEvents })))
              });
            });
            setQuickAdd(null);
          },
          style: {
            marginLeft: "auto", padding: "8px 18px", fontSize: 13, fontWeight: 700,
            background: "#10B981", color: "#fff", border: "none",
            borderRadius: 6, cursor: "pointer"
          }
        }, "\u4FDD\u5B58")
      )
    )
  ));
  
  var catMgmtModal = catMgmtOpen && React.createElement(EventCategoryManagementModal, {
    eventCategories: eventCategories,
    save: save,
    onClose: function(){ setCatMgmtOpen(false); }
  });
  return React.createElement("div", null, grid, hoverPreview, bottomSheet, quickAddModal, catMgmtModal);
}


function EventCategoryManagementModal(_propECM) {
  var eventCategories = _propECM.eventCategories;
  var save = _propECM.save;
  var onClose = _propECM.onClose;
  useModalBack(true, onClose, "evcat-mgmt");
  var _usNew = useState({ name: "", color: "#6366F1" }),
      _usNewS = _slicedToArray(_usNew, 2),
      newCat = _usNewS[0], setNewCat = _usNewS[1];
  var updateCats = function(updater) {
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var prevCats = (Array.isArray(prevCustom.eventCategories) ? prevCustom.eventCategories : []).slice();
      var newCats = updater(prevCats);
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, { eventCategories: newCats })
      });
    });
  };
  var addCat = function() {
    var nm = (newCat.name || "").trim();
    if (!nm) return;
    if (eventCategories.some(function(c){ return c.name === nm; })) {
      window.alert("\u540C\u540D\u306E\u30AB\u30C6\u30B4\u30EA\u304C\u3042\u308A\u307E\u3059");
      return;
    }
    var nid = "evcat_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    updateCats(function(prev) { return prev.concat([{ id: nid, name: nm, color: newCat.color }]); });
    setNewCat({ name: "", color: newCat.color });
  };
  var renameCat = function(id, nm) {
    var t = (nm || "").trim();
    if (!t) return;
    updateCats(function(prev) { return prev.map(function(c){ return c.id === id ? _objectSpread(_objectSpread({}, c), {}, { name: t }) : c; }); });
  };
  var changeColor = function(id, color) {
    updateCats(function(prev) { return prev.map(function(c){ return c.id === id ? _objectSpread(_objectSpread({}, c), {}, { color: color }) : c; }); });
  };
  var delCat = function(id) {
    if (eventCategories.length <= 1) {
      window.alert("\u6700\u4F4E 1 \u3064\u306F\u30AB\u30C6\u30B4\u30EA\u3092\u6B8B\u3057\u3066\u304F\u3060\u3055\u3044");
      return;
    }
    if (!window.confirm("\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\n(\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u306B\u5C5E\u3057\u3066\u3044\u305F\u4E88\u5B9A\u306F\u300C\u672A\u5206\u985E\u300D\u306B\u306A\u308A\u307E\u3059)")) return;
    updateCats(function(prev) { return prev.filter(function(c){ return c.id !== id; }); });
  };
  var moveCat = function(id, dir) {
    updateCats(function(prev) {
      var idx = prev.findIndex(function(c){ return c.id === id; });
      if (idx < 0) return prev;
      var ni = idx + dir;
      if (ni < 0 || ni >= prev.length) return prev;
      var arr = prev.slice();
      var t = arr[ni]; arr[ni] = arr[idx]; arr[idx] = t;
      return arr;
    });
  };
  return React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: {
      background: "#fff", borderRadius: 12,
      maxWidth: 520, width: "100%", maxHeight: "85vh",
      display: "flex", flexDirection: "column"
    }
  },
    React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #e0ddd6", flexShrink: 0
      }
    },
      React.createElement("span", { style: { fontSize: 14, fontWeight: 700 } }, "\u2699 \u4E88\u5B9A\u30AB\u30C6\u30B4\u30EA\u7BA1\u7406"),
      React.createElement("button", {
        onClick: onClose,
        style: {
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer"
        }
      }, "\u9589\u3058\u308B")
    ),
    React.createElement("div", {
      style: { padding: "12px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }
    },
      
      eventCategories.map(function(c, i) {
        return React.createElement("div", {
          key: c.id,
          style: {
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", border: "1px solid #e0ddd6", borderRadius: 6
          }
        },
          React.createElement("input", {
            type: "color",
            value: c.color,
            onChange: function(e){ changeColor(c.id, e.target.value); },
            style: {
              width: 36, height: 30, padding: 0, border: "1px solid #ccc",
              borderRadius: 4, cursor: "pointer", flexShrink: 0, background: "#fff"
            }
          }),
          React.createElement("input", {
            type: "text",
            defaultValue: c.name,
            onBlur: function(e){ renameCat(c.id, e.target.value); },
            style: {
              flex: 1, fontSize: 13, padding: "5px 7px",
              border: "1px solid #ddd", borderRadius: 5
            }
          }),
          React.createElement("button", {
            onClick: function(){ moveCat(c.id, -1); },
            disabled: i === 0,
            style: {
              padding: "3px 8px", fontSize: 12, background: "#fff",
              border: "1px solid #ccc", borderRadius: 4,
              cursor: i === 0 ? "not-allowed" : "pointer", color: i === 0 ? "#ccc" : "#666"
            }
          }, "\u2191"),
          React.createElement("button", {
            onClick: function(){ moveCat(c.id, 1); },
            disabled: i === eventCategories.length - 1,
            style: {
              padding: "3px 8px", fontSize: 12, background: "#fff",
              border: "1px solid #ccc", borderRadius: 4,
              cursor: i === eventCategories.length - 1 ? "not-allowed" : "pointer",
              color: i === eventCategories.length - 1 ? "#ccc" : "#666"
            }
          }, "\u2193"),
          React.createElement("button", {
            onClick: function(){ delCat(c.id); },
            style: {
              padding: "3px 8px", fontSize: 12, background: "#fff",
              color: "#DC2626", border: "1px solid #FCA5A5",
              borderRadius: 4, cursor: "pointer"
            }
          }, "\u2715")
        );
      }),
      
      React.createElement("div", {
        style: {
          display: "flex", alignItems: "center", gap: 8, marginTop: 8,
          padding: "8px 10px", background: "#fafaf8",
          border: "1px dashed #ccc", borderRadius: 6
        }
      },
        React.createElement("input", {
          type: "color",
          value: newCat.color,
          onChange: function(e){ var v=e.target.value; setNewCat(function(p){ return _objectSpread(_objectSpread({}, p), {}, { color: v }); }); },
          style: {
            width: 36, height: 30, padding: 0, border: "1px solid #ccc",
            borderRadius: 4, cursor: "pointer", flexShrink: 0, background: "#fff"
          }
        }),
        React.createElement(FastInput, {
          type: "text",
          value: newCat.name,
          onChange: function(v){ setNewCat(function(p){ return _objectSpread(_objectSpread({}, p), {}, { name: v }); }); },
          onKeyDown: function(e){ if (e.key === "Enter") addCat(); },
          placeholder: "\u65B0\u3057\u3044\u30AB\u30C6\u30B4\u30EA\u540D",
          style: {
            flex: 1, fontSize: 13, padding: "5px 7px",
            border: "1px solid #ddd", borderRadius: 5
          }
        }),
        React.createElement("button", {
          onClick: addCat,
          style: {
            padding: "5px 14px", fontSize: 12, fontWeight: 700,
            background: "#10B981",
            color: "#fff", border: "none", borderRadius: 5,
            cursor: "pointer"
          }
        }, "\u8FFD\u52A0")
      )
    )
  ));
}






function _hdRecentRecords(data, days) {
  var all = _elCollectAllSignals(data);
  var now = new Date();
  var cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  var cutStr = cutoff.toISOString().slice(0, 10);
  return all.filter(function(r) { return r.date >= cutStr && _elInclTotal(r.signal); });
}


function _hdEnteredOnly(records) {
  return records.filter(function(r) { return _elIsEntered(r.signal, r.item); });
}


function _hdTagKey(s) {
  return s.isCustomTag ? "__c__" + (s.customTagText || "(空)") : (s.tag || "(未設定)");
}



function _hdGroupByTag(records, data) {
  var map = {};
  records.forEach(function(r) {
    _elTagEntries(r.signal).forEach(function(e) {
      if (!map[e.key]) map[e.key] = { key: e.key, label: e.label, records: [] };
      map[e.key].records.push(r);
    });
  });
  Object.keys(map).forEach(function(k) {
    map[k].stats = _elCalcStats(map[k].records, data);
  });
  return map;
}


function _hdWinTop3(records, data) {
  var g = _hdGroupByTag(records, data);
  return Object.values(g)
    .filter(function(x) { return x.stats.total >= 3 && x.stats.winPct != null && x.stats.winPct >= 50; })
    .sort(function(a, b) {
      if (b.stats.winPct !== a.stats.winPct) return b.stats.winPct - a.stats.winPct;
      return b.stats.total - a.stats.total;
    })
    .slice(0, 3);
}


function _hdLoseTop3(records, data) {
  var g = _hdGroupByTag(records, data);
  return Object.values(g)
    .filter(function(x) { return x.stats.total >= 3 && x.stats.winPct != null && x.stats.winPct < 50; })
    .sort(function(a, b) {
      if (a.stats.winPct !== b.stats.winPct) return a.stats.winPct - b.stats.winPct;
      return b.stats.total - a.stats.total;
    })
    .slice(0, 3);
}



function _hdConsecutiveLosses(records, minStreak, data) {
  if (minStreak == null) minStreak = 3;
  var g = _hdGroupByTag(records, data);
  var alerts = [];
  Object.values(g).forEach(function(grp) {
    
    var sorted = grp.records.slice().sort(function(a, b) {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.signal.time || "").localeCompare(a.signal.time || "");
    });
    var streak = 0;
    for (var i = 0; i < sorted.length; i++) {
      // 勝敗はライブα基準（v2/v3はresult=null保存のためEP足から導出）
      var _aiCl = _elAlphaInfo(sorted[i], data);
      var _resCl = _elDynResult(sorted[i].signal, _aiCl.alpha, _aiCl.cutLine);
      if (_resCl === "ng") streak++;
      else if (_resCl === "ok") break;

    }
    if (streak >= minStreak) {
      alerts.push({
        key: grp.key,
        label: grp.label,
        streak: streak,
        total: grp.stats.total,
        lastDate: sorted[0] ? sorted[0].date : ""
      });
    }
  });
  return alerts.sort(function(a, b) { return b.streak - a.streak; });
}




function SignalDashboard(_ref_sd) {
  var data = _ref_sd.data,
    onOpenLog = _ref_sd.onOpenLog;

  
  var records = useMemo(function() {
    return _hdEnteredOnly(_hdRecentRecords(data, 30));
  }, [data]);

  var winTop = useMemo(function() { return _hdWinTop3(records, data); }, [records, data]);
  var loseTop = useMemo(function() { return _hdLoseTop3(records, data); }, [records, data]);
  var alerts = useMemo(function() { return _hdConsecutiveLosses(records, 3, data); }, [records, data]);

  
  if (records.length === 0) return null;

  var TagChip = function(grp, color) {
    return React.createElement("div", {
      key: grp.key,
      onClick: function() { onOpenLog && onOpenLog(); },
      style: {
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 10px", borderRadius: 6, cursor: "pointer",
        background: color.bg, border: "1px solid " + color.br,
        fontSize: 12, fontWeight: 600
      },
      onMouseEnter: function(e) { e.currentTarget.style.transform = "translateY(-1px)"; },
      onMouseLeave: function(e) { e.currentTarget.style.transform = ""; }
    },
      React.createElement("span", {
        style: { color: color.tx, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
      }, grp.label),
      React.createElement("span", {
        style: { color: color.tx2, fontWeight: 700 }
      }, grp.stats.winPct + "%"),
      React.createElement("span", {
        style: { color: color.tx2, fontSize: 10, fontWeight: 500 }
      }, "(" + grp.stats.ok + "/" + grp.stats.total + ")")
    );
  };

  var winColor = { bg: "#FDECEA", br: "#FFCDD2", tx: "#7A1F1F", tx2: "#C0392B" };
  var loseColor = { bg: "#EAF3DE", br: "#A9DFBF", tx: "#1B5E20", tx2: "#2E7D32" };

  return React.createElement("div", { style: { marginBottom: 10 } },
    
    alerts.length > 0 && React.createElement("div", {
      style: {
        background: "#FFEBEE", border: "1.5px solid #EF5350", borderRadius: 8,
        padding: "8px 12px", marginBottom: 8, cursor: "pointer"
      },
      onClick: function() { onOpenLog && onOpenLog(); }
    },
      React.createElement("div", {
        style: { fontSize: 12, fontWeight: 700, color: "#B71C1C", marginBottom: 4 }
      }, "\u26A0\uFE0F \u9023\u6557\u30A2\u30E9\u30FC\u30C8 (\u76F4\u8FD130\u65E5)"),
      React.createElement("div", {
        style: { display: "flex", gap: 8, flexWrap: "wrap" }
      },
        alerts.map(function(a) {
          return React.createElement("div", {
            key: a.key,
            style: {
              background: "#fff", borderRadius: 5, padding: "4px 10px",
              fontSize: 12, fontWeight: 600, color: "#B71C1C",
              border: "1px solid #FFCDD2"
            }
          },
            React.createElement("span", { style: { maxWidth: 140, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "middle" } }, a.label),
            React.createElement("span", { style: { marginLeft: 6, color: "#C62828", fontWeight: 700 } }, a.streak + "\u9023\u6557\u4E2D")
          );
        })
      )
    ),
    
    (winTop.length > 0 || loseTop.length > 0) && React.createElement("div", {
      style: {
        background: "#fff", border: "1px solid #e0ddd6", borderRadius: 8,
        padding: "8px 12px"
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }
      }, "\u76F4\u8FD130\u65E5 \u30B7\u30B0\u30CA\u30EB\u30B5\u30DE\u30EA\u30FC (\u5B9F\u30A8\u30F3\u30C8\u30EA\u30FC\u306E\u307F)"),
      winTop.length > 0 && React.createElement("div", { style: { marginBottom: loseTop.length > 0 ? 6 : 0 } },
        React.createElement("div", {
          style: { fontSize: 11, color: "#2E7D32", fontWeight: 700, marginBottom: 4 }
        }, "\uD83D\uDFE2 \u52DD\u3061\u30BF\u30B0 Top" + winTop.length),
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          winTop.map(function(grp) { return TagChip(grp, winColor); })
        )
      ),
      loseTop.length > 0 && React.createElement("div", null,
        React.createElement("div", {
          style: { fontSize: 11, color: "#C0392B", fontWeight: 700, marginBottom: 4 }
        }, "\uD83D\uDD34 \u8CA0\u3051\u30BF\u30B0 Top" + loseTop.length),
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          loseTop.map(function(grp) { return TagChip(grp, loseColor); })
        )
      )
    )
  );
}





var CA_URL = "https://silva-shin02.github.io/chart-annotator/";



var DEFAULT_STOCK_MAP = {
  "INPEX": { caTicker: "INPEX", code: "1605" },
  "JX金属": { caTicker: "JX金属", code: "5016" },
  "フジクラ": { caTicker: "フジクラ", code: "5803" },
  "川崎重工": { caTicker: "川崎重工業", code: "7012" },
  "IHI": { caTicker: "IHI", code: "7013" },
  "SBG": { caTicker: "ソフトバンク", code: "9984" },
  "日経平均株価": { caTicker: "", code: "" } 
};


function _caGetStockInfo(stock, custom) {
  var sc = (custom && custom.stockCodes) || {};
  if (sc[stock]) return sc[stock];
  if (DEFAULT_STOCK_MAP[stock]) return DEFAULT_STOCK_MAP[stock];
  return { caTicker: "", code: "" };
}




function _caResolveDate(meta) {
  if (!meta) return "";
  
  var ad = String(meta.analysisDate || "").trim();
  if (ad) {
    var adNo = ad.replace(/-/g, "");
    if (/^\d{8}$/.test(adNo)) {
      return adNo.slice(0, 4) + "-" + adNo.slice(4, 6) + "-" + adNo.slice(6, 8);
    }
    return ad;
  }
  
  
  var candidates = [meta.id, meta.name, meta.ticker];
  if (meta._raw) {
    for (var k in meta._raw) {
      if (typeof meta._raw[k] === "string") candidates.push(meta._raw[k]);
    }
  }
  for (var i = 0; i < candidates.length; i++) {
    var s = String(candidates[i] || "");
    if (!s) continue;
    
    var m1 = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m1) return m1[1] + "-" + m1[2] + "-" + m1[3];
    
    var m2 = s.match(/(20\d{2})(\d{2})(\d{2})/);
    if (m2) return m2[1] + "-" + m2[2] + "-" + m2[3];
  }
  
  
  if (meta.savedAt) {
    var dt = new Date(meta.savedAt);
    if (!isNaN(dt.getTime())) {
      var jst = new Date(dt.getTime() + 9 * 3600 * 1000);
      var y = jst.getUTCFullYear();
      var mo = jst.getUTCMonth() + 1;
      var da = jst.getUTCDate();
      if (y >= 2000 && y < 2100) {
        return y + "-" + (mo < 10 ? "0" + mo : mo) + "-" + (da < 10 ? "0" + da : da);
      }
    }
  }
  return "";
}





function _caBuildUrl(code, date, draftId) {
  if (!code || !date) return CA_URL;
  
  var url = CA_URL + "?" + encodeURIComponent(code) + "_" + encodeURIComponent(date);
  if (draftId) url += "&id=" + encodeURIComponent(draftId);
  return url;
}



function _caOpen(code, date, draftId) {
  // CAは別タブ/別画面へ遷移する。iOSは背面タブをメモリ不足で破棄しがちで、書きかけの保存が間に合わず
  // 記録が消える事故があった。開く直前に保存を強制（localStorageは同期書き込み・Firebaseは即時push）。2026-06-16
  try { if (typeof _stFlush === "function") _stFlush(false); } catch(e){}
  try { if (typeof window._snFbFlushNow === "function") window._snFbFlushNow(); } catch(e){}
  var url = _caBuildUrl(code, date, draftId);
  try { console.log("[CA] open url:", url); } catch(_){}
  try {
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch(e) {
    try { window.location.href = url; } catch(e2) {
      console.warn("[chart_annotator] open failed:", e2);
    }
  }
}





var _caMetaCache = { data: null, at: 0, err: null };
var _caMetaInFlight = null; 
var CA_META_TTL = 30 * 1000; 

function _caFetchMeta(cfg, forceRefresh) {
  var now = Date.now();
  if (!forceRefresh && _caMetaCache.data && (now - _caMetaCache.at) < CA_META_TTL) {
    return Promise.resolve(_caMetaCache.data);
  }
  
  if (!forceRefresh && _caMetaInFlight) {
    return _caMetaInFlight;
  }
  if (!cfg || !cfg.fbUrl) {
    return Promise.reject(new Error("Firebase URL未設定"));
  }
  var base = cfg.fbUrl.replace(/\/$/, "") + "/chart-annotator-drafts";
  var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
  var p = fetch(base + ".json" + auth)
    .then(function(r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function(j) {
      if (!j || typeof j !== "object") {
        _caMetaCache = { data: [], at: now, err: null };
        return [];
      }
      var arr = Object.keys(j).map(function(id) {
        var m = j[id] || {};
        return {
          id: id,
          ticker: m.ticker || "",
          name: m.name || "",
          savedAt: m.savedAt || 0,
          thumbUrl: m.thumbUrl || "",
          analysisDate: m.analysisDate || "",
          _raw: m
        };
      });
      try {
        console.log("[CA] fetched meta count=" + arr.length);
      } catch(e){}
      _caMetaCache = { data: arr, at: now, err: null };
      return arr;
    })
    .catch(function(e) {
      _caMetaCache = { data: null, at: now, err: e };
      throw e;
    });
  _caMetaInFlight = p;
  
  p.then(function() { _caMetaInFlight = null; }, function() { _caMetaInFlight = null; });
  return p;
}





function _caFilterByStockDate(metaList, caTicker, date, code) {
  if (!metaList || !date) return [];
  var dateNorm = String(date).replace(/-/g, "");
  var codeStr = code ? String(code) : "";
  var srcCodeNum = codeStr || _caExtractCode(caTicker);
  var _tickerMatch = function(m) {
    if (caTicker && m.ticker === caTicker) return true;
    if (caTicker && m.name && String(m.name).indexOf(caTicker) >= 0) return true;
    if (codeStr && m.name && String(m.name).indexOf(codeStr) >= 0) return true;
    if (codeStr && m.ticker && String(m.ticker).indexOf(codeStr) >= 0) return true;
    
    if (srcCodeNum) {
      var mCode = _caExtractCode(m.ticker) || _caExtractCode(m.name) || _caExtractCode(m.id);
      if (mCode && mCode === srcCodeNum) return true;
    }
    return false;
  };
  var _dateMatch = function(m) {
    var adNorm = String(m.analysisDate || "").replace(/-/g, "");
    if (adNorm === dateNorm) return true;
    
    if (m.name) {
      var nmNorm = String(m.name).replace(/-/g, "");
      if (codeStr && nmNorm.indexOf(codeStr + "_" + dateNorm) >= 0) return true;
      if (nmNorm.indexOf(dateNorm) >= 0) return true;
    }
    return false;
  };
  var matched = metaList.filter(function(m) {
    return _tickerMatch(m) && _dateMatch(m);
  });
  return matched.sort(function(a, b) { return (b.savedAt || 0) - (a.savedAt || 0); });
}





var _caDraftInFlight = {};





function _caFetchDraftData(cfg, draftId, forceRefresh) {
  if (!cfg || !cfg.fbUrl || !draftId) return Promise.resolve(null);
  if (!forceRefresh && _caDraftInFlight[draftId]) return _caDraftInFlight[draftId];

  var idbKey = "cadraft_" + draftId;
  
  var curSavedAt = 0;
  if (_caMetaCache && _caMetaCache.data) {
    for (var i = 0; i < _caMetaCache.data.length; i++) {
      if (_caMetaCache.data[i].id === draftId) {
        curSavedAt = _caMetaCache.data[i].savedAt || 0;
        break;
      }
    }
  }

  var base = cfg.fbUrl.replace(/\/$/, "") + "/chart-annotator-drafts-data";
  var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
  var doFetch = function() {
    return fetch(base + "/" + encodeURIComponent(draftId) + ".json" + auth)
      .then(function(r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function(data) {
        if (!data) return null;
        
        try { snIdbSet(idbKey, { data: data, savedAt: curSavedAt, at: Date.now() }); } catch(_){}
        return data;
      })
      .catch(function(e) {
        console.warn("[CA] fetch draft-data failed:", e);
        return null;
      });
  };

  var p;
  if (forceRefresh) {
    p = doFetch();
  } else {
    p = snIdbGet(idbKey).then(function(cached) {
      if (cached && cached.data) {
        
        
        if (!curSavedAt || curSavedAt <= (cached.savedAt || 0)) {
          return cached.data;
        }
      }
      return doFetch();
    }).catch(function() { return doFetch(); });
  }

  _caDraftInFlight[draftId] = p;
  
  p.then(function() { delete _caDraftInFlight[draftId]; }, function() { delete _caDraftInFlight[draftId]; });
  return p;
}


function _caExtractCode(s) {
  var m = String(s || "").match(/(\d{4,5})/);
  return m ? m[1] : "";
}


var _CA_BAR_CACHE_PREFIX = "sn_dcc_ca_bar_v1_";
function _caBarCacheGet(draftId) {
  if (!draftId) return null;
  try {
    var v = localStorage.getItem(_CA_BAR_CACHE_PREFIX + draftId);
    if (!v) return null;
    return JSON.parse(v);
  } catch(e) { return null; }
}
function _caBarCacheSet(draftId, bar) {
  if (!draftId || !bar) return;
  try {
    localStorage.setItem(_CA_BAR_CACHE_PREFIX + draftId, JSON.stringify(bar));
  } catch(e) {}
}


function _caFindPrevDraftMeta(metaList, caTicker, curDate, code) {
  if (!metaList || !metaList.length || !curDate) return null;
  var curDateNum = curDate.replace(/-/g, "");
  if (!curDateNum) return null;
  var codeStr = code ? String(code) : "";
  
  var srcCodeNum = codeStr || _caExtractCode(caTicker);
  
  var rejectStats = { tickerMismatch: 0, noDate: 0, futureDate: 0, sameDate: 0 };
  var candidates = metaList.filter(function(m) {
    
    var match = false;
    if (caTicker && m.ticker === caTicker) match = true;
    if (!match && caTicker && m.name && String(m.name).indexOf(caTicker) >= 0) match = true;
    if (!match && codeStr && m.name && String(m.name).indexOf(codeStr) >= 0) match = true;
    if (!match && codeStr && m.ticker && String(m.ticker).indexOf(codeStr) >= 0) match = true;
    
    if (!match && srcCodeNum) {
      var mCode = _caExtractCode(m.ticker) || _caExtractCode(m.name) || _caExtractCode(m.id);
      if (mCode && mCode === srcCodeNum) match = true;
    }
    if (!match) { rejectStats.tickerMismatch++; return false; }
    
    var adStr = _caResolveDate(m);
    var ad = String(adStr || "").replace(/-/g, "");
    if (!ad) { rejectStats.noDate++; return false; }
    if (ad === curDateNum) { rejectStats.sameDate++; return false; }
    if (ad > curDateNum) { rejectStats.futureDate++; return false; }
    return true;
  });
  if (!candidates.length) {
    try {
      console.log("[caFindPrev] cur=" + curDate + " ticker=" + caTicker + "/" + codeStr
        + " srcCodeNum=" + srcCodeNum + " NO_CANDIDATES"
        + " (totalMeta=" + metaList.length
        + " rejected: tickerMismatch=" + rejectStats.tickerMismatch
        + " noDate=" + rejectStats.noDate
        + " sameDate=" + rejectStats.sameDate
        + " futureDate=" + rejectStats.futureDate + ")");
    } catch(_){}
    return null;
  }
  
  candidates.sort(function(a, b) {
    var aa = String(_caResolveDate(a) || "").replace(/-/g, "");
    var bb = String(_caResolveDate(b) || "").replace(/-/g, "");
    if (aa !== bb) return bb.localeCompare(aa);
    return (b.savedAt || 0) - (a.savedAt || 0);
  });
  try {
    console.log("[caFindPrev] cur=" + curDate + " ticker=" + caTicker + "/" + codeStr
      + " candidates=" + candidates.length
      + " top3=" + candidates.slice(0,3).map(function(m){ return _caResolveDate(m) + "(" + (m.id||"").slice(0,8) + ")"; }).join(","));
  } catch(_){}
  return candidates[0];
}



function _businessDaysBetween(a, b) {
  if (!a || !b) return Infinity;
  var da = new Date(a + "T00:00:00");
  var db = new Date(b + "T00:00:00");
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return Infinity;
  var forward = da < db;
  if (!forward) { var t = da; da = db; db = t; }
  var count = 0;
  var cur = new Date(da);
  while (cur < db) {
    cur.setDate(cur.getDate() + 1);
    var dow = cur.getDay(); 
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}








var _MACRO_LOCAL_RANGES = [
  { tag: "激強",   min: 5 },
  { tag: "強",     min: 3,  max: 5 },
  { tag: "やや強", min: 1,  max: 3 },
  { tag: "普通",   min: -1, max: 1 },
  { tag: "やや弱", min: -3, max: -1 },
  { tag: "弱",     min: -5, max: -3 },
  { tag: "激弱",                max: -5 }
];
function _macroLocalFromPct(pct) {
  if (pct == null || isNaN(pct)) return "";
  for (var i = 0; i < _MACRO_LOCAL_RANGES.length; i++) {
    var r = _MACRO_LOCAL_RANGES[i];
    var inMin = (r.min == null) || (pct >= r.min);
    var inMax = (r.max == null) || (pct < r.max);
    if (inMin && inMax) return r.tag;
  }
  return "";
}

function _macroLastClose(bars) {
  if (!bars || !bars.length) return null;
  for (var i = bars.length - 1; i >= 0; i--) {
    var b = bars[i];
    if (b == null) continue;
    var v = null;
    if (typeof b.c === "number") v = b.c;
    else if (typeof b.close === "number") v = b.close;
    else if (typeof b[4] === "number") v = b[4]; 
    if (v != null && !isNaN(v) && v > 0) return v;
  }
  return null;
}



function _macroLocalDetectFromCa(cfg, stock, date, custom) {
  if (!cfg || !cfg.fbUrl || !stock || !date) return Promise.resolve({ reason: "config" });
  var info = _caGetStockInfo(stock, custom);
  if (!info.caTicker && !info.code) return Promise.resolve({ reason: "no-ticker" });
  return _caFetchMeta(cfg, false).then(function(allMeta) {
    var todayList = _caFilterByStockDate(allMeta, info.caTicker, date, info.code);
    if (!todayList.length) return { reason: "no-today" };
    var curMeta = todayList[0];
    var prevMeta = _caFindPrevDraftMeta(allMeta, info.caTicker, date, info.code);
    if (!prevMeta) return { reason: "no-prev" };
    var curDate = _caResolveDate(curMeta) || date;
    var prevDate = _caResolveDate(prevMeta) || "";
    
    var bd = _businessDaysBetween(prevDate, curDate);
    if (bd > 7) {
      try { console.warn("[macroLocal] prev draft is " + bd + " business days old (prevDate=" + prevDate + " curDate=" + curDate + "). Skipping auto-detect."); } catch(_){}
      return { reason: "prev-too-old", curDate: curDate, prevDate: prevDate, businessDays: bd };
    }
    try {
      console.log("[macroLocal] stock=" + stock + " ticker=" + info.caTicker + "/" + info.code
        + " curDate=" + curDate + " prevDate=" + prevDate + " bdDiff=" + bd
        + " curId=" + curMeta.id + " prevId=" + prevMeta.id);
    } catch(_){}
    return Promise.all([
      _caFetchDraftData(cfg, curMeta.id),
      _caFetchDraftData(cfg, prevMeta.id)
    ]).then(function(results) {
      var curD = results[0] && results[0].analysisData;
      var prevD = results[1] && results[1].analysisData;
      var curBars = curD && curD.bars_1m;
      var prevBars = prevD && prevD.bars_1m;
      var curClose = _macroLastClose(curBars);
      var prevClose = _macroLastClose(prevBars);
      try {
        console.log("[macroLocal] curBars=" + (curBars ? curBars.length : 0)
          + " prevBars=" + (prevBars ? prevBars.length : 0)
          + " curClose=" + curClose + " prevClose=" + prevClose);
      } catch(_){}
      if (curClose == null) return { reason: "no-cur-bars", curDate: curDate, prevDate: prevDate };
      if (prevClose == null || prevClose === 0) return { reason: "no-prev-bars", curDate: curDate, prevDate: prevDate };
      var pct = (curClose - prevClose) / prevClose * 100;
      var tag = _macroLocalFromPct(pct);
      try {
        console.log("[macroLocal] RESULT pct=" + pct.toFixed(3) + "% tag=" + tag);
      } catch(_){}
      return { tag: tag, pct: pct, curClose: curClose, prevClose: prevClose, curDate: curDate, prevDate: prevDate };
    });
  }).catch(function(e) {
    console.warn("[macroLocal] detect failed:", e);
    return { reason: "fetch-error" };
  });
}










function _simResample(bars, n) {
  if (!bars || !bars.length || n <= 0) return null;
  var m = bars.length;
  var prices = new Array(n);
  var ema9Above = new Array(n);
  var vwapAbove = new Array(n);
  var mn = Infinity, mx = -Infinity;
  
  for (var i = 0; i < m; i++) {
    if (bars[i].l < mn) mn = bars[i].l;
    if (bars[i].h > mx) mx = bars[i].h;
  }
  var range = mx - mn;
  if (range <= 0) return null;
  
  for (var j = 0; j < n; j++) {
    var idx = Math.min(m - 1, Math.round((j / (n - 1)) * (m - 1)));
    var b = bars[idx] || bars[m - 1];
    prices[j] = (b.c - mn) / range;
    ema9Above[j] = (b.ema9 != null && b.c >= b.ema9) ? 1 : 0;
    vwapAbove[j] = (b.vwap != null && b.c >= b.vwap) ? 1 : 0;
  }
  return { prices: prices, ema9Above: ema9Above, vwapAbove: vwapAbove };
}




function _simComputeFeatures(analysisData, refData) {
  if (!analysisData || !analysisData.bars_1m || analysisData.bars_1m.length < 10) return null;
  var bars = analysisData.bars_1m;
  var open = bars[0].o;
  var close = bars[bars.length - 1].c;
  var high = -Infinity, low = Infinity;
  for (var i = 0; i < bars.length; i++) {
    if (bars[i].h > high) high = bars[i].h;
    if (bars[i].l < low) low = bars[i].l;
  }
  var rangePct = open > 0 ? ((high - low) / open) * 100 : 0;
  var closePct = open > 0 ? ((close - open) / open) * 100 : 0;
  var openPct = null;
  if (refData && refData.bars_1m && refData.bars_1m.length) {
    var prevClose = refData.bars_1m[refData.bars_1m.length - 1].c;
    if (prevClose > 0) openPct = ((open - prevClose) / prevClose) * 100;
  }
  var resamp = _simResample(bars, 60);
  if (!resamp) return null;
  return {
    openPct: openPct,
    closePct: closePct,
    rangePct: rangePct,
    prices: resamp.prices,
    ema9Above: resamp.ema9Above,
    vwapAbove: resamp.vwapAbove,
    date: analysisData.date || "",
    ticker: analysisData.ticker || ""
  };
}


function _simCosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  var dot = 0, na = 0, nb = 0;
  for (var i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na <= 0 || nb <= 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}


function _simHammingMatch(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  var match = 0;
  for (var i = 0; i < a.length; i++) { if (a[i] === b[i]) match++; }
  return match / a.length;
}



function _simScoreDetail(f1, f2) {
  if (!f1 || !f2) return { total: 0, openScore: 0, shapeScore: 0, posScore: 0 };
  
  var openScore = 0.5; 
  if (f1.openPct != null && f2.openPct != null) {
    var diff = Math.abs(f1.openPct - f2.openPct);
    openScore = Math.max(0, 1 - diff / 5);
  }
  
  var p1 = f1.prices, p2 = f2.prices;
  var m1 = 0, m2 = 0;
  for (var i = 0; i < p1.length; i++) { m1 += p1[i]; m2 += p2[i]; }
  m1 /= p1.length; m2 /= p2.length;
  var c1 = p1.map(function(x){ return x - m1; });
  var c2 = p2.map(function(x){ return x - m2; });
  var shapeScore = Math.max(0, (_simCosine(c1, c2) + 1) / 2); 
  
  var emaScore = _simHammingMatch(f1.ema9Above, f2.ema9Above);
  var vwapScore = _simHammingMatch(f1.vwapAbove, f2.vwapAbove);
  var posScore = (emaScore + vwapScore) / 2;
  var total = openScore * 0.3 + shapeScore * 0.5 + posScore * 0.2;
  return { total: total, openScore: openScore, shapeScore: shapeScore, posScore: posScore };
}


function _simScore(f1, f2) {
  return _simScoreDetail(f1, f2).total;
}



var _simFeatureMemCache = {}; 
var _simBulkFeaturesLoaded = false;   
var _simBulkFeaturesPromise = null;   

function _simLoadFeature(cfg, draftId) {
  if (_simFeatureMemCache[draftId]) return Promise.resolve(_simFeatureMemCache[draftId]);
  if (!cfg || !cfg.fbUrl) return Promise.resolve(null);
  
  var idbKey = "cafeat_" + draftId;
  return snIdbGet(idbKey).then(function(cachedIdb) {
    if (cachedIdb && cachedIdb.data) {
      _simFeatureMemCache[draftId] = cachedIdb.data;
      return cachedIdb.data;
    }
    
    var base = cfg.fbUrl.replace(/\/$/, "") + "/chart-annotator-drafts-features";
    var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
    return fetch(base + "/" + encodeURIComponent(draftId) + ".json" + auth)
      .then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function(j) {
        if (j) {
          _simFeatureMemCache[draftId] = j;
          try { snIdbSet(idbKey, { data: j, at: Date.now() }); } catch(_){}
        }
        return j;
      })
      .catch(function() { return null; });
  }).catch(function() {
    
    var base2 = cfg.fbUrl.replace(/\/$/, "") + "/chart-annotator-drafts-features";
    var auth2 = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
    return fetch(base2 + "/" + encodeURIComponent(draftId) + ".json" + auth2)
      .then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function(j) { if (j) _simFeatureMemCache[draftId] = j; return j; })
      .catch(function() { return null; });
  });
}

function _simSaveFeature(cfg, draftId, featObj) {
  if (!cfg || !cfg.fbUrl) return Promise.resolve(false);
  var base = cfg.fbUrl.replace(/\/$/, "") + "/chart-annotator-drafts-features";
  var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
  // 同一draftの cafeat_ レコードは f / events / patterns を3関数(_sim/_evt/_pat Ensure)が共有する。
  // 古いスナップショットから書き戻すと並行writerが入れた相手フィールドを消すため、
  // 直近memcacheにマージしてから保存して取りこぼしを防ぐ。2026-06-20
  featObj = Object.assign({}, _simFeatureMemCache[draftId] || {}, featObj);
  _simFeatureMemCache[draftId] = featObj;

  try { snIdbSet("cafeat_" + draftId, { data: featObj, at: Date.now() }); } catch(_){}
  return fetch(base + "/" + encodeURIComponent(draftId) + ".json" + auth, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(featObj)
  }).then(function(r){ return r.ok; }).catch(function(){ return false; });
}




function _simBulkLoadAllFeatures(cfg) {
  if (_simBulkFeaturesLoaded) return Promise.resolve();
  if (_simBulkFeaturesPromise) return _simBulkFeaturesPromise;
  if (!cfg || !cfg.fbUrl) return Promise.resolve();
  var base = cfg.fbUrl.replace(/\/$/, "") + "/chart-annotator-drafts-features";
  var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
  _simBulkFeaturesPromise = fetch(base + ".json" + auth)
    .then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function(j) {
      if (j && typeof j === "object") {
        Object.keys(j).forEach(function(id) {
          if (j[id] && !_simFeatureMemCache[id]) {
            _simFeatureMemCache[id] = j[id];
            try { snIdbSet("cafeat_" + id, { data: j[id], at: Date.now() }); } catch(_){}
          }
        });
        console.log("[sim] bulk loaded features count=" + Object.keys(j).length);
      }
      _simBulkFeaturesLoaded = true;
      _simBulkFeaturesPromise = null;
    })
    .catch(function(e) {
      console.warn("[sim] bulk load failed, falling back to individual fetch:", e);
      _simBulkFeaturesPromise = null;
    });
  return _simBulkFeaturesPromise;
}




function _simEnsureFeature(cfg, meta, allMetaById) {
  var draftId = meta.id;
  var savedAt = meta.savedAt || 0;
  return _simLoadFeature(cfg, draftId).then(function(cached) {
    if (cached && cached.savedAt === savedAt && cached.f) {
      return cached.f;
    }
    return _caFetchDraftData(cfg, draftId).then(function(dd) {
      if (!dd || !dd.analysisData) return null;
      
      var prevMeta = _caFindPrevDraftMeta(allMetaById, meta.ticker || "", meta.analysisDate || "", "");
      var prevPromise = prevMeta ? _caFetchDraftData(cfg, prevMeta.id) : Promise.resolve(null);
      return prevPromise.then(function(prevDd) {
        var prevAnalysis = prevDd && prevDd.analysisData;
        var features = _simComputeFeatures(dd.analysisData, prevAnalysis);
        if (!features) return null;
        var obj = Object.assign({}, cached || { savedAt: savedAt }, { f: features, savedAt: savedAt });
        _simSaveFeature(cfg, draftId, obj);
        return features;
      });
    });
  });
}








var _EVT_ROUND_GRIDS = [50, 100, 1000];



function _evtDetectIndicatorCrosses(bars, indKey, eventPrefix) {
  if (!bars || bars.length < 2) return [];
  var out = [];
  for (var i = 1; i < bars.length; i++) {
    var p = bars[i-1], c = bars[i];
    var pv = p[indKey], cv = c[indKey];
    if (pv == null || cv == null) continue;
    
    var prevAbove = p.c >= pv;
    var curAbove = c.c >= cv;
    if (prevAbove && !curAbove) {
      out.push({ type: eventPrefix + "_cross_down", t: c.t, idx: i, price: c.c, prev_price: p.c, indicator: cv });
    } else if (!prevAbove && curAbove) {
      out.push({ type: eventPrefix + "_cross_up", t: c.t, idx: i, price: c.c, prev_price: p.c, indicator: cv });
    }
  }
  return out;
}



function _evtDetectRoundNumberCrosses(bars) {
  if (!bars || bars.length < 2) return [];
  var out = [];
  for (var i = 1; i < bars.length; i++) {
    var p = bars[i-1], c = bars[i];
    _EVT_ROUND_GRIDS.forEach(function(g) {
      
      var pf = Math.floor(p.c / g);
      var cf = Math.floor(c.c / g);
      if (pf < cf) {
        
        var round = (pf + 1) * g;
        out.push({ type: "round_cross_up", t: c.t, idx: i, price: c.c, round: round, grid: g });
      } else if (pf > cf) {
        var roundD = pf * g;
        out.push({ type: "round_cross_down", t: c.t, idx: i, price: c.c, round: roundD, grid: g });
      }
    });
  }
  return out;
}


function _evtDetectHighLowUpdates(bars) {
  if (!bars || bars.length < 1) return [];
  var out = [];
  var curH = bars[0].h, curL = bars[0].l;
  out.push({ type: "day_high_update", t: bars[0].t, idx: 0, price: curH });
  out.push({ type: "day_low_update", t: bars[0].t, idx: 0, price: curL });
  for (var i = 1; i < bars.length; i++) {
    if (bars[i].h > curH) {
      curH = bars[i].h;
      out.push({ type: "day_high_update", t: bars[i].t, idx: i, price: curH });
    }
    if (bars[i].l < curL) {
      curL = bars[i].l;
      out.push({ type: "day_low_update", t: bars[i].t, idx: i, price: curL });
    }
  }
  return out;
}


function _evtDetectVolumeSpikes(bars) {
  if (!bars || bars.length < 21) return [];
  var out = [];
  var SPIKE_RATIO = 2.0;
  var WIN = 20;
  for (var i = WIN; i < bars.length; i++) {
    var sum = 0;
    for (var j = i - WIN; j < i; j++) sum += (bars[j].v || 0);
    var avg = sum / WIN;
    if (avg > 0 && bars[i].v >= avg * SPIKE_RATIO) {
      out.push({ type: "volume_spike", t: bars[i].t, idx: i, price: bars[i].c, vol: bars[i].v, avg: avg });
    }
  }
  return out;
}


function _evtDetectConsecutiveCandles(bars) {
  if (!bars || bars.length < 3) return [];
  var out = [];
  var MIN_STREAK = 3;
  var streak = 0, streakUp = null;
  for (var i = 0; i < bars.length; i++) {
    var b = bars[i];
    var up = b.c >= b.o;
    if (streakUp === null || up === streakUp) {
      streakUp = up;
      streak++;
    } else {
      if (streak >= MIN_STREAK) {
        out.push({
          type: streakUp ? "consecutive_up" : "consecutive_down",
          t: bars[i-streak].t, idx: i - streak, end_idx: i - 1,
          len: streak,
          price: bars[i-1].c
        });
      }
      streakUp = up;
      streak = 1;
    }
  }
  
  if (streak >= MIN_STREAK) {
    out.push({
      type: streakUp ? "consecutive_up" : "consecutive_down",
      t: bars[bars.length - streak].t, idx: bars.length - streak, end_idx: bars.length - 1,
      len: streak,
      price: bars[bars.length - 1].c
    });
  }
  return out;
}


function _evtDetectOpenType(bars, refBars) {
  if (!bars || !bars.length) return [];
  var open = bars[0].o;
  if (!refBars || !refBars.length) {
    return [{ type: "open_no_prev", t: bars[0].t, idx: 0, price: open }];
  }
  var prevClose = refBars[refBars.length - 1].c;
  if (prevClose <= 0) return [];
  var pct = ((open - prevClose) / prevClose) * 100;
  var kind;
  if (pct >= 5) kind = "open_major_gu";
  else if (pct >= 3) kind = "open_medium_gu";
  else if (pct >= 1) kind = "open_minor_gu";
  else if (pct > -1) kind = "open_flat";
  else if (pct > -3) kind = "open_minor_gd";
  else if (pct > -5) kind = "open_medium_gd";
  else kind = "open_major_gd";
  return [{ type: kind, t: bars[0].t, idx: 0, price: open, prev_close: prevClose, pct: pct }];
}



function _evtDetectAll(analysisData, refData) {
  if (!analysisData || !analysisData.bars_1m || !analysisData.bars_1m.length) return [];
  var bars = analysisData.bars_1m;
  var refBars = refData && refData.bars_1m ? refData.bars_1m : null;
  var all = [];
  
  all = all.concat(_evtDetectIndicatorCrosses(bars, "ema9",   "ema9"));
  all = all.concat(_evtDetectIndicatorCrosses(bars, "ema22",  "ema22"));
  all = all.concat(_evtDetectIndicatorCrosses(bars, "ema50",  "ema50"));
  all = all.concat(_evtDetectIndicatorCrosses(bars, "ema200", "ema200"));
  
  all = all.concat(_evtDetectIndicatorCrosses(bars, "vwap", "vwap"));
  
  all = all.concat(_evtDetectRoundNumberCrosses(bars));
  
  all = all.concat(_evtDetectHighLowUpdates(bars));
  
  all = all.concat(_evtDetectVolumeSpikes(bars));
  
  all = all.concat(_evtDetectConsecutiveCandles(bars));
  
  all = all.concat(_evtDetectOpenType(bars, refBars));
  
  all.sort(function(a, b) {
    var ai = a.idx != null ? a.idx : 0;
    var bi = b.idx != null ? b.idx : 0;
    return ai - bi;
  });
  return all;
}














function _patDetectBreakdownReject(bars, indKey, indLabel) {
  if (!bars || bars.length < 4) return [];
  var out = [];
  for (var N = 1; N < bars.length - 2; N++) {
    var prev = bars[N - 1], cur = bars[N];
    var prevInd = prev[indKey], curInd = cur[indKey];
    if (prevInd == null || curInd == null) continue;
    
    if (!(prev.c >= prevInd && cur.c < curInd)) continue;
    
    for (var offs = 1; offs <= 2; offs++) {
      var ridx = N + offs;
      if (ridx >= bars.length - 1) break; 
      var rbar = bars[ridx];
      var rind = rbar[indKey];
      if (rind == null) continue;
      
      if (rbar.h <= rind) continue;
      
      if (rbar.c >= rind) continue;
      
      var conf = bars[ridx + 1];
      if (conf.c >= conf.o) continue;
      
      out.push({
        type: "pattern_breakdown_reject",
        indicator: indLabel,
        break_idx: N, break_t: cur.t, price_at_break: cur.c,
        reject_idx: ridx, reject_t: rbar.t,
        confirm_idx: ridx + 1, confirm_t: conf.t, price_at_confirm: conf.c
      });
      break; 
    }
  }
  return out;
}


function _patDetectAll(analysisData) {
  if (!analysisData || !analysisData.bars_1m || !analysisData.bars_1m.length) return [];
  var bars = analysisData.bars_1m;
  var all = [];
  
  all = all.concat(_patDetectBreakdownReject(bars, "ema9",   "ema9"));
  all = all.concat(_patDetectBreakdownReject(bars, "ema22",  "ema22"));
  all = all.concat(_patDetectBreakdownReject(bars, "ema50",  "ema50"));
  all = all.concat(_patDetectBreakdownReject(bars, "ema200", "ema200"));
  all = all.concat(_patDetectBreakdownReject(bars, "vwap",   "vwap"));
  
  all.sort(function(a, b) {
    var ai = a.break_idx != null ? a.break_idx : 0;
    var bi = b.break_idx != null ? b.break_idx : 0;
    return ai - bi;
  });
  return all;
}







function _evtEnsureEvents(cfg, meta, allMetaById) {
  var draftId = meta.id;
  var savedAt = meta.savedAt || 0;
  return _simLoadFeature(cfg, draftId).then(function(cached) {
    if (cached && cached.savedAt === savedAt && cached.events) {
      return cached.events;
    }
    return _caFetchDraftData(cfg, draftId).then(function(dd) {
      if (!dd || !dd.analysisData) return null;
      var prevMeta = _caFindPrevDraftMeta(allMetaById, meta.ticker || "", meta.analysisDate || "", "");
      var prevPromise = prevMeta ? _caFetchDraftData(cfg, prevMeta.id) : Promise.resolve(null);
      return prevPromise.then(function(prevDd) {
        var prevAnalysis = prevDd && prevDd.analysisData;
        var events = _evtDetectAll(dd.analysisData, prevAnalysis);
        
        var baseObj = cached || { savedAt: savedAt };
        var obj = Object.assign({}, baseObj, { events: events, savedAt: savedAt });
        _simSaveFeature(cfg, draftId, obj); 
        return events;
      });
    });
  });
}


function _patEnsurePatterns(cfg, meta) {
  var draftId = meta.id;
  var savedAt = meta.savedAt || 0;
  return _simLoadFeature(cfg, draftId).then(function(cached) {
    if (cached && cached.savedAt === savedAt && cached.patterns) {
      return cached.patterns;
    }
    return _caFetchDraftData(cfg, draftId).then(function(dd) {
      if (!dd || !dd.analysisData) return null;
      var patterns = _patDetectAll(dd.analysisData);
      var baseObj = cached || { savedAt: savedAt };
      var obj = Object.assign({}, baseObj, { patterns: patterns, savedAt: savedAt });
      _simSaveFeature(cfg, draftId, obj); 
      return patterns;
    });
  });
}


(function(){
  if (typeof window !== "undefined") {
    window._caDebugEvents = function(draftId) {
      
      var cfg = window._snCfg;
      if (!cfg || !cfg.fbUrl) {
        console.error("[evt debug] cfg が未設定です");
        return;
      }
      _caFetchMeta(cfg, false).then(function(allMeta) {
        var meta = null;
        for (var i = 0; i < allMeta.length; i++) {
          if (allMeta[i].id === draftId) { meta = allMeta[i]; break; }
        }
        if (!meta) { console.error("[evt debug] draft が見つかりません:", draftId); return; }
        return _evtEnsureEvents(cfg, meta, allMeta).then(function(events) {
          console.log("[evt debug] draft:", draftId, "(" + meta.name + ")");
          console.log("[evt debug] events count:", events ? events.length : 0);
          console.table(events);
          return events;
        });
      }).catch(function(e) {
        console.error("[evt debug] error:", e);
      });
    };
    
    window._caDebugPatterns = function(draftId) {
      var cfg = window._snCfg;
      if (!cfg || !cfg.fbUrl) {
        console.error("[pat debug] cfg が未設定です");
        return;
      }
      _caFetchMeta(cfg, false).then(function(allMeta) {
        var meta = null;
        for (var i = 0; i < allMeta.length; i++) {
          if (allMeta[i].id === draftId) { meta = allMeta[i]; break; }
        }
        if (!meta) { console.error("[pat debug] draft が見つかりません:", draftId); return; }
        return _patEnsurePatterns(cfg, meta).then(function(patterns) {
          console.log("[pat debug] draft:", draftId, "(" + meta.name + ")");
          console.log("[pat debug] patterns count:", patterns ? patterns.length : 0);
          console.table(patterns);
          return patterns;
        });
      }).catch(function(e) {
        console.error("[pat debug] error:", e);
      });
    };
  }
})();







var PATTERN_DEFS = [
  {
    id: "breakdown_reject",
    label: "底支え指標線下抜け→復帰否定→下落",
    description: "指標線(EMA/VWAP)を下抜け後、2本以内に復帰試行するも終値で戻れず次足が陰線"
  }
  
];

function PatternSearchDialog(_ref_psd) {
  var cfg = _ref_psd.cfg,
    custom = _ref_psd.custom,
    onClose = _ref_psd.onClose,
    onJumpDate = _ref_psd.onJumpDate;
  var _uPh = useState("picker"), _uPhS = _slicedToArray(_uPh, 2),
    phase = _uPhS[0], setPhase = _uPhS[1];
  var allStocksRaw = (custom && custom.stocks && custom.stocks.length > 0)
    ? custom.stocks : _DEF_STOCKS_FROZEN;
  
  var allStocks = allStocksRaw.filter(function(s){ return s !== "日経平均株価"; });
  
  var _uSS = useState(function() {
    try {
      var sv = JSON.parse(localStorage.getItem("sn_pattern_stocks") || "null");
      if (sv && Array.isArray(sv)) return sv.filter(function(s){ return allStocks.indexOf(s) !== -1; });
    } catch(e){}
    return allStocks.slice();
  });
  var selStocks = _uSS[0], setSelStocks = _uSS[1];
  useEffect(function(){
    try { localStorage.setItem("sn_pattern_stocks", JSON.stringify(selStocks)); } catch(e){}
  }, [selStocks]);
  
  var _uSP = useState(function() {
    try {
      var sv = JSON.parse(localStorage.getItem("sn_pattern_sel") || "null");
      if (sv && Array.isArray(sv)) return sv;
    } catch(e){}
    return PATTERN_DEFS.map(function(p){ return p.id; });
  });
  var selPatterns = _uSP[0], setSelPatterns = _uSP[1];
  useEffect(function(){
    try { localStorage.setItem("sn_pattern_sel", JSON.stringify(selPatterns)); } catch(e){}
  }, [selPatterns]);
  var _uPr = useState({ done: 0, total: 0 }), _uPrS = _slicedToArray(_uPr, 2),
    progress = _uPrS[0], setProgress = _uPrS[1];
  var _uRes = useState([]), _uResS = _slicedToArray(_uRes, 2),
    results = _uResS[0], setResults = _uResS[1];
  var _uErr = useState(null), _uErrS = _slicedToArray(_uErr, 2),
    err = _uErrS[0], setErr = _uErrS[1];
  useModalBack(true, onClose, "pat-search");
  var toggleStock = function(s) {
    setSelStocks(function(cur) {
      if (cur.indexOf(s) !== -1) return cur.filter(function(x){ return x !== s; });
      return cur.concat([s]);
    });
  };
  var togglePattern = function(pid) {
    setSelPatterns(function(cur) {
      if (cur.indexOf(pid) !== -1) return cur.filter(function(x){ return x !== pid; });
      return cur.concat([pid]);
    });
  };
  var selectAllStocks = function(){ setSelStocks(allStocks.slice()); };
  var selectNoneStocks = function(){ setSelStocks([]); };
  var runSearch = function() {
    if (!cfg || !cfg.fbUrl) { setErr(new Error("Firebase未設定")); setPhase("result"); return; }
    if (selPatterns.length === 0) { setErr(new Error("パターンを1つ以上選択してください")); setPhase("result"); return; }
    setPhase("searching");
    setProgress({ done: 0, total: 0 });
    _caFetchMeta(cfg, false).then(function(allMeta) {
      
      var stockInfoMap = {};
      selStocks.forEach(function(s){ stockInfoMap[s] = _caGetStockInfo(s, custom); });
      var matchStock = function(m) {
        for (var k in stockInfoMap) {
          var info = stockInfoMap[k];
          var codeStr = info.code ? String(info.code) : "";
          var caT = info.caTicker || "";
          if (caT && m.ticker === caT) return k;
          if (caT && m.name && String(m.name).indexOf(caT) >= 0) return k;
          if (codeStr && m.name && String(m.name).indexOf(codeStr) >= 0) return k;
          if (codeStr && m.ticker && String(m.ticker).indexOf(codeStr) >= 0) return k;
        }
        return null;
      };
      var targets = [];
      allMeta.forEach(function(m) {
        var s = matchStock(m);
        if (s) { m._matchedStock = s; targets.push(m); }
      });
      setProgress({ done: 0, total: targets.length });
      
      var CONC = 4;
      var hits = [];
      var idx = 0;
      function worker() {
        if (idx >= targets.length) return Promise.resolve();
        var my = idx++;
        var m = targets[my];
        return _patEnsurePatterns(cfg, m).then(function(patterns) {
          if (patterns && patterns.length) {
            
            var filtered = patterns.filter(function(p) {
              
              var pid = String(p.type || "").replace(/^pattern_/, "");
              return selPatterns.indexOf(pid) !== -1;
            });
            if (filtered.length) {
              hits.push({ meta: m, patterns: filtered });
            }
          }
          setProgress(function(p){ return { done: p.done + 1, total: p.total }; });
          return worker();
        }).catch(function() {
          setProgress(function(p){ return { done: p.done + 1, total: p.total }; });
          return worker();
        });
      }
      var workers = [];
      for (var w = 0; w < CONC; w++) workers.push(worker());
      return Promise.all(workers).then(function() {
        
        hits.sort(function(a, b) {
          var aa = String(a.meta.analysisDate || "").replace(/-/g, "");
          var bb = String(b.meta.analysisDate || "").replace(/-/g, "");
          if (aa !== bb) return bb.localeCompare(aa);
          return (b.meta.savedAt || 0) - (a.meta.savedAt || 0);
        });
        return hits;
      });
    }).then(function(hits) {
      setResults(hits);
      setPhase("result");
    }).catch(function(e) {
      console.warn("[pat] failed:", e);
      setErr(e);
      setPhase("result");
    });
  };
  var backdropStyle = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16
  };
  var panelStyle = {
    background: "#fff", borderRadius: 12, padding: 20,
    maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto"
  };
  return React.createElement("div", {
    onClick: function(){ onClose && onClose(); },
    style: backdropStyle
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: panelStyle
  },
    phase === "picker" && React.createElement("div", null,
      React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 6 } }, "\uD83E\uDDE9 \u30D1\u30BF\u30FC\u30F3\u691C\u7D22"),
      React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 12, lineHeight: 1.6 } },
        "\u691C\u7D22\u3057\u305F\u3044\u30D1\u30BF\u30FC\u30F3\u3068\u6BD4\u8F03\u5BFE\u8C61\u306E\u9298\u67C4\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002"
      ),
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 8 } }, "\u30D1\u30BF\u30FC\u30F3"),
      React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }
      },
        PATTERN_DEFS.map(function(p) {
          var on = selPatterns.indexOf(p.id) !== -1;
          return React.createElement("label", {
            key: p.id,
            style: {
              display: "flex", alignItems: "flex-start", gap: 8,
              padding: "10px 12px", background: on ? "#FFF7ED" : "#f5f4f0",
              border: on ? "1.5px solid #FDBA74" : "1px solid #e0ddd6",
              borderRadius: 7, cursor: "pointer",
              userSelect: "none"
            }
          },
            React.createElement("input", {
              type: "checkbox", checked: on, onChange: function(){ togglePattern(p.id); },
              style: { cursor: "pointer", marginTop: 2 }
            }),
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: on ? "#C2410C" : "#333" } }, p.label),
              React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 2, lineHeight: 1.5 } }, p.description)
            )
          );
        })
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } },
        React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#444", flex: 1 } }, "\u5BFE\u8C61\u9298\u67C4"),
        React.createElement("button", {
          onClick: selectAllStocks,
          style: { padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", borderRadius: 5, cursor: "pointer" }
        }, "\u3059\u3079\u3066\u9078\u629E"),
        React.createElement("button", {
          onClick: selectNoneStocks,
          style: { padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "#fff", color: "#888", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer" }
        }, "\u3059\u3079\u3066\u89E3\u9664")
      ),
      React.createElement("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6, marginBottom: 16 }
      },
        allStocks.map(function(s) {
          var on = selStocks.indexOf(s) !== -1;
          return React.createElement("label", {
            key: s,
            style: {
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px", background: on ? "#EEF2FF" : "#f5f4f0",
              border: on ? "1.5px solid #6366F1" : "1px solid #e0ddd6",
              borderRadius: 6, cursor: "pointer", fontSize: 13,
              fontWeight: on ? 600 : 500, color: on ? "#4F46E5" : "#555",
              userSelect: "none"
            }
          },
            React.createElement("input", {
              type: "checkbox", checked: on, onChange: function(){ toggleStock(s); },
              style: { cursor: "pointer" }
            }),
            React.createElement("span", {
              style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
            }, s)
          );
        })
      ),
      React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } },
        React.createElement("button", {
          onClick: onClose,
          style: { padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 7, cursor: "pointer", minHeight: IS_TOUCH ? 40 : 32 }
        }, "\u30AD\u30E3\u30F3\u30BB\u30EB"),
        React.createElement("button", {
          onClick: runSearch,
          disabled: selStocks.length === 0 || selPatterns.length === 0,
          style: {
            padding: "8px 18px", fontSize: 13, fontWeight: 700,
            background: (selStocks.length === 0 || selPatterns.length === 0) ? "#ccc" : "#C2410C",
            color: "#fff", border: "none", borderRadius: 7,
            cursor: (selStocks.length === 0 || selPatterns.length === 0) ? "not-allowed" : "pointer",
            minHeight: IS_TOUCH ? 40 : 32
          }
        }, "\u691C\u7D22\u958B\u59CB")
      )
    ),
    phase === "searching" && React.createElement("div", { style: { padding: "40px 10px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 16, fontWeight: 700, marginBottom: 14 } }, "\u691C\u7D22\u4E2D..."),
      React.createElement("div", { style: { fontSize: 13, color: "#888", marginBottom: 10 } },
        progress.total > 0
          ? (progress.done + " / " + progress.total + " (" + Math.round(progress.done / progress.total * 100) + "%)")
          : "\u6E96\u5099\u4E2D..."
      ),
      progress.total > 0 && React.createElement("div", {
        style: { height: 8, background: "#f0eeea", borderRadius: 4, overflow: "hidden" }
      }, React.createElement("div", {
        style: { height: "100%", width: Math.round(progress.done / progress.total * 100) + "%", background: "#C2410C", transition: "width 0.2s" }
      }))
    ),
    phase === "result" && React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" } },
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700, flex: 1 } }, "\uD83E\uDDE9 \u691C\u7D22\u7D50\u679C (" + results.length + "\u4EF6)"),
        React.createElement("button", {
          onClick: function(){ setResults([]); setErr(null); setPhase("picker"); },
          style: { padding: "6px 12px", fontSize: 12, fontWeight: 600, background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }
        }, "\u26A1 \u6761\u4EF6\u3092\u5909\u66F4")
      ),
      err ? React.createElement("div", { style: { padding: 20, color: "#C0392B", fontSize: 13 } },
        "\u30A8\u30E9\u30FC: " + (err.message || String(err))
      ) : results.length === 0 ? React.createElement("div", { style: { padding: 20, color: "#888", fontSize: 13, textAlign: "center" } },
        "\u30D1\u30BF\u30FC\u30F3\u306B\u4E00\u81F4\u3059\u308B\u30C1\u30E3\u30FC\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F"
      ) : React.createElement("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }
      },
        results.map(function(r) {
          var m = r.meta;
          var draftId = m.id;
          var info = m._matchedStock ? _caGetStockInfo(m._matchedStock, custom) : null;
          
          var typeCount = {};
          r.patterns.forEach(function(p) {
            var key = String(p.type || "").replace(/^pattern_/, "");
            if (!typeCount[key]) typeCount[key] = [];
            typeCount[key].push(p);
          });
          return React.createElement("div", {
            key: m.id,
            style: { background: "#fff", border: "1px solid #e0ddd6", borderRadius: 8, overflow: "hidden" }
          },
            React.createElement("div", {
              style: { padding: "6px 10px", background: "#f8f7f4", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 6 }
            },
              React.createElement("span", { style: { fontSize: 11, color: "#444", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                (m._matchedStock || "?") + " \u00B7 " + (_caResolveDate(m) || "?")
              ),
              React.createElement("span", {
                style: { fontSize: 10, color: "#fff", background: "#C2410C", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }
              }, r.patterns.length + "\u4EF6")
            ),
            m.thumbUrl
              ? React.createElement(CaThumbImg, {
                  url: m.thumbUrl,
                  style: { width: "100%", display: "block", background: "#f5f4f0", objectFit: "contain", maxHeight: 140 }
                })
              : React.createElement("div", {
                  style: { width: "100%", height: 80, background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 12 }
                }, "(\u30B5\u30E0\u30CD\u306A\u3057)"),
            React.createElement("div", {
              style: { padding: "6px 10px", fontSize: 10, color: "#666", lineHeight: 1.5, borderTop: "1px solid #eee" }
            },
              Object.keys(typeCount).map(function(tk) {
                var pdef = null;
                for (var pi = 0; pi < PATTERN_DEFS.length; pi++) { if (PATTERN_DEFS[pi].id === tk) { pdef = PATTERN_DEFS[pi]; break; } }
                var lbl = pdef ? pdef.label : tk;
                var items = typeCount[tk];
                
                var info = items.map(function(p) {
                  return (p.indicator || "") + "@" + (p.break_t || "?");
                }).join(", ");
                return React.createElement("div", { key: tk, style: { marginBottom: 3 } },
                  React.createElement("span", { style: { fontWeight: 700, color: "#C2410C" } }, "\u25CF "),
                  React.createElement("span", { style: { fontWeight: 600 } }, lbl),
                  React.createElement("div", { style: { color: "#888", fontSize: 10, marginLeft: 12 } }, info)
                );
              })
            ),
            React.createElement("div", {
              style: { display: "flex", gap: 4, padding: 6, borderTop: "1px solid #eee" }
            },
              React.createElement("button", {
                onClick: function() {
                  var rd = _caResolveDate(m);
                  if (info && info.code && rd) {
                    _caOpen(info.code, rd, draftId);
                  } else {
                    alert("\u3053\u306E\u5206\u6790\u30C7\u30FC\u30BF\u306E\u65E5\u4ED8\u60C5\u5831\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
                  }
                },
                style: { flex: 1, padding: "6px 4px", fontSize: 10, fontWeight: 600,
                  background: "#EEF2FF", color: "#4F46E5",
                  border: "1px solid #C7D2FE", borderRadius: 5, cursor: "pointer" }
              }, "\u5206\u6790\u3092\u958B\u304F"),
              React.createElement("button", {
                onClick: function() {
                  var rd = _caResolveDate(m);
                  if (!rd) {
                    alert("\u3053\u306E\u5206\u6790\u30C7\u30FC\u30BF\u306E\u65E5\u4ED8\u60C5\u5831\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
                    return;
                  }
                  onJumpDate && onJumpDate(rd, m._matchedStock, "trades");
                  onClose && onClose();
                },
                style: { flex: 1, padding: "6px 4px", fontSize: 10, fontWeight: 600,
                  background: "#fff", color: "#555",
                  border: "1px solid #ccc", borderRadius: 5, cursor: "pointer" }
              }, "\u3053\u306E\u65E5\u306E\u8A18\u9332")
            )
          );
        })
      ),
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
        React.createElement("button", {
          onClick: onClose,
          style: { padding: "8px 18px", fontSize: 13, fontWeight: 600, background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 7, cursor: "pointer" }
        }, "\u9589\u3058\u308B")
      )
    )
  ));
}




function SimilarSearchDialog(_ref_ssd) {
  var cfg = _ref_ssd.cfg,
    custom = _ref_ssd.custom,
    originDraftId = _ref_ssd.originDraftId,
    originStock = _ref_ssd.originStock,
    originDate = _ref_ssd.originDate,
    onClose = _ref_ssd.onClose,
    onJumpDate = _ref_ssd.onJumpDate;
  
  var _uP = useState("picker"), _uPS = _slicedToArray(_uP, 2),
    phase = _uPS[0], setPhase = _uPS[1];
  var allStocksRaw = (custom && custom.stocks && custom.stocks.length > 0)
    ? custom.stocks : _DEF_STOCKS_FROZEN;
  
  var allStocks = allStocksRaw.filter(function(s){ return s !== "日経平均株価"; });
  
  var _uSS = useState(function() {
    if (originStock && originStock !== "日経平均株価" && allStocks.indexOf(originStock) !== -1) {
      return [originStock];
    }
    return allStocks.slice();
  });
  var selStocks = _uSS[0], setSelStocks = _uSS[1];
  var _uPr = useState({ done: 0, total: 0 }), _uPrS = _slicedToArray(_uPr, 2),
    progress = _uPrS[0], setProgress = _uPrS[1];
  var _uRes = useState([]), _uResS = _slicedToArray(_uRes, 2),
    results = _uResS[0], setResults = _uResS[1];
  var _uErr = useState(null), _uErrS = _slicedToArray(_uErr, 2),
    err = _uErrS[0], setErr = _uErrS[1];
  var _uOri = useState(null), _uOriS = _slicedToArray(_uOri, 2),
    originMetaState = _uOriS[0], setOriginMetaState = _uOriS[1];
  var _uSort = useState("score"), _uSortS = _slicedToArray(_uSort, 2),
    sortMode = _uSortS[0], setSortMode = _uSortS[1];
  useModalBack(true, onClose, "sim-search");
  var toggleStock = function(s) {
    setSelStocks(function(cur) {
      if (cur.indexOf(s) !== -1) return cur.filter(function(x){ return x !== s; });
      return cur.concat([s]);
    });
  };
  var selectAll = function() { setSelStocks(allStocks.slice()); };
  var selectNone = function() { setSelStocks([]); };
  var runSearch = function() {
    if (!cfg || !cfg.fbUrl) { setErr(new Error("Firebase未設定")); setPhase("result"); return; }
    if (!originDraftId) { setErr(new Error("起点のチャート分析データが見つかりません")); setPhase("result"); return; }
    setPhase("searching");
    setProgress({ done: 0, total: 0 });
    _caFetchMeta(cfg, false).then(function(allMeta) {
      
      var originMeta = null;
      for (var i = 0; i < allMeta.length; i++) {
        if (allMeta[i].id === originDraftId) { originMeta = allMeta[i]; break; }
      }
      if (!originMeta) { throw new Error("起点 draft が見つかりません: " + originDraftId); }
      setOriginMetaState(originMeta);
      
      
      var stockInfoMap = {};
      selStocks.forEach(function(s){ stockInfoMap[s] = _caGetStockInfo(s, custom); });
      var originDateNorm = String(originMeta.analysisDate || originDate || "").replace(/-/g, "");
      var isTargetMeta = function(m) {
        
        if (m.id === originDraftId) return false;
        
        var mad = String(m.analysisDate || "").replace(/-/g, "");
        
        var matchedStock = null;
        for (var k in stockInfoMap) {
          var info = stockInfoMap[k];
          var codeStr = info.code ? String(info.code) : "";
          var caT = info.caTicker || "";
          if (caT && m.ticker === caT) { matchedStock = k; break; }
          if (caT && m.name && String(m.name).indexOf(caT) >= 0) { matchedStock = k; break; }
          if (codeStr && m.name && String(m.name).indexOf(codeStr) >= 0) { matchedStock = k; break; }
          if (codeStr && m.ticker && String(m.ticker).indexOf(codeStr) >= 0) { matchedStock = k; break; }
        }
        if (!matchedStock) return false;
        
        if (mad && mad === originDateNorm && matchedStock === originStock) return false;
        m._matchedStock = matchedStock;
        return true;
      };
      var targets = allMeta.filter(isTargetMeta);
      setProgress({ done: 0, total: targets.length + 1 });
      
      return _simBulkLoadAllFeatures(cfg).then(function() {
      return _simEnsureFeature(cfg, originMeta, allMeta).then(function(originFeat) {
        if (!originFeat) throw new Error("起点の特徴量を計算できませんでした");
        setProgress(function(p){ return { done: 1, total: p.total }; });
        
        var CONC = 4;
        var scored = [];
        var idx = 0;
        function worker() {
          if (idx >= targets.length) return Promise.resolve();
          var my = idx++;
          var m = targets[my];
          return _simEnsureFeature(cfg, m, allMeta).then(function(feat) {
            if (feat) {
              var detail = _simScoreDetail(originFeat, feat);
              scored.push({ meta: m, feat: feat, score: detail.total, detail: detail });
            }
            setProgress(function(p){ return { done: p.done + 1, total: p.total }; });
            return worker();
          }).catch(function() {
            setProgress(function(p){ return { done: p.done + 1, total: p.total }; });
            return worker();
          });
        }
        var workers = [];
        for (var w = 0; w < CONC; w++) workers.push(worker());
        return Promise.all(workers).then(function() {
          scored.sort(function(a, b){ return b.score - a.score; });
          return scored.slice(0, 30); 
        });
      });
      }); 
    }).then(function(scored) {
      setResults(scored);
      setPhase("result");
    }).catch(function(e) {
      console.warn("[similar] failed:", e);
      setErr(e);
      setPhase("result");
    });
  };
  
  var displayed = (function() {
    var r = results.slice();
    if (sortMode === "date") {
      r.sort(function(a, b) {
        var aa = String(a.meta.analysisDate || "").replace(/-/g, "");
        var bb = String(b.meta.analysisDate || "").replace(/-/g, "");
        return bb.localeCompare(aa);
      });
    }
    return r.slice(0, 10);
  })();
  var backdropStyle = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16
  };
  var panelStyle = {
    background: "#fff", borderRadius: 12, padding: 20,
    maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto"
  };
  return React.createElement("div", {
    onClick: function(){ onClose && onClose(); },
    style: backdropStyle
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: panelStyle
  },
    phase === "picker" && React.createElement("div", null,
      React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 6 } }, "\uD83D\uDD0D \u985E\u4F3C\u30C1\u30E3\u30FC\u30C8\u691C\u7D22"),
      React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 12, lineHeight: 1.6 } }, "\u6BD4\u8F03\u5BFE\u8C61\u306E\u9298\u67C4\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002\u91CD\u307F: \u5BC4\u308A\u4ED8\u304D30% + \u5024\u52D5\u304D\u5F62\u72B650% + EMA/VWAP\u4F4D\u7F6E20%"),
      React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
        React.createElement("button", {
          onClick: selectAll,
          style: { padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", borderRadius: 5, cursor: "pointer" }
        }, "\u3059\u3079\u3066\u9078\u629E"),
        React.createElement("button", {
          onClick: selectNone,
          style: { padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "#fff", color: "#888", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer" }
        }, "\u3059\u3079\u3066\u89E3\u9664")
      ),
      React.createElement("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6, marginBottom: 16 }
      },
        allStocks.map(function(s) {
          var on = selStocks.indexOf(s) !== -1;
          return React.createElement("label", {
            key: s,
            style: {
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px", background: on ? "#EEF2FF" : "#f5f4f0",
              border: on ? "1.5px solid #6366F1" : "1px solid #e0ddd6",
              borderRadius: 6, cursor: "pointer", fontSize: 13,
              fontWeight: on ? 600 : 500, color: on ? "#4F46E5" : "#555",
              userSelect: "none"
            }
          },
            React.createElement("input", {
              type: "checkbox", checked: on, onChange: function(){ toggleStock(s); },
              style: { cursor: "pointer" }
            }),
            React.createElement("span", {
              style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
            }, s)
          );
        })
      ),
      React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } },
        React.createElement("button", {
          onClick: onClose,
          style: { padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 7, cursor: "pointer", minHeight: IS_TOUCH ? 40 : 32 }
        }, "\u30AD\u30E3\u30F3\u30BB\u30EB"),
        React.createElement("button", {
          onClick: runSearch,
          disabled: selStocks.length === 0,
          style: {
            padding: "8px 18px", fontSize: 13, fontWeight: 700,
            background: selStocks.length === 0 ? "#ccc" : "#6366F1",
            color: "#fff", border: "none", borderRadius: 7,
            cursor: selStocks.length === 0 ? "not-allowed" : "pointer",
            minHeight: IS_TOUCH ? 40 : 32
          }
        }, "\u691C\u7D22\u958B\u59CB")
      )
    ),
    phase === "searching" && React.createElement("div", { style: { padding: "40px 10px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 16, fontWeight: 700, marginBottom: 14 } }, "\u691C\u7D22\u4E2D..."),
      React.createElement("div", { style: { fontSize: 13, color: "#888", marginBottom: 10 } },
        progress.total > 0
          ? (progress.done + " / " + progress.total + " (" + Math.round(progress.done / progress.total * 100) + "%)")
          : "\u6E96\u5099\u4E2D..."
      ),
      progress.total > 0 && React.createElement("div", {
        style: { height: 8, background: "#f0eeea", borderRadius: 4, overflow: "hidden", marginBottom: 20 }
      }, React.createElement("div", {
        style: { height: "100%", width: Math.round(progress.done / progress.total * 100) + "%", background: "#6366F1", transition: "width 0.2s" }
      })),
      React.createElement("div", { style: { fontSize: 11, color: "#aaa", lineHeight: 1.6 } },
        "\u521D\u56DE\u691C\u7D22\u306F\u5168draft\u306E\u7279\u5FB4\u91CF\u3092\u8A08\u7B97\u3059\u308B\u305F\u3081\u6642\u9593\u304C\u304B\u304B\u308A\u307E\u3059\u3002",
        React.createElement("br", null),
        "2\u56DE\u76EE\u4EE5\u964D\u306F\u9AD8\u901F\u5316\u3055\u308C\u307E\u3059\u3002"
      )
    ),
    phase === "result" && React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" } },
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700, flex: 1 } }, "\uD83D\uDD0D \u691C\u7D22\u7D50\u679C"),
        React.createElement("button", {
          onClick: function(){ setResults([]); setErr(null); setOriginMetaState(null); setPhase("picker"); },
          style: { padding: "6px 12px", fontSize: 12, fontWeight: 600, background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }
        }, "\u26A1 \u6761\u4EF6\u3092\u5909\u66F4")
      ),
      
      originMetaState && React.createElement("div", {
        style: {
          background: "#fff", border: "2px solid #6366F1", borderRadius: 10,
          padding: 8, marginBottom: 14
        }
      },
        React.createElement("div", {
          style: { fontSize: 10, color: "#6366F1", fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }
        },
          React.createElement("span", null, "\uD83D\uDCCD \u8D77\u70B9\u30C1\u30E3\u30FC\u30C8"),
          React.createElement("span", { style: { color: "#888", fontWeight: 500 } },
            (originStock || "?") + " \u00B7 " + (_caResolveDate(originMetaState) || originDate || "?")
          )
        ),
        originMetaState.thumbUrl
          ? React.createElement(CaThumbImg, {
              url: originMetaState.thumbUrl,
              style: { width: "100%", display: "block", background: "#f5f4f0", objectFit: "contain", maxHeight: 200, borderRadius: 6 }
            })
          : React.createElement("div", {
              style: { width: "100%", height: 120, background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 12, borderRadius: 6 }
            }, "(\u30B5\u30E0\u30CD\u306A\u3057)")
      ),
      err ? React.createElement("div", { style: { padding: 20, color: "#C0392B", fontSize: 13 } },
        "\u30A8\u30E9\u30FC: " + (err.message || String(err))
      ) : displayed.length === 0 ? React.createElement("div", { style: { padding: 20, color: "#888", fontSize: 13, textAlign: "center" } },
        "\u985E\u4F3C\u30C1\u30E3\u30FC\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F"
      ) : React.createElement(React.Fragment, null,
        React.createElement("div", {
          style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }
        },
          displayed.map(function(r, i) {
            var m = r.meta;
            var scorePct = Math.round(r.score * 100);
            var draftId = m.id;
            var info = m._matchedStock ? _caGetStockInfo(m._matchedStock, custom) : null;
            return React.createElement("div", {
              key: m.id,
              style: { background: "#fff", border: "1px solid #e0ddd6", borderRadius: 8, overflow: "hidden" }
            },
              React.createElement("div", {
                style: { padding: "6px 10px", background: "#f8f7f4", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 6 }
              },
                React.createElement("span", { style: { fontSize: 10, color: "#888", fontWeight: 700 } }, "#" + (i + 1)),
                React.createElement("span", { style: { fontSize: 11, color: "#444", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                  (m._matchedStock || "?") + " · " + (_caResolveDate(m) || "?")
                ),
                React.createElement("span", {
                  style: { fontSize: 11, fontWeight: 700, color: scorePct >= 80 ? "#2E7D32" : scorePct >= 60 ? "#EF6C00" : "#888" }
                }, scorePct + "%")
              ),
              m.thumbUrl
                ? React.createElement(CaThumbImg, {
                    url: m.thumbUrl,
                    style: { width: "100%", display: "block", background: "#f5f4f0", objectFit: "contain", maxHeight: 160 }
                  })
                : React.createElement("div", {
                    style: { width: "100%", height: 100, background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 12 }
                  }, "(\u30B5\u30E0\u30CD\u306A\u3057)"),
              r.detail && React.createElement("div", {
                style: { padding: "4px 10px", fontSize: 10, color: "#666", borderTop: "1px solid #eee", display: "flex", gap: 6, justifyContent: "space-around", background: "#fafaf8" }
              },
                (function() {
                  var rows = [
                    { label: "\u5BC4\u308A\u4ED8\u304D", val: r.detail.openScore, weight: "30%" },
                    { label: "\u5024\u52D5\u304D\u5F62\u72B6", val: r.detail.shapeScore, weight: "50%" },
                    { label: "EMA\u30FBVWAP\u4F4D\u7F6E", val: r.detail.posScore, weight: "20%" }
                  ];
                  return rows.map(function(row) {
                    var pct = Math.round(row.val * 100);
                    var col = pct >= 80 ? "#2E7D32" : pct >= 60 ? "#EF6C00" : "#888";
                    return React.createElement("span", {
                      key: row.label,
                      title: row.label + " (\u91CD\u307F" + row.weight + ")",
                      style: { display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 }
                    },
                      React.createElement("span", { style: { fontSize: 9, color: "#999" } }, row.label),
                      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: col } }, pct + "%")
                    );
                  });
                })()
              ),
              React.createElement("div", {
                style: { display: "flex", gap: 4, padding: 6, borderTop: "1px solid #eee" }
              },
                React.createElement("button", {
                  onClick: function() {
                    var rd = _caResolveDate(m);
                    if (info && info.code && rd) {
                      _caOpen(info.code, rd, draftId);
                    } else {
                      alert("\u3053\u306E\u5206\u6790\u30C7\u30FC\u30BF\u306E\u65E5\u4ED8\u60C5\u5831\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
                    }
                  },
                  style: { flex: 1, padding: "6px 4px", fontSize: 10, fontWeight: 600,
                    background: "#EEF2FF", color: "#4F46E5",
                    border: "1px solid #C7D2FE", borderRadius: 5, cursor: "pointer" }
                }, "\u5206\u6790\u3092\u958B\u304F"),
                React.createElement("button", {
                  onClick: function() {
                    var rd = _caResolveDate(m);
                    if (!rd) {
                      alert("\u3053\u306E\u5206\u6790\u30C7\u30FC\u30BF\u306E\u65E5\u4ED8\u60C5\u5831\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
                      return;
                    }
                    onJumpDate && onJumpDate(rd, m._matchedStock, "trades");
                    onClose && onClose();
                  },
                  style: { flex: 1, padding: "6px 4px", fontSize: 10, fontWeight: 600,
                    background: "#fff", color: "#555",
                    border: "1px solid #ccc", borderRadius: 5, cursor: "pointer" }
                }, "\u3053\u306E\u65E5\u306E\u8A18\u9332")
              )
            );
          })
        )
      ),
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
        React.createElement("button", {
          onClick: onClose,
          style: { padding: "8px 18px", fontSize: 13, fontWeight: 600, background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 7, cursor: "pointer" }
        }, "\u9589\u3058\u308B")
      )
    )
  ));
}




function CAChartSection(_ref_cac) {
  var stock = _ref_cac.stock,
    date = _ref_cac.date,
    custom = _ref_cac.custom,
    cfg = _ref_cac.cfg,
    onAutoDetect = _ref_cac.onAutoDetect,
    onSimilarSearch = _ref_cac.onSimilarSearch,
    onPatternSearch = _ref_cac.onPatternSearch;
  var info = _caGetStockInfo(stock, custom);
  var _uS1 = useState({ loading: true, list: [], err: null }),
    _uS2 = _slicedToArray(_uS1, 2),
    state = _uS2[0], setState = _uS2[1];
  var _uS3 = useState(0),
    _uS4 = _slicedToArray(_uS3, 2),
    refreshN = _uS4[0], setRefreshN = _uS4[1];

  useEffect(function() {
    if (!info.caTicker) {
      setState({ loading: false, list: [], err: null });
      return;
    }
    if (!cfg || !cfg.fbUrl) {
      setState({ loading: false, list: [], err: new Error("Firebase未設定") });
      return;
    }
    setState(function(s) { return Object.assign({}, s, { loading: true }); });
    _caFetchMeta(cfg, refreshN > 0)
      .then(function(all) {
        var filtered = _caFilterByStockDate(all, info.caTicker, date, info.code);
        setState({ loading: false, list: filtered, err: null });
      })
      .catch(function(e) {
        setState({ loading: false, list: [], err: e });
      });
  }, [stock, date, refreshN, cfg && cfg.fbUrl]);

  var openTop = function() { _caOpen(info.code, date); };

  return React.createElement("div", {
    style: { background: "#f8f7f4", borderRadius: 10, padding: 14, marginBottom: 12 }
  },
    React.createElement("div", {
      style: { fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }
    },
      React.createElement("span", null, "\uD83D\uDCD0 \u30C1\u30E3\u30FC\u30C8\u5206\u6790"),
      info.code && React.createElement("span", {
        style: { fontSize: 11, color: "#999", fontWeight: 500 }
      }, "(" + info.code + ")"),
      React.createElement("button", {
        onClick: openTop,
        style: {
          marginLeft: "auto", padding: "5px 10px", fontSize: 11, fontWeight: 600,
          background: "#6366F1", color: "#fff", border: "none",
          borderRadius: 5, cursor: "pointer"
        }
      }, "\uD83D\uDD17 \u5206\u6790\u30C4\u30FC\u30EB\u3092\u958B\u304F"),
      onPatternSearch && React.createElement("button", {
        onClick: function(){ onPatternSearch(); },
        title: "パターン検索（全銘柄横断）",
        style: {
          padding: "5px 10px", fontSize: 11, fontWeight: 600,
          background: "#FFF7ED", color: "#C2410C",
          border: "1px solid #FDBA74", borderRadius: 5, cursor: "pointer"
        }
      }, "\uD83E\uDDE9 \u30D1\u30BF\u30FC\u30F3\u691C\u7D22"),
      onSimilarSearch && React.createElement("button", {
        onClick: function(){ onSimilarSearch(null); },
        title: "類似チャート検索（その日の最新サムネ）",
        style: {
          padding: "5px 10px", fontSize: 11, fontWeight: 600,
          background: "#FFF7ED", color: "#C2410C",
          border: "1px solid #FDBA74", borderRadius: 5, cursor: "pointer"
        }
      }, "\uD83D\uDD0D \u985E\u4F3C\u30C1\u30E3\u30FC\u30C8\u691C\u7D22"),
      React.createElement("button", {
        onClick: function() { setRefreshN(function(n) { return n + 1; }); },
        title: "サムネを再取得",
        style: {
          padding: "5px 8px", fontSize: 11, fontWeight: 600,
          background: "#f5f4f0", color: "#666", border: "1px solid #ddd",
          borderRadius: 5, cursor: "pointer"
        }
      }, "\uD83D\uDD04")
    ),
    
    !info.caTicker ? React.createElement("div", {
      style: { fontSize: 12, color: "#999", padding: "10px 4px", lineHeight: 1.6 }
    }, "この銘柄は分析ツールと未対応です。設定の「チャート分析ツール連携」で銘柄コードを追加してください。") :
    !cfg || !cfg.fbUrl ? React.createElement("div", {
      style: { fontSize: 12, color: "#999", padding: "10px 4px", lineHeight: 1.6 }
    }, "Firebase未設定のためサムネを取得できません。設定でFirebase URLを入力してください。") :
    state.loading ? React.createElement("div", {
      style: { fontSize: 12, color: "#999", padding: "10px 4px" }
    }, "\u2026\u8AAD\u307F\u8FBC\u307F\u4E2D") :
    state.err ? React.createElement("div", {
      style: { fontSize: 12, color: "#C0392B", padding: "10px 4px" }
    }, "\u53D6\u5F97\u30A8\u30E9\u30FC: " + (state.err.message || "")) :
    state.list.length === 0 ? React.createElement("div", {
      style: { fontSize: 12, color: "#999", padding: "10px 4px", lineHeight: 1.6 }
    },
      React.createElement("span", null, "\u307E\u3060\u30C1\u30E3\u30FC\u30C8\u5206\u6790\u30C4\u30FC\u30EB\u3067\u4F5C\u6210\u3057\u3066\u3044\u307E\u305B\u3093"),
      React.createElement("button", {
        onClick: openTop,
        style: {
          marginLeft: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600,
          background: "#fff", color: "#6366F1", border: "1px solid #C7D2FE",
          borderRadius: 5, cursor: "pointer"
        }
      }, "\u3053\u306E\u65E5\u3067\u65B0\u898F\u4F5C\u6210 \u2192")
    ) :
    React.createElement("div", {
      style: { display: "grid", gridTemplateColumns: "1fr", gap: 12 }
    },
      state.list.map(function(m) {
        
        var draftId = (m._raw && (m._raw.draftId || m._raw.id)) || m.id;
        var _openThumb = function(ev) {
          try { ev && ev.preventDefault && ev.preventDefault(); } catch(_){}
          try { ev && ev.stopPropagation && ev.stopPropagation(); } catch(_){}
          try { console.log("[CA] thumb open code=" + info.code + " date=" + date + " draftId=" + draftId); } catch(_){}
          _caOpen(info.code, date, draftId);
        };
        return React.createElement("div", {
          key: m.id,
          onClick: _openThumb,
          role: "button",
          tabIndex: 0,
          style: {
            background: "#fff", borderRadius: 10, overflow: "hidden",
            border: "1px solid #e0ddd6", cursor: "pointer", transition: "border-color 0.15s",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "rgba(99,102,241,0.15)"
          },
          onMouseEnter: function(e) { e.currentTarget.style.borderColor = "#6366F1"; },
          onMouseLeave: function(e) { e.currentTarget.style.borderColor = "#e0ddd6"; }
        },
          m.thumbUrl ? React.createElement(CaThumbImg, {
            url: m.thumbUrl,
            alt: m.name,
            style: { width: "100%", display: "block", background: "#f5f4f0", objectFit: "contain" },
            onError: function(e) { e.target.style.display = "none"; }
          }) : React.createElement("div", {
            style: { width: "100%", aspectRatio: "16/9", background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#bbb" }
          }, "\u30B5\u30E0\u30CD\u306A\u3057"),
          React.createElement("div", {
            style: { padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#555", borderTop: "1px solid #f0eeea", display: "flex", alignItems: "center", gap: 8 }
          },
            React.createElement("span", {
              style: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
            }, m.name || "(名称なし)")
          )
        );
      })
    )
  );
}









function _elCollectAllSignals(data) {
  var results = [];
  var charts = data.charts || {};
  var trades = data.trades || {};
  Object.keys(charts).forEach(function(ck) {
    var c = charts[ck];
    if (!c || !c.signals || !Array.isArray(c.signals)) return;
    var idx = ck.lastIndexOf("_");
    if (idx < 0) return;
    var stock = ck.slice(0, idx);
    var date = ck.slice(idx + 1);
    c.signals.forEach(function(s) {
      var item = null;
      if (s.itemId != null) {
        var dd = trades[date];
        if (dd && Array.isArray(dd.items)) {
          for (var i = 0; i < dd.items.length; i++) {
            
            if (String(dd.items[i].id) === String(s.itemId)) {
              item = dd.items[i];
              break;
            }
          }
        }
      }
      results.push({
        stock: stock,
        date: date,
        signal: s,
        chartImg: c.chartImg,
        item: item,
        stockTags: c.stockTags || []
      });
    });
  });
  return results;
}


function _elIsEntered(s, item) {
  return !!(item || s.entered === true);
}


// 合計額算入フラグ: signal.includeInTotal===false の記録だけを「合計額・データ分析」から除外する。
// undefined/null/未設定(旧記録)は算入=true として扱う（後方互換・既定は算入）。
// _elIsEntered(=実際にエントリーしたかE成立)とは別概念。一覧/カレンダー/検索の表示には影響させない。2026-06-18
function _elInclTotal(s) { return !s || (s.includeInTotal !== false && s.passThrough !== true); }   // スルー(passThrough=true)は算入チェックに関わらず常に不算入 2026-07-06
// recs配列([{signal,...}])から算入対象だけを残すヘルパー（分析/合計用。表示用には使わない）。
function _elFilterIncl(recs) { return (recs || []).filter(function(r) { return _elInclTotal(r && r.signal); }); }
// 追加α値の3状態判定（2026-06-24）: 〇=必要と明示(addAlphaUsed===true)／×=不要と明示(===false)／未選択=未判断(それ以外=null)。
// 推奨基本αの母数=×＋未選択(=〇以外・!_elAddAlphaYes)・推奨追加αの母数=「〇明示」のみ。〇だけが基本α母数から外れ、未選択は基本αのみの記録として基本α母数に算入(2026-06-24b拡大・推奨追加αの母数からのみ除外)。
function _elAddAlphaYes(s) { return !!s && s.addAlphaUsed === true; }
function _elAddAlphaNo(s) { return !!s && s.addAlphaUsed === false; }
function _elAddAlphaUnset(s) { return !s || (s.addAlphaUsed !== true && s.addAlphaUsed !== false); }
// 追加α値が未選択の記録に付ける小バッジ（基本α・追加αの推奨母数から外れていることを明示）2026-06-24。
function _addAlphaUnsetBadge(s) {
  if (!_elAddAlphaUnset(s)) return null;
  return React.createElement("span", { title: "追加α値が未選択（〇要/×不要を未判断）＝基本αのみの記録として推奨基本αの母数には算入されます（推奨追加αの母数は〇のみ＝未選択は除外）。記録を開いて〇を選ぶと追加αの母数に入ります。", style: { padding: "1px 5px", fontSize: 10, fontWeight: 700, background: "#F1F5F9", color: "#64748B", borderRadius: 4, border: "1px dashed #CBD5E1", whiteSpace: "nowrap" } }, "追加α未選択");
}
// ===== 浮き足加算α値（第3のα要素 2026-07-03。対象シグナル＝既定で底抜け水準線OS／底抜けラインOS・_elUkiSignalNames 2026-07-07）=====
// signal.ukiUsed(true=〇/false=×/null・undefined=対象外)・signal.ukiVal(前足浮き値の生値・円)。実効加算＝floor(ukiVal/2)＝半額・小数切捨て。
// 合計採用α(signal.alphaVal)＝基本α＋浮き足加算＋追加α（保存時に畳み込み済み＝下流の損益/EP計算は無改修で正）。
// 旧方式「追加α〇＋根拠=底抜け前足浮き＋数値(addAlphaReasonVal)」はmigrateData(_migUkiAlpha・app-01)で本フィールドへ自動移行済み。
// 母数の扱い: 推奨基本αからは追加α〇と同様に除外(_elBaseAlphaPick)・推奨追加αからも除外(_elHasNumReason=浮き足判定に載せ替え・app-06)。
function _elUkiYes(s) { return !!s && s.ukiUsed === true; }
function _elUkiVal(s) { if (!s || s.ukiVal == null || s.ukiVal === "" || isNaN(Number(s.ukiVal))) return null; return Number(s.ukiVal); }
function _elUkiAdd(s) { if (!_elUkiYes(s)) return 0; var v = _elUkiVal(s); return (v != null && v > 0) ? Math.floor(v / 2) : 0; }
// 浮き足加算の欄を表示・算入する対象シグナル名の集合 2026-07-07（ユーザー決定＝両方に付ける）。
// 2026-07-07f: 底抜け水準線OS→底抜けラインOSへ統合改名（migrateData _migSignalRename2）＝既定は1本に。
// 後方互換: custom.ukiSignalNames(配列)があれば優先／旧custom.ukiSignalName(単一)も常に対象へ含める。下流(_elUkiYes/_elUkiAdd/記録帳の浮き足分析)はsignal.ukiUsed駆動でシグナル名非依存＝この集合はフォーム(app-05)/EPナビ(app-04)の「欄を出すか」ゲート専用。
var _UKI_DEFAULT_SIGNALS = ["底抜けラインOS"];
function _elUkiSignalNames(custom) {
  var out = (custom && Array.isArray(custom.ukiSignalNames) && custom.ukiSignalNames.length) ? custom.ukiSignalNames.slice() : _UKI_DEFAULT_SIGNALS.slice();
  if (custom && custom.ukiSignalName && out.indexOf(custom.ukiSignalName) < 0) out.push(custom.ukiSignalName);
  return out;
}
// 追加α〇の「根拠（理由）」選択肢の既定。data.custom.addAlphaReasons でユーザーが追加/削除/改名可（改名は過去記録の根拠名も追従・未設定時はこの既定を表示）2026-06-22→改名2026-06-23。
// 「底抜け前足浮き」は2026-07-03に独立要素「浮き足加算α値」へ昇格＝既定から削除（過去記録・マスターはmigrateDataで移行/掃除）。
var _DEF_ADD_REASONS = ["指標線支え"];

// ===== 不算入(計算・データ算入オフ=includeInTotal===false)の可視化ヘルパー 2026-06-18 =====
function _elIsExcluded(s) { return !!(s && (s.includeInTotal === false || s.passThrough === true)); }
// スルー判定（実エントリー3択の第3状態 2026-07-06）: シグナルは出たが判断の土俵に乗せなかった記録＝計算は不算入と同経路・見た目は灰色（不算入の水色と区別）。
function _elIsThru(s) { return !!(s && s.passThrough === true); }
// 「不算入」水色バッジ（行/カードに付ける）。
function _elNotInclBadge(extra, s) {
  var _thru = _elIsThru(s);
  return React.createElement("span", { title: _thru ? "スルー（合計・データ分析に算入しない記録）" : "計算・データに算入しない記録",
    style: Object.assign({ display: "inline-block", fontSize: 9, fontWeight: 800, color: _thru ? "#4B5563" : "#0284C7",
      background: _thru ? "#E5E7EB" : "#E0F2FE", border: "1px solid " + (_thru ? "#9CA3AF" : "#7DD3FC"), borderRadius: 3, padding: "0 4px",
      whiteSpace: "nowrap", lineHeight: 1.5, verticalAlign: "middle" }, extra || {}) }, _thru ? "スルー" : "不算入");
}
// 不算入行に重ねるstyle（淡色＋水色の左ライン＋淡い水色背景）。既存rowスタイルへ Object.assign で合成。
function _elNotInclRowStyle(s) {
  if (_elIsThru(s)) return { opacity: 0.6, background: "#F5F5F4", borderLeft: "3px solid #9CA3AF" };
  return _elIsExcluded(s) ? { opacity: 0.62, background: "#EFF8FF", borderLeft: "3px solid #38BDF8" } : null;
}
// 行スタイル統合版（2026-07-08）: スルー(灰)/不算入(水色)に加え、時間かぶりで除外された記録（良い方）を薄紫で行全体色分け。
// 優先順位はスルー/不算入が先（被り除外の母数=算入のみなので実際には排他）。r={stock,date,signal}・dataが無い呼び出しは従来どおり。
function _elRowStyleWithColl(data, r, scope) {
  var st = _elNotInclRowStyle(r && r.signal);
  if (st) return st;
  if (data && _elCollExcluded(data, r, scope)) return { opacity: 0.68, background: "#F5F3FF", borderLeft: "3px solid #A78BFA" };
  return null;
}
// 水色ドット（銘柄タブ/カレンダー用）。countを渡すとタイトルに件数。
function _elExclDot(count, extra) {
  return React.createElement("span", { title: (count ? "不算入 " + count + "件" : "不算入の記録あり"),
    style: Object.assign({ display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: "#38BDF8", boxShadow: "0 0 0 1px #fff", flexShrink: 0 }, extra || {}) });
}
// signals配列の不算入件数。
function _elExclCountSigs(signals) {
  if (!Array.isArray(signals)) return 0;
  var n = 0; for (var i = 0; i < signals.length; i++) { if (signals[i] && _elIsExcluded(signals[i])) n++; }
  return n;
}
// recs配列([{signal}])の不算入件数。
function _elExclCountRecs(recs) {
  if (!Array.isArray(recs)) return 0;
  var n = 0; for (var i = 0; i < recs.length; i++) { if (recs[i] && _elIsExcluded(recs[i].signal)) n++; }
  return n;
}
// その日その銘柄(charts[stock_date])に不算入があるか/件数。
function _elDayStockExclCount(data, stock, date) {
  var c = data && data.charts && data.charts[stock + "_" + date];
  return c ? _elExclCountSigs(c.signals) : 0;
}
// その日(全銘柄)の不算入件数。
function _elDayExclCount(data, date) {
  var charts = (data && data.charts) || {}, n = 0, suf = "_" + date;
  for (var k in charts) { if (charts.hasOwnProperty(k) && k.length > suf.length && k.slice(-suf.length) === suf) n += _elExclCountSigs(charts[k].signals); }
  return n;
}
// 紫ドット（時間かぶり除外・銘柄タブ/カレンダー用）2026-07-08。不算入(水色)と別チャンネルで両立。
function _elCollDot(count, extra) {
  return React.createElement("span", { title: (count ? "被り除外 " + count + "件（時間かぶりで合計から除外）" : "時間かぶり除外あり"),
    style: Object.assign({ display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: "#A78BFA", boxShadow: "0 0 0 1px #fff", flexShrink: 0 }, extra || {}) });
}
// その日その銘柄の時間かぶり除外件数。scope省略時はその銘柄自身（同一銘柄内＝ChartSection/銘柄別ビューと一致）。
function _elDayStockCollCount(data, stock, date, scope) {
  var c = data && data.charts && data.charts[stock + "_" + date];
  if (!c || !Array.isArray(c.signals)) return 0;
  var sc = (scope === undefined) ? stock : scope;
  var n = 0; for (var i = 0; i < c.signals.length; i++) { var s = c.signals[i]; if (s && _elCollExcludedSig(data, stock, date, _compatSignal(s), sc)) n++; }
  return n;
}
// その日(全銘柄)の時間かぶり除外件数（全銘柄横断＝本日/カレンダーの合計と同じ母数）。
function _elDayCollCount(data, date) {
  var charts = (data && data.charts) || {}, n = 0, suf = "_" + date;
  for (var k in charts) {
    if (!charts.hasOwnProperty(k) || k.length <= suf.length || k.slice(-suf.length) !== suf) continue;
    var stock = k.slice(0, k.length - suf.length), sigs = charts[k].signals;
    if (!Array.isArray(sigs)) continue;
    for (var i = 0; i < sigs.length; i++) { var s = sigs[i]; if (s && _elCollExcludedSig(data, stock, date, _compatSignal(s), null)) n++; }
  }
  return n;
}





function _compatSignal(sig) {
  if (!sig) return sig;
  var s = Object.assign({}, sig);
  
  if (s.entered === undefined && s.didTrade !== undefined) {
    s.entered = (s.didTrade === "yes");
  }
  
  if ((s.maxPnl == null || s.maxPnl === "") && s.expectedPnl !== undefined && s.expectedPnl !== "") {
    var ep = Number(s.expectedPnl);
    if (!isNaN(ep)) {
      s.maxPnl = Math.abs(ep);
      s.maxPnlSign = ep >= 0 ? "+" : "-";
    }
  }
  return s;
}




function _tradeAlphaChip(s, extra) {
  if (!s || s.tradeAlpha == null) return null;
  return React.createElement("span", { title: "取引時の採用α値",
    style: Object.assign({ display: "inline-block", fontSize: 9, fontWeight: 700, color: "#0369A1",
      background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 3, padding: "0 3px",
      marginRight: 3, verticalAlign: "middle", whiteSpace: "nowrap" }, extra || {}) }, "α" + s.tradeAlpha);
}
function _vcol(n, isRed) {
  // 数値が大きいほど明るい色に（小さいほど濃い色）。
  var v = Math.abs(n || 0);
  if (isRed) {
    if (v >= 20) return "#EF4444";
    if (v >= 15) return "#DC2626";
    if (v >= 10) return "#B91C1C";
    return "#991B1B";
  } else {
    if (v >= 20) return "#22C55E";
    if (v >= 15) return "#16A34A";
    if (v >= 10) return "#15803D";
    return "#14532D";
  }
}
function _elSignedVal(v, sign) {
  var n = Number(v);
  if (!isFinite(n)) return null;
  return sign === "-" ? -Math.abs(n) : Math.abs(n);
}




var _OS_GRADE_ALPHA = { A: 20, B: 15, C: 10, D: 5, E: 0 };
// 予想OS度(難易度 A/B/C/D/E)から各記録のα値を決定。未設定(予想OS度なし)は従来どおり10。
function _gradeAlpha(difficulty) {
  return (difficulty != null && _OS_GRADE_ALPHA[difficulty] != null) ? _OS_GRADE_ALPHA[difficulty] : 10;
}
function _elAlphaInfo(r, data) {
  var c = (data && data.charts) ? data.charts[r.stock + "_" + r.date] : null;
  var s = r && r.signal;
  return {
    // 採用α値は各エントリー記録(signal.alphaVal)固有。未設定なら各記録の予想OS度α
    alpha: (s && s.alphaVal != null && s.alphaVal !== "") ? Number(s.alphaVal) : _gradeAlpha(s && s.difficulty),
    cutLine: (c && c.cutLine != null) ? Number(c.cutLine) : 10
  };
}
// 各記録の採用α(signal.alphaVal)の内訳「（基本α+追加α）」をα値欄の数値の下に出す小ノード（2026-06-24）。baseAlphaVal/addAlphaValから算出（片方欠損は合計から逆算）。基本αが無い旧記録、または表示中αが内訳の合計と異なる（α値シミュ中）場合はnull＝内訳を出さない。
// 追加α3状態(addAlphaUsed)対応 2026-06-25: 未選択(true/false以外)は「（未選択）」表記・×不要(add=0)は「（基本α）」表記(例（10）＝基本αだけを括弧で・円なし・2026-06-25f：当初は非表示にしていたが誤解で、本来は基本αを括弧表示が正)・〇要(add>0)は「（基本+追加）」。
// 2026-06-25e: 「（未選択）」は新形式記録(baseAlphaVal有り)で addAlphaUsedが〇/×以外(=未選択)なら表示＝《不算入記録でも出す》(ユーザー要望: 不算入でも追加αの〇×が未選択なら（未選択）を表記)。旧記録(baseAlphaVal無し=base==nullで早期null返し)だけは追加α3状態の概念が無いため対象外。先回の「（不算入）」表記・不算入での（未選択）抑止・旧記録への（未選択）付与はすべて撤回。
// 浮き足加算α値(uki=floor(ukiVal/2))対応 2026-07-03: 3要素（基本+浮+追加）。浮き足分は「浮」を付けて追加αと区別（例（10+浮8+5）/（10+浮8））。整合チェックは base+uki+add===dispAlpha。
function _elAlphaBreakdownNode(s, dispAlpha) { if (!s) return null; var _bn = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; }; var base = _bn(s.baseAlphaVal), add = _bn(s.addAlphaVal), total = _bn(s.alphaVal), uki = _elUkiAdd(s); if (base == null) { if (total != null && add != null) base = total - add - uki; else return null; } if (add == null) add = (total != null) ? (total - base - uki) : 0; if (base < 0 || add < 0) return null; if (dispAlpha != null && Number(dispAlpha) !== base + uki + add) return null; var _bdStyle = { fontSize: 9, color: "#94A3B8", fontWeight: 600, lineHeight: 1.1, marginTop: 1, fontVariantNumeric: "tabular-nums" }; if (s.addAlphaUsed !== true && s.addAlphaUsed !== false) return React.createElement("div", { style: _bdStyle }, "（未選択）"); var _ukiTxt = uki > 0 ? "+浮" + uki : ""; if (add === 0) return React.createElement("div", { style: _bdStyle }, "（" + base + _ukiTxt + "）"); return React.createElement("div", { style: _bdStyle }, "（" + base + _ukiTxt + "+" + add + "）"); }
// 各記録の分足(signal.minBar)を正規化して number配列 [1]/[5]/[1,5] で返す。旧形式の単一number(1 or 5)も配列1件として扱う。2026-06-24複数選択化。
function _minBarList(s) { if (!s || s.minBar == null) return []; var arr = Array.isArray(s.minBar) ? s.minBar : [s.minBar]; var out = []; for (var i = 0; i < arr.length; i++) { var n = Number(arr[i]); if ((n === 1 || n === 5) && out.indexOf(n) < 0) out.push(n); } out.sort(function(a, b) { return a - b; }); return out; }
// 各記録の分足を表の時間欄の下に出す小バッジ（「1分」=薄青／「5分」=薄緑の個別ピル・両方選択時は2つ並ぶ）。未設定はnull。2026-06-24に新規エントリー記録フォームへ再導入＝旧minBar欄。色分け2026-06-24→色入替2026-06-25(1分=青/5分=緑)。
function _minBarBadge(s) { var list = _minBarList(s); if (!list.length) return null; var _mbStyle = function(_n) { var _c = (_n === 1) ? { color: "#1D4ED8", background: "#EFF6FF", border: "1px solid #93C5FD" } : { color: "#166534", background: "#F0FDF4", border: "1px solid #86EFAC" }; return { display: "inline-block", padding: "1px 7px", fontSize: 11, fontWeight: 800, color: _c.color, background: _c.background, border: _c.border, borderRadius: 4, lineHeight: 1.5, whiteSpace: "nowrap", textAlign: "center" }; }; return React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 3, marginTop: 2 } }, list.map(function(_n) { return React.createElement("span", { key: _n, style: _mbStyle(_n) }, _n + "分"); })); }
// === EP起算方式(scheme:2)のリゾルバ ===
// 新方式: OS1〜OS3の3本以内にα値到達した足=EP(エントリーポイント)。EPの次の足からH1/H2。
// 旧方式レコード(schemeなし)は各ヘルパーの従来ロジックで処理（互換レイヤー）。
function _epIsV2(s) { return !!(s && (s.scheme === 2 || s.scheme === 3)); }
// scheme:3 = OS1〜5固定欄方式（hold*/hold2*フィールド=常に4・5本目。ミラー同期なし）。scheme:2=旧ミラー同期方式。
function _epIsV3(s) { return !!(s && s.scheme === 3); }
// 記録固有の採用α（未設定は予想OS度のα）。
function _epOwnAlpha(s) { return (s && s.alphaVal != null && s.alphaVal !== "") ? Number(s.alphaVal) : _gradeAlpha(s && s.difficulty); }
// 足配列: [{h:高値(符号付き・↑=正), c:確定値(符号付き・↑=正), exp:α値到達期待度, role:"os1"〜"h2"}]
// 符号規約: OS系フィールドはsign"-"=↓負（osConfSign互換・無印/"+"=↑正）。hold系はsign"+"=↓負（holdHighSign互換・無印/"-"=↑正）。
function _epLegs(s) {
  var L = [];
  var _osn = function(v, sign) { if (v == null || v === "") return null; var n = Number(v); return isNaN(n) ? null : (sign === "-" ? -n : n); };
  var _hn = function(v, sign) { if (v == null || v === "") return null; var n = Number(v); return isNaN(n) ? null : (sign === "+" ? -n : n); };
  if (s.osVal != null && s.osVal !== "") L.push({ h: Number(s.osVal), c: _osn(s.osConfVal, s.osConfSign), exp: s.os1Exp || null, role: "os1" });
  if (s.os2High != null && s.os2High !== "") L.push({ h: _osn(s.os2High, s.os2HighSign), c: _osn(s.os2Conf, s.os2ConfSign), exp: s.os2Exp || null, role: "os2" });
  if (s.os3High != null && s.os3High !== "") L.push({ h: _osn(s.os3High, s.os3HighSign), c: _osn(s.os3Conf, s.os3ConfSign), exp: s.os3Exp || null, role: "os3" });   // os3Exp=OS3到達期待度（補強・EP=OS3記録の欠測を埋める）2026-07-03
  if (s.holdHighVal != null || s.holdWidth != null) L.push({ h: _hn(s.holdHighVal, s.holdHighSign), c: _hn(s.holdWidth, s.holdWidthSign), exp: null, role: "h1" });
  if (s.hold2HighVal != null || s.hold2Width != null) L.push({ h: _hn(s.hold2HighVal, s.hold2HighSign), c: _hn(s.hold2Width, s.hold2WidthSign), exp: null, role: "h2" });
  // ミラー足の除去（scheme:2のみ）: 旧フォームはEP位置に応じてHold欄をOS2/OS3欄と同期（同じ足の写し）して
  // 保存していたため、写し分のレグを除くと実在の足だけになる。写し構成は採用α（保存時のEP位置）で決まる:
  // EP=OS1→h1/h2はOS2/OS3の写し・EP=OS2→h1はOS3の写し・EP=OS3/E未達→写しなし。
  // 同期導入前のscheme:2記録はOS2/OS3欄が空のままhold欄に実データを持つため、
  // 「OS側のレグが存在し高値・確定値が完全一致する」写しだけを除去する（実データは残す）。
  // scheme:3はhold*/hold2*=常に4・5本目の固定欄（写しなし）なので除去不要。
  if (s.scheme === 2) {
    var _a0 = _epOwnAlpha(s);
    var _ep0 = -1;
    for (var _i0 = 0; _i0 < Math.min(3, L.length); _i0++) { if (L[_i0].h != null && L[_i0].h >= _a0) { _ep0 = _i0; break; } }
    var _legOf = function(role) { for (var _j0 = 0; _j0 < L.length; _j0++) { if (L[_j0].role === role) return L[_j0]; } return null; };
    var _dropIfDup = function(hRole, osRole) {
      var _hl = _legOf(hRole), _ol = _legOf(osRole);
      if (_hl && _ol && _hl.h === _ol.h && _hl.c === _ol.c) L = L.filter(function(o) { return o.role !== hRole; });
    };
    if (_ep0 >= 0) {
      var _r0 = L[_ep0].role;
      if (_r0 === "os1") { _dropIfDup("h1", "os2"); _dropIfDup("h2", "os3"); }
      else if (_r0 === "os2") { _dropIfDup("h1", "os3"); }
    }
  }
  return L;
}
// EP解決: 先頭3本以内で高値≥αとなる最初の足。{epIdx, ep, h1, h2, judge, legs}。
// judge: "ok"=E成立 / "x"=×宣言後の到達(見送り・参考扱い=集計上ノートレード) / "miss"=E未達。
//   ×宣言＝EPより手前のOSが×（xBefore）。EP足＝エントリーした足なのでEP-OS自身の×はありえない＝EP（OS1含む）は無条件算入。
// 役割はαから導出: αシミュでEP位置が動いてもh1/h2は配列位置で追従（不足足はnull）。
function _epResolve(s, alpha) {
  if (!_epIsV2(s) || alpha == null) return null;
  var legs = _epLegs(s);
  if (!legs.length) return null;
  var epIdx = -1;
  for (var i = 0; i < Math.min(3, legs.length); i++) {
    if (legs[i].h != null && legs[i].h >= alpha) { epIdx = i; break; }
  }
  if (epIdx < 0) return { epIdx: -1, ep: null, h1: null, h2: null, judge: "miss", legs: legs };
  var xBefore = false;
  for (var j = 0; j < epIdx; j++) { if (legs[j].exp === "×") xBefore = true; }
  return { epIdx: epIdx, ep: legs[epIdx], h1: legs[epIdx + 1] || null, h2: legs[epIdx + 2] || null, judge: xBefore ? "x" : "ok", legs: legs };
}
// （旧 _epExpAt＝役割固定の期待度取得は2026-07-06fに削除＝最後の利用者だったOS連鎖セルも_epNextExpAtへ統一・全消費者が次足期待度に移行完了）
// 次足期待度（2026-07-06 統一・正本）: 足x(0=OS1〜3=OS4)の「引け」で下した“次の足へ継続するか”の判断（○=継続/△=中間/×=この足で降りる=見送り・手仕舞い/損切り済=旧データ値）。
// 旧・α値到達期待度(os1/2/3Exp)とH1/H2期待度(holdExp/hold2Exp)を1概念に統一＝足iを保有/継続するかのガバナンスは常に _epNextExpAt(s, i-1)。
// 読み順: ①新フィールド s.nextExp(x+1)（新フォーム保存の正本） ②レガシー導出＝記録時EP位置(採用α)で x<recEp→os(x+1)Exp（待ち足の判断）/ x===recEp→holdExp（EP引けのH1保有判断）/ x===recEp+1→hold2Exp / x>recEp+1→null（既存記録の保有域外＝未記録・×扱い）。
// OS5(x=4)に次足は無い＝xは0〜3のみ。非v2はnull（呼び出し側が生holdExp等へフォールバック）。
function _epNextExpAt(s, x) {
  if (!s || !_epIsV2(s) || x == null || x < 0 || x > 3) return null;
  var nv = s["nextExp" + (x + 1)];
  if (nv != null && nv !== "") return nv;
  var legs = _epLegs(s), a0 = _epOwnAlpha(s), recEp = -1;
  if (a0 != null) { for (var k = 0; k < Math.min(3, legs.length); k++) { if (legs[k].h != null && legs[k].h >= a0) { recEp = k; break; } } }
  if (recEp >= 0) {
    if (x === recEp) return s.holdExp || null;
    if (x === recEp + 1) return s.hold2Exp || null;
    if (x > recEp + 1) return null;
  }
  return (legs[x] && legs[x].exp) || null;
}
// H1/H2保有ガバナンス期待度の共有ヘルパー（次足期待度・TotPartsと同一規約）2026-07-06e: H1保有=EP足引けの判断/H2保有=H1足引けの判断。v2以外/α無し/E不成立は生の記録値へフォールバック＝採用αでは従来のs.holdExp/s.hold2Expと同値。
function _elH1ExpAt(s, alpha) { var _r = (s && _epIsV2(s) && alpha != null) ? _epResolve(s, alpha) : null; return (_r && _r.epIdx >= 0) ? _epNextExpAt(s, _r.epIdx) : (s ? s.holdExp : null); }
function _elH2ExpAt(s, alpha) { var _r = (s && _epIsV2(s) && alpha != null) ? _epResolve(s, alpha) : null; return (_r && _r.epIdx >= 0) ? _epNextExpAt(s, _r.epIdx + 1) : (s ? s.hold2Exp : null); }
// ×宣言後の到達（judge="x"＝見送り・参考扱い）か。EP足はα到達済みだが手前のOSで×宣言したため集計上ノートレード。
function _epIsXSkip(s, alpha) {
  if (!_epIsV2(s) || alpha == null) return false;
  var r = _epResolve(s, alpha);
  return !!(r && r.judge === "x");
}
// △確信度エントリーか（=EP損益を（）内（参考）のみに算入し本合計（）外＝0にする）。【2026-06-20訂正】
// 判定は「EP足より“前”の足に△の到達期待があるか」。例: OS1△→OS2/OS3がEP、OS2△→OS3がEP。
// OS1がEP（epIdx=0・前足なし）は無条件○。EP足自身の期待度は見ない（OS3足はexp無し）。
// 旧記録(非v2)・α未設定・×見送り(judge≠ok)・前足が全て○/未設定はfalse＝○扱い。
function _epIsTriEntry(s, alpha) {
  if (!_epIsV2(s) || alpha == null) return false;
  var r = _epResolve(s, alpha);
  if (!r || r.judge !== "ok" || r.epIdx < 0) return false;
  for (var i = 0; i < r.epIdx; i++) {
    if (_epNextExpAt(s, i) === "△") return true;   // 次足期待度で判定（採用αでは=legs[i].exp・シミュでEPが後退した時も元EP足のholdExp△を拾える）2026-07-06
  }
  return false;
}
// ×宣言を無視した「見送らず取引していたら」の仮想signal（OS到達期待×を除去→judge=ok化。EP/H1/H2足は高値≥αで不変）。
// EP損益/H損益ヘルパーを当てると、見送り記録の参考損益（取引していた場合の値）が得られる。表示・×見送り分析専用＝合計には一切算入しない（2026-06-16: ×は（）参考からも除外）。
function _epAsTraded(s) {
  if (!_epIsV2(s)) return s;
  var v = Object.assign({}, s, { os1Exp: null, os2Exp: null });
  // 次足期待度(正本)も待ち足分を除去 2026-07-06e: ×宣言は記録時EPより前の足にあるので、そのnextExpNだけnull化（EP足以降=保有判断は温存）。EP不明(未到達等)はos1/os2に合わせ先頭2足。
  var legs = _epLegs(s), a0 = _epOwnAlpha(s), recEp = -1;
  if (a0 != null) { for (var k = 0; k < Math.min(3, legs.length); k++) { if (legs[k].h != null && legs[k].h >= a0) { recEp = k; break; } } }
  var upto = recEp >= 0 ? recEp : 2;
  for (var x = 0; x < upto; x++) v["nextExp" + (x + 1)] = null;
  return v;
}
// 損益サマリー表の「OS値列」用の各記録のOS値（2026-06-23）: OS1→OS3を左から見て「算入足の最高値」を返す。
//   EP足（α到達してエントリーした足）は常に算入。それ以外の足は期待度が×/損切り済ならその足以降を打ち切り（除外）、
//   ○/△/未設定は算入。期待度＝EP前の待ち足はα到達期待(os1Exp/os2Exp)・EP後の保有足はH期待(holdExp/hold2Exp)・
//   OS3で待ち足扱い(未達等)は欄なし＝未設定→算入。算入足が無ければnull。旧記録(非v2)はOS1(osVal)をそのまま。
//   alpha未指定時は記録固有の採用α(_epOwnAlpha)でEP位置を決める。OS値の中央/平均はこの値を記録ぶん集めて算出。
function _elOsMaxFiltered(s, alpha) {
  if (!s) return null;
  if (!_epIsV2(s)) return (s.osVal != null && s.osVal !== "") ? Number(s.osVal) : null;
  var a = (alpha != null) ? alpha : _epOwnAlpha(s);
  var legs = _epLegs(s).slice(0, 3);
  if (!legs.length) return null;
  var epIdx = -1;
  if (a != null) { var r = _epResolve(s, a); if (r) epIdx = r.epIdx; }
  var _cut = function(e) { return e === "×" || e === "損切り済"; };
  var max = null;
  for (var i = 0; i < legs.length; i++) {
    var o = legs[i];
    if (i === epIdx) { if (o.h != null && (max == null || o.h > max)) max = o.h; continue; }
    var exp = (epIdx >= 0) ? (i > epIdx ? _epNextExpAt(s, i - 1) : _epNextExpAt(s, i)) : o.exp;   // 保有側=足i-1の引け/待ち側=足iの引けの次足期待度（採用αでは従来と同値・新記録のnextExpN対応）2026-07-06e
    if (_cut(exp)) break;  // ×/損切り済 → この足以降を除外（打ち切り）
    if (o.h != null && (max == null || o.h > max)) max = o.h;
  }
  return max;
}
// 分析用の各記録のOS値（2026-06-23）: OS1〜3の最高値を結果に依らず素直に取る（×/損切り足も含む＝アウトカム盲目）。
//   _elOsMaxFiltered（損益サマリーの「OS値列」＝×/損切りで打ち切り＝実現分のOS）と対の版。○△に絞らず全足を母数に入れることで、
//   α目安（到達確率）や帯別の選択バイアス／アウトカム漏れを避ける＝OS値の分布・中央値分析はこちらを使う。旧記録(非v2)はOS1(osVal)。
function _elOsMaxAll(s) {
  if (!s) return null;
  if (!_epIsV2(s)) return (s.osVal != null && s.osVal !== "") ? Number(s.osVal) : null;
  var legs = _epLegs(s).slice(0, 3);
  if (!legs.length) return null;
  var max = null;
  for (var i = 0; i < legs.length; i++) {
    var h = legs[i].h;
    if (h != null && (max == null || h > max)) max = h;
  }
  return max;
}
// OS1〜3の最高値（×打ち切り版・ユーザー仕様 2026-06-24）: 各足を「算入してから」、到達期待度×/H期待度×/損切り済の足でそこまで含めて打ち切る（その足以降は除外）。EP足は打ち切り対象外。
// _elOsMaxFiltered（×足は算入せず除外）と違い、×になった足自身の高値は含める＝「×になった所までの最高値」。OS欄の最高値表示で（）外に出す値。
function _elOsMaxCapped(s, alpha) {
  if (!s) return null;
  if (!_epIsV2(s)) return (s.osVal != null && s.osVal !== "") ? Number(s.osVal) : null;
  var a = (alpha != null) ? alpha : _epOwnAlpha(s);
  var legs = _epLegs(s).slice(0, 3);
  if (!legs.length) return null;
  var epIdx = -1; var _r = _epResolve(s, a); if (_r) epIdx = _r.epIdx;
  var _cut = function(e) { return e === "×" || e === "損切り済"; };
  var max = null;
  for (var i = 0; i < legs.length; i++) {
    var o = legs[i];
    if (o.h != null && (max == null || o.h > max)) max = o.h;
    if (i === epIdx) continue;
    var exp = (epIdx >= 0) ? (i > epIdx ? _epNextExpAt(s, i - 1) : _epNextExpAt(s, i)) : o.exp;   // 保有側=足i-1の引け/待ち側=足iの引けの次足期待度（採用αでは従来と同値・新記録のnextExpN対応）2026-07-06e
    if (_cut(exp)) break;
  }
  return max;
}
// EP→以降の足を順にホールドした場合の損益ラダー（OS1〜5対応）。各足で「ここで手仕舞いした損益」と損切り発生を返す。
// 損切り: EP以降で高値−α≧cutに達した最初の足。以降は損切り額で固定。未達の足は確定値で手仕舞い損益(α−確定値)*100。
// 返り値 {epIdx, items:[{idx,depth,role,leg,pnl,isStop,afterStop}], stopDepth(-1=損切りなし), maxPnl, maxDepth, finalPnl}。
// E成立(judge"ok")のv2記録のみ。×見送り/未達/旧記録はnull。
function _epHoldLadder(s, alpha, cutLine) {
  if (!_epIsV2(s) || alpha == null) return null;
  var r = _epResolve(s, alpha);
  if (!r || r.epIdx < 0 || r.judge !== "ok") return null;
  var legs = _epLegs(s), cut = cutLine != null ? cutLine : 10;
  var items = [], stopDepth = -1, stopHigh = null, maxPnl = null, maxDepth = 0, finalPnl = null;
  for (var i = r.epIdx; i < legs.length; i++) {
    var lg = legs[i], depth = i - r.epIdx;
    if (stopDepth < 0 && lg.h != null && (lg.h - alpha) >= cut) { stopDepth = depth; stopHigh = lg.h; }
    var pnl;
    if (stopDepth >= 0) pnl = -Math.round((stopHigh - alpha) * 100);
    else pnl = (lg.c != null) ? Math.round((alpha - lg.c) * 100) : null;
    items.push({ idx: i, depth: depth, role: depth === 0 ? "EP" : ("H" + depth), leg: lg, pnl: pnl, isStop: stopDepth === depth, afterStop: stopDepth >= 0 && stopDepth < depth });
    if (pnl != null) { finalPnl = pnl; if (maxPnl == null || pnl > maxPnl) { maxPnl = pnl; maxDepth = depth; } }
  }
  return { epIdx: r.epIdx, items: items, stopDepth: stopDepth, maxPnl: maxPnl, maxDepth: maxDepth, finalPnl: finalPnl };
}
function _elDynResult(s, alpha, cutLine) {
  if (_epIsV2(s) && alpha != null) {
    var _rv2 = _epResolve(s, alpha);
    if (_rv2) {
      if (_rv2.judge !== "ok") return "miss";
      if ((_rv2.ep.h - alpha) >= cutLine) return "ng";
      if (_rv2.ep.c != null) return _rv2.ep.c < alpha ? "ok" : _rv2.ep.c === alpha ? "draw" : "ng";
      return s.result;
    }
  }
  if (alpha != null && s.osVal != null && Number(s.osVal) >= 0) {
    var dv = Number(s.osVal) - alpha;
    if (dv < 0) return "miss";
    if (dv >= cutLine) return "ng";
    if (s.osConfVal != null && s.osConfVal !== "") {
      var cf = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
      return cf < alpha ? "ok" : cf === alpha ? "draw" : "ng";
    }
  }
  return s.result;
}
// 〇△×の「×の前まで乗る」で各記録の勝敗内訳を返す。返り値: "miss"|"stop"|"loss"|"even"|"win"|"tri"(△が絡む勝ち)。
// ×/損切り済の足の手前まで乗り(○/△/未設定は乗る)、到達点の確定値損益と△有無で振り分ける。EP前の到達△も「△が絡む」に含める。
function _elWinBucket(s, alpha, cutLine) {
  var base = _elDynResult(s, alpha, cutLine);
  if (base === "miss") return "miss";
  var cut = cutLine != null ? cutLine : 10;
  if (!_epIsV2(s) || alpha == null) {
    if (base === "draw") return "even";
    if (base === "ng") return "loss";
    return "win";
  }
  var r = _epResolve(s, alpha);
  if (!r || r.judge !== "ok" || r.epIdx < 0) {
    if (base === "draw") return "even";
    if (base === "ng") return _elPlanIsStop(s, alpha, cut) ? "stop" : "loss";
    return "win";
  }
  var legs = _epLegs(s);
  var epIdx = r.epIdx;
  var _cut = function(e) { return e === "×" || e === "損切り済"; };
  var hasTri = false, i;
  for (i = 0; i < epIdx; i++) { if (_epNextExpAt(s, i) === "△") hasTri = true; }   // 次足期待度（採用αでは=legs[i].exp）2026-07-06e
  var exitC = null, stopped = false;
  for (i = epIdx; i < legs.length; i++) {
    var o = legs[i];
    if (i !== epIdx) {
      var exp = _epNextExpAt(s, i - 1);   // 足iの保有＝足i-1の引けの次足期待度（採用αでは従来と同値）2026-07-06e
      if (_cut(exp)) break;
      if (exp === "△") hasTri = true;
    }
    if (o.h != null && (o.h - alpha) >= cut) { stopped = true; break; }
    if (o.c != null) exitC = o.c;
  }
  if (stopped) return "stop";
  if (exitC == null) { if (base === "draw") return "even"; if (base === "ng") return "loss"; return hasTri ? "tri" : "win"; }
  var pnl = Math.round((alpha - exitC) * 100);
  if (pnl < 0) return "loss";
  if (pnl === 0) return "even";
  return hasTri ? "tri" : "win";
}
function _elDynPlanned(s, alpha, cutLine) {
  if (_epIsV2(s) && alpha != null) {
    var _rp2 = _epResolve(s, alpha);
    if (_rp2) {
      if (_rp2.judge !== "ok") return 0;
      var _dfp2 = _rp2.ep.h - alpha;
      if (_dfp2 >= cutLine) return -Math.round(_dfp2 * 100);
      return _rp2.ep.c != null ? Math.round((alpha - _rp2.ep.c) * 100) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
    }
  }
  var pp = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
  if (alpha != null && s.osVal != null) {
    var cf = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
    var df = Number(s.osVal) - alpha;
    var pD = df < 0 ? 0 : df >= cutLine ? -Math.round(df * 100) : (cf != null ? Math.round((alpha - cf) * 100) : null);
    if (pD != null) pp = pD;
  }
  return pp;
}
function _elDynHold(s, alpha, cutLine) {
  if (_epIsV2(s) && alpha != null) {
    var _rh2 = _epResolve(s, alpha);
    if (_rh2) {
      if (_rh2.judge !== "ok") return null;
      var _h1l = _rh2.h1;
      if (_h1l && _h1l.h != null && (_h1l.h - alpha) >= cutLine) return -Math.round((_h1l.h - alpha) * 100);
      if ((_rh2.ep.h - alpha) >= cutLine) return -Math.round((_rh2.ep.h - alpha) * 100);
      return (_h1l && _h1l.c != null) ? Math.round((alpha - _h1l.c) * 100) : null;
    }
  }
  if (alpha == null) return _elSignedVal(s.holdPnl, s.holdPnlSign);
  if (s.osVal != null && alpha > Number(s.osVal)) {
    if (!(s.holdHighSign === "-" && s.holdHighVal != null && Number(s.holdHighVal) >= alpha)) return null;
  }
  var hp, done = false;
  if (s.holdHighSign === "-" && s.holdHighVal != null) {
    var hhE = Number(s.holdHighVal) - alpha;
    if (hhE >= cutLine) { hp = -Math.round(hhE * 100); done = true; }
  }
  if (!done && s.osVal != null && (Number(s.osVal) - alpha) >= cutLine) { hp = -Math.round((Number(s.osVal) - alpha) * 100); done = true; }
  if (!done) {
    if (s.holdWidth != null) { var _hwS0 = s.holdWidthSign === "+" ? Number(s.holdWidth) : s.holdWidthSign === "-" ? -Number(s.holdWidth) : 0; hp = Math.round((alpha + _hwS0) * 100); }
    else if (s.holdOsConf != null) { hp = Math.round((alpha + (alpha - Number(s.holdOsConf))) * 100); }
    else { hp = _elSignedVal(s.holdPnl, s.holdPnlSign); }
  }
  return hp;
}
// 値幅/確定値ベースのホールド損益（損切りルール・miss判定なし）。
function _elHoldWidthPnl(s, alpha) {
  if (s.holdWidth != null) { var _hwS0 = s.holdWidthSign === "+" ? Number(s.holdWidth) : s.holdWidthSign === "-" ? -Number(s.holdWidth) : 0; return Math.round((alpha + _hwS0) * 100); }
  if (s.holdOsConf != null) return Math.round((alpha + (alpha - Number(s.holdOsConf))) * 100);
  return _elSignedVal(s.holdPnl, s.holdPnlSign);
}
// 損切りルールを適用しないホールド損益（値幅/確定値ベースのみ）。H2で想定/H1が既に損切りの場合に使用。
function _elDynHoldNoStop(s, alpha) {
  if (alpha == null) return _elSignedVal(s.holdPnl, s.holdPnlSign);
  if (s.osVal != null && alpha > Number(s.osVal)) {
    if (!(s.holdHighSign === "-" && s.holdHighVal != null && Number(s.holdHighVal) >= alpha)) return null;
  }
  return _elHoldWidthPnl(s, alpha);
}

function _elPlanIsStop(s, alpha, cutLine) {
  if (_epIsV2(s)) {
    if (alpha == null) return false;
    var _rs2 = _epResolve(s, alpha);
    return !!(_rs2 && _rs2.judge === "ok" && (_rs2.ep.h - alpha) >= (cutLine != null ? cutLine : 10));
  }
  return alpha != null && s.osVal != null && (Number(s.osVal) - alpha) >= (cutLine != null ? cutLine : 10);
}
function _elHoldIsStop(s, alpha, cutLine) {
  if (alpha == null) return false;
  var _cl = cutLine != null ? cutLine : 10;
  if (_epIsV2(s)) {
    var _rt2 = _epResolve(s, alpha);
    if (!_rt2 || _rt2.judge !== "ok") return false;
    if ((_rt2.ep.h - alpha) >= _cl) return true;
    if (_rt2.h1 && _rt2.h1.h != null && (_rt2.h1.h - alpha) >= _cl) return true;
    return false;
  }
  if (s.holdHighSign === "-" && s.holdHighVal != null && (Number(s.holdHighVal) - alpha) >= _cl) return true;
  if (s.osVal != null && (Number(s.osVal) - alpha) >= _cl) return true;
  return false;
}
// 理想α値: 候補(0〜50円・1円刻み)のうち損切りにならず「EP損益＋H1結果損益」の合計が最大の値。
// 該当が無ければ全候補中で合計が最大(=一番マシ)の値。同点は小さいα優先。本日/今週の損益データ表のαシミュ用。
// 2026-06-21: 5円刻み(0/5/10/15/20)→1円刻み(0〜50)へ精密化＝理想α表(_elIdealAlphaTableV2)/一括ボタンが1円単位に。※記録帳の「推奨基本α」分析は別系統＝_EL_BASE_ALPHAS(5〜20)。
var _EL_IDEAL_ALPHAS = (function() { var _a = []; for (var _i = 0; _i <= 50; _i++) _a.push(_i); return _a; })();
function _elIdealAlpha(s, cutLine) {
  if (!s) return null;
  var _cl = cutLine != null ? cutLine : 10;
  var best = null, fallback = null;
  _EL_IDEAL_ALPHAS.forEach(function(a) {
    var _pl = _elDynPlanned(s, a, _cl);
    var _hd = _elDynHold(s, a, _cl);
    var _pf = (_pl != null ? _pl : 0) + (_hd != null ? _hd : 0);
    if (fallback == null || _pf > fallback.p) fallback = { a: a, p: _pf };
    if (!_elHoldIsStop(s, a, _cl) && _pf > 0 && (best == null || _pf > best.p)) best = { a: a, p: _pf };
  });
  return best ? best.a : (fallback ? fallback.a : null);
}
// 理想損切り値: 候補(10/15/20)のうち損切りを回避できる(=_elHoldIsStopがfalse)最小の値。
// 回避できる値が無ければ（全部損切り）最小の10。alphaは現在の採用α(シミュ含む)を渡す。本日/今週の損切り値シミュ用。
var _EL_IDEAL_CUTS = [10, 15, 20];
function _elIdealCut(s, alpha) {
  if (!s) return null;
  for (var i = 0; i < _EL_IDEAL_CUTS.length; i++) {
    if (!_elHoldIsStop(s, alpha, _EL_IDEAL_CUTS[i])) return _EL_IDEAL_CUTS[i];
  }
  return _EL_IDEAL_CUTS[0];
}
// === H2（Hold2）: 既存hold*ロジックを流用するための仮想signalと描画ヘルパー ===
// hold2*フィールドをhold*の名前にマッピングした仮想signalを返す（osValは共通なので元のまま）。
function _h2sig(s) {
  return {
    osVal: s.osVal,
    plannedPnl: s.plannedPnl, plannedPnlSign: s.plannedPnlSign, result: s.result,
    osConfVal: s.osConfVal, osConfSign: s.osConfSign,
    holdHighSign: s.hold2HighSign, holdHighVal: s.hold2HighVal,
    holdWidthSign: s.hold2WidthSign, holdWidth: s.hold2Width,
    holdOsConf: s.hold2OsConf,
    holdPnl: s.hold2Pnl, holdPnlSign: s.hold2PnlSign,
    holdProfit: s.hold2Profit
  };
}
// 表示用の仮想hold-signal: v2/v3記録はαで解決したH1/H2レグ（EPの次・その次の足）の値を
// hold*フィールド名（符号規約: "+"=↓負・"-"=↑正）に詰めて返す＝H明細表示が役割に追従する。
// 判断データ（holdExp/holdProfit等）は役割に紐付くのでそのままコピー。旧記録は従来どおりs/_h2sig(s)。
function _epHoldView(s, alpha, isH2) {
  var base = isH2 ? _h2sig(s) : s;
  if (!_epIsV2(s)) return base;
  var _r = _epResolve(s, alpha != null ? alpha : _epOwnAlpha(s));
  var leg = _r ? (isH2 ? _r.h2 : _r.h1) : null;
  var v = Object.assign({}, base);
  v.holdHighVal = (leg && leg.h != null) ? Math.abs(leg.h) : null;
  v.holdHighSign = (leg && leg.h != null) ? (leg.h < 0 ? "+" : leg.h > 0 ? "-" : null) : null;
  v.holdWidth = (leg && leg.c != null) ? Math.abs(leg.c) : null;
  v.holdWidthSign = (leg && leg.c != null) ? (leg.c < 0 ? "+" : leg.c > 0 ? "-" : null) : null;
  v.holdOsConf = null;
  return v;
}
function _elDynHold2(s, alpha, cutLine) {
  if (_epIsV2(s) && alpha != null) {
    var _r22 = _epResolve(s, alpha);
    if (!_r22 || _r22.judge !== "ok") return null;
    var _h2l = _r22.h2;
    if (!_h2l) return null;
    // EPまたはH1で既に損切り→損切りルール非適用（確定値ベース）。
    if (_elHoldIsStop(s, alpha, cutLine)) return _h2l.c != null ? Math.round((alpha - _h2l.c) * 100) : null;
    if (_h2l.h != null && (_h2l.h - alpha) >= cutLine) return -Math.round((_h2l.h - alpha) * 100);
    return _h2l.c != null ? Math.round((alpha - _h2l.c) * 100) : null;
  }
  // EP損益またはH1で既に損切りの場合、H2には損切りルールを適用せず値幅から算出（損益変化はH1損益との純粋比較）。
  if (alpha != null && _elHoldIsStop(s, alpha, cutLine)) return _elDynHoldNoStop(_h2sig(s), alpha);
  var _h2s = _h2sig(s);
  // miss(OS<α)でも、H1の高値がα到達ならH2は自身がα未達でも結果を算出（H1でエントリー成立とみなす）。
  if (alpha != null && s.osVal != null && alpha > Number(s.osVal)
      && !(_h2s.holdHighSign === "-" && _h2s.holdHighVal != null && Number(_h2s.holdHighVal) >= alpha)
      && (s.holdHighSign === "-" && s.holdHighVal != null && Number(s.holdHighVal) >= alpha)) {
    return _elHoldWidthPnl(_h2s, alpha);
  }
  return _elDynHold(_h2s, alpha, cutLine);
}
function _elHoldIsStop2(s, alpha, cutLine) {
  if (_epIsV2(s)) {
    if (alpha == null) return false;
    var _r32 = _epResolve(s, alpha);
    return !!(_r32 && _r32.judge === "ok" && _r32.h2 && _r32.h2.h != null && (_r32.h2.h - alpha) >= (cutLine != null ? cutLine : 10));
  }
  return _elHoldIsStop(_h2sig(s), alpha, cutLine);
}
function _elHas2Data(s, alpha) {
  if (!s) return false;
  // v2/v3はH2=αで解決したレグ（EPの2本後）の有無で判定（alpha省略時は採用α）。
  if (_epIsV2(s)) {
    var _r = _epResolve(s, alpha != null ? alpha : _epOwnAlpha(s));
    return !!(_r && _r.h2 && (_r.h2.h != null || _r.h2.c != null));
  }
  return !!(s.hold2HighVal != null || s.hold2Width != null || s.hold2OsConf != null || s.hold2Pnl != null);
}
// EP損益もH1もE基準未達（OS値<α かつ H1高値もα未達）→ H2は成立せず非表示扱い。
// 表ではH2期待度を「ー」・損益をQ ー円（高値/確定値/α値比はH1と同形式）で表示し、合計には算入しない。フォームの _fH2Hidden と同条件。
function _elH2Miss(s, alpha) {
  if (s != null && _epIsV2(s)) {
    if (alpha == null) return false;
    var _rm2 = _epResolve(s, alpha);
    return !!(_rm2 && _rm2.judge !== "ok");  // 未達・×見送り=集計上ノートレード
  }
  if (alpha == null || s == null || s.osVal == null) return false;
  var _os = Number(s.osVal);
  if (isNaN(_os) || _os < 0 || _os >= alpha) return false;  // 想定がα到達なら対象外
  var _h1ReachedA = (s.holdHighSign === "-" && s.holdHighVal != null && Number(s.holdHighVal) >= alpha);  // H1高値がα到達=H1でエントリー成立
  return !_h1ReachedA;
}
// === 日別集計の「実現結果」「H中最高値」用ヘルパー（採用α基準・取引/銘柄別記録テーブルと同基準）===
// H中最高値（×除く）: OS(H0)〜H2の3記録で出た最高値（水準線比・↑=正/↓=負）。
//  OS値は常に↑(正)。H1/H2高値はholdHighSign/hold2HighSign("+"=↓負・"-"/無=↑正)。
//  ex=期待度×を除いた最高値（H1×ならOSのみ＝H2もその時点で対象外、H1非×でH2×ならOS/H1）、all=×含む3記録の最高値。
function _elHoldMaxHigh(s) {
  if (!s) return { ex: null, all: null };
  if (_epIsV2(s)) {
    // scheme2: 全足(OS1〜H2)の最高値。ex=×宣言したOS足より後の足・H期待度×の足を除外。
    var _lg2 = _epLegs(s);
    var allM2 = null, exM2 = null, xSeen2 = false;
    _lg2.forEach(function(o) {
      var isOsLeg = o.role.charAt(0) === "o";
      if (o.h != null) {
        if (allM2 == null || o.h > allM2) allM2 = o.h;
        var exOk2 = !xSeen2
          && !(o.role === "h1" && s.holdExp === "×")
          && !(o.role === "h2" && (s.holdExp === "×" || s.hold2Exp === "×"));
        if (exOk2 && (exM2 == null || o.h > exM2)) exM2 = o.h;
      }
      if (isOsLeg && o.exp === "×") xSeen2 = true;
    });
    return { ex: exM2, all: allM2 };
  }
  var vals = [];
  if (s.osVal != null && s.osVal !== "") vals.push({ v: Number(s.osVal), exOk: true });  // OS=常に↑(正)
  var _h1x = (s.holdExp === "×");
  if (s.holdHighVal != null && s.holdHighVal !== "") vals.push({ v: s.holdHighSign === "+" ? -Number(s.holdHighVal) : Number(s.holdHighVal), exOk: !_h1x });
  var _h2x = _h1x || (s.hold2Exp === "×");  // H1×ならH2はその時点で対象外
  if (s.hold2HighVal != null && s.hold2HighVal !== "") vals.push({ v: s.hold2HighSign === "+" ? -Number(s.hold2HighVal) : Number(s.hold2HighVal), exOk: !_h2x });
  if (!vals.length) return { ex: null, all: null };
  var allMax = null, exMax = null;
  vals.forEach(function(o) { if (allMax == null || o.v > allMax) allMax = o.v; if (o.exOk && (exMax == null || o.v > exMax)) exMax = o.v; });
  return { ex: exMax, all: allMax };
}
function _elHighNode(v, key) {
  if (v == null) return null;
  if (v === 0) return React.createElement("span", { key: key, style: { color: "#888", fontVariantNumeric: "tabular-nums" } }, "0");
  var up = v > 0, abs = Math.abs(v);
  return React.createElement("span", { key: key, style: { fontVariantNumeric: "tabular-nums", color: _vcol(abs, up), fontWeight: abs >= 10 ? 700 : 600 } }, (up ? "↑" : "↓") + abs);
}
// H中最高値セル: 「↑18（↑42）」。括弧内=×含む最高値（exと異なる時のみ併記）。
function _elHoldMaxHighCell(s) {
  var m = _elHoldMaxHigh(s);
  if (m.ex == null && m.all == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  if (m.all != null && m.all !== m.ex) {
    return React.createElement("span", { style: { whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" } },
      _elHighNode(m.ex, "ex"),
      React.createElement("span", { style: { color: "#9CA3AF", marginLeft: 1 } }, "（"), _elHighNode(m.all, "all"), React.createElement("span", { style: { color: "#9CA3AF" } }, "）"));
  }
  return _elHighNode(m.ex != null ? m.ex : m.all, "ex");
}
// 実現結果: "miss"(E未達=OS・H1ともα未達でノートレード) / "stop"(想定orH1orH2で損切り) / "profit" / "loss" / "zero" / null。
// 利益/損失は結果損益（H2データあり＆H2成立ならH2、無ければH1）で判定。
function _elRealizedOutcome(s, alpha, cutLine) {
  if (!s) return null;
  if (_epIsV2(s) && alpha != null) {
    var _ro2 = _epResolve(s, alpha);
    if (_ro2 && _ro2.judge === "x") return "x";  // ×宣言後の到達=見送り（参考）
  }
  if (_elH2Miss(s, alpha)) return "miss";
  var _sp = _elPlanIsStop(s, alpha, cutLine);
  var _sh1 = !_sp && _elHoldIsStop(s, alpha, cutLine);
  var _sh2 = !_sp && !_sh1 && _elHas2Data(s, alpha) && !_elH2Miss(s, alpha) && _elHoldIsStop2(s, alpha, cutLine);
  if (_sp || _sh1 || _sh2) return "stop";
  var res = (_elHas2Data(s, alpha) && !_elH2Miss(s, alpha)) ? _elDynHold2(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
  if (res == null) return null;
  return res > 0 ? "profit" : res < 0 ? "loss" : "zero";
}
function _elOutcomeCell(s, alpha, cutLine) {
  var o = _elRealizedOutcome(s, alpha, cutLine);
  if (o === "x") return React.createElement("span", { style: { color: "#1E8449", fontSize: 10, fontWeight: 700 } }, "×見送り");
  if (o === "miss") return React.createElement("span", { style: { color: "#7C3AED", fontSize: 10, fontWeight: 700 } }, "E未達");
  if (o === "stop") return React.createElement("span", { style: { display: "inline-block", padding: "1px 6px", borderRadius: 5, fontSize: 10, fontWeight: 700, color: "#fff", background: "#1E8449", whiteSpace: "nowrap" } }, "損切り");
  if (o === "profit") return React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "利益");
  if (o === "loss") return React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "損失");
  if (o === "zero") return React.createElement("span", { style: { color: "#888", fontWeight: 600 } }, "±0");
  return React.createElement("span", { style: { color: "#ccc" } }, "ー");
}
// === EP起算方式: 表のOS/E/EP損益 列セルヘルパー（エントリー記録欄等で使用・旧記録も同形式で表示）===
// 符号付き値ノード（↑=正・↓=負）。
function _epSignedNode(v, key) {
  if (v == null) return React.createElement("span", { key: key, style: { color: "#ccc" } }, "—");
  if (v === 0) return React.createElement("span", { key: key, style: { color: "#888", fontVariantNumeric: "tabular-nums" } }, "0");
  var up = v > 0, abs = Math.abs(v);
  return React.createElement("span", { key: key, style: { fontVariantNumeric: "tabular-nums", color: _vcol(abs, up), fontWeight: abs >= 10 ? 700 : 600 } }, (up ? "↑" : "↓") + abs);
}
// OS欄: 最初の3本（OS枠）の連鎖「8(↑3)→9(↑5)→15(↓2)」。値=高値(確定値)・高値は正なら矢印なし。
// EP=OS1ならH1/H2の足も2・3本目として表示。alphaを渡すとEPになった足の下に「↑EP」を表示（数値と同サイズ・1行）。
// 各足の数値下に期待度（EP前=α到達期待 os1Exp/os2Exp・EP後=H期待 holdExp/hold2Exp）を○△×で表示。
// ×宣言後の到達（judge="x"＝EP足より前のOSで到達期待×）の場合、EP足は「↑EP（×）」と表示。
// 旧記録はOS1のみ（osVal≥αならEPマーカー・期待度は非表示）。
// OS欄の最下部中央に出す「OS1〜3の最高値」ノード（ユーザー仕様 2026-06-24）。
// 通常は最高値を1つ表示。到達期待度×/H期待度×/損切り済の足より後ろに更に高い足がある場合だけ「打ち切り最高値（全体最高値）」＝例 12（21）。値は水準線比(↑/↓)。
function _epOsMaxChainNode(s, alpha) {
  var raw = _elOsMaxAll(s);
  if (raw == null) return null;
  var capped = _elOsMaxCapped(s, alpha);
  if (capped == null) capped = raw;
  var _fmt = function(v) { return React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", fontWeight: 800, color: _vcol(Math.abs(v), v >= 0) } }, (v < 0 ? "↓" : "") + Math.abs(v)); };
  var inner = (raw > capped)
    ? React.createElement(React.Fragment, null, _fmt(capped), React.createElement("span", { style: { color: "#9CA3AF" } }, "（"), _fmt(raw), React.createElement("span", { style: { color: "#9CA3AF" } }, "）"))
    : _fmt(raw);
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, marginTop: 1, fontSize: "0.92em", whiteSpace: "nowrap" } },
    React.createElement("span", { style: { fontSize: "0.8em", color: "#94A3B8", fontWeight: 700 } }, "最高"), inner);
}
function _epOsChainCell(s, alpha) {
  var legs, epIdx = -1, judge = null;
  if (_epIsV2(s)) {
    legs = _epLegs(s).slice(0, 3);
    if (alpha != null) { var _rc = _epResolve(s, alpha); if (_rc) { epIdx = _rc.epIdx; judge = _rc.judge; } }
  } else {
    legs = (s && s.osVal != null) ? [{ h: Number(s.osVal), c: s.osConfVal != null ? (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)) : null }] : [];
    if (alpha != null && s && s.osVal != null && Number(s.osVal) >= alpha) epIdx = 0;
  }
  if (!legs.length) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  // 期待度シンボル「次○」＝その足の引けの次足期待度（○=次足へ継続/△=中間/×=この足で降りる）2026-07-06f 案A。
  // 配色はフォーム_expBと同一の1本（○赤/△琥珀/×緑）＝旧「H期待は○緑/×赤」の文脈反転を廃止。muted=未記録由来の自動×（グレー）。
  var _expSym = function(sym, muted) {
    if (sym !== "○" && sym !== "△" && sym !== "×") return null;
    var col = muted ? "#9CA3AF" : sym === "△" ? "#B45309" : sym === "○" ? "#C0392B" : "#1E8449";
    return React.createElement("span", { style: { lineHeight: 1.1, fontSize: "0.9em", whiteSpace: "nowrap" } },
      React.createElement("span", { style: { color: "#9CA3AF", fontWeight: 700 } }, "次"),
      React.createElement("span", { style: { fontWeight: 800, color: col } }, sym));
  };
  // 未記録スロットの自動×解決（表示用）2026-07-06g: 旧記録で判断が記録されていない足も、計算上×扱いになるものは「次×」をグレーで明示（ユーザー要望「OS3まで表示」）。
  //  ①記録時EPの保有域外（x>recEp+1＝H2手仕舞い後）②前の足が×/損切り済（×連鎖）。どちらでもない未記録（例: 未達記録の後続待ち足）は従来どおり空。
  var _dispEx = [], _autoEx = [];
  if (_epIsV2(s)) {
    var _a0c = _epOwnAlpha(s), _recEpC = -1;
    if (_a0c != null) { for (var kk = 0; kk < Math.min(3, legs.length); kk++) { if (legs[kk].h != null && legs[kk].h >= _a0c) { _recEpC = kk; break; } } }
    legs.forEach(function(o, i) {
      var ex = _epNextExpAt(s, i), auto = false;
      if (ex == null) {
        var prev = i > 0 ? _dispEx[i - 1] : null;
        if ((_recEpC >= 0 && i > _recEpC + 1) || prev === "×" || prev === "損切り済") { ex = "×"; auto = true; }
      }
      _dispEx.push(ex); _autoEx.push(auto);
    });
  }
  var nodes = [];
  legs.forEach(function(o, i) {
    if (i > 0) nodes.push(React.createElement("span", { key: "ar" + i, style: { color: "#bbb", margin: "0 1px", fontSize: "0.9em" } }, "→"));
    var _val = React.createElement("span", { style: { whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" } },
      o.h != null
        ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", fontWeight: 700, color: _vcol(Math.abs(o.h), o.h >= 0) } }, (o.h < 0 ? "↓" : "") + Math.abs(o.h))
        : React.createElement("span", { style: { color: "#ccc" } }, "—"),
      React.createElement("span", { style: { color: "#9CA3AF", fontSize: "0.85em" } }, "("),
      _epSignedNode(o.c, "c" + i),
      React.createElement("span", { style: { color: "#9CA3AF", fontSize: "0.85em" } }, ")"));
    // 数値下のサブ行 2026-07-06f 案A（位置も統一）: 各足の下に「その足の引けの次足期待度」＝フォームのスロット配置と1:1（_epNextExpAt＝新記録のnextExpN対応・シミュでEPが動いても足に固定）。
    // EP足=「↑EP（×宣言後の到達なら（×））」＋その下に次足期待度（=旧H1期待の縦2段）。実エントリーした足（s.entryOsNo=1〜3）には「実E」を併記。
    var _isE = (s && s.entryOsNo != null && (Number(s.entryOsNo) - 1) === i);
    var sub;
    if (i === epIdx) {
      var _epMark = React.createElement("span", { style: { fontWeight: 800, lineHeight: 1.1, whiteSpace: "nowrap" } },
        React.createElement("span", { style: { color: "#0369A1" } }, "↑EP" + (judge === "x" ? "（×）" : "")),
        _isE ? React.createElement("span", { style: { color: "#C0392B" } }, "/実E") : null);
      var _exEp = _epIsV2(s) ? _expSym(_dispEx[i], _autoEx[i]) : null;
      sub = _exEp
        ? React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 } }, _epMark, _exEp)
        : _epMark;
    } else if (_epIsV2(s)) {
      var _expNode = _expSym(_dispEx[i], _autoEx[i]);
      sub = _isE
        ? React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 } }, _expNode, React.createElement("span", { style: { fontWeight: 800, color: "#C0392B", fontSize: "0.85em" } }, "実E"))
        : _expNode;
    } else sub = (_isE ? React.createElement("span", { style: { fontWeight: 800, color: "#C0392B", fontSize: "0.85em" } }, "実E") : null);
    nodes.push(React.createElement("span", { key: "lg" + i, style: { display: "inline-flex", flexDirection: "column", alignItems: "center" } }, _val, sub));
  });
  var _chain = React.createElement("span", { style: { display: "inline-flex", alignItems: "flex-start", whiteSpace: "nowrap" } }, nodes);
  var _mx = _epOsMaxChainNode(s, alpha);
  if (!_mx) return _chain;
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center" } }, _chain, _mx);
}
// OS4・OS5（4・5本目=hold*/hold2*）が未入力の記録の【未記録】マーク（時間欄の下などに表示）。完備ならnull。
// αシミュでEPが後ろにずれた際に足が足りず深いホールド検証ができない記録を識別する。
function _epIncompleteMark(s) {
  if (!_epIsV2(s)) return null;
  var noOS4 = !(s.holdHighVal != null && s.holdHighVal !== "");
  var noOS5 = !(s.hold2HighVal != null && s.hold2HighVal !== "");
  if (!noOS4 && !noOS5) return null;
  return React.createElement("span", { title: "OS" + [noOS4 ? "4" : null, noOS5 ? "5" : null].filter(Boolean).join("・") + "が未入力（αシミュで足が足りません）",
    style: { display: "inline-block", fontSize: 8, fontWeight: 700, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 3, padding: "0 3px", whiteSpace: "nowrap", lineHeight: 1.4, marginTop: 1 } }, "【未記録】");
}
// E欄: ○=E成立 / ×=×宣言後の到達（見送り・参考） / 未達。旧記録は「未達=_elH2Miss・他は○」。
// E欄の「EPとの差」（2026-06-24・ユーザー選択=OS1〜3の最高高値基準）。
// 差 = OS1〜3の最高高値(_elOsMaxAll・アウトカム盲目) − α（ともに水準線比）。
//   〇/×（EP成立）＝＋（ピークがαを何円超えたか）・未達＝−（あと何円でα到達か）。0は±0。色は↑赤/↓緑（水準線比の慣習）。OSデータ無＝null。
function _epEpDiffNode(s, alpha) {
  if (!s || alpha == null) return null;
  var hi = _elOsMaxAll(s);
  if (hi == null) return null;
  var d = hi - alpha;
  var sign = d > 0 ? "+" : d < 0 ? "−" : "±";
  var col = d > 0 ? "#C0392B" : d < 0 ? "#1E8449" : "#888";
  return React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: col, lineHeight: 1.1, marginTop: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } }, "（" + sign + Math.abs(d) + "）");
}
function _epECell(s, alpha) {
  if (!s || alpha == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var j;
  if (_epIsV2(s)) { var _re = _epResolve(s, alpha); j = _re ? _re.judge : null; }
  else j = s.osVal == null ? null : (_elH2Miss(s, alpha) ? "miss" : "ok");
  var _jn = j === "ok" ? React.createElement("span", { style: { fontWeight: 800, color: "#C0392B", fontSize: 13 } }, "○")
    : j === "x" ? React.createElement("span", { style: { fontWeight: 800, color: "#1E8449", fontSize: 13 } }, "×")
    : j === "miss" ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#7C3AED", whiteSpace: "nowrap" } }, "未達")
    : React.createElement("span", { style: { color: "#ccc" } }, "—");
  var _diff = (j === "ok" || j === "x" || j === "miss") ? _epEpDiffNode(s, alpha) : null;
  if (!_diff) return _jn;
  return React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.05 } }, _jn, _diff);
}
// EP損益欄: 旧「OS値・確定値・α値比値幅・結果/EP損益」を1セルに統合。「高値→確定値/α比/結果・損益」。
// pnlDisp=損益表示ノード(各表のランク付き表示を注入・nullなら内蔵表示)。
function _epPnlCell(s, alpha, cutLine, pnlDisp) {
  if (!s || alpha == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var res = _elDynResult(s, alpha, cutLine);
  var j = _epIsV2(s) ? (function() { var r = _epResolve(s, alpha); return r ? r.judge : null; })() : (s.osVal != null && _elH2Miss(s, alpha) ? "miss" : "ok");
  if (j === "x") {
    // ×見送り: 取引していた場合のEP損益を「×見送り（…）」で参考表示（本合計・（）参考とも算入無し＝表示と×見送り分析専用）。
    // H損益の×（_elHoldStackInner level2）と同じくらい薄く＝全体 opacity 0.6（中身の取引していたら値も淡くする）。
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", color: "#9CA3AF", opacity: 0.6 } },
      React.createElement("span", { key: "xm", style: { fontSize: 12, color: "#1E8449", fontWeight: 800, marginRight: 2 } }, "×"),
      React.createElement("span", { key: "op", style: { color: "#9CA3AF" } }, "（"),
      _epPnlCell(_epAsTraded(s), alpha, cutLine, null),
      React.createElement("span", { key: "cp", style: { color: "#9CA3AF" } }, "）"));
  }
  if (j === "miss" || res === "miss") {
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" } }, _qMissCell());
  }
  var eph = null, epc = null;
  if (_epIsV2(s)) { var _r2 = _epResolve(s, alpha); if (_r2 && _r2.ep) { eph = _r2.ep.h; epc = _r2.ep.c; } }
  else {
    eph = s.osVal != null ? Number(s.osVal) : null;
    epc = s.osConfVal != null ? (s.osConfSign === "-" ? -Number(s.osConfVal) : Number(s.osConfVal)) : null;
  }
  var pnl = _elDynPlanned(s, alpha, cutLine);
  var _resEl = res === "ok" ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700 } }, "○")
    : res === "ng" ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "×")
    : res === "draw" ? React.createElement("span", { style: { color: "#6B7280", fontWeight: 700 } }, "△")
    : React.createElement("span", { style: { color: "#ccc" } }, "—");
  var nodes = [];
  nodes.push(React.createElement("span", { key: "h", style: { fontVariantNumeric: "tabular-nums", fontWeight: 700, color: eph != null ? _vcol(Math.abs(eph), eph >= 0) : "#ccc" } }, eph != null ? ((eph < 0 ? "↓" : "↑") + Math.abs(eph)) : "—"));
  nodes.push(React.createElement("span", { key: "a1", style: { color: "#bbb", margin: "0 1px" } }, "→"));
  nodes.push(_epSignedNode(epc, "c"));
  if (epc != null) {
    var _ew = alpha - epc, _ewAbs = Math.abs(_ew);
    nodes.push(React.createElement("span", { key: "sl1", style: { color: "#ddd", margin: "0 2px" } }, "/"));
    nodes.push(_ew === 0
      ? React.createElement("span", { key: "ew", style: { color: "#888" } }, "α0")
      : React.createElement("span", { key: "ew", style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewAbs, _ew < 0), fontWeight: 700 } }, "α" + (_ew > 0 ? "↓" : "↑") + _ewAbs));
  }
  nodes.push(React.createElement("span", { key: "sl2", style: { color: "#ddd", margin: "0 2px" } }, "/"));
  nodes.push(React.createElement("span", { key: "rs" }, _resEl));
  nodes.push(React.createElement("span", { key: "pn", style: { marginLeft: 2, display: "inline-flex", alignItems: "center" } },
    pnlDisp != null ? pnlDisp
      : (pnl != null
        ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center" } },
            _elHoldGradeBadge(_profitGradeFromPnl(pnl, 1)),
            React.createElement("span", { style: { fontWeight: 700, color: pnl > 0 ? "#C0392B" : pnl < 0 ? "#1E8449" : "#888" } }, (pnl > 0 ? "+" : "") + pnl.toLocaleString() + "円"))
        : React.createElement("span", { style: { color: "#ccc" } }, "—"))));
  if (_elPlanIsStop(s, alpha, cutLine)) nodes.push(React.createElement("span", { key: "cap" }, _elCapNote(cutLine)));
  var _epInner = React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, nodes);
  if (_epIsTriEntry(s, alpha)) {
    // EP-OS△（△の確信度でエントリー）→ （）でくくる（参考＝合計の（）内・（）外は0）。文字の薄さは○と同じ（薄くしない）。
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
      React.createElement("span", { key: "ts", style: { color: "#B45309", fontWeight: 800, marginRight: 1 } }, "△"),
      React.createElement("span", { key: "td", style: { color: "#6B3A0F", fontWeight: 900 } }, "（"),
      _epInner,
      React.createElement("span", { key: "tc", style: { color: "#6B3A0F", fontWeight: 900 } }, "）"));
  }
  return _epInner;
}
// 成立率の到達判定: v2=3本以内にα値到達、旧記録=OS値≥α。
function _epReachedAt(s, alpha) {
  if (s == null || alpha == null) return false;
  if (_epIsV2(s)) { var _rr = _epResolve(s, alpha); return !!(_rr && _rr.epIdx >= 0); }
  return s.osVal != null && Number(s.osVal) >= alpha;
}
// === 表共通の表示・集計ヘルパー（各表に重複していたローカル実装を統合 2026-06-12）===
// ランクバッジ18px（旧: _esBadge/_trBadge/_pbBadge）
function _elGradeBadge18(grade) {
  if (!grade) return null;
  var gs = _GRADE_STYLE[grade] || _GRADE_STYLE.Z;
  return React.createElement("span", { title: grade,
    style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 18, height: 18, borderRadius: "50%",
      background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
      fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 } }, grade);
}
// 固定幅レーン（旧: _esLane/_trLane/_lane）
function _elLane(child, w, align) { return React.createElement("span", { style: { display: "inline-flex", width: w, minWidth: w, justifyContent: align || "center", alignItems: "center", flexShrink: 0 } }, child); }
function _elPnlColor(v) { return v == null ? "#ccc" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; }
function _elPnlFmt(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; }
// ランク+金額のレーン表示（旧: _esRPnlDisp/_trRPnlDisp/_rPnlDisp。valW=金額レーン幅・showZ=Zも表示）
function _elRPnlDispW(v, grade, valW, showZ) {
  var badge = (grade && (grade !== "Z" || showZ)) ? _elGradeBadge18(grade) : null;
  if (v == null && badge == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var val = v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—")
    : React.createElement("span", { style: { fontWeight: 600, color: _elPnlColor(v) } }, _elPnlFmt(v));
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
    _elLane(badge, 22), _elLane(val, valW || 72, "flex-start"));
}
// 合計表示: 全体値のみ（無ければAB値）にランクを付けて表示（旧: _esRPnlDispABAll/_trRPnlDispABAll/_rPnlDispABAllPb/_rPnlDispABAllSv）
function _elRPnlDispABAll(abV, allV, abGrade, allGrade) {
  var _v = allV != null ? allV : abV;
  var _g = allGrade || abGrade;
  if (_v == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
    _g ? _elGradeBadge18(_g) : null,
    React.createElement("span", { style: { fontWeight: 600, color: _elPnlColor(_v) } }, _elPnlFmt(_v)));
}
// 損益変化(○yes/△mid/ーnone/×no)の自動導出（旧: _dynHoldProfitES/_dynHPtr等）。hp=H損益・pp=EP損益・res=EP結果。
function _elDeriveHoldProfit(hp, pp, res, fallback) {
  if (hp == null) return fallback;
  if (res === "miss" || res === "draw") return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
  if (pp == null) return fallback;
  if (pp > 0 && hp > 0) return hp > pp ? "yes" : hp < pp ? "mid" : "none";
  if (pp < 0 && hp < 0) return "no";
  if (pp > 0 && hp < 0) return "no";
  if (pp < 0 && hp > 0) return "yes";
  if (hp === 0) return "none";
  return fallback;
}
// ===== #2 時間かぶりの合計除外 2026-07-07 [[project_scalping_total_pnl_system #2]] =====
// かぶり＝同一日・全銘柄のv2算入記録を時刻昇順に並べ、隣接が5分以内(≤5分)なら「上限2個の貪欲ペアリング」でペア化
// （例 9:31/9:34/9:39/9:42/9:47 → {9:31,9:34}{9:39,9:42}{9:47}）。残す方の選定 2026-07-08 ユーザー指示:
// 「時刻が異なれば早い方(=ペアの先頭)を残す（損益に依らず＝リアルタイムで先に入った方）／同時刻(分が同じ)のときだけ（）外最終損益
// (_elHold2TotPartsのmain・採用α/採用損切り)が小さい方を残す（同額は先を残す）」＝残さない方（遅い方／同時刻なら損益大）を合計額から除外。どちらかmain無しのペアは除外なし・単独記録は除外なし。
// 母数＝v2(_epIsV2)かつ算入(_elInclTotal)・時刻無しは対象外。返り値 {excluded:{key:1}, marked:{key:1}}＝除外keyと「※被り有」（残した側）key。
// data.charts参照でmemo化（保存でchartsの識別が変わると再計算）。配線は「表示総計」のみ＝α総当たり/理想α系(_elIdealAlphaV2/_elBaseAlphaEval等)には付けない。
// scopeStock を渡すと「その銘柄の記録だけ」でペアリング＝同一銘柄内の被りだけ除外（銘柄別のみのビュー用 2026-07-08）。
// 省略/null＝全銘柄横断（従来どおり＝本日/今週/検索日カード/ホーム月次/カレンダー等の全銘柄合算ビュー）。scopeごとにmemo。
var _elCollMemo = {};
function _elCollKey(stock, date, s) { return stock + "|" + date + "|" + ((s && s.id != null && s.id !== "") ? String(s.id) : (((s && s.time) || "") + "|" + ((s && (s.tag || "")) || ""))); }
function _elCollisionExcludedSet(data, scopeStock) {
  var charts = (data && data.charts) || {};
  var _mk = scopeStock || "";
  var _m = _elCollMemo[_mk];
  if (_m && _m.charts === charts) return _m.set;
  var _toMin = function(t) { if (!t) return null; var m = String(t).match(/(\d{1,2})\s*[:：]\s*(\d{1,2})/); return m ? (Number(m[1]) * 60 + Number(m[2])) : null; };
  var byDay = {};
  Object.keys(charts).forEach(function(ck) {
    var c = charts[ck];
    if (!c || !Array.isArray(c.signals)) return;
    var idx = ck.lastIndexOf("_");
    if (idx < 0) return;
    var stock = ck.slice(0, idx), date = ck.slice(idx + 1);
    if (scopeStock && stock !== scopeStock) return;   // 銘柄別ビュー: 自銘柄以外は被り母数に入れない＝別銘柄との時間かぶりでは除外しない 2026-07-08
    var cut = (c.cutLine != null) ? Number(c.cutLine) : 10;
    c.signals.forEach(function(sig) {
      var s = _compatSignal(sig);
      if (!_epIsV2(s) || !_elInclTotal(s)) return;
      var mn = _toMin(s.time);
      if (mn == null) return;
      (byDay[date] = byDay[date] || []).push({ key: _elCollKey(stock, date, s), stock: stock, time: s.time || "", min: mn, main: _elHold2TotParts(s, _epOwnAlpha(s), cut).main });
    });
  });
  var excluded = {}, marked = {}, info = {};
  Object.keys(byDay).forEach(function(d) {
    var arr = byDay[d].sort(function(a, b) { return (a.min - b.min) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0); });
    var i = 0;
    while (i < arr.length) {
      if (i + 1 < arr.length && (arr[i + 1].min - arr[i].min) <= 5) {
        var A = arr[i], B = arr[i + 1];   // arrはmin昇順＝Aが早い方（同時刻ならkey順でA先）
        if (A.main != null && B.main != null) {
          // 残す方の選定 2026-07-08 ユーザー指示: 時刻が異なれば「早い方(A)」を残す（損益に依らず＝リアルタイムで先に入った方）。
          // 同時刻（分が同じ＝順序が付けられない）ときだけ「（）外損益が小さい方」を残す（同額はA=先を残す）。
          var drop, keep;
          if (A.min === B.min) { drop = (B.main >= A.main) ? B : A; keep = (drop === B) ? A : B; }
          else { drop = B; keep = A; }
          excluded[drop.key] = 1;
          marked[keep.key] = 1;
          info[drop.key] = { role: "drop", own: drop.main, oStock: keep.stock, oTime: keep.time, oMain: keep.main };
          info[keep.key] = { role: "keep", own: keep.main, oStock: drop.stock, oTime: drop.time, oMain: drop.main };
        }
        i += 2;
      } else {
        i++;
      }
    }
  });
  var _set = { excluded: excluded, marked: marked, info: info };
  _elCollMemo[_mk] = { charts: charts, set: _set };
  return _set;
}
// r={stock,date,signal} が除外対象（遅い方／同時刻なら損益が大きい方＝合計額に入れない）か／残した側（早い方・※被り有マーク）か。
// 第3引数 scope（銘柄名）を渡すと同一銘柄内のみの被り除外を参照＝銘柄別ビュー用。省略時は全銘柄横断（従来）2026-07-08。
function _elCollExcluded(data, r, scope) { return !!(r && r.signal && _elCollisionExcludedSet(data, scope).excluded[_elCollKey(r.stock, r.date, r.signal)]); }
function _elCollMarked(data, r, scope) { return !!(r && r.signal && _elCollisionExcludedSet(data, scope).marked[_elCollKey(r.stock, r.date, r.signal)]); }
// signal直渡し版（recラッパーが無いループ用: カレンダー月次/日別ランク・検索日カード・早見表等）。scope省略=全銘柄横断。
function _elCollExcludedSig(data, stock, date, s, scope) { return !!(s && _elCollisionExcludedSet(data, scope).excluded[_elCollKey(stock, date, s)]); }
// recs配列中の「被り除外」該当件数（KPI等の可視化用）。scope省略=全銘柄横断。
function _elCollExclCountRecs(data, recs, scope) { var n = 0; (recs || []).forEach(function(r) { if (_elCollExcluded(data, r, scope)) n++; }); return n; }
// 明細行用の時間かぶり小バッジ（残した側＝早い方「※被り有」・除外された側＝遅い方「被り除外」灰色。対象外はnull）2026-07-07両側可視化→07-08 早い方を残す方式に変更。
function _elCollMarkNode(data, r, scope) {
  if (_elCollMarked(data, r, scope)) {
    return React.createElement("div", { title: "時間被り: 同一日で5分以内の別記録とペア。早い方（同時刻なら（）外最終損益が小さい方）だけを合計に算入し、もう片方は除外。この記録＝残した側（件数は両方残る）",
      style: { marginTop: 1, fontSize: 8, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 3, padding: "0 3px", display: "inline-block", whiteSpace: "nowrap", lineHeight: 1.5 } }, "※被り有");
  }
  if (_elCollExcluded(data, r, scope)) {
    return React.createElement("div", { title: "時間被り: 同一日で5分以内の別記録とペア。この記録は除外側＝遅い方（同時刻なら（）外最終損益が大きい方）＝損益は合計額に入れない（件数は残る）",
      style: { marginTop: 1, fontSize: 8, fontWeight: 800, color: "#6D28D9", background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 3, padding: "0 3px", display: "inline-block", whiteSpace: "nowrap", lineHeight: 1.5 } }, "被り除外");
  }
  return null;
}
// EntryLogCard用: 被りペアの相手（銘柄/時刻/（）外損益）を1行で示す。dataが無い呼び出し（app-02/04のα直指定カード）はnull。
function _elCollPairNode(data, r, scope) {
  if (!data || !r || !r.signal) return null;
  var inf = _elCollisionExcludedSet(data, scope).info[_elCollKey(r.stock, r.date, r.signal)];
  if (!inf) return null;
  var isKeep = inf.role === "keep";
  return React.createElement("div", { style: { fontSize: 9, fontWeight: 600, color: isKeep ? "#B45309" : "#64748B", background: isKeep ? "#FFFBEB" : "#F8FAFC", border: "1px solid " + (isKeep ? "#FCD34D" : "#E2E8F0"), borderRadius: 4, padding: "2px 6px", marginBottom: 6, lineHeight: 1.4 } },
    (isKeep ? "※被り有: " : "被り除外: ") + "同日" + (inf.oTime || "—") + "の" + inf.oStock + "（" + _elPnlFmt(inf.oMain) + "）とペア＝" +
    (isKeep ? "遅い方（相手・同時刻なら損益が大きい方）を合計から除外し、この記録（" + _elPnlFmt(inf.own) + "・早い方）を算入" : "この記録（" + _elPnlFmt(inf.own) + "・遅い方／同時刻なら損益が大きい方）は合計額に入れない（件数は残る）"));
}
// 合計行の共通集計: EP損益(planCap/AB込み)・H1(_elHold1TotParts)・H2(_elHold2TotParts)・実現損益。
// get={signal,alpha,cut,real?,norm?,excluded?}。norm=値の正規化（株数→100株換算等・省略時そのまま）。excluded=時間かぶり除外（表示総計のみ配線・trueの記録は金額もCntも全スキップ）。
function _elTotAccum(items, get) {
  var nm = get.norm || function(it, v) { return v; };
  var t = { real: null, realCnt: 0, plan: null, planCnt: 0, planCap: null, planStop: false,
    planAB: null, planABCnt: 0, planRef: null, planRefCnt: 0, holdPlanCap: null, holdCnt: 0, holdAB: null, holdABCnt: 0,
    holdRef: null, holdRefCnt: 0, hold2: null, hold2Cnt: 0, hold2Ref: null, hold2RefCnt: 0,
    holdRaw: null, holdPlanStopDiff: false };
  (items || []).forEach(function(it) {
    var s = get.signal(it), a = get.alpha(it), c = get.cut(it);
    if (!s) return;
    if (get.excluded && get.excluded(it)) return;
    var isAB = s.difficulty === "A" || s.difficulty === "B";
    if (get.real) { var rv = get.real(it); if (rv != null) { t.real = (t.real || 0) + rv; t.realCnt++; } }
    // EP×（×見送り）→ EP/H1/H2とも完全に算入無し（参考にも入れない）。
    if (_epIsXSkip(s, a)) return;
    var pp = _elDynPlanned(s, a, c); var ppN = pp != null ? nm(it, pp) : null;
    if (ppN != null) {
      if (_epIsTriEntry(s, a)) {
        // EP-OS△（△の確信度でエントリー）→ EP損益は（）内（参考）のみ・（）外は0（H1/H2の△と同様）。
        t.planRef = (t.planRef || 0) + ppN; t.planRefCnt++;
      } else {
        t.plan = (t.plan || 0) + ppN; t.planCnt++;
        var ps = _elPlanIsStop(s, a, c); if (ps) t.planStop = true;
        t.planCap = (t.planCap || 0) + (ps ? _elCapLossYen(c) : ppN);
        if (isAB) { t.planAB = (t.planAB || 0) + ppN; t.planABCnt++; }
      }
    }
    // H1: 各表・早見表と同一基準（想定損切り→想定額キャップ・×/△/損切り済→想定額フォールバック・参考はキャップ後差分＝差0は算入しない。×は参考にも入れない）
    var hv = _elDynHold(s, a, c);
    if (hv != null) {
      var hvN = nm(it, hv);
      t.holdRaw = (t.holdRaw || 0) + hvN;
      var ps2 = _elPlanIsStop(s, a, c);
      var hCap = (ps2 && ppN != null) ? ppN : hvN;
      var _hx1 = _elH1ExpAt(s, a);   // H1保有ガバナンス＝次足期待度（採用αでは=s.holdExp）2026-07-06e
      if (_epIsTriEntry(s, a)) {
        // EP△（△確信度エントリー）→ H1も（）外0。○/△/損切り済は保有額を（）内（参考）へ。×/未設定は完全除外（1段下0を継承＝参考にも入れない）。
        if (_hx1 && _hx1 !== "×") { t.holdRef = (t.holdRef || 0) + hCap; t.holdRefCnt++; }
      } else {
        var _fbH = (_hx1 !== "○");  // ○以外（×/△/損切り済/未設定）は想定額へフォールバック。未設定=×扱い
        var m1 = (_fbH && ppN != null) ? ppN : hCap;
        t.holdPlanCap = (t.holdPlanCap || 0) + m1; t.holdCnt++;
        if (isAB) { t.holdAB = (t.holdAB || 0) + m1; t.holdABCnt++; }
        if ((_hx1 === "△" || _hx1 === "損切り済") && ppN != null && (hCap - ppN) !== 0) { t.holdRef = (t.holdRef || 0) + (hCap - ppN); t.holdRefCnt++; }  // △/損切り済のみ参考（×/未設定は無し）
        if (ps2 && ppN != null && hvN !== ppN) t.holdPlanStopDiff = true;
      }
    }
    var t2 = _elHold2TotParts(s, a, c);
    if (t2.main != null) { t.hold2 = (t.hold2 || 0) + nm(it, t2.main); t.hold2Cnt++; }
    if (t2.ref != null) { t.hold2Ref = (t.hold2Ref || 0) + nm(it, t2.ref); t.hold2RefCnt++; }
  });
  return t;
}
// 詳細損益セル（EP/H1/H2縦積み・（）外main＋（）内=△参考）。本日/今週/銘柄別今週の3表で共用＝_elTotAccumで全表と同一基準。recsMは被り除外後の記録・aiAlpha(r)/aiCut(r)=採用α/損切り・badgeFn(grade)=グレードバッジ・allMiss=全E未達でQ0。H２行＝最終損益列と同値。2026-07-10。
function _elDetailPnlStackNode(recsM, aiAlpha, aiCut, badgeFn, allMiss) {
  if (!recsM || !recsM.length) return React.createElement("span", { style: { color: "#ccc" } }, "—");
  var t = _elTotAccum(recsM, { signal: function(r) { return r.signal; }, alpha: aiAlpha, cut: aiCut });
  // allMissFirst=EP行のみ（旧EPセルはallMiss時に計画0でもQ0優先）。H1/H2は「値があれば値・無ければ参考/Q0/—」＝旧H1・最終セルと完全一致＝詳細のH2は最終損益列と常に同値。
  var _line = function(lbl, main, cnt, ref, refCnt, mid, allMissFirst) {
    var body;
    if (allMissFirst && allMiss) {
      body = _qZeroCell();
    } else if (main != null) {
      var g = _profitGradeFromPnl(main, cnt);
      body = React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
        g ? badgeFn(g) : null,
        React.createElement("span", { style: { fontWeight: 700, color: main > 0 ? "#C0392B" : main < 0 ? "#1E8449" : "#888" } }, (main > 0 ? "+" : "") + main.toLocaleString() + "円"),
        _elHold2RefSuffix(main, ref, refCnt));
    } else if (refCnt > 0) {
      body = _elHold2RefSuffix(0, ref, refCnt);
    } else {
      body = allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—");
    }
    return React.createElement("span", { style: Object.assign({ display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap", padding: "1px 0" }, mid ? { borderTop: "1px solid #e0d8c8", borderBottom: "1px solid #e0d8c8" } : {}) },
      React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, minWidth: 26, textAlign: "left", flexShrink: 0 } }, lbl), body);
  };
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "stretch", lineHeight: 1.25, fontVariantNumeric: "tabular-nums" } },
    _line("EP：", (t.planCnt > 0 ? t.plan : null), t.planCnt, t.planRef, t.planRefCnt, false, true),
    _line("H１：", (t.holdCnt > 0 ? t.holdPlanCap : null), t.holdCnt, t.holdRef, t.holdRefCnt, true, false),
    _line("H２：", (t.hold2Cnt > 0 ? t.hold2 : null), t.hold2Cnt, t.hold2Ref, t.hold2RefCnt, false, false));
}
// 理想α値（EP起算v2/v3対応・完全刷新 2026-06-13）: EP/H1/H2の各指標について、α候補(0〜50円1刻み)を
// 総当たりし合計が最大になるαを返す。各候補で _elTotAccum を回す＝合計行(EP損益/H1/H2)と完全一致。
// records=[{signal,...}]・cutFn(r)→損切り値。返り値 {ep,h1,h2,n}・各={maxA,maxSum,tgtA,tgtSum}。
//   maxA=その指標の合計が最大のα・tgtA=合計が目標額(既定2500円)以上になる最小のα(無ければmaxへフォールバック)。
function _elIdealAlphaV2(records, cutFn, target) {
  var tgt = target != null ? target : 2500;
  var _mk = function() { return { maxA: null, maxSum: null, tgtA: null, tgtSum: null }; };
  var R = { ep: _mk(), h1: _mk(), h2: _mk(), n: (records || []).length };
  var _cf = cutFn || function() { return 10; };
  _EL_IDEAL_ALPHAS.forEach(function(a) {
    var t = _elTotAccum(records, { signal: function(r) { return r.signal; }, alpha: function() { return a; }, cut: _cf });
    var vals = { ep: (t.planCnt > 0 ? t.plan : null), h1: (t.holdCnt > 0 ? t.holdPlanCap : null), h2: (t.hold2Cnt > 0 ? t.hold2 : null) };
    ["ep", "h1", "h2"].forEach(function(k) {
      var v = vals[k]; if (v == null) return;
      var p = R[k];
      if (p.maxSum == null || v > p.maxSum) { p.maxSum = v; p.maxA = a; }
      if (p.tgtA == null && v >= tgt) { p.tgtA = a; p.tgtSum = v; }
    });
  });
  ["ep", "h1", "h2"].forEach(function(k) { var p = R[k]; if (p.tgtA == null && p.maxA != null) { p.tgtA = p.maxA; p.tgtSum = p.maxSum; } });
  return R;
}
// 理想α表（銘柄別など）: groups=[{label,recs}]・cutFn(r)→損切り値。EP/H1/H2列×各「最大α/目標α＋損益」を表示。
function _elIdealAlphaTableV2(groups, cutFn, target) {
  var _fa = function(a) { return a == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: "#0369A1" } }, a + "円"); };
  var _fp = function(v) { return v == null ? React.createElement("span", { style: { color: "#bbb", fontSize: 9 } }, "—") : React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: _elPnlColor(v) } }, _elPnlFmt(v)); };
  var _cell = function(o) {
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.35, whiteSpace: "nowrap" } },
      React.createElement("div", null, React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", marginRight: 2, fontWeight: 700 } }, "最大"), _fa(o.maxA), React.createElement("span", { style: { marginLeft: 3 } }, _fp(o.maxSum))),
      React.createElement("div", null, React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", marginRight: 2, fontWeight: 700 } }, "目標"), _fa(o.tgtA), React.createElement("span", { style: { marginLeft: 3 } }, _fp(o.tgtSum))));
  };
  var _th = function(t) { return React.createElement("th", { style: { padding: "3px 6px", fontWeight: 700, color: "#0369A1", fontSize: 10, borderBottom: "2px solid #BAE6FD", textAlign: "center", whiteSpace: "nowrap" } }, t); };
  var rows = (groups || []).filter(function(g) { return g.recs && g.recs.length; }).map(function(g, gi) {
    var R = _elIdealAlphaV2(g.recs, cutFn, target);
    return React.createElement("tr", { key: gi, style: { borderBottom: "1px solid #dbeafe" } },
      React.createElement("td", { style: { padding: "3px 8px", fontWeight: 700, color: "#9A3412", fontSize: 11, whiteSpace: "nowrap" } }, g.label),
      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", borderLeft: "1px solid #dbeafe" } }, _cell(R.ep)),
      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", borderLeft: "1px solid #dbeafe" } }, _cell(R.h1)),
      React.createElement("td", { style: { padding: "3px 6px", textAlign: "center", borderLeft: "1px solid #dbeafe" } }, _cell(R.h2)));
  });
  if (!rows.length) return React.createElement("div", { style: { fontSize: 11, color: "#aaa", padding: "4px 0" } }, "対象記録なし");
  return React.createElement("div", { style: { overflowX: "auto" } },
    React.createElement("table", { style: { borderCollapse: "collapse", fontSize: 11, width: "100%" } },
      React.createElement("thead", null, React.createElement("tr", null, _th("銘柄"), _th("EP理想α"), _th("H1理想α"), _th("H2理想α"))),
      React.createElement("tbody", null, rows)));
}
// Hold2期待度（○のみ本合計（）外・△は（）参考・×と未設定は除外。2026-06-16: 参考役は△へ移管）
function _elH2ExpCounts(s) { return s.hold2Exp; }
function _elHoldGradeBadge(g) {
  if (!g || g === "Z") return null;
  var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
  return React.createElement("span", { key: "g", style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 13, height: 13, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 1, flexShrink: 0 } }, g);
}
// EP損益が損切りの場合のH損益セル: 「想定額（H額）」を両方ランク(grade)付きで表示（左=EP損益額そのまま・括弧内=H1/H2が損切りしていなかった場合の損益）。
function _elHoldStopPnlNode(planVal, holdPnl, key) {
  var _amt = function(v, k) {
    return React.createElement("span", { key: k, style: { display: "inline-flex", alignItems: "center" } },
      _elHoldGradeBadge(_profitGradeFromPnl(v, 1)),
      React.createElement("span", { key: "y", style: { color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" } }, v.toLocaleString() + "円"));
  };
  return React.createElement("span", { key: key || "hp", style: { display: "inline-flex", alignItems: "center", fontVariantNumeric: "tabular-nums", fontWeight: 700, whiteSpace: "nowrap" } },
    _amt(planVal, "pv"),
    React.createElement("span", { key: "op", style: { color: "#888" } }, "（"),
    _amt(holdPnl, "hv"),
    React.createElement("span", { key: "cp", style: { color: "#888" } }, "）"));
}
// 損切り済みラベル「ー（損切り済）」（縦積み表では明細列に中央寄せで表示）。
function _elStopDoneLabel(key) {
  return React.createElement("span", { key: key || "sdl", style: { color: "#888", fontWeight: 700, whiteSpace: "nowrap" } }, "ー（損切り済）");
}
// 損切り行の明細「（高値→確定値/α値比）」を薄く(opacity .6)インライン描画。hs=対象signal(H2は_h2sig(s)を渡す)。中身無→null。
function _elHoldStopDetail(hs, alpha) {
  if (!hs) return null;
  var nodes = [];
  if (hs.holdHighVal != null) nodes.push(React.createElement("span", { key: "hh", style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdHighVal, hs.holdHighSign === "-"), fontWeight: 700 } }, (hs.holdHighSign === "+" ? "↓" : hs.holdHighSign === "-" ? "↑" : "") + hs.holdHighVal));
  if (hs.holdWidth != null) {
    nodes.push(React.createElement("span", { key: "a1", style: { color: "#ccc", margin: "0 1px" } }, "→"));
    nodes.push(React.createElement("span", { key: "hw", style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdWidth, hs.holdWidthSign === "-"), fontWeight: 700 } }, (hs.holdWidthSign === "-" ? "↑" : hs.holdWidthSign === "+" ? "↓" : "↕") + hs.holdWidth));
  }
  if (alpha != null && hs.holdWidth != null) {
    var _hcf = hs.holdWidthSign === "-" ? Number(hs.holdWidth) : hs.holdWidthSign === "+" ? -Number(hs.holdWidth) : 0;
    var _ewH = alpha - _hcf, _ewHAbs = Math.abs(_ewH);
    nodes.push(React.createElement("span", { key: "a2", style: { color: "#ccc", margin: "0 1px" } }, "/"));
    nodes.push(_ewH === 0 ? React.createElement("span", { key: "aw", style: { color: "#888" } }, "α0") : React.createElement("span", { key: "aw", style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewHAbs, _ewH < 0), fontWeight: 700 } }, "α" + (_ewH > 0 ? "↓" : "↑") + _ewHAbs));
  }
  if (!nodes.length) return null;
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "nowrap", opacity: 0.6, fontSize: 9 } },
    React.createElement("span", { key: "op", style: { color: "#888" } }, "（"), nodes, React.createElement("span", { key: "cp", style: { color: "#888" } }, "）"));
}
// 損切り額ノード「ランク 損切額 損」（損益列。amount=損切り額・負）。損益変化を表す「損」(丸囲みなし)を損益額の右に配置。
function _elHoldStopAmtNode(amount, key) {
  return React.createElement("span", { key: key || "sa", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", fontWeight: 700 } },
    _elHoldGradeBadge(_profitGradeFromPnl(amount, 1)),
    React.createElement("span", { key: "y", style: { color: amount > 0 ? "#C0392B" : amount < 0 ? "#1E8449" : "#888" } }, amount.toLocaleString() + "円"),
    React.createElement("span", { key: "x", style: { color: "#333", fontWeight: 800, marginLeft: 3 } }, "損"));
}
// EP損益またはH1で損切り済みのインラインセル表示「損切 （高値→確定値/α値比） / ランク 損切額 損」。
// amount=損切り額(=H1結果損益・負)。hs/alphaを渡すと明細を薄く（）で表示（無ければ「（ー）」）。
function _elHoldStopDoneNode(amount, key, hs, alpha) {
  var _detail = (hs && alpha != null) ? _elHoldStopDetail(hs, alpha) : null;
  return React.createElement("span", { key: key || "sd", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontSize: 11 } },
    React.createElement("span", { key: "lbl", style: { color: "#888", fontWeight: 700, marginRight: 2 } }, "損切"),
    _detail != null ? _detail : React.createElement("span", { key: "dash", style: { color: "#888", opacity: 0.6 } }, "（ー）"),
    React.createElement("span", { key: "sep", style: { color: "#ccc", margin: "0 2px" } }, "/"),
    _elHoldStopAmtNode(amount, "a"));
}
// 統合Hセル: 「H高値 → H確定値 / α値比H値幅 / 勝敗・結果損益」を1つのインライン要素で返す。
// isH2=true なら hold2* を使う（高値/確定値/α値比/損益はH2、EP損益・結果はエントリー共通）。
function _elHoldFlow(s, alpha, cutLine, isH2, noWrap) {
  if (_epIsXSkip(s, alpha)) s = _epAsTraded(s);  // ×見送り→取引していた場合の値を参考表示（Q—にしない）
  var hs = _epHoldView(s, alpha, isH2);
  var _h2missFlow = isH2 && _elH2Miss(s, alpha);  // 想定もH1もE基準未達 → 損益をQ ー円に固定（高値/確定値/α値比は通常表示）。
  // 損切り済み（H2: 想定orH1で損切り／H1: EP損益の時点で損切り）は明細を出さず「ー（ランク 損切額）※損切り済」のみ。
  if (alpha != null) {
    var _psFlow = _elPlanIsStop(s, alpha, cutLine);
    if (isH2 ? _elHoldIsStop(s, alpha, cutLine) : _psFlow) {
      var _samtFlow = _psFlow ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
      if (_samtFlow != null) return _elHoldStopDoneNode(_samtFlow, null, hs, alpha);
    }
  }
  var _sep = function(ch) { return React.createElement("span", { key: "s" + ch + Math.round(alpha == null ? 0 : 0), style: { color: "#ccc", margin: "0 2px" } }, ch); };
  var nodes = [];
  if (hs.holdHighVal != null) {
    nodes.push(React.createElement("span", { key: "hh", style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdHighVal, hs.holdHighSign === "-"), fontWeight: 700 } },
      (hs.holdHighSign === "+" ? "↓" : hs.holdHighSign === "-" ? "↑" : "") + hs.holdHighVal));
  }
  if (hs.holdWidth != null) {
    nodes.push(React.createElement("span", { key: "a1", style: { color: "#ccc", margin: "0 2px" } }, "→"));
    nodes.push(React.createElement("span", { key: "hw", style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdWidth, hs.holdWidthSign === "-"), fontWeight: 700 } },
      (hs.holdWidthSign === "-" ? "↑" : hs.holdWidthSign === "+" ? "↓" : "↕") + hs.holdWidth));
  }
  if (alpha != null && hs.holdWidth != null) {
    var _hcf = hs.holdWidthSign === "-" ? Number(hs.holdWidth) : hs.holdWidthSign === "+" ? -Number(hs.holdWidth) : 0;
    var _ewH = alpha - _hcf;
    var _ewHAbs = Math.abs(_ewH);
    nodes.push(React.createElement("span", { key: "a2", style: { color: "#ccc", margin: "0 2px" } }, "/"));
    nodes.push(_ewH === 0
      ? React.createElement("span", { key: "aw", style: { color: "#888" } }, "α0")
      : React.createElement("span", { key: "aw", style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewHAbs, _ewH < 0), fontWeight: 700 } }, "α" + (_ewH > 0 ? "↓" : "↑") + _ewHAbs));
  }
  var holdPnl = _h2missFlow ? null : ((alpha != null) ? (isH2 ? _elDynHold2(s, alpha, cutLine) : _elDynHold(hs, alpha, cutLine)) : _elSignedVal(hs.holdPnl, hs.holdPnlSign));
  var planPnl = (alpha != null) ? _elDynPlanned(s, alpha, cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
  var planStop = (alpha != null) && _elPlanIsStop(s, alpha, cutLine);
  var res = _h2missFlow ? "miss" : ((alpha != null) ? _elDynResult(s, alpha, cutLine) : s.result);
  if (holdPnl != null) {
    var hp = holdPnl;
    // H2の損益変化はH1の結果損益との比較。H1は従来どおりEP損益との比較。
    var pp = isH2 ? ((alpha != null) ? _elDynHold(s, alpha, cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign)) : planPnl;
    var dynHP = (function() {
      if (hp == null) return hs.holdProfit;
      if (!isH2 && (res === "miss" || res === "draw")) return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
      if (pp == null) return isH2 ? (hp > 0 ? "yes" : hp < 0 ? "no" : "none") : hs.holdProfit;
      if (hp === 0) return pp < 0 ? "yes" : pp > 0 ? "mid" : "none";
      if (pp > 0 && hp > 0) return hp > pp ? "yes" : hp < pp ? "mid" : "none";
      if (pp < 0 && hp < 0) return "no";
      if (pp > 0 && hp < 0) return "no";
      if (pp < 0 && hp > 0) return "yes";
      return hs.holdProfit;
    })();
    var symMap = { yes: ["○", "#1E8449"], mid: ["△", "#B45309"], none: ["ー", "#888"], no: ["×", "#C0392B"] };
    var sym = symMap[dynHP];
    // 損切り時の左側＝結果損益。H1は想定損切りのみ想定額。H2は損切り(想定orH1自身)ならH1の結果損益(想定損切り=想定額/H1損切り=_elDynHold)、括弧内はH2のNoStop値(holdPnl)。
    var _stopLeft = isH2
      ? ((alpha != null && _elHoldIsStop(s, alpha, cutLine)) ? (planStop ? planPnl : _elDynHold(s, alpha, cutLine)) : null)
      : (planStop ? planPnl : null);
    nodes.push(React.createElement("span", { key: "a3", style: { color: "#ccc", margin: "0 2px" } }, "/"));
    nodes.push((_stopLeft != null && holdPnl != null)
      ? _elHoldStopPnlNode(_stopLeft, holdPnl, "hp")
      : React.createElement("span", { key: "hp", style: { display: "inline-flex", alignItems: "center", fontVariantNumeric: "tabular-nums", fontWeight: 700, whiteSpace: "nowrap" } },
        _elHoldGradeBadge(_profitGradeFromPnl(holdPnl, 1)),
        React.createElement("span", { key: "yen", style: { color: holdPnl > 0 ? "#C0392B" : holdPnl < 0 ? "#1E8449" : "#888" } }, holdPnl.toLocaleString() + "円"),
        sym ? React.createElement("span", { key: "sym", style: { color: sym[1], marginLeft: 2, fontWeight: 800 } }, sym[0]) : null
      ));
  } else if (res === "miss") {
    if (nodes.length) nodes.push(React.createElement("span", { key: "a3", style: { color: "#ccc", margin: "0 2px" } }, "/"));
    nodes.push(React.createElement("span", { key: "hp" }, _qZeroCell()));
  }
  if (nodes.length === 0) return React.createElement("span", { style: { color: "#ddd" } }, "—");
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: noWrap ? "nowrap" : "wrap", justifyContent: "center", fontSize: 11, lineHeight: 1.5, whiteSpace: noWrap ? "nowrap" : "normal" } }, nodes);
}
// H2期待度セル【2026-06-16】: ○→記号＋統合表示（本算入）、△/損切り済→「△（統合表示）」（）でくくる（文字は薄くしない）、×・H1撤退/未設定→（）＋薄く（除外）、未選択→空欄
function _elHold2Cell(s, alpha, cutLine) {
  if (_epIsXSkip(s, alpha)) s = _epAsTraded(s);  // ×見送り→取引していた場合の値を参考表示（Q—にしない）
  if (_elH2Miss(s, alpha)) {
    // 想定もH1もE基準未達 → H2期待度は「ー」表示・損益はQ ー円（_elHoldFlowが_elH2Miss時に固定）。高値/確定値/α値比はH1と同形式。
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "nowrap", fontSize: 11, whiteSpace: "nowrap" } },
      React.createElement("span", { key: "sym", title: "H１までE基準未達", style: { color: "#888", fontWeight: 800, marginRight: 3 } }, "ー"),
      _elHoldFlow(s, alpha, cutLine, true, true));
  }
  // 想定orH1で損切り済み → 期待度・明細を出さず「ー（ランク 損切額）※損切り済」のみ。
  if (alpha != null && _elHoldIsStop(s, alpha, cutLine)) {
    var _samtCell = _elPlanIsStop(s, alpha, cutLine) ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
    if (_samtCell != null) return _elHoldStopDoneNode(_samtCell, null, _epHoldView(s, alpha, true), alpha);
  }
  var exp = _elH2ExpAt(s, alpha);   // 次足期待度（採用αでは=s.hold2Exp）2026-07-06e
  if (!exp) return React.createElement("span", { style: { color: "#ddd" } }, "—");
  // 【2026-06-16 参考役は△へ移管】H1期待度(holdExp)が×/損切り済/未設定（=H1撤退）→H2は最薄（非算入）。
  var _hx1c = _elH1ExpAt(s, alpha); var _h1Exited = (_hx1c === "×" || _hx1c === "損切り済" || !_hx1c);   // 2026-07-06e
  if (exp === "×" || _h1Exited) {
    // ×・H1撤退・未設定: （）でくくり、文字も薄く（これまで通り＝本合計にも（）参考にも算入しない・除外）。
    if (!_elHas2Data(s, alpha)) return React.createElement("span", { style: { color: "#bbb" } }, exp);
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "nowrap", color: "#aaa", fontSize: 11, whiteSpace: "nowrap", opacity: 0.75 } },
      React.createElement("span", { key: "d", style: { marginRight: 1 } }, exp + "（"),
      _elHoldFlow(s, alpha, cutLine, true, true),
      React.createElement("span", { key: "e" }, "）"));
  }
  if (exp === "△" || exp === "損切り済") {
    // △/損切り済: （）でくくる（参考＝集計の（）内に対応）が、文字の薄さは○と同じ（薄くしない）。
    if (!_elHas2Data(s, alpha)) return React.createElement("span", { style: { color: "#bbb" } }, exp);
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "nowrap", fontSize: 11, whiteSpace: "nowrap" } },
      React.createElement("span", { key: "sym", style: { color: "#B45309", marginRight: 1, fontWeight: 800 } }, exp),
      React.createElement("span", { key: "op", style: { color: "#6B3A0F", fontWeight: 900 } }, "（"),
      _elHoldFlow(s, alpha, cutLine, true, true),
      React.createElement("span", { key: "cp", style: { color: "#6B3A0F", fontWeight: 900 } }, "）"));
  }
  // ○: 通常表示（本合計（）外算入）。
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "nowrap", fontSize: 11, whiteSpace: "nowrap" } },
    React.createElement("span", { key: "sym", style: { color: "#1E8449", fontWeight: 800, marginRight: 3 } }, exp),
    _elHoldFlow(s, alpha, cutLine, true, true));
}
// H1とH2期待度を1セル内に横並び表示（表のH列を1列に統合するため）。H2期待度が未選択ならH1のみ。
function _elHoldBoth(s, alpha, cutLine) {
  var h1 = _elHoldFlow(s, alpha, cutLine, false);
  if (!_elH2ExpAt(s, alpha)) return h1;   // 2026-07-06e
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 2, justifyContent: "center" } },
    React.createElement("span", { key: "h1", style: { display: "inline-flex", alignItems: "center" } }, React.createElement("span", { style: { fontSize: 8, color: "#bbb", fontWeight: 700, marginRight: 2 } }, "①"), h1),
    React.createElement("span", { key: "sep", style: { color: "#ddd", margin: "0 3px" } }, "｜"),
    React.createElement("span", { key: "h2", style: { display: "inline-flex", alignItems: "center" } }, React.createElement("span", { style: { fontSize: 8, color: "#bbb", fontWeight: 700, marginRight: 2 } }, "②"), _elHold2Cell(s, alpha, cutLine))
  );
}
// 集計表のH損益セル用: ①H1合計 ｜ ②H2合計 を1セルに横並び表示。sumH1/sumH2 は数値(円・nullなら—)。
// 参考表示（（）内）: 期待度△（本合計（）外＝○のみから除外）の記録も含めた○△合計を「（Ⓐ +9,900円）」で返す（= 本合計mainSum ＋ △参考refSum）。×は一切算入しない。参考が無ければnull。
function _elHold2RefSuffix(mainSum, refSum, refCnt) {
  if (refCnt == null || refCnt <= 0 || refSum == null) return null;
  var _incl = (mainSum || 0) + refSum;
  return React.createElement("span", { key: "h2ref", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", color: "#9CA3AF", fontWeight: 600, marginLeft: 2 } },
    "（",
    _elHoldGradeBadge(_profitGradeFromPnl(_incl, 1)),
    React.createElement("span", { style: { color: _incl > 0 ? "#C0392B" : _incl < 0 ? "#1E8449" : "#888" } }, (_incl > 0 ? "+" : "") + _incl.toLocaleString() + "円"),
    "）");
}
// H1合計（結果損益）用の1記録あたりの寄与。【合計損益システム 2026-06-16改】（）外＝○のみ／（）内＝○△／×は一切算入しない:
//  ・EP×（×見送り）→ 完全に算入無し（参考にも入れない）。
//  ・H1期待度× → 本合計（（）外）も（）内もEP損益（想定額）へフォールバック・参考(ref)無し（「EP損益のみ算入」）。
//  ・H1期待度△ → 本合計（（）外）はEP損益（想定額）・H1まで保有した場合との差を参考(ref=（）内)へ＝（）内は○△（=H1損益）を表す。※旧×の挙動を△が継承。
//  ・H1期待度 損切り済 → 従来どおり想定額main＋参考ref（損切りの件は従来どおり）。
//  ・H1期待度 未設定 → ×と同じ扱い（想定額main・参考無し）。○ → H1結果(planCap)をmain。
function _elHold1TotParts(s, alpha, cutLine) {
  if (!s) return { main: null, ref: null };
  if (_epIsXSkip(s, alpha)) return { main: null, ref: null };  // EP×（×見送り）→ 完全に算入無し
  var hres = (alpha != null) ? _elDynHold(s, alpha, cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
  if (alpha != null && _elPlanIsStop(s, alpha, cutLine)) {
    var pv0 = _elDynPlanned(s, alpha, cutLine);
    if (pv0 != null) hres = pv0;
  }
  if (hres == null) return { main: null, ref: null };
  // 【2026-07-06 次足期待度に統一】H1(EPの次の足)を保有するかは「EP足の引けの次足期待度」＝_epNextExpAt(s, epIdx)。採用α（EP不動）では=s.holdExpで完全に不変。シミュでEPが動いた時も“その足の引けに実際に下した判断”（待ち足なら到達期待）が使われる＝off-by-one解消（旧2026-07-03v/07-06○補完を置換）。v2以外/α無しはs.holdExp。
  var _r1 = (_epIsV2(s) && alpha != null) ? _epResolve(s, alpha) : null;
  var _hExp = (_r1 && _r1.epIdx >= 0) ? _epNextExpAt(s, _r1.epIdx) : s.holdExp;
  // EP△（_epIsTriEntry＝△確信度エントリー）→ EP自体が（）外0・参考なので、H1も（）外0（main:null）。
  // H1=○/△/損切り済は保有額を（）内（参考）へ。H1=×/未設定は完全除外（参考にも入れない＝1段下0を継承）。
  if (_epIsTriEntry(s, alpha)) return { main: null, ref: (_hExp && _hExp !== "×") ? hres : null };
  if (_hExp !== "○") {  // ○以外（×/△/損切り済/未設定）は想定額（EP損益）へフォールバック。未設定=×扱い
    var plan = (alpha != null) ? _elDynPlanned(s, alpha, cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
    if (plan == null) return { main: hres, ref: null };
    // 参考=「H1まで保有した場合」との差（想定損切り時キャップ後hresと一致）。△/損切り済のみ参考(（）内)へ。×/未設定は参考無し。
    var _withRef1 = (_hExp === "△" || _hExp === "損切り済");
    return { main: plan, ref: (_withRef1 && (hres - plan) !== 0) ? (hres - plan) : null };
  }
  return { main: hres, ref: null };  // ○
}
// H2合計のカスケード基準「1段下（H1まで保有）で手仕舞いした損益」。
//  H1期待度×/損切り済/未設定（=H1撤退） → EP損益(想定額)、○/△（=H1保有） → H1損益(想定損切りキャップ後)。
//  ※H1=△でも実際にはH1まで保有しているのでH1損益を返す（（）外のH1列フォールバックとは別物）。未設定=×扱い。
function _elH1HeldBase(s, alpha, cutLine) {
  if (!s) return null;
  var hres = (alpha != null) ? _elDynHold(s, alpha, cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
  if (alpha != null && _elPlanIsStop(s, alpha, cutLine)) {
    var pv0 = _elDynPlanned(s, alpha, cutLine);
    if (pv0 != null) hres = pv0;
  }
  // H1保有の判断＝EP足の引けの次足期待度 _epNextExpAt(s, epIdx) 2026-07-06（採用αでは=s.holdExpで不変）。
  var _rB = (_epIsV2(s) && alpha != null) ? _epResolve(s, alpha) : null;
  var _hExpB = (_rB && _rB.epIdx >= 0) ? _epNextExpAt(s, _rB.epIdx) : s.holdExp;
  if (_hExpB === "×" || _hExpB === "損切り済" || !_hExpB) {
    var plan = (alpha != null) ? _elDynPlanned(s, alpha, cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
    if (plan != null) return plan;
  }
  return hres;
}
// H2合計（結果損益）用の1記録あたりの寄与（raw値・100株換算）。【合計損益システム 2026-06-16改】（）外＝○のみ／（）内＝○△／×は一切算入しない:
//  ・EP×（×見送り）→ 完全に算入無し。
//  ・H1期待度×/損切り済/未設定（H1で撤退＝H2まで保有しない）→ 本合計は1段下(_elH1HeldBase=EP損益)。×/未設定は参考も無し（損切り済は従来どおり参考）。
//  ・H2期待度×/未設定 → 本合計はH1損益(1段下)へフォールバック・参考も無し（未設定=×扱い・「H1損益を算入」）。
//  ・H2期待度△ → 本合計（（）外）は1段下=H1合計のmain（H1△ならEP想定額）・H2まで保有した場合との差を参考(（）内)へ＝（）内は○△(=H2損益)。※旧×の挙動を△が継承。
//  ・H2期待度 損切り済 → 従来どおり1段下main＋参考。
//  ・想定orH1が損切り（H2＝○）→ 損切り額のみmain。
//  ・H2期待度○ 非損切り → 「EP正常＋H1○」の完全○チェーンのみ_elDynHold2をmain（（）なし）。H1=△ or EP△（_epIsTriEntry）でチェーンが切れる時は（）内計算＝（）外は1段下(H1のmain)・（）内はH2まで保有。
function _elHold2TotParts(s, alpha, cutLine) {
  if (!s) return { main: null, ref: null };
  if (_epIsXSkip(s, alpha)) return { main: null, ref: null };  // EP×（×見送り）→ 完全に算入無し
  if (_elH2Miss(s, alpha)) return { main: null, ref: null };
  // 【2026-07-06 次足期待度に統一】H1保有=EP足の引けの判断 _epNextExpAt(s, epIdx)／H2保有=H1足の引けの判断 _epNextExpAt(s, epIdx+1)（採用αでは=s.holdExp/s.hold2Expで完全に不変）。v2以外/α無しは生の記録値。
  var _r2 = (_epIsV2(s) && alpha != null) ? _epResolve(s, alpha) : null;
  var _h1e = (_r2 && _r2.epIdx >= 0) ? _epNextExpAt(s, _r2.epIdx) : s.holdExp;
  var _h2e = (_r2 && _r2.epIdx >= 0) ? _epNextExpAt(s, _r2.epIdx + 1) : s.hold2Exp;
  // hv = H2まで保有した場合の損益（参考/自分の結果用）。損切りなら強制手仕舞い=損切り額、それ以外はH2損益。
  var hv = (alpha != null && _elHoldIsStop(s, alpha, cutLine))
    ? (_elPlanIsStop(s, alpha, cutLine) ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine))
    : ((alpha != null) ? _elDynHold2(s, alpha, cutLine) : _elSignedVal(s.hold2Pnl, s.hold2PnlSign));
  var _base = _elHold1TotParts(s, alpha, cutLine).main;  // 1段下＝H1合計の（）外main（H1×/△/未設定→EP想定額・H1○→H1損益）。H2の（）外をH1のmainと一致させ、H1=△ならH2もEP基準へカスケード。
  // H1期待度×/損切り済/未設定（=H1撤退＝H2まで保有しない）→ 本合計は1段下(_base)。×/未設定は参考も無し。
  if (_h1e === "×" || _h1e === "損切り済" || !_h1e) {
    var _withRefA = (_h1e === "損切り済");  // 損切り済のみ参考。×/未設定は参考無し
    if (_base == null) return { main: null, ref: _withRefA ? hv : null };
    return { main: _base, ref: (_withRefA && hv != null && (hv - _base) !== 0) ? (hv - _base) : null };
  }
  // ここでH1は保有済(○/△)。
  // 【損切り＝×統一 2026-06-17 project_scalping_total_pnl_system】H2がH1足で損切り(_elHoldIsStop)＝×と同一視。
  //  H2期待度×/未設定も同じく、自分の損益を出さずH1の合計(_elHold1TotParts)を丸ごと引き継ぐ（例: H1=△なら200(-1100)）。
  if ((alpha != null && _elHoldIsStop(s, alpha, cutLine)) || _h2e === "×" || _h2e === "損切り済" || !_h2e) {
    return _elHold1TotParts(s, alpha, cutLine);
  }
  // H2期待度△（H2まで実保有・非損切り）→ 自分の△寄与。（）外=1段下(H1合計のmain・H1△ならEP想定額)・（）内=H2まで保有との差。
  if (_h2e === "△") {
    if (_base == null) return { main: null, ref: hv };
    return { main: _base, ref: (hv != null && (hv - _base) !== 0) ? (hv - _base) : null };
  }
  // H2期待度○（非損切り）。
  if (!_elHas2Data(s, alpha)) return { main: null, ref: null };
  // 「EP正常エントリー＋H1○」の完全な○チェーンのみH2損益を（）外main。
  // H1=△ または EPが△（_epIsTriEntry＝△確信度エントリー）でチェーンが切れていれば、H2○でも（）内計算＝
  //   （）外は1段下(_base＝H1合計のmain・H1△ならEP想定額)・（）内はH2まで保有(hv)。
  if (_h1e === "○" && !_epIsTriEntry(s, alpha)) return { main: hv, ref: null };
  if (_base == null) return { main: null, ref: hv };
  return { main: _base, ref: (hv != null && (hv - _base) !== 0) ? (hv - _base) : null };
}
function _elHoldSumBoth(sumH1, sumH2, refH2, refCnt, allMiss, refH1, refCntH1) {
  // allMiss=その集計が全記録E基準未達(全miss)→H1/H2とも「Q 0」表示・参考合計は出さない。
  var _f = function(v) { return allMiss ? _qZeroCell() : (v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円")); };
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, flexWrap: "wrap", justifyContent: "center", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } },
    React.createElement("span", { key: "h1", style: { display: "inline-flex", alignItems: "center" } }, React.createElement("span", { style: { fontSize: 8, color: "#bbb", fontWeight: 700, marginRight: 1 } }, "①"), _f(sumH1), allMiss ? null : _elHold2RefSuffix(sumH1, refH1, refCntH1)),
    React.createElement("span", { key: "sep", style: { color: "#ddd" } }, "｜"),
    React.createElement("span", { key: "h2", style: { display: "inline-flex", alignItems: "center" } }, React.createElement("span", { style: { fontSize: 8, color: "#bbb", fontWeight: 700, marginRight: 1 } }, "②"), _f(sumH2), allMiss ? null : _elHold2RefSuffix(sumH2, refH2, refCnt)));
}
// === H1(上)/H2(下) 縦積み表示ヘルパー（H列を1列に統合する表で使用）===
// 各部位(高値/値幅/α値比/損益)のReactノードを返す。算出ロジックは_elHoldFlowと同一。
function _elHoldParts(s, alpha, cutLine, isH2) {
  var hs = _epHoldView(s, alpha, isH2);
  // 損切り済み（H2: 想定orH1損切り／H1: 想定損切り）→ 明細を出さず損益列に「ー（ランク 損切額）※損切り済」のみ。
  if (alpha != null) {
    var _psP = _elPlanIsStop(s, alpha, cutLine);
    if (isH2 ? _elHoldIsStop(s, alpha, cutLine) : _psP) {
      var _samtP = _psP ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
      if (_samtP != null) return { high: null, width: null, acmp: null, pnl: _elHoldStopDoneNode(_samtP, null, hs, alpha), miss: false, hasAny: true };
    }
  }
  var high = null, width = null, acmp = null, pnl = null, miss = false;
  if (hs.holdHighVal != null) high = React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdHighVal, hs.holdHighSign === "-"), fontWeight: 700 } }, (hs.holdHighSign === "+" ? "↓" : hs.holdHighSign === "-" ? "↑" : "") + hs.holdHighVal);
  if (hs.holdWidth != null) width = React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdWidth, hs.holdWidthSign === "-"), fontWeight: 700 } }, (hs.holdWidthSign === "-" ? "↑" : hs.holdWidthSign === "+" ? "↓" : "↕") + hs.holdWidth);
  if (alpha != null && hs.holdWidth != null) {
    var _hcf = hs.holdWidthSign === "-" ? Number(hs.holdWidth) : hs.holdWidthSign === "+" ? -Number(hs.holdWidth) : 0;
    var _ewH = alpha - _hcf, _ewHAbs = Math.abs(_ewH);
    acmp = _ewH === 0 ? React.createElement("span", { style: { color: "#888" } }, "α0") : React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewHAbs, _ewH < 0), fontWeight: 700 } }, "α" + (_ewH > 0 ? "↓" : "↑") + _ewHAbs);
  }
  var _h2missP = isH2 && _elH2Miss(s, alpha);  // 想定もH1もE基準未達 → 損益をQ ー円に固定（縦積み表）。
  var holdPnl = _h2missP ? null : ((alpha != null) ? (isH2 ? _elDynHold2(s, alpha, cutLine) : _elDynHold(hs, alpha, cutLine)) : _elSignedVal(hs.holdPnl, hs.holdPnlSign));
  var res = _h2missP ? "miss" : ((alpha != null) ? _elDynResult(s, alpha, cutLine) : s.result);
  var planStop = (alpha != null) && _elPlanIsStop(s, alpha, cutLine);
  var planVal = (alpha != null) ? _elDynPlanned(s, alpha, cutLine) : null;
  if (holdPnl != null) {
    var hp = holdPnl;
    var pp = isH2 ? ((alpha != null) ? _elDynHold(s, alpha, cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign)) : ((alpha != null) ? _elDynPlanned(s, alpha, cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign));
    var dynHP = (function() {
      if (hp == null) return hs.holdProfit;
      if (!isH2 && (res === "miss" || res === "draw")) return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
      if (pp == null) return isH2 ? (hp > 0 ? "yes" : hp < 0 ? "no" : "none") : hs.holdProfit;
      if (hp === 0) return pp < 0 ? "yes" : pp > 0 ? "mid" : "none";
      if (pp > 0 && hp > 0) return hp > pp ? "yes" : hp < pp ? "mid" : "none";
      if (pp < 0 && hp < 0) return "no";
      if (pp > 0 && hp < 0) return "no";
      if (pp < 0 && hp > 0) return "yes";
      return hs.holdProfit;
    })();
    var symMap = { yes: ["○", "#1E8449"], mid: ["△", "#B45309"], none: ["ー", "#888"], no: ["×", "#C0392B"] };
    var sym = symMap[dynHP];
    var _stopLeftP = isH2
      ? ((alpha != null && _elHoldIsStop(s, alpha, cutLine)) ? (planStop ? planVal : _elDynHold(s, alpha, cutLine)) : null)
      : (planStop ? planVal : null);
    pnl = (_stopLeftP != null && holdPnl != null)
      ? _elHoldStopPnlNode(_stopLeftP, holdPnl)
      : React.createElement("span", { style: { display: "inline-flex", alignItems: "center", fontVariantNumeric: "tabular-nums", fontWeight: 700, whiteSpace: "nowrap" } },
        _elHoldGradeBadge(_profitGradeFromPnl(holdPnl, 1)),
        React.createElement("span", { key: "yen", style: { color: holdPnl > 0 ? "#C0392B" : holdPnl < 0 ? "#1E8449" : "#888" } }, holdPnl.toLocaleString() + "円"),
        sym ? React.createElement("span", { key: "sym", style: { color: sym[1], marginLeft: 2, fontWeight: 800 } }, sym[0]) : null);
  } else if (res === "miss") { miss = true; pnl = _qZeroCell(); }
  return { high: high, width: width, acmp: acmp, pnl: pnl, miss: miss, hasAny: !!(high || width || acmp || pnl) };
}
// 明細表用: H1(上)/H2(下)を内部2行テーブルで縦揃え。列幅を固定(tableLayout:fixed)し記録間でも桁が揃う。
// 左端に「H１」「H２」を表記。H1/H2間に区切り横線。H2行は期待度(○/△/×)→内容。
// 【2026-06-16 参考役は△へ移管】△/損切り済(=参考)は内容を（）で括る(level1・文字は薄くしない)・×/H1撤退(=除外)は（）＋薄く(level2)・○は通常。開き/閉じ括弧を専用列に置いて桁揃え。
function _elHoldStackInner(s, alpha, cutLine) {
  var exp = _elH2ExpAt(s, alpha);   // 次足期待度（採用αでは=s.hold2Exp）2026-07-06e
  var _h2miss = _elH2Miss(s, alpha);
  var _h2ReachedA = _h2miss && s.hold2HighSign === "-" && s.hold2HighVal != null && Number(s.hold2HighVal) >= alpha;  // 想定・H1高値はα未達だがH2高値だけα到達（H2で初めてE基準到達）
  var _h1StopDone = (alpha != null) && _elPlanIsStop(s, alpha, cutLine);   // 想定で損切り→H1も損切り済み表示
  var _h2StopDone = (alpha != null) && _elHoldIsStop(s, alpha, cutLine);   // 想定orH1で損切り→H2は損切り済み表示（期待度問わず）
  var p1 = _h1StopDone ? null : _elHoldParts(s, alpha, cutLine, false);
  var p2 = _h2StopDone ? null : (_h2miss || exp || _elHas2Data(s, alpha)) ? _elHoldParts(s, alpha, cutLine, true) : null;
  var _pnW = 78, _parW = 10, _tblW = 241;
  var _expCol = { "○": "#1E8449", "△": "#B45309", "×": "#C0392B" };
  var _sep = function(ch) { return React.createElement("span", { style: { color: "#ccc" } }, ch); };
  var _paren = function(ch, lvl) { return React.createElement("span", { style: (lvl === 1) ? { color: "#6B3A0F", fontWeight: 900 } : { color: "#888" } }, ch); };  // △(level1)=濃く太く／×・撤退(level2)=薄め
  var _c = function(k, node, ta, w, extra) { return React.createElement("td", { key: k, style: Object.assign({ padding: "0 1px", whiteSpace: "nowrap", verticalAlign: "baseline", textAlign: ta || "center", width: w, overflow: "visible" }, extra || {}) }, node != null ? node : null); };
  var _row = function(rk, lblNode, expNode, p, paren, topB) {
    var bt = topB ? { borderTop: "1px solid #e0d8c8" } : null;
    var btf = (paren >= 2) ? Object.assign({ opacity: 0.6 }, bt) : bt;  // 括弧の中身: △/損切り済(参考=level1)は薄くしない／×・H1撤退(除外=level2)は薄く(0.6)
    return React.createElement("tr", { key: rk },
      _c("lbl", lblNode, "center", 22, Object.assign({ fontSize: 9, color: "#999", fontWeight: 700, paddingRight: 3 }, bt)),
      _c("e", expNode, "center", 14, Object.assign({ paddingRight: 1, fontWeight: 800 }, bt)),
      _c("op", paren ? _paren("（", paren) : null, "center", _parW, bt),
      _c("hi", p && p.high, "right", 26, btf),
      _c("ar", p && p.width ? _sep("→") : null, "center", 10, btf),
      _c("wd", p && p.width, "right", 26, btf),
      _c("s1", p && p.acmp ? _sep("/") : null, "center", 6, btf),
      _c("ac", p && p.acmp, "right", 33, btf),
      _c("s2", p && p.pnl ? _sep("/") : null, "center", 6, btf),
      _c("pn", p ? (p.pnl != null ? p.pnl : React.createElement("span", { style: { color: "#ddd" } }, "—")) : null, "left", _pnW, btf),
      _c("cp", paren ? _paren("）", paren) : null, "center", _parW, bt));
  };
  // 損切り済み行【2026-06-17: ×と同一視】期待度欄を「×（損）」(×=赤・（損）薄)にし、明細(高値→確定値/α値比)＋損切額を
  //  ×期待度と同じ paren=2（（）囲み＋opacity0.6で薄く）で _row と同一列構成に描画＝H1/H2と桁が縦に揃う。isH2でH1/H2明細を切替。
  var _stopRow = function(rk, lblNode, amount, topB, isH2) {
    var hs = _epHoldView(s, alpha, isH2);
    var _hi = (hs && hs.holdHighVal != null) ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdHighVal, hs.holdHighSign === "-"), fontWeight: 700 } }, (hs.holdHighSign === "+" ? "↓" : hs.holdHighSign === "-" ? "↑" : "") + hs.holdHighVal) : null;
    var _wd = (hs && hs.holdWidth != null) ? React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(hs.holdWidth, hs.holdWidthSign === "-"), fontWeight: 700 } }, (hs.holdWidthSign === "-" ? "↑" : hs.holdWidthSign === "+" ? "↓" : "↕") + hs.holdWidth) : null;
    var _ac = null;
    if (hs && alpha != null && hs.holdWidth != null) {
      var _hcf = hs.holdWidthSign === "-" ? Number(hs.holdWidth) : hs.holdWidthSign === "+" ? -Number(hs.holdWidth) : 0;
      var _ewH = alpha - _hcf, _ewHAbs = Math.abs(_ewH);
      _ac = _ewH === 0 ? React.createElement("span", { style: { color: "#888" } }, "α0") : React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: _vcol(_ewHAbs, _ewH < 0), fontWeight: 700 } }, "α" + (_ewH > 0 ? "↓" : "↑") + _ewHAbs);
    }
    var _xLoss = React.createElement("span", { style: { color: "#C0392B", fontWeight: 800 } }, "×");
    return _row(rk, lblNode, _xLoss, { high: _hi, width: _wd, acmp: _ac, pnl: _elHoldStopAmtNode(amount) }, 2, topB);
  };
  var hexp = _elH1ExpAt(s, alpha);   // 2026-07-06e
  var h1exp = (hexp && hexp !== "損切り済") ? React.createElement("span", { style: { color: _expCol[hexp] || "#666" } }, hexp) : null;
  var rows = [ _h1StopDone ? _stopRow("h1", "H１", _elDynPlanned(s, alpha, cutLine), false, false) : _row("h1", "H１", h1exp, p1, (hexp === "△" || hexp === "損切り済") ? 1 : (hexp === "×" ? 2 : 0), false) ];
  if (_h2miss) {
    // 想定もH1もE基準未達 → H2は「ー」期待度＋H2明細（損益はQ ー円）。H1と同じ列構成で縦揃え。想定もH1もQなのでH2は常に（）で囲む（H1期待度×と同じ囲み方）。
    rows.push(_row("h2", "H２", React.createElement("span", { title: "H１までE基準未達", style: { color: "#888" } }, "ー"), p2, true, true));
    // H2高値だけα到達（H2で初めてE基準到達）→「H１までE基準未達のため、金額非表示」の補足を1行下に表示。
    if (_h2ReachedA) {
      rows.push(React.createElement("tr", { key: "h2note" },
        React.createElement("td", { key: "n", colSpan: 11, style: { padding: "0 2px 1px", whiteSpace: "nowrap", textAlign: "center", fontSize: 9, color: "#B45309", lineHeight: 1.2 } }, "H１までE基準未達のため、金額非表示")));
    }
  } else if (_h2StopDone) {
    rows.push(_stopRow("h2", "H２", _h1StopDone ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine), true, true));
  } else {
    // 「損切り済」は_h2StopDone(想定orH1で損切り)時のみ意味を持つ表記。ここはH2が成立する分岐なので期待度として出さない。
    var h2exp = (exp && exp !== "損切り済") ? React.createElement("span", { style: { color: _expCol[exp] || "#666" } }, exp) : null;
    var _epTriH2 = _epIsTriEntry(s, alpha);  // EPが△（△確信度エントリー）→ H2○でも（）内（参考）で囲む
    // H2○でもH1=△ or EP△でチェーンが切れていれば参考(level1)で（）囲み。合計(_elHold2TotParts)の（）内計算と一致。
    rows.push(_row("h2", "H２", h2exp, p2, (hexp === "×" || hexp === "損切り済" || exp === "×") ? 2 : ((exp === "△" || exp === "損切り済" || hexp === "△" || _epTriH2) ? 1 : 0), true));
  }
  return React.createElement("table", { style: { borderCollapse: "collapse", margin: "0 auto", fontSize: 11, fontVariantNumeric: "tabular-nums", lineHeight: 1.5, tableLayout: "fixed", width: _tblW } }, React.createElement("tbody", null, rows));
}
// 明細表(フロー表示)用: H列を1セルに統合(H1上/H2下)。colSpan:2で旧2列分の幅を占有し他のcolSpanは不変。
function _elHoldTd2(s, alpha, cutLine, tdStyle, capNote) {
  // E未達(ノートレード)はH損益欄を「ー」のみ表示（v2=judge"miss"・旧記録=_elH2Miss）。E=×は参考表示を維持。
  var _tdMiss = false;
  if (s && alpha != null) {
    if (_epIsV2(s)) { var _rT = _epResolve(s, alpha); _tdMiss = !!(_rT && _rT.judge === "miss"); }
    else _tdMiss = _elH2Miss(s, alpha);
  }
  if (_tdMiss) return [ React.createElement("td", { key: "hc", colSpan: 2, style: tdStyle }, React.createElement("span", { style: { color: "#ccc" } }, "ー") ) ];
  if (_epIsXSkip(s, alpha)) {
    // ×見送り: 取引していた場合のH1/H2を「×見送り」付き・薄く参考表示（本合計・（）参考とも算入無し＝表示と×見送り分析専用）。
    return [ React.createElement("td", { key: "hc", colSpan: 2, style: tdStyle },
      React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", opacity: 0.7 } },
        React.createElement("span", { style: { fontSize: 12, color: "#1E8449", fontWeight: 800 } }, "×"),
        _elHoldStackInner(_epAsTraded(s), alpha, cutLine)), capNote || null) ];
  }
  return [ React.createElement("td", { key: "hc", colSpan: 2, style: tdStyle }, _elHoldStackInner(s, alpha, cutLine), capNote || null) ];
}
// 集計/早見表用: 「H１合計」td と「H２合計」td の2セル。集計表はH列を統合しない（2列のまま）。
function _elHoldSumTd2(sumH1, sumH2, tdStyle, refH2, refCnt, allMiss, refH1, refCntH1) {
  // allMiss=その集計が全記録E基準未達(全miss)→H1/H2とも「Q 0」表示・参考合計は出さない。
  var _f = function(v) { return allMiss ? _qZeroCell() : (v == null ? React.createElement("span", { style: { color: "#ccc" } }, "—") : React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888" } }, (v > 0 ? "+" : "") + v.toLocaleString() + "円")); };
  return [
    React.createElement("td", { key: "h1s", style: tdStyle }, _f(sumH1), allMiss ? null : _elHold2RefSuffix(sumH1, refH1, refCntH1)),
    React.createElement("td", { key: "h2s", style: tdStyle }, _f(sumH2), allMiss ? null : _elHold2RefSuffix(sumH2, refH2, refCnt))
  ];
}
function _elCapLossYen(cutLine) { return -Math.round((cutLine != null ? cutLine : 10) * 100); }
function _elCapNoteAmt(amount, opts) {
  // 「仮に損切値ちょうどで損切できていたら」の損失額（カッコ表示）は非表示にする。
  // 表示を復活させたい場合はこの return を外す。_elCapNote も内部でこれを呼ぶため全箇所が一括で消える。
  return null;
  opts = opts || {};
  if (amount == null) return null;
  var _g = _profitGradeFromPnl(amount, 1);
  var _gs = _GRADE_STYLE[_g] || _GRADE_STYLE.Z;
  var _fs = opts.fontSize || 11;
  var _cs = opts.circle || (_fs + 3);
  var _col = amount < 0 ? "#1E8449" : amount > 0 ? "#C0392B" : "#888";
  return React.createElement("div", {
    title: opts.title || "損切り値ちょうどで損切りできていた場合の損失額（100株換算）",
    style: Object.assign({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1,
      fontSize: _fs, color: _col, fontWeight: 700,
      whiteSpace: "nowrap", lineHeight: 1.2, marginTop: 1 }, opts.style || {})
  },
    React.createElement("span", null, "（"),
    (_g && _g !== "Z") ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: _cs, height: _cs, borderRadius: "50%", background: _gs.bg, color: _gs.color,
      border: "1px solid " + _gs.border, fontWeight: 800, fontSize: Math.round(_cs * 0.6), lineHeight: 1, flexShrink: 0, marginRight: 1 } }, _g) : null,
    React.createElement("span", null, amount.toLocaleString() + "円"),
    React.createElement("span", null, "）")
  );
}
function _elCapNote(cutLine, opts) {
  opts = opts || {};
  var _cl = cutLine != null ? cutLine : 10;
  return _elCapNoteAmt(_elCapLossYen(_cl), Object.assign({ title: "損切り値（" + _cl + "円）ちょうどで損切りできていた場合の損失額（100株換算）" }, opts));
}

function _elCalcStats(records, data, simResolve) {
  var _liveA = !!(data && data.charts);
  var total = records.length;
  var ok = 0, ng = 0, draw = 0, miss = 0;
  var win = 0, tri = 0, even = 0, loss = 0, stop = 0;
  var sumPnl = 0, sumPlanned = 0, sumMax = 0, sumHold = 0;
  var sumPlannedRef = 0, plannedRefCnt = 0;  // EP-OS△（△の確信度でエントリー）→ EP損益は（）内（参考）のみ・（）外は0（2026-06-16）
  var wins = [], losses = [];
  var plannedWins = [], plannedLosses = [];
  var maxWins = [], maxLosses = [];
  var holdHasData = false;
  var planCapSum = 0, holdCapSum = 0, planHasStop = false, holdHasStop = false;
  var hYes = 0, hMid = 0, hNone = 0, hNo = 0;
  var sumHoldRef = 0, holdRefCnt = 0;  // 期待度×（参考扱い・合計対象外）のH1損益合計（合計欄でカッコ参考表示）
  var sumHold2 = 0, hold2HasData = false, hold2CapSum = 0, hold2HasStop = false;
  var sumHold2Ref = 0, hold2RefCnt = 0;  // 期待度×（参考扱い・合計対象外）のH2損益合計（合計欄でカッコ参考表示）
  var h2Yes = 0, h2Mid = 0, h2None = 0, h2No = 0;
  records.forEach(function(r) {
    var s = r.signal;
    var _ai = _liveA ? (simResolve ? simResolve(r) : _elAlphaInfo(r, data)) : null;
    var _res = _liveA ? _elDynResult(s, _ai.alpha, _ai.cutLine) : s.result;
    if (_res === "ok") ok++;
    else if (_res === "ng") ng++;
    else if (_res === "draw") draw++;
    else if (_res === "miss") miss++;
    var _wb = _elWinBucket(s, _liveA ? _ai.alpha : null, _liveA ? _ai.cutLine : null);
    if (_wb === "win") win++; else if (_wb === "tri") tri++; else if (_wb === "even") even++; else if (_wb === "loss") loss++; else if (_wb === "stop") stop++;
    var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
    var _per100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
    var pn = (r.item && r.item.pnl != null)
      ? Number(r.item.pnl)
      : _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign);
    if (pn != null) {
      var pnN = _per100(pn);
      sumPnl += pnN;
      if (pnN > 0) wins.push(pnN);
      else if (pnN < 0) losses.push(pnN);
    }
    var pp = _liveA ? _elDynPlanned(s, _ai.alpha, _ai.cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
    if (pp != null) {
      var ppN = _liveA ? Math.round(pp) : _per100(pp);
      if (_liveA && _epIsTriEntry(s, _ai.alpha)) {
        sumPlannedRef += ppN; plannedRefCnt++;  // EP-OS△ → （）外には入れず参考(ref)へ・（）外は0（H1/H2の△と同様）
      } else {
        sumPlanned += ppN;
        if (ppN > 0) plannedWins.push(ppN);
        else if (ppN < 0) plannedLosses.push(ppN);
        var _pStop = _liveA && _elPlanIsStop(s, _ai.alpha, _ai.cutLine);
        if (_pStop) planHasStop = true;
        planCapSum += _pStop ? _elCapLossYen(_ai.cutLine) : ppN;
      }
    }
    var mp = _elSignedVal(s.maxPnl, s.maxPnlSign);
    if (mp != null) {
      var mpN = _per100(mp);
      sumMax += mpN;
      if (mpN > 0) maxWins.push(mpN);
      else if (mpN < 0) maxLosses.push(mpN);
    }
    var hp = _liveA ? _elDynHold(s, _ai.alpha, _ai.cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
    if (hp != null) {
      var hpN = _liveA ? Math.round(hp) : _per100(hp);
      // H結果損益(planCap): 想定が損切りの行は想定額(ppN)に置換し、本日/今週・明細の合計と統一。
      var _pStopH = _liveA && _elPlanIsStop(s, _ai.alpha, _ai.cutLine);
      var _hCapH = (_pStopH && ppN != null) ? ppN : hpN;
      var _hStop = _liveA && _elHoldIsStop(s, _ai.alpha, _ai.cutLine);
      var _hx1cs = _elH1ExpAt(s, _liveA ? _ai.alpha : null);   // 2026-07-06e
      if (_liveA && _epIsTriEntry(s, _ai.alpha)) {
        // EP△→H1も（）外0。○/△/損切り済は保有額を（）内（参考）へ・×/未設定は完全除外（1段下0を継承）。
        if (_hx1cs && _hx1cs !== "×") { sumHoldRef += _hCapH; holdRefCnt++; }
      } else {
        var _fbHcs = (_hx1cs !== "○");  // ○以外（×/△/損切り済/未設定）→想定額(EP損益)へフォールバック。未設定=×扱い
        if (_fbHcs && ppN != null) {
          sumHold += ppN; holdHasData = true;
          if ((_hx1cs === "△" || _hx1cs === "損切り済") && (_hCapH - ppN) !== 0) { sumHoldRef += (_hCapH - ppN); holdRefCnt++; }   // △/損切り済のみH1保有時との差を参考（×/未設定は無し・差0除外）
        } else {
          sumHold += _hCapH; holdHasData = true;        // ○ は本合計に算入
        }
      }
      if (_hStop) holdHasStop = true;
      holdCapSum += _hStop ? _elCapLossYen(_ai.cutLine) : hpN;
    }

    var _hc;
    if (!_liveA || hp == null) _hc = s.holdProfit;
    else if (_res === "miss" || _res === "draw") _hc = hp > 0 ? "yes" : hp < 0 ? "no" : "none";
    else if (pp == null) _hc = s.holdProfit;
    else if (pp > 0 && hp > 0) _hc = hp > pp ? "yes" : hp < pp ? "mid" : "none";
    else if (pp < 0 && hp < 0) _hc = "no";
    else if (pp > 0 && hp < 0) _hc = "no";
    else if (pp < 0 && hp > 0) _hc = "yes";
    else if (hp === 0) _hc = "none";
    else _hc = s.holdProfit;
    if (_hc === "yes") hYes++;
    else if (_hc === "mid") hMid++;
    else if (_hc === "none") hNone++;
    else if (_hc === "no") hNo++;

    // H2合計（結果損益）: _elHold2TotParts で統一（損切り→想定額・非損切り○/△→_elDynHold2・非損切り×→参考）。本日/今週・明細・各集計表の合計を一致させる。
    var _h2t = _elHold2TotParts(s, _liveA ? _ai.alpha : null, _liveA ? _ai.cutLine : 10);
    if (_h2t.main != null) { sumHold2 += (_liveA ? Math.round(_h2t.main) : _per100(_h2t.main)); hold2HasData = true; }
    if (_h2t.ref != null) { sumHold2Ref += (_liveA ? Math.round(_h2t.ref) : _per100(_h2t.ref)); hold2RefCnt++; }
    // H2期待度の勝敗分類（○/△のみ）と損切りキャップ集計は従来どおり。
    var _hx2cs = _elH2ExpAt(s, _liveA ? _ai.alpha : null);   // 2026-07-06e
    if ((_hx2cs === "○" || _hx2cs === "△") && _elHas2Data(s, _liveA ? _ai.alpha : null) && !_elH2Miss(s, _liveA ? _ai.alpha : null)) {
      var _h2 = _h2sig(s);
      var hp2 = _liveA ? _elDynHold2(s, _ai.alpha, _ai.cutLine) : _elSignedVal(_h2.holdPnl, _h2.holdPnlSign);
      if (hp2 != null) {
        var hp2N = _liveA ? Math.round(hp2) : _per100(hp2);
        var _h2Stop = _liveA && _elHoldIsStop2(s, _ai.alpha, _ai.cutLine);
        if (_h2Stop) hold2HasStop = true;
        hold2CapSum += _h2Stop ? _elCapLossYen(_ai.cutLine) : hp2N;
      }
      var _hc2;
      if (!_liveA || hp2 == null) _hc2 = _h2.holdProfit;
      else if (_res === "miss" || _res === "draw") _hc2 = hp2 > 0 ? "yes" : hp2 < 0 ? "no" : "none";
      else if (pp == null) _hc2 = _h2.holdProfit;
      else if (pp > 0 && hp2 > 0) _hc2 = hp2 > pp ? "yes" : hp2 < pp ? "mid" : "none";
      else if (pp < 0 && hp2 < 0) _hc2 = "no";
      else if (pp > 0 && hp2 < 0) _hc2 = "no";
      else if (pp < 0 && hp2 > 0) _hc2 = "yes";
      else if (hp2 === 0) _hc2 = "none";
      else _hc2 = _h2.holdProfit;
      if (_hc2 === "yes") h2Yes++;
      else if (_hc2 === "mid") h2Mid++;
      else if (_hc2 === "none") h2None++;
      else if (_hc2 === "no") h2No++;
    }
  });
  var winPct = (ok + ng) > 0 ? Math.round(ok / (ok + ng) * 100) : null;
  var avgWin = wins.length > 0 ? Math.round(wins.reduce(function(a, b) { return a + b; }, 0) / wins.length) : 0;
  var avgLoss = losses.length > 0 ? Math.round(losses.reduce(function(a, b) { return a + b; }, 0) / losses.length) : 0;
  var expected = null;
  if ((wins.length + losses.length) > 0) {
    var wR = wins.length / (wins.length + losses.length);
    expected = Math.round(wR * avgWin + (1 - wR) * avgLoss);
  }
  var expectedPlanned = null;
  if ((plannedWins.length + plannedLosses.length) > 0) {
    var pwR = plannedWins.length / (plannedWins.length + plannedLosses.length);
    var avgPW = plannedWins.length > 0 ? Math.round(plannedWins.reduce(function(a,b){return a+b;},0)/plannedWins.length) : 0;
    var avgPL = plannedLosses.length > 0 ? Math.round(plannedLosses.reduce(function(a,b){return a+b;},0)/plannedLosses.length) : 0;
    expectedPlanned = Math.round(pwR * avgPW + (1 - pwR) * avgPL);
  }
  var expectedMax = null;
  if ((maxWins.length + maxLosses.length) > 0) {
    var mwR = maxWins.length / (maxWins.length + maxLosses.length);
    var avgMW = maxWins.length > 0 ? Math.round(maxWins.reduce(function(a,b){return a+b;},0)/maxWins.length) : 0;
    var avgML = maxLosses.length > 0 ? Math.round(maxLosses.reduce(function(a,b){return a+b;},0)/maxLosses.length) : 0;
    expectedMax = Math.round(mwR * avgMW + (1 - mwR) * avgML);
  }
  return {
    total: total, ok: ok, ng: ng, draw: draw, miss: miss, winPct: winPct,
    reach: win + tri + even + loss + stop, win: win, tri: tri, even: even, loss: loss, stop: stop,
    avgWin: avgWin, avgLoss: avgLoss, expected: expected,
    sumPnl: sumPnl, sumPlanned: sumPlanned, sumMax: sumMax,
    sumPlannedRef: plannedRefCnt > 0 ? sumPlannedRef : null, plannedRefCnt: plannedRefCnt,
    expectedPlanned: expectedPlanned, expectedMax: expectedMax,
    sumHold: holdHasData ? sumHold : null,
    sumHoldRef: holdRefCnt > 0 ? sumHoldRef : null, holdRefCnt: holdRefCnt,
    planCapSum: planHasStop ? planCapSum : null,
    holdCapSum: (holdHasData && holdHasStop) ? holdCapSum : null,
    planHasStop: planHasStop, holdHasStop: holdHasStop,
    hYes: hYes, hMid: hMid, hNone: hNone, hNo: hNo,
    holdResTotal: hYes + hMid + hNone + hNo,
    sumHold2: hold2HasData ? sumHold2 : null,
    sumHold2Ref: hold2RefCnt > 0 ? sumHold2Ref : null, hold2RefCnt: hold2RefCnt,
    hold2CapSum: (hold2HasData && hold2HasStop) ? hold2CapSum : null,
    hold2HasStop: hold2HasStop,
    h2Yes: h2Yes, h2Mid: h2Mid, h2None: h2None, h2No: h2No,
    hold2ResTotal: h2Yes + h2Mid + h2None + h2No
  };
}




function _profitGradeFromPnl(pnl, enteredCount) {
  if (!enteredCount) return "Z";
  if (pnl >= 2501)  return "A";
  if (pnl >= 1001)  return "B";
  if (pnl >= 1)     return "C";
  if (pnl === 0)    return "D";
  if (pnl >= -1000) return "E";
  if (pnl >= -2500) return "F";
  return "G";
}

function _profitGradeFromPnlReal(pnl, enteredCount) {
  if (!enteredCount) return "Z";
  if (pnl >= 25001)  return "A";
  if (pnl >= 10001)  return "B";
  if (pnl >= 1)      return "C";
  if (pnl === 0)     return "D";
  if (pnl >= -10000) return "E";
  if (pnl >= -25000) return "F";
  return "G";
}
var _GRADE_STYLE = {
  A: { bg: "#FDECEA", color: "#B71C1C", border: "#FFCDD2" },
  B: { bg: "#FFEBEE", color: "#C62828", border: "#EF9A9A" },
  C: { bg: "#FFF3F3", color: "#E53935", border: "#FFCDD2" },
  D: { bg: "#F5F5F5", color: "#555",    border: "#DDD" },
  E: { bg: "#F1F8E9", color: "#558B2F", border: "#AED581" },
  F: { bg: "#E8F5E9", color: "#2E7D32", border: "#A5D6A7" },
  G: { bg: "#C8E6C9", color: "#1B5E20", border: "#81C784" },
  Z: { bg: "#f5f4f0", color: "#888",    border: "#ddd" },
  Q: { bg: "#FEF3C7", color: "#B45309", border: "#FCD34D" }
};

var _GRADE_DESC = {
  A: "2501円~", B: "1001~2500円", C: "1~1000円",
  D: "0円", E: "-1~-1000円", F: "-1001~-2500円", G: "-2501円~",
  Z: "取引なし", Q: "E基準未達のため非表示"
};

var _GRADE_DESC_REAL = {
  A: "25001円~", B: "10001~25000円", C: "1~10000円",
  D: "0円", E: "-1~-10000円", F: "-10001~-25000円", G: "-25001円~",
  Z: "取引なし", Q: "E基準未達のため非表示"
};


function _qMissCell(size) {
  // E基準未達のEP損益欄は「ー」のみ表示（Qバッジは廃止 2026-06-13）。
  return React.createElement("span", { title: "E基準未達のため非表示", style: { color: "#888" } }, "ー");
}
// その集計行の全記録がE基準未達(全miss)の場合のセル表示「Ⓠ ー円」（Qをランク風に〇で囲む）。
function _qZeroCell(size) {
  var sz = size || 16;
  var gs = _GRADE_STYLE.Q;
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" } },
    React.createElement("span", { title: "全記録がE基準未達のため損益なし",
      style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: sz, height: sz,
        borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border,
        fontWeight: 800, fontSize: Math.round(sz * 0.6), flexShrink: 0 } }, "Q"),
    React.createElement("span", { style: { color: "#888", fontWeight: 700 } }, "ー円")
  );
}
// 集計行が全miss(E基準未達)かを判定。recs各記録を行セルと同じαで _elDynResult し全て"miss"ならtrue。
function _elAllMissRow(recs, alphaOf, cutOf) {
  if (!recs || recs.length === 0) return false;
  for (var _i = 0; _i < recs.length; _i++) {
    var _r = recs[_i];
    if (_epIsXSkip(_r.signal, alphaOf(_r))) return false;  // ×見送りは参考値を持つ→「全miss(Q0)」扱いにしない
    if (_elDynResult(_r.signal, alphaOf(_r), cutOf(_r)) !== "miss") return false;
  }
  return true;
}
// _elCalcStats の結果から全miss(E基準未達)集計かを判定（statsの想定/H1/H2合計と同じαで算出済み）。
function _elStatAllMiss(st) { return !!st && st.total > 0 && st.miss === st.total; }

function _elCalcChartGrades(signals, alpha, cutLine, exclFn) {
  var _fixedA = alpha != null;  // α固定指定。null=各記録の採用α値(signal.alphaVal)で実計算
  // exclFn(compat済signal)→true＝時間かぶり除外（良い方）＝金額もCntも全スキップ（早見表/カレンダーの呼び出し側で配線）2026-07-07
  var _c = (cutLine != null ? cutLine : 10);
  var realSum = 0, planSum = 0, holdSum = 0;
  var realCount = 0, planCount = 0, holdCount = 0;
  var planSumAB = 0, planCountAB = 0;
  var planCapSum = 0, holdCapSum = 0, planHasStop = false, holdHasStop = false;
  var holdSumPlanCap = 0, holdSumPlanCapAB = 0, holdCountAB = 0;
  var holdRefSum = 0, holdRefCnt = 0;  // 期待度×・E×（参考扱い・H1本合計から除外）
  var hold2Sum = 0, hold2Count = 0, hold2RefSum = 0, hold2RefCnt = 0;
  var planRefSum = 0, planRefCnt = 0;  // E×（×見送り・EP本合計から除外）の参考EP損益
  var _missCnt = 0, _h2MissCnt = 0, _totCnt = 0;  // 全miss(E基準未達)判定用。_h2MissCnt=想定もH1も未達(_elH2Miss=ノートレード)の記録数
  var osVals = [], confVals = [], holdConfVals = [];
  // 合計額算入: includeInTotal===false の記録は合計/グレード/件数から除外（早見表の3セル等が使用）。2026-06-18
  (signals || []).filter(function(sig) { return _elInclTotal(sig); }).forEach(function(sig) {
    var s = _compatSignal(sig);
    if (exclFn && exclFn(s)) return;
    var _aSig = _fixedA ? alpha : (s.alphaVal != null && s.alphaVal !== "" ? Number(s.alphaVal) : _gradeAlpha(s.difficulty));
    var isAB = s.difficulty === "A" || s.difficulty === "B";
    _totCnt++;
    var _isX = _epIsXSkip(s, _aSig);  // E×（×見送り）→本合計に算入せず参考(ref)へ。allMiss判定からも除外。
    if (!_isX && _elDynResult(s, _aSig, _c) === "miss") _missCnt++;
    if (!_isX && _elH2Miss(s, _aSig)) _h2MissCnt++;
    if (_elIsEntered(s, null)) {
      realCount++;
      var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
      if (rv != null) realSum += rv;
    }
    if (_isX) {
      // EP×（×見送り）→ EP/H1/H2とも完全に算入無し（参考にも入れない）。
    } else {
    var pv = _elDynPlanned(s, _aSig, _c);
    if (pv != null) {
      if (_epIsTriEntry(s, _aSig)) {
        planRefSum += pv; planRefCnt++;  // EP-OS△ → （）外には入れず参考(ref)へ・（）外は0（H1/H2の△と同様）
      } else {
        planSum += pv; planCount++;
        if (isAB) { planSumAB += pv; planCountAB++; }
        var _pStop = _elPlanIsStop(s, _aSig, _c);
        if (_pStop) planHasStop = true;
        planCapSum += _pStop ? _elCapLossYen(_c) : pv;
      }
    }
    var hv = _elDynHold(s, _aSig, _c);
    // 想定もH1もE基準未達(両miss=ノートレード)はEP損益が0なので、H1も0円扱いにして揃える（早見表で「—」でなく「0円」表示）。
    if (hv == null && _elH2Miss(s, _aSig)) hv = 0;
    if (hv != null) {
      var _hCapPlan = (_elPlanIsStop(s, _aSig, _c) && pv != null) ? pv : hv;
      var _hx1g = _elH1ExpAt(s, _aSig);   // 2026-07-06e
      if (_epIsTriEntry(s, _aSig)) {
        // EP△→H1も（）外0。○/△/損切り済は保有額を（）内（参考）へ・×/未設定は完全除外（1段下0を継承）。
        if (_hx1g && _hx1g !== "×") { holdRefSum += _hCapPlan; holdRefCnt++; }
      } else {
        holdSum += hv; holdCount++;
        var _hStop = _elHoldIsStop(s, _aSig, _c);
        if (_hStop) holdHasStop = true;
        holdCapSum += _hStop ? _elCapLossYen(_c) : hv;
        // 結果損益: 想定が損切りの行は想定額にキャップ（損切を踏まえた値）。
        var _fbHcg = (_hx1g !== "○");  // ○以外（×/△/損切り済/未設定）→想定額(EP損益)へフォールバック。未設定=×扱い
        if (_fbHcg && pv != null) {
          holdSumPlanCap += pv;
          if (isAB) { holdSumPlanCapAB += pv; holdCountAB++; }
          if ((_hx1g === "△" || _hx1g === "損切り済") && (_hCapPlan - pv) !== 0) { holdRefSum += (_hCapPlan - pv); holdRefCnt++; }  // △/損切り済のみH1保有時との差を参考（×/未設定は無し・差0除外）
        } else {
          holdSumPlanCap += _hCapPlan;
          if (isAB) { holdSumPlanCapAB += _hCapPlan; holdCountAB++; }
        }
      }
    }
    var _h2tg = _elHold2TotParts(s, _aSig, _c);  // 想定損切り→想定額(結果損益)、非損切り○/△→_elDynHold2、非損切り×→参考
    if (_h2tg.main != null) { hold2Sum += _h2tg.main; hold2Count++; }
    else if (_elH2Miss(s, _aSig)) { hold2Count++; }  // 両miss=ノートレードはH2も0円扱い（想定0と一致）
    if (_h2tg.ref != null) { hold2RefSum += _h2tg.ref; hold2RefCnt++; }
    }
    var _ovf = _elOsMaxFiltered(s, _aSig); if (_ovf != null) osVals.push(_ovf);  // OS値列＝OS1〜3の算入足の最高値（×/損切り済で打ち切り）2026-06-23
    var _cf = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
    if (_cf != null) confVals.push(_cf);
    if (s.holdOsConf != null) holdConfVals.push(Number(s.holdOsConf));
  });
  var _avg = function(a) { return a.length ? Math.round(a.reduce(function(x, y) { return x + y; }, 0) / a.length * 10) / 10 : null; };
  return {
    real:   _profitGradeFromPnlReal(realSum, realCount),
    plan:   _profitGradeFromPnl(planSum, planCount),
    hold:   _profitGradeFromPnl(holdSum, holdCount),
    planAB: planCountAB > 0 ? _profitGradeFromPnl(planSumAB, planCountAB) : null,
    planSumAB: planCountAB > 0 ? planSumAB : null,
    realSum: realCount > 0 ? realSum : null,
    planSum: planCount > 0 ? planSum : null,
    planRefSum: planRefCnt > 0 ? planRefSum : null, planRefCnt: planRefCnt,
    holdSum: holdCount > 0 ? holdSum : null,
    planCapSum: (planCount > 0 && planHasStop) ? planCapSum : null,
    holdCapSum: (holdCount > 0 && holdHasStop) ? holdCapSum : null,
    holdPlanCap: _profitGradeFromPnl(holdSumPlanCap, holdCount),
    holdSumPlanCap: holdCount > 0 ? holdSumPlanCap : null,
    holdRefSum: holdRefCnt > 0 ? holdRefSum : null, holdRefCnt: holdRefCnt,
    holdPlanCapAB: holdCountAB > 0 ? _profitGradeFromPnl(holdSumPlanCapAB, holdCountAB) : null,
    holdSumPlanCapAB: holdCountAB > 0 ? holdSumPlanCapAB : null,
    hold2Grade: hold2Count > 0 ? _profitGradeFromPnl(hold2Sum, hold2Count) : null,
    hold2Sum: hold2Count > 0 ? hold2Sum : null,
    hold2RefSum: hold2RefCnt > 0 ? hold2RefSum : null, hold2RefCnt: hold2RefCnt,
    planHasStop: planHasStop, holdHasStop: holdHasStop,
    allMiss: (_totCnt > 0 && _missCnt === _totCnt), allMissH: (_totCnt > 0 && _h2MissCnt === _totCnt),
    count: realCount,
    osAvg: _avg(osVals), confAvg: _avg(confVals), holdConfAvg: _avg(holdConfVals),
    alphaUsed: _fixedA ? alpha : null
  };
}


function _GradeBadges3(_p) {
  var grades = _p.grades; 
  var size = _p.size || 18;
  var smSize = size; 
  var _mkBadge = function(g, sz, border) {
    var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
    return React.createElement("span", { style: {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: sz, height: sz, borderRadius: "50%",
      background: gs.bg, color: gs.color,
      border: (border || (sz >= 16 ? "1.5px" : "1px")) + " solid " + gs.border,
      fontWeight: 800, fontSize: Math.round(sz * 0.6), lineHeight: 1, flexShrink: 0
    } }, g);
  };
  var items = [
    { key: "real", label: "実", fullLabel: "実現損益",    abKey: null },
    { key: "plan", label: "単", fullLabel: "EP損益",    abKey: null },
    { key: "hold", label: "H",  fullLabel: "結果損益(H)", abKey: null }
  ];
  return React.createElement("div", {
    style: { display: "flex", gap: 3, alignItems: "center", flexWrap: "nowrap" }
  }, items.map(function(item) {
    var allGrade = grades[item.key];
    var gs = _GRADE_STYLE[allGrade] || _GRADE_STYLE.Z;
    var amtSum = grades[item.key + "Sum"];
    var amtTxt = amtSum != null ? ((amtSum > 0 ? "+" : "") + amtSum.toLocaleString() + "円") : "";
    
    if (item.abKey && allGrade !== "Z") {
      var abGrade = grades[item.abKey];
      var mainGrade = abGrade || "D"; 
      return React.createElement("div", {
        key: item.key,
        title: item.fullLabel + ": B以上=" + mainGrade + " / 全=" + allGrade + (amtTxt ? "\n" + amtTxt : ""),
        style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }
      },
        React.createElement("span", { style: { fontSize: 8, color: "#aaa", lineHeight: 1, fontWeight: 600 } }, item.label),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 1 } },
          _mkBadge(mainGrade, size),
          React.createElement("span", { style: { fontSize: 7, color: "#bbb", lineHeight: 1 } }, "("),
          _mkBadge(allGrade, smSize),
          React.createElement("span", { style: { fontSize: 7, color: "#bbb", lineHeight: 1 } }, ")")
        )
      );
    }
    
    return React.createElement("div", {
      key: item.key,
      title: item.fullLabel + ": " + allGrade + " (" + (_GRADE_DESC[allGrade] || "") + ")" + (amtTxt ? "\n" + amtTxt : ""),
      style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }
    },
      React.createElement("span", { style: { fontSize: 8, color: "#aaa", lineHeight: 1, fontWeight: 600 } }, item.label),
      React.createElement("span", { style: {
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: "50%",
        background: gs.bg, color: gs.color,
        border: "1.5px solid " + gs.border,
        fontWeight: 800, fontSize: size * 0.6, lineHeight: 1
      } }, allGrade)
    );
  }));
}

function _elPnlPeriodFilter(records, period, from, to) {
  var today = todayStr();
  var now = new Date();
  if (period === "today") return records.filter(function(r) { return r.date === today; });
  if (period === "week") {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); 
    var ws = d.toISOString().slice(0, 10);
    return records.filter(function(r) { return r.date >= ws; });
  }
  if (period === "month") {
    return records.filter(function(r) { return r.date.slice(0, 7) === today.slice(0, 7); });
  }
  if (period === "year") {
    return records.filter(function(r) { return r.date.slice(0, 4) === today.slice(0, 4); });
  }
  if (period === "custom") {
    return records.filter(function(r) { return (!from || r.date >= from) && (!to || r.date <= to); });
  }
  return records; 
}
function _elFilterPeriod(records, period) {
  if (period === "all") return records;
  var now = new Date();
  if (period === "1w") {
    var day = now.getDay();
    var diffToMon = day === 0 ? -6 : 1 - day;
    var mon = new Date(now);
    mon.setDate(mon.getDate() + diffToMon);
    mon.setHours(0, 0, 0, 0);
    var monStr = mon.toISOString().slice(0, 10);
    var fri = new Date(mon);
    fri.setDate(fri.getDate() + 4);
    var friStr = fri.toISOString().slice(0, 10);
    return records.filter(function(r) { return r.date >= monStr && r.date <= friStr; });
  }
  var cutoff = new Date(now);
  if (period === "1m") cutoff.setMonth(cutoff.getMonth() - 1);
  else if (period === "3m") cutoff.setMonth(cutoff.getMonth() - 3);
  else if (period === "6m") cutoff.setMonth(cutoff.getMonth() - 6);
  else if (period === "1y") cutoff.setFullYear(cutoff.getFullYear() - 1);
  else return records;
  var cutStr = cutoff.toISOString().slice(0, 10);
  return records.filter(function(r) { return r.date >= cutStr; });
}


function _elTagLabel(s) {
  if (s.tags && s.tags.length > 0) return s.tags[0];
  if (s.tag && s.tag !== "__custom__") return s.tag;
  if (s.isCustomTag) return s.customTagText || "(その他)";
  return "(未設定)";
}

// シグナル詳細（案A階層型 2026-07-06→3セクション化 2026-07-07c）: signal.sigDetail={シグナル名:{b:底抜け(単一),k:起点(単一),f:[その他特徴...](複数)}}（任意）。
// 候補マスターはcustom.sigDetails2={シグナル名:{b:[],k:[],f:[]}}（セクション別・migrateDataで旧custom.sigDetailsから複製シード・旧キーは旧端末互換のため凍結＝新コードは編集しない）。
// 後方互換: 旧記録は sigDetail[t]=文字列（単一）/フラット配列（複数）＝③その他特徴(f)として読む（ユーザー決定 2026-07-07）。
// _elSigDetailSec がセクション読み取りの正本・_elSigDetailList は全セクションをフラット配列へ正規化（詳細サブタブ等の従来読者用＝名前ベースの集計は不変）。
// 表示(_elTagDisp)は「タグ（底:X・起:Y・特徴名...）」。分析のグループ化(_elTagEntries)は素のタグ名のまま＝シグナル全体の集計・名寄せは不変。
var _EL_SIG_SECS = [{ key: "b", label: "① 底抜け", multi: false }, { key: "k", label: "② 起点", multi: false }, { key: "f", label: "③ その他", multi: true }];   // 2026-07-08g「その他特徴」→「その他」（記録フォーム/分析の見出し共通・「特徴」削除）
function _elSigDetailSec(s, t) {
  var _v = (s && s.sigDetail && typeof s.sigDetail === "object") ? s.sigDetail[t] : null;
  if (_v == null) return { b: null, k: null, f: [] };
  if (typeof _v === "object" && !Array.isArray(_v)) {
    var _f = Array.isArray(_v.f) ? _v.f.filter(function(x) { return x; }) : (_v.f ? [_v.f] : []);
    return { b: _v.b || null, k: _v.k || null, f: _f };
  }
  if (Array.isArray(_v)) return { b: null, k: null, f: _v.filter(function(x) { return x; }) };
  return { b: null, k: null, f: [_v] };
}
function _elSigDetailList(s, t) {
  var _sec = _elSigDetailSec(s, t);
  var _out = [];
  [_sec.b, _sec.k].concat(_sec.f).forEach(function(x) { if (x && _out.indexOf(x) < 0) _out.push(x); });
  return _out;
}
function _elSigDetailOf(s, t) { var _l = _elSigDetailList(s, t); return _l.length ? _l[0] : null; }   // 後方互換の単一値（先頭）
// セクション内の詳細名の改名を1記録へ適用（マスター改名の一括追従用）。secKey="f"は旧形式（文字列/フラット配列）も③として改名対象・対象外の記録は同一参照のまま返す。
function _elSigDetailRenameSig(s, t, secKey, oldN, newN) {
  var _v = (s && s.sigDetail && typeof s.sigDetail === "object") ? s.sigDetail[t] : null;
  if (_v == null) return s;
  var _isObj = (typeof _v === "object" && !Array.isArray(_v));
  var _set = function(nv) { var _nsd = Object.assign({}, s.sigDetail); _nsd[t] = nv; return Object.assign({}, s, { sigDetail: _nsd }); };
  if (secKey === "f") {
    var _l = _isObj ? (Array.isArray(_v.f) ? _v.f : (_v.f ? [_v.f] : [])) : (Array.isArray(_v) ? _v : [_v]);
    if (_l.indexOf(oldN) < 0) return s;
    var _nl = []; _l.forEach(function(x) { var _y = (x === oldN) ? newN : x; if (_y && _nl.indexOf(_y) < 0) _nl.push(_y); });
    return _set(_isObj ? Object.assign({}, _v, { f: _nl }) : _nl);
  }
  if (!_isObj || _v[secKey] !== oldN) return s;
  var _nv = Object.assign({}, _v); _nv[secKey] = newN;
  return _set(_nv);
}
// ===== シグナル名マスター改名の全域追従（2026-07-07g・恒久版）=====
// oldNm→newNm を「旧名が保存される全箇所」へ一括適用した新しいdataを返す（改名UI＝EPナビ選択肢管理から呼ぶ。保存自体はsave側）。
// 改名先が既存名でも「統合」として実行（配列=和集合・単一値=新名側優先で欠けのみ補完）＝マスターだけ変わり過去記録が別シグナル扱いになる事故を防ぐ。
// 対象は migrateData の _migSignalRename2 と同一: 記録(tag/tagsのdedupe/sigDetailキー)・custom.signalTags/ukiSignalNames/ukiSignalName/sigDetails/sigDetails2・
// 出現欄メモ(apMemos「s|id|名前」キー)・手動出現(appearances[].name kind=signal)・EPナビ保存(epNavi[].tag)。
// 完全削除（マスターから外すだけ）は対象外＝過去記録の名前は従来どおり残す。変化のないchartsエントリは同一参照のまま（copy-on-write）。
function _elSignalRenameData(prev, oldNm, newNm) {
  if (!prev || !oldNm || !newNm || oldNm === newNm) return prev;
  var _rn = function(x) { return x === oldNm ? newNm : x; };
  var _uniq = function(a) { var o = []; (a || []).forEach(function(x) { if (x && o.indexOf(x) < 0) o.push(x); }); return o; };
  var _rnList = function(arr) { return _uniq(arr.map(_rn)); };
  var _mergeArr = function(nw, od) { return _uniq([].concat(Array.isArray(nw) ? nw : [], Array.isArray(od) ? od : [])); };
  var _renameKey = function(m, mergeFn) {
    if (!m || typeof m !== "object" || m[oldNm] === undefined) return m;
    var n = Object.assign({}, m);
    n[newNm] = (n[newNm] !== undefined) ? mergeFn(n[newNm], n[oldNm]) : n[oldNm];
    delete n[oldNm];
    return n;
  };
  var _mergeSec = function(nw, od) { var n = (nw && typeof nw === "object") ? nw : {}, o = (od && typeof od === "object") ? od : {}; return { b: _mergeArr(n.b, o.b), k: _mergeArr(n.k, o.k), f: _mergeArr(n.f, o.f) }; };
  var _mergeRecSec = function(nw, od) {
    var n = (nw && typeof nw === "object") ? nw : {}, o = (od && typeof od === "object") ? od : {};
    var out = {};
    if (n.b || o.b) out.b = n.b || o.b;
    if (n.k || o.k) out.k = n.k || o.k;
    var f = _mergeArr(Array.isArray(n.f) ? n.f : (n.f ? [n.f] : []), Array.isArray(o.f) ? o.f : (o.f ? [o.f] : []));
    if (f.length) out.f = f;
    return out;
  };
  var custom = Object.assign({}, prev.custom || {});
  if (Array.isArray(custom.signalTags)) custom.signalTags = _rnList(custom.signalTags);
  if (Array.isArray(custom.ukiSignalNames)) custom.ukiSignalNames = _rnList(custom.ukiSignalNames);
  if (custom.ukiSignalName === oldNm) custom.ukiSignalName = newNm;
  custom.sigDetails = _renameKey(custom.sigDetails, _mergeArr);
  custom.sigDetails2 = _renameKey(custom.sigDetails2, _mergeSec);
  var charts = prev.charts || {}, nCharts = {};
  Object.keys(charts).forEach(function(ck) {
    var c = charts[ck];
    if (!c) { nCharts[ck] = c; return; }
    var nc = c, changed = false;
    var _own = function() { if (!changed) { nc = Object.assign({}, c); changed = true; } };
    if (Array.isArray(c.signals) && c.signals.some(function(s) { return s && (s.tag === oldNm || s.customTagText === oldNm || (Array.isArray(s.tags) && s.tags.indexOf(oldNm) >= 0) || (s.sigDetail && typeof s.sigDetail === "object" && s.sigDetail[oldNm] !== undefined)); })) {
      _own();
      nc.signals = c.signals.map(function(s) {
        if (!s) return s;
        var hit = s.tag === oldNm || s.customTagText === oldNm || (Array.isArray(s.tags) && s.tags.indexOf(oldNm) >= 0) || (s.sigDetail && typeof s.sigDetail === "object" && s.sigDetail[oldNm] !== undefined);
        if (!hit) return s;
        var ns = Object.assign({}, s);
        if (ns.tag === oldNm) ns.tag = newNm;
        if (ns.customTagText === oldNm) ns.customTagText = newNm;
        if (Array.isArray(ns.tags)) ns.tags = _rnList(ns.tags);
        if (ns.sigDetail && typeof ns.sigDetail === "object") ns.sigDetail = _renameKey(Object.assign({}, ns.sigDetail), _mergeRecSec);
        return ns;
      });
    }
    var _apKeyNm = function(k) { var p = k.split("|"); return (p[0] === "s" && p.length >= 3) ? p.slice(2).join("|") : null; };
    // apMemosキーの名前部は書込時にstripCat(名前)で保存される（app-02 _apSetAutoMemo）ため、比較/付け替えもstripCatで揃える。通常のシグナル名（コロン無し）ではstripCatは恒等でno-op。2026-07-08
    var _apOld = (typeof stripCat === "function") ? stripCat(oldNm) : oldNm, _apNew = (typeof stripCat === "function") ? stripCat(newNm) : newNm;
    if (c.apMemos && typeof c.apMemos === "object" && Object.keys(c.apMemos).some(function(k) { return _apKeyNm(k) === _apOld; })) {
      _own();
      var nm = {};
      Object.keys(c.apMemos).forEach(function(k) {
        var p = k.split("|");
        var k2 = (_apKeyNm(k) === _apOld) ? (p[0] + "|" + p[1] + "|" + _apNew) : k;
        if (!(k2 in nm)) nm[k2] = c.apMemos[k];
      });
      nc.apMemos = nm;
    }
    if (Array.isArray(c.appearances) && c.appearances.some(function(ap) { return ap && ap.kind === "signal" && ap.name === oldNm; })) {
      _own();
      nc.appearances = c.appearances.map(function(ap) { return (ap && ap.kind === "signal" && ap.name === oldNm) ? Object.assign({}, ap, { name: newNm }) : ap; });
    }
    if (Array.isArray(c.epNavi) && c.epNavi.some(function(en) { return en && en.tag === oldNm; })) {
      _own();
      nc.epNavi = c.epNavi.map(function(en) { return (en && en.tag === oldNm) ? Object.assign({}, en, { tag: newNm }) : en; });
    }
    nCharts[ck] = nc;
  });
  return Object.assign({}, prev, { custom: custom, charts: nCharts });
}
function _elTagDisp(s, t) {
  var _sec = _elSigDetailSec(s, t);
  var _ps = [];
  if (_sec.b) _ps.push("底:" + _sec.b);
  if (_sec.k) _ps.push("起:" + _sec.k);
  _sec.f.forEach(function(x) { _ps.push(x); });
  return _ps.length ? t + "（" + _ps.join("・") + "）" : t;
}
// シグナルセルの2行表示（案B 2026-07-07）: 1行目=シグナル名、2行目=底X・起Y、3行目=③特徴。詳細が1つも無い記録は赤「詳細未選択」バッジで明示。_elTagDisp（1行括弧表記）の縦積み版で、明細表のシグナル欄に使う。
function _elSigCellNode(s, t, key) {
  var _sec = _elSigDetailSec(s, t);
  var _hasDet = !!(_sec.b || _sec.k || (_sec.f && _sec.f.length));
  var _bk = [];
  if (_sec.b) _bk.push("底 " + _sec.b);
  if (_sec.k) _bk.push("起 " + _sec.k);
  var _feat = (_sec.f || []).filter(Boolean);
  return React.createElement("div", { key: key, style: { lineHeight: 1.3 } },
    React.createElement("div", { style: { fontWeight: 700, color: "#334155", fontSize: 11 } }, t),
    _bk.length ? React.createElement("div", { style: { fontSize: 9.5, color: "#64748B", lineHeight: 1.25 } }, _bk.join("・")) : null,
    _feat.length ? React.createElement("div", { style: { fontSize: 9.5, color: "#64748B", lineHeight: 1.25 } }, "特徴 " + _feat.join("・")) : null,
    !_hasDet ? React.createElement("div", { style: { display: "inline-block", fontSize: 8.5, fontWeight: 700, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 3, padding: "0 4px", marginTop: 1 } }, "詳細未選択") : null);
}
// 明細表のシグナル欄（全タグ＋カスタムタグ＋未設定）を案Bの縦積みで返す共有部品。align=セル内の水平寄せ。
function _elSigCell(s, align) {
  var _tags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : []));
  var _nodes = _tags.map(function(_t, _i) { return _elSigCellNode(s, _t, _i); });
  if (s.isCustomTag) _nodes.push(React.createElement("div", { key: "cust", style: { fontWeight: 700, color: "#334155", fontSize: 11 } }, s.customTagText || "(その他)"));
  // タグ非設定でカテゴリ記録（日経/マクロ等・sigDetail概念なし）はプレーン表示（詳細未選択バッジは出さない）
  if (!_nodes.length && s.categories && s.categories.length) _nodes = s.categories.map(function(_c, _i) { return React.createElement("div", { key: "c" + _i, style: { fontWeight: 700, color: "#334155", fontSize: 11 } }, _c); });
  if (!_nodes.length) return React.createElement("span", { style: { color: "#94A3B8" } }, "(未設定)");
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: align || "center", gap: 3 } }, _nodes);
}
function _elTagEntries(s) {
  var entries = [];
  var stdTags = s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : []);
  stdTags.forEach(function(t) { entries.push({ key: t, label: t, isCustom: false }); });
  if (s.isCustomTag) entries.push({ key: "__c__" + (s.customTagText || "(空)"), label: s.customTagText || "(その他)", isCustom: true });
  if (entries.length === 0) entries.push({ key: "(未設定)", label: "(未設定)", isCustom: false });
  return entries;
}


function _elGetItemCandidates(data, date, stock) {
  var dd = (data.trades || {})[date];
  if (!dd || !Array.isArray(dd.items)) return [];
  if (!stock) return dd.items;
  return dd.items.filter(function(it) { return it.stock === stock; });
}


function _elSetItemSignalRef(save, date, itemId, signalId, stock) {
  save(function(prev) {
    var dd = (prev.trades || {})[date] || {};
    var items = (dd.items || []).map(function(it) {
      if (String(it.id) === String(itemId)) {
        return Object.assign({}, it, { signalId: signalId, signalStock: stock });
      }
      return it;
    });
    var nt = Object.assign({}, prev.trades || {});
    nt[date] = Object.assign({}, dd, { items: items });
    return Object.assign({}, prev, { trades: nt });
  });
}


function _elSaveSignal(save, stock, date, signal, isNew) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    var c = charts[ck] || { signals: [] };
    var signals = Array.isArray(c.signals) ? c.signals.slice() : [];
    if (isNew) {
      signals.push(signal);
    } else {
      var idx = signals.findIndex(function(s) { return s.id === signal.id; });
      if (idx >= 0) signals[idx] = signal;
      else signals.push(signal);
    }
    charts[ck] = Object.assign({}, c, { signals: signals });
    return Object.assign({}, prev, { charts: charts });
  });
}


function _elDeleteSignal(save, stock, date, signalId) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    var c = charts[ck];
    if (!c || !Array.isArray(c.signals)) return prev;
    var signals = c.signals.filter(function(s) { return s.id !== signalId; });
    // 削除トムストーン: 物理削除に加え削除idを_delSigに記録＝多端末同期で復活させない（[[project-scalping-signal-delete-resurrection]]）。2026-06-19
    var dels = Array.isArray(c._delSig) ? c._delSig.slice() : [];
    var _sid = String(signalId);
    if (dels.indexOf(_sid) < 0) dels.push(_sid);
    charts[ck] = Object.assign({}, c, { signals: signals, _delSig: dels });
    return Object.assign({}, prev, { charts: charts });
  });
}



function _toHankakuNum(s) {
  return String(s == null ? "" : s).replace(/[０-９]/g, function(c) {
    return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
  }).replace(/[^0-9]/g, "");
}


function _toHankakuDecimal(s) {
  var str = String(s == null ? "" : s)
    .replace(/[０-９]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
    .replace(/[。．]/g, ".")
    .replace(/[^0-9.]/g, "");
  var parts = str.split(".");
  return parts.length > 1 ? parts[0] + "." + parts.slice(1).join("") : str;
}


var _lpState = null;
function _clearLpState() {
  if (_lpState) { clearTimeout(_lpState.to); if (_lpState.iv) clearInterval(_lpState.iv); _lpState = null; }
}
var _stepBtn = function(onInc, onDec) {
  var _bs = { flex: "1", padding: "0", border: "none", background: "transparent", cursor: "pointer", fontSize: 9, minWidth: 20, lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center", color: "#c0c0c0" };
  var _startLp = function(fn, e) {
    e.preventDefault();
    _clearLpState();
    fn();
    var _to = setTimeout(function() {
      if (_lpState) _lpState.iv = setInterval(fn, 80);
    }, 350);
    _lpState = { to: _to, iv: null };
    document.addEventListener("pointerup", _clearLpState, { once: true });
    document.addEventListener("pointercancel", _clearLpState, { once: true });
  };
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", borderLeft: "1px solid #ebebeb", flexShrink: 0, background: "#fafafa" } },
    React.createElement("button", { type: "button", tabIndex: -1,
      onPointerDown: function(e) { _startLp(onInc, e); },
      style: Object.assign({}, _bs, { borderBottom: "1px solid #ebebeb" }) }, "▲"),
    React.createElement("button", { type: "button", tabIndex: -1,
      onPointerDown: function(e) { _startLp(onDec, e); },
      style: _bs }, "▼")
  );
};




function VirtualAlphaCalc(_ref_vac) {
  var sigsByStock = _ref_vac.sigsByStock;
  var cutLineByStock = _ref_vac.cutLineByStock || {};
  var stocks = Object.keys(sigsByStock);
  var _s1 = useState({}), _s1a = _slicedToArray(_s1, 2);
  var alphaByStock = _s1a[0], setAlphaByStock = _s1a[1];
  if (!stocks.length) return null;
  var calcResults = function(stock, aStr) {
    var alpha = Number(_toHankaku(aStr));
    if (aStr === "" || isNaN(alpha)) return null;
    var sigs = sigsByStock[stock] || [];
    var cutLine = cutLineByStock[stock] != null ? cutLineByStock[stock] : 10;
    var planTotal = 0, resultTotal = 0, hasPlan = false, hasResult = false;
    sigs.forEach(function(d) {
      if (d.osVal == null) return;
      var _miss = alpha > d.osVal;

      if (!_miss) {
        if (d.osVal - alpha >= cutLine) { planTotal += -(d.osVal - alpha) * 100; hasPlan = true; }
        else if (d.conf != null) { planTotal += (alpha - d.conf) * 100; hasPlan = true; }
      }

      var _hhEnter = d.holdHighSign === "-" && d.holdHighVal != null && d.holdHighVal > alpha;
      if (!_miss || _hhEnter) {
        if (d.holdHighSign === "-" && d.holdHighVal != null && (d.holdHighVal - alpha) >= cutLine) {
          resultTotal += -((d.holdHighVal - alpha) * 100); hasResult = true;
        } else if (!_miss && d.osVal - alpha >= cutLine) {
          resultTotal += -(d.osVal - alpha) * 100; hasResult = true;
        } else if (d.holdOsConf != null) {
          resultTotal += (alpha + (alpha - d.holdOsConf)) * 100; hasResult = true;
        }
      }
    });
    return { plan: hasPlan ? Math.round(planTotal) : null, result: hasResult ? Math.round(resultTotal) : null };
  };
  var fmtAmt = function(v) { return v == null ? "—" : (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
  var amtCol = function(v) { return v == null ? "#aaa" : v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
  return React.createElement("div", {
    style: { marginTop: 8, padding: "6px 10px", borderRadius: 7, background: "#FFFBF0", border: "1px solid #FDE68A" }
  },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 6 } }, "α値シミュレーション"),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
      stocks.map(function(stock) {
        var aStr = alphaByStock[stock] || "10";
        var res = calcResults(stock, aStr);
        var plan = res ? res.plan : null, result = res ? res.result : null;
        return React.createElement("div", { key: stock, style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
          stocks.length > 1 && React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#92400E", minWidth: 48 } }, stock),
          React.createElement("span", { style: { fontSize: 11, color: "#666" } }, "α値"),
          React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", min: "0", max: "50", step: "1", value: aStr,
              onChange: function(e) {
                var v = _toHankaku(e.target.value);
                if (v !== "") { var _vn = Number(v); if (!isNaN(_vn)) { if (_vn > 50) _vn = 50; if (_vn < 0) _vn = 0; v = String(_vn); } }
                setAlphaByStock(function(prev) { var n = Object.assign({}, prev); n[stock] = v; return n; });
              },
              placeholder: "0〜50",
              style: { width: 64, fontSize: 12, border: "none", outline: "none", background: "#fff", padding: "3px 6px", textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(
              function() { setAlphaByStock(function(prev) { var n = Object.assign({}, prev); n[stock] = String(Math.min(50, (parseFloat(prev[stock]||"5")||0) + 1)); return n; }); },
              function() { setAlphaByStock(function(prev) { var n = Object.assign({}, prev); n[stock] = String(Math.max(0, (parseFloat(prev[stock]||"5")||0) - 1)); return n; }); }
            )
          ),
          React.createElement("span", { style: { fontSize: 11, color: "#666" } }, "円"),
          React.createElement("span", { style: { fontSize: 10, color: "#888" } }, "→ 単独"),
          React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: amtCol(plan) } }, fmtAmt(plan)),
          React.createElement("span", { style: { fontSize: 10, color: "#888" } }, "結果"),
          React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: amtCol(result) } }, fmtAmt(result))
        );
      })
    )
  );
}




function EntryRecordForm(_ref_erf) {
  var data = _ref_erf.data,
    save = _ref_erf.save,
    initial = _ref_erf.initial,  
    onClose = _ref_erf.onClose;
  var custom = data.custom || {};
  var allStocks = custom.stocks && custom.stocks.length > 0 ? custom.stocks : _DEF_STOCKS_FROZEN;
  var signalTags = custom.signalTags || [];
  var isEdit = !!(initial && initial.signal);
  // 二重送信ガード: 新規記録の保存中に保存ボタンを連打しても重複作成しない。2026-06-20
  var _savingRef = useRef(false);

  var initSig = isEdit ? initial.signal : {};
  // 常にEP起算方式フォーム（OS1〜5固定欄・scheme:3で保存）。旧記録の編集も新レイアウトで再入力する。
  var isV2Form = true;
  // scheme:2（旧ミラー同期方式）の記録取り込み: _epLegs（写し除去済みの実在足の並び）を位置でOS2〜OS5欄へ展開し直す。
  // 同期導入前の記録（OS2/OS3欄が空でhold欄に実データ）はhold欄の足がOS2/OS3欄へ入る。scheme:3・旧記録はそのまま。
  var _initHold = (function() {
    var o = {
      os2High: initSig.os2High, os2HighSign: initSig.os2HighSign || "+", os2Conf: initSig.os2Conf, os2ConfSign: initSig.os2ConfSign || null,
      os3High: initSig.os3High, os3HighSign: initSig.os3HighSign || "+", os3Conf: initSig.os3Conf, os3ConfSign: initSig.os3ConfSign || null,
      hHigh: initSig.holdHighVal, hHighS: initSig.holdHighSign, hW: initSig.holdWidth, hWS: initSig.holdWidthSign, hOC: initSig.holdOsConf,
      h2High: initSig.hold2HighVal, h2HighS: initSig.hold2HighSign, h2W: initSig.hold2Width, h2WS: initSig.hold2WidthSign, h2OC: initSig.hold2OsConf
    };
    // scheme:3は既にOS2〜OS5が正しい位置→素通し。scheme:2＝旧ミラー同期方式・schemeなし＝OS1〜5概念導入前の
    // 旧記録（H1=holdHighVal・H2=hold2HighVal）はともに_epLegs順で実在足をOS2〜OS5へ展開＝旧H1→OS2・旧H2→OS3。
    if (initSig.scheme === 3) return o;
    var _Li = _epLegs(initSig);
    if (!_Li.length || _Li[0].role !== "os1") return o;
    var _osS = function(v) { return v == null ? null : v < 0 ? "-" : "+"; };
    var _hS = function(v) { return v == null ? null : v < 0 ? "+" : "-"; };
    var _bi = function(i) { return _Li[i] || { h: null, c: null }; };
    var _b1 = _bi(1), _b2 = _bi(2), _b3 = _bi(3), _b4 = _bi(4);
    return {
      os2High: _b1.h != null ? Math.abs(_b1.h) : null, os2HighSign: _b1.h != null ? _osS(_b1.h) : "+", os2Conf: _b1.c != null ? Math.abs(_b1.c) : null, os2ConfSign: _osS(_b1.c),
      os3High: _b2.h != null ? Math.abs(_b2.h) : null, os3HighSign: _b2.h != null ? _osS(_b2.h) : "+", os3Conf: _b2.c != null ? Math.abs(_b2.c) : null, os3ConfSign: _osS(_b2.c),
      hHigh: _b3.h != null ? Math.abs(_b3.h) : null, hHighS: _hS(_b3.h), hW: _b3.c != null ? Math.abs(_b3.c) : null, hWS: _hS(_b3.c), hOC: null,
      h2High: _b4.h != null ? Math.abs(_b4.h) : null, h2HighS: _hS(_b4.h), h2W: _b4.c != null ? Math.abs(_b4.c) : null, h2WS: _hS(_b4.c), h2OC: null
    };
  })();
  var _useStateE1 = useState((initial && initial.date) || todayStr()),
    _useStateE2 = _slicedToArray(_useStateE1, 2),
    fDate = _useStateE2[0], setFDate = _useStateE2[1];
  var _useStateE3 = useState((initial && initial.stock) || (allStocks[0] || "")),
    _useStateE4 = _slicedToArray(_useStateE3, 2),
    fStock = _useStateE4[0], setFStock = _useStateE4[1];
  var _useStateE5 = useState(initSig.time || ""),
    _useStateE6 = _slicedToArray(_useStateE5, 2),
    fTime = _useStateE6[0], setFTime = _useStateE6[1];
  var _useStateE7 = useState(!!initSig.isCustomTag),
    _useStateE8 = _slicedToArray(_useStateE7, 2),
    fIsCustom = _useStateE8[0], setFIsCustom = _useStateE8[1];
  var _useStateE9 = useState(initSig.tags ? initSig.tags : (initSig.tag && initSig.tag !== "__custom__" ? [initSig.tag] : [])),
    _useStateE10 = _slicedToArray(_useStateE9, 2),
    fTags = _useStateE10[0], setFTags = _useStateE10[1];
  var _useStateE11 = useState(initSig.customTagText || ""),
    _useStateE12 = _slicedToArray(_useStateE11, 2),
    fCustomText = _useStateE12[0], setFCustomText = _useStateE12[1];
  var _useStateE13 = useState(initSig.rationale || ""),
    _useStateE14 = _slicedToArray(_useStateE13, 2),
    fRationale = _useStateE14[0], setFRationale = _useStateE14[1];
  var _useStateE15 = useState(initSig.entered === true || (isEdit && initSig.itemId != null)),
    _useStateE16 = _slicedToArray(_useStateE15, 2),
    fEntered = _useStateE16[0], setFEntered = _useStateE16[1];
  var _useStateE17 = useState(initSig.itemId || null),
    _useStateE18 = _slicedToArray(_useStateE17, 2),
    fItemId = _useStateE18[0], setFItemId = _useStateE18[1];
  // スルー（実エントリー3択の第3状態 2026-07-06）: entered=false＋passThrough=true で保存。_elInclTotalが常に不算入扱い・一覧は灰色表示。
  var _useStateTHR = useState(initSig.passThrough === true),
    _useStateTHRA = _slicedToArray(_useStateTHR, 2),
    fThru = _useStateTHRA[0], setFThru = _useStateTHRA[1];
  // スルーの根拠メモ（2026-07-06c）: スルー選択時のみ表示・signal.thruMemoに保存（反省・メモ欄と同システム=FastInput multiline+autoResize）。
  var _useStateTHM = useState(initSig.thruMemo || ""),
    _useStateTHMA = _slicedToArray(_useStateTHM, 2),
    fThruMemo = _useStateTHMA[0], setFThruMemo = _useStateTHMA[1];
  // シグナル詳細（3セクション化 2026-07-07c）: 選択タグごとに {b:①底抜け(単一), k:②起点(単一), f:[③その他特徴...](複数)}・任意。signal.sigDetail={タグ名:{b,k,f}}。
  // 候補はcustom.sigDetails2={タグ名:{b,k,f}}（タグに無ければ旧custom.sigDetails[タグ]を各セクションへ複製表示）。
  // 旧記録(sigDetail[t]=文字列/フラット配列)は③その他特徴(f)として読み込む（_elSigDetailSec・ユーザー決定 2026-07-07）＝保存すると新形式{f:[...]}に置き換わる。
  var _useStateSGD = useState((function() {
    var _src = (initSig.sigDetail && typeof initSig.sigDetail === "object") ? initSig.sigDetail : {};
    var _o = {};
    Object.keys(_src).forEach(function(_k) { var _s = _elSigDetailSec(initSig, _k); if (_s.b || _s.k || _s.f.length) _o[_k] = { b: _s.b, k: _s.k, f: _s.f.slice() }; });
    return _o;
  })()),
    _useStateSGDA = _slicedToArray(_useStateSGD, 2),
    fSigDetail = _useStateSGDA[0], setFSigDetail = _useStateSGDA[1];
  // ①②③各セクションの分足オーバーライド（フォーム状態）: signal.sigDetail[タグ].bBar/kBar/fBar(number配列)から復元。値=文字列配列["1"/"5"] or null(=分足欄fMinBarsに追従)。2026-07-09。
  var _useStateSCB = useState((function() {
    var _src = (initSig.sigDetail && typeof initSig.sigDetail === "object") ? initSig.sigDetail : {};
    var _rd = function(_val) { if (_val == null) return null; var _a = Array.isArray(_val) ? _val : [_val]; var _out = []; _a.forEach(function(_x) { var _sx = String(_x); if ((_sx === "1" || _sx === "5") && _out.indexOf(_sx) < 0) _out.push(_sx); }); return _out.length ? _out.sort() : null; };
    var _o = {};
    Object.keys(_src).forEach(function(_k) { var _v = _src[_k]; if (!_v || typeof _v !== "object" || Array.isArray(_v)) return; var _b = _rd(_v.bBar), _kk = _rd(_v.kBar), _f = _rd(_v.fBar); if (_b || _kk || _f) _o[_k] = { b: _b, k: _kk, f: _f }; });
    return _o;
  })()),
    _useStateSCBA = _slicedToArray(_useStateSCB, 2),
    fSecBar = _useStateSCBA[0], setFSecBar = _useStateSCBA[1];
  var _useStateSGE = useState(false),
    _useStateSGEA = _slicedToArray(_useStateSGE, 2),
    fDetEdit = _useStateSGEA[0], setFDetEdit = _useStateSGEA[1];
  // シグナル詳細のドラッグ並び替え（2026-07-06b→セクション対応 2026-07-07c）: Pointer Eventsでチップを掴んで移動（iPadタッチ対応・touchAction:none）。
  // ドラッグ中はfDetOrder={tag,sec,list}で並びをプレビューし、指を離した時にcustom.sigDetails2[tag][sec]へ保存（同一セクション内のみ移動可）。
  // タップ（選択/削除）とは移動量7pxのしきい値で区別・ドラッグ直後のclickは_detMovedRefで1回だけ抑止。
  var _useStateSGO = useState(null),
    _useStateSGOA = _slicedToArray(_useStateSGO, 2),
    fDetOrder = _useStateSGOA[0], setFDetOrder = _useStateSGOA[1];
  var _detDragRef = useRef(null);
  var _detMovedRef = useRef(false);
  // ＋追加をインライン入力欄に変更（2026-07-06d）: iPadのホーム画面起動(standalone)ではwindow.prompt/confirmが無反応（即null）になるため、詳細まわりのネイティブダイアログを廃止。
  // fDetAdd={tag,sec,val}=追加/{tag,sec,val,old}=改名（セクション対応 2026-07-07c・値の正本は_detAddValRef・確定時に_fiFlushAll）。編集モード=チップ横に✎(改名・過去記録も一括追従)/×(削除)ミニボタン＝根拠選択肢と同型（2026-07-06e・2タップ削除は廃止）。
  var _useStateSGA = useState(null),
    _useStateSGAA = _slicedToArray(_useStateSGA, 2),
    fDetAdd = _useStateSGAA[0], setFDetAdd = _useStateSGAA[1];
  var _detAddValRef = useRef("");
  var _useStateE19 = useState(initSig.result || ""),
    _useStateE20 = _slicedToArray(_useStateE19, 2),
    fResult = _useStateE20[0], setFResult = _useStateE20[1];
  var _useStateE21 = useState(initSig.plannedPnlSign || "+"),
    _useStateE22 = _slicedToArray(_useStateE21, 2),
    fPlanSign = _useStateE22[0], setFPlanSign = _useStateE22[1];
  var _useStateE23 = useState(initSig.plannedPnl != null ? String(Math.abs(Number(initSig.plannedPnl))) : ""),
    _useStateE24 = _slicedToArray(_useStateE23, 2),
    fPlan = _useStateE24[0], setFPlan = _useStateE24[1];
  var _useStateE25 = useState(initSig.maxPnlSign || "+"),
    _useStateE26 = _slicedToArray(_useStateE25, 2),
    fMaxSign = _useStateE26[0], setFMaxSign = _useStateE26[1];
  var _useStateE27 = useState(initSig.maxPnl != null ? String(Math.abs(Number(initSig.maxPnl))) : ""),
    _useStateE28 = _slicedToArray(_useStateE27, 2),
    fMax = _useStateE28[0], setFMax = _useStateE28[1];
  var _useStateE29 = useState(initSig.reflection || initSig.memo || ""),
    _useStateE30 = _slicedToArray(_useStateE29, 2),
    fReflection = _useStateE30[0], setFReflection = _useStateE30[1];
  
  var _useStateDif = useState(initSig.difficulty || ""),
    _useStateDifA = _slicedToArray(_useStateDif, 2),
    fDifficulty = _useStateDifA[0], setFDifficulty = _useStateDifA[1];
  var _useStateTPD = useState(initSig.tpDifficulty || ""),
    _useStateTPDA = _slicedToArray(_useStateTPD, 2),
    fTpDifficulty = _useStateTPDA[0], setFTpDifficulty = _useStateTPDA[1];
  
  var _useStateOSV = useState(initSig.osVal != null ? String(initSig.osVal) : ""),
    _useStateOSVA = _slicedToArray(_useStateOSV, 2),
    fOsVal = _useStateOSVA[0], setFOsVal = _useStateOSVA[1];
  
  
  var _useStateHP0 = useState(initSig.holdProfit || null),
    _useStateHP0A = _slicedToArray(_useStateHP0, 2),
    fHoldProfit = _useStateHP0A[0], setFHoldProfit = _useStateHP0A[1];
  
  var _useStateHES = useState(initSig.holdExtractSign || "+"),
    _useStateHESA = _slicedToArray(_useStateHES, 2),
    fHoldExtractSign = _useStateHESA[0], setFHoldExtractSign = _useStateHESA[1];
  var _useStateHEV = useState(initSig.holdExtract != null ? String(Math.abs(Number(initSig.holdExtract))) : ""),
    _useStateHEVA = _slicedToArray(_useStateHEV, 2),
    fHoldExtract = _useStateHEVA[0], setFHoldExtract = _useStateHEVA[1];
  
  var _useStateHPS = useState(initSig.holdPnlSign || null),
    _useStateHPSA = _slicedToArray(_useStateHPS, 2),
    fHoldPnlSign = _useStateHPSA[0], setFHoldPnlSign = _useStateHPSA[1];
  var _useStateHPV = useState(initSig.holdPnl != null ? String(Math.abs(Number(initSig.holdPnl))) : ""),
    _useStateHPVA = _slicedToArray(_useStateHPV, 2),
    fHoldPnlVal = _useStateHPVA[0], setFHoldPnlVal = _useStateHPVA[1];
  
  var _useStateHOC = useState(_initHold.hOC != null ? Number(_initHold.hOC) : null),
    _useStateHOCA = _slicedToArray(_useStateHOC, 2),
    fHoldOsConf = _useStateHOCA[0], setFHoldOsConf = _useStateHOCA[1];

  var _useStateHWS = useState(_initHold.hWS || null),
    _useStateHWSA = _slicedToArray(_useStateHWS, 2),
    fHoldWidthSign = _useStateHWSA[0], setFHoldWidthSign = _useStateHWSA[1];
  var _useStateHWV = useState(_initHold.hW != null ? String(Math.abs(Number(_initHold.hW))) : ""),
    _useStateHWVA = _slicedToArray(_useStateHWV, 2),
    fHoldWidthVal = _useStateHWVA[0], setFHoldWidthVal = _useStateHWVA[1];
  var _useStateHHS = useState(_initHold.hHighS || null),
    _useStateHHSA = _slicedToArray(_useStateHHS, 2),
    fHoldHighSign = _useStateHHSA[0], setFHoldHighSign = _useStateHHSA[1];
  var _useStateHHV = useState(_initHold.hHigh != null ? String(Math.abs(Number(_initHold.hHigh))) : ""),
    _useStateHHVA = _slicedToArray(_useStateHHV, 2),
    fHoldHighVal = _useStateHHVA[0], setFHoldHighVal = _useStateHHVA[1];
  // H1/H2期待度state（holdExp/hold2Exp）は廃止 2026-07-06＝次足期待度fNxs（足固定・OS state群の直後）に統一。表示・保存用のfHoldExp/fHold2Expは_epFormState直後に現在EP位置から導出。

  // === Hold2（H2）state — Hold1と同一構成 ===
  var _useStateH2HP = useState(initSig.hold2Profit || null),
    _useStateH2HPA = _slicedToArray(_useStateH2HP, 2),
    fHold2Profit = _useStateH2HPA[0], setFHold2Profit = _useStateH2HPA[1];
  var _useStateH2PS = useState(initSig.hold2PnlSign || null),
    _useStateH2PSA = _slicedToArray(_useStateH2PS, 2),
    fHold2PnlSign = _useStateH2PSA[0], setFHold2PnlSign = _useStateH2PSA[1];
  var _useStateH2PV = useState(initSig.hold2Pnl != null ? String(Math.abs(Number(initSig.hold2Pnl))) : ""),
    _useStateH2PVA = _slicedToArray(_useStateH2PV, 2),
    fHold2PnlVal = _useStateH2PVA[0], setFHold2PnlVal = _useStateH2PVA[1];
  var _useStateH2OC = useState(_initHold.h2OC != null ? Number(_initHold.h2OC) : null),
    _useStateH2OCA = _slicedToArray(_useStateH2OC, 2),
    fHold2OsConf = _useStateH2OCA[0], setFHold2OsConf = _useStateH2OCA[1];
  var _useStateH2WS = useState(_initHold.h2WS || null),
    _useStateH2WSA = _slicedToArray(_useStateH2WS, 2),
    fHold2WidthSign = _useStateH2WSA[0], setFHold2WidthSign = _useStateH2WSA[1];
  var _useStateH2WV = useState(_initHold.h2W != null ? String(Math.abs(Number(_initHold.h2W))) : ""),
    _useStateH2WVA = _slicedToArray(_useStateH2WV, 2),
    fHold2WidthVal = _useStateH2WVA[0], setFHold2WidthVal = _useStateH2WVA[1];
  var _useStateH2HS = useState(_initHold.h2HighS || null),
    _useStateH2HSA = _slicedToArray(_useStateH2HS, 2),
    fHold2HighSign = _useStateH2HSA[0], setFHold2HighSign = _useStateH2HSA[1];
  var _useStateH2HV = useState(_initHold.h2High != null ? String(Math.abs(Number(_initHold.h2High))) : ""),
    _useStateH2HVA = _slicedToArray(_useStateH2HV, 2),
    fHold2HighVal = _useStateH2HVA[0], setFHold2HighVal = _useStateH2HVA[1];
  var _useStateHMemo = useState(initSig.holdMemo || ""), fHoldMemo = _useStateHMemo[0], setFHoldMemo = _useStateHMemo[1];
  var _useStateH2Memo = useState(initSig.hold2Memo || ""), fHold2Memo = _useStateH2Memo[0], setFHold2Memo = _useStateH2Memo[1];

  var _useStateOCSign = useState(initSig.osConfSign || null),
    _useStateOCSignA = _slicedToArray(_useStateOCSign, 2),
    fOsConfSign = _useStateOCSignA[0], setFOsConfSign = _useStateOCSignA[1];
  var _useStateOCVal = useState(initSig.osConfVal != null ? String(initSig.osConfVal) : ""),
    _useStateOCValA = _slicedToArray(_useStateOCVal, 2),
    fOsConfVal = _useStateOCValA[0], setFOsConfVal = _useStateOCValA[1];
  // === EP起算方式: OS足 state（OS1=既存osVal/osConf流用・OS2/3はscheme:2取り込み変換(_initHold)経由）===
  // 次足期待度（足固定・index0..3=OS1..OS4）2026-07-06: 旧 到達期待(os1/2/3Exp)・H1期待(holdExp)・H2期待(hold2Exp)を「その足の引けの判断」1本に統一。
  // 編集ロードは_epNextExpAt（新フィールドnextExp1〜4優先→レガシー導出）＝EP（α）が変わっても入力値は足に残る。OS5は次足が無いのでスロット無し。
  var _useStateNxs = useState(function() { return [_epNextExpAt(initSig, 0), _epNextExpAt(initSig, 1), _epNextExpAt(initSig, 2), _epNextExpAt(initSig, 3)]; }),
    fNxs = _useStateNxs[0], setFNxs = _useStateNxs[1];
  var _setNx = function(i, v) { setFNxs(function(prev) { var n = prev.slice(); n[i] = v; return n; }); };
  var _useStateO2H = useState(_initHold.os2High != null ? String(_initHold.os2High) : ""), fOs2High = _useStateO2H[0], setFOs2High = _useStateO2H[1];
  var _useStateO2HS = useState(_initHold.os2HighSign || "+"), fOs2HighSign = _useStateO2HS[0], setFOs2HighSign = _useStateO2HS[1];
  var _useStateO2C = useState(_initHold.os2Conf != null ? String(_initHold.os2Conf) : ""), fOs2Conf = _useStateO2C[0], setFOs2Conf = _useStateO2C[1];
  var _useStateO2CS = useState(_initHold.os2ConfSign || null), fOs2ConfSign = _useStateO2CS[0], setFOs2ConfSign = _useStateO2CS[1];
  var _useStateO3H = useState(_initHold.os3High != null ? String(_initHold.os3High) : ""), fOs3High = _useStateO3H[0], setFOs3High = _useStateO3H[1];
  var _useStateO3HS = useState(_initHold.os3HighSign || "+"), fOs3HighSign = _useStateO3HS[0], setFOs3HighSign = _useStateO3HS[1];
  var _useStateO3C = useState(_initHold.os3Conf != null ? String(_initHold.os3Conf) : ""), fOs3Conf = _useStateO3C[0], setFOs3Conf = _useStateO3C[1];
  var _useStateO3CS = useState(_initHold.os3ConfSign || null), fOs3ConfSign = _useStateO3CS[0], setFOs3ConfSign = _useStateO3CS[1];
  
  var _useStateEWSign = useState(null),
    _useStateEWSignA = _slicedToArray(_useStateEWSign, 2),
    fEstWidthSign = _useStateEWSignA[0], setFEstWidthSign = _useStateEWSignA[1];
  var _useStateEWVal = useState(""),
    _useStateEWValA = _slicedToArray(_useStateEWVal, 2),
    fEstWidthVal = _useStateEWValA[0], setFEstWidthVal = _useStateEWValA[1];
  
  var _useStateTT = useState(initSig.tradeType || "空売"),
    _useStateTTA = _slicedToArray(_useStateTT, 2),
    fTradeType = _useStateTTA[0], setFTradeType = _useStateTTA[1];
  
  var _useStateRPLS = useState(initSig.realizedPnlSign || "+"),
    _useStateRPLSA = _slicedToArray(_useStateRPLS, 2),
    fRealSign = _useStateRPLSA[0], setFRealSign = _useStateRPLSA[1];
  var _useStateRPL = useState(initSig.realizedPnl != null ? String(Math.abs(Number(initSig.realizedPnl))) : ""),
    _useStateRPLA = _slicedToArray(_useStateRPL, 2),
    fReal = _useStateRPLA[0], setFReal = _useStateRPLA[1];
  
  var _useStatePIN = useState(initSig.priceIn || ""),
    _useStatePINA = _slicedToArray(_useStatePIN, 2),
    fPriceIn = _useStatePINA[0], setFPriceIn = _useStatePINA[1];
  var _useStatePOUT = useState(initSig.priceOut || ""),
    _useStatePOUTA = _slicedToArray(_useStatePOUT, 2),
    fPriceOut = _useStatePOUTA[0], setFPriceOut = _useStatePOUTA[1];
  
  var _useStateSH = useState(initSig.shares != null ? String(initSig.shares) : "100"),
    _useStateSHA = _slicedToArray(_useStateSH, 2),
    fShares = _useStateSHA[0], setFShares = _useStateSHA[1];
  var _useStateTA = useState(initSig.tradeAlpha != null ? String(initSig.tradeAlpha) : ""),
    _useStateTAA = _slicedToArray(_useStateTA, 2),
    fTradeAlpha = _useStateTAA[0], setFTradeAlpha = _useStateTAA[1];
  // α値: 基本α値＋追加α値＝合計α値（合計＝採用α＝signal.alphaVal）2026-06-21。基本/追加は記録固有でbaseAlphaVal/addAlphaValに保存。
  // 既存記録は基本α=旧採用α(alphaVal)・追加α=0で初期化（合計＝従来値で不変）。分足(minBar) 欄は一旦廃止後2026-06-24に再導入（下記fMinBar・エントリーシグナルの上にボタン選択1/5）。水準線levelPriceは2026-06-22にOS見出しの右へ再導入＝下記fLevelPrice。
  var _useStateBA = useState(initSig.baseAlphaVal != null ? String(initSig.baseAlphaVal) : (initSig.alphaVal != null ? String(initSig.alphaVal) : "")),
    _useStateBAA = _slicedToArray(_useStateBA, 2),
    fBaseAlpha = _useStateBAA[0], setFBaseAlpha = _useStateBAA[1];
  // ライン併存ルール（〇×独立欄 2026-07-08g）: signal.lineCoexist(boolean)。〇で基本α欄へ1を自動入力（下のeffect）。新規=×（false）。旧「併存ライン/ライン併存」チップ検知はmigrateDataで本フラグへ移行。
  var _useStateLC = useState(initSig.lineCoexist === true),
    _useStateLCA = _slicedToArray(_useStateLC, 2),
    fLineCoexist = _useStateLCA[0], setFLineCoexist = _useStateLCA[1];
  // 水準線値（OS見出しの右・記録用の参考値＝OS値は水準線比なので基準の実価格を残す。損益計算には不使用。旧levelPrice欄を再導入 2026-06-22）。
  var _useStateLP = useState(initSig.levelPrice != null ? String(initSig.levelPrice) : ""),
    _useStateLPA = _slicedToArray(_useStateLP, 2),
    fLevelPrice = _useStateLPA[0], setFLevelPrice = _useStateLPA[1];
  // 分足（1分足/5分足を複数選択可。記録固有=signal.minBar=number配列[1]/[5]/[1,5]。旧形式の単一numberも読む。2026-06-18実装→α節改修で一旦廃止→2026-06-24再導入→24複数選択化）。
  var _useStateMB = useState(function() { var mb = initSig.minBar; var arr = Array.isArray(mb) ? mb : (mb != null ? [mb] : []); var out = []; for (var i = 0; i < arr.length; i++) { var v = String(arr[i]); if ((v === "1" || v === "5") && out.indexOf(v) < 0) out.push(v); } return out; }),
    _useStateMBA = _slicedToArray(_useStateMB, 2),
    fMinBars = _useStateMBA[0], setFMinBars = _useStateMBA[1];
  // ①②③各セクションの分足: 実効値（オーバーライドがあればそれ・無ければ分足欄fMinBarsに追従）2026-07-09。
  var _secBarEff = function(_tag, _sk) { var _sb = fSecBar && fSecBar[_tag]; var _ov = _sb ? _sb[_sk] : null; return (_ov != null) ? _ov : fMinBars; };
  var _secBarFollowing = function(_tag, _sk) { var _sb = fSecBar && fSecBar[_tag]; return !(_sb && _sb[_sk] != null); };
  // トグル: 実効値から1/5を反転。結果が分足欄と一致したら追従(null)へ戻す＝分足欄変更に再追従。
  var _toggleSecBar = function(_tag, _sk, _v) {
    setFSecBar(function(_prev) {
      var _o = Object.assign({}, _prev);
      var _cur = _o[_tag] ? Object.assign({}, _o[_tag]) : { b: null, k: null, f: null };
      var _eff = (_cur[_sk] != null) ? _cur[_sk] : fMinBars;
      var _next = (_eff.indexOf(_v) >= 0) ? _eff.filter(function(_x) { return _x !== _v; }) : _eff.concat([_v]);
      _next = _next.slice().sort();
      var _mb = (fMinBars || []).slice().sort();
      var _same = _next.length === _mb.length && _next.every(function(_x, _i) { return _x === _mb[_i]; });
      _cur[_sk] = _same ? null : _next;
      _o[_tag] = _cur;
      return _o;
    });
  };
  var _useStateADA = useState(initSig.addAlphaVal != null ? String(initSig.addAlphaVal) : ""),
    _useStateADAA = _slicedToArray(_useStateADA, 2),
    fAddAlpha = _useStateADAA[0], setFAddAlpha = _useStateADAA[1];
  // 追加α 使用フラグ（3状態 2026-06-24）: 〇=必要だった→数値入力／×=不要＝基本αのみ／未選択=未判断。signal.addAlphaUsed(true/false/null)に保存。
  // 初期化: addAlphaUsed===true→〇・===false→×・新規記録→×（既定 2026-07-01。従来は未選択→ユーザー要望で×へ＝新規だけ）／編集時の未設定(旧記録)→未選択（据え置き＝開いて保存しても勝手に×へ変えない）。推奨基本αの母数=×＋未選択(=〇以外)・推奨追加αの母数=〇のみ・未選択は推奨追加αの母数からのみ除外(基本αには基本αのみの記録として算入)。
  var _initAddUsed = (initSig.addAlphaUsed === true) ? "○" : (initSig.addAlphaUsed === false) ? "×" : (isEdit ? "未選択" : "×");
  var _useStateAAU = useState(_initAddUsed),
    _useStateAAUA = _slicedToArray(_useStateAAU, 2),
    fAddAlphaUsed = _useStateAAUA[0], setFAddAlphaUsed = _useStateAAUA[1];
  // 追加α〇の「根拠」（複数選択可＝指標線支え/底抜け前足浮き/その他＋ユーザー追加。signal.addAlphaReasons[]に保存・旧addAlphaReason(文字列)も読む）2026-06-22→22d複数選択化。
  // 初期化: 保存配列をマスター内(プリセット選択)とマスター外(その他テキスト)に分ける。
  var _reasonMasterInit = (data && data.custom && Array.isArray(data.custom.addAlphaReasons)) ? data.custom.addAlphaReasons : _DEF_ADD_REASONS;
  var _savedReasons = Array.isArray(initSig.addAlphaReasons) ? initSig.addAlphaReasons.filter(function(x) { return x; }) : ((typeof initSig.addAlphaReason === "string" && initSig.addAlphaReason) ? [initSig.addAlphaReason] : []);
  var _initPresets = _savedReasons.filter(function(x) { return _reasonMasterInit.indexOf(x) >= 0; });
  var _initOthers = _savedReasons.filter(function(x) { return _reasonMasterInit.indexOf(x) < 0; });
  var _useStateARS = useState(_initPresets),
    _useStateARSA = _slicedToArray(_useStateARS, 2),
    fAddReasons = _useStateARSA[0], setFAddReasons = _useStateARSA[1];
  var _useStateAOO = useState(_initOthers.length > 0),
    _useStateAOOA = _slicedToArray(_useStateAOO, 2),
    fOtherOn = _useStateAOOA[0], setFOtherOn = _useStateAOOA[1];
  var _useStateARO = useState(_initOthers.join(" / ")),
    _useStateAROA = _slicedToArray(_useStateARO, 2),
    fAddReasonOther = _useStateAROA[0], setFAddReasonOther = _useStateAROA[1];
  var _useStateRMG = useState(false),
    _useStateRMGA = _slicedToArray(_useStateRMG, 2),
    fReasonMgr = _useStateRMGA[0], setFReasonMgr = _useStateRMGA[1];
  // 根拠選択肢のドラッグ並び替え＋インライン追加/改名（2026-07-06e）: window.promptはiPad(standalone)で無反応のため廃止し、シグナル詳細チップと同方式へ統一。
  // 並び=custom.addAlphaReasonsの配列順（未設定時は既定配列を実体化して保存）・fRsnInput={val}=追加/{old,val}=改名・値の正本は_rsnValRef（確定時_fiFlushAll）。
  var _useStateRSO = useState(null),
    _useStateRSOA = _slicedToArray(_useStateRSO, 2),
    fRsnOrder = _useStateRSOA[0], setFRsnOrder = _useStateRSOA[1];
  var _rsnDragRef = useRef(null);
  var _rsnMovedRef = useRef(false);
  var _useStateRSI = useState(null),
    _useStateRSIA = _slicedToArray(_useStateRSI, 2),
    fRsnInput = _useStateRSIA[0], setFRsnInput = _useStateRSIA[1];
  var _rsnValRef = useRef("");
  // 浮き足加算α値（底抜け水準線OS選択時のみ表示）: 〇×＋前足浮き値（円・生値）。signal.ukiUsed/ukiValに保存・実効加算=floor(値/2)。旧数値根拠欄(addAlphaReasonVal)の後継 2026-07-03。
  // 初期化: ukiUsed===true→〇・それ以外(false/未設定/旧記録)→×。
  var _useStateUKU = useState(initSig.ukiUsed === true ? "○" : "×"),
    _useStateUKUA = _slicedToArray(_useStateUKU, 2),
    fUkiUsed = _useStateUKUA[0], setFUkiUsed = _useStateUKUA[1];
  var _useStateUKV = useState(initSig.ukiVal != null ? String(initSig.ukiVal) : ""),
    _useStateUKVA = _slicedToArray(_useStateUKV, 2),
    fUkiVal = _useStateUKVA[0], setFUkiVal = _useStateUKVA[1];
  // RNまたぎ加算α値（第5のα要素 2026-07-08h・RN＝ラウンドナンバー＝キリ番またぎ）: 〇×＋加算値（円・生値をそのまま加算・÷2等の計算なし）。全シグナルで表示。signal.rnUsed/rnValに保存。
  // 初期化: rnUsed===true→〇・それ以外（false/未設定/旧記録）→×。
  var _useStateRNU = useState(initSig.rnUsed === true ? "○" : "×"),
    _useStateRNUA = _slicedToArray(_useStateRNU, 2),
    fRnUsed = _useStateRNUA[0], setFRnUsed = _useStateRNUA[1];
  var _useStateRNV = useState(initSig.rnVal != null ? String(initSig.rnVal) : ""),
    _useStateRNVA = _slicedToArray(_useStateRNV, 2),
    fRnVal = _useStateRNVA[0], setFRnVal = _useStateRNVA[1];
  // α値セクションのメモ（記録固有=signal.alphaMemo）2026-06-21。
  var _useStateALM = useState(initSig.alphaMemo || ""),
    _useStateALMA = _slicedToArray(_useStateALM, 2),
    fAlphaMemo = _useStateALMA[0], setFAlphaMemo = _useStateALMA[1];
  // α値見出しの右に出す「推奨基本α（直近25件/50件/100件/全期間）」の参考値。保存済み記録(この銘柄・v2・算入分・追加α〇は_elBaseAlphaPick内で除外＝×＋未選択の記録)から算出＝記録の参考用。
  // 窓はカレンダーでなく fDate を起点にした直近N件の件数窓＝銘柄別でカレンダー窓が痩せるのを避け「最近の傾向」を安定して映す 2026-06-21→件数ベース2026-06-26。全期間も含め母数は fDate(その日)の前日までの記録のみ＝当日(同日)を含めず、過去記録の編集時に未来・当日データを使わない(look-ahead回避)2026-06-22c。
  var _refBaseAlpha = useMemo(function() {
    if (!fStock) return null;
    var recs = _elCollectAllSignals(data).filter(function(r) { return r.stock === fStock && _epIsV2(r.signal) && _elInclTotal(r.signal); });
    if (!recs.length) return null;
    var aiOf = function(r) { return _elAlphaInfo(r, data); };
    var pickOf = function(rs) { if (!rs || !rs.length) return null; var A = _elBaseAlphaA(rs, aiOf); if (!A) return null; var p = A.pick; if (!p || p.alpha == null || p.status === "none") return null; return { alpha: p.alpha, ok: p.status === "ok", alpha2: p.alpha2, add: (A.add && A.add.improved) ? A.add : null }; };   // 2026-06-27: 同じ窓から推奨追加α(add)も一緒に取得＝フォームの基本α/追加αの窓・起点を揃える
    // 件数ベースの窓【2026-06-26】: fDate前日までを日付順に並べ末尾から直近25/50/100件。キーw1/m1/m3は直近25/50/100件の意味（旧カレンダー1週/1月/3月から変更）。_defBaseAはm1=直近50件を既定に使う。
    var _base = fDate ? recs.filter(function(r) { return r.date < fDate; }) : recs;
    var _sorted = _base.slice().sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
    var _lastN = function(n) { return _sorted.length > n ? _sorted.slice(_sorted.length - n) : _sorted.slice(); };
    var out = {
      w1: pickOf(_lastN(_EL_PERIOD_COUNTS[0])),
      m1: pickOf(_lastN(_EL_PERIOD_COUNTS[1])),
      m3: pickOf(_lastN(_EL_PERIOD_COUNTS[2])),
      all: pickOf(_base)
    };
    return out;
  }, [data, fStock, fDate]);
  // 基本αの既定値＝直近50件の推奨基本α（無ければ100件→全期間でフォールバック）。直近25件は標本が薄くブレやすいので自動入力には使わず表示のみ（ユーザー方針 2026-06-22c→件数ベース2026-06-26）。自動入力は確信度の高い ok の推奨のみ使用（na=参考は使わない）。予想OS度とは連動しない 2026-06-21→2026-06-22再設計。
  var _baAlpha = function(w) { return (w && w.ok && w.alpha != null) ? w.alpha : null; };
  // 基本αに使う窓オブジェクトを確定（m1=直近50件→m3=100件→all=全期間）＝この同じ窓から推奨追加αも取る 2026-06-27。
  var _defBaseWin = _refBaseAlpha ? (_baAlpha(_refBaseAlpha.m1) != null ? _refBaseAlpha.m1 : (_baAlpha(_refBaseAlpha.m3) != null ? _refBaseAlpha.m3 : (_baAlpha(_refBaseAlpha.all) != null ? _refBaseAlpha.all : null))) : null;
  var _defBaseA = _defBaseWin ? _baAlpha(_defBaseWin) : null;
  // 新規記録では基本αに直近50件の推奨基本αを自動入力（手動操作するまで・銘柄/日付変更で追従）2026-06-21→2026-06-22c→件数ベース2026-06-26。
  var _baTouchedRef = useRef(false);
  var _baAutoRef = useRef("");
  // （基本αの自動入力useEffectは_refSigAlpha定義の直後へ移動 2026-07-07c＝詳細別→シグナル別→銘柄全体の段階フォールバック値_autoBaseAを使うため。_defBaseAは銘柄全体段として温存）
  // 推奨追加α（追加α〇の記録だけを母数に「基本αから何円足すと損切り↓H1利益↑だったか」）2026-06-22→2026-06-27: 表示・自動入力している推奨基本αと同じ件数窓(_defBaseWin)から取る＝「合計」＝画面の基本α＋推奨追加α が一致（旧: 全期間窓固定で、表示する基本α(直近50件)と窓・起点が食い違っていた）。
  var _refAddAlpha = (_defBaseWin && _defBaseWin.add) ? _defBaseWin.add : null;
  // 推奨損切り値（実現H1損益をほぼ維持できる範囲で最小=タイトな損切り値・この銘柄の前日までの算入v2記録から。損切り回避率/H1勝率は根拠として併記）2026-06-22→22dタイト優先。
  var _refCutPick = useMemo(function() {
    if (!fStock) return null;
    var recs = _elCollectAllSignals(data).filter(function(r) { return r.stock === fStock && _epIsV2(r.signal) && _elInclTotal(r.signal) && (!fDate || r.date < fDate); });
    if (!recs.length) return null;
    var p = _elCutPick(recs, function(r) { return _elAlphaInfo(r, data); });
    return (p && p.cut != null && p.status !== "none") ? p : null;
  }, [data, fStock, fDate]);
  // シグナル/詳細別の推奨基本α・追加α（2026-07-06→2026-07-07c拡張・ユーザー選択＝自動入力もシグナル/詳細別）:
  // 選択中シグナル（先頭タグ）と①②③の選択詳細で母数を絞り、段階フォールバック＝詳細の組み合わせ→シグナル→銘柄全体（_defBaseA）の順で
  // 「データ十分（_elBaseAlphaPickのstatus ok・直近50→100→全期間の件数窓）」な推奨基本αを自動入力に使う（★表示）。データ不足の段は「データ不足(n=X)」表示で下の段へ。
  // 追加α・選択値ごとの内訳は表示のみ。母数はこの銘柄・v2・算入分・fDate前日まで（look-ahead回避）。日別ページ/シミュのrecoOfは銘柄全体のまま＝値がズレうる点はユーザー了承済み。
  var _refSigAlpha = useMemo(function() {
    if (!fStock || !fTags.length) return null;
    var _t = fTags[0];
    var _tagsOf = function(s) { return (s.tags && s.tags.length) ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : []); };
    var recs = _elCollectAllSignals(data).filter(function(r) {
      return r.stock === fStock && _epIsV2(r.signal) && _elInclTotal(r.signal) && (!fDate || r.date < fDate) && _tagsOf(r.signal).indexOf(_t) >= 0;
    });
    var aiOf = function(r) { return _elAlphaInfo(r, data); };
    // 窓付きpick: 直近50→100→全期間の順に最初のok推奨を採用（銘柄全体の_defBaseAと同じ考え方）。okが無ければ全期間の参考値(na)をalphaに入れつつok:false＝データ不足扱い。addは同じ窓の推奨追加α。
    var _pickWin = function(rs) {
      if (!rs.length) return { alpha: null, ok: false, n: 0, add: null };
      var _sorted = rs.slice().sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
      var _wins = [];
      [_EL_PERIOD_COUNTS[1], _EL_PERIOD_COUNTS[2]].forEach(function(n) { if (_sorted.length > n) _wins.push(_sorted.slice(_sorted.length - n)); });
      _wins.push(_sorted);
      var _lastA = null;
      for (var i = 0; i < _wins.length; i++) {
        var A = _elBaseAlphaA(_wins[i], aiOf); _lastA = A;
        if (A && A.pick && A.pick.alpha != null && A.pick.status === "ok") return { alpha: A.pick.alpha, ok: true, n: rs.length, add: (A.add && A.add.improved) ? A.add : null };
      }
      return { alpha: (_lastA && _lastA.pick && _lastA.pick.alpha != null && _lastA.pick.status !== "none") ? _lastA.pick.alpha : null, ok: false, n: rs.length, add: (_lastA && _lastA.add && _lastA.add.improved) ? _lastA.add : null };
    };
    // 選択値ごとの参考pick（全期間・表示のみ）＝そのセクションの値が一致する記録だけに絞る（旧フラット記録は③として一致判定）。
    var _pickOf = function(rs) { if (!rs.length) return { alpha: null, n: 0 }; var p = _elBaseAlphaPick(rs, aiOf); return (p && p.alpha != null && p.status !== "none") ? { alpha: p.alpha, ok: p.status === "ok", n: rs.length } : { alpha: null, n: rs.length }; };
    var _sel = (fSigDetail && fSigDetail[_t]) || { b: null, k: null, f: [] };
    var _selB = _sel.b || null, _selK = _sel.k || null, _selF = (_sel.f || []);
    var picks = [];
    if (_selB) picks.push({ sec: "b", lb: "底", name: _selB, pick: _pickOf(recs.filter(function(r) { return _elSigDetailSec(r.signal, _t).b === _selB; })) });
    if (_selK) picks.push({ sec: "k", lb: "起", name: _selK, pick: _pickOf(recs.filter(function(r) { return _elSigDetailSec(r.signal, _t).k === _selK; })) });
    _selF.forEach(function(_dn) { picks.push({ sec: "f", lb: "特", name: _dn, pick: _pickOf(recs.filter(function(r) { return _elSigDetailSec(r.signal, _t).f.indexOf(_dn) >= 0; })) }); });
    // 詳細の組み合わせ（選択した①②③をすべて満たす記録）＝最も具体的な母数。①②③とも未選択ならnull。
    var det = (_selB || _selK || _selF.length) ? _pickWin(recs.filter(function(r) {
      var _sc = _elSigDetailSec(r.signal, _t);
      if (_selB && _sc.b !== _selB) return false;
      if (_selK && _sc.k !== _selK) return false;
      for (var i = 0; i < _selF.length; i++) { if (_sc.f.indexOf(_selF[i]) < 0) return false; }
      return true;
    })) : null;
    return { tag: _t, sig: _pickWin(recs), det: det, picks: picks };
  }, [data, fStock, fDate, fTags, fSigDetail]);
  // 自動入力に使う推奨基本α＝詳細別(ok)→シグナル別(ok)→銘柄全体(_defBaseA)の段階フォールバック（ユーザー選択 2026-07-07c）。srcは★バッジ表示用。
  var _autoBase = (function() {
    if (_refSigAlpha && _refSigAlpha.det && _refSigAlpha.det.ok && _refSigAlpha.det.alpha != null) return { a: _refSigAlpha.det.alpha, src: "詳細別" };
    if (_refSigAlpha && _refSigAlpha.sig && _refSigAlpha.sig.ok && _refSigAlpha.sig.alpha != null) return { a: _refSigAlpha.sig.alpha, src: "シグナル別" };
    if (_defBaseA != null) return { a: _defBaseA, src: "銘柄全体" };
    return { a: null, src: null };
  })();
  var _autoBaseA = _autoBase.a;
  // 新規記録では基本αに段階フォールバックの推奨基本αを自動入力（手動操作するまで・銘柄/日付/シグナル/詳細変更で追従）2026-06-21→2026-07-07c。
  useEffect(function() {
    if (isEdit || _baTouchedRef.current) return;
    if (_autoBaseA == null) return;
    if (fBaseAlpha !== "" && fBaseAlpha !== _baAutoRef.current) return;
    var _nv = String(_autoBaseA);
    _baAutoRef.current = _nv;
    if (_nv !== fBaseAlpha) setFBaseAlpha(_nv);
  }, [_autoBaseA, fBaseAlpha, isEdit]);
  // ライン併存ルール（独自欄fLineCoexist 2026-07-08g）: 〇にすると基本α欄へ1を自動入力＝切替の瞬間だけ効き、手修正可・×へ戻すと1なら空へ戻し推奨に復帰。新規/編集どちらも適用（EPナビ_EpnCalcFormと同ルール＝二重実装・変更時は両方直す）。旧・併存ラインチップ検知はmigrateData _migLineCoexistで本フラグへ移行済み。
  var _kyozPrevRef = useRef(fLineCoexist);
  useEffect(function() {
    if (fLineCoexist === _kyozPrevRef.current) return;
    _kyozPrevRef.current = fLineCoexist;
    if (fLineCoexist) setFBaseAlpha("1");
    else { _baTouchedRef.current = false; setFBaseAlpha(function(_p) { return _p === "1" ? "" : _p; }); }
  }, [fLineCoexist]);
  // 推奨追加αの表示も同じ段階（詳細別→シグナル別→銘柄全体）で最初に得られたものを使う（表示のみ・追加α欄への自動入力はしない）。
  var _refAddAlphaSrc = (_refSigAlpha && _refSigAlpha.det && _refSigAlpha.det.add) ? { add: _refSigAlpha.det.add, src: "詳細別" }
    : ((_refSigAlpha && _refSigAlpha.sig && _refSigAlpha.sig.add) ? { add: _refSigAlpha.sig.add, src: "シグナル別" }
    : (_refAddAlpha ? { add: _refAddAlpha, src: "銘柄全体" } : null));
  // 合計額算入（チェックでこの記録を合計額・データ分析に算入。既定=算入。記録固有=signal.includeInTotal。
  // undefined/null（旧記録）は算入＝true として初期化＝既定はチェック済み）2026-06-18。
  var _useStateINC = useState(initSig.includeInTotal !== false),
    _useStateINCA = _slicedToArray(_useStateINC, 2),
    fIncl = _useStateINCA[0], setFIncl = _useStateINCA[1];

  var _useStateEONO = useState(initSig.entryOsNo != null ? Number(initSig.entryOsNo) : null),
    _useStateEONOA = _slicedToArray(_useStateEONO, 2),
    fEntryOsNo = _useStateEONOA[0], setFEntryOsNo = _useStateEONOA[1];  // 実エントリーしたOS（1〜3）
  var _useStateEOSS = useState(initSig.entryOsSign || null),
    _useStateEOSSA = _slicedToArray(_useStateEOSS, 2),
    fEntryOsSign = _useStateEOSSA[0], setFEntryOsSign = _useStateEOSSA[1];
  var _useStateEOSV = useState(initSig.entryOsVal != null ? String(initSig.entryOsVal) : ""),
    _useStateEOSVA = _slicedToArray(_useStateEOSV, 2),
    fEntryOsVal = _useStateEOSVA[0], setFEntryOsVal = _useStateEOSVA[1];
  var _useStateXOSS = useState(initSig.exitOsSign || null),
    _useStateXOSSA = _slicedToArray(_useStateXOSS, 2),
    fExitOsSign = _useStateXOSSA[0], setFExitOsSign = _useStateXOSSA[1];
  var _useStateXOSV = useState(initSig.exitOsVal != null ? String(initSig.exitOsVal) : ""),
    _useStateXOSVA = _slicedToArray(_useStateXOSV, 2),
    fExitOsVal = _useStateXOSVA[0], setFExitOsVal = _useStateXOSVA[1];



  var _oscSignedRef = useRef(0);
  var _ewSignedRef = useRef(0);
  var _hhSignedRef = useRef(0);
  var _hwSignedRef = useRef(0);
  var _h2hSignedRef = useRef(0);
  var _h2wSignedRef = useRef(0);
  var _entryOsSignedRef = useRef(0);
  var _exitOsSignedRef = useRef(0);
  var _os2hSignedRef = useRef(0);
  var _os2cSignedRef = useRef(0);
  var _os3hSignedRef = useRef(0);
  var _os3cSignedRef = useRef(0);
  var _signedFromState = function(valStr, mul) { return (valStr === "" || valStr == null) ? null : mul * Math.abs(Number(valStr) || 0); };
  _oscSignedRef.current = _signedFromState(fOsConfVal,  fOsConfSign === "+" ? 1 : fOsConfSign === "-" ? -1 : 0);
  _os2hSignedRef.current = _signedFromState(fOs2High, fOs2HighSign === "+" ? 1 : fOs2HighSign === "-" ? -1 : 0);
  _os2cSignedRef.current = _signedFromState(fOs2Conf, fOs2ConfSign === "+" ? 1 : fOs2ConfSign === "-" ? -1 : 0);
  _os3hSignedRef.current = _signedFromState(fOs3High, fOs3HighSign === "+" ? 1 : fOs3HighSign === "-" ? -1 : 0);
  _os3cSignedRef.current = _signedFromState(fOs3Conf, fOs3ConfSign === "+" ? 1 : fOs3ConfSign === "-" ? -1 : 0);
  _ewSignedRef.current  = _signedFromState(fEstWidthVal,  fEstWidthSign === "-" ? 1 : fEstWidthSign === "+" ? -1 : 0);
  _hhSignedRef.current  = _signedFromState(fHoldHighVal,  fHoldHighSign === "-" ? 1 : fHoldHighSign === "+" ? -1 : 0);
  _hwSignedRef.current  = _signedFromState(fHoldWidthVal, fHoldWidthSign === "-" ? 1 : fHoldWidthSign === "+" ? -1 : 0);
  _h2hSignedRef.current = _signedFromState(fHold2HighVal,  fHold2HighSign === "-" ? 1 : fHold2HighSign === "+" ? -1 : 0);
  _h2wSignedRef.current = _signedFromState(fHold2WidthVal, fHold2WidthSign === "-" ? 1 : fHold2WidthSign === "+" ? -1 : 0);
  _entryOsSignedRef.current = _signedFromState(fEntryOsVal, fEntryOsSign === "+" ? 1 : fEntryOsSign === "-" ? -1 : 0);
  _exitOsSignedRef.current  = _signedFromState(fExitOsVal,  fExitOsSign === "+" ? 1 : fExitOsSign === "-" ? -1 : 0);

  var _applySigned = function(ref, delta, upSign, downSign, setVal, setSign, after) {

    if (ref.current == null) { ref.current = 0; setVal("0"); setSign(null); if (after) after(0); return; }
    var s = ref.current + delta;
    ref.current = s;
    if (s > 0) { setVal(String(s)); setSign(upSign); }
    else if (s < 0) { setVal(String(-s)); setSign(downSign); }
    else { setVal("0"); setSign(null); }
    if (after) after(s);
  };

  var _hwAfter = function(s) {
    var _av2 = _fAlpha;
    if (_av2 == null) return;
    setFHoldOsConf(_av2 - (-s));
  };
  var _h2wAfter = function(s) {
    var _av2 = _fAlpha;
    if (_av2 == null) return;
    setFHold2OsConf(_av2 - (-s));
  };



  
  // 合計α値 = 基本α値（未入力なら直近50件の推奨基本α・無ければ0。予想OS度とは連動しない 2026-06-21）＋ 浮き足加算α値 ＋ 追加α値（未入力なら0）。これが採用α＝全計算で使用。
  var _fBaseA = (fBaseAlpha !== "" && !isNaN(Number(fBaseAlpha))) ? Number(fBaseAlpha) : (_autoBaseA != null ? _autoBaseA : 0);
  // 浮き足加算α値（2026-07-03→2026-07-07で対象を複数化）: 全シグナルで欄を表示・算入可（2026-07-07 旧＝底抜け系のみ_elUkiSignalNames→拡大）。〇のとき入力値(前足浮き値)の半額（小数切捨て）を加算。
  var _showUki = true;  // 浮き足加算は全シグナルで表示・入力可（2026-07-07 底抜け系限定の_elUkiSignalNamesゲートを解除）
  var _fUkiAdd = (_showUki && fUkiUsed === "○" && fUkiVal !== "" && !isNaN(Number(fUkiVal))) ? Math.floor(Number(fUkiVal) / 2) : 0;
  // 追加αは「〇（必要）」を選んだ時だけ合計に算入。×なら0＝基本αのみ。
  var _fAddA = (fAddAlphaUsed === "○" && fAddAlpha !== "" && !isNaN(Number(fAddAlpha))) ? Number(fAddAlpha) : 0;
  // RNまたぎ加算は「〇」のとき入力値をそのまま加算（第5要素 2026-07-08h・÷2等の計算なし）。×なら0。
  var _fRnAdd = (fRnUsed === "○" && fRnVal !== "" && !isNaN(Number(fRnVal))) ? Number(fRnVal) : 0;
  var _fAlpha = _fBaseA + _fUkiAdd + _fAddA + _fRnAdd;
  var _fCutLine = (function() {
    var _ck = fStock + "_" + fDate;
    var _cd = data.charts && data.charts[_ck];
    return (_cd != null && _cd.cutLine != null) ? _cd.cutLine : 10;
  })();
  // === EP起算方式: フォーム状態からEP位置・E判定をライブ導出（OS1高値=常に↑正・OS2/3は符号付き）===
  var _epFormState = (function() {
    if (!isV2Form) return null;
    var _av = _fAlpha;
    var _o1 = (fOsVal !== "" && !isNaN(Number(fOsVal))) ? Number(fOsVal) : null;
    var _o2 = (fOs2High !== "" && !isNaN(Number(fOs2High))) ? (fOs2HighSign === "-" ? -Number(fOs2High) : Number(fOs2High)) : null;
    var _o3 = (fOs3High !== "" && !isNaN(Number(fOs3High))) ? (fOs3HighSign === "-" ? -Number(fOs3High) : Number(fOs3High)) : null;
    var _o1R = _av != null && _o1 != null && _o1 >= _av;
    var _o2R = _av != null && _o2 != null && _o2 >= _av;
    var _o3R = _av != null && _o3 != null && _o3 >= _av;
    var epIdx = _o1R ? 0 : _o2R ? 1 : _o3R ? 2 : -1;
    var showOs2 = _av != null && _o1 != null && !_o1R;
    var showOs3 = showOs2 && _o2 != null && !_o2R;
    var judge = epIdx === 0 ? "ok"
      : epIdx === 1 ? (fNxs[0] === "×" ? "x" : "ok")
      : epIdx === 2 ? ((fNxs[0] === "×" || fNxs[1] === "×") ? "x" : "ok")
      : (_o3 != null ? "miss" : null);
    var epHigh = epIdx === 0 ? _o1 : epIdx === 1 ? _o2 : epIdx === 2 ? _o3 : null;
    var _ecr = epIdx === 0 ? [fOsConfVal, fOsConfSign] : epIdx === 1 ? [fOs2Conf, fOs2ConfSign] : epIdx === 2 ? [fOs3Conf, fOs3ConfSign] : null;
    var epConf = (_ecr && _ecr[0] !== "" && !isNaN(Number(_ecr[0]))) ? (_ecr[1] === "-" ? -Number(_ecr[0]) : Number(_ecr[0])) : null;
    return { alpha: _av, o1: _o1, o2: _o2, o3: _o3, epIdx: epIdx, judge: judge, showOs2: showOs2, showOs3: showOs3, epHigh: epHigh, epConf: epConf };
  })();
  // 旧名互換の導出値（次足期待度fNxsを現在のEP位置で解決）2026-07-06: fOs1Exp/fOs2Exp=OS1/OS2スロットの生値（保存はEP位置でゲート）・fHoldExp/fHold2Exp=EP足/EP+1足の引けの判断（=旧H1期待/H2期待）。
  // state直読みだった既存コード（プレビュー_fVSig・保存・損益変化効果・非表示バッジ・バリデーション）はこの導出値で無改修に動く。
  var fOs1Exp = fNxs[0] || null, fOs2Exp = fNxs[1] || null;
  var _fEpIdxLive = _epFormState ? _epFormState.epIdx : -1;
  var fHoldExp = _fEpIdxLive >= 0 ? (fNxs[_fEpIdxLive] || null) : null;
  var fHold2Exp = _fEpIdxLive >= 0 ? (fNxs[_fEpIdxLive + 1] || null) : null;

  // v2(EP起算)はE判定ベース: miss=E未達or×見送り。損切り判定はEP足高値基準。
  var _fMiss = (isV2Form && _epFormState) ? (_epFormState.judge === "miss" || _epFormState.judge === "x")
    : (_fAlpha != null && Number(fOsVal) >= 0 && Number(fOsVal) < _fAlpha);
  var _fPlanStopNow = (isV2Form && _epFormState)
    ? (_epFormState.judge === "ok" && _epFormState.epHigh != null && _fAlpha != null && (_epFormState.epHigh - _fAlpha) >= _fCutLine)
    : (Number(fOsVal) > 0 && _fAlpha != null && (Number(fOsVal) - _fAlpha) >= _fCutLine);
  // OS1〜5固定欄（scheme:3）: ミラー同期は廃止。hold*/hold2*欄=常に4・5本目の実データ。
  // フォーム状態を仮想signal化し、H1/H2のプレビュー損益・損切り判定は共通ヘルパー（表と同一基準）で算出する。
  var _fVSig = {
    scheme: 3, alphaVal: _fAlpha, difficulty: fDifficulty || null,
    osVal: (fOsVal !== "" && !isNaN(Number(fOsVal))) ? Number(fOsVal) : null,
    osConfVal: (fOsConfVal !== "" && !isNaN(Number(fOsConfVal))) ? Number(fOsConfVal) : null, osConfSign: fOsConfSign || null,
    os2High: (fOs2High !== "" && !isNaN(Number(fOs2High))) ? Number(fOs2High) : null, os2HighSign: fOs2HighSign || null,
    os2Conf: (fOs2Conf !== "" && !isNaN(Number(fOs2Conf))) ? Number(fOs2Conf) : null, os2ConfSign: fOs2ConfSign || null,
    os3High: (fOs3High !== "" && !isNaN(Number(fOs3High))) ? Number(fOs3High) : null, os3HighSign: fOs3HighSign || null,
    os3Conf: (fOs3Conf !== "" && !isNaN(Number(fOs3Conf))) ? Number(fOs3Conf) : null, os3ConfSign: fOs3ConfSign || null,
    holdHighVal: fHoldHighVal !== "" ? Number(fHoldHighVal) : null, holdHighSign: fHoldHighSign || null,
    holdWidth: fHoldWidthVal !== "" ? Number(fHoldWidthVal) : null, holdWidthSign: fHoldWidthSign || null,
    hold2HighVal: fHold2HighVal !== "" ? Number(fHold2HighVal) : null, hold2HighSign: fHold2HighSign || null,
    hold2Width: fHold2WidthVal !== "" ? Number(fHold2WidthVal) : null, hold2WidthSign: fHold2WidthSign || null,
    os1Exp: fOs1Exp || null, os2Exp: fOs2Exp || null,
    holdExp: fHoldExp || null, hold2Exp: fHold2Exp || null,
    nextExp1: fNxs[0] || null, nextExp2: fNxs[1] || null, nextExp3: fNxs[2] || null, nextExp4: fNxs[3] || null
  };
  var _fEpRes = (_fAlpha != null) ? _epResolve(_fVSig, _fAlpha) : null;
  // 足i（0〜4）の現在の役割（EP/H1/H2/null）。EP枠はOS1〜3のまま・H1/H2はEPの次・その次の足。
  var _fRoleOf = function(i) {
    var e = _epFormState ? _epFormState.epIdx : -1;
    if (e < 0) return null;
    return i === e ? "EP" : i === e + 1 ? "H1" : i === e + 2 ? "H2" : null;
  };
  var _fH1StopNow = !!(_fEpRes && _fEpRes.judge === "ok" && _fEpRes.h1 && _fEpRes.h1.h != null && _fAlpha != null && (_fEpRes.h1.h - _fAlpha) >= _fCutLine);
  var _fH2StopNow = !!(_fEpRes && _fEpRes.judge === "ok" && _fEpRes.h2 && _fEpRes.h2.h != null && _fAlpha != null && (_fEpRes.h2.h - _fAlpha) >= _fCutLine);
  var _fHoldHighOverA = (_fAlpha != null && fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) || 0) >= _fAlpha);
  // H1までE基準未達でもHold2期待度欄・Hold2欄は表示して入力可能にする（表側は _elH2Miss が従来どおり「ー（H１までE基準未達）」表示）
  // E未達(OS1〜3でα未到達)が確定したらHold1/2欄ごと非表示（ノートレード=H足は存在しない・保存も不要）。
  // E=×（×宣言後の到達）は参考データとしてH欄を表示維持。判定待ち(judge null)も表示。
  var _fHideHold = !!(isV2Form && _epFormState && _epFormState.judge === "miss");
  var _fH2Hidden = _fHideHold;
  // 旧基準の「H1までE基準未達→非考慮」注記はEP起算では廃止（E未達なら欄ごと消えるため）。
  var _fH2NonConsider = isV2Form ? false : (_fMiss && !_fHoldHighOverA);
  var _fMissEl = React.createElement("span", {
    style: { display: "inline-block", padding: "5px 14px", fontSize: 13, fontWeight: 700,
      color: "#6D28D9", background: "#EDE9FE", borderRadius: 6, border: "1px solid #C4B5FD" }
  }, "E基準未達のため非表示");
  var _fH2MissEl = React.createElement("span", {
    style: { display: "inline-block", padding: "5px 14px", fontSize: 13, fontWeight: 700,
      color: "#6D28D9", background: "#EDE9FE", borderRadius: 6, border: "1px solid #C4B5FD" }
  }, "H１までE基準未達のため非表示");
  // H期待度×（撤退）→ 結果損益欄は「期待度×のため非表示」。
  var _fHoldXEl = React.createElement("span", {
    style: { display: "inline-block", padding: "5px 14px", fontSize: 13, fontWeight: 700,
      color: "#B45309", background: "#FEF3C7", borderRadius: 6, border: "1px solid #FCD34D" }
  }, "期待度×のため非表示");

  
  useEffect(function() {
    if (!fEntered) return;
    var inV = parseFloat(fPriceIn);
    var outV = parseFloat(fPriceOut);
    if (!fPriceIn || !fPriceOut || isNaN(inV) || isNaN(outV)) return;
    var shares = parseInt(fShares) || 100;
    
    var diff = fTradeType === "空売"
      ? (inV - outV) * shares
      : (outV - inV) * shares;
    var absVal = Math.round(Math.abs(diff));
    setFRealSign(diff >= 0 ? "+" : "-");
    setFReal(String(absVal));
  }, [fPriceIn, fPriceOut, fShares, fTradeType, fEntered]);

  
  useEffect(function() {
    // v2(EP起算): EP足の高値・確定値からEP損益/想定値幅を算出（EP=OS2/3でも正しい値・損益変化の自動選択の比較元にもなる）
    if (isV2Form && _epFormState) {
      var _efp = _epFormState;
      if (_efp.judge !== "ok" || _efp.alpha == null || _efp.epHigh == null) {
        var _z = (_efp.judge === "miss" || _efp.judge === "x") ? "0" : "";
        setFEstWidthSign(null); setFEstWidthVal(_z);
        setFPlanSign(null); setFPlan(_z); return;
      }
      var _dfe = _efp.epHigh - _efp.alpha;
      if (_dfe >= _fCutLine) {
        setFEstWidthSign("-"); setFEstWidthVal(String(_dfe));
        setFPlanSign("-"); setFPlan(String(Math.round(_dfe * 100))); return;
      }
      if (_efp.epConf == null) { setFEstWidthSign(null); setFEstWidthVal(""); return; }
      var _we = _efp.alpha - _efp.epConf;
      var _ws = _we === 0 ? null : (_we > 0 ? "+" : "-");
      setFEstWidthSign(_ws); setFEstWidthVal(String(Math.abs(_we)));
      if (_ws == null) { setFPlanSign(null); setFPlan("0"); return; }
      var _pa = Math.round(Math.abs(_we) * 100);
      setFPlanSign(_pa === 0 ? null : _ws); setFPlan(String(_pa));
      return;
    }
    var ck = fStock + "_" + fDate;
    var cd = data.charts && data.charts[ck];
    var av = _fAlpha;
    var osV = Number(fOsVal) || 0;
    if (av != null && osV >= 0 && osV < av) {
      setFEstWidthSign(null); setFEstWidthVal("0");
      setFPlanSign(null); setFPlan("0"); return;
    }
    var cutL1 = cd && cd.cutLine != null ? cd.cutLine : 10;
    if (av != null && osV > 0 && osV - av >= cutL1) {
      setFEstWidthSign("-"); setFEstWidthVal(String(osV - av));
      setFPlanSign("-"); setFPlan(String(Math.round((osV - av) * 100))); return;
    }
    if (av == null || fOsConfVal === "") { setFEstWidthSign(null); setFEstWidthVal(""); return; }
    var confSigned = fOsConfSign === "+" ? (Number(fOsConfVal) || 0) : fOsConfSign === "-" ? -(Number(fOsConfVal) || 0) : 0;
    var width = av - confSigned;
    var wSign = width === 0 ? null : (width > 0 ? "+" : "-");
    setFEstWidthSign(wSign); setFEstWidthVal(String(Math.abs(width)));
    if (wSign == null) { setFPlanSign(null); setFPlan("0"); return; }
    var planAmt = Math.round(Math.abs(width) * 100);
    setFPlanSign(planAmt === 0 ? null : wSign); setFPlan(String(planAmt));
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fOsConfSign, fOsConfVal, fOsVal, fOs2High, fOs2HighSign, fOs2Conf, fOs2ConfSign, fOs3High, fOs3HighSign, fOs3Conf, fOs3ConfSign]);

  
  
  
  
  
  
  
  useEffect(function() {
    // v2(EP起算): 内部stateのfResultもEP足基準で更新（損益変化の自動選択effectが参照。保存時はresult=null）
    if (isV2Form && _epFormState) {
      var _efr = _epFormState;
      if (_efr.judge === "miss" || _efr.judge === "x") { setFResult("miss"); return; }
      if (_efr.judge === "ok" && _efr.alpha != null && _efr.epHigh != null) {
        var _dfr = _efr.epHigh - _efr.alpha;
        if (_dfr >= _fCutLine) { setFResult("ng"); return; }
        if (_efr.epConf == null) return;
        setFResult(_efr.epConf < _efr.alpha ? "ok" : _efr.epConf === _efr.alpha ? "draw" : "ng");
      }
      return;
    }
    var ck = fStock + "_" + fDate;
    var cd = data.charts && data.charts[ck];
    var av = _fAlpha;
    if (av == null) return;
    var osV = Number(fOsVal) || 0;
    if (osV <= 0) return;
    var cutL2 = cd && cd.cutLine != null ? cd.cutLine : 10;
    var diff = osV - av;
    if (diff < 0) { setFResult("miss"); return; }
    if (diff >= cutL2) { setFResult("ng"); return; }

    if (fOsConfVal === "") return;
    var confSigned = fOsConfSign === "+" ? (Number(fOsConfVal) || 0) : fOsConfSign === "-" ? -(Number(fOsConfVal) || 0) : (Number(fOsConfVal) || 0);
    if (confSigned < av) { setFResult("ok"); return; }
    if (confSigned === av) { setFResult("draw"); return; }
    setFResult("ng");
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fOsVal, fOsConfSign, fOsConfVal, fOs2High, fOs2HighSign, fOs2Conf, fOs2ConfSign, fOs3High, fOs3HighSign, fOs3Conf, fOs3ConfSign]);

  
  useEffect(function() {
    var ck = fStock + "_" + fDate;
    var cd = data.charts && data.charts[ck];
    var av = _fAlpha;
    var osV = Number(fOsVal) || 0;
    if (av != null && osV > 0 && osV < av) {
      setFPlanSign(null); setFPlan("0"); return;
    }
    var cutL3 = (function(){ var _ck3 = fStock + "_" + fDate; var _cd3 = data.charts && data.charts[_ck3]; return _cd3 && _cd3.cutLine != null ? _cd3.cutLine : 10; })();
    if (av != null && osV > 0 && (osV - av) >= cutL3) {
      setFPlanSign("-");
      setFPlan(String(Math.round((osV - av) * 100)));
      return;
    }
    if (fEstWidthVal === "") return;
    if (fEstWidthSign == null) { setFPlanSign(null); setFPlan("0"); return; }
    var w = Number(fEstWidthVal) || 0;
    var planAmt = Math.round(w * 100);
    setFPlanSign(planAmt === 0 ? null : fEstWidthSign);
    setFPlan(String(planAmt));
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fOsVal, fEstWidthSign, fEstWidthVal]);

  
  useEffect(function() {
    var _ck = fStock + "_" + fDate;
    var _cd = data.charts && data.charts[_ck];
    var _av = _fAlpha;
    if (_av == null || fHoldWidthSign == null || fHoldWidthVal === "") return;
    var _hwSigned = fHoldWidthSign === "+" ? Number(fHoldWidthVal) : -Number(fHoldWidthVal);
    var _newOsConf = _av - _hwSigned;
    if (_newOsConf !== fHoldOsConf) setFHoldOsConf(_newOsConf);
  }, [fStock, fDate, data, _fAlpha, fHoldWidthSign, fHoldWidthVal]);

  
  
  
  useEffect(function() {
    // v3(OS1〜5固定欄): H1結果損益はαで解決した役割の足（EPの次）から共通ヘルパーで算出（表と同一基準）。
    if (isV2Form) {
      var _hpV = _elDynHold(_fVSig, _fAlpha, _fCutLine);
      if (_hpV == null) { setFHoldPnlSign(null); setFHoldPnlVal(""); return; }
      setFHoldPnlSign(_hpV === 0 ? null : _hpV > 0 ? "+" : "-");
      setFHoldPnlVal(String(Math.abs(Math.round(_hpV))));
      return;
    }
    var _ck = fStock + "_" + fDate;
    var _cd = data.charts && data.charts[_ck];
    var _av = _fAlpha;

    var _cutLHold = _cd && _cd.cutLine != null ? _cd.cutLine : 10;
    if (fResult === "miss") {

      if (!(fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) || 0) >= _av)) {
        setFHoldPnlSign("+"); setFHoldPnlVal("0"); return;
      }
    }
    if (_av != null && fHoldHighSign === "-") {
      var _hhv = Number(fHoldHighVal) || 0;
      var _hhExcess = _hhv - _av;
      if (_hhExcess >= _cutLHold) { setFHoldPnlSign("-"); setFHoldPnlVal(String(Math.round(_hhExcess * 100))); return; }
    }

    if (_av == null || fHoldWidthVal === "") { setFHoldPnlSign(null); setFHoldPnlVal(""); return; }
    var _hw = Number(fHoldWidthVal) || 0;

    if (!fHoldWidthSign && _hw !== 0) { setFHoldPnlSign(null); setFHoldPnlVal(""); return; }
    var _holdAdj = fHoldWidthSign === "+" ? _hw : fHoldWidthSign === "-" ? -_hw : 0;
    var _result = (_av + _holdAdj) * 100;
    setFHoldPnlSign(_result === 0 ? null : (_result > 0 ? "+" : "-"));
    setFHoldPnlVal(String(Math.abs(Math.round(_result))));
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fHoldWidthSign, fHoldWidthVal, fHoldHighSign, fHoldHighVal, fResult,
      fOsVal, fOsConfVal, fOsConfSign, fOs2High, fOs2HighSign, fOs2Conf, fOs2ConfSign, fOs3High, fOs3HighSign, fOs3Conf, fOs3ConfSign,
      fHold2WidthSign, fHold2WidthVal, fHold2HighSign, fHold2HighVal]);

  
  useEffect(function() {
    // EP損益が損切りの間はH1損益変化を自動計算で上書きしない（stopロックは別effectが担当）。
    if (_fPlanStopNow) return;
    // v2/v3でE未達・×見送り（judge≠ok）→ H1は参考扱い・ノートレードのため損益変化=未達。
    if (isV2Form && fResult === "miss") { setFHoldProfit("miss"); return; }
    // H1期待度×（撤退）→ 損益変化=撤退（結果損益欄は「期待度×のため非表示」）。
    if (fHoldExp === "×") { setFHoldProfit("withdraw"); return; }
    var sHold = fHoldPnlVal !== "" ? (Number(fHoldPnlVal)||0) * (fHoldPnlSign === "-" ? -1 : 1) : 0;
    var sPlan = fPlan !== "" ? (Number(fPlan)||0) * (fPlanSign === "-" ? -1 : 1) : 0;

    if (fResult === "miss") {
      var _h1ReachedA = (_fAlpha != null && fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) || 0) >= _fAlpha);
      if (!_h1ReachedA) { setFHoldProfit("miss"); return; }   // 想定もH1も未達 → 未達
      if (fHoldPnlVal === "") { setFHoldProfit("none"); return; }
      if (sHold > 0) setFHoldProfit("yes");
      else if (sHold < 0) setFHoldProfit("no");
      else setFHoldProfit("none");
      return;
    }
    if (fResult === "draw") {
      if (fHoldPnlVal === "") { setFHoldProfit(null); return; }
      if (sHold > 0) setFHoldProfit("yes");
      else if (sHold < 0) setFHoldProfit("no");
      else setFHoldProfit("none");
      return;
    }
    if (sPlan === 0) { setFHoldProfit(fHoldPnlVal === "" ? null : sHold > 0 ? "yes" : sHold < 0 ? "no" : "none"); return; }

    if (sHold === 0) {
      if (fHoldPnlVal === "") { setFHoldProfit(null); return; }
      if (sPlan < 0) setFHoldProfit("yes");
      else if (sPlan > 0) setFHoldProfit("mid");
      else setFHoldProfit("none");
      return;
    }
    if (sPlan > 0 && sHold > 0) {
      if (sHold > sPlan) setFHoldProfit("yes");
      else if (sHold < sPlan) setFHoldProfit("mid");
      else setFHoldProfit("none");
    } else if (sPlan < 0 && sHold < 0) {
      setFHoldProfit("no");
    } else if (sPlan > 0 && sHold < 0) {
      setFHoldProfit("no");
    } else if (sPlan < 0 && sHold > 0) {
      setFHoldProfit("yes");
    }
  }, [fResult, fPlan, fPlanSign, fHoldPnlVal, fHoldPnlSign, fOsVal, _fAlpha, _fCutLine, fHoldHighSign, fHoldHighVal, fHoldExp]);

  // === Hold2(H2) 自動計算（H1と同一ロジック） ===
  useEffect(function() {
    var _av = _fAlpha;
    if (_av == null || fHold2WidthSign == null || fHold2WidthVal === "") return;
    var _hwSigned = fHold2WidthSign === "+" ? Number(fHold2WidthVal) : -Number(fHold2WidthVal);
    var _newOsConf = _av - _hwSigned;
    if (_newOsConf !== fHold2OsConf) setFHold2OsConf(_newOsConf);
  }, [fStock, fDate, data, _fAlpha, fHold2WidthSign, fHold2WidthVal]);

  useEffect(function() {
    // v3(OS1〜5固定欄): H2結果損益はαで解決した役割の足（EPの2本後）から共通ヘルパーで算出（損切りルール非適用条件等も表と同一）。
    if (isV2Form) {
      var _hp2V = _elDynHold2(_fVSig, _fAlpha, _fCutLine);
      if (_hp2V == null) { setFHold2PnlSign(null); setFHold2PnlVal(""); return; }
      setFHold2PnlSign(_hp2V === 0 ? null : _hp2V > 0 ? "+" : "-");
      setFHold2PnlVal(String(Math.abs(Math.round(_hp2V))));
      return;
    }
    var _ck = fStock + "_" + fDate;
    var _cd = data.charts && data.charts[_ck];
    var _av = _fAlpha;
    var _cutLHold = _cd && _cd.cutLine != null ? _cd.cutLine : 10;
    if (fResult === "miss") {
      // H1の高値がα到達（H1でエントリー成立）なら、H2は自身がα未達でもmiss扱いせず結果を算出。
      var _h1ReachedA = (_av != null && fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) || 0) >= _av);
      var _h2ReachedA = (fHold2HighSign === "-" && fHold2HighVal !== "" && (Number(fHold2HighVal) || 0) >= _av);
      if (!_h1ReachedA && !_h2ReachedA) {
        setFHold2PnlSign("+"); setFHold2PnlVal("0"); return;
      }
    }
    // EP損益またはH1で既に損切りの場合、H2には損切りルールを適用しない（値幅から算出し、損益変化はH1損益との純粋比較で選ばせる）。それ以外はH2にも損切りルール適用。
    var _osV2 = Number(fOsVal) || 0;
    var _planStop2 = (_av != null && _osV2 > 0 && (_osV2 - _av) >= _cutLHold);
    var _h1Stop2 = (_av != null && fHoldHighSign === "-" && fHoldHighVal !== "" && ((Number(fHoldHighVal) || 0) - _av) >= _cutLHold);
    if (!_planStop2 && !_h1Stop2 && _av != null && fHold2HighSign === "-") {
      var _hhv = Number(fHold2HighVal) || 0;
      var _hhExcess = _hhv - _av;
      if (_hhExcess >= _cutLHold) { setFHold2PnlSign("-"); setFHold2PnlVal(String(Math.round(_hhExcess * 100))); return; }
    }
    if (_av == null || fHold2WidthVal === "") { setFHold2PnlSign(null); setFHold2PnlVal(""); return; }
    var _hw = Number(fHold2WidthVal) || 0;
    if (!fHold2WidthSign && _hw !== 0) { setFHold2PnlSign(null); setFHold2PnlVal(""); return; }
    var _holdAdj = fHold2WidthSign === "+" ? _hw : fHold2WidthSign === "-" ? -_hw : 0;
    var _result = (_av + _holdAdj) * 100;
    setFHold2PnlSign(_result === 0 ? null : (_result > 0 ? "+" : "-"));
    setFHold2PnlVal(String(Math.abs(Math.round(_result))));
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fHold2WidthSign, fHold2WidthVal, fHold2HighSign, fHold2HighVal, fResult, fOsVal, fHoldHighSign, fHoldHighVal,
      fOsConfVal, fOsConfSign, fOs2High, fOs2HighSign, fOs2Conf, fOs2ConfSign, fOs3High, fOs3HighSign, fOs3Conf, fOs3ConfSign, fHoldWidthSign, fHoldWidthVal]);

  useEffect(function() {
    // EP損益 or H1の結果損益が損切りの間は損益変化も「損切り済(stop)」を自動選択。
    var _h2psStop = _fPlanStopNow;  // EP足基準の損切り判定（EP=OS2/3でも正しく判定）
    var _h2h1Stop = _fH1StopNow;    // H1=役割の足（EPの次）基準
    if (_h2psStop || _h2h1Stop) { setFHold2Profit("stop"); return; }
    // v2/v3でE未達・×見送り（judge≠ok）→ H2も参考扱い・ノートレードのため損益変化=未達。
    if (isV2Form && fResult === "miss") { setFHold2Profit("miss"); return; }
    // H2期待度×（撤退）→ 損益変化=撤退（結果損益欄は「期待度×のため非表示」）。
    if (fHold2Exp === "×") { setFHold2Profit("withdraw"); return; }
    var _h1RA2 = (_fAlpha != null && fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) || 0) >= _fAlpha);
    if (fResult === "miss" && !_h1RA2) { setFHold2Profit("miss"); return; }  // H1までE基準未達（想定+H1未達）→ 未達
    // H2の損益変化は「H1の結果損益」との比較。
    if (fHold2PnlVal === "") { setFHold2Profit(null); return; }
    var sHold = (Number(fHold2PnlVal)||0) * (fHold2PnlSign === "-" ? -1 : 1);
    var sBase = fHoldPnlVal !== "" ? (Number(fHoldPnlVal)||0) * (fHoldPnlSign === "-" ? -1 : 1) : 0;
    if (sBase === 0) {
      if (sHold > 0) setFHold2Profit("yes");
      else if (sHold < 0) setFHold2Profit("no");
      else setFHold2Profit("none");
      return;
    }
    if (sHold === 0) {
      setFHold2Profit(sBase < 0 ? "yes" : sBase > 0 ? "mid" : "none");
      return;
    }
    if (sBase > 0 && sHold > 0) {
      if (sHold > sBase) setFHold2Profit("yes");
      else if (sHold < sBase) setFHold2Profit("mid");
      else setFHold2Profit("none");
    } else if (sBase < 0 && sHold < 0) {
      setFHold2Profit("no");
    } else if (sBase > 0 && sHold < 0) {
      setFHold2Profit("no");
    } else if (sBase < 0 && sHold > 0) {
      setFHold2Profit("yes");
    }
  }, [fHoldPnlVal, fHoldPnlSign, fHold2PnlVal, fHold2PnlSign, fOsVal, fResult, fHoldHighSign, fHoldHighVal, fHold2HighSign, fHold2HighVal, _fAlpha, _fCutLine, _fPlanStopNow, fHold2Exp]);

  // 期待度（H1/H2）の「損切り済」自動選択は廃止し手動選択に変更（表側の「損切」表示はライブα計算で従来どおり）。

  // EP損益が損切りの間は損益変化(fHoldProfit)も「損切り済(stop)」を自動選択（その後ユーザーは変更可）。
  var _hpStopAutoRef = useRef(false);
  useEffect(function() {
    var _h1PlanStop = _fPlanStopNow;  // EP足基準の損切り判定
    if (_h1PlanStop) {
      if (!_hpStopAutoRef.current) { _hpStopAutoRef.current = true; setFHoldProfit("stop"); }
    } else if (_hpStopAutoRef.current) {
      _hpStopAutoRef.current = false;
      setFHoldProfit(function(prev) { return prev === "stop" ? null : prev; });
    }
  }, [fOsVal, _fAlpha, _fCutLine, _fPlanStopNow]);

  // 次足期待度の自動整合 2026-07-06（旧: os1×→os2×・H1×→H2×・H1△→H2○不可・△確信度→H1○不可 を足固定に一般化・変更なしなら同一参照を返して再レンダー無し）:
  //  ①×連鎖: 足iが×（降りる）なら次スロットも×。ただしEP境界（待ち足×→EP足スロット）は跨がない＝×見送り(E×)でもH判断は参考記録として残せる（_epAsTraded分析用）。
  //  ②△継承（EP以降）: 前の足が△なら次スロットの○は△へ＝合計の（）内カスケードと一致。
  //  ③△確信度エントリー: EPより前に△があればEP足スロットの○は△へ。
  //  ④損切り済（旧データ由来の値・新UIにボタンは無い）が待ち足側に来たら×へ正規化（保有文脈専用の値のため）。
  useEffect(function() {
    var _ei = _epFormState ? _epFormState.epIdx : -1;
    setFNxs(function(prev) {
      var n = prev.slice(), ch = false;
      for (var w = 0; w < 3; w++) { if (_ei >= 0 && w < _ei && n[w] === "損切り済") { n[w] = "×"; ch = true; } }   // _ei<0（α未入力/未達）では触らない＝旧データの損切り済を温存
      for (var i = 0; i < 3; i++) {
        var crossEp = (_ei >= 0 && (i + 1) === _ei);
        if (n[i] === "×" && !crossEp && n[i + 1] !== "×") { n[i + 1] = "×"; ch = true; }
        if (_ei >= 0 && i >= _ei && n[i] === "△" && n[i + 1] === "○") { n[i + 1] = "△"; ch = true; }
      }
      if (_ei >= 0) {
        var tri = false;
        for (var j = 0; j < _ei; j++) { if (n[j] === "△") tri = true; }
        if (tri && n[_ei] === "○") { n[_ei] = "△"; ch = true; }
      }
      return ch ? n : prev;
    });
  }, [fNxs, _epFormState ? _epFormState.epIdx : -1]);


  var itemCandidates = _elGetItemCandidates(data, fDate, fStock);

  var handleSave = function() {

    _fiFlushAll();
    // EP起算方式: 入力漏れ（メモ欄除く）があれば保存不可。必須セットは現在の採用αで動的に決まる。
    if (isV2Form && _epFormState) {
      var _vm = [];
      var _ef = _epFormState;
      if (fTags.length === 0 && !fIsCustom) _vm.push("シグナル");
      if (_ef.alpha == null || isNaN(_ef.alpha)) _vm.push("合計α値");
      if (!fTime) _vm.push("時間");
      if (_ef.o1 == null) _vm.push("OS1高値");
      if (fOsConfVal === "") _vm.push("OS1確定値");
      if (_ef.epIdx !== 0 && _ef.o1 != null && _ef.alpha != null) {
        if (!fNxs[0]) _vm.push("OS1の次足期待度");
        if (_ef.o2 == null) _vm.push("OS2高値");
        if (fOs2Conf === "") _vm.push("OS2確定値");
        if (_ef.epIdx !== 1 && _ef.o2 != null) {
          if (!fNxs[1]) _vm.push("OS2の次足期待度");
          if (_ef.o3 == null) _vm.push("OS3高値");
          if (fOs3Conf === "") _vm.push("OS3確定値");
        }
      }
      // H1/H2はEPの次・その次の足（EP=OS1→OS2/OS3・EP=OS2→OS3/OS4・EP=OS3→OS4/OS5）。
      // 部分入力は必須エラー。該当2本が全欄未入力（期待度含む）は確認のうえ未入力のまま保存可
      // （採用α変更でE未達→成立に変わった既存記録の救済。表ではH損益ー表示・集計から除外され破綻しない。
      //   原則は「αの検証はαシミュ（非保存）で行い、採用αは当時の値を保持する」運用）。
      var _fBarsV = [
        { h: fOsVal, c: fOsConfVal, name: "OS1" },
        { h: fOs2High, c: fOs2Conf, name: "OS2" },
        { h: fOs3High, c: fOs3Conf, name: "OS3" },
        { h: fHoldHighVal, c: fHoldWidthVal, name: "OS4" },
        { h: fHold2HighVal, c: fHold2WidthVal, name: "OS5" }
      ];
      var _hb1 = _ef.epIdx >= 0 ? (_fBarsV[_ef.epIdx + 1] || null) : null;
      var _hb2 = _ef.epIdx >= 0 ? (_fBarsV[_ef.epIdx + 2] || null) : null;
      var _hEmpty = (!_hb1 || (_hb1.h === "" && _hb1.c === "")) && (!_hb2 || (_hb2.h === "" && _hb2.c === "")) && !fHoldExp && !fHold2Exp;
      if (_ef.epIdx >= 0 && !_hEmpty) {
        if (_hb1) {
          if (_hb1.h === "") _vm.push("H1高値（" + _hb1.name + "）");
          if (_hb1.c === "") _vm.push("H1確定値（" + _hb1.name + "）");
        }
        if (!fHoldExp) _vm.push("次足期待度（" + (_fBarsV[_ef.epIdx] ? _fBarsV[_ef.epIdx].name : "EP足") + "・H1保有）");
        if (_hb2) {
          if (_hb2.h === "") _vm.push("H2高値（" + _hb2.name + "）");
          if (_hb2.c === "") _vm.push("H2確定値（" + _hb2.name + "）");
        }
        if (!fHold2Exp) _vm.push("次足期待度（" + (_fBarsV[_ef.epIdx + 1] ? _fBarsV[_ef.epIdx + 1].name : "H1足") + "・H2保有）");
      }
      if (fEntered && fReal === "") _vm.push("実現損益");
      if (_vm.length) { window.alert("未入力の項目があります。\n項目：" + _vm.join("、")); return; }
      if (_ef.epIdx >= 0 && _hEmpty) {
        if (!window.confirm("H1/H2が未入力のままです。このまま保存しますか？\n（表ではー表示・H損益は集計から除外されます）")) return;
      }
    }
    if (_savingRef.current) return;
    _savingRef.current = true;
    var sig = {
      id: isEdit ? initSig.id : _sigId(),
      tag: fTags.length > 0 ? fTags[0] : (fIsCustom ? "__custom__" : ""),
      tags: fTags,
      sigDetail: (function() {
        var _o = {}, _any = false;
        // 分足オーバーライドは「分足欄と異なる」場合だけ number配列で保存＝一致/未設定は分足欄に追従（キー無し）2026-07-09。
        var _mbNow = (fMinBars || []).slice().sort();
        var _barDiff = function(_arr) { if (!_arr || !_arr.length) return null; var _a = _arr.slice().sort(); var _same = _a.length === _mbNow.length && _a.every(function(_x, _i) { return _x === _mbNow[_i]; }); return _same ? null : _a.map(Number); };
        fTags.forEach(function(_t) {
          var _s = (fSigDetail && fSigDetail[_t]) || null;
          var _sb = (fSecBar && fSecBar[_t]) || null;
          var _e = {}, _has = false;
          if (_s) { if (_s.b) { _e.b = _s.b; _has = true; } if (_s.k) { _e.k = _s.k; _has = true; } if (_s.f && _s.f.length) { _e.f = _s.f.slice(); _has = true; } }
          if (_sb) { var _bb = _barDiff(_sb.b), _kb = _barDiff(_sb.k), _fb = _barDiff(_sb.f); if (_bb) { _e.bBar = _bb; _has = true; } if (_kb) { _e.kBar = _kb; _has = true; } if (_fb) { _e.fBar = _fb; _has = true; } }
          if (_has) { _o[_t] = _e; _any = true; }
        });
        return _any ? _o : null;
      })(),
      passThrough: fThru === true ? true : null,
      thruMemo: (fThru === true && fThruMemo) ? fThruMemo : null,
      result: fResult,
      memo: initSig.memo || "", 
      time: fTime || "",
      isCustomTag: fIsCustom,
      customTagText: fIsCustom ? fCustomText : "",
      rationale: fRationale,
      entered: fEntered,
      tradeType: fTradeType,
      priceIn: fEntered && fPriceIn !== "" ? fPriceIn : null,
      priceOut: fEntered && fPriceOut !== "" ? fPriceOut : null,
      entryOsNo: fEntered && fEntryOsNo != null ? fEntryOsNo : null,
      entryOsSign: fEntered ? (fEntryOsSign || null) : null,
      entryOsVal: fEntered && fEntryOsVal !== "" ? Number(fEntryOsVal) : null,
      exitOsSign: fEntered ? (fExitOsSign || null) : null,
      exitOsVal: fEntered && fExitOsVal !== "" ? Number(fExitOsVal) : null,
      shares: fEntered && fShares !== "" ? (parseInt(fShares) || null) : null,
      tradeAlpha: fEntered && fTradeAlpha !== "" && !isNaN(Number(fTradeAlpha)) ? Number(fTradeAlpha) : null,
      baseAlphaVal: fBaseAlpha !== "" && !isNaN(Number(fBaseAlpha)) ? Number(fBaseAlpha) : null,
      lineCoexist: fLineCoexist,
      levelPrice: fLevelPrice !== "" && !isNaN(Number(fLevelPrice)) ? Number(fLevelPrice) : null,
      minBar: (fMinBars && fMinBars.length) ? fMinBars.map(Number).sort(function(_a, _b) { return _a - _b; }) : null,
      addAlphaVal: (fAddAlphaUsed === "○" && fAddAlpha !== "" && !isNaN(Number(fAddAlpha))) ? Number(fAddAlpha) : null,
      addAlphaUsed: fAddAlphaUsed === "○" ? true : (fAddAlphaUsed === "×" ? false : null),
      addAlphaReasons: (fAddAlphaUsed === "○") ? (function() { var _arr = (fAddReasons || []).slice(); var _o = fOtherOn ? (fAddReasonOther || "").trim() : ""; if (_o) _arr.push(_o); return _arr.length ? _arr : null; })() : null,
      ukiUsed: _showUki ? (fUkiUsed === "○") : null,
      ukiVal: (_showUki && fUkiUsed === "○" && fUkiVal !== "" && !isNaN(Number(fUkiVal))) ? Number(fUkiVal) : null,
      rnUsed: fRnUsed === "○",
      rnVal: (fRnUsed === "○" && fRnVal !== "" && !isNaN(Number(fRnVal))) ? Number(fRnVal) : null,
      alphaVal: !isNaN(_fAlpha) ? _fAlpha : null,
      alphaMemo: fAlphaMemo || null,
      includeInTotal: fIncl,
      plannedPnl: fPlan !== "" ? Number(fPlan) : null,
      plannedPnlSign: fPlanSign,
      maxPnl: fMax !== "" ? Number(fMax) : null,
      maxPnlSign: fMaxSign,
      difficulty: fDifficulty || null,
      tpDifficulty: fTpDifficulty || null,
      osVal: fOsVal !== "" ? (isNaN(Number(_toHankaku(fOsVal))) ? null : Number(_toHankaku(fOsVal))) : null,
      osConfSign: fOsConfSign || null,
      osConfVal: fOsConfVal !== "" ? (isNaN(Number(_toHankaku(fOsConfVal))) ? null : Number(_toHankaku(fOsConfVal))) : null,
      holdProfit: fHoldProfit || null,
      holdOsConf: fHoldOsConf,
      holdWidthSign: fHoldWidthSign || null,
      holdWidth: fHoldWidthVal !== "" ? Number(fHoldWidthVal) : null,
      holdPnl: fHoldPnlVal !== "" ? Number(fHoldPnlVal) : null,
      holdPnlSign: fHoldPnlSign || null,
      holdHighVal: fHoldHighVal !== "" ? Number(fHoldHighVal) : null,
      holdHighSign: fHoldHighSign || null,
      holdExp: fHoldExp || null,
      hold2Exp: fHold2Exp || null,
      hold2Profit: fHold2Profit || null,
      hold2OsConf: fHold2OsConf,
      hold2WidthSign: fHold2WidthSign || null,
      hold2Width: fHold2WidthVal !== "" ? Number(fHold2WidthVal) : null,
      hold2Pnl: fHold2PnlVal !== "" ? Number(fHold2PnlVal) : null,
      hold2PnlSign: fHold2PnlSign || null,
      hold2HighVal: fHold2HighVal !== "" ? Number(fHold2HighVal) : null,
      hold2HighSign: fHold2HighSign || null,
      holdMemo: fHoldMemo || null,
      hold2Memo: fHold2Memo || null,
      realizedPnl: fEntered && fReal !== "" ? Number(fReal) : null,
      realizedPnlSign: fRealSign,
      profitGrade: null,
      reflection: fReflection
    };
    if (isV2Form) {
      // OS1〜5固定欄（scheme:3）: OS2/OS3は常に2・3本目として保存（4・5本目=hold*/hold2*は共通部で保存済み）。
      // 到達期待はEP前の待ち足の判断のみ保存（EP=OS1→os1Exp不要・EP=OS1/2→os2Exp不要）。
      var _efS = _epFormState || { epIdx: -1 };
      var _useOs2 = _efS.epIdx !== 0;
      var _useOs3 = _useOs2 && _efS.epIdx !== 1;
      sig.scheme = 3;
      sig.result = null;  // 結果はEP足から自動導出
      sig.os1Exp = _useOs2 ? (fOs1Exp || null) : null;
      sig.os2High = fOs2High !== "" ? Number(fOs2High) : null;
      sig.os2HighSign = fOs2High !== "" ? (fOs2HighSign || "+") : null;
      sig.os2Conf = fOs2Conf !== "" ? Number(fOs2Conf) : null;
      sig.os2ConfSign = fOs2Conf !== "" ? (fOs2ConfSign || null) : null;
      sig.os2Exp = _useOs3 ? (fOs2Exp || null) : null;
      sig.os3High = fOs3High !== "" ? Number(fOs3High) : null;
      sig.os3HighSign = fOs3High !== "" ? (fOs3HighSign || "+") : null;
      sig.os3Conf = fOs3Conf !== "" ? Number(fOs3Conf) : null;
      sig.os3ConfSign = fOs3Conf !== "" ? (fOs3ConfSign || null) : null;
      sig.os3Exp = null;  // 廃止 2026-07-06: 次足期待度への統一でEP=OS3のOS3スロット=保有判断（holdExpへ導出済み）。旧記録のos3Expは残っていても読み取りで使われないだけ（無害）。
      // 次足期待度（正本・足固定 index0..3=OS1..OS4）2026-07-06: レガシー（os1/2Exp・holdExp/hold2Exp）は上で現在EP位置から導出済み＝下流・旧版と互換。OS5に次足は無い。
      sig.nextExp1 = fNxs[0] || null;
      sig.nextExp2 = fNxs[1] || null;
      sig.nextExp3 = fNxs[2] || null;
      sig.nextExp4 = fNxs[3] || null;
    }

    if (isEdit && (initial.stock !== fStock || initial.date !== fDate)) {
      _elDeleteSignal(save, initial.stock, initial.date, initSig.id);
      _elSaveSignal(save, fStock, fDate, sig, true);
    } else {
      _elSaveSignal(save, fStock, fDate, sig, !isEdit);
    }
    onClose();
  };

  
  var _estWidthIsOsLow = (function() {
    var ck = fStock + "_" + fDate;
    var cd = data.charts && data.charts[ck];
    var av = _fAlpha;
    if (av == null) return false;
    var osV = Number(fOsVal) || 0;
    return osV >= 0 && osV < av;
  })();

  var I = {
    padding: "9px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box"
  };
  var L = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#666", fontWeight: 600 };
  var SH_ = { fontSize: 11, color: "#999", fontWeight: 700, letterSpacing: 1, marginTop: 14, marginBottom: 6, textTransform: "uppercase" };

  return React.createElement("div", {
    style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }
  },
    React.createElement("div", {
      style: { background: "#fff", borderRadius: 12, padding: 20, maxWidth: 780, width: "100%", maxHeight: "90vh", overflowY: "auto" }
    },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
        React.createElement("div", { style: { fontSize: 16, fontWeight: 700 } }, isEdit ? "📝 エントリー記録 編集" : "📝 新規エントリー記録"),
        React.createElement("button", {
          onClick: onClose,
          style: { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888", padding: 4 }
        }, "×")
      ),
      
      React.createElement("div", { style: SH_ }, "基本情報"),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 } },
        React.createElement("label", { style: L }, "日付",
          React.createElement("div", { style: { display: "flex", gap: 4 } },
            React.createElement("input", { type: "date", value: fDate, onChange: function(e) { setFDate(e.target.value); }, style: Object.assign({}, I, { flex: 1 }) }),
            React.createElement("button", {
              onClick: function() { setFDate(todayStr()); },
              style: { padding: "0 10px", fontSize: 11, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer" }
            }, "今日")
          )
        ),
        React.createElement("label", { style: L }, "時刻",
          React.createElement("div", { style: { display: "flex", gap: 4 } },
            React.createElement("input", { type: "time", value: fTime, onChange: function(e) { setFTime(e.target.value); }, style: Object.assign({}, I, { flex: 1 }) }),
            React.createElement("button", {
              onClick: function() {
                var n = new Date();
                setFTime(String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0"));
              },
              style: { padding: "0 6px", fontSize: 11, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer" }
            }, "現在")
          )
        )
      ),
      React.createElement("label", { style: L }, "銘柄",
        React.createElement("select", {
          value: fStock,
          onChange: function(e) { setFStock(e.target.value); setFItemId(null); },
          style: I
        }, allStocks.map(function(s) { return React.createElement("option", { key: s, value: s }, s); }))
      ),
      
      React.createElement("div", { style: SH_ }, "売/買"),
      React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } },
        ["空売", "買い"].map(function(val) {
          var on = fTradeType === val;
          var col = val === "空売" ? "#C0392B" : "#1E8449";
          var bg  = val === "空売" ? "#FCEBEB" : "#EAF3DE";
          return React.createElement("button", {
            key: val,
            onClick: function() { setFTradeType(val); },
            style: {
              flex: 1, padding: "10px 12px", fontSize: 14, fontWeight: 700,
              border: on ? "1.5px solid " + col : "1px solid #ddd",
              background: on ? bg : "#fff",
              color: on ? col : "#888",
              borderRadius: 6, cursor: "pointer", textAlign: "center"
            }
          }, val);
        })
      ),
      
      React.createElement("div", { style: SH_ }, "分足"),
      React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        ["1", "5"].map(function(_mb) {
          var on = fMinBars.indexOf(_mb) >= 0;
          return React.createElement("button", {
            key: _mb,
            onClick: function() { setFMinBars(function(_prev) { return (_prev.indexOf(_mb) >= 0) ? _prev.filter(function(_x) { return _x !== _mb; }) : _prev.concat([_mb]); }); },
            style: {
              minWidth: 38, padding: "5px 12px", fontSize: 13, fontWeight: 800,
              border: on ? "1.5px solid #166534" : "1px solid #ddd",
              background: on ? "#EAF7EE" : "#fff",
              color: on ? "#166534" : "#888",
              borderRadius: 6, cursor: "pointer", textAlign: "center"
            }
          }, _mb);
        }),
        React.createElement("span", { style: { fontSize: 12, color: "#94A3B8", fontWeight: 600 } }, "分足")
      ),

      React.createElement("div", { style: SH_ }, "🎯 エントリーシグナル"),
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 } },
        signalTags.concat(fTags.filter(function(_o) { return signalTags.indexOf(_o) < 0; })).map(function(t) {
          var on = fTags.includes(t);
          return React.createElement("button", {
            key: t,
            onClick: function() { setFTags(function(prev) { return on ? prev.filter(function(x) { return x !== t; }) : prev.concat([t]); }); },
            style: {
              padding: "6px 10px", fontSize: 12, fontWeight: 600,
              border: on ? "1.5px solid #FB923C" : "1px solid #ddd",
              background: on ? "#FFEDD5" : "#fff",
              color: on ? "#9A3412" : "#555",
              borderRadius: 6, cursor: "pointer"
            }
          }, signalTags.indexOf(t) < 0 ? React.createElement("span", null, t, React.createElement("span", { style: { color: "#B91C1C", fontWeight: 800, marginLeft: 4 } }, "✕削除")) : t);
        }),
        (function() {
          var on = fIsCustom;
          return React.createElement("button", {
            key: "__custom__",
            onClick: function() { setFIsCustom(!on); },
            style: {
              padding: "6px 10px", fontSize: 12, fontWeight: 600,
              border: on ? "1.5px solid #6366F1" : "1px solid #ddd",
              background: on ? "#EEF2FF" : "#fff",
              color: on ? "#4338CA" : "#555",
              borderRadius: 6, cursor: "pointer"
            }
          }, "＋ その他");
        })()
      ),
      fTags.length ? React.createElement("div", { style: { marginBottom: 6 } },
        // シグナル詳細（3セクション化 2026-07-07c・案A縦積み）: 選択中の各シグナルの直下に①底抜け(単一)/②起点(単一)/③その他特徴(複数)のチップ行を表示。再タップ解除・任意（未選択=分析では「未分類」）。
        // 候補はセクション別custom.sigDetails2[タグ]={b,k,f}（タグに無ければ旧custom.sigDetails[タグ]を各セクションへ複製表示）。追加/改名/削除/並び替えの書き込みは_writeSec経由でsigDetails2のみ（旧キーは旧端末互換のため凍結）。
        fTags.map(function(_dt) {
          var _m2raw = (custom.sigDetails2 || {})[_dt];
          var _seed = ((custom.sigDetails || {})[_dt] || []);
          var _m2 = (_m2raw && typeof _m2raw === "object") ? { b: (_m2raw.b || []), k: (_m2raw.k || []), f: (_m2raw.f || []) } : { b: _seed, k: _seed, f: _seed };
          var _curSec = (fSigDetail && fSigDetail[_dt]) || { b: null, k: null, f: [] };
          // セクション別リストの書き込みヘルパー（prevベース）: sigDetails2[_dt]が無ければ旧リストから3セクションを実体化してから対象セクションを更新。_listは配列 or (現リスト)=>新リスト。
          var _writeSec = function(prev, _secKey, _list) {
            var _c = Object.assign({}, prev.custom || {});
            var _all = Object.assign({}, _c.sigDetails2 || {});
            var _cur = _all[_dt];
            var _base = (_cur && typeof _cur === "object")
              ? { b: (_cur.b || []).slice(), k: (_cur.k || []).slice(), f: (_cur.f || []).slice() }
              : (function() { var _s0 = (((prev.custom || {}).sigDetails || {})[_dt] || []); return { b: _s0.slice(), k: _s0.slice(), f: _s0.slice() }; })();
            _base[_secKey] = (typeof _list === "function") ? _list(_base[_secKey]) : _list;
            _all[_dt] = _base;
            _c.sigDetails2 = _all;
            return _c;
          };
          return React.createElement("div", { key: "det_" + _dt, style: { margin: "0 0 6px 12px", padding: "7px 9px", borderLeft: "2px solid #FDBA74", background: "#FFFBF5" } },
            React.createElement("div", { style: { fontSize: 11, color: "#9A3412", fontWeight: 700, marginBottom: 5 } }, "└ " + _dt + " の詳細（任意）",
              React.createElement("span", { style: { fontSize: 9, color: "#C4B5A4", fontWeight: 600, marginLeft: 6 } }, "チップをドラッグで並び替え（同セクション内）")),
            _EL_SIG_SECS.map(function(_sc) {
              var _cands0 = _m2[_sc.key];
              var _cands = (fDetOrder && fDetOrder.tag === _dt && fDetOrder.sec === _sc.key) ? fDetOrder.list : _cands0;
              var _curArr = _sc.multi ? (_curSec.f || []) : (_curSec[_sc.key] ? [_curSec[_sc.key]] : []);
              var _list = _cands.concat(_curArr.filter(function(_x) { return _cands.indexOf(_x) < 0; }));   // 選択済みのマスター外(孤児)も末尾に表示
              return React.createElement("div", { key: _sc.key, style: { margin: "2px 0 6px" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 3 } },
                  React.createElement("span", { style: { fontSize: 10, color: "#B45309", fontWeight: 700 } }, _sc.label,
                    React.createElement("span", { style: { fontSize: 9, color: "#C4B5A4", fontWeight: 600, marginLeft: 4 } }, _sc.multi ? "（複数可）" : "（1つまで）")),
                  React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3 } },
                    React.createElement("span", { style: { fontSize: 9, color: "#94A3B8", fontWeight: 600 } }, "分足"),
                    React.createElement("span", { style: { display: "inline-flex", border: "1px solid #B9DCC5", borderRadius: 6, overflow: "hidden" } },
                      ["1", "5"].map(function(_bv, _bvi) {
                        var _eff = _secBarEff(_dt, _sc.key);
                        var _bon = _eff.indexOf(_bv) >= 0;
                        var _fol = _secBarFollowing(_dt, _sc.key);
                        return React.createElement("button", { key: _bv, type: "button",
                          onClick: function() { _toggleSecBar(_dt, _sc.key, _bv); },
                          title: _fol ? "分足欄に従う既定（タップで個別指定）" : "個別指定中（分足欄と一致させると追従に戻る）",
                          style: { padding: "2px 9px", fontSize: 10, fontWeight: 700, border: "none",
                            borderLeft: _bvi > 0 ? "1px solid #B9DCC5" : "none",
                            background: _bon ? (_fol ? "#EAF7EE" : "#166534") : "#fff",
                            color: _bon ? (_fol ? "#166534" : "#fff") : "#999",
                            cursor: "pointer" } }, _bv);
                      })))),
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" } },
                  _list.map(function(_dn) {
                    var _on = _curArr.indexOf(_dn) >= 0;
                    var _isOrphan = _cands.indexOf(_dn) < 0;
                    var _dragSt = _detDragRef.current;
                    var _dragging = !!(_dragSt && _dragSt.started && _dragSt.tag === _dt && _dragSt.sec === _sc.key && _dragSt.name === _dn);
                    return React.createElement("span", { key: _dn,
                      "data-dettag": _dt, "data-detsec": _sc.key, "data-detname": _dn,
                      onPointerDown: _isOrphan ? null : function(e) {
                        // setPointerCaptureはドラッグ開始時（下のpointermove）まで呼ばない＝タップ時にclickがキャプチャ先へretargetされ内側buttonのonClick（選択）が発火しない不具合の回避 2026-07-06g。
                        _detDragRef.current = { tag: _dt, sec: _sc.key, name: _dn, sx: e.clientX, sy: e.clientY, started: false, list: null };
                      },
                      onPointerMove: function(e) {
                        var d = _detDragRef.current;
                        if (!d || d.tag !== _dt || d.sec !== _sc.key || d.name !== _dn) return;
                        if (!d.started) {
                          if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 7) return;
                          d.started = true;
                          try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_e0) {}
                          d.list = _cands0.slice();
                          _detMovedRef.current = true;
                          setFDetOrder({ tag: _dt, sec: _sc.key, list: d.list.slice() });
                          return;
                        }
                        var el = document.elementFromPoint(e.clientX, e.clientY);
                        var chip = (el && el.closest) ? el.closest("[data-dettag]") : null;
                        if (!chip || chip.getAttribute("data-dettag") !== _dt || chip.getAttribute("data-detsec") !== _sc.key) return;
                        var over = chip.getAttribute("data-detname");
                        if (!over || over === d.name) return;
                        var lst = d.list.slice();
                        var fi = lst.indexOf(d.name), ti = lst.indexOf(over);
                        if (fi < 0 || ti < 0 || fi === ti) return;
                        lst.splice(fi, 1); lst.splice(ti, 0, d.name);
                        d.list = lst;
                        setFDetOrder({ tag: _dt, sec: _sc.key, list: lst.slice() });
                      },
                      onPointerUp: function() {
                        var d = _detDragRef.current;
                        _detDragRef.current = null;
                        if (d && d.started && d.list) {
                          var _fin = d.list.slice(), _fsec = d.sec;
                          save(function(prev) { return Object.assign({}, prev, { custom: _writeSec(prev, _fsec, _fin) }); });
                          setTimeout(function() { _detMovedRef.current = false; }, 0);
                        }
                        setFDetOrder(null);
                      },
                      onPointerCancel: function() { _detDragRef.current = null; _detMovedRef.current = false; setFDetOrder(null); },
                      style: { display: "inline-flex", alignItems: "center", gap: 1, touchAction: "none",
                        boxShadow: _dragging ? "0 2px 8px rgba(0,0,0,0.3)" : null,
                        transform: _dragging ? "scale(1.06)" : null,
                        opacity: _dragging ? 0.9 : null } },
                      React.createElement("button", {
                        onClick: function() {
                          if (_detMovedRef.current) { _detMovedRef.current = false; return; }
                          setFSigDetail(function(prev) {
                            var _o = Object.assign({}, prev);
                            var _pe = _o[_dt] || {};
                            var _e = { b: _pe.b || null, k: _pe.k || null, f: (_pe.f || []).slice() };
                            if (_sc.multi) {
                              var _i = _e.f.indexOf(_dn);
                              if (_i >= 0) _e.f.splice(_i, 1); else _e.f.push(_dn);
                            } else {
                              _e[_sc.key] = (_e[_sc.key] === _dn) ? null : _dn;   // ①②は単一＝再タップで解除・別チップで置き換え
                            }
                            if (_e.b || _e.k || _e.f.length) _o[_dt] = _e; else delete _o[_dt];
                            return _o;
                          });
                        },
                        style: { padding: "4px 9px", fontSize: 11, fontWeight: 600,
                          border: _on ? "1.5px solid #D97706" : "1px solid #ddd",
                          background: _on ? "#FEF3C7" : "#fff", color: _on ? "#92400E" : "#777",
                          borderRadius: 6, cursor: "pointer" }
                      }, _dn),
                      (fDetEdit && !_isOrphan) ? React.createElement(React.Fragment, null,
                        React.createElement("button", {
                          title: "この詳細の名前を変更（このセクションに付いた過去の記録の詳細も一括変更）",
                          onClick: function() { if (_detMovedRef.current) { _detMovedRef.current = false; return; } _detAddValRef.current = _dn; setFDetAdd({ tag: _dt, sec: _sc.key, val: _dn, old: _dn }); },
                          style: { padding: "1px 5px", fontSize: 11, fontWeight: 800, border: "1px solid #93C5FD", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, cursor: "pointer" }
                        }, "✎"),
                        React.createElement("button", {
                          title: "この詳細をこのセクションの候補から削除（過去の記録に付いた詳細はそのまま残ります）",
                          onClick: function() {
                            if (_detMovedRef.current) { _detMovedRef.current = false; return; }
                            setFDetAdd(null);
                            save(function(prev) { return Object.assign({}, prev, { custom: _writeSec(prev, _sc.key, function(_l) { return _l.filter(function(x) { return x !== _dn; }); }) }); });
                            setFSigDetail(function(prev) {
                              var _pe = prev[_dt]; if (!_pe) return prev;
                              var _e = { b: _pe.b || null, k: _pe.k || null, f: (_pe.f || []).slice() };
                              if (_sc.multi) { if (_e.f.indexOf(_dn) < 0) return prev; _e.f = _e.f.filter(function(x) { return x !== _dn; }); }
                              else { if (_e[_sc.key] !== _dn) return prev; _e[_sc.key] = null; }
                              var _o = Object.assign({}, prev);
                              if (_e.b || _e.k || _e.f.length) _o[_dt] = _e; else delete _o[_dt];
                              return _o;
                            });
                          },
                          style: { padding: "1px 5px", fontSize: 11, fontWeight: 800, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", borderRadius: 4, cursor: "pointer" }
                        }, "×")
                      ) : null);
                  }),
                  (function() {
                    var _addOpen = !!(fDetAdd && fDetAdd.tag === _dt && fDetAdd.sec === _sc.key);
                    return React.createElement("button", {
                      onClick: function() {
                        if (_addOpen) { setFDetAdd(null); return; }
                        _detAddValRef.current = "";
                        setFDetAdd({ tag: _dt, sec: _sc.key, val: "" });
                      },
                      style: { padding: "4px 9px", fontSize: 11, fontWeight: 600, border: _addOpen ? "1px solid #0369A1" : "1px dashed #bbb", background: _addOpen ? "#EFF6FF" : "#fff", color: _addOpen ? "#0369A1" : "#888", borderRadius: 6, cursor: "pointer" }
                    }, _addOpen ? "✕ 閉じる" : "＋追加");
                  })(),
                  _cands.length ? React.createElement("button", {
                    onClick: function() { setFDetEdit(!fDetEdit); setFDetAdd(null); },
                    title: "詳細候補の名前変更・削除モード（✎で改名・×で削除）",
                    style: { padding: "4px 8px", fontSize: 10, fontWeight: 700, border: "1px solid " + (fDetEdit ? "#B91C1C" : "#ddd"), background: fDetEdit ? "#FEF2F2" : "#fff", color: fDetEdit ? "#B91C1C" : "#999", borderRadius: 6, cursor: "pointer" }
                  }, fDetEdit ? "完了" : "編集") : null
                ),
                (fDetAdd && fDetAdd.tag === _dt && fDetAdd.sec === _sc.key) ? React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 6, alignItems: "center", flexWrap: "wrap" } },
                  fDetAdd.old != null ? React.createElement("span", { style: { fontSize: 10, color: "#1D4ED8", fontWeight: 700, whiteSpace: "nowrap" } }, "『" + fDetAdd.old + "』を改名:") : null,
                  React.createElement(FastInput, {
                    type: "text",
                    value: fDetAdd.val || "",
                    onChange: function(v) { _detAddValRef.current = v; setFDetAdd(function(p) { return (p && p.tag === _dt && p.sec === _sc.key) ? Object.assign({}, p, { val: v }) : p; }); },
                    placeholder: fDetAdd.old != null ? "新しい名前" : "詳細名（例: 押し目前）",
                    style: { flex: 1, minWidth: 120, padding: "6px 9px", fontSize: 12, border: "1px solid #93C5FD", borderRadius: 6, background: "#fff", boxSizing: "border-box" }
                  }),
                  React.createElement("button", {
                    onClick: function() {
                      _fiFlushAll();
                      var _nm = (_detAddValRef.current || "").trim();
                      if (!_nm) return;
                      if (fDetAdd.old != null) {
                        // 改名: セクション別マスター＋過去記録(signal.sigDetail[このタグ]の同セクション)を一括変更＝分析のグループが割れない。③(f)は旧形式（文字列/フラット配列）の記録も追従（_elSigDetailRenameSig）。同名が既にあれば「統合」(dedupe) 2026-07-07g。
                        var _old = fDetAdd.old;
                        if (_nm !== _old) {
                          save(function(prev) {
                            var _curList = (function() { var _cur = ((prev.custom || {}).sigDetails2 || {})[_dt]; if (_cur && typeof _cur === "object") return (_cur[_sc.key] || []); return (((prev.custom || {}).sigDetails || {})[_dt] || []); })();
                            var _rnL = _curList.map(function(x) { return x === _old ? _nm : x; });
                            var _c = _writeSec(prev, _sc.key, _rnL.filter(function(x, i) { return x && _rnL.indexOf(x) === i; }));
                            var _pCharts = prev.charts || {}, _nCharts = {};
                            Object.keys(_pCharts).forEach(function(ck) {
                              var cc = _pCharts[ck];
                              if (!cc || !Array.isArray(cc.signals)) { _nCharts[ck] = cc; return; }
                              var _ch = false;
                              var sigs = cc.signals.map(function(s) { var _ns = _elSigDetailRenameSig(s, _dt, _sc.key, _old, _nm); if (_ns !== s) _ch = true; return _ns; });
                              _nCharts[ck] = _ch ? Object.assign({}, cc, { signals: sigs }) : cc;
                            });
                            return Object.assign({}, prev, { custom: _c, charts: _nCharts });
                          });
                          setFSigDetail(function(prev) {
                            var _pe = prev[_dt]; if (!_pe) return prev;
                            var _e = { b: _pe.b || null, k: _pe.k || null, f: (_pe.f || []).slice() };
                            if (_sc.multi) {
                              if (_e.f.indexOf(_old) < 0) return prev;
                              var _nf = []; _e.f.forEach(function(x) { var _y = x === _old ? _nm : x; if (_nf.indexOf(_y) < 0) _nf.push(_y); }); _e.f = _nf;
                            } else {
                              if (_e[_sc.key] !== _old) return prev;
                              _e[_sc.key] = _nm;
                            }
                            var _o = Object.assign({}, prev); _o[_dt] = _e; return _o;
                          });
                        }
                      } else {
                        if (_cands0.indexOf(_nm) < 0) save(function(prev) { return Object.assign({}, prev, { custom: _writeSec(prev, _sc.key, function(_l) { var _ar = _l.slice(); if (_ar.indexOf(_nm) < 0) _ar.push(_nm); return _ar; }) }); });
                        setFSigDetail(function(prev) {
                          var _o = Object.assign({}, prev);
                          var _pe = _o[_dt] || {};
                          var _e = { b: _pe.b || null, k: _pe.k || null, f: (_pe.f || []).slice() };
                          if (_sc.multi) { if (_e.f.indexOf(_nm) < 0) _e.f.push(_nm); }
                          else _e[_sc.key] = _nm;
                          _o[_dt] = _e;
                          return _o;
                        });
                      }
                      _detAddValRef.current = "";
                      setFDetAdd(null);
                    },
                    style: { padding: "6px 14px", fontSize: 12, fontWeight: 700, background: "#0369A1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" }
                  }, fDetAdd.old != null ? "変更" : "追加"),
                  React.createElement("button", {
                    onClick: function() { _detAddValRef.current = ""; setFDetAdd(null); },
                    style: { padding: "6px 10px", fontSize: 12, fontWeight: 700, background: "#fff", color: "#888", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }
                  }, "✕")
                ) : null
              );
            })
          );
        })
      ) : null,
      // ④ ライン併存ルール（独自欄 2026-07-08g）: ③その他の下・〇×（既定×）。〇で基本α値が自動的に1（fLineCoexist effect・手修正可）。
      React.createElement("div", { style: { margin: "6px 0 8px", padding: "8px 10px", borderRadius: 8, background: fLineCoexist ? "#F0FDFA" : "#F8FAFC", border: "1px solid " + (fLineCoexist ? "#99F6E4" : "#E2E8F0") } },
        React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0F766E", marginBottom: 4 } }, "④ ライン併存ルール"),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
          React.createElement("div", { style: { display: "inline-flex", gap: 4 } },
            [["○", "#C0392B", "#FCEBEB", true], ["×", "#1E8449", "#EAF3DE", false]].map(function(kv) {
              var on = fLineCoexist === kv[3];
              return React.createElement("button", { key: kv[0], type: "button", onClick: function() { setFLineCoexist(kv[3]); },
                style: { padding: "3px 14px", fontSize: 13, fontWeight: on ? 800 : 600, border: on ? "2px solid " + kv[1] : "1px solid #ddd", background: on ? kv[2] : "#fff", color: on ? kv[1] : "#999", borderRadius: 6, cursor: "pointer", lineHeight: 1.5 } }, kv[0]);
            })),
          React.createElement("span", { style: { fontSize: 10, color: "#64748B" } }, "〇で基本α値が自動的に1になります（手修正可）"))),
      (function() {
        var _oc = {};
        _elCollectAllSignals(data).forEach(function(r) {
          var s = r && r.signal; if (!s) return;
          var ts = (s.tags && s.tags.length) ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : []);
          ts.forEach(function(t) { if (t && signalTags.indexOf(t) < 0) _oc[t] = (_oc[t] || 0) + 1; });
        });
        var _ot = Object.keys(_oc);
        if (!_ot.length) return null;
        var _tot = 0; _ot.forEach(function(t) { _tot += _oc[t]; });
        return React.createElement("button", {
          onClick: function() {
            if (!window.confirm("プールに無い『削除済みシグナル』を全記録から除去します：\n\n" + _ot.map(function(t) { return "・" + t + "（" + _oc[t] + "件）"; }).join("\n") + "\n\n戻せません。実行しますか？")) return;
            var _set = {}; _ot.forEach(function(t) { _set[t] = 1; });
            save(function(prev) {
              var charts = Object.assign({}, prev.charts || {});
              Object.keys(charts).forEach(function(ck) {
                var cc = charts[ck]; if (!cc || !Array.isArray(cc.signals)) return;
                var ch = false;
                var sigs = cc.signals.map(function(s) {
                  if (!s) return s;
                  var up = Object.assign({}, s), c2 = false;
                  if (Array.isArray(s.tags)) { var nt = s.tags.filter(function(x) { return _set[x] !== 1; }); if (nt.length !== s.tags.length) { up.tags = nt; c2 = true; } }
                  if (s.tag && _set[s.tag] === 1) { up.tag = (up.tags && up.tags.length) ? up.tags[0] : ""; c2 = true; }
                  if (c2) ch = true;
                  return up;
                });
                if (ch) charts[ck] = Object.assign({}, cc, { signals: sigs });
              });
              return Object.assign({}, prev, { charts: charts });
            });
            setFTags(function(prev) { return prev.filter(function(x) { return _set[x] !== 1; }); });
            window.alert("削除済みシグナルを全記録から除去しました。");
          },
          style: { marginBottom: 8, padding: "7px 11px", fontSize: 11, fontWeight: 700, color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 6, cursor: "pointer", width: "100%", textAlign: "left" }
        }, "🧹 プール外の削除済みシグナル（" + _ot.length + "種・計" + _tot + "件）を全記録から一括除去");
      })(),
      fIsCustom && React.createElement(FastInput, {
        type: "text",
        value: fCustomText,
        onChange: function(v) { setFCustomText(v); },
        placeholder: "",
        style: Object.assign({}, I, { marginBottom: 6 })
      }),
      
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 14, marginBottom: 4 } },
        React.createElement("span", { style: { fontSize: 11, color: "#999", fontWeight: 700, letterSpacing: 1 } }, "α値")),
      React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 6 } }, "基本α値＋浮き足加算α値＋追加α値＝合計α値（合計が実際に使う採用α＝水準線比）。浮き足は入力値（前足浮き値）の半額・小数切捨てを加算（全シグナルで入力可）。追加αは〇を選んだ時だけ入力。基本αの初期値＝詳細別→シグナル別→銘柄全体の順でデータ十分な推奨基本α（★の段）"),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7, marginBottom: 8 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 } },
      (function() {
        var _setBA = function(val) { _baTouchedRef.current = true; var _v = _toHankakuNum(val); if (_v === "") { setFBaseAlpha(""); return; } var n = Number(_v); if (isNaN(n)) return; if (n > 50) n = 50; if (n < 0) n = 0; setFBaseAlpha(String(n)); };
        var _stepBA = function(delta) { _baTouchedRef.current = true; setFBaseAlpha(function(prev) { var base = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : (_autoBaseA != null ? _autoBaseA : 0); var n = base + delta; if (n > 50) n = 50; if (n < 0) n = 0; return String(n); }); };
        return React.createElement("div", {
          style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: "#F0F9FF", border: "1px solid #BAE6FD", fontSize: 12 }
        },
          React.createElement("span", { style: { color: "#555", fontWeight: 600 } }, "基本α値"),
          React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #BAE6FD", borderRadius: 4, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", min: "0", max: "50", step: "1",
              value: fBaseAlpha !== "" ? fBaseAlpha : (_autoBaseA != null ? String(_autoBaseA) : ""),
              onChange: function(e) { _setBA(e.target.value); },
              placeholder: "推奨基本α",
              style: { padding: "3px 6px", fontSize: 13, fontWeight: 800, color: "#0C4A6E", border: "none", outline: "none", background: "#fff", width: 56, textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(function() { _stepBA(1); }, function() { _stepBA(-1); })
          ),
          React.createElement("span", { style: { fontSize: 12, color: "#64748B" } }, "円")
        );
      })(),
        (function() {
          if (!_refBaseAlpha) return fStock ? React.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "#94A3B8" } }, "推奨基本α値：データ無し") : null;
          return React.createElement("span", { title: "保存済み記録から算出した推奨基本α（記録日起点の直近・参考用。追加α〇・浮き足〇の記録は母数から除外）", style: { fontSize: 11, fontWeight: 600, color: "#64748B" } },
            React.createElement("span", { style: { color: "#94A3B8" } }, "推奨基本α値"),
            [["直近25件", _refBaseAlpha.w1], ["直近50件", _refBaseAlpha.m1], ["直近100件", _refBaseAlpha.m3], ["全期間", _refBaseAlpha.all]].map(function(kv, i) {
              return React.createElement("span", { key: i },
                "　" + kv[0] + "：",
                kv[1] && kv[1].alpha != null ? React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, kv[1].alpha + "円", kv[1].ok ? null : React.createElement("span", { style: { color: "#94A3B8", fontWeight: 600, fontSize: 9, marginLeft: 1 } }, "（仮参考）")) : React.createElement("span", { style: { color: "#aaa" } }, "—"),
                (kv[1] && kv[1].alpha2 != null) ? React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, "（次点：" + kv[1].alpha2 + "円）") : null);
            }));
        })()),
      _refSigAlpha ? React.createElement("div", {
        // シグナル/詳細別の推奨基本α（2026-07-07c）: 詳細別→シグナル別→銘柄全体の段階フォールバックで基本αを自動入力（★=採用段）。データ不足(ok未満)の段は件数を添えて表示し下の段へ。
        title: "選択中シグナル（先頭タグ）/①②③の選択詳細で母数を絞った推奨基本α（直近50→100→全期間の件数窓・記録日前日まで・追加α〇除外）。★＝基本αの自動入力に使用中の段。データ不足＝件数フロア未満（仮＝参考値）。各選択値の内訳は全期間・表示のみ",
        style: { fontSize: 11, fontWeight: 600, color: "#64748B", margin: "0 0 6px" } },
        React.createElement("span", { style: { color: "#94A3B8" } }, "シグナル別参考"),
        (function() {
          var _star = React.createElement("span", { style: { color: "#B91C1C", fontSize: 9, fontWeight: 800, marginLeft: 2 } }, "★自動入力");
          var _lvl = function(_key, _label, _p, _clr) {
            if (!_p) return null;
            return React.createElement("span", { key: _key },
              "　" + _label + "：",
              (_p.alpha != null && _p.ok)
                ? React.createElement("span", { style: { color: _clr, fontWeight: 700 } }, _p.alpha + "円")
                : React.createElement("span", { style: { color: "#94A3B8" } }, "データ不足",
                    _p.alpha != null ? React.createElement("span", { style: { fontSize: 9 } }, "（仮" + _p.alpha + "円）") : null),
              React.createElement("span", { style: { color: "#94A3B8", fontSize: 9 } }, "（n=" + _p.n + "）"),
              _autoBase.src === _key ? _star : null);
          };
          return React.createElement(React.Fragment, null,
            _lvl("詳細別", "選択詳細の組合せ", _refSigAlpha.det, "#B91C1C"),
            _lvl("シグナル別", _refSigAlpha.tag, _refSigAlpha.sig, "#9A3412"),
            _autoBase.src === "銘柄全体" ? React.createElement("span", null,
              "　銘柄全体：",
              _defBaseA != null ? React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, _defBaseA + "円") : React.createElement("span", { style: { color: "#aaa" } }, "—"),
              _star) : null);
        })(),
        _refSigAlpha.picks.length ? React.createElement("span", { style: { color: "#CBD5E1" } }, "　｜") : null,
        _refSigAlpha.picks.map(function(_dp, _di) {
          return React.createElement("span", { key: "p" + _di },
            "　" + _dp.lb + "＝" + _dp.name + "：",
            _dp.pick.alpha != null
              ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700 } }, _dp.pick.alpha + "円", _dp.pick.ok ? null : React.createElement("span", { style: { color: "#94A3B8", fontWeight: 600, fontSize: 9, marginLeft: 1 } }, "（仮参考）"))
              : React.createElement("span", { style: { color: "#94A3B8" } }, "データ不足"),
            React.createElement("span", { style: { color: "#94A3B8", fontSize: 9 } }, "（n=" + _dp.pick.n + "）"));
        })
      ) : null,
      _showUki ? React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 } },
      (function() {
        // 浮き足加算α値の行（全シグナルで表示・基本α行と追加α行の間）2026-07-03→07-07。〇×→〇で前足浮き値（生値）を入力し半額（切捨て）をαに加算。
        var _setUV = function(val) { var _v = _toHankakuNum(val); if (_v === "") { setFUkiVal(""); return; } var n = Number(_v); if (isNaN(n)) return; if (n > 999) n = 999; if (n < 0) n = 0; setFUkiVal(String(n)); };
        var _stepUV = function(delta) { setFUkiVal(function(prev) { var base = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : 0; var n = base + delta; if (n > 999) n = 999; if (n < 0) n = 0; return String(n); }); };
        var _ukiOn = fUkiUsed === "○";
        return React.createElement("div", {
          style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: "#F0FDF4", border: "1px solid #86EFAC", fontSize: 12 }
        },
          React.createElement("span", { style: { color: "#555", fontWeight: 600 } }, "浮き足加算α値"),
          React.createElement("div", { style: { display: "inline-flex", gap: 4 } },
            [["○", "○", "要", "#C0392B", "#FCEBEB"], ["×", "×", "不要", "#1E8449", "#EAF3DE"]].map(function(kv) {
              var on = fUkiUsed === kv[0];
              return React.createElement("button", { key: kv[0], type: "button",
                onClick: function() { setFUkiUsed(kv[0]); },
                title: kv[0] === "○" ? "前足の浮きがあった（浮き値を入力→半額・小数切捨てをαに加算）" : "浮きなし＝加算しない",
                style: { padding: "2px 8px", fontSize: 12, fontWeight: on ? 800 : 600, border: on ? ("2px solid " + kv[3]) : "1px solid #ddd", background: on ? kv[4] : "#fff", color: on ? kv[3] : "#999", borderRadius: 5, cursor: "pointer", lineHeight: 1.3 } },
                kv[1], React.createElement("span", { style: { fontSize: 9, marginLeft: 2, fontWeight: 600 } }, kv[2]));
            })
          ),
          _ukiOn ? React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #86EFAC", borderRadius: 4, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", min: "0", max: "999", step: "1",
              value: fUkiVal,
              onChange: function(e) { _setUV(e.target.value); },
              placeholder: "浮き値",
              style: { padding: "3px 6px", fontSize: 13, fontWeight: 800, color: "#14532D", border: "none", outline: "none", background: "#fff", width: 56, textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(function() { _stepUV(1); }, function() { _stepUV(-1); })
          ) : null,
          _ukiOn ? React.createElement("span", { style: { fontSize: 12, color: "#64748B" } }, "円") : null,
          _ukiOn ? React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#15803D", whiteSpace: "nowrap" } }, "→ ＋" + _fUkiAdd + "円を加算") : null,
          _ukiOn ? React.createElement("span", { style: { fontSize: 10, color: "#94A3B8", whiteSpace: "nowrap" } }, "（半額・小数切捨て）") : null
        );
      })()) : null,
      React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 } },
      (function() {
        var _setAA = function(val) { var _v = _toHankakuNum(val); if (_v === "") { setFAddAlpha(""); return; } var n = Number(_v); if (isNaN(n)) return; if (n > 50) n = 50; if (n < 0) n = 0; setFAddAlpha(String(n)); };
        var _stepAA = function(delta) { setFAddAlpha(function(prev) { var base = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : 0; var n = base + delta; if (n > 50) n = 50; if (n < 0) n = 0; return String(n); }); };
        var _addOn = fAddAlphaUsed === "○";
        return React.createElement("div", {
          style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: 12 }
        },
          React.createElement("span", { style: { color: "#555", fontWeight: 600 } }, "追加α値"),
          React.createElement("div", { style: { display: "inline-flex", gap: 4 } },
            [["○", "○", "要", "#C0392B", "#FCEBEB"], ["×", "×", "不要", "#1E8449", "#EAF3DE"], ["未選択", "未", "未定", "#64748B", "#F1F5F9"]].map(function(kv) {
              var on = fAddAlphaUsed === kv[0];
              return React.createElement("button", { key: kv[0], type: "button",
                onClick: function() { setFAddAlphaUsed(kv[0]); if (kv[0] === "○" && fAddAlpha === "") setFAddAlpha("5"); },
                title: kv[0] === "○" ? "追加αが必要だった（数値を入力）" : kv[0] === "×" ? "追加αは不要＝基本αのみ（基本αの推奨母数に算入）" : "未判断＝基本αのみとして基本αの推奨母数には算入（推奨追加αの母数からのみ除外）",
                style: { padding: "2px 8px", fontSize: 12, fontWeight: on ? 800 : 600, border: on ? ("2px solid " + kv[3]) : "1px solid #ddd", background: on ? kv[4] : "#fff", color: on ? kv[3] : "#999", borderRadius: 5, cursor: "pointer", lineHeight: 1.3 } },
                kv[1], React.createElement("span", { style: { fontSize: 9, marginLeft: 2, fontWeight: 600 } }, kv[2]));
            })
          ),
          _addOn ? React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #FDE68A", borderRadius: 4, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", min: "0", max: "50", step: "1",
              value: fAddAlpha,
              onChange: function(e) { _setAA(e.target.value); },
              placeholder: "0",
              style: { padding: "3px 6px", fontSize: 13, fontWeight: 800, color: "#92400E", border: "none", outline: "none", background: "#fff", width: 56, textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(function() { _stepAA(1); }, function() { _stepAA(-1); })
          ) : null,
          _addOn ? React.createElement("span", { style: { fontSize: 12, color: "#64748B" } }, "円") : null
        );
      })(),
        (function() {
          if (fAddAlphaUsed !== "○") return null;
          // 推奨追加αも段階フォールバック（詳細別→シグナル別→銘柄全体・_refAddAlphaSrc）＝どの段の値かを添えて表示（表示のみ・自動入力なし）2026-07-07c。
          if (_refAddAlphaSrc) return React.createElement("span", { title: "追加αが必要だった記録だけを母数に算出した推奨追加α（詳細別→シグナル別→銘柄全体の順でデータのある段の値・括弧が採用段）", style: { fontSize: 11, fontWeight: 600, color: "#9A3412", whiteSpace: "nowrap" } }, "推奨追加α：", React.createElement("span", { style: { fontWeight: 800 } }, "+" + _refAddAlphaSrc.add.add + "円"), (_refAddAlphaSrc.add.add2 != null ? React.createElement("span", { style: { fontWeight: 800, marginLeft: 4 } }, "（次点：+" + _refAddAlphaSrc.add.add2 + "円）") : null), React.createElement("span", { style: { color: "#94A3B8", fontSize: 9, fontWeight: 600, marginLeft: 2 } }, "（" + _refAddAlphaSrc.src + (_refAddAlphaSrc.add.scN != null ? "・n=" + _refAddAlphaSrc.add.scN : "") + "）"));
          return fStock ? React.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "#94A3B8" } }, "推奨追加α：データ無し") : null;
        })()),
      (fAddAlphaUsed === "○") ? (function() {
        var _reasonsM = (data && data.custom && Array.isArray(data.custom.addAlphaReasons)) ? data.custom.addAlphaReasons : _DEF_ADD_REASONS;
        var _reasons = (fRsnOrder && fRsnOrder.list) ? fRsnOrder.list : _reasonsM;   // ドラッグ中は並びプレビュー（2026-07-06e）
        var _addR = function(nm) {
          nm = (nm || "").trim(); if (!nm) return;
          save(function(prev) {
            var cur = (prev.custom && Array.isArray(prev.custom.addAlphaReasons)) ? prev.custom.addAlphaReasons : _DEF_ADD_REASONS.slice();
            if (cur.indexOf(nm) >= 0) return prev;
            return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { addAlphaReasons: cur.concat([nm]) }) });
          });
        };
        var _delR = function(nm) {
          save(function(prev) {
            var cur = (prev.custom && Array.isArray(prev.custom.addAlphaReasons)) ? prev.custom.addAlphaReasons : _DEF_ADD_REASONS.slice();
            return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { addAlphaReasons: cur.filter(function(x) { return x !== nm; }) }) });
          });
          if (fAddReasons.indexOf(nm) >= 0) setFAddReasons(fAddReasons.filter(function(x) { return x !== nm; }));
        };
        // 根拠選択肢の改名: マスター(addAlphaReasons)の名前を変更し、過去記録(全charts.signalsのaddAlphaReasons[]・旧addAlphaReason文字列)も一括追従。2026-06-23。
        var _renameR = function(oldNm, newNm) {
          newNm = (newNm || "").trim();
          if (!newNm || newNm === oldNm) return;
          save(function(prev) {
            var cur = (prev.custom && Array.isArray(prev.custom.addAlphaReasons)) ? prev.custom.addAlphaReasons : _DEF_ADD_REASONS.slice();
            // 既存名への改名も「統合」(dedupe) 2026-07-07g（旧: 同名ありは何もしない）
            var _rnM = cur.map(function(x) { return x === oldNm ? newNm : x; });
            var newMaster = _rnM.filter(function(x, i) { return x && _rnM.indexOf(x) === i; });
            var charts = prev.charts || {}, newCharts = {};
            Object.keys(charts).forEach(function(ck) {
              var c = charts[ck];
              if (!c || !Array.isArray(c.signals)) { newCharts[ck] = c; return; }
              var changed = false;
              var sigs = c.signals.map(function(s) {
                if (!s) return s;
                var ns = s, hit = false;
                if (Array.isArray(s.addAlphaReasons) && s.addAlphaReasons.indexOf(oldNm) >= 0) {
                  var _rl = s.addAlphaReasons.map(function(x) { return x === oldNm ? newNm : x; });
                  ns = Object.assign({}, ns, { addAlphaReasons: _rl.filter(function(x, i) { return x && _rl.indexOf(x) === i; }) }); hit = true;
                }
                if (s.addAlphaReason === oldNm) { ns = Object.assign({}, ns, { addAlphaReason: newNm }); hit = true; }
                if (hit) changed = true;
                return ns;
              });
              newCharts[ck] = changed ? Object.assign({}, c, { signals: sigs }) : c;
            });
            return Object.assign({}, prev, {
              custom: Object.assign({}, prev.custom || {}, { addAlphaReasons: newMaster }),
              charts: newCharts
            });
          });
          if (fAddReasons.indexOf(oldNm) >= 0) setFAddReasons(fAddReasons.map(function(x) { return x === oldNm ? newNm : x; }));
        };
        var _optBtn = function(label, sel, onClick, color) {
          return React.createElement("button", { type: "button", onClick: onClick,
            style: { padding: "3px 9px", fontSize: 11, fontWeight: sel ? 800 : 600, border: sel ? ("2px solid " + color) : "1px solid #ddd", background: sel ? "#FFF7ED" : "#fff", color: sel ? color : "#666", borderRadius: 5, cursor: "pointer", lineHeight: 1.3 } }, label);
        };
        return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, padding: "2px 0 0 2px" } },
          React.createElement("div", { style: { fontSize: 10, color: "#888", fontWeight: 600 } }, "根拠（追加αが必要だった理由・複数選択可）"),
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 } },
            _reasons.map(function(rsn) {
              var on = fAddReasons.indexOf(rsn) >= 0;
              var _rDragSt = _rsnDragRef.current;
              var _rDragging = !!(_rDragSt && _rDragSt.started && _rDragSt.name === rsn);
              return React.createElement("span", { key: rsn, "data-rsn": rsn,
                onPointerDown: function(e) {
                  // setPointerCaptureはドラッグ開始時（下のpointermove）まで呼ばない＝タップ時にclickがretargetされ内側buttonのonClick（選択）が発火しない不具合の回避 2026-07-06g。
                  _rsnDragRef.current = { name: rsn, sx: e.clientX, sy: e.clientY, started: false, list: null };
                },
                onPointerMove: function(e) {
                  var d = _rsnDragRef.current;
                  if (!d || d.name !== rsn) return;
                  if (!d.started) {
                    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 7) return;
                    d.started = true;
                    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_e0) {}
                    d.list = _reasonsM.slice();
                    _rsnMovedRef.current = true;
                    setFRsnOrder({ list: d.list.slice() });
                    return;
                  }
                  var el = document.elementFromPoint(e.clientX, e.clientY);
                  var chip = (el && el.closest) ? el.closest("[data-rsn]") : null;
                  if (!chip) return;
                  var over = chip.getAttribute("data-rsn");
                  if (!over || over === d.name) return;
                  var lst = d.list.slice();
                  var fi = lst.indexOf(d.name), ti = lst.indexOf(over);
                  if (fi < 0 || ti < 0 || fi === ti) return;
                  lst.splice(fi, 1); lst.splice(ti, 0, d.name);
                  d.list = lst;
                  setFRsnOrder({ list: lst.slice() });
                },
                onPointerUp: function() {
                  var d = _rsnDragRef.current;
                  _rsnDragRef.current = null;
                  if (d && d.started && d.list) {
                    var _fin = d.list.slice();
                    save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { addAlphaReasons: _fin }) }); });
                    setTimeout(function() { _rsnMovedRef.current = false; }, 0);
                  }
                  setFRsnOrder(null);
                },
                onPointerCancel: function() { _rsnDragRef.current = null; _rsnMovedRef.current = false; setFRsnOrder(null); },
                style: { display: "inline-flex", alignItems: "center", gap: 1, touchAction: "none",
                  boxShadow: _rDragging ? "0 2px 8px rgba(0,0,0,0.3)" : null,
                  transform: _rDragging ? "scale(1.06)" : null,
                  opacity: _rDragging ? 0.9 : null } },
                _optBtn(rsn, on, function() { if (_rsnMovedRef.current) { _rsnMovedRef.current = false; return; } setFAddReasons(on ? fAddReasons.filter(function(x) { return x !== rsn; }) : fAddReasons.concat([rsn])); }, "#9A3412"),
                fReasonMgr ? React.createElement(React.Fragment, null,
                  React.createElement("button", { type: "button", title: "この選択肢の名前を変更（過去の記録の根拠名も一括変更）", onClick: function() { if (_rsnMovedRef.current) { _rsnMovedRef.current = false; return; } _rsnValRef.current = rsn; setFRsnInput({ old: rsn, val: rsn }); }, style: { padding: "1px 5px", fontSize: 11, fontWeight: 800, border: "1px solid #93C5FD", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, cursor: "pointer" } }, "✎"),
                  React.createElement("button", { type: "button", title: "この選択肢を削除", onClick: function() { if (_rsnMovedRef.current) { _rsnMovedRef.current = false; return; } setFRsnInput(null); _delR(rsn); }, style: { padding: "1px 5px", fontSize: 11, fontWeight: 800, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", borderRadius: 4, cursor: "pointer" } }, "×")
                ) : null);
            }),
            _optBtn("その他", fOtherOn, function() { setFOtherOn(!fOtherOn); }, "#0369A1"),
            (function() {
              var _rAddOpen = !!(fRsnInput && fRsnInput.old == null);
              return React.createElement("button", { type: "button", title: "根拠の選択肢を追加（その場で入力）", onClick: function() {
                if (_rAddOpen) { setFRsnInput(null); return; }
                _rsnValRef.current = "";
                setFRsnInput({ val: "" });
              }, style: { padding: "3px 8px", fontSize: 11, fontWeight: 700, border: _rAddOpen ? "1px solid #0369A1" : "1px solid #ddd", background: _rAddOpen ? "#EFF6FF" : "#fff", color: "#0369A1", borderRadius: 5, cursor: "pointer" } }, _rAddOpen ? "✕ 閉じる" : "＋ 追加");
            })(),
            React.createElement("button", { type: "button", title: "選択肢の名前変更・削除モード（✎で改名・×で削除）", onClick: function() { setFReasonMgr(!fReasonMgr); setFRsnInput(null); }, style: { padding: "3px 8px", fontSize: 11, fontWeight: 700, border: "1px solid " + (fReasonMgr ? "#B91C1C" : "#ddd"), background: fReasonMgr ? "#FEF2F2" : "#fff", color: fReasonMgr ? "#B91C1C" : "#888", borderRadius: 5, cursor: "pointer" } }, fReasonMgr ? "完了" : "✎ 編集")
          ),
          fRsnInput ? React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 2, alignItems: "center", flexWrap: "wrap" } },
            // 根拠のインライン追加/改名（2026-07-06e）: window.prompt廃止＝iPad standalone対応。改名は_renameRで過去記録の根拠名も一括追従（従来どおり）。
            fRsnInput.old != null ? React.createElement("span", { style: { fontSize: 10, color: "#1D4ED8", fontWeight: 700, whiteSpace: "nowrap" } }, "『" + fRsnInput.old + "』を改名:") : null,
            React.createElement(FastInput, {
              type: "text",
              value: fRsnInput.val || "",
              onChange: function(v) { _rsnValRef.current = v; setFRsnInput(function(p) { return p ? Object.assign({}, p, { val: v }) : p; }); },
              placeholder: fRsnInput.old != null ? "新しい名前" : "新しい根拠の選択肢",
              style: { flex: 1, minWidth: 120, padding: "6px 9px", fontSize: 12, border: "1px solid #93C5FD", borderRadius: 6, background: "#fff", boxSizing: "border-box" }
            }),
            React.createElement("button", { type: "button", onClick: function() {
              _fiFlushAll();
              var _nm = (_rsnValRef.current || "").trim();
              if (!_nm) return;
              if (fRsnInput.old != null) _renameR(fRsnInput.old, _nm); else _addR(_nm);
              _rsnValRef.current = "";
              setFRsnInput(null);
            }, style: { padding: "6px 14px", fontSize: 12, fontWeight: 700, background: "#0369A1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" } }, fRsnInput.old != null ? "変更" : "追加"),
            React.createElement("button", { type: "button", onClick: function() { _rsnValRef.current = ""; setFRsnInput(null); }, style: { padding: "6px 10px", fontSize: 12, fontWeight: 700, background: "#fff", color: "#888", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" } }, "✕")
          ) : null,
          fOtherOn ? React.createElement(FastInput, { value: fAddReasonOther, onChange: function(v) { setFAddReasonOther(v); }, placeholder: "その他の理由を入力（複数は / で区切り）", style: { padding: "4px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 5, outline: "none", width: "100%", maxWidth: 280, boxSizing: "border-box" } }) : null
        );
      })() : null,
      (function() {
        // RNまたぎ加算α値の行（全シグナル・追加α（根拠含む）行の下）2026-07-08h。〇×→〇で加算値（円・そのまま）をαに加算。すぐ横に暫定EP（水準線値＋合計α）を小さく表示＝EPを見て要否判断。
        var _setRV = function(val) { var _v = _toHankakuNum(val); if (_v === "") { setFRnVal(""); return; } var n = Number(_v); if (isNaN(n)) return; if (n > 50) n = 50; if (n < 0) n = 0; setFRnVal(String(n)); };
        var _stepRV = function(delta) { setFRnVal(function(prev) { var base = (prev !== "" && !isNaN(Number(prev))) ? Number(prev) : 0; var n = base + delta; if (n > 50) n = 50; if (n < 0) n = 0; return String(n); }); };
        var _rnOn = fRnUsed === "○";
        var _rnAddShown = (fRnVal !== "" && !isNaN(Number(fRnVal))) ? Number(fRnVal) : 0;
        var _epPrev = (function() { var _lv = parseFloat(fLevelPrice); if (fLevelPrice === "" || isNaN(_lv)) return null; return Math.round((_lv + (isNaN(_fAlpha) ? 0 : _fAlpha)) * 100) / 100; })();
        return React.createElement("div", {
          style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: "#EFF6FF", border: "1px solid #BFDBFE", fontSize: 12, flexWrap: "wrap" }
        },
          React.createElement("span", { style: { color: "#555", fontWeight: 600 } }, "RNまたぎ加算"),
          React.createElement("div", { style: { display: "inline-flex", gap: 4 } },
            [["○", "○", "要", "#C0392B", "#FCEBEB"], ["×", "×", "不要", "#1E8449", "#EAF3DE"]].map(function(kv) {
              var on = fRnUsed === kv[0];
              return React.createElement("button", { key: kv[0], type: "button",
                onClick: function() { setFRnUsed(kv[0]); if (kv[0] === "○" && fRnVal === "") setFRnVal("5"); },
                title: kv[0] === "○" ? "ラウンドナンバー（キリ番）をまたぐ＝入力値をそのままαに加算" : "RNまたぎなし＝加算しない",
                style: { padding: "2px 8px", fontSize: 12, fontWeight: on ? 800 : 600, border: on ? ("2px solid " + kv[3]) : "1px solid #ddd", background: on ? kv[4] : "#fff", color: on ? kv[3] : "#999", borderRadius: 5, cursor: "pointer", lineHeight: 1.3 } },
                kv[1], React.createElement("span", { style: { fontSize: 9, marginLeft: 2, fontWeight: 600 } }, kv[2]));
            })
          ),
          _rnOn ? React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #BFDBFE", borderRadius: 4, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", min: "0", max: "50", step: "1",
              value: fRnVal,
              onChange: function(e) { _setRV(e.target.value); },
              placeholder: "5",
              style: { padding: "3px 6px", fontSize: 13, fontWeight: 800, color: "#1D4ED8", border: "none", outline: "none", background: "#fff", width: 56, textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(function() { _stepRV(1); }, function() { _stepRV(-1); })
          ) : null,
          _rnOn ? React.createElement("span", { style: { fontSize: 12, color: "#64748B" } }, "円") : null,
          _rnOn ? React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#1D4ED8", whiteSpace: "nowrap" } }, "→ ＋" + _rnAddShown + "円を加算") : null,
          React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 4, padding: "1px 7px", borderRadius: 6, background: "#DBEAFE", border: "1px solid #93C5FD", whiteSpace: "nowrap" } },
            React.createElement("span", { style: { fontSize: 9.5, color: "#1D4ED8", fontWeight: 700 } }, "暫定EP"),
            React.createElement("span", { title: "水準線値＋合計α値（RNまたぎ加算を含む）＝この設定でのエントリー予定価格の目安。EPを見てRNまたぎ加算の要否を判断（下の予定EP欄と同じ値）。", style: { fontSize: 12, fontWeight: 800, color: "#1E3A8A", fontVariantNumeric: "tabular-nums" } }, _epPrev != null ? String(_epPrev) : "—"),
            React.createElement("span", { style: { fontSize: 9.5, color: "#93C5FD" } }, "円"))
        );
      })(),
      (function() {
        // 合計α値バー（案B 2026-07-03）: 3要素の内訳（基本＋浮き足＋追加）を常設表示。浮き足欄が出ないシグナルでは基本＋追加の2要素。値は_fBaseA/_fUkiAdd/_fAddA＝採用α計算(_fAlpha)と同一。
        return React.createElement("div", {
          style: { display: "inline-flex", alignItems: "baseline", gap: 6, padding: "5px 12px", borderRadius: 6, background: "#F8FAFC", border: "1px solid #CBD5E1", fontSize: 12, flexWrap: "wrap" }
        },
          React.createElement("span", { style: { color: "#334155", fontWeight: 700 } }, "合計α値"),
          React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: "#0F172A", lineHeight: 1 } }, _fAlpha),
          React.createElement("span", { style: { fontSize: 11, color: "#64748B" } }, "円"),
          React.createElement("span", { style: { fontSize: 11, color: "#64748B" } }, "＝ 基本 ",
            React.createElement("span", { style: { color: "#0369A1", fontWeight: 700 } }, _fBaseA),
            _showUki ? React.createElement("span", null, " ＋ 浮き足 ", React.createElement("span", { style: { color: "#15803D", fontWeight: 700 } }, _fUkiAdd)) : null,
            " ＋ 追加 ",
            React.createElement("span", { style: { color: "#92400E", fontWeight: 700 } }, _fAddA),
            _fRnAdd > 0 ? React.createElement("span", null, " ＋ RN ", React.createElement("span", { style: { color: "#1D4ED8", fontWeight: 700 } }, _fRnAdd)) : null)
        );
      })(),
      React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 } },
      (function() {
        var _ckC = fStock + "_" + fDate;
        var _cdC = data.charts && data.charts[_ckC];
        var _cv = _cdC && _cdC.cutLine != null ? _cdC.cutLine : 10;
        var _saveCut = function(val) {
          var _v = _toHankakuNum(val);
          var n = _v !== "" ? Number(_v) : null;
          if (n != null && !isNaN(n)) { if (n < 1) n = 1; if (n > 30) n = 30; }
          save(function(prev) {
            var _pCharts = prev.charts || {};
            var _nc = Object.assign({}, _pCharts);
            var _entry = Object.assign({}, _nc[_ckC] || {});
            if (n != null && !isNaN(n)) _entry.cutLine = n;
            else delete _entry.cutLine;
            _nc[_ckC] = _entry;
            return Object.assign({}, prev, { charts: _nc });
          });
        };
        return React.createElement("div", {
          style: { display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 6, background: "#FEF2F2",
            border: "1px solid #FECACA", fontSize: 12 }
        },
          React.createElement("span", { style: { color: "#555", fontWeight: 600 } }, "損切り値"),
          React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #FECACA", borderRadius: 4, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", min: "1", max: "30", step: "1",
              value: _cv != null ? String(_cv) : "10",
              onChange: function(e) { _saveCut(e.target.value); },
              placeholder: "10",
              style: { padding: "3px 6px", fontSize: 13, fontWeight: 800, color: "#7F1D1D",
                       border: "none", outline: "none", background: "#fff", width: 64,
                       textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(
              function() { save(function(prev) { var _pC = Object.assign({}, (prev && prev.charts) || {}); var _ent = Object.assign({}, _pC[_ckC] || {}); var _n = _ent.cutLine != null ? _ent.cutLine : 10; if (_n >= 30) return prev; _ent.cutLine = _n + 1; _pC[_ckC] = _ent; return Object.assign({}, prev, { charts: _pC }); }); },
              function() { save(function(prev) { var _pC = Object.assign({}, (prev && prev.charts) || {}); var _ent = Object.assign({}, _pC[_ckC] || {}); var _n = _ent.cutLine != null ? _ent.cutLine : 10; if (_n <= 1) return prev; _ent.cutLine = _n - 1; _pC[_ckC] = _ent; return Object.assign({}, prev, { charts: _pC }); }); }
            )
          ),
          React.createElement("span", { style: { fontSize: 12, color: "#64748B" } }, "円")
        );
      })(),
        (function() {
          if (!_refCutPick) return null;
          var p = _refCutPick;
          return React.createElement("span", { title: "実現H1損益をほぼ維持できる範囲で最小（タイト）の損切り値（この銘柄の前日までの算入記録から）", style: { fontSize: 11, fontWeight: 600, color: "#7F1D1D", whiteSpace: "nowrap" } },
            "推奨損切り：", React.createElement("span", { style: { fontWeight: 800 } }, p.cut + "円"),
            p.status === "na"
              ? React.createElement("span", { style: { color: "#B45309", marginLeft: 3, fontSize: 10 } }, "（参考）")
              : React.createElement("span", { style: { color: "#94A3B8", marginLeft: 3, fontSize: 10 } }, "（H1平均" + (p.mean != null ? (p.mean >= 0 ? "+" : "") + Math.round(p.mean) : "—") + "円・損切" + (p.stopRate != null ? Math.round(p.stopRate * 100) : "—") + "%・" + (p.n || 0) + "件）"));
        })())
      ),
      React.createElement("div", { style: { marginBottom: 8 } },
        React.createElement("div", { style: { fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 4 } }, "αメモ"),
        React.createElement(FastInput, { multiline: true, autoResize: true, value: fAlphaMemo, onChange: function(v) { setFAlphaMemo(v); }, placeholder: "", rows: 2, style: Object.assign({}, I, { fontFamily: "inherit", resize: "none", overflow: "hidden", minHeight: 44 }) })
      ),

      isV2Form ? (function() {
        var _ef = _epFormState || {};
        // △確信度エントリー（EP足より“前”の足に△の到達期待）→ H1期待度○は不可（EP自体が（）外0・参考）。
        // EP=OS2(epIdx1)→OS1△ / EP=OS3(epIdx2)→OS1△orOS2△。OS1がEP(epIdx0)は無条件○。
        var _epTriForm = (_ef.epIdx === 1 && fOs1Exp === "△") || (_ef.epIdx === 2 && (fOs1Exp === "△" || fOs2Exp === "△"));
        var _expB = function(cur, setFn, disabled, disabledOpts) {
          return React.createElement("div", { style: { display: "flex", gap: 3 } },
            [["○", "#C0392B", "#FCEBEB"], ["△", "#B45309", "#FEF3C7"], ["×", "#1E8449", "#EAF3DE"]].map(function(kv) {
              var on = cur === kv[0];
              var bd = !!disabled || (disabledOpts && disabledOpts.indexOf(kv[0]) >= 0);  // 全無効(前段×) or 選択肢別無効(H1=△→H2の○のみ不可)
              return React.createElement("button", { key: kv[0],
                onClick: bd ? null : function() { setFn(on ? null : kv[0]); },
                disabled: !!bd,
                title: bd ? (disabled ? "前段で×（撤退・見送り）のため、ここも自動的に×になります" : "上位段が△のため○は選べません（自動的に△になります）") : null,
                style: { padding: "2px 9px", fontSize: 12, fontWeight: 700, borderRadius: 5, cursor: bd ? "not-allowed" : "pointer",
                  border: "1.5px solid " + (on ? kv[1] : "#ddd"), background: on ? kv[2] : "#fff", color: on ? kv[1] : "#999", opacity: (bd && !on) ? 0.35 : 1 } }, kv[0]);
            }));
        };
        // 次足期待度スロット（足固定 i=0..3=OS1..OS4・常時表示・ラベル統一）2026-07-06: その足の引けで「次の足へ継続するか」（待ち足=α待ち続行/EP以降=保有継続）。
        // lock=前段×（EP境界は跨がない＝×見送りでもH判断を参考記録できる）・○不可=EP足スロットで△確信度/EP以降で前段△。値は足に固定＝EP（α）が動いても残る。
        var _nxRow = function(i) {
          var _ei = _ef.epIdx;
          var lock = i > 0 && i !== _ei && fNxs[i - 1] === "×";
          var noMaru = (_ei >= 0 && i === _ei && _epTriForm) || (_ei >= 0 && i > _ei && fNxs[i - 1] === "△");
          return _row("次足期待度", _expB(fNxs[i], function(v) { _setNx(i, v); }, lock, noMaru ? ["○"] : null), true);
        };
        var _numIn = function(val, setVal) {
          return React.createElement("input", { type: "text", inputMode: "numeric",
            value: val, onChange: function(e) { setVal(_toHankakuNum(e.target.value)); }, placeholder: "0",
            style: { padding: "4px 4px", border: "none", outline: "none", background: "#fff", width: 40, textAlign: "right", fontSize: 13, boxSizing: "border-box" } });
        };
        var _signB = function(sign, setSign) {
          // Hold1高値欄と同方式の3状態サイクル（OS系規約: "+"=↑正・"-"=↓負）。手入力0でも↕に強制しない。
          var lab = sign === "-" ? "↓" : sign === "+" ? "↑" : "↕";
          var col = sign === "+" ? "#C0392B" : sign === "-" ? "#1E8449" : "#999";
          return React.createElement("button", {
            onClick: function() { setSign(sign === "+" ? "-" : sign === "-" ? null : "+"); },
            style: { padding: "4px 6px", fontSize: 13, fontWeight: sign ? 700 : 400, border: "none", borderRight: "1px solid #ccc", background: sign === "+" ? "#FCEBEB" : sign === "-" ? "#EAF3DE" : "#f5f4f0", color: col, cursor: "pointer", minWidth: 30, flexShrink: 0 }
          }, lab);
        };
        // 符号付き入力（Hold1高値方式）: [↑↓↕][数値][▲▼=_applySignedで符号跨ぎ増減]
        var _sIn = function(val, setVal, sign, setSign, ref) {
          return React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
            _signB(sign, setSign), _numIn(val, setVal),
            _stepBtn(function() { _applySigned(ref, 1, "+", "-", setVal, setSign); },
                     function() { _applySigned(ref, -1, "+", "-", setVal, setSign); }));
        };
        // OS4/OS5（hold*/hold2*フィールド）用: hold系符号規約（"-"=↑正・"+"=↓負）の符号ボタン＋符号付き入力
        var _signBH = function(sign, setSign) {
          var lab = sign === "-" ? "↑" : sign === "+" ? "↓" : "↕";
          var col = sign === "-" ? "#C0392B" : sign === "+" ? "#1E8449" : "#999";
          return React.createElement("button", {
            onClick: function() { setSign(sign === "-" ? "+" : sign === "+" ? null : "-"); },
            style: { padding: "4px 6px", fontSize: 13, fontWeight: sign ? 700 : 400, border: "none", borderRight: "1px solid #ccc", background: sign === "-" ? "#FCEBEB" : sign === "+" ? "#EAF3DE" : "#f5f4f0", color: col, cursor: "pointer", minWidth: 30, flexShrink: 0 }
          }, lab);
        };
        var _sInH = function(val, setVal, sign, setSign, ref, after) {
          return React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
            _signBH(sign, setSign), _numIn(val, setVal),
            _stepBtn(function() { _applySigned(ref, 1, "-", "+", setVal, setSign, after); },
                     function() { _applySigned(ref, -1, "-", "+", setVal, setSign, after); }));
        };
        // OS1高値（常に↑・0以上）。長押し連続増減のため最新値は関数アップデータで読む（OS2高値の_applySigned同様）。
        var _uIn = function(val, setVal) {
          return React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 5, overflow: "hidden" } },
            _numIn(val, setVal),
            _stepBtn(function() { setVal(function(v) { return String((Number(v) || 0) + 1); }); },
                     function() { setVal(function(v) { return String(Math.max(0, (Number(v) || 0) - 1)); }); }));
        };
        var _row = function(lab, node, noUnit) {
          return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } },
            React.createElement("span", { style: { fontSize: 10, color: "#666", fontWeight: 600, width: 40, flexShrink: 0 } }, lab), node,
            noUnit ? null : React.createElement("span", { style: { fontSize: 10, color: "#999" } }, "円"));
        };
        // role: "EP"(青枠)/"H1"/"H2"(グレーチップ)/null。役割は現在の採用αからライブ導出（_fRoleOf）。
        var _legCol = function(label, role, rows) {
          var isEp = role === "EP";
          return React.createElement("div", { key: label, style: { display: "flex", flexDirection: "column", gap: 4, padding: "6px 8px", border: "1px solid " + (isEp ? "#0369A1" : "#eee"), borderRadius: 6, background: isEp ? "#F0F9FF" : "#fff" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } },
              React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#9A3412" } }, label),
              role ? React.createElement("span", { style: { fontSize: 9, fontWeight: 800, color: "#fff", background: isEp ? "#0369A1" : "#64748B", padding: "1px 5px", borderRadius: 4 } }, role) : null),
            rows);
        };
        var _eChip = (function() {
          var j = _ef.judge;
          if (j === "ok") return React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#C0392B", background: "#FCEBEB", border: "1px solid #C0392B", borderRadius: 5, padding: "2px 8px" } }, "E：○（EP=OS" + (_ef.epIdx + 1) + "）");
          if (j === "x") return React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 5, padding: "2px 8px" } }, "E：×　∵α値到達期待度×");
          if (j === "miss") return React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#7C3AED", background: "#F5F3FF", border: "1px solid #7C3AED", borderRadius: 5, padding: "2px 8px" } }, "E：未達（3本以内にα値到達なし）");
          return React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#999", background: "#f5f4f0", borderRadius: 5, padding: "2px 8px" } }, "E：判定待ち");
        })();
        var _epPnlChip = (function() {
          if (_ef.judge !== "ok" || _ef.epHigh == null || _ef.alpha == null) return null;
          var _cl = _fCutLine != null ? _fCutLine : 10;
          var _df = _ef.epHigh - _ef.alpha;
          var _pnl = _df >= _cl ? -Math.round(_df * 100) : (_ef.epConf != null ? Math.round((_ef.alpha - _ef.epConf) * 100) : null);
          if (_pnl == null) return null;
          return React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: _pnl > 0 ? "#C0392B" : _pnl < 0 ? "#1E8449" : "#888" } },
            "EP損益 " + (_pnl > 0 ? "+" : "") + _pnl.toLocaleString() + "円" + (_df >= _cl ? "（損切り）" : ""));
        })();
        return React.createElement(React.Fragment, null,
          React.createElement("div", { style: Object.assign({}, SH_, { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }) },
            "OS",
            React.createElement("div", {
              style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 6, background: "#F1F5F9", border: "1px solid #CBD5E1", fontSize: 11, fontWeight: 400, textTransform: "none", letterSpacing: 0 }
            },
              React.createElement("span", { style: { color: "#64748B", fontWeight: 700 } }, "水準線値"),
              React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #CBD5E1", borderRadius: 4, overflow: "hidden" } },
                React.createElement("input", {
                  type: "text", inputMode: "decimal", step: "1", min: "0",
                  value: fLevelPrice,
                  onChange: function(e) { setFLevelPrice(_toHankakuDecimal(e.target.value)); },
                  placeholder: "—",
                  style: { padding: "2px 5px", fontSize: 12, fontWeight: 700, color: "#334155", border: "none", outline: "none", background: "#fff", width: 70, textAlign: "right", boxSizing: "border-box" }
                }),
                _stepBtn(
                  function() { setFLevelPrice(function(v) { return String((parseFloat(v) || 0) + 1); }); },
                  function() { setFLevelPrice(function(v) { return String(Math.max(0, (parseFloat(v) || 0) - 1)); }); }
                )
              ),
              React.createElement("span", { style: { fontSize: 11, color: "#94A3B8" } }, "円")
            ),
            React.createElement("div", {
              style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 6, background: "#EFF6FF", border: "1px solid #BFDBFE", fontSize: 11, fontWeight: 400, textTransform: "none", letterSpacing: 0 }
            },
              React.createElement("span", { style: { color: "#1D4ED8", fontWeight: 700 } }, "予定EP"),
              React.createElement("span", { title: "水準線値＋合計α値（基本α＋浮き足加算＋追加α）＝自動計算。エントリー予定価格の目安。", style: { fontSize: 12, fontWeight: 800, color: "#1E3A8A", fontVariantNumeric: "tabular-nums", minWidth: 36, textAlign: "right" } },
                (function() { var _lv = parseFloat(fLevelPrice); if (fLevelPrice === "" || isNaN(_lv)) return "—"; var _ep = _lv + (isNaN(_fAlpha) ? 0 : _fAlpha); return String(Math.round(_ep * 100) / 100); })()
              ),
              React.createElement("span", { style: { fontSize: 11, color: "#94A3B8" } }, "円"),
              React.createElement("span", { style: { fontSize: 9, color: "#93C5FD", fontWeight: 700 } }, "自動")
            )
          ),
          React.createElement("div", { style: { fontSize: 10, color: "#64748B", fontWeight: 600, margin: "0 0 6px 2px", lineHeight: 1.4 } }, "※5分足の場合、EPまでは5分足基準、EPからは1分足基準"),
          React.createElement("div", { style: { marginTop: 0, marginBottom: 8, padding: "8px 10px", border: "1px solid #FDBA74", borderRadius: 8, background: "#FFFBF5" } },
          React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "stretch", overflowX: "auto" } },
            _legCol("OS1", _fRoleOf(0), [
              _row("高値", _uIn(fOsVal, setFOsVal)),
              _row("確定値", _sIn(fOsConfVal, setFOsConfVal, fOsConfSign, setFOsConfSign, _oscSignedRef)),
              _nxRow(0)
            ]),
            _legCol("OS2", _fRoleOf(1), [
              _row("高値", _sIn(fOs2High, setFOs2High, fOs2HighSign, setFOs2HighSign, _os2hSignedRef)),
              _row("確定値", _sIn(fOs2Conf, setFOs2Conf, fOs2ConfSign, setFOs2ConfSign, _os2cSignedRef)),
              _nxRow(1)
            ]),
            _legCol("OS3", _fRoleOf(2), [
              _row("高値", _sIn(fOs3High, setFOs3High, fOs3HighSign, setFOs3HighSign, _os3hSignedRef)),
              _row("確定値", _sIn(fOs3Conf, setFOs3Conf, fOs3ConfSign, setFOs3ConfSign, _os3cSignedRef)),
              _nxRow(2)
            ])
          ),
          React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "stretch", overflowX: "auto", marginTop: 6 } },
            _legCol("OS4", _fRoleOf(3), [
              _row("高値", _sInH(fHoldHighVal, setFHoldHighVal, fHoldHighSign, setFHoldHighSign, _hhSignedRef)),
              _row("確定値", _sInH(fHoldWidthVal, setFHoldWidthVal, fHoldWidthSign, setFHoldWidthSign, _hwSignedRef, _hwAfter)),
              _nxRow(3)
            ]),
            _legCol("OS5", _fRoleOf(4), [
              _row("高値", _sInH(fHold2HighVal, setFHold2HighVal, fHold2HighSign, setFHold2HighSign, _h2hSignedRef)),
              _row("確定値", _sInH(fHold2WidthVal, setFHold2WidthVal, fHold2WidthSign, setFHold2WidthSign, _h2wSignedRef, _h2wAfter))
            ])
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" } }, _eChip, _epPnlChip,
            _ef.judge === "miss" ? React.createElement("span", { style: { fontSize: 10, color: "#999" } }, "E未達のためH1/H2・実現損益は不要") : null)
          )
        );
      })() : React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16, marginTop: 4, marginBottom: 4, flexWrap: "wrap" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
          React.createElement("span", { style: { fontSize: 12, color: "#666", fontWeight: 600 } }, "OS値（水準線比）"),
          React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", step: "1", min: "0",
              value: fOsVal,
              onChange: function(e) { setFOsVal(_toHankakuNum(e.target.value)); },
              placeholder: "0",
              style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", width: 80, textAlign: "right", fontSize: 13, boxSizing: "border-box" }
            }),
            _stepBtn(
              function() { setFOsVal(function(v) { return String((Number(v)||0) + 1); }); },
              function() { setFOsVal(function(v) { return String(Math.max(0, (Number(v)||0) - 1)); }); }
            )
          ),
          React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円")
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
          React.createElement("span", { style: { fontSize: 12, color: "#666", fontWeight: 600 } }, "確定値（水準線比）"),
          React.createElement("div", {
            style: { display: "flex", alignItems: "center", border: "1px solid " + (fOsConfSign === "+" ? "#C0392B" : fOsConfSign === "-" ? "#1E8449" : "#ccc"), borderRadius: 6, overflow: "hidden" }
          },
            React.createElement("button", {
              onClick: function() {
                var newSign = fOsConfSign === "+" ? "-" : (fOsConfSign === "-" ? null : "+");
                setFOsConfSign(newSign);
              },
              style: { padding: "5px 10px", fontSize: 13, fontWeight: fOsConfSign ? 700 : 400,
                border: "none", borderRight: "1px solid " + (fOsConfSign === "+" ? "#C0392B" : fOsConfSign === "-" ? "#1E8449" : "#ccc"),
                background: fOsConfSign === "+" ? "#FCEBEB" : fOsConfSign === "-" ? "#EAF3DE" : "#f5f4f0",
                color: fOsConfSign === "+" ? "#C0392B" : fOsConfSign === "-" ? "#1E8449" : "#999",
                cursor: "pointer", minWidth: 36, flexShrink: 0 }
            }, fOsConfSign === "+" ? "↑" : fOsConfSign === "-" ? "↓" : "↕"),
            React.createElement("input", {
              type: "text", inputMode: "numeric", step: "1",
              value: fOsConfVal,
              onChange: function(e) { var v = _toHankakuNum(e.target.value); setFOsConfVal(v); if ((Number(v) || 0) === 0) setFOsConfSign(null); },
              placeholder: "0",
              style: { border: "none", outline: "none", padding: "5px 8px", fontSize: 13, background: "#fff", width: 80, textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(
              function() { _applySigned(_oscSignedRef, 1, "+", "-", setFOsConfVal, setFOsConfSign); },
              function() { _applySigned(_oscSignedRef, -1, "+", "-", setFOsConfVal, setFOsConfSign); }
            )
          ),
          React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円")
        )
      ),
      
      isV2Form ? null : React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } },
        React.createElement("span", { style: { fontSize: 12, color: "#666", fontWeight: 700, whiteSpace: "nowrap" } }, "結果"),
        React.createElement("div", { style: { display: "flex", gap: 4 } },
          [["○ 成功", "ok", "#C0392B", "#FCEBEB"], ["△ 引き分け", "draw", "#6B7280", "#F3F4F6"], ["× 失敗", "ng", "#1E8449", "#EAF3DE"], ["ー E基準未達", "miss", "#B45309", "#FEF3C7"]].map(function(kv) {
            var on = fResult === kv[1];
            return React.createElement("button", {
              key: kv[1],
              onClick: function() { setFResult(kv[1]); if (kv[1] === "ng") { setFPlanSign("-"); } else if (kv[1] === "ok") { setFPlanSign("+"); } },
              style: {
                padding: "4px 8px", fontSize: 11, fontWeight: 600,
                border: on ? "1.5px solid " + kv[2] : "1px solid #ddd",
                background: on ? kv[3] : "#fff",
                color: on ? kv[2] : "#555",
                borderRadius: 5, cursor: "pointer"
              }
            }, kv[0]);
          })
        )
      ),
      
      React.createElement("div", { style: Object.assign({}, SH_, { display: "flex", alignItems: "center", gap: 8 }) },
        "EP" + (_epFormState && _epFormState.epIdx >= 0 ? "（＝OS" + (_epFormState.epIdx + 1) + "）" : "")
      ),
      React.createElement("div", { style: { marginBottom: 8, padding: "8px 10px", borderRadius: 6, background: "#F8F9FA", border: "1px solid #e5e5e5" } },
      React.createElement("div", { style: { marginBottom: 8 } },
        React.createElement("div", { style: { fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 4 } }, "EP損益（100株換算）"),
        _fMiss ? _fMissEl : (function() {
          // v2でEP=OS2/3の場合、fPlan(OS1基準の自動計算)ではなくEP足から直接計算した値を表示。
          var _useV2P = isV2Form && _epFormState && _epFormState.epIdx > 0 && _fAlpha != null && _epFormState.epHigh != null;
          var _pvV2 = null;
          if (_useV2P) {
            var _dfV2 = _epFormState.epHigh - _fAlpha;
            _pvV2 = _dfV2 >= _fCutLine ? -Math.round(_dfV2 * 100) : (_epFormState.epConf != null ? Math.round((_fAlpha - _epFormState.epConf) * 100) : null);
          }
          var _sgnP = _useV2P ? (_pvV2 == null ? null : _pvV2 > 0 ? "+" : _pvV2 < 0 ? "-" : null) : fPlanSign;
          var _txtP = _useV2P
            ? (_pvV2 == null ? "—" : _pvV2 === 0 ? "0円" : (_pvV2 > 0 ? "+" : "−") + Math.abs(_pvV2).toLocaleString() + "円")
            : (fPlan === "0" ? "0円" : fPlan ? (fPlanSign === "-" ? "−" : "+") + fPlan + "円" : "—");
          return React.createElement("span", {
            style: {
              display: "inline-block", padding: "5px 14px",
              fontSize: 15, fontWeight: 800,
              color: _sgnP === "+" ? "#C0392B" : _sgnP === "-" ? "#1E8449" : "#555",
              background: _sgnP === "+" ? "#FCEBEB" : _sgnP === "-" ? "#EAF3DE" : "#f5f5f5",
              borderRadius: 6, border: "1px solid " + (_sgnP === "+" ? "#F5B7B1" : _sgnP === "-" ? "#A9DFBF" : "#ddd"),
              minWidth: 80, textAlign: "right"
            }
          }, _txtP);
        })(),
        (!_fMiss && _fPlanStopNow)
          ? _elCapNote(_fCutLine, { fontSize: 15, circle: 16, style: { justifyContent: "flex-start", marginTop: 3 } }) : null
      ),
      React.createElement("div", { style: { marginBottom: 0 } },
        React.createElement("div", { style: { fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 4 } }, "メモ"),
        React.createElement(FastInput, {
          multiline: true,
          autoResize: true,
          value: fRationale,
          onChange: function(v) { setFRationale(v); },
          placeholder: "",
          rows: 2,
          style: Object.assign({}, I, { fontFamily: "inherit", resize: "none", overflow: "hidden", minHeight: 56 })
        })
      )
      ),

      _fHideHold ? null : React.createElement("div", { style: Object.assign({}, SH_, { display: "flex", alignItems: "center", gap: 8 }) },
        "H１" + (_epFormState && _epFormState.epIdx >= 0 ? "（＝OS" + (_epFormState.epIdx + 2) + "）" : "")
      ),
      _fHideHold ? null : React.createElement("div", {
        style: { marginBottom: 8, padding: "8px 10px", borderRadius: 6, background: "#F8F9FA", border: "1px solid #e5e5e5" }
      },

        React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" } },
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } },
              "結果損益",
              React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "100株換算")),
            _fMiss ? _fMissEl : _fPlanStopNow ? React.createElement("span", { style: { display: "inline-block", padding: "5px 14px", fontSize: 14, fontWeight: 800, color: "#6B7280", background: "#F3F4F6", borderRadius: 6, border: "1px solid #ddd", minWidth: 80, textAlign: "center" } }, "損切り済") : fHoldExp === "×" ? _fHoldXEl : React.createElement("span", {
              style: {
                display: "inline-block", padding: "5px 14px",
                fontSize: 14, fontWeight: 800,
                color: fHoldPnlSign === "+" ? "#C0392B" : fHoldPnlSign === "-" ? "#1E8449" : "#555",
                background: fHoldPnlSign === "+" ? "#FCEBEB" : fHoldPnlSign === "-" ? "#EAF3DE" : "#f5f5f5",
                borderRadius: 6, border: "1px solid " + (fHoldPnlSign === "+" ? "#F5B7B1" : fHoldPnlSign === "-" ? "#A9DFBF" : "#ddd"),
                minWidth: 80, textAlign: "right"
              }
            }, fHoldPnlVal === "0" ? "0円" : fHoldPnlVal ? (fHoldPnlSign === "-" ? "−" : "+") + Number(fHoldPnlVal).toLocaleString() + "円" : "—"),
            (_fH1StopNow || _fPlanStopNow)
              ? _elCapNote(_fCutLine, { fontSize: 14, circle: 15, style: { justifyContent: "flex-start", marginTop: 3 } }) : null
          ),
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } }, "損益変化"),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } },
              [["○ 利益+", "yes", "#922B21", "#F7C1C1"], ["△ 利益-", "mid", "#C0392B", "#FCEBEB"], ["ー 変化なし", "none", "#6B7280", "#F3F4F6"], ["× 損失", "no", "#1E8449", "#EAF3DE"], ["損切り済", "stop", "#6B7280", "#F3F4F6"], ["未達", "miss", "#7C3AED", "#F5F3FF"], ["撤退", "withdraw", "#6B7280", "#F3F4F6"]].map(function(kv) {
                var on = fHoldProfit === kv[1];
                return React.createElement("button", {
                  key: kv[1],
                  onClick: function() { setFHoldProfit(on ? null : kv[1]); },
                  style: {
                    width: 96, boxSizing: "border-box", textAlign: "center", whiteSpace: "nowrap",
                    padding: "5px 6px", fontSize: 13, fontWeight: 700, borderRadius: 5, cursor: "pointer",
                    border: on ? "1.5px solid " + kv[2] : "1px solid #ddd",
                    background: on ? kv[3] : "#fff",
                    color: on ? kv[2] : "#aaa"
                  }
                }, kv[0]);
              })
            )
          )
        ),

        React.createElement("div", { style: { marginTop: 10 } },
          React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } }, "H１メモ"),
          React.createElement(FastInput, {
            multiline: true, autoResize: true,
            value: fHoldMemo,
            onChange: function(v) { setFHoldMemo(v); },
            placeholder: "",
            rows: 2,
            style: Object.assign({}, I, { fontFamily: "inherit", resize: "none", overflow: "hidden", minHeight: 48 })
          })
        )
      ),

      _fH2Hidden ? null : React.createElement("div", { style: Object.assign({}, SH_, { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }) },
        "H２" + (_epFormState && _epFormState.epIdx >= 0 ? "（＝OS" + (_epFormState.epIdx + 3) + "）" : ""),
        _fH2NonConsider ? React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" } }, "※H１までE基準未達のため、非考慮") : null
      ),
      _fH2Hidden ? null : React.createElement("div", {
        style: { marginBottom: 8, padding: "8px 10px", borderRadius: 6, background: "#F4F6F8", border: "1px solid " + (fHold2Exp === "×" ? "#e3c9c9" : "#cfe0d2") }
      },

        React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" } },
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } },
              "結果損益",
              React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "100株換算")),
            _fMiss ? _fMissEl : (_fPlanStopNow || _fH1StopNow) ? React.createElement("span", { style: { display: "inline-block", padding: "5px 14px", fontSize: 14, fontWeight: 800, color: "#6B7280", background: "#F3F4F6", borderRadius: 6, border: "1px solid #ddd", minWidth: 80, textAlign: "center" } }, "損切り済") : fHold2Exp === "×" ? _fHoldXEl : React.createElement("span", {
              style: {
                display: "inline-block", padding: "5px 14px",
                fontSize: 14, fontWeight: 800,
                color: fHold2PnlSign === "+" ? "#C0392B" : fHold2PnlSign === "-" ? "#1E8449" : "#555",
                background: fHold2PnlSign === "+" ? "#FCEBEB" : fHold2PnlSign === "-" ? "#EAF3DE" : "#f5f5f5",
                borderRadius: 6, border: "1px solid " + (fHold2PnlSign === "+" ? "#F5B7B1" : fHold2PnlSign === "-" ? "#A9DFBF" : "#ddd"),
                minWidth: 80, textAlign: "right"
              }
            }, fHold2PnlVal === "0" ? "0円" : fHold2PnlVal ? (fHold2PnlSign === "-" ? "−" : "+") + Number(fHold2PnlVal).toLocaleString() + "円" : "—"),
            (_fH2StopNow || _fPlanStopNow)
              ? _elCapNote(_fCutLine, { fontSize: 14, circle: 15, style: { justifyContent: "flex-start", marginTop: 3 } }) : null
          ),
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } }, "損益変化", React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "（H１比）")),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } },
              [["○ 利益+", "yes", "#922B21", "#F7C1C1"], ["△ 利益-", "mid", "#C0392B", "#FCEBEB"], ["ー 変化なし", "none", "#6B7280", "#F3F4F6"], ["× 損失", "no", "#1E8449", "#EAF3DE"], ["損切り済", "stop", "#6B7280", "#F3F4F6"], ["未達", "miss", "#7C3AED", "#F5F3FF"], ["撤退", "withdraw", "#6B7280", "#F3F4F6"]].map(function(kv) {
                var on = fHold2Profit === kv[1];
                return React.createElement("button", {
                  key: kv[1],
                  onClick: function() { setFHold2Profit(on ? null : kv[1]); },
                  style: {
                    width: 96, boxSizing: "border-box", textAlign: "center", whiteSpace: "nowrap",
                    padding: "5px 6px", fontSize: 13, fontWeight: 700, borderRadius: 5, cursor: "pointer",
                    border: on ? "1.5px solid " + kv[2] : "1px solid #ddd",
                    background: on ? kv[3] : "#fff",
                    color: on ? kv[2] : "#aaa"
                  }
                }, kv[0]);
              })
            )
          )
        ),

        React.createElement("div", { style: { marginTop: 8 } },
          React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } }, "Hold２メモ"),
          React.createElement(FastInput, {
            multiline: true, autoResize: true,
            value: fHold2Memo,
            onChange: function(v) { setFHold2Memo(v); },
            placeholder: "",
            rows: 2,
            style: Object.assign({}, I, { fontFamily: "inherit", resize: "none", overflow: "hidden", minHeight: 48 })
          })
        )
      ),


      React.createElement("div", { style: SH_ }, "実エントリー"),
      React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } },
        // 3択（2026-07-06）: あり/見送り/スルー。スルー=entered:false＋passThrough:true＝常に不算入（灰色）。
        [["あり", "y"], ["見送り", "n"], ["スルー", "t"]].map(function(kv) {
          var label = kv[0], mode = kv[1];
          var on = mode === "y" ? (fEntered && !fThru) : (mode === "n" ? (!fEntered && !fThru) : fThru === true);
          var thruSel = mode === "t" && on;
          return React.createElement("button", {
            key: label,
            onClick: function() {
              if (mode === "y") { setFEntered(true); setFThru(false); }
              else { setFEntered(false); setFThru(mode === "t"); setFItemId(null); }
            },
            title: mode === "t" ? "シグナルは出たが判断の土俵に乗せなかった記録＝合計・データ分析に算入しない（一覧では灰色表示）" : null,
            style: {
              padding: "8px 14px", fontSize: 13, fontWeight: 600,
              border: on ? (thruSel ? "1.5px solid #475569" : "1.5px solid #1a1a1a") : "1px solid #ddd",
              background: on ? (thruSel ? "#64748B" : "#1a1a1a") : "#fff",
              color: on ? "#fff" : "#555",
              borderRadius: 6, cursor: "pointer", flex: 1
            }
          }, label);
        })
      ),
      fThru ? React.createElement(React.Fragment, null,
        React.createElement("div", { style: { marginBottom: 8, fontSize: 11, fontWeight: 600, color: "#6B7280", background: "#F5F5F4", border: "1px solid #D6D3D1", borderRadius: 6, padding: "6px 9px" } },
          "スルー＝この記録は合計額・データ分析に算入されません（下の算入チェックに関わらず）。一覧では灰色表示になります。"),
        React.createElement("div", { style: SH_ }, "スルーの根拠メモ"),
        React.createElement(FastInput, {
          multiline: true,
          autoResize: true,
          value: fThruMemo,
          onChange: function(v) { setFThruMemo(v); },
          placeholder: "",
          rows: 2,
          style: Object.assign({}, I, { fontFamily: "inherit", resize: "none", overflow: "hidden", minHeight: 56, marginBottom: 8 })
        })
      ) : null,
      fEntered && React.createElement("div", { style: { marginBottom: 8, padding: "8px 10px", borderRadius: 6, background: "#FBF2D5", border: "1px solid #E5C76B" } },

        React.createElement("div", { style: { marginBottom: 8 } },
          React.createElement("div", { style: { fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 } },
            "実現損益",
            (fPriceIn && fPriceOut && parseFloat(fPriceIn) && parseFloat(fPriceOut)) && React.createElement("span", {
              style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE", fontWeight: 600 }
            }, "⚡ 自動計算")
          ),
          
          React.createElement("div", { style: { marginBottom: 6, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" } },
            React.createElement("label", { style: { fontSize: 11, color: "#666" } }, "株数",
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, marginTop: 2 } },
                React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden" } },
                  React.createElement("input", {
                    type: "text", inputMode: "numeric", min: "0", step: "100",
                    value: fShares,
                    onChange: function(e) { setFShares(_toHankakuNum(e.target.value)); },
                    onKeyDown: function(e) {
                      if (e.key === "ArrowUp")   { e.preventDefault(); setFShares(function(v) { return String((parseInt(v) || 0) + 100); }); }
                      if (e.key === "ArrowDown") { e.preventDefault(); setFShares(function(v) { return String(Math.max(0, (parseInt(v) || 0) - 100)); }); }
                    },
                    placeholder: "100",
                    style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", width: 120, textAlign: "right", fontSize: 13, boxSizing: "border-box" }
                  }),
                  _stepBtn(
                    function() { setFShares(function(v) { return String((parseInt(v)||0) + 100); }); },
                    function() { setFShares(function(v) { return String(Math.max(0, (parseInt(v)||0) - 100)); }); }
                  )
                ),
                React.createElement("span", { style: { fontSize: 12, color: "#666" } }, "株")
              )
            ),
            React.createElement("label", { style: { fontSize: 11, color: "#0369A1", fontWeight: 700 } }, "α値（取引時の採用値）",
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, marginTop: 2 } },
                React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #BAE6FD", borderRadius: 6, overflow: "hidden" } },
                  React.createElement("input", {
                    type: "text", inputMode: "numeric", min: "0", max: "50", step: "1",
                    value: fTradeAlpha,
                    onChange: function(e) { var v = _toHankakuNum(e.target.value); if (v === "") { setFTradeAlpha(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 50) n = 50; if (n < 0) n = 0; setFTradeAlpha(String(n)); },
                    placeholder: "—",
                    style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", width: 70, textAlign: "right", fontSize: 13, boxSizing: "border-box" }
                  }),
                  _stepBtn(
                    function() { setFTradeAlpha(function(v) { return String(Math.min(50, (Number(v)||0) + 1)); }); },
                    function() { setFTradeAlpha(function(v) { return String(Math.max(0, (Number(v)||0) - 1)); }); }
                  )
                ),
                React.createElement("span", { style: { fontSize: 12, color: "#666" } }, "円")
              )
            ),
            React.createElement("label", { style: { fontSize: 11, color: "#9A3412", fontWeight: 700 } }, "E-OS",
              React.createElement("div", { style: { display: "flex", gap: 3, marginTop: 2 } },
                [1, 2, 3].map(function(_no) {
                  var on = fEntryOsNo === _no;
                  return React.createElement("button", { key: _no, type: "button",
                    onClick: function() { setFEntryOsNo(on ? null : _no); },
                    style: { padding: "8px 12px", fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: "pointer",
                      border: "1.5px solid " + (on ? "#C0392B" : "#ddd"), background: on ? "#FCEBEB" : "#fff", color: on ? "#C0392B" : "#999" } }, _no);
                }))
            )
          ),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 4 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
              React.createElement("label", { style: { fontSize: 11, color: "#666", display: "flex", flexDirection: "column", flex: 1 } }, "価格（入り）",
                React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden", marginTop: 2 } },
                  React.createElement("input", {
                    type: "text", inputMode: "decimal", step: "any",
                    value: fPriceIn, onChange: function(e) { setFPriceIn(_toHankakuDecimal(e.target.value)); },
                    placeholder: "0",
                    style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", flex: 1, textAlign: "right", fontSize: 13, boxSizing: "border-box" }
                  }),
                  _stepBtn(
                    function() { setFPriceIn(function(v) { return String((parseFloat(v)||0) + 1); }); },
                    function() { setFPriceIn(function(v) { return String(Math.max(0, (parseFloat(v)||0) - 1)); }); }
                  )
                )
              ),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", flex: 1 } },
                React.createElement("span", { style: { fontSize: 11, color: "#666", marginBottom: 2 } }, "Entry-OS値（水準線比）"),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } },
                  React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid " + (fEntryOsSign === "+" ? "#C0392B" : fEntryOsSign === "-" ? "#1E8449" : "#ccc"), borderRadius: 6, overflow: "hidden", flex: 1 } },
                    React.createElement("button", {
                      onClick: function() { setFEntryOsSign(fEntryOsSign === "+" ? "-" : (fEntryOsSign === "-" ? null : "+")); },
                      style: { padding: "5px 10px", fontSize: 13, fontWeight: fEntryOsSign ? 700 : 400,
                        border: "none", borderRight: "1px solid " + (fEntryOsSign === "+" ? "#C0392B" : fEntryOsSign === "-" ? "#1E8449" : "#ccc"),
                        background: fEntryOsSign === "+" ? "#FCEBEB" : fEntryOsSign === "-" ? "#EAF3DE" : "#f5f4f0",
                        color: fEntryOsSign === "+" ? "#C0392B" : fEntryOsSign === "-" ? "#1E8449" : "#999",
                        cursor: "pointer", minWidth: 36, flexShrink: 0 }
                    }, fEntryOsSign === "+" ? "↑" : fEntryOsSign === "-" ? "↓" : "↕"),
                    React.createElement("input", {
                      type: "text", inputMode: "numeric", step: "1",
                      value: fEntryOsVal, onChange: function(e) { var v = _toHankakuNum(e.target.value); setFEntryOsVal(v); if ((Number(v) || 0) === 0) setFEntryOsSign(null); },
                      placeholder: "0",
                      style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", flex: 1, textAlign: "right", fontSize: 13 }
                    }),
                    _stepBtn(
                      function() { _applySigned(_entryOsSignedRef, 1, "+", "-", setFEntryOsVal, setFEntryOsSign); },
                      function() { _applySigned(_entryOsSignedRef, -1, "+", "-", setFEntryOsVal, setFEntryOsSign); }
                    )
                  ),
                  React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "円")
                )
              )
            ),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
              React.createElement("label", { style: { fontSize: 11, color: "#666", display: "flex", flexDirection: "column", flex: 1 } }, "価格（出）",
                React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden", marginTop: 2 } },
                  React.createElement("input", {
                    type: "text", inputMode: "decimal", step: "any",
                    value: fPriceOut, onChange: function(e) { setFPriceOut(_toHankakuDecimal(e.target.value)); },
                    placeholder: "0",
                    style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", flex: 1, textAlign: "right", fontSize: 13, boxSizing: "border-box" }
                  }),
                  _stepBtn(
                    function() { setFPriceOut(function(v) { return String((parseFloat(v)||0) + 1); }); },
                    function() { setFPriceOut(function(v) { return String(Math.max(0, (parseFloat(v)||0) - 1)); }); }
                  )
                )
              ),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", flex: 1 } },
                React.createElement("span", { style: { fontSize: 11, color: "#666", marginBottom: 2 } }, "Exit-OS値（水準線比）"),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } },
                  React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid " + (fExitOsSign === "+" ? "#C0392B" : fExitOsSign === "-" ? "#1E8449" : "#ccc"), borderRadius: 6, overflow: "hidden", flex: 1 } },
                    React.createElement("button", {
                      onClick: function() { setFExitOsSign(fExitOsSign === "+" ? "-" : (fExitOsSign === "-" ? null : "+")); },
                      style: { padding: "5px 10px", fontSize: 13, fontWeight: fExitOsSign ? 700 : 400,
                        border: "none", borderRight: "1px solid " + (fExitOsSign === "+" ? "#C0392B" : fExitOsSign === "-" ? "#1E8449" : "#ccc"),
                        background: fExitOsSign === "+" ? "#FCEBEB" : fExitOsSign === "-" ? "#EAF3DE" : "#f5f4f0",
                        color: fExitOsSign === "+" ? "#C0392B" : fExitOsSign === "-" ? "#1E8449" : "#999",
                        cursor: "pointer", minWidth: 36, flexShrink: 0 }
                    }, fExitOsSign === "+" ? "↑" : fExitOsSign === "-" ? "↓" : "↕"),
                    React.createElement("input", {
                      type: "text", inputMode: "numeric", step: "1",
                      value: fExitOsVal, onChange: function(e) { var v = _toHankakuNum(e.target.value); setFExitOsVal(v); if ((Number(v) || 0) === 0) setFExitOsSign(null); },
                      placeholder: "0",
                      style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", flex: 1, textAlign: "right", fontSize: 13 }
                    }),
                    _stepBtn(
                      function() { _applySigned(_exitOsSignedRef, 1, "+", "-", setFExitOsVal, setFExitOsSign); },
                      function() { _applySigned(_exitOsSignedRef, -1, "+", "-", setFExitOsVal, setFExitOsSign); }
                    )
                  ),
                  React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "円")
                )
              )
            )
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
            React.createElement("span", {
              style: {
                display: "inline-block", padding: "8px 16px", fontSize: 16, fontWeight: 800,
                color: fRealSign === "+" ? "#C0392B" : fRealSign === "-" ? "#1E8449" : "#555",
                background: fRealSign === "+" ? "#FCEBEB" : fRealSign === "-" ? "#EAF3DE" : "#f5f5f5",
                borderRadius: 6, border: "1px solid " + (fRealSign === "+" ? "#F5B7B1" : fRealSign === "-" ? "#A9DFBF" : "#ddd"),
                minWidth: 120, textAlign: "right"
              }
            }, (fReal === "" || fReal == null) ? "—" : (fReal === "0" ? "0円" : (fRealSign === "-" ? "−" : "+") + Number(fReal).toLocaleString() + "円")),
            React.createElement("span", { style: { fontSize: 11, color: "#0369A1", whiteSpace: "nowrap" } },
              "⚡ 価格×株数で自動計算（" + (fTradeType === "空売" ? "入値−出値" : "出値−入値") + "）")
          )
        )
      ),
      
      React.createElement("div", { style: SH_ }, "\u53CD\u7701\u30FB\u30E1\u30E2"),
      React.createElement(FastInput, {
        multiline: true,
        autoResize: true,
        value: fReflection,
        onChange: function(v) { setFReflection(v); },
        placeholder: "",
        rows: 2,
        style: Object.assign({}, I, { fontFamily: "inherit", resize: "none", overflow: "hidden", minHeight: 56 })
      }),


      React.createElement("div", {
        onClick: function() { setFIncl(function(v) { return !v; }); },
        style: { display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "11px 13px",
          borderRadius: 8, cursor: "pointer", userSelect: "none",
          border: "1px solid " + (fIncl ? "#A9DFBF" : "#e0e0e0"),
          background: fIncl ? "#EAF3DE" : "#f5f5f5" }
      },
        React.createElement("span", {
          style: { width: 22, height: 22, borderRadius: 5, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: "#fff",
            border: "2px solid " + (fIncl ? "#1E8449" : "#bbb"),
            background: fIncl ? "#1E8449" : "#fff" }
        }, fIncl ? "✓" : ""),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 1 } },
          React.createElement("span", { style: { fontSize: 13.5, fontWeight: 800, color: "#1a1a1a" } }, "計算・データ算入"),
          React.createElement("span", { style: { fontSize: 11, color: fIncl ? "#1E8449" : "#999", fontWeight: 600 } },
            fIncl ? "この記録を計算・データに算入します" : "この記録は計算・データから除外されます")
        )
      ),

      React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 16 } },
        React.createElement("button", {
          onClick: onClose,
          style: { flex: 1, padding: "12px", fontSize: 13, fontWeight: 600, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#555" }
        }, "キャンセル"),
        React.createElement("button", {
          onMouseDown: _fiFlushAll,
          onTouchStart: _fiFlushAll,
          onClick: handleSave,
          style: { flex: 2, padding: "12px", fontSize: 13, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }
        }, isEdit ? "\u66F4\u65B0" : "\u4FDD\u5B58"),
        isEdit && React.createElement("button", {
          onClick: function() {
            if (!window.confirm("このエントリー記録を削除しますか？")) return;
            _elDeleteSignal(save, initial.stock, initial.date, initSig.id);
            onClose();
          },
          style: { padding: "12px 16px", fontSize: 13, fontWeight: 600, background: "#FCEBEB", color: "#C0392B", border: "1px solid #F5C6CB", borderRadius: 6, cursor: "pointer" }
        }, "削除")
      )
    )
  );
}




function EntryLogCard(_ref_elc) {
  var record = _ref_elc.record,
    onEdit = _ref_elc.onEdit,
    onGoDate = _ref_elc.onGoDate;
  var s = record.signal;
  var item = record.item;
  var entered = _elIsEntered(s, item);
  var realPnl = (item && item.pnl != null) ? Number(item.pnl)
    : (s.realizedPnl != null ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null);
  var _elcAi = (_ref_elc.alpha != null)
    ? { alpha: Number(_ref_elc.alpha), cutLine: (_ref_elc.cutLine != null ? Number(_ref_elc.cutLine) : 10) }
    : (_ref_elc.data ? _elAlphaInfo(record, _ref_elc.data) : null);
  var planPnl = _elcAi ? _elDynPlanned(s, _elcAi.alpha, _elcAi.cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
  var holdPnl = _elcAi ? _elDynHold(s, _elcAi.alpha, _elcAi.cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
  var _dispResult = _elcAi ? _elDynResult(s, _elcAi.alpha, _elcAi.cutLine) : s.result;
  var _dispHP = _elcAi ? (function() {
    var hp = holdPnl, pp = planPnl;
    if (hp == null) return s.holdProfit;
    if (_dispResult === "miss" || _dispResult === "draw") return hp > 0 ? "yes" : hp < 0 ? "no" : "none";
    if (pp == null) return s.holdProfit;
    if (pp > 0 && hp > 0) return hp > pp ? "yes" : hp < pp ? "mid" : "none";
    if (pp < 0 && hp < 0) return "no";
    if (pp > 0 && hp < 0) return "no";
    if (pp < 0 && hp > 0) return "yes";
    if (hp === 0) return "none";
    return s.holdProfit;
  })() : s.holdProfit;
  
  var _chip = function(label, value, valueColor, extra) {
    return React.createElement("div", { style: Object.assign({ display: "inline-flex", flexDirection: "column", alignItems: "center", padding: "2px 6px", background: "#f5f4f0", borderRadius: 4, border: "1px solid #e8e5de", minWidth: 36 }, extra || {}) },
      React.createElement("span", { style: { fontSize: 8, color: "#aaa", fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap" } }, label),
      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: valueColor || "#333", lineHeight: 1.3, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, value)
    );
  };
  var _pnlColor = function(v) { return v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888"; };
  var _pnlFmt = function(v) { return (v > 0 ? "+" : "") + v.toLocaleString() + "円"; };
  
  var _resultBadge = function(res) {
    var map = { ok: ["○", "#1E8449", "#EAF3DE", "#A9DFBF"], ng: ["×", "#C0392B", "#FCEBEB", "#F5C6CB"], draw: ["△", "#6B7280", "#F3F4F6", "#D1D5DB"], miss: ["ー", "#B45309", "#FEF9C3", "#FDE68A"] };
    var m = map[res]; if (!m) return null;
    return React.createElement("span", { style: { padding: "2px 6px", fontSize: 10, fontWeight: 700, background: m[2], color: m[1], borderRadius: 4, border: "1px solid " + m[3] } }, m[0]);
  };
  
  var _hpBadge = function(hp) {
    var map = { yes: ["○", "#1E8449"], mid: ["△", "#B45309"], none: ["ー", "#888"], no: ["×", "#C0392B"] };
    var m = map[hp]; if (!m) return null;
    return React.createElement("span", { style: { fontWeight: 700, color: m[1], marginRight: 2 } }, m[0]);
  };
  
  var _gradeBadge = function(grade) {
    if (!grade || grade === "Z") return null;
    var gs = _GRADE_STYLE[grade] || _GRADE_STYLE.Z;
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 2, flexShrink: 0 } }, grade);
  };

  return React.createElement("div", {
    style: { background: "#fff", border: "1px solid #e0ddd6", borderRadius: 8, padding: "8px 10px", marginBottom: 6, cursor: "pointer" },
    onClick: function() { if (onEdit) onEdit(record); },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = "#F97316"; },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = "#e0ddd6"; }
  },
    
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" } }, _fmtDow(record.date)),
      (_elIsExcluded(s) && !_elIsThru(s)) ? _elNotInclBadge() : null,   // スルーは下の実エントリー状態チップで表示＝二重バッジ回避 2026-07-06
      _addAlphaUnsetBadge(s),
      s.time && React.createElement("span", { style: { fontSize: 12, color: "#666", fontWeight: 600 } }, s.time),
      React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, record.stock)
    ),
    _ref_elc.data ? _elCollPairNode(_ref_elc.data, record, _ref_elc.collScope) : null,

    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 } },
      s.tradeType && React.createElement("span", { style: { padding: "1px 5px", fontSize: 10, fontWeight: 700, background: s.tradeType === "空売" ? "#FCEBEB" : "#EAF3DE", color: s.tradeType === "空売" ? "#C0392B" : "#1E8449", borderRadius: 4, border: "1px solid " + (s.tradeType === "空売" ? "#F5C6CB" : "#A9DFBF") } }, s.tradeType),
      React.createElement("span", { style: { padding: "1px 5px", fontSize: 10, fontWeight: 600, background: entered ? "#E8F5E9" : (_elIsThru(s) ? "#E5E7EB" : "#f5f4f0"), color: entered ? "#2E7D32" : (_elIsThru(s) ? "#4B5563" : "#888"), borderRadius: 4, border: "1px solid " + (entered ? "#A9DFBF" : (_elIsThru(s) ? "#9CA3AF" : "#ddd")) } }, entered ? "実エントリー" : (_elIsThru(s) ? "スルー" : "見送り")),
      (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).map(function(t) {
        return React.createElement("span", { key: t, style: { padding: "1px 7px", fontSize: 11, fontWeight: 600, background: "#FFEDD5", color: "#9A3412", borderRadius: 5, border: "1px solid #FB923C" } }, _elTagDisp(s, t));
      }),
      s.isCustomTag && React.createElement("span", { style: { padding: "1px 7px", fontSize: 11, fontWeight: 600, background: "#EEF2FF", color: "#4338CA", borderRadius: 5, border: "1px solid #C7D2FE" } }, s.customTagText || "(その他)"),
      s.tpDifficulty && React.createElement("span", { style: { padding: "1px 5px", fontSize: 10, fontWeight: 600, background: "#DCFCE7", color: "#14532D", borderRadius: 4, border: "1px solid #86EFAC" } }, "利確" + s.tpDifficulty),
      record.stockTags && record.stockTags.map(function(t) {
        return React.createElement("span", { key: t, style: { padding: "1px 5px", fontSize: 10, fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, border: "1px solid #BFDBFE" } }, "📌 " + t);
      }),
      _elcAi && _elcAi.alpha != null && React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#0369A1", whiteSpace: "nowrap", padding: "1px 6px", background: "#F0F9FF", borderRadius: 4, border: "1px solid #BAE6FD" } }, "採用α " + _elcAi.alpha + "円 / 損切り " + _elcAi.cutLine + "円"),
      _elcAi && _elcAi.alpha != null ? _elAlphaBreakdownNode(s, _elcAi.alpha) : null
    ),
    (function() {   // 詳細タグ（底/起/特徴）＝明細表のシグナル欄2行表示(_elSigCell)とカードを対称に 2026-07-07
      var _dTags = (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : []));
      var _parts = [];
      _dTags.forEach(function(t) {
        var _sec = _elSigDetailSec(s, t);
        var _b = [];
        if (_sec.b) _b.push("底 " + _sec.b);
        if (_sec.k) _b.push("起 " + _sec.k);
        var _f = (_sec.f || []).filter(Boolean);
        if (_f.length) _b.push("特徴 " + _f.join("・"));
        if (_b.length) _parts.push((_dTags.length > 1 ? t + ": " : "") + _b.join("・"));
      });
      if (!_parts.length) return null;
      return React.createElement("div", { style: { fontSize: 9.5, color: "#64748B", margin: "-2px 0 6px", lineHeight: 1.4 } }, _parts.join(" ／ "));
    })(),

    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-start", marginBottom: (s.rationale || s.reflection || s.thruMemo || s.priceIn || s.priceOut) ? 6 : 0 } },

      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
        s.osVal != null ? _chip("OS値", s.osVal + "円", _vcol(s.osVal, true)) : null
      ),

      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
        (s.osConfSign || (s.osConfVal != null && Number(s.osConfVal) === 0)) ? _chip("確定値",
          Number(s.osConfVal) === 0 ? "0円" : (s.osConfSign === "+" ? "↑" : s.osConfSign === "-" ? "↓" : "↕") + Math.abs(Number(s.osConfVal)) + "円",
          Number(s.osConfVal) === 0 ? "#888" : _vcol(s.osConfVal, s.osConfSign === "+")) : null
      ),

      _dispResult ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 } },
        React.createElement("span", { style: { fontSize: 8, color: "#aaa", fontWeight: 700, lineHeight: 1.2 } }, "結果"),
        _resultBadge(_dispResult)
      ) : null,

      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
        _dispResult === "miss" ? _chip("EP損益", _qMissCell(14), "#888") :
        planPnl != null ? React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", padding: "2px 6px", background: "#f5f4f0", borderRadius: 4, border: "1px solid #e8e5de", minWidth: 36 } },
          React.createElement("span", { style: { fontSize: 8, color: "#aaa", fontWeight: 700, lineHeight: 1.2 } }, "EP損益"),
          React.createElement("span", { style: { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 700, color: _pnlColor(planPnl), lineHeight: 1.3, whiteSpace: "nowrap" } },
            _gradeBadge(planPnl != null ? _profitGradeFromPnl(planPnl, 1) : null),
            _pnlFmt(planPnl)),
          (_elcAi && _elPlanIsStop(s, _elcAi.alpha, _elcAi.cutLine)) ? _elCapNote(_elcAi.cutLine) : null
        ) : null
      ),

      React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", alignSelf: "center" } },
        React.createElement("span", { style: { fontSize: 9, color: "#aaa", fontWeight: 700 } }, "H１"),
        _elHoldFlow(s, _elcAi ? _elcAi.alpha : null, _elcAi ? _elcAi.cutLine : 10, false),
        (_elH2Miss(s, _elcAi ? _elcAi.alpha : null) || s.hold2Exp) ? React.createElement("span", { style: { fontSize: 9, color: "#aaa", fontWeight: 700, marginLeft: 6 } }, "H２") : null,
        (_elH2Miss(s, _elcAi ? _elcAi.alpha : null) || s.hold2Exp) ? _elHold2Cell(s, _elcAi ? _elcAi.alpha : null, _elcAi ? _elcAi.cutLine : 10) : null
      ),
      React.createElement("span", { style: { alignSelf: "center", color: "#ddd", fontSize: 14 } }, "|"),
      entered && realPnl != null && React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", padding: "2px 6px", background: "#f5f4f0", borderRadius: 4, border: "1px solid #e8e5de", minWidth: 36 } },
        React.createElement("span", { style: { fontSize: 8, color: "#aaa", fontWeight: 700, lineHeight: 1.2 } }, "実現損益"),
        React.createElement("span", { style: { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 700, color: _pnlColor(realPnl), lineHeight: 1.3, whiteSpace: "nowrap" } },
          _tradeAlphaChip(s),
          _gradeBadge(realPnl != null ? _profitGradeFromPnlReal(realPnl, 1) : null),
          _pnlFmt(realPnl))
      ),

      (s.priceIn || s.priceOut) && _chip("価格", (s.priceIn ? "入" + s.priceIn : "") + (s.priceIn && s.priceOut ? "→" : "") + (s.priceOut ? "出" + s.priceOut : ""), "#555")
    ),

    (s.holdMemo || s.hold2Memo) && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2, marginTop: 4 } },
      s.holdMemo ? React.createElement("div", { style: { fontSize: 10, color: "#777", lineHeight: 1.4, whiteSpace: "pre-wrap" } }, React.createElement("span", { style: { color: "#aaa", fontWeight: 700, marginRight: 3 } }, "H１メモ"), s.holdMemo) : null,
      s.hold2Memo ? React.createElement("div", { style: { fontSize: 10, color: "#777", lineHeight: 1.4, whiteSpace: "pre-wrap" } }, React.createElement("span", { style: { color: "#aaa", fontWeight: 700, marginRight: 3 } }, "H２メモ"), s.hold2Memo) : null
    ),

    s.alphaMemo && React.createElement("div", { style: { fontSize: 11, color: "#555", lineHeight: 1.5, whiteSpace: "pre-wrap" } }, React.createElement("span", { style: { color: "#aaa", fontWeight: 700, marginRight: 3 } }, "αメモ"), s.alphaMemo),
    s.thruMemo && React.createElement("div", { style: { fontSize: 11, color: "#6B7280", lineHeight: 1.5, whiteSpace: "pre-wrap", paddingLeft: 6, borderLeft: "2px solid #9CA3AF" } }, React.createElement("span", { style: { color: "#9CA3AF", fontWeight: 700, marginRight: 3 } }, "スルー根拠"), s.thruMemo),
    s.rationale && React.createElement("div", { style: { fontSize: 11, color: "#555", lineHeight: 1.5, whiteSpace: "pre-wrap" } }, "根拠: " + s.rationale),
    s.reflection && React.createElement("div", { style: { fontSize: 11, color: "#777", marginTop: 4, lineHeight: 1.5, whiteSpace: "pre-wrap", paddingLeft: 6, borderLeft: "2px solid #e0ddd6" } }, s.reflection),
    onGoDate && React.createElement("div", { style: { textAlign: "right", marginTop: 4 } },
      React.createElement("button", {
        onClick: function(e) { e.stopPropagation(); onGoDate(record.date); },
        style: { fontSize: 10, padding: "3px 8px", background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", color: "#666" }
      }, "その日へ→")
    )
  );
}




