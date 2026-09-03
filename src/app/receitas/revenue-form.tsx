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
import type { Company, Revenue } from "@/db/schema";

const categories = [
  "Setup",
  "Comissão",
  "Dashboard",
  "Mensalidade",
  "Serviço",
  "Outro",
];

export function RevenueForm({
  companies,
  revenue,
}: {
  companies: Company[];
  revenue?: Revenue & { company?: Company };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(
    revenue?.companyId || companies[0]?.id || ""
  );
  const [category, setCategory] = useState(
    revenue?.category || categories[0]
  );
  const isEditing = !!revenue;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      companyId: formData.get("companyId") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      amount: Number(formData.get("amount")),
      receivedAt: formData.get("receivedAt") as string,
      isRecurring: formData.get("isRecurring") === "on",
      partner1Share: Number(formData.get("partner1Share")),
      partner2Share: Number(formData.get("partner2Share")),
      notes: formData.get("notes") as string,
    };

    const url = isEditing ? `/api/revenues/${revenue.id}` : "/api/revenues";
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
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;
    await fetch(`/api/revenues/${revenue?.id}`, { method: "DELETE" });
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
            Nova Receita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Receita" : "Nova Receita"}
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
              defaultValue={revenue?.description}
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
                defaultValue={revenue?.amount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedAt">Data Recebimento</Label>
              <Input
                id="receivedAt"
                name="receivedAt"
                type="date"
                defaultValue={
                  revenue?.receivedAt
                    ? new Date(revenue.receivedAt).toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10)
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partner1Share">% Sócio 1</Label>
              <Input
                id="partner1Share"
                name="partner1Share"
                type="number"
                min="0"
                max="100"
                defaultValue={revenue?.partner1Share ?? 50}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner2Share">% Sócio 2</Label>
              <Input
                id="partner2Share"
                name="partner2Share"
                type="number"
                min="0"
                max="100"
                defaultValue={revenue?.partner2Share ?? 50}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isRecurring"
              name="isRecurring"
              type="checkbox"
              defaultChecked={revenue?.isRecurring}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800"
            />
            <Label htmlFor="isRecurring" className="font-normal">
              Receita recorrente
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              name="notes"
              defaultValue={revenue?.notes || ""}
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
