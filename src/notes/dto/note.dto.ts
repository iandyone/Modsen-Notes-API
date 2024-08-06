import { IsString, IsArray, IsInt, IsNumber, Min } from 'class-validator';

export class NoteDto {
  @Min(1)
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsInt()
  timestamp: number;

  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  color: string;
}
