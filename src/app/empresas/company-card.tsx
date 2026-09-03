"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";
import type { Company } from "@/db/schema";
import { CompanyForm } from "./company-form";
import { formatCurrency } from "@/lib/formatters";

interface CompanyCardProps {
  company: Company & {
    revenue?: number;
    expense?: number;
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  const balance = (company.revenue || 0) - (company.expense || 0);

  return (
    <Link href={`/empresas/${company.id}`} className="block group">
      <Card className="card-gradient border-slate-800 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 h-full">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{
                backgroundColor: `${company.color}20`,
                color: company.color,
              }}
            >
              {company.isPersonal ? (
                <User className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-base text-white">
                {company.name}
              </CardTitle>
              <p className="text-xs text-slate-500">
                {company.isPersonal ? "Gasto pessoal" : "Empresa"}
              </p>
            </div>
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <CompanyForm company={company} />
          </div>
        </CardHeader>
        <CardContent>
          {company.description ? (
            <p className="mb-4 line-clamp-2 text-sm text-slate-400">
              {company.description}
            </p>
          ) : (
            <p className="mb-4 text-sm italic text-slate-600">
              Sem descrição
            </p>
          )}

          {(company.revenue !== undefined || company.expense !== undefined) && (
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-900/50 p-3">
              <div>
                <p className="text-xs text-slate-500">Receitas</p>
                <p className="font-semibold text-emerald-400">
                  {formatCurrency(company.revenue || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Despesas</p>
                <p className="font-semibold text-rose-400">
                  {formatCurrency(company.expense || 0)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge variant={company.active ? "success" : "secondary"}>
              {company.active ? "Ativa" : "Inativa"}
            </Badge>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: company.color }}
              />
              <span className="text-xs text-slate-500">{company.color}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
