const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const moeda = (n: number) => brl.format(n)

/** Converte o texto de um input numérico em número (vazio vira 0). */
export const num = (s: string) => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export const arredonda = (n: number) => Math.round(n * 100) / 100

export const hojeISO = () => new Date().toISOString().slice(0, 10)

export const dataBR = (iso: string) => iso.split('-').reverse().join('/')

/** Telefone do cliente no formato do wa.me (DDI 55 + DDD + número). */
export const telefoneWhats = (tel: string) => {
  const d = tel.replace(/\D/g, '')
  return d.length === 10 || d.length === 11 ? `55${d}` : d
}
