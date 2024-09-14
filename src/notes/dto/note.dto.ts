import {
  IsString,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

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
  @MaxLength(80, { each: true })
  tags: string[];

  @IsInt()
  timestamp: number;

  @IsInt()
  @Min(1)
  position: number;

  @IsString()
  color: string;
}
