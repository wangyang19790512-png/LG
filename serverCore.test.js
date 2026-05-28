const assert = require("node:assert/strict");
const {
  authenticate,
  buildFamilyMaterialLibrary,
  createMaterial,
  createTask,
  hasPermission,
  reviewMaterial,
  updateTaskStatus
} = require("./serverCore");

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

test("authenticate returns safe user without password", () => {
  const user = authenticate([{ username: "admin", password: "123", role: "super_admin", active: true }], "admin", "123");

  assert.equal(user.username, "admin");
  assert.equal(user.password, undefined);
});

test("hasPermission enforces role permissions", () => {
  assert.equal(hasPermission({ role: "super_admin" }, "manage_users"), true);
  assert.equal(hasPermission({ role: "service_staff" }, "manage_users"), false);
});

test("createTask and updateTaskStatus keep audit trail", () => {
  const task = createTask({ title: "补齐知情同意", assigneeId: "U-1", dueDate: "2026-06-01", createdBy: "admin" }, "2026-05-27T09:00:00Z");
  const updated = updateTaskStatus(task, "已完成", "U-1", "2026-05-28T09:00:00Z");

  assert.equal(updated.status, "已完成");
  assert.equal(updated.audit.length, 2);
});

test("material review updates status", () => {
  const material = createMaterial({
    familyId: "LG-001",
    category: "知情同意",
    title: "双签知情同意书",
    fileName: "consent.pdf",
    storagePath: "uploads/consent.pdf",
    uploadedBy: "U-1"
  }, "2026-05-27T09:00:00Z");
  const reviewed = reviewMaterial(material, true, "QC-1", "通过", "2026-05-27T10:00:00Z");

  assert.equal(reviewed.reviewStatus, "已通过");
  assert.equal(reviewed.reviewedBy, "QC-1");
});

test("buildFamilyMaterialLibrary reports required material completion", () => {
  const library = buildFamilyMaterialLibrary(
    { id: "LG-001" },
    [{ familyId: "LG-001", category: "知情同意", reviewStatus: "已通过" }]
  );

  assert.equal(library.find((item) => item.category === "知情同意").complete, true);
  assert.equal(library.find((item) => item.category === "服务记录与佐证").complete, false);
});
