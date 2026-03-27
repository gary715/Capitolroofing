import { getManagerDoc, getEmployeeDocs } from "../lib/loadDocs";
import Dashboard from "./components/Dashboard";

export default function Home() {
  const manager = getManagerDoc();
  const employees = getEmployeeDocs();

  return <Dashboard manager={manager} employees={employees} />;
}