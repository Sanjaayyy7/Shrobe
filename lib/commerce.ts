import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Cart, CartItem, RentalPeriod, TradeProposal, Listing } from "./types"

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
 * Process a checkout (placeholder for actual payment processing)
 */
export const processCheckout = async (
  userId: string, 
  items: CartItem[], 
  total: number
): Promise<{success: boolean, orderId?: string, message?: string}> => {
  // In a real implementation, this would:
  // 1. Create an order in the database
  // 2. Process payment through Stripe or another payment processor
  // 3. Update inventory/availability of items
  // 4. Create order history record
  
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate successful checkout
    clearCart(userId)
    
    return {
      success: true,
      orderId: `ORDER-${Date.now()}`,
      message: "Order processed successfully"
    }
  } catch (error) {
    console.error("Error processing checkout:", error)
    return {
      success: false,
      message: "Failed to process your order"
    }
  }
} 