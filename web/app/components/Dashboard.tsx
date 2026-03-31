"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Nav ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "estimates", label: "Estimates", icon: EstimatesIcon },
  { id: "material-list", label: "Material Lists", icon: MaterialIcon },
  { id: "jobs", label: "Active Jobs", icon: JobsIcon },
  { id: "products", label: "Products", icon: ProductsIcon },
  { id: "rules", label: "Rules & Docs", icon: RulesIcon },
  { id: "team", label: "Team", icon: TeamIcon },
  { id: "help", label: "Help", icon: HelpIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function EstimatesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function MaterialIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  );
}
function JobsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function ProductsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}
function RulesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type EstimateStatus = "open" | "sent" | "won" | "lost";

interface Estimate {
  id: number;
  customer_name: string | null;
  job_address: string | null;
  job_type: string | null;
  squares: number | null;
  total: number | null;
  status: EstimateStatus;
  flags: string | null;
  created_at: string;
}

interface MaterialList {
  id: number;
  job_address: string | null;
  customer_name: string | null;
  status: string;
  flags: string | null;
  created_at: string;
}

interface MaxwellResult {
  document_type: string;
  action: string;
  routed_to: string;
  job_summary: {
    job_address?: string;
    customer_name?: string;
    job_type?: string;
    total_squares?: number;
  };
  material_list: Array<{ category: string; item: string; quantity: number | null; unit: string; derived: boolean; notes: string | null }>;
  flags: Array<{ code: string; message: string; severity: string }>;
  summary: string;
  saved_id: number | null;
  error?: string;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<EstimateStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  sent: "bg-yellow-100 text-yellow-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

// ─── Upload drop zone ─────────────────────────────────────────────────────────

function UploadZone({
  context,
  label,
  hint,
  onResult,
}: {
  context: string;
  label: string;
  hint: string;
  onResult: (result: MaxwellResult) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setProcessing(true);
      setError(null);
      try {
        const text = await file.text();
        const res = await fetch("/api/maxwell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, filename: file.name, context }),
        });
        const data: MaxwellResult = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Maxwell returned an error");
        onResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setProcessing(false);
      }
    },
    [context, onResult]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging ? "border-[#2878C4] bg-[#e8f2fb]" : "border-slate-300 hover:border-[#2878C4]/50 hover:bg-slate-50"
        } ${processing ? "pointer-events-none opacity-60" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleChange} />
        {processing ? (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <svg className="w-8 h-8 animate-spin text-[#2878C4]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm font-medium">Maxwell is processing…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}
    </div>
  );
}

// ─── Maxwell result card ──────────────────────────────────────────────────────

function MaxwellResultCard({ result, onDismiss }: { result: MaxwellResult; onDismiss: () => void }) {
  const blockingFlags = result.flags?.filter((f) => f.severity === "blocking") ?? [];
  const warningFlags = result.flags?.filter((f) => f.severity === "warning") ?? [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {result.document_type?.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-slate-300">→</span>
            <span className="text-xs font-medium uppercase tracking-wide text-[#2878C4]">
              {result.routed_to}
            </span>
          </div>
          <p className="text-sm text-slate-700 mt-1">{result.summary}</p>
          {result.saved_id && (
            <p className="text-xs text-green-600 mt-1">Saved to database (ID: {result.saved_id})</p>
          )}
        </div>
        <button onClick={onDismiss} className="text-slate-300 hover:text-slate-500 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {result.job_summary && (
        <div className="text-xs text-slate-500 grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50 rounded-lg p-3">
          {result.job_summary.job_address && <span><span className="font-medium">Address:</span> {result.job_summary.job_address}</span>}
          {result.job_summary.job_type && <span><span className="font-medium">Type:</span> {result.job_summary.job_type}</span>}
          {result.job_summary.total_squares && <span><span className="font-medium">Squares:</span> {result.job_summary.total_squares}</span>}
        </div>
      )}

      {blockingFlags.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Blocking — must resolve</p>
          {blockingFlags.map((f, i) => (
            <div key={i} className="text-xs text-red-700 bg-red-50 border border-red-100 rounded px-3 py-1.5">{f.message}</div>
          ))}
        </div>
      )}

      {warningFlags.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Flags</p>
          {warningFlags.map((f, i) => (
            <div key={i} className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded px-3 py-1.5">{f.message}</div>
          ))}
        </div>
      )}

      {result.material_list?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Material List ({result.material_list.length} items)</p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Item</th>
                  <th className="text-right px-3 py-2">Qty</th>
                  <th className="text-left px-3 py-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {result.material_list.map((item, i) => (
                  <tr key={i} className={`border-t border-slate-50 ${item.derived ? "text-blue-600" : "text-slate-700"}`}>
                    <td className="px-3 py-1.5">{item.item}{item.derived ? " *" : ""}</td>
                    <td className="px-3 py-1.5 text-right">{item.quantity ?? "—"}</td>
                    <td className="px-3 py-1.5">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-blue-500 mt-1">* = auto-calculated (derived rule)</p>
        </div>
      )}
    </div>
  );
}

// ─── Estimates section ────────────────────────────────────────────────────────

function EstimatesSection() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [result, setResult] = useState<MaxwellResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/estimates");
      setEstimates(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEstimates(); }, [fetchEstimates]);

  function handleResult(r: MaxwellResult) {
    setResult(r);
    fetchEstimates();
  }

  async function updateStatus(id: number, status: EstimateStatus, lost_reason?: string) {
    await fetch("/api/estimates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, lost_reason }),
    });
    fetchEstimates();
  }

  const won = estimates.filter((e) => e.status === "won").length;
  const closed = estimates.filter((e) => e.status === "won" || e.status === "lost").length;
  const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : null;
  const flagCount = estimates.reduce((acc, e) => {
    try { return acc + (JSON.parse(e.flags ?? "[]") as []).length; } catch { return acc; }
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open", value: estimates.filter((e) => e.status === "open").length, color: "border-blue-400" },
          { label: "Won", value: won, color: "border-green-400" },
          { label: "Lost", value: estimates.filter((e) => e.status === "lost").length, color: "border-red-400" },
          { label: "Conversion Rate", value: conversionRate !== null ? `${conversionRate}%` : "—", color: "border-[#2878C4]" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-4 border-l-4 ${s.color} shadow-sm`}>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Upload Walkthrough Notes</h3>
        <UploadZone
          context="estimates"
          label="Drop walkthrough notes, field photos, or work order"
          hint="Maxwell will parse the document and generate a draft estimate"
          onResult={handleResult}
        />
        {result && <div className="mt-4"><MaxwellResultCard result={result} onDismiss={() => setResult(null)} /></div>}
      </div>

      {/* Estimates table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          All Estimates {flagCount > 0 && <span className="ml-2 text-xs text-yellow-600 font-normal">{flagCount} open flag{flagCount !== 1 ? "s" : ""}</span>}
        </h3>
        {loading ? (
          <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>
        ) : estimates.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400 text-sm">
            No estimates yet — upload walkthrough notes above to create the first one
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Address / Customer</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">Squares</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((est) => {
                  const flags = (() => { try { return JSON.parse(est.flags ?? "[]") as Array<{severity: string}>; } catch { return []; } })();
                  const blocking = flags.filter((f) => f.severity === "blocking").length;
                  return (
                    <tr key={est.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{est.job_address ?? "—"}</div>
                        {est.customer_name && <div className="text-xs text-slate-400">{est.customer_name}</div>}
                        {blocking > 0 && <div className="text-xs text-red-500 mt-0.5">{blocking} blocking flag{blocking !== 1 ? "s" : ""}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{est.job_type ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{est.squares ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[est.status]}`}>
                          {est.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(est.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {est.status === "open" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(est.id, "won")}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >Won</button>
                            <button
                              onClick={() => updateStatus(est.id, "lost")}
                              className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >Lost</button>
                          </div>
                        )}
                        {est.status === "won" && (
                          <span className="text-xs text-green-600 font-medium">Contract signed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Material Lists section ───────────────────────────────────────────────────

function MaterialListsSection() {
  const [lists, setLists] = useState<MaterialList[]>([]);
  const [result, setResult] = useState<MaxwellResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/material-lists");
      setLists(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  function handleResult(r: MaxwellResult) {
    setResult(r);
    fetchLists();
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        <strong>Phase 2 workflow:</strong> Upload here after a contract is signed and the field visit is complete.
        Maxwell will parse the handwritten material sheet and generate the crew pull list.
      </div>

      {/* Upload zone */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Upload Handwritten Material Sheet</h3>
        <UploadZone
          context="material-list"
          label="Drop handwritten material sheet or field notes"
          hint="Maxwell will generate a complete material list for the crew"
          onResult={handleResult}
        />
        {result && <div className="mt-4"><MaxwellResultCard result={result} onDismiss={() => setResult(null)} /></div>}
      </div>

      {/* Lists table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Material Lists</h3>
        {loading ? (
          <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>
        ) : lists.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400 text-sm">
            No material lists yet — upload a handwritten sheet above to generate one
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Address</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {lists.map((ml) => (
                  <tr key={ml.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{ml.job_address ?? ml.customer_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        ml.status === "printed" ? "bg-green-100 text-green-700" :
                        ml.status === "ready" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {ml.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(ml.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-[#2878C4] hover:text-[#1a5fa0] font-medium">Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard home ───────────────────────────────────────────────────────────

function DashboardHome({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);

  useEffect(() => {
    fetch("/api/estimates").then((r) => r.json()).then(setEstimates).catch(() => {});
  }, []);

  const won = estimates.filter((e) => e.status === "won").length;
  const closed = estimates.filter((e) => e.status === "won" || e.status === "lost").length;
  const conversionRate = closed > 0 ? `${Math.round((won / closed) * 100)}%` : "—";

  const stats = [
    { label: "Open Estimates", value: estimates.filter((e) => e.status === "open").length, color: "border-blue-400" },
    { label: "Won / Contracts", value: won, color: "border-green-400" },
    { label: "Conversion Rate", value: conversionRate, color: "border-[#2878C4]" },
    { label: "Material Lists", value: "—", color: "border-purple-400" },
  ];

  const QUICK_ACTIONS = [
    { label: "New Estimate", section: "estimates", color: "bg-[#2878C4] hover:bg-[#1a5fa0]" },
    { label: "Material List", section: "material-list", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Active Jobs", section: "jobs", color: "bg-green-600 hover:bg-green-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
        <p className="text-slate-500 mt-1">Capitol Roofing — Automation System</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl p-5 border-l-4 ${card.color} shadow-sm`}>
            <div className="text-3xl font-bold text-slate-800">{card.value}</div>
            <div className="text-sm font-medium text-slate-700 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.section)}
              className={`${action.color} text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Maxwell (AI Router)", status: "Active", note: "Routes uploaded docs to estimates or material lists" },
            { name: "Estimates Tracker", status: "Active", note: "Open → Sent → Won/Lost with conversion rate" },
            { name: "Material List Generator", status: "Active", note: "Phase 2: triggered after contract signed" },
            { name: "IB Product Catalog", status: "Active", note: "148-item catalog loaded from blank template" },
            { name: "Abbreviation Legend", status: "Active", note: "A–E cone boots, ISO panels, all metal types" },
            { name: "Follow-up Emails", status: "Planned", note: "Auto questionnaire for lost estimates" },
          ].map((mod) => (
            <div key={mod.name} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
              <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                mod.status === "Active" ? "bg-green-400" :
                mod.status === "Planned" ? "bg-slate-300" : "bg-[#2878C4]"
              }`} />
              <div>
                <div className="font-medium text-slate-800 text-sm">{mod.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{mod.status} · {mod.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Team view ────────────────────────────────────────────────────────────────

function TeamView({ manager, employees }: { manager: string; employees: Array<{ name: string; content: string }> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const all = [
    { name: "Maxwell", role: "Manager / AI Router", file: "manager.md", content: manager, color: "bg-[#2878C4]" },
    ...employees.map((emp) => ({
      name: emp.name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      role: emp.name.replace(/_/g, " "),
      file: `employees/${emp.name}.md`,
      content: emp.content,
      color: "bg-blue-500",
    })),
  ];
  const active = all.find((a) => a.name === selected);

  return (
    <div className="space-y-6">
      <p className="text-slate-500 text-sm">
        Each team member is an AI agent powered by Claude. They receive documents and tasks from Maxwell and process them automatically.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {all.map((member) => (
          <button
            key={member.name}
            onClick={() => setSelected(selected === member.name ? null : member.name)}
            className={`bg-white rounded-xl p-5 shadow-sm border text-left transition-all ${
              selected === member.name ? "border-[#2878C4] ring-1 ring-[#2878C4]" : "border-slate-100 hover:border-slate-300"
            }`}
          >
            <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-3`}>
              {member.name[0]}
            </div>
            <div className="font-semibold text-slate-800">{member.name}</div>
            <div className="text-xs text-slate-400 capitalize mt-0.5">{member.file}</div>
          </button>
        ))}
      </div>
      {active && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">{active.name} — Instructions</h3>
          <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg overflow-auto max-h-96">
            {active.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Help chat ────────────────────────────────────────────────────────────────

function HelpChat() {
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setError(null);
    const newHistory = [...history, { role: "user" as const, content: msg }];
    setHistory(newHistory);
    setLoading(true);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setHistory([...newHistory, { role: "assistant" as const, content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setHistory(history);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">Help</h2>
        <p className="text-slate-500 text-sm mt-1">
          Ask anything about the system — where to upload files, what each section does, or how the workflow works.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 p-4 space-y-4 mb-4 min-h-0">
        {history.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">Ask a question about the system</p>
            <div className="mt-4 space-y-2 text-left max-w-xs mx-auto">
              {[
                "Where do I upload field notes for a new estimate?",
                "What happens after a contract is signed?",
                "How does the material list get generated?",
                "What does Maxwell do?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[#2878C4] text-white"
                : "bg-slate-50 text-slate-800 border border-slate-200"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
              <span className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </span>
              Thinking…
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 items-end">
        <textarea
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          rows={2}
          placeholder="Ask a question… (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-[#2878C4] hover:bg-[#1a5fa0] disabled:bg-slate-300 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors shrink-0"
        >
          Send
        </button>
      </div>
      {history.length > 0 && (
        <button onClick={() => setHistory([])} className="text-xs text-slate-400 hover:text-slate-600 mt-2 text-right">
          Clear
        </button>
      )}
    </div>
  );
}

// ─── Coming soon ──────────────────────────────────────────────────────────────

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
      <p className="text-slate-400 mt-2 max-w-sm text-sm">{description}</p>
      <span className="mt-4 text-xs bg-[#2878C4]/10 text-[#1a5fa0] px-3 py-1 rounded-full font-medium">Coming Soon</span>
    </div>
  );
}

// ─── Root dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ manager, employees }: { manager: string; employees: Array<{ name: string; content: string }> }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f2d4a] flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-white/10">
          {/* Logo — drop logo.png into web/public/ to activate */}
          <img
            src="/logo.png"
            alt="Capitol Roofing"
            className="h-16 w-auto object-contain"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const fallback = el.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          {/* Fallback shown until logo.png is added */}
          <div className="items-center gap-2 hidden">
            <div className="w-8 h-8 bg-[#2878C4] rounded flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 12l9-9 9 9H3z" />
                <path d="M5 10v9h14v-9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Capitol</div>
              <div className="text-[#2878C4] text-xs font-medium">Roofing</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  active ? "bg-[#2878C4] text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-xs text-slate-400">Roofing Automation System</div>
          <div className="text-xs text-slate-500">v0.2.0</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? "Dashboard"}
          </h1>
          <span className="text-sm text-slate-500">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {activeSection === "dashboard" && <DashboardHome onNavigate={setActiveSection} />}
          {activeSection === "estimates" && <EstimatesSection />}
          {activeSection === "material-list" && <MaterialListsSection />}
          {activeSection === "team" && <TeamView manager={manager} employees={employees} />}
          {activeSection === "help" && <HelpChat />}
          {activeSection === "jobs" && <ComingSoon title="Active Jobs" description="Jobs with signed contracts in progress. Tracks phase, crew assignment, and material list status." />}
          {activeSection === "products" && <ComingSoon title="Products" description="IB Roof Systems PVC product catalog — 148 items loaded from master template." />}
          {activeSection === "rules" && <ComingSoon title="Rules & Docs" description="Estimating rules, derived materials rules, abbreviation legend, and workflow docs." />}
          {activeSection === "settings" && <ComingSoon title="Settings" description="Company info, pricing configuration, and system preferences." />}
        </main>
      </div>
    </div>
  );
}
