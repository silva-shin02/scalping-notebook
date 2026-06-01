# CLAUDE.md — スキャルピングノートブック 開発ガイド

スキャルピング（短期売買）の記録・分析を行うシングルページWebアプリのリポジトリREADME。
編集を担当するClaude向けの案内。

## このアプリの実体

- 素のReact（**JSXは使わず `React.createElement` 直書き**）。ビルド工程なし。
- 配布形態は**1つのHTML＋同フォルダのJSファイル群**。ローカルでは `index.html` をダブルクリック（file://）して使う。
- Firebase（Storage/REST）でマルチデバイス同期、IndexedDB＋Service Workerで画像キャッシュ。
- コードはBabel変換済みのES5寄り。**改行コードはCRLF**。**コメントは除去済み**（2026-06-01）。

## ファイル構成（2026-06-01に単一index.htmlから分割）

| ファイル | 役割 | 編集 |
|---|---|---|
| `index.html` | HTML骨組み＋`<style>`＋Firebase CDN＋SW登録＋末尾の `<script src>` 群（約4KB） | スタイル/構造のみ |
| `vendor.js` | React / ReactDOM / Babelヘルパー | **触らない** |
| `app-01.js`〜`app-08.js` | アプリ本体（コンポーネント・ロジック） | ここを編集 |
| `FILEMAP.md` | **どのファイルにどの関数/コンポーネントがあるか**の対応表（正本の索引） | 定義追加時に更新 |

読み込み順は `index.html` 末尾の `<script src>` で固定：`vendor.js → app-01.js → … → app-08.js`。
全 `app-*.js` を連結すると分割前のコードとバイト一致する（トップレベル文の境界でのみ分割）。

## 機能 → ファイル クイックマップ（詳細はFILEMAP.md / Grepで確認）

- **ストレージ・Firebase同期・画像処理・チャート解析**: `app-01.js`（stLoad/stSave/fbGet/fbPut/imgSrc/analyzeChart 等）
- **入力UI部品・タグ・チャート(ChartSection)・シグナル**: `app-02.js`
- **外部市場(ForeignMarketTable)・銘柄タブ・ニュースタブ・予定(EventsTab)**: `app-03.js`
- **取引フォーム・日別ビュー(DayView)・銘柄クイック参照・設定(SettingsModal)**: `app-04.js`
- **カレンダー・類似検索/イベント検出(_sim/_evt/_pat)・エントリー記録フォーム(EntryRecordForm)・OS値/α分析(VirtualAlphaCalc)**: `app-05.js`
- **エントリー記録帳の集計・一覧（EntryStatsSummary / EntryLogView。「結果別平均OS値」等の分析欄もここ）**: `app-06.js`
- **日足チャート・ニュース履歴・総括履歴・銘柄情報タブ・銘柄履歴**: `app-07.js`
- **ホーム予定モーダル・ルートコンポーネント(App)・描画開始(render)**: `app-08.js`

## 編集の進め方（トークン節約の方針）

1. まず `FILEMAP.md` か Grep で**該当ファイルと箇所を特定**する。
2. その**該当箇所の周辺だけ Read**（全ファイルを丸読みしない）。
3. Edit で修正。新しいトップレベル定義を足したら **FILEMAP.md も更新**。
4. 修正完了後、**1回だけまとめて push**（指示ごとに小刻みpushしない）。

## 動作確認

- 手早く: ローカルHTTPサーバ `python -m http.server` で `index.html` を開きコンソールエラーを確認。
  （`.claude/launch.json` に `scalping` 等の設定あり）
- ローカル利用は `index.html` をダブルクリック。**分割ファイルは必ず同じフォルダに揃える**。

## push 手順

```powershell
Set-Location "C:\Users\user\Downloads\スキャルピングノートブック"
git add <変更したファイル>          # 例: app-06.js index.html FILEMAP.md
git commit -m "fix: 説明"
git push origin main
```

GitHub: https://github.com/silva-shin02/scalping-notebook

## バックアップ（コミットしない・ローカルのみ）

- `index_単一ファイル版_backup.html` … 分割直前の単一ファイル版
- `index_コメント付きバックアップ_20260601.html` … コメント除去前
