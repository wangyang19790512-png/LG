const assert = require("node:assert/strict");
const {
  buildAssessmentReport,
  computeCrisisStatus,
  findLowParticipationCases,
  findOverdueQualityIssues,
  generateAcceptanceBrief,
  createFamilyRecord,
  computeCourseStats,
  createLinkageNotice,
  summarizeReintegration,
  searchFamilies,
  updateFamilyRecord,
  deleteFamilyRecord,
  softDeleteFamilyRecord,
  buildArchiveChecklist,
  buildServiceGapSummary,
  exportProjectState,
  importProjectState,
  computeStaffLoadViolations,
  suggestRiskLevel,
  buildAcceptanceMetricStatus
} = require("./projectLogic");

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

test("buildAssessmentReport compares baseline and latest scores", () => {
  const report = buildAssessmentReport([
    { familyId: "LG-001", scale: "MHT", phase: "前测", score: 72, positive: true, date: "2026-05-29" },
    { familyId: "LG-001", scale: "MHT", phase: "后测", score: 48, positive: false, date: "2026-09-20" }
  ]);

  assert.equal(report.familyId, "LG-001");
  assert.equal(report.delta, -24);
  assert.equal(report.improved, true);
  assert.equal(report.conclusion, "阳性转阴，干预有效");
});

test("computeCrisisStatus marks overdue level-1 events by SLA", () => {
  const status = computeCrisisStatus({
    level: 1,
    reportedAt: "2026-06-10T09:00:00+08:00",
    closedAt: null,
    medicalReferralAt: null
  }, new Date("2026-06-10T12:30:00+08:00"));

  assert.equal(status.responseLimitHours, 2);
  assert.equal(status.referralLimitHours, 24);
  assert.equal(status.overdue, true);
  assert.equal(status.nextAction, "立即补齐四方上报，并启动医疗转介跟踪");
});

test("findLowParticipationCases flags low group and parent participation", () => {
  const flagged = findLowParticipationCases([
    { id: "LG-001", student: "陈同学", groupDone: 1, groupTarget: 4, parentDone: 0, parentTarget: 2 },
    { id: "LG-002", student: "吴同学", groupDone: 4, groupTarget: 4, parentDone: 2, parentTarget: 2 }
  ]);

  assert.deepEqual(flagged.map((item) => item.id), ["LG-001"]);
  assert.equal(flagged[0].reasons.includes("团辅参与率低于80%"), true);
  assert.equal(flagged[0].reasons.includes("家长参与率低于80%"), true);
});

test("findOverdueQualityIssues detects unresolved整改", () => {
  const overdue = findOverdueQualityIssues([
    { id: "Q-1", title: "缺签到", dueDate: "2026-06-12", status: "open" },
    { id: "Q-2", title: "已复核", dueDate: "2026-06-01", status: "closed" }
  ], new Date("2026-06-13T09:00:00+08:00"));

  assert.deepEqual(overdue.map((item) => item.id), ["Q-1"]);
});

test("generateAcceptanceBrief includes midterm and final sections", () => {
  const brief = generateAcceptanceBrief({
    families: [{ id: "LG-001", consent: true, archive: { consent: true, baseline: true } }],
    assessments: [],
    crisisEvents: [],
    qualityIssues: [],
    supervisionLogs: []
  });

  assert.match(brief, /中期验收汇编/);
  assert.match(brief, /终期验收汇编/);
  assert.match(brief, /知情同意签署率/);
});

test("createFamilyRecord builds a default manual archive record", () => {
  const family = createFamilyRecord(
    {
      student: "新同学",
      school: "龙岗学校",
      grade: "初一",
      guardian: "张女士",
      risk: "yellow"
    },
    [{ id: "LG-001" }, { id: "LG-014" }]
  );

  assert.equal(family.id, "LG-015");
  assert.equal(family.consent, false);
  assert.equal(family.baseline, false);
  assert.equal(family.archive.consent, false);
  assert.equal(family.counselingTarget, 10);
  assert.equal(family.groupTarget, 4);
  assert.equal(family.nextTask, "补齐双签知情同意");
});

test("computeCourseStats reports course watch completion", () => {
  const stats = computeCourseStats([
    { familyId: "LG-001", courseId: "P-1", watchedMinutes: 55, totalMinutes: 60 },
    { familyId: "LG-002", courseId: "P-1", watchedMinutes: 10, totalMinutes: 60 }
  ]);

  assert.equal(stats.totalRecords, 2);
  assert.equal(stats.completedRecords, 1);
  assert.equal(stats.completionRate, 50);
});

test("createLinkageNotice builds a routed collaboration notice", () => {
  const notice = createLinkageNotice({
    familyId: "LG-001",
    type: "复学准备",
    channels: ["家长", "学校", "社区"],
    content: "协调复学前支持计划"
  });

  assert.equal(notice.status, "待发送");
  assert.equal(notice.channelsText, "家长、学校、社区");
  assert.match(notice.title, /LG-001/);
});

test("summarizeReintegration calculates return-to-school progress", () => {
  const result = summarizeReintegration([
    { familyId: "LG-001", status: "已复学", attendanceRate: 95, adaptationScore: 82 },
    { familyId: "LG-002", status: "试复学", attendanceRate: 60, adaptationScore: 58 }
  ]);

  assert.equal(result.returnedCount, 1);
  assert.equal(result.returnRate, 50);
  assert.equal(result.averageAdaptationScore, 70);
});

test("searchFamilies searches id, student, school, guardian, grade, risk labels, and next task", () => {
  const results = searchFamilies([
    { id: "LG-001", student: "陈同学", school: "龙岗实验", guardian: "陈女士", grade: "初二", risk: "red", nextTask: "补齐危机记录" },
    { id: "LG-002", student: "黄同学", school: "坂田学校", guardian: "黄先生", grade: "高一", risk: "blue", nextTask: "补齐知情同意" }
  ], "红码 危机");

  assert.deepEqual(results.map((item) => item.id), ["LG-001"]);
});

test("updateFamilyRecord edits allowed fields while preserving counters and archive", () => {
  const original = {
    id: "LG-001",
    student: "陈同学",
    school: "旧学校",
    grade: "初二",
    guardian: "陈女士",
    risk: "red",
    counselingDone: 3,
    archive: { consent: true }
  };
  const updated = updateFamilyRecord(original, { school: "新学校", risk: "yellow", guardian: "陈先生" });

  assert.equal(updated.school, "新学校");
  assert.equal(updated.risk, "yellow");
  assert.equal(updated.counselingDone, 3);
  assert.deepEqual(updated.archive, { consent: true });
});

test("deleteFamilyRecord removes one record by id", () => {
  const remaining = deleteFamilyRecord([{ id: "LG-001" }, { id: "LG-002" }], "LG-001");

  assert.deepEqual(remaining.map((item) => item.id), ["LG-002"]);
});

test("softDeleteFamilyRecord marks a record deleted and keeps audit fields", () => {
  const deleted = softDeleteFamilyRecord(
    { id: "LG-001", student: "陈同学", deleted: false },
    "录入重复",
    "项目主管",
    "2026-06-13T09:00:00+08:00"
  );

  assert.equal(deleted.deleted, true);
  assert.equal(deleted.deletedReason, "录入重复");
  assert.equal(deleted.deletedBy, "项目主管");
  assert.equal(deleted.deletedAt, "2026-06-13T09:00:00+08:00");
});

test("buildArchiveChecklist reports missing required archive materials", () => {
  const checklist = buildArchiveChecklist({
    id: "LG-001",
    consent: true,
    baseline: false,
    planApproved: true,
    archive: { consent: true, baseline: false, plan: true, serviceEvidence: false, qc: false }
  });

  assert.equal(checklist.complete, false);
  assert.deepEqual(checklist.missingLabels, ["初访与基线评估", "服务记录与佐证", "质控审核记录"]);
});

test("buildServiceGapSummary compares current service counts to project targets", () => {
  const summary = buildServiceGapSummary({
    counselingDone: 4,
    counselingTarget: 10,
    groupDone: 2,
    groupTarget: 4,
    parentDone: 1,
    parentTarget: 2
  });

  assert.equal(summary.complete, false);
  assert.deepEqual(summary.gaps.map((gap) => gap.label), ["学生个案辅导", "学生团辅", "家长服务"]);
});

test("exportProjectState and importProjectState round trip data", () => {
  const state = { version: 1, families: [{ id: "LG-001" }], auditLogs: [{ action: "test" }] };
  const exported = exportProjectState(state);
  const imported = importProjectState(exported);

  assert.deepEqual(imported.families, state.families);
  assert.deepEqual(imported.auditLogs, state.auditLogs);
});

test("computeStaffLoadViolations enforces formal consultant load limits", () => {
  const violations = computeStaffLoadViolations(
    [{ id: "U-1", name: "李咨询师", role: "咨询师" }],
    [
      { id: "LG-001", counselorId: "U-1", risk: "red" },
      { id: "LG-002", counselorId: "U-1", risk: "red" },
      { id: "LG-003", counselorId: "U-1", risk: "red" },
      { id: "LG-004", counselorId: "U-1", risk: "blue" },
      { id: "LG-005", counselorId: "U-1", risk: "blue" },
      { id: "LG-006", counselorId: "U-1", risk: "blue" },
      { id: "LG-007", counselorId: "U-1", risk: "yellow" }
    ]
  );

  assert.equal(violations[0].totalOverload, true);
  assert.equal(violations[0].redOverload, true);
});

test("suggestRiskLevel returns recommendation and requires manual confirmation", () => {
  const suggestion = suggestRiskLevel({
    assessmentPositive: true,
    schoolConcern: true,
    crisisLevel: 2
  });

  assert.equal(suggestion.suggestedRisk, "red");
  assert.equal(suggestion.requiresManualConfirmation, true);
});

test("buildAcceptanceMetricStatus uses adjusted midterm targets and 9/30 final date", () => {
  const status = buildAcceptanceMetricStatus({
    individualCompletionRate: 52,
    groupSessionCount: 20,
    parentCourseCompletionRate: 100,
    teacherTrainingCompletionRate: 30,
    archiveCompletionRate: 100
  });

  assert.equal(status.midtermDateRange, "2026-06-25 至 2026-06-30");
  assert.equal(status.finalDateRange, "2026-09-25 至 2026-09-30");
  assert.equal(status.items.every((item) => item.passed), true);
});
