import { hasSupabaseConfig, supabase } from "./lib/supabase.js";

const legacyAccountsKey = "liblearn-accounts";
export const minimumPasswordLength = 6;
export const roles = {
  highSchoolStudent: "high_school_student",
  universityStudent: "university_student",
  teacher: "teacher",
};

export function validatePassword(password) {
  if (password.length < minimumPasswordLength) {
    return `Password must be at least ${minimumPasswordLength} characters.`;
  }
  return "";
}

function unavailable() {
  return { ok: false, error: "Supabase is not configured. Add VITE_SUPABASE_PUBLISHABLE_KEY to .env.local." };
}

export async function createAccount({ fullName, email, password, role, institution, faculty, department, teachingLevel, classGrade, subjects, universityYear, courseProgram }) {
  if (!hasSupabaseConfig) return unavailable();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        role,
        institution: institution?.trim() || "",
        faculty: faculty?.trim() || "",
        department: department?.trim() || "",
        teaching_level: teachingLevel?.trim() || "",
        class_grade: classGrade?.trim() || "",
        education_level: role === roles.highSchoolStudent ? "High School" : role === roles.universityStudent ? "University" : "Other",
        subjects: subjects?.trim() || "",
        university_year: universityYear?.trim() || "",
        course_program: courseProgram?.trim() || "",
      },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: data.user, session: data.session };
}

export async function signIn(email, password) {
  if (!hasSupabaseConfig) return unavailable();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { ok: false, unverified: true, error: "Please verify your email before signing in." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, user: data.user, session: data.session };
}

export async function resendVerification(email) {
  if (!hasSupabaseConfig) return unavailable();
  const { error } = await supabase.auth.resend({ type: "signup", email: email.trim().toLowerCase() });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function sendPasswordReset(email) {
  if (!hasSupabaseConfig) return unavailable();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function updatePassword(password) {
  if (!hasSupabaseConfig) return unavailable();
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function getSession() {
  if (!hasSupabaseConfig) return null;
  const { data } = await supabase.auth.getSession();
  return mapSession(data.session);
}

export function mapSession(session) {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email || "",
    fullName: session.user.user_metadata?.full_name || session.user.email || "Student",
  };
}

export async function getUser() {
  if (!hasSupabaseConfig) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signOut() {
  if (!hasSupabaseConfig) return unavailable();
  const { error } = await supabase.auth.signOut();
  return error ? { ok: false, error: error.message } : { ok: true };
}

export function getLegacyAccountByEmail(email) {
  try {
    const accounts = JSON.parse(localStorage.getItem(legacyAccountsKey) || "[]");
    return accounts.find((account) => account.email === email.trim().toLowerCase()) || null;
  } catch {
    return null;
  }
}
