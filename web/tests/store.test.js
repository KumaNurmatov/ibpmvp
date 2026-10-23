/**
 * Проверки хранилища — про пути, а не про цифры.
 *
 * Правки с сайта месяц уходили в никуда: страница читала data/orders.json
 * рядом с собой, а писала по тому же пути через GitHub API — то есть в
 * корень репозитория, в файл, которого сайт не видит. Коммиты создавались,
 * «сохранено» показывалось, данные не менялись.
 *
 * Поэтому здесь сверяются три вещи: путь для записи ведёт в дерево
 * репозитория, путь для чтения — внутрь web/, и файл по этому пути
 * действительно существует.
 */
import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_PATH, SITE_PATH, blankOrder, photoSitePath, safeName } from "../lib/store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("путь к данным", () => {
  it("путь в репозитории — это путь страницы внутри web/", () => {
    assert.equal(REPO_PATH, `web/${SITE_PATH}`);
  });

  it("файл по этому пути есть в репозитории", () => {
    assert.ok(existsSync(path.join(root, REPO_PATH)), `нет файла ${REPO_PATH}`);
  });

  it("и это именно данные заказов, а не что-то однофамильное", () => {
    const data = JSON.parse(readFileSync(path.join(root, REPO_PATH), "utf8"));
    assert.ok(Array.isArray(data.orders), "в файле нет списка заказов");
  });

  it("в корне репозитория такого файла быть не должно", () => {
    // Он там появлялся сам, как след той самой ошибки, и сбивал с толку.
    assert.ok(!existsSync(path.join(root, SITE_PATH)),
      `${SITE_PATH} в корне — это дубль, который сайт не читает`);
  });
});

describe("путь к фото", () => {
  it("имя файла собирается из ключа заказа", () => {
    assert.equal(photoSitePath("666"), "assets/photos/666.jpg");
    assert.equal(photoSitePath("666/1-1"), "assets/photos/666-1-1.jpg");
    assert.equal(photoSitePath("666", 2), "assets/photos/666-2.jpg", "второй снимок рядом с первым");
  });

  it("кириллица и пробелы в ключе не ломают путь", () => {
    assert.equal(safeName("Аи 13.04.26/4"), "Аи-13.04.26-4");
    assert.ok(!photoSitePath("а/б в").includes("/", "assets/photos/".length));
  });

  it("пустой ключ не даёт файла без имени", () => {
    assert.equal(safeName("   "), "order");
  });
});

describe("пустая карточка", () => {
  it("приходит с готовыми разделами, а не голым объектом", () => {
    const blank = blankOrder();
    assert.deepEqual(blank.payments, []);
    assert.deepEqual(blank.links, []);
    assert.deepEqual(blank.workshops, []);
    assert.equal(blank.acceptance.accepted_qty, null);
    assert.equal(blank.terms.prepay_percent, 50);
    // Срок не подставляется: иначе сайт заявит просрочку по выдуманному условию.
    assert.equal(blank.terms.lead_time_days, null);
  });
});
