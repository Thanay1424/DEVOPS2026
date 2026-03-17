/* ===================================================
   DASHBOARD PAGE SCRIPT
   =================================================== */

api.requireAuth();

let doughnutChart, barChart, lineChart;
let allStats = [];

// ── BOOT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ui.initClock();
  ui.initUserInfo();
  loadDashboard();
});

// ── LOAD DASHBOARD ────────────────────────────────
async function loadDashboard() {
  showSkeletons(true);
  try {
    const [statsRes, analyticsRes] = await Promise.all([
      api.get('/crime-stats?limit=20'),
      api.get('/crime-stats/analytics/summary'),
    ]);

    if (!statsRes.ok || !analyticsRes.ok) {
      ui.toast('Failed to load dashboard data.', 'error');
      showSkeletons(false);
      return;
    }

    allStats = statsRes.data.data || [];
    const analytics = analyticsRes.data;
    const latest = analytics.latest || allStats[0];

    if (latest) {
      updateMetricCards(latest);
    }

    renderCharts(analytics);
    renderTable(allStats);
    updateTableCount(statsRes.data.total || allStats.length);
  } catch (err) {
    ui.toast('Unexpected error loading data.', 'error');
  } finally {
    showSkeletons(false);
  }
}

// ── SKELETONS ─────────────────────────────────────
function showSkeletons(show) {
  document.querySelectorAll('.metric-value').forEach(el => {
    el.style.opacity = show ? '0.3' : '1';
    el.style.transition = 'opacity 0.4s';
  });
}

// ── METRIC CARDS ──────────────────────────────────
function updateMetricCards(data) {
  const fields = ['theft', 'assault', 'fraud', 'cybercrime', 'crimeIndex'];
  fields.forEach(field => {
    const el = document.getElementById(`metric-${field}`);
    if (el) {
      el.textContent = data[field] ?? '—';
    }
  });
}

// ── CHARTS ────────────────────────────────────────
const chartDefaults = {
  font: { family: "'Barlow', sans-serif" },
  color: '#8b93a8',
};

const COLORS = {
  theft:      { fill: 'rgba(255,59,48,0.85)',   border: '#FF3B30' },
  assault:    { fill: 'rgba(255,107,53,0.85)',  border: '#FF6B35' },
  fraud:      { fill: 'rgba(255,184,0,0.85)',   border: '#FFB800' },
  cybercrime: { fill: 'rgba(59,130,246,0.85)',  border: '#3B82F6' },
};

function renderCharts(analytics) {
  const latest = analytics.latest;
  const trends = analytics.trends || [];

  // Destroy old instances
  [doughnutChart, barChart, lineChart].forEach(c => c && c.destroy());

  // ── Doughnut ──
  if (latest) {
    const dCtx = document.getElementById('doughnutChart')?.getContext('2d');
    if (dCtx) {
      doughnutChart = new Chart(dCtx, {
        type: 'doughnut',
        data: {
          labels: ['Theft', 'Assault', 'Fraud', 'Cybercrime'],
          datasets: [{
            data: [latest.theft, latest.assault, latest.fraud, latest.cybercrime],
            backgroundColor: [
              COLORS.theft.fill, COLORS.assault.fill,
              COLORS.fraud.fill, COLORS.cybercrime.fill,
            ],
            borderColor: [
              COLORS.theft.border, COLORS.assault.border,
              COLORS.fraud.border, COLORS.cybercrime.border,
            ],
            borderWidth: 2,
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#8b93a8', padding: 16, font: chartDefaults.font },
            },
            tooltip: tooltipStyle(),
          },
        },
      });
    }
  }

  // ── Bar ──
  if (latest) {
    const bCtx = document.getElementById('barChart')?.getContext('2d');
    if (bCtx) {
      barChart = new Chart(bCtx, {
        type: 'bar',
        data: {
          labels: ['Theft', 'Assault', 'Fraud', 'Cybercrime'],
          datasets: [{
            label: 'Cases',
            data: [latest.theft, latest.assault, latest.fraud, latest.cybercrime],
            backgroundColor: [
              COLORS.theft.fill, COLORS.assault.fill,
              COLORS.fraud.fill, COLORS.cybercrime.fill,
            ],
            borderColor: [
              COLORS.theft.border, COLORS.assault.border,
              COLORS.fraud.border, COLORS.cybercrime.border,
            ],
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: tooltipStyle(),
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8', font: chartDefaults.font } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8', font: chartDefaults.font }, beginAtZero: true },
          },
        },
      });
    }
  }

  // ── Line ──
  if (trends.length) {
    const lCtx = document.getElementById('lineChart')?.getContext('2d');
    if (lCtx) {
      const labels = trends.map((t, i) => {
        const d = new Date(t.date);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      });

      lineChart = new Chart(lCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            lineDataset('Theft',      trends.map(t => t.theft),      COLORS.theft.border),
            lineDataset('Assault',    trends.map(t => t.assault),    COLORS.assault.border),
            lineDataset('Fraud',      trends.map(t => t.fraud),      COLORS.fraud.border),
            lineDataset('Cybercrime', trends.map(t => t.cybercrime), COLORS.cybercrime.border),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#8b93a8', padding: 16, font: chartDefaults.font, boxWidth: 12, boxHeight: 12 },
            },
            tooltip: tooltipStyle(),
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8', font: chartDefaults.font, maxTicksLimit: 8 } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8', font: chartDefaults.font }, beginAtZero: true },
          },
        },
      });
    }
  }
}

function lineDataset(label, data, color) {
  return {
    label, data,
    borderColor: color,
    backgroundColor: color + '18',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 6,
    fill: true,
    tension: 0.4,
  };
}

function tooltipStyle() {
  return {
    backgroundColor: '#13161f',
    borderColor: '#252b3b',
    borderWidth: 1,
    titleColor: '#e8eaf0',
    bodyColor: '#8b93a8',
    padding: 12,
    cornerRadius: 8,
    titleFont: { family: "'Space Mono', monospace", size: 11 },
    bodyFont: { family: "'Barlow', sans-serif", size: 12 },
  };
}

// ── TABLE ─────────────────────────────────────────
function renderTable(stats) {
  const tbody = document.getElementById('stats-tbody');
  if (!tbody) return;

  if (!stats.length) {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 17H5a2 2 0 00-2 2"/><path d="M15 17h4a2 2 0 012 2"/>
            <rect x="2" y="3" width="20" height="14" rx="2"/>
          </svg>
          <p>No crime statistics recorded yet. Add data to get started.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = stats.map(s => {
    const total = s.theft + s.assault + s.fraud + s.cybercrime;
    const idx = s.crimeIndex;
    const idxColor = ui.getIndexColor(idx);
    const idxLabel = ui.getIndexLabel(idx);
    return `
      <tr>
        <td class="td-mono">${ui.formatDate(s.createdAt)}</td>
        <td class="td-mono" style="color:#FF3B30">${s.theft}</td>
        <td class="td-mono" style="color:#FF6B35">${s.assault}</td>
        <td class="td-mono" style="color:#FFB800">${s.fraud}</td>
        <td class="td-mono" style="color:#3B82F6">${s.cybercrime}</td>
        <td class="td-mono">${total}</td>
        <td>
          <div class="index-bar">
            <div class="index-track">
              <div class="index-fill" style="width:${idx}%; background:${idxColor}"></div>
            </div>
            <span class="index-num" style="color:${idxColor}">${idx}</span>
          </div>
        </td>
        <td>
          <span class="td-badge" style="background:${idxColor}22;color:${idxColor};border:1px solid ${idxColor}44">
            ${idxLabel}
          </span>
        </td>
      </tr>`;
  }).join('');
}

function updateTableCount(total) {
  const el = document.getElementById('record-count');
  if (el) el.textContent = `${total} records`;
}

// ── ADD STATS MODAL ───────────────────────────────
function openAddModal() {
  document.getElementById('add-modal').classList.remove('hidden');
}

function closeAddModal() {
  document.getElementById('add-modal').classList.add('hidden');
  document.getElementById('add-stats-form').reset();
}

document.getElementById('add-stats-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('add-submit-btn');
  ui.setLoading(btn, true);

  const body = {
    theft:      Number(document.getElementById('f-theft').value),
    assault:    Number(document.getElementById('f-assault').value),
    fraud:      Number(document.getElementById('f-fraud').value),
    cybercrime: Number(document.getElementById('f-cybercrime').value),
    crimeIndex: Number(document.getElementById('f-crimeIndex').value),
    region:     document.getElementById('f-region').value || 'National',
    notes:      document.getElementById('f-notes').value || '',
  };

  const res = await api.post('/crime-stats', body);
  ui.setLoading(btn, false);

  if (res.ok) {
    ui.toast('Crime statistics added successfully!', 'success');
    closeAddModal();
    loadDashboard();
  } else {
    ui.toast(res.data.message || 'Failed to add statistics.', 'error');
  }
});

// ── REFRESH ───────────────────────────────────────
function refreshData() {
  loadDashboard();
  ui.toast('Data refreshed.', 'info');
}
