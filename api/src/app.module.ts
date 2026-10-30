import { mkdirSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orcamento } from './orcamentos/orcamento.entity.js';
import { OrcamentosModule } from './orcamentos/orcamentos.module.js';
import { AuditoriaModule } from './auditoria/auditoria.module.js';
import { Cliente } from './clientes/cliente.entity.js';
import { ClientesModule } from './clientes/clientes.module.js';

mkdirSync('data', { recursive: true });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: 'data/p7.sqlite',
      autoSave: true,
      entities: [Orcamento, Cliente],
      synchronize: true,
    }),
    OrcamentosModule,
    AuditoriaModule,
    ClientesModule,
  ],
})
export class AppModule {}
