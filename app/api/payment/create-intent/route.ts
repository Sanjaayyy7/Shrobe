import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Create a Stripe instance with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil", // Use the latest API version
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request JSON
    let cartItems, paymentType;
    try {
      const requestBody = await req.json();
      cartItems = requestBody.cartItems;
      paymentType = requestBody.paymentType || "payment";
      
      // Log for debugging
      console.log("Payment request body:", JSON.stringify(requestBody, null, 2));
    } catch (error) {
      const parseError = error as Error;
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format", details: parseError.message || "Unknown error" },
        { status: 400 }
      );
    }
    
    // Validate request data
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("Invalid cart items:", cartItems);
      return NextResponse.json(
        { error: "Cart items are required and must be an array", received: cartItems },
        { status: 400 }
      );
    }

    // Calculate order total
    let amount = 0;
    try {
      amount = cartItems.reduce(
        (total: number, item: any) => {
          const itemPrice = item.listing?.daily_price || 0;
          const itemQuantity = item.quantity || 1;
          const itemTotal = itemPrice * itemQuantity;
          
          console.log(`Item: ${item.listing_id}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Total: ${itemTotal}`);
          
          return total + itemTotal;
        },
        0
      );
    } catch (error) {
      const calcError = error as Error;
      console.error("Error calculating amount:", calcError, cartItems);
      return NextResponse.json(
        { error: "Failed to calculate order total", details: calcError.message || "Unknown calculation error" },
        { status: 400 }
      );
    }

    // Ensure we have a valid amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount", amount },
        { status: 400 }
      );
    }

    // Convert to cents for Stripe (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100);
    console.log(`Total amount: ${amount}, in cents: ${amountInCents}`);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      // Capture payment data for future reference
      metadata: {
        order_id: `order_${Date.now()}`,
        items_count: cartItems.length,
        items: JSON.stringify(
          cartItems.map((item: any) => ({
            id: item.listing_id,
            quantity: item.quantity,
          }))
        ),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created:", paymentIntent.id);

    // Return client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      amountInCents: amountInCents
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create payment intent",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 