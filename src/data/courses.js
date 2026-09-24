import { biologyCourse, getBiologyLesson } from "./biologyLessons.js";

const courseRegistry = {
  [biologyCourse.id]: {
    ...biologyCourse,
    getLesson: getBiologyLesson,
    status: "published",
  },
};

export const getCourse = (courseId) => courseRegistry[courseId] || null;

export const getLessonCount = (course) => course?.lessons?.length || 0;

export const getPublishedCourses = () =>
  Object.values(courseRegistry).filter((course) => course.status === "published");

export default courseRegistry;
