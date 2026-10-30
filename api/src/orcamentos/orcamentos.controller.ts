import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { OrcamentosService } from './orcamentos.service.js';
import { AlterarStatusDto, CriarOrcamentoDto } from './orcamento.dto.js';

@Controller('orcamentos')
export class OrcamentosController {
  constructor(private readonly service: OrcamentosService) {}

  @Post() criar(@Body() dto: CriarOrcamentoDto) { return this.service.criar(dto); }
  @Get() listar() { return this.service.listar(); }
  @Get(':id') buscar(@Param('id', ParseIntPipe) id: number) { return this.service.buscar(id); }
  @Patch(':id/status')
  status(@Param('id', ParseIntPipe) id: number, @Body() dto: AlterarStatusDto) {
    return this.service.alterarStatus(id, dto);
  }
}
