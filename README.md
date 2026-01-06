# LOCPEL MVP

Sistema web MVP para lançamentos operacionais (horímetro, serviços e abastecimentos) com autenticação via Supabase.

## ✅ Stack

- Next.js + Tailwind CSS
- React Hook Form + Zod
- Supabase (Auth + Postgres)

## ⚙️ Configuração

1. Crie o projeto no Supabase.
2. Execute o script SQL `supabase_schema.sql` no SQL Editor.
3. Configure as variáveis de ambiente:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> ⚠️ A service role é usada apenas no backend (API routes) para CRUD e auditoria.

## ▶️ Rodando localmente

```bash
npm install
npm run dev
```

A aplicação estará em `http://localhost:3000`.

## 📋 Funcionalidades do MVP

- Login via Supabase Auth
- Cadastros de equipamentos, fornecedores e tipos de serviço
- Lançamento de horímetro com validação de leitura
- Lançamento de serviços e abastecimentos
- Relatórios simples com exportação CSV
- Auditoria básica das ações de escrita

## 🧪 Dados iniciais

Crie um usuário no Supabase Auth e registre o perfil correspondente em `usuarios`:

```sql
insert into usuarios (id, nome, role, ativo)
values ('<uuid-do-auth.users>', 'Administrador', 'ADMIN', true);
```
