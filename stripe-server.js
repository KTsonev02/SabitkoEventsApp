// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const app = express();
// app.use(express.json());
// app.use(cors());

// app.post('/create-payment-intent', async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount || typeof amount !== 'number') {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount * 100, // Преобразуваме в стотинки
//       currency: 'bgn', // Променете на вашата валута
//       automatic_payment_methods: { enabled: true },
//     });

//     res.json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error('❌ Stripe Payment Intent Error:', error);
//     res.status(500).json({ error: 'Failed to create Payment Intent' });
//   }
// });

// const PORT = 4242;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
