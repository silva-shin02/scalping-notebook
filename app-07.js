function useModalBack(open, onClose, token) {
  
  
  var isCurrentlyOpenRef = useRef(false);
  isCurrentlyOpenRef.current = open;
  useEffect(function() {
    if (!open) return undefined;
    var myToken = "modal:" + token + ":" + Date.now() + ":" + Math.random().toString(36).slice(2,7);
    try { window.history.pushState({ _sn: myToken }, ""); } catch(e) {}
    var closedByPop = { v: false };
    var onPop = function() {
      
      
      if (window._sn_cleanupBack) return;
      closedByPop.v = true;
      try { onClose(); } catch(e) {}
    };
    window.addEventListener("popstate", onPop);
    return function() {
      window.removeEventListener("popstate", onPop);
      if (!closedByPop.v) {
        var _backToken = myToken;
        var _openRef = isCurrentlyOpenRef;
        setTimeout(function() {
          try {
            
            
            
            
            if (!_openRef.current &&
                window.history.state && window.history.state._sn === _backToken) {
              
              
              window._sn_internalBack = true;
              window._sn_cleanupBack  = true;
              window.history.back();
              
              setTimeout(function() {
                window._sn_internalBack = false;
                window._sn_cleanupBack  = false;
              }, 0);
            }
          } catch(e) {}
        }, 0);
      }
    };
  }, [open]);
}


function _shvIsStockNewsTag(t, stock, code) {
  if (!t || !stock) return false;
  var tn = (t.indexOf(":") >= 0) ? t.slice(t.indexOf(":") + 1) : t;
  if (tn === stock) return true;
  if (code && tn === code) return true;
  return false;
}


function _csCollectNewsForStock(trades, custom, stock, date, extraTags, extraCats) {
  if (!stock || !date || !trades) return [];
  var dd = trades[date] || {};
  var ncs = getAllNewsCatsData(dd);
  var info = (typeof _caGetStockInfo === "function") ? _caGetStockInfo(stock, custom) : null;
  var code = info && info.code;
  var extraSet = new Set(extraTags || []);
  var extraNameSet = new Set((extraTags || []).map(function(t) {
    return t.indexOf(":") >= 0 ? t.slice(t.indexOf(":") + 1) : t;
  }));
  
  var subCatRefs = (custom && custom.stockSubCatRefs && Array.isArray(custom.stockSubCatRefs[stock])) ? custom.stockSubCatRefs[stock] : [];
  
  var extraCatMainSet = new Set();
  var extraCatPairSet = new Set();
  (extraCats || []).forEach(function(ck) {
    if (ck.indexOf("::") >= 0) extraCatPairSet.add(ck);
    else extraCatMainSet.add(ck);
  });
  var result = [];
  
  
  var seenKey = {};
  Object.keys(ncs).forEach(function(cat) {
    var nis = (ncs[cat] && ncs[cat].newsItems) || [];
    var catMainHit = extraCatMainSet.has(cat);
    nis.forEach(function(ni) {
      var tags = ni.tags || [];
      
      var match = tags.some(function(t) {
        if (_shvIsStockNewsTag(t, stock, code)) return true;
        if (extraSet.has(t)) return true;
        var tn = t.indexOf(":") >= 0 ? t.slice(t.indexOf(":") + 1) : t;
        if (extraNameSet.has(tn)) return true;
        return false;
      });
      
      if (!match && ni.subCat && subCatRefs.length > 0) {
        match = subCatRefs.some(function(r) {
          return r && r.cat === cat && r.subCat === ni.subCat;
        });
      }
      
      if (!match) {
        if (catMainHit) match = true;
        else if (ni.subCat && extraCatPairSet.has(cat + "::" + ni.subCat)) match = true;
      }
      if (match) {
        
        var key = ni.groupId || ni.id;
        if (key && seenKey[key]) return;
        if (key) seenKey[key] = true;
        result.push({ cat: cat, ni: ni });
      }
    });
  });
  return result;
}

function _ntExtractStockFromTag(t, allStocks) {
  if (!t || !allStocks || !allStocks.length) return null;
  var tn = (t.indexOf(":") >= 0) ? t.slice(t.indexOf(":") + 1) : t;
  if (allStocks.indexOf(tn) >= 0) return tn;
  return null;
}


function _aggregateBarsToDaily(bars1m, dateStr) {
  if (!bars1m || !bars1m.length || !dateStr) return null;
  var open = null, close = null;
  var high = -Infinity, low = Infinity, vol = 0;
  for (var i = 0; i < bars1m.length; i++) {
    var b = bars1m[i];
    if (!b) continue;
    var bo = (b.o != null) ? Number(b.o) : null;
    var bh = (b.h != null) ? Number(b.h) : null;
    var bl = (b.l != null) ? Number(b.l) : null;
    var bc = (b.c != null) ? Number(b.c) : null;
    var bv = (b.v != null) ? Number(b.v) : 0;
    if (bo == null && bc != null) bo = bc;
    if (bc == null && bo != null) bc = bo;
    if (bh == null) bh = Math.max(bo || -Infinity, bc || -Infinity);
    if (bl == null) bl = Math.min(bo || Infinity, bc || Infinity);
    if (open == null && bo != null && !isNaN(bo)) open = bo;
    if (bc != null && !isNaN(bc)) close = bc;
    if (bh != null && !isNaN(bh) && bh > high) high = bh;
    if (bl != null && !isNaN(bl) && bl < low) low = bl;
    if (!isNaN(bv)) vol += bv;
  }
  if (open == null || close == null || !isFinite(high) || !isFinite(low)) return null;
  return {
    date: dateStr, open: open, high: high, low: low, close: close, vol: vol
  };
}


function ChartSectionDailyCandle(_p_csdc) {
  var stock = _p_csdc.stock, data = _p_csdc.data, custom = _p_csdc.custom,
      cfg = _p_csdc.cfg, highlightDate = _p_csdc.highlightDate;
  var _us_csdc1 = useState([]), _us_csdc1A = _slicedToArray(_us_csdc1, 2),
      bars = _us_csdc1A[0], setBars = _us_csdc1A[1];
  var _us_csdc2 = useState(""), _us_csdc2A = _slicedToArray(_us_csdc2, 2),
      status = _us_csdc2A[0], setStatus = _us_csdc2A[1];
  
  var _us_csdc3 = useState([]), _us_csdc3A = _slicedToArray(_us_csdc3, 2),
      caExtraBars = _us_csdc3A[0], setCaExtraBars = _us_csdc3A[1];
  var _us_csdc4 = useState(""), _us_csdc4A = _slicedToArray(_us_csdc4, 2),
      caStatus = _us_csdc4A[0], setCaStatus = _us_csdc4A[1]; 
  var _us_csdc5 = useState(""), _us_csdc5A = _slicedToArray(_us_csdc5, 2),
      caErr = _us_csdc5A[0], setCaErr = _us_csdc5A[1];
  var _dcUpRef = useRef(null);

  useEffect(function() {
    setBars([]); setStatus("");
    if (!stock) return;
    var info = _caGetStockInfo(stock, custom);
    var code = (info && info.code) || "";
    if (!code) { setStatus("no-code"); return; }
    var cached = _dcCacheLoad(code);
    if (cached && cached.csv) {
      setBars(_parseDailyCsv(cached.csv));
      setStatus("loaded");
    }
    if (cfg && cfg.fbUrl) {
      if (!cached) setStatus("loading");
      
      
      var ourAt = (cached && cached.uploadedAt) || 0;
      var _doFullCsvFetch = function() {
        return _dcLoadCsvFromFb(cfg, code).then(function(res) {
          if (!res || !res.csv) { if (!cached) setStatus("no-data"); return; }
          var fbAt = res.uploadedAt || 0;
          if (fbAt > ourAt || !cached) {
            setBars(_parseDailyCsv(res.csv));
            setStatus("loaded");
            _dcCacheSave(code, res.csv, fbAt);
          }
        });
      };
      if (cached && ourAt > 0) {
        _dcLoadCsvUploadedAt(cfg, code).then(function(remoteAt) {
          if (remoteAt > 0 && remoteAt <= ourAt) {
            
            return;
          }
          
          return _doFullCsvFetch();
        }).catch(function(){});
      } else {
        _doFullCsvFetch().catch(function(){});
      }
    } else if (!cached) {
      setStatus("no-data");
    }
  }, [stock, custom, cfg]);
  
  useEffect(function() {
    setCaExtraBars([]); setCaStatus(""); setCaErr("");
  }, [stock]);
  
  
  
  
  var _runCaFetch = function(force) {
    if (!cfg || !cfg.fbUrl) { setCaStatus("none"); setCaErr("Firebase未設定"); return Promise.resolve(); }
    if (!stock) return Promise.resolve();
    var info = _caGetStockInfo(stock, custom);
    var caTicker = (info && info.caTicker) || "";
    var code = (info && info.code) || "";
    if (!caTicker && !code) { setCaStatus("none"); setCaErr("ticker/code未設定"); return Promise.resolve(); }
    setCaStatus("loading"); setCaErr("");
    return _caFetchMeta(cfg, !!force).then(function(metaList) {
      if (!metaList || !metaList.length) { setCaStatus("none"); setCaErr("draftなし"); return null; }
      
      var srcCodeNum = code || _caExtractCode(caTicker);
      var matched = metaList.filter(function(m) {
        if (caTicker && m.ticker === caTicker) return true;
        if (caTicker && m.name && String(m.name).indexOf(caTicker) >= 0) return true;
        if (code && m.name && String(m.name).indexOf(code) >= 0) return true;
        if (code && m.ticker && String(m.ticker).indexOf(code) >= 0) return true;
        if (srcCodeNum) {
          var mc = _caExtractCode(m.ticker) || _caExtractCode(m.name) || _caExtractCode(m.id);
          if (mc && mc === srcCodeNum) return true;
        }
        return false;
      });
      if (!matched.length) { setCaStatus("none"); setCaErr("当銘柄draftなし"); return null; }
      var withDate = matched.map(function(m) {
        return { meta: m, date: _caResolveDate(m) };
      }).filter(function(x) { return /^\d{4}-\d{2}-\d{2}$/.test(x.date); });
      if (!withDate.length) { setCaStatus("none"); setCaErr("日付不明"); return null; }
      
      withDate.sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
      
      var csvDates = {};
      bars.forEach(function(b) { csvDates[b.date] = true; });
      
      var cachedBars = [];
      var toFetch = [];
      withDate.forEach(function(item) {
        if (csvDates[item.date] && !force) return;
        var cb = _caBarCacheGet(item.meta.id);
        if (cb && !force) {
          cachedBars.push(cb);
        } else {
          toFetch.push(item);
        }
      });
      
      var dedupByDate = function(arr) {
        var byDate = {};
        arr.forEach(function(b) {
          if (!byDate[b.date] || (b.fetchedAt || 0) > (byDate[b.date].fetchedAt || 0)) byDate[b.date] = b;
        });
        return Object.keys(byDate).sort().map(function(d) { return byDate[d]; });
      };
      
      setCaExtraBars(dedupByDate(cachedBars));
      if (!toFetch.length) {
        setCaStatus("ok"); setCaErr(cachedBars.length ? "" : "新規CAなし");
        return cachedBars;
      }
      console.log("[DCC] CA fetch all drafts:", stock, "cached=" + cachedBars.length, "toFetch=" + toFetch.length);
      
      var fetchPromises = toFetch.map(function(item) {
        return _caFetchDraftData(cfg, item.meta.id, !!force).then(function(dd) {
          if (!dd) return null;
          var bars1m = (dd.analysisData && dd.analysisData.bars_1m) || dd.bars_1m;
          if (!bars1m || !bars1m.length) return null;
          var agg = _aggregateBarsToDaily(bars1m, item.date);
          if (!agg) return null;
          agg.fetchedAt = Date.now();
          _caBarCacheSet(item.meta.id, agg);
          return agg;
        }).catch(function(err) {
          console.warn("[DCC] draft fetch failed for id=" + item.meta.id, err);
          return null;
        });
      });
      return Promise.all(fetchPromises).then(function(fetched) {
        var ok = fetched.filter(function(x) { return x; });
        var all = dedupByDate(cachedBars.concat(ok));
        setCaExtraBars(all);
        setCaStatus("ok");
        setCaErr(ok.length ? "" : (cachedBars.length ? "" : "取得失敗"));
        return all;
      });
    }).catch(function(e) {
      console.warn("[DCC] _runCaFetch error:", e);
      setCaStatus("error");
      setCaErr(e && e.message ? e.message : "取得エラー");
    });
  };
  
  var _todayJST = useMemo(function() {
    var d = new Date();
    var jst = new Date(d.getTime() + (9 * 60 + d.getTimezoneOffset()) * 60000);
    var y = jst.getFullYear(), mo = jst.getMonth() + 1, da = jst.getDate();
    return y + "-" + String(mo).padStart(2, "0") + "-" + String(da).padStart(2, "0");
  }, []);
  var _autoTriggeredRef = useRef("");
  useEffect(function() {
    if (!cfg || !cfg.fbUrl) return;
    if (status !== "loaded" && status !== "no-data") return;
    var info = _caGetStockInfo(stock, custom);
    if (!info || (!info.caTicker && !info.code)) return;
    
    var key = stock + "|" + status;
    if (_autoTriggeredRef.current === key) return;
    _autoTriggeredRef.current = key;
    _runCaFetch(false);
    
  }, [status, stock, cfg]);
  
  var displayBars = useMemo(function() {
    if (!caExtraBars || !caExtraBars.length) return bars;
    if (!bars.length) {
      
      var sorted = caExtraBars.slice().sort(function(a, b) { return a.date < b.date ? -1 : 1; });
      return sorted;
    }
    var existDates = {};
    bars.forEach(function(b) { existDates[b.date] = true; });
    var merged = bars.slice();
    caExtraBars.forEach(function(eb) {
      if (!existDates[eb.date]) {
        merged.push(eb);
        existDates[eb.date] = true;
      }
    });
    merged.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
    return merged;
  }, [bars, caExtraBars]);
  
  var recordedDates = useMemo(function() {
    var s = new Set();
    var charts = data.charts || {};
    Object.keys(charts).forEach(function(k) {
      var idx = k.lastIndexOf("_");
      if (idx < 0) return;
      var nm = k.slice(0, idx), dt = k.slice(idx + 1);
      if (nm !== stock) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) return;
      var c = charts[k];
      if (c && (c.chartImg || (c.chartImgs && c.chartImgs.length) || c.macroLocal ||
          (c.stockTags && c.stockTags.length) || (c.signals && c.signals.length) ||
          (c.chartMemoHtml && c.chartMemoHtml.length > 0) ||
          (c.chartMemo && (_hasText(c.chartMemo.text) || (c.chartMemo.images && c.chartMemo.images.length))))) {
        s.add(dt);
      }
    });
    return s;
  }, [stock, data.charts]);
  var tradeDates = useMemo(function() {
    var m = {};
    var trades = data.trades || {};
    Object.keys(trades).forEach(function(dt) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) return;
      var dd = trades[dt] || {};
      var its = dd.items || [];
      var pnl = 0, matched = false;
      its.forEach(function(it) {
        if (it && it.stock === stock) {
          matched = true;
          var p = parseFloat(it.pnl);
          if (!isNaN(p)) pnl += p;
        }
      });
      if (matched) m[dt] = pnl;
    });
    return m;
  }, [stock, data.trades]);
  
  var canCaFetch = !!(cfg && cfg.fbUrl) && (function() {
    var info = _caGetStockInfo(stock, custom);
    return !!(info && (info.caTicker || info.code));
  })();
  if (status === "no-code") return null;
  var _dcInfoR = _caGetStockInfo(stock, custom);
  var _dcCodeR = (_dcInfoR && _dcInfoR.code) || "";
  // 手動で日足CSVを補充する（📥日足データを取得＝Hyper SBI 2のTimeChart形式CSVをエクスプローラーから選択）2026-06-30。
  // CSVは丸ごと置き換え（全期間の書き出し前提）。CA当日分(caExtraBars)はdisplayBarsで別途マージされるので維持される。
  var _dcUploadCsv = function(file) {
    if (!file) return;
    if (!_dcCodeR) { window._snAlert("この銘柄に証券コードが設定されていません。設定 → 銘柄管理から登録してください。"); return; }
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      var parsed = _parseDailyCsv(text);
      if (!parsed.length) { window._snAlert("CSV を解析できませんでした。Hyper SBI 2 の TimeChart 形式（日付,始値,高値,安値,終値,…）であることを確認してください。"); return; }
      var now = Date.now();
      setBars(parsed); setStatus("loaded");
      _dcCacheSave(_dcCodeR, text, now);
      if (cfg && cfg.fbUrl) {
        _dcSaveCsvToFb(cfg, _dcCodeR, text).then(function(ok) { if (ok) console.log("[DCC] CSV synced to Firebase: " + _dcCodeR); });
      }
    };
    reader.onerror = function() { window._snAlert("ファイル読み込み失敗"); };
    reader.readAsText(file, "UTF-8");
  };
  var _dcUploadBar = (canCaFetch || _dcCodeR) ? React.createElement("div", {
    style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11, color: "#888", flexWrap: "wrap" }
  },
    _dcCodeR && React.createElement("input", {
      key: "dcup", ref: _dcUpRef, type: "file", accept: ".csv,text/csv", style: { display: "none" },
      onChange: function(e) { var f = e.target.files && e.target.files[0]; if (f) _dcUploadCsv(f); e.target.value = ""; }
    }),
    _dcCodeR && React.createElement("button", {
      key: "dcupbtn",
      onClick: function() { if (_dcUpRef.current) _dcUpRef.current.click(); },
      title: "Hyper SBI 2 でエクスポートした日足CSV（TimeChart形式）を選んで補充。既存の日足は置き換わります（CA当日分は維持）。",
      style: {
        padding: "3px 9px", fontSize: 11, fontWeight: 600,
        background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE",
        borderRadius: 5, cursor: "pointer", minHeight: IS_TOUCH ? 34 : 0
      }
    }, "📥 日足データを取得"),
    canCaFetch && React.createElement("button", {
      onClick: function() { _runCaFetch(true); },
      disabled: caStatus === "loading",
      title: "chart-annotator から最新日足を取得して末尾に追加",
      style: {
        padding: "3px 9px", fontSize: 11, fontWeight: 600,
        background: caStatus === "loading" ? "#f5f4f0" : "#FFF7ED",
        color: caStatus === "loading" ? "#bbb" : "#C2410C",
        border: "1px solid " + (caStatus === "loading" ? "#ddd" : "#FDBA74"),
        borderRadius: 5,
        cursor: caStatus === "loading" ? "wait" : "pointer"
      }
    }, caStatus === "loading" ? "取得中..." : "🔄 CA分を再取得"),
    caExtraBars.length > 0 && React.createElement("span", {
      style: { color: "#16A34A", fontWeight: 700 },
      title: caExtraBars.map(function(b) {
        return b.date + ": O" + b.open + " H" + b.high + " L" + b.low + " C" + b.close;
      }).join("\n")
    }, caExtraBars.length === 1
      ? "✓ " + caExtraBars[0].date + " 自動追加"
      : "✓ CA " + caExtraBars.length + "日分追加 (" + caExtraBars[0].date + " 〜 " + caExtraBars[caExtraBars.length - 1].date + ")"),
    caStatus === "error" && React.createElement("span", {
      style: { color: "#C0392B" }
    }, "エラー: " + caErr),
    caStatus === "none" && caErr && React.createElement("span", {
      style: { color: "#999" }
    }, caErr)
  ) : null;
  if (!displayBars.length) {
    if (!_dcUploadBar) return null;
    return React.createElement("div", { style: { marginTop: 8 } },
      _dcUploadBar,
      React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 2 } },
        caStatus === "loading" ? "📊 当日分のチャートを取得中..." :
        caStatus === "error" ? ("📊 取得エラー: " + caErr) :
        _dcCodeR ? "📊 日足データ未登録 — 「📥 日足データを取得」から Hyper SBI 2 の CSV を読み込めます" :
        ("📊 " + (caErr || "日足データなし")))
    );
  }
  return React.createElement("div", { style: { marginTop: 8 } },
    _dcUploadBar,
    React.createElement(DailyCandleChart, {
      bars: displayBars,
      recordedDates: recordedDates,
      tradeDates: tradeDates,
      showSparse: false,
      highlightDate: highlightDate
    })
  );
}









function _parseDailyCsv(text) {
  if (!text) return [];
  
  text = String(text).replace(/^\uFEFF/, "").trim();
  if (!text) return [];
  var lines = text.split(/\r?\n/);
  if (!lines.length) return [];
  
  var parseLine = function(s) {
    var cells = [], cur = "", inQ = false;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === '"') { inQ = !inQ; continue; }
      if (c === "," && !inQ) { cells.push(cur); cur = ""; continue; }
      cur += c;
    }
    cells.push(cur);
    return cells;
  };
  var num = function(s) {
    if (s == null) return NaN;
    var n = parseFloat(String(s).replace(/,/g, ""));
    return isNaN(n) ? NaN : n;
  };
  var rows = [];
  for (var i = 1; i < lines.length; i++) { 
    var cells = parseLine(lines[i]);
    if (cells.length < 5) continue;
    var dateStr = String(cells[0] || "").trim();
    if (!dateStr) continue;
    
    var dateNorm = dateStr.replace(/\//g, "-");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateNorm)) continue;
    var o = num(cells[1]), h = num(cells[2]), l = num(cells[3]), c = num(cells[4]);
    if (isNaN(o) || isNaN(h) || isNaN(l) || isNaN(c)) continue;
    rows.push({
      date: dateNorm,
      open: o, high: h, low: l, close: c,
      ma5: num(cells[5]), ma25: num(cells[6]), ma75: num(cells[7]),
      vwap: num(cells[8]), vol: num(cells[9])
    });
  }
  
  rows.sort(function(a, b) { return a.date.localeCompare(b.date); });
  return rows;
}


function _bizDaysBetween(a, b) {
  if (!a || !b) return 0;
  var da = new Date(a + "T00:00:00"), db = new Date(b + "T00:00:00");
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return 0;
  if (da > db) { var t = da; da = db; db = t; }
  var n = 0, cur = new Date(da);
  while (cur < db) {
    cur.setDate(cur.getDate() + 1);
    var dw = cur.getDay();
    if (dw !== 0 && dw !== 6) n++;
  }
  return n;
}



var _dcVerifiedStocks = {}; 
function _dcSaveCsvToFb(cfg, stockCode, csvText) {
  if (!cfg || !cfg.fbUrl || !stockCode || !csvText) return Promise.resolve(false);
  var base = cfg.fbUrl.replace(/\/$/, "") + "/scalping-notebook-daily-csv/" + encodeURIComponent(stockCode) + ".json";
  var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
  var payload = { csv: csvText, uploadedAt: Date.now() };
  return fetch(base + auth, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function(r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return true;
  }).catch(function(e) {
    console.warn("[DC] save csv failed:", e);
    return false;
  });
}



function _dcLoadCsvUploadedAt(cfg, stockCode) {
  if (!cfg || !cfg.fbUrl || !stockCode) return Promise.resolve(0);
  var base = cfg.fbUrl.replace(/\/$/, "") + "/scalping-notebook-daily-csv/" + encodeURIComponent(stockCode) + "/uploadedAt.json";
  var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
  return fetch(base + auth).then(function(r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function(j) {
    return typeof j === "number" ? j : 0;
  }).catch(function() { return 0; });
}


function _dcLoadCsvFromFb(cfg, stockCode) {
  if (!cfg || !cfg.fbUrl || !stockCode) return Promise.resolve(null);
  var base = cfg.fbUrl.replace(/\/$/, "") + "/scalping-notebook-daily-csv/" + encodeURIComponent(stockCode) + ".json";
  var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
  return fetch(base + auth).then(function(r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function(j) {
    return j ? { csv: j.csv || "", uploadedAt: j.uploadedAt || 0 } : null;
  }).catch(function(e) {
    console.warn("[DC] load csv failed:", e);
    return null;
  });
}

function _dcCacheLoad(stockCode) {
  if (!stockCode) return null;
  try {
    var s = localStorage.getItem("sn_dc_csv_v1_" + stockCode);
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}
function _dcCacheSave(stockCode, csv, uploadedAt) {
  if (!stockCode) return;
  try {
    localStorage.setItem("sn_dc_csv_v1_" + stockCode, JSON.stringify({
      csv: csv, uploadedAt: uploadedAt || Date.now()
    }));
  } catch(e){}
}










function _calcEMA(bars, period) {
  if (!bars || bars.length === 0) return [];
  var alpha = 2 / (period + 1);
  var emas = new Array(bars.length).fill(null);
  if (bars.length < period) return emas;

  var initSum = 0;
  for (var i = 0; i < period; i++) initSum += bars[i].close;
  emas[period - 1] = initSum / period;
  
  for (var i = period; i < bars.length; i++) {
    emas[i] = alpha * bars[i].close + (1 - alpha) * emas[i - 1];
  }
  return emas;
}


function _pickPriceStep(range) {
  if (!range || range <= 0) return 50;
  var bases = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000];
  var target = range / 8; 
  for (var i = 0; i < bases.length; i++) {
    if (bases[i] >= target) return bases[i];
  }
  return bases[bases.length - 1];
}

function DailyCandleChart(_props_dcc) {
  var allBars = _props_dcc.bars || [];
  var recordedDates = _props_dcc.recordedDates || new Set();
  var tradeDates = _props_dcc.tradeDates || {};
  var initialShowSparse = _props_dcc.showSparse || false;
  var highlightDate = _props_dcc.highlightDate || "";
  var onDateClick = _props_dcc.onDateClick;
  
  
  var _us1 = useState("3m"), _us1A = _slicedToArray(_us1, 2),
      range = _us1A[0], setRange = _us1A[1];
  var _us2 = useState(initialShowSparse), _us2A = _slicedToArray(_us2, 2),
      showSparse = _us2A[0], setShowSparse = _us2A[1];
  var _us3 = useState({ on: false, x: 0, y: 0, idx: -1 }), _us3A = _slicedToArray(_us3, 2),
      tooltip = _us3A[0], setTooltip = _us3A[1];
  
  
  var _us5 = useState(null), _us5A = _slicedToArray(_us5, 2),
      xZoom = _us5A[0], setXZoom = _us5A[1]; 
  var _us6 = useState(null), _us6A = _slicedToArray(_us6, 2),
      yZoom = _us6A[0], setYZoom = _us6A[1]; 
  var _us7 = useState(0), _us7A = _slicedToArray(_us7, 2),
      viewStart = _us7A[0], setViewStart = _us7A[1];
  var _us8 = useState(0), _us8A = _slicedToArray(_us8, 2),
      pShift = _us8A[0], setPShift = _us8A[1];
  var _us9 = useState(900), _us9A = _slicedToArray(_us9, 2),
      measuredWrapW = _us9A[0], setMeasuredWrapW = _us9A[1];
  
  var svgRef = useRef(null);
  var wrapRef = useRef(null);
  
  
  var _useStateFC = useState(false), _useStateFCA = _slicedToArray(_useStateFC, 2),
      focused = _useStateFCA[0], setFocused = _useStateFCA[1];
  var focusedRef = useRef(false);
  useEffect(function() { focusedRef.current = focused; }, [focused]);
  
  useEffect(function() {
    if (!focused) return;
    var onDocMD = function(e) {
      var w = wrapRef.current;
      if (w && e.target && w.contains(e.target)) return;
      setFocused(false);
    };
    var onKey = function(e) { if (e.key === "Escape") setFocused(false); };
    document.addEventListener("mousedown", onDocMD);
    document.addEventListener("touchstart", onDocMD);
    document.addEventListener("keydown", onKey);
    return function() {
      document.removeEventListener("mousedown", onDocMD);
      document.removeEventListener("touchstart", onDocMD);
      document.removeEventListener("keydown", onKey);
    };
  }, [focused]);
  var didInitRef = useRef(false);
  var dragRef = useRef(null);   
  var pinchRef = useRef(null);  
  var _chartRef = useRef({});
  
  var sourceData = useMemo(function() {
    if (showSparse) {
      return allBars.filter(function(r) { return recordedDates.has(r.date); });
    }
    return allBars;
  }, [allBars, recordedDates, showSparse]);
  
  var displayBars = useMemo(function() {
    if (!sourceData.length) return [];
    var sliced;
    if (range === "all") sliced = sourceData.slice();
    else if (range === "1m") sliced = sourceData.slice(-30);
    else if (range === "3m") sliced = sourceData.slice(-90);
    else if (range === "6m") sliced = sourceData.slice(-180);
    else if (range === "1y") sliced = sourceData.slice(-250);
    else sliced = sourceData.slice();
    var fullEma9 = _calcEMA(sourceData, 9);
    var fullEma22 = _calcEMA(sourceData, 22);
    var fullEma50 = _calcEMA(sourceData, 50);
    var fullEma200 = _calcEMA(sourceData, 200);
    var startIdx = sourceData.length - sliced.length;
    return sliced.map(function(b, i) {
      var srcIdx = startIdx + i;
      return Object.assign({}, b, {
        ema9: fullEma9[srcIdx], ema22: fullEma22[srcIdx],
        ema50: fullEma50[srcIdx], ema200: fullEma200[srcIdx]
      });
    });
  }, [sourceData, range]);
  
  var _usEma = useState({ ema9: true, ema22: true, ema50: true, ema200: true }),
      _usEmaA = _slicedToArray(_usEma, 2),
      emaShow = _usEmaA[0], setEmaShow = _usEmaA[1];
  
  var W = Math.max(measuredWrapW, 320);
  var H = 360;
  var volH = 80;
  var padL = 50, padR = 50, padT = 20, padB = 20;
  var priceTop = padT, priceBot = H - volH - padB;
  var priceH = priceBot - priceTop;
  var volTop = priceBot + 4, volBot = H - padB;
  var volBoxH = volBot - volTop;
  var innerW = W - padL - padR;
  
  var BASE_SLOT_W = 8;
  var Z_MIN = 0.10, Z_MAX = 8.0;
  var Y_MIN = 0.5, Y_MAX = 4.0;
  
  var autoFitXZoom = useMemo(function() {
    if (!displayBars.length) return 1.0;
    var z = innerW / (displayBars.length * BASE_SLOT_W);
    return Math.max(Z_MIN, Math.min(Z_MAX, z));
  }, [displayBars.length, innerW]);
  var effectiveXZoom = xZoom != null ? xZoom : autoFitXZoom;
  var effectiveYZoom = yZoom != null ? yZoom : 1.0;
  var slotW = BASE_SLOT_W * effectiveXZoom;
  
  var viewSpan = innerW / slotW;
  
  var viewEnd = Math.min(displayBars.length, viewStart + viewSpan);
  
  var priceRange = useMemo(function() {
    if (!displayBars.length) return null;
    var s = Math.max(0, Math.floor(viewStart));
    var e = Math.min(displayBars.length, Math.ceil(viewEnd) + 1);
    if (s >= e) return null;
    var lo = Infinity, hi = -Infinity;
    for (var i = s; i < e; i++) {
      var b = displayBars[i];
      if (!b) continue;
      if (b.low < lo) lo = b.low;
      if (b.high > hi) hi = b.high;
    }
    if (!isFinite(lo) || !isFinite(hi)) return null;
    if (lo === hi) { lo -= 1; hi += 1; }
    return { lo: lo, hi: hi };
  }, [displayBars, viewStart, viewEnd]);
  
  var priceMapped = useMemo(function() {
    if (!priceRange) return null;
    var lo = priceRange.lo, hi = priceRange.hi;
    var dataSpan = hi - lo;
    var paddedSpan = dataSpan * 1.1;
    
    var visSpan = paddedSpan / effectiveYZoom;
    var midData = (lo + hi) / 2;
    
    var midShifted = midData + (pShift * (paddedSpan - visSpan) / 2);
    return {
      pmin: midShifted - visSpan / 2,
      pmax: midShifted + visSpan / 2,
      visSpan: visSpan,
      dataSpan: dataSpan
    };
  }, [priceRange, effectiveYZoom, pShift]);
  
  var pToY = function(p) {
    if (!priceMapped) return priceTop;
    var pmin = priceMapped.pmin, pmax = priceMapped.pmax;
    if (pmax === pmin) return priceTop + priceH / 2;
    return priceTop + (1 - (p - pmin) / (pmax - pmin)) * priceH;
  };
  
  var iToX = function(i) {
    return padL + (i - viewStart) * slotW + slotW / 2;
  };
  
  var xToI = function(x) {
    return viewStart + (x - padL - slotW / 2) / slotW;
  };
  
  var clampViewStart = function(vs, vSpan, total) {
    var maxStart = Math.max(0, total - vSpan);
    if (vs < 0) return 0;
    if (vs > maxStart) return maxStart;
    return vs;
  };
  var clampPShift = function(ps, yz) {
    
    if (yz <= 1.0) return 0;
    return Math.max(-1, Math.min(1, ps));
  };
  
  _chartRef.current = {
    effectiveXZoom: effectiveXZoom, effectiveYZoom: effectiveYZoom,
    autoFitXZoom: autoFitXZoom, displayBarsLen: displayBars.length,
    innerW: innerW, viewStart: viewStart, pShift: pShift
  };
  
  useEffect(function() {
    if (!wrapRef.current) return;
    var update = function() {
      if (!wrapRef.current) return;
      var w = wrapRef.current.clientWidth;
      if (w > 50 && w !== measuredWrapW) setMeasuredWrapW(w);
    };
    update();
    var ro = (typeof ResizeObserver !== "undefined") ? new ResizeObserver(update) : null;
    if (ro) ro.observe(wrapRef.current);
    var t1 = setTimeout(update, 100);
    var t2 = null;
    window.addEventListener("resize", update);
    return function() {
      clearTimeout(t1); clearTimeout(t2);
      if (ro) try { ro.disconnect(); } catch(e){}
      window.removeEventListener("resize", update);
    };
  }, []);
  
  useEffect(function() {
    setXZoom(null); setYZoom(null); setViewStart(0); setPShift(0);
    didInitRef.current = false;
  }, [range, showSparse]);
  
  var _lastDateForInit = displayBars.length ? displayBars[displayBars.length - 1].date : "";
  useEffect(function() {
    didInitRef.current = false;
  }, [_lastDateForInit]);
  
  useEffect(function() {
    if (didInitRef.current) return;
    if (!displayBars.length || !priceRange || innerW < 50) return;
    var z = xZoom != null ? xZoom : autoFitXZoom;
    var curSlotW = BASE_SLOT_W * z;
    var curViewSpan = innerW / curSlotW;
    var newVS;
    if (highlightDate) {
      var idx = -1;
      for (var i = 0; i < displayBars.length; i++) {
        if (displayBars[i].date === highlightDate) { idx = i; break; }
      }
      if (idx >= 0) {
        newVS = idx - curViewSpan / 2 + 0.5;
      } else {
        newVS = Math.max(0, displayBars.length - curViewSpan);
      }
    } else {
      newVS = Math.max(0, displayBars.length - curViewSpan);
    }
    newVS = clampViewStart(newVS, curViewSpan, displayBars.length);
    setViewStart(newVS);
    didInitRef.current = true;
  }, [displayBars.length, priceRange, innerW, autoFitXZoom, xZoom, highlightDate]);
  
  useEffect(function() {
    if (!didInitRef.current) return;
    if (!priceRange || innerW < 50) return;
    var curSlotW = BASE_SLOT_W * effectiveXZoom;
    var curViewSpan = innerW / curSlotW;
    setViewStart(function(vs) { return clampViewStart(vs, curViewSpan, displayBars.length); });
    setPShift(function(ps) { return clampPShift(ps, effectiveYZoom); });
    if (xZoom != null && xZoom < autoFitXZoom) setXZoom(autoFitXZoom);
  }, [innerW, effectiveXZoom, effectiveYZoom, autoFitXZoom, displayBars.length]);
  
  
  useEffect(function() {
    var wrap = wrapRef.current;
    if (!wrap) return;
    var onWheel = function(e) {
      if (!focusedRef.current) return; 
      e.preventDefault();
      var _cr = _chartRef.current;
      var _xz = _cr.effectiveXZoom, _yz = _cr.effectiveYZoom;
      var _afz = _cr.autoFitXZoom, _iw = _cr.innerW, _bl = _cr.displayBarsLen;
      if (e.shiftKey) {
        
        var dx = e.deltaY * 0.5;
        setViewStart(function(vs) {
          var curSlotW2 = BASE_SLOT_W * _xz;
          var curViewSpan2 = _iw / curSlotW2;
          var nvs = vs + dx / curSlotW2;
          return clampViewStart(nvs, curViewSpan2, _bl);
        });
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        
        setPShift(function(ps) {
          var nps = ps - e.deltaY * 0.002;
          return clampPShift(nps, _yz);
        });
        return;
      }
      
      var rect = wrap.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var _sw = BASE_SLOT_W * _xz;
      var iCenter = _cr.viewStart + (mx - padL - _sw / 2) / _sw;
      var factor = Math.exp(-e.deltaY * 0.002);
      var newXZ = Math.max(Z_MIN, Math.min(Z_MAX, _xz * factor));
      
      if (newXZ < _afz) newXZ = _afz;
      var actualFactor = newXZ / _xz;
      
      var newSlotW = BASE_SLOT_W * newXZ;
      var newViewSpan = _iw / newSlotW;
      var newVS = iCenter - (mx - padL - newSlotW / 2) / newSlotW;
      newVS = clampViewStart(newVS, newViewSpan, _bl);
      setXZoom(newXZ);
      setViewStart(newVS);
      
      var newYZ = Math.max(Y_MIN, Math.min(Y_MAX, _yz * actualFactor));
      setYZoom(newYZ);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return function() {
      try { wrap.removeEventListener("wheel", onWheel, { passive: false }); } catch(e){}
    };
  }, []);
  
  useEffect(function() {
    var wrap = wrapRef.current;
    if (!wrap) return;
    var onTouchStart = function(e) {
      if (!focusedRef.current) setFocused(true);
      var _cr = _chartRef.current;
      if (e.touches.length === 1) {
        var t = e.touches[0];
        dragRef.current = { type: "pan", startX: t.clientX, startY: t.clientY,
          startVS: _cr.viewStart, startPShift: _cr.pShift };
        pinchRef.current = null;
      } else if (e.touches.length === 2) {
        var t1 = e.touches[0], t2 = e.touches[1];
        var dx = t1.clientX - t2.clientX, dy = t1.clientY - t2.clientY;
        var dist = Math.sqrt(dx*dx + dy*dy);
        var midX = (t1.clientX + t2.clientX) / 2;
        var rect = wrap.getBoundingClientRect();
        var midRel = midX - rect.left;
        var _sw = BASE_SLOT_W * _cr.effectiveXZoom;
        pinchRef.current = {
          dist: dist, midX: midRel,
          startXZ: _cr.effectiveXZoom, startYZ: _cr.effectiveYZoom,
          startVS: _cr.viewStart, iCenter: _cr.viewStart + (midRel - padL - _sw / 2) / _sw
        };
        dragRef.current = null;
      }
    };
    var onTouchMove = function(e) {
      var _cr = _chartRef.current;
      var _xz = _cr.effectiveXZoom, _yz = _cr.effectiveYZoom;
      var _afz = _cr.autoFitXZoom, _iw = _cr.innerW, _bl = _cr.displayBarsLen;
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        var t1 = e.touches[0], t2 = e.touches[1];
        var dx = t1.clientX - t2.clientX, dy = t1.clientY - t2.clientY;
        var dist = Math.sqrt(dx*dx + dy*dy);
        var p = pinchRef.current;
        var ratio = dist / Math.max(1, p.dist);
        var newXZ = Math.max(Z_MIN, Math.min(Z_MAX, p.startXZ * ratio));
        if (newXZ < _afz) newXZ = _afz;
        var actualFactor = newXZ / p.startXZ;
        var newSlotW = BASE_SLOT_W * newXZ;
        var newViewSpan = _iw / newSlotW;
        var newVS = p.iCenter - (p.midX - padL - newSlotW / 2) / newSlotW;
        newVS = clampViewStart(newVS, newViewSpan, _bl);
        setXZoom(newXZ);
        setViewStart(newVS);
        var newYZ = Math.max(Y_MIN, Math.min(Y_MAX, p.startYZ * actualFactor));
        setYZoom(newYZ);
      } else if (e.touches.length === 1 && dragRef.current && dragRef.current.type === "pan") {
        e.preventDefault();
        var t = e.touches[0];
        var d = dragRef.current;
        var dxp = t.clientX - d.startX;
        var dyp = t.clientY - d.startY;
        var curSlotW2 = BASE_SLOT_W * _xz;
        var curViewSpan2 = _iw / curSlotW2;
        var newVS2 = d.startVS - dxp / curSlotW2;
        newVS2 = clampViewStart(newVS2, curViewSpan2, _bl);
        setViewStart(newVS2);
        
        
        if (_yz > 1.0 && priceH > 1) {
          var yRange = priceH * (_yz - 1);
          if (yRange > 1) {
            var dPShift = 2 * dyp / yRange;
            var newPS = clampPShift(d.startPShift + dPShift, _yz);
            setPShift(newPS);
          }
        }
      }
    };
    var onTouchEnd = function(e) {
      if (e.touches.length === 0) { dragRef.current = null; pinchRef.current = null; }
      else if (e.touches.length === 1) { pinchRef.current = null; }
    };
    wrap.addEventListener("touchstart", onTouchStart, { passive: false });
    wrap.addEventListener("touchmove", onTouchMove, { passive: false });
    wrap.addEventListener("touchend", onTouchEnd);
    wrap.addEventListener("touchcancel", onTouchEnd);
    return function() {
      try { wrap.removeEventListener("touchstart", onTouchStart, { passive: false }); } catch(e){}
      try { wrap.removeEventListener("touchmove", onTouchMove, { passive: false }); } catch(e){}
      try { wrap.removeEventListener("touchend", onTouchEnd); } catch(e){}
      try { wrap.removeEventListener("touchcancel", onTouchEnd); } catch(e){}
    };
  }, []);
  
  var onMouseDown = function(e) {
    if (!focused) setFocused(true);
    dragRef.current = { type: "pan", startX: e.clientX, startY: e.clientY,
      startVS: viewStart, startPShift: pShift };
  };
  useEffect(function() {
    var onMove = function(e) {
      if (!dragRef.current || dragRef.current.type !== "pan") return;
      var _cr = _chartRef.current;
      var d = dragRef.current;
      var dx = e.clientX - d.startX;
      var dy = e.clientY - d.startY;
      var curSlotW2 = BASE_SLOT_W * _cr.effectiveXZoom;
      var curViewSpan2 = _cr.innerW / curSlotW2;
      var newVS = d.startVS - dx / curSlotW2;
      newVS = clampViewStart(newVS, curViewSpan2, _cr.displayBarsLen);
      setViewStart(newVS);
      
      if (_cr.effectiveYZoom > 1.0 && priceH > 1) {
        var yRange = priceH * (_cr.effectiveYZoom - 1);
        if (yRange > 1) {
          var dPShift = 2 * dy / yRange;
          var newPS = clampPShift(d.startPShift + dPShift, _cr.effectiveYZoom);
          setPShift(newPS);
        }
      }
    };
    var onUp = function() { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return function() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);
  
  var onMouseMove = function(e) {
    if (dragRef.current) return; 
    var rect = wrapRef.current && wrapRef.current.getBoundingClientRect();
    if (!rect) return;
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var i = Math.round(xToI(mx));
    if (i < 0 || i >= displayBars.length) { setTooltip({ on: false, x: 0, y: 0, idx: -1 }); return; }
    setTooltip({ on: true, x: mx, y: my, idx: i });
  };
  var onMouseLeave = function() { setTooltip({ on: false, x: 0, y: 0, idx: -1 }); };
  
  
  var visStart = Math.max(0, Math.floor(viewStart) - 1);
  var visEnd = Math.min(displayBars.length, Math.ceil(viewEnd) + 1);
  var halfBarPx = (slotW * 0.7) / 2;
  
  var priceLabels = useMemo(function() {
    if (!priceMapped) return [];
    var pmin = priceMapped.pmin, pmax = priceMapped.pmax;
    var span = pmax - pmin;
    if (span <= 0) return [];
    var step = Math.pow(10, Math.floor(Math.log10(span / 5)));
    var rough = span / 5;
    if (rough / step >= 5) step *= 5;
    else if (rough / step >= 2) step *= 2;
    var first = Math.ceil(pmin / step) * step;
    var labels = [];
    for (var p = first; p <= pmax; p += step) {
      labels.push(p);
      if (labels.length > 20) break;
    }
    return labels;
  }, [priceMapped]);
  
  var EMA_COLORS = { ema9: "#FFFFFF", ema22: "#FF61D2", ema50: "#A78BFA", ema200: "#6D28D9" };
  
  return React.createElement("div", {
    onClick: function() { if (!focused) setFocused(true); },
    style: {
      outline: focused ? "3px solid #FB923C" : "3px solid transparent",
      outlineOffset: 1,
      borderRadius: 11,
      transition: "outline-color 0.15s"
    }
  },
    
    React.createElement("div", {
      style: {
        background: "#1a1a1a", padding: "10px 12px",
        borderRadius: "10px 10px 0 0",
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
        color: "#fff", fontSize: 12
      }
    },
      
      React.createElement("div", { style: { display: "flex", gap: 4 } },
        ["1m", "3m", "6m", "1y", "all"].map(function(k) {
          var label = (k === "1m") ? "1ヶ月" : (k === "3m") ? "3ヶ月" : (k === "6m") ? "6ヶ月"
            : (k === "1y") ? "1年" : "全期間";
          return React.createElement("button", {
            key: k,
            onClick: function() { setRange(k); },
            style: {
              padding: "5px 12px", fontSize: 12, fontWeight: 700,
              background: range === k ? "#A855F7" : "#2a2a2a",
              color: range === k ? "#fff" : "#aaa",
              border: "1px solid " + (range === k ? "#A855F7" : "#3a3a3a"),
              borderRadius: 5, cursor: "pointer"
            }
          }, label);
        })
      ),
      
      React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } },
        React.createElement("span", { style: { fontSize: 11, color: "#888" } }, "EMA"),
        ["ema9", "ema22", "ema50", "ema200"].map(function(k) {
          var label = k.replace("ema", "");
          return React.createElement("label", {
            key: k,
            style: { fontSize: 11, color: emaShow[k] ? EMA_COLORS[k] : "#666",
              fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }
          },
            React.createElement("input", {
              type: "checkbox", checked: !!emaShow[k],
              onChange: function() { setEmaShow(Object.assign({}, emaShow, _defineProperty({}, k, !emaShow[k]))); },
              style: { accentColor: EMA_COLORS[k] }
            }), label
          );
        })
      ),
      
      React.createElement("label", {
        style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11,
          color: showSparse ? "#fff" : "#888", cursor: "pointer", marginLeft: "auto" }
      },
        React.createElement("input", {
          type: "checkbox", checked: showSparse,
          onChange: function() { setShowSparse(!showSparse); }
        }), "記録のみ"
      ),
      
      React.createElement("button", {
        onClick: function() { setXZoom(null); setYZoom(null); setPShift(0);
          if (displayBars.length) {
            var newViewSpan = innerW / (BASE_SLOT_W * autoFitXZoom);
            setViewStart(Math.max(0, displayBars.length - newViewSpan));
          }
        },
        style: { padding: "4px 10px", fontSize: 11, fontWeight: 600,
          background: "#2a2a2a", color: "#aaa",
          border: "1px solid #3a3a3a", borderRadius: 5, cursor: "pointer" }
      }, "↻ フィット")
    ),
    
    React.createElement("div", {
      ref: wrapRef,
      onMouseDown: onMouseDown,
      onMouseMove: onMouseMove,
      onMouseLeave: onMouseLeave,
      style: {
        position: "relative", background: "#0d0d0d",
        borderRadius: "0 0 10px 10px", overflow: "hidden",
        cursor: "grab", touchAction: "none",
        userSelect: "none", WebkitUserSelect: "none"
      }
    },
      !displayBars.length ? React.createElement("div", {
        style: { padding: 30, color: "#666", fontSize: 12, textAlign: "center" }
      }, "データなし") :
      React.createElement("svg", {
        ref: svgRef,
        width: W, height: H,
        viewBox: "0 0 " + W + " " + H,
        style: { display: "block" }
      },
        
        React.createElement("rect", { x: 0, y: 0, width: W, height: H, fill: "#0d0d0d" }),
        
        priceLabels.map(function(p, i) {
          var y = pToY(p);
          return React.createElement("g", { key: "pl" + i },
            React.createElement("line", { x1: padL, y1: y, x2: W - padR, y2: y,
              stroke: "#222", strokeWidth: 0.5 }),
            React.createElement("text", { x: padL - 4, y: y + 3,
              fontSize: 10, fill: "#888", textAnchor: "end" }, "¥" + Math.round(p).toLocaleString()),
            React.createElement("text", { x: W - padR + 4, y: y + 3,
              fontSize: 10, fill: "#888", textAnchor: "start" }, "¥" + Math.round(p).toLocaleString())
          );
        }),
        
        (function() {
          var maxVol = 0;
          for (var i = visStart; i < visEnd; i++) {
            var b = displayBars[i];
            if (b && b.vol && b.vol > maxVol) maxVol = b.vol;
          }
          if (maxVol === 0) return null;
          return React.createElement("text", { x: padL - 4, y: volTop + 10,
            fontSize: 9, fill: "#666", textAnchor: "end" },
            (maxVol >= 100000000) ? Math.round(maxVol / 100000000) + "億"
              : (maxVol >= 10000) ? Math.round(maxVol / 10000) + "万" : maxVol);
        })(),
        
        displayBars.slice(visStart, visEnd).map(function(b, i) {
          var idx = visStart + i;
          var x = iToX(idx);
          var up = b.close >= b.open;
          var color = up ? "#FF005C" : "#00C8FF";
          var yo = pToY(b.open), yc = pToY(b.close), yh = pToY(b.high), yl = pToY(b.low);
          var bodyTop = Math.min(yo, yc), bodyH = Math.max(1, Math.abs(yc - yo));
          var barW = Math.max(1, slotW * 0.7);
          
          var isMon = false, isMonthStart = false;
          try {
            var d = new Date(b.date + "T00:00:00");
            isMon = d.getDay() === 1;
            if (idx > 0) {
              var pd = new Date(displayBars[idx - 1].date + "T00:00:00");
              if (d.getMonth() !== pd.getMonth()) isMonthStart = true;
            }
          } catch(e) {}
          
          var isHighlight = highlightDate && b.date === highlightDate;
          var isRecorded = recordedDates.has(b.date);
          var hasTrade = (b.date in tradeDates);
          var pnl = hasTrade ? tradeDates[b.date] : 0;
          
          var maxVol = 0;
          for (var k = visStart; k < visEnd; k++) {
            var bb = displayBars[k];
            if (bb && bb.vol && bb.vol > maxVol) maxVol = bb.vol;
          }
          var vH = maxVol > 0 ? (b.vol || 0) / maxVol * volBoxH : 0;
          return React.createElement("g", { key: "c" + idx },
            isMonthStart && React.createElement("line", {
              x1: x - slotW / 2, y1: priceTop, x2: x - slotW / 2, y2: volBot,
              stroke: "#333", strokeWidth: 0.5
            }),
            isHighlight && React.createElement("rect", {
              x: x - slotW / 2, y: priceTop, width: slotW, height: H - priceTop - padB,
              fill: "rgba(168, 85, 247, 0.15)"
            }),
            
            React.createElement("line", { x1: x, y1: yh, x2: x, y2: yl, stroke: color, strokeWidth: 1 }),
            
            React.createElement("rect", {
              x: x - barW / 2, y: bodyTop, width: barW, height: bodyH,
              fill: color, stroke: color, strokeWidth: 0.5
            }),
            
            vH > 0 && React.createElement("rect", {
              x: x - barW / 2, y: volBot - vH, width: barW, height: vH,
              fill: color, opacity: 0.6
            }),
            
            hasTrade && React.createElement("circle", {
              cx: x, cy: priceTop + 8, r: 4,
              fill: pnl >= 0 ? "#DC2626" : "#16A34A",
              stroke: "#fff", strokeWidth: 1
            }),
            
            isRecorded && !hasTrade && React.createElement("circle", {
              cx: x, cy: priceTop + 8, r: 3,
              fill: "#A855F7", stroke: "#fff", strokeWidth: 0.5
            })
          );
        }),
        
        ["ema9", "ema22", "ema50", "ema200"].map(function(emaKey) {
          if (!emaShow[emaKey]) return null;
          var pts = [];
          for (var i = visStart; i < visEnd; i++) {
            var b = displayBars[i];
            if (b && b[emaKey] != null && !isNaN(b[emaKey])) {
              pts.push(iToX(i) + "," + pToY(b[emaKey]));
            }
          }
          if (pts.length < 2) return null;
          return React.createElement("polyline", {
            key: emaKey, points: pts.join(" "),
            fill: "none", stroke: EMA_COLORS[emaKey], strokeWidth: 1.2,
            opacity: 0.8
          });
        }),
        
        (function() {
          var labels = [];
          var step = Math.max(1, Math.floor(viewSpan / 8));
          for (var i = visStart; i < visEnd; i += step) {
            var b = displayBars[i];
            if (!b) continue;
            var x = iToX(i);
            if (x < padL - 20 || x > W - padR + 20) continue;
            var d = b.date.slice(5).replace("-", "/");
            labels.push(React.createElement("text", {
              key: "dl" + i, x: x, y: H - 4,
              fontSize: 9, fill: "#888", textAnchor: "middle"
            }, d));
          }
          return labels;
        })()
      ),
      
      tooltip.on && tooltip.idx >= 0 && tooltip.idx < displayBars.length &&
      (function() {
        var b = displayBars[tooltip.idx];
        if (!b) return null;
        var tx = tooltip.x + 10;
        var ty = tooltip.y + 10;
        if (tx > W - 200) tx = tooltip.x - 200;
        return React.createElement("div", {
          style: {
            position: "absolute", left: tx, top: ty,
            background: "rgba(0,0,0,0.9)", color: "#fff",
            padding: "6px 10px", borderRadius: 4, fontSize: 11,
            pointerEvents: "none", zIndex: 10, lineHeight: 1.5,
            fontFamily: "monospace", border: "1px solid #444"
          }
        },
          React.createElement("div", { style: { fontWeight: 700 } }, _fmtDow(b.date)),
          React.createElement("div", null, "始: ¥" + Math.round(b.open).toLocaleString()),
          React.createElement("div", null, "高: ¥" + Math.round(b.high).toLocaleString()),
          React.createElement("div", null, "安: ¥" + Math.round(b.low).toLocaleString()),
          React.createElement("div", null, "終: ¥" + Math.round(b.close).toLocaleString()),
          b.vol && React.createElement("div", null, "出来高: " + b.vol.toLocaleString()),
          (b.date in tradeDates) && React.createElement("div", {
            style: { color: tradeDates[b.date] >= 0 ? "#FF6B9D" : "#5BD4FF", fontWeight: 700 }
          }, "P/L: " + (tradeDates[b.date] >= 0 ? "+" : "") + Math.round(tradeDates[b.date]).toLocaleString())
        );
      })()
    ),
    
    React.createElement("div", {
      style: { fontSize: 10, color: "#888", padding: "6px 12px", background: "#1a1a1a",
        borderRadius: "0 0 10px 10px", borderTop: "1px solid #2a2a2a",
        display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }
    },
      React.createElement("span", null, "ドラッグ: 横移動 / ホイール: ズーム / Shift+ホイール: 横移動 / Ctrl+ホイール: 縦シフト"),
      React.createElement("span", { style: { marginLeft: "auto" } },
        React.createElement("span", { style: { display: "inline-block", width: 8, height: 8,
          borderRadius: "50%", background: "#A855F7", marginRight: 4, verticalAlign: "middle" } }), "記録した日 / ",
        React.createElement("span", { style: { display: "inline-block", width: 8, height: 8,
          borderRadius: "50%", background: "#16A34A", marginRight: 4, verticalAlign: "middle" } }), "取引した日"
      )
    )
  );
}







function _nhvUpdateNi(saveFn, date, cat, niId, updaterFn) {
  saveFn(function(prevData) {
    var prevDd = (prevData.trades && prevData.trades[date]) || {};
    var prevAllCats = getAllNewsCatsData(prevDd);
    var prevCatData = prevAllCats[cat] || { newsItems: [] };
    var prevItems = prevCatData.newsItems || [];
    var newItems = prevItems.map(function(n) {
      if (n.id !== niId) return n;
      var u = (typeof updaterFn === 'function') ? updaterFn(n) : updaterFn;
      return Object.assign({}, n, u);
    });
    var newCatData = Object.assign({}, prevCatData, { newsItems: newItems });
    var newCats = Object.assign({}, prevAllCats);
    newCats[cat] = newCatData;
    var newDd = Object.assign({}, prevDd, { newsCats: newCats });
    var newTrades = Object.assign({}, prevData.trades || {});
    newTrades[date] = newDd;
    return Object.assign({}, prevData, { trades: newTrades });
  });
}


function _nhvDeleteNi(saveFn, date, cat, niId) {
  saveFn(function(prevData) {
    var prevDd = (prevData.trades && prevData.trades[date]) || {};
    var prevAllCats = getAllNewsCatsData(prevDd);
    var prevCatData = prevAllCats[cat] || { newsItems: [] };
    var prevItems = prevCatData.newsItems || [];
    var newItems = prevItems.filter(function(n) { return n.id !== niId; });
    var newCatData = Object.assign({}, prevCatData, { newsItems: newItems });
    var newCats = Object.assign({}, prevAllCats);
    newCats[cat] = newCatData;
    var newDd = Object.assign({}, prevDd, { newsCats: newCats });
    var newTrades = Object.assign({}, prevData.trades || {});
    newTrades[date] = newDd;
    return Object.assign({}, prevData, { trades: newTrades });
  });
}


function _nhvAddNiToDate(saveFn, date, cat, niItem) {
  saveFn(function(prevData) {
    var prevDd = (prevData.trades && prevData.trades[date]) || {};
    var prevAllCats = getAllNewsCatsData(prevDd);
    var prevCatData = prevAllCats[cat] || { marketTags: [], newsItems: [], newsMemo: { text: "", images: [] } };
    var prevItems = prevCatData.newsItems || [];
    var newItems = prevItems.concat([niItem]);
    var newCatData = Object.assign({}, prevCatData, { newsItems: newItems });
    var newCats = Object.assign({}, prevAllCats);
    newCats[cat] = newCatData;
    var newDd = Object.assign({}, prevDd, { newsCats: newCats });
    var newTrades = Object.assign({}, prevData.trades || {});
    newTrades[date] = newDd;
    return Object.assign({}, prevData, { trades: newTrades });
  });
}


function _nhvCollectFlat(trades, cat) {
  if (!trades || !cat) return [];
  var out = [];
  Object.keys(trades).forEach(function(date) {
    var dd = trades[date];
    if (!dd) return;
    var allCats = getAllNewsCatsData(dd);
    var cd = allCats[cat];
    if (!cd) return;
    var items = cd.newsItems || [];
    items.forEach(function(ni) {
      out.push({ date: date, ni: ni });
    });
  });
  return out;
}

function NewsHistoryView(_ref_nhv) {
  var data = _ref_nhv.data,
      save = _ref_nhv.save,
      onBack = _ref_nhv.onBack,
      onSelectDate = _ref_nhv.onSelectDate,
      onJumpToStock = _ref_nhv.onJumpToStock;
  var custom = data.custom || {};
  var trades = data.trades || {};
  var allStocks = (custom.stocks && custom.stocks.length > 0) ? custom.stocks : _DEF_STOCKS_FROZEN;
  var newsCategories = (custom.newsCategories && custom.newsCategories.length > 0) ? custom.newsCategories : _DEF_NEWS_CATS_FROZEN;

  
  var _us_nhvCat = useState(function() {
    try {
      var v = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
      var c = v && v.nhvCat;
      if (c && newsCategories.indexOf(c) >= 0) return c;
    } catch(e){}
    return newsCategories[0] || "マーケット";
  });
  var _us_nhvCatA = _slicedToArray(_us_nhvCat, 2),
      selCat = _us_nhvCatA[0], setSelCat = _us_nhvCatA[1];
  
  if (newsCategories.indexOf(selCat) < 0) {
    selCat = newsCategories[0] || "マーケット";
  }

  
  var _us_nhvSub = useState(function() {
    try {
      var v = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
      if (v && typeof v.nhvSubCatByCat === "object") return v.nhvSubCatByCat || {};
    } catch(e){}
    return {};
  });
  var _us_nhvSubA = _slicedToArray(_us_nhvSub, 2),
      subCatByCat = _us_nhvSubA[0], setSubCatByCat = _us_nhvSubA[1];
  var subCatsForCur = (custom.newsSubCats && Array.isArray(custom.newsSubCats[selCat])) ? custom.newsSubCats[selCat] : [];
  var hasSubCats = subCatsForCur.length > 0;
  var activeSubCat = subCatByCat[selCat] || "__all__";
  if (hasSubCats && activeSubCat !== "__all__" && activeSubCat !== "__none__" && subCatsForCur.indexOf(activeSubCat) < 0) {
    activeSubCat = "__all__";
  }
  var setActiveSubCat = function(sc) {
    var nx = Object.assign({}, subCatByCat);
    nx[selCat] = sc;
    setSubCatByCat(nx);
    try {
      var o = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
      localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, o, { nhvSubCatByCat: nx })));
    } catch(e){}
  };
  
  useEffect(function() {
    try {
      var o = JSON.parse(localStorage.getItem("scalping_view_v1") || "{}");
      localStorage.setItem("scalping_view_v1", JSON.stringify(Object.assign({}, o, { nhvCat: selCat })));
    } catch(e){}
  }, [selCat]);

  
  var _us_nhvDF = useState(""), _us_nhvDFA = _slicedToArray(_us_nhvDF, 2),
      dateFrom = _us_nhvDFA[0], setDateFrom = _us_nhvDFA[1];
  var _us_nhvDT = useState(""), _us_nhvDTA = _slicedToArray(_us_nhvDT, 2),
      dateTo = _us_nhvDTA[0], setDateTo = _us_nhvDTA[1];
  var _us_nhvKw = useState(""), _us_nhvKwA = _slicedToArray(_us_nhvKw, 2),
      keyword = _us_nhvKwA[0], setKeyword = _us_nhvKwA[1];
  var _us_nhvST = useState(new Set()), _us_nhvSTA = _slicedToArray(_us_nhvST, 2),
      selTags = _us_nhvSTA[0], setSelTags = _us_nhvSTA[1];
  var _us_nhvTF = useState(false), _us_nhvTFA = _slicedToArray(_us_nhvTF, 2),
      showTagFilter = _us_nhvTFA[0], setShowTagFilter = _us_nhvTFA[1];
  var _us_nhvSD = useState("desc"), _us_nhvSDA = _slicedToArray(_us_nhvSD, 2),
      sortDir = _us_nhvSDA[0], setSortDir = _us_nhvSDA[1];
  var _us_nhvPO = useState(false), _us_nhvPOA = _slicedToArray(_us_nhvPO, 2),
      pinnedOnly = _us_nhvPOA[0], setPinnedOnly = _us_nhvPOA[1];
  var _us_nhvSO = useState(false), _us_nhvSOA = _slicedToArray(_us_nhvSO, 2),
      starredOnly = _us_nhvSOA[0], setStarredOnly = _us_nhvSOA[1];

  
  var _us_nhvVT = useState(null), _us_nhvVTA = _slicedToArray(_us_nhvVT, 2),
      viewTarget = _us_nhvVTA[0], setViewTarget = _us_nhvVTA[1];
  useModalBack(viewTarget != null, function(){ setViewTarget(null); }, "nhv-view");

  
  var togSelTag = function(t) {
    var n = new Set(selTags);
    if (n.has(t)) n["delete"](t); else n.add(t);
    setSelTags(n);
  };
  var clearAllFilter = function() {
    setDateFrom(""); setDateTo(""); setKeyword(""); setSelTags(new Set()); setPinnedOnly(false); setStarredOnly(false);
  };
  var hasAnyFilter = !!dateFrom || !!dateTo || (keyword || "").trim().length > 0 || selTags.size > 0 || pinnedOnly || starredOnly;

  
  var allFlat = useMemo(function() {
    return _nhvCollectFlat(trades, selCat);
  }, [trades, selCat]);

  
  var filtered = useMemo(function() {
    var arr = allFlat;
    
    if (hasSubCats) {
      if (activeSubCat === "__none__") {
        arr = arr.filter(function(e) {
          return !e.ni.subCat || subCatsForCur.indexOf(e.ni.subCat) < 0;
        });
      } else if (activeSubCat !== "__all__") {
        arr = arr.filter(function(e) { return e.ni.subCat === activeSubCat; });
      }
    }
    
    if (dateFrom) arr = arr.filter(function(e) { return e.date >= dateFrom; });
    if (dateTo)   arr = arr.filter(function(e) { return e.date <= dateTo; });
    
    if (pinnedOnly) arr = arr.filter(function(e) { return !!e.ni.pinned; });
    
    if (starredOnly) arr = arr.filter(function(e) { return !!e.ni.starred; });
    
    if (selTags.size > 0) {
      arr = arr.filter(function(e) {
        var tags = e.ni.tags || [];
        var ok = true;
        selTags.forEach(function(t) { if (tags.indexOf(t) < 0) ok = false; });
        return ok;
      });
    }
    
    var kw = (keyword || "").trim().toLowerCase();
    if (kw) {
      arr = arr.filter(function(e) {
        var hay = ((e.ni.text || "") + " " + (e.ni.tags || []).join(" ")).toLowerCase();
        return hay.indexOf(kw) >= 0;
      });
    }
    
    var sorted = arr.slice().sort(function(a, b) {
      if (a.date !== b.date) {
        return sortDir === "desc" ? (a.date < b.date ? 1 : -1) : (a.date < b.date ? -1 : 1);
      }
      var ia = a.ni.id || 0, ib = b.ni.id || 0;
      return sortDir === "desc" ? (ib - ia) : (ia - ib);
    });
    return sorted;
  }, [allFlat, hasSubCats, activeSubCat, subCatsForCur, dateFrom, dateTo, pinnedOnly, starredOnly, selTags, keyword, sortDir]);

  
  var _nhvCounts = useMemo(function() {
    var pc = 0, sc = 0;
    for (var i = 0; i < filtered.length; i++) {
      if (filtered[i].ni.pinned) pc++;
      if (filtered[i].ni.starred) sc++;
    }
    return { pinned: pc, starred: sc };
  }, [filtered]);
  var totalCount = filtered.length;
  var pinnedCount = _nhvCounts.pinned;
  var starredCount = _nhvCounts.starred;

  
  var subCatCounts = useMemo(function() {
    var m = { __all__: allFlat.length, __none__: 0 };
    subCatsForCur.forEach(function(sc) { m[sc] = 0; });
    allFlat.forEach(function(e) {
      var sc = e.ni.subCat;
      if (!sc || subCatsForCur.indexOf(sc) < 0) m.__none__ = (m.__none__ || 0) + 1;
      else m[sc] = (m[sc] || 0) + 1;
    });
    return m;
  }, [allFlat, subCatsForCur]);

  
  var catCounts = useMemo(function() {
    var m = {};
    newsCategories.forEach(function(c) { m[c] = 0; });
    Object.keys(trades).forEach(function(date) {
      var dd = trades[date]; if (!dd) return;
      var allCats = getAllNewsCatsData(dd);
      Object.keys(allCats).forEach(function(c) {
        var items = (allCats[c].newsItems || []);
        m[c] = (m[c] || 0) + items.length;
      });
    });
    return m;
  }, [trades, newsCategories]);

  
  
  var _splitPinned = useMemo(function() {
    var pin = [], non = [];
    filtered.forEach(function(e) {
      if (e.ni.pinned) pin.push(e); else non.push(e);
    });
    return { pinnedItems: pin, nonPinnedItems: non };
  }, [filtered]);
  var pinnedItems = _splitPinned.pinnedItems;
  var nonPinnedItems = _splitPinned.nonPinnedItems;
  var groupedByDate = useMemo(function() {
    var groups = {};
    nonPinnedItems.forEach(function(e) {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    var dates = Object.keys(groups).sort(function(a, b) {
      return sortDir === "desc" ? (a < b ? 1 : -1) : (a < b ? -1 : 1);
    });
    return dates.map(function(d) { return { date: d, items: groups[d] }; });
  }, [nonPinnedItems, sortDir]);

  
  var allCustomTagOptions = useMemo(function() {
    var s = new Set();
    if (custom.cats && typeof custom.cats === "object") {
      Object.keys(custom.cats).forEach(function(cat) {
        (custom.cats[cat] || []).forEach(function(name) { s.add(cat + ":" + name); });
      });
    }
    (custom.tags || []).forEach(function(t) { if (t) s.add(t); });
    
    return Array.from(s).sort(function(a, b) { return a.localeCompare(b, "ja"); });
  }, [custom.cats, custom.tags]);

  
  var pool = makeTagPoolHandlers(data, save, custom);
  
  var catTagPool = useMemo(function() {
    return { cats: custom.cats || {}, tags: custom.tags || [] };
  }, [custom.cats, custom.tags]);

  
  var togPin = function(date, niId) {
    _nhvUpdateNi(save, date, selCat, niId, function(n) {
      return { pinned: !n.pinned };
    });
  };
  
  var togStar = function(date, niId) {
    _nhvUpdateNi(save, date, selCat, niId, function(n) {
      return { starred: !n.starred };
    });
  };
  
  var setNiSubCat = function(date, niId, newSubCat) {
    if (newSubCat) {
      _nhvUpdateNi(save, date, selCat, niId, { subCat: newSubCat });
    } else {
      
      save(function(prevData) {
        var prevDd = (prevData.trades && prevData.trades[date]) || {};
        var prevAllCats = getAllNewsCatsData(prevDd);
        var prevCatData = prevAllCats[selCat] || { newsItems: [] };
        var prevItems = prevCatData.newsItems || [];
        var newItems = prevItems.map(function(n) {
          if (n.id !== niId) return n;
          var nn = Object.assign({}, n);
          delete nn.subCat;
          return nn;
        });
        var newCatData = Object.assign({}, prevCatData, { newsItems: newItems });
        var newCats = Object.assign({}, prevAllCats);
        newCats[selCat] = newCatData;
        var newDd = Object.assign({}, prevDd, { newsCats: newCats });
        var newTrades = Object.assign({}, prevData.trades || {});
        newTrades[date] = newDd;
        return Object.assign({}, prevData, { trades: newTrades });
      });
    }
  };
  
  var togNiTag = function(date, niId, tag) {
    _nhvUpdateNi(save, date, selCat, niId, function(n) {
      var t = n.tags || [];
      return { tags: t.indexOf(tag) >= 0 ? t.filter(function(x){ return x !== tag; }) : t.concat([tag]) };
    });
  };
  
  var addNiTag = function(date, niId, name, cat) {
    var nm = (name || "").trim();
    if (!nm) return;
    var tag = cat ? (cat + ":" + nm) : ("カスタム:" + nm);
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var cur = prevCustom.cats || {};
      var nc = prevCustom;
      if (cat) {
        if (!(cur[cat] || []).includes(nm)) {
          nc = Object.assign({}, prevCustom, {
            cats: Object.assign({}, cur, _defineProperty({}, cat, (cur[cat] || []).concat([nm])))
          });
        }
      } else {
        
        var customCatArr = cur["カスタム"] || [];
        if (!customCatArr.includes(nm)) {
          nc = Object.assign({}, prevCustom, {
            cats: Object.assign({}, cur, { "カスタム": customCatArr.concat([nm]) })
          });
        }
      }
      var prevDd = (prevData.trades && prevData.trades[date]) || {};
      var prevAllCats = getAllNewsCatsData(prevDd);
      var prevCatData = prevAllCats[selCat] || {};
      var prevItems = prevCatData.newsItems || [];
      var newItems = prevItems.map(function(n) {
        if (n.id !== niId) return n;
        var t = n.tags || [];
        return Object.assign({}, n, { tags: t.indexOf(tag) >= 0 ? t : t.concat([tag]) });
      });
      var newCats = Object.assign({}, prevAllCats);
      newCats[selCat] = Object.assign({}, prevCatData, { newsItems: newItems });
      var newDd = Object.assign({}, prevDd, { newsCats: newCats });
      var newTrades = Object.assign({}, prevData.trades || {});
      newTrades[date] = newDd;
      return Object.assign({}, prevData, { custom: nc, trades: newTrades });
    });
  };
  
  var delNi = function(date, niId) {
    window._snConfirm("このニュースを削除しますか?").then(function(_ok){ if(!_ok) return;
    _nhvDeleteNi(save, date, selCat, niId);
    });
  };
  
  var addImgToNi = function(date, niId, img) {
    if (!img) return;
    _nhvUpdateNi(save, date, selCat, niId, function(n) {
      return { images: (n.images || []).concat([img]) };
    });
  };
  
  var delImgFromNi = function(date, niId, idx) {
    _nhvUpdateNi(save, date, selCat, niId, function(n) {
      return { images: (n.images || []).filter(function(_, j){ return j !== idx; }) };
    });
  };
  
  var updImgInNi = function(date, niId, idx, ed) {
    _nhvUpdateNi(save, date, selCat, niId, function(n) {
      var a = (n.images || []).slice();
      a[idx] = ed;
      return { images: a };
    });
  };

  
  var todayStr = (function(){ var d=new Date(); var y=d.getFullYear(); var m=("0"+(d.getMonth()+1)).slice(-2); var dd2=("0"+d.getDate()).slice(-2); return y+"-"+m+"-"+dd2; })();
  var addToToday = function() {
    
    var defaults = (custom.newsCatDefaults && Array.isArray(custom.newsCatDefaults[selCat])) ? custom.newsCatDefaults[selCat] : [];
    var subCat = null;
    var subDefaults = [];
    if (hasSubCats && activeSubCat !== "__all__" && activeSubCat !== "__none__") {
      subCat = activeSubCat;
      var key = selCat + "::" + activeSubCat;
      if (custom.newsSubCatDefaults && Array.isArray(custom.newsSubCatDefaults[key])) {
        subDefaults = custom.newsSubCatDefaults[key];
      }
    }
    var seen = {};
    var mergedTags = [];
    [].concat(defaults, subDefaults).forEach(function(t) {
      if (t && !seen[t]) { seen[t] = true; mergedTags.push(t); }
    });
    var item = { id: Date.now(), text: "", images: [], tags: mergedTags };
    if (subCat) item.subCat = subCat;
    _nhvAddNiToDate(save, todayStr, selCat, item);
    
    setTimeout(function(){ try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch(e){} }, 50);
  };

  
  var pageStyle = { padding: "10px 4px 80px", maxWidth: 1080, margin: "0 auto" };
  var btnPrimary = { padding: "8px 12px", fontSize: 13, fontWeight: 700,
    background: "#1a1a1a", color: "#fff", border: "1.5px solid #1a1a1a",
    borderRadius: 7, cursor: "pointer", minHeight: IS_TOUCH ? 44 : 36 };
  var btnGhost = { padding: "8px 12px", fontSize: 13, fontWeight: 700,
    background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 7,
    cursor: "pointer", minHeight: IS_TOUCH ? 44 : 36 };

  
  var renderCard = function(date, ni) {
    var imgs = ni.images || [];
    var niTags = ni.tags || [];
    var cardW = IS_TOUCH ? 240 : 220;
    
    var stockSet = {}, stockList = [];
    niTags.forEach(function(t) {
      var s = _ntExtractStockFromTag(t, allStocks);
      if (s && !stockSet[s]) { stockSet[s] = true; stockList.push(s); }
    });
    return React.createElement("div", {
      key: date + "_" + ni.id,
      style: { position: "relative", background: "#f8f7f4", borderRadius: 10,
        border: ni.pinned ? "1.5px solid #F59E0B" : "1px solid #e8e5df",
        flexShrink: 0, width: cardW, overflow: "hidden" }
    },
      
      React.createElement("button", {
        onClick: function(){ togPin(date, ni.id); },
        title: ni.pinned ? "ピン留めを外す" : "ピン留め",
        style: { position: "absolute", top: 4, left: 4, width: 24, height: 24,
          borderRadius: "50%", background: ni.pinned ? "#F59E0B" : "rgba(0,0,0,0.35)",
          color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }
      }, ni.pinned ? "★" : "☆"),
      
      React.createElement("button", {
        onClick: function(){ delNi(date, ni.id); },
        title: "削除",
        style: { position: "absolute", top: 4, right: 4, width: 22, height: 22,
          borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff",
          border: "none", fontSize: 12, cursor: "pointer", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }
      }, "✕"),
      
      React.createElement("button", {
        onClick: function(){ if (onSelectDate) onSelectDate(date, "news"); },
        title: date + " のニュース欄を開く",
        style: { position: "absolute", top: 4, right: 30, width: 22, height: 22,
          borderRadius: "50%", background: "rgba(99,102,241,0.85)", color: "#fff",
          border: "none", fontSize: 11, cursor: "pointer", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }
      }, "↗"),
      
      React.createElement(ImgGrid, {
        images: imgs,
        maxHeight: 280,
        boxed: true,
        onRemove: function(i) { delImgFromNi(date, ni.id, i); },
        onEnlarge: function(i) {
          setViewTarget({ imgs: imgs, idx: i,
            onUpdate: function(i2, ed) { updImgInNi(date, ni.id, i2, ed); }
          });
        },
        onUpdateImg: function(i, ed) { updImgInNi(date, ni.id, i, ed); },
        onToggleStar: function(i) { updImgInNi(date, ni.id, i, Object.assign({}, imgs[i], { star: !(imgs[i] && imgs[i].star) })); }
      }),
      
      React.createElement("div", { style: { padding: "6px 8px" } },
        
        React.createElement("div", {
          style: { fontSize: 10, color: "#888", marginBottom: 4, fontWeight: 600 }
        }, date + " (" + DAYS_JP[new Date(date + "T00:00:00").getDay()] + ")"),
        
        stockList.length > 0 && onJumpToStock && React.createElement("div", {
          style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 5 }
        }, stockList.map(function(s) {
          return React.createElement("button", {
            key: "jmp_" + date + "_" + ni.id + "_" + s,
            onClick: function(e){ if (e&&e.stopPropagation) e.stopPropagation(); onJumpToStock(s); },
            title: s + " の銘柄記録を見る",
            style: { fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
              background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE",
              cursor: "pointer", whiteSpace: "nowrap" }
          }, "→ " + s);
        })),
        
        hasSubCats && React.createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 5, fontSize: 10 }
        },
          React.createElement("span", { style: { color: "#999", fontWeight: 600, flexShrink: 0 } }, "📂"),
          React.createElement("select", {
            value: ni.subCat || "",
            onChange: function(e) { setNiSubCat(date, ni.id, e.target.value || null); },
            onClick: function(e) { e.stopPropagation(); },
            style: { fontSize: 11, padding: "2px 4px", border: "1px solid #ddd",
              borderRadius: 4, background: "#fff", color: "#444",
              flex: 1, minWidth: 0, cursor: "pointer" }
          },
            React.createElement("option", { value: "" }, "(未分類)"),
            subCatsForCur.map(function(sc) {
              return React.createElement("option", { key: sc, value: sc }, sc);
            })
          )
        ),
        
        React.createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }
        },
          React.createElement("button", {
            onClick: function(e) { e.stopPropagation(); togStar(date, ni.id); },
            title: ni.starred ? "★を外す" : "★をつける",
            style: { padding: 0, border: "none", background: "none", cursor: "pointer",
              fontSize: 14, lineHeight: 1, color: ni.starred ? "#E53935" : "#ccc", flexShrink: 0 }
          }, "★")
        ),
        
        React.createElement(TagPicker, _extends({
          cats: catTagPool.cats, tags: catTagPool.tags, sel: niTags,
          onToggle: function(tag) { togNiTag(date, ni.id, tag); },
          onAdd: function(name, cat) { addNiTag(date, ni.id, name, cat); }
        }, pool, { tagColors: custom.tagColors || {}, label: "材料タグ", hideAddRoot: true })),
        
        React.createElement(PasteZone, {
          onImage: function(img){ addImgToNi(date, ni.id, img); },
          compact: true
        })
      )
    );
  };

  
  return React.createElement("div", { style: pageStyle },
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }
    },
      React.createElement("button", { onClick: onBack, style: btnGhost }, "← 戻る"),
      React.createElement("div", { style: { fontSize: 17, fontWeight: 700, flex: 1 } }, "📰 ニュース一覧")
    ),
    
    React.createElement("div", {
      style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }
    }, newsCategories.map(function(cat) {
      var active = cat === selCat;
      var cnt = catCounts[cat] || 0;
      return React.createElement("button", {
        key: cat,
        onClick: function(){ setSelCat(cat); },
        style: { padding: "7px 11px", fontSize: 13, fontWeight: 700,
          background: active ? "#1a1a1a" : "#fff",
          color: active ? "#fff" : "#444",
          border: active ? "1.5px solid #1a1a1a" : "1px solid #ddd",
          borderRadius: 6, cursor: "pointer",
          minHeight: IS_TOUCH ? 40 : 32 }
      }, cat + " (" + cnt + ")");
    })),
    
    hasSubCats && React.createElement("div", {
      style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8,
        paddingLeft: 6, borderLeft: "3px solid #C7D2FE" }
    },
      [{ key: "__all__", label: "すべて" }, { key: "__none__", label: "未分類" }]
        .concat(subCatsForCur.map(function(sc){ return { key: sc, label: sc }; }))
        .map(function(opt) {
          var active = activeSubCat === opt.key;
          var cnt = subCatCounts[opt.key] || 0;
          return React.createElement("button", {
            key: opt.key,
            onClick: function(){ setActiveSubCat(opt.key); },
            style: { padding: "5px 10px", fontSize: 12, fontWeight: 600,
              background: active ? "#16A34A" : "#fff",
              color: active ? "#fff" : "#555",
              border: active ? "1.5px solid #16A34A" : "1px solid #ddd",
              borderRadius: 5, cursor: "pointer",
              minHeight: IS_TOUCH ? 36 : 28 }
          }, opt.label + " (" + cnt + ")");
        })
    ),
    
    React.createElement("div", {
      style: { background: "#fafaf7", border: "1px solid #e8e5df", borderRadius: 8,
        padding: 8, marginBottom: 10 }
    },
      
      React.createElement("div", {
        style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }
      },
        React.createElement(FastInput, {
          type: "text",
          value: keyword,
          onChange: function(v){ setKeyword(v); },
          debounceMs: 200,
          placeholder: "\uD83D\uDD0D \u672C\u6587\u30FB\u30BF\u30B0\u691C\u7D22",
          style: { flex: 1, minWidth: 140, padding: "6px 8px", fontSize: 13,
            border: "1px solid #ddd", borderRadius: 5, minHeight: IS_TOUCH ? 36 : 30 }
        }),
        React.createElement("select", {
          value: sortDir,
          onChange: function(e){ setSortDir(e.target.value); },
          style: { padding: "6px 8px", fontSize: 12, fontWeight: 600,
            border: "1px solid #ddd", borderRadius: 5, background: "#fff",
            minHeight: IS_TOUCH ? 36 : 30, cursor: "pointer" }
        },
          React.createElement("option", { value: "desc" }, "新→古"),
          React.createElement("option", { value: "asc" }, "古→新")
        )
      ),
      
      React.createElement("div", {
        style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }
      },
        React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 700 } }, "📅"),
        React.createElement("input", {
          type: "date", value: dateFrom,
          onChange: function(e){ setDateFrom(e.target.value); },
          style: { padding: "5px 6px", fontSize: 12, border: "1px solid #ddd",
            borderRadius: 5, minHeight: IS_TOUCH ? 36 : 28 }
        }),
        React.createElement("span", { style: { fontSize: 11, color: "#999" } }, "～"),
        React.createElement("input", {
          type: "date", value: dateTo,
          onChange: function(e){ setDateTo(e.target.value); },
          style: { padding: "5px 6px", fontSize: 12, border: "1px solid #ddd",
            borderRadius: 5, minHeight: IS_TOUCH ? 36 : 28 }
        }),
        React.createElement("button", {
          onClick: function(){ setShowTagFilter(!showTagFilter); },
          style: { padding: "5px 10px", fontSize: 12, fontWeight: 700,
            background: showTagFilter ? "#6366F1" : (selTags.size > 0 ? "#EEF2FF" : "#fff"),
            color: showTagFilter ? "#fff" : (selTags.size > 0 ? "#4338CA" : "#555"),
            border: "1px solid " + (showTagFilter ? "#6366F1" : (selTags.size > 0 ? "#C7D2FE" : "#ddd")),
            borderRadius: 5, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
        }, "🏷️ タグ絞込" + (selTags.size > 0 ? " (" + selTags.size + ")" : "")),
        React.createElement("button", {
          onClick: function(){ setPinnedOnly(!pinnedOnly); },
          style: { padding: "5px 10px", fontSize: 12, fontWeight: 700,
            background: pinnedOnly ? "#F59E0B" : "#fff",
            color: pinnedOnly ? "#fff" : "#555",
            border: "1px solid " + (pinnedOnly ? "#F59E0B" : "#ddd"),
            borderRadius: 5, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
        }, "★ ピンのみ"),
        React.createElement("button", {
          onClick: function(){ setStarredOnly(!starredOnly); },
          style: { padding: "5px 10px", fontSize: 12, fontWeight: 700,
            background: starredOnly ? "#E53935" : "#fff",
            color: starredOnly ? "#fff" : "#555",
            border: "1px solid " + (starredOnly ? "#E53935" : "#ddd"),
            borderRadius: 5, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
        }, "★ 星のみ" + (starredCount > 0 ? " (" + starredCount + ")" : "")),
        hasAnyFilter && React.createElement("button", {
          onClick: clearAllFilter,
          style: { padding: "5px 10px", fontSize: 11, fontWeight: 600,
            background: "#fff", color: "#DC2626",
            border: "1px solid #FCA5A5", borderRadius: 5, cursor: "pointer",
            minHeight: IS_TOUCH ? 36 : 28 }
        }, "✕ 絞込クリア")
      ),
      
      showTagFilter && React.createElement("div", {
        style: { borderTop: "1px solid #e8e5df", paddingTop: 6, marginTop: 4 }
      },
        allCustomTagOptions.length === 0
          ? React.createElement("div", { style: { fontSize: 11, color: "#999", padding: 6 } }, "(タグ候補がありません)")
          : React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
              allCustomTagOptions.map(function(t) {
                var on = selTags.has(t);
                return React.createElement("button", {
                  key: "tf_" + t,
                  onClick: function(){ togSelTag(t); },
                  style: { padding: "3px 8px", fontSize: 11, fontWeight: 600,
                    background: on ? "#6366F1" : "#fff",
                    color: on ? "#fff" : "#555",
                    border: "1px solid " + (on ? "#6366F1" : "#ddd"),
                    borderRadius: 4, cursor: "pointer" }
                }, stripCat(t));
              })
            )
      )
    ),
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }
    },
      React.createElement("div", {
        style: { fontSize: 12, color: "#555", fontWeight: 600 }
      }, "📊 " + totalCount + "件" + (pinnedCount > 0 ? " (うちピン " + pinnedCount + "件)" : "")),
      React.createElement("div", { style: { flex: 1 } }),
      React.createElement("button", {
        onClick: addToToday,
        title: "現在のカテゴリ・サブタブで今日の日付に新規ニュースを追加",
        style: { padding: "6px 12px", fontSize: 12, fontWeight: 700,
          background: "#1a1a1a", color: "#fff",
          border: "1.5px solid #1a1a1a", borderRadius: 6, cursor: "pointer",
          minHeight: IS_TOUCH ? 40 : 32 }
      }, "+ 今日に追加")
    ),
    
    pinnedItems.length > 0 && React.createElement("div", {
      style: { marginBottom: 14 }
    },
      React.createElement("div", {
        style: { fontSize: 12, fontWeight: 700, color: "#92400E",
          background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6,
          padding: "5px 10px", display: "inline-block", marginBottom: 6 }
      }, "★ ピン留め (" + pinnedItems.length + ")"),
      React.createElement("div", {
        style: { display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch",
          gap: 10, paddingBottom: 8, alignItems: "flex-start" }
      }, pinnedItems.map(function(e) {
        return renderCard(e.date, e.ni);
      }))
    ),
    
    groupedByDate.length === 0 && pinnedItems.length === 0
      ? React.createElement("div", {
          style: { padding: 30, textAlign: "center", color: "#999", fontSize: 13,
            background: "#fafaf7", border: "1px dashed #ddd", borderRadius: 8 }
        }, hasAnyFilter
          ? "絞込条件に一致するニュースがありません。"
          : "このカテゴリにはまだニュースが記録されていません。")
      : groupedByDate.map(function(grp) {
          var dow = DAYS_JP[new Date(grp.date + "T00:00:00").getDay()];
          return React.createElement("div", {
            key: "grp_" + grp.date,
            style: { marginBottom: 14 }
          },
            React.createElement("div", {
              style: { display: "flex", alignItems: "center", gap: 8,
                paddingBottom: 4, marginBottom: 6,
                borderBottom: "2px solid #e8e5df" }
            },
              React.createElement("div", {
                style: { fontSize: 13, fontWeight: 700, color: "#1a1a1a" }
              }, "📅 " + grp.date + " (" + dow + ")"),
              React.createElement("div", {
                style: { fontSize: 11, color: "#888", fontWeight: 600 }
              }, grp.items.length + "件"),
              React.createElement("div", { style: { flex: 1 } }),
              React.createElement("button", {
                onClick: function(){ if (onSelectDate) onSelectDate(grp.date, "news"); },
                style: { padding: "3px 9px", fontSize: 11, fontWeight: 700,
                  background: "#EEF2FF", color: "#4338CA",
                  border: "1px solid #C7D2FE", borderRadius: 5, cursor: "pointer" }
              }, "→ この日のニュース欄")
            ),
            React.createElement("div", {
              style: { display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch",
                gap: 10, paddingBottom: 8, alignItems: "flex-start" }
            }, grp.items.map(function(e) {
              return renderCard(e.date, e.ni);
            }))
          );
        }),
    
    viewTarget && (function() {
      var vt = viewTarget;
      var imgs = vt.imgs || [];
      var i = vt.idx;
      var img = imgs[i];
      if (!img) return null;
      var src = imgSrc(img);
      var ap = { img: img, onSave: function(ed){ vt.onUpdate(i, ed); } };
      return React.createElement(ZoomLightbox, {
        src: src,
        annotProps: ap,
        onClose: function(){ setViewTarget(null); },
        onPrev: i > 0 ? function(){ setViewTarget(function(t){
          if (!t) return t;
          return Object.assign({}, t, { idx: t.idx - 1 });
        }); } : null,
        onNext: i < imgs.length - 1 ? function(){ setViewTarget(function(t){
          if (!t) return t;
          return Object.assign({}, t, { idx: t.idx + 1 });
        }); } : null,
        navLabel: imgs.length > 1 ? (i + 1) + "/" + imgs.length : null
      });
    })()
  );
}







function _shvCollectFlat(trades) {
  if (!trades) return [];
  var out = [];
  Object.keys(trades).forEach(function(date) {
    var dd = trades[date];
    if (!dd) return;
    var html = dd.summaryHtml || _summaryMemoToHtml(dd.summaryMemo);
    if (!_hasText(html)) return;
    out.push({ date: date, html: html, pinned: !!dd.summaryPinned });
  });
  return out;
}

function _shvCollectSoukatsu(trades) {
  if (!trades) return [];
  var out = [];
  Object.keys(trades).forEach(function(date) {
    var dd = trades[date];
    if (!dd) return;
    var html = _summaryMemoToHtml(dd.tradesSummaryMemo)
      || (dd.summary ? dd.summary.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>") : "");
    if (!_hasText(html)) return;
    out.push({ date: date, html: html, pinned: false });
  });
  return out;
}


function _shvTogPin(saveFn, date) {
  saveFn(function(prevData) {
    var prevDd = (prevData.trades && prevData.trades[date]) || {};
    var newDd = Object.assign({}, prevDd, { summaryPinned: !prevDd.summaryPinned });
    var newTrades = Object.assign({}, prevData.trades || {});
    newTrades[date] = newDd;
    return Object.assign({}, prevData, { trades: newTrades });
  });
}


function _shvAppendToToday(saveFn, todayStr, srcDate, srcHtml) {
  saveFn(function(prevData) {
    var prevDd = (prevData.trades && prevData.trades[todayStr]) || {};
    var prevHtml = prevDd.summaryHtml || _summaryMemoToHtml(prevDd.summaryMemo) || "";
    var sep = prevHtml && _hasText(prevHtml) ? '<p><br></p><p style="color:#888;font-size:12px">— ' + srcDate + ' から引用 —</p>' : '<p style="color:#888;font-size:12px">— ' + srcDate + ' から引用 —</p>';
    var newHtml = prevHtml + sep + srcHtml;
    var newDd = Object.assign({}, prevDd, { summaryHtml: newHtml });
    var newTrades = Object.assign({}, prevData.trades || {});
    newTrades[todayStr] = newDd;
    return Object.assign({}, prevData, { trades: newTrades });
  });
}


function _SummaryCard(_props_sc) {
  var entry = _props_sc.entry;
  var todayStr = _props_sc.todayStr;
  var isExpanded = _props_sc.isExpanded;
  var togPin = _props_sc.togPin;
  var togExpand = _props_sc.togExpand;
  var appendToToday = _props_sc.appendToToday;
  var onOpen = _props_sc.onOpen;

  var date = entry.date;
  var html = entry.html || "";
  var pinned = entry.pinned;
  var dow = DAYS_JP[new Date(date + "T00:00:00").getDay()];
  var plain = stripHtml(html).replace(/\u00a0/g, " ").trim();
  var charCount = plain.length;
  var isToday = date === todayStr;

  
  var contentRef = useRef(null);
  var _us_sc = useState(false), _us_scA = _slicedToArray(_us_sc, 2),
      truncated = _us_scA[0], setTruncated = _us_scA[1];

  useEffect(function() {
    if (isExpanded) return; 
    var el = contentRef.current;
    if (!el) return;
    var check = function() {
      var el2 = contentRef.current;
      if (!el2) return;
      
      setTruncated(el2.scrollHeight > el2.clientHeight + 2);
    };
    check();
    
    var imgs = el.querySelectorAll("img");
    var listeners = [];
    imgs.forEach(function(img) {
      if (!img.complete) {
        var l = function(){ check(); };
        img.addEventListener("load", l);
        img.addEventListener("error", l);
        listeners.push({ img: img, l: l });
      }
    });
    
    var ro = null;
    try {
      if (window.ResizeObserver) {
        ro = new ResizeObserver(check);
        ro.observe(el);
      }
    } catch(_e) {}
    return function() {
      listeners.forEach(function(x) {
        x.img.removeEventListener("load", x.l);
        x.img.removeEventListener("error", x.l);
      });
      if (ro) try { ro.disconnect(); } catch(_e2){}
    };
  }, [html, isExpanded]);

  return React.createElement("div", {
    style: { background: "#fff", borderRadius: 10,
      border: pinned ? "1.5px solid #F59E0B" : "1px solid #e8e5df",
      marginBottom: 10, overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
  },
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 6, padding: "8px 10px",
        background: pinned ? "#FEF3C7" : "#fafaf7",
        borderBottom: "1px solid #eee", flexWrap: "wrap" }
    },
      React.createElement("button", {
        onClick: togPin,
        title: pinned ? "ピン留めを外す" : "ピン留め",
        style: { width: 26, height: 26, borderRadius: "50%",
          background: pinned ? "#F59E0B" : "rgba(0,0,0,0.1)",
          color: pinned ? "#fff" : "#666",
          border: "none", fontSize: 13, cursor: "pointer", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }
      }, pinned ? "★" : "☆"),
      React.createElement("div", {
        style: { fontSize: 14, fontWeight: 700, color: "#1a1a1a", flex: 1, minWidth: 0 }
      }, "📅 " + date + " (" + dow + ")",
        isToday && React.createElement("span", {
          style: { fontSize: 10, fontWeight: 700, color: "#fff",
            background: "#16A34A", padding: "1px 6px", borderRadius: 4, marginLeft: 6 }
        }, "今日")
      ),
      React.createElement("span", {
        title: "文字数 (本文の充実度)",
        style: { fontSize: 11, color: "#888", fontWeight: 600, flexShrink: 0 }
      }, "📝 " + charCount + "字"),
      !isToday && React.createElement("button", {
        onClick: appendToToday,
        title: "このメモを今日のメモに引用追記",
        style: { padding: "3px 9px", fontSize: 11, fontWeight: 700,
          background: "#fff", color: "#16A34A",
          border: "1px solid #86EFAC", borderRadius: 5, cursor: "pointer",
          flexShrink: 0 }
      }, "↪ 今日に引用"),
      React.createElement("button", {
        onClick: onOpen,
        title: date + " のメモを開く",
        style: { padding: "3px 9px", fontSize: 11, fontWeight: 700,
          background: "#EEF2FF", color: "#4338CA",
          border: "1px solid #C7D2FE", borderRadius: 5, cursor: "pointer",
          flexShrink: 0 }
      }, "→ 開く")
    ),
    
    React.createElement("div", {
      ref: contentRef,
      onClick: onOpen,
      style: { position: "relative", padding: "10px 12px", cursor: "pointer",
        maxHeight: isExpanded ? "none" : 240, overflow: "hidden" }
    },
      React.createElement("div", {
        className: "shv-prose",
        style: { fontSize: 13, lineHeight: 1.6, color: "#222",
          wordBreak: "break-word" },
        dangerouslySetInnerHTML: { __html: html }
      }),
      
      !isExpanded && truncated && React.createElement("div", {
        style: { position: "absolute", left: 0, right: 0, bottom: 0, height: 60,
          background: "linear-gradient(to bottom, rgba(255,255,255,0), #fff)",
          pointerEvents: "none" }
      })
    ),
    
    (truncated || isExpanded) && React.createElement("div", {
      style: { textAlign: "center", padding: "4px 8px 8px",
        borderTop: "1px dashed #eee" }
    },
      React.createElement("button", {
        onClick: function(e){ e.stopPropagation(); togExpand(); },
        style: { padding: "4px 12px", fontSize: 11, fontWeight: 700,
          background: "transparent", color: "#6366F1",
          border: "1px solid #C7D2FE", borderRadius: 4, cursor: "pointer" }
      }, isExpanded ? "▲ 折りたたむ" : "▼ 全文を表示")
    )
  );
}

function SummaryHistoryView(_ref_shv) {
  var data = _ref_shv.data,
      save = _ref_shv.save,
      onBack = _ref_shv.onBack,
      onSelectDate = _ref_shv.onSelectDate;
  var trades = data.trades || {};

  
  var _us_shvTab = useState("memo"), _us_shvTabA = _slicedToArray(_us_shvTab, 2),
      shvTab = _us_shvTabA[0], setShvTab = _us_shvTabA[1];

  
  var _us_shvSD = useState("desc"), _us_shvSDA = _slicedToArray(_us_shvSD, 2),
      sortDir = _us_shvSDA[0], setSortDir = _us_shvSDA[1];
  
  var _us_shvKw = useState(""), _us_shvKwA = _slicedToArray(_us_shvKw, 2),
      keyword = _us_shvKwA[0], setKeyword = _us_shvKwA[1];
  
  var _us_shvDF = useState(""), _us_shvDFA = _slicedToArray(_us_shvDF, 2),
      dateFrom = _us_shvDFA[0], setDateFrom = _us_shvDFA[1];
  var _us_shvDT = useState(""), _us_shvDTA = _slicedToArray(_us_shvDT, 2),
      dateTo = _us_shvDTA[0], setDateTo = _us_shvDTA[1];
  
  var _us_shvPO = useState(false), _us_shvPOA = _slicedToArray(_us_shvPO, 2),
      pinnedOnly = _us_shvPOA[0], setPinnedOnly = _us_shvPOA[1];
  
  var _us_shvSO = useState(false), _us_shvSOA = _slicedToArray(_us_shvSO, 2),
      starredOnly = _us_shvSOA[0], setStarredOnly = _us_shvSOA[1];
  
  var _us_shvEx = useState(new Set()), _us_shvExA = _slicedToArray(_us_shvEx, 2),
      expanded = _us_shvExA[0], setExpanded = _us_shvExA[1];

  var togExpand = function(date) {
    var n = new Set(expanded);
    if (n.has(date)) n["delete"](date); else n.add(date);
    setExpanded(n);
  };

  var clearAllFilter = function() {
    setKeyword(""); setDateFrom(""); setDateTo(""); setPinnedOnly(false); setStarredOnly(false);
  };
  var hasAnyFilter = !!keyword.trim() || !!dateFrom || !!dateTo || pinnedOnly || starredOnly;

  
  var memoFlat = useMemo(function() {
    return _shvCollectFlat(trades);
  }, [trades]);
  var soukatsuFlat = useMemo(function() {
    return _shvCollectSoukatsu(trades);
  }, [trades]);
  var allFlat = shvTab === "soukatsu" ? soukatsuFlat : memoFlat;

  var starredCount = useMemo(function() {
    return allFlat.filter(function(e) { return !!e.starred; }).length;
  }, [allFlat]);

  
  var filtered = useMemo(function() {
    var arr = allFlat;
    if (dateFrom) arr = arr.filter(function(e) { return e.date >= dateFrom; });
    if (dateTo)   arr = arr.filter(function(e) { return e.date <= dateTo; });
    if (pinnedOnly) arr = arr.filter(function(e) { return !!e.pinned; });
    if (starredOnly) arr = arr.filter(function(e) { return !!e.starred; });
    var kw = (keyword || "").trim().toLowerCase();
    if (kw) {
      arr = arr.filter(function(e) {
        var t = stripHtml(e.html).toLowerCase();
        return t.indexOf(kw) >= 0;
      });
    }
    return arr.slice().sort(function(a, b) {
      if (a.date === b.date) return 0;
      return sortDir === "desc" ? (a.date < b.date ? 1 : -1) : (a.date < b.date ? -1 : 1);
    });
  }, [allFlat, dateFrom, dateTo, pinnedOnly, starredOnly, keyword, sortDir]);

  
  var _shvSplit = useMemo(function() {
    var pin = [], non = [];
    for (var i = 0; i < filtered.length; i++) {
      if (filtered[i].pinned) pin.push(filtered[i]);
      else non.push(filtered[i]);
    }
    return { pinnedItems: pin, nonPinnedItems: non, pinnedCount: pin.length };
  }, [filtered]);
  var totalCount = filtered.length;
  var pinnedCount = _shvSplit.pinnedCount;
  var pinnedItems = _shvSplit.pinnedItems;
  var nonPinnedItems = _shvSplit.nonPinnedItems;

  
  var todayStr = (function(){ var d=new Date(); var y=d.getFullYear(); var m=("0"+(d.getMonth()+1)).slice(-2); var dd2=("0"+d.getDate()).slice(-2); return y+"-"+m+"-"+dd2; })();
  var goToday = function() {
    if (onSelectDate) onSelectDate(todayStr, shvTab === "soukatsu" ? "trades" : "events");
  };
  var appendToToday = function(srcDate, srcHtml) {
    if (srcDate === todayStr) return;
    window._snConfirm(srcDate + " のメモを今日 (" + todayStr + ") のメモ末尾に引用追記しますか?").then(function(_ok){ if(!_ok) return;
    _shvAppendToToday(save, todayStr, srcDate, srcHtml);
    });
  };

  
  var pageStyle = { padding: "10px 4px 80px", maxWidth: 1080, margin: "0 auto" };
  var btnGhost = { padding: "8px 12px", fontSize: 13, fontWeight: 700,
    background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 7,
    cursor: "pointer", minHeight: IS_TOUCH ? 44 : 36 };

  
  
  return React.createElement("div", { style: pageStyle },
    
    React.createElement("style", null,
      ".shv-prose { display: flow-root; }" +  
      ".shv-prose img { max-width: 100%; height: auto; border-radius: 4px; }" +
      ".shv-prose p { margin: 0 0 6px 0; }" +
      ".shv-prose ul, .shv-prose ol { margin: 4px 0 4px 20px; padding: 0; }"
    ),
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }
    },
      React.createElement("button", { onClick: onBack, style: btnGhost }, "← 戻る"),
      React.createElement("div", { style: { fontSize: 17, fontWeight: 700, flex: 1 } }, "📝 メモ・アイディア一覧")
    ),
    
    React.createElement("div", {
      style: { display: "flex", gap: 0, borderBottom: "2px solid #e0ddd6", marginBottom: 12 }
    },
      [["memo", "💡 メモ・アイディア"], ["soukatsu", "📋 総括"]].map(function(kv) {
        var on = shvTab === kv[0];
        return React.createElement("button", {
          key: kv[0],
          onClick: function() { setShvTab(kv[0]); },
          style: { padding: "8px 16px", fontSize: 13, fontWeight: 700,
            background: on ? "#FFEDD5" : "#fafaf8",
            border: "none", borderBottom: on ? "2.5px solid #9A3412" : "2.5px solid transparent",
            color: on ? "#9A3412" : "#888", cursor: "pointer", whiteSpace: "nowrap", marginBottom: -2 }
        }, kv[1]);
      })
    ),
    
    React.createElement("div", {
      style: { background: "#fafaf7", border: "1px solid #e8e5df", borderRadius: 8,
        padding: 8, marginBottom: 10 }
    },
      
      React.createElement("div", {
        style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }
      },
        React.createElement(FastInput, {
          type: "text",
          value: keyword,
          onChange: function(v){ setKeyword(v); },
          debounceMs: 200,
          placeholder: "\uD83D\uDD0D \u672C\u6587\u3092\u691C\u7D22",
          style: { flex: 1, minWidth: 140, padding: "6px 8px", fontSize: 13,
            border: "1px solid #ddd", borderRadius: 5, minHeight: IS_TOUCH ? 36 : 30 }
        }),
        React.createElement("select", {
          value: sortDir,
          onChange: function(e){ setSortDir(e.target.value); },
          style: { padding: "6px 8px", fontSize: 12, fontWeight: 600,
            border: "1px solid #ddd", borderRadius: 5, background: "#fff",
            minHeight: IS_TOUCH ? 36 : 30, cursor: "pointer" }
        },
          React.createElement("option", { value: "desc" }, "新→古"),
          React.createElement("option", { value: "asc" }, "古→新")
        )
      ),
      
      React.createElement("div", {
        style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }
      },
        React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 700 } }, "📅"),
        React.createElement("input", {
          type: "date", value: dateFrom,
          onChange: function(e){ setDateFrom(e.target.value); },
          style: { padding: "5px 6px", fontSize: 12, border: "1px solid #ddd",
            borderRadius: 5, minHeight: IS_TOUCH ? 36 : 28 }
        }),
        React.createElement("span", { style: { fontSize: 11, color: "#999" } }, "～"),
        React.createElement("input", {
          type: "date", value: dateTo,
          onChange: function(e){ setDateTo(e.target.value); },
          style: { padding: "5px 6px", fontSize: 12, border: "1px solid #ddd",
            borderRadius: 5, minHeight: IS_TOUCH ? 36 : 28 }
        }),
        React.createElement("button", {
          onClick: function(){ setPinnedOnly(!pinnedOnly); },
          style: { padding: "5px 10px", fontSize: 12, fontWeight: 700,
            background: pinnedOnly ? "#F59E0B" : "#fff",
            color: pinnedOnly ? "#fff" : "#555",
            border: "1px solid " + (pinnedOnly ? "#F59E0B" : "#ddd"),
            borderRadius: 5, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
        }, "★ ピンのみ"),
        hasAnyFilter && React.createElement("button", {
          onClick: clearAllFilter,
          style: { padding: "5px 10px", fontSize: 11, fontWeight: 600,
            background: "#fff", color: "#DC2626",
            border: "1px solid #FCA5A5", borderRadius: 5, cursor: "pointer",
            minHeight: IS_TOUCH ? 36 : 28 }
        }, "✕ 絞込クリア")
      )
    ),
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }
    },
      React.createElement("div", {
        style: { fontSize: 12, color: "#555", fontWeight: 600 }
      }, "📊 " + totalCount + "件" + (pinnedCount > 0 ? " (うちピン " + pinnedCount + "件)" : "")),
      React.createElement("div", { style: { flex: 1 } }),
      React.createElement("button", {
        onClick: goToday,
        title: "今日 (" + todayStr + ") の" + (shvTab === "soukatsu" ? "総括" : "メモ・アイディア") + "を書く / 開く",
        style: { padding: "6px 12px", fontSize: 12, fontWeight: 700,
          background: "#1a1a1a", color: "#fff",
          border: "1.5px solid #1a1a1a", borderRadius: 6, cursor: "pointer",
          minHeight: IS_TOUCH ? 40 : 32 }
      }, "+ 今日に書く")
    ),
    
    shvTab === "memo" && pinnedItems.length > 0 && React.createElement("div", {
      style: { marginBottom: 16 }
    },
      React.createElement("div", {
        style: { fontSize: 12, fontWeight: 700, color: "#92400E",
          background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6,
          padding: "5px 10px", display: "inline-block", marginBottom: 8 }
      }, "★ ピン留め (" + pinnedItems.length + ")"),
      pinnedItems.map(function(e){
        return React.createElement(_SummaryCard, {
          key: "shv_pin_" + e.date,
          entry: e,
          todayStr: todayStr,
          isExpanded: expanded.has(e.date),
          togPin: function(){ _shvTogPin(save, e.date); },
          togExpand: function(){ togExpand(e.date); },
          appendToToday: function(){ appendToToday(e.date, e.html); },
          onOpen: function(){ if (onSelectDate) onSelectDate(e.date, "events"); }
        });
      })
    ),
    
    nonPinnedItems.length === 0 && pinnedItems.length === 0
      ? React.createElement("div", {
          style: { padding: 30, textAlign: "center", color: "#999", fontSize: 13,
            background: "#fafaf7", border: "1px dashed #ddd", borderRadius: 8 }
        }, hasAnyFilter
          ? "絞込条件に一致する記録がありません。"
          : shvTab === "soukatsu"
            ? "まだ総括が記録されていません。日別ページの取引タブから「本日の総括」を書いてみましょう。"
            : "まだメモ・アイディアが記録されていません。「+ 今日に書く」から始めてみましょう。")
      : nonPinnedItems.map(function(e){
          var isSoukatsu = shvTab === "soukatsu";
          return React.createElement(_SummaryCard, {
            key: "shv_" + e.date,
            entry: e,
            todayStr: todayStr,
            isExpanded: expanded.has(e.date),
            togPin: isSoukatsu ? function(){} : function(){ _shvTogPin(save, e.date); },
            togExpand: function(){ togExpand(e.date); },
            appendToToday: function(){ appendToToday(e.date, e.html); },
            onOpen: function(){ if (onSelectDate) onSelectDate(e.date, isSoukatsu ? "trades" : "events"); }
          });
        })
  );
}








var SI_DEFAULT_TAB_NAMES = ["銘柄概要", "メモ"];
var SI_TEMPLATE_TAB_NAMES = ["銘柄概要", "決算", "業界動向", "貸借状況", "配当履歴", "決算スケジュール", "メモ"];


function _siFormatRelTime(ts) {
  if (!ts) return "";
  var diff = Date.now() - ts;
  if (diff < 0) return "未来";
  var sec = Math.floor(diff / 1000);
  if (sec < 60) return "たった今";
  var min = Math.floor(sec / 60);
  if (min < 60) return min + "分前";
  var hr = Math.floor(min / 60);
  if (hr < 24) return hr + "時間前";
  var day = Math.floor(hr / 24);
  if (day < 7) return day + "日前";
  if (day < 30) return Math.floor(day / 7) + "週間前";
  if (day < 365) return Math.floor(day / 30) + "ヶ月前";
  return Math.floor(day / 365) + "年前";
}


function _siGetTabs(custom, stockName) {
  if (!stockName) return [];
  var tabs = (custom.stockInfoTabs && custom.stockInfoTabs[stockName]) || [];
  if (!Array.isArray(tabs)) tabs = [];
  return tabs;
}


function _siSetTabs(saveFn, stockName, newTabs) {
  saveFn(function(prevData) {
    var prevCustom = prevData.custom || {};
    var prevAll = prevCustom.stockInfoTabs || {};
    var newAll = Object.assign({}, prevAll);
    if (newTabs && newTabs.length > 0) {
      newAll[stockName] = newTabs;
    } else {
      delete newAll[stockName];
    }
    return Object.assign({}, prevData, {
      custom: Object.assign({}, prevCustom, { stockInfoTabs: newAll })
    });
  });
}


function _siGetTabContent(data, stockName, tabId) {
  var si = (data.stockInfo && data.stockInfo[stockName]) || {};
  var t = si[tabId];
  if (!t) return { html: "", updatedAt: 0 };
  if (typeof t === "string") return { html: t, updatedAt: 0 }; 
  return { html: t.html || "", updatedAt: t.updatedAt || 0 };
}


function _siUpdateTabContent(saveFn, stockName, tabId, html) {
  saveFn(function(prevData) {
    var prevAll = prevData.stockInfo || {};
    var prevForStock = prevAll[stockName] || {};
    var newForStock = Object.assign({}, prevForStock);
    newForStock[tabId] = { html: html || "", updatedAt: Date.now() };
    var newAll = Object.assign({}, prevAll);
    newAll[stockName] = newForStock;
    return Object.assign({}, prevData, { stockInfo: newAll });
  });
}


function _siAddTab(saveFn, stockName, name) {
  var nm = (name || "").trim() || "新規タブ";
  saveFn(function(prevData) {
    var prevCustom = prevData.custom || {};
    var prevAll = prevCustom.stockInfoTabs || {};
    var prevTabs = prevAll[stockName] || [];
    
    var existing = prevTabs.map(function(t){ return t.name; });
    var finalName = nm;
    var n = 2;
    while (existing.indexOf(finalName) >= 0) {
      finalName = nm + " (" + n + ")";
      n++;
    }
    var newTab = { id: "tab_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), name: finalName };
    var newTabs = prevTabs.concat([newTab]);
    var newAll = Object.assign({}, prevAll);
    newAll[stockName] = newTabs;
    return Object.assign({}, prevData, {
      custom: Object.assign({}, prevCustom, { stockInfoTabs: newAll })
    });
  });
}


function _siDelTab(saveFn, stockName, tabId) {
  saveFn(function(prevData) {
    var prevCustom = prevData.custom || {};
    var prevAll = prevCustom.stockInfoTabs || {};
    var prevTabs = prevAll[stockName] || [];
    var newTabs = prevTabs.filter(function(t){ return t.id !== tabId; });
    var newAll = Object.assign({}, prevAll);
    if (newTabs.length > 0) newAll[stockName] = newTabs;
    else delete newAll[stockName];
    
    var prevSI = prevData.stockInfo || {};
    var prevForStock = prevSI[stockName] || {};
    var newForStock = Object.assign({}, prevForStock);
    delete newForStock[tabId];
    var newSI = Object.assign({}, prevSI);
    if (Object.keys(newForStock).length > 0) newSI[stockName] = newForStock;
    else delete newSI[stockName];
    return Object.assign({}, prevData, {
      custom: Object.assign({}, prevCustom, { stockInfoTabs: newAll }),
      stockInfo: newSI
    });
  });
}


function _siRenameTab(saveFn, stockName, tabId, newName) {
  var nm = (newName || "").trim();
  if (!nm) return;
  saveFn(function(prevData) {
    var prevCustom = prevData.custom || {};
    var prevAll = prevCustom.stockInfoTabs || {};
    var prevTabs = prevAll[stockName] || [];
    var newTabs = prevTabs.map(function(t) {
      if (t.id !== tabId) return t;
      return Object.assign({}, t, { name: nm });
    });
    var newAll = Object.assign({}, prevAll);
    newAll[stockName] = newTabs;
    return Object.assign({}, prevData, {
      custom: Object.assign({}, prevCustom, { stockInfoTabs: newAll })
    });
  });
}


function _siReorderTab(saveFn, stockName, tabId, dir) {
  saveFn(function(prevData) {
    var prevCustom = prevData.custom || {};
    var prevAll = prevCustom.stockInfoTabs || {};
    var prevTabs = (prevAll[stockName] || []).slice();
    var idx = prevTabs.findIndex(function(t){ return t.id === tabId; });
    if (idx < 0) return prevData;
    var swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= prevTabs.length) return prevData;
    var tmp = prevTabs[idx];
    prevTabs[idx] = prevTabs[swapIdx];
    prevTabs[swapIdx] = tmp;
    var newAll = Object.assign({}, prevAll);
    newAll[stockName] = prevTabs;
    return Object.assign({}, prevData, {
      custom: Object.assign({}, prevCustom, { stockInfoTabs: newAll })
    });
  });
}


function _siCopyFromOtherStock(saveFn, srcStock, dstStock, tabName) {
  saveFn(function(prevData) {
    var prevCustom = prevData.custom || {};
    var prevAllTabs = prevCustom.stockInfoTabs || {};
    var srcTabs = prevAllTabs[srcStock] || [];
    var srcTab = srcTabs.find(function(t){ return t.name === tabName; });
    if (!srcTab) return prevData;
    var srcContent = ((prevData.stockInfo || {})[srcStock] || {})[srcTab.id];
    if (!srcContent) return prevData;
    var srcHtml = (typeof srcContent === "string") ? srcContent : (srcContent.html || "");
    if (!srcHtml) return prevData;
    
    var dstTabs = (prevAllTabs[dstStock] || []).slice();
    var dstTab = dstTabs.find(function(t){ return t.name === tabName; });
    var newAllTabs = Object.assign({}, prevAllTabs);
    if (!dstTab) {
      dstTab = { id: "tab_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), name: tabName };
      dstTabs.push(dstTab);
      newAllTabs[dstStock] = dstTabs;
    }
    
    var prevSI = prevData.stockInfo || {};
    var prevForDst = prevSI[dstStock] || {};
    var existingContent = prevForDst[dstTab.id];
    var existingHtml = "";
    if (existingContent) {
      existingHtml = (typeof existingContent === "string") ? existingContent : (existingContent.html || "");
    }
    var sep = existingHtml ? '<p><br></p><p style="color:#888;font-size:12px">— ' + srcStock + ' から引用 —</p>' : '<p style="color:#888;font-size:12px">— ' + srcStock + ' から引用 —</p>';
    var newHtml = existingHtml + sep + srcHtml;
    var newForDst = Object.assign({}, prevForDst);
    newForDst[dstTab.id] = { html: newHtml, updatedAt: Date.now() };
    var newSI = Object.assign({}, prevSI);
    newSI[dstStock] = newForDst;
    return Object.assign({}, prevData, {
      custom: Object.assign({}, prevCustom, { stockInfoTabs: newAllTabs }),
      stockInfo: newSI
    });
  });
}


function StockInfoTabsManagementModal(_props_simm) {
  var data = _props_simm.data;
  var save = _props_simm.save;
  var stockName = _props_simm.stockName;
  var tabs = _props_simm.tabs;
  var allStocks = _props_simm.allStocks;
  var onClose = _props_simm.onClose;

  var custom = data.custom || {};

  var _us_addNm = useState(""), _us_addNmA = _slicedToArray(_us_addNm, 2),
      addName = _us_addNmA[0], setAddName = _us_addNmA[1];
  var _us_renId = useState(null), _us_renIdA = _slicedToArray(_us_renId, 2),
      renamingId = _us_renIdA[0], setRenamingId = _us_renIdA[1];
  var _us_renNm = useState(""), _us_renNmA = _slicedToArray(_us_renNm, 2),
      renamingName = _us_renNmA[0], setRenamingName = _us_renNmA[1];
  var _us_cpOpen = useState(false), _us_cpOpenA = _slicedToArray(_us_cpOpen, 2),
      copyOpen = _us_cpOpenA[0], setCopyOpen = _us_cpOpenA[1];

  useModalBack(true, onClose, "si-mgmt");

  var existingNames = tabs.map(function(t){ return t.name; });

  var doAdd = function(forceName) {
    var nm = ((forceName != null ? forceName : addName) || "").trim();
    if (!nm) return;
    _siAddTab(save, stockName, nm);
    setAddName("");
  };
  var doRename = function(forceName) {
    var nm = ((forceName != null ? forceName : renamingName) || "").trim();
    if (!nm || !renamingId) return;
    if (existingNames.indexOf(nm) >= 0 && tabs.find(function(t){ return t.id === renamingId && t.name !== nm; })) {
      window._snAlert("同名のタブが既に存在します");
      return;
    }
    _siRenameTab(save, stockName, renamingId, nm);
    setRenamingId(null);
    setRenamingName("");
  };
  var doDel = function(t) {
    window._snConfirm("タブ「" + t.name + "」を削除しますか?\nこのタブの内容も完全に削除されます。").then(function(_ok){ if(!_ok) return;
    _siDelTab(save, stockName, t.id);
    });
  };
  var doTemplateAdd = function(nm) {
    if (existingNames.indexOf(nm) >= 0) {
      window._snAlert("「" + nm + "」は既に存在します");
      return;
    }
    _siAddTab(save, stockName, nm);
  };

  
  var copyCandidates = useMemo(function() {
    if (!copyOpen) return [];
    var allTabs = custom.stockInfoTabs || {};
    var out = [];
    Object.keys(allTabs).forEach(function(sn) {
      if (sn === stockName) return;
      (allTabs[sn] || []).forEach(function(t) {
        
        var content = ((data.stockInfo || {})[sn] || {})[t.id];
        var hasHtml = false;
        if (content) {
          var h = (typeof content === "string") ? content : (content.html || "");
          if (_hasText(h)) hasHtml = true;
        }
        if (hasHtml) out.push({ stock: sn, tabName: t.name });
      });
    });
    return out;
  }, [copyOpen, custom.stockInfoTabs, data.stockInfo, stockName]);

  var doCopy = function(srcStock, tabName) {
    window._snConfirm(srcStock + " の「" + tabName + "」タブの内容を、" + stockName + " の同名タブ末尾に引用追記しますか?").then(function(_ok){ if(!_ok) return;
    _siCopyFromOtherStock(save, srcStock, stockName, tabName);
    });
  };

  return React.createElement("div", {
    onClick: onClose,
    style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }
  },
    React.createElement("div", {
      onClick: function(e){ e.stopPropagation(); },
      style: { background: "#fff", borderRadius: 10, padding: 16,
        maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto" }
    },
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", marginBottom: 12 }
      },
        React.createElement("div", {
          style: { fontSize: 16, fontWeight: 700, flex: 1 }
        }, "⚙️ " + stockName + " のタブ管理"),
        React.createElement("button", {
          onClick: onClose,
          style: { width: 28, height: 28, borderRadius: "50%",
            background: "rgba(0,0,0,0.1)", border: "none", fontSize: 14,
            cursor: "pointer", fontWeight: 700 }
        }, "✕")
      ),
      
      tabs.length > 0 && React.createElement("div", {
        style: { marginBottom: 16 }
      },
        React.createElement("div", {
          style: { fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 6 }
        }, "📋 既存タブ"),
        tabs.map(function(t, i) {
          var isRenaming = renamingId === t.id;
          return React.createElement("div", {
            key: t.id,
            style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 8px",
              background: "#fafaf7", border: "1px solid #e8e5df", borderRadius: 6,
              marginBottom: 4, flexWrap: "wrap" }
          },
            isRenaming
              ? React.createElement(FastInput, {
                  type: "text",
                  value: renamingName,
                  onChange: function(v){ setRenamingName(v); },
                  onKeyDown: function(e){
                    if (e.key === "Enter") {
                      
                      var v = (e.target && e.target.value) || "";
                      setRenamingName(v);
                      
                      Promise.resolve().then(function(){ doRename(v); });
                    }
                    if (e.key === "Escape") { setRenamingId(null); setRenamingName(""); }
                  },
                  autoFocus: true,
                  style: { flex: 1, minWidth: 120, padding: "4px 6px", fontSize: 13,
                    border: "1.5px solid #6366F1", borderRadius: 4 }
                })
              : React.createElement("div", {
                  style: { flex: 1, minWidth: 120, fontSize: 13, fontWeight: 600, color: "#222" }
                }, t.name),
            isRenaming
              ? [
                  React.createElement("button", {
                    key: "ok",
                    
                    onMouseDown: function(e){ e.preventDefault(); }, 
                    onClick: function(){
                      
                      var inp = document.activeElement;
                      var v = (inp && inp.tagName === "INPUT") ? inp.value : renamingName;
                      setRenamingName(v);
                      Promise.resolve().then(function(){ doRename(v); });
                    },
                    style: { padding: "3px 9px", fontSize: 11, fontWeight: 700,
                      background: "#16A34A", color: "#fff", border: "none", borderRadius: 4,
                      cursor: "pointer" }
                  }, "OK"),
                  React.createElement("button", {
                    key: "cancel",
                    onClick: function(){ setRenamingId(null); setRenamingName(""); },
                    style: { padding: "3px 9px", fontSize: 11, fontWeight: 600,
                      background: "#fff", color: "#666", border: "1px solid #ddd",
                      borderRadius: 4, cursor: "pointer" }
                  }, "キャンセル")
                ]
              : [
                  React.createElement("button", {
                    key: "ren",
                    onClick: function(){ setRenamingId(t.id); setRenamingName(t.name); },
                    title: "リネーム",
                    style: { padding: "3px 8px", fontSize: 11, fontWeight: 600,
                      background: "#fff", color: "#555", border: "1px solid #ddd",
                      borderRadius: 4, cursor: "pointer" }
                  }, "✎"),
                  React.createElement("button", {
                    key: "left",
                    onClick: function(){ _siReorderTab(save, stockName, t.id, -1); },
                    disabled: i === 0,
                    title: "左へ",
                    style: { padding: "3px 8px", fontSize: 11, fontWeight: 600,
                      background: i === 0 ? "#f5f5f5" : "#fff",
                      color: i === 0 ? "#ccc" : "#555",
                      border: "1px solid #ddd", borderRadius: 4,
                      cursor: i === 0 ? "not-allowed" : "pointer" }
                  }, "←"),
                  React.createElement("button", {
                    key: "right",
                    onClick: function(){ _siReorderTab(save, stockName, t.id, 1); },
                    disabled: i === tabs.length - 1,
                    title: "右へ",
                    style: { padding: "3px 8px", fontSize: 11, fontWeight: 600,
                      background: i === tabs.length - 1 ? "#f5f5f5" : "#fff",
                      color: i === tabs.length - 1 ? "#ccc" : "#555",
                      border: "1px solid #ddd", borderRadius: 4,
                      cursor: i === tabs.length - 1 ? "not-allowed" : "pointer" }
                  }, "→"),
                  React.createElement("button", {
                    key: "del",
                    onClick: function(){ doDel(t); },
                    title: "削除",
                    style: { padding: "3px 8px", fontSize: 11, fontWeight: 600,
                      background: "#fff", color: "#DC2626",
                      border: "1px solid #FCA5A5", borderRadius: 4, cursor: "pointer" }
                  }, "🗑")
                ]
          );
        })
      ),
      
      React.createElement("div", {
        style: { marginBottom: 16, paddingTop: 12, borderTop: "1px solid #eee" }
      },
        React.createElement("div", {
          style: { fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 6 }
        }, "➕ 新規タブ追加"),
        React.createElement("div", {
          style: { display: "flex", gap: 6, marginBottom: 8 }
        },
          React.createElement(FastInput, {
            type: "text",
            value: addName,
            onChange: function(v){ setAddName(v); },
            onKeyDown: function(e){
              if (e.key === "Enter") {
                var v = (e.target && e.target.value) || "";
                setAddName(v);
                Promise.resolve().then(function(){ doAdd(v); });
              }
            },
            placeholder: "\u30BF\u30D6\u540D (\u4F8B: \u4E3B\u8981\u9867\u5BA2\u3001\u7AF6\u5408\u4ED6\u793E)",
            style: { flex: 1, padding: "6px 8px", fontSize: 13,
              border: "1px solid #ddd", borderRadius: 5 }
          }),
          React.createElement("button", {
            onMouseDown: function(e){ e.preventDefault(); },
            onClick: function(){
              var inp = document.activeElement;
              var v = (inp && inp.tagName === "INPUT") ? inp.value : addName;
              setAddName(v);
              Promise.resolve().then(function(){ doAdd(v); });
            },
            style: { padding: "6px 14px", fontSize: 12, fontWeight: 700,
              background: "#1a1a1a", color: "#fff", border: "none",
              borderRadius: 5, cursor: "pointer" }
          }, "\u8FFD\u52A0")
        ),
        React.createElement("div", {
          style: { fontSize: 11, color: "#888", marginBottom: 6 }
        }, "📋 テンプレートから追加 (タップで即追加):"),
        React.createElement("div", {
          style: { display: "flex", flexWrap: "wrap", gap: 4 }
        }, SI_TEMPLATE_TAB_NAMES.map(function(nm) {
          var dup = existingNames.indexOf(nm) >= 0;
          return React.createElement("button", {
            key: "tpl_" + nm,
            onClick: function(){ doTemplateAdd(nm); },
            disabled: dup,
            title: dup ? "既に存在" : nm + " を追加",
            style: { padding: "4px 10px", fontSize: 11, fontWeight: 600,
              background: dup ? "#f5f5f5" : "#EEF2FF",
              color: dup ? "#aaa" : "#4338CA",
              border: "1px solid " + (dup ? "#ddd" : "#C7D2FE"),
              borderRadius: 4, cursor: dup ? "not-allowed" : "pointer" }
          }, (dup ? "✓ " : "+ ") + nm);
        }))
      ),
      
      React.createElement("div", {
        style: { marginBottom: 8, paddingTop: 12, borderTop: "1px solid #eee" }
      },
        React.createElement("button", {
          onClick: function(){ setCopyOpen(!copyOpen); },
          style: { padding: "6px 10px", fontSize: 12, fontWeight: 700,
            background: copyOpen ? "#EEF2FF" : "#fff",
            color: copyOpen ? "#4338CA" : "#555",
            border: "1px solid " + (copyOpen ? "#C7D2FE" : "#ddd"),
            borderRadius: 5, cursor: "pointer", marginBottom: 6 }
        }, (copyOpen ? "▼" : "▶") + " 📋 他銘柄からコピー"),
        copyOpen && React.createElement("div", {
          style: { padding: 8, background: "#fafaf7", border: "1px solid #e8e5df", borderRadius: 6 }
        },
          React.createElement("div", {
            style: { fontSize: 11, color: "#888", marginBottom: 6 }
          }, "他銘柄に内容のあるタブの一覧。タップで " + stockName + " の同名タブ末尾に引用追記されます。"),
          copyCandidates.length === 0
            ? React.createElement("div", {
                style: { fontSize: 11, color: "#999", padding: 8, textAlign: "center" }
              }, "コピー可能なタブがありません")
            : React.createElement("div", {
                style: { display: "flex", flexDirection: "column", gap: 3 }
              }, copyCandidates.map(function(c, ci) {
                return React.createElement("button", {
                  key: "cp_" + ci,
                  onClick: function(){ doCopy(c.stock, c.tabName); },
                  style: { padding: "5px 8px", fontSize: 11, fontWeight: 600,
                    background: "#fff", color: "#222",
                    border: "1px solid #ddd", borderRadius: 4, cursor: "pointer",
                    textAlign: "left" }
                }, "↪ " + c.stock + " › " + c.tabName);
              }))
        )
      )
    )
  );
}



function _renderUnsavedDialog(dlg, opts) {
  if (!dlg) return null;
  opts = opts || {};
  var title = opts.title || "保存していない変更があります";
  var msg = opts.msg || "編集中の内容を保存しますか？";
  return ReactDOM.createPortal(
    React.createElement("div", {
      onClick: function(){ dlg("cancel"); },
      style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 11500, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16 }
    },
      React.createElement("div", {
        onClick: function(e){ e.stopPropagation(); },
        style: { background: "#fff", borderRadius: 12, padding: "20px 20px 16px",
          width: "100%", maxWidth: 380, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }
      },
        React.createElement("div", {
          style: { fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }
        }, title),
        React.createElement("div", {
          style: { fontSize: 13, color: "#555", marginBottom: 16, lineHeight: 1.6 }
        }, msg),
        React.createElement("div", {
          style: { display: "flex", flexDirection: "column", gap: 8 }
        },
          React.createElement("button", {
            onClick: function(){ dlg("save"); },
            style: { padding: "10px 14px", fontSize: 14, fontWeight: 700,
              background: "#1a1a1a", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer",
              minHeight: IS_TOUCH ? 44 : 38 }
          }, "💾 保存して終了"),
          React.createElement("button", {
            onClick: function(){ dlg("discard"); },
            style: { padding: "10px 14px", fontSize: 13, fontWeight: 600,
              background: "#fff", color: "#C0392B",
              border: "1.5px solid #C0392B", borderRadius: 6, cursor: "pointer",
              minHeight: IS_TOUCH ? 44 : 38 }
          }, "🗑 保存せず終了"),
          React.createElement("button", {
            onClick: function(){ dlg("cancel"); },
            style: { padding: "10px 14px", fontSize: 13, fontWeight: 600,
              background: "#fff", color: "#666",
              border: "1px solid #ccc", borderRadius: 6, cursor: "pointer",
              minHeight: IS_TOUCH ? 44 : 38 }
          }, "✎ 編集に戻る")
        )
      )
    ),
    document.body
  );
}











function MemoEditableField(_propsMEF) {
  var html = _propsMEF.html || "";
  var onSave = _propsMEF.onSave;
  
  
  var onChangeProp = _propsMEF.onChange;
  var placeholder = _propsMEF.placeholder || "";
  var autoEdit = !!_propsMEF.autoEdit;
  var guardOwner = _propsMEF.guardOwner || null;
  var imgHeight = _propsMEF.imgHeight; 
  
  
  var inlineButtons = (_propsMEF.inlineButtons !== false);
  
  var _us_e = useState(autoEdit), _us_eA = _slicedToArray(_us_e, 2),
      editing = _us_eA[0], setEditing = _us_eA[1];
  
  var _us_d = useState(html), _us_dA = _slicedToArray(_us_d, 2),
      draft = _us_dA[0], setDraft = _us_dA[1];
  
  
  var initHtmlRef = useRef(html);
  
  var _us_g = useState(null), _us_gA = _slicedToArray(_us_g, 2),
      unsavedDlg = _us_gA[0], setUnsavedDlg = _us_gA[1];
  
  var _us_zi = useState(null), _us_ziA = _slicedToArray(_us_zi, 2),
      zoomImg = _us_ziA[0], setZoomImg = _us_ziA[1];
  useModalBack(zoomImg != null, function(){ setZoomImg(null); }, "mef-zoom");
  
  var enterEdit = function() {
    initHtmlRef.current = html;
    setDraft(html);
    setEditing(true);
  };
  
  var exitEdit = function(opts) {
    var revert = opts && opts.revert;
    if (revert && typeof onChangeProp === "function") {
      
      try { onChangeProp(initHtmlRef.current); } catch(e){}
    }
    setEditing(autoEdit);
    setDraft(initHtmlRef.current);
  };
  
  var doSave = function() {
    if (typeof onSave === "function") onSave(draft);
    initHtmlRef.current = draft;
    if (!autoEdit) setEditing(false);
  };
  
  var _isDirty = function() { return editing && draft !== initHtmlRef.current; };
  
  var _confirmExitEdit = function(cb) {
    if (!_isDirty()) { exitEdit(); cb(); return; }
    setUnsavedDlg(function() {
      return function(choice) {
        setUnsavedDlg(null);
        if (choice === "save") { doSave(); exitEdit(); cb(); }
        else if (choice === "discard") { exitEdit({ revert: true }); cb(); }
        
      };
    });
  };
  
  useEffect(function() {
    if (!editing || !guardOwner) {
      if (window.__snEditingGuard && window.__snEditingGuard.owner === guardOwner) {
        try { delete window.__snEditingGuard; } catch(e){ window.__snEditingGuard = null; }
      }
      return;
    }
    window.__snEditingGuard = {
      owner: guardOwner,
      canLeave: function(cb) {
        if (!_isDirty()) { cb(); return; }
        _confirmExitEdit(cb);
      }
    };
    var beforeUnloadHandler = function(e) {
      if (!_isDirty()) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return function() {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      if (window.__snEditingGuard && window.__snEditingGuard.owner === guardOwner) {
        try { delete window.__snEditingGuard; } catch(e){ window.__snEditingGuard = null; }
      }
    };
  }, [editing, draft, html, guardOwner]);
  
  
  var tryCloseRef = _propsMEF.tryCloseRef;
  useEffect(function() {
    if (!tryCloseRef) return;
    tryCloseRef.current = {
      tryClose: function(cb) {
        if (!_isDirty()) { cb(); return; }
        _confirmExitEdit(cb);
      },
      isDirty: function() { return _isDirty(); },
      saveAndClose: function(cb) { doSave(); exitEdit(); cb && cb(); }
    };
    return function() { if (tryCloseRef.current) tryCloseRef.current = null; };
  }, [editing, draft, html]);

  return React.createElement(React.Fragment, null,
    editing
      ? 
        React.createElement("div", null,
          
          inlineButtons && React.createElement("div", {
            style: { display: "flex", alignItems: "stretch", gap: 8, marginBottom: 6 }
          },
            React.createElement("div", {
              style: { padding: "4px 8px", fontSize: 11, fontWeight: 700,
                background: "#FEF3C7", color: "#92400E",
                border: "1px solid #FCD34D", borderRadius: 4,
                flex: 1, display: "flex", alignItems: "center" }
            }, "✎ 編集中 — 「保存」を押すまで変更は反映されません"),
            React.createElement("button", {
              onClick: function() {
                if (!_isDirty()) { exitEdit(); return; }
                window._snConfirm("編集内容を破棄しますか？").then(function(_ok){ if(_ok) exitEdit({ revert: true }); });
              },
              style: { padding: "7px 14px", fontSize: 12, fontWeight: 700,
                background: "#fff", color: "#666",
                border: "1px solid #ccc", borderRadius: 5, cursor: "pointer",
                minHeight: IS_TOUCH ? 38 : 32, flexShrink: 0 }
            }, "✕ キャンセル"),
            React.createElement("button", {
              onClick: doSave,
              style: { padding: "7px 16px", fontSize: 12, fontWeight: 700,
                background: "#1a1a1a", color: "#fff",
                border: "1.5px solid #1a1a1a", borderRadius: 5, cursor: "pointer",
                minHeight: IS_TOUCH ? 38 : 32, flexShrink: 0 }
            }, "💾 保存")
          ),
          React.createElement(RichMemoEditor, Object.assign({
            initialHtml: html,
            onChange: function(h) {
              setDraft(h);
              if (typeof onChangeProp === "function") onChangeProp(h);
            },
            placeholder: placeholder
          }, imgHeight ? { imgHeight: imgHeight } : {}))
        )
      : 
        React.createElement("div", { className: "si-readonly" },
          React.createElement("style", null,
            ".si-readonly { display: flow-root; } " +  
            ".si-readonly .sn-rme-img-del { display: none !important; } " +
            ".si-readonly .sn-rme-img-wrap { cursor: default; } " +
            ".si-readonly img[data-sn-rme-img] { cursor: zoom-in; }"
          ),
          
          zoomImg && React.createElement(ZoomLightbox, {
            src: zoomImg.src,
            onClose: function() { setZoomImg(null); },
            annotProps: {
              img: { base64: zoomImg.base64, mt: zoomImg.mt },
              onSave: function(ed) {
                if (ed.base64 && typeof onSave === "function") {
                  var newSrc = "data:" + (ed.mt || "image/png") + ";base64," + ed.base64;
                  
                  var updatedHtml = html.replace(zoomImg.src, newSrc);
                  onSave(updatedHtml);
                }
                setZoomImg(null);
              }
            }
          }),
          html
            ? React.createElement("div", {
                onClick: function(e) {
                  
                  if (e.target && e.target.tagName === "IMG") {
                    var imgSrc2 = e.target.src || "";
                    var b64 = imgSrc2.replace(/^data:[^;]+;base64,/, "");
                    var mt2 = (imgSrc2.match(/^data:([^;]+)/) || [])[1] || "image/png";
                    setZoomImg({ src: imgSrc2, base64: b64, mt: mt2 });
                    return;
                  }
                  enterEdit();
                },
                dangerouslySetInnerHTML: { __html: html },
                title: "クリックで編集モードに切替",
                style: { padding: "8px 4px", minHeight: 60, fontSize: 14, lineHeight: 1.7,
                  wordBreak: "break-word", cursor: "pointer", borderRadius: 4,
                  transition: "background 0.15s" },
                onMouseEnter: function(e) { e.currentTarget.style.background = "#fafaf7"; },
                onMouseLeave: function(e) { e.currentTarget.style.background = "transparent"; }
              })
            : React.createElement("div", {
                onClick: enterEdit,
                title: "クリックで編集モードに切替",
                style: { padding: "20px 8px", color: "#999", fontStyle: "italic", fontSize: 13,
                  textAlign: "center", background: "#fafaf7", borderRadius: 4,
                  cursor: "pointer", border: "1px dashed #ddd",
                  transition: "background 0.15s, border-color 0.15s" },
                onMouseEnter: function(e) {
                  e.currentTarget.style.background = "#EEF2FF";
                  e.currentTarget.style.borderColor = "#C7D2FE";
                },
                onMouseLeave: function(e) {
                  e.currentTarget.style.background = "#fafaf7";
                  e.currentTarget.style.borderColor = "#ddd";
                }
              }, placeholder || "（未入力）クリック / タップして入力")
        ),
    _renderUnsavedDialog(unsavedDlg)
  );
}


function StockInfoSection(_props_si) {
  var data = _props_si.data;
  var save = _props_si.save;
  var stockName = _props_si.stockName;
  var allStocks = _props_si.allStocks;

  var custom = data.custom || {};
  var tabs = _siGetTabs(custom, stockName);

  
  var _us_si_col = useState(function() {
    try { return localStorage.getItem("sn_si_collapsed_v1") === "1"; } catch(e){ return false; }
  });
  var _us_si_colA = _slicedToArray(_us_si_col, 2),
      collapsed = _us_si_colA[0], setCollapsed = _us_si_colA[1];
  var togCollapse = function() {
    var nx = !collapsed;
    setCollapsed(nx);
    try { localStorage.setItem("sn_si_collapsed_v1", nx ? "1" : "0"); } catch(e){}
  };
  
  var togCollapseGuarded = function() {
    if (collapsed) { togCollapse(); return; } 
    _confirmExitEdit(togCollapse);
  };

  
  var _us_si_act = useState(function() {
    try {
      var v = JSON.parse(localStorage.getItem("sn_si_active_v1") || "{}");
      if (v && typeof v === "object") return v;
    } catch(e){}
    return {};
  });
  var _us_si_actA = _slicedToArray(_us_si_act, 2),
      activeTabIdMap = _us_si_actA[0], setActiveTabIdMap = _us_si_actA[1];
  var activeTabId = activeTabIdMap[stockName];
  
  if (tabs.length > 0 && !tabs.find(function(t){ return t.id === activeTabId; })) {
    activeTabId = tabs[0].id;
  }
  var setActiveTabId = function(tid) {
    var nx = Object.assign({}, activeTabIdMap);
    nx[stockName] = tid;
    setActiveTabIdMap(nx);
    try { localStorage.setItem("sn_si_active_v1", JSON.stringify(nx)); } catch(e){}
  };

  
  var _us_si_mgmt = useState(false), _us_si_mgmtA = _slicedToArray(_us_si_mgmt, 2),
      mgmtOpen = _us_si_mgmtA[0], setMgmtOpen = _us_si_mgmtA[1];

  
  
  var _us_si_ed = useState(false), _us_si_edA = _slicedToArray(_us_si_ed, 2),
      editing = _us_si_edA[0], setEditing = _us_si_edA[1];
  var _us_si_dr = useState(""), _us_si_drA = _slicedToArray(_us_si_dr, 2),
      editDraft = _us_si_drA[0], setEditDraft = _us_si_drA[1];
  var _us_si_etb = useState(""), _us_si_etbA = _slicedToArray(_us_si_etb, 2),
      editTabId = _us_si_etbA[0], setEditTabId = _us_si_etbA[1];
  var _us_si_est = useState(""), _us_si_estA = _slicedToArray(_us_si_est, 2),
      editStock = _us_si_estA[0], setEditStock = _us_si_estA[1];
  
  var _us_si_exp = useState(false), _us_si_expA = _slicedToArray(_us_si_exp, 2),
      contentExpanded = _us_si_expA[0], setContentExpanded = _us_si_expA[1];
  
  var _us_si_ovf = useState(false), _us_si_ovfA = _slicedToArray(_us_si_ovf, 2),
      contentOverflows = _us_si_ovfA[0], setContentOverflows = _us_si_ovfA[1];
  var contentDispRef = useRef(null);
  var SI_MAX_VIEW_PX = 360; 
  
  var _exitEdit = function() {
    setEditing(false);
    setEditDraft("");
    setEditTabId("");
    setEditStock("");
  };
  
  var _persistDraft = function() {
    if (!editing || !editTabId || !editStock) return;
    _siUpdateTabContent(save, editStock, editTabId, editDraft);
  };
  
  
  var _us_si_dlg = useState(null), _us_si_dlgA = _slicedToArray(_us_si_dlg, 2),
      unsavedDlg = _us_si_dlgA[0], setUnsavedDlg = _us_si_dlgA[1];
  
  var _confirmExitEdit = function(cb) {
    if (!editing) { cb(); return; }
    setUnsavedDlg(function() {
      return function(choice) {
        setUnsavedDlg(null);
        if (choice === "save") {
          _persistDraft();
          _exitEdit();
          cb();
        } else if (choice === "discard") {
          _exitEdit();
          cb();
        }
        
      };
    });
  };
  
  useEffect(function() {
    if (!editing) return;
    if (activeTabId !== editTabId || stockName !== editStock) _exitEdit();
  }, [activeTabId, stockName]);
  
  
  
  useEffect(function() {
    if (editing && (collapsed || mgmtOpen)) {
      
      _exitEdit();
    }
  }, [collapsed, mgmtOpen]);
  
  
  
  
  useEffect(function() {
    if (!editing) {
      
      if (window.__snEditingGuard && window.__snEditingGuard.owner === "stockInfo") {
        try { delete window.__snEditingGuard; } catch(e){ window.__snEditingGuard = null; }
      }
      return;
    }
    window.__snEditingGuard = {
      owner: "stockInfo",
      canLeave: function(cb) { _confirmExitEdit(cb); }
    };
    
    var beforeUnloadHandler = function(e) {
      e.preventDefault();
      e.returnValue = ""; 
      return "";
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return function() {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      if (window.__snEditingGuard && window.__snEditingGuard.owner === "stockInfo") {
        try { delete window.__snEditingGuard; } catch(e){ window.__snEditingGuard = null; }
      }
    };
  }, [editing, editDraft, editTabId, editStock]);
  
  useEffect(function() {
    setContentExpanded(false);
    var t = setTimeout(function() {
      var n = contentDispRef.current;
      if (!n) { setContentOverflows(false); return; }
      setContentOverflows(n.scrollHeight > SI_MAX_VIEW_PX + 4);
    }, 0);
    return function(){ clearTimeout(t); };
  }, [activeTabId, stockName, editing]);

  
  
  
  var _us_si_initedRef = useRef({});
  useEffect(function() {
    if (_us_si_initedRef.current[stockName]) return;
    var rawAll = (custom.stockInfoTabs || {});
    if (rawAll.hasOwnProperty(stockName)) { _us_si_initedRef.current[stockName] = true; return; }
    if (tabs.length > 0) { _us_si_initedRef.current[stockName] = true; return; }
    
    _us_si_initedRef.current[stockName] = true;
    save(function(prevData) {
      var prevCustom = prevData.custom || {};
      var prevAll = prevCustom.stockInfoTabs || {};
      if (prevAll[stockName]) return prevData; 
      var newTabs = SI_DEFAULT_TAB_NAMES.map(function(nm, i) {
        return { id: "tab_" + Date.now() + "_" + i, name: nm };
      });
      var newAll = Object.assign({}, prevAll);
      newAll[stockName] = newTabs;
      return Object.assign({}, prevData, {
        custom: Object.assign({}, prevCustom, { stockInfoTabs: newAll })
      });
    });
  }, [stockName]);

  
  var quickAdd = function() {
    _confirmExitEdit(function() {
      window._snPrompt("新しいタブ名を入力してください", "").then(function(nm){
      if (!nm) return;
      _siAddTab(save, stockName, nm);
      });
    });
  };

  var content = activeTabId ? _siGetTabContent(data, stockName, activeTabId) : { html: "", updatedAt: 0 };

  return React.createElement("div", {
    style: { background: "#fff", border: "1px solid #e8e5df", borderRadius: 8,
      padding: 10, marginBottom: 12 }
  },
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8,
        marginBottom: collapsed ? 0 : 8 }
    },
      React.createElement("button", {
        onClick: togCollapseGuarded,
        title: collapsed ? "展開" : "折りたたむ",
        style: { padding: "3px 6px", fontSize: 12, fontWeight: 700,
          background: "transparent", color: "#666",
          border: "none", cursor: "pointer" }
      }, collapsed ? "▶" : "▼"),
      React.createElement("div", {
        style: { fontSize: 13, fontWeight: 700, color: "#1a1a1a", flex: 1 }
      }, "📋 銘柄情報",
        tabs.length > 0 && React.createElement("span", {
          style: { fontSize: 10, color: "#888", fontWeight: 600, marginLeft: 6 }
        }, "(" + tabs.length + " タブ)")
      ),
      !collapsed && React.createElement("button", {
        onClick: function(){ _confirmExitEdit(function(){ setMgmtOpen(true); }); },
        title: "タブの追加・削除・並び替え・リネーム",
        style: { padding: "4px 10px", fontSize: 11, fontWeight: 700,
          background: "#fff", color: "#555",
          border: "1px solid #ddd", borderRadius: 5, cursor: "pointer" }
      }, "⚙️ タブ管理")
    ),
    !collapsed && React.createElement("div", null,
      
      tabs.length === 0
        ? React.createElement("div", {
            style: { fontSize: 12, color: "#999", padding: 12, textAlign: "center",
              background: "#fafaf7", border: "1px dashed #ddd", borderRadius: 6 }
          },
            "タブがありません。",
            React.createElement("button", {
              onClick: function(){ _confirmExitEdit(function(){ setMgmtOpen(true); }); },
              style: { marginLeft: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 4,
                cursor: "pointer" }
            }, "+ タブを追加")
          )
        : React.createElement("div", {
            style: { display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch",
              gap: 4, paddingBottom: 4, marginBottom: 8,
              borderBottom: "1px solid #e8e5df" }
          },
            tabs.map(function(t) {
              var active = t.id === activeTabId;
              var isEditingThis = editing && t.id === editTabId && stockName === editStock;
              var tc = _siGetTabContent(data, stockName, t.id);
              var rel = _siFormatRelTime(tc.updatedAt);
              return React.createElement("button", {
                key: t.id,
                onClick: function(){
                  if (t.id === activeTabId) return;
                  _confirmExitEdit(function(){ setActiveTabId(t.id); });
                },
                style: { padding: "6px 10px", fontSize: 12, fontWeight: 700,
                  background: active ? "#1a1a1a" : "#fff",
                  color: active ? "#fff" : "#444",
                  border: active ? "1.5px solid #1a1a1a" : "1px solid #ddd",
                  borderRadius: 5, cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", gap: 4,
                  minHeight: IS_TOUCH ? 36 : 30 }
              },
                React.createElement("span", null, t.name),
                isEditingThis && React.createElement("span", {
                  title: "編集中（未保存）",
                  style: { fontSize: 11, fontWeight: 700,
                    color: active ? "#FCD34D" : "#F59E0B" }
                }, "✎"),
                rel && React.createElement("span", {
                  title: "最終更新: " + rel,
                  style: { fontSize: 9, fontWeight: 500,
                    color: active ? "rgba(255,255,255,0.7)" : "#999" }
                }, "⏰" + rel)
              );
            }),
            React.createElement("button", {
              onClick: quickAdd,
              title: "新規タブを素早く追加",
              style: { padding: "6px 10px", fontSize: 12, fontWeight: 700,
                background: "#fafaf7", color: "#666",
                border: "1px dashed #aaa", borderRadius: 5, cursor: "pointer",
                flexShrink: 0, minHeight: IS_TOUCH ? 36 : 30 }
            }, "+")
          ),
      
      activeTabId && (
        editing && editTabId === activeTabId && editStock === stockName
          ? 
            React.createElement("div", {
              key: "si_content_edit_" + stockName + "_" + activeTabId
            },
              
              React.createElement("div", {
                style: { display: "flex", alignItems: "stretch", gap: 8, marginBottom: 6 }
              },
                React.createElement("div", {
                  style: { padding: "4px 8px", fontSize: 11, fontWeight: 700,
                    background: "#FEF3C7", color: "#92400E",
                    border: "1px solid #FCD34D", borderRadius: 4,
                    flex: 1, display: "flex", alignItems: "center" }
                }, "✎ 編集中 — 「保存」を押すまで変更は反映されません"),
                React.createElement("button", {
                  onClick: function() {
                    window._snConfirm("編集内容を破棄しますか？").then(function(_ok){ if(_ok) _exitEdit(); });
                  },
                  style: { padding: "7px 14px", fontSize: 12, fontWeight: 700,
                    background: "#fff", color: "#666",
                    border: "1px solid #ccc", borderRadius: 5, cursor: "pointer",
                    minHeight: IS_TOUCH ? 38 : 32, flexShrink: 0 }
                }, "✕ キャンセル"),
                React.createElement("button", {
                  onClick: function() {
                    
                    _siUpdateTabContent(save, stockName, activeTabId, editDraft);
                    _exitEdit();
                  },
                  style: { padding: "7px 16px", fontSize: 12, fontWeight: 700,
                    background: "#1a1a1a", color: "#fff",
                    border: "1.5px solid #1a1a1a", borderRadius: 5, cursor: "pointer",
                    minHeight: IS_TOUCH ? 38 : 32, flexShrink: 0 }
                }, "💾 保存")
              ),
              React.createElement(RichMemoEditor, {
                initialHtml: content.html,
                onChange: function(h) {
                  
                  setEditDraft(h);
                },
                placeholder: ""
              })
            )
          : 
            React.createElement("div", {
              key: "si_content_view_" + stockName + "_" + activeTabId,
              className: "si-readonly"
            },
              
              React.createElement("style", null,
                ".si-readonly { display: flow-root; } " +  
                ".si-readonly .sn-rme-img-del { display: none !important; } " +
                ".si-readonly .sn-rme-img-wrap { cursor: default; } " +
                ".si-readonly img[data-sn-rme-img] { cursor: zoom-in; }"
              ),
              content.html
                ? React.createElement("div", {
                    dangerouslySetInnerHTML: { __html: content.html },
                    ref: contentDispRef,
                    onClick: function() {
                      setEditDraft(content.html || "");
                      setEditTabId(activeTabId);
                      setEditStock(stockName);
                      setEditing(true);
                    },
                    title: "クリックで編集",
                    onMouseEnter: function(e) { e.currentTarget.style.background = "#fafaf7"; },
                    onMouseLeave: function(e) { e.currentTarget.style.background = "transparent"; },
                    style: (function() {
                      var s = { padding: "8px 4px", minHeight: 60, fontSize: 14, lineHeight: 1.7,
                        wordBreak: "break-word", cursor: "pointer", borderRadius: 4,
                        transition: "background 0.15s" };
                      if (!contentExpanded) {
                        s.maxHeight = SI_MAX_VIEW_PX + "px";
                        s.overflow = "hidden";
                        if (contentOverflows) {
                          
                          s.maskImage = "linear-gradient(180deg, #000 80%, transparent)";
                          s.WebkitMaskImage = "linear-gradient(180deg, #000 80%, transparent)";
                        }
                      }
                      return s;
                    })()
                  })
                : React.createElement("div", {
                    onClick: function() {
                      setEditDraft(content.html || "");
                      setEditTabId(activeTabId);
                      setEditStock(stockName);
                      setEditing(true);
                    },
                    title: "クリックで編集",
                    onMouseEnter: function(e) {
                      e.currentTarget.style.background = "#EEF2FF";
                      e.currentTarget.style.borderColor = "#C7D2FE";
                    },
                    onMouseLeave: function(e) {
                      e.currentTarget.style.background = "#fafaf7";
                      e.currentTarget.style.borderColor = "#ddd";
                    },
                    style: { padding: "20px 8px", color: "#999", fontStyle: "italic", fontSize: 13,
                      textAlign: "center", background: "#fafaf7", borderRadius: 4,
                      cursor: "pointer", border: "1px dashed #ddd",
                      transition: "background 0.15s, border-color 0.15s" }
                  }, "（未入力）クリック / タップして入力"),
              
              content.html && (contentOverflows || contentExpanded) && React.createElement("div", {
                style: { display: "flex", justifyContent: "center", marginTop: 4 }
              },
                React.createElement("button", {
                  onClick: function(){ setContentExpanded(!contentExpanded); },
                  style: { padding: "5px 14px", fontSize: 11, fontWeight: 700,
                    background: "#fff", color: "#4338CA",
                    border: "1px solid #C7D2FE", borderRadius: 4, cursor: "pointer",
                    minHeight: IS_TOUCH ? 32 : 28 }
                }, contentExpanded ? "\u25B2 閉じる" : "\u25BC 全文表示")
              )
            )
      )
    ),
    mgmtOpen && React.createElement(StockInfoTabsManagementModal, {
      data: data,
      save: save,
      stockName: stockName,
      tabs: tabs,
      allStocks: allStocks,
      onClose: function(){ setMgmtOpen(false); }
    }),
    
    unsavedDlg && ReactDOM.createPortal(
      React.createElement("div", {
        onClick: function(){ unsavedDlg("cancel"); },
        style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 11500, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16 }
      },
        React.createElement("div", {
          onClick: function(e){ e.stopPropagation(); },
          style: { background: "#fff", borderRadius: 12, padding: "20px 20px 16px",
            width: "100%", maxWidth: 380, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }
        },
          React.createElement("div", {
            style: { fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }
          }, "保存していない変更があります"),
          React.createElement("div", {
            style: { fontSize: 13, color: "#555", marginBottom: 16, lineHeight: 1.6 }
          }, "編集中の銘柄情報を保存しますか？"),
          React.createElement("div", {
            style: { display: "flex", flexDirection: "column", gap: 8 }
          },
            React.createElement("button", {
              onClick: function(){ unsavedDlg("save"); },
              style: { padding: "10px 14px", fontSize: 14, fontWeight: 700,
                background: "#1a1a1a", color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer",
                minHeight: IS_TOUCH ? 44 : 38 }
            }, "💾 保存して終了"),
            React.createElement("button", {
              onClick: function(){ unsavedDlg("discard"); },
              style: { padding: "10px 14px", fontSize: 13, fontWeight: 600,
                background: "#fff", color: "#C0392B",
                border: "1.5px solid #C0392B", borderRadius: 6, cursor: "pointer",
                minHeight: IS_TOUCH ? 44 : 38 }
            }, "🗑 保存せず終了"),
            React.createElement("button", {
              onClick: function(){ unsavedDlg("cancel"); },
              style: { padding: "10px 14px", fontSize: 13, fontWeight: 600,
                background: "#fff", color: "#666",
                border: "1px solid #ccc", borderRadius: 6, cursor: "pointer",
                minHeight: IS_TOUCH ? 44 : 38 }
            }, "✎ 編集に戻る")
          )
        )
      ),
      document.body
    )
  );
}


function StockHistoryView(_ref_shv) {
  var data = _ref_shv.data, save = _ref_shv.save, onBack = _ref_shv.onBack,
      onSelectDate = _ref_shv.onSelectDate, cfg = _ref_shv.cfg;
  var custom = data.custom || {};
  var allStocks = (custom.stocks && custom.stocks.length > 0) ? custom.stocks : _DEF_STOCKS_FROZEN;
  var stockCodes = custom.stockCodes || {};
  
  var _useS_shv1 = useState(function() {
    try { var v = localStorage.getItem("sn_shv_stock_v1"); if (v && allStocks.indexOf(v) >= 0) return v; } catch(e){}
    return allStocks[0] || "";
  });
  var _useS_shv1A = _slicedToArray(_useS_shv1, 2),
      selStock = _useS_shv1A[0], setSelStock = _useS_shv1A[1];
  var _useS_shv2 = useState(""), _useS_shv2A = _slicedToArray(_useS_shv2, 2),
      dateFrom = _useS_shv2A[0], setDateFrom = _useS_shv2A[1];
  var _useS_shv3 = useState(""), _useS_shv3A = _slicedToArray(_useS_shv3, 2),
      dateTo = _useS_shv3A[0], setDateTo = _useS_shv3A[1];
  var _useS_shv4 = useState(new Set()), _useS_shv4A = _slicedToArray(_useS_shv4, 2),
      selTags = _useS_shv4A[0], setSelTags = _useS_shv4A[1];
  var _useS_shv5 = useState(""), _useS_shv5A = _slicedToArray(_useS_shv5, 2),
      keyword = _useS_shv5A[0], setKeyword = _useS_shv5A[1];
  var _useS_shv6 = useState(false), _useS_shv6A = _slicedToArray(_useS_shv6, 2),
      showFilter = _useS_shv6A[0], setShowFilter = _useS_shv6A[1];
  
  
  var _useS_shv7 = useState(function() {
    if (custom && custom.shvExtraTags && typeof custom.shvExtraTags === "object" && !Array.isArray(custom.shvExtraTags)) {
      return custom.shvExtraTags;
    }
    try { var v = JSON.parse(localStorage.getItem("sn_shv_extra_tags_v1") || "{}");
          if (v && typeof v === "object") return v; } catch(e){}
    return {};
  });
  var _useS_shv7A = _slicedToArray(_useS_shv7, 2),
      extraTagsByStock = _useS_shv7A[0], setExtraTagsByStock = _useS_shv7A[1];
  
  useEffect(function() {
    if (custom && custom.shvExtraTags && typeof custom.shvExtraTags === "object" && !Array.isArray(custom.shvExtraTags)) {
      setExtraTagsByStock(custom.shvExtraTags);
    }
  }, [custom && custom.shvExtraTags]);
  var _useS_shv8 = useState(false), _useS_shv8A = _slicedToArray(_useS_shv8, 2),
      showExtraPicker = _useS_shv8A[0], setShowExtraPicker = _useS_shv8A[1];
  
  
  
  var _useS_shvCat = useState(function() {
    if (custom && custom.shvExtraCats && typeof custom.shvExtraCats === "object" && !Array.isArray(custom.shvExtraCats)) {
      return custom.shvExtraCats;
    }
    try { var v = JSON.parse(localStorage.getItem("sn_shv_extra_cats_v1") || "{}");
          if (v && typeof v === "object") return v; } catch(e){}
    return {};
  });
  var _useS_shvCatA = _slicedToArray(_useS_shvCat, 2),
      extraCatsByStock = _useS_shvCatA[0], setExtraCatsByStock = _useS_shvCatA[1];
  
  useEffect(function() {
    if (custom && custom.shvExtraCats && typeof custom.shvExtraCats === "object" && !Array.isArray(custom.shvExtraCats)) {
      setExtraCatsByStock(custom.shvExtraCats);
    }
  }, [custom && custom.shvExtraCats]);
  var _useS_shvCatPick = useState(false), _useS_shvCatPickA = _slicedToArray(_useS_shvCatPick, 2),
      showExtraCatPicker = _useS_shvCatPickA[0], setShowExtraCatPicker = _useS_shvCatPickA[1];
  
  
  var _useS_shvCatOpen = useState({}), _useS_shvCatOpenA = _slicedToArray(_useS_shvCatOpen, 2),
      catPickerOpenMains = _useS_shvCatOpenA[0], setCatPickerOpenMains = _useS_shvCatOpenA[1];
  
  var _useS_shvTagOpen = useState({}), _useS_shvTagOpenA = _slicedToArray(_useS_shvTagOpen, 2),
      tagPickerOpenCats = _useS_shvTagOpenA[0], setTagPickerOpenCats = _useS_shvTagOpenA[1];
  
  var _useS_shvSelCats = useState(new Set()), _useS_shvSelCatsA = _slicedToArray(_useS_shvSelCats, 2),
      selCats = _useS_shvSelCatsA[0], setSelCats = _useS_shvSelCatsA[1];
  
  var _useS_shvCA1 = useState([]), _useS_shvCA1A = _slicedToArray(_useS_shvCA1, 2),
      caMetaList = _useS_shvCA1A[0], setCaMetaList = _useS_shvCA1A[1];
  useEffect(function() {
    if (!cfg || !cfg.fbUrl) return;
    var cancelled = false;
    _caFetchMeta(cfg, false).then(function(all) {
      if (!cancelled) setCaMetaList(all || []);
    }).catch(function(){ if (!cancelled) setCaMetaList([]); });
    return function(){ cancelled = true; };
  }, [cfg && cfg.fbUrl, selStock]);
  
  var _useS_dc1 = useState([]), _useS_dc1A = _slicedToArray(_useS_dc1, 2),
      dcBars = _useS_dc1A[0], setDcBars = _useS_dc1A[1];
  var _useS_dc2 = useState(""), _useS_dc2A = _slicedToArray(_useS_dc2, 2),
      dcStatus = _useS_dc2A[0], setDcStatus = _useS_dc2A[1]; 
  var _useS_dc3 = useState(0), _useS_dc3A = _slicedToArray(_useS_dc3, 2),
      dcUploadedAt = _useS_dc3A[0], setDcUploadedAt = _useS_dc3A[1];
  var dcFileInputRef = useRef(null);
  
  var _useS_dcCa1 = useState([]), _useS_dcCa1A = _slicedToArray(_useS_dcCa1, 2),
      dcCaExtraBars = _useS_dcCa1A[0], setDcCaExtraBars = _useS_dcCa1A[1];
  var _useS_dcCa2 = useState(""), _useS_dcCa2A = _slicedToArray(_useS_dcCa2, 2),
      dcCaStatus = _useS_dcCa2A[0], setDcCaStatus = _useS_dcCa2A[1]; 
  var _useS_dcCa3 = useState(""), _useS_dcCa3A = _slicedToArray(_useS_dcCa3, 2),
      dcCaErr = _useS_dcCa3A[0], setDcCaErr = _useS_dcCa3A[1];
  
  var currentExtraTags = (selStock && extraTagsByStock[selStock]) || [];
  
  
  
  var pool = makeTagPoolHandlers(data, save, custom);
  var wrappedPool = Object.assign({}, pool, {
    onRenameCat: function(oldName, newName) {
      pool.onRenameCat(oldName, newName);
      setExtraTagsByStock(function(prev) {
        var nx = {};
        Object.keys(prev || {}).forEach(function(stk) {
          var arr = prev[stk] || [];
          nx[stk] = arr.map(function(t) {
            var idx = t.indexOf(":");
            if (idx < 0) return t;
            var cPart = t.slice(0, idx), nPart = t.slice(idx + 1);
            return cPart === oldName ? (newName + ":" + nPart) : t;
          });
        });
        return nx;
      });
      setSelTags(function(prev) {
        var nx = new Set();
        prev.forEach(function(t) {
          var idx = t.indexOf(":");
          if (idx < 0) { nx.add(t); return; }
          var cPart = t.slice(0, idx), nPart = t.slice(idx + 1);
          nx.add(cPart === oldName ? (newName + ":" + nPart) : t);
        });
        return nx;
      });
    },
    onRenameItem: function(cat, oldName, newName) {
      pool.onRenameItem(cat, oldName, newName);
      var oldT = cat + ":" + oldName, newT = cat + ":" + newName;
      setExtraTagsByStock(function(prev) {
        var nx = {};
        Object.keys(prev || {}).forEach(function(stk) {
          var arr = prev[stk] || [];
          nx[stk] = arr.map(function(t) { return t === oldT ? newT : t; });
        });
        return nx;
      });
      setSelTags(function(prev) {
        var nx = new Set();
        prev.forEach(function(t) { nx.add(t === oldT ? newT : t); });
        return nx;
      });
    },
    onRenameLoose: function(oldName, newName) {
      pool.onRenameLoose(oldName, newName);
      setExtraTagsByStock(function(prev) {
        var nx = {};
        Object.keys(prev || {}).forEach(function(stk) {
          var arr = prev[stk] || [];
          nx[stk] = arr.map(function(t) { return t === oldName ? newName : t; });
        });
        return nx;
      });
      setSelTags(function(prev) {
        var nx = new Set();
        prev.forEach(function(t) { nx.add(t === oldName ? newName : t); });
        return nx;
      });
    }
  });
  
  
  
  var _persistExtraTags = function(nx) {
    setExtraTagsByStock(nx);
    try { localStorage.setItem("sn_shv_extra_tags_v1", JSON.stringify(nx)); } catch(e){}
    save(_objectSpread(_objectSpread({}, data), {}, {
      custom: _objectSpread(_objectSpread({}, custom), {}, { shvExtraTags: nx })
    }));
  };
  var addExtraTag = function(tag) {
    if (!selStock || !tag) return;
    var nx = Object.assign({}, extraTagsByStock);
    var cur = (nx[selStock] || []).slice();
    if (cur.indexOf(tag) < 0) cur.push(tag);
    nx[selStock] = cur;
    _persistExtraTags(nx);
  };
  var removeExtraTag = function(tag) {
    if (!selStock) return;
    var nx = Object.assign({}, extraTagsByStock);
    var cur = (nx[selStock] || []).filter(function(t){ return t !== tag; });
    if (cur.length === 0) delete nx[selStock]; else nx[selStock] = cur;
    _persistExtraTags(nx);
  };
  var togExtraTag = function(tag) {
    if (currentExtraTags.indexOf(tag) >= 0) removeExtraTag(tag);
    else addExtraTag(tag);
  };
  
  var currentExtraCats = (selStock && extraCatsByStock[selStock]) || [];
  
  var _persistExtraCats = function(nx) {
    setExtraCatsByStock(nx);
    try { localStorage.setItem("sn_shv_extra_cats_v1", JSON.stringify(nx)); } catch(e){}
    save(_objectSpread(_objectSpread({}, data), {}, {
      custom: _objectSpread(_objectSpread({}, custom), {}, { shvExtraCats: nx })
    }));
  };
  var addExtraCat = function(catKey) {
    if (!selStock || !catKey) return;
    var nx = Object.assign({}, extraCatsByStock);
    var cur = (nx[selStock] || []).slice();
    if (cur.indexOf(catKey) < 0) cur.push(catKey);
    nx[selStock] = cur;
    _persistExtraCats(nx);
  };
  var removeExtraCat = function(catKey) {
    if (!selStock) return;
    var nx = Object.assign({}, extraCatsByStock);
    var cur = (nx[selStock] || []).filter(function(t){ return t !== catKey; });
    if (cur.length === 0) delete nx[selStock]; else nx[selStock] = cur;
    _persistExtraCats(nx);
  };
  var togExtraCat = function(catKey) {
    if (currentExtraCats.indexOf(catKey) >= 0) removeExtraCat(catKey);
    else addExtraCat(catKey);
  };
  
  var togSelCat = function(catKey) {
    var ns = new Set(selCats);
    if (ns.has(catKey)) ns["delete"](catKey); else ns.add(catKey);
    setSelCats(ns);
  };
  
  var allMainCats = (custom.newsCategories && custom.newsCategories.length > 0)
    ? custom.newsCategories : _DEF_NEWS_CATS_FROZEN;
  var getSubCatsFor = function(mainCat) {
    return (custom.newsSubCats && Array.isArray(custom.newsSubCats[mainCat]))
      ? custom.newsSubCats[mainCat] : [];
  };
  
  useEffect(function() {
    try { localStorage.setItem("sn_shv_stock_v1", selStock || ""); } catch(e){}
    setSelTags(new Set());
    setSelCats(new Set());
    setShowExtraPicker(false);
    setShowExtraCatPicker(false);
  }, [selStock]);
  
  useEffect(function() {
    setDcBars([]);
    setDcStatus("");
    setDcUploadedAt(0);
    
    setDcCaExtraBars([]); setDcCaStatus(""); setDcCaErr("");
    if (!selStock) return;
    
    var info = _caGetStockInfo(selStock, custom);
    var code = (info && info.code) || "";
    if (!code) {
      setDcStatus("no-code");
      return;
    }
    
    var cached = _dcCacheLoad(code);
    if (cached && cached.csv) {
      var bars = _parseDailyCsv(cached.csv);
      setDcBars(bars);
      setDcStatus("loaded");
      setDcUploadedAt(cached.uploadedAt || 0);
    }
    
    if (cfg && cfg.fbUrl) {
      setDcStatus(function(s) { return s === "loaded" ? s : "loading"; });
      
      var _shvOurAt = (cached && cached.uploadedAt) || 0;
      var _shvDoFullCsvFetch = function() {
        return _dcLoadCsvFromFb(cfg, code).then(function(res) {
          if (!res || !res.csv) {
            if (!cached) setDcStatus("no-data");
            return;
          }
          var fbAt = res.uploadedAt || 0;
          if (fbAt > _shvOurAt || !cached) {
            var bars2 = _parseDailyCsv(res.csv);
            setDcBars(bars2);
            setDcStatus("loaded");
            setDcUploadedAt(fbAt);
            _dcCacheSave(code, res.csv, fbAt);
          }
        });
      };
      if (cached && _shvOurAt > 0) {
        
        if (Date.now() - (_dcVerifiedStocks[code] || 0) < 3600000) {
          
        } else {
          _dcLoadCsvUploadedAt(cfg, code).then(function(remoteAt) {
            if (remoteAt > 0 && remoteAt <= _shvOurAt) {
              _dcVerifiedStocks[code] = Date.now();
              return;
            }
            return _shvDoFullCsvFetch().then(function() { _dcVerifiedStocks[code] = Date.now(); });
          }).catch(function() {  });
        }
      } else {
        _shvDoFullCsvFetch().then(function() { _dcVerifiedStocks[code] = Date.now(); }).catch(function() {  });
      }
    } else if (!cached) {
      setDcStatus("no-cfg");
    }
  }, [selStock, custom, cfg]);
  
  var allEntries = useMemo(function() {
    if (!selStock) return [];
    var charts = data.charts || {};
    var trades = data.trades || {};
    var info_ae = _caGetStockInfo(selStock, custom);
    var code = (info_ae && info_ae.code) || "";
    var byDate = {}; 
    var ensure = function(d) {
      if (!byDate[d]) byDate[d] = { date: d, chart: null, news: [], items: [] };
      return byDate[d];
    };
    
    Object.keys(charts).forEach(function(k) {
      var idx = k.lastIndexOf("_");
      if (idx < 0) return;
      var nm = k.slice(0, idx);
      var dt = k.slice(idx + 1);
      if (nm !== selStock) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) return;
      var c = charts[k];
      if (!c) return;
      
      var hasContent = !!(c.chartImg || (c.chartImgs && c.chartImgs.length) ||
        c.macroLocal || (c.flowCodes && c.flowCodes.length) ||
        (c.stockTags && c.stockTags.length) || (c.chartShapeTags && c.chartShapeTags.length) ||
        (c.signals && c.signals.length) ||
        (c.chartMemoHtml && c.chartMemoHtml.length > 0) ||
        (c.chartMemo && (_hasText(c.chartMemo.text) || (c.chartMemo.images && c.chartMemo.images.length))));
      if (!hasContent) return;
      ensure(dt).chart = c;
    });
    
    Object.keys(trades).forEach(function(dt) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) return;
      var dd = trades[dt] || {};
      
      var its = dd.items || [];
      its.forEach(function(it) {
        if (it && it.stock === selStock) ensure(dt).items.push(it);
      });
      
      var ncs = getAllNewsCatsData(dd);
      
      var extraSet = new Set(currentExtraTags);
      var extraNameSet = new Set(currentExtraTags.map(function(t) {
        return t.indexOf(":") >= 0 ? t.slice(t.indexOf(":") + 1) : t;
      }));
      
      var extraCatMainSet = new Set();
      var extraCatPairSet = new Set();
      currentExtraCats.forEach(function(ck) {
        if (ck.indexOf("::") >= 0) extraCatPairSet.add(ck);
        else extraCatMainSet.add(ck);
      });
      Object.keys(ncs).forEach(function(cat) {
        var nis = (ncs[cat] && ncs[cat].newsItems) || [];
        var catMainHit = extraCatMainSet.has(cat);
        nis.forEach(function(ni) {
          var tags = ni.tags || [];
          var match = tags.some(function(t) {
            if (_shvIsStockNewsTag(t, selStock, code)) return true;
            if (extraSet.has(t)) return true;
            var tn = t.indexOf(":") >= 0 ? t.slice(t.indexOf(":") + 1) : t;
            if (extraNameSet.has(tn)) return true;
            return false;
          });
          
          if (!match) {
            if (catMainHit) match = true;
            else if (ni.subCat && extraCatPairSet.has(cat + "::" + ni.subCat)) match = true;
          }
          if (match) ensure(dt).news.push({ ni: ni, cat: cat });
        });
      });
    });
    
    var _siCaInfo = _caGetStockInfo(selStock, custom);
    Object.keys(byDate).forEach(function(dt) {
      var e = byDate[dt];
      if (!e.chart) return;
      var c = e.chart;
      var caHits = _siCaInfo.caTicker ? _caFilterByStockDate(caMetaList, _siCaInfo.caTicker, dt, _siCaInfo.code) : [];
      var caThumb = (caHits[0] && caHits[0].thumbUrl) || "";
      var cImgs = (c.chartImgs && c.chartImgs.length) ? c.chartImgs : (c.chartImg ? [c.chartImg] : []);
      var hasContent = !!(
        caThumb ||
        cImgs.length > 0 ||
        c.macroLocal ||
        ((c.chartShapeTags || []).length + (c.stockTags || []).length > 0) ||
        ((c.signals || []).length > 0) ||
        (c.chartMemo && _hasText(c.chartMemo.text)) ||
        (c.chartMemo && c.chartMemo.images && c.chartMemo.images.length > 0)
      );
      if (!hasContent) e.chart = null;
    });
    
    var arr = Object.values(byDate).filter(function(e) {
      return !!(e.chart || e.news.length || e.items.length);
    });
    arr.sort(function(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return arr;
  }, [selStock, data.charts, data.trades, custom, extraTagsByStock, extraCatsByStock, caMetaList]);
  
  var dcRecordedDates = useMemo(function() {
    var s = new Set();
    allEntries.forEach(function(e) { if (e.chart) s.add(e.date); });
    return s;
  }, [allEntries]);
  var dcTradeDates = useMemo(function() {
    var m = {};
    allEntries.forEach(function(e) {
      if (!e.items || !e.items.length) return;
      var pnl = 0;
      e.items.forEach(function(it) {
        var p = parseFloat(it.pnl);
        if (!isNaN(p)) pnl += p;
      });
      m[e.date] = pnl;
    });
    return m;
  }, [allEntries]);
  
  
  
  var _shvRunCaFetch = function(force) {
    if (!cfg || !cfg.fbUrl) { setDcCaStatus("none"); setDcCaErr("Firebase未設定"); return Promise.resolve(); }
    if (!selStock) return Promise.resolve();
    var info = _caGetStockInfo(selStock, custom);
    var caTicker = (info && info.caTicker) || "";
    var code = (info && info.code) || "";
    if (!caTicker && !code) { setDcCaStatus("none"); setDcCaErr("ticker/code未設定"); return Promise.resolve(); }
    setDcCaStatus("loading"); setDcCaErr("");
    return _caFetchMeta(cfg, !!force).then(function(metaList) {
      if (!metaList || !metaList.length) { setDcCaStatus("none"); setDcCaErr("draftなし"); return null; }
      var srcCodeNum = code || _caExtractCode(caTicker);
      var matched = metaList.filter(function(m) {
        if (caTicker && m.ticker === caTicker) return true;
        if (caTicker && m.name && String(m.name).indexOf(caTicker) >= 0) return true;
        if (code && m.name && String(m.name).indexOf(code) >= 0) return true;
        if (code && m.ticker && String(m.ticker).indexOf(code) >= 0) return true;
        if (srcCodeNum) {
          var mc = _caExtractCode(m.ticker) || _caExtractCode(m.name) || _caExtractCode(m.id);
          if (mc && mc === srcCodeNum) return true;
        }
        return false;
      });
      if (!matched.length) { setDcCaStatus("none"); setDcCaErr("当銘柄draftなし"); return null; }
      var withDate = matched.map(function(m) {
        return { meta: m, date: _caResolveDate(m) };
      }).filter(function(x) { return /^\d{4}-\d{2}-\d{2}$/.test(x.date); });
      if (!withDate.length) { setDcCaStatus("none"); setDcCaErr("日付不明"); return null; }
      withDate.sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
      var csvDates = {};
      dcBars.forEach(function(b) { csvDates[b.date] = true; });
      var cachedBars = [];
      var toFetch = [];
      withDate.forEach(function(item) {
        if (csvDates[item.date] && !force) return;
        var cb = _caBarCacheGet(item.meta.id);
        if (cb && !force) {
          cachedBars.push(cb);
        } else {
          toFetch.push(item);
        }
      });
      var dedupByDate = function(arr) {
        var byDate = {};
        arr.forEach(function(b) {
          if (!byDate[b.date] || (b.fetchedAt || 0) > (byDate[b.date].fetchedAt || 0)) byDate[b.date] = b;
        });
        return Object.keys(byDate).sort().map(function(d) { return byDate[d]; });
      };
      setDcCaExtraBars(dedupByDate(cachedBars));
      if (!toFetch.length) {
        setDcCaStatus("ok"); setDcCaErr(cachedBars.length ? "" : "新規CAなし");
        return cachedBars;
      }
      var fetchPromises = toFetch.map(function(item) {
        return _caFetchDraftData(cfg, item.meta.id, !!force).then(function(dd) {
          if (!dd) return null;
          var bars1m = (dd.analysisData && dd.analysisData.bars_1m) || dd.bars_1m;
          if (!bars1m || !bars1m.length) return null;
          var agg = _aggregateBarsToDaily(bars1m, item.date);
          if (!agg) return null;
          agg.fetchedAt = Date.now();
          _caBarCacheSet(item.meta.id, agg);
          return agg;
        }).catch(function() { return null; });
      });
      return Promise.all(fetchPromises).then(function(fetched) {
        var ok = fetched.filter(function(x) { return x; });
        var all = dedupByDate(cachedBars.concat(ok));
        setDcCaExtraBars(all);
        setDcCaStatus("ok");
        setDcCaErr(ok.length ? "" : (cachedBars.length ? "" : "取得失敗"));
        return all;
      });
    }).catch(function(e) {
      setDcCaStatus("error");
      setDcCaErr(e && e.message ? e.message : "取得エラー");
    });
  };
  
  var _shvTodayJST = useMemo(function() {
    var d = new Date();
    var jst = new Date(d.getTime() + (9 * 60 + d.getTimezoneOffset()) * 60000);
    var y = jst.getFullYear(), mo = jst.getMonth() + 1, da = jst.getDate();
    return y + "-" + String(mo).padStart(2, "0") + "-" + String(da).padStart(2, "0");
  }, []);
  var _shvAutoTriggeredRef = useRef("");
  useEffect(function() {
    if (!cfg || !cfg.fbUrl) return;
    if (dcStatus !== "loaded" && dcStatus !== "no-data") return;
    if (!selStock) return;
    var info = _caGetStockInfo(selStock, custom);
    if (!info || (!info.caTicker && !info.code)) return;
    var key = selStock + "|" + dcStatus;
    if (_shvAutoTriggeredRef.current === key) return;
    _shvAutoTriggeredRef.current = key;
    _shvRunCaFetch(false);
    
  }, [dcStatus, selStock, cfg]);
  
  var dcDisplayBars = useMemo(function() {
    if (!dcCaExtraBars || !dcCaExtraBars.length) return dcBars;
    if (!dcBars.length) {
      var sorted = dcCaExtraBars.slice().sort(function(a, b) { return a.date < b.date ? -1 : 1; });
      return sorted;
    }
    var existDates = {};
    dcBars.forEach(function(b) { existDates[b.date] = true; });
    var merged = dcBars.slice();
    dcCaExtraBars.forEach(function(eb) {
      if (!existDates[eb.date]) {
        merged.push(eb);
        existDates[eb.date] = true;
      }
    });
    merged.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
    return merged;
  }, [dcBars, dcCaExtraBars]);
  
  var dcOnFileSelected = function(file) {
    if (!file) return;
    if (!selStock) { window._snAlert("銘柄を選択してください"); return; }
    var info = _caGetStockInfo(selStock, custom);
    var code = (info && info.code) || "";
    if (!code) { window._snAlert("この銘柄に証券コードが設定されていません。設定 → 銘柄管理から登録してください。"); return; }
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      
      
      var bars = _parseDailyCsv(text);
      if (!bars.length) {
        window._snAlert("CSV を解析できませんでした。Hyper SBI 2 の TimeChart 形式 (日付,始値,高値,安値,終値,...) であることを確認してください。");
        return;
      }
      var now = Date.now();
      setDcBars(bars);
      setDcStatus("loaded");
      setDcUploadedAt(now);
      _dcCacheSave(code, text, now);
      
      if (cfg && cfg.fbUrl) {
        _dcSaveCsvToFb(cfg, code, text).then(function(ok) {
          if (ok) console.log("[DC] CSV synced to Firebase: " + code);
        });
      }
    };
    reader.onerror = function() { window._snAlert("ファイル読み込み失敗"); };
    reader.readAsText(file, "UTF-8");
  };
  
  var filtered = useMemo(function() {
    var kw = (keyword || "").trim().toLowerCase();
    var hasKw = kw.length > 0;
    var hasTags = selTags.size > 0;
    var hasCats = selCats.size > 0;
    var hasFrom = !!dateFrom;
    var hasTo = !!dateTo;
    return allEntries.filter(function(e) {
      if (hasFrom && e.date < dateFrom) return false;
      if (hasTo && e.date > dateTo) return false;
      if (hasTags) {
        var entryTags = new Set();
        if (e.chart) {
          (e.chart.chartShapeTags || []).forEach(function(t){ entryTags.add(t); });
          (e.chart.stockTags || []).forEach(function(t){ entryTags.add(t); });
        }
        e.news.forEach(function(nx) {
          (nx.ni.tags || []).forEach(function(t){ entryTags.add(t); });
        });
        var anyMatch = false;
        selTags.forEach(function(t) {
          if (anyMatch) return;
          if (entryTags.has(t)) { anyMatch = true; return; }
          
          var ts = stripCat(t);
          entryTags.forEach(function(et) {
            if (anyMatch) return;
            if (stripCat(et) === ts) anyMatch = true;
          });
        });
        if (!anyMatch) return false;
      }
      
      if (hasCats) {
        var anyCatMatch = false;
        e.news.forEach(function(nx) {
          if (anyCatMatch) return;
          if (selCats.has(nx.cat)) { anyCatMatch = true; return; }
          if (nx.ni.subCat && selCats.has(nx.cat + "::" + nx.ni.subCat)) anyCatMatch = true;
        });
        if (!anyCatMatch) return false;
      }
      if (hasKw) {
        var bag = "";
        if (e.chart) {
          if (e.chart.chartMemo) bag += " " + stripHtml(e.chart.chartMemo.text || "");
          (e.chart.signals || []).forEach(function(sg){
            bag += " " + (sg.tag || "") + " " + (sg.memo || "");
          });
        }
        e.news.forEach(function(nx) {
          bag += " " + stripHtml(nx.ni.text || "");
        });
        e.items.forEach(function(it) {
          bag += " " + (it.memo || "") + " " + (it.type || "") + " " + (it.priceIn || "") + " " + (it.priceOut || "");
        });
        if (bag.toLowerCase().indexOf(kw) < 0) return false;
      }
      return true;
    });
  }, [allEntries, dateFrom, dateTo, selTags, selCats, keyword]);
  var togTag = function(t) {
    var ns = new Set(selTags);
    if (ns.has(t)) ns["delete"](t); else ns.add(t);
    setSelTags(ns);
  };
  var clearAllFilter = function() {
    setDateFrom(""); setDateTo(""); setSelTags(new Set()); setSelCats(new Set()); setKeyword("");
  };
  var hasAnyFilter = !!dateFrom || !!dateTo || selTags.size > 0 || selCats.size > 0 || (keyword || "").trim().length > 0;
  
  var totalNews = filtered.reduce(function(s, e){ return s + e.news.length; }, 0);
  var totalCharts = filtered.reduce(function(s, e){ return s + (e.chart ? 1 : 0); }, 0);
  var totalTrades = filtered.reduce(function(s, e){ return s + e.items.length; }, 0);
  
  return React.createElement("div", { style: { padding: "10px 4px 60px", maxWidth: 920, margin: "0 auto" } },
    
    React.createElement("div", {
      style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }
    },
      React.createElement("button", {
        onClick: onBack,
        style: { padding: "8px 12px", fontSize: 13, fontWeight: 700,
          background: "#f5f4f0", border: "1px solid #ddd", borderRadius: 7,
          cursor: "pointer", minHeight: IS_TOUCH ? 44 : 36 }
      }, "← 戻る"),
      React.createElement("div", { style: { fontSize: 17, fontWeight: 700, flex: 1 } }, "📊 銘柄別記録")
    ),
    
    React.createElement("div", {
      style: { background: "#fafaf7", border: "1px solid #e8e5df", borderRadius: 8,
        padding: 10, marginBottom: 10 }
    },
      React.createElement("div", {
        style: { fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6 }
      }, "銘柄を選択"),
      React.createElement("select", {
        value: selStock,
        onChange: function(e){
          var nv = e.target.value;
          var doSwitch = function(){ setSelStock(nv); };
          if (window.__snEditingGuard && typeof window.__snEditingGuard.canLeave === "function") {
            
            
            
            window.__snEditingGuard.canLeave(doSwitch);
          } else {
            doSwitch();
          }
        },
        style: { width: "100%", padding: "10px 8px", fontSize: 15, fontWeight: 600,
          border: "1.5px solid #C7D2FE", borderRadius: 7, background: "#fff", color: "#1a1a1a",
          minHeight: IS_TOUCH ? 44 : 36 }
      }, allStocks.map(function(s) {
        var info_s = _caGetStockInfo(s, custom);
        var code = (info_s && info_s.code) || "";
        return React.createElement("option", { key: s, value: s }, s + (code ? " (" + code + ")" : ""));
      })),
      
      selStock && React.createElement("div", { style: { marginTop: 8 } },
        React.createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }
        },
          React.createElement("span", {
            style: { fontSize: 11, color: "#666", fontWeight: 700 }
          }, "📌 関連カテゴリ (この銘柄に紐付けて表示)"),
          React.createElement("button", {
            onClick: function(){ setShowExtraCatPicker(!showExtraCatPicker); },
            style: { padding: "3px 8px", fontSize: 11, fontWeight: 700,
              background: showExtraCatPicker ? "#6366F1" : "#EEF2FF",
              color: showExtraCatPicker ? "#fff" : "#4338CA",
              border: "1px solid " + (showExtraCatPicker ? "#6366F1" : "#C7D2FE"),
              borderRadius: 5, cursor: "pointer" }
          }, showExtraCatPicker ? "✕ 閉じる" : "+ カテゴリ管理")
        ),
        
        !showExtraCatPicker && currentExtraCats.length > 0 && React.createElement("div", {
          style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }
        }, currentExtraCats.map(function(ck) {
          var parts = ck.split("::");
          var mainCat = parts[0], subCat = parts[1] || null;
          var label = subCat ? (mainCat + " \u25B8 " + subCat) : mainCat;
          return React.createElement("span", {
            key: ck,
            style: { display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, padding: "3px 6px 3px 8px",
              background: "#fff", border: "1.5px solid #6366F1", color: "#4338CA",
              borderRadius: 4, fontWeight: 600 }
          },
            label,
            React.createElement("button", {
              onClick: function(){ removeExtraCat(ck); },
              title: "削除",
              style: { width: 18, height: 18, borderRadius: "50%",
                background: "#6366F1", color: "#fff", border: "none",
                fontSize: 10, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", padding: 0 }
            }, "✕")
          );
        })),
        !showExtraCatPicker && currentExtraCats.length === 0 && React.createElement("div", {
          style: { fontSize: 11, color: "#999", fontStyle: "italic" }
        }, "未設定 (例: 銘柄に「企業各論」を紐付けると、そのカテゴリのニュースも一緒に表示されます)"),
        
        showExtraCatPicker && React.createElement("div", {
          style: { marginTop: 6, padding: 8, background: "#fff",
            border: "1px solid #C7D2FE", borderRadius: 6, maxHeight: 320, overflowY: "auto" }
        },
          React.createElement("div", {
            style: { fontSize: 10, color: "#666", marginBottom: 6, paddingBottom: 4,
              borderBottom: "1px solid #eee" }
          }, "メインカテゴリ単独でも、サブカテゴリ別でも紐付け可能"),
          allMainCats.length === 0
            ? React.createElement("div", {
                style: { fontSize: 11, color: "#999", padding: 4 }
              }, "カテゴリが未登録 (ニュース一覧でカテゴリを追加してください)")
            : allMainCats.map(function(mainCat) {
                var subs = getSubCatsFor(mainCat);
                var mainKey = mainCat;
                var mainLinked = currentExtraCats.indexOf(mainKey) >= 0;
                var subsOpen = catPickerOpenMains[mainCat] !== false;
                return React.createElement("div", {
                  key: mainCat,
                  style: { marginBottom: 4 }
                },
                  React.createElement("div", {
                    style: { display: "flex", alignItems: "center", gap: 8,
                      padding: "4px 6px", borderRadius: 4,
                      background: mainLinked ? "#EEF2FF" : "transparent" }
                  },
                    React.createElement("span", {
                      onClick: function(){ togExtraCat(mainKey); },
                      style: { cursor: "pointer", fontSize: 14, fontWeight: 700,
                        color: mainLinked ? "#4338CA" : "#999",
                        userSelect: "none", minWidth: 18 }
                    }, mainLinked ? "\u2611" : "\u2610"),
                    React.createElement("span", {
                      onClick: function(){ togExtraCat(mainKey); },
                      style: { cursor: "pointer", fontSize: 13, fontWeight: 700,
                        color: "#1a1a1a", flex: 1 }
                    }, mainCat),
                    subs.length > 0 && React.createElement("button", {
                      onClick: function() {
                        setCatPickerOpenMains(function(prev) {
                          var nx = Object.assign({}, prev);
                          nx[mainCat] = !subsOpen;
                          return nx;
                        });
                      },
                      title: subsOpen ? "サブを隠す" : "サブを表示",
                      style: { padding: "2px 6px", fontSize: 11, fontWeight: 700,
                        background: "transparent", border: "1px solid #C7D2FE",
                        color: "#4338CA", borderRadius: 3, cursor: "pointer" }
                    }, subsOpen ? "\u25BD" : "\u25B7 " + subs.length)
                  ),
                  subsOpen && subs.length > 0 && React.createElement("div", {
                    style: { paddingLeft: 26, marginTop: 2 }
                  }, subs.map(function(sc) {
                    var subKey = mainCat + "::" + sc;
                    var subLinked = currentExtraCats.indexOf(subKey) >= 0;
                    return React.createElement("div", {
                      key: sc,
                      onClick: function(){ togExtraCat(subKey); },
                      style: { display: "flex", alignItems: "center", gap: 8,
                        padding: "3px 6px", borderRadius: 4, cursor: "pointer",
                        background: subLinked ? "#EEF2FF" : "transparent",
                        fontSize: 12 }
                    },
                      React.createElement("span", {
                        style: { fontSize: 13, fontWeight: 700,
                          color: subLinked ? "#4338CA" : "#999",
                          minWidth: 18 }
                      }, subLinked ? "\u2611" : "\u2610"),
                      React.createElement("span", {
                        style: { color: "#444", flex: 1 }
                      }, sc)
                    );
                  }))
                );
              })
        )
      ),
      
      selStock && React.createElement("div", { style: { marginTop: 8 } },
        React.createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }
        },
          React.createElement("span", {
            style: { fontSize: 11, color: "#666", fontWeight: 700 }
          }, "📌 関連タグ (この銘柄に紐付けて表示)"),
          React.createElement("button", {
            onClick: function(){ setShowExtraPicker(!showExtraPicker); },
            style: { padding: "3px 8px", fontSize: 11, fontWeight: 700,
              background: showExtraPicker ? "#6366F1" : "#EEF2FF",
              color: showExtraPicker ? "#fff" : "#4338CA",
              border: "1px solid " + (showExtraPicker ? "#6366F1" : "#C7D2FE"),
              borderRadius: 5, cursor: "pointer" }
          }, showExtraPicker ? "✕ 閉じる" : "+ タグ管理")
        ),
        
        !showExtraPicker && currentExtraTags.length > 0 && React.createElement("div", {
          style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }
        }, currentExtraTags.map(function(t) {
          var idx = t.indexOf(":");
          var label = idx >= 0 ? (t.slice(0, idx) + " \u25B8 " + t.slice(idx + 1)) : t;
          return React.createElement("span", {
            key: t,
            style: { display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, padding: "3px 6px 3px 8px",
              background: "#fff", border: "1.5px solid #6366F1", color: "#4338CA",
              borderRadius: 4, fontWeight: 600 }
          },
            label,
            React.createElement("button", {
              onClick: function(){ removeExtraTag(t); },
              title: "削除",
              style: { width: 18, height: 18, borderRadius: "50%",
                background: "#6366F1", color: "#fff", border: "none",
                fontSize: 10, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", padding: 0 }
            }, "✕")
          );
        })),
        !showExtraPicker && currentExtraTags.length === 0 && React.createElement("div", {
          style: { fontSize: 11, color: "#999", fontStyle: "italic" }
        }, "未設定 (例: 防衛セクター銘柄に「防衛」タグを追加すると、そのタグが付いたニュースも表示されます)"),
        
        showExtraPicker && React.createElement("div", {
          style: { marginTop: 6, padding: 8, background: "#fff",
            border: "1px solid #C7D2FE", borderRadius: 6, maxHeight: 320, overflowY: "auto" }
        },
          React.createElement("div", {
            style: { fontSize: 10, color: "#666", marginBottom: 6, paddingBottom: 4,
              borderBottom: "1px solid #eee" }
          }, "カテゴリ単独でも、タグ別でも紐付け可能（タグ管理はニュース一覧で）"),
          (function() {
            var allTagCats = Object.keys(custom.cats || {});
            var allFreeTags = custom.tags || [];
            if (allTagCats.length === 0 && allFreeTags.length === 0) {
              return React.createElement("div", {
                style: { fontSize: 11, color: "#999", padding: 4 }
              }, "タグマスター未登録 (ニュース一覧でタグを追加してください)");
            }
            var blocks = [];
            allTagCats.forEach(function(cat) {
              var subs = (custom.cats[cat] || []);
              var mainKey = cat;
              var mainLinked = currentExtraTags.indexOf(mainKey) >= 0;
              var subsOpen = tagPickerOpenCats[cat] !== false;
              blocks.push(React.createElement("div", {
                key: "tcat_" + cat,
                style: { marginBottom: 4 }
              },
                React.createElement("div", {
                  style: { display: "flex", alignItems: "center", gap: 8,
                    padding: "4px 6px", borderRadius: 4,
                    background: mainLinked ? "#EEF2FF" : "transparent" }
                },
                  React.createElement("span", {
                    onClick: function(){ togExtraTag(mainKey); },
                    style: { cursor: "pointer", fontSize: 14, fontWeight: 700,
                      color: mainLinked ? "#4338CA" : "#999",
                      userSelect: "none", minWidth: 18 }
                  }, mainLinked ? "\u2611" : "\u2610"),
                  React.createElement("span", {
                    onClick: function(){ togExtraTag(mainKey); },
                    style: { cursor: "pointer", fontSize: 13, fontWeight: 700,
                      color: "#1a1a1a", flex: 1 }
                  }, cat),
                  subs.length > 0 && React.createElement("button", {
                    onClick: function() {
                      setTagPickerOpenCats(function(prev) {
                        var nx = Object.assign({}, prev);
                        nx[cat] = !subsOpen;
                        return nx;
                      });
                    },
                    title: subsOpen ? "サブを隠す" : "サブを表示",
                    style: { padding: "2px 6px", fontSize: 11, fontWeight: 700,
                      background: "transparent", border: "1px solid #C7D2FE",
                      color: "#4338CA", borderRadius: 3, cursor: "pointer" }
                  }, subsOpen ? "\u25BD" : "\u25B7 " + subs.length)
                ),
                subsOpen && subs.length > 0 && React.createElement("div", {
                  style: { paddingLeft: 26, marginTop: 2 }
                }, subs.map(function(tg) {
                  var subKey = cat + ":" + tg;
                  var subLinked = currentExtraTags.indexOf(subKey) >= 0;
                  return React.createElement("div", {
                    key: tg,
                    onClick: function(){ togExtraTag(subKey); },
                    style: { display: "flex", alignItems: "center", gap: 8,
                      padding: "3px 6px", borderRadius: 4, cursor: "pointer",
                      background: subLinked ? "#EEF2FF" : "transparent",
                      fontSize: 12 }
                  },
                    React.createElement("span", {
                      style: { fontSize: 13, fontWeight: 700,
                        color: subLinked ? "#4338CA" : "#999",
                        minWidth: 18 }
                    }, subLinked ? "\u2611" : "\u2610"),
                    React.createElement("span", {
                      style: { color: "#444", flex: 1 }
                    }, tg)
                  );
                }))
              ));
            });
            
            if (allFreeTags.length > 0) {
              blocks.push(React.createElement("div", {
                key: "_free",
                style: { marginTop: 6, paddingTop: 6, borderTop: "1px dashed #ddd" }
              },
                React.createElement("div", {
                  style: { fontSize: 10, color: "#888", marginBottom: 4, fontWeight: 600,
                    paddingLeft: 6 }
                }, "カテゴリなしのタグ"),
                allFreeTags.map(function(tg) {
                  var linked = currentExtraTags.indexOf(tg) >= 0;
                  return React.createElement("div", {
                    key: "free_" + tg,
                    onClick: function(){ togExtraTag(tg); },
                    style: { display: "flex", alignItems: "center", gap: 8,
                      padding: "3px 6px", borderRadius: 4, cursor: "pointer",
                      background: linked ? "#EEF2FF" : "transparent",
                      fontSize: 12 }
                  },
                    React.createElement("span", {
                      style: { fontSize: 13, fontWeight: 700,
                        color: linked ? "#4338CA" : "#999",
                        minWidth: 18 }
                    }, linked ? "\u2611" : "\u2610"),
                    React.createElement("span", {
                      style: { color: "#444", flex: 1 }
                    }, tg)
                  );
                })
              ));
            }
            return blocks;
          })()
        )
      )
    ),
    
    selStock && React.createElement(StockQuickRefTableWithChart, {
      data: data,
      activeStock: selStock,
      save: save,
      onSelectDate: function(d){ if (onSelectDate) onSelectDate(d, "trades"); },
      highlightDate: (function(){ var d=new Date(); var y=d.getFullYear(); var m=("0"+(d.getMonth()+1)).slice(-2); var dd2=("0"+d.getDate()).slice(-2); return y+"-"+m+"-"+dd2; })()
    }),
    selStock && React.createElement("div", { style: { marginBottom: 12 } },
      
      React.createElement("div", {
        style: { background: "#fafaf7", border: "1px solid #e8e5df", borderRadius: 8,
          padding: 10, marginBottom: 8, display: "flex", alignItems: "center",
          gap: 8, flexWrap: "wrap" }
      },
        React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 700 } },
          "📥 日足CSV"),
        React.createElement("input", {
          ref: dcFileInputRef, type: "file", accept: ".csv,text/csv",
          style: { display: "none" },
          onChange: function(e) {
            var f = e.target.files && e.target.files[0];
            if (f) dcOnFileSelected(f);
            e.target.value = "";
          }
        }),
        React.createElement("button", {
          onClick: function() { if (dcFileInputRef.current) dcFileInputRef.current.click(); },
          style: { padding: "6px 12px", fontSize: 12, fontWeight: 700,
            background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#4338CA",
            borderRadius: 6, cursor: "pointer", minHeight: IS_TOUCH ? 36 : 28 }
        }, dcBars.length > 0 ? "🔄 CSV更新" : "📤 CSVアップロード"),
        
        React.createElement("button", {
          onClick: function() { _shvRunCaFetch(true); },
          disabled: dcCaStatus === "loading",
          title: "chart-annotator の最新ドラフトを取得して当日分の日足を反映",
          style: { padding: "6px 10px", fontSize: 11, fontWeight: 700,
            background: dcCaStatus === "loading" ? "#f5f5f5" : "#FFF7ED",
            color: dcCaStatus === "loading" ? "#999" : "#C2410C",
            border: "1px solid " + (dcCaStatus === "loading" ? "#ddd" : "#FDBA74"),
            borderRadius: 6, cursor: dcCaStatus === "loading" ? "not-allowed" : "pointer",
            minHeight: IS_TOUCH ? 36 : 28 }
        }, dcCaStatus === "loading" ? "取得中..." : "🔄 CA分を再取得"),
        dcCaExtraBars.length > 0 && React.createElement("span", {
          style: { fontSize: 10, color: "#16A34A", fontWeight: 600 },
          title: dcCaExtraBars.map(function(b) {
            return b.date + ": O" + b.open + " H" + b.high + " L" + b.low + " C" + b.close;
          }).join("\n")
        }, dcCaExtraBars.length === 1
          ? "✓ " + dcCaExtraBars[0].date + " 反映"
          : "✓ CA " + dcCaExtraBars.length + "日分 (" + dcCaExtraBars[0].date + " 〜 " + dcCaExtraBars[dcCaExtraBars.length - 1].date + ")"),
        dcCaStatus === "error" && React.createElement("span", {
          style: { fontSize: 10, color: "#DC2626" }
        }, "⚠ " + (dcCaErr || "取得エラー")),
        
        dcStatus === "loaded" && dcBars.length > 0 && React.createElement("span", {
          style: { fontSize: 11, color: "#16A34A" }
        }, "✓ " + dcBars.length + "日分 (" +
          (dcBars[0] ? dcBars[0].date : "?") + " 〜 " +
          (dcBars[dcBars.length - 1] ? dcBars[dcBars.length - 1].date : "?") + ")"),
        dcStatus === "loading" && React.createElement("span", {
          style: { fontSize: 11, color: "#888" }
        }, "読込中..."),
        dcStatus === "no-data" && React.createElement("span", {
          style: { fontSize: 11, color: "#888" }
        }, "CSV未登録 - Hyper SBI 2 → 個別チャート → CSV保存 してアップロード"),
        dcStatus === "no-code" && React.createElement("span", {
          style: { fontSize: 11, color: "#B45309" }
        }, "⚠ 銘柄に証券コードが未設定 (設定 → 銘柄管理から登録)"),
        dcStatus === "no-cfg" && React.createElement("span", {
          style: { fontSize: 11, color: "#888" }
        }, "Firebase未接続 - ローカルのみ保存"),
        dcUploadedAt > 0 && React.createElement("span", {
          style: { fontSize: 10, color: "#aaa", marginLeft: "auto" }
        }, "更新: " + new Date(dcUploadedAt).toISOString().slice(0, 10))
      ),
      
      dcDisplayBars.length > 0 && React.createElement(DailyCandleChart, {
        bars: dcDisplayBars,
        recordedDates: dcRecordedDates,
        tradeDates: dcTradeDates,
        showSparse: false
      })
    ),
    
    selStock && (function() {
      var _stkAlpha = (data.custom.stockDefaultAlpha || {})[selStock];
      var _saveAlpha = function(v) {
        var n = v !== "" ? Number(v) : null;
        if (n != null && !isNaN(n)) { if (n > 20) n = 20; if (n < 0) n = 0; }
        save(function(prev) {
          var pc = prev.custom || {};
          var nm = Object.assign({}, pc.stockDefaultAlpha || {});
          if (n != null && !isNaN(n)) nm[selStock] = n;
          else delete nm[selStock];
          return Object.assign({}, prev, { custom: Object.assign({}, pc, { stockDefaultAlpha: nm }) });
        });
      };
      return React.createElement("div", {
        style: { background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8,
                 padding: "8px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }
      },
        React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#0369A1", whiteSpace: "nowrap" } }, "α 理想α値（目標）"),
        React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid #BAE6FD", borderRadius: 5, overflow: "hidden" } },
          React.createElement("input", {
            type: "number", inputMode: "numeric", min: "0", max: "20", step: "1",
            value: _stkAlpha != null ? String(_stkAlpha) : "",
            onChange: function(e) { _saveAlpha(e.target.value); },
            placeholder: "0〜20",
            style: { padding: "4px 8px", fontSize: 13, border: "none", outline: "none", background: "#fff",
                     width: 72, textAlign: "right", boxSizing: "border-box" }
          }),
          _stepBtn(
            function() { save(function(prev) { var _pc = prev.custom || {}; var _nm = Object.assign({}, _pc.stockDefaultAlpha || {}); var _n = _nm[selStock] != null ? _nm[selStock] : 0; if (_n >= 20) return prev; _nm[selStock] = _n + 1; return Object.assign({}, prev, { custom: Object.assign({}, _pc, { stockDefaultAlpha: _nm }) }); }); },
            function() { save(function(prev) { var _pc = prev.custom || {}; var _nm = Object.assign({}, _pc.stockDefaultAlpha || {}); var _n = _nm[selStock] != null ? _nm[selStock] : 0; if (_n <= 0) return prev; _nm[selStock] = _n - 1; return Object.assign({}, prev, { custom: Object.assign({}, _pc, { stockDefaultAlpha: _nm }) }); }); }
          )
        ),
        React.createElement("span", { style: { fontSize: 12, color: "#64748B" } }, "円"),
        React.createElement("span", { style: { fontSize: 10, color: "#94A3B8" } }, selStock + " の理想α値として保存されます")
      );
    })(),
    
    selStock && React.createElement(StockInfoSection, {
      data: data,
      save: save,
      stockName: selStock,
      allStocks: allStocks
    }),
    
    React.createElement("div", {
      style: { background: "#fff", border: "1px solid #e8e5df", borderRadius: 8,
        padding: 10, marginBottom: 12 }
    },
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", gap: 8, marginBottom: showFilter ? 10 : 0 }
      },
        React.createElement("button", {
          onClick: function(){ setShowFilter(!showFilter); },
          style: { padding: "6px 10px", fontSize: 12, fontWeight: 700,
            background: hasAnyFilter ? "#EEF2FF" : "#f5f4f0",
            border: "1px solid " + (hasAnyFilter ? "#C7D2FE" : "#ddd"),
            color: hasAnyFilter ? "#4338CA" : "#555",
            borderRadius: 6, cursor: "pointer" }
        }, (showFilter ? "▼" : "▶") + " 絞り込み" + (hasAnyFilter ? " (適用中)" : "")),
        hasAnyFilter && React.createElement("button", {
          onClick: clearAllFilter,
          style: { padding: "6px 10px", fontSize: 11, fontWeight: 700,
            background: "#fff", border: "1px solid #ccc", color: "#777",
            borderRadius: 6, cursor: "pointer" }
        }, "クリア"),
        React.createElement("div", {
          style: { marginLeft: "auto", fontSize: 11, color: "#666" }
        }, filtered.length + " 日 / 📰" + totalNews + " 📊" + totalCharts + " 📝" + totalTrades)
      ),
      showFilter && React.createElement("div", null,
        
        React.createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }
        },
          React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 700, minWidth: 40 } }, "期間"),
          React.createElement("input", {
            type: "date", value: dateFrom,
            onChange: function(e){ setDateFrom(e.target.value); },
            style: { padding: "6px 8px", fontSize: 13, border: "1px solid #ddd", borderRadius: 5 }
          }),
          React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "〜"),
          React.createElement("input", {
            type: "date", value: dateTo,
            onChange: function(e){ setDateTo(e.target.value); },
            style: { padding: "6px 8px", fontSize: 13, border: "1px solid #ddd", borderRadius: 5 }
          })
        ),
        
        allMainCats.length > 0 && React.createElement("div", { style: { marginBottom: 8 } },
          React.createElement("div", {
            style: { fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 4 }
          }, "カテゴリで絞込 (いずれかを含む)"),
          React.createElement("div", {
            style: { display: "flex", flexWrap: "wrap", gap: 4 }
          }, (function() {
            var btns = [];
            allMainCats.forEach(function(mainCat) {
              var subs = getSubCatsFor(mainCat);
              var mOn = selCats.has(mainCat);
              btns.push(React.createElement("button", {
                key: "m_" + mainCat,
                onClick: function(){ togSelCat(mainCat); },
                style: { padding: "4px 8px", fontSize: 11, fontWeight: 700,
                  background: mOn ? "#6366F1" : "#EEF2FF",
                  color: mOn ? "#fff" : "#4338CA",
                  border: "1px solid " + (mOn ? "#6366F1" : "#C7D2FE"),
                  borderRadius: 4, cursor: "pointer" }
              }, mainCat));
              subs.forEach(function(sc) {
                var key = mainCat + "::" + sc;
                var sOn = selCats.has(key);
                btns.push(React.createElement("button", {
                  key: "s_" + key,
                  onClick: function(){ togSelCat(key); },
                  style: { padding: "4px 8px", fontSize: 11, fontWeight: 600,
                    background: sOn ? "#818CF8" : "#f8f7f4",
                    color: sOn ? "#fff" : "#666",
                    border: "1px solid " + (sOn ? "#818CF8" : "#ddd"),
                    borderRadius: 4, cursor: "pointer" }
                }, mainCat + " \u25B8 " + sc));
              });
            });
            return btns;
          })())
        ),
        
        ((custom.cats && Object.keys(custom.cats).length > 0) || (custom.tags && custom.tags.length > 0)) && React.createElement("div", { style: { marginBottom: 8 } },
          React.createElement("div", {
            style: { fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 4 }
          }, "タグで絞込 (いずれかを含む)"),
          React.createElement(TagPicker, _extends({
            cats: custom.cats || {},
            tags: custom.tags || [],
            sel: Array.from(selTags),
            onToggle: function(tag) { togTag(tag); },
            onAdd: function(name, cat) {
              
              var nv = (name || "").trim();
              if (!nv) return;
              if (cat) {
                var cur = custom.cats || {};
                var items = (cur[cat] || []).slice();
                if (items.indexOf(nv) >= 0) return;
                items.push(nv);
                var nc = Object.assign({}, cur);
                nc[cat] = items;
                save(Object.assign({}, data, { custom: Object.assign({}, custom, { cats: nc }) }));
              } else {
                var tagsArr = (custom.tags || []).slice();
                if (tagsArr.indexOf(nv) >= 0) return;
                tagsArr.push(nv);
                save(Object.assign({}, data, { custom: Object.assign({}, custom, { tags: tagsArr }) }));
              }
            },
            tagColors: custom.tagColors || {},
  label: ""
          }, wrappedPool))
        ),
        
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
          React.createElement("span", { style: { fontSize: 11, color: "#666", fontWeight: 700, minWidth: 40 } }, "検索"),
          React.createElement(FastInput, {
            type: "text", value: keyword, placeholder: "\u672C\u6587\u30FB\u30E1\u30E2\u3092\u691C\u7D22",
            onChange: function(v){ setKeyword(v); },
            debounceMs: 200,
            style: { flex: 1, padding: "6px 8px", fontSize: 13, border: "1px solid #ddd", borderRadius: 5 }
          })
        )
      )
    ),
    
    !selStock && React.createElement("div", {
      style: { padding: 30, textAlign: "center", color: "#999", fontSize: 13 }
    }, "銘柄を選択してください"),
    selStock && filtered.length === 0 && React.createElement("div", {
      style: { padding: 30, textAlign: "center", color: "#999", fontSize: 13 }
    }, "該当する記録がありません"),
    filtered.map(function(e) {
      return React.createElement("div", {
        key: e.date,
        style: { background: "#fff", border: "1px solid #e8e5df", borderRadius: 8,
          padding: 10, marginBottom: 10 }
      },
        
        React.createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
            paddingBottom: 6, borderBottom: "1px solid #eee" }
        },
          React.createElement("div", {
            style: { fontSize: 14, fontWeight: 700, color: "#1a1a1a" }
          }, e.date + " (" + ["日","月","火","水","木","金","土"][new Date(e.date + "T00:00:00").getDay()] + ")"),
          React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 4 } },
            React.createElement("button", {
              onClick: function(){ onSelectDate && onSelectDate(e.date, "news"); },
              style: { padding: "4px 8px", fontSize: 11, fontWeight: 700,
                background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#4338CA",
                borderRadius: 5, cursor: "pointer" }
            }, "この日を開く →")
          )
        ),
        
        e.items.length > 0 && React.createElement("div", { style: { marginBottom: 8 } },
          React.createElement("div", {
            style: { fontSize: 11, color: "#9A3412", fontWeight: 700, marginBottom: 4 }
          }, "📝 取引 (" + e.items.length + ")"),
          React.createElement("div", null, e.items.map(function(it, ii) {
            var pl = (it.pnl != null && it.pnl !== "") ? Number(it.pnl) : null;
            var plColor = pl == null || isNaN(pl) ? "#666" : (pl >= 0 ? "#C0392B" : "#1E8449");
            var typeColor = it.type === "空売" ? "#C0392B" : "#2E7D32";
            return React.createElement("div", {
              key: it.id || ii,
              onClick: function(){ onSelectDate && onSelectDate(e.date, "trades"); },
              style: { padding: "6px 8px", fontSize: 12, background: "#fff7ed",
                border: "1px solid #FDBA74", borderRadius: 5, marginBottom: 3,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }
            },
              it.time && React.createElement("span", { style: { color: "#888", fontWeight: 600 } }, it.time),
              it.type && React.createElement("span", { style: { fontWeight: 700, color: typeColor } }, it.type),
              (it.priceIn || it.priceOut) && React.createElement("span", { style: { color: "#666" } },
                (it.priceIn || "—") + "→" + (it.priceOut || "—")),
              pl != null && !isNaN(pl) && React.createElement("span", {
                style: { fontWeight: 700, color: plColor, marginLeft: "auto" }
              }, (pl > 0 ? "+" : "") + pl + "円"),
              it.memo && React.createElement("span", {
                style: { color: "#555", fontSize: 11, width: "100%",
                  paddingLeft: 4, borderLeft: "2px solid #FDBA74", whiteSpace: "pre-wrap" }
              }, "💬 " + it.memo)
            );
          }))
        ),
        
        e.chart && (function() {
          var c = e.chart;
          var cImgs = (c.chartImgs && c.chartImgs.length) ? c.chartImgs : (c.chartImg ? [c.chartImg] : []);
          
          var caInfo = _caGetStockInfo(selStock, custom);
          var caHits = caInfo.caTicker ? _caFilterByStockDate(caMetaList, caInfo.caTicker, e.date, caInfo.code) : [];
          var caThumb = (caHits[0] && caHits[0].thumbUrl) || "";
          
          
          var hasChartContent = !!(
            caThumb ||
            cImgs.length > 0 ||
            c.macroLocal ||
            ((c.chartShapeTags || []).length + (c.stockTags || []).length > 0) ||
            ((c.signals || []).length > 0) ||
            (c.chartMemo && _hasText(c.chartMemo.text)) ||
            (c.chartMemo && c.chartMemo.images && c.chartMemo.images.length > 0)
          );
          if (!hasChartContent) return null;
          return React.createElement("div", { style: { marginBottom: 8 } },
            React.createElement("div", {
              style: { fontSize: 11, color: "#4338CA", fontWeight: 700, marginBottom: 4 }
            }, "📊 チャート"),
            React.createElement("div", {
              style: { padding: "8px", background: "#EEF2FF",
                border: "1px solid #C7D2FE", borderRadius: 5 }
            },
              
              caThumb && React.createElement("div", {
                style: { marginBottom: (cImgs.length > 0 || c.macroLocal || (c.chartShapeTags || c.stockTags)) ? 6 : 0 }
              },
                React.createElement("div", {
                  style: { fontSize: 9, color: "#888", fontWeight: 600, marginBottom: 2 }
                }, "📐 分析ツール"),
                React.createElement(CaThumbImg, {
                  url: caThumb,
                  onClick: function(){ onSelectDate && onSelectDate(e.date, "trades"); },
                  style: { maxWidth: "100%", maxHeight: 280, borderRadius: 6,
                    border: "1px solid #C7D2FE", cursor: "zoom-in", display: "block" },
                  alt: "",
                  loading: "lazy"
                })
              ),
              
              cImgs.length > 0 && React.createElement("div", {
                style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: c.macroLocal || (c.chartShapeTags || c.stockTags) ? 6 : 0 }
              }, cImgs.map(function(ci, cidx) {
                var src = imgSrc(ci);
                if (!src) return null;
                return React.createElement("img", {
                  key: cidx,
                  src: src,
                  onClick: function(){ onSelectDate && onSelectDate(e.date, "trades"); },
                  style: { maxWidth: "100%", maxHeight: 360, borderRadius: 6,
                    border: "1px solid #C7D2FE", cursor: "zoom-in", display: "block" },
                  alt: "",
                  loading: "lazy"
                });
              })),
              c.macroLocal && React.createElement("div", {
                style: { fontSize: 11, color: "#555", marginBottom: 3, cursor: "pointer" },
                onClick: function(){ onSelectDate && onSelectDate(e.date, "trades"); }
              }, "🌐 地合い: " + c.macroLocal),
              (c.chartShapeTags || c.stockTags) &&
                [].concat(c.chartShapeTags || [], c.stockTags || []).length > 0 &&
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 3 } },
                  [].concat(c.chartShapeTags || [], c.stockTags || []).map(function(t, ti) {
                    return React.createElement("span", {
                      key: ti,
                      style: { fontSize: 10, padding: "1px 5px",
                        background: "#fff", border: "1px solid #C7D2FE", color: "#4338CA",
                        borderRadius: 3 }
                    }, t);
                  })),
              (c.signals || []).length > 0 && React.createElement("div", {
                style: { fontSize: 11, color: "#555", marginBottom: 3, cursor: "pointer" },
                onClick: function(){ onSelectDate && onSelectDate(e.date, "trades"); }
              }, "🎯 シグナル " + c.signals.length + "件"),
              c.chartMemo && _hasText(c.chartMemo.text) && React.createElement("div", {
                style: { fontSize: 11, color: "#444", whiteSpace: "pre-wrap",
                  maxHeight: 80, overflow: "hidden", cursor: "pointer" },
                onClick: function(){ onSelectDate && onSelectDate(e.date, "trades"); }
              }, "💬 " + stripHtml(c.chartMemo.text).slice(0, 240)),
              
              c.chartMemo && c.chartMemo.images && c.chartMemo.images.length > 0 &&
                React.createElement("div", {
                  style: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }
                }, c.chartMemo.images.map(function(im, mi) {
                  var src = imgSrc(im);
                  if (!src) return null;
                  return React.createElement("img", {
                    key: mi, src: src,
                    onClick: function(){ onSelectDate && onSelectDate(e.date, "trades"); },
                    style: { maxHeight: 120, borderRadius: 4, border: "1px solid #C7D2FE",
                      cursor: "zoom-in", display: "block" },
                    alt: ""
                  });
                }))
            )
          );
        })(),
        
        e.news.length > 0 && React.createElement("div", null,
          React.createElement("div", {
            style: { fontSize: 11, color: "#1565C0", fontWeight: 700, marginBottom: 4 }
          }, "📰 ニュース (" + e.news.length + ")"),
          React.createElement("div", null, e.news.map(function(nx, ni) {
            var imgs = nx.ni.images || [];
            return React.createElement("div", {
              key: ni,
              style: { padding: "8px", fontSize: 12, background: "#EFF6FF",
                border: "1px solid #BFDBFE", borderRadius: 5, marginBottom: 3 }
            },
              React.createElement("div", {
                style: { fontSize: 10, color: "#1565C0", marginBottom: 4, cursor: "pointer" },
                onClick: function(){ onSelectDate && onSelectDate(e.date, "news"); }
              }, "📂 " + nx.cat),
              
              imgs.length > 0 && React.createElement("div", {
                style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }
              }, imgs.map(function(im, mi) {
                var src = imgSrc(im);
                if (!src) return null;
                return React.createElement("img", {
                  key: mi, src: src,
                  onClick: function(){ onSelectDate && onSelectDate(e.date, "news"); },
                  style: { maxHeight: 200, maxWidth: "100%", borderRadius: 4,
                    border: "1px solid #BFDBFE", cursor: "zoom-in", display: "block" },
                  alt: ""
                });
              })),
              _hasText(nx.ni.text) && React.createElement("div", {
                style: { color: "#222", whiteSpace: "pre-wrap", cursor: "pointer" },
                onClick: function(){ onSelectDate && onSelectDate(e.date, "news"); }
              }, stripHtml(nx.ni.text)),
              (nx.ni.tags || []).length > 0 && React.createElement("div", {
                style: { display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }
              }, (nx.ni.tags || []).slice(0, 8).map(function(t, ti) {
                return React.createElement("span", {
                  key: ti,
                  style: { fontSize: 10, padding: "1px 5px",
                    background: "#fff", border: "1px solid #BFDBFE", color: "#1565C0",
                    borderRadius: 3 }
                }, stripCat(t));
              }))
            );
          }))
        )
      );
    })
  );
}



