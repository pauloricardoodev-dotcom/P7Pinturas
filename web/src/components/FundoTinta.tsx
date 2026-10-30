import './fundo-tinta.css'

type Harmonica = [amp: number, ciclos: number, fase: number]

/** Altura da borda ondulada em x. Usa ciclos inteiros por ladrilho, então emenda sem costura. */
const alturaOnda = (x: number, larg: number, base: number, hs: Harmonica[]) =>
  base + hs.reduce((s, [a, c, f]) => s + a * Math.sin((2 * Math.PI * c * x) / larg + f), 0)

const PASSO = 8
const r = (n: number) => Math.round(n * 10) / 10

function preenchimento(larg: number, base: number, hs: Harmonica[]) {
  let d = `M0,0 L0,${r(alturaOnda(0, larg, base, hs))}`
  for (let x = PASSO; x <= larg; x += PASSO) d += ` L${x},${r(alturaOnda(x, larg, base, hs))}`
  return `${d} L${larg},0 Z`
}

/** Dobra: um trecho da onda deslocado para dentro da tinta, como uma crista. */
function dobra(larg: number, base: number, hs: Harmonica[], de: number, ate: number, desloca: number) {
  let d = ''
  for (let x = de; x <= ate; x += PASSO) {
    d += `${d ? ' L' : 'M'}${x},${r(alturaOnda(x, larg, base, hs) - desloca)}`
  }
  return d
}

const FRENTE = { larg: 520, base: 24, hs: [[9, 1, 0], [5, 3, 1.3], [2.5, 5, 0.4]] as Harmonica[] }
const TRAS = { larg: 640, base: 40, hs: [[11, 1, 2], [6, 2, 0.7], [3, 4, 2]] as Harmonica[] }

const DOBRAS_FRENTE = [
  { d: dobra(FRENTE.larg, FRENTE.base, FRENTE.hs, 40, 190, 13), clara: true },
  { d: dobra(FRENTE.larg, FRENTE.base, FRENTE.hs, 70, 160, 22), clara: false },
  { d: dobra(FRENTE.larg, FRENTE.base, FRENTE.hs, 250, 420, 10), clara: false },
  { d: dobra(FRENTE.larg, FRENTE.base, FRENTE.hs, 285, 380, 19), clara: true },
  { d: dobra(FRENTE.larg, FRENTE.base, FRENTE.hs, 440, 512, 14), clara: true },
]

function Onda({ id, camada, reversa }: { id: string; camada: 'frente' | 'tras'; reversa?: boolean }) {
  const t = camada === 'frente' ? FRENTE : TRAS
  const altura = 84
  return (
    <div className={`onda onda--${camada}${reversa ? ' onda--reversa' : ''}`} style={{ '--w': `${t.larg}px` } as React.CSSProperties}>
      <svg width="100%" height={altura} focusable="false">
        <defs>
          <pattern id={id} width={t.larg} height={altura} patternUnits="userSpaceOnUse">
            <path className="onda__massa" d={preenchimento(t.larg, t.base, t.hs)} />
            {camada === 'frente' && DOBRAS_FRENTE.map((b, i) => (
              <path key={i} d={b.d} className={b.clara ? 'dobra dobra--clara' : 'dobra dobra--escura'} />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height={altura} fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

// left (%), tamanho (px), dx, dy (px), atraso (s), duração (s)
const RESPINGOS = [
  [4, 9, -34, 60, 0.0, 1.5], [11, 5, 22, 85, 0.4, 1.3], [19, 14, -18, 50, 0.9, 1.7],
  [26, 6, 40, 95, 0.2, 1.4], [34, 11, -42, 70, 1.1, 1.6], [42, 5, 16, 100, 0.6, 1.2],
  [51, 16, 30, 55, 0.3, 1.8], [59, 7, -28, 90, 1.0, 1.4], [68, 12, 38, 65, 0.5, 1.6],
  [76, 5, -20, 105, 0.8, 1.3], [84, 10, -36, 75, 0.1, 1.5], [92, 7, 24, 88, 1.2, 1.4],
] as const

function Respingos() {
  return (
    <div className="respingos">
      {RESPINGOS.map(([x, t, dx, dy, atraso, dur], i) => (
        <span key={i} className="respingo"
          style={{ left: `${x}%`, width: t, height: t, '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${atraso}s`, animationDuration: `${dur}s` } as React.CSSProperties} />
      ))}
    </div>
  )
}

/**
 * Fundo animado em ciclo: a tinta colorida (cor da aba) escorre como líquido e cobre
 * a tela; depois uma tinta branca sobe de baixo para cima e cobre tudo; recomeça.
 * A beirada tem ondas, dobras com sombra e respingos. Só `transform` anima.
 */
export function FundoTinta() {
  return (
    <div className="fundo-tinta" aria-hidden="true">
      <div className="folha-tinta folha-tinta--cor">
        <div className="borda">
          <Onda id="onda-cor-tras" camada="tras" reversa />
          <Onda id="onda-cor-frente" camada="frente" />
          <Respingos />
        </div>
      </div>
      <div className="folha-tinta folha-tinta--branca">
        <div className="borda borda--cima">
          <Onda id="onda-br-tras" camada="tras" />
          <Onda id="onda-br-frente" camada="frente" reversa />
          <Respingos />
        </div>
      </div>
    </div>
  )
}
