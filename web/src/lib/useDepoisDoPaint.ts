import { useEffect, useState } from 'react'

/** true só depois que a tela principal pintou e o navegador ficou ocioso. */
export function useDepoisDoPaint() {
  const [pronto, setPronto] = useState(false)
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
    const id = ric(() => setPronto(true))
    return () => (window.cancelIdleCallback ?? clearTimeout)(id as number)
  }, [])
  return pronto
}
