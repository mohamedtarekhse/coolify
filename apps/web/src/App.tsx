import { useEffect, useState } from 'react';

import { fetchJson } from './lib/api';

type HealthResponse = {
  ok: boolean;
  service: string;
  timestamp: string;
};

type MetaResponse = {
  app: string;
  phase: string;
  stack: string[];
  modules: string[];
  referenceData: {
    userRoles: string[];
    assetStatuses: string[];
    certificateTypes: string[];
  };
};

type AuthBootstrapResponse = {
  enabled: boolean;
  message: string;
};

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [auth, setAuth] = useState<AuthBootstrapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [healthData, metaResponse, authResponse] = await Promise.all([
          fetchJson<HealthResponse>('/health'),
          fetchJson<{ success: boolean; data: MetaResponse }>('/api/meta'),
          fetchJson<{ success: boolean; data: AuthBootstrapResponse }>('/api/auth/bootstrap'),
        ]);

        if (!active) return;
        setHealth(healthData);
        setMeta(metaResponse.data);
        setAuth(authResponse.data);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to reach API');
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const runtimeCards = [
    {
      label: 'API health',
      value: health?.ok ? 'Online' : 'Waiting',
      tone: health?.ok ? 'text-teal' : 'text-sand/60',
      detail: health?.timestamp || 'No response yet',
    },
    {
      label: 'Auth bootstrap',
      value: auth?.enabled ? 'Configured' : 'Missing JWT secret',
      tone: auth?.enabled ? 'text-rust' : 'text-sand/60',
      detail: auth?.message || 'Auth module not queried yet',
    },
    {
      label: 'Loaded modules',
      value: meta ? String(meta.modules.length) : '0',
      tone: 'text-sand',
      detail: meta ? meta.modules.join(', ') : 'Waiting for API metadata',
    },
  ];

  return (
    <main className="min-h-screen bg-ink text-sand">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,91,45,0.3),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(31,111,120,0.28),_transparent_40%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-10 lg:px-10">
          <header className="flex items-center justify-between gap-6">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.35em] text-sand/60">Rigways rebuild</p>
              <h1 className="font-display text-3xl tracking-tight lg:text-5xl">Connected control room for inspection operations.</h1>
            </div>
            <span className="rounded-full border border-white/15 px-4 py-2 text-sm text-sand/80">
              React + Node + MySQL
            </span>
          </header>

          <div className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <p className="max-w-2xl text-lg leading-8 text-sand/78">
                The frontend is now wired to the rebuilt API. This page reads live API health,
                module metadata, and auth bootstrap data from the new monorepo instead of static placeholders.
              </p>
              {error ? (
                <div className="rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <a className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d56c3e]" href="/api/meta">
                  View live API metadata
                </a>
                <a className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-sand transition hover:border-white/30" href="/health">
                  API health JSON
                </a>
              </div>
            </div>

            <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-sand/45">Runtime status</p>
              {runtimeCards.map((item) => (
                <div key={item.label} className="border-b border-white/10 pb-3 last:border-b-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-sand/45">{item.label}</p>
                  <p className={`mt-1 text-lg ${item.tone}`}>{item.value}</p>
                  <p className="text-sm text-sand/65">{item.detail}</p>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="space-y-4 border-t border-rust pt-5">
            <p className="text-xs uppercase tracking-[0.3em] text-rust">Module coverage</p>
            <h2 className="font-display text-2xl">Live backend capability map</h2>
            <div className="flex flex-wrap gap-2">
              {(meta?.modules || []).map((module) => (
                <span key={module} className="rounded-full border border-white/10 px-3 py-2 text-sm text-sand/80">
                  {module}
                </span>
              ))}
            </div>
          </article>

          <article className="space-y-4 border-t border-teal pt-5">
            <p className="text-xs uppercase tracking-[0.3em] text-teal">Reference data</p>
            <h2 className="font-display text-2xl">Domain enums from the shared package</h2>
            <div className="space-y-4 text-sm text-sand/78">
              <p>
                Roles: {(meta?.referenceData.userRoles || []).join(', ') || 'waiting'}
              </p>
              <p>
                Asset states: {(meta?.referenceData.assetStatuses || []).join(', ') || 'waiting'}
              </p>
              <p>
                Certificate types: {(meta?.referenceData.certificateTypes || []).join(', ') || 'waiting'}
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
