import { useId, useLayoutEffect, useRef, useState } from 'react'
import { FolhaOrcamento } from './FolhaOrcamento'
import { salvarOrcamento, subtotalDe, totalDe } from '../lib/api'
import { arredonda, hojeISO, moeda, num } from '../lib/format'
import { compartilharFolha } from '../lib/share'
import { ClienteCampo } from './ClienteCampo'
import { PesquisarCliente } from './PesquisarCliente'
import { atualizarCliente, salvarCliente, type Cliente } from '../lib/clientes'
import { itemVazio, MAX_ITENS, TEMAS, type Dados, type Item, type Tipo } from '../lib/types'

const PASSO = 10 // ajuste rápido (±) do valor sugerido, em reais

const novo = (tipo: Tipo): Dados => ({
  tipo, data: hojeISO(), cliente: '', endereco: '', cidade: '', bairro: '',
  telefone: '', email: '', itens: [itemVazio()], observacoes: '', desconto: '',
})

/** Recalcula o total sugerido (área × valor/m²) enquanto o pintor não o editou. */
function recalcula(it: Item): Item {
  if (it.manual) return it
  const total = arredonda(num(it.area) * num(it.valorUnitario))
  return { ...it, valorTotal: total ? String(total) : '' }
}

interface Props {
  tipo: Tipo
  clientes: Cliente[]
  /** Chamado depois de cadastrar um cliente novo, para atualizar a lista. */
  onClienteSalvo: () => void
}

export function OrcamentoForm({ tipo, clientes, onClienteSalvo }: Props) {
  const id = useId()
  const [d, setD] = useState<Dados>(() => novo(tipo))
  const [previa, setPrevia] = useState(false)
  const [estado, setEstado] = useState<{ tipo: 'erro' | 'ok'; msg: string } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const folhaRef = useRef<HTMLDivElement>(null)
  const caixaRef = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(1)
  const [altura, setAltura] = useState(0)

  const tema = TEMAS[tipo]
  const total = totalDe(d)

  // Ajusta a folha (720px) à largura da tela do celular.
  useLayoutEffect(() => {
    if (!previa || !caixaRef.current) return
    const caixa = caixaRef.current
    const ajusta = () => {
      const e = Math.min(1, caixa.clientWidth / 720)
      setEscala(e)
      setAltura((folhaRef.current?.offsetHeight ?? 0) * e)
    }
    ajusta()
    const ro = new ResizeObserver(ajusta)
    ro.observe(caixa)
    return () => ro.disconnect()
  }, [previa])

  const [salvarCli, setSalvarCli] = useState(true)
  const [msgCli, setMsgCli] = useState<{ tipo: 'erro' | 'ok'; msg: string } | null>(null)
  const nomeDigitado = d.cliente.trim().toLowerCase()
  const clienteExistente = clientes.find((c) => c.nome.toLowerCase() === nomeDigitado)

  const dadosCliente = () => ({
    nome: d.cliente.trim(), telefone: d.telefone.trim(), email: d.email.trim(),
    endereco: d.endereco.trim(), cidade: d.cidade.trim(), bairro: d.bairro.trim(),
  })
  const mudouCadastro = !!clienteExistente && (
    clienteExistente.telefone !== d.telefone.trim() || clienteExistente.email !== d.email.trim() ||
    clienteExistente.endereco !== d.endereco.trim() || clienteExistente.cidade !== d.cidade.trim() ||
    clienteExistente.bairro !== d.bairro.trim())

  // Escolheu uma sugestão: traz o cadastro todo para o cabeçalho do orçamento.
  const escolheCliente = (c: Cliente) => {
    setMsgCli(null)
    setD((p) => ({ ...p, cliente: c.nome, telefone: c.telefone, email: c.email, endereco: c.endereco, cidade: c.cidade, bairro: c.bairro }))
  }

  // Digitou o nome por inteiro de alguém cadastrado: completa só o que ainda está vazio.
  const mudaNomeCliente = (nome: string) => {
    setMsgCli(null)
    const c = clientes.find((x) => x.nome.toLowerCase() === nome.trim().toLowerCase())
    setD((p) => c
      ? {
        ...p, cliente: nome, telefone: p.telefone || c.telefone, email: p.email || c.email,
        endereco: p.endereco || c.endereco, cidade: p.cidade || c.cidade, bairro: p.bairro || c.bairro,
      }
      : { ...p, cliente: nome })
  }

  const cadastrarAgora = async () => {
    try {
      if (clienteExistente) await atualizarCliente(clienteExistente.id, dadosCliente())
      else await salvarCliente(dadosCliente())
      onClienteSalvo()
      setMsgCli({ tipo: 'ok', msg: clienteExistente ? 'Cadastro do cliente atualizado.' : 'Cliente cadastrado.' })
    } catch (e) {
      setMsgCli({ tipo: 'erro', msg: (e as Error).message })
    }
  }

  const campo = (k: keyof Dados) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setD((p) => ({ ...p, [k]: e.target.value }))

  const mudaItem = (i: number, fn: (it: Item) => Item) =>
    setD((p) => ({ ...p, itens: p.itens.map((it, j) => (j === i ? fn(it) : it)) }))

  const setItemCampo = (i: number, k: 'descricao' | 'area' | 'valorUnitario', v: string) =>
    mudaItem(i, (it) => {
      const n = { ...it, [k]: v }
      // Primeira vez que informa a área: sugere o valor/m² padrão do serviço.
      if (k === 'area' && v && !it.valorUnitario) n.valorUnitario = String(tema.precoM2)
      return recalcula(n)
    })

  const ajusta = (i: number, delta: number) =>
    mudaItem(i, (it) => ({
      ...it, manual: true,
      valorTotal: String(Math.max(0, arredonda(num(it.valorTotal) + delta))),
    }))

  const valida = () => {
    if (!d.cliente.trim()) return 'Informe o nome do cliente.'
    if (!(total > 0)) return 'Informe ao menos um serviço com valor.'
    return null
  }

  const abrirPrevia = () => {
    const erro = valida()
    if (erro) return setEstado({ tipo: 'erro', msg: erro })
    setEstado(null)
    setPrevia(true)
  }

  const enviar = async () => {
    setEnviando(true)
    setEstado(null)
    try {
      await salvarOrcamento(d)
      if (salvarCli && !clienteExistente) {
        // Cadastrar o cliente é um extra: se falhar, o orçamento segue normalmente.
        await salvarCliente(dadosCliente()).then(onClienteSalvo, () => undefined)
      }
      await compartilharFolha(folhaRef.current!, d, total)
      setEstado({ tipo: 'ok', msg: 'Orçamento salvo e pronto para enviar.' })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setEstado({ tipo: 'erro', msg: (e as Error).message })
    } finally {
      setEnviando(false)
    }
  }

  const aviso = estado && (
    <div role={estado.tipo === 'erro' ? 'alert' : 'status'}
      className={`alert alert-${estado.tipo === 'erro' ? 'danger' : 'success'} mt-3 mb-0`}>{estado.msg}</div>
  )

  if (previa) {
    return (
      <section aria-labelledby={`${id}-prev`} className="mt-3">
        <h2 id={`${id}-prev`} className="h5 titulo-pilula">Pré-visualização</h2>
        <div ref={caixaRef} className="previa" style={{ height: altura || undefined }}>
          <div style={{ transform: `scale(${escala})`, transformOrigin: 'top left', width: 720 }}>
            <FolhaOrcamento ref={folhaRef} dados={d} />
          </div>
        </div>
        {aviso}
        <div className="d-grid gap-2 mt-3">
          <button type="button" className="btn btn-destaque btn-lg" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Salvar e enviar pelo WhatsApp'}
          </button>
          <button type="button" className="btn btn-outline-dark btn-lg" onClick={() => setPrevia(false)}>
            Voltar e editar
          </button>
        </div>
      </section>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); abrirPrevia() }} noValidate className="mt-3">
      <div className="mb-3"><PesquisarCliente clientes={clientes} onEscolher={escolheCliente} /></div>

      <fieldset className="card card-body mb-3">
        <legend className="h5">Cliente</legend>
        <div className="row g-3">
          <ClienteCampo id={`${id}-cli`} valor={d.cliente} clientes={clientes} onTexto={mudaNomeCliente} onEscolher={escolheCliente} />
          <div className="col-12" aria-live="polite">
            {clienteExistente && <p className="cliente-status cliente-status--ok mb-0">✔ Cliente já cadastrado</p>}
            {!clienteExistente && d.cliente.trim() && <p className="cliente-status mb-0">Cliente novo — ainda não cadastrado</p>}
            {msgCli && <p className={`cliente-status ${msgCli.tipo === 'ok' ? 'cliente-status--ok' : 'text-danger'} mb-0`} role={msgCli.tipo === 'erro' ? 'alert' : undefined}>{msgCli.msg}</p>}
          </div>
          {d.cliente.trim() && (!clienteExistente || mudouCadastro) && (
            <div className="col-12 d-grid">
              <button type="button" className="btn btn-outline-dark" onClick={cadastrarAgora}>
                {clienteExistente ? 'Atualizar cadastro do cliente' : 'Cadastrar cliente'}
              </button>
            </div>
          )}
          {d.cliente.trim() && !clienteExistente && (
            <div className="col-12 form-check ms-1">
              <input id={`${id}-salvacli`} type="checkbox" className="form-check-input" checked={salvarCli}
                onChange={(e) => setSalvarCli(e.target.checked)} />
              <label htmlFor={`${id}-salvacli`} className="form-check-label">Cadastrar automaticamente ao enviar o orçamento</label>
            </div>
          )}
          <Campo id={`${id}-end`} label="Endereço" valor={d.endereco} onChange={campo('endereco')} autoComplete="street-address" />
          <Campo id={`${id}-cid`} label="Cidade" valor={d.cidade} onChange={campo('cidade')} col="col-6" />
          <Campo id={`${id}-bai`} label="Bairro" valor={d.bairro} onChange={campo('bairro')} col="col-6" />
          <Campo id={`${id}-tel`} label="Telefone (WhatsApp)" valor={d.telefone} onChange={campo('telefone')} type="tel" inputMode="tel" autoComplete="tel" col="col-sm-6" />
          <Campo id={`${id}-eml`} label="E-mail" valor={d.email} onChange={campo('email')} type="email" autoComplete="email" col="col-sm-6" />
          <Campo id={`${id}-dt`} label="Data" valor={d.data} onChange={campo('data')} type="date" col="col-sm-6" />
        </div>
      </fieldset>

      <fieldset className="mb-3">
        <legend className="h5 float-none titulo-pilula">Serviços</legend>
        <ol className="list-unstyled d-grid gap-3 m-0">
          {d.itens.map((it, i) => {
            const sugerido = arredonda(num(it.area) * num(it.valorUnitario))
            return (
              <li key={i} className="card card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="badge-destaque">Item {String(i + 1).padStart(2, '0')}</strong>
                  {d.itens.length > 1 && (
                    <button type="button" className="btn btn-sm btn-outline-danger"
                      aria-label={`Remover item ${i + 1}`}
                      onClick={() => setD((p) => ({ ...p, itens: p.itens.filter((_, j) => j !== i) }))}>
                      Remover
                    </button>
                  )}
                </div>
                <label htmlFor={`${id}-d${i}`} className="form-label">Descrição do serviço</label>
                <textarea id={`${id}-d${i}`} rows={2} className="form-control mb-2" value={it.descricao}
                  onChange={(e) => setItemCampo(i, 'descricao', e.target.value)} />
                <div className="row g-2">
                  <Campo id={`${id}-a${i}`} label="Área (m²)" valor={it.area} type="number" inputMode="decimal" col="col-6"
                    onChange={(e) => setItemCampo(i, 'area', e.target.value)} />
                  <Campo id={`${id}-u${i}`} label="Valor por m²" valor={it.valorUnitario} type="number" inputMode="decimal" col="col-6"
                    onChange={(e) => setItemCampo(i, 'valorUnitario', e.target.value)} />
                </div>
                <label htmlFor={`${id}-t${i}`} className="form-label mt-2">Valor total (R$)</label>
                <div className="input-group">
                  <button type="button" className="btn btn-outline-dark ajuste" aria-label={`Diminuir R$ ${PASSO} do item ${i + 1}`}
                    onClick={() => ajusta(i, -PASSO)}>−</button>
                  <input id={`${id}-t${i}`} type="number" inputMode="decimal" step="any" min="0"
                    className="form-control text-center fw-bold" value={it.valorTotal}
                    onChange={(e) => mudaItem(i, (x) => ({ ...x, manual: true, valorTotal: e.target.value }))} />
                  <button type="button" className="btn btn-outline-dark ajuste" aria-label={`Aumentar R$ ${PASSO} do item ${i + 1}`}
                    onClick={() => ajusta(i, PASSO)}>+</button>
                </div>
                {sugerido > 0 && (
                  <p className="form-text mb-0">
                    Sugestão: {moeda(sugerido)}
                    {it.manual && num(it.valorTotal) !== sugerido && (
                      <> · <button type="button" className="btn btn-link btn-sm p-0 align-baseline"
                        onClick={() => mudaItem(i, (x) => recalcula({ ...x, manual: false }))}>usar sugestão</button></>
                    )}
                  </p>
                )}
              </li>
            )
          })}
        </ol>
        {d.itens.length < MAX_ITENS && (
          <button type="button" className="btn btn-outline-dark w-100 mt-3"
            onClick={() => setD((p) => ({ ...p, itens: [...p.itens, itemVazio()] }))}>
            + Adicionar serviço
          </button>
        )}
      </fieldset>

      <fieldset className="card card-body mb-3">
        <legend className="h5">Fechamento</legend>
        <label htmlFor={`${id}-obs`} className="form-label">Observações</label>
        <textarea id={`${id}-obs`} rows={3} className="form-control mb-3" value={d.observacoes} onChange={campo('observacoes')} />
        <label htmlFor={`${id}-desc`} className="form-label">Desconto (R$)</label>
        <input id={`${id}-desc`} type="number" inputMode="decimal" step="any" min="0" className="form-control"
          value={d.desconto} onChange={campo('desconto')} />
        <dl className="resumo mt-3 mb-0" aria-live="polite">
          <div><dt>Subtotal</dt><dd>{moeda(subtotalDe(d))}</dd></div>
          <div className="resumo__total"><dt>Valor total</dt><dd>{moeda(total)}</dd></div>
        </dl>
      </fieldset>

      {aviso}
      <div className="d-grid mt-3">
        <button type="submit" className="btn btn-destaque btn-lg">Pré-visualizar orçamento de {tema.aba.toLowerCase()}</button>
      </div>
    </form>
  )
}

interface CampoProps {
  id: string
  label: string
  valor: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  col?: string
  obrigatorio?: boolean
}

function Campo({ id, label, valor, onChange, type = 'text', inputMode, autoComplete, col = 'col-12', obrigatorio }: CampoProps) {
  return (
    <div className={col}>
      <label htmlFor={id} className="form-label">{label}{obrigatorio && <span aria-hidden="true"> *</span>}</label>
      <input id={id} type={type} inputMode={inputMode} autoComplete={autoComplete} required={obrigatorio}
        step={type === 'number' ? 'any' : undefined} min={type === 'number' ? 0 : undefined}
        className="form-control" value={valor} onChange={onChange} />
    </div>
  )
}
