// Рендер серии постеров LOFT в формате A1 (594 x 841 мм).
// Запуск:  node render.js
// Выход:   out/*.pdf  (печать, A1 + 3 мм вылеты)  и  out/*.jpg (превью 150 dpi)

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const MM_TO_PX = 96 / 25.4;      // CSS-пиксели на мм
const BLEED_MM = 3;              // вылеты под обрез

const POSTERS = [
  {
    id: '01-sokrat',
    hero: 'assets/photo-facade-brick.jpg',
    s1:   'assets/photo-townhouse.jpg',
    s2:   'assets/photo-interior.jpg',
    quote: '«Заговори, чтобы я тебя увидел»',
    author: 'Сократ',
  },
  {
    id: '02-platon',
    hero: 'assets/photo-townhouse.jpg',
    s1:   'assets/photo-interior.jpg',
    s2:   'assets/photo-facade-brick.jpg',
    quote: '«Хорошее начало — половина дела»',
    author: 'Платон',
  },
  {
    id: '03-aitmatov',
    hero: 'assets/photo-interior.jpg',
    s1:   'assets/photo-facade-brick.jpg',
    s2:   'assets/photo-townhouse.jpg',
    quote: '«Человек, лишённый памяти прошлого, перестаёт быть человеком»',
    author: 'Чынгыз Айтматов',
  },
];

function url(p, bleedMm) {
  const q = new URLSearchParams({
    hero: p.hero, s1: p.s1, s2: p.s2,
    quote: p.quote, author: p.author,
    bleed: String(bleedMm),
  });
  if (p.kicker) q.set('kicker', p.kicker);
  if (p.fleft) q.set('fleft', p.fleft);
  if (p.fright) q.set('fright', p.fright);
  return 'file://' + path.join(__dirname, 'poster.html') + '?' + q.toString();
}

(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const browser = await chromium.launch();

  for (const p of POSTERS) {
    // --- PDF под печать: A1 + вылеты, текст остаётся векторным ---
    const pdfPage = await browser.newPage();
    await pdfPage.goto(url(p, BLEED_MM), { waitUntil: 'networkidle' });
    await pdfPage.evaluate(() => document.fonts.ready);
    await pdfPage.pdf({
      path: path.join(__dirname, 'out', `loft-a1-${p.id}.pdf`),
      width:  `${594 + BLEED_MM * 2}mm`,
      height: `${841 + BLEED_MM * 2}mm`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await pdfPage.close();

    // --- JPEG-превью 150 dpi, без вылетов ---
    const shotPage = await browser.newPage({
      viewport: { width: Math.round(594 * MM_TO_PX), height: Math.round(841 * MM_TO_PX) },
      deviceScaleFactor: 150 / 96,
    });
    await shotPage.goto(url(p, 0), { waitUntil: 'networkidle' });
    await shotPage.evaluate(() => document.fonts.ready);
    await shotPage.screenshot({
      path: path.join(__dirname, 'out', `loft-a1-${p.id}.jpg`),
      type: 'jpeg', quality: 92,
    });
    await shotPage.close();

    console.log('готово:', p.id);
  }

  await browser.close();
})();
