import { useEffect, useRef, useState } from "react";
import { roles, signOut } from "./authStore.js";
import { getProfile, saveProfile } from "./profileStore.js";

const roleLabels = {
  [roles.highSchoolStudent]: "High-School Student",
  [roles.universityStudent]: "University Student",
  [roles.teacher]: "Teacher",
};

function Profile({ session }) {
  const [profile, setProfile] = useState({ fullName: session?.fullName || "", studentId: "", username: "", profilePicture: "", educationLevel: "", classGrade: "", universityYear: "", courseProgram: "", subjects: "", role: null, institution: "", faculty: "", department: "", teachingLevel: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const dirtyRef = useRef(false);

  useEffect(() => {
    let active = true;
    dirtyRef.current = false;
    if (!session?.id) return () => { active = false; };
    getProfile(session.id).then((stored) => {
      if (!active) return;
      if (!dirtyRef.current) setProfile({ ...stored, fullName: stored.fullName || session.fullName });
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setError("Profile could not be loaded. Please refresh and try again.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [session?.id, session?.fullName]);

  if (!session) {
    return null;
  }

  const updateField = (event) => {
    setProfile({ ...profile, [event.target.name]: event.target.value });
    dirtyRef.current = true;
    setSaved(false);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!profile.fullName.trim() || !profile.username.trim() || !profile.role) {
      setError("Please complete your name, username, and role.");
      return;
    }
    if (profile.role === roles.highSchoolStudent && (!profile.studentId.trim() || !profile.classGrade.trim())) {
      setError("Please complete your student ID and Grade.");
      return;
    }
    if (profile.role === roles.universityStudent && (!profile.institution.trim() || !profile.department.trim() || !profile.universityYear.trim())) {
      setError("Please complete your university, department or program, and year or level.");
      return;
    }
    if (profile.role === roles.teacher && (!profile.institution.trim() || !profile.teachingLevel.trim() || !profile.subjects.trim())) {
      setError("Please complete your institution, teaching level, and subjects or courses.");
      return;
    }
    setSaving(true);
    saveProfile(profile, session.id).then((savedProfile) => {
      if (!savedProfile) setError("Profile could not be saved. Check your Supabase profile table.");
      else { setSaved(true); dirtyRef.current = false; }
      setSaving(false);
    }).catch(() => {
      setError("Profile could not be saved. Please try again.");
      setSaving(false);
    });
  };

  const handleSignOut = async () => {
    setSignOutError("");
    try {
      const result = await signOut();
      if (!result.ok) {
        setSignOutError(result.error || "Could not sign out. Please try again.");
        return;
      }
      window.location.href = "/";
    } catch {
      setSignOutError("Could not sign out. Please try again.");
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <a href="/dashboard" className="auth-brand">LibLearn <span>Student profile</span></a>
        <div className="auth-heading"><span className="section-label">YOUR PROFILE</span><h1>Make it yours.</h1><p>Complete the details that help LibLearn personalise your learning experience.</p></div>
        {loading && <p className="auth-note" role="status">Loading your profile...</p>}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <label>Full name<input name="fullName" value={profile.fullName} onChange={updateField} /></label>
            <label>Role<select name="role" value={profile.role || ""} onChange={updateField} disabled={Boolean(profile.role)}><option value="">Select your role</option><option value={roles.highSchoolStudent}>{roleLabels[roles.highSchoolStudent]}</option><option value={roles.universityStudent}>{roleLabels[roles.universityStudent]}</option><option value={roles.teacher}>{roleLabels[roles.teacher]}</option></select></label>
            {profile.role === roles.highSchoolStudent && <label>Student ID<input name="studentId" value={profile.studentId} onChange={updateField} placeholder="e.g. LL-2026-001" /></label>}
            <label>Username<input name="username" value={profile.username} onChange={updateField} placeholder="Choose a username" /></label>
            <label>Profile picture URL<input name="profilePicture" value={profile.profilePicture} onChange={updateField} placeholder="Optional" /></label>
          </div>
          <label>Education level<select name="educationLevel" value={profile.educationLevel} onChange={updateField}><option value="">Select your level</option><option value="High School">High School</option><option value="University">University</option><option value="Other">Other</option></select></label>
          {profile.role === roles.highSchoolStudent && <><label>Grade<select name="classGrade" value={profile.classGrade} onChange={updateField}><option value="">Select your Grade</option>{Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`).map((grade) => <option value={grade} key={grade}>{grade}</option>)}</select></label><label>School / institution<input name="institution" value={profile.institution} onChange={updateField} /></label><label>Subjects / interests<textarea name="subjects" value={profile.subjects} onChange={updateField} placeholder="e.g. Biology, agriculture, public health" rows="3" /></label></>}
          {profile.role === roles.universityStudent && <><label>University / institution<input name="institution" value={profile.institution} onChange={updateField} /></label><label>Faculty / college <span className="field-optional">Optional</span><input name="faculty" value={profile.faculty} onChange={updateField} /></label><label>Department / program<input name="department" value={profile.department} onChange={updateField} /></label><label>Year / level<input name="universityYear" value={profile.universityYear} onChange={updateField} /></label></>}
          {profile.role === roles.teacher && <><label>Teaching institution<input name="institution" value={profile.institution} onChange={updateField} /></label><label>Teaching level<input name="teachingLevel" value={profile.teachingLevel} onChange={updateField} /></label><label>Subjects / courses taught<textarea name="subjects" value={profile.subjects} onChange={updateField} rows="3" /></label></>}
          {error && <p className="auth-error" role="alert">{error}</p>}{saved && <p className="auth-success" role="status">Profile saved.</p>}
          {signOutError && <p className="auth-error" role="alert">{signOutError}</p>}
          <div className="profile-actions"><a href="/dashboard">Cancel</a><button className="auth-submit" type="submit" disabled={loading || saving}>{saving ? "Saving..." : "Save profile"}</button></div>
          <button className="profile-sign-out" type="button" onClick={handleSignOut}>Sign Out</button>
        </form>
      </section>
    </main>
  );
}

export default Profile;
