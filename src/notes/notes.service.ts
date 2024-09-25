import { Injectable } from '@nestjs/common';
import { UpdateNoteDto } from './dto/note-update';
import { NotesPositionsDto } from './dto/notes-positions';
import { PostgresService } from '../postgress/postgres.service';
import { UserModel } from '../../models/user.model';
import { NoteModel } from '../../models/note.model';

@Injectable()
export class NotesService {
  constructor(private readonly postgresServise: PostgresService) {}

  async getAllNotes(user: UserModel, tag?: string): Promise<NoteModel[]> {
    try {
      const notes = await this.postgresServise.getAllNotes(user, tag);

      return notes;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async createNote(user: UserModel, color: string) {
    try {
      const note = await this.postgresServise.createNote(user, color);

      return note;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async removeNote(id: number) {
    try {
      const note = await this.postgresServise.removeNote(id);
      return note;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async updateNote(user: UserModel, note: UpdateNoteDto) {
    try {
      const updatedNote = await this.postgresServise.updateNote(user, note);

      return updatedNote;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async updateNotesPositions(notes: NotesPositionsDto[]) {
    try {
      return await this.postgresServise.updateNotePosition(notes);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getNotesTags(user: UserModel, tag?: string) {
    try {
      const notesTags = await this.postgresServise.getNotesTag(user, tag);

      return notesTags;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
