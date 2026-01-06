create extension if not exists "pgcrypto";

create type role_type as enum ('ADMIN', 'OPERADOR', 'GESTOR');
create type fornecedor_tipo as enum ('COMBUSTIVEL', 'MANUTENCAO', 'INSUMO');

create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role role_type not null default 'OPERADOR',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists equipamentos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  descricao text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo fornecedor_tipo not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists tipos_servico (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists horimetros (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references equipamentos(id),
  data_referencia date not null,
  leitura numeric(10,2) not null,
  observacao text,
  usuario_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists servicos (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references equipamentos(id),
  tipo_servico_id uuid not null references tipos_servico(id),
  fornecedor_id uuid references fornecedores(id),
  data_servico date not null,
  descricao text not null,
  custo numeric(12,2) not null,
  usuario_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists abastecimentos (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references equipamentos(id),
  fornecedor_id uuid not null references fornecedores(id),
  data_abastecimento date not null,
  litros numeric(12,2) not null,
  valor_total numeric(12,2) not null,
  usuario_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id),
  entidade text not null,
  entidade_id uuid not null,
  acao text not null,
  created_at timestamptz not null default now()
);

create index if not exists horimetros_equipamento_idx on horimetros(equipamento_id, data_referencia desc);
create index if not exists servicos_equipamento_idx on servicos(equipamento_id, data_servico desc);
create index if not exists abastecimentos_equipamento_idx on abastecimentos(equipamento_id, data_abastecimento desc);
