/**
 * O som do site: a porta e a música.
 *
 * **Nada toca antes de a pessoa pedir.** Não é escolha de gosto: navegador
 * bloqueia áudio até um gesto de verdade (clique, toque, tecla), e rolagem não
 * conta. Um rangido disparado pelo scroll seria engolido em silêncio, e o site
 * pareceria quebrado. Por isso existe o botão de som — o clique nele é o gesto
 * que destrava, e só a partir dali há som.
 *
 * Os arquivos de áudio são **opcionais**. Sem eles o site sintetiza um rangido
 * e um motivo em lá menor, e continua funcionando. Trocar um arquivo em
 * `public/` — pelo GitHub, sem tocar em código — troca o som do site.
 */

/** Onde a escolha da pessoa fica guardada entre visitas. */
const CHAVE = "volvoween:som";

/**
 * Volume geral, baixo de propósito: o som aqui é detalhe de ambiente, não
 * trilha de filme. Alto demais ele deixa de enfeitar e passa a incomodar.
 */
const VOLUME = 0.3;
/** Volume da música dentro do geral. Ela é fundo, não show. */
const VOLUME_MUSICA = 0.18;
/** Para quanto a música cai enquanto a porta soa. */
const ABAFADO = 0.3;

const ARQUIVO_MUSICA = "/musica.mp3";
const ARQUIVO_PORTA = "/porta.mp3";

/**
 * Os dois trechos dentro do arquivo da porta, em segundos.
 *
 * Medidos no próprio áudio, não chutados: o arquivo tem a abertura no começo e
 * o fechamento no fim, com a batida em 4,35s (pico em −7 dBFS, contra os −25 do
 * rangido). Os números abaixo recortam cada gesto.
 *
 * Os ganhos são baixos e diferentes entre si. Baixos porque a porta soa a cada
 * passagem pela abertura, e o que se ouve muitas vezes precisa incomodar pouco.
 * Diferentes porque a dinâmica é diferente: o fechamento carrega a batida, que
 * já é o ponto mais alto da gravação e não precisa de ajuda.
 *
 * Os números vêm de medição, não de gosto. No começo a porta batia 10 dB acima
 * do pico da música — quase três vezes e meia mais alta, para um som que é
 * detalhe de ambiente. Nestes valores ela fica um pouco **abaixo** do pico da
 * música e ainda assim se destaca, porque é transiente e a música é cama: o
 * ouvido nota o que muda, não o que é mais alto.
 */
const ABRINDO = { de: 0.3, ate: 2.25, ganho: 0.22 };
const FECHANDO = { de: 3.75, ate: 5.5, ganho: 0.12 };

/**
 * A emenda entre uma volta e a seguinte.
 *
 * `SAIDA` e `ENTRADA_LOOP` são os fades; `SOBREPOR` é o quanto as duas voltas
 * dividem o mesmo instante.
 *
 * A sobreposição é curta de propósito. Com um crossfade longo — que é o que
 * havia aqui — o fim de uma volta e o começo da outra tocam juntos por segundos
 * e o ouvido escuta **duas músicas ao mesmo tempo**, com duas melodias
 * desencontradas. Numa cama de som isso passa; numa música com tema, não passa.
 *
 * Agora uma sai antes de a outra entrar, e a sobreposição só existe para não
 * abrir um buraco de silêncio no meio: no instante em que se cruzam, as duas
 * já estão perto de zero.
 */
const SAIDA = 3;
const ENTRADA_LOOP = 3;
const SOBREPOR = 0.3;

/**
 * O fade da primeira entrada da música, bem mais longo que o das emendas.
 *
 * Ela nasce enquanto a porta ainda está abrindo, e uma música que aparece de
 * uma vez soa como um botão apertado. Assim ela cresce por baixo do rangido e
 * já está inteira quando a folha termina o curso — quem ouve não percebe onde
 * começou, só que a festa está lá dentro.
 */
const ENTRADA = 7;

/** Semitons a partir do lá 440. */
function nota(semitons: number): number {
  return 440 * Math.pow(2, semitons / 12);
}

/**
 * O motivo de reserva, para quando não há arquivo de música.
 *
 * Lá menor harmônica — a sensível (o sol sustenido) é o que dá o arrepio.
 * `null` é pausa: o silêncio entre as notas é o que soa assombrado em vez de
 * agitado.
 */
const MOTIVO: (number | null)[] = [
  0, 3, 7, null, 8, 7, 3, null, 2, 3, 2, -1, 0, null, null, null,
];
const PASSO = 0.42;

let ctx: AudioContext | null = null;
let mestre: GainNode | null = null;
/** A voz da música, separada para poder abaixar durante os efeitos. */
let vozMusica: GainNode | null = null;

let ligado = false;
const ouvintes = new Set<() => void>();

/**
 * Se a folha já chegou ao fim do curso nesta passagem.
 *
 * Não é um limite de uma vez por visita: a porta soa **toda vez** que a
 * animação acontece. Som que toca só na primeira passagem faz a segunda parecer
 * quebrada — a porta se move e não sai nada.
 *
 * O que isto evita é outra coisa: continuar granulando rangido depois de a
 * folha ter encostado no fim, quando ela já não anda mais.
 */
let noFimDoCurso = false;

/** Quando a batida soou pela última vez, no relógio do áudio. */
let ultimaBatida = -99;

function avisar() {
  for (const o of ouvintes) o();
}

// ---------------------------------------------------------------- montagem

function montar(): boolean {
  if (ctx) return true;
  const Contexto =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Contexto) return false;

  ctx = new Contexto();
  // O contexto avisa quando sai do bloqueio; sem isto o botão continuaria
  // mostrando "travado" mesmo depois de o som já estar saindo.
  ctx.addEventListener("statechange", avisar);
  mestre = ctx.createGain();
  mestre.gain.value = VOLUME;
  mestre.connect(ctx.destination);

  vozMusica = ctx.createGain();
  vozMusica.gain.value = VOLUME_MUSICA;
  vozMusica.connect(mestre);
  return true;
}

/** Um trecho de ruído branco, matéria-prima do rangido sintetizado. */
function ruido(contexto: BaseAudioContext, segundos: number): AudioBuffer {
  const total = Math.floor(contexto.sampleRate * segundos);
  const buffer = contexto.createBuffer(1, total, contexto.sampleRate);
  const canal = buffer.getChannelData(0);
  for (let i = 0; i < total; i++) canal[i] = Math.random() * 2 - 1;
  return buffer;
}

// ------------------------------------------------------------ os arquivos

type Bordas = { inicio: number; fim: number; ganho: number };

/**
 * Onde o som de verdade começa e acaba dentro do arquivo, e quanto falta de
 * volume.
 *
 * Medido, e não anotado à mão. A música que veio tem dois segundos de silêncio
 * na frente: em loop, isso seria um buraco de dois segundos a cada volta. Medir
 * em vez de fixar significa que trocar o arquivo continua funcionando, com o
 * silêncio e o volume que o arquivo novo tiver.
 */
function medirBordas(buffer: AudioBuffer): Bordas {
  const canal = buffer.getChannelData(0);
  const total = canal.length;
  /** Abaixo disto é silêncio para o ouvido, mesmo não sendo zero absoluto. */
  const SILENCIO = 0.004;

  let pico = 0;
  for (let i = 0; i < total; i++) {
    const a = Math.abs(canal[i]);
    if (a > pico) pico = a;
  }

  let i = 0;
  while (i < total && Math.abs(canal[i]) < SILENCIO) i++;
  let f = total - 1;
  while (f > i && Math.abs(canal[f]) < SILENCIO) f--;

  const taxa = buffer.sampleRate;
  return {
    inicio: i / taxa,
    fim: (f + 1) / taxa,
    // 0.85 e não 1: folga para a soma com os efeitos não estourar.
    ganho: pico > 0.01 ? 0.85 / pico : 1,
  };
}

let musica: AudioBuffer | null = null;
let bordasMusica: Bordas = { inicio: 0, fim: 0, ganho: 1 };
let porta: AudioBuffer | null = null;
let ganhoPorta = 1;
/*
  A busca em voo, e não um "já busquei".

  Com um booleano acontecia uma corrida: `comecarMusica` é chamada em vários
  quadros, e a segunda chamada via a busca marcada como feita enquanto o buffer
  ainda estava vazio — caía no motivo de reserva, ligava o relógio dele, e
  quando o arquivo terminava de decodificar o relógio já bloqueava a entrada da
  música de verdade. O sintetizado ganhava a corrida e a música nunca tocava.

  Guardando a promessa, quem chega depois espera a mesma busca terminar.
*/
let promessaMusica: Promise<void> | null = null;
let promessaPorta: Promise<void> | null = null;

/**
 * Busca um arquivo de áudio. Falhar aqui é normal, não é erro: sem o arquivo o
 * site usa o som sintetizado. Por isso nada vai para o console — não há o que
 * consertar.
 */
async function baixar(caminho: string): Promise<AudioBuffer | null> {
  if (!ctx) return null;
  try {
    const r = await fetch(caminho);
    if (!r.ok) return null;
    return await ctx.decodeAudioData(await r.arrayBuffer());
  } catch {
    return null;
  }
}

function buscarPorta(): Promise<void> {
  promessaPorta ??= carregarPorta();
  return promessaPorta;
}

async function carregarPorta(): Promise<void> {
  porta = await baixar(ARQUIVO_PORTA);
  if (porta) {
    // Normaliza pelo pico do arquivo inteiro, para os dois trechos manterem
    // entre si a diferença que a gravação já tem.
    let pico = 0;
    const c = porta.getChannelData(0);
    for (let i = 0; i < c.length; i++) {
      const a = Math.abs(c[i]);
      if (a > pico) pico = a;
    }
    ganhoPorta = pico > 0.01 ? 0.85 / pico : 1;
  }
}

function buscarMusica(): Promise<void> {
  promessaMusica ??= carregarMusica();
  return promessaMusica;
}

async function carregarMusica(): Promise<void> {
  musica = await baixar(ARQUIVO_MUSICA);
  if (musica) bordasMusica = medirBordas(musica);
}

// -------------------------------------------------------------- a música

let voltaAtual: AudioBufferSourceNode | null = null;
let costurando: ReturnType<typeof setInterval> | null = null;
let relogio: ReturnType<typeof setInterval> | null = null;
let passo = 0;
let proximoPasso = 0;

/**
 * Emenda o loop com uma sobreposição, em vez de cortar e recomeçar.
 *
 * O `loop` do Web Audio é gapless, mas gapless não é liso: se o fim da gravação
 * não casa com o começo, o ouvido escuta o salto a cada volta. Aqui a volta
 * seguinte entra antes de a atual acabar e as duas se cruzam — o ponto de
 * emenda deixa de existir. É o fade de entrada e de saída, com as pontas
 * sobrepostas.
 */
function tocarVolta(buffer: AudioBuffer, quando: number, entrada = ENTRADA_LOOP) {
  if (!ctx || !vozMusica) return;

  // Só o trecho com som: o silêncio das pontas fica de fora, senão a emenda
  // cruzaria música com nada e abriria um buraco a cada volta.
  const trecho = Math.max(1, bordasMusica.fim - bordasMusica.inicio);
  const fim = quando + trecho;
  const desce = Math.min(SAIDA, trecho / 3);

  const fonte = ctx.createBufferSource();
  fonte.buffer = buffer;

  const sobe = Math.min(entrada, trecho / 2);
  const fade = ctx.createGain();
  fade.gain.setValueAtTime(0.0001, quando);
  fade.gain.linearRampToValueAtTime(bordasMusica.ganho, quando + sobe);
  fade.gain.setValueAtTime(bordasMusica.ganho, fim - desce);
  fade.gain.linearRampToValueAtTime(0.0001, fim);

  fonte.connect(fade).connect(vozMusica);
  fonte.start(quando, bordasMusica.inicio, trecho);
  fonte.stop(fim + 0.05);
  voltaAtual = fonte;

  /*
    A hora da próxima volta é marcada no relógio do áudio, e vigiada — não
    agendada num cronômetro de parede.

    A diferença aparece quando o navegador segura o som: o relógio do áudio
    congela junto com ele, o de parede não. Uma página aberta e deixada de lado
    por mais tempo que a música dura teria o cronômetro estourado, e no primeiro
    clique a segunda volta entraria por cima da primeira — duas músicas juntas,
    o mesmo defeito por outra porta.

    A próxima entra quase no fim da atual: no cruzamento as duas já estão quase
    mudas, então se ouve a passagem, não duas melodias.
  */
  const horaDaProxima = fim - SOBREPOR;
  costurando = setInterval(() => {
    if (!ligado || !ctx) return;
    if (ctx.currentTime >= horaDaProxima) {
      clearInterval(costurando!);
      costurando = null;
      tocarVolta(buffer, ctx.currentTime);
    }
  }, 250);
}

/** Uma nota do motivo de reserva: ataque seco, cauda longa. */
function tocarNota(semitons: number, quando: number) {
  if (!ctx || !vozMusica) return;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = nota(semitons);

  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 1800;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, quando);
  env.gain.exponentialRampToValueAtTime(0.5, quando + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, quando + 1.6);

  osc.connect(filtro).connect(env).connect(vozMusica);
  osc.start(quando);
  osc.stop(quando + 1.7);
}

/**
 * Agenda as notas um pouco à frente do relógio do áudio.
 *
 * `setInterval` sozinho não serve para música: ele atrasa quando a aba está
 * ocupada, e o atraso viraria ritmo torto. Aqui ele só *agenda* — quem toca no
 * tempo certo é o relógio do Web Audio, que não escorrega.
 */
function agendar() {
  if (!ctx) return;
  while (proximoPasso < ctx.currentTime + 0.4) {
    const n = MOTIVO[passo % MOTIVO.length];
    if (n !== null) tocarNota(n, Math.max(proximoPasso, ctx.currentTime));
    proximoPasso += PASSO;
    passo++;
  }
}

function comecarMotivo() {
  if (!ctx || !vozMusica || relogio) return;
  proximoPasso = ctx.currentTime + 0.1;
  agendar();
  relogio = setInterval(agendar, 120);
}

/**
 * Começa a música.
 *
 * Ela toca desde o começo da visita, e não a partir da porta: é a cama sonora
 * do site inteiro. O fade de entrada é longo para ela nascer em vez de aparecer.
 */
function comecarMusica() {
  if (!ligado || voltaAtual || relogio) return;
  void buscarMusica().then(() => {
    // A busca demora; nesse meio-tempo a pessoa pode ter desligado o som.
    if (!ligado || !ctx || voltaAtual || relogio) return;
    if (musica) tocarVolta(musica, ctx.currentTime + 0.05, ENTRADA);
    else comecarMotivo();
  });
}

function pararMusica() {
  if (costurando) {
    clearInterval(costurando);
    costurando = null;
  }
  if (voltaAtual) {
    try {
      voltaAtual.stop();
    } catch {
      // já parada
    }
    voltaAtual = null;
  }
  if (relogio) {
    clearInterval(relogio);
    relogio = null;
  }
  passo = 0;
}

/** Abaixa a música enquanto a porta soa, e devolve o volume depois. */
function abafar(segundos: number) {
  if (!ctx || !vozMusica) return;
  const agora = ctx.currentTime;
  const g = vozMusica.gain;
  g.cancelScheduledValues(agora);
  g.setValueAtTime(g.value, agora);
  g.linearRampToValueAtTime(VOLUME_MUSICA * ABAFADO, agora + 0.08);
  g.setValueAtTime(VOLUME_MUSICA * ABAFADO, agora + segundos * 0.7);
  g.linearRampToValueAtTime(VOLUME_MUSICA, agora + segundos + 0.4);
}

// ---------------------------------------------------------------- a porta

/** Toca um trecho da gravação da porta. Devolve `false` se não houver arquivo. */
function tocarTrecho(t: { de: number; ate: number; ganho: number }): boolean {
  if (!ctx || !mestre || !porta) return false;

  const t0 = ctx.currentTime;
  const dur = t.ate - t.de;
  const respiro = 0.2;

  const fonte = ctx.createBufferSource();
  fonte.buffer = porta;

  // Rampas curtas nas pontas: cortar a onda no meio estala.
  const env = ctx.createGain();
  const alvo = ganhoPorta * t.ganho;
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.linearRampToValueAtTime(alvo, t0 + 0.04);
  env.gain.setValueAtTime(alvo, t0 + dur - respiro);
  env.gain.linearRampToValueAtTime(0.0001, t0 + dur);

  fonte.connect(env).connect(mestre);
  fonte.start(t0, t.de, dur);
  fonte.stop(t0 + dur + 0.05);
  return true;
}

/**
 * Quanto a folha precisa andar para soltar mais um pedaço de rangido.
 *
 * É o passo do scrub. Menor, os pedaços se sobrepõem e o rangido vira
 * contínuo; maior, ele fica granulado. Este valor dá continuidade numa rolagem
 * normal sem inundar de nós de áudio numa rolagem violenta.
 */
const GRAO = 0.016;

/** Duração de cada pedaço, com folga para as pontas se cruzarem. */
const DUR_GRAO = 0.17;

/** Quanto a folha andou desde o último pedaço tocado. */
let andado = 0;
let aberturaAnterior = 0;
let comecouRangido = false;

/**
 * Um pedacinho do rangido, tirado do ponto da gravação que corresponde ao
 * ponto em que a folha está.
 *
 * É o coração do scrub: a posição no áudio **é** a posição da porta. Andou um
 * tico, sai o tico de som daquele lugar; andou muito, saem vários seguidos e
 * viram um rangido contínuo; parou, não sai nada.
 *
 * A rampa nas pontas não é enfeite: cortar a onda no meio estala, e um estalo
 * a cada dezesseis milésimos de abertura seria pior que não ter som nenhum.
 */
function grao(abertura: number, atraso = 0) {
  if (!ctx || !mestre || !porta) return;

  const trecho = ABRINDO.ate - ABRINDO.de - DUR_GRAO;
  const onde = ABRINDO.de + Math.min(1, Math.max(0, abertura)) * trecho;
  const t0 = ctx.currentTime + atraso;
  const alvo = ganhoPorta * ABRINDO.ganho;

  const fonte = ctx.createBufferSource();
  fonte.buffer = porta;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.linearRampToValueAtTime(alvo, t0 + 0.03);
  env.gain.setValueAtTime(alvo, t0 + DUR_GRAO - 0.05);
  env.gain.linearRampToValueAtTime(0.0001, t0 + DUR_GRAO);

  fonte.connect(env).connect(mestre);
  fonte.start(t0, onde, DUR_GRAO);
  fonte.stop(t0 + DUR_GRAO + 0.02);
}

/**
 * A porta se abrindo — o rangido percorrido junto com a folha.
 *
 * Antes isto era um disparo de dois segundos, e estava errado por duas vezes.
 * Primeiro porque a folha abre no ritmo do dedo de quem rola: rolando devagar o
 * som acabava com a porta no meio do caminho. Depois, porque mesmo prendendo o
 * volume à velocidade, o áudio seguia correndo sozinho — dez toques de rolagem
 * davam dez pedaços de lugares diferentes da gravação, e não o mesmo rangido
 * sendo percorrido.
 *
 * Agora a posição no áudio é a posição da porta. Rolou um tico, a folha desliza
 * um tico e sai o tico de rangido daquele ponto. Rolou muito, os pedaços se
 * emendam num rangido contínuo. Parou, cala.
 *
 * Vale uma vez por visita: quem rola para cima e para baixo dez vezes não quer
 * ouvir a mesma porta dez vezes. Para ouvir de novo, recarregar.
 */
export function abrindoPorta(abertura: number) {
  const anterior = aberturaAnterior;
  const passo = Math.abs(abertura - anterior);
  aberturaAnterior = abertura;

  if (!ligado || noFimDoCurso || !ctx) return;

  if (!comecouRangido) {
    comecouRangido = true;
    abafar(2.6);
    // Sem arquivo não há o que percorrer: o sintetizado é um disparo só, e sai
    // aqui, no começo do movimento.
    if (!porta) rangidoSintetico(false);
  }

  if (!porta) return;
  andado += passo;

  /*
    Um pedaço por GRAO percorrido, e não um por quadro.

    Rolar com o dedo dá passos pequenos e um pedaço de cada vez; rolar de uma
    vez só — rodinha de mouse, barra de rolagem arrastada — dá um salto grande,
    e um salto grande tem que soltar vários pedaços seguidos, senão a porta
    atravessa o curso inteiro com um toquinho de som. Eles saem escalonados no
    tempo e se emendam num rangido contínuo.

    O teto de oito existe para uma rolagem violenta não criar dezenas de nós de
    áudio de uma vez: passado isso, o ouvido já não distingue mesmo.
  */
  const quantos = Math.min(8, Math.floor(andado / GRAO));
  for (let i = 1; i <= quantos; i++) {
    // Cada pedaço sai do ponto por onde a folha passou, e não todos do ponto
    // final: num salto grande é o caminho percorrido que se ouve, não só o
    // destino. Eles saem escalonados no tempo e se emendam num rangido só.
    const onde = anterior + (abertura - anterior) * (i / quantos);
    grao(onde, (i - 1) * 0.05);
  }
  /*
    A sobra volta a acumular, exceto quando o teto foi atingido: aí ela seria
    uma enxurrada atrasada de pedaços tocando depois de a porta já ter parado.
  */
  andado = quantos >= 8 ? 0 : andado - quantos * GRAO;
}

/** A folha encostou no fim do curso: não há mais movimento para granular. */
export function abriuDeVez() {
  noFimDoCurso = true;
}

/**
 * A porta se fechando, com a batida no fim.
 *
 * A batida vem junto na gravação — é o mesmo gesto, e separá-la em dois
 * disparos deixaria o encaixe por conta de um cronômetro. Também soa uma vez
 * por visita.
 */
export function fechouPorta() {
  // A folha voltou ao começo: a próxima abertura range de novo, do zero.
  noFimDoCurso = false;
  comecouRangido = false;
  andado = 0;

  if (!ligado || !ctx) return;

  /*
    Uma batida não entra por cima da outra.
    
    Sacudir a rolagem em cima do limiar dispararia o fechamento a cada vaivém,
    e várias batidas somadas estouram — além de soar como pau em portão, não
    como porta. O intervalo é um pouco menor que o próprio trecho de
    fechamento: barra a metralhadora sem nunca engolir uma passagem de verdade,
    que leva bem mais que isso para ir e voltar.
  */
  if (ctx.currentTime - ultimaBatida < FECHANDO.ate - FECHANDO.de) return;
  ultimaBatida = ctx.currentTime;
  abafar(FECHANDO.ate - FECHANDO.de);
  if (!tocarTrecho(FECHANDO)) {
    rangidoSintetico(true);
    batidaSintetica(0.62);
  }
}

// ------------------------------------------------------- sons de reserva

/**
 * O rangido sintetizado, para quando não há arquivo.
 *
 * Rangido não é ruído: é atrito com altura definida — a madeira gruda e solta
 * dezenas de vezes por segundo, e cada solta é um pulso. Por isso a fonte é um
 * dente de serra deslizando de tom, com a altura vagueando a esmo (ruído num
 * passa-baixa de 7 Hz somado à frequência), e não ruído filtrado, que soa como
 * vento.
 */
function rangidoSintetico(fechando: boolean) {
  if (!ctx || !mestre) return;
  const t0 = ctx.currentTime;
  const dur = fechando ? 0.85 : 1.45;
  const de = fechando ? 120 : 62;
  const ate = fechando ? 58 : 138;

  const voz = ctx.createOscillator();
  voz.type = "sawtooth";
  voz.frequency.setValueAtTime(de, t0);
  voz.frequency.exponentialRampToValueAtTime(ate, t0 + dur);

  const erra = ctx.createBufferSource();
  erra.buffer = ruido(ctx, dur);
  const lento = ctx.createBiquadFilter();
  lento.type = "lowpass";
  lento.frequency.value = 7;
  const quanto = ctx.createGain();
  quanto.gain.value = 2800;
  erra.connect(lento).connect(quanto);
  quanto.connect(voz.frequency);

  const madeira = ctx.createBiquadFilter();
  madeira.type = "bandpass";
  madeira.Q.value = 4.5;
  madeira.frequency.value = fechando ? 640 : 780;

  /*
    Ganho alto de propósito: o passa-banda devolve uma fatia pequena da energia.
    Medido, o rangido saía a 0,078 contra 0,339 da batida — quatro vezes mais
    baixo. O número aqui é compensação de filtro, não volume.
  */
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(2, t0 + 0.1);
  env.gain.exponentialRampToValueAtTime(0.56, t0 + dur * 0.42);
  env.gain.exponentialRampToValueAtTime(1.76, t0 + dur * 0.68);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  voz.connect(madeira).connect(env).connect(mestre);
  voz.start(t0);
  erra.start(t0);
  voz.stop(t0 + dur);
  erra.stop(t0 + dur);
}

/** A batida sintetizada: corpo grave e estalo. Só quando não há arquivo. */
function batidaSintetica(atraso: number) {
  if (!ctx || !mestre) return;
  const t0 = ctx.currentTime + atraso;

  const corpo = ctx.createOscillator();
  corpo.type = "sine";
  corpo.frequency.setValueAtTime(140, t0);
  corpo.frequency.exponentialRampToValueAtTime(36, t0 + 0.22);
  const envCorpo = ctx.createGain();
  envCorpo.gain.setValueAtTime(0.55, t0);
  envCorpo.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
  corpo.connect(envCorpo).connect(mestre);
  corpo.start(t0);
  corpo.stop(t0 + 0.55);

  const estalo = ctx.createBufferSource();
  estalo.buffer = ruido(ctx, 0.2);
  const corte = ctx.createBiquadFilter();
  corte.type = "lowpass";
  corte.frequency.setValueAtTime(2600, t0);
  corte.frequency.exponentialRampToValueAtTime(500, t0 + 0.18);
  const envEstalo = ctx.createGain();
  envEstalo.gain.setValueAtTime(0.3, t0);
  envEstalo.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
  estalo.connect(corte).connect(envEstalo).connect(mestre);
  estalo.start(t0);
  estalo.stop(t0 + 0.2);
}

// ------------------------------------------------------------- o controle

export function estaLigado(): boolean {
  return ligado;
}

export function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

/** Liga o som. Só funciona dentro de um gesto da pessoa — regra do navegador. */
export function ligar() {
  if (!montar() || !ctx) return;
  // O `avisar` depois do resume fecha o caso em que o navegador libera sem
  // disparar `statechange` a tempo de o botão perceber.
  void ctx.resume().then(avisar, avisar);
  ligado = true;
  // A porta é baixada já: ela pode ser precisa a qualquer rolagem, e esperar o
  // download no momento do gesto atrasaria o som para depois da animação.
  void buscarPorta();
  comecarMusica();
  try {
    localStorage.setItem(CHAVE, "1");
  } catch {
    // navegação privada: a escolha só não sobrevive à visita
  }
  avisar();
}

export function desligar() {
  ligado = false;
  pararMusica();
  void ctx?.suspend();
  try {
    localStorage.setItem(CHAVE, "0");
  } catch {
    // idem
  }
  avisar();
}

export function alternar() {
  if (ligado) desligar();
  else ligar();
}

/**
 * Se o site deve tentar ter som.
 *
 * O padrão é sim: quem chega encontra a festa tocando. Só fica mudo quem
 * escolheu ficar mudo — e essa escolha sobrevive à visita.
 */
export function queriaSom(): boolean {
  try {
    return localStorage.getItem(CHAVE) !== "0";
  } catch {
    // Sem `localStorage` (navegação privada, cookies bloqueados) vale o padrão.
    return true;
  }
}

/**
 * Em que pé está o som, do ponto de vista de quem olha a tela.
 *
 * São três estados, e não dois, porque "ligado" e "tocando" não são a mesma
 * coisa: Chrome, Safari e Firefox bloqueiam áudio até um gesto de verdade —
 * clique, toque, tecla —, e rolar não conta. Entre abrir o site e encostar em
 * alguma coisa, o som está ligado e mudo ao mesmo tempo.
 *
 * O botão precisa saber disso. Mostrar "som" enquanto nada sai é mentir para
 * quem está justamente procurando o motivo de não ouvir nada.
 */
export type EstadoSom = "mudo" | "travado" | "tocando";

export function estadoDoSom(): EstadoSom {
  if (!ligado) return "mudo";
  return ctx?.state === "running" ? "tocando" : "travado";
}

/**
 * Silencia enquanto a aba está escondida.
 *
 * Música saindo de uma aba que a pessoa nem está vendo é o tipo de coisa que
 * faz fechar o site — e procurar de qual das quinze abas vem o som é pior.
 */
export function acompanharVisibilidade(): () => void {
  const aoTrocar = () => {
    if (!ctx || !ligado) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  };
  document.addEventListener("visibilitychange", aoTrocar);
  return () => document.removeEventListener("visibilitychange", aoTrocar);
}
