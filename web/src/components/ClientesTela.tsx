import { useId, useMemo, useState } from 'react'
import {
  atualizarCliente, clienteVazio, excluirCliente, salvarCliente,
  type Cliente, type DadosCliente,
} from '../lib/clientes'

interface Props {
  clientes: Cliente[]
  carregando: boolean
  erro: string | null
  onMudou: () => void
}

export function ClientesTela({ clientes, carregando, erro, onMudou }: Props) {
  const id = useId()
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<{ id: number | null; dados: DadosCliente } | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return q ? clientes.filter((c) => `${c.nome} ${c.telefone} ${c.bairro} ${c.cidade}`.toLowerCase().includes(q)) : clientes
  }, [clientes, busca])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    if (!editando.dados.nome.trim()) return setAviso('Informe o nome do cliente.')
    try {
      if (editando.id === null) await salvarCliente(editando.dados)
      else await atualizarCliente(editando.id, editando.dados)
      setEditando(null)
      setAviso(null)
      onMudou()
    } catch (err) {
      setAviso((err as Error).message)
    }
  }

  const excluir = async (c: Cliente) => {
    if (!window.confirm(`Excluir o cliente ${c.nome}? Os orçamentos já feitos não são afetados.`)) return
    try {
      await excluirCliente(c.id)
      onMudou()
    } catch (err) {
      setAviso((err as Error).message)
    }
  }

  const campo = (k: keyof DadosCliente) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditando((p) => p && { ...p, dados: { ...p.dados, [k]: e.target.value } })

  return (
    <main id="conteudo" className="container-md pb-5 pt-3">
      <h2 className="h4 titulo-pilula">Clientes</h2>

      {editando ? (
        <form onSubmit={salvar} noValidate className="card card-body mb-3" aria-label={editando.id === null ? 'Novo cliente' : 'Editar cliente'}>
          <div className="row g-3">
            {([
              ['nome', 'Nome', 'col-12', 'name'], ['telefone', 'Telefone (WhatsApp)', 'col-sm-6', 'tel'],
              ['email', 'E-mail', 'col-sm-6', 'email'], ['endereco', 'Endereço', 'col-12', 'street-address'],
              ['cidade', 'Cidade', 'col-6', 'address-level2'], ['bairro', 'Bairro', 'col-6', 'off'],
            ] as const).map(([k, rotulo, col, ac]) => (
              <div key={k} className={col}>
                <label htmlFor={`${id}-${k}`} className="form-label">{rotulo}{k === 'nome' && <span aria-hidden="true"> *</span>}</label>
                <input id={`${id}-${k}`} className="form-control" value={editando.dados[k]} onChange={campo(k)}
                  type={k === 'email' ? 'email' : k === 'telefone' ? 'tel' : 'text'} autoComplete={ac} required={k === 'nome'} />
              </div>
            ))}
          </div>
          {aviso && <div role="alert" className="alert alert-danger mt-3 mb-0">{aviso}</div>}
          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-destaque btn-lg">Salvar cliente</button>
            <button type="button" className="btn btn-outline-dark" onClick={() => { setEditando(null); setAviso(null) }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <>
          <div className="d-grid gap-2 mb-3">
            <button type="button" className="btn btn-destaque btn-lg"
              onClick={() => setEditando({ id: null, dados: clienteVazio() })}>+ Novo cliente</button>
          </div>
          <label htmlFor={`${id}-busca`} className="visually-hidden">Buscar cliente</label>
          <input id={`${id}-busca`} type="search" className="form-control mb-3" placeholder="Buscar por nome, telefone ou bairro"
            value={busca} onChange={(e) => setBusca(e.target.value)} />
        </>
      )}

      {(erro || (aviso && !editando)) && <div role="alert" className="alert alert-danger">{erro ?? aviso}</div>}

      {!editando && (
        <div aria-live="polite">
          {carregando && <p className="titulo-pilula">Carregando…</p>}
          {!carregando && !erro && filtrados.length === 0 && (
            <p className="titulo-pilula">{clientes.length ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>
          )}
          <ul className="list-unstyled d-grid gap-3 m-0">
            {filtrados.map((c) => (
              <li key={c.id} className="card card-body">
                <strong className="fs-5">{c.nome}</strong>
                <span>{[c.telefone, [c.bairro, c.cidade].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || 'Sem mais dados'}</span>
                <div className="d-flex gap-2 mt-2">
                  <button type="button" className="btn btn-sm btn-outline-dark flex-fill" aria-label={`Editar ${c.nome}`}
                    onClick={() => setEditando({ id: c.id, dados: { nome: c.nome, telefone: c.telefone, email: c.email, endereco: c.endereco, cidade: c.cidade, bairro: c.bairro } })}>
                    Editar
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger bg-white flex-fill" aria-label={`Excluir ${c.nome}`}
                    onClick={() => excluir(c)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
