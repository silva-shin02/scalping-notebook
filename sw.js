// Service Worker
// 1) アプリ本体(index.html / vendor.js / app-01〜08.js / アイコン)をプリキャッシュし、
//    2回目以降はオフラインでも起動できるようにする。
// 2) Firebase Storage の画像も従来どおりキャッシュして課金を削減する。
var APP_CACHE = "sn-app-v302";
var IMG_CACHE = "sn-images-v1";
var FB_STORAGE_HOST = "firebasestorage.googleapis.com";
var GSTATIC_HOST = "gstatic.com";
var APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./vendor.js",
  "./app-01.js", "./app-02.js", "./app-03.js", "./app-04.js",
  "./app-05.js", "./app-06.js", "./app-07.js", "./app-08.js",
  "./icon-192.png", "./icon-512.png", "./icon-180.png"
];

self.addEventListener("install", function(event) {
  // 本体一式をキャッシュ（1つ失敗しても install を止めない）
  event.waitUntil(
    caches.open(APP_CACHE).then(function(cache) {
      return Promise.all(APP_SHELL.map(function(u) {
        // cache:"reload" でブラウザのHTTPキャッシュを無視し、必ずネットワークから最新を取得する。
        // （これをしないと古い app-*.js がHTTPキャッシュ経由でそのままキャッシュされ、更新が端末に届かない）
        return cache.add(new Request(u, { cache: "reload" }))["catch"](function() {
          return cache.add(u)["catch"](function() {});
        });
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(event) {
  // 旧バージョンのキャッシュを掃除（APP/IMG 以外を削除）して即適用
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== APP_CACHE && k !== IMG_CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = req.url;

  // 1) Firebase Storage 画像: キャッシュ優先（課金削減・オフライン表示）
  if (url.indexOf(FB_STORAGE_HOST) !== -1) {
    event.respondWith(
      caches.open(IMG_CACHE).then(function(cache) {
        return cache.match(url).then(function(cached) {
          if (cached) return cached;
          return fetch(new Request(url, { mode: "cors" })).then(function(res) {
            if (res && res.ok) {
              cache.put(url, res.clone());
              // 実DL(ネットワーク取得)のバイト数だけをページへ通知してst_dl計上。キャッシュHITはこの分岐に来ない=数えない。2026-06-15
              try {
                res.clone().blob().then(function(b) {
                  self.clients.matchAll().then(function(cs) {
                    cs.forEach(function(cl) { cl.postMessage({ type: "sn_st_dl", bytes: (b && b.size) || 0 }); });
                  });
                })["catch"](function() {});
              } catch(e) {}
            }
            return res;
          })["catch"](function() { return fetch(req); });
        });
      })
    );
    return;
  }

  // 2) アプリ起動(ナビゲーション): オンラインは最新を取得しつつ index.html を更新、
  //    オフラインはキャッシュした index.html を返す
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function(res) {
        var copy = res.clone();
        caches.open(APP_CACHE).then(function(c) { c.put("./index.html", copy); });
        return res;
      })["catch"](function() {
        return caches.match("./index.html").then(function(c) { return c || caches.match("./"); });
      })
    );
    return;
  }

  // 3) アプリ本体(同一オリジン) と Firebase SDK(gstatic): stale-while-revalidate
  //    （キャッシュを即返しつつ裏で更新 → 次回反映。オフラインはキャッシュを使う）
  var sameOrigin = url.indexOf(self.location.origin) === 0;
  if (sameOrigin || url.indexOf(GSTATIC_HOST) !== -1) {
    event.respondWith(
      caches.open(APP_CACHE).then(function(cache) {
        return cache.match(req).then(function(cached) {
          var network = fetch(req).then(function(res) {
            if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
            return res;
          })["catch"](function() { return cached; });
          return cached || network;
        });
      })
    );
    return;
  }

  // 4) その他(Firebase REST 等のデータ通信): キャッシュせずネットワーク既定に任せる
});
