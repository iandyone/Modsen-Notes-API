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
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { UpdateNoteDto } from './dto/note-update';
import { NotesPositionsDto } from './dto/notes-positions';
import { JoiValidationPipe } from './pipes/joi-validations-pipe';
import { noteSchema, updateNotesPositionsSchema } from './schemas/note.schema';
import { colorSchema, idSchema, tagSchema } from './schemas/fields.schema';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @UseGuards(AuthJwtGuard)
  @UsePipes(new JoiValidationPipe(tagSchema))
  getAllNotes(@Query('tag') tag: string, @Req() req) {
    try {
      return this.notesService.getAllNotes(req.user, tag);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }

  @Post()
  @UseGuards(AuthJwtGuard)
  @UsePipes(new JoiValidationPipe(colorSchema))
  createNote(@Body('color') color: string, @Req() req) {
    try {
      return this.notesService.createNote(req.user, color);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }

  @Delete()
  @UseGuards(AuthJwtGuard)
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
  @UseGuards(AuthJwtGuard)
  @UsePipes(new JoiValidationPipe(noteSchema))
  updateNote(@Body('note') note: UpdateNoteDto, @Req() req) {
    try {
      return this.notesService.updateNote(req.user, note);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }

  @Put()
  @UseGuards(AuthJwtGuard)
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

  @Get('tags')
  @UseGuards(AuthJwtGuard)
  @UsePipes(new JoiValidationPipe(tagSchema))
  getNotesTags(@Query('tag') tag: string, @Req() req) {
    try {
      return this.notesService.getNotesTags(req.user, tag);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', {
        cause: error,
      });
    }
  }
}
