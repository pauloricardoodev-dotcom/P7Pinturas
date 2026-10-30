import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity.js';
import { AtualizarClienteDto, CriarClienteDto } from './cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(@InjectRepository(Cliente) private readonly repo: Repository<Cliente>) {}

  listar() {
    return this.repo.find({ order: { nome: 'ASC' } });
  }

  async criar(dto: CriarClienteDto) {
    const nome = dto.nome.trim();
    // Evita duplicar o mesmo cliente (mesmo nome, sem diferenciar maiúsculas).
    const existente = (await this.repo.find()).find((c) => c.nome.toLowerCase() === nome.toLowerCase());
    if (existente) return existente;
    return this.repo.save(this.repo.create({ ...dto, nome }));
  }

  async atualizar(id: number, dto: AtualizarClienteDto) {
    const c = await this.repo.findOneBy({ id });
    if (!c) throw new NotFoundException();
    return this.repo.save(Object.assign(c, dto));
  }

  async remover(id: number) {
    const r = await this.repo.delete(id);
    if (!r.affected) throw new NotFoundException();
  }
}
