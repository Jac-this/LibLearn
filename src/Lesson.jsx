import { useEffect, useMemo, useState } from "react";
import { getSession } from "./authStore.js";
import { getCourse, getLessonCount } from "./data/courses.js";
import { getCourseProgress, markLessonComplete } from "./progressStore.js";

function ThemeControl() {
  const [theme, setTheme] = useState(() => localStorage.getItem("liblearn-theme") || "system");

  useEffect(() => {
    const apply = () => {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.dataset.theme = theme === "system" ? (systemDark ? "dark" : "default") : theme;
    };
    apply();
    localStorage.setItem("liblearn-theme", theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener?.("change", apply);
    return () => media.removeEventListener?.("change", apply);
  }, [theme]);

  return (
    <div className="theme-control" aria-label="Theme">
      {["default", "dark", "system"].map((option) => (
        <button key={option} className={theme === option ? "active" : ""} onClick={() => setTheme(option)}>
          {option === "default" ? "Day" : option === "dark" ? "Night" : "System"}
        </button>
      ))}
    </div>
  );
}

function ContentBlock({ item, index }) {
  return (
    <div className="learning-block" key={item.heading || index}>
      <span className="learning-block-number">{String(index + 1).padStart(2, "0")}</span>
      <div>
        {item.heading && <h3>{item.heading}</h3>}
        <p>{item.text}</p>
      </div>
    </div>
  );
}

function LearningContent({ unit }) {
  const items = unit?.content || [];
  if (!items.length) return <p className="empty-content">This section is being prepared.</p>;
  const [lead, ...rest] = items;
  return (
    <div className="learning-flow">
      {lead?.text && <div className="learning-lead"><p>{lead.text}</p></div>}
      {rest.map((item, index) => <ContentBlock item={item} index={index} key={item.heading || index} />)}
      {unit.reviewQuestions?.length > 0 && (
        <aside className="reflection-panel">
          <span>THINK ABOUT IT</span>
          <h3>Before you move on, sit with these questions.</h3>
          <ol>{unit.reviewQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
        </aside>
      )}
      {unit.quiz?.length > 0 && (
        <aside className="check-panel">
          <span>KNOWLEDGE CHECK</span>
          <h3>What do you remember?</h3>
          <ol>{unit.quiz.map((question) => <li key={question}>{question}</li>)}</ol>
        </aside>
      )}
    </div>
  );
}

function Lesson() {
  const params = new URLSearchParams(window.location.search);
  const course = params.get("course") || "biology";
  const lessonNumber = Math.max(1, Number(params.get("lesson")) || 1);
  const courseData = getCourse(course);
  const lesson = courseData?.getLesson(lessonNumber) || null;
  const totalLessons = courseData ? getLessonCount(courseData) : 0;
  const learningContent = lesson?.content || [];

  const [currentUnit, setCurrentUnit] = useState(0);
  const [studentId, setStudentId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let active = true;
    getSession().then((session) => {
      if (!active) return;
      const id = session?.id || null;
      setStudentId(id);
      setSessionLoading(false);
      if (!id) {
        setProgressLoading(false);
        return;
      }
      getCourseProgress(course, totalLessons, id).then((progress) => {
        if (!active) return;
        if (progress.source === "error") setProgressError(progress.error);
        else setCompletedLessons(progress.completedLessons);
        setProgressLoading(false);
      }).catch(() => {
        if (!active) return;
        setProgressError("Progress could not be loaded. Please refresh and try again.");
        setProgressLoading(false);
      });
    }).catch(() => {
      if (!active) return;
      setSessionLoading(false);
      setProgressLoading(false);
      setProgressError("Your session could not be loaded. Please sign in again.");
    });
    return () => { active = false; };
  }, [course, totalLessons]);

  useEffect(() => setCurrentUnit(0), [lessonNumber, course]);

  const unit = learningContent[currentUnit] || null;
  const isCompleted = completedLessons.includes(lessonNumber);
  const lessonProgress = learningContent.length ? Math.round(((currentUnit + 1) / learningContent.length) * 100) : 0;
  const courseProgress = totalLessons ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const remaining = Math.max(learningContent.length - currentUnit - 1, 0);

  const completeLesson = async () => {
    if (sessionLoading || progressLoading || saving || !studentId) return;
    setSaving(true);
    setProgressError("");
    setSaveMessage("");
    try {
      const result = await markLessonComplete(course, lessonNumber, studentId);
      if (result.ok) {
        setCompletedLessons(result.completedLessons);
        if (result.offline) setSaveMessage("Saved locally. It has not synced to Supabase.");
      } else {
        setProgressError(result.error);
      }
    } catch {
      setProgressError("Lesson progress could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const nextLesson = () => {
    window.location.href = `/lesson?course=${course}&lesson=${lessonNumber + 1}`;
  };

  const moveUnit = (amount) => setCurrentUnit((value) => Math.max(0, Math.min(learningContent.length - 1, value + amount)));

  const lessonLabel = useMemo(() => String(lessonNumber).padStart(2, "0"), [lessonNumber]);

  if (!courseData || !lesson) {
    return (
      <div className="lesson-page">
        <header className="lesson-nav"><a className="lesson-brand" href="/">LibLearn</a><ThemeControl /></header>
        <main className="lesson-empty"><span>LIBRARY</span><h1>This lesson is not available yet.</h1><p>The course structure is ready, but this lesson does not have published learning content.</p><a href="/courses">Explore courses →</a></main>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <header className="lesson-nav">
        <a className="lesson-brand" href="/">
          <span className="brand-dot"></span>
          <span><strong>LibLearn</strong><small>Learn. Grow. Lead.</small></span>
        </a>
        <nav><a href="/courses">Courses</a><a href="/dashboard">My learning</a></nav>
        <ThemeControl />
      </header>

      <main className="lesson-main">
        <div className="lesson-breadcrumb">
          <a href={`/course?course=${course}`}>← {courseData.title}</a>
          <span>Lesson {lessonLabel} of {String(totalLessons).padStart(2, "0")}</span>
        </div>

        <section className="lesson-hero">
          <div>
            <span className="lesson-kicker">{courseData.category || "COURSE"} · LESSON {lessonLabel}</span>
            <h1>{lesson.title}</h1>
            <p>{lesson.description || "Take your time. Follow the idea, explore the details, and make the connection."}</p>
          </div>
          <div className="lesson-progress-card">
            <span>COURSE PROGRESS</span>
            <strong>{courseProgress}%</strong>
            <div><i style={{ width: `${courseProgress}%` }}></i></div>
            <small>{completedLessons.length} of {totalLessons} lessons complete</small>
          </div>
        </section>

        {progressError && <p className="lesson-message error" role="alert">{progressError}</p>}
        {saveMessage && <p className="lesson-message success" role="status">{saveMessage}</p>}

        <div className="lesson-workspace">
          <aside className="lesson-outline">
            <div className="outline-heading"><span>THE JOURNEY</span><strong>{currentUnit + 1}/{learningContent.length}</strong></div>
            <div className="outline-line"></div>
            {learningContent.map((item, index) => (
              <button key={item.title || index} className={index === currentUnit ? "current" : index < currentUnit ? "visited" : ""} onClick={() => setCurrentUnit(index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title || `Section ${index + 1}`}</strong><small>{index === currentUnit ? "You are here" : index < currentUnit ? "Explored" : "Ahead"}</small></div>
              </button>
            ))}
          </aside>

          <article className="lesson-reading">
            <div className="reading-topline">
              <span>{String(currentUnit + 1).padStart(2, "0")}</span>
              <span>{lessonProgress}% through this lesson</span>
            </div>

            <header className="reading-heading">
              <span>CORE IDEA</span>
              <h2>{unit?.title || "Learning section"}</h2>
            </header>

            <LearningContent unit={unit} />

            <div className="learning-actions">
              <button className="quiet-button" onClick={() => moveUnit(-1)} disabled={currentUnit === 0}>← Previous</button>
              <div className="learning-actions-middle">
                <span>{remaining === 0 ? "Last section" : `${remaining} section${remaining === 1 ? "" : "s"} to go`}</span>
              </div>
              {currentUnit < learningContent.length - 1 ? (
                <button className="primary-learning-button" onClick={() => moveUnit(1)}>Continue exploring →</button>
              ) : !isCompleted ? (
                <button className="primary-learning-button" onClick={completeLesson} disabled={sessionLoading || progressLoading || saving || !studentId}>
                  {saving ? "Saving…" : "I've finished this lesson ✓"}
                </button>
              ) : lessonNumber < totalLessons ? (
                <button className="primary-learning-button" onClick={nextLesson}>Begin the next lesson →</button>
              ) : (
                <a className="primary-learning-button" href={`/course?course=${course}`}>Return to course →</a>
              )}
            </div>

            <footer className="lesson-explore-bar">
              <div><span>GO DEEPER</span><p>More context, examples, connections and explanations will live here as LibLearn becomes adaptive.</p></div>
              <button type="button" disabled>Ask LibLearn AI <small>Coming later</small> ↗</button>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
}

export default Lesson;
