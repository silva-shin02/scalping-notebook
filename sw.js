// Service Worker: Firebase Storage 画像リクエストをキャッシュして
// 2回目以降は Firebase に通信せずローカルから返す
var CACHE_NAME = "sn-images-v1";
var FB_HOST = "firebasestorage.googleapis.com";

self.addEventListener("install", function(event) {
  // 旧バージョンのSWを待たず即座に有効化
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  // 古いキャッシュを削除して新バージョンを即座に全タブに適用
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event) {
  // Firebase Storage へのリクエストのみ対象
  if (event.request.url.indexOf(FB_HOST) === -1) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      // URLで照合（requestのmode差異を無視）
      return cache.match(event.request.url).then(function(cached) {
        if (cached) {
          // ★ キャッシュヒット: Firebase に通信しない
          return cached;
        }
        // キャッシュミス: Firebase から取得してキャッシュに保存
        return fetch(new Request(event.request.url, { mode: "cors" }))
          .then(function(response) {
            if (response && response.ok) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })["catch"](function() {
            // CORSが使えない場合はno-corsで再試行（opaque responseでもブラウザは表示できる）
            return fetch(event.request);
          });
      });
    })
  );
});
