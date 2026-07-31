import fs from "node:fs";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([
  ".js", ".jsx", ".mjs", ".json", ".css", ".md", ".txt",
]);

const EXCLUDED_DIRS = new Set(["node_modules", ".next", ".git", ".vercel", "uploads"]);

function walk(dir, base, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name).split(path.sep).join("/");
    if (entry.isDirectory()) {
      walk(fullPath, path.join(base, entry.name), files);
    } else {
      const ext = path.extname(entry.name);
      if (TEXT_EXTENSIONS.has(ext)) {
        files.push({ file: relPath, data: fs.readFileSync(fullPath, "utf8") });
      } else {
        files.push({ file: relPath, data: fs.readFileSync(fullPath).toString("base64"), encoding: "base64" });
      }
    }
  }
  return files;
}

// Reads the whole deployable template (src/, public/ minus uploads, and root
// config files) from disk at request time. Requires
// next.config.mjs's outputFileTracingIncludes to list these paths for this
// specific route, or the serverless function won't have them bundled.
export function collectTemplateFiles(root) {
  const files = [];
  walk(path.join(root, "src"), "src", files);
  walk(path.join(root, "public"), "public", files);

  for (const rootFile of ["package.json", "next.config.mjs", "jsconfig.json", "postcss.config.mjs"]) {
    const fullPath = path.join(root, rootFile);
    if (fs.existsSync(fullPath)) {
      files.push({ file: rootFile, data: fs.readFileSync(fullPath, "utf8") });
    }
  }

  return files.filter((f) => !f.file.startsWith("src/data/"));
}
