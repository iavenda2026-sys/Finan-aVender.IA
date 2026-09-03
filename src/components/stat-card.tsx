import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "danger" | "warning";
}

const variants = {
  default: "text-slate-200",
  success: "text-emerald-400",
  danger: "text-rose-400",
  warning: "text-amber-400",
};

const iconVariants = {
  default: "bg-blue-500/10 text-blue-400",
  success: "bg-emerald-500/10 text-emerald-400",
  danger: "bg-rose-500/10 text-rose-400",
  warning: "bg-amber-500/10 text-amber-400",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className="card-gradient border-slate-800 transition-all duration-300 hover:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <div className={cn("rounded-xl p-2.5", iconVariants[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold tracking-tight", variants[variant])}>
          {typeof value === "number" && value < 1000000
            ? formatCurrency(value)
            : new Intl.NumberFormat("pt-BR").format(value)}
        </div>
        {trend && <p className="mt-1 text-xs text-slate-500">{trend}</p>}
      </CardContent>
    </Card>
  );
}
