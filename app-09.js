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
//   stepAmount, stepShares, maxShares,
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
  var taxRate   = (cfg.taxRate == null || cfg.taxRate === "") ? 0.20315 : +cfg.taxRate;
  var perDay    = +cfg.dailyPer100 || 0;
  var stepAmt   = Math.max(1, +cfg.stepAmount || 250000);
  var stepSh    = Math.max(1, +cfg.stepShares || 100);
  var maxSh     = _dtsNumOrNull(cfg.maxShares);          // null＝上限なし
  var mainPrice = +cfg.mainPrice || 0;
  var marginRt  = +cfg.marginRate || 0.30;

  var capital = +cfg.initialCapital || 0;
  var living  = +cfg.initialLiving  || 0;
  var shares  = Math.max(0, +cfg.initialShares || 0);

  // 株数ラダーの基準点。「開始時の取引資金から何円増えたか」で段数を数える。
  // ⚠️外部資金の投入は利益ではないので、投入月にここを張り替えないと投入額の分だけ株数が跳ねる。
  var base = capital, baseShares = shares;

  var inj    = (cfg.injection && cfg.injection.ym) ? cfg.injection : null;
  var injIdx = inj ? _dtsYmToIdx(inj.ym) : null;
  var injTotal = 0;

  var rows = [], prevShares = shares;

  for (var k = 0; k < n; k++) {
    var ym = _dtsIdxToYm(sIdx + k);
    var capOpen = capital;   // 月初の取引資金＝バッファ・余力使用率の判定に使う（当月の利益は含めない）
    var injected = 0, stepUp = false;

    // ① 外部資金の投入（該当月のみ）。この月は株数ルールをスキップし、指定株数へジャンプする。
    if (injIdx != null && injIdx === sIdx + k) {
      injected = +inj.amount || 0;
      capital += injected;
      injTotal += injected;
      var sa = _dtsNumOrNull(inj.sharesAfter);
      if (sa != null && sa > 0) shares = sa;
      base = capital; baseShares = shares;   // ★基準点の張り替え
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
      toLiving: toLiving, livingOpen: livOpen, living: living,
      capitalOpen: capOpen, capital: capital,
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
    gross: 0, tax: 0, net: 0, expense: 0, toLiving: 0, injection: injTotal
  };
  for (var i = 0; i < rows.length; i++) {
    sum.gross    += rows[i].gross;
    sum.tax      += rows[i].tax;
    sum.net      += rows[i].net;
    sum.expense  += rows[i].expense;
    sum.toLiving += rows[i].toLiving;
  }
  var last = rows[rows.length - 1] || null;
  sum.endCapital = last ? last.capital : (+cfg.initialCapital || 0);
  sum.endLiving  = last ? last.living  : (+cfg.initialLiving  || 0);
  sum.endTotal   = sum.endCapital + sum.endLiving;
  sum.endOwnBase = sum.endTotal - injTotal;
  sum.endShares  = last ? last.shares : (+cfg.initialShares || 0);
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
    if (r.shortMargin) marks.push({ ym: r.ym, kind: "warn", text: _dtsYmLbl(r.ym) + "  ⚠ 保証金不足 " + Math.round(-r.buffer).toLocaleString() + "円（" + r.shares + "株を建てられない）" });
    if (!worst || r.buffer < worst.buffer) worst = r;
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
  if (!mine.error) out.push({ key: "now", lbl: "実績 " + Math.round(+cfg.dailyPer100 || 0).toLocaleString() + "円/日", perDay: +cfg.dailyPer100 || 0, self: true, res: mine });
  for (i = 0; i < _DTS_SENS.length; i++) {
    var s = _DTS_SENS[i];
    var c2 = {}; for (var k in cfg) { if (Object.prototype.hasOwnProperty.call(cfg, k)) c2[k] = cfg[k]; }
    c2.dailyPer100 = s.perDay;
    var r = _dtsSimulate(c2);
    if (!r.error) out.push({ key: s.key, lbl: s.lbl, perDay: s.perDay, self: false, res: r });
  }
  // 目標株数（例:1000株）に届く月を各本で拾う。比較表の1列に使う。
  for (i = 0; i < out.length; i++) {
    var rs = out[i].res.rows, hit = null;
    for (var j = 0; j < rs.length; j++) { if (rs[j].shares >= 1000) { hit = rs[j].ym; break; } }
    out[i].reach1000 = hit;
  }
  return out;
}

// ---- 表示ヘルパー --------------------------------------------------------
// 表示は万円・小数第1位まで（依頼メモ§7）。内部計算は円のまま丸めない。
var _DTS_INK = "#1E3A8A", _DTS_SUB = "#3B82F6", _DTS_BG = "#EFF6FF", _DTS_BD = "#BFDBFE";
function _dtsFmtYen(v) { if (v == null || !isFinite(v)) return "—"; return Math.round(v).toLocaleString(); }
function _dtsFmtMan(v) { if (v == null || !isFinite(v)) return "—"; return (Math.round(v / 1000) / 10).toLocaleString() + "万"; }
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
    stepAmount: 250000, stepShares: 100, maxShares: 3000,
    mainPrice: 6500, marginRate: 0.30,
    injection: { ym: "", amount: 0, sharesAfter: 0 }
  };
}

// 数値入力。unit="man"＝円で持って万円で入出力／"pct"＝小数で持って%で入出力／既定＝そのまま。
// 入力中は draft(生の文字列)を優先して表示する＝「1」と打った瞬間に1万円へ正規化されて
// 続きが打てなくなるのを防ぐ。blur で draft を捨てて正規表示に戻す。
function DtsNum(props) {
  var _d = useState(null), draft = _d[0], setDraft = _d[1];
  var unit = props.unit || "raw";
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
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3 } },
    React.createElement("input", {
      type: "text", inputMode: "decimal", placeholder: props.placeholder || "",
      value: draft != null ? draft : toDisp(props.value),
      onChange: function(e) { var s = e.target.value; setDraft(s); props.onChange(fromDisp(s)); },
      onBlur: function() { setDraft(null); },
      style: { width: props.width || 62, padding: "3px 5px", fontSize: 11.5, fontWeight: 700, textAlign: "right",
        border: "1px solid " + _DTS_BD, borderRadius: 5, background: "#fff", color: "#1F2937", fontVariantNumeric: "tabular-nums" }
    }),
    props.suffix ? React.createElement("span", { style: { fontSize: 10, color: "#6B7280", fontWeight: 700 } }, props.suffix) : null);
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
      _dtsLbl("月間営業日"), React.createElement(DtsNum, { key: "bd", value: cfg.businessDays, width: 42, suffix: "日", onChange: function(v) { set("businessDays", v); } })
    ])),
    _dtsSec("② 今の状態", null, _dtsRow([
      _dtsLbl("取引資金"), React.createElement(DtsNum, { key: "ic", value: cfg.initialCapital, unit: "man", suffix: "万円", onChange: function(v) { set("initialCapital", v); } }),
      _dtsLbl("生活口座"), React.createElement(DtsNum, { key: "il", value: cfg.initialLiving, unit: "man", suffix: "万円", onChange: function(v) { set("initialLiving", v); } }),
      _dtsLbl("基礎取引株数"), React.createElement(DtsNum, { key: "is", value: cfg.initialShares, width: 52, suffix: "株", onChange: function(v) { set("initialShares", v); } })
    ])),
    _dtsSec("③ 収益の前提", "記録帳と同じ単位（1日あたり・100株換算）", React.createElement("div", null,
      _dtsRow([
        _dtsLbl("1日あたり"), React.createElement(DtsNum, { key: "dp", value: cfg.dailyPer100, width: 68, suffix: "円/100株", onChange: function(v) { set("dailyPer100", v); } }),
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
          React.createElement(DtsNum, { value: r.amount, unit: "man", suffix: "万円", onChange: function(v) { setRow("livingCost", i, "amount", v); } }),
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
          (r.mode === "fill") ? null : React.createElement(DtsNum, { value: r.amount, unit: "man", suffix: "万円/月", onChange: function(v) { setRow("drip", i, "amount", v); } }),
          _dtsLbl("目標残高"),
          React.createElement(DtsNum, { value: r.target, unit: "man", suffix: "万円", placeholder: "無制限", onChange: function(v) { setRow("drip", i, "target", v); } }),
          (cfg.drip.length > 1) ? React.createElement("button", { onClick: function() { delRow("drip", i); }, style: { fontSize: 10, color: "#B91C1C", background: "none", border: "none", cursor: "pointer" } }, "🗑") : null);
      }),
      React.createElement("button", { onClick: function() { addRow("drip", { from: cfg.startYm, mode: "drip", amount: 50000, target: null }); }, style: { fontSize: 10, fontWeight: 700, color: _DTS_INK, background: _DTS_BG, border: "1px solid " + _DTS_BD, borderRadius: 6, padding: "3px 8px", cursor: "pointer" } }, "＋ 途中で変える")
    )),
    _dtsSec("⑥ 株数を増やすルール", "判定は前月末の取引資金・端数は次段へ繰り越し・資金が減っても下げない", _dtsRow([
      _dtsLbl("開始時から"), React.createElement(DtsNum, { key: "sa", value: cfg.stepAmount, unit: "man", suffix: "万円" , onChange: function(v) { set("stepAmount", v); } }),
      _dtsLbl("増えるごとに"), React.createElement(DtsNum, { key: "ss", value: cfg.stepShares, width: 46, suffix: "株", onChange: function(v) { set("stepShares", v); } }),
      _dtsLbl("上限"), React.createElement(DtsNum, { key: "ms", value: cfg.maxShares, width: 56, suffix: "株", placeholder: "無制限", onChange: function(v) { set("maxShares", v); } })
    ])),
    _dtsSec("⑦ 余力チェック", "拘束額＝株数×株価／必要保証金＝拘束額×保証金率", React.createElement("div", null,
      _dtsRow([
        _dtsLbl("メイン株価"), React.createElement(DtsNum, { key: "mp", value: cfg.mainPrice, width: 62, suffix: "円", onChange: function(v) { set("mainPrice", v); } }),
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
      _dtsLbl("に"), React.createElement(DtsNum, { key: "ia", value: (cfg.injection || {}).amount, unit: "man", suffix: "万円", onChange: function(v) { setInj("amount", v); } }),
      _dtsLbl("投入 → 直後の株数"), React.createElement(DtsNum, { key: "is2", value: (cfg.injection || {}).sharesAfter, width: 56, suffix: "株", onChange: function(v) { setInj("sharesAfter", v); } })
    ]))
  );

  if (res.error) {
    return React.createElement("div", null, _dtsHeader(openIn, setOpenIn, doSave, saveMsg), inputPanel,
      React.createElement("div", { style: { color: "#B91C1C", fontSize: 12, fontWeight: 700, textAlign: "center", padding: "18px 0" } }, res.error));
  }

  return React.createElement("div", null,
    _dtsHeader(openIn, setOpenIn, doSave, saveMsg), inputPanel,
    _dtsSummaryCards(res, cfg),
    _dtsTable(res),
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
  return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 } }, [
    card("期末 総資産", _dtsFmtMan(s.endTotal), _dtsYmLbl(s.endYm) + "末", "#047857"),
    card("期末 取引資金", _dtsFmtMan(s.endCapital), "＋" + _dtsFmtMan(s.capitalGain)),
    card("期末 生活口座", _dtsFmtMan(s.endLiving), null),
    card("期末 株数", s.endShares.toLocaleString() + "株", (+cfg.initialShares || 0) + "株 から"),
    card("自己資金ベース", _dtsFmtMan(s.endOwnBase), s.injection ? "外部 " + _dtsFmtMan(s.injection) + " を除く" : "外部資金なし"),
    card("手取り合計", _dtsFmtMan(s.net), "税 " + _dtsFmtMan(s.tax) + " 控除後", "#9A3412")
  ]);
}

function _dtsTable(res) {
  var th = function(t, w) { return React.createElement("th", { key: t, style: { padding: "4px 5px", fontSize: 9.5, fontWeight: 800, color: "#6B7280", borderBottom: "1px solid " + _DTS_BD, whiteSpace: "nowrap", textAlign: "center", minWidth: w || 0 } }, t); };
  var td = function(k, ch, ex) { return React.createElement("td", { key: k, style: Object.assign({ padding: "3px 5px", fontSize: 10.5, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", borderTop: "1px solid #F1F5F9" }, ex || {}) }, ch); };
  var rows = res.rows.map(function(r, i) {
    var tone = _dtsUseTone(r.powerUse, r.shortMargin);
    var beG = (typeof _profitGradeFromPnl === "function" && r.bePerDay != null) ? _profitGradeFromPnl(Math.round(r.bePerDay), 1) : null;
    return React.createElement("tr", { key: r.ym, style: { background: tone.bg || (i % 2 ? "#FAFAFA" : "#fff") } }, [
      td("ym", React.createElement("span", { style: { fontWeight: 800, color: _DTS_INK } }, r.lbl), { textAlign: "left", borderLeft: r.stepUp ? "3px solid " + _DTS_SUB : "3px solid transparent" }),
      td("sh", React.createElement("span", { style: { fontWeight: 800, color: r.stepUp ? _DTS_SUB : "#374151" } }, r.shares.toLocaleString() + (r.stepUp ? " ↑" : ""))),
      td("gr", _dtsFmtMan(r.gross)),
      td("tx", React.createElement("span", { style: { color: "#9CA3AF" } }, "−" + _dtsFmtMan(r.tax))),
      td("net", _dtsFmtMan(r.net)),
      td("ex", React.createElement("span", { style: { color: "#B45309" } }, "−" + _dtsFmtMan(r.expense))),
      td("tl", _dtsFmtMan(r.toLiving)),
      td("lv", React.createElement("span", { style: { fontWeight: 700 } }, _dtsFmtMan(r.living))),
      td("cp", React.createElement("span", { style: { fontWeight: 800, color: _DTS_INK } }, _dtsFmtMan(r.capital))),
      td("to", React.createElement("span", { style: { fontWeight: 800, color: "#047857" } }, _dtsFmtMan(r.total))),
      td("bf", React.createElement("span", { style: { color: r.shortMargin ? "#B91C1C" : "#374151", fontWeight: r.shortMargin ? 800 : 400 } }, _dtsFmtMan(r.buffer))),
      td("pu", React.createElement("span", { style: { fontWeight: 800, color: tone.ink || "#374151" } }, _dtsFmtPct(r.powerUse) + (tone.lbl ? " " + tone.lbl : ""))),
      td("be", React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, justifyContent: "flex-end" } },
        (typeof _elHoldGradeBadge === "function" && beG) ? _elHoldGradeBadge(beG) : null,
        React.createElement("span", null, _dtsFmtYen(r.bePerDay))))
    ]);
  });
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, background: "#fff", overflowX: "auto", marginBottom: 8 } },
    React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 900 } },
      React.createElement("thead", null, React.createElement("tr", null, [
        th("年月"), th("株数"), th("税引前"), th("税"), th("手取り"), th("生活費"), th("積立"), th("生活口座"), th("月末取引資金"), th("総資産"), th("バッファ"), th("余力使用率"), th("損益分岐/日/100株")
      ])),
      React.createElement("tbody", null, rows)));
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
  var th = function(t) { return React.createElement("th", { key: t, style: { padding: "4px 6px", fontSize: 9.5, fontWeight: 800, color: "#6B7280", borderBottom: "1px solid " + _DTS_BD, whiteSpace: "nowrap", textAlign: "center" } }, t); };
  var td = function(k, ch, ex) { return React.createElement("td", { key: k, style: Object.assign({ padding: "4px 6px", fontSize: 11, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", borderTop: "1px solid #F1F5F9" }, ex || {}) }, ch); };
  var mine = base.summary.endTotal;
  return React.createElement("div", { style: { border: "1px solid " + _DTS_BD, borderRadius: 9, background: "#fff", overflowX: "auto" } },
    React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: _DTS_INK, padding: "7px 10px 4px" } }, "🎯 グレード感度",
      React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: "#6B7280", marginLeft: 6 } }, "1日あたり成績だけを差し替えて同じ前提を回し直した結果")),
    React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 620 } },
      React.createElement("thead", null, React.createElement("tr", null, [th("前提"), th("期末 総資産"), th("今との差"), th("期末 株数"), th("手取り合計"), th("1,000株に届く月")])),
      React.createElement("tbody", null, list.map(function(o) {
        var s = o.res.summary, diff = s.endTotal - mine;
        var g = (typeof _profitGradeFromPnl === "function") ? _profitGradeFromPnl(Math.round(o.perDay), 1) : null;
        return React.createElement("tr", { key: o.key, style: { background: o.self ? _DTS_BG : "#fff" } }, [
          td("l", React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
            (typeof _elHoldGradeBadge === "function" && g) ? _elHoldGradeBadge(g) : null,
            React.createElement("span", { style: { fontWeight: o.self ? 800 : 700, color: o.self ? _DTS_INK : "#374151" } }, o.lbl)), { textAlign: "left" }),
          td("t", React.createElement("span", { style: { fontWeight: 800, color: "#047857" } }, _dtsFmtMan(s.endTotal))),
          td("d", o.self ? React.createElement("span", { style: { color: "#9CA3AF" } }, "—")
            : React.createElement("span", { style: { fontWeight: 700, color: diff >= 0 ? "#047857" : "#B91C1C" } }, (diff >= 0 ? "＋" : "−") + _dtsFmtMan(Math.abs(diff)))),
          td("s", s.endShares.toLocaleString() + "株"),
          td("n", _dtsFmtMan(s.net)),
          td("r", o.reach1000 ? _dtsYmLbl(o.reach1000) : React.createElement("span", { style: { color: "#9CA3AF" } }, "期間内に届かない"))
        ]);
      }))));
}
