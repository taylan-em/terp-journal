// License key verification client
// Calls Gumroad API to validate a license key
// No auth needed on the client side — Gumroad's license endpoint is public

const GUMROAD_PRODUCT_ID = "zj9HhcxFOtmjX8oxctdMJA==";
const GUMROAD_LICENSE_URL = "https://api.gumroad.com/v2/licenses/verify";

// Dev/test key — bypasses Gumroad for testing the full unlock flow
const DEV_KEY = "RESIN-DEV-UNLOCK-TEST";

export function verifyLicense(key) {
  // Dev key: instant unlock, no network call
  if (key.trim() === DEV_KEY) {
    return Promise.resolve({ valid: true, purchase: { email: "dev@localhost" } });
  }

  return fetch(GUMROAD_LICENSE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: GUMROAD_PRODUCT_ID,
      license_key: key,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.success && d.uses > 0) {
        return { valid: true, purchase: d.purchase };
      }
      return { valid: false, error: "Invalid or unused license key" };
    })
    .catch(() => ({ valid: false, error: "Could not verify license. Check your connection." }));
}

export function isUnlocked() {
  try {
    return JSON.parse(localStorage.getItem("rs_premium") || "false");
  } catch {
    return false;
  }
}

export function setUnlocked(val) {
  localStorage.setItem("rs_premium", JSON.stringify(val));
}
