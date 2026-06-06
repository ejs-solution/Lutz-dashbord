"use client";

import { createContext, useContext, type ReactNode } from "react";

const ShowroomContext = createContext(false);

export function ShowroomProvider({ children }: { children: ReactNode }) {
  return <ShowroomContext.Provider value={true}>{children}</ShowroomContext.Provider>;
}

export function useShowroom() {
  return useContext(ShowroomContext);
}
