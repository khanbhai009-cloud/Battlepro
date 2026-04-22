import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, userId } = await request.json();

    if (!orderId || !amount || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const razorpay = getRazorpayClient();

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: "INR",
      receipt: orderId,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
