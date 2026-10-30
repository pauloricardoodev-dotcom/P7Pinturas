import { useCallback, useRef, useState } from 'react'
import { FundoTinta } from './components/FundoTinta'
import { Inicio } from './components/Inicio'
import { OrcamentoForm } from './components/OrcamentoForm'
import { listarClientes, type Cliente } from './lib/clientes'
import { TEMAS, type Tipo } from './lib/types'
import { useDepoisDoPaint } from './lib/useDepoisDoPaint'

type Tela = 'inicio' | 'novo'

const ABAS: Tipo[] = ['PINTURA', 'GESSO']

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio')
  const [ativa, setAtiva] = useState<Tipo>('PINTURA')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const pronto = useDepoisDoPaint()
  const botoes = useRef<Record<Tipo, HTMLButtonElement | null>>({ GESSO: null, PINTURA: null })

  // Só busca clientes quando a pessoa sai do início (a abertura não faz nenhuma requisição).
  const carregarClientes = useCallback(async () => {
    try {
      setClientes(await listarClientes())
    } catch {
      // Sem a lista só não há sugestões; o orçamento continua funcionando.
    }
  }, [])

  const ir = (t: Tela) => {
    setTela(t)
    if (t !== 'inicio') void carregarClientes()
  }

  // A abertura usa o amarelo da marca; o formulário usa a cor da aba ativa.
  const tema = tela === 'novo' ? ativa.toLowerCase() : 'pintura'

  // Setas ← → trocam de aba (padrão WAI-ARIA para tablist).
  const teclado = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const prox = ABAS[(ABAS.indexOf(ativa) + 1) % ABAS.length]
    setAtiva(prox)
    botoes.current[prox]?.focus()
  }

  return (
    <div className="app" data-tema={tema}>
      {/* Na abertura o fundo é a imagem; nas demais telas, a tinta (reinicia a cada troca de cor). */}
      {pronto && tela !== 'inicio' && <FundoTinta key={tema} />}
      <div className="conteudo">
        <a href="#conteudo" className="visually-hidden-focusable pular">Pular para o conteúdo</a>
        {/* A abertura é só a arte + os dois botões, sem cabeçalho. */}
        {tela !== 'inicio' && (
          <header className="topo">
            <h1 className="marca">P7 <span>PINTURAS</span></h1>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setTela('inicio')}>
              ← Início
            </button>
          </header>
        )}

        {tela === 'inicio' && <Inicio onNovo={() => ir('novo')} />}


        {/* Fica montado (só oculto) para não perder o que foi digitado ao voltar ao início. */}
        <div hidden={tela !== 'novo'}>
          <div role="tablist" aria-label="Tipo de orçamento" className="abas" onKeyDown={teclado}>
            {ABAS.map((t) => (
              <button key={t} ref={(el) => { botoes.current[t] = el }} type="button" role="tab"
                id={`aba-${t}`} aria-selected={ativa === t} aria-controls={`painel-${t}`}
                tabIndex={ativa === t ? 0 : -1} data-tipo={t.toLowerCase()} onClick={() => setAtiva(t)}>
                {TEMAS[t].aba}
              </button>
            ))}
          </div>

          <main id={tela === 'novo' ? 'conteudo' : undefined} className="container-md pb-5 pt-3">
            {ABAS.map((t) => (
              <div key={t} role="tabpanel" id={`painel-${t}`} aria-labelledby={`aba-${t}`} hidden={ativa !== t}
                data-tema={t.toLowerCase()}>
                <OrcamentoForm tipo={t} clientes={clientes} onClienteSalvo={carregarClientes} />
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  )
}
