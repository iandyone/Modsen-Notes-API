import { Injectable } from '@nestjs/common';
import { NoteDto } from './dto/notes.dto';
import { UpdateNoteDto } from './dto/update.dto';
import { Pool } from 'pg';

@Injectable()
export class NotesService {
  private pool: Pool;
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });

    this.pool.connect((err) => {
      if (err) throw new Error();

      console.log('Connect to database successfully!');
    });
  }

  async getAllNotes(tag?: string): Promise<NoteDto[]> {
    try {
      const notes = await this.pool.query<NoteDto>(
        `SELECT 
            n.id, 
            n.title, 
            n.description, 
            TO_CHAR(n.lastUpdate, 'DD.MM.YYYY') AS lastUpdate, 
            n.position, 
            n.color, 
            COALESCE(array_agg(t.tag) FILTER (WHERE t.tag IS NOT NULL), '{}') AS tags
         FROM notes n 
         LEFT OUTER JOIN tags t ON n.id=t.note_id 
         ${tag ? 'WHERE n.id IN (SELECT note_id FROM tags WHERE tag=$1)' : ''}
         GROUP BY n.id 
         ORDER BY n.position`,
        tag ? ['#' + tag] : [],
      );

      return notes.rows;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async createNote(color: string) {
    try {
      return await this.pool.query(
        `INSERT INTO notes (
            title, 
            description, 
            color, 
            lastUpdate, 
            position
          ) 
          VALUES (
            'Новая заметка', 
            $1, 
            $2, 
            NOW(), 
            COALESCE((SELECT MAX(position) + 1 FROM notes), 1)
          ) 
          RETURNING *`,
        ['', color],
      );
    } catch (error) {
      console.log(error);
    }
  }

  async removeNote(id: number) {
    try {
      await this.pool.query('DELETE FROM tags WHERE note_id=$1', [id]);
      const note = await this.pool.query(
        'DELETE FROM notes WHERE id=$1 RETURNING *',
        [id],
      );
      return note.rows;
    } catch (error) {
      console.log(error);
    }
  }

  async updateNote(note: UpdateNoteDto) {
    try {
      for (const key of Object.keys(note)) {
        if (key !== 'id' && key !== 'tags' && key !== 'lastUpdate') {
          if (note[key]) {
            const query = `UPDATE notes SET ${key} = $1 WHERE id = $2`;
            await this.pool.query(query, [note[key], note.id]);
          }
        }
      }

      await this.pool.query('DELETE FROM tags WHERE note_id = $1', [note.id]);

      if (note.tags && note.tags.length > 0) {
        for (const tag of note.tags) {
          await this.pool.query(
            'INSERT INTO tags (tag, note_id) VALUES ($1, $2)',
            [tag, note.id],
          );
        }
      }

      return (
        await this.pool.query('SELECT * FROM notes WHERE id = $1', [note.id])
      ).rows;
    } catch (error) {
      console.log(error);
    }
  }
}
