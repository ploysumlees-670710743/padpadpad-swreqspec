import React, { useState } from 'react';
import './LoginPage.css';

// รองรับ: FR-LOG-01, FR-LOG-02, FR-LOG-06, FR-LOG-07, AC-LOG-01, AC-LOG-02, AC-LOG-03
export default function LoginPage({ client, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // รองรับ: FR-LOG-02, FR-LOG-06, FR-LOG-07, AC-LOG-01, AC-LOG-02, AC-LOG-03
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await client.login(username, password);
      onLoginSuccess(await response.json());
    } catch (error) {
      setErrorMessage(
        error.status === 401
          ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
          : error.status === 403
            ? 'บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานระบบ'
          : error.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-decoration login-decoration-top" aria-hidden="true" />
      <div className="login-decoration login-decoration-bottom" aria-hidden="true" />
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand-panel">
          <div className="login-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 5.5 39 11v11.2c0 9.2-6.1 16.8-15 20.3-8.9-3.5-15-11.1-15-20.3V11l15-5.5Z" />
              <path d="m17.5 23.8 4.3 4.3 9-9" />
            </svg>
          </div>
          <p className="login-eyebrow">CAMPUS ACCESS</p>
          <h1 id="login-title">เข้าสู่ระบบ</h1>
          <p className="login-welcome">
            ยินดีต้อนรับ
            <br />
            เข้าสู่ระบบกิจกรรมของคุณ
          </p>
          <p className="login-brand-caption">
            เข้าถึงเมนูและบริการต่าง ๆ
            <br />
            ตามบทบาทของคุณได้ที่นี่
          </p>
          <div className="login-leaf login-leaf-one" aria-hidden="true" />
          <div className="login-leaf login-leaf-two" aria-hidden="true" />
          <div className="login-orbit login-orbit-one" aria-hidden="true" />
          <div className="login-orbit login-orbit-two" aria-hidden="true" />
        </div>

        <div className="login-form-panel">
          <div className="login-form-heading">
            <p className="login-form-eyebrow">ยินดีต้อนรับกลับ</p>
            <h2>ลงชื่อเข้าใช้</h2>
            <p>กรอกข้อมูลบัญชีของคุณเพื่อดำเนินการต่อ</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field" htmlFor="login-username">
              <span>ชื่อผู้ใช้</span>
              <span className="login-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.25" />
                  <path d="M5.5 19c.5-3.1 2.8-4.8 6.5-4.8s6 1.7 6.5 4.8" />
                </svg>
                <input
                  autoComplete="username"
                  id="login-username"
                  name="username"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                  type="text"
                  value={username}
                />
              </span>
            </label>
            <label className="login-field" htmlFor="login-password">
              <span>รหัสผ่าน</span>
              <span className="login-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5.25" y="10" width="13.5" height="10" rx="2.2" />
                  <path d="M8.25 10V7.25a3.75 3.75 0 0 1 7.5 0V10M12 14v2.5" />
                </svg>
                <input
                  autoComplete="current-password"
                  id="login-password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  required
                  type="password"
                  value={password}
                />
              </span>
            </label>
            {errorMessage && (
              <p className="login-error" role="alert">
                {errorMessage}
              </p>
            )}
            <button className="login-submit" disabled={isSubmitting} type="submit">
              <span>{isSubmitting ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}</span>
              {!isSubmitting && (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h13m-5-5 5 5-5 5" />
                </svg>
              )}
            </button>
            <p className="login-secure-note">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2.5 16 4.7v4.5c0 3.7-2.4 6.7-6 8.1-3.6-1.4-6-4.4-6-8.1V4.7l6-2.2Z" />
                <path d="m7.5 9.8 1.7 1.7 3.4-3.6" />
              </svg>
              ระบบรักษาความปลอดภัยของบัญชีผู้ใช้
            </p>
          </form>
        </div>
      </section>
      <p className="login-footer">ระบบกิจกรรมสำหรับนักศึกษา คณะกรรมการ และอาจารย์</p>
    </main>
  );
}
