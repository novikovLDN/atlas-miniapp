/**
 * Sanitize Telegram display names — block prohibited content,
 * Unicode attacks, homoglyph tricks, and oversized payloads.
 */

const FALLBACK = "Пользователь";
const MAX_CHARS = 64;
const MAX_BYTES = 256;

/* ── Homoglyphs: visual lookalikes → canonical Cyrillic lowercase ── */

const HOMOGLYPHS: Record<string, string> = {
  // Latin/Greek → Cyrillic
  a: "а", ɑ: "а", α: "а", A: "а", Α: "а",
  e: "е", E: "е", ε: "е", ё: "е", Ё: "е",
  o: "о", O: "о", "0": "о", Ο: "о", ο: "о",
  p: "р", P: "р", ρ: "р",
  c: "с", C: "с",
  y: "у", Y: "у",
  x: "х", X: "х",
  h: "н", H: "н",
  k: "к", K: "к",
  m: "м", M: "м",
  t: "т", T: "т",
  b: "в", B: "в",
  u: "и",
  d: "д",
  l: "л",
  g: "г",
  w: "ш",
  "3": "з",
  і: "и", i: "и", "1": "и", "|": "и",
};

/* ── Pre-compiled regex patterns (created once at module load) ── */

const RE_INVISIBLE = /[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\u00AD\u034F\u061C\u180E]/g;
const RE_COMBINING = /[\u0300-\u036F\u0483-\u0489\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g;
const RE_REPEATS = /(.)\1{2,}/g;
const RE_SEPARATORS = /([а-яa-z])[.\-_*•·/\\|,;:!?@#$%^&(){}[\]<>~`'"]+(?=[а-яa-z])/gi;

const RE_CONTROL = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u2800-\u28FF]/;
const RE_BIDI = /[\u202A-\u202E\u2066-\u2069]/;
const RE_CROSS_SCRIPT =
  /[\u0600-\u06FF].*[\u0400-\u04FF]|[\u0400-\u04FF].*[\u0600-\u06FF]|[\u4E00-\u9FFF]{10,}|[\u{10000}-\u{1F9FF}]{5,}/u;

/* ── Banned word patterns (checked against normalized string) ── */

const BANNED_PATTERNS = [
  // Drugs
  /мефедрон/i, /меф\b/i, /амфетамин/i, /кокаин/i, /кокс\b/i, /герои?н/i,
  /гашиш/i, /марихуан/i, /каннабис/i, /косяк/i,
  /экстази/i, /мдма/i, /лсд/i, /псилоцибин/i,
  /спайс/i, /снюс/i, /насвай/i, /закладк/i, /кладмен/i, /барыг/i,
  /наркот/i, /дурь\b/i, /шишк[иа]/i, /бошк/i,
  /фен\b/i, /соль\b/i, /солей\b/i, /кристалл/i, /скорост[ьи]/i,
  /метадон/i, /морфи[нй]/i, /опиат/i, /опиоид/i, /трамадол/i,
  /буторфанол/i, /кодеин/i, /барбитурат/i,
  /meth\b/i, /cocaine/i, /heroin/i, /weed\b/i, /drugs?\b/i, /mdma/i,
  /amphetamine/i, /cannabis/i, /marijuana/i, /ecstasy/i,
  // Porn / sex services
  /порн/i, /porn/i, /xxx/i, /секс\s?услуг/i, /эскорт/i, /escort/i,
  /проститу/i, /интим\s?услуг/i, /минет/i, /blowjob/i, /onlyfans/i,
  /хентай/i, /hentai/i, /шлюх/i, /сучк/i, /nsfw/i,
  /anal\b/i, /cum\b/i, /dick\b/i, /pussy/i, /fuck/i,
  // Scam / fraud
  /скам/i, /scam/i, /обнал/i, /дроп\b/i, /дроппер/i,
  /кардинг/i, /carding/i, /фишинг/i, /phishing/i,
  /лохотрон/i, /отмыв/i,
  // Weapons / violence
  /оружи/i, /ствол\b/i, /пистолет/i, /взрыв/i,
  /бомб[аы]/i, /убий/i, /убить/i, /террор/i, /jihad/i, /джихад/i,
  // Extremism / hate
  /нацизм/i, /нацист/i, /фашизм/i, /фашист/i, /свастик/i,
  /зиг\s?хайл/i, /sieg\s?heil/i, /white\s?power/i,
  /heil\s?hitler/i, /хайль/i, /14\s?88/i, /1488/i,
  // Gambling
  /казино/i, /casino/i, /букмекер/i,
  /джекпот/i, /jackpot/i, /1xbet/i, /1хбет/i, /пинап/i, /pin-?up/i,
  // CSAM
  /педофил/i, /child\s?porn/i, /cp\b/i, /лолик/i,
  // Slurs / profanity (ad-style)
  /бля[дт]/i, /пизд/i, /хуй/i, /хуя/i, /хуё/i, /ебат/i, /ёбан/i, /сука\b/i,
  /пидор/i, /пидар/i, /faggot/i, /nigger/i, /nigga/i,
];

/* ── Helpers ── */

function normalize(s: string): string {
  // Strip invisible chars and combining marks
  const clean = s.replace(RE_INVISIBLE, "").replace(RE_COMBINING, "");
  // Map homoglyphs to canonical form
  const chars: string[] = [];
  for (const ch of clean) {
    chars.push(HOMOGLYPHS[ch] ?? ch.toLowerCase());
  }
  return chars
    .join("")
    .replace(RE_REPEATS, "$1$1")       // ннааррккоо → ннааррккоо (collapse 3+)
    .replace(RE_SEPARATORS, "$1");      // н.а.р.к.о → нарко
}

/* ── Public API ── */

export function sanitizeName(raw: unknown): string {
  if (!raw || typeof raw !== "string") return FALLBACK;
  if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) return FALLBACK;

  const name = [...raw].slice(0, MAX_CHARS).join("").trim();
  if (!name) return FALLBACK;

  // Structural attacks
  if (RE_CONTROL.test(name) || RE_BIDI.test(name) || RE_CROSS_SCRIPT.test(name)) {
    return FALLBACK;
  }

  // Content filter on normalized form
  const norm = normalize(name);
  for (const re of BANNED_PATTERNS) {
    if (re.test(norm)) return FALLBACK;
  }

  // All-invisible name check
  if (!name.replace(RE_INVISIBLE, "").trim()) return FALLBACK;

  return name;
}
