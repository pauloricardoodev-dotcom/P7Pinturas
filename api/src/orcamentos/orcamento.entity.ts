import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoOrcamento = 'GESSO' | 'PINTURA';
export type StatusOrcamento = 'ENVIADO' | 'APROVADO' | 'INICIADO' | 'CONCLUIDO';

export interface ItemOrcamento {
  descricao: string;
  area?: number;
  valorUnitario?: number;
  valorTotal: number;
}

@Entity()
export class Orcamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  tipo!: TipoOrcamento;

  @Column({ type: 'varchar' })
  data!: string; // YYYY-MM-DD

  @Column({ type: 'varchar' })
  cliente!: string;

  @Column({ type: 'varchar', default: '' })
  endereco!: string;

  @Column({ type: 'varchar', default: '' })
  cidade!: string;

  @Column({ type: 'varchar', default: '' })
  bairro!: string;

  @Column({ type: 'varchar', default: '' })
  telefone!: string;

  @Column({ type: 'varchar', default: '' })
  email!: string;

  @Column({ type: 'simple-json' })
  itens!: ItemOrcamento[];

  @Column({ type: 'text', default: '' })
  observacoes!: string;

  @Column({ type: 'real', default: 0 })
  desconto!: number;

  @Column({ type: 'real' })
  total!: number;

  @Column({ type: 'varchar', default: 'ENVIADO' })
  status!: StatusOrcamento;

  @CreateDateColumn()
  criadoEm!: Date;

  @Column({ type: 'varchar', nullable: true })
  iniciadoEm!: string | null;

  @Column({ type: 'varchar', nullable: true })
  concluidoEm!: string | null;

  @Column({ type: 'real', nullable: true })
  valorFinal!: number | null;
}
