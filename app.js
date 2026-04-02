const express = require('express');
const path = require('path');
const fs = require('fs');
const { generatePDF } = require('./scripts/generate-pdf');

const app = express();
const PORT = process.env.PORT || 3003;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  const pdfPath = path.join(__dirname, 'public/files/pueden-pensar-los-peces.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.log('Generando PDF...');
    await generatePDF().catch(err => console.error('Error generando PDF:', err));
  }
});
