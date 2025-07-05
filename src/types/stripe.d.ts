import Stripe from 'stripe';

export interface StripeProduct extends Stripe.Product {
  prices: Stripe.Price[];
}
