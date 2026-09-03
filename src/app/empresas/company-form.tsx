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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import type { Company } from "@/db/schema";

export function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditing = !!company;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      color: formData.get("color") as string,
      isPersonal: formData.get("isPersonal") === "on",
      active: formData.get("active") !== "on",
    };

    const url = isEditing ? `/api/companies/${company.id}` : "/api/companies";
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
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;
    await fetch(`/api/companies/${company?.id}`, { method: "DELETE" });
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
            Nova Empresa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={company?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={company?.description || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue={company?.color || "#3b82f6"}
                className="h-10 w-16 p-1"
              />
              <Input
                name="colorText"
                defaultValue={company?.color || "#3b82f6"}
                className="flex-1"
                readOnly
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isPersonal"
              name="isPersonal"
              type="checkbox"
              defaultChecked={company?.isPersonal}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800"
            />
            <Label htmlFor="isPersonal" className="font-normal">
              Gasto pessoal
            </Label>
          </div>
          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                defaultChecked={!company?.active}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800"
              />
              <Label htmlFor="active" className="font-normal">
                Inativar empresa
              </Label>
            </div>
          )}
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
