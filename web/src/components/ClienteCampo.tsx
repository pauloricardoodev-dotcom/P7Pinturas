import { useMemo, useState } from 'react'
import type { Cliente } from '../lib/clientes'

const normaliza = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
const digitos = (s: string) => s.replace(/\D/g, '')

interface Props {
  id: string
  valor: string
  clientes: Cliente[]
  onTexto: (v: string) => void
  onEscolher: (c: Cliente) => void
}

/** Campo de nome com sugestões de clientes já cadastrados (combobox acessível). */
export function ClienteCampo({ id, valor, clientes, onTexto, onEscolher }: Props) {
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(0)

  const sugestoes = useMemo(() => {
    const q = normaliza(valor)
    if (!q) return []
    const qd = digitos(valor)
    return clientes
      .filter((c) => normaliza(c.nome) !== q) // quem já está digitado por inteiro não precisa ser sugerido
      .map((c) => {
        const nome = normaliza(c.nome)
        const rank = nome.startsWith(q) ? 0 : nome.includes(q) ? 1 : qd.length >= 3 && digitos(c.telefone).includes(qd) ? 2 : -1
        return { c, rank }
      })
      .filter((x) => x.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.c.nome.localeCompare(b.c.nome))
      .slice(0, 6)
      .map((x) => x.c)
  }, [valor, clientes])

  const visivel = aberto && sugestoes.length > 0
  const escolher = (c: Cliente) => {
    onEscolher(c)
    setAberto(false)
  }

  const teclado = (e: React.KeyboardEvent) => {
    if (!visivel) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo((i) => (i + 1) % sugestoes.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo((i) => (i - 1 + sugestoes.length) % sugestoes.length) }
    else if (e.key === 'Enter') { e.preventDefault(); escolher(sugestoes[ativo] ?? sugestoes[0]) }
    else if (e.key === 'Escape') setAberto(false)
  }

  return (
    <div className="col-12 cliente-campo">
      <label htmlFor={id} className="form-label">Cliente <span aria-hidden="true">*</span></label>
      <input id={id} className="form-control" value={valor} autoComplete="off" required
        role="combobox" aria-expanded={visivel} aria-controls={`${id}-lista`} aria-autocomplete="list"
        aria-activedescendant={visivel ? `${id}-op-${ativo}` : undefined}
        placeholder="Digite o nome do cliente"
        onChange={(e) => { onTexto(e.target.value); setAberto(true); setAtivo(0) }}
        onFocus={() => setAberto(true)} onBlur={() => setAberto(false)} onKeyDown={teclado} />
      {visivel && (
        <ul id={`${id}-lista`} role="listbox" aria-label="Clientes cadastrados" className="cliente-campo__lista">
          {sugestoes.map((c, i) => (
            // onMouseDown (e não onClick) para escolher antes do input perder o foco
            <li key={c.id} id={`${id}-op-${i}`} role="option" aria-selected={i === ativo}
              className={i === ativo ? 'ativo' : undefined}
              onMouseDown={(e) => { e.preventDefault(); escolher(c) }} onMouseEnter={() => setAtivo(i)}>
              <strong>{c.nome}</strong>
              <small>{[c.telefone, [c.bairro, c.cidade].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || 'Cliente cadastrado'}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
