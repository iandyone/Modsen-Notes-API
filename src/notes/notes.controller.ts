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
  InternalServerErrorException,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { UpdateNoteDto } from './dto/note-update';
import { NotesPositionsDto } from './dto/notes-positions';
import { JoiValidationPipe } from './pipes/joi-validations-pipe';
import { noteSchema, updateNotesPositionsSchema } from './schemas/note.schema';
import { colorSchema, idSchema, tagSchema } from './schemas/fields.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @UsePipes(new JoiValidationPipe(tagSchema))
  getAllNotes(@Query('tag') tag: string) {
    try {
      return this.notesService.getAllNotes(tag);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }

  @Post()
  @UsePipes(new JoiValidationPipe(colorSchema))
  createNote(@Body('color') color: string) {
    try {
      return this.notesService.createNote(color);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }

  @Delete()
  @UsePipes(new JoiValidationPipe(idSchema))
  removeNote(@Body('id', ParseIntPipe) id: number) {
    try {
      return this.notesService.removeNote(id);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }

  @Patch()
  @UsePipes(new JoiValidationPipe(noteSchema))
  updateNote(@Body('note') note: UpdateNoteDto) {
    try {
      return this.notesService.updateNote(note);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }

  @Put()
  @UsePipes(new JoiValidationPipe(updateNotesPositionsSchema))
  updateNotesPositions(@Body('notes') notes: NotesPositionsDto[]) {
    try {
      return this.notesService.updateNotesPositions(notes);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }
}
