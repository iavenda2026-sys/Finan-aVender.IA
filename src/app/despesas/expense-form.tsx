"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import type { Company, Expense } from "@/db/schema";

const categories = [
  "Recorrente",
  "Diversa",
  "Pessoal",
  "Empresarial",
  "Imposto",
  "Ferramenta",
  "Marketing",
  "Outro",
];

export function ExpenseForm({
  companies,
  expense,
}: {
  companies: Company[];
  expense?: Expense & { company?: Company };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(
    expense?.companyId || companies[0]?.id || ""
  );
  const [category, setCategory] = useState(
    expense?.category || categories[0]
  );
  const isEditing = !!expense;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const paid = formData.get("paid") === "on";
    const data = {
      companyId: formData.get("companyId") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      amount: Number(formData.get("amount")),
      dueDate: formData.get("dueDate") as string,
      isRecurring: formData.get("isRecurring") === "on",
      recurrenceDay: formData.get("recurrenceDay")
        ? Number(formData.get("recurrenceDay"))
        : null,
      paid,
      paidAt: paid ? (formData.get("paidAt") as string) : null,
      notes: formData.get("notes") as string,
    };

    const url = isEditing ? `/api/expenses/${expense.id}` : "/api/expenses";
    const method = isEditing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    await fetch(`/api/expenses/${expense?.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Despesa" : "Nova Despesa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyId">Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="companyId" value={companyId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={expense?.description}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={category} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={expense?.amount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={
                  expense?.dueDate
                    ? new Date(expense.dueDate).toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10)
                }
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                id="isRecurring"
                name="isRecurring"
                type="checkbox"
                defaultChecked={expense?.isRecurring}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800"
              />
              <Label htmlFor="isRecurring" className="font-normal">
                Despesa recorrente
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurrenceDay">Dia do vencimento (recorrência)</Label>
            <Input
              id="recurrenceDay"
              name="recurrenceDay"
              type="number"
              min="1"
              max="31"
              defaultValue={expense?.recurrenceDay || ""}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="paid"
              name="paid"
              type="checkbox"
              defaultChecked={expense?.paid}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800"
            />
            <Label htmlFor="paid" className="font-normal">
              Pago
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidAt">Data do Pagamento</Label>
            <Input
              id="paidAt"
              name="paidAt"
              type="date"
              defaultValue={
                expense?.paidAt
                  ? new Date(expense.paidAt).toISOString().slice(0, 10)
                  : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              name="notes"
              defaultValue={expense?.notes || ""}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader className="mr-2" /> : null}
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
