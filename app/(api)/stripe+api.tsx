// app/(api)/stripe+api.tsx
import 'server-only';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' // Актуализирана API версия
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'bgn',
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
    
  } catch (error) {
    console.error('❌ Stripe Payment Intent Error:', error);
    return NextResponse.json(
      { error: 'Failed to create Payment Intent' },
      { status: 500 }
    );
  }
}