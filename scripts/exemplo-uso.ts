/**
 * Exemplo de uso programático do LocpelToSQL
 * 
 * Este arquivo demonstra como usar a classe LocpelToSQL
 * em outros scripts ou aplicações Node.js
 */

import { LocpelToSQL } from './generateInserts';
import * as path from 'path';

// Exemplo 1: Uso básico
function exemploBasico() {
  const inputPath = path.join(__dirname, '../arquivo/LOCPEL.xlsx');
  const outputPath = path.join(__dirname, '../arquivo/locpel_inserts.sql');
  const usuarioId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // UUID do usuário

  const generator = new LocpelToSQL(inputPath, usuarioId);
  generator.processAll();
  generator.saveSQL(outputPath);
}

// Exemplo 2: Gerar SQL para múltiplos usuários
function exemploMultiplosUsuarios() {
  const usuarios = [
    { id: 'uuid-1', nome: 'admin' },
    { id: 'uuid-2', nome: 'operador1' },
    { id: 'uuid-3', nome: 'gestor1' }
  ];

  const inputPath = path.join(__dirname, '../arquivo/LOCPEL.xlsx');

  usuarios.forEach(usuario => {
    const outputPath = path.join(
      __dirname,
      `../arquivo/locpel_inserts_${usuario.nome}.sql`
    );

    console.log(`Gerando SQL para ${usuario.nome}...`);
    const generator = new LocpelToSQL(inputPath, usuario.id);
    generator.processAll();
    generator.saveSQL(outputPath);
  });
}

// Exemplo 3: Processar apenas em memória (sem salvar arquivo)
function exemploEmMemoria() {
  const inputPath = path.join(__dirname, '../arquivo/LOCPEL.xlsx');
  const usuarioId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  const generator = new LocpelToSQL(inputPath, usuarioId);
  generator.processAll();
  
  // Aqui você poderia enviar o SQL diretamente para o banco
  // ou processá-lo de outra forma
  console.log('SQL gerado em memória - pronto para uso');
}

// Exemplo 4: Integração com API
async function exemploAPI() {
  const inputPath = path.join(__dirname, '../arquivo/LOCPEL.xlsx');
  const usuarioId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  try {
    const generator = new LocpelToSQL(inputPath, usuarioId);
    generator.processAll();
    
    const outputPath = path.join(__dirname, '../arquivo/locpel_inserts.sql');
    generator.saveSQL(outputPath);

    // Aqui você poderia fazer upload do arquivo ou executar o SQL
    console.log('✅ SQL gerado com sucesso');
    
    // Exemplo de resposta de API
    return {
      success: true,
      message: 'Script SQL gerado com sucesso',
      file: outputPath
    };
  } catch (error) {
    console.error('❌ Erro ao gerar SQL:', error);
    return {
      success: false,
      message: 'Erro ao processar planilha',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Descomente a função que deseja executar:
// exemploBasico();
// exemploMultiplosUsuarios();
// exemploEmMemoria();
// exemploAPI();

export {
  exemploBasico,
  exemploMultiplosUsuarios,
  exemploEmMemoria,
  exemploAPI
};
