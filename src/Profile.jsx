import { useEffect, useState } from "react";
import { roles, signOut } from "./authStore.js";
import { getProfile, saveProfile } from "./profileStore.js";

const roleLabels = {
  [roles.highSchoolStudent]: "High-School Student",
  [roles.universityStudent]: "University Student",
  [roles.teacher]: "Teacher",
};

const emptyProfile = {
  fullName: "", studentId: "", username: "", profilePicture: "", educationLevel: "",
  classGrade: "", universityYear: "", courseProgram: "", subjects: "", role: null,
  institution: "", faculty: "", department: "", teachingLevel: "",
};

function ThemeSetting() {
  const [theme, setTheme] = useState(() => localStorage.getItem("liblearn-theme") || "dark");
  useEffect(() => {
    try {
      localStorage.setItem("liblearn-theme", theme);
      const apply = () => {
        const dark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
        document.documentElement.dataset.theme = theme === "system" ? (dark ? "dark" : "default") : theme;
      };
      apply();
      const media = window.matchMedia?.("(prefers-color-scheme: dark)");
      media?.addEventListener?.("change", apply);
      return () => media?.removeEventListener?.("change", apply);
    } catch {}
  }, [theme]);
  return <div className="settings-choice-group">{["dark", "default"].map((option) => <button type="button" key={option} className={theme === option ? "active" : ""} onClick={() => setTheme(option)}>{option === "default" ? "White mode" : "Dark mode"}</button>)}</div>;
}

function Profile({ session }) {
  const view = new URLSearchParams(window.location.search).get("view") || "home";
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!session?.id) return () => { active = false; };
    getProfile(session.id).then((stored) => {
      if (active) setProfile({ ...emptyProfile, ...stored, fullName: stored.fullName || session.fullName });
    }).catch(() => active && setError("Profile could not be loaded. Please refresh and try again."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [session?.id, session?.fullName]);

  if (!session) return null;

  const updateField = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage(""); setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await saveProfile(profile, session.id);
      if (!result) setError("Profile could not be saved. Please try again.");
      else { setProfile({ ...emptyProfile, ...result }); setMessage("Profile saved."); }
    } catch { setError("Profile could not be saved. Please try again."); }
    finally { setSaving(false); }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.ok) window.location.href = "/";
    else setError(result.error || "Could not sign out. Please try again.");
  };

  if (loading) return <main className="profile-page"><section className="profile-panel"><p>Loading your profile...</p></section></main>;

  if (view === "edit") {
    return <main className="profile-page"><section className="profile-panel">
      <a href="/profile" className="auth-brand">LibLearn <span>Profile</span></a>
      <div className="profile-side-layout">
        <aside className="profile-side"><span className="section-label">PROFILE</span><a href="/profile" className="active">Overview</a><a href="/profile?view=edit">Edit profile</a><a href="/profile?view=personalization">Personalization</a><a href="/profile?view=settings">Settings</a></aside>
        <div className="profile-main-content"><div className="auth-heading"><span className="section-label">EDIT PROFILE</span><h1>Make it yours.</h1><p>Update the details you want LibLearn to use when shaping your learning experience.</p></div>
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-avatar-editor"><div className="profile-avatar-large">{profile.profilePicture ? <img src={profile.profilePicture} alt="" /> : (profile.fullName || session.fullName || "L").charAt(0).toUpperCase()}</div><label>Profile picture URL<input name="profilePicture" value={profile.profilePicture || ""} onChange={updateField} placeholder="Optional image URL" /></label></div>
            <label>Full name<input name="fullName" value={profile.fullName || ""} onChange={updateField} /></label>
            <label>Username<input name="username" value={profile.username || ""} onChange={updateField} placeholder="Choose a username" /></label>
            <label>Email<input value={session.email} disabled /></label>
            <div className="profile-form-grid">
              <label>Education level<select name="educationLevel" value={profile.educationLevel || ""} onChange={updateField}><option value="">Not set</option><option value="High School">High School</option><option value="University">University</option><option value="Other">Other</option></select></label>
              {profile.role === roles.highSchoolStudent && <><label>Grade<select name="classGrade" value={profile.classGrade || ""} onChange={updateField}><option value="">Not set</option>{Array.from({length:12},(_,i)=><option key={i} value={`Grade ${i+1}`}>Grade {i+1}</option>)}</select></label><label>Student ID<input name="studentId" value={profile.studentId || ""} onChange={updateField} /></label></>}
              {profile.role === roles.universityStudent && <><label>University / institution<input name="institution" value={profile.institution || ""} onChange={updateField} /></label><label>Faculty / college<input name="faculty" value={profile.faculty || ""} onChange={updateField} /></label><label>Department / program<input name="department" value={profile.department || ""} onChange={updateField} /></label><label>Year / level<input name="universityYear" value={profile.universityYear || ""} onChange={updateField} /></label></>}
              {profile.role === roles.teacher && <><label>Teaching institution<input name="institution" value={profile.institution || ""} onChange={updateField} /></label><label>Teaching level<input name="teachingLevel" value={profile.teachingLevel || ""} onChange={updateField} /></label></>}
            </div>
            <label>Subjects / interests<textarea name="subjects" value={profile.subjects || ""} onChange={updateField} rows="3" /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}
            <div className="profile-actions"><a href="/profile">Cancel</a><button className="auth-submit" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></div>
          </form>
        </div>
      </div>
    </section></main>;
  }

  if (view === "settings") {
    return <main className="profile-page"><section className="profile-panel"><a href="/profile" className="auth-brand">LibLearn <span>Profile</span></a><div className="profile-side-layout"><aside className="profile-side"><span className="section-label">PROFILE</span><a href="/profile">Overview</a><a href="/profile?view=edit">Edit profile</a><a href="/profile?view=personalization">Personalization</a><a href="/profile?view=settings" className="active">Settings</a></aside><div className="profile-main-content"><div className="auth-heading"><span className="section-label">SETTINGS</span><h1>Your study space.</h1><p>Control how LibLearn looks and behaves for you.</p></div><section className="settings-section"><h2>Appearance</h2><p>Choose the theme you want to use across LibLearn.</p><ThemeSetting /></section><section className="settings-section"><h2>Account</h2><p>Manage your account session.</p><button className="profile-sign-out" type="button" onClick={handleSignOut}>Sign out</button></section><section className="settings-section"><h2>Privacy</h2><p>Your learning progress and profile information are used to provide your LibLearn experience. More privacy controls will be added as these features are built.</p></section></div></div></section></main>;
  }

  if (view === "personalization") {
    return <main className="profile-page"><section className="profile-panel"><a href="/profile" className="auth-brand">LibLearn <span>Profile</span></a><div className="profile-side-layout"><aside className="profile-side"><span className="section-label">PROFILE</span><a href="/profile">Overview</a><a href="/profile?view=edit">Edit profile</a><a href="/profile?view=personalization" className="active">Personalization</a><a href="/profile?view=settings">Settings</a></aside><div className="profile-main-content"><div className="auth-heading"><span className="section-label">PERSONALIZATION</span><h1>Learn your way.</h1><p>These controls will shape how LibLearn adapts lessons, recommendations, and future AI learning support.</p></div><section className="settings-section"><h2>Learning preferences</h2><p>Personalization controls are being prepared. Your profile and learning progress will become part of the adaptive learning experience as the learning engine grows.</p></section><section className="settings-section"><h2>Future AI learning</h2><p>When LibLearn AI is introduced, you will be able to choose how much explanation, practice, depth, and context you want.</p></section></div></div></section></main>;
  }

  return <main className="profile-page"><section className="profile-panel"><a href="/dashboard" className="auth-brand">LibLearn <span>Your profile</span></a><div className="profile-side-layout"><aside className="profile-side"><span className="section-label">PROFILE</span><a href="/profile" className="active">Overview</a><a href="/profile?view=edit">Edit profile</a><a href="/profile?view=personalization">Personalization</a><a href="/profile?view=settings">Settings</a></aside><div className="profile-main-content"><div className="auth-heading"><span className="section-label">YOUR PROFILE</span><h1>{profile.fullName || session.fullName}</h1><p>{profile.username ? `@${profile.username}` : "Your LibLearn profile"}</p></div><div className="profile-overview-card"><div className="profile-avatar-large">{profile.profilePicture ? <img src={profile.profilePicture} alt="" /> : (profile.fullName || session.fullName || "L").charAt(0).toUpperCase()}</div><div><strong>{roleLabels[profile.role] || "LibLearn learner"}</strong><span>{profile.institution || profile.educationLevel || "Profile details not set yet"}</span><span>{session.email}</span></div></div><div className="profile-option-list"><a href="/profile?view=edit"><strong>Edit profile</strong><small>Names, username, profile picture, education and other details.</small><span>→</span></a><a href="/profile?view=personalization"><strong>Personalization</strong><small>Learning preferences and future adaptive learning controls.</small><span>→</span></a><a href="/profile?view=settings"><strong>Settings</strong><small>Appearance, account, privacy and other preferences.</small><span>→</span></a></div><button className="profile-sign-out" type="button" onClick={handleSignOut}>Sign out</button></div></div></section></main>;
}

export default Profile;