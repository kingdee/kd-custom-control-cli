const fs = require("fs");
const path = require("path");

function exists(p) {
  try { return fs.existsSync(p); } catch (e) { return false; }
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, "utf8"); }
  catch (e) { return null; }
}

function writeFileSafe(p, content) {
  fs.writeFileSync(p, content, "utf8");
}

function updateKwcNameSpace(controlName) {
    const cwd = process.cwd();
    let projectRootCandidate = path.resolve(cwd, controlName);
    let projectRoot;
    if (exists(projectRootCandidate)) {
      projectRoot = projectRootCandidate;
      console.log(`Using project root: ${projectRoot} (found ${controlName} dir under current path)`);
    } else if (exists(path.join(cwd, "src"))) {
      projectRoot = cwd;
      console.log(`Using project root: ${projectRoot} (src exists in current path)`);
    } else {
      console.error(
        `Can't locate project root. Tried:\n - ${projectRootCandidate}\n - ${cwd}\n` +
        `Make sure you run this command from the correct directory or that "${controlName}" exists under current path.`
      );
      process.exit(1);
    }

    const srcDir = path.join(projectRoot, "src");
    const modulesDir = path.join(srcDir, "modules");
    const oldDir = path.join(modulesDir, "x");
    const newDir = path.join(modulesDir, controlName);

    // 1) 重命名文件夹（如果存在）
    if (!exists(modulesDir)) {
      console.warn(`Warning: "${modulesDir}" not found. Skipping folder rename.`);
    } else if (!exists(oldDir)) {
      console.warn(`Warning: "${oldDir}" not found. Skipping folder rename.`);
    } else {
      if (exists(newDir)) {
        console.error(`Destination "${newDir}" already exists. Aborting folder rename to avoid overwrite.`);
        process.exit(1);
      }
      try {
        fs.renameSync(oldDir, newDir);
        console.log(`Renamed folder: ${oldDir} -> ${newDir}`);
      } catch (err) {
        console.error("Failed to rename folder:", err.message);
        process.exit(1);
      }
    }

    // 2) 更新 src/index.js 和 src/devIndex.js 中的引用
    ["index.js", "devIndex.js"].forEach((fileName) => {
      const filePath = path.join(srcDir, fileName);
      const original = readFileSafe(filePath);
      if (original === null) {
        console.warn(`File not found: ${filePath} — skipping.`);
        return;
      }

    let updated = original;

    // 全局替换 x/ -> controlName/
    updated = updated.replace(/x\//g, `${controlName}/`);

    // 全局替换 x- -> controlName-
    updated = updated.replace(/x-/g, `${controlName}-`);

    if (updated !== original) {
      writeFileSafe(filePath, updated);
      console.log(`Updated references in: ${filePath}`);
    } else {
      console.log(`No references to replace in: ${filePath}`);
    }
    });
}

module.exports = updateKwcNameSpace;
