// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';

import App, { ApiClientContext } from '../App.jsx';
import { createApiClient } from '../api/client.js';

describe('test_frontend_bootstrap', () => {
  it('uses the Development Demo API without sending requests to the Backend', async () => {
    const fetchImpl = vi.fn();
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    vi.stubGlobal('fetch', fetchImpl);
    const { unmount } = render(<App />);

    try {
      expect(screen.getByText('Demo Mode — ข้อมูลจำลอง')).toBeTruthy();
      expect(await screen.findByLabelText('ชื่อ-นามสกุล')).toBeTruthy();
      expect(fetchImpl).not.toHaveBeenCalled();
    } finally {
      unmount();
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    }
  });

  it('renders the React app and allows a screen test to inject a mocked API client', () => {
    const mockedClient = {
      getConfiguredCamp: vi.fn(),
      getDraft: vi.fn(),
      saveDraft: vi.fn(),
    };

    function ClientProbe() {
      const client = useContext(ApiClientContext);
      return <output>{client === mockedClient ? 'mock-client' : 'different-client'}</output>;
    }

    render(
      <App client={mockedClient}>
        <ClientProbe />
      </App>,
    );

    expect(screen.getByText('mock-client')).toBeTruthy();
  });

  it('calls the configured-camp and single-camp draft API routes', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const client = createApiClient({ baseUrl: '/api', fetchImpl });
    const formData = { full_name: 'Applicant' };

    await client.getConfiguredCamp();
    await client.getDraft();
    await client.saveDraft(formData);

    expect(fetchImpl).toHaveBeenNthCalledWith(1, '/api/enrollment/camp', {
      credentials: 'include',
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/api/applications/draft', {
      credentials: 'include',
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(3, '/api/applications/draft', {
      credentials: 'include',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_data: formData }),
    });
  });

  it('reports API errors instead of returning a success-shaped fallback', async () => {
    const client = createApiClient({
      fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    });

    await expect(client.getConfiguredCamp()).rejects.toThrow(
      'API request failed with status 503.',
    );
  });
});
