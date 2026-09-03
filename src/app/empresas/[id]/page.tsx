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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, User, TrendingUp, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { getCompanies, getRevenues, getExpenses } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { notFound } from "next/navigation";
import { RevenueForm } from "@/app/receitas/revenue-form";
import { ExpenseForm } from "@/app/despesas/expense-form";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [companies, revenues, expenses] = await Promise.all([
    getCompanies(),
    getRevenues(id),
    getExpenses(id),
  ]);

  const company = companies.find((c) => c.id === id);
  if (!company) notFound();

  const totalRevenue = revenues.reduce(
    (acc, item) => acc + Number(item.revenue.amount),
    0
  );
  const totalExpense = expenses.reduce(
    (acc, item) => acc + Number(item.expense.amount),
    0
  );
  const paidExpense = expenses
    .filter((item) => item.expense.paid)
    .reduce((acc, item) => acc + Number(item.expense.amount), 0);
  const pendingExpense = expenses
    .filter((item) => !item.expense.paid)
    .reduce((acc, item) => acc + Number(item.expense.amount), 0);

  return (
    <Shell>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4">
          <Link href="/empresas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <PageHeader
            title={company.name}
            description={company.description || "Sem descrição"}
          >
            <div className="flex gap-2">
              <RevenueForm companies={[company]} />
              <ExpenseForm companies={[company]} />
            </div>
          </PageHeader>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-sm text-slate-400">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Receipt className="h-5 w-5 text-rose-400" />
              <CardTitle className="text-sm text-slate-400">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-rose-400">
                {formatCurrency(totalExpense)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Wallet className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-sm text-slate-400">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  totalRevenue - totalExpense >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {formatCurrency(totalRevenue - totalExpense)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Receipt className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-sm text-slate-400">Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-400">
                {formatCurrency(pendingExpense)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-gradient border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
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
                          <Badge variant="secondary">
                            {item.revenue.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.revenue.receivedAt)}</TableCell>
                        <TableCell className="text-emerald-400">
                          {formatCurrency(item.revenue.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <RevenueForm companies={[company]} revenue={item.revenue} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {revenues.length === 0 && (
                <EmptyState message="Nenhuma receita para esta empresa." />
              )}
            </CardContent>
          </Card>

          <Card className="card-gradient border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
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
                          <Badge variant="secondary">
                            {item.expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.expense.dueDate)}</TableCell>
                        <TableCell className="text-rose-400">
                          {formatCurrency(item.expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.expense.paid ? "success" : "warning"}>
                            {item.expense.paid ? "Pago" : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <ExpenseForm companies={[company]} expense={item.expense} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {expenses.length === 0 && (
                <EmptyState message="Nenhuma despesa para esta empresa." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-slate-800/50 p-4">
        <Wallet className="h-8 w-8 text-slate-600" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{message}</p>
    </div>
  );
}
