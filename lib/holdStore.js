// In-memory hold manager for active slot bookings

if (!global.activeSlotHolds) {
  global.activeSlotHolds = new Map();
}

const HOLD_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes auto expiry if tab crashes

export function setSlotHold(key, clientId) {
  const now = Date.now();

  // Clean expired holds
  for (const [k, v] of global.activeSlotHolds.entries()) {
    if (now - v.createdAt > HOLD_TIMEOUT_MS) {
      global.activeSlotHolds.delete(k);
    }
  }

  const existing = global.activeSlotHolds.get(key);
  if (existing && existing.clientId !== clientId && (now - existing.createdAt < HOLD_TIMEOUT_MS)) {
    return { success: false, message: "এই স্লটটি বর্তমানে অন্য একজন ব্যবহারকারী হোল্ড করে বুকিং প্রসেস করছেন।" };
  }

  global.activeSlotHolds.set(key, { clientId, createdAt: now });
  return { success: true };
}

export function releaseSlotHold(key, clientId) {
  const existing = global.activeSlotHolds.get(key);
  if (existing && (!clientId || existing.clientId === clientId)) {
    global.activeSlotHolds.delete(key);
  }
  return { success: true };
}

export function getActiveHolds() {
  const now = Date.now();
  const validHolds = new Set();
  for (const [k, v] of global.activeSlotHolds.entries()) {
    if (now - v.createdAt < HOLD_TIMEOUT_MS) {
      validHolds.add(k);
    } else {
      global.activeSlotHolds.delete(k);
    }
  }
  return validHolds;
}
