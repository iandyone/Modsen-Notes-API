export interface NoteModel {
  id: number;
  title: string;
  description: string;
  tags: string[];
  timestamp: number;
  position: number;
  color: string;
}
