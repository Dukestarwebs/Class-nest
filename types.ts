
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string; // Should not be sent to client, but needed for creation
  role: 'admin' | 'student';
  classLevel?: ClassLevel;
  isApproved: boolean;
  avatarUrl?: string;
}

export type ClassLevel = 'P6' | 'P7' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export enum Subject {
  Mathematics = 'Mathematics',
  English = 'English',
  Physics = 'Physics',
  Chemistry = 'Chemistry',
  Biology = 'Biology',
  History = 'History',
  Geography = 'Geography',
  Entrepreneurship = 'Entrepreneurship',
  Science = 'Science',
  SocialStudies = 'Social Studies',
  ReligiousEducation = 'Religious Education',
  ICT = 'ICT',
  Vocational = 'Vocational',
  Art = 'Art'
}

export interface Note {
  id: string;
  subject: Subject;
  title: string;
  content: string; // Actual text content of the note
  uploadDate: string;
  classLevel: ClassLevel;
}

export interface Announcement {
  id: string;
  message: string;
  sender: string;
  date: string;
  classLevel: ClassLevel | 'All';
}

export interface Question {
  id: string;
  studentId: string;
  studentName: string;
  questionText: string;
  answerText?: string;
  questionDate: string;
  answerDate?: string;
  isAnswered: boolean;
}

export interface Assignment {
  id: string;
  subject: Subject;
  content: string; // Replaces title and description
  dueDate: string;
  postedDate: string;
  classLevel: ClassLevel;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  type: 'feature' | 'challenge' | 'other';
  subject: string;
  message: string;
  date: string;
}