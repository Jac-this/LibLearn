import { useState } from "react";
import { signIn } from "./authStore.js";

function Login() {
  const params = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const registered = params.get("registered") === "1";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    const result = signIn(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    window.location.href = "/dashboard";
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
        {registered && <p className="auth-success" role="status">Account created. You can sign in now.</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email address<input name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} autoComplete="email" /></label>
          <label>Password<input name="password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoComplete="current-password" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit">Sign in</button>
        </form>
        <p className="auth-switch">New to LibLearn? <a href="/register">Create an account</a></p>
        <p className="auth-note">Prototype account storage uses this browser only.</p>
      </section>
    </main>
  );
}

export default Login;
