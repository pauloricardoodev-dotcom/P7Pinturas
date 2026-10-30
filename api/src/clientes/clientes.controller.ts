import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ClientesService } from './clientes.service.js';
import { AtualizarClienteDto, CriarClienteDto } from './cliente.dto.js';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Get() listar() { return this.service.listar(); }
  @Post() criar(@Body() dto: CriarClienteDto) { return this.service.criar(dto); }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarClienteDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id') @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) { return this.service.remover(id); }
}
