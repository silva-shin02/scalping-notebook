var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useRef = _React.useRef,
  useCallback = _React.useCallback,
  useMemo = _React.useMemo;
var IS_TOUCH = 'ontouchstart' in window;
// ダークモード（テーマ）: 端末ローカル保存。html.sn-dark へのフィルタ反転で全体を暗転（index.html の <style>）。
var _SN_THEME_KEY = "sn_theme_v1";
function _snGetTheme() {
  try { var m = localStorage.getItem(_SN_THEME_KEY); return (m === "dark" || m === "auto" || m === "light") ? m : "light"; } catch (e) { return "light"; }
}
function _snThemeIsDark(m) {
  try { return m === "dark" || (m === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches); } catch (e) { return m === "dark"; }
}
function _snApplyTheme(m) {
  try { localStorage.setItem(_SN_THEME_KEY, m); } catch (e) {}
  try {
    var de = document.documentElement;
    if (de) { if (_snThemeIsDark(m)) de.classList.add("sn-dark"); else de.classList.remove("sn-dark"); }
  } catch (e) {}
}
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
    technicals: [],
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


// \u30b7\u30b0\u30ca\u30eb\u540d: \u672b\u5c3e"OS"\u3092\u4e0b\u6bb5\u306b\u6298\u308a\u8fd4\u3057\u3066\u4e2d\u592e\u305e\u308d\u3048\u8868\u793a\uff08\u5217\u5e45\u3092\u6291\u3048\u308b\uff09\u30021\u6bb5\u76ee=\u672c\u4f53\u30fb2\u6bb5\u76ee="OS"\u3002
function _sigNameNode(t, key) {
  var s = (t == null) ? "" : String(t);
  if (s.length > 2 && s.slice(-2) === "OS") {
    return React.createElement("div", { key: key, style: { display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1, whiteSpace: "nowrap" } },
      React.createElement("span", null, s.slice(0, -2)),
      React.createElement("span", null, "OS"));
  }
  return React.createElement("div", { key: key, style: { whiteSpace: "nowrap" } }, s);
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
// 取り込み画像をWebP(q0.88)へ再エンコードして容量削減（2026-06-15）。安全策:
//  - gif/svg/既にwebp は対象外（アニメ/ベクターを壊さない）
//  - 巨大画像でcanvasがiOS上限により空に間引かれていないか、24x24縮小で原画と比較して検証（崩れたら元のまま）
//  - WebPエンコード非対応端末は元のまま / 8%以上小さくならない場合も元のまま
// 失敗時はすべて元データ(keep)を返す＝壊さない。
function _imgToWebpMaybe(dataUrl, base64, mt) {
  return new Promise(function(resolve) {
    var keep = { base64: base64, mt: mt };
    try {
      if (!mt || mt === "image/gif" || mt.indexOf("svg") >= 0) return resolve(keep);
      var im = new Image();
      im.onload = function() {
        try {
          var W = im.naturalWidth, H = im.naturalHeight;
          if (!W || !H) return resolve(keep);
          // 取り込み時に長辺をMAXEDGEまで縮小してから再エンコード＝1枚あたり容量を桁で削減（2026-06-17）。
          // 縮小でcanvasが小さくなるためiOSのcanvas上限による空き化リスクも下がる。
          var MAXEDGE = 1600;
          var _sc = Math.max(W, H) > MAXEDGE ? MAXEDGE / Math.max(W, H) : 1;
          var TW = Math.max(1, Math.round(W * _sc)), TH = Math.max(1, Math.round(H * _sc));
          var c = document.createElement("canvas"); c.width = TW; c.height = TH;
          var cx = c.getContext("2d"); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
          cx.drawImage(im, 0, 0, TW, TH);
          // 描画検証: 大きすぎてiOSがcanvasを間引くと中身が空になる。24x24に縮小して原画と比較。
          var sa = document.createElement("canvas"); sa.width = 24; sa.height = 24; sa.getContext("2d").drawImage(c, 0, 0, 24, 24);
          var sb = document.createElement("canvas"); sb.width = 24; sb.height = 24; sb.getContext("2d").drawImage(im, 0, 0, 24, 24);
          var da = sa.getContext("2d").getImageData(0, 0, 24, 24).data, db = sb.getContext("2d").getImageData(0, 0, 24, 24).data;
          var diff = 0; for (var i = 0; i < da.length; i += 4) { diff += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]); }
          diff = diff / (da.length / 4 * 3);
          if (diff > 12) return resolve(keep); // canvasが正しく描けていない（サイズ上限等）→元のまま
          // WebP優先。非対応端末は安全な形式へ: JPEGはJPEG/それ以外(PNG等)はPNGで再エンコード（透過保持）。
          var outMt, du = c.toDataURL("image/webp", 0.88);
          if (String(du).indexOf("data:image/webp") === 0) { outMt = "image/webp"; }
          else if (mt === "image/jpeg" || mt === "image/jpg") { du = c.toDataURL("image/jpeg", 0.82); outMt = "image/jpeg"; }
          else { du = c.toDataURL("image/png"); outMt = "image/png"; }
          if (String(du).indexOf("data:") !== 0) return resolve(keep);
          var wb = du.split(",")[1];
          // 縮小した(scale<1)なら多少でも縮めば採用、等倍は従来どおり8%以上縮む時のみ採用。
          if (wb && wb.length < base64.length * (_sc < 1 ? 1 : 0.92)) return resolve({ base64: wb, mt: outMt });
          return resolve(keep);
        } catch (e) { return resolve(keep); }
      };
      im.onerror = function() { resolve(keep); };
      im.src = dataUrl;
    } catch (e) { resolve(keep); }
  });
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
                // 取り込み画像は再エンコード/縮小せず原寸・原画質で保存＝書き込み画面を最高画質に。
                // 容量はニュース画像の自動削除(_snAutoPruneNewsImages)で管理。手動圧縮は設定の「📉画像を圧縮」で随時可能。2026-06-20
                var _nowTs = Date.now();
                var _img = { base64: base64, mt: mt, id: _nowTs, addedAt: _nowTs, star: false };
                // 原寸base64を即IndexedDBへ退避してからlk(ローカルIDBキー)を付与＝localStorageには載せない。
                // Firebase Storageアップロード完了前(imageUrl未設定)の原寸画像でlocalStorage(約5MB)が溢れ
                // 「端末の保存領域が一杯」アラートが出るのを防ぐ。表示は_stStrip剥離後も再読込時にpreloadImagesがIDBから復元。
                // アップロード完了時に_applyImgUrlMapToDataがlkとIDB退避を掃除する。IDB未準備時はlk無し＝従来動作で安全。2026-06-23
                var _lk = "imgloc_" + _nowTs + "_" + Math.random().toString(36).slice(2, 9);
                snIdbSetAwait(_lk, { base64: base64, mt: mt }).then(function(_ok) {
                  if (_ok) _img.lk = _lk;
                  res(_img);
                });
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
  if (!Array.isArray(d.custom.technicals)) d.custom.technicals = [];
  delete d.custom.techTags;
  if (!d.custom.newsCategories) d.custom.newsCategories = [].concat(DEF_NEWS_CATS);
  if (!d.custom.newsCatDefaults || typeof d.custom.newsCatDefaults !== "object") d.custom.newsCatDefaults = {};
  if (!d.custom.newsSubCats || typeof d.custom.newsSubCats !== "object") d.custom.newsSubCats = {};
  if (!d.custom.newsSubCatDefaults || typeof d.custom.newsSubCatDefaults !== "object") d.custom.newsSubCatDefaults = {};
  if (!d.custom.stockSubCatRefs || typeof d.custom.stockSubCatRefs !== "object") d.custom.stockSubCatRefs = {};
  if (!d.custom.stockInfoTabs || typeof d.custom.stockInfoTabs !== "object") d.custom.stockInfoTabs = {};
  if (!d.custom.newsImgAutoDelete || typeof d.custom.newsImgAutoDelete !== "object") d.custom.newsImgAutoDelete = { enabled: true, periodDays: 7 };
  if (typeof d.custom.newsImgAutoDelete.enabled !== "boolean") d.custom.newsImgAutoDelete.enabled = true;
  if (typeof d.custom.newsImgAutoDelete.periodDays !== "number" || !(d.custom.newsImgAutoDelete.periodDays > 0)) d.custom.newsImgAutoDelete.periodDays = 7;
  // 未参照(孤児)画像の自動削除設定（2026-07-05）: 起動時に約intervalDays日ごと、作成からgraceDays日以上前・未参照のnotebook-images画像を自動でStorage削除。既定オン・初回のみ確認。app-08のuseEffectで実行(_snStorageAudit/_snStorageDeleteOrphans・remoteOk/caOkガードで多端末巻き込み防止)。
  if (!d.custom.orphanAutoDelete || typeof d.custom.orphanAutoDelete !== "object") d.custom.orphanAutoDelete = { enabled: true, graceDays: 7, intervalDays: 7 };
  if (typeof d.custom.orphanAutoDelete.enabled !== "boolean") d.custom.orphanAutoDelete.enabled = true;
  if (typeof d.custom.orphanAutoDelete.graceDays !== "number" || !(d.custom.orphanAutoDelete.graceDays >= 0)) d.custom.orphanAutoDelete.graceDays = 7;
  if (typeof d.custom.orphanAutoDelete.intervalDays !== "number" || !(d.custom.orphanAutoDelete.intervalDays > 0)) d.custom.orphanAutoDelete.intervalDays = 7;
  // シグナル詳細のセクション別候補（①底抜け/②起点/③その他特徴 2026-07-07c）: 旧フラット候補custom.sigDetailsを3セクションへ複製シード（タグ単位・冪等＝sigDetails2に無いタグのみ追加）。
  // 旧sigDetailsは旧端末互換のため温存＝新コードはシード/フォールバック読みのみで編集しない。記録側signal.sigDetailの旧形式（文字列/フラット配列）は③として読む（_elSigDetailSec app-05）＝一括migrateなし。
  if (!d.custom.sigDetails2 || typeof d.custom.sigDetails2 !== "object") d.custom.sigDetails2 = {};
  if (d.custom.sigDetails && typeof d.custom.sigDetails === "object") {
    Object.keys(d.custom.sigDetails).forEach(function(_t) {
      if (d.custom.sigDetails2[_t] && typeof d.custom.sigDetails2[_t] === "object") return;
      var _l = Array.isArray(d.custom.sigDetails[_t]) ? d.custom.sigDetails[_t].filter(function(x) { return x; }) : [];
      d.custom.sigDetails2[_t] = { b: _l.slice(), k: _l.slice(), f: _l.slice() };
    });
  }

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

  if (!d.custom._newsImgAddedAtMig) {
    if (d.trades && typeof d.trades === "object") {
      var _bfNowTs = Date.now();
      var _bfImg = function(im) {
        if (!im || typeof im !== "object") return;
        if (typeof im.addedAt !== "number" || !(im.addedAt > 0)) im.addedAt = (typeof im.id === "number" && im.id > 1e12) ? im.id : _bfNowTs;
        if (im.star !== true) im.star = false;
      };
      Object.keys(d.trades).forEach(function(_dt) {
        var _dd = d.trades[_dt];
        if (!_dd || !_dd.newsCats || typeof _dd.newsCats !== "object") return;
        Object.keys(_dd.newsCats).forEach(function(_cat) {
          var _cd = _dd.newsCats[_cat];
          if (!_cd || typeof _cd !== "object") return;
          if (Array.isArray(_cd.newsItems)) _cd.newsItems.forEach(function(_ni) { if (_ni && Array.isArray(_ni.images)) _ni.images.forEach(_bfImg); });
          if (_cd.newsMemo && Array.isArray(_cd.newsMemo.images)) _cd.newsMemo.images.forEach(_bfImg);
          if (_cd.subCatMemos && typeof _cd.subCatMemos === "object") Object.keys(_cd.subCatMemos).forEach(function(_sk) { var _sm = _cd.subCatMemos[_sk]; if (_sm && Array.isArray(_sm.images)) _sm.images.forEach(_bfImg); });
        });
      });
    }
    d.custom._newsImgAddedAtMig = true;
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

  // シグナル名の統合改名（2026-07-07f・ユーザーがマスター名を変更→過去記録が別シグナル扱いになった件の追従）:
  //   底抜け水準線OS→底抜けラインOS／底つきサイン水準線OS→底つきラインOS／寄り付き足OS→寄り付きラインOS。
  // 旧名を保持する全保存箇所を新名へ書き換え＝記録帳/分析/推奨αで同一シグナルとして集計される（旧「底抜けラインOS」既存記録とも統合）。
  // 対象: 記録(tag/tags/sigDetailキー)・マスター(custom.signalTags)・詳細候補(custom.sigDetails/sigDetails2キー)・
  //       浮き足対象(custom.ukiSignalNames/ukiSignalName)・出現欄メモ(charts[*].apMemos「s|id|名前」キー)・手動出現(appearances[].name)・EPナビ保存(epNavi[].tag)。
  // キー衝突（改名先が既存）は統合: 配列=和集合・単一値=既存(新名側)優先で欠けのみ旧から補完。冪等（_migSignalRename2）。
  if (!d._migSignalRename2) {
    try {
      if (typeof _elSignalRenameData === "function") {
        // 2026-07-14 系統6: 独自走査を廃止し _elSignalRenameData（app-05・NFC+trim正規化照合・customTagText含む全経路）へ委譲＝mig3/4/5と同形。既存ユーザーはフラグ済で非実行・未実行/新規データはmig3/4/5が同じ旧世代名を最終名へmop-upするため最終データ不変。
        [["底抜け水準線OS", "底抜けラインOS"], ["底つきサイン水準線OS", "底つきラインOS"], ["寄り付き足OS", "寄り付きラインOS"]].forEach(function(p) { var _r = _elSignalRenameData(d, p[0], p[1]); if (_r) d = _r; });
      }
      d._migSignalRename2 = true;
    } catch(e) { console.warn("[migrateData] sigRename2 error:", e); }
  }

  // EP損益 or H1の結果損益が損切りの記録は H2期待度を「損切り済」に設定（既存の○/△/×も上書き）。
  if (!d._migHold2StopExp1) {
    try {
      if (d.charts && typeof d.charts === "object") {
        Object.keys(d.charts).forEach(function(ck) {
          var cc = d.charts[ck];
          if (!cc || !Array.isArray(cc.signals)) return;
          var _cl = (cc.cutLine != null) ? Number(cc.cutLine) : 15;
          cc.signals.forEach(function(s) {
            if (!s || s.osVal == null) return;
            if (s.scheme === 2 || s.scheme === 3) return;  // EP起算記録は対象外（旧式判定が合わない・表側はライブ判定）
            var _a = (s.alphaVal != null && s.alphaVal !== "") ? Number(s.alphaVal) : _gradeAlpha(s.difficulty);
            if (_a == null) return;
            var _planStop = (Number(s.osVal) - _a) >= _cl;
            var _h1Stop = (s.holdHighSign === "-" && s.holdHighVal != null && (Number(s.holdHighVal) - _a) >= _cl);
            if (_planStop || _h1Stop) s.hold2Exp = "損切り済";
          });
        });
      }
      d._migHold2StopExp1 = true;
    } catch(e) { console.warn("[migrateData] hold2StopExp error:", e); }
  }

  // OS1〜5概念(scheme:3)導入前の旧記録をscheme:3へ変換（2026-06-13）。
  // 旧記録はosVal=OS1・旧H1=holdHighVal・旧H2=hold2HighValに入っており、新フォームではOS4/OS5欄に表示されてしまう。
  // フォームの _initHold と同じ _epLegs ベース変換で、旧H1→OS2・旧H2→OS3へ移し、hold欄(=OS4/OS5)は空に。
  // 対象=schemeなし(OS欄1足表示)の旧記録のみ。scheme:2(既に正表示)・scheme:3は対象外。
  if (!d._migEpScheme3 && typeof _epLegs === "function") {
    try {
      var _osS3 = function(v) { return v == null ? null : v < 0 ? "-" : "+"; };  // OS系符号: 負=↓"-"
      var _hS3 = function(v) { return v == null ? null : v < 0 ? "+" : "-"; };   // hold系符号: 負=↓"+"
      if (d.charts && typeof d.charts === "object") {
        Object.keys(d.charts).forEach(function(ck) {
          var cc = d.charts[ck];
          if (!cc || !Array.isArray(cc.signals)) return;
          cc.signals = cc.signals.map(function(s) {
            if (!s || s.scheme === 2 || s.scheme === 3) return s;  // EP起算(v2/v3)は対象外
            if (s.osVal == null || s.osVal === "") return s;       // OS記録でないものは触らない
            var L = _epLegs(s);  // schemeなし→[os1, (旧H1), (旧H2)]（os2/os3欄は無いため）
            if (!L.length || L[0].role !== "os1") return s;
            var b1 = L[1] || { h: null, c: null }, b2 = L[2] || { h: null, c: null }, b3 = L[3] || { h: null, c: null }, b4 = L[4] || { h: null, c: null };
            return Object.assign({}, s, {
              scheme: 3, result: null,  // 結果はEP足から自動導出
              os2High: b1.h != null ? Math.abs(b1.h) : null, os2HighSign: b1.h != null ? _osS3(b1.h) : null, os2Conf: b1.c != null ? Math.abs(b1.c) : null, os2ConfSign: _osS3(b1.c),
              os3High: b2.h != null ? Math.abs(b2.h) : null, os3HighSign: b2.h != null ? _osS3(b2.h) : null, os3Conf: b2.c != null ? Math.abs(b2.c) : null, os3ConfSign: _osS3(b2.c),
              holdHighVal: b3.h != null ? Math.abs(b3.h) : null, holdHighSign: _hS3(b3.h), holdWidth: b3.c != null ? Math.abs(b3.c) : null, holdWidthSign: _hS3(b3.c), holdOsConf: null,
              hold2HighVal: b4.h != null ? Math.abs(b4.h) : null, hold2HighSign: _hS3(b4.h), hold2Width: b4.c != null ? Math.abs(b4.c) : null, hold2WidthSign: _hS3(b4.c), hold2OsConf: null
            });
          });
        });
      }
      d._migEpScheme3 = true;
    } catch(e) { console.warn("[migrateData] epScheme3 error:", e); }
  }

  // 分足(minBar)未設定の既存記録を既定[1]（1分足）に補完（2026-06-24）。minBar欄は再導入が新しく過去記録は未設定のため、
  // 有効な分足(1/5)を持たない記録を全て[1]に。既設定（[1]/[5]/[1,5]・旧single number）は不変。冪等（_migMinBarDefault1）。
  if (!d._migMinBarDefault1) {
    try {
      var _mbHas = function(mb) { var arr = Array.isArray(mb) ? mb : (mb != null ? [mb] : []); for (var _mi = 0; _mi < arr.length; _mi++) { var _mn = Number(arr[_mi]); if (_mn === 1 || _mn === 5) return true; } return false; };
      if (d.charts && typeof d.charts === "object") {
        Object.keys(d.charts).forEach(function(ck) {
          var cc = d.charts[ck];
          if (!cc || !Array.isArray(cc.signals)) return;
          cc.signals = cc.signals.map(function(s) { return (s && !_mbHas(s.minBar)) ? Object.assign({}, s, { minBar: [1] }) : s; });
        });
      }
      d._migMinBarDefault1 = true;
    } catch(e) { console.warn("[migrateData] minBarDefault1 error:", e); }
  }

  // 浮き足加算α値への移行（_migUkiAlpha 2026-07-03）: 旧「追加α〇＋根拠=底抜け前足浮き＋数値(addAlphaReasonVal)」を独立要素 ukiUsed/ukiVal へ変換。
  // 変換: ukiUsed=true・ukiVal=旧数値（生値）・実効加算=floor(値/2)（半額切捨て）。根拠からは当該名を除去し、
  //   根拠がそれだけ→追加α×(addAlphaVal=null)／他根拠と複合→追加α〇のまま addAlphaVal=旧値−半額（下限0）。
  // 合計α(alphaVal)=基本α＋半額＋新追加α に再計算（基本α不明で導出も不能なら合計は据え置き）。マスター(custom.addAlphaReasons)からも当該名を削除・custom.addAlphaNumericReasonは廃止。
  // 一回性フラグ化（_migUkiAlpha 2026-07-13ガード）: 応用α移行(_migSpecialAlpha)が addAlpha* を delete する前に必ず先行させ、以後は再実行しない。条件ベースの冪等性も保つ（変換後は根拠名が消えるので二重変換なし）。
  if (!d._migUkiAlpha) {
  try {
    var _ukNR = (d.custom && d.custom.addAlphaNumericReason) || "底抜け前足浮き";
    var _ukNum = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
    if (d.charts && typeof d.charts === "object") {
      Object.keys(d.charts).forEach(function(ck) {
        var cc = d.charts[ck];
        if (!cc || !Array.isArray(cc.signals)) return;
        cc.signals = cc.signals.map(function(s) {
          if (!s || s.addAlphaUsed !== true) return s;
          var _rs = Array.isArray(s.addAlphaReasons) ? s.addAlphaReasons.filter(function(x) { return x; }) : (s.addAlphaReason ? [s.addAlphaReason] : []);
          if (_rs.indexOf(_ukNR) < 0) return s;
          var _fv = _ukNum(s.addAlphaReasonVal);
          if (_fv == null || _fv <= 0) return s;   // 数値未入力の底抜け根拠は変換対象外（半額の算出元が無い＝手動調整）
          var _half = Math.floor(_fv / 2);
          var _rest = _rs.filter(function(x) { return x !== _ukNR; });
          var _oldAdd = _ukNum(s.addAlphaVal) != null ? _ukNum(s.addAlphaVal) : 0;
          var _oldTotal = _ukNum(s.alphaVal);
          var _base = _ukNum(s.baseAlphaVal) != null ? _ukNum(s.baseAlphaVal) : (_oldTotal != null ? _oldTotal - _oldAdd : null);
          var _newAdd = _rest.length ? Math.max(0, _oldAdd - _half) : null;
          var _up = {
            ukiUsed: true, ukiVal: _fv,
            addAlphaReasonVal: null,
            addAlphaUsed: _rest.length ? true : false,
            addAlphaReasons: _rest.length ? _rest : null,
            addAlphaVal: _newAdd
          };
          if (s.addAlphaReason === _ukNR) _up.addAlphaReason = null;
          if (_base != null && _base >= 0) { _up.baseAlphaVal = _base; _up.alphaVal = _base + _half + (_newAdd != null ? _newAdd : 0); }
          return Object.assign({}, s, _up);
        });
      });
    }
    if (d.custom) {
      if (Array.isArray(d.custom.addAlphaReasons) && d.custom.addAlphaReasons.indexOf(_ukNR) >= 0) {
        d.custom.addAlphaReasons = d.custom.addAlphaReasons.filter(function(x) { return x !== _ukNR; });
      }
      if (d.custom.addAlphaNumericReason != null) delete d.custom.addAlphaNumericReason;
    }
  } catch(e) { console.warn("[migrateData] ukiAlpha error:", e); }
  d._migUkiAlpha = true;
  }
  // ライン併存ルールへの移行（_migLineCoexist 2026-07-08g）: 旧・シグナル詳細③(その他/f・単一b/k含む)に付けていた「ライン併存」「併存ライン」を独立フラグ signal.lineCoexist=true へ移し、詳細/EPナビitem/候補マスターから当該名を除去。
  // 履歴の基本α(baseAlphaVal/alphaVal/ep)は書き換えない＝過去損益の整合を保つ（フラグ付与のみ）。条件ベース＝冪等（除去後は当該名が無いので再実行no-op）。
  try {
    var _LC = ["ライン併存", "併存ライン"];
    var _isLC = function(x) { return _LC.indexOf(x) >= 0; };
    var _stripArr = function(arr) { var out = [], hit = false; (arr || []).forEach(function(x) { if (_isLC(x)) hit = true; else if (out.indexOf(x) < 0) out.push(x); }); return { list: out, hit: hit }; };
    // sigDetail[tag]（新obj{b,k,f}/旧string/旧array）から当該名を除去。返り値 {val:新エントリ or null(空), hit}。
    var _stripDetail = function(sd) {
      if (sd == null) return { val: sd, hit: false };
      if (typeof sd === "string") return _isLC(sd) ? { val: null, hit: true } : { val: sd, hit: false };
      if (Array.isArray(sd)) { var r0 = _stripArr(sd); return { val: r0.list.length ? r0.list : null, hit: r0.hit }; }
      if (typeof sd === "object") {
        var hit = false, nb = sd.b, nk = sd.k, nf = sd.f;
        if (_isLC(sd.b)) { nb = null; hit = true; }
        if (_isLC(sd.k)) { nk = null; hit = true; }
        if (Array.isArray(sd.f)) { var rf = _stripArr(sd.f); nf = rf.list; if (rf.hit) hit = true; }
        if (!hit) return { val: sd, hit: false };
        var nv = {}; if (nb) nv.b = nb; if (nk) nv.k = nk; if (nf && nf.length) nv.f = nf;
        return { val: (nv.b || nv.k || (nv.f && nv.f.length)) ? nv : null, hit: true };
      }
      return { val: sd, hit: false };
    };
    if (d.charts && typeof d.charts === "object") {
      Object.keys(d.charts).forEach(function(ck) {
        var c = d.charts[ck]; if (!c) return;
        if (Array.isArray(c.signals)) {
          c.signals.forEach(function(s) {
            if (!s || !s.sigDetail || typeof s.sigDetail !== "object") return;
            var anyHit = false, nsd = {};
            Object.keys(s.sigDetail).forEach(function(tag) {
              var r = _stripDetail(s.sigDetail[tag]);
              if (r.hit) anyHit = true;
              if (r.val != null) nsd[tag] = r.val;
            });
            if (anyHit) { s.lineCoexist = true; s.sigDetail = Object.keys(nsd).length ? nsd : null; }
          });
        }
        if (Array.isArray(c.epNavi)) {
          c.epNavi.forEach(function(it) {
            if (!it) return;
            var hit = false;
            if (_isLC(it.b)) { it.b = null; hit = true; }
            if (_isLC(it.k)) { it.k = null; hit = true; }
            if (Array.isArray(it.f)) { var rf2 = _stripArr(it.f); if (rf2.hit) { it.f = rf2.list; hit = true; } }
            if (hit) it.lineCoexist = true;
          });
        }
      });
    }
    if (d.custom) {
      var _cleanCand = function(m) { if (!m || typeof m !== "object") return; Object.keys(m).forEach(function(tag) { var v = m[tag]; if (Array.isArray(v)) { m[tag] = v.filter(function(x) { return !_isLC(x); }); } else if (v && typeof v === "object") { ["b", "k", "f"].forEach(function(sk) { if (Array.isArray(v[sk])) v[sk] = v[sk].filter(function(x) { return !_isLC(x); }); }); } }); };
      _cleanCand(d.custom.sigDetails);
      _cleanCand(d.custom.sigDetails2);
    }
  } catch(e) { console.warn("[migrateData] lineCoexist error:", e); }
  // 追加α根拠の「詳細」機能を廃止（_migDropAddReasonDetail 2026-07-09）: 全記録の signal.addReasonDetail と候補マスター custom.addReasonDetails を削除（分析未組み込み＝記録のみだった機能）。フラグで一回性・以降スキップ。基本α/損益は不変。
  if (!d._migDropAddReasonDetail) {
    try {
      if (d.charts && typeof d.charts === "object") {
        Object.keys(d.charts).forEach(function(ck) {
          var c = d.charts[ck]; if (!c || !Array.isArray(c.signals)) return;
          c.signals.forEach(function(s) { if (s && s.addReasonDetail !== undefined) delete s.addReasonDetail; });
        });
      }
      if (d.custom && d.custom.addReasonDetails !== undefined) delete d.custom.addReasonDetails;
      d._migDropAddReasonDetail = true;
    } catch(e) { console.warn("[migrateData] dropAddReasonDetail error:", e); }
  }
  // 【一回性 _migSignalRename3・2026-07-10】ユーザー指定3改名で過去に割れた記録を統合。改名UIが空白/全半角/NFC差でスルーし旧名記録が残っていた分を、正規化(NFC+trim)照合済みの_elSignalRenameData(app-05)で新名へ吸収＝記録帳のシグナル軸(記録tag名でグループ化)で新旧が別々に出ていたのを1本化。冪等（フラグで1回）。d=返り値で再代入(全トップレベル保持・後続migなしのreturn直前配置)。今後のUI改名は正規化済み_elSignalRenameDataが担当。
  if (!d._migSignalRename3) {
    try {
      if (typeof _elSignalRenameData === "function") {
        // ユーザー指定3改名＋各々の旧世代名(_migSignalRename2の_RN2由来: 底抜け水準線OS/底つきサイン水準線OS/寄り付きラインOS)も同じ新名へ集約＝mig2の実行順・実行有無に依らず1本化（正規化照合で空白/全半角/NFC差も吸収）
        [["底抜けラインOS", "指標線底抜けOS"], ["底抜け水準線OS", "指標線底抜けOS"],
         ["底つきラインOS", "水平線耐えOS"], ["底つきサイン水準線OS", "水平線耐えOS"],
         ["寄り付き足OS", "寄り足上値OS"], ["寄り付きラインOS", "寄り足上値OS"]].forEach(function(p) { var _r = _elSignalRenameData(d, p[0], p[1]); if (_r) d = _r; });
      }
      d._migSignalRename3 = true;
    } catch(e) { console.warn("[migrateData] sigRename3 error:", e); }
  }
  // 【一回性 _migSignalRename4・2026-07-12】sigRename3と同じ3改名（旧世代名含む6ペア）を再適用。rename3実行後に他端末から旧名の記録が同期合流した/フラグだけ先に同期された端末の救済＝既知ペアの割れを再吸収。冪等（統合済みならno-op）。
  if (!d._migSignalRename4) {
    try {
      if (typeof _elSignalRenameData === "function") {
        [["底抜けラインOS", "指標線底抜けOS"], ["底抜け水準線OS", "指標線底抜けOS"],
         ["底つきラインOS", "水平線耐えOS"], ["底つきサイン水準線OS", "水平線耐えOS"],
         ["寄り付き足OS", "寄り足上値OS"], ["寄り付きラインOS", "寄り足上値OS"]].forEach(function(p) { var _r = _elSignalRenameData(d, p[0], p[1]); if (_r) d = _r; });
      }
      d._migSignalRename4 = true;
    } catch(e) { console.warn("[migrateData] sigRename4 error:", e); }
  }
  // 【一回性 _migSignalRename5・2026-07-13】ユーザー指定の統合改名（OS系等→基本シグナルへ）。②シグナルで新旧同一シグナルが別チップに割れていたのを1本化＝正規化照合済み_elSignalRenameDataで記録tag/signalTags/sigDetails/EPナビ等を全経路移行し既存名へ統合。冪等（フラグで1回・統合済みはno-op）。
  if (!d._migSignalRename5) {
    try {
      if (typeof _elSignalRenameData === "function") {
        [["指標線底抜けOS", "指標線底抜け"], ["寄り足下値OS", "寄り足下値"],
         ["水平線耐えラインOS", "水平線底抜け"], ["水平線耐えライン", "水平線底抜け"]].forEach(function(p) { var _r = _elSignalRenameData(d, p[0], p[1]); if (_r) d = _r; });
      }
      d._migSignalRename5 = true;
    } catch(e) { console.warn("[migrateData] sigRename5 error:", e); }
  }
  // 【一回性 _migSignalRename6・2026-07-17】ユーザー指定統合：「水平線耐えOS」「水平線底抜け」→既存「底つきライン」へ吸収（元は同一シグナル）。各々の旧世代名（rename3/4/5由来: 底つきラインOS/底つきサイン水準線OS/水平線耐えラインOS/水平線耐えライン）も同じ新名へ集約＝先行migのフラグ先行同期・実行順に依らず1本化。正規化照合済み_elSignalRenameData(app-05)で記録tag/signalTags/sigDetails/EPナビ等の全経路を移行（既存「底つきライン」へは統合＝配列和集合/単一値新名側優先）。冪等（フラグで1回・統合済みはno-op）。
  if (!d._migSignalRename6) {
    try {
      if (typeof _elSignalRenameData === "function") {
        [["水平線耐えOS", "底つきライン"], ["底つきラインOS", "底つきライン"], ["底つきサイン水準線OS", "底つきライン"],
         ["水平線底抜け", "底つきライン"], ["水平線耐えラインOS", "底つきライン"], ["水平線耐えライン", "底つきライン"]].forEach(function(p) { var _r = _elSignalRenameData(d, p[0], p[1]); if (_r) d = _r; });
      }
      d._migSignalRename6 = true;
    } catch(e) { console.warn("[migrateData] sigRename6 error:", e); }
  }
  // 応用α（独立α値）への移行（_migSpecialAlpha 2026-07-13）: 旧「基本α＋追加α増分」を廃止し、追加α〇(addAlphaUsed===true)だった記録を独立α値 specialAlpha へ作り替える。
  //  各記録の原本を _almig にbackup → specialAlpha＝各銘柄の推奨応用α(銘柄全体母数・_elSpecialAlphaPick＝旧_elTotalAlphaPick／浮き足〇・RN〇は母数除外)、不足時は推奨基本α(_elBaseAlphaPick)、
  //  それも無ければ旧 baseAlphaVal+addAlphaVal（＝旧採用αを厳密維持）→ base-levelα=specialAlpha として alphaVal を再計算(=specialAlpha+浮き足+RN)＝過去の応用記録のEP/損益が変わる（ユーザー承認）。EPは非保存で alphaVal から都度導出(_epResolve)。
  //  通常記録(addAlphaUsed!==true)は一切触らない。旧 addAlpha* は delete。custom.addAlphaReasons→custom.specialReasons へ一度だけ付替。_elSpecialAlphaPick(app-06)ロード後前提＝typeofガード。d._migSpecialAlpha フラグで冪等。順序＝_migUkiAlpha の後。
  if (!d._migSpecialAlpha && typeof _elSpecialAlphaPick === "function" && typeof _elBaseAlphaPick === "function" && typeof _elAlphaInfo === "function") {
    try {
      var _saN = function(v) { return (v != null && v !== "" && !isNaN(Number(v))) ? Number(v) : null; };
      var _saAiOf = function(r) { return _elAlphaInfo(r, d); };
      var _saCharts = (d.charts && typeof d.charts === "object") ? d.charts : {};
      // 銘柄ごとに算入v2記録を1回だけ集約
      var _saByStock = {};
      Object.keys(_saCharts).forEach(function(ck) {
        var c = _saCharts[ck]; if (!c || !Array.isArray(c.signals)) return;
        var _us = ck.lastIndexOf("_"); if (_us < 0) return;
        var _stock = ck.slice(0, _us), _date = ck.slice(_us + 1);
        var arr = _saByStock[_stock] || (_saByStock[_stock] = []);
        c.signals.forEach(function(s2) { if (s2 && _elInclTotal(s2) && _epIsV2(s2)) arr.push({ stock: _stock, date: _date, signal: s2 }); });
      });
      // 銘柄ごとの推奨応用α(1本・銘柄全体母数)と推奨基本α(フォールバック)を先に算出（旧・追加α〇の状態で。浮き足〇/RN〇は応用プールから除外）
      var _saSpecialOf = {}, _saBaseOf = {};
      Object.keys(_saByStock).forEach(function(_stock) {
        var _all = _saByStock[_stock];
        var _spPool = _all.filter(function(r) { return r.signal.addAlphaUsed === true && !_elUkiYes(r.signal) && !_elRnYes(r.signal); });
        var _sp = null;
        if (_spPool.length) { var _pk = _elSpecialAlphaPick(_spPool, _saAiOf); if (_pk && _pk.alpha != null && _pk.status !== "none") _sp = _pk.alpha; }
        _saSpecialOf[_stock] = _sp;
        var _bpk = _elBaseAlphaPick(_all.filter(function(r) { return r.signal.addAlphaUsed !== true; }), _saAiOf);
        _saBaseOf[_stock] = (_bpk && _bpk.alpha != null && _bpk.status !== "none") ? _bpk.alpha : null;
      });
      // 各記録を変換（旧・追加α〇のみ）
      var _saMigN = 0;
      Object.keys(_saCharts).forEach(function(ck) {
        var c = _saCharts[ck]; if (!c || !Array.isArray(c.signals)) return;
        var _us = ck.lastIndexOf("_"); if (_us < 0) return;
        var _stock = ck.slice(0, _us);
        c.signals = c.signals.map(function(s) {
          if (!s || s.addAlphaUsed !== true) return s;   // 通常記録は触らない
          var _oldBase = _saN(s.baseAlphaVal), _oldAdd = _saN(s.addAlphaVal), _oldTot = _saN(s.alphaVal);
          // 旧採用αを厳密維持するフォールバック＝旧base-levelα＝旧alphaVal−浮き足−RN（baseAlphaVal欠損＝旧採用αに畳み込み済みの記録も正しく保持）。alphaVal欠損時のみ base+add へ。
          var _fallback = (_oldTot != null) ? (_oldTot - _elUkiAdd(s) - _elRnAdd(s)) : ((_oldBase != null ? _oldBase : 0) + (_oldAdd != null ? _oldAdd : 0));
          var _spec = (_saSpecialOf[_stock] != null) ? _saSpecialOf[_stock] : ((_saBaseOf[_stock] != null) ? _saBaseOf[_stock] : _fallback);
          var _up = Object.assign({}, s);
          _up._almig = { baseAlphaVal: (s.baseAlphaVal != null ? s.baseAlphaVal : null), addAlphaVal: (s.addAlphaVal != null ? s.addAlphaVal : null), addAlphaUsed: s.addAlphaUsed, addAlphaReasons: (Array.isArray(s.addAlphaReasons) ? s.addAlphaReasons.slice() : (s.addAlphaReason ? [s.addAlphaReason] : null)), alphaVal: (s.alphaVal != null ? s.alphaVal : null) };
          _up.specialUsed = true;
          _up.specialAlpha = _spec;
          var _srsn = Array.isArray(s.addAlphaReasons) ? s.addAlphaReasons.filter(function(x) { return x; }) : (s.addAlphaReason ? [s.addAlphaReason] : []);
          _up.specialReasons = _srsn.length ? _srsn : null;
          _up.alphaVal = _spec + _elUkiAdd(s) + _elRnAdd(s);   // base-levelα=応用α ＋ 浮き足 ＋ RN
          delete _up.addAlphaUsed; delete _up.addAlphaVal; delete _up.addAlphaReasons; delete _up.addAlphaReason;
          _saMigN++;
          return _up;
        });
      });
      // 根拠マスター: custom.addAlphaReasons → custom.specialReasons（既存 specialReasons が無い時のみ移す・一度だけ）
      if (d.custom) {
        if (!Array.isArray(d.custom.specialReasons) && Array.isArray(d.custom.addAlphaReasons)) d.custom.specialReasons = d.custom.addAlphaReasons.slice();
        if (d.custom.addAlphaReasons !== undefined) delete d.custom.addAlphaReasons;
      }
      d._migSpecialAlpha = true;
      if (_saMigN) console.log("[migrateData] specialAlpha migrated: " + _saMigN + " records");
    } catch(e) { console.warn("[migrateData] specialAlpha error:", e); }
  }
  // 浮き足専用α化（2026-07-14g）: 浮き足〇＝土台α（基本α/応用α）を持たず、採用α＝浮き足加算(floor(浮き値×%))＋RN のみ。
  // 過去の浮き足〇記録の alphaVal を再計算（土台αを落とす）＝EP/損益が変わる（ユーザー承認④）。原本は _almigUki にbackup・冪等（フラグ＋値一致チェック）・浮き足〇以外は一切触らない。_elUkiAdd/_elRnAdd(app-05)ロード後前提＝typeofガード。順序＝_migSpecialAlpha の後。
  if (!d._migUkiDedicated && typeof _elUkiAdd === "function" && typeof _elRnAdd === "function" && typeof _elUkiYes === "function") {
    try {
      var _uddN = 0;
      var _uCharts = (d.charts && typeof d.charts === "object") ? d.charts : {};
      Object.keys(_uCharts).forEach(function(ck) {
        var c = _uCharts[ck]; if (!c || !Array.isArray(c.signals)) return;
        c.signals = c.signals.map(function(s) {
          if (!s || !_elUkiYes(s)) return s;   // 浮き足〇以外は触らない
          var _newA = _elUkiAdd(s) + _elRnAdd(s);   // 土台α無し＝浮き足加算＋RN のみ
          var _oldA = (s.alphaVal != null && s.alphaVal !== "" && !isNaN(Number(s.alphaVal))) ? Number(s.alphaVal) : null;
          if (_oldA != null && _oldA === _newA) return s;   // 既に一致＝冪等
          var _up = Object.assign({}, s);
          _up._almigUki = { alphaVal: (s.alphaVal != null ? s.alphaVal : null), baseAlphaVal: (s.baseAlphaVal != null ? s.baseAlphaVal : null), specialAlpha: (s.specialAlpha != null ? s.specialAlpha : null), specialUsed: (s.specialUsed != null ? s.specialUsed : null) };
          _up.alphaVal = _newA;
          _uddN++;
          return _up;
        });
      });
      d._migUkiDedicated = true;
      if (_uddN) console.log("[migrateData] uki-dedicated migrated: " + _uddN + " records → float-only alpha");
    } catch(e) { console.warn("[migrateData] uki-dedicated error:", e); }
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
      // base64は (a) Storageアップロード済み(imageUrl) または (b) ローカルIDBに退避済み(lk) のとき
      // localStorageから剥離する。(b)により未アップロードの原寸画像でlocalStorageが溢れない。2026-06-23
      if ((key === "base64" && (parent.imageUrl || parent.lk)) || (key === "orig_base64" && parent.origImageUrl)) {
        return null;
      }
    }
    return val;
  });
}
function _snEvictExpendableCaches() {
  // 日足CSV(sn_dc_csv_v1_*)とCAバー(sn_dcc_ca_bar_v1_*)のキャッシュはFirebaseから再取得できる「捨ててよい」データ。
  // localStorageが一杯のとき、消えると困るユーザーの記録(ST_KEY)を守るため先にこれらを捨てて領域を空ける（2026-06-17: CAバーも対象に追加＝退避の穴を塞ぐ）。
  var removed = 0;
  try {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && (k.indexOf("sn_dc_csv_v1_") === 0 || k.indexOf("sn_dcc_ca_bar_v1_") === 0)) keys.push(k);
    }
    for (var j = 0; j < keys.length; j++) {
      try { localStorage.removeItem(keys[j]); removed++; } catch(e){}
    }
  } catch(e){}
  if (removed > 0) console.warn("[stSave] freed localStorage by evicting " + removed + " expendable cache(s)");
  return removed;
}
function _stWriteToStorage(data) {
  try {
    var s = _stStrip(data);
    var refCount = (s.match(/"__ref__"/g) || []).length;
    if (refCount > 0) console.warn("[stSave] WARNING: saving " + refCount + " __ref__ values to localStorage — images may be lost");
    try {
      localStorage.setItem(ST_KEY, s);
    } catch(quotaErr) {
      // 容量超過: ①画像をIDBへ退避 ②再取得可能な日足CSVキャッシュを捨てる → その上で記録を再保存。
      // これでユーザーの記録(memo/trade)が「黙って保存失敗→消失」する事故を防ぐ。
      console.warn("[stSave] localStorage quota exceeded — freeing space then retrying");
      _stSaveImagesToIdb(data);
      _snEvictExpendableCaches();
      try {
        localStorage.setItem(ST_KEY, _stStrip(data));
      } catch(e2) {
        console.warn("[stSave] Even after freeing space, save failed:", e2);
        // それでも保存できない場合は黙って消さず、ユーザーに知らせる(1回だけ)。
        try {
          if (typeof window !== "undefined" && !window._snQuotaAlerted) {
            window._snQuotaAlerted = true;
            alert("⚠️ 端末の保存領域が一杯で、記録を保存できませんでした。\n設定→エクスポートでバックアップを取り、不要な銘柄を整理してください。");
          }
        } catch(e3){}
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
  var _curM = new Date().getMonth() + 1;  // 2026-07-18 月跨ぎ検知: タブを開いたまま月をまたぐと前月累積が新月キーへ繰り越されるのを防ぐ
  if (_fbUsageCache) {
    if (_fbUsageCache.month === _curM) return _fbUsageCache;
    _fbUsageCache = null;  // 月が変わった→前月キャッシュを捨てて新月キーを読み直す
  }
  try {
    var s = localStorage.getItem(_fbUsageKey());
    if (s) { _fbUsageCache = JSON.parse(s); if (_fbUsageCache.month == null) _fbUsageCache.month = _curM; return _fbUsageCache; }
  } catch(e){}
  _fbUsageCache = { db_dl: 0, db_ul: 0, st_dl: 0, st_ul: 0,
           st_ul_ops: 0, st_dl_ops: 0, polls: 0, puts: 0,
           month: _curM };
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
      // \u81EA\u52D5\u505C\u6B62\u306F\u5EC3\u6B62\uFF082026-06-16\uFF09\u3002\u9ED9\u3063\u3066\u540C\u671F\u3092\u6B62\u3081\u308B\u3068\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u7121\u3057\u306B\u306A\u308A\u30C7\u30FC\u30BF\u6D88\u5931\u306E\u4E00\u56E0\u306B\u306A\u3063\u305F\u305F\u3081\u3001\u8B66\u544A\u306E\u307F\u3002
      var msg = "\u26A0\uFE0F Firebase\u7121\u6599\u67A0\u306E90%\u5230\u9054: " + c.label + " (" + Math.round(pct) + "%)\uFF08\u540C\u671F\u306F\u7D99\u7D9A\u3057\u307E\u3059\uFF09";
      console.warn("[FB LIMIT] " + msg);
      _fbShowBanner(msg, "#E65100");
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



// 削除トムストーン(削除id集合)方式のユーティリティ。複数配列のid(文字列化)をユニオン。2026-06-19
function _unionIds(a, b) {
  var seen = {}, res = [];
  function add(arr) { if (Array.isArray(arr)) { for (var i = 0; i < arr.length; i++) { var id = (arr[i] == null) ? "" : String(arr[i]); if (id && seen[id] !== 1) { seen[id] = 1; res.push(id); } } } }
  add(a); add(b);
  return res;
}
// signals/items は物理削除だが、削除idを _delSig/_delItem に記録しておき、マージ後に local/remote の
// ユニオンで対象配列から再除去する＝相手端末のセクションが新しくても削除済みレコードが復活しない。
// _delSig/_delItem キーが無い既存データには一切作用しない（gate された no-op）。2026-06-19
function _applyDelTombstones(out, local, remote, delKey, arrKey) {
  var lDel = local && local[delKey], rDel = remote && remote[delKey];
  if (!(out[delKey] || (lDel && lDel.length) || (rDel && rDel.length))) return;
  var dels = _unionIds(lDel, rDel);
  if (!dels.length) return;
  out[delKey] = dels;
  if (Array.isArray(out[arrKey])) {
    var set = {}; for (var i = 0; i < dels.length; i++) set[dels[i]] = 1;
    out[arrKey] = out[arrKey].filter(function(x) { return !x || set[String(x.id)] !== 1; });
  }
}
// 未伝播のローカル追加を保護: マージ結果(remote主導)に無く、削除トムストーンにも無いローカル項目は
// 「まだremoteへ伝播していない新規追加」とみなして再投入する＝相手端末が新しい(_v大)というだけで
// 新規記録が消えるのを防ぐ。トムストーン済み(削除)idは復活させない・_deleted印も除外。signals/items専用。2026-06-20
function _reAddLocalAdditions(out, local, remote, delKey, arrKey) {
  if (!Array.isArray(out[arrKey]) || !local || !Array.isArray(local[arrKey])) return;
  var dels = _unionIds(local[delKey], remote && remote[delKey]);
  var delSet = {}; for (var i = 0; i < dels.length; i++) delSet[dels[i]] = 1;
  var present = {};
  out[arrKey].forEach(function(x) { if (x && x.id !== undefined) present[String(x.id)] = 1; });
  local[arrKey].forEach(function(lItem) {
    if (lItem && lItem.id !== undefined && !lItem._deleted
        && present[String(lItem.id)] !== 1 && delSet[String(lItem.id)] !== 1) {
      out[arrKey].push(lItem);
    }
  });
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
  // 削除トムストーン適用: 削除済み signals/items を相手端末由来で復活させない。2026-06-19
  _applyDelTombstones(out, local, remote, "_delSig", "signals");
  _applyDelTombstones(out, local, remote, "_delItem", "items");
  // 未伝播のローカル追加(signals/items)を保護＝相手が新しいだけで新規記録を取りこぼさない。2026-06-20
  _reAddLocalAdditions(out, local, remote, "_delSig", "signals");
  _reAddLocalAdditions(out, local, remote, "_delItem", "items");
  // 2026-07-18 EP保存(epNavi)も signals と同じ削除トムストーン(_delEpNavi)/未伝播追加保護に配線＝同一チャートの多端末同時編集でEP保存が消失・復活しない。id付き配列(1404)なので保存/更新はマージ側で処理済み。
  _applyDelTombstones(out, local, remote, "_delEpNavi", "epNavi");
  _reAddLocalAdditions(out, local, remote, "_delEpNavi", "epNavi");
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
          // _v 単調増加クランプ: 端末の時計が遅れていても、直近に同期したremote版数(_fbLocalV)より必ず大きい
          // 版数を書く。さもないと「遅れた時計→小さい_v」で他端末がこちらの正当な編集を古いとみなし上書き/無視
          // してしまう（クロックスキューによる無言のデータ消失）。2026-06-19
          var _prevLocalV = _fbLocalV;
          _fbLocalV = Math.max(fbData._v || Date.now(), (_fbLocalV || 0) + 1);
          _context6.n = 3;
          
          
          var _lightMeta = _buildMeta(fbData);
          _lightMeta._v = _fbLocalV;
          // 差分同期用の署名を書き込む。読み手はこれを見て変更分だけDLする。
          //  _sv  = トップレベルセクションごとの署名（セクション粒度。旧版端末リーダー互換）2026-06-15
          //  _svc = シャード対象セクション(charts/trades)はサブキー(ck/日付)ごとの署名マップ、
          //         それ以外は文字列署名（サブキー粒度。新版リーダーが使用＝1チャート変更で全chartsを再DLしない）2026-06-19
          try {
            var _svMap = {};
            var _svcMap = {};
            for (var _svk in _lightMeta) {
              if (!_lightMeta.hasOwnProperty(_svk) || _svk === "_v" || _svk === "_sv" || _svk === "_svc") continue;
              var _sec = _lightMeta[_svk];
              _svMap[_svk] = _secSig(_sec);
              if (_SHARD_SECTIONS[_svk] && _sec && typeof _sec === "object" && !Array.isArray(_sec)) {
                var _subMap = {};
                for (var _sub in _sec) { if (_sec.hasOwnProperty(_sub)) _subMap[_sub] = _secSig(_sec[_sub]); }
                _svcMap[_svk] = _subMap;
              } else {
                _svcMap[_svk] = _svMap[_svk];
              }
            }
            _lightMeta._sv = _svMap;
            _lightMeta._svc = _svcMap;
          } catch(_esv) {}
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
            // 内容無変更でPUTを省く時は版数も進めない＝_fbLocalVがremoteより先行して
            // 次回ポーリングで無駄な再DL(remoteV !== _fbLocalV)が起きるのを防ぐ。2026-06-20
            _fbLocalV = _prevLocalV;
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





// ===== 差分同期（meta.jsonを丸ごとでなく、変わったトップレベルセクションだけ取得）2026-06-15 =====
// キー順に依存しない正準JSON（キーをソート）。ローカルとリモートで同内容なら必ず同一署名になるように。
function _canonStr(o) {
  if (o === null || typeof o !== "object") return JSON.stringify(o);
  if (Array.isArray(o)) { var a = []; for (var i = 0; i < o.length; i++) a.push(_canonStr(o[i])); return "[" + a.join(",") + "]"; }
  var keys = Object.keys(o).sort();
  var parts = [];
  for (var j = 0; j < keys.length; j++) parts.push(JSON.stringify(keys[j]) + ":" + _canonStr(o[keys[j]]));
  return "{" + parts.join(",") + "}";
}
// RTDBは「空オブジェクト{} / 空配列[] / null」をキーごと保存しない＝読み戻すと存在しない。
// 署名はRTDBが実際に保存する形に正規化してから計算する。さもないと「書き手のJS値(例 signals:[])」と
// 「読み手がRTDBから読み戻した値(signalsキー自体が消える)」で署名が永久に食い違い、当該サブキーを毎ポーリング
// 無駄に再DLし続ける（差分同期の節約が消える）。2026-06-19
function _rtdbNorm(o) {
  if (o === null || typeof o !== "object") return o;
  if (Array.isArray(o)) { var a = []; for (var i = 0; i < o.length; i++) a.push(_rtdbNorm(o[i])); return a; }
  var out = {};
  for (var k in o) {
    if (!o.hasOwnProperty(k)) continue;
    var v = _rtdbNorm(o[k]);
    if (v === null || v === undefined) continue;                 // nullキーは保存されない
    if (Array.isArray(v)) { if (v.length === 0) continue; }       // 空配列は保存されない
    else if (typeof v === "object") { var _empty = true; for (var _k2 in v) { if (v.hasOwnProperty(_k2)) { _empty = false; break; } } if (_empty) continue; } // 空オブジェクトは保存されない
    out[k] = v;
  }
  return out;
}
// セクション署名（画像base64は__ref__に剥がし、RTDB保存形に正規化してから＝metaと同条件で比較）。「長さ:ハッシュ」で衝突を実質排除。
function _secSig(section) {
  var s = _canonStr(_rtdbNorm(_stripHeavy(section)));
  return s.length + ":" + _fbHashStr(s);
}
// 「中身が空でRTDB上は存在しない（読むとnull）」サブキー/セクションの署名値。差分取得時にnull本体が
// 正常な空なのか競合なのかを判別するのに使う。
var _SIG_EMPTY_OBJ = _secSig({});
var _SIG_EMPTY_ARR = _secSig([]);
// 差分取得の粒度設定: 指定セクションは「サブキー単位」(charts=銘柄_日付 / trades=日付)で署名し、
// 変更サブキーだけDLする。巨大な charts を1チャート編集ごとに丸ごと再DLするのを防ぐ。2026-06-19
var _SHARD_SECTIONS = { charts: 1, trades: 1 };
// 1セクション内の変更サブキーが多い時は、丸ごと1回DLの方が安いので切替える閾値（件数 or 半数以上）。
var _SHARD_FULL_THRESHOLD = 30;
// 差分取得: リモートの署名マップ（新:_svc=サブキー粒度 / 旧:_sv=セクション粒度）を見て、変わった分だけDLし、
// 「ローカルの未変更分＋取得した変更分」で“完全なremote相当”を再構成して返す。
// →マージ(_mergeRemoteMeta)は従来どおり全件を受け取るので欠落削除のリスクが無い（安全設計）。
// 署名が無い(旧DB)・ローカル無し・取得失敗など不確実時はすべて {status:"full"} を返し、呼び出し側が全件取得にフォールバック。
function fbGetDiff(cfg, localData, remoteV) {
  var base = _fbBase(cfg), auth = _fbAuth(cfg);
  if (!base || !localData || typeof localData !== "object" || !(localData.trades || localData.charts)) {
    return Promise.resolve({ status: "full" });
  }
  function _getJson(path) {
    return fetch(base + path + auth)
      .then(function(r) { if (!r.ok) return null; return r.text(); })
      .then(function(t) { try { _fbTrack("db_dl", t ? t.length : 0); } catch(e) {} var o = null; try { o = t ? JSON.parse(t) : null; } catch(e) { o = null; } return o; });
  }
  // 署名マップ取得: 新形式 _svc(サブキー粒度)を優先、無ければ旧 _sv(セクション粒度)。
  function _fetchSig() {
    return _getJson("/meta/_svc.json").then(function(svc) {
      if (svc && typeof svc === "object") return svc;
      return _getJson("/meta/_sv.json").then(function(sv) { return (sv && typeof sv === "object") ? sv : null; });
    });
  }
  return _fetchSig().then(function(remoteSig) {
    if (!remoteSig) return { status: "full" }; // 署名無し（旧DB等）→ 全件
    var keyset = {}, k, s;
    for (k in remoteSig) { if (remoteSig.hasOwnProperty(k) && k !== "_v" && k !== "_sv" && k !== "_svc") keyset[k] = 1; }
    for (k in localData) { if (localData.hasOwnProperty(k) && k !== "_v" && k !== "_sv" && k !== "_svc") keyset[k] = 1; }

    var recon = {}, lk;
    for (lk in localData) { if (localData.hasOwnProperty(lk)) recon[lk] = localData[lk]; } // ローカル全体を土台に
    var fetches = []; // {url, apply(parsed)}
    var changed = [];

    for (k in keyset) {
      if (!keyset.hasOwnProperty(k)) continue;
      var rEntry = remoteSig.hasOwnProperty(k) ? remoteSig[k] : undefined;
      if (rEntry === undefined) continue; // リモート署名に無い=ローカル保持（セクション消滅は伝播させない=既存仕様）
      var lSec = (localData[k] && typeof localData[k] === "object" && !Array.isArray(localData[k])) ? localData[k] : null;

      if (rEntry && typeof rEntry === "object" && !Array.isArray(rEntry)) {
        // ── サブキー粒度（charts/trades） ──
        var subset = {};
        for (s in rEntry) { if (rEntry.hasOwnProperty(s)) subset[s] = 1; }
        if (lSec) { for (s in lSec) { if (lSec.hasOwnProperty(s)) subset[s] = 1; } }
        var changedSubs = [], totalSubs = 0;
        for (s in subset) {
          if (!subset.hasOwnProperty(s)) continue;
          totalSubs++;
          var rSub = rEntry.hasOwnProperty(s) ? rEntry[s] : undefined;
          if (rSub === undefined) continue; // リモートに無いサブキー=ローカル保持
          var lSub = (lSec && lSec.hasOwnProperty(s)) ? _secSig(lSec[s]) : null;
          if (rSub !== lSub) changedSubs.push(s);
        }
        if (!changedSubs.length) continue; // このセクションは変更なし→ローカル保持
        changed.push(k);
        if (changedSubs.length >= _SHARD_FULL_THRESHOLD || changedSubs.length * 2 >= totalSubs) {
          // 変更が多い→セクション丸ごと1回DL（多数の小リクエストで逆に増えるのを防ぐ）。
          // ただしローカル限定サブキー(未pushのck等)が脱落しないよう、ローカルを土台にfetch結果を重ねる。
          (function(kk, lloc) { fetches.push({ sig: "nonempty", url: "/meta/" + encodeURIComponent(kk) + ".json", apply: function(v) { recon[kk] = Object.assign({}, lloc || {}, v || {}); } }); })(k, lSec);
        } else {
          // 土台をローカルのシャローコピーにして、変更サブキーだけ差し替える（ローカルstateは非破壊）
          var base2 = {};
          if (lSec) { for (s in lSec) { if (lSec.hasOwnProperty(s)) base2[s] = lSec[s]; } }
          recon[k] = base2;
          changedSubs.forEach(function(sub) {
            (function(kk, ss, ssig) { fetches.push({ sig: ssig, url: "/meta/" + encodeURIComponent(kk) + "/" + encodeURIComponent(ss) + ".json", apply: function(v) { recon[kk][ss] = v; } }); })(k, sub, rEntry[sub]);
          });
        }
      } else {
        // ── セクション粒度（custom 等 / 旧 _sv） ──
        var lSig = localData.hasOwnProperty(k) ? _secSig(localData[k]) : null;
        if (rEntry !== lSig) {
          changed.push(k);
          (function(kk, ssig) { fetches.push({ sig: ssig, url: "/meta/" + encodeURIComponent(kk) + ".json", apply: function(v) { recon[kk] = v; } }); })(k, rEntry);
        }
      }
    }

    if (!fetches.length) return { status: "nochange" }; // 全て内容一致→DL不要

    return Promise.all(fetches.map(function(f) {
      return fetch(base + f.url + auth)
        .then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status + " " + f.url); return r.text(); })
        .then(function(t) { try { _fbTrack("db_dl", t ? t.length : 0); } catch(e) {} return { f: f, v: t ? JSON.parse(t) : null }; });
    })).then(function(parts) {
      for (var pi = 0; pi < parts.length; pi++) {
        var pp = parts[pi];
        if (pp.v == null) {
          // RTDBは空コンテナ/削除をnullで返す。署名が空相当なら「正常に空」なので局保持(applyせず=ローカル土台のまま)、
          // 署名は非空なのにnull=部分書込/競合の不整合 → 安全のため全件フォールバック。
          if (pp.f.sig === _SIG_EMPTY_OBJ || pp.f.sig === _SIG_EMPTY_ARR) continue;
          return { status: "full" };
        }
        pp.f.apply(pp.v);
      }
      recon._v = (typeof remoteV === "number") ? remoteV : (localData._v || Date.now());
      delete recon._sv; delete recon._svc;
      if (!(recon.trades || recon.charts)) return { status: "full" }; // 健全性チェック
      return { status: "diff", data: recon, changed: changed };
    })["catch"](function() { return { status: "full" }; });
  })["catch"](function() { return { status: "full" }; });
}
// ポーリングで版数が変わった時に呼ぶ取得。差分が使えれば変更分だけ、ダメなら全件にフォールバック。
// 戻り値 {ok:true,data:再構成済みfullメタ}=マージ対象 / {ok:true,data:null,nochange:true}=内容一致(版数だけ進める)
//        / {ok:false}=取得失敗(版数を進めず次ポーリングで再試行)
function _fbPollFetch(cfg, localData, remoteV) {
  function _full() {
    return fbGet(cfg).then(function(d) {
      if (d && d !== "EMPTY" && typeof d === "object" && (d.trades || d.charts)) return { ok: true, data: d };
      return { ok: false };
    })["catch"](function() { return { ok: false }; });
  }
  return fbGetDiff(cfg, localData, remoteV).then(function(res) {
    if (res.status === "diff") return { ok: true, data: res.data };
    if (res.status === "nochange") return { ok: true, data: null, nochange: true };
    return _full();
  })["catch"](function() { return _full(); });
}


function fbInitialLoad(cfg, localData) {
  return fbPollV(cfg).then(function(rv) {
    var localV = (localData && typeof localData._v === "number") ? localData._v : 0;
    
    
    
    if (rv && localV > 0 && localV >= rv) {
      _fbLocalV = rv;
      try { console.log("[FB] initial load: skip full DL (localV=" + localV + " >= rv=" + rv + ")"); } catch(e){}
      return { status: "skip" };
    }
    
    function _full() { return fbGet(cfg).then(function(fullData) {
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
    }); }
    // 差分同期: ローカルに既存データがあり、リモートに版数(rv)がある場合は、変わったトップレベル
    // セクションだけDLして起動時の全件DLを回避（RTDBダウンロード帯域の主因を削減）。2026-06-19
    // _sv(署名)が無い旧DB・取得失敗など不確実時はfbGetDiffが{status:"full"}を返し _full() で全件フォールバック。
    if (rv && localData && typeof localData === "object" && (localData.trades || localData.charts)) {
      return fbGetDiff(cfg, localData, rv).then(function(res) {
        if (res && res.status === "diff") { _fbLocalV = rv; try { console.log("[FB] initial load: diff DL (" + (res.changed ? res.changed.length : "?") + " sec)"); } catch(e){} return { status: "ok", data: res.data }; }
        if (res && res.status === "nochange") { _fbLocalV = rv; try { console.log("[FB] initial load: nochange (skip DL, rv=" + rv + ")"); } catch(e){} return { status: "skip" }; }
        return _full();
      })["catch"](function() { return _full(); });
    }
    return _full();
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
function snIdbSetAwait(key, val) {
  // snIdbSetの「書き込み完了待ち」版。トランザクション完了でtrue、失敗/未準備でfalseを返す。
  // 取り込み画像のbase64をlocalStorageから剥離(lk付与)する前に「IDBに確実に在る」ことを保証するために使う。2026-06-23
  return new Promise(function(resolve) {
    if (!_snIdbReady) return resolve(false);
    try {
      var tx = _snIdb.transaction("imgs", "readwrite");
      tx.objectStore("imgs").put(val, key);
      tx.oncomplete = function() { resolve(true); };
      tx.onerror = function() { resolve(false); };
      tx.onabort = function() { resolve(false); };
    } catch(e) { resolve(false); }
  });
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

// Service Workerが「実際にネットワーク取得した」Storage画像のバイト数だけを受け取りst_dlに計上する。2026-06-15
// キャッシュHIT(課金されないDL)は数えない＝旧来JS側fetchで一律計上していた過大計上＆誤オートポーズを解消。
try {
  if (typeof navigator !== "undefined" && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener("message", function(ev) {
      if (ev && ev.data && ev.data.type === "sn_st_dl") { try { _fbTrack("st_dl", ev.data.bytes || 0); } catch(e) {} }
    });
  }
} catch(e) {}


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


// Firebase Storage の容量GC（2026-06-17）。孤児(=どの記録からも参照されない)画像を安全に棚卸し/削除する。
// 安全策: ①現dataの全参照URL(構造化imageUrl/origImageUrl＋HTML内<img src>)を走査し、参照中は絶対に消さない
//        ②content hash共有(複数記録が同一オブジェクトを参照)も①の全走査で自然に保護される
//        ③timeCreatedがgrace日以内の新しいオブジェクトは消さない(アップロード直後/多端末同期途中の巻き込み防止)
function _snStoragePathFromUrl(url) {
  if (typeof url !== "string") return null;
  var m = url.match(/\/o\/([^?#"\\]+)/);
  if (!m) return null;
  try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
}
function _snCollectReferencedStoragePaths(data) {
  // dataをJSON文字列化して /o/<encoded-path> を全て拾う＝構造化画像もHTML内<img src>も一括で参照集合に入れる。
  var set = {};
  try {
    var s = JSON.stringify(data || {});
    var re = /\/o\/([^?#"\\]+)/g, m;
    while ((m = re.exec(s))) {
      var p; try { p = decodeURIComponent(m[1]); } catch (e) { p = m[1]; }
      if (p) set[p] = true;
    }
  } catch (e) {}
  return set;
}
function _snStorageAudit(data, cfg) {
  if (!_fbStorageRef) return Promise.resolve({ ok: false, reason: "no-storage" });
  var refSet = _snCollectReferencedStoragePaths(data);
  function _union(obj) {
    if (!obj || typeof obj !== "object") return;
    var s = _snCollectReferencedStoragePaths(obj);
    for (var k in s) { if (s.hasOwnProperty(k)) refSet[k] = true; }
  }
  // 参照漏れ対策(2026-06-17・GC安全検証で判明): ローカルdataだけでは多端末分やCA(分析ツール)のサムネ参照が漏れる。
  //  ①notebookリモート全データ(fbGet)を参照集合へ＝他端末だけが参照する画像を保護。取得失敗時はremoteOk=falseで呼出側が削除中止。
  //  ②CAドラフト(chart-annotator-drafts)のthumbUrl等はnotebook dataに保存されないので別途参照集合へ(best-effort)。
  var remoteOk = true, caOk = true;
  var tasks = [];
  if (cfg && cfg.fbUrl) {
    tasks.push(fbGet(cfg).then(function(rem) {
      if (rem === null) remoteOk = false;
      else if (rem && typeof rem === "object") _union(rem);
    })["catch"](function() { remoteOk = false; }));
    var caBase = cfg.fbUrl.replace(/\/$/, "");
    var auth = cfg.fbSecret ? ("?auth=" + encodeURIComponent(cfg.fbSecret)) : "";
    // CA参照取得は失敗を caOk=false に反映（404=CA未使用は正常扱い）。呼出側はcaOk===falseでも削除中止。
    tasks.push(fetch(caBase + "/chart-annotator-drafts.json" + auth)
      .then(function(r) { if (!r.ok) { if (r.status !== 404) caOk = false; return null; } return r.text(); })
      .then(function(txt) { if (txt != null) { try { _union(JSON.parse(txt)); } catch (e) {} } })
      ["catch"](function() { caOk = false; }));
  }
  return Promise.all(tasks).then(function() {
    return _fbStorageRef.ref("notebook-images").listAll().then(function(res) {
      // このアプリが作成した画像のみ対象。現命名(img_/orig_/html_)に加え、旧バージョンのパス由来命名(d_charts_*/d_trades_* 等)も対象＝再圧縮で旧名の孤児も回収可能に(2026-06-17)。
      // notebook-imagesフォルダ自体がオーナーシップ境界＝CA等の別アプリは chart-images/chart-thumbs に書くのでここには来ない。それでも明示allowlistで安全側に。
      var items = ((res && res.items) || []).filter(function(it) { return /^(img_|orig_|html_|d_)/.test(it.name || ""); });
      var metas = items.map(function(it) {
        return it.getMetadata().then(function(md) {
          return { ref: it, path: it.fullPath, size: (md && md.size) || 0, created: (md && md.timeCreated) ? Date.parse(md.timeCreated) : 0 };
        })["catch"](function() { return { ref: it, path: it.fullPath, size: 0, created: 0 }; });
      });
      return Promise.all(metas).then(function(arr) {
        var total = 0, totalBytes = 0, refCnt = 0, refBytes = 0, orphans = [], orphanBytes = 0;
        arr.forEach(function(o) {
          total++; totalBytes += o.size;
          if (refSet[o.path]) { refCnt++; refBytes += o.size; }
          else { orphans.push(o); orphanBytes += o.size; }
        });
        return { ok: true, total: total, totalBytes: totalBytes, refCnt: refCnt, refBytes: refBytes, orphans: orphans, orphanBytes: orphanBytes, refSetSize: Object.keys(refSet).length, remoteOk: remoteOk, caOk: caOk };
      });
    });
  })["catch"](function(e) { return { ok: false, reason: "list-failed", err: String(e) }; });
}
function _snStorageDeleteOrphans(orphans, graceDays, nowMs) {
  var graceMs = (graceDays == null ? 30 : graceDays) * 86400000;
  var cutoff = (nowMs || Date.now()) - graceMs;
  // grace日以内の新しいオブジェクトは消さない（アップロード直後/多端末同期途中の巻き込み防止）。created不明(0)も安全側で残す。
  var toDel = (orphans || []).filter(function(o) { return o.created && o.created < cutoff; });
  var deleted = 0, freed = 0, errs = 0;
  return toDel.reduce(function(p, o) {
    return p.then(function() {
      return o.ref["delete"]().then(function() { deleted++; freed += o.size; })["catch"](function() { errs++; });
    });
  }, Promise.resolve()).then(function() {
    return { deleted: deleted, freed: freed, errs: errs, skippedRecent: (orphans || []).length - toDel.length };
  });
}
// 自動削除(_snAutoPruneNewsImages)で参照が消えた画像のStorage実体を安全に回収する（2026-06-19）。
// beforeData→afterDataで「全参照を失ったパス(lost)」を求め、push完了後にafterData＋リモート全データ＋CAで再診断し、
// lost かつ どこからも未参照(孤児) のものだけ削除＝pruned範囲に限定するので他端末の新規画像を巻き込まない。
// remoteOk/caOk が取れない時は中止＝安全側。リモートがpush未反映ならlostが孤児にならず削除0→次回回収。
function _snReclaimPrunedStorage(beforeData, afterData, cfg) {
  if (!_fbStorageRef || !cfg || !cfg.fbUrl) return Promise.resolve({ deleted: 0, freed: 0, aborted: "no-storage" });
  var before = _snCollectReferencedStoragePaths(beforeData);
  var after = _snCollectReferencedStoragePaths(afterData);
  var lost = {}, hasLost = false;
  for (var p in before) { if (before.hasOwnProperty(p) && !after[p]) { lost[p] = true; hasLost = true; } }
  if (!hasLost) return Promise.resolve({ deleted: 0, freed: 0 });
  return _snStorageAudit(afterData, cfg).then(function(r) {
    if (!r || !r.ok) return { deleted: 0, freed: 0, aborted: "audit-failed" };
    if (r.remoteOk === false || r.caOk === false) return { deleted: 0, freed: 0, aborted: "remote-unconfirmed" };
    var targets = (r.orphans || []).filter(function(o) { return lost[o.path]; });
    if (!targets.length) return { deleted: 0, freed: 0 };
    return _snStorageDeleteOrphans(targets, 0, Date.now());
  })["catch"](function() { return { deleted: 0, freed: 0, aborted: "error" }; });
}

// 過去画像をWebP/縮小で再圧縮してFirebase Storageの容量を削減する（2026-06-17。当初ニュース限定→全画像に一般化）。
// 新規取り込みは_imgToWebpMaybeで既に圧縮済みだが、それ以前にフル解像度PNG/JPEGでアップ済みの画像はStorageに大きいまま残る。
// 仕組み: data全体の画像オブジェクト(ニュース/チャート/メモ等)を対象に、
//   ①現バイトを ライブbase64→IDB→Cache→ネットワーク の順で取得（egress最小化）
//   ②_imgToWebpMaybe で WebP/長辺1600px へ再エンコード（小さくなる時のみ採用＝壊さない・既最適化済みはスキップ）
//   ③小さくなった分だけ新パス(notebook-images/img_<hash>)へアップロードし、新URLへ参照を張り替える（_snApplyImgMaps）
//      ＝_img と _orig が同一内容なら同じhash→同じオブジェクトに集約（重複保存を解消）。注釈付き(strokes有)のorigは再編集用に温存。
// 旧オブジェクトは「どこからも参照されない孤児」になるので、同期後に既存の孤児GC(_snStorageDeleteOrphans)で安全に回収する。
//   ＝この関数自体は削除をしない（多端末/同期途中の巻き込みを避ける。30日grace/remoteOk判定は既存GC側が担保）。
function _snImgUsableB64(b64) {
  return typeof b64 === "string" && b64 !== "__ref__" && b64.length > 100;
}
function _snImgB64Sig(b64) {
  var mid = Math.floor(b64.length / 2);
  return _fbHashStr(b64.length + "_" + b64.substring(0, 2000) + b64.substring(mid, mid + 2000) + b64.substring(b64.length - 1000));
}
function _snB64Bytes(s) { return Math.floor(((s && s.length) || 0) * 3 / 4); }
function _snImgIsImageObj(obj) {
  return obj && typeof obj === "object" && typeof obj.mt === "string" &&
    (obj.imageUrl || obj.origImageUrl || _snImgUsableB64(obj.base64) || _snImgUsableB64(obj.orig_base64));
}
function _snForEachImg(data, fn) {
  // data全体を走査し、画像オブジェクト(mt+url/base64を持つ)をfnに渡す。base64/orig_base64/strokesの中へは降りない。
  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) { for (var i = 0; i < obj.length; i++) walk(obj[i]); return; }
    if (_snImgIsImageObj(obj)) fn(obj);
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && typeof obj[k] === "object" && k !== "base64" && k !== "orig_base64" && k !== "strokes") walk(obj[k]);
    }
  }
  walk(data);
}
function _snRemapImg(img, urlMap, localMap) {
  if (!img || typeof img !== "object") return img;
  var out = img, copied = false;
  function ensure() { if (!copied) { out = Object.assign({}, img); copied = true; } }
  // 表示画像
  if (img.imageUrl && urlMap[img.imageUrl]) {
    var r = urlMap[img.imageUrl]; ensure();
    out.imageUrl = r.newUrl; out.base64 = r.base64; out.mt = r.mt;
  } else if (!img.imageUrl && _snImgUsableB64(img.base64)) {
    var l = localMap["b:" + _snImgB64Sig(img.base64)];
    if (l) { ensure(); out.base64 = l.base64; out.mt = l.mt; }
  }
  // 原画像（フル解像度なので最大の削減余地。注釈付き=strokes有はそもそもurlMap/localMapに入れていないので張り替わらない）
  if (img.origImageUrl && urlMap[img.origImageUrl]) {
    var ro = urlMap[img.origImageUrl]; ensure();
    out.origImageUrl = ro.newUrl; out.orig_base64 = ro.base64; out.orig_mt = ro.mt;
  } else if (!img.origImageUrl && _snImgUsableB64(img.orig_base64)) {
    var lo = localMap["b:" + _snImgB64Sig(img.orig_base64)];
    if (lo) { ensure(); out.orig_base64 = lo.base64; out.orig_mt = lo.mt; }
  }
  return out;
}
function _snApplyImgMaps(obj, urlMap, localMap) {
  // data全体を非破壊・不変に深く走査し、画像オブジェクトの参照を張り替える。変更が無い枝は元の参照を保つ（Reactの再描画を最小化）。
  urlMap = urlMap || {}; localMap = localMap || {};
  if (Object.keys(urlMap).length === 0 && Object.keys(localMap).length === 0) return obj;
  function rec(o) {
    if (!o || typeof o !== "object") return o;
    if (Array.isArray(o)) {
      var achg = false, arr = [];
      for (var i = 0; i < o.length; i++) { var r = rec(o[i]); arr.push(r); if (r !== o[i]) achg = true; }
      return achg ? arr : o;
    }
    var cur = o, copied = false;
    for (var k in o) {
      if (!o.hasOwnProperty(k)) continue;
      var v = o[k];
      if (v && typeof v === "object" && k !== "base64" && k !== "orig_base64" && k !== "strokes") {
        var rv = rec(v);
        if (rv !== v) { if (!copied) { cur = Object.assign({}, o); copied = true; } cur[k] = rv; }
      }
    }
    // この階層が画像オブジェクトなら参照を張り替える（_snRemapImgは変更が無ければcurをそのまま返す＝参照維持）。
    return _snRemapImg(cur, urlMap, localMap);
  }
  return rec(obj);
}
function _snRecompressGetBytes(url, mt, liveB64) {
  if (_snImgUsableB64(liveB64)) return Promise.resolve({ b64: liveB64, mt: mt });
  return snIdbGet("img_" + url).then(function(c) {
    if (c && _snImgUsableB64(c.base64)) return { b64: c.base64, mt: c.mt || mt };
    return snCacheGet(url).then(function(blob) {
      if (blob && blob.size) {
        return new Promise(function(resolve, reject) {
          var rd = new FileReader();
          rd.onload = function() { resolve({ b64: rd.result.split(",")[1], mt: blob.type || mt }); };
          rd.onerror = reject; rd.readAsDataURL(blob);
        });
      }
      return urlToBase64(url).then(function(b) { return { b64: b, mt: mt }; });
    });
  })["catch"](function() {
    return urlToBase64(url).then(function(b) { return { b64: b, mt: mt }; })["catch"](function() { return null; });
  });
}
function _snRecompressImages(data, onProgress) {
  if (!_fbStorageRef) return Promise.resolve({ ok: false, reason: "no-storage" });
  // 対象URL/ローカル画像を重複排除して収集（同一URL/同一内容は1回だけ処理）。data全体の画像を走査。
  var urlMt = {}, urlLive = {}, localTargets = {};
  function addLocal(b64, mt) { var lk = "b:" + _snImgB64Sig(b64); if (!localTargets[lk]) localTargets[lk] = { b64: b64, mt: mt || "image/png" }; }
  _snForEachImg(data, function(img) {
    // 表示画像は常に対象。
    if (img.imageUrl) {
      if (!urlMt[img.imageUrl]) urlMt[img.imageUrl] = img.mt || "image/png";
      if (_snImgUsableB64(img.base64) && !urlLive[img.imageUrl]) urlLive[img.imageUrl] = img.base64;
    } else if (_snImgUsableB64(img.base64)) {
      addLocal(img.base64, img.mt);
    }
    // 原画像は「注釈なし(strokes無し)」の時だけ対象＝注釈付きはフル解像度の再編集元を温存(strokesが原画素座標基準のため縮小すると位置ズレの恐れ)。
    var annotated = img.strokes && ((Array.isArray(img.strokes) && img.strokes.length) || img.strokes === "__ref__" || (typeof img.strokes === "object" && !Array.isArray(img.strokes) && Object.keys(img.strokes).length));
    if (!annotated) {
      if (img.origImageUrl) {
        if (!urlMt[img.origImageUrl]) urlMt[img.origImageUrl] = img.orig_mt || img.mt || "image/png";
        if (_snImgUsableB64(img.orig_base64) && !urlLive[img.origImageUrl]) urlLive[img.origImageUrl] = img.orig_base64;
      } else if (_snImgUsableB64(img.orig_base64)) {
        addLocal(img.orig_base64, img.orig_mt || img.mt);
      }
    }
  });
  var urlList = Object.keys(urlMt), localList = Object.keys(localTargets);
  var total = urlList.length + localList.length;
  var st = { ok: true, total: total, done: 0, compressed: 0, errs: 0, beforeBytes: 0, afterBytes: 0, savedBytes: 0, urlMap: {}, localMap: {} };
  function report() { st.done++; if (typeof onProgress === "function") { try { onProgress({ done: st.done, total: total, compressed: st.compressed }); } catch (e) {} } }
  function recode(b64, mt) { return _imgToWebpMaybe("data:" + (mt || "image/png") + ";base64," + b64, b64, mt || "image/png"); }
  function uploadNew(o) {
    var ext = o.mt === "image/png" ? ".png" : o.mt === "image/webp" ? ".webp" : ".jpg";
    var id = "img_" + _snImgB64Sig(o.base64);
    return _uploadToStorage("notebook-images/" + id + ext, o.base64, o.mt);
  }
  var chain = Promise.resolve();
  urlList.forEach(function(url) {
    chain = chain.then(function() {
      var mt = urlMt[url];
      return _snRecompressGetBytes(url, mt, urlLive[url]).then(function(src) {
        if (!src || !_snImgUsableB64(src.b64)) { st.errs++; return; }
        var oldB = _snB64Bytes(src.b64); st.beforeBytes += oldB;
        return recode(src.b64, src.mt).then(function(o) {
          if (!o || !o.base64 || o.base64 === src.b64 || o.base64.length >= src.b64.length) { st.afterBytes += oldB; return; }
          return uploadNew(o).then(function(newUrl) {
            if (!newUrl) { st.errs++; st.afterBytes += oldB; return; }
            var nb = _snB64Bytes(o.base64); st.afterBytes += nb; st.savedBytes += (oldB - nb); st.compressed++;
            st.urlMap[url] = { newUrl: newUrl, base64: o.base64, mt: o.mt };
            try { snIdbSet("img_" + newUrl, { base64: o.base64, mt: o.mt }); } catch (e) {}
          });
        });
      })["catch"](function() { st.errs++; }).then(function() { report(); });
    });
  });
  localList.forEach(function(key) {
    chain = chain.then(function() {
      var t = localTargets[key];
      var oldB = _snB64Bytes(t.b64); st.beforeBytes += oldB;
      return recode(t.b64, t.mt).then(function(o) {
        if (!o || !o.base64 || o.base64 === t.b64 || o.base64.length >= t.b64.length) { st.afterBytes += oldB; return; }
        var nb = _snB64Bytes(o.base64); st.afterBytes += nb; st.savedBytes += (oldB - nb); st.compressed++;
        st.localMap[key] = { base64: o.base64, mt: o.mt };
      })["catch"](function() { st.errs++; }).then(function() { report(); });
    });
  });
  return chain.then(function() { return st; });
}
// Firebase Storage 全フォルダの正確な容量内訳を測定する診断（2026-06-17）。
// listAllでルート配下を再帰的に列挙し、トップレベルフォルダ別に件数/合計バイトと大きいファイル上位を返す。
// 既存の_snStorageAuditはnotebook-imagesのみ＝CA(chart-images/chart-thumbs)等を見ないので真の内訳が分からなかった穴を埋める。読み取り専用(getMetadataのみ)。
function _snStorageBreakdown(onProgress) {
  if (!_fbStorageRef) return Promise.resolve({ ok: false, reason: "no-storage" });
  var all = []; // {ref, top}
  function listInto(ref, top, depth) {
    return ref.listAll().then(function(res) {
      ((res && res.items) || []).forEach(function(it) { all.push({ ref: it, top: top }); });
      var subs = (res && res.prefixes) || [];
      if (depth <= 0) return null;
      return subs.reduce(function(p, sub) {
        return p.then(function() { return listInto(sub, top, depth - 1); });
      }, Promise.resolve());
    });
  }
  var root = _fbStorageRef.ref();
  return root.listAll().then(function(res) {
    ((res && res.items) || []).forEach(function(it) { all.push({ ref: it, top: "(root)" }); });
    var subs = (res && res.prefixes) || [];
    return subs.reduce(function(p, sub) {
      return p.then(function() { return listInto(sub, sub.name, 3); });
    }, Promise.resolve());
  }).then(function() {
    var total = all.length, done = 0, folders = {}, largest = [];
    function note() { done++; if (typeof onProgress === "function" && (done % 25 === 0 || done === total)) { try { onProgress({ done: done, total: total }); } catch (e) {} } }
    function bump(top, sz, ok) { var f = folders[top] || (folders[top] = { count: 0, bytes: 0 }); f.count++; if (ok) f.bytes += sz; }
    // getMetadataは同時実行数を絞って実行（全件並列はスロットル/接続上限の恐れ）。
    var idx = 0;
    function worker() {
      if (idx >= all.length) return Promise.resolve();
      var my = all[idx++];
      return my.ref.getMetadata().then(function(md) {
        var sz = (md && md.size) || 0;
        bump(my.top, sz, true);
        largest.push({ path: my.ref.fullPath, size: sz });
      })["catch"](function() { bump(my.top, 0, false); }).then(function() { note(); return worker(); });
    }
    var ws = [];
    for (var w = 0; w < 12; w++) ws.push(worker());
    return Promise.all(ws).then(function() {
      largest.sort(function(a, b) { return b.size - a.size; });
      var totalBytes = 0; for (var k in folders) { if (folders.hasOwnProperty(k)) totalBytes += folders[k].bytes; }
      return { ok: true, total: total, totalBytes: totalBytes, folders: folders, largest: largest.slice(0, 20) };
    });
  })["catch"](function(e) { return { ok: false, reason: "list-failed", err: String(e) }; });
}
// notebook-images をデータ内の参照場所から「種類別」に逆引き集計する（2026-06-17）。
// ハッシュ命名(img_/orig_)のオブジェクトはファイル名から用途が分からないので、data(ローカル＋リモート)の
// 全文字列から /o/<path> を拾い、出現したキー経路の目印(newsCats/chartImg/chartMemo/tradesMemo/summary/stockInfo…)で分類する。
// どの参照にも出てこないオブジェクトは「未参照(孤児)」。読み取り専用(fbGet＋getMetadataのみ)。
function _snCatOfKey(k, cur) {
  if (k === "newsCats") return "ニュース";
  if (k === "chartMemo" || k === "chartMemoHtml") return "チャートメモ";
  if (k === "chartImg" || k === "chartImgs") return "チャート画像";
  if (k === "tradesMemo") return "取引メモ";
  if (k === "summaryHtml" || k === "summaryMemo" || k === "tradesSummaryMemo") return "総括メモ";
  if (k === "stockInfo" || k === "stockInfoTabs") return "銘柄情報タブ";
  if (k === "signals") return "エントリー記録";
  if (k === "events") return "予定/イベント";
  if (k === "charts") return "チャート(その他)";
  if (k === "trades") return (cur === "その他" ? "取引(その他)" : cur);
  return cur;
}
function _snStorageCategoryAudit(data, cfg, onProgress) {
  if (!_fbStorageRef) return Promise.resolve({ ok: false, reason: "no-storage" });
  var pathCat = {};
  function walkCat(obj, cat) {
    if (obj === null || obj === undefined) return;
    if (typeof obj === "string") {
      if (obj.indexOf("/o/") < 0) return;
      var re = /\/o\/([^?#"\\]+)/g, m;
      while ((m = re.exec(obj))) {
        var p; try { p = decodeURIComponent(m[1]); } catch (e) { p = m[1]; }
        if (p && !pathCat[p]) pathCat[p] = cat;
      }
      return;
    }
    if (typeof obj !== "object") return;
    if (Array.isArray(obj)) { for (var i = 0; i < obj.length; i++) walkCat(obj[i], cat); return; }
    for (var k in obj) { if (obj.hasOwnProperty(k)) walkCat(obj[k], _snCatOfKey(k, cat)); }
  }
  var remoteOk = true;
  var pre = Promise.resolve();
  if (cfg && cfg.fbUrl) {
    // 他端末だけが参照する画像も正しく分類できるようリモートも走査（取得失敗時はremoteOk=falseで注意表示）。
    pre = fbGet(cfg).then(function(rem) { if (rem === null) remoteOk = false; else if (rem && typeof rem === "object") walkCat(rem, "その他"); })["catch"](function() { remoteOk = false; });
  }
  return pre.then(function() {
    walkCat(data, "その他");
    return _fbStorageRef.ref("notebook-images").listAll().then(function(res) {
      var items = (res && res.items) || [];
      var total = items.length, done = 0, cats = {}, origBytes = 0, origCnt = 0;
      function note() { done++; if (typeof onProgress === "function" && (done % 25 === 0 || done === total)) { try { onProgress({ done: done, total: total }); } catch (e) {} } }
      function bump(cat, sz) { var c = cats[cat] || (cats[cat] = { bytes: 0, count: 0 }); c.bytes += sz; c.count++; }
      var idx = 0;
      function worker() {
        if (idx >= items.length) return Promise.resolve();
        var it = items[idx++];
        return it.getMetadata().then(function(md) {
          var sz = (md && md.size) || 0, name = it.name || "";
          bump(pathCat[it.fullPath] || "未参照(孤児)", sz);
          if (name.indexOf("orig_") === 0) { origBytes += sz; origCnt++; }
        })["catch"](function() { bump("(取得失敗)", 0); }).then(function() { note(); return worker(); });
      }
      var ws = []; for (var w = 0; w < 12; w++) ws.push(worker());
      return Promise.all(ws).then(function() {
        var totalBytes = 0; for (var k in cats) { if (cats.hasOwnProperty(k)) totalBytes += cats[k].bytes; }
        return { ok: true, total: total, totalBytes: totalBytes, cats: cats, origBytes: origBytes, origCnt: origCnt, remoteOk: remoteOk };
      });
    });
  })["catch"](function(e) { return { ok: false, reason: "failed", err: String(e) }; });
}
// 古いニュース画像を整理（2026-06-18）。trades日付が cutoff(YYYY-MM-DD)より前のニュース画像(newsItems/newsMemo/subCatMemosのimages[])
// を「画像だけ」外す＝テキスト/タグ/記録は残す。非破壊・不変に新dataを構築し外した枚数countを返す。
// 外したStorageオブジェクトは孤児になるので、保存後に既存の「全部削除(grace=0)」で実際に容量回収する。元に戻せない。
function _snImgAddedAt(im) {
  if (!im || typeof im !== "object") return 0;
  if (typeof im.addedAt === "number" && im.addedAt > 0) return im.addedAt;
  if (typeof im.id === "number" && im.id > 1e12) return im.id;
  return 0;
}
function _snPruneNewsImagesCore(data, dateOk, keepImg) {
  if (!data || !data.trades) return { data: data, count: 0 };
  var count = 0;
  var trades = data.trades, newTrades = {}, anyChange = false;
  var _filt = function(imgs) {
    var kept = imgs.filter(function(im) { return keepImg(im); });
    return kept.length === imgs.length ? null : kept;
  };
  Object.keys(trades).forEach(function(date) {
    var dd = trades[date];
    if (!dateOk(date) || !dd || typeof dd !== "object" || !dd.newsCats || typeof dd.newsCats !== "object") { newTrades[date] = dd; return; }
    var cats = dd.newsCats, newCats = {}, ddChanged = false;
    Object.keys(cats).forEach(function(cat) {
      var cd = cats[cat];
      if (!cd || typeof cd !== "object") { newCats[cat] = cd; return; }
      var newCd = cd, cdChanged = false;
      if (Array.isArray(cd.newsItems)) {
        var niChanged = false;
        var newNi = cd.newsItems.map(function(ni) {
          if (ni && Array.isArray(ni.images) && ni.images.length) {
            var kept = _filt(ni.images);
            if (kept) { niChanged = true; count += (ni.images.length - kept.length); return Object.assign({}, ni, { images: kept }); }
          }
          return ni;
        });
        if (niChanged) { if (newCd === cd) newCd = Object.assign({}, cd); newCd.newsItems = newNi; cdChanged = true; }
      }
      if (cd.newsMemo && Array.isArray(cd.newsMemo.images) && cd.newsMemo.images.length) {
        var keptM = _filt(cd.newsMemo.images);
        if (keptM) { count += (cd.newsMemo.images.length - keptM.length); if (newCd === cd) newCd = Object.assign({}, cd); newCd.newsMemo = Object.assign({}, cd.newsMemo, { images: keptM }); cdChanged = true; }
      }
      if (cd.subCatMemos && typeof cd.subCatMemos === "object") {
        var scChanged = false, newSc = {};
        Object.keys(cd.subCatMemos).forEach(function(sk) {
          var sm = cd.subCatMemos[sk];
          if (sm && Array.isArray(sm.images) && sm.images.length) {
            var keptS = _filt(sm.images);
            if (keptS) { scChanged = true; count += (sm.images.length - keptS.length); newSc[sk] = Object.assign({}, sm, { images: keptS }); return; }
          }
          newSc[sk] = sm;
        });
        if (scChanged) { if (newCd === cd) newCd = Object.assign({}, cd); newCd.subCatMemos = newSc; cdChanged = true; }
      }
      newCats[cat] = newCd;
      if (cdChanged) ddChanged = true;
    });
    if (ddChanged) { anyChange = true; newTrades[date] = Object.assign({}, dd, { newsCats: newCats }); }
    else newTrades[date] = dd;
  });
  return { data: anyChange ? Object.assign({}, data, { trades: newTrades }) : data, count: count };
}
function _snStripOldNewsImages(data, cutoff) {
  if (!data || !data.trades || !cutoff) return { data: data, count: 0 };
  return _snPruneNewsImagesCore(data, function(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && date < cutoff;
  }, function(im) {
    return !!(im && im.star === true);
  });
}
function _snAutoPruneNewsImages(data, cutoffMs) {
  if (!data || !data.trades || !(cutoffMs > 0)) return { data: data, count: 0 };
  return _snPruneNewsImagesCore(data, function() { return true; }, function(im) {
    if (!im || typeof im !== "object") return true;
    if (im.star === true) return true;
    var t = _snImgAddedAt(im);
    if (!t) return true;
    return t >= cutoffMs;
  });
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
      // IDB未キャッシュ時のみ1回だけStorageから取得し、その場で表示にも使う。
      // 旧実装は初期srcにurlを入れていたため、IDBにあっても<img>が即DL＋裏でfetch＝二重DLになっていた。2026-06-15
      // st_dlの計上はSW(ネットワーク取得時のみ)へ移したのでここでは数えない（キャッシュHITの過大計上を防ぐ）。
      fetch(url).then(function(r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      }).then(function(blob) {
        if (!blob || !blob.size) throw new Error("empty blob");  // 空応答をIDBに焼いて壊れ画像を固定しない
        var mt2 = blob.type || "image/png";
        return new Promise(function(resolve, reject) {
          var reader = new FileReader();
          reader.onload = function() { resolve({ b64: reader.result.split(",")[1], mt: mt2 }); };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }).then(function(o) {
        if (cancelled) return;
        if (!o.b64) throw new Error("empty b64");
        try { snIdbSet(idbKey, { base64: o.b64, mt: o.mt }); } catch(_){}
        setCachedSrc("data:" + o.mt + ";base64," + o.b64);
      }).catch(function(){ if (!cancelled) setCachedSrc(url); });
    }).catch(function(){ if (!cancelled) setCachedSrc(url); });
    return function() { cancelled = true; };
  }, [url]);
  return React.createElement("img", Object.assign({}, rest, { src: cachedSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" }));
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
      // 原画像(orig_base64)は注釈/拡大を開いた時しか使わない。先読みするとStorageダウンロードが
      // 約2倍になるため、ここでは先読みせずorigImgSrc経由で表示時に遅延DL（SWがキャッシュ）。2026-06-15
    }
    // 未アップロード(imageUrl無)だが原寸base64をローカルIDBに退避済み(lk)の画像を、
    // _stStrip剥離後の再読込時にメモリへ復元する。IDBローカル読み=ネットワーク取得なし(egress不要)なのでactive日に限定しない。2026-06-23
    if (typeof obj.mt === "string" && obj.lk && !obj.imageUrl && (!obj.base64 || obj.base64 === "__ref__" || obj.base64 === null)) {
      targets.push({ obj: obj, key: "base64", lkey: obj.lk, mt: obj.mt, local: true });
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

    if (t.local) {
      // ローカルIDB退避(lk)からの復元はネットワーク取得なし＝Storageへフォールバックしない。
      snIdbGet(t.lkey).then(function(cached) {
        if (cached && cached.base64) { applyB64(cached.base64); done++; }
        else { failed++; }
        next();
      });
      return;
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
          snCachePut(t.url, blob);  // st_dlの計上はSW(ネットワーク取得時のみ)へ集約。ここでは数えない。
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
        var ext = mt2 === "image/png" ? ".png" : (mt2 === "image/webp" ? ".webp" : (mt2 === "image/gif" ? ".gif" : ".jpg"));
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


function _applyImgUrlMapToData(obj, map) {
  // 構造化された画像オブジェクト(images[]の{base64,mt,id})にアップロード済みStorage URLを書き戻す。
  // _applyHtmlUrlMapToDataのimages[]構造体版（HTML文字列ではなく画像オブジェクトが対象）。
  // base64は表示用にライブstateへ残す＝_stStripがlocalStorage保存時にimageUrl有りを見てbase64を剥離する。
  if (!map || Object.keys(map).length === 0) return obj;
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    var _changed = false;
    var _arr = obj.map(function(item) {
      var r = _applyImgUrlMapToData(item, map);
      if (r !== item) _changed = true;
      return r;
    });
    return _changed ? _arr : obj;
  }
  if (typeof obj !== "object") return obj;
  var _chg = false;
  var _out = {};
  for (var _k in obj) {
    if (!obj.hasOwnProperty(_k)) continue;
    var _v = obj[_k];
    if (_v && typeof _v === "object") {
      var _rv = _applyImgUrlMapToData(_v, map);
      _out[_k] = _rv;
      if (_rv !== _v) _chg = true;
    } else {
      _out[_k] = _v;
    }
  }
  if (typeof _out.base64 === "string" && _out.base64.length > 100 && typeof _out.mt === "string" && !_out.imageUrl && map[_out.base64]) {
    _out.imageUrl = map[_out.base64];
    _chg = true;
    // Storage URLが付いた＝ローカルIDB退避(lk)はもう不要。掃除してIDB肥大を防ぐ(以降は_stStripがimageUrlで剥離)。2026-06-23
    if (_out.lk) { try { snIdbDel(_out.lk); } catch(e) {} _out.lk = null; }
  }
  if (typeof _out.orig_base64 === "string" && _out.orig_base64.length > 100 && !_out.origImageUrl && map[_out.orig_base64]) {
    _out.origImageUrl = map[_out.orig_base64];
    _chg = true;
  }
  return _chg ? _out : obj;
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
  // 構造化画像(images[])のアップロード成功URLを base64文字列キーで集める→ライブstateへ書き戻す（_snImgUploadCb）。
  var imgUrlMap = {};

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
            _uploadToStorage("notebook-images/" + id + (mt === "image/png" ? ".png" : mt === "image/webp" ? ".webp" : ".jpg"), b64, mt)
              .then(function(url) {
                if (url) { target.imageUrl = url; imgUrlMap[b64] = url; }
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
            _uploadToStorage("notebook-images/" + id + (mt === "image/png" ? ".png" : mt === "image/webp" ? ".webp" : ".jpg"), b64, mt)
              .then(function(url) {
                if (url) { target.origImageUrl = url; imgUrlMap[b64] = url; }
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
    if (Object.keys(imgUrlMap).length > 0 && typeof window._snImgUploadCb === "function") {
      var _icb = window._snImgUploadCb;
      window._snImgUploadCb = null;
      _icb(imgUrlMap);
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
    } else if (!quickColors.includes(c)) onQuickColors([c].concat(_toConsumableArray(quickColors)).slice(0, 8));
    closeAll();
  };
  var addCustom = function addCustom() {
    if (!presets.includes(customVal)) savePresets([].concat(_toConsumableArray(presets), [customVal]));
    onChange(customVal);
    onHistory(customVal);
    if (!quickColors.includes(customVal)) onQuickColors([customVal].concat(_toConsumableArray(quickColors)).slice(0, 8));
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


// 端末が実際に描けるcanvasの最大1辺をプローブ（細い帯の遠端ピクセルが描けるか）。一度だけ実測してキャッシュ。
// iOSの1辺上限は4096(旧)〜16384(M1等)と端末依存なので、対応端末はより高精細に・非対応は自動で小さく降格。2026-06-15
var _snMaxCanvasDimCache = null;
function _snMaxCanvasDim(cap) {
  if (_snMaxCanvasDimCache == null) {
    var tries = [16384, 8192, 4096], ok = 4096;
    for (var i = 0; i < tries.length; i++) {
      var d = tries[i];
      try {
        var c = document.createElement("canvas"); c.width = d; c.height = 4;
        var x = c.getContext("2d"); if (!x) continue;
        x.fillStyle = "#ff0000"; x.fillRect(d - 3, 0, 3, 4);
        var px = x.getImageData(d - 2, 1, 1, 1).data;
        if (px[0] > 200 && px[3] > 200) { ok = d; break; }  // 遠端が描けた＝その1辺は使える
      } catch (e) {}
    }
    _snMaxCanvasDimCache = ok;
  }
  return Math.min(cap || _snMaxCanvasDimCache, _snMaxCanvasDimCache);
}
var _snMaxCanvasAreaCache = null;
// canvasの総画素(面積)上限を実測。iOSは端末/メモリ依存で、従来は安全側に15.7M固定だった＝大きい画像でストローク用canvasがここで頭打ち→背面の原寸ベース画像より低解像度になりボヤけていた。
// _snMaxCanvasDim(1辺)とは別軸の面積上限を、候補を大きい順に試して「遠端ピクセルが実際に描けた(=無音間引きされない)最大」を採用して実測する。失敗時は従来の15.7Mへ自動フォールバック＝退行なし。1回測ってキャッシュ。テスト用canvasは判定後すぐ1pxへ縮めて backing store を即解放。
function _snMaxCanvasArea(cap) {
  if (_snMaxCanvasAreaCache == null) {
    var tries = [33554432, 25165824, 16777216], ok = 15728640;
    for (var i = 0; i < tries.length; i++) {
      var a = tries[i], side = Math.floor(Math.sqrt(a));
      try {
        var c = document.createElement("canvas"); c.width = side; c.height = side;
        var x = c.getContext("2d");
        if (x) {
          x.fillStyle = "#ff0000"; x.fillRect(side - 3, side - 3, 3, 3);
          var px = x.getImageData(side - 2, side - 2, 1, 1).data;
          var good = (px[0] > 200 && px[3] > 200);
          c.width = c.height = 1;
          if (good) { ok = a; break; }
        } else { c.width = c.height = 1; }
      } catch (e) {}
    }
    _snMaxCanvasAreaCache = ok;
  }
  return Math.min(cap || _snMaxCanvasAreaCache, _snMaxCanvasAreaCache);
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
    return ["#E53935", "#1565C0", "#000000", "#F57F17", "#1B5E20", "#ffffff", "#6A1B9A", "#00897B"];
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
  var overlayScaleRef = useRef(1);
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
    // ②方式(2026-06-15): ベース画像はcanvasに焼かず背面の<img>で表示（iPadのcanvas上限と無関係に常時高精細）。
    // canvasは手書きストローク専用＝透明のまま。消しゴムはストローク削除→rebuildで透明に戻り背面imgが透ける。
    // 保存(_pngWork)はbaseImgRefを使い別canvasで合成するので画質・容量は不変。
    return true;
  }

  function _applyRenderScale(z) {
    var c = canvasRef.current;
    if (!c) return false;
    var ls = logicalSizeRef.current;
    if (!ls.w || !ls.h) return false;
    // 案1: 物理canvasは常に最大解像度(maxScale)でラスタライズし、ズームはwrapperのCSS transform(scale(zoom))に任せる。
    // 以前は zoom のたびに canvas を fit*zoom*dpr で作り直して再描画していた（→ズームの瞬間に一度ガビガビ）。それを廃止し、引数zは未使用。
    var maxScale = maxScaleRef.current || 1;
    var scale = maxScale;
    if (scale < 0.05) scale = 0.05;
    var tw = Math.round(ls.w * scale), th = Math.round(ls.h * scale);
    if (c.width === tw && c.height === th) return false;
    dprRef.current = scale;
    c.width = tw;
    c.height = th;
    // 描画中プレビュー用オーバーレイは本体(maxScale)とは別に控えめな解像度(表示倍率×DPR程度)に。
    // 毎pointermoveで全消去するため、本体と同じ巨大サイズだとペン追従がカクつく。確定時は本体(maxScale)へ高精細で焼き込むので最終画質は維持。
    var _oScale = Math.min(scale, Math.max(1, (scRef.current || 1) * (window.devicePixelRatio || 1)));
    overlayScaleRef.current = _oScale;
    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.width = Math.round(ls.w * _oScale);
      overlayCanvasRef.current.height = Math.round(ls.h * _oScale);
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
      // ②方式(2026-06-15): ベース画像は背面の<img>で表示するので、「論理サイズ(=保存PNGの合成サイズ・座標空間)」と
      // 「手書きストロークcanvasの物理サイズ」を別々に制限する。iOS/iPadOSのcanvasは約16Mpx・1辺の上限があり超えると無音で間引かれる。
      var _isIOSCanvas = /iPad|iPhone|iPod/.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1);
      // 論理サイズの上限＝保存PNGのサイズ。保存画質を変えないため従来どおり(面積15.7M/1辺16384・iOSは面積のみ15.7M)。
      var LOGICAL_MAX_AREA = _isIOSCanvas ? 15728640 : 33554432;
      var LOGICAL_MAX_DIM = 16384;
      var area = nw * nh;
      var _byArea = area > LOGICAL_MAX_AREA ? Math.sqrt(LOGICAL_MAX_AREA / area) : 1;
      var _byDim = Math.max(nw, nh) > LOGICAL_MAX_DIM ? LOGICAL_MAX_DIM / Math.max(nw, nh) : 1;
      var scale = Math.min(_byArea, _byDim);
      if (scale < 1) {
        nw = Math.floor(nw * scale);
        nh = Math.floor(nh * scale);
      }


      baseImgRef.current = bImg;
      logicalSizeRef.current = { w: nw, h: nh };
      scRef.current = Math.min((window.innerWidth * 0.96) / nw, ((window.innerHeight - 130) * 0.96) / nh, 1);
      // ストロークcanvasの物理上限。ベース画像は背面imgが担当するのでcanvasは手書き線専用。
      // iOSのcanvas上限(1辺・総画素)は端末依存。1辺=_snMaxCanvasDim・面積=_snMaxCanvasArea で実機プローブし、デバイスの実上限まで使う＝手書きストロークを論理(保存)解像度より高精細に焼ける(大きい画像でストロークだけボヤける現象の対策／拡大して描くほど効く)。
      // 保存(論理)サイズ=容量は LOGICAL_MAX 据え置きで不変＝ライブ描画の精細さだけ上げる。プローブ失敗時は従来の安全値(面積15.7M/1辺は実上限)へ自動降格＝退行なし。2026-06-21
      var CANVAS_MAX_AREA = _isIOSCanvas ? _snMaxCanvasArea(33554432) : 33554432;
      var CANVAS_MAX_DIM = _isIOSCanvas ? _snMaxCanvasDim(16384) : 16384;
      maxScaleRef.current = Math.min(Math.sqrt(CANVAS_MAX_AREA / (nw * nh)), CANVAS_MAX_DIM / Math.max(nw, nh));
      // iPad(iOS)はストロークcanvasを実機プローブ上限(~16.8〜33.5MP/67〜134MB)まで膨らませると、開いた瞬間の確保＋全面getImageDataでカクつき、巨大レイヤ(長辺4730〜6030px)をiOSコンポジタが間引き→初回描画で再描画され「画質が落ちて直る」現象になる。
      // 対策(2026-06-25): 表示解像度(scRef)×DPR×2倍の拡大ヘッドルームで物理canvasを頭打ちにして実用サイズへ縮小(例 1170x2532=67MB→約30MB)＝カクつき/間引き解消。プローブ上限は天井として維持・最低でも論理(原寸)解像度は確保(Math.max(1,…))。拡大は約2倍(網膜)〜4倍まで鮮明で以降わずかに甘くなる(背景imgは別要素で常時鮮明)。保存(_pngWork)は論理サイズの別canvasなので画質・容量は不変。デスクトップ(非iOS)は従来どおり巨大ラスタライズのまま。
      if (_isIOSCanvas) {
        var _needScale = (scRef.current || 1) * (window.devicePixelRatio || 1) * 2;
        maxScaleRef.current = Math.max(1, Math.min(maxScaleRef.current, _needScale));
      }
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
  // 線の太さ(lineW)は論理座標=画像のnaturalサイズ基準の絶対値なので、画像が大きいほど相対的に細く・小さいほど太く見える。
  // 表示倍率(scRef=画面にフィットさせる縮小率)の逆数を掛けることで、画面上の見かけの太さ(=スライダー値ピクセル)を画像サイズ/縦横比に依らず一定にする。2026-06-21
  // 旧実装は「長辺/1200を0.5〜4にクランプ」。だが画像が画面に収まる(scRef=1にクランプ)サイズでは縮小率と長辺が比例せず、小さめ画像ほど細く見えるズレが残った。scRef基準なら寸法に依らずスライダー値=同じ画面ピクセル幅。
  // 保存済みストロークの値(s.lineW=確定時の_geomLineW)は不変=過去の注釈は変わらない。
  var _lineWScale = function _lineWScale() {
    var s = scRef.current || 0;
    return s > 0 ? 1 / s : 1;
  };
  var _geomLineW = function _geomLineW() { return lineW * _lineWScale(); };

  
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
        // 文字サイズも線の太さと同様に画像サイズで正規化（_lineWScale）＝どの画像でもスライダー値=同じ見かけサイズ。新規テキストのみ・再編集/+−は実寸調整。2026-06-18
        setTextInputState({x:pos.x, y:pos.y, idx:-1, text:"",
          fontSize:Math.max(8, Math.round(fontSize * _lineWScale())), fontBold:fontBold, color:color, opacity:opacity, wrapW:_defW});
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
      ctx.lineWidth = _geomLineW();
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
        ctx.lineWidth = _geomLineW();
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
      var er = _geomLineW() * 5;
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
        var _dpr = overlayScaleRef.current || dprRef.current;
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
          lineW: _geomLineW(),
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
      lineW: _geomLineW(),
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
        color:color,lineW:_geomLineW(),opacity:opacity};
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
      strokes: _curStrokes,
      addedAt: (typeof img.addedAt === "number" ? img.addedAt : (typeof img.id === "number" ? img.id : Date.now())),
      star: img.star === true
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
    
    var _finishPng = function(base64, mime) {

      clearTimeout(_reflectFallback);
      if (base64) {

        var _savedFull = Object.assign({}, _savedNow, { base64: base64, mt: mime || "image/png" });
        
        
        
        
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
        // 注釈は可逆PNGで保存＝最高画質（2026-06-20に容量削減WebP q0.88から復帰・容量はニュース画像の自動削除で管理）。
        // 実際のmime(blob.type / data URLのヘッダ)を読んでmtに反映する＝表示(imgSrc)・Storage拡張子が常に正しくなる。
        if (_expC.toBlob) {
          _expC.toBlob(function(blob) {
            if (!blob) { _finishPng(null); return; }
            var _mt = blob.type || "image/png";
            var _fr = new FileReader();
            _fr.onload = function() {
              var _b64 = String(_fr.result || "").split(",")[1] || null;
              _finishPng(_b64, _mt);
            };
            _fr.onerror = function() { _finishPng(null); };
            _fr.readAsDataURL(blob);
          }, "image/png");
          return;
        }
        var _du = _expC.toDataURL("image/png");
        var _duMt = (String(_du).match(/^data:([^;]+)/) || [])[1] || "image/png";
        _finishPng(_du.split(",")[1], _duMt);
      } catch(e) {
        console.warn("[Annotator] async image encode failed:", e);
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
