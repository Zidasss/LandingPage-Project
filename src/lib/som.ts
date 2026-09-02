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

/** Volume geral. */
const VOLUME = 0.55;
/** Volume da música. Ela é fundo, não show. */
const VOLUME_MUSICA = 0.2;
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
 * O ganho é diferente nos dois porque a dinâmica é diferente: o rangido de
 * abertura é baixo e precisa subir para ser ouvido sob a música; o fechamento
 * carrega a batida, que já é alta e estouraria se subisse junto.
 */
const ABRINDO = { de: 0.3, ate: 2.25, ganho: 1.8 };
const FECHANDO = { de: 3.75, ate: 5.5, ganho: 1 };

/** Quanto tempo as duas voltas da música se sobrepõem na emenda. */
const COSTURA = 2.5;

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

/** A porta já foi aberta nesta visita. Só então a música entra. */
let portaAberta = false;
/** Cada gesto da porta soa uma vez por visita — ver `abriuPorta`. */
let soouAbrindo = false;
let soouFechando = false;

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
let buscouMusica = false;
let buscouPorta = false;

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

async function buscarPorta(): Promise<void> {
  if (buscouPorta) return;
  buscouPorta = true;
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

async function buscarMusica(): Promise<void> {
  if (buscouMusica) return;
  buscouMusica = true;
  musica = await baixar(ARQUIVO_MUSICA);
  if (musica) bordasMusica = medirBordas(musica);
}

// -------------------------------------------------------------- a música

let voltaAtual: AudioBufferSourceNode | null = null;
let costurando: ReturnType<typeof setTimeout> | null = null;
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
function tocarVolta(buffer: AudioBuffer, quando: number) {
  if (!ctx || !vozMusica) return;

  // Só o trecho com som: o silêncio das pontas fica de fora, senão a emenda
  // cruzaria música com nada e abriria um buraco a cada volta.
  const trecho = Math.max(1, bordasMusica.fim - bordasMusica.inicio);
  const fim = quando + trecho;
  const meia = Math.min(COSTURA, trecho / 3);

  const fonte = ctx.createBufferSource();
  fonte.buffer = buffer;

  const fade = ctx.createGain();
  fade.gain.setValueAtTime(0.0001, quando);
  fade.gain.linearRampToValueAtTime(bordasMusica.ganho, quando + meia);
  fade.gain.setValueAtTime(bordasMusica.ganho, fim - meia);
  fade.gain.linearRampToValueAtTime(0.0001, fim);

  fonte.connect(fade).connect(vozMusica);
  fonte.start(quando, bordasMusica.inicio, trecho);
  fonte.stop(fim + 0.05);
  voltaAtual = fonte;

  const daquiAte = (fim - meia - ctx.currentTime) * 1000;
  costurando = setTimeout(
    () => {
      if (ligado && ctx) tocarVolta(buffer, ctx.currentTime);
    },
    Math.max(50, daquiAte),
  );
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
 * Começa a música — se houver som ligado e a porta já tiver sido aberta.
 *
 * A música entra depois da porta de propósito: ela é o que se ouve *lá dentro*.
 * Tocar antes entregaria a festa antes de a pessoa atravessar.
 */
function comecarMusica() {
  if (!ligado || !portaAberta || voltaAtual || relogio) return;
  void buscarMusica().then(() => {
    // A busca demora; nesse meio-tempo a pessoa pode ter desligado o som.
    if (!ligado || !ctx || voltaAtual || relogio) return;
    if (musica) tocarVolta(musica, ctx.currentTime + 0.05);
    else comecarMotivo();
  });
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
 * A porta se abrindo.
 *
 * Soa **uma vez por visita**. Quem rola para cima e para baixo repetidas vezes
 * não quer ouvir a mesma porta a cada passagem — vira metralhadora. Para ouvir
 * de novo, recarregar a página.
 *
 * É aqui que a música nasce: a porta abriu, então há uma festa lá dentro.
 */
export function abriuPorta() {
  if (!ligado || soouAbrindo) {
    // Mesmo em silêncio a porta conta como aberta, para a música entrar quando
    // a pessoa ligar o som depois de já ter passado por ela.
    portaAberta = true;
    return;
  }
  soouAbrindo = true;
  portaAberta = true;
  abafar(ABRINDO.ate - ABRINDO.de);
  if (!tocarTrecho(ABRINDO)) rangidoSintetico(false);
  comecarMusica();
}

/**
 * A porta se fechando, com a batida no fim.
 *
 * A batida vem junto na gravação — é o mesmo gesto, e separá-la em dois
 * disparos deixaria o encaixe por conta de um cronômetro. Também soa uma vez
 * por visita.
 */
export function fechouPorta() {
  if (!ligado || soouFechando) return;
  soouFechando = true;
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
  void ctx.resume();
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
