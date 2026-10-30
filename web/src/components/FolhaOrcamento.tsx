import { forwardRef } from 'react'
import { dataBR, moeda, num } from '../lib/format'
import { EMPRESA, MAX_ITENS, TEMAS, type Dados } from '../lib/types'
import { subtotalDe, totalDe } from '../lib/api'
import './folha.css'

const ICONES = ['Pinturas residenciais', 'Prediais', 'Texturas', 'Massa corrida', 'Efeitos decorativos']

/** Réplica da folha de orçamento impressa (amarela = pintura, azul = gesso). */
export const FolhaOrcamento = forwardRef<HTMLDivElement, { dados: Dados }>(({ dados: d }, ref) => {
  const linhas = Array.from({ length: MAX_ITENS }, (_, i) => d.itens[i])
  const desconto = num(d.desconto)

  return (
    <div ref={ref} className={`folha folha--${d.tipo.toLowerCase()}`} role="img"
      aria-label={`Orçamento ${TEMAS[d.tipo].aba} para ${d.cliente || 'cliente'}, total ${moeda(totalDe(d))}`}>
      <header className="folha__topo">
        <div className="folha__marca">P7<span>{EMPRESA.nome}</span><small>Qualidade em cada detalhe</small></div>
        <div className="folha__titulo"><span>ORÇAMENTO</span><strong>{TEMAS[d.tipo].titulo}</strong></div>
      </header>

      <aside className="folha__lateral" aria-hidden="true">
        {ICONES.map((t) => <span key={t}>{t}</span>)}
      </aside>

      <main className="folha__corpo">
        <p className="folha__cnpj">CNPJ: <b>{EMPRESA.cnpj}</b><br />Data: <u>{dataBR(d.data)}</u></p>

        <dl className="folha__cliente">
          <div className="w-100"><dt>Cliente:</dt><dd>{d.cliente}</dd></div>
          <div className="w-100"><dt>Endereço:</dt><dd>{d.endereco}</dd></div>
          <div><dt>Cidade:</dt><dd>{d.cidade}</dd></div>
          <div><dt>Bairro:</dt><dd>{d.bairro}</dd></div>
          <div><dt>Telefone:</dt><dd>{d.telefone}</dd></div>
          <div><dt>E-mail:</dt><dd>{d.email}</dd></div>
        </dl>

        <table className="folha__tabela">
          <thead>
            <tr><th>ITEM</th><th>DESCRIÇÃO DOS SERVIÇOS</th><th>ÁREA (m²)</th><th>VALOR UNITÁRIO</th><th>VALOR TOTAL</th></tr>
          </thead>
          <tbody>
            {linhas.map((it, i) => (
              <tr key={i}>
                <td>{String(i + 1).padStart(2, '0')}</td>
                <td>{it?.descricao}</td>
                <td>{num(it?.area ?? '') ? num(it.area) : ''}</td>
                <td>{num(it?.valorUnitario ?? '') ? moeda(num(it.valorUnitario)) : ''}</td>
                <td className="fw-bold">{num(it?.valorTotal ?? '') ? moeda(num(it.valorTotal)) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="folha__fecho">
          <section className="folha__obs">
            <h3>OBSERVAÇÕES</h3>
            <p>{d.observacoes}</p>
          </section>
          <section className="folha__totais">
            <div><b>SUBTOTAL</b><span>{moeda(subtotalDe(d))}</span></div>
            <div><b>DESCONTO</b><span>{desconto ? moeda(desconto) : ''}</span></div>
            <div className="folha__total"><b>VALOR TOTAL</b><span>{moeda(totalDe(d))}</span></div>
          </section>
        </div>

        <footer className="folha__assinatura">
          <p>✔ Mão de obra especializada · Materiais de qualidade · Compromisso com o prazo<br />
            <b>WhatsApp {EMPRESA.telefone}</b></p>
          <p className="folha__resp"><span /> Profissional Responsável<br /><b>{EMPRESA.responsavel}</b></p>
        </footer>
      </main>

      <div className="folha__validade">ORÇAMENTO VÁLIDO PARA 30 DIAS.</div>
    </div>
  )
})
FolhaOrcamento.displayName = 'FolhaOrcamento'
