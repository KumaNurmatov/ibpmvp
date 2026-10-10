/**
 * Картинка изделия для карточки заказа.
 *
 * Фотографий у нас нет, а карточка без картинки читается хуже: глаз цепляется
 * за силуэт быстрее, чем за строку «костюм джерси». Поэтому силуэт рисуется
 * прямо здесь по названию изделия — ничего не грузится из сети, работает и в
 * закрытом репозитории, и без интернета.
 *
 * Если у заказа есть своя ссылка на фото (поле photo), берётся она.
 */

// Ключевые слова → силуэт. Порядок важен: «костюм с шортами» это костюм.
const KINDS = [
  [/костюм|комплект/i, "suit"],
  [/куртк|ветровк|парк|пальто|пухов/i, "jacket"],
  [/плать|сарафан|туник/i, "dress"],
  [/брюк|штан|джинс|леггинс/i, "trousers"],
  [/шорт/i, "shorts"],
  [/юбк/i, "skirt"],
  [/рубаш|блуз|сороч/i, "shirt"],
  [/водолазк|свитер|джемпер|худи|толстовк|лонгслив/i, "sweater"],
  [/футболк|поло|майк/i, "tee"],
];

/** Палитра фонов — спокойные, чтобы не спорить со статусом на карточке. */
const TINTS = ["#e8eef9", "#fdeee6", "#e6f4ea", "#f1ecfa", "#fdf3e0", "#e4f2f2"];
const INK = "#5b6472";

export function photoFor(order) {
  if (order.photo) return { url: order.photo, generated: false };
  const name = order.get("item") || "";
  const kind = (KINDS.find(([re]) => re.test(name)) || [, "fabric"])[1];
  const tint = TINTS[hash(order.key + name) % TINTS.length];
  return { url: svg(kind, tint), generated: true, kind };
}

/** Силуэт изделия: плоский, одноцветный, читается и в 120 px. */
function svg(kind, tint) {
  const body = SHAPES[kind] || SHAPES.fabric;
  // Полотно под пропорции карточки (20:9), силуэт нарисован в поле 200×140 —
  // поэтому он вписывается, а не обрезается по краям.
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 90">
    <rect width="200" height="90" fill="${tint}"/>
    <g fill="${INK}" fill-opacity=".82" transform="translate(40 3) scale(0.6)">${body}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}

const SHAPES = {
  // Рубашка: плечи, рукава, воротник уголком.
  shirt: `<path d="M78 34 60 42 44 56l12 14 10-9v47a4 4 0 0 0 4 4h60a4 4 0 0 0 4-4V61l10 9 12-14-16-14-18-8-22 10z"/>
          <path d="M92 32h16l-8 14z" fill="#fff" fill-opacity=".85"/>`,
  // Блузка от рубашки отличается мягкой линией низа — отдельной формы не надо.
  sweater: `<path d="M76 36 56 46 40 62l13 14 11-10v44a4 4 0 0 0 4 4h64a4 4 0 0 0 4-4V66l11 10 13-14-16-16-20-10-24 8z"/>
            <rect x="86" y="30" width="28" height="9" rx="4"/>`,
  tee: `<path d="M80 36 58 46 44 60l12 13 10-9v42a4 4 0 0 0 4 4h60a4 4 0 0 0 4-4V64l10 9 12-13-14-14-22-10a22 14 0 0 1-40 0z"/>`,
  jacket: `<path d="M78 34 58 44 42 60l13 14 9-8v46a4 4 0 0 0 4 4h26V48z"/>
           <path d="M122 34l20 10 16 16-13 14-9-8v46a4 4 0 0 1-4 4h-26V48z"/>
           <rect x="97" y="56" width="6" height="60" rx="3" fill="#fff" fill-opacity=".7"/>`,
  trousers: `<path d="M72 26h56l6 28-6 62h-22l-6-54-6 54H72l-6-62z"/>
             <rect x="70" y="26" width="60" height="8" rx="4" fill="#fff" fill-opacity=".6"/>`,
  shorts: `<path d="M74 34h52l5 22-5 32h-20l-6-28-6 28H74l-5-32z"/>
           <rect x="72" y="34" width="56" height="7" rx="3" fill="#fff" fill-opacity=".6"/>`,
  skirt: `<path d="M78 32h44l16 78a4 4 0 0 1-4 5H66a4 4 0 0 1-4-5z"/>
          <rect x="76" y="28" width="48" height="8" rx="4" fill="#fff" fill-opacity=".6"/>`,
  dress: `<path d="M80 28 62 38l8 16 8-6-14 62a4 4 0 0 0 4 5h64a4 4 0 0 0 4-5l-14-62 8 6 8-16-18-10-20 8z"/>`,
  // Костюм — верх и низ рядом: по нему комплект узнаётся сразу.
  suit: `<path d="M58 30 42 38 30 50l10 11 8-7v38a3 3 0 0 0 3 3h46a3 3 0 0 0 3-3V54l8 7 10-11-12-12-16-8-16 8z"/>
         <path d="M128 36h42l5 22-5 56h-16l-5-44-5 44h-16l-5-56z"/>`,
  fabric: `<rect x="40" y="46" width="120" height="18" rx="6"/>
           <rect x="48" y="72" width="104" height="18" rx="6" fill-opacity=".6"/>
           <rect x="56" y="98" width="88" height="18" rx="6" fill-opacity=".4"/>`,
};

function hash(text) {
  let h = 0;
  for (const ch of String(text)) h = (h * 31 + ch.codePointAt(0)) % 100000;
  return h;
}
