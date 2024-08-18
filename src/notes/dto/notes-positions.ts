import { IsNumber, Min } from 'class-validator';
import { NoteDto } from './note.dto';

export class NotesPositionsDto {
  @IsNumber()
  @Min(1)
  id: Pick<NoteDto, 'id'>;

  @IsNumber()
  @Min(1)
  position: Pick<NoteDto, 'position'>;
}
