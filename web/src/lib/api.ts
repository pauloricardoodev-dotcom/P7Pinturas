import type { Dados } from './types'
import { arredonda, num } from './format'

export const subtotalDe = (d: Dados) =>
  arredonda(d.itens.reduce((s, i) => s + num(i.valorTotal), 0))

export const totalDe = (d: Dados) => Math.max(0, arredonda(subtotalDe(d) - num(d.desconto)))

export async function salvarOrcamento(d: Dados): Promise<{ id: number }> {
  const itens = d.itens
    .filter((i) => i.descricao.trim() || num(i.valorTotal))
    .map((i) => ({
      descricao: i.descricao.trim(),
      area: num(i.area) || undefined,
      valorUnitario: num(i.valorUnitario) || undefined,
      valorTotal: num(i.valorTotal),
    }))

  const res = await fetch('/api/orcamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: d.tipo,
      data: d.data,
      cliente: d.cliente.trim(),
      endereco: d.endereco.trim(),
      cidade: d.cidade.trim(),
      bairro: d.bairro.trim(),
      telefone: d.telefone.trim(),
      email: d.email.trim(),
      itens,
      observacoes: d.observacoes.trim(),
      desconto: num(d.desconto),
    }),
  })
  if (!res.ok) throw new Error('Não foi possível salvar o orçamento.')
  return res.json()
}
