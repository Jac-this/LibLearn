import { useState } from "react";
import { sendPasswordReset, updatePassword, validatePassword } from "./authStore.js";

function PasswordReset({ update, session }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (update && session === undefined) { setError("Preparing your secure password reset session..."); return; }
    if (update && !session) { setError("This password reset link is invalid or has expired."); return; }
    if (update) {
      const passwordError = validatePassword(password);
      if (passwordError) { setError(passwordError); return; }
    }
    if (update && password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!update && !email.trim()) { setError("Enter your email address."); return; }
    setLoading(true);
    const result = update ? await updatePassword(password) : await sendPasswordReset(email);
    setLoading(false);
    if (!result.ok) setError(result.error);
    else if (update) { setMessage("Password updated. You can sign in now."); setTimeout(() => { window.location.href = "/login"; }, 800); }
    else setMessage("Reset email sent. Check your inbox.");
  };

  return (
    <main className="auth-page"><section className="auth-panel"><a href="/" className="auth-brand">LibLearn <span>Learn. Grow. Lead.</span></a><div className="auth-heading"><span className="section-label">{update ? "NEW PASSWORD" : "ACCOUNT RECOVERY"}</span><h1>{update ? "Choose a new password." : "Reset your password."}</h1><p>{update ? "Set a new password for your LibLearn account." : "We will send a secure reset link to your email."}</p></div><form className="auth-form" onSubmit={submit}>{!update && <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>}{update && <><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></label><label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></label></>}{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? "Please wait..." : update ? "Update password" : "Send reset email"}</button></form><p className="auth-switch"><a href="/login">Back to sign in</a></p></section></main>
  );
}

export default PasswordReset;
