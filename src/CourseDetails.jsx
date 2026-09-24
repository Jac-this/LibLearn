import { useEffect, useState } from "react";
import { getSession, signOut } from "./authStore.js";
import { biologyCourse } from "./data/biologyLessons.js";

const otherCourses = {
  mathematics: {
    title: "Introduction to Mathematics",
    category: "MATHEMATICS",
    icon: "∑",
    description: "Build strong foundations in numbers, algebra, equations, geometry, statistics, probability and mathematical problem solving.",
    lessons: ["Understanding Numbers", "Basic Arithmetic", "Fractions and Decimals", "Ratios and Proportions", "Algebraic Expressions", "Linear Equations", "Inequalities", "Exponents and Powers", "Geometry", "Measurement", "Graphs and Functions", "Statistics", "Probability", "Problem Solving", "Mathematics Revision"],
    level: "Beginner",
    color: "navy",
  },
  digital: {
    title: "Digital Literacy",
    category: "DIGITAL SKILLS",
    icon: "💻",
    description: "Learn the essential digital skills needed for school, work, communication, research and everyday life.",
    lessons: ["Introduction to Digital Literacy", "Using a Computer", "Files and Folders", "Internet and Web Browsing", "Email and Communication", "Microsoft Word and Documents", "Spreadsheets and Data", "Online Safety and Privacy", "Using AI Tools", "Digital Skills Final Review"],
    level: "Beginner",
    color: "gold",
  },
};

const biologyOutcomes = [
  "Explain what makes something living and how biology is studied.",
  "Describe cell structures and connect each structure to its function.",
  "Understand how cells divide and how traits are inherited.",
  "Explain how human body systems work together to maintain health.",
  "Apply ideas about nutrition, respiration, and reproduction to everyday life.",
  "Explore ecosystems, evolution, and microorganisms through African and Liberian examples.",
];

function LegacyCourseDetails({ courseId, course }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [{ title: course.lessons[0], type: "concept", content: [{ heading: "Coming next", text: "This course is being developed into the same detailed slide-by-slide learning system used for Biology." }] }];

  return (
    <main className="course-details-page">
      <section className={`course-details-hero ${course.color}`}><div className="course-details-hero-content"><a href="/courses" className="back-link">← Back to Courses</a><span className="course-details-category">{course.category}</span><h1>{course.title}</h1><p>{course.description}</p><div className="course-details-meta"><span>📚 {course.lessons.length} lessons</span><span>🎯 {course.level}</span><span>🏆 Certificate of completion</span></div></div><div className="course-details-icon">{course.icon}</div></section>
      <section className="course-selector"><p className="section-label">COURSE LESSONS</p><div className="course-selector-buttons">{course.lessons.map((lesson, index) => <a key={lesson} href={`/lesson?course=${courseId}&lesson=${index + 1}`}>{index + 1}. {lesson}</a>)}</div></section>
      <main className="course-details-content" id="lesson-area"><div className="lesson-progress-header"><div><span className="section-label">LESSON 1</span><h2>{course.lessons[0]}</h2></div><div className="slide-counter">Slide 1 of 1</div></div><div className="lesson-progress-bar"><div style={{ width: "100%" }}></div></div><article className={`learning-slide ${slides[currentSlide].type}`}><div className="slide-number">01</div><span className="slide-type">{course.category}</span><h1>{slides[currentSlide].title}</h1><div className="slide-content"><div className="slide-section"><h3>{slides[currentSlide].content[0].heading}</h3><p>{slides[currentSlide].content[0].text}</p></div></div></article><div className="slide-controls"><button className="secondary-button" onClick={() => setCurrentSlide(0)} disabled>← Previous</button><span>1 / 1</span><button className="primary-button" onClick={() => setCurrentSlide(0)} disabled>Lesson complete</button></div></main>
    </main>
  );
}

function CourseDetails({ session: initialSession }) {
  const [session, setSession] = useState(initialSession);
  useEffect(() => { if (initialSession !== undefined) setSession(initialSession); else getSession().then(setSession).catch(() => setSession(null)); }, [initialSession]);
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course") || "biology";
  const course = courseId === "biology" ? biologyCourse : otherCourses[courseId] || biologyCourse;
  const lessons = course.lessons;
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
                <span><strong>{lessons.length}</strong> Lessons</span>
                <span><strong>Beginner</strong> Level</span>
                <span><strong>Certificate</strong> of Completion</span>
              </div>
              <a className="biology-start-button" href="/lesson?course=biology&lesson=1">Start Course <span>→</span></a>
            </div>
            <div className="biology-hero-emblem" aria-hidden="true"><span>{course.icon}</span><small>THE SCIENCE<br />OF LIFE</small></div>
          </section>

          <section className="biology-overview-section biology-learn-section">
            <div className="biology-section-heading"><span>COURSE INTRODUCTION</span><h2>What you'll learn</h2><p>Build a practical foundation for understanding living systems and the biological questions that shape our world.</p></div>
            <div className="biology-outcomes-grid">{biologyOutcomes.map((outcome, index) => <article className="biology-outcome" key={outcome}><span>{String(index + 1).padStart(2, "0")}</span><p>{outcome}</p></article>)}</div>
          </section>

          <section className="biology-outline-section">
            <div className="biology-section-heading outline-heading"><div><span>YOUR LEARNING PATH</span><h2>Course outline</h2><p>Move through the foundations of Biology one lesson at a time.</p></div><strong>{lessons.length} lessons</strong></div>
            <div className="biology-outline-list">{lessons.map((lesson, index) => <div className="biology-outline-item" key={lesson}><span className="biology-outline-number">{String(index + 1).padStart(2, "0")}</span><span className="biology-outline-title"><small>LESSON {index + 1}</small>{lesson}</span><span className="biology-outline-arrow">→</span></div>)}</div>
          </section>

          <section className="biology-overview-cta"><span>READY TO BEGIN?</span><h2>Start with the first lesson.</h2><p>Learn the language of life, then build from there.</p><a className="biology-start-button" href="/lesson?course=biology&lesson=1">Start Course <span>→</span></a></section>
      </main>
    </div>
  );
}

export default CourseDetails;
