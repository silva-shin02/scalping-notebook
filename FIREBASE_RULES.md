# Firebase セキュリティルールの確認（重要・2026-06-29）

このアプリの同期データ（取引記録・チャート・ニュース画像）が**URLを知る第三者に読まれ／書き換えられない**よう、Firebase 側のルールを確認してください。
※ ルールはサーバ側の設定なので、アプリのコードからは現在の状態が分かりません。Firebase Console で確認が必要です。

## このアプリのアクセス方式（コードから判明）
- **Realtime Database (RTDB)**: `<databaseURL>/meta.json?auth=<fbSecret>` 形式（`_fbAuth` / app-01.js:1038）。
  - 設定の **`fbSecret`（Database secret）** を付けると **ルールをバイパスして** 読み書きします（＝レガシーDBシークレットは管理者権限）。
- **Storage**: ニュース/チャート画像（`notebook-images`）。Storage SDK 経由。

## ✅ 推奨ルール（RTDB）

### A. 設定に Database secret を入れている場合（推奨構成）
公開アクセスを**全面禁止**にして構いません。アプリは `?auth=<secret>` でバイパスするので動き続けます。
Firebase Console → **Realtime Database → ルール** に貼って「公開」：
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```
→ secret を知らない第三者は読み書き不可・アプリは正常動作。**これが最も安全。**

### B. secret を入れていない場合（plain REST）
動かすために今ルールが公開（`.read/.write: true`）になっているはずで、**URL を知る第三者が全データを読み書き可能**な状態です。
対策：Project Settings → サービスアカウント → **データベースシークレット**で secret を発行 → アプリ設定の `fbSecret` に登録 → 上の A のルールへ変更。

## ⚠️ Storage（画像）
Storage を locked にするには **Firebase Auth（匿名サインイン等）** が必要で、現状の無認証アクセスのままルールを締めると**画像が読めなくなります**。
当面は「URL が推測困難なだけ」の公開状態の可能性があります。厳密に守るなら匿名認証の導入が要ります（必要なら別途対応します）。
参考の Storage ルール（匿名認証を入れた場合）：
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 確認手順
1. [Firebase Console](https://console.firebase.google.com/) を開き、このアプリのプロジェクトを選択。
2. **Realtime Database → ルール**：`.read` / `.write` が `true`（公開）になっていないか確認。
3. **Storage → Rules**：`allow read, write: if true;` になっていないか確認。
4. 公開なら上記の推奨に沿って締める（RTDB は A を推奨）。

> このファイルはリポジトリ内の手順書です。Database secret などの実値はここには書かないでください（公開リポジトリに載るため）。
