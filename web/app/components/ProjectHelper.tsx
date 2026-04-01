"use client";

import { useEffect, useRef, useState } from "react";

interface RefFile {
  name: string;
  size: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  fileName?: string;
}

const SUGGESTIONS = [
  "What materials do I need for a 50 SQ TPO section?",
  "How thick should tapered ISO be at the low point?",
  "What is the adhesive rate for fully adhered TPO?",
  "How many drains does Skyview at Carriage City need?",
  "Explain the cover strip rule for GS and DE metal.",
];

export default function ProjectHelper() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<RefFile[]>([]);
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [showCatalog, setShowCatalog] = useState(true);
  const [uploading, setUploading] = useState(false);

  const refInputRef = useRef<HTMLInputElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchFiles(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function fetchFiles() {
    try {
      const res = await fetch("/api/project-helper/files");
      if (res.ok) setFiles(await res.json());
    } catch { /* ignore */ }
  }

  async function uploadRef(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/api/project-helper/files", { method: "POST", body: formData });
    await fetchFiles();
    setUploading(false);
  }

  async function sendMessage() {
    const q = input.trim();
    if (!q && !chatFile) return;

    const userMsg: Message = { role: "user", content: q || "(see attachment)", fileName: chatFile?.name };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = { question: q || "Please summarize or describe this file." };

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

      const res = await fetch("/api/project-helper/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || data.error || "No response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to Maxwell." }]);
    }
    setLoading(false);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Project Helper</h2>
          <p className="text-sm text-slate-500 mt-1">
            Ask Maxwell questions about any project — reference files load automatically as context
          </p>
        </div>
        <div className="flex items-center gap-2">
          {uploading && <span className="text-xs text-slate-400">Uploading…</span>}
          <button
            onClick={() => refInputRef.current?.click()}
            className="px-4 py-2 bg-[#2878C4] text-white rounded-lg text-sm font-medium hover:bg-[#1a5fa0]"
          >
            + Add Reference File
          </button>
          <input
            ref={refInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.md,.txt,.json,.png,.jpg,.jpeg"
            onChange={e => { if (e.target.files?.[0]) uploadRef(e.target.files[0]); e.target.value = ""; }}
          />
        </div>
      </div>

      {/* Reference Catalog */}
      <div className="bg-white rounded-xl border border-slate-200">
        <button
          onClick={() => setShowCatalog(!showCatalog)}
          className="w-full px-5 py-3 flex items-center justify-between text-left"
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Reference Catalog ({files.length} file{files.length !== 1 ? "s" : ""})
          </span>
          <span className="text-slate-400 text-xs">{showCatalog ? "▲" : "▼"}</span>
        </button>
        {showCatalog && (
          <div className="px-5 pb-4 border-t border-slate-100 pt-3 flex flex-wrap gap-2">
            {files.length === 0 ? (
              <p className="text-sm text-slate-400">No files yet. Click &quot;Add Reference File&quot; to load specs, plans, or rules.</p>
            ) : files.map(f => (
              <span
                key={f.name}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f2fb] text-[#2878C4] text-xs font-medium rounded-full border border-[#2878C4]/20"
                title={formatSize(f.size)}
              >
                <FileIcon name={f.name} />
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-10">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-base font-medium text-slate-600">Ask Maxwell anything</p>
              <p className="text-sm mt-1">Type a question or tap a suggestion below</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-[#e8f2fb] hover:border-[#2878C4]/30 hover:text-[#2878C4] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-[#2878C4] text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}>
                {m.fileName && (
                  <p className="text-xs opacity-70 mb-1.5">📎 {m.fileName}</p>
                )}
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 150, 300].map(d => (
                    <span
                      key={d}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Row */}
        <div className="border-t border-slate-200 p-4">
          {chatFile && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[#e8f2fb] rounded-lg text-xs text-[#2878C4]">
              <span>📎 {chatFile.name}</span>
              <button onClick={() => setChatFile(null)} className="ml-auto text-slate-400 hover:text-red-400">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => chatFileRef.current?.click()}
              title="Attach image or PDF"
              className="px-3 py-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 text-sm"
            >
              📎
            </button>
            <input
              ref={chatFileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) setChatFile(e.target.files[0]); e.target.value = ""; }}
            />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about materials, specs, quantities, sequencing…"
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2878C4]/30 focus:border-[#2878C4]"
            />
            <button
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !chatFile)}
              className="px-5 py-2 bg-[#2878C4] text-white rounded-lg text-sm font-medium hover:bg-[#1a5fa0] disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <span>📄</span>;
  if (ext === "md" || ext === "txt") return <span>📝</span>;
  if (ext === "json") return <span>🗂️</span>;
  if (["png", "jpg", "jpeg"].includes(ext ?? "")) return <span>🖼️</span>;
  return <span>📎</span>;
}
