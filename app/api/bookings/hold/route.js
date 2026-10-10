import { NextResponse } from "next/server";
import { setSlotHold, releaseSlotHold } from "@/lib/holdStore";
import { isMaintenanceBlockedSlot } from "@/lib/pricing";

export async function POST(request) {
  try {
    const body = await request.json();
    const { arenaName, date, slot, action, clientId } = body;

    if (!arenaName || !date || !slot || !clientId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (action === "hold" && isMaintenanceBlockedSlot(date, slot)) {
      return NextResponse.json(
        { error: "১ অক্টোবর রাত ১০:০০ টা পর্যন্ত স্লট বুকিং সাময়িকভাবে বন্ধ আছে।" },
        { status: 400 }
      );
    }

    const key = `${arenaName}_${date}_${slot}`;

    if (action === "hold") {
      const result = setSlotHold(key, clientId);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 409 });
      }
      return NextResponse.json({ success: true, held: true });
    } else if (action === "release") {
      releaseSlotHold(key, clientId);
      return NextResponse.json({ success: true, released: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("HOLD API ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
