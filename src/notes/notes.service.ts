import { Injectable } from '@nestjs/common';
import { UpdateNoteDto } from './dto/note-update';
import { Pool } from 'pg';
import { NoteDto } from './dto/note.dto';
import { NotesPositionsDto } from './dto/notes-positions';

@Injectable()
export class NotesService {
  private pool: Pool;

  constructor() {
    this.connectToDatabase();
  }

  private connectToDatabase() {
    try {
      this.pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
      });

      this.pool.connect((err) => {
        if (err) {
          console.log('Error during connection to database', err);
          return;
        }

        console.log('Connected to database successfully!');
      });

      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        setTimeout(() => {
          console.log('Attempting to reconnect to the database...');
          this.connectToDatabase();
        }, 3000);
      });
    } catch (error) {
      console.log('Error during database connection:', error);
      setTimeout(() => this.connectToDatabase(), 3000);
    }
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
         FROM notes n LEFT OUTER JOIN tags t ON n.id=t.note_id 
         ${tag ? 'WHERE n.id IN (SELECT note_id FROM tags WHERE LOWER(tag)=LOWER($1))' : ''}
         GROUP BY n.id 
         ORDER BY n.position`,
        tag ? ['#' + tag] : [],
      );

      return notes.rows;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async createNote(color: string) {
    try {
      const note = await this.pool.query(
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

      return note.rows;
    } catch (error) {
      console.log(error);
      throw new Error(error);
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
      throw new Error(error);
    }
  }

  async updateNote(note: UpdateNoteDto) {
    try {
      await this.pool.query('BEGIN');
      for (const key of Object.keys(note)) {
        if (key !== 'id' && key !== 'tags' && key !== 'lastUpdate') {
          if (note[key]) {
            const query = `UPDATE notes SET ${key} = $1 WHERE id = $2`;
            await this.pool.query(query, [note[key], note.id]);
          }
        }
      }

      await this.pool.query(
        `UPDATE notes SET lastUpdate = NOW() WHERE id = $1`,
        [note.id],
      );

      if (note.description) {
        await this.pool.query('DELETE FROM tags WHERE note_id = $1', [note.id]);

        if (note.tags && note.tags.length > 0) {
          for (const tag of note.tags) {
            await this.pool.query(
              'INSERT INTO tags (tag, note_id) VALUES ($1, $2)',
              [tag, note.id],
            );
          }
        }
      }

      await this.pool.query('COMMIT');

      return (
        await this.pool.query('SELECT * FROM notes WHERE id = $1', [note.id])
      ).rows;
    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.log(error);
      throw new Error(error);
    }
  }

  async updateNotesPositions(notes: NotesPositionsDto[]) {
    try {
      await this.pool.query('BEGIN');

      for (const { id, position } of notes) {
        await this.pool.query('UPDATE notes SET position=$1 WHERE id=$2', [
          position,
          id,
        ]);
      }

      await this.pool.query('COMMIT');
    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.log(error);
      throw new Error(error);
    }
  }

  async getNotesTags(tag?: string) {
    try {
      const tags = await this.pool.query(
        `SELECT DISTINCT tag FROM tags ${tag && 'WHERE LOWER(tag) LIKE LOWER($1)'}`,
        tag ? ['#' + tag + '%'] : [],
      );

      return tags.rows.map((item) => item?.tag.slice(1));
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
