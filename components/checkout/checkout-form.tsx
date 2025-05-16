"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
  LinkAuthenticationElement
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

interface CheckoutFormProps {
  onPaymentSuccess: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
}

export default function CheckoutForm({ onPaymentSuccess, setIsProcessing }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the payment intent client secret from the URL
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    // Check the status of the payment
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) {
        return;
      }
      
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onPaymentSuccess();
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Please provide a payment method.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, onPaymentSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: email,
          shipping: {
            name: 'ShippingAddressElement captures this',
            address: {
              line1: '...',
              // Address information is captured by the AddressElement
            },
          },
          payment_method_data: {
            billing_details: {
              email: email,
            },
          },
        },
        redirect: "if_required"
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "An unexpected error occurred.");
        } else {
          setMessage("An unexpected error occurred.");
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // The payment has been processed!
        setMessage("Payment succeeded!");
        onPaymentSuccess();
      } else {
        setMessage("Your payment is processing.");
        // In a real app, you would wait for a webhook to confirm the payment
      }
    } catch (e: any) {
      setMessage(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Email field for receipt */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Email
        </label>
        <div className="bg-gray-800 rounded-lg p-4">
          <LinkAuthenticationElement
            id="link-authentication-element"
            onChange={(e) => {
              if (e.value.email) {
                setEmail(e.value.email);
              }
            }}
            options={{
              defaultValues: {
                email: '',
              },
            }}
          />
        </div>
      </div>
      
      {/* Address Element */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Shipping Address
        </label>
        <div className="bg-gray-800 rounded-lg p-4">
          <AddressElement 
            options={{
              mode: 'shipping',
              allowedCountries: ['US', 'CA', 'GB'],
              fields: {
                phone: 'always',
              },
              validation: {
                phone: {
                  required: 'always',
                },
              },
            }}
          />
        </div>
      </div>
      
      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Payment Information
        </label>
        <div className="bg-gray-800 rounded-lg p-4">
          <PaymentElement 
            id="payment-element" 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
              defaultValues: {
                billingDetails: {
                  name: '',
                  email: email,
                },
              },
            }}
          />
        </div>
      </div>
      
      {/* Show any error or success messages */}
      {message && (
        <div className={`p-3 rounded-lg ${message.includes("succeeded") ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
          {message}
        </div>
      )}
      
      {/* Submit button */}
      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-gradient-to-r from-[#FF5CB1] to-[#c7aeef] text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,92,177,0.3)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
      
      <p className="text-center text-sm text-gray-400 mt-4">
        By completing this purchase, you agree to Shrobe's <a href="#" className="text-[#FF5CB1] hover:underline">Terms of Service</a> and <a href="#" className="text-[#FF5CB1] hover:underline">Privacy Policy</a>.
      </p>
    </form>
  );
} 