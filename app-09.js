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
  cfg = cfg || {};
  var sIdx = _dtsYmToIdx(cfg.startYm), eIdx = _dtsYmToIdx(cfg.endYm);
  if (sIdx == null) return { error: "開始年月が未入力です", rows: [], summary: null, marks: [] };
  if (eIdx == null) return { error: "終了年月が未入力です", rows: [], summary: null, marks: [] };
  if (eIdx < sIdx) return { error: "終了年月は開始年月以降にしてください", rows: [], summary: null, marks: [] };
  var n = eIdx - sIdx + 1;
  if (n > 120) return { error: "期間が長すぎます（上限120ヶ月＝10年）", rows: [], summary: null, marks: [] };

  var days      = Math.max(1, Math.round(+cfg.businessDays || 20));
  // 税率は 0〜90% にクランプ 2026-08-05F。クランプが無いと 200% で手取りがマイナスになり、
  // 「利益を出すほど資金が減る」という意味不明な推移が黙って出ていた（落ちはしないので気づけない）。
  var taxRate   = (cfg.taxRate == null || cfg.taxRate === "") ? 0.20315 : +cfg.taxRate;
  if (!isFinite(taxRate)) taxRate = 0.20315;
  var taxRaw    = taxRate;
  if (taxRate < 0) taxRate = 0;
  if (taxRate > 0.9) taxRate = 0.9;
  var perDay    = +cfg.dailyPer100 || 0;
  var stepBase  = _dtsNumOrNull(cfg.stepBase);           // null＝②の取引資金（＝開始時）から数える
  var stepAmt   = Math.max(1, +cfg.stepAmount || 250000);
  var stepSh    = Math.max(1, +cfg.stepShares || 100);
  var maxSh     = _dtsNumOrNull(cfg.maxShares);          // null＝上限なし
  var mainPrice = +cfg.mainPrice || 0;
  var marginRt  = +cfg.marginRate || 0.30;

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
  // いま実際に使われている起点 2026-08-05z。⑧の投入で張り替わった後の値は「その月までシミュを回さないと
  // 出せない」＝入力欄側で再計算すると本体とズレるので、**張り替えた本人がここで記録して summary で返す**。
  // fromInjection=true なら「⑥の入力ではなく⑧の投入直後の資金・株数が起点」という意味。
  var origin = { ym: cfg.startYm, capital: base, shares: baseShares, fromInjection: false };
  var injFloor = null;   // ⑧が「投入直後の株数」を明示した時の下限（ラチェットで効く）2026-08-05A

  var inj    = (cfg.injection && cfg.injection.ym) ? cfg.injection : null;
  var injIdx = inj ? _dtsYmToIdx(inj.ym) : null;
  var injTotal = 0;

  // 前提そのものの警告 2026-08-05B。**入れたのに効かない入力**を黙って捨てないための受け皿。
  // 節目(marks)は「何月に何が起きたか」の時系列なので、時点を持たない設定の警告はここに分ける。
  var warns = [];
  if (taxRaw !== taxRate) {
    warns.push("③の税率 " + (Math.round(taxRaw * 1000) / 10) + "% は範囲外なので " + (Math.round(taxRate * 1000) / 10) + "% として計算しています（0〜90%）。");
  }
  // ④⑤の期間別テーブルの検算 2026-08-05D。_dtsPickByYm は「from が当月以前で最も新しい行」を採るので、
  // ⚠️期間より後ろの行は一度も選ばれない／同じ from が2行あると後ろが必ず負ける（`fi > bestIdx` の厳密比較）。
  //   どちらも黙って消えるので、入れたのに効かない行として名指しする。
  var _chkRows = function(arr, lbl) {
    var seen = {}, i, r, fi;
    for (i = 0; i < (arr || []).length; i++) {
      r = arr[i]; if (!r || !r.from) continue;
      fi = _dtsYmToIdx(r.from);
      if (fi == null) continue;
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

  // 「0を入れたのに既定値で計算される」＝`+cfg.X || 既定` のイディオムの副作用。入力欄の表示と計算が食い違う
  // ので黙って通さない（0で割れないため既定に戻す挙動自体は維持する）2026-08-05D。
  if (cfg.stepAmount != null && cfg.stepAmount !== "" && +cfg.stepAmount === 0) {
    warns.push("⑥の刻み額が 0円 です。0円では段を数えられないので " + _dtsFmtYen(stepAmt) + "円 として計算しています。");
  }
  if (cfg.marginRate != null && cfg.marginRate !== "" && +cfg.marginRate === 0) {
    warns.push("⑦の委託保証金率が 0% です。0%では余力を計算できないので " + Math.round(marginRt * 100) + "% として計算しています。");
  }
  // 上限株数が今の株数より小さいと、ラチェット（下げない）が勝って上限が一度も効かない。
  if (maxSh != null && maxSh > 0 && maxSh < shares) {
    warns.push("⑥の上限 " + maxSh.toLocaleString() + "株 は②の基礎取引株数 " + shares.toLocaleString()
      + "株 より小さいので効いていません（「資金が減っても下げない」が優先で、株を減らしはしません）。");
  }

  if (inj && (injIdx == null || injIdx < sIdx || injIdx > eIdx)) {
    warns.push("⑧の投入年月「" + (_dtsYmLbl(inj.ym) || inj.ym) + "」が期間の外なので、投入は一切反映されていません。"
      + "①の期間（" + _dtsYmLbl(cfg.startYm) + "〜" + _dtsYmLbl(cfg.endYm) + "）の中に入れてください。");
  }

  var rows = [], prevShares = shares;

  for (var k = 0; k < n; k++) {
    var ym = _dtsIdxToYm(sIdx + k);
    var prevClose = capital;   // 先月末の取引資金＝「先月比」の起点。①の投入で capital が動く前に取っておく 2026-08-05
    var capOpen = capital;   // 月初の取引資金＝バッファ・余力使用率の判定に使う（当月の利益は含めない）
    var injected = 0, stepUp = false;

    // ① 外部資金の投入（該当月のみ）。この月は株数ルールをスキップし、指定株数へジャンプする。
    if (injIdx != null && injIdx === sIdx + k) {
      injected = +inj.amount || 0;
      capital += injected;
      injTotal += injected;
      var sa = _dtsNumOrNull(inj.sharesAfter);
      // ⚠️2026-08-05B: ここは以前 shares = sa の**素の代入**だった＝指定株数が今より少ないと投入月だけ
      //   株数が落ち、翌月には②のラチェットで跳ね上がる（実測: 1,500→700→1,700）。⑥の「資金が減っても
      //   下げない」に真っ向から反するうえ、1ヶ月だけ凹むシナリオは誰も意図しない。ラチェットを掛ける。
      //   下回って無効化された時は黙って捨てず warns で知らせる（入れたのに効かない入力を作らない）。
      if (sa != null && sa > 0) {
        if (sa < prevShares) {
          warns.push("⑧の「投入直後の株数」" + sa.toLocaleString() + "株 は、その時点の " + prevShares.toLocaleString()
            + "株 より少ないので効いていません（⑥の「資金が減っても下げない」が優先）。減らす想定なら②の基礎取引株数を見直してください。");
        } else {
          shares = sa; injFloor = { ym: ym, shares: sa };
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
      // ⚠️⑧の「投入直後の株数」は baseShares に焼かない＝焼くと「すでに稼いだ段」と二重計上になる
      //   （例: 起点210万・300万で1,000株の時に投入して1,200株指定 → 8段ぶんが上乗せされ2,000株に飛ぶ）。
      //   代わりに②のラチェット shares = max(want, prevShares) が下限として受け止める。
      if (stepBase == null) { base = capital; baseShares = shares; origin = { ym: ym, capital: base, shares: baseShares, fromInjection: true }; }
      capOpen = capital;
    } else {
      // ② 株数の決定。判定に使う capital は**前月末の値**（当月の利益は含めない）。
      //    floor の累積判定なので端数は自動的に次段へ繰り越される（別処理は不要）。
      var steps = Math.floor(Math.max(0, capital - base) / stepAmt);
      var want = baseShares + steps * stepSh;
      if (maxSh != null && maxSh > 0) want = Math.min(want, maxSh);
      shares = Math.max(want, prevShares);   // ラチェット＝資金が減っても株数は下げない
    }
    stepUp = (shares > prevShares);

    // ③ 損益（税引前 → 税 → 手取り）
    var gross = (shares / 100) * perDay * days;
    var tax   = gross * taxRate;
    var net   = gross - tax;

    // ④ 支出。社会保険料は「生活費の期間別の行」に含める規約（別枠を持たない）。
    var lcRow   = _dtsPickByYm(cfg.livingCost, ym);
    var expense = lcRow ? (+lcRow.amount || 0) : 0;
    var surplus = net - expense;

    // ⑤ 生活口座への積立。mode="fill"＝目標まで余剰全額 / "drip"＝定額。どちらも目標残高で頭打ち。
    var drRow = _dtsPickByYm(cfg.drip, ym);
    var toLiving = 0, tgt = null;
    if (drRow) {
      tgt = _dtsNumOrNull(drRow.target);                                  // null＝無制限
      var room = (tgt == null) ? Infinity : Math.max(0, tgt - living);
      var lim  = (drRow.mode === "fill") ? Infinity : (+drRow.amount || 0);
      toLiving = Math.min(surplus, lim, room);
      if (!(toLiving > 0)) toLiving = 0;                                  // 赤字月は積み立てない（0でクリップ）
    }

    // ⑥ 確定
    var livOpen = living;
    living  += toLiving;
    capital += surplus - toLiving;

    // ---- 派生指標 ----
    var tied     = shares * mainPrice;                 // 拘束額
    var needMgn  = tied * marginRt;                    // 必要保証金
    var buffer   = capOpen - needMgn;                  // マイナス＝その株数は資金的に建てられない
    var powerUse = (capOpen > 0 && marginRt > 0) ? tied / (capOpen / marginRt) : null;   // 余力使用率
    var runway   = expense > 0 ? living / expense : null;                                 // 生活口座で何ヶ月持つか
    // 損益分岐（円/日/100株）＝その月の生活費を出すのに必要な1日あたり成績。グレードと直接見比べられる。
    var bePerDay = (shares > 0 && days > 0 && taxRate < 1)
      ? expense / (1 - taxRate) / days / (shares / 100) : null;

    rows.push({
      ym: ym, lbl: _dtsYmLbl(ym),
      shares: shares, stepUp: stepUp,
      gross: gross, tax: tax, net: net,
      expense: expense, surplus: surplus,
      // 残額＝手取り − 生活費 − 積立 ＝ その月に取引資金へ残った額（月末取引資金の増加分そのもの）。
      // 表で 手取り→生活費→積立→生活口座 と来て月末取引資金が急に伸びる理由が見えないので列に出す 2026-08-05。
      toCapital: surplus - toLiving,
      toLiving: toLiving, livingOpen: livOpen, living: living,
      capitalOpen: capOpen, capital: capital,
      // 信用余力＝委託保証金 ÷ 委託保証金率 − 建玉金額 2026-08-05F。月初と月末で資金が違うので両方持つ
      //（建玉 tied はその月の株数で固定なので、月内で動くのは資金の分だけ）。
      powerOpen: (marginRt > 0) ? (capOpen / marginRt - shares * mainPrice) : null,
      powerEnd:  (marginRt > 0) ? (capital / marginRt - shares * mainPrice) : null,
      // 先月末からの増減。投入月だけ toCapital（＝手取り−生活費−積立）と食い違う＝差が投入額そのもの。
      capitalDelta: capital - prevClose,
      total: capital + living,
      ownBase: capital + living - injTotal,            // 自己資金ベース＝総資産−外部資金の累計
      injected: injected, livingTarget: tgt,
      tied: tied, needMargin: needMgn, buffer: buffer,
      powerUse: powerUse, runway: runway, bePerDay: bePerDay,
      shortMargin: buffer < 0
    });
    prevShares = shares;
  }

  // ---- 年間（期間）集計 ----
  var sum = {
    months: n, startYm: cfg.startYm, endYm: cfg.endYm,
    gross: 0, tax: 0, net: 0, expense: 0, toLiving: 0, toCapital: 0, injection: injTotal
  };
  for (var i = 0; i < rows.length; i++) {
    sum.gross     += rows[i].gross;
    sum.tax       += rows[i].tax;
    sum.net       += rows[i].net;
    sum.expense   += rows[i].expense;
    sum.toLiving  += rows[i].toLiving;
    sum.toCapital += rows[i].toCapital;   // 残金の通算＝手取り−生活費−積立。投入額は含まない（＝自力で積んだ分）2026-08-05w
  }
  // 「目標まで全額」＋目標残高が空欄＝**上限なしで余剰を全部この口座へ**＝取引資金が一切増えず株数も伸びない。
  // 画面の placeholder が「無制限」なので害が無さそうに見えるが、fillと組むと事実上の資金凍結になる 2026-08-05B。
  // （実測: 資金300万のまま6ヶ月・生活口座だけ55万→228万）。定額(drip)なら額で頭打ちなので対象外。
  for (var w = 0; w < (cfg.drip || []).length; w++) {
    var dw = cfg.drip[w];
    if (dw && dw.mode === "fill" && _dtsNumOrNull(dw.target) == null) {
      warns.push("⑤の" + (_dtsYmLbl(dw.from) || "") + "からの積立が「目標まで全額」なのに目標残高が空欄です。"
        + "余剰が全額そのまま生活口座へ行くので、取引資金が増えず株数も伸びません。目標残高を入れてください。");
    }
  }

  var last = rows[rows.length - 1] || null;
  sum.endCapital = last ? last.capital : (+cfg.initialCapital || 0);
  sum.endLiving  = last ? last.living  : (+cfg.initialLiving  || 0);
  sum.endTotal   = sum.endCapital + sum.endLiving;
  sum.endOwnBase = sum.endTotal - injTotal;
  sum.endShares  = last ? last.shares : (+cfg.initialShares || 0);
  sum.stepOrigin = origin;   // 段の起点（起点が空欄なら⑧で張り替わった後の実効値）2026-08-05z
  sum.injFloor   = injFloor;  // ⑧が指定した「投入直後の株数」＝ラチェットの下限 2026-08-05A
  sum.warnings   = warns;     // 前提そのものの警告（入れたのに効かない入力）2026-08-05B
  sum.capitalGain = sum.endCapital - (+cfg.initialCapital || 0);
  // 1日あたり成績のグレード（app-05.js）。前提値がどの帯かを画面に出すため。
  sum.grade = (typeof _profitGradeFromPnl === "function")
    ? _profitGradeFromPnl(Math.round(perDay), 1) : null;

  // ---- 節目の抽出 ----
  var marks = [], seenTargetHit = false, worst = null;
  for (var j = 0; j < rows.length; j++) {
    var r = rows[j];
    if (r.injected) marks.push({ ym: r.ym, kind: "inject", text: _dtsYmLbl(r.ym) + "  外部資金 " + Math.round(r.injected).toLocaleString() + "円を投入 → " + r.shares + "株" });
    if (r.stepUp && !r.injected) marks.push({ ym: r.ym, kind: "step", text: _dtsYmLbl(r.ym) + "  株数 " + (j > 0 ? rows[j - 1].shares : r.shares) + " → " + r.shares + "株" });
    if (j === 0 || r.expense !== rows[j - 1].expense) {
      if (j > 0) marks.push({ ym: r.ym, kind: "cost", text: _dtsYmLbl(r.ym) + "  生活費 " + Math.round(rows[j - 1].expense).toLocaleString() + " → " + Math.round(r.expense).toLocaleString() + "円" });
    }
    if (!seenTargetHit && r.livingTarget != null && r.living >= r.livingTarget) {
      seenTargetHit = true;
      marks.push({ ym: r.ym, kind: "goal", text: _dtsYmLbl(r.ym) + "  生活口座が目標 " + Math.round(r.livingTarget).toLocaleString() + "円に到達 → 以降は全額が取引資金へ" });
    }
    if (!worst || r.buffer < worst.buffer) worst = r;
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
  if (worst) marks.push({ ym: worst.ym, kind: "min", text: _dtsYmLbl(worst.ym) + "  バッファ最小 " + Math.round(worst.buffer).toLocaleString() + "円（" + worst.shares + "株）" });
  marks.sort(function(a, b) { return _dtsYmToIdx(a.ym) - _dtsYmToIdx(b.ym); });

  return { error: null, rows: rows, summary: sum, marks: marks };
}

// グレード感度＝1日あたり成績だけを差し替えて同じ前提を回し直す。
// 「今のまま続けたら」と「1つ上のグレードに乗ったら」の差を金額で見せるための比較表用。
var _DTS_SENS = [
  { key: "C", perDay: 500,  lbl: "C  500円/日" },
  { key: "B", perDay: 1500, lbl: "B  1,500円/日" },
  { key: "A", perDay: 2250, lbl: "A  2,250円/日" },
  { key: "S", perDay: 3000, lbl: "S  3,000円/日" }
];
function _dtsSensitivity(cfg) {
  var out = [], i;
  var mine = _dtsSimulate(cfg);
  // ⚠️ここは cfg.dailyPer100＝**③に入っている前提値**であって実績ではない 2026-08-05B。
  //   保守的に実績より低く置くのが普通（例: 実績2,731に対して前提2,000）なので、
  //   「実績 2,000円/日」と出すと事実と違う数字を実績として提示することになる。
  if (!mine.error) out.push({ key: "now", lbl: "今の前提 " + Math.round(+cfg.dailyPer100 || 0).toLocaleString() + "円/日", perDay: +cfg.dailyPer100 || 0, self: true, res: mine });
  for (i = 0; i < _DTS_SENS.length; i++) {
    var s = _DTS_SENS[i];
    var c2 = {}; for (var k in cfg) { if (Object.prototype.hasOwnProperty.call(cfg, k)) c2[k] = cfg[k]; }
    c2.dailyPer100 = s.perDay;
    var r = _dtsSimulate(c2);
    if (!r.error) out.push({ key: s.key, lbl: s.lbl, perDay: s.perDay, self: false, res: r });
  }
  // 目標株数に届く月を各本で拾う。比較表の1列に使う。
  var tgt = _dtsReachTarget(cfg);
  for (i = 0; i < out.length; i++) {
    var rs = out[i].res.rows, hit = null;
    for (var j = 0; j < rs.length; j++) { if (rs[j].shares >= tgt) { hit = rs[j].ym; break; } }
    out[i].reachYm = hit; out[i].reachTarget = tgt;
  }
  return out;
}

// 「◯◯株に届く月」の目標株数。既定1,000株だが、基礎取引株数がすでに1,000以上だと
// 全部の本が初月到達になって列が死ぬので、その時は次の500株刻みを目標にする 2026-08-05b。
function _dtsReachTarget(cfg) {
  var s0 = +cfg.initialShares || 0;
  if (s0 < 1000) return 1000;
  return Math.ceil((s0 + 1) / 500) * 500;
}

// ---- 表示ヘルパー --------------------------------------------------------
// 表示は万円・小数第1位まで（依頼メモ§7）。内部計算は円のまま丸めない。
var _DTS_INK = "#1E3A8A", _DTS_SUB = "#3B82F6", _DTS_BG = "#EFF6FF", _DTS_BD = "#BFDBFE";
function _dtsFmtYen(v) { if (v == null || !isFinite(v)) return "—"; return Math.round(v).toLocaleString(); }
// マイナスは全角「−」で出す 2026-08-05B。_dtsOut/_dtsRest が全角の「−◯万」を出すので、素の負値だけ
// 半角ハイフンの「-100万」になって同じ表の中で符号の見た目が2種類あった。
function _dtsFmtMan(v) {
  if (v == null || !isFinite(v)) return "—";
  var s = (Math.round(Math.abs(v) / 1000) / 10).toLocaleString() + "万";
  return (v < 0 ? "−" : "") + s;
}
function _dtsFmtPct(v) { if (v == null || !isFinite(v)) return "—"; return (Math.round(v * 1000) / 10) + "%"; }

// 余力使用率で行を色分け（ユーザー決定 2026-08-05）。保証金不足（バッファ<0）は最優先で赤。
// 検算で分かったとおり刻み250,000円・株価6,500円だと90%台が続くので、危険域を目で拾えるようにする。
function _dtsUseTone(u, shortMargin) {
  if (shortMargin) return { bg: "#FEE2E2", ink: "#991B1B", lbl: "保証金不足" };
  if (u == null) return { bg: null, ink: null, lbl: "" };
  if (u > 0.95) return { bg: "#FEF2F2", ink: "#B91C1C", lbl: "危険" };
  if (u > 0.85) return { bg: "#FEFCE8", ink: "#A16207", lbl: "警戒" };
  if (u > 0.70) return { bg: null, ink: null, lbl: "" };
  return { bg: "#F0FDF4", ink: "#047857", lbl: "余裕" };
}

// 前提の初期値。保存済み（data.custom.dtsCfg）があればそれを、無ければ実績から組み立てる。
function _dtsInitCfg(data, actual) {
  var saved = data && data.custom && data.custom.dtsCfg;
  if (saved && saved.startYm && saved.endYm) {
    var c = {}; for (var k in saved) { if (Object.prototype.hasOwnProperty.call(saved, k)) c[k] = saved[k]; }
    if (!c.livingCost || !c.livingCost.length) c.livingCost = [{ from: c.startYm, amount: 100000 }];
    if (!c.drip || !c.drip.length) c.drip = [{ from: c.startYm, mode: "drip", amount: 50000, target: null }];
    return c;
  }
  var ym = ((typeof todayStr === "function") ? todayStr() : "2026-08-01").slice(0, 7);
  return {
    startYm: ym, endYm: _dtsIdxToYm(_dtsYmToIdx(ym) + 11), businessDays: 20,
    initialCapital: 1300000, initialLiving: 200000, initialShares: 600,
    dailyPer100: (actual && actual.perDay != null) ? Math.round(actual.perDay) : 2000,
    taxRate: 0.20315,
    livingCost: [{ from: ym, amount: 100000 }],
    drip: [{ from: ym, mode: "drip", amount: 50000, target: null }],
    stepBase: null, stepAmount: 250000, stepShares: 100, maxShares: 3000,
    mainPrice: 6500, marginRate: 0.30,
    injection: { ym: "", amount: 0, sharesAfter: 0 }
  };
}

// 数値入力。unit="man"＝円で持って万円で入出力／"pct"＝小数で持って%で入出力／既定＝そのまま。
// 入力中は draft(生の文字列)を優先して表示する＝「1」と打った瞬間に1万円へ正規化されて
// 続きが打てなくなるのを防ぐ。blur で draft を捨てて正規表示に戻す。
//
// ▲▼ボタンは既存の共通部品 _stepBtn(app-05.js:6232)を使う＝押しっぱなしで350ms後に80ms間隔の連続増減。
// props.step は**表示単位**で渡す（unit="man" なら step:1 が1万円）。省略するとボタンを出さない＝税率・
// 委託保証金率のような「いじらない欄」はそのまま。
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
  var bump = function(dir) {
    if (istep == null) return;
    setDraft(null);   // 入力途中の生文字列が残っていると新しい値が画面に出ないので捨てる
    var cur = vRef.current;
    var base = (cur == null || cur === "" || !isFinite(cur)) ? 0 : Number(cur);
    var nv = base + dir * istep;
    if (minV != null && nv < minV) nv = minV;
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

// ⑥の下に出す注記 2026-08-05v→z。「月末の資金口座が◯万円になった次の月から」は**段数を数える起点**＝
// その資金だった時が②の基礎取引株数、という後付けの基準点。起点が今の資金より低いと初月からいきなり段が
// 乗るので、表を見る前にここで数字を出しておく。
// ⚠️初月株数は _dtsSimulate の②と同じ式（floor→上限クランプ→ラチェット）で出す＝注記と本体がズレないように。
// 開始月に⑧の投入があるとその月は②を通らない（①で指定株数へジャンプ）ので、その時は警告を出さない。
//
// 【2026-08-05z ⑧の起点リセットを明示】外部レビュー（simulator-step-amount-review.md §6）の指摘。
//   ⑧で外部資金を投入すると `base`/`baseShares` が投入直後の資金・株数へ張り替わる＝**⑥の入力は捨てられる**。
//   投入が期間の頭のほうにあると⑥の起点が結果に一切効かなくなる（実測: 起点を210万→1000万にしても出力不変）。
//   挙動自体は正しい（張り替えないと投入額を利益と誤認して段が跳ねる）ので、**注記が実装に追いついていない
//   だけ**と判断し、①⑧が起点を置き換えることを書く ②いま実際に使われている起点を出す、の2点で対応。
//   ⚠️実効起点は res.summary.stepOrigin をそのまま読む＝ここで再計算すると本体とズレるので絶対に作らない。
function _dtsStepBaseNote(cfg, res) {
  cfg = cfg || {};
  var cap0 = +cfg.initialCapital || 0, sh0 = Math.max(0, +cfg.initialShares || 0);
  var sb = _dtsNumOrNull(cfg.stepBase);
  var injYm = (cfg.injection && cfg.injection.ym) ? cfg.injection.ym : "";
  var org = (res && res.summary) ? res.summary.stepOrigin : null;

  var head = "月末の資金口座がこの額だった時の株数が②の基礎取引株数（" + sh0 + "株）という意味です。ここから増えた分を数えます。"
    + (sb == null ? ("空欄なので開始時の取引資金 " + _dtsFmtMan(cap0) + "円 が起点です。") : "");

  // ①⑧が起点を置き換えること／②実際に使われている起点。⑧を使っていない時は素直に起点だけ出す。
  // ⚠️⑧由来の起点は**円単位で出す**＝投入直後の資金はシミュの計算結果なので 2,182,488 のような端数になり、
  //   「218.2万」と丸めると次の閾値を手で足せない（レビュー §6-3-2 の指摘そのもの）。⑥に手入力した起点は
  //   ユーザーが打った丸い数字なので万表記のままでいい。
  var org2 = null, orgMax = _dtsNumOrNull(cfg.maxShares);
  var floor = (res && res.summary) ? res.summary.injFloor : null;
  var stepAmt0 = Math.max(1, +cfg.stepAmount || 250000);
  if (org && org.fromInjection) {
    // 起点が空欄のケース＝⑧が起点ごと張り替える。実効起点は端数になるので円で出す。
    var capped = (orgMax != null && orgMax > 0 && org.shares >= orgMax);
    org2 = React.createElement("div", { style: { marginTop: 3, color: "#6D28D9", fontWeight: 700 } },
      "起点が空欄なので、⑧の投入で起点が " + _dtsYmLbl(org.ym) + "の投入直後の "
        + _dtsFmtYen(org.capital) + "円 ＝ " + org.shares.toLocaleString() + "株 に置き換わります。"
        + (capped ? "すでに上限株数なのでこれ以上は増えません。"
                  : "最初に段が上がるのは " + _dtsFmtYen(org.capital + stepAmt0) + "円 に届いた翌月です。")
        + "（起点を入れると、投入があっても入れた額のまま動きません）");
  } else if (org) {
    // 起点を明示しているケース＝⑧があっても動かない。⑧の株数指定はラチェットの下限として効く。
    // ⚠️「次に」ではなく「最初に」＝段は起点からの累積なので、2段目は起点+2刻み・3段目は起点+3刻み。
    //   「次に段が上がるのは起点+1刻み」と書くと、1段でも進んだ後は嘘になる（2026-08-05B に文言修正）。
    var kids = ["いま使われている起点は " + _dtsFmtMan(org.capital) + "円 ＝ " + org.shares.toLocaleString()
      + "株。最初に段が上がるのは月末の資金が " + _dtsFmtMan(org.capital + stepAmt0) + "円 に届いた翌月です（2段目は "
      + _dtsFmtMan(org.capital + stepAmt0 * 2) + "円、以降も同じ刻み）。"];
    // ⚠️2026-08-05C: ここは以前「計算上の株数が◯株を超えるまではその値のまま」と書いていた＝それが
    //   まさにユーザー報告のバグ（②の株数から数え直すので⑧で増やした分に追いつくまで段が死ぬ）だった。
    //   基準株数を⑧の値へ乗せ替えたので、投入の翌月からは普通に段が上がる。
    if (floor) kids.push(React.createElement("span", { key: "f", style: { color: "#6D28D9", fontWeight: 700 } },
      "⑧で" + _dtsYmLbl(floor.ym) + "に" + floor.shares.toLocaleString() + "株へ置き直すので、"
        + "以降はそこから月末の資金が" + _dtsFmtMan(stepAmt0) + "円増えるごとに+"
        + Math.max(1, +cfg.stepShares || 100).toLocaleString() + "株です。"));
    org2 = React.createElement("div", { style: { marginTop: 3 } }, kids);
  }

  var warn = null;
  if (sb != null && cap0 > sb && !(injYm && cfg.startYm && injYm === cfg.startYm)) {
    var stepAmt = Math.max(1, +cfg.stepAmount || 250000), stepSh = Math.max(1, +cfg.stepShares || 100);
    var maxSh = _dtsNumOrNull(cfg.maxShares);
    var want = sh0 + Math.floor((cap0 - sb) / stepAmt) * stepSh;
    if (maxSh != null && maxSh > 0) want = Math.min(want, maxSh);
    if (want > sh0) warn = "※開始時の資金が起点より " + _dtsFmtMan(cap0 - sb) + "円 多く、すでに増えた後なので、初月から " + (want - sh0) + "株 乗って " + want + "株 で始まります。";
  }
  return React.createElement("div", { style: { fontSize: 9, color: "#6B7280", marginTop: 4, lineHeight: 1.5 } }, head,
    warn ? React.createElement("span", { style: { color: "#B45309", fontWeight: 700 } }, warn) : null,
    org2);
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

  var clone = function(o) { var c = {}; for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; } return c; };
  var set = function(k, v) { setCfg(function(p) { var c = clone(p); c[k] = v; return c; }); };
  var setInj = function(k, v) { setCfg(function(p) { var c = clone(p); c.injection = clone(p.injection || {}); c.injection[k] = v; return c; }); };
  var setRow = function(key, i, k, v) {
    setCfg(function(p) { var c = clone(p); var arr = (p[key] || []).slice(); arr[i] = clone(arr[i] || {}); arr[i][k] = v; c[key] = arr; return c; });
  };
  var addRow = function(key, tmpl) { setCfg(function(p) { var c = clone(p); c[key] = (p[key] || []).concat([tmpl]); return c; }); };
  var delRow = function(key, i) {
    setCfg(function(p) { var c = clone(p); var arr = (p[key] || []).slice(); arr.splice(i, 1); if (!arr.length) arr = [{ from: p.startYm, amount: 0 }]; c[key] = arr; return c; });
  };

  var res = _dtsSimulate(cfg);
  var months = _dtsMonthCount(cfg.startYm, cfg.endYm);
  var grade = (typeof _profitGradeFromPnl === "function") ? _profitGradeFromPnl(Math.round(+cfg.dailyPer100 || 0), 1) : null;
  var badge = function(g) { return (typeof _elHoldGradeBadge === "function" && g) ? _elHoldGradeBadge(g) : null; };

  // 前提の保存（プリセット）。data.custom へ書けば既存の保存・同期経路にそのまま乗る。
  var doSave = function() {
    if (typeof setData !== "function") return;
    setData(function(d) {
      var nd = clone(d || {}); nd.custom = clone(nd.custom || {}); nd.custom.dtsCfg = cfg; return nd;
    });
    setSaveMsg("保存しました"); setTimeout(function() { setSaveMsg(""); }, 1800);
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
      _dtsRow([
        _dtsLbl("1日あたり"), React.createElement(DtsNum, { key: "dp", value: cfg.dailyPer100, width: 68, suffix: "円/100株", step: 100, onChange: function(v) { set("dailyPer100", v); } }),
        React.createElement("span", { key: "gb" }, badge(grade)),
        (actual && actual.perDay != null) ? React.createElement("button", {
          key: "af", onClick: function() { set("dailyPer100", Math.round(actual.perDay)); },
          style: { fontSize: 10, fontWeight: 800, color: "#fff", background: _DTS_SUB, border: "none", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }
        }, "🔄 実績を入れる（" + _dtsFmtYen(actual.perDay) + "円/日）") : null,
        _dtsLbl("税率"), React.createElement(DtsNum, { key: "tx", value: cfg.taxRate, unit: "pct", width: 56, suffix: "%", onChange: function(v) { set("taxRate", v); } })
      ]),
      React.createElement("div", { style: { fontSize: 9, color: "#6B7280", marginTop: 4, lineHeight: 1.5 } },
        actual && actual.perDay != null
          ? "実績＝最終損益の合計 ÷ 営業日数（" + actual.cnt + "件 / " + actual.days + "日）。母数は集計ルール統一後の記録のみ。"
          : "実績を出せる記録がありません。手入力してください。",
        React.createElement("span", { style: { display: "block", color: "#B45309" } },
          "月次は 1日あたり × 営業日数 で内部換算します（" + _dtsFmtYen((+cfg.dailyPer100 || 0) * (+cfg.businessDays || 20)) + "円/月/100株）。"))
    )),
    _dtsSec("④ 生活費", "社会保険料もここに足す（別枠は持たない）", React.createElement("div", null,
      (cfg.livingCost || []).map(function(r, i) {
        return React.createElement("div", { key: "lc" + i, style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          React.createElement(DtsYm, { value: r.from, width: 112, onChange: function(v) { setRow("livingCost", i, "from", v); } }),
          _dtsLbl("から 月"),
          React.createElement(DtsNum, { value: r.amount, unit: "man", suffix: "万円", step: 1, onChange: function(v) { setRow("livingCost", i, "amount", v); } }),
          (cfg.livingCost.length > 1) ? React.createElement("button", { onClick: function() { delRow("livingCost", i); }, style: { fontSize: 10, color: "#B91C1C", background: "none", border: "none", cursor: "pointer" } }, "🗑") : null);
      }),
      React.createElement("button", { onClick: function() { addRow("livingCost", { from: cfg.startYm, amount: 200000 }); }, style: { fontSize: 10, fontWeight: 700, color: _DTS_INK, background: _DTS_BG, border: "1px solid " + _DTS_BD, borderRadius: 6, padding: "3px 8px", cursor: "pointer" } }, "＋ 途中で変える")
    )),
    _dtsSec("⑤ 生活口座への積立", "目標残高に達すると積立が止まり、以降は全額が取引資金へ", React.createElement("div", null,
      (cfg.drip || []).map(function(r, i) {
        return React.createElement("div", { key: "dr" + i, style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" } },
          React.createElement(DtsYm, { value: r.from, width: 112, onChange: function(v) { setRow("drip", i, "from", v); } }),
          _dtsLbl("から"),
          React.createElement("select", {
            value: r.mode || "drip", onChange: function(e) { setRow("drip", i, "mode", e.target.value); },
            style: { fontSize: 11, fontWeight: 700, padding: "3px 4px", border: "1px solid " + _DTS_BD, borderRadius: 5, background: "#fff", color: "#1F2937" }
          }, React.createElement("option", { value: "drip" }, "定額"), React.createElement("option", { value: "fill" }, "目標まで全額")),
          (r.mode === "fill") ? null : React.createElement(DtsNum, { value: r.amount, unit: "man", suffix: "万円/月", step: 1, onChange: function(v) { setRow("drip", i, "amount", v); } }),
          _dtsLbl("目標残高"),
          React.createElement(DtsNum, { value: r.target, unit: "man", suffix: "万円", placeholder: "無制限", step: 5, onChange: function(v) { setRow("drip", i, "target", v); } }),
          (cfg.drip.length > 1) ? React.createElement("button", { onClick: function() { delRow("drip", i); }, style: { fontSize: 10, color: "#B91C1C", background: "none", border: "none", cursor: "pointer" } }, "🗑") : null);
      }),
      React.createElement("button", { onClick: function() { addRow("drip", { from: cfg.startYm, mode: "drip", amount: 50000, target: null }); }, style: { fontSize: 10, fontWeight: 700, color: _DTS_INK, background: _DTS_BG, border: "1px solid " + _DTS_BD, borderRadius: 6, padding: "3px 8px", cursor: "pointer" } }, "＋ 途中で変える")
    )),
    // 2026-08-05y ラベルを「月末の資金口座が◯万円になった次の月から」へ（ユーザー要望）。
    // ⚠️これは**表記だけの変更で計算は1行も変えていない**＝元から「前月末の資金で判定→当月に反映」なので
    //   ユーザーの言う「月末が◯万になった次の月から」と同じ規則。旧ラベル「資金口座◯万円から」だと
    //   いつの資金で判定していつ反映されるのかが読めなかった、というだけ。
    _dtsSec("⑥ 株数を増やすルール", "端数は次段へ繰り越し・資金が減っても下げない", React.createElement("div", null,
      _dtsRow([
        _dtsLbl("月末の資金口座が"), React.createElement(DtsNum, { key: "sb", value: cfg.stepBase, unit: "man", suffix: "万円", placeholder: "開始時", step: 1, onChange: function(v) { set("stepBase", v); } }),
        _dtsLbl("になった次の月から"), React.createElement(DtsNum, { key: "sa", value: cfg.stepAmount, unit: "man", suffix: "万円", step: 1, onChange: function(v) { set("stepAmount", v); } }),
        _dtsLbl("増えるごとに"), React.createElement(DtsNum, { key: "ss", value: cfg.stepShares, width: 46, suffix: "株", step: 100, onChange: function(v) { set("stepShares", v); } }),
        _dtsLbl("上限"), React.createElement(DtsNum, { key: "ms", value: cfg.maxShares, width: 56, suffix: "株", placeholder: "無制限", step: 100, onChange: function(v) { set("maxShares", v); } })
      ]),
      _dtsStepBaseNote(cfg, res))),
    _dtsSec("⑦ 余力チェック", "拘束額＝株数×株価／必要保証金＝拘束額×保証金率", React.createElement("div", null,
      _dtsRow([
        _dtsLbl("メイン株価"), React.createElement(DtsNum, { key: "mp", value: cfg.mainPrice, width: 62, suffix: "円", step: 100, onChange: function(v) { set("mainPrice", v); } }),
        _dtsLbl("委託保証金率"), React.createElement(DtsNum, { key: "mr", value: cfg.marginRate, unit: "pct", width: 52, suffix: "%", onChange: function(v) { set("marginRate", v); } })
      ]),
      React.createElement("div", { style: { fontSize: 9, color: "#B45309", marginTop: 4, lineHeight: 1.5 } },
        "この株価だと" + (+cfg.stepShares || 100) + "株増やすごとに必要保証金が "
        + _dtsFmtYen((+cfg.mainPrice || 0) * (+cfg.stepShares || 100) * (+cfg.marginRate || 0.3))
        + "円 増えます。刻み額 " + _dtsFmtYen(cfg.stepAmount) + "円 との差 "
        + _dtsFmtYen((+cfg.stepAmount || 0) - (+cfg.mainPrice || 0) * (+cfg.stepShares || 100) * (+cfg.marginRate || 0.3))
        + "円 が1段ごとのバッファの増え方です（小さいほど余力使用率が下がりません）。")
    )),
    _dtsSec("⑧ 外部資金の投入", "使わないなら年月を空のまま", _dtsRow([
      React.createElement(DtsYm, { key: "iy", value: (cfg.injection || {}).ym, onChange: function(v) { setInj("ym", v); } }),
      _dtsLbl("に"), React.createElement(DtsNum, { key: "ia", value: (cfg.injection || {}).amount, unit: "man", suffix: "万円", step: 5, onChange: function(v) { setInj("amount", v); } }),
      _dtsLbl("投入 → 直後の株数"), React.createElement(DtsNum, { key: "is2", value: (cfg.injection || {}).sharesAfter, width: 56, suffix: "株", step: 100, onChange: function(v) { setInj("sharesAfter", v); } })
    ]))
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
    _dtsSensTable(cfg, res)
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
    saveMsg ? React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#047857" } }, saveMsg) : null);
}

// 期末のサマリーカード。まず結論の数字だけ先に見せる。
function _dtsSummaryCards(res, cfg) {
  var s = res.summary;
  var card = function(lbl, val, sub, col) {
    return React.createElement("div", { key: lbl, style: { flex: "1 1 118px", minWidth: 108, border: "1px solid " + _DTS_BD, borderRadius: 9, padding: "6px 8px", background: "#fff" } },
      React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280" } }, lbl),
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: col || _DTS_INK, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 } }, val),
      sub ? React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280" } }, sub) : null);
  };
  // 開始時からの増減を全カードに揃えて出す（旧: 期末取引資金だけ「＋◯◯万」で不揃いだった）2026-08-05。
  var sh0 = +cfg.initialShares || 0, liv0 = +cfg.initialLiving || 0;
  var gain = function(v) { return (v >= 0 ? "＋" : "−") + _dtsFmtMan(Math.abs(v)); };
  return React.createElement("div", null,
    React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: "#6B7280", marginBottom: 4 } },
      _dtsYmLbl(s.startYm) + " 〜 " + _dtsYmLbl(s.endYm) + "末（" + s.months + "ヶ月）の見通し"),
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 } }, [
      card("期末 総資産", _dtsFmtMan(s.endTotal), gain(s.endTotal - (+cfg.initialCapital || 0) - liv0), "#047857"),
      card("期末 取引資金", _dtsFmtMan(s.endCapital), gain(s.capitalGain)),
      card("期末 生活口座", _dtsFmtMan(s.endLiving), gain(s.endLiving - liv0)),
      card("期末 株数", s.endShares.toLocaleString() + "株", (s.endShares >= sh0 ? "＋" : "−") + Math.abs(s.endShares - sh0) + "株"),
      card("自己資金ベース", _dtsFmtMan(s.endOwnBase), s.injection ? "外部 " + _dtsFmtMan(s.injection) + " を除く" : "外部資金なし"),
      card("手取り合計", _dtsFmtMan(s.net), "税 " + _dtsFmtMan(s.tax) + " 控除後", "#9A3412")
    ]));
}

// ---- グラフ（自前SVG）----------------------------------------------------
// Chart.js / recharts は入れない＝ビルド工程なし・file:// 運用・SWプリキャッシュのためCDNを増やせない。
// ダークモードは html.sn-dark のCSSフィルタ（invert+hue-rotate）が全体に掛かるので、ここは light 前提の色で描く。
function _dtsNiceMax(v) {
  if (!v || !isFinite(v) || v <= 0) return 1;
  var mag = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), nn = v / mag;
  var st = nn <= 1 ? 1 : nn <= 2 ? 2 : nn <= 2.5 ? 2.5 : nn <= 5 ? 5 : 10;
  return st * mag;
}
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
  }
  // 区切り線は**100万円ごとに実線・50万円ごとに点線**（ユーザー指定 2026-08-05）。
  // ただし期間が長く総資産が伸びると本数が増えすぎるので、実線が12本を超える時だけ 200万→500万→… と粗くする
  // （点線は常に実線の半分＝既定なら50万円）。旧 _dtsNiceMax による4分割はやめた。
  var MAJ = [1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8, 2e8, 5e8];
  var major = MAJ[MAJ.length - 1];
  for (i = 0; i < MAJ.length; i++) { if (Math.ceil(maxT / MAJ[i]) <= 12) { major = MAJ[i]; break; } }
  // 0より下にも段を取る 2026-08-05F。nMin=0（＝マイナス無し）なら従来と完全に同じ目盛りになる。
  var nMaj = Math.max(1, Math.ceil(maxT / major));
  var nMin = Math.ceil(Math.max(0, -minT) / major);
  var yTop = major * nMaj, yBot = -major * nMin, ySpan = yTop - yBot, minor = major / 2;
  // 右軸（株数）は**500ごとに実線・100ごとに点線**、目盛りの数字は丸い株数だけ 2026-08-05E（ユーザー指定）。
  // 旧: _dtsNiceMax(maxS) を機械的に4等分＝2,500株なら 625 / 1,250 / 1,875 という
  //     実際には建てられない半端な株数が並び、区切り線も無かった。
  // ⚠️株数が数万株まで伸びると100刻みの点線が数百本になるので、実線が8本以内に収まる組を選んで繰り上げる
  //   （組で持つのは 2000/400 のような半端な点線刻みを作らないため）。左軸のMAJ配列と同じ考え方。
  var SPAIR = [[500, 100], [1000, 200], [2000, 500], [5000, 1000], [10000, 2000], [50000, 10000], [100000, 20000]];
  var sMaj = SPAIR[SPAIR.length - 1][0], sMin = SPAIR[SPAIR.length - 1][1];
  for (i = 0; i < SPAIR.length; i++) { if (Math.ceil(Math.max(1, maxS) / SPAIR[i][0]) <= 8) { sMaj = SPAIR[i][0]; sMin = SPAIR[i][1]; break; } }
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
  // 右軸は**目盛りの数字だけで区切り線は引かない** 2026-08-05G（ユーザー指定）。
  // 2026-08-05E で 100点線/500実線 を入れたが、左軸のグレーの線と二重になって画面が線だらけになった。
  // 刻みの選び方（SPAIR）は数字を丸く保つために残す＝625株のような目盛りに戻さないため。
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

  var every = Math.ceil(n / 12);
  for (i = 0; i < n; i++) {
    if (i % every) continue;
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

// ② 余力使用率の折れ線。70/85/95%の帯を敷いて、危ない月が目で拾えるようにする。
function _dtsChartPower(rows, hi) {
  if (!rows || !rows.length) return null;
  var W = 720, H = 230, pL = 58, pR = 54, pT = 26, pB = 32;
  var pw = W - pL - pR, ph = H - pT - pB, n = rows.length, i;
  var step = pw / n, maxU = 0;
  for (i = 0; i < n; i++) { if (rows[i].powerUse != null && rows[i].powerUse > maxU) maxU = rows[i].powerUse; }
  var top = Math.max(1.0, Math.ceil(maxU / 0.25) * 0.25);   // 25%刻みで切り上げ＝目盛りがキリのいい%になる
  var y = function(v) { return pT + ph - (v / top) * ph; };
  var x = function(i2) { return pL + step * i2 + step / 2; };
  var kids = [];
  var band = function(k, lo, hi, col) {
    var y1 = y(Math.min(hi, top)), y2 = y(lo);
    if (y2 <= y1) return;
    kids.push(React.createElement("rect", { key: k, x: pL, y: y1, width: pw, height: y2 - y1, fill: col }));
  };
  band("b1", 0, 0.70, "#F0FDF4"); band("b2", 0.85, 0.95, "#FEFCE8"); band("b3", 0.95, top, "#FEF2F2");
  // 目盛りは25%ごと（左）。警戒ライン70/85/95%は破線＋**右側**にラベルを置く＝左の目盛りと重ならない。
  var nG = Math.round(top / 0.25);
  for (i = 0; i <= nG; i++) {
    var gv = 0.25 * i, gy = y(gv);
    kids.push(React.createElement("line", { key: "pg" + i, x1: pL, y1: gy, x2: pL + pw, y2: gy, stroke: i === 0 ? "#CBD5E1" : "#E5E7EB", strokeWidth: 1 }));
    kids.push(_dtsSvgText("pgl" + i, pL - 6, gy + 3, Math.round(gv * 100) + "%", { textAnchor: "end" }));
  }
  var refs = [[0.70, "#047857"], [0.85, "#A16207"], [0.95, "#B91C1C"]];
  for (i = 0; i < refs.length; i++) {
    if (refs[i][0] > top) continue;
    kids.push(React.createElement("line", { key: "r" + i, x1: pL, y1: y(refs[i][0]), x2: pL + pw, y2: y(refs[i][0]), stroke: refs[i][1], strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.75 }));
    kids.push(_dtsSvgText("rl" + i, pL + pw + 6, y(refs[i][0]) + 3, Math.round(refs[i][0] * 100) + "%", { textAnchor: "start", fill: refs[i][1] }));
  }
  var pts = [];
  for (i = 0; i < n; i++) { if (rows[i].powerUse != null) pts.push(x(i).toFixed(1) + "," + y(rows[i].powerUse).toFixed(1)); }
  kids.push(React.createElement("polyline", { key: "ln", points: pts.join(" "), fill: "none", stroke: "#1E3A8A", strokeWidth: 2 }));
  for (i = 0; i < n; i++) {
    var r = rows[i]; if (r.powerUse == null) continue;
    var tone = _dtsUseTone(r.powerUse, r.shortMargin);
    kids.push(React.createElement("circle", { key: "p" + i, cx: x(i), cy: y(r.powerUse), r: n > 40 ? 1.6 : 2.8, fill: tone.ink || "#1E3A8A" }));
  }
  var every = Math.ceil(n / 12);
  for (i = 0; i < n; i++) {
    if (i % every) continue;
    kids.push(_dtsSvgText("x" + i, x(i), H - 11, _dtsXLbl(rows[i].ym), { textAnchor: "middle", fontSize: 8.5 }));
  }
  kids.push(_dtsSvgText("axP", 4, 13, "余力使用率", { textAnchor: "start", fontSize: 9, fill: "#1E3A8A" }));
  kids.push(_dtsSvgText("axP2", W - 4, 13, "警戒ライン", { textAnchor: "end", fontSize: 9, fill: "#A16207" }));
  if (hi != null && rows[hi]) {
    kids.push(React.createElement("line", { key: "hv", x1: x(hi), y1: pT, x2: x(hi), y2: pT + ph, stroke: _DTS_INK, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.5 }));
    if (rows[hi].powerUse != null) kids.push(React.createElement("circle", { key: "hp", cx: x(hi), cy: y(rows[hi].powerUse), r: 4.5, fill: "none", stroke: _DTS_INK, strokeWidth: 2 }));
  }
  return React.createElement("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", style: { display: "block", minWidth: 460 }, role: "img" },
    React.createElement("title", null, "余力使用率の推移（70/85/95%の警戒ライン付き）"), kids);
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
        row("t", "積立", r.toLiving ? "−" + _dtsFmtMan(r.toLiving) : _dtsFmtMan(0), r.toLiving ? _DTS_DOWN : "#9CA3AF"),
        row("r", "残金", (r.toCapital < 0 ? "−" : "") + _dtsFmtMan(Math.abs(r.toCapital)), r.toCapital < 0 ? _DTS_DOWN : _DTS_UP)),
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
        onTouchMove: function(e) { if (e.touches && e.touches[0]) move(e.touches[0].clientX); }
      },
        props.draw(rows, hi),
        (hi != null && rows[hi]) ? React.createElement("div", {
          style: { position: "absolute", left: (fx * 100) + "%", top: 6, transform: tf, pointerEvents: "none",
            background: "#fff", border: "1px solid " + _DTS_BD, borderRadius: 8, padding: "7px 9px",
            boxShadow: "0 2px 8px rgba(0,0,0,.12)", zIndex: 2, whiteSpace: "nowrap" } }, _dtsTipD(rows[hi])) : null)),
    props.legend);
}

function _dtsCharts(res) {
  return React.createElement("div", null, [
    React.createElement(DtsChartBox, { key: "ca", rows: res.rows, draw: _dtsChartAssets,
      title: "📊 総資産と株数の推移", note: "棒＝総資産の内訳（左軸・万円）／線＝株数（右軸・株）　カーソルを合わせるとその月の内訳が出ます",
      legend: _dtsLegend([["取引資金", "#93C5FD"], ["生活口座", "#FCD34D"], ["株数", "#B45309"]]) }),
    React.createElement(DtsChartBox, { key: "cp", rows: res.rows, draw: _dtsChartPower,
      title: "📉 余力使用率", note: "拘束額 ÷（取引資金 ÷ 保証金率）。95%超は1回の負けで詰む水準",
      legend: _dtsLegend([["〜70% 余裕", "#DCFCE7"], ["85〜95% 警戒", "#FEF9C3"], ["95%〜 危険", "#FEE2E2"]]) })
  ]);
}

// 表の配色 2026-08-05w（ユーザー指定）＝株式の慣習どおり **増える＝赤／減る・出ていく＝緑**。
// 記録帳の比較データ（app-06 _elDayStockBenchV2）も「↑赤=良い方向／↓緑=悪い方向」なので、
// この表だけ緑↑・赤↓のままだと同じアプリの中で符号の読み方が逆になってしまう（2026-08-05w に反転）。
var _DTS_UP = "#B91C1C", _DTS_DOWN = "#047857", _DTS_ZERO = "#9CA3AF";

// （）内に先月比を出す小さな差分バッジ。増えたら赤↑・減ったら緑↓。
// ⚠️「増える方が良い」欄にだけ使うこと。余力使用率のように**下がる方が良い**欄では意味が逆になる。
function _dtsDelta(v, opts) {
  if (v == null || !isFinite(v)) return null;
  var o = opts || {}, up = o.lowerIsBetter ? (v < 0) : (v > 0);
  var col = (v === 0) ? _DTS_ZERO : (up ? _DTS_UP : _DTS_DOWN);
  var arw = (v === 0) ? "±" : (v > 0 ? "↑" : "↓");
  var body = o.fmt ? o.fmt(Math.abs(v)) : _dtsFmtMan(Math.abs(v));
  return React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: col } }, "（" + arw + body + "）");
}

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
function _dtsRest(v) {
  var n = +v || 0;
  var col = (n === 0) ? _DTS_ZERO : (n > 0 ? _DTS_UP : _DTS_DOWN);
  return React.createElement("span", { style: { color: col, fontWeight: 700 } }, (n < 0 ? "−" : "") + _dtsFmtMan(Math.abs(n)));
}

// 添え物の枠幅。余力使用率の「保証金不足」が列内で最長なのでそこに合わせる。
// （_DTS_W_DELTA は「月末取引資金（↑◯万）」用だったが、2026-08-05F に（）表記を廃止したので未使用）
var _DTS_W_TONE = 56, _DTS_W_FLOW = 48;

// 「月初 → 月末」の2値セル 2026-08-05F（ユーザー指定）。取引資金と信用余力で使う。
// ⚠️両側とも固定幅の右寄せにする＝そうしないと矢印の位置が行ごとにずれて数字が縦に揃わない。
function _dtsFlow(a, b) {
  return React.createElement("span", { style: { display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 3 } },
    React.createElement("span", { style: { minWidth: _DTS_W_FLOW, textAlign: "right", color: "#9CA3AF", fontWeight: 700 } }, a),
    React.createElement("span", { style: { color: "#CBD5E1", fontSize: 9 } }, "→"),
    React.createElement("span", { style: { minWidth: _DTS_W_FLOW, textAlign: "right", fontWeight: 800, color: _DTS_INK } }, b));
}

function _dtsTable(res, cfg) {
  // t は文字列でも要素の配列でもよい（2行見出し用）。配列を渡す時は k でキーを明示する。
  var th = function(t, tip, k) { return React.createElement("th", { key: k || t, title: tip || "", style: { padding: "4px 5px", fontSize: 9.5, fontWeight: 800, color: "#6B7280", borderBottom: "1px solid " + _DTS_BD, whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.3 } }, t); };
  var mr0 = +cfg.marginRate || 0.30;
  // 開始時の信用余力＝委託保証金 ÷ 保証金率 − 建玉金額。行データと同じ式で出す。
  var pw0 = (+cfg.initialCapital || 0) / mr0 - (+cfg.initialShares || 0) * (+cfg.mainPrice || 0);
  var lastRow = res.rows[res.rows.length - 1] || null;
  var td = function(k, ch, ex) { return React.createElement("td", { key: k, style: Object.assign({ padding: "3px 5px", fontSize: 10.5, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", borderTop: "1px solid #F1F5F9" }, ex || {}) }, ch); };
  // 開始時の行。これが無いと1行目の「（↑〇万）」が何からの増減か画面上に起点が無い 2026-08-05。
  var dash = React.createElement("span", { style: { color: "#D1D5DB" } }, "—");
  var openRow = React.createElement("tr", { key: "__open", style: { background: "#F8FAFC" } }, [
    td("ym", React.createElement("span", { style: { fontWeight: 800, color: "#6B7280" } }, "開始時"), { textAlign: "left", borderLeft: "3px solid transparent" }),
    td("sh", React.createElement("span", { style: { fontWeight: 700, color: "#6B7280" } }, (+cfg.initialShares || 0).toLocaleString())),
    td("gr", dash), td("net", dash), td("ex", dash), td("tl", dash),
    td("lv", React.createElement("span", { style: { fontWeight: 700, color: "#6B7280" } }, _dtsFmtMan(cfg.initialLiving))),
    td("rest", dash),
    td("cp", _dtsFlow("—", _dtsFmtMan(cfg.initialCapital))),
    td("pw", _dtsFlow("—", _dtsFmtMan(pw0))),
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
      td("tl", _dtsOut(r.toLiving)),
      td("lv", React.createElement("span", { style: { fontWeight: 700 } }, _dtsFmtMan(r.living))),
      td("rest", _dtsRest(r.toCapital)),
      td("cp", _dtsFlow(_dtsFmtMan(r.capitalOpen), _dtsFmtMan(r.capital))),
      td("pw", _dtsFlow(_dtsFmtMan(r.powerOpen), _dtsFmtMan(r.powerEnd))),
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
    td("rest", React.createElement("span", { style: { fontWeight: 800 } }, _dtsRest(sm.toCapital))),
    // 合計行は「開始時 → 期末」＝月次と同じ読み方（左が前・右が後）で通す。
    td("cp", _dtsFlow(_dtsFmtMan(cfg.initialCapital), _dtsFmtMan(sm.endCapital))),
    td("pw", _dtsFlow(_dtsFmtMan(pw0), _dtsFmtMan(lastRow ? lastRow.powerEnd : pw0))),
    td("pu", _dtsAlign(dash, null, _DTS_W_TONE))
  ]);
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, background: "#fff", overflowX: "auto", marginBottom: 8 } },
    React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 980 } },
      React.createElement("thead", null, React.createElement("tr", null, [
        th("年月"), th("株数"), th("税引前", "税引前の月次利益＝(株数÷100)×1日あたり損益×営業日数"), th("手取り", "税引前 − 税（税額は上のサマリーカードに合計で出しています）"),
        th("生活費", "社会保険料を含む"), th("積立", "その月に生活口座へ移した額"), th("生活口座", "生活口座の月末残高"),
        th([React.createElement("div", { key: "a" }, "残金"),
            React.createElement("div", { key: "b", style: { fontSize: 8.5, fontWeight: 700, color: "#9CA3AF" } }, "（取引資金組入）")],
          "手取り − 生活費 − 積立 ＝ その月に取引資金へ組み入れた額。マイナスなら取引資金を取り崩した月", "rest"),
        th("取引資金", "月初の資金 → 月末の資金。外部資金を投入した月は月初にその投入額が入っています"),
        th("信用余力", "月初の余力 → 月末の余力。委託保証金 ÷ 委託保証金率 − 建玉金額"),
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

// グレード感度＝1日あたり成績だけ差し替えて回し直した比較表。
// 「今のまま」と「1つ上のグレードに乗ったら」の差を期末の金額で見せる。
function _dtsSensTable(cfg, base) {
  var list = _dtsSensitivity(cfg);
  if (!list.length) return null;
  var th = function(t, tip) { return React.createElement("th", { key: t, title: tip || "", style: { padding: "4px 6px", fontSize: 9.5, fontWeight: 800, color: "#6B7280", borderBottom: "1px solid " + _DTS_BD, whiteSpace: "nowrap", textAlign: "center" } }, t); };
  var td = function(k, ch, ex) { return React.createElement("td", { key: k, style: Object.assign({ padding: "4px 6px", fontSize: 11, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", borderTop: "1px solid #F1F5F9" }, ex || {}) }, ch); };
  var mine = base.summary.endTotal;
  // 到達月の差 2026-08-05b（ユーザー要望③）＝「Aに乗れば◯ヶ月早い」まで出す。
  // 基準は「今の前提」の本(self)。それが期間内に届かない場合は差を出せないので、その旨を添えて月だけ出す。
  var tgt = list[0] ? list[0].reachTarget : 1000;
  var baseYm = null;
  for (var bi = 0; bi < list.length; bi++) { if (list[bi].self) { baseYm = list[bi].reachYm; break; } }
  var baseIdx = baseYm ? _dtsYmToIdx(baseYm) : null;
  var reachCell = function(o) {
    if (!o.reachYm) return React.createElement("span", { style: { color: "#9CA3AF" } }, "期間内に届かない");
    var lbl = React.createElement("span", { style: { fontWeight: 700 } }, _dtsYmLbl(o.reachYm));
    if (o.self) return lbl;
    if (baseIdx == null) return React.createElement("span", null, lbl,
      React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#047857", marginLeft: 3 } }, "（今の前提では届かない）"));
    var d = _dtsYmToIdx(o.reachYm) - baseIdx;
    var col = d === 0 ? "#9CA3AF" : (d < 0 ? "#047857" : "#B91C1C");
    var tag = d === 0 ? "同じ" : (d < 0 ? Math.abs(d) + "ヶ月早い" : d + "ヶ月遅い");
    return React.createElement("span", null, lbl,
      React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: col, marginLeft: 3 } }, "（" + tag + "）"));
  };
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, background: "#fff", overflowX: "auto" } },
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: _DTS_INK, padding: "7px 10px 4px" } }, "🎯 グレード感度",
      React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280", marginLeft: 6 } }, "1日あたり成績だけを差し替えて同じ前提を回し直した結果")),
    React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 620 } },
      React.createElement("thead", null, React.createElement("tr", null, [th("前提"), th("期末 総資産"), th("今との差"), th("期末 株数"), th("手取り合計"),
        th(tgt.toLocaleString() + "株に届く月", "（）内は実績の前提と比べて何ヶ月早い／遅いか。基礎取引株数が1,000株以上のときは目標を次の500株刻みに繰り上げます")])),
      React.createElement("tbody", null, list.map(function(o) {
        var s = o.res.summary, diff = s.endTotal - mine;
        var g = (typeof _profitGradeFromPnl === "function") ? _profitGradeFromPnl(Math.round(o.perDay), 1) : null;
        return React.createElement("tr", { key: o.key, style: { background: o.self ? _DTS_BG : "#fff" } }, [
          td("l", React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
            (typeof _elHoldGradeBadge === "function" && g) ? _elHoldGradeBadge(g) : null,
            React.createElement("span", { style: { fontWeight: o.self ? 800 : 700, color: o.self ? _DTS_INK : "#374151" } }, o.lbl)), { textAlign: "left" }),
          td("t", React.createElement("span", { style: { fontWeight: 800, color: "#047857" } }, _dtsFmtMan(s.endTotal))),
          // 色は月次表と同じ慣習に揃える＝増える赤／減る緑 2026-08-05B（すぐ上の表と逆だった）
          td("d", o.self ? React.createElement("span", { style: { color: _DTS_ZERO } }, "—")
            : React.createElement("span", { style: { fontWeight: 700, color: diff === 0 ? _DTS_ZERO : (diff > 0 ? _DTS_UP : _DTS_DOWN) } }, (diff >= 0 ? "＋" : "−") + _dtsFmtMan(Math.abs(diff)))),
          td("s", s.endShares.toLocaleString() + "株"),
          td("n", _dtsFmtMan(s.net)),
          td("r", reachCell(o))
        ]);
      }))));
}
