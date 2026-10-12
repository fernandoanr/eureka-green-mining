/* Resultados do TCC (modelo aggregate-rccp-as-is-v16 e simulação SIMUL8, média de 5 replicações).
   Cada bloco corresponde a uma tabela ou quadro do trabalho final. */
window.TCC = {
  unidades: [
    { id: "pinheiros", nome: "Pinheiros", tipo: "centro", chegadas: 6830, massa: 147173.14, equipe: 2, estoque: 30, x: 250, y: 165 },
    { id: "jabaquara", nome: "Jabaquara", tipo: "centro", chegadas: 8753, massa: 109932.89, equipe: 2, estoque: 33, x: 560, y: 300 },
    { id: "paraisopolis", nome: "Paraisópolis", tipo: "centro", chegadas: 723, massa: 23807.45, equipe: 2, estoque: 33, x: 235, y: 330 },
    { id: "brooklin", nome: "Brooklin", tipo: "centro", chegadas: 3397, massa: 19129.19, equipe: 2, estoque: 33, x: 420, y: 255 },
    { id: "embu", nome: "Embu das Artes", tipo: "centro", chegadas: 1685, massa: 82373.53, equipe: 3, estoque: 33, x: 70, y: 420 },
    { id: "santoamaro", nome: "Santo Amaro", tipo: "hub", chegadas: 655, massa: 14663.7, equipe: 6, estoque: 493, x: 400, y: 410 }
  ],

  demanda: [
    { ano: 2024, massa: 295021.24, chegadas: 10952, porChegada: 26.94, obs: true },
    { ano: 2025, massa: 397079.9, chegadas: 22043, porChegada: 18.01, obs: true },
    { ano: 2026, massa: 536057.87, chegadas: 45188, porChegada: 11.86 },
    { ano: 2027, massa: 723678.12, chegadas: 92636, porChegada: 7.81 },
    { ano: 2028, massa: 976965.46, chegadas: 189903, porChegada: 5.14 },
    { ano: 2029, massa: 1318903.37, chegadas: 389302, porChegada: 3.39 },
    { ano: 2030, massa: 1780519.55, chegadas: 798068, porChegada: 2.23 }
  ],

  semMudanca: {
    2025: { transporte: 72.43, centros: 15.75, hub: 16.37, cobertura: 3.6 },
    2026: { transporte: 97.79, centros: 29.27, hub: 22.3, cobertura: 2.67 },
    2027: { transporte: 132.01, centros: 55.95, hub: 30.52, cobertura: 1.98 },
    2028: { transporte: 178.21, centros: 109.22, hub: 42.04, cobertura: 1.46 },
    2029: { transporte: 240.59, centros: 216.5, hub: 58.48, cobertura: 1.08 },
    2030: { transporte: 324.79, centros: 433.84, hub: 82.48, cobertura: 0.8 }
  },

  /* Simulação da estrutura atual, sem mudanças (média de 5 replicações) */
  simSemMudanca: {
    2025: { transporte: 79.58, centros: 18.83, recusa: 0.0, estoqueCentro: 11.64, estoqueHub: 29.45 },
    2026: { transporte: 107.46, centros: 34.41, recusa: 9.53, estoqueCentro: 16.37, estoqueHub: 32.35 },
    2027: { transporte: 107.21, centros: 38.92, recusa: 34.03, estoqueCentro: 22.14, estoqueHub: 32.29 }
  },

  medidasIsoladas: [
    { medida: "Estrutura atual", t2027: 132.01, e2027: 55.95, t2030: 324.79, e2030: 433.84 },
    { medida: "Duas prensas realocadas", t2027: 76.29, e2027: 63.59, t2030: 187.69, e2030: 452.63 },
    { medida: "Baú de 15 m³", t2027: 88.01, e2027: 53.34, t2030: 216.53, e2030: 427.42 },
    { medida: "Dois caminhões", t2027: 66.01, e2027: 55.95, t2030: 162.4, e2030: 433.84 },
    { medida: "Prensa em todos os centros", t2027: 46.54, e2027: 63.59, t2030: 114.5, e2030: 452.63 }
  ],

  plano: [
    { ano: 2026, pico: 56.51, rccp: "Realocar duas prensas do hub, a grande para Pinheiros e a pequena para Jabaquara", simul: "Nenhum ajuste necessário", tag: "sem investimento" },
    { ano: 2027, pico: 76.29, rccp: "Manter a configuração de 2026", simul: "Nenhum ajuste necessário", tag: "sem investimento" },
    { ano: 2028, pico: 79.69, rccp: "Prensa em todos os centros, com uma única compra para Brooklin, baú de 15 m³ e 2 operadores a mais", simul: "Segundo caminhão, carga dobrada na expedição e recebimento do hub reaberto a 85% da capacidade", tag: "1 prensa comprada" },
    { ano: 2029, pico: 84.82, rccp: "Manter a estrutura de 2028, com 7 operadores a mais", simul: "Manter os ajustes de 2028", tag: "equipe" },
    { ano: 2030, pico: 83.72, rccp: "Segundo caminhão e 18 operadores a mais", simul: "Três cargas simultâneas na expedição, com nova doca", tag: "nova doca" }
  ],

  comparacao: [
    { ano: 2026, recusaRccp: 0.0, recusaAjustada: null, estoqueHubRccp: 29.01, estoqueHubAjustado: null },
    { ano: 2027, recusaRccp: 0.34, recusaAjustada: null, estoqueHubRccp: 35.82, estoqueHubAjustado: null },
    { ano: 2028, recusaRccp: 28.75, recusaAjustada: 0.3, estoqueHubRccp: 363.07, estoqueHubAjustado: 45.9 },
    { ano: 2029, recusaRccp: 47.95, recusaAjustada: 1.7, estoqueHubRccp: 358.83, estoqueHubAjustado: 56.0 },
    { ano: 2030, recusaRccp: 60.38, recusaAjustada: 5.92, estoqueHubRccp: 355.44, estoqueHubAjustado: 32.33 }
  ],

  /* Configuração do plano (alvo de 85%) por ano, usada no botão "Plano do TCC" do simulador */
  presets: {
    2025: { prensas: 0, bau: 10, caminhoes: 1, operadores: 0 },
    2026: { prensas: 1, bau: 10, caminhoes: 1, operadores: 0 },
    2027: { prensas: 1, bau: 10, caminhoes: 1, operadores: 0 },
    2028: { prensas: 2, bau: 15, caminhoes: 1, operadores: 2 },
    2029: { prensas: 2, bau: 15, caminhoes: 1, operadores: 7 },
    2030: { prensas: 2, bau: 15, caminhoes: 2, operadores: 18 }
  }
};
