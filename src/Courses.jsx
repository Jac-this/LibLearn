import { useState } from "react";

function Courses() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = [
    "All",
    "School",
    "Technology",
    "Business",
    "Agriculture",
    "Creative",
    "Career",
  ];

  const courses = [
    {
      title: "Artificial Intelligence for Beginners",
      category: "Technology",
      level: "Beginner",
      learners: "1,247",
      duration: "6 weeks",
      icon: "AI",
      featured: true,
    },
    {
      title: "Mastering Mathematics",
      category: "School",
      level: "All levels",
      learners: "2,184",
      duration: "8 weeks",
      icon: "∑",
    },
    {
      title: "Build Your First Website",
      category: "Technology",
      level: "Beginner",
      learners: "864",
      duration: "5 weeks",
      icon: "</>",
    },
    {
      title: "English & Communication Skills",
      category: "School",
      level: "Beginner",
      learners: "1,563",
      duration: "6 weeks",
      icon: "Aa",
    },
    {
      title: "Start Your Small Business",
      category: "Business",
      level: "Beginner",
      learners: "723",
      duration: "4 weeks",
      icon: "₵",
    },
    {
      title: "Agriculture & Food Production",
      category: "Agriculture",
      level: "Beginner",
      learners: "548",
      duration: "7 weeks",
      icon: "🌱",
    },
    {
      title: "Creative Writing & Storytelling",
      category: "Creative",
      level: "All levels",
      learners: "436",
      duration: "4 weeks",
      icon: "✍",
    },
    {
      title: "Career & Workplace Skills",
      category: "Career",
      level: "Intermediate",
      learners: "689",
      duration: "5 weeks",
      icon: "🚀",
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const categoryMatch =
      activeCategory === "All" ||
      course.category === activeCategory;

    const searchMatch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.category.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const openCourse = () => {
    window.location.href = "/course";
  };

  return (
    <div className="courses-page">

      <header className="courses-header">

        <div className="courses-nav">

          <a href="/" className="logo">
            <span className="logo-mark">L</span>
            <span>Liberian Learning</span>
          </a>

          <nav>
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

          <button className="login-button">
            Log In
          </button>

        </div>

      </header>


      {/* HERO */}

      <section className="courses-hero">

        <div>

          <p className="eyebrow">
            LEARN SOMETHING NEW
          </p>

          <h1>
            Explore.
            <br />
            <span>Learn.</span>
            <br />
            Grow.
          </h1>

          <p>
            Discover courses designed to help Liberian learners
            build knowledge, develop practical skills, and
            prepare for the future.
          </p>

        </div>

        <div className="courses-hero-card">

          <span>🇱🇷</span>

          <strong>
            Learning has no limits.
          </strong>

          <small>
            From Monrovia to Grand Kru, knowledge should be
            accessible everywhere.
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

        </div>


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

      </section>


      {/* FEATURED COURSE */}

      {activeCategory === "All" && search === "" && (

        <section className="featured-course">

          <div className="featured-content">

            <p className="eyebrow">
              FEATURED COURSE
            </p>

            <h2>
              Artificial Intelligence
              <br />
              <span>for Beginners.</span>
            </h2>

            <p>
              Understand what AI is, how it works, and how young
              Liberians can use it to learn, create, solve
              problems, and build opportunities.
            </p>

            <div className="featured-meta">

              <span>● Beginner friendly</span>
              <span>● 6 weeks</span>
              <span>● 1,247 learners</span>

            </div>

            <button
              className="primary-button"
              onClick={openCourse}
            >
              Start Course →
            </button>

          </div>


          <div className="featured-visual">

            <div className="ai-circle">
              AI
            </div>

            <div className="floating-card card-one">
              ✦ Learn
            </div>

            <div className="floating-card card-two">
              +320 XP
            </div>

            <div className="floating-card card-three">
              🇱🇷 Liberia
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
              {activeCategory === "All"
                ? "Learn what matters."
                : `${activeCategory} courses.`}
            </h2>

          </div>

          <span>
            {filteredCourses.length} courses
          </span>

        </div>


        <div className="course-catalog">

          {filteredCourses.map((course) => (

            <article
              className="catalog-card"
              key={course.title}
            >

              <div className="catalog-cover">

                <span className="catalog-icon">
                  {course.icon}
                </span>

                <span className="catalog-category">
                  {course.category}
                </span>

                {course.featured && (
                  <span className="featured-tag">
                    FEATURED
                  </span>
                )}

              </div>


              <div className="catalog-info">

                <div className="catalog-meta">

                  <span>
                    {course.level}
                  </span>

                  <span>•</span>

                  <span>
                    {course.duration}
                  </span>

                </div>

                <h3>
                  {course.title}
                </h3>

                <p>
                  {course.learners} learners
                </p>

                <button
                  onClick={openCourse}
                >
                  View Course →
                </button>

              </div>

            </article>

          ))}

        </div>


        {filteredCourses.length === 0 && (

          <div className="no-results">

            <span>🔎</span>

            <h3>
              We couldn't find that course.
            </h3>

            <p>
              Try searching for another subject or skill.
            </p>

          </div>

        )}

      </section>


      {/* CTA */}

      <section className="courses-cta">

        <p className="eyebrow">
          NOT SURE WHERE TO START?
        </p>

        <h2>
          Your next skill
          <br />
          <span>could change everything.</span>
        </h2>

        <p>
          Start with something that interests you.
          You can always explore more later.
        </p>

        <button
          className="primary-button"
          onClick={openCourse}
        >
          Start Learning Free →
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
              Liberian Learning
            </span>

          </a>

          <p>
            Built for learners. Inspired by Liberia.
          </p>

        </div>

        <p>
          © 2026 Liberian Learning
        </p>

      </footer>

    </div>
  );
}

export default Courses;