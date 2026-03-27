import fs from "fs";
import path from "path";

const basePath = path.join(process.cwd(), "..");

export function getManagerDoc() {
  const filePath = path.join(basePath, "manager.md");
  return fs.readFileSync(filePath, "utf-8");
}

export function getEmployeeDocs() {
  const dirPath = path.join(basePath, "employees");
  const files = fs.readdirSync(dirPath);

  return files.map((file) => {
    const fullPath = path.join(dirPath, file);
    const content = fs.readFileSync(fullPath, "utf-8");

    return {
      name: file.replace(".md", ""),
      content,
    };
  });
}