"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Receipt,
  PieChart,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/receitas", label: "Receitas", icon: TrendingUp },
  { href: "/despesas", label: "Despesas", icon: Receipt },
  { href: "/relatorios", label: "Relatórios", icon: PieChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-900/80 p-2.5 text-slate-200 backdrop-blur-sm border border-slate-800 hover:bg-slate-800 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-slate-800 bg-[#0a0a0f]/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 p-6">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <Logo className="w-full max-w-[220px]" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-blue-500/10 to-transparent text-blue-400 border-r-2 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 border border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Divisão entre Sócios
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-300">Sócio 1</span>
                <span className="text-blue-400 font-medium">50%</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Sócio 2</span>
                <span className="text-sky-400 font-medium">50%</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="flex h-full w-full">
                  <div className="h-full w-1/2 bg-blue-500" />
                  <div className="h-full w-1/2 bg-sky-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
