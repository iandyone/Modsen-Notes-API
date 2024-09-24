import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { UserModel } from '../../models/user.model';
import { UserCredentials } from '../users/types';
import { SaveFerfeshTokenResponse, SaveRefreshTokenPayload } from './types';
import { NoteModel } from '../../models/note.model';
import { UpdateNoteDto } from '../notes/dto/note-update';
import { NotesPositionsDto } from '../notes/dto/notes-positions';

@Injectable()
export class PostgresService {
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

  async findUserByEmail(email: string) {
    const user = await this.pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    return user.rows[0];
  }

  async findUserByRefreshToken(refreshToken: string) {
    const user = await this.pool.query(
      'SELECT * FROM users WHERE id = (SELECT user_id FROM tokens WHERE token = $1)',
      [refreshToken],
    );

    return user.rows[0];
  }

  async createUser({ username, email, password }: UserCredentials) {
    const user = await this.pool.query<UserModel>(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password],
    );

    return user.rows[0];
  }

  async saveUserRefreshToken({ id, refreshToken }: SaveRefreshTokenPayload) {
    const data = await this.pool.query<SaveFerfeshTokenResponse>(
      'INSERT INTO tokens (token, user_id) VALUES ($1, $2) RETURNING *',
      [refreshToken, id],
    );

    return data.rows[0];
  }

  async updateUserRefreshToken({ id, refreshToken }: SaveRefreshTokenPayload) {
    const data = await this.pool.query<UserModel>(
      'UPDATE tokens SET token=$1 WHERE user_id = $2 RETURNING *',
      [refreshToken, id],
    );

    return data.rows[0];
  }

  async removeRefreshToken(refreshToken: string) {
    const data = await this.pool.query<SaveFerfeshTokenResponse>(
      'DELETE FROM tokens WHERE token = $1 RETURNING *',
      [refreshToken],
    );

    return data.rows[0];
  }

  async getAllNotes(user: UserModel, tag?: string) {
    const notes = await this.pool.query<NoteModel>(
      `SELECT 
          n.id, 
          n.title, 
          n.description, 
          TO_CHAR(n.lastUpdate, 'DD.MM.YYYY') AS lastUpdate, 
          n.position, 
          n.color, 
          COALESCE(array_agg(t.tag) FILTER (WHERE t.tag IS NOT NULL), '{}') AS tags
       FROM notes n 
       LEFT OUTER JOIN tags t ON n.id = t.note_id 
       WHERE n.user_id = $1 
       ${tag ? 'AND n.id IN (SELECT note_id FROM tags WHERE LOWER(tag) = LOWER($2))' : ''}
       GROUP BY n.id 
       ORDER BY n.position`,
      tag ? [user.id, '#' + tag] : [user.id],
    );

    return notes.rows;
  }

  async createNote(user: UserModel, color: string) {
    const note = await this.pool.query(
      `INSERT INTO notes (
          title, 
          description, 
          color, 
          user_id,
          lastUpdate, 
          position
        ) 
        VALUES (
          'Новая заметка', 
          $1, 
          $2, 
          $3,
          NOW(), 
          COALESCE((SELECT MAX(position) + 1 FROM notes), 1)
        ) 
        RETURNING *`,
      ['', color, user.id],
    );

    return note.rows;
  }

  async removeNote(id: number) {
    await this.pool.query('DELETE FROM tags WHERE note_id=$1', [id]);

    const note = await this.pool.query(
      'DELETE FROM notes WHERE id=$1 RETURNING *',
      [id],
    );
    return note.rows;
  }

  async updateNote(user: UserModel, note: UpdateNoteDto) {
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
              'INSERT INTO tags (tag, note_id, user_id) VALUES ($1, $2, $3)',
              [tag, note.id, user.id],
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
      throw new Error(error);
    }
  }

  async updateNotePosition(notes: NotesPositionsDto[]) {
    try {
      await this.pool.query('BEGIN');

      for (const { id, position } of notes) {
        await this.pool.query('UPDATE notes SET position=$1 WHERE id=$2', [
          position,
          id,
        ]);
      }

      await this.pool.query('COMMIT');
      return true;
    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.log(error);
      throw new Error(error);
    }
  }

  async getNotesTag(user: UserModel, tag?: string) {
    const tags = await this.pool.query(
      `SELECT DISTINCT tag 
       FROM tags 
       WHERE user_id = $1 
       ${tag ? 'AND LOWER(tag) LIKE LOWER($2)' : ''}`,
      tag ? [user.id, '#' + tag + '%'] : [user.id],
    );

    return tags.rows.map((item) => item?.tag.slice(1));
  }
}
