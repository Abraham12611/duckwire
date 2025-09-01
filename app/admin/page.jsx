"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [auth, setAuth] = useState({ authenticated: false, username: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [clustersRunning, setClustersRunning] = useState(false);
  const [lastClusters, setLastClusters] = useState(null);
  // Source bias management
  const [sources, setSources] = useState([]);
  const [biasMap, setBiasMap] = useState({});
  const [saving, setSaving] = useState({}); // { [provider]: 'saving'|'saved'|'error' }

  async function refreshStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/status", { cache: "no-store" });
      const json = await res.json();
      setAuth(json);
    } catch (e) {
      setError("Failed to load status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, bRes] = await Promise.all([
          fetch("/api/sources", { cache: "no-store" }),
          fetch("/api/source-bias", { cache: "no-store" }),
        ]);
        const sJson = await sRes.json();
        const bJson = await bRes.json();
        setSources(sJson?.sources || []);
        setBiasMap(bJson?.map || {});
      } catch {
        // ignore
      }
    }
    if (auth.authenticated) load();
  }, [auth.authenticated]);

  async function onLogin(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const json = await res.json();
      if (!res.ok || json?.ok !== true) {
        setError(json?.error || "Login failed");
        return;
      }
      await refreshStatus();
    } catch (e) {
      setError("Login failed");
    }
  }

  async function onLogout() {
    setError(null);
    await fetch("/api/admin/logout", { method: "POST" });
    await refreshStatus();
  }

  async function runDailyFetch() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/news?refresh=1", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to refresh");
      }
      const data = await res.json();
      setLastRun({ at: new Date().toISOString(), count: data?.count ?? data?.items?.length ?? 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  async function buildClusters() {
    setClustersRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/clusters?refresh=1", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to build clusters");
      }
      const data = await res.json();
      setLastClusters({ at: new Date().toISOString(), count: data?.count ?? data?.clusters?.length ?? 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setClustersRunning(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">DuckWire Admin</h1>

      {loading ? (
        <p>Loading…</p>
      ) : auth.authenticated ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="font-medium">{auth.username}</p>
            </div>
            <button
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>

          <div className="border rounded p-4 space-y-3">
            <h2 className="font-medium">Daily News Fetch</h2>
            <p className="text-sm text-gray-600">
              Trigger the pipeline to fetch from all providers and update
              <code className="ml-1">data/news/daily.json</code>.
            </p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              onClick={runDailyFetch}
              disabled={running}
            >
              {running ? "Running…" : "Run Daily Fetch"}
            </button>
            {lastRun ? (
              <p className="text-sm text-green-700">
                Last run at {new Date(lastRun.at).toLocaleString()} — items: {lastRun.count}
              </p>
            ) : null}
          </div>

          <div className="border rounded p-4 space-y-3">
            <h2 className="font-medium">Build Story Clusters</h2>
            <p className="text-sm text-gray-600">
              Cluster the latest news and generate AI summaries. Writes to
              <code className="ml-1">data/news/clusters.json</code>.
            </p>
            <button
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              onClick={buildClusters}
              disabled={clustersRunning}
            >
              {clustersRunning ? "Building…" : "Build Clusters"}
            </button>
            {lastClusters ? (
              <p className="text-sm text-green-700">
                Last built at {new Date(lastClusters.at).toLocaleString()} — clusters: {lastClusters.count}
              </p>
            ) : null}
          </div>

          {/* Source Bias Management */}
          <div className="border rounded p-4 space-y-3">
            <h2 className="font-medium">Source Bias Management</h2>
            <p className="text-sm text-gray-600">Set a media bias for each source. Used to render the "Bias" pill on article cards and filter tabs.</p>
            <div className="max-h-80 overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">Bias</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => {
                    const val = (biasMap[s] || "center").toLowerCase();
                    const st = saving[s];
                    return (
                      <tr key={s} className="border-t">
                        <td className="p-2">{s}</td>
                        <td className="p-2">
                          <select
                            className="border rounded px-2 py-1"
                            value={val}
                            onChange={async (e) => {
                              const bias = e.target.value;
                              setBiasMap((m) => ({ ...m, [s]: bias }));
                              setSaving((st) => ({ ...st, [s]: "saving" }));
                              try {
                                const res = await fetch("/api/source-bias", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ provider: s, bias }),
                                });
                                if (!res.ok) throw new Error("save failed");
                                setSaving((st) => ({ ...st, [s]: "saved" }));
                                setTimeout(() => setSaving((st) => ({ ...st, [s]: undefined })), 1200);
                              } catch {
                                setSaving((st) => ({ ...st, [s]: "error" }));
                              }
                            }}
                          >
                            <option value="left">Lean Left</option>
                            <option value="center">Center</option>
                            <option value="right">Lean Right</option>
                          </select>
                        </td>
                        <td className="p-2 text-xs">
                          {st === "saving" ? <span className="text-gray-500">Saving…</span> : null}
                          {st === "saved" ? <span className="text-green-600">Saved</span> : null}
                          {st === "error" ? <span className="text-red-600">Error</span> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onLogin} className="space-y-4 border rounded p-4">
          <h2 className="font-medium">Admin Login</h2>
          <div className="space-y-2">
            <label className="block text-sm">Username</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" type="submit">
            Sign In
          </button>
        </form>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
