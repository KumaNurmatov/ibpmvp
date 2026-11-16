/**
 * Документы и цвета заказа: вид документа по названию, адреса Drive для
 * просмотра и скачивания, подбор оттенка по названию цвета.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { colorList, guessHex, normalizeColors } from "../lib/colors.js";
import { docsOf, driveId, guessKind, haystack, kindOf } from "../lib/documents.js";
import { orderFromRecord } from "../lib/ledger.js";
import { blankOrder } from "../lib/store.js";

const FILE = "https://drive.google.com/file/d/1rmvYQOWgGchbQQo9nrVjKlUwwEPMytiE/view?usp=drive_link";
const FOLDER = "https://drive.google.com/drive/folders/14WXPFIq_emuFipzVRwFI9TiOwtGCsMHY";

describe("вид документа", () => {
  it("угадывается по имени файла, как их называли раньше", () => {
    assert.equal(guessKind("спец дог 1084 айзада.pdf"), "спецификация");
    assert.equal(guessKind("513 дог_Учет Бишкек (NEW) - Айзада (Az).pdf"), "учёт");
    assert.equal(guessKind("отправка 399.pdf"), "отправка");
    assert.equal(guessKind("договор 1126 подписанный айзада.pdf"), "договор");
    assert.equal(guessKind("Заказы Айзада - 1092.pdf"), "заказ");
    assert.equal(guessKind("Папка заказа", FOLDER), "папка");
    assert.equal(guessKind("скан"), "прочее");
    assert.equal(guessKind("ТЗ дог 818 подписанный айзада.pdf"), "прочее");
    assert.equal(guessKind("ТЗ_КОСТЮМ_ФУКРА_Айзада_942_1.pdf"), "прочее");
  });

  it("указанный в карточке вид важнее догадки", () => {
    assert.equal(kindOf({ title: "отправка 399.pdf", url: FILE, kind: "учёт" }), "учёт");
    assert.equal(kindOf({ title: "отправка 399.pdf", url: FILE, kind: "что-то" }), "отправка");
  });
});

describe("адреса Drive", () => {
  it("номер файла и папки", () => {
    assert.equal(driveId(FILE), "1rmvYQOWgGchbQQo9nrVjKlUwwEPMytiE");
    assert.equal(driveId(FOLDER), "14WXPFIq_emuFipzVRwFI9TiOwtGCsMHY");
    assert.equal(driveId("https://drive.google.com/open?id=1rmvYQOWgGchbQQo9nrVjKlUwwEPMytiE"),
      "1rmvYQOWgGchbQQo9nrVjKlUwwEPMytiE");
    assert.equal(driveId("https://example.com/file/d/1rmvYQOWgGchbQQo9nrVjKlUwwEPMytiE"), null);
  });

  it("файл смотрится и скачивается, папка только смотрится", () => {
    const order = orderFromRecord({ id: "1", links: [
      { title: "Папка заказа", url: FOLDER },
      { title: "договор 1.pdf", url: FILE },
      { title: "сайт", url: "https://example.com/x.pdf" },
    ] });
    const [contract, folder, other] = docsOf(order);
    assert.equal(contract.kind, "договор");
    assert.equal(contract.preview, "https://drive.google.com/file/d/1rmvYQOWgGchbQQo9nrVjKlUwwEPMytiE/preview");
    assert.equal(contract.download, "https://drive.google.com/uc?export=download&id=1rmvYQOWgGchbQQo9nrVjKlUwwEPMytiE");
    assert.equal(folder.kind, "папка");
    assert.equal(folder.download, null);
    assert.match(folder.preview, /embeddedfolderview\?id=14WXPFIq/);
    assert.equal(other.preview, null);
  });

  it("договор находится по номеру и по имени файла", () => {
    const order = orderFromRecord({ id: "1147", contract_no: "1147/1-1", links: [{ title: "Отправка Ёлка.pdf", url: FILE }] });
    assert.ok(haystack(order).includes("1147/1-1"));
    assert.ok(haystack(order).includes("елка"));
  });
});

describe("цвета изделия", () => {
  it("оттенок по первому цвету в названии", () => {
    assert.equal(guessHex("Чёрно-белая клетка"), guessHex("черный"));
    assert.equal(guessHex("серо-бежевая"), guessHex("серый"));
    assert.notEqual(guessHex("серебристый"), guessHex("серый"));
    assert.notEqual(guessHex("тёмно-синий"), guessHex("синий"));
    assert.equal(guessHex("клетка голубая"), guessHex("голубой"));
    assert.equal(guessHex("принт №5"), "");
  });

  it("пустые строки выпадают, кривой оттенок обнуляется", () => {
    assert.deepEqual(normalizeColors([{ name: " Синий ", hex: "#2f5fcf" }, { name: "", hex: "" }, { name: "X", hex: "red" }]),
      [{ name: "Синий", hex: "#2f5fcf" }, { name: "X", hex: "" }]);
  });

  it("у новой карточки цветов нет", () => {
    assert.deepEqual(blankOrder().colors, []);
  });

  it("список: больше четырёх — в две колонки, без цвета — пунктир", () => {
    const many = colorList(Array.from({ length: 5 }, (_, i) => ({ name: `цвет ${i}`, hex: "#111111" })));
    assert.match(many, /class="colors many"/);
    assert.match(colorList([{ name: "принт", hex: "" }]), /class="none"/);
    assert.match(colorList([{ name: "синий", hex: "" }]), new RegExp(`--c:${guessHex("синий")}`));
    assert.equal(colorList([]), "");
    assert.match(colorList([{ name: "<b>", hex: "" }]), /&lt;b&gt;/);
  });
});
