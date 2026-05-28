const rolePermissions = {
  super_admin: ["read_all", "write_all", "manage_users", "export_all", "review_materials", "assign_tasks"],
  group_admin: ["read_group", "write_group", "review_materials", "assign_tasks"],
  service_staff: ["read_assigned", "write_assigned", "upload_materials"],
  supervisor: ["read_all", "review_materials", "assign_rectification", "review_quality"],
  city_education: ["read_reports", "read_progress"],
  teacher: ["submit_feedback", "read_public_plan"]
};

function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  return (rolePermissions[user.role] || []).includes(permission);
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function authenticate(users, username, password) {
  const user = users.find((item) => item.username === username && item.password === password && item.active !== false);
  return user ? sanitizeUser(user) : null;
}

function createTask(input, now = new Date().toISOString()) {
  return {
    id: input.id || `TASK-${Date.now()}`,
    title: input.title.trim(),
    familyId: input.familyId || "",
    assigneeId: input.assigneeId,
    type: input.type || "服务任务",
    dueDate: input.dueDate,
    status: "未开始",
    priority: input.priority || "普通",
    createdAt: now,
    updatedAt: now,
    audit: [{ at: now, action: "创建任务", by: input.createdBy || "system" }]
  };
}

function updateTaskStatus(task, status, by, now = new Date().toISOString()) {
  return {
    ...task,
    status,
    updatedAt: now,
    audit: [...(task.audit || []), { at: now, action: `状态改为${status}`, by }]
  };
}

function createMaterial(input, now = new Date().toISOString()) {
  return {
    id: input.id || `MAT-${Date.now()}`,
    familyId: input.familyId,
    category: input.category,
    title: input.title.trim(),
    fileName: input.fileName,
    mimeType: input.mimeType || "application/octet-stream",
    storagePath: input.storagePath,
    uploadedBy: input.uploadedBy,
    uploadedAt: now,
    reviewStatus: "待审核",
    reviewComment: ""
  };
}

function reviewMaterial(material, approved, reviewer, comment = "", now = new Date().toISOString()) {
  return {
    ...material,
    reviewStatus: approved ? "已通过" : "需整改",
    reviewedBy: reviewer,
    reviewedAt: now,
    reviewComment: comment
  };
}

function buildFamilyMaterialLibrary(family, materials) {
  const required = ["知情同意", "初访与基线评估", "个性化服务方案", "服务记录与佐证", "质控审核记录"];
  const familyMaterials = materials.filter((item) => item.familyId === family.id);
  return required.map((category) => {
    const items = familyMaterials.filter((item) => item.category === category);
    return {
      category,
      count: items.length,
      approvedCount: items.filter((item) => item.reviewStatus === "已通过").length,
      complete: items.some((item) => item.reviewStatus === "已通过"),
      items
    };
  });
}

module.exports = {
  authenticate,
  buildFamilyMaterialLibrary,
  createMaterial,
  createTask,
  hasPermission,
  reviewMaterial,
  rolePermissions,
  sanitizeUser,
  updateTaskStatus
};
