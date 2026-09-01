import { useState } from "react";
import { createAccount, validatePassword } from "./authStore.js";

function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { fullName, email, password, confirmPassword } = form;

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
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

    setLoading(true);
    const result = await createAccount({ fullName, email, password });
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
          <label>Full name<input name="fullName" value={form.fullName} onChange={updateField} autoComplete="name" /></label>
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" /></label>
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
