/**
 * O som do site: o rangido da porta, a batida ao fechar e a música de fundo.
 *
 * Tudo é sintetizado na hora, com Web Audio. Não há arquivo de áudio nenhum no
 * projeto, e é de propósito: um MP3 de música de fundo pesa mais que a página
 * inteira, e som de banco de efeitos vem com licença para ler. O que está aqui
 * é ruído filtrado e osciladores — nasce no navegador e não custa download.
 *
 * **Nada toca antes de a pessoa pedir.** Isso não é escolha de gosto: navegador
 * bloqueia áudio até um gesto de verdade (clique, toque, tecla), e rolagem não
 * conta. Um rangido disparado pelo scroll simplesmente não sairia, e o site
 * ficaria mudo sem ninguém entender por quê. Por isso existe o botão: o clique
 * dele é o gesto que destrava o áudio, e só a partir dali há som.
 */

/** Onde a escolha da pessoa fica guardada entre visitas. */
const CHAVE = "volvoween:som";

/** Volume geral. Baixo: isto é ambiente, não show. */
const VOLUME = 0.5;
/** Volume da música, bem abaixo dos efeitos — ela é fundo. */
const VOLUME_MUSICA = 0.16;
/** Para quanto a música cai enquanto a porta range. */
const ABAFADO = 0.28;

/** Semitons a partir do lá 440. */
function nota(semitons: number): number {
  return 440 * Math.pow(2, semitons / 12);
}

/**
 * O motivo da música, em semitons a partir do lá.
 *
 * Lá menor com o sol sustenido (menor harmônica) — é a sensível que dá o
 * arrepio; sem ela a mesma sequência soa apenas melancólica. `null` é pausa: o
 * silêncio entre as notas é o que deixa a coisa assombrada em vez de agitada.
 */
const MOTIVO: (number | null)[] = [
  0, 3, 7, null, 8, 7, 3, null, 2, 3, 2, -1, 0, null, null, null,
];

/** Duração de cada passo, em segundos. Lento de propósito. */
const PASSO = 0.42;

let ctx: AudioContext | null = null;
let mestre: GainNode | null = null;
/** A voz da música, separada para poder abaixar durante os efeitos. */
let vozMusica: GainNode | null = null;
let bordao: OscillatorNode | null = null;
let relogio: ReturnType<typeof setInterval> | null = null;
let passo = 0;
let proximoPasso = 0;

let ligado = false;
const ouvintes = new Set<() => void>();

function avisar() {
  for (const o of ouvintes) o();
}

/** Um trecho de ruído branco, matéria-prima do rangido e da batida. */
function ruido(contexto: BaseAudioContext, segundos: number): AudioBuffer {
  const total = Math.floor(contexto.sampleRate * segundos);
  const buffer = contexto.createBuffer(1, total, contexto.sampleRate);
  const canal = buffer.getChannelData(0);
  for (let i = 0; i < total; i++) canal[i] = Math.random() * 2 - 1;
  return buffer;
}

function montar(): boolean {
  if (ctx) return true;
  const Contexto =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Contexto) return false;

  ctx = new Contexto();
  mestre = ctx.createGain();
  mestre.gain.value = VOLUME;
  mestre.connect(ctx.destination);

  vozMusica = ctx.createGain();
  vozMusica.gain.value = VOLUME_MUSICA;
  vozMusica.connect(mestre);
  return true;
}

/** Uma nota da caixinha de música: ataque seco, cauda longa. */
function tocarNota(semitons: number, quando: number) {
  if (!ctx || !vozMusica) return;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = nota(semitons);

  // O filtro tira o brilho do triângulo e deixa o timbre redondo, de caixinha.
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

/**
 * O arquivo de música, se existir.
 *
 * É opcional de propósito: o site funciona sem ele, com o motivo sintetizado.
 * Basta colocar um arquivo neste caminho para ele assumir o lugar — dá para
 * fazer isso pelo GitHub, sem tocar em código.
 */
const ARQUIVO_MUSICA = "/musica.mp3";

/** Quanto tempo as duas voltas se sobrepõem na emenda do loop. */
const COSTURA = 2.2;

let gravado: AudioBuffer | null = null;
/** null = ainda não procurou; false = procurou e não achou. */
let procurou: boolean | null = null;
let voltaAtual: AudioBufferSourceNode | null = null;
let costurando: ReturnType<typeof setTimeout> | null = null;

/**
 * Busca o arquivo de música uma vez.
 *
 * Falhar aqui é normal, não é erro: enquanto ninguém subir o arquivo, o site
 * usa o motivo sintetizado. Por isso nada é registrado no console — não há o
 * que consertar.
 */
async function buscarMusica(): Promise<AudioBuffer | null> {
  if (procurou !== null) return gravado;
  procurou = false;
  if (!ctx) return null;
  try {
    const r = await fetch(ARQUIVO_MUSICA);
    if (!r.ok) return null;
    gravado = await ctx.decodeAudioData(await r.arrayBuffer());
    procurou = true;
    return gravado;
  } catch {
    return null;
  }
}

/**
 * Emenda o loop com uma sobreposição, em vez de cortar e recomeçar.
 *
 * `loop = true` do Web Audio é gapless, mas gapless não é liso: se o fim da
 * gravação não casa com o começo, o ouvido escuta o salto a cada volta. Aqui a
 * volta seguinte entra antes de a atual acabar e as duas se cruzam por alguns
 * segundos — o ponto de emenda deixa de existir.
 */
function tocarVolta(buffer: AudioBuffer, quando: number) {
  if (!ctx || !vozMusica) return;

  const fonte = ctx.createBufferSource();
  fonte.buffer = buffer;
  const fade = ctx.createGain();
  const fim = quando + buffer.duration;

  fade.gain.setValueAtTime(0.0001, quando);
  fade.gain.linearRampToValueAtTime(1, quando + COSTURA);
  fade.gain.setValueAtTime(1, fim - COSTURA);
  fade.gain.linearRampToValueAtTime(0.0001, fim);

  fonte.connect(fade).connect(vozMusica);
  fonte.start(quando);
  fonte.stop(fim + 0.05);
  voltaAtual = fonte;

  // A próxima entra a uma costura do fim, para as duas se cruzarem.
  const daquiAte = (fim - COSTURA - ctx.currentTime) * 1000;
  costurando = setTimeout(
    () => {
      if (ligado && ctx) tocarVolta(buffer, ctx.currentTime);
    },
    Math.max(50, daquiAte),
  );
}

function comecarMusica() {
  if (!ctx || !vozMusica || relogio || voltaAtual) return;

  /*
    Tenta o arquivo primeiro; se não houver, cai no motivo sintetizado. A busca
    é assíncrona e o `ligado` é conferido de novo quando ela volta: entre pedir
    o arquivo e recebê-lo, a pessoa pode já ter desligado o som.
  */
  void buscarMusica().then((buffer) => {
    if (!ligado || !ctx) return;
    if (buffer) tocarVolta(buffer, ctx.currentTime + 0.05);
    else comecarMotivo();
  });
}

function comecarMotivo() {
  if (!ctx || !vozMusica || relogio) return;

  // O bordão: uma nota grave contínua, duas oitavas abaixo. É o que segura a
  // cena — sem ele o motivo fica solto no ar.
  bordao = ctx.createOscillator();
  bordao.type = "sine";
  bordao.frequency.value = nota(-24);
  const ganhoBordao = ctx.createGain();
  ganhoBordao.gain.value = 0.32;
  bordao.connect(ganhoBordao).connect(vozMusica);
  bordao.start();

  proximoPasso = ctx.currentTime + 0.1;
  agendar();
  relogio = setInterval(agendar, 120);
}

function pararMusica() {
  if (costurando) {
    clearTimeout(costurando);
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
  if (bordao) {
    try {
      bordao.stop();
    } catch {
      // já parado — nada a fazer
    }
    bordao = null;
  }
  passo = 0;
}

/** Abaixa a música enquanto o efeito toca, e devolve o volume depois. */
function abafar(segundos: number) {
  if (!ctx || !vozMusica) return;
  const agora = ctx.currentTime;
  const g = vozMusica.gain;
  g.cancelScheduledValues(agora);
  g.setValueAtTime(g.value, agora);
  g.linearRampToValueAtTime(VOLUME_MUSICA * ABAFADO, agora + 0.08);
  g.setValueAtTime(VOLUME_MUSICA * ABAFADO, agora + segundos * 0.7);
  g.linearRampToValueAtTime(VOLUME_MUSICA, agora + segundos + 0.35);
}

/**
 * Como o rangido soa. Os números que definem o caráter dele.
 *
 * A primeira versão tratava rangido como ruído passado num filtro estreito, e
 * soava como chiado de vento — porque rangido **não é ruído**. É atrito com
 * altura definida: a madeira gruda e solta dezenas de vezes por segundo, e cada
 * solta é um pulso. Isso é uma onda dente de serra grave, não ruído branco.
 */
export type FeitioRangido = {
  /** Altura em que a dobradiça começa a gemer, em Hz. */
  de: number;
  /** Onde ela termina. Subindo, a dobradiça aperta; descendo, alivia. */
  ate: number;
  /** Quanto a altura vagueia sozinha. É a irregularidade que soa madeira. */
  vagar: number;
  /** O corpo ressonante da porta, em Hz. Grave = porta pesada. */
  corpo: number;
  duracao: number;
};

export const ABRINDO: FeitioRangido = {
  de: 62,
  ate: 138,
  vagar: 34,
  corpo: 780,
  duracao: 1.45,
};

export const FECHANDO: FeitioRangido = {
  de: 120,
  ate: 58,
  vagar: 26,
  corpo: 640,
  duracao: 0.85,
};

/**
 * O rangido da dobradiça.
 *
 * Fechando o movimento é o contrário e mais curto: a folha desce de tom e
 * termina no batente.
 */
export function rangido(fechando = false) {
  if (!ligado || !ctx || !mestre) return;
  const feitio = fechando ? FECHANDO : ABRINDO;
  abafar(feitio.duracao);
  desenharRangido(ctx, mestre, ctx.currentTime, feitio);
}

/**
 * O desenho do rangido, separado de quem o toca.
 *
 * Recebe o contexto e o destino em vez de usar os do módulo para poder ser
 * renderizado fora do tempo real — é assim que dá para ouvir o resultado num
 * arquivo antes de publicar, em vez de julgar o som pelo código. Foi assim que
 * se descobriu que a primeira versão saía treze vezes mais baixa que a batida.
 */
export function desenharRangido(
  ctx: BaseAudioContext,
  destino: AudioNode,
  t0: number,
  feitio: FeitioRangido,
) {
  const { de, ate, vagar, corpo, duracao: dur } = feitio;

  // O gemido: dente de serra grave. É a fonte com altura, e é ela que faz o
  // som ler como madeira forçada em vez de vento.
  const voz = ctx.createOscillator();
  voz.type = "sawtooth";
  voz.frequency.setValueAtTime(de, t0);
  voz.frequency.exponentialRampToValueAtTime(ate, t0 + dur);

  /*
    O vaguear da altura.

    Ruído gravíssimo somado à frequência: em vez de um vibrato certinho — que
    soaria como instrumento — a altura caminha a esmo, que é como o atrito se
    comporta de verdade. O passa-baixa em 7 Hz é o que transforma ruído em
    caminhada lenta; sem ele isto viraria chiado de novo.
  */
  const erra = ctx.createBufferSource();
  erra.buffer = ruido(ctx, dur);
  const lento = ctx.createBiquadFilter();
  lento.type = "lowpass";
  lento.frequency.value = 7;
  const quanto = ctx.createGain();
  quanto.gain.value = vagar * 90;
  erra.connect(lento).connect(quanto);
  quanto.connect(voz.frequency);

  // O corpo da porta: a madeira ressoando em volta do gemido. Q baixo de
  // propósito — é uma caixa de madeira, não um apito.
  const madeira = ctx.createBiquadFilter();
  madeira.type = "bandpass";
  madeira.Q.value = 4.5;
  madeira.frequency.value = corpo;

  // Uma pitada de aspereza seca por cima, que é o pó da dobradiça.
  const aspereza = ctx.createBufferSource();
  aspereza.buffer = ruido(ctx, dur);
  const seco = ctx.createBiquadFilter();
  seco.type = "bandpass";
  seco.Q.value = 2;
  seco.frequency.value = corpo * 2.2;
  const pitada = ctx.createGain();
  pitada.gain.value = 0.09;

  /*
    O envelope não é liso: o rangido entra, quase para no meio e volta. Porta
    que range não range de forma constante — ela trava, cede, trava de novo, e
    é essa hesitação que o ouvido reconhece.
  */
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(2.0, t0 + 0.1);
  env.gain.exponentialRampToValueAtTime(0.56, t0 + dur * 0.42);
  env.gain.exponentialRampToValueAtTime(1.76, t0 + dur * 0.68);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  voz.connect(madeira).connect(env).connect(destino);
  aspereza.connect(seco).connect(pitada).connect(env);

  voz.start(t0);
  erra.start(t0);
  aspereza.start(t0);
  voz.stop(t0 + dur);
  erra.stop(t0 + dur);
  aspereza.stop(t0 + dur);
}

/**
 * A porta batendo.
 *
 * Duas camadas, que é como um baque soa: o corpo (a madeira, grave, caindo de
 * tom) e o estalo (o batente, curto e áspero). Só o grave soaria como tambor;
 * só o ruído, como palma.
 */
export function batida() {
  if (!ligado || !ctx || !mestre) return;
  abafar(0.9);
  desenharBatida(ctx, mestre, ctx.currentTime);
}

/** O desenho da batida, separado de quem a toca — mesma razão do rangido. */
export function desenharBatida(
  ctx: BaseAudioContext,
  destino: AudioNode,
  t0: number,
) {
  const corpo = ctx.createOscillator();
  corpo.type = "sine";
  corpo.frequency.setValueAtTime(140, t0);
  corpo.frequency.exponentialRampToValueAtTime(36, t0 + 0.22);
  const envCorpo = ctx.createGain();
  envCorpo.gain.setValueAtTime(0.55, t0);
  envCorpo.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
  corpo.connect(envCorpo).connect(destino);
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
  estalo.connect(corte).connect(envEstalo).connect(destino);
  estalo.start(t0);
  estalo.stop(t0 + 0.2);
}

export function estaLigado(): boolean {
  return ligado;
}

export function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

/** Liga o som. Só funciona dentro de um gesto da pessoa — é a regra do navegador. */
export function ligar() {
  if (!montar() || !ctx) return;
  void ctx.resume();
  ligado = true;
  comecarMusica();
  try {
    localStorage.setItem(CHAVE, "1");
  } catch {
    // navegação privada, cookies bloqueados: a escolha só não sobrevive à visita
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

/** Se a pessoa já tinha ligado o som numa visita anterior. */
export function queriaSom(): boolean {
  try {
    return localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

/**
 * Silencia enquanto a aba está escondida.
 *
 * Música saindo de uma aba que a pessoa nem está vendo é o tipo de coisa que
 * faz fechar o site — e procurar de qual das quinze abas vem o som é pior
 * ainda.
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
