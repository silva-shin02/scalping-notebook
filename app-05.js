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
        if (!_elIsEntered(s, null)) return;
        if (!m[dt]) m[dt] = { sum: 0, count: 0 };
        var v = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
        m[dt].sum += (v != null ? v : 0);
        m[dt].count += 1;
      });
    });
    var result = {};
    Object.keys(m).forEach(function(dt) {
      result[dt] = { grade: _profitGradeFromPnl(m[dt].sum, m[dt].count), sum: m[dt].sum };
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
                  title: "損益グレード: " + _gd.grade + " (" + (_GRADE_DESC[_gd.grade] || "") + ")\n合計: " + (_s > 0 ? "+" : "") + _s.toLocaleString() + "円",
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
          })()
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
  return all.filter(function(r) { return r.date >= cutStr; });
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
      if (sorted[i].signal.result === "ng") streak++;
      else if (sorted[i].signal.result === "ok") break;
      
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
        var obj = { f: features, savedAt: savedAt };
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
    alpha: (s && s.alphaVal != null) ? Number(s.alphaVal) : _gradeAlpha(s && s.difficulty),
    cutLine: (c && c.cutLine != null) ? Number(c.cutLine) : 10
  };
}
function _elDynResult(s, alpha, cutLine) {
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
function _elDynPlanned(s, alpha, cutLine) {
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
  return alpha != null && s.osVal != null && (Number(s.osVal) - alpha) >= (cutLine != null ? cutLine : 10);
}
function _elHoldIsStop(s, alpha, cutLine) {
  if (alpha == null) return false;
  var _cl = cutLine != null ? cutLine : 10;
  if (s.holdHighSign === "-" && s.holdHighVal != null && (Number(s.holdHighVal) - alpha) >= _cl) return true;
  if (s.osVal != null && (Number(s.osVal) - alpha) >= _cl) return true;
  return false;
}
// 理想α値: 候補(5/10/15/20/25/30)のうち損切りにならず「想定損益＋H1結果損益」の合計が最大の値。
// 該当が無ければ全候補中で合計が最大(=一番マシ)の値。同点は小さいα優先。本日/今週の損益データ表のαシミュ用。
var _EL_IDEAL_ALPHAS = [5, 10, 15, 20, 25, 30];
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
function _elDynHold2(s, alpha, cutLine) {
  // 想定損益またはH1で既に損切りの場合、H2には損切りルールを適用せず値幅から算出（損益変化はH1損益との純粋比較）。
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
function _elHoldIsStop2(s, alpha, cutLine) { return _elHoldIsStop(_h2sig(s), alpha, cutLine); }
function _elHas2Data(s) { return !!(s && (s.hold2HighVal != null || s.hold2Width != null || s.hold2OsConf != null || s.hold2Pnl != null)); }
// 想定損益もH1もE基準未達（OS値<α かつ H1高値もα未達）→ H2は成立せず非表示扱い。
// 表ではH2欄に黒字「ー（H１までE基準未達）」を表示し、合計には算入しない。フォームの _fH2Hidden と同条件。
function _elH2Miss(s, alpha) {
  if (alpha == null || s == null || s.osVal == null) return false;
  var _os = Number(s.osVal);
  if (isNaN(_os) || _os < 0 || _os >= alpha) return false;  // 想定がα到達なら対象外
  var _h1ReachedA = (s.holdHighSign === "-" && s.holdHighVal != null && Number(s.holdHighVal) >= alpha);  // H1高値がα到達=H1でエントリー成立
  return !_h1ReachedA;
}
function _elH2MissNode() {
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" } }, _qZeroCell(), React.createElement("span", { style: { fontSize: 9, color: "#999", fontWeight: 400 } }, "（H１までE基準未達）"));
}
// Hold2期待度（○/△を集計対象・×は参考表示のみ）
function _elH2ExpCounts(s) { return s.hold2Exp; }
function _elHoldGradeBadge(g) {
  if (!g || g === "Z") return null;
  var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
  return React.createElement("span", { key: "g", style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 13, height: 13, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border, fontWeight: 800, fontSize: 8, marginRight: 1, flexShrink: 0 } }, g);
}
// 想定損益が損切りの場合のH損益セル: 「想定額（H額）」を両方ランク(grade)付きで表示（左=想定損益額そのまま・括弧内=H1/H2が損切りしていなかった場合の損益）。
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
// 損切り額ノード「× ランク 損切額」（損益列。amount=損切り額・負）。
function _elHoldStopAmtNode(amount, key) {
  return React.createElement("span", { key: key || "sa", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", fontWeight: 700 } },
    React.createElement("span", { key: "x", style: { color: "#C0392B", marginRight: 1, fontWeight: 800 } }, "×"),
    _elHoldGradeBadge(_profitGradeFromPnl(amount, 1)),
    React.createElement("span", { key: "y", style: { color: amount > 0 ? "#C0392B" : amount < 0 ? "#1E8449" : "#888" } }, amount.toLocaleString() + "円"));
}
// 想定損益またはH1で損切り済みのインラインセル表示「ー（損切り済）/ × ランク 損切額」。amount=損切り額(=H1結果損益・負)。
function _elHoldStopDoneNode(amount, key) {
  return React.createElement("span", { key: key || "sd", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontSize: 11 } },
    React.createElement("span", { key: "lbl", style: { color: "#888", fontWeight: 700, marginRight: 2 } }, "損切"),
    React.createElement("span", { key: "op", style: { color: "#888" } }, "（"),
    React.createElement("span", { key: "dash", style: { color: "#888" } }, "ー"),
    React.createElement("span", { key: "sep", style: { color: "#ccc", margin: "0 2px" } }, "/"),
    _elHoldStopAmtNode(amount, "a"),
    React.createElement("span", { key: "cp", style: { color: "#888" } }, "）"));
}
// 統合Hセル: 「H高値 → H確定値 / α値比H値幅 / 勝敗・結果損益」を1つのインライン要素で返す。
// isH2=true なら hold2* を使う（高値/確定値/α値比/損益はH2、想定損益・結果はエントリー共通）。
function _elHoldFlow(s, alpha, cutLine, isH2, noWrap) {
  var hs = isH2 ? _h2sig(s) : s;
  // 損切り済み（H2: 想定orH1で損切り／H1: 想定損益の時点で損切り）は明細を出さず「ー（ランク 損切額）※損切り済」のみ。
  if (alpha != null) {
    var _psFlow = _elPlanIsStop(s, alpha, cutLine);
    if (isH2 ? _elHoldIsStop(s, alpha, cutLine) : _psFlow) {
      var _samtFlow = _psFlow ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
      if (_samtFlow != null) return _elHoldStopDoneNode(_samtFlow);
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
  var holdPnl = (alpha != null) ? (isH2 ? _elDynHold2(s, alpha, cutLine) : _elDynHold(hs, alpha, cutLine)) : _elSignedVal(hs.holdPnl, hs.holdPnlSign);
  var planPnl = (alpha != null) ? _elDynPlanned(s, alpha, cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
  var planStop = (alpha != null) && _elPlanIsStop(s, alpha, cutLine);
  var res = (alpha != null) ? _elDynResult(s, alpha, cutLine) : s.result;
  if (holdPnl != null) {
    var hp = holdPnl;
    // H2の損益変化はH1の結果損益との比較。H1は従来どおり想定損益との比較。
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
        sym ? React.createElement("span", { key: "sym", style: { color: sym[1], marginRight: 1, fontWeight: 800 } }, sym[0]) : null,
        _elHoldGradeBadge(_profitGradeFromPnl(holdPnl, 1)),
        React.createElement("span", { key: "yen", style: { color: holdPnl > 0 ? "#C0392B" : holdPnl < 0 ? "#1E8449" : "#888" } }, holdPnl.toLocaleString() + "円")
      ));
  } else if (res === "miss") {
    nodes.push(React.createElement("span", { key: "a3", style: { color: "#ccc", margin: "0 2px" } }, "/"));
    nodes.push(React.createElement("span", { key: "hp" }, _qZeroCell()));
  }
  if (nodes.length === 0) return React.createElement("span", { style: { color: "#ddd" } }, "—");
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: noWrap ? "nowrap" : "wrap", justifyContent: "center", fontSize: 11, lineHeight: 1.5, whiteSpace: noWrap ? "nowrap" : "normal" } }, nodes);
}
// H2期待度セル: ○/△→記号＋統合表示、×→「×（統合表示）」グレー控えめ、未選択→空欄
function _elHold2Cell(s, alpha, cutLine) {
  if (_elH2Miss(s, alpha)) return _elH2MissNode();
  // 想定orH1で損切り済み → 期待度・明細を出さず「ー（ランク 損切額）※損切り済」のみ。
  if (alpha != null && _elHoldIsStop(s, alpha, cutLine)) {
    var _samtCell = _elPlanIsStop(s, alpha, cutLine) ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
    if (_samtCell != null) return _elHoldStopDoneNode(_samtCell);
  }
  var exp = s.hold2Exp;
  if (!exp) return React.createElement("span", { style: { color: "#ddd" } }, "—");
  // H2期待度が×、または H1期待度(holdExp)が×/損切り済（=H1で手仕舞い済みでH2は参考）なら、H2損益を（）の参考表示に。
  var _h1Exited = (s.holdExp === "×" || s.holdExp === "損切り済");
  if (exp === "×" || _h1Exited) {
    if (!_elHas2Data(s)) return React.createElement("span", { style: { color: "#bbb" } }, exp);
    // H2の内容（高値→確定値/α値比値幅/勝敗損益）すべてを1つの（）で囲む。折返し不可で全体を確実に内包。
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "nowrap", color: "#aaa", fontSize: 11, whiteSpace: "nowrap", opacity: 0.75 } },
      React.createElement("span", { key: "d", style: { marginRight: 1 } }, exp + "（"),
      _elHoldFlow(s, alpha, cutLine, true, true),
      React.createElement("span", { key: "e" }, "）"));
  }
  var _ec = { "○": "#1E8449", "△": "#B45309" };
  // 「損切り済」は_elHoldIsStop時のみの表記。ここはH2成立分岐なので期待度ラベルは出さずフローのみ。
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "nowrap", fontSize: 11, whiteSpace: "nowrap" } },
    exp === "損切り済" ? null : React.createElement("span", { key: "sym", style: { color: _ec[exp] || "#666", fontWeight: 800, marginRight: 3 } }, exp),
    _elHoldFlow(s, alpha, cutLine, true, true));
}
// H1とH2期待度を1セル内に横並び表示（表のH列を1列に統合するため）。H2期待度が未選択ならH1のみ。
function _elHoldBoth(s, alpha, cutLine) {
  var h1 = _elHoldFlow(s, alpha, cutLine, false);
  if (!s.hold2Exp) return h1;
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 2, justifyContent: "center" } },
    React.createElement("span", { key: "h1", style: { display: "inline-flex", alignItems: "center" } }, React.createElement("span", { style: { fontSize: 8, color: "#bbb", fontWeight: 700, marginRight: 2 } }, "①"), h1),
    React.createElement("span", { key: "sep", style: { color: "#ddd", margin: "0 3px" } }, "｜"),
    React.createElement("span", { key: "h2", style: { display: "inline-flex", alignItems: "center" } }, React.createElement("span", { style: { fontSize: 8, color: "#bbb", fontWeight: 700, marginRight: 2 } }, "②"), _elHold2Cell(s, alpha, cutLine))
  );
}
// 集計表のH損益セル用: ①H1合計 ｜ ②H2合計 を1セルに横並び表示。sumH1/sumH2 は数値(円・nullなら—)。
// H2合計の参考表示: 期待度×（本合計から除外）の記録も含めた合計を「（Ⓐ +9,900円）」で返す（= 本合計mainSum ＋ ×参考refSum）。×記録が無ければnull。
function _elHold2RefSuffix(mainSum, refSum, refCnt) {
  if (refCnt == null || refCnt <= 0 || refSum == null) return null;
  var _incl = (mainSum || 0) + refSum;
  return React.createElement("span", { key: "h2ref", style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", color: "#9CA3AF", fontWeight: 600, marginLeft: 2 } },
    "（",
    _elHoldGradeBadge(_profitGradeFromPnl(_incl, 1)),
    React.createElement("span", { style: { color: _incl > 0 ? "#C0392B" : _incl < 0 ? "#1E8449" : "#888" } }, (_incl > 0 ? "+" : "") + _incl.toLocaleString() + "円"),
    "）");
}
// H1合計（結果損益）用の1記録あたりの寄与。期待度ベースのフォールバック（損切り済=×と同一）:
//  ・H1期待度×/損切り済 → H1独自の結果は本合計に算入せず「想定で手仕舞いした損益（想定額）」をmain、H1まで保有した場合との差をrefにし参考合計は「H1まで保有した場合」を表す（実際に損切りでも期待度基準で想定へフォールバック）。
//  ・それ以外（未設定/○/△）→ H1結果(planCap)をmain。
function _elHold1TotParts(s, alpha, cutLine) {
  if (!s) return { main: null, ref: null };
  var hres = (alpha != null) ? _elDynHold(s, alpha, cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
  if (alpha != null && _elPlanIsStop(s, alpha, cutLine)) {
    var pv0 = _elDynPlanned(s, alpha, cutLine);
    if (pv0 != null) hres = pv0;
  }
  if (hres == null) return { main: null, ref: null };
  if (s.holdExp === "×" || s.holdExp === "損切り済") {
    var plan = (alpha != null) ? _elDynPlanned(s, alpha, cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign);
    if (plan == null) return { main: hres, ref: null };
    var h1raw = (alpha != null) ? _elDynHold(s, alpha, cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign);
    return { main: plan, ref: (h1raw != null) ? (h1raw - plan) : null };
  }
  return { main: hres, ref: null };
}
// H2合計（結果損益）用の1記録あたりの寄与（raw値・100株換算）。期待度ベースのフォールバック（損切り済=×と同一）:
//  ・期待度○/△ → _elDynHold2 → main
//  ・期待度×/損切り済 → H2独自の結果は本合計に算入せず「1段下で手仕舞いした損益」をmain（H1期待度×/損切り済→想定額・他→H1結果＝カスケード）。H2との差(hv-H1)をrefにし参考合計は「H2まで保有した場合」を表す（実際に損切りでも期待度基準でフォールバック）。
//  ・期待度未設定 → 旧データで損切りなら損切り額を救済、それ以外null。
function _elHold2TotParts(s, alpha, cutLine) {
  if (!s || _elH2Miss(s, alpha)) return { main: null, ref: null };
  if (s.hold2Exp === "×" || s.hold2Exp === "損切り済") {
    var hv = (alpha != null) ? _elDynHold2(s, alpha, cutLine) : _elSignedVal(s.hold2Pnl, s.hold2PnlSign);
    var _h1c = (s.holdExp === "×" || s.holdExp === "損切り済")
      ? ((alpha != null) ? _elDynPlanned(s, alpha, cutLine) : _elSignedVal(s.plannedPnl, s.plannedPnlSign))
      : ((alpha != null) ? _elDynHold(s, alpha, cutLine) : _elSignedVal(s.holdPnl, s.holdPnlSign));
    if (_h1c == null) return { main: null, ref: hv };
    return { main: _h1c, ref: (hv != null) ? (hv - _h1c) : null };
  }
  if (!s.hold2Exp) {
    // 旧データ救済: hold2Exp未設定で想定orH1損切りなら損切り額をmainに算入。
    if (alpha != null && _elHoldIsStop(s, alpha, cutLine)) {
      var _h1res0 = _elPlanIsStop(s, alpha, cutLine) ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
      return { main: _h1res0, ref: null };
    }
    return { main: null, ref: null };
  }
  if (!_elHas2Data(s)) return { main: null, ref: null };
  var hv2 = (alpha != null) ? _elDynHold2(s, alpha, cutLine) : _elSignedVal(s.hold2Pnl, s.hold2PnlSign);
  return { main: hv2, ref: null };
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
  var hs = isH2 ? _h2sig(s) : s;
  // 損切り済み（H2: 想定orH1損切り／H1: 想定損切り）→ 明細を出さず損益列に「ー（ランク 損切額）※損切り済」のみ。
  if (alpha != null) {
    var _psP = _elPlanIsStop(s, alpha, cutLine);
    if (isH2 ? _elHoldIsStop(s, alpha, cutLine) : _psP) {
      var _samtP = _psP ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine);
      if (_samtP != null) return { high: null, width: null, acmp: null, pnl: _elHoldStopDoneNode(_samtP), miss: false, hasAny: true };
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
  var holdPnl = (alpha != null) ? (isH2 ? _elDynHold2(s, alpha, cutLine) : _elDynHold(hs, alpha, cutLine)) : _elSignedVal(hs.holdPnl, hs.holdPnlSign);
  var res = (alpha != null) ? _elDynResult(s, alpha, cutLine) : s.result;
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
        sym ? React.createElement("span", { key: "sym", style: { color: sym[1], marginRight: 1, fontWeight: 800 } }, sym[0]) : null,
        _elHoldGradeBadge(_profitGradeFromPnl(holdPnl, 1)),
        React.createElement("span", { key: "yen", style: { color: holdPnl > 0 ? "#C0392B" : holdPnl < 0 ? "#1E8449" : "#888" } }, holdPnl.toLocaleString() + "円"));
  } else if (res === "miss") { miss = true; pnl = _qZeroCell(); }
  return { high: high, width: width, acmp: acmp, pnl: pnl, miss: miss, hasAny: !!(high || width || acmp || pnl) };
}
// 明細表用: H1(上)/H2(下)を内部2行テーブルで縦揃え。列幅を固定(tableLayout:fixed)し記録間でも桁が揃う。
// 左端に「H１」「H２」を表記。H1/H2間に区切り横線。H2行は期待度(○/△/×)→内容。
// ×は内容(期待度除く)を（）で一括り・開き/閉じ括弧を専用列に置いて桁揃え。×でも色は薄くしない。
function _elHoldStackInner(s, alpha, cutLine) {
  var exp = s.hold2Exp;
  var _h2miss = _elH2Miss(s, alpha);
  var _h1StopDone = (alpha != null) && _elPlanIsStop(s, alpha, cutLine);   // 想定で損切り→H1も損切り済み表示
  var _h2StopDone = (alpha != null) && _elHoldIsStop(s, alpha, cutLine);   // 想定orH1で損切り→H2は損切り済み表示（期待度問わず）
  var p1 = _h1StopDone ? null : _elHoldParts(s, alpha, cutLine, false);
  var p2 = (_h2miss || _h2StopDone) ? null : (exp || _elHas2Data(s)) ? _elHoldParts(s, alpha, cutLine, true) : null;
  var _pnW = 86, _parW = 10, _tblW = 259;
  var _expCol = { "○": "#1E8449", "△": "#B45309", "×": "#C0392B" };
  var _sep = function(ch) { return React.createElement("span", { style: { color: "#ccc" } }, ch); };
  var _paren = function(ch) { return React.createElement("span", { style: { color: "#888" } }, ch); };
  var _c = function(k, node, ta, w, extra) { return React.createElement("td", { key: k, style: Object.assign({ padding: "0 1px", whiteSpace: "nowrap", verticalAlign: "baseline", textAlign: ta || "center", width: w, overflow: "visible" }, extra || {}) }, node != null ? node : null); };
  var _row = function(rk, lblNode, expNode, p, paren, topB) {
    var bt = topB ? { borderTop: "1px solid #e0d8c8" } : null;
    return React.createElement("tr", { key: rk },
      _c("lbl", lblNode, "center", 22, Object.assign({ fontSize: 9, color: "#999", fontWeight: 700, paddingRight: 3 }, bt)),
      _c("e", expNode, "center", 14, Object.assign({ paddingRight: 1, fontWeight: 800 }, bt)),
      _c("op", paren ? _paren("（") : null, "center", _parW, bt),
      _c("hi", p && p.high, "right", 26, bt),
      _c("ar", p && p.width ? _sep("→") : null, "center", 13, bt),
      _c("wd", p && p.width, "right", 26, bt),
      _c("s1", p && p.acmp ? _sep("/") : null, "center", 8, bt),
      _c("ac", p && p.acmp, "right", 36, bt),
      _c("s2", p && p.pnl ? _sep("/") : null, "center", 8, bt),
      _c("pn", p ? (p.pnl != null ? p.pnl : React.createElement("span", { style: { color: "#ddd" } }, "—")) : null, "left", _pnW, bt),
      _c("cp", paren ? _paren("）") : null, "center", _parW, bt));
  };
  // 損切り済み行: 明細列(高値〜α値比)を colSpan:5 で「ー（損切り済）」中央寄せ、損益列に「× ランク 損切額」。H1の明細(↑→/α)と縦位置が揃う。
  var _stopRow = function(rk, lblNode, amount, topB) {
    var bt = topB ? { borderTop: "1px solid #e0d8c8" } : null;
    return React.createElement("tr", { key: rk },
      _c("lbl", lblNode, "center", 22, Object.assign({ fontSize: 9, color: "#999", fontWeight: 700, paddingRight: 3 }, bt)),
      _c("e", React.createElement("span", { style: { color: "#888", fontWeight: 700, fontSize: 9 } }, "損切"), "center", 14, Object.assign({ paddingRight: 1 }, bt)),
      _c("op", _paren("（"), "center", _parW, bt),
      React.createElement("td", { key: "sd", colSpan: 5, style: Object.assign({ padding: "0 1px", whiteSpace: "nowrap", verticalAlign: "baseline", textAlign: "center", overflow: "visible" }, bt || {}) }, _paren("ー")),
      _c("s2", _sep("/"), "center", 8, bt),
      _c("pn", _elHoldStopAmtNode(amount), "left", _pnW, bt),
      _c("cp", _paren("）"), "center", _parW, bt));
  };
  var hexp = s.holdExp;
  var h1exp = (hexp && hexp !== "損切り済") ? React.createElement("span", { style: { color: _expCol[hexp] || "#666" } }, hexp) : null;
  var rows = [ _h1StopDone ? _stopRow("h1", "H１", _elDynPlanned(s, alpha, cutLine), false) : _row("h1", "H１", h1exp, p1, hexp === "×", false) ];
  if (_h2miss) {
    rows.push(React.createElement("tr", { key: "h2" },
      _c("lbl", "H２", "center", 22, { fontSize: 9, color: "#999", fontWeight: 700, paddingRight: 3, borderTop: "1px solid #e0d8c8" }),
      React.createElement("td", { key: "m", colSpan: 10, style: { padding: "0 4px", whiteSpace: "nowrap", verticalAlign: "baseline", textAlign: "center", borderTop: "1px solid #e0d8c8" } }, React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3 } }, _qZeroCell(), React.createElement("span", { style: { fontSize: 9, color: "#999", fontWeight: 400 } }, "（H１までE基準未達）")))
    ));
  } else if (_h2StopDone) {
    rows.push(_stopRow("h2", "H２", _h1StopDone ? _elDynPlanned(s, alpha, cutLine) : _elDynHold(s, alpha, cutLine), true));
  } else {
    // 「損切り済」は_h2StopDone(想定orH1で損切り)時のみ意味を持つ表記。ここはH2が成立する分岐なので期待度として出さない。
    var h2exp = (exp && exp !== "損切り済") ? React.createElement("span", { style: { color: _expCol[exp] || "#666" } }, exp) : null;
    rows.push(_row("h2", "H２", h2exp, p2, (exp === "×" || hexp === "×" || hexp === "損切り済"), true));
  }
  return React.createElement("table", { style: { borderCollapse: "collapse", margin: "0 auto", fontSize: 11, fontVariantNumeric: "tabular-nums", lineHeight: 1.5, tableLayout: "fixed", width: _tblW } }, React.createElement("tbody", null, rows));
}
// 明細表(フロー表示)用: H列を1セルに統合(H1上/H2下)。colSpan:2で旧2列分の幅を占有し他のcolSpanは不変。
function _elHoldTd2(s, alpha, cutLine, tdStyle, capNote) {
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
  var sumPnl = 0, sumPlanned = 0, sumMax = 0, sumHold = 0;
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
      sumPlanned += ppN;
      if (ppN > 0) plannedWins.push(ppN);
      else if (ppN < 0) plannedLosses.push(ppN);
      var _pStop = _liveA && _elPlanIsStop(s, _ai.alpha, _ai.cutLine);
      if (_pStop) planHasStop = true;
      planCapSum += _pStop ? _elCapLossYen(_ai.cutLine) : ppN;
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
      if ((s.holdExp === "×" || s.holdExp === "損切り済") && ppN != null) {
        sumHold += ppN; holdHasData = true;           // 期待度×→想定額を本合計に算入（想定で手仕舞い）
        sumHoldRef += (_hCapH - ppN); holdRefCnt++;   // H1結果との差を参考（H1まで保有した場合）
      } else {
        sumHold += _hCapH; holdHasData = true;        // 未設定/○/△/損切り/×(想定額無) は本合計に算入
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
    if ((s.hold2Exp === "○" || s.hold2Exp === "△") && _elHas2Data(s) && !_elH2Miss(s, _liveA ? _ai.alpha : null)) {
      var _h2 = _h2sig(s);
      var hp2 = _liveA ? _elDynHold2(s, _ai.alpha, _ai.cutLine) : _elSignedVal(_h2.holdPnl, _h2.holdPnlSign);
      if (hp2 != null) {
        var hp2N = _liveA ? Math.round(hp2) : _per100(hp2);
        var _h2Stop = _liveA && _elHoldIsStop(_h2, _ai.alpha, _ai.cutLine);
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
    avgWin: avgWin, avgLoss: avgLoss, expected: expected,
    sumPnl: sumPnl, sumPlanned: sumPlanned, sumMax: sumMax,
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
  var sz = size || 16;
  var gs = _GRADE_STYLE.Q;
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" } },
    React.createElement("span", { title: "E基準未達のため非表示",
      style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: sz, height: sz,
        borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border,
        fontWeight: 800, fontSize: Math.round(sz * 0.6), flexShrink: 0 } }, "Q"),
    React.createElement("span", { style: { color: "#888" } }, "ー")
  );
}
// その集計行の全記録がE基準未達(全miss)で損益が0の場合のセル表示「Ⓠ 0」（Qをランク風に〇で囲む）。
function _qZeroCell(size) {
  var sz = size || 16;
  var gs = _GRADE_STYLE.Q;
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" } },
    React.createElement("span", { title: "全記録がE基準未達のため損益0",
      style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: sz, height: sz,
        borderRadius: "50%", background: gs.bg, color: gs.color, border: "1px solid " + gs.border,
        fontWeight: 800, fontSize: Math.round(sz * 0.6), flexShrink: 0 } }, "Q"),
    React.createElement("span", { style: { color: "#888", fontWeight: 700 } }, "0円")
  );
}
// 集計行が全miss(E基準未達)かを判定。recs各記録を行セルと同じαで _elDynResult し全て"miss"ならtrue。
function _elAllMissRow(recs, alphaOf, cutOf) {
  if (!recs || recs.length === 0) return false;
  for (var _i = 0; _i < recs.length; _i++) {
    var _r = recs[_i];
    if (_elDynResult(_r.signal, alphaOf(_r), cutOf(_r)) !== "miss") return false;
  }
  return true;
}
// _elCalcStats の結果から全miss(E基準未達)集計かを判定（statsの想定/H1/H2合計と同じαで算出済み）。
function _elStatAllMiss(st) { return !!st && st.total > 0 && st.miss === st.total; }

function _elCalcChartGrades(signals, alpha, cutLine) {
  var _fixedA = alpha != null;  // α固定指定。null=各記録の採用α値(signal.alphaVal)で実計算
  var _c = (cutLine != null ? cutLine : 10);
  var realSum = 0, planSum = 0, holdSum = 0;
  var realCount = 0, planCount = 0, holdCount = 0;
  var planSumAB = 0, planCountAB = 0;
  var planCapSum = 0, holdCapSum = 0, planHasStop = false, holdHasStop = false;
  var holdSumPlanCap = 0, holdSumPlanCapAB = 0, holdCountAB = 0;
  var holdRefSum = 0, holdRefCnt = 0;  // 期待度×（参考扱い・H1本合計から除外）
  var hold2Sum = 0, hold2Count = 0, hold2RefSum = 0, hold2RefCnt = 0;
  var _missCnt = 0, _totCnt = 0;  // 全miss(E基準未達)判定用
  var osVals = [], confVals = [], holdConfVals = [];
  (signals || []).forEach(function(sig) {
    var s = _compatSignal(sig);
    var _aSig = _fixedA ? alpha : (s.alphaVal != null ? Number(s.alphaVal) : _gradeAlpha(s.difficulty));
    var isAB = s.difficulty === "A" || s.difficulty === "B";
    _totCnt++;
    if (_elDynResult(s, _aSig, _c) === "miss") _missCnt++;
    if (_elIsEntered(s, null)) {
      realCount++;
      var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
      if (rv != null) realSum += rv;
    }
    var pv = _elDynPlanned(s, _aSig, _c);
    if (pv != null) {
      planSum += pv; planCount++;
      if (isAB) { planSumAB += pv; planCountAB++; }
      var _pStop = _elPlanIsStop(s, _aSig, _c);
      if (_pStop) planHasStop = true;
      planCapSum += _pStop ? _elCapLossYen(_c) : pv;
    }
    var hv = _elDynHold(s, _aSig, _c);
    // 想定もH1もE基準未達(両miss=ノートレード)は想定損益が0なので、H1も0円扱いにして揃える（早見表で「—」でなく「0円」表示）。
    if (hv == null && _elH2Miss(s, _aSig)) hv = 0;
    if (hv != null) {
      holdSum += hv; holdCount++;
      var _hStop = _elHoldIsStop(s, _aSig, _c);
      if (_hStop) holdHasStop = true;
      holdCapSum += _hStop ? _elCapLossYen(_c) : hv;
      // 結果損益: 想定が損切りの行は想定額にキャップ（損切を踏まえた値）。
      var _hCapPlan = (_elPlanIsStop(s, _aSig, _c) && pv != null) ? pv : hv;
      if ((s.holdExp === "×" || s.holdExp === "損切り済") && pv != null) {
        holdSumPlanCap += pv;                          // 期待度×→想定額を本合計に算入
        if (isAB) { holdSumPlanCapAB += pv; holdCountAB++; }
        holdRefSum += (_hCapPlan - pv); holdRefCnt++;  // H1結果との差を参考（H1まで保有した場合）
      } else {
        holdSumPlanCap += _hCapPlan;
        if (isAB) { holdSumPlanCapAB += _hCapPlan; holdCountAB++; }
      }
    }
    var _h2tg = _elHold2TotParts(s, _aSig, _c);  // 想定損切り→想定額(結果損益)、非損切り○/△→_elDynHold2、非損切り×→参考
    if (_h2tg.main != null) { hold2Sum += _h2tg.main; hold2Count++; }
    else if (_elH2Miss(s, _aSig)) { hold2Count++; }  // 両miss=ノートレードはH2も0円扱い（想定0と一致）
    if (_h2tg.ref != null) { hold2RefSum += _h2tg.ref; hold2RefCnt++; }
    if (s.osVal != null) osVals.push(Number(s.osVal));
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
    allMiss: (_totCnt > 0 && _missCnt === _totCnt),
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
    { key: "plan", label: "想", fullLabel: "想定損益",    abKey: null },
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
    charts[ck] = Object.assign({}, c, { signals: signals });
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
              type: "text", inputMode: "numeric", min: "0", max: "30", step: "1", value: aStr,
              onChange: function(e) {
                var v = _toHankaku(e.target.value);
                if (v !== "") { var _vn = Number(v); if (!isNaN(_vn)) { if (_vn > 30) _vn = 30; if (_vn < 0) _vn = 0; v = String(_vn); } }
                setAlphaByStock(function(prev) { var n = Object.assign({}, prev); n[stock] = v; return n; });
              },
              placeholder: "0〜30",
              style: { width: 64, fontSize: 12, border: "none", outline: "none", background: "#fff", padding: "3px 6px", textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(
              function() { setAlphaByStock(function(prev) { var n = Object.assign({}, prev); n[stock] = String(Math.min(30, (parseFloat(prev[stock]||"5")||0) + 1)); return n; }); },
              function() { setAlphaByStock(function(prev) { var n = Object.assign({}, prev); n[stock] = String(Math.max(0, (parseFloat(prev[stock]||"5")||0) - 1)); return n; }); }
            )
          ),
          React.createElement("span", { style: { fontSize: 11, color: "#666" } }, "円"),
          React.createElement("span", { style: { fontSize: 10, color: "#888" } }, "→ 想定"),
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

  var initSig = isEdit ? initial.signal : {};
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
  
  var _useStateHOC = useState(initSig.holdOsConf != null ? Number(initSig.holdOsConf) : null),
    _useStateHOCA = _slicedToArray(_useStateHOC, 2),
    fHoldOsConf = _useStateHOCA[0], setFHoldOsConf = _useStateHOCA[1];
  
  var _useStateHWS = useState(initSig.holdWidthSign || null),
    _useStateHWSA = _slicedToArray(_useStateHWS, 2),
    fHoldWidthSign = _useStateHWSA[0], setFHoldWidthSign = _useStateHWSA[1];
  var _useStateHWV = useState(initSig.holdWidth != null ? String(Math.abs(Number(initSig.holdWidth))) : ""),
    _useStateHWVA = _slicedToArray(_useStateHWV, 2),
    fHoldWidthVal = _useStateHWVA[0], setFHoldWidthVal = _useStateHWVA[1];
  var _useStateHHS = useState(initSig.holdHighSign || null),
    _useStateHHSA = _slicedToArray(_useStateHHS, 2),
    fHoldHighSign = _useStateHHSA[0], setFHoldHighSign = _useStateHHSA[1];
  var _useStateHHV = useState(initSig.holdHighVal != null ? String(Math.abs(Number(initSig.holdHighVal))) : ""),
    _useStateHHVA = _slicedToArray(_useStateHHV, 2),
    fHoldHighVal = _useStateHHVA[0], setFHoldHighVal = _useStateHHVA[1];
  var _useStateHExp = useState(initSig.holdExp || null),
    _useStateHExpA = _slicedToArray(_useStateHExp, 2),
    fHoldExp = _useStateHExpA[0], setFHoldExp = _useStateHExpA[1];

  // === Hold2（H2）state — Hold1と同一構成 + 期待度(hold2Exp) ===
  var _useStateH2Exp = useState(initSig.hold2Exp || null),
    _useStateH2ExpA = _slicedToArray(_useStateH2Exp, 2),
    fHold2Exp = _useStateH2ExpA[0], setFHold2Exp = _useStateH2ExpA[1];
  var _useStateH2HP = useState(initSig.hold2Profit || null),
    _useStateH2HPA = _slicedToArray(_useStateH2HP, 2),
    fHold2Profit = _useStateH2HPA[0], setFHold2Profit = _useStateH2HPA[1];
  var _useStateH2PS = useState(initSig.hold2PnlSign || null),
    _useStateH2PSA = _slicedToArray(_useStateH2PS, 2),
    fHold2PnlSign = _useStateH2PSA[0], setFHold2PnlSign = _useStateH2PSA[1];
  var _useStateH2PV = useState(initSig.hold2Pnl != null ? String(Math.abs(Number(initSig.hold2Pnl))) : ""),
    _useStateH2PVA = _slicedToArray(_useStateH2PV, 2),
    fHold2PnlVal = _useStateH2PVA[0], setFHold2PnlVal = _useStateH2PVA[1];
  var _useStateH2OC = useState(initSig.hold2OsConf != null ? Number(initSig.hold2OsConf) : null),
    _useStateH2OCA = _slicedToArray(_useStateH2OC, 2),
    fHold2OsConf = _useStateH2OCA[0], setFHold2OsConf = _useStateH2OCA[1];
  var _useStateH2WS = useState(initSig.hold2WidthSign || null),
    _useStateH2WSA = _slicedToArray(_useStateH2WS, 2),
    fHold2WidthSign = _useStateH2WSA[0], setFHold2WidthSign = _useStateH2WSA[1];
  var _useStateH2WV = useState(initSig.hold2Width != null ? String(Math.abs(Number(initSig.hold2Width))) : ""),
    _useStateH2WVA = _slicedToArray(_useStateH2WV, 2),
    fHold2WidthVal = _useStateH2WVA[0], setFHold2WidthVal = _useStateH2WVA[1];
  var _useStateH2HS = useState(initSig.hold2HighSign || null),
    _useStateH2HSA = _slicedToArray(_useStateH2HS, 2),
    fHold2HighSign = _useStateH2HSA[0], setFHold2HighSign = _useStateH2HSA[1];
  var _useStateH2HV = useState(initSig.hold2HighVal != null ? String(Math.abs(Number(initSig.hold2HighVal))) : ""),
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
  var _useStateAV = useState(initSig.alphaVal != null ? String(initSig.alphaVal) : ""),
    _useStateAVA = _slicedToArray(_useStateAV, 2),
    fAlphaVal = _useStateAVA[0], setFAlphaVal = _useStateAVA[1];

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
  var _signedFromState = function(valStr, mul) { return (valStr === "" || valStr == null) ? null : mul * Math.abs(Number(valStr) || 0); };
  _oscSignedRef.current = _signedFromState(fOsConfVal,  fOsConfSign === "+" ? 1 : fOsConfSign === "-" ? -1 : 0);
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



  
  var _fAlpha = (fAlphaVal !== "" && !isNaN(Number(fAlphaVal))) ? Number(fAlphaVal) : _gradeAlpha(fDifficulty);
  var _fCutLine = (function() {
    var _ck = fStock + "_" + fDate;
    var _cd = data.charts && data.charts[_ck];
    return (_cd != null && _cd.cutLine != null) ? _cd.cutLine : 10;
  })();

  var _fMiss = (_fAlpha != null && Number(fOsVal) >= 0 && Number(fOsVal) < _fAlpha);
  var _fHoldHighOverA = (_fAlpha != null && fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) || 0) >= _fAlpha);
  // H1までE基準未達でもHold2期待度欄・Hold2欄は表示して入力可能にする（表側は _elH2Miss が従来どおり「ー（H１までE基準未達）」表示）
  var _fH2Hidden = false;
  // H1までE基準未達(想定<α かつ H1高値もα未達)→H2見出し横に「非考慮」注記を出す。条件が外れれば自動で消える（表側 _elH2Miss と同条件・分析でも除外）。
  var _fH2NonConsider = (_fMiss && !_fHoldHighOverA);
  var _fMissEl = React.createElement("span", {
    style: { display: "inline-block", padding: "5px 14px", fontSize: 13, fontWeight: 700,
      color: "#B45309", background: "#FEF3C7", borderRadius: 6, border: "1px solid #FCD34D" }
  }, "E基準未達のため非表示");
  var _fH2MissEl = React.createElement("span", {
    style: { display: "inline-block", padding: "5px 14px", fontSize: 13, fontWeight: 700,
      color: "#B45309", background: "#FEF3C7", borderRadius: 6, border: "1px solid #FCD34D" }
  }, "H１までE基準未達のため非表示");

  
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
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fOsConfSign, fOsConfVal, fOsVal]);

  
  
  
  
  
  
  
  useEffect(function() {
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
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fOsVal, fOsConfSign, fOsConfVal]);

  
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
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fHoldWidthSign, fHoldWidthVal, fHoldHighSign, fHoldHighVal, fResult]);

  
  useEffect(function() {
    if (fHoldExp === "損切り済") return;  // 損切り済の間はH1損益変化を自動計算で上書きしない（stopロックは別effectが担当）
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
      if (fHoldPnlVal === "") return;
      if (sHold > 0) setFHoldProfit("yes");
      else if (sHold < 0) setFHoldProfit("no");
      else setFHoldProfit("none");
      return;
    }
    if (sPlan === 0) return;
    
    if (sHold === 0) {
      if (fHoldPnlVal === "") return; 
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
  }, [fResult, fPlan, fPlanSign, fHoldPnlVal, fHoldPnlSign, fHoldExp, _fAlpha, fHoldHighSign, fHoldHighVal]);

  // === Hold2(H2) 自動計算（H1と同一ロジック） ===
  useEffect(function() {
    var _av = _fAlpha;
    if (_av == null || fHold2WidthSign == null || fHold2WidthVal === "") return;
    var _hwSigned = fHold2WidthSign === "+" ? Number(fHold2WidthVal) : -Number(fHold2WidthVal);
    var _newOsConf = _av - _hwSigned;
    if (_newOsConf !== fHold2OsConf) setFHold2OsConf(_newOsConf);
  }, [fStock, fDate, data, _fAlpha, fHold2WidthSign, fHold2WidthVal]);

  useEffect(function() {
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
    // 想定損益またはH1で既に損切りの場合、H2には損切りルールを適用しない（値幅から算出し、損益変化はH1損益との純粋比較で選ばせる）。それ以外はH2にも損切りルール適用。
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
  }, [fStock, fDate, data, _fAlpha, _fCutLine, fHold2WidthSign, fHold2WidthVal, fHold2HighSign, fHold2HighVal, fResult, fOsVal, fHoldHighSign, fHoldHighVal]);

  useEffect(function() {
    // H2期待度が「損切り済」の間は損益変化も「損切り済(stop)」を自動選択。損切り済でなくなれば普段通りの自動選択へ戻す。
    if (fHold2Exp === "損切り済") { setFHold2Profit("stop"); return; }
    var _h1RA2 = (_fAlpha != null && fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) || 0) >= _fAlpha);
    if (fResult === "miss" && !_h1RA2) { setFHold2Profit("miss"); return; }  // H1までE基準未達（想定+H1未達）→ 未達
    // H2の損益変化は「H1の結果損益」との比較。
    if (fHold2PnlVal === "") { setFHold2Profit(function(_p){ return _p === "stop" ? null : _p; }); return; }
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
  }, [fHoldPnlVal, fHoldPnlSign, fHold2PnlVal, fHold2PnlSign, fHold2Exp, fResult, fHoldHighSign, fHoldHighVal, fHold2HighSign, fHold2HighVal, _fAlpha]);

  // 想定損益 or H1の結果損益が損切り → H2期待度を「損切り済」に自動選択（その後ユーザーは○/△/×に変更可）。
  // 損切り状態に入った時に1回だけ設定。損切りでなくなったら「損切り済」のままの時のみ解除。
  var _h2StopAutoRef = useRef(false);
  useEffect(function() {
    var _psAuto = (_fAlpha != null && Number(fOsVal) >= 0 && (Number(fOsVal) - _fAlpha) >= _fCutLine);
    var _h1sAuto = (_fAlpha != null && fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) - _fAlpha) >= _fCutLine);
    if (_psAuto || _h1sAuto) {
      if (!_h2StopAutoRef.current) { _h2StopAutoRef.current = true; setFHold2Exp("損切り済"); }
    } else if (_h2StopAutoRef.current) {
      _h2StopAutoRef.current = false;
      setFHold2Exp(function(prev) { return prev === "損切り済" ? null : prev; });
    }
  }, [fOsVal, fHoldHighSign, fHoldHighVal, _fAlpha, _fCutLine]);

  // 想定損益が損切り → H1期待度を「損切り済」に自動選択。H1自身が初めて損切りの場合は自動にせず手動（ユーザー判断）。
  var _hExpStopAutoRef = useRef(false);
  useEffect(function() {
    var _psAuto = (_fAlpha != null && Number(fOsVal) >= 0 && (Number(fOsVal) - _fAlpha) >= _fCutLine);
    if (_psAuto) {
      if (!_hExpStopAutoRef.current) { _hExpStopAutoRef.current = true; setFHoldExp("損切り済"); }
    } else if (_hExpStopAutoRef.current) {
      _hExpStopAutoRef.current = false;
      setFHoldExp(function(prev) { return prev === "損切り済" ? null : prev; });
    }
  }, [fOsVal, _fAlpha, _fCutLine]);

  // H1期待度が「損切り済」の間は損益変化(fHoldProfit)も「損切り済(stop)」を自動選択（H2と同仕様）。
  var _hpStopAutoRef = useRef(false);
  useEffect(function() {
    if (fHoldExp === "損切り済") {
      if (!_hpStopAutoRef.current) { _hpStopAutoRef.current = true; setFHoldProfit("stop"); }
    } else if (_hpStopAutoRef.current) {
      _hpStopAutoRef.current = false;
      setFHoldProfit(function(prev) { return prev === "stop" ? null : prev; });
    }
  }, [fHoldExp]);


  var itemCandidates = _elGetItemCandidates(data, fDate, fStock);

  var handleSave = function() {
    
    _fiFlushAll();
    var sig = {
      id: isEdit ? initSig.id : _sigId(),
      tag: fTags.length > 0 ? fTags[0] : (fIsCustom ? "__custom__" : ""),
      tags: fTags,
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
      entryOsSign: fEntered ? (fEntryOsSign || null) : null,
      entryOsVal: fEntered && fEntryOsVal !== "" ? Number(fEntryOsVal) : null,
      exitOsSign: fEntered ? (fExitOsSign || null) : null,
      exitOsVal: fEntered && fExitOsVal !== "" ? Number(fExitOsVal) : null,
      shares: fEntered && fShares !== "" ? (parseInt(fShares) || null) : null,
      tradeAlpha: fEntered && fTradeAlpha !== "" && !isNaN(Number(fTradeAlpha)) ? Number(fTradeAlpha) : null,
      alphaVal: fAlphaVal !== "" && !isNaN(Number(fAlphaVal)) ? Number(fAlphaVal) : null,
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
      style: { background: "#fff", borderRadius: 12, padding: 20, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }
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
      
      React.createElement("div", { style: SH_ }, "🎯 エントリーシグナル"),
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 } },
        signalTags.map(function(t) {
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
          }, t);
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
      fIsCustom && React.createElement(FastInput, {
        type: "text",
        value: fCustomText,
        onChange: function(v) { setFCustomText(v); },
        placeholder: "",
        style: Object.assign({}, I, { marginBottom: 6 })
      }),
      
      React.createElement("div", { style: SH_ }, "\u4E88\u60F3OS\u5EA6"),
      React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 4 } }, "\u4E88\u60F3OS\u5024\u306E\u5E2F\uFF08A:20\u5186\u301C / B:15\u301C19\u5186 / C:10\u301C14\u5186 / D:5\u301C9\u5186 / E:0\u301C4\u5186\uFF09\u3002\u03B1\u5024\u306F\u81EA\u52D5: A\u219220 / B\u219215 / C\u219210 / D\u21925 / E\u21920"),
      React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8 } },
        ["A", "B", "C", "D", "E"].map(function(val) {
          var on = fDifficulty === val;
          return React.createElement("button", {
            key: val,
            onClick: function() {
              if (on) { setFDifficulty(""); setFAlphaVal(""); }
              else { setFDifficulty(val); setFAlphaVal(String(_gradeAlpha(val))); }
            },
            style: {
              flex: 1, padding: "10px 12px", fontSize: 14, fontWeight: on ? 800 : 700,
              border: on ? "2px solid #1a1a1a" : "1px solid #ddd",
              background: on ? "#f3f4f6" : "#fff",
              color: "#1a1a1a",
              borderRadius: 6, cursor: "pointer", textAlign: "center"
            }
          }, val);
        })
      ),
      
      React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 2, marginBottom: 6 } },
      (function() {
        var _setAV = function(val) {
          var _v = _toHankakuNum(val);
          if (_v === "") { setFAlphaVal(""); return; }
          var n = Number(_v);
          if (isNaN(n)) return;
          if (n > 30) n = 30; if (n < 0) n = 0;
          setFAlphaVal(String(n));
        };
        var _stepAV = function(delta) {
          var base = (fAlphaVal !== "" && !isNaN(Number(fAlphaVal))) ? Number(fAlphaVal) : _gradeAlpha(fDifficulty);
          var n = base + delta;
          if (n > 30) n = 30; if (n < 0) n = 0;
          setFAlphaVal(String(n));
        };
        return React.createElement("div", {
          style: { display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 6, background: "#F0F9FF",
            border: "1px solid #BAE6FD", fontSize: 12 }
        },
          React.createElement("span", { style: { color: "#555", fontWeight: 600 } }, "採用α値（水準線比）"),
          React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #BAE6FD", borderRadius: 4, overflow: "hidden" } },
            React.createElement("input", {
              type: "text", inputMode: "numeric", min: "0", max: "30", step: "1",
              value: fAlphaVal !== "" ? fAlphaVal : (fDifficulty ? String(_gradeAlpha(fDifficulty)) : ""),
              onChange: function(e) { _setAV(e.target.value); },
              placeholder: "各記録",
              style: { padding: "3px 6px", fontSize: 13, fontWeight: 800, color: "#0C4A6E",
                       border: "none", outline: "none", background: "#fff", width: 64,
                       textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(
              function() { _stepAV(1); },
              function() { _stepAV(-1); }
            )
          ),
          React.createElement("span", { style: { fontSize: 12, color: "#64748B" } }, "円")
        );
      })(),

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
      })()
      ),

      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16, marginTop: 4, marginBottom: 4, flexWrap: "wrap" } },
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
      
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } },
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
      
      React.createElement("div", { style: { marginTop: 6, marginBottom: 2 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 12, color: "#666", fontWeight: 600 } },
            "想定値幅",
            React.createElement("span", { style: { fontSize: 12, color: "#aaa", fontWeight: 400 } }, "（α値ー確定値）")
          ),
          _estWidthIsOsLow
            ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 80, padding: "5px 10px", fontSize: 14, fontWeight: 700, color: "#aaa", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fafafa" } }, "ー")
            : React.createElement("div", {
            style: { display: "flex", alignItems: "center", border: "1px solid " + (fEstWidthSign === "+" ? "#1E8449" : fEstWidthSign === "-" ? "#C0392B" : "#ccc"), borderRadius: 6, overflow: "hidden" }
          },
            React.createElement("button", {
              onClick: function() {
                setFEstWidthSign(fEstWidthSign === "-" ? "+" : fEstWidthSign === "+" ? null : "-");
              },
              style: { padding: "5px 10px", fontSize: 13, fontWeight: fEstWidthSign ? 700 : 400,
                border: "none", borderRight: "1px solid " + (fEstWidthSign === "+" ? "#1E8449" : fEstWidthSign === "-" ? "#C0392B" : "#ccc"),
                background: fEstWidthSign === "+" ? "#EAF3DE" : fEstWidthSign === "-" ? "#FCEBEB" : "#f5f4f0",
                color: fEstWidthSign === "+" ? "#1E8449" : fEstWidthSign === "-" ? "#C0392B" : "#999",
                cursor: "pointer", minWidth: 36, flexShrink: 0 }
            }, fEstWidthSign === "-" ? "↑" : fEstWidthSign === "+" ? "↓" : "↕"),
            React.createElement("input", {
              type: "text", inputMode: "numeric", step: "1",
              value: fEstWidthVal,
              onChange: function(e) { var _hk = _toHankakuNum(e.target.value); setFEstWidthVal(_hk === "" ? "" : String(Math.abs(Number(_hk) || 0))); },
              placeholder: "0",
              style: { border: "none", outline: "none", padding: "5px 8px", fontSize: 13, background: "#fff", width: 80, textAlign: "right", boxSizing: "border-box" }
            }),
            _stepBtn(
              function() { _applySigned(_ewSignedRef, 1, "-", "+", setFEstWidthVal, setFEstWidthSign); },
              function() { _applySigned(_ewSignedRef, -1, "-", "+", setFEstWidthVal, setFEstWidthSign); }
            )
          ),
          React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
          _estWidthIsOsLow
            ? React.createElement("span", { style: { fontSize: 11, color: "#b07050", marginLeft: 4 } }, "∵OS値がα未満のため")
            : null
        )
      ),
      
      React.createElement("div", { style: { marginBottom: 8 } },
        React.createElement("div", { style: { fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 4 } }, "想定損益（100株換算）"),
        _fMiss ? _fMissEl : React.createElement("span", {
          style: {
            display: "inline-block", padding: "5px 14px",
            fontSize: 15, fontWeight: 800,
            color: fPlanSign === "+" ? "#C0392B" : fPlanSign === "-" ? "#1E8449" : "#555",
            background: fPlanSign === "+" ? "#FCEBEB" : fPlanSign === "-" ? "#EAF3DE" : "#f5f5f5",
            borderRadius: 6, border: "1px solid " + (fPlanSign === "+" ? "#F5B7B1" : fPlanSign === "-" ? "#A9DFBF" : "#ddd"),
            minWidth: 80, textAlign: "right"
          }
        }, fPlan === "0" ? "0円" : fPlan ? (fPlanSign === "-" ? "−" : "+") + fPlan + "円" : "—"),
        (!_fMiss && Number(fOsVal) > 0 && (Number(fOsVal) - _fAlpha) >= _fCutLine)
          ? _elCapNote(_fCutLine, { fontSize: 15, circle: 16, style: { justifyContent: "flex-start", marginTop: 3 } }) : null
      ),
      React.createElement("div", { style: { marginBottom: 8 } },
        React.createElement("div", { style: { fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 4 } },
          "Hold1期待度",
          React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "（○か△か×／想定orH1損切り時は「損切り済」自動）")),
        React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } },
          [["○", "#1E8449", "#EAF3DE"], ["△", "#B45309", "#FEF3C7"], ["×", "#C0392B", "#FCEBEB"], ["損切り済", "#6B7280", "#F3F4F6"]].map(function(kv) {
            var on = fHoldExp === kv[0];
            return React.createElement("button", {
              key: kv[0],
              onClick: function() { setFHoldExp(on ? null : kv[0]); },
              style: {
                padding: "5px 16px", fontSize: kv[0].length > 1 ? 12 : 15, fontWeight: 800, borderRadius: 5, cursor: "pointer",
                border: on ? "1.5px solid " + kv[1] : "1px solid #ddd",
                background: on ? kv[2] : "#fff",
                color: on ? kv[1] : "#bbb"
              }
            }, kv[0]);
          })
        )
      ),
      React.createElement("div", { style: { marginBottom: 8 } },
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
      ),

      React.createElement("div", { style: Object.assign({}, SH_, { display: "flex", alignItems: "center", gap: 8 }) },
        "Hold１"
      ),
      React.createElement("div", {
        style: { marginBottom: 8, padding: "8px 10px", borderRadius: 6, background: "#F8F9FA", border: "1px solid #e5e5e5" }
      },

        React.createElement("div", { style: { marginBottom: 8 } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" } },
            React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 600, whiteSpace: "nowrap" } }, "ホールド足高値（水準線比）"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center", border: "1px solid " + (fHoldHighSign === "+" ? "#1E8449" : fHoldHighSign === "-" ? "#C0392B" : "#ccc"), borderRadius: 6, overflow: "hidden" }
            },
              React.createElement("button", {
                onClick: function() {
                  setFHoldHighSign(fHoldHighSign === "-" ? "+" : fHoldHighSign === "+" ? null : "-");
                },
                style: { padding: "5px 10px", fontSize: 13, fontWeight: fHoldHighSign ? 700 : 400, cursor: "pointer", minWidth: 36, flexShrink: 0,
                  border: "none", borderRight: "1px solid " + (fHoldHighSign === "+" ? "#1E8449" : fHoldHighSign === "-" ? "#C0392B" : "#ccc"),
                  background: fHoldHighSign === "+" ? "#EAF3DE" : fHoldHighSign === "-" ? "#FCEBEB" : "#f5f4f0",
                  color: fHoldHighSign === "+" ? "#1E8449" : fHoldHighSign === "-" ? "#C0392B" : "#999" }
              }, fHoldHighSign === "-" ? "↑" : fHoldHighSign === "+" ? "↓" : "↕"),
              React.createElement("input", {
                type: "text", inputMode: "numeric", step: "1",
                value: fHoldHighVal,
                onChange: function(e) {
                  var _hk = _toHankakuNum(e.target.value); var _v = _hk === "" ? "" : String(Math.abs(Number(_hk) || 0));
                  setFHoldHighVal(_v);
                },
                placeholder: "0",
                style: { border: "none", outline: "none", padding: "5px 8px", fontSize: 13, background: "#fff", width: 80, textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { _applySigned(_hhSignedRef, 1, "-", "+", setFHoldHighVal, setFHoldHighSign); },
                function() { _applySigned(_hhSignedRef, -1, "-", "+", setFHoldHighVal, setFHoldHighSign); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
            (function() {
              if (fHoldHighVal === "") return null;
              var _ck3 = fStock + "_" + fDate;
              var _cd3 = data.charts && data.charts[_ck3];
              var _av3 = _fAlpha;
              if (_av3 == null) return null;
              var _shhv = fHoldHighSign === "-" ? (Number(fHoldHighVal) || 0) : fHoldHighSign === "+" ? -(Number(fHoldHighVal) || 0) : 0;
              var _diff = _shhv - _av3;
              var _isUp = _diff > 0, _isDn = _diff < 0;
              return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, marginLeft: 4 } },
                React.createElement("span", { style: { fontSize: 10, color: "#aaa" } }, "α値比"),
                React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: _isUp ? "#C0392B" : _isDn ? "#1E8449" : "#999" } },
                  (_isUp ? "↑" : _isDn ? "↓" : "↕") + Math.abs(_diff) + "円")
              );
            })()
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 } },
            React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 600 } }, "ホールド足確定値(水準線比)"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center", border: "1px solid " + (fHoldWidthSign === "+" ? "#1E8449" : fHoldWidthSign === "-" ? "#C0392B" : "#ccc"), borderRadius: 6, overflow: "hidden" }
            },
              React.createElement("button", {
                onClick: function() {
                  var _newSg = fHoldWidthSign === "-" ? "+" : fHoldWidthSign === "+" ? null : "-";
                  setFHoldWidthSign(_newSg);
                  var _ck2 = fStock + "_" + fDate;
                  var _cd2 = data.charts && data.charts[_ck2];
                  var _av2 = _fAlpha;
                  if (_av2 != null && fHoldWidthVal !== "") {
                    var _ws = _newSg === "-" ? -(Number(fHoldWidthVal)||0) : (Number(fHoldWidthVal)||0);
                    setFHoldOsConf(_av2 - _ws);
                  }
                },
                style: { padding: "5px 10px", fontSize: 13, fontWeight: fHoldWidthSign ? 700 : 400, cursor: "pointer", minWidth: 36, flexShrink: 0,
                  border: "none", borderRight: "1px solid " + (fHoldWidthSign === "+" ? "#1E8449" : fHoldWidthSign === "-" ? "#C0392B" : "#ccc"),
                  background: fHoldWidthSign === "+" ? "#EAF3DE" : fHoldWidthSign === "-" ? "#FCEBEB" : "#f5f4f0",
                  color: fHoldWidthSign === "+" ? "#1E8449" : fHoldWidthSign === "-" ? "#C0392B" : "#999" }
              }, fHoldWidthSign === "-" ? "↑" : fHoldWidthSign === "+" ? "↓" : "↕"),
              React.createElement("input", {
                type: "text", inputMode: "numeric", step: "1",
                value: fHoldWidthVal,
                onChange: function(e) {
                  var _hk = _toHankakuNum(e.target.value); var _v = _hk === "" ? "" : String(Math.abs(Number(_hk) || 0));
                  setFHoldWidthVal(_v);
                  var _ck2 = fStock + "_" + fDate;
                  var _cd2 = data.charts && data.charts[_ck2];
                  var _av2 = _fAlpha;
                  if (_av2 != null && _v !== "" && fHoldWidthSign != null) {
                    var _ws = fHoldWidthSign === "-" ? -(Number(_v)||0) : (Number(_v)||0);
                    setFHoldOsConf(_av2 - _ws);
                  }
                },
                placeholder: "0",
                style: { border: "none", outline: "none", padding: "5px 8px", fontSize: 13, background: "#fff", width: 80, textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { _applySigned(_hwSignedRef, 1, "-", "+", setFHoldWidthVal, setFHoldWidthSign, _hwAfter); },
                function() { _applySigned(_hwSignedRef, -1, "-", "+", setFHoldWidthVal, setFHoldWidthSign, _hwAfter); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円")
          ),
        ),
        
        React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" } },
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } },
              "結果損益",
              React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "100株換算")),
            (_fMiss && !_fHoldHighOverA) ? _fMissEl : (Number(fOsVal) > 0 && (Number(fOsVal) - _fAlpha) >= _fCutLine) ? React.createElement("span", { style: { display: "inline-block", padding: "5px 14px", fontSize: 14, fontWeight: 800, color: "#6B7280", background: "#F3F4F6", borderRadius: 6, border: "1px solid #ddd", minWidth: 80, textAlign: "center" } }, "損切り済") : React.createElement("span", {
              style: {
                display: "inline-block", padding: "5px 14px",
                fontSize: 14, fontWeight: 800,
                color: fHoldPnlSign === "+" ? "#C0392B" : fHoldPnlSign === "-" ? "#1E8449" : "#555",
                background: fHoldPnlSign === "+" ? "#FCEBEB" : fHoldPnlSign === "-" ? "#EAF3DE" : "#f5f5f5",
                borderRadius: 6, border: "1px solid " + (fHoldPnlSign === "+" ? "#F5B7B1" : fHoldPnlSign === "-" ? "#A9DFBF" : "#ddd"),
                minWidth: 80, textAlign: "right"
              }
            }, fHoldPnlVal === "0" ? "0円" : fHoldPnlVal ? (fHoldPnlSign === "-" ? "−" : "+") + Number(fHoldPnlVal).toLocaleString() + "円" : "—"),
            ((fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) - _fAlpha) >= _fCutLine) || (Number(fOsVal) > 0 && (Number(fOsVal) - _fAlpha) >= _fCutLine))
              ? _elCapNote(_fCutLine, { fontSize: 14, circle: 15, style: { justifyContent: "flex-start", marginTop: 3 } }) : null
          ),
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } }, "損益変化"),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } },
              [["○ 利益+", "yes", "#C0392B", "#FCEBEB"], ["△ 利益-", "mid", "#B45309", "#FEF3C7"], ["ー 変化なし", "none", "#6B7280", "#F3F4F6"], ["× 損失", "no", "#1E8449", "#EAF3DE"], ["損切り済", "stop", "#6B7280", "#F3F4F6"], ["未達", "miss", "#B45309", "#FEF3C7"]].map(function(kv) {
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

        _fH2Hidden ? null : React.createElement("div", { style: { marginTop: 10, paddingTop: 8, borderTop: "1px dashed #ddd" } },
          React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } },
            "Hold2期待度",
            React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "（○か△か×でHold2欄が出ます／想定orH1損切り時は「損切り済」自動）")),
          React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } },
            [["○", "#1E8449", "#EAF3DE"], ["△", "#B45309", "#FEF3C7"], ["×", "#C0392B", "#FCEBEB"], ["損切り済", "#6B7280", "#F3F4F6"]].map(function(kv) {
              var on = fHold2Exp === kv[0];
              return React.createElement("button", {
                key: kv[0],
                onClick: function() { setFHold2Exp(on ? null : kv[0]); },
                style: {
                  padding: "5px 16px", fontSize: kv[0].length > 1 ? 12 : 15, fontWeight: 800, borderRadius: 5, cursor: "pointer",
                  border: on ? "1.5px solid " + kv[1] : "1px solid #ddd",
                  background: on ? kv[2] : "#fff",
                  color: on ? kv[1] : "#bbb"
                }
              }, kv[0]);
            })
          )
        ),

        React.createElement("div", { style: { marginTop: 10 } },
          React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } }, "Hold１メモ"),
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

      _fH2Hidden ? null : React.createElement("div", { style: Object.assign({}, SH_, { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }) }, "Hold２",
        _fH2NonConsider ? React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#B45309", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" } }, "※H１までE基準未達のため、非考慮") : null
      ),
      _fH2Hidden ? null : React.createElement("div", {
        style: { marginBottom: 8, padding: "8px 10px", borderRadius: 6, background: "#F4F6F8", border: "1px solid " + (fHold2Exp === "×" ? "#e3c9c9" : "#cfe0d2") }
      },

        React.createElement("div", { style: { marginBottom: 8 } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" } },
            React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 600, whiteSpace: "nowrap" } }, "ホールド足高値（水準線比）"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center", border: "1px solid " + (fHold2HighSign === "+" ? "#1E8449" : fHold2HighSign === "-" ? "#C0392B" : "#ccc"), borderRadius: 6, overflow: "hidden" }
            },
              React.createElement("button", {
                onClick: function() {
                  setFHold2HighSign(fHold2HighSign === "-" ? "+" : fHold2HighSign === "+" ? null : "-");
                },
                style: { padding: "5px 10px", fontSize: 13, fontWeight: fHold2HighSign ? 700 : 400, cursor: "pointer", minWidth: 36, flexShrink: 0,
                  border: "none", borderRight: "1px solid " + (fHold2HighSign === "+" ? "#1E8449" : fHold2HighSign === "-" ? "#C0392B" : "#ccc"),
                  background: fHold2HighSign === "+" ? "#EAF3DE" : fHold2HighSign === "-" ? "#FCEBEB" : "#f5f4f0",
                  color: fHold2HighSign === "+" ? "#1E8449" : fHold2HighSign === "-" ? "#C0392B" : "#999" }
              }, fHold2HighSign === "-" ? "↑" : fHold2HighSign === "+" ? "↓" : "↕"),
              React.createElement("input", {
                type: "text", inputMode: "numeric", step: "1",
                value: fHold2HighVal,
                onChange: function(e) {
                  var _hk = _toHankakuNum(e.target.value); var _v = _hk === "" ? "" : String(Math.abs(Number(_hk) || 0));
                  setFHold2HighVal(_v);
                },
                placeholder: "0",
                style: { border: "none", outline: "none", padding: "5px 8px", fontSize: 13, background: "#fff", width: 80, textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { _applySigned(_h2hSignedRef, 1, "-", "+", setFHold2HighVal, setFHold2HighSign); },
                function() { _applySigned(_h2hSignedRef, -1, "-", "+", setFHold2HighVal, setFHold2HighSign); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円"),
            (function() {
              if (fHold2HighVal === "") return null;
              var _av3 = _fAlpha;
              if (_av3 == null) return null;
              var _shhv = fHold2HighSign === "-" ? (Number(fHold2HighVal) || 0) : fHold2HighSign === "+" ? -(Number(fHold2HighVal) || 0) : 0;
              var _diff = _shhv - _av3;
              var _isUp = _diff > 0, _isDn = _diff < 0;
              return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, marginLeft: 4 } },
                React.createElement("span", { style: { fontSize: 10, color: "#aaa" } }, "α値比"),
                React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: _isUp ? "#C0392B" : _isDn ? "#1E8449" : "#999" } },
                  (_isUp ? "↑" : _isDn ? "↓" : "↕") + Math.abs(_diff) + "円")
              );
            })()
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 } },
            React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 600 } }, "ホールド足確定値(水準線比)"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center", border: "1px solid " + (fHold2WidthSign === "+" ? "#1E8449" : fHold2WidthSign === "-" ? "#C0392B" : "#ccc"), borderRadius: 6, overflow: "hidden" }
            },
              React.createElement("button", {
                onClick: function() {
                  var _newSg = fHold2WidthSign === "-" ? "+" : fHold2WidthSign === "+" ? null : "-";
                  setFHold2WidthSign(_newSg);
                  var _av2 = _fAlpha;
                  if (_av2 != null && fHold2WidthVal !== "") {
                    var _ws = _newSg === "-" ? -(Number(fHold2WidthVal)||0) : (Number(fHold2WidthVal)||0);
                    setFHold2OsConf(_av2 - _ws);
                  }
                },
                style: { padding: "5px 10px", fontSize: 13, fontWeight: fHold2WidthSign ? 700 : 400, cursor: "pointer", minWidth: 36, flexShrink: 0,
                  border: "none", borderRight: "1px solid " + (fHold2WidthSign === "+" ? "#1E8449" : fHold2WidthSign === "-" ? "#C0392B" : "#ccc"),
                  background: fHold2WidthSign === "+" ? "#EAF3DE" : fHold2WidthSign === "-" ? "#FCEBEB" : "#f5f4f0",
                  color: fHold2WidthSign === "+" ? "#1E8449" : fHold2WidthSign === "-" ? "#C0392B" : "#999" }
              }, fHold2WidthSign === "-" ? "↑" : fHold2WidthSign === "+" ? "↓" : "↕"),
              React.createElement("input", {
                type: "text", inputMode: "numeric", step: "1",
                value: fHold2WidthVal,
                onChange: function(e) {
                  var _hk = _toHankakuNum(e.target.value); var _v = _hk === "" ? "" : String(Math.abs(Number(_hk) || 0));
                  setFHold2WidthVal(_v);
                  var _av2 = _fAlpha;
                  if (_av2 != null && _v !== "" && fHold2WidthSign != null) {
                    var _ws = fHold2WidthSign === "-" ? -(Number(_v)||0) : (Number(_v)||0);
                    setFHold2OsConf(_av2 - _ws);
                  }
                },
                placeholder: "0",
                style: { border: "none", outline: "none", padding: "5px 8px", fontSize: 13, background: "#fff", width: 80, textAlign: "right", boxSizing: "border-box" }
              }),
              _stepBtn(
                function() { _applySigned(_h2wSignedRef, 1, "-", "+", setFHold2WidthVal, setFHold2WidthSign, _h2wAfter); },
                function() { _applySigned(_h2wSignedRef, -1, "-", "+", setFHold2WidthVal, setFHold2WidthSign, _h2wAfter); }
              )
            ),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "円")
          )
        ),

        React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" } },
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } },
              "結果損益",
              React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "100株換算")),
            _fH2NonConsider ? _fH2MissEl : ((Number(fOsVal) > 0 && (Number(fOsVal) - _fAlpha) >= _fCutLine) || (fHoldHighSign === "-" && fHoldHighVal !== "" && (Number(fHoldHighVal) - _fAlpha) >= _fCutLine)) ? React.createElement("span", { style: { display: "inline-block", padding: "5px 14px", fontSize: 14, fontWeight: 800, color: "#6B7280", background: "#F3F4F6", borderRadius: 6, border: "1px solid #ddd", minWidth: 80, textAlign: "center" } }, "損切り済") : React.createElement("span", {
              style: {
                display: "inline-block", padding: "5px 14px",
                fontSize: 14, fontWeight: 800,
                color: fHold2PnlSign === "+" ? "#C0392B" : fHold2PnlSign === "-" ? "#1E8449" : "#555",
                background: fHold2PnlSign === "+" ? "#FCEBEB" : fHold2PnlSign === "-" ? "#EAF3DE" : "#f5f5f5",
                borderRadius: 6, border: "1px solid " + (fHold2PnlSign === "+" ? "#F5B7B1" : fHold2PnlSign === "-" ? "#A9DFBF" : "#ddd"),
                minWidth: 80, textAlign: "right"
              }
            }, fHold2PnlVal === "0" ? "0円" : fHold2PnlVal ? (fHold2PnlSign === "-" ? "−" : "+") + Number(fHold2PnlVal).toLocaleString() + "円" : "—"),
            ((fHold2HighSign === "-" && fHold2HighVal !== "" && (Number(fHold2HighVal) - _fAlpha) >= _fCutLine) || (Number(fOsVal) > 0 && (Number(fOsVal) - _fAlpha) >= _fCutLine))
              ? _elCapNote(_fCutLine, { fontSize: 14, circle: 15, style: { justifyContent: "flex-start", marginTop: 3 } }) : null
          ),
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 4 } }, "損益変化", React.createElement("span", { style: { fontSize: 10, color: "#aaa", marginLeft: 4, fontWeight: 400 } }, "（H１比）")),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } },
              [["○ 利益+", "yes", "#C0392B", "#FCEBEB"], ["△ 利益-", "mid", "#B45309", "#FEF3C7"], ["ー 変化なし", "none", "#6B7280", "#F3F4F6"], ["× 損失", "no", "#1E8449", "#EAF3DE"], ["損切り済", "stop", "#6B7280", "#F3F4F6"], ["未達", "miss", "#B45309", "#FEF3C7"]].map(function(kv) {
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


      _fH2Hidden ? React.createElement("div", {
        style: { marginBottom: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#555", background: "#F4F6F8", borderRadius: 6, border: "1px solid #e0ddd5" }
      }, "※ H２欄：H１までE基準未達のため非表示") : null,

      React.createElement("div", { style: SH_ }, "実エントリー"),
      React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } },
        [["あり", true], ["見送り", false]].map(function(kv) {
          var label = kv[0], val = kv[1];
          var on = fEntered === val;
          return React.createElement("button", {
            key: label,
            onClick: function() { setFEntered(val); if (!val) setFItemId(null); },
            style: {
              padding: "8px 14px", fontSize: 13, fontWeight: 600,
              border: on ? "1.5px solid #1a1a1a" : "1px solid #ddd",
              background: on ? "#1a1a1a" : "#fff",
              color: on ? "#fff" : "#555",
              borderRadius: 6, cursor: "pointer", flex: 1
            }
          }, label);
        })
      ),
      fEntered && React.createElement("div", null,
        
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
                    type: "text", inputMode: "numeric", min: "0", max: "30", step: "1",
                    value: fTradeAlpha,
                    onChange: function(e) { var v = _toHankakuNum(e.target.value); if (v === "") { setFTradeAlpha(""); return; } var n = Number(v); if (isNaN(n)) return; if (n > 30) n = 30; if (n < 0) n = 0; setFTradeAlpha(String(n)); },
                    placeholder: "—",
                    style: { padding: "9px 10px", border: "none", outline: "none", background: "#fff", width: 70, textAlign: "right", fontSize: 13, boxSizing: "border-box" }
                  }),
                  _stepBtn(
                    function() { setFTradeAlpha(function(v) { return String(Math.min(30, (Number(v)||0) + 1)); }); },
                    function() { setFTradeAlpha(function(v) { return String(Math.max(0, (Number(v)||0) - 1)); }); }
                  )
                ),
                React.createElement("span", { style: { fontSize: 12, color: "#666" } }, "円")
              )
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
    onClick: function() { onEdit(record); },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = "#F97316"; },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = "#e0ddd6"; }
  },
    
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 } },
      React.createElement("span", { style: { fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" } }, _fmtDow(record.date)),
      s.time && React.createElement("span", { style: { fontSize: 12, color: "#666", fontWeight: 600 } }, s.time),
      React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#9A3412" } }, record.stock)
    ),

    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 } },
      s.tradeType && React.createElement("span", { style: { padding: "1px 5px", fontSize: 10, fontWeight: 700, background: s.tradeType === "空売" ? "#FCEBEB" : "#EAF3DE", color: s.tradeType === "空売" ? "#C0392B" : "#1E8449", borderRadius: 4, border: "1px solid " + (s.tradeType === "空売" ? "#F5C6CB" : "#A9DFBF") } }, s.tradeType),
      React.createElement("span", { style: { padding: "1px 5px", fontSize: 10, fontWeight: 600, background: entered ? "#E8F5E9" : "#f5f4f0", color: entered ? "#2E7D32" : "#888", borderRadius: 4, border: "1px solid " + (entered ? "#A9DFBF" : "#ddd") } }, entered ? "実エントリー" : "見送り"),
      (s.tags && s.tags.length > 0 ? s.tags : (s.tag && s.tag !== "__custom__" ? [s.tag] : [])).map(function(t) {
        return React.createElement("span", { key: t, style: { padding: "1px 7px", fontSize: 11, fontWeight: 600, background: "#FFEDD5", color: "#9A3412", borderRadius: 5, border: "1px solid #FB923C" } }, t);
      }),
      s.isCustomTag && React.createElement("span", { style: { padding: "1px 7px", fontSize: 11, fontWeight: 600, background: "#EEF2FF", color: "#4338CA", borderRadius: 5, border: "1px solid #C7D2FE" } }, s.customTagText || "(その他)"),
      s.difficulty && React.createElement("span", { style: { padding: "1px 5px", fontSize: 10, fontWeight: 600, background: "#FFEDD5", color: "#9A3412", borderRadius: 4, border: "1px solid #FDBA74" } }, "予想OS度" + s.difficulty),
      s.tpDifficulty && React.createElement("span", { style: { padding: "1px 5px", fontSize: 10, fontWeight: 600, background: "#DCFCE7", color: "#14532D", borderRadius: 4, border: "1px solid #86EFAC" } }, "利確" + s.tpDifficulty),
      record.stockTags && record.stockTags.map(function(t) {
        return React.createElement("span", { key: t, style: { padding: "1px 5px", fontSize: 10, fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, border: "1px solid #BFDBFE" } }, "📌 " + t);
      }),
      _elcAi && _elcAi.alpha != null && React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#0369A1", whiteSpace: "nowrap", padding: "1px 6px", background: "#F0F9FF", borderRadius: 4, border: "1px solid #BAE6FD" } }, "採用α " + _elcAi.alpha + "円 / 損切り " + _elcAi.cutLine + "円")
    ),
    
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-start", marginBottom: (s.rationale || s.reflection || s.priceIn || s.priceOut) ? 6 : 0 } },

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
        _dispResult === "miss" ? _chip("想定損益", _qMissCell(14), "#888") :
        planPnl != null ? React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", alignItems: "center", padding: "2px 6px", background: "#f5f4f0", borderRadius: 4, border: "1px solid #e8e5de", minWidth: 36 } },
          React.createElement("span", { style: { fontSize: 8, color: "#aaa", fontWeight: 700, lineHeight: 1.2 } }, "想定損益"),
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




