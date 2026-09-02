/**
 * Quando a venda online fecha.
 *
 * A festa tem hora para começar, e o site não. Sem isto ele continuaria
 * cobrando R$ 80 por um ingresso de uma festa que já aconteceu — e a pessoa
 * descobriria depois de pagar. Dinheiro de volta é trabalho para quem organiza
 * e frustração para quem comprou; a página fechar sozinha custa nada.
 *
 * O corte é o começo da festa. Poderia ser mais tarde, para quem chega atrasado
 * pagar pelo celular na fila — mas os dois erros não custam igual. Fechar cedo
 * demais manda essa pessoa para o WhatsApp da organização, que está ali do lado
 * e resolve. Fechar tarde demais tira dinheiro de alguém por engano.
 */
export function vendaEncerrada(agora: Date, comeco: Date): boolean {
  const t = comeco.getTime();

  // Data quebrada na configuração: a venda continua aberta. Entre errar
  // vendendo demais e errar derrubando a venda por causa de um typo na data, o
  // segundo é pior — some o site inteiro sem ninguém entender por quê.
  if (Number.isNaN(t)) return false;

  return agora.getTime() >= t;
}
