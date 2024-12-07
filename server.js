const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use('/authorization', express.static(path.join(__dirname, 'authorization')));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'authorization', 'authorization.html'));
});


app.get('/', (req, res) => {
  const { page = 1, size = 5 } = req.query;

  console.log(`Page: ${page}, Page Size: ${size}`);

  res.sendFile(path.join(__dirname, 'main', 'main.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
