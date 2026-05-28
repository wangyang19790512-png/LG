const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  authenticate,
  buildFamilyMaterialLibrary,
  createMaterial,
  createTask,
  hasPermission,
  reviewMaterial,
  updateTaskStatus
} = require("./serverCore");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const uploadDir = path.join(rootDir, "uploads");
const dbPath = path.join(dataDir, "db.json");
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf"
};

function ensureStore() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(uploadDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb(), null, 2));
  }
}

function defaultDb() {
  return {
    users: [
      { id: "U-ADMIN", username: "admin", password: "admin123", name: "项目统筹", role: "super_admin", active: true },
      { id: "U-QC", username: "qc", password: "qc123", name: "督导质控", role: "supervisor", active: true },
      { id: "U-SERVICE", username: "service", password: "service123", name: "一线服务人员", role: "service_staff", active: true },
      { id: "U-EDU", username: "edu", password: "edu123", name: "市教育局监管", role: "city_education", active: true }
    ],
    families: [],
    materials: [],
    tasks: [],
    auditLogs: []
  };
}

function readDb() {
  ensureStore();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function audit(db, action, by, detail = "") {
  db.auditLogs.unshift({
    at: new Date().toISOString(),
    action,
    by: by || "system",
    detail
  });
  db.auditLogs = db.auditLogs.slice(0, 500);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) {
        reject(new Error("请求体过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("JSON 格式错误"));
      }
    });
  });
}

function send(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  send(res, status, { error: message });
}

function getUser(req, db) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  return db.users.find((user) => user.id === token && user.active !== false) || null;
}

function requirePermission(req, res, db, permission) {
  const user = getUser(req, db);
  if (!user) {
    sendError(res, 401, "未登录");
    return null;
  }
  if (!hasPermission(user, permission)) {
    sendError(res, 403, "无权限");
    return null;
  }
  return user;
}

function requireAnyPermission(req, res, db, permissions) {
  const user = getUser(req, db);
  if (!user) {
    sendError(res, 401, "未登录");
    return null;
  }
  if (!permissions.some((permission) => hasPermission(user, permission))) {
    sendError(res, 403, "无权限");
    return null;
  }
  return user;
}

function saveUploadedFile(dataUrl, originalName) {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("附件格式必须为 data URL base64");
  const ext = path.extname(originalName || "") || ".bin";
  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const storagePath = path.join(uploadDir, fileName);
  fs.writeFileSync(storagePath, Buffer.from(match[2], "base64"));
  return {
    mimeType: match[1],
    storagePath: path.relative(rootDir, storagePath).replace(/\\/g, "/")
  };
}

async function handleApi(req, res) {
  const db = readDb();
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await parseJsonBody(req);
      const user = authenticate(db.users, body.username, body.password);
      if (!user) return sendError(res, 401, "用户名或密码错误");
      return send(res, 200, { token: user.id, user });
    }

    if (req.method === "GET" && url.pathname === "/api/state") {
      const user = requireAnyPermission(req, res, db, ["read_all", "read_reports"]);
      if (!user) return;
      return send(res, 200, {
        families: db.families,
        materials: db.materials,
        tasks: db.tasks,
        auditLogs: db.auditLogs
      });
    }

    if (req.method === "POST" && url.pathname === "/api/state") {
      const user = requirePermission(req, res, db, "write_all");
      if (!user) return;
      const body = await parseJsonBody(req);
      db.families = Array.isArray(body.families) ? body.families : db.families;
      audit(db, "同步前端状态", user.id, `families=${db.families.length}`);
      writeDb(db);
      return send(res, 200, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/api/tasks") {
      const user = getUser(req, db);
      if (!user) return sendError(res, 401, "未登录");
      const tasks = hasPermission(user, "read_all")
        ? db.tasks
        : db.tasks.filter((task) => task.assigneeId === user.id);
      return send(res, 200, { tasks });
    }

    if (req.method === "POST" && url.pathname === "/api/tasks") {
      const user = requirePermission(req, res, db, "assign_tasks");
      if (!user) return;
      const body = await parseJsonBody(req);
      const task = createTask({ ...body, createdBy: user.id });
      db.tasks.unshift(task);
      audit(db, "创建任务", user.id, task.title);
      writeDb(db);
      return send(res, 201, { task });
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/api/tasks/")) {
      const user = getUser(req, db);
      if (!user) return sendError(res, 401, "未登录");
      const id = decodeURIComponent(url.pathname.split("/").pop());
      const taskIndex = db.tasks.findIndex((task) => task.id === id);
      if (taskIndex < 0) return sendError(res, 404, "任务不存在");
      if (!hasPermission(user, "write_all") && db.tasks[taskIndex].assigneeId !== user.id) {
        return sendError(res, 403, "无权限");
      }
      const body = await parseJsonBody(req);
      db.tasks[taskIndex] = updateTaskStatus(db.tasks[taskIndex], body.status || "进行中", user.id);
      audit(db, "更新任务状态", user.id, id);
      writeDb(db);
      return send(res, 200, { task: db.tasks[taskIndex] });
    }

    if (req.method === "POST" && url.pathname === "/api/materials") {
      const user = requireAnyPermission(req, res, db, ["upload_materials", "write_all"]);
      if (!user) return;
      const body = await parseJsonBody(req);
      const saved = saveUploadedFile(body.fileData, body.fileName);
      const material = createMaterial({
        familyId: body.familyId,
        category: body.category,
        title: body.title,
        fileName: body.fileName,
        mimeType: saved.mimeType,
        storagePath: saved.storagePath,
        uploadedBy: user.id
      });
      db.materials.unshift(material);
      audit(db, "上传材料", user.id, `${body.familyId} ${body.category}`);
      writeDb(db);
      return send(res, 201, { material });
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/materials/") && url.pathname.endsWith("/review")) {
      const user = requirePermission(req, res, db, "review_materials");
      if (!user) return;
      const id = decodeURIComponent(url.pathname.split("/")[3]);
      const index = db.materials.findIndex((item) => item.id === id);
      if (index < 0) return sendError(res, 404, "材料不存在");
      const body = await parseJsonBody(req);
      db.materials[index] = reviewMaterial(db.materials[index], Boolean(body.approved), user.id, body.comment || "");
      audit(db, "审核材料", user.id, id);
      writeDb(db);
      return send(res, 200, { material: db.materials[index] });
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/families/") && url.pathname.endsWith("/materials")) {
      const user = getUser(req, db);
      if (!user) return sendError(res, 401, "未登录");
      const familyId = decodeURIComponent(url.pathname.split("/")[3]);
      const family = db.families.find((item) => item.id === familyId) || { id: familyId };
      return send(res, 200, { library: buildFamilyMaterialLibrary(family, db.materials) });
    }

    sendError(res, 404, "接口不存在");
  } catch (error) {
    sendError(res, 400, error.message);
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const safePath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.normalize(path.join(rootDir, safePath));
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

ensureStore();
http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res);
  } else {
    serveStatic(req, res);
  }
}).listen(port, () => {
  console.log(`Longgang project system running at http://localhost:${port}`);
  console.log("Default accounts: admin/admin123, qc/qc123, service/service123, edu/edu123");
});
