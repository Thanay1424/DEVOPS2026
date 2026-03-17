/* ===================================================
   REPORTS PAGE SCRIPT
   =================================================== */

api.requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  ui.initClock();
  ui.initUserInfo();
  loadReports();
});

async function loadReports() {
  try {
    const [statsRes, analyticsRes] = await Promise.all([
      api.get('/crime-stats?limit=50'),
      api.get('/crime-stats/analytics/summary'),
    ]);

    if (!statsRes.ok || !analyticsRes.ok) {
      ui.toast('Failed to load report data.', 'error');
      return;
    }

    const stats = statsRes.data.data || [];
    const analytics = analyticsRes.data;

    renderSummaryCards(analytics);
    renderInsights(analytics);
    renderReportTable(stats);
    renderPrintDate();
  } catch (err) {
    ui.toast('Error loading reports.', 'error');
  }
}

function renderSummaryCards(analytics) {
  if (!analytics.latest) return;
  const l = analytics.latest;
  const a = analytics.averages || {};

  setVal('rpt-total-records', analytics.totalRecords || 0);
  setVal('rpt-theft',      l.theft);
  setVal('rpt-assault',    l.assault);
  setVal('rpt-fraud',      l.fraud);
  setVal('rpt-cybercrime', l.cybercrime);
  setVal('rpt-crime-index', l.crimeIndex);
  setVal('rpt-total-crimes', (l.theft + l.assault + l.fraud + l.cybercrime));

  setVal('rpt-avg-theft',      a.theft || '—');
  setVal('rpt-avg-assault',    a.assault || '—');
  setVal('rpt-avg-fraud',      a.fraud || '—');
  setVal('rpt-avg-cybercrime', a.cybercrime || '—');
  setVal('rpt-avg-index',      a.crimeIndex || '—');

  // Index status
  const idx = l.crimeIndex;
  const statusEl = document.getElementById('rpt-index-status');
  if (statusEl) {
    statusEl.textContent = ui.getIndexLabel(idx);
    statusEl.style.color = ui.getIndexColor(idx);
  }
}

function renderInsights(analytics) {
  const container = document.getElementById('insights-list');
  if (!container || !analytics.latest) return;

  const l = analytics.latest;
  const a = analytics.averages;
  const insights = [];

  const total = l.theft + l.assault + l.fraud + l.cybercrime;
  const dominant = ['theft','assault','fraud','cybercrime'].reduce((a, b) =>
    l[a] > l[b] ? a : b);

  insights.push({
    type: 'warning',
    title: 'Dominant Crime Category',
    text: `${capitalize(dominant)} accounts for the highest case count (${l[dominant]}) in the latest reporting period, representing ${((l[dominant]/total)*100).toFixed(1)}% of total crimes.`,
  });

  if (l.crimeIndex >= 70) {
    insights.push({
      type: 'critical',
      title: 'High Crime Index Alert',
      text: `The current crime index of ${l.crimeIndex} is classified as "${ui.getIndexLabel(l.crimeIndex)}". Immediate resource allocation and preventive measures are recommended.`,
    });
  } else if (l.crimeIndex >= 50) {
    insights.push({
      type: 'moderate',
      title: 'Moderate Crime Index',
      text: `The current crime index of ${l.crimeIndex} indicates a moderate crime environment. Continued monitoring and targeted interventions are advised.`,
    });
  } else {
    insights.push({
      type: 'safe',
      title: 'Low Crime Index',
      text: `The current crime index of ${l.crimeIndex} reflects relatively low crime levels. Maintaining current preventive strategies is recommended.`,
    });
  }

  if (a) {
    if (l.cybercrime > parseFloat(a.cybercrime) * 1.1) {
      insights.push({
        type: 'warning',
        title: 'Cybercrime Trend',
        text: `Current cybercrime cases (${l.cybercrime}) are above the historical average (${a.cybercrime}). Digital crime prevention programs should be reinforced.`,
      });
    }
    if (l.fraud > parseFloat(a.fraud) * 1.1) {
      insights.push({
        type: 'warning',
        title: 'Fraud Activity Elevated',
        text: `Fraud cases (${l.fraud}) exceed the average of ${a.fraud}. Enhanced financial crime detection is advisable.`,
      });
    }
  }

  insights.push({
    type: 'info',
    title: 'Data Coverage',
    text: `This report is based on ${analytics.totalRecords} recorded entries. For comprehensive analytics, ensure all regional data has been submitted to the system.`,
  });

  container.innerHTML = insights.map(ins => `
    <div class="insight-item insight-${ins.type}">
      <div class="insight-dot insight-dot-${ins.type}"></div>
      <div class="insight-content">
        <div class="insight-title">${ins.title}</div>
        <div class="insight-text">${ins.text}</div>
      </div>
    </div>
  `).join('');
}

function renderReportTable(stats) {
  const tbody = document.getElementById('report-tbody');
  if (!tbody) return;

  if (!stats.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted)">No data available.</td></tr>`;
    return;
  }

  tbody.innerHTML = stats.map((s, i) => {
    const total = s.theft + s.assault + s.fraud + s.cybercrime;
    const idx = s.crimeIndex;
    const color = ui.getIndexColor(idx);
    return `
      <tr>
        <td class="td-mono" style="color:var(--text-muted)">#${i+1}</td>
        <td class="td-mono">${ui.formatDateTime(s.createdAt)}</td>
        <td class="td-mono" style="color:#FF3B30">${s.theft}</td>
        <td class="td-mono" style="color:#FF6B35">${s.assault}</td>
        <td class="td-mono" style="color:#FFB800">${s.fraud}</td>
        <td class="td-mono" style="color:#3B82F6">${s.cybercrime}</td>
        <td class="td-mono">${total}</td>
        <td class="td-mono" style="color:${color};font-weight:700">${idx}</td>
        <td><span class="td-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${ui.getIndexLabel(idx)}</span></td>
      </tr>`;
  }).join('');
}

function renderPrintDate() {
  const el = document.getElementById('print-date');
  if (el) el.textContent = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function printReport() {
  window.print();
}
