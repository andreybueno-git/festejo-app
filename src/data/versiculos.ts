// Versículos sobre serviço - um para cada dia do festejo
export const versiculos = [
  {
    dia: 1,
    texto: "Cada um exerça o dom que recebeu para servir os outros.",
    referencia: "1 Pedro 4:10"
  },
  {
    dia: 2,
    texto: "Sirvam uns aos outros mediante o amor.",
    referencia: "Gálatas 5:13"
  },
  {
    dia: 3,
    texto: "O maior entre vocês será aquele que serve.",
    referencia: "Mateus 23:11"
  },
  {
    dia: 4,
    texto: "Porque nem mesmo o Filho do Homem veio para ser servido, mas para servir.",
    referencia: "Marcos 10:45"
  },
  {
    dia: 5,
    texto: "Tudo o que fizerem, façam de todo o coração, como para o Senhor.",
    referencia: "Colossenses 3:23"
  },
  {
    dia: 6,
    texto: "Deus ama quem dá com alegria.",
    referencia: "2 Coríntios 9:7"
  }
];

// Função para pegar o versículo do dia
export const getVersiculoDoDia = (diaFestejo: number) => {
  const index = Math.min(Math.max(diaFestejo - 1, 0), versiculos.length - 1);
  return versiculos[index];
};
