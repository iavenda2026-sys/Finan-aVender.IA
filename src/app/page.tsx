import { Shell } from "@/components/shell";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyBarChart, MonthlyTrendChart, CategoryPieChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getDashboardData, getUpcomingExpenses } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const period = (typeof params.period === "string" ? params.period : "all") as "all" | "month" | "year" | "custom";
  const startDate = typeof params.startDate === "string" ? params.startDate : undefined;
  const endDate = typeof params.endDate === "string" ? params.endDate : undefined;

  const [data, upcomingExpenses] = await Promise.all([
    getDashboardData({ period, startDate, endDate }),
    getUpcomingExpenses(),
  ]);

  const chartData = data.byCompany.map((item) => ({
    name: item.company.name,
    receitas: item.revenue,
    despesas: item.expense,
  }));

  const revenueCategoryData = data.revenueByCategory.map((item) => ({
    name: item.category,
    value: item.total,
  }));

  const expenseCategoryData = data.expenseByCategory.map((item) => ({
    name: item.category,
    value: item.total,
  }));

  const periodLabel = {
    all: "Todo o período",
    month: "Este mês",
    year: "Este ano",
    custom: `${data.startDate} a ${data.endDate}`,
  }[data.period];

  return (
    <Shell>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Dashboard"
          description="Visão geral das finanças da Vender.IA"
        >
          <form className="flex flex-wrap items-center justify-end gap-2">
            <select
              name="period"
              defaultValue={period}
              className="h-11 rounded-xl border border-slate-700 bg-slate-900/50 px-4 text-sm text-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Geral</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
              <option value="custom">Personalizado</option>
            </select>
            {period === "custom" && (
              <>
                <label className="sr-only" htmlFor="startDate">Data inicial</label>
                <input id="startDate" type="date" name="startDate" defaultValue={startDate} className="h-11 rounded-xl border border-slate-700 bg-slate-900/50 px-3 text-sm text-white" />
                <label className="sr-only" htmlFor="endDate">Data final</label>
                <input id="endDate" type="date" name="endDate" defaultValue={endDate} className="h-11 rounded-xl border border-slate-700 bg-slate-900/50 px-3 text-sm text-white" />
              </>
            )}
            <Button type="submit">Filtrar</Button>
          </form>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Receitas"
            value={data.totals.revenue}
            icon={ArrowUpRight}
            variant="success"
            trend={periodLabel}
          />
          <StatCard
            title="Despesas"
            value={data.totals.expense}
            icon={ArrowDownRight}
            variant="danger"
            trend={`Pago: ${formatCurrency(data.totals.paidExpenses)}`}
          />
          <StatCard
            title="Saldo"
            value={data.totals.balance}
            icon={Wallet}
            variant={data.totals.balance >= 0 ? "success" : "danger"}
            trend={`Pendente: ${formatCurrency(data.totals.pendingExpenses)}`}
          />
          <StatCard
            title="Empresas Ativas"
            value={data.byCompany.length}
            icon={Building2}
            variant="warning"
            trend="Empresas fechadas"
          />
        </div>

        <Card className="card-gradient border-slate-800 glow-blue">
          <CardHeader>
            <CardTitle className="text-lg text-white">Receitas x Despesas por mês</CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyTrend.length > 0 ? (
              <MonthlyTrendChart data={data.monthlyTrend} />
            ) : (
              <EmptyState message="Nenhum dado para o período selecionado." />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-gradient border-slate-800 glow-blue">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Receitas x Despesas por Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <MonthlyBarChart data={chartData} />
              ) : (
                <EmptyState message="Nenhum dado para o período selecionado." />
              )}
            </CardContent>
          </Card>

          <Card className="card-gradient border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Receitas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueCategoryData.length > 0 ? (
                <CategoryPieChart data={revenueCategoryData} />
              ) : (
                <EmptyState message="Nenhuma receita no período." />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-gradient border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategoryData.length > 0 ? (
                <CategoryPieChart data={expenseCategoryData} />
              ) : (
                <EmptyState message="Nenhuma despesa no período." />
              )}
            </CardContent>
          </Card>

          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-white">
                Resumo por Empresa
              </CardTitle>
              <Link href="/empresas">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.byCompany.map((item) => (
                  <Link
                    key={item.company.id}
                    href={`/empresas/${item.company.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.company.color }}
                      />
                      <div>
                        <p className="font-medium text-white">
                          {item.company.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.company.isPersonal ? "Gasto pessoal" : "Empresa"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          item.balance >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {formatCurrency(item.balance)}
                      </p>
                      <p className="text-xs text-slate-500">
                        R {formatCurrency(item.revenue)} / D{" "}
                        {formatCurrency(item.expense)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-gradient border-slate-800">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <CalendarClock className="h-5 w-5 text-amber-400" />
            </div>
            <CardTitle className="text-lg text-white">
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingExpenses.map((item) => (
                <div
                  key={item.expense.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                >
                  <div>
                    <p className="font-medium text-white">
                      {item.expense.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.company?.name} • {formatDate(item.expense.dueDate)}
                    </p>
                  </div>
                  <p className="font-bold text-rose-400">
                    {formatCurrency(item.expense.amount)}
                  </p>
                </div>
              ))}
            </div>
            {upcomingExpenses.length === 0 && (
              <EmptyState message="Nenhuma despesa pendente próxima do vencimento." />
            )}
          </CardContent>
        </Card>
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
