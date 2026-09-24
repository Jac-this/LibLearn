import { useEffect, useState } from "react";
import { getSession, signOut } from "./authStore.js";
import { getCourse } from "./data/courses.js";

function LegacyCourseDetails({ course }) {
  const modules = course?.modules || [];

  return (
    <main className="course-details-page">
      <section className={`course-details-hero ${course.color || ""}`}>
        <div className="course-details-hero-content">
          <a href="/courses" className="back-link">← Back to Courses</a>
          <span className="course-details-category">{course.category}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-details-meta">
            <span>📚 {modules.length} modules</span>
            <span>🎯 {course.level}</span>
            <span>📈 Guided learning</span>
          </div>
        </div>
        <div className="course-details-icon">{course.icon}</div>
      </section>

      <section className="course-selector">
        <p className="section-label">COURSE MODULES</p>
        <div className="course-selector-buttons">
          {modules.map((module, index) => (
            <a key={module.id || index} href={`/lesson?course=${course.id}&module=${index + 1}&topic=1`}>
              {index + 1}. {module.title}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
function CourseDetails({ session: initialSession }) {
  const [session, setSession] = useState(initialSession);
  useEffect(() => { if (initialSession !== undefined) setSession(initialSession); else getSession().then(setSession).catch(() => setSession(null)); }, [initialSession]);
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course") || "biology";
  const course = getCourse(courseId === "digital" ? "digital-literacy" : courseId) || null;
  const modules = course?.modules || [];
  const isBiology = courseId === "biology";

  if (!isBiology) {
    return <LegacyCourseDetails courseId={courseId} course={course} />;
  }

  return (
    <div className={isBiology ? "biology-overview" : "course-details-page"}>
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon"><span></span><span></span><span></span><span></span><span></span></div>
          <div><h2>LibLearn</h2><p>Learn. Grow. Lead.</p></div>
        </div>
        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/courses">Learn</a>
          {session && <a href="/dashboard">Dashboard</a>}
          {session && <a href="/profile">Profile</a>}
        </nav>
        <div className="nav-actions">{session ? <button className="login-btn" onClick={async () => { await signOut(); window.location.href = "/"; }}>Sign out</button> : <><a className="login-btn" href="/login">Sign in</a><a className="join-btn" href="/register">Join LibLearn</a></>}</div>
      </header>

      <main>
          <section className="biology-overview-hero">
            <div className="biology-overview-hero-content">
              <a href="/courses" className="biology-back-link">← Back to Courses</a>
              <span className="biology-category">{course.category}</span>
              <h1>Introduction to Biology</h1>
              <p className="biology-hero-description">Discover the science of life, from cells and genetics to human systems, ecosystems, evolution, and the living world around us.</p>
              <div className="biology-course-meta">
                <span><strong>{modules.length}</strong> Modules</span>
                <span><strong>Beginner</strong> Level</span>
                <span><strong>Guided</strong> Learning</span>
              </div>
              <a className="biology-start-button" href="/lesson?course=biology&module=1&topic=1">Start Course <span>→</span></a>
            </div>
            <div className="biology-hero-emblem" aria-hidden="true"><span>{course.icon}</span><small>THE SCIENCE<br />OF LIFE</small></div>
          </section>

          <section className="biology-overview-section biology-learn-section">
            <div className="biology-section-heading"><span>COURSE INTRODUCTION</span><h2>What you'll learn</h2><p>Build a practical foundation for understanding living systems and the biological questions that shape our world.</p></div>
            <div className="biology-outcomes-grid">{modules.flatMap((module) => module.topics?.filter((topic) => topic.type === "learning-outcomes").flatMap((topic) => topic.learningOutcomes || []) || []).slice(0, 7).map((outcome, index) => <article className="biology-outcome" key={outcome}><span>{String(index + 1).padStart(2, "0")}</span><p>{outcome}</p></article>)}</div>
          </section>

          <section className="biology-outline-section">
            <div className="biology-section-heading outline-heading"><div><span>YOUR LEARNING PATH</span><h2>Course outline</h2><p>Move through the foundations of Biology module by module and topic by topic.</p></div><strong>{modules.length} modules</strong></div>
            <div className="biology-outline-list">{modules.map((module, index) => <a className="biology-outline-item" href={`/lesson?course=biology&module=${index + 1}&topic=1`} key={module.id || index}><span className="biology-outline-number">{String(index + 1).padStart(2, "0")}</span><span className="biology-outline-title"><small>MODULE {index + 1}</small>{module.title}</span><span className="biology-outline-arrow">→</span></a>)}</div>
          </section>

          <section className="biology-overview-cta"><span>READY TO BEGIN?</span><h2>Start with the first lesson.</h2><p>Learn the language of life, then build from there.</p><a className="biology-start-button" href="/lesson?course=biology&module=1&topic=1">Start Course <span>→</span></a></section>
      </main>
    </div>
  );
}

export default CourseDetails;
