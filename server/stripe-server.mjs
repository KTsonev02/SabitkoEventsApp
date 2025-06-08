import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import cron from 'node-cron';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const app = express();
app.use(express.json());
app.use(cors());

// 💳 Създаване на плащане
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // в стотинки
      currency: 'bgn',
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Stripe Payment Intent Error:', error);
    res.status(500).json({ error: 'Failed to create Payment Intent' });
  }
});

// ⏰ CRON JOB - всяка минута
cron.schedule('* * * * *', () => {
  const baseUrl = process.env.EXPO_PUBLIC_HOST_URL;

  if (!baseUrl || typeof baseUrl !== 'string') {
    console.warn('⚠️ Skipping cron: EXPO_PUBLIC_HOST_URL is not defined or invalid.');
    return;
  }

  const notificationUrl = `${baseUrl}/notifications`;
  console.log(`⏰ Making request to: ${notificationUrl}`);

  axios.post(notificationUrl)
    .then(response => {
      console.log('✅ Notification check completed:', response.data);
    })
    .catch(error => {
      console.error('❌ Error in cron job:', error.message);
    });
});

console.log('✅ Scheduler initialized...');

// 🚀 Стартирай сървъра
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
