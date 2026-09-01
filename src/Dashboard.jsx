import { useEffect, useState } from "react";
import { roles, signOut } from "./authStore.js";
import { biologyCourse } from "./data/biologyLessons.js";
import { getCourseProgress } from "./progressStore.js";
import { getProfile, getProfileCompletion, saveProfile } from "./profileStore.js";

const roleLabels = {
  [roles.highSchoolStudent]: "High-School Student",
  [roles.universityStudent]: "University Student",
  [roles.teacher]: "Teacher",
};

function DashboardHeader({ label, onLogout, logoutError }) {
  return <header className="navbar dashboard-header"><a href="/" className="brand"><div className="brand-icon"><span></span><span></span><span></span><span></span><span></span></div><div><h2>LibLearn</h2><p>Learn. Grow. Lead.</p></div></a><nav className="nav-links"><a href="/">Home</a><a href="/courses">Learn</a><a href="/dashboard" className="dashboard-active">{label}</a><a href="/profile">Profile</a></nav><button className="dashboard-logout" onClick={onLogout}>Log out</button>{logoutError && <p className="auth-error" role="alert">{logoutError}</p>}</header>;
}

function RoleSelection({ session, profile, onSelected }) {
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveRole = async (event) => {
    event.preventDefault();
    if (!selectedRole) {
      setError("Choose how you will use LibLearn.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const savedProfile = await saveProfile({ ...profile, role: selectedRole }, session.id);
      if (!savedProfile) setError("Your role could not be saved. Please try again.");
      else onSelected(savedProfile);
    } catch {
      setError("Your role could not be saved. Please try again.");
    }
    setSaving(false);
  };

  return <main className="role-home-page"><section className="role-home-panel"><span className="section-label">WELCOME TO LIBLEARN</span><h1>Welcome to the new LibLearn experience.</h1><p>Tell us how you use LibLearn so we can shape your Home around you.</p><form className="role-options" onSubmit={saveRole}>{Object.entries(roleLabels).map(([value, label]) => <label className={`role-option ${selectedRole === value ? "selected" : ""}`} key={value}><input type="radio" name="dashboardRole" value={value} checked={selectedRole === value} onChange={(event) => setSelectedRole(event.target.value)} /><span><strong>{label}</strong><small>{value === roles.teacher ? "Teach, organise, and support learners." : value === roles.universityStudent ? "Study courses, modules, and academic goals." : "Learn by Grade, subject, and lesson."}</small></span></label>)}{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={saving}>{saving ? "Saving..." : "Continue to LibLearn"}</button></form></section></main>;
}

function PlaceholderCard({ title, text }) {
  return <article className="role-placeholder-card"><span className="section-label">COMING SOON</span><h2>{title}</h2><p>{text}</p></article>;
}

function RoleHome({ session, profile, role, onLogout, logoutError }) {
  const isTeacher = role === roles.teacher;
  const title = isTeacher ? "Your teaching workspace" : "Your university learning space";
  const description = isTeacher ? "A focused place to organise your teaching, classrooms, and learner support." : "A focused place to organise your courses, academic progress, and study life.";
  const cards = isTeacher
    ? [["My Classrooms", "Classroom management is being prepared."], ["My Students", "Student connections will appear here."], ["Create Lesson", "Lesson authoring tools are coming soon."], ["Student Progress", "Progress insights will be available here."]]
    : [["My Courses", "Your university courses and modules will appear here."], ["Continue Learning", "Your next academic lesson will appear here."], ["Academic Progress", "Course and module progress is coming soon."], ["Academic Resources", "Saved academic resources will appear here."]];

  const secondaryCards = isTeacher
    ? [["My Courses", "Teaching courses and subjects will be organised here."], ["Create Assignment", "Assignment tools are coming soon."], ["Resources", "Teaching resources will be available here."], ["Announcements", "Class announcements are coming soon."], ["Study Groups", "Class collaboration is coming soon."], ["AI Teaching Assistant", "Teaching support tools are coming soon."], ["Notifications", "Teaching notifications are coming soon."]]
    : [["Lecturers / Teachers", "Your lecturers and teachers will appear here."], ["Classrooms", "Your enrolled classrooms are coming soon."], ["Assignments", "Academic assignments are coming soon."], ["Study Groups", "Academic study groups are coming soon."], ["Study Reminders", "Personal study reminders are coming soon."], ["AI Tutor", "Your academic AI Tutor is coming soon."], ["Notifications", "Academic notifications are coming soon."]];

  return <div className="dashboard-page role-dashboard-page"><DashboardHeader label={isTeacher ? "Teaching Home" : "University Home"} onLogout={onLogout} logoutError={logoutError} /><main className="role-home-main"><section className="role-home-intro"><div><span className="section-label">{isTeacher ? "TEACHING WORKSPACE" : "UNIVERSITY HOME"}</span><h1>{title}, {profile.fullName || session.fullName}.</h1><p>{description}</p><small>{profile.institution || "Complete your profile to add your institution."}</small></div><div className="dashboard-profile"><span>{session.fullName.charAt(0).toUpperCase()}</span><div><strong>{roleLabels[role]}</strong><small>{session.email}</small></div></div></section><section className="role-home-grid">{cards.map(([cardTitle, text]) => <PlaceholderCard title={cardTitle} text={text} key={cardTitle} />)}</section><section className="role-home-grid secondary">{secondaryCards.map(([cardTitle, text]) => <PlaceholderCard title={cardTitle} text={text} key={cardTitle} />)}</section></main></div>;
}

function Dashboard({ session }) {
  const [profile, setProfile] = useState({ fullName: session.fullName, role: null, studentId: "", username: "", educationLevel: "", classGrade: "", subjects: "", institution: "", faculty: "", department: "", universityYear: "", teachingLevel: "" });
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [logoutError, setLogoutError] = useState("");
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");
  const totalLessons = biologyCourse.lessons.length;
  const profileCompletion = getProfileCompletion(profile);
  const nextLesson = progress ? Array.from({ length: totalLessons }, (_, index) => index + 1).find((lessonNumber) => !progress.completedLessons.includes(lessonNumber)) || null : null;
  const courseComplete = progress?.completedCount >= totalLessons;

  useEffect(() => {
    let active = true;
    if (!session?.id) {
      return () => { active = false; };
    }
    getProfile(session.id).then((storedProfile) => {
      if (active) setProfile((currentProfile) => ({ ...currentProfile, ...storedProfile, fullName: storedProfile.fullName || session.fullName }));
    }).catch(() => {
      if (active) setProfileError("Profile could not be loaded. Please try again later.");
    }).finally(() => {
      if (active) setProfileLoading(false);
    });
    return () => { active = false; };
  }, [session?.id, session?.fullName]);

  useEffect(() => {
    let active = true;
    if (!session?.id || profile.role !== roles.highSchoolStudent) return () => { active = false; };
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
  }, [session?.id, profile.role, totalLessons]);

  const handleLogout = async () => {
    setLogoutError("");
    const result = await signOut();
    if (!result.ok) {
      setLogoutError(result.error || "Could not sign out. Please try again.");
      return;
    }
    window.location.href = "/login";
  };

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

  if (profileLoading) return <main className="auth-page"><p>Loading your LibLearn Home...</p></main>;
  if (profileError) return <main className="auth-page"><p className="auth-error" role="alert">{profileError}</p></main>;
  if (!roleLabels[profile.role]) return <RoleSelection session={session} profile={profile} onSelected={setProfile} />;
  if (profile.role !== roles.highSchoolStudent) return <RoleHome session={session} profile={profile} role={profile.role} onLogout={handleLogout} logoutError={logoutError} />;

  const firstName = profile.fullName || session.fullName;
  const subjects = profile.subjects || "biology, science, and the world around you";

  return (
    <div className="dashboard-page">
      <DashboardHeader session={session} label="Student Home" onLogout={handleLogout} logoutError={logoutError} />

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

            <div className="dashboard-section-heading"><div><span className="section-label">YOUR LIBLEARN HOME</span><h2>More ways to learn</h2></div></div>
            <section className="dashboard-feature-strip"><PlaceholderCard title="AI Tutor" text="Your learning assistant is coming soon." /><PlaceholderCard title="Teachers & Classrooms" text="Teacher connections and classrooms are coming soon." /><PlaceholderCard title="Study Groups & Friends" text="Learning connections are coming soon." /><PlaceholderCard title="Study Reminders" text="Personal study reminders are coming soon." /></section>
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
