import React, { useState } from 'react';

// รองรับ: FR-LOG-01, FR-LOG-02, AC-LOG-01
export default function LoginPage({ client, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // รองรับ: FR-LOG-02, AC-LOG-01
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await client.login(username, password);
      onLoginSuccess(await response.json());
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ boxSizing: 'border-box', margin: '3rem auto', maxWidth: '28rem', padding: '1.5rem', width: '100%' }}>
      <h1>เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-username" style={{ display: 'block', marginBottom: '1rem' }}>
          ชื่อผู้ใช้
          <input
            autoComplete="username"
            id="login-username"
            name="username"
            onChange={(event) => setUsername(event.target.value)}
            required
            style={{ boxSizing: 'border-box', display: 'block', marginTop: '0.35rem', padding: '0.65rem', width: '100%' }}
            type="text"
            value={username}
          />
        </label>
        <label htmlFor="login-password" style={{ display: 'block', marginBottom: '1rem' }}>
          รหัสผ่าน
          <input
            autoComplete="current-password"
            id="login-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ boxSizing: 'border-box', display: 'block', marginTop: '0.35rem', padding: '0.65rem', width: '100%' }}
            type="password"
            value={password}
          />
        </label>
        {errorMessage && <p role="alert">{errorMessage}</p>}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </main>
  );
}
