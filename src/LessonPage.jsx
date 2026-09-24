import { useEffect, useMemo, useState } from "react";
import "./LessonPage.css";

function LessonPage({
  moduleTitle,
  topicTitle,
  learningOutcomes = [],
  currentProgress = 0,
  totalLearners = 0,
  xp = 0,
  type = "learning-outcomes",
  onNext,
  totalTopics = 5,
  topics = [],
  currentTopicIndex = 0,
  onTopicSelect,
  moduleNumber = 1,
  notesCount = 0,
  showCertificate = true,
}) {
  const [progress, setProgress] = useState(() => Math.max(0, Math.min(100, Number(currentProgress) || 0)));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const safeTopics = useMemo(
    () => (Array.isArray(topics) ? topics : []).filter(Boolean),
    [topics],
  );

  useEffect(() => {
    setProgress(Math.max(0, Math.min(100, Number(currentProgress) || 0)));
  }, [currentProgress]);

  const nextProgress = Math.min(
    100,
    progress + Math.max(1, Math.round(100 / Math.max(1, Number(totalTopics) || 5))),
  );

  const handleNext = () => {
    setProgress(nextProgress);
    onNext?.({
      progress: nextProgress,
      currentTopicIndex: currentTopicIndex + 1,
    });
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
                    {index + 1}
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

    return (
      <section className="liblearn-topic-content">
        <h1>{topicTitle}</h1>
        <div className="liblearn-topic-placeholder">
          <span>LEARNING TOPIC</span>
          <p>This topic is ready for its course-specific learning content.</p>
        </div>
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
            <strong>{moduleTitle}</strong>
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

            {safeTopics.length > 0 ? (
              <nav className="liblearn-topic-list">
                {safeTopics.map((topic, index) => {
                  const title = typeof topic === "string" ? topic : topic?.title;
                  const topicType = typeof topic === "object" ? topic?.type : undefined;
                  const isCurrent = index === currentTopicIndex;

                  return (
                    <button
                      type="button"
                      key={topic?.id || title || index}
                      className={isCurrent ? "current" : index < currentTopicIndex ? "completed" : ""}
                      onClick={() => onTopicSelect?.(topic, index)}
                    >
                      <span className="liblearn-topic-number">{index + 1}</span>
                      <span>
                        <strong>{title || "Topic " + (index + 1)}</strong>
                        {topicType && <small>{topicType.replaceAll("-", " ")}</small>}
                      </span>
                    </button>
                  );
                })}
              </nav>
            ) : (
              <div className="liblearn-sidebar-placeholder">
                <span>MODULE CONTENT</span>
                <p>Topics will appear here as the course is published.</p>
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

      <footer className="liblearn-player-bottom">
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
          <span>You're learning with {Number(totalLearners).toLocaleString()} others</span>
          <span className="liblearn-social-separator">·</span>
          <span>let's get learning.</span>
        </div>

        <button type="button" className="liblearn-next-button" onClick={handleNext} disabled={progress >= 100}>
          {progress >= 100 ? "Completed" : "Next"}
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </div>
  );
}

export default LessonPage;
