// ============================================
// COURT CASE MANAGEMENT SYSTEM — FRONTEND JS
// ============================================

const API = 'http://localhost:5000/api';

let allCases = [];
let allHearings = [];
let allJudges = [];
let currentUser = null;

// ============================================
// AUTH
// ============================================
async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  if (!username || !password) {
    errEl.textContent = 'Please enter username and password.';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      document.getElementById('sidebarUser').textContent = data.user.full_name || data.user.username;
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      initApp();
    } else {
      errEl.textContent = data.message || 'Invalid credentials.';
    }
  } catch (e) {
    errEl.textContent = 'Cannot connect to server. Make sure backend is running.';
  }
}

function doLogout() {
  currentUser = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

// Enter key on login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.getElementById('loginScreen').classList.contains('hidden')) {
    doLogin();
  }
});

// ============================================
// APP INIT
// ============================================
async function initApp() {
  // Set date
  const now = new Date();
  document.getElementById('headerDate').textContent =
    now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  await Promise.all([loadCases(), loadHearings(), loadJudges()]);
  renderDashboard();
}

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${name}`).classList.add('active');
  document.querySelector(`[data-page="${name}"]`).classList.add('active');

  if (name === 'cases') renderCases();
  if (name === 'hearings') renderHearings();
  if (name === 'judges') renderJudges();
}

// ============================================
// API CALLS
// ============================================
async function loadCases() {
  try {
    const res = await fetch(`${API}/cases`);
    allCases = await res.json();
  } catch (e) { allCases = []; }
}

async function loadHearings() {
  try {
    const res = await fetch(`${API}/hearings`);
    allHearings = await res.json();
  } catch (e) { allHearings = []; }
}

async function loadJudges() {
  try {
    const res = await fetch(`${API}/judges`);
    allJudges = await res.json();
  } catch (e) { allJudges = []; }
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard() {
  document.getElementById('statTotal').textContent = allCases.length;
  document.getElementById('statOpen').textContent = allCases.filter(c => c.status === 'Open').length;
  document.getElementById('statClosed').textContent = allCases.filter(c => c.status === 'Closed').length;
  document.getElementById('statHearings').textContent = allHearings.length;
  document.getElementById('statJudges').textContent = allJudges.length;
  document.getElementById('statPending').textContent = allCases.filter(c => c.status === 'Pending').length;

  // Recent Cases
  const rcEl = document.getElementById('recentCases');
  const recentC = [...allCases].slice(0, 5);
  if (recentC.length === 0) {
    rcEl.innerHTML = emptyState('No cases found');
  } else {
    rcEl.innerHTML = recentC.map(c => `
      <div class="recent-item">
        <div class="recent-dot dot-${c.status.toLowerCase().replace(' ', '-')}"></div>
        <div class="recent-main">
          <div class="recent-title">${c.case_title}</div>
          <div class="recent-sub">${c.case_id} · ${formatDate(c.filed_date)}</div>
        </div>
        ${statusBadge(c.status)}
      </div>
    `).join('');
  }

  // Upcoming Hearings
  const uhEl = document.getElementById('upcomingHearings');
  const upcoming = allHearings.filter(h => h.status === 'Scheduled').slice(0, 5);
  if (upcoming.length === 0) {
    uhEl.innerHTML = emptyState('No upcoming hearings');
  } else {
    uhEl.innerHTML = upcoming.map(h => `
      <div class="recent-item">
        <div class="recent-dot dot-${h.status.toLowerCase()}"></div>
        <div class="recent-main">
          <div class="recent-title">${h.case_title}</div>
          <div class="recent-sub">${formatDate(h.hearing_date)} · ${h.hearing_time} · ${h.courtroom}</div>
        </div>
        ${statusBadge(h.status)}
      </div>
    `).join('');
  }
}

// ============================================
// CASES
// ============================================
function renderCases(data) {
  const cases = data || allCases;
  const tbody = document.getElementById('casesBody');
  if (cases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyState('No cases found')}</td></tr>`;
    return;
  }
  tbody.innerHTML = cases.map(c => `
    <tr>
      <td><span class="case-id-badge">${c.case_id}</span></td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${c.case_title}">${c.case_title}</td>
      <td>${c.plaintiff}</td>
      <td>${c.defendant}</td>
      <td style="font-family:'DM Mono',monospace;font-size:0.8rem;color:var(--text-secondary)">${formatDate(c.filed_date)}</td>
      <td style="font-size:0.82rem;color:var(--text-secondary)">${c.assigned_judge_name || '—'}</td>
      <td>${statusBadge(c.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editCase('${c.case_id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" onclick="confirmDeleteCase('${c.case_id}')" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterCases() {
  const q = document.getElementById('caseSearch').value.toLowerCase();
  const status = document.getElementById('caseStatusFilter').value;
  const filtered = allCases.filter(c => {
    const matchQ = !q || c.case_title.toLowerCase().includes(q) || c.case_id.toLowerCase().includes(q) || c.plaintiff.toLowerCase().includes(q) || c.defendant.toLowerCase().includes(q);
    const matchS = !status || c.status === status;
    return matchQ && matchS;
  });
  renderCases(filtered);
}

function openCaseModal(mode = 'new') {
  document.getElementById('caseModalTitle').textContent = mode === 'edit' ? 'Edit Case' : 'New Case';
  // Populate judge dropdown
  const judgeSelect = document.getElementById('caseJudge');
  judgeSelect.innerHTML = '<option value="">Select Judge</option>' +
    allJudges.map(j => `<option value="${j.judge_id}" data-name="${j.judge_name}">${j.judge_name}</option>`).join('');
  openModal('caseModal');
}

function editCase(id) {
  const c = allCases.find(x => x.case_id === id);
  if (!c) return;
  document.getElementById('caseEditId').value = id;
  document.getElementById('caseId').value = c.case_id;
  document.getElementById('caseId').disabled = true;
  document.getElementById('caseTitle').value = c.case_title;
  document.getElementById('casePlaintiff').value = c.plaintiff;
  document.getElementById('caseDefendant').value = c.defendant;
  document.getElementById('caseFiledDate').value = c.filed_date ? c.filed_date.split('T')[0] : '';
  document.getElementById('caseStatus').value = c.status;
  openCaseModal('edit');
  // Set judge
  setTimeout(() => {
    const judgeSelect = document.getElementById('caseJudge');
    for (let opt of judgeSelect.options) {
      if (parseInt(opt.value) === c.assigned_judge_id) { opt.selected = true; break; }
    }
  }, 50);
}

async function saveCase() {
  const editId = document.getElementById('caseEditId').value;
  const judgeSelect = document.getElementById('caseJudge');
  const judgeId = judgeSelect.value;
  const judgeName = judgeId ? judgeSelect.options[judgeSelect.selectedIndex].dataset.name : '';

  const body = {
    case_id: document.getElementById('caseId').value.trim(),
    case_title: document.getElementById('caseTitle').value.trim(),
    plaintiff: document.getElementById('casePlaintiff').value.trim(),
    defendant: document.getElementById('caseDefendant').value.trim(),
    filed_date: document.getElementById('caseFiledDate').value,
    status: document.getElementById('caseStatus').value,
    assigned_judge_id: judgeId || null,
    assigned_judge_name: judgeName
  };

  if (!body.case_id || !body.case_title || !body.plaintiff || !body.defendant) {
    showToast('Please fill all required fields.', 'error'); return;
  }

  try {
    const url = editId ? `${API}/cases/${editId}` : `${API}/cases`;
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      showToast(editId ? 'Case updated successfully.' : 'Case created successfully.', 'success');
      closeModal('caseModal');
      resetCaseForm();
      await loadCases();
      renderCases();
      renderDashboard();
    } else {
      showToast(data.error || 'Failed to save case.', 'error');
    }
  } catch (e) {
    showToast('Server error.', 'error');
  }
}

function resetCaseForm() {
  document.getElementById('caseEditId').value = '';
  document.getElementById('caseId').value = '';
  document.getElementById('caseId').disabled = false;
  document.getElementById('caseTitle').value = '';
  document.getElementById('casePlaintiff').value = '';
  document.getElementById('caseDefendant').value = '';
  document.getElementById('caseFiledDate').value = '';
}

function confirmDeleteCase(id) {
  document.getElementById('deleteMsg').textContent = `Are you sure you want to delete case "${id}"? All related hearings will also be deleted.`;
  document.getElementById('deleteConfirmBtn').onclick = () => deleteCase(id);
  openModal('deleteModal');
}

async function deleteCase(id) {
  try {
    const res = await fetch(`${API}/cases/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Case deleted.', 'success');
      closeModal('deleteModal');
      await loadCases();
      await loadHearings();
      renderCases();
      renderDashboard();
    } else {
      showToast('Failed to delete case.', 'error');
    }
  } catch (e) {
    showToast('Server error.', 'error');
  }
}

// ============================================
// HEARINGS
// ============================================
function renderHearings(data) {
  const hearings = data || allHearings;
  const tbody = document.getElementById('hearingsBody');
  if (hearings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyState('No hearings found')}</td></tr>`;
    return;
  }
  tbody.innerHTML = hearings.map(h => `
    <tr>
      <td><span class="case-id-badge">${h.hearing_id}</span></td>
      <td style="font-size:0.82rem">
        <div style="color:var(--text-primary);font-weight:500">${h.case_title}</div>
        <div style="color:var(--text-muted);font-family:'DM Mono',monospace;font-size:0.75rem">${h.case_id}</div>
      </td>
      <td style="font-family:'DM Mono',monospace;font-size:0.8rem">
        <div>${formatDate(h.hearing_date)}</div>
        <div style="color:var(--text-muted)">${h.hearing_time}</div>
      </td>
      <td style="font-size:0.82rem;color:var(--text-secondary)">${h.courtroom}</td>
      <td style="font-size:0.82rem;color:var(--text-secondary)">${h.judge_name}</td>
      <td>${statusBadge(h.status)}</td>
      <td style="font-size:0.8rem;color:var(--text-muted);max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.remarks || '—'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editHearing('${h.hearing_id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" onclick="confirmDeleteHearing('${h.hearing_id}')" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterHearings() {
  const q = document.getElementById('hearingSearch').value.toLowerCase();
  const status = document.getElementById('hearingStatusFilter').value;
  const filtered = allHearings.filter(h => {
    const matchQ = !q || h.case_title.toLowerCase().includes(q) || h.hearing_id.toLowerCase().includes(q) || h.judge_name.toLowerCase().includes(q);
    const matchS = !status || h.status === status;
    return matchQ && matchS;
  });
  renderHearings(filtered);
}

function openHearingModal(mode = 'new') {
  document.getElementById('hearingModalTitle').textContent = mode === 'edit' ? 'Edit Hearing' : 'Schedule Hearing';
  const caseSelect = document.getElementById('hearingCase');
  caseSelect.innerHTML = '<option value="">Select Case</option>' +
    allCases.map(c => `<option value="${c.case_id}" data-title="${c.case_title}">${c.case_id} — ${c.case_title}</option>`).join('');
  openModal('hearingModal');
}

function editHearing(id) {
  const h = allHearings.find(x => x.hearing_id === id);
  if (!h) return;
  document.getElementById('hearingEditId').value = id;
  document.getElementById('hearingId').value = h.hearing_id;
  document.getElementById('hearingId').disabled = true;
  document.getElementById('hearingDate').value = h.hearing_date ? h.hearing_date.split('T')[0] : '';
  document.getElementById('hearingTime').value = h.hearing_time;
  document.getElementById('hearingCourtroom').value = h.courtroom;
  document.getElementById('hearingJudge').value = h.judge_name;
  document.getElementById('hearingStatus').value = h.status;
  document.getElementById('hearingRemarks').value = h.remarks || '';
  openHearingModal('edit');
  setTimeout(() => {
    const caseSelect = document.getElementById('hearingCase');
    for (let opt of caseSelect.options) {
      if (opt.value === h.case_id) { opt.selected = true; break; }
    }
  }, 50);
}

async function saveHearing() {
  const editId = document.getElementById('hearingEditId').value;
  const caseSelect = document.getElementById('hearingCase');
  const caseId = caseSelect.value;
  const caseTitle = caseId ? caseSelect.options[caseSelect.selectedIndex].dataset.title : '';

  const body = {
    hearing_id: document.getElementById('hearingId').value.trim(),
    case_id: caseId,
    case_title: caseTitle,
    hearing_date: document.getElementById('hearingDate').value,
    hearing_time: document.getElementById('hearingTime').value.trim(),
    courtroom: document.getElementById('hearingCourtroom').value.trim(),
    judge_name: document.getElementById('hearingJudge').value.trim(),
    status: document.getElementById('hearingStatus').value,
    remarks: document.getElementById('hearingRemarks').value.trim()
  };

  if (!body.hearing_id || !body.case_id || !body.hearing_date || !body.hearing_time || !body.courtroom) {
    showToast('Please fill all required fields.', 'error'); return;
  }

  try {
    const url = editId ? `${API}/hearings/${editId}` : `${API}/hearings`;
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      showToast(editId ? 'Hearing updated.' : 'Hearing scheduled.', 'success');
      closeModal('hearingModal');
      resetHearingForm();
      await loadHearings();
      renderHearings();
      renderDashboard();
    } else {
      showToast(data.error || 'Failed to save hearing.', 'error');
    }
  } catch (e) {
    showToast('Server error.', 'error');
  }
}

function resetHearingForm() {
  document.getElementById('hearingEditId').value = '';
  document.getElementById('hearingId').value = '';
  document.getElementById('hearingId').disabled = false;
  document.getElementById('hearingDate').value = '';
  document.getElementById('hearingTime').value = '';
  document.getElementById('hearingCourtroom').value = '';
  document.getElementById('hearingJudge').value = '';
  document.getElementById('hearingRemarks').value = '';
}

function confirmDeleteHearing(id) {
  document.getElementById('deleteMsg').textContent = `Are you sure you want to delete hearing "${id}"?`;
  document.getElementById('deleteConfirmBtn').onclick = () => deleteHearing(id);
  openModal('deleteModal');
}

async function deleteHearing(id) {
  try {
    const res = await fetch(`${API}/hearings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Hearing deleted.', 'success');
      closeModal('deleteModal');
      await loadHearings();
      renderHearings();
      renderDashboard();
    } else {
      showToast('Failed to delete hearing.', 'error');
    }
  } catch (e) {
    showToast('Server error.', 'error');
  }
}

// ============================================
// JUDGES
// ============================================
function renderJudges(data) {
  const judges = data || allJudges;
  const grid = document.getElementById('judgesGrid');
  if (judges.length === 0) {
    grid.innerHTML = emptyState('No judges found');
    return;
  }
  grid.innerHTML = judges.map((j, i) => `
    <div class="judge-card" style="animation-delay:${i * 0.05}s">
      <div class="judge-avatar-lg">${j.judge_name.charAt(0)}</div>
      <div class="judge-name">${j.judge_name}</div>
      <span class="judge-spec">${j.specialization}</span>
      <div class="judge-meta">
        <div class="judge-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          ${j.experience_years} years experience
        </div>
        <div class="judge-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          ${j.email}
        </div>
        ${j.phone ? `
        <div class="judge-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 5.35 5.35l1.49-1.49a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${j.phone}
        </div>` : ''}
      </div>
    </div>
  `).join('');
}

function filterJudges() {
  const q = document.getElementById('judgeSearch').value.toLowerCase();
  const filtered = allJudges.filter(j =>
    j.judge_name.toLowerCase().includes(q) ||
    j.specialization.toLowerCase().includes(q) ||
    j.email.toLowerCase().includes(q)
  );
  renderJudges(filtered);
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  if (id === 'caseModal') resetCaseForm();
  if (id === 'hearingModal') resetHearingForm();
}

// Wire up "New Case" and "Schedule Hearing" buttons properly
document.addEventListener('DOMContentLoaded', () => {
  // Override the direct openModal calls to use the proper setup functions
});

// Clicking the "New Case" button — re-wire via event
document.querySelectorAll && document.addEventListener('click', e => {
  const target = e.target.closest('button');
  if (!target) return;
  if (target.getAttribute('onclick') === "openModal('caseModal')") {
    e.preventDefault();
    e.stopPropagation();
    openCaseModal('new');
  }
  if (target.getAttribute('onclick') === "openModal('hearingModal')") {
    e.preventDefault();
    e.stopPropagation();
    openHearingModal('new');
  }
});

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });
});

// ============================================
// HELPERS
// ============================================
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
  const map = {
    'Open': 'open', 'Closed': 'closed', 'Pending': 'pending', 'In Review': 'review',
    'Scheduled': 'scheduled', 'Completed': 'completed', 'Postponed': 'postponed', 'Cancelled': 'cancelled'
  };
  const cls = map[status] || 'pending';
  return `<span class="status-badge status-${cls}">${status}</span>`;
}

function emptyState(msg) {
  return `<div class="empty-state">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p>${msg}</p>
  </div>`;
}

let toastTimer;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}
