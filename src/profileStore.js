import { supabase } from "./lib/supabase.js";

const profilesKey = "liblearn-student-profiles";

const emptyProfile = {
  fullName: "",
  studentId: "",
  username: "",
  profilePicture: "",
  educationLevel: "",
  classGrade: "",
  universityYear: "",
  courseProgram: "",
  role: null,
  institution: "",
  faculty: "",
  department: "",
  teachingLevel: "",
  subjects: "",
};

function readProfiles() {
  try {
    const profiles = JSON.parse(localStorage.getItem(profilesKey) || "{}");
    return profiles && typeof profiles === "object" && !Array.isArray(profiles) ? profiles : {};
  } catch {
    return {};
  }
}

export async function getProfile(studentId) {
  if (!studentId) return { ...emptyProfile };
  if (supabase) {
    const { data } = await supabase.from("profiles").select("*").eq("id", studentId).maybeSingle();
    if (data) return { ...emptyProfile, ...mapRow(data) };
  }
  return { ...emptyProfile, ...readProfiles()[studentId] };
}

export async function saveProfile(profile, studentId) {
  if (!studentId) return null;
  const updatedProfile = { ...emptyProfile, ...profile };
  if (supabase) {
    const { data, error } = await supabase.from("profiles").upsert({ ...mapProfile(updatedProfile), id: studentId, updated_at: new Date().toISOString() }).select().single();
    if (!error && data) return mapRow(data);
    if (error) return null;
  }
  const profiles = readProfiles();
  localStorage.setItem(profilesKey, JSON.stringify({ ...profiles, [studentId]: updatedProfile }));
  return updatedProfile;
}

function mapProfile(profile) {
  const { fullName, studentId, username, profilePicture, educationLevel, classGrade, subjects, universityYear, courseProgram } = profile;
  return { full_name: fullName, student_id: studentId, username, profile_picture: profilePicture, education_level: educationLevel, class_grade: classGrade, subjects, university_year: universityYear, course_program: courseProgram, institution: profile.institution, faculty: profile.faculty, department: profile.department, teaching_level: profile.teachingLevel };
}

function mapRow(row) {
  return { fullName: row.full_name, studentId: row.student_id, username: row.username, profilePicture: row.profile_picture, educationLevel: row.education_level, classGrade: row.class_grade, subjects: row.subjects, universityYear: row.university_year, courseProgram: row.course_program, role: row.role || null, institution: row.institution, faculty: row.faculty, department: row.department, teachingLevel: row.teaching_level };
}

export function getProfileCompletion(profile = emptyProfile) {
  const requiredFields = ["fullName", "username", "role"];
  if (profile.role === "high_school_student") requiredFields.push("studentId", "classGrade", "educationLevel");
  if (profile.role === "university_student") requiredFields.push("institution", "department", "universityYear");
  if (profile.role === "teacher") requiredFields.push("institution", "teachingLevel", "subjects");
  const completedFields = requiredFields.filter((field) => profile[field]?.trim()).length;
  return Math.round((completedFields / requiredFields.length) * 100);
}

export { profilesKey };
