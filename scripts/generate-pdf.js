const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const content = require('../data/content');

const OUTPUT_PATH = path.join(__dirname, '../public/files/pueden-pensar-los-peces.pdf');

const W  = 595.28;
const H  = 841.89;
const ML = 65;
const MR = 65;
const TW = W - ML - MR;
const FOOTER_Y = H - 45;

const C = {
  oceanDeep:  '#001529',
  oceanMid:   '#003366',
  oceanLight: '#005b8e',
  cyan:       '#00b4d8',
  biolum:     '#00f5d4',
  textLight:  '#e0f7ff',
  textMuted:  '#8ecae6',
  textDark:   '#1a2a3a',
  muted:      '#4a6070',
  border:     '#b8d4e8',
  bgLight:    '#eef6fc',
  white:      '#ffffff',
};

// ─── Measure helpers (always set font BEFORE measuring) ───────────────────────

function measureText(doc, text, font, size, width, lineGap) {
  doc.font(font).fontSize(size);
  return doc.heightOfString(text, { width, lineGap: lineGap || 0 });
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function newPage(doc) {
  doc.addPage();
  doc.rect(0, 0, W, H).fill(C.white);
}

function ensureSpace(doc, needed, y) {
  if (y + needed > FOOTER_Y - 10) {
    newPage(doc);
    return 55;
  }
  return y;
}

function pageFooter(doc, label) {
  doc.moveTo(ML, FOOTER_Y).lineTo(W - MR, FOOTER_Y)
    .strokeColor(C.border).lineWidth(0.5).stroke();
  doc.font('Helvetica').fontSize(7.5).fillColor(C.muted)
    .text('¿Pueden pensar los peces? — Jacinto', ML, FOOTER_Y + 7, { width: TW / 2 })
    .text(label, ML, FOOTER_Y + 7, { width: TW, align: 'right' });
}

// ─── Content blocks ───────────────────────────────────────────────────────────

function numBadge(doc, num, y) {
  const bw = 34, bh = 17;
  doc.roundedRect(ML, y, bw, bh, 3).fill(C.oceanMid);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.biolum)
    .text(num, ML, y + 4, { width: bw, align: 'center' });
  return y + bh + 10;
}

function sectionTitle(doc, text, y) {
  doc.font('Times-Bold').fontSize(22).fillColor(C.oceanDeep)
    .text(text, ML, y, { width: TW, lineGap: 2 });
  const lineY = doc.y + 6;
  doc.moveTo(ML, lineY).lineTo(W - MR, lineY)
    .strokeColor(C.border).lineWidth(1).stroke();
  return lineY + 14;
}

function introBox(doc, text, y) {
  const pad = 14;
  const innerW = TW - pad * 2 - 3;
  const textH = measureText(doc, text, 'Helvetica-Oblique', 10, innerW, 3);
  const boxH = textH + pad * 2;

  // Draw box
  doc.rect(ML, y, TW, boxH).fill(C.bgLight);
  doc.moveTo(ML, y).lineTo(ML, y + boxH)
    .strokeColor(C.cyan).lineWidth(3).stroke();

  // Draw text at absolute position
  doc.font('Helvetica-Oblique').fontSize(10).fillColor(C.muted)
    .text(text, ML + 3 + pad, y + pad, { width: innerW, lineGap: 3 });

  return y + boxH + 24;
}

function subHeading(doc, heading, y) {
  doc.rect(ML, y + 3, 4, 13).fill(C.cyan);
  doc.font('Times-Bold').fontSize(13).fillColor(C.oceanLight)
    .text(heading, ML + 12, y, { width: TW - 12, lineGap: 2 });
  return doc.y + 8;
}

function bodyParagraph(doc, text, y) {
  doc.font('Helvetica').fontSize(10.5).fillColor(C.textDark)
    .text(text, ML, y, { width: TW, lineGap: 5 });
  return doc.y + 20;
}

function quoteBlock(doc, text, author, y) {
  const pad = 18;
  const innerW = TW - pad * 2;
  const fullAuthor = '— ' + author;

  // Measure both lines before drawing anything
  const textH  = measureText(doc, text,        'Times-Italic',    11.5, innerW, 5);
  const authH  = measureText(doc, fullAuthor,  'Helvetica-Bold',  9,    innerW, 0);
  const boxH   = pad + textH + 14 + authH + pad;

  // Draw background
  doc.roundedRect(ML, y, TW, boxH, 6).fill(C.oceanDeep);

  // Draw quote text at absolute position
  doc.font('Times-Italic').fontSize(11.5).fillColor(C.textLight)
    .text(text, ML + pad, y + pad, { width: innerW, lineGap: 5 });

  // Draw author at absolute position (not using doc.y)
  const authorY = y + pad + textH + 14;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.cyan)
    .text(fullAuthor, ML + pad, authorY, { width: innerW });

  return y + boxH + 24;
}

function highlightBox(doc, text, y) {
  const pad = 13;
  const innerW = TW - pad * 2 - 4;
  const textH = measureText(doc, text, 'Helvetica', 10, innerW, 3.5);
  const boxH  = textH + pad * 2;

  doc.roundedRect(ML, y, TW, boxH, 5)
    .fillAndStroke(C.bgLight, C.border);

  doc.font('Helvetica').fontSize(10).fillColor(C.textDark)
    .text(text, ML + pad, y + pad, { width: innerW, lineGap: 3.5 });

  return y + boxH + 18;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function generatePDF() {
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });
  const out  = fs.createWriteStream(OUTPUT_PATH);
  doc.pipe(out);

  // ══════════════════════════════════════
  //  COVER
  // ══════════════════════════════════════
  doc.addPage();

  const bg = doc.linearGradient(0, 0, 0, H);
  bg.stop(0, C.oceanDeep).stop(0.55, C.oceanMid).stop(1, C.oceanLight);
  doc.rect(0, 0, W, H).fill(bg);

  const topBar = doc.linearGradient(0, 0, W, 0);
  topBar.stop(0, C.biolum).stop(0.5, C.cyan).stop(1, C.oceanLight);
  doc.rect(0, 0, W, 7).fill(topBar);

  // Badge
  const bw = 260, bh = 22, bx = (W - bw) / 2;
  doc.roundedRect(bx, 90, bw, bh, 11)
    .strokeColor(C.biolum).lineWidth(1).stroke();
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.biolum)
    .text('Divulgación Científica  ·  Biología Marina', bx, 97, { width: bw, align: 'center' });

  // Title
  doc.font('Times-Bold').fontSize(56).fillColor(C.white)
    .text('Pueden', 0, 132, { width: W, align: 'center' });
  doc.font('Times-BoldItalic').fontSize(60).fillColor(C.biolum)
    .text('pensar', 0, 190, { width: W, align: 'center' });
  doc.font('Times-Bold').fontSize(56).fillColor(C.white)
    .text('los peces?', 0, 252, { width: W, align: 'center' });

  // Divider
  doc.moveTo(W / 2 - 35, 326).lineTo(W / 2 + 35, 326)
    .strokeColor(C.cyan).lineWidth(1.5).stroke();

  // Subtitle
  doc.font('Helvetica').fontSize(11.5).fillColor(C.textMuted)
    .text(content.subtitle, ML + 40, 344, { width: TW - 80, align: 'center', lineGap: 4 });

  // Meta
  const metaY = 460;
  [
    { label: 'Año', value: content.year },
    { label: 'Idioma', value: 'Español' },
    { label: 'Categoría', value: content.category },
  ].forEach((col, i) => {
    const x = ML + i * (TW / 3);
    doc.font('Helvetica').fontSize(8).fillColor(C.textMuted)
      .text(col.label.toUpperCase(), x, metaY, { width: TW / 3, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(12).fillColor(C.white)
      .text(col.value, x, metaY + 16, { width: TW / 3, align: 'center' });
  });

  // Cover footer
  doc.moveTo(ML, H - 52).lineTo(W - MR, H - 52)
    .strokeColor('#ffffff').lineWidth(0.2).stroke();
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C.cyan)
    .text('Jacinto', ML, H - 38, { width: TW / 2 });
  doc.font('Helvetica').fontSize(9).fillColor(C.textMuted)
    .text('Basado en investigacion cientifica publicada', ML, H - 38, { width: TW, align: 'right' });

  // ══════════════════════════════════════
  //  TABLE OF CONTENTS
  // ══════════════════════════════════════
  newPage(doc);

  doc.font('Times-Bold').fontSize(26).fillColor(C.oceanDeep)
    .text('Tabla de Contenidos', ML, 60);
  doc.moveTo(ML, 99).lineTo(W - MR, 99)
    .strokeColor(C.border).lineWidth(1).stroke();

  const tocItems = [
    ...content.sections.map((s, i) => ({ num: s.num, title: s.title, pg: i + 3 })),
    { num: '06', title: 'Referencias y Fuentes Científicas', pg: content.sections.length + 3 },
  ];

  let ty = 116;
  tocItems.forEach(item => {
    doc.roundedRect(ML, ty, 30, 16, 3).fill(C.oceanMid);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.biolum)
      .text(item.num, ML, ty + 4, { width: 30, align: 'center' });
    doc.font('Helvetica').fontSize(12).fillColor(C.textDark)
      .text(item.title, ML + 38, ty + 1, { width: TW - 80 });
    doc.font('Helvetica-Bold').fontSize(12).fillColor(C.muted)
      .text(String(item.pg), ML, ty + 1, { width: TW, align: 'right' });
    ty += 26;
    doc.moveTo(ML + 38, ty - 4).lineTo(W - MR, ty - 4)
      .strokeColor('#edf2f7').lineWidth(0.5).stroke();
  });

  pageFooter(doc, 'Índice');

  // ══════════════════════════════════════
  //  CONTENT SECTIONS
  // ══════════════════════════════════════
  content.sections.forEach(section => {
    newPage(doc);
    let y = 55;

    y = numBadge(doc, section.num, y);
    y = sectionTitle(doc, section.title, y);
    y = introBox(doc, section.intro, y);

    section.subsections.forEach(sub => {
      y = ensureSpace(doc, 90, y);
      y = subHeading(doc, sub.heading, y);
      y = bodyParagraph(doc, sub.body, y);
    });

    if (section.quote) {
      y = ensureSpace(doc, 120, y);
      y = quoteBlock(doc, section.quote.text, section.quote.author, y);
    }

    pageFooter(doc, 'Sección ' + section.num);
  });

  // ══════════════════════════════════════
  //  REFERENCES
  // ══════════════════════════════════════
  newPage(doc);
  let ry = 55;

  ry = numBadge(doc, '06', ry);
  ry = sectionTitle(doc, 'Referencias y Fuentes Científicas', ry);

  content.references.forEach(ref => {
    // Pre-measure the whole reference block
    const rx = ML + 28;
    const rw = TW - 28;
    const titleH = measureText(doc, ref.title,   'Times-Bold',       11.5, rw, 2);
    const authH  = measureText(doc, ref.authors, 'Helvetica-Oblique', 9.5, rw, 0);
    const descH  = measureText(doc, ref.desc,    'Helvetica',         9.5, rw, 3);
    const urlH   = ref.url ? measureText(doc, ref.url, 'Helvetica', 8.5, rw, 0) : 0;
    const blockH = 22 + titleH + 6 + authH + 8 + descH + (urlH ? urlH + 6 : 0) + 20;

    ry = ensureSpace(doc, blockH, ry);

    // Number circle
    doc.circle(ML + 11, ry + 11, 11).fill(C.oceanMid);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.white)
      .text(String(ref.num), ML, ry + 7, { width: 22, align: 'center' });

    // Year badge
    doc.roundedRect(rx, ry, 38, 14, 3).fill(C.bgLight);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.oceanLight)
      .text(ref.year, rx, ry + 3.5, { width: 38, align: 'center' });

    // Journal
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.cyan)
      .text(ref.journal.toUpperCase(), rx + 44, ry + 3, { width: rw - 44 });

    let refY = ry + 22;

    doc.font('Times-Bold').fontSize(11.5).fillColor(C.textDark)
      .text(ref.title, rx, refY, { width: rw, lineGap: 2 });
    refY += titleH + 6;

    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(C.cyan)
      .text(ref.authors, rx, refY, { width: rw });
    refY += authH + 8;

    doc.font('Helvetica').fontSize(9.5).fillColor(C.muted)
      .text(ref.desc, rx, refY, { width: rw, lineGap: 3 });
    refY += descH + 6;

    if (ref.url) {
      doc.font('Helvetica').fontSize(8.5).fillColor(C.cyan)
        .text(ref.url, rx, refY, { width: rw });
      refY += urlH + 6;
    }

    ry = refY + 10;
    doc.moveTo(ML, ry).lineTo(W - MR, ry)
      .strokeColor('#edf2f7').lineWidth(0.5).stroke();
    ry += 14;
  });

  pageFooter(doc, 'Referencias y Fuentes');

  doc.end();

  return new Promise((resolve, reject) => {
    out.on('finish', () => { console.log('PDF generado: ' + OUTPUT_PATH); resolve(); });
    out.on('error', reject);
  });
}

module.exports = { generatePDF };

if (require.main === module) {
  generatePDF().catch(console.error);
}
