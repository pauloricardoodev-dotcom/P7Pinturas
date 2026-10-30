import { useId, useMemo, useRef, useState } from 'react'
import type { Cliente } from '../lib/clientes'

const normaliza = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

interface Props {
  clientes: Cliente[]
  onEscolher: (c: Cliente) => void
}

/** Botão que abre uma janela de busca com todos os clientes cadastrados. */
export function PesquisarCliente({ clientes, onEscolher }: Props) {
  const id = useId()
  const janela = useRef<HTMLDialogElement>(null)
  const campoBusca = useRef<HTMLInputElement>(null)
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const q = normaliza(busca)
    const qd = busca.replace(/\D/g, '')
    if (!q) return clientes
    return clientes.filter((c) =>
      normaliza(`${c.nome} ${c.bairro} ${c.cidade}`).includes(q) || (qd.length >= 3 && c.telefone.replace(/\D/g, '').includes(qd)))
  }, [clientes, busca])

  const abrir = () => {
    setBusca('')
    janela.current?.showModal()
    campoBusca.current?.focus() // o <dialog> focaria o primeiro botão; aqui a pessoa já quer digitar
  }
  const fechar = () => janela.current?.close()
  const escolher = (c: Cliente) => {
    onEscolher(c)
    fechar()
  }

  return (
    <>
      <button type="button" className="btn btn-light btn-lg w-100 btn-pesquisar" onClick={abrir}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
          <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
        Pesquisar cliente
      </button>

      {/* <dialog> nativo: já prende o foco, fecha com Esc e é lido como janela pelos leitores de tela. */}
      <dialog ref={janela} className="janela-clientes" aria-labelledby={`${id}-t`}
        onClick={(e) => { if (e.target === janela.current) fechar() }}>
        <div className="janela-clientes__topo">
          <h2 id={`${id}-t`} className="h5 mb-0">Pesquisar cliente</h2>
          <button type="button" className="btn btn-sm btn-outline-dark" onClick={fechar}>Fechar</button>
        </div>

        <label htmlFor={`${id}-b`} className="visually-hidden">Buscar por nome, telefone ou bairro</label>
        <input id={`${id}-b`} type="search" className="form-control mb-3" placeholder="Nome, telefone ou bairro"
          value={busca} onChange={(e) => setBusca(e.target.value)} autoComplete="off" ref={campoBusca} />

        <div aria-live="polite">
          {filtrados.length === 0 && (
            <p className="mb-0">{clientes.length ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>
          )}
        </div>
        <ul className="janela-clientes__lista">
          {filtrados.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => escolher(c)}>
                <strong>{c.nome}</strong>
                <small>{[c.telefone, [c.bairro, c.cidade].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || 'Sem mais dados'}</small>
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  )
}
