require('dotenv').config();
const express = require('express');
const next = require('next');
const cors = require('cors');
const Stripe = require('stripe');
const axios = require('axios');
const cron = require('node-cron');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

const EXPO_PORT = process.env.PORT || 8082;
const STRIPE_PORT = 4242;

async function startExpoServer() {
  await nextApp.prepare();
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Debugging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // 👇 Това е правилният handler
  app.use((req, res) => {
    return handle(req, res);
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
  });

app.listen(EXPO_PORT, '0.0.0.0', () => {
  console.log(`🚀 Expo server running on http://localhost:${EXPO_PORT}`);
  initNotificationsScheduler();
});
}


function startStripeServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post('/create-payment-intent', async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount) return res.status(400).json({ error: 'Amount required' });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'bgn',
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(STRIPE_PORT, () => {
    console.log(`💳 Stripe server running on http://localhost:${STRIPE_PORT}`);
  });
}

function initNotificationsScheduler() {
  if (!global.schedulerInitialized) {
    cron.schedule('0 0 * * *', async () => {
      const url = `${process.env.EXPO_PUBLIC_HOST_URL}/api/notifications`;
      console.log(`🔔 Checking notifications at: ${url}`);
      try {
        await axios.post(url);
        console.log('✅ Notifications processed');
      } catch (err) {
        console.error('❌ Notifications error:', err.message);
      }
    });
    global.schedulerInitialized = true;
  }
}

startExpoServer().catch((err) => {
  console.error('❌ Failed to start Expo server:', err);
});
startStripeServer();
