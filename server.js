import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware за парсване на JSON
app.use(express.json());

// Динамично зареждане на всички маршрути от папката (api)
const apiDirectory = path.join(__dirname, 'app', '(api)');
fs.readdirSync(apiDirectory).forEach((file) => {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const route = require(path.join(apiDirectory, file));
    const routePath = `/${file.replace(/\.[tj]s$/, '')}`;
    app.use(routePath, route.default || route);
  }
});

// Статична директория (ако е нужно)
app.use(express.static(path.join(__dirname, 'public')));

// Стартиране на сървъра
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});