import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orcamento } from './orcamento.entity.js';
import { OrcamentosController } from './orcamentos.controller.js';
import { OrcamentosService } from './orcamentos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Orcamento])],
  controllers: [OrcamentosController],
  providers: [OrcamentosService],
})
export class OrcamentosModule {}
