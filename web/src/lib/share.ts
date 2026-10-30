import { moeda, telefoneWhats } from './format'
import type { Dados } from './types'

/**
 * Gera a imagem da folha e envia. No celular abre o compartilhamento nativo
 * (WhatsApp recebe a imagem); no computador baixa o arquivo e abre o WhatsApp
 * Web já com a mensagem para o cliente.
 */
export async function compartilharFolha(node: HTMLElement, d: Dados, total: number) {
  const { toBlob } = await import('html-to-image') // carregado só quando necessário
  const blob = await toBlob(node, { pixelRatio: 2, style: { transform: 'none' } })
  if (!blob) throw new Error('Não foi possível gerar a imagem.')

  const nome = `orcamento-${d.tipo.toLowerCase()}-${d.cliente.trim().replace(/\s+/g, '-') || 'cliente'}.png`
  const file = new File([blob], nome, { type: 'image/png' })
  const texto = `Olá, ${d.cliente.trim()}! Segue o orçamento da P7 Pinturas no valor de ${moeda(total)}. Válido por 30 dias.`

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], text: texto })
    return
  }

  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: nome })
  a.click()
  URL.revokeObjectURL(url)
  window.open(`https://wa.me/${telefoneWhats(d.telefone)}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
}
