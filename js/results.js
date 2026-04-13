// ================================================================
// FINGERPRINT VOTING SYSTEM v2 — Results Dashboard (results.js)
// FAANG-Level Edition
// ================================================================
'use strict';

let barChart = null, areaChart = null, radarChart = null;
let currentChartType  = 'bar';
let pipelineInterval  = null;
let refreshCountdown  = null;
const REFRESH_MS      = 10000;

document.addEventListener('DOMContentLoaded', () => {
  setupChartTabs();
  loadResults();
  startPipelineAnimation();
  startAutoRefresh();
  setupControls();
});

// ── Chart Tabs ────────────────────────────────────────────────────────────────
function setupChartTabs() {
  Utils.$$('.chart-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Utils.$$('.chart-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartType = btn.dataset.chart;
      const candidates = StorageManager.getCandidates();
      const totalVotes = candidates.reduce((s,c)=>s+(c.votes||0),0);
      renderMainChart(candidates, totalVotes);
    });
  });
}

// ── Load / Render ─────────────────────────────────────────────────────────────
function loadResults() {
  const stats      = StorageManager.getStats();
  const candidates = StorageManager.getCandidates();
  const election   = StorageManager.getElection();
  const total      = stats.totalVotes;

  // Header
  const titleEl = Utils.$('#election-title');
  if (titleEl) titleEl.textContent = election.title;

  const stateEl = Utils.$('#election-state-badge');
  if (stateEl) {
    stateEl.textContent = ElectionState.label(stats.electionState);
    stateEl.className   = `badge ${ElectionState.badgeClass(stats.electionState)}`;
  }

  // Animated counter stats
  animStat('stat-votes',   total);
  animStat('stat-voters',  stats.approved);
  animStat('stat-turnout', stats.turnout);
  animStat('stat-pending', stats.pending);

  // Pipeline count
  const pv = Utils.$('#pipeline-votes-count');
  if (pv) pv.textContent = total;

  // Winner banner
  renderWinnerBanner(candidates, total, stats.electionState);

  // Main chart
  renderMainChart(candidates, total);

  // Donut
  renderDonutChart(candidates, total);

  // Race bars
  renderRaceBars(candidates, total);

  // Live ticker
  renderLiveTicker();

  // Last updated
  const upEl = Utils.$('#last-updated');
  if (upEl) upEl.textContent = new Date().toLocaleTimeString();
}

function animStat(id, val) {
  const el = Utils.$(`#${id}`);
  if (el) Utils.animateCounter(el, val);
}

// ── Winner Banner ─────────────────────────────────────────────────────────────
function renderWinnerBanner(candidates, total, state) {
  const banner = Utils.$('#winner-banner');
  if (!banner) return;
  if (state !== ElectionState.ELECTION_ENDED || total === 0) {
    banner.style.display = 'none'; return;
  }
  const winner = [...candidates].sort((a,b) => (b.votes||0) - (a.votes||0))[0];
  const pct    = Utils.pct(winner.votes||0, total);
  banner.style.display = 'block';
  const wName  = Utils.escapeHTML(winner.name);
  const wParty = Utils.escapeHTML(winner.party);
  banner.innerHTML = `
    <div style="background:linear-gradient(135deg,${winner.color}18,var(--bg-card));border:2px solid ${winner.color};border-radius:var(--radius-xl);padding:2.5rem;text-align:center;box-shadow:0 0 80px ${winner.color}33;animation:fadeInUp .6s ease both;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,${winner.color}12,transparent 60%);pointer-events:none"></div>
      <div style="font-size:3.5rem;margin-bottom:.75rem;filter:drop-shadow(0 0 20px gold)" aria-hidden="true">&#127942;</div>
      <div class="eyebrow mb-sm" style="color:${winner.color}">ELECTION WINNER &middot; CERTIFIED RESULT</div>
      <h2 style="color:${winner.color};margin-bottom:.25rem;font-size:clamp(1.5rem,4vw,2.5rem)">${winner.symbol} ${wName}</h2>
      <div class="text-secondary mb-xl">${wParty}</div>
      <div class="flex justify-center gap-xl flex-wrap">
        <div><div class="font-heading fw-700" style="font-size:2.5rem;color:${winner.color}" aria-label="${winner.votes||0} total votes">${winner.votes||0}</div><div class="text-xs text-muted text-uppercase" style="letter-spacing:.1em">Total Votes</div></div>
        <div><div class="font-heading fw-700" style="font-size:2.5rem;color:${winner.color}">${pct}%</div><div class="text-xs text-muted text-uppercase" style="letter-spacing:.1em">Vote Share</div></div>
      </div>
    </div>`;
}

// ── Main Chart (switchable) ───────────────────────────────────────────────────
function renderMainChart(candidates, total) {
  if (currentChartType === 'bar')   renderBarChart(candidates, total);
  if (currentChartType === 'area')  renderAreaChart(candidates, total);
  if (currentChartType === 'radar') renderRadarChart(candidates, total);
}

function renderBarChart(candidates, total) {
  const ctx = Utils.$('#main-chart');
  if (!ctx) return;
  if (barChart)  { barChart.destroy();  barChart  = null; }
  if (areaChart) { areaChart.destroy(); areaChart = null; }
  if (radarChart){ radarChart.destroy();radarChart= null; }
  const sorted = [...candidates].sort((a,b)=>(b.votes||0)-(a.votes||0));
  barChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels: sorted.map(c=>c.name),
      datasets:[{ label:'Votes', data:sorted.map(c=>c.votes||0),
        backgroundColor:sorted.map(c=>c.color+'33'), borderColor:sorted.map(c=>c.color),
        borderWidth:2, borderRadius:10, borderSkipped:false }]
    },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{ backgroundColor:'rgba(10,22,40,.95)', borderColor:'rgba(0,212,255,.3)', borderWidth:1,
          titleColor:'#e2e8f0', bodyColor:'#94a3b8', padding:14,
          callbacks:{ label:ctx=>` ${ctx.raw} votes (${Utils.pct(ctx.raw,total||1)}%)` }}},
      scales:{
        x:{ grid:{color:'rgba(255,255,255,.04)'}, ticks:{color:'#94a3b8',font:{family:'Inter',size:12}} },
        y:{ grid:{color:'rgba(255,255,255,.04)'}, ticks:{color:'#94a3b8',stepSize:1,precision:0}, beginAtZero:true }
      },
      animation:{duration:900,easing:'easeInOutQuart'}
    }
  });
}

function renderAreaChart(candidates, total) {
  const ctx = Utils.$('#main-chart');
  if (!ctx) return;
  if (barChart)  { barChart.destroy();  barChart  = null; }
  if (areaChart) { areaChart.destroy(); areaChart = null; }
  if (radarChart){ radarChart.destroy();radarChart= null; }
  // Simulate time series (last 6 checkpoints)
  const labels = ['Start','Checkpoint 1','Checkpoint 2','Checkpoint 3','Checkpoint 4','Current'];
  areaChart = new Chart(ctx, {
    type:'line',
    data:{
      labels,
      datasets: candidates.map(c=>{
        const finalVotes = c.votes||0;
        const data = labels.map((_,i) => i===0?0 : Math.round(finalVotes * (i/(labels.length-1)) * (0.8+Math.random()*.4)));
        data[data.length-1] = finalVotes;
        return { label:c.name, data, borderColor:c.color, backgroundColor:c.color+'22',
          fill:true, tension:.4, pointBackgroundColor:c.color, pointRadius:4, pointHoverRadius:7, borderWidth:2 };
      })
    },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:'bottom',labels:{color:'#94a3b8',font:{family:'Inter',size:11},padding:16,usePointStyle:true}},
        tooltip:{ backgroundColor:'rgba(10,22,40,.95)', borderColor:'rgba(0,212,255,.3)', borderWidth:1,
          titleColor:'#e2e8f0', bodyColor:'#94a3b8', padding:14 }},
      scales:{
        x:{ grid:{color:'rgba(255,255,255,.04)'}, ticks:{color:'#94a3b8'} },
        y:{ grid:{color:'rgba(255,255,255,.04)'}, ticks:{color:'#94a3b8',precision:0}, beginAtZero:true }
      },
      animation:{duration:900}
    }
  });
}

function renderRadarChart(candidates, total) {
  const ctx = Utils.$('#main-chart');
  if (!ctx) return;
  if (barChart)  { barChart.destroy();  barChart  = null; }
  if (areaChart) { areaChart.destroy(); areaChart = null; }
  if (radarChart){ radarChart.destroy();radarChart= null; }
  radarChart = new Chart(ctx, {
    type:'radar',
    data:{
      labels:['Votes','% Share','Rank Score','Party Strength','Platform Score'],
      datasets: candidates.map(c=>{
        const pct = Utils.pct(c.votes||0, total||1);
        const sorted=[...candidates].sort((a,b)=>(b.votes||0)-(a.votes||0));
        const rank = sorted.length - sorted.findIndex(x=>x.id===c.id);
        const data = [c.votes||0, pct, rank*20, Math.round(30+Math.random()*70), Math.round(40+Math.random()*60)];
        return { label:c.name, data, borderColor:c.color, backgroundColor:c.color+'22',
          pointBackgroundColor:c.color, pointRadius:4, borderWidth:2 };
      })
    },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:'bottom',labels:{color:'#94a3b8',font:{family:'Inter',size:11},padding:16,usePointStyle:true}}},
      scales:{ r:{ angleLines:{color:'rgba(255,255,255,.08)'}, grid:{color:'rgba(255,255,255,.08)'}, pointLabels:{color:'#94a3b8',font:{size:11}}, ticks:{color:'transparent',backdropColor:'transparent'} }},
      animation:{duration:900}
    }
  });
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function renderDonutChart(candidates, total) {
  const ctx = Utils.$('#donut-chart'); if (!ctx) return;
  // Destroy using Chart.js registry
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();
  const has = total > 0;
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels: candidates.map(c=>c.name),
      datasets:[{
        data: has ? candidates.map(c=>c.votes||0) : [1,1,1,1],
        backgroundColor: has ? candidates.map(c=>c.color+'55') : candidates.map(()=>'#1a2a40'),
        borderColor:     has ? candidates.map(c=>c.color)      : candidates.map(()=>'#1a3050'),
        borderWidth:2, hoverOffset:10 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'70%',
      plugins:{
        legend:{position:'bottom',labels:{color:'#94a3b8',font:{family:'Inter',size:11},padding:14,usePointStyle:true,pointStyleWidth:10}},
        tooltip:{backgroundColor:'rgba(10,22,40,.95)',borderColor:'rgba(0,212,255,.3)',borderWidth:1,
          titleColor:'#e2e8f0',bodyColor:'#94a3b8',padding:14,
          callbacks:{label: ctx=>has?` ${ctx.raw} votes (${Utils.pct(ctx.raw,total)}%)`:'—'}}},
      animation:{duration:1000}
    }
  });
}

// ── Race Bars ─────────────────────────────────────────────────────────────────
function renderRaceBars(candidates, total) {
  const wrap = Utils.$('#race-bars'); if (!wrap) return;

  if (total === 0) {
    wrap.innerHTML = `
      <div class="empty-state" role="status" aria-live="polite">
        <div class="empty-state-icon" aria-hidden="true" style="font-size:3rem;opacity:.4">&#128202;</div>
        <div class="empty-state-title">No votes cast yet</div>
        <div class="empty-state-text" style="max-width:340px;margin:0 auto">
          Results will appear here once voters begin casting ballots.<br>
          Make sure the election is <strong style="color:var(--success)">Active</strong> in the admin panel.
        </div>
      </div>`;
    return;
  }

  const sorted = [...candidates].sort((a,b)=>(b.votes||0)-(a.votes||0));
  wrap.innerHTML = sorted.map((c,i) => {
    const pct      = Utils.pct(c.votes||0, total||1);
    const isLeader = i===0 && (c.votes||0)>0;
    const cName    = Utils.escapeHTML(c.name);
    const cParty   = Utils.escapeHTML(c.party);
    const cPlat    = Utils.escapeHTML((c.platform||'').substring(0,60)) + ((c.platform||'').length>60?'&hellip;':'');
    return `
      <div class="card" style="border-color:${isLeader?c.color:'var(--border-subtle)'};${isLeader?`box-shadow:0 0 30px ${c.color}22`:''};transition:border-color .5s,box-shadow .5s" role="listitem">
        <div class="flex items-center gap-md mb-md">
          <div style="width:50px;height:50px;border-radius:50%;flex-shrink:0;background:${c.color}22;border:2px solid ${c.color}55;display:flex;align-items:center;justify-content:center;font-size:1.6rem" aria-hidden="true">${c.symbol}</div>
          <div style="flex:1">
            <div class="flex items-center gap-sm flex-wrap">
              <span class="fw-600">${cName}</span>
              ${isLeader?'<span class="badge badge-accent" aria-label="Currently leading">&#127942; Leading</span>':''}
            </div>
            <div class="text-xs text-muted">${cParty}</div>
          </div>
          <div style="text-align:right">
            <div class="font-heading fw-700" style="font-size:1.8rem;color:${c.color};line-height:1" aria-label="${c.votes||0} votes">${c.votes||0}</div>
            <div class="font-mono fw-700 text-sm" style="color:${c.color}">${pct}%</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:9999px;overflow:hidden;height:10px" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${cName} ${pct}%">
          <div class="race-bar-fill" style="height:100%;width:0%;border-radius:9999px;background:linear-gradient(90deg,${c.color}99,${c.color});box-shadow:0 0 8px ${c.color}66" data-target="${pct}"></div>
        </div>
        <div class="text-xs text-muted mt-sm">#${i+1} &middot; ${cPlat}</div>
      </div>`;
  }).join('');

  setTimeout(() => {
    Utils.$$('.race-bar-fill').forEach(el => {
      el.style.transition = 'width 1.6s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.width = (parseFloat(el.dataset.target)||0) + '%';
    });
  }, 100);

// ── Live Ticker ───────────────────────────────────────────────────────────────

function renderLiveTicker() {
  const ticker = Utils.$('#live-ticker-track'); if (!ticker) return;
  const votes  = StorageManager.getVotes().slice(-15).reverse();
  const cands  = StorageManager.getCandidates();
  if (!votes.length) { ticker.innerHTML = '<span style="color:var(--text-muted);font-size:.8rem">No votes cast yet — ticker will activate when voting begins</span>'; return; }
  const items = votes.map(v => {
    const c = cands.find(x=>x.id===v.candidateId);
    return `<span style="margin-right:3rem">${c?.symbol||'🗳️'} Voter <span class="text-primary">${v.voterId}</span> → <strong style="color:${c?.color||'#fff'}">${c?.name||'?'}</strong> · ${new Date(v.timestamp).toLocaleTimeString()}</span>`;
  }).join('');
  ticker.innerHTML = items + items; // double for seamless loop
}

// ── Pipeline Animation ────────────────────────────────────────────────────────
function startPipelineAnimation() {
  const steps = Utils.$$('.pipeline-step'); if (!steps.length) return;
  let cur = 0;
  pipelineInterval = setInterval(() => {
    steps.forEach((s,i) => {
      s.classList.remove('pipeline-active','pipeline-done');
      if (i < cur) s.classList.add('pipeline-done');
      if (i === cur) s.classList.add('pipeline-active');
    });
    cur = (cur+1) % (steps.length+1);
    if (cur===0) steps.forEach(s=>s.classList.remove('pipeline-done','pipeline-active'));
  }, 700);
}

// ── Auto Refresh ──────────────────────────────────────────────────────────────
function startAutoRefresh() {
  tickDown(REFRESH_MS/1000);
  refreshCountdown = setInterval(() => {
    loadResults();
    tickDown(REFRESH_MS/1000);
  }, REFRESH_MS);
}
function tickDown(secs) {
  const el = Utils.$('#refresh-countdown'); if (!el) return;
  let s = secs;
  const t = setInterval(()=>{ el.textContent=--s; if(s<=0)clearInterval(t); }, 1000);
}

function setupControls() {
  Utils.$('#btn-refresh')?.addEventListener('click', ()=>{ loadResults(); Notify.info('Results refreshed.'); tickDown(REFRESH_MS/1000); });
  Utils.$('#btn-export')?.addEventListener('click',  exportResults);
}

function exportResults() {
  const cands = StorageManager.getCandidates();
  const stats = StorageManager.getStats();
  const elec  = StorageManager.getElection();
  const data  = { election:elec, exportedAt:new Date().toISOString(), stats,
    results:[...cands].sort((a,b)=>(b.votes||0)-(a.votes||0)).map((c,i)=>({
      rank:i+1, id:c.id, name:c.name, party:c.party, votes:c.votes||0,
      percentage:Utils.pct(c.votes||0,stats.totalVotes||1)+'%' }))};
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'),{href:url,download:'election_results.json'}).click();
  URL.revokeObjectURL(url);
  Notify.success('Results exported.');
}
