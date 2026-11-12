import React, { useEffect, useState } from 'react';
import { communityClient } from '../api/communityClient.js';
import { prototypeIds } from '../api/ucPrototypeClients.js';

// UC-01 FR-01-01..05, AF-01-01, AC-01, QR-02; server enforces C-01.
const EMPTY = {
  community_name: '', caretaker_name: '', caretaker_title: '',
  contact_phone: '', local_rules: '',
};

export default function CommunityLocationPage({ client = communityClient, demo = false }) {
  const [locationId, setLocationId] = useState(demo ? prototypeIds.locationId : '');
  const [records, setRecords] = useState([]);
  const [fields, setFields] = useState(EMPTY);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // FR-01-02 / C-01: the server exposes only locations assigned to this user.
  useEffect(() => {
    let active = true;
    client.locations()
      .then(rows => {
        if (!active) return;
        setLocations(rows);
        if (!rows.length) setError('ยังไม่มีสถานที่ค่ายที่ได้รับมอบหมาย');
      })
      .catch(cause => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoadingLocations(false); });
    return () => { active = false; };
  }, [client]);

  async function load(event) {
    event?.preventDefault();
    setError(''); setMessage('');
    if (!locationId.trim()) return setError('กรุณาระบุสถานที่ค่าย');
    setRecords([]);
    setBusy(true);
    try {
      setRecords(await client.list(locationId.trim()));
    } catch (cause) {
      setError(cause.message);
    } finally { setBusy(false); }
  }

  async function submit(event) {
    event.preventDefault(); setError(''); setMessage('');
    if (!locationId.trim() || !fields.community_name.trim()
        || !fields.caretaker_name.trim() || !fields.contact_phone.trim()) {
      return setError('กรุณากรอกสถานที่ค่าย ชื่อชุมชน ชื่อผู้ดูแล และเบอร์ติดต่อ');
    }
    setBusy(true);
    try {
      if (editingId) {
        await client.update(editingId, fields);
      } else {
        await client.create({ ...fields, location_id: locationId.trim() });
      }
      setMessage('บันทึกข้อมูลชุมชนสำเร็จ');
      setRecords(await client.list(locationId.trim()));
      setEditingId(''); setFields(EMPTY);
    } catch (cause) {
      setError(cause.message);
    } finally { setBusy(false); }
  }

  // Prevent records or edit fields from a previously selected camp leaking into another view.
  function changeLocation(event) {
    setLocationId(event.target.value);
    setRecords([]);
    setEditingId('');
    setFields(EMPTY);
    setMessage('');
    setError('');
  }

  function edit(row) {
    setEditingId(row.community_id);
    setFields(Object.fromEntries(Object.keys(EMPTY).map(key => [key, row[key] ?? ''])));
    setMessage(''); setError('');
  }

  return (
    <main className="uc-page">
      <span className="uc-tag">UC-01 · Community Location</span>
      <h1>จัดการข้อมูลสถานที่และชุมชน</h1>
      <p className="uc-helper">บันทึกข้อมูลชุมชน ผู้ดูแลพื้นที่ และข้อปฏิบัติของสถานที่ค่ายที่รับผิดชอบ</p>
      <form onSubmit={load}>
        <label htmlFor="uc01-location">สถานที่ค่ายที่รับผิดชอบ</label>
        <select id="uc01-location" value={locationId}
          onChange={changeLocation} disabled={busy || loadingLocations} required>
          <option value="">-- เลือกสถานที่ค่าย --</option>
          {locations.map(row => (
            <option key={row.location_id} value={row.location_id}>
              {row.location_name} ({row.location_id})
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy || loadingLocations || !locationId}>แสดงข้อมูลชุมชน</button>
      </form>
      <form onSubmit={submit}>
        <h2>{editingId ? 'แก้ไขข้อมูลชุมชน' : 'บันทึกข้อมูลชุมชน'}</h2>
        {[
          ['community_name', 'ชื่อชุมชน', true],
          ['caretaker_name', 'ชื่อผู้ดูแล', true],
          ['caretaker_title', 'ตำแหน่งผู้ดูแล', false],
          ['contact_phone', 'เบอร์โทรศัพท์ติดต่อ', true],
        ].map(([key, label, required]) => (
          <div key={key}>
            <label htmlFor={key}>{label}</label>
            <input id={key} value={fields[key]} required={required}
              onChange={event => setFields({ ...fields, [key]: event.target.value })} />
          </div>
        ))}
        <label htmlFor="local_rules">ข้อปฏิบัติชุมชน</label>
        <textarea id="local_rules" value={fields.local_rules}
          onChange={event => setFields({ ...fields, local_rules: event.target.value })} />
        <button type="submit" disabled={busy || loadingLocations || !locationId}>{editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(''); setFields(EMPTY); }}>ยกเลิก</button>}
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <h2>รายการชุมชนของสถานที่นี้</h2>
      <ul>{records.map(row => (
        <li key={row.community_id}>
          {row.community_name} — {row.caretaker_name} ({row.contact_phone})
          <button type="button" onClick={() => edit(row)}>แก้ไข</button>
        </li>
      ))}</ul>
    </main>
  );
}
