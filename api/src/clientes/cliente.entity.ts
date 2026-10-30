import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  nome!: string;

  @Column({ type: 'varchar', default: '' })
  telefone!: string;

  @Column({ type: 'varchar', default: '' })
  email!: string;

  @Column({ type: 'varchar', default: '' })
  endereco!: string;

  @Column({ type: 'varchar', default: '' })
  cidade!: string;

  @Column({ type: 'varchar', default: '' })
  bairro!: string;

  @CreateDateColumn()
  criadoEm!: Date;
}
