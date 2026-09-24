import { useEffect, useState } from "react";
import "./App.css";
import Courses from "./Courses.jsx";
import CourseDetails from "./CourseDetails.jsx";
import Lesson from "./Lesson.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Dashboard from "./Dashboard.jsx";
import Profile from "./Profile.jsx";
import PasswordReset from "./PasswordReset.jsx";
import { getSession, mapSession } from "./authStore.js";
import { supabase } from "./lib/supabase.js";

function ProtectedRoute({ children, session }) {
  useEffect(() => {
    if (session === null) window.location.href = "/login";
  }, [session]);

  if (session === undefined) return <main className="auth-page"><p>Loading...</p></main>;
  if (!session) return null;
  return children(session);
}

function App() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("liblearn-theme") || "system";
      const applyTheme = () => {
        const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
        document.documentElement.dataset.theme =
          saved === "system" ? (systemDark ? "dark" : "default") : saved;
      };

      applyTheme();

      const media = window.matchMedia?.("(prefers-color-scheme: dark)");
      media?.addEventListener?.("change", applyTheme);

      return () => media?.removeEventListener?.("change", applyTheme);
    } catch {
      document.documentElement.dataset.theme = "default";
    }
  }, []);

  const [session, setSession] = useState(undefined);
  const path = window.location.pathname;

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;
    let authListener;

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        authEventReceived = true;
        if (mounted) setSession(mapSession(currentSession));
      });
      authListener = data;
    }

    getSession().then((currentSession) => {
      if (mounted && !authEventReceived) setSession(currentSession);
    }).catch(() => {
      if (mounted && !authEventReceived) setSession(null);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (path === "/courses") {
    return <Courses session={session} />;
  }

  if (path === "/course") {
    return <CourseDetails session={session} />;
  }

  if (path === "/lesson") {
    return <Lesson session={session} />;
  }

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/register") {
    return <Register />;
  }

  if (path === "/dashboard") {
    return <ProtectedRoute session={session}>{(currentSession) => <Dashboard session={currentSession} />}</ProtectedRoute>;
  }

  if (path === "/profile") {
    return <ProtectedRoute session={session}>{(currentSession) => <Profile session={currentSession} />}</ProtectedRoute>;
  }

  if (path === "/forgot-password") {
    return <PasswordReset />;
  }

  if (path === "/reset-password") {
    return <PasswordReset update session={session} />;
  }
  // the rest of your homepage code...
  // Homepage
  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">

        <div className="brand">

          <div className="brand-icon">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div>
            <h2>LibLearn</h2>
            <p>Learn. Grow. Lead.</p>
          </div>

        </div>

        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
          <a href="#learning-room">Learning Room</a>
          <a href="#community">Community</a>
        </nav>

        <div className="nav-actions">
          {session === undefined ? null : session ? <a className="join-btn" href="/dashboard">Dashboard</a> : <><a className="login-btn" href="/login">Sign in</a><a className="join-btn" href="/register">Join LibLearn</a></>}
        </div>

      </header>


      <main>

        {/* HERO */}
        <section className="hero" id="home">

          <div className="hero-content">

            <span className="eyebrow">
              🇱🇷 Built for African learners
            </span>

            <h1>
              Learn together.
              <br />
              <span>Build your future.</span>
            </h1>

            <p>
              LibLearn brings courses, study resources, an AI tutor,
              learning tools, and student communities together in one place.
            </p>

            <div className="search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search courses, subjects, resources..."
              />

              <button>
                Search
              </button>

            </div>

            <div className="hero-features">
              <span>✓ Student-focused</span>
              <span>✓ Learn at your pace</span>
              <span>✓ Community-driven</span>
            </div>

          </div>


          <div className="hero-visual">

            <div className="floating-card card-one">

              <span>📚</span>

              <div>
                <strong>3 Courses</strong>
                <small>Available to explore</small>
              </div>

            </div>


            <div className="student-circle">

              <div className="student-avatar">
                🧑🏾‍🎓
              </div>

              <div className="student-avatar small avatar-two">
                👩🏾‍🎓
              </div>

              <div className="student-avatar small avatar-three">
                👨🏾‍🎓
              </div>

              <div className="circle-text">
                <strong>Learn</strong>
                <span>together</span>
              </div>

            </div>


            <div className="floating-card card-two">

              <span>🤖</span>

              <div>
                <strong>AI Tutor</strong>
                <small>Ask. Learn. Understand.</small>
              </div>

            </div>

          </div>

        </section>

        <section className="audience-section" aria-label="Who LibLearn is for">
          <div className="audience-heading"><span className="section-label">ONE LEARNING COMMUNITY</span><h2>Built for the people who learn and teach.</h2><p>LibLearn brings together learners, university communities, and teachers in one welcoming place.</p></div>
          <div className="audience-grid"><article><span>01</span><h3>High-School Students</h3><p>Support for Grade 1–12 learning, lessons, subjects, and steady progress.</p></article><article><span>02</span><h3>University Students</h3><p>Academic courses, resources, collaboration, and tools for university life.</p></article><article><span>03</span><h3>Teachers</h3><p>Teaching spaces, classrooms, resources, and support for every learner.</p></article></div>
        </section>


        {/* QUICK STATS */}
        <section className="stats">

          <div>
            <strong>Learn</strong>
            <span>Courses & lessons</span>
          </div>

          <div>
            <strong>Practice</strong>
            <span>Quizzes & tasks</span>
          </div>

          <div>
            <strong>Connect</strong>
            <span>Study communities</span>
          </div>

          <div>
            <strong>Ask</strong>
            <span>AI learning assistant</span>
          </div>

        </section>


        {/* COURSES */}
        <section className="section" id="courses">

          <div className="section-heading">

            <div>

              <span className="section-label">
                START LEARNING
              </span>

              <h2>
                Popular Courses
              </h2>

              <p>
                Explore subjects designed to help you learn and grow.
              </p>

            </div>

            <a
              href="/courses"
              className="text-button"
            >
              See all courses →
            </a>

          </div>


          <div className="course-grid">

            {/* BIOLOGY */}
            <article className="course-card">

              <div className="course-top blue">

                <span>
                  SCIENCE
                </span>

                <div>
                  🧬
                </div>

              </div>

              <div className="course-body">

                <h3>
                  Biology
                </h3>

                <p>
                  Explore life, living organisms, cells,
                  genetics and more.
                </p>

                <div className="course-meta">

                  <span>
                    12 lessons
                  </span>

                  <span>
                    Beginner
                  </span>

                </div>

                <a
                 href="/course?course=biology"
                  className="course-button"
                >
                  Start learning →
                </a>

              </div>

            </article>


            {/* MATHEMATICS */}
            <article className="course-card">

              <div className="course-top navy">

                <span>
                  MATHEMATICS
                </span>

                <div>
                  ∑
                </div>

              </div>

              <div className="course-body">

                <h3>
                  Introduction to Mathematics
                </h3>

                <p>
                  Build strong foundations in algebra,
                  numbers and problem solving.
                </p>

                <div className="course-meta">

                  <span>
                    15 lessons
                  </span>

                  <span>
                    Beginner
                  </span>

                </div>

                <a
                 href="/course?course=mathematics"
                  className="course-button"
                >
                  Start learning →
                </a>

              </div>

            </article>


            {/* DIGITAL LITERACY */}
            <article className="course-card">

              <div className="course-top gold">

                <span>
                  DIGITAL SKILLS
                </span>

                <div>
                  💻
                </div>

              </div>

              <div className="course-body">

                <h3>
                  Digital Literacy
                </h3>

                <p>
                  Learn the essential digital skills for
                  school, work and everyday life.
                </p>

                <div className="course-meta">

                  <span>
                    10 lessons
                  </span>

                  <span>
                    Beginner
                  </span>

                </div>

                <a
                 href="/course?course=digital"
                  className="course-button"
                >
                  Start learning →
                </a>

              </div>

            </article>

          </div>

        </section>


        {/* LEARNING ROOM */}
        <section
          className="learning-section"
          id="learning-room"
        >

          <div className="learning-preview">

            <div className="preview-header">
              <span>My Learning</span>
              <span className="online-dot">
                ● Online
              </span>
            </div>

            <div className="progress-card">

              <div className="progress-title">

                <span>
                  Introduction to Statistics
                </span>

                <strong>
                  68%
                </strong>

              </div>

              <div className="progress-bar">
                <div style={{ width: "68%" }}></div>
              </div>

              <p>
                8 of 12 lessons completed
              </p>

            </div>

            <div className="lesson-list">

              <div className="lesson done">

                <span>✓</span>

                <div>
                  <strong>
                    Understanding Data
                  </strong>

                  <small>
                    Completed
                  </small>
                </div>

              </div>

              <div className="lesson done">

                <span>✓</span>

                <div>
                  <strong>
                    Types of Variables
                  </strong>

                  <small>
                    Completed
                  </small>
                </div>

              </div>

              <div className="lesson active">

                <span>▶</span>

                <div>
                  <strong>
                    Measures of Central Tendency
                  </strong>

                  <small>
                    Continue learning
                  </small>
                </div>

              </div>

            </div>

          </div>


          <div className="learning-content">

            <span className="section-label">
              YOUR LEARNING ROOM
            </span>

            <h2>
              Everything you need to
              <span> keep learning.</span>
            </h2>

            <p>
              Your Learning Room will bring your lessons,
              notes, quizzes, assignments, progress and AI
              assistance together.
            </p>

            <div className="feature-list">

              <div>
                <span>✓</span>

                <p>
                  <strong>
                    Track your progress
                  </strong>
                  See exactly where you are in every course.
                </p>

              </div>

              <div>
                <span>✓</span>

                <p>
                  <strong>
                    Save your resources
                  </strong>
                  Keep important notes and learning materials close.
                </p>

              </div>

              <div>
                <span>✓</span>

                <p>
                  <strong>
                    Study with your AI Tutor
                  </strong>
                  Get explanations whenever you need help.
                </p>

              </div>

            </div>

            <button className="primary-button">
              Enter Learning Room →
            </button>

          </div>

        </section>


        {/* AI TUTOR */}
        <section className="ai-section">

          <div className="ai-content">

            <span className="section-label">
              MEET YOUR AI STUDY PARTNER
            </span>

            <h2>
              Meet <span>LibLearn AI.</span>
            </h2>

            <p>
              Stuck on a difficult topic? Ask questions,
              request simpler explanations, practice concepts,
              or get help preparing for an exam.
            </p>

            <div className="ai-examples">

              <div>
                “Explain photosynthesis simply.”
              </div>

              <div>
                “Help me understand this equation.”
              </div>

              <div>
                “Quiz me on African history.”
              </div>

            </div>

            <button className="primary-button">
              Ask LibLearn AI →
            </button>

          </div>


          <div className="ai-chat">

            <div className="chat-header">

              <div className="ai-avatar">
                ✦
              </div>

              <div>
                <strong>
                  LibLearn AI
                </strong>

                <small>
                  Study assistant
                </small>
              </div>

              <span className="status">
                ●
              </span>

            </div>

            <div className="chat-body">

              <div className="message ai-message">
                Hey! 👋 What are you learning today?
              </div>

              <div className="message user-message">
                Can you explain opportunity cost?
              </div>

              <div className="message ai-message">
                Absolutely. Opportunity cost is the value
                of the next best option you give up when
                you make a choice...
              </div>

            </div>

            <div className="chat-input">

              <span>
                Ask your tutor anything...
              </span>

              <button>
                ↑
              </button>

            </div>

          </div>

        </section>


        {/* RESOURCES */}
        <section className="section resources-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                STUDY SMARTER
              </span>

              <h2>
                Study Resources
              </h2>

              <p>
                Discover notes and resources shared by learners.
              </p>

            </div>

            <button className="text-button">
              View resources →
            </button>

          </div>

          <div className="resource-grid">

            <div className="resource-card">
              <span className="resource-icon">📄</span>

              <div>
                <span>NOTES</span>
                <h3>Liberian History Notes</h3>
                <p>Shared by a LibLearn student</p>
              </div>

              <strong>→</strong>
            </div>

            <div className="resource-card">
              <span className="resource-icon">🧪</span>

              <div>
                <span>CHEMISTRY</span>
                <h3>Formula Cheat Sheet</h3>
                <p>18 students saved this</p>
              </div>

              <strong>→</strong>
            </div>

            <div className="resource-card">
              <span className="resource-icon">💬</span>

              <div>
                <span>DISCUSSION</span>
                <h3>
                  How do I solve quadratic equations?
                </h3>
                <p>Join the discussion</p>
              </div>

              <strong>→</strong>
            </div>

            <div className="resource-card">
              <span className="resource-icon">📝</span>

              <div>
                <span>EXAM PREP</span>
                <h3>WAEC Study Tips</h3>
                <p>Community discussion</p>
              </div>

              <strong>→</strong>
            </div>

          </div>

        </section>


        {/* COMMUNITY */}
        <section
          className="community-section"
          id="community"
        >

          <div>

            <span className="section-label">
              LEARN TOGETHER
            </span>

            <h2>
              You don't have to
              <span> study alone.</span>
            </h2>

            <p>
              Join students, create study groups, ask
              questions and share knowledge with other learners.
            </p>

            <button className="primary-button">
              Explore Community →
            </button>

          </div>


          <div className="community-card">

            <div className="community-card-header">
              <span>
                Popular Study Groups
              </span>

              <strong>
                See all →
              </strong>
            </div>

            <div className="study-group">

              <div className="group-icon">
                🧬
              </div>

              <div>
                <strong>
                  Biology 101
                </strong>

                <p>
                  12 members · Biology Study
                </p>
              </div>

              <span>
                Active
              </span>

            </div>

            <div className="study-group">

              <div className="group-icon">
                ∑
              </div>

              <div>
                <strong>
                  Mathematics
                </strong>

                <p>
                  24 members · Mathematics Study
                </p>
              </div>

              <span>
                24 members
              </span>

            </div>

            <div className="study-group">

              <div className="group-icon">
                💻
              </div>

              <div>
                <strong>
                  Digital Skills Circle
                </strong>

                <p>
                  8 members · Digital Literacy
                </p>
              </div>

              <span>
                Join
              </span>

            </div>

          </div>

        </section>


        {/* CTA */}
        <section className="cta">

          <div>

            <span>
              READY TO START?
            </span>

            <h2>
              Build your future with LibLearn.
            </h2>

            <p>
              Learn new skills, connect with other students
              and take control of your education.
            </p>

          </div>

          <a className="home-join-link" href="/register">
            Join LibLearn — It's Free
          </a>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-main">

          <div className="footer-brand">

            <div className="brand">

              <div className="brand-icon">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div>
                <h2>
                  LibLearn
                </h2>

                <p>
                  Learn. Grow. Lead.
                </p>
              </div>

            </div>

            <p>
              A student-focused digital learning platform
              built to make learning more accessible and connected.
            </p>

          </div>


          <div>
            <h4>Platform</h4>
            <a href="/courses">Courses</a>
            <a href="#learning-room">Learning Room</a>
            <a href="#community">Community</a>
            <a href="#home">AI Tutor</a>
          </div>


          <div>
            <h4>Students</h4>
            <a href="/login">Sign in</a>
            <a href="/register">Create account</a>
            <a href="#home">Resources</a>
            <a href="#home">Help</a>
          </div>


          <div>
            <h4>LibLearn</h4>
            <a href="#home">About</a>
            <a href="#home">Contact</a>
            <a href="#home">Privacy</a>
            <a href="#home">Community Guidelines</a>
          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 LibLearn. Built for learners.
          </span>

          <span>
            Made with purpose for students in Liberia 🇱🇷
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;