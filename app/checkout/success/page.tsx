"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { CheckCircle, ArrowLeft, ShoppingBag, Home, Loader2 } from "lucide-react";
import { clearCart } from "@/lib/commerce";
import { createOrder } from "@/lib/commerce";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const completeOrder = async () => {
      try {
        setIsProcessing(true);

        // Get payment intent ID from URL if present
        const paymentIntentId = searchParams.get("payment_intent");
        
        if (!paymentIntentId) {
          // If no payment intent ID, just show a generic success
          setOrderNumber(`ORD-${Date.now().toString().slice(7)}`);
          setIsProcessing(false);
          return;
        }

        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push("/login");
          return;
        }

        // Verify payment status with Stripe (ideally this would be done server-side)
        // For now we'll assume payment is successful if we reached this page

        // Get cart data from localStorage
        const cartData = localStorage.getItem(`cart_${session.user.id}`);
        
        if (!cartData) {
          setOrderNumber(`ORD-${Date.now().toString().slice(7)}`);
          setIsProcessing(false);
          return;
        }

        const cart = JSON.parse(cartData);
        
        // Create an order record in the database
        const { success, orderId, error: orderError } = await createOrder(
          session.user.id,
          cart.items,
          paymentIntentId,
          { 
            // Shipping details would come from Stripe, but for demo we'll use placeholder
            address: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "US",
          }
        );

        if (!success || orderError) {
          throw new Error(orderError || "Failed to create order record");
        }

        // Set order number
        setOrderNumber(orderId || `ORD-${Date.now().toString().slice(7)}`);
        
        // Clear cart after successful order
        clearCart(session.user.id);
      } catch (err: any) {
        console.error("Error completing order:", err);
        setError(err.message || "An error occurred while processing your order");
      } finally {
        setIsProcessing(false);
      }
    };

    completeOrder();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [router, searchParams, supabase]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Completing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-gray-900 rounded-xl p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8">
              <Loader2 className="text-red-500 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Payment Processing</h1>
            <p className="text-gray-400 mb-6">
              Your payment is being processed, but we encountered an issue: {error}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              If you've been charged, please contact support with your payment details.
            </p>
            <Link
              href="/feed"
              className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-[#FF5CB1] to-[#c7aeef] rounded-xl hover:shadow-[0_0_20px_rgba(255,92,177,0.3)] transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Success animation */}
          <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          
          {/* Success content */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">
              Thank you for your purchase. We've received your payment and your order is now being processed.
            </p>
            
            {orderNumber && (
              <div className="bg-gray-900 rounded-xl p-4 mb-8">
                <p className="text-gray-400 text-sm">Order Number</p>
                <p className="text-xl font-semibold">{orderNumber}</p>
              </div>
            )}
            
            <p className="text-sm text-gray-400 mb-8">
              You will receive a confirmation email with the details of your purchase shortly.
            </p>
            
            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/feed"
                className="flex items-center justify-center gap-2 py-3 px-6 bg-[#333] hover:bg-[#444] rounded-xl transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Continue Shopping</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-[#FF5CB1] to-[#c7aeef] rounded-xl hover:shadow-[0_0_20px_rgba(255,92,177,0.3)] transition-all"
              >
                <Home className="w-5 h-5" />
                <span>Go to My Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase protection badge */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#111] to-[#333] rounded-xl p-4">
          <div className="flex items-center justify-center">
            <div className="bg-[#FF5CB1]/10 p-2 rounded-full mr-3">
              <div className="w-6 h-6 bg-[#FF5CB1] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white font-medium">Shrobe Purchase Protection</p>
              <p className="text-gray-400 text-xs">Your purchase is protected under our guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 