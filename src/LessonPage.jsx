import { useEffect, useMemo, useState } from "react";
import "./LessonPage.css";

function LessonPage({
  moduleTitle,
  courseTitle = "",
  topicTitle,
  topic = null,
  learningOutcomes = [],
  currentProgress = 0,
  totalLearners = 0,
  xp = 0,
  type = "learning-outcomes",
  onNext,
  onPrevious,
  totalTopics = 5,
  topics = [],
  currentTopicIndex = 0,
  onTopicSelect,
  moduleNumber = 1,
  notesCount = 0,
  showCertificate = true,
}) {
  const storageKey = useMemo(() => `liblearn-module-progress:${moduleTitle || "module"}`, [moduleTitle]);
  const [bottomBarOpen, setBottomBarOpen] = useState(true);
  const topicSections = Array.isArray(topic?.content) ? topic.content : [];
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    setCurrentSectionIndex(0);
  }, [topic?.id]);

  const [progress, setProgress] = useState(() =>
    Math.max(0, Math.min(100, Number(currentProgress) || 0)),
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const safeTopics = useMemo(
    () => (Array.isArray(topics) ? topics : []).filter(Boolean),
    [topics],
  );

  useEffect(() => {
    setProgress(Math.max(0, Math.min(100, Number(currentProgress) || 0)));
  }, [currentProgress]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(progress));
    } catch {}
  }, [storageKey, progress]);

  const nextTopicIndex = Math.min(
    Number(totalTopics) || 1,
    currentTopicIndex + 1,
  );
  const nextProgress = Math.round(
    (nextTopicIndex / Math.max(1, Number(totalTopics) || 1)) * 100,
  );

  const previousIndex = Math.max(0, currentTopicIndex - 1);
  const previousProgress = Math.round((previousIndex / Math.max(1, Number(totalTopics) || 1)) * 100);

  const navigateSmoothly = (action) => {
    document.documentElement.classList.add("liblearn-page-exit");
    window.setTimeout(action, 220);
  };

  const handlePrevious = () => {
    if (topicSections.length > 0 && currentSectionIndex > 0) {
      const previousSectionIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(previousSectionIndex);
      setProgress(Math.round((previousSectionIndex / topicSections.length) * 100));
      return;
    }

    if (currentTopicIndex <= 0) return;
    setProgress(previousProgress);
    navigateSmoothly(() => onPrevious?.({
      progress: previousProgress,
      currentTopicIndex: currentTopicIndex - 1,
    }));
  };

  const handleNext = () => {
    if (topicSections.length > 0 && currentSectionIndex < topicSections.length - 1) {
      const nextSectionIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextSectionIndex);
      setProgress(Math.round((nextSectionIndex / topicSections.length) * 100));
      return;
    }

    setProgress(nextProgress);
    navigateSmoothly(() => onNext?.({
      progress: nextProgress,
      currentTopicIndex: currentTopicIndex + 1,
    }));
  };

  const renderTopicContent = () => {
    if (type === "learning-outcomes") {
      return (
        <section className="liblearn-topic-content">
          <h1>{topicTitle || "Learning Outcomes"}</h1>
          <p className="liblearn-topic-intro">
            Upon completion of this module, you should be able to:
          </p>

          {learningOutcomes.length > 0 ? (
            <ul className="liblearn-outcomes">
              {learningOutcomes.map((outcome, index) => (
                <li key={typeof outcome === "string" ? outcome : index}>
                  <span className="liblearn-outcome-marker" aria-hidden="true">
                    •
                  </span>
                  <span>{typeof outcome === "string" ? outcome : outcome?.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="liblearn-empty-state">
              Learning outcomes for this topic have not been published yet.
            </p>
          )}
        </section>
      );
    }

    const currentSection = topicSections[currentSectionIndex] || null;
    return (
      <section className="liblearn-topic-content">
        <h1>{topicTitle}</h1>
        {currentSection ? (
          <div className="liblearn-topic-reading">
            <section>
              {currentSection.heading && <h2>{currentSection.heading}</h2>}
              {currentSection.text && <p>{currentSection.text}</p>}
            </section>
          </div>
        ) : (
          <div className="liblearn-topic-placeholder">
            <span>LEARNING TOPIC</span>
            <p>This topic is ready for its course-specific learning content.</p>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="liblearn-course-player">
      <header className="liblearn-player-topbar">
        <div className="liblearn-player-course">
          <button
            type="button"
            className="liblearn-sidebar-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Collapse course navigation" : "Open course navigation"}
          >
            ☰
          </button>

          <div>
            <span>LIBLEARN COURSE</span>
            <strong>{courseTitle || moduleTitle}</strong>
          </div>
        </div>

        <div className="liblearn-player-actions">
          <div className="liblearn-xp" title="Experience points">
            <span>XP</span>
            <strong>{xp}</strong>
          </div>

          {showCertificate && (
            <button type="button" className="liblearn-certify-button">
              Certify Now
            </button>
          )}
        </div>
      </header>

      <div className="liblearn-player-body">
        {sidebarOpen && (
          <aside className="liblearn-course-sidebar" aria-label="Course navigation">
            <div className="liblearn-sidebar-heading">
              <span>MODULE {moduleNumber}</span>
              <strong>{moduleTitle}</strong>
            </div>

            {topicSections.length > 0 ? (
              <nav className="liblearn-topic-list" aria-label="Current topic subtopics">
                {topicSections.map((section, index) => (
                  <button
                    type="button"
                    key={section?.id || section?.heading || index}
                    className={index === currentSectionIndex ? "current" : index < currentSectionIndex ? "completed" : "locked"}
                    onClick={() => {
                      if (index <= currentSectionIndex) setCurrentSectionIndex(index);
                    }}
                    disabled={index > currentSectionIndex}
                  >
                    <span className="liblearn-topic-number">{index + 1}</span>
                    <span>
                      <strong>{section?.heading || "Subtopic " + (index + 1)}</strong>
                      <small>{index < currentSectionIndex ? "Completed" : index === currentSectionIndex ? "Current" : "Locked"}</small>
                    </span>
                  </button>
                ))}
              </nav>
            ) : (
              <div className="liblearn-sidebar-placeholder">
                <span>TOPIC CONTENT</span>
                <p>This topic is ready for its course-specific learning content.</p>
              </div>
            )}

            <div className="liblearn-sidebar-tools">
              <button type="button"><span aria-hidden="true">▤</span><span>Notes</span>{notesCount > 0 && <small>{notesCount}</small>}</button>
              <button type="button"><span aria-hidden="true">☷</span><span>Module overview</span></button>
              <button type="button"><span aria-hidden="true">?</span><span>Help</span></button>
            </div>
          </aside>
        )}

        <main className="liblearn-topic-main">
          <div className="liblearn-topic-breadcrumb">
            <span>MODULE {moduleNumber}</span>
            <span>•</span>
            <span>{moduleTitle}</span>
          </div>

          {renderTopicContent()}
        </main>
      </div>

      <footer className={`liblearn-player-bottom${bottomBarOpen ? "" : " collapsed"}`}>
        <button
          type="button"
          className="liblearn-bottom-toggle"
          onClick={() => setBottomBarOpen((open) => !open)}
          aria-label={bottomBarOpen ? "Collapse progress bar" : "Expand progress bar"}
          aria-expanded={bottomBarOpen}
        >
          <span aria-hidden="true">{bottomBarOpen ? "⌄" : "⌃"}</span>
        </button>

        <div className="liblearn-bottom-progress">
          <div className="liblearn-progress-label">
            <strong>Module {moduleNumber} Progress</strong>
            <span>{progress}%</span>
          </div>
          <div className="liblearn-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
            <span style={{ width: progress + "%" }} />
          </div>
        </div>

        <div className="liblearn-learning-social">
          <span>You're learning with {Number(totalLearners).toLocaleString()} others - let's get learning.</span>
        </div>

        <button
          type="button"
          className="liblearn-previous-button"
          onClick={handlePrevious}
          disabled={currentSectionIndex <= 0 && currentTopicIndex <= 0}
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>

        <button type="button" className="liblearn-next-button" onClick={handleNext} disabled={progress >= 100 && currentSectionIndex >= topicSections.length - 1}>
          {progress >= 100 && currentSectionIndex >= topicSections.length - 1 ? "Completed" : "Next"}
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </div>
  );
}

export default LessonPage;
