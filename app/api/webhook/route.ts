import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 500 }
    );
  }
}

// Handle successful payments
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createClientComponentClient();
  const { metadata } = paymentIntent;

  if (!metadata || !metadata.order_id) {
    console.error("No order ID found in payment intent metadata");
    return;
  }

  try {
    // Update order status to 'paid'
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("payment_intent_id", paymentIntent.id);

    if (error) {
      throw error;
    }

    console.log(`Order ${metadata.order_id} marked as paid`);
  } catch (error) {
    console.error("Error updating order status:", error);
  }
}

// Handle failed payments
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createClientComponentClient();
  const { metadata } = paymentIntent;

  if (!metadata || !metadata.order_id) {
    console.error("No order ID found in payment intent metadata");
    return;
  }

  try {
    // Update order status to 'cancelled'
    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "cancelled",
        updated_at: new Date().toISOString() 
      })
      .eq("payment_intent_id", paymentIntent.id);

    if (error) {
      throw error;
    }

    console.log(`Order ${metadata.order_id} marked as cancelled due to payment failure`);
  } catch (error) {
    console.error("Error updating order status:", error);
  }
} 