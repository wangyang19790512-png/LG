let families = [
  {
    id: "LG-001",
    student: "陈同学",
    school: "龙岗区实验学校",
    grade: "初二",
    guardian: "陈女士",
    risk: "red",
    consent: true,
    baseline: true,
    planApproved: true,
    counselingDone: 6,
    counselingTarget: 10,
    groupDone: 3,
    groupTarget: 4,
    parentDone: 2,
    parentTarget: 2,
    lastService: "2026-06-08 学生个案辅导",
    nextTask: "24小时内补充危机跟进记录",
    evidenceMissing: 1,
    crisisRecord: false,
    archive: {
      consent: true,
      baseline: true,
      plan: true,
      serviceEvidence: false,
      qc: false
    }
  },
  {
    id: "LG-007",
    student: "刘同学",
    school: "平湖外国语学校",
    grade: "高一",
    guardian: "刘先生",
    risk: "yellow",
    consent: true,
    baseline: true,
    planApproved: true,
    counselingDone: 4,
    counselingTarget: 10,
    groupDone: 2,
    groupTarget: 4,
    parentDone: 1,
    parentTarget: 2,
    lastService: "2026-06-06 家长访谈",
    nextTask: "完成第5次个案辅导预约",
    evidenceMissing: 0,
    crisisRecord: true,
    archive: {
      consent: true,
      baseline: true,
      plan: true,
      serviceEvidence: true,
      qc: false
    }
  },
  {
    id: "LG-014",
    student: "黄同学",
    school: "横岗高级中学",
    grade: "高二",
    guardian: "黄女士",
    risk: "blue",
    consent: false,
    baseline: false,
    planApproved: false,
    counselingDone: 0,
    counselingTarget: 10,
    groupDone: 0,
    groupTarget: 4,
    parentDone: 0,
    parentTarget: 2,
    lastService: "待开展",
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
  },
  {
    id: "LG-026",
    student: "周同学",
    school: "布吉中学",
    grade: "初三",
    guardian: "周先生",
    risk: "yellow",
    consent: true,
    baseline: true,
    planApproved: false,
    counselingDone: 3,
    counselingTarget: 10,
    groupDone: 1,
    groupTarget: 4,
    parentDone: 1,
    parentTarget: 2,
    lastService: "2026-06-05 学校协同会",
    nextTask: "主管审核个性化服务方案",
    evidenceMissing: 2,
    crisisRecord: true,
    archive: {
      consent: true,
      baseline: true,
      plan: false,
      serviceEvidence: false,
      qc: true
    }
  },
  {
    id: "LG-039",
    student: "吴同学",
    school: "坂田学校",
    grade: "六年级",
    guardian: "吴女士",
    risk: "blue",
    consent: true,
    baseline: true,
    planApproved: true,
    counselingDone: 5,
    counselingTarget: 10,
    groupDone: 4,
    groupTarget: 4,
    parentDone: 2,
    parentTarget: 2,
    lastService: "2026-06-09 学生团辅",
    nextTask: "更新阶段性小结",
    evidenceMissing: 0,
    crisisRecord: true,
    archive: {
      consent: true,
      baseline: true,
      plan: true,
      serviceEvidence: true,
      qc: true
    }
  }
];

let selectedFamilyId = families[0].id;
let activeSection = "dashboard";
const undoStack = [];
const storageKey = "longgang-home-student-project-v1";
const defaultState = {};

const staffMembers = [
  { id: "U-001", name: "李咨询师", role: "咨询师", qualified: true, agreementsSigned: true },
  { id: "U-002", name: "王咨询师", role: "咨询师", qualified: true, agreementsSigned: true },
  { id: "U-003", name: "首席督导师", role: "督导师", qualified: true, agreementsSigned: true },
  { id: "U-004", name: "市教育局监管", role: "市教育局监管", qualified: true, agreementsSigned: true }
];

families[0].counselorId = "U-001";
families[1].counselorId = "U-001";
families[2].counselorId = "";
families[3].counselorId = "U-002";
families[4].counselorId = "U-002";

const candidates = [
  { id: "B-001", student: "何同学", school: "龙岗外国语学校", reason: "休学待复学", homeDuration: "3周", status: "待访谈", exclusion: "", suggestedRisk: "yellow" },
  { id: "B-002", student: "梁同学", school: "平湖中学", reason: "情绪困扰", homeDuration: "2周", status: "尝试期", exclusion: "", suggestedRisk: "blue" },
  { id: "B-003", student: "许同学", school: "坂田实验学校", reason: "严重行为问题", homeDuration: "4周", status: "已排除", exclusion: "严重行为问题", suggestedRisk: "red" }
];

const assessments = [
  { familyId: "LG-001", scale: "MHT", phase: "前测", score: 76, positive: true, date: "2026-05-29" },
  { familyId: "LG-001", scale: "MHT", phase: "中测", score: 62, positive: true, date: "2026-06-20" },
  { familyId: "LG-007", scale: "SDS", phase: "前测", score: 64, positive: true, date: "2026-05-29" },
  { familyId: "LG-007", scale: "SDS", phase: "中测", score: 51, positive: false, date: "2026-06-20" },
  { familyId: "LG-039", scale: "CDI", phase: "前测", score: 48, positive: false, date: "2026-05-28" }
];

const crisisEvents = [
  {
    id: "C-001",
    familyId: "LG-001",
    level: 1,
    source: "咨询师观察",
    reportedAt: "2026-06-10T09:00:00+08:00",
    responseAt: null,
    medicalReferralAt: null,
    closedAt: null
  },
  {
    id: "C-002",
    familyId: "LG-026",
    level: 2,
    source: "家长反馈",
    reportedAt: "2026-06-11T15:00:00+08:00",
    responseAt: "2026-06-12T10:00:00+08:00",
    medicalReferralAt: null,
    closedAt: null
  },
  {
    id: "C-003",
    familyId: "LG-039",
    level: 3,
    source: "团辅观察",
    reportedAt: "2026-06-09T11:00:00+08:00",
    responseAt: "2026-06-09T18:00:00+08:00",
    medicalReferralAt: null,
    closedAt: "2026-06-10T10:00:00+08:00"
  }
];

const qualityIssues = [
  { id: "Q-001", familyId: "LG-001", title: "危机跟进记录缺督导签名", owner: "督导质控组", dueDate: "2026-06-12", status: "open" },
  { id: "Q-002", familyId: "LG-026", title: "服务方案未完成主管审核", owner: "项目主管", dueDate: "2026-06-18", status: "open" },
  { id: "Q-003", familyId: "LG-039", title: "团辅反馈表已复核", owner: "档案专员", dueDate: "2026-06-08", status: "closed" }
];

const supervisionLogs = [
  { id: "S-001", date: "2026-05-31", type: "月度全项目督导", focus: "合规建档、风险分级、服务方案", conclusion: "要求红码个案补齐危机处置闭环。" },
  { id: "S-002", date: "2026-06-07", type: "高危专项督导", focus: "LG-001 一级危机跟踪", conclusion: "维持每日监测，补齐家校医联动记录。" },
  { id: "S-003", date: "2026-06-14", type: "中期验收预审", focus: "资料完整率与服务频次", conclusion: "低参与家庭进入攻坚台账。" }
];

const courseRecords = [
  { familyId: "LG-001", courseId: "P-1", courseName: "亲子沟通的非语言桥梁", watchedMinutes: 55, totalMinutes: 60 },
  { familyId: "LG-007", courseId: "P-1", courseName: "亲子沟通的非语言桥梁", watchedMinutes: 42, totalMinutes: 60 },
  { familyId: "LG-014", courseId: "P-2", courseName: "家庭焦虑缓解锦囊", watchedMinutes: 8, totalMinutes: 60 },
  { familyId: "LG-039", courseId: "P-2", courseName: "家庭焦虑缓解锦囊", watchedMinutes: 60, totalMinutes: 60 }
];

const teacherFeedback = [
  { id: "T-001", familyId: "LG-001", teacher: "班主任", signal: "请假频繁，复学焦虑明显", urgency: "高" },
  { id: "T-002", familyId: "LG-026", teacher: "心理老师", signal: "课堂联系意愿提升，但作息不稳定", urgency: "中" },
  { id: "T-003", familyId: "LG-039", teacher: "班主任", signal: "已能稳定参与线上班会", urgency: "低" }
];

const linkageNotices = [
  ProjectLogic.createLinkageNotice({
    familyId: "LG-001",
    type: "危机跟进",
    channels: ["家长", "学校", "医疗机构"],
    content: "补齐四方上报记录，确认医疗转介和每日监测安排。"
  }),
  ProjectLogic.createLinkageNotice({
    familyId: "LG-014",
    type: "低参与攻坚",
    channels: ["家长", "学校", "社区"],
    content: "协助完成知情同意，并确认首次访谈时间。"
  })
];

const reintegrationRecords = [
  { familyId: "LG-001", status: "试复学", attendanceRate: 60, adaptationScore: 55, barrier: "复学焦虑和同伴回避" },
  { familyId: "LG-007", status: "准备中", attendanceRate: 0, adaptationScore: 48, barrier: "作息和学习节奏未恢复" },
  { familyId: "LG-026", status: "试复学", attendanceRate: 70, adaptationScore: 62, barrier: "课堂专注波动" },
  { familyId: "LG-039", status: "已复学", attendanceRate: 95, adaptationScore: 86, barrier: "需继续巩固亲子沟通" }
];

const auditLogs = [];

const riskMeta = {
  red: { label: "红码", className: "risk-red", color: "var(--red)" },
  yellow: { label: "黄码", className: "risk-yellow", color: "var(--yellow)" },
  blue: { label: "蓝码", className: "risk-blue", color: "var(--blue)" }
};

const sectionTitles = {
  dashboard: "总览看板",
  staff: "人员资质",
  candidates: "备选准入",
  families: "家庭档案",
  assessments: "测评报告",
  services: "服务计划",
  crisis: "危机预警",
  quality: "质控整改",
  supervision: "督导汇编",
  portal: "学校协同",
  reintegration: "复学追踪",
  audit: "操作日志",
  archive: "归档质控"
};

const archiveLabels = {
  consent: "知情同意",
  baseline: "初访与基线评估",
  plan: "个性化服务方案",
  serviceEvidence: "服务记录与佐证",
  qc: "质控审核记录"
};

Object.assign(defaultState, {
  families: structuredClone(families),
  staffMembers: structuredClone(staffMembers),
  candidates: structuredClone(candidates),
  assessments: structuredClone(assessments),
  crisisEvents: structuredClone(crisisEvents),
  qualityIssues: structuredClone(qualityIssues),
  supervisionLogs: structuredClone(supervisionLogs),
  courseRecords: structuredClone(courseRecords),
  teacherFeedback: structuredClone(teacherFeedback),
  linkageNotices: structuredClone(linkageNotices),
  reintegrationRecords: structuredClone(reintegrationRecords),
  auditLogs: []
});

function currentState() {
  return {
    version: 1,
    families,
    staffMembers,
    candidates,
    assessments,
    crisisEvents,
    qualityIssues,
    supervisionLogs,
    courseRecords,
    teacherFeedback,
    linkageNotices,
    reintegrationRecords,
    auditLogs
  };
}

function replaceArray(target, source = []) {
  target.splice(0, target.length, ...structuredClone(source));
}

function applyState(state) {
  families = structuredClone(state.families || []);
  replaceArray(staffMembers, state.staffMembers || defaultState.staffMembers);
  replaceArray(candidates, state.candidates || defaultState.candidates);
  replaceArray(assessments, state.assessments || defaultState.assessments);
  replaceArray(crisisEvents, state.crisisEvents || defaultState.crisisEvents);
  replaceArray(qualityIssues, state.qualityIssues || defaultState.qualityIssues);
  replaceArray(supervisionLogs, state.supervisionLogs || defaultState.supervisionLogs);
  replaceArray(courseRecords, state.courseRecords || defaultState.courseRecords);
  replaceArray(teacherFeedback, state.teacherFeedback || defaultState.teacherFeedback);
  replaceArray(linkageNotices, state.linkageNotices || defaultState.linkageNotices);
  replaceArray(reintegrationRecords, state.reintegrationRecords || defaultState.reintegrationRecords);
  replaceArray(auditLogs, state.auditLogs || defaultState.auditLogs);
  selectedFamilyId = families.find((family) => !family.deleted)?.id || families[0]?.id || "";
}

function saveState() {
  localStorage.setItem(storageKey, ProjectLogic.exportProjectState(currentState()));
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  try {
    applyState(ProjectLogic.importProjectState(saved));
  } catch (error) {
    console.warn(error);
  }
}

function recordAudit(action, targetId, detail = "") {
  auditLogs.unshift({
    at: new Date().toLocaleString("zh-CN", { hour12: false }),
    action,
    targetId,
    detail
  });
  if (auditLogs.length > 100) auditLogs.pop();
}

function getFilteredFamilies() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();
  const risk = document.querySelector("#riskFilter").value;
  return ProjectLogic.searchFamilies(families.filter((family) => !family.deleted), keyword, risk);
}

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function badgeForRisk(risk) {
  const meta = riskMeta[risk];
  return `<span class="badge ${meta.className}">${meta.label}</span>`;
}

function statusText(done) {
  return done ? '<span class="ok">已完成</span>' : '<span class="missing">缺失</span>';
}

function snapshot(label) {
  undoStack.push({
    label,
    families: structuredClone(families),
    staffMembers: structuredClone(staffMembers),
    candidates: structuredClone(candidates),
    assessments: structuredClone(assessments),
    crisisEvents: structuredClone(crisisEvents),
    qualityIssues: structuredClone(qualityIssues),
    linkageNotices: structuredClone(linkageNotices),
    selectedFamilyId
  });
  if (undoStack.length > 20) undoStack.shift();
  refreshUndoState();
}

function commit(action, targetId, detail = "") {
  recordAudit(action, targetId, detail);
  saveState();
}

function refreshUndoState() {
  const button = document.querySelector("#undoBtn");
  if (!button) return;
  const last = undoStack[undoStack.length - 1];
  button.disabled = !last;
  button.textContent = last ? `回退：${last.label}` : "回退";
}

function restoreArray(target, source) {
  target.splice(0, target.length, ...structuredClone(source));
}

function computeGaps(source = families) {
  const gaps = [];
  const lowParticipation = new Set(ProjectLogic.findLowParticipationCases(source).map((family) => family.id));
  const overdueCrisisIds = new Set(
    crisisEvents
      .filter((event) => ProjectLogic.computeCrisisStatus(event, new Date("2026-06-13T09:00:00+08:00")).overdue)
      .map((event) => event.familyId)
  );
  source.forEach((family) => {
    if (!family.consent) {
      gaps.push({
        id: family.id,
        title: "知情同意未完成",
        detail: `${family.student} 尚未双签，系统应拦截测评与心理服务。`,
        level: "高"
      });
    }
    if (family.consent && !family.baseline) {
      gaps.push({
        id: family.id,
        title: "基线评估缺失",
        detail: "缺少初访或前测，无法形成正式服务计划。",
        level: "中"
      });
    }
    if (family.baseline && !family.planApproved) {
      gaps.push({
        id: family.id,
        title: "服务方案待审核",
        detail: "已建档但个性化服务方案未完成主管审核。",
        level: "中"
      });
    }
    if (family.risk === "red" && !family.crisisRecord) {
      gaps.push({
        id: family.id,
        title: "红码缺危机处置记录",
        detail: "红码个案必须绑定上报、督导或转介闭环记录。",
        level: "高"
      });
    }
    if (family.counselingDone < family.counselingTarget) {
      gaps.push({
        id: family.id,
        title: "个案辅导频次不足",
        detail: `已完成 ${family.counselingDone}/${family.counselingTarget} 次。`,
        level: "中"
      });
    }
    if (family.evidenceMissing > 0) {
      gaps.push({
        id: family.id,
        title: "服务佐证待补",
        detail: `仍有 ${family.evidenceMissing} 条服务记录缺签到、照片或复盘材料。`,
        level: "中"
      });
    }
    if (lowParticipation.has(family.id)) {
      gaps.push({
        id: family.id,
        title: "低参与预警",
        detail: "团辅或家长服务参与率低于80%，需联动学校、社区攻坚。",
        level: "中"
      });
    }
    if (overdueCrisisIds.has(family.id)) {
      gaps.push({
        id: family.id,
        title: "危机处置超时",
        detail: "危机事件已超过方案规定响应时限。",
        level: "高"
      });
    }
  });
  return gaps;
}

function renderMetrics() {
  const activeFamilies = families.filter((family) => !family.deleted);
  const total = activeFamilies.length;
  const consentDone = activeFamilies.filter((f) => f.consent).length;
  const archiveComplete = activeFamilies.filter((f) => Object.values(f.archive).every(Boolean)).length;
  const avgCounseling = total
    ? Math.round(activeFamilies.reduce((sum, f) => sum + pct(f.counselingDone, f.counselingTarget), 0) / total)
    : 0;
  const redCount = activeFamilies.filter((f) => f.risk === "red").length;
  const lowParticipationCount = ProjectLogic.findLowParticipationCases(activeFamilies).length;
  const overdueQuality = ProjectLogic.findOverdueQualityIssues(qualityIssues, new Date("2026-06-13T09:00:00+08:00")).length;
  const courseStats = ProjectLogic.computeCourseStats(courseRecords);
  const reintegration = ProjectLogic.summarizeReintegration(reintegrationRecords);
  const metrics = [
    ["正式档案", `${total}/60`, "当前为原型示例数据"],
    ["知情同意完成率", `${pct(consentDone, total)}%`, `${consentDone} 户已双签`],
    ["个案辅导平均进度", `${avgCounseling}%`, "目标每名学生至少 10 次"],
    ["完整归档率", `${pct(archiveComplete, total)}%`, `${redCount} 个红码需重点跟踪`],
    ["低参与预警", `${lowParticipationCount} 户`, "低于80%进入攻坚台账"],
    ["质控逾期", `${overdueQuality} 项`, "逾期整改需主管复核"],
    ["测评记录", `${assessments.length} 条`, "支持前测/中测/后测对比"],
    ["督导记录", `${supervisionLogs.length} 条`, "月度督导与高危专项督导"],
    ["家长课程完成", `${courseStats.completionRate}%`, "观看达到80%视为完成"],
    ["复学转化率", `${reintegration.returnRate}%`, "终期目标不低于60%"]
  ];

  document.querySelector("#metricGrid").innerHTML = metrics
    .map(
      ([label, value, note]) => `
        <article class="metric-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <p>${note}</p>
        </article>
      `
    )
    .join("");
}

function renderGaps() {
  const gaps = computeGaps(getFilteredFamilies()).slice(0, 8);
  document.querySelector("#gapCount").textContent = `${gaps.length} 项`;
  document.querySelector("#gapList").innerHTML = gaps.length
    ? gaps
        .map(
          (gap) => `
            <article class="gap-item">
              <strong>${gap.id}</strong>
              <div>
                <strong>${gap.title}</strong>
                <p>${gap.detail}</p>
              </div>
              <span class="badge ${gap.level === "高" ? "risk-red" : "badge-warn"}">${gap.level}</span>
            </article>
          `
        )
        .join("")
    : '<p class="muted">当前筛选范围内暂无验收缺口。</p>';
}

function renderRiskBars() {
  const activeFamilies = families.filter((family) => !family.deleted);
  const total = activeFamilies.length;
  document.querySelector("#riskBars").innerHTML = Object.entries(riskMeta)
    .map(([risk, meta]) => {
      const count = activeFamilies.filter((family) => family.risk === risk).length;
      return `
        <div class="risk-bar-row">
          <div class="risk-bar-label">
            <span>${meta.label}</span>
            <strong>${count} 户</strong>
          </div>
          <div class="risk-track">
            <div class="risk-fill" style="width: ${pct(count, total)}%; background: ${meta.color};"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAcceptanceStatus() {
  const activeFamilies = families.filter((family) => !family.deleted);
  const archiveComplete = activeFamilies.filter((family) => Object.values(family.archive).every(Boolean)).length;
  const avgCounseling = activeFamilies.length
    ? Math.round(activeFamilies.reduce((sum, f) => sum + pct(f.counselingDone, f.counselingTarget), 0) / activeFamilies.length)
    : 0;
  const status = ProjectLogic.buildAcceptanceMetricStatus({
    individualCompletionRate: avgCounseling,
    groupSessionCount: Math.max(...activeFamilies.map((family) => family.groupDone || 0), 0) * 5,
    parentCourseCompletionRate: ProjectLogic.computeCourseStats(courseRecords).completionRate,
    teacherTrainingCompletionRate: 30,
    archiveCompletionRate: pct(archiveComplete, activeFamilies.length)
  });
  document.querySelector("#acceptanceStatus").innerHTML = `
    <article class="stack-card">
      <strong>中期：${status.midtermDateRange}</strong>
      <p>终期：${status.finalDateRange}</p>
    </article>
    ${status.items.map((item) => `
      <article class="stack-card ${item.passed ? "" : "danger-card"}">
        <header>
          <strong>${item.label}</strong>
          <span class="badge ${item.passed ? "badge-info" : "badge-warn"}">${item.current}/${item.target}</span>
        </header>
      </article>
    `).join("")}
  `;
}

function renderFamilyList() {
  const filtered = getFilteredFamilies();
  document.querySelector("#familyCount").textContent = `${filtered.length} 户`;
  document.querySelector("#familyList").innerHTML = filtered
    .map(
      (family) => `
        <button class="family-card ${family.id === selectedFamilyId ? "active" : ""}" data-family-id="${family.id}">
          <header>
            <strong>${family.id} · ${family.student}</strong>
            ${badgeForRisk(family.risk)}
          </header>
          <p>${family.school} · ${family.grade} · 监护人 ${family.guardian}</p>
        </button>
      `
    )
    .join("");

  if (!filtered.some((family) => family.id === selectedFamilyId) && filtered[0]) {
    selectedFamilyId = filtered[0].id;
  }
  renderFamilyDetail();
}

function renderFamilyDetail() {
  const family = families.find((item) => item.id === selectedFamilyId) || getFilteredFamilies()[0];
  const detailStatus = document.querySelector("#detailStatus");
  if (!family) {
    document.querySelector("#familyDetail").innerHTML = '<p class="muted">没有匹配的家庭档案。</p>';
    detailStatus.textContent = "";
    detailStatus.className = "badge";
    return;
  }

  selectedFamilyId = family.id;
  detailStatus.textContent = riskMeta[family.risk].label;
  detailStatus.className = `badge ${riskMeta[family.risk].className}`;
  document.querySelector("#familyDetail").innerHTML = `
    <div class="detail-title">
      <div>
        <h3>${family.student} · ${family.id}</h3>
        <p class="muted">${family.school} / ${family.grade}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-box"><span>监护人</span><strong>${family.guardian}</strong></div>
      <div class="detail-box"><span>知情同意</span><strong>${family.consent ? "已双签" : "未完成"}</strong></div>
      <div class="detail-box"><span>基线评估</span><strong>${family.baseline ? "已完成" : "未完成"}</strong></div>
      <div class="detail-box"><span>服务方案</span><strong>${family.planApproved ? "已审核" : "待审核"}</strong></div>
      <div class="detail-box"><span>风险等级</span><strong>${family.riskConfirmed ? "人工已确认" : "建议等级待确认"}</strong></div>
    </div>
    <div class="detail-box">
      <span>个案辅导进度</span>
      <strong>${family.counselingDone}/${family.counselingTarget} 次</strong>
      <div class="progress"><i style="width: ${pct(family.counselingDone, family.counselingTarget)}%"></i></div>
    </div>
    <div class="detail-box">
      <span>下一控制动作</span>
      <strong>${family.nextTask}</strong>
    </div>
  `;
  fillEditFamilyForm(family);
}

function fillEditFamilyForm(family) {
  document.querySelector("#editStudent").value = family.student;
  document.querySelector("#editSchool").value = family.school;
  document.querySelector("#editGrade").value = family.grade;
  document.querySelector("#editGuardian").value = family.guardian;
  document.querySelector("#editRisk").value = family.risk;
  document.querySelector("#editNextTask").value = family.nextTask || "";
}

function renderServiceRows() {
  const rows = getFilteredFamilies()
    .map(
      (family) => `
        <tr>
          <td>${family.id}</td>
          <td>${family.student}<br><span class="muted">${family.school}</span></td>
          <td>${badgeForRisk(family.risk)}</td>
          <td>${family.counselingDone}/${family.counselingTarget}</td>
          <td>${family.groupDone} 次</td>
          <td>${family.lastService}</td>
          <td>${family.nextTask}</td>
        </tr>
      `
    )
    .join("");
  document.querySelector("#serviceRows").innerHTML = rows || '<tr><td colspan="7">没有匹配记录。</td></tr>';
}

function renderServiceOptions() {
  document.querySelector("#serviceFamily").innerHTML = families
    .filter((family) => !family.deleted)
    .map((family) => `<option value="${family.id}">${family.id} · ${family.student}</option>`)
    .join("");
}

function renderFamilyOptions(selector) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.innerHTML = families
    .filter((family) => !family.deleted)
    .map((family) => `<option value="${family.id}">${family.id} · ${family.student}</option>`)
    .join("");
}

function renderStaff() {
  const violations = ProjectLogic.computeStaffLoadViolations(staffMembers, families);
  document.querySelector("#staffLoadBadge").textContent = `${violations.length} 项超限`;
  document.querySelector("#staffList").innerHTML = staffMembers
    .map((person) => {
      const assigned = families.filter((family) => family.counselorId === person.id && !family.deleted);
      const redAssigned = assigned.filter((family) => family.risk === "red");
      const violation = violations.find((item) => item.staffId === person.id);
      return `
        <article class="stack-card ${violation ? "danger-card" : ""}">
          <header>
            <strong>${person.name} · ${person.role}</strong>
            <span class="badge ${person.qualified && person.agreementsSigned ? "badge-info" : "risk-red"}">${person.qualified && person.agreementsSigned ? "可上岗" : "禁止派单"}</span>
          </header>
          <p>资质：${person.qualified ? "已审核" : "待审核"}；协议：${person.agreementsSigned ? "已签署" : "未签署"}</p>
          <p>负荷：${assigned.length}/6；红码：${redAssigned.length}/2${violation ? "，已超限" : ""}</p>
        </article>
      `;
    })
    .join("");
}

function renderCandidates() {
  document.querySelector("#candidateList").innerHTML = candidates
    .map((candidate) => `
      <article class="stack-card ${candidate.status === "已排除" ? "danger-card" : ""}">
        <header>
          <strong>${candidate.id} · ${candidate.student}</strong>
          <span class="badge ${candidate.status === "已排除" ? "risk-red" : "badge-info"}">${candidate.status}</span>
        </header>
        <p>${candidate.school}；${candidate.reason}；${candidate.homeDuration}</p>
        <p>系统建议等级：${riskMeta[candidate.suggestedRisk]?.label || "待评估"}，需人工确认后进入正式档案。</p>
        ${candidate.exclusion ? `<p>排除原因：${candidate.exclusion}</p>` : ""}
        <div class="inline-actions">
          ${candidate.status !== "已准入" && candidate.status !== "已排除" ? `<button class="link-button" data-admit-candidate="${candidate.id}">准入建档</button>` : ""}
          ${candidate.status !== "已排除" ? `<button class="link-button danger-inline" data-exclude-candidate="${candidate.id}">标记排除</button>` : ""}
        </div>
      </article>
    `)
    .join("");
}

function familyName(id) {
  const family = families.find((item) => item.id === id);
  return family ? `${family.id} · ${family.student}` : id;
}

function groupedAssessments() {
  return Object.values(
    assessments.reduce((groups, record) => {
      groups[record.familyId] = groups[record.familyId] || [];
      groups[record.familyId].push(record);
      return groups;
    }, {})
  );
}

function renderAssessments() {
  const groups = groupedAssessments();
  document.querySelector("#assessmentCount").textContent = `${assessments.length} 条`;
  document.querySelector("#assessmentReports").innerHTML = groups
    .map((records) => {
      const report = ProjectLogic.buildAssessmentReport(records);
      return `
        <article class="stack-card">
          <header>
            <strong>${familyName(report.familyId)}</strong>
            <span class="badge ${report.improved ? "badge-info" : "badge-warn"}">${report.conclusion}</span>
          </header>
          <p>${report.scale || "未选择量表"}：${report.baselineScore ?? "-"} → ${report.latestScore ?? "-"}，变化 ${report.delta}</p>
          <div class="mini-log">
            ${records.map((item) => `<span>${item.date} ${item.phase} ${item.score}分${item.positive ? " 阳性" : ""}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCrisis() {
  const now = new Date("2026-06-13T09:00:00+08:00");
  document.querySelector("#crisisList").innerHTML = crisisEvents
    .map((event) => {
      const status = ProjectLogic.computeCrisisStatus(event, now);
      return `
        <article class="stack-card ${status.overdue ? "danger-card" : ""}">
          <header>
            <strong>${event.id} · ${familyName(event.familyId)}</strong>
            <span class="badge ${status.overdue ? "risk-red" : "badge-info"}">${status.label}${status.overdue ? " 超时" : ""}</span>
          </header>
          <p>来源：${event.source}；已过 ${status.elapsedHours} 小时；响应时限 ${status.responseLimitHours} 小时${status.referralLimitHours ? `，转介时限 ${status.referralLimitHours} 小时` : ""}。</p>
          <p><strong>下一动作：</strong>${status.nextAction}</p>
        </article>
      `;
    })
    .join("");
}

function renderQualityIssues() {
  const now = new Date("2026-06-13T09:00:00+08:00");
  const overdue = ProjectLogic.findOverdueQualityIssues(qualityIssues, now);
  document.querySelector("#qualityOverdueCount").textContent = `${overdue.length} 项逾期`;
  document.querySelector("#qualityList").innerHTML = qualityIssues
    .map((issue) => {
      const isOverdue = overdue.some((item) => item.id === issue.id);
      return `
        <article class="stack-card ${isOverdue ? "danger-card" : ""}">
          <header>
            <strong>${issue.id} · ${issue.title}</strong>
            <span class="badge ${issue.status === "closed" ? "badge-info" : isOverdue ? "risk-red" : "badge-warn"}">${issue.status === "closed" ? "已闭环" : isOverdue ? "逾期" : "整改中"}</span>
          </header>
          <p>关联：${familyName(issue.familyId)}；责任人：${issue.owner}；截止：${issue.dueDate}</p>
          ${issue.status !== "closed" ? `<button class="link-button" data-close-quality="${issue.id}">标记闭环</button>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderSupervision() {
  document.querySelector("#supervisionList").innerHTML = supervisionLogs
    .map((log) => `
      <article class="stack-card">
        <header>
          <strong>${log.date} · ${log.type}</strong>
          <span class="badge badge-info">${log.id}</span>
        </header>
        <p>重点：${log.focus}</p>
        <p>结论：${log.conclusion}</p>
      </article>
    `)
    .join("");
}

function renderAcceptanceBrief() {
  document.querySelector("#acceptanceBrief").textContent = ProjectLogic.generateAcceptanceBrief({
    families: families.filter((family) => !family.deleted),
    assessments,
    crisisEvents,
    qualityIssues,
    supervisionLogs
  });
}

function renderPortal() {
  document.querySelector("#teacherPortalList").innerHTML = teacherFeedback
    .map((item) => `
      <article class="stack-card">
        <header>
          <strong>${familyName(item.familyId)} · ${item.teacher}</strong>
          <span class="badge ${item.urgency === "高" ? "risk-red" : item.urgency === "中" ? "badge-warn" : "badge-info"}">${item.urgency}</span>
        </header>
        <p>${item.signal}</p>
      </article>
    `)
    .join("");

  document.querySelector("#noticeList").innerHTML = linkageNotices
    .map((notice) => `
      <article class="stack-card">
        <header>
          <strong>${notice.title}</strong>
          <span class="badge badge-info">${notice.status}</span>
        </header>
        <p>发送对象：${notice.channelsText}</p>
        <p>${notice.content}</p>
      </article>
    `)
    .join("");
}

function renderReintegration() {
  const summary = ProjectLogic.summarizeReintegration(reintegrationRecords);
  document.querySelector("#returnRateBadge").textContent = `复学率 ${summary.returnRate}%`;
  document.querySelector("#reintegrationGrid").innerHTML = reintegrationRecords
    .map((record) => `
      <article class="archive-card">
        <header>
          <strong>${familyName(record.familyId)}</strong>
          <span class="badge ${record.status === "已复学" ? "badge-info" : "badge-warn"}">${record.status}</span>
        </header>
        <div class="archive-items">
          <div class="archive-item"><span>出勤率</span><strong>${record.attendanceRate}%</strong></div>
          <div class="archive-item"><span>适应评分</span><strong>${record.adaptationScore}</strong></div>
          <div class="archive-item"><span>主要障碍</span><strong>${record.barrier}</strong></div>
        </div>
      </article>
    `)
    .join("");

  const courseStats = ProjectLogic.computeCourseStats(courseRecords);
  const lowParticipation = ProjectLogic.findLowParticipationCases(families.filter((family) => !family.deleted)).length;
  document.querySelector("#analysisPanel").innerHTML = `
    <article class="stack-card"><strong>平均适应评分</strong><p>${summary.averageAdaptationScore} 分，用于观察复学后稳定度。</p></article>
    <article class="stack-card"><strong>家长课程完成率</strong><p>${courseStats.completionRate}% ，低观看家庭应进入家长服务跟进。</p></article>
    <article class="stack-card"><strong>低参与家庭</strong><p>${lowParticipation} 户，需要学校和社区协助攻坚。</p></article>
  `;
}

function renderArchive() {
  document.querySelector("#archiveGrid").innerHTML = getFilteredFamilies()
    .map((family) => {
      const checklist = ProjectLogic.buildArchiveChecklist(family);
      const serviceGaps = ProjectLogic.buildServiceGapSummary(family);
      const completeCount = checklist.items.filter((item) => item.done).length;
      const total = checklist.items.length;
      return `
        <article class="archive-card">
          <header>
            <strong>${family.id} · ${family.student}</strong>
            <span class="badge">${completeCount}/${total}</span>
          </header>
          <div class="archive-items">
            ${checklist.items
              .map(
                (item) => `
                  <div class="archive-item">
                    <span>${item.label}</span>
                    ${statusText(item.done)}
                  </div>
                `
              )
              .join("")}
          </div>
          <p class="archive-gap">${checklist.complete ? "归档材料已齐" : `缺材料：${checklist.missingLabels.join("、")}`}</p>
          <p class="archive-gap">${serviceGaps.complete ? "服务频次已达标" : `缺服务：${serviceGaps.gaps.map((gap) => `${gap.label}${gap.missing}次`).join("、")}`}</p>
        </article>
      `;
    })
    .join("");
}

function renderAudit() {
  document.querySelector("#auditList").innerHTML = auditLogs.length
    ? auditLogs.map((log) => `
      <article class="stack-card">
        <header>
          <strong>${log.action}</strong>
          <span class="badge badge-info">${log.at}</span>
        </header>
        <p>对象：${log.targetId || "全项目"}</p>
        <p>${log.detail || "无补充说明"}</p>
      </article>
    `).join("")
    : '<p class="muted">暂无操作日志。</p>';

  const deleted = families.filter((family) => family.deleted);
  document.querySelector("#deletedCount").textContent = `${deleted.length} 户`;
  document.querySelector("#deletedList").innerHTML = deleted.length
    ? deleted.map((family) => `
      <article class="stack-card danger-card">
        <header>
          <strong>${family.id} · ${family.student}</strong>
          <span class="badge risk-red">已删除</span>
        </header>
        <p>原因：${family.deletedReason}</p>
        <p>操作：${family.deletedBy} · ${family.deletedAt}</p>
        <button class="link-button" data-restore-family="${family.id}">恢复档案</button>
      </article>
    `).join("")
    : '<p class="muted">暂无已删除档案。</p>';
}

function renderAll() {
  renderMetrics();
  renderGaps();
  renderRiskBars();
  renderAcceptanceStatus();
  renderStaff();
  renderCandidates();
  renderFamilyList();
  renderAssessments();
  renderServiceRows();
  renderCrisis();
  renderQualityIssues();
  renderSupervision();
  renderPortal();
  renderReintegration();
  renderArchive();
  renderAudit();
}

function switchSection(section) {
  activeSection = section;
  document.querySelector("#pageTitle").textContent = sectionTitles[section];
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === section);
  });
  document.querySelectorAll(".page-section").forEach((page) => {
    page.classList.toggle("active-section", page.id === section);
  });
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchSection(button.dataset.section));
});

document.querySelector("#searchInput").addEventListener("input", renderAll);
document.querySelector("#searchInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    renderAll();
  }
});
document.querySelector("#searchBtn").addEventListener("click", renderAll);
document.querySelector("#clearSearchBtn").addEventListener("click", () => {
  document.querySelector("#searchInput").value = "";
  document.querySelector("#riskFilter").value = "all";
  renderAll();
});
document.querySelector("#riskFilter").addEventListener("change", renderAll);

document.querySelector("#familyList").addEventListener("click", (event) => {
  const card = event.target.closest("[data-family-id]");
  if (!card) return;
  selectedFamilyId = card.dataset.familyId;
  renderFamilyList();
});

document.querySelector("#staffForm").addEventListener("submit", (event) => {
  event.preventDefault();
  snapshot("新增人员");
  const id = `U-${String(staffMembers.length + 1).padStart(3, "0")}`;
  staffMembers.push({
    id,
    name: document.querySelector("#staffName").value.trim(),
    role: document.querySelector("#staffRole").value,
    qualified: document.querySelector("#staffQualified").checked,
    agreementsSigned: document.querySelector("#staffQualified").checked
  });
  event.target.reset();
  document.querySelector("#staffQualified").checked = true;
  commit("新增人员", id, "人员资质模块录入");
  renderAll();
});

document.querySelector("#candidateForm").addEventListener("submit", (event) => {
  event.preventDefault();
  snapshot("新增备选");
  const id = `B-${String(candidates.length + 1).padStart(3, "0")}`;
  const suggestion = ProjectLogic.suggestRiskLevel({ assessmentPositive: false, schoolConcern: false, crisisLevel: null });
  candidates.push({
    id,
    student: document.querySelector("#candidateStudent").value.trim(),
    school: document.querySelector("#candidateSchool").value.trim(),
    reason: document.querySelector("#candidateReason").value.trim(),
    homeDuration: document.querySelector("#candidateHomeDuration").value.trim(),
    status: "待访谈",
    exclusion: "",
    suggestedRisk: suggestion.suggestedRisk
  });
  event.target.reset();
  commit("新增备选家庭", id, "加入备选名单池");
  renderAll();
});

document.querySelector("#candidateList").addEventListener("click", (event) => {
  const admit = event.target.closest("[data-admit-candidate]");
  const exclude = event.target.closest("[data-exclude-candidate]");
  if (!admit && !exclude) return;
  const id = admit?.dataset.admitCandidate || exclude?.dataset.excludeCandidate;
  const candidate = candidates.find((item) => item.id === id);
  if (!candidate) return;
  snapshot(admit ? "准入建档" : "排除备选");
  if (admit) {
    const family = ProjectLogic.createFamilyRecord({
      student: candidate.student,
      school: candidate.school,
      grade: "待补充",
      guardian: "待补充",
      risk: candidate.suggestedRisk
    }, families);
    family.nextTask = `人工确认风险等级（系统建议：${riskMeta[candidate.suggestedRisk].label}）`;
    family.riskSuggested = candidate.suggestedRisk;
    family.riskConfirmed = false;
    families.push(family);
    candidate.status = "已准入";
    selectedFamilyId = family.id;
    commit("备选准入建档", candidate.id, `生成正式档案 ${family.id}`);
  } else {
    const reason = window.prompt("请选择或填写排除原因：", "家庭拒绝参与") || "未填写原因";
    candidate.status = "已排除";
    candidate.exclusion = reason;
    commit("排除备选家庭", candidate.id, reason);
  }
  renderServiceOptions();
  renderFamilyOptions("#assessmentFamily");
  renderFamilyOptions("#crisisFamily");
  renderFamilyOptions("#qualityFamily");
  renderFamilyOptions("#noticeFamily");
  renderAll();
});

document.querySelector("#editFamilyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const index = families.findIndex((item) => item.id === selectedFamilyId);
  if (index < 0) return;
  snapshot("修改档案");
  families[index] = ProjectLogic.updateFamilyRecord(families[index], {
    student: document.querySelector("#editStudent").value,
    school: document.querySelector("#editSchool").value,
    grade: document.querySelector("#editGrade").value,
    guardian: document.querySelector("#editGuardian").value,
    risk: document.querySelector("#editRisk").value,
    nextTask: document.querySelector("#editNextTask").value
  });
  families[index].riskConfirmed = true;
  commit("修改档案", families[index].id, "更新基础信息");
  renderAll();
});

document.querySelector("#deleteFamilyBtn").addEventListener("click", () => {
  const family = families.find((item) => item.id === selectedFamilyId);
  if (!family) return;
  const ok = window.confirm(`确认删除 ${family.id} · ${family.student}？可用“回退”恢复。`);
  if (!ok) return;
  snapshot("删除档案");
  const reason = window.prompt("请输入删除原因，便于审计追溯：", "录入错误或重复建档") || "未填写原因";
  const index = families.findIndex((item) => item.id === selectedFamilyId);
  families[index] = ProjectLogic.softDeleteFamilyRecord(families[index], reason, "项目组");
  selectedFamilyId = families.find((item) => !item.deleted)?.id || "";
  renderServiceOptions();
  renderFamilyOptions("#assessmentFamily");
  renderFamilyOptions("#crisisFamily");
  renderFamilyOptions("#qualityFamily");
  renderFamilyOptions("#noticeFamily");
  commit("软删除档案", family.id, reason);
  renderAll();
});

document.querySelector("#undoBtn").addEventListener("click", () => {
  const last = undoStack.pop();
  if (!last) return;
  families = structuredClone(last.families);
  replaceArray(staffMembers, last.staffMembers);
  replaceArray(candidates, last.candidates);
  restoreArray(assessments, last.assessments);
  restoreArray(crisisEvents, last.crisisEvents);
  restoreArray(qualityIssues, last.qualityIssues);
  restoreArray(linkageNotices, last.linkageNotices);
  selectedFamilyId = last.selectedFamilyId;
  renderServiceOptions();
  renderFamilyOptions("#assessmentFamily");
  renderFamilyOptions("#crisisFamily");
  renderFamilyOptions("#qualityFamily");
  renderFamilyOptions("#noticeFamily");
  renderAll();
  refreshUndoState();
  saveState();
});

document.querySelector("#serviceForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.querySelector("#serviceFamily").value;
  const type = document.querySelector("#serviceType").value;
  const note = document.querySelector("#serviceNote").value.trim();
  const evidenceReady = document.querySelector("#evidenceReady").checked;
  const family = families.find((item) => item.id === id);

  if (!family) return;
  if (!family.consent && ["individual", "group", "parent"].includes(type)) {
    alert("该家庭未完成知情同意，不能登记心理服务。");
    return;
  }

  snapshot("登记服务");
  if (type === "individual") family.counselingDone += 1;
  if (type === "group") family.groupDone += 1;
  if (type === "parent") family.parentDone += 1;
  if (!evidenceReady) family.evidenceMissing += 1;
  if (evidenceReady && family.evidenceMissing > 0) family.evidenceMissing -= 1;
  family.lastService = `刚刚登记 · ${document.querySelector("#serviceType").selectedOptions[0].textContent}`;
  family.nextTask = note || "等待项目主管复核服务记录";
  family.archive.serviceEvidence = family.evidenceMissing === 0 && family.counselingDone > 0;

  document.querySelector("#serviceNote").value = "";
  document.querySelector("#evidenceReady").checked = false;
  selectedFamilyId = family.id;
  commit("登记服务", family.id, family.lastService);
  renderAll();
});

document.querySelector("#familyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  snapshot("新增档案");
  const family = ProjectLogic.createFamilyRecord(
    {
      student: document.querySelector("#newStudent").value,
      school: document.querySelector("#newSchool").value,
      grade: document.querySelector("#newGrade").value,
      guardian: document.querySelector("#newGuardian").value,
      risk: document.querySelector("#newRisk").value
    },
    families
  );

  families.push(family);
  selectedFamilyId = family.id;
  event.target.reset();
  document.querySelector("#newRisk").value = "blue";
  renderServiceOptions();
  renderFamilyOptions("#assessmentFamily");
  renderFamilyOptions("#crisisFamily");
  renderFamilyOptions("#qualityFamily");
  renderFamilyOptions("#noticeFamily");
  commit("新增档案", family.id, "手动建档");
  renderAll();
});

document.querySelector("#assessmentForm").addEventListener("submit", (event) => {
  event.preventDefault();
  snapshot("新增测评");
  const familyId = document.querySelector("#assessmentFamily").value;
  const score = Number(document.querySelector("#assessmentScore").value);
  assessments.push({
    familyId,
    scale: document.querySelector("#assessmentScale").value,
    phase: document.querySelector("#assessmentPhase").value,
    score,
    positive: document.querySelector("#assessmentPositive").checked,
    date: "2026-06-21"
  });
  const family = families.find((item) => item.id === familyId);
  if (family) {
    family.baseline = true;
    family.archive.baseline = true;
  }
  document.querySelector("#assessmentPositive").checked = false;
  commit("新增测评", familyId, `${document.querySelector("#assessmentScale").value} ${score}分`);
  renderAll();
});

document.querySelector("#crisisForm").addEventListener("submit", (event) => {
  event.preventDefault();
  snapshot("新增危机");
  const familyId = document.querySelector("#crisisFamily").value;
  const level = Number(document.querySelector("#crisisLevel").value);
  crisisEvents.unshift({
    id: `C-${String(crisisEvents.length + 1).padStart(3, "0")}`,
    familyId,
    level,
    source: document.querySelector("#crisisSource").value.trim() || "项目组记录",
    reportedAt: "2026-06-13T09:00:00+08:00",
    responseAt: null,
    medicalReferralAt: null,
    closedAt: null
  });
  const family = families.find((item) => item.id === familyId);
  if (family && level === 1) {
    family.risk = "red";
    family.crisisRecord = true;
  }
  commit("新增危机", familyId, `${level}级危机`);
  renderAll();
});

document.querySelector("#qualityForm").addEventListener("submit", (event) => {
  event.preventDefault();
  snapshot("新增整改");
  qualityIssues.unshift({
    id: `Q-${String(qualityIssues.length + 1).padStart(3, "0")}`,
    familyId: document.querySelector("#qualityFamily").value,
    title: document.querySelector("#qualityTitle").value.trim() || "待补充整改标题",
    owner: "项目主管",
    dueDate: document.querySelector("#qualityDueDate").value,
    status: "open"
  });
  commit("新增整改", document.querySelector("#qualityFamily").value, document.querySelector("#qualityTitle").value);
  renderAll();
});

document.querySelector("#noticeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  snapshot("新增通知");
  linkageNotices.unshift(ProjectLogic.createLinkageNotice({
    familyId: document.querySelector("#noticeFamily").value,
    type: document.querySelector("#noticeType").value,
    channels: ["家长", "学校", "社区"],
    content: document.querySelector("#noticeContent").value.trim() || "请相关方确认下一步协同安排。"
  }));
  document.querySelector("#noticeContent").value = "";
  commit("新增联动通知", document.querySelector("#noticeFamily").value, document.querySelector("#noticeType").value);
  renderAll();
});

document.querySelector("#qualityList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-close-quality]");
  if (!button) return;
  const issue = qualityIssues.find((item) => item.id === button.dataset.closeQuality);
  snapshot("整改闭环");
  if (issue) issue.status = "closed";
  if (issue) commit("整改闭环", issue.familyId, issue.title);
  renderAll();
});

document.querySelector("#deletedList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-restore-family]");
  if (!button) return;
  const family = families.find((item) => item.id === button.dataset.restoreFamily);
  if (!family) return;
  snapshot("恢复档案");
  family.deleted = false;
  family.deletedReason = "";
  family.deletedBy = "";
  family.deletedAt = "";
  selectedFamilyId = family.id;
  renderServiceOptions();
  renderFamilyOptions("#assessmentFamily");
  renderFamilyOptions("#crisisFamily");
  renderFamilyOptions("#qualityFamily");
  renderFamilyOptions("#noticeFamily");
  commit("恢复档案", family.id, "从已删除档案恢复");
  renderAll();
});

document.querySelector("#generateBriefBtn").addEventListener("click", renderAcceptanceBrief);

document.querySelector("#exportStateBtn").addEventListener("click", () => {
  const blob = new Blob([ProjectLogic.exportProjectState(currentState())], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `longgang-project-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#importStateInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    snapshot("导入数据");
    applyState(ProjectLogic.importProjectState(text));
    commit("导入数据", "全项目", file.name);
    renderServiceOptions();
    renderFamilyOptions("#assessmentFamily");
    renderFamilyOptions("#crisisFamily");
    renderFamilyOptions("#qualityFamily");
    renderFamilyOptions("#noticeFamily");
    renderAll();
  } catch (error) {
    alert(error.message);
  } finally {
    event.target.value = "";
  }
});

document.querySelector("#resetDemoBtn").addEventListener("click", () => {
  if (!window.confirm("确认重置为样例数据？当前本地数据会被覆盖，可先导出备份。")) return;
  snapshot("重置样例");
  applyState(defaultState);
  commit("重置样例", "全项目", "恢复内置样例数据");
  renderServiceOptions();
  renderFamilyOptions("#assessmentFamily");
  renderFamilyOptions("#crisisFamily");
  renderFamilyOptions("#qualityFamily");
  renderFamilyOptions("#noticeFamily");
  renderAll();
});

loadState();
renderServiceOptions();
renderFamilyOptions("#assessmentFamily");
renderFamilyOptions("#crisisFamily");
renderFamilyOptions("#qualityFamily");
renderFamilyOptions("#noticeFamily");
renderAll();
