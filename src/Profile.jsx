import { useEffect, useRef, useState } from "react";
import { getProfile, saveProfile } from "./profileStore.js";

function Profile({ session }) {
  const [profile, setProfile] = useState({ fullName: session?.fullName || "", studentId: "", username: "", profilePicture: "", educationLevel: "", classGrade: "", universityYear: "", courseProgram: "", subjects: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (!profile.fullName.trim() || !profile.studentId.trim() || !profile.username.trim() || !profile.educationLevel) {
      setError("Please complete your name, student ID, username, and education level.");
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

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <a href="/dashboard" className="auth-brand">LibLearn <span>Student profile</span></a>
        <div className="auth-heading"><span className="section-label">YOUR PROFILE</span><h1>Make it yours.</h1><p>Complete the details that help LibLearn personalise your learning experience.</p></div>
        {loading && <p className="auth-note" role="status">Loading your profile...</p>}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <label>Full name<input name="fullName" value={profile.fullName} onChange={updateField} /></label>
            <label>Student ID<input name="studentId" value={profile.studentId} onChange={updateField} placeholder="e.g. LL-2026-001" /></label>
            <label>Username<input name="username" value={profile.username} onChange={updateField} placeholder="Choose a username" /></label>
            <label>Profile picture URL<input name="profilePicture" value={profile.profilePicture} onChange={updateField} placeholder="Optional" /></label>
          </div>
          <label>Education level<select name="educationLevel" value={profile.educationLevel} onChange={updateField}><option value="">Select your level</option><option value="High School">High School</option><option value="University">University</option><option value="Other">Other</option></select></label>
          {profile.educationLevel === "High School" && <label>Class / grade<input name="classGrade" value={profile.classGrade} onChange={updateField} placeholder="e.g. Grade 10" /></label>}
          {profile.educationLevel === "University" && <div className="profile-form-grid"><label>University level / year<input name="universityYear" value={profile.universityYear} onChange={updateField} placeholder="e.g. Year 2" /></label><label>Course / program / field<input name="courseProgram" value={profile.courseProgram} onChange={updateField} /></label></div>}
          <label>Subjects / interests<textarea name="subjects" value={profile.subjects} onChange={updateField} placeholder="e.g. Biology, agriculture, public health" rows="3" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}{saved && <p className="auth-success" role="status">Profile saved.</p>}
          <div className="profile-actions"><a href="/dashboard">Cancel</a><button className="auth-submit" type="submit" disabled={loading || saving}>{saving ? "Saving..." : "Save profile"}</button></div>
        </form>
      </section>
    </main>
  );
}

export default Profile;
