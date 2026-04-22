"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const userId = searchParams.get("userId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !amount || !userId) {
      setError("Invalid payment parameters");
      setLoading(false);
      return;
    }

    // Load Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => initializePayment();
    script.onerror = () => {
      setError("Failed to load payment gateway");
      setLoading(false);
    };
    document.body.appendChild(script);

    const initializePayment = async () => {
      try {
        // Get Razorpay Key ID from API
        const keyResponse = await fetch("/api/razorpay-key");
        const keyData = await keyResponse.json();

        if (!keyData.keyId) {
          throw new Error("Razorpay key not configured");
        }

        // Create Razorpay order
        const response = await fetch("/api/create-razorpay-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount: Number(amount), userId }),
        });

        if (!response.ok) throw new Error("Failed to create payment order");

        const orderData = await response.json();

        const options = {
          key: keyData.keyId,
          amount: orderData.amount,
          currency: "INR",
          name: "BattleZone Pro",
          description: `Deposit ₹${amount}`,
          order_id: orderData.id,
          handler: async function (response: any) {
            // Verify payment on server
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                amount: Number(amount)
              })
            }).then(r => r.json());

            if (verifyRes.success) {
              // Redirect back to app with success
              window.location.href = `battlezone://wallet?status=success&amount=${amount}`;
            } else {
              // Redirect back to app with failure
              window.location.href = `battlezone://wallet?status=failed`;
            }
          },
          prefill: {
            name: "User",
            email: "user@example.com",
          },
          theme: {
            color: "#3B82F6",
          },
          modal: {
            ondismiss: function() {
              // User closed payment modal
              window.location.href = `battlezone://wallet?status=cancelled`;
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);

      } catch (err) {
        console.error("Payment initialization error:", err);
        setError("Failed to initialize payment");
        setLoading(false);
      }
    };
  }, [orderId, amount, userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "battlezone://wallet?status=failed"}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Processing payment...</p>
      </div>
    </div>
  );
}
