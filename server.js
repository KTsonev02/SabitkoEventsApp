// Задължителни импорти
const express = require('express');
const dotenv = require('dotenv');

// Инициализиране на dotenv, за да можем да използваме ENV променливи
dotenv.config();

// Създаване на приложение
const app = express();

// Използване на JSON парсер за тела на заявки
app.use(express.json());

// Основен маршрут (API) - просто за тест
app.get('/', (req, res) => {
    res.send('Здравей, света!');
});

// Примерен маршрут за Stripe (можеш да добавиш своя логика тук)
app.post('/create-checkout-session', (req, res) => {
    // Тук ще можеш да добавиш логика за Stripe API
    res.send('Създаване на сесия за Stripe...');
});

// Слушане на порт 8082 (или друг порт, който предпочиташ)
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
    console.log(`Сървърът работи на порт ${PORT}`);
});