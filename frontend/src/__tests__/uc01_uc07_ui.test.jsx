// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CommunityLocationPage from '../pages/CommunityLocationPage.jsx';
import ProjectApprovalPage from '../pages/ProjectApprovalPage.jsx';
import { createCommunityPrototypeClient } from '../api/ucPrototypeClients.js';
afterEach(cleanup);
it('AC-01: saves community and displays confirmation', async () => {
  render(<CommunityLocationPage demo client={createCommunityPrototypeClient()} />);
  await screen.findByRole('option', { name: /camp-/ });
  for (const [label, value] of [['ชื่อชุมชน', 'ชุมชนทดสอบ'], ['ชื่อผู้ดูแล', 'ผู้ดูแล'], ['เบอร์โทรศัพท์ติดต่อ', '0123456789']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'บันทึกข้อมูล' }));
  expect(await screen.findByRole('status')).toHaveProperty('textContent', 'บันทึกข้อมูลชุมชนสำเร็จ');
  expect(await screen.findByText(/ชุมชนทดสอบ —/)).toBeTruthy();
});
it('AC-07 / QR-01: committee cannot access faculty decision controls', async () => {
  const client = {
    status: async () => ({ project_name: 'โครงการทดสอบ', status: 'pending', viewer_role: 'committee', history: [] }),
    notifications: async () => [],
  };
  render(<ProjectApprovalPage client={client} />);
  fireEvent.change(screen.getByLabelText('รหัสโครงการ'), { target: { value: 'project-1' } });
  fireEvent.click(screen.getByRole('button', { name: 'ดูสถานะโครงการ' }));
  expect(await screen.findByText('โครงการทดสอบ')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'บันทึกผล' })).toBeNull();
});
