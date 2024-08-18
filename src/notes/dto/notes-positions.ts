import { IsNumber } from 'class-validator';
import { NoteDto } from './note.dto';

export class NotesPositionsDto {
  @IsNumber()
  id: Pick<NoteDto, 'id'>;

  @IsNumber()
  position: Pick<NoteDto, 'position'>;
}
