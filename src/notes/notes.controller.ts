import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { UpdateNoteDto } from './dto/update.dto';

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

  @Get('tags')
  getTags() {
    return this.notesService.getTags();
  }
}
