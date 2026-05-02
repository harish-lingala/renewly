const STORAGE_KEY = "renewly.records.v2";
const today = new Date("2026-05-01T00:00:00");

const seedRecords = [
  {
    id: crypto.randomUUID(),
    category: "Automobile",
    title: "Honda City Insurance",
    type: "Insurance",
    owner: "Self",
    startDate: "2025-06-12",
    expiryDate: "2026-06-12",
    provider: "ICICI Lombard",
    referenceNumber: "POL-HC-2026",
    amount: "12450",
    coverageValue: "IDV 620000",
    vehicleNumber: "MH01AB1234",
    odometer: "42000",
    documentName: "Policy photo attached",
    notes: "Comprehensive policy with roadside assistance.",
    archived: false,
    lifecycle: "Active",
    history: ["Created demo insurance record"],
  },
  {
    id: crypto.randomUUID(),
    category: "Automobile",
    title: "Scooter PUC",
    type: "PUC",
    owner: "Shared",
    startDate: "2025-11-15",
    expiryDate: "2026-05-15",
    provider: "Local emission center",
    referenceNumber: "PUC-SCT-115",
    amount: "120",
    coverageValue: "Emission certificate",
    vehicleNumber: "MH02CD5678",
    odometer: "18500",
    documentName: "PUC certificate",
    notes: "Renew before office commute week.",
    archived: false,
    lifecycle: "Active",
    history: ["Created demo PUC record"],
  },
  {
    id: crypto.randomUUID(),
    category: "Electronics",
    title: "iPhone Warranty",
    type: "Warranty",
    owner: "Spouse",
    startDate: "2025-05-04",
    expiryDate: "2026-05-04",
    provider: "Apple Store",
    referenceNumber: "IMEI-APPLE-DEMO",
    amount: "79900",
    coverageValue: "1 year warranty",
    purchaseStore: "Apple Store",
    warrantyType: "Brand warranty",
    documentName: "Invoice photo",
    notes: "Serial number saved on invoice.",
    archived: false,
    lifecycle: "Active",
    history: ["Created demo warranty record"],
  },
  {
    id: crypto.randomUUID(),
    category: "Electronics",
    title: "AC Service Contract",
    type: "Service",
    owner: "Shared",
    startDate: "2026-01-10",
    expiryDate: "2026-07-10",
    provider: "Urban Company",
    referenceNumber: "AMC-AC-2026",
    amount: "2499",
    coverageValue: "2 routine services",
    purchaseStore: "Urban Company",
    warrantyType: "AMC",
    documentName: "AMC receipt",
    notes: "Includes two routine services.",
    archived: false,
    lifecycle: "Active",
    history: ["Created demo service contract"],
  },
];

const state = {
  records: loadRecords(),
  activeView: "home",
  previousView: "home",
  selectedRecordId: null,
  editingRecordId: null,
  activeSlide: 0,
  recordStatusFilter: "all",
};

const elements = {
  views: document.querySelectorAll(".content"),
  navButtons: document.querySelectorAll("[data-nav]"),
  topTitle: document.querySelector("#top-title"),
  topSubtitle: document.querySelector("#top-subtitle"),
  topSearchPanel: document.querySelector("#top-search-panel"),
  globalSearchInput: document.querySelector("#global-search-input"),
  announcementTrack: document.querySelector("#announcement-track"),
  announcementDots: document.querySelectorAll("[data-slide-index]"),
  attentionList: document.querySelector("#attention-list"),
  serviceList: document.querySelector("#service-list"),
  recordList: document.querySelector("#record-list"),
  documentList: document.querySelector("#document-list"),
  timelineList: document.querySelector("#timeline-list"),
  calendarStrip: document.querySelector("#calendar-strip"),
  homeSearchInput: document.querySelector("#home-search-input"),
  searchInput: document.querySelector("#search-input"),
  calendarSearchInput: document.querySelector("#calendar-search-input"),
  documentSearchInput: document.querySelector("#document-search-input"),
  settingsSearchInput: document.querySelector("#settings-search-input"),
  categoryFilter: document.querySelector("#category-filter"),
  documentFilterButtons: document.querySelectorAll("[data-document-filter]"),
  form: document.querySelector("#record-form"),
  renewalForm: document.querySelector("#renewal-form"),
  recordDialog: document.querySelector("#record-dialog"),
  renewalDialog: document.querySelector("#renewal-dialog"),
  documentDialog: document.querySelector("#document-dialog"),
  notificationDialog: document.querySelector("#notification-dialog"),
  documentDetail: document.querySelector("#document-detail"),
  notificationList: document.querySelector("#notification-list"),
  settingsNote: document.querySelector("#settings-note"),
  formMode: document.querySelector("#record-form-mode"),
  formTitle: document.querySelector("#record-form-title"),
};

function loadRecords() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : seedRecords;
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
  syncNativeReminders();
}

function syncNativeReminders() {
  if (!window.RenewlyAndroid?.syncReminders) return;
  window.RenewlyAndroid.syncReminders(JSON.stringify(state.records));
}

function requestNativeNotifications() {
  if (!window.RenewlyAndroid) {
    document.querySelector("#notification-note").textContent =
      "Notification preview is available inside the Android app build.";
    return;
  }
  window.RenewlyAndroid.requestNotifications();
  window.RenewlyAndroid.syncReminders(JSON.stringify(state.records));
  window.RenewlyAndroid.showTestNotification();
}

function daysUntil(dateValue) {
  const expiry = new Date(`${dateValue}T00:00:00`);
  return Math.ceil((expiry - today) / 86400000);
}

function getStatus(record) {
  if (record.lifecycle === "Sold") return { label: "Sold", className: "archived" };
  if (record.lifecycle === "Replaced") return { label: "Replaced", className: "archived" };
  if (record.archived) return { label: "Archived", className: "archived" };

  const days = daysUntil(record.expiryDate);
  if (days < 0) return { label: "Expired", className: "expired" };
  if (record.type === "Service" && days <= 30) return { label: "Service Due", className: "service" };
  if (days <= 7) return { label: "Due This Week", className: "soon" };
  if (days <= 30) return { label: "Expiring Soon", className: "soon" };
  return { label: "Active", className: "active" };
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatShortDate(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function getCategoryIcon(record) {
  if (record.category === "Automobile") {
    if (record.type === "PUC" || record.title.toLowerCase().includes("scooter")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM7 6h6l3 5h2a3 3 0 0 1 3 3v2h-2.1a4.5 4.5 0 0 0-5.8 0H10.9a4.5 4.5 0 0 0-5.8 0H3v-3l3-2 1-5z" /></svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 6h11.2l2.1 6H21v7h-2a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H3v-7h1.3zM7 8l-1.2 4h12.4L17 8z" /></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm1 3v12h6V5zm2 14v1h2v-1z" /></svg>`;
}

function renderRecordCard(record, options = {}) {
  const status = getStatus(record);
  const iconClass = record.category === "Automobile" ? "auto" : "electronics";
  const days = daysUntil(record.expiryDate);
  const relative = days < 0 ? `${Math.abs(days)} days late` : `${days} days left`;
  const isSelected = state.selectedRecordId === record.id;
  const compact = options.compact ? " compact-record" : "";

  return `
    <article class="record-wrap${compact} ${isSelected ? "expanded" : ""}">
      <button class="record-card" type="button" data-record-id="${record.id}" aria-expanded="${isSelected}">
        <span class="record-icon ${iconClass}" aria-hidden="true">${getCategoryIcon(record)}</span>
        <span>
          <strong>${escapeHtml(record.title)}</strong>
          <span class="record-meta">
            <span>${escapeHtml(record.provider || record.type)}</span>
            <span>${escapeHtml(record.owner)}</span>
            <span>${formatDate(record.expiryDate)}</span>
            <span>${relative}</span>
          </span>
        </span>
        <span class="status ${status.className}">${status.label}</span>
      </button>
      ${isSelected ? renderInlineDetails(record, status) : ""}
    </article>
  `;
}

function renderInlineDetails(record, status) {
  const history = record.history?.length ? record.history.join("<br>") : "No history yet";
  const renewals = renderRenewalHistory(record);
  const referenceLabel = record.category === "Automobile" ? "Policy / Reg No." : "Serial / IMEI";
  const amountLabel = record.type === "Insurance" ? "Premium" : "Amount Paid";
  const valueLabel = record.category === "Automobile" ? "IDV / Coverage" : "Warranty Value";
  const categoryDetails =
    record.category === "Automobile"
      ? `
        <div><span>Registration No.</span><strong>${escapeHtml(record.vehicleNumber || "Not added")}</strong></div>
        <div><span>Odometer / Service KM</span><strong>${escapeHtml(record.odometer || "Not added")}</strong></div>
      `
      : `
        <div><span>Purchase Store</span><strong>${escapeHtml(record.purchaseStore || "Not added")}</strong></div>
        <div><span>Warranty Type</span><strong>${escapeHtml(record.warrantyType || "Not added")}</strong></div>
      `;
  return `
    <div class="inline-detail">
      <div class="detail-hero">
        <span class="record-icon ${record.category === "Automobile" ? "auto" : "electronics"}" aria-hidden="true">${getCategoryIcon(record)}</span>
        <div>
          <strong>${escapeHtml(record.title)}</strong>
          <small>${escapeHtml(record.provider || record.category)} - ${escapeHtml(record.owner)}</small>
        </div>
        <span class="status ${status.className}">${status.label}</span>
      </div>
      <div class="detail-grid">
        <div><span>Provider</span><strong>${escapeHtml(record.provider || "Not added")}</strong></div>
        <div><span>Policy Type</span><strong>${escapeHtml(record.type)}</strong></div>
        <div><span>${referenceLabel}</span><strong>${escapeHtml(record.referenceNumber || "Not added")}</strong></div>
        <div><span>${amountLabel}</span><strong>${formatMoney(record.amount)}</strong></div>
        <div><span>${valueLabel}</span><strong>${escapeHtml(record.coverageValue || "Not added")}</strong></div>
        <div><span>Owner Name</span><strong>${escapeHtml(record.owner || "Not added")}</strong></div>
        ${categoryDetails}
        <div><span>Start Date</span><strong>${formatDate(record.startDate)}</strong></div>
        <div><span>Expiry Date</span><strong>${formatDate(record.expiryDate)}</strong></div>
        <div><span>Document</span><strong>${escapeHtml(record.documentName || "No document attached")}</strong></div>
        <div><span>Reminder</span><strong>${getReminderText()}</strong></div>
        <div class="wide"><span>Notes</span><strong>${escapeHtml(record.notes || "No notes")}</strong></div>
        <div class="wide"><span>History</span><strong>${history}</strong></div>
      </div>
      ${renewals}
      <div class="inline-actions">
        <button type="button" data-action="edit-record">Edit</button>
        <button type="button" data-action="sold-record">Sold</button>
        <button type="button" data-action="replaced-record">Replaced</button>
        <button type="button" data-action="archive-record">Archive</button>
        <button class="primary-inline" type="button" data-action="renew-record">Mark renewed</button>
      </div>
    </div>
  `;
}

function renderRenewalHistory(record) {
  if (!record.renewals?.length) {
    return `<div class="comparison-note">No previous renewals saved yet.</div>`;
  }

  return `
    <div class="renewal-history">
      <strong>Previous renewals</strong>
      ${record.renewals
        .map(
          (renewal, index) => `
            <article>
              <span>#${index + 1} - ${formatDate(renewal.renewalDate)}</span>
              <b>${escapeHtml(renewal.provider || "No provider")} - ${formatMoney(renewal.amount)}</b>
              <small>Expires ${formatDate(renewal.expiryDate)} - ${escapeHtml(renewal.documentName || "No document")}</small>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEmpty(message) {
  return `<div class="empty-state">${message}</div>`;
}

function renderFirstRecordEmpty() {
  return `
    <div class="empty-state action-empty">
      <strong>Add your first vehicle or gadget reminder</strong>
      <span>Track insurance, warranties, service dates, and documents from one place.</span>
      <button class="primary-button" type="button" data-action="open-add">Add record</button>
    </div>
  `;
}

function activeRecords() {
  return state.records.filter((record) => !record.archived && !["Sold", "Replaced"].includes(record.lifecycle));
}

function recordMatchesQuery(record, query) {
  if (!query) return true;
  const haystack = [
    record.title,
    record.type,
    record.category,
    record.owner,
    record.provider,
    record.referenceNumber,
    record.amount,
    record.coverageValue,
    record.vehicleNumber,
    record.odometer,
    record.purchaseStore,
    record.warrantyType,
    record.documentName,
    record.notes,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function recordMatchesStatusFilter(record, filter) {
  const days = daysUntil(record.expiryDate);
  if (filter === "upcoming") return days >= 0 && days <= 30;
  if (filter === "due-week") return days >= 0 && days <= 7;
  if (filter === "overdue") return days < 0;
  if (filter === "service") return record.type === "Service" && days <= 30;
  return true;
}

function getStatusFilterLabel(filter) {
  const labels = {
    all: "No records match this filter.",
    upcoming: "No upcoming records due in the next 30 days.",
    "due-week": "No records are due this week.",
    overdue: "No overdue records.",
    service: "No service records are due.",
  };
  return labels[filter] || labels.all;
}

function renderHome() {
  const active = activeRecords();
  const query = elements.homeSearchInput.value.trim().toLowerCase();
  const overdue = active.filter((record) => daysUntil(record.expiryDate) < 0);
  const upcoming = active.filter((record) => daysUntil(record.expiryDate) >= 0 && daysUntil(record.expiryDate) <= 30);
  const dueWeek = active.filter((record) => daysUntil(record.expiryDate) >= 0 && daysUntil(record.expiryDate) <= 7);
  const service = active.filter((record) => record.type === "Service" && daysUntil(record.expiryDate) <= 30);
  const attention = [...overdue, ...upcoming]
    .filter((record) => recordMatchesQuery(record, query))
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))
    .slice(0, 4);

  document.querySelector("#summary-upcoming").textContent = upcoming.length;
  document.querySelector("#summary-due-week").textContent = dueWeek.length;
  document.querySelector("#summary-overdue").textContent = overdue.length;
  document.querySelector("#summary-service").textContent = service.length;

  elements.attentionList.innerHTML = attention.length
    ? attention.map(renderRecordCard).join("")
    : state.records.length
      ? renderEmpty(query ? "No home results match this search." : "Everything is up to date.")
      : renderFirstRecordEmpty();

  const serviceReminders = active
    .filter((record) => record.type === "Service" || record.type === "AMC")
    .filter((record) => recordMatchesQuery(record, query))
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))
    .slice(0, 2);
  elements.serviceList.innerHTML = serviceReminders.length
    ? serviceReminders.map((record) => renderRecordCard(record, { compact: true })).join("")
    : state.records.length
      ? renderEmpty(query ? "No service reminders match this search." : "No service reminders due.")
      : renderEmpty("Service reminders will appear after you add a record.");
}

function renderRecords() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;
  const filtered = state.records
    .filter((record) => category === "All" || record.category === category)
    .filter((record) => recordMatchesStatusFilter(record, state.recordStatusFilter))
    .filter((record) => recordMatchesQuery(record, query))
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  elements.recordList.innerHTML = filtered.length
    ? filtered.map(renderRecordCard).join("")
    : state.records.length
      ? renderEmpty(getStatusFilterLabel(state.recordStatusFilter))
      : renderFirstRecordEmpty();
}

function renderCalendar() {
  const query = elements.calendarSearchInput.value.trim().toLowerCase();
  const upcoming = activeRecords()
    .filter((record) => recordMatchesQuery(record, query))
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
  const markedDays = new Set(upcoming.map((record) => new Date(`${record.expiryDate}T00:00:00`).getDate()));

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    .map((day) => `<span class="weekday">${day}</span>`)
    .join("");
  elements.calendarStrip.innerHTML = weekdays + Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    const record = upcoming.find((item) => new Date(`${item.expiryDate}T00:00:00`).getDate() === day);
    const className = record ? `marked ${getStatus(record).className}` : "";
    return `<span class="${className}">${day}</span>`;
  }).join("");

  elements.timelineList.innerHTML = upcoming.length
    ? upcoming
        .slice(0, 8)
        .map(
          (record) => `
            <button class="timeline-item" type="button" data-calendar-record-id="${record.id}">
              <span class="timeline-date"><b>${new Date(`${record.expiryDate}T00:00:00`).getDate().toString().padStart(2, "0")}</b><small>May</small></span>
              <div>
                <strong>${escapeHtml(record.title)}</strong>
                <small>${escapeHtml(record.provider || record.category)} - ${escapeHtml(record.owner)}</small>
              </div>
              <span class="status ${getStatus(record).className}">${getStatus(record).label}</span>
            </button>
          `,
        )
        .join("")
    : renderEmpty("No upcoming reminders yet.");
}

function renderDocuments() {
  const query = elements.documentSearchInput.value.trim().toLowerCase();
  const activeFilter = document.querySelector("[data-document-filter].active")?.dataset.documentFilter || "All";
  const documents = getDocuments().filter((documentItem) => {
    if (activeFilter !== "All" && documentItem.category !== activeFilter) return false;
    if (!query) return true;
    const haystack = [
      documentItem.documentName,
      documentItem.title,
      documentItem.provider,
      documentItem.category,
      documentItem.type,
      documentItem.notes,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
  const grouped = documents.reduce((groups, documentItem) => {
    groups[documentItem.recordId] = groups[documentItem.recordId] || [];
    groups[documentItem.recordId].push(documentItem);
    return groups;
  }, {});

  elements.documentList.innerHTML = documents.length
    ? Object.values(grouped)
        .map((items) => renderDocumentGroup(items))
        .join("")
    : state.records.length
      ? renderEmpty(query ? "No documents match this search." : "Attach a bill, policy photo, or warranty card while adding a record.")
      : renderFirstRecordEmpty();
}

function renderDocumentGroup(items) {
  const first = items[0];
  const iconClass = first.category === "Automobile" ? "auto" : "electronics";
  return `
    <article class="document-group">
      <div class="document-group-header">
        <span class="record-icon ${iconClass}" aria-hidden="true">${getCategoryIcon(first)}</span>
        <div>
          <strong>${escapeHtml(first.baseTitle || first.title)}</strong>
          <small>${items.length} ${items.length === 1 ? "Document" : "Documents"}</small>
        </div>
        <span aria-hidden="true">v</span>
      </div>
      ${items
        .map(
          (documentItem) => `
            <button class="document-row" type="button" data-document-record-id="${documentItem.recordId}" data-document-kind="${documentItem.kind}" data-document-index="${documentItem.index}">
              <span class="doc-thumb">${documentItem.documentDataUrl ? `<img src="${documentItem.documentDataUrl}" alt="" />` : "PDF"}</span>
              <span>
                <strong>${escapeHtml(documentItem.documentName)}</strong>
                <small>${formatShortDate(documentItem.expiryDate)} - ${escapeHtml(documentItem.documentType?.includes("image") ? "JPG" : "PDF")} - ${escapeHtml(documentItem.size || "248 KB")}</small>
              </span>
              <span aria-hidden="true">...</span>
            </button>
          `,
        )
        .join("")}
    </article>
  `;
}

function renderSettingsSearch() {
  const query = elements.settingsSearchInput.value.trim().toLowerCase();
  document.querySelectorAll("[data-settings-group]").forEach((group) => {
    group.hidden = query ? !group.dataset.settingsGroup.includes(query) : false;
  });
}

function getDocuments() {
  return state.records.flatMap((record) => {
    const items = [];
    if (record.documentName) {
      items.push({
        kind: "current",
        index: 0,
        recordId: record.id,
        baseTitle: record.title,
        title: record.title,
        category: record.category,
        type: record.type,
        provider: record.provider,
        expiryDate: record.expiryDate,
        amount: record.amount,
        referenceNumber: record.referenceNumber,
        coverageValue: record.coverageValue,
        vehicleNumber: record.vehicleNumber,
        odometer: record.odometer,
        purchaseStore: record.purchaseStore,
        warrantyType: record.warrantyType,
        documentName: record.documentName,
        documentType: record.documentType,
        documentDataUrl: record.documentDataUrl,
        notes: record.notes,
      });
    }

    (record.renewals || []).forEach((renewal, index) => {
      if (!renewal.documentName) return;
      items.push({
        kind: "renewal",
        index,
        recordId: record.id,
        baseTitle: record.title,
        title: `${record.title} renewal`,
        category: record.category,
        type: record.type,
        provider: renewal.provider,
        expiryDate: renewal.expiryDate,
        amount: renewal.amount,
        documentName: renewal.documentName,
        documentType: renewal.documentType,
        documentDataUrl: renewal.documentDataUrl,
        notes: renewal.notes,
        renewalDate: renewal.renewalDate,
      });
    });

    return items;
  });
}

function render() {
  renderHome();
  renderRecords();
  renderCalendar();
  renderDocuments();
  renderSettingsSearch();
}

function getActiveSearchInput() {
  const map = {
    home: elements.homeSearchInput,
    records: elements.searchInput,
    calendar: elements.calendarSearchInput,
    documents: elements.documentSearchInput,
    settings: elements.settingsSearchInput,
  };
  return map[state.activeView];
}

function applyGlobalSearch(value) {
  const activeInput = getActiveSearchInput();
  if (!activeInput) return;
  activeInput.value = value;
  if (state.activeView === "home") renderHome();
  if (state.activeView === "records") renderRecords();
  if (state.activeView === "calendar") renderCalendar();
  if (state.activeView === "documents") renderDocuments();
  if (state.activeView === "settings") renderSettingsSearch();
}

function setView(viewName) {
  if (state.activeView !== viewName) {
    state.previousView = state.activeView;
  }
  state.activeView = viewName;
  elements.views.forEach((view) => view.classList.toggle("active", view.dataset.view === viewName));
  elements.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.nav === viewName));
  const titles = {
    home: ["Renewly", "Policy & Warranty Reminders"],
    records: [state.selectedRecordId ? "Record Details" : "Records", ""],
    calendar: ["Calendar", ""],
    documents: ["Documents", ""],
    settings: ["Settings", ""],
  };
  elements.topTitle.textContent = titles[viewName][0];
  elements.topSubtitle.textContent = titles[viewName][1];
  const activeInput = getActiveSearchInput();
  elements.globalSearchInput.value = activeInput?.value || "";
  elements.globalSearchInput.placeholder = `Search ${viewName === "home" ? "Renewly" : viewName}`;
}

function toggleSettings() {
  if (state.activeView === "settings") {
    setView(state.previousView && state.previousView !== "settings" ? state.previousView : "home");
    return;
  }
  setView("settings");
}

function goToSlide(index, behavior = "smooth") {
  const total = elements.announcementDots.length;
  state.activeSlide = ((index % total) + total) % total;
  elements.announcementTrack.scrollTo({
    left: elements.announcementTrack.clientWidth * state.activeSlide,
    behavior,
  });
  elements.announcementDots.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.slideIndex) === state.activeSlide);
  });
}

function toggleDetails(recordId) {
  const record = state.records.find((item) => item.id === recordId);
  if (!record) return;
  state.selectedRecordId = state.selectedRecordId === recordId ? null : recordId;
  render();
}

function getReminderText() {
  const selected = [...document.querySelectorAll("[data-reminder]:checked")].map((item) => item.dataset.reminder);
  return selected.length ? `${selected.join(", ")} days before` : "No default reminders selected";
}

function formatMoney(value) {
  if (!value) return "Amount not added";
  const numeric = Number(String(value).replaceAll(",", ""));
  if (Number.isNaN(numeric)) return escapeHtml(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function readAttachment(file) {
  if (!file || !file.type.startsWith("image/")) {
    return Promise.resolve({ documentDataUrl: "", documentType: file?.type || "" });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve({ documentDataUrl: reader.result, documentType: file.type });
    });
    reader.addEventListener("error", () => {
      resolve({ documentDataUrl: "", documentType: file.type });
    });
    reader.readAsDataURL(file);
  });
}

function resetFormDefaults() {
  state.editingRecordId = null;
  elements.formMode.textContent = "New reminder";
  elements.formTitle.textContent = "Add Record";
  elements.form.reset();
  const start = today.toISOString().slice(0, 10);
  const expiry = new Date(today);
  expiry.setMonth(expiry.getMonth() + 12);
  elements.form.elements.startDate.value = start;
  elements.form.elements.expiryDate.value = expiry.toISOString().slice(0, 10);
  updateCategoryFields();
}

function updateCategoryFields() {
  const category = elements.form.elements.category.value;
  document.querySelectorAll("[data-category-fields]").forEach((group) => {
    group.hidden = group.dataset.categoryFields !== category;
  });
}

function openEditForm() {
  const record = state.records.find((item) => item.id === state.selectedRecordId);
  if (!record) return;

  state.editingRecordId = record.id;
  elements.form.reset();
  elements.formMode.textContent = "Fix details";
  elements.formTitle.textContent = "Edit Record";
  elements.form.elements.category.value = record.category;
  elements.form.elements.title.value = record.title;
  elements.form.elements.type.value = record.type;
  elements.form.elements.owner.value = record.owner;
  elements.form.elements.startDate.value = record.startDate;
  elements.form.elements.expiryDate.value = record.expiryDate;
  elements.form.elements.provider.value = record.provider || "";
  elements.form.elements.referenceNumber.value = record.referenceNumber || "";
  elements.form.elements.amount.value = record.amount || "";
  elements.form.elements.coverageValue.value = record.coverageValue || "";
  elements.form.elements.vehicleNumber.value = record.vehicleNumber || "";
  elements.form.elements.odometer.value = record.odometer || "";
  elements.form.elements.purchaseStore.value = record.purchaseStore || "";
  elements.form.elements.warrantyType.value = record.warrantyType || "";
  elements.form.elements.documentName.value = record.documentName || "";
  elements.form.elements.notes.value = record.notes || "";
  updateCategoryFields();
  elements.recordDialog.showModal();
}

async function addRecord(formData) {
  const file = elements.form.elements.documentFile.files[0];
  const documentName = formData.get("documentName") || file?.name || "";
  const attachment = await readAttachment(file);

  state.records.unshift({
    id: crypto.randomUUID(),
    category: formData.get("category"),
    title: formData.get("title"),
    type: formData.get("type"),
    owner: formData.get("owner"),
    startDate: formData.get("startDate"),
    expiryDate: formData.get("expiryDate"),
    provider: formData.get("provider"),
    referenceNumber: formData.get("referenceNumber"),
    amount: formData.get("amount"),
    coverageValue: formData.get("coverageValue"),
    vehicleNumber: formData.get("vehicleNumber"),
    odometer: formData.get("odometer"),
    purchaseStore: formData.get("purchaseStore"),
    warrantyType: formData.get("warrantyType"),
    documentName,
    documentType: attachment.documentType,
    documentDataUrl: attachment.documentDataUrl,
    notes: formData.get("notes"),
    archived: false,
    lifecycle: "Active",
    history: [`Added on ${formatDate(today.toISOString().slice(0, 10))}`],
  });
  saveRecords();
  render();
}

async function saveEditedRecord(formData) {
  const record = state.records.find((item) => item.id === state.editingRecordId);
  if (!record) return;

  const file = elements.form.elements.documentFile.files[0];
  const attachment = await readAttachment(file);
  record.category = formData.get("category");
  record.title = formData.get("title");
  record.type = formData.get("type");
  record.owner = formData.get("owner");
  record.startDate = formData.get("startDate");
  record.expiryDate = formData.get("expiryDate");
  record.provider = formData.get("provider");
  record.referenceNumber = formData.get("referenceNumber");
  record.amount = formData.get("amount");
  record.coverageValue = formData.get("coverageValue");
  record.vehicleNumber = formData.get("vehicleNumber");
  record.odometer = formData.get("odometer");
  record.purchaseStore = formData.get("purchaseStore");
  record.warrantyType = formData.get("warrantyType");
  record.documentName = formData.get("documentName") || file?.name || record.documentName || "";
  record.documentType = attachment.documentType || record.documentType || "";
  record.documentDataUrl = attachment.documentDataUrl || record.documentDataUrl || "";
  record.notes = formData.get("notes");
  record.history = [...(record.history || []), "Edited record details"];
  state.editingRecordId = null;
  saveRecords();
  render();
}

function updateSelectedRecord(updater) {
  const record = state.records.find((item) => item.id === state.selectedRecordId);
  if (!record) return;
  updater(record);
  saveRecords();
  state.selectedRecordId = record.id;
  render();
}

function openRenewalForm() {
  const record = state.records.find((item) => item.id === state.selectedRecordId);
  if (!record) return;

  elements.renewalForm.reset();
  const renewalDate = today.toISOString().slice(0, 10);
  const nextExpiry = new Date(`${record.expiryDate}T00:00:00`);
  nextExpiry.setFullYear(nextExpiry.getFullYear() + 1);
  elements.renewalForm.elements.provider.value = record.provider || "";
  elements.renewalForm.elements.renewalDate.value = renewalDate;
  elements.renewalForm.elements.expiryDate.value = nextExpiry.toISOString().slice(0, 10);
  elements.renewalDialog.showModal();
}

async function saveRenewal(formData) {
  const record = state.records.find((item) => item.id === state.selectedRecordId);
  if (!record) return;

  const file = elements.renewalForm.elements.documentFile.files[0];
  const attachment = await readAttachment(file);
  const renewal = {
    id: crypto.randomUUID(),
    renewalDate: formData.get("renewalDate"),
    previousExpiryDate: record.expiryDate,
    expiryDate: formData.get("expiryDate"),
    provider: formData.get("provider"),
    amount: formData.get("amount"),
    documentName: formData.get("documentName") || file?.name || "",
    documentType: attachment.documentType,
    documentDataUrl: attachment.documentDataUrl,
    notes: formData.get("notes"),
  };

  record.renewals = [...(record.renewals || []), renewal];
  record.provider = renewal.provider || record.provider;
  record.startDate = renewal.renewalDate;
  record.expiryDate = renewal.expiryDate;
  record.documentName = renewal.documentName || record.documentName;
  record.documentType = renewal.documentType || record.documentType || "";
  record.documentDataUrl = renewal.documentDataUrl || record.documentDataUrl || "";
  record.amount = renewal.amount || record.amount || "";
  record.notes = renewal.notes || record.notes;
  record.archived = false;
  record.lifecycle = record.type === "Service" ? "Serviced" : "Renewed";
  record.history = [
    ...(record.history || []),
    `${record.lifecycle} on ${formatDate(renewal.renewalDate)} with expiry ${formatDate(renewal.expiryDate)}`,
  ];
  saveRecords();
  render();
}

function openDocumentDetails(recordId, kind, indexValue) {
  const record = state.records.find((item) => item.id === recordId);
  if (!record) return;

  const index = Number(indexValue);
  const source =
    kind === "renewal"
      ? record.renewals?.[index]
      : {
          provider: record.provider,
          expiryDate: record.expiryDate,
          amount: record.amount,
          referenceNumber: record.referenceNumber,
          coverageValue: record.coverageValue,
          vehicleNumber: record.vehicleNumber,
          odometer: record.odometer,
          purchaseStore: record.purchaseStore,
          warrantyType: record.warrantyType,
          documentName: record.documentName,
          documentType: record.documentType,
          documentDataUrl: record.documentDataUrl,
          notes: record.notes,
        };
  if (!source) return;

  document.querySelector("#document-dialog-category").textContent = `${record.category} - ${record.type}`;
  document.querySelector("#document-dialog-title").textContent = source.documentName || "Document Details";
  const preview = source.documentDataUrl
    ? `<img src="${source.documentDataUrl}" alt="${escapeHtml(source.documentName || "Uploaded document")}" />`
    : `<span>${source.documentType?.includes("pdf") ? "PDF" : "FILE"}</span>`;
  elements.documentDetail.innerHTML = `
    <div class="document-preview">
      ${preview}
      <strong>${escapeHtml(source.documentName || "No document name")}</strong>
      <small>${source.documentDataUrl ? "Uploaded image preview is stored locally in this browser." : "PDF and non-image files are tracked as document metadata in this prototype."}</small>
    </div>
    <div class="detail-grid">
      <div><span>Record</span><strong>${escapeHtml(record.title)}</strong></div>
      <div><span>Provider</span><strong>${escapeHtml(source.provider || "Not added")}</strong></div>
      <div><span>Expiry</span><strong>${formatDate(source.expiryDate)}</strong></div>
      <div><span>Amount</span><strong>${formatMoney(source.amount)}</strong></div>
      <div class="wide"><span>Notes</span><strong>${escapeHtml(source.notes || "No notes")}</strong></div>
    </div>
  `;
  elements.documentDialog.showModal();
}

function exportData() {
  const payload = {
    app: "Renewly",
    exportedAt: new Date().toISOString(),
    records: state.records,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "renewly-backup.json";
  link.click();
  URL.revokeObjectURL(url);
  elements.settingsNote.textContent = "Backup JSON exported from local data.";
}

function resetDemoData() {
  state.records = structuredClone(seedRecords);
  saveRecords();
  render();
  elements.settingsNote.textContent = "Demo records restored.";
}

function renderNotifications() {
  const reminders = activeRecords()
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))
    .slice(0, 6);
  elements.notificationList.innerHTML = reminders.length
    ? reminders
        .map((record) => {
          const status = getStatus(record);
          const days = daysUntil(record.expiryDate);
          const relative = days < 0 ? `${Math.abs(days)} days late` : `${days} days left`;
          return `
            <button class="notification-item" type="button" data-calendar-record-id="${record.id}">
              <span class="record-icon ${record.category === "Automobile" ? "auto" : "electronics"}" aria-hidden="true">${getCategoryIcon(record)}</span>
              <span>
                <strong>${escapeHtml(record.title)}</strong>
                <small>${escapeHtml(record.type)} - ${formatDate(record.expiryDate)} - ${relative}</small>
              </span>
              <span class="status ${status.className}">${status.label}</span>
            </button>
          `;
        })
        .join("")
    : renderEmpty("No upcoming reminders.");
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  const navButton = event.target.closest("[data-nav]");
  const recordButton = event.target.closest("[data-record-id]");
  const calendarButton = event.target.closest("[data-calendar-record-id]");
  const documentButton = event.target.closest("[data-document-record-id]");
  const shortcut = event.target.closest("[data-filter-shortcut]");
  const summaryFilter = event.target.closest("[data-summary-filter]");

  if (navButton) setView(navButton.dataset.nav);
  if (recordButton) toggleDetails(recordButton.dataset.recordId);
  if (calendarButton) {
    if (elements.notificationDialog.open) elements.notificationDialog.close();
    state.selectedRecordId = calendarButton.dataset.calendarRecordId;
    elements.categoryFilter.value = "All";
    elements.searchInput.value = "";
    setView("records");
    render();
  }
  if (documentButton) {
    openDocumentDetails(
      documentButton.dataset.documentRecordId,
      documentButton.dataset.documentKind,
      documentButton.dataset.documentIndex,
    );
  }
  if (shortcut) {
    elements.categoryFilter.value = shortcut.dataset.filterShortcut;
    state.recordStatusFilter = "all";
    setView("records");
    renderRecords();
  }
  if (summaryFilter) {
    state.recordStatusFilter = summaryFilter.dataset.summaryFilter;
    elements.categoryFilter.value = "All";
    elements.searchInput.value = "";
    elements.globalSearchInput.value = "";
    setView("records");
    renderRecords();
  }
  const documentFilter = event.target.closest("[data-document-filter]");
  const slideButton = event.target.closest("[data-slide-index]");
  if (documentFilter) {
    elements.documentFilterButtons.forEach((button) => button.classList.toggle("active", button === documentFilter));
    renderDocuments();
  }
  if (slideButton) {
    const index = Number(slideButton.dataset.slideIndex);
    goToSlide(index);
  }

  if (!actionButton) return;
  const { action } = actionButton.dataset;

  if (action === "open-add") {
    resetFormDefaults();
    elements.recordDialog.showModal();
  }
  if (action === "close-add") {
    state.editingRecordId = null;
    elements.recordDialog.close();
  }
  if (action === "close-renewal") elements.renewalDialog.close();
  if (action === "close-document") elements.documentDialog.close();
  if (action === "close-notifications") elements.notificationDialog.close();
  if (action === "show-records") setView("records");
  if (action === "view-calendar") setView("calendar");
  if (action === "open-settings") toggleSettings();
  if (action === "open-notifications") {
    renderNotifications();
    elements.notificationDialog.showModal();
  }
  if (action === "toggle-search") {
    elements.topSearchPanel.hidden = !elements.topSearchPanel.hidden;
    if (!elements.topSearchPanel.hidden) elements.globalSearchInput.focus();
  }
  if (action === "edit-record") openEditForm();
  if (action === "export-data") exportData();
  if (action === "reset-demo") resetDemoData();
  if (action === "archive-record") {
    updateSelectedRecord((record) => {
      record.archived = true;
      record.history = [...(record.history || []), "Archived"];
    });
  }
  if (action === "sold-record") {
    updateSelectedRecord((record) => {
      record.lifecycle = "Sold";
      record.archived = true;
      record.history = [...(record.history || []), "Marked sold"];
    });
  }
  if (action === "replaced-record") {
    updateSelectedRecord((record) => {
      record.lifecycle = "Replaced";
      record.archived = true;
      record.history = [...(record.history || []), "Marked replaced"];
    });
  }
  if (action === "renew-record") openRenewalForm();
});

elements.recordDialog.addEventListener("click", (event) => {
  if (event.target === elements.recordDialog) {
    state.editingRecordId = null;
    elements.recordDialog.close();
  }
});

elements.renewalDialog.addEventListener("click", (event) => {
  if (event.target === elements.renewalDialog) {
    elements.renewalDialog.close();
  }
});

elements.documentDialog.addEventListener("click", (event) => {
  if (event.target === elements.documentDialog) {
    elements.documentDialog.close();
  }
});

elements.notificationDialog.addEventListener("click", (event) => {
  if (event.target === elements.notificationDialog) {
    elements.notificationDialog.close();
  }
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  if (state.editingRecordId) {
    await saveEditedRecord(formData);
  } else {
    await addRecord(formData);
  }
  elements.recordDialog.close();
  setView("records");
});

elements.renewalForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveRenewal(new FormData(elements.renewalForm));
  elements.renewalDialog.close();
  setView("records");
});

elements.searchInput.addEventListener("input", renderRecords);
elements.homeSearchInput.addEventListener("input", renderHome);
elements.calendarSearchInput.addEventListener("input", renderCalendar);
elements.documentSearchInput.addEventListener("input", renderDocuments);
elements.settingsSearchInput.addEventListener("input", renderSettingsSearch);
elements.globalSearchInput.addEventListener("input", (event) => applyGlobalSearch(event.target.value));
elements.announcementTrack.addEventListener("scroll", () => {
  const index = Math.round(elements.announcementTrack.scrollLeft / elements.announcementTrack.clientWidth);
  state.activeSlide = index;
  elements.announcementDots.forEach((button) => button.classList.toggle("active", Number(button.dataset.slideIndex) === index));
});
elements.categoryFilter.addEventListener("change", () => {
  state.recordStatusFilter = "all";
  renderRecords();
});
document.querySelector("#app-lock-toggle").addEventListener("change", (event) => {
  elements.settingsNote.textContent = event.target.checked
    ? "App lock preference enabled for this prototype."
    : "App lock preference disabled.";
});
document.querySelector("#notification-ready-toggle").addEventListener("change", (event) => {
  document.querySelector("#notification-note").textContent = event.target.checked
    ? "Reminder alerts are marked ready for the Android notification step."
    : "Real Android notifications will be connected in the native app step.";
  if (event.target.checked) {
    requestNativeNotifications();
  }
});
elements.form.elements.category.addEventListener("change", updateCategoryFields);
document.querySelectorAll("[data-reminder]").forEach((input) => input.addEventListener("change", render));

setInterval(() => {
  if (state.activeView === "home" && !document.hidden) {
    goToSlide(state.activeSlide + 1);
  }
}, 4500);

render();
updateCategoryFields();
syncNativeReminders();
