import { useState } from "react";
import { resendVerification, sendPasswordReset, signIn } from "./authStore.js";

function Login() {
  const params = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const registered = params.get("registered") === "1";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    window.location.href = "/dashboard";
  };

  const handleResend = async () => {
    setLoading(true);
    const result = await resendVerification(email);
    setLoading(false);
    if (!result.ok) setError(result.error);
    else setMessage("Verification email sent. Check your inbox.");
  };

  const handleReset = async () => {
    if (!email.trim()) { setError("Enter your email first."); return; }
    setLoading(true);
    const result = await sendPasswordReset(email);
    setLoading(false);
    if (!result.ok) setError(result.error);
    else setMessage("Password reset email sent. Check your inbox.");
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <a href="/" className="auth-brand">LibLearn <span>Learn. Grow. Lead.</span></a>
        <div className="auth-heading">
          <span className="section-label">WELCOME BACK</span>
          <h1>Sign in to learn.</h1>
          <p>Continue your learning journey with LibLearn.</p>
        </div>
        {registered && <p className="auth-success" role="status">Account created. Verify your email, then sign in.</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email address<input name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} autoComplete="email" /></label>
          <label>Password<input name="password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoComplete="current-password" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Please wait..." : "Sign in"}</button>
        </form>
        {error.toLowerCase().includes("verify") && <button className="auth-text-action" onClick={handleResend} disabled={loading}>Resend verification email</button>}
        <button className="auth-text-action" onClick={handleReset} disabled={loading}>Forgot password?</button>
        <p className="auth-switch">New to LibLearn? <a href="/register">Create an account</a></p>
        <p className="auth-note">Authentication is handled securely by Supabase.</p>
      </section>
    </main>
  );
}

export default Login;
