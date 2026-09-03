import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RevenueForm } from "./revenue-form";
import { getCompanies, getRevenues } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { TrendingUp, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RevenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const month =
    (typeof params.month === "string" ? params.month : undefined) ||
    new Date().toISOString().slice(0, 7);
  const companyId =
    typeof params.companyId === "string" ? params.companyId : undefined;

  const [companies, revenues] = await Promise.all([
    getCompanies(),
    getRevenues(companyId, month),
  ]);

  const totalRevenue = revenues.reduce(
    (acc, item) => acc + Number(item.revenue.amount),
    0
  );

  return (
    <Shell>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Receitas"
          description="Controle tudo que entra no caixa"
        >
          <RevenueForm companies={companies} />
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-sm text-slate-400">
                Total no Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Users className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-sm text-slate-400">
                Sócio 1 (50%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(totalRevenue * 0.5)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Users className="h-5 w-5 text-sky-400" />
              <CardTitle className="text-sm text-slate-400">
                Sócio 2 (50%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-sky-400">
                {formatCurrency(totalRevenue * 0.5)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="card-gradient border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4 sm:flex-row">
              <input
                type="month"
                name="month"
                defaultValue={month}
                className="h-11 rounded-xl border border-slate-700 bg-slate-900/50 px-4 text-sm text-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <select
                name="companyId"
                defaultValue={companyId || ""}
                className="h-11 rounded-xl border border-slate-700 bg-slate-900/50 px-4 text-sm text-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todas as empresas</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Filtrar
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="card-gradient border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Lista de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Sócios</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenues.map((item) => (
                    <TableRow key={item.revenue.id}>
                      <TableCell className="font-medium text-white">
                        {item.revenue.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: item.company?.color || "#3b82f6",
                            }}
                          />
                          {item.company?.name || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary">
                            {item.revenue.category}
                          </Badge>
                          {item.revenue.isRecurring && (
                            <Badge
                              variant="outline"
                              className="border-blue-500/30 text-blue-400"
                            >
                              Recorrente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(item.revenue.receivedAt)}</TableCell>
                      <TableCell className="text-emerald-400">
                        {formatCurrency(item.revenue.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {item.revenue.partner1Share}% / {item.revenue.partner2Share}%
                      </TableCell>
                      <TableCell className="text-right">
                        <RevenueForm
                          companies={companies}
                          revenue={{
                            ...item.revenue,
                            company: item.company || undefined,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {revenues.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-slate-800/50 p-4">
                  <TrendingUp className="h-8 w-8 text-slate-600" />
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Nenhuma receita encontrada.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
