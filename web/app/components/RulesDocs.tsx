"use client";

import React, { useCallback, useEffect, useState } from "react";

interface RuleFileInfo {
  name: string;
  path: string;
  size: number;
  modified: string;
}

interface TrainingRule {
  id: number;
  category: string;
  subcategory: string | null;
  rule_text: string;
  confidence: string;
  times_used: number;
  source_document: string | null;
  created_at: string;
}

// ─── Markdown-lite renderer ──────────────────────────────────────────────────

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.JSX.Element[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  function flushTable(key: string) {
    if (!inTable) return;
    elements.push(
      <div key={key} className="overflow-x-auto my-3">
        <table className="min-w-full text-xs border border-slate-200 rounded">
          <thead>
            <tr className="bg-slate-50">
              {tableHeaders.map((h, i) => (
                <th key={i} className="px-3 py-1.5 text-left font-semibold text-slate-600 border-b border-slate-200">{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-slate-700 border-b border-slate-100">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    inTable = false;
    tableRows = [];
    tableHeaders = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const key = `line-${i}`;

    // Table row
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const cells = line.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      // Skip separator rows
      if (cells.every(c => /^[\s-:]+$/.test(c))) continue;
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
        continue;
      }
      tableRows.push(cells);
      continue;
    } else {
      flushTable(`table-${i}`);
    }

    // Headers
    if (line.startsWith("# ")) {
      elements.push(<h1 key={key} className="text-xl font-bold text-slate-800 mt-6 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={key} className="text-lg font-semibold text-slate-700 mt-5 mb-2 border-b border-slate-100 pb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={key} className="text-sm font-semibold text-slate-600 mt-4 mb-1">{line.slice(4)}</h3>);
    }
    // Checkbox list
    else if (line.trim().startsWith("- [ ]")) {
      elements.push(
        <div key={key} className="flex items-start gap-2 ml-2 my-0.5">
          <span className="text-amber-500 text-xs mt-0.5">☐</span>
          <span className="text-sm text-slate-600">{line.trim().slice(5).trim()}</span>
        </div>
      );
    }
    // Bullet list
    else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const indent = line.search(/\S/);
      const ml = indent > 2 ? "ml-6" : "ml-2";
      const text = line.trim().slice(2);
      elements.push(
        <div key={key} className={`flex items-start gap-2 ${ml} my-0.5`}>
          <span className="text-[#2878C4] text-xs mt-1">•</span>
          <span className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: inlineMd(text) }} />
        </div>
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={key} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-[#2878C4] text-xs font-semibold mt-0.5 min-w-[16px]">{match[1]}.</span>
            <span className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: inlineMd(match[2]) }} />
          </div>
        );
      }
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={key} className="h-2" />);
    }
    // Regular paragraph
    else {
      elements.push(<p key={key} className="text-sm text-slate-600 my-1" dangerouslySetInnerHTML={{ __html: inlineMd(line) }} />);
    }
  }

  flushTable("table-end");
  return <>{elements}</>;
}

function inlineMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-800">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-700">$1</code>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// ─── File icon helper ────────────────────────────────────────────────────────

function fileIcon(name: string) {
  if (name.includes("membrane")) return "🧱";
  if (name.includes("metal") || name.includes("fabricat")) return "⚙️";
  if (name.includes("corner") || name.includes("detail")) return "📐";
  if (name.includes("quantity") || name.includes("unit")) return "📏";
  if (name.includes("abbreviat") || name.includes("legend")) return "📝";
  if (name.includes("derived")) return "🔄";
  if (name.includes("estimat")) return "💰";
  if (name.includes("workflow")) return "📋";
  return "📄";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RulesDocs() {
  const [tab, setTab] = useState<"files" | "db-rules">("files");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Rules & Docs</h2>
        <p className="text-sm text-slate-500 mt-1">Reference files, estimating rules, and training knowledge base</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {([["files", "Rule Files"], ["db-rules", "Training Rules (DB)"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >{label}</button>
        ))}
      </div>

      {tab === "files" && <FileViewer />}
      {tab === "db-rules" && <DbRulesViewer />}
    </div>
  );
}

// ─── File Viewer ─────────────────────────────────────────────────────────────

function FileViewer() {
  const [files, setFiles] = useState<RuleFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rules-docs").then(r => r.json()).then(setFiles).finally(() => setLoading(false));
  }, []);

  const loadFile = useCallback(async (name: string) => {
    setSelectedFile(name);
    setContent("");
    const res = await fetch(`/api/rules-docs?file=${encodeURIComponent(name)}`);
    const data = await res.json();
    setContent(data.content || "");
  }, []);

  // Auto-load first file
  useEffect(() => {
    if (files.length > 0 && !selectedFile) loadFile(files[0].name);
  }, [files, selectedFile, loadFile]);

  if (loading) return <div className="text-sm text-slate-400 text-center py-8">Loading files…</div>;

  return (
    <div className="flex gap-4 min-h-[500px]">
      {/* File list sidebar */}
      <div className="w-64 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Rule Files</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{files.length} files in data/rules/</p>
        </div>
        <div className="divide-y divide-slate-50">
          {files.map(f => (
            <button key={f.name} onClick={() => loadFile(f.name)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                selectedFile === f.name ? "bg-[#e8f2fb] border-l-2 border-[#2878C4]" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{fileIcon(f.name)}</span>
                <span className="text-sm font-medium text-slate-700 truncate">
                  {f.name.replace(/\.md$/, "").replace(/_/g, " ")}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 ml-6">
                {formatBytes(f.size)} — {new Date(f.modified).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content viewer */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
        {selectedFile ? (
          <>
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">{selectedFile}</h3>
                <p className="text-[10px] text-slate-400">data/rules/{selectedFile}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full font-medium">
                Active Reference
              </span>
            </div>
            <div className="p-5 overflow-y-auto max-h-[600px]">
              {content ? renderMarkdown(content) : <p className="text-sm text-slate-400">Loading…</p>}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            Select a file to view
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DB Rules Viewer ─────────────────────────────────────────────────────────

function DbRulesViewer() {
  const [rules, setRules] = useState<TrainingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRules = useCallback(async () => {
    const res = await fetch("/api/training/rules");
    if (res.ok) setRules(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const categories = [...new Set(rules.map(r => r.category))].sort();
  const filtered = filter === "all" ? rules : rules.filter(r => r.category === filter);

  const CONF_COLORS: Record<string, string> = {
    assumed: "bg-amber-50 text-amber-700 border-amber-200",
    learned: "bg-blue-50 text-blue-700 border-blue-200",
    verified: "bg-green-50 text-green-700 border-green-200",
    locked: "bg-purple-50 text-purple-700 border-purple-200",
  };

  if (loading) return <div className="text-sm text-slate-400 text-center py-8">Loading rules…</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-xs">
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex-1 text-center">
          <div className="text-2xl font-bold text-slate-800">{rules.length}</div>
          <div className="text-slate-500">Total Rules</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex-1 text-center">
          <div className="text-2xl font-bold text-green-600">{rules.filter(r => r.confidence === "verified").length}</div>
          <div className="text-slate-500">Verified</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex-1 text-center">
          <div className="text-2xl font-bold text-blue-600">{rules.filter(r => r.confidence === "learned").length}</div>
          <div className="text-slate-500">Learned</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex-1 text-center">
          <div className="text-2xl font-bold text-amber-600">{rules.filter(r => r.confidence === "assumed").length}</div>
          <div className="text-slate-500">Assumed</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex-1 text-center">
          <div className="text-2xl font-bold text-slate-600">{categories.length}</div>
          <div className="text-slate-500">Categories</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Category:</span>
        <button onClick={() => setFilter("all")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${filter === "all" ? "bg-[#2878C4] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          All ({rules.length})
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${filter === c ? "bg-[#2878C4] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {c} ({rules.filter(r => r.category === c).length})
          </button>
        ))}
      </div>

      {/* Rules list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-10 text-center text-slate-400 text-sm">
          No rules found
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {r.category}{r.subcategory ? ` › ${r.subcategory}` : ""}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${CONF_COLORS[r.confidence] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {r.confidence}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{r.rule_text}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                  {r.source_document && <span>Source: {r.source_document}</span>}
                  <span>Used {r.times_used}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
