// app/api/pricing/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pricing from "@/models/ArenaPricing";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const arenaName = searchParams.get("arena");

    if (arenaName) {
      const pricing = await Pricing.findOne({ arenaName });
      if (!pricing) {
        // Return default if not found
        return NextResponse.json({
          arenaName,
          defaultPrice: 3000,
          timeSlots: []
        });
      }
      return NextResponse.json(pricing);
    }

    const allPricing = await Pricing.find();
    return NextResponse.json(allPricing);
  } catch (error) {
    console.error("PRICING GET ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}