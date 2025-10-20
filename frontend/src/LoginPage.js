import React, { useState } from "react";
import { signInWithGoogle, signInAsDemoUser } from "./firebase";

// Refined styles with gradient buttons, shadows, smooth hover transitions, and better spacing
const loginStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  --shadow-color: rgba(0, 0, 0, 0.2);

  --google-blue-start: #4285f4;
  --google-blue-end: #3367d6;
  --demo-purple-start: #7b2ff7;
  --demo-purple-end: #ff00cc;

  --btn-radius: 0.5rem;
  --btn-padding: 0.85rem 1.75rem;
}

body, html, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: var(--font-sans);
  background: linear-gradient(135deg, #0d1b2a, #000814);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  background: rgba(255 255 255 / 0.05);
  backdrop-filter: blur(15px);
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0 0 0 / 0.75);
  padding: 3.5rem 3rem 3rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  color: white;
}

.login-container h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--demo-purple-start), var(--google-blue-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-container p {
  margin-bottom: 2.25rem;
  font-weight: 500;
  color: rgba(255 255 255 / 0.8);
}

.login-button {
  width: 100%;
  padding: var(--btn-padding);
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: var(--btn-radius);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  user-select: none;
  outline-offset: 2px;
}

.login-button:focus-visible {
  outline: 2px solid #fff;
}

.google-button {
  background: linear-gradient(90deg, var(--google-blue-start), var(--google-blue-end));
  box-shadow: 0 6px 15px rgba(66,133,244,0.7);
  color: white;
}

.google-button:hover:not(:disabled),
.demo-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.google-button:disabled {
  filter: brightness(0.85);
  cursor: not-allowed;
}

.demo-button {
  background: linear-gradient(90deg, var(--demo-purple-start), var(--demo-purple-end));
  box-shadow: 0 6px 15px rgba(123,47,247,0.8);
  color: white;
  border: 1.5px solid rgba(255 255 255 / 0.35);
}

.demo-button:disabled {
  filter: brightness(0.85);
  cursor: not-allowed;
}

.error-message {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #ff6b6b;
  font-weight: 600;
}

.loading-spinner {
  border: 3.5px solid rgba(255 255 255 / 0.3);
  border-top: 3.5px solid white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

// Icons remain same as before
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.55-.2-2.3H12v4.39h5.84a5.6 5.6 0 01-2.43 3.65v2.81h3.61c2.1-1.95 3.31-4.78 3.31-8.55z" fill="#FFFFFF"/>
    <path d="M12 23c3.04 0 5.57-1.01 7.42-2.75l-3.61-2.81c-.96.64-2.17 1.02-3.81 1.02-2.95 0-5.46-1.99-6.38-4.72H1.97v2.89A11.97 11.97 0 0012 23z" fill="#FFFFFF"/>
    <path d="M5.62 13.99c-.27-.79-.42-1.63-.42-2.49s.15-1.7.42-2.49V5.72H1.97a11.97 11.97 0 000 12.56l3.65-2.89z" fill="#FFFFFF"/>
    <path d="M12 4.67c1.64 0 3.12.56 4.29 1.66l3.22-3.22A11.66 11.66 0 0012 1.09c-3.04 0-5.57 1.01-6.38 4.72h3.61c.92-2.73 3.43-4.72 6.38-4.72z" fill="#FFFFFF"/>
  </svg>
);

const DemoUserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'white'}}>
    <path d="M12 2c-.9 0-1.8.3-2.5 1S8 5.1 8 6v1c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6c0-.9-.3-1.8-1-2.5S12.9 2 12 2z"></path>
    <path d="M12 10v11"></path>
    <path d="M16 16l-4 4-4-4"></path>
  </svg>
);

function LoginPage() {
  const [loading, setLoading] = useState(null); // 'google', 'guest' or null
  const [error, setError] = useState(null);
  const theme = "dark";

  const handleLogin = async (loginFunction, buttonType) => {
    if (loading !== null) return; // prevent multiple clicks
    setLoading(buttonType);
    setError(null);
    try {
      await loginFunction();
      // On success, your app should handle redirection or unmounting this component
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage =
        err.code === "auth/popup-closed-by-user"
          ? "Authentication cancelled or pop-up blocked."
          : "Login failed. Please check your connection or try again.";
      setError(errorMessage);
      setLoading(null);
    }
  };

  return (
    <div className={`login-container theme-${theme}`}>
      <style>{loginStyles}</style>
      <div>
        <h2>ThinkCode AI</h2>
        <p>Login easily with Google or explore as a guest</p>

        <button
          className="login-button google-button"
          onClick={() => handleLogin(signInWithGoogle, "google")}
          disabled={loading !== null && loading !== "google"}
          type="button"
        >
          {loading === "google" ? <div className="loading-spinner" /> : <GoogleIcon />}
          <span>Sign in with Google</span>
        </button>

        <button
          className="login-button demo-button"
          onClick={() => handleLogin(signInAsDemoUser, "guest")}
          disabled={loading !== null && loading !== "guest"}
          type="button"
        >
          {loading === "guest" ? <div className="loading-spinner" /> : <DemoUserIcon />}
          <span>Continue as Demo User</span>
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
