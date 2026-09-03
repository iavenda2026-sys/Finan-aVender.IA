import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { getCompanies, getRevenues, getExpenses } from "@/lib/queries";
import { CompanyForm } from "./company-form";
import { CompanyCard } from "./company-card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const [companies, allRevenues, allExpenses] = await Promise.all([
    getCompanies(),
    getRevenues(),
    getExpenses(),
  ]);

  const companyStats = companies.map((company) => {
    const revenue = allRevenues
      .filter((item) => item.revenue.companyId === company.id)
      .reduce((acc, item) => acc + Number(item.revenue.amount), 0);
    const expense = allExpenses
      .filter((item) => item.expense.companyId === company.id)
      .reduce((acc, item) => acc + Number(item.expense.amount), 0);
    return { ...company, revenue, expense };
  });

  return (
    <Shell>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Empresas"
          description="Gerencie as empresas fechadas e gastos pessoais"
        >
          <CompanyForm />
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companyStats.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {companies.length === 0 && (
          <Card className="card-gradient border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-slate-800/50 p-4">
                <Building2 className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">
                Nenhuma empresa cadastrada
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Cadastre a primeira empresa para começar a controlar as finanças.
              </p>
              <div className="mt-6">
                <CompanyForm />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
