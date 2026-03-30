"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "estimates", label: "Estimates", icon: EstimatesIcon },
  { id: "material-list", label: "Material Lists", icon: MaterialIcon },
  { id: "upload", label: "Upload Field Sheet", icon: UploadIcon },
  { id: "products", label: "Products & Materials", icon: ProductsIcon },
  { id: "rules", label: "Rules & Documents", icon: RulesIcon },
  { id: "team", label: "Team", icon: TeamIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

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
function UploadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const STAT_CARDS = [
  { label: "Open Estimates", value: "0", sub: "No estimates yet", color: "border-orange-400" },
  { label: "Active Jobs", value: "0", sub: "No active jobs", color: "border-blue-400" },
  { label: "Material Lists", value: "0", sub: "No lists yet", color: "border-green-400" },
  { label: "Pending Uploads", value: "0", sub: "No uploads", color: "border-purple-400" },
];

const QUICK_ACTIONS = [
  { label: "New Estimate", section: "estimates", color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Create Material List", section: "material-list", color: "bg-blue-600 hover:bg-blue-700" },
  { label: "Upload Field Sheet", section: "upload", color: "bg-green-600 hover:bg-green-700" },
];

export default function Dashboard({ manager, employees }: any) {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f2d4a] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 12l9-9 9 9H3z" />
                <path d="M5 10v9h14v-9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Capitol</div>
              <div className="text-orange-400 text-xs font-medium">Roofing</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-xs text-slate-400">Roofing Automation System</div>
          <div className="text-xs text-slate-500">v0.1.0</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeSection === "dashboard" && (
            <DashboardHome onNavigate={setActiveSection} />
          )}
          {activeSection === "team" && (
            <TeamView manager={manager} employees={employees} />
          )}
          {activeSection === "estimates" && <ComingSoon title="Estimates" description="Build and manage roofing estimates. Per-square pricing with extras for penetrations and logistics." />}
          {activeSection === "material-list" && <ComingSoon title="Material Lists" description="Generate material lists from field data. Upload handwritten sheets for automatic conversion." />}
          {activeSection === "upload" && <ComingSoon title="Upload Field Sheet" description="Upload a photo of your handwritten field notes. The system will parse abbreviations and generate a material list." />}
          {activeSection === "products" && <ComingSoon title="Products & Materials" description="IB Roof Systems PVC product catalog with specs, coverage rates, and pricing." />}
          {activeSection === "rules" && <ComingSoon title="Rules & Documents" description="Store estimating rules, abbreviation legends, SOPs, and reference documents." />}
          {activeSection === "settings" && <ComingSoon title="Settings" description="Configure pricing, company info, tax rates, and system preferences." />}
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
        <p className="text-slate-500 mt-1">Capitol Roofing — Automation System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl p-5 border-l-4 ${card.color} shadow-sm`}>
            <div className="text-3xl font-bold text-slate-800">{card.value}</div>
            <div className="text-sm font-medium text-slate-700 mt-1">{card.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
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

      {/* System status */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">System Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Estimating Tool", status: "In Development", note: "Per-square pricing + logistics factors" },
            { name: "Material List Creator", status: "In Development", note: "Handwritten sheet → parsed list" },
            { name: "IB Products Database", status: "In Development", note: "Riley researching IBroof.com" },
            { name: "Abbreviation Legend", status: "Pending Setup", note: "Needs boss input to configure" },
            { name: "Upload & OCR", status: "Planned", note: "Photo upload + handwriting recognition" },
            { name: "Rules Engine", status: "Planned", note: "Catch missing items, enforce combos" },
          ].map((mod) => (
            <div key={mod.name} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
              <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                mod.status === "In Development" ? "bg-orange-400" :
                mod.status === "Pending Setup" ? "bg-yellow-400" : "bg-slate-300"
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

function TeamView({ manager, employees }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const all = [
    { name: "Maxwell", role: "Manager", file: "manager.md", content: manager, color: "bg-orange-500" },
    ...employees.map((emp: any) => ({
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
      <p className="text-slate-500 text-sm">Manage your AI team. Click a member to view their current task and instructions.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {all.map((member) => (
          <button
            key={member.name}
            onClick={() => setSelected(selected === member.name ? null : member.name)}
            className={`bg-white rounded-xl p-5 shadow-sm border text-left transition-all ${
              selected === member.name ? "border-orange-400 ring-1 ring-orange-400" : "border-slate-100 hover:border-slate-300"
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
      <span className="mt-4 text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">Coming Soon</span>
    </div>
  );
}
