import { useMemo } from "react";
import { getCourse } from "./data/courses.js";
import { getModule, getTopic } from "./data/learningSchema.js";
import LessonPage from "./LessonPage.jsx";

function Lesson() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course") || "biology";
  const moduleNumber = Math.max(1, Number(params.get("module") || params.get("lesson")) || 1);
  const topicNumber = Math.max(1, Number(params.get("topic")) || 1);

  const course = getCourse(courseId);
  const module = getModule(course, moduleNumber);
  const topic = getTopic(module, topicNumber);

  const totalTopics = module?.topics?.length || 0;
  const currentTopicIndex = Math.min(Math.max(topicNumber - 1, 0), Math.max(totalTopics - 1, 0));
  const currentProgress = totalTopics
    ? Math.round((currentTopicIndex / totalTopics) * 100)
    : 0;

  const topicList = useMemo(
    () => module?.topics || [],
    [module],
  );

  if (!course || !module || !topic) {
    return (
      <main className="liblearn-course-player" style={{ padding: "48px" }}>
        <h1>This learning topic is not available yet.</h1>
        <p>The course structure exists, but this topic has not been published.</p>
        <a href="/courses">Return to courses →</a>
      </main>
    );
  }

  const goToTopic = (index) => {
    if (index > currentTopicIndex) return;
    window.location.href = `/lesson?course=${encodeURIComponent(courseId)}&module=${moduleNumber}&topic=${index + 1}`;
  };

  const goNext = ({ currentTopicIndex: nextIndex }) => {
    if (nextIndex < totalTopics) {
      window.location.href = `/lesson?course=${encodeURIComponent(courseId)}&module=${moduleNumber}&topic=${nextIndex + 1}`;
      return;
    }

    const nextModule = getModule(course, moduleNumber + 1);
    if (nextModule) {
      window.location.href = `/lesson?course=${encodeURIComponent(courseId)}&module=${moduleNumber + 1}&topic=1`;
      return;
    }

    window.location.href = `/course?course=${encodeURIComponent(courseId)}`;
  };

  return (
    <LessonPage
      courseTitle={course.title}
      moduleTitle={module.title}
      moduleNumber={module.number}
      topic={topic}
      topicTitle={topic.title}
      learningOutcomes={topic.learningOutcomes || []}
      type={topic.type}
      topics={topicList}
      currentTopicIndex={currentTopicIndex}
      currentProgress={currentProgress}
      totalTopics={totalTopics}
      totalLearners={course.totalLearners || 0}
      xp={course.xp || 0}
      onTopicSelect={goToTopic}
      onNext={goNext}
    />
  );
}

export default Lesson;
