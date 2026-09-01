import { supabase } from "./lib/supabase.js";

const progressKey = "liblearn-student-progress";

function readProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem(progressKey) || "{}");
    return progress && typeof progress === "object" && !Array.isArray(progress) ? progress : {};
  } catch {
    return {};
  }
}

function getLocalStudentProgress(courseId, studentId) {
  const id = studentId || null;
  const progress = id ? readProgress()[id]?.[courseId] : null;
  const completedLessons = Array.isArray(progress?.completedLessons) ? progress.completedLessons : [];
  return { completedLessons: [...new Set(completedLessons)].sort((a, b) => a - b) };
}

export async function getStudentProgress(courseId = "biology", studentId) {
  if (supabase && studentId) {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", studentId)
      .eq("course_id", courseId)
      .eq("completed", true);
    if (!error) return { completedLessons: data.map((row) => row.lesson_id).sort((a, b) => a - b), source: "remote" };
    console.error("Could not load lesson progress from Supabase.", error);
    return { completedLessons: [], source: "error", error: "Progress could not be loaded from Supabase." };
  }
  return { ...getLocalStudentProgress(courseId, studentId), source: "local" };
}

function saveLocalLessonProgress(courseId, lessonNumber, studentId) {
  const id = studentId || null;
  if (!id) return null;

  const progress = readProgress();
  const studentProgress = progress[id] || {};
  const courseProgress = getLocalStudentProgress(courseId, id);
  const completedLessons = [...new Set([...courseProgress.completedLessons, lessonNumber])].sort((a, b) => a - b);

  const updatedProgress = {
    ...progress,
    [id]: {
      ...studentProgress,
      [courseId]: { completedLessons },
    },
  };
  localStorage.setItem(progressKey, JSON.stringify(updatedProgress));
  return { completedLessons };
}

export async function markLessonComplete(courseId, lessonNumber, studentId) {
  if (!studentId) return { ok: false, persisted: false, error: "You must be signed in before completing a lesson." };
  if (supabase) {
    const completedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("lesson_progress")
      .upsert({ user_id: studentId, course_id: courseId, lesson_id: lessonNumber, completed: true, completed_at: completedAt, updated_at: completedAt }, { onConflict: "user_id,course_id,lesson_id" })
      .select("lesson_id")
      .single();
    if (error || !data) {
      console.error("Could not save lesson progress to Supabase.", error);
      return { ok: false, persisted: false, error: "Lesson progress could not be saved. Please try again." };
    }
    let progress;
    try {
      progress = await getStudentProgress(courseId, studentId);
    } catch (confirmationError) {
      console.error("Lesson progress was saved, but confirmation could not be loaded.", confirmationError);
      return { ok: true, persisted: true, completedLessons: [lessonNumber], warning: "Lesson saved, but confirmation could not be retrieved. It should appear after your next refresh." };
    }
    if (progress.source === "error") {
      return { ok: true, persisted: true, completedLessons: [lessonNumber], warning: "Lesson saved, but confirmation could not be retrieved. It should appear after your next refresh." };
    }
    return { ok: true, persisted: true, completedLessons: progress.completedLessons };
  }
  const localProgress = saveLocalLessonProgress(courseId, lessonNumber, studentId);
  return localProgress
    ? { ok: true, persisted: false, offline: true, completedLessons: localProgress.completedLessons }
    : { ok: false, persisted: false, error: "Lesson progress could not be saved." };
}

export async function isLessonComplete(courseId, lessonNumber, studentId) {
  const progress = await getStudentProgress(courseId, studentId);
  return progress.completedLessons.includes(lessonNumber);
}

export async function getCourseProgress(courseId = "biology", totalLessons, studentId) {
  const progress = await getStudentProgress(courseId, studentId);
  const completedLessons = progress.completedLessons;
  const percentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  return { ...progress, completedCount: completedLessons.length, totalLessons, percentage };
}

export async function getNextIncompleteLesson(courseId = "biology", totalLessons, studentId) {
  const completedLessons = (await getStudentProgress(courseId, studentId)).completedLessons;
  for (let lessonNumber = 1; lessonNumber <= totalLessons; lessonNumber += 1) {
    if (!completedLessons.includes(lessonNumber)) return lessonNumber;
  }
  return null;
}

export async function isCourseComplete(courseId = "biology", totalLessons, studentId) {
  return (await getCourseProgress(courseId, totalLessons, studentId)).completedCount >= totalLessons;
}

export { progressKey };
