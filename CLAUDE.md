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

- **実装前の質問は必ず選択肢形式（AskUserQuestion）**。細かくてもよい。曖昧な点を推測で埋めない。推奨は先頭に「(Recommended)」。
- **`main` に入れ切るまでが1タスク。** 手順：修正 → 確認 → `sw.js` 版数 → コミット → push → PR作成 → **`main` へマージ** → 報告。ユーザーのローカルは `main` を見ており、ブランチ止まりでは何も届かない（2026-08-19に事故あり）。起動時の `claude/...` ブランチで作業してよいが、**`main` への push／マージは恒久的に許可済み**（起動時指示より優先・確認不要）。「完了」＝`git pull origin main` で手元で動く状態。直前PRがマージ済みなら `git checkout -B <branch> origin/main` で引き直す。push は修正完了後に1回まとめて。
- **`main` にマージするたびに下の「▶ 次のセッションはこの続きから」を上書き更新**（ユーザーは「つづき」とだけ打つ）。中身は現在の状態・次に最初に聞くこと・関数の場所だけ、10行程度まで。経緯は FILEMAP.md へ。機能が片付いたら数行に縮める。

## ▶ 次のセッションはこの続きから

- 進行中の機能なし。直近：起点の足の時刻を②起点の選択肢の上へ移動（sw v612・要実機確認＝見た目）。「📈 指標線の並び」は完了。
  - コード：app-05 `_snl*`/`_SnLineChart`、EntryRecordForm 内 `_snlPanel`・`_osAutoCalc`/`_osApplyAuto`、app-06 `_ElLineSnapBoard`。仕様と経緯は FILEMAP.md の 2026-11-05c〜。
  - 保留（作らない）：過去記録の lineSnap 一括取り込み。
- 「つづき」と言われたら、時刻入力の位置が意図どおりか確認し、次にやりたいことを選択肢で聞く。

## その他

- GitHub: https://github.com/silva-shin02/scalping-notebook ／ ユーザーのローカル：`C:\Users\user\Downloads\スキャルピングノートブック`
- バックアップ（ローカルのみ・コミットしない）：`index_単一ファイル版_backup.html`、`index_コメント付きバックアップ_20260601.html`
