/**
 * ExcelJS собран как UMD, модулем его не импортировать — подключаем тегом
 * script и ждём появления глобали. Вынесено сюда, чтобы остальной код об этой
 * особенности не знал и мог просто дождаться load().
 */
const SRC = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";

let promise = null;

export function load() {
  if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = SRC;
      tag.onload = () => window.ExcelJS
        ? resolve(window.ExcelJS)
        : reject(new Error("ExcelJS загрузился, но глобали нет"));
      tag.onerror = () => reject(new Error("не удалось загрузить ExcelJS"));
      document.head.appendChild(tag);
    });
  }
  return promise;
}
