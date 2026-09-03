# Vender.IA - Gestão Financeira

Sistema completo e profissional de gestão financeira para a Vender.IA, com controle de receitas, despesas, empresas separadas e gastos pessoais.

## Funcionalidades

- **Dashboard**: visão geral financeira com gráficos e indicadores
- **Empresas**: cadastro e gestão de empresas fechadas + gastos pessoais
- **Receitas**: controle de entradas por categoria (Setup, Comissão, Dashboard, etc.)
- **Despesas**: controle de saídas com vencimentos, recorrência e status de pagamento
- **Relatórios**: análise detalhada por período com divisão entre sócios
- **Divisão entre sócios**: todos os valores calculados 50/50 automaticamente

## Tecnologias

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- PostgreSQL (local ou Supabase)
- Recharts

## Deploy na Vercel com Supabase

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **Project Settings > Database**
3. Copie as **Connection Strings**:
   - **Transaction mode** (para aplicação): `postgresql://postgres:[SENHA]@...pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Session mode** (para migrations): `postgresql://postgres:[SENHA]@...pooler.supabase.com:5432/postgres`

### 2. Configurar variáveis de ambiente na Vercel

Na Vercel, vá em **Project Settings > Environment Variables** e adicione:

```
DATABASE_URL=postgresql://postgres:[SENHA]@...pooler.supabase.com:6543/postgres?pgbouncer=true
MIGRATE_DATABASE_URL=postgresql://postgres:[SENHA]@...pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJETO].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY]
```

> **Importante**: Use `?pgbouncer=true` no `DATABASE_URL` para evitar erros de prepared statements no ambiente serverless.

### 3. Criar as tabelas no Supabase

Opção A - SQL Editor (recomendado):
1. No Supabase, vá em **SQL Editor > New query**
2. Cole o conteúdo do arquivo `supabase/migrations/0001_initial.sql`
3. Execute

Opção B - Drizzle Kit (local):
```bash
npm install
# Crie um .env.local com MIGRATE_DATABASE_URL (session mode)
npx drizzle-kit push
```

### 4. Fazer deploy

```bash
# Commit e push do projeto
git add .
git commit -m "Deploy Vender.IA Finance"
git push
```

Conecte o repositório na Vercel e faça o deploy.

### 5. Seed inicial

Após o deploy, acesse:

```bash
curl -X POST https://seu-dominio.vercel.app/api/seed
```

Isso criará as empresas iniciais:
- **Vender.IA**
- **Gastos Pessoais**

## Desenvolvimento local

```bash
npm install
# configure o DATABASE_URL no .env
npx drizzle-kit push
npm run dev
```

## Estrutura

- `src/app` - páginas e API routes
- `src/components` - componentes reutilizáveis
- `src/db/schema.ts` - schema do banco de dados
- `src/lib/queries.ts` - funções de consulta ao banco
- `src/lib/supabase.ts` - cliente Supabase (opcional)
- `supabase/migrations/` - scripts SQL para o Supabase
