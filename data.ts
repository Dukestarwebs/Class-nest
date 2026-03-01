

import { User, Note, Announcement, Question, Subject, Assignment, Feedback, Job, Payment, Draft, ChatMessage, SchoolClass, ClassLevel } from './types';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } from './constants';
import { supabase } from './supabaseClient';

// Hardcoded API keys to ensure functionality in browser ESM environments where process.env/import.meta.env may be unavailable
const JULYPAY_KEY = 'jp_6TbBbkA5zDeVyZj4xvmigjmp.NrZqATky6zVJhKc4jEwCDtid7LaWnBY9bvg2uUfo';
const JULYPAY_URL = 'https://app.julypay.net/api/v1';

// --- USER MANAGEMENT ---

export const getUsers = async (schoolId?: string): Promise<User[]> => {
    let query = supabase.from('users').select('*');
    if (schoolId) {
        query = query.eq('school_id', schoolId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        classLevel: u.class_level,
        assignedClasses: u.assigned_classes,
        assignedSubjects: u.assigned_subjects,
        isApproved: u.is_approved,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        expertise: u.expertise,
        reasonForJoining: u.reason_for_joining,
        subscription_expiry: u.subscription_expiry,
        phone_number: u.phone_number,
        schoolName: u.school_name,
        schoolId: u.school_id,
        plan: u.plan || 'standard',
    }));
};

export const getStudents = async (schoolId?: string): Promise<User[]> => {
    const users = await getUsers(schoolId);
    return users.filter(u => u.role === 'student' && u.isApproved);
};

export const getTeachers = async (schoolId?: string): Promise<User[]> => {
    const users = await getUsers(schoolId);
    return users.filter(u => u.role === 'teacher' && u.isApproved);
};

export const getSchoolAdmins = async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .neq('username', ADMIN_USERNAME);
    if (error) throw error;
    return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        isApproved: u.is_approved,
        schoolName: u.school_name,
        schoolId: u.school_id,
    }));
};

export const registerStudent = async (user: Omit<User, 'id' | 'role' | 'isApproved'>): Promise<string> => {
    const dbUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role: 'student',
        class_level: user.classLevel,
        is_approved: true,
        avatar_url: user.avatarUrl,
        plan: 'standard',
        // Changed from 14 days to 2 days only
        subscription_expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    };
    const { data, error } = await supabase.from('users').insert([dbUser]).select();
    if (error) throw error;
    return data[0].id;
};

export const registerTeacher = async (user: Omit<User, 'id' | 'role' | 'isApproved'>): Promise<string> => {
    const dbUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role: 'teacher',
        is_approved: false, // Teachers must be approved by admin
        avatar_url: user.avatarUrl,
        plan: 'standard',
        bio: user.bio,
        expertise: user.expertise,
        reason_for_joining: user.reasonForJoining,
        // Corrected property names from user.assigned_classes/subjects to camelCase per User type
        assigned_classes: user.assignedClasses,
        assigned_subjects: user.assignedSubjects
    };
    const { data, error } = await supabase.from('users').insert([dbUser]).select();
    if (error) throw error;
    return data[0].id;
};

export const registerSchoolAdmin = async (user: Omit<User, 'id' | 'role' | 'isApproved'>): Promise<string> => {
    const dbUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role: 'admin',
        is_approved: true, // School admins are auto-approved
        school_name: user.schoolName,
        plan: 'standard'
    };
    const { data, error } = await supabase.from('users').insert([dbUser]).select();
    if (error) throw error;

    // Set the new admin's schoolId to their own ID to establish the tenancy root
    const newAdminId = data[0].id;
    const { error: updateError } = await supabase.from('users').update({ school_id: newAdminId }).eq('id', newAdminId);
    if (updateError) {
        console.error("Failed to set school_id for new admin:", updateError);
        // This is a critical step, might want to handle this more gracefully
        throw updateError;
    }

    return newAdminId;
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
        assignedClasses: data.assigned_classes,
        assignedSubjects: data.assigned_subjects,
        isApproved: data.is_approved,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        expertise: data.expertise,
        reasonForJoining: data.reason_for_joining,
        subscription_expiry: data.subscription_expiry,
        phone_number: data.phone_number,
        schoolName: data.school_name,
        schoolId: data.school_id,
        plan: data.plan || 'standard'
    };
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.password) dbUpdates.password = updates.password;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.classLevel) dbUpdates.class_level = updates.classLevel;
    if (updates.assignedClasses) dbUpdates.assigned_classes = updates.assignedClasses;
    if (updates.assignedSubjects) dbUpdates.assigned_subjects = updates.assignedSubjects;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.phone_number !== undefined) dbUpdates.phone_number = updates.phone_number;
    if (updates.subscription_expiry !== undefined) dbUpdates.subscription_expiry = updates.subscription_expiry;
    if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
    
    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) throw error;
};

export const addUser = async (user: Omit<User, 'id' | 'isApproved'>): Promise<User> => {
    const dbUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        class_level: user.classLevel,
        assigned_classes: user.assignedClasses,
        assigned_subjects: user.assignedSubjects,
        is_approved: true,
        plan: user.plan || 'standard',
        // Changed from 30 days to 2 days only
        subscription_expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    };
    const { data, error } = await supabase.from('users').insert([dbUser]).select();
    if (error) throw error;
    const u = data[0];
    return {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        classLevel: u.class_level,
        isApproved: u.is_approved,
        subscription_expiry: u.subscription_expiry
    };
};

export const removeUser = async (id: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
};

export const approveUser = async (id: string): Promise<void> => {
    const { error } = await supabase.from('users').update({ is_approved: true }).eq('id', id);
    if (error) throw error;
};

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
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
        assignedClasses: data.assigned_classes,
        assignedSubjects: data.assigned_subjects,
        isApproved: data.is_approved,
        subscription_expiry: data.subscription_expiry,
        avatarUrl: data.avatar_url,
        schoolId: data.school_id,
        schoolName: data.school_name,
    };
};

export const getPendingUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').eq('is_approved', false);
    if (error) throw error;
    return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        classLevel: u.class_level,
        isApproved: u.is_approved,
        expertise: u.expertise,
        bio: u.bio,
        reasonForJoining: u.reason_for_joining
    }));
};

export const getPendingStudents = getPendingUsers;

// --- SCHOOL MANAGEMENT ---

export const getSchoolClasses = async (): Promise<SchoolClass[]> => {
    // This function will return an empty array as there is no backend table for school classes yet.
    // To add classes, a `school_classes` table would need to be created in Supabase
    // and this function updated to fetch from it.
    return [];
};

// --- CHAT MANAGEMENT ---
export const getMessages = async (classLevel: string): Promise<ChatMessage[]> => {
    const key = `class_messages_${classLevel}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

export const sendMessage = async (classLevel: string, message: Omit<ChatMessage, 'id'>): Promise<void> => {
    const key = `class_messages_${classLevel}`;
    const messages = await getMessages(classLevel);
    messages.push({ ...message, id: `msg-${Date.now()}` });
    localStorage.setItem(key, JSON.stringify(messages));
};

// --- DRAFTS MANAGEMENT ---

const getLocalDrafts = (userId: string): Draft[] => {
    const stored = localStorage.getItem(`local_drafts_${userId}`);
    return stored ? JSON.parse(stored) : [];
};

const setLocalDrafts = (userId: string, drafts: Draft[]) => {
    localStorage.setItem(`local_drafts_${userId}`, JSON.stringify(drafts));
};

export const getDrafts = async (userId: string): Promise<Draft[]> => {
    try {
        const { data, error } = await supabase
            .from('drafts')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        
        if (error) {
            if (error.code === 'PGRST205') return getLocalDrafts(userId);
            throw error;
        }
        
        return data.map((d: any) => ({
            id: d.id,
            user_id: d.user_id,
            subject: d.subject,
            title: d.title,
            content: d.content,
            classLevel: d.class_level,
            updated_at: d.updated_at
        }));
    } catch (e) {
        return getLocalDrafts(userId);
    }
};

export const saveDraft = async (draft: Omit<Draft, 'id' | 'updated_at'>, existingId?: string): Promise<string> => {
    const payload = {
        user_id: draft.user_id,
        subject: draft.subject,
        title: draft.title,
        content: draft.content,
        class_level: draft.classLevel,
        updated_at: new Date().toISOString()
    };

    try {
        if (existingId && !existingId.startsWith('local-')) {
            const { error } = await supabase.from('drafts').update(payload).eq('id', existingId);
            if (error) {
                if (error.code === 'PGRST205') throw new Error('Local fallback');
                throw error;
            }
            return existingId;
        } else {
            const { data, error } = await supabase.from('drafts').insert([payload]).select();
            if (error) {
                if (error.code === 'PGRST205') throw new Error('Local fallback');
                throw error;
            }
            return data[0].id;
        }
    } catch (e) {
        const userId = draft.user_id;
        const localId = existingId || `local-${Date.now()}`;
        const drafts = getLocalDrafts(userId);
        const updatedDraft = { ...draft, id: localId, updated_at: new Date().toISOString() };
        
        const index = drafts.findIndex(d => d.id === localId);
        if (index > -1) drafts[index] = updatedDraft;
        else drafts.push(updatedDraft);

        setLocalDrafts(userId, drafts);
        return localId;
    }
};

export const deleteDraft = async (id: string): Promise<void> => {
    if (id.startsWith('local-')) return; 
    try {
        const { error } = await supabase.from('drafts').delete().eq('id', id);
        if (error && error.code !== 'PGRST205') throw error;
    } catch (e) {}
};

// --- ADMIN PROFILE ---

export const getAdminProfile = (): any => {
  const stored = localStorage.getItem('adminProfile');
  return stored ? JSON.parse(stored) : { 
      name: 'Teacher Sylvia', 
      username: ADMIN_USERNAME, 
      email: ADMIN_EMAIL, 
      password: ADMIN_PASSWORD 
  };
};

export const updateAdminProfile = (profile: any): void => localStorage.setItem('adminProfile', JSON.stringify(profile));

// --- PAYMENT LOGIC ---

export const getWalletBalance = async (): Promise<number> => {
    try {
        const response = await fetch(`${JULYPAY_URL}/wallet/balance`, {
            headers: {
                'Authorization': `Bearer ${JULYPAY_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.success) {
            return result.data.balance;
        }
        return 0;
    } catch (e) {
        return 0;
    }
};

export const collectPayment = async (userId: string, phone: string, name: string, amount: number) => {
    const response = await fetch(`${JULYPAY_URL}/wallet/collect-payment`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${JULYPAY_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customer_phone: phone,
            amount: amount,
            description: `Monthly Subscription for ${name}`,
            customer_name: name
        })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Payment initiation failed');

    await supabase.from('payments').insert([{
        user_id: userId,
        transaction_id: result.data.transaction_id,
        amount: amount,
        status: 'processing',
        date: new Date().toISOString()
    }]);

    return result.data.transaction_id;
};

export const checkPaymentStatus = async (transactionId: string) => {
    const response = await fetch(`${JULYPAY_URL}/wallet/collections/${transactionId}/status`, {
        headers: { 'Authorization': `Bearer ${JULYPAY_KEY}` }
    });
    const result = await response.json();
    
    if (result.status === 'completed') {
        const { data: pData } = await supabase.from('payments').select('user_id').eq('transaction_id', transactionId).single();
        if (pData) {
            const { data: userData } = await supabase.from('users').select('subscription_expiry').eq('id', pData.user_id).single();
            if (userData) {
                const currentExpiry = new Date(userData.subscription_expiry || Date.now());
                const newExpiry = new Date(Math.max(Date.now(), currentExpiry.getTime()) + 30 * 24 * 60 * 60 * 1000);
                await supabase.from('users').update({ subscription_expiry: newExpiry.toISOString() }).eq('id', pData.user_id);
                await supabase.from('payments').update({ status: 'completed' }).eq('transaction_id', transactionId);
            }
        }
    } else if (result.status === 'failed') {
        await supabase.from('payments').update({ status: 'failed' }).eq('transaction_id', transactionId);
    }
    return result;
};

export const getAllPayments = async (): Promise<Payment[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*, users(name)')
        .order('date', { ascending: false });
    if (error) throw error;
    return data.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        user_name: p.users?.name,
        transaction_id: p.transaction_id,
        amount: p.amount,
        status: p.status,
        date: p.date
    }));
};

export const deletePayment = async (id: string): Promise<void> => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
};

// --- CONTENT MANAGEMENT ---

export const getNotes = async (authorId?: string): Promise<Note[]> => {
    let query = supabase.from('notes').select('*');
    if (authorId) {
        query = query.eq('author_id', authorId);
    }
    const { data, error } = await query;

    if (error) throw error;
    return data.map((n: any) => ({ 
        id: n.id, 
        subject: n.subject, 
        title: (n.title || '').replace('[ARCHIVED] ', ''), 
        content: n.content, 
        uploadDate: n.upload_date, 
        classLevel: n.class_level, 
        isArchived: !!(n.is_archived || (n.title && n.title.startsWith('[ARCHIVED] '))),
        authorId: n.author_id,
    }));
};

export const getNoteById = async (id: string): Promise<Note | undefined> => {
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return { 
        id: data.id, 
        subject: data.subject, 
        title: (data.title || '').replace('[ARCHIVED] ', ''), 
        content: data.content, 
        uploadDate: data.upload_date, 
        classLevel: data.class_level, 
        isArchived: !!(data.is_archived || (data.title && data.title.startsWith('[ARCHIVED] '))),
        authorId: data.author_id,
    };
};

export const addNote = async (note: Omit<Note, 'id'>, authorId: string): Promise<void> => {
    await supabase.from('notes').insert([{ 
        subject: note.subject, 
        title: note.title, 
        content: note.content, 
        upload_date: note.uploadDate, 
        class_level: note.classLevel,
        author_id: authorId,
    }]);
};

export const updateNote = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
    const updates: any = {};
    if (updatedNote.subject) updates.subject = updatedNote.subject;
    if (updatedNote.title) updates.title = updatedNote.title;
    if (updatedNote.content) updates.content = updatedNote.content;
    if (updatedNote.classLevel) updates.class_level = updatedNote.classLevel;
    if (updatedNote.isArchived !== undefined) updates.is_archived = updatedNote.isArchived;

    const { error } = await supabase.from('notes').update(updates).eq('id', id);
    if (error) throw error;
};

export const deleteNote = async (id: string): Promise<void> => {
    await supabase.from('notes').delete().eq('id', id);
};

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
};

export const uploadNoteImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `note-img-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('note_images').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('note_images').getPublicUrl(fileName);
    return data.publicUrl;
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error) throw error;
    return data.map((a: any) => ({ id: a.id, message: a.message, sender: a.sender, date: a.date, classLevel: a.class_level }));
};

export const addAnnouncement = async (ann: Omit<Announcement, 'id'>): Promise<void> => {
    await supabase.from('announcements').insert([{ message: ann.message, sender: ann.sender, date: ann.date, class_level: ann.classLevel }]);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
    await supabase.from('announcements').delete().eq('id', id);
};

export const updateAnnouncement = async (id: string, message: string): Promise<void> => {
    await supabase.from('announcements').update({ message }).eq('id', id);
};

export const getQuestions = async (): Promise<Question[]> => {
    const { data, error } = await supabase.from('questions').select('*');
    if (error) throw error;
    return data.map((q: any) => ({ id: q.id, studentId: q.student_id, studentName: q.student_name, questionText: q.question_text, answerText: q.answer_text, questionDate: q.question_date, answerDate: q.answer_date, isAnswered: q.is_answered }));
};

export const getQuestionsByStudent = async (studentId: string): Promise<Question[]> => {
    const { data, error } = await supabase.from('questions').select('*').eq('student_id', studentId);
    if (error) throw error;
    return data.map((q: any) => ({ id: q.id, studentId: q.student_id, studentName: q.student_name, questionText: q.question_text, answerText: q.answer_text, questionDate: q.question_date, answerDate: q.answer_date, isAnswered: q.is_answered }));
};

export const addQuestion = async (question: Omit<Question, 'id'>): Promise<void> => {
    await supabase.from('questions').insert([{ student_id: question.studentId, student_name: question.studentName, question_text: question.questionText, question_date: question.questionDate, is_answered: false }]);
};

export const answerQuestion = async (id: string, answerText: string): Promise<void> => {
    await supabase.from('questions').update({ is_answered: true, answer_text: answerText, answer_date: new Date().toISOString() }).eq('id', id);
};

export const getAssignments = async (authorId?: string): Promise<Assignment[]> => {
    let query = supabase.from('assignments').select('*');
    if (authorId) {
        query = query.eq('author_id', authorId);
    }
    const { data, error } = await query;

    if (error) throw error;
    return data.map((a: any) => ({ 
        id: a.id, 
        subject: a.subject, 
        content: a.content, 
        dueDate: a.due_date, 
        postedDate: a.posted_date, 
        classLevel: a.class_level, 
        isArchived: !!(a.is_archived || (a.content && a.content.startsWith('[ARCHIVED] '))),
        authorId: a.author_id,
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
        classLevel: data.class_level, 
// FIX: Replaced undefined variable 'a' with 'data'
        isArchived: !!(data.is_archived || (data.content && data.content.startsWith('[ARCHIVED] '))),
        authorId: data.author_id,
    };
};

export const addAssignment = async (assignment: Omit<Assignment, 'id'|'authorId'>, authorId: string): Promise<void> => {
    await supabase.from('assignments').insert([{ 
        subject: assignment.subject, 
        content: assignment.content, 
        due_date: assignment.dueDate, 
        posted_date: assignment.postedDate, 
        class_level: assignment.classLevel,
        author_id: authorId
    }]);
};

export const updateAssignment = async (id: string, updated: Partial<Assignment>): Promise<void> => {
    const updates: any = {};
    if (updated.subject) updates.subject = updated.subject;
    if (updated.content) updates.content = updated.content;
    if (updated.dueDate) updates.due_date = updated.dueDate;
    if (updated.classLevel) updates.class_level = updated.classLevel;
    if (updated.isArchived !== undefined) updates.is_archived = updated.isArchived;
    const { error } = await supabase.from('assignments').update(updates).eq('id', id);
    if (error) throw error;
};

export const deleteAssignment = async (id: string): Promise<void> => {
    await supabase.from('assignments').delete().eq('id', id);
};

export const getFeedback = async (): Promise<Feedback[]> => {
    const { data, error } = await supabase.from('feedback').select('*');
    if (error) throw error;
    return data.map((f: any) => ({ id: f.id, studentId: f.student_id, studentName: f.student_name, type: f.type, subject: f.subject, message: f.message, date: f.date }));
};

export const addFeedback = async (feedback: Omit<Feedback, 'id'>): Promise<void> => {
    await supabase.from('feedback').insert([{ student_id: feedback.studentId, student_name: feedback.studentName, type: feedback.type, subject: feedback.subject, message: feedback.message, date: feedback.date }]);
};

export const deleteFeedback = async (id: string): Promise<void> => {
    // Fix: Capture error from supabase delete call
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw error;
};

export const updateUserPlan = async (userId: string, plan: 'standard' | 'developer'): Promise<void> => {
    await updateUser(userId, { plan });
};

export const isSubscriptionActive = async (user: User | null): Promise<boolean> => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'teacher') return true;
    if (user.plan === 'developer') return true;
    
    const settings = await getSystemSettings();
    if (!settings.subscriptionsEnabled) return true;
    
    if (!user.subscription_expiry) return false;
    return new Date(user.subscription_expiry) > new Date();
};

export const getSystemSettings = async (): Promise<any> => {
    const { data } = await supabase.from('system_settings').select('*');
    const settings: any = {};
    data?.forEach((row: any) => settings[row.key] = row.value);
    return { 
        maintenanceMode: settings.maintenance_mode === 'true', 
        maintenanceEndTime: settings.maintenance_end_time || '',
        studentFee: parseInt(settings.student_fee) || 10000,
        teacherFee: parseInt(settings.teacher_fee) || 50000,
        schoolFee: parseInt(settings.school_fee) || 300000,
        standardPlanPrice: parseInt(settings.standard_plan_price) || 10000,
        developerPlanPrice: parseInt(settings.developer_plan_price) || 25000,
        subscriptionsEnabled: settings.subscriptions_enabled !== 'false' // Default to true
    };
};

export const updateSystemSetting = async (key: string, value: string): Promise<void> => {
    await supabase.from('system_settings').upsert({ key, value });
};

export const getJobs = async (): Promise<Job[]> => {
    const stored = localStorage.getItem('classNestJobs');
    return stored ? JSON.parse(stored) : [{ id: 'job-1', title: 'Teaching', description: 'Passionate educators wanted.', requirements: 'Qualified Teacher status.', postedDate: new Date().toISOString() }];
};

export const addJob = async (job: Omit<Job, 'id'>): Promise<void> => {
    const jobs = await getJobs();
    jobs.push({ ...job, id: `job-${Date.now()}` });
    localStorage.setItem('classNestJobs', JSON.stringify(jobs));
};

export const deleteJob = async (id: string): Promise<void> => {
    const jobs = await getJobs();
    localStorage.setItem('classNestJobs', JSON.stringify(jobs.filter(j => j.id !== id)));
};

export const updateJob = async (id: string, updatedJob: Partial<Job>): Promise<void> => {
    const jobs = await getJobs();
    const idx = jobs.findIndex(j => j.id === id);
    if (idx !== -1) { 
        jobs[idx] = { ...jobs[idx], ...updatedJob }; 
        localStorage.setItem('classNestJobs', JSON.stringify(jobs)); 
    }
};