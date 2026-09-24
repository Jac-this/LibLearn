// Shared data contract for LibLearn courses, lessons, learning sections, activities, and assessments.
// This module defines shape and safe defaults without changing the visual learning experience.

export const createLearningSection = ({
  id,
  title = "",
  type = "concept",
  content = [],
  activities = [],
  assessment = null,
  ...metadata
} = {}) => ({
  id: id || null,
  title,
  type,
  content: Array.isArray(content) ? content : [],
  activities: Array.isArray(activities) ? activities : [],
  assessment: assessment || null,
  ...metadata,
});

export const createLesson = ({
  id,
  courseId,
  number,
  title = "",
  description = "",
  content = [],
  activities = [],
  assessment = null,
  status = "planned",
  ...metadata
} = {}) => ({
  id: id || null,
  courseId: courseId || null,
  number: Number(number) || 0,
  title,
  description,
  content: Array.isArray(content) ? content.map(createLearningSection) : [],
  activities: Array.isArray(activities) ? activities : [],
  assessment: assessment || null,
  status,
  ...metadata,
});

export const createCourse = ({
  id,
  title = "",
  description = "",
  category = "",
  level = "",
  difficulty = "",
  duration = "",
  icon = "",
  lessons = [],
  status = "planned",
  ...metadata
} = {}) => ({
  id: id || null,
  title,
  description,
  category,
  level,
  difficulty,
  duration,
  icon,
  lessons: Array.isArray(lessons)
    ? lessons.map((lesson, index) =>
        createLesson({
          ...lesson,
          courseId: lesson?.courseId || id,
          number: lesson?.number || index + 1,
        }),
      )
    : [],
  status,
  ...metadata,
});

export const isLessonReady = (lesson) =>
  Boolean(
    lesson?.id &&
    lesson?.title &&
    Array.isArray(lesson?.content) &&
    lesson.content.length > 0,
  );

export const isCourseReady = (course) =>
  Boolean(
    course?.id &&
    course?.title &&
    Array.isArray(course?.lessons) &&
    course.lessons.length > 0,
  );
