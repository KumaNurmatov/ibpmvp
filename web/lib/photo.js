/**
 * Картинка изделия для карточки заказа.
 *
 * Фотографий у нас нет, а карточка без картинки читается хуже: глаз цепляется
 * за силуэт быстрее, чем за строку «костюм джерси». Поэтому к каждому виду
 * изделия приложена своя объёмная иконка — она лежит в репозитории рядом со
 * страницей (assets/items), ничего не грузится со стороны.
 *
 * Если у заказа есть своя ссылка на фото (поле photo), берётся она. Снимков
 * у изделия может быть два (photo и photo2): в списке заказов виден первый,
 * в карточке заказа — оба, крупно.
 */

// Ключевые слова → иконка. Порядок важен: «костюм с шортами» это костюм.
const KINDS = [
  [/костюм|комплект|двойк|тройк/i, "suit"],
  [/куртк|ветровк|парк|пальто|пухов|бомбер|жилет/i, "jacket"],
  [/плать|сарафан|туник/i, "dress"],
  [/брюк|штан|джинс|леггинс|комбинезон/i, "trousers"],
  [/шорт/i, "shorts"],
  [/юбк/i, "skirt"],
  [/блуз|сороч/i, "blouse"],
  [/рубаш/i, "shirt"],
  [/водолазк|свитер|джемпер|худи|толстовк|лонгслив|кофт/i, "sweater"],
  [/футболк|поло|майк/i, "tee"],
];

/** Запасная иконка — стопка ткани: вид изделия не угадали, но это товар. */
const FALLBACK = "fabric";

export function photoFor(order) {
  const kind = kindOf(order.get("item"));
  const drawn = `./assets/items/${kind}.webp`;
  if (order.photo) return { url: order.photo, fallback: drawn, generated: false, kind };
  return { url: drawn, fallback: drawn, generated: true, kind };
}

/**
 * Картинка заказа тегом. Если своё фото ещё не выложилось (сайт
 * пересобирается с минуту) или файла не стало, подставляется рисунок —
 * пустой рамки на месте изделия не бывает.
 */
export function photoImg(order, { className = "", alt = "", attrs = "" } = {}) {
  const { url, fallback, generated } = photoFor(order);
  const swap = url === fallback ? "" :
    // Если файл не загрузился, рисунок вписывается целиком, а не обрезается.
    ` onerror="this.onerror=null;this.classList.remove('own');this.src='${fallback}'"`;
  // Своё фото заполняет рамку 3:4 целиком; рисунок вписывается с полями.
  const cls = [className, generated ? "" : "own"].filter(Boolean).join(" ");
  return `<img class="${cls}" src="${url}" alt="${alt}" loading="lazy"${swap} ${attrs}>`;
}

/** Свои снимки изделия, без рисунков: для галереи в карточке заказа. */
export function ownPhotos(order) {
  return [order.photo, order.photo2].filter(Boolean);
}

export function kindOf(item) {
  return (KINDS.find(([re]) => re.test(item || "")) || [, FALLBACK])[1];
}
