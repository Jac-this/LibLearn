import { useEffect, useState } from "react";
import { signOut } from "./authStore.js";
import { biologyCourse } from "./data/biologyLessons.js";
import { getCourseProgress } from "./progressStore.js";
import { getProfile, getProfileCompletion } from "./profileStore.js";

function Dashboard({ session }) {
  const [profile, setProfile] = useState(() => getProfileCompletion({}) && { fullName: session.fullName });
  const [profileError, setProfileError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");
  const totalLessons = biologyCourse.lessons.length;
  const profileCompletion = getProfileCompletion(profile);
  const nextLesson = progress ? Array.from({ length: totalLessons }, (_, index) => index + 1).find((lessonNumber) => !progress.completedLessons.includes(lessonNumber)) || null : null;
  const courseComplete = progress?.completedCount >= totalLessons;

  useEffect(() => {
    if (session?.id) getProfile(session.id).then(setProfile).catch(() => setProfileError("Profile could not be loaded. Please try again later."));
  }, [session?.id]);

  useEffect(() => {
    let active = true;
    if (!session?.id) return () => { active = false; };
    getCourseProgress("biology", totalLessons, session.id).then((result) => {
      if (!active) return;
      if (result.source === "error") setProgressError(result.error);
      else setProgress(result);
      setProgressLoading(false);
    }).catch(() => {
      if (!active) return;
      setProgressError("Progress could not be loaded. Please refresh and try again.");
      setProgressLoading(false);
    });
    return () => { active = false; };
  }, [session?.id, totalLessons]);

  const refreshProgress = () => {
    setProgressLoading(true);
    setProgressError("");
    getCourseProgress("biology", totalLessons, session.id).then((result) => {
      if (result.source === "error") setProgressError(result.error);
      else setProgress(result);
      setProgressLoading(false);
    }).catch(() => {
      setProgressError("Progress could not be loaded. Please refresh and try again.");
      setProgressLoading(false);
    });
  };

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    setLogoutError("");
    const result = await signOut();
    if (!result.ok) {
      setLogoutError(result.error || "Could not sign out. Please try again.");
      return;
    }
    window.location.href = "/login";
  };

  const firstName = profile.fullName || session.fullName;
  const subjects = profile.subjects || "biology, science, and the world around you";

  return (
    <div className="dashboard-page">
      <header className="navbar dashboard-header">
        <a href="/" className="brand">
          <div className="brand-icon"><span></span><span></span><span></span><span></span><span></span></div>
          <div><h2>LibLearn</h2><p>Learn. Grow. Lead.</p></div>
        </a>
        <nav className="nav-links"><a href="/">Home</a><a href="/courses">Courses</a><a href="/dashboard" className="dashboard-active">Dashboard</a></nav>
        <button className="dashboard-logout" onClick={handleLogout}>Log out</button>
        {logoutError && <p className="auth-error" role="alert">{logoutError}</p>}
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <div><span className="section-label">STUDENT DASHBOARD</span><h1>Welcome back, {firstName.split(" ")[0]}.</h1><p>{profile.educationLevel ? `${profile.educationLevel} learner · ` : ""}Keep building your knowledge, one lesson at a time.</p></div>
          <div className="dashboard-profile"><span>{session.fullName.charAt(0).toUpperCase()}</span><div><strong>{session.fullName}</strong><small>{session.email}</small></div></div>
        </section>

        {profileError && <p className="auth-error" role="alert">{profileError}</p>}
        {progressLoading && <p className="auth-note" role="status">Loading your progress...</p>}
        {progressError && <p className="auth-error" role="alert">{progressError}</p>}
        {progress?.source === "local" && <p className="auth-note" role="status">Showing locally saved progress. It has not synced to Supabase.</p>}

        <section className="dashboard-summary">
          <article><span>MY COURSES</span><strong>1</strong><small>Biology in progress</small></article>
          <article><span>LESSONS COMPLETE</span><strong>{progress ? `${progress.completedCount}/${totalLessons}` : "—"}</strong><small>Biology lessons</small></article>
          <article><span>COURSE PROGRESS</span><strong>{progress ? `${progress.percentage}%` : "—"}</strong><small>Keep going</small></article>
          <article><span>CERTIFICATES</span><strong>{courseComplete ? "1" : "0"}</strong><small>{courseComplete ? "Ready to view" : "Complete Biology"}</small></article>
        </section>

        {profileCompletion < 100 && <section className="profile-completion-banner"><div><span className="section-label">PROFILE SETUP</span><h2>Complete your profile</h2><p>Add a few details so we can tailor your learning experience.</p></div><div className="profile-completion-meter"><strong>{profileCompletion}%</strong><div><span style={{ width: `${profileCompletion}%` }}></span></div></div><a href="/profile">Complete profile →</a></section>}

        <section className="dashboard-grid">
          <div className="dashboard-primary-column">
            <div className="dashboard-section-heading"><div><span className="section-label">YOUR LEARNING</span><h2>My Courses</h2></div><a href="/courses">Browse courses →</a></div>
            <article className="dashboard-course-card">
              <div className="dashboard-course-cover"><span>{biologyCourse.icon}</span><small>{biologyCourse.category}</small></div>
              <div className="dashboard-course-info"><div className="dashboard-course-title"><div><span>HIGH SCHOOL · BEGINNER</span><h3>{biologyCourse.title}</h3></div><strong>{progress ? `${progress.percentage}%` : "—"}</strong></div><div className="dashboard-progress-bar"><div style={{ width: `${progress?.percentage || 0}%` }}></div></div><p>{progress ? `${progress.completedCount} of ${totalLessons} lessons completed` : "Progress is loading"}</p><a href={`/lesson?course=biology&lesson=${nextLesson || 1}`} onClick={refreshProgress}>{courseComplete ? "Review course →" : progress?.completedCount ? "Continue learning →" : "Start course →"}</a></div>
            </article>

            <div className="dashboard-section-heading"><div><span className="section-label">NEXT UP</span><h2>Continue learning</h2></div></div>
            <article className="dashboard-next-card"><span className="dashboard-next-number">{String(nextLesson || totalLessons).padStart(2, "0")}</span><div><small>{courseComplete ? "COURSE COMPLETE" : nextLesson ? `BIOLOGY · LESSON ${nextLesson}` : "PROGRESS LOADING"}</small><h3>{courseComplete ? "Review any lesson" : nextLesson ? biologyCourse.lessons[nextLesson - 1] : "Your next lesson"}</h3><p>{courseComplete ? "Your Biology certificate is ready to view." : "Return to your next incomplete lesson and keep your progress moving."}</p></div><a href={`/lesson?course=biology&lesson=${nextLesson || 1}`}>→</a></article>

            <div className="dashboard-section-heading"><div><span className="section-label">FOR YOU</span><h2>Recommended next</h2></div></div>
            <article className="dashboard-recommendation"><span>✦</span><div><small>BASED ON YOUR PROFILE</small><h3>Keep exploring {subjects.split(",")[0]}.</h3><p>Biology builds a strong foundation for health, agriculture, and environmental learning.</p></div><a href="/courses">Explore →</a></article>
          </div>

          <aside className="dashboard-side-column">
            <section className="dashboard-panel"><div className="dashboard-panel-heading"><h2>Profile</h2><span>{profileCompletion}% COMPLETE</span></div><div className="profile-detail"><strong>{profile.username ? `@${profile.username}` : session.fullName}</strong><small>{profile.educationLevel || "Education level not set"}</small><small>{session.email}</small></div><a href="/profile" className="dashboard-secondary-action">Edit profile →</a></section>
            <section className="dashboard-panel certificate-panel"><div className="dashboard-panel-heading"><h2>Certificates</h2><span>ACHIEVEMENTS</span></div><div className={`certificate-status ${courseComplete ? "earned" : "locked"}`}><strong>{courseComplete ? "Biology Certificate" : "Certificate locked"}</strong><p>{courseComplete ? `You completed all ${totalLessons} Biology lessons.` : `Complete all ${totalLessons} Biology lessons to unlock your certificate.`}</p></div><span className="dashboard-secondary-action">{courseComplete ? "Certificate available soon" : progress ? `${totalLessons - progress.completedCount} lessons remaining` : "Progress loading"}</span></section>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
