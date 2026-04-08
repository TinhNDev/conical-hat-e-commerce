"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export const AuthBootstrap = () => {
  const refreshSession = useAppStore((state) => state.refreshSession);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  return null;
};
