require('dotenv').config(); // Това трябва да е на първия ред
const cron = require('node-cron');
const axios = require('axios');

// // Изпълнява се на всеки ден в 00:00
// cron.schedule('0 0 * * *', () => {
  
// Изпълнява се на всеки час в 00-та минута (напр. 13:00, 14:00 и т.н.)
cron.schedule('0 * * * *', () => {
  const notificationUrl = `${process.env.EXPO_PUBLIC_HOST_URL}/notifications`;
  
  console.log(`Making request to: ${notificationUrl}`);
  
  axios.post(notificationUrl)
    .then(response => console.log('Notification check completed:', response.data))
    .catch(error => console.error('Error:', error.message));
});

console.log('Scheduler started...');