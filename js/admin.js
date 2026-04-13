// ================================================================
// FINGERPRINT VOTING SYSTEM v2 — Admin Panel (admin.js)
// ================================================================
'use strict';

const ADMIN_PASS = 'admin123';
let currentTab   = 'dashboard';
let monitorTimer = null;
let candModalMode = 'add'; // 'add' | 'edit'
let editingCandId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (SessionManager.isAdmin()) {
    showPanel();
  } else {
    Utils.$('#admin-login-screen').style.display = 'flex';
    Utils.$('#admin-panel').style.display        = 'none';
    setupLogin();
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
function setupLogin() {
  Utils.$('#login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const pass = Utils.$('#admin-pass').value;
    if (pass === ADMIN_PASS) {
      const btn = Utils.$('#login-btn');
      btn.classList.add('loading'); btn.disabled = true;
      await new Promise(r=>setTimeout(r,1000));
      btn.classList.remove('loading');
      SessionManager.setAdmin();
      StorageManager.addLog('ADMIN_LOGIN','Administrator logged in','admin');
      showPanel();
    } else {
      Notify.error('Invalid password.');
      Utils.$('#admin-pass').value = '';
      Utils.$('#admin-pass').classList.add('shake');
      setTimeout(()=>Utils.$('#admin-pass').classList.remove('shake'),500);
    }
  });
}

function showPanel() {
  Utils.$('#admin-login-screen').style.display = 'none';
  Utils.$('#admin-panel').style.display        = 'block';
  Utils.$('#btn-logout').style.display         = 'inline-flex';
  setupTabs();
  setupElectionControl();
  setupCandidateModal();
  setupLogout();
  loadTab('dashboard');
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function setupTabs() {
  Utils.$$('.tab-btn').forEach(btn => btn.addEventListener('click', ()=>loadTab(btn.dataset.tab)));
}
function loadTab(tab) {
  currentTab = tab;
  Utils.$$('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  Utils.$$('.tab-panel').forEach(p=>p.classList.toggle('active', p.id===`tab-${tab}`));
  clearInterval(monitorTimer);
  switch(tab) {
    case 'dashboard': renderDashboard(); break;
    case 'voters':    renderVotersTab(); break;
    case 'candidates':renderCandidatesTab(); break;
    case 'election':  renderElectionTab(); break;
    case 'monitor':   renderMonitorTab(); startMonitorPolling(); break;
    case 'fraud':     renderFraudTab(); break;
    case 'results':   renderResultsTab(); break;
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const stats = StorageManager.getStats();

  // KPI trend arrows
  const prev = JSON.parse(sessionStorage.getItem('kpi_snap')||'{}');
  const arrow = (k, cur) => {
    const p = prev[k]||0;
    if (cur>p) return `<span style="color:var(--success);font-size:.75rem;margin-left:4px">↑</span>`;
    if (cur<p) return `<span style="color:var(--danger);font-size:.75rem;margin-left:4px">↓</span>`;
    return '';
  };
  const setKpi = (id, key, val) => {
    const el = Utils.$(`#${id}`); if(!el) return;
    Utils.animateCounter(el, val);
    const wrap = el.parentElement?.querySelector('.kpi-trend');
    if (wrap) wrap.innerHTML = arrow(key, val);
  };
  setKpi('d-registered','registered', stats.totalRegistered);
  setKpi('d-pending',   'pending',    stats.pending);
  setKpi('d-approved',  'approved',   stats.approved);
  setKpi('d-voted',     'voted',      stats.voted);
  setKpi('d-turnout',   'turnout',    stats.turnout);
  setKpi('d-fraud',     'fraud',      stats.fraudAlerts);
  sessionStorage.setItem('kpi_snap', JSON.stringify({registered:stats.totalRegistered,pending:stats.pending,approved:stats.approved,voted:stats.voted,turnout:stats.turnout,fraud:stats.fraudAlerts}));

  // Election state badge
  const stateEl = Utils.$('#d-election-state');
  if (stateEl) {
    stateEl.textContent = ElectionState.label(stats.electionState);
    stateEl.className   = `badge ${ElectionState.badgeClass(stats.electionState)}`;
  }

  // Recent activity
  const logs = StorageManager.getLogs().slice(0,8);
  const tbody = Utils.$('#d-recent-logs');
  if (tbody) tbody.innerHTML = logs.map(l=>`
    <tr>
      <td class="font-mono text-xs text-muted">${new Date(l.timestamp).toLocaleTimeString()}</td>
      <td><span class="badge badge-primary" style="font-size:.6rem">${l.action}</span></td>
      <td class="text-secondary text-sm">${l.details.substring(0,50)}${l.details.length>50?'…':''}</td>
    </tr>`).join('') || '<tr><td colspan="3" class="table-empty">No activity</td></tr>';

  // Animated mini tally
  const candidates = StorageManager.getCandidates();
  const totalVotes = candidates.reduce((s,c)=>s+(c.votes||0),0);
  const tally = Utils.$('#d-tally');
  if (tally) {
    tally.innerHTML = candidates.map(c=>{
      const pct = Utils.pct(c.votes||0,totalVotes||1);
      return `<div class="flex items-center gap-md mb-sm">
        <span style="width:24px;font-size:1rem">${c.symbol}</span>
        <div style="flex:1">
          <div class="flex justify-between mb-xs">
            <span class="text-sm text-secondary">${c.name}</span>
            <span class="font-mono text-sm" style="color:${c.color}">${c.votes||0}</span>
          </div>
          <div class="progress-bar-wrap slim"><div class="progress-bar-fill d-bar" style="width:0%;background:${c.color}" data-pct="${pct}"></div></div>
        </div>
        <span class="text-xs text-muted" style="width:32px;text-align:right">${pct}%</span>
      </div>`; }).join('');
    setTimeout(()=>Utils.$$('.d-bar').forEach(b=>{b.style.transition='width 1s ease';b.style.width=b.dataset.pct+'%';}),60);
  }
}

// ── Voters Tab ────────────────────────────────────────────────────────────────
function renderVotersTab() {
  const voters   = StorageManager.getVoters();
  const pending  = voters.filter(v=>v.status==='pending');
  const approved = voters.filter(v=>v.status==='approved');

  // Pending queue with bulk actions
  const pendingWrap = Utils.$('#pending-list');
  if (pendingWrap) {
    if (pending.length) {
      pendingWrap.innerHTML = `
        <div class="flex gap-sm mb-md flex-wrap">
          <button class="btn btn-ghost btn-sm" onclick="bulkSelectAll(true)">Select All</button>
          <button class="btn btn-ghost btn-sm" onclick="bulkSelectAll(false)">Deselect</button>
          <button class="btn btn-success btn-sm" onclick="bulkApprove()">&#10003; Approve Selected</button>
          <button class="btn btn-danger btn-sm"  onclick="bulkReject()">&#10005; Reject Selected</button>
        </div>
        ${pending.map(v=>`
        <div class="card card-sm flex items-center gap-md flex-wrap" style="border-color:rgba(255,157,0,.3);margin-bottom:.75rem">
          <input type="checkbox" class="bulk-cb" data-id="${v.id}" style="width:16px;height:16px;accent-color:var(--primary);flex-shrink:0">
          <div style="width:42px;height:42px;border-radius:50%;background:var(--warning-dim);border:1px solid var(--warning);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:700;color:var(--warning);flex-shrink:0">${v.name.charAt(0)}</div>
          <div style="flex:1;min-width:180px">
            <div class="fw-600">${v.name}</div>
            <div class="text-xs text-muted">${v.nationalId} · ${Utils.countryName(v.country)} · ${Utils.formatDate(v.registeredAt)}</div>
            ${v.idProof?`<div class="text-xs text-primary mt-xs" style="cursor:pointer" onclick="viewIdProof('${v.id}')">&#128250; View ID Proof</div>`:''}
          </div>
          <div class="flex gap-sm">
            <button class="btn btn-success btn-sm" onclick="doApprove('${v.id}')">&#10003; Approve</button>
            <button class="btn btn-danger btn-sm"  onclick="doReject('${v.id}')">&#10005; Reject</button>
          </div>
        </div>`).join('')}`;
    } else {
      pendingWrap.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#9989;</div><div class="empty-state-title">No Pending Approvals</div><div class="empty-state-text">All registrations reviewed.</div></div>';
    }
  }

  // All voters table
  const tbody = Utils.$('#voters-tbody');
  if (tbody) {
    tbody.innerHTML = voters.length ? voters.map(v=>`
      <tr>
        <td><span class="font-mono text-xs" style="color:var(--primary)">${v.voterId||'—'}</span></td>
        <td><div class="fw-600">${v.name}</div><div class="text-xs text-muted">${v.email||'—'}</div></td>
        <td>${Utils.countryName(v.country)}</td>
        <td class="font-mono text-xs">${v.nationalId}</td>
        <td><span class="badge ${v.status==='approved'?'badge-success':v.status==='pending'?'badge-warning':'badge-danger'}">${v.status==='approved'?'&#10003; Approved':v.status==='pending'?'&#9203; Pending':'&#10005; Rejected'}</span></td>
        <td>${v.hasVoted?'<span class="badge badge-success">Voted</span>':'<span class="badge badge-ghost">Not voted</span>'}</td>
        <td>
          <div class="flex gap-xs">
            ${v.status==='pending'?`<button class="btn btn-success btn-sm" onclick="doApprove('${v.id}')">&#10003;</button><button class="btn btn-danger btn-sm" onclick="doReject('${v.id}')">&#10005;</button>`:''}
            <button class="btn btn-ghost btn-sm" onclick="doDeleteVoter('${v.id}')">&#128465;</button>
          </div>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="7" class="table-empty">No voters registered</td></tr>';
  }
  Utils.$('#voter-count-label').textContent = `${voters.length} total — ${pending.length} pending — ${approved.length} approved`;
}
function bulkSelectAll(c) { Utils.$$('.bulk-cb').forEach(cb=>cb.checked=c); }
function bulkApprove() {
  const ids=[...(Utils.$$('.bulk-cb:checked'))].map(cb=>cb.dataset.id);
  if (!ids.length) { Notify.warning('Select voters first.'); return; }
  if (!confirm(`Approve ${ids.length} voter(s)?`)) return;
  ids.forEach(id=>StorageManager.approveVoter(id));
  Notify.success(`${ids.length} voter(s) approved!`); renderVotersTab(); renderDashboard();
}
function bulkReject() {
  const ids=[...(Utils.$$('.bulk-cb:checked'))].map(cb=>cb.dataset.id);
  if (!ids.length) { Notify.warning('Select voters first.'); return; }
  if (!confirm(`Reject ${ids.length} voter(s)?`)) return;
  ids.forEach(id=>StorageManager.rejectVoter(id));
  Notify.warning(`${ids.length} voter(s) rejected.`); renderVotersTab();
}

function doApprove(id) {
  const voterId = StorageManager.approveVoter(id);
  Notify.success(`Voter approved! Assigned ID: ${voterId}`);
  renderVotersTab();
  if (currentTab==='dashboard') renderDashboard();
}
function doReject(id) {
  if (!confirm('Reject this voter registration?')) return;
  StorageManager.rejectVoter(id);
  Notify.warning('Voter registration rejected.');
  renderVotersTab();
}
function doDeleteVoter(id) {
  if (!confirm('Permanently remove this voter?')) return;
  StorageManager.deleteVoter(id);
  Notify.info('Voter removed.');
  renderVotersTab();
}
function viewIdProof(id) {
  const v = StorageManager.findVoterById(id);
  if (!v?.idProof) return;
  const win = window.open();
  win.document.write(`<img src="${v.idProof}" style="max-width:100%;height:auto">`);
}

// ── Election Title Editor ──────────────────────────────────────────────────────
function saveElectionDetails() {
  const title = Utils.$('#elc-title-input')?.value?.trim();
  const desc  = Utils.$('#elc-desc-input')?.value?.trim();
  if (!title) { Notify.warning('Election title cannot be empty.'); return; }
  StorageManager.updateElection({ title, description: desc });
  StorageManager.addLog('ELECTION_UPDATED', `Title updated to: ${title}`, 'admin');
  Notify.success('Election details saved!');
  renderElectionTab();
  renderDashboard();
}

// ── Forgot Voter ID Lookup ─────────────────────────────────────────────────────
function lookupVoterByNationalId(nationalId) {
  if (!nationalId) return null;
  return StorageManager.findVoterByNationalId(nationalId.trim().toUpperCase());
}

// ── Candidates Tab ────────────────────────────────────────────────────────────
function renderCandidatesTab() {
  const list = Utils.$('#candidates-list');
  if (!list) return;
  const cands = StorageManager.getCandidates();
  list.innerHTML = cands.map(c=>`
    <div class="card card-sm flex items-center gap-md flex-wrap" style="border-color:${c.color}44">
      <span style="font-size:1.5rem;width:40px;text-align:center" aria-hidden="true">${c.symbol}</span>
      <div style="flex:1;min-width:160px">
        <div class="fw-600">${Utils.escapeHTML(c.name)}</div>
        <div class="text-xs text-muted">${Utils.escapeHTML(c.party)} · #${c.number} · ${c.votes||0} votes</div>
        <div class="text-xs text-secondary mt-xs">${Utils.escapeHTML((c.platform||'').substring(0,60))}${(c.platform||'').length>60?'&hellip;':''}</div>
      </div>
      <div style="width:16px;height:16px;border-radius:50%;background:${c.color};box-shadow:0 0 8px ${c.color};flex-shrink:0" aria-label="Party color"></div>
      <div class="flex gap-xs">
        <button class="btn btn-outline btn-sm" onclick="openEditCand('${c.id}')" aria-label="Edit ${Utils.escapeHTML(c.name)}">&#9999;&#65039; Edit</button>
        <button class="btn btn-danger btn-sm"  onclick="doDeleteCand('${c.id}')" aria-label="Delete ${Utils.escapeHTML(c.name)}">&#128465;</button>
      </div>
    </div>`).join('')
  || '<div class="empty-state"><div class="empty-state-title">No candidates</div></div>';
}

function setupCandidateModal() {
  Utils.$('#btn-add-candidate')?.addEventListener('click', ()=>openAddCand());
  Utils.$('#cand-form')?.addEventListener('submit', saveCandidateForm);
  Utils.$('#btn-close-cand-modal')?.addEventListener('click', closeCandModal);
  Utils.$('#cand-modal-backdrop')?.addEventListener('click', e=>{ if(e.target===Utils.$('#cand-modal-backdrop')) closeCandModal(); });
}
function openAddCand() {
  candModalMode='add'; editingCandId=null;
  const f=Utils.$('#cand-form'); if(f) f.reset();
  Utils.$('#cand-modal-title').textContent='Add Candidate';
  Utils.$('#cand-modal-backdrop').classList.add('open');
}
function openEditCand(id) {
  const c=StorageManager.getCandidates().find(x=>x.id===id); if(!c) return;
  candModalMode='edit'; editingCandId=id;
  Utils.$('#cand-name').value      = c.name;
  Utils.$('#cand-party').value     = c.party;
  Utils.$('#cand-partycode').value = c.partyCode||'';
  Utils.$('#cand-symbol').value    = c.symbol;
  Utils.$('#cand-color').value     = c.color;
  Utils.$('#cand-number').value    = c.number;
  Utils.$('#cand-platform').value  = c.platform||'';
  Utils.$('#cand-modal-title').textContent='Edit Candidate';
  Utils.$('#cand-modal-backdrop').classList.add('open');
}
function closeCandModal() { Utils.$('#cand-modal-backdrop').classList.remove('open'); }
function saveCandidateForm(e) {
  e.preventDefault();
  const data = {
    name:      Utils.$('#cand-name').value.trim(),
    party:     Utils.$('#cand-party').value.trim(),
    partyCode: Utils.$('#cand-partycode').value.trim(),
    symbol:    Utils.$('#cand-symbol').value.trim(),
    color:     Utils.$('#cand-color').value,
    number:    parseInt(Utils.$('#cand-number').value)||1,
    platform:  Utils.$('#cand-platform').value.trim(),
  };
  if (!data.name||!data.party) { Notify.warning('Name and party are required.'); return; }
  if (candModalMode==='add') { StorageManager.addCandidate(data); Notify.success('Candidate added.'); }
  else { StorageManager.updateCandidate(editingCandId, data); Notify.success('Candidate updated.'); }
  closeCandModal();
  renderCandidatesTab();
}
function doDeleteCand(id) {
  if(!confirm('Remove this candidate? Their votes will remain in the database.')) return;
  StorageManager.deleteCandidate(id);
  Notify.warning('Candidate removed.');
  renderCandidatesTab();
}

// ── Election Control Tab ──────────────────────────────────────────────────────
function renderElectionTab() {
  const election = StorageManager.getElection();
  const state    = election.state;

  // State indicator
  Utils.$$('.elc-state-node').forEach(node => {
    node.classList.remove('current','done');
    const ns = node.dataset.state;
    if (ns===state) node.classList.add('current');
    const order = [ElectionState.SETUP,ElectionState.REGISTRATION_OPEN,ElectionState.ELECTION_ACTIVE,ElectionState.ELECTION_ENDED];
    if (order.indexOf(ns) < order.indexOf(state)) node.classList.add('done');
  });

  // Info
  const el = (id,val) => { const e=Utils.$(`#${id}`); if(e) e.textContent=val; };
  el('elc-title',         election.title);
  el('elc-state-text',    ElectionState.label(state));
  el('elc-reg-opened',    election.registrationOpenedAt ? Utils.formatDate(election.registrationOpenedAt) : '—');
  el('elc-started',       election.electionStartedAt    ? Utils.formatDate(election.electionStartedAt)    : '—');
  el('elc-ended',         election.electionEndedAt      ? Utils.formatDate(election.electionEndedAt)      : '—');

  // Lifecycle buttons
  const btnWrap = Utils.$('#elc-btn-group');
  if (!btnWrap) return;
  let html = '';
  if (state===ElectionState.SETUP) {
    html = `<button class="btn btn-primary btn-lg" onclick="doElectionTransition('open_reg')">📋 Open Voter Registration</button>`;
  } else if (state===ElectionState.REGISTRATION_OPEN) {
    html = `
      <button class="btn btn-success btn-lg" onclick="doElectionTransition('start')">🗳️ Start Election</button>
      <button class="btn btn-ghost" onclick="doElectionTransition('close_reg')">Close Registration Only</button>`;
  } else if (state===ElectionState.ELECTION_ACTIVE) {
    html = `<button class="btn btn-danger btn-lg" onclick="doElectionTransition('end')">🏁 End Election</button>`;
  } else if (state===ElectionState.ELECTION_ENDED) {
    html = `<button class="btn btn-ghost" onclick="doElectionTransition('reset')">🔄 Reset & Start Over</button>`;
  }
  btnWrap.innerHTML = html;
}

function setupElectionControl() {
  // Delegate button clicks
}
function doElectionTransition(action) {
  const confirmMsgs = {
    open_reg:  'Open voter registration? Voters can now register.',
    start:     'Start the election? Registered voters can now vote.',
    close_reg: 'Close registration? No new voters can register.',
    end:       '⚠️ End the election? Voting will be permanently closed.',
    reset:     '⚠️ DANGER: Reset the entire election? All votes will be cleared!',
  };
  if (!confirm(confirmMsgs[action])) return;
  const stateMap = {
    open_reg:  ElectionState.REGISTRATION_OPEN,
    start:     ElectionState.ELECTION_ACTIVE,
    close_reg: ElectionState.REGISTRATION_OPEN, // stays, just no UI action needed
    end:       ElectionState.ELECTION_ENDED,
    reset:     ElectionState.SETUP,
  };
  if (action==='reset') {
    StorageManager.resetVotes();
    Notify.success('Election reset. Starting fresh.');
  } else {
    StorageManager.setElectionState(stateMap[action]);
    Notify.success(`Election state updated: ${ElectionState.label(stateMap[action])}`);
  }
  renderElectionTab();
  renderDashboard();
}

// ── Live Monitor Tab ──────────────────────────────────────────────────────────
function renderMonitorTab() {
  refreshMonitor();
}
function startMonitorPolling() {
  monitorTimer = setInterval(refreshMonitor, 3000);
}
function refreshMonitor() {
  const stats      = StorageManager.getStats();
  const candidates = StorageManager.getCandidates();
  const votes      = StorageManager.getVotes();
  const totalVotes = stats.totalVotes;

  Utils.$('#mon-votes').textContent   = totalVotes;
  Utils.$('#mon-turnout').textContent = stats.turnout + '%';
  Utils.$('#mon-pending').textContent = stats.pending;
  Utils.$('#mon-fraud').textContent   = stats.fraudAlerts;
  Utils.$('#mon-state-badge') && (Utils.$('#mon-state-badge').textContent = ElectionState.label(stats.electionState));

  // Per-candidate bars
  const bars = Utils.$('#mon-bars');
  if (bars) bars.innerHTML = candidates.map(c=>{
    const pct=Utils.pct(c.votes||0,totalVotes||1);
    return `<div class="flex items-center gap-md mb-md">
      <span style="width:28px;font-size:1.2rem">${c.symbol}</span>
      <div style="flex:1">
        <div class="flex justify-between mb-xs">
          <span class="text-sm text-secondary">${c.name}</span>
          <span class="font-mono text-sm fw-700" style="color:${c.color}">${c.votes||0}</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%;background:${c.color};transition:width 0.5s ease"></div></div>
      </div>
      <span class="font-mono text-xs text-muted" style="width:36px;text-align:right">${pct}%</span>
    </div>`; }).join('');

  // Recent votes feed
  const feed = Utils.$('#mon-vote-feed');
  if (feed) {
    const recent = votes.slice(-10).reverse();
    feed.innerHTML = recent.length
      ? recent.map(v=>{
          const c=candidates.find(x=>x.id===v.candidateId);
          return `<div class="flex items-center gap-md py-sm" style="border-bottom:1px solid var(--border-subtle)">
            <span>${c?.symbol||'🗳️'}</span>
            <div style="flex:1">
              <span class="text-sm text-secondary">Voter </span>
              <span class="font-mono text-xs text-primary">${v.voterId}</span>
              <span class="text-sm text-secondary"> → </span>
              <span class="text-sm fw-600" style="color:${c?.color||'#fff'}">${c?.name||'—'}</span>
            </div>
            <span class="font-mono text-xs text-muted">${new Date(v.timestamp).toLocaleTimeString()}</span>
          </div>`;}).join('')
      : '<div class="empty-state"><div class="empty-state-title">No votes cast yet</div></div>';
  }
}

// ── Fraud Tab ─────────────────────────────────────────────────────────────────
function renderFraudTab() {
  const alerts = StorageManager.getFraudAlerts();
  const tbody  = Utils.$('#fraud-tbody');
  if (!tbody) return;
  tbody.innerHTML = alerts.length
    ? alerts.map(a=>`<tr>
        <td class="font-mono text-xs text-muted">${Utils.formatDate(a.timestamp)}</td>
        <td><span class="badge ${Utils.severityBadge(a.severity)}" style="font-size:.65rem">${(a.severity||'').toUpperCase()}</span></td>
        <td><span class="text-sm fw-600">${a.label||a.type}</span></td>
        <td class="text-secondary text-sm">${a.details}</td>
        <td class="font-mono text-xs text-muted">${a.voterId||'—'}</td>
        <td class="font-mono text-xs text-muted">${a.ip}</td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="table-empty">No fraud alerts</td></tr>';
  Utils.$('#fraud-count')?.textContent && (Utils.$('#fraud-count').textContent = `${alerts.length} alert${alerts.length!==1?'s':''}`);
}

// ── Results Tab (Admin) ───────────────────────────────────────────────────────
function renderResultsTab() {
  const candidates = StorageManager.getCandidates();
  const stats      = StorageManager.getStats();
  const total      = stats.totalVotes;

  Utils.$('#res-total-votes')?.textContent && (Utils.$('#res-total-votes').textContent = total);
  Utils.$('#res-turnout')?.textContent     && (Utils.$('#res-turnout').textContent     = stats.turnout+'%');

  const list = Utils.$('#admin-results-list');
  if (!list) return;
  const sorted=[...candidates].sort((a,b)=>(b.votes||0)-(a.votes||0));
  list.innerHTML=sorted.map((c,i)=>{
    const pct=Utils.pct(c.votes||0,total||1);
    return `<div class="card card-sm flex items-center gap-md" style="border-color:${i===0&&(c.votes||0)>0?c.color:'var(--border-subtle)'}">
      <span style="font-size:1.5rem;width:36px;text-align:center">${c.symbol}</span>
      <div style="flex:1">
        <div class="flex justify-between mb-xs">
          <span class="fw-600">${c.name} <span class="text-xs text-muted">${c.party}</span></span>
          <span class="font-heading fw-700" style="color:${c.color}">${c.votes||0} votes (${pct}%)</span>
        </div>
        <div class="progress-bar-wrap slim"><div class="progress-bar-fill" style="width:${pct}%;background:${c.color}"></div></div>
      </div>
      <span class="badge ${i===0?'badge-accent':i===1?'badge-primary':'badge-ghost'}">#${i+1}</span>
    </div>`; }).join('');
}

// ── Logout ────────────────────────────────────────────────────────────────────
function setupLogout() {
  Utils.$('#btn-logout')?.addEventListener('click', ()=>{
    SessionManager.clearAdmin();
    StorageManager.addLog('ADMIN_LOGOUT','Administrator logged out','admin');
    window.location.reload();
  });
}

// ── Search Voters ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', ()=>{
  Utils.$('#voter-search')?.addEventListener('input', e=>{
    const q=e.target.value.toLowerCase();
    Utils.$$('#voters-tbody tr').forEach(row=>{
      row.style.display=row.textContent.toLowerCase().includes(q)?'':'none';
    });
  });
  Utils.$('#fraud-filter')?.addEventListener('change', e=>{
    const sev=e.target.value;
    Utils.$$('#fraud-tbody tr').forEach(row=>{
      row.style.display=(!sev||row.textContent.toLowerCase().includes(sev))?'':'none';
    });
  });
});
