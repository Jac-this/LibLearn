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

  const handlePrevious = () => {
    if (currentTopicIndex <= 0) return;
    setProgress(previousProgress);
    onPrevious?.({
      progress: previousProgress,
      currentTopicIndex: currentTopicIndex - 1,
    });
  };

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

    const content = Array.isArray(topic?.content) ? topic.content : [];
    return (
      <section className="liblearn-topic-content">
        <h1>{topicTitle}</h1>
        {content.length ? (
          <div className="liblearn-topic-reading">
            {content.map((item, index) => (
              <section key={item?.heading || index}>
                {item?.heading && <h2>{item.heading}</h2>}
                {item?.text && <p>{item.text}</p>}
              </section>
            ))}
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
                      className={isCurrent ? "current" : index < currentTopicIndex ? "completed" : "locked"}
                      onClick={() => { if (index <= currentTopicIndex) onTopicSelect?.(topic, index); }}
                      disabled={index > currentTopicIndex}
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
          disabled={currentTopicIndex <= 0}
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>

        <button type="button" className="liblearn-next-button" onClick={handleNext} disabled={progress >= 100}>
          {progress >= 100 ? "Completed" : "Next"}
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </div>
  );
}

export default LessonPage;
