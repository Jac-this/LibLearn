import { biologyCourse } from "./biologyLessons.js";
import { createCourse } from "./learningSchema.js";

const mathematicsLessons = [
  "Understanding Numbers","Basic Arithmetic","Fractions and Decimals","Ratios and Proportions",
  "Algebraic Expressions","Linear Equations","Inequalities","Exponents and Powers","Geometry",
  "Measurement","Graphs and Functions","Statistics","Probability","Problem Solving","Mathematics Revision"
].map((title, index) => ({ id: `mathematics-${index + 1}`, number: index + 1, title, status: "planned", content: [] }));

const digitalLiteracyLessons = [
  "Introduction to Digital Literacy","Using a Computer","Files and Folders","Internet and Web Browsing",
  "Email and Communication","Documents and Word Processing","Spreadsheets and Data","Online Safety and Privacy",
  "Using AI Tools","Digital Skills Final Review"
].map((title, index) => ({ id: `digital-literacy-${index + 1}`, number: index + 1, title, status: "planned", content: [] }));

const courseRegistry = {
  [biologyCourse.id]: createCourse({
    ...biologyCourse,
    level: "High School",
    difficulty: "Beginner",
    duration: "5 weeks",
    status: "published",
  }),
  mathematics: createCourse({
    id: "mathematics",
    title: "Mathematics",
    category: "Mathematics",
    level: "High School",
    difficulty: "Beginner",
    duration: "6 weeks",
    icon: "∑",
    description: "Build a strong foundation in numbers, algebra, geometry, statistics, and everyday problem solving.",
    lessons: mathematicsLessons,
    status: "planned",
  }),
  "digital-literacy": createCourse({
    id: "digital-literacy",
    title: "Digital Literacy",
    category: "Technology",
    level: "High School",
    difficulty: "Beginner",
    duration: "4 weeks",
    icon: "💻",
    description: "Learn the essential digital skills you need to study, work, communicate, and navigate the modern world.",
    lessons: digitalLiteracyLessons,
    status: "planned",
  }),
};

export const getCourse = (courseId) => courseRegistry[courseId] || null;

export const getLesson = (courseId, lessonNumber) => {
  const course = getCourse(courseId);
  return course?.lessons?.[Number(lessonNumber) - 1] || null;
};

export const getLessonCount = (course) => course?.lessons?.length || 0;

export const getPublishedCourses = () =>
  Object.values(courseRegistry).filter((course) => course.status === "published");

export default courseRegistry;
