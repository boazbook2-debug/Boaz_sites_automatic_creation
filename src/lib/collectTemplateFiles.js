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

// Data files that get replaced with freshly generated, client-specific
// content by the deploy route — every other file under src/data/ (like
// clients.js, the intake tool's login list) ships through as-is.
const REGENERATED_DATA_FILES = new Set([
  "src/data/agency.js",
  "src/data/agents.js",
  "src/data/properties.js",
  "src/data/testimonials.js",
  "src/data/faq.js",
  "src/data/siteConfig.js",
]);

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

  return files.filter((f) => !REGENERATED_DATA_FILES.has(f.file));
}
