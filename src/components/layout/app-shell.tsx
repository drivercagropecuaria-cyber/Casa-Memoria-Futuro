"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <button
        type="button"
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((value) => !value)}
        className="mobile-nav-toggle md:hidden"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="mobile-backdrop md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <Sidebar open={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <main className="main-content flex-1">
        <div className="p-6 md:p-8 pt-20 md:pt-8">{children}</div>
      </main>
    </div>
  );
}
