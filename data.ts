
import { User, Note, Announcement, Question, Subject, Assignment, Feedback } from './types';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } from './constants';
import { supabase } from './supabaseClient';

// --- Admin Profile Management (Kept Local for Simplicity) ---
interface AdminProfile {
  name: string;
  username: string;
  email: string;
  password: string;
}

const defaultAdminProfile: AdminProfile = {
  name: 'Teacher Sylvia',
  username: ADMIN_USERNAME,
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD
};

export const getAdminProfile = (): AdminProfile => {
  const stored = localStorage.getItem('adminProfile');
  return stored ? JSON.parse(stored) : defaultAdminProfile;
};

export const updateAdminProfile = (profile: AdminProfile): void => {
  localStorage.setItem('adminProfile', JSON.stringify(profile));
};


// --- API Wrappers for Supabase ---

// Users
export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        classLevel: u.class_level,
        isApproved: u.is_approved,
        avatarUrl: u.avatar_url
    }));
};

export const getStudents = async (): Promise<User[]> => {
    const users = await getUsers();
    return users.filter(u => u.role === 'student' && u.isApproved);
};

export const getPendingStudents = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
        .eq('is_approved', false);
    
    if (error) throw error;
    
    return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        classLevel: u.class_level,
        isApproved: u.is_approved,
        avatarUrl: u.avatar_url
    }));
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        classLevel: data.class_level,
        isApproved: data.is_approved,
        avatarUrl: data.avatar_url
    };
};

export const addUser = async (user: Omit<User, 'id' | 'isApproved'>): Promise<User> => {
    // Admin added users are approved by default
    const dbUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        class_level: user.classLevel,
        is_approved: true,
        avatar_url: user.avatarUrl
    };
    const { data, error } = await supabase.from('users').insert([dbUser]).select();
    if (error) throw error;
    const u = data[0];
    return {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        classLevel: u.class_level,
        isApproved: u.is_approved,
        avatarUrl: u.avatar_url
    };
};

export const registerStudent = async (user: Omit<User, 'id' | 'role' | 'isApproved'>): Promise<string> => {
    // Self-registered users are NOT approved by default
    const dbUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role: 'student',
        class_level: user.classLevel,
        is_approved: false,
        avatar_url: user.avatarUrl
    };
    const { data, error } = await supabase.from('users').insert([dbUser]).select();
    if (error) throw error;
    return data[0].id;
};

export const approveUser = async (id: string): Promise<void> => {
    const { error } = await supabase.from('users').update({ is_approved: true }).eq('id', id);
    if (error) throw error;
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.password) dbUpdates.password = updates.password;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.classLevel) dbUpdates.class_level = updates.classLevel;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) throw error;
};

export const removeUser = async (id: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
    const admin = getAdminProfile();
    if (email.toLowerCase() === admin.email.toLowerCase()) {
        return { id: 'admin-user', name: admin.name, username: admin.username, email: admin.email, role: 'admin', isApproved: true };
    }
    const { data } = await supabase.from('users').select('*').ilike('email', email).single();
    if (!data) return undefined;
    return {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        classLevel: data.class_level,
        isApproved: data.is_approved,
        avatarUrl: data.avatar_url
    };
};

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
    const admin = getAdminProfile();
    if (username.toLowerCase() === admin.username.toLowerCase()) {
         return { id: 'admin-user', name: admin.name, username: admin.username, email: admin.email, role: 'admin', isApproved: true };
    }
    // Using simple query, Supabase check
    const { data } = await supabase.from('users').select('*').ilike('username', username).maybeSingle();
    
    if (!data) return undefined;
    
    return {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        classLevel: data.class_level,
        isApproved: data.is_approved,
        avatarUrl: data.avatar_url
    };
};

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    // Sanitize filename to avoid issues
    const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);
  
    if (uploadError) {
      throw uploadError;
    }
  
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
};

// Notes
export const getNotes = async (): Promise<Note[]> => {
    const { data, error } = await supabase.from('notes').select('*');
    if (error) throw error;
    return data.map((n: any) => ({
        id: n.id,
        subject: n.subject,
        title: n.title,
        content: n.content,
        uploadDate: n.upload_date,
        classLevel: n.class_level
    }));
};

export const getNoteById = async (id: string): Promise<Note | undefined> => {
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
        id: data.id,
        subject: data.subject,
        title: data.title,
        content: data.content,
        uploadDate: data.upload_date,
        classLevel: data.class_level
    };
};

export const addNote = async (note: Omit<Note, 'id'>): Promise<void> => {
    const dbNote = {
        subject: note.subject,
        title: note.title,
        content: note.content,
        upload_date: note.uploadDate,
        class_level: note.classLevel
    };
    const { error } = await supabase.from('notes').insert([dbNote]);
    if (error) throw error;
};

export const updateNote = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
    const dbNote: any = {};
    if(updatedNote.subject) dbNote.subject = updatedNote.subject;
    if(updatedNote.title) dbNote.title = updatedNote.title;
    if(updatedNote.content) dbNote.content = updatedNote.content;
    if(updatedNote.classLevel) dbNote.class_level = updatedNote.classLevel;

    const { error } = await supabase.from('notes').update(dbNote).eq('id', id);
    if (error) throw error;
};

export const deleteNote = async (id: string): Promise<void> => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
};

// Announcements
export const getAnnouncements = async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error) throw error;
    return data.map((a: any) => ({
        id: a.id,
        message: a.message,
        sender: a.sender,
        date: a.date,
        classLevel: a.class_level
    }));
};

export const addAnnouncement = async (ann: Omit<Announcement, 'id'>): Promise<void> => {
    const dbAnn = {
        message: ann.message,
        sender: ann.sender,
        date: ann.date,
        class_level: ann.classLevel
    };
    const { error } = await supabase.from('announcements').insert([dbAnn]);
    if (error) throw error;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
};

export const updateAnnouncement = async (id: string, message: string): Promise<void> => {
    const { error } = await supabase.from('announcements').update({ message }).eq('id', id);
    if (error) throw error;
};

// Questions
export const getQuestions = async (): Promise<Question[]> => {
    const { data, error } = await supabase.from('questions').select('*');
    if (error) throw error;
    return data.map((q: any) => ({
        id: q.id,
        studentId: q.student_id,
        studentName: q.student_name,
        questionText: q.question_text,
        answerText: q.answer_text,
        questionDate: q.question_date,
        answerDate: q.answer_date,
        isAnswered: q.is_answered
    }));
};

export const getQuestionsByStudent = async (studentId: string): Promise<Question[]> => {
    const { data, error } = await supabase.from('questions').select('*').eq('student_id', studentId);
    if (error) throw error;
    return data.map((q: any) => ({
        id: q.id,
        studentId: q.student_id,
        studentName: q.student_name,
        questionText: q.question_text,
        answerText: q.answer_text,
        questionDate: q.question_date,
        answerDate: q.answer_date,
        isAnswered: q.is_answered
    }));
};

export const addQuestion = async (question: Omit<Question, 'id'>): Promise<void> => {
    const dbQ = {
        student_id: question.studentId,
        student_name: question.studentName,
        question_text: question.questionText,
        question_date: question.questionDate,
        is_answered: false
    };
    const { error } = await supabase.from('questions').insert([dbQ]);
    if (error) throw error;
};

export const answerQuestion = async (id: string, answerText: string): Promise<void> => {
    const update = {
        is_answered: true,
        answer_text: answerText,
        answer_date: new Date().toISOString()
    };
    const { error } = await supabase.from('questions').update(update).eq('id', id);
    if (error) throw error;
};

// Assignments
export const getAssignments = async (): Promise<Assignment[]> => {
    const { data, error } = await supabase.from('assignments').select('*');
    if (error) throw error;
    return data.map((a: any) => ({
        id: a.id,
        subject: a.subject,
        content: a.content,
        dueDate: a.due_date,
        postedDate: a.posted_date,
        classLevel: a.class_level
    }));
};

export const getAssignmentById = async (id: string): Promise<Assignment | undefined> => {
    const { data, error } = await supabase.from('assignments').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
        id: data.id,
        subject: data.subject,
        content: data.content,
        dueDate: data.due_date,
        postedDate: data.posted_date,
        classLevel: data.class_level
    };
};

export const addAssignment = async (assignment: Omit<Assignment, 'id'>): Promise<void> => {
    const dbAss = {
        subject: assignment.subject,
        content: assignment.content,
        due_date: assignment.dueDate,
        posted_date: assignment.postedDate,
        class_level: assignment.classLevel
    };
    const { error } = await supabase.from('assignments').insert([dbAss]);
    if (error) throw error;
};

export const updateAssignment = async (id: string, updated: Partial<Assignment>): Promise<void> => {
    const dbAss: any = {};
    if(updated.subject) dbAss.subject = updated.subject;
    if(updated.content) dbAss.content = updated.content;
    if(updated.dueDate) dbAss.due_date = updated.dueDate;
    if(updated.classLevel) dbAss.class_level = updated.classLevel;

    const { error } = await supabase.from('assignments').update(dbAss).eq('id', id);
    if (error) throw error;
};

export const deleteAssignment = async (id: string): Promise<void> => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
};

// Feedback
export const getFeedback = async (): Promise<Feedback[]> => {
    const { data, error } = await supabase.from('feedback').select('*');
    if (error) throw error;
    return data.map((f: any) => ({
        id: f.id,
        studentId: f.student_id,
        studentName: f.student_name,
        type: f.type,
        subject: f.subject,
        message: f.message,
        date: f.date
    }));
};

export const addFeedback = async (feedback: Omit<Feedback, 'id'>): Promise<void> => {
    const dbFeedback = {
        student_id: feedback.studentId,
        student_name: feedback.studentName,
        type: feedback.type,
        subject: feedback.subject,
        message: feedback.message,
        date: feedback.date
    };
    const { error } = await supabase.from('feedback').insert([dbFeedback]);
    if (error) throw error;
};

export const deleteFeedback = async (id: string): Promise<void> => {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw error;
};

// --- SYSTEM SETTINGS (MAINTENANCE MODE) ---

export interface SystemSettings {
    maintenanceMode: boolean;
    maintenanceEndTime: string;
}

export const getSystemSettings = async (): Promise<SystemSettings> => {
    try {
        const { data, error } = await supabase.from('system_settings').select('*');
        if (error || !data) return { maintenanceMode: false, maintenanceEndTime: '' };
        
        const settings: any = {};
        data.forEach((row: any) => {
            settings[row.key] = row.value;
        });

        return {
            maintenanceMode: settings.maintenance_mode === 'true',
            maintenanceEndTime: settings.maintenance_end_time || ''
        };
    } catch (e) {
        console.warn("Could not fetch system settings, defaulting to normal mode.", e);
        return { maintenanceMode: false, maintenanceEndTime: '' };
    }
};

export const updateSystemSetting = async (key: string, value: string): Promise<void> => {
    const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value });
    if (error) throw error;
};
