function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function byDateAsc(a, b) {
  return new Date(a.date) - new Date(b.date);
}

function buildAssessmentReport(records) {
  const sorted = [...records].sort(byDateAsc);
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];

  if (!first || !latest) {
    return {
      familyId: "",
      conclusion: "暂无测评记录",
      improved: false,
      delta: 0
    };
  }

  const delta = latest.score - first.score;
  const improved = delta < 0 || (first.positive && !latest.positive);
  let conclusion = "状态稳定，需继续观察";
  if (first.positive && !latest.positive) conclusion = "阳性转阴，干预有效";
  if (latest.positive && delta >= 0) conclusion = "仍为阳性，需调整干预方案";
  if (!first.positive && !latest.positive && delta < 0) conclusion = "分值下降，状态改善";

  return {
    familyId: first.familyId,
    scale: latest.scale,
    baselineScore: first.score,
    latestScore: latest.score,
    delta,
    improved,
    conclusion
  };
}

function hoursBetween(start, end) {
  return (new Date(end).getTime() - new Date(start).getTime()) / 36e5;
}

function computeCrisisStatus(event, now = new Date()) {
  const rules = {
    1: {
      label: "一级危机",
      responseLimitHours: 2,
      referralLimitHours: 24,
      nextAction: "立即补齐四方上报，并启动医疗转介跟踪"
    },
    2: {
      label: "二级危机",
      responseLimitHours: 48,
      referralLimitHours: null,
      nextAction: "由首席督导师牵头制定专项干预方案"
    },
    3: {
      label: "三级危机",
      responseLimitHours: 24,
      referralLimitHours: null,
      nextAction: "专属辅导师24小时内跟进情绪疏导"
    }
  };
  const rule = rules[event.level] || rules[3];
  const elapsedHours = hoursBetween(event.reportedAt, now);
  const hasResponse = Boolean(event.closedAt || event.responseAt);
  const responseOverdue = !hasResponse && elapsedHours > rule.responseLimitHours;
  const referralOverdue =
    event.level === 1 &&
    !event.medicalReferralAt &&
    elapsedHours > rule.referralLimitHours;

  return {
    ...rule,
    elapsedHours: Math.round(elapsedHours * 10) / 10,
    overdue: responseOverdue || referralOverdue,
    closed: Boolean(event.closedAt),
    nextAction: event.closedAt ? "已闭环，纳入后续跟踪" : rule.nextAction
  };
}

function findLowParticipationCases(families, threshold = 80) {
  return families
    .map((family) => {
      const groupRate = pct(family.groupDone || 0, family.groupTarget || 1);
      const parentRate = pct(family.parentDone || 0, family.parentTarget || 1);
      const reasons = [];
      if (groupRate < threshold) reasons.push("团辅参与率低于80%");
      if (parentRate < threshold) reasons.push("家长参与率低于80%");
      return { ...family, groupRate, parentRate, reasons };
    })
    .filter((family) => family.reasons.length > 0);
}

function findOverdueQualityIssues(issues, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return issues.filter((issue) => {
    const due = new Date(`${issue.dueDate}T00:00:00+08:00`);
    return issue.status !== "closed" && due < today;
  });
}

function metricLine(name, done, total, target) {
  return `${name}: ${pct(done, total)}%（${done}/${total}，目标${target}%）`;
}

function generateAcceptanceBrief(data) {
  const families = data.families || [];
  const assessments = data.assessments || [];
  const qualityIssues = data.qualityIssues || [];
  const crisisEvents = data.crisisEvents || [];
  const supervisionLogs = data.supervisionLogs || [];

  const consentDone = families.filter((family) => family.consent).length;
  const archiveDone = families.filter((family) => Object.values(family.archive || {}).every(Boolean)).length;
  const redCrisisOpen = crisisEvents.filter((event) => event.level === 1 && !event.closedAt).length;
  const overdueQuality = findOverdueQualityIssues(qualityIssues).length;
  const assessmentReports = Object.values(
    assessments.reduce((groups, record) => {
      groups[record.familyId] = groups[record.familyId] || [];
      groups[record.familyId].push(record);
      return groups;
    }, {})
  ).map(buildAssessmentReport);
  const improvedCount = assessmentReports.filter((report) => report.improved).length;

  return [
    "中期验收汇编",
    metricLine("知情同意签署率", consentDone, families.length, 100),
    metricLine("一户一档完整率", archiveDone, families.length, 100),
    `危机事件未闭环: ${redCrisisOpen} 件`,
    `督导台账记录: ${supervisionLogs.length} 条`,
    "",
    "终期验收汇编",
    `心理测评改善率: ${pct(improvedCount, assessmentReports.length)}%（目标70%）`,
    `质控整改逾期: ${overdueQuality} 项`,
    `自动生成时间: ${new Date().toLocaleString("zh-CN", { hour12: false })}`
  ].join("\n");
}

function createFamilyRecord(input, existingFamilies = []) {
  const maxNumber = existingFamilies.reduce((max, family) => {
    const match = String(family.id || "").match(/LG-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const id = `LG-${String(maxNumber + 1).padStart(3, "0")}`;
  const risk = input.risk || "blue";

  return {
    id,
    student: input.student.trim(),
    school: input.school.trim(),
    grade: input.grade.trim(),
    guardian: input.guardian.trim(),
    risk,
    riskSuggested: risk,
    riskConfirmed: false,
    consent: false,
    baseline: false,
    planApproved: false,
    counselingDone: 0,
    counselingTarget: 10,
    groupDone: 0,
    groupTarget: 4,
    parentDone: 0,
    parentTarget: 2,
    lastService: "手动建档",
    nextTask: "补齐双签知情同意",
    evidenceMissing: 0,
    crisisRecord: false,
    archive: {
      consent: false,
      baseline: false,
      plan: false,
      serviceEvidence: false,
      qc: false
    }
  };
}

function computeCourseStats(records) {
  const totalRecords = records.length;
  const completedRecords = records.filter((record) => {
    if (!record.totalMinutes) return false;
    return record.watchedMinutes / record.totalMinutes >= 0.8;
  }).length;

  return {
    totalRecords,
    completedRecords,
    completionRate: pct(completedRecords, totalRecords)
  };
}

function createLinkageNotice(input) {
  const channels = input.channels || [];
  return {
    id: `N-${Date.now().toString().slice(-6)}`,
    familyId: input.familyId,
    type: input.type,
    title: `${input.familyId} · ${input.type}联动通知`,
    channels,
    channelsText: channels.join("、"),
    content: input.content,
    status: "待发送",
    createdAt: new Date().toISOString()
  };
}

function summarizeReintegration(records) {
  const returnedCount = records.filter((record) => record.status === "已复学").length;
  const averageAdaptationScore = records.length
    ? Math.round(records.reduce((sum, record) => sum + (record.adaptationScore || 0), 0) / records.length)
    : 0;

  return {
    total: records.length,
    returnedCount,
    returnRate: pct(returnedCount, records.length),
    averageAdaptationScore
  };
}

function normalizeKeyword(value) {
  const riskLabels = { red: "红码 高危 一级", yellow: "黄码 中危 二级", blue: "蓝码 低危 三级" };
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\bred\b/g, "red 红码 高危")
    .replace(/\byellow\b/g, "yellow 黄码 中危")
    .replace(/\bblue\b/g, "blue 蓝码 低危")
    .concat(` ${riskLabels[value] || ""}`);
}

function searchFamilies(families, query, risk = "all") {
  const terms = normalizeKeyword(query).split(" ").filter(Boolean);
  return families.filter((family) => {
    if (risk !== "all" && family.risk !== risk) return false;
    const searchable = normalizeKeyword([
      family.id,
      family.student,
      family.school,
      family.guardian,
      family.grade,
      family.risk,
      family.lastService,
      family.nextTask
    ].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
}

function updateFamilyRecord(family, patch) {
  const allowed = ["student", "school", "grade", "guardian", "risk", "nextTask", "lastService"];
  return allowed.reduce((updated, key) => {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      updated[key] = typeof patch[key] === "string" ? patch[key].trim() : patch[key];
    }
    return updated;
  }, { ...family });
}

function deleteFamilyRecord(families, id) {
  return families.filter((family) => family.id !== id);
}

function softDeleteFamilyRecord(family, reason, deletedBy = "项目组", deletedAt = new Date().toISOString()) {
  return {
    ...family,
    deleted: true,
    deletedReason: reason || "未填写原因",
    deletedBy,
    deletedAt
  };
}

const archiveChecklistItems = [
  { key: "consent", label: "知情同意" },
  { key: "baseline", label: "初访与基线评估" },
  { key: "plan", label: "个性化服务方案" },
  { key: "serviceEvidence", label: "服务记录与佐证" },
  { key: "qc", label: "质控审核记录" }
];

function buildArchiveChecklist(family) {
  const items = archiveChecklistItems.map((item) => ({
    ...item,
    done: Boolean(family.archive && family.archive[item.key])
  }));
  const missingLabels = items.filter((item) => !item.done).map((item) => item.label);
  return {
    familyId: family.id,
    complete: missingLabels.length === 0,
    items,
    missingLabels
  };
}

function buildServiceGapSummary(family) {
  const definitions = [
    { key: "counseling", label: "学生个案辅导", done: family.counselingDone || 0, target: family.counselingTarget || 10 },
    { key: "group", label: "学生团辅", done: family.groupDone || 0, target: family.groupTarget || 4 },
    { key: "parent", label: "家长服务", done: family.parentDone || 0, target: family.parentTarget || 2 }
  ];
  const gaps = definitions
    .filter((item) => item.done < item.target)
    .map((item) => ({ ...item, missing: item.target - item.done, rate: pct(item.done, item.target) }));
  return {
    familyId: family.id,
    complete: gaps.length === 0,
    gaps,
    items: definitions.map((item) => ({ ...item, rate: pct(item.done, item.target) }))
  };
}

function exportProjectState(state) {
  return JSON.stringify(
    {
      ...state,
      exportedAt: new Date().toISOString()
    },
    null,
    2
  );
}

function importProjectState(payload) {
  const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  if (!parsed || !Array.isArray(parsed.families)) {
    throw new Error("导入失败：缺少 families 数据");
  }
  return parsed;
}

function computeStaffLoadViolations(staff = [], families = []) {
  return staff
    .filter((person) => person.role === "咨询师")
    .map((person) => {
      const assigned = families.filter((family) => family.counselorId === person.id && !family.deleted);
      const redAssigned = assigned.filter((family) => family.risk === "red");
      return {
        staffId: person.id,
        name: person.name,
        totalAssigned: assigned.length,
        redAssigned: redAssigned.length,
        totalLimit: 6,
        redLimit: 2,
        totalOverload: assigned.length > 6,
        redOverload: redAssigned.length > 2
      };
    })
    .filter((item) => item.totalOverload || item.redOverload);
}

function suggestRiskLevel(input) {
  let suggestedRisk = "blue";
  const reasons = [];
  if (input.assessmentPositive) reasons.push("测评阳性或需重点关注");
  if (input.schoolConcern) reasons.push("学校反馈存在明显异常");
  if (input.crisisLevel === 1 || input.crisisLevel === 2) reasons.push("存在危机预警事件");

  if (input.crisisLevel === 1 || input.crisisLevel === 2 || (input.assessmentPositive && input.schoolConcern)) {
    suggestedRisk = "red";
  } else if (input.assessmentPositive || input.schoolConcern || input.crisisLevel === 3) {
    suggestedRisk = "yellow";
  }

  return {
    suggestedRisk,
    reasons,
    requiresManualConfirmation: true
  };
}

function buildAcceptanceMetricStatus(values) {
  const items = [
    {
      key: "individualCompletionRate",
      label: "个体辅导完成率",
      current: values.individualCompletionRate || 0,
      target: 50,
      passed: (values.individualCompletionRate || 0) >= 50
    },
    {
      key: "groupSessionCount",
      label: "团辅完成场次",
      current: values.groupSessionCount || 0,
      target: 20,
      passed: (values.groupSessionCount || 0) >= 20
    },
    {
      key: "parentCourseCompletionRate",
      label: "家长线上课和辅导课完成率",
      current: values.parentCourseCompletionRate || 0,
      target: 100,
      passed: (values.parentCourseCompletionRate || 0) >= 100
    },
    {
      key: "teacherTrainingCompletionRate",
      label: "教师培训完成率",
      current: values.teacherTrainingCompletionRate || 0,
      target: 30,
      passed: (values.teacherTrainingCompletionRate || 0) >= 30
    },
    {
      key: "archiveCompletionRate",
      label: "一户一档归档率",
      current: values.archiveCompletionRate || 0,
      target: 100,
      passed: (values.archiveCompletionRate || 0) >= 100
    }
  ];

  return {
    midtermDateRange: "2026-06-25 至 2026-06-30",
    finalDateRange: "2026-09-25 至 2026-09-30",
    items
  };
}

const api = {
  buildArchiveChecklist,
  buildAssessmentReport,
  buildServiceGapSummary,
  computeCourseStats,
  computeCrisisStatus,
  computeStaffLoadViolations,
  createLinkageNotice,
  createFamilyRecord,
  deleteFamilyRecord,
  exportProjectState,
  findLowParticipationCases,
  findOverdueQualityIssues,
  generateAcceptanceBrief,
  importProjectState,
  searchFamilies,
  softDeleteFamilyRecord,
  suggestRiskLevel,
  buildAcceptanceMetricStatus,
  summarizeReintegration,
  updateFamilyRecord,
  pct
};

if (typeof module !== "undefined") {
  module.exports = api;
}

if (typeof window !== "undefined") {
  window.ProjectLogic = api;
}
