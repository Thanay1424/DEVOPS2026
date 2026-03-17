/* ===================================================
   ADMIN PAGE SCRIPT
   =================================================== */

api.requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  ui.initClock();
  ui.initUserInfo();

  const user = api.getUser();
  if (user?.role !== 'admin') {
    document.getElementById('access-denied').classList.remove('hidden');
    document.getElementById('admin-content').classList.add('hidden');
    return;
  }

  loadAdminData();
});

let editingId = null;

async function loadAdminData() {
  await Promise.all([loadUsers(), loadAllStats()]);
}

// ── USERS ──────────────────────────────────────────
async function loadUsers() {
  const res = await api.get('/users');
  if (!res.ok) { ui.toast('Failed to load users.', 'error'); return; }

  const users = res.data.users || [];
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted)">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted)">${u._id.slice(-8)}</td>
      <td style="font-weight:600;color:var(--text-primary)">${u.username}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.role}">${u.role}</span></td>
      <td>${ui.formatDate(u.lastLogin) || 'Never'}</td>
      <td>${ui.formatDate(u.createdAt)}</td>
    </tr>
  `).join('');

  const countEl = document.getElementById('user-count');
  if (countEl) countEl.textContent = users.length;
}

// ── ALL STATS ─────────────────────────────────────
async function loadAllStats() {
  const res = await api.get('/crime-stats?limit=50');
  if (!res.ok) { ui.toast('Failed to load stats.', 'error'); return; }

  const stats = res.data.data || [];
  const tbody = document.getElementById('admin-stats-tbody');
  if (!tbody) return;

  if (!stats.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--text-muted)">No stats recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = stats.map(s => `
    <tr>
      <td class="td-mono" style="font-size:0.72rem;color:var(--text-muted)">${s._id.slice(-8)}</td>
      <td class="td-mono">${ui.formatDate(s.createdAt)}</td>
      <td class="td-mono" style="color:#FF3B30">${s.theft}</td>
      <td class="td-mono" style="color:#FF6B35">${s.assault}</td>
      <td class="td-mono" style="color:#FFB800">${s.fraud}</td>
      <td class="td-mono" style="color:#3B82F6">${s.cybercrime}</td>
      <td class="td-mono" style="color:${ui.getIndexColor(s.crimeIndex)};font-weight:700">${s.crimeIndex}</td>
      <td>${s.reportedBy?.username || '—'}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn-sm btn-outline" onclick="openEdit('${s._id}', ${s.theft}, ${s.assault}, ${s.fraud}, ${s.cybercrime}, ${s.crimeIndex}, '${s.region||''}', '${s.notes||''}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="btn-sm" style="background:rgba(255,59,48,0.15);color:#FF3B30;border:1px solid rgba(255,59,48,0.3)" onclick="deleteStats('${s._id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            Del
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const countEl = document.getElementById('stats-count');
  if (countEl) countEl.textContent = stats.length;
}

// ── ADD STATS ─────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add Crime Statistics';
  document.getElementById('admin-stats-form').reset();
  document.getElementById('admin-stats-modal').classList.remove('hidden');
}

function openEdit(id, theft, assault, fraud, cybercrime, crimeIndex, region, notes) {
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Crime Statistics';
  document.getElementById('af-theft').value      = theft;
  document.getElementById('af-assault').value    = assault;
  document.getElementById('af-fraud').value      = fraud;
  document.getElementById('af-cybercrime').value = cybercrime;
  document.getElementById('af-crimeIndex').value = crimeIndex;
  document.getElementById('af-region').value     = region;
  document.getElementById('af-notes').value      = notes;
  document.getElementById('admin-stats-modal').classList.remove('hidden');
}

function closeAdminModal() {
  document.getElementById('admin-stats-modal').classList.add('hidden');
  editingId = null;
}

document.getElementById('admin-stats-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('admin-submit-btn');
  ui.setLoading(btn, true);

  const body = {
    theft:      Number(document.getElementById('af-theft').value),
    assault:    Number(document.getElementById('af-assault').value),
    fraud:      Number(document.getElementById('af-fraud').value),
    cybercrime: Number(document.getElementById('af-cybercrime').value),
    crimeIndex: Number(document.getElementById('af-crimeIndex').value),
    region:     document.getElementById('af-region').value || 'National',
    notes:      document.getElementById('af-notes').value || '',
  };

  let res;
  if (editingId) {
    res = await api.put(`/crime-stats/${editingId}`, body);
  } else {
    res = await api.post('/crime-stats', body);
  }

  ui.setLoading(btn, false);

  if (res.ok) {
    ui.toast(editingId ? 'Stats updated!' : 'Stats added!', 'success');
    closeAdminModal();
    loadAllStats();
  } else {
    ui.toast(res.data.message || 'Operation failed.', 'error');
  }
});

async function deleteStats(id) {
  if (!confirm('Delete this record? This action cannot be undone.')) return;
  const res = await api.delete(`/crime-stats/${id}`);
  if (res.ok) {
    ui.toast('Record deleted.', 'success');
    loadAllStats();
  } else {
    ui.toast('Failed to delete.', 'error');
  }
}
