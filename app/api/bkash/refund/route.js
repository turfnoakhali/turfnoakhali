import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { refundBkashPayment } from "@/lib/bkash";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { paymentID, amount, trxID, bookingId, reason } = await request.json();

    if (!paymentID || !amount || !trxID) {
      return NextResponse.json({ error: "Missing required parameters (paymentID, amount, trxID)" }, { status: 400 });
    }

    const refundResult = await refundBkashPayment({
      paymentID,
      amount,
      trxID,
      sku: bookingId || "booking",
      reason: reason || "UAT / Customer Refund",
    });

    if (refundResult.statusCode === "0000" && refundResult.transactionStatus === "Completed") {
      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.status = "cancelled";
          booking.paymentStatus = "refunded";
          await booking.save();
        }
      }
      return NextResponse.json({ success: true, data: refundResult });
    } else {
      return NextResponse.json({
        success: false,
        error: refundResult.errorMessageEn || refundResult.statusMessage || "Refund failed",
        data: refundResult
      }, { status: 400 });
    }
  } catch (error) {
    console.error("BKASH REFUND ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
