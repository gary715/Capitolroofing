"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueItem {
  id: number;
  name: string;
  address: string | null;
  roofing_type: string | null;
  insulation_type: string | null;
  total_squares: number | null;
  stories: number | null;
  notes: string | null;
  status: string;
  missing_fields: string | null;
  result: string | null;
  questions: string | null;
  file_count: number;
  file_names: string | null;
  satellite_count: number;
  created_at: string;
}

interface FileRecord {
  id: number;
  file_name: string;
  file_category: string;
  created_at: string;
}

const FILE_CATEGORIES = [
  { value: "satellite", label: "Satellite Image" },
  { value: "spec", label: "Spec / Plans" },
  { value: "walkthrough", label: "Walkthrough Notes" },
  { value: "photo", label: "Photo" },
  { value: "other", label: "Other" },
];

const ROOFING_TYPES = ["TPO", "PVC", "EPDM", "Modified Bitumen", "Metal", "Shingle", "Built-Up", "Other"];
const INSULATION_TYPES = ["Tapered ISO", "Flat ISO", "EPS", "XPS", "None", "Other"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EstimateQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processResults, setProcessResults] = useState<Array<{ id: number; name: string; success: boolean; error?: string }> | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/estimate-queue");
      if (res.ok) setItems(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const greenCount = items.filter(i => i.status === "ready").length;
  const yellowCount = items.filter(i => i.status === "draft").length;
  const processingCount = items.filter(i => i.status === "processing").length;
  const completeCount = items.filter(i => i.status === "complete").length;

  async function startProcessing(mode: "green" | "all") {
    setProcessing(true);
    setProcessResults(null);
    try {
      const res = await fetch("/api/estimate-queue/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "all" ? { force: true } : {}),
      });
      const data = await res.json();
      if (data.processed) setProcessResults(data.processed);
      fetchItems();
    } catch {
      setProcessResults([{ id: 0, name: "Error", success: false, error: "Failed to connect" }]);
    }
    setProcessing(false);
  }

  async function deleteItem(id: number) {
    await fetch("/api/estimate-queue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setExpandedId(null);
    fetchItems();
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Ready", value: greenCount, color: "border-green-400", dot: "bg-green-400" },
          { label: "Needs Info", value: yellowCount, color: "border-yellow-400", dot: "bg-yellow-400" },
          { label: "Processing", value: processingCount, color: "border-blue-400", dot: "bg-blue-400" },
          { label: "Complete", value: completeCount, color: "border-emerald-500", dot: "bg-emerald-500" },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-4 border-l-4 ${s.color} shadow-sm`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <span className="text-2xl font-bold text-slate-800">{s.value}</span>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#2878C4] text-white rounded-lg text-sm font-medium hover:bg-[#1a5fa0]"
        >
          + Add Estimate
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startProcessing("green")}
            disabled={processing || greenCount === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40"
          >
            {processing ? "Processing…" : `Start Green Only (${greenCount})`}
          </button>
          <button
            onClick={() => startProcessing("all")}
            disabled={processing || (greenCount + yellowCount) === 0}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-40"
          >
            Start All ({greenCount + yellowCount})
          </button>
        </div>
      </div>

      {/* Processing Results Alert */}
      {processResults && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Processing Results</h4>
          {processResults.map(r => (
            <div key={r.id} className={`text-sm py-1 ${r.success ? "text-green-600" : "text-red-500"}`}>
              {r.success ? "✓" : "✗"} {r.name} — {r.success ? "Complete" : r.error}
            </div>
          ))}
          <button onClick={() => setProcessResults(null)} className="text-xs text-slate-400 mt-2 hover:text-slate-600">Dismiss</button>
        </div>
      )}

      {/* Add Estimate Form */}
      {showForm && <AddEstimateForm onDone={() => { setShowForm(false); fetchItems(); }} />}

      {/* Queue List */}
      {loading ? (
        <div className="text-center text-slate-400 py-12 text-sm">Loading queue…</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400 text-sm">
          No estimates in the queue — click &quot;Add Estimate&quot; to start
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <QueueCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onRefresh={fetchItems}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Form ─────────────────────────────────────────────────────────────────

function AddEstimateForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", address: "", roofing_type: "", insulation_type: "", total_squares: "", stories: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/estimate-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        total_squares: form.total_squares ? parseFloat(form.total_squares) : null,
        stories: form.stories ? parseInt(form.stories) : null,
      }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">New Estimate</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Job Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30"
            placeholder="e.g. 123 Main Street — Flat Roof" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Address *</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30"
            placeholder="Full street address" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Roofing Type *</label>
          <select value={form.roofing_type} onChange={e => setForm(f => ({ ...f, roofing_type: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30 bg-white">
            <option value="">Select…</option>
            {ROOFING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Insulation *</label>
          <select value={form.insulation_type} onChange={e => setForm(f => ({ ...f, insulation_type: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30 bg-white">
            <option value="">Select…</option>
            {INSULATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Total Squares</label>
          <input type="number" value={form.total_squares} onChange={e => setForm(f => ({ ...f, total_squares: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30"
            placeholder="From satellite" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Stories</label>
          <input type="number" value={form.stories} onChange={e => setForm(f => ({ ...f, stories: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30"
            placeholder="Building height" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30"
            placeholder="Drains, penetrations, special conditions…" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onDone} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
        <button onClick={submit} disabled={!form.name.trim() || saving}
          className="px-4 py-2 bg-[#2878C4] text-white rounded-lg text-sm font-medium hover:bg-[#1a5fa0] disabled:opacity-40">
          {saving ? "Saving…" : "Create Estimate"}
        </button>
      </div>
    </div>
  );
}

// ─── Queue Card ───────────────────────────────────────────────────────────────

function QueueCard({
  item, expanded, onToggle, onRefresh, onDelete,
}: {
  item: QueueItem;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const missing = (() => { try { return JSON.parse(item.missing_fields ?? "[]") as string[]; } catch { return []; } })();

  const statusConfig: Record<string, { dot: string; bg: string; label: string }> = {
    draft: { dot: "bg-yellow-400", bg: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Needs Info" },
    ready: { dot: "bg-green-400", bg: "bg-green-50 text-green-700 border-green-200", label: "Ready" },
    processing: { dot: "bg-blue-400", bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Processing…" },
    complete: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Complete" },
    error: { dot: "bg-red-400", bg: "bg-red-50 text-red-700 border-red-200", label: "Error" },
  };
  const sc = statusConfig[item.status] ?? statusConfig.draft;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header row */}
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors">
        <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${sc.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 truncate">{item.name}</div>
          {item.address && <div className="text-xs text-slate-500 truncate">{item.address}</div>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {item.file_count > 0 && (
            <span className="text-xs text-slate-400">{item.file_count} file{item.file_count !== 1 ? "s" : ""}</span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sc.bg}`}>{sc.label}</span>
          <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Yellow: show missing */}
      {!expanded && item.status === "draft" && missing.length > 0 && (
        <div className="px-5 pb-3 -mt-1">
          <span className="text-xs text-yellow-600">Missing: {missing.join(", ")}</span>
        </div>
      )}

      {/* Expanded Detail */}
      {expanded && (
        <ExpandedDetail item={item} missing={missing} onRefresh={onRefresh} onDelete={onDelete} />
      )}
    </div>
  );
}

// ─── Expanded Detail ──────────────────────────────────────────────────────────

function ExpandedDetail({
  item, missing, onRefresh, onDelete,
}: {
  item: QueueItem;
  missing: string[];
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("satellite");
  const fileRef = useRef<HTMLInputElement>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchFiles = useCallback(async () => {
    const res = await fetch(`/api/estimate-queue/${item.id}/files`);
    if (res.ok) setFiles(await res.json());
  }, [item.id]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  async function uploadFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    await fetch(`/api/estimate-queue/${item.id}/files`, { method: "POST", body: fd });
    await fetchFiles();
    onRefresh();
    setUploading(false);
  }

  async function saveField(field: string, value: string) {
    await fetch("/api/estimate-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, field, value }),
    });
    setEditField(null);
    onRefresh();
  }

  // Parse result if complete
  let resultData: { summary?: string; material_list?: Array<{ item: string; quantity: number; unit: string; notes?: string }>; flags?: Array<{ severity: string; message: string }>; questions?: string[]; notes?: string } | null = null;
  if (item.result) {
    try { resultData = JSON.parse(item.result); } catch { /* raw text */ }
  }

  return (
    <div className="border-t border-slate-100 px-5 py-4 space-y-5">
      {/* Missing fields alert */}
      {missing.length > 0 && (
        <div className="flex items-start gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-yellow-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">Missing information for automation:</p>
            <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
              {missing.map(m => <li key={m} className="capitalize">{m.replace(/_/g, " ")}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Editable Fields */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "name", label: "Job Name", value: item.name },
          { key: "address", label: "Address", value: item.address },
          { key: "roofing_type", label: "Roofing Type", value: item.roofing_type },
          { key: "insulation_type", label: "Insulation", value: item.insulation_type },
          { key: "total_squares", label: "Total Squares", value: item.total_squares?.toString() },
          { key: "stories", label: "Stories", value: item.stories?.toString() },
        ].map(f => (
          <div key={f.key} className="text-sm">
            <span className="text-xs font-medium text-slate-500">{f.label}</span>
            {editField === f.key ? (
              <div className="flex gap-1 mt-0.5">
                <input value={editValue} onChange={e => setEditValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2878C4]/30"
                  autoFocus onKeyDown={e => e.key === "Enter" && saveField(f.key, editValue)} />
                <button onClick={() => saveField(f.key, editValue)} className="text-xs text-[#2878C4]">Save</button>
                <button onClick={() => setEditField(null)} className="text-xs text-slate-400">Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { if (item.status !== "processing" && item.status !== "complete") { setEditField(f.key); setEditValue(f.value ?? ""); } }}
                className={`mt-0.5 text-slate-800 ${item.status !== "processing" && item.status !== "complete" ? "cursor-pointer hover:text-[#2878C4]" : ""}`}
              >
                {f.value || <span className="text-slate-300 italic">Not set</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      {item.notes && (
        <div className="text-sm">
          <span className="text-xs font-medium text-slate-500">Notes</span>
          <p className="text-slate-700 mt-0.5">{item.notes}</p>
        </div>
      )}

      {/* File Upload */}
      {item.status !== "complete" && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Upload Files</span>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="text-xs px-2 py-1 border border-slate-200 rounded bg-white">
              {FILE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="text-xs px-3 py-1 bg-[#2878C4] text-white rounded hover:bg-[#1a5fa0] disabled:opacity-40">
              {uploading ? "Uploading…" : "Choose File"}
            </button>
            <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.md,.txt"
              onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); e.target.value = ""; }} />
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map(f => (
            <span key={f.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-xs text-slate-600 rounded-full border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">{f.file_category}</span>
              {f.file_name}
            </span>
          ))}
        </div>
      )}

      {/* Complete: Show Results */}
      {item.status === "complete" && resultData && (
        <div className="space-y-4">
          {resultData.summary && (
            <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm font-medium text-emerald-800">Summary</p>
              <p className="text-sm text-emerald-700 mt-1">{resultData.summary}</p>
            </div>
          )}

          {/* Flags */}
          {resultData.flags && resultData.flags.length > 0 && (
            <div className="space-y-1">
              {resultData.flags.map((f, i) => (
                <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${
                  f.severity === "blocking" ? "bg-red-50 border-red-200 text-red-700"
                  : f.severity === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
                }`}>
                  <span className="font-semibold uppercase">{f.severity}:</span> {f.message}
                </div>
              ))}
            </div>
          )}

          {/* Material List */}
          {resultData.material_list && resultData.material_list.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Item</th>
                    <th className="text-right px-3 py-2">Qty</th>
                    <th className="text-left px-3 py-2">Unit</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.material_list.map((m, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 text-slate-700">{m.item}</td>
                      <td className="px-3 py-1.5 text-right text-slate-700">{m.quantity}</td>
                      <td className="px-3 py-1.5 text-slate-500">{m.unit}</td>
                      <td className="px-3 py-1.5 text-slate-400">{m.notes ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Questions for training */}
          {resultData.questions && resultData.questions.length > 0 && (
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Maxwell has questions (answering these improves future estimates):</p>
              <ul className="space-y-1">
                {resultData.questions.map((q, i) => (
                  <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-blue-400">?</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultData.notes && (
            <p className="text-xs text-slate-500 italic">{resultData.notes}</p>
          )}
        </div>
      )}

      {/* Error state */}
      {item.status === "error" && item.result && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">Processing Error</p>
          <p className="text-xs text-red-600 mt-1">{item.result}</p>
        </div>
      )}

      {/* Raw result if not parseable */}
      {item.status === "complete" && !resultData && item.result && (
        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto border border-slate-200">
          {item.result}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600">Delete Estimate</button>
      </div>
    </div>
  );
}
