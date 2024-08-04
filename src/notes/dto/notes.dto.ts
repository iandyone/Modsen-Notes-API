import { IsString, IsArray, IsInt, IsNumber } from 'class-validator';

export class NoteDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  tags: string[];

  @IsInt()
  timestamp: number;

  @IsInt()
  order: number;

  @IsString()
  color: string;
}
