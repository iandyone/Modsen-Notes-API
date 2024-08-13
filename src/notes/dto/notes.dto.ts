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
  lastUpdate: number;

  @IsInt()
  position: number;

  @IsString()
  color: string;
}
