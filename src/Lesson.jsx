import { useState } from "react";
import { getBiologyLesson } from "./data/biologyLessons.js";

const completedLessonsKey = "liblearn-biology-completed-lessons";

function getVariant(slide, index) {
  if (slide.layout) return slide.layout;
  if (slide.summary) return "summary";
  const title = slide.title?.toLowerCase() || "";
  if (slide.quiz || title.includes("review") || title.includes("quiz")) return "quiz";
  if (title.includes("scientist") || title.includes("darwin") || title.includes("mendel") || title.includes("pasteur")) return "scientist";
  if (title.includes("liberia") || title.includes("africa") || title.includes("context")) return "context";
  if (title.includes("process") || title.includes("cycle") || title.includes("method") || title.includes("steps")) return "process";
  if (title.includes("comparison") || title.includes("versus") || title.includes(" and ")) return "comparison";
  if (title.includes("structure") || title.includes("organisation") || title.includes("organization")) return "structure";
  if (index === 0) return "definition";
  if (index % 5 === 0) return "application";
  if (index % 3 === 0) return "key-points";
  return "concept";
}

function SlideCard({ item, index }) {
  return (
    <section className="textbook-card" key={`${item.heading}-${index}`}>
      <span className="textbook-card-index">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h2>{item.heading}</h2>
        <p>{item.text}</p>
      </div>
    </section>
  );
}

function SlideContent({ slide, variant }) {
  const items = slide.content || [];
  const lead = items[0];
  const rest = items.slice(1);

  if (variant === "definition") {
    return <div className="presentation-definition"><div className="definition-lead"><span>CORE DEFINITION</span><p>{lead?.text}</p></div><div className="textbook-grid">{rest.map((item, index) => <SlideCard item={item} index={index} key={item.heading} />)}</div></div>;
  }

  if (variant === "process") {
    return <div className="presentation-process"><p className="process-intro">{lead?.text}</p><div className="process-steps">{rest.map((item, index) => <div className="process-step" key={item.heading}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{item.heading}</h2><p>{item.text}</p></div>{index < rest.length - 1 && <b>↓</b>}</div>)}</div></div>;
  }

  if (variant === "comparison") {
    return <div className="presentation-comparison"><div className="comparison-lead"><span>COMPARE THE IDEAS</span><p>{lead?.text}</p></div><div className="comparison-columns">{rest.slice(0, 2).map((item, index) => <section className={`comparison-column ${index === 0 ? "accent" : ""}`} key={item.heading}><span>0{index + 1}</span><h2>{item.heading}</h2><p>{item.text}</p></section>)}</div>{rest.length > 2 && <div className="textbook-grid compact">{rest.slice(2).map((item, index) => <SlideCard item={item} index={index} key={item.heading} />)}</div>}</div>;
  }

  if (variant === "context") {
    return <div className="presentation-context"><div className="context-banner"><span>LIBERIA IN CONTEXT</span><strong>🇱🇷</strong></div><div className="context-body"><h2>{lead?.heading}</h2><p>{lead?.text}</p><div className="textbook-grid compact">{rest.map((item, index) => <SlideCard item={item} index={index} key={item.heading} />)}</div></div></div>;
  }

  if (variant === "scientist") {
    return <div className="presentation-scientist"><div className="scientist-mark">BIOLOGY<br />SPOTLIGHT</div><div><span className="slide-kicker">IMPORTANT CONTRIBUTION</span><h2>{lead?.heading}</h2><p className="scientist-intro">{lead?.text}</p></div><div className="textbook-grid compact">{rest.map((item, index) => <SlideCard item={item} index={index} key={item.heading} />)}</div></div>;
  }

  if (variant === "example" || variant === "application" || variant === "experiment") {
    return <div className="presentation-example"><div className="example-lead"><span>{variant === "experiment" ? "INVESTIGATE" : variant === "application" ? "IN PRACTICE" : "WORKED EXAMPLE"}</span><p>{lead?.text}</p></div><div className="textbook-grid">{rest.map((item, index) => <SlideCard item={item} index={index} key={item.heading} />)}</div></div>;
  }

  if (variant === "summary" || variant === "quiz") {
    return <div className="presentation-summary"><div className="summary-lead"><span>{variant === "quiz" ? "KNOWLEDGE CHECK" : "LESSON RECAP"}</span><p>{lead?.text}</p></div><div className="textbook-grid">{rest.map((item, index) => <SlideCard item={item} index={index} key={item.heading} />)}</div>{slide.reviewQuestions && <div className="question-panel"><span>REVIEW QUESTIONS</span><ol>{slide.reviewQuestions.map((question) => <li key={question}>{question}</li>)}</ol></div>}{slide.quiz && <div className="question-panel quiz-panel"><span>SHORT QUIZ</span><ol>{slide.quiz.map((question) => <li key={question}>{question}</li>)}</ol></div>}</div>;
  }

  return <div className="presentation-standard"><div className="standard-lead"><span>{variant === "application" ? "IN PRACTICE" : "CORE CONCEPT"}</span><p>{lead?.text}</p></div><div className="textbook-grid">{rest.map((item, index) => <SlideCard item={item} index={index} key={item.heading} />)}</div></div>;
}

function Lesson() {
  const params = new URLSearchParams(window.location.search);
  const course = params.get("course") || "biology";
  const lessonNumber = Math.max(1, Number(params.get("lesson")) || 1);
  const lesson = course === "biology" ? getBiologyLesson(lessonNumber) : null;
  const slides = lesson?.slides || [{ title: "Lesson Coming Soon", type: "concept", content: [{ heading: "Coming next", text: "This lesson is being prepared. More detailed learning material will be added to this course." }] }];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(() => {
    try { return JSON.parse(localStorage.getItem(completedLessonsKey) || "[]"); } catch { return []; }
  });
  const slide = slides[currentSlide];
  const variant = getVariant(slide, currentSlide);
  const isCompleted = completedLessons.includes(lessonNumber);
  const progress = Math.round(((currentSlide + 1) / slides.length) * 100);
  const courseProgress = Math.round((completedLessons.length / 12) * 100);

  const completeLesson = () => {
    const updated = completedLessons.includes(lessonNumber) ? completedLessons : [...completedLessons, lessonNumber].sort((a, b) => a - b);
    setCompletedLessons(updated);
    localStorage.setItem(completedLessonsKey, JSON.stringify(updated));
  };

  const nextLesson = () => { window.location.href = `/lesson?course=${course}&lesson=${lessonNumber + 1}`; };
  const moveSlide = (amount) => setCurrentSlide((value) => Math.max(0, Math.min(slides.length - 1, value + amount)));

  return (
    <div className="lesson-page">
      <header className="navbar"><div className="brand"><div className="brand-icon"><span></span><span></span><span></span><span></span><span></span></div><div><h2>LibLearn</h2><p>Learn. Grow. Lead.</p></div></div><nav className="nav-links"><a href="/">Home</a><a href="/courses">Courses</a><a href="/#learning-room">Learning Room</a><a href="/#community">Community</a></nav><div className="nav-actions"><button className="login-btn">Sign in</button><button className="join-btn">Join LibLearn</button></div></header>
      <main className="lesson-main">
        <div className="lesson-top"><a href={`/course?course=${course}`} className="back-link">← Back to Course</a><span>LESSON {String(lessonNumber).padStart(2, "0")} OF 12</span></div>
        <section className="lesson-heading"><div><span className="section-label">LIBLEARN BIOLOGY</span><h1>{lesson?.title || "Biology lesson"}</h1></div><div className="lesson-location"><strong>SLIDE {currentSlide + 1}</strong><span>of {slides.length}</span></div></section>
        <div className="lesson-progress-area"><div className="lesson-progress-text"><span>Course progress</span><strong>{completedLessons.length}/12 lessons complete</strong></div><div className="lesson-progress-bar"><div style={{ width: `${courseProgress}%` }}></div></div><div className="lesson-progress-text"><span>{progress}% through this lesson</span><strong>{slides.length - currentSlide - 1} slides remaining</strong></div><div className="lesson-progress-bar"><div style={{ width: `${progress}%` }}></div></div></div>
        <article className={`lesson-slide presentation-slide ${variant}`}><div className="lesson-slide-number">{String(currentSlide + 1).padStart(2, "0")}</div><div className="lesson-slide-content"><div className="slide-meta"><span>{variant.replace("-", " ").toUpperCase()}</span><span>LESSON {lessonNumber}</span></div><h2 className="presentation-title">{slide.title || "Lesson summary"}</h2><SlideContent slide={slide} variant={variant} /></div></article>
        <div className="lesson-navigation"><button className="lesson-nav-button secondary" onClick={() => moveSlide(-1)} disabled={currentSlide === 0}>← Previous</button><span className="navigation-count">{currentSlide + 1} / {slides.length}</span>{currentSlide === slides.length - 1 ? <>{!isCompleted && <button className="lesson-nav-button primary" onClick={completeLesson}>Complete Lesson ✓</button>}{isCompleted && lessonNumber < 12 && <button className="lesson-nav-button primary" onClick={nextLesson}>Next Lesson →</button>}{isCompleted && lessonNumber === 12 && <a className="lesson-nav-button primary" href={`/course?course=${course}`}>Back to Course</a>}</> : <button className="lesson-nav-button primary" onClick={() => moveSlide(1)}>Next →</button>}</div>
      </main>
    </div>
  );
}

export default Lesson;
