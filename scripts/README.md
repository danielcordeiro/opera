# Gerador de Scripts SQL - LOCPEL.xlsx

Este script TypeScript processa a planilha `LOCPEL.xlsx` e gera automaticamente scripts SQL INSERT para popular o banco de dados Supabase.

## 📋 Funcionalidades

O script processa as seguintes abas da planilha:

- **Equipamentos**: Extrai código, descrição e outros dados dos equipamentos
- **Fornecedores**: Lista todos os fornecedores (tipo padrão: MANUTENCAO)
- **Tipos de Serviço**: Importa os tipos de serviço disponíveis
- **Lançamentos Serviços**: Converte os serviços realizados em INSERTs com referências
- **Horímetros**: Processa TODAS as abas que contêm "horimetro" ou "horímetro" no nome

## 🚀 Como Usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Executar o gerador

```bash
npm run generate-inserts
```

Ou com um UUID de usuário específico:

```bash
npm run generate-inserts <seu-uuid-aqui>
```

Ou diretamente com ts-node:

```bash
npx ts-node scripts/generateInserts.ts
npx ts-node scripts/generateInserts.ts 12345678-1234-1234-1234-123456789abc
```

### 3. Verificar o arquivo gerado

O script gera o arquivo `arquivo/locpel_inserts.sql` com todos os INSERTs necessários.

## 📁 Estrutura do Arquivo Gerado

```sql
BEGIN;

-- ========================================
-- EQUIPAMENTOS
-- ========================================
INSERT INTO equipamentos (codigo, descricao, ativo) VALUES (...);

-- ========================================
-- FORNECEDORES
-- ========================================
INSERT INTO fornecedores (nome, tipo, ativo) VALUES (...);

-- ========================================
-- TIPOS DE SERVIÇO
-- ========================================
INSERT INTO tipos_servico (nome, descricao, ativo) VALUES (...);

-- ========================================
-- SERVIÇOS
-- ========================================
INSERT INTO servicos (...) SELECT ... WHERE EXISTS (...);

-- ========================================
-- HORÍMETROS
-- ========================================
INSERT INTO horimetros (...) SELECT ... WHERE EXISTS (...);

COMMIT;
```

## 🔧 Características Técnicas

### Parsing Inteligente

- **Datas**: Suporta formatos Excel, DD/MM/YYYY, YYYY-MM-DD
- **Números**: Remove formatação e converte vírgulas em pontos
- **Strings**: Limpa espaços e escapa aspas simples

### Deduplicação

- Remove equipamentos duplicados baseado no código
- Remove fornecedores e tipos de serviço duplicados

### Relacionamentos

- Usa subqueries para buscar IDs de equipamentos, fornecedores e tipos de serviço
- Adiciona cláusulas `WHERE EXISTS` para evitar erros de FK

### Segurança

- Usa `ON CONFLICT DO NOTHING` para evitar duplicatas
- Escapa strings corretamente para SQL
- Usa transações (BEGIN/COMMIT)

## ⚙️ Personalização

### Alterar o UUID do usuário

Passe como argumento na linha de comando:

```bash
npx ts-node scripts/generateInserts.ts <uuid-do-usuario>
```

### Ajustar tipo de fornecedor

Por padrão, todos os fornecedores são importados como `MANUTENCAO`. Edite manualmente o SQL gerado ou modifique a função `processFornecedores()` no script.

### Ajustar colunas de horímetros

Se as colunas da planilha estiverem em posições diferentes, ajuste o índice na linha:

```typescript
leitura: this.parseNumber(row[6]), // Altere o número conforme necessário
```

## 📊 Exemplo de Saída

```
╔═══════════════════════════════════════╗
║  Gerador de INSERTs - LOCPEL.xlsx     ║
╚═══════════════════════════════════════╝

📊 Processando planilha LOCPEL.xlsx...

🔧 Processando Equipamentos...
   ✓ 25 equipamentos encontrados
🏪 Processando Fornecedores...
   ✓ 12 fornecedores encontrados
🛠️  Processando Tipos de Serviço...
   ✓ 8 tipos de serviço encontrados
📋 Processando Serviços...
   ✓ 143 serviços encontrados
⏱️  Processando Horímetros...
   📄 Processando aba: Horímetro Jan 2024
   📄 Processando aba: Horímetro Fev 2024
   📄 Processando aba: Horímetro Mar 2024
   ✓ 456 horímetros encontrados em 12 abas

✅ Arquivo SQL gerado: arquivo/locpel_inserts.sql

✨ Processamento concluído com sucesso!

Próximos passos:
1. Revise o arquivo SQL gerado
2. Ajuste os tipos de fornecedores conforme necessário
3. Execute o script no Supabase ou PostgreSQL
```

## 🐛 Troubleshooting

### "Aba não encontrada"

Verifique se o nome da aba na planilha corresponde aos nomes esperados. O script busca por:
- Equipamentos: "Equipamentos", "Equipamento"
- Fornecedores: "Fornecedor", "Fornecedores"
- Tipos de Serviço: "Tipos de Serviço", "Tipos de Servico", "TiposServico"
- Serviços: "Lançamentos Serviços", "Lancamentos Servicos", "Servicos"
- Horímetros: Qualquer aba com "horimetro" ou "horímetro" no nome

### Datas não estão sendo convertidas

O script suporta múltiplos formatos. Se suas datas não estão funcionando, verifique o formato na função `parseDate()` e adicione o padrão necessário.

### Valores NULL nos INSERTs

Verifique se as colunas na planilha estão nas posições esperadas. Ajuste os índices no código conforme necessário.

## 📝 Notas

- **Backup**: Sempre faça backup do banco antes de executar os INSERTs
- **Validação**: Revise o SQL gerado antes de executar
- **Tipos de Fornecedor**: Ajuste manualmente os tipos (COMBUSTIVEL, MANUTENCAO, INSUMO) conforme necessário
- **Performance**: Para grandes volumes, considere usar COPY em vez de INSERTs múltiplos

## 🔗 Arquivos Relacionados

- `scripts/generateInserts.ts` - Script principal
- `arquivo/LOCPEL.xlsx` - Planilha fonte
- `arquivo/locpel_inserts.sql` - SQL gerado (output)
- `supabase_schema.sql` - Schema do banco
- `Importação da planilha LOCPEL para o banco Supabase.txt` - Documentação original
