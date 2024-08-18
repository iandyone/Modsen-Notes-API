import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { UpdateNoteDto } from './dto/note-update';
import { NotesPositionsDto } from './dto/notes-positions';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getAllNotes(@Query('tag') tag: string) {
    return this.notesService.getAllNotes(tag);
  }

  @Post()
  createNote(@Body('color') color: string) {
    return this.notesService.createNote(color);
  }

  @Delete()
  removeNote(@Body('id', ParseIntPipe) id: number) {
    return this.notesService.removeNote(id);
  }

  @UsePipes(new ValidationPipe())
  @Patch()
  updateNote(@Body('note') note: UpdateNoteDto) {
    return this.notesService.updateNote(note);
  }

  @Put()
  updateNotesPositions(@Body('notes') notes: NotesPositionsDto[]) {
    try {
      return this.notesService.updateNotesPositions(notes);
    } catch (error) {
      console.log(error);
    }
  }
}
