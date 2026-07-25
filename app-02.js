function CPill(_ref9) {
  var label = _ref9.label,
    color = _ref9.color,
    sm = _ref9.sm;
  var _color2 = _slicedToArray(color, 3),
    bg = _color2[0],
    bd = _color2[1],
    fg = _color2[2];
  return React.createElement("span", {
    style: {
      display: "inline-block",
      padding: sm ? "2px 7px" : "4px 11px",
      borderRadius: 5,
      fontSize: sm ? 11 : 13,
      fontWeight: 600,
      background: bg,
      color: fg,
      border: "1px solid " + bd,
      margin: "1px",
      lineHeight: 1.3
    }
  }, label);
}
function FlowChips(_ref0) {
  var codes = _ref0.codes,
    tiny = _ref0.tiny;
  if (!codes || !codes.length) return React.createElement("span", {
    style: {
      color: "#ccc",
      fontSize: 11
    }
  }, "\u2014");
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      flexWrap: "wrap"
    }
  }, codes.map(function (c, i) {
    var _getFC = getFC(c),
      _getFC2 = _slicedToArray(_getFC, 3),
      bg = _getFC2[0],
      bd = _getFC2[1],
      fg = _getFC2[2];
    return React.createElement("span", {
      key: i,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 2
      }
    }, i > 0 && React.createElement("span", {
      style: {
        color: "#bbb",
        fontSize: tiny ? 9 : 13
      }
    }, "\u2192"), React.createElement("span", {
      style: {
        padding: tiny ? "2px 4px" : "3px 7px",
        borderRadius: 4,
        fontSize: tiny ? 9 : 12,
        fontWeight: 600,
        background: bg,
        color: fg,
        border: "1px solid " + bd,
        lineHeight: 1.2
      }
    }, c));
  }));
}
function DeleteDlg(_ref1) {
  var msg = _ref1.msg,
    onOk = _ref1.onOk,
    onCancel = _ref1.onCancel;
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.45)",
      zIndex: 8000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      padding: "22px 26px",
      maxWidth: 300,
      width: "90%",
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      marginBottom: 8
    }
  }, "\uD83D\uDDD1\uFE0F"), React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.8,
      color: "#333",
      marginBottom: 18,
      whiteSpace: "pre-wrap"
    }
  }, msg), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "center"
    }
  }, React.createElement("button", {
    onClick: onOk,
    style: {
      padding: "10px 22px",
      background: "#C0392B",
      color: "#fff",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14
    }
  }, "\u524A\u9664"), React.createElement("button", {
    onClick: onCancel,
    style: {
      padding: "10px 22px",
      background: "#fff",
      color: "#555",
      border: "1px solid #ccc",
      borderRadius: 7,
      cursor: "pointer",
      fontSize: 14
    }
  }, "\u30AD\u30E3\u30F3\u30BB\u30EB"))));
}
function AddBtn(_ref10) {
  var onAdd = _ref10.onAdd,
    ph = _ref10.ph;
  var _useState67 = useState(false),
    _useState68 = _slicedToArray(_useState67, 2),
    open = _useState68[0],
    setOpen = _useState68[1],
    _useState69 = useState(""),
    _useState70 = _slicedToArray(_useState69, 2),
    val = _useState70[0],
    setVal = _useState70[1];
  var ref = useRef();
  useEffect(function () {
    if (open && ref.current) ref.current.focus();
  }, [open]);
  var commit = function commit() {
    if (val.trim()) {
      onAdd(val.trim());
      setVal("");
      setOpen(false);
    }
  };
  if (!open) return React.createElement("span", {
    onClick: function onClick() {
      return setOpen(true);
    },
    style: {
      cursor: "pointer",
      fontSize: 12,
      color: "#888",
      border: "1.5px dashed #ccc",
      borderRadius: 6,
      padding: "5px 12px",
      display: "inline-block",
      lineHeight: 1.5,
      userSelect: "none"
    }
  }, "\uFF0B");
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, React.createElement("input", {
    ref: ref,
    value: val,
    onChange: function onChange(e) {
      return setVal(e.target.value);
    },
    placeholder: ph || "追加",
    onKeyDown: function onKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") {
        setVal("");
        setOpen(false);
      }
    },
    style: {
      fontSize: 13,
      border: "1.5px solid #6366F1",
      borderRadius: 6,
      padding: "6px 10px",
      width: 120,
      outline: "none"
    }
  }), React.createElement("span", {
    onClick: commit,
    style: {
      cursor: "pointer",
      color: "#1E8449",
      fontWeight: 700,
      fontSize: 18,
      padding: "4px"
    }
  }, "\u2713"), React.createElement("span", {
    onClick: function onClick() {
      setVal("");
      setOpen(false);
    },
    style: {
      cursor: "pointer",
      color: "#bbb",
      fontSize: 18,
      padding: "4px"
    }
  }, "\u2715"));
}













function FastInput(_props_fi) {
  var value = (_props_fi.value == null) ? "" : _props_fi.value;
  var onChange = _props_fi.onChange;
  var onBlur = _props_fi.onBlur;
  var onFocus = _props_fi.onFocus;
  var onInputProp = _props_fi.onInput;
  var debounceMs = (typeof _props_fi.debounceMs === "number") ? _props_fi.debounceMs : 150;
  var multiline = _props_fi.multiline === true;
  var autoResize = _props_fi.autoResize === true;
  var refExternal = _props_fi.inputRef;
  var ref = useRef(null);
  var lastExternal = useRef(value);
  var pending = useRef(value);
  var timer = useRef(null);

  
  useEffect(function() {
    if (lastExternal.current === value) return;
    lastExternal.current = value;
    pending.current = value;
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.value = value || "";
    }
  }, [value]);

  var commit = function() {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (pending.current !== lastExternal.current) {
      lastExternal.current = pending.current;
      if (onChange) onChange(pending.current);
    }
  };

  var _fiAutoResize = function(el) {
    if (!autoResize || !multiline || !el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  
  useEffect(function() {
    if (autoResize && multiline && ref.current) _fiAutoResize(ref.current);
  });

  var transformInput = _props_fi.transformInput || null;
  var handleInput = function(e) {
    var _fi_v = e.target.value;
    if (transformInput) {
      var _fi_vt = transformInput(_fi_v);
      if (_fi_vt !== _fi_v) {
        var _fi_pos = e.target.selectionEnd;
        e.target.value = _fi_vt;
        try { e.target.setSelectionRange(_fi_pos, _fi_pos); } catch(_) {}
        _fi_v = _fi_vt;
      }
    }
    pending.current = _fi_v;
    if (debounceMs > 0) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(commit, debounceMs);
    } else {
      commit();
    }
    _fiAutoResize(e.target);
    if (onInputProp) onInputProp(e);
  };
  var handleBlur = function(e) {
    commit();
    if (onBlur) onBlur(e);
  };
  var handleFocus = function(e) { if (onFocus) onFocus(e); };

  
  useEffect(function() {
    return function() { if (timer.current) commit(); };
  }, []);

  
  
  
  var setRef = function(el) {
    ref.current = el;
    if (el) {
      el.__fiCommit = commit;
    }
    if (refExternal) {
      if (typeof refExternal === "function") refExternal(el);
      else refExternal.current = el;
    }
  };

  
  var passProps = {};
  Object.keys(_props_fi).forEach(function(k) {
    if (k === "value" || k === "onChange" || k === "multiline" || k === "debounceMs" ||
        k === "onBlur" || k === "onFocus" || k === "onInput" || k === "defaultValue" ||
        k === "inputRef" || k === "ref" || k === "autoResize" || k === "transformInput") return;
    passProps[k] = _props_fi[k];
  });
  passProps.ref = setRef;
  passProps.defaultValue = value || "";
  passProps.onInput = handleInput;
  passProps.onBlur = handleBlur;
  passProps.onFocus = handleFocus;

  return React.createElement(multiline ? "textarea" : "input", passProps);
}



function _fiFlushAll() {
  try {
    var nodes = document.querySelectorAll("input,textarea");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (typeof n.__fiCommit === "function") n.__fiCommit();
    }
  } catch (_e) {}
}
function AutoTextarea(_ref11) {
  var value = _ref11.value,
    onChange = _ref11.onChange,
    placeholder = _ref11.placeholder,
    style = _ref11.style;
  var ref = useRef();
  useEffect(function () {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  });
  return React.createElement("textarea", {
    ref: ref,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    style: _objectSpread(_objectSpread({}, style), {}, {
      resize: "none",
      overflow: "hidden",
      minHeight: 56
    }),
    onInput: function onInput(e) {
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";
    }
  });
}


function RichTextEditor(_ref12) {
  var value = _ref12.value,
    onChange = _ref12.onChange,
    placeholder = _ref12.placeholder,
    minRows = _ref12.minRows,
    style = _ref12.style;
  var ref = useRef(),
    lastVal = useRef(null),
    savedRange = useRef(null);
  var _useState71 = useState(false),
    _useState72 = _slicedToArray(_useState71, 2),
    hasSel = _useState72[0],
    setHasSel = _useState72[1],
    _useState73 = useState({
      x: 0,
      y: 0
    }),
    _useState74 = _slicedToArray(_useState73, 2),
    pos = _useState74[0],
    setPos = _useState74[1];
  
  var _usRTEF = useState(false), _usRTEFA = _slicedToArray(_usRTEF, 2),
    isFocused = _usRTEFA[0], setIsFocused = _usRTEFA[1];
  
  var _usRTEVB = useState(0), _usRTEVBA = _slicedToArray(_usRTEVB, 2),
    vvBottomOffset = _usRTEVBA[0], setVvBottomOffset = _usRTEVBA[1];
  var blurTimer = useRef(null);
  var typingTimer = useRef(null);
  
  var emitTimerRTE = useRef(null);
  
  var _doRTEemit = function() {
    if (ref.current && onChange) {
      var cur = ref.current.innerHTML;
      if (cur !== lastVal.current) {
        lastVal.current = cur;
        try { onChange(cur); } catch(e){}
      }
    }
  };
  var _idleRTEemit = function() {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(_doRTEemit, { timeout: 800 });
    } else {
      requestAnimationFrame(function() { setTimeout(_doRTEemit, 0); });
    }
  };
  var scheduleRTEemit = function() {
    if (emitTimerRTE.current) clearTimeout(emitTimerRTE.current);
    emitTimerRTE.current = setTimeout(function() {
      emitTimerRTE.current = null;
      _idleRTEemit();
    }, 400);
  };
  useEffect(function() {
    if (!isFocused) return;
    var vv = (typeof window !== "undefined") ? window.visualViewport : null;
    if (!vv) return;
    var update = function() {
      var hidden = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
      setVvBottomOffset(hidden);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return function() {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [isFocused]);
  useEffect(function () {
    if (ref.current && value !== lastVal.current && ref.current !== document.activeElement) {
      ref.current.innerHTML = value || '';
      lastVal.current = value;
    }
  }, [value]);
  
  useEffect(function() {
    return function() {
      if (emitTimerRTE.current) {
        clearTimeout(emitTimerRTE.current);
        emitTimerRTE.current = null;
        try {
          if (ref.current && onChange) {
            var cur = ref.current.innerHTML;
            if (cur !== lastVal.current) onChange(cur);
          }
        } catch(e){}
      }
    };
  }, []);
  useEffect(function () {
    var _rafId = null;
    var fn = function fn() {
      if (_rafId || typingTimer.current) return;
      _rafId = requestAnimationFrame(function() {
        _rafId = null;
        if (!ref.current) return;
        
        
        
        var ae = document.activeElement;
        var inEditor = ae === ref.current;
        var inToolbar = ae && ae.closest && ae.closest("[data-sn-rte-toolbar]");
        if (!inEditor && !inToolbar) return;
        var s = window.getSelection();
        if (s && s.rangeCount && s.toString().length) {
          try {
            var range = s.getRangeAt(0);
            if (ref.current.contains(range.commonAncestorContainer)) {
              savedRange.current = range.cloneRange();
              var r = range.getBoundingClientRect();
              if (r.width || r.height) {
                setPos({ x: r.left + r.width / 2, y: r.top });
                setHasSel(true);
              }
            }
          } catch (_unused9) {}
        }
      });
    };
    document.addEventListener('selectionchange', fn);
    return function () {
      return document.removeEventListener('selectionchange', fn);
    };
  }, []);
  var saveSel = function saveSel() {
    var s = window.getSelection();
    if (s && s.rangeCount && s.toString().length) {
      savedRange.current = s.getRangeAt(0).cloneRange();
      var r = s.getRangeAt(0).getBoundingClientRect();
      setPos({
        x: r.left + r.width / 2,
        y: r.top
      });
      setHasSel(true);
    } else {
      
      setHasSel(function(prev) { return prev ? false : prev; });
    }
  };
  var fmt = function fmt(cmd, val) {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    ref.current.focus();
    if (savedRange.current) {
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(savedRange.current);
    }
    document.execCommand(cmd, false, val || null);
    
    var _sSel = window.getSelection();
    if (_sSel && _sSel.rangeCount && _sSel.toString().length) {
      savedRange.current = _sSel.getRangeAt(0).cloneRange();
    }
    lastVal.current = ref.current.innerHTML;
    onChange(ref.current.innerHTML);
  };
  var TCOLS = ['#E53935', '#E65100', '#F9A825', '#2E7D32', '#1565C0', '#6A1B9A', '#000000'];
  var MCOLS = ['#FFEE58', '#A5D6A7', '#90CAF9', '#F48FB1', '#FFCCBC'];
  var DOT = IS_TOUCH ? 22 : 17;
  var TW = 370;
  var tx = Math.min(Math.max(pos.x - TW / 2, 6), Math.max(window.innerWidth - TW - 6, 6));
  var ty = pos.y > 70 ? pos.y - 58 : pos.y + 30;
  var showPH = !value || stripHtml(value).trim() === '';
  var ToolbarContent = function ToolbarContent() {
    return React.createElement(React.Fragment, null, React.createElement("span", {
      style: {
        fontSize: 10,
        color: '#555',
        fontWeight: 700
      }
    }, "A"), TCOLS.map(function (c) {
      return React.createElement("span", {
        key: c,
        onMouseDown: function onMouseDown(e) {
          e.preventDefault();
          fmt('foreColor', c);
        },
        onTouchEnd: function onTouchEnd(e) {
          e.preventDefault();
          fmt('foreColor', c);
        },
        style: {
          width: DOT,
          height: DOT,
          borderRadius: '50%',
          background: c,
          cursor: 'pointer',
          border: '1.5px solid rgba(0,0,0,.15)',
          display: 'inline-block',
          flexShrink: 0
        }
      });
    }), React.createElement("label", {
      style: {
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: DOT,
        height: DOT,
        position: 'relative'
      }
    }, React.createElement("span", {
      style: {
        fontSize: IS_TOUCH ? 16 : 13
      }
    }, "\uD83C\uDFA8"), React.createElement("input", {
      type: "color",
      defaultValue: "#E53935",
      onFocus: function onFocus() {
        var s = window.getSelection();
        if (s && s.rangeCount) savedRange.current = s.getRangeAt(0).cloneRange();
      },
      onInput: function onInput(e) {
        return fmt('foreColor', e.target.value);
      },
      style: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1
      }
    })), React.createElement("span", {
      style: {
        width: 1,
        height: 18,
        background: '#ddd',
        margin: '0 3px'
      }
    }), React.createElement("span", {
      style: {
        fontSize: 10,
        color: '#555',
        fontWeight: 700
      }
    }, "\u86CD"), MCOLS.map(function (c) {
      return React.createElement("span", {
        key: c,
        onMouseDown: function onMouseDown(e) {
          e.preventDefault();
          fmt('hiliteColor', c);
        },
        onTouchEnd: function onTouchEnd(e) {
          e.preventDefault();
          fmt('hiliteColor', c);
        },
        style: {
          width: DOT,
          height: DOT,
          borderRadius: 3,
          background: c,
          cursor: 'pointer',
          border: '1.5px solid rgba(0,0,0,.12)',
          display: 'inline-block',
          flexShrink: 0
        }
      });
    }), React.createElement("label", {
      style: {
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: DOT,
        height: DOT,
        position: 'relative'
      }
    }, React.createElement("span", {
      style: {
        fontSize: IS_TOUCH ? 16 : 13
      }
    }, "\uD83C\uDFA8"), React.createElement("input", {
      type: "color",
      defaultValue: "#FFEE58",
      onFocus: function onFocus() {
        var s = window.getSelection();
        if (s && s.rangeCount) savedRange.current = s.getRangeAt(0).cloneRange();
      },
      onInput: function onInput(e) {
        return fmt('hiliteColor', e.target.value);
      },
      style: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1
      }
    })), React.createElement("span", {
      style: {
        width: 1,
        height: 18,
        background: '#ddd',
        margin: '0 3px'
      }
    }), React.createElement("span", {
      onMouseDown: function onMouseDown(e) {
        e.preventDefault();
        fmt('underline');
      },
      onTouchEnd: function onTouchEnd(e) {
        e.preventDefault();
        fmt('underline');
      },
      style: {
        padding: '3px 9px',
        borderRadius: 5,
        background: '#f5f5f5',
        border: '1px solid #ddd',
        cursor: 'pointer',
        fontSize: IS_TOUCH ? 15 : 13,
        fontWeight: 700,
        textDecoration: 'underline',
        userSelect: 'none'
      }
    }, "U"), React.createElement("span", {
      onMouseDown: function onMouseDown(e) {
        e.preventDefault();
        fmt('removeFormat');
      },
      onTouchEnd: function onTouchEnd(e) {
        e.preventDefault();
        fmt('removeFormat');
      },
      style: {
        padding: '3px 8px',
        borderRadius: 5,
        background: '#f5f5f5',
        border: '1px solid #ddd',
        cursor: 'pointer',
        fontSize: IS_TOUCH ? 13 : 11,
        color: '#888',
        userSelect: 'none'
      }
    }, "\u2715\u89E3\u9664"));
  };
  var toolbar = isFocused && ReactDOM.createPortal(
    React.createElement("div", {
      "data-sn-rte-toolbar": "1",
      onMouseDown: function onMouseDown(e) { e.preventDefault(); },
      onTouchStart: function(e) { e.preventDefault(); },
      style: {
        position: "fixed",
        bottom: vvBottomOffset, left: 0, right: 0, zIndex: 9999,
        background: "#fff", borderTop: "1px solid #e0ddd6",
        padding: IS_TOUCH ? "8px 10px max(8px,env(safe-area-inset-bottom,8px))" : "8px 12px",
        display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
        boxShadow: "0 -4px 16px rgba(0,0,0,.12)",
        overflowX: "auto"
      }
    }, React.createElement(ToolbarContent, null)),
    document.body
  );
  return React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, toolbar, React.createElement("div", {
    ref: ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: function onInput() {
      
      lastVal.current = ref.current.innerHTML;
      scheduleRTEemit();
    },
    onMouseUp: saveSel,
    onKeyDown: function() {
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(function() { typingTimer.current = null; }, 300);
    },
    onKeyUp: function() {},
    onFocus: function onFocus() {
      if (blurTimer.current) clearTimeout(blurTimer.current);
      setIsFocused(true);
    },
    onBlur: function onBlur() {
      
      
      if (emitTimerRTE.current) { clearTimeout(emitTimerRTE.current); emitTimerRTE.current = null; }
      if (ref.current) {
        var cur = ref.current.innerHTML;
        if (cur !== value) {
          lastVal.current = cur;
          onChange(cur);
        }
      }
      blurTimer.current = setTimeout(function () {
        
        var ae = document.activeElement;
        var inToolbar = ae && ae.closest && ae.closest("[data-sn-rte-toolbar]");
        if (!inToolbar && ae !== ref.current) {
          setIsFocused(false);
        }
        setHasSel(false);
      }, IS_TOUCH ? 500 : 200);
    },
    style: _objectSpread({
      width: '100%',
      minHeight: (minRows || 3) * 1.9 + 'em',
      padding: '8px 10px',
      border: '1px solid #ddd',
      borderRadius: 6,
      fontSize: 13,
      outline: 'none',
      lineHeight: 1.7,
      background: '#fff',
      wordBreak: 'break-word',
      cursor: 'text',
      overflowY: 'visible'
    }, style)
  }), showPH && placeholder && React.createElement("div", {
    style: {
      position: 'absolute',
      top: 8,
      left: 10,
      color: '#aaa',
      fontSize: 13,
      pointerEvents: 'none',
      lineHeight: 1.7
    }
  }, placeholder));
}


function PasteZone(_ref13) {
  var onImage = _ref13.onImage,
    compact = _ref13.compact;
  var fileRef = useRef(),
    pasteRef = useRef();
  var _useState75 = useState(false),
    _useState76 = _slicedToArray(_useState75, 2),
    focused = _useState76[0],
    setFocused = _useState76[1],
    _useState77 = useState(false),
    _useState78 = _slicedToArray(_useState77, 2),
    dragOn = _useState78[0],
    setDragOn = _useState78[1];
  var active = focused || dragOn;
  var handleFile = function () {
    var _ref14 = _asyncToGenerator(_regenerator().m(function _callee(f) {
      var r;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return fileToImg(f);
          case 1:
            r = _context.v;
            if (r) onImage(r);
          case 2:
            return _context.a(2);
        }
      }, _callee);
    }));
    return function handleFile(_x8) {
      return _ref14.apply(this, arguments);
    };
  }();
  var onPaste = function onPaste(e) {
    e.preventDefault();
    var it = e.clipboardData && e.clipboardData.items || [];
    for (var i = 0; i < it.length; i++) {
      if (it[i].type.startsWith("image/")) {
        handleFile(it[i].getAsFile());
        break;
      }
    }
    if (pasteRef.current) pasteRef.current.value = "";
  };
  return React.createElement("div", {
    onDrop: function onDrop(e) {
      e.preventDefault();
      setDragOn(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    onDragOver: function onDragOver(e) {
      e.preventDefault();
      setDragOn(true);
    },
    onDragLeave: function onDragLeave() {
      return setDragOn(false);
    },
    onClick: function onClick() {
      return IS_TOUCH ? fileRef.current && fileRef.current.click() : pasteRef.current && pasteRef.current.focus();
    },
    style: {
      border: "2px dashed " + (active ? "#6366F1" : "#ccc"),
      borderRadius: 8,
      padding: compact ? "8px 12px" : "16px",
      textAlign: "center",
      background: active ? "#EEF2FF" : "#fff",
      position: "relative",
      cursor: "pointer",
      minHeight: compact ? 40 : 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "border-color .15s,background .15s"
    }
  }, !IS_TOUCH && React.createElement("textarea", {
    ref: pasteRef,
    onPaste: onPaste,
    onFocus: function onFocus() {
      return setFocused(true);
    },
    onBlur: function onBlur() {
      return setFocused(false);
    },
    onChange: function onChange() {
      if (pasteRef.current) pasteRef.current.value = "";
    },
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0,
      resize: "none",
      border: "none",
      background: "transparent",
      zIndex: 1,
      width: "100%",
      height: "100%",
      cursor: "text"
    }
  }), React.createElement("div", {
    style: {
      color: active ? "#6366F1" : "#bbb",
      fontSize: 12,
      position: "relative",
      zIndex: 2,
      fontWeight: active ? 600 : 400,
      pointerEvents: "none"
    }
  }, IS_TOUCH ? React.createElement("span", null, "\uD83D\uDCF7 ", React.createElement("span", {
    style: {
      pointerEvents: "all",
      textDecoration: "underline",
      cursor: "pointer"
    },
    onClick: function onClick(e) {
      e.stopPropagation();
      fileRef.current && fileRef.current.click();
    }
  }, "\u5199\u771F\u30FB\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E")) : React.createElement("span", null, dragOn ? "📥 ここにドロップ" : focused ? "📋 Ctrl+V" : "クリック→Ctrl+V", " / ", React.createElement("span", {
    style: {
      pointerEvents: "all",
      cursor: "pointer"
    },
    onClick: function onClick(e) {
      e.stopPropagation();
      fileRef.current && fileRef.current.click();
    }
  }, React.createElement("span", {
    style: {
      textDecoration: "underline"
    }
  }, "\u30D5\u30A1\u30A4\u30EB\u9078\u629E")))), React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/*",
    style: {
      display: "none"
    },
    onChange: function onChange(e) {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    }
  }));
}






function useImgUploadStatus(id) {
  
  
  
  return React.useSyncExternalStore(
    _imgUploadSubscribe,
    function() { return _imgUploadGet(id); }
  );
}

function ImgThumb(_ref_it) {
  var img = _ref_it.img, onClick = _ref_it.onClick, imgStyle = _ref_it.imgStyle;
  var upSt = useImgUploadStatus(img && img.id);
  var br = (imgStyle && imgStyle.borderRadius) || 5;
  return React.createElement("div", {
    style: { position: "relative", display: "inline-block", lineHeight: 0 }
  },
    React.createElement("img", {
      src: imgSrc(img), onClick: onClick, style: imgStyle, alt: ""
    }),
    upSt ? React.createElement("div", {
      style: {
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: upSt === "uploading" ? "rgba(0,0,0,0.78)" : "rgba(22,163,74,0.92)",
        borderRadius: br + "px " + br + "px 0 0",
        fontSize: 12, color: "#fff", fontWeight: 700,
        padding: "7px 8px",
        pointerEvents: "none", whiteSpace: "nowrap",
        gap: 6, letterSpacing: "0.3px",
        textShadow: "0 1px 2px rgba(0,0,0,0.4)"
      }
    },
      upSt === "uploading"
        ? React.createElement(React.Fragment, null,
            React.createElement("span", {
              style: { display: "inline-block", width: 10, height: 10,
                       border: "2px solid rgba(255,255,255,0.35)",
                       borderTopColor: "#fff", borderRadius: "50%",
                       animation: "spin 0.7s linear infinite", flexShrink: 0 }
            }),
            "反映中…"
          )
        : "✓"
    ) : null,
    img && img.star ? React.createElement("div", {
      style: {
        position: "absolute", top: 3, left: 3,
        minWidth: 18, height: 18, borderRadius: 9,
        background: "rgba(0,0,0,0.6)", color: "#FFD54A",
        fontSize: 11, lineHeight: "18px", textAlign: "center",
        padding: "0 5px", pointerEvents: "none",
        display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap"
      },
      title: "保存済み（自動削除されません）"
    }, React.createElement("svg", { width: 11, height: 11, viewBox: "0 0 24 24", fill: "currentColor", style: { flexShrink: 0 }, "aria-hidden": "true" }, React.createElement("path", { d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" })), "保存済み") : null
  );
}
function ImgGrid(_ref15) {
  var images = _ref15.images,
    onRemove = _ref15.onRemove,
    onAnnotate = _ref15.onAnnotate,
    onEnlarge = _ref15.onEnlarge,
    onUpdateImg = _ref15.onUpdateImg,
    onToggleStar = _ref15.onToggleStar,
    boxed = _ref15.boxed;
  if (!images || !images.length) return null;
  return React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      margin: "8px 0"
    }
  }, images.map(function (img, i) {
    var src = imgSrc(img);
    var annotProps = onUpdateImg ? {
      img: img,
      onSave: function onSave(ed) {
        return onUpdateImg(i, ed);
      }
    } : null;
    return React.createElement("div", {
      key: i,
      style: { position: "relative" }
    }, React.createElement(ImgThumb, {
      img: img,
      onClick: function onClick() {
        if (onAnnotate) return onAnnotate(i);
        return onEnlarge && onEnlarge(i);
      },
      imgStyle: boxed ? {
        maxWidth: "100%",
        height: "auto",
        maxHeight: IMG_H,
        borderRadius: 6,
        display: "block",
        cursor: onAnnotate ? "pointer" : "zoom-in",
        border: "1px solid #e0ddd6"
      } : {
        height: IMG_H,
        borderRadius: 6,
        display: "block",
        cursor: onAnnotate ? "pointer" : "zoom-in",
        border: "1px solid #e0ddd6"
      }
    }), React.createElement("div", {
      style: {
        position: "absolute",
        top: boxed ? "auto" : -7,
        bottom: boxed ? 4 : "auto",
        right: boxed ? 4 : -7,
        display: "flex",
        gap: 3
      }
    }, onToggleStar && React.createElement("button", {
      onClick: function onClick() {
        return onToggleStar(i);
      },
      title: img && img.star ? "\u4fdd\u5b58\u6e08\u307f\uff08\u30bf\u30c3\u30d7\u3067\u89e3\u9664\uff09" : "\u30bf\u30c3\u30d7\u3067\u4fdd\u5b58\uff08\u81ea\u52d5\u524a\u9664\u3057\u306a\u3044\uff09",
      style: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: img && img.star ? "#F59E0B" : "#fff",
        color: img && img.star ? "#fff" : "#bbb",
        border: "1px solid " + (img && img.star ? "#F59E0B" : "#ccc"),
        fontSize: 13,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" }, React.createElement("path", { d: (img && img.star) ? "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" : "M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" }))), (!boxed && onRemove) && React.createElement("button", {
      onClick: function onClick() {
        return onRemove(i);
      },
      style: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "#555",
        color: "#fff",
        border: "none",
        fontSize: 11,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, "\u2715")));
  }));
}



function RichMemoEditor(_propsRME) {
  var initialHtml = _propsRME.initialHtml || "";
  var onChange = _propsRME.onChange;
  
  var placeholder = (typeof _propsRME.placeholder === "string") ? _propsRME.placeholder : "";
  var imgHeight = _propsRME.imgHeight || 240; 
  var ref = useRef(null);
  var didInit = useRef(false);
  var savedRange = useRef(null);
  var typingTimer = useRef(null);
  
  var _DEF_TEXT_COLORS = ["#E53935", "#1565C0", "#2E7D32", "#F57F17", "#6A1B9A", "#000000", "#00897B", "#AD1457"];
  var _DEF_UNDERLINE_COLORS = ["#E53935", "#1565C0", "#2E7D32", "#F57F17", "#6A1B9A", "#000000", "#00897B", "#AD1457"];
  var _DEF_HILITE_COLORS = ["#FFEE58", "#A5D6A7", "#90CAF9", "#F48FB1", "#FFCCBC", "#E1BEE7", "#B2EBF2", "#D7CCC8"];
  var _loadPalette = function(key, def) {
    try {
      var s = localStorage.getItem(key);
      var p = s ? JSON.parse(s) : null;
      if (Array.isArray(p) && p.length >= 1) return p.slice(0, 8);
    } catch(e){}
    return def.slice();
  };
  
  var _usTC = useState(function(){ return _loadPalette("sn_rme_text_colors_v1", _DEF_TEXT_COLORS); }),
      _usTCA = _slicedToArray(_usTC, 2),
      textColors = _usTCA[0], setTextColors = _usTCA[1];
  var _usUC = useState(function(){ return _loadPalette("sn_rme_underline_colors_v1", _DEF_UNDERLINE_COLORS); }),
      _usUCA = _slicedToArray(_usUC, 2),
      underlineColors = _usUCA[0], setUnderlineColors = _usUCA[1];
  var _usHC = useState(function(){ return _loadPalette("sn_rme_hilite_colors_v1", _DEF_HILITE_COLORS); }),
      _usHCA = _slicedToArray(_usHC, 2),
      hiliteColors = _usHCA[0], setHiliteColors = _usHCA[1];
  
  var _usCT = useState(textColors[0]), _usCTA = _slicedToArray(_usCT, 2),
      curTextColor = _usCTA[0], setCurTextColor = _usCTA[1];
  var _usCU = useState(underlineColors[0]), _usCUA = _slicedToArray(_usCU, 2),
      curUnderlineColor = _usCUA[0], setCurUnderlineColor = _usCUA[1];
  var _usCH = useState(hiliteColors[0]), _usCHA = _slicedToArray(_usCH, 2),
      curHiliteColor = _usCHA[0], setCurHiliteColor = _usCHA[1];
  
  
  var _usHist = useState(function(){
    try {
      var h = JSON.parse(localStorage.getItem("sn_rme_color_hist_v1"));
      if (Array.isArray(h)) return h;
    } catch(e){}
    return [];
  }), _usHistA = _slicedToArray(_usHist, 2),
      colorHist = _usHistA[0], setColorHist = _usHistA[1];
  var pushColorHist = function(c) {
    setColorHist(function(h) {
      var nx = [c].concat(h.filter(function(x){ return x !== c; })).slice(0, 16);
      try { localStorage.setItem("sn_rme_color_hist_v1", JSON.stringify(nx)); } catch(e){}
      return nx;
    });
  };
  
  var saveTextColors = function(arr) {
    setTextColors(arr);
    try { localStorage.setItem("sn_rme_text_colors_v1", JSON.stringify(arr)); } catch(e){}
  };
  var saveUnderlineColors = function(arr) {
    setUnderlineColors(arr);
    try { localStorage.setItem("sn_rme_underline_colors_v1", JSON.stringify(arr)); } catch(e){}
  };
  var saveHiliteColors = function(arr) {
    setHiliteColors(arr);
    try { localStorage.setItem("sn_rme_hilite_colors_v1", JSON.stringify(arr)); } catch(e){}
  };
  
  var _usFc = useState(false), _usFcA = _slicedToArray(_usFc, 2),
      isFocused = _usFcA[0], setIsFocused = _usFcA[1];
  var _usPos = useState({ x: 0, y: 0, hasSel: false }), _usPosA = _slicedToArray(_usPos, 2),
      pos = _usPosA[0], setPos = _usPosA[1];
  
  var _usE = useState(true), _usEA = _slicedToArray(_usE, 2),
      isEmpty = _usEA[0], setIsEmpty = _usEA[1];
  
  var _usZoom = useState(null), _usZoomA = _slicedToArray(_usZoom, 2),
      zoomSrc = _usZoomA[0], setZoomSrc = _usZoomA[1];
  
  
  var _usAct = useState({ bold: false, text: false, underline: false, hilite: false }),
      _usActA = _slicedToArray(_usAct, 2),
      activeFmt = _usActA[0], setActiveFmt = _usActA[1];
  
  var _detectActiveFmt = function() {
    if (!ref.current) return;
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    var node = sel.anchorNode;
    if (!node || !ref.current.contains(node)) return;
    var el = node.nodeType === 1 ? node : node.parentNode;
    var has = { bold: false, text: false, underline: false, hilite: false };
    var cur = el;
    while (cur && cur !== ref.current && cur.nodeType === 1) {
      
      if (cur.tagName === "B" || cur.tagName === "STRONG") has.bold = true;
      
      var st = cur.style;
      if (st) {
        
        var fw = st.fontWeight;
        if (fw && (fw === "bold" || fw === "bolder" || (parseInt(fw, 10) >= 600))) has.bold = true;
        var cl = st.color;
        if (cl && cl !== "" && cl !== "inherit"
            && cl !== "rgb(0, 0, 0)" && cl !== "rgb(26, 26, 26)" && cl !== "#000000" && cl !== "#1a1a1a") {
          has.text = true;
        }
        var td = (st.textDecoration || "") + " " + (st.textDecorationLine || "");
        if (td.indexOf("underline") >= 0) has.underline = true;
        var bg = st.backgroundColor || st.background || "";
        if (bg && bg !== "" && bg !== "transparent" && bg.indexOf("rgba(0, 0, 0, 0)") < 0
            && bg !== "inherit" && bg !== "none") {
          has.hilite = true;
        }
      }
      
      if (cur.tagName === "FONT" && cur.getAttribute("color")) has.text = true;
      
      if (cur.tagName === "U") has.underline = true;
      cur = cur.parentNode;
    }
    setActiveFmt(function(prev) {
      if (prev.bold === has.bold && prev.text === has.text && prev.underline === has.underline && prev.hilite === has.hilite) return prev;
      return has;
    });
  };
  var _isEmpty = function() {
    if (!ref.current) return true;
    var t = (ref.current.textContent || "").trim();
    var hasImg = ref.current.querySelector("img");
    return !t && !hasImg;
  };
  var emit = function() {
    if (ref.current && onChange) onChange(ref.current.innerHTML);
  };
  
  
  var emitTimerRef = useRef(null);
  
  
  
  var _idleEmit = function() {
    var _doEmit = function() {
      try { emit(); } catch(e){}
    };
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(_doEmit, { timeout: 800 });
    } else {
      
      requestAnimationFrame(function() { setTimeout(_doEmit, 0); });
    }
  };
  var scheduleEmit = function() {
    if (emitTimerRef.current) clearTimeout(emitTimerRef.current);
    emitTimerRef.current = setTimeout(function() {
      emitTimerRef.current = null;
      _idleEmit();
    }, 400);
  };
  
  useEffect(function() {
    if (didInit.current) return;
    didInit.current = true;
    if (ref.current) {
      ref.current.innerHTML = initialHtml || "";
      
      
      setIsEmpty(_isEmpty());
    }
    
    return function() {
      if (emitTimerRef.current) {
        clearTimeout(emitTimerRef.current);
        emitTimerRef.current = null;
        try { if (ref.current && onChange) onChange(ref.current.innerHTML); } catch(e){}
      }
    };
  }, []);
  
  var _wrapImage = function(imgEl) {
    if (!imgEl) return;
    var parent = imgEl.parentNode;
    if (!parent) return;
    if (parent.classList && parent.classList.contains("sn-rme-img-wrap")) return; 
    var wrap = document.createElement("span");
    wrap.className = "sn-rme-img-wrap";
    wrap.setAttribute("contenteditable", "false");
    wrap.style.cssText = "display:inline-block;position:relative;float:left;height:"
      + imgHeight + "px;margin:0 12px 6px 0;vertical-align:top;";
    imgEl.style.cssText = "height:100%;width:auto;max-width:100%;border-radius:6px;"
      + "cursor:zoom-in;border:1px solid #e0ddd6;display:block;";
    imgEl.setAttribute("data-sn-rme-img", "1");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sn-rme-img-del";
    btn.textContent = "×";
    btn.title = "画像を削除";
    btn.setAttribute("contenteditable", "false");
    btn.style.cssText = "position:absolute;top:-8px;right:-8px;width:22px;height:22px;"
      + "padding:0;border-radius:50%;background:#DC2626;color:#fff;border:2px solid #fff;"
      + "font-size:14px;font-weight:700;line-height:1;cursor:pointer;display:flex;"
      + "align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.35);"
      + "z-index:2;";
    parent.insertBefore(wrap, imgEl);
    wrap.appendChild(imgEl);
    wrap.appendChild(btn);
    
    
    
    
    var next = wrap.nextSibling;
    var needZwsp = !next || (next.nodeType !== 3 && next.nodeType !== 8);
    if (needZwsp) {
      var zwsp = document.createTextNode("\u200B");
      if (next) {
        parent.insertBefore(zwsp, next);
      } else {
        parent.appendChild(zwsp);
      }
    }
  };
  var _wrapAllImages = function() {
    if (!ref.current) return;
    var imgs = ref.current.querySelectorAll("img:not([data-sn-rme-img-wrapped])");
    imgs.forEach(function(im) {
      _wrapImage(im);
      im.setAttribute("data-sn-rme-img-wrapped", "1");
    });
  };
  
  
  
  
  useEffect(function() {
    _wrapAllImages();
  }, []);
  var insertImageFromFile = function(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0) return;
    fileToImg(file).then(function(img) {
      if (!img || !ref.current) return;
      var src = imgSrc(img);
      if (!src) return;
      var imgEl = document.createElement("img");
      imgEl.src = src;
      imgEl.setAttribute("data-sn-rme-img", "1");
      
      ref.current.focus();
      var sel = window.getSelection();
      var inserted = false;
      if (sel && sel.rangeCount > 0 && ref.current.contains(sel.anchorNode)) {
        var range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(imgEl);
        
        _wrapImage(imgEl);
        var wrap = imgEl.parentNode;
        var newRange = document.createRange();
        newRange.setStartAfter(wrap);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        inserted = true;
      }
      if (!inserted) {
        ref.current.appendChild(imgEl);
        _wrapImage(imgEl);
      }
      emit();
      setIsEmpty(_isEmpty());
    });
  };
  var onPaste = function(e) {
    var it = e.clipboardData && e.clipboardData.items || [];
    var imageFile = null;
    for (var i = 0; i < it.length; i++) {
      if (it[i].type && it[i].type.indexOf("image/") === 0) {
        imageFile = it[i].getAsFile();
        break;
      }
    }
    if (imageFile) {
      e.preventDefault();
      insertImageFromFile(imageFile);
      return;
    }
    var txt = e.clipboardData && e.clipboardData.getData && e.clipboardData.getData("text/plain");
    if (txt != null) {
      e.preventDefault();
      try { document.execCommand("insertText", false, txt); } catch(_) {}
    }
  };
  var onDrop = function(e) {
    e.preventDefault();
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) insertImageFromFile(f);
  };
  
  var onClickHandler = function(e) {
    if (e.target.classList && e.target.classList.contains("sn-rme-img-del")) {
      e.preventDefault(); e.stopPropagation();
      window._snConfirm("画像を削除しますか？").then(function(_ok){ if(!_ok) return;
        var wrap = e.target.parentNode;
        if (wrap && wrap.parentNode) {
          wrap.parentNode.removeChild(wrap);
          emit();
          setIsEmpty(_isEmpty());
        }
      });
      return;
    }
    if (e.target.tagName === "IMG" && e.target.getAttribute("data-sn-rme-img")) {
      e.preventDefault(); e.stopPropagation();
      setZoomSrc({ src: e.target.src, imgEl: e.target });
    }
  };
  
  
  var saveSel = function() {
    if (!ref.current) return;
    var s = window.getSelection();
    if (s && s.rangeCount && ref.current.contains(s.anchorNode)) {
      var range = s.getRangeAt(0);
      savedRange.current = range.cloneRange();
      var hasSelText = !range.collapsed;
      
      
      
      
      if (!hasSelText) {
        
        setPos(function(p) {
          if (!p.hasSel) return p; 
          return Object.assign({}, p, { hasSel: false });
        });
        return;
      }
      
      var r = range.getBoundingClientRect();
      if (!r.width && !r.height) {
        try {
          var node = range.startContainer;
          if (node.nodeType === 3) node = node.parentNode;
          if (node && node.getBoundingClientRect) r = node.getBoundingClientRect();
        } catch(_){}
      }
      if (r && (r.width || r.height)) {
        setPos({ x: r.left + r.width / 2, y: r.top, hasSel: true });
      } else {
        setPos(function(p) { return Object.assign({}, p, { hasSel: true }); });
      }
    }
  };
  useEffect(function() {
    var _rafId = null;
    var fn = function() {
      if (_rafId || typingTimer.current) return;
      _rafId = requestAnimationFrame(function() {
        _rafId = null;
        if (!ref.current) return;
        
        var ae = document.activeElement;
        var inEditor = ae === ref.current;
        var inToolbar = ae && ae.closest && ae.closest("[data-sn-rme-toolbar]");
        if (!inEditor && !inToolbar) return;
        saveSel();
        _detectActiveFmt();
      });
    };
    document.addEventListener('selectionchange', fn);
    return function() { document.removeEventListener('selectionchange', fn); };
  }, []);
  
  var _restoreSel = function() {
    if (!ref.current) return;
    ref.current.focus();
    if (savedRange.current) {
      var s = window.getSelection();
      s.removeAllRanges();
      try { s.addRange(savedRange.current); } catch(_){}
    }
  };
  
  var fmt = function(cmd, val) {
    if (!ref.current) return;
    _restoreSel();
    var sel = window.getSelection();
    if (sel && sel.rangeCount && sel.getRangeAt(0).collapsed) {
      
      
      var range = sel.getRangeAt(0);
      var holder = document.createElement("span");
      holder.appendChild(document.createTextNode("\u200B")); 
      range.insertNode(holder);
      
      var sub = document.createRange();
      sub.selectNodeContents(holder);
      sel.removeAllRanges();
      sel.addRange(sub);
      try { document.execCommand(cmd, false, val || null); } catch(_){}
      
      var endR = document.createRange();
      endR.selectNodeContents(holder);
      endR.collapse(false);
      sel.removeAllRanges();
      sel.addRange(endR);
      savedRange.current = endR.cloneRange();
    } else {
      try { document.execCommand(cmd, false, val || null); } catch(_){}
      try { var _ls = window.getSelection(); if (_ls && _ls.rangeCount && _ls.toString().length) savedRange.current = _ls.getRangeAt(0).cloneRange(); } catch(_){}
    }
    emit();
  };

  var wrapStyle = function(styleText) {
    if (!ref.current) return;
    _restoreSel();
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    var span = document.createElement("span");
    span.setAttribute("style", styleText);
    if (range.collapsed) {
      
      span.appendChild(document.createTextNode("\u200B"));
      range.insertNode(span);
      var endR = document.createRange();
      endR.selectNodeContents(span);
      endR.collapse(false);
      sel.removeAllRanges();
      sel.addRange(endR);
      savedRange.current = endR.cloneRange();
    } else {
      try {
        range.surroundContents(span);
      } catch(_) {
        var contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
      sel.removeAllRanges();
      var newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      savedRange.current = newRange.cloneRange();
    }
    emit();
  };
  var TW = 460;
  var tx = Math.min(Math.max(pos.x - TW / 2, 6), Math.max(window.innerWidth - TW - 6, 6));
  var ty = pos.y > 90 ? pos.y - 70 : pos.y + 30;
  var _btnBaseStyle = {
    padding: "3px 9px", borderRadius: 5, background: "#f5f5f5",
    border: "1px solid #ddd", cursor: "pointer",
    fontSize: 12, fontWeight: 700, color: "#333", userSelect: "none",
    display: "inline-flex", alignItems: "center", justifyContent: "center"
  };
  var _sep = function() {
    return React.createElement("span", { style: { width:1, height:18, background:"#ddd", margin:"0 2px" } });
  };
  
  var _underlineStyle = function(c) {
    return "text-decoration:underline;text-decoration-color:" + c
      + ";text-decoration-thickness:2px;-webkit-text-decoration:underline " + c;
  };
  
  
  var _collapseSel = function() {
    try {
      var sel = window.getSelection();
      if (sel && sel.rangeCount > 0) sel.collapseToEnd();
    } catch(e) {}
  };
  
  var _toHiliteRgba = function(c) {
    if (!c) return c;
    c = String(c).trim();
    
    var m6 = c.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
    if (m6) {
      return "rgba(" + parseInt(m6[1], 16) + ", " + parseInt(m6[2], 16) + ", " + parseInt(m6[3], 16) + ", 0.75)";
    }
    
    var m3 = c.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
    if (m3) {
      return "rgba(" + parseInt(m3[1] + m3[1], 16) + ", " + parseInt(m3[2] + m3[2], 16) + ", " + parseInt(m3[3] + m3[3], 16) + ", 0.75)";
    }
    
    var mr = c.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (mr) return "rgba(" + mr[1] + ", " + mr[2] + ", " + mr[3] + ", 0.75)";
    
    return c;
  };
  
  var _applyHilite = function(c) {
    wrapStyle("background-color: " + _toHiliteRgba(c));
  };
  
  
  
  var clearDecoration = function(type) {
    if (!ref.current) return;
    _restoreSel();
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    if (range.collapsed) {
      
      var node = range.startContainer;
      while (node && node !== ref.current) {
        if (node.nodeType === 1) {
          if (type === "text") {
            node.style.color = "";
            
            if (node.tagName === "FONT" && node.hasAttribute("color")) {
              node.removeAttribute("color");
            }
          } else if (type === "underline") {
            node.style.textDecoration = "";
            node.style.textDecorationColor = "";
            node.style.textDecorationThickness = "";
            node.style.webkitTextDecoration = "";
          } else if (type === "hilite") {
            node.style.backgroundColor = "";
            node.style.background = "";
          }
        }
        node = node.parentNode;
      }
      emit();
      
      setTimeout(_detectActiveFmt, 0);
      return;
    }
    
    
    var contents = range.extractContents();
    var wrapper = document.createElement("span");
    wrapper.appendChild(contents);
    range.insertNode(wrapper);
    
    var walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_ELEMENT, null);
    var els = [wrapper];
    var cur = walker.nextNode();
    while (cur) { els.push(cur); cur = walker.nextNode(); }
    els.forEach(function(el) {
      if (type === "text") {
        el.style.color = "";
        
        if (el.tagName === "FONT" && el.hasAttribute("color")) {
          el.removeAttribute("color");
        }
      } else if (type === "underline") {
        el.style.textDecoration = "";
        el.style.textDecorationLine = "";
        el.style.textDecorationColor = "";
        el.style.textDecorationThickness = "";
        el.style.webkitTextDecoration = "";
        
        if (el.tagName === "U") {
          var p = el.parentNode;
          while (el.firstChild) p.insertBefore(el.firstChild, el);
          p.removeChild(el);
        }
      } else if (type === "hilite") {
        el.style.backgroundColor = "";
        el.style.background = "";
      }
    });


    var _carriesDeco = function(el) {
      if (!el || el.nodeType !== 1) return false;
      if (type === "underline") {
        if (el.tagName === "U") return true;
        var _td = ((el.style && el.style.textDecoration) || "") + " " + ((el.style && el.style.textDecorationLine) || "");
        return _td.indexOf("underline") >= 0;
      } else if (type === "text") {
        if (el.tagName === "FONT" && el.hasAttribute("color")) return true;
        return !!(el.style && el.style.color);
      } else if (type === "hilite") {
        return !!(el.style && (el.style.backgroundColor || el.style.background));
      }
      return false;
    };
    var _lift = wrapper, _pp = _lift.parentNode, _guard = 0;
    while (_pp && _pp !== ref.current && _pp.nodeType === 1 && _guard++ < 40) {
      if (!_carriesDeco(_pp)) { _lift = _pp; _pp = _pp.parentNode; continue; }
      var _grand = _pp.parentNode;
      if (!_grand) break;
      var _rightClone = _pp.cloneNode(false);
      var _sib = _lift.nextSibling;
      while (_sib) { var _nx = _sib.nextSibling; _rightClone.appendChild(_sib); _sib = _nx; }
      _grand.insertBefore(_lift, _pp.nextSibling);
      if (_rightClone.childNodes.length) _grand.insertBefore(_rightClone, _lift.nextSibling);
      if (!_pp.childNodes.length) _grand.removeChild(_pp);
      _pp = _grand;
    }

    var nr = document.createRange();
    nr.selectNodeContents(wrapper);
    sel.removeAllRanges();
    sel.addRange(nr);
    savedRange.current = nr.cloneRange();
    emit();

    setTimeout(_detectActiveFmt, 0);
  };
  var ToolbarContent = function() {
    return React.createElement(React.Fragment, null,
      
      React.createElement("span", {
        onMouseDown: function(e){ e.preventDefault(); fmt("bold"); },
        onTouchEnd: function(e){ e.preventDefault(); fmt("bold"); },
        title: activeFmt.bold ? "太字: 適用中 (タップで解除)" : "太字 (強調)",
        style: Object.assign({}, _btnBaseStyle, {
          fontWeight: 900, fontSize: 14,
          background: activeFmt.bold ? "#FEF3C7" : _btnBaseStyle.background,
          border: activeFmt.bold ? "1.5px solid #1a1a1a" : _btnBaseStyle.border,
          color: activeFmt.bold ? "#1a1a1a" : _btnBaseStyle.color
        })
      }, "B"),
      _sep(),
      
      React.createElement("span", {
        onMouseDown: function(e){
          e.preventDefault();
          if (activeFmt.text) clearDecoration("text");
          else { fmt("foreColor", curTextColor); }
        },
        onTouchEnd: function(e){
          e.preventDefault();
          if (activeFmt.text) clearDecoration("text");
          else { fmt("foreColor", curTextColor); }
        },
        title: activeFmt.text ? "文字色: 適用中 (タップで解除)" : "文字色を適用",
        style: { fontSize: 14, fontWeight: 700, color: curTextColor,
          padding: "2px 5px", borderRadius: 4, cursor: "pointer", userSelect: "none",
          background: activeFmt.text ? "#FEF3C7" : "transparent",
          border: activeFmt.text ? "1.5px solid " + curTextColor : "1.5px solid transparent",
          boxShadow: activeFmt.text ? "0 0 0 1px #fff inset" : "none" }
      }, "A"),
      React.createElement("span", { style: { display: "inline-block", width: 6, flexShrink: 0 } }),
      React.createElement(ColorPicker, {
        value: curTextColor,
        onChange: function(c) { setCurTextColor(c); pushColorHist(c); fmt("foreColor", c); },
        history: colorHist,
        onHistory: pushColorHist,
        quickColors: textColors,
        onQuickColors: saveTextColors,
        compact: true
      }),
      _sep(),
      
      React.createElement("span", {
        onMouseDown: function(e){
          e.preventDefault();
          if (activeFmt.underline) clearDecoration("underline");
          else { wrapStyle(_underlineStyle(curUnderlineColor)); }
        },
        onTouchEnd: function(e){
          e.preventDefault();
          if (activeFmt.underline) clearDecoration("underline");
          else { wrapStyle(_underlineStyle(curUnderlineColor)); }
        },
        title: activeFmt.underline ? "下線: 適用中 (タップで解除)" : "下線を適用",
        style: { fontSize: 13, fontWeight: 700, color: "#333",
          borderBottom: "2px solid " + curUnderlineColor, paddingBottom: 1,
          padding: "0 5px 1px", cursor: "pointer", userSelect: "none",
          background: activeFmt.underline ? "#FEF3C7" : "transparent",
          borderRadius: activeFmt.underline ? 3 : 0,
          borderTop: activeFmt.underline ? "1.5px solid " + curUnderlineColor : "1.5px solid transparent",
          borderLeft: activeFmt.underline ? "1.5px solid " + curUnderlineColor : "1.5px solid transparent",
          borderRight: activeFmt.underline ? "1.5px solid " + curUnderlineColor : "1.5px solid transparent" }
      }, "U"),
      React.createElement("span", { style: { display: "inline-block", width: 6, flexShrink: 0 } }),
      React.createElement(ColorPicker, {
        value: curUnderlineColor,
        onChange: function(c) { setCurUnderlineColor(c); pushColorHist(c); if (activeFmt.underline) clearDecoration("underline"); wrapStyle(_underlineStyle(c)); },
        history: colorHist,
        onHistory: pushColorHist,
        quickColors: underlineColors,
        onQuickColors: saveUnderlineColors,
        compact: true
      }),
      _sep(),
      
      React.createElement("span", {
        onMouseDown: function(e){
          e.preventDefault();
          if (activeFmt.hilite) clearDecoration("hilite");
          else { _applyHilite(curHiliteColor); }
        },
        onTouchEnd: function(e){
          e.preventDefault();
          if (activeFmt.hilite) clearDecoration("hilite");
          else { _applyHilite(curHiliteColor); }
        },
        title: activeFmt.hilite ? "マーカー: 適用中 (タップで解除)" : "蛍光ハイライトを適用",
        style: { fontSize: 13, fontWeight: 700, color: "#333",
          background: _toHiliteRgba(curHiliteColor), padding: "1px 5px", borderRadius: 3,
          cursor: "pointer", userSelect: "none",
          border: activeFmt.hilite ? "1.5px solid #C0392B" : "1.5px solid transparent",
          boxShadow: activeFmt.hilite ? "0 0 0 1px #fff inset" : "none" }
      }, "H"),
      React.createElement("span", { style: { display: "inline-block", width: 6, flexShrink: 0 } }),
      React.createElement(ColorPicker, {
        value: curHiliteColor,
        onChange: function(c) { setCurHiliteColor(c); pushColorHist(c); if (activeFmt.hilite) clearDecoration("hilite"); _applyHilite(c); },
        history: colorHist,
        onHistory: pushColorHist,
        quickColors: hiliteColors,
        onQuickColors: saveHiliteColors,
        compact: true
      }),
      _sep(),
      
      React.createElement("span", {
        onMouseDown: function(e){ e.preventDefault(); fmt("removeFormat"); },
        onTouchEnd: function(e){ e.preventDefault(); fmt("removeFormat"); },
        title: "注釈解除 (全書式を解除)",
        style: Object.assign({}, _btnBaseStyle, { background: "#fff", color: "#888", fontWeight: 600 })
      }, "注釈解除")
    );
  };
  var showToolbar = isFocused;
  
  var _usVVB = useState(0), _usVVBA = _slicedToArray(_usVVB, 2),
      vvBottomOffset = _usVVBA[0], setVvBottomOffset = _usVVBA[1];
  useEffect(function() {
    if (!showToolbar) return;
    var vv = (typeof window !== "undefined") ? window.visualViewport : null;
    if (!vv) return;
    var update = function() {
      
      
      var hidden = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
      setVvBottomOffset(hidden);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return function() {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [showToolbar]);
  var toolbar = showToolbar && ReactDOM.createPortal(
    React.createElement("div", {
      "data-sn-rme-toolbar": "1",
      onMouseDown: function(e){ e.preventDefault(); },
      style: {
        position: "fixed",
        bottom: vvBottomOffset, left: 0, right: 0, zIndex: 9999,
        background: "#fff", borderTop: "1px solid #e0ddd6",
        padding: IS_TOUCH ? "8px 10px max(8px,env(safe-area-inset-bottom,8px))" : "8px 12px",
        display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
        boxShadow: "0 -4px 16px rgba(0,0,0,.12)",
        overflowX: "auto"
      }
    }, React.createElement(ToolbarContent, null)),
    document.body
  );
  var fileInputRef = useRef(null);
  
  var _onFocus = function() {
    setIsFocused(true);
    saveSel();
  };
  var _onBlur = function() {
    
    setTimeout(function() {
      var ae = document.activeElement;
      var inToolbar = ae && ae.closest && ae.closest("[data-sn-rme-toolbar]");
      if (!inToolbar && ae !== ref.current) {
        setIsFocused(false);
      }
    }, 100);
    
    if (emitTimerRef.current) { clearTimeout(emitTimerRef.current); emitTimerRef.current = null; }
    emit();
    setIsEmpty(_isEmpty());
  };
  return React.createElement("div", null,
    toolbar,
    zoomSrc && React.createElement(ZoomLightbox, {
      src: zoomSrc.src || zoomSrc,
      onClose: function(){ setZoomSrc(null); },
      annotProps: zoomSrc.imgEl ? {
        img: { base64: (zoomSrc.src || "").replace(/^data:[^;]+;base64,/, ""),
               mt: ((zoomSrc.src || "").match(/^data:([^;]+)/) || [])[1] || "image/png" },
        onSave: function(ed) {
          
          var newSrc = ed.base64 ? "data:" + (ed.mt || "image/png") + ";base64," + ed.base64 : zoomSrc.src;
          if (zoomSrc.imgEl && zoomSrc.imgEl.parentNode) {
            zoomSrc.imgEl.src = newSrc;
          }
          
          scheduleEmit();
          setZoomSrc(null);
        }
      } : null
    }),
    React.createElement("div", { style: { position: "relative" } },
      React.createElement("div", {
        ref: ref,
        className: "sn-rme-editable",
        contentEditable: true,
        suppressContentEditableWarning: true,
        onInput: function() {
          
          
          var nowEmpty = _isEmpty();
          setIsEmpty(function(p) { return p === nowEmpty ? p : nowEmpty; });
          saveSel();
          scheduleEmit();
        },
        onFocus: _onFocus,
        onBlur: _onBlur,
        onMouseUp: saveSel,
        onKeyDown: function() {
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(function(){ typingTimer.current = null; }, 300);
        },
        onPaste: onPaste,
        onDrop: onDrop,
        onDragOver: function(e){ e.preventDefault(); },
        onClick: onClickHandler,
        style: {
          minHeight: imgHeight + 20,
          padding: 12,
          border: "1px solid #d8d3c8",
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.7,
          background: "#fff",
          outline: "none",
          overflow: "auto",
          wordBreak: "break-word"
        }
      }),
      isEmpty && placeholder && React.createElement("div", {
        style: {
          position: "absolute", top: 13, left: 13,
          fontSize: 14, color: "#bbb", pointerEvents: "none",
          userSelect: "none"
        }
      }, placeholder)
    ),
    React.createElement("div", {
      style: { marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }
    },
      React.createElement("input", {
        ref: fileInputRef, type: "file", accept: "image/*",
        style: { display: "none" },
        onChange: function(e) {
          var f = e.target.files && e.target.files[0];
          if (f) insertImageFromFile(f);
          e.target.value = "";
        }
      }),
      React.createElement("button", {
        onClick: function() { if (fileInputRef.current) fileInputRef.current.click(); },
        style: {
          padding: "5px 11px", fontSize: 12, fontWeight: 600,
          background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#4338CA",
          borderRadius: 5, cursor: "pointer",
          minHeight: IS_TOUCH ? 36 : 28
        }
      }, "🖼️ 画像追加"),
      React.createElement("span", {
        style: { fontSize: 11, color: "#999", flex: 1 }
      }, "コピペ・D&Dで挿入。画像クリックで拡大、× で削除。文章を選択するとツールバーが出ます。")
    )
  );
}


function LightTextarea(_propsLT) {
  var value = _propsLT.value || "";
  var onChange = _propsLT.onChange;
  var rest = {};
  Object.keys(_propsLT).forEach(function(k) {
    if (k !== "value" && k !== "onChange") rest[k] = _propsLT[k];
  });
  var _usLT = useState(value), _usLTA = _slicedToArray(_usLT, 2),
      local = _usLTA[0], setLocal = _usLTA[1];
  var ref = useRef(null);
  
  useEffect(function() {
    if (ref.current && document.activeElement !== ref.current && value !== local) {
      setLocal(value);
    }
    
  }, [value]);
  var origOnBlur = rest.onBlur;
  return React.createElement("textarea", Object.assign({}, rest, {
    ref: ref,
    value: local,
    onChange: function(e) { setLocal(e.target.value); },
    onBlur: function(e) {
      if (e.target.value !== value && onChange) onChange(e.target.value);
      if (origOnBlur) origOnBlur(e);
    }
  }));
}


function _summaryMemoToHtml(memo) {
  if (!memo) return "";
  var html = "";
  
  var t = memo.text || "";
  if (t) {
    if (t.indexOf("<") >= 0 && t.indexOf(">") >= 0) {
      html += t;
    } else {
      html += t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    }
  }
  
  
  var imgs = memo.images || [];
  imgs.forEach(function(im, i) {
    var src = imgSrc(im);
    if (src) {
      html += '<img src="' + src + '" data-sn-rme-img="1">';
    }
  });
  
  if (imgs.length > 0) {
    html += '&nbsp;<br>';
  }
  return html;
}

function MemoSection(_ref16) {
  var memo = _ref16.memo,
    _onChange = _ref16.onChange,
    titleSuffix = _ref16.titleSuffix,
    title = _ref16.title, 
    guardKey = _ref16.guardKey; 
  var _useState79 = useState(null),
    _useState80 = _slicedToArray(_useState79, 2),
    viewIdx = _useState80[0],
    setViewIdx = _useState80[1],
    _useState81 = useState(null),
    _useState82 = _slicedToArray(_useState81, 2),
    annotIdx = _useState82[0],
    setAnnotIdx = _useState82[1];
  useModalBack(viewIdx != null, function(){ setViewIdx(null); }, "memo-view");
  useModalBack(annotIdx != null, function(){ setAnnotIdx(null); }, "memo-annot");
  var m = memo || {
    text: "",
    images: []
  };
  var imgs = m.images || [];
  var navLabel = imgs.length > 1 && viewIdx != null ? viewIdx + 1 + "/" + imgs.length : null;
  var viewSrc = viewIdx != null && imgs[viewIdx] ? imgSrc(imgs[viewIdx]) : null;
  var viewAnnotProps = viewIdx != null && imgs[viewIdx] ? {
    img: imgs[viewIdx],
    onSave: function onSave(ed) {
      var ni = _toConsumableArray(imgs);
      ni[viewIdx] = ed;
      _onChange(_objectSpread(_objectSpread({}, m), {}, {
        images: ni
      }));
    }
  } : null;
  var annotNavLabel = imgs.length > 1 && annotIdx != null ? annotIdx + 1 + "/" + imgs.length : null;
  return React.createElement("div", null, annotIdx != null && React.createElement(ImageAnnotator, {
    img: imgs[annotIdx],
    onSave: function onSave(ed) {
      var ni = _toConsumableArray(imgs);
      ni[annotIdx] = ed;
      _onChange(_objectSpread(_objectSpread({}, m), {}, {
        images: ni
      }));
      setAnnotIdx(null);
    },
    onClose: function onClose() {
      return setAnnotIdx(null);
    },
    onPrev: annotIdx > 0 ? function () {
      return setAnnotIdx(function (i) {
        return i - 1;
      });
    } : null,
    onNext: annotIdx < imgs.length - 1 ? function () {
      return setAnnotIdx(function (i) {
        return i + 1;
      });
    } : null,
    navLabel: annotNavLabel
  }), viewSrc && React.createElement(ZoomLightbox, {
    src: viewSrc,
    annotProps: viewAnnotProps,
    onClose: function onClose() {
      return setViewIdx(null);
    },
    onPrev: viewIdx > 0 ? function () {
      return setViewIdx(function (i) {
        return i - 1;
      });
    } : null,
    onNext: viewIdx < imgs.length - 1 ? function () {
      return setViewIdx(function (i) {
        return i + 1;
      });
    } : null,
    navLabel: navLabel
  }), React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#888",
      fontWeight: 600,
      marginBottom: 6
    }
  }, (title || "\uD83D\uDCDD \u30E1\u30E2") + (titleSuffix ? " (" + titleSuffix + ")" : "")),
  React.createElement(MemoEditableField, {
    html: m.text || "",
    onSave: function(h) {
      _onChange(_objectSpread(_objectSpread({}, m), {}, { text: h }));
    },
    placeholder: "",
    autoEdit: false,
    guardOwner: guardKey || ("memoSection_" + (titleSuffix || "default"))
  }), React.createElement(ImgGrid, {
    images: imgs,
    onRemove: function onRemove(i) {
      return _onChange(_objectSpread(_objectSpread({}, m), {}, {
        images: imgs.filter(function (_, j) {
          return j !== i;
        })
      }));
    },
    onAnnotate: function onAnnotate(i) {
      return setAnnotIdx(i);
    },
    onEnlarge: function onEnlarge(i) {
      return setViewIdx(i);
    },
    onUpdateImg: function onUpdateImg(i, ed) {
      var ni = _toConsumableArray(imgs);
      ni[i] = ed;
      _onChange(_objectSpread(_objectSpread({}, m), {}, {
        images: ni
      }));
    },
    onToggleStar: function onToggleStar(i) {
      var ni = _toConsumableArray(imgs);
      ni[i] = Object.assign({}, ni[i], { star: !(ni[i] && ni[i].star) });
      _onChange(_objectSpread(_objectSpread({}, m), {}, {
        images: ni
      }));
    }
  }), React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, React.createElement(PasteZone, {
    onImage: function onImage(img) {
      return _onChange(_objectSpread(_objectSpread({}, m), {}, {
        images: [].concat(_toConsumableArray(imgs), [img])
      }));
    },
    compact: true
  })));
}

function TagPicker(_ref17) {
  var cats = _ref17.cats,
    tags = _ref17.tags,
    sel = _ref17.sel,
    _onToggle = _ref17.onToggle,
    _onAdd = _ref17.onAdd,
    onAddCat = _ref17.onAddCat,
    onDelTag = _ref17.onDelTag,
    onDelTagFromCat = _ref17.onDelTagFromCat,
    onDelCat = _ref17.onDelCat,
    onReorderCats = _ref17.onReorderCats,
    onReorderItems = _ref17.onReorderItems,
    onReorderLoose = _ref17.onReorderLoose,
    onRenameCat = _ref17.onRenameCat,
    onRenameItem = _ref17.onRenameItem,
    onRenameLoose = _ref17.onRenameLoose,
    label = _ref17.label,
    hideAddRoot = _ref17.hideAddRoot,
    tagColors = _ref17.tagColors || {},
    onSetTagColor = _ref17.onSetTagColor;
  
  var _useCatR = useState({}),
    _useCatRA = _slicedToArray(_useCatR, 2),
    catRenameMap = _useCatRA[0], setCatRenameMap = _useCatRA[1];
  var _useState83 = useState(null),
    _useState84 = _slicedToArray(_useState83, 2),
    deleteDlg = _useState84[0],
    setDeleteDlg = _useState84[1];
  var _useState85 = useState(null),
    _useState86 = _slicedToArray(_useState85, 2),
    catDrag = _useState86[0],
    setCatDrag = _useState86[1],
    _useState87 = useState(null),
    _useState88 = _slicedToArray(_useState87, 2),
    catOver = _useState88[0],
    setCatOver = _useState88[1];
  var itemDragRef = useRef({}),
    _useState89 = useState({}),
    _useState90 = _slicedToArray(_useState89, 2),
    itemOver = _useState90[0],
    setItemOver = _useState90[1];
  var looseDragRef = useRef(null),
    _useState91 = useState(null),
    _useState92 = _slicedToArray(_useState91, 2),
    looseOver = _useState92[0],
    setLooseOver = _useState92[1];
  var askDelete = function askDelete(msg, fn) {
    return setDeleteDlg({
      msg: msg,
      fn: fn
    });
  };
  var catKeys = Object.keys(cats || {});
  var catTS = useRef({
    on: false,
    timer: null
  });
  var catTStart = function catTStart(e, ci) {
    if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;
    catTS.current = {
      on: false,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      timer: setTimeout(function () {
        catTS.current.on = true;
        setCatDrag(ci);
      }, 300)
    };
  };
  var catTMove = function catTMove(e) {
    if (!catTS.current.on) {
      var _e$touches$ = e.touches[0],
        _clientX = _e$touches$.clientX,
        _clientY = _e$touches$.clientY;
      var dx = _clientX - (catTS.current.startX || 0),
        dy = _clientY - (catTS.current.startY || 0);
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) clearTimeout(catTS.current.timer);
      return;
    }
    e.preventDefault();
    var _e$touches$2 = e.touches[0],
      clientX = _e$touches$2.clientX,
      clientY = _e$touches$2.clientY;
    var el = document.elementFromPoint(clientX, clientY);
    while (el) {
      if (el.dataset && el.dataset.catI != null) {
        setCatOver(parseInt(el.dataset.catI));
        break;
      }
      el = el.parentElement;
    }
  };
  var catTEnd = function catTEnd() {
    clearTimeout(catTS.current.timer);
    if (catTS.current.on && catDrag != null && catOver != null && catDrag !== catOver) {
      var arr = [].concat(catKeys);
      var _arr$splice = arr.splice(catDrag, 1),
        _arr$splice2 = _slicedToArray(_arr$splice, 1),
        k = _arr$splice2[0];
      arr.splice(catOver, 0, k);
      onReorderCats && onReorderCats(arr);
    }
    setCatDrag(null);
    setCatOver(null);
    catTS.current = {
      on: false,
      timer: null
    };
  };
  var itemTS = useRef({
    on: false,
    timer: null,
    cat: null
  });
  var itemTStart = function itemTStart(e, cat, ti) {
    e.stopPropagation();
    if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;
    itemTS.current = {
      on: false,
      cat: cat,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      timer: setTimeout(function () {
        itemTS.current.on = true;
        itemDragRef.current[cat] = ti;
      }, 300)
    };
  };
  var itemTMove = function itemTMove(e, cat) {
    if (!itemTS.current.on) {
      var _e$touches$3 = e.touches[0],
        _clientX2 = _e$touches$3.clientX,
        _clientY2 = _e$touches$3.clientY;
      var dx = _clientX2 - (itemTS.current.startX || 0),
        dy = _clientY2 - (itemTS.current.startY || 0);
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) clearTimeout(itemTS.current.timer);
      return;
    }
    e.preventDefault();
    var _e$touches$4 = e.touches[0],
      clientX = _e$touches$4.clientX,
      clientY = _e$touches$4.clientY;
    var el = document.elementFromPoint(clientX, clientY);
    while (el) {
      if (el.dataset && el.dataset.itemCat === cat && el.dataset.itemI != null) {
        setItemOver(function (p) {
          return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, cat, parseInt(el.dataset.itemI)));
        });
        break;
      }
      el = el.parentElement;
    }
  };
  var itemTEnd = function itemTEnd(cat, items) {
    clearTimeout(itemTS.current.timer);
    var from = itemDragRef.current[cat],
      to = (itemOver || {})[cat];
    if (itemTS.current.on && from != null && to != null && from !== to) {
      var arr = _toConsumableArray(items);
      var _arr$splice3 = arr.splice(from, 1),
        _arr$splice4 = _slicedToArray(_arr$splice3, 1),
        it = _arr$splice4[0];
      arr.splice(to, 0, it);
      onReorderItems && onReorderItems(cat, arr);
    }
    itemDragRef.current[cat] = null;
    setItemOver(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, cat, null));
    });
    itemTS.current = {
      on: false,
      timer: null,
      cat: null
    };
  };
  var looseTS = useRef({
    on: false,
    timer: null
  });
  var looseTStart = function looseTStart(e, ti) {
    if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;
    looseTS.current = {
      on: false,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      timer: setTimeout(function () {
        looseTS.current.on = true;
        looseDragRef.current = ti;
      }, 300)
    };
  };
  var looseTMove = function looseTMove(e) {
    if (!looseTS.current.on) {
      var _e$touches$5 = e.touches[0],
        _clientX3 = _e$touches$5.clientX,
        _clientY3 = _e$touches$5.clientY;
      var dx = _clientX3 - (looseTS.current.startX || 0),
        dy = _clientY3 - (looseTS.current.startY || 0);
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) clearTimeout(looseTS.current.timer);
      return;
    }
    e.preventDefault();
    var _e$touches$6 = e.touches[0],
      clientX = _e$touches$6.clientX,
      clientY = _e$touches$6.clientY;
    var el = document.elementFromPoint(clientX, clientY);
    while (el) {
      if (el.dataset && el.dataset.looseI != null) {
        setLooseOver(parseInt(el.dataset.looseI));
        break;
      }
      el = el.parentElement;
    }
  };
  var looseTEnd = function looseTEnd(currentTags) {
    clearTimeout(looseTS.current.timer);
    var from = looseDragRef.current;
    if (looseTS.current.on && from != null && looseOver != null && from !== looseOver) {
      var arr = _toConsumableArray(currentTags || []);
      var _arr$splice5 = arr.splice(from, 1),
        _arr$splice6 = _slicedToArray(_arr$splice5, 1),
        it = _arr$splice6[0];
      arr.splice(looseOver, 0, it);
      onReorderLoose && onReorderLoose(arr);
    }
    looseDragRef.current = null;
    setLooseOver(null);
    looseTS.current = {
      on: false,
      timer: null
    };
  };
  var TagBtn = function TagBtn(_ref18) {
    var lbl = _ref18.label,
      on = _ref18.on,
      tog = _ref18.onToggle,
      onDel = _ref18.onDel,
      onRename = _ref18.onRename,
      tagKey = _ref18.tagKey;
    var customColor = (tagKey && tagColors) ? (tagColors[tagKey] || null) : null;
    var _ref19 = customColor ? _tagColorTriple(customColor, on) : (on ? TAG_SEL : TAG_UNS),
      _ref20 = _slicedToArray(_ref19, 3),
      bg = _ref20[0],
      bd = _ref20[1],
      fg = _ref20[2];
    var bw = on ? "2px" : "1.5px";
    
    
    var _useDC = useState(false),
      _useDCA = _slicedToArray(_useDC, 2),
      delConfirm = _useDCA[0], setDelConfirm = _useDCA[1];
    
    var _useRC = useState(false),
      _useRCA = _slicedToArray(_useRC, 2),
      renameMode = _useRCA[0], setRenameMode = _useRCA[1];
    var _useRV = useState(lbl),
      _useRVA = _slicedToArray(_useRV, 2),
      renameVal = _useRVA[0], setRenameVal = _useRVA[1];
    
    var _useCP = useState(false),
      _useCPA = _slicedToArray(_useCP, 2),
      colorPopup = _useCPA[0], setColorPopup = _useCPA[1];
    
    useEffect(function() {
      if (!colorPopup) return;
      var _close = function() { setColorPopup(false); };
      document.addEventListener('click', _close);
      return function() { document.removeEventListener('click', _close); };
    }, [colorPopup]);
    if (delConfirm && onDel) {
      return React.createElement("span", {
        style: {
          display: "inline-flex", alignItems: "stretch",
          borderRadius: 7, overflow: "hidden",
          border: bw + " solid #DC2626"
        }
      },
        React.createElement("span", {
          style: {
            padding: IS_TOUCH ? "7px 10px" : "5px 8px",
            fontSize: 12, fontWeight: 700, color: "#DC2626",
            background: "#FEF2F2", lineHeight: 1.4, userSelect: "none",
            whiteSpace: "nowrap"
          }
        }, "「" + lbl + "」を削除？"),
        React.createElement("span", {
          onClick: function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            setDelConfirm(false);
            try { onDel(); } catch(_){}
          },
          title: "削除",
          style: {
            display: "flex", alignItems: "center",
            padding: IS_TOUCH ? "0 12px" : "0 10px",
            background: "#DC2626", color: "#fff",
            cursor: "pointer", fontSize: 13, fontWeight: 700,
            borderLeft: "1px solid #B91C1C"
          }
        }, "✓"),
        React.createElement("span", {
          onClick: function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            setDelConfirm(false);
          },
          title: "キャンセル",
          style: {
            display: "flex", alignItems: "center",
            padding: IS_TOUCH ? "0 12px" : "0 10px",
            background: "#fff", color: "#666",
            cursor: "pointer", fontSize: 12,
            borderLeft: "1px solid #FECACA"
          }
        }, "\u2715")
      );
    }
    if (renameMode && onRename) {
      var _commitRename = function() {
        var nv = (renameVal || "").trim();
        if (!nv || nv === lbl) { setRenameMode(false); setRenameVal(lbl); return; }
        setRenameMode(false);
        try { onRename(nv); } catch(_){}
      };
      var _cancelRename = function() { setRenameMode(false); setRenameVal(lbl); };
      return React.createElement("span", {
        style: {
          display: "inline-flex", alignItems: "stretch",
          borderRadius: 7, overflow: "hidden",
          border: bw + " solid #2563EB"
        }
      },
        React.createElement("input", {
          type: "text",
          value: renameVal,
          autoFocus: true,
          onChange: function(e) { setRenameVal(e.target.value); },
          onClick: function(e) { if (e && e.stopPropagation) e.stopPropagation(); },
          onKeyDown: function(e) {
            if (e.key === "Enter") { e.preventDefault(); _commitRename(); }
            else if (e.key === "Escape") { e.preventDefault(); _cancelRename(); }
          },
          style: {
            padding: IS_TOUCH ? "6px 8px" : "4px 6px",
            fontSize: 13, fontWeight: 600, color: "#1E40AF",
            background: "#EFF6FF", border: "none", outline: "none",
            minWidth: Math.max(80, (lbl.length + 2) * 12), maxWidth: 200,
            lineHeight: 1.4
          }
        }),
        React.createElement("span", {
          onClick: function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            _commitRename();
          },
          title: "決定",
          style: {
            display: "flex", alignItems: "center",
            padding: IS_TOUCH ? "0 12px" : "0 10px",
            background: "#2563EB", color: "#fff",
            cursor: "pointer", fontSize: 13, fontWeight: 700,
            borderLeft: "1px solid #1D4ED8"
          }
        }, "✓"),
        React.createElement("span", {
          onClick: function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            _cancelRename();
          },
          title: "キャンセル",
          style: {
            display: "flex", alignItems: "center",
            padding: IS_TOUCH ? "0 12px" : "0 10px",
            background: "#fff", color: "#666",
            cursor: "pointer", fontSize: 12,
            borderLeft: "1px solid #BFDBFE"
          }
        }, "\u2715")
      );
    }
    var hasRename = !!onRename, hasDel = !!onDel;
    var hasColor = !!(onSetTagColor && tagKey);
    var hasAfter = hasRename || hasDel || hasColor;
    return React.createElement("span", {
      style: { display: "inline-flex", alignItems: "stretch", position: "relative" }
    },
    React.createElement("span", {
      onClick: tog,
      onTouchEnd: function(e) { e.preventDefault(); if (tog) tog(); },
      style: _objectSpread(_objectSpread({
        padding: IS_TOUCH ? "7px 14px" : "5px 12px",
        borderRadius: hasAfter ? "7px 0 0 7px" : "7px",
        fontSize: 13,
        fontWeight: on ? 700 : 500,
        background: bg,
        color: fg,
        border: bw + " solid " + bd
      }, hasAfter ? { borderRight: "none" } : {}), {}, {
        cursor: "pointer",
        lineHeight: 1.4,
        userSelect: "none"
      })
    }, lbl),
    hasRename && React.createElement("span", {
      onClick: function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        setRenameVal(lbl);
        setRenameMode(true);
      },
      title: "名前変更",
      style: {
        display: "flex", alignItems: "center",
        padding: IS_TOUCH ? "0 10px" : "0 7px",
        borderRadius: "0",
        background: "#f5f5f5",
        border: bw + " solid " + bd,
        borderLeft: "1px solid #ddd",
        borderRight: "none",
        cursor: "pointer",
        fontSize: IS_TOUCH ? 12 : 10,
        color: "#888"
      },
      onMouseEnter: function(e) { e.currentTarget.style.background = "#DBEAFE"; e.currentTarget.style.color = "#2563EB"; },
      onMouseLeave: function(e) { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#888"; }
    }, "✎"),
    hasColor && React.createElement("span", {
      onClick: function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        setColorPopup(function(v) { return !v; });
      },
      title: customColor ? "色変更（現在: " + customColor + "）" : "タグに色を付ける",
      style: {
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: IS_TOUCH ? "0 10px" : "0 7px",
        borderRadius: hasDel ? "0" : "0 7px 7px 0",
        background: colorPopup ? "#FFF8E1" : "#f5f5f5",
        border: bw + " solid " + bd,
        borderLeft: "1px solid #ddd",
        borderRight: hasDel ? "none" : (bw + " solid " + bd),
        cursor: "pointer"
      }
    },
      React.createElement("span", {
        style: {
          width: 10, height: 10, borderRadius: "50%",
          background: customColor || "#ccc",
          border: customColor ? "none" : "1.5px dashed #aaa",
          display: "inline-block", flexShrink: 0
        }
      })
    ),
    hasDel && React.createElement("span", {
      onClick: function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        setDelConfirm(true);
      },
      title: "削除",
      style: {
        display: "flex", alignItems: "center",
        padding: IS_TOUCH ? "0 12px" : "0 8px",
        borderRadius: "0 7px 7px 0",
        background: "#f5f5f5",
        border: bw + " solid " + bd,
        borderLeft: "1px solid #ddd",
        cursor: "pointer",
        fontSize: IS_TOUCH ? 13 : 10,
        color: "#888"
      },
      onMouseEnter: function(e) { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.color = "#C0392B"; },
      onMouseLeave: function(e) { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#888"; }
    }, "✕"),
    colorPopup && hasColor && React.createElement("span", {
      onClick: function(e) { if (e && e.stopPropagation) e.stopPropagation(); },
      style: {
        position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 9999,
        background: "#fff", border: "1px solid #e0ddd6", borderRadius: 8,
        padding: "6px 8px", display: "flex", flexWrap: "wrap", gap: 5,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)", minWidth: 150
      }
    },
      _TAG_QC.map(function(c) {
        return React.createElement("span", {
          key: c,
          onClick: function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            try { onSetTagColor(tagKey, c); } catch(_){}
            setColorPopup(false);
          },
          style: {
            width: IS_TOUCH ? 26 : 22, height: IS_TOUCH ? 26 : 22,
            borderRadius: "50%", background: c,
            cursor: "pointer", flexShrink: 0,
            border: c === customColor ? "2.5px solid #1a1a1a" : "2px solid rgba(0,0,0,0.12)",
            boxSizing: "border-box"
          }
        });
      }),
      customColor && React.createElement("span", {
        onClick: function(e) {
          if (e && e.stopPropagation) e.stopPropagation();
          try { onSetTagColor(tagKey, null); } catch(_){}
          setColorPopup(false);
        },
        style: {
          fontSize: 10, color: "#888", cursor: "pointer",
          display: "flex", alignItems: "center", padding: "0 4px",
          border: "1px solid #e0ddd6", borderRadius: 4,
          background: "#f5f4f0", whiteSpace: "nowrap"
        }
      }, "× リセット")
    ));
  };
  var _useState93 = useState(false),
    _useState94 = _slicedToArray(_useState93, 2),
    tagOpen = _useState94[0],
    setTagOpen = _useState94[1];
  useModalBack(tagOpen, function(){ setTagOpen(false); }, "tag-picker");
  return React.createElement("div", {
    style: {
      marginBottom: 14
    },
    onTouchMove: function onTouchMove(e) {
      catTMove(e);
      looseTMove(e);
    },
    onTouchEnd: function onTouchEnd() {
      catTEnd();
      looseTEnd(tags);
    },
    onTouchCancel: function onTouchCancel() {
      catTEnd();
      looseTEnd(tags);
    }
  }, deleteDlg && React.createElement(DeleteDlg, {
    msg: deleteDlg.msg,
    onOk: function onOk() {
      deleteDlg.fn();
      setDeleteDlg(null);
    },
    onCancel: function onCancel() {
      return setDeleteDlg(null);
    }
  }), sel && sel.length > 0 && React.createElement("div", {
    style: {
      marginBottom: 8,
      padding: "8px 10px",
      background: "#EBF8FF",
      borderRadius: 8,
      border: "1.5px solid #BAE0FF"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 3
    }
  }, sel.map(function (tag) {
    return React.createElement("span", {
      key: tag,
      onClick: function onClick() {
        return _onToggle(tag);
      },
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "3px 9px",
        borderRadius: 5,
        fontSize: 12,
        fontWeight: 600,
        background: "#EEF4FF",
        color: "#1a1a1a",
        border: "1.5px solid #7A9CC8",
        cursor: "pointer",
        userSelect: "none"
      }
    }, stripCat(tag), React.createElement("span", {
      style: {
        opacity: .5,
        fontSize: 10
      }
    }, "\u2715"));
  }))), !tagOpen && React.createElement("button", {
    onClick: function onClick() {
      return setTagOpen(true);
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: IS_TOUCH ? "8px 14px" : "6px 12px",
      fontSize: 12,
      fontWeight: 600,
      background: "#f5f4f0",
      border: "1.5px dashed #bbb",
      borderRadius: 7,
      cursor: "pointer",
      color: "#888",
      userSelect: "none"
    }
  }, "\uD83C\uDFF7\uFE0F \u30BF\u30B0\u3092\u3064\u3051\u308B"), tagOpen && React.createElement("div", {
    onClick: function onBgClick() { setTagOpen(false); },
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function(e){ e.stopPropagation(); },
    style: {
      background: "#fff", borderRadius: 12,
      maxWidth: 900, width: "100%", maxHeight: "90vh",
      display: "flex", flexDirection: "column"
    }
  },
    
    React.createElement("div", {
      style: {
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", borderBottom: "1px solid #e0ddd6",
        flexShrink: 0
      }
    },
      React.createElement("button", {
        onClick: function(){ setTagOpen(false); },
        style: {
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          background: "#f5f4f0", color: "#555", border: "1px solid #ccc",
          borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28
        }
      }, "\u2715 \u9589\u3058\u308B"),
      React.createElement("div", {
        style: { fontSize: 15, fontWeight: 700, color: "#1a1a1a" }
      }, label || "タグ")
    ),
    
    React.createElement("div", {
      style: { padding: 16, overflowY: "auto", flex: 1 }
    }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
      padding: "8px 12px",
      background: "#f5f4f0",
      borderRadius: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#888",
      fontWeight: 600
    }
  }, "\u30AB\u30C6\u30B4\u30EA\u8FFD\u52A0:"), React.createElement(AddBtn, {
    onAdd: function onAdd(name) {
      if (name && !(cats || {})[name]) onAddCat && onAddCat(name);
    },
    ph: "\u30AB\u30C6\u30B4\u30EA\u540D"
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 8,
      alignItems: "start"
    }
  }, catKeys.map(function (cat, ci) {
    var items = cats[cat] || [];
    return React.createElement("div", {
      key: cat,
      "data-cat-i": ci,
      draggable: true,
      onDragStart: function onDragStart() {
        return setCatDrag(ci);
      },
      onDragOver: function onDragOver(e) {
        e.preventDefault();
        setCatOver(ci);
      },
      onDrop: function onDrop(e) {
        e.preventDefault();
        if (catDrag != null && catDrag !== ci) {
          var arr = [].concat(catKeys);
          var _arr$splice7 = arr.splice(catDrag, 1),
            _arr$splice8 = _slicedToArray(_arr$splice7, 1),
            k = _arr$splice8[0];
          arr.splice(ci, 0, k);
          onReorderCats && onReorderCats(arr);
        }
        setCatDrag(null);
        setCatOver(null);
      },
      onDragEnd: function onDragEnd() {
        setCatDrag(null);
        setCatOver(null);
      },
      onTouchStart: function onTouchStart(e) {
        return catTStart(e, ci);
      },
      onTouchMove: catTMove,
      onTouchEnd: catTEnd,
      onTouchCancel: catTEnd,
      style: {
        padding: "6px 10px 6px 12px",
        borderLeft: "4px solid " + (catOver === ci ? "#6366F1" : "#C7D2FE"),
        borderRadius: "0 8px 8px 0",
        background: catOver === ci ? "#F0F0FF" : "#F8F7FF",
        cursor: "grab",
        opacity: catDrag === ci ? .4 : 1
      }
    }, React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginRight: 6,
        marginBottom: 4
      }
    },
      
      React.createElement("span", {
        style: {
          fontSize: 12,
          color: "#a5b4fc",
          userSelect: "none"
        }
      }, "\u283F"),
      
      (catRenameMap[cat] !== undefined && onRenameCat)
        ? React.createElement("input", {
            type: "text",
            value: catRenameMap[cat],
            autoFocus: true,
            onChange: function(e) {
              var v = e.target.value;
              setCatRenameMap(function(m) { var n = Object.assign({}, m); n[cat] = v; return n; });
            },
            onClick: function(e) { if (e && e.stopPropagation) e.stopPropagation(); },
            onKeyDown: function(e) {
              if (e.key === "Enter") {
                e.preventDefault();
                var nv = (catRenameMap[cat] || "").trim();
                setCatRenameMap(function(m) { var n = Object.assign({}, m); delete n[cat]; return n; });
                if (nv && nv !== cat && onRenameCat) { try { onRenameCat(cat, nv); } catch(_){} }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setCatRenameMap(function(m) { var n = Object.assign({}, m); delete n[cat]; return n; });
              }
            },
            style: {
              fontSize: 13, fontWeight: 700, color: "#1E40AF",
              background: "#EFF6FF", border: "1.5px solid #2563EB",
              borderRadius: 4, padding: "2px 6px",
              minWidth: 80, maxWidth: 200, outline: "none"
            }
          })
        : React.createElement("span", {
            style: {
              fontSize: 13,
              fontWeight: 700,
              color: "#1a1a1a"
            }
          }, cat),
      
      (catRenameMap[cat] !== undefined && onRenameCat)
        ? React.createElement("span", {
            onClick: function(e) {
              if (e && e.stopPropagation) e.stopPropagation();
              var nv = ((catRenameMap[cat] || "")).trim();
              setCatRenameMap(function(m) { var n = Object.assign({}, m); delete n[cat]; return n; });
              if (nv && nv !== cat && onRenameCat) { try { onRenameCat(cat, nv); } catch(_){} }
            },
            title: "決定",
            style: {
              cursor: "pointer", fontSize: IS_TOUCH ? 13 : 11,
              color: "#fff", background: "#2563EB",
              padding: "2px 8px", borderRadius: 4,
              border: "1px solid #1D4ED8",
              fontWeight: 700, lineHeight: 1.3
            }
          }, "\u2713")
        : (onRenameCat && React.createElement("span", {
            onClick: function(e) {
              if (e && e.stopPropagation) e.stopPropagation();
              setCatRenameMap(function(m) { var n = Object.assign({}, m); n[cat] = cat; return n; });
            },
            title: "名前変更",
            style: {
              cursor: "pointer", fontSize: IS_TOUCH ? 12 : 10,
              color: "#a5b4fc",
              padding: "2px 6px", borderRadius: 4,
              border: "1px solid #C7D2FE",
              fontWeight: 700, lineHeight: 1.3
            },
            onMouseEnter: function(e) {
              e.currentTarget.style.color = "#2563EB";
              e.currentTarget.style.borderColor = "#2563EB";
              e.currentTarget.style.background = "#DBEAFE";
            },
            onMouseLeave: function(e) {
              e.currentTarget.style.color = "#a5b4fc";
              e.currentTarget.style.borderColor = "#C7D2FE";
              e.currentTarget.style.background = "transparent";
            }
          }, "\u270E")),
      
      (catRenameMap[cat] !== undefined && onRenameCat)
        ? React.createElement("span", {
            onClick: function(e) {
              if (e && e.stopPropagation) e.stopPropagation();
              setCatRenameMap(function(m) { var n = Object.assign({}, m); delete n[cat]; return n; });
            },
            title: "キャンセル",
            style: {
              cursor: "pointer", fontSize: IS_TOUCH ? 12 : 10,
              color: "#666", padding: "2px 6px",
              borderRadius: 4, border: "1px solid #BFDBFE",
              fontWeight: 600, lineHeight: 1.3, background: "#fff"
            }
          }, "\u2715")
        : React.createElement("span", {
            onClick: function onClick() {
              return askDelete("「" + cat + "」カテゴリを削除しますか？\n含まれるタグも全て削除されます。", function () {
                return onDelCat && onDelCat(cat);
              });
            },
            style: {
              cursor: "pointer",
              fontSize: IS_TOUCH ? 13 : 10,
              color: "#a5b4fc",
              padding: "2px 6px",
              borderRadius: 4,
              border: "1px solid #C7D2FE",
              fontWeight: 700,
              lineHeight: 1.3
            },
            onMouseEnter: function onMouseEnter(e) {
              e.currentTarget.style.color = "#C0392B";
              e.currentTarget.style.borderColor = "#C0392B";
              e.currentTarget.style.background = "#FCEBEB";
            },
            onMouseLeave: function onMouseLeave(e) {
              e.currentTarget.style.color = "#a5b4fc";
              e.currentTarget.style.borderColor = "#C7D2FE";
              e.currentTarget.style.background = "transparent";
            }
          }, "\u2715")
    ), React.createElement("div", {
      onTouchMove: function onTouchMove(e) {
        return itemTMove(e, cat);
      },
      onTouchEnd: function onTouchEnd() {
        return itemTEnd(cat, items);
      },
      onTouchCancel: function onTouchCancel() {
        return itemTEnd(cat, items);
      }
    }, items.map(function (item, ti) {
      var tag = cat + ":" + item,
        on = (sel || []).includes(tag);
      return React.createElement("span", {
        key: tag,
        "data-item-cat": cat,
        "data-item-i": ti,
        draggable: true,
        onDragStart: function onDragStart(e) {
          e.stopPropagation();
          itemDragRef.current[cat] = ti;
        },
        onDragOver: function onDragOver(e) {
          e.preventDefault();
          e.stopPropagation();
          setItemOver(function (p) {
            return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, cat, ti));
          });
        },
        onDrop: function onDrop(e) {
          e.preventDefault();
          e.stopPropagation();
          var from = itemDragRef.current[cat];
          if (from != null && from !== ti) {
            var arr = _toConsumableArray(items);
            var _arr$splice9 = arr.splice(from, 1),
              _arr$splice0 = _slicedToArray(_arr$splice9, 1),
              it = _arr$splice0[0];
            arr.splice(ti, 0, it);
            onReorderItems && onReorderItems(cat, arr);
          }
          itemDragRef.current[cat] = null;
          setItemOver(function (p) {
            return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, cat, null));
          });
        },
        onDragEnd: function onDragEnd(e) {
          e.stopPropagation();
          itemDragRef.current[cat] = null;
          setItemOver(function (p) {
            return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, cat, null));
          });
        },
        onTouchStart: function onTouchStart(e) {
          return itemTStart(e, cat, ti);
        },
        style: {
          display: "inline-flex",
          alignItems: "stretch",
          margin: "3px",
          outline: (itemOver || {})[cat] === ti ? "2px solid #6366F1" : "none",
          borderRadius: 7,
          cursor: "grab"
        }
      }, onReorderItems && items.length > 1 ? React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", justifyContent: "center", marginRight: 1, flexShrink: 0 } },
        React.createElement("button", { title: "前へ", onClick: function(e){ e.stopPropagation(); if(ti>0){ var a=_toConsumableArray(items); var x=a.splice(ti,1)[0]; a.splice(ti-1,0,x); onReorderItems(cat, a); } }, style: { border:"none", background:"transparent", padding:0, lineHeight:1, fontSize:9, cursor: ti>0?"pointer":"default", color: ti>0?"#9A3412":"#ddd" } }, "▲"),
        React.createElement("button", { title: "後へ", onClick: function(e){ e.stopPropagation(); if(ti<items.length-1){ var a=_toConsumableArray(items); var x=a.splice(ti,1)[0]; a.splice(ti+1,0,x); onReorderItems(cat, a); } }, style: { border:"none", background:"transparent", padding:0, lineHeight:1, fontSize:9, cursor: ti<items.length-1?"pointer":"default", color: ti<items.length-1?"#9A3412":"#ddd" } }, "▼")
      ) : null, React.createElement(TagBtn, {
        label: item,
        on: on,
        tagKey: tag,
        onToggle: function onToggle() {
          return _onToggle(tag);
        },
        onDel: function onDel() {
          
          if (onDelTagFromCat) onDelTagFromCat(cat, item);
        },
        onRename: onRenameItem ? function(newName) { onRenameItem(cat, item, newName); } : undefined,
        onSetColor: onSetTagColor ? function(color) { onSetTagColor(tag, color); } : undefined
      }));
    })), React.createElement(AddBtn, {
      onAdd: function onAdd(v) {
        return _onAdd(v, cat);
      },
      ph: "\u30BF\u30B0\u540D"
    }));
  })), (tags || []).length > 0 && React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#888",
      fontWeight: 600,
      marginRight: 6
    }
  }, "\u305D\u306E\u4ED6"), (tags || []).map(function (tag, ti) {
    var on = (sel || []).includes(tag),
      lbl = stripCat(tag);
    return React.createElement("span", {
      key: tag,
      "data-loose-i": ti,
      draggable: true,
      onDragStart: function onDragStart() {
        looseDragRef.current = ti;
      },
      onDragOver: function onDragOver(e) {
        e.preventDefault();
        setLooseOver(ti);
      },
      onDrop: function onDrop(e) {
        e.preventDefault();
        var from = looseDragRef.current;
        if (from != null && from !== ti) {
          var arr = _toConsumableArray(tags || []);
          var _arr$splice1 = arr.splice(from, 1),
            _arr$splice10 = _slicedToArray(_arr$splice1, 1),
            it = _arr$splice10[0];
          arr.splice(ti, 0, it);
          onReorderLoose && onReorderLoose(arr);
        }
        looseDragRef.current = null;
        setLooseOver(null);
      },
      onDragEnd: function onDragEnd() {
        looseDragRef.current = null;
        setLooseOver(null);
      },
      onTouchStart: function onTouchStart(e) {
        return looseTStart(e, ti);
      },
      style: {
        display: "inline-flex",
        alignItems: "stretch",
        margin: "3px",
        outline: looseOver === ti ? "2px solid #6366F1" : "none",
        borderRadius: 7,
        cursor: "grab"
      }
    }, onReorderLoose && (tags || []).length > 1 ? React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", justifyContent: "center", marginRight: 1, flexShrink: 0 } },
      React.createElement("button", { title: "前へ", onClick: function(e){ e.stopPropagation(); if(ti>0){ var a=_toConsumableArray(tags); var x=a.splice(ti,1)[0]; a.splice(ti-1,0,x); onReorderLoose(a); } }, style: { border:"none", background:"transparent", padding:0, lineHeight:1, fontSize:9, cursor: ti>0?"pointer":"default", color: ti>0?"#9A3412":"#ddd" } }, "▲"),
      React.createElement("button", { title: "後へ", onClick: function(e){ e.stopPropagation(); if(ti<(tags||[]).length-1){ var a=_toConsumableArray(tags); var x=a.splice(ti,1)[0]; a.splice(ti+1,0,x); onReorderLoose(a); } }, style: { border:"none", background:"transparent", padding:0, lineHeight:1, fontSize:9, cursor: ti<(tags||[]).length-1?"pointer":"default", color: ti<(tags||[]).length-1?"#9A3412":"#ddd" } }, "▼")
    ) : null, React.createElement(TagBtn, {
      label: lbl,
      on: on,
      tagKey: tag,
      onToggle: function onToggle() {
        return _onToggle(tag);
      },
      onDel: function onDel() {

        if (onDelTag) onDelTag(tag);
      },
      onRename: onRenameLoose ? function(newName) { onRenameLoose(tag, newName); } : undefined
    }));
  })), !hideAddRoot && React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, React.createElement(AddBtn, {
    onAdd: function onAdd(v) {
      return _onAdd(v, null);
    },
    ph: "\uFF0B \u30BF\u30B0\u3092\u8FFD\u52A0\uFF08\u30AB\u30C6\u30B4\u30EA\u306A\u3057\uFF09"
  }))
  ))));
}
function makeShapeTagPoolHandlers(data, save, custom) {
  var updPool = function updPool(nc) {
    return save(_objectSpread(_objectSpread({}, data), {}, {
      custom: _objectSpread(_objectSpread({}, custom), nc)
    }));
  };
  
  var cleanAll = function cleanAll(tag) {
    var ch = _objectSpread({}, data.charts);
    Object.keys(ch).forEach(function (k) {
      if (ch[k].chartShapeTags) ch[k] = _objectSpread(_objectSpread({}, ch[k]), {}, {
        chartShapeTags: ch[k].chartShapeTags.filter(function (t) { return t !== tag; })
      });
    });
    return { ch: ch };
  };
  return {
    onAddCat: function(name) {
      if (name && !(custom.chartShapeCats || {})[name]) updPool({
        chartShapeCats: _objectSpread(_objectSpread({}, custom.chartShapeCats || {}), {}, _defineProperty({}, name, []))
      });
    },
    onReorderCats: function(order) {
      var cur = custom.chartShapeCats || {}, nc = {};
      order.forEach(function (k) { nc[k] = cur[k] || []; });
      updPool({ chartShapeCats: nc });
    },
    onReorderItems: function(cat, items) {
      return updPool({
        chartShapeCats: _objectSpread(_objectSpread({}, custom.chartShapeCats || {}), {}, _defineProperty({}, cat, items))
      });
    },
    onReorderLoose: function(tags) {
      return updPool({ chartShapeTags: tags });
    },
    onDelTag: function(tag) {
      var r = cleanAll(tag);
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, {
          chartShapeTags: (custom.chartShapeTags || []).filter(function (t) { return t !== tag; })
        }),
        charts: r.ch
      }));
    },
    onDelTagFromCat: function(cat, name) {
      var tag = cat + ":" + name, cur = custom.chartShapeCats || {};
      var r = cleanAll(tag);
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, {
          chartShapeCats: _objectSpread(_objectSpread({}, cur), {}, _defineProperty({}, cat, (cur[cat] || []).filter(function (t) { return t !== name; })))
        }),
        charts: r.ch
      }));
    },
    onDelCat: function(cat) {
      var cur = custom.chartShapeCats || {};
      var catTags = (cur[cat] || []).map(function (t) { return cat + ":" + t; });
      var nc = _objectSpread({}, cur);
      delete nc[cat];
      var ch = _objectSpread({}, data.charts);
      catTags.forEach(function (tag) {
        Object.keys(ch).forEach(function (k) {
          if (ch[k].chartShapeTags) ch[k] = _objectSpread(_objectSpread({}, ch[k]), {}, {
            chartShapeTags: ch[k].chartShapeTags.filter(function (t) { return t !== tag; })
          });
        });
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, { chartShapeCats: nc }),
        charts: ch
      }));
    },
    onRenameCat: function(oldName, newName) {
      if (!newName || oldName === newName) return;
      var cur = custom.chartShapeCats || {};
      if (!(oldName in cur)) return;
      if (newName in cur) { window._snAlert("同名のカテゴリが既に存在します"); return; }
      var nc = {};
      Object.keys(cur).forEach(function(k) {
        nc[k === oldName ? newName : k] = cur[k];
      });
      var ch = _objectSpread({}, data.charts);
      Object.keys(ch).forEach(function (k) {
        if (ch[k].chartShapeTags) {
          ch[k] = _objectSpread(_objectSpread({}, ch[k]), {}, {
            chartShapeTags: ch[k].chartShapeTags.map(function (t) {
              var idx = t.indexOf(":");
              if (idx < 0) return t;
              var cPart = t.slice(0, idx), nPart = t.slice(idx + 1);
              return cPart === oldName ? (newName + ":" + nPart) : t;
            })
          });
        }
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, { chartShapeCats: nc }),
        charts: ch
      }));
    },
    onRenameItem: function(cat, oldName, newName) {
      if (!newName || oldName === newName) return;
      var cur = custom.chartShapeCats || {};
      if (!(cat in cur)) return;
      var items = (cur[cat] || []).slice();
      var i = items.indexOf(oldName);
      if (i < 0) return;
      if (items.indexOf(newName) >= 0) { window._snAlert("同名のタグが既に存在します"); return; }
      items[i] = newName;
      var oldTag = cat + ":" + oldName, newTag = cat + ":" + newName;
      var ch = _objectSpread({}, data.charts);
      Object.keys(ch).forEach(function (k) {
        if (ch[k].chartShapeTags) {
          ch[k] = _objectSpread(_objectSpread({}, ch[k]), {}, {
            chartShapeTags: ch[k].chartShapeTags.map(function (t) { return t === oldTag ? newTag : t; })
          });
        }
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, {
          chartShapeCats: _objectSpread(_objectSpread({}, cur), {}, _defineProperty({}, cat, items))
        }),
        charts: ch
      }));
    },
    onRenameLoose: function(oldName, newName) {
      if (!newName || oldName === newName) return;
      var tags = (custom.chartShapeTags || []).slice();
      var i = tags.indexOf(oldName);
      if (i < 0) return;
      if (tags.indexOf(newName) >= 0) { window._snAlert("同名のタグが既に存在します"); return; }
      tags[i] = newName;
      var ch = _objectSpread({}, data.charts);
      Object.keys(ch).forEach(function (k) {
        if (ch[k].chartShapeTags) {
          ch[k] = _objectSpread(_objectSpread({}, ch[k]), {}, {
            chartShapeTags: ch[k].chartShapeTags.map(function (t) { return t === oldName ? newName : t; })
          });
        }
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, { chartShapeTags: tags }),
        charts: ch
      }));
    }
  };
}

function makeTagPoolHandlers(data, save, custom) {
  var updPool = function updPool(nc) {
    return save(_objectSpread(_objectSpread({}, data), {}, {
      custom: _objectSpread(_objectSpread({}, custom), nc)
    }));
  };
  var cleanAll = function cleanAll(tag) {
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
        Object.entries(dd.newsCats).forEach(function (_ref21) {
          var _ref22 = _slicedToArray(_ref21, 2),
            cat = _ref22[0],
            cd = _ref22[1];
          nc[cat] = _objectSpread(_objectSpread({}, cd), {}, {
            marketTags: (cd.marketTags || []).filter(function (t) {
              return t !== tag;
            }),
            newsItems: (cd.newsItems || []).map(function (ni) {
              return _objectSpread(_objectSpread({}, ni), {}, {
                tags: (ni.tags || []).filter(function (t) {
                  return t !== tag;
                })
              });
            })
          });
        });
        tr[k] = _objectSpread(_objectSpread({}, dd), {}, {
          newsCats: nc
        });
      }
    });
    return {
      ch: ch,
      tr: tr
    };
  };
  
  
  
  var _updateShvExtraTags = function(updFn) {
    var base = (custom && custom.shvExtraTags && typeof custom.shvExtraTags === "object" && !Array.isArray(custom.shvExtraTags))
      ? custom.shvExtraTags : null;
    var ext = {};
    if (base) {
      Object.keys(base).forEach(function(k) { if (Array.isArray(base[k])) ext[k] = base[k].slice(); });
    } else {
      try {
        var ls = JSON.parse(localStorage.getItem("sn_shv_extra_tags_v1") || "{}");
        if (ls && typeof ls === "object" && !Array.isArray(ls)) {
          Object.keys(ls).forEach(function(k) { if (Array.isArray(ls[k])) ext[k] = ls[k].slice(); });
        }
      } catch(e){}
    }
    updFn(ext);
    Object.keys(ext).forEach(function(k) { if (!Array.isArray(ext[k]) || ext[k].length === 0) delete ext[k]; });
    try { localStorage.setItem("sn_shv_extra_tags_v1", JSON.stringify(ext)); } catch(e){}
    return ext;
  };
  return {
    onAddCat: function onAddCat(name) {
      if (name && !(custom.cats || {})[name]) updPool({
        cats: _objectSpread(_objectSpread({}, custom.cats || {}), {}, _defineProperty({}, name, []))
      });
    },
    onReorderCats: function onReorderCats(order) {
      var cur = custom.cats || {},
        nc = {};
      order.forEach(function (k) {
        nc[k] = cur[k] || [];
      });
      updPool({
        cats: nc
      });
    },
    onReorderItems: function onReorderItems(cat, items) {
      return updPool({
        cats: _objectSpread(_objectSpread({}, custom.cats || {}), {}, _defineProperty({}, cat, items))
      });
    },
    onReorderLoose: function onReorderLoose(tags) {
      return updPool({
        tags: tags
      });
    },
    onDelTag: function onDelTag(tag) {
      var _cleanAll = cleanAll(tag),
        ch = _cleanAll.ch,
        tr = _cleanAll.tr;
      
      
      var _newExt = _updateShvExtraTags(function(_ext) {
        Object.keys(_ext).forEach(function(stk) {
          _ext[stk] = _ext[stk].filter(function(t) { return t !== tag; });
        });
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, {
          tags: (custom.tags || []).filter(function (t) {
            return t !== tag;
          }),
          shvExtraTags: _newExt
        }),
        charts: ch,
        trades: tr
      }), { immediate: true });
    },
    onDelTagFromCat: function onDelTagFromCat(cat, name) {
      var tag = cat + ":" + name,
        cur = custom.cats || {};
      var _cleanAll2 = cleanAll(tag),
        ch = _cleanAll2.ch,
        tr = _cleanAll2.tr;
      
      
      var _newExt = _updateShvExtraTags(function(_ext) {
        Object.keys(_ext).forEach(function(stk) {
          _ext[stk] = _ext[stk].filter(function(t) { return t !== tag && t !== name; });
        });
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, {
          cats: _objectSpread(_objectSpread({}, cur), {}, _defineProperty({}, cat, (cur[cat] || []).filter(function (t) {
            return t !== name;
          }))),
          shvExtraTags: _newExt
        }),
        charts: ch,
        trades: tr
      }), { immediate: true });
    },
    onDelCat: function onDelCat(cat) {
      var cur = custom.cats || {},
        catTags = (cur[cat] || []).map(function (t) {
          return cat + ":" + t;
        }),
        nc = _objectSpread({}, cur);
      delete nc[cat];
      var ch = _objectSpread({}, data.charts),
        tr = _objectSpread({}, data.trades);
      catTags.forEach(function (tag) {
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
            var ncd = {};
            Object.entries(dd.newsCats).forEach(function (_ref23) {
              var _ref24 = _slicedToArray(_ref23, 2),
                c = _ref24[0],
                cd = _ref24[1];
              ncd[c] = _objectSpread(_objectSpread({}, cd), {}, {
                marketTags: (cd.marketTags || []).filter(function (t) {
                  return t !== tag;
                })
              });
            });
            tr[k] = _objectSpread(_objectSpread({}, dd), {}, {
              newsCats: ncd
            });
          }
        });
      });
      
      var _delSet = {};
      catTags.forEach(function(t){ _delSet[t] = true; });
      var _newExt = _updateShvExtraTags(function(_ext) {
        Object.keys(_ext).forEach(function(stk) {
          _ext[stk] = _ext[stk].filter(function(t) { return !_delSet[t]; });
        });
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, {
          cats: nc,
          shvExtraTags: _newExt
        }),
        charts: ch,
        trades: tr
      }), { immediate: true });
    },
    
    
    onRenameCat: function(oldName, newName) {
      if (!newName || oldName === newName) return;
      var cur = custom.cats || {};
      if (!(oldName in cur)) return;
      if (newName in cur) { window._snAlert("同名のカテゴリが既に存在します"); return; }
      var nc = {};
      Object.keys(cur).forEach(function(k) {
        nc[k === oldName ? newName : k] = cur[k];
      });
      
      var renameTag = function(t) {
        var idx = t.indexOf(":");
        if (idx < 0) return t;
        var cPart = t.slice(0, idx), nPart = t.slice(idx + 1);
        return cPart === oldName ? (newName + ":" + nPart) : t;
      };
      var ch = _objectSpread({}, data.charts);
      Object.keys(ch).forEach(function(k) {
        var _c = ch[k], _upd = {};
        if (_c.stockTags)      _upd.stockTags      = _c.stockTags.map(renameTag);
        if (_c.chartShapeTags) _upd.chartShapeTags = _c.chartShapeTags.map(renameTag);
        if (_c.flowOpenTags)   _upd.flowOpenTags   = _c.flowOpenTags.map(renameTag);
        if (_c.flowMoveTags)   _upd.flowMoveTags   = _c.flowMoveTags.map(renameTag);
        if (Object.keys(_upd).length) ch[k] = _objectSpread(_objectSpread({}, _c), {}, _upd);
      });
      var tr = _objectSpread({}, data.trades);
      Object.keys(tr).forEach(function(k) {
        var dd = tr[k];
        if (!dd.newsCats) return;
        var ncd = {};
        Object.entries(dd.newsCats).forEach(function(e) {
          var c = e[0], cd = e[1];
          ncd[c] = _objectSpread(_objectSpread({}, cd), {}, {
            marketTags: (cd.marketTags || []).map(renameTag),
            newsItems: (cd.newsItems || []).map(function(ni) {
              return _objectSpread(_objectSpread({}, ni), {}, {
                tags: (ni.tags || []).map(renameTag)
              });
            })
          });
        });
        tr[k] = _objectSpread(_objectSpread({}, dd), {}, { newsCats: ncd });
      });
      
      var _newExt = _updateShvExtraTags(function(_ext) {
        Object.keys(_ext).forEach(function(stk) {
          _ext[stk] = _ext[stk].map(function(t) {
            var idx = t.indexOf(":");
            if (idx < 0) return t;
            var cPart = t.slice(0, idx), nPart = t.slice(idx + 1);
            if (cPart === oldName) return newName + ":" + nPart;
            return t;
          });
        });
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, { cats: nc, shvExtraTags: _newExt }),
        charts: ch, trades: tr
      }));
    },
    onRenameItem: function(cat, oldName, newName) {
      if (!newName || oldName === newName) return;
      var cur = custom.cats || {};
      if (!(cat in cur)) return;
      var items = (cur[cat] || []).slice();
      var i = items.indexOf(oldName);
      if (i < 0) return;
      if (items.indexOf(newName) >= 0) { window._snAlert("同名のタグが既に存在します"); return; }
      items[i] = newName;
      var oldTag = cat + ":" + oldName, newTag = cat + ":" + newName;
      var renameTag = function(t) { return t === oldTag ? newTag : t; };
      var ch = _objectSpread({}, data.charts);
      Object.keys(ch).forEach(function(k) {
        var _c = ch[k], _upd = {};
        if (_c.stockTags)      _upd.stockTags      = _c.stockTags.map(renameTag);
        if (_c.chartShapeTags) _upd.chartShapeTags = _c.chartShapeTags.map(renameTag);
        if (_c.flowOpenTags)   _upd.flowOpenTags   = _c.flowOpenTags.map(renameTag);
        if (_c.flowMoveTags)   _upd.flowMoveTags   = _c.flowMoveTags.map(renameTag);
        if (Object.keys(_upd).length) ch[k] = _objectSpread(_objectSpread({}, _c), {}, _upd);
      });
      var tr = _objectSpread({}, data.trades);
      Object.keys(tr).forEach(function(k) {
        var dd = tr[k];
        if (!dd.newsCats) return;
        var ncd = {};
        Object.entries(dd.newsCats).forEach(function(e) {
          var c = e[0], cd = e[1];
          ncd[c] = _objectSpread(_objectSpread({}, cd), {}, {
            marketTags: (cd.marketTags || []).map(renameTag),
            newsItems: (cd.newsItems || []).map(function(ni) {
              return _objectSpread(_objectSpread({}, ni), {}, { tags: (ni.tags || []).map(renameTag) });
            })
          });
        });
        tr[k] = _objectSpread(_objectSpread({}, dd), {}, { newsCats: ncd });
      });
      
      var _newExt = _updateShvExtraTags(function(_ext) {
        Object.keys(_ext).forEach(function(stk) {
          _ext[stk] = _ext[stk].map(function(t) { return t === oldTag ? newTag : t; });
        });
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, {
          cats: _objectSpread(_objectSpread({}, cur), {}, _defineProperty({}, cat, items)),
          shvExtraTags: _newExt
        }),
        charts: ch, trades: tr
      }));
    },
    onRenameLoose: function(oldName, newName) {
      if (!newName || oldName === newName) return;
      var tags = (custom.tags || []).slice();
      var i = tags.indexOf(oldName);
      if (i < 0) return;
      if (tags.indexOf(newName) >= 0) { window._snAlert("同名のタグが既に存在します"); return; }
      tags[i] = newName;
      var renameTag = function(t) { return t === oldName ? newName : t; };
      var ch = _objectSpread({}, data.charts);
      Object.keys(ch).forEach(function(k) {
        var _c = ch[k], _upd = {};
        if (_c.stockTags)      _upd.stockTags      = _c.stockTags.map(renameTag);
        if (_c.chartShapeTags) _upd.chartShapeTags = _c.chartShapeTags.map(renameTag);
        if (_c.flowOpenTags)   _upd.flowOpenTags   = _c.flowOpenTags.map(renameTag);
        if (_c.flowMoveTags)   _upd.flowMoveTags   = _c.flowMoveTags.map(renameTag);
        if (Object.keys(_upd).length) ch[k] = _objectSpread(_objectSpread({}, _c), {}, _upd);
      });
      var tr = _objectSpread({}, data.trades);
      Object.keys(tr).forEach(function(k) {
        var dd = tr[k];
        if (!dd.newsCats) return;
        var ncd = {};
        Object.entries(dd.newsCats).forEach(function(e) {
          var c = e[0], cd = e[1];
          ncd[c] = _objectSpread(_objectSpread({}, cd), {}, {
            marketTags: (cd.marketTags || []).map(renameTag),
            newsItems: (cd.newsItems || []).map(function(ni) {
              return _objectSpread(_objectSpread({}, ni), {}, { tags: (ni.tags || []).map(renameTag) });
            })
          });
        });
        tr[k] = _objectSpread(_objectSpread({}, dd), {}, { newsCats: ncd });
      });
      
      var _newExt = _updateShvExtraTags(function(_ext) {
        Object.keys(_ext).forEach(function(stk) {
          _ext[stk] = _ext[stk].map(function(t) { return t === oldName ? newName : t; });
        });
      });
      save(_objectSpread(_objectSpread({}, data), {}, {
        custom: _objectSpread(_objectSpread({}, custom), {}, { tags: tags, shvExtraTags: _newExt }),
        charts: ch, trades: tr
      }));
    },
    onSetTagColor: function(tagKey, color) {
      var tc = Object.assign({}, custom.tagColors || {});
      if (color) { tc[tagKey] = color; } else { delete tc[tagKey]; }
      updPool({ tagColors: tc });
    }
  };
}

function _sigId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

// ===== 出現シグナル・テクニカル 2026-06-18 =====
// 自動行(src:"auto")=その日の取引記録(signals[])のシグナル。読み取り（編集はエントリー記録側）。
// 手動行(src:"manual")=テクニカル/未取引シグナル（charts[ck].appearancesに保存・編集/削除可）。
function _apByTime(a, b) { var ta = a.time || "99:99", tb = b.time || "99:99"; return ta < tb ? -1 : ta > tb ? 1 : 0; }
function _apSigNames(sig) {
  if (sig.tags && sig.tags.length) return sig.tags;
  if (sig.tag && sig.tag !== "__custom__") return [sig.tag];
  if (sig.isCustomTag && sig.customTagText) return [sig.customTagText];
  return [];
}
function _apRowsForDay(data, stock, date) {
  var ck = stock + "_" + date;
  var c = (data && data.charts && data.charts[ck]) || {};
  var rows = [];
  var _apM = c.apMemos || {};  // 出現欄固有メモ（取引記録のrationaleとは別物）。auto行はキーで参照。
  (Array.isArray(c.signals) ? c.signals : []).forEach(function(sig, si) {
    _apSigNames(sig).forEach(function(nm, ni) {
      var _snm = stripCat(nm);
      var _mk = "s|" + (sig.id || sig.time || "x") + "|" + _snm;
      rows.push({ kind: "signal", name: _snm, time: sig.time || "", memo: _apM[_mk] || "", memoKey: _mk, src: "auto", sigId: sig.id, id: "auto_" + (sig.id || sig.time || "x") + "_" + si + "_" + ni });
    });
  });
  (Array.isArray(c.appearances) ? c.appearances : []).forEach(function(ap) {
    rows.push({ kind: ap.kind === "signal" ? "signal" : "tech", name: ap.name || "", time: ap.time || "", memo: ap.memo || "", src: "manual", id: ap.id });
  });
  rows.sort(_apByTime);
  return rows;
}
function _apCollectAll(data) {
  var out = [], charts = (data && data.charts) || {};
  Object.keys(charts).forEach(function(ck) {
    var idx = ck.lastIndexOf("_"); if (idx < 0) return;
    var stock = ck.slice(0, idx), date = ck.slice(idx + 1);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    _apRowsForDay(data, stock, date).forEach(function(r) { out.push(Object.assign({ stock: stock, date: date }, r)); });
  });
  return out;
}
function _apSave(save, stock, date, ap) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    var c = charts[ck] || {};
    var arr = Array.isArray(c.appearances) ? c.appearances.slice() : [];
    var i = ap.id ? arr.findIndex(function(x) { return x.id === ap.id; }) : -1;
    if (i >= 0) arr[i] = ap; else arr.push(ap);
    charts[ck] = Object.assign({}, c, { appearances: arr });
    return Object.assign({}, prev, { charts: charts });
  });
}
function _apDelete(save, stock, date, id) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    var c = charts[ck]; if (!c) return prev;
    var arr = (Array.isArray(c.appearances) ? c.appearances : []).filter(function(x) { return x.id !== id; });
    charts[ck] = Object.assign({}, c, { appearances: arr });
    return Object.assign({}, prev, { charts: charts });
  });
}
// auto行(取引記録由来シグナル)の「出現欄固有メモ」を charts[ck].apMemos[key] に保存/削除。取引記録のrationaleとは別物。2026-06-18
function _apSetAutoMemo(save, stock, date, key, memo) {
  save(function(prev) {
    var charts = Object.assign({}, prev.charts || {});
    var ck = stock + "_" + date;
    var c = charts[ck] || {};
    var m = Object.assign({}, c.apMemos || {});
    if (memo) m[key] = memo; else delete m[key];
    charts[ck] = Object.assign({}, c, { apMemos: m });
    return Object.assign({}, prev, { charts: charts });
  });
}

function _sigStats(tag, allData, period) {
  var now = new Date();
  var cutoff = null;
  if (period === "3m") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3); }
  else if (period === "1m") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 1); }
  var ok = 0, ng = 0;
  Object.entries(allData.charts || {}).forEach(function(e) {
    var k = e[0], c = e[1];
    if (cutoff) {
      var dp = k.split("_").pop();
      var _cutStr = cutoff.getFullYear() + "-" + String(cutoff.getMonth()+1).padStart(2,"0") + "-" + String(cutoff.getDate()).padStart(2,"0");  // 2026-07-18 ローカル日付で比較（旧 toISOString はUTCでJST朝に1日ずれた）
      if (dp < _cutStr) return;
    }
    var _clSg = c.cutLine != null ? Number(c.cutLine) : 15;
    (c.signals || []).forEach(function(s) {
      if (s.tag !== tag) return;
      if (!_elInclData(s)) return;   // シグナル別勝率＝分析母数（データ算入）2026-07-22f
      // 勝敗はライブα基準（v2/v3はresult=null保存のためEP足から導出）
      var _resSg = _elDynResult(s, _epOwnAlpha(s), _clSg);
      if (_resSg === "ok") ok++;
      else if (_resSg === "ng") ng++;
    });
  });
  var total = ok + ng;
  return { ok: ok, ng: ng, total: total, pct: total ? Math.round(ok / total * 100) : null };
}
function _sigStockHistory(tag, allData, currentStock, currentDate) {
  var map = {};
  Object.entries(allData.charts || {}).forEach(function(e) {
    var k = e[0], c = e[1];
    var idx = k.lastIndexOf("_");
    if (idx < 0) return;
    var st = k.slice(0, idx), dt = k.slice(idx + 1);
    var _clSh = c.cutLine != null ? Number(c.cutLine) : 15;
    (c.signals || []).forEach(function(s) {
      if (s.tag !== tag) return;
      if (!map[st]) map[st] = [];
      // 結果はライブα基準（v2/v3はresult=null保存のためEP足から導出）
      map[st].push({ date: dt, chartImg: c.chartImg, result: _elDynResult(s, _epOwnAlpha(s), _clSh) });
    });
  });
  
  Object.keys(map).forEach(function(st) {
    map[st].sort(function(a, b) { return b.date.localeCompare(a.date); });
  });
  return map;
}

function SignalHistoryPopup(_ref_shp) {
  var tag = _ref_shp.tag, stockMap = _ref_shp.stockMap, onClose = _ref_shp.onClose, onGoTo = _ref_shp.onGoTo;
  var _useState_sh1 = useState(null), _useState_sh2 = _slicedToArray(_useState_sh1, 2),
    selStock = _useState_sh2[0], setSelStock = _useState_sh2[1];
  var _useState_sh3 = useState(null), _useState_sh4 = _slicedToArray(_useState_sh3, 2),
    enlarged = _useState_sh4[0], setEnlarged = _useState_sh4[1];
  useModalBack(enlarged != null, function(){ setEnlarged(null); }, "sh-enlarged");
  var stocks = Object.keys(stockMap).sort();
  var entries = selStock ? (stockMap[selStock] || []) : [];
  return React.createElement("div", {
    onClick: function(e) { if (e.target === e.currentTarget) onClose(); },
    style: { position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,
             display:"flex",alignItems:"center",justifyContent:"center",padding:16 }
  },
  enlarged && React.createElement(ZoomLightbox, { src: enlarged, onClose: function() { setEnlarged(null); } }),
  React.createElement("div", {
    style: { background:"#fff",borderRadius:14,padding:20,maxWidth:520,width:"100%",
             maxHeight:"80vh",overflow:"auto",position:"relative" }
  },
  React.createElement("div", { style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12} },
    React.createElement("div", { style:{fontSize:15,fontWeight:700,color:"#312E81"} },
      "\uD83D\uDCCA ", tag, " \u2014 \u904E\u53BB\u306E\u51FA\u73FE\u9298\u67C4"),
    React.createElement("span", {
      onClick: onClose,
      style:{cursor:"pointer",fontSize:20,color:"#888",fontWeight:700,lineHeight:1}
    }, "\u00D7")
  ),
  !selStock ? React.createElement("div", { style:{display:"flex",flexWrap:"wrap",gap:8} },
    stocks.length === 0 && React.createElement("div", { style:{fontSize:13,color:"#aaa"} }, "\u904E\u53BB\u30C7\u30FC\u30BF\u306A\u3057"),
    stocks.map(function(st) {
      return React.createElement("button", {
        key: st, onClick: function() { setSelStock(st); },
        style: { padding:"8px 16px",fontSize:14,fontWeight:600,border:"1.5px solid #C7D2FE",
                 borderRadius:8,background:"#EEF2FF",color:"#312E81",cursor:"pointer" }
      }, st, React.createElement("span", { style:{fontSize:11,marginLeft:6,color:"#6366F1"} },
        stockMap[st].length, "\u56DE"));
    })
  ) : React.createElement("div", null,
    React.createElement("button", {
      onClick: function() { setSelStock(null); },
      style: { marginBottom:10,padding:"4px 12px",fontSize:12,border:"1px solid #ccc",
               borderRadius:6,background:"#f8f7f4",cursor:"pointer",color:"#555" }
    }, "\u25C0 \u9298\u67C4\u4E00\u89A7\u3078"),
    React.createElement("div", { style:{fontSize:14,fontWeight:700,marginBottom:8,color:"#1a1a1a"} }, selStock),
    entries.map(function(ent, i) {
      var src = ent.chartImg ? imgSrc(ent.chartImg) : null;
      return React.createElement("div", {
        key: i,
        style: { display:"flex",gap:10,alignItems:"center",padding:"8px 0",
                 borderBottom: i < entries.length - 1 ? "1px solid #eee" : "none" }
      },
      React.createElement("div", { style:{fontSize:13,fontWeight:600,color:"#333",minWidth:90} }, _fmtDow(ent.date)),
      React.createElement("span", {
        style: { fontSize:16, minWidth:20 }
      }, ent.result === "ok" ? "\u25CB" : ent.result === "ng" ? "\u2717" : "\u2014"),
      src && React.createElement("img", {
        src: src,
        onClick: function() { setEnlarged(src); },
        style: { width:64,height:44,objectFit:"cover",borderRadius:6,cursor:"zoom-in",
                 border:"1px solid #e0ddd6" },
        alt: ""
      }),
      React.createElement("button", {
        onClick: function() { onGoTo(ent.date, selStock); onClose(); },
        style: { marginLeft:"auto",padding:"4px 10px",fontSize:11,border:"1px solid #C7D2FE",
                 borderRadius:6,background:"#EEF2FF",color:"#4338CA",cursor:"pointer",whiteSpace:"nowrap" }
      }, "\u3053\u306E\u65E5\u306E\u8A18\u9332\u3078"));
    })
  )));
}

function EntrySignalSection(_ref_es) {
  
  
  
  
  
  var data = _ref_es.allData,
      save = _ref_es.save,
      stock = _ref_es.stock,
      date = _ref_es.date,
      onOpenEntryLog = _ref_es.onOpenEntryLog;
  var charts = (data && data.charts) || {};
  var ck = stock + "_" + date;
  var c = charts[ck] || {};
  var signals = Array.isArray(c.signals) ? c.signals : [];
  var trades = (data && data.trades) || {};
  var custom = (data && data.custom) || {};
  var signalTagsMaster = custom.signalTags || [];

  var _useStateES1 = useState(null), _useStateES1A = _slicedToArray(_useStateES1, 2),
      editTarget = _useStateES1A[0], setEditTarget = _useStateES1A[1];
  var _useStateES2 = useState(false), _useStateES2A = _slicedToArray(_useStateES2, 2),
      showAddForm = _useStateES2A[0], setShowAddForm = _useStateES2A[1];
  // α値シミュ・損切り値シミュ（非永続・記録ごと）。本日の損益データと同型。未設定なら採用α値/c.cutLineで従来と完全同一。
  var _useStateESSA1 = useState({}), _useStateESSA1A = _slicedToArray(_useStateESSA1, 2),
      _esSimAlpha = _useStateESSA1A[0], setEsSimAlpha = _useStateESSA1A[1];
  var _useStateESSC1 = useState({}), _useStateESSC1A = _slicedToArray(_useStateESSC1, 2),
      _esSimCut = _useStateESSC1A[0], setEsSimCut = _useStateESSC1A[1];
  useEffect(function() { setEsSimAlpha({}); setEsSimCut({}); }, [ck]);
  var _esActualAlpha = function(s) { return (s && s.alphaVal != null && s.alphaVal !== "") ? Number(s.alphaVal) : _gradeAlpha(s && s.difficulty); };
  var _esActualCut = function(s) { return c.cutLine != null ? c.cutLine : 15; };
  var _esAlpha = function(s) { var _k = (s && s.id) || ""; var _sv = _esSimAlpha[_k]; return (_sv != null && _sv !== "") ? Number(_sv) : _esActualAlpha(s); };
  var _esCut = function(s) { var _k = (s && s.id) || ""; var _cv = _esSimCut[_k]; return (_cv != null && _cv !== "") ? Number(_cv) : _esActualCut(s); };

  var _useStateESS = useState(function() {
    try { var v = localStorage.getItem('sn_chartentry_sortmode'); return (v === "custom" || v === "category") ? v : "time"; }
    catch(e) { return "time"; }
  }), _useStateESSA = _slicedToArray(_useStateESS, 2),
      sortMode = _useStateESSA[0], setSortMode = _useStateESSA[1];
  useEffect(function() {
    try { localStorage.setItem('sn_chartentry_sortmode', sortMode); } catch(e){}
  }, [sortMode]);
  var _useStateESDR = useState(null), _useStateESDRA = _slicedToArray(_useStateESDR, 2),
      dragRecKey = _useStateESDRA[0], setDragRecKey = _useStateESDRA[1];
  var _useStateESDO = useState(null), _useStateESDOA = _slicedToArray(_useStateESDO, 2),
      dragOverKey = _useStateESDOA[0], setDragOverKey = _useStateESDOA[1];
  var _useStateETRE = useState({}), _useStateETREA = _slicedToArray(_useStateETRE, 2),
      tableRecExp = _useStateETREA[0], setTableRecExp = _useStateETREA[1];

  
  var records = useMemo(function() {
    return signals.map(function(sig) {
      var s = _compatSignal(sig);
      var item = null;
      if (s.entered && s.itemId != null) {
        var dd = trades[date] || {};
        var items = dd.items || [];
        for (var i = 0; i < items.length; i++) {
          if (String(items[i].id) === String(s.itemId)) { item = items[i]; break; }
        }
      }
      return { date: date, stock: stock, signal: s, item: item };
    });
  }, [signals, trades, date, stock]);
  // 合計額算入: 集計/合計用は除外記録(includeInTotal===false)を抜いた版。表示(tblItems/sortedRecs)は records の全件のまま。2026-06-18
  var _recsForTot = records.filter(function(r) { return _elInclTotal(r.signal); });   // 2026-07-18g 要審議も合計に算入（見送りと同じ）＝_elIsReview除外を撤回（旧2026-07-14f）。_elTotAccum:app-05:4226と同基準


  var _esRecKey = function(r) { return (r.signal && r.signal.id) || ""; };
  // α値シミュ/損切り値シミュ入力（本日の損益データと同型・記録ごと。未入力なら採用α値/c.cutLineで従来と同一）。
  var _esAlphaSimCtx = { keyOf: _esRecKey, actualOf: function(rr){ return _esActualAlpha(rr.signal); }, val: _esSimAlpha, set: setEsSimAlpha };
  var _esCutSimCtx = { keyOf: _esRecKey, actualOf: function(rr){ return _esActualCut(rr.signal); }, val: _esSimCut, set: setEsSimCut };
  var _esRenderSimAlpha = function(r) { return null;   // α/損切りシミュ撤去 2026-07-07
    var sc = _esAlphaSimCtx, k = sc.keyOf(r), actualA = sc.actualOf(r), raw = sc.val[k];
    var hasOv = raw != null && raw !== "";
    var curStr = (raw != null) ? raw : (actualA != null ? String(actualA) : "");
    var isSim = hasOv && actualA != null && Number(raw) !== actualA;
    var stop = function(e) { if (e && e.stopPropagation) e.stopPropagation(); };
    var baseNum = function() { return (raw != null && raw !== "") ? Number(raw) : (actualA != null ? actualA : 0); };
    var setVal = function(v) { sc.set(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
    return React.createElement("div", { onClick: stop, style: { marginTop: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } },
      React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 2 } },
        React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid " + (isSim ? "#0369A1" : "#cbd5e1"), borderRadius: 5, overflow: "hidden", background: "#fff" } },
          React.createElement("input", { type: "text", inputMode: "numeric", step: "1", min: "0", value: curStr, onClick: stop,
            onChange: function(e) { setVal(_toHankakuNum(e.target.value)); },
            style: { width: 20, padding: "2px 3px", border: "none", outline: "none", background: "transparent", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#0369A1", fontVariantNumeric: "tabular-nums" } }),
          React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", alignSelf: "center", padding: "0 1px" } }, "円"),
          _stepBtn(function() { setVal(String(baseNum() + 1)); }, function() { setVal(String(Math.max(0, baseNum() - 1))); })
        ),
        React.createElement("button", { onClick: function(e) { stop(e); var _ia = _elIdealAlpha(r.signal, _esCut(r.signal)); if (_ia == null) return; if (actualA != null && _ia === Number(actualA)) { sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); } else { setVal(String(_ia)); } },
          title: "損切りにならず『EP損益＋H1結果損益』が最大になるα(0〜50円・1円刻み)をこの行に入力。該当が無ければ一番マシな値。※全記録に一括は『一括 推奨基本α』を使用。",
          style: { fontSize: 8, padding: "1px 4px", border: "1px solid #0369A1", borderRadius: 3, background: "#E0F2FE", color: "#0369A1", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", fontWeight: 700 } }, "理想"),
        React.createElement("button", { onClick: function(e) { stop(e); if (!isSim) return; sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); },
          style: { fontSize: 8, padding: "0 4px", border: "1px solid #cbd5e1", borderRadius: 3, background: "#F1F5F9", color: "#0369A1", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", display: isSim ? "inline-block" : "none" } }, "↺")
      )
    );
  };
  var _esRenderSimCut = function(r) { return null;   // α/損切りシミュ撤去 2026-07-07
    var sc = _esCutSimCtx, k = sc.keyOf(r), actualC = sc.actualOf(r), raw = sc.val[k];
    var hasOv = raw != null && raw !== "";
    var curStr = (raw != null) ? raw : (actualC != null ? String(actualC) : "");
    var isSim = hasOv && actualC != null && Number(raw) !== actualC;
    var stop = function(e) { if (e && e.stopPropagation) e.stopPropagation(); };
    var baseNum = function() { return (raw != null && raw !== "") ? Number(raw) : (actualC != null ? actualC : 0); };
    var setVal = function(v) { sc.set(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
    return React.createElement("div", { onClick: stop, style: { marginTop: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 } },
      React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 2 } },
        React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid " + (isSim ? "#9333EA" : "#cbd5e1"), borderRadius: 5, overflow: "hidden", background: "#fff" } },
          React.createElement("input", { type: "text", inputMode: "numeric", step: "1", min: "0", value: curStr, onClick: stop,
            onChange: function(e) { setVal(_toHankakuNum(e.target.value)); },
            style: { width: 20, padding: "2px 3px", border: "none", outline: "none", background: "transparent", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#9333EA", fontVariantNumeric: "tabular-nums" } }),
          React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", alignSelf: "center", padding: "0 1px" } }, "円"),
          _stepBtn(function() { setVal(String(baseNum() + 1)); }, function() { setVal(String(Math.max(0, baseNum() - 1))); })
        ),
        React.createElement("button", { onClick: function(e) { stop(e); var _ic = _elIdealCut(r.signal, _esAlpha(r.signal)); if (_ic == null) return; if (actualC != null && _ic === Number(actualC)) { sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); } else { setVal(String(_ic)); } },
          title: "現在のα値（α値シミュ中ならその値）を考慮し、損切りを回避できる最小の損切り値(10/15/20)を入力。回避できなければ最小の10。",
          style: { fontSize: 8, padding: "1px 4px", border: "1px solid #9333EA", borderRadius: 3, background: "#F3E8FF", color: "#9333EA", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", fontWeight: 700 } }, "理想"),
        React.createElement("button", { onClick: function(e) { stop(e); if (!isSim) return; sc.set(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); },
          style: { fontSize: 8, padding: "0 4px", border: "1px solid #cbd5e1", borderRadius: 3, background: "#F1F5F9", color: "#9333EA", cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", display: isSim ? "inline-block" : "none" } }, "↺")
      )
    );
  };
  var _esSortByTime = function(recs) {
    return recs.slice().sort(function(a, b) {
      var ta = (a.signal && a.signal.time) || "99:99";
      var tb = (b.signal && b.signal.time) || "99:99";
      if (ta !== tb) return ta.localeCompare(tb);
      return ((a.signal && a.signal.id) || "").localeCompare((b.signal && b.signal.id) || "");
    });
  };
  var _esSortByOrder = function(recs, orderArr) {
    var orderMap = {};
    (orderArr || []).forEach(function(k, i) { orderMap[k] = i; });
    return recs.slice().sort(function(a, b) {
      var ka = _esRecKey(a), kb = _esRecKey(b);
      var ia = orderMap[ka] != null ? orderMap[ka] : 9999;
      var ib = orderMap[kb] != null ? orderMap[kb] : 9999;
      if (ia !== ib) return ia - ib;
      var ta = (a.signal && a.signal.time) || "99:99";
      var tb = (b.signal && b.signal.time) || "99:99";
      return ta.localeCompare(tb);
    });
  };
  var _esGroupByCategory = function(recs) {
    var byTag = {};
    recs.forEach(function(r) {
      _elTagEntries(r.signal).forEach(function(e) {
        if (!byTag[e.key]) byTag[e.key] = { records: [], label: e.label, isCustom: e.isCustom };
        byTag[e.key].records.push(r);
      });
    });
    var orderedKeys = signalTagsMaster.filter(function(t) { return byTag[t]; });
    var customKeys = Object.keys(byTag).filter(function(k) {
      return !signalTagsMaster.includes(k) && k !== "(未設定)";
    });
    var allKeys = orderedKeys.concat(customKeys);
    if (byTag["(未設定)"]) allKeys.push("(未設定)");
    return allKeys.map(function(k) {
      var grp = byTag[k];
      return { key: k, label: grp.label, records: _esSortByTime(grp.records), isCustom: grp.isCustom };
    });
  };

  var _sortResult = useMemo(function() {
    var sr = records, gr = null;
    if (sortMode === "time") sr = _esSortByTime(records);
    else if (sortMode === "custom") sr = _esSortByOrder(records, c.signalsOrder || []);
    else if (sortMode === "category") gr = _esGroupByCategory(records);
    return [sr, gr];
  }, [records, sortMode, c.signalsOrder, signalTagsMaster]); 
  var sortedRecs = _sortResult[0];
  var groupedRecs = _sortResult[1];
  var currentOrder = sortedRecs.map(_esRecKey);

  
  var _esMoveRec = function(recKey, dir) {
    save(function(prev) {
      var pCharts = Object.assign({}, prev.charts || {});
      var cc = pCharts[ck] || {};
      var arr = (cc.signalsOrder || []).slice();
      if (!arr.length || !arr.includes(recKey)) arr = currentOrder.slice();
      var idx = arr.indexOf(recKey);
      if (idx < 0) return prev;
      var to = idx + dir;
      if (to < 0 || to >= arr.length) return prev;
      var tmp = arr[idx]; arr[idx] = arr[to]; arr[to] = tmp;
      pCharts[ck] = Object.assign({}, cc, { signalsOrder: arr });
      return Object.assign({}, prev, { charts: pCharts });
    });
  };
  
  var _esDropRec = function(fromKey, toKey) {
    if (!fromKey || !toKey || fromKey === toKey) return;
    save(function(prev) {
      var pCharts = Object.assign({}, prev.charts || {});
      var cc = pCharts[ck] || {};
      var arr = (cc.signalsOrder || []).slice();
      if (!arr.length || !arr.includes(fromKey) || !arr.includes(toKey)) arr = currentOrder.slice();
      var fromIdx = arr.indexOf(fromKey);
      var toIdx = arr.indexOf(toKey);
      if (fromIdx < 0 || toIdx < 0) return prev;
      var moved = arr.splice(fromIdx, 1)[0];
      arr.splice(toIdx, 0, moved);
      pCharts[ck] = Object.assign({}, cc, { signalsOrder: arr });
      return Object.assign({}, prev, { charts: pCharts });
    });
  };
  
  var _esRenderRec = function(r, idx, total) {
    var recKey = _esRecKey(r);
    if (sortMode !== "custom") {
      return React.createElement(EntryLogCard, {
        key: recKey, record: r, data: data, collScope: stock, onEdit: function(rec) { setEditTarget(rec); }
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
          if (dragRecKey && dragRecKey !== recKey) _esDropRec(dragRecKey, recKey);
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
          onClick: function() { _esMoveRec(recKey, -1); },
          title: "上に移動",
          style: { width: 24, height: 14, padding: 0, fontSize: 9, lineHeight: 1, border: "1px solid #ccc",
            background: "#fafafa", borderRadius: 2,
            cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1 }
        }, "▲"),
        React.createElement("button", {
          disabled: idx === total - 1,
          onClick: function() { _esMoveRec(recKey, 1); },
          title: "下に移動",
          style: { width: 24, height: 14, padding: 0, fontSize: 9, lineHeight: 1, border: "1px solid #ccc",
            background: "#fafafa", borderRadius: 2,
            cursor: idx === total - 1 ? "default" : "pointer", opacity: idx === total - 1 ? 0.3 : 1 }
        }, "▼")
      ),
      React.createElement("div", { style: { flex: 1, minWidth: 0 } },
        React.createElement(EntryLogCard, {
          record: r, data: data, collScope: stock, onEdit: function(rec) { setEditTarget(rec); }
        })
      )
    );
  };

  
  var _esRealSum = 0, _esPlanSum = 0, _esMaxSum = 0;
  var _esHasReal = false, _esHasPlan = false, _esHasMax = false;
  var _esEnteredCount = 0, _esPlanCount = 0, _esMaxCount = 0;
  _recsForTot.forEach(function(r) {
    var s = r.signal;
    var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
    var _p100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };

    if (_elIsEntered(s, r.item)) {
      _esEnteredCount++;
      var rv = _elSignedVal(s.realizedPnl, s.realizedPnlSign);
      if (rv != null) { _esRealSum += rv; _esHasReal = true; }   // realized は「合計(実額)」バッジ＝_profitGradeFromPnlReal で実額判定するため非換算のまま
    }

    // 単独/最大は「100株あたり」バッジ＝保存の実株数額を per-100 換算（_elCalcStats と同基準）。2026-06-20
    var pv = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
    if (pv != null) { _esPlanSum += _p100(pv); _esPlanCount++; _esHasPlan = true; }
    var mv = _elSignedVal(s.maxPnl, s.maxPnlSign);
    if (mv != null) { _esMaxSum += _p100(mv); _esMaxCount++; _esHasMax = true; }
  });
  
  var _esGrades = {
    real: _profitGradeFromPnlReal(_esRealSum, _esEnteredCount),
    plan: _profitGradeFromPnl(_esPlanSum, _esPlanCount),
    max:  _profitGradeFromPnl(_esMaxSum,  _esMaxCount),
    realSum: _esEnteredCount > 0 ? _esRealSum : null,
    planSum: _esPlanCount   > 0 ? _esPlanSum  : null,
    maxSum:  _esMaxCount    > 0 ? _esMaxSum   : null
  };

  
  var _renderGradeLegend2Row = function(pairs) {
    var row1 = pairs.slice(0, 4), row2 = pairs.slice(4);
    var renderRow = function(items) {
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
    return React.createElement("div", {
      style: { fontSize: 9, color: "#999", background: "#f9f8f6",
        border: "1px solid #e0ddd6", borderRadius: 6, padding: "4px 8px",
        display: "flex", flexDirection: "column", gap: 3 }
    }, renderRow(row1), renderRow(row2));
  };

  
  // 共通ヘルパー(app-05)のエイリアス（旧ローカル実装を統合 2026-06-12）
  var _esRPnlCol = _elPnlColor;
  var _esRPnlFmt = _elPnlFmt;
  var _esBadge = _elGradeBadge18;
  var _esLane = _elLane;
  // バッジ22px＋値60pxの固定幅レーンで列内縦そろえ（miss/zero/未エントリーも同形にして桁を揃える）。
  var _esLaneCell = function(badge, valNode) { return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, _esLane(badge, 22), _esLane(valNode, 60, "flex-start")); };
  var _esRPnlDisp = function(v, grade, showZ) { return _elRPnlDispW(v, grade, 60, showZ); };
  var _esRPnlDispABAll = _elRPnlDispABAll;
  
  var _esTotReal = null, _esTotPlan = null, _esTotMax = null, _esTotHold = null;
  var _esTotRealCnt = 0, _esTotPlanCnt = 0, _esTotMaxCnt = 0, _esTotHoldCnt = 0;
  var _esTotPlanAB = null, _esTotMaxAB = null, _esTotHoldAB = null;
  var _esTotPlanABCnt = 0, _esTotMaxABCnt = 0, _esTotHoldABCnt = 0;
  var _esTotHoldHasUnrecorded = false;
  var _esTotHoldActual = null, _esTotHoldPlanStopDiff = false;
  var _esTotHoldRef = null, _esTotHoldRefCnt = 0;
  var _esTotHold2 = null, _esTotHold2Cnt = 0, _esTotHold2Ref = null, _esTotHold2RefCnt = 0;
  var _esTotPlanRef = null, _esTotPlanRefCnt = 0;
  _recsForTot.forEach(function(r) {
    if (_elCollExcluded(data, r, stock)) return;  // 時間かぶり除外: 良い方は合計行から全スキップ（行表示は全件）。銘柄別ビュー＝同一銘柄内のみ 2026-07-08
    var s = r.signal, rIt = r.item;
    var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
    var _p100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
    var rp = (rIt && rIt.pnl != null) ? Number(rIt.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
    var pp = (function() {
      var _stored = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
      var _avS = _esAlpha(s);
      if (_epIsV2(s)) return _elDynPlanned(s, _avS, _esCut(s));  // EP起算: EP足で計算
      if (s.osVal != null) {
        var _cutLSum = _esCut(s);
        var _conf = s.osConfVal != null ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal)) : null;
        var _diff = Number(s.osVal) - _avS;
        if (_avS > Number(s.osVal)) return 0;
        var _dynP = _diff < 0 ? 0 : _diff >= _cutLSum ? -Math.round(_diff * 100) : (_conf != null ? Math.round((_avS - _conf) * 100) : null);
        if (_dynP != null) return _dynP;
      }
      return _stored;
    })();
    var mp = pp;
    var _enteredTot = _elIsEntered(s, rIt);
    var hp = (function() {
      var _avH = _esAlpha(s);
      var _cutLhp = _esCut(s);
      // 行表示と一致させる: _elDynHold が値を返す行のみ合計に算入する。
      // miss(OS値<α)かつ見送りでも H高値がα到達なら _elDynHold は実損益を返す（→算入）。H高値未到達なら null（→除外）。
      return _elDynHold(s, _avH, _cutLhp);
    })();
    // H1未記録の注記: v2/v3はαで解決した役割の足（EPの次）の有無で判定（E成立時のみ）。旧記録はhold欄の有無。
    var _rUnrec = _epIsV2(s) ? _epResolve(s, _esAlpha(s)) : null;
    if (_rUnrec ? (_rUnrec.judge === "ok" && !(_rUnrec.h1 && (_rUnrec.h1.h != null || _rUnrec.h1.c != null)))
                : (!_epIsV2(s) && s.holdWidthSign == null && s.holdWidth == null && s.holdOsConf == null)) _esTotHoldHasUnrecorded = true;
    var _isXes = _epIsXSkip(s, _esAlpha(s));  // E×（×見送り）→本合計に算入せず参考(ref)へ
    var rpN = rp != null ? _p100(rp) : null;
    // pp/mp/hp/_h2tes は _elDynPlanned/_elDynHold/_elHold2TotParts の動的値＝既に100株換算済み。
    // _elCalcStats と同様、動的値は Math.round のみ（_p100 で株数を二重に割らない）。rp は保存実額なので _p100 を維持。2026-06-20
    var ppN = (pp != null && !_isXes) ? Math.round(pp) : null;
    var mpN = (mp != null && !_isXes) ? Math.round(mp) : null;
    var hpN = hp != null ? Math.round(hp) : null;
    if (rpN != null) { _esTotReal = (_esTotReal || 0) + rpN; _esTotRealCnt++; }
    // EP×（×見送り）→ EP/H1/H2とも完全に算入無し（参考にも入れない）。
    var _epTriEs = _epIsTriEntry(s, _esAlpha(s));  // EP-OS△（△の確信度でエントリー）→ EP損益は（）内のみ・（）外は0
    if (ppN != null) { if (_epTriEs) { _esTotPlanRef = (_esTotPlanRef || 0) + ppN; _esTotPlanRefCnt++; } else { _esTotPlan = (_esTotPlan || 0) + ppN; _esTotPlanCnt++; } }
    if (mpN != null) { _esTotMax  = (_esTotMax  || 0) + mpN; _esTotMaxCnt++; }
    // 想定が損切りの行は結果損益を想定額(ppN)にキャップして合計（本来額は _esTotHoldActual に保持し下にカッコ併記）。
    var _planStopTot = _elPlanIsStop(s, _esAlpha(s), _esCut(s));
    var _hCapN = (_planStopTot && ppN != null) ? ppN : hpN;
    var _hxEs = _elH1ExpAt(s, _esAlpha(s));   // H1保有ガバナンス＝次足期待度（採用αでは=s.holdExp）2026-07-06e
    var _fbEs = (_hxEs !== "○");  // ○以外（×/△/損切り済/未設定）→想定額(EP損益)へフォールバック。未設定=×扱い
    if (hpN != null) {
      if (_epTriEs) {
        // EP△→H1も（）外0。○/△/損切り済は（）内（参考）へ・×/未設定は完全除外（1段下0を継承）。
        if (_hxEs && _hxEs !== "×") { _esTotHoldRef = (_esTotHoldRef || 0) + _hCapN; _esTotHoldRefCnt++; }
      } else if (_fbEs && ppN != null) {
        _esTotHold = (_esTotHold || 0) + ppN;
        _esTotHoldActual = (_esTotHoldActual || 0) + ppN;
        _esTotHoldCnt++;
        if ((_hxEs === "△" || _hxEs === "損切り済") && (_hCapN - ppN) !== 0) { _esTotHoldRef = (_esTotHoldRef || 0) + (_hCapN - ppN); _esTotHoldRefCnt++; }  // △/損切り済のみH1保有時との差を参考（×/未設定は無し・差0除外）
      } else {
      _esTotHold = (_esTotHold || 0) + _hCapN;
      _esTotHoldActual = (_esTotHoldActual || 0) + hpN;
      _esTotHoldCnt++;
      if (_planStopTot && ppN != null && hpN !== ppN) _esTotHoldPlanStopDiff = true;
      }
    }
    var _h2tes = _elHold2TotParts(s, _esAlpha(s), _esCut(s));
    if (_h2tes.main != null) { _esTotHold2 = (_esTotHold2 || 0) + Math.round(_h2tes.main); _esTotHold2Cnt++; }
    if (_h2tes.ref != null) { _esTotHold2Ref = (_esTotHold2Ref || 0) + Math.round(_h2tes.ref); _esTotHold2RefCnt++; }
    var _isAB = (s.difficulty === "A" || s.difficulty === "B");
    if (ppN != null && _isAB && !_epTriEs) { _esTotPlanAB = (_esTotPlanAB || 0) + ppN; _esTotPlanABCnt++; }
    if (mpN != null && _isAB) { _esTotMaxAB  = (_esTotMaxAB  || 0) + mpN; _esTotMaxABCnt++; }
    if (hpN != null && _isAB) { _esTotHoldAB = (_esTotHoldAB || 0) + ((_fbEs && ppN != null) ? ppN : _hCapN); _esTotHoldABCnt++; }
  });
  var _esTotRealGrade = _esTotRealCnt > 0 ? _profitGradeFromPnlReal(_esTotReal != null ? _esTotReal : 0, _esTotRealCnt) : null;
  var _esTotPlanGrade = _esTotPlanCnt > 0 ? _profitGradeFromPnl(_esTotPlan != null ? _esTotPlan : 0, _esTotPlanCnt) : null;
  var _esTotMaxGrade  = _esTotMaxCnt  > 0 ? _profitGradeFromPnl(_esTotMax  != null ? _esTotMax  : 0, _esTotMaxCnt)  : null;
  var _esTotPlanGradeAB = _esTotPlanABCnt > 0 ? _profitGradeFromPnl(_esTotPlanAB != null ? _esTotPlanAB : 0, _esTotPlanABCnt) : null;
  var _esTotMaxGradeAB  = _esTotMaxABCnt  > 0 ? _profitGradeFromPnl(_esTotMaxAB  != null ? _esTotMaxAB  : 0, _esTotMaxABCnt)  : null;
  var _esTotHoldGrade   = _esTotHoldCnt   > 0 ? _profitGradeFromPnl(_esTotHold   != null ? _esTotHold   : 0, _esTotHoldCnt)   : null;
  var _esTotHoldGradeAB = _esTotHoldABCnt > 0 ? _profitGradeFromPnl(_esTotHoldAB != null ? _esTotHoldAB : 0, _esTotHoldABCnt) : null;
  var _esTotHold2Grade = _esTotHold2Cnt > 0 ? _profitGradeFromPnl(_esTotHold2 != null ? _esTotHold2 : 0, _esTotHold2Cnt) : null;
  var _esAllMiss = _elAllMissRow(_recsForTot, function(_r){ return _esAlpha(_r.signal); }, function(_r){ return _esCut(_r.signal); });

  return React.createElement("div", { style: { marginTop: 12, marginBottom: 12 } },
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 8 }
    },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 2 } },
        React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: "#1a1a1a" } },
          "🎯 エントリー記録",
          records.length > 0 && React.createElement("span", {
            style: { marginLeft: 8, fontSize: 11, color: "#888", fontWeight: 500 }
          }, "(" + records.length + "件)")
        )
        // 📖 記録帳ボタンは撤去 2026-07-21（この位置＝見出し直下に本日の採用α値欄を新設・下記_ElDayAlphaPair）
      ),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 } },
        
        (function() {
          var g = _esGrades.real;
          var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
          var amtTxt = _esGrades.realSum != null
            ? ((_esGrades.realSum > 0 ? "+" : "") + _esGrades.realSum.toLocaleString() + "円")
            : "取引なし";
          return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" } },
            React.createElement("div", {
              title: "実現損益: " + g + " (" + (_GRADE_DESC_REAL[g] || "") + ")\n" + amtTxt,
              style: { display: "flex", alignItems: "center", gap: 6,
                background: "#f9f8f6", border: "1.5px solid " + gs.border, borderRadius: 8,
                padding: "4px 10px", cursor: "default" }
            },
              React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#888", whiteSpace: "nowrap" } }, "💰 実現損益"),
                React.createElement("span", { style: { fontSize: 8, color: "#bbb", whiteSpace: "nowrap" } }, "(合計)")
              ),
              React.createElement("span", {
                style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 26, height: 26, borderRadius: "50%",
                  background: gs.bg, color: gs.color, border: "2px solid " + gs.border,
                  fontWeight: 800, fontSize: 14, lineHeight: 1 }
              }, g),
              React.createElement("span", {
                style: { fontSize: 11, fontWeight: 700,
                  color: _esGrades.realSum != null ? (_esGrades.realSum >= 0 ? "#C0392B" : "#1E8449") : "#aaa",
                  whiteSpace: "nowrap" }
              }, amtTxt)
            ),
            _renderGradeLegend2Row([["A+","25000円~"],["A-","20000~24999円"],["B","10000~19999円"],["C","1~9999円"],["D","0円"],["E","-1~-9999円"],["F","-10000~-19999円"],["G-","-20000~-24999円"],["G+","-25000円~"],["Z","取引なし"]])
          );
        })(),
        
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" } },
          React.createElement("div", {
            style: { display: "flex", alignItems: "center", gap: 6,
              background: "#f9f8f6", border: "1px solid #e0ddd6", borderRadius: 8,
              padding: "4px 10px" }
          },
            React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
              React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#888", whiteSpace: "nowrap" } }, "📊 単独/最大"),
              React.createElement("span", { style: { fontSize: 8, color: "#bbb", whiteSpace: "nowrap" } }, "(100株あたり)")
            ),
            (function() {
              var _items = [
                { key: "plan", label: "単独", sum: _esGrades.planSum },
                { key: "max",  label: "最大", sum: _esGrades.maxSum }
              ];
              return _items.map(function(item) {
                var g = _esGrades[item.key];
                var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z;
                var amtTxt = item.sum != null
                  ? (item.sum > 0 ? "+" : "") + item.sum.toLocaleString() + "円"
                  : "取引なし";
                return React.createElement("div", {
                  key: item.key,
                  title: item.label + "損益: " + g + " (" + (_GRADE_DESC[g] || "") + ")\n" + amtTxt,
                  style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "default" }
                },
                  React.createElement("span", { style: { fontSize: 9, color: "#aaa", lineHeight: 1, fontWeight: 600 } }, item.label),
                  React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 3 } },
                    React.createElement("span", {
                      style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%",
                        background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border,
                        fontWeight: 800, fontSize: 12, lineHeight: 1 }
                    }, g),
                    React.createElement("span", {
                      style: { fontSize: 10, fontWeight: 700,
                        color: item.sum != null ? (item.sum >= 0 ? "#C0392B" : "#1E8449") : "#aaa",
                        whiteSpace: "nowrap" }
                    }, amtTxt)
                  )
                );
              });
            })()
          ),
          _renderGradeLegend2Row([["A+","2500円~"],["A-","2000~2499円"],["B","1000~1999円"],["C","1~999円"],["D","0円"],["E","-1~-999円"],["F","-1000~-1999円"],["G-","-2000~-2499円"],["G+","-2500円~"],["Z","取引なし"]])
        )
      )
    ),

    // 本日の採用α値欄（基本α+応用α・EPナビ/記録帳と同一部品_ElDayAlphaPair）2026-07-21: 旧📖記録帳ボタンの位置＝見出し直下へ
    (save && stock && typeof _ElDayAlphaPair === "function") ? React.createElement("div", { style: { marginBottom: 10 } },
      React.createElement(_ElDayAlphaPair, { data: data, save: save, date: date, stock: stock })) : null,

    records.length === 0 && React.createElement("div", { style: { marginBottom: 8 } },
      React.createElement("button", {
        onClick: function() { setShowAddForm(true); },
        style: {
          padding: "6px 14px", fontSize: 12, fontWeight: 700,
          background: "#FFF7ED", color: "#9A3412",
          border: "1.5px solid #FB923C", borderRadius: 6, cursor: "pointer",
          minHeight: IS_TOUCH ? 36 : 28
        }
      }, "+ 追加")
    ),
    
    records.length > 0 && React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
        background: "#f5f4f0", borderRadius: 6, marginBottom: 8,
        fontSize: 12, flexWrap: "wrap" }
    },
      (function() {
        var allExp = records.every(function(r) { return !!tableRecExp[_esRecKey(r)]; });
        return React.createElement("button", {
          onClick: function() {
            if (allExp) {
              setTableRecExp({});
            } else {
              setTableRecExp(function() {
                var n = {};
                records.forEach(function(r) { n[_esRecKey(r)] = true; });
                return n;
              });
            }
          },
          style: {
            padding: "4px 10px", fontSize: 11, fontWeight: 600,
            border: "1px solid #ddd", background: "#fff",
            color: "#555", borderRadius: 4, cursor: "pointer", flexShrink: 0
          }
        }, allExp ? "▲ すべて折りたたむ" : "▼ すべて展開");
      })(),
      records.length >= 2 && React.createElement("span", { style: { color: "#666", fontWeight: 600, flexShrink: 0 } }, "並び替え:"),
      records.length >= 2 && React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
        [["time", "⏱ 時間順"], ["category", "🏷 カテゴリ別"]].map(function(kv) {
          var val = kv[0], lbl = kv[1];
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
          }, lbl);
        })
      )
    ),
    false ? (function() {   // 一括α理想値バー撤去 2026-07-07
      // 適用中=表示中の全記録のα値シミュが各記録の推奨基本α値と一致。trueならボタンに✓＋塗りつぶし表示。
      var _esBAV = (function() { var _ba = _elBaseAlphaPick(records, function(r) { return { cutLine: _esCut(r.signal) }; }); return (_ba && _ba.alpha != null) ? String(_ba.alpha) : null; })();
      var _esApplied = _esBAV != null && records.length > 0 && records.every(function(r) { return _esSimAlpha[_esRecKey(r)] === _esBAV; });
      return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8, padding: "2px 0", flexWrap: "wrap" } },
      React.createElement("button", {
        onClick: function() { if (_esBAV == null) return; var _m = {}; records.forEach(function(r) { _m[_esRecKey(r)] = _esBAV; }); setEsSimAlpha(_m); },
        title: _esApplied ? "適用中: 表示中の全記録のα値シミュが推奨基本α値です" : "表示中の全記録のα値シミュに、推奨基本α値（この期間の5〜20）を一括入力（非保存）",
        style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, padding: "3px 10px", border: "1px solid #0369A1", borderRadius: 5, background: _esApplied ? "#0369A1" : "#E0F2FE", color: _esApplied ? "#fff" : "#0369A1", cursor: "pointer", whiteSpace: "nowrap" }
      }, _esApplied ? React.createElement("span", { key: "mk", style: { fontWeight: 800 } }, "✓") : null, "一括 推奨基本α"),
      React.createElement("button", {
        onClick: function() { setEsSimAlpha({}); },
        title: "α値シミュを全て各記録の採用α値（既定）に戻す",
        style: { fontSize: 11, fontWeight: 600, padding: "3px 10px", border: "1px solid #ddd", borderRadius: 5, background: "#f5f4f0", color: "#555", cursor: "pointer", whiteSpace: "nowrap" }
      }, "リセット")
    ); })() : null,
    records.length > 0 ? React.createElement("div", {
      style: { display: "flex", gap: 12, marginBottom: 6, padding: "4px 10px", background: "#FFF7ED", borderRadius: 6, border: "1px solid #FFE0BB", alignItems: "center", flexWrap: "wrap" }
    },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#9A3412", whiteSpace: "nowrap" } }, "合計"),
      React.createElement("span", { style: { fontSize: 11, color: "#555", whiteSpace: "nowrap" } },
        "最終損益: ",
        React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esTotHold2Cnt > 0
          ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esTotHold2Grade ? _esBadge(_esTotHold2Grade) : null, React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(_esTotHold2) } }, _elPnlFmt(_esTotHold2)))
          : (_esTotHold2RefCnt > 0 ? null : (_esAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_esTotHold2, _esTotHold2Ref, _esTotHold2RefCnt))
      )
    ) : null,
    records.length === 0
      ? React.createElement("div", {
          style: {
            fontSize: 12, color: "#999",
            padding: "14px 8px", textAlign: "center",
            background: "#fafaf8", borderRadius: 6, border: "1px dashed #e0ddd6"
          }
        }, "エントリー記録がありません。「+ 追加」から記録できます。")
      : (function() {
          var tblItems = groupedRecs
            ? groupedRecs.reduce(function(acc, grp) { return acc.concat(grp.records.map(function(r) { return { r: r, grpLabel: grp.label }; })); }, [])
            : (sortedRecs || []).map(function(r) { return { r: r, grpLabel: null }; });
          var _esTh = function(label, extra) {
            return React.createElement("th", { style: Object.assign({ padding: "1px 4px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" }, extra || {}) }, label);
          };
          var isCustomMode = sortMode === "custom";
          var totRow = React.createElement("tr", { key: "__estot__", style: { background: "#FFF7ED" } },
            React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: "4px 8px", fontWeight: 700, fontSize: 11, color: "#555", borderTop: "2px solid #FB923C", borderBottom: "1px solid #f0ede6" } }, "合計"),
            React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6", background: "#FFFBF0" } },
              React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, "最終損益"),
              React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esTotHold2Cnt > 0 ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esTotHold2Grade ? _esBadge(_esTotHold2Grade) : null, React.createElement("span", { style: { fontWeight: 600, color: _esTotHold2 > 0 ? "#C0392B" : _esTotHold2 < 0 ? "#1E8449" : "#888" } }, (_esTotHold2 > 0 ? "+" : "") + (_esTotHold2 || 0).toLocaleString() + "円")) : (_esTotHold2RefCnt > 0 ? null : (_esAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_esTotHold2, _esTotHold2Ref, _esTotHold2RefCnt))
            ),
            React.createElement("td", { colSpan: 2, style: { padding: "1px 4px", textAlign: "left", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6", background: "#F8FBFE" } },
              React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1 } },
                React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "EP："),
                  _esAllMiss ? _qZeroCell() : React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esRPnlDispABAll(_esTotPlanAB, _esTotPlan, _esTotPlanGradeAB, _esTotPlanGrade), _elHold2RefSuffix(_esTotPlan, _esTotPlanRef, _esTotPlanRefCnt))),
                React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H１："),
                  _esTotHoldCnt > 0 ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" } }, _esRPnlDispABAll(_esTotHoldAB, _esTotHold, _esTotHoldGradeAB, _esTotHoldGrade), _esTotHoldHasUnrecorded ? React.createElement("span", { style: { fontSize: 9, color: "#aaa" } }, "（※未記録あり）") : null) : (_esTotHoldRefCnt > 0 ? null : (_esAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_esTotHold, _esTotHoldRef, _esTotHoldRefCnt)),
                React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } },
                  React.createElement("span", { style: { fontSize: 9, color: "#9A3412", fontWeight: 700, marginRight: 1 } }, "H２："),
                  React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esTotHold2Cnt > 0 ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esTotHold2Grade ? _esBadge(_esTotHold2Grade) : null, React.createElement("span", { style: { fontWeight: 600, color: _esTotHold2 > 0 ? "#C0392B" : _esTotHold2 < 0 ? "#1E8449" : "#888" } }, (_esTotHold2 > 0 ? "+" : "") + (_esTotHold2 || 0).toLocaleString() + "円")) : (_esTotHold2RefCnt > 0 ? null : (_esAllMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"))), _elHold2RefSuffix(_esTotHold2, _esTotHold2Ref, _esTotHold2RefCnt))))),
            React.createElement("td", { style: { borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } }),
            React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderTop: "2px solid #FB923C", borderLeft: "1px solid #f0ede6", borderBottom: "1px solid #f0ede6" } },
              React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _esLane(null, 26), _esTotRealCnt > 0 ? _esRPnlDisp(_esTotReal, _esTotRealGrade) : React.createElement("span", { style: { color: "#ccc" } }, "—"))
            ),
            isCustomMode ? React.createElement("td", { style: { borderTop: "2px solid #FB923C", borderBottom: "1px solid #f0ede6" } }) : null
          );
          var botTotRow = React.cloneElement(totRow, { key: "__estotbot__" });
          var prevGrpLabel = null;
          var dataRows = [];
          tblItems.forEach(function(tblItem) {
            var r = tblItem.r, grpLabel = tblItem.grpLabel;
            var rKey = _esRecKey(r);
            var rExp = !!tableRecExp[rKey];
            var s = r.signal, rIt = r.item;
            var _sh = Number(s.shares) > 0 ? Number(s.shares) : 0;
            var _p100 = function(v) { return _sh > 0 ? Math.round(v / _sh * 100) : Math.round(v); };
            var realPnl = (rIt && rIt.pnl != null) ? Number(rIt.pnl) : _elSignedVal(s.realizedPnl, s.realizedPnlSign);
            var planPnl = _elSignedVal(s.plannedPnl, s.plannedPnlSign);
            var maxPnl  = _elSignedVal(s.maxPnl, s.maxPnlSign);
            var realPnlN = realPnl != null ? _p100(realPnl) : null;
            var planPnlN = planPnl != null ? _p100(planPnl) : null;
            var maxPnlN  = maxPnl  != null ? _p100(maxPnl)  : null;
            
            if (_epIsV2(s)) {
              // EP起算v2: EP足基準の共通ヘルパーで（EP=OS2/3でも損益変化記号の比較元・損切り額が正しくなる）
              var _dynPnlV2 = _elDynPlanned(s, _esAlpha(s), _esCut(s));
              if (_dynPnlV2 != null) {
                planPnl = _dynPnlV2; planPnlN = _dynPnlV2;
                maxPnl  = _dynPnlV2; maxPnlN  = _dynPnlV2;
              }
            } else if (s.osVal != null) {
              var _avDyn = _esAlpha(s);
              var _osVDyn = Number(s.osVal);
              var _cutLDyn = _esCut(s);
              var _confDyn = s.osConfVal != null
                ? (s.osConfSign === "-" ? -(Number(s.osConfVal)) : Number(s.osConfVal))
                : null;
              var _diffDyn = _osVDyn - _avDyn;
              var _dynPnl = null;
              if (_diffDyn < 0) {
                _dynPnl = 0;
              } else if (_diffDyn >= _cutLDyn) {
                _dynPnl = -Math.round(_diffDyn * 100);
              } else if (_confDyn != null) {
                _dynPnl = Math.round((_avDyn - _confDyn) * 100);
              }
              if (_dynPnl != null) {
                planPnl = _dynPnl; planPnlN = _dynPnl;
                maxPnl  = _dynPnl; maxPnlN  = _dynPnl;
              }
            }
            
            
            var _holdPnlDyn = _elSignedVal(s.holdPnl, s.holdPnlSign);
            var _avH = _esAlpha(s);
            var _cutLH = _esCut(s);
            if (_avH != null) { _holdPnlDyn = _elDynHold(s, _avH, _cutLH); }
            var _holdIsUnrecorded = s.holdWidthSign == null && s.holdWidth == null && s.holdOsConf == null;
            var entered = _elIsEntered(s, rIt);
            var realGrade = entered ? ((realPnlN != null) ? _profitGradeFromPnlReal(realPnlN, 1) : null) : "Z";
            var planGrade = planPnlN != null ? _profitGradeFromPnl(planPnlN, 1) : null;
            
            var _dynResult = (function() {
              if (_epIsV2(s)) return _elDynResult(s, _esAlpha(s), _esCut(s)) || null;  // EP起算: EP足で判定
              if (s.osVal == null || Number(s.osVal) < 0) return null;
              var _av = (_esAlpha(s)), _osV = Number(s.osVal), _diff = _osV - _av;
              if (_diff < 0) return "miss";
              if (_diff >= _esCut(s)) return "ng";
              if (s.osConfVal == null || s.osConfVal === "") return null;
              var _cf = s.osConfSign === "+" ? Number(s.osConfVal) : s.osConfSign === "-" ? -Number(s.osConfVal) : 0;
              if (_cf < _av) return "ok";
              if (_cf === _av) return "draw";
              return "ng";
            })();
            var _dispResult = _dynResult !== null ? _dynResult : s.result;
            
            var _dynHoldProfitES = _elDeriveHoldProfit(_holdPnlDyn, planPnlN, _dispResult, s.holdProfit);
            var holdResultEl = _dynHoldProfitES === "yes"
              ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700 } }, "○")
              : _dynHoldProfitES === "mid"
                ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700 } }, "△")
                : _dynHoldProfitES === "none"
                  ? React.createElement("span", { style: { color: "#888", fontWeight: 700 } }, "ー")
                  : _dynHoldProfitES === "no"
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
            var resultEl = _dispResult === "ok"
              ? React.createElement("span", { style: { color: "#C0392B", fontWeight: 700, fontSize: 13 } }, "○")
              : _dispResult === "ng"
                ? React.createElement("span", { style: { color: "#1E8449", fontWeight: 700, fontSize: 13 } }, "×")
                : _dispResult === "draw"
                  ? React.createElement("span", { style: { color: "#6B7280", fontWeight: 700, fontSize: 13 } }, "△")
                  : _dispResult === "miss"
                    ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700, fontSize: 11 } }, "ー")
                    : React.createElement("span", { style: { color: "#ccc" } }, "—");
            var rKeyRef = rKey;
            var recIdx = isCustomMode ? (sortedRecs || []).indexOf(r) : 0;
            var totalRecs = isCustomMode ? (sortedRecs || []).length : 0;
            dataRows.push(
              React.createElement("tr", { key: rKey,
                style: Object.assign({ cursor: "pointer", background: rExp ? "#FFFBF5" : "transparent" }, _elRowStyleWithColl(data, r, stock)),
                onClick: function() { setTableRecExp(function(prev) { var n = Object.assign({}, prev); if (n[rKeyRef]) delete n[rKeyRef]; else n[rKeyRef] = true; return n; }); }
              },
                React.createElement("td", { style: { padding: "1px 4px", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
                  React.createElement("div", null,
                    React.createElement("span", { style: { marginRight: 3, color: "#F97316", fontSize: 9 } }, rExp ? "▼" : "▶"),
                    s.time || "—", _minBarBadge(s)),
                  _epIncompleteMark(s), _elCollMarkNode(data, r, stock), _elFillRiskNode(r),
                  _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge(null, s)) : null
                ),
                React.createElement("td", { style: { padding: "1px 4px", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
                  _elSigCell(s, "flex-start")),
                React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%", background: _elSpecialUsed(s) ? "#FEF3C7" : null } },
                  _elAlphaTypeCell(s, _avH)),
                React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  _elCutValNode(_cutLH)),
                _elLineCell(s, _avH, _cutLH, "1px solid #f0ede6"),
                React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  _epECell(s, _avH)),
                React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", width: "1%" } },
                  entered
                    ? React.createElement("span", { style: { color: "#2E7D32", fontWeight: 700, fontSize: 14 } }, "〇")
                    : _elIsThru(s)
                      ? React.createElement("span", { title: "スルー", style: { color: "#6B7280", fontWeight: 700, fontSize: 11 } }, "ス")
                      : _elIsReview(s)
                        ? React.createElement("span", { title: "要審議", style: { color: "#DB2777", fontWeight: 700, fontSize: 11 } }, "審")
                        : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×")),
                React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", background: "#FFFBF0" } },
                  _elHold2AmtNode(s, _avH, _cutLH), _elRideMiniNode(s, _avH, _cutLH)),
                React.createElement("td", { colSpan: 2, style: { padding: "1px 5px", textAlign: "left", fontSize: 11, borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6", background: "#F8FBFE" } },
                  _elDetailFlowStack(s, _avH, _cutLH)),
                React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: "1px solid #f0ede6" } },
                  _elHoldMinNode(s, _avH, _cutLH)),
                React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: "1px solid #f0ede6", borderRight: isCustomMode ? "1px solid #f0ede6" : "none" } }, _esLane(_tradeAlphaChip(s), 26, "flex-end"), _esRPnlDisp(entered ? realPnlN : 0, realGrade, !entered)),
                isCustomMode ? React.createElement("td", {
                  style: { padding: "2px 4px", textAlign: "center", borderBottom: "1px solid #f0ede6" },
                  onClick: function(e) { e.stopPropagation(); }
                },
                  React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 1 } },
                    React.createElement("button", {
                      disabled: recIdx === 0,
                      onClick: function(e) { e.stopPropagation(); _esMoveRec(rKeyRef, -1); },
                      style: { width: 22, height: 14, padding: 0, fontSize: 9, border: "1px solid #ccc", background: "#fafafa", borderRadius: 2, cursor: recIdx === 0 ? "default" : "pointer", opacity: recIdx === 0 ? 0.3 : 1 }
                    }, "▲"),
                    React.createElement("button", {
                      disabled: recIdx >= totalRecs - 1,
                      onClick: function(e) { e.stopPropagation(); _esMoveRec(rKeyRef, 1); },
                      style: { width: 22, height: 14, padding: 0, fontSize: 9, border: "1px solid #ccc", background: "#fafafa", borderRadius: 2, cursor: recIdx >= totalRecs - 1 ? "default" : "pointer", opacity: recIdx >= totalRecs - 1 ? 0.3 : 1 }
                    }, "▼")
                  )
                ) : null
              )
            );
            if (rExp) {
              dataRows.push(
                React.createElement("tr", { key: rKey + "_card" },
                  React.createElement("td", { colSpan: isCustomMode ? 13 : 12, style: { padding: "4px 8px 8px", background: "#FFFBF5", borderBottom: "1px solid #f0ede6" } },
                    React.createElement(EntryLogCard, { record: r, data: data, collScope: stock, onEdit: function(rec) { setEditTarget(rec); } })
                  )
                )
              );
            }
          });
          return React.createElement(React.Fragment, null,
            React.createElement("div", { style: { overflowX: "auto", marginBottom: 8 } },
            React.createElement("table", { style: { width: "auto", borderCollapse: "collapse", fontSize: 11 } },
              React.createElement("thead", null,
                React.createElement("tr", null,
                  _esTh("時間", { textAlign: "left", width: 50 }),
                  _esTh("シグナル", { width: 1, whiteSpace: "nowrap" }),
                  _esTh("α値", { width: 36 }),
                  _esTh("損切り", { width: 34 }),
                  _esTh("ライン", { width: 1 }),
                  _esTh("E", { width: 28 }),
                  _esTh("取引", { width: 28 }),
                  _esTh("最終損益・詳細", { width: 84 }),
                  React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "OS・損益詳細"),
                  _esTh(React.createElement("span", { title: "EP足〜手じまい足の保有時間（1分足換算・時間かぶり判定と同基準）" }, "保有"), { width: 30 }),
                  _esTh("実現損益", { width: 90 }),
                  isCustomMode ? _esTh("並替", { width: 40 }) : null
                )
              ),
              React.createElement("tbody", null, dataRows.concat([botTotRow]))
            )
          )
          );
        })(),
    
    records.length > 0 && React.createElement("div", { style: { marginTop: 6, marginBottom: 2 } },
      React.createElement("button", {
        onClick: function() { setShowAddForm(true); },
        style: {
          padding: "6px 14px", fontSize: 12, fontWeight: 700,
          background: "#FFF7ED", color: "#9A3412",
          border: "1.5px solid #FB923C", borderRadius: 6, cursor: "pointer",
          minHeight: IS_TOUCH ? 36 : 28
        }
      }, "+ 追加")
    ),
    editTarget && React.createElement(EntryRecordForm, {
      data: data,
      save: save,
      initial: editTarget,
      onClose: function() { setEditTarget(null); }
    }),
    showAddForm && React.createElement(EntryRecordForm, {
      data: data,
      save: save,
      initial: { stock: stock, date: date },
      onClose: function() { setShowAddForm(false); }
    })
  );
}


function _nikkeiMacroFromChange(yen) {
  if (typeof yen !== "number") return null;
  if (yen >= 1200)  return "激強";
  if (yen >= 600)   return "強";
  if (yen >= 300)   return "やや強";
  if (yen > -300)   return "普通";
  if (yen > -600)   return "やや弱";
  if (yen > -1200)  return "弱";
  return "激弱";
}





function _NikkeiManualInput(_p) {
  var cd = _p.cd;
  var upd = _p.upd;
  
  var curYen = (cd && typeof cd.prevDayChange === "number") ? cd.prevDayChange : null;
  var _us = useState(null), _usS = _slicedToArray(_us, 2),
      signOverride = _usS[0], setSignOverride = _usS[1];
  useEffect(function() {
    setSignOverride(null);
  }, [cd && cd.prevDayChange]);
  var derivedSign = (curYen == null) ? "+" : (curYen < 0 ? "-" : "+");
  var sign = signOverride || derivedSign;
  var absStr = (curYen == null) ? "" : Math.abs(curYen).toString();
  var commitChange = function(newAbsStr) {
    var s = (newAbsStr || "").trim();
    if (s === "" || s === ".") {
      if (cd && cd.prevDayChange != null) upd("prevDayChange", null);
      return;
    }
    var n = parseFloat(s);
    if (isNaN(n)) return;
    var signed = (sign === "-") ? -Math.abs(n) : Math.abs(n);
    if (cd && typeof cd.prevDayChange === "number" && Math.abs(cd.prevDayChange - signed) < 0.5) return;
    upd("prevDayChange", signed);
    setSignOverride(null);
    
    var suggestedMacro = _nikkeiMacroFromChange(signed);
    if (suggestedMacro) upd("macroLocal", suggestedMacro);
  };
  var toggleSign = function() {
    var newSign = (sign === "+") ? "-" : "+";
    if (curYen != null && Math.abs(curYen) > 0.0001) {
      var signed = (newSign === "-") ? -Math.abs(curYen) : Math.abs(curYen);
      upd("prevDayChange", signed);
      setSignOverride(null);
    } else {
      setSignOverride(newSign);
    }
  };
  
  var curClose = (cd && typeof cd.dayClose === "number") ? cd.dayClose : null;
  var closeStr = (curClose == null) ? "" : String(curClose);
  var commitClose = function(newStr) {
    var s = (newStr || "").trim().replace(/,/g, "");
    if (s === "" || s === ".") {
      if (cd && cd.dayClose != null) upd("dayClose", null);
      return;
    }
    var n = parseFloat(s);
    if (isNaN(n) || n < 0) return;
    if (cd && typeof cd.dayClose === "number" && Math.abs(cd.dayClose - n) < 0.001) return;
    upd("dayClose", n);
    
    var prevClose = _p.getPrevClose ? _p.getPrevClose() : null;
    if (typeof prevClose === "number" && prevClose > 0) {
      var diff = n - prevClose;
      var diffRounded = Math.round(diff * 100) / 100;
      upd("prevDayChange", diffRounded);
      var suggestedMacro = _nikkeiMacroFromChange(diffRounded);
      if (suggestedMacro) upd("macroLocal", suggestedMacro);
    }
  };
  return React.createElement("span", {
    style: { display: "inline-flex", alignItems: "center", gap: 8, marginLeft: "auto", flexWrap: "wrap" }
  },
    
    React.createElement("span", {
      style: { display: "inline-flex", alignItems: "center", gap: 4 }
    },
      React.createElement("span", {
        style: { fontSize: 11, color: "#888", fontWeight: 600 }
      }, "\u7D42\u5024"),
      React.createElement(FastInput, {
        type: "text",
        inputMode: "decimal",
        value: closeStr,
        onChange: commitClose,
        debounceMs: 86400000,
        placeholder: "0",
        transformInput: _toHankakuDecimal,
        onKeyDown: function(e) { if (e.key === "Enter") { e.target.__fiCommit && e.target.__fiCommit(); e.target.blur(); } },
        style: {
          width: 90, fontSize: 12, padding: "3px 6px",
          border: "1px solid #ccc", borderRadius: 5, textAlign: "right",
          fontVariantNumeric: "tabular-nums"
        }
      }),
      React.createElement("span", {
        style: { fontSize: 11, color: "#888", fontWeight: 600 }
      }, "\u5186")
    ),
    
    React.createElement("span", {
      style: { display: "inline-flex", alignItems: "center", gap: 4 }
    },
      React.createElement("span", {
        style: { fontSize: 11, color: "#888", fontWeight: 600 }
      }, "\u524D\u65E5\u6BD4"),
      React.createElement("button", {
        onClick: toggleSign,
        title: "\u7B26\u53F7\u3092\u5207\u308A\u66FF\u3048",
        style: {
          padding: "3px 8px", fontSize: 12, fontWeight: 700,
          background: sign === "+" ? "#FEE2E2" : "#DCFCE7",
          color: sign === "+" ? "#DC2626" : "#16A34A",
          border: "1px solid " + (sign === "+" ? "#FECACA" : "#BBF7D0"),
          borderRadius: 5, cursor: "pointer", minWidth: 28, lineHeight: 1
        }
      }, sign),
      React.createElement(FastInput, {
        type: "text",
        inputMode: "decimal",
        value: absStr,
        onChange: commitChange,
        debounceMs: 86400000,
        placeholder: "0",
        transformInput: _toHankaku,
        onKeyDown: function(e) { if (e.key === "Enter") { e.target.__fiCommit && e.target.__fiCommit(); e.target.blur(); } },
        style: {
          width: 70, fontSize: 12, padding: "3px 6px",
          border: "1px solid #ccc", borderRadius: 5, textAlign: "right",
          fontVariantNumeric: "tabular-nums"
        }
      }),
      React.createElement("span", {
        style: { fontSize: 11, color: "#888", fontWeight: 600 }
      }, "\u5186")
    )
  );
}

// 単一銘柄の「今週の損益データ」パネル（取引タブの今週欄と同システム＝同じ計算/セルヘルパー・明細表・α/損切りシミュ・週送り・理想α）。
// ChartSection末尾の📝メモ下に表示。hideSignals(日経)では非表示・外国市場はChartSection自体が描画されないため対象外。合計は_elTotAccumで取引タブと一致。
function WeeklyPnlPanel(_wpp) {
  var data = _wpp.data, stock = _wpp.stock, date = _wpp.date, save = _wpp.save;
  var _wo = useState(0), weekOffset = _wo[0], setWeekOffset = _wo[1];
  var _wsa = useState({}), simAlpha = _wsa[0], setSimAlpha = _wsa[1];
  var _wsc = useState({}), simCut = _wsc[0], setSimCut = _wsc[1];
  var _wre = useState({}), recExp = _wre[0], setRecExp = _wre[1];
  var _wde = useState({}), dayExp = _wde[0], setDayExp = _wde[1];
  var _wet = useState(null), _wEdit = _wet[0], _wSetEdit = _wet[1];   // 展開カードから選択記録を編集（EntryRecordForm）2026-07-14g
  useEffect(function() { setSimAlpha({}); setSimCut({}); }, [date, weekOffset, stock]);
  var _wkHoli = useMemo(function() { return _buildHolidayDateSet(data && data.trades, data && data.custom && data.custom.eventCategories); }, [data]);   // 休場日（カレンダーの「祝日・休場」イベント＝頻度計算と同じ）＝日付行に「休」表示 2026-07-14e
  var _pad = function(n) { return ("0" + n).slice(-2); };
  var _d0 = new Date(date + "T00:00:00");
  var _mon = new Date(_d0); _mon.setDate(_d0.getDate() - ((_d0.getDay() + 6) % 7) + weekOffset * 7);
  var _wkDates = [];
  for (var _wi = 0; _wi < 5; _wi++) { var _wd = new Date(_mon); _wd.setDate(_mon.getDate() + _wi); _wkDates.push(_wd.getFullYear() + "-" + _pad(_wd.getMonth() + 1) + "-" + _pad(_wd.getDate())); }
  var _charts = data.charts || {}, _trades = data.trades || {};
  var _recs = [];
  _wkDates.forEach(function(wd) {
    var _c = _charts[stock + "_" + wd]; var _sigs = (_c && Array.isArray(_c.signals)) ? _c.signals : [];
    var _items = (_trades[wd] && _trades[wd].items) || [];
    _sigs.forEach(function(sig) {
      var s = _compatSignal(sig); var it = null;
      if (s.itemId != null) { for (var _j = 0; _j < _items.length; _j++) { if (String(_items[_j].id) === String(s.itemId)) { it = _items[_j]; break; } } }
      _recs.push({ date: wd, stock: stock, signal: s, item: it });
    });
  });
  var _key = function(r) { return r.stock + "_" + r.date + "_" + (r.signal.id || r.signal.time || ""); };
  var _alphaActual = function(r) { var s = r.signal; return s && s.alphaVal != null && s.alphaVal !== "" ? Number(s.alphaVal) : _gradeAlpha(s && s.difficulty); };
  var _cutActual = function(r) { var c = _charts[r.stock + "_" + r.date]; return c && c.cutLine != null ? c.cutLine : 15; };
  var _alphaOf = function(r) { var o = simAlpha[_key(r)]; return (o != null && o !== "" && !isNaN(Number(o))) ? Number(o) : _alphaActual(r); };
  var _cutOf = function(r) { var o = simCut[_key(r)]; return (o != null && o !== "" && !isNaN(Number(o))) ? Number(o) : _cutActual(r); };
  var _navBtn = function(lbl, fn) { return React.createElement("button", { onClick: fn, style: { padding: "2px 9px", fontSize: 13, fontWeight: 700, background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", color: "#555", lineHeight: 1.2 } }, lbl); };
  var _simInput = function(r, isAlpha) { return null;   // α/損切りシミュ撤去 2026-07-07
    var k = _key(r);
    var actual = isAlpha ? _alphaActual(r) : _cutActual(r);
    var sv = isAlpha ? simAlpha : simCut, setSv = isAlpha ? setSimAlpha : setSimCut;
    var raw = sv[k];
    var hasOv = raw != null && raw !== "";
    var curStr = (raw != null) ? raw : (actual != null ? String(actual) : "");
    var isSim = hasOv && actual != null && Number(raw) !== actual;
    var col = isAlpha ? "#0369A1" : "#9333EA";
    var stop = function(e) { if (e && e.stopPropagation) e.stopPropagation(); };
    var baseNum = function() { return (raw != null && raw !== "") ? Number(raw) : (actual != null ? actual : 0); };
    var setVal = function(v) { setSv(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
    var clearVal = function() { setSv(function(p) { var n = Object.assign({}, p); delete n[k]; return n; }); };
    return React.createElement("div", { onClick: stop, style: { marginTop: 1, display: "flex", justifyContent: "center" } },
      React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 2 } },
        React.createElement("div", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid " + (isSim ? col : "#cbd5e1"), borderRadius: 5, overflow: "hidden", background: "#fff" } },
          React.createElement("input", { type: "text", inputMode: "numeric", step: "1", min: "0", value: curStr, onClick: stop,
            onChange: function(e) { setVal(_toHankakuNum(e.target.value)); },
            style: { width: 20, padding: "2px 3px", border: "none", outline: "none", background: "transparent", textAlign: "right", fontSize: 11, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums" } }),
          React.createElement("span", { style: { fontSize: 8, color: "#94A3B8", alignSelf: "center", padding: "0 1px" } }, "円"),
          _stepBtn(function() { setVal(String(baseNum() + 1)); }, function() { setVal(String(Math.max(0, baseNum() - 1))); })
        ),
        React.createElement("button", { onClick: function(e) { stop(e); var ideal = isAlpha ? _elIdealAlpha(r.signal, _cutOf(r)) : _elIdealCut(r.signal, _alphaOf(r)); if (ideal == null) return; if (actual != null && ideal === Number(actual)) clearVal(); else setVal(String(ideal)); },
          title: isAlpha ? "損切りにならず『EP損益＋H1結果損益』が最大になるα" : "損切りを回避できる最小の損切り値",
          style: { fontSize: 8, padding: "1px 4px", border: "1px solid " + col, borderRadius: 3, background: isAlpha ? "#E0F2FE" : "#F3E8FF", color: col, cursor: "pointer", lineHeight: 1.4, whiteSpace: "nowrap", fontWeight: 700 } }, "理想"),
        React.createElement("button", { onClick: function(e) { stop(e); if (!isSim) return; clearVal(); },
          style: { fontSize: 8, padding: "0 4px", border: "1px solid #cbd5e1", borderRadius: 3, background: "#F1F5F9", color: col, cursor: "pointer", lineHeight: 1.4, display: isSim ? "inline-block" : "none" } }, "↺")
      )
    );
  };
  var _bb = "1px solid #e8e5de";
  var _rTh = function(label, extra) { return React.createElement("th", { style: Object.assign({ padding: "1px 3px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "center", fontSize: 10, lineHeight: 1.15, color: "#9A3412" }, extra || {}) }, label); };
  // ===== 1記録ごとの明細行（展開時のみ表示。日別／週合計で共用）=====
  var _detailRowsFor = function(_list) {
  var _sorted = _list.slice().sort(function(a, b) { return (a.date + (a.signal.time || "99:99")).localeCompare(b.date + (b.signal.time || "99:99")); });
  return _sorted.map(function(r) {
    var rKey = r.stock + "_" + r.date + "_" + (r.signal.id || r.signal.time || "");
    var rExp = !!recExp[rKey];
    var s = r.signal, item = r.item;
    var a = _alphaOf(r), c = _cutOf(r);
    var realPnl = (item && item.pnl != null) ? Number(item.pnl) : (s.realizedPnl != null ? _elSignedVal(s.realizedPnl, s.realizedPnlSign) : null);
    var entered = _elIsEntered(s, item);
    var gReal = entered && realPnl != null ? _profitGradeFromPnlReal(realPnl, 1) : null;
    var _row = React.createElement("tr", { key: rKey + "_row", style: Object.assign({ background: rExp ? "#FFF7ED" : "transparent", cursor: "pointer" }, _elRowStyleWithColl(data, r, stock)),
      onClick: function() { setRecExp(function(p) { var n = Object.assign({}, p); if (n[rKey]) delete n[rKey]; else n[rKey] = true; return n; }); } },
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: _bb, color: "#F97316", width: "1%" } }, rExp ? "▼" : "▶"),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontWeight: 700, fontSize: 10, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap", color: "#9A3412" } },
        React.createElement("div", null, (r.date || "").slice(5)), _simInput(r, true), _simInput(r, false)),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 10, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap", color: "#666" } },
        React.createElement("div", null, s.time || "—", _minBarBadge(s)), _epIncompleteMark(s), _elCollMarkNode(data, r, stock), _elFillRiskNode(r),
        _elIsExcluded(s) ? React.createElement("div", { style: { marginTop: 1 } }, _elNotInclBadge(null, s)) : null),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: _bb, borderRight: _bb, color: "#555", minWidth: 60 } },
        _elSigCell(s, "center")),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb, width: "1%", background: _elSpecialUsed(s) ? "#FEF3C7" : null } },
        _elAlphaTypeCell(s, a)),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb, width: "1%" } },
        _elCutValNode(c)),
      _elLineCell(s, a, c, _bb),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap", borderBottom: _bb, borderRight: _bb, width: "1%" } }, _epECell(s, a)),
      React.createElement("td", { style: { padding: "1px 4px", textAlign: "center", fontSize: 10, borderBottom: _bb, borderRight: _bb, whiteSpace: "nowrap", width: "1%" } },
        entered ? React.createElement("span", { style: { color: "#2E7D32", fontWeight: 700, fontSize: 14 } }, "〇") : React.createElement("span", { style: { color: "#999", fontWeight: 700, fontSize: 14 } }, "×")),
      _elPnlDetailCells(s, a, c, _bb, "1px 3px", "1px 5px"),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderBottom: _bb, whiteSpace: "nowrap" } },
        _elLane(_tradeAlphaChip(s), 26, "flex-end"), _elRPnlDispW(realPnl, gReal, 72))
    );
    if (!rExp) return _row;
    return React.createElement(React.Fragment, { key: rKey + "_f" }, _row,
      React.createElement("tr", { key: rKey + "_d" }, React.createElement("td", { colSpan: 14, style: { padding: "0 0 4px 0", borderBottom: "1px solid #e0ddd6" } },
        React.createElement(EntryLogCard, { record: r, alpha: a, cutLine: c, onEdit: function(rec) { _wSetEdit(rec); } }))));
  });
  };
  var _amtCell = function(v, cnt, ref, refCnt, isReal, allMiss, days) {
    refCnt = refCnt || 0;
    if (cnt === 0) return (refCnt > 0) ? _elHold2RefSuffix(0, ref, refCnt) : (allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—"));
    var g = isReal ? _profitGradeFromPnlReal((days && days > 0) ? Math.round((v || 0) / days) : (v || 0), cnt) : _profitGradeFromPnl((days && days > 0) ? Math.round((v || 0) / days) : (v || 0), cnt);
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, g ? _elGradeBadge18(g) : null, React.createElement("span", { style: { fontWeight: 700, color: _elPnlColor(v) } }, _elPnlFmt(v)), refCnt > 0 ? _elHold2RefSuffix(v, ref, refCnt) : null);
  };
  var _lblTot = function(t) { return React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: "#9A3412", marginBottom: 1, lineHeight: 1.1 } }, t); };
  // 明細テーブルのフッター合計行（list 単位）
  var _detailTotRowFor = function(_list) {
    // 合計額算入: フッター合計は除外記録を抜く（明細行 _detailRowsFor は全件のまま表示）2026-06-18
    _list = (_list || []).filter(function(r) { return _elInclTotal(r.signal); });
    var _t = _elTotAccum(_list, { signal: function(r) { return r.signal; }, alpha: _alphaOf, cut: _cutOf, excluded: function(r) { return _elCollExcluded(data, r, stock); }, real: function(r) { if (!_elIsEntered(r.signal, r.item)) return null; var it = r.item; return (it && it.pnl != null) ? Number(it.pnl) : _elSignedVal(r.signal.realizedPnl, r.signal.realizedPnlSign); } });
    var _allMiss = _elAllMissRow(_list, _alphaOf, _cutOf);
    var _listM = _list.filter(function(r) { return !_elCollExcluded(data, r, stock); });   // 時間かぶり除外後＝OS・損益詳細(EP/H1/H2)の集計は姉妹の最新式サマリーと同じ_recsM方式 2026-07-13
    var _totDays = _elBizDaysOf(_listM, data);
    return React.createElement("tr", { key: "wpp_tot", style: { background: "#FFF7ED" } },
      React.createElement("td", { colSpan: 9, style: { padding: "1px 6px", textAlign: "left", fontWeight: 700, fontSize: 11, borderTop: "2px solid #FB923C", color: "#555", whiteSpace: "nowrap" } }, "合計"),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap", background: "#FFFBF0" } }, _lblTot("最終損益"), _amtCell(_t.hold2, _t.hold2Cnt, _t.hold2Ref, _t.hold2RefCnt, false, _allMiss, _totDays)),
      React.createElement("td", { colSpan: 2, style: { padding: "1px 5px", textAlign: "left", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap", background: "#F8FBFE" } }, _elDetailPnlStackNode(_listM, _alphaOf, _cutOf, _elGradeBadge18, _allMiss, _totDays)),
      React.createElement("td", { style: { borderTop: "2px solid #FB923C" } }),
      React.createElement("td", { style: { padding: "1px 3px", textAlign: "center", fontSize: 11, borderTop: "2px solid #FB923C", whiteSpace: "nowrap" } }, _lblTot("実現損益"), _amtCell(_t.real, _t.realCnt, null, 0, true, _allMiss, _totDays))
    );
  };
  // 明細テーブル全体（list 単位。サマリー行の展開時に表示）
  var _detailTableFor = function(_list) {
    return React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: { borderCollapse: "collapse", width: "auto", fontSize: 10 } },
        React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
          _rTh("", { width: 20 }), _rTh("日付", { width: 52 }), _rTh("時間", { width: 44 }), _rTh("シグナル", { width: 1, whiteSpace: "nowrap" }),
          _rTh("α値", { width: 32 }), _rTh("損切り", { width: 34 }), _rTh("ライン", { width: 1 }), _rTh("E", { width: 26 }), _rTh("取引", { width: 26 }),
          _rTh("最終損益・詳細", { width: 84 }),
          React.createElement("th", { colSpan: 2, style: { padding: "4px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", whiteSpace: "nowrap", textAlign: "center", fontSize: 10, color: "#9A3412" } }, "OS・損益詳細"),
          _rTh(React.createElement("span", { title: "EP足〜手じまい足の保有時間（1分足換算・時間かぶり判定と同基準）" }, "保有"), { width: 30 }),
          _rTh("実現損益", { width: 82 }))),
        React.createElement("tbody", null, _detailRowsFor(_list)),
        React.createElement("tfoot", null, _detailTotRowFor(_list))
      )
    );
  };
  // ===== 日別サマリー（取引テーブルの今週欄と同形：曜日ごとに折りたたみ）=====
  var _DOWJP = ["日", "月", "火", "水", "木", "金", "土"];
  var _byDay = {};
  _wkDates.forEach(function(wd) { _byDay[wd] = []; });
  _recs.forEach(function(r) { if (_byDay[r.date]) _byDay[r.date].push(r); });
  var _wkBadge = function(g) { var gs = _GRADE_STYLE[g] || _GRADE_STYLE.Z; return React.createElement("span", { title: g, style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: gs.bg, color: gs.color, border: "1.5px solid " + gs.border, fontWeight: 800, fontSize: 10, marginRight: 3, flexShrink: 0 } }, g); };
  var _wkAmt = function(v) { return React.createElement("span", { style: { fontWeight: 700, color: v > 0 ? "#C0392B" : v < 0 ? "#1E8449" : "#888", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } }, (v > 0 ? "+" : "") + (v || 0).toLocaleString() + "円"); };
  var _wkPnlCell = function(grade, sum) {
    if (!grade || grade === "Z" || sum == null) return React.createElement("span", { style: { color: "#ccc" } }, "—");
    return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _wkBadge(grade), _wkAmt(sum));
  };
  var _wkTh = function(label, extra) { return React.createElement("th", { style: Object.assign({ padding: "4px 3px", fontWeight: 700, borderBottom: "2px solid #ddd", textAlign: "center", fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap", color: "#555" }, extra || {}) }, label); };
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
      var c = _charts[ck] || {};
      [].concat(c.chartShapeTags || [], c.stockTags || []).forEach(function(t) {
        var st = stripCat(t);
        if (st && !seen[st]) { seen[st] = 1; out.push(st); }
      });
    });
    return out.slice(0, 6);
  };
  var _sumRow = function(label, labelColor, recs, isTotal, rowKey) {
    // 合計額算入: 除外記録(includeInTotal===false)はサマリ集計から外す。明細展開(_expRowFor→_detailTableFor)は全件のまま。2026-06-18
    var _exclN = (recs || []).filter(function(r) { return _elIsExcluded(r.signal); }).length;
    recs = (recs || []).filter(function(r) { return _elInclTotal(r.signal); });
    var st = _elCalcStats(recs, data);
    // 時間かぶり除外: 金額集計(EP/H1/H2/実現)は_recsM＝被り除外後・件数系(st/件/到達等)はrecsのまま。銘柄別ビュー＝同一銘柄内のみ 2026-07-08
    var _recsM = recs.filter(function(r) { return !_elCollExcluded(data, r, stock); });   // 金額集計母数＝時間かぶり除外のみ（2026-07-18g 要審議も算入＝見送りと同じ・_elIsReview除外を撤回）
    var _stM = _recsM.length === recs.length ? st : _elCalcStats(_recsM, data);
    var _rowDays = _elBizDaysOf(_recsM, data);
    var _ent = _wkEntCnt(recs);
    var _osv = _wkAvgOs(recs);
    var _isExp = !!dayExp[rowKey];
    var _allMiss = _elAllMissRow(recs, _alphaOf, _cutOf);
    var _allExcl = recs.length === 0 && _exclN > 0;  // 取引はあるが全部不算入
    var bb = isTotal ? "2px solid #ddd" : "1px solid #e0ddd6";
    var bt = isTotal ? "2px solid #ccc" : "none";
    var br = "1px solid #e0ddd6";
    var _td = function(child, extra) { return React.createElement("td", { style: Object.assign({ padding: "3px 4px", textAlign: "center", fontSize: 10, borderBottom: bb, borderTop: bt, borderRight: br, whiteSpace: "nowrap" }, extra || {}) }, child); };
    return React.createElement("tr", {
      key: rowKey,
      style: Object.assign({ background: _isExp ? "#FFF7ED" : (isTotal ? "#F5F0E8" : "transparent"), cursor: "pointer" }, _allExcl ? { background: "#EFF8FF", borderLeft: "3px solid #38BDF8", opacity: 0.72 } : null),
      onClick: function() { setDayExp(function(prev) { var n = Object.assign({}, prev); if (n[rowKey]) delete n[rowKey]; else n[rowKey] = true; return n; }); }
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
        if (_allExcl) return _elNotInclBadge();
        if (!recs || recs.length === 0) return React.createElement("span", { style: { color: "#ccc" } }, "—");
        var _h2Tot = null, _h2Cnt = 0, _h2Ref = null, _h2RefCnt = 0;
        _recsM.forEach(function(r) {
          var s = r.signal;
          var _aR = _alphaOf(r); var _cutLR = _cutOf(r);
          var _h2p = _elHold2TotParts(s, _aR, _cutLR);
          if (_h2p.main != null) { _h2Tot = (_h2Tot || 0) + _h2p.main; _h2Cnt++; }
          if (_h2p.ref != null) { _h2Ref = (_h2Ref || 0) + _h2p.ref; _h2RefCnt++; }
        });
        if (_h2Cnt === 0 && _h2RefCnt === 0) return _allMiss ? _qZeroCell() : React.createElement("span", { style: { color: "#ccc" } }, "—");
        return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" } },
          _h2Cnt > 0 ? (function() { var _h2g = _profitGradeFromPnl(_rowDays > 0 ? Math.round(_h2Tot / _rowDays) : _h2Tot, _h2Cnt); return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" } }, _h2g ? _wkBadge(_h2g) : null, React.createElement("span", { style: { fontWeight: 700, color: _h2Tot > 0 ? "#C0392B" : _h2Tot < 0 ? "#1E8449" : "#888" } }, (_h2Tot > 0 ? "+" : "") + _h2Tot.toLocaleString() + "円")); })() : (_h2RefCnt > 0 ? React.createElement("span", { style: { color: "#ccc" } }, "—") : null),
          _elHold2RefSuffix(_h2Tot, _h2Ref, _h2RefCnt));
      })()),
      _td(_allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _elDetailPnlStackNode(_recsM, _alphaOf, _cutOf, _wkBadge, _allMiss, _rowDays)),
      _td(_allExcl ? React.createElement("span", { style: { color: "#ccc" } }, "—") : _wkPnlCell(_profitGradeFromPnlReal(_rowDays > 0 ? Math.round(_stM.sumPnl / _rowDays) : _stM.sumPnl, (_ent > 0 && _stM.sumPnl !== 0) ? _ent : 0), _ent > 0 ? _stM.sumPnl : null)),
      React.createElement("td", { style: { padding: "4px 6px", borderBottom: bb, borderTop: bt } },
        (function() { var tg = _wkTags(recs); return tg.length ? React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 2 } }, tg.map(function(t, i) { return React.createElement("span", { key: i, style: { display: "inline-block", padding: "1px 5px", fontSize: 9, fontWeight: 600, background: "#FFEDD5", color: "#9A3412", borderRadius: 3, border: "1px solid #FB923C", whiteSpace: "nowrap" } }, stripCat(t)); })) : null; })())
    );
  };
  var _idealEl = _recs.length ? React.createElement("div", { style: { marginTop: 8, marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BAE6FD" } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 4 } }, "α 推奨基本α値（5〜20円・週間）"),
    React.createElement("div", { style: { fontSize: 9, color: "#64748B", marginBottom: 6 } }, "今週(月〜金)の全記録に同じαを当てて、件数フロア（最も件数の多いαの半分以上）かつ到達率50%以上かつ想定損益がプラスのαから 損切り率(EP〜H1)の低さ×0.7＋H1勝率×0.3 の合成スコアが最大のα（薄い高α・約定しにくい高α・赤字αは除外・データ不足時は件数最大を参考表示）。応用α目安＝応用〇局面で採用する独立α値（応用〇の記録から算出）。"),
    _elBaseAlphaTableV2([{ label: stock, recs: _recs.filter(function(r) { return _elInclData(r.signal); }) }], _cutOf)) : null;   // 推奨基本α表＝分析母数（データ算入）2026-07-22f
  var _simAlphaCnt = Object.keys(simAlpha).filter(function(k) { return simAlpha[k] != null && simAlpha[k] !== ""; }).length;
  var _simCutCnt = Object.keys(simCut).filter(function(k) { return simCut[k] != null && simCut[k] !== ""; }).length;
  var _simActive = _simAlphaCnt + _simCutCnt;
  var _simControlsBar = null && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "2px 2px 6px", flexWrap: "wrap" } },
    _simActive > 0 ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#0369A1" } }, "シミュ中: α " + _simAlphaCnt + "件 / 損切り " + _simCutCnt + "件") : React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#94A3B8" } }, "α値・損切り値シミュ：行の数値を変えると再計算（非保存）"),
    React.createElement("button", { onClick: function() { var ba = _elBaseAlphaPick(_recs, function(r) { return { cutLine: _cutOf(r) }; }); if (!ba || ba.alpha == null) return; var v = String(ba.alpha); var m = {}; _recs.forEach(function(r) { m[_key(r)] = v; }); setSimAlpha(m); }, style: { fontSize: 10, fontWeight: 700, padding: "2px 8px", border: "1px solid #0369A1", borderRadius: 4, background: "#E0F2FE", color: "#0369A1", cursor: "pointer", whiteSpace: "nowrap" } }, "一括 推奨基本α"),
    _simActive > 0 ? React.createElement("button", { onClick: function() { setSimAlpha({}); setSimCut({}); }, style: { fontSize: 10, padding: "2px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#f5f4f0", color: "#555", cursor: "pointer", fontWeight: 600 } }, "↺ 全解除") : null);
  // サマリー行を展開したときに出る明細（週合計は理想α＋シミュ操作＋週全体の明細、日別はその日の明細）
  var _expRowFor = function(recs, rowKey, isTotal) {
    return React.createElement("tr", { key: rowKey + "_exp" },
      React.createElement("td", { colSpan: 13, style: { padding: "6px 8px", background: "#FFFBF5", borderBottom: "2px solid #FB923C" } },
        isTotal ? _idealEl : null,
        isTotal ? _simControlsBar : null,
        recs.length ? React.createElement("div", { style: { margin: "2px 4px 8px 18px", border: "1px solid #FDBA74", borderRadius: 8, background: "#fff", padding: "6px 8px", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, _detailTableFor(recs)) : React.createElement("span", { style: { color: "#aaa", fontSize: 11 } }, "記録なし")));
  };
  return React.createElement("div", { style: { marginTop: 12, background: "#fff", border: "1px solid #e8e5df", borderRadius: 8, padding: "10px 12px" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" } },
      _navBtn("←", function() { setWeekOffset(function(o) { return o - 1; }); }),
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#333", display: "flex", alignItems: "center", flexWrap: "wrap" } }, "📅 今週の損益データ（" + stock + "）"),
      _navBtn("→", function() { setWeekOffset(function(o) { return o + 1; }); }),
      weekOffset !== 0 ? React.createElement("button", { onClick: function() { setWeekOffset(0); }, style: { padding: "2px 8px", fontSize: 11, fontWeight: 600, background: "#FFEDD5", border: "1px solid #FB923C", borderRadius: 6, cursor: "pointer", color: "#9A3412" } }, "今週へ") : null,
      React.createElement("span", { style: { fontSize: 10, color: "#94A3B8" } }, _wkDates[0].slice(5) + "〜" + _wkDates[4].slice(5)),
      (function(){ var _cc = _elCollExclCountRecs(data, _recs, stock); return _cc > 0 ? React.createElement("span", { title: "時間かぶりで合計から除外した記録の件数（この銘柄内で同日5分以内ペアの遅い方／同時刻なら損益が大きい方・件数系には残る）", style: { fontSize: 10, fontWeight: 700, color: "#6D28D9", background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" } }, "被り除外 " + _cc + "件") : null; })()),
    _recs.length === 0 ? React.createElement("div", { style: { color: "#aaa", fontSize: 12, padding: "8px 0" } }, "今週この銘柄の記録はありません") :
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 10 } },
        React.createElement("thead", null,
          React.createElement("tr", { style: { background: "#f5f4f0" } },
            _wkTh("曜日", { textAlign: "left" }), _wkTh("件"),
            _wkTh(React.createElement("span", { style: { color: "#374151" } }, "到達")), _wkTh(React.createElement("span", { style: { color: "#1E8449" } }, "利確")), _wkTh(React.createElement("span", { style: { color: "#D97706" }, title: "最終損益が±0（トントン）" }, "△")), _wkTh(React.createElement("span", { style: { color: "#DC2626" } }, "確定損")), _wkTh(React.createElement("span", { style: { color: "#7F1D1D" } }, "損切り")), _wkTh(React.createElement("span", { style: { color: "#6B7280" } }, "未達")), _wkTh(React.createElement("span", { style: { color: "#0284C7" }, title: "不算入＋スルー（集計に算入しない記録）" }, "除外")),
            _wkTh(React.createElement("span", { title: "○が途切れた所（×/△/損切り）で手じまいした最終PnL＝（）外。（）内=△も保有し続けた場合。旧H２結果損益と同一基準" }, "最終損益")), _wkTh(React.createElement("span", { title: "EP損益（○のみ）／H1損益／H2損益を縦積み。H２＝最終損益と同値" }, "詳細損益")), _wkTh("実現損益"), _wkTh("タグ", { textAlign: "left" }))),
        React.createElement("tbody", null,
          [
            _sumRow("週合計", "#555", _recs, true, "wk__total__"),
            !!dayExp["wk__total__"] ? _expRowFor(_recs, "wk__total__", true) : null
          ].concat(
            _wkDates.map(function(wd) {
              var _dobj = new Date(wd + "T00:00:00");
              var _lbl = React.createElement(React.Fragment, null, _DOWJP[_dobj.getDay()] + " " + wd.slice(5).replace("-", "/"), _wkHoli[wd] ? React.createElement("span", { title: "休場日（祝日・休場）", style: { marginLeft: 4, fontSize: 9, fontWeight: 700, color: "#7C3AED", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 3, padding: "0 3px", verticalAlign: "middle" } }, "休") : null);
              var _rk = "wk_" + wd;
              return [
                _sumRow(_lbl, null, _byDay[wd] || [], false, _rk),
                !!dayExp[_rk] ? _expRowFor(_byDay[wd] || [], _rk, false) : null
              ];
            })
          )
        )
      )
    ),
    _wEdit && React.createElement(EntryRecordForm, { data: data, save: save, initial: _wEdit, onClose: function() { _wSetEdit(null); } })
  );
}

// テクニカル名マスター管理（追加・削除・改名・並び替え）。custom.technicals を編集。2026-06-18
function TechnicalManageModal(_ref_tm) {
  var technicals = _ref_tm.technicals, onChange = _ref_tm.onChange, onClose = _ref_tm.onClose;
  var _uNew = useState(""), newName = _uNew[0], setNewName = _uNew[1];
  var _add = function() {
    var nm = (newName || "").trim(); if (!nm) return;
    if (technicals.some(function(t) { return t.name === nm; })) { window._snAlert("同じ名前があります"); return; }
    onChange(technicals.concat([{ id: _sigId(), name: nm }])); setNewName("");
  };
  var _rename = function(id, nm) {
    var v = (nm || "").trim(); if (!v) return;
    var _old = (technicals.filter(function(t) { return t.id === id; })[0] || {}).name;
    onChange(technicals.map(function(t) { return t.id === id ? Object.assign({}, t, { name: v }) : t; }));
    if (_ref_tm.onRename && _old && _old !== v) _ref_tm.onRename(_old, v);   // 過去の手動出現行(テクニカル)の名前も追従 2026-07-07g
  };
  var _del = function(id) { window._snConfirm("このテクニカルを削除しますか？（過去に記録した名前はそのまま残ります）").then(function(_ok){ if(_ok) onChange(technicals.filter(function(t) { return t.id !== id; })); }); };
  var _move = function(i, dir) { var j = i + dir; if (j < 0 || j >= technicals.length) return; var a = technicals.slice(); var t = a[i]; a[i] = a[j]; a[j] = t; onChange(a); };
  return React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 10001, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }, onClick: onClose },
    React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: "#fff", borderRadius: 12, padding: 18, maxWidth: 460, width: "100%", maxHeight: "85vh", overflowY: "auto" } },
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800, marginBottom: 10 } }, "テクニカル管理"),
      React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } },
        React.createElement("input", { type: "text", value: newName, onChange: function(e) { setNewName(e.target.value); }, placeholder: "テクニカル名を追加", style: { flex: 1, padding: "7px 9px", fontSize: 13, border: "1px solid #ccc", borderRadius: 6 } }),
        React.createElement("button", { onClick: _add, style: { padding: "7px 16px", fontSize: 13, fontWeight: 700, background: "#0369A1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" } }, "追加")),
      technicals.length ? technicals.map(function(t, i) {
        return React.createElement("div", { key: t.id, style: { display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: "1px solid #f0ede6" } },
          React.createElement("span", { onClick: function() { _move(i, -1); }, style: { cursor: "pointer", color: i === 0 ? "#ddd" : "#888", fontSize: 14, width: 18, textAlign: "center" } }, "▲"),
          React.createElement("span", { onClick: function() { _move(i, 1); }, style: { cursor: "pointer", color: i === technicals.length - 1 ? "#ddd" : "#888", fontSize: 14, width: 18, textAlign: "center" } }, "▼"),
          React.createElement("input", { type: "text", defaultValue: t.name, onBlur: function(e) { _rename(t.id, e.target.value); }, style: { flex: 1, padding: "5px 8px", fontSize: 13, border: "1px solid #e0ddd6", borderRadius: 6 } }),
          React.createElement("span", { onClick: function() { _del(t.id); }, style: { cursor: "pointer", color: "#C0392B", fontSize: 14, padding: "0 6px" } }, "🗑"));
      }) : React.createElement("div", { style: { fontSize: 12, color: "#bbb", padding: "8px 0" } }, "まだテクニカルがありません。"),
      React.createElement("button", { onClick: onClose, style: { marginTop: 14, padding: "8px 18px", fontSize: 13, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" } }, "閉じる")));
}

// 銘柄×日付の「出現シグナル・テクニカル」欄。取引記録のシグナル(自動)＋手動(テクニカル/未取引シグナル)。2026-06-18
function AppearanceSection(_ref_ap) {
  var data = _ref_ap.data, save = _ref_ap.save, stock = _ref_ap.stock, date = _ref_ap.date;
  var custom = data.custom || {};
  var technicals = custom.technicals || [];
  var signalPool = custom.signalTags || [];
  var rows = _apRowsForDay(data, stock, date);
  var _uOpen = useState(false), addOpen = _uOpen[0], setAddOpen = _uOpen[1];
  var _uKind = useState("tech"), aKind = _uKind[0], setAKind = _uKind[1];
  var _uName = useState(""), aName = _uName[0], setAName = _uName[1];
  var _uTime = useState(""), aTime = _uTime[0], setATime = _uTime[1];
  var _uMemo = useState(""), aMemo = _uMemo[0], setAMemo = _uMemo[1];
  var _uEdit = useState(null), editId = _uEdit[0], setEditId = _uEdit[1];
  var _uMan = useState(false), manageOpen = _uMan[0], setManageOpen = _uMan[1];
  var _uMek = useState(null), memoEditKey = _uMek[0], setMemoEditKey = _uMek[1];  // auto行(取引記録シグナル)の出現欄固有メモ インライン編集
  var _uMev = useState(""), memoEditVal = _uMev[0], setMemoEditVal = _uMev[1];
  var _reset = function() { setAddOpen(false); setEditId(null); setAName(""); setATime(""); setAMemo(""); setAKind("tech"); };
  var _openAdd = function() { setEditId(null); setAName(""); setATime(""); setAMemo(""); setAKind(technicals.length ? "tech" : "signal"); setAddOpen(true); };
  var _openEdit = function(r) { setEditId(r.id); setAKind(r.kind === "signal" ? "signal" : "tech"); setAName(r.name); setATime(r.time || ""); setAMemo(r.memo || ""); setAddOpen(true); };
  var _submit = function() {
    var nm = (aName || "").trim();
    if (!nm) { window._snAlert("シグナル・テクニカル名を選んでください"); return; }
    _apSave(save, stock, date, { id: editId || _sigId(), kind: aKind === "signal" ? "signal" : "tech", name: nm, time: (aTime || "").trim(), memo: (aMemo || "").trim() });
    _reset();
  };
  var _del = function(r) { window._snConfirm("この出現記録を削除しますか？").then(function(_ok){ if(_ok) _apDelete(save, stock, date, r.id); }); };
  var _setTechnicals = function(arr) { save(function(prev) { return Object.assign({}, prev, { custom: Object.assign({}, prev.custom || {}, { technicals: arr }) }); }); };
  var _kindChip = function(kind) {
    var isSig = kind === "signal";
    return React.createElement("span", { style: { display: "inline-block", fontSize: 9, fontWeight: 700, padding: "0 5px", borderRadius: 3, whiteSpace: "nowrap", color: isSig ? "#9A3412" : "#0369A1", background: isSig ? "#FFEDD5" : "#E0F2FE", border: "1px solid " + (isSig ? "#FB923C" : "#7DD3FC") } }, isSig ? "シグナル" : "テクニカル");
  };
  var _th = function(label, extra) { return React.createElement("th", { style: Object.assign({ padding: "3px 6px", fontWeight: 700, borderBottom: "2px solid #FB923C", textAlign: "left", fontSize: 10, color: "#9A3412", whiteSpace: "nowrap" }, extra || {}) }, label); };
  var _tdS = { padding: "3px 6px", fontSize: 11, borderBottom: "1px solid #f0ede6", verticalAlign: "top" };
  var _table = rows.length ? React.createElement("div", { style: { overflowX: "auto" } },
    React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontSize: 11 } },
      React.createElement("thead", null, React.createElement("tr", { style: { background: "#FFF7ED" } },
        _th("時間", { width: 64 }), _th("シグナル・テクニカル"), _th("メモ"), _th("", { width: 56, textAlign: "center" }))),
      React.createElement("tbody", null, rows.map(function(r) {
        return React.createElement("tr", { key: r.id, style: { background: r.src === "auto" ? "#FBFBF9" : "#fff" } },
          React.createElement("td", { style: Object.assign({}, _tdS, { whiteSpace: "nowrap", color: "#666", fontVariantNumeric: "tabular-nums" }) }, r.time || "—"),
          React.createElement("td", { style: _tdS },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" } },
              _kindChip(r.kind),
              React.createElement("span", { style: { fontWeight: 700, color: "#333" } }, r.name || "—"))),
          React.createElement("td", { style: Object.assign({}, _tdS, { color: "#555", whiteSpace: "pre-wrap", wordBreak: "break-all" }) },
            (r.src === "auto" && memoEditKey === r.memoKey)
              ? React.createElement("input", { type: "text", autoFocus: true, value: memoEditVal,
                  onChange: function(e) { setMemoEditVal(e.target.value); },
                  onBlur: function() { _apSetAutoMemo(save, stock, date, r.memoKey, (memoEditVal || "").trim()); setMemoEditKey(null); },
                  onKeyDown: function(e) { if (e.key === "Enter") e.target.blur(); },
                  style: { width: "100%", padding: "3px 6px", fontSize: 11, border: "1px solid #7DD3FC", borderRadius: 4, boxSizing: "border-box" } })
              : (r.memo ? stripHtml(r.memo) : React.createElement("span", { style: { color: "#ccc" } }, "—"))),
          React.createElement("td", { style: Object.assign({}, _tdS, { textAlign: "center", whiteSpace: "nowrap" }) },
            r.src === "manual"
              ? React.createElement("span", null,
                  React.createElement("span", { onClick: function() { _openEdit(r); }, style: { cursor: "pointer", color: "#0369A1", fontSize: 12, marginRight: 8 } }, "✎"),
                  React.createElement("span", { onClick: function() { _del(r); }, style: { cursor: "pointer", color: "#C0392B", fontSize: 12 } }, "🗑"))
              : React.createElement("span", { onClick: function() { setMemoEditKey(r.memoKey); setMemoEditVal(r.memo || ""); }, style: { cursor: "pointer", color: "#0369A1", fontSize: 12 }, title: "メモを編集" }, "✎")));
      })))
  ) : React.createElement("div", { style: { fontSize: 11, color: "#bbb", padding: "6px 2px" } }, "まだ記録がありません。「＋追加」から記録できます。");
  // シグナルは取引記録の自動行と名寄せするため stripCat（カテゴリ接頭辞除去）で統一・重複排除。テクニカルはそのまま。2026-06-18
  var _nameOptions = (function() {
    if (aKind !== "signal") return technicals.map(function(t) { return t.name; });
    var seen = {}, out = [];
    signalPool.forEach(function(t) { var n = stripCat(t); if (n && !seen[n]) { seen[n] = 1; out.push(n); } });
    return out;
  })();
  var _form = addOpen ? React.createElement("div", { style: { marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#F8FAFC", border: "1px solid #CBD5E1" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 } },
      ["tech", "signal"].map(function(k) {
        var on = aKind === k;
        return React.createElement("span", { key: k, onClick: function() { setAKind(k); setAName(""); }, style: { cursor: "pointer", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, border: "1px solid " + (on ? "#1a1a1a" : "#ddd"), background: on ? "#1a1a1a" : "#fff", color: on ? "#fff" : "#666" } }, k === "tech" ? "テクニカル" : "シグナル");
      }),
      aKind === "tech" ? React.createElement("span", { onClick: function() { setManageOpen(true); }, style: { cursor: "pointer", fontSize: 11, color: "#0369A1", fontWeight: 700, marginLeft: "auto" } }, "⚙ テクニカル管理") : null),
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
      React.createElement("select", { value: aName, onChange: function(e) { setAName(e.target.value); }, style: { padding: "5px 7px", fontSize: 12, border: "1px solid #ccc", borderRadius: 6, minWidth: 150 } },
        React.createElement("option", { value: "" }, _nameOptions.length ? "選択…" : (aKind === "tech" ? "テクニカル未登録（⚙で追加）" : "シグナル未登録")),
        _nameOptions.map(function(nm) { return React.createElement("option", { key: nm, value: nm }, nm); })),
      React.createElement("input", { type: "text", inputMode: "numeric", value: aTime, onChange: function(e) { setATime(e.target.value); }, placeholder: "9:35", style: { width: 64, padding: "5px 7px", fontSize: 12, border: "1px solid #ccc", borderRadius: 6 } }),
      React.createElement("input", { type: "text", value: aMemo, onChange: function(e) { setAMemo(e.target.value); }, placeholder: "メモ", style: { flex: 1, minWidth: 120, padding: "5px 7px", fontSize: 12, border: "1px solid #ccc", borderRadius: 6 } })),
    React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } },
      React.createElement("button", { onClick: _submit, style: { padding: "6px 16px", fontSize: 12, fontWeight: 700, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" } }, editId ? "更新" : "追加"),
      React.createElement("button", { onClick: _reset, style: { padding: "6px 14px", fontSize: 12, fontWeight: 600, background: "#f5f4f0", color: "#555", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" } }, "キャンセル"))
  ) : null;
  var _manageModal = manageOpen ? React.createElement(TechnicalManageModal, { technicals: technicals, onChange: _setTechnicals, onClose: function() { setManageOpen(false); },
    // テクニカル改名の全域追従（2026-07-07g）: 全銘柄・全日付の手動出現行(kind=tech)の名前を新名へ書き換え＝出現欄の履歴が割れない
    onRename: function(oldNm, newNm) {
      save(function(prev) {
        var charts = prev.charts || {}, nCharts = {}, any = false;
        Object.keys(charts).forEach(function(ck) {
          var c = charts[ck];
          if (c && Array.isArray(c.appearances) && c.appearances.some(function(ap) { return ap && ap.kind !== "signal" && ap.name === oldNm; })) {
            any = true;
            nCharts[ck] = Object.assign({}, c, { appearances: c.appearances.map(function(ap) { return (ap && ap.kind !== "signal" && ap.name === oldNm) ? Object.assign({}, ap, { name: newNm }) : ap; }) });
          } else nCharts[ck] = c;
        });
        return any ? Object.assign({}, prev, { charts: nCharts }) : prev;
      });
    } }) : null;
  return React.createElement("div", { style: { marginTop: 12 } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } },
      React.createElement("div", { style: { fontSize: 13, color: "#888", fontWeight: 600 } }, "📡 出現シグナル・テクニカル"),
      React.createElement("button", { onClick: _openAdd, style: { padding: "3px 12px", fontSize: 12, fontWeight: 700, background: "#0369A1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" } }, "＋追加")),
    _table, _form, _manageModal);
}
var ChartSection = React.memo(function ChartSection(_ref32) {
  var stock = _ref32.stock,
    date = _ref32.date,
    data = _ref32.data,
    save = _ref32.save,
    custom = _ref32.custom,
    cfg = _ref32.cfg,
    onSelectDate = _ref32.onSelectDate,
    onJumpToNews = _ref32.onJumpToNews,
    onOpenEntryLog = _ref32.onOpenEntryLog,
    hideSignals = _ref32.hideSignals;
  var ck = stock + "_" + date;
  var cd = data.charts[ck] || {
    macroLocal: "",
    stockTags: [],
    flowCodes: [],
    signals: [],
    chartImg: null,
    chartImgs: [],
    chartMemo: {
      text: "",
      images: []
    }
  };
  var _useState97 = useState(false),
    _useState98 = _slicedToArray(_useState97, 2),
    analyzing = _useState98[0],
    setAnalyzing = _useState98[1],
    _useState99 = useState(false),
    _useState100 = _slicedToArray(_useState99, 2),
    aiDone = _useState100[0],
    setAiDone = _useState100[1],
    _useState101 = useState(null),
    _useState102 = _slicedToArray(_useState101, 2),
    viewer = _useState102[0],
    setViewer = _useState102[1],
    _useState103 = useState(false),
    _useState104 = _slicedToArray(_useState103, 2),
    annotating = _useState104[0],
    setAnnotating = _useState104[1];
  
  var _useStateDA = useState(null),
    _useStateDAS = _slicedToArray(_useStateDA, 2),
    directAnnot = _useStateDAS[0],
    setDirectAnnot = _useStateDAS[1];
  
  useModalBack(viewer != null, function(){ setViewer(null); }, "chart-viewer");
  useModalBack(annotating, function(){ setAnnotating(false); }, "chart-annot");
  useModalBack(directAnnot != null, function(){ setDirectAnnot(null); }, "chart-direct-annot");
  var upd = function upd(k, v) {
    return save(function(prevData) {
      var prevCd = (prevData.charts || {})[ck] || {};
      return _objectSpread(_objectSpread({}, prevData), {}, {
        charts: _objectSpread(_objectSpread({}, prevData.charts || {}), {}, _defineProperty({}, ck, _objectSpread(_objectSpread({}, prevCd), {}, _defineProperty({}, k, v))))
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
  
  var _uSim = useState(null), _uSimS = _slicedToArray(_uSim, 2),
    simDraftId = _uSimS[0], setSimDraftId = _uSimS[1];
  var runSimilarSearch = function runSimilarSearch(draftId) {
    if (!cfg || !cfg.fbUrl) { window._snAlert("Firebase未設定のため検索できません。"); return; }
    var info = _caGetStockInfo(stock, custom);
    if (!info.caTicker && !info.code) {
      window._snAlert("この銘柄は分析ツールと未対応です。設定の「チャート分析ツール連携」で銘柄コードを設定してください。");
      return;
    }
    if (draftId) { setSimDraftId(draftId); return; }
    
    _caFetchMeta(cfg, false).then(function(allMeta) {
      var todayList = _caFilterByStockDate(allMeta, info.caTicker, date, info.code);
      if (!todayList.length) {
        window._snAlert("この日のチャート分析データが見つかりません。先にチャート分析ツールで作成してください。");
        return;
      }
      var top = todayList[0];
      var did = top.id || (top._raw && (top._raw.draftId || top._raw.id));
      if (!did) { window._snAlert("draftIdを解決できませんでした。"); return; }
      setSimDraftId(did);
    }).catch(function(e) {
      console.warn("[similar] fetch meta failed:", e);
      window._snAlert("チャート分析データ一覧の取得に失敗しました: " + (e.message || e));
    });
  };
  useModalBack(simDraftId != null, function(){ setSimDraftId(null); }, "sim-search-wrap");
  
  var _uPat = useState(false), _uPatS = _slicedToArray(_uPat, 2),
    patOpen = _uPatS[0], setPatOpen = _uPatS[1];
  useModalBack(patOpen, function(){ setPatOpen(false); }, "pat-search-wrap");
  
  
  
  var _uMacroAuto = useState({ pct: null, busy: false, error: null });
  var macroAuto = _uMacroAuto[0], setMacroAuto = _uMacroAuto[1];
  var runMacroAutoDetect = function(forceOverride) {
    if (!cfg || !cfg.fbUrl) return;
    if (stock === "日経平均株価") return;
    var info = _caGetStockInfo(stock, custom);
    if (!info.caTicker && !info.code) return;
    
    
    var _todayJST = (function() {
      var d = new Date();
      var jst = new Date(d.getTime() + (9 * 60 + d.getTimezoneOffset()) * 60000);
      return jst.getFullYear() + "-" + String(jst.getMonth() + 1).padStart(2, "0") + "-" + String(jst.getDate()).padStart(2, "0");
    })();
    if (!forceOverride && date < _todayJST
        && cd && typeof cd.prevDayPct === "number"
        && typeof cd.dayClose === "number") {
      setMacroAuto({ pct: cd.prevDayPct, busy: false, error: null,
        curDate: date, curClose: cd.dayClose });
      return;
    }
    setMacroAuto({ pct: null, busy: true, error: null });
    _macroLocalDetectFromCa(cfg, stock, date, custom).then(function(r) {
      if (!r) { setMacroAuto({ pct: null, busy: false, error: "no-data" }); return; }
      if (r.reason) { setMacroAuto({ pct: null, busy: false, error: r.reason, curDate: r.curDate, prevDate: r.prevDate, businessDays: r.businessDays }); return; }
      setMacroAuto({ pct: r.pct, busy: false, error: null, curDate: r.curDate, prevDate: r.prevDate, curClose: r.curClose, prevClose: r.prevClose });
      
      if (r.pct != null) upd("prevDayPct", r.pct);
      if (r.curClose != null) upd("dayClose", r.curClose);
      if (r.tag && (forceOverride || !cd.macroLocal)) {
        upd("macroLocal", r.tag);
      }
    });
  };
  
  
  useEffect(function() {
    runMacroAutoDetect(false);
    
  }, [stock, date, cfg && cfg.fbUrl]);
  var handleChartImage = function () {
    var _ref33 = _asyncToGenerator(_regenerator().m(function _callee2(img) {
      var newCd, result, u;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            save(function(prevData) {
              var prevCd = (prevData.charts || {})[ck] || {};
              newCd = _objectSpread(_objectSpread({}, prevCd), {}, {
                chartImgs: [].concat(_toConsumableArray(prevCd.chartImgs && prevCd.chartImgs.length ? prevCd.chartImgs :
                prevCd.chartImg ? [prevCd.chartImg] : []), [img]),
              chartImg: img
              });
              return _objectSpread(_objectSpread({}, prevData), {}, {
                charts: _objectSpread(_objectSpread({}, prevData.charts || {}), {}, _defineProperty({}, ck, newCd))
              });
            });
            if (!(!cfg || !cfg.claudeKey)) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            setAnalyzing(true);
            setAiDone(false);
            _context2.n = 2;
            return analyzeChart(cfg, img.base64, img.mt);
          case 2:
            result = _context2.v;
            if (result) {
              save(function(prevData2) {
                var prevCd2 = (prevData2.charts || {})[ck] || {};
                u = _objectSpread({}, prevCd2);
                if (result.moveTags && result.moveTags.length) u.flowCodes = result.moveTags;
                if (result.macroLocal) u.macroLocal = result.macroLocal;
                if (result.memo) u.chartMemo = _objectSpread(_objectSpread({}, prevCd2.chartMemo || {
                  text: "",
                  images: []
                }), {}, {
                  text: result.memo
                });
                return _objectSpread(_objectSpread({}, prevData2), {}, {
                  charts: _objectSpread(_objectSpread({}, prevData2.charts || {}), {}, _defineProperty({}, ck, u))
                });
              });
              setAiDone(true);
            }
            setAnalyzing(false);
          case 3:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return function handleChartImage(_x9) {
      return _ref33.apply(this, arguments);
    };
  }();
  var chartImgs = cd.chartImgs && cd.chartImgs.length ? cd.chartImgs :
    cd.chartImg ? [cd.chartImg] : [];
var chartSrc = chartImgs.length ? imgSrc(chartImgs[0]) : null;
  
  
  var togSTag = function togSTag(tag) {
    var c = cd.chartShapeTags || [];
    upd("chartShapeTags", c.includes(tag) ? c.filter(function (x) {
      return x !== tag;
    }) : [].concat(_toConsumableArray(c), [tag]));
  };
  var onAddSTag = function onAddSTag(name, cat) {
    var tag = cat ? cat + ":" + name : "カスタム:" + name;
    var cur = custom.chartShapeCats || {};
    var nc = custom;
    if (cat) {
      if (!(cur[cat] || []).includes(name)) nc = _objectSpread(_objectSpread({}, custom), {}, {
        chartShapeCats: _objectSpread(_objectSpread({}, cur), {}, _defineProperty({}, cat, [].concat(_toConsumableArray(cur[cat] || []), [name])))
      });
    } else {
      if (!(custom.chartShapeTags || []).includes(tag)) nc = _objectSpread(_objectSpread({}, custom), {}, {
        chartShapeTags: [].concat(_toConsumableArray(custom.chartShapeTags || []), [tag])
      });
    }
    var c = cd.chartShapeTags || [];
    if (!c.includes(tag)) save(function(prevData) {
      var prevCd = (prevData.charts && prevData.charts[ck]) || {};
      var prevC = prevCd.chartShapeTags || [];
      var nextTags = prevC.includes(tag) ? prevC : [].concat(_toConsumableArray(prevC), [tag]);
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: nc,
        charts: _objectSpread(_objectSpread({}, prevData.charts), {}, _defineProperty({}, ck, _objectSpread(_objectSpread({}, prevCd), {}, {
          chartShapeTags: nextTags
        })))
      });
    });else if (nc !== custom) updCustom(nc);
  };
  var pool = makeShapeTagPoolHandlers(data, save, custom);
  var macroLabels = stock === "日経平均株価" ? MACRO_LABELS : MACRO_LABELS_STOCK;
  
  var _useStateRN = useState(true), _useStateRNS = _slicedToArray(_useStateRN, 2),
    relNewsOpen = _useStateRNS[0], setRelNewsOpen = _useStateRNS[1];
  
  
  var relNewsScrollRef = useRef(null);
  var _useStateRNF = useState(false), _useStateRNFS = _slicedToArray(_useStateRNF, 2),
    relNewsFocused = _useStateRNFS[0], setRelNewsFocused = _useStateRNFS[1];
  var relNewsFocusedRef = useRef(false);
  useEffect(function() { relNewsFocusedRef.current = relNewsFocused; }, [relNewsFocused]);
  useEffect(function() {
    if (!relNewsFocused) return;
    var onDocMD = function(e) {
      var w = relNewsScrollRef.current;
      if (w && e.target && w.contains(e.target)) return;
      setRelNewsFocused(false);
    };
    var onKey = function(e) { if (e.key === "Escape") setRelNewsFocused(false); };
    document.addEventListener("mousedown", onDocMD);
    document.addEventListener("touchstart", onDocMD);
    document.addEventListener("keydown", onKey);
    return function() {
      document.removeEventListener("mousedown", onDocMD);
      document.removeEventListener("touchstart", onDocMD);
      document.removeEventListener("keydown", onKey);
    };
  }, [relNewsFocused]);
  
  var _useStateSCP = useState(false), _useStateSCPS = _slicedToArray(_useStateSCP, 2),
    scPickerOpen = _useStateSCPS[0], setScPickerOpen = _useStateSCPS[1];
  var _useStatePC = useState(""), _useStatePCS = _slicedToArray(_useStatePC, 2),
    pickerCat = _useStatePCS[0], setPickerCat = _useStatePCS[1];
  var _useStatePSC = useState(""), _useStatePSCS = _slicedToArray(_useStatePSC, 2),
    pickerSubCat = _useStatePSCS[0], setPickerSubCat = _useStatePSCS[1];
  useModalBack(scPickerOpen, function(){ setScPickerOpen(false); }, "stock-subcat-picker");
  
  var stockSubCatRefs = (custom.stockSubCatRefs && Array.isArray(custom.stockSubCatRefs[stock])) ? custom.stockSubCatRefs[stock] : [];
  var addStockSubCatRef = function(cat, subCat) {
    if (!cat || !subCat || stock === "日経平均株価") return;
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var prevRefs = prevCustom.stockSubCatRefs || {};
      var cur = (prevRefs[stock] || []).slice();
      if (cur.some(function(r){ return r.cat === cat && r.subCat === subCat; })) return prevData;
      cur.push({cat: cat, subCat: subCat});
      var newRefs = Object.assign({}, prevRefs);
      newRefs[stock] = cur;
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, { stockSubCatRefs: newRefs })
      });
    });
  };
  var delStockSubCatRef = function(cat, subCat) {
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var prevRefs = prevCustom.stockSubCatRefs || {};
      var cur = (prevRefs[stock] || []).filter(function(r){ return !(r.cat === cat && r.subCat === subCat); });
      var newRefs = Object.assign({}, prevRefs);
      if (cur.length === 0) delete newRefs[stock]; else newRefs[stock] = cur;
      return _objectSpread(_objectSpread({}, prevData), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, { stockSubCatRefs: newRefs })
      });
    });
  };
  var _csExtraTagsForStock = useMemo(function() {
    
    var fromCustom = (custom && custom.shvExtraTags && typeof custom.shvExtraTags === "object")
      ? custom.shvExtraTags : null;
    if (fromCustom && Array.isArray(fromCustom[stock])) return fromCustom[stock];
    try {
      var v = JSON.parse(localStorage.getItem("sn_shv_extra_tags_v1") || "{}");
      if (v && typeof v === "object" && Array.isArray(v[stock])) return v[stock];
    } catch(e){}
    return [];
    
    
  }, [stock, data && data.custom]);
  
  var _csExtraCatsForStock = useMemo(function() {
    var fromCustom = (custom && custom.shvExtraCats && typeof custom.shvExtraCats === "object" && !Array.isArray(custom.shvExtraCats))
      ? custom.shvExtraCats : null;
    if (fromCustom && Array.isArray(fromCustom[stock])) return fromCustom[stock];
    try {
      var v = JSON.parse(localStorage.getItem("sn_shv_extra_cats_v1") || "{}");
      if (v && typeof v === "object" && Array.isArray(v[stock])) return v[stock];
    } catch(e){}
    return [];
  }, [stock, data && data.custom]);
  
  var _useStateCsTagPicker = useState(false), _useStateCsTagPickerS = _slicedToArray(_useStateCsTagPicker, 2),
    csTagPickerOpen = _useStateCsTagPickerS[0], setCsTagPickerOpen = _useStateCsTagPickerS[1];
  var _useStateCsCatPicker = useState(false), _useStateCsCatPickerS = _slicedToArray(_useStateCsCatPicker, 2),
    csCatPickerOpen = _useStateCsCatPickerS[0], setCsCatPickerOpen = _useStateCsCatPickerS[1];
  var _useStateCsTagOpenCats = useState({}), _useStateCsTagOpenCatsS = _slicedToArray(_useStateCsTagOpenCats, 2),
    csTagOpenCats = _useStateCsTagOpenCatsS[0], setCsTagOpenCats = _useStateCsTagOpenCatsS[1];
  var _useStateCsCatOpenMains = useState({}), _useStateCsCatOpenMainsS = _slicedToArray(_useStateCsCatOpenMains, 2),
    csCatOpenMains = _useStateCsCatOpenMainsS[0], setCsCatOpenMains = _useStateCsCatOpenMainsS[1];
  
  var _csPersistExtraTags = function(nx) {
    try { localStorage.setItem("sn_shv_extra_tags_v1", JSON.stringify(nx)); } catch(e){}
    save(function(prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        custom: _objectSpread(_objectSpread({}, prev.custom || {}), {}, { shvExtraTags: nx })
      });
    });
  };
  var _csAddExtraTag = function(tag) {
    if (!stock || !tag) return;
    var base = (custom && custom.shvExtraTags && typeof custom.shvExtraTags === "object" && !Array.isArray(custom.shvExtraTags))
      ? custom.shvExtraTags : {};
    var nx = Object.assign({}, base);
    Object.keys(nx).forEach(function(k){ if (Array.isArray(nx[k])) nx[k] = nx[k].slice(); });
    var cur = (nx[stock] || []).slice();
    if (cur.indexOf(tag) < 0) cur.push(tag);
    nx[stock] = cur;
    _csPersistExtraTags(nx);
  };
  var _csRemoveExtraTag = function(tag) {
    if (!stock) return;
    var base = (custom && custom.shvExtraTags && typeof custom.shvExtraTags === "object" && !Array.isArray(custom.shvExtraTags))
      ? custom.shvExtraTags : {};
    var nx = Object.assign({}, base);
    Object.keys(nx).forEach(function(k){ if (Array.isArray(nx[k])) nx[k] = nx[k].slice(); });
    var cur = (nx[stock] || []).filter(function(t){ return t !== tag; });
    if (cur.length === 0) delete nx[stock]; else nx[stock] = cur;
    _csPersistExtraTags(nx);
  };
  var _csTogExtraTag = function(tag) {
    if (_csExtraTagsForStock.indexOf(tag) >= 0) _csRemoveExtraTag(tag);
    else _csAddExtraTag(tag);
  };
  
  var _csAddExtraCat = function(catKey) {
    if (!stock || !catKey) return;
    save(function(prev) {
      var prevCustom = prev.custom || {};
      var prevCats = (prevCustom.shvExtraCats && typeof prevCustom.shvExtraCats === "object" && !Array.isArray(prevCustom.shvExtraCats))
        ? prevCustom.shvExtraCats : {};
      var cur = (prevCats[stock] || []).slice();
      if (cur.indexOf(catKey) < 0) cur.push(catKey);
      var nx = Object.assign({}, prevCats);
      nx[stock] = cur;
      try { localStorage.setItem("sn_shv_extra_cats_v1", JSON.stringify(nx)); } catch(e){}
      return _objectSpread(_objectSpread({}, prev), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, { shvExtraCats: nx })
      });
    });
  };
  var _csRemoveExtraCat = function(catKey) {
    if (!stock) return;
    save(function(prev) {
      var prevCustom = prev.custom || {};
      var prevCats = (prevCustom.shvExtraCats && typeof prevCustom.shvExtraCats === "object" && !Array.isArray(prevCustom.shvExtraCats))
        ? prevCustom.shvExtraCats : {};
      var cur = (prevCats[stock] || []).filter(function(c){ return c !== catKey; });
      var nx = Object.assign({}, prevCats);
      if (cur.length === 0) delete nx[stock]; else nx[stock] = cur;
      try { localStorage.setItem("sn_shv_extra_cats_v1", JSON.stringify(nx)); } catch(e){}
      return _objectSpread(_objectSpread({}, prev), {}, {
        custom: _objectSpread(_objectSpread({}, prevCustom), {}, { shvExtraCats: nx })
      });
    });
  };
  var _csTogExtraCat = function(catKey) {
    if (_csExtraCatsForStock.indexOf(catKey) >= 0) _csRemoveExtraCat(catKey);
    else _csAddExtraCat(catKey);
  };
  var relNews = useMemo(function() {
    if (stock === "日経平均株価") return [];
    return _csCollectNewsForStock(data.trades || {}, custom, stock, date, _csExtraTagsForStock, _csExtraCatsForStock);
  }, [data.trades, custom, stock, date, _csExtraTagsForStock, _csExtraCatsForStock]);
  
  
  
  var dedupedRelNews = useMemo(function() {
    var seen = {};
    var out = [];
    relNews.forEach(function(rn) {
      var ni = rn && rn.ni;
      if (!ni) return;
      var key = ni.groupId ? ("g_" + ni.groupId) : ("i_" + (ni.id || ""));
      if (seen[key]) return;
      seen[key] = true;
      out.push(rn);
    });
    return out;
  }, [relNews]);
  
  var relNewsImgList = useMemo(function() {
    var list = [];
    dedupedRelNews.forEach(function(rn) {
      var imgs = (rn.ni && rn.ni.images) || [];
      var first = imgs.length > 0 ? imgs[0] : null;
      var src = first ? imgSrc(first) : null;
      if (src) list.push({ src: src, rn: rn });
    });
    return list;
  }, [dedupedRelNews]);
  var openRelNewsLightbox = function(idx) {
    if (idx < 0 || idx >= relNewsImgList.length) return;
    var item = relNewsImgList[idx];
    setViewer({ src: item.src, _relIdx: idx, _relTotal: relNewsImgList.length });
  };
  return React.createElement("div", null, viewer && React.createElement(ZoomLightbox, {
    src: viewer.src,
    
    annotProps: viewer._relIdx != null ? null : viewer.annotProps,
    onPrev: viewer._relIdx != null && viewer._relIdx > 0
      ? function() { openRelNewsLightbox(viewer._relIdx - 1); }
      : undefined,
    onNext: viewer._relIdx != null && viewer._relIdx < (viewer._relTotal || 0) - 1
      ? function() { openRelNewsLightbox(viewer._relIdx + 1); }
      : undefined,
    navLabel: viewer._relIdx != null
      ? (viewer._relIdx + 1) + " / " + viewer._relTotal
      : undefined,
    onClose: function onClose() {
      return setViewer(null);
    }
  }), simDraftId && React.createElement(SimilarSearchDialog, {
    cfg: cfg,
    custom: custom,
    originDraftId: simDraftId,
    originStock: stock,
    originDate: date,
    onClose: function() { setSimDraftId(null); },
    onJumpDate: function(d, s, t) {
      if (onSelectDate) onSelectDate(d, s, t);
    }
  }), patOpen && React.createElement(PatternSearchDialog, {
    cfg: cfg,
    custom: custom,
    onClose: function() { setPatOpen(false); },
    onJumpDate: function(d, s, t) {
      if (onSelectDate) onSelectDate(d, s, t);
    }
  }), directAnnot && React.createElement(ImageAnnotator, {
    img: directAnnot.img,
    onSave: function onSaveDA(ed) {
      directAnnot.onSave(ed);
      setDirectAnnot(null);
    },
    onClose: function onCloseDA() {
      return setDirectAnnot(null);
    }
  }), annotating && cd.chartImg && React.createElement(ImageAnnotator, {
    img: cd.chartImg,
    onSave: function onSave(ed) {
      upd("chartImg", ed);
      setAnnotating(false);
    },
    onClose: function onClose() {
      return setAnnotating(false);
    }
  }),
  
  React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#888",
      fontWeight: 600,
      marginBottom: 5,
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, React.createElement("span", null, "\u500B\u5225\u5730\u5408\u3044 ", React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 400,
      color: "#bbb"
    }
  }, "\uFF08\u9078\u629E\u4E2D\u3092\u3082\u3046\u4E00\u5EA6\u30BF\u30C3\u30D7\u3067\u89E3\u9664\uFF09")),
    macroAuto.pct != null && React.createElement("span", {
      style: { fontSize: 11, color: macroAuto.pct >= 0 ? "#DC2626" : "#16A34A", fontWeight: 700 },
      title: "\u5F53\u65E5\u7D42\u5024(" + (macroAuto.curDate || "?") + "): " + (macroAuto.curClose != null ? macroAuto.curClose : "?")
        + "\n\u524D\u65E5\u7D42\u5024(" + (macroAuto.prevDate || "?") + "): " + (macroAuto.prevClose != null ? macroAuto.prevClose : "?")
        + "\n\u5909\u5316\u7387: " + macroAuto.pct.toFixed(3) + "%"
    }, "\u524D\u65E5\u6BD4 " + (macroAuto.pct >= 0 ? "+" : "") + macroAuto.pct.toFixed(2) + "%"
      + (macroAuto.prevDate ? " (vs " + macroAuto.prevDate + ")" : "")),
    macroAuto.error === "prev-too-old" && React.createElement("span", {
      style: { fontSize: 11, color: "#B45309", fontWeight: 600 },
      title: "\u524D\u65E5 draft \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u6700\u3082\u8FD1\u3044\u904E\u53BB draft: " + (macroAuto.prevDate || "?") + " (" + (macroAuto.businessDays || "?") + "\u55B6\u696D\u65E5\u524D)"
    }, "\u26A0\uFE0F \u524D\u65E5 draft \u306A\u3057 (\u6700\u65B0\u904E\u53BB: " + (macroAuto.prevDate || "?") + ")"),
    macroAuto.error === "no-prev" && React.createElement("span", {
      style: { fontSize: 11, color: "#B45309", fontWeight: 600 }
    }, "\u26A0\uFE0F \u904E\u53BB draft \u306A\u3057"),
    
    
    stock === "日経平均株価" && React.createElement(_NikkeiManualInput, {
      key: "nmi_" + stock + "_" + date,
      cd: cd, upd: upd,
      getPrevClose: function() {
        var charts = data.charts || {};
        var prev = null;
        Object.keys(charts).forEach(function(k) {
          var idx = k.indexOf("_");
          if (idx < 0) return;
          var st = k.slice(0, idx), dt = k.slice(idx + 1);
          if (st !== "日経平均株価") return;
          if (dt >= date) return;
          var val = charts[k] && typeof charts[k].dayClose === "number" ? charts[k].dayClose : null;
          if (val == null) return;
          if (prev === null || dt > prev.dt) prev = { dt: dt, val: val };
        });
        return prev ? prev.val : null;
      }
    }),
    stock !== "日経平均株価" && cfg && cfg.fbUrl && React.createElement("button", {
      onClick: function() { runMacroAutoDetect(true); },
      disabled: macroAuto.busy,
      title: "chart-annotator から前日比%を取得して上書き判定",
      style: {
        marginLeft: "auto", padding: "3px 9px", fontSize: 11, fontWeight: 600,
        background: macroAuto.busy ? "#f5f4f0" : "#EEF2FF",
        color: macroAuto.busy ? "#bbb" : "#4F46E5",
        border: "1px solid " + (macroAuto.busy ? "#ddd" : "#C7D2FE"),
        borderRadius: 5, cursor: macroAuto.busy ? "wait" : "pointer"
      }
    }, macroAuto.busy ? "\u5224\u5B9A\u4E2D..." : "\uD83E\uDD16 \u81EA\u52D5\u5224\u5B9A")
  ), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 1
    }
  }, MACRO_LEVELS.map(function (la) {
    return React.createElement(Pill, {
      key: la,
      label: macroLabels[la],
      color: getMC(la),
      on: cd.macroLocal === la,
      onClick: function onClick() {
        return upd("macroLocal", cd.macroLocal === la ? "" : la);
      },
      sm: true
    });
  }))), (chartImgs.length > 0 && stock !== "日経平均株価") && React.createElement("div", {
    style: {
      background: "#f8f7f4",
      borderRadius: 10,
      padding: 14,
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: stock === "日経平均株価" ? "#444" : "#999",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, stock === "日経平均株価" ? "\uD83D\uDCCA \u30C1\u30E3\u30FC\u30C8\u753B\u50CF" : "\uD83D\uDCCA \u30C1\u30E3\u30FC\u30C8\u753B\u50CF\uFF08\u65E7\u30C7\u30FC\u30BF\uFF09"), chartImgs.length ? React.createElement("div", null,
  React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 } },
  chartImgs.map(function(ci, cidx) {
    var csrc = imgSrc(ci);
    return React.createElement("div", {
      key: cidx,
      style: { position: "relative", display: "inline-block" }
    },
    React.createElement("img", {
      src: csrc,
      onClick: function() {
        setDirectAnnot({
          img: ci,
          onSave: function(ed) {
            var newImgs = _toConsumableArray(chartImgs);
            newImgs[cidx] = ed;
            upd("chartImgs", newImgs);
            upd("chartImg", newImgs[0]);
          }
        });
      },
      onError: function(e) {
        // 2026-07-18 読込失敗（オフライン/Storage一時エラー/URL失効）でデータから画像を削除しない＝一時的失敗と恒久欠損を区別できないため。薄く表示するだけに留める（ゴミ箱ボタンで手動削除は従来どおり）。
        if (e && e.target) e.target.style.opacity = "0.35";
      },
      style: { maxWidth: "100%", maxHeight: 400, borderRadius: 8, display: "block", cursor: "zoom-in" },
      alt: ""
    }),
    React.createElement("button", {
      onClick: function() {
        var newImgs = chartImgs.filter(function(_, j){ return j !== cidx; });
        save(function(prevData) {
          var prevCd = (prevData.charts && prevData.charts[ck]) || {};
          return _objectSpread(_objectSpread({}, prevData), {}, {
            charts: _objectSpread(_objectSpread({}, prevData.charts), {}, _defineProperty({}, ck,
              _objectSpread(_objectSpread({}, prevCd), {}, { chartImgs: newImgs, chartImg: newImgs[0] || null })))
          });
        });
        if (!newImgs.length) setAiDone(false);
      },
      style: { position: "absolute", top: 4, right: 4, width: 24, height: 24,
               borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
               fontSize: 13, cursor: "pointer", fontWeight: 700, zIndex: 10,
               display: "flex", alignItems: "center", justifyContent: "center" }
    }, "\u2715"));
  })),
  null
  ) : null,
  stock === "日経平均株価" && React.createElement("div", {
    style: { marginTop: chartImgs.length ? 8 : 0 }
  },
    React.createElement(PasteZone, {
      compact: true,
      onImage: function(img) {
        if (!img) return;
        save(function(prev) {
          var prevCd = (prev.charts && prev.charts[ck]) || {};
          var prevImgs = (prevCd.chartImgs && prevCd.chartImgs.length) ? prevCd.chartImgs : (prevCd.chartImg ? [prevCd.chartImg] : []);
          var nextImgs = [].concat(_toConsumableArray(prevImgs), [img]);
          return _objectSpread(_objectSpread({}, prev), {}, {
            charts: _objectSpread(_objectSpread({}, prev.charts), {}, _defineProperty({}, ck,
              _objectSpread(_objectSpread({}, prevCd), {}, { chartImgs: nextImgs, chartImg: nextImgs[0] })))
          });
        });
      }
    })
  )
  ), stock !== "日経平均株価" && React.createElement(CAChartSection, {
    stock: stock,
    date: date,
    custom: custom,
    cfg: cfg,
    onSimilarSearch: runSimilarSearch,
    onPatternSearch: function(){ setPatOpen(true); }
  }), stock === "日経平均株価" && React.createElement(NikkeiPriceChart, {
    data: data, onSelectDate: onSelectDate, highlightDate: date
  }), React.createElement(TagPicker, _extends({
    cats: custom.chartShapeCats || {},
    tags: custom.chartShapeTags || [],
    sel: cd.chartShapeTags || [],
    onToggle: togSTag,
    onAdd: onAddSTag
  }, pool, {
    label: "\u30C1\u30E3\u30FC\u30C8\u5F62\u72B6\u30BF\u30B0",
    hideAddRoot: true
  })),
  React.createElement("div", {
    style: { marginTop: 8 }
  },
    React.createElement("div", {
      style: { fontSize: 13, color: "#888", fontWeight: 600, marginBottom: 6 }
    }, "📝 メモ"),
    React.createElement(MemoEditableField, {
      key: "mef_chart_" + stock + "_" + date,
      html: cd.chartMemoHtml || _summaryMemoToHtml(cd.chartMemo),
      onSave: function(h) { upd("chartMemoHtml", h); },
      placeholder: "",
      autoEdit: false,
      guardOwner: "chartMemo_" + stock + "_" + date
    })
  ),
  !hideSignals && React.createElement(EntrySignalSection, {
    allData: data,
    save: save,
    stock: stock,
    date: date,
    onOpenEntryLog: onOpenEntryLog
  }),
  !hideSignals ? React.createElement(WeeklyPnlPanel, { data: data, stock: stock, date: date, save: save }) : null,
  !hideSignals && (function() {
    // 本日エントリーが無い日でも、この銘柄の前日までの履歴（v2・算入）があれば「α 推奨α値」ブロック（本日の採用α値＋α詳細データ表）を既定表示する 2026-07-18。
    // 母数は前日まで全期間なので当日の記録有無に依存しない（DayViewの_elBaseAlphaDayBlockV2と同じ「前日まで or 本日」ガードに揃える）。前日まで・当日とも記録ゼロの銘柄だけ非表示。
    var _iaSigs = Array.isArray(cd.signals) ? cd.signals : [];
    if (!_elStockRecsBefore(data, stock, date).length && !_iaSigs.length) return null;
    return _elBaseAlphaPeriodBlockV2(data, stock, date, save);
  })(),
  React.createElement(AppearanceSection, { data: data, save: save, stock: stock, date: date }));
});


