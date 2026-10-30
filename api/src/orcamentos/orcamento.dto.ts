import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsIn, IsNumber, IsOptional, IsString, Min, ValidateNested,
} from 'class-validator';

export class ItemDto {
  @IsString() descricao!: string;
  @IsOptional() @IsNumber() @Min(0) area?: number;
  @IsOptional() @IsNumber() @Min(0) valorUnitario?: number;
  @IsNumber() @Min(0) valorTotal!: number;
}

export class CriarOrcamentoDto {
  @IsIn(['GESSO', 'PINTURA']) tipo!: 'GESSO' | 'PINTURA';
  @IsString() data!: string;
  @IsString() cliente!: string;
  @IsOptional() @IsString() endereco?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() bairro?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() email?: string;
  @IsArray() @ArrayMaxSize(15) @ValidateNested({ each: true }) @Type(() => ItemDto)
  itens!: ItemDto[];
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsNumber() @Min(0) desconto?: number;
}

export class AlterarStatusDto {
  @IsIn(['ENVIADO', 'APROVADO', 'INICIADO', 'CONCLUIDO'])
  status!: 'ENVIADO' | 'APROVADO' | 'INICIADO' | 'CONCLUIDO';
  /** Permite ao pintor ajustar o valor realmente recebido ao concluir. */
  @IsOptional() @IsNumber() @Min(0) valorFinal?: number;
}
