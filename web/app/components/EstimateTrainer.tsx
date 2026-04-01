"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrainingRule {
  id: number;
  category: string;
  subcategory: string | null;
  rule_text: string;
  confidence: string;
  times_used: number;
  created_at: string;
}

interface TrainingSession {
  id: number;
  topic: string;
  status: string;
  rules_created: number;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  fileName?: string;
  rulesExtracted?: Array<{ category: string; rule_text: string }>;
  questions?: string[];
  tokens?: { input: number; output: number; cost: number };
  modelUsed?: string;
}

const RULE_CATEGORIES = [
  "materials", "pricing", "labor", "measurements",
  "conditions", "procedures", "vendors", "specifications",
  "safety", "terminology",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EstimateTrainer() {
  const [tab, setTab] = useState<"chat" | "rules" | "sessions">("chat");

  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Training Module</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Teach Maxwell how to estimate — upload documents, answer questions, and build the rule base
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {([["chat", "Train"], ["rules", "Learned Rules"], ["sessions", "Sessions"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >{label}</button>
        ))}
      </div>

      {tab === "chat" && <TrainingChat />}
      {tab === "rules" && <RulesView />}
      {tab === "sessions" && <SessionsView />}
    </div>
  );
}

// ─── Training Chat ────────────────────────────────────────────────────────────

function TrainingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [rulesThisSession, setRulesThisSession] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Create a new session on first message
  async function ensureSession(): Promise<number> {
    if (sessionId) return sessionId;
    const res = await fetch("/api/training/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "Training Session" }),
    });
    const data = await res.json();
    setSessionId(data.id);
    return data.id;
  }

  async function sendMessage() {
    const q = input.trim();
    if (!q && !chatFile) return;

    const userMsg: Message = {
      role: "user",
      content: q || "(see attachment)",
      fileName: chatFile?.name,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const sid = await ensureSession();
      const body: Record<string, unknown> = {
        question: q || "Analyze this document and extract estimating rules.",
        session_id: sid,
        conversation: messages.map(m => ({ role: m.role, content: m.content })),
      };

      if (chatFile) {
        const buf = await chatFile.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        body.file_base64 = btoa(binary);
        body.file_type = chatFile.type;
        body.file_name = chatFile.name;
        setChatFile(null);
      }

      const res = await fetch("/api/training/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply || data.error || "No response.",
        rulesExtracted: data.rules_extracted,
        questions: data.questions,
        tokens: data.tokens,
        modelUsed: data.model_used,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.tokens?.cost) setTotalCost(prev => prev + data.tokens.cost);
      if (data.rules_extracted?.length) setRulesThisSession(prev => prev + data.rules_extracted.length);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to Maxwell." }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-3">
      {/* Session stats bar */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>Session: {sessionId ? `#${sessionId}` : "New"}</span>
        <span>Rules learned: <strong className="text-green-600">{rulesThisSession}</strong></span>
        <span>Cost: <strong className="text-slate-700">${totalCost.toFixed(4)}</strong></span>
        {sessionId && (
          <button
            onClick={() => { setSessionId(null); setMessages([]); setTotalCost(0); setRulesThisSession(0); }}
            className="ml-auto text-[#2878C4] hover:text-[#1a5fa0]"
          >
            New Session
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <div className="text-3xl mb-2">🎓</div>
              <p className="text-sm font-medium text-slate-600">Train the Estimator</p>
              <p className="text-xs mt-1 max-w-md mx-auto">
                Upload a completed estimate, walkthrough notes, or spec sheet. Maxwell will analyze it,
                extract rules, and ask questions about anything missing.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  "Here's how we calculate TPO membrane for a flat roof",
                  "I'm uploading a completed estimate — learn from this",
                  "What rules do you still need for a full TPO estimate?",
                  "Explain how we handle tapered insulation",
                ].map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 hover:bg-[#e8f2fb] hover:border-[#2878C4]/30 hover:text-[#2878C4]"
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i}>
              <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#2878C4] text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}>
                  {m.fileName && <p className="text-xs opacity-70 mb-1">📎 {m.fileName}</p>}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>

              {/* Rules extracted badge */}
              {m.rulesExtracted && m.rulesExtracted.length > 0 && (
                <div className="mt-2 ml-2 space-y-1">
                  {m.rulesExtracted.map((r, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-500 font-bold">✓ LEARNED</span>
                      <span className="text-green-700">
                        <span className="font-medium uppercase text-green-600">[{r.category}]</span> {r.rule_text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up questions */}
              {m.questions && m.questions.length > 0 && (
                <div className="mt-2 ml-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-700 mb-1">Maxwell wants to know:</p>
                  {m.questions.map((q, j) => (
                    <button key={j} onClick={() => setInput(q)}
                      className="block text-xs text-amber-600 hover:text-amber-800 mt-0.5 text-left"
                    >→ {q}</button>
                  ))}
                </div>
              )}

              {/* Token cost */}
              {m.tokens && (
                <div className="mt-1 ml-2 text-[10px] text-slate-400">
                  {m.modelUsed?.toUpperCase()} — {m.tokens.input + m.tokens.output} tokens — ${m.tokens.cost.toFixed(4)}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-3">
          {chatFile && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-[#e8f2fb] rounded-lg text-xs text-[#2878C4]">
              <span>📎 {chatFile.name}</span>
              <button onClick={() => setChatFile(null)} className="ml-auto text-slate-400 hover:text-red-400">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="px-3 py-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 text-sm">📎</button>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.md,.txt,.json" className="hidden"
              onChange={e => { if (e.target.files?.[0]) setChatFile(e.target.files[0]); e.target.value = ""; }} />
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Teach Maxwell a rule, upload a document, or ask what's missing…"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30" />
            <button onClick={sendMessage} disabled={loading || (!input.trim() && !chatFile)}
              className="px-4 py-2 bg-[#2878C4] text-white rounded-lg text-sm font-medium hover:bg-[#1a5fa0] disabled:opacity-40">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rules View ───────────────────────────────────────────────────────────────

function RulesView() {
  const [rules, setRules] = useState<TrainingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRules = useCallback(async () => {
    const res = await fetch("/api/training/rules");
    if (res.ok) setRules(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const categories = [...new Set(rules.map(r => r.category))];
  const filtered = filter === "all" ? rules : rules.filter(r => r.category === filter);

  const CONFIDENCE_COLORS: Record<string, string> = {
    assumed: "bg-slate-100 text-slate-600 border-slate-200",
    learned: "bg-blue-50 text-blue-700 border-blue-200",
    verified: "bg-green-50 text-green-700 border-green-200",
    locked: "bg-purple-50 text-purple-700 border-purple-200",
  };

  async function updateConfidence(id: number, confidence: string) {
    await fetch("/api/training/rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, confidence }),
    });
    fetchRules();
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Filter:</span>
        <button onClick={() => setFilter("all")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${filter === "all" ? "bg-[#2878C4] text-white" : "bg-slate-100 text-slate-600"}`}>
          All ({rules.length})
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${filter === c ? "bg-[#2878C4] text-white" : "bg-slate-100 text-slate-600"}`}>
            {c} ({rules.filter(r => r.category === c).length})
          </button>
        ))}
      </div>

      {/* Confidence legend */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="font-medium">Confidence:</span>
        {["assumed", "learned", "verified", "locked"].map(c => (
          <span key={c} className={`px-2 py-0.5 rounded-full border capitalize ${CONFIDENCE_COLORS[c]}`}>{c}</span>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 text-center py-8">Loading rules…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-10 text-center text-slate-400 text-sm">
          No rules learned yet — go to the Train tab and teach Maxwell
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className={`bg-white rounded-lg border px-4 py-3 ${CONFIDENCE_COLORS[r.confidence] || "border-slate-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{r.category}{r.subcategory ? ` > ${r.subcategory}` : ""}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${CONFIDENCE_COLORS[r.confidence]}`}>{r.confidence}</span>
                  </div>
                  <p className="text-sm text-slate-700">{r.rule_text}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Used {r.times_used}x — {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <select value={r.confidence} onChange={e => updateConfidence(r.id, e.target.value)}
                  className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded bg-white text-slate-600">
                  <option value="assumed">assumed</option>
                  <option value="learned">learned</option>
                  <option value="verified">verified</option>
                  <option value="locked">locked</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sessions View ────────────────────────────────────────────────────────────

function SessionsView() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/training/sessions").then(r => r.json()).then(setSessions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading ? (
        <div className="text-sm text-slate-400 text-center py-8">Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-10 text-center text-slate-400 text-sm">
          No training sessions yet — start one in the Train tab
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <div key={s.id} className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Session #{s.id}: {s.topic}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {new Date(s.created_at).toLocaleString()} — {s.rules_created} rule{s.rules_created !== 1 ? "s" : ""} learned
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                s.status === "active" ? "bg-green-50 text-green-600 border border-green-200" :
                s.status === "completed" ? "bg-slate-100 text-slate-600 border border-slate-200" :
                "bg-slate-50 text-slate-400 border border-slate-100"
              }`}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
