// Shared data contract for LibLearn courses, modules, topics, learning sections, activities, and assessments.
// Curriculum content remains data-driven so the same learning player can serve different subjects.

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

export const createTopic = ({
  id,
  title = "",
  type = "lesson",
  description = "",
  content = [],
  activities = [],
  assessment = null,
  status = "planned",
  ...metadata
} = {}) => ({
  id: id || null,
  title,
  type,
  description,
  content: Array.isArray(content) ? content.map(createLearningSection) : [],
  activities: Array.isArray(activities) ? activities : [],
  assessment: assessment || null,
  status,
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

const createLearningOutcomes = (lesson) => [
  `Explain the central ideas involved in ${lesson.focus || lesson.title}.`,
  `Define and use key terms related to ${lesson.title}.`,
  `Describe how the main structures, processes, or relationships in this module work.`,
  `Connect ${lesson.title} to an example from everyday life, school, agriculture, health, or the environment.`,
  `Use biological evidence and reasoning to explain an observation related to ${lesson.title}.`,
  `Apply the ideas in this module to a new biological situation or problem.`,
  `Evaluate a biological claim or explanation using the concepts and evidence introduced in this module.`,
];

export const createModuleFromLesson = (lesson, courseId, moduleNumber) => {
  const topics = [
    createTopic({
      id: `${lesson.id || `module-${moduleNumber}`}-outcomes`,
      title: "Learning Outcomes",
      type: "learning-outcomes",
      description: `What you should be able to understand and do after completing ${lesson.title}.`,
      learningOutcomes: createLearningOutcomes(lesson),
      status: lesson.status || "published",
    }),
    ...(Array.isArray(lesson.content)
      ? lesson.content.map((section, index) =>
          createTopic({
            ...section,
            id: section.id || `${lesson.id || `module-${moduleNumber}`}-topic-${index + 2}`,
            type: section.type || "lesson",
            status: lesson.status || "published",
          }),
        )
      : []),
  ];

  return {
    id: lesson.id || `module-${moduleNumber}`,
    number: moduleNumber,
    title: lesson.title,
    description: lesson.description || lesson.focus || "",
    focus: lesson.focus || "",
    topics,
    status: lesson.status || "planned",
    metadata: {
      localContext: lesson.local || "",
      keyTerms: lesson.terms || "",
      scientificContext: lesson.scientists || "",
      learningProcess: lesson.process || "",
    },
  };
};

export const createCourse = ({
  id,
  title = "",
  description = "",
  category = "",
  level = "",
  difficulty = "",
  duration = "",
  lessons = [],
  modules = [],
  status = "planned",
  icon = "",
  ...metadata
} = {}) => {
  const normalizedLessons = Array.isArray(lessons)
    ? lessons.map((lesson, index) =>
        createLesson({
          ...lesson,
          courseId: lesson?.courseId || id,
          number: lesson?.number || index + 1,
        }),
      )
    : [];

  const normalizedModules = Array.isArray(modules) && modules.length
    ? modules
    : normalizedLessons.map((lesson, index) =>
        createModuleFromLesson(lesson, id, index + 1),
      );

  return {
    id: id || null,
    title,
    description,
    category,
    level,
    difficulty,
    duration,
    icon,
    lessons: normalizedLessons,
    modules: normalizedModules,
    status,
    ...metadata,
  };
};

export const getModule = (course, moduleNumber) =>
  course?.modules?.[Math.max(0, Number(moduleNumber) - 1)] || null;

export const getTopic = (module, topicNumber) =>
  module?.topics?.[Math.max(0, Number(topicNumber) - 1)] || null;

export const isTopicReady = (topic) =>
  Boolean(topic?.id && topic?.title && topic?.type);

export const isModuleReady = (module) =>
  Boolean(module?.id && module?.title && Array.isArray(module?.topics) && module.topics.length > 0);

export const isLessonReady = (lesson) =>
  Boolean(lesson?.id && lesson?.title && Array.isArray(lesson?.content) && lesson.content.length > 0);

export const isCourseReady = (course) =>
  Boolean(course?.id && course?.title && Array.isArray(course?.modules) && course.modules.length > 0);

export { createLearningOutcomes };
