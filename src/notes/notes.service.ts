import { Injectable } from '@nestjs/common';
import { NoteDto } from './dto/notes.dto';
import { UpdateNoteDto } from './dto/update.dto';

@Injectable()
export class NotesService {
  private notes: NoteDto[] = [];

  getAllNotes(): NoteDto[] {
    return this.notes;
  }

  createNote(color: string) {
    const note: NoteDto = {
      id: this.notes.length ? this.notes.at(-1).id + 1 : 1,
      title: 'Новая заметка',
      description: '',
      color,
      tags: [],
      order: this.notes.length ? this.notes.at(-1).order + 1 : 1,
      timestamp: Date.now(),
    };

    this.notes.push(note);
    return note;
  }

  removeNote(id: number) {
    this.notes = this.notes.filter((note) => note.id !== id);
    return id;
  }

  updateNote(note: UpdateNoteDto) {
    this.notes = this.notes.map((currentNote) =>
      currentNote.id === note.id ? { ...currentNote, ...note } : currentNote,
    );

    return note;
  }
}
