import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatCurrency(value: number | string | null | undefined) {
  const num = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export function formatMonthYear(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "MMMM/yyyy", { locale: ptBR });
}

export function formatNumber(value: number | string | null | undefined) {
  const num = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("pt-BR").format(num);
}
