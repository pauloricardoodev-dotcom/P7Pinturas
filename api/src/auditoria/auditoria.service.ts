import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orcamento } from '../orcamentos/orcamento.entity.js';

function diasUteis(ano: number, mes: number) {
  let n = 0;
  const ultimo = new Date(ano, mes, 0).getDate();
  for (let d = 1; d <= ultimo; d++) {
    const w = new Date(ano, mes - 1, d).getDay();
    if (w !== 0 && w !== 6) n++;
  }
  return n;
}

@Injectable()
export class AuditoriaService {
  constructor(@InjectRepository(Orcamento) private readonly repo: Repository<Orcamento>) {}

  /** Fechamento do mês (YYYY-MM) com base nos serviços concluídos. */
  async mensal(mes: string) {
    const [ano, m] = mes.split('-').map(Number);
    const concluidos = (await this.repo.findBy({ status: 'CONCLUIDO' })).filter((o) =>
      o.concluidoEm?.startsWith(mes),
    );

    const porDia = new Map<string, { dia: string; quantidade: number; valor: number }>();
    let total = 0;
    let horasTrabalhadas = 0;
    for (const o of concluidos) {
      const valor = o.valorFinal ?? o.total;
      total += valor;
      const dia = o.concluidoEm!.slice(0, 10);
      const acc = porDia.get(dia) ?? { dia, quantidade: 0, valor: 0 };
      acc.quantidade++;
      acc.valor += valor;
      porDia.set(dia, acc);
      if (o.iniciadoEm) {
        horasTrabalhadas += (Date.parse(o.concluidoEm!) - Date.parse(o.iniciadoEm)) / 36e5;
      }
    }

    const du = diasUteis(ano, m);
    const diasComServico = porDia.size;
    return {
      mes,
      total,
      quantidade: concluidos.length,
      horasTrabalhadas: Math.round(horasTrabalhadas * 10) / 10,
      diasUteis: du,
      diasComServico,
      valorPorDiaUtil: du ? total / du : 0, // equivalente CLT
      valorPorDiaTrabalhado: diasComServico ? total / diasComServico : 0,
      porDia: [...porDia.values()].sort((a, b) => a.dia.localeCompare(b.dia)),
    };
  }
}
