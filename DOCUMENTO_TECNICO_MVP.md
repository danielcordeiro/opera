# 📄 Documento Técnico – MVP

## Sistema Operacional LOCPEL

**Versão:** MVP v1.0
**Infra:** Render + Supabase
**Escopo:** Substituição da planilha (sem upload de arquivos)

---

## 1. Objetivo do Sistema

Criar um sistema web simples, seguro e multiusuário para substituir a planilha operacional existente, permitindo:

* Lançamentos manuais centralizados
* Histórico único (sem abas mensais)
* Controle de acesso por usuário
* Rastreabilidade básica das alterações
* Consulta e exportação de dados

O sistema **não terá upload de arquivos, anexos ou integrações externas no MVP**.

---

## 2. Escopo do MVP

### Incluído

* Autenticação de usuários
* Cadastros básicos
* Lançamento de horímetro
* Lançamento de serviços
* Lançamento de abastecimento
* Relatórios simples em tabela
* Auditoria básica

### Fora do escopo

* Upload de planilhas
* Armazenamento de arquivos
* Dashboards gráficos
* Alertas automáticos
* Integrações externas
* Indicadores avançados

---

## 3. Stack Tecnológica

### Frontend

* **Next.js**
* **Tailwind CSS**
* **React Hook Form**
* **Zod** (validações)
* **TanStack Table** (listagens)

### Backend

* **Node.js 18+**
* **NestJS** (ou Express estruturado)
* **Supabase Client (Postgres)**
* **Supabase Auth**
* **JWT**

### Infraestrutura

* **Render** (API + Frontend)
* **Supabase** (Auth + PostgreSQL)

---

## 4. Autenticação e Perfis

### Autenticação

* Email + senha via Supabase Auth
* Sessão protegida por JWT

### Perfis (role)

* **ADMIN** – acesso total
* **OPERADOR** – lançamentos
* **GESTOR** – leitura e relatórios

O perfil será salvo em tabela própria vinculada ao `auth.users`.

---

## 5. Modelagem de Dados (MVP)

### 5.1 Usuários

```sql
usuarios
- id (uuid, ref auth.users)
- nome
- role (ADMIN | OPERADOR | GESTOR)
- ativo
- created_at
```

---

### 5.2 Equipamentos

```sql
equipamentos
- id
- codigo
- descricao
- ativo
- created_at
```

---

### 5.3 Fornecedores

```sql
fornecedores
- id
- nome
- tipo (COMBUSTIVEL | MANUTENCAO | INSUMO)
- ativo
- created_at
```

---

### 5.4 Tipos de Serviço

```sql
tipos_servico
- id
- nome
- descricao
- ativo
```

---

### 5.5 Horímetro (CORE do sistema)

```sql
horimetros
- id
- equipamento_id
- data_referencia
- leitura
- observacao
- usuario_id
- created_at
```

#### Regras de negócio

* Não permitir leitura menor que a última do equipamento
* Diferença entre leituras = horas trabalhadas
* Sempre mostrar leitura anterior no formulário

---

### 5.6 Serviços Executados

```sql
servicos
- id
- equipamento_id
- tipo_servico_id
- fornecedor_id (opcional)
- data_servico
- descricao
- custo
- usuario_id
- created_at
```

---

### 5.7 Abastecimentos

```sql
abastecimentos
- id
- equipamento_id
- fornecedor_id
- data_abastecimento
- litros
- valor_total
- usuario_id
- created_at
```

---

### 5.8 Auditoria Básica

```sql
audit_log
- id
- usuario_id
- entidade
- entidade_id
- acao (CREATE | UPDATE)
- created_at
```

📌 Apenas registro simples (sem diff detalhado).

---

## 6. Telas do Sistema (MVP)

### 6.1 Login

* Email
* Senha

---

### 6.2 Dashboard Inicial

* Atalhos:

  * Equipamentos
  * Horímetro
  * Serviços
  * Abastecimento
  * Relatórios

---

### 6.3 Cadastros

* Equipamentos (CRUD)
* Fornecedores (CRUD)
* Tipos de Serviço (CRUD)

---

### 6.4 Horímetro

* Listagem por equipamento
* Filtro por período
* Lançamento manual
* Exibição da leitura anterior e diferença

---

### 6.5 Serviços

* Lançar serviço
* Listar serviços por equipamento ou período

---

### 6.6 Abastecimento

* Registrar abastecimento
* Listagem por equipamento/período

---

### 6.7 Relatórios

* Tabelas simples:

  * Horímetro por período
  * Serviços por período
  * Abastecimento por período
* Exportação CSV (frontend)

---

## 7. Regras Gerais do MVP

* Exclusões devem ser evitadas (preferir inativar)
* Campos obrigatórios devem ser validados no frontend e backend
* Todas as ações de escrita geram auditoria
* Interface simples e funcional (não priorizar design complexo)

---

## 8. Estrutura de Pastas (sugestão)

```text
src/
 ├── auth/
 ├── usuarios/
 ├── equipamentos/
 ├── fornecedores/
 ├── tipos-servico/
 ├── horimetros/
 ├── servicos/
 ├── abastecimentos/
 ├── audit/
 └── shared/
```

---

## 9. Entregáveis Esperados

* Repositório Git
* Frontend funcional (Next + Tailwind)
* API funcional (Node)
* Banco Supabase com tabelas criadas
* README.md com instruções de uso
* Script SQL inicial

---

## 10. Estimativa de Desenvolvimento

⏱️ **10 a 12 dias úteis**, considerando:

* 1 desenvolvedor
* MVP sem integrações
* Layout simples

---

## 11. Observação Final

Este MVP **substitui a planilha para operação diária**.
A planilha antiga deve permanecer apenas para **consulta histórica**, sem novas edições.

---
