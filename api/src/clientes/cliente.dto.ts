import { IsOptional, IsString, MinLength } from 'class-validator';

export class CriarClienteDto {
  @IsString() @MinLength(1) nome!: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() endereco?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() bairro?: string;
}

export class AtualizarClienteDto {
  @IsOptional() @IsString() @MinLength(1) nome?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() endereco?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() bairro?: string;
}
