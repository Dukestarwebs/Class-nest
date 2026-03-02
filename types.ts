

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'student' | 'teacher';
  classLevel?: ClassLevel;
  assignedClasses?: ClassLevel[];
  assignedSubjects?: Subject[];
  isApproved: boolean;
  avatarUrl?: string;
  bio?: string;
  expertise?: string;
  reasonForJoining?: string;
  subscription_expiry?: string;
  phone_number?: string;
  schoolName?: string;
  schoolId?: string;
  plan?: 'standard' | 'developer';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  role: 'admin' | 'student' | 'teacher';
  reactions?: { emoji: string; count: number }[];
  isPoll?: boolean;
  pollOptions?: string[];
}

export interface Payment {
  id: string;
  user_id: string;
  user_name?: string;
  transaction_id: string;
  amount: number;
  status: 'completed' | 'failed' | 'processing';
  date: string;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string;
    postedDate: string;
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
  content: string;
  uploadDate: string;
  classLevel: ClassLevel;
  isArchived?: boolean;
  authorId?: string;
}

/* Added missing Assignment interface used in components and data services */
export interface Assignment {
  id: string;
  subject: Subject;
  content: string;
  dueDate: string;
  postedDate: string;
  classLevel: ClassLevel;
  isArchived?: boolean;
  authorId?: string;
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

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  type: 'feature' | 'challenge' | 'other';
  subject: string;
  message: string;
  date: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: ClassLevel;
  classTeacherId?: string;
  studentIds: string[];
  capacity: number;
  academicYear: string;
  isArchived: boolean;
}