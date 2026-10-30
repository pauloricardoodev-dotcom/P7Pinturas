export type Tipo = 'GESSO' | 'PINTURA'

export interface Item {
  descricao: string
  area: string
  valorUnitario: string
  valorTotal: string
  /** true quando o pintor digitou o total à mão (não recalcula pela área). */
  manual: boolean
}

export interface Dados {
  tipo: Tipo
  data: string
  cliente: string
  endereco: string
  cidade: string
  bairro: string
  telefone: string
  email: string
  itens: Item[]
  observacoes: string
  desconto: string
}

export const MAX_ITENS = 15

export const itemVazio = (): Item => ({
  descricao: '',
  area: '',
  valorUnitario: '',
  valorTotal: '',
  manual: false,
})

export const TEMAS = {
  GESSO: {
    titulo: 'REPARO DE GESSO',
    aba: 'Gesso',
    // Valor sugerido por m² — ponto de partida, sempre editável.
    precoM2: 80,
  },
  PINTURA: {
    titulo: 'PINTURAS',
    aba: 'Pintura',
    precoM2: 25,
  },
} as const

export const EMPRESA = {
  nome: 'PINTURAS',
  cnpj: '65.694.688/0001-00',
  telefone: '44 99912-4724',
  responsavel: 'Paulo Messias da Silva',
}
