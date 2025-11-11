
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client, but needed for creation
  role: 'admin' | 'student';
}

export enum Subject {
  History = 'History',
  Geography = 'Geography',
}

export interface Note {
  id: string;
  subject: Subject;
  title: string;
  description: string;
  fileData: string; // Base64 encoded PDF
  fileName: string;
  uploadDate: string;
}

export interface Announcement {
  id: string;
  message: string;
  sender: string;
  date: string;
}
