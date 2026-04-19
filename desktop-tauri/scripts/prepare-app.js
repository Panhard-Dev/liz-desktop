const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const sourceCandidates = [
  path.join(rootDir, "frontend", ".pages-deploy"),
  path.join(rootDir, "frontend", "public"),
];
const targetDir = path.join(rootDir, "desktop-tauri", "app");

function removeDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function copyDirRecursive(source, target) {
  fs.mkdirSync(target, { recursive: true });
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, targetPath);
      continue;
    }
    fs.copyFileSync(sourcePath, targetPath);
  }
}

const sourceDir = sourceCandidates.find(dir => fs.existsSync(dir));
if (!sourceDir) {
  throw new Error(
    `Pasta de origem nao encontrada. Tentativas: ${sourceCandidates.join(", ")}`,
  );
}

removeDirRecursive(targetDir);
copyDirRecursive(sourceDir, targetDir);

console.log(`APP_READY=${targetDir}`);
