import { Sidebar } from "@/components/sidebar";
import { LogoWatermark } from "@/components/logo-watermark";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      <LogoWatermark />
      <Sidebar />
      <main className="relative z-10 transition-all lg:pl-64">
        <div className="min-h-screen p-4 pt-20 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
