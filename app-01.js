var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useRef = _React.useRef,
  useCallback = _React.useCallback,
  useMemo = _React.useMemo;
var IS_TOUCH = 'ontouchstart' in window;
function debounce(fn, ms) {
  var t;
  return function() {
    var a = arguments, c = this;
    clearTimeout(t);
    t = setTimeout(function(){ fn.apply(c, a); }, ms);
  };
}
var IMG_H = 180;
var DEF_STOCKS = ["日経平均株価", "JX金属", "フジクラ", "IHI", "川崎重工", "SBG", "INPEX"];
var DEF_FM_INDICATORS = ["NYダウ", "S&P500", "ナスダック100", "DAX", "上海総合", "香港ハンセン"];
var DEF_FM_STOCKS = [];
var DEF_NEWS_CATS = ["マーケット", "企業総論", "企業各論", "中東情勢"];

var _DEF_STOCKS_FROZEN = DEF_STOCKS.slice();
var _DEF_NEWS_CATS_FROZEN = DEF_NEWS_CATS.slice();
var MACRO_LEVELS = ["激強", "強", "やや強", "普通", "やや弱", "弱", "激弱"];
var MACRO_LABELS = {
  "激強": "激強(+1200~)",
  "強": "強(+600~+1200)",
  "やや強": "やや強(+300~+600)",
  "普通": "普通(～±300)",
  "やや弱": "やや弱(-300~-600)",
  "弱": "弱(-600~-1200)",
  "激弱": "激弱(-1200~)"
};
var MACRO_LABELS_STOCK = {
  "激強": "激強(+5%～)",
  "強": "強(+3～+5%)",
  "やや強": "やや強(+1～+3%)",
  "普通": "普通(±1%)",
  "やや弱": "やや弱(-1～-3%)",
  "弱": "弱(-3～-5%)",
  "激弱": "激弱(~-5%)"
};
var MACRO_COLORS = {
  "激強": ["#FDECEA", "#C0392B", "#7B241C"],
  "強": ["#FEF0EF", "#E74C3C", "#A93226"],
  "やや強": ["#FEF9E7", "#D4AC0D", "#9A7D0A"],
  "普通": ["#F2F3F4", "#717D7E", "#424949"],
  "やや弱": ["#EBF5FB", "#2874A6", "#1A5276"],
  "弱": ["#EAF0FF", "#1F618D", "#154360"],
  "激弱": ["#F3E5F5", "#7D3C98", "#4A235A"]
};
var getMC = function getMC(l) {
  return MACRO_COLORS[l] || MACRO_COLORS["普通"];
};
var DAYS_JP = ["日", "月", "火", "水", "木", "金", "土"];

function _fmtDow(d) {
  if (!d) return d || "";
  var dow = new Date(d + "T00:00:00").getDay();
  return d + "（" + DAYS_JP[dow] + "）";
}
var OPEN_TAGS = ["大幅GU：+5.0%～", "中幅GU：+3.0%～+5.0%", "小幅GU：+1.0%～+3.0%", "寄り横ばい：-1.0%～+1.0%", "小幅GD：-1.0%～-3.0%", "中幅GD：-3.0%～-5.0%", "大幅GD：-5.0%～"];
var MOVE_TAGS = []; 
var TECH_TAGS = [];
var GRADES = ["A", "B", "C", "D", "E", "F", "G"];
var TAG_SEL = ["#EEF4FF", "#7A9CC8", "#1a1a1a"];
var TAG_UNS = ["#fff", "#bbb", "#555"];

var _TAG_QC = ['#E05252','#F07A30','#F5C842','#4CAF50','#4A90D9','#7C3AED','#EC4899','#64748B'];
function _isDarkColor(hex) {
  if (!hex || hex.length < 7) return false;
  var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b) < 140;
}
function _tagColorTriple(hex, selected) {
  if (selected) return [hex, hex, _isDarkColor(hex) ? "#fff" : "#1a1a1a"];
  return [hex + "28", hex, "#1a1a1a"];
}
var EMPTY = {
  trades: {},
  charts: {},
  custom: {
    stocks: [],
    cats: {},
    tags: [],
    flowOpenTags: [],
    flowMoveTags: [],
    signalTags: [],
    newsCategories: [].concat(DEF_NEWS_CATS),
    newsCatDefaults: {},
    newsSubCats: {},
    newsSubCatDefaults: {},
    stockSubCatRefs: {}
  }
};
var ST_KEY = "scalping_data_v6",
  CF_KEY = "scalping_cfg_v2";
function getFC(t) {
  if (["大幅GU：+5.0%～", "中幅GU：+3.0%～+5.0%", "小幅GU：+1.0%～+3.0%", "上昇トレンド", "高値維持上昇", "V字回復"].includes(t)) return ["#EAF3DE", "#2E7D32", "#27500A"];
  if (["寄り横ばい：-1.0%～+1.0%", "高値圏ヨコヨコ", "レンジ", "安値圏ヨコヨコ"].includes(t)) return ["#FAEEDA", "#E65100", "#633806"];
  return ["#FCEBEB", "#C62828", "#791F1F"];
}
function dateFmt(y, m, d) {
  return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
}
function todayStr() {
  var n = new Date();
  return dateFmt(n.getFullYear(), n.getMonth(), n.getDate());
}
function stripCat(t) {
  return t.replace(/^[^:]+:/, "");
}
function stripHtml(h) {
  try {
    var d = document.createElement('div');
    d.innerHTML = h || '';
    return d.textContent || d.innerText || '';
  } catch (_unused) {
    return '';
  }
}


function _hasText(t) {
  if (!t) return false;
  if (typeof t !== "string") return !!t;
  return stripHtml(t).replace(/\u00a0/g, " ").trim().length > 0;
}
function calcSim(a, b) {
  if (!a || !b || !a.length || !b.length) return 0;
  var sa = {},
    sb = {};
  a.forEach(function (t) {
    return sa[t] = (sa[t] || 0) + 1;
  });
  b.forEach(function (t) {
    return sb[t] = (sb[t] || 0) + 1;
  });
  var keys = new Set([].concat(_toConsumableArray(Object.keys(sa)), _toConsumableArray(Object.keys(sb))));
  var i = 0,
    u = 0;
  keys.forEach(function (k) {
    i += Math.min(sa[k] || 0, sb[k] || 0);
    u += Math.max(sa[k] || 0, sb[k] || 0);
  });
  return u ? i / u * .8 + (1 - Math.abs(a.length - b.length) / Math.max(a.length, b.length, 1)) * .2 : 0;
}
function fileToImg(_x) {
  return _fileToImg.apply(this, arguments);
}
function _fileToImg() {
  _fileToImg = _asyncToGenerator(_regenerator().m(function _callee4(file) {
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          return _context4.a(2, new Promise(function (res) {
            if (!file) return res(null);
            var r = new FileReader();
            r.onload = function (e) {
              try {
                var result = e.target.result;
                if (!result || typeof result !== "string") return res(null);
                var commaIdx = result.indexOf(",");
                if (commaIdx === -1) return res(null);
                var base64 = result.substring(commaIdx + 1);
                if (!base64) return res(null);
                var headerMatch = result.substring(0, commaIdx).match(/^data:([^;]+)/);
                var mt = headerMatch ? headerMatch[1] : (file.type || "image/png");
                return res({ base64: base64, mt: mt, id: Date.now() });
              } catch (_e) { return res(null); }
            };
            r.onerror = function () { return res(null); };
            try { r.readAsDataURL(file); } catch (_e2) { res(null); }
          }));
      }
    }, _callee4);
  }));
  return _fileToImg.apply(this, arguments);
}
function getAllNewsCatsData(dd) {
  if (!dd) return {};
  if (dd.newsCats) return dd.newsCats;
  var hasOld = dd.marketTags && dd.marketTags.length || dd.newsItems && dd.newsItems.length || dd.newsMemo && _hasText(dd.newsMemo.text);
  if (hasOld) return {
    "マーケット": {
      marketTags: dd.marketTags || [],
      newsItems: dd.newsItems || [],
      newsMemo: dd.newsMemo || {
        text: "",
        images: []
      }
    }
  };
  return {};
}
function getCatData(dd, cat) {
  var all = getAllNewsCatsData(dd);
  return all[cat] || {
    marketTags: [],
    newsItems: [],
    newsMemo: {
      text: "",
      images: []
    }
  };
}
function hasCatContent(cd) {
  if (!cd) return false;
  if ((cd.marketTags || []).length > 0) return true;
  if ((cd.newsItems || []).some(function (n) {
    return _hasText(n.text) || n.images && n.images.length;
  })) return true;
  if (cd.newsMemo && (_hasText(cd.newsMemo.text) || cd.newsMemo.images && cd.newsMemo.images.length)) return true;
  if (cd.subCatMemos && typeof cd.subCatMemos === "object") {
    var _scKeys = Object.keys(cd.subCatMemos);
    for (var _scIdx = 0; _scIdx < _scKeys.length; _scIdx++) {
      var _scm = cd.subCatMemos[_scKeys[_scIdx]];
      if (_scm && (_hasText(_scm.text) || (_scm.images && _scm.images.length))) return true;
    }
  }
  return false;
}

function getDayEvents(dd) {
  if (!dd || !Array.isArray(dd.events)) return [];
  var arr = dd.events.filter(function(e) { return e && !e._deleted; });
  arr.sort(function(a, b) {
    var ta = (a && a.startTime) || (a && a.allDay ? "" : "99:99");
    var tb = (b && b.startTime) || (b && b.allDay ? "" : "99:99");
    if (ta === tb) return 0;
    return ta < tb ? -1 : 1;
  });
  return arr;
}
function hasEventsContent(dd) {
  if (!dd || !Array.isArray(dd.events)) return false;
  return dd.events.some(function(ev) {
    return ev && !ev._deleted && (_hasText(ev.title) || _hasText(ev.content) || _hasText(ev.contentHtml));
  });
}

function getEventColor(ev, eventCategories) {
  var DEF = "#6366F1";
  if (!ev || !ev.categoryId) return DEF;
  if (!Array.isArray(eventCategories)) return DEF;
  var c = eventCategories.find(function(x){ return x && x.id === ev.categoryId; });
  return (c && c.color) ? c.color : DEF;
}
function getEventCategoryName(ev, eventCategories) {
  if (!ev || !ev.categoryId) return "";
  if (!Array.isArray(eventCategories)) return "";
  var c = eventCategories.find(function(x){ return x && x.id === ev.categoryId; });
  return (c && c.name) ? c.name : "";
}




function _buildHolidayDateSet(trades, eventCategories) {
  var s = {};
  if (!trades || typeof trades !== "object") return s;
  
  var holidayIds = {};
  if (Array.isArray(eventCategories)) {
    eventCategories.forEach(function(c) {
      if (!c || !c.id) return;
      if (c.id === "evcat_holiday") { holidayIds[c.id] = true; return; }
      var nm = c.name || "";
      if (nm.indexOf("祝日") >= 0 || nm.indexOf("休場") >= 0) holidayIds[c.id] = true;
    });
  }
  
  holidayIds["evcat_holiday"] = true;
  var addRange = function(start, end) {
    if (!start) return;
    s[start] = true;
    if (!end || end <= start) return;
    try {
      var sd = new Date(start + "T00:00");
      var ed = new Date(end + "T00:00");
      for (var d2 = new Date(sd.getTime() + 86400000); d2 <= ed; d2 = new Date(d2.getTime() + 86400000)) {
        var k2 = d2.getFullYear() + "-" + String(d2.getMonth() + 1).padStart(2, "0") + "-" + String(d2.getDate()).padStart(2, "0");
        s[k2] = true;
      }
    } catch(e){}
  };
  Object.keys(trades).forEach(function(dt) {
    var dd = trades[dt];
    if (!dd || !Array.isArray(dd.events)) return;
    dd.events.forEach(function(ev) {
      if (!ev || ev._deleted || !ev.categoryId) return;
      if (!holidayIds[ev.categoryId]) return;
      addRange(dt, ev.endDate || "");
    });
  });
  return s;
}

function _collectCatTagsFromTrades(trades, cat) {
  var s = {};
  if (!trades || !cat) return s;
  Object.keys(trades).forEach(function(date) {
    var dd = trades[date]; if (!dd) return;
    var allCats = getAllNewsCatsData(dd);
    var cd = allCats[cat]; if (!cd) return;
    (cd.newsItems || []).forEach(function(ni) {
      (ni.tags || []).forEach(function(t) { if (t) s[t] = true; });
    });
  });
  return s;
}

function _filterTagPoolForCat(custom, trades, cat) {
  var used = _collectCatTagsFromTrades(trades, cat);
  var newCats = {};
  var srcCats = (custom && custom.cats) || {};
  Object.keys(srcCats).forEach(function(c) {
    var arr = (srcCats[c] || []).filter(function(name) { return used[c + ":" + name]; });
    if (arr.length > 0) newCats[c] = arr;
  });
  var newTags = ((custom && custom.tags) || []).filter(function(t) { return used[t]; });
  return { cats: newCats, tags: newTags };
}
function migrateData(d) {
  if (!d || typeof d !== "object") return EMPTY;
  if (!d.custom) d.custom = {};
  if (!d.custom.cats) d.custom.cats = {};
  if (!d.custom.tags) d.custom.tags = [];
  if (!d.custom.stocks) d.custom.stocks = [];
  if (!d.custom.flowOpenTags) d.custom.flowOpenTags = [];
  if (!d.custom.flowMoveTags) d.custom.flowMoveTags = [];
  if (!d.custom.signalTags) d.custom.signalTags = d.custom.techTags || [];
  delete d.custom.techTags;
  if (!d.custom.newsCategories) d.custom.newsCategories = [].concat(DEF_NEWS_CATS);
  if (!d.custom.newsCatDefaults || typeof d.custom.newsCatDefaults !== "object") d.custom.newsCatDefaults = {};
  if (!d.custom.newsSubCats || typeof d.custom.newsSubCats !== "object") d.custom.newsSubCats = {};
  if (!d.custom.newsSubCatDefaults || typeof d.custom.newsSubCatDefaults !== "object") d.custom.newsSubCatDefaults = {};
  if (!d.custom.stockSubCatRefs || typeof d.custom.stockSubCatRefs !== "object") d.custom.stockSubCatRefs = {};
  if (!d.custom.stockInfoTabs || typeof d.custom.stockInfoTabs !== "object") d.custom.stockInfoTabs = {};

  if (!d.custom._alphaDefault5Mig) {
    if (d.charts && typeof d.charts === "object") {
      Object.keys(d.charts).forEach(function(_ck) {
        var _cc = d.charts[_ck];
        if (_cc && _cc.alphaVal != null && Number(_cc.alphaVal) === 0) delete _cc.alphaVal;
      });
    }
    d.custom._alphaDefault5Mig = true;
  }

  if (!d.custom._alphaPerRecordMig) {
    if (d.charts && typeof d.charts === "object") {
      Object.keys(d.charts).forEach(function(_ck) {
        var _cc = d.charts[_ck];
        if (!_cc || _cc.alphaVal == null) return;
        if (Array.isArray(_cc.signals)) {
          _cc.signals.forEach(function(s) { if (s && s.alphaVal == null) s.alphaVal = _cc.alphaVal; });
        }
        delete _cc.alphaVal;
      });
    }
    d.custom._alphaPerRecordMig = true;
  }

  
  
  
  if (!d.custom.shvExtraTags || typeof d.custom.shvExtraTags !== "object" || Array.isArray(d.custom.shvExtraTags)) {
    var _migShvT = {};
    try {
      var _lsT = JSON.parse(localStorage.getItem("sn_shv_extra_tags_v1") || "{}");
      if (_lsT && typeof _lsT === "object" && !Array.isArray(_lsT)) _migShvT = _lsT;
    } catch(e){}
    d.custom.shvExtraTags = _migShvT;
  }
  if (!d.custom.shvExtraCats || typeof d.custom.shvExtraCats !== "object" || Array.isArray(d.custom.shvExtraCats)) {
    var _migShvC = {};
    try {
      var _lsC = JSON.parse(localStorage.getItem("sn_shv_extra_cats_v1") || "{}");
      if (_lsC && typeof _lsC === "object" && !Array.isArray(_lsC)) _migShvC = _lsC;
    } catch(e){}
    d.custom.shvExtraCats = _migShvC;
  }
  
  
  if (!d.custom.eventCategories || !Array.isArray(d.custom.eventCategories) || d.custom.eventCategories.length === 0) {
    d.custom.eventCategories = [
      { id: "evcat_kessan", name: "\u6C7A\u7B97", color: "#EF4444" },
      { id: "evcat_macro",  name: "\u7D4C\u6E08\u6307\u6A19", color: "#3B82F6" },
      { id: "evcat_holiday", name: "\u795D\u65E5\u30FB\u4F11\u573A", color: "#10B981" },
      { id: "evcat_other",  name: "\u305D\u306E\u4ED6", color: "#6366F1" }
    ];
  }
  if (!d.stockInfo || typeof d.stockInfo !== "object") d.stockInfo = {};
  if (!d.trades) d.trades = {};
  if (!d.charts) d.charts = {};
  
  
  try {
    Object.keys(d.trades).forEach(function(dt) {
      var dd = d.trades[dt];
      if (!dd || typeof dd !== "object") return;
      
      if (!dd.events || !Array.isArray(dd.events)) dd.events = [];
      
      if (dd.newsCats) {
        delete dd.marketTags;
        delete dd.newsItems;
        delete dd.newsMemo;
      }
      
      if (dd.newsCats && typeof dd.newsCats === "object") {
        Object.keys(dd.newsCats).forEach(function(cat) {
          var c = dd.newsCats[cat];
          if (c && c.marketTags && c.marketTags.length) {
            c.marketTags = [];
          }
        });
      }
    });
  } catch(e) { console.warn("[migrateData] cleanup error:", e); }
  
  
  try {
    var _isValidImg = function(img) {
      if (!img || typeof img !== "object") return false;
      var hasB64 = typeof img.base64 === "string" && img.base64.length > 100;
      var hasUrl = typeof img.imageUrl === "string" && img.imageUrl.length > 0;
      var hasRef = img.base64 === "__ref__"; 
      return hasB64 || hasUrl || hasRef;
    };
    
    if (d.charts) {
      Object.keys(d.charts).forEach(function(ck) {
        var c = d.charts[ck];
        if (!c || typeof c !== "object") return;
        if (c.chartImgs && Array.isArray(c.chartImgs)) {
          c.chartImgs = c.chartImgs.filter(_isValidImg);
          if (c.chartImgs.length === 0) { delete c.chartImgs; }
        }
        if (c.chartImg && !_isValidImg(c.chartImg)) { delete c.chartImg; }
        
        if (c.chartMemo && c.chartMemo.images && Array.isArray(c.chartMemo.images)) {
          c.chartMemo.images = c.chartMemo.images.filter(_isValidImg);
        }
      });
    }
    
    if (d.trades) {
      Object.keys(d.trades).forEach(function(dt) {
        var dd = d.trades[dt];
        if (!dd || typeof dd !== "object") return;
        if (dd.newsCats && typeof dd.newsCats === "object") {
          Object.keys(dd.newsCats).forEach(function(cat) {
            var cc = dd.newsCats[cat];
            if (!cc) return;
            if (cc.newsItems && Array.isArray(cc.newsItems)) {
              cc.newsItems.forEach(function(ni) {
                if (ni && ni.images && Array.isArray(ni.images)) {
                  ni.images = ni.images.filter(_isValidImg);
                }
              });
            }
            if (cc.newsMemo && cc.newsMemo.images && Array.isArray(cc.newsMemo.images)) {
              cc.newsMemo.images = cc.newsMemo.images.filter(_isValidImg);
            }
            
            if (cc.subCatMemos && typeof cc.subCatMemos === "object") {
              Object.keys(cc.subCatMemos).forEach(function(_scKey) {
                var _scm = cc.subCatMemos[_scKey];
                if (_scm && _scm.images && Array.isArray(_scm.images)) {
                  _scm.images = _scm.images.filter(_isValidImg);
                }
              });
            }
          });
        }
        
        if (dd.newsItems && Array.isArray(dd.newsItems)) {
          dd.newsItems.forEach(function(ni) {
            if (ni && ni.images && Array.isArray(ni.images)) {
              ni.images = ni.images.filter(_isValidImg);
            }
          });
        }
        
        if (dd.tradesMemo && dd.tradesMemo.images && Array.isArray(dd.tradesMemo.images)) {
          dd.tradesMemo.images = dd.tradesMemo.images.filter(_isValidImg);
        }
        
        if (dd.summaryMemo && dd.summaryMemo.images && Array.isArray(dd.summaryMemo.images)) {
          dd.summaryMemo.images = dd.summaryMemo.images.filter(_isValidImg);
        }
        
        if (dd.tradesSummaryMemo && dd.tradesSummaryMemo.images && Array.isArray(dd.tradesSummaryMemo.images)) {
          dd.tradesSummaryMemo.images = dd.tradesSummaryMemo.images.filter(_isValidImg);
        }
      });
    }
  } catch(e) { console.warn("[migrateData] image cleanup error:", e); }
  
  if (!d._migFmRename1 && d.foreignMarkets && typeof d.foreignMarkets === "object") {
    try {
      var _fmRenames = { "NYダウ": "ダウ平均株価" };
      Object.keys(d.foreignMarkets).forEach(function(dt) {
        var day = d.foreignMarkets[dt];
        if (!day) return;
        ["indicators", "stocks"].forEach(function(key) {
          if (!Array.isArray(day[key])) return;
          day[key] = day[key].map(function(e) {
            var mapped = _fmRenames[e.name];
            return mapped ? Object.assign({}, e, { name: mapped }) : e;
          });
        });
      });
      
      if (d.custom && d.custom.foreignMarketDefaults) {
        ["indicators", "stocks"].forEach(function(key) {
          var arr = d.custom.foreignMarketDefaults[key];
          if (!Array.isArray(arr)) return;
          d.custom.foreignMarketDefaults[key] = arr.map(function(n) { return _fmRenames[n] || n; });
        });
      }
      d._migFmRename1 = true;
    } catch(e) { console.warn("[migrateData] fmRename error:", e); }
  }
  
  if (!d._migCatClean1) {
    try {
      if (d.custom) {
        var _keepCats = { "企業": 1, "資源": 1, "外交": 1, "その他": 1 };
        if (d.custom.cats && typeof d.custom.cats === "object" && !Array.isArray(d.custom.cats)) {
          var _newCats = {};
          Object.keys(d.custom.cats).forEach(function(k) {
            if (_keepCats[k]) _newCats[k] = d.custom.cats[k];
          });
          d.custom.cats = _newCats;
        }
        if (Array.isArray(d.custom.tags)) {
          d.custom.tags = [];
        }
      }
      d._migCatClean1 = true;
    } catch(e) { console.warn("[migrateData] catClean error:", e); }
  }
  
  if (!d._migSignalRename1) {
    try {
      var _sigRenames = { "底つきサイン否定水準線OS": "底つきサイン水準線OS" };
      if (d.charts && typeof d.charts === "object") {
        Object.keys(d.charts).forEach(function(ck) {
          var cc = d.charts[ck];
          if (!cc || !Array.isArray(cc.signals)) return;
          cc.signals = cc.signals.map(function(s) {
            if (s.isCustomTag) return s;
            var updated = Object.assign({}, s);
            if (updated.tag && _sigRenames[updated.tag]) updated.tag = _sigRenames[updated.tag];
            if (Array.isArray(updated.tags)) {
              var newTags = updated.tags.map(function(x) { return _sigRenames[x] || x; });
              updated.tags = newTags.filter(function(x, i) { return newTags.indexOf(x) === i; });
            }
            return updated;
          });
        });
      }
      d._migSignalRename1 = true;
    } catch(e) { console.warn("[migrateData] sigRename error:", e); }
  }
  return d;
}
function stLoad() {
  try {
    var s = localStorage.getItem(ST_KEY) || localStorage.getItem("scalping_data_v5");
    if (!s) { console.log("[stLoad] localStorage empty, using EMPTY"); return EMPTY; }
    var d = migrateData(JSON.parse(s));
    
    var b64count = (s.match(/"base64":"(?!__ref__)[^"]{100}/g) || []).length;
    var refcount = (s.match(/"base64":"__ref__"/g) || []).length;
    var urlcount = (s.match(/"imageUrl":"https?:/g) || []).length;
    console.log("[stLoad] localStorage loaded: base64=" + b64count + " __ref__=" + refcount + " imageUrl=" + urlcount + " size=" + Math.round(s.length/1024) + "KB");
    
    if (refcount > 0) {
      var repaired = 0;
      var _repair = function(obj) {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) { obj.forEach(_repair); return; }
        for (var k in obj) {
          if (!obj.hasOwnProperty(k)) continue;
          if ((k === "base64" || k === "orig_base64" || k === "strokes") && obj[k] === "__ref__") {
            obj[k] = null;
            repaired++;
          } else if (typeof obj[k] === "object") {
            _repair(obj[k]);
          }
        }
      };
      _repair(d);
      if (repaired > 0) {
        console.warn("[stLoad] Repaired " + repaired + " corrupted __ref__ fields");
        try { localStorage.setItem(ST_KEY, JSON.stringify(d)); } catch(e){}
      }
    }
    
    
    setTimeout(function() { _stSaveImagesToIdb(d); }, 5000);
    return d;
  } catch (_unused2) {
    console.warn("[stLoad] parse error, using EMPTY");
    return EMPTY;
  }
}
var _stSaveTimer;
var _stSaveLatest = null;
function stSave(d, immediate) {
  _stSaveLatest = d;
  clearTimeout(_stSaveTimer);
  if (immediate) {
    
    _stFlush(true);
    return;
  }
  _stSaveTimer = setTimeout(function() {
    _stFlush(true);
  }, 1500);
}

function _stStrip(data) {
  return JSON.stringify(data, function(key, val) {
    if ((key === "base64" || key === "orig_base64") && typeof val === "string" && val.length > 100) {
      var parent = this;
      if ((key === "base64" && parent.imageUrl) || (key === "orig_base64" && parent.origImageUrl)) {
        return null;
      }
    }
    return val;
  });
}
function _stWriteToStorage(data) {
  try {
    var s = _stStrip(data);
    var refCount = (s.match(/"__ref__"/g) || []).length;
    if (refCount > 0) console.warn("[stSave] WARNING: saving " + refCount + " __ref__ values to localStorage — images may be lost");
    try {
      localStorage.setItem(ST_KEY, s);
    } catch(quotaErr) {
      console.warn("[stSave] localStorage quota exceeded — syncing images to IDB");
      _stSaveImagesToIdb(data);
      try { localStorage.setItem(ST_KEY, _stStrip(data)); } catch(e2) {
        console.warn("[stSave] Even stripped save failed:", e2);
      }
    }
  } catch (_unused3) {}
}
function _stFlush(skipBlur) {
  
  
  
  if (!skipBlur) {
    try {
      var ae = document.activeElement;
      if (ae && ae !== document.body && typeof ae.blur === "function") ae.blur();
    } catch(e){}
  }
  if (_stSaveLatest === null) return;
  clearTimeout(_stSaveTimer);
  
  
  _stWriteToStorage(_stSaveLatest);
  _stSaveLatest = null;
}


window.addEventListener("beforeunload", function(){
  if (typeof window._snAnnotAutoSave === "function") window._snAnnotAutoSave();
  _stFlush(false);
});
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="hidden") {
    if (typeof window._snAnnotAutoSave === "function") window._snAnnotAutoSave();
    _stFlush(false);
    
    if (typeof window._snFbFlushNow === "function") window._snFbFlushNow();
  }
});
window.addEventListener("pagehide", function(){
  if (typeof window._snAnnotAutoSave === "function") window._snAnnotAutoSave();
  _stFlush(false);
  
  if (typeof window._snFbFlushNow === "function") window._snFbFlushNow();
});
function cfLoad() {
  try {
    var s = localStorage.getItem(CF_KEY);
    return s ? JSON.parse(s) : {};
  } catch (_unused4) {
    return {};
  }
}
function cfSave(c) {
  try {
    localStorage.setItem(CF_KEY, JSON.stringify(c));
  } catch (_unused5) {}
}



var _FB_USAGE_PREFIX = "fb_usage_";
var _fbUsageCache = null;     
var _fbUsageFlushTimer = null;
function _fbUsageKey() {
  var d = new Date();
  return _FB_USAGE_PREFIX + d.getFullYear() + "_" + (d.getMonth() + 1);
}
function _fbUsageGet() {
  if (_fbUsageCache) return _fbUsageCache;
  try {
    var s = localStorage.getItem(_fbUsageKey());
    if (s) { _fbUsageCache = JSON.parse(s); return _fbUsageCache; }
  } catch(e){}
  _fbUsageCache = { db_dl: 0, db_ul: 0, st_dl: 0, st_ul: 0,
           st_ul_ops: 0, st_dl_ops: 0, polls: 0, puts: 0,
           month: new Date().getMonth() + 1 };
  return _fbUsageCache;
}
function _fbUsageFlush() {
  if (!_fbUsageCache) return;
  try { localStorage.setItem(_fbUsageKey(), JSON.stringify(_fbUsageCache)); } catch(e){}
}
function _fbUsageSave(u) {
  
  _fbUsageCache = u;
  clearTimeout(_fbUsageFlushTimer);
  _fbUsageFlushTimer = setTimeout(_fbUsageFlush, 2000);
}

window.addEventListener("beforeunload", _fbUsageFlush);
document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="hidden") _fbUsageFlush(); });
function _fbUsageFormat(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
}


var _FB_FREE = {
  db_dl: 10737418240,     
  st_dl: 107374182400,    
  st_store: 5368709120,   
  st_ul_ops: 5000,        
  st_dl_ops: 50000        
};


var _fbWarnShown = {};  
var _fbAutoPauseCb = null; 

function _fbSetAutoPauseCb(cb) { _fbAutoPauseCb = cb; }

function _fbTrack(cat, bytes) {
  var u = _fbUsageGet();
  u[cat] = (u[cat] || 0) + (bytes || 0);
  
  if (cat === "db_dl") u.polls = (u.polls || 0) + 1;
  if (cat === "db_ul") u.puts = (u.puts || 0) + 1;
  if (cat === "st_dl") { u.st_dl_ops = (u.st_dl_ops || 0) + 1; }
  if (cat === "st_ul") { u.st_ul_ops = (u.st_ul_ops || 0) + 1; }
  _fbUsageSave(u);
  
  _fbCheckLimits(u);
}

function _fbCheckLimits(u) {
  var checks = [
    { key: "db_dl", val: u.db_dl, free: _FB_FREE.db_dl, label: "DB\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" },
    { key: "st_dl", val: u.st_dl, free: _FB_FREE.st_dl, label: "Storage\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" },
    { key: "st_ul_ops", val: u.st_ul_ops || 0, free: _FB_FREE.st_ul_ops, label: "Storage\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u64CD\u4F5C" },
    { key: "st_dl_ops", val: u.st_dl_ops || 0, free: _FB_FREE.st_dl_ops, label: "Storage\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u64CD\u4F5C" }
  ];
  for (var i = 0; i < checks.length; i++) {
    var c = checks[i];
    var pct = c.val / c.free * 100;
    
    if (pct >= 90 && !_fbWarnShown[c.key + "_90"]) {
      _fbWarnShown[c.key + "_90"] = true;
      var msg = "\u26D4 Firebase\u7121\u6599\u679A\u306E90%\u5230\u9054: " + c.label + " (" + Math.round(pct) + "%)\n\u8AB2\u91D1\u9632\u6B62\u306E\u305F\u3081\u540C\u671F\u3092\u81EA\u52D5\u505C\u6B62\u3057\u307E\u3059\u3002";
      console.warn("[FB LIMIT] " + msg);
      _fbShowBanner(msg, "#D32F2F");
      
      if (_fbAutoPauseCb) _fbAutoPauseCb();
    }
    
    else if (pct >= 80 && !_fbWarnShown[c.key + "_80"]) {
      _fbWarnShown[c.key + "_80"] = true;
      var msg80 = "\u26A0\uFE0F Firebase\u7121\u6599\u679A\u306E80%\u5230\u9054: " + c.label + " (" + Math.round(pct) + "%)";
      console.warn("[FB LIMIT] " + msg80);
      _fbShowBanner(msg80, "#E65100");
    }
  }
}


function _fbShowBanner(text, bgColor) {
  
  var old = document.getElementById("fb-usage-banner");
  if (old) old.remove();
  var el = document.createElement("div");
  el.id = "fb-usage-banner";
  el.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;padding:10px 48px 10px 16px;font-size:13px;font-weight:600;color:#fff;text-align:center;background:" + bgColor + ";box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;";
  el.textContent = text;
  
  el.onclick = function() { el.remove(); };
  document.body.appendChild(el);
  
  setTimeout(function() { if (el.parentNode) el.remove(); }, 15000);
}


function _fbBase(cfg) {
  if (!cfg || !cfg.fbUrl) return null;
  return cfg.fbUrl.replace(/\/$/, "");
}
function _fbAuth(cfg) {
  return cfg && cfg.fbSecret ? "?auth=" + cfg.fbSecret : "";
}
function makeFbUrl(cfg) {
  
  var b = _fbBase(cfg);
  return b ? b + "/meta.json" + _fbAuth(cfg) : null;
}
function _makeFbDataUrl(cfg) {
  
  var b = _fbBase(cfg);
  return b ? b + "/data.json" + _fbAuth(cfg) : null;
}




var _HEAVY_KEYS = { base64:1, orig_base64:1 };
function _stripHeavy(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(_stripHeavy);
  if (typeof obj === "object") {
    var out = {};
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) continue;
      if (_HEAVY_KEYS[k]) { out[k] = "__ref__"; continue; }
      out[k] = _stripHeavy(obj[k]);
    }
    return out;
  }
  return obj;
}
function _buildMeta(data) {
  var m = _stripHeavy(data);
  m._v = Date.now();
  return m;
}



function _mergeRemoteMeta(local, remote, _parentLocalNewer) {
  if (remote === null || remote === undefined) return local;
  if (remote === "__ref__") return local; 
  if (typeof remote !== "object") return remote; 
  if (Array.isArray(remote)) {
    if (!Array.isArray(local)) return remote;
    
    if (remote.length === 0) return remote;
    
    if (remote[0] && typeof remote[0] === "object" && remote[0].id !== undefined) {
      var localMap = {};
      (local || []).forEach(function(item) { if (item && item.id !== undefined) localMap[item.id] = item; });
      var _seenIds = {};
      var _mergedArr = remote.map(function(rItem) {
        if (!rItem || typeof rItem !== "object") return rItem;
        _seenIds[rItem.id] = 1;
        var lItem = localMap[rItem.id];
        var m = lItem ? _mergeRemoteMeta(lItem, rItem, _parentLocalNewer) : rItem;

        if (m && typeof m === "object" && ((lItem && lItem._deleted) || rItem._deleted)) m._deleted = true;
        return m;
      });


      (local || []).forEach(function(lItem) {
        if (lItem && lItem._deleted && lItem.id !== undefined && !_seenIds[lItem.id]) _mergedArr.push(lItem);
      });
      return _mergedArr;
    }
    
    return remote.map(function(rItem, i) {
      return i < (local || []).length ? _mergeRemoteMeta(local[i], rItem, _parentLocalNewer) : rItem;
    });
  }
  
  var out = {};
  var allKeys = {};
  if (local && typeof local === "object") { for (var k in local) { if (local.hasOwnProperty(k)) allKeys[k] = 1; } }
  for (var k2 in remote) { if (remote.hasOwnProperty(k2)) allKeys[k2] = 1; }
  
  
  var _DELETABLE_KEYS = { chartImg: 1, chartImgs: 1, images: 1, image: 1, imageUrl: 1, origImageUrl: 1, base64: 1, orig_base64: 1 };
  
  
  
  
  
  
  
  var _PROTECTED_KEYS = { strokes: 1, shvExtraTags: 1, shvExtraCats: 1, dailyOrder: 1, signalsOrder: 1 };
  
  
  
  
  var _LOCAL_WINS_KEYS = { cats: 1, tags: 1, marketTags: 1, stockTags: 1,
    signalTags: 1, signalDefs: 1, flowOpenTags: 1, flowMoveTags: 1,
    newsCategories: 1, newsSubCats: 1, newsCatDefaults: 1, newsSubCatDefaults: 1, stocks: 1,
    eventCategories: 1 };
  
  var _ALWAYS_LOCAL_WINS_KEYS = { cats: 1, tags: 1 };
  var _remoteIsNewer = false;
  var _localIsNewer = !!_parentLocalNewer; 
  if (remote && typeof remote === "object" && typeof remote._v === "number" &&
      local && typeof local === "object" && typeof local._v === "number") {
    _remoteIsNewer = remote._v >= local._v;
    if (!_remoteIsNewer) _localIsNewer = true;
  }
  for (var key in allKeys) {
    var rv = remote.hasOwnProperty(key) ? remote[key] : undefined;
    var lv = local && local.hasOwnProperty(key) ? local[key] : undefined;
    if (rv === "__ref__") { out[key] = lv !== undefined ? lv : rv; }
    else if (rv === undefined) {
      
      
      
      
      if (_PROTECTED_KEYS[key]) { if (lv !== undefined) out[key] = lv; }
      else if (_DELETABLE_KEYS[key]) {  }
      else if (_remoteIsNewer) {  }
      else { out[key] = lv; }
    }
    else if (_ALWAYS_LOCAL_WINS_KEYS[key] && lv !== undefined) {
      out[key] = lv;
    }
    else if (_localIsNewer && _LOCAL_WINS_KEYS[key] && lv !== undefined) {
      out[key] = lv;
    }
    else { out[key] = _mergeRemoteMeta(lv, rv, _localIsNewer); }
  }
  
  
  
  if (local && typeof local === "object") {
    if (out.imageUrl && out.imageUrl !== "__ref__" && local.imageUrl && out.imageUrl !== local.imageUrl) {
      out.base64 = null;
    }
    if (out.origImageUrl && out.origImageUrl !== "__ref__" && local.origImageUrl && out.origImageUrl !== local.origImageUrl) {
      out.orig_base64 = null;
    }
  }
  return out;
}




function fbGet(cfg) {
  var metaUrl = makeFbUrl(cfg);       
  var dataUrl = _makeFbDataUrl(cfg);  
  if (!metaUrl) return Promise.resolve(null);
  function _parse(txt) {
    try { _fbTrack("db_dl", txt ? txt.length : 0); } catch(e){}
    var d = null;
    try { d = txt ? JSON.parse(txt) : null; } catch(e) { d = null; }
    if (d === null || d === undefined) return "EMPTY";
    return (d && _typeof(d) === "object" && (d.trades || d.charts)) ? d : "EMPTY";
  }
  return fetch(metaUrl)
    .then(function(r) {
      if (r.ok) return r.text().then(_parse);
      
      if (r.status === 404 && dataUrl) {
        console.log("[fbGet] meta.json not found, falling back to data.json (old DB)");
        return fetch(dataUrl).then(function(r2) {
          if (!r2.ok) return null;
          return r2.text().then(_parse);
        });
      }
      return null;
    })
    ["catch"](function() { return null; });
}


var _fbLocalV = 0;


var _fbLastPutHash = null;     
function _fbHashStr(s) {
  
  var h = 2166136261 >>> 0;
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(36);
}
function fbPut(_x3, _x4) {
  return _fbPut.apply(this, arguments);
}
function _fbPut() {
  _fbPut = _asyncToGenerator(_regenerator().m(function _callee6(cfg, data) {
    var base, auth, fbData, _t2;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          base = _fbBase(cfg);
          auth = _fbAuth(cfg);
          if (base) { _context6.n = 1; break; }
          return _context6.a(2);
        case 1:
          _context6.p = 1;
          _context6.n = 2;
          
          return _uploadAllImages(data);
        case 2:
          fbData = _context6.v;
          _fbLocalV = fbData._v || Date.now();
          _context6.n = 3;
          
          
          var _lightMeta = _buildMeta(fbData);
          _lightMeta._v = _fbLocalV;
          var _metaBody = JSON.stringify(_lightMeta);
          
          
          
          var _shouldSkip = false;
          try {
            var metaNoV = _metaBody.replace(/,?"_v":\d+/g, "");
            var sig = metaNoV.length + ":" + _fbHashStr(metaNoV);
            if (_fbLastPutHash && _fbLastPutHash === sig) {
              _shouldSkip = true;
            } else {
              _fbLastPutHash = sig;
            }
          } catch(_e) {  }
          if (_shouldSkip) {
            console.log("[fbPut] skipped (no content change, _v=" + _fbLocalV + ")");
            return _context6.a(2);
          }
          _fbTrack("db_ul", _metaBody.length);
          return fetch(base + "/meta.json" + auth, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: _metaBody
          }).then(function(r) {
            
            if (!r.ok) {
              _fbLastPutHash = null;
              console.warn("[fbPut] HTTP error: meta=" + r.status);
            }
            return r;
          });
        case 3:
          _context6.n = 5;
          break;
        case 4:
          _context6.p = 4;
          _t2 = _context6.v;
          
          _fbLastPutHash = null;
        case 5:
          return _context6.a(2);
      }
    }, _callee6, null, [[1, 4]]);
  }));
  return _fbPut.apply(this, arguments);
}


function fbPollV(_x2b) {
  return _fbPollV.apply(this, arguments);
}
function _fbPollV() {
  _fbPollV = _asyncToGenerator(_regenerator().m(function _callee5b(cfg) {
    var base, auth, r, v, _t;
    return _regenerator().w(function (_ctx) {
      while (1) switch (_ctx.p = _ctx.n) {
        case 0:
          base = _fbBase(cfg);
          auth = _fbAuth(cfg);
          if (base) { _ctx.n = 1; break; }
          return _ctx.a(2, null);
        case 1:
          _ctx.p = 1;
          _ctx.n = 2;
          return fetch(base + "/meta/_v.json" + auth);
        case 2:
          r = _ctx.v;
          if (r.ok) { _ctx.n = 3; break; }
          
          
          if (r.status !== 404) console.warn("[fbPollV] HTTP " + r.status + " (not 404) — possible network/Firebase error");
          return _ctx.a(2, null);
        case 3:
          _ctx.n = 4;
          return r.json();
        case 4:
          v = _ctx.v;
          _fbTrack("db_dl", 13); 
          return _ctx.a(2, typeof v === "number" ? v : null);
        case 5:
          _ctx.p = 5;
          _t = _ctx.v;
          return _ctx.a(2, null);
      }
    }, _callee5b, null, [[1, 5]]);
  }));
  return _fbPollV.apply(this, arguments);
}





function fbInitialLoad(cfg, localData) {
  return fbPollV(cfg).then(function(rv) {
    var localV = (localData && typeof localData._v === "number") ? localData._v : 0;
    
    
    
    if (rv && localV > 0 && localV >= rv) {
      _fbLocalV = rv;
      try { console.log("[FB] initial load: skip full DL (localV=" + localV + " >= rv=" + rv + ")"); } catch(e){}
      return { status: "skip" };
    }
    
    return fbGet(cfg).then(function(fullData) {
      if (rv) _fbLocalV = rv;
      if (fullData === "EMPTY") {
        
        fbPut(cfg, localData)["catch"](function(e){ console.warn("fbPut(initial push) failed:", e); });
        return { status: "pushed" };
      }
      if (fullData) {
        
        if (!rv) fbPut(cfg, fullData)["catch"](function(e){ console.warn("fbPut(migration) failed:", e); });
        return { status: "ok", data: fullData };
      }
      return { status: "err" };
    });
  })["catch"](function(e) {
    console.warn("[FB] initial load error:", e);
    return { status: "err" };
  });
}




var _snIdb = null;
var _snIdbReady = false;
(function() {
  try {
    var req = indexedDB.open("sn_imgcache_v1", 1);
    req.onupgradeneeded = function(e) { e.target.result.createObjectStore("imgs"); };
    req.onsuccess = function(e) {
      _snIdb = e.target.result; _snIdbReady = true;
      
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(function(granted) {
          console.log("[IDB] Persistent storage:", granted ? "granted" : "not granted");
        });
      }
    };
    req.onerror = function() { console.warn("[IDB] open failed"); };
  } catch(e) { console.warn("[IDB] not available"); }
})();
function snIdbGet(key) {
  return new Promise(function(resolve) {
    if (!_snIdbReady) return resolve(null);
    try {
      var tx = _snIdb.transaction("imgs", "readonly");
      var req = tx.objectStore("imgs").get(key);
      req.onsuccess = function() { resolve(req.result || null); };
      req.onerror = function() { resolve(null); };
    } catch(e) { resolve(null); }
  });
}
function snIdbSet(key, val) {
  if (!_snIdbReady) return;
  try {
    var tx = _snIdb.transaction("imgs", "readwrite");
    tx.objectStore("imgs").put(val, key);
  } catch(e) {}
}
function snIdbDel(key) {
  if (!_snIdbReady) return;
  try {
    var tx = _snIdb.transaction("imgs", "readwrite");
    tx.objectStore("imgs")["delete"](key);
  } catch(e) {}
}


var _SN_CACHE_NAME = "sn-images-v1";
function snCacheGet(url) {
  if (!("caches" in window)) return Promise.resolve(null);
  return window.caches.open(_SN_CACHE_NAME).then(function(cache) {
    return cache.match(url);
  }).then(function(res) {
    if (!res || !res.ok) return null;
    return res.blob();
  })["catch"](function() { return null; });
}
function snCachePut(url, blob) {
  if (!("caches" in window)) return;
  try {
    window.caches.open(_SN_CACHE_NAME).then(function(cache) {
      cache.put(url, new Response(blob, { headers: { "Content-Type": blob.type || "image/png" } }));
    })["catch"](function() {});
  } catch(e) {}
}


function _stSaveImagesToIdb(data) {
  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) { obj.forEach(walk); return; }
    if (typeof obj.mt === "string") {
      if (obj.imageUrl && typeof obj.base64 === "string" && obj.base64.length > 100) {
        snIdbSet("img_" + obj.imageUrl, { base64: obj.base64, mt: obj.mt });
      }
      if (obj.origImageUrl && typeof obj.orig_base64 === "string" && obj.orig_base64.length > 100) {
        snIdbSet("img_" + obj.origImageUrl, { base64: obj.orig_base64, mt: obj.orig_mt || obj.mt });
      }
    }
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && typeof obj[k] === "object" && k !== "base64" && k !== "orig_base64") walk(obj[k]);
    }
  }
  walk(data);
}




function _evictNonActiveImages(data, activeDate) {
  var evicted = 0;
  function walk(obj, inActive) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) { for (var ai = 0; ai < obj.length; ai++) walk(obj[ai], inActive); return; }
    if (typeof obj.mt === "string" && !inActive) {
      if (obj.imageUrl && typeof obj.base64 === "string" && obj.base64.length > 100) { obj.base64 = null; evicted++; }
      if (obj.origImageUrl && typeof obj.orig_base64 === "string" && obj.orig_base64.length > 100) { obj.orig_base64 = null; evicted++; }
    }
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && typeof obj[k] === "object" && k !== "base64" && k !== "orig_base64") {
        var childActive = inActive || (!!activeDate && k.indexOf(activeDate) >= 0);
        walk(obj[k], childActive);
      }
    }
  }
  walk(data, false);
  return evicted;
}




var _fbStorageRef = null;
var _FB_STORAGE_BUCKET = "scalping-notebbok.firebasestorage.app";

function fbStorageInit(apiKey, bucket) {
  var b = bucket || _FB_STORAGE_BUCKET;
  if (!b || !apiKey || typeof firebase === "undefined") return;
  try {
    if (firebase.apps && firebase.apps.length) {
      _fbStorageRef = firebase.storage();
    } else {
      firebase.initializeApp({ apiKey: apiKey, storageBucket: b });
      _fbStorageRef = firebase.storage();
    }
  } catch(e) { console.warn("Storage init failed:", e); }
}


function base64ToBlob(b64, mime) {
  var bin = atob(b64);
  var arr = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}


function _uploadToStorage(path, b64, mime) {
  if (!_fbStorageRef) return Promise.resolve(null);
  var blob = base64ToBlob(b64, mime);
  _fbTrack("st_ul", blob.size);
  var ref = _fbStorageRef.ref(path);
  
  
  var metadata = { contentType: mime, cacheControl: "public, max-age=31536000" };
  return ref.put(blob, metadata).then(function() { return ref.getDownloadURL(); })
    ["catch"](function(e) { console.warn("Storage upload err:", e); return null; });
}


function urlToBase64(url) {
  return fetch(url)
    .then(function(r) { return r.blob(); })
    .then(function(blob) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result.split(",")[1]); };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
}


function imgSrc(img) {
  if (!img) return null;
  
  if (img.base64 && img.base64 !== "__ref__" && img.mt) return "data:" + img.mt + ";base64," + img.base64;
  
  if (img.imageUrl) return img.imageUrl;
  return null;
}


function origImgSrc(img) {
  if (!img) return null;
  if (img.orig_base64 && img.orig_base64 !== "__ref__") return "data:" + (img.orig_mt || img.mt) + ";base64," + img.orig_base64;
  if (img.origImageUrl) return img.origImageUrl;
  if (img.base64 && img.base64 !== "__ref__" && img.mt) return "data:" + img.mt + ";base64," + img.base64;
  if (img.imageUrl) return img.imageUrl;
  return null;
}




var _imgUploadStore = {};
var _imgUploadSubs = [];
function _imgUploadSet(id, status) {
  if (id == null) return;
  if (status === null) { delete _imgUploadStore[id]; }
  else { _imgUploadStore[id] = status; }
  for (var _ius = 0; _ius < _imgUploadSubs.length; _ius++) _imgUploadSubs[_ius]();
}
function _imgUploadSubscribe(fn) {
  _imgUploadSubs.push(fn);
  return function() { _imgUploadSubs = _imgUploadSubs.filter(function(f){ return f !== fn; }); };
}
function _imgUploadGet(id) {
  return (id != null && _imgUploadStore[id]) || null;
}



function _imgUploadAnyPending() {
  for (var _k in _imgUploadStore) {
    if (_imgUploadStore[_k] === "uploading") return true;
  }
  return false;
}






function CaThumbImg(_p_cti) {
  var url = _p_cti.url;
  var rest = {};
  for (var k in _p_cti) {
    if (Object.prototype.hasOwnProperty.call(_p_cti, k) && k !== "url") rest[k] = _p_cti[k];
  }
  var _useS_cti = useState(null), _useS_ctiA = _slicedToArray(_useS_cti, 2),
      cachedSrc = _useS_ctiA[0], setCachedSrc = _useS_ctiA[1];
  useEffect(function() {
    setCachedSrc(null);
    if (!url) return undefined;
    var cancelled = false;
    var idbKey = "img_" + url;
    snIdbGet(idbKey).then(function(cached) {
      if (cancelled) return;
      if (cached && cached.base64) {
        var mt = cached.mt || "image/png";
        setCachedSrc("data:" + mt + ";base64," + cached.base64);
        return;
      }
      
      fetch(url).then(function(r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      }).then(function(blob) {
        var mt2 = blob.type || "image/png";
        return new Promise(function(resolve, reject) {
          var reader = new FileReader();
          reader.onload = function() { resolve({ b64: reader.result.split(",")[1], mt: mt2 }); };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }).then(function(o) {
        if (cancelled) return;
        try { snIdbSet(idbKey, { base64: o.b64, mt: o.mt }); } catch(_){}
      }).catch(function(){});
    }).catch(function(){});
    return function() { cancelled = true; };
  }, [url]);
  return React.createElement("img", Object.assign({}, rest, { src: cachedSrc || url || "" }));
}




var _preloadRunning = false;



function preloadImages(dataRef, setData, stSaveFn, activeDate) {
  if (_preloadRunning) return;
  var targets = [];
  function walk(obj, inActive) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) { for (var ai = 0; ai < obj.length; ai++) walk(obj[ai], inActive); return; }
    var isImg = typeof obj.mt === "string" && (obj.imageUrl || obj.origImageUrl);
    if (isImg && inActive) {
      if (obj.imageUrl && (!obj.base64 || obj.base64 === "__ref__" || obj.base64 === null)) {
        targets.push({ obj: obj, key: "base64", url: obj.imageUrl, mt: obj.mt });
      }
      if (obj.origImageUrl && (!obj.orig_base64 || obj.orig_base64 === "__ref__" || obj.orig_base64 === null)) {
        targets.push({ obj: obj, key: "orig_base64", url: obj.origImageUrl, mt: obj.orig_mt || obj.mt });
      }
    }
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && typeof obj[k] === "object" && k !== "base64" && k !== "orig_base64") {
        var childActive = inActive || (!!activeDate && k.indexOf(activeDate) >= 0);
        walk(obj[k], childActive);
      }
    }
  }
  walk(dataRef.current, false);
  if (targets.length === 0) return;
  _preloadRunning = true;
  console.log("[preload] Downloading " + targets.length + " images from Storage...");
  var done = 0, failed = 0, total = targets.length;
  var queue = targets.slice();
  var dirty = false;
  function finish() {
    _preloadRunning = false;
    if (dirty) {
      
      
      
      console.log("[preload] Complete: " + done + " cached, " + failed + " failed");
      setData(Object.assign({}, dataRef.current));
      stSaveFn(dataRef.current);
    }
  }
  function next() {
    if (queue.length === 0) {
      if (done + failed >= total) finish();
      return;
    }
    var t = queue.shift();
    var idbKey = "img_" + t.url;
    
    function applyB64(b64) {
      var stillAlive = false;
      try { (function checkAlive(obj) {
        if (stillAlive || !obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) { obj.forEach(checkAlive); return; }
        if (obj === t.obj) { stillAlive = true; return; }
        for (var k in obj) { if (stillAlive) break; if (obj.hasOwnProperty(k) && typeof obj[k] === "object" && k !== "base64" && k !== "orig_base64") checkAlive(obj[k]); }
      })(dataRef.current); } catch(e) { stillAlive = true; }
      if (stillAlive) { t.obj[t.key] = b64; dirty = true; }
    }
    
    snIdbGet(idbKey).then(function(cached) {
      if (cached && cached.base64) {
        
        applyB64(cached.base64);
        done++; next();
        return;
      }
      
      snCacheGet(t.url).then(function(blob) {
        if (blob) {
          
          return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function() { resolve(reader.result.split(",")[1]); };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }).then(function(b64) {
            snIdbSet(idbKey, { base64: b64, mt: t.mt }); 
            applyB64(b64);
            done++; next();
          });
        }
        
        return fetch(t.url).then(function(r) {
          if (!r.ok) throw new Error(r.status);
          return r.blob();
        }).then(function(blob) {
          _fbTrack("st_dl", blob.size);
          snCachePut(t.url, blob); 
          return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function() { resolve(reader.result.split(",")[1]); };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }).then(function(b64) {
          applyB64(b64);
          snIdbSet(idbKey, { base64: b64, mt: t.mt });
          done++; next();
        });
      })["catch"](function() {
        failed++; next();
      });
    });
  }
  for (var i = 0; i < Math.min(6, queue.length); i++) next();
}







function _collectAndUploadHtmlDataUrls(data, uploadsArr) {
  var seen = {};
  var map = {};
  function walkCollect(obj) {
    if (obj === null || obj === undefined) return;
    if (Array.isArray(obj)) { for (var i = 0; i < obj.length; i++) walkCollect(obj[i]); return; }
    if (typeof obj === "object") {
      for (var k in obj) { if (obj.hasOwnProperty(k)) walkCollect(obj[k]); }
      return;
    }
    if (typeof obj !== "string") return;
    if (obj.indexOf("data:image/") < 0 || obj.indexOf("<img") < 0) return;
    var tmp;
    try {
      tmp = document.createElement("div");
      tmp.innerHTML = obj;
    } catch(e) { return; }
    var imgs = tmp.querySelectorAll("img");
    for (var ii = 0; ii < imgs.length; ii++) {
      var src = imgs[ii].getAttribute("src") || "";
      if (src.indexOf("data:image/") !== 0) continue;
      if (seen[src]) continue;
      seen[src] = true;
      var commaIdx = src.indexOf(",");
      if (commaIdx < 0) continue;
      var headerMatch = src.substring(0, commaIdx).match(/^data:([^;]+)/);
      if (!headerMatch) continue;
      var mt = headerMatch[1];
      var b64 = src.substring(commaIdx + 1);
      if (!b64 || b64.length < 100) continue;
      (function(srcKey, mt2, b642) {
        
        
        
        var pid = "html_" + _fbHashStr(b642);
        var ext = mt2 === "image/png" ? ".png" : (mt2 === "image/gif" ? ".gif" : ".jpg");
        uploadsArr.push(
          _uploadToStorage("notebook-images/" + pid + ext, b642, mt2)
            .then(function(url) {
              if (url) {
                map[srcKey] = url;
                
                
                try { snIdbSet("img_" + url, b642); } catch(e) {}
              } else {
                console.warn("[Storage] HTML data URL upload returned null, will retry on next save");
              }
            })
        );
      })(src, mt, b64);
    }
  }
  walkCollect(data);
  return map;
}





function _replaceHtmlDataUrls(html, map) {
  if (typeof html !== "string") return html;
  if (html.indexOf("data:image/") < 0 || html.indexOf("<img") < 0) return html;
  var tmp;
  try {
    tmp = document.createElement("div");
    tmp.innerHTML = html;
  } catch(e) { return html; }
  var imgs = tmp.querySelectorAll("img");
  var changed = false;
  for (var i = 0; i < imgs.length; i++) {
    var src = imgs[i].getAttribute("src") || "";
    if (src.indexOf("data:image/") !== 0) continue;
    if (map[src]) {
      imgs[i].setAttribute("src", map[src]);
      changed = true;
    }
  }
  return changed ? tmp.innerHTML : html;
}




function _applyHtmlUrlMapToData(obj, map) {
  if (!map || Object.keys(map).length === 0) return obj;
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    var _changed = false;
    var _arr = obj.map(function(item) {
      var r = _applyHtmlUrlMapToData(item, map);
      if (r !== item) _changed = true;
      return r;
    });
    return _changed ? _arr : obj;
  }
  if (typeof obj === "object") {
    var _chg = false;
    var _out = {};
    for (var _k in obj) {
      if (!obj.hasOwnProperty(_k)) continue;
      var _v = obj[_k];
      var _rv = typeof _v === "string" ? _replaceHtmlDataUrls(_v, map) : _applyHtmlUrlMapToData(_v, map);
      _out[_k] = _rv;
      if (_rv !== _v) _chg = true;
    }
    return _chg ? _out : obj;
  }
  if (typeof obj === "string") return _replaceHtmlDataUrls(obj, map);
  return obj;
}


function _uploadAllImages(data) {
  
  if (!_fbStorageRef) {
    var _strip64 = function(obj) {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) return obj.map(_strip64);
      if (typeof obj === "object") {
        var o = {};
        for (var k in obj) {
          if (!obj.hasOwnProperty(k)) continue;
          if (k === "base64" || k === "orig_base64") { o[k] = "__ref__"; continue; }
          o[k] = _strip64(obj[k]);
        }
        return o;
      }
      return obj;
    };
    var r = _strip64(data);
    
    r._v = (data && typeof data._v === "number") ? data._v : Date.now();
    return Promise.resolve(r);
  }
  var uploads = [];
  
  
  var htmlUrlMap = _collectAndUploadHtmlDataUrls(data, uploads);
  
  function walk(obj, path) {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(function(item, i) { return walk(item, path + "_" + i); });
    if (typeof obj !== "object") return obj;
    var out = {};
    var isImage = (typeof obj.base64 === "string" && obj.base64.length > 100 && typeof obj.mt === "string");
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) continue;
      if (isImage && k === "base64") {
        
        if (obj.imageUrl) { out[k] = "__ref__"; continue; }
        
        
        var _b64 = obj.base64, _mt = obj.mt;
        var _hashInput = _b64.length + "_" + _b64.substring(0, 2000) + _b64.substring(Math.floor(_b64.length / 2), Math.floor(_b64.length / 2) + 2000) + _b64.substring(_b64.length - 1000);
        var _id = "img_" + _fbHashStr(_hashInput);
        (function(target, id, b64, mt) {
          uploads.push(
            _uploadToStorage("notebook-images/" + id + (mt === "image/png" ? ".png" : ".jpg"), b64, mt)
              .then(function(url) {
                if (url) { target.imageUrl = url; }
                else { console.warn("[Storage] Upload returned null for " + id + ", will retry on next save"); }
              })
          );
        })(out, _id, _b64, _mt);
        out[k] = "__ref__";
        continue;
      }
      if (isImage && k === "orig_base64" && typeof obj.orig_base64 === "string" && obj.orig_base64.length > 100) {
        if (obj.origImageUrl) { out[k] = "__ref__"; continue; }
        
        var _ob64 = obj.orig_base64, _omt = obj.orig_mt || obj.mt || "image/png";
        var _oid = "orig_" + _fbHashStr(_ob64.length + "_" + _ob64.substring(0, 2000) + _ob64.substring(_ob64.length - 1000));
        (function(target, id, b64, mt) {
          uploads.push(
            _uploadToStorage("notebook-images/" + id + (mt === "image/png" ? ".png" : ".jpg"), b64, mt)
              .then(function(url) {
                if (url) { target.origImageUrl = url; }
                else { console.warn("[Storage] Upload returned null for " + id + ", will retry on next save"); }
              })
          );
        })(out, _oid, _ob64, _omt);
        out[k] = "__ref__";
        continue;
      }
      out[k] = walk(obj[k], path + "_" + k);
    }
    
    if (obj.imageUrl && !out.imageUrl) out.imageUrl = obj.imageUrl;
    if (obj.origImageUrl && !out.origImageUrl) out.origImageUrl = obj.origImageUrl;
    return out;
  }
  var prepared = walk(data, "d");
  return Promise.all(uploads).then(function() {
    
    
    
    function replaceHtmlWalk(obj) {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) obj[i] = replaceHtmlWalk(obj[i]);
        return obj;
      }
      if (typeof obj === "object") {
        for (var k in obj) {
          if (obj.hasOwnProperty(k)) obj[k] = replaceHtmlWalk(obj[k]);
        }
        return obj;
      }
      if (typeof obj === "string") return _replaceHtmlDataUrls(obj, htmlUrlMap);
      return obj;
    }
    replaceHtmlWalk(prepared);
    
    
    prepared._v = (data && typeof data._v === "number") ? data._v : Date.now();
    
    
    
    if (Object.keys(htmlUrlMap).length > 0 && typeof window._snHtmlUploadCb === "function") {
      var _cb = window._snHtmlUploadCb;
      window._snHtmlUploadCb = null;
      _cb(htmlUrlMap);
    }
    return prepared;
  });
}

function analyzeChart(_x5, _x6, _x7) {
  return _analyzeChart.apply(this, arguments);
}
function _analyzeChart() {
  _analyzeChart = _asyncToGenerator(_regenerator().m(function _callee7(cfg, base64, mt) {
    var p, r, d, txt, _t3;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          if (!(!cfg || !cfg.claudeKey)) {
            _context7.n = 1;
            break;
          }
          return _context7.a(2, null);
        case 1:
          _context7.p = 1;
          p = "このチャートを分析し、以下のJSONのみ返答（説明文なし）:\n値動き（複数可）: 上昇トレンド,高値維持上昇,V字回復,高値圏ヨコヨコ,レンジ,安値圏ヨコヨコ,下落トレンド,寄り天崩れ,大引け前下落\n個別地合い（1つ）: 激強,強,やや強,普通,やや弱,弱,激弱\n{\"moveTags\":[],\"macroLocal\":\"普通\",\"memo\":\"\"}";
          _context7.n = 2;
          return fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": cfg.claudeKey,
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
              model: "claude-opus-4-5",
              max_tokens: 400,
              messages: [{
                role: "user",
                content: [{
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mt,
                    data: base64
                  }
                }, {
                  type: "text",
                  text: p
                }]
              }]
            })
          });
        case 2:
          r = _context7.v;
          _context7.n = 3;
          return r.json();
        case 3:
          d = _context7.v;
          txt = (d.content || []).filter(function (c) {
            return c.type === "text";
          }).map(function (c) {
            return c.text;
          }).join("").trim();
          return _context7.a(2, JSON.parse(txt.replace(/```json|```/g, "").trim()));
        case 4:
          _context7.p = 4;
          _t3 = _context7.v;
          return _context7.a(2, null);
      }
    }, _callee7, null, [[1, 4]]);
  }));
  return _analyzeChart.apply(this, arguments);
}
var ANNOT_PRESET_KEY = 'scalping_annot_presets_v1';
var DEF_PRESETS = ["#000000", "#555555", "#888888", "#bbbbbb", "#ffffff", "#ce93d8", "#b71c1c", "#f44336", "#ef5350", "#e91e63", "#f48fb1", "#ff6d00", "#2196f3", "#0d47a1", "#1b5e20", "#76ff03", "#ffeb3b", "#f57f17", "#1a237e", "#37474f", "#558b2f"];
var _clipStroke = null;


function ColorPicker(_ref) {
  var value = _ref.value,
    onChange = _ref.onChange,
    history = _ref.history,
    onHistory = _ref.onHistory,
    quickColors = _ref.quickColors,
    onQuickColors = _ref.onQuickColors,
    compact = _ref.compact;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1],
    _useState3 = useState("preset"),
    _useState4 = _slicedToArray(_useState3, 2),
    tab = _useState4[0],
    setTab = _useState4[1],
    _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    editMode = _useState6[0],
    setEditMode = _useState6[1];
  var _useState7 = useState(value),
    _useState8 = _slicedToArray(_useState7, 2),
    customVal = _useState8[0],
    setCustomVal = _useState8[1],
    _useState9 = useState(null),
    _useState0 = _slicedToArray(_useState9, 2),
    editingSlot = _useState0[0],
    setEditingSlot = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    dragIdx = _useState10[0],
    setDragIdx = _useState10[1],
    _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    dragOverIdx = _useState12[0],
    setDragOverIdx = _useState12[1];
  var _useState13 = useState(function () {
      try {
        var s = localStorage.getItem(ANNOT_PRESET_KEY);
        return s ? JSON.parse(s) : DEF_PRESETS;
      } catch (_unused6) {
        return DEF_PRESETS;
      }
    }),
    _useState14 = _slicedToArray(_useState13, 2),
    presets = _useState14[0],
    setPresets = _useState14[1];
  var savePresets = function savePresets(p) {
    setPresets(p);
    try {
      localStorage.setItem(ANNOT_PRESET_KEY, JSON.stringify(p));
    } catch (_unused7) {}
  };
  var closeAll = function closeAll() {
    setOpen(false);
    setEditMode(false);
    setEditingSlot(null);
    setDragIdx(null);
    setDragOverIdx(null);
  };
  var pick = function pick(c) {
    onChange(c);
    onHistory(c);
    if (editingSlot !== null) {
      var nq = _toConsumableArray(quickColors);
      nq[editingSlot] = c;
      onQuickColors(nq);
    } else if (!quickColors.includes(c)) onQuickColors([c].concat(_toConsumableArray(quickColors)).slice(0, 6));
    closeAll();
  };
  var addCustom = function addCustom() {
    if (!presets.includes(customVal)) savePresets([].concat(_toConsumableArray(presets), [customVal]));
    onChange(customVal);
    onHistory(customVal);
    if (!quickColors.includes(customVal)) onQuickColors([customVal].concat(_toConsumableArray(quickColors)).slice(0, 6));
    setTab("preset");
  };
  var remPreset = function remPreset(c) {
    return savePresets(presets.filter(function (x) {
      return x !== c;
    }));
  };
  var reorder = function reorder(f, t) {
    if (f === t) return;
    var np = _toConsumableArray(presets);
    var _np$splice = np.splice(f, 1),
      _np$splice2 = _slicedToArray(_np$splice, 1),
      r = _np$splice2[0];
    np.splice(t, 0, r);
    savePresets(np);
  };
  var onQClick = function onQClick(c, i) {
    if (value === c && quickColors[i] === c) {
      setEditingSlot(i);
      setCustomVal(c);
      setTab("preset");
      setOpen(true);
    } else {
      onChange(c);
      onHistory(c);
    }
  };
  var DS = compact ? (IS_TOUCH ? 30 : 26) : (IS_TOUCH ? 46 : 40),
    QSZ = compact ? 18 : (IS_TOUCH ? 30 : 26);
  var LIGHT = ["#ffffff", "#ffeb3b", "#f48fb1", "#bbbbbb", "#76ff03", "#ce93d8"];
  var PDot = function PDot(_ref2) {
    var c = _ref2.c,
      i = _ref2.i;
    var sel = c === value,
      isd = dragIdx === i,
      iso = dragOverIdx === i && dragIdx !== null && dragIdx !== i;
    return React.createElement("span", {
      style: {
        position: "relative",
        flexShrink: 0
      }
    }, React.createElement("span", {
      draggable: editMode,
      onDragStart: function onDragStart(e) {
        e.dataTransfer.setData("t", "");
        setDragIdx(i);
      },
      onDragOver: function onDragOver(e) {
        e.preventDefault();
        if (dragIdx !== null && dragIdx !== i) setDragOverIdx(i);
      },
      onDrop: function onDrop(e) {
        e.preventDefault();
        if (dragIdx !== null) reorder(dragIdx, i);
        setDragIdx(null);
        setDragOverIdx(null);
      },
      onDragEnd: function onDragEnd() {
        setDragIdx(null);
        setDragOverIdx(null);
      },
      onClick: function onClick() {
        return !editMode && pick(c);
      },
      style: {
        width: DS,
        height: DS,
        borderRadius: "50%",
        background: c,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: editMode ? "grab" : "pointer",
        boxSizing: "border-box",
        opacity: isd ? 0.3 : 1,
        border: iso ? "3.5px dashed #007AFF" : sel && !editMode ? "3.5px solid #007AFF" : "1.5px solid rgba(0,0,0,.14)"
      }
    }, sel && !editMode && React.createElement("span", {
      style: {
        fontSize: 20,
        color: LIGHT.includes(c) ? "#000" : "#fff",
        fontWeight: 700,
        lineHeight: 1
      }
    }, "\u2713"), editMode && React.createElement("span", {
      style: {
        fontSize: 16,
        color: "rgba(255,255,255,.5)",
        userSelect: "none",
        pointerEvents: "none"
      }
    }, "\u283F")), sel && !editMode && React.createElement("span", {
      onClick: function onClick(e) {
        e.stopPropagation();
        remPreset(c);
      },
      style: {
        position: "absolute",
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#ff3b30",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "2px solid #fff",
        zIndex: 2,
        lineHeight: 1
      }
    }, "\u2715"), editMode && React.createElement("span", {
      onClick: function onClick(e) {
        e.stopPropagation();
        remPreset(c);
      },
      style: {
        position: "absolute",
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#ff3b30",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "2px solid #fff",
        zIndex: 2,
        lineHeight: 1
      }
    }, "\u2715"));
  };
  var GRID = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center"
  };
  return React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "center"
    }
  }, quickColors.map(function (c, i) {
    var isA = value === c;
    return React.createElement("span", {
      key: i,
      onClick: function onClick() {
        return onQClick(c, i);
      },
      style: {
        width: QSZ,
        height: QSZ,
        borderRadius: "50%",
        background: c,
        cursor: "pointer",
        flexShrink: 0,
        boxShadow: isA
          ? (compact ? "0 0 0 1.5px #111,0 0 0 3px #fff,0 0 0 4.5px #6366F1" : "0 0 0 2px #111,0 0 0 4px #fff,0 0 0 5.5px #6366F1")
          : (compact ? "none" : "0 1px 3px rgba(0,0,0,.4)"),
        border: compact ? "1px solid rgba(0,0,0,.25)" : "2px solid rgba(255,255,255,.5)",
        transform: isA ? (compact ? "scale(1.15)" : "scale(1.2)") : "scale(1)",
        transition: "transform .1s",
        position: "relative"
      }
    });
  })), open && ReactDOM.createPortal(React.createElement("div", {
    onClick: closeAll,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.45)",
      zIndex: 11000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    style: {
      background: "#f2f2f7",
      borderRadius: 20,
      padding: "20px 20px 24px",
      width: "100%",
      maxWidth: 400,
      boxShadow: "0 24px 64px rgba(0,0,0,.5)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18
    }
  }, tab === "preset" ? React.createElement("button", {
    onClick: function onClick() {
      return setEditMode(function (m) {
        return !m;
      });
    },
    style: {
      fontSize: 14,
      color: "#007AFF",
      fontWeight: 600,
      background: "none",
      border: "none",
      cursor: "pointer"
    }
  }, editMode ? "完了" : "編集") : React.createElement("span", null), React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: "#000"
    }
  }, editingSlot !== null ? "\u30B9\u30ED\u30C3\u30C8".concat(editingSlot + 1, "\u306E\u8272\u3092\u5909\u66F4") : "カラーを変更"), React.createElement("button", {
    onClick: closeAll,
    style: {
      fontSize: 14,
      color: "#007AFF",
      fontWeight: 600,
      background: "none",
      border: "none",
      cursor: "pointer"
    }
  }, "\u9589\u3058\u308B")), editingSlot !== null && React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 16,
      alignItems: "center",
      marginBottom: 12,
      background: "rgba(0,0,0,.06)",
      borderRadius: 12,
      padding: "10px 16px"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#666"
    }
  }, "\u73FE\u5728"), React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: quickColors[editingSlot],
      border: "2px solid rgba(0,0,0,.12)",
      display: "block"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 18,
      color: "#999"
    }
  }, "\u2192"), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#666"
    }
  }, "\u65B0\u3057\u3044\u8272\u3092\u30BF\u30C3\u30D7\u3067\u9078\u629E")), React.createElement("div", {
    style: {
      display: "flex",
      background: "rgba(0,0,0,.08)",
      borderRadius: 11,
      padding: 2,
      marginBottom: 20
    }
  }, [["preset", "プリセット"], ["custom", "カスタム"], ["history", "履歴"]].map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      t = _ref4[0],
      l = _ref4[1];
    return React.createElement("button", {
      key: t,
      onClick: function onClick() {
        setTab(t);
        setEditMode(false);
      },
      style: {
        flex: 1,
        padding: "7px 0",
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        borderRadius: 9,
        cursor: "pointer",
        background: tab === t ? "#fff" : "transparent",
        color: tab === t ? "#000" : "#666",
        boxShadow: tab === t ? "0 1px 5px rgba(0,0,0,.2)" : "none"
      }
    }, l);
  })), tab === "preset" && React.createElement("div", {
    style: GRID
  }, presets.map(function (c, i) {
    return React.createElement(PDot, {
      key: i,
      c: c,
      i: i
    });
  }), React.createElement("span", {
    onClick: function onClick() {
      setTab("custom");
      setEditMode(false);
    },
    style: {
      width: DS,
      height: DS,
      borderRadius: "50%",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: "1.5px dashed #aaa",
      flexShrink: 0
    }
  }, React.createElement("span", {
    style: {
      fontSize: 24,
      color: "#aaa",
      lineHeight: 1,
      fontWeight: 300
    }
  }, "\uFF0B"))), tab === "custom" && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 12,
      background: customVal,
      display: "block",
      border: "1px solid rgba(0,0,0,.12)"
    }
  }), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#999",
      marginBottom: 4
    }
  }, "\u73FE\u5728\u306E\u8272"), React.createElement("div", {
    style: {
      fontSize: 13,
      fontFamily: "monospace",
      color: "#333"
    }
  }, customVal.toUpperCase()))), React.createElement("label", {
    style: {
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("input", {
    type: "color",
    value: customVal,
    onChange: function onChange(e) {
      return setCustomVal(e.target.value);
    },
    style: {
      width: 220,
      height: IS_TOUCH ? 80 : 60,
      cursor: "pointer",
      border: "none",
      borderRadius: 8
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#666"
    }
  }, "\u30BF\u30C3\u30D7\u3057\u3066\u8272\u3092\u9078\u629E")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, React.createElement("button", {
    onClick: addCustom,
    style: {
      padding: "10px 20px",
      background: "#34C759",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer"
    }
  }, "\u3053\u306E\u8272\u3092\u8FFD\u52A0"), React.createElement("button", {
    onClick: function onClick() {
      return pick(customVal);
    },
    style: {
      padding: "10px 20px",
      background: "#007AFF",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer"
    }
  }, "\u3053\u306E\u8272\u3092\u4F7F\u7528"))), tab === "history" && (history.length > 0 ? React.createElement("div", {
    style: GRID
  }, history.map(function (c, i) {
    return React.createElement("span", {
      key: i,
      onClick: function onClick() {
        return pick(c);
      },
      style: {
        width: DS,
        height: DS,
        borderRadius: "50%",
        background: c,
        cursor: "pointer",
        border: c === value ? "3.5px solid #007AFF" : "1.5px solid rgba(0,0,0,.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        flexShrink: 0
      }
    }, c === value && React.createElement("span", {
      style: {
        fontSize: 20,
        color: LIGHT.includes(c) ? "#000" : "#fff",
        fontWeight: 700
      }
    }, "\u2713"));
  })) : React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "32px 0",
      color: "#aaa",
      fontSize: 14
    }
  }, "\u5C65\u6B74\u306A\u3057")))), document.body));
}


function TextEditor(_ref5) {
  var stroke = _ref5.stroke,
    onUpdate = _ref5.onUpdate,
    onDelete = _ref5.onDelete,
    onClose = _ref5.onClose;
  var _useState15 = useState(stroke.text || ""),
    _useState16 = _slicedToArray(_useState15, 2),
    txt = _useState16[0],
    setTxt = _useState16[1];
  var _useState17 = useState(stroke.fontSize || 24),
    _useState18 = _slicedToArray(_useState17, 2),
    sz = _useState18[0],
    setSz = _useState18[1];
  var _useState19 = useState(String(stroke.fontSize || 24)),
    _useState20 = _slicedToArray(_useState19, 2),
    szStr = _useState20[0],
    setSzStr = _useState20[1];
  var _useState21 = useState(stroke.fontBold || false),
    _useState22 = _slicedToArray(_useState21, 2),
    bold = _useState22[0],
    setBold = _useState22[1];
  var _useState23 = useState(stroke.color || "#000000"),
    _useState24 = _slicedToArray(_useState23, 2),
    col = _useState24[0],
    setCol = _useState24[1];
  var confirm = function confirm() {
    onUpdate(_objectSpread(_objectSpread({}, stroke), {}, {
      text: txt,
      fontSize: sz,
      fontBold: bold,
      color: col
    }));
    onClose();
  };
  var COLS = ["#000000", "#E53935", "#2196f3", "#2E7D32", "#ff6d00", "#ffffff", "#f9a825", "#e91e63"];
  var BS = {
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  };
  return ReactDOM.createPortal(React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.55)",
      zIndex: 11500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }
  }, React.createElement("div", {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    style: {
      background: "#1a1a1a",
      borderRadius: 16,
      padding: 20,
      width: "100%",
      maxWidth: 420,
      boxShadow: "0 20px 60px rgba(0,0,0,.7)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 14,
      textAlign: "center"
    }
  }, "\u30C6\u30AD\u30B9\u30C8\u3092\u7DE8\u96C6"), React.createElement("textarea", {
    value: txt,
    onChange: function onChange(e) {
      return setTxt(e.target.value);
    },
    rows: 3,
    style: {
      width: "100%",
      background: "#2a2a2a",
      color: "#fff",
      border: "1px solid #444",
      borderRadius: 8,
      fontSize: 14,
      padding: "8px 10px",
      resize: "vertical",
      outline: "none",
      fontWeight: bold ? "700" : "400",
      boxSizing: "border-box"
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginTop: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#888"
    }
  }, "\u30B5\u30A4\u30BA"), React.createElement("button", {
    onClick: function onClick() {
      var v = Math.max(1, sz - 1);
      setSz(v);
      setSzStr(String(v));
    },
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: "#333",
      color: "#fff",
      padding: "5px 10px"
    })
  }, "\uFF0D"), React.createElement("input", {
    value: szStr,
    onChange: function onChange(e) {
      setSzStr(e.target.value);
      var n = parseInt(e.target.value);
      if (!isNaN(n) && n >= 1 && n <= 200) setSz(n);
    },
    onBlur: function onBlur() {
      var n = parseInt(szStr);
      var v = isNaN(n) ? sz : Math.min(200, Math.max(1, n));
      setSz(v);
      setSzStr(String(v));
    },
    style: {
      width: 50,
      textAlign: "center",
      background: "#222",
      border: "1px solid #444",
      color: "#fff",
      borderRadius: 5,
      fontSize: 13,
      padding: "3px 5px"
    }
  }), React.createElement("button", {
    onClick: function onClick() {
      var v = Math.min(200, sz + 1);
      setSz(v);
      setSzStr(String(v));
    },
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: "#333",
      color: "#fff",
      padding: "5px 10px"
    })
  }, "\uFF0B"), React.createElement("button", {
    onClick: function onClick() {
      return setBold(function (b) {
        return !b;
      });
    },
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: bold ? "#6366F1" : "#333",
      color: "#fff",
      fontWeight: 700
    })
  }, "\u592A\u5B57"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginLeft: "auto"
    }
  }, COLS.map(function (c) {
    return React.createElement("span", {
      key: c,
      onClick: function onClick() {
        return setCol(c);
      },
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: c,
        cursor: "pointer",
        border: col === c ? "3px solid #6366F1" : "1.5px solid rgba(255,255,255,.25)",
        flexShrink: 0
      }
    });
  }), React.createElement("label", {
    style: {
      cursor: "pointer",
      position: "relative",
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)",
      border: "1.5px solid rgba(255,255,255,.3)",
      display: "block"
    }
  }, React.createElement("input", {
    type: "color",
    value: col,
    onChange: function onChange(e) {
      return setCol(e.target.value);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  })))), React.createElement("div", {
    style: {
      marginTop: 10,
      padding: "8px 12px",
      background: "#2a2a2a",
      borderRadius: 8,
      fontSize: Math.min(sz, 28),
      fontWeight: bold ? "700" : "400",
      color: col,
      fontFamily: "-apple-system,sans-serif",
      minHeight: 40,
      wordBreak: "break-all"
    }
  }, txt || React.createElement("span", {
    style: {
      color: "#555"
    }
  }, "\uFF08\u30D7\u30EC\u30D3\u30E5\u30FC\uFF09")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 14,
      flexWrap: "wrap"
    }
  }, React.createElement("button", {
    onClick: function onClick() {
      _clipStroke = _objectSpread({}, stroke);
      onDelete();
      onClose();
    },
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: "#c0392b",
      color: "#fff"
    })
  }, "\u30AB\u30C3\u30C8"), React.createElement("button", {
    onClick: function onClick() {
      _clipStroke = _objectSpread({}, stroke);
      onClose();
    },
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: "#333",
      color: "#fff"
    })
  }, "\u30B3\u30D4\u30FC"), React.createElement("button", {
    onClick: function onClick() {
      try {
        navigator.clipboard.writeText(txt);
      } catch (_unused8) {}
      ;
      onClose();
    },
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: "#333",
      color: "#fff"
    })
  }, "\u30C6\u30AD\u30B9\u30C8\u3092\u30B3\u30D4\u30FC"), React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 6
    }
  }, React.createElement("button", {
    onClick: onClose,
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: "#333",
      color: "#ccc"
    })
  }, "\u30AD\u30E3\u30F3\u30BB\u30EB"), React.createElement("button", {
    onClick: confirm,
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: "#6366F1",
      color: "#fff"
    })
  }, "\u78BA\u5B9A"))))), document.body);
}


function ZoomLightbox(_ref6) {
  var src = _ref6.src,
    onClose = _ref6.onClose,
    annotProps = _ref6.annotProps,
    onPrev = _ref6.onPrev,
    onNext = _ref6.onNext,
    navLabel = _ref6.navLabel,
    onPrevItem = _ref6.onPrevItem,
    onNextItem = _ref6.onNextItem;
  var _useState25 = useState(1),
    _useState26 = _slicedToArray(_useState25, 2),
    zoom = _useState26[0],
    setZoom = _useState26[1],
    _useState27 = useState({
      x: 0,
      y: 0
    }),
    _useState28 = _slicedToArray(_useState27, 2),
    pan = _useState28[0],
    setPan = _useState28[1],
    _useState29 = useState(false),
    _useState30 = _slicedToArray(_useState29, 2),
    annotOpen = _useState30[0],
    setAnnotOpen = _useState30[1];
  var drag = useRef({
      on: false,
      sx: 0,
      sy: 0,
      px: 0,
      py: 0
    }),
    pinch = useRef(null);
  useEffect(function () {
    var handler = function(e) {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(function(z) { return Math.min(Math.max(z * factor, 0.1), 7); });
    };
    document.addEventListener("wheel", handler, {passive: false});
    return function() { document.removeEventListener("wheel", handler); };
  }, []);
  useEffect(function () {
    var h = function h(e) {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return function () {
      return window.removeEventListener("keydown", h);
    };
  }, []);
  useEffect(function () {
    var preventPinch = function preventPinch(e) {
      if (e.touches && e.touches.length >= 2) e.preventDefault();
    };
    document.addEventListener("touchmove", preventPinch, { passive: false });
    return function () {
      document.removeEventListener("touchmove", preventPinch);
    };
  }, []);
  
  
  
  useEffect(function() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [src]);
  var cZ = function cZ(z) {
    return Math.min(Math.max(z, 0.1), 20);
  };
  var onWheel = function onWheel(e) {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    setPan(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, {
        y: p.y - e.deltaY * 0.8
      });
    });
  };
  var onMD = function onMD(e) {
    if (e.button !== 0) return;
    drag.current = {
      on: true,
      sx: e.clientX,
      sy: e.clientY,
      px: pan.x,
      py: pan.y
    };
  };
  var onMM = function onMM(e) {
    if (!drag.current.on) return;
    setPan({
      x: drag.current.px + (e.clientX - drag.current.sx),
      y: drag.current.py + (e.clientY - drag.current.sy)
    });
  };
  var onMU = function onMU() {
    drag.current.on = false;
  };
  var onTS = function onTS(e) {
    e.preventDefault();
    if (e.touches.length === 2) {
      
      var dx = e.touches[0].clientX - e.touches[1].clientX,
        dy = e.touches[0].clientY - e.touches[1].clientY;
      pinch.current = {
        d: Math.hypot(dx, dy),
        z: zoom,
        px: pan.x,
        py: pan.y,
        mx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        my: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      drag.current.on = false;
    } else if (e.touches.length === 1) {
      
      pinch.current = null;
      drag.current = {
        on: true,
        sx: e.touches[0].clientX,
        sy: e.touches[0].clientY,
        px: pan.x,
        py: pan.y
      };
    }
  };
  var onTM = function onTM(e) {
    e.preventDefault();
    if (e.touches.length === 2 && pinch.current) {
      
      var dx = e.touches[0].clientX - e.touches[1].clientX,
        dy = e.touches[0].clientY - e.touches[1].clientY;
      var d = Math.hypot(dx, dy),
        mx = (e.touches[0].clientX + e.touches[1].clientX) / 2,
        my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setZoom(cZ(pinch.current.z * (d / pinch.current.d)));
      setPan({
        x: pinch.current.px + (mx - pinch.current.mx),
        y: pinch.current.py + (my - pinch.current.my)
      });
      pinch.current = {
        d: d,
        z: zoom,
        px: pan.x,
        py: pan.y,
        mx: mx,
        my: my
      };
    } else if (e.touches.length === 1 && drag.current.on) {
      
      setPan({
        x: drag.current.px + (e.touches[0].clientX - drag.current.sx),
        y: drag.current.py + (e.touches[0].clientY - drag.current.sy)
      });
    }
  };
  var onTE = function onTE() {
    pinch.current = null;
    drag.current.on = false;
  };
  var BS = {
    padding: "5px 10px",
    fontSize: 11,
    background: "rgba(255,255,255,.18)",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer"
  };
  return React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.93)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      userSelect: "none",
      touchAction: "none"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 12px",
      flexShrink: 0,
      background: "rgba(0,0,0,.3)",
      touchAction: "none"
    },
    onTouchStart: function(e) { e.stopPropagation(); },
    onTouchMove: function(e) { e.preventDefault(); e.stopPropagation(); },
    onTouchEnd: function(e) { e.stopPropagation(); }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      alignItems: "center"
    }
  }, React.createElement("button", {
    style: BS,
    onClick: function onClick() {
      return setZoom(function (z) {
        return cZ(z / 1.3);
      });
    }
  }, "\uFF0D"), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,.5)",
      minWidth: 36,
      textAlign: "center"
    }
  }, Math.round(zoom * 100), "%"), React.createElement("button", {
    style: BS,
    onClick: function onClick() {
      return setZoom(function (z) {
        return cZ(z * 1.3);
      });
    }
  }, "\uFF0B"), React.createElement("input", {
    type: "range",
    min: 10,
    max: 700,
    step: 1,
    value: Math.min(Math.round(zoom * 100), 700),
    onChange: function onChange(e) {
      return setZoom(Number(e.target.value) / 100);
    },
    style: {
      width: IS_TOUCH ? 90 : 200,
      accentColor: "#6366F1",
      cursor: "pointer"
    }
  }), React.createElement("button", {
    style: _objectSpread(_objectSpread({}, BS), {}, {
      fontSize: 10
    }),
    onClick: function onClick() {
      setZoom(1);
      setPan({
        x: 0,
        y: 0
      });
    }
  }, "fit")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, annotProps && React.createElement("button", {
    style: _objectSpread(_objectSpread({}, BS), {}, {
      background: annotOpen ? "rgba(99,102,241,.8)" : "rgba(255,255,255,.18)",
      fontWeight: 700
    }),
    onClick: function onClick() {
      return setAnnotOpen(function (o) {
        return !o;
      });
    }
  }, annotOpen ? "✎️ 閉じる" : "✎️ 書き込みを開く"), (onPrev || onNext) && React.createElement("div", {
    style: {
      display: "flex",
      gap: 3,
      alignItems: "center"
    }
  }, React.createElement("button", {
    style: _objectSpread(_objectSpread({}, BS), {}, {
      fontSize: 16,
      padding: "3px 10px",
      opacity: onPrev ? 1 : .3
    }),
    onClick: onPrev ? function() { setZoom(1); setPan({x:0,y:0}); onPrev(); } : undefined,
    disabled: !onPrev
  }, "\u2191"), navLabel && React.createElement("span", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,.45)",
      minWidth: 36,
      textAlign: "center"
    }
  }, navLabel), React.createElement("button", {
    style: _objectSpread(_objectSpread({}, BS), {}, {
      fontSize: 16,
      padding: "3px 10px",
      opacity: onNext ? 1 : .3
    }),
    onClick: onNext ? function() { setZoom(1); setPan({x:0,y:0}); onNext(); } : undefined,
    disabled: !onNext
  }, "\u2193")), React.createElement("button", {
    style: _objectSpread(_objectSpread({}, BS), {}, {
      fontSize: 15,
      padding: "4px 12px"
    }),
    onClick: onClose
  }, "\u2715"))), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      cursor: "grab",
      position: "relative",
      touchAction: "none"
    },
    onWheel: onWheel,
    onMouseDown: onMD,
    onMouseMove: onMM,
    onMouseUp: onMU,
    onMouseLeave: onMU,
    onTouchStart: onTS,
    onTouchMove: onTM,
    onTouchEnd: onTE
  }, React.createElement("img", {
    src: src,
    draggable: false,
    style: {
      maxWidth: "90vw",
      maxHeight: "85vh",
      transform: "translate(".concat(pan.x, "px,").concat(pan.y, "px) scale(").concat(zoom, ")"),
      transformOrigin: "center center",
      touchAction: "none",
      borderRadius: 6,
      pointerEvents: "none"
    },
    alt: ""
  }), onPrev && React.createElement("button", {
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      return e.stopPropagation();
    },
    onClick: function() { setZoom(1); setPan({x:0,y:0}); onPrev(); },
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      width: 44,
      height: 64,
      borderRadius: 8,
      background: "rgba(255,255,255,.16)",
      border: "none",
      color: "#fff",
      fontSize: 26,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, "\u2039"), onNext && React.createElement("button", {
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      return e.stopPropagation();
    },
    onClick: function() { setZoom(1); setPan({x:0,y:0}); onNext(); },
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      width: 44,
      height: 64,
      borderRadius: 8,
      background: "rgba(255,255,255,.16)",
      border: "none",
      color: "#fff",
      fontSize: 26,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, "\u203A"),
  onPrevItem && React.createElement("button", {
    onMouseDown: function(e) { e.stopPropagation(); },
    onTouchStart: function(e) { e.stopPropagation(); },
    onClick: function() { setZoom(1); setPan({x:0,y:0}); onPrevItem(); },
    style: {
      position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
      width: 32, height: 120, borderRadius: "0 8px 8px 0",
      background: "rgba(99,102,241,.6)", border: "none", color: "#fff",
      fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center",
      justifyContent: "center"
    }
  }, "\u25C0"),
  onNextItem && React.createElement("button", {
    onMouseDown: function(e) { e.stopPropagation(); },
    onTouchStart: function(e) { e.stopPropagation(); },
    onClick: function() { setZoom(1); setPan({x:0,y:0}); onNextItem(); },
    style: {
      position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
      width: 32, height: 120, borderRadius: "8px 0 0 8px",
      background: "rgba(99,102,241,.6)", border: "none", color: "#fff",
      fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center",
      justifyContent: "center"
    }
  }, "\u25B6")
  )), annotOpen && annotProps && React.createElement(ImageAnnotator, {
    img: annotProps.img,
    onSave: function onSave(ed) {
      annotProps.onSave(ed);
      setAnnotOpen(false);
    },
    onClose: function onClose() {
      return setAnnotOpen(false);
    }
  }));
}


function ImageAnnotator(_ref7) {
  var img = _ref7.img,
    onSave = _ref7.onSave,
    onClose = _ref7.onClose,
    onPrev = _ref7.onPrev,
    onNext = _ref7.onNext,
    navLabel = _ref7.navLabel,
    onPrevItem = _ref7.onPrevItem,
    onNextItem = _ref7.onNextItem,
    itemNavLabel = _ref7.itemNavLabel;
  var canvasRef = useRef();
  var _useState31 = useState("pan"),
    _useState32 = _slicedToArray(_useState31, 2),
    tool = _useState32[0],
    setTool = _useState32[1];
  var _useStateCC = useState(false),
    _useStateCCS = _slicedToArray(_useStateCC, 2),
    cancelConfirm = _useStateCCS[0],
    setCancelConfirm = _useStateCCS[1];
  
  var _useStateNavSav = useState(false),
    _useStateNavSavS = _slicedToArray(_useStateNavSav, 2),
    navSaving = _useStateNavSavS[0],
    setNavSaving = _useStateNavSavS[1];
  var navPendingFnRef = useRef(null); 
  var _useState33 = useState("#E53935"),
    _useState34 = _slicedToArray(_useState33, 2),
    color = _useState34[0],
    setColor = _useState34[1];
  var _useState35 = useState([]),
    _useState36 = _slicedToArray(_useState35, 2),
    colorHist = _useState36[0],
    setColorHist = _useState36[1];
  var _useState37 = useState(function(){
    try { var _q=JSON.parse(localStorage.getItem("annot_quickcolors_v1")); if(_q&&_q.length) return _q; } catch(e){}
    return ["#E53935", "#1565C0", "#000000", "#F57F17", "#1B5E20", "#ffffff"];
  }),
    _useState38 = _slicedToArray(_useState37, 2),
    quickColors = _useState38[0],
    setQuickColors = _useState38[1];
  var setQuickColorsAndSave = function(qc) {
    setQuickColors(qc);
    try { localStorage.setItem("annot_quickcolors_v1", JSON.stringify(qc)); } catch(e){}
  };
  var _useState39 = useState(2),
    _useState40 = _slicedToArray(_useState39, 2),
    lineW = _useState40[0],
    setLineW = _useState40[1];
  var _useState41 = useState(1),
    _useState42 = _slicedToArray(_useState41, 2),
    opacity = _useState42[0],
    setOpacity = _useState42[1];
  
  var TOOL_PREFS_KEY = "annot_tool_prefs_v1";
  var toolPrefsRef = useRef(function() {
    try { var p = JSON.parse(localStorage.getItem(TOOL_PREFS_KEY)); if (p && typeof p === "object") return p; } catch(e){}
    return {};
  }());
  var saveToolPrefs = function() {
    try { localStorage.setItem(TOOL_PREFS_KEY, JSON.stringify(toolPrefsRef.current)); } catch(e){}
  };
  
  var DRAW_TOOLS = { line:1, dotted:1, arrow:1, rect:1, circle:1, marker:1, freehand:1, text:1 };
  var _useState43 = useState(true),
    _useState44 = _slicedToArray(_useState43, 2),
    horiz = _useState44[0],
    setHoriz = _useState44[1];
  var _useState45 = useState(24),
    _useState46 = _slicedToArray(_useState45, 2),
    fontSize = _useState46[0],
    setFontSize = _useState46[1];
  var _useState47 = useState("24"),
    _useState48 = _slicedToArray(_useState47, 2),
    fontSizeStr = _useState48[0],
    setFontSizeStr = _useState48[1];
  var _useState49 = useState(false),
    _useState50 = _slicedToArray(_useState49, 2),
    fontBold = _useState50[0],
    setFontBold = _useState50[1];
  
  var _useStateTI = useState(null),
    _useStateTIS = _slicedToArray(_useStateTI, 2),
    textInputState = _useStateTIS[0],
    setTextInputState = _useStateTIS[1];
  
  var _useStateFP = useState(null),
    _useStateFPS = _slicedToArray(_useStateFP, 2),
    floatPos = _useStateFPS[0],
    setFloatPos = _useStateFPS[1];
  var floatDragRef = useRef(null);
  
  var undoRedoDragRef = useRef(null); 
  var _urPos = useState(null); 
  var undoRedoPos = _urPos[0], setUndoRedoPos = _urPos[1];
  var taRef = useRef(null);
  useEffect(function() {
    var el = taRef.current;
    if (!el) return;
    function autoH() {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 320) + "px";
    }
    autoH();
    el.addEventListener("input", autoH);
    return function() { el.removeEventListener("input", autoH); };
  }, [textInputState ? (textInputState.idx + '_' + (textInputState.wrapW||0)) : null]);
  var _useState51 = useState(1),
    _useState52 = _slicedToArray(_useState51, 2),
    zoom = _useState52[0],
    setZoom = _useState52[1],
    _useState53 = useState({
      x: 0,
      y: 0
    }),
    _useState54 = _slicedToArray(_useState53, 2),
    pan = _useState54[0],
    setPan = _useState54[1];
  
  
  var _imgKey = img ? (img.imageUrl || img.origImageUrl || img.base64 || img.id || "") : "";
  useEffect(function() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [_imgKey]);
  var _useState55 = useState(false),
    _useState56 = _slicedToArray(_useState55, 2),
    canUndo = _useState56[0],
    setCanUndo = _useState56[1],
    _useState57 = useState(false),
    _useState58 = _slicedToArray(_useState57, 2),
    canRedo = _useState58[0],
    setCanRedo = _useState58[1];
  var _useState59 = useState("auto"),
    _useState60 = _slicedToArray(_useState59, 2),
    dispW = _useState60[0],
    setDispW = _useState60[1],
    _useState61 = useState("auto"),
    _useState62 = _slicedToArray(_useState61, 2),
    dispH = _useState62[0],
    setDispH = _useState62[1];
  
  var _useStateImgSrc = useState(null),
    _useStateImgSrcS = _slicedToArray(_useStateImgSrc, 2),
    imgSrcState = _useStateImgSrcS[0],
    setImgSrcState = _useStateImgSrcS[1];

  
  var _useState63 = useState(null),
    _useState64 = _slicedToArray(_useState63, 2),
    selBounds = _useState64[0],
    setSelBounds = _useState64[1]; 
  var _useState65 = useState(new Set()),
    _useState66 = _slicedToArray(_useState65, 2),
    selIdxs = _useState66[0],
    setSelIdxs = _useState66[1];
  var baseRef = useRef(null);
  var baseImgRef = useRef(null); 
  var blobUrlRef = useRef(null); 
  var dprRef = useRef(1);
  var maxScaleRef = useRef(1);
  var scRef = useRef(1);
  var logicalSizeRef = useRef({w:0,h:0});
  var doneRef = useRef(null);    
  var strokesRef = useRef([]);
  var histRef = useRef([[]]);
  
  var justSavedRef = useRef(false);
  
  
  var dirtyRef = useRef(false);
  var futRef = useRef([]);
  var drawRef = useRef({
    on: false,
    sx: 0,
    sy: 0
  });
  var lastPosRef = useRef({
    x: 0,
    y: 0
  });
  var freehandPts = useRef([]);

  
  
  
  
  useEffect(function() {
    var onPopCapture = function(e) {
      
      if (window._sn_internalBack) return;
      
      
      try {
        var prev = window.history.state;
        
        
        window.history.pushState({ _sn: "modal:imgannot:" + Date.now() }, "");
      } catch(_){}
      setCancelConfirm(true);
      e.stopImmediatePropagation();
    };
    
    window.addEventListener("popstate", onPopCapture, true);
    return function() { window.removeEventListener("popstate", onPopCapture, true); };
  }, [textInputState]);
  
  useEffect(function() {
    var onBeforeUnload = function(e) {
      e.preventDefault();
      e.returnValue = '書き込み画面を開いています。ページを離れると未保存の内容が失われる可能性があります。';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return function() { window.removeEventListener('beforeunload', onBeforeUnload); };
  }, []);
  
  useEffect(function() {
    if (!DRAW_TOOLS[tool]) return;
    var cur = toolPrefsRef.current[tool] || {};
    cur.color = color;
    cur.lineW = lineW;
    cur.opacity = opacity;
    if (tool === "text") {
      cur.fontSize = fontSize;
      cur.fontBold = fontBold;
    }
    toolPrefsRef.current[tool] = cur;
    saveToolPrefs();
  }, [tool, color, lineW, opacity, fontSize, fontBold]);
  var panRef = useRef(null),
    pinchRef = useRef(null);
  var lassoModeRef = useRef("idle"); 
  var selDragRef = useRef({
    sx: 0,
    sy: 0,
    dx: 0,
    dy: 0
  });
  var resizeRef = useRef(null); 
  var committedRef = useRef(null); 
  var overlayCanvasRef = useRef(null); 
  var _tHandlers = useRef({ts:null,tm:null,te:null}); 
  var _mHandlers = useRef({mv:null,up:null}); 
  var textDragRef = useRef(null); 
  var ctrlPanRef = useRef(null); 
  var bothBtnPanRef = useRef(null); 
  
  var twoFingerRef = useRef({ startTime: 0, startD: 0, prevTapTime: 0, moved: false, prevTool: null });
  
  
  
  var multiTouchSeenRef = useRef(false);
  
  var threeFingerTapRef = useRef({ time: 0, prevTool: null });
  
  var joystickRef = useRef(null);   
  var joystickRafRef = useRef(null); 
  var joystickLastTap = useRef(0);   
  var joystickDragRef = useRef(null); 
  
  var joystickKnobRef = useRef(null);
  var joystickRingRef = useRef(null);
  
  
  var _jsPos = useState(function(){
    try {
      var saved = JSON.parse(localStorage.getItem("annot_joystick_pos_v1"));
      if (saved && typeof saved.left === "number" && typeof saved.bottom === "number") return saved;
    } catch(e){}
    return { left: 16, bottom: 96 };
  });
  var joystickPos = _jsPos[0], setJoystickPos = _jsPos[1];
  
  var _jsVis = useState(function(){
    try {
      var v = localStorage.getItem("annot_joystick_visible_v1");
      if (v === "0" || v === "false") return false;
    } catch(e){}
    return true;
  });
  var joystickVisible = _jsVis[0], setJoystickVisible = _jsVis[1];
  var toggleJoystickVisible = function() {
    var nx = !joystickVisible;
    setJoystickVisible(nx);
    try { localStorage.setItem("annot_joystick_visible_v1", nx ? "1" : "0"); } catch(e){}
    
    if (!nx) {
      try { stopJoystick(); } catch(e){}
      try { joystickDragRef.current = null; } catch(e){}
    }
  };

  var cZ = function cZ(z) {
    return Math.min(Math.max(z, 0.1), 20);
  };

  
  function distSeg(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1,
      dy = y2 - y1,
      l2 = dx * dx + dy * dy;
    if (!l2) return Math.hypot(px - x1, py - y1);
    var t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }
  function strokeHits(s, px, py, er) {
    var hw = (s.type === "marker" ? s.lineW * 4 : s.lineW / 2) + 2,
      r = er + hw;
    switch (s.type) {
      case "line":
      case "dotted":
      case "arrow":
      case "marker":
        return distSeg(px, py, s.x1, s.y1, s.x2, s.y2) < r;
      case "rect":
        return Math.min(distSeg(px, py, s.x1, s.y1, s.x2, s.y1), distSeg(px, py, s.x2, s.y1, s.x2, s.y2), distSeg(px, py, s.x1, s.y2, s.x2, s.y2), distSeg(px, py, s.x1, s.y1, s.x1, s.y2)) < r;
      case "circle":
        {
          var nd = Math.sqrt(Math.pow((px - s.cx) / Math.max(s.rx, 1), 2) + Math.pow((py - s.cy) / Math.max(s.ry, 1), 2));
          return Math.abs(nd - 1) * Math.min(s.rx, s.ry) < r;
        }
      case "freehand":
        return (s.pts || []).some(function (p, i) {
          return i === 0 ? Math.hypot(px - p.x, py - p.y) < r : distSeg(px, py, s.pts[i - 1].x, s.pts[i - 1].y, p.x, p.y) < r;
        });
      case "text":
        {
          var fs = s.fontSize || 24,
            hitW = s.wrapW || s.measuredWidth || Math.max(fs * 0.8 * (s.text || "").length, fs),
            pad = er + 12,
            linesHit = Math.max(1, (s.text || "").split("\n").length),
            hHit = linesHit * fs * 1.45 + fs;
          return px >= s.x - pad && px <= s.x + hitW + pad && py >= s.y - pad && py <= s.y + hHit + pad;
        }
      default:
        return false;
    }
  }
  function findStrokeAt(px, py, er) {
    for (var i = strokesRef.current.length - 1; i >= 0; i--) {
      if (strokeHits(strokesRef.current[i], px, py, er)) return i;
    }
    return -1;
  }
  function pip(px, py, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i].x,
        yi = poly[i].y,
        xj = poly[j].x,
        yj = poly[j].y;
      if (yi > py !== yj > py && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function getBounds(idxs) {
    var mx = Infinity,
      my = Infinity,
      Mx = -Infinity,
      My = -Infinity;
    idxs.forEach(function (i) {
      var s = strokesRef.current[i];
      if (!s) return;
      var pts = [];
      switch (s.type) {
        case "line":
        case "dotted":
        case "arrow":
        case "marker":
          pts = [{
            x: s.x1,
            y: s.y1
          }, {
            x: s.x2,
            y: s.y2
          }];
          break;
        case "rect":
          pts = [{
            x: s.x1,
            y: s.y1
          }, {
            x: s.x2,
            y: s.y2
          }];
          break;
        case "circle":
          pts = [{
            x: s.cx - s.rx,
            y: s.cy - s.ry
          }, {
            x: s.cx + s.rx,
            y: s.cy + s.ry
          }];
          break;
        case "freehand":
          pts = s.pts || [];
          break;
        case "text":
          {
            var fs = s.fontSize || 24,
              w = s.measuredWidth || Math.max(fs * 0.8 * (s.text || '').length, fs);
            pts = [{
              x: s.x,
              y: s.y
            }, {
              x: s.x + w,
              y: s.y + fs * 1.5
            }];
            break;
          }
      }
      pts.forEach(function (p) {
        mx = Math.min(mx, p.x);
        my = Math.min(my, p.y);
        Mx = Math.max(Mx, p.x);
        My = Math.max(My, p.y);
      });
    });
    if (mx === Infinity) return null;
    return {
      x: mx - 10,
      y: my - 10,
      w: Mx - mx + 20,
      h: My - my + 20
    };
  }
  function shiftStroke(s, dx, dy) {
    switch (s.type) {
      case "line":
      case "dotted":
      case "arrow":
      case "marker":
        return _objectSpread(_objectSpread({}, s), {}, {
          x1: s.x1 + dx,
          y1: s.y1 + dy,
          x2: s.x2 + dx,
          y2: s.y2 + dy
        });
      case "rect":
        return _objectSpread(_objectSpread({}, s), {}, {
          x1: s.x1 + dx,
          y1: s.y1 + dy,
          x2: s.x2 + dx,
          y2: s.y2 + dy
        });
      case "circle":
        return _objectSpread(_objectSpread({}, s), {}, {
          cx: s.cx + dx,
          cy: s.cy + dy
        });
      case "freehand":
        return _objectSpread(_objectSpread({}, s), {}, {
          pts: s.pts.map(function (p) {
            return {
              x: p.x + dx,
              y: p.y + dy
            };
          })
        });
      case "text":
        return _objectSpread(_objectSpread({}, s), {}, {
          x: s.x + dx,
          y: s.y + dy
        });
      default:
        return s;
    }
  }
  function scalePoint(px, py, ob, nb) {
    var rx = ob.w > 1 ? (px - ob.x) / ob.w : 0.5,
      ry = ob.h > 1 ? (py - ob.y) / ob.h : 0.5;
    return {
      x: nb.x + rx * nb.w,
      y: nb.y + ry * nb.h
    };
  }
  function scaleStroke(s, ob, nb) {
    var sp = function sp(px, py) {
      return scalePoint(px, py, ob, nb);
    };
    switch (s.type) {
      case "line":
      case "dotted":
      case "arrow":
      case "marker":
        {
          var p1 = sp(s.x1, s.y1),
            p2 = sp(s.x2, s.y2);
          return _objectSpread(_objectSpread({}, s), {}, {
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y
          });
        }
      case "rect":
        {
          var _p = sp(s.x1, s.y1),
            _p2 = sp(s.x2, s.y2);
          return _objectSpread(_objectSpread({}, s), {}, {
            x1: _p.x,
            y1: _p.y,
            x2: _p2.x,
            y2: _p2.y
          });
        }
      case "circle":
        {
          var c = sp(s.cx, s.cy),
            rx = ob.w > 1 ? s.rx * nb.w / ob.w : s.rx,
            ry = ob.h > 1 ? s.ry * nb.h / ob.h : s.ry;
          return _objectSpread(_objectSpread({}, s), {}, {
            cx: c.x,
            cy: c.y,
            rx: rx,
            ry: ry
          });
        }
      case "freehand":
        return _objectSpread(_objectSpread({}, s), {}, {
          pts: s.pts.map(function (p) {
            var q = sp(p.x, p.y);
            return {
              x: q.x,
              y: q.y
            };
          })
        });
      case "text":
        {
          var p = sp(s.x, s.y),
            sc = ob.h > 1 ? nb.h / ob.h : 1;
          return _objectSpread(_objectSpread({}, s), {}, {
            x: p.x,
            y: p.y,
            fontSize: Math.max(4, Math.round((s.fontSize || 24) * sc))
          });
        }
      default:
        return s;
    }
  }

  
  function drawStroke(ctx, s) {
    ctx.save();
    ctx.globalAlpha = s.type === "marker" ? s.opacity * 0.42 : s.opacity;
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = s.type === "marker" ? s.lineW * 8 : s.lineW;
    ctx.lineCap = s.type === "marker" ? "square" : "round";
    ctx.lineJoin = "round";
    ctx.setLineDash(s.type === "dotted" ? [s.lineW * 3, s.lineW * 2] : []);
    switch (s.type) {
      case "line":
      case "dotted":
      case "marker":
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
        break;
      case "arrow":
        {
          var ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1),
            len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1),
            hl = Math.min(len * .3, s.lineW * 9);
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s.x2, s.y2);
          ctx.lineTo(s.x2 - hl * Math.cos(ang - Math.PI / 7), s.y2 - hl * Math.sin(ang - Math.PI / 7));
          ctx.lineTo(s.x2 - hl * Math.cos(ang + Math.PI / 7), s.y2 - hl * Math.sin(ang + Math.PI / 7));
          ctx.closePath();
          ctx.fill();
          break;
        }
      case "rect":
        ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
        break;
      case "circle":
        ctx.beginPath();
        ctx.ellipse(s.cx, s.cy, Math.max(s.rx, 1), Math.max(s.ry, 1), 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "freehand":
        if (s.pts && s.pts.length > 0) {
          ctx.beginPath();
          ctx.moveTo(s.pts[0].x, s.pts[0].y);
          s.pts.slice(1).forEach(function (p) {
            return ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        }
        break;
      case "text": {
        ctx.font = "".concat(s.fontBold ? "bold" : "normal", " ").concat(s.fontSize || 24, "px -apple-system,sans-serif");
        ctx.textBaseline = "top";
        ctx.setLineDash([]);
        ctx.globalAlpha = s.opacity || 1;
        var _maxW = s.wrapW ? Math.max(s.wrapW, 60) : Math.max((logicalSizeRef.current.w || ctx.canvas.width) - s.x - 10, 60);
        var _lh = (s.fontSize || 24) * 1.45;
        var _yOff = 0;
        (s.text || "").split("\n").forEach(function(_para) {
          var _line = "";
          for (var _ci = 0; _ci < _para.length; _ci++) {
            var _test = _line + _para[_ci];
            if (ctx.measureText(_test).width > _maxW && _line.length > 0) {
              ctx.fillText(_line, s.x, s.y + _yOff);
              _yOff += _lh;
              _line = _para[_ci];
            } else { _line = _test; }
          }
          ctx.fillText(_line, s.x, s.y + _yOff);
          _yOff += _lh;
        });
        break;
      }
    }
    ctx.restore();
  }
  
  
  function _restoreBase(ctx, c) {
    var dpr = dprRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (baseImgRef.current) {
      try { ctx.drawImage(baseImgRef.current, 0, 0, logicalSizeRef.current.w, logicalSizeRef.current.h); } catch(e) {}
    }
    return true;
  }

  function _applyRenderScale(z) {
    var c = canvasRef.current;
    if (!c) return false;
    var ls = logicalSizeRef.current;
    if (!ls.w || !ls.h) return false;
    var dpr = window.devicePixelRatio || 1;
    var zz = Math.max(z || 1, 1);
    var maxScale = maxScaleRef.current || 1;
    var fit = scRef.current || 1;
    var scale = Math.min(fit * zz * dpr, maxScale);
    if (scale < 0.05) scale = 0.05;
    var tw = Math.round(ls.w * scale), th = Math.round(ls.h * scale);
    if (c.width === tw && c.height === th) return false;
    dprRef.current = scale;
    c.width = tw;
    c.height = th;
    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.width = c.width;
      overlayCanvasRef.current.height = c.height;
    }
    var ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    return true;
  }
  function rebuild(strokes) {
    var c = canvasRef.current;
    if (!c) return;
    var ctx = c.getContext("2d");
    if (!_restoreBase(ctx, c)) return;
    strokes.forEach(function (s) {
      return drawStroke(ctx, s);
    });
  }
  
  function updateCommitted(strokes) {
    var c = canvasRef.current;
    if (!c) return;
    var ctx = c.getContext("2d");
    if (!_restoreBase(ctx, c)) return;
    strokes.forEach(function (s) { return drawStroke(ctx, s); });
    try { committedRef.current = ctx.getImageData(0, 0, c.width, c.height); } catch(e) {  }
  }

  
  function commit(strokes) {
    histRef.current = [].concat(_toConsumableArray(histRef.current.slice(-19)), [strokes]);
    futRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
    updateCommitted(strokes); 
    dirtyRef.current = true;  
  }
  var undo = function undo() {
    if (textInputState) return;
    if (histRef.current.length <= 1) return;
    var prev = histRef.current[histRef.current.length - 2];
    futRef.current = [strokesRef.current].concat(_toConsumableArray(futRef.current.slice(0, 19)));
    histRef.current = histRef.current.slice(0, -1);
    strokesRef.current = prev;
    setSelIdxs(new Set());
    setSelBounds(null);
    rebuild(prev);
    updateCommitted(prev);
    setCanUndo(histRef.current.length > 1);
    setCanRedo(true);
    dirtyRef.current = true; 
  };
  var redo = function redo() {
    if (textInputState) return;
    if (!futRef.current.length) return;
    var _futRef$current = _toArray(futRef.current),
      next = _futRef$current[0],
      rest = _arrayLikeToArray(_futRef$current).slice(1);
    futRef.current = rest;
    histRef.current = [].concat(_toConsumableArray(histRef.current), [next]);
    strokesRef.current = next;
    setSelIdxs(new Set());
    setSelBounds(null);
    rebuild(next);
    updateCommitted(next);
    setCanUndo(true);
    setCanRedo(rest.length > 0);
    dirtyRef.current = true; 
  };

  
  
  
  
  useEffect(function() {
    if (!navSaving) return;
    var raf = requestAnimationFrame(function() {
      doneRef.current(function() {
        var fn = navPendingFnRef.current;
        navPendingFnRef.current = null;
        setNavSaving(false);
        if (fn) fn();
      }, { afterPng: true });
    });
    return function() { cancelAnimationFrame(raf); };
  }, [navSaving]);
  
  
  
  
  
  useEffect(function () {
    window._snAnnotAutoSave = function() {
      if (dirtyRef.current && doneRef.current) {
        doneRef.current(); 
      }
    };
    return function() { delete window._snAnnotAutoSave; };
  }, []);
  
  useEffect(function () {
    var handler = function(e) {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(function(z) { return Math.min(Math.max(z * factor, 0.1), 7); });
    };
    document.addEventListener("wheel", handler, {passive: false});
    return function() { document.removeEventListener("wheel", handler); };
  }, []);
  useEffect(function () {
    var c = canvasRef.current;
    if (!c) return;
    
    
    if (justSavedRef.current) {
      justSavedRef.current = false;
      return;
    }
    
    
    if (dirtyRef.current) return;
    var ctx = c.getContext("2d");

    
    
    var cancelled = false;

    
    var onImageReady = function(bImg, imgUrl) {
      if (cancelled) return; 
      var nw = bImg.naturalWidth, nh = bImg.naturalHeight;
      var MAX_CANVAS_AREA = 33554432;  // 32M（旧16M→引き上げ：高解像度スクショを縮小せず読み込む）
      var MAX_CANVAS_DIM = 8192;       // 1辺の上限（iPadのcanvas制限内に収めSafariの間引きを防ぐ）
      var area = nw * nh;
      // 面積 or 1辺が上限を超える場合のみ論理サイズを縮小
      var _byArea = area > MAX_CANVAS_AREA ? Math.sqrt(MAX_CANVAS_AREA / area) : 1;
      var _byDim = Math.max(nw, nh) > MAX_CANVAS_DIM ? MAX_CANVAS_DIM / Math.max(nw, nh) : 1;
      var scale = Math.min(_byArea, _byDim);
      if (scale < 1) {
        nw = Math.floor(nw * scale);
        nh = Math.floor(nh * scale);
      }


      baseImgRef.current = bImg;
      logicalSizeRef.current = { w: nw, h: nh };
      scRef.current = Math.min((window.innerWidth * 0.96) / nw, ((window.innerHeight - 130) * 0.96) / nh, 1);
      // 物理canvasが面積・1辺の上限を超えないよう maxScale を算出
      maxScaleRef.current = Math.min(Math.sqrt(MAX_CANVAS_AREA / (nw * nh)), MAX_CANVAS_DIM / Math.max(nw, nh));
      _applyRenderScale(1);
      console.log("[Annotator] renderScale=" + dprRef.current.toFixed(3) + " logical=" + nw + "×" + nh + " physical=" + c.width + "×" + c.height + " maxScale=" + maxScaleRef.current.toFixed(3) + " devicePixelRatio=" + window.devicePixelRatio);

      setImgSrcState(imgUrl || null);

      baseRef.current = null;
      var saved = Array.isArray(img.strokes) ? img.strokes : [];
      
      
      
      
      var _hasOrig = (img.orig_base64 && img.orig_base64 !== "__ref__") || img.origImageUrl;
      if (!_hasOrig) {
        if (img.base64 && img.base64 !== "__ref__") {
          img.orig_base64 = img.base64;
          img.orig_mt = img.mt;
        } else if (img.imageUrl) {
          img.origImageUrl = img.imageUrl;
        }
      }
      strokesRef.current = _toConsumableArray(saved);
      rebuild(saved);
      histRef.current = [_toConsumableArray(saved)];
      futRef.current = [];
      setCanUndo(false);
      setCanRedo(false);
      try {
        committedRef.current = ctx.getImageData(0, 0, c.width, c.height);
      } catch(e) { committedRef.current = null; }
      setDispW(Math.round(nw * scRef.current));
      setDispH(Math.round(nh * scRef.current));
    };

    
    var src = origImgSrc(img);
    if (!src) { console.warn("[Annotator] No image source available"); return; }

    if (src.indexOf("data:") === 0) {
      
      var bImg = new Image();
      bImg.onload = function() { onImageReady(bImg, src); };
      bImg.onerror = function() { console.warn("[Annotator] data URL load failed"); };
      bImg.src = src;
    } else {
      
      console.log("[Annotator] Fetching image from URL...");
      fetch(src).then(function(r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      }).then(function(blob) {
        var blobUrl = URL.createObjectURL(blob);
        var bImg = new Image();
        bImg.onload = function() {
          onImageReady(bImg, blobUrl);
          
          
          blobUrlRef.current = blobUrl;
        };
        bImg.onerror = function() {
          console.warn("[Annotator] blob URL load failed, trying direct...");
          URL.revokeObjectURL(blobUrl);
          
          var bImg2 = new Image();
          bImg2.onload = function() { onImageReady(bImg2, src); };
          bImg2.onerror = function() { console.error("[Annotator] All load methods failed"); };
          bImg2.src = src;
        };
        bImg.src = blobUrl;
      })["catch"](function(e) {
        console.warn("[Annotator] fetch failed:", e, "trying direct load...");
        
        var bImg3 = new Image();
        bImg3.onload = function() { onImageReady(bImg3, src); };
        bImg3.onerror = function() { console.error("[Annotator] All load methods failed for:", src.substring(0, 80)); };
        bImg3.src = src;
      });
    }
    
    return function() { cancelled = true; };
  }, [img && (img.id || img.imageUrl || (img.base64 && img.base64.length)), img && img.strokes && img.strokes.length]);

  useEffect(function () {
    if (!canvasRef.current || !logicalSizeRef.current.w) return;
    var t = setTimeout(function () {
      if (_applyRenderScale(zoom)) {
        rebuild(strokesRef.current);
      }
    }, 160);
    return function() { clearTimeout(t); };
  }, [zoom]);

  useEffect(function () {
    var el = canvasRef.current;
    if (!el) return;
    var _ts = function(e) { _tHandlers.current.ts && _tHandlers.current.ts(e); };
    var _tm = function(e) { _tHandlers.current.tm && _tHandlers.current.tm(e); };
    var _te = function(e) { _tHandlers.current.te && _tHandlers.current.te(e); };
    el.addEventListener("touchstart", _ts, {passive: false});
    el.addEventListener("touchmove", _tm, {passive: false});
    el.addEventListener("touchend", _te);
    el.addEventListener("touchcancel", _te);
    return function() {
      el.removeEventListener("touchstart", _ts);
      el.removeEventListener("touchmove", _tm);
      el.removeEventListener("touchend", _te);
      el.removeEventListener("touchcancel", _te);
      
      if (blobUrlRef.current) {
        try { URL.revokeObjectURL(blobUrlRef.current); } catch(e){}
        blobUrlRef.current = null;
      }
    };
  }, []);
  var getPos = function getPos(e) {
    var c = canvasRef.current,
      r = c.getBoundingClientRect();
    
    var ls = logicalSizeRef.current;
    var sx = ls.w / r.width,
      sy = ls.h / r.height;
    var src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * sx,
      y: (src.clientY - r.top) * sy
    };
  };
  var getScreen = function getScreen(e) {
    var src = e.touches ? e.touches[0] : e;
    return {
      x: src.clientX,
      y: src.clientY
    };
  };
  var snapPos = function snapPos(pos) {
    return horiz && ["line", "dotted", "marker", "arrow"].includes(tool) ? _objectSpread(_objectSpread({}, pos), {}, {
      y: drawRef.current.sy
    }) : pos;
  };

  
  function deleteSelected() {
    var ns = strokesRef.current.filter(function (_, i) {
      return !selIdxs.has(i);
    });
    strokesRef.current = ns;
    setSelIdxs(new Set());
    setSelBounds(null);
    commit(ns);
    rebuild(ns);
  }
  function changeSelectedColor(c) {
    var ns = strokesRef.current.map(function (s, i) {
      return selIdxs.has(i) ? _objectSpread(_objectSpread({}, s), {}, {
        color: c
      }) : s;
    });
    strokesRef.current = ns;
    commit(ns);
    rebuild(ns);
  }
    function confirmText() {
    if (!textInputState) return;
    var ti = Object.assign({}, textInputState, {text: taRef.current ? taRef.current.value : textInputState.text});
    if (!ti.text.trim()) { setTextInputState(null); return; }
    var _tmpCtx = document.createElement("canvas").getContext("2d");
    _tmpCtx.font = (ti.fontBold?"bold ":"") + ti.fontSize + "px -apple-system,sans-serif";
    var _measW = _tmpCtx.measureText(ti.text.trim()).width;
    var newStroke = {type:"text", x:ti.x, y:ti.y, text:ti.text.trim(),
      fontSize:ti.fontSize, fontBold:ti.fontBold, color:ti.color, opacity:ti.opacity, lineW:1, measuredWidth:_measW,
      wrapW: ti.wrapW || null};
    var ns;
    if (ti.idx >= 0) {
      ns = strokesRef.current.map(function(s,i){return i===ti.idx?newStroke:s;});
    } else {
      ns = [].concat(_toConsumableArray(strokesRef.current), [newStroke]);
    }
    strokesRef.current = ns; commit(ns); rebuild(ns);
    setTextInputState(null);
  }
  function changeSelectedFontSize(delta) {
    var ns = strokesRef.current.map(function(s,i){
      return selIdxs.has(i) && s.type==="text" ? Object.assign({},s,{fontSize:Math.max(8,Math.min(120,(s.fontSize||24)+delta))}) : s;
    });
    strokesRef.current = ns; commit(ns); rebuild(ns);
  }
  function changeSelectedOpacity(op) {
    var ns = strokesRef.current.map(function(s,i){
      return selIdxs.has(i) && s.type==="text" ? Object.assign({},s,{opacity:op}) : s;
    });
    strokesRef.current = ns; commit(ns); rebuild(ns);
  }
  function duplicateSelected() {
    var off = 22;
    var extras = _toConsumableArray(selIdxs).map(function (i) {
      return shiftStroke(_objectSpread({}, strokesRef.current[i]), off, off);
    });
    var ns = [].concat(_toConsumableArray(strokesRef.current), _toConsumableArray(extras));
    strokesRef.current = ns;
    var newIdxs = new Set(extras.map(function (_, j) {
      return strokesRef.current.length - extras.length + j;
    }));
    var nb = getBounds(newIdxs);
    strokesRef.current = ns;
    setSelIdxs(newIdxs);
    setSelBounds(nb);
    commit(ns);
    rebuild(ns);
  }
  function clearSelection() {
    setSelIdxs(new Set());
    setSelBounds(null);
    lassoModeRef.current = "idle";
    rebuild(strokesRef.current);
  }

  
  function startResize(handleId, e) {
    e.stopPropagation();
    e.preventDefault();
    if (!selBounds || !canvasRef.current) return;
    var ob = _objectSpread({}, selBounds);
    var origStrokes = JSON.parse(JSON.stringify(strokesRef.current));
    var startX = e.clientX || e.touches && e.touches[0].clientX || 0;
    var startY = e.clientY || e.touches && e.touches[0].clientY || 0;
    resizeRef.current = {
      handleId: handleId,
      ob: ob,
      origStrokes: origStrokes,
      startX: startX,
      startY: startY
    };
    var onMov = function onMov(ev) {
      ev.preventDefault && ev.preventDefault();
      var cx = ev.clientX || ev.touches && ev.touches[0].clientX || 0;
      var cy = ev.clientY || ev.touches && ev.touches[0].clientY || 0;
      var rect = canvasRef.current.getBoundingClientRect();
      var sw = logicalSizeRef.current.w / rect.width,
        sh = logicalSizeRef.current.h / rect.height;
      var sdx = (cx - resizeRef.current.startX) * sw,
        sdy = (cy - resizeRef.current.startY) * sh;
      var r = resizeRef.current;
      var nb = _objectSpread({}, r.ob);
      var hid = r.handleId;
      if (hid.includes("l")) {
        nb.x = r.ob.x + sdx;
        nb.w = Math.max(10, r.ob.w - sdx);
      }
      if (hid.includes("r")) nb.w = Math.max(10, r.ob.w + sdx);
      if (hid.includes("t")) {
        nb.y = r.ob.y + sdy;
        nb.h = Math.max(10, r.ob.h - sdy);
      }
      if (hid.includes("b")) nb.h = Math.max(10, r.ob.h + sdy);
      var ns = r.origStrokes.map(function (s, i) {
        return selIdxs.has(i) ? scaleStroke(s, r.ob, nb) : s;
      });
      strokesRef.current = ns;
      setSelBounds(nb);
      rebuild(ns);
    };
    var _onUp = function onUp() {
      commit(strokesRef.current);
      resizeRef.current = null;
      window.removeEventListener('mousemove', onMov);
      window.removeEventListener('mouseup', _onUp);
      window.removeEventListener('touchmove', onMov);
      window.removeEventListener('touchend', _onUp);
    };
    window.addEventListener('mousemove', onMov);
    window.addEventListener('mouseup', _onUp);
    window.addEventListener('touchmove', onMov, {
      passive: false
    });
    window.addEventListener('touchend', _onUp);
  }

  
  var onStart = function onStart(e) {
    if (e.touches && e.touches.length >= 2) return;
    
    
    if (pinchRef.current) return;
    
    
    if (multiTouchSeenRef.current) return;
    e.preventDefault();
    
    if (!e.touches && (e.ctrlKey || e.metaKey)) {
      ctrlPanRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
      return;
    }
    if (tool === "pan") {
      var s = e.touches ? e.touches[0] : e;
      panRef.current = {
        sx: s.clientX,
        sy: s.clientY,
        px: pan.x,
        py: pan.y
      };
      return;
    }
    
    if (textInputState) {
      var _txt = taRef.current ? taRef.current.value : textInputState.text;
      if (_txt && _txt.trim()) {
        if (taRef.current) textInputState.text = taRef.current.value;
        confirmText();
      } else {
        if (textInputState.idx >= 0) rebuild(strokesRef.current);
        setTextInputState(null);
      }
      return;
    }
    var pos = getPos(e);
    lastPosRef.current = pos;
    if (tool === "lasso") {
      var er = IS_TOUCH ? 20 : 12;
      
      if (selBounds && pos.x >= selBounds.x && pos.x <= selBounds.x + selBounds.w && pos.y >= selBounds.y && pos.y <= selBounds.y + selBounds.h) {
        selDragRef.current = {
          sx: pos.x,
          sy: pos.y,
          dx: 0,
          dy: 0
        };
        lassoModeRef.current = "dragging_sel";
        return;
      }
      
      var hitIdx = findStrokeAt(pos.x, pos.y, er);
      if (hitIdx >= 0) {
        var _hitS = strokesRef.current[hitIdx];
        if (_hitS && _hitS.type === "text") {
          
          setSelIdxs(new Set()); setSelBounds(null);
          textDragRef.current = {
            idx: hitIdx, sx: pos.x, sy: pos.y,
            ox: _hitS.x, oy: _hitS.y, dragged: false, fromLasso: true
          };
          return;
        }
        var newIdxs = new Set([hitIdx]);
        var nb = getBounds(newIdxs);
        setSelIdxs(newIdxs);
        setSelBounds(nb);
        selDragRef.current = {
          sx: pos.x,
          sy: pos.y,
          dx: 0,
          dy: 0
        };
        lassoModeRef.current = "dragging_sel";
        return;
      }
      
      setSelIdxs(new Set());
      setSelBounds(null);
      rebuild(strokesRef.current);
      var _eS = e.touches ? e.touches[0] : e;
      panRef.current = { sx: _eS.clientX, sy: _eS.clientY, px: pan.x, py: pan.y };
      lassoModeRef.current = "panning";
      return;
    }
    if (tool === "text") {
      var _erT = IS_TOUCH ? 20 : 12;
      var _hiT = findStrokeAt(pos.x, pos.y, _erT);
      if (_hiT >= 0 && strokesRef.current[_hiT].type === "text") {
        
        var _tsT0 = strokesRef.current[_hiT];
        textDragRef.current = {
          idx: _hiT, sx: pos.x, sy: pos.y,
          ox: _tsT0.x, oy: _tsT0.y, dragged: false
        };
      } else {
        var _cw = logicalSizeRef.current.w || canvasRef.current.width;
        var _defW = Math.min(Math.round(_cw * 0.65), Math.max(200, _cw - pos.x - 20));
        setTextInputState({x:pos.x, y:pos.y, idx:-1, text:"",
          fontSize:fontSize, fontBold:fontBold, color:color, opacity:opacity, wrapW:_defW});
      }
      return;
    }
    drawRef.current = {
      on: true,
      sx: pos.x,
      sy: pos.y
    };
    if (tool === "freehand") {
      freehandPts.current = [pos];
      rebuild(strokesRef.current);
      var ctx = canvasRef.current.getContext("2d");
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };
  var onMove = function onMove(e) {
    if (e.touches && e.touches.length >= 2) return;
    
    
    
    if (pinchRef.current) return;
    
    
    if (multiTouchSeenRef.current) return;
    e.preventDefault();
    if (ctrlPanRef.current) {
      setPan({ x: ctrlPanRef.current.px + (e.clientX - ctrlPanRef.current.sx),
               y: ctrlPanRef.current.py + (e.clientY - ctrlPanRef.current.sy) });
      return;
    }
    if (bothBtnPanRef.current) {
      if (e.buttons !== 3) { bothBtnPanRef.current = null; return; }
      setPan({ x: bothBtnPanRef.current.px + (e.clientX - bothBtnPanRef.current.sx),
               y: bothBtnPanRef.current.py + (e.clientY - bothBtnPanRef.current.sy) });
      return;
    }
    if (tool === "pan" && panRef.current) {
      var s = e.touches ? e.touches[0] : e;
      setPan({
        x: panRef.current.px + (s.clientX - panRef.current.sx),
        y: panRef.current.py + (s.clientY - panRef.current.sy)
      });
      return;
    }
    var rawPos = getPos(e);
    lastPosRef.current = rawPos;
    if (tool === "lasso") {
      var mode = lassoModeRef.current;
      
      if (textDragRef.current && textDragRef.current.fromLasso) {
        var _tdL = textDragRef.current;
        var _ddxL = rawPos.x - _tdL.sx, _ddyL = rawPos.y - _tdL.sy;
        if (!_tdL.dragged && Math.hypot(_ddxL, _ddyL) > 5) _tdL.dragged = true;
        if (_tdL.dragged) {
          rebuild(strokesRef.current.map(function(s,i){
            return i===_tdL.idx ? Object.assign({},s,{x:_tdL.ox+_ddxL,y:_tdL.oy+_ddyL}) : s;
          }));
        }
        return;
      }
      
      if (mode === "panning" && panRef.current) {
        var _ps = e.touches ? e.touches[0] : e;
        setPan({
          x: panRef.current.px + (_ps.clientX - panRef.current.sx),
          y: panRef.current.py + (_ps.clientY - panRef.current.sy)
        });
        return;
      }
      if (mode === "dragging_sel") {
        var dx = rawPos.x - selDragRef.current.sx,
          dy = rawPos.y - selDragRef.current.sy;
        if (Math.hypot(dx, dy) > 4) lassoModeRef.current = "moving";
      } else if (mode === "moving") {
        var _dx = rawPos.x - selDragRef.current.sx,
          _dy = rawPos.y - selDragRef.current.sy;
        selDragRef.current.dx = _dx;
        selDragRef.current.dy = _dy;
        rebuild(strokesRef.current.filter(function (_, i) { return !selIdxs.has(i); }));
        var _ctx = canvasRef.current.getContext("2d");
        _toConsumableArray(selIdxs).forEach(function (i) {
          drawStroke(_ctx, shiftStroke(strokesRef.current[i], _dx, _dy));
        });
      }
      return;
    }
    if (tool === "text" && textDragRef.current) {
      var _td = textDragRef.current;
      var _ddx = rawPos.x - _td.sx, _ddy = rawPos.y - _td.sy;
      if (!_td.dragged && Math.hypot(_ddx, _ddy) > 5) _td.dragged = true;
      if (_td.dragged) {
        rebuild(strokesRef.current.map(function(s,i){
          return i===_td.idx ? Object.assign({},s,{x:_td.ox+_ddx,y:_td.oy+_ddy}) : s;
        }));
      }
      return;
    }
    if (!drawRef.current.on) return;
    var c = canvasRef.current,
      ctx = c.getContext("2d");
    var pos = snapPos(rawPos);
    var _drawRef$current = drawRef.current,
      sx = _drawRef$current.sx,
      sy = _drawRef$current.sy;
    if (tool === "freehand") {
      var lp = freehandPts.current[freehandPts.current.length - 1];
      if (!lp || Math.hypot(rawPos.x - lp.x, rawPos.y - lp.y) > 2) {
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.setLineDash([]);
        ctx.lineTo(rawPos.x, rawPos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rawPos.x, rawPos.y);
        ctx.globalAlpha = 1;
        freehandPts.current.push(rawPos);
      }
    } else if (tool === "eraser") {
      var er = lineW * 5;
      var after = strokesRef.current.filter(function (s) {
        return !strokeHits(s, rawPos.x, rawPos.y, er);
      });
      if (after.length !== strokesRef.current.length) {
        strokesRef.current = after;
        rebuild(after);
      }
    } else {
      
      var _oc = overlayCanvasRef.current;
      if (_oc && _oc.width > 0) {
        var _octx = _oc.getContext('2d');
        var _dpr = dprRef.current;
        _octx.setTransform(1, 0, 0, 1, 0, 0);
        _octx.clearRect(0, 0, _oc.width, _oc.height);
        _octx.setTransform(_dpr, 0, 0, _dpr, 0, 0);
        var ps = buildStroke(sx, sy, pos.x, pos.y);
        if (ps) { drawStroke(_octx, ps); _octx.globalAlpha = 1; }
      }
    }
  };
  var onEnd = function onEnd(e) {
    if (ctrlPanRef.current) {
      ctrlPanRef.current = null;
      return;
    }
    if (bothBtnPanRef.current) {
      bothBtnPanRef.current = null;
      return;
    }
    if (tool === "pan") {
      panRef.current = null;
      return;
    }
    if (tool === "lasso") {
      var mode = lassoModeRef.current;
      
      var _tdL2 = textDragRef.current;
      if (_tdL2 && _tdL2.fromLasso) {
        textDragRef.current = null;
        lassoModeRef.current = "idle";
        if (_tdL2.dragged) {
          var _epL = e.changedTouches && e.changedTouches.length
            ? getPos(Object.assign({}, e, {touches: e.changedTouches}))
            : lastPosRef.current;
          var _ddxL2 = _epL.x - _tdL2.sx, _ddyL2 = _epL.y - _tdL2.sy;
          var _nsTL = strokesRef.current.map(function(s,i){
            return i===_tdL2.idx ? Object.assign({},s,{x:_tdL2.ox+_ddxL2,y:_tdL2.oy+_ddyL2}) : s;
          });
          strokesRef.current = _nsTL; commit(_nsTL); rebuild(_nsTL);
        } else {
          var _tsL = strokesRef.current[_tdL2.idx];
          if (_tsL) {
            var _existWL2 = _tsL.wrapW || Math.max((logicalSizeRef.current.w || canvasRef.current.width) - _tsL.x - 20, 200);
            setTextInputState({x:_tsL.x,y:_tsL.y,idx:_tdL2.idx,text:_tsL.text,
              fontSize:_tsL.fontSize||24,fontBold:_tsL.fontBold||false,
              color:_tsL.color||color,opacity:_tsL.opacity||1,wrapW:_existWL2});
            rebuild(strokesRef.current.filter(function(_,i){return i!==_tdL2.idx;}));
          }
        }
        return;
      }
      
      if (mode === "panning") {
        panRef.current = null;
        lassoModeRef.current = "idle";
        return;
      }
      if (mode === "moving") {
        var _selDragRef$current = selDragRef.current,
          dx = _selDragRef$current.dx,
          dy = _selDragRef$current.dy;
        var ns = strokesRef.current.map(function (s, i) {
          return selIdxs.has(i) ? shiftStroke(s, dx, dy) : s;
        });
        strokesRef.current = ns;
        var nb = selBounds ? _objectSpread(_objectSpread({}, selBounds), {}, {
          x: selBounds.x + dx,
          y: selBounds.y + dy
        }) : null;
        setSelBounds(nb);
        commit(ns);
        rebuild(ns);
        lassoModeRef.current = "idle";
      } else {
        lassoModeRef.current = "idle";
      }
      return;
    }
    if (tool === "text") {
      var _tdEnd = textDragRef.current;
      textDragRef.current = null;
      if (_tdEnd) {
        if (_tdEnd.dragged) {
          var _ep = e.changedTouches && e.changedTouches.length
            ? getPos(Object.assign({}, e, {touches: e.changedTouches}))
            : lastPosRef.current;
          var _ddxE = _ep.x - _tdEnd.sx, _ddyE = _ep.y - _tdEnd.sy;
          var _nsTD = strokesRef.current.map(function(s,i){
            return i===_tdEnd.idx ? Object.assign({},s,{x:_tdEnd.ox+_ddxE,y:_tdEnd.oy+_ddyE}) : s;
          });
          strokesRef.current = _nsTD; commit(_nsTD); rebuild(_nsTD);
        } else {
          var _tsE = strokesRef.current[_tdEnd.idx];
          if (_tsE) {
            var _existWE = _tsE.wrapW || Math.max((logicalSizeRef.current.w || canvasRef.current.width) - _tsE.x - 20, 200);
            setTextInputState({x:_tsE.x,y:_tsE.y,idx:_tdEnd.idx,text:_tsE.text,
              fontSize:_tsE.fontSize||24,fontBold:_tsE.fontBold||false,
              color:_tsE.color||color,opacity:_tsE.opacity||1,wrapW:_existWE});
            rebuild(strokesRef.current.filter(function(_,i){return i!==_tdEnd.idx;}));
          }
        }
      }
      return;
    }
    if (!drawRef.current.on) return;
    drawRef.current.on = false;
    var _drawRef$current2 = drawRef.current,
      sx = _drawRef$current2.sx,
      sy = _drawRef$current2.sy;
    var rawPos = e.changedTouches && e.changedTouches.length ? getPos(_objectSpread(_objectSpread({}, e), {}, {
      touches: e.changedTouches
    })) : lastPosRef.current;
    if (tool === "freehand") {
      if (freehandPts.current.length > 1) {
        var s = {
          type: "freehand",
          pts: _toConsumableArray(freehandPts.current),
          color: color,
          lineW: lineW,
          opacity: opacity
        };
        var _ns = [].concat(_toConsumableArray(strokesRef.current), [s]);
        strokesRef.current = _ns;
        commit(_ns);
        rebuild(_ns);
      } else rebuild(strokesRef.current);
      freehandPts.current = [];
    } else if (tool === "eraser") {
      commit(strokesRef.current);
    } else {
      var sPos = snapPos(rawPos);
      var _s = buildStroke(sx, sy, sPos.x, sPos.y);
      
      var _oc2 = overlayCanvasRef.current;
      if (_oc2 && _oc2.width > 0) { var _octx2 = _oc2.getContext('2d'); _octx2.setTransform(1,0,0,1,0,0); _octx2.clearRect(0, 0, _oc2.width, _oc2.height); }
      if (_s && (Math.abs(sPos.x - sx) > 1 || Math.abs(sPos.y - sy) > 1)) {
        var _ns2 = [].concat(_toConsumableArray(strokesRef.current), [_s]);
        strokesRef.current = _ns2;
        commit(_ns2);
        rebuild(_ns2);
      } else rebuild(strokesRef.current);
    }
  };
  function buildStroke(x1, y1, x2, y2) {
    var b = {
      color: color,
      lineW: lineW,
      opacity: opacity
    };
    switch (tool) {
      case "line":
        return _objectSpread(_objectSpread({}, b), {}, {
          type: "line",
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
      case "dotted":
        return _objectSpread(_objectSpread({}, b), {}, {
          type: "dotted",
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
      case "arrow":
        return _objectSpread(_objectSpread({}, b), {}, {
          type: "arrow",
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
      case "rect":
        return _objectSpread(_objectSpread({}, b), {}, {
          type: "rect",
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
      case "circle":
        return _objectSpread(_objectSpread({}, b), {}, {
          type: "circle",
          cx: (x1 + x2) / 2,
          cy: (y1 + y2) / 2,
          rx: Math.abs(x2 - x1) / 2,
          ry: Math.abs(y2 - y1) / 2
        });
      case "marker":
        return _objectSpread(_objectSpread({}, b), {}, {
          type: "marker",
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
      default:
        return null;
    }
  }
  var onWheel = function onWheel(e) {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    setPan(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, {
        y: p.y - e.deltaY * 0.8
      });
    });
  };
  
  
  
  
  
  
  var _clearMidStroke = function() {
    if (!drawRef.current.on) return;
    drawRef.current.on = false;
    freehandPts.current = [];
    try { rebuild(strokesRef.current); } catch(_e){}
    var _ocM = overlayCanvasRef.current;
    if (_ocM && _ocM.width > 0) {
      var _octxM = _ocM.getContext('2d');
      _octxM.setTransform(1, 0, 0, 1, 0, 0);
      _octxM.clearRect(0, 0, _ocM.width, _ocM.height);
    }
  };
  var onTS = function onTS(e) {
    
    if (e.touches.length === 3) {
      multiTouchSeenRef.current = true;  
      _clearMidStroke();
      pinchRef.current = null;
      e.preventDefault();
      var nowT3 = Date.now();
      var tt3 = threeFingerTapRef.current;
      if (nowT3 - tt3.time < 600) {
        
        tt3.time = 0;
        if (tool === "pan") {
          switchTool(tt3.prevTool || "line");
        } else {
          tt3.prevTool = tool;
          switchTool("pan");
        }
      } else {
        tt3.time = nowT3;
      }
      return;
    }
    if (e.touches.length === 2) {
      multiTouchSeenRef.current = true;  
      _clearMidStroke();
      e.preventDefault();
      var dx = e.touches[0].clientX - e.touches[1].clientX,
        dy = e.touches[0].clientY - e.touches[1].clientY;
      var _2fStartD = Math.hypot(dx, dy);
      pinchRef.current = {
        d: _2fStartD,
        z: zoom,
        px: pan.x,
        py: pan.y,
        mx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        my: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      
      twoFingerRef.current.startTime = Date.now();
      twoFingerRef.current.startD = _2fStartD;
      twoFingerRef.current.moved = false;
    } else {
      
      onStart(e);
    }
  };
  var onTM = function onTM(e) {
    
    if (e.touches.length >= 2) {
      multiTouchSeenRef.current = true;  
      e.preventDefault();
      _clearMidStroke();  
      
      if (e.touches.length >= 3) return;
      
      if (!pinchRef.current) {
        var _dxR = e.touches[0].clientX - e.touches[1].clientX,
            _dyR = e.touches[0].clientY - e.touches[1].clientY;
        var _dR = Math.hypot(_dxR, _dyR);
        pinchRef.current = {
          d: _dR, z: zoom, px: pan.x, py: pan.y,
          mx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          my: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
        
        twoFingerRef.current.startTime = Date.now();
        twoFingerRef.current.startD = _dR;
        twoFingerRef.current.moved = true;
        return;  
      }
      var dx = e.touches[0].clientX - e.touches[1].clientX,
        dy = e.touches[0].clientY - e.touches[1].clientY;
      var d = Math.hypot(dx, dy),
        mx = (e.touches[0].clientX + e.touches[1].clientX) / 2,
        my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      if (twoFingerRef.current && !twoFingerRef.current.moved) {
        if (Math.abs(d - twoFingerRef.current.startD) > 5) {
          twoFingerRef.current.moved = true;
        }
      }
      
      setZoom(cZ(pinchRef.current.z * (d / pinchRef.current.d)));
      setPan({
        x: pinchRef.current.px + (mx - pinchRef.current.mx),
        y: pinchRef.current.py + (my - pinchRef.current.my)
      });
    } else onMove(e);
  };
  var onTE = function onTE(e) {
    
    if (pinchRef.current && e.touches.length < 2) {
      var tf = twoFingerRef.current;
      var elapsed = Date.now() - tf.startTime;
      if (!tf.moved && elapsed < 250) {
        
        var nowTap = Date.now();
        if (nowTap - tf.prevTapTime < 400) {
          
          tf.prevTapTime = 0;
          if (tool === "eraser") {
            switchTool(tf.prevTool || "line");
          } else {
            tf.prevTool = tool;
            switchTool("eraser");
          }
          e.preventDefault();
        } else {
          tf.prevTapTime = nowTap;
        }
      }
    }
    pinchRef.current = null;
    
    if (e.touches.length === 0) multiTouchSeenRef.current = false;
    onEnd(e);
  };
  
  _tHandlers.current.ts = onTS;
  _tHandlers.current.tm = onTM;
  _tHandlers.current.te = onTE;
  _mHandlers.current.mv = onMove;
  _mHandlers.current.up = onEnd;

  
  var STICK_R = 52;
  var _setKnob = function(x, y) {
    
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform =
        "translate(calc(-50% + "+x+"px), calc(-50% + "+y+"px))";
    }
  };
  var _setRingDrag = function(on) {
    if (joystickRingRef.current) {
      joystickRingRef.current.style.background = on ? "rgba(255,165,0,0.18)" : "rgba(255,255,255,0.12)";
      joystickRingRef.current.style.border = on ? "2px solid rgba(255,165,0,0.7)" : "2px solid rgba(255,255,255,0.25)";
    }
  };
  var stopJoystick = function() {
    if (joystickRafRef.current) { cancelAnimationFrame(joystickRafRef.current); joystickRafRef.current = null; }
    joystickRef.current = null;
    _setKnob(0, 0); 
  };
  var joystickTouchStart = function(e) {
    e.stopPropagation(); e.preventDefault();
    var t = e.touches[0];
    
    var now = Date.now();
    var last = joystickLastTap.current;
    joystickLastTap.current = now;
    if (now - last < 400) {
      
      if (joystickRafRef.current) { cancelAnimationFrame(joystickRafRef.current); joystickRafRef.current = null; }
      joystickRef.current = null;
      _setKnob(0, 0);
      joystickDragRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        startLeft: joystickPos.left,
        startBottom: joystickPos.bottom
      };
      _setRingDrag(true); 
      return;
    }
    
    var rect = e.currentTarget.getBoundingClientRect();
    joystickRef.current = { cx: rect.left + rect.width/2, cy: rect.top + rect.height/2, off:{x:0,y:0} };
    _setKnob(0, 0);
    var loop = function() {
      if (!joystickRef.current) return;
      var off = joystickRef.current.off;
      if (Math.hypot(off.x, off.y) > 3) {
        var speed = 3;
        setPan(function(p){ return {x: p.x - off.x * speed / STICK_R, y: p.y - off.y * speed / STICK_R}; });
      }
      joystickRafRef.current = requestAnimationFrame(loop);
    };
    joystickRafRef.current = requestAnimationFrame(loop);
  };
  var joystickTouchMove = function(e) {
    e.stopPropagation(); e.preventDefault();
    var t = e.touches[0];
    
    if (joystickDragRef.current) {
      var d = joystickDragRef.current;
      var newLeft   = Math.max(0, d.startLeft   + (t.clientX - d.startX));
      var newBottom = Math.max(0, d.startBottom - (t.clientY - d.startY));
      var newPos = {left: newLeft, bottom: newBottom};
      setJoystickPos(newPos); 
      try { localStorage.setItem("annot_joystick_pos_v1", JSON.stringify(newPos)); } catch(e){}
      return;
    }
    
    if (!joystickRef.current) return;
    var dx = t.clientX - joystickRef.current.cx;
    var dy = t.clientY - joystickRef.current.cy;
    var dist = Math.hypot(dx, dy);
    var clamp = Math.min(dist, STICK_R);
    
    var off;
    if (dist < 3) {
      off = { x: 0, y: 0 };
    } else if (Math.abs(dx) >= Math.abs(dy)) {
      off = { x: (dx > 0 ? 1 : -1) * clamp, y: 0 };
    } else {
      off = { x: 0, y: (dy > 0 ? 1 : -1) * clamp };
    }
    joystickRef.current.off = off;
    _setKnob(off.x, off.y); 
  };
  var joystickTouchEnd = function(e) {
    e.stopPropagation();
    if (joystickDragRef.current) {
      joystickDragRef.current = null;
      _setRingDrag(false); 
      joystickLastTap.current = 0;
      return;
    }
    stopJoystick();
  };
  var done = function done(cb, opts) {
    var afterPng = opts && opts.afterPng; 
    
    var _curStrokes = strokesRef.current;
    if (textInputState) {
      var _td = taRef.current ? taRef.current.value : textInputState.text;
      if (_td && _td.trim()) {
        var _tmpCtxD = document.createElement("canvas").getContext("2d");
        _tmpCtxD.font = (textInputState.fontBold?"bold ":"")+textInputState.fontSize+"px -apple-system,sans-serif";
        var _mwD = _tmpCtxD.measureText(_td.trim()).width;
        var _nsD = {type:"text",x:textInputState.x,y:textInputState.y,text:_td.trim(),
          fontSize:textInputState.fontSize,fontBold:textInputState.fontBold,
          color:textInputState.color,opacity:textInputState.opacity,lineW:1,
          measuredWidth:_mwD,wrapW:textInputState.wrapW||null};
        if (textInputState.idx >= 0) {
          _curStrokes = _curStrokes.map(function(s,i){return i===textInputState.idx?_nsD:s;});
        } else {
          _curStrokes = _curStrokes.concat([_nsD]);
        }
      }
      setTextInputState(null);
    }
    
    if (drawRef.current.on && tool === "freehand" && freehandPts.current.length > 1) {
      var _fsD = {type:"freehand",pts:freehandPts.current.slice(),
        color:color,lineW:lineW,opacity:opacity};
      _curStrokes = _curStrokes.concat([_fsD]);
      freehandPts.current = [];
      drawRef.current.on = false;
    }
    strokesRef.current = _curStrokes;
    
    
    
    var _savedNow = {
      base64: (img.base64 && img.base64 !== "__ref__") ? img.base64 : null, 
      mt: img.mt || "image/png",
      id: Date.now(),
      orig_base64: (img.orig_base64 && img.orig_base64 !== "__ref__") ? img.orig_base64 : ((img.base64 && img.base64 !== "__ref__") ? img.base64 : null),
      orig_mt: img.orig_mt || img.mt,
      strokes: _curStrokes
    };
    if (img.origImageUrl) _savedNow.origImageUrl = img.origImageUrl;
    else if (img.imageUrl) _savedNow.origImageUrl = img.imageUrl;
    if (img.imageUrl) _savedNow.imageUrl = img.imageUrl;
    
    
    var _wasDirty = dirtyRef.current;
    
    var _uploadImgId = _savedNow.id;
    if (_wasDirty || !img.imageUrl) {
      _imgUploadSet(_uploadImgId, "uploading");
    }
    
    var _reflectFallback = setTimeout(function() {
      if (_imgUploadGet(_uploadImgId) === "uploading") {
        _imgUploadSet(_uploadImgId, "done");
        setTimeout(function() { _imgUploadSet(_uploadImgId, null); }, 2500);
      }
    }, 5000);
    dirtyRef.current = false;
    justSavedRef.current = true;
    onSave(_savedNow); 
    
    
    
    if (!afterPng && typeof cb === "function") {
      cb();
      
      justSavedRef.current = false;
      strokesRef.current = [];
      histRef.current = [[]];
      futRef.current = [];
    } else if (afterPng && typeof cb === "function") {
      
      justSavedRef.current = false;
      strokesRef.current = [];
      histRef.current = [[]];
      futRef.current = [];
    }
    
    
    
    
    
    if (!_wasDirty && _savedNow.base64) {
      clearTimeout(_reflectFallback);
      _stFlush(true);
      window._snFbFlushPending = true;
      if (typeof window._snFbFlushNow === "function") window._snFbFlushNow();
      setTimeout(function() { window._snFbFlushPending = false; }, 2000);
      if (afterPng && typeof cb === "function") cb();
      return;
    }
    var _capLS = { w: logicalSizeRef.current.w, h: logicalSizeRef.current.h };
    var _capBaseImg = baseImgRef.current;
    var _capStrokes = _curStrokes;
    
    var _finishPng = function(base64) {
      
      clearTimeout(_reflectFallback);
      if (base64) {
        
        var _savedFull = Object.assign({}, _savedNow, { base64: base64, mt: "image/png" });
        
        
        
        
        if (_wasDirty || !_savedNow.imageUrl) {
          delete _savedFull.imageUrl;
        }
        
        
        
        if (typeof React.startTransition === "function") {
          React.startTransition(function() { onSave(_savedFull); });
        } else {
          onSave(_savedFull);
        }
      }
      _imgUploadSet(_uploadImgId, "done");
      setTimeout(function() { _imgUploadSet(_uploadImgId, null); }, 2500);
      _stFlush(true);
      window._snFbFlushPending = true;
      if (typeof window._snFbFlushNow === "function") window._snFbFlushNow();
      setTimeout(function() { window._snFbFlushPending = false; }, 2000);
      
      if (afterPng && typeof cb === "function") cb();
    };
    var _pngWork = function() {
      var _expC, _expCtx;
      try {
        if (_capLS.w > 0 && _capBaseImg) {
          _expC = document.createElement("canvas");
          _expC.width = _capLS.w;
          _expC.height = _capLS.h;
          _expCtx = _expC.getContext("2d");
          _expCtx.imageSmoothingEnabled = true;
          _expCtx.imageSmoothingQuality = "high";
          _expCtx.drawImage(_capBaseImg, 0, 0, _capLS.w, _capLS.h);
          _capStrokes.forEach(function(s) { drawStroke(_expCtx, s); });
        }
      } catch(e) {
        console.warn("[Annotator] PNG draw failed:", e);
        _finishPng(null);
        return;
      }
      if (!_expC) { _finishPng(null); return; }
      
      
      
      try {
        if (_expC.toBlob) {
          _expC.toBlob(function(blob) {
            if (!blob) { _finishPng(null); return; }
            var _fr = new FileReader();
            _fr.onload = function() {
              var _b64 = String(_fr.result || "").split(",")[1] || null;
              _finishPng(_b64);
            };
            _fr.onerror = function() { _finishPng(null); };
            _fr.readAsDataURL(blob);
          }, "image/png");
          return;
        }
        _finishPng(_expC.toDataURL("image/png").split(",")[1]);
      } catch(e) {
        console.warn("[Annotator] async PNG encode failed:", e);
        _finishPng(null);
      }
    };
    
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        _pngWork();
      });
    });
  };
  
  doneRef.current = done;
  
  
  var triggerNavSave = function(fn) {
    if (navSaving) return; 
    navPendingFnRef.current = fn;
    setNavSaving(true);
  };

  
  var selUI = selBounds && canvasRef.current ? function () {
    try {
      var rect = canvasRef.current.getBoundingClientRect();
      if (!rect || !rect.width) return null;
      
      var _ls2 = logicalSizeRef.current;
      var sw = rect.width / _ls2.w,
        sh = rect.height / _ls2.h;
      var ts = function ts(cx, cy) {
        return {
          x: rect.left + cx * sw,
          y: rect.top + cy * sh
        };
      };
      var x = selBounds.x,
        y = selBounds.y,
        w = selBounds.w,
        h = selBounds.h;
      var tl = ts(x, y),
        tr = ts(x + w, y),
        bl = ts(x, y + h),
        br = ts(x + w, y + h);
      var tm = ts(x + w / 2, y),
        bm = ts(x + w / 2, y + h),
        ml = ts(x, y + h / 2),
        mr = ts(x + w, y + h / 2);
      var HS = IS_TOUCH ? 14 : 10;
      var HNDLS = [_objectSpread(_objectSpread({
        id: "tl"
      }, tl), {}, {
        cur: "nwse-resize"
      }), _objectSpread(_objectSpread({
        id: "tm"
      }, tm), {}, {
        cur: "ns-resize"
      }), _objectSpread(_objectSpread({
        id: "tr"
      }, tr), {}, {
        cur: "nesw-resize"
      }), _objectSpread(_objectSpread({
        id: "ml"
      }, ml), {}, {
        cur: "ew-resize"
      }), _objectSpread(_objectSpread({
        id: "mr"
      }, mr), {}, {
        cur: "ew-resize"
      }), _objectSpread(_objectSpread({
        id: "bl"
      }, bl), {}, {
        cur: "nesw-resize"
      }), _objectSpread(_objectSpread({
        id: "bm"
      }, bm), {}, {
        cur: "s-resize"
      }), _objectSpread(_objectSpread({
        id: "br"
      }, br), {}, {
        cur: "nwse-resize"
      })];
      var bwS = tr.x - tl.x,
        bhS = bl.y - tl.y;
      var barL = Math.max(8, Math.min(tl.x + bwS / 2 - 175, window.innerWidth - 30));
      var barT = Math.max(66, tl.y - 56);
      var CC = ["#E53935", "#FF6F00", "#F9A825", "#2E7D32", "#1565C0", "#6A1B9A", "#ffffff", "#000000"];
      return {
        tl: tl,
        tr: tr,
        bl: bl,
        br: br,
        tm: tm,
        bm: bm,
        ml: ml,
        mr: mr,
        HS: HS,
        HNDLS: HNDLS,
        bwS: bwS,
        bhS: bhS,
        barL: barL,
        barT: barT,
        CC: CC
      };
    } catch (e) {
      return null;
    }
  }() : null;
  var TOOLS = [{
    id: "pan",
    label: "✋移動"
  }, {
    id: "line",
    label: "直線"
  }, {
    id: "dotted",
    label: "点線"
  }, {
    id: "arrow",
    label: "矢印"
  }, {
    id: "rect",
    label: "四角"
  }, {
    id: "marker",
    label: "マーカー"
  }, {
    id: "freehand",
    label: "フリー"
  }, {
    id: "text",
    label: "Tテキスト"
  }, {
    id: "lasso",
    label: "選択・変形"
  }, {
    id: "eraser",
    label: "消しゴム"
  }];
  var WIDTHS = [1, 3, 6, 12];
  var OPACS = [0.25, 0.5, 0.75, 1];
  var TS = {
    padding: "5px 7px",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap"
  };
  var switchTool = function switchTool(t) {
    setTool(t);
    if (t !== "lasso") {
      setSelIdxs(new Set());
      setSelBounds(null);
      rebuild(strokesRef.current);
    }
    if (t !== "pan") stopJoystick();
    
    if (DRAW_TOOLS[t]) {
      var p = toolPrefsRef.current[t];
      if (p) {
        if (typeof p.color === "string") setColor(p.color);
        if (typeof p.lineW === "number") setLineW(p.lineW);
        if (typeof p.opacity === "number") setOpacity(p.opacity);
        if (t === "text") {
          if (typeof p.fontSize === "number") { setFontSize(p.fontSize); setFontSizeStr(String(p.fontSize)); }
          if (typeof p.fontBold === "boolean") setFontBold(p.fontBold);
        }
      } else {
        
        if (t === "marker") { setLineW(3); setOpacity(0.7); }
        else { setLineW(2); setOpacity(1); }
      }
    }
  };
  
  var TB = function(active, bg, fg) {
    return { padding: IS_TOUCH ? "3px 5px" : "4px 7px", fontSize: IS_TOUCH ? 10 : 11,
      fontWeight: 700, borderRadius: 4, border: "none", cursor: "pointer",
      whiteSpace: "nowrap", flexShrink: 0,
      background: active ? (bg||"#6366F1") : "#2a2a2a",
      color: active ? (fg||"#fff") : "#aaa" };
  };
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.94)",
      zIndex: 10000,
      display: "flex",
      flexDirection: "column",
      
      touchAction: "pinch-zoom",
      
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    }
  }, React.createElement("div", {
    style: { background: "#111", flexShrink: 0, touchAction: "none" },
    onTouchStart: function(e){ if(e.touches.length>=2) e.stopPropagation(); },
    onTouchMove: function(e){ if(e.touches.length>=2){ e.stopPropagation(); e.preventDefault(); } },
    onTouchEnd: function(e){ e.stopPropagation(); }
  },
  
  React.createElement("div", {
    style: { display:"flex", flexDirection:"column", borderBottom:"1px solid #1e1e1e" }
  },
    
    IS_TOUCH
      ? React.createElement(React.Fragment, null,
          React.createElement("div", {
            style:{ display:"flex", alignItems:"center",
              borderBottom:"1px solid #1a1a1a", minHeight:36 }
          },
            
            React.createElement("div", {
              style:{ display:"flex", gap:3, padding:"4px 6px",
                overflowX:"auto", WebkitOverflowScrolling:"touch",
                flexShrink:1, flexGrow:1, alignItems:"center",
                scrollbarWidth:"none" }
            },
              TOOLS.map(function(t){
                var isActive = tool===t.id;
                var acBg = t.id==="eraser"?"#E65100":t.id==="lasso"?"#007AFF":t.id==="text"?"#D4AC0D":"#6366F1";
                var acFg = t.id==="text"?"#1a1a1a":"#fff";
                return React.createElement("button",{
                  key:t.id,
                  onClick:function(){ switchTool(t.id); },
                  style: Object.assign({}, TB(isActive, acBg, acFg), { flexShrink:0 })
                }, t.label);
              }),
              React.createElement("button", {
                onClick: function(){ setHoriz(function(h){ return !h; }); },
                style: Object.assign({}, TB(horiz,"#D4AC0D","#1a1a1a"), { flexShrink:0, marginLeft:3 })
              }, "\u27FA")
            ),
            
            React.createElement("div", {
              style:{ display:"flex", gap:3, padding:"4px 6px 4px 0", flexShrink:0 }
            },
              React.createElement("button", {
                onClick: function(){
                  setCancelConfirm(true);
                },
                style: Object.assign({}, TB(false,"#444","#ccc"), { flexShrink:0 })
              }, "\u30AD\u30E3\u30F3\u30BB\u30EB"),
              React.createElement("button", {
                onClick: function(){ done(onClose); },
                style: Object.assign({}, TB(true,"#6366F1","#fff"), { padding:"4px 10px", flexShrink:0 })
              }, "\u2713\u4FDD\u5B58")
            )
          )
        )
      : 
        React.createElement("div", {
          style:{ display:"flex", flexWrap:"nowrap", gap:6, alignItems:"center",
            padding:"8px 16px", justifyContent:"center" }
        },
          React.createElement("div", {
            style:{ display:"flex", flexWrap:"wrap", gap:5, flex:"1 1 auto" }
          },
            TOOLS.map(function(t){
              var isActive = tool===t.id;
              var acBg = t.id==="eraser"?"#E65100":t.id==="lasso"?"#007AFF":t.id==="text"?"#D4AC0D":"#6366F1";
              var acFg = t.id==="text"?"#1a1a1a":"#fff";
              return React.createElement("button",{
                key:t.id,
                onClick:function(){ switchTool(t.id); },
                style: TB(isActive, acBg, acFg)
              }, t.label);
            })
          ),
          React.createElement("button", {
            onClick: function(){ setHoriz(function(h){ return !h; }); },
            style: Object.assign({}, TB(horiz,"#D4AC0D","#1a1a1a"), { marginLeft:6 })
          }, "\u27FA\u6C34\u5E73"),
          React.createElement("div", {
            style:{ display:"flex", gap:3, marginLeft:8, flexShrink:0 }
          },
            React.createElement("button", {
              onClick: function(){
                if(histRef.current.length > 1 || textInputState){ setCancelConfirm(true); } else { onClose(); }
              },
              style: TB(false,"#444","#ccc")
            }, "\u30AD\u30E3\u30F3\u30BB\u30EB"),
            React.createElement("button", {
              onClick: function(){ done(onClose); },
              style: Object.assign({}, TB(true,"#6366F1","#fff"), { padding:"6px 14px" })
            }, "\u2713\u4FDD\u5B58")
          )
        )
  ),
  
  React.createElement("div", {
    style: { display:"flex", gap: IS_TOUCH ? 4 : 12, alignItems:"center",
      padding: IS_TOUCH ? "4px 6px" : "8px 16px",
      overflowX: IS_TOUCH ? "auto" : "visible",
      WebkitOverflowScrolling:"touch",
      justifyContent: IS_TOUCH ? "flex-start" : "center",
      touchAction:"pan-x" }
  },
    
    React.createElement(ColorPicker, {
      value:color, onChange:setColor, history:colorHist,
      onHistory:function(c){ setColorHist(function(h){ return [c].concat(h.filter(function(x){return x!==c;})).slice(0,16); }); },
      quickColors:quickColors, onQuickColors:setQuickColorsAndSave
    }),
    React.createElement("div",{style:{width:1,height:20,background:"#333",flexShrink:0}}),
    
    React.createElement("div",{style:{display:"flex",gap:4,alignItems:"center",flexShrink:0}},
      React.createElement("span",{style:{fontSize:10,color:"#666"}},"線"),
      React.createElement("span",{
        onClick:function(){ var s=tool==="marker"?.5:1,mn=tool==="marker"?.5:1; setLineW(function(v){return Math.max(mn,Math.round((v-s)*10)/10);}); },
        style:{padding:"2px 7px",borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:700,background:"#2a2a2a",color:"#fff",userSelect:"none"}
      },"\u2212"),
      React.createElement("span",{style:{fontSize:11,color:"#aaa",minWidth:26,textAlign:"center"}},lineW+"px"),
      React.createElement("span",{
        onClick:function(){ var s=tool==="marker"?.5:1,mx=tool==="marker"?15:30; setLineW(function(v){return Math.min(mx,Math.round((v+s)*10)/10);}); },
        style:{padding:"2px 7px",borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:700,background:"#2a2a2a",color:"#fff",userSelect:"none"}
      },"+")
    ),
    React.createElement("div",{style:{width:1,height:20,background:"#333",flexShrink:0}}),
    
    React.createElement("div",{style:{display:"flex",gap:4,alignItems:"center",flexShrink:0}},
      React.createElement("span",{style:{fontSize:10,color:"#666"}},"濃"),
      React.createElement("span",{
        onClick:function(){ setOpacity(function(v){return Math.max(.05,Math.round((v-.1)*10)/10);}); },
        style:{padding:"2px 7px",borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:700,background:"#2a2a2a",color:"#fff",userSelect:"none"}
      },"\u2212"),
      React.createElement("span",{style:{fontSize:11,color:"#aaa",minWidth:32,textAlign:"center"}},Math.round(opacity*100)+"%"),
      React.createElement("span",{
        onClick:function(){ setOpacity(function(v){return Math.min(1,Math.round((v+.1)*10)/10);}); },
        style:{padding:"2px 7px",borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:700,background:"#2a2a2a",color:"#fff",userSelect:"none"}
      },"+")
    ),
    React.createElement("div",{style:{width:1,height:20,background:"#333",flexShrink:0}}),
    
    React.createElement("div",{style:{display:"flex",gap:4,alignItems:"center",flexShrink:0}},
      React.createElement("button",{
        onClick:function(){ setZoom(function(z){return cZ(z/1.25);}); },
        style:{padding:"2px 7px",borderRadius:4,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:"#2a2a2a",color:"#fff"}
      },"\uFF0D"),
      React.createElement("span",{style:{fontSize:11,color:"#666",minWidth:36,textAlign:"center"}},Math.round(zoom*100),"%"),
      React.createElement("button",{
        onClick:function(){ setZoom(function(z){return cZ(z*1.25);}); },
        style:{padding:"2px 7px",borderRadius:4,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:"#2a2a2a",color:"#fff"}
      },"\uFF0B"),
      !IS_TOUCH && React.createElement("input",{
        type:"range",min:10,max:700,step:1,value:Math.min(Math.round(zoom*100),700),
        onChange:function(e){setZoom(Number(e.target.value)/100);},
        style:{width:120,accentColor:"#6366F1",cursor:"pointer"}
      }),
      React.createElement("button",{
        onClick:function(){ setZoom(1); setPan({x:0,y:0}); },
        style:{padding:"2px 7px",borderRadius:4,border:"none",cursor:"pointer",fontSize:11,background:"#2a2a2a",color:"#888"}
      },"fit"),
      IS_TOUCH && React.createElement("button",{
        onClick: toggleJoystickVisible,
        title: joystickVisible ? "ジョイスティックを隠す" : "ジョイスティックを表示",
        style:{padding:"2px 7px",borderRadius:4,border:"none",cursor:"pointer",fontSize:13,
          background: joystickVisible ? "#3a3a3a" : "#1a1a1a",
          color: joystickVisible ? "#FFA500" : "#666"}
      }, "🕹")
    ),
    
    (onPrev||onNext) && React.createElement(React.Fragment, null,
      React.createElement("div",{style:{width:1,height:20,background:"#333",flexShrink:0}}),
      React.createElement("div",{style:{display:"flex",gap:3,alignItems:"center",flexShrink:0}},
        React.createElement("button",{
          onClick:onPrev?function(){triggerNavSave(onPrev);}:undefined, disabled:!onPrev,
          style:{padding:"3px 9px",borderRadius:4,border:"none",cursor:onPrev?"pointer":"default",fontSize:15,fontWeight:700,background:"#2a2a2a",color:onPrev?"#fff":"#444"}
        },"\u2191"),
        navLabel && React.createElement("span",{style:{fontSize:10,color:"#555",minWidth:24,textAlign:"center"}},navLabel),
        React.createElement("button",{
          onClick:onNext?function(){triggerNavSave(onNext);}:undefined, disabled:!onNext,
          style:{padding:"3px 9px",borderRadius:4,border:"none",cursor:onNext?"pointer":"default",fontSize:15,fontWeight:700,background:"#2a2a2a",color:onNext?"#fff":"#444"}
        },"\u2193")
      )
    ),
    
    (onPrevItem||onNextItem) && React.createElement(React.Fragment, null,
      React.createElement("div",{style:{width:1,height:20,background:"#333",flexShrink:0}}),
      React.createElement("div",{style:{display:"flex",gap:4,alignItems:"center",flexShrink:0}},
        onPrevItem && React.createElement("button",{
          onClick:function(){ triggerNavSave(onPrevItem); },
          title:"前の記事",
          style:{padding:"3px 9px",borderRadius:4,border:"1px solid rgba(126,196,255,.4)",cursor:"pointer",
            fontSize:15,fontWeight:700,background:"#1a3a52",color:"#7ec4ff",flexShrink:0}
        },"←"),
        itemNavLabel && React.createElement("span",{style:{fontSize:10,color:"#7ec4ff",flexShrink:0,padding:"2px 6px",background:"#1a3a52",borderRadius:3}},itemNavLabel),
        onNextItem && React.createElement("button",{
          onClick:function(){ triggerNavSave(onNextItem); },
          title:"次の記事",
          style:{padding:"3px 9px",borderRadius:4,border:"1px solid rgba(126,196,255,.4)",cursor:"pointer",
            fontSize:15,fontWeight:700,background:"#1a3a52",color:"#7ec4ff",flexShrink:0}
        },"→")
      )
    )
  )
  ), React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      touchAction: "none"
    },
    onWheel: onWheel,
    onTouchStart: function(e) {
      
      
      if (e.target === canvasRef.current) return;
      if (e.touches.length === 2) {
        
        multiTouchSeenRef.current = true;  
        var dx = e.touches[0].clientX - e.touches[1].clientX,
          dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = {
          d: Math.hypot(dx, dy), z: zoom, px: pan.x, py: pan.y,
          mx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          my: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
        e.preventDefault();
      } else if (e.touches.length === 1) {
        
        panRef.current = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, px: pan.x, py: pan.y };
        e.preventDefault();
      }
    },
    onTouchMove: function(e) {
      if (e.target === canvasRef.current) return;
      if (e.touches.length >= 2) multiTouchSeenRef.current = true;  
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        var dx = e.touches[0].clientX - e.touches[1].clientX,
          dy = e.touches[0].clientY - e.touches[1].clientY;
        var d = Math.hypot(dx, dy),
          mx = (e.touches[0].clientX + e.touches[1].clientX) / 2,
          my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        setZoom(cZ(pinchRef.current.z * (d / pinchRef.current.d)));
        setPan({ x: pinchRef.current.px + (mx - pinchRef.current.mx), y: pinchRef.current.py + (my - pinchRef.current.my) });
      } else if (e.touches.length === 1 && panRef.current) {
        e.preventDefault();
        var t = e.touches[0];
        setPan({ x: panRef.current.px + (t.clientX - panRef.current.sx), y: panRef.current.py + (t.clientY - panRef.current.sy) });
      }
    },
    onTouchEnd: function(e) {
      if (e.target === canvasRef.current) return;
      pinchRef.current = null;
      panRef.current = null;
      
      if (e.touches.length === 0) multiTouchSeenRef.current = false;
    }
  }, React.createElement("div", {
    style: {
      position: "relative",
      width: dispW,
      height: dispH,
      transform: "translate(".concat(pan.x, "px,").concat(pan.y, "px) scale(").concat(zoom, ")"),
      transformOrigin: "center center",
      flexShrink: 0
    }
  },
    React.createElement("img", {
      src: imgSrcState || "",
      draggable: false,
      style: {
        position: "absolute", inset: 0,
        width: dispW, height: dispH,
        display: imgSrcState ? "block" : "none",
        borderRadius: 4,
        userSelect: "none",
        pointerEvents: "none"
      },
      alt: ""
    }),
    React.createElement("canvas", {
      ref: canvasRef,
      style: {
        position: "absolute", inset: 0,
        width: dispW, height: dispH, display: "block", borderRadius: 4,
        imageRendering: "auto",
        cursor: tool === "pan" ? "grab" : tool === "eraser" ? "cell" : tool === "lasso" ? "default" : "crosshair",
        touchAction: "none"
      },
      onContextMenu: function(e) { e.preventDefault(); },
      onMouseMove: function(e) {
        
        if (bothBtnPanRef.current || ctrlPanRef.current) {
          e.currentTarget.style.cursor = "grabbing";
        } else if (e.ctrlKey || e.metaKey) {
          e.currentTarget.style.cursor = "grab";
        } else if (e.buttons === 3) {
          e.currentTarget.style.cursor = "grab";
        } else {
          
          e.currentTarget.style.cursor = tool === "pan" ? "grab" : tool === "eraser" ? "cell" : tool === "lasso" ? "default" : "crosshair";
        }
      },
      onMouseDown: function(e) {
        
        
        if (pinchRef.current) return;
        if (multiTouchSeenRef.current) return;
        
        if (e.buttons === 3) {
          e.preventDefault();
          drawRef.current = { on: false };
          ctrlPanRef.current = null;
          panRef.current = null;
          bothBtnPanRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
          var _mmH2 = function(ev) { _mHandlers.current.mv && _mHandlers.current.mv(ev); };
          var _muH2 = function(ev) {
            _mHandlers.current.up && _mHandlers.current.up(ev);
            document.removeEventListener("mousemove", _mmH2);
            document.removeEventListener("mouseup", _muH2);
          };
          document.addEventListener("mousemove", _mmH2);
          document.addEventListener("mouseup", _muH2);
          return;
        }
        onStart(e);
        
        
        var _mmH = function(ev) { _mHandlers.current.mv && _mHandlers.current.mv(ev); };
        var _muH = function(ev) {
          _mHandlers.current.up && _mHandlers.current.up(ev);
          document.removeEventListener("mousemove", _mmH);
          document.removeEventListener("mouseup", _muH);
        };
        document.addEventListener("mousemove", _mmH);
        document.addEventListener("mouseup", _muH);
      }
    }),
    React.createElement("canvas", {
      ref: overlayCanvasRef,
      style: {
        position: "absolute", inset: 0, width: dispW, height: dispH,
        display: "block", borderRadius: 4, imageRendering: "auto", pointerEvents: "none"
      }
    })
  ), onPrev && React.createElement("button", {
    onMouseDown: function onMouseDown(e) { e.stopPropagation(); },
    onTouchStart: function onTouchStart(e) { e.stopPropagation(); },
    onClick: function onClick() { triggerNavSave(onPrev); },
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      width: 44,
      height: 64,
      borderRadius: 8,
      background: "rgba(0,0,0,.35)",
      border: "none",
      color: "#fff",
      fontSize: 26,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10
    }
  }, "\u2039"), onNext && React.createElement("button", {
    onMouseDown: function onMouseDown(e) { e.stopPropagation(); },
    onTouchStart: function onTouchStart(e) { e.stopPropagation(); },
    onClick: function onClick() { triggerNavSave(onNext); },
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      width: 44,
      height: 64,
      borderRadius: 8,
      background: "rgba(0,0,0,.35)",
      border: "none",
      color: "#fff",
      fontSize: 26,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10
    }
  }, "\u203A")),
  
  
  IS_TOUCH && joystickVisible && React.createElement("div", {
    style: { position:"absolute", left:joystickPos.left, bottom:joystickPos.bottom, zIndex:10010, userSelect:"none", touchAction:"none" },
    onTouchStart: joystickTouchStart,
    onTouchMove: joystickTouchMove,
    onTouchEnd: joystickTouchEnd
  },
    
    React.createElement("div", {
      ref: joystickRingRef,
      style: { width:108, height:108, borderRadius:"50%",
        background:"rgba(255,255,255,0.18)",
        border:"2px solid rgba(255,255,255,0.35)",
        display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
        transition:"border 0.15s, background 0.15s" }
    },
      
      React.createElement("span",{style:{position:"absolute",top:6,left:"50%",transform:"translateX(-50%)",fontSize:14,color:"rgba(255,255,255,0.35)"}},"▲"),
      React.createElement("span",{style:{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",fontSize:14,color:"rgba(255,255,255,0.35)"}},"▼"),
      React.createElement("span",{style:{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"rgba(255,255,255,0.35)"}},"◄"),
      React.createElement("span",{style:{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"rgba(255,255,255,0.35)"}},"►"),
      
      React.createElement("div", {
        ref: joystickKnobRef,
        style: { width:44, height:44, borderRadius:"50%",
          background:"rgba(255,255,255,0.85)", boxShadow:"0 2px 12px rgba(0,0,0,0.4)",
          position:"absolute",
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          transition:"transform 0.15s ease",
          pointerEvents:"none", display:"flex", alignItems:"center", justifyContent:"center" }
      },
        React.createElement("span",{style:{fontSize:18,color:"rgba(0,0,0,0.35)"}},"✋")
      )
    )
  ),
  React.createElement("div", {
    style: Object.assign(
      undoRedoPos
        ? { position:"fixed", top: undoRedoPos.top, right: undoRedoPos.right }
        : { position:"fixed", top: IS_TOUCH ? 116 : 70, right: 8 },
      { zIndex: 10004, display:"flex", flexDirection:"column",
        alignItems:"flex-end", pointerEvents:"none", userSelect:"none", touchAction:"none" }
    )
  },
    React.createElement("div", {
      style: { display:"flex", borderRadius:8, overflow:"hidden",
        border:"1px solid rgba(255,255,255,0.15)",
        boxShadow:"0 2px 12px rgba(0,0,0,0.4)", background:"rgba(30,30,30,0.92)",
        pointerEvents:"auto",
        cursor: IS_TOUCH ? "default" : "grab" }
    },
      
      React.createElement("div", {
        onPointerDown: function(e) {
          e.stopPropagation(); e.preventDefault();
          var el = e.currentTarget;
          var pid = e.pointerId;
          var rect = el.parentNode.getBoundingClientRect();
          var isTouch = e.pointerType === "touch";
          
          var state = {
            startX: e.clientX, startY: e.clientY,
            startTop: rect.top, startRight: window.innerWidth - rect.right,
            active: !isTouch, timer: null, pointerId: pid, el: el
          };
          undoRedoDragRef.current = state;
          try { el.setPointerCapture(pid); } catch(_){}
          if (isTouch) {
            state.timer = setTimeout(function() {
              if (undoRedoDragRef.current === state) state.active = true;
            }, 400);
          }
        },
        onPointerMove: function(e) {
          var s = undoRedoDragRef.current;
          if (!s || !s.active) return;
          e.stopPropagation(); e.preventDefault();
          setUndoRedoPos({
            top: Math.max(0, s.startTop + e.clientY - s.startY),
            right: Math.max(0, s.startRight - (e.clientX - s.startX))
          });
        },
        onPointerUp: function(e) {
          var s = undoRedoDragRef.current;
          if (s) {
            if (s.timer) clearTimeout(s.timer);
            try { s.el && s.el.releasePointerCapture(s.pointerId); } catch(_){}
          }
          undoRedoDragRef.current = null;
        },
        onPointerCancel: function(e) {
          var s = undoRedoDragRef.current;
          if (s) {
            if (s.timer) clearTimeout(s.timer);
            try { s.el && s.el.releasePointerCapture(s.pointerId); } catch(_){}
          }
          undoRedoDragRef.current = null;
        },
        style: { width: IS_TOUCH ? 20 : 14, background:"rgba(255,255,255,0.06)",
          cursor: "grab",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: IS_TOUCH ? 11 : 9, color:"rgba(255,255,255,0.3)", letterSpacing:1,
          touchAction:"none" }
      }, "\u22EF"),
      React.createElement("button", {
        onClick: undo, disabled: !canUndo,
        onMouseDown: function(e){ e.stopPropagation(); },
        onTouchStart: function(e){ e.stopPropagation(); },
        style: { width: IS_TOUCH ? 52 : 44, height: IS_TOUCH ? 34 : 28,
          border:"none", borderLeft:"1px solid rgba(255,255,255,0.1)",
          borderRight:"1px solid rgba(255,255,255,0.1)",
          background: canUndo ? "rgba(255,255,255,0.1)" : "transparent",
          color: canUndo ? "#fff" : "rgba(255,255,255,0.2)",
          fontSize: IS_TOUCH ? 18 : 15, cursor: canUndo ? "pointer" : "default",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background .15s, color .15s" }
      }, "\u21A9"),
      React.createElement("button", {
        onClick: redo, disabled: !canRedo,
        onMouseDown: function(e){ e.stopPropagation(); },
        onTouchStart: function(e){ e.stopPropagation(); },
        style: { width: IS_TOUCH ? 52 : 44, height: IS_TOUCH ? 34 : 28,
          border:"none",
          background: canRedo ? "rgba(255,255,255,0.1)" : "transparent",
          color: canRedo ? "#fff" : "rgba(255,255,255,0.2)",
          fontSize: IS_TOUCH ? 18 : 15, cursor: canRedo ? "pointer" : "default",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background .15s, color .15s" }
      }, "\u21AA")
    )
  ),
  selUI && React.createElement(React.Fragment, null, ReactDOM.createPortal(React.createElement("svg", {
    style: {
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 10002,
      overflow: "visible"
    }
  }, React.createElement("rect", {
    x: selUI.tl.x,
    y: selUI.tl.y,
    width: selUI.bwS,
    height: selUI.bhS,
    fill: "rgba(0,122,255,.06)",
    stroke: "#007AFF",
    strokeWidth: 1.5,
    strokeDasharray: "7 3"
  }), selUI.HNDLS.map(function (h) {
    return React.createElement("rect", {
      key: h.id,
      x: h.x - selUI.HS / 2,
      y: h.y - selUI.HS / 2,
      width: selUI.HS,
      height: selUI.HS,
      fill: "white",
      stroke: "#007AFF",
      strokeWidth: 1.5,
      rx: 2,
      style: {
        cursor: h.cur,
        pointerEvents: "all"
      },
      onMouseDown: function onMouseDown(ev) {
        return startResize(h.id, ev);
      },
      onTouchStart: function onTouchStart(ev) {
        return startResize(h.id, ev);
      }
    });
  }), React.createElement("foreignObject", {
    x: selUI.tr.x - 2,
    y: selUI.tl.y - 28,
    width: 30,
    height: 30,
    style: {
      overflow: "visible",
      pointerEvents: "all"
    }
  }, React.createElement("div", {
    xmlns: "http://www.w3.org/1999/xhtml",
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      return e.stopPropagation();
    },
    onClick: deleteSelected,
    style: {
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: "#ff3b30",
      color: "#fff",
      fontSize: 14,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: "2px solid #fff",
      boxSizing: "border-box",
      userSelect: "none",
      lineHeight: 1
    }
  }, "\u2715"))), document.body), ReactDOM.createPortal(React.createElement("div", {
    style: {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      top: selUI.barT,
      zIndex: 10003,
      display: "flex",
      gap: 5,
      alignItems: "center",
      background: "rgba(18,18,18,.96)",
      borderRadius: 12,
      padding: "7px 10px",
      boxShadow: "0 6px 28px rgba(0,0,0,.7)",
      maxWidth: "calc(100vw - 16px)",
      overflowX: "auto",
      overflowY: "hidden",
      WebkitOverflowScrolling: "touch"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#888",
      marginRight: 1
    }
  }, "\u8272"), selUI.CC.map(function (c) {
    return React.createElement("span", {
      key: c,
      onMouseDown: function onMouseDown(e) {
        return e.stopPropagation();
      },
      onTouchStart: function onTouchStart(e) {
        return e.stopPropagation();
      },
      onClick: function onClick() {
        return changeSelectedColor(c);
      },
      style: {
        width: IS_TOUCH ? 24 : 20,
        height: IS_TOUCH ? 24 : 20,
        borderRadius: "50%",
        background: c,
        cursor: "pointer",
        border: "1.5px solid rgba(255,255,255,.2)",
        flexShrink: 0
      }
    });
  }), React.createElement("label", {
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      return e.stopPropagation();
    },
    style: {
      cursor: "pointer",
      width: IS_TOUCH ? 24 : 20,
      height: IS_TOUCH ? 24 : 20,
      borderRadius: "50%",
      background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)",
      border: "1.5px solid rgba(255,255,255,.25)",
      display: "block",
      flexShrink: 0,
      position: "relative"
    }
  }, React.createElement("input", {
    type: "color",
    onChange: function onChange(e) {
      return changeSelectedColor(e.target.value);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  })), React.createElement("div", {
    style: {
      width: 1,
      height: 18,
      background: "#444",
      margin: "0 2px"
    }
  }), React.createElement("button", {
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      return e.stopPropagation();
    },
    onClick: duplicateSelected,
    style: {
      padding: IS_TOUCH ? "7px 10px" : "5px 8px",
      fontSize: IS_TOUCH ? 13 : 11,
      fontWeight: 600,
      background: "#333",
      color: "#ccc",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }, "\u8907\u88FD"), React.createElement("button", {
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      return e.stopPropagation();
    },
    onClick: deleteSelected,
    style: {
      padding: IS_TOUCH ? "7px 10px" : "5px 8px",
      fontSize: IS_TOUCH ? 13 : 11,
      fontWeight: 700,
      background: "#ff3b30",
      color: "#fff",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }, "\u524A\u9664"), React.createElement("button", {
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      return e.stopPropagation();
    },
    onClick: clearSelection,
    style: {
      padding: IS_TOUCH ? "5px 6px" : "4px 5px",
      fontSize: IS_TOUCH ? 13 : 11,
      background: "#2a2a2a",
      color: "#666",
      border: "none",
      borderRadius: 7,
      cursor: "pointer"
    }
  }, "\u2715")), document.body)), textInputState && canvasRef.current && (function(){
  var _c=canvasRef.current, _r=_c.getBoundingClientRect();
  
  var _sc=_r.width/(logicalSizeRef.current.w || _c.width);
  var _sx=_r.left+textInputState.x*_sc, _sy=_r.top+textInputState.y*_sc;
  var _sw=(textInputState.wrapW||400)*_sc;
  var _fsSc=textInputState.fontSize*_sc;
  var _QC=['#E05252','#F07A30','#F5C842','#4CAF50','#4A90D9','#7C3AED','#FFFFFF','#1A1A1A'];
  var _hdBase={position:'absolute',width:10,height:10,background:'#fff',
    border:'1.5px solid #4a90d9',borderRadius:2,zIndex:2,boxSizing:'border-box'};

  function _doConfirm(e){
    if(e){e.preventDefault();e.stopPropagation();}
    if(taRef.current) textInputState.text=taRef.current.value;
    confirmText();
  }
  function _doCancel(e){
    if(e){e.preventDefault();e.stopPropagation();}
    if(textInputState.idx>=0) rebuild(strokesRef.current);
    setTextInputState(null);
  }
  function _doDelete(e){
    if(e){e.preventDefault();e.stopPropagation();}
    if(textInputState.idx>=0){
      var _ns=strokesRef.current.filter(function(_,i){return i!==textInputState.idx;});
      strokesRef.current=_ns;commit(_ns);rebuild(_ns);
    }
    setTextInputState(null);
  }
  function _doDuplicate(e){
    if(e){e.preventDefault();e.stopPropagation();}
    var _t=taRef.current?taRef.current.value:textInputState.text;
    if(!_t||!_t.trim()) return;
    var _tmpCtx=document.createElement('canvas').getContext('2d');
    _tmpCtx.font=(textInputState.fontBold?'bold ':'')+textInputState.fontSize+'px -apple-system,sans-serif';
    var _mw=_tmpCtx.measureText(_t.trim()).width;
    var _orig={type:'text',x:textInputState.x,y:textInputState.y,text:_t.trim(),
      fontSize:textInputState.fontSize,fontBold:textInputState.fontBold,
      color:textInputState.color,opacity:textInputState.opacity,lineW:1,measuredWidth:_mw,wrapW:textInputState.wrapW};
    var _dup=Object.assign({},_orig,{x:_orig.x+20,y:_orig.y+20});
    var _ns;
    if(textInputState.idx>=0){
      _ns=strokesRef.current.map(function(s,i){return i===textInputState.idx?_orig:s;}).concat([_dup]);
    } else {
      _ns=strokesRef.current.concat([_orig,_dup]);
    }
    strokesRef.current=_ns;commit(_ns);rebuild(_ns);
    setTextInputState(null);
  }
  function _startResizeL(e){
    e.preventDefault();e.stopPropagation();
    var _x0=e.clientX,_ow=textInputState.wrapW,_ox=textInputState.x;
    function _mv(ev){var _d=(ev.clientX-_x0)/_sc;var _nw=Math.max(60,_ow-_d);setTextInputState(function(s){return Object.assign({},s,{wrapW:_nw,x:_ox+(_ow-_nw)});});}
    function _up(){document.removeEventListener('mousemove',_mv);document.removeEventListener('mouseup',_up);}
    document.addEventListener('mousemove',_mv);document.addEventListener('mouseup',_up);
  }
  function _startResizeR(e){
    e.preventDefault();e.stopPropagation();
    var _x0=e.clientX,_ow=textInputState.wrapW;
    function _mv(ev){var _d=(ev.clientX-_x0)/_sc;var _nw=Math.max(60,_ow+_d);setTextInputState(function(s){return Object.assign({},s,{wrapW:_nw});});}
    function _up(){document.removeEventListener('mousemove',_mv);document.removeEventListener('mouseup',_up);}
    document.addEventListener('mousemove',_mv);document.addEventListener('mouseup',_up);
  }
  function _startResizeLT(e){
    e.preventDefault();e.stopPropagation();
    var _t=e.touches[0].clientX,_ow=textInputState.wrapW,_ox=textInputState.x;
    function _tv(ev){var _d=(ev.touches[0].clientX-_t)/_sc;var _nw=Math.max(60,_ow-_d);setTextInputState(function(s){return Object.assign({},s,{wrapW:_nw,x:_ox+(_ow-_nw)});});}
    function _te(){document.removeEventListener('touchmove',_tv);document.removeEventListener('touchend',_te);}
    document.addEventListener('touchmove',_tv,{passive:false});document.addEventListener('touchend',_te);
  }
  function _startResizeRT(e){
    e.preventDefault();e.stopPropagation();
    var _t=e.touches[0].clientX,_ow=textInputState.wrapW;
    function _tv(ev){var _d=(ev.touches[0].clientX-_t)/_sc;var _nw=Math.max(60,_ow+_d);setTextInputState(function(s){return Object.assign({},s,{wrapW:_nw});});}
    function _te(){document.removeEventListener('touchmove',_tv);document.removeEventListener('touchend',_te);}
    document.addEventListener('touchmove',_tv,{passive:false});document.addEventListener('touchend',_te);
  }

  var _tbLeft=Math.min(Math.max(_sx,4), window.innerWidth-380);
  var _tbTop=Math.max(8,_sy-52);

  return ReactDOM.createPortal(
    React.createElement('div',{style:{position:'fixed',inset:0,zIndex:10010,pointerEvents:'none'}},

    
    React.createElement('div',{
      style:{position:'absolute',left:_tbLeft,top:_tbTop,pointerEvents:'auto',
        display:'flex',alignItems:'center',gap:4,flexWrap:'nowrap',
        background:'rgba(20,20,20,0.97)',borderRadius:10,padding:'6px 10px',
        boxShadow:'0 4px 24px rgba(0,0,0,.7)',userSelect:'none',whiteSpace:'nowrap'},
      onMouseDown:function(e){e.stopPropagation();},
      onTouchStart:function(e){e.stopPropagation();}
    },
      
      _QC.map(function(qc){
        var _sel=qc===textInputState.color;
        return React.createElement('span',{
          key:qc,
          onClick:function(e){e.stopPropagation();setTextInputState(function(s){return Object.assign({},s,{color:qc});});},
          style:{width:IS_TOUCH?22:17,height:IS_TOUCH?22:17,borderRadius:'50%',background:qc,flexShrink:0,
            border:_sel?'2px solid #fff':'1.5px solid rgba(255,255,255,0.2)',
            outline:_sel?'2px solid #6366F1':'none',cursor:'pointer',display:'inline-block',
            boxSizing:'border-box',boxShadow:qc==='#FFFFFF'?'0 0 0 1px rgba(0,0,0,0.3)':'none'}
        });
      }),
      React.createElement('span',{style:{width:1,height:16,background:'rgba(255,255,255,0.15)',flexShrink:0,margin:'0 2px'}}),
      
      React.createElement('span',{
        onClick:function(e){e.stopPropagation();setTextInputState(function(s){return Object.assign({},s,{fontBold:!s.fontBold});});},
        style:{padding:'2px 7px',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:900,
          background:textInputState.fontBold?'#D4AC0D':'rgba(255,255,255,0.1)',
          color:textInputState.fontBold?'#1a1a1a':'#bbb',userSelect:'none'}
      },'B'),
      
      React.createElement('span',{
        onClick:function(e){e.stopPropagation();setTextInputState(function(s){return Object.assign({},s,{fontSize:Math.max(8,s.fontSize-2)});});},
        style:{padding:'2px 6px',borderRadius:4,cursor:'pointer',fontSize:13,fontWeight:700,
          background:'rgba(255,255,255,0.1)',color:'#ccc',userSelect:'none'}
      },'−'),
      React.createElement('span',{style:{fontSize:11,color:'#999',minWidth:26,textAlign:'center',userSelect:'none'}},textInputState.fontSize+'px'),
      React.createElement('span',{
        onClick:function(e){e.stopPropagation();setTextInputState(function(s){return Object.assign({},s,{fontSize:Math.min(120,s.fontSize+2)});});},
        style:{padding:'2px 6px',borderRadius:4,cursor:'pointer',fontSize:13,fontWeight:700,
          background:'rgba(255,255,255,0.1)',color:'#ccc',userSelect:'none'}
      },'+'),
      React.createElement('span',{style:{width:1,height:16,background:'rgba(255,255,255,0.15)',flexShrink:0,margin:'0 2px'}}),
      
      React.createElement('button',{
        onClick:_doDuplicate,
        style:{padding:IS_TOUCH?'5px 10px':'3px 9px',fontSize:IS_TOUCH?13:11,fontWeight:600,
          background:'rgba(255,255,255,0.12)',color:'#ccc',border:'none',borderRadius:5,cursor:'pointer'}
      },'複製'),
      
      React.createElement('button',{
        onClick:_doDelete,
        style:{padding:IS_TOUCH?'5px 10px':'3px 9px',fontSize:IS_TOUCH?13:11,fontWeight:700,
          background:'#C0392B',color:'#fff',border:'none',borderRadius:5,cursor:'pointer'}
      },'削除')
    ),

    
    React.createElement('div',{
      style:{position:'absolute',left:_sx,top:_sy,width:_sw,pointerEvents:'auto',zIndex:1},
      onMouseDown:function(e){e.stopPropagation();},
      onTouchStart:function(e){e.stopPropagation();}
    },
      React.createElement('div',{
        style:{position:'relative',border:'1.5px dashed rgba(70,130,230,0.8)',borderRadius:2,
          background:'rgba(70,130,230,0.03)'}
      },
        
        React.createElement('textarea',{
          ref:taRef,
          key:textInputState.idx+'_'+textInputState.fontSize,
          autoFocus:true,
          defaultValue:textInputState.text,
          onKeyDown:function(e){
            if(e.key==='Escape'){_doCancel(e);return;}
            e.stopPropagation();
          },
          placeholder:'',
          style:{display:'block',width:'100%',background:'transparent',
            color:textInputState.color,border:'none',outline:'none',
            padding:'4px 6px',boxSizing:'border-box',
            fontSize:_fsSc,fontWeight:textInputState.fontBold?700:400,
            fontFamily:'-apple-system,sans-serif',
            resize:'none',lineHeight:1.45,
            minHeight:Math.round(_fsSc*1.8),
            wordBreak:'break-all',whiteSpace:'pre-wrap',
            overflowX:'hidden',overflowY:'hidden',
            caretColor:textInputState.color,verticalAlign:'top'}
        }),
        
        React.createElement('div',{style:Object.assign({},_hdBase,{left:-5,top:-5,cursor:'default'})}),
        React.createElement('div',{style:Object.assign({},_hdBase,{right:-5,top:-5,cursor:'default'})}),
        React.createElement('div',{style:Object.assign({},_hdBase,{left:-5,bottom:-5,cursor:'default'})}),
        React.createElement('div',{style:Object.assign({},_hdBase,{right:-5,bottom:-5,cursor:'default'})}),
        
        React.createElement('div',{
          style:Object.assign({},_hdBase,{left:-5,top:'50%',transform:'translateY(-50%)',cursor:'ew-resize'}),
          onMouseDown:_startResizeL,onTouchStart:_startResizeLT
        }),
        
        React.createElement('div',{
          style:Object.assign({},_hdBase,{right:-5,top:'50%',transform:'translateY(-50%)',cursor:'ew-resize'}),
          onMouseDown:_startResizeR,onTouchStart:_startResizeRT
        }),
        
        React.createElement('div',{
          onClick:_doConfirm,
          style:{position:'absolute',right:-14,top:-14,width:24,height:24,borderRadius:'50%',
            background:'#E05252',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:14,fontWeight:700,cursor:'pointer',
            border:'2px solid rgba(255,255,255,0.7)',zIndex:3,userSelect:'none',lineHeight:1}
        },'\u00D7')
      )
    )
    ),
    document.body
  );
})(),
cancelConfirm && ReactDOM.createPortal(
  React.createElement('div',{
    style:{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:20000,
      display:'flex',alignItems:'center',justifyContent:'center'}
  },
    React.createElement('div',{
      style:{background:'#fff',borderRadius:14,padding:'24px 26px',maxWidth:320,width:'90%',textAlign:'center',
        boxShadow:'0 8px 40px rgba(0,0,0,.35)'}
    },
      React.createElement('div',{style:{fontSize:26,marginBottom:10}},'✎️'),
      React.createElement('div',{style:{fontSize:15,fontWeight:700,color:'#1a1a1a',marginBottom:8}},
        '書き込み画面を終了しますか？'),
      React.createElement('div',{style:{fontSize:13,color:'#555',lineHeight:1.7,marginBottom:22,whiteSpace:'pre-wrap'}},
        '現在の書き込みを保存してから終了します。'),
      React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:8}},
        React.createElement('button',{
          onClick:function(e){
            e.stopPropagation();
            done();
            setCancelConfirm(false);
            
            var _st = window.history.state;
            if (_st && _st._sn && String(_st._sn).indexOf("modal:imgannot:") === 0) {
              window._sn_internalBack = true;
              try { window.history.back(); } catch(_) { onClose(); }
            } else {
              onClose();
            }
          },
          style:{padding:'11px 0',background:'#6366F1',color:'#fff',border:'none',
            borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:700,width:'100%'}
        },'💾 保存して終了'),
        React.createElement('button',{
          onClick:function(e){e.stopPropagation();setCancelConfirm(false);},
          style:{padding:'10px 0',background:'#f5f5f5',color:'#555',border:'none',
            borderRadius:8,cursor:'pointer',fontSize:13,width:'100%'}
        },'引き続き編集')
      )
    )
  ),
  document.body
),

navSaving && ReactDOM.createPortal(
  React.createElement('div',{
    style:{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:20000,
      display:'flex',alignItems:'center',justifyContent:'center',
      pointerEvents:'all' }
  },
    React.createElement('div',{
      style:{background:'rgba(30,30,30,.92)',borderRadius:12,padding:'18px 28px',
        display:'flex',alignItems:'center',gap:12,
        boxShadow:'0 4px 24px rgba(0,0,0,.4)',color:'#fff'}
    },
      React.createElement('div',{
        style:{width:20,height:20,border:'3px solid rgba(255,255,255,.3)',
          borderTopColor:'#fff',borderRadius:'50%',
          animation:'spin 0.7s linear infinite',flexShrink:0}
      }),
      React.createElement('span',{style:{fontSize:14,fontWeight:600,letterSpacing:'.02em'}},
        '保存中…')
    )
  ),
  document.body
)
)
}


function Pill(_ref8) {
  var label = _ref8.label,
    color = _ref8.color,
    on = _ref8.on,
    onClick = _ref8.onClick,
    sm = _ref8.sm;
  var _color = _slicedToArray(color, 3),
    bg = _color[0],
    bd = _color[1],
    fg = _color[2];
  return React.createElement("span", {
    onClick: onClick,
    style: {
      display: "inline-block",
      padding: sm ? "4px 10px" : "5px 14px",
      borderRadius: 6,
      fontSize: sm ? 12 : 13,
      fontWeight: 600,
      background: on ? bg : "#fff",
      color: on ? fg : "#555",
      border: "1.5px solid " + (on ? bd : "#bbb"),
      margin: "2px",
      cursor: onClick ? "pointer" : "default",
      lineHeight: 1.4,
      userSelect: "none"
    }
  }, label);
}
