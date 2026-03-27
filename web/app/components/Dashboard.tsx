"use client";

import { useState } from "react";

export default function Dashboard({ manager, employees }: any) {
  const roles = [
    { name: "manager", title: "Manager", content: manager },
    ...employees.map((emp: any) => ({
      name: emp.name,
      title: emp.name.replace(/_/g, " "),
      content: emp.content,
    })),
  ];

  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [task, setTask] = useState("");

  return (
    <main className="min-h-screen bg-white text-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Task Manager</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.name}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left rounded-xl border p-4 ${
                  selectedRole.name === role.name
                    ? "border-black bg-gray-100"
                    : "border-gray-200"
                }`}
              >
                <div className="font-semibold capitalize">{role.title}</div>
              </button>
            ))}
          </aside>

          <section className="md:col-span-2 border rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4 capitalize">
              {selectedRole.title}
            </h2>

            <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap mb-6">
              {selectedRole.content}
            </pre>

            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder={`Assign a task to ${selectedRole.title}`}
              className="w-full border p-3 rounded-lg"
            />

            <button className="mt-3 bg-black text-white px-4 py-2 rounded-lg">
              Assign Task
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}