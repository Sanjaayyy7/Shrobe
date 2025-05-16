"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { getCart, clearCart } from "@/lib/commerce";
import Link from "next/link";
import { 
  ShoppingCart, 
  ArrowLeft, 
  CreditCard, 
  Loader2, 
  CheckCircle,
  Shield,
  X
} from "lucide-react";
import Image from "next/image";

import { Cart as CartType, CartItem } from "@/lib/types";
import CheckoutForm from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [cart, setCart] = useState<CartType | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // Redirect to login if not authenticated
          router.push("/login");
          return;
        }
        
        setCurrentUser(session.user);
        
        // Load cart from localStorage directly to debug any issues
        const rawCartData = localStorage.getItem(`cart_${session.user.id}`);
        console.log("Raw cart data:", rawCartData);
        
        // Try to parse the cart data
        let savedCart;
        try {
          if (rawCartData) {
            savedCart = JSON.parse(rawCartData);
            console.log("Parsed cart data:", savedCart);
          }
        } catch (err) {
          console.error("Error parsing cart data:", err);
        }
        
        // Also try the utility function
        const utilCart = getCart(session.user.id);
        console.log("Utility cart data:", utilCart);
        
        // Use whichever cart data is available
        const finalCart = savedCart || utilCart;
        
        if (!finalCart || !finalCart.items || finalCart.items.length === 0) {
          console.error("Cart is empty or invalid:", finalCart);
          setError("Your cart is empty. Please add items to your cart before checkout.");
          setIsLoading(false);
          return;
        }
        
        setCart(finalCart);
        
        // Create payment intent
        const response = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cartItems: savedCart.items,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to initialize payment");
        }
        
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error("Checkout initialization error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    
    initCheckout();
  }, [router, supabase]);
  
  const handlePaymentSuccess = () => {
    if (currentUser) {
      // Clear cart after successful payment
      clearCart(currentUser.id);
      setPaymentSuccess(true);
      
      // Reset UI after a few seconds
      setTimeout(() => {
        router.push("/checkout/success");
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Function to create a test item in the cart for debugging
    const createTestCart = () => {
      if (!currentUser) return;
      
      const testListing = {
        id: "test-item-1",
        user_id: "test-seller",
        title: "Test Nike Jacket",
        description: "This is a test item",
        daily_price: 99.99,
        is_available: true,
        listing_type: "Sell",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const testCart = {
        user_id: currentUser.id,
        items: [{
          listing_id: testListing.id,
          quantity: 1,
          listing: testListing
        }],
        total: testListing.daily_price
      };
      
      // Save to localStorage directly
      localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(testCart));
      
      // Refresh page
      window.location.reload();
    };
    
    return (
      <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-gray-900 rounded-xl p-8 shadow-xl">
          <div className="text-center">
            <div className="bg-red-500/20 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
              <X className="text-red-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Checkout Error</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            
            <div className="space-y-4">
              <Link
                href="/feed"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#FF5CB1] text-white font-medium hover:bg-opacity-90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shopping
              </Link>
              
              {/* Debug button for creating test cart */}
              <div>
                <button
                  onClick={createTestCart}
                  className="w-full mt-6 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Create Test Item (Debug)
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  This will create a test item in your cart for debugging
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-gray-900 rounded-xl p-8 shadow-xl">
          <div className="text-center">
            <div className="bg-green-500/20 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">Redirecting you to the confirmation page...</p>
            <div className="w-8 h-8 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !clientSecret) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="mb-8">
          <Link href="/feed" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout form with Stripe */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-[#FF5CB1]" />
                Payment Details
              </h2>
              
              {clientSecret && (
                <Elements 
                  stripe={getStripe()} 
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#FF5CB1',
                        borderRadius: '12px',
                      },
                    },
                  }}
                >
                  <CheckoutForm 
                    onPaymentSuccess={handlePaymentSuccess}
                    setIsProcessing={setIsProcessing}
                  />
                </Elements>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-[#313131] to-[#1a1a1a] p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF5CB1]/20 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-[#FF5CB1]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Shrobe Purchase Protection</h4>
                  <p className="text-gray-400 text-sm">Secure payments and verified authenticity</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-gray-900 rounded-xl p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-[#FF5CB1]" />
                Order Summary
              </h2>
              
              <div className="divide-y divide-gray-800">
                {cart.items.map((item: CartItem) => (
                  <div key={item.listing_id} className="py-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                      {item.listing?.images && item.listing.images[0]?.image_url ? (
                        <Image
                          src={item.listing.images[0].image_url}
                          alt={item.listing.title || "Item image"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.listing?.title}</h3>
                      <p className="text-gray-400 text-sm">{item.listing?.brand || "Unknown brand"}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="font-semibold">${item.listing?.daily_price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Tax</span>
                  <span>${(cart.total * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-800">
                  <span>Total</span>
                  <span>${(cart.total + cart.total * 0.08).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 