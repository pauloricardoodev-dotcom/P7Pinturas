export interface Cliente {
  id: number
  nome: string
  telefone: string
  email: string
  endereco: string
  cidade: string
  bairro: string
}

export type DadosCliente = Omit<Cliente, 'id'>

export const clienteVazio = (): DadosCliente => ({
  nome: '', telefone: '', email: '', endereco: '', cidade: '', bairro: '',
})

const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function pedir<T>(url: string, init?: RequestInit, erro = 'Não foi possível concluir a operação.'): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(erro)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const listarClientes = () =>
  pedir<Cliente[]>('/api/clientes', undefined, 'Não foi possível carregar os clientes.')

export const salvarCliente = (d: DadosCliente) =>
  pedir<Cliente>('/api/clientes', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }, 'Não foi possível salvar o cliente.')

export const atualizarCliente = (id: number, d: DadosCliente) =>
  pedir<Cliente>(`/api/clientes/${id}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(d) }, 'Não foi possível atualizar o cliente.')

export const excluirCliente = (id: number) =>
  pedir<void>(`/api/clientes/${id}`, { method: 'DELETE' }, 'Não foi possível excluir o cliente.')
