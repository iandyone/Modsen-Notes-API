import { PartialType } from '@nestjs/mapped-types';
import { NoteDto } from './notes.dto';

export class UpdateNoteDto extends PartialType(NoteDto) {}
