import { Controller, Get, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service.js';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly service: AuditoriaService) {}

  @Get()
  mensal(@Query('mes') mes = new Date().toISOString().slice(0, 7)) {
    return this.service.mensal(mes);
  }
}
