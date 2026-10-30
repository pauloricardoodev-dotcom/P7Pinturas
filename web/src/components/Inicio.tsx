interface Props {
  nome: string
  onNovo: () => void
  onClientes: () => void
}

export function Inicio({ nome, onNovo, onClientes }: Props) {
  return (
    <main id="conteudo" className="inicio">
      {/* Decorativa; fetchpriority alto porque é o maior elemento da tela. */}
      <img className="inicio__fundo" src="/fundo-inicio.webp" alt="" width={1983} height={793} fetchPriority="high" decoding="async" />

      <h2 className="inicio__titulo">
        <span className="inicio__pre">Bem-vindo de volta,</span>
        <span className="inicio__nome">{nome}!</span>
      </h2>

      {/* O botão principal fica no centro exato da tela; "ou" + Clientes ficam logo abaixo. */}
      <div className="inicio__acoes">
        <button type="button" className="btn-novo" onClick={onNovo}>Novo Orçamento</button>
        <div className="inicio__abaixo">
          <span className="inicio__ou" aria-hidden="true">ou</span>
          <button type="button" className="btn btn-light btn-clientes" onClick={onClientes}>Clientes</button>
        </div>
      </div>
    </main>
  )
}
