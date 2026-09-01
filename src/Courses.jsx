import { useState } from "react";

const courses = [
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    category: "Technology",
    level: "High School",
    difficulty: "Beginner",
    lessons: 12,
    duration: "4 weeks",
    icon: "💻",
    description:
      "Learn the essential digital skills you need to study, work, communicate, and navigate the modern world.",
  },
  {
    id: "mathematics",
    title: "Mathematics",
    category: "Mathematics",
    level: "High School",
    difficulty: "Beginner",
    lessons: 16,
    duration: "6 weeks",
    icon: "∑",
    description:
      "Build a strong foundation in numbers, algebra, geometry, statistics, and everyday problem solving.",
  },
  {
    id: "biology",
    title: "Biology",
    category: "Science",
    level: "High School",
    difficulty: "Beginner",
    lessons: 12,
    duration: "5 weeks",
    icon: "🧬",
    description:
      "Discover living organisms, cells, genetics, human biology, ecosystems, and the science of life.",
  },
];

const levels = [
  "All",
  "High School",
  "University",
  "Professional",
  "Skills",
];

const categories = [
  "All",
  "Mathematics",
  "Science",
  "Technology",
  "Business",
  "Health",
  "Humanities",
  "Social Sciences",
  "Law",
  "Arts & Design",
  "Languages",
  "Agriculture",
  "Education",
  "Career",
  "Personal Development",
];

function Courses() {
  const [activeLevel, setActiveLevel] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredCourses = courses.filter((course) => {
    const levelMatch =
      activeLevel === "All" || course.level === activeLevel;

    const categoryMatch =
      activeCategory === "All" ||
      course.category === activeCategory;

    const searchText = search.toLowerCase().trim();

    const searchMatch =
      searchText === "" ||
      course.title.toLowerCase().includes(searchText) ||
      course.category.toLowerCase().includes(searchText) ||
      course.description.toLowerCase().includes(searchText);

    return levelMatch && categoryMatch && searchMatch;
  });

  const openCourse = (course) => {
    window.location.href = `/course?course=${course.id}`;
  };

  const resetFilters = () => {
    setActiveLevel("All");
    setActiveCategory("All");
    setSearch("");
  };

  return (
    <div className="courses-page">

      {/* NAVIGATION */}
      <header className="navbar courses-header">
        <div className="courses-nav">

          <a href="/" className="brand">
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
          </a>

          <nav className="nav-links">
            <a href="/">Home</a>

            <a href="/courses" className="active">
              Courses
            </a>

            <a href="/#categories">
              Explore
            </a>

            <a href="/#opportunities">
              Opportunities
            </a>
          </nav>

          <a className="login-btn" href="/login">
            Log In
          </a>

        </div>
      </header>


      {/* HERO */}
      <section className="courses-hero">

        <div className="courses-hero-text">

          <p className="eyebrow">
            THE LIBLEARN COURSE LIBRARY
          </p>

          <h1>
            Learn.
            <br />
            <span>Grow.</span>
            <br />
            Become.
          </h1>

          <p>
            Explore courses designed to help you build
            knowledge, develop practical skills, and prepare
            for the future.
          </p>

        </div>

        <div className="courses-hero-card">

          <span className="hero-symbol">
            ✦
          </span>

          <strong>
            Knowledge opens doors.
          </strong>

          <small>
            Learn at your own pace. Build your future one
            lesson at a time.
          </small>

        </div>

      </section>


      {/* SEARCH */}
      <section className="course-explorer">

        <div className="course-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search courses, subjects or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>


        {/* LEVEL */}
        <div className="filter-section">

          <p className="filter-label">
            LEARNING LEVEL
          </p>

          <div className="course-categories">

            {levels.map((level) => (

              <button
                key={level}
                className={
                  activeLevel === level
                    ? "category-filter active"
                    : "category-filter"
                }
                onClick={() => setActiveLevel(level)}
              >
                {level}
              </button>

            ))}

          </div>

        </div>


        {/* CATEGORY */}
        <div className="filter-section">

          <p className="filter-label">
            SUBJECT AREA
          </p>

          <div className="course-categories">

            {categories.map((category) => (

              <button
                key={category}
                className={
                  activeCategory === category
                    ? "category-filter active"
                    : "category-filter"
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>

            ))}

          </div>

        </div>

      </section>


      {/* FEATURED COURSE */}
      {activeLevel === "All" &&
        activeCategory === "All" &&
        search === "" && (

          <section className="featured-course">

            <div className="featured-content">

              <p className="eyebrow">
                START HERE
              </p>

              <h2>
                Digital Literacy
                <br />
                <span>for the modern world.</span>
              </h2>

              <p>
                Learn the essential digital skills needed
                for school, work, communication, and everyday
                life.
              </p>

              <div className="featured-meta">

                <span>● Beginner friendly</span>

                <span>● 4 weeks</span>

                <span>● 12 lessons</span>

              </div>

              <button
                className="primary-button"
                onClick={() =>
                  openCourse(courses[0])
                }
              >
                Start Course →
              </button>

            </div>


            <div className="featured-visual">

              <div className="ai-circle">
                💻
              </div>

              <div className="floating-card card-one">
                ✦ Learn
              </div>

              <div className="floating-card card-two">
                +320 XP
              </div>

              <div className="floating-card card-three">
                LibLearn
              </div>

            </div>

          </section>
        )}


      {/* COURSE LIBRARY */}
      <section className="all-courses">

        <div className="courses-title">

          <div>

            <p className="eyebrow">
              COURSE LIBRARY
            </p>

            <h2>
              {search
                ? "Search results."
                : activeLevel !== "All"
                ? `${activeLevel} courses.`
                : activeCategory !== "All"
                ? `${activeCategory} courses.`
                : "Start learning."}
            </h2>

          </div>

          <span>
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1
              ? "course"
              : "courses"}
          </span>

        </div>


        <div className="course-catalog">

          {filteredCourses.map((course) => (

            <article
              className="catalog-card"
              key={course.id}
            >

              <div className="catalog-cover">

                <span className="catalog-icon">
                  {course.icon}
                </span>

                <span className="catalog-category">
                  {course.category}
                </span>

              </div>


              <div className="catalog-info">

                <div className="catalog-meta">

                  <span>
                    {course.level}
                  </span>

                  <span>•</span>

                  <span>
                    {course.difficulty}
                  </span>

                </div>

                <h3>
                  {course.title}
                </h3>

                <p className="course-description">
                  {course.description}
                </p>

                <div className="course-stats">

                  <span>
                    📚 {course.lessons} lessons
                  </span>

                  <span>
                    ◷ {course.duration}
                  </span>

                </div>

                <button
                  onClick={() =>
                    openCourse(course)
                  }
                >
                  View Course →
                </button>

              </div>

            </article>

          ))}

        </div>


        {/* NO RESULTS */}
        {filteredCourses.length === 0 && (

          <div className="no-results">

            <span>🔎</span>

            <h3>
              No courses found.
            </h3>

            <p>
              Try another subject or learning level.
            </p>

            <button
              className="primary-button"
              onClick={resetFilters}
            >
              View All Courses
            </button>

          </div>

        )}

      </section>


      {/* CTA */}
      <section className="courses-cta">

        <p className="eyebrow">
          KEEP LEARNING
        </p>

        <h2>
          Start with one course.
          <br />
          <span>Build from there.</span>
        </h2>

        <p>
          LibLearn will continue growing with more
          subjects, university courses, professional
          training, and practical skills.
        </p>

        <button
          className="primary-button"
          onClick={resetFilters}
        >
          Explore Courses →
        </button>

      </section>


      {/* FOOTER */}
      <footer className="courses-footer">

        <div>

          <a href="/" className="logo">

            <span className="logo-mark">
              L
            </span>

            <span>
              LibLearn
            </span>

          </a>

          <p>
            Built for learners. Inspired by Liberia.
          </p>

          <nav className="courses-footer-links">
            <a href="/">Home</a>
            <a href="/courses">Courses</a>
          </nav>

        </div>

        <p>
          © 2026 LibLearn
        </p>

      </footer>

    </div>
  );
}

export default Courses;