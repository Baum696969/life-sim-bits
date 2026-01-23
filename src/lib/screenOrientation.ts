import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";

/**
 * Locks the orientation to portrait for the installed native app.
 * No-op in the browser/PWA.
 */
export async function lockPortraitOnNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await ScreenOrientation.lock({ orientation: "portrait" });
  } catch {
    // Some devices/platform versions may reject; we fail silently.
  }
}

/**
 * Locks the orientation to landscape for the installed native app.
 * No-op in the browser/PWA.
 */
export async function lockLandscapeOnNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await ScreenOrientation.lock({ orientation: "landscape" });
  } catch {
    // Some devices/platform versions may reject; we fail silently.
  }
}

/**
 * Unlocks the orientation, allowing free rotation.
 * No-op in the browser/PWA.
 */
export async function unlockOrientation(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await ScreenOrientation.unlock();
  } catch {
    // Some devices/platform versions may reject; we fail silently.
  }
}
