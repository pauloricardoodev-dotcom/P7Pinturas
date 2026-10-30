import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orcamento } from './orcamento.entity.js';
import { AlterarStatusDto, CriarOrcamentoDto } from './orcamento.dto.js';

@Injectable()
export class OrcamentosService {
  constructor(@InjectRepository(Orcamento) private readonly repo: Repository<Orcamento>) {}

  criar(dto: CriarOrcamentoDto) {
    const subtotal = dto.itens.reduce((s, i) => s + i.valorTotal, 0);
    const desconto = dto.desconto ?? 0;
    return this.repo.save(
      this.repo.create({
        ...dto,
        desconto,
        total: Math.max(0, subtotal - desconto),
        status: 'ENVIADO',
        iniciadoEm: null,
        concluidoEm: null,
        valorFinal: null,
      }),
    );
  }

  listar() {
    return this.repo.find({ order: { id: 'DESC' }, take: 200 });
  }

  async buscar(id: number) {
    const o = await this.repo.findOneBy({ id });
    if (!o) throw new NotFoundException();
    return o;
  }

  async alterarStatus(id: number, dto: AlterarStatusDto) {
    const o = await this.buscar(id);
    o.status = dto.status;
    const agora = new Date().toISOString();
    if (dto.status === 'INICIADO') o.iniciadoEm = agora;
    if (dto.status === 'CONCLUIDO') {
      o.concluidoEm = agora;
      o.iniciadoEm ??= agora;
      o.valorFinal = dto.valorFinal ?? o.total;
    }
    return this.repo.save(o);
  }
}
