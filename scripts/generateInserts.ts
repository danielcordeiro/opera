/**
 * Script para gerar INSERTs SQL a partir da planilha LOCPEL.xlsx
 * 
 * Uso:
 *   npx ts-node scripts/generateInserts.ts
 * 
 * Saída: arquivo SQL com todos os INSERTs gerados
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface Equipamento {
  equipamento: string;
  marca?: string;
  modelo?: string;
  identificacao?: string;
  placa?: string;
  tipo?: string;
  operador?: string;
}

interface Fornecedor {
  nome: string;
}

interface TipoServico {
  nome: string;
}

interface Servico {
  data: any;
  equipamento: string;
  fornecedor?: string;
  custo?: string | number | null;
  descricao?: string;
  tipoServico?: string;
}

interface Horimetro {
  data: any;
  equipamento: string;
  leitura: any;
  observacao?: string;
}

class LocpelToSQL {
  private workbook: XLSX.WorkBook;
  private sqlOutput: string[] = [];
  private usuarioId: string;

  constructor(filePath: string, usuarioId: string = '00000000-0000-0000-0000-000000000000') {
    this.workbook = XLSX.readFile(filePath);
    this.usuarioId = usuarioId;
    this.sqlOutput.push('-- Script gerado automaticamente a partir de LOCPEL.xlsx');
    this.sqlOutput.push(`-- Data: ${new Date().toISOString()}`);
    this.sqlOutput.push('');
    this.sqlOutput.push('BEGIN;');
    this.sqlOutput.push('');
  }

  /**
   * Processa todas as abas da planilha
   */
  public processAll(): void {
    console.log('📊 Processando planilha LOCPEL.xlsx...\n');
    
    this.processEquipamentos();
    this.processFornecedores();
    this.processTiposServico();
    this.processServicos();
    this.processHorimetros();

    this.sqlOutput.push('');
    this.sqlOutput.push('COMMIT;');
  }

  /**
   * Processa a aba "Equipamentos"
   */
  private processEquipamentos(): void {
    console.log('🔧 Processando Equipamentos...');
    
    const sheetName = this.findSheet(['Equipamentos', 'Equipamento']);
    if (!sheetName) {
      console.log('⚠️  Aba de Equipamentos não encontrada');
      return;
    }

    const sheet = this.workbook.Sheets[sheetName];
    const data: Equipamento[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      .slice(2) // Pula cabeçalhos
      .filter((row: any) => row[0] || row[3]) // Filtra linhas vazias
      .map((row: any) => ({
        equipamento: this.cleanString(row[0]),
        marca: this.cleanString(row[1]),
        modelo: this.cleanString(row[2]),
        identificacao: this.cleanString(row[3]),
        placa: this.cleanString(row[4]),
        tipo: this.cleanString(row[5]),
        operador: this.cleanString(row[6])
      }));

    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('-- EQUIPAMENTOS');
    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('');

    const uniqueEquipamentos = this.deduplicateEquipamentos(data);
    console.log(`   ✓ ${uniqueEquipamentos.length} equipamentos encontrados`);

    uniqueEquipamentos.forEach(eq => {
      const codigo = eq.identificacao || eq.equipamento;
      const descricao = eq.equipamento || eq.identificacao;
      
      if (codigo && descricao) {
        this.sqlOutput.push(
          `INSERT INTO equipamentos (codigo, descricao, ativo) VALUES (${this.sqlString(codigo)}, ${this.sqlString(descricao)}, true) ON CONFLICT DO NOTHING;`
        );
      }
    });

    this.sqlOutput.push('');
  }

  /**
   * Processa a aba "Fornecedor" ou "Fornecedores"
   */
  private processFornecedores(): void {
    console.log('🏪 Processando Fornecedores...');
    
    const sheetName = this.findSheet(['Fornecedor', 'Fornecedores']);
    if (!sheetName) {
      console.log('⚠️  Aba de Fornecedores não encontrada');
      return;
    }

    const sheet = this.workbook.Sheets[sheetName];
    const data: Fornecedor[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      .slice(1) // Pula cabeçalho
      .filter((row: any) => row[0]) // Filtra linhas vazias
      .map((row: any) => ({
        nome: this.cleanString(row[0])
      }));

    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('-- FORNECEDORES');
    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('');

    const uniqueFornecedores = [...new Set(data.map(f => f.nome))].filter(Boolean);
    console.log(`   ✓ ${uniqueFornecedores.length} fornecedores encontrados`);

    uniqueFornecedores.forEach(nome => {
      // Tipo padrão: MANUTENCAO (pode ser ajustado manualmente)
      this.sqlOutput.push(
        `INSERT INTO fornecedores (nome, tipo, ativo) VALUES (${this.sqlString(nome)}, 'MANUTENCAO', true) ON CONFLICT DO NOTHING;`
      );
    });

    this.sqlOutput.push('');
  }

  /**
   * Processa a aba "Tipos de Serviço"
   */
  private processTiposServico(): void {
    console.log('🛠️  Processando Tipos de Serviço...');
    
    const sheetName = this.findSheet(['Tipos de Serviço', 'Tipos de Servico', 'TiposServico']);
    if (!sheetName) {
      console.log('⚠️  Aba de Tipos de Serviço não encontrada');
      return;
    }

    const sheet = this.workbook.Sheets[sheetName];
    const data: TipoServico[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      .filter((row: any) => row[0]) // Filtra linhas vazias
      .map((row: any) => ({
        nome: this.cleanString(row[0])
      }));

    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('-- TIPOS DE SERVIÇO');
    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('');

    const uniqueTipos = [...new Set(data.map(t => t.nome))].filter(Boolean);
    console.log(`   ✓ ${uniqueTipos.length} tipos de serviço encontrados`);

    uniqueTipos.forEach(nome => {
      this.sqlOutput.push(
        `INSERT INTO tipos_servico (nome, descricao, ativo) VALUES (${this.sqlString(nome)}, ${this.sqlString(nome)}, true) ON CONFLICT DO NOTHING;`
      );
    });

    this.sqlOutput.push('');
  }

  /**
   * Processa a aba "Lançamentos Serviços"
   */
  private processServicos(): void {
    console.log('📋 Processando Serviços...');
    
    const sheetName = this.findSheet(['Lançamentos Serviços', 'Lancamentos Servicos', 'Servicos']);
    if (!sheetName) {
      console.log('⚠️  Aba de Serviços não encontrada');
      return;
    }

    const sheet = this.workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Filtra linhas com dados relevantes
    const data: Servico[] = rawData
      .filter((row: any) => row[0] && row[0] !== 'DATA' && row[1]) // Tem data e equipamento
      .map((row: any) => ({
        data: this.parseDate(row[0]),
        equipamento: this.cleanString(row[1]),
        fornecedor: this.cleanString(row[2]),
        custo: this.parseNumber(row[3]),
        descricao: this.cleanString(row[4]) || this.cleanString(row[2]),
        tipoServico: this.cleanString(row[4])
      }));

    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('-- SERVIÇOS');
    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('-- NOTA: Este script usa subqueries para buscar os IDs.');
    this.sqlOutput.push('-- Certifique-se de que equipamentos, fornecedores e tipos de serviço já foram inseridos.');
    this.sqlOutput.push('-- IMPORTANTE: Serviços sem tipo_servico_id válido NÃO são incluídos (campo obrigatório).');
    this.sqlOutput.push('');

    console.log(`   ✓ ${data.length} serviços encontrados`);

    let servicosValidos = 0;
    let servicosIgnorados = 0;

    data.forEach((servico, index) => {
      // Requisitos obrigatórios: data, equipamento, custo E tipo de serviço
      if (servico.data && 
          servico.equipamento && 
          servico.custo !== null && 
          servico.custo !== undefined &&
          servico.tipoServico) { // Tipo de serviço é obrigatório!
        
        // Valida se equipamento e tipo de serviço existem na base
        this.sqlOutput.push(
          `INSERT INTO servicos (equipamento_id, tipo_servico_id, fornecedor_id, data_servico, descricao, custo, usuario_id)`
        );
        this.sqlOutput.push(`SELECT`);
        this.sqlOutput.push(`  (SELECT id FROM equipamentos WHERE codigo = ${this.sqlString(servico.equipamento)} OR descricao = ${this.sqlString(servico.equipamento)} LIMIT 1) as equipamento_id,`);
        this.sqlOutput.push(`  (SELECT id FROM tipos_servico WHERE nome = ${this.sqlString(servico.tipoServico)} LIMIT 1) as tipo_servico_id,`);
        this.sqlOutput.push(`  (SELECT id FROM fornecedores WHERE nome = ${this.sqlString(servico.fornecedor)} LIMIT 1) as fornecedor_id,`);
        this.sqlOutput.push(`  ${this.sqlDate(servico.data)} as data_servico,`);
        this.sqlOutput.push(`  ${this.sqlString(servico.descricao)} as descricao,`);
        this.sqlOutput.push(`  ${servico.custo} as custo,`);
        this.sqlOutput.push(`  ${this.sqlString(this.usuarioId)}::uuid as usuario_id`);
        this.sqlOutput.push(`WHERE EXISTS (SELECT 1 FROM equipamentos WHERE codigo = ${this.sqlString(servico.equipamento)} OR descricao = ${this.sqlString(servico.equipamento)})`);
        this.sqlOutput.push(`  AND EXISTS (SELECT 1 FROM tipos_servico WHERE nome = ${this.sqlString(servico.tipoServico)});`);
        this.sqlOutput.push('');
        servicosValidos++;
      } else {
        servicosIgnorados++;
      }
    });

    console.log(`   ℹ️  ${servicosValidos} serviços válidos gerados`);
    console.log(`   ⚠️  ${servicosIgnorados} serviços ignorados (sem tipo de serviço ou dados incompletos)`);
  }

  /**
   * Processa todas as abas de Horímetros
   */
  private processHorimetros(): void {
    console.log('⏱️  Processando Horímetros...');
    
    const horimetroSheets = this.workbook.SheetNames.filter(name => 
      name.toLowerCase().includes('horimetro') || 
      name.toLowerCase().includes('horímetro')
    );

    if (horimetroSheets.length === 0) {
      console.log('⚠️  Nenhuma aba de Horímetros encontrada');
      return;
    }

    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push('-- HORÍMETROS');
    this.sqlOutput.push('-- ========================================');
    this.sqlOutput.push(`-- Encontradas ${horimetroSheets.length} abas de horímetros`);
    this.sqlOutput.push('');

    let totalHorimetros = 0;

    horimetroSheets.forEach(sheetName => {
      console.log(`   📄 Processando aba: ${sheetName}`);
      
      const sheet = this.workbook.Sheets[sheetName];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      // Filtra e processa as linhas
      const data: Horimetro[] = rawData
        .filter((row: any) => row[0] && row[0] !== 'DATA INÍCIAL' && row[1]) // Tem data e equipamento
        .map((row: any) => ({
          data: this.parseDate(row[0]),
          equipamento: this.cleanString(row[1]),
          leitura: this.parseNumber(row[6]), // Coluna típica de leitura
          observacao: `Importado de: ${sheetName}`
        }));

      totalHorimetros += data.length;

      data.forEach(horimetro => {
        if (horimetro.data && horimetro.equipamento && horimetro.leitura !== null && horimetro.leitura !== undefined) {
          this.sqlOutput.push(
            `INSERT INTO horimetros (equipamento_id, data_referencia, leitura, observacao, usuario_id)`
          );
          this.sqlOutput.push(`SELECT`);
          this.sqlOutput.push(`  (SELECT id FROM equipamentos WHERE codigo = ${this.sqlString(horimetro.equipamento)} OR descricao = ${this.sqlString(horimetro.equipamento)} LIMIT 1) as equipamento_id,`);
          this.sqlOutput.push(`  ${this.sqlDate(horimetro.data)} as data_referencia,`);
          this.sqlOutput.push(`  ${horimetro.leitura} as leitura,`);
          this.sqlOutput.push(`  ${this.sqlString(horimetro.observacao)} as observacao,`);
          this.sqlOutput.push(`  ${this.sqlString(this.usuarioId)}::uuid as usuario_id`);
          this.sqlOutput.push(`WHERE EXISTS (SELECT 1 FROM equipamentos WHERE codigo = ${this.sqlString(horimetro.equipamento)} OR descricao = ${this.sqlString(horimetro.equipamento)});`);
          this.sqlOutput.push('');
        }
      });
    });

    console.log(`   ✓ ${totalHorimetros} horímetros encontrados em ${horimetroSheets.length} abas`);
  }

  /**
   * Salva o arquivo SQL gerado
   */
  public saveSQL(outputPath: string): void {
    fs.writeFileSync(outputPath, this.sqlOutput.join('\n'), 'utf8');
    console.log(`\n✅ Arquivo SQL gerado: ${outputPath}`);
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  /**
   * Encontra uma aba pelo nome (case-insensitive)
   */
  private findSheet(names: string[]): string | null {
    for (const name of names) {
      const found = this.workbook.SheetNames.find(
        sheet => sheet.toLowerCase() === name.toLowerCase()
      );
      if (found) return found;
    }
    return null;
  }

  /**
   * Remove duplicatas de equipamentos baseado no código
   */
  private deduplicateEquipamentos(equipamentos: Equipamento[]): Equipamento[] {
    const seen = new Set<string>();
    return equipamentos.filter(eq => {
      const key = (eq.identificacao || eq.equipamento).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Limpa e normaliza strings
   */
  private cleanString(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  /**
   * Converte string para formato SQL
   */
  private sqlString(value: string | undefined | null): string {
    if (!value) return 'NULL';
    return `'${value.replace(/'/g, "''")}'`;
  }

  /**
   * Converte data para formato SQL
   */
  private sqlDate(value: any): string {
    if (!value) return 'NULL';
    
    const date = this.parseDate(value);
    if (!date) return 'NULL';
    
    return `'${date}'`;
  }

  /**
   * Parseia data de diversos formatos
   */
  private parseDate(value: any): string | null {
    if (!value) return null;

    // Se é um número (formato Excel serial date)
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    // Se é uma string de data
    if (typeof value === 'string') {
      const cleaned = value.trim();
      
      // Formato DD/MM/YYYY
      const match1 = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match1) {
        const [, day, month, year] = match1;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Formato YYYY-MM-DD
      const match2 = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (match2) {
        const [, year, month, day] = match2;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    // Se é um objeto Date
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  /**
   * Parseia número removendo caracteres não numéricos
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      // Remove tudo exceto dígitos, vírgulas, pontos e sinais negativos
      const cleaned = value.replace(/[^\d,.-]/g, '');
      
      // Substitui vírgula por ponto (formato brasileiro)
      const normalized = cleaned.replace(',', '.');
      
      const num = parseFloat(normalized);
      return isNaN(num) ? null : num;
    }
    
    return null;
  }
}

// ========================================
// EXECUÇÃO
// ========================================

function main() {
  const inputPath = path.join(__dirname, '../arquivo/LOCPEL.xlsx');
  const outputPath = path.join(__dirname, '../arquivo/locpel_inserts.sql');
  
  // UUID do usuário que será atribuído aos registros
  // Você pode passar como argumento: npx ts-node scripts/generateInserts.ts <uuid>
  const usuarioId = process.argv[2] || '00000000-0000-0000-0000-000000000000';

  console.log('╔═══════════════════════════════════════╗');
  console.log('║  Gerador de INSERTs - LOCPEL.xlsx     ║');
  console.log('╚═══════════════════════════════════════╝\n');

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Arquivo não encontrado: ${inputPath}`);
    process.exit(1);
  }

  try {
    const generator = new LocpelToSQL(inputPath, usuarioId);
    generator.processAll();
    generator.saveSQL(outputPath);
    
    console.log('\n✨ Processamento concluído com sucesso!\n');
    console.log('Próximos passos:');
    console.log('1. Revise o arquivo SQL gerado');
    console.log('2. Ajuste os tipos de fornecedores conforme necessário');
    console.log('3. Execute o script no Supabase ou PostgreSQL');
  } catch (error) {
    console.error('\n❌ Erro ao processar planilha:', error);
    process.exit(1);
  }
}

// Executa apenas se for o arquivo principal
if (require.main === module) {
  main();
}

export { LocpelToSQL };
