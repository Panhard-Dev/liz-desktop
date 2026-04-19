const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nsisDir = path.join(rootDir, "src-tauri", "target", "release", "bundle", "nsis");
const outputDir = path.join(rootDir, "dist");
const outputRootPath = path.join(rootDir, "Liz setup.exe");
const desiredName = "Liz setup.exe";
const desiredPath = path.join(outputDir, desiredName);

if (!fs.existsSync(nsisDir)) {
  throw new Error(`Pasta NSIS nao encontrada: ${nsisDir}`);
}

const candidates = fs.readdirSync(nsisDir)
  .filter(name => /^Liz_.*_x64-setup\.exe$/i.test(name))
  .map(name => path.join(nsisDir, name))
  .filter(full => fs.statSync(full).isFile())
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

if (candidates.length === 0) {
  throw new Error("Nao encontrei instalador NSIS para renomear.");
}

const latestInstaller = candidates[0];
fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(latestInstaller, desiredPath);
fs.copyFileSync(latestInstaller, outputRootPath);

console.log(`INSTALLER_SOURCE=${latestInstaller}`);
console.log(`INSTALLER_RENAMED=${desiredPath}`);
console.log(`INSTALLER_ROOT=${outputRootPath}`);
