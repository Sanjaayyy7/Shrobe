import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Cart, CartItem, RentalPeriod, TradeProposal, Listing, Order } from "./types"

/**
 * Commerce-related utility functions for the Shrobe application.
 * Handles cart, rental, and trade operations.
 */

// Cart functions

/**
 * Get the current user's cart from local storage
 */
export const getCart = (userId: string): Cart | null => {
  if (typeof window === 'undefined') return null
  
  const cartData = localStorage.getItem(`cart_${userId}`)
  if (!cartData) return null
  
  try {
    return JSON.parse(cartData)
  } catch (error) {
    console.error("Error parsing cart data:", error)
    return null
  }
}

/**
 * Save cart to local storage
 */
export const saveCart = (cart: Cart): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(`cart_${cart.user_id}`, JSON.stringify(cart))
}

/**
 * Add a listing to cart
 */
export const addToCart = (userId: string, listing: Listing, quantity: number = 1): Cart => {
  const existingCart = getCart(userId)
  
  if (existingCart) {
    const existingItemIndex = existingCart.items.findIndex(
      item => item.listing_id === listing.id
    )
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      existingCart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      existingCart.items.push({
        listing_id: listing.id,
        quantity,
        listing
      })
    }
    
    // Recalculate total
    existingCart.total = calculateCartTotal(existingCart.items)
    
    saveCart(existingCart)
    return existingCart
  } else {
    // Create new cart
    const newCart: Cart = {
      user_id: userId,
      items: [{
        listing_id: listing.id,
        quantity,
        listing
      }],
      total: listing.daily_price * quantity
    }
    
    saveCart(newCart)
    return newCart
  }
}

/**
 * Remove a listing from cart
 */
export const removeFromCart = (userId: string, listingId: string): Cart | null => {
  const existingCart = getCart(userId)
  
  if (!existingCart) return null
  
  const updatedCart = {
    ...existingCart,
    items: existingCart.items.filter(item => item.listing_id !== listingId)
  }
  
  // Recalculate total
  updatedCart.total = calculateCartTotal(updatedCart.items)
  
  saveCart(updatedCart)
  return updatedCart
}

/**
 * Clear the entire cart
 */
export const clearCart = (userId: string): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`cart_${userId}`)
}

/**
 * Calculate total price of cart items
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    return sum + ((item.listing?.daily_price || 0) * item.quantity)
  }, 0)
}

// Rental functions

/**
 * Calculate rental period details
 */
export const calculateRentalPeriod = (
  listing: Listing,
  startDate: string,
  endDate: string
): RentalPeriod => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  
  let totalPrice
  if (listing.weekly_price && days >= 7) {
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    totalPrice = (weeks * (listing.weekly_price || 0)) + (remainingDays * listing.daily_price)
  } else {
    totalPrice = days * listing.daily_price
  }
  
  return {
    start_date: startDate,
    end_date: endDate,
    total_days: days,
    total_price: totalPrice
  }
}

// Trade functions

/**
 * Submit a trade proposal
 */
export const submitTradeProposal = async (proposal: TradeProposal): Promise<string | null> => {
  const supabase = createClientComponentClient()
  
  try {
    // In a real implementation, this would insert to a trade_proposals table
    // For now, we'll simulate the operation
    
    // Simulated success response
    return "TRADE_PROPOSAL_ID" // Normally this would be the actual ID from the database
  } catch (error) {
    console.error("Error submitting trade proposal:", error)
    return null
  }
}

/**
 * Process a checkout using Stripe
 */
export const processCheckout = async (
  userId: string, 
  items: CartItem[], 
  total: number
): Promise<{success: boolean, orderId?: string, message?: string, clientSecret?: string}> => {
  try {
    // Create a payment intent with Stripe
    const response = await fetch("/api/payment/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartItems: items,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to initialize payment");
    }
    
    // Return the client secret for the payment intent
    return {
      success: true,
      clientSecret: data.clientSecret,
      message: "Payment intent created successfully"
    }
  } catch (error: any) {
    console.error("Error processing checkout:", error)
    return {
      success: false,
      message: error.message || "Failed to process your order"
    }
  }
}

/**
 * Create an order record in the database after successful payment
 */
export const createOrder = async (
  userId: string,
  items: CartItem[],
  paymentIntentId: string,
  shippingDetails: any
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  const supabase = createClientComponentClient()
  
  try {
    // Calculate order total
    const totalAmount = calculateCartTotal(items)
    
    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'paid',
        total_amount: totalAmount,
        payment_intent_id: paymentIntentId,
        shipping_address: shippingDetails,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      listing_id: item.listing_id,
      quantity: item.quantity,
      price: item.listing?.daily_price || 0,
      subtotal: (item.listing?.daily_price || 0) * item.quantity
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    // Update listing availability
    for (const item of items) {
      if (item.listing_id) {
        const { error: updateError } = await supabase
          .from('listings')
          .update({ is_available: false })
          .eq('id', item.listing_id)
        
        if (updateError) {
          console.error(`Failed to update listing ${item.listing_id}:`, updateError)
          // Continue with other updates even if one fails
        }
      }
    }
    
    return {
      success: true,
      orderId: order.id
    }
  } catch (error: any) {
    console.error("Error creating order:", error)
    return {
      success: false,
      error: error.message || "Failed to create order record"
    }
  }
} 