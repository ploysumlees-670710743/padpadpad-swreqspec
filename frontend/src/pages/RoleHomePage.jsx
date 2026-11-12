import React from 'react';

// รองรับ: FR-LOG-05, AC-LOG-01
export default function RoleHomePage({ home }) {
  return (
    <main style={{ boxSizing: 'border-box', margin: '3rem auto', maxWidth: '48rem', padding: '1.5rem', width: '100%' }}>
      <h1>หน้าหลัก</h1>
      <p>{home.username}</p>
      <ul>
        {home.menu.map((menuItem) => (
          <li key={menuItem}>{menuItem}</li>
        ))}
      </ul>
    </main>
  );
}
