import { Logo } from "@/components/logo";

export function LogoWatermark() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.03]">
      <Logo className="w-[min(90vw,800px)]" />
    </div>
  );
}
