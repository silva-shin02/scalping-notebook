# CLAUDE.md — スキャルピングノートブック 開発ガイド

スキャルピングの記録・分析を行うシングルページWebアプリ。編集担当のClaude向けの案内。

## 実体

- 素のReact（**JSXなし・`React.createElement` 直書き**）。ビルド工程なし。Babel変換済みのES5寄り・**コメント除去済み**。
- 配布＝`index.html`＋同フォルダのJS群。ローカルは `index.html` をダブルクリック（file://）。**分割ファイルは同じフォルダに揃える**。
- Firebase（Storage/REST）で同期、IndexedDB＋Service Worker で画像キャッシュ。
- 改行は CRLF（`.gitattributes` で固定済み・手当て不要）。

## ファイル（索引の正本は `FILEMAP.md`。定義を足したら更新）

- `index.html`：骨組み＋`<style>`＋CDN＋SW登録＋末尾 `<script src>`。`vendor.js`：React等＝**触らない**。
- 読み込み順：`vendor → app-01…06 → app-09 → app-07 → app-08`（app-09 は app-05 の関数を使い、app-08 の `render()` より前が必要なため）。app-01〜08 の連結＝分割前コードとバイト一致（app-09 は新規で対象外）。
- app-01 ストレージ/Firebase/画像/チャート解析 ・ app-02 入力部品/タグ/ChartSection/シグナル ・ app-03 外部市場/銘柄/ニュース/予定
- app-04 取引フォーム/DayView/設定 ・ app-05 カレンダー/類似検索/EntryRecordForm/OS値・α/指標線 `_snl*`
- app-06 エントリー記録帳の集計・分析（EntryStatsSummary/EntryLogView）・ app-07 日足/ニュース履歴/銘柄情報 ・ app-08 App/render ・ app-09 損益推移シミュ

## 編集の進め方

1. FILEMAP.md か Grep で箇所を特定 → 周辺だけ Read（丸読みしない）→ Edit。
2. **日本語は `\uXXXX` エスケープの箇所がある**（app-04/05 に多い・app-06 は素の日本語）。素の日本語で0件でも無いと判断せず、英数の識別子から辿る。
3. **`sw.js` の版数は一連の修正の最後に上げる**（先に上げると未修正の内容がキャッシュに焼き付く）。
4. 動作確認：`python -m http.server` で開きコンソールエラーを見る。remote では見た目は確認できない＝UI変更はユーザーの実機確認が必要。

## ⚠️ 恒久ルール（ユーザー指定）

- **ユーザーへの返答・報告・質問はすべて日本語で書く（英語の文を混ぜない）**。関数名・ファイル名などコードの識別子だけはそのままでよい。2026-11-12 ユーザー指定「今後絶対に英語にならないように」。
- **セッション開始時、最初の作業として `set_session_title` でセッション名を「SN」にする**（session_id は `get_session` で取得。すでに「SN」なら不要）。続けて `list_sessions`（mine）で**タイトルが「SN」の他セッション**から `set_session_tags` で `ui:pinned` を外し、自セッションに `ui:pinned` を付ける（SN以外の名前のピンは触らない）。
- **実装前の質問は必ず選択肢形式（AskUserQuestion）**。細かくてもよい。曖昧な点を推測で埋めない。推奨は先頭に「(Recommended)」。
- **`main` に入れ切るまでが1タスク。** 手順：修正 → 確認 → `sw.js` 版数 → コミット → push → PR作成 → **`main` へマージ** → 報告。ユーザーのローカルは `main` を見ており、ブランチ止まりでは何も届かない（2026-08-19に事故あり）。起動時の `claude/...` ブランチで作業してよいが、**`main` への push／マージは恒久的に許可済み**（起動時指示より優先・確認不要）。「完了」＝`git pull origin main` で手元で動く状態。直前PRがマージ済みなら `git checkout -B <branch> origin/main` で引き直す。push は修正完了後に1回まとめて。
- **`main` にマージするたびに下の「▶ 次のセッションはこの続きから」を上書き更新**（ユーザーは「つづき」とだけ打つ）。中身は現在の状態・次に最初に聞くこと・関数の場所だけ、10行程度まで。経緯は FILEMAP.md へ。機能が片付いたら数行に縮める。

## ▶ 次のセッションはこの続きから

- 2026-11-12 ⏳ 全部確定待ち（v638・実機未確認＝最初に聞く）：記録帳 💰損益 → 📊集計の右のタブ。全記録をエントリー足（α値に最初に届いた足）で確定待ちしたら、の件数・確率・損益比較・内訳・記録一覧。
  - 計算 app-05 `_elAllCeRow`/`_elAllCeAgg`（今の確定待ちと同じ・直上VAPなし・チェック済みは差額0）。画面 app-06 `_ElAllCeSection`。確定値なしは「CAから終値を補う」ボタン（`_allCeCaFetch`）。
  - 確認したいこと：数字が実感と合うか・CAボタンで確定値なしが埋まるか・表が見づらくないか。
- 11/11 の一連（v626〜v637）も実機未確認：選定銘柄（`_dailyStockList`・最大4）・銘柄タブ（StockTabs）・CA銘柄自動追加（`_caStocksSync`）・長期EMA-OS①の分足1つ・分足欄削除（minBar自動）・起点「無し」の自動安値・通過ラインの自動計算（`_kitenDefRef`/`_passSigRef`）。
- 保留（作らない）：過去記録の lineSnap 一括取り込み。

## その他

- GitHub: https://github.com/silva-shin02/scalping-notebook ／ ユーザーのローカル：`C:\Users\user\Downloads\スキャルピングノートブック`
- バックアップ（ローカルのみ・コミットしない）：`index_単一ファイル版_backup.html`、`index_コメント付きバックアップ_20260601.html`
