import { NextResponse } from "next/server";
import { executeBkashPayment, queryBkashPayment } from "@/lib/bkash";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { sendBookingSms } from "@/lib/sms";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status");

  // Checklist Rule 1 & 2: Only call Execute API if status === "success".
  // For cancel, failure, or any other status, redirect to failure page with message.
  if (status !== "success") {
    try {
      await connectDB();
      const booking = await Booking.findOne({ bkashPaymentID: paymentID, status: "pending" });
      const redirectPath = booking?.user ? "/dashboard" : "/";
      if (booking) {
        await Booking.findByIdAndDelete(booking._id);
      }
      const failureMsg = status === "cancel" ? "Payment cancelled by user" : status === "failure" ? "Payment failed" : `Payment status: ${status || "unknown"}`;
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectPath}?status=failed&message=${encodeURIComponent(failureMsg)}`);
    } catch (err) {
      console.error("Cleanup error on cancel/fail:", err);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?status=failed&message=Payment failed or cancelled`);
    }
  }

  try {
    await connectDB();

    let result;
    try {
      // Checklist Rule 2: Execute API called for "success" status
      result = await executeBkashPayment(paymentID);
    } catch (execError) {
      // Checklist Rule 4: Query Payment API should be called if and only if there is no response from Execute API (Timeout or null response)
      console.error("Execute API call failed/timed out, attempting Query API fallback...", execError);
      try {
        result = await queryBkashPayment(paymentID);
      } catch (queryError) {
        console.error("Query API fallback also failed:", queryError);
        const booking = await Booking.findOne({ bkashPaymentID: paymentID, status: "pending" });
        const redirectPath = booking?.user ? "/dashboard" : "/";
        await Booking.findOneAndDelete({ bkashPaymentID: paymentID, status: "pending" });
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectPath}?status=failed&message=${encodeURIComponent("Payment execution timed out.")}`);
      }
    }

    // Checklist Rule 3: transactionStatus = "Completed" indicates successful payment
    if (result && result.statusCode === "0000" && result.transactionStatus === "Completed") {
      const bookingId = result.merchantInvoiceNumber;

      // Update booking
      const booking = await Booking.findById(bookingId);
      if (booking) {
        const paidNow = parseFloat(result.amount);
        booking.status = "confirmed";
        booking.paidAmount = (booking.paidAmount || 0) + paidNow;
        booking.advanceAmount = paidNow;
        booking.remainingAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
        booking.paymentStatus = booking.remainingAmount <= 0 ? "paid" : "partial";
        booking.transactionId = result.trxID;

        // Assign to the virtual Bkash System and log transaction
        try {
          const BKASH_SYSTEM_ID = "6645db7d6927a63aab41c000";
          booking.advanceReceiver = BKASH_SYSTEM_ID;
          booking.advanceReceiverName = "Bkash System";

          // Create transaction record
          await Transaction.create({
            booking: booking._id,
            receiver: BKASH_SYSTEM_ID,
            receiverName: "Bkash System",
            amount: paidNow,
            transactionType: booking.remainingAmount > 0 ? "advance" : "full",
            paymentStatus: "confirmed",
            bookingStatus: "confirmed",
            arenaName: booking.arenaName,
            bookingDate: booking.bookingDate,
            timeSlot: booking.timeSlot,
            customerName: booking.bookingForName || "Unknown Customer",
            customerPhone: booking.bookingForPhone || "N/A",
            notes: `Automatic confirmation for BKASH online booking (TrxID: ${result.trxID})`,
            couponCode: booking.couponCode || null,
            discountAmount: booking.discountAmount || 0,
            originalAmount: booking.originalAmount || booking.totalAmount,
          });
        } catch (txError) {
          console.error("Failed to create transaction or update receiver balance in bKash callback:", txError);
        }

        await booking.save();

        // Send SMS confirmation
        try {
          sendBookingSms(booking).catch(err => console.error("SMS notification error:", err));
        } catch (smsErr) {
          console.error("Failed to initiate SMS dispatch:", smsErr);
        }

        // Increment coupon usage if applicable
        if (booking.couponCode) {
          try {
            await fetch(`${process.env.NEXTAUTH_URL}/api/coupons`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: booking.couponCode })
            });
          } catch (error) {
            console.error("Failed to increment coupon usage:", error);
          }
        }
      }

      const redirectPath = booking?.user ? "/dashboard" : "/";
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectPath}?status=success`);
    } else {
      // Checklist Rule 3: Display proper errorMessageEn from API response on failure
      const errorMessage = result?.errorMessageEn || result?.statusMessage || "Payment execution failed";
      const booking = await Booking.findOne({ bkashPaymentID: paymentID, status: "pending" });
      const redirectPath = booking?.user ? "/dashboard" : "/";
      await Booking.findOneAndDelete({ bkashPaymentID: paymentID, status: "pending" });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectPath}?status=failed&message=${encodeURIComponent(errorMessage)}`);
    }
  } catch (error) {
    console.error("BKASH CALLBACK ERROR:", error);
    try {
      await Booking.findOneAndDelete({ bkashPaymentID: paymentID, status: "pending" });
    } catch (e) { }
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?status=failed&message=${encodeURIComponent(error.message || "Payment error")}`);
  }
}
