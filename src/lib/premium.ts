import { useCallback, useEffect, useState } from "react";

/**
 * Premium gating for the Raag Guide + ad-free layout.
 *
 * NOTE: this is a client-side convenience flag only. It gives instant UI
 * feedback right after checkout. Real entitlement must be verified server
 * side (Paddle webhook -> your backend) before it can be trusted.
 */
export const PADDLE_CLIENT_TOKEN = "";
export const PADDLE_ENVIRONMENT: "sandbox" | "production" = "sandbox";
export const PADDLE_PRICE_MONTHLY = "pri_YOUR_MONTHLY_PRICE_ID";
export const PADDLE_PRICE_LIFETIME = "pri_YOUR_LIFETIME_PRICE_ID";
export const ENTITLEMENT_API_BASE = "";

/** Owner/tester unlock code. Change this to whatever you like. */
export const UNLOCK_CODE = "SURPETI-RAAG-2026";

const PREMIUM_KEY = "surpeti.premium";
const DEVICE_ID_KEY = "surpeti.deviceId";


function deviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

type PaddleGlobal = {
  Environment: { set: (env: string) => void };
  Initialize: (opts: {
    token: string;
    eventCallback?: (event: { name: string }) => void;
  }) => void;
  Checkout: {
    open: (opts: {
      items: { priceId: string; quantity: number }[];
      customData?: Record<string, string>;
    }) => void;
  };
};

export function usePremium() {
  const [premium, setPremium] = useState(false);
  const [device, setDevice] = useState("");

  useEffect(() => {
    setDevice(deviceId());
    setPremium(localStorage.getItem(PREMIUM_KEY) === "1");
  }, []);

  const sync = useCallback(async (id: string) => {
    if (!ENTITLEMENT_API_BASE) return;
    try {
      const res = await fetch(`${ENTITLEMENT_API_BASE}/api/entitlement/${id}`);
      const data = (await res.json()) as { premium?: boolean };
      localStorage.setItem(PREMIUM_KEY, data.premium ? "1" : "0");
      setPremium(Boolean(data.premium));
    } catch {
      /* offline: keep cached status */
    }
  }, []);

  useEffect(() => {
    if (device) void sync(device);
  }, [device, sync]);

  const grantLocally = useCallback(() => {
    localStorage.setItem(PREMIUM_KEY, "1");
    setPremium(true);
  }, []);

  const checkoutConfigured = Boolean(
    PADDLE_CLIENT_TOKEN && !PADDLE_PRICE_MONTHLY.includes("YOUR"),
  );

  const openCheckout = useCallback(
    (priceId: string) => {
      const paddle = (window as unknown as { Paddle?: PaddleGlobal }).Paddle;
      if (!paddle || !checkoutConfigured) return false;
      paddle.Environment.set(PADDLE_ENVIRONMENT);
      paddle.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: (event) => {
          if (event.name === "checkout.completed") {
            grantLocally();
            window.setTimeout(() => void sync(device), 3000);
          }
        },
      });
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { deviceId: device },
      });
      return true;
    },
    [checkoutConfigured, device, grantLocally, sync],
  );

  const redeemCode = useCallback(
    (code: string) => {
      const ok =
        code.trim().toUpperCase() === UNLOCK_CODE.trim().toUpperCase();
      if (ok) grantLocally();
      return ok;
    },
    [grantLocally],
  );

  const revoke = useCallback(() => {
    localStorage.setItem(PREMIUM_KEY, "0");
    setPremium(false);
  }, []);

  return { premium, checkoutConfigured, openCheckout, redeemCode, revoke };
}

