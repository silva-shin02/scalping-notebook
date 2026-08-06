// ===== 📈 損益推移シミュレーター 2026-08-05 =====
// 記録帳の💰損益タブ（全銘柄合算）の「🧮 シミュ」の右に置く新タブ。
// 前提（取引資金・株数・1日あたり収益・生活費・積立ルール等）を入れると、指定期間の月次推移を返す。
//
// ⚠️読み込み順: app-06.js の直後・app-08.js（render）より前。
//   app-08.js の render() は即実行なので、それより後に置くとタブを開いた瞬間に undefined になる。
//   グレード判定に app-05.js の _profitGradeFromPnl を使うので app-05.js より後であることも必要。
//
// 【口座モデル】ユーザー決定 2026-08-05 = モデルA（生活費はトレード利益から直接引く）。
//   利益(税引後) → 生活費を支払 → 余剰 → 生活口座（目標まで積立） → あふれた分が取引資金。
//   モデルB（生活口座から生活費を出す）と総資産の推移は完全に一致する（差は残高の内訳だけ）ので、
//   将来Bを足すなら⑤⑥の2行を差し替えるだけで済む。
//
// 【収益の単位】「1日あたり損益（100株換算・円）」で持つ。アプリ既存のグレード（_profitGradeFromPnl:
//   S=2501〜/A=2001〜/B=1001〜/C=1〜）と同じ土俵なので、記録帳の実績をそのまま既定値にできる。
//   月次は 1日額 × 営業日数 で内部換算する（月額で持つと実績と単位が食い違って自動入力できない）。

// "YYYY-MM" ⇔ 通し月番号。月またぎの加減算を素直に書くための内部表現。
function _dtsYmToIdx(ym) {
  if (!ym || typeof ym !== "string" || ym.length < 7) return null;
  var y = +ym.slice(0, 4), m = +ym.slice(5, 7);
  if (!y || !m || m < 1 || m > 12) return null;
  return y * 12 + (m - 1);
}
function _dtsIdxToYm(i) {
  var y = Math.floor(i / 12), m = (i % 12) + 1;
  return y + "-" + (m < 10 ? "0" + m : "" + m);
}
// 表示用「2026年8月」。テーブルの行ラベル・節目の文言に使う。
function _dtsYmLbl(ym) {
  var i = _dtsYmToIdx(ym); if (i == null) return ym || "";
  return Math.floor(i / 12) + "年" + ((i % 12) + 1) + "月";
}
// 期間の月数（両端を含む）。endYm が startYm より前なら null。
function _dtsMonthCount(startYm, endYm) {
  var s = _dtsYmToIdx(startYm), e = _dtsYmToIdx(endYm);
  if (s == null || e == null || e < s) return null;
  return e - s + 1;
}

// 期間別テーブル（生活費 livingCost[] / 積立 drip[]）から「その月に効いている行」を引く。
// from が当月以前の行のうち最も新しいものを採用＝生活費も積立も同じ規約で揃えてある。
// 該当なし（開始月より後にしか行が無い）は null＝その月は 0 扱い。
function _dtsPickByYm(rows, ym) {
  if (!rows || !rows.length) return null;
  var idx = _dtsYmToIdx(ym); if (idx == null) return null;
  var best = null, bestIdx = -1;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i]; if (!r || !r.from) continue;
    var fi = _dtsYmToIdx(r.from);
    if (fi == null || fi > idx) continue;
    if (fi > bestIdx) { bestIdx = fi; best = r; }
  }
  return best;
}

// ===== 期間別テーブルの「発動条件つきの行」 2026-08-06L =====
// ユーザー要望「⑤で方式を選べるように。『月初取引株数が〇株以上になったら』という方式もほしい」。
// 行の trig: "ym"（既定・従来＝◯年◯月から）／"shares"（月初取引株数が◯株以上）／"capital"（月初取引資金が◯円以上）。
// ⚠️trig が無い既存の行は必ず "ym" 扱い＝**保存済みの前提は1円も動かない**。
//
// ★成立のタイミングが⑤の切替（livingSwitch）と違う。ここは**その月の株数・月初資金で判定して当月から効く**。
//   切替は「月末で判定→翌月から」。ユーザー指定が「**月初**取引株数が◯株以上になったら」なので当月から効かせる。
//   ⚠️2つのタイミングが同居するので、どちらの話をしているか必ず確認すること（UIの注記にも書いてある）。
// ★一度成立したら戻さない（切替と同じ規約）。株数が下がっても発動済みのまま＝一時的な増減で往復させない。
//
// act[i]＝その行が発動した月index（未発動は null）。⚠️"ym" の行だけは idx ではなく**その行の from の index**を入れる
//   ＝従来の _dtsPickByYm（いちばん遅い from が勝つ）と完全に同じ並びを保つため。条件行は「実際に成立した月」。
function _dtsActivate(rows, act, idx, shares, capOpen) {
  for (var i = 0; i < (rows || []).length; i++) {
    if (act[i] != null) continue;
    var r = rows[i]; if (!r) continue;
    var t = r.trig || "ym";
    if (t === "shares") {
      var th = _dtsNumOrNull(r.shares);
      if (th != null && shares >= th) act[i] = idx;
    } else if (t === "capital") {
      var tc = _dtsNumOrNull(r.capital);
      if (tc != null && capOpen >= tc) act[i] = idx;
    } else if (t === "capitalBelow") {
      // ⑧の追加入金用 2026-08-06M＝「資金が◯円を下回ったら」。他の条件と向きが逆なのでここだけ <=。
      var cb = _dtsNumOrNull(r.capitalBelow);
      if (cb != null && capOpen <= cb) act[i] = idx;
    } else {
      var fi = r.from ? _dtsYmToIdx(r.from) : null;
      if (fi != null && fi <= idx) act[i] = fi;
    }
  }
}
// 発動済みのうち「いちばん最近発動した行」の**添字**を返す（無ければ -1）。
// 同着なら配列で先に書いたほう（_dtsPickByYm と同じ規約）。
// ⚠️添字を返すのは「どの行が実際に使われたか」を呼び出し側で記録するため 2026-08-06L。
//   同着で負けた行は**結果が1円も変わらない**（実測: 既存の「2026-11から」がある状態で
//   「1,000株以上」を足すと、株数が1,000に届くのがちょうど2026-11なので同着負けして無反応）。
//   これは前に⑤で直した「押しても効かない」と同じ種類なので、使われなかった行を必ず警告に出す。
function _dtsPickActIdx(rows, act) {
  var bi = -1, bv = null;
  for (var i = 0; i < (rows || []).length; i++) {
    if (act[i] == null) continue;
    if (bv == null || act[i] > bv) { bv = act[i]; bi = i; }
  }
  return bi;
}
// 行の条件を1行の日本語にする（警告・UIの両方で使う＝文言を2箇所に書かない）。
function _dtsTrigLabel(r) {
  var t = (r && r.trig) || "ym";
  if (t === "shares") { var s = _dtsNumOrNull(r.shares); return "月初取引株数が " + (s == null ? "—" : s.toLocaleString()) + "株以上"; }
  if (t === "capital") { var c = _dtsNumOrNull(r.capital); return "月初取引資金が " + (c == null ? "—" : _dtsFmtMan(c)) + "円以上"; }
  if (t === "capitalBelow") { var cb = _dtsNumOrNull(r.capitalBelow); return "月初取引資金が " + (cb == null ? "—" : _dtsFmtMan(cb)) + "円以下"; }
  return (_dtsYmLbl(r && r.from) || "—") + "から";
}
// 条件の値そのもの（空かどうかの検査・並べ替えのキーに使う）。
function _dtsTrigVal(r) {
  var t = (r && r.trig) || "ym";
  if (t === "shares") return _dtsNumOrNull(r.shares);
  if (t === "capital") return _dtsNumOrNull(r.capital);
  if (t === "capitalBelow") return _dtsNumOrNull(r.capitalBelow);
  return (r && r.from) ? _dtsYmToIdx(r.from) : null;
}

// ===== 前提の正規化 2026-08-06M =====
// ③1日あたり・⑦メイン株価・⑧外部資金を「1つの値」から**期間別テーブル**へ広げた（ユーザー要望）。
// ⚠️保存済みcfgは古い形（スカラー／単数の injection）なので、読むたびにここで配列へ寄せる。
//   逆に保存側は**古いキーも書き続ける**（dailyPer100 / mainPrice / injection）＝旧版の端末が読んでも
//   先頭行の値で従来どおり動く。dailyStock を複数化した時と同じ後方互換の作法。
// ⚠️ここは**純粋な変換だけ**にすること。既定値の判断（0以下を既定に戻す等）は _dtsSimulate 側の責務で、
//   両方でやると「どちらが効いたのか」が追えなくなる。
function _dtsNormCfg(cfg) {
  var c = cfg || {}, out = {}, k;
  for (k in c) { if (Object.prototype.hasOwnProperty.call(c, k)) out[k] = c[k]; }
  if (!(Array.isArray(c.perDayRows) && c.perDayRows.length)) {
    out.perDayRows = [{ trig: "ym", from: c.startYm || "", amount: +c.dailyPer100 || 0 }];
  }
  if (!(Array.isArray(c.priceRows) && c.priceRows.length)) {
    out.priceRows = [{ trig: "ym", from: c.startYm || "", amount: _dtsNumOrNull(c.mainPrice) }];
  }
  if (!(Array.isArray(c.injections) && c.injections.length)) {
    var oi = c.injection;
    out.injections = (oi && oi.ym) ? [{ trig: "ym", from: oi.ym, amount: +oi.amount || 0, sharesAfter: _dtsNumOrNull(oi.sharesAfter) }] : [];
  }
  if (!Array.isArray(out.livingCost)) out.livingCost = [];
  if (!Array.isArray(out.drip)) out.drip = [];
  return out;
}
// テーブルの「その月に効いている値」。行が無い／未入力なら fallback。
function _dtsRowAmt(rows, act, fallback) {
  var i = _dtsPickActIdx(rows, act);
  if (i < 0) return fallback;
  var v = _dtsNumOrNull(rows[i].amount);
  return (v == null) ? fallback : v;
}
// テーブルの代表値＝配列の先頭行（UIも先頭行を主たる欄として出す）。警告・注記用で、計算には使わない。
function _dtsHeadAmt(rows, fallback) {
  var v = _dtsNumOrNull(((rows && rows[0]) || {}).amount);
  return (v == null) ? fallback : v;
}

// 期間別テーブル（④生活費・⑤積立）の「＋途中で変える」で足す行の年月 2026-08-06I。
// ⚠️旧は `from: cfg.startYm`（＝期間の開始月）だった。これは2通りに壊れる:
//   1. 1行目が開始月のまま（既定の前提はまさにこれ）だと**年月が重複**し、_dtsPickByYm は先に書いた行しか採らないので
//      足した行は金額を何に変えても一切効かない＝「押しても何も変わらない」。
//   2. 重複しない場合でも、足した行が**期間の先頭**に入る＝「途中で変える」と言いながら最初の数ヶ月に効く（意図と逆）。
// 正しくは「今ある行のうち最も遅い月の翌月」。埋まっていて空きが無い時は null＝ボタンを押させない。
function _dtsNextFrom(rows, startYm, endYm) {
  var eIdx = _dtsYmToIdx(endYm), best = null;
  for (var i = 0; i < (rows || []).length; i++) {
    var r = rows[i];
    // ⚠️条件つきの行（月初株数／月初資金）は年月を持たないので数えない 2026-08-06L。
    //   数えると from:"" が _dtsYmToIdx で null になるだけだが、将来 from を残したまま方式を変えた行が
    //   混ざると「消したはずの年月」を起点に次の月を決めてしまう。
    if (r && r.trig && r.trig !== "ym") continue;
    var fi = (r && r.from) ? _dtsYmToIdx(r.from) : null;
    if (fi != null && (best == null || fi > best)) best = fi;
  }
  if (best == null) return startYm || null;
  if (eIdx != null && best >= eIdx) return null;   // 最後の月まで行がある＝足す先が無い
  return _dtsIdxToYm(best + 1);
}
// 表示の並び順。⚠️setRow/delRow は**元の添字**を使うので、並べ替えた配列の添字を渡すと別の行を書き換える。
//   必ず {r, i} の組で持ち回ること。
// 2026-08-06L: 条件つきの行（月初株数／月初資金）は年月を持たないので年月では並べられない。
//   年月の行（発動する順に読める）→ 株数の行（しきい値順）→ 資金の行（しきい値順）の順に置く。
function _dtsOrderedRows(rows) {
  var a = [], grp = { ym: 0, shares: 1, capital: 2 };
  for (var i = 0; i < (rows || []).length; i++) a.push({ r: rows[i], i: i });
  var keyOf = function(r) {
    var t = (r && r.trig) || "ym";
    if (t === "shares") return _dtsNumOrNull(r.shares);
    if (t === "capital") return _dtsNumOrNull(r.capital);
    return (r && r.from) ? _dtsYmToIdx(r.from) : null;
  };
  a.sort(function(x, y) {
    var xg = grp[(x.r && x.r.trig) || "ym"], yg = grp[(y.r && y.r.trig) || "ym"];
    if (xg !== yg) return xg - yg;
    var xk = keyOf(x.r), yk = keyOf(y.r);
    if (xk == null && yk == null) return x.i - y.i;
    if (xk == null) return 1;      // 未入力の行は末尾（一度も使われないので目立つ位置に置かない）
    if (yk == null) return -1;
    return (xk - yk) || (x.i - y.i);   // 同着なら元の順＝先に書いたほう（実際に使われるほう）が上
  });
  return a;
}
// 「影になって一度も使われない」行に true。同じ条件の行が2つあると _dtsPickByYm/_dtsPickAct が
// 先に書いたほうを採るので、配列で後ろにある同条件の行が影になる。
// ⚠️比較キーに**方式(trig)を混ぜる**こと 2026-08-06L。混ぜないと「2026-11から」と「株数1,100株以上」が
//   どちらも数値1100…のように衝突して、無関係な行を「使われません」と誤って赤くする。
function _dtsShadowedRows(rows) {
  var seen = {}, out = [];
  for (var i = 0; i < (rows || []).length; i++) {
    var r = rows[i], t = (r && r.trig) || "ym", k = null;
    if (t === "shares") k = _dtsNumOrNull(r.shares);
    else if (t === "capital") k = _dtsNumOrNull(r.capital);
    else k = (r && r.from) ? _dtsYmToIdx(r.from) : null;
    if (k == null) { out[i] = false; continue; }
    var kk = t + "|" + k;
    out[i] = !!seen[kk];
    seen[kk] = true;
  }
  return out;
}

// 空欄を「未設定(null)」として読む。0 と 空欄 を区別したい項目（目標残高・株数上限）に使う。
// "" / null / undefined / NaN → null。それ以外は数値。
function _dtsNumOrNull(v) {
  if (v == null || v === "") return null;
  var n = +v;
  return isFinite(n) ? n : null;
}

// ---- 本体 ----------------------------------------------------------------
// cfg = {
//   startYm, endYm, businessDays,
//   initialCapital, initialLiving, initialShares,
//   dailyPer100, taxRate,
//   livingCost: [{from, amount}, ...],
//   drip:       [{from, mode:"drip"|"fill", amount, target}, ...],
//   stepBase, stepAmount, stepShares, maxShares,
//   mainPrice, marginRate,
//   injection: {ym, amount, sharesAfter}
// }
// 返り値 { error, rows[], summary, marks[] }。
// ⚠️月次ループの①〜⑥は**順序を変えると結果が変わる**。仕様として固定。
function _dtsSimulate(cfg) {
  // ⚠️必ず先に正規化する 2026-08-06M＝古い形（スカラーのdailyPer100/mainPrice・単数のinjection）で
  //   保存されたcfgでも、以降は perDayRows/priceRows/injections の配列だけを見ればよくなる。
  cfg = _dtsNormCfg(cfg);
  var sIdx = _dtsYmToIdx(cfg.startYm), eIdx = _dtsYmToIdx(cfg.endYm);
  if (sIdx == null) return { error: "開始年月が未入力です", rows: [], summary: null, marks: [] };
  if (eIdx == null) return { error: "終了年月が未入力です", rows: [], summary: null, marks: [] };
  if (eIdx < sIdx) return { error: "終了年月は開始年月以降にしてください", rows: [], summary: null, marks: [] };
  var n = eIdx - sIdx + 1;
  if (n > 120) return { error: "期間が長すぎます（上限120ヶ月＝10年）", rows: [], summary: null, marks: [] };

  // 入力の生値(◯◯Raw)と実際に使う値を対で持つ 2026-08-06。食い違ったら必ず warns に出す＝
  // 「欄には0日と出ているのに20日で計算されている」ような黙った既定値差し替えを作らない（⚠️効いていない前提 欄の方針）。
  var daysRaw   = _dtsNumOrNull(cfg.businessDays);
  var days      = Math.max(1, Math.round(+cfg.businessDays || 20));
  // 税率は 0〜90% にクランプ 2026-08-05F。クランプが無いと 200% で手取りがマイナスになり、
  // 「利益を出すほど資金が減る」という意味不明な推移が黙って出ていた（落ちはしないので気づけない）。
  var taxRate   = (cfg.taxRate == null || cfg.taxRate === "") ? 0.20315 : +cfg.taxRate;
  if (!isFinite(taxRate)) taxRate = 0.20315;
  var taxRaw    = taxRate;
  if (taxRate < 0) taxRate = 0;
  if (taxRate > 0.9) taxRate = 0.9;
  // ③1日あたり・⑦株価は**期間別テーブル**（2026-08-06M）。ここで持つのは警告と eff（注記）用の「代表値＝先頭行」だけ。
  // ⚠️月ごとの実効値はループの中の perDayM / priceM。**ループ内でこの2つの変数を使わないこと**（月ごとに変わるので）。
  var perDay    = _dtsHeadAmt(cfg.perDayRows, 0);
  var stepBase  = _dtsNumOrNull(cfg.stepBase);           // null＝②の取引資金（＝開始時）から数える
  // ⚠️0以下は既定値へ戻す 2026-08-06。旧 `Math.max(1, +cfg.stepAmount || 250000)` は**負値だと刻みが1円**になり、
  //   段数が青天井で株数が 4.5e51 株まで飛んでいた（⑥の上限が空欄だと何も止めない）。0を既定に戻す旧挙動は維持。
  var stepAmtRaw = _dtsNumOrNull(cfg.stepAmount);
  var stepAmt   = (stepAmtRaw != null && stepAmtRaw > 0) ? stepAmtRaw : 250000;
  var stepShRaw = _dtsNumOrNull(cfg.stepShares);
  var stepSh    = (stepShRaw != null && stepShRaw > 0) ? stepShRaw : 100;
  // ⚠️0以下の上限は「上限なし」へ正規化する 2026-08-06B。旧はここが 0 のまま下の swShares へ流れ、
  //   ⑤の切替が「株数が 0株 に到達したら」＝**初月末で必ず成立**になっていた。結果「上限は効かないのに
  //   取引資金だけ初月から凍結して株数も伸びない」という二重の壊れ方をしていた（実測: 資金134.1万で12ヶ月固定）。
  var maxShRaw  = _dtsNumOrNull(cfg.maxShares);
  var maxSh     = (maxShRaw != null && maxShRaw > 0) ? maxShRaw : null;   // null＝上限なし
  // ⑥の上限の方式 2026-08-06M: "shares"（既定・従来＝◯株）／"multiple"（取引資金の◯倍まで＝拘束額ベース）。
  // ⚠️"multiple" は月ごとに上限が動く（資金が増えれば上限も上がる）ので、ループの中で毎月出し直す。
  var maxMode   = (cfg.maxMode === "multiple") ? "multiple" : "shares";
  var maxMulRaw = _dtsNumOrNull(cfg.maxMultiple);
  var maxMul    = (maxMulRaw != null && maxMulRaw > 0) ? maxMulRaw : null;
  // ⑥の方式 2026-08-06J（ユーザー相談「〇円増えたら、より 余力使用率が90%を超えない範囲で最大数のほうがよいか」）。
  //   "amount"（既定・従来）＝資金が◯円増えるごとに◯株。"power"＝毎月「余力使用率が目標を超えない最大株数」。
  // ⚠️既存の保存済みcfgには stepMode が無いので、**未設定は必ず "amount"**（＝従来と1円も変わらない）。
  // ⚠️従来方式は実測すると「余力95%を上限に最大枚数」と**ビット単位で同じ結果**になる（刻み20万・株価6,500円・保証金率30%）。
  //   90%を保つのに必要な資金は 100株あたり price*100*rate/0.90 円で、刻み額がそれより小さいと段ごとに余力が上がっていく。
  var stepMode  = (cfg.stepMode === "power") ? "power" : "amount";
  var tgtUseRaw = (cfg.targetUse == null || cfg.targetUse === "") ? 0.90 : +cfg.targetUse;
  var tgtUse    = tgtUseRaw;
  if (!isFinite(tgtUse) || tgtUse <= 0) tgtUse = 0.90;
  if (tgtUse > 1) tgtUse = 1;   // 100%超＝保証金を超えて建てる指定なので受け付けない（1.0で頭打ち）
  // 方式Bで「資金が減った月は株数も下げるか」。既定は false＝**下げない**（このシミュ全体の規約に合わせる）。
  // ⚠️下げない場合、資金が減ると余力使用率は目標を超える＝方式Bの看板どおりにはならない。超えた月は月次表の色と
  //   ⚠️欄で分かるようにする（黙って目標を割らない）。
  var stepDown  = (cfg.stepDown === true);
  // ⚠️株価・保証金率は0以下だと余力の計算そのものが成り立たない 2026-08-06。株価は0（＝未入力）へ寄せ、
  //   保証金率は税率と同じ作法で「0%超〜100%」にクランプする。旧は負値がそのまま通り、月次は全部「—」なのに
  //   開始時行と合計行だけ「信用余力 −433万・理論最大株数 −700株」が出ていた。
  var mainPriceRaw = _dtsHeadAmt(cfg.priceRows, null);
  var mainPrice = (mainPriceRaw != null && mainPriceRaw > 0) ? mainPriceRaw : 0;
  var mgnRaw    = (cfg.marginRate == null || cfg.marginRate === "") ? 0.30 : +cfg.marginRate;
  var marginRt  = mgnRaw;
  if (!isFinite(marginRt) || marginRt <= 0) marginRt = 0.30;
  if (marginRt > 1) marginRt = 1;
  // 余力チェック（拘束額・必要保証金・バッファ・余力使用率・理論最大株数）が成り立つ条件 2026-08-06。
  // ⚠️株価が未入力だと拘束額が0＝余力使用率が全月0%になり、_dtsUseTone が緑の「余裕」を出して危険が完全に隠れる。
  //   計算できない時は 0 ではなく null を返して表に「—」を出す。
  var mgnOk     = (mainPrice > 0 && marginRt > 0);

  var capital = +cfg.initialCapital || 0;
  var living  = +cfg.initialLiving  || 0;
  var shares  = Math.max(0, +cfg.initialShares || 0);

  // 株数ラダーの基準点。「基準の取引資金から何円増えたか」で段数を数える。
  // cfg.stepBase＝⑥で明示した「月末の資金口座が◯円になったら」。未入力(null)なら②の取引資金＝開始時の資金。
  // ⚠️stepBaseは基礎取引株数とセットの意味＝「資金がstepBaseだった時に基礎取引株数だった」。
  //   今の資金がstepBaseより多ければ初月からその差分の段数が乗る（後付けの基準点なので当然そうなる）。
  // ⚠️⑧の投入との関係は2026-08-05Aで反転した＝**stepBaseを明示している時は⑧が起点を張り替えない**。
  //   詳細は①の分岐のコメントを見ること（ここに二重に書くと片方だけ古くなる）。
  var base = (stepBase != null ? stepBase : capital), baseShares = shares;
  var initShares = shares;   // 開始時の株数＝節目の「600 → 700株」の左側に使う（初月に段が上がる時の起点）2026-08-06

  // ⑧は cfg.injections（複数行・条件つき）が正 2026-08-06M。単数の cfg.injection は _dtsNormCfg が変換済み。
  var injTotal = 0;

  // ★残金を全額 生活口座へ回す切替 2026-08-05L（ユーザー決定）。旧「株数が⑥の上限に達したら」を一般化したもの。
  //   mode: off / shares（株数が◯株）/ capital（取引資金が◯円超）/ ym（指定の年月から）。
  // ⚠️判定は**月末の値**で行い、効き始めるのは**翌月**＝⑥の「月末に◯円になった次の月から」と同じ作法に揃える
  //   （旧実装は到達した当月から効いていて、ユーザーの言う「次の月から」と食い違っていた）。
  // ⚠️一度成立したら**戻さない**（ユーザー決定②）。資金が減って条件を割っても取引資金へは戻さない
  //   ＝「もう十分だから生活へ回す」という意思決定なので、一時的な減少で往復させない。
  // ⚠️年月指定だけは絶対指定なので「達した翌月」の概念が無く、その月から効かせる。
  var sw = cfg.livingSwitch || {};
  var swMode = sw.mode || "off";
  var swShares = _dtsNumOrNull(sw.shares); if (swShares == null) swShares = maxSh;   // 空欄なら⑥の上限（決定④）
  var swCap = _dtsNumOrNull(sw.capital);
  var swIdx = sw.ym ? _dtsYmToIdx(sw.ym) : null;
  var switched = false, swStartYm = null;

  // 前提そのものの警告 2026-08-05B。**入れたのに効かない入力**を黙って捨てないための受け皿。
  // 節目(marks)は「何月に何が起きたか」の時系列なので、時点を持たない設定の警告はここに分ける。
  // ⚠️**この宣言より前で warns.push を書かないこと** 2026-08-05N。var は巻き上げで undefined になるだけで
  //   エラーにならず、条件が揃った時だけ「Cannot read properties of undefined (reading 'push')」で画面ごと落ちる
  //   （実際に⑤の切替の警告3行をここより上に置いてしまい、切替を選んだ瞬間にクラッシュした）。
  var warns = [];
  if (swMode === "shares" && swShares == null) warns.push("⑤の切替が「株数」ですが、株数も⑥の上限も未入力なので切り替わりません。");
  if (swMode === "capital" && swCap == null) warns.push("⑤の切替が「取引資金」ですが、金額が未入力なので切り替わりません。");
  if (swMode === "ym" && swIdx == null) warns.push("⑤の切替が「年月」ですが、年月が未入力なので切り替わりません。");
  // ⑤切替の年月が期間の外＝黙って無視される／黙って初月から効く 2026-08-06。
  // ④⑤の期間別テーブルには同じ趣旨の検算（_chkRows）が前からあるのに、切替の年月だけ素通しだった。
  if (swMode === "ym" && swIdx != null && swIdx > eIdx) {
    warns.push("⑤の切替の年月「" + _dtsYmLbl(sw.ym) + "」は期間の終わり（" + _dtsYmLbl(cfg.endYm) + "）より後なので、一度も切り替わりません。");
  }
  if (swMode === "ym" && swIdx != null && swIdx < sIdx) {
    warns.push("⑤の切替の年月「" + _dtsYmLbl(sw.ym) + "」は期間の始まり（" + _dtsYmLbl(cfg.startYm) + "）より前なので、開始月から切り替わっています。");
  }
  // ⑥の上限に0以下を入れると maxSh がそのまま切替のしきい値になり、「株数が0株に到達」＝初月末で必ず成立する。
  if (swMode === "shares" && swShares != null && swShares <= 0) {
    warns.push("⑤の切替のしきい値が " + swShares.toLocaleString() + "株 です（⑥の上限が0以下だとこうなります）。開始月の翌月から必ず切り替わり、取引資金がそこで止まります。");
  }
  if (taxRaw !== taxRate) {
    warns.push("③の税率 " + (Math.round(taxRaw * 1000) / 10) + "% は範囲外なので " + (Math.round(taxRate * 1000) / 10) + "% として計算しています（0〜90%）。");
  }
  // ④⑤の期間別テーブルの検算 2026-08-05D。_dtsPickByYm は「from が当月以前で最も新しい行」を採るので、
  // ⚠️期間より後ろの行は一度も選ばれない／同じ from が2行あると後ろが必ず負ける（`fi > bestIdx` の厳密比較）。
  //   どちらも黙って消えるので、入れたのに効かない行として名指しする。
  var _chkRows = function(arr, lbl) {
    var seen = {}, i, r, fi;
    for (i = 0; i < (arr || []).length; i++) {
      r = arr[i]; if (!r) continue;
      // 条件つきの行（trig="shares"/"capital"）は年月を持たない 2026-08-06L。年月の検査に掛けると
      // ⚠️「年月が空の行があります」が必ず出る＝入れた瞬間に狼少年になるので、条件行は別に検査する。
      var _t = r.trig || "ym";
      if (_t !== "ym") {
        var _th = _dtsTrigVal(r);
        if (_th == null) warns.push(lbl + "に条件つきの行がありますが、条件の数値が空なので一度も発動しません。");
        else if (_th <= 0 && _t !== "capitalBelow") warns.push(lbl + "の「" + _dtsTrigLabel(r) + "」は開始月から必ず成立します（0以下のため）。");
        continue;
      }
      // 年月が空／年月として読めない行は _dtsPickByYm(49行)が黙って飛ばす＝入れたのに一度も使われない 2026-08-06。
      if (!r.from) { warns.push(lbl + "に年月が空の行があります。年月を入れないとその行は一度も使われません。"); continue; }
      fi = _dtsYmToIdx(r.from);
      if (fi == null) { warns.push(lbl + "の「" + r.from + "」は年月として読めないので、その行は一度も使われません。"); continue; }
      if (fi > eIdx) warns.push(lbl + "の「" + _dtsYmLbl(r.from) + "から」の行は期間の終わり（" + _dtsYmLbl(cfg.endYm) + "）より後なので、一度も使われていません。");
      if (seen[fi]) warns.push(lbl + "に「" + _dtsYmLbl(r.from) + "から」の行が2つ以上あります。先に書いたほうだけが使われ、あとの行は無視されます。");
      seen[fi] = 1;
    }
    // ⚠️「最初の行が開始月より後＝それまで0円」は警告にしない 2026-08-05D。
    //   「積立は11月から始める」は正当な設定で、実際にユーザーの前提がそれ（①9月開始・⑤11月から）。
    //   意図どおりの設定を「効いていない前提」欄に出すと狼少年になり、本物の警告まで読まれなくなる。
  };
  _chkRows(cfg.livingCost, "④生活費");
  _chkRows(cfg.drip, "⑤積立");
  _chkRows(cfg.perDayRows, "③1日あたり");
  _chkRows(cfg.priceRows, "⑦メイン株価");
  _chkRows(cfg.injections, "α外部資金");

  // 「0や負を入れたのに既定値で計算される」＝`+cfg.X || 既定` のイディオムの副作用。入力欄の表示と計算が
  // 食い違うので黙って通さない（0で割れないため既定に戻す挙動自体は維持する）2026-08-05D／2026-08-06に負値まで拡張。
  if (daysRaw != null && Math.round(daysRaw) !== days) {
    warns.push("①の月間営業日 " + daysRaw + "日 では計算できないので " + days + "日 として計算しています。");
  }
  // ⚠️方式B（余力ベース）では刻み額・増える株数・起点を一切見ない＝この2本を出すとノイズになる 2026-08-06J。
  if (stepMode === "amount" && stepAmtRaw != null && !(stepAmtRaw > 0)) {
    warns.push("⑥の刻み額が " + _dtsFmtYen(stepAmtRaw) + "円 です。0円以下では段を数えられないので " + _dtsFmtYen(stepAmt) + "円 として計算しています。");
  }
  if (stepMode === "amount" && stepShRaw != null && !(stepShRaw > 0)) {
    warns.push("⑥の「増えるごとに」の株数が " + stepShRaw.toLocaleString() + "株 です。0株以下では段を上げられないので " + stepSh.toLocaleString() + "株 として計算しています。");
  }
  if (stepMode === "power") {
    if (tgtUseRaw !== tgtUse) {
      warns.push("⑥の目標余力使用率 " + (Math.round(tgtUseRaw * 1000) / 10) + "% は範囲外なので " + (Math.round(tgtUse * 1000) / 10) + "% として計算しています（0%超〜100%）。");
    }
    // 株価が無いと目標から株数を逆算できない＝株数が増えなくなる。黙って固定されると原因が分からない。
    // ⚠️ここで「◯株のまま」と具体数を書かないこと＝⑧の「投入直後の株数」はこの分岐を通らず株数を置き換えるので、
    //   期末が指定株数になり**警告の数字と表の数字が食い違う**（実測: 警告は600株と言い、表は1,000株で終わる）。
    if (!mgnOk) {
      warns.push("⑥が「余力使用率から逆算」ですが、⑦のメイン株価が無いので株数を計算できません。株数は増えません（⑧で投入直後の株数を指定している場合、その月だけは変わります）。");
    }
  }
  if (mgnRaw !== marginRt) {
    warns.push("⑦の委託保証金率 " + (Math.round(mgnRaw * 1000) / 10) + "% は範囲外なので " + (Math.round(marginRt * 1000) / 10) + "% として計算しています（0%超〜100%）。");
  }
  // 株価が無いと⑦の欄（拘束額・必要保証金・バッファ・余力使用率・理論最大株数）が丸ごと計算できない。
  if (!mgnOk) {
    warns.push("⑦のメイン株価が" + (mainPriceRaw != null && mainPriceRaw <= 0 ? " " + mainPriceRaw.toLocaleString() + "円 です" : "未入力です")
      + "。株価が無いと余力チェック（拘束額・必要保証金・余力使用率・理論最大株数）が計算できないので、表では「—」になります。");
  }
  // ⑥の上限まわりで「入れたのに効かない」3パターン。
  if (maxShRaw != null && maxShRaw <= 0) {
    warns.push("⑥の上限が " + maxShRaw.toLocaleString() + "株 です。0株以下は「上限なし」として扱います（上限を掛けたいなら1株以上を入れてください）。");
  } else if (maxSh != null && maxSh === shares) {
    warns.push("⑥の上限 " + maxSh.toLocaleString() + "株 は②の基礎取引株数と同じなので、株数は最初から上限に張り付いたまま動きません。");
  } else if (maxSh != null && maxSh > 0 && maxSh < shares) {
    warns.push("⑥の上限 " + maxSh.toLocaleString() + "株 は②の基礎取引株数 " + shares.toLocaleString()
      + "株 より小さいので効いていません（「資金が減っても下げない」が優先で、株を減らしはしません）。");
  }

  // ⑧の年月が期間の外＝投入が一度も起きない 2026-08-06M（複数行に対応）。条件つきの行は期間外という概念が
  // 無いので、ここは年月の行だけ見る（届かない条件の行はループ後に「一度も届かない」で拾う）。
  for (var qi = 0; qi < cfg.injections.length; qi++) {
    var qr = cfg.injections[qi];
    if (!qr || (qr.trig && qr.trig !== "ym")) continue;
    var qidx = qr.from ? _dtsYmToIdx(qr.from) : null;
    if (qidx == null || qidx < sIdx || qidx > eIdx) {
      warns.push("αの投入年月「" + ((qr.from ? _dtsYmLbl(qr.from) : "") || "未入力") + "」が期間の外なので、その投入は反映されていません。"
        + "①の期間（" + _dtsYmLbl(cfg.startYm) + "〜" + _dtsYmLbl(cfg.endYm) + "）の中に入れてください。");
    }
  }

  var rows = [], prevShares = shares;
  // 期間別テーブルごとの「発動した月index」。ループ内で _dtsActivate が埋める 2026-08-06L／M
  var dripAct = [], dripUsed = [];       // ⑤積立（used＝実際に選ばれたか。発動しても他の行に負け続ける行を拾う）
  var lcAct = [], lcUsed = [];           // ④生活費
  var perDayAct = [], perDayUsed = [];   // ③1日あたり
  var priceAct = [], priceUsed = [];     // ⑦メイン株価
  var injAct = [];                       // ⑧外部資金（こちらは「当月に発動した行を全部」実行する＝usedは不要）

  for (var k = 0; k < n; k++) {
    var ym = _dtsIdxToYm(sIdx + k);
    var prevClose = capital;   // 先月末の取引資金＝「先月比」の起点。①の投入で capital が動く前に取っておく 2026-08-05
    var capOpen = capital;   // 月初の取引資金＝バッファ・余力使用率の判定に使う（当月の利益は含めない）
    var injected = 0, stepUp = false;

    // ① 外部資金の投入 2026-08-06M: **複数行＋条件つき**（年月／月初株数／月初資金が◯円以上／◯円以下）。
    // ⚠️⑤の積立と違い、投入は「状態」ではなく**その月に1回だけ起きる出来事**。だから
    //   「発動済みのうち最後の1行を選ぶ」のではなく「**当月に発動した行を全部**」実行する。
    // ⚠️条件の判定は投入を足す**前**の資金で行う（「資金が◯円を下回ったら入れる」が、入れた直後の資金で
    //   判定されて成立しなくなる、という自己矛盾を避ける）。株数は前月末の株数。
    _dtsActivate(cfg.injections, injAct, sIdx + k, prevShares, capital);
    var _saWant = null;
    for (var ii = 0; ii < cfg.injections.length; ii++) {
      if (injAct[ii] !== sIdx + k) continue;
      var _ir = cfg.injections[ii];
      injected += (+_ir.amount || 0);
      var _isa = _dtsNumOrNull(_ir.sharesAfter);
      if (_isa != null && _isa > 0 && (_saWant == null || _isa > _saWant)) _saWant = _isa;   // 同月に複数なら大きいほうを採る
    }
    var isInjMonth = (injected !== 0 || _saWant != null), jumped = false;

    // **「投入直後の株数」を指定した時だけ**②をスキップして指定株数へジャンプする。
    if (isInjMonth) {
      capital += injected;
      injTotal += injected;
      var sa = _saWant;
      // ⚠️2026-08-05B: ここは以前 shares = sa の**素の代入**だった＝指定株数が今より少ないと投入月だけ
      //   株数が落ち、翌月には②のラチェットで跳ね上がる（実測: 1,500→700→1,700）。⑥の「資金が減っても
      //   下げない」に真っ向から反するうえ、1ヶ月だけ凹むシナリオは誰も意図しない。ラチェットを掛ける。
      //   下回って無効化された時は黙って捨てず warns で知らせる（入れたのに効かない入力を作らない）。
      if (sa != null && sa > 0) {
        if (sa < prevShares) {
          warns.push("αの「投入直後の株数」" + sa.toLocaleString() + "株 は、その時点の " + prevShares.toLocaleString()
            + "株 より少ないので効いていません（⑥の「資金が減っても下げない」が優先）。減らす想定なら②の基礎取引株数を見直してください。");
        } else {
          shares = sa; jumped = true;
          // ★2026-08-05C（ユーザー報告「上がるべきところで上がらない」）。⑧で株数を置き直したら、
          //   **段の基準株数もそこへ乗せ替える**。これが無いとラダーは②の基礎取引株数から数え続けるので、
          //   ⑧で増やした分に計算が追いつくまで段が全部潰れる＝実測で 218万→310万（4.5段ぶん）が丸ごと死に、
          //   1,000株のまま8ヶ月動かなかった。
          // ⚠️そのとき「投入直後にすでに乗っている段」を引いておく＝引かないと同じ段を二重に数えて跳ねる
          //   （起点210万・資金370万で1,200株指定なら、8段ぶん＝+800株が上乗せされて2,000株に飛ぶ）。
          //   base（＝⑥に入れた額）は動かさないので、注記に出す起点はユーザーが打った数字のまま。
          if (stepBase != null) baseShares = sa - Math.floor(Math.max(0, capital - base) / stepAmt) * stepSh;
        }
      }
      // ★基準点の張り替え。**⑥で起点を明示している時は張り替えない** 2026-08-05A（ユーザー指摘）。
      //   起点は「口座がこの額になったら」という**絶対の水準**なので、投入で勝手にズラすと⑥に何を入れても
      //   結果が変わらなくなる（実測: 起点210万でも999万でも株数推移が同一＝完全なデッドインプット）。
      // ⚠️起点が空欄の時だけ従来どおり張り替える＝空欄は「開始時の資金が暗黙の起点」なので、
      //   張り替えないと投入額を「トレードで増えた分」と誤認して段が跳ねる（+70万＝3.5段＝+350株の幽霊）。
      // ⚠️起点が空欄の時は base と baseShares を**セットで**張り替える＝「この資金の時にこの株数だった」という
      //   組で持つので二重計上にはならない。起点を明示している時だけ base を動かさず、代わりに 267行で
      //   baseShares 側から「投入直後にすでに乗っている段」を引く（そこで引かないと同じ段を二重に数える）。
      capOpen = capital;
    }

    // ② 株数の決定。判定に使うのは**前月末の資金**(prevClose)＝当月の利益も、当月に入れた外部資金も含めない。
    //    floor の累積判定なので端数は自動的に次段へ繰り越される（別処理は不要）。
    // ⚠️2026-08-06: 旧は「投入月は②を丸ごとスキップ」だったので、αの「直後の株数」を空欄にすると
    //   その月だけ段が上がらなかった（本来昇段する月に投入を重ねると1ヶ月ぶん取りこぼす）。
    //   判定元を capital → prevClose に変えたので、投入額が当月の段に混ざる心配なく投入月も②を通せる。
    //   非投入月では prevClose === capital なので、この変更で従来の結果は1円も動かない。
    // ⑦ メイン株価も期間別テーブル 2026-08-06M。⚠️株数を決める**前**に確定させること＝方式B（余力から逆算）と
    //   上限の「資金の◯倍」が株価を使うので、あとから決めると当月だけ古い株価で計算される。
    _dtsActivate(cfg.priceRows, priceAct, sIdx + k, prevShares, capOpen);
    var _prI = _dtsPickActIdx(cfg.priceRows, priceAct);
    if (_prI >= 0) priceUsed[_prI] = true;
    var priceM = _dtsRowAmt(cfg.priceRows, priceAct, 0);
    if (!(priceM > 0)) priceM = 0;
    var mgnOkM = (priceM > 0 && marginRt > 0);
    // ⑥の上限。"multiple"＝取引資金の◯倍まで（拘束額ベース）＝月初資金で毎月動く。100株単位で切り捨て。
    var maxShM = maxSh;
    if (maxMode === "multiple") {
      maxShM = (maxMul != null && priceM > 0) ? (Math.floor(capOpen * maxMul / priceM / 100) * 100) : null;
    }

    if (!jumped) {
      var want;
      if (stepMode === "power") {
        // 方式B＝余力使用率が目標を超えない最大株数。余力使用率＝株数×株価×保証金率÷月初資金 なので
        //   株数 ≦ 目標 × 月初資金 ÷（株価×保証金率）。100株未満は建てられないので切り捨てる。
        // ⚠️判定は**月初資金(capOpen)**＝⑦の余力使用率と同じ分母。方式Aの prevClose とは基準が違う
        //   （方式Aは「前月末にいくら貯まったか」、方式Bは「今いくら担保にできるか」なので、それぞれ正しい）。
        // ⚠️株価が無いと計算できない＝**株数を据え置く**（0にすると損益まで消えて前提が別物になる）。
        want = mgnOkM ? (Math.floor(tgtUse * capOpen / (priceM * marginRt) / 100) * 100) : prevShares;
      } else {
        var steps = Math.floor(Math.max(0, prevClose - base) / stepAmt);
        want = baseShares + steps * stepSh;
      }
      if (maxShM != null && maxShM > 0) want = Math.min(want, maxShM);
      // ラチェット＝資金が減っても株数は下げない。方式Bで stepDown を選んだ時だけ下げる（0未満にはしない）。
      shares = (stepMode === "power" && stepDown) ? Math.max(0, want) : Math.max(want, prevShares);
    }
    // ★基準点の張り替えは**②の判定が済んでから**（先にやると当月の段が消える）。
    // ⚠️2026-08-06B: 旧は無条件に `base = capital; baseShares = shares;` だったので、投入直前に貯まっていた
    //   「次段までの端数」（最大 stepAmount−1円＝既定24.9万）が毎回消えていた。実測で 2027-03に100万を
    //   投入すると期末が 800株 → **600株**（昇段ゼロ）＝入れないほうが株数が伸びる、という逆転が起きていた。
    //   直し方は⑧で株数を置き直したかどうかで分かれる:
    //   - 置き直した(jumped): 「この資金でこの株数」という**新しいペア**が成立するので起点ごと乗せ替える。
    //   - 置き直していない: 株数は変わっていないので、起点を**投入額ぶん平行移動するだけ**にして
    //     (capital − base) ＝ 積み上げた端数をそのまま保つ。baseShares は動かさない（動かすと二重計上）。
    if (isInjMonth && stepBase == null) {
      if (jumped) { base = capital; baseShares = shares; }
      else { base = base + injected; }
    }
    stepUp = (shares > prevShares);

    // ③ 損益（税引前 → 税 → 手取り）
    // ⚠️損失の月に税を掛けない 2026-08-06B。旧は `gross * taxRate` を無条件に掛けていたので、gross<0 だと
    //   tax も負（＝還付）になり net = gross×(1−0.20315) ＝**損失が20.3%小さく出て**いた。
    //   実測: 1日 −2,000円で 税引前 −24.0万 なのに手取り −19.1万。負けの前提が丸ごと2割楽観的になり、
    //   月末取引資金・期末総資産・🛑資金が尽きる月まで全部が甘い方向へずれる。
    //   （損益通算・繰越控除は「他に十分な利益がある」前提の話で、この単月モデルには乗らない）
    // ③1日あたりも期間別テーブル 2026-08-06M。⚠️活性化は**当月の株数が決まったあと**＝「株数が◯株以上なら
    //   1日あたり◯円」という**逓減**を書けるようにするため（枚数を増やすと100株あたりの取れ高が落ちる、を表現できる）。
    _dtsActivate(cfg.perDayRows, perDayAct, sIdx + k, shares, capOpen);
    var _pdI = _dtsPickActIdx(cfg.perDayRows, perDayAct);
    if (_pdI >= 0) perDayUsed[_pdI] = true;
    var perDayM = _dtsRowAmt(cfg.perDayRows, perDayAct, 0);
    var gross = (shares / 100) * perDayM * days;
    var tax   = (gross > 0) ? gross * taxRate : 0;
    var net   = gross - tax;

    // ④ 支出。社会保険料は「生活費の期間別の行」に含める規約（別枠を持たない）。
    // 2026-08-06M: ⑤と同じ条件つきテーブルへ（年月／月初株数／月初資金）。
    _dtsActivate(cfg.livingCost, lcAct, sIdx + k, shares, capOpen);
    var _lcI = _dtsPickActIdx(cfg.livingCost, lcAct);
    if (_lcI >= 0) lcUsed[_lcI] = true;
    var lcRow   = (_lcI >= 0) ? cfg.livingCost[_lcI] : null;
    var expense = lcRow ? (+lcRow.amount || 0) : 0;
    var surplus = net - expense;

    // ⑤ 生活口座への積立。mode="fill"＝目標まで余剰全額 / "drip"＝定額。どちらも目標残高で頭打ち。
    // 年月指定は絶対指定なのでこの月から効かせる（株数・資金は前月末の判定結果が switched に入っている）。
    if (!switched && swMode === "ym" && swIdx != null && (sIdx + k) >= swIdx) switched = true;
    if (switched && !swStartYm) swStartYm = ym;

    // ★切替が成立している月は**余剰を全額 生活口座へ**（⑤の定額・目標残高より優先＝目標も超えて積む）。
    //   ⑤はあくまで「積立の目標」で役割が違う、というのがユーザーの整理（決定③）。
    //   ⚠️赤字月（surplus<0）は積み立てない＝取引資金から出る。0でクリップしないと生活口座が減る。
    // ⚠️切替中の移動は toLiving（＝⑤の積立）とは**別の入れ物**に入れる 2026-08-05M（ユーザー指定）。
    //   これは⑤の積立ルールで動いた金ではないので、表の「積立」欄には出さず「残金（生）」として出す。
    //   金の流れ（生活口座が増え、取引資金が止まる）は同じで、内訳の呼び分けだけが変わる。
    // ⑤の行は発動条件つき 2026-08-06L（年月／月初取引株数／月初取引資金）。
    // ⚠️shares はこの上で当月ぶんが確定済み・capOpen は⑧の投入を足したあとの月初資金＝どちらも「月初」の値。
    //   判定をここより前に置くと当月の株数が反映されず「◯株以上になった月」が1ヶ月ズレる。
    _dtsActivate(cfg.drip, dripAct, sIdx + k, shares, capOpen);
    var _drI = _dtsPickActIdx(cfg.drip, dripAct);
    if (_drI >= 0) dripUsed[_drI] = true;
    var drRow = (_drI >= 0) ? cfg.drip[_drI] : null;
    var toLiving = 0, toLivingSw = 0, tgt = null;
    if (switched) {
      toLivingSw = Math.max(0, surplus);
      if (drRow) tgt = _dtsNumOrNull(drRow.target);
    } else if (drRow) {
      tgt = _dtsNumOrNull(drRow.target);                                  // null＝無制限
      var room = (tgt == null) ? Infinity : Math.max(0, tgt - living);
      var lim  = (drRow.mode === "fill") ? Infinity : (+drRow.amount || 0);
      toLiving = Math.min(surplus, lim, room);
      if (!(toLiving > 0)) toLiving = 0;                                  // 赤字月は積み立てない（0でクリップ）
    }

    // ⑥ 確定。⚠️生活口座へ入る額は「⑤の積立」＋「切替による全額移動」の**合計**。
    //   取引資金に残るのはその残り＝切替中は 0（赤字月はマイナスのまま取引資金から出る）。
    living  += toLiving + toLivingSw;
    capital += surplus - toLiving - toLivingSw;

    // ---- 派生指標 ----
    // ⚠️mgnOk（＝株価>0 かつ 保証金率>0）でない時は 0 ではなく null を返す 2026-08-06。
    //   0 を返すと余力使用率が全月0%になり _dtsUseTone が緑の「余裕」を出す＝株価を入れ忘れただけなのに
    //   「安全な前提」に見えてしまう。null なら表もグラフも「—」になり、⚠️欄に理由が出る。
    // ⚠️mgnOk（前提全体）ではなく mgnOkM（**その月の**株価）で判定する 2026-08-06M＝株価を期間別にしたので、
    //   月によって計算できたりできなかったりする。
    var tied     = mgnOkM ? (shares * priceM) : null;        // 拘束額
    var needMgn  = mgnOkM ? (tied * marginRt) : null;        // 必要保証金
    var buffer   = mgnOkM ? (capOpen - needMgn) : null;      // マイナス＝その株数は資金的に建てられない
    var powerUse = (mgnOkM && capOpen > 0) ? tied / (capOpen / marginRt) : null;   // 余力使用率

    rows.push({
      ym: ym, lbl: _dtsYmLbl(ym),
      shares: shares, stepUp: stepUp,
      gross: gross, tax: tax, net: net,
      expense: expense,
      // 残額＝手取り − 生活費 − 積立 ＝ その月に取引資金へ残った額（月末取引資金の増加分そのもの）。
      // 表で 手取り→生活費→積立→生活口座 と来て月末取引資金が急に伸びる理由が見えないので列に出す 2026-08-05。
      toCapital: surplus - toLiving - toLivingSw,
      toLiving: toLiving, toLivingSwitch: toLivingSw, switched: switched,
      living: living,
      capitalOpen: capOpen, capital: capital,
      // 信用余力＝委託保証金 ÷ 委託保証金率＝**建てられる総枠** 2026-08-05J（ユーザー指定で定義変更）。
      // ⚠️旧は「総枠 − 建玉＝新規に建てられる残り」だった。総枠にすると隣の余力使用率が
      //   ちょうど 建玉 ÷ 信用余力 になるので、2列が直接つながって読める（率30%なら資金の3.33倍）。
      powerOpen: capOpen / marginRt,
      powerEnd:  capital / marginRt,
      // 理論最大株数＝信用余力（総枠）÷ 株価 2026-08-05K（ユーザー要望）。「この資金で最大何株建てられるか」。
      // ⚠️100株単位で切り捨てる＝端数の株は建てられないので、切り上げると実際には建てられない株数が出る。
      //   ⑥の上限（maxShares）は掛けない＝これは**資金の天井**であって運用ルールの上限とは別物。
      //   株価が未入力(0)だと割れないので null＝表では「—」。
      theoOpen: mgnOkM ? Math.floor(capOpen / marginRt / priceM / 100) * 100 : null,
      theoEnd:  mgnOkM ? Math.floor(capital / marginRt / priceM / 100) * 100 : null,
      price: priceM, perDay: perDayM,   // その月に効いた③⑦（表のツールチップ・検算用）2026-08-06M
      total: capital + living,
      injected: injected, livingTarget: tgt,
      buffer: buffer, powerUse: powerUse,
      shortMargin: (buffer != null && buffer < 0)
    });
    // 月末で切替条件を判定＝成立しても効くのは**次の月から**（このループの残りには影響しない）。
    if (!switched) {
      if (swMode === "shares" && swShares != null && shares >= swShares) switched = true;
      else if (swMode === "capital" && swCap != null && capital > swCap) switched = true;
    }
    prevShares = shares;
  }

  // 方式Bで目標を超えた月を名指しする 2026-08-06J。超える原因は2つ:
  //   ①「資金が減っても株数を下げない」で資金だけ減った月 ②⑧の「投入直後の株数」が目標を無視して株数を置く月。
  // ⚠️`!stepDown` で囲まないこと＝「下げる」を選んでいても②は起きるので、囲むと**⑧由来の超過が黙って通る**
  //   （実測: 目標85%・下げる で ⑧が1,000株を指定 → 余力92% まで出るのに警告ゼロだった）。
  // ⚠️月次表の色（90%〜警戒）だけでは目標を80%等にした人に何も出ないので、**目標との比較**で別に出す。
  // ⚠️warns.push は sum.warnings への代入より前に済ませること（あとから push しても参照は同じなので映るが、
  //   「代入したあとに足す」を許すと読み手が追えなくなる）。
  if (stepMode === "power") {
    var _ovN = 0, _ovMax = 0, _tgtP = Math.round(tgtUse * 1000) / 10;
    for (var v = 0; v < rows.length; v++) {
      if (rows[v].powerUse == null) continue;
      if (Math.round(rows[v].powerUse * 1000) / 10 > _tgtP) { _ovN++; if (rows[v].powerUse > _ovMax) _ovMax = rows[v].powerUse; }
    }
    if (_ovN) {
      warns.push("⑥の目標 " + _tgtP + "% を超えた月が " + _ovN + "ヶ月あります（最大 " + _dtsFmtPct(_ovMax) + "）。"
        + (stepDown ? "αで「投入直後の株数」を指定した月は目標より多く建てます。" : "「資金が減っても株数を下げない」ため、資金が減った月は目標を超えます（⑥の「資金が減ったら株数も下げる」で解消できます）。αで株数を直接指定した月も超えます。"));
    }
  }

  // ---- 年間（期間）集計 ----
  var sum = {
    months: n, startYm: cfg.startYm, endYm: cfg.endYm,
    gross: 0, tax: 0, net: 0, expense: 0, toLiving: 0, toLivingSwitch: 0, toCapital: 0, injection: injTotal
  };
  for (var i = 0; i < rows.length; i++) {
    sum.gross     += rows[i].gross;
    sum.tax       += rows[i].tax;
    sum.net       += rows[i].net;
    sum.expense   += rows[i].expense;
    sum.toLiving  += rows[i].toLiving;
    sum.toLivingSwitch += rows[i].toLivingSwitch;   // 切替で生活口座へ回した通算（⑤の積立とは別勘定）2026-08-05M
    sum.toCapital += rows[i].toCapital;   // 残金の通算＝手取り−生活費−積立。投入額は含まない（＝自力で積んだ分）2026-08-05w
  }
  // 「目標まで全額」＋目標残高が空欄＝**上限なしで余剰を全部この口座へ**＝取引資金が一切増えず株数も伸びない。
  // 画面の placeholder が「無制限」なので害が無さそうに見えるが、fillと組むと事実上の資金凍結になる 2026-08-05B。
  // （実測: 資金300万のまま6ヶ月・生活口座だけ55万→228万）。定額(drip)なら額で頭打ちなので対象外。
  for (var w = 0; w < (cfg.drip || []).length; w++) {
    var dw = cfg.drip[w];
    if (dw && dw.mode === "fill" && _dtsNumOrNull(dw.target) == null) {
      warns.push("⑤の「" + _dtsTrigLabel(dw) + "」の積立が「目標まで全額」なのに目標残高が空欄です。"
        + "余剰が全額そのまま生活口座へ行くので、取引資金が増えず株数も伸びません。目標残高を入れてください。");
    }
  }
  // 「入れたのに効かない行」の検査 2026-08-06L→Mで全テーブルへ一般化。
  //   ①条件つきの行が期間内に一度も成立しなかった（年月の行は _chkRows が「期間の終わりより後」で拾うので対象外＝二重に出さない）
  //   ②成立はしたが、他の行に隠れて一度も使われなかった（used付きのテーブルのみ＝⑧のような「その月に実行する」表には無い概念）
  // ⚠️②を出さないと「条件を足したのに結果が1円も動かない」が黙って起きる。実測: 既存の「2026-11から」がある状態で
  //   「1,000株以上」を足すと株数が1,000に届くのがちょうど2026-11なので同着負けして無反応になる。
  //   _dtsShadowedRows（画面の赤い行）は同じ方式で完全に同じ条件の行しか拾えないので、方式をまたぐ隠れはここでしか気づけない。
  var _chkUnused = function(rows, act, used, lbl) {
    for (var q = 0; q < (rows || []).length; q++) {
      var r = rows[q]; if (!r) continue;
      var t = r.trig || "ym";
      if (t === "ym") continue;
      var v = _dtsTrigVal(r);
      if (v == null) continue;                                   // 未入力は _chkRows が出す
      if (act[q] == null) warns.push(lbl + "の「" + _dtsTrigLabel(r) + "」は期間内に一度も成立しないので、この行は使われていません。");
      else if (used && !used[q] && rows.length > 1) {
        warns.push(lbl + "の「" + _dtsTrigLabel(r) + "」は成立していますが、同じ月かそれより後に成立した別の行が使われるため、一度も適用されていません。条件をずらすか、この行を消してください。");
      }
    }
  };
  _chkUnused(cfg.drip, dripAct, dripUsed, "⑤積立");
  _chkUnused(cfg.livingCost, lcAct, lcUsed, "④生活費");
  _chkUnused(cfg.perDayRows, perDayAct, perDayUsed, "③1日あたり");
  _chkUnused(cfg.priceRows, priceAct, priceUsed, "⑦メイン株価");
  _chkUnused(cfg.injections, injAct, null, "α外部資金");

  var last = rows[rows.length - 1] || null;
  sum.endCapital = last ? last.capital : (+cfg.initialCapital || 0);
  sum.endLiving  = last ? last.living  : (+cfg.initialLiving  || 0);
  sum.endTotal   = sum.endCapital + sum.endLiving;
  sum.endOwnBase = sum.endTotal - injTotal;
  sum.endShares  = last ? last.shares : initShares;
  sum.warnings   = warns;     // 前提そのものの警告（入れたのに効かない入力）2026-08-05B
  sum.capitalGain = sum.endCapital - (+cfg.initialCapital || 0);
  // 開始時の値（②の入力を _dtsSimulate と同じ読み方で正規化したもの）2026-08-06。
  // ⚠️表の「開始時」行はここから引くこと＝cfg の生値を直接読むと、②に −500 と打った時に
  //   開始時行だけ「−500株」、月次行は 0株 という食い違いが出る（空欄も「—」と「0万」で割れる）。
  sum.start = { capital: +cfg.initialCapital || 0, living: +cfg.initialLiving || 0, shares: initShares };
  // 実際に計算へ使った値 2026-08-06。⚠️入力欄の注記（⑦の「1段ごとのバッファの増え方」など）も
  //   cfg の生値ではなくこちらを使うこと＝クランプ・既定値差し替えの結果と画面の説明を一致させるため。
  sum.eff = { days: days, taxRate: taxRate, stepAmount: stepAmt, stepShares: stepSh,
    mainPrice: mainPrice, marginRate: marginRt, marginOk: mgnOk,
    stepMode: stepMode, targetUse: tgtUse, stepDown: stepDown,
    // ⚠️maxMode/maxMultiple も eff に載せる 2026-08-06P。🔧調整案が「どちらの上限を振るか」をこれで分岐するので、
    //   載せ忘れると eff.maxMode が undefined になり、倍率方式でも常に株数側を振る＝死んだ総当たりに戻る。
    maxMode: maxMode, maxMultiple: maxMul };

  // ---- 節目の抽出 ----
  var marks = [], seenTargetHit = false, worst = null;
  for (var j = 0; j < rows.length; j++) {
    var r = rows[j];
    if (r.injected) marks.push({ ym: r.ym, kind: "inject", text: _dtsYmLbl(r.ym) + "  外部資金 " + Math.round(r.injected).toLocaleString() + "円を投入 → " + r.shares + "株" });
    // ⚠️初月に段が上がる時（⑥の起点が今の資金より小さい等）の左側は「開始時の株数」 2026-08-06。
    //   旧は r.shares を置いていたので「株数 700 → 700株」と同じ数字が並んで何が起きたか読めなかった。
    if (r.stepUp && !r.injected) marks.push({ ym: r.ym, kind: "step", text: _dtsYmLbl(r.ym) + "  株数 " + (j > 0 ? rows[j - 1].shares : initShares) + " → " + r.shares + "株" });
    if (j === 0 || r.expense !== rows[j - 1].expense) {
      if (j > 0) marks.push({ ym: r.ym, kind: "cost", text: _dtsYmLbl(r.ym) + "  生活費 " + Math.round(rows[j - 1].expense).toLocaleString() + " → " + Math.round(r.expense).toLocaleString() + "円" });
    }
    // ③1日あたり・⑦メイン株価が切り替わった月 2026-08-06P。
    // ⚠️期間別テーブルにした（2026-08-06M）のに**切り替わったことが画面のどこにも出ていなかった**＝
    //   行を足しても「何も変わっていない」ように見える最大の原因。生活費と同じ作法で節目に出す。
    //   特に⑦は方式Aだと株数・損益に影響しない（余力の列だけが動く）ので、ここに出ないと本当に無反応に見える。
    if (j > 0 && r.perDay !== rows[j - 1].perDay) {
      marks.push({ ym: r.ym, kind: "cost", text: _dtsYmLbl(r.ym) + "  1日あたり " + Math.round(rows[j - 1].perDay).toLocaleString() + " → " + Math.round(r.perDay).toLocaleString() + "円/100株" });
    }
    if (j > 0 && r.price !== rows[j - 1].price) {
      marks.push({ ym: r.ym, kind: "cost", text: _dtsYmLbl(r.ym) + "  メイン株価 " + Math.round(rows[j - 1].price).toLocaleString() + " → " + Math.round(r.price).toLocaleString() + "円" });
    }
    // ⚠️切替中は出さない 2026-08-06B。旧は r.switched を見ていなかったので、切替（残金を全額 生活口座へ）が
    //   効いている最中でも「生活口座が目標◯円に到達 → **以降は全額が取引資金へ**」を緑で出していた。
    //   実際は真逆（取引資金はそこで止まり、生活口座だけ伸びる）うえ、同じ月に正しい切替の節目も並ぶので、
    //   ym ソートで**誤ったほうが後に読まれる**という最悪の並びになっていた。切替の節目が別に出るのでここは黙る。
    if (!seenTargetHit && !r.switched && r.livingTarget != null && r.living >= r.livingTarget) {
      seenTargetHit = true;
      marks.push({ ym: r.ym, kind: "goal", text: _dtsYmLbl(r.ym) + "  生活口座が目標 " + Math.round(r.livingTarget).toLocaleString() + "円に到達 → 以降は全額が取引資金へ" });
    }
    // ⚠️株価未入力(mgnOk=false)だと buffer が null なので節目に出さない 2026-08-06。
    //   null のまま比べると「バッファ最小 0円」という計算していない数字が出てしまう。
    if (r.buffer != null && (!worst || r.buffer < worst.buffer)) worst = r;
  }
  // 保証金不足は月ごとに1行出すと連続した時に節目が埋まる（実測10行）ので**連続した区間を1行にまとめる**
  // 2026-08-05D。金額は区間で最も不足した月の値を出す＝いちばん厳しい所が分かればいい。
  for (var s0 = 0; s0 < rows.length; s0++) {
    if (!rows[s0].shortMargin) continue;
    var e0 = s0, deep = rows[s0];
    while (e0 + 1 < rows.length && rows[e0 + 1].shortMargin) { e0++; if (rows[e0].buffer < deep.buffer) deep = rows[e0]; }
    marks.push({ ym: rows[s0].ym, kind: "warn",
      text: _dtsYmLbl(rows[s0].ym) + (e0 > s0 ? "〜" + _dtsYmLbl(rows[e0].ym) + "（" + (e0 - s0 + 1) + "ヶ月）" : "")
        + "  ⚠ 保証金不足 最大 " + Math.round(-deep.buffer).toLocaleString() + "円（" + deep.shares + "株を建てられない）" });
    s0 = e0;
  }
  // 取引資金がマイナスに落ちる月＝この前提では資金が尽きる。保証金不足より重いので別に出す 2026-08-05D。
  for (var z = 0; z < rows.length; z++) {
    if (rows[z].capital < 0) {
      marks.push({ ym: rows[z].ym, kind: "warn", text: _dtsYmLbl(rows[z].ym) + "  🛑 取引資金がマイナス（" + _dtsFmtMan(rows[z].capital) + "円）＝この前提では資金が尽きます" });
      break;
    }
  }
  if (swStartYm) {
    var swWhy = swMode === "shares" ? ("株数が " + (swShares != null ? swShares.toLocaleString() : "—") + "株 に到達")
      : swMode === "capital" ? ("取引資金が " + _dtsFmtMan(swCap) + "円 を超過")
      : "指定の年月";
    marks.push({ ym: swStartYm, kind: "goal", text: _dtsYmLbl(swStartYm) + "  以降は残金を全額 生活口座へ（" + swWhy + "）" });
  }
  if (worst) marks.push({ ym: worst.ym, kind: "min", text: _dtsYmLbl(worst.ym) + "  バッファ最小 " + Math.round(worst.buffer).toLocaleString() + "円（" + worst.shares + "株）" });
  marks.sort(function(a, b) { return _dtsYmToIdx(a.ym) - _dtsYmToIdx(b.ym); });

  return { error: null, rows: rows, summary: sum, marks: marks };
}

// ③の1日あたりに倍率を掛ける 2026-08-06M。🔧調整案の頑健性（何%下振れすると調整の効果が消えるか）で使う。
// ⚠️期間別テーブルにしたので **cfg.dailyPer100 を書き換えるだけでは効かない**（_dtsNormCfg が
//   perDayRows を優先するため）。必ずここを通すこと。旧キーも一緒に更新しておく。
// 2026-08-06N: グレード感度（_DTS_SENS/_dtsSetPerDayAll/_dtsSensitivity/_dtsReachTarget/_dtsSensRisk/
//   _dtsSensTable）はユーザー指定で撤去した。🔧調整案が同じ「前提を振って比べる」役割を安全条件つきで
//   担っているため役目が重複していた。倍率版のこれだけ残す。
function _dtsScalePerDay(cfg, ratio) {
  var c = _dtsNormCfg(_dtsCfgClone(cfg));
  c.perDayRows = c.perDayRows.map(function(r) { return Object.assign({}, r, { amount: (_dtsNumOrNull(r.amount) || 0) * ratio }); });
  c.dailyPer100 = (_dtsHeadAmt(c.perDayRows, 0));
  return c;
}
// ---- 表示ヘルパー --------------------------------------------------------
// 表示は万円・小数第1位まで（依頼メモ§7）。内部計算は円のまま丸めない。
var _DTS_INK = "#1E3A8A", _DTS_SUB = "#3B82F6", _DTS_BG = "#EFF6FF", _DTS_BD = "#BFDBFE";
// ⚠️マイナスは _dtsFmtMan と同じ全角「−」で出す 2026-08-06。半角ハイフンのままだと、同じ注記の中で
//   「−19.5万」と「-195,000」の2種類の符号が並ぶ。
function _dtsFmtYen(v) {
  if (v == null || !isFinite(v)) return "—";
  var n = Math.round(v);
  return (n < 0 ? "−" : "") + Math.abs(n).toLocaleString();
}
// マイナスは全角「−」で出す 2026-08-05B。_dtsOut/_dtsRest が全角の「−◯万」を出すので、素の負値だけ
// 半角ハイフンの「-100万」になって同じ表の中で符号の見た目が2種類あった。
function _dtsFmtMan(v) {
  if (v == null || !isFinite(v)) return "—";
  var s = (Math.round(Math.abs(v) / 1000) / 10).toLocaleString() + "万";
  return (v < 0 ? "−" : "") + s;
}
function _dtsFmtPct(v) { if (v == null || !isFinite(v)) return "—"; return (Math.round(v * 1000) / 10) + "%"; }

// 余力使用率で行を色分け（ユーザー決定 2026-08-05／境界は 2026-08-06D に更新）。
// 保証金不足（バッファ<0）は最優先で赤。刻み250,000円・株価6,500円だと**90%台が延々と続く**ので、
// 警戒を85%に置くとほぼ全行が黄色になって帯として機能しなかった＝90%へ上げて「本当に詰む手前」だけを塗る。
function _dtsUseTone(u, shortMargin) {
  if (shortMargin) return { bg: "#FEE2E2", ink: "#991B1B", lbl: "保証金不足" };
  if (u == null) return { bg: null, ink: null, lbl: "" };
  // 2026-08-06D（ユーザー指定）: 警戒を **85% → 90%** へ。危険は据置で 95%〜。
  // ⚠️判定は生の u ではなく**画面に出るのと同じ丸め（小数第1位の%）**で行う。生値で比べると、
  //   600株・株価6,500円・資金130万の月が 3,900,000 ÷ (1,300,000÷0.3) = 0.8999999999999999 になり、
  //   表には _dtsFmtPct が「90%」と出しているのに帯だけ無地、という**表示と色の食い違い**が起きる
  //   （割り算の丸め誤差なので珍しくない）。境界を跨ぐ値ほど目につくので、必ず表示値に揃えること。
  // ⚠️境界は `>=` にしてラベルの「◯〜◯%」と一致させる＝ちょうど90.0%/95.0%がどちらの帯にも入らない、
  //   という読みのズレを作らない（余裕の「〜70%」だけは 70.0% を含める側なので `> 70` のまま）。
  var p = Math.round(u * 1000) / 10;
  if (p >= 95) return { bg: "#FEF2F2", ink: "#B91C1C", lbl: "危険" };
  if (p >= 90) return { bg: "#FEFCE8", ink: "#A16207", lbl: "警戒" };
  if (p > 70) return { bg: null, ink: null, lbl: "" };
  return { bg: "#F0FDF4", ink: "#047857", lbl: "余裕" };
}

// 既定の前提（保存が無いとき／保存に欠けているキーを埋めるとき）。
function _dtsDefaultCfg(actual) {
  var ym = ((typeof todayStr === "function") ? todayStr() : "2026-08-01").slice(0, 7);
  return {
    startYm: ym, endYm: _dtsIdxToYm(_dtsYmToIdx(ym) + 11), businessDays: 20,
    initialCapital: 1300000, initialLiving: 200000, initialShares: 600,
    dailyPer100: (actual && actual.perDay != null) ? Math.round(actual.perDay) : 2000,
    taxRate: 0.20315,
    livingCost: [{ from: ym, amount: 100000 }],
    drip: [{ from: ym, mode: "drip", amount: 50000, target: null }],
    stepBase: null, stepAmount: 250000, stepShares: 100, maxShares: 3000,
    // ⑥の方式 2026-08-06J。⚠️既定は必ず "amount"（従来の方式）＝**保存済みcfgを持つ人の結果を1円も動かさない**。
    //   targetUse/stepDown は方式Bを選んだ時だけ効くので、既定値が入っていても従来の計算には一切影響しない。
    stepMode: "amount", targetUse: 0.90, stepDown: false,
    maxMode: "shares", maxMultiple: 3,   // ⑥の上限の方式 2026-08-06M（既定は従来の「◯株まで」）
    mainPrice: 6500, marginRate: 0.30,
    // 2026-08-05L に追加した項目。⚠️既存の保存済みcfgには無いので、**直前の版と同じ挙動になる既定**を入れる
    //   （＝株数が⑥の上限に達したら切替）。ここを "off" にすると保存済みの人だけ結果が変わる。
    livingSwitch: { mode: "shares", shares: null, capital: null, ym: "" },
    injection: { ym: "", amount: 0, sharesAfter: 0 }
  };
}

// 前提の初期値。保存済み（data.custom.dtsCfg）があればそれを、無ければ実績から組み立てる。
// ⚠️2026-08-06B: 旧は `if (saved && saved.startYm && saved.endYm)` の**オール・オア・ナッシング**だった。
//   年月が片方でも空だと saved を丸ごと捨てて既定値を返す＝一度でも空年月のまま💾を押すと（そのガードも
//   無かった）、生活費の期間別行・⑤積立・⑥⑦の設定・αの投入まで全部が初期値へ戻って**復元できなかった**。
//   いまは「保存にあるキーはそのまま採用し、無いキーだけ既定で埋める」マージにしてある。
//   ⚠️`saved[k] != null` のような条件でふるいに掛けないこと＝`stepBase:null`(＝開始時)や
//     `maxShares:null`(＝無制限) は**意味のある null** なので、既定値で塗り替えると設定が化ける。
// 保存する形。⚠️期間別テーブル化（2026-08-06M）で正は perDayRows/priceRows/injections になったが、
//   **旧キー(dailyPer100/mainPrice/injection)も先頭行から作って一緒に書く**＝まだ旧JSを掴んでいる端末が
//   読んでも先頭行の値で従来どおり動く（dailyStock を複数化した時と同じ後方互換の作法）。
function _dtsForSave(cfg) {
  var c = _dtsNormCfg(cfg);
  c.dailyPer100 = _dtsHeadAmt(c.perDayRows, 0);
  c.mainPrice = _dtsHeadAmt(c.priceRows, 0);
  var i0 = c.injections[0];
  c.injection = i0 ? { ym: (i0.trig || "ym") === "ym" ? (i0.from || "") : "", amount: +i0.amount || 0, sharesAfter: _dtsNumOrNull(i0.sharesAfter) }
                   : { ym: "", amount: 0, sharesAfter: 0 };
  return c;
}
function _dtsInitCfg(data, actual) {
  var d = _dtsDefaultCfg(actual);
  var saved = data && data.custom && data.custom.dtsCfg;
  if (!saved) return _dtsNormCfg(d);
  var c = {}, k;
  for (k in d) { if (Object.prototype.hasOwnProperty.call(d, k)) c[k] = d[k]; }
  for (k in saved) { if (Object.prototype.hasOwnProperty.call(saved, k)) c[k] = saved[k]; }
  // 期間だけは空だと何も計算できないので既定で埋める（保存側のガードで普通は起きない）。
  if (!c.startYm) c.startYm = d.startYm;
  if (!c.endYm) c.endYm = d.endYm;
  if (!c.livingCost || !c.livingCost.length) c.livingCost = [{ from: c.startYm, amount: 100000 }];
  if (!c.drip || !c.drip.length) c.drip = [{ from: c.startYm, mode: "drip", amount: 50000, target: null }];
  if (!c.livingSwitch) c.livingSwitch = { mode: "shares", shares: null, capital: null, ym: "" };
  // ⚠️最後に正規化する 2026-08-06M＝保存が旧形式（スカラー）でも、UI 側は必ず配列を編集する形にそろえる。
  //   ここで寄せておかないと「⑦に行が無いので何も出ない」「③の行が編集できない」といった空表示になる。
  return _dtsNormCfg(c);
}

// 数値入力。unit="man"＝円で持って万円で入出力／"pct"＝小数で持って%で入出力／既定＝そのまま。
// 入力中は draft(生の文字列)を優先して表示する＝「1」と打った瞬間に1万円へ正規化されて
// 続きが打てなくなるのを防ぐ。blur で draft を捨てて正規表示に戻す。
//
// ▲▼ボタンは既存の共通部品 _stepBtn(app-05.js:6232)を使う＝押しっぱなしで350ms後に80ms間隔の連続増減。
// props.step は**表示単位**で渡す（unit="man" なら step:1 が1万円）。
// ★2026-08-06L（ユーザー指定「入力欄にはかならず↑↓をつけて。株数については100単位」）＝**step は必ず渡す**。
//   省略すると▲▼が黙って出ない（エラーも出ない）ので、新しい数値欄を足したら step を書いたか必ず確認すること。
//   株数の欄は step:100／金額は1〜10（万円）／%は1（税率だけ0.1）。現在 step 無しの欄は無い。
// props.min / props.max は**内部単位**（unit="pct" なら 0.9 が90%）。⚠️表示単位の step と単位が違うので注意。
//   どちらも ▲▼ の行き先だけを縛る＝直接打った値は縛らない（打ち込みの制限は _dtsSimulate 側のクランプ＋警告が担当）。
// ⚠️_stepBtn の長押しリピートは pointerdown 時点のクロージャを setInterval で呼び続けるので、
//   props.value を直接読むと**初回の値のまま**になり1段しか進まない。最新値は vRef 経由で読むこと
//   （app-04.js:4041 の推奨基本α欄と同じ理由・同じ対処）。onChange 側は setCfg の関数アップデータなので古くても安全。
function DtsNum(props) {
  var _d = useState(null), draft = _d[0], setDraft = _d[1];
  var unit = props.unit || "raw";
  var vRef = useRef(props.value); vRef.current = props.value;
  var toDisp = function(v) {
    if (v == null || v === "" || !isFinite(v)) return "";
    if (unit === "man") return String(Math.round(v / 100) / 100);
    if (unit === "pct") return String(Math.round(v * 100000) / 1000);
    return String(v);
  };
  var fromDisp = function(s) {
    if (s === "" || s == null) return null;
    var n = parseFloat(String(s).replace(/,/g, "").replace(/[０-９．]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); }));
    if (!isFinite(n)) return null;
    if (unit === "man") return Math.round(n * 10000);
    if (unit === "pct") return n / 100;
    return n;
  };
  // 表示単位の刻み → 内部単位へ。step未指定＝ボタンなし。
  var istep = (props.step == null) ? null : (unit === "man" ? props.step * 10000 : unit === "pct" ? props.step / 100 : props.step);
  var minV = (props.min == null) ? 0 : props.min;
  var maxV = (props.max == null) ? null : props.max;
  var bump = function(dir) {
    if (istep == null) return;
    var cur = vRef.current;
    var empty = (cur == null || cur === "" || !isFinite(cur));
    // ⚠️空欄から▼を押しても0を作らない 2026-08-06。空欄は「無制限／未設定」の意思表示なので、
    //   ▼で 0 が入ると意味が反転する（⑤の目標残高＝無制限 が 0＝積立しない になり、
    //   さらに「生活口座が目標 0円に到達」という節目まで出る）。▲は 0+刻み から始めてよい。
    if (empty && dir < 0) return;
    setDraft(null);   // 入力途中の生文字列が残っていると新しい値が画面に出ないので捨てる
    var base = empty ? 0 : Number(cur);
    var nv = base + dir * istep;
    if (minV != null && nv < minV) nv = minV;
    if (maxV != null && nv > maxV) nv = maxV;
    // ⚠️pct は丸めずに渡すと 0.9+0.01 が 0.9099999999999999 になり、表示(toDisp)が「91」でも
    //   保存値は端数付きになる。浮動小数の誤差だけを落とす 2026-08-06K。
    // ⚠️**刻み幅のグリッドに吸着させないこと** 2026-08-06L＝税率20.315%で▲を押すと 20.4% に化けて
    //   打ち込んだ精度が消える。小数第6位（内部単位）で丸めるだけにする＝0.9099999→0.91、0.20415は素通し。
    if (unit === "pct") nv = Math.round(nv * 1000000) / 1000000;
    props.onChange(unit === "pct" ? nv : Math.round(nv));
  };
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "stretch", border: "1px solid " + _DTS_BD, borderRadius: 5, overflow: "hidden", background: "#fff" } },
    React.createElement("input", {
      type: "text", inputMode: "decimal", placeholder: props.placeholder || "",
      value: draft != null ? draft : toDisp(props.value),
      // 全角で打たれても打った瞬間に半角へ 2026-08-05x（ユーザー要望）。fromDisp も内部で全角を潰すが、
      // それは**値**だけの話で draft（画面に出る生文字列）は全角のまま残る＝blurするまで「２５」と見えていた。
      // ⚠️_toHankakuNum ではなく _toHankaku（変換するだけで文字を消さない）を使う＝小数点や−を打った瞬間に
      //   消えると1日あたりのマイナスや小数が打てなくなる。数字以外の切り捨ては従来どおり fromDisp が担当。
      onChange: function(e) { var s = _toHankaku(e.target.value); setDraft(s); props.onChange(fromDisp(s)); },
      onBlur: function() { setDraft(null); },
      style: { width: props.width || 62, padding: "3px 5px", fontSize: 11.5, fontWeight: 700, textAlign: "right",
        border: "none", outline: "none", background: "transparent", color: "#1F2937", fontVariantNumeric: "tabular-nums" }
    }),
    props.suffix ? React.createElement("span", { style: { fontSize: 9.5, color: "#6B7280", fontWeight: 700, alignSelf: "center", padding: "0 3px", whiteSpace: "nowrap" } }, props.suffix) : null,
    istep != null ? _stepBtn(function() { bump(1); }, function() { bump(-1); }) : null);
}

// 年月入力（YYYY-MM）。type="month" は file:// でも素直に動く。
function DtsYm(props) {
  return React.createElement("input", {
    type: "month", value: props.value || "",
    onChange: function(e) { props.onChange(e.target.value || ""); },
    style: { padding: "3px 5px", fontSize: 11.5, fontWeight: 700, border: "1px solid " + _DTS_BD, borderRadius: 5, background: "#fff", color: "#1F2937", width: props.width || 120 }
  });
}

// 期間別テーブルの「条件」部分（方式セレクタ＋しきい値の欄＋「から/になったら」）。5つの表で使い回す 2026-08-06M。
// ⚠️方式を変えても他方式の値は消さない＝戻した時に打ち直しにならない（cfgに from/shares/capital を並存させる）。
var _DTS_SEL_STY = { fontSize: 11, fontWeight: 700, padding: "3px 4px", border: "1px solid " + _DTS_BD, borderRadius: 5, background: "#fff", color: "#1F2937" };
function _dtsTrigCells(r, onSet, opts) {
  var trig = (r && r.trig) || "ym", o = opts || {};
  var ops = [
    React.createElement("option", { key: "ym", value: "ym" }, "◯年◯月から"),
    React.createElement("option", { key: "shares", value: "shares" }, "月初取引株数が◯株以上"),
    React.createElement("option", { key: "capital", value: "capital" }, "月初取引資金が◯円以上")
  ];
  // ⑧の追加入金だけは「下回ったら」が要る（他の表は上向きの条件しか意味を持たない）。
  if (o.below) ops.push(React.createElement("option", { key: "capitalBelow", value: "capitalBelow" }, "月初取引資金が◯円以下"));
  return [
    React.createElement("select", { key: "trig", value: trig, onChange: function(e) { onSet("trig", e.target.value); }, style: _DTS_SEL_STY }, ops),
    trig === "shares"
      ? React.createElement(DtsNum, { key: "tv", value: r.shares, width: 60, suffix: "株以上", step: 100, onChange: function(v) { onSet("shares", v); } })
      : trig === "capital"
        ? React.createElement(DtsNum, { key: "tv", value: r.capital, unit: "man", suffix: "万円以上", step: 10, onChange: function(v) { onSet("capital", v); } })
        : trig === "capitalBelow"
          ? React.createElement(DtsNum, { key: "tv", value: r.capitalBelow, unit: "man", suffix: "万円以下", step: 10, onChange: function(v) { onSet("capitalBelow", v); } })
          : React.createElement(DtsYm, { key: "tv", value: r.from, width: 112, onChange: function(v) { onSet("from", v); } }),
    React.createElement("span", { key: "tl", style: { fontSize: 10.5, fontWeight: 700, color: "#4B5563" } }, trig === "ym" ? "から" : "になったら")
  ];
}

function _dtsSec(title, note, body) {
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, padding: "7px 9px", background: "#fff", marginBottom: 6 } },
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: _DTS_INK, marginBottom: 5 } }, title,
      note ? React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280", marginLeft: 6 } }, note) : null),
    body);
}
function _dtsRow(children) {
  return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, rowGap: 5 } }, children);
}
// 配列で渡す子要素なのでkeyを持たせる（同一行内でラベル文言は重複しない）。
function _dtsLbl(t) { return React.createElement("span", { key: "l_" + t, style: { fontSize: 10.5, fontWeight: 700, color: "#4B5563" } }, t); }

// 丸囲みのα 2026-08-05J（ユーザー指定で⑧を置き換え）。①〜⑦の連番と違って「使わなくてもいい追加の前提」
// という位置づけを見た目で分ける。⚠️丸囲みギリシャ文字はUnicodeに無いのでCSSの円で作る（㊛のような既製文字は使えない）。
function _dtsAlphaMark(k) {
  return React.createElement("span", { key: k || "am", style: { display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 14, height: 14, borderRadius: "50%", border: "1.5px solid " + _DTS_INK, fontSize: 9.5, fontWeight: 800,
    lineHeight: 1, marginRight: 4, verticalAlign: "-2px" } }, "α");
}

// ⑤の下に出す「残金を全額こちらへ回す切替」の行 2026-08-05L（ユーザー決定）。
// ⚠置き場所は⑤＝これは**お金の行き先**の話で、⑥（株数の話）ではない。旧版は⑥に注記だけ置いて
//   処理は⑤にあるという捧れだった。⑥からは注記を撤去済み。
// ⚠ここの文言と _dtsSimulate の switched 判定は対で変えること（片方だけ直すと表と説明が食い違う）。
function _dtsSwitchRow(cfg, setSw) {
  var sw = cfg.livingSwitch || {}, mode = sw.mode || "off";
  var mx = _dtsNumOrNull(cfg.maxShares);
  var sel = React.createElement("select", {
    value: mode, onChange: function(e) { setSw("mode", e.target.value); },
    style: { fontSize: 11, fontWeight: 700, padding: "3px 4px", border: "1px solid " + _DTS_BD, borderRadius: 5, background: "#fff", color: "#1F2937" }
  }, React.createElement("option", { value: "off" }, "使わない"),
     React.createElement("option", { value: "shares" }, "株数が"),
     React.createElement("option", { value: "capital" }, "取引資金が"),
     React.createElement("option", { value: "ym" }, "年月が"));
  var mid = mode === "shares"
      ? [React.createElement(DtsNum, { key: "ss", value: sw.shares, width: 56, suffix: "株", placeholder: mx != null ? String(mx) : "⑥の上限", step: 100, onChange: function(v) { setSw("shares", v); } }), _dtsLbl("に達した次の月から")]
    : mode === "capital"
      ? [React.createElement(DtsNum, { key: "sc", value: sw.capital, unit: "man", suffix: "万円", step: 10, onChange: function(v) { setSw("capital", v); } }), _dtsLbl("を超えた次の月から")]
    : mode === "ym"
      ? [React.createElement(DtsYm, { key: "sy", value: sw.ym, width: 112, onChange: function(v) { setSw("ym", v); } }), _dtsLbl("から")]
    : [];
  return React.createElement("div", { style: { marginTop: 6, paddingTop: 6, borderTop: "1px solid " + _DTS_BD } },
    _dtsRow([_dtsLbl("切替"), sel].concat(mid).concat(mode === "off" ? [] : [_dtsLbl("残金を全額こちらへ")])),
    React.createElement("div", { style: { fontSize: 9, color: "#6B7280", marginTop: 4, lineHeight: 1.5 } },
      mode === "off"
        ? "切替を使うと、条件を満たした次の月から残金（手取り−生活費）を全額この生活口座へ回します。取引資金はそこで止まります。"
        : "条件は月末で判定し、効き始めるのは次の月からです。一度切り替わったら、あとで条件を割っても取引資金には戻しません。切替中は上の目標残高を超えても積み続けます（目標残高はあくまで積立の目安）。"));
}

// ---- 本体コンポーネント --------------------------------------------------
// props: data（保存先＝data.custom.dtsCfg。既存のstSave→fbPut経路で自動同期される）
//        setData（保存ボタン用）／actual={perDay,days,cnt}（記録帳の実績＝オートフィル用・null可）
function DaytradeProjection(props) {
  var data = props.data || {}, actual = props.actual || null, setData = props.setData;
  var _c = useState(function() { return _dtsInitCfg(data, actual); });
  var cfg = _c[0], setCfg = _c[1];
  var _o = useState(true), openIn = _o[0], setOpenIn = _o[1];
  var _s = useState(""), saveMsg = _s[0], setSaveMsg = _s[1];
  var _a = useState(true), openAdv = _a[0], setOpenAdv = _a[1];   // 🔧調整案の開閉 2026-08-06H

  // 触ったかどうか 2026-08-06。cfg は useState の遅延初期化なので**初回マウントの data しか見ない**＝
  // 別デバイスで保存した前提が同期で後から届いても、タブを開き直すまで反映されなかった。
  // 未編集(dirty=false)の間だけ、届いた保存済みcfgを取り込む＝入力中の内容を同期で消さない。
  var dirtyRef = useRef(false);
  var edit = function(fn) { dirtyRef.current = true; setCfg(fn); };
  var savedKey = JSON.stringify((data.custom && data.custom.dtsCfg) || null);
  useEffect(function() {
    if (dirtyRef.current) return;
    var sv = data && data.custom && data.custom.dtsCfg;
    if (sv && sv.startYm && sv.endYm) setCfg(_dtsInitCfg(data, actual));
  }, [savedKey]);

  var clone = function(o) { var c = {}; for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; } return c; };
  var set = function(k, v) { edit(function(p) { var c = clone(p); c[k] = v; return c; }); };
  // 複数キーを1回で入れる（オートフィルが 1日あたり と ①営業日 をセットで置くため）2026-08-06B。
  var setMany = function(o) { edit(function(p) { var c = clone(p); for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; } return c; }); };
  // 2026-08-06M: setInj（単数 cfg.injection 用）は廃止＝⑧は injections 配列を setRow/addRow/delRow で編集する。
  var setSw = function(k, v) { edit(function(p) { var c = clone(p); c.livingSwitch = clone(p.livingSwitch || {}); c.livingSwitch[k] = v; return c; }); };
  var setRow = function(key, i, k, v) {
    edit(function(p) { var c = clone(p); var arr = (p[key] || []).slice(); arr[i] = clone(arr[i] || {}); arr[i][k] = v; c[key] = arr; return c; });
  };
  var addRow = function(key, tmpl) { edit(function(p) { var c = clone(p); c[key] = (p[key] || []).concat([tmpl]); return c; }); };
  // ⚠️空になった時の穴埋めは key ごとに形が違う＝drip に {from, amount} を入れると mode が undefined になり
  //   「定額0円」の行が黙って挿さる 2026-08-06。実際には行が1本の時は🗑を出していないのでここへは来ないが、
  //   将来 delRow を別経路から呼んだ時に壊れないよう形を揃えておく。
  var delRow = function(key, i) {
    edit(function(p) {
      var c = clone(p); var arr = (p[key] || []).slice(); arr.splice(i, 1);
      // ⚠️空になった時の穴埋めは key ごとに形が違う。⑧だけは**空を許す**（投入しない、が正当な設定なので）。
      if (!arr.length && key !== "injections") {
        arr = [key === "drip" ? { from: p.startYm, mode: "drip", amount: 50000, target: null } : { from: p.startYm, amount: 0 }];
      }
      c[key] = arr; return c;
    });
  };

  var autoRef = useRef(null);

  // 期間別テーブルの共通エディタ 2026-08-06M。③④⑤⑦⑧の5つが同じ形（条件＋中身＋🗑＋＋ボタン）なので1本にまとめる。
  //   cells(r, i) がその表固有の中身（金額・目標残高など）を返す。opts.below で⑧の「◯円以下」を出す。
  var _rowsEditor = function(key, opts, cells, mkTmpl) {
    var rows = cfg[key] || [], dead = _dtsShadowedRows(rows), o = opts || {};
    return React.createElement("div", null,
      _dtsOrderedRows(rows).map(function(ord) {
        var r = ord.r, i = ord.i;
        var onSet = function(k, v) { setRow(key, i, k, v); };
        return React.createElement("div", { key: key + i, style: Object.assign({ flexWrap: "wrap" }, _rowSty(dead[i])) },
          _dtsTrigCells(r, onSet, o).concat(cells(r, i)).concat([
            dead[i] ? _deadNote : null,
            (rows.length > (o.minRows == null ? 1 : o.minRows))
              ? React.createElement("button", { key: "del", onClick: function() { delRow(key, i); },
                  style: { fontSize: 10, color: "#B91C1C", background: "none", border: "none", cursor: "pointer" } }, "🗑") : null
          ]));
      }),
      _addRowBtn(key, mkTmpl));
  };

  var res = _dtsSimulate(cfg);
  // 🔧調整案 2026-08-06H。総当たりで200本以上シミュを回すので、**cfgが変わった時だけ**計算する。
  // ⚠️useMemo の依存に cfg（オブジェクト）を直接置かない＝ setCfg は毎回新しい参照を返すので、
  //   入力欄を1文字打つたびに全部回し直しになる。中身の署名（JSON）で比べること。
  // ⚠️**この行は下の `if (res.error) return` より前に置く**＝フックは早期returnの後ろに置けない
  //   （エラーの有無でフックの数が変わり、期間を空にした瞬間にReactが落ちる）。_dtsAdvice はエラー時 null を返す。
  // ⚠️閉じている間は計算しない＝1回62ms（実測）を入力の1文字ごとに払わない。開いている時だけ回す。
  var cfgKey = JSON.stringify(cfg);
  var adv = useMemo(function() { return openAdv ? _dtsAdvice(cfg) : null; }, [cfgKey, openAdv]);

  // ===== 自動保存 2026-08-06M（ユーザー要望「そもそも自動保存してほしい」）=====
  // 入力が止まって1.2秒で data.custom.dtsCfg へ書く。書き込み先は💾と同じなので保存・同期の経路は増えない。
  // ⚠️**必ず `var res = _dtsSimulate(cfg)` より後に置く**＝依存配列で res.error を読むので、前に置くと
  //   「Cannot read properties of undefined (reading 'error')」で画面ごと落ちる（実際にやらかした）。
  //   同時に `if (res.error) return` より**前**でもあること（フックは早期returnの後ろに置けない）。
  // ⚠️エラー中は保存しない（期間を空にした瞬間に壊れたcfgで上書きされ、復元できなくなる）。💾と同じ規約。
  // ⚠️保存済みと同じ内容なら書かない＝setData→stSave→fbPut が無駄に走らないようにする。
  // ⚠️debounce しないと1文字ごとにFirebaseへ書きに行く。タイマーはアンマウント時に必ず捨てる。
  var _saveSig = JSON.stringify(_dtsForSave(cfg));
  useEffect(function() {
    if (!dirtyRef.current || typeof setData !== "function") return;
    if (res.error) return;
    if (_saveSig === savedKey) { setSaveMsg(""); return; }
    setSaveMsg("保存中…");
    if (autoRef.current) clearTimeout(autoRef.current);
    autoRef.current = setTimeout(function() {
      autoRef.current = null;
      setData(function(d) { var nd = clone(d || {}); nd.custom = clone(nd.custom || {}); nd.custom.dtsCfg = JSON.parse(_saveSig); return nd; });
      setSaveMsg("✓ 自動保存しました");
      setTimeout(function() { setSaveMsg(""); }, 1600);
    }, 1200);
    return function() { if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; } };
  }, [_saveSig, savedKey, res.error]);
  // 提案の適用。⚠️評価に使った _dtsSetPath をそのまま通す＝「押したら提案と違う結果になった」を作らない。
  var applyProp = function(p) { edit(function(prev) { return _dtsSetPath(_dtsCfgClone(prev), p.path, p.value); }); };
  var applyProps = function(list) {
    edit(function(prev) {
      var c = _dtsCfgClone(prev);
      for (var i = 0; i < (list || []).length; i++) c = _dtsSetPath(c, list[i].path, list[i].value);
      return c;
    });
  };
  // 実際に計算へ使った値（クランプ・既定値差し替え後）。入力欄の注記はこちらを見る 2026-08-06。
  // ⚠️期間エラーの時は summary が無いので null＝注記側でフォールバックすること。
  var eff = res.summary ? res.summary.eff : null;
  var months = _dtsMonthCount(cfg.startYm, cfg.endYm);
  // グレードバッジは③の**行ごと**に出すようになった 2026-08-06M（期間別テーブル化）ので、ここでの一括計算は廃止。
  var badge = function(g) { return (typeof _elHoldGradeBadge === "function" && g) ? _elHoldGradeBadge(g) : null; };

  // 前提の保存（プリセット）。data.custom へ書けば既存の保存・同期経路にそのまま乗る。
  var doSave = function() {
    if (typeof setData !== "function") return;
    // ⚠️エラー中は保存させない 2026-08-06B。旧は赤字「開始年月が未入力です」が出ている状態でも💾を押せて、
    //   startYm:"" のまま data.custom.dtsCfg を上書きし、しかも「保存しました」と出していた。
    //   _dtsInitCfg 側もマージにしたので二重の保険になる（上書き済みは復元できないのでここで止めるのが本命）。
    if (res.error) { setSaveMsg("⚠ " + res.error + "（保存していません）"); setTimeout(function() { setSaveMsg(""); }, 2800); return; }
    setData(function(d) {
      var nd = clone(d || {}); nd.custom = clone(nd.custom || {}); nd.custom.dtsCfg = _dtsForSave(cfg); return nd;
    });
    setSaveMsg("保存しました"); setTimeout(function() { setSaveMsg(""); }, 1800);
  };

  // ---- 期間別テーブル（④⑤）の行まわり 2026-08-06I ----
  // 「＋途中で変える」は**今ある行の最も遅い月の翌月**を入れる（旧＝期間の開始月＝重複して効かない）。
  // 空きが無い時はボタンを押させない＝押せたのに何も起きない、を作らない。
  // 影になった行の判定は _rowsEditor が表ごとに出す 2026-08-06M（旧の _lcDead/_drDead は廃止）。
  var _rowSty = function(dead) {
    return { display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
      background: dead ? "#FEF2F2" : null, border: dead ? "1px solid #FCA5A5" : null,
      borderRadius: dead ? 6 : null, padding: dead ? "3px 5px" : null, opacity: dead ? 0.75 : 1 };
  };
  // ⚠️影になった行は⚠️欄（画面のずっと上）だけでなく**その行自体**にも出す＝間違えた場所で気づけるように。
  var _deadNote = React.createElement("span", { key: "dead", title: "同じ年月の行が上にあります。先に書いたほうだけが使われるので、この行は一度も使われません。年月を変えるか、この行を消してください。",
    style: { fontSize: 9, fontWeight: 800, color: "#B91C1C", whiteSpace: "nowrap" } }, "⚠ この行は使われません（年月が重複）");
  // 足す行は**今efectiveな行の値を引き継ぐ**（年月だけ変える）2026-08-06I。
  // ⚠️旧は生活費20万・積立5万の固定値だった＝今の設定と偶然一致すると押しても何も変わらず、
  //   一致しないと押しただけで結果が飛ぶ。どちらも「押した結果」が読めない。
  //   引き継ぎなら「押した直後は必ず変化なし → 変えた欄のぶんだけ動く」で挙動が一定になる。
  var _lastRowOf = function(key) {
    var rows = cfg[key] || [], best = null, bi = -1;
    for (var i = 0; i < rows.length; i++) {
      var fi = (rows[i] && rows[i].from) ? _dtsYmToIdx(rows[i].from) : null;
      if (fi != null && fi > bi) { bi = fi; best = rows[i]; }
    }
    return best;
  };
  // ⑥の方式と注記 2026-08-06J。⚠️注記は cfg の生値ではなく eff（＝実際に計算へ使った値）で組む。
  var _isPow = (cfg.stepMode === "power");
  var _mpOk = eff ? eff.marginOk : false;
  var _need100 = _mpOk ? (eff.mainPrice * 100 * eff.marginRate) : null;   // 100株の必要保証金
  var _noteSty = { fontSize: 9.5, fontWeight: 700, color: "#6B7280", lineHeight: 1.6, marginTop: 3 };
  var _stepNote = React.createElement("div", { style: _noteSty },
    !_mpOk ? "⑦のメイン株価を入れると、この方式で余力使用率がどう動くかをここに出します。"
    : _isPow
      ? ("株価 " + _dtsFmtYen(eff.mainPrice) + "円・保証金率 " + (Math.round(eff.marginRate * 1000) / 10) + "% だと、100株の必要保証金は "
        + _dtsFmtYen(_need100) + "円。目標 " + (Math.round(eff.targetUse * 1000) / 10) + "% を保つには 100株あたり "
        + _dtsFmtYen(_need100 / eff.targetUse) + "円 の取引資金が要ります（この額が貯まるたびに100株増える動きになります）。"
        + (eff.stepDown ? "" : "「資金が減ったら下げる」は入れていないので、減った月は目標を超えます。"))
      // ★方式Aで最も効く注記 2026-08-06J: 刻み額が「1段ぶんの必要保証金」より小さいと、段を上げるたび余力が上がっていく。
      //   ユーザーの前提（刻み20万・株価6,500円・率30%）は実測で 90%→94.5%（この期間）まで上がり、90%警戒ラインの意味が薄れていた。
      // ⚠️`必要保証金 ÷ 刻み額` は**資金が増え続けた先の到達点（漸近値）**であって、この期間で実際に出る最大ではない。
      //   実測では漸近97.5%に対し期間内の最大は94.5%。片方だけ書くともう片方と食い違って見えるので**両方**出す。
      : (function() {
          var need1 = eff.mainPrice * eff.stepShares * eff.marginRate;   // 1段ぶんの必要保証金
          var asym = need1 / eff.stepAmount;                             // 続けた先の到達点
          var keep90 = need1 / 0.90;                                     // 到達点を90%にする刻み額
          var obs = _dtsScore(res);                                      // この期間で実際に出た最大（表の余力使用率と同じ丸め）
          return React.createElement(React.Fragment, null,
            "この株価だと" + eff.stepShares.toLocaleString() + "株増やすごとに必要保証金が " + _dtsFmtYen(need1)
              + "円 増えます。刻み額 " + _dtsFmtYen(eff.stepAmount) + "円 との差 " + _dtsFmtYen(eff.stepAmount - need1)
              + "円 が1段ごとのバッファの増え方です。",
            React.createElement("span", { style: { display: "block", color: asym > 0.90 ? "#B45309" : "#047857" } },
              asym > 0.90
                ? ("このまま段を上げ続けると余力使用率は " + _dtsFmtPct(asym) + " へ近づきます（この期間の最大は "
                   + (obs ? obs.maxUse + "%" : "—") + "）。到達点を90%で止めたいなら刻み額は " + _dtsFmtYen(keep90) + "円です。")
                : ("刻み額のほうが1段ぶんの必要保証金より大きいので、段を上げるほど余力使用率は下がります（到達点 " + _dtsFmtPct(asym)
                   + "・この期間の最大は " + (obs ? obs.maxUse + "%" : "—") + "）。")));
        })());

  var _addRowBtn = function(key, mk) {
    var nf = _dtsNextFrom(cfg[key], cfg.startYm, cfg.endYm), prev = _lastRowOf(key);
    return React.createElement("button", {
      onClick: nf ? function() { addRow(key, mk(nf, prev)); } : null,
      disabled: !nf,
      title: nf ? ("「" + _dtsYmLbl(nf) + "から」の行を足します") : "①の終了月まで行が埋まっているので、これ以上は足せません（終了を延ばすか、既存の行の年月を早めてください）",
      style: { fontSize: 10, fontWeight: 700, color: _DTS_INK, background: _DTS_BG, border: "1px solid " + _DTS_BD,
        borderRadius: 6, padding: "3px 8px", cursor: nf ? "pointer" : "not-allowed", opacity: nf ? 1 : 0.45 }
    }, "＋ 途中で変える" + (nf ? "（" + _dtsYmLbl(nf) + "〜）" : ""));
  };

  // ---- 入力パネル ----
  var inputPanel = !openIn ? null : React.createElement("div", null,
    _dtsSec("① 期間", months ? "＝ " + months + "ヶ月" : null, _dtsRow([
      _dtsLbl("開始"), React.createElement(DtsYm, { key: "s", value: cfg.startYm, onChange: function(v) { set("startYm", v); } }),
      _dtsLbl("終了（月末まで）"), React.createElement(DtsYm, { key: "e", value: cfg.endYm, onChange: function(v) { set("endYm", v); } }),
      _dtsLbl("月間営業日"), React.createElement(DtsNum, { key: "bd", value: cfg.businessDays, width: 42, suffix: "日", step: 1, min: 1, onChange: function(v) { set("businessDays", v); } })
    ])),
    _dtsSec("② 今の状態", null, _dtsRow([
      _dtsLbl("取引資金"), React.createElement(DtsNum, { key: "ic", value: cfg.initialCapital, unit: "man", suffix: "万円", step: 1, onChange: function(v) { set("initialCapital", v); } }),
      _dtsLbl("生活口座"), React.createElement(DtsNum, { key: "il", value: cfg.initialLiving, unit: "man", suffix: "万円", step: 1, onChange: function(v) { set("initialLiving", v); } }),
      _dtsLbl("基礎取引株数"), React.createElement(DtsNum, { key: "is", value: cfg.initialShares, width: 52, suffix: "株", step: 100, onChange: function(v) { set("initialShares", v); } })
    ])),
    _dtsSec("③ 収益の前提", "記録帳と同じ単位（1日あたり・100株換算）", React.createElement("div", null,
      // 1日あたりは期間別テーブル 2026-08-06M。★「月初取引株数が◯株以上なら◯円」で**逓減**が書ける
      //   （枚数を増やすと100株あたりの取れ高が落ちる、という現実をユーザーが前提として置けるようにした）。
      _rowsEditor("perDayRows", {}, function(r, i) {
        var g = (typeof _profitGradeFromPnl === "function") ? _profitGradeFromPnl(Math.round(_dtsNumOrNull(r.amount) || 0), 1) : null;
        return [React.createElement("span", { key: "l", style: { fontSize: 10.5, fontWeight: 700, color: "#4B5563" } }, "1日あたり"),
          React.createElement(DtsNum, { key: "a", value: r.amount, width: 68, suffix: "円/100株", step: 100, onChange: function(v) { setRow("perDayRows", i, "amount", v); } }),
          React.createElement("span", { key: "g" }, badge(g))];
      }, function(ym, prev) { return { trig: "ym", from: ym, amount: prev ? (+prev.amount || 0) : 2000 }; }),
      _dtsRow([
        // ⚠️1日あたりと**①の月間営業日**をセットで入れる 2026-08-06B。actual.perDay の分母は
        //   「記録のあった日数」であって営業日数ではないので、①が20日のままだと月10日しか記録が無い人の
        //   月次が約2倍に膨らむ（実測: 実績2,730円/日・56日/22ヶ月＝月2.5日 なのに ×20日 で回っていた）。
        // ⚠️2026-08-06M: 期間別にしたので**先頭行の額**へ入れる（＋①営業日）。dailyPer100 も一緒に更新して
        //   おかないと、旧版の端末が読んだ時に古い値のまま動く（後方互換のため両方書く）。
        (actual && actual.perDay != null) ? React.createElement("button", {
          key: "af", onClick: function() {
            var pv = Math.round(actual.perDay);
            edit(function(p) {
              var c = clone(p); var arr = (p.perDayRows || []).slice();
              arr[0] = Object.assign({}, arr[0] || { trig: "ym", from: p.startYm }, { amount: pv });
              c.perDayRows = arr; c.dailyPer100 = pv;
              c.businessDays = Math.max(1, Math.round(actual.daysPerMon || 20));
              return c;
            });
          },
          style: { fontSize: 10, fontWeight: 800, color: "#fff", background: _DTS_SUB, border: "none", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }
        }, "🔄 実績を入れる（" + _dtsFmtYen(actual.perDay) + "円/日 × 月" + Math.max(1, Math.round(actual.daysPerMon || 20)) + "日）") : null,
        _dtsLbl("税率"), React.createElement(DtsNum, { key: "tx", value: cfg.taxRate, unit: "pct", width: 56, suffix: "%", step: 0.1, min: 0, max: 0.9, onChange: function(v) { set("taxRate", v); } })
      ]),
      React.createElement("div", { style: { fontSize: 9, color: "#6B7280", marginTop: 4, lineHeight: 1.5 } },
        // ⚠️2026-08-06B: 旧は「÷ 営業日数」「母数は集計ルール統一後の記録のみ」と書いていたが、実体は
        //   ①分母＝記録のあった日数（app-06.js の _projActual）②母数は「分析の母数」トグル次第（📈タブでは
        //   トグルを出していないので既定の全期間）。どちらも事実と違ったので実体に合わせた。
        actual && actual.perDay != null
          ? ("実績＝最終損益の合計 ÷ 記録のあった日数（" + actual.cnt + "件 / " + actual.days + "日"
            + (actual.mons ? " / " + actual.mons + "ヶ月＝月あたり " + (Math.round((actual.daysPerMon || 0) * 10) / 10) + "日" : "") + "）。"
            + "母数は" + (actual.sinceOnly ? "集計ルール統一後の記録" : "全期間の記録") + "。")
          : "実績を出せる記録がありません。手入力してください。",
        React.createElement("span", { style: { display: "block", color: "#B45309" } },
          "月次は 1日あたり × ①の月間営業日 で内部換算します（先頭行なら " + _dtsFmtYen(_dtsHeadAmt(cfg.perDayRows, 0) * (eff ? eff.days : 20)) + "円/月/100株）。"
          + "分母は「記録のあった日数」なので、取引しない営業日があるなら①も実際のトレード日数に合わせてください（上のボタンは両方まとめて入れます）。"))
    )),
    _dtsSec("④ 生活費", "社会保険料もここに足す（別枠は持たない）",
      _rowsEditor("livingCost", {}, function(r, i) {
        return [React.createElement("span", { key: "l", style: { fontSize: 10.5, fontWeight: 700, color: "#4B5563" } }, "月"),
          React.createElement(DtsNum, { key: "a", value: r.amount, unit: "man", suffix: "万円", step: 1, onChange: function(v) { setRow("livingCost", i, "amount", v); } })];
      }, function(ym, prev) { return { from: ym, amount: prev ? (+prev.amount || 0) : 200000 }; })),
    _dtsSec("⑤ 生活口座への積立", "目標残高に達すると積立が止まり、以降は全額が取引資金へ", React.createElement("div", null,
      _rowsEditor("drip", {}, function(r, i) {
        return [
          React.createElement("select", { key: "m", value: r.mode || "drip", onChange: function(e) { setRow("drip", i, "mode", e.target.value); }, style: _DTS_SEL_STY },
            React.createElement("option", { value: "drip" }, "定額"), React.createElement("option", { value: "fill" }, "目標まで全額")),
          (r.mode === "fill") ? null : React.createElement(DtsNum, { key: "a", value: r.amount, unit: "man", suffix: "万円/月", step: 1, onChange: function(v) { setRow("drip", i, "amount", v); } }),
          React.createElement("span", { key: "tl", style: { fontSize: 10.5, fontWeight: 700, color: "#4B5563" } }, "目標残高"),
          React.createElement(DtsNum, { key: "t", value: r.target, unit: "man", suffix: "万円", placeholder: "無制限", step: 5, onChange: function(v) { setRow("drip", i, "target", v); } })
        ];
      }, function(ym, prev) {
        return prev ? { from: ym, mode: prev.mode || "drip", amount: +prev.amount || 0, target: _dtsNumOrNull(prev.target) }
                    : { from: ym, mode: "drip", amount: 50000, target: null };
      }),
      // ⚠️行の条件と下の切替は**判定のタイミングが違う**。同じ画面に2つの規約が並ぶので必ず書いておく 2026-08-06L。
      React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#6B7280", lineHeight: 1.6, marginTop: 3 } },
        "上の行の条件（月初取引株数・月初取引資金）は「その月の月初の値で判定して、その月から」効きます。下の切替は「月末で判定して、翌月から」です。",
        React.createElement("span", { style: { display: "block" } },
          "どちらも一度成立したら戻しません（株数や資金が下がっても発動済みのまま）。条件を満たした行が複数あるときは、いちばん最近成立した行が使われます。")),
      _dtsSwitchRow(cfg, setSw)
    )),
    // 2026-08-05y ラベルを「月末の資金口座が◯万円になった次の月から」へ（ユーザー要望）。
    // ⚠️これは**表記だけの変更で計算は1行も変えていない**＝元から「前月末の資金で判定→当月に反映」なので
    //   ユーザーの言う「月末が◯万になった次の月から」と同じ規則。旧ラベル「資金口座◯万円から」だと
    //   いつの資金で判定していつ反映されるのかが読めなかった、というだけ。
    _dtsSec("⑥ 株数を増やすルール", _isPow ? "毎月の余力使用率から逆算" : "端数は次段へ繰り越し・資金が減っても下げない", React.createElement("div", null,
      _dtsRow([
        _dtsLbl("方式"),
        React.createElement("select", {
          key: "sm", value: _isPow ? "power" : "amount",
          onChange: function(e) { set("stepMode", e.target.value); },
          style: { fontSize: 11, fontWeight: 700, padding: "3px 4px", border: "1px solid " + _DTS_BD, borderRadius: 5, background: "#fff", color: "#1F2937" }
        },
          React.createElement("option", { value: "amount" }, "資金が◯円増えるごとに◯株"),
          React.createElement("option", { value: "power" }, "余力使用率が◯%を超えない最大株数"))
      ]),
      _isPow ? _dtsRow([
        // ⚠️step を渡さないと▲▼が出ない。ここは 85/90/95 と動かして比べる欄なので必ず付ける（2026-08-06K）。
        //   min/max は内部単位＝5%〜100%（0%は計算不能・100%超は保証金を超えて建てる指定なので止める）。
        _dtsLbl("毎月 余力使用率が"), React.createElement(DtsNum, { key: "tu", value: cfg.targetUse, unit: "pct", width: 52, suffix: "%", step: 1, min: 0.05, max: 1, onChange: function(v) { set("targetUse", v); } }),
        _dtsLbl("を超えない最大株数（100株単位）"),
        React.createElement("label", { key: "sd", style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 700, color: "#4B5563", cursor: "pointer" } },
          React.createElement("input", { type: "checkbox", checked: cfg.stepDown === true, onChange: function(e) { set("stepDown", e.target.checked); } }),
          "資金が減ったら株数も下げる")
      ]) : _dtsRow([
        _dtsLbl("月末の資金口座が"), React.createElement(DtsNum, { key: "sb", value: cfg.stepBase, unit: "man", suffix: "万円", placeholder: "開始時", step: 1, onChange: function(v) { set("stepBase", v); } }),
        _dtsLbl("になった次の月から"), React.createElement(DtsNum, { key: "sa", value: cfg.stepAmount, unit: "man", suffix: "万円", step: 1, onChange: function(v) { set("stepAmount", v); } }),
        _dtsLbl("増えるごとに"), React.createElement(DtsNum, { key: "ss", value: cfg.stepShares, width: 46, suffix: "株", step: 100, onChange: function(v) { set("stepShares", v); } })
      ]),
      // 上限の方式 2026-08-06M。方式A/Bどちらでも効く共通の天井なので、上の分岐の外に出して1行にした。
      _dtsRow([
        _dtsLbl("上限の方式"),
        React.createElement("select", { key: "mm", value: (cfg.maxMode === "multiple") ? "multiple" : "shares",
          onChange: function(e) { set("maxMode", e.target.value); }, style: _DTS_SEL_STY },
          React.createElement("option", { value: "shares" }, "◯株まで"),
          React.createElement("option", { value: "multiple" }, "取引資金の◯倍まで")),
        (cfg.maxMode === "multiple")
          ? React.createElement(DtsNum, { key: "mv", value: cfg.maxMultiple, width: 46, suffix: "倍", step: 0.1, min: 0.1, onChange: function(v) { set("maxMultiple", v); } })
          : React.createElement(DtsNum, { key: "ms", value: cfg.maxShares, width: 56, suffix: "株", placeholder: "無制限", step: 100, onChange: function(v) { set("maxShares", v); } })
      ]),
      _stepNote)),
    _dtsSec("⑦ 余力チェック", "拘束額＝株数×株価／必要保証金＝拘束額×保証金率", React.createElement("div", null,
      _dtsRow([
        _dtsLbl("委託保証金率"), React.createElement(DtsNum, { key: "mr", value: cfg.marginRate, unit: "pct", width: 52, suffix: "%", step: 1, min: 0.01, max: 1, onChange: function(v) { set("marginRate", v); } })
      ]),
      // メイン株価は期間別テーブル 2026-08-06M（「2027-04から8,000円」のような前提を置けるようにした）。
      _rowsEditor("priceRows", {}, function(r, i) {
        return [React.createElement("span", { key: "l", style: { fontSize: 10.5, fontWeight: 700, color: "#4B5563" } }, "メイン株価"),
          React.createElement(DtsNum, { key: "a", value: r.amount, width: 62, suffix: "円", step: 100, onChange: function(v) { setRow("priceRows", i, "amount", v); } })];
      }, function(ym, prev) { return { from: ym, amount: prev ? (+prev.amount || 0) : 6500 }; }),
      // ⚠️注記は cfg の生値ではなく eff（＝実際に計算へ使った値）で組む 2026-08-06。
      //   旧は cfg 直読みだったので、⑥の刻み額を空欄にすると「刻み額 —円 との差 -195,000円」と出るのに
      //   シミュ本体は既定の250,000円で回っている、という**説明と計算の食い違い**が起きていた。
      // ⚠️2026-08-06J: 「1段ごとのバッファの増え方」の説明は**⑥へ移した**（刻み額を打つ欄の真下で読めるべきなので）。
      //   ここに残すと同じ話が2箇所に出て、片方だけ古くなる。ここは⑦だけの話＝100株あたりいくら要るか、に絞る。
      React.createElement("div", { style: { fontSize: 9, color: "#B45309", marginTop: 4, lineHeight: 1.5 } },
        (eff && eff.marginOk)
          ? React.createElement(React.Fragment, null,
              "この設定だと 100株あたりの必要保証金は " + _dtsFmtYen(eff.mainPrice * 100 * eff.marginRate)
                + "円（＝株価 " + _dtsFmtYen(eff.mainPrice) + "円 × 100株 × " + (Math.round(eff.marginRate * 1000) / 10) + "%）。"
                + "取引資金の " + (Math.round(1 / eff.marginRate * 100) / 100) + "倍 まで建てられる計算です。",
              // ★方式Aでは株価が株数を1株も動かさない 2026-08-06P（ユーザー報告「入力しても何も変化しない」の正体）。
              //   株価は余力チェックの列（拘束額・余力使用率・理論最大株数）だけに効く。黙っていると
              //   「株価を変えたのに総資産も株数も動かない＝壊れている」と読める。
              React.createElement("span", { style: { display: "block", color: (eff.stepMode === "power" || eff.maxMode === "multiple") ? "#047857" : "#B45309" } },
                (eff.stepMode === "power" || eff.maxMode === "multiple")
                  ? "⑥が株価を使う設定なので、株価を変えると株数・損益も動きます。"
                  : "⑥が「資金が◯円増えるごとに◯株」なので、株価を変えても株数と損益は動きません（余力使用率・理論最大株数の列だけが動きます）。株価に株数を追従させたいなら、⑥の方式を「余力使用率から逆算」にするか、上限を「取引資金の◯倍まで」にしてください。"))
          : "メイン株価を入れると、100株あたりの必要保証金と建てられる上限をここに出します。")
    )),
    // ⑧は複数行＋条件つき 2026-08-06M。⚠️他の表と違い「状態」ではなく**その月に1回だけ起きる出来事**なので、
    //   条件を満たした行を全部その月に実行する（最後の1行を選ぶのではない）。一度成立した行は二度と発動しない。
    _dtsSec([_dtsAlphaMark("am8"), React.createElement("span", { key: "t8" }, "外部資金の投入")], "使わないなら行を消す（🗑）", React.createElement("div", null,
      (cfg.injections || []).length
        ? _rowsEditor("injections", { below: true, minRows: 0 }, function(r, i) {
            return [React.createElement(DtsNum, { key: "a", value: r.amount, unit: "man", suffix: "万円", step: 5, onChange: function(v) { setRow("injections", i, "amount", v); } }),
              React.createElement("span", { key: "l", style: { fontSize: 10.5, fontWeight: 700, color: "#4B5563" } }, "投入 → 直後の株数"),
              React.createElement(DtsNum, { key: "s", value: r.sharesAfter, width: 56, suffix: "株", placeholder: "指定なし", step: 100, onChange: function(v) { setRow("injections", i, "sharesAfter", v); } })];
          }, function(ym, prev) { return { trig: "ym", from: ym, amount: prev ? (+prev.amount || 0) : 500000, sharesAfter: null }; })
        : React.createElement("button", {
            onClick: function() { addRow("injections", { trig: "ym", from: cfg.startYm, amount: 500000, sharesAfter: null }); },
            style: { fontSize: 10, fontWeight: 700, color: _DTS_INK, background: _DTS_BG, border: "1px solid " + _DTS_BD, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }
          }, "＋ 投入を追加"),
      React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#6B7280", lineHeight: 1.6, marginTop: 3 } },
        "条件を満たした行はその月に1回だけ実行され、同じ行が二度発動することはありません（「資金が◯円以下になったら」は最初に下回った月だけ）。同じ月に複数の行が成立したら金額は合算し、直後の株数はいちばん大きい指定を使います。")
    ))
  );

  if (res.error) {
    return React.createElement("div", null, _dtsHeader(openIn, setOpenIn, doSave, saveMsg), inputPanel,
      React.createElement("div", { style: { color: "#B91C1C", fontSize: 12, fontWeight: 700, textAlign: "center", padding: "18px 0" } }, res.error));
  }

  return React.createElement("div", null,
    _dtsHeader(openIn, setOpenIn, doSave, saveMsg), inputPanel,
    _dtsWarnBox(res),
    _dtsSummaryCards(res, cfg),
    _dtsCharts(res),
    _dtsTable(res, cfg),
    _dtsMarks(res),
    // 📉余力使用率は🔧調整案の直前 2026-08-06N（ユーザー指定）。提案は「余力95%未満」を安全条件に選んでいるので、
    // 根拠のグラフがすぐ上にあると読みがつながる。
    _dtsChartPowerBox(res),
    _dtsAdviceBox(adv, applyProp, applyProps, openAdv, setOpenAdv)
    // 🎯グレード感度は 2026-08-06N に撤去（ユーザー指定「不要」）。🔧調整案が同じ「前提を振って比べる」役割を
    // 安全条件つきで担っているので、1日あたりだけ4段階に振る表は役目が重複していた。
  );
}

function _dtsHeader(openIn, setOpenIn, doSave, saveMsg) {
  return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" } },
    React.createElement("button", {
      onClick: function() { setOpenIn(!openIn); },
      style: { fontSize: 11, fontWeight: 800, color: _DTS_INK, background: _DTS_BG, border: "1px solid " + _DTS_BD, borderRadius: 7, padding: "4px 10px", cursor: "pointer" }
    }, (openIn ? "▼" : "▶") + " 前提を入力"),
    React.createElement("button", {
      onClick: doSave,
      style: { fontSize: 11, fontWeight: 800, color: "#fff", background: _DTS_INK, border: "none", borderRadius: 7, padding: "4px 10px", cursor: "pointer" }
    }, "💾 この前提を保存"),
    // 先頭が ⚠ なら保存を断った理由なので赤で出す 2026-08-06B（成功の緑と同じ色だと読み飛ばされる）。
    saveMsg ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: saveMsg.charAt(0) === "⚠" ? "#B91C1C" : "#047857" } }, saveMsg) : null);
}

// 期末のサマリーカード。まず結論の数字だけ先に見せる。
function _dtsSummaryCards(res, cfg) {
  var s = res.summary;
  // sub＝開始時からの増減（全カード共通）／sub2＝その下に出す小さな但し書き 2026-08-06C。
  // ⚠️sub は必ず増減で埋める＝1枚だけ別の意味の文字が入ると、カードの3行目の読み方が揃わなくなる。
  var card = function(lbl, val, sub, col, sub2) {
    return React.createElement("div", { key: lbl, style: { flex: "1 1 118px", minWidth: 108, border: "1px solid " + _DTS_BD, borderRadius: 9, padding: "6px 8px", background: "#fff" } },
      React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280" } }, lbl),
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: col || _DTS_INK, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 } }, val),
      sub ? React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280" } }, sub) : null,
      sub2 ? React.createElement("div", { style: { fontSize: 8.5, fontWeight: 700, color: "#9CA3AF", lineHeight: 1.35 } }, sub2) : null);
  };
  // 開始時からの増減を全カードに揃えて出す（旧: 期末取引資金だけ「＋◯◯万」で不揃いだった）2026-08-05。
  // ⚠️開始時の値は cfg 直読みではなく summary.start を使う 2026-08-06＝②に負や空欄を入れた時に
  //   カードの増減だけが月次と違う起点で計算されるのを防ぐ。
  var st0 = s.start || { capital: +cfg.initialCapital || 0, living: +cfg.initialLiving || 0, shares: Math.max(0, +cfg.initialShares || 0) };
  var sh0 = st0.shares, liv0 = st0.living;
  var gain = function(v) { return (v >= 0 ? "＋" : "−") + _dtsFmtMan(Math.abs(v)); };
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#6B7280", marginBottom: 4 } },
      _dtsYmLbl(s.startYm) + " 〜 " + _dtsYmLbl(s.endYm) + "末（" + s.months + "ヶ月）の見通し"),
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 } }, [
      // ⚠️総資産の増減には⑧で入れた外部資金が**含まれる** 2026-08-06C（ユーザー決定③）。旧はいちばん目立つ
      //   緑の「＋◯万」が投入込みで大きく出るだけで、「トレードでいくら増えたか」を示す数字が画面のどこにも
      //   無かった。ここに内訳の但し書きを添え、隣の自己資金ベースに**トレード由来だけの増減**を出す。
      card("期末 総資産", _dtsFmtMan(s.endTotal), gain(s.endTotal - st0.capital - liv0), "#047857",
        s.injection ? "うち外部資金 " + _dtsFmtMan(s.injection) : null),
      card("期末 取引資金", _dtsFmtMan(s.endCapital), gain(s.capitalGain)),
      card("期末 生活口座", _dtsFmtMan(s.endLiving), gain(s.endLiving - liv0)),
      card("期末 株数", s.endShares.toLocaleString() + "株", (s.endShares >= sh0 ? "＋" : "−") + Math.abs(s.endShares - sh0) + "株"),
      // 自己資金ベース＝総資産−外部資金の累計。増減がここに出ると**それがトレードで増やした額そのもの**になる。
      card("自己資金ベース", _dtsFmtMan(s.endOwnBase), gain(s.endOwnBase - st0.capital - liv0), null,
        s.injection ? "外部 " + _dtsFmtMan(s.injection) + " を除く" : "外部資金なし"),
      card("手取り合計", _dtsFmtMan(s.net), "税 " + _dtsFmtMan(s.tax) + " 控除後", "#9A3412")
    ]));
}

// ---- グラフ（自前SVG）----------------------------------------------------
// Chart.js / recharts は入れない＝ビルド工程なし・file:// 運用・SWプリキャッシュのためCDNを増やせない。
// ダークモードは html.sn-dark のCSSフィルタ（invert+hue-rotate）が全体に掛かるので、ここは light 前提の色で描く。
function _dtsXLbl(ym) { return ym.slice(2).replace("-", "/"); }
function _dtsSvgText(k, tx, ty, t, ex) {
  return React.createElement("text", Object.assign({ key: k, x: tx, y: ty, fontSize: 9, fill: "#6B7280", fontWeight: 700 }, ex || {}), t);
}

// ① 総資産の積み上げ棒（取引資金＋生活口座）＋ 株数の階段線（右軸）。
//    「資金が増える → 株数が上がる」の連動を1枚で見せるのが狙い。
// hi＝ホバー中の月index（null＝ホバー無し）2026-08-05H。当たり判定は _dtsHitIdx が同じ pL/pR/W で計算するので、
// ⚠️ここの余白を変えたら _dtsHitIdx の定数も必ず合わせること（ズレるとカーソルと違う月が光る）。
function _dtsChartAssets(rows, hi) {
  if (!rows || !rows.length) return null;
  var W = 720, H = 300, pL = 58, pR = 54, pT = 30, pB = 32;
  var pw = W - pL - pR, ph = H - pT - pB, n = rows.length, i;
  var step = pw / n, barW = Math.max(2, Math.min(30, step * 0.6));
  // ⚠️minT を見るのは 2026-08-05F から。以前は 0 起点固定だったので、資金がマイナスに落ちた月は
  //   棒の高さが 0 にクリップされて**画面から消えていた**＝いちばん見たい「破綻している月」が無表示だった。
  var maxT = 0, maxS = 0, minT = 0;
  for (i = 0; i < n; i++) {
    if (rows[i].total > maxT) maxT = rows[i].total;
    if (rows[i].shares > maxS) maxS = rows[i].shares;
    if (rows[i].total < minT) minT = rows[i].total;
    if (rows[i].capital < minT) minT = rows[i].capital;
    // ⚠️棒の**実頂点**でも上端を取る 2026-08-06。取引資金がマイナスの月は生活口座の棒を0から積む
    //   （下の lBase 参照）ので頂点は living そのもの＝total より |capital| ぶん高い。total だけで
    //   上端を決めると、その差ぶん棒が描画域を突き抜けて軸タイトルに重なる。
    var _bt = Math.max(0, rows[i].capital) + rows[i].living;
    if (_bt > maxT) maxT = _bt;
  }
  // 区切り線は**100万円ごとに実線・50万円ごとに点線**（ユーザー指定 2026-08-05）。
  // ただし期間が長く総資産が伸びると本数が増えすぎるので、実線が12本を超える時だけ 200万→500万→… と粗くする
  // （点線は常に実線の半分＝既定なら50万円）。旧実装の「最大値を機械的に4等分」はやめた。
  // ⚠️刻みは maxT ではなく**上下を合わせた幅**で選ぶ 2026-08-06B。旧は maxT だけを見ていたので、総資産が
  //   全月マイナスだと maxT=0 のまま刻みが100万に固定され、下側の段数(nMin)が青天井になった。
  //   実測: ④生活費の万円欄に 100000（＝10億円）と打つと nMin=11,997 ＝ 線とラベルで約36,000要素。
  //   入力は1文字ごとに再計算されるので、打ち終わる前にタブが固まって入力を戻すこともできなくなる。
  //   マイナスが無い前提（minT=0）なら span===maxT なので、従来の目盛りと完全に一致する。
  var MAJ = [1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8, 2e8, 5e8];
  var span = maxT + Math.max(0, -minT);
  var major = MAJ[MAJ.length - 1];
  for (i = 0; i < MAJ.length; i++) { if (Math.ceil(span / MAJ[i]) <= 12) { major = MAJ[i]; break; } }
  // MAJ を使い切っても収まらない桁（総資産60億超・生活費の桁誤りなど）は10倍ずつ粗くして必ず12本以内に収める。
  for (i = 0; i < 30 && Math.ceil(span / major) > 12; i++) major *= 10;
  // 0より下にも段を取る 2026-08-05F。nMin=0（＝マイナス無し）なら従来と完全に同じ目盛りになる。
  var nMaj = Math.max(1, Math.ceil(maxT / major));
  var nMin = Math.ceil(Math.max(0, -minT) / major);
  var yTop = major * nMaj, yBot = -major * nMin, ySpan = yTop - yBot, minor = major / 2;
  // 右軸（株数）は**目盛りの数字だけ・区切り線は引かない** 2026-08-05G（2026-08-05E で入れた実線/点線は
  // 左軸のグレー線と二重になって画面が線だらけになったので撤去した。描画は下の "gr" ループ＝text のみ）。
  // 刻みの選び方だけは残す＝機械的な4等分に戻すと 2,500株で 625 / 1,250 / 1,875 のような、実際には
  // 建てられない半端な株数がラベルに並ぶ。⚠️数万株まで伸びてもラベルが8個以内に収まる刻みを選ぶ。
  // 2026-08-06: 点線刻み(sMin)は線を引かなくなった時点で誰も読んでいなかったので、組ではなく単純な配列に戻した。
  var SMAJ = [500, 1000, 2000, 5000, 10000, 50000, 100000];
  var sMaj = SMAJ[SMAJ.length - 1];
  for (i = 0; i < SMAJ.length; i++) { if (Math.ceil(Math.max(1, maxS) / SMAJ[i]) <= 8) { sMaj = SMAJ[i]; break; } }
  // SMAJ を使い切る株数（80万株超）でもラベルが増え続けないよう10倍ずつ粗くする 2026-08-06B（左軸と同じ保険）。
  for (i = 0; i < 30 && Math.ceil(Math.max(1, maxS) / sMaj) > 8; i++) sMaj *= 10;
  var nS = Math.max(1, Math.ceil(Math.max(1, maxS) / sMaj)), sTop = sMaj * nS;
  var y = function(v) { return pT + ph - ((v - yBot) / ySpan) * ph; };
  var yz = y(0);
  // 株数の軸は**金額のゼロ線と原点を揃える**＝マイナス域があるときに株数だけ下へ伸びないようにする。
  // マイナスが無ければ yz は描画域の下端なので、従来の式と完全に一致する。
  var ys = function(v) { return yz - (v / sTop) * (yz - pT); };
  var kids = [], g;

  for (g = -nMin; g <= nMaj; g++) {
    var gv = major * g, gy = y(gv);
    if (g < nMaj) {
      var my = y(gv + minor);
      kids.push(React.createElement("line", { key: "gm" + g, x1: pL, y1: my, x2: pL + pw, y2: my, stroke: "#E2E0DC", strokeWidth: 1, strokeDasharray: "2 4" }));
    }
    kids.push(React.createElement("line", { key: "g" + g, x1: pL, y1: gy, x2: pL + pw, y2: gy, stroke: g === 0 ? "#CBD5E1" : "#E5E7EB", strokeWidth: g === 0 ? 1.5 : 1 }));
    kids.push(_dtsSvgText("gl" + g, pL - 6, gy + 3, _dtsFmtMan(gv), { textAnchor: "end", fill: g < 0 ? "#B91C1C" : "#6B7280" }));
  }
  // 右軸の目盛り＝数字のみ（線を引かない理由は上の SMAJ のコメント参照）。
  for (g = 0; g <= nS; g++) {
    var sv = sMaj * g;
    kids.push(_dtsSvgText("gr" + g, pL + pw + 6, ys(sv) + 3, sv.toLocaleString(), { textAnchor: "start", fill: "#B45309" }));
  }
  for (i = 0; i < n; i++) {
    var r = rows[i], bx = pL + step * i + (step - barW) / 2;
    // 取引資金はゼロ線を基準に上下どちらにも伸ばす（マイナスの月は下向きの赤い棒）。
    var yc = y(r.capital);
    kids.push(React.createElement("rect", { key: "bc" + i, x: bx, y: Math.min(yz, yc), width: barW,
      height: Math.max(1, Math.abs(yc - yz)), fill: r.capital < 0 ? "#FCA5A5" : "#93C5FD" }));
    // 生活口座は取引資金の上に積む。⚠️取引資金がマイナスの月はゼロ線から積む＝
    //   マイナスの棒の上に積むと「total」の位置に生活口座が浮いて何を見ているか分からなくなる。
    var lBase = Math.max(0, r.capital), yl0 = y(lBase), yl1 = y(lBase + r.living);
    kids.push(React.createElement("rect", { key: "bl" + i, x: bx, y: Math.min(yl0, yl1), width: barW,
      height: Math.max(0, Math.abs(yl1 - yl0)), fill: "#FCD34D" }));
  }
  var d = "";
  for (i = 0; i < n; i++) {
    var x0 = pL + step * i, x1 = pL + step * (i + 1), yy = ys(rows[i].shares);
    d += (i === 0 ? "M" : "L") + x0.toFixed(1) + " " + yy.toFixed(1) + "L" + x1.toFixed(1) + " " + yy.toFixed(1);
  }
  kids.push(React.createElement("path", { key: "sh", d: d, fill: "none", stroke: "#B45309", strokeWidth: 2 }));

  // ⚠️**最終月から逆向きに**間引く 2026-08-06。前向き（i=0,every,2every…）だと最後のラベルが n-1 に
  //   届かず、120ヶ月では111ヶ月目が最後＝右端の9ヶ月ぶんが無名になっていた。期末がいつかは必ず要る。
  var every = Math.ceil(n / 12);
  for (i = n - 1; i >= 0; i -= every) {
    kids.push(_dtsSvgText("x" + i, pL + step * i + step / 2, H - 11, _dtsXLbl(rows[i].ym), { textAnchor: "middle", fontSize: 8.5 }));
  }
  // 軸タイトルは目盛りラベルと同じ x に置くと重なる（旧実装で「総資産」と「1,000万」が被っていた）。
  // 上端の余白へ逃がし、左右の端に寄せる＝目盛りとは列がずれるので絶対に重ならない。
  kids.push(_dtsSvgText("axL", 4, 13, "総資産（万円）", { textAnchor: "start", fontSize: 9, fill: "#1E3A8A" }));
  kids.push(_dtsSvgText("axR", W - 4, 13, "株数（株）", { textAnchor: "end", fontSize: 9, fill: "#B45309" }));
  if (hi != null && rows[hi]) {
    var hx = pL + step * hi + step / 2;
    kids.push(React.createElement("line", { key: "hv", x1: hx, y1: pT, x2: hx, y2: pT + ph, stroke: _DTS_INK, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.5 }));
    kids.push(React.createElement("rect", { key: "hb", x: pL + step * hi, y: pT, width: step, height: ph, fill: _DTS_INK, opacity: 0.06 }));
  }
  return React.createElement("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", style: { display: "block", minWidth: 460 }, role: "img" },
    React.createElement("title", null, "総資産（取引資金＋生活口座）の積み上げ棒と株数の推移"), kids);
}

// ② 余力使用率の折れ線。70/90/95%の帯を敷いて、危ない月が目で拾えるようにする（2026-08-06D に 85→90）。
function _dtsChartPower(rows, hi) {
  if (!rows || !rows.length) return null;
  // ⚠️縦を 230→300 に広げた 2026-08-06O（ユーザー報告「90%と95%が近すぎてつぶれて見えない」）。
  //   旧は描画域 172px・縦軸0〜100%だったので **5ポイント＝8.6px** しかなく、90/95の破線がくっついていた。
  var W = 720, H = 300, pL = 58, pR = 54, pT = 26, pB = 32;
  var pw = W - pL - pR, ph = H - pT - pB, n = rows.length, i;
  var step = pw / n, maxU = 0, minU = Infinity;
  for (i = 0; i < n; i++) {
    if (rows[i].powerUse == null) continue;
    if (rows[i].powerUse > maxU) maxU = rows[i].powerUse;
    if (rows[i].powerUse < minU) minU = rows[i].powerUse;
  }
  // ⚠️上端は 200% で頭打ちにする 2026-08-06B。月初の取引資金が0に近い月があると、分子の株数はラチェットで
  //   縮まないので powerUse が数千%まで発散する。旧はクランプが無く、実測で 上端3,000%・目盛り121本・
  //   緑帯4.0px/黄帯0.57px まで潰れて「どの月が危ないか」が全く読めなくなっていた（25%刻みで切り上げるのは
  //   目盛りをキリのいい%に保つため）。超えた月は上端に貼り付けて赤丸で示す＝正確な%は表とホバーで読める。
  var CAP = 2.0;
  var rawTop = Math.max(1.0, Math.ceil(maxU / 0.25) * 0.25);
  var top = Math.min(CAP, rawTop), clipped = rawTop > top;
  // ★縦軸の下端 2026-08-06O。実際の余力使用率は 70〜95% の狭い所に固まるのに 0% から描いていたので、
  //   画面の7割が誰も通らない空白で、肝心の 90/95% の差が潰れていた。データが十分高い所に居る時だけ
  //   下端を切り上げる（10%刻みで、最小値の5ポイント下）。
  // ⚠️軸を0から始めないので、**切り上げた時は軸ラベルにその旨を必ず出す**（下のaxP）＝黙って
  //   ゼロ基準でないグラフにしない。データが低い所まで来る前提では従来どおり0から描く。
  var bot = 0;
  if (isFinite(minU) && minU >= 0.55) bot = Math.max(0, Math.floor((minU - 0.05) / 0.10) * 0.10);
  var span = Math.max(0.1, top - bot);
  var y = function(v) { return pT + ph - ((Math.max(bot, Math.min(v, top)) - bot) / span) * ph; };
  var x = function(i2) { return pL + step * i2 + step / 2; };
  var kids = [];
  var band = function(k, lo, hi, col) {
    var y1 = y(Math.min(hi, top)), y2 = y(Math.max(lo, bot));
    if (y2 <= y1) return;
    kids.push(React.createElement("rect", { key: k, x: pL, y: y1, width: pw, height: y2 - y1, fill: col }));
  };
  band("b1", 0, 0.70, "#F0FDF4"); band("b2", 0.90, 0.95, "#FEFCE8"); band("b3", 0.95, top, "#FEF2F2");
  // 目盛りは幅に応じて 5/10/25% 刻み（左）。警戒ライン70/90/95%は破線＋**右側**にラベルを置く＝左の目盛りと重ならない。
  // ⚠️刻みを幅で切り替えるのは、下端を上げた時に25%刻みだと線が2〜3本しか出ず目盛りとして機能しないため。
  // ⚠️帯・破線・_dtsUseTone・凡例の4箇所は**必ず同じ数字**にすること（片方だけ直すと表とグラフで色が食い違う）。
  var gstep = span <= 0.25 ? 0.05 : (span <= 0.6 ? 0.10 : 0.25);
  // ⚠️目盛りは**刻みの倍数に揃える**（bot から数え始めない）2026-08-06O。bot=80%・刻み25%だと
  //   80/105/130/155… という誰も読めない端数の目盛りになる（実測）。倍数に揃えれば 100/125/150…。
  var g0 = Math.ceil((bot - 1e-9) / gstep) * gstep;
  var nG = Math.floor((top - g0) / gstep + 1e-9);
  for (i = 0; i <= nG; i++) {
    var gv = g0 + gstep * i, gy = y(gv);
    // 0%の線だけ濃くする＝ゼロ基準の目印。下端を切り上げている時はゼロ線が無いので全部同じ薄さにする。
    kids.push(React.createElement("line", { key: "pg" + i, x1: pL, y1: gy, x2: pL + pw, y2: gy,
      stroke: (bot === 0 && i === 0) ? "#CBD5E1" : "#E5E7EB", strokeWidth: 1 }));
    kids.push(_dtsSvgText("pgl" + i, pL - 6, gy + 3, Math.round(gv * 100) + "%", { textAnchor: "end" }));
  }
  var refs = [[0.70, "#047857"], [0.90, "#A16207"], [0.95, "#B91C1C"]];
  for (i = 0; i < refs.length; i++) {
    // ⚠️下端より下の警戒ラインは描かない＝描くと軸の一番下に貼り付いて「70%が下端」と誤読させる。
    if (refs[i][0] > top || refs[i][0] < bot) continue;
    kids.push(React.createElement("line", { key: "r" + i, x1: pL, y1: y(refs[i][0]), x2: pL + pw, y2: y(refs[i][0]), stroke: refs[i][1], strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.75 }));
    kids.push(_dtsSvgText("rl" + i, pL + pw + 6, y(refs[i][0]) + 3, Math.round(refs[i][0] * 100) + "%", { textAnchor: "start", fill: refs[i][1] }));
  }
  // ⚠️計算できない月（月初資金が0以下・株価未入力）は線を**切る** 2026-08-06。
  //   1本の polyline に繋ぐと、資金が尽きて余力を計算できない月を線が黙ってまたいでしまい、
  //   グラフの上では「その月が存在しない」ことになる。区間ごとに polyline を分ける。
  var segs = [], cur = [];
  for (i = 0; i < n; i++) {
    if (rows[i].powerUse == null) { if (cur.length) { segs.push(cur); cur = []; } continue; }
    cur.push(x(i).toFixed(1) + "," + y(rows[i].powerUse).toFixed(1));
  }
  if (cur.length) segs.push(cur);
  for (i = 0; i < segs.length; i++) {
    kids.push(React.createElement("polyline", { key: "ln" + i, points: segs[i].join(" "), fill: "none", stroke: "#1E3A8A", strokeWidth: 2 }));
  }
  for (i = 0; i < n; i++) {
    var r = rows[i]; if (r.powerUse == null) continue;
    var tone = _dtsUseTone(r.powerUse, r.shortMargin);
    var over = r.powerUse > top;   // 上端で切った月＝赤丸を一回り大きく白フチで（貼り付いた点だと分からないため）
    kids.push(React.createElement("circle", { key: "p" + i, cx: x(i), cy: y(r.powerUse),
      r: over ? 3.4 : (n > 40 ? 1.6 : 2.8), fill: over ? "#B91C1C" : (tone.ink || "#1E3A8A"),
      stroke: over ? "#fff" : "none", strokeWidth: over ? 1 : 0 }));
  }
  var every = Math.ceil(n / 12);   // 最終月から逆向きに間引く（総資産グラフと同じ理由・2026-08-06）
  for (i = n - 1; i >= 0; i -= every) {
    kids.push(_dtsSvgText("x" + i, x(i), H - 11, _dtsXLbl(rows[i].ym), { textAnchor: "middle", fontSize: 8.5 }));
  }
  // ⚠️0から描いていない時は必ず明記する 2026-08-06O（黙ってゼロ基準でないグラフにしない）。
  kids.push(_dtsSvgText("axP", 4, 13, bot > 0 ? ("余力使用率（縦軸は" + Math.round(bot * 100) + "%から）") : "余力使用率",
    { textAnchor: "start", fontSize: 9, fill: "#1E3A8A" }));
  kids.push(_dtsSvgText("axP2", W - 4, 13, clipped ? "警戒ライン（●は200%超）" : "警戒ライン",
    { textAnchor: "end", fontSize: 9, fill: clipped ? "#B91C1C" : "#A16207" }));
  if (hi != null && rows[hi]) {
    kids.push(React.createElement("line", { key: "hv", x1: x(hi), y1: pT, x2: x(hi), y2: pT + ph, stroke: _DTS_INK, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.5 }));
    if (rows[hi].powerUse != null) kids.push(React.createElement("circle", { key: "hp", cx: x(hi), cy: y(rows[hi].powerUse), r: 4.5, fill: "none", stroke: _DTS_INK, strokeWidth: 2 }));
  }
  return React.createElement("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", style: { display: "block", minWidth: 460 }, role: "img" },
    React.createElement("title", null, "余力使用率の推移（70/90/95%の警戒ライン付き）"), kids);
}

function _dtsLegend(items) {
  return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 10, fontSize: 9, fontWeight: 700, color: "#6B7280", marginTop: 2 } },
    items.map(function(it) {
      return React.createElement("span", { key: it[0], style: { display: "inline-flex", alignItems: "center", gap: 3 } },
        React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: it[1], display: "inline-block" } }), it[0]);
    }));
}

// カーソルのx座標 → 何月目か 2026-08-05H。SVGは viewBox 720 幅の 100% 表示なので、
// 実寸(rect.width)から viewBox 座標へ戻してから列幅で割る。⚠️pL/pR/W は両グラフ共通の値と一致必須。
function _dtsHitIdx(clientX, el, n) {
  if (!el || !n) return null;
  var r = el.getBoundingClientRect(); if (!r.width) return null;
  var vx = (clientX - r.left) / r.width * 720;
  var pL = 58, pw = 720 - 58 - 54;
  var i = Math.floor((vx - pL) / (pw / n));
  if (i < 0) i = 0; if (i > n - 1) i = n - 1;
  return i;
}

// ホバー時の吹き出し（案D＝2カラム。ユーザー選択 2026-08-05H）。
// 左＝損益の引き算／右＝資金と余力。⚠️縦を短く保つのが選定理由なので、行を足すときは列に振り分けること。
function _dtsTipD(r) {
  var lbl = function(t) { return React.createElement("span", { style: { color: "#6B7280" } }, t); };
  var row = function(k, t, v, col) {
    return React.createElement("div", { key: k, style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "1px 0" } },
      lbl(t), React.createElement("span", { style: { fontWeight: col ? 800 : 700, color: col || "#1F2937" } }, v));
  };
  var head = function(t) { return React.createElement("div", { style: { fontSize: 9, color: "#9CA3AF", fontWeight: 700, marginBottom: 2 } }, t); };
  var pair = function(k, t, a, b) {
    return React.createElement("div", { key: k, style: { marginBottom: 3 } },
      React.createElement("div", { style: { color: "#6B7280" } }, t),
      React.createElement("div", null, _dtsFmtMan(a), React.createElement("span", { style: { color: "#CBD5E1", margin: "0 3px" } }, "→"),
        React.createElement("span", { style: { fontWeight: 800, color: _DTS_INK } }, _dtsFmtMan(b))));
  };
  var tone = _dtsUseTone(r.powerUse, r.shortMargin);
  return React.createElement("div", { style: { fontSize: 10.5, fontVariantNumeric: "tabular-nums", lineHeight: 1.5 } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 5 } },
      React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, color: _DTS_INK } }, r.lbl),
      React.createElement("span", { style: { fontWeight: 800, color: r.stepUp ? _DTS_UP : "#374151" } }, r.shares.toLocaleString() + "株")),
    r.injected ? React.createElement("div", { style: { color: "#6D28D9", fontWeight: 800, marginBottom: 4 } }, "外部資金 " + _dtsFmtMan(r.injected) + "円を投入") : null,
    React.createElement("div", { style: { display: "flex", gap: 14 } },
      React.createElement("div", { style: { minWidth: 96 } }, head("損益"),
        row("g", "税引前", _dtsFmtMan(r.gross)),
        row("n", "手取り", _dtsFmtMan(r.net)),
        row("e", "生活費", r.expense ? "−" + _dtsFmtMan(r.expense) : _dtsFmtMan(0), r.expense ? _DTS_DOWN : "#9CA3AF"),
        // 切替中は⑤の積立が動かないので「—」、残金は行き先の「（生）」付き＝表と同じ読み方に揃える。
        // ⚠️判定は toLivingSwitch>0 ではなく **switched** 2026-08-06。切替中でも赤字月は移動額が0なので、
        //   前者だと赤字月だけ「0万」に戻り、切替前の月と見分けがつかなくなる。
        row("t", "積立", r.switched ? "—" : (r.toLiving ? "−" + _dtsFmtMan(r.toLiving) : _dtsFmtMan(0)), r.switched ? "#9CA3AF" : (r.toLiving ? _DTS_DOWN : "#9CA3AF")),
        row("r", "残金", r.toLivingSwitch > 0 ? (_dtsFmtMan(r.toLivingSwitch) + "（生）")
          : ((r.toCapital < 0 ? "−" : "") + _dtsFmtMan(Math.abs(r.toCapital))),
          r.toLivingSwitch > 0 ? _DTS_DOWN : (r.toCapital < 0 ? _DTS_DOWN : _DTS_UP))),
      React.createElement("div", { style: { minWidth: 108 } }, head("資金"),
        pair("cp", "取引資金", r.capitalOpen, r.capital),
        pair("pw", "信用余力", r.powerOpen, r.powerEnd),
        React.createElement("div", null, React.createElement("div", { style: { color: "#6B7280" } }, "生活口座"),
          React.createElement("div", { style: { fontWeight: 800 } }, _dtsFmtMan(r.living))))),
    React.createElement("div", { style: { marginTop: 4, paddingTop: 4, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", gap: 8 } },
      lbl("余力使用率"),
      React.createElement("span", { style: { fontWeight: 800, color: tone.ink || "#374151" } }, _dtsFmtPct(r.powerUse) + (tone.lbl ? " " + tone.lbl : ""))));
}

// グラフ1枚＝ホバー状態を持つ小さなコンポーネント 2026-08-05H。
// 吹き出しはSVGのtextではなく**HTMLの絶対配置**で出す＝2カラムの折り返しをCSSに任せられる。
// ⚠️position:absolute の親は overflowX:auto の内側に置く＝外に置くと横スクロール時に吹き出しだけ取り残される。
function DtsChartBox(props) {
  var _h = useState(null), hi = _h[0], setHi = _h[1];
  var ref = useRef(null);
  var rows = props.rows, n = rows.length;
  var move = function(cx) { setHi(_dtsHitIdx(cx, ref.current, n)); };
  var pw = 720 - 58 - 54, step = pw / n;
  var fx = (hi == null) ? 0 : (58 + step * hi + step / 2) / 720;
  // 端で画面外へはみ出さないよう寄せ方を3段階に切り替える。
  var tf = fx < 0.28 ? "translateX(0)" : (fx > 0.72 ? "translateX(-100%)" : "translateX(-50%)");
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, background: "#fff", padding: "7px 10px 4px", marginBottom: 6 } },
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: _DTS_INK, marginBottom: 2 } }, props.title,
      React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280", marginLeft: 6 } }, props.note)),
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("div", { ref: ref, style: { position: "relative", minWidth: 460 },
        onMouseMove: function(e) { move(e.clientX); },
        onMouseLeave: function() { setHi(null); },
        onTouchStart: function(e) { if (e.touches && e.touches[0]) move(e.touches[0].clientX); },
        onTouchMove: function(e) { if (e.touches && e.touches[0]) move(e.touches[0].clientX); },
        // ⚠️指を離した時の消し込み 2026-08-06。マウスは onMouseLeave で消えるがタッチには終了イベントが
        //   無く、吹き出しとクロスヘアがグラフを覆ったまま残っていた（別の月をタップするまで消えない）。
        onTouchEnd: function() { setHi(null); },
        onTouchCancel: function() { setHi(null); }
      },
        props.draw(rows, hi),
        (hi != null && rows[hi]) ? React.createElement("div", {
          style: { position: "absolute", left: (fx * 100) + "%", top: 6, transform: tf, pointerEvents: "none",
            background: "#fff", border: "1px solid " + _DTS_BD, borderRadius: 8, padding: "7px 9px",
            boxShadow: "0 2px 8px rgba(0,0,0,.12)", zIndex: 2, whiteSpace: "nowrap" } }, _dtsTipD(rows[hi])) : null)),
    props.legend);
}

function _dtsCharts(res) {
  // ⚠️取引資金がマイナスの月の棒は #FCA5A5（ピンク赤）で描くのに凡例に無かった 2026-08-06。
  //   「破綻している月を見せる」のがこのグラフの狙いなのに、赤い棒が何の系列か画面から分からなかった。
  //   マイナスの月がある時だけ足す＝通常の前提で凡例が1項目増えて散らからないように。
  var hasNeg = false;
  for (var i = 0; i < res.rows.length; i++) { if (res.rows[i].capital < 0) { hasNeg = true; break; } }
  var lgA = [["取引資金", "#93C5FD"]]
    .concat(hasNeg ? [["取引資金（マイナス）", "#FCA5A5"]] : [])
    .concat([["生活口座", "#FCD34D"], ["株数", "#B45309"]]);
  return React.createElement(DtsChartBox, { rows: res.rows, draw: _dtsChartAssets,
    title: "📊 総資産と株数の推移", note: "棒＝総資産の内訳（左軸・万円）／線＝株数（右軸・株）　カーソルを合わせるとその月の内訳が出ます",
    legend: _dtsLegend(lgA) });
}
// 📉余力使用率だけ別関数にした 2026-08-06N（ユーザー要望「調整案セクションの上に移動して」）。
// ⚠️_dtsCharts に同居させたままだと総資産グラフと必ず一緒に動くので、置き場所を変えるには分けるしかない。
//   ここは「🔧調整案の直前」に置く＝提案が安全条件（余力95%未満）で選ばれているので、根拠のグラフが
//   すぐ上にあると読みがつながる。
function _dtsChartPowerBox(res) {
  return React.createElement(DtsChartBox, { rows: res.rows, draw: _dtsChartPower,
    title: "📉 余力使用率", note: "拘束額 ÷（取引資金 ÷ 保証金率）。95%超は1回の負けで詰む水準",
    legend: _dtsLegend([["〜70% 余裕", "#DCFCE7"], ["90〜95% 警戒", "#FEF9C3"], ["95%〜 危険", "#FEE2E2"]]) });
}

// 表の配色 2026-08-05w（ユーザー指定）＝株式の慣習どおり **増える＝赤／減る・出ていく＝緑**。
// 記録帳の比較データ（app-06 _elDayStockBenchV2）も「↑赤=良い方向／↓緑=悪い方向」なので、
// この表だけ緑↑・赤↓のままだと同じアプリの中で符号の読み方が逆になってしまう（2026-08-05w に反転）。
var _DTS_UP = "#B91C1C", _DTS_DOWN = "#047857", _DTS_ZERO = "#9CA3AF";

// セル内の数値の縦ぞろえ 2026-08-05w（ユーザー要望）。td を右寄せにするだけでは（↑9.1万）や「警戒」の
// 文字数ぶん数字の右端がずれる。**添え物の枠を固定幅で必ず確保する**＝バッジの無い行にも同じ幅の空枠を
// 置くので、列の中で数値の右端が必ず一致する。exW を省く/0 にすると素の右寄せ（添え物を持たない列）。
// ⚠️exW は列内で最も長い添え物（合計行の「（↑396.7万）」や「保証金不足」）で決める。足りないと押し出される。
function _dtsAlign(main, extra, exW) {
  if (!exW) return main;
  return React.createElement("span", { style: { display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 3 } },
    React.createElement("span", { style: { whiteSpace: "nowrap" } }, main),
    React.createElement("span", { style: { minWidth: exW, textAlign: "left", whiteSpace: "nowrap" } }, extra || ""));
}

// 出ていく額（生活費・積立）は「−◯万」＋緑で揃える。0 は「−0万」だと引かれた感じが出るのでグレーの素の0。
// ⚠️2026-08-05B: 以前は `!(n > 0)` で0も負も一緒くたにグレーの「0万」を出していた＝生活費に −10万 と
//   打つと**表は0万なのに計算は−10万で回る**（残金が10万増える）＝表が計算に嘘をつく状態だった。
//   負は「＋◯万」＝出ていくどころか入ってくる、として赤で出す（符号の向きが逆なので色も逆）。
function _dtsOut(v) {
  var n = +v || 0;
  if (n === 0) return React.createElement("span", { style: { color: _DTS_ZERO } }, _dtsFmtMan(0));
  if (n < 0) return React.createElement("span", { style: { color: _DTS_UP } }, "＋" + _dtsFmtMan(-n));
  return React.createElement("span", { style: { color: _DTS_DOWN } }, "−" + _dtsFmtMan(n));
}

// 残金＝手取り−生活費−積立＝その月に取引資金へ残った額 2026-08-05w。取引資金が増える方向なので赤、
// マイナス（取り崩した月）は出ていく方向なので緑＝生活費・積立と同じ扱いにする。
// sw＝切替で生活口座へ回った額 2026-08-05M。その月は取引資金に1円も残らないので、**行き先を「（生）」で示す**。
// ⚠️色は緑＝取引資金から出ていく向き（生活費・積立と同じ）。赤にすると取引資金が増えたように読める。
function _dtsRest(v, sw) {
  if (sw > 0) return React.createElement("span", { style: { color: _DTS_DOWN, fontWeight: 700 } },
    _dtsFmtMan(sw), React.createElement("span", { style: { fontSize: 9, marginLeft: 1 } }, "（生）"));
  var n = +v || 0;
  var col = (n === 0) ? _DTS_ZERO : (n > 0 ? _DTS_UP : _DTS_DOWN);
  return React.createElement("span", { style: { color: col, fontWeight: 700 } }, (n < 0 ? "−" : "") + _dtsFmtMan(Math.abs(n)));
}

// 添え物の枠幅。余力使用率の「保証金不足」が列内で最長なのでそこに合わせる。
// （かつて「月末取引資金（↑◯万）」用の枠幅も持っていたが、2026-08-05F に（）表記ごと廃止。2026-08-06に記述も整理）
// 2026-08-05I に幅を詰めた（横スクロールを消すため）。⚠️これ以上詰めると「保証金不足」「266.8万」が
// 枠から押し出されて縦ぞろえが壊れる＝列内で最長の添え物・数字が入る幅が下限。
var _DTS_W_TONE = 44, _DTS_W_FLOW = 41;

// 「月初 → 月末」の2値セル。**縦2行**（ユーザー提案 2026-08-05L）。
// 旧は横並び（月初 → 月末）だったが、この形の列が3つになって表の最小幅が915pxまで膨らみ横スクロールが復活した。
// 縦にすると1列あたり約60px縮む。⚠️2行とも**同じ固定幅の箱の中で右寄せ**にする＝矢印を2行目の頭に付けても
//   数字の右端が動かないので、列の縦ぞろえは横並びのときと同じまま保たれる。
function _dtsFlow(a, b) {
  return React.createElement("span", { style: { display: "inline-block", minWidth: _DTS_W_FLOW, textAlign: "right" } },
    React.createElement("div", { style: { color: "#9CA3AF", fontWeight: 700, lineHeight: 1.25 } }, a),
    React.createElement("div", { style: { fontWeight: 800, color: _DTS_INK, lineHeight: 1.25 } },
      React.createElement("span", { style: { color: "#CBD5E1", marginRight: 2 } }, "→"), b));
}

function _dtsTable(res, cfg) {
  // t は文字列でも要素の配列でもよい（2行見出し用）。配列を渡す時は k でキーを明示する。
  // ⚠️見出しは**中身と同じ右寄せ**にする 2026-08-05I。中央寄せだと、表が枠幅いっぱいに広がって列が
  //   中身より太くなったとき、右寄せの数字だけが右へ流れて見出しから離れる＝「右寄せすぎる」の正体。
  var th = function(t, tip, k, al) { return React.createElement("th", { key: k || t, title: tip || "", style: { padding: "4px 6px", fontSize: 9.5, fontWeight: 800, color: "#6B7280", borderBottom: "1px solid " + _DTS_BD, whiteSpace: "nowrap", textAlign: al || "right", lineHeight: 1.3 } }, t); };
  // ⚠️開始時行・合計行も **summary の値**（正規化・クランプ済み）から組む 2026-08-06。
  //   旧は cfg を直読みしていたので、②に −500 と打つと開始時行だけ「−500株」（月次は0株）、
  //   ⑦の保証金率に負を打つと月次は全部「—」なのに開始時行だけ「信用余力 −433万・理論最大株数 −700株」
  //   という、行データと違う式で作られた数字が並んでいた。
  var st = res.summary.start, ef = res.summary.eff;
  var mr0 = ef.marginRate;
  // 開始時の信用余力＝委託保証金 ÷ 保証金率（総枠）。行データと同じ式で出す。
  var pw0 = st.capital / mr0;
  var th0 = ef.marginOk ? Math.floor(pw0 / ef.mainPrice / 100) * 100 : null;
  var shTxt = function(v) { return v == null ? "—" : v.toLocaleString(); };
  var lastRow = res.rows[res.rows.length - 1] || null;
  var td = function(k, ch, ex) { return React.createElement("td", { key: k, style: Object.assign({ padding: "3px 6px", fontSize: 10.5, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", borderTop: "1px solid #F1F5F9" }, ex || {}) }, ch); };
  // 開始時の行。これが無いと1行目の「（↑〇万）」が何からの増減か画面上に起点が無い 2026-08-05。
  var dash = React.createElement("span", { style: { color: "#D1D5DB" } }, "—");
  var openRow = React.createElement("tr", { key: "__open", style: { background: "#F8FAFC" } }, [
    td("ym", React.createElement("span", { style: { fontWeight: 800, color: "#6B7280" } }, "開始時"), { textAlign: "left", borderLeft: "3px solid transparent" }),
    td("sh", React.createElement("span", { style: { fontWeight: 700, color: "#6B7280" } }, st.shares.toLocaleString())),
    td("gr", dash), td("net", dash), td("ex", dash), td("tl", dash),
    td("lv", React.createElement("span", { style: { fontWeight: 700, color: "#6B7280" } }, _dtsFmtMan(st.living))),
    td("rest", dash),
    td("cp", _dtsFlow("—", _dtsFmtMan(st.capital))),
    td("pw", _dtsFlow("—", _dtsFmtMan(pw0))),
    td("th", _dtsFlow("—", shTxt(th0))),
    td("pu", _dtsAlign(dash, null, _DTS_W_TONE))
  ]);
  var rows = res.rows.map(function(r, i) {
    var tone = _dtsUseTone(r.powerUse, r.shortMargin);
    return React.createElement("tr", { key: r.ym, style: { background: tone.bg || (i % 2 ? "#FAFAFA" : "#fff") } }, [
      td("ym", React.createElement("span", { style: { fontWeight: 800, color: _DTS_INK } }, r.lbl), { textAlign: "left", borderLeft: r.stepUp ? "3px solid " + _DTS_SUB : "3px solid transparent" }),
      td("sh", React.createElement("span", { style: { fontWeight: 800, color: r.stepUp ? _DTS_UP : "#374151" } }, r.shares.toLocaleString())),
      td("gr", _dtsFmtMan(r.gross)),
      td("net", _dtsFmtMan(r.net)),
      td("ex", _dtsOut(r.expense)),
      // 切替中は⑤の積立ルールが動いていないので積立欄は「—」＝0円と「そもそも動いていない」を区別する。
      // ⚠️判定は toLivingSwitch>0 ではなく **switched** 2026-08-06。切替中でも赤字月は移動額が0円なので、
      //   前者だとその月だけ「0万」に戻り、切替前の月と区別がつかなくなっていた（ホバー吹き出しも同じ）。
      td("tl", r.switched ? dash : _dtsOut(r.toLiving)),
      td("lv", React.createElement("span", { style: { fontWeight: 700 } }, _dtsFmtMan(r.living))),
      td("rest", _dtsRest(r.toCapital, r.toLivingSwitch)),
      td("cp", _dtsFlow(_dtsFmtMan(r.capitalOpen), _dtsFmtMan(r.capital))),
      td("pw", _dtsFlow(_dtsFmtMan(r.powerOpen), _dtsFmtMan(r.powerEnd))),
      td("th", _dtsFlow(shTxt(r.theoOpen), shTxt(r.theoEnd))),
      td("pu", _dtsAlign(React.createElement("span", { style: { fontWeight: 800, color: tone.ink || "#374151" } }, _dtsFmtPct(r.powerUse)),
        tone.lbl ? React.createElement("span", { style: { fontWeight: 800, color: tone.ink || "#374151" } }, tone.lbl) : null, _DTS_W_TONE))
    ]);
  });
  // 合計行 2026-08-05（ユーザー要望④）。アプリの他の集計表には合計行があるのにここだけ無かった。
  // ⚠️フロー（期間の足し算に意味がある＝税引前/手取り/生活費/積立）とストック（残高＝生活口座/取引資金）が
  //   混在するので、ストック側は合計ではなく**期末の残高**を「期末」と明記して出す。合算すると無意味な数字になる。
  var sm = res.summary;
  var totRow = React.createElement("tr", { key: "__tot", style: { background: _DTS_BG, borderTop: "2px solid " + _DTS_BD } }, [
    td("ym", React.createElement("span", { style: { fontWeight: 800, color: _DTS_INK } }, "合計 " + sm.months + "ヶ月"), { textAlign: "left", borderLeft: "3px solid transparent" }),
    td("sh", dash),
    td("gr", React.createElement("span", { style: { fontWeight: 800 } }, _dtsFmtMan(sm.gross))),
    td("net", React.createElement("span", { style: { fontWeight: 800 } }, _dtsFmtMan(sm.net))),
    td("ex", React.createElement("span", { style: { fontWeight: 800 } }, _dtsOut(sm.expense))),
    td("tl", React.createElement("span", { style: { fontWeight: 800 } }, _dtsOut(sm.toLiving))),
    td("lv", React.createElement("span", { style: { fontWeight: 700, color: "#6B7280" } }, "期末 " + _dtsFmtMan(sm.endLiving))),
    // ⚠️合計の残金は「取引資金へ残った通算」と「切替で生活口座へ回した通算」を**内訳に割って**出す 2026-08-06。
    //   旧は2つを足して赤（＝増える＝取引資金組入）1個で出していたので、列見出しが「残金（取引資金組入）」
    //   である以上、生活口座へ行った分まで取引資金に入ったように読めた。2つの和＝列の縦計、の関係は保つ。
    td("rest", sm.toLivingSwitch > 0
      ? React.createElement("span", null,
          React.createElement("span", { style: { fontWeight: 800 } }, _dtsRest(sm.toCapital, 0)),
          React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: _DTS_DOWN, marginLeft: 3 } }, "＋" + _dtsFmtMan(sm.toLivingSwitch) + "（生）"))
      : React.createElement("span", { style: { fontWeight: 800 } }, _dtsRest(sm.toCapital, 0))),
    // 合計行は「開始時 → 期末」＝月次と同じ読み方（左が前・右が後）で通す。
    td("cp", _dtsFlow(_dtsFmtMan(st.capital), _dtsFmtMan(sm.endCapital))),
    td("pw", _dtsFlow(_dtsFmtMan(pw0), _dtsFmtMan(lastRow ? lastRow.powerEnd : pw0))),
    td("th", _dtsFlow(shTxt(th0), shTxt(lastRow ? lastRow.theoEnd : th0))),
    td("pu", _dtsAlign(dash, null, _DTS_W_TONE))
  ]);
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, background: "#fff", overflowX: "auto", marginBottom: 8 } },
    // ⚠️minWidth は**実測した最小content幅**に合わせる 2026-08-05I。980 は根拠なく置いた値で、
    //   実際の最小は 775 だったため 980 が横スクロールを強制していた（枠が980未満だと必ずはみ出す）。
    React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 700 } },
      React.createElement("thead", null, React.createElement("tr", null, [
        th("年月", "", "ym", "left"), th("株数"), th("税引前", "税引前の月次利益＝(株数÷100)×1日あたり損益×営業日数"), th("手取り", "税引前 − 税（税額は上のサマリーカードに合計で出しています）"),
        th("生活費", "社会保険料を含む"), th("積立", "その月に生活口座へ移した額"), th("生活口座", "生活口座の月末残高"),
        th([React.createElement("div", { key: "a" }, "残金"),
            React.createElement("div", { key: "b", style: { fontSize: 8.5, fontWeight: 700, color: "#9CA3AF" } }, "（取引資金組入）")],
          "手取り − 生活費 − 積立 ＝ その月に取引資金へ組み入れた額。マイナスなら取引資金を取り崩した月。（生）は⑤の切替で生活口座へ回した月", "rest"),
        th("取引資金", "月初の資金 → 月末の資金。外部資金を投入した月は月初にその投入額が入っています"),
        th("信用余力", "月初の余力 → 月末の余力。取引資金 ÷ 委託保証金率＝建てられる総枠（率30%なら資金の3.33倍）"),
        th("理論最大株数", "信用余力 ÷ メイン株価を100株単位で切り捨てた株数＝この資金で建てられる上限。⑥の上限とは別で、資金の天井です"),
        th("余力使用率", "拘束額 ÷（取引資金 ÷ 委託保証金率）")
      ])),
      React.createElement("tbody", null, [openRow].concat(rows)),
      React.createElement("tfoot", null, totRow)));
}

// 前提そのものの警告 2026-08-05B。**入れたのに1円も効いていない入力**を必ず画面に出すための欄。
// 節目(marks)は時系列の出来事なので分けてある。警告が無い時は何も描かない。
function _dtsWarnBox(res) {
  var ws = (res && res.summary && res.summary.warnings) || [];
  if (!ws.length) return null;
  return React.createElement("div", { style: { border: "1px solid #FDE68A", background: "#FFFBEB", borderRadius: 9, padding: "7px 10px", marginBottom: 8 } },
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#B45309", marginBottom: 3 } }, "⚠️ 効いていない前提"),
    ws.map(function(t, i) {
      return React.createElement("div", { key: i, style: { fontSize: 10, fontWeight: 700, color: "#92400E", lineHeight: 1.6 } }, "・" + t);
    }));
}

function _dtsMarks(res) {
  if (!res.marks.length) return null;
  var col = { step: "#1D4ED8", inject: "#7C3AED", goal: "#047857", cost: "#B45309", warn: "#B91C1C", min: "#6B7280" };
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, background: "#fff", padding: "7px 10px", marginBottom: 8 } },
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: _DTS_INK, marginBottom: 4 } }, "🚩 節目"),
    res.marks.map(function(m, i) {
      return React.createElement("div", { key: i, style: { fontSize: 10.5, fontWeight: 700, color: col[m.kind] || "#374151", lineHeight: 1.7 } }, m.text);
    }));
}

// ===== 🔧 調整案（2026-08-06H ユーザー要望「この前提であればここはこうするのが最もいい、という機能」）=====
// やっていることは総当たり。**入力を1つだけ動かして _dtsSimulate を回し直し、期末総資産を比べる**だけ。
// ⚠️相場の予測でも投資助言でもない＝入力した前提の中での算術。③の1日あたりが外れれば結論ごと外れる。
//
// ★安全条件を必ず掛ける（_DTS_SAFE_USE）＝「保証金不足0ヶ月・余力使用率の最大が95%未満」。
//   ⚠️総資産だけで最大を採ると**必ず限界レバレッジに寄る**（実測: 刻み額15万で+89万だが余力108%＝
//   保証金不足5ヶ月＝現実には建てられない）。それは提案ではなく罠なので既定は安全条件つきにし、
//   条件を外した時の最大は「危険を許せば」として別に併記する＝隠さない。
// ★提案は2種類に分ける（混ぜると誤読する）。
//   - struct（構造）: ⑥のラダーと⑧の投入＝**モデルの外に代償が無い**設定。ここは素直に「こうしたほうがいい」。
//   - alloc（配分）: ⑤の積立＝生活口座と取引資金のどちらに置くか。モデルは取引資金に置くほうを**必ず**good と言う。
//     現金の余裕が持つ価値がこのモデルに1円も写っていないからで、最適化ではなく**トレードオフの値段**でしかない。
//     なので合わせ技には入れず「参考」として額だけ出す（＝「積立をやめろ」とは言わない）。
// ★生活費(④)は総当たりの対象にすらしない。減らせば増えるのが自明で情報量がゼロなうえ、
//   生活の設計は「前提」であって最適化する変数ではない（金額の感度は④を直接いじれば表で見られる）。
// ★⑦のメイン株価が未入力だと**安全条件そのものが成立しない**（余力使用率が全月nullで
//   「危険0ヶ月・保証金不足0ヶ月」＝何でも安全に見える）。その状態で最大化すると限界レバレッジを
//   安全だと言って勧めることになるので、提案を出さずに株価の入力を促す。
// ★③の1日あたりも対象にしない。これは**決められる設定ではなく現実についての仮定**なので、
//   最適化ではなく「どれだけ外れたら結論が変わるか」（下の頑健性）で扱う。
var _DTS_SAFE_USE = 95;   // 月次表の「危険」と同じ境界＝画面の色と提案の判断を一致させる

// 1本のシミュ結果を1行のスコアに畳む。⚠️余力使用率は _dtsUseTone と同じ丸め（小数第1位の%）で比べる＝
//   生値で比べると表には「95%」と出ているのに提案側だけ安全扱い、という食い違いが出る。
function _dtsScore(res) {
  if (!res || res.error || !res.summary) return null;
  var maxUse = 0, shortM = 0, dangM = 0, negYm = null, i, r, pu;
  for (i = 0; i < res.rows.length; i++) {
    r = res.rows[i];
    if (r.powerUse != null) {
      pu = Math.round(r.powerUse * 1000) / 10;
      if (pu > maxUse) maxUse = pu;
      if (pu >= _DTS_SAFE_USE) dangM++;
    }
    if (r.shortMargin) shortM++;
    if (negYm == null && r.capital < 0) negYm = r.ym;
  }
  return { total: res.summary.endTotal, capital: res.summary.endCapital, shares: res.summary.endShares,
    maxUse: maxUse, shortMonths: shortM, dangerMonths: dangM, negYm: negYm,
    safe: (shortM === 0 && dangM === 0 && negYm == null) };
}
function _dtsCfgClone(cfg) { return JSON.parse(JSON.stringify(cfg || {})); }
// 提案の適用先。UI の「適用」ボタンもここを通す＝提案の評価と適用で経路が割れない（＝押したら別の結果、を作らない）。
function _dtsSetPath(c, path, v) {
  if (!path) return c;
  if (path.kind === "top") c[path.key] = v;
  else if (path.kind === "inj") { c.injection = Object.assign({}, c.injection || {}); c.injection[path.key] = v; }
  else if (path.kind === "sw") { c.livingSwitch = Object.assign({}, c.livingSwitch || {}); c.livingSwitch[path.key] = v; }
  else if (path.kind === "row") {
    var a = (c[path.arr] || []).slice();
    a[path.i] = Object.assign({}, a[path.i] || {}); a[path.i][path.key] = v; c[path.arr] = a;
  }
  return c;
}
function _dtsRange(from, to, step) { var a = [], v; for (v = from; v <= to; v += step) a.push(v); return a; }

// 総当たりする入力の一覧。⚠️候補に**今の値を必ず混ぜる**＝今の値が刻みから外れていると
//   「今と同じ設定」が候補に無く、差の基準がズレる。
function _dtsLeverDefs(cfg, base) {
  var out = [], eff = base.summary.eff;
  // ⑧は複数行になった 2026-08-06M。総当たりは**1行だけ・年月指定のとき**に限る（複数行あるとどれを動かすか
  //   決められないし、条件つきの行は「年月をずらす」という提案自体が成り立たない）。
  var injs = _dtsNormCfg(cfg).injections;
  var inj = (injs.length === 1 && (injs[0].trig || "ym") === "ym") ? injs[0] : {};
  var hasInj = (+inj.amount || 0) > 0 && !!inj.from;
  var drip = (cfg.drip || []), oneDrip = drip.length === 1;   // 期間別が複数行ある時はどの行を動かすか決められないので触らない
  // ⚠️方式B（余力ベース）では刻み額・増える株数・段の起点を**engineが一切見ない** 2026-08-06J。
  //   総当たりに入れると「動かしても結果が同じ」＝提案は出ないが、無駄に3本×100通り回るだけなので外す。
  // ★目標余力使用率（targetUse）は総当たりに入れない。⑤の積立と同じで**リスクの方針**であって最適化する変数ではない。
  //   安全条件が「95%未満」なので、入れると必ず「94%まで上げろ」と出る＝安全条件を自分で緩める循環した助言になる。
  if (eff.stepMode !== "power") {
    out.push({ id: "stepAmount", kind: "struct", sec: "⑥", label: "刻み額", path: { kind: "top", key: "stepAmount" },
      cur: eff.stepAmount, values: _dtsRange(50000, 500000, 10000),
      fmt: function(v) { return _dtsFmtMan(v) + "円ごと"; } });
    out.push({ id: "stepShares", kind: "struct", sec: "⑥", label: "増えるごとの株数", path: { kind: "top", key: "stepShares" },
      cur: eff.stepShares, values: [100, 200, 300, 400, 500],
      fmt: function(v) { return v.toLocaleString() + "株ずつ"; } });
    out.push({ id: "stepBase", kind: "struct", sec: "⑥", label: "段の起点", path: { kind: "top", key: "stepBase" },
      cur: _dtsNumOrNull(cfg.stepBase), values: [null].concat(_dtsRange(1000000, 5000000, 100000)),
      fmt: function(v) { return v == null ? "②の取引資金から" : _dtsFmtMan(v) + "円になったら"; } });
  }
  // ⑥の上限は**方式に合わせて振る対象を変える** 2026-08-06P。maxMode が "multiple" のとき maxShares を
  //   振っても engine が見ないので、100通り回して必ず「提案なし」になる死んだ総当たりだった。
  if (eff.maxMode === "multiple") {
    out.push({ id: "maxMultiple", kind: "struct", sec: "⑥", label: "上限の倍率", path: { kind: "top", key: "maxMultiple" },
      cur: _dtsNumOrNull(cfg.maxMultiple), values: _dtsRange(10, 40, 1).map(function(v) { return v / 10; }),
      fmt: function(v) { return v == null ? "—" : (Math.round(v * 10) / 10) + "倍まで"; } });
  } else {
    out.push({ id: "maxShares", kind: "struct", sec: "⑥", label: "上限株数", path: { kind: "top", key: "maxShares" },
      cur: _dtsNumOrNull(cfg.maxShares), values: [null].concat(_dtsRange(500, 6000, 500)),
      fmt: function(v) { return v == null ? "上限なし" : v.toLocaleString() + "株"; } });
  }
  // ★⑧の「投入の年月」は総当たりから外した 2026-08-06P（ユーザー指定「投入の年月に関する提案は不要」）。
  //   外部資金をいつ入れられるかは資金繰りの都合で決まるので、シミュが「1ヶ月早めれば＋◯万」と言っても
  //   実行できるとは限らない＝⑤の積立と同じで「決められる設定」ではない。金額・直後の株数だけ残す。
  if (hasInj) {
    out.push({ id: "injShares", kind: "struct", sec: "α", label: "投入直後の株数", path: { kind: "row", arr: "injections", i: 0, key: "sharesAfter" },
      cur: _dtsNumOrNull(inj.sharesAfter) || 0, values: [0].concat(_dtsRange(100, 4000, 100)),
      fmt: function(v) { return v ? v.toLocaleString() + "株" : "指定なし"; } });
  }
  if (oneDrip) {
    out.push({ id: "dripAmt", kind: "alloc", sec: "⑤", label: "積立の額", path: { kind: "row", arr: "drip", i: 0, key: "amount" },
      cur: +drip[0].amount || 0, values: _dtsRange(0, 300000, 10000),
      fmt: function(v) { return _dtsFmtMan(v) + "円/月"; } });
    out.push({ id: "dripTgt", kind: "alloc", sec: "⑤", label: "積立の目標残高", path: { kind: "row", arr: "drip", i: 0, key: "target" },
      cur: _dtsNumOrNull(drip[0].target), values: [null].concat(_dtsRange(100000, 3000000, 100000)),
      fmt: function(v) { return v == null ? "無制限" : _dtsFmtMan(v) + "円"; } });
  }
  for (var i = 0; i < out.length; i++) {
    var L = out[i], has = false;
    for (var j = 0; j < L.values.length; j++) if (L.values[j] === L.cur) { has = true; break; }
    if (!has) L.values = [L.cur].concat(L.values);
  }
  return out;
}

// 1本ぶんの総当たり。安全条件を満たす中の最大(best)と、条件を無視した最大(bestAny)を両方返す。
function _dtsSweep(cfg, lever) {
  var best = null, bestAny = null, i, c, sc, v;
  for (i = 0; i < lever.values.length; i++) {
    v = lever.values[i];
    c = _dtsSetPath(_dtsCfgClone(cfg), lever.path, v);
    sc = _dtsScore(_dtsSimulate(c));
    if (!sc) continue;
    if (!bestAny || sc.total > bestAny.sc.total) bestAny = { v: v, sc: sc };
    // 同額なら余力使用率が低いほうを採る＝同じ結果なら安全な設定を勧める
    if (sc.safe && (!best || sc.total > best.sc.total || (sc.total === best.sc.total && sc.maxUse < best.sc.maxUse))) best = { v: v, sc: sc };
  }
  return { best: best, bestAny: bestAny };
}

var _DTS_ADV_MIN = 10000;   // 1万円未満の差は提案しない（丸め誤差同然の差を「改善」と言わない）
function _dtsAdvice(cfg) {
  var base0 = _dtsSimulate(cfg);
  var base = _dtsScore(base0);
  if (!base) return null;
  // ⑦の株価が無いと安全条件が成立しない＝何を勧めても「安全」と表示されてしまうので、提案そのものを出さない。
  if (!base0.summary.eff.marginOk) {
    return { base: base, noMargin: true, props: [], tradeoffs: [], chosen: [], combo: base, breakEven: null, inert: [] };
  }
  var levers = _dtsLeverDefs(cfg, base0), props = [], tradeoffs = [], i;
  for (i = 0; i < levers.length; i++) {
    var L = levers[i], sw = _dtsSweep(cfg, L);
    if (!sw.best) continue;
    if (sw.best.v === L.cur) continue;
    if (sw.best.sc.total <= base.total + _DTS_ADV_MIN) continue;
    (L.kind === "alloc" ? tradeoffs : props).push({ id: L.id, kind: L.kind, sec: L.sec, label: L.label, path: L.path,
      curText: L.fmt(L.cur), newText: L.fmt(sw.best.v), value: sw.best.v,
      gain: sw.best.sc.total - base.total, sc: sw.best.sc,
      // 危険を許せばもっと伸びる場合だけ添える（隠さないが、勧めはしない）
      risky: (sw.bestAny && sw.bestAny.sc.total > sw.best.sc.total + _DTS_ADV_MIN)
        ? { text: L.fmt(sw.bestAny.v), gain: sw.bestAny.sc.total - base.total, sc: sw.bestAny.sc } : null });
  }
  props.sort(function(a, b) { return b.gain - a.gain; });
  tradeoffs.sort(function(a, b) { return b.gain - a.gain; });

  // ★合わせ技は「個別の差を足す」のではなく**入れるたびに回し直す**（相互作用があるので足し算は成り立たない）。
  //   実測: 上限株数を単体で足すと余力95.1%＝危険1ヶ月に振れ、次の積立の提案を足すと94.9%へ戻る。
  //   安全条件を保ったまま総資産が増える提案だけを、効く順に貪欲に採る＝結果は必ず安全側に閉じる。
  var acc = _dtsCfgClone(cfg), accSc = base, chosen = [];
  for (i = 0; i < props.length; i++) {
    var c2 = _dtsSetPath(_dtsCfgClone(acc), props[i].path, props[i].value);
    var s2 = _dtsScore(_dtsSimulate(c2));
    if (s2 && s2.safe && s2.total > accSc.total + _DTS_ADV_MIN) { acc = c2; accSc = s2; chosen.push(props[i]); }
  }

  // 頑健性＝この調整で得た幅は、③の1日あたりが何%下振れすると消えるか。
  // ⚠️「+127万も増える」だけを見せると、前提そのものが外れる可能性が視界から消える。同じ画面に必ず出す。
  var breakEven = null;
  if (chosen.length && accSc.total > base.total) {
    // ⚠️期間別テーブルなので全行に倍率を掛ける 2026-08-06M（dailyPer100 への代入だけでは効かない）。
    var at = function(rt) { var s3 = _dtsScore(_dtsSimulate(_dtsScalePerDay(acc, rt))); return s3 ? s3.total : -Infinity; };
    if (at(0.3) > base.total) breakEven = { ratio: 0.3, beyond: true };   // −70%でもまだ上回る＝下限まで探索しても交点なし
    else {
      var lo = 0.3, hi = 1.0, mid, k;
      for (k = 0; k < 40; k++) { mid = (lo + hi) / 2; if (at(mid) > base.total) hi = mid; else lo = mid; }
      breakEven = { ratio: hi, beyond: false };
    }
  }

  // 「外しても結果が1円も変わらない設定」＝入れた意味が無い設定を名指しする。
  // ⚠️総資産だけでなく**期末取引資金と期末株数まで**一致した時だけ言う。総資産だけで判定すると、
  //   ⑤の切替のように「総額は同じで取引資金と生活口座の内訳だけ変わる」設定を「効いていない」と誤って断言する。
  var inert = [];
  var same = function(mod, txt) {
    var c4 = _dtsCfgClone(cfg); mod(c4);
    var s4 = _dtsScore(_dtsSimulate(c4));
    if (s4 && s4.total === base.total && s4.capital === base.capital && s4.shares === base.shares) inert.push(txt);
  };
  if ((cfg.livingSwitch || {}).mode && cfg.livingSwitch.mode !== "off") {
    same(function(c) { c.livingSwitch = { mode: "off" }; }, "⑤の切替（残金を全額 生活口座へ）は、外しても期末が1円も変わりません。");
  }
  // ⚠️上限の方式が「取引資金の◯倍まで」の時に maxShares を外す検査をしてはいけない 2026-08-06P。
  //   engine が maxShares を見ないので必ず「変わらない」＝**使っていない設定を「効いていない」と誤って断言する**。
  //   方式ごとに、実際に使われているほうだけを検査する。
  if (base0.summary.eff.maxMode === "multiple") {
    if (_dtsNumOrNull(cfg.maxMultiple) != null) {
      same(function(c) { c.maxMode = "shares"; c.maxShares = null; }, "⑥の上限（取引資金の◯倍まで）は、外しても期末が1円も変わりません（期間内に上限へ届いていません）。");
    }
  } else if (_dtsNumOrNull(cfg.maxShares) != null) {
    same(function(c) { c.maxShares = null; }, "⑥の上限株数は、外しても期末が1円も変わりません（期間内に上限へ届いていません）。");
  }
  // ⚠️配列側(injections)を触ること 2026-08-06M。cfg.injection を空にしても _dtsNormCfg が injections を
  //   優先するので、判定が常に「変わらない」になって誤った断言をする。
  var _injs = _dtsNormCfg(cfg).injections;
  if (_injs.length === 1 && _dtsNumOrNull(_injs[0].sharesAfter)) {
    same(function(c) { c.injections = [Object.assign({}, _injs[0], { sharesAfter: null })]; },
      "αの「投入直後の株数」は、空にしても期末が1円も変わりません（⑥の段だけで同じ株数に届いています）。");
  }
  return { base: base, props: props, tradeoffs: tradeoffs, chosen: chosen, combo: accSc, breakEven: breakEven, inert: inert };
}

// 🔧 調整案のパネル。提案ごとに「適用」・まとめて適用のボタンを出す（押すと入力欄がその値に置き換わる）。
// ⚠️adv は**閉じている間 null**（計算を省いているため）。null で早期returnすると見出しごと消えて二度と開けない。
//   見出しは adv に依存しないので必ず先に組み、中身だけを adv の有無で出し分けること。
function _dtsAdviceBox(adv, onApply, onApplyAll, open, setOpen) {
  var head = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: open ? 6 : 0 } },
    React.createElement("button", {
      onClick: function() { setOpen(!open); },
      style: { fontSize: 10.5, fontWeight: 800, color: _DTS_INK, background: "transparent", border: "none", padding: 0, cursor: "pointer" }
    }, (open ? "▼" : "▶") + " 🔧 調整案"),
    React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280" } },
      "入力を1つずつ動かして回し直した総当たり。相場の予測ではなく、入れた前提の中での算術です"),
    React.createElement("span", { style: { fontSize: 9, fontWeight: 800, color: "#047857", background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 4, padding: "1px 6px" } },
      "安全条件つき｜保証金不足0ヶ月・余力使用率" + _DTS_SAFE_USE + "%未満"));
  var shell = function(ch, bd, bg) {
    return React.createElement("div", { style: { border: "1px solid " + (bd || _DTS_BD), borderRadius: 9, background: bg || "#fff", padding: "7px 10px", marginBottom: 8 } }, head, ch);
  };
  if (!open) return shell(null);
  if (!adv) return shell(React.createElement("div", { style: { fontSize: 10.5, fontWeight: 700, color: "#6B7280" } }, "前提を計算できないので調整案は出せません。"));

  var money = function(v) { return React.createElement("span", { style: { fontWeight: 800, color: v > 0 ? _DTS_UP : (v < 0 ? _DTS_DOWN : _DTS_ZERO) } }, (v >= 0 ? "＋" : "−") + _dtsFmtMan(Math.abs(v))); };
  var body = [];

  // 株価が無いと余力使用率が全月「—」＝安全条件が判定できない。何を出しても「安全」に見えるので提案を出さない。
  if (adv.noMargin) {
    return shell(React.createElement("div", { style: { fontSize: 10.5, fontWeight: 700, color: "#92400E", lineHeight: 1.7 } },
      "⑦のメイン株価が入っていないので、調整案は出せません。余力使用率が全月「—」になり、"
      + "どんな株数でも「保証金不足0ヶ月・危険0ヶ月」＝安全だと判定されてしまうためです（実際には建てられない株数を勧めることになります）。"),
      "#FDE68A", "#FFFBEB");
  }

  // 提案1行。showChosen=false（参考枠）では「合わせ技には未採用」を出さない＝そもそも採用対象ではないため。
  var rowOf = function(p, showChosen) {
    var chosen = false;
    for (var q = 0; q < adv.chosen.length; q++) if (adv.chosen[q].id === p.id) { chosen = true; break; }
    return React.createElement("div", { key: p.id, style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "4px 0", borderTop: "1px solid #F1F5F9" } },
      React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: _DTS_SUB, minWidth: 16 } }, p.sec),
      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, color: "#374151" } }, p.label),
      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", fontVariantNumeric: "tabular-nums" } }, p.curText),
      React.createElement("span", { style: { fontSize: 10, color: "#9CA3AF" } }, "→"),
      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, color: _DTS_INK, fontVariantNumeric: "tabular-nums" } }, p.newText),
      money(p.gain),
      React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280" } }, "余力最大 " + p.sc.maxUse + "%"),
      (showChosen && !chosen) ? React.createElement("span", { title: "単体では効きますが、上の合わせ技に足すと総資産が増えないか、安全条件を割るので外しています", style: { fontSize: 9, fontWeight: 700, color: "#B45309" } }, "※合わせ技には未採用") : null,
      p.risky ? React.createElement("span", { title: "保証金不足や余力95%以上を許した場合の最大です。実際にはその株数を建てられない月が出るので勧めません", style: { fontSize: 9, fontWeight: 700, color: "#B91C1C" } },
        "危険を許せば " + p.risky.text + " で＋" + _dtsFmtMan(p.risky.gain) + "（余力" + p.risky.sc.maxUse + "%"
        + (p.risky.sc.shortMonths ? "・保証金不足" + p.risky.sc.shortMonths + "ヶ月" : "") + "）") : null,
      React.createElement("button", {
        onClick: function() { onApply(p); },
        style: { marginLeft: "auto", fontSize: 10, fontWeight: 800, color: _DTS_INK, background: _DTS_BG, border: "1px solid " + _DTS_BD, borderRadius: 6, padding: "2px 9px", cursor: "pointer" }
      }, "適用"));
  };

  if (!adv.props.length) {
    body.push(React.createElement("div", { key: "none", style: { fontSize: 10.5, fontWeight: 700, color: "#047857", lineHeight: 1.7 } },
      "この安全条件のもとでは、⑥⑧のどれを1つ動かしても期末総資産は今より増えませんでした。今の前提がこの条件での上限に近い、ということです。"));
  } else {
    if (adv.chosen.length) {
      var g = adv.combo.total - adv.base.total;
      body.push(React.createElement("div", { key: "combo", style: { border: "1px solid #A7F3D0", background: "#F0FDF4", borderRadius: 8, padding: "6px 9px", marginBottom: 6 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
          React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, color: "#065F46" } }, "合わせ技（下の" + adv.chosen.length + "件をまとめて）"),
          React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#065F46", fontVariantNumeric: "tabular-nums" } },
            _dtsFmtMan(adv.base.total) + "円 → " + _dtsFmtMan(adv.combo.total) + "円"),
          money(g),
          React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, color: "#047857" } },
            "株数 " + adv.combo.shares.toLocaleString() + "株・余力最大 " + adv.combo.maxUse + "%"),
          React.createElement("button", {
            onClick: function() { onApplyAll(adv.chosen); },
            style: { marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "#fff", background: "#047857", border: "none", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }
          }, "まとめて適用")),
        // ⚠️「増える」だけを見せない＝前提が外れる幅を必ず同じ枠に出す。
        adv.breakEven ? React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#92400E", marginTop: 4, lineHeight: 1.6 } },
          adv.breakEven.beyond
            ? "※ ③の1日あたりが7割まで下振れしても、この調整をしたほうが今の前提より上でした。"
            : ("※ ただし ③の1日あたりが " + Math.round((1 - adv.breakEven.ratio) * 100) + "% 下振れすると、この＋"
               + _dtsFmtMan(g) + "円 は消えて今の前提と同じ水準に戻ります（＝構造をいじって得られる幅より、③が当たるかどうかのほうが大きい）。")) : null));
    }
    body.push(React.createElement("div", { key: "list" }, adv.props.map(function(p) { return rowOf(p, true); })));
  }
  // ⑤の積立は「最適化」ではなく**トレードオフの値段**なので、合わせ技から外して別枠に置く。
  // ここを提案に混ぜると、モデルに写っていない「現金の余裕の価値」を0と見なして「積立をやめろ」と言うことになる。
  if (adv.tradeoffs && adv.tradeoffs.length) {
    body.push(React.createElement("div", { key: "trade", style: { marginTop: 7, paddingTop: 5, borderTop: "1px solid " + _DTS_BD } },
      React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#B45309", marginBottom: 1 } }, "参考｜取っておく現金の値段（提案ではありません）"),
      React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#92400E", lineHeight: 1.6, marginBottom: 2 } },
        "⑤の積立を減らすほど期末は増えます。ただしこのシミュには「生活口座に現金がある安心」の価値が1円も入っていないので、"
        + "常に「減らしたほうがいい」としか出ません。合わせ技には入れず、削った場合にいくら変わるかだけ出します。"),
      adv.tradeoffs.map(function(p) { return rowOf(p, false); })));
  }
  if (adv.inert.length) {
    body.push(React.createElement("div", { key: "inert", style: { marginTop: 6, paddingTop: 5, borderTop: "1px solid #F1F5F9" } },
      React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#6B7280", marginBottom: 2 } }, "入れても結果が変わっていない設定"),
      adv.inert.map(function(t, i) {
        return React.createElement("div", { key: i, style: { fontSize: 10, fontWeight: 700, color: "#6B7280", lineHeight: 1.6 } }, "・" + t);
      })));
  }
  return shell(React.createElement("div", null, body));
}
