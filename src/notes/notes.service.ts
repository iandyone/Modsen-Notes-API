import { Injectable } from '@nestjs/common';
import { NoteDto } from './dto/notes.dto';
import { UpdateNoteDto } from './dto/update.dto';

interface TagMap {
  [key: string]: Set<number>;
}

@Injectable()
export class NotesService {
  private notes: NoteDto[] = [];
  private tagsMap: TagMap = {};

  getAllNotes(tag?: string): NoteDto[] {
    if (tag) {
      const notesWithTag = this.tagsMap[`#${tag}`];

      if (!notesWithTag) {
        return [];
      }

      const notesIds = Array.from(this.tagsMap[`#${tag}`]);

      if (notesIds) {
        return this.notes.filter(({ id }) => notesIds.includes(id));
      }
    }

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
    const existingNote = this.notes.find(
      (currentNote) => currentNote.id === note.id,
    );

    if (!existingNote) {
      return null;
    }

    existingNote.tags.forEach((tag) => {
      this.tagsMap[tag]?.delete(note.id);
      if (this.tagsMap[tag].size === 0) {
        delete this.tagsMap[tag];
      }
    });

    this.notes = this.notes.map((currentNote) =>
      currentNote.id === note.id ? { ...currentNote, ...note } : currentNote,
    );

    if (note.tags?.length) {
      note.tags.forEach((tag) => {
        if (!this.tagsMap[tag]) {
          this.tagsMap[tag] = new Set([note.id]);
        } else {
          this.tagsMap[tag].add(note.id);
        }
      });
    }

    return note;
  }

  getTags() {
    return Array.from(this.tagsMap['#1']);
  }
}
