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

function comecarMusica() {
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
 * O rangido da dobradiça.
 *
 * Rangido é atrito que gruda e solta muitas vezes por segundo. O desenho aqui é
 * esse: ruído passando por um filtro estreito, com a frequência tremendo (o
 * gruda-e-solta) e subindo devagar (a dobradiça apertando conforme a folha
 * gira). Fechando, o movimento é o contrário e mais curto.
 */
export function rangido(fechando = false) {
  if (!ligado || !ctx || !mestre) return;
  abafar(fechando ? 0.85 : 1.45);
  desenharRangido(ctx, mestre, ctx.currentTime, fechando);
}

/**
 * O desenho do rangido, separado de quem o toca.
 *
 * Recebe o contexto e o destino em vez de usar os do módulo para poder ser
 * renderizado fora do tempo real — é assim que dá para ouvir o resultado num
 * arquivo antes de publicar, em vez de julgar o som pelo código.
 */
export function desenharRangido(
  ctx: BaseAudioContext,
  destino: AudioNode,
  t0: number,
  fechando: boolean,
) {
  const dur = fechando ? 0.85 : 1.45;

  const fonte = ctx.createBufferSource();
  fonte.buffer = ruido(ctx, dur);

  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.Q.value = 16;
  filtro.frequency.setValueAtTime(fechando ? 820 : 340, t0);
  filtro.frequency.exponentialRampToValueAtTime(
    fechando ? 300 : 1150,
    t0 + dur,
  );

  // O tremido. Dente de serra, não senoide: o atrito é irregular, e a senoide
  // sairia com um vibrato limpo demais, de instrumento.
  const tremor = ctx.createOscillator();
  tremor.type = "sawtooth";
  tremor.frequency.value = fechando ? 14 : 9.5;
  const forca = ctx.createGain();
  forca.gain.value = 240;
  tremor.connect(forca);
  forca.connect(filtro.frequency);

  /*
    Ganho alto de propósito. Um passa-banda estreito devolve uma fatia pequena
    da energia do ruído: medido, o rangido saía com pico 0.03 contra 0.53 da
    batida — treze vezes mais baixo, ou seja, inaudível ao lado dela. O número
    aqui é compensação de filtro, não volume.
  */
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(4.5, t0 + 0.14);
  env.gain.setValueAtTime(4.5, t0 + dur * 0.62);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  fonte.connect(filtro).connect(env).connect(destino);
  fonte.start(t0);
  tremor.start(t0);
  fonte.stop(t0 + dur);
  tremor.stop(t0 + dur);
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
