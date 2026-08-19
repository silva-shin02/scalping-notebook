function HomeEventFormModal(_p_hef) {
  var data = _p_hef.data, save = _p_hef.save, onClose = _p_hef.onClose;
  var custom = data.custom || {};
  var allStocks = (custom.stocks && custom.stocks.length > 0) ? custom.stocks : _DEF_STOCKS_FROZEN;
  var eventCategories = (Array.isArray(custom.eventCategories) && custom.eventCategories.length > 0)
    ? custom.eventCategories
    : [{ id: "evcat_other", name: "その他", color: "#6366F1" }];

  
  var _todayStr = (function() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  })();

  var _usDraft = useState({
    date: _todayStr, title: "", allDay: true,
    startTime: "", endTime: "", content: "", contentHtml: "",
    endDate: "", relatedStocks: [],
    categoryId: (eventCategories[0] && eventCategories[0].id) || ""
  });
  var _usDraftA = _slicedToArray(_usDraft, 2), draft = _usDraftA[0], setDraft = _usDraftA[1];

  useModalBack(true, onClose, "home-event-form");

  var upd = function(patch) { setDraft(function(p) { return Object.assign({}, p, patch); }); };

  var togRelStock = function(stk) {
    var arr = (draft.relatedStocks || []).slice();
    var i = arr.indexOf(stk);
    if (i >= 0) arr.splice(i, 1); else arr.push(stk);
    upd({ relatedStocks: arr });
  };

  var saveDraft = function() {
    _fiFlushAll();
    var titleNow = draft.title;
    try {
      var inps = document.querySelectorAll("input[data-fi-key='hefDraftTitle']");
      if (inps.length) titleNow = inps[inps.length-1].value || "";
    } catch(_e) {}
    var html = (draft.contentHtml || "").trim();
    var hasHtml = _hasText(html);
    if (!titleNow.trim() && !hasHtml) return;
    var clean = {
      id: Date.now(), title: titleNow.trim(),
      allDay: !(draft.startTime || draft.endTime),
      startTime: draft.startTime || "", endTime: draft.endTime || "",
      content: "", contentHtml: hasHtml ? html : "",
      endDate: (draft.endDate || "").trim(),
      relatedStocks: (draft.relatedStocks || []).slice(),
      categoryId: draft.categoryId || ""
    };
    var targetDate = draft.date || _todayStr;
    save(function(prevData) {
      var prevDd = (prevData.trades && prevData.trades[targetDate]) || {};
      var prevEvents = Array.isArray(prevDd.events) ? prevDd.events : [];
      return Object.assign({}, prevData, {
        trades: Object.assign({}, prevData.trades, _defineProperty({}, targetDate,
          Object.assign({}, prevDd, { events: prevEvents.concat([clean]) })))
      });
    });
    onClose();
  };

  var inputStyle = { fontSize: 14, padding: "8px 10px", border: "1px solid #ccc", borderRadius: 6, boxSizing: "border-box" };
  var labelStyle = { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 };

  return React.createElement("div", {
    onClick: onClose,
    style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }
  },
    React.createElement("div", {
      onClick: function(e){ e.stopPropagation(); },
      style: { background: "#fff", borderRadius: 12, maxWidth: 520, width: "100%",
        maxHeight: "90vh", display: "flex", flexDirection: "column" }
    },
      
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: "1px solid #e0ddd6", flexShrink: 0 }
      },
        React.createElement("span", { style: { fontSize: 14, fontWeight: 700 } }, "📅 予定を追加"),
        React.createElement("button", {
          onClick: onClose,
          style: { padding: "6px 14px", fontSize: 13, fontWeight: 600,
            background: "#f5f4f0", color: "#555", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }
        }, "キャンセル")
      ),
      
      React.createElement("div", {
        style: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }
      },
        
        React.createElement("div", null,
          React.createElement("div", { style: labelStyle }, "予定日"),
          React.createElement("input", {
            type: "date", value: draft.date,
            onChange: function(e){ upd({ date: e.target.value }); },
            style: Object.assign({}, inputStyle, { width: "auto" })
          })
        ),
        
        React.createElement("div", null,
          React.createElement("div", { style: labelStyle }, "タイトル"),
          React.createElement(FastInput, {
            type: "text", "data-fi-key": "hefDraftTitle",
            value: draft.title,
            onChange: function(v){ upd({ title: v }); },
            placeholder: "例: トヨタ決算発表 / FOMC など",
            style: Object.assign({}, inputStyle, { width: "100%" })
          })
        ),
        
        React.createElement("div", null,
          React.createElement("div", { style: labelStyle }, "カテゴリ"),
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
            eventCategories.map(function(c) {
              var on = draft.categoryId === c.id;
              return React.createElement("button", {
                key: c.id,
                onClick: function(){ upd({ categoryId: c.id }); },
                style: { padding: "5px 10px", fontSize: 12, fontWeight: 600,
                  background: on ? c.color : "#fff", color: on ? "#fff" : "#444",
                  border: "1px solid " + (on ? c.color : "#ddd"),
                  borderRadius: 5, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4 }
              },
                React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: on ? "#fff" : c.color, opacity: on ? 0.9 : 1 } }),
                c.name
              );
            })
          )
        ),
        
        React.createElement("div", null,
          React.createElement("div", { style: labelStyle }, "時間帯"),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
            React.createElement("input", {
              type: "time", value: draft.startTime || "",
              onChange: function(e){ upd({ startTime: e.target.value, allDay: e.target.value ? false : draft.allDay }); },
              style: { fontSize: 14, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5 }
            }),
            React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "〜"),
            React.createElement("input", {
              type: "time", value: draft.endTime || "",
              onChange: function(e){ upd({ endTime: e.target.value, allDay: e.target.value ? false : draft.allDay }); },
              style: { fontSize: 14, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5 }
            })
          ),
          React.createElement("div", { style: { fontSize: 10, color: "#aaa", marginTop: 3 } }, "空欄のまま保存すると「終日」として記録されます")
        ),
        
        React.createElement("div", null,
          React.createElement("div", { style: labelStyle }, "終了日（複数日にわたる場合）"),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
            React.createElement("input", {
              type: "date", value: draft.endDate || "",
              onChange: function(e){ upd({ endDate: e.target.value }); },
              style: { fontSize: 13, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5 }
            }),
            draft.endDate && React.createElement("button", {
              onClick: function(){ upd({ endDate: "" }); },
              style: { fontSize: 11, padding: "4px 10px", background: "#fff", color: "#888",
                border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" }
            }, "クリア")
          )
        ),
        
        React.createElement("div", null,
          React.createElement("div", { style: labelStyle }, "内容メモ"),
          React.createElement(MemoEditableField, {
            key: "mef_hef_new",
            html: draft.contentHtml || "",
            onChange: function(h){ upd({ contentHtml: h }); },
            placeholder: "詳細、メモ、URLなど",
            autoEdit: true, inlineButtons: false,
            guardOwner: "homeEventEdit_new"
          })
        ),
        
        allStocks.length > 0 && React.createElement("div", null,
          React.createElement("div", { style: labelStyle }, "関連銘柄"),
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } },
            allStocks.filter(function(s){ return s !== "日経平均株価"; }).map(function(stk) {
              var on = (draft.relatedStocks || []).indexOf(stk) >= 0;
              return React.createElement("button", {
                key: stk, onClick: function(){ togRelStock(stk); },
                style: { padding: "4px 10px", fontSize: 11, fontWeight: 600,
                  background: on ? "#4F46E5" : "#fff", color: on ? "#fff" : "#444",
                  border: "1px solid " + (on ? "#4F46E5" : "#ddd"),
                  borderRadius: 5, cursor: "pointer" }
              }, (on ? "✓ " : "") + stk);
            })
          )
        ),
        
        React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", paddingTop: 4 } },
          React.createElement("button", {
            onMouseDown: _fiFlushAll, onTouchStart: _fiFlushAll,
            onClick: saveDraft,
            style: { padding: "8px 24px", fontSize: 13, fontWeight: 700,
              background: "#10B981", color: "#fff", border: "none",
              borderRadius: 6, cursor: "pointer" }
          }, "保存")
        )
      )
    )
  );
}

function App() {
  var _useState151 = useState(stLoad()),
    _useState152 = _slicedToArray(_useState151, 2),
    data = _useState152[0],
    setData = _useState152[1],
    _useState153 = useState({}),
    _useState154 = _slicedToArray(_useState153, 2),
    cfg = _useState154[0],
    setCfg = _useState154[1],
    _useState155 = useState(true),
    _useState156 = _slicedToArray(_useState155, 2),
    loading = _useState156[0],
    setLoading = _useState156[1];
  // 旧: 数値根拠名の_EL_NUM_REASON同期（2026-06-24i）は浮き足フィールド化（signal.ukiUsed 2026-07-03）で廃止＝_elHasNumReason(app-06)はsignal.ukiUsedを直接判定。
  var _useState157 = useState(function(){
      try { var _v=JSON.parse(localStorage.getItem("scalping_view_v1")||"{}"); return _v.sel||null; } catch(e){ return null; }
    }),
    _useState158 = _slicedToArray(_useState157, 2),
    sel = _useState158[0],
    setSel = _useState158[1],
    _useState159 = useState(function(){
      try { var _v=JSON.parse(localStorage.getItem("scalping_view_v1")||"{}"); return _v.selTab||"news"; } catch(e){ return "news"; }
    }),
    _useState160 = _slicedToArray(_useState159, 2),
    selTab = _useState160[0],
    setSelTab = _useState160[1];
  var _useState161 = useState(new Date().getFullYear()),
    _useState162 = _slicedToArray(_useState161, 2),
    cY = _useState162[0],
    setCY = _useState162[1],
    _useState163 = useState(new Date().getMonth()),
    _useState164 = _slicedToArray(_useState163, 2),
    cM = _useState164[0],
    setCM = _useState164[1];
  var _useState165 = useState(false),
    _useState166 = _slicedToArray(_useState165, 2),
    showSettings = _useState166[0],
    setShowSettings = _useState166[1],
    _useState167 = useState(false),
    _useState168 = _slicedToArray(_useState167, 2),
    showSearch = _useState168[0],
    setShowSearch = _useState168[1],
    _useState169 = useState("none"),
    _useState170 = _slicedToArray(_useState169, 2),
    fbStatus = _useState170[0],
    setFbStatus = _useState170[1];
  // 同期ステータス強化（オンライン/オフライン・最終同期時刻）2026-06-29
  var _uOnline = useState(typeof navigator !== "undefined" ? navigator.onLine : true), _snOnline = _uOnline[0], _setSnOnline = _uOnline[1];
  var _uLastSync = useState(null), _snLastSync = _uLastSync[0], _setSnLastSync = _uLastSync[1];
  var _uSnDlg = useState(null), snDlg = _uSnDlg[0], setSnDlg = _uSnDlg[1];   // 2026-07-18 グローバル確認/通知/入力ダイアログ（iPad standaloneでwindow.confirm/prompt/alertが無反応な問題の代替）
  useEffect(function() {
    var _on = function() { _setSnOnline(true); }, _off = function() { _setSnOnline(false); };
    window.addEventListener("online", _on); window.addEventListener("offline", _off);
    return function() { window.removeEventListener("online", _on); window.removeEventListener("offline", _off); };
  }, []);
  useEffect(function() { if (fbStatus === "ok") { try { _setSnLastSync(new Date()); } catch (e) {} } }, [fbStatus]);

  var _useStateHEF = useState(false),
    _useStateHEFA = _slicedToArray(_useStateHEF, 2),
    showHomeEventForm = _useStateHEFA[0],
    setShowHomeEventForm = _useStateHEFA[1];
  
  var _useStateEL1 = useState(false),
    _useStateEL2 = _slicedToArray(_useStateEL1, 2),
    showEntryLog = _useStateEL2[0],
    setShowEntryLog = _useStateEL2[1];
  var _useStateEL3 = useState(false),
    _useStateEL4 = _slicedToArray(_useStateEL3, 2),
    showEntryForm = _useStateEL4[0],
    setShowEntryForm = _useStateEL4[1];
  
  var _useStateSHV1 = useState(false),
    _useStateSHV2 = _slicedToArray(_useStateSHV1, 2),
    showStockHistory = _useStateSHV2[0],
    setShowStockHistory = _useStateSHV2[1];
  
  var _useStateNHV1 = useState(false),
    _useStateNHV2 = _slicedToArray(_useStateNHV1, 2),
    showNewsHistory = _useStateNHV2[0],
    setShowNewsHistory = _useStateNHV2[1];
  
  var _useStateMHV1 = useState(false),
    _useStateMHV2 = _slicedToArray(_useStateMHV1, 2),
    showSummaryHistory = _useStateMHV2[0],
    setShowSummaryHistory = _useStateMHV2[1];
  var pollRef = useRef(null),
    skipRef = useRef(false),
    skipTimerRef = useRef(null),
    fbSyncTimerRef = useRef(null),
    dataRef = useRef(EMPTY),
    cfgRef = useRef({}),
    fbStatusRef = useRef("none"),
    selRef = useRef(null); 
  var fileRef = useRef();
  var startPolling = function startPolling(c) {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!c || !c.fbUrl || c.fbPaused !== false) return;
    
    
    pollRef.current = setInterval(_asyncToGenerator(_regenerator().m(function _callee3() {
      var remoteV, remoteMeta, merged;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            
            
            
            
            if (skipRef.current) { return _context3.a(2); }
            if (_imgUploadAnyPending() || window._snFbFlushPending) { return _context3.a(2); }
            if ((function(){
              var ae = document.activeElement;
              return !!(ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" ||
                ae.isContentEditable || ae.getAttribute("contenteditable") === "true"));
            })()) { return _context3.a(2); }
            _context3.n = 1;
            break;
          case 1:
            _context3.p = 1; 
            _context3.n = 2;
            return fbPollV(c);
          case 2:
            remoteV = _context3.v;
            if (!(remoteV && remoteV !== _fbLocalV)) {
              _context3.n = 5; 
              break;
            }
            _context3.n = 3;
            // 差分同期: 変わったセクションだけ取得（_fbPollFetchが内部で全件フォールバック）。2026-06-15
            return _fbPollFetch(c, dataRef.current, remoteV);
          case 3:
            var _pf = _context3.v;
            if (_pf && _pf.ok) {
              _fbLocalV = remoteV; // 同期成功 or 内容一致 → 版数を進める（取得失敗時は進めず次ポーリングで再試行）
              remoteMeta = _pf.data; // nochange時はnull＝マージ不要
              if (remoteMeta && typeof remoteMeta === "object" && (remoteMeta.trades || remoteMeta.charts)) {
                var _pLv = (dataRef.current && typeof dataRef.current._v === "number") ? dataRef.current._v : 0;
                var _pRv = (remoteMeta && typeof remoteMeta._v === "number") ? remoteMeta._v : 0;
                if (_pLv > _pRv) {
                  console.log("[FB] poll: local is newer (lv=" + _pLv + " > rv=" + _pRv + "), skipping merge and pushing local");
                  if (cfgRef.current && cfgRef.current.fbUrl && cfgRef.current.fbPaused === false) {
                    fbPut(cfgRef.current, dataRef.current)["catch"](function(e){ console.warn("fbPut(poll local-wins) failed:", e); });
                  }
                } else {
                  merged = _mergeRemoteMeta(dataRef.current, remoteMeta);
                  merged = migrateData(merged);
                  setData(merged);
                  stSave(merged);
                  dataRef.current = merged;
                  preloadImages(dataRef, setData, stSave, selRef.current);
                }
              }
            }
          case 4: 
          case 5: 
            _context3.n = 7; 
            break;
          case 6: 
            _context3.p = 6;
            console.warn("Poll error:", _context3.v);
          case 7:
            return _context3.a(2);
        }
      }, _callee3, null, [[1, 6]]);
    })), 60000);
  };
  useEffect(function () {
    try {
      var ld = stLoad(),
        lc = cfLoad();
      setData(ld);
      setCfg(lc);
      dataRef.current = ld;
      cfgRef.current = lc;
      
      if (lc && lc.fbUrl) fbStorageInit(lc.apiKey, lc.storageBucket);
      if (lc && lc.fbUrl && lc.fbPaused === false) {
        setFbStatus("syncing");
        fbInitialLoad(lc, ld).then(function (res) {
          if (res.status === "pushed") {
            setFbStatus("ok");
          } else if (res.status === "skip") {
            
            
            setFbStatus("ok");
            setTimeout(function() { preloadImages(dataRef, setData, stSave, selRef.current); }, 2000);
          } else if (res.status === "ok" && res.data) {
            
            var remote = migrateData(res.data);
            
            
            var _lv = (ld && typeof ld._v === "number") ? ld._v : 0;
            var _rv = (remote && typeof remote._v === "number") ? remote._v : 0;
            if (_lv > _rv) {
              console.log("[FB] initial load: local is newer (lv=" + _lv + " > rv=" + _rv + "), pushing local to remote");
              
              setData(ld);
              dataRef.current = ld;
              fbPut(lc, ld)["catch"](function(e){ console.warn("fbPut(local-wins) failed:", e); });
              setFbStatus("ok");
              setTimeout(function() { preloadImages(dataRef, setData, stSave, selRef.current); }, 2000);
            } else {
              var _mr1 = _mergeRemoteMeta(ld, remote);
              console.log("[FB] initial load: merged remote into local",
                "localImgCount:", (JSON.stringify(ld).match(/"base64":"/g) || []).length,
                "remoteRefCount:", (JSON.stringify(remote).match(/"__ref__"/g) || []).length);
              setData(_mr1);
              stSave(_mr1);
              dataRef.current = _mr1;
              setFbStatus("ok");
              setTimeout(function() { preloadImages(dataRef, setData, stSave, selRef.current); }, 2000);
            }
          } else setFbStatus("err");
          startPolling(lc);
          setLoading(false);
        })["catch"](function (e) {
          console.warn("Firebase initial load failed:", e);
          setFbStatus("err");
          startPolling(lc);
          setLoading(false);
        });
      } else {
        if (lc && lc.fbUrl && lc.fbPaused !== false) setFbStatus("paused");
        setLoading(false);
        
        setTimeout(function() { preloadImages(dataRef, setData, stSave, selRef.current); }, 2000);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
    return function () {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);
  useEffect(function () {
    var pz = function(e) { if (e.ctrlKey || e.metaKey) e.preventDefault(); };
    document.addEventListener("wheel", pz, {passive: false});
    return function() { document.removeEventListener("wheel", pz, {passive: false}); };
  }, []);
  // iOS/Safari対策: localStorage/IndexedDBはITP(7日未使用・容量逼迫)で消される。消えると起動のたびに
  // meta.json全件＋画像をStorageから再DLし、Firebaseのダウンロード枠を圧迫する（超過の主因）。
  // 永続化はユーザー操作後（特にホーム画面追加=PWA時）に要求するとiOSでも許可されやすいので、
  // 読み込み時(IDB open)に加えて最初の操作後にも要求する。2026-06-15
  useEffect(function () {
    if (!(navigator.storage && navigator.storage.persist)) return undefined;
    var done = false;
    var cleanup = function() {
      document.removeEventListener("pointerdown", ask, true);
      document.removeEventListener("touchend", ask, true);
      document.removeEventListener("keydown", ask, true);
    };
    function ask() {
      if (done) return; done = true;
      try {
        var _doPersist = function() {
          navigator.storage.persist().then(function(granted) {
            console.log("[Storage] persist after gesture:", granted ? "granted" : "denied");
          })["catch"](function(){});
        };
        var p = navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(false);
        p.then(function(already) {
          if (already) { console.log("[Storage] already persistent"); return; }
          _doPersist();
        })["catch"](function(){ _doPersist(); });
      } catch(e) {}
      cleanup();
    }
    document.addEventListener("pointerdown", ask, true);
    document.addEventListener("touchend", ask, true);
    document.addEventListener("keydown", ask, true);
    return cleanup;
  }, []);
  useEffect(function () {
    try {
      var _old = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
      localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, _old, {sel:sel, selTab:selTab})));
    } catch(e) {}
  }, [sel, selTab]);
  
  
  useEffect(function () {
    selRef.current = sel;
    if (!dataRef.current) return;
    
    var evicted = _evictNonActiveImages(dataRef.current, sel);
    if (evicted > 0) {
      var _next = Object.assign({}, dataRef.current);
      dataRef.current = _next;
      setData(_next);
    }
    
    if (sel) {
      var _t = setTimeout(function () { preloadImages(dataRef, setData, stSave, sel); }, 300);
      return function () { clearTimeout(_t); };
    }
  }, [sel]);
  
  // 自動停止機能は廃止（2026-06-16）。使用量90%でも同期は止めない（黙って止めるとバックアップ無しになりデータ消失の恐れがあるため）。
  // 旧: _fbSetAutoPauseCb で fbPaused:true に切り替えていた処理を削除。同期の停止/再開は設定の手動トグルのみ。
  
  
  
  

  
  var viewTokenRef = useRef("root");
  useEffect(function() {
    viewTokenRef.current = sel ? "sel:" + sel
      : showEntryLog ? "entrylog"
      : showStockHistory ? "stockhistory"
      : showNewsHistory ? "newshistory"
      : showSummaryHistory ? "summaryhistory"
      : "root";
  }, [sel, showEntryLog, showStockHistory, showNewsHistory, showSummaryHistory]);

  
  var applyHistoryToken = useCallback(function(token) {
    
    viewTokenRef.current = token && token.indexOf("sel:") === 0 ? token : (token || "root");
    if (token === "root") {
      setSel(null);
      setSelTab("news");
      setShowEntryLog(false);
      setShowStockHistory(false);
      setShowNewsHistory(false);
      setShowSummaryHistory(false);
    } else if (token === "entrylog") {
      setSel(null);
      setShowEntryLog(true);
      setShowStockHistory(false);
      setShowNewsHistory(false);
      setShowSummaryHistory(false);
    } else if (token === "stockhistory") {
      setSel(null);
      setShowEntryLog(false);
      setShowStockHistory(true);
      setShowNewsHistory(false);
      setShowSummaryHistory(false);
    } else if (token === "newshistory") {
      setSel(null);
      setShowEntryLog(false);
      setShowStockHistory(false);
      setShowNewsHistory(true);
      setShowSummaryHistory(false);
    } else if (token === "summaryhistory") {
      setSel(null);
      setShowEntryLog(false);
      setShowStockHistory(false);
      setShowNewsHistory(false);
      setShowSummaryHistory(true);
    } else if (token.indexOf("sel:") === 0) {
      var d = token.slice(4);
      setSel(d);
      setShowEntryLog(false);
      setShowStockHistory(false);
      setShowNewsHistory(false);
      setShowSummaryHistory(false);
    } else if (token && token.indexOf("modal:") === 0) {
      
      
      
    } else {
      
      
      setSel(null);
      setSelTab("news");
      setShowEntryLog(false);
      setShowStockHistory(false);
      setShowNewsHistory(false);
      setShowSummaryHistory(false);
    }
  }, []);

  useEffect(function() {
    
    try {
      if (!window.history.state || !window.history.state._sn) {
        window.history.replaceState({ _sn: "root" }, "");
      }
    } catch(e) {}
    var onPop = function() {
      
      if (window._sn_internalBack) {
        window._sn_internalBack = false;
        return;
      }
      var st = window.history.state;
      var targetToken = (st && st._sn) || "root";
      try { _stFlush(); } catch(e){}
      applyHistoryToken(targetToken);
    };
    window.addEventListener("popstate", onPop);
    return function() { window.removeEventListener("popstate", onPop); };
  }, [applyHistoryToken]);
  
  useEffect(function() {
    if (sel || showEntryLog || showStockHistory || showNewsHistory || showSummaryHistory) {
      var token = sel ? "sel:" + sel : (showEntryLog ? "entrylog" : (showStockHistory ? "stockhistory" : (showNewsHistory ? "newshistory" : "summaryhistory")));
      try {
        var _curState = window.history.state;
        var _curToken = (_curState && _curState._sn) || "root";
        if (_curToken !== token) {
          
          
          
          var _bothSel = _curToken.indexOf("sel:") === 0 && token.indexOf("sel:") === 0;
          if (_bothSel) {
            window.history.replaceState({ _sn: token }, "");
          } else {
            window.history.pushState({ _sn: token }, "");
          }
        }
      } catch(e){}
    }
  }, [sel, showEntryLog, showStockHistory, showNewsHistory, showSummaryHistory]);

  
  
  
  
  useEffect(function() {
    var onWheel = function(e) {
      if (e.deltaX !== 0) return; 
      if (!e.deltaY) return;
      var el = e.target;
      while (el && el !== document.body && el.nodeType === 1) {
        
        
        if (el.getAttribute && el.getAttribute("data-focus-scroll") === "1") return;
        if (el.scrollWidth > el.clientWidth) {
          var s;
          try { s = window.getComputedStyle(el); } catch(_) { s = null; }
          var ox = s ? s.overflowX : "";
          if (ox === "auto" || ox === "scroll") {
            var atStart = el.scrollLeft <= 0;
            var atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
            
            if ((atEnd && e.deltaY > 0) || (atStart && e.deltaY < 0)) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY;
            return;
          }
        }
        el = el.parentElement;
      }
    };
    document.addEventListener("wheel", onWheel, { passive: false });
    return function() { document.removeEventListener("wheel", onWheel, { passive: false }); };
  }, []);
  
  useModalBack(showSettings, function(){ setShowSettings(false); }, "settings");
  
  useEffect(function(){ try { window._snCfg = cfg; } catch(e){} }, [cfg]);
  
  
  
  useEffect(function(){
    window._snFbFlushNow = function() {
      try {
        if (cfgRef.current && cfgRef.current.fbUrl && cfgRef.current.fbPaused === false) {
          if (fbSyncTimerRef.current) {
            
            clearTimeout(fbSyncTimerRef.current);
            fbSyncTimerRef.current = null;
            fbPut(cfgRef.current, dataRef.current).then(function() {
              fbStatusRef.current = "ok"; setFbStatus("ok");
              console.log("[_snFbFlushNow] immediate fbPut done");
            })["catch"](function(e) {
              console.warn("[_snFbFlushNow] fbPut failed:", e);
              fbStatusRef.current = "err"; setFbStatus("err");
            });
          }
          
          
        }
      } catch(e) { console.warn("[_snFbFlushNow] error:", e); }
    };
    return function() { delete window._snFbFlushNow; };
  }, []);
  // 2026-07-18 グローバル確認/通知/入力ダイアログのwindow公開＝各コンポーネントから _snConfirm/_snAlert/_snPrompt をPromiseで呼ぶ（iPad standaloneでwindow.confirm等が無反応な問題の代替）
  useEffect(function() {
    window._snAlert = function(m){ return new Promise(function(res){ setSnDlg({ type: "alert", message: (m == null ? "" : String(m)), resolve: res }); }); };
    window._snConfirm = function(m){ return new Promise(function(res){ setSnDlg({ type: "confirm", message: (m == null ? "" : String(m)), resolve: res }); }); };
    window._snPrompt = function(m, def){ return new Promise(function(res){ setSnDlg({ type: "prompt", message: (m == null ? "" : String(m)), defaultVal: (def == null ? "" : String(def)), resolve: res }); }); };
    return function() { try { delete window._snAlert; delete window._snConfirm; delete window._snPrompt; } catch(e){} };
  }, []);
  useModalBack(showSearch, function(){ setShowSearch(false); }, "search");
  var save = function save(dOrFn, opts) {
    var immediate = opts && opts.immediate;
    
    if (!immediate && window._snFbFlushPending) {
      immediate = true;
      window._snFbFlushPending = false;
    }
    var d = typeof dOrFn === 'function' ? dOrFn(dataRef.current) : dOrFn;
    
    d = _objectSpread(_objectSpread({}, d), {}, { _v: Date.now() });
    setData(d);
    
    
    
    
    
    
    
    stSave(d, !!immediate);
    dataRef.current = d;
    if (cfgRef.current && cfgRef.current.fbUrl && cfgRef.current.fbPaused === false) {
      skipRef.current = true;
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      fbStatusRef.current = "syncing"; setFbStatus("syncing");
      
      
      
      window._snHtmlUploadCb = function(map) {
        var _upd = _applyHtmlUrlMapToData(dataRef.current, map);
        if (_upd !== dataRef.current) {
          console.log("[htmlUpload] state updated: replaced " + Object.keys(map).length + " data: URL(s) with Storage URL(s)");
          dataRef.current = _upd;
          setData(_upd);
          stSave(_upd, false);
        }
      };
      // 構造化画像(ニュース等のimages[])のアップロード済みURLをライブstateへ書き戻す＝base64がlocalStorageから剥離される。
      window._snImgUploadCb = function(map) {
        var _upd2 = _applyImgUrlMapToData(dataRef.current, map);
        if (_upd2 !== dataRef.current) {
          console.log("[imgUpload] state updated: wrote back " + Object.keys(map).length + " Storage URL(s) to image object(s)");
          dataRef.current = _upd2;
          setData(_upd2);
          stSave(_upd2, false);
        }
      };
      if (immediate) {
        
        if (fbSyncTimerRef.current) clearTimeout(fbSyncTimerRef.current);
        fbSyncTimerRef.current = null;
        fbPut(cfgRef.current, dataRef.current).then(function () {
          fbStatusRef.current = "ok"; setFbStatus("ok");
          skipTimerRef.current = setTimeout(function () {
            skipRef.current = false;
            skipTimerRef.current = null;
          }, 30000);
        })["catch"](function (e) {
          console.warn("fbPut failed:", e);
          fbStatusRef.current = "err"; setFbStatus("err");
          skipRef.current = false;
          window._snHtmlUploadCb = null;
          window._snImgUploadCb = null;
        });
      } else {
        
        if (fbSyncTimerRef.current) clearTimeout(fbSyncTimerRef.current);
        fbSyncTimerRef.current = setTimeout(function() {
          fbSyncTimerRef.current = null;
          fbPut(cfgRef.current, dataRef.current).then(function () {
            fbStatusRef.current = "ok"; setFbStatus("ok");
            skipTimerRef.current = setTimeout(function () {
              skipRef.current = false;
              skipTimerRef.current = null;
            }, 30000);
          })["catch"](function (e) {
            console.warn("fbPut failed:", e);
            fbStatusRef.current = "err"; setFbStatus("err");
            skipRef.current = false;
            window._snHtmlUploadCb = null;
            window._snImgUploadCb = null;
          });
        }, 3000);
      }
    }
  };
  var saveCfg = function saveCfg(c) {
    setCfg(c);
    cfSave(c);
    cfgRef.current = c;
    setShowSettings(false);
    
    
    _fbLastPutHash = null;
    
    if (c && c.fbUrl) fbStorageInit(c.apiKey, c.storageBucket);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (c && c.fbUrl && c.fbPaused === false) {
      setFbStatus("syncing");
      var cur = dataRef.current;
      fbInitialLoad(c, cur).then(function (res) {
        if (res.status === "pushed") {
          setFbStatus("ok");
        } else if (res.status === "skip") {
          
          setFbStatus("ok");
          setTimeout(function() { preloadImages(dataRef, setData, stSave, selRef.current); }, 2000);
        } else if (res.status === "ok" && res.data) {
          
          var remote = migrateData(res.data);
          
          var _lv = (cur && typeof cur._v === "number") ? cur._v : 0;
          var _rv = (remote && typeof remote._v === "number") ? remote._v : 0;
          if (_lv > _rv && _lv - _rv > 1000) {
            console.log("[FB] saveCfg reconnect: local is newer (lv=" + _lv + " > rv=" + _rv + "), pushing local to remote");
            fbPut(c, cur)["catch"](function(e){ console.warn("fbPut(local-wins) failed:", e); });
            setFbStatus("ok");
            setTimeout(function() { preloadImages(dataRef, setData, stSave, selRef.current); }, 2000);
          } else {
            var _mr2 = _mergeRemoteMeta(cur, remote);
            console.log("[FB] saveCfg reconnect: merged remote into local");
            setData(_mr2);
            stSave(_mr2);
            dataRef.current = _mr2;
            setFbStatus("ok");
            setTimeout(function() { preloadImages(dataRef, setData, stSave, selRef.current); }, 2000);
          }
        } else setFbStatus("err");
        startPolling(c);
      })["catch"](function (e) {
        console.warn("Firebase reconnect failed:", e);
        setFbStatus("err");
        startPolling(c);
      });
    } else if (c && c.fbUrl && c.fbPaused !== false) {
      setFbStatus("paused");
    } else setFbStatus("none");
  };
  
  useEffect(function() {
    try {
      if (localStorage.getItem("sn_nikkei_chart_cleaned_v1") === "1") return;
      var d = dataRef.current;
      if (d && d.charts) {
        var _changed = false;
        var _newCharts = Object.assign({}, d.charts);
        Object.keys(_newCharts).forEach(function(key) {
          if (key.indexOf("日経平均株価_") === 0) {
            var _ch = _newCharts[key];
            if (_ch && (_ch.chartImg || (_ch.chartImgs && _ch.chartImgs.length > 0))) {
              _newCharts[key] = Object.assign({}, _ch, { chartImg: null, chartImgs: [] });
              _changed = true;
              console.log("[cleanup] removed nikkei chartImg from", key);
            }
          }
        });
        if (_changed) save(Object.assign({}, d, { charts: _newCharts }));
      }
      localStorage.setItem("sn_nikkei_chart_cleaned_v1", "1");
    } catch(e) { console.warn("[cleanup] nikkei chart cleanup error:", e); }
  }, []);

  useEffect(function() {
    try {
      var d = dataRef.current;
      if (!d || !d.custom) return;
      var na = d.custom.newsImgAutoDelete || {};
      if (na.enabled !== true) return;
      if (fbStatus !== "ok") return;
      if (!d.trades || !Object.keys(d.trades).length) return;
      var today = todayStr();
      if (localStorage.getItem("sn_news_autoprune_day_v1") === today) return;
      var period = (typeof na.periodDays === "number" && na.periodDays > 0) ? na.periodDays : 7;
      var cutoffMs = Date.now() - period * 86400000;
      var r = _snAutoPruneNewsImages(d, cutoffMs);
      // 2026-08-03d 画像0枚でも「空になった札の掃除(emptied)」だけで走らせる必要があるので count 単独判定をやめた。
      //   過去のpruneで残ったゴースト札は画像がもう無い＝count は永久に0のままなので、旧条件だと一生掃除されなかった。
      if ((!r.count && !r.emptied) || r.data === d) { localStorage.setItem("sn_news_autoprune_day_v1", today); return; }
      var label = (period % 7 === 0) ? (period / 7 + "週間") : (period + "日");
      var firstRun = localStorage.getItem("sn_news_autoprune_ack_v1") !== "1";
      var _doPrune = function() {
      save(r.data);
      localStorage.setItem("sn_news_autoprune_day_v1", today);
      console.log("[autoprune] removed news image refs:", r.count, "/ swept empty cards:", r.emptied || 0);
      try {
        var _cfgNow = cfgRef.current;
        var _after = dataRef.current;
        Promise.resolve(fbPut(_cfgNow, _after)).then(function() {
          return _snReclaimPrunedStorage(d, _after, _cfgNow);
        }).then(function(res) {
          if (res && res.deleted) console.log("[autoprune] reclaimed storage:", res.deleted, "objs /", res.freed, "bytes");
          else if (res && res.aborted) console.log("[autoprune] storage reclaim skipped (will retry next open):", res.aborted);
        })["catch"](function(e2) { console.warn("[autoprune] reclaim error:", e2); });
      } catch(e3) { console.warn("[autoprune] reclaim setup error:", e3); }
      };
      if (firstRun) {
        // 2026-08-03d 画像0枚・空札だけの回でも文面が成立するよう条件分岐（旧＝常に「ニュース画像 0枚 を削除します」と出てしまう）
        var _msg = "ニュース画像の自動削除がオンになっています。\n\n"
          + (r.count ? ("追加から" + label + "を過ぎたニュース画像 " + r.count + "枚 を削除します。\n") : "")
          + (r.emptied ? ("画像が消えて空になったニュース枠 " + r.emptied + "件 を削除します（本文・タグが入っている枠は残ります）。\n") : "")
          + "「この記事を保存」した記事は、画像もまとめて残ります。テキスト・タグ・記録は消えません。\n\n削除しますか？（設定でオフ／期間変更できます）";
        window._snConfirm(_msg).then(function(_ok){
          if (!_ok) { localStorage.setItem("sn_news_autoprune_day_v1", today); return; }
          localStorage.setItem("sn_news_autoprune_ack_v1", "1");
          _doPrune();
        });
      } else {
        _doPrune();
      }
    } catch(e) { console.warn("[autoprune] error:", e); }
  }, [fbStatus]);

  // 未参照(孤児)画像の自動削除（2026-07-05）: 起動時に約intervalDays日ごと、どの記録/リモート/CAからも参照されないnotebook-images画像をFirebase Storageから削除。
  // dataは変更しない（既に参照が無い実体を消すだけ）ので save/push は不要。安全ガードは手動整理(_runStDelete)と同一＝remoteOk/caOk falseなら中止・参照0件疑いなら中止・作成日不明は残す。初回のみ確認。
  useEffect(function() {
    try {
      if (window.__snOrphanGcAttempted) return;                       // 同一セッションでは1回だけ着手
      var d = dataRef.current;
      if (!d || !d.custom) return;
      var oad = d.custom.orphanAutoDelete || {};
      if (oad.enabled !== true) return;                               // 設定オフ
      if (fbStatus !== "ok") return;                                  // 同期が整うまで待つ
      if (!_fbStorageRef) return;                                     // Storage未設定
      if (!d.charts && !d.trades) return;                             // データ未読込＝安全側で中止
      var interval = (typeof oad.intervalDays === "number" && oad.intervalDays > 0) ? oad.intervalDays : 7;
      var lastAt = Number(localStorage.getItem("sn_orphan_autogc_at_v1") || 0);
      if (lastAt && (Date.now() - lastAt) < interval * 86400000) return;   // 頻度: 前回からinterval日未満はスキップ
      window.__snOrphanGcAttempted = true;
      var grace = (typeof oad.graceDays === "number" && oad.graceDays >= 0) ? oad.graceDays : 7;
      var _cfg = cfgRef.current;
      if (!_cfg || !_cfg.fbUrl) return;                               // リモート参照を確認できない構成では自動削除しない（安全側・手動より厳しめ）
      var _stamp = function() { try { localStorage.setItem("sn_orphan_autogc_at_v1", String(Date.now())); } catch(e) {} };
      _snStorageAudit(d, _cfg).then(function(r) {
        try {
          if (!r || !r.ok) { console.warn("[orphan-gc] audit failed:", r && r.reason); return; }   // 失敗はstampせず次回起動で再試行
          if (_cfg && _cfg.fbUrl && (r.remoteOk === false || r.caOk === false)) { console.log("[orphan-gc] skipped: remote/CA unconfirmed"); return; }
          if (r.refSetSize === 0 && r.total > 0) { console.log("[orphan-gc] skipped: no refs resolved"); return; }
          var cutoff = Date.now() - grace * 86400000;
          var delable = (r.orphans || []).filter(function(o) { return o.created && o.created < cutoff; });
          if (!delable.length) { _stamp(); return; }                  // 対象なし＝正常完了
          var bytes = delable.reduce(function(s, o) { return s + (o.size || 0); }, 0);
          var _mb = (bytes >= 1048576) ? (bytes / 1048576).toFixed(2) + " MB" : Math.round(bytes / 1024) + " KB";
          var firstRun = localStorage.getItem("sn_orphan_autogc_ack_v1") !== "1";
          if (firstRun) {
            window._snConfirm("未参照（孤児）画像の自動削除がオンになっています。\n\nどの記録・分析ツールからも参照されていない画像 " + delable.length + "枚（約" + _mb + "）をFirebase Storageから削除します。\n表示中の画像・記録には影響しません。作成から" + grace + "日以上前のものだけが対象です。\n\n削除しますか？（設定でオフにできます）").then(function(_okc){
            if (!_okc) { _stamp(); return; }                            // 断られたら今回はスキップ（次回interval後に再確認）
            localStorage.setItem("sn_orphan_autogc_ack_v1", "1");
            _doGc();
            });
          } else { _doGc(); }
          function _doGc() {
          _snStorageDeleteOrphans(delable, grace, Date.now()).then(function(res) {
            _stamp();
            console.log("[orphan-gc] deleted:", res.deleted, "/", res.freed, "bytes", res.errs ? ("errs " + res.errs) : "");
          })["catch"](function(e2) { console.warn("[orphan-gc] delete error:", e2); });
          }
        } catch(e1) { console.warn("[orphan-gc] handler error:", e1); }
      })["catch"](function(e0) { console.warn("[orphan-gc] audit error:", e0); });
    } catch(e) { console.warn("[orphan-gc] error:", e); }
  }, [fbStatus]);

    var exportData = function exportData() {
    var b = new Blob([JSON.stringify(dataRef.current, null, 2)], {
      type: "application/json"
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "scalping_" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  var importData = function importData(e) {
    var f = e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function (ev) {
      try {
        save(migrateData(JSON.parse(ev.target.result)));
        window._snAlert("インポート完了！");
      } catch (_unused0) {
        window._snAlert("ファイル形式エラー");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  };
  var prev = function prev() {
    if (cM === 0) {
      setCY(cY - 1);
      setCM(11);
    } else setCM(cM - 1);
  };
  var next = function next() {
    if (cM === 11) {
      setCY(cY + 1);
      setCM(0);
    } else setCM(cM + 1);
  };
  var prevYear = function() { setCY(cY - 1); };
  var nextYear = function() { setCY(cY + 1); };
  var goToday = function() {
    var now = new Date();
    setCY(now.getFullYear());
    setCM(now.getMonth());
    setSel(todayStr());
    setSelTab("news");
  };
  
  // 2026-08-17 ホームの月次チップを想定損益（100株換算）基準へ。
  //   旧＝ signal.realizedPnl だけを見ていた＝実現損益がほぼ未記録のこのデータでは過去月でもほぼ0円で出ており、
  //   さらに item.pnl（取引テーブル側の損益）も拾っていなかった。集計は _snMonthPnlAgg / _snDailyPnlMap（app-05）へ一本化＝
  //   カレンダーの日次バッジ・📊今月の損益パネル・このチップの3か所が同じ1つの関数を見る＝数字が食い違いようがない。
  //   戻り値: final/finalCnt/win/loss/even（想定損益）・real/realRaw/realCnt（実現損益）・cnt（エントリー件数）・bizTotal/bizDone（営業日数）ほか。
  var _mAgg = useMemo(function() {
    return _snMonthPnlAgg(data, cY, cM);
  }, [data, cY, cM]);
  if (loading) return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      fontSize: 15,
      color: "#888"
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D...");
  var mp = cY + "-" + String(cM + 1).padStart(2, "0");
  // ホームの4チップ（2026-08-17）。上段＝主値／下段＝小書き。全て _mAgg の1つの戻り値から出す。
  //   「1日あたり」の分母は経過営業日 bizDone（当月は途中なので全体で割ると過少に出る）。過去月は bizDone=bizTotal。
  //   下段にグレードバッジを付けるのは「1日あたり」だけ。月の合計額に通常スケール（S=2501円〜）を当てても全部Sになって意味が無いため。
  var _mIsCurMonth = (cY === new Date().getFullYear() && cM === new Date().getMonth());
  var _mPerDay = _mAgg.bizDone > 0 ? Math.round(_mAgg.final / _mAgg.bizDone) : null;
  var _mRealPerDay = (_mAgg.bizDone > 0 && _mAgg.realCnt > 0) ? Math.round(_mAgg.realRaw / _mAgg.bizDone) : null;   // 実現の1日あたりは**実額**基準 2026-08-17f（チップ主値と単位を揃える）
  var _mWinPct = _mAgg.finalCnt > 0 ? Math.round(_mAgg.win / _mAgg.finalCnt * 100) : null;
  var _mRealTxt = _mAgg.realCnt > 0
    ? (_snYen(_mAgg.real) + "（100株換算・" + _mAgg.realCnt + "件 / 実額 " + _snYen(_mAgg.realRaw) + "）")
    : "未記録";
  var _homeChips = [
    { la: "損益", v: _snYen(_mAgg.final), c: _snPnlCol(_mAgg.final),
      sub: _mPerDay != null ? ("1日 " + _snYen(_mPerDay)) : null,
      subGrade: _mPerDay != null ? _profitGradeFromPnl(_mPerDay, _mAgg.finalCnt) : null,
      title: "想定損益の合計（100株換算）。記録帳・💰全体損益と同じ基準です"
        + "\n母数 " + _mAgg.finalCnt + "件 / 記録のあった日 " + _mAgg.tradedDays + "日"
        + "\n実現損益 " + _mRealTxt
        + (_mAgg.oldRuleCnt > 0 ? ("\n⚠️ 集計ルールが変わる前の記録を " + _mAgg.oldRuleCnt + "件 含みます（記録帳の全体損益ではこの期間を合計から外しているため数字が一致しません）") : "")
        + (_mPerDay != null ? ("\n1日あたり " + _snYen(_mPerDay) + " ＝ 想定損益 ÷ 経過営業日 " + _mAgg.bizDone + "日") : "") },
    // 2026-08-17b 実現損益を独立チップへ（ユーザー要望）。見送りの仮想損益も入る想定損益と違い、これだけが「実際に約定した額」。
    // 2026-08-17f 3段化（ユーザー要望「実額を上・100株換算を下・1営業日換算も」）:
    //   主値＝**実額**（実際に動いたお金＝一番知りたい額）／2段目＝100株換算（他の欄と単位を揃えた比較用）／3段目＝1日あたり。
    //   ⚠️1日あたりは**実額基準**（主値と単位を揃える）。損益チップの「1日」は想定損益＝100株換算基準なので、2つは単位が違う。
    //   分母はどちらも経過営業日(bizDone)で共通＝日数の取り方だけは食い違わない。
    { la: "実現", v: _mAgg.realCnt > 0 ? _snYen(_mAgg.realRaw) : "—", c: _mAgg.realCnt > 0 ? _snPnlCol(_mAgg.realRaw) : "#bbb",
      sub: _mAgg.realCnt > 0 ? ("100株 " + _snYen(_mAgg.real)) : "未記録",
      sub2: (_mAgg.realCnt > 0 && _mRealPerDay != null) ? ("1日 " + _snYen(_mRealPerDay)) : null,
      title: _mAgg.realCnt > 0
        ? ("実際に約定した損益（" + _mAgg.realCnt + "件）"
          + "\n上段＝実額 " + _snYen(_mAgg.realRaw) + "（実際に動いたお金）"
          + "\n中段＝100株換算 " + _snYen(_mAgg.real) + "（株数の違いをならした比較用）"
          + (_mRealPerDay != null ? ("\n下段＝1日あたり " + _snYen(_mRealPerDay) + " ＝ 実額 ÷ 経過営業日 " + _mAgg.bizDone + "日") : "")
          + (_mAgg.realHasShares ? "" : "\n⚠ 株数が入っていない記録があります（換算できないぶんは実額のまま足しています）"))
        : "この月は実現損益が1件も入っていません。左の損益は記録から計算した値です" },
    { la: "取引", v: _mAgg.cnt + "件", c: "#1a1a1a",
      sub: _mAgg.bizDone > 0 ? ("1日 " + (Math.round(_mAgg.cnt / _mAgg.bizDone * 10) / 10) + "件") : null,
      title: "エントリーした件数。損益の母数（想定損益のある記録）は " + _mAgg.finalCnt + "件です"
        + "\n見送りの記録も損益には算入されるため、2つの件数は一致しません" },
    { la: "勝率", v: _mWinPct != null ? (_mWinPct + "%") : "—", c: "#1a1a1a",
      sub: _mAgg.finalCnt > 0 ? (_mAgg.win + "勝" + _mAgg.loss + "敗") : null,
      title: "想定損益がプラスの件数 ÷ 想定損益のある件数（" + _mAgg.win + "/" + _mAgg.finalCnt + "）"
        + (_mAgg.even ? ("\n同値 " + _mAgg.even + "件は分母に含みます") : "") },
    { la: "営業日", v: _mIsCurMonth ? (_mAgg.bizDone + "/" + _mAgg.bizTotal + "日") : (_mAgg.bizTotal + "日"), c: "#1a1a1a",
      sub: _mIsCurMonth ? ("残" + Math.max(0, _mAgg.bizTotal - _mAgg.bizDone) + "日") : null,
      title: "この月の営業日数（土日と祝日・休場を除いた日数）。祝日はカレンダーの紫バッジと同じ計算結果を使っています"
        + (_mIsCurMonth ? ("\n経過 " + _mAgg.bizDone + "日 / 全体 " + _mAgg.bizTotal + "日") : "") }
  ];
  var _snSyncTxt = _snLastSync ? ("最終同期 " + _snLastSync.getHours() + ":" + String(_snLastSync.getMinutes()).padStart(2, "0")) : (cfg.fbUrl ? "未同期" : "");
  var fbBadge = cfg.fbUrl ? React.createElement("span", {
    title: (_snOnline ? "" : "オフライン中（接続が戻ると自動同期）。") + _snSyncTxt,
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "6px 10px",
      borderRadius: 6,
      border: "1px solid",
      color: !_snOnline ? "#6B7280" : fbStatus === "ok" ? "#166534" : fbStatus === "syncing" ? "#92400E" : "#991B1B",
      background: !_snOnline ? "#F3F4F6" : fbStatus === "ok" ? "#F0FDF4" : fbStatus === "syncing" ? "#FFFBEB" : "#FEF2F2",
      borderColor: !_snOnline ? "#D1D5DB" : fbStatus === "ok" ? "#A7F3D0" : fbStatus === "syncing" ? "#FDE68A" : "#FECACA"
    }
  }, !_snOnline ? "📴 オフライン" : fbStatus === "ok" ? "🔥 同期済" : fbStatus === "syncing" ? "⏳ 同期中" : "⚠️ 接続エラー") : React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, React.createElement("button", {
    onClick: exportData,
    style: {
      padding: "7px 11px",
      fontSize: 12,
      background: "#f5f4f0",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      color: "#666",
      minHeight: IS_TOUCH ? 40 : 32
    }
  }, "\uD83D\uDCE4"), React.createElement("button", {
    onClick: function onClick() {
      return fileRef.current && fileRef.current.click();
    },
    style: {
      padding: "7px 11px",
      fontSize: 12,
      background: "#f5f4f0",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      color: "#666",
      minHeight: IS_TOUCH ? 40 : 32
    }
  }, "\uD83D\uDCE5"), React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: ".json",
    style: {
      display: "none"
    },
    onChange: importData
  }));

  // 2026-08-17i ヘッダ上段の右端に寄せるツール群（ユーザー要望「検索・設定・同期済を今日ボタンの右に右寄せ」）。
  //   旧＝KPIチップと同じ行の末尾に並んでいて、チップが増えるたび折り返して⚙と🔥だけが2段目に落ちていた。
  //   月ナビ行の最後に marginLeft:"auto" で入れる＝チップの数に影響されない固定位置になる。
  var _snHeadTools = React.createElement("div", {
    key: "headtools",
    style: { display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexShrink: 0 }
  },
    React.createElement("button", {
      onClick: function() { setShowSearch(true); },
      title: "検索",
      style: {
        padding: "6px 11px", fontSize: 13, fontWeight: 600,
        background: "#EEF2FF", border: "1.5px solid #C7D2FE", borderRadius: 7,
        cursor: "pointer", color: "#4338CA", minHeight: IS_TOUCH ? 40 : 32
      }
    }, "🔍"),
    React.createElement("button", {
      onClick: function() { setShowSettings(true); },
      title: "設定",
      style: {
        padding: "6px 10px", fontSize: 16,
        background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 7,
        cursor: "pointer", minHeight: IS_TOUCH ? 40 : 32
      }
    }, "⚙️"),
    fbBadge);

  return React.createElement("div", {
    style: {
      fontFamily: "-apple-system,'Helvetica Neue',sans-serif",
      color: "#1a1a1a",
      width: "100%",
      minHeight: "100vh"
    }
  },
  showSettings && React.createElement(SettingsModal, {
    cfg: cfg,
    onSave: saveCfg,
    data: data,
    save: save,
    onClose: function onClose() {
      return setShowSettings(false);
    }
  }),
  // 2026-07-20 _SnDialogは必ず sel/showEntryLog の三項分岐の「外」（ルート直下）に置く。
  // ホーム分岐の中に置くとDayView/記録帳では描画されず、_snConfirm等がPromise未解決のまま無反応になる（削除ボタンが効かない不具合の真因）。
  snDlg && React.createElement(_SnDialog, {
    dlg: snDlg,
    onDone: function(result) { var _r = snDlg.resolve; setSnDlg(null); if (_r) _r(result); }
  }), sel ? React.createElement(DayView, {
    date: sel,
    data: data,
    save: save,
    onBack: function onBack() {
      
      
      
      try { _stFlush(); } catch(e) {}
      setSel(null);
      setSelTab("news");
      setShowEntryLog(false);
      setShowStockHistory(false);
      setShowNewsHistory(false);
      setShowSummaryHistory(false);
      try {
        if (!window.history.state || window.history.state._sn !== "root") {
          window.history.replaceState({ _sn: "root" }, "");
        }
      } catch(e2) {}
    },
    onSelectDate: function onSelectDate(d, stock, tab) {
      setSel(d);
      if (tab) setSelTab(tab);
    },
    cfg: cfg,
    initialTab: selTab,
    onOpenEntryLog: function() {
      try { _stFlush(); } catch(e) {}
      setSel(null);
      setSelTab("news");
      setShowEntryLog(true);
    }
  }) : showEntryLog ? React.createElement(EntryLogView, {
    data: data,
    save: save,
    onBack: function() {
      try { window.history.back(); } catch(e) {
        try { _stFlush(); } catch(e2) {}
        setShowEntryLog(false);
      }
    },
    onSelectDate: function(d, tab) {
      try { _stFlush(); } catch(e) {}
      setShowEntryLog(false);
      setSel(d);
      setSelTab(tab || "trades");
    },
    onSelectStock: function(stock) {
      try { _stFlush(); } catch(e) {}
      try { localStorage.setItem("sn_shv_stock_v1", stock); } catch(e2) {}
      setShowEntryLog(false);
      setShowStockHistory(true);
    }
  }) : showStockHistory ? React.createElement(StockHistoryView, {
    data: data,
    save: save,
    cfg: cfg,
    onBack: function() {
      try { window.history.back(); } catch(e) {
        try { _stFlush(); } catch(e2) {}
        setShowStockHistory(false);
      }
    },
    onSelectDate: function(d, tab) {
      try { _stFlush(); } catch(e) {}
      setShowStockHistory(false);
      setSel(d);
      setSelTab(tab || "news");
    }
  }) : showNewsHistory ? React.createElement(NewsHistoryView, {
    data: data,
    save: save,
    onBack: function() {
      try { window.history.back(); } catch(e) {
        try { _stFlush(); } catch(e2) {}
        setShowNewsHistory(false);
      }
    },
    onSelectDate: function(d, tab) {
      try { _stFlush(); } catch(e) {}
      setShowNewsHistory(false);
      setSel(d);
      setSelTab(tab || "news");
    },
    onJumpToStock: function(stockName) {
      try { _stFlush(); } catch(e) {}
      setShowNewsHistory(false);
      setShowStockHistory(true);
      
      try { localStorage.setItem("sn_shv_stock_v1", stockName || ""); } catch(e){}
    }
  }) : showSummaryHistory ? React.createElement(SummaryHistoryView, {
    data: data,
    save: save,
    onBack: function() {
      try { window.history.back(); } catch(e) {
        try { _stFlush(); } catch(e2) {}
        setShowSummaryHistory(false);
      }
    },
    onSelectDate: function(d, tab) {
      try { _stFlush(); } catch(e) {}
      setShowSummaryHistory(false);
      setSel(d);
      setSelTab(tab || "events");
    }
  }) : React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
      flexWrap: "wrap",
      gap: 8
    }
  }, React.createElement("div", { style: { flex: "1 1 100%" } }, React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#999",
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 4
    }
  }, "SCALPING NOTEBOOK"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, React.createElement("button", {
    onClick: prevYear,
    style: {
      background: "none",
      border: "none",
      fontSize: 18,
      cursor: "pointer",
      color: "#aaa",
      padding: "0 2px",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "\u00AB"), React.createElement("button", {
    onClick: prev,
    style: {
      background: "none",
      border: "none",
      fontSize: 26,
      cursor: "pointer",
      color: "#888",
      padding: "0 4px",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "\u2039"), React.createElement("span", {
    style: {
      fontSize: IS_TOUCH ? 18 : 21,
      fontWeight: 700,
      minWidth: 100,
      textAlign: "center"
    }
  }, cY, "\u5E74", cM + 1, "\u6708"), React.createElement("button", {
    onClick: next,
    style: {
      background: "none",
      border: "none",
      fontSize: 26,
      cursor: "pointer",
      color: "#888",
      padding: "0 4px",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "\u203A"), React.createElement("button", {
    onClick: nextYear,
    style: {
      background: "none",
      border: "none",
      fontSize: 18,
      cursor: "pointer",
      color: "#aaa",
      padding: "0 2px",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "\u00BB"), React.createElement("span", {
    title: "\u3053\u306E\u6708\u306E\u55B6\u696D\u65E5\u6570\uFF08\u571F\u65E5\u3068\u795D\u65E5\u30FB\u4F11\u5834\u3092\u9664\u3044\u305F\u65E5\u6570\uFF09\u3002\u795D\u65E5\u306F\u30AB\u30EC\u30F3\u30C0\u30FC\u306E\u7D2B\u30D0\u30C3\u30B8\u3068\u540C\u3058\u8A08\u7B97\u7D50\u679C\u3092\u4F7F\u3063\u3066\u3044\u307E\u3059"
      + (_mIsCurMonth ? ("\n\u7D4C\u904E " + _mAgg.bizDone + "\u65E5 / \u5168\u4F53 " + _mAgg.bizTotal + "\u65E5 / \u6B8B\u308A " + Math.max(0, _mAgg.bizTotal - _mAgg.bizDone) + "\u65E5") : ""),
    style: {
      marginLeft: 8,
      padding: "3px 8px",
      fontSize: 10.5,
      fontWeight: 700,
      background: "#F5F3FF",
      color: "#5B21B6",
      border: "1px solid #DDD6FE",
      borderRadius: 6,
      whiteSpace: "nowrap"
    }
  }, _snBizDaysLabel(_mAgg, cY, cM)), React.createElement("button", {
    onClick: goToday,
    style: {
      marginLeft: 8,
      padding: "4px 10px",
      fontSize: 11,
      fontWeight: 700,
      background: "#EEF2FF",
      color: "#4338CA",
      border: "1px solid #C7D2FE",
      borderRadius: 6,
      cursor: "pointer",
      minHeight: IS_TOUCH ? 36 : 26
    }
  }, "\u4ECA\u65E5"), _snHeadTools)),
  // 2026-08-18 KPIチップ（見る数字）とボタン（押す入口）を別コンテナへ分離した（配置案D）。
  //   旧＝両者が同じ flex-wrap 行に同居していて、次の3つが同時に起きていた:
  //   (1) どのボタンが2行目へ落ちるかがウィンドウ幅で変わる（PCで「メモ·アイディア一覧」「＋予定」だけが落ちていた）
  //   (2) 88pxのチップと36pxのボタンが alignItems:"center" で並び、行の重心が合わない
  //   (3) 右側が大きく余る。
  //   チップは flex をやめて grid で全幅に伸ばす＝右余白が消え、幅が変わっても列が伸縮するだけで折り返しが起きない。
  React.createElement("div", {
    style: { flex: "1 1 100%" }
  }, React.createElement("div", {
    key: "kpis",
    style: {
      display: "grid",
      // 損益・実現だけ1.25倍幅＝いちばん見る2つに重みを付ける。
      //   ⚠️minmax(0,..) を噛ませるのは、fr の既定が minmax(auto,..) で列が中身の最小幅より縮まず、
      //   狭い窓でヘッダごと横にはみ出すため。0 を下限にすると列が素直に縮む。
      //   タッチ端末は auto-fit＝幅が足りなければ2〜3列へ自動で折り返す（iPad縦で5列に潰れない）。
      gridTemplateColumns: IS_TOUCH
        ? "repeat(auto-fit,minmax(130px,1fr))"
        : "minmax(0,1.25fr) minmax(0,1.25fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
      gap: 8,
      alignItems: "stretch"
    }
  }, _homeChips.map(function (ch) {
    return React.createElement("div", {
      key: ch.la,
      title: ch.title,
      style: {
        background: "#f5f4f0",
        borderRadius: 9,
        padding: "8px 12px",
        textAlign: "center",
        minWidth: 62,
        // 2026-08-18 高さの決め打ち(_mChipMinH)は廃止。チップ行が独立したので親の alignItems:"stretch" が使えるようになり、
        //   いちばん背の高いチップ（3段になる実現）に他が自動で揃う＝実現が「—／未記録」の月は行ごと低くなる。
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#8A8578",
        fontWeight: 700,
        letterSpacing: 0.3
      }
    }, ch.la), React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        lineHeight: 1.25,
        color: ch.c
      }
    }, ch.v), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#5F5E5A",
        fontWeight: 700,
        lineHeight: 1.35,
        marginTop: 2,
        minHeight: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        whiteSpace: "nowrap"
      }
    }, ch.subGrade ? _elHoldGradeBadge(ch.subGrade) : null, ch.sub || " "), ch.sub2 ? React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#5F5E5A",
        fontWeight: 700,
        lineHeight: 1.35,
        whiteSpace: "nowrap"
      }
    }, ch.sub2) : null);
  })),
  // 入口ボタンは独立した1行。左の3つは「見る」入口、右端の ＋予定 だけが「作る」操作なので離して置く（押し間違い防止）。
  React.createElement("div", {
    key: "acts",
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 8
    }
  }, React.createElement("button", {
    onClick: function() { setShowEntryLog(true); },
    title: "エントリー記録帳",
    style: {
      padding: "8px 12px",
      fontSize: 12,
      fontWeight: 700,
      background: "#FFF7ED",
      border: "1.5px solid #FDBA74",
      borderRadius: 7,
      cursor: "pointer",
      color: "#9A3412",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "📖 エントリー記録帳"),
  // 2026-08-02 ホームの「📊 銘柄別記録」ボタンを撤去（ユーザー要望）。StockHistoryView自体は残す。
  // 撤去後の入口は【ニュース一覧の記事内・銘柄チップ→onJumpToStock（app-07 NewsHistoryView）】のみ。
  // ※下の onSelectStock（EntryLogViewへ渡している）はEntryLogView側が読んでいない死にpropなので入口にならない。
  // ※履歴トークン"stockhistory"は戻る/進むでの復元用でURLから直接は開けない。
  React.createElement("button", {
    onClick: function() { setShowNewsHistory(true); },
    title: "ニュース一覧（「この記事を保存」した記事をカテゴリ・銘柄で絞り込み）",
    style: {
      padding: "8px 12px",
      fontSize: 12,
      fontWeight: 700,
      background: "#FEF3C7",
      border: "1.5px solid #FCD34D",
      borderRadius: 7,
      cursor: "pointer",
      color: "#92400E",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "📰 ニュース一覧"), React.createElement("button", {
    onClick: function() { setShowSummaryHistory(true); },
    title: "メモ·アイディア一覧（過去の全体メモを時系列で振り返り）",
    style: {
      padding: "8px 12px",
      fontSize: 12,
      fontWeight: 700,
      background: "#F3E8FF",
      border: "1.5px solid #D8B4FE",
      borderRadius: 7,
      cursor: "pointer",
      color: "#6B21A8",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "📝 メモ·アイディア一覧"), React.createElement("button", {
    onClick: function() { setShowHomeEventForm(true); },
    title: "予定を追加",
    style: {
      marginLeft: "auto",
      padding: "8px 14px",
      fontSize: 12,
      fontWeight: 700,
      background: "#10B981",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      color: "#fff",
      minHeight: IS_TOUCH ? 44 : 36
    }
  }, "＋ 予定")))), showSearch ? React.createElement(SearchView, {
    data: data,
    save: save,
    onSelectDate: function onSelectDate(d, tab) {
      setSel(d);
      setSelTab(tab || "news");
      setShowSearch(false);
    },
    onClose: function onClose() {
      return setShowSearch(false);
    }
  }) : React.createElement(Calendar, {
    year: cY,
    month: cM,
    data: data,
    save: save,
    onSelect: function onSelect(d) {
      setSelTab("news");
      setSel(d);
    }
  }), !showSearch && React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 12,
      color: "#bbb",
      textAlign: "center"
    }
  }, cfg.fbUrl ? (cfg.fbPaused !== false ? "⚠️ Firebase同期一時停止中（localStorageのみ）" : "🔥 Firebase同期中（60秒間隔） + Storage") : "⚙️ 設定からFirebase URLを入力するとマルチデバイスで同期できます"), showEntryForm && React.createElement(EntryRecordForm, {
    data: data,
    save: save,
    initial: null,
    onClose: function() { setShowEntryForm(false); }
  }), showHomeEventForm && React.createElement(HomeEventFormModal, {
    data: data,
    save: save,
    onClose: function() { setShowHomeEventForm(false); }
  })));
}

// 2026-07-18 グローバル確認/通知/入力ダイアログ本体（DeleteDlg様式）。dlg={type,message,defaultVal}・onDone(result): confirm→true/false, alert→true, prompt→入力値/null。iPad standaloneでwindow.confirm/prompt/alertが無反応な問題の代替（App が window._snConfirm/_snAlert/_snPrompt を公開）。
function _SnDialog(_p) {
  var dlg = _p.dlg, onDone = _p.onDone;
  var _uv = useState(dlg.defaultVal || ""), val = _uv[0], setVal = _uv[1];
  var isPrompt = dlg.type === "prompt", isAlert = dlg.type === "alert";
  return ReactDOM.createPortal(React.createElement("div", {
    style: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 10050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
    onClick: function() { onDone(isAlert ? true : (isPrompt ? null : false)); }
  }, React.createElement("div", {
    onClick: function(e) { e.stopPropagation(); },
    style: { background: "#fff", borderRadius: 14, padding: "20px 22px", maxWidth: 340, width: "100%", boxSizing: "border-box" }
  },
    React.createElement("div", { style: { fontSize: 13, lineHeight: 1.8, color: "#333", marginBottom: 14, whiteSpace: "pre-wrap" } }, dlg.message),
    isPrompt ? React.createElement("input", {
      type: "text", value: val, autoFocus: true,
      onChange: function(e) { setVal(e.target.value); },
      onKeyDown: function(e) { if (e.key === "Enter") onDone(val); else if (e.key === "Escape") onDone(null); },
      style: { width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: 14, border: "1px solid #ccc", borderRadius: 8, marginBottom: 14 }
    }) : null,
    React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } },
      isAlert ? null : React.createElement("button", {
        onClick: function() { onDone(isPrompt ? null : false); },
        style: { padding: "9px 18px", background: "#f0ede8", color: "#555", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }
      }, "キャンセル"),
      React.createElement("button", {
        onClick: function() { onDone(isPrompt ? val : true); },
        style: { padding: "9px 18px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }
      }, "OK")
    )
  )), document.body);
}

// React エラーバウンダリ（2026-06-29）: どこか1コンポーネントが描画中にthrowしてもアプリ全体を白画面にせず、エラー表示＋再読み込みに切り替える。過去に構文ミスで本番が白画面になった事故の安全網。ES5プロトタイプ方式（このコードはJSXもclass構文も使わないため）。labelを渡すと場所名を表示（個別ビュー用）。
function _SNErrorBoundary(props) { React.Component.call(this, props); this.state = { err: null }; }
_SNErrorBoundary.prototype = Object.create(React.Component.prototype);
_SNErrorBoundary.prototype.constructor = _SNErrorBoundary;
_SNErrorBoundary.getDerivedStateFromError = function(err) { return { err: err }; };
_SNErrorBoundary.prototype.componentDidCatch = function(err, info) { try { console.error("[SN] 画面クラッシュ:", err, info && info.componentStack); } catch (e) {} };
_SNErrorBoundary.prototype.render = function() {
  if (this.state && this.state.err) {
    var _m = (this.state.err && (this.state.err.message || String(this.state.err))) || "不明なエラー";
    return React.createElement("div", { style: { margin: "24px auto", maxWidth: 560, padding: "20px 22px", background: "#FFF7ED", border: "1px solid #FB923C", borderRadius: 12, lineHeight: 1.7 } },
      React.createElement("div", { style: { fontSize: 16, fontWeight: 800, marginBottom: 8, color: "#7C2D12" } }, "⚠ 画面の描画でエラーが発生しました" + (this.props.label ? "（" + this.props.label + "）" : "")),
      React.createElement("div", { style: { fontSize: 12, color: "#9A3412", marginBottom: 6 } }, "データは保存されています（描画だけが失敗しました）。再読み込みで復帰することがあります。"),
      React.createElement("pre", { style: { fontSize: 11, color: "#92400E", whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "8px 10px", margin: "8px 0" } }, _m),
      React.createElement("button", { onClick: function() { try { location.reload(); } catch (e) {} }, style: { padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#fff", background: "#9A3412", border: "none", borderRadius: 8, cursor: "pointer" } }, "🔄 再読み込み"));
  }
  return this.props.children;
};

try { var _ob = document.getElementById("fb-usage-banner"); if (_ob) _ob.remove(); } catch(e){}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(_SNErrorBoundary, null, React.createElement(App, null)));

(function(){
  var _diagOn = false, _diagHL = null;
  document.addEventListener("keydown", function(e){
    if(e.ctrlKey && e.shiftKey && e.key === "D"){
      _diagOn = !_diagOn;
      console.log("[DIAG] Click inspector " + (_diagOn ? "ON — click anywhere to identify element" : "OFF"));
      if(!_diagOn && _diagHL){ _diagHL.remove(); _diagHL = null; }
    }
  });
  document.addEventListener("click", function(e){
    if(!_diagOn) return;
    e.preventDefault(); e.stopPropagation();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if(!el){ console.log("[DIAG] No element at", e.clientX, e.clientY); return; }
    var cs = window.getComputedStyle(el);
    var r = el.getBoundingClientRect();
    console.log("[DIAG] ━━━ Element at (" + e.clientX + ", " + e.clientY + ") ━━━");
    console.log("  Tag:", el.tagName, "| id:", el.id, "| class:", el.className);
    console.log("  Text:", (el.textContent||"").substring(0,60));
    console.log("  Rect:", Math.round(r.left)+"x"+Math.round(r.top), Math.round(r.width)+"×"+Math.round(r.height));
    console.log("  Style: position="+cs.position, "z-index="+cs.zIndex, "opacity="+cs.opacity,
                "pointer-events="+cs.pointerEvents, "overflow="+cs.overflow);
    console.log("  Display:", cs.display, "| visibility:", cs.visibility, "| bg:", cs.backgroundColor);
    
    var p = el.parentElement, depth = 0;
    while(p && depth < 5){
      var ps = window.getComputedStyle(p);
      if(ps.position === "fixed" || ps.position === "absolute" || parseInt(ps.zIndex) > 0){
        var pr = p.getBoundingClientRect();
        console.log("  Parent["+depth+"]:", p.tagName, "pos="+ps.position, "z="+ps.zIndex,
                    "rect="+Math.round(pr.left)+"x"+Math.round(pr.top)+" "+Math.round(pr.width)+"×"+Math.round(pr.height));
      }
      p = p.parentElement; depth++;
    }
    
    if(_diagHL) _diagHL.remove();
    _diagHL = document.createElement("div");
    _diagHL.style.cssText = "position:fixed;left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;" +
      "border:3px solid red;background:rgba(255,0,0,0.15);z-index:999999;pointer-events:none;transition:opacity .5s;";
    document.body.appendChild(_diagHL);
    setTimeout(function(){ if(_diagHL) _diagHL.style.opacity = "0"; }, 2000);
    setTimeout(function(){ if(_diagHL){ _diagHL.remove(); _diagHL = null; } }, 2500);
  }, true); 
})();
