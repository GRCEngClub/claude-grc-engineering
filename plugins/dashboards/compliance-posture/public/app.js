const $ = (selector) => document.querySelector(selector);

const statusRank = { ok: 0, no_data: 1, warning: 1, critical: 2 };
const statusCopy = {
  ok: 'On track',
  warning: 'Watch',
  critical: 'Critical',
  no_data: 'No data'
};

let state = { runs: [], latest: null, previous: null, meta: null };

async function refresh() {
  const response = await fetch('/api/runs', { cache: 'no-store' });
  const payload = await response.json();
  const runs = (payload.runs || []).filter(run => run.generated_at);
  state = {
    runs,
    latest: runs.at(-1) || null,
    previous: runs.at(-2) || null,
    meta: payload
  };
  render();
}

function percent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'n/a';
  return `${Math.round(Number(value) * 100)}%`;
}

function coverage(value) {
  return value === null || value === undefined ? 'n/a' : `${value}%`;
}

function number(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function dateLabel(value) {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function statusClass(status) {
  const known = ['ok', 'no_data', 'warning', 'critical'];
  return `status-${known.includes(status) ? status : 'no_data'}`;
}

function latestFrameworks() {
  return state.latest?.framework_results || [];
}

function frameworkPrevious(framework) {
  return (state.previous?.framework_results || []).find(item => item.framework === framework);
}

function trendDelta(current, previous) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  return current - previous;
}

function render() {
  renderChrome();
  if (!state.latest) {
    $('#empty-state').classList.remove('hidden');
    $('#posture').innerHTML = '';
    $('#trend-chart').innerHTML = '';
    $('#chart-legend').innerHTML = '';
    $('#framework-table').innerHTML = '';
    $('#alert-list').innerHTML = '';
    $('#run-list').innerHTML = '';
    return;
  }

  $('#empty-state').classList.add('hidden');
  renderMetrics();
  renderTrend();
  renderOverall();
  renderFrameworks();
  renderAlerts();
  renderHistory();
}

function renderChrome() {
  const paths = state.meta?.data_paths?.join(', ') || 'No data path reported';
  $('#data-source').textContent = paths;

  if (!state.latest) {
    $('#run-subtitle').textContent = 'No saved monitor-continuous JSON found.';
    return;
  }

  const frameworks = latestFrameworks().map(f => f.framework).join(', ');
  $('#run-subtitle').textContent = `${dateLabel(state.latest.generated_at)} - ${frameworks || 'no frameworks'} - ${state.runs.length} saved run${state.runs.length === 1 ? '' : 's'}`;
}

function renderMetrics() {
  const latest = state.latest;
  const currentRate = latest.summary?.overall_pass_rate;
  const previousRate = state.previous?.summary?.overall_pass_rate;
  const delta = trendDelta(currentRate, previousRate);
  const frameworkCount = latestFrameworks().length;
  const criticalCount = latestFrameworks().filter(f => f.status === 'critical').length;

  const cards = [
    {
      label: 'Overall pass rate',
      value: percent(currentRate),
      caption: delta === null ? 'First saved run' : `${delta >= 0 ? '+' : ''}${Math.round(delta * 100)} pts since previous`,
      icon: 'OK'
    },
    {
      label: 'Frameworks in scope',
      value: number(frameworkCount),
      caption: `${criticalCount} critical, ${latestFrameworks().filter(f => f.status === 'warning').length} warning`,
      icon: 'FW'
    },
    {
      label: 'Tier 1 blockers',
      value: number(latest.summary?.tier1_blockers),
      caption: `${number(latest.summary?.tier2_findings)} tier 2 findings`,
      icon: 'T1'
    },
    {
      label: 'Open alerts',
      value: number(latest.alerts?.length),
      caption: `${number(latest.sources?.length)} evidence sources`,
      icon: 'AL'
    }
  ];

  $('#posture').innerHTML = cards.map(card => `
    <article class="metric-card">
      <div class="metric-top">
        <div>
          <p class="eyebrow">${card.label}</p>
          <div class="metric-value">${card.value}</div>
        </div>
        <div class="metric-icon">${card.icon}</div>
      </div>
      <div class="metric-caption">${card.caption}</div>
    </article>
  `).join('');
}

function renderOverall() {
  const status = state.latest.summary?.overall_status || 'no_data';
  const rate = state.latest.summary?.overall_pass_rate || 0;
  const summary = state.latest.summary || {};
  $('#overall-status').textContent = statusCopy[status] || status;
  $('#overall-status').className = `status-pill ${statusClass(status)}`;
  $('#overall-donut').style.setProperty('--value', Math.round(rate * 100));
  $('#overall-rate').textContent = percent(rate);
  $('#overall-breakdown').innerHTML = [
    ['Passing checks', number(summary.passes)],
    ['Inconclusive', number(summary.inconclusive)],
    ['Tier 1 blockers', number(summary.tier1_blockers)],
    ['Report bundle', state.latest.artifacts?.gap_report_dir || 'not recorded']
  ].map(([label, value]) => `
    <div class="breakdown-row"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>
  `).join('');
}

function renderTrend() {
  const runs = state.runs.slice(-14);
  $('#trend-caption').textContent = `${runs.length} run${runs.length === 1 ? '' : 's'}`;
  $('#chart-legend').innerHTML = '<span>Overall pass rate</span><span>Warning threshold</span>';

  if (runs.length < 2) {
    $('#trend-chart').innerHTML = '<div class="empty-state"><p class="muted">Save at least two monitor runs to see a trend.</p></div>';
    return;
  }

  const width = 860;
  const height = 300;
  const pad = 34;
  const values = runs.map(run => run.summary?.overall_pass_rate ?? 0);
  const x = (index) => pad + (index / Math.max(1, runs.length - 1)) * (width - pad * 2);
  const y = (value) => pad + (1 - value) * (height - pad * 2);
  const points = values.map((value, index) => [x(index), y(value)]);
  const path = points.map(([px, py], index) => `${index === 0 ? 'M' : 'L'} ${px} ${py}`).join(' ');
  const area = `${path} L ${x(points.length - 1)} ${height - pad} L ${x(0)} ${height - pad} Z`;
  const warn = state.latest.thresholds?.warning ?? 0.9;

  $('#trend-chart').innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Overall pass-rate trend">
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#356f64" stop-opacity="0.22"></stop>
          <stop offset="100%" stop-color="#356f64" stop-opacity="0.02"></stop>
        </linearGradient>
      </defs>
      ${[0.25, 0.5, 0.75, 1].map(v => `<line class="grid-line" x1="${pad}" x2="${width - pad}" y1="${y(v)}" y2="${y(v)}"></line>`).join('')}
      <line class="threshold-line" x1="${pad}" x2="${width - pad}" y1="${y(warn)}" y2="${y(warn)}"></line>
      <path class="trend-area" d="${area}"></path>
      <path class="trend-line" d="${path}"></path>
      ${points.map(([px, py], index) => {
        const run = runs[index];
        const summary = run.summary || {};
        const tooltip = [
          dateLabel(run.generated_at),
          `Run: ${run.run_id || 'unknown'}`,
          `Pass rate: ${percent(summary.overall_pass_rate)}`,
          `Status: ${summary.overall_status || 'no_data'}`,
          `Tier 1 blockers: ${number(summary.tier1_blockers)}`,
          `Alerts: ${number(run.alerts?.length)}`
        ].join('|');
        return `
          <g>
            <circle
              class="point-hit"
              cx="${px}"
              cy="${py}"
              r="16"
              tabindex="0"
              data-x="${(px / width) * 100}"
              data-y="${(py / height) * 100}"
              data-tooltip="${escapeHtml(tooltip)}"></circle>
            <circle class="point" cx="${px}" cy="${py}" r="${index === points.length - 1 ? 6 : 4}"></circle>
          </g>
        `;
      }).join('')}
      <text x="${pad}" y="${height - 4}" fill="#657077" font-size="13">${dateLabel(runs[0].generated_at)}</text>
      <text x="${width - pad}" y="${height - 4}" fill="#657077" font-size="13" text-anchor="end">${dateLabel(runs.at(-1).generated_at)}</text>
      <text x="${width - pad}" y="${y(warn) - 8}" fill="#8a9296" font-size="12" text-anchor="end">warning ${percent(warn)}</text>
    </svg>
    <div id="trend-tooltip" class="trend-tooltip hidden" role="status"></div>
  `;
  bindTrendTooltip();
}

function bindTrendTooltip() {
  const tooltip = $('#trend-tooltip');
  if (!tooltip) return;

  const show = (target) => {
    const rows = (target.dataset.tooltip || '').split('|');
    tooltip.innerHTML = `
      <strong>${escapeHtml(rows[0] || 'Monitor run')}</strong>
      ${rows.slice(1).map(row => `<span>${escapeHtml(row)}</span>`).join('')}
    `;
    tooltip.style.left = `${target.dataset.x}%`;
    tooltip.style.top = `${target.dataset.y}%`;
    tooltip.classList.remove('hidden');
  };

  const hide = () => tooltip.classList.add('hidden');

  document.querySelectorAll('.point-hit').forEach(point => {
    point.addEventListener('mouseenter', () => show(point));
    point.addEventListener('focus', () => show(point));
    point.addEventListener('mouseleave', hide);
    point.addEventListener('blur', hide);
  });
}

function renderFrameworks() {
  const frameworks = latestFrameworks()
    .slice()
    .sort((a, b) => (statusRank[b.status] ?? 0) - (statusRank[a.status] ?? 0) || (a.pass_rate ?? 0) - (b.pass_rate ?? 0));

  $('#framework-count').textContent = `${frameworks.length} framework${frameworks.length === 1 ? '' : 's'}`;
  $('#framework-table').innerHTML = frameworks.map(item => {
    const previous = frameworkPrevious(item.framework);
    const delta = trendDelta(item.pass_rate, previous?.pass_rate);
    const deltaCopy = delta === null ? 'new' : `${delta >= 0 ? '+' : ''}${Math.round(delta * 100)} pts`;
    return `
      <div class="framework-row">
        <div>
          <div class="framework-title">${escapeHtml(item.framework)}</div>
          <div class="framework-subtitle">${escapeHtml(item.display_name || 'Monitor result')}</div>
        </div>
        <div>
          <div class="bar" title="${percent(item.pass_rate)} pass rate"><span style="--value: ${Math.round((item.pass_rate || 0) * 100)}"></span></div>
          <div class="framework-subtitle">${escapeHtml(deltaCopy)} since previous run</div>
        </div>
        <div>
          <div class="cell-label">Pass rate</div>
          <div class="cell-value">${percent(item.pass_rate)}</div>
        </div>
        <div>
          <div class="cell-label">Coverage</div>
          <div class="cell-value">${coverage(item.coverage_pct)}</div>
        </div>
        <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusCopy[item.status] || item.status)}</span>
      </div>
    `;
  }).join('');
}

function renderAlerts() {
  const alerts = [...(state.latest.alerts || [])];
  const deltas = latestFrameworks()
    .map(item => {
      const previous = frameworkPrevious(item.framework);
      const delta = trendDelta(item.pass_rate, previous?.pass_rate);
      return { framework: item.framework, delta };
    })
    .filter(item => item.delta !== null)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3);

  const alertCards = alerts.map(alert => `
    <div class="alert-card">
      <span class="status-pill ${statusClass(alert.severity)}">${escapeHtml(alert.severity)}</span>
      <strong>${escapeHtml(alert.framework || 'Run alert')}</strong>
      <p>${escapeHtml(alert.message)}</p>
    </div>
  `);

  const deltaCards = deltas.map(item => `
    <div class="alert-card">
      <span class="status-pill ${item.delta >= 0 ? 'status-ok' : 'status-warning'}">${item.delta >= 0 ? 'improved' : 'changed'}</span>
      <strong>${escapeHtml(item.framework)}</strong>
      <p>${item.delta >= 0 ? '+' : ''}${Math.round(item.delta * 100)} percentage points since the previous saved run.</p>
    </div>
  `);

  $('#alert-list').innerHTML = [...alertCards, ...deltaCards].join('') || `
    <div class="alert-card">
      <span class="status-pill status-ok">clear</span>
      <strong>No open alerts</strong>
      <p>All frameworks are at or above their warning thresholds in the latest run.</p>
    </div>
  `;
}

function renderHistory() {
  $('#run-list').innerHTML = state.runs.slice(-8).reverse().map(run => `
    <div class="run-item">
      <div><strong>${escapeHtml(run.run_id || 'unknown run')}</strong>${dateLabel(run.generated_at)}</div>
      <div><strong>${percent(run.summary?.overall_pass_rate)}</strong>pass rate</div>
      <div><span class="status-pill ${statusClass(run.summary?.overall_status)}">${escapeHtml(run.summary?.overall_status || 'no_data')}</span></div>
      <div>${escapeHtml(run.source_file || 'unknown source')}</div>
    </div>
  `).join('');
}

$('#refresh').addEventListener('click', refresh);
refresh().catch(err => {
  $('#run-subtitle').textContent = `Dashboard failed to load: ${err.message}`;
  $('#empty-state').classList.remove('hidden');
});
