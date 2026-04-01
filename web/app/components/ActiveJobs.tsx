"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  address: string | null;
  status: string;
  total_squares: number | null;
  system_type: string | null;
  manufacturer: string | null;
  log_count: number;
  last_log_date: string | null;
  total_sq_completed: number | null;
}

interface LogEntry {
  id: number;
  log_date: string;
  crew_count: number | null;
  area_worked: string | null;
  squares_completed: number | null;
  work_description: string | null;
  weather: string | null;
  issues: string | null;
}

interface Delivery {
  id: number;
  delivery_date: string;
  type: "material" | "dumpster_drop" | "dumpster_pickup";
  description: string | null;
  supplier: string | null;
  quantity: string | null;
  dumpster_number: number | null;
  notes: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  material: { label: "Material Delivery", color: "bg-blue-100 text-blue-700" },
  dumpster_drop: { label: "Dumpster Drop", color: "bg-yellow-100 text-yellow-700" },
  dumpster_pickup: { label: "Dumpster Pickup", color: "bg-green-100 text-green-700" },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Project list ─────────────────────────────────────────────────────────────

export default function ActiveJobs() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  if (selected) {
    return <ProjectDetail project={selected} onBack={() => { setSelected(null); fetchProjects(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Active Jobs</h2>
          <p className="text-slate-500 text-sm mt-0.5">Jobs currently in progress — click to open project manager</p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400 text-sm">
          No active jobs yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((p) => {
            const pct = p.total_squares && p.total_sq_completed
              ? Math.min(100, Math.round((p.total_sq_completed / p.total_squares) * 100))
              : 0;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-[#2878C4] hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-base group-hover:text-[#2878C4]">{p.name}</div>
                    {p.address && <div className="text-sm text-slate-500 mt-0.5">{p.address}</div>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      {p.total_squares && <span>{p.total_squares} SQ total</span>}
                      {p.system_type && <span>{p.manufacturer} {p.system_type}</span>}
                      {p.log_count > 0 && <span>{p.log_count} log {p.log_count === 1 ? "entry" : "entries"}</span>}
                      {p.last_log_date && <span>Last logged: {p.last_log_date}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-[#2878C4]">{pct}%</div>
                    <div className="text-xs text-slate-400">complete</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2878C4] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Project detail ───────────────────────────────────────────────────────────

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const [tab, setTab] = useState<"overview" | "log" | "deliveries" | "ask">("log");

  const tabs = [
    { id: "log", label: "Daily Log" },
    { id: "deliveries", label: "Deliveries & Dumpsters" },
    { id: "ask", label: "Ask Maxwell" },
    { id: "overview", label: "Overview" },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{project.name}</h2>
          {project.address && <p className="text-sm text-slate-500">{project.address}</p>}
        </div>
        <div className="ml-auto flex gap-2 text-xs">
          {project.total_squares && (
            <span className="bg-[#2878C4]/10 text-[#2878C4] px-2 py-1 rounded-full font-medium">
              {project.total_squares} SQ
            </span>
          )}
          {project.manufacturer && project.system_type && (
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
              {project.manufacturer} {project.system_type}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
              tab === t.id ? "bg-white text-[#2878C4] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "log" && <DailyLogTab projectId={project.id} />}
      {tab === "deliveries" && <DeliveriesTab projectId={project.id} />}
      {tab === "ask" && <AskMaxwellTab projectId={project.id} projectName={project.name} />}
      {tab === "overview" && <OverviewTab project={project} />}
    </div>
  );
}

// ─── Daily log tab ────────────────────────────────────────────────────────────

function DailyLogTab({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [form, setForm] = useState({
    log_date: today(),
    crew_count: "",
    area_worked: "",
    squares_completed: "",
    work_description: "",
    weather: "",
    issues: "",
  });

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/log`);
    setEntries(await res.json());
  }, [projectId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function save() {
    if (!form.work_description.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${projectId}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        crew_count: form.crew_count ? Number(form.crew_count) : null,
        squares_completed: form.squares_completed ? Number(form.squares_completed) : null,
      }),
    });
    setSaving(false);
    setForm({ log_date: today(), crew_count: "", area_worked: "", squares_completed: "", work_description: "", weather: "", issues: "" });
    fetchEntries();
  }

  return (
    <div className="space-y-4">
      {/* Add entry form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Log Today's Work</h3>
            <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600">Hide</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">Date</label>
              <input type="date" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                value={form.log_date} onChange={(e) => setForm({ ...form, log_date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Crew Count</label>
              <input type="number" placeholder="# of workers" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                value={form.crew_count} onChange={(e) => setForm({ ...form, crew_count: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Area Worked</label>
              <input type="text" placeholder="e.g. North wing, Section A" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                value={form.area_worked} onChange={(e) => setForm({ ...form, area_worked: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Squares Completed</label>
              <input type="number" step="0.5" placeholder="SQ" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                value={form.squares_completed} onChange={(e) => setForm({ ...form, squares_completed: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Work Description *</label>
            <textarea rows={3} placeholder="Describe work performed today..." className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
              value={form.work_description} onChange={(e) => setForm({ ...form, work_description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">Weather</label>
              <input type="text" placeholder="e.g. Sunny 72°F" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Issues / Notes</label>
              <input type="text" placeholder="Any issues or delays" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })} />
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving || !form.work_description.trim()}
            className="bg-[#2878C4] hover:bg-[#1a5fa0] disabled:bg-slate-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Saving…" : "Save Log Entry"}
          </button>
        </div>
      )}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="text-sm text-[#2878C4] hover:underline">+ Add log entry</button>
      )}

      {/* Log history */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8">No log entries yet</div>
        ) : entries.map((e) => (
          <div key={e.id} className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 text-sm">{e.log_date}</span>
              <div className="flex gap-3 text-xs text-slate-400">
                {e.crew_count && <span>{e.crew_count} crew</span>}
                {e.squares_completed && <span className="text-[#2878C4] font-medium">{e.squares_completed} SQ</span>}
                {e.weather && <span>{e.weather}</span>}
              </div>
            </div>
            {e.area_worked && <div className="text-xs text-slate-500 mb-1">Area: {e.area_worked}</div>}
            <p className="text-sm text-slate-700">{e.work_description}</p>
            {e.issues && (
              <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded px-2 py-1">{e.issues}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Deliveries tab ───────────────────────────────────────────────────────────

function DeliveriesTab({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<Delivery[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    delivery_date: today(),
    type: "material" as Delivery["type"],
    description: "",
    supplier: "",
    quantity: "",
    dumpster_number: "",
    notes: "",
  });

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/deliveries`);
    setEntries(await res.json());
  }, [projectId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function save() {
    setSaving(true);
    await fetch(`/api/projects/${projectId}/deliveries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dumpster_number: form.dumpster_number ? Number(form.dumpster_number) : null,
      }),
    });
    setSaving(false);
    setForm({ delivery_date: today(), type: "material", description: "", supplier: "", quantity: "", dumpster_number: "", notes: "" });
    fetchEntries();
  }

  const dumpsterDrops = entries.filter((e) => e.type === "dumpster_drop").length;
  const dumpsterPickups = entries.filter((e) => e.type === "dumpster_pickup").length;

  return (
    <div className="space-y-4">
      {/* Dumpster tally */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Dumpsters Dropped", value: dumpsterDrops, color: "border-yellow-400" },
          { label: "Dumpsters Picked Up", value: dumpsterPickups, color: "border-green-400" },
          { label: "Material Deliveries", value: entries.filter((e) => e.type === "material").length, color: "border-[#2878C4]" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-4 border-l-4 ${s.color} shadow-sm`}>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-slate-800 text-sm">Log Delivery or Dumpster</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium">Date</label>
            <input type="date" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
              value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Type</label>
            <select className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
              value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Delivery["type"] })}>
              <option value="material">Material Delivery</option>
              <option value="dumpster_drop">Dumpster Drop</option>
              <option value="dumpster_pickup">Dumpster Pickup</option>
            </select>
          </div>
          {form.type === "material" ? (
            <>
              <div>
                <label className="text-xs text-slate-500 font-medium">Description</label>
                <input type="text" placeholder="e.g. TPO membrane, ISO boards" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Supplier</label>
                <input type="text" placeholder="Supplier name" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                  value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500 font-medium">Quantity</label>
                <input type="text" placeholder="e.g. 24 bundles ISO, 3 rolls TPO" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                  value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-slate-500 font-medium">Dumpster #</label>
                <input type="number" placeholder="Dumpster number" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                  value={form.dumpster_number} onChange={(e) => setForm({ ...form, dumpster_number: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Notes</label>
                <input type="text" placeholder="Any notes" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#2878C4] hover:bg-[#1a5fa0] disabled:bg-slate-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* History */}
      <div className="space-y-2">
        {entries.map((e) => {
          const meta = TYPE_LABELS[e.type];
          return (
            <div key={e.id} className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-start gap-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${meta.color}`}>{meta.label}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-700">
                  {e.description || (e.dumpster_number ? `Dumpster #${e.dumpster_number}` : "—")}
                  {e.quantity && <span className="text-slate-400 ml-2 text-xs">{e.quantity}</span>}
                </div>
                {e.supplier && <div className="text-xs text-slate-400">{e.supplier}</div>}
                {e.notes && <div className="text-xs text-slate-400">{e.notes}</div>}
              </div>
              <span className="text-xs text-slate-400 shrink-0">{e.delivery_date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Ask Maxwell tab ──────────────────────────────────────────────────────────

function AskMaxwellTab({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [question, setQuestion] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setReply(null);
    setError(null);

    try {
      let image_base64: string | undefined;
      let image_type: string | undefined;

      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        image_base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        image_type = imageFile.type;
      }

      const res = await fetch(`/api/projects/${projectId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, image_base64, image_type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setReply(data.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        <strong>Maxwell knows this job.</strong> Upload a photo of a roof section and ask for a material list.
        He has access to the full spec, dimensions, and system details for {projectName}.
      </div>

      {/* Image upload */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#2878C4]/50 hover:bg-slate-50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImage(f); }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            <button
              onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
              className="absolute top-1 right-1 bg-white border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 text-xs"
            >×</button>
          </div>
        ) : (
          <div className="text-slate-400 text-sm">
            <svg className="w-8 h-8 mx-auto mb-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Drop a photo of the roof section (optional)
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {!question && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-medium">Quick questions</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Give me a material list for 20 squares of this section",
              "How many ISO panels do I need for 10 squares at 1/8\" slope?",
              "What's the adhesive quantity for today's 15-square area?",
              "How many retrofit drains have been installed based on the log?",
            ].map((q) => (
              <button key={q} onClick={() => setQuestion(q)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:border-[#2878C4]/50 hover:text-[#2878C4] bg-white transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2878C4]/40"
          rows={2}
          placeholder="Ask Maxwell about this job — materials, quantities, daily planning…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
          disabled={loading}
        />
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          className="bg-[#2878C4] hover:bg-[#1a5fa0] disabled:bg-slate-300 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors shrink-0"
        >
          {loading ? "…" : "Ask"}
        </button>
      </div>

      {/* Reply */}
      {reply && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs font-semibold text-[#2878C4] uppercase tracking-wide mb-2">Maxwell</div>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{reply}</div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-800 text-sm">Project Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Total Area</dt><dd className="font-medium">{project.total_squares ?? "—"} SQ</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">System</dt><dd className="font-medium">{project.manufacturer} {project.system_type}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium capitalize">{project.status}</span></dd></div>
          </dl>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-800 text-sm">System Stack</h3>
          <ol className="text-xs text-slate-600 space-y-1 list-none">
            {["1. Vapor Barrier", "2. Tapered ISO (1/8\" per foot, 4×4 panels, EnergyGuard GAF)", "3. ½\" HD Cover Board — adhered", "4. GAF TPO — Fully Adhered"].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="text-[#2878C4] mt-0.5">▸</span>{s}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Satellite View</h3>
        <img src={`/project-images/${project.id}/satellite.png`} alt="Satellite" className="w-full rounded-lg object-contain max-h-64" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Roof Plan (234.2 SQ)</h3>
        <img src={`/project-images/${project.id}/roof_plan.png`} alt="Roof Plan" className="w-full rounded-lg object-contain max-h-48 bg-slate-50" />
      </div>
    </div>
  );
}
