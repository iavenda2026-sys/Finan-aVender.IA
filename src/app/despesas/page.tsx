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
import { ExpenseForm } from "./expense-form";
import { getCompanies, getExpenses } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { CheckCircle2, XCircle, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
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

  const [companies, expenses] = await Promise.all([
    getCompanies(),
    getExpenses(companyId, month),
  ]);

  const totalExpense = expenses.reduce(
    (acc, item) => acc + Number(item.expense.amount),
    0
  );
  const paidTotal = expenses
    .filter((item) => item.expense.paid)
    .reduce((acc, item) => acc + Number(item.expense.amount), 0);
  const pendingTotal = expenses
    .filter((item) => !item.expense.paid)
    .reduce((acc, item) => acc + Number(item.expense.amount), 0);

  return (
    <Shell>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Despesas"
          description="Controle tudo que sai do caixa"
        >
          <ExpenseForm companies={companies} />
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Receipt className="h-5 w-5 text-rose-400" />
              <CardTitle className="text-sm text-slate-400">
                Total no Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-rose-400">
                {formatCurrency(totalExpense)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-sm text-slate-400">Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(paidTotal)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <XCircle className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-sm text-slate-400">Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-400">
                {formatCurrency(pendingTotal)}
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
            <CardTitle className="text-lg text-white">Lista de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((item) => (
                    <TableRow key={item.expense.id}>
                      <TableCell className="font-medium text-white">
                        {item.expense.description}
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
                            {item.expense.category}
                          </Badge>
                          {item.expense.isRecurring && (
                            <Badge
                              variant="outline"
                              className="border-blue-500/30 text-blue-400"
                            >
                              Recorrente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(item.expense.dueDate)}</TableCell>
                      <TableCell className="text-rose-400">
                        {formatCurrency(item.expense.amount)}
                      </TableCell>
                      <TableCell>
                        {item.expense.paid ? (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Pago</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Pendente</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ExpenseForm
                          companies={companies}
                          expense={{
                            ...item.expense,
                            company: item.company || undefined,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {expenses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-slate-800/50 p-4">
                  <Receipt className="h-8 w-8 text-slate-600" />
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Nenhuma despesa encontrada.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
