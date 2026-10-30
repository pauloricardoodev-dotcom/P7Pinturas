export function Inicio({ onNovo }: { onNovo: () => void }) {
  return (
    <main id="conteudo" className="inicio">
      <h1 className="visually-hidden">P7 Pinturas – Início</h1>

      {/* Decorativo. Tela em pé recebe a arte vertical; tela larga, o banner. fetchpriority alto: é o maior elemento. */}
      <picture>
        <source media="(max-width: 767.98px), (orientation: portrait)" srcSet="/fundo-mobile.webp" width={940} height={1672} />
        <img className="inicio__fundo" src="/fundo-desktop.webp" alt="" width={1672} height={940} fetchPriority="high" decoding="async" />
      </picture>

      <button type="button" className="btn-novo" onClick={onNovo}><span className="btn-novo__mais" aria-hidden="true">+</span>Novo Orçamento</button>
    </main>
  )
}
