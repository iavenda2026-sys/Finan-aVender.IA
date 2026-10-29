import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/queries";
import { formatCurrency } from "@/lib/formatters";
import { CategoryPieChart, MonthlyBarChart } from "@/components/charts";
import { TrendingUp, TrendingDown, PiggyBank, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const month =
    (typeof params.month === "string" ? params.month : undefined) ||
    new Date().toISOString().slice(0, 7);

  const data = await getDashboardData({ period: "custom", startDate: `${month}-01`, endDate: `${month}-31` });

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

  const personal = data.byCompany.filter((item) => item.company.isPersonal);
  const business = data.byCompany.filter((item) => !item.company.isPersonal);

  const personalBalance = personal.reduce((acc, item) => acc + item.balance, 0);
  const businessBalance = business.reduce((acc, item) => acc + item.balance, 0);

  return (
    <Shell>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Relatórios"
          description="Análise detalhada das finanças por período"
        >
          <form className="flex items-center gap-2">
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="h-11 rounded-xl border border-slate-700 bg-slate-900/50 px-4 text-sm text-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Filtrar
            </button>
          </form>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-sm text-slate-400">
                Receitas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(data.totals.revenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <TrendingDown className="h-5 w-5 text-rose-400" />
              <CardTitle className="text-sm text-slate-400">
                Despesas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-rose-400">
                {formatCurrency(data.totals.expense)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <PiggyBank className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-sm text-slate-400">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  data.totals.balance >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {formatCurrency(data.totals.balance)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Users className="h-5 w-5 text-sky-400" />
              <CardTitle className="text-sm text-slate-400">
                Por Sócio (50%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-sky-400">
                {formatCurrency(data.totals.balance * 0.5)}
              </p>
            </CardContent>
          </Card>
        </div>

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
                <EmptyState message="Nenhum dado para o período." />
              )}
            </CardContent>
          </Card>

          <Card className="card-gradient border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Distribuição Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Empresas</span>
                    <span
                      className={`font-bold ${
                        businessBalance >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {formatCurrency(businessBalance)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            (businessBalance /
                              (Math.abs(data.totals.balance) || 1)) *
                              100,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Pessoal</span>
                    <span
                      className={`font-bold ${
                        personalBalance >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {formatCurrency(personalBalance)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            (personalBalance /
                              (Math.abs(data.totals.balance) || 1)) *
                              100,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                  <p className="text-sm font-medium text-slate-400">
                    Divisão entre sócios
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-white">Sócio 1</span>
                    <span className="font-bold text-blue-400">
                      {formatCurrency(data.totals.balance * 0.5)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-white">Sócio 2</span>
                    <span className="font-bold text-sky-400">
                      {formatCurrency(data.totals.balance * 0.5)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
        </div>
      </div>
    </Shell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-slate-800/50 p-4">
        <PiggyBank className="h-8 w-8 text-slate-600" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{message}</p>
    </div>
  );
}
