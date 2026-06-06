"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useShowroom } from "./showroom-context";

type BetaCtx = { betaMode: boolean; toggleBeta: () => void };

const BetaContext = createContext<BetaCtx>({ betaMode: false, toggleBeta: () => {} });

export function BetaProvider({ children }: { children: ReactNode }) {
  const [betaMode, setBetaMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cutz_beta_mode");
      if (saved === "1") setBetaMode(true);
    } catch { /* noop */ }
  }, []);

  function toggleBeta() {
    setBetaMode(prev => {
      const next = !prev;
      try { localStorage.setItem("cutz_beta_mode", next ? "1" : "0"); } catch { /* noop */ }
      return next;
    });
  }

  return <BetaContext.Provider value={{ betaMode, toggleBeta }}>{children}</BetaContext.Provider>;
}

/** Returns betaMode=true whenever the Showroom is active, regardless of the user toggle. */
export function useBeta() {
  const ctx      = useContext(BetaContext);
  const showroom = useShowroom();
  return { betaMode: ctx.betaMode || showroom, toggleBeta: ctx.toggleBeta };
}
