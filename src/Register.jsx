import { useState } from "react";
import { createAccount, roles, validatePassword } from "./authStore.js";

const roleOptions = [
  { value: roles.highSchoolStudent, label: "High-School Student", description: "Learn by Grade, subject, and lesson." },
  { value: roles.universityStudent, label: "University Student", description: "Organise courses, modules, and academic goals." },
  { value: roles.teacher, label: "Teacher", description: "Build a teaching and classroom workspace." },
];

const gradeOptions = Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`);

function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", role: "", classGrade: "", institution: "", faculty: "", department: "", universityYear: "", teachingLevel: "", subjects: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { fullName, email, password, confirmPassword, role } = form;

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !role) {
      setError("Please complete every field.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === roles.highSchoolStudent && !form.classGrade) {
      setError("Select your Grade.");
      return;
    }

    if (role === roles.universityStudent && (!form.institution.trim() || !form.department.trim() || !form.universityYear.trim())) {
      setError("Please add your university, department or program, and year or level.");
      return;
    }

    if (role === roles.teacher && (!form.institution.trim() || !form.teachingLevel.trim() || !form.subjects.trim())) {
      setError("Please add your institution, teaching level, and subjects or courses.");
      return;
    }

    setLoading(true);
    const result = await createAccount(form);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    window.location.href = "/login?registered=1";
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <a href="/" className="auth-brand">LibLearn <span>Learn. Grow. Lead.</span></a>
        <div className="auth-heading">
          <span className="section-label">JOIN THE COMMUNITY</span>
          <h1>Create your account.</h1>
          <p>Start building your learning journey with LibLearn.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <fieldset className="role-selector">
            <legend>How will you use LibLearn?</legend>
            <div className="role-options">
              {roleOptions.map((option) => <label className={`role-option ${form.role === option.value ? "selected" : ""}`} key={option.value}><input type="radio" name="role" value={option.value} checked={form.role === option.value} onChange={updateField} /><span><strong>{option.label}</strong><small>{option.description}</small></span></label>)}
            </div>
          </fieldset>
          <label>Full name<input name="fullName" value={form.fullName} onChange={updateField} autoComplete="name" /></label>
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" /></label>
          {form.role === roles.highSchoolStudent && <><label>Grade<select name="classGrade" value={form.classGrade} onChange={updateField}><option value="">Select your Grade</option>{gradeOptions.map((grade) => <option value={grade} key={grade}>{grade}</option>)}</select></label><label>School<input name="institution" value={form.institution} onChange={updateField} placeholder="Your school" /></label><label>Subjects / interests<textarea name="subjects" value={form.subjects} onChange={updateField} placeholder="e.g. Biology, agriculture, public health" rows="2" /></label></>}
          {form.role === roles.universityStudent && <><label>University / institution<input name="institution" value={form.institution} onChange={updateField} placeholder="Your university or institution" /></label><label>Faculty / college <span className="field-optional">Optional</span><input name="faculty" value={form.faculty} onChange={updateField} /></label><label>Department / program<input name="department" value={form.department} onChange={updateField} /></label><label>Year / level<input name="universityYear" value={form.universityYear} onChange={updateField} placeholder="e.g. Year 2" /></label></>}
          {form.role === roles.teacher && <><label>Teaching institution<input name="institution" value={form.institution} onChange={updateField} /></label><label>Teaching level<input name="teachingLevel" value={form.teachingLevel} onChange={updateField} placeholder="e.g. High School" /></label><label>Subjects / courses taught<textarea name="subjects" value={form.subjects} onChange={updateField} rows="2" /></label></>}
          <label>Password<input name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" /></label>
          <label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="auth-switch">Already have an account? <a href="/login">Sign in</a></p>
        <p className="auth-note">Your password is handled securely by Supabase.</p>
      </section>
    </main>
  );
}

export default Register;
