import Stripe from 'stripe';

export interface StripeProduct extends Stripe.Product {
  prices: Stripe.Price[];
}

export interface StripePrice extends Stripe.Price {}