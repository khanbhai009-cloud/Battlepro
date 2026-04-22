import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/actions/wallet";

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, Number(amount));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
