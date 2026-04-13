// ================================================================
// FINGERPRINT VOTING SYSTEM v2 — Voting Booth (vote.js)
// ================================================================
'use strict';

let scanner          = null;
let resolvedVoter    = null;
let selectedCandId   = null;
let sessionTimer     = null;
let scanFailCount    = 0;

document.addEventListener('DOMContentLoaded', () => {
  checkElectionState();
  showStage('identity');
  setupIdentityForm();
  initScanner();
  loadCandidates();
  setupConfirmModal();
  startSessionTimer();
});

// ── Election State Guard ──────────────────────────────────────────────────────
function checkElectionState() {
  const state = StorageManager.getElectionState();
  const banner = Utils.$('#state-banner');
  if (!banner) return;

  if (state !== ElectionState.ELECTION_ACTIVE) {
    const msgs = {
      setup:             '⚙️ Election has not started yet. Please wait.',
      registration_open: '📋 Registration is open but voting has not started yet.',
      election_ended:    '🏁 This election has ended. Voting is closed.',
    };
    banner.textContent = msgs[state] || 'Voting unavailable.';
    banner.style.display = 'block';
    // Disable scan button
    setTimeout(() => {
      Utils.$('#btn-verify-identity') && (Utils.$('#btn-verify-identity').disabled = true);
    }, 100);
  }
}

// ── Stage Management ──────────────────────────────────────────────────────────
function showStage(name) {
  ['identity','scan','vote','success'].forEach(s => {
    const el = Utils.$(`#stage-${s}`);
    if (el) el.style.display = s === name ? 'block' : 'none';
  });
  // Flow indicator (here to avoid HTML monkey-patch race condition — Bug 2 fix)
  const order = ['identity','scan','vote','success'];
  const cur   = order.indexOf(name);
  order.forEach((s,i) => {
    const fl = document.getElementById(`flow-${s}`);
    if (!fl) return;
    fl.classList.remove('active','done');
    if (i === cur) fl.classList.add('active');
    if (i < cur)  fl.classList.add('done');
  });
  // Avatar initial letter
  const av = document.getElementById('voter-av-initial');
  const nm = document.getElementById('vbar-name')?.textContent;
  if (av && nm && nm !== '—') av.textContent = nm.charAt(0).toUpperCase();
}

// ── Stage 1: Identity Entry ───────────────────────────────────────────────────
function setupIdentityForm() {
  const countryEl = Utils.$('#v-country');
  if (countryEl) Utils.buildCountrySelect(countryEl);

  Utils.$('#btn-verify-identity')?.addEventListener('click', verifyIdentity);
  Utils.$('#v-voter-id')?.addEventListener('keydown', e => { if (e.key==='Enter') verifyIdentity(); });
}

function verifyIdentity() {
  const state = StorageManager.getElectionState();
  if (state !== ElectionState.ELECTION_ACTIVE) {
    Notify.error('Voting is not currently active.');
    StorageManager.addFraudAlert('ELECTION_NOT_ACTIVE', `Voting attempt while state=${state}`);
    return;
  }

  const country = Utils.$('#v-country')?.value || '';
  const voterId = Utils.$('#v-voter-id')?.value.trim().toUpperCase() || '';

  if (!country) { Notify.warning('Please select your country.'); return; }
  if (!voterId)  { Notify.warning('Please enter your Voter ID.'); return; }

  const voter = StorageManager.findVoterByVoterId(voterId);

  // Voter ID not found
  if (!voter) {
    Notify.error('Voter ID not found in the registry.');
    StorageManager.addFraudAlert('INVALID_VOTER_ID', `Invalid Voter ID entered: ${voterId}`);
    Utils.$('#identity-error').style.display = 'block';
    Utils.$('#identity-error').textContent   = '✕ Voter ID not found in registry.';
    return;
  }

  // Country mismatch
  if (voter.country !== country) {
    Notify.error('Country does not match the registered country for this Voter ID.');
    StorageManager.addFraudAlert('INVALID_VOTER_ID', `Country mismatch for Voter ID: ${voterId}`);
    Utils.$('#identity-error').style.display = 'block';
    Utils.$('#identity-error').textContent   = '✕ Country does not match registration record.';
    return;
  }

  // Not approved
  if (voter.status !== 'approved') {
    const statusMsgs = {
      pending:  'Your registration is pending admin approval. Please wait.',
      rejected: 'Your registration was rejected. Contact the election authority.',
    };
    Notify.error(statusMsgs[voter.status] || 'Registration not approved.');
    StorageManager.addFraudAlert('VOTER_NOT_APPROVED', `Voter ${voterId} status: ${voter.status}`);
    Utils.$('#identity-error').style.display = 'block';
    Utils.$('#identity-error').textContent   = `✕ ${statusMsgs[voter.status]}`;
    return;
  }

  // Already voted
  if (voter.hasVoted) {
    Notify.error('This voter has already cast their ballot. Double voting is not permitted.');
    StorageManager.addFraudAlert('ALREADY_VOTED', `Double-vote attempt by Voter ID: ${voterId}`, voter.id);
    Utils.$('#identity-error').style.display = 'block';
    Utils.$('#identity-error').textContent   = '✕ This voter has already voted.';
    return;
  }

  // All good — proceed to scan
  resolvedVoter = voter;
  Utils.$('#identity-error').style.display = 'none';
  Notify.info(`Identity located: ${voter.name}. Please scan your fingerprint.`);

  // Populate scan info
  Utils.$('#scan-voter-name')?.textContent && (Utils.$('#scan-voter-name').textContent = voter.name);
  Utils.$('#scan-voter-id')?.textContent   && (Utils.$('#scan-voter-id').textContent   = voter.voterId);
  Utils.$('#scan-voter-country')?.textContent && (Utils.$('#scan-voter-country').textContent = Utils.countryName(voter.country));

  showStage('scan');
  scanner.reset();
}

// ── Stage 2: Fingerprint Scan ─────────────────────────────────────────────────
function initScanner() {
  scanner = new FingerprintScanner('vote-scan-canvas', { autoGenSeed: true });

  scanner.onSuccess(async (token) => {
    scanFailCount = 0;
    startConfidenceScore(); // animate confidence
    await new Promise(r => setTimeout(r, 1800));
    // Re-validate
    const fresh = StorageManager.findVoterById(resolvedVoter.id);
    if (fresh?.hasVoted) {
      Notify.error('Voter has already cast a ballot. Fraud alert logged.');
      StorageManager.addFraudAlert('ALREADY_VOTED', `Double vote after scan: ${resolvedVoter.voterId}`, resolvedVoter.id);
      scanner.reset();
      showStage('identity');
      return;
    }
    showStage('vote');
    showVoterBar();
  });

  scanner.onFailure(() => {
    scanFailCount++;
    Notify.error(`Fingerprint not recognized. Attempt ${scanFailCount}/3`);
    if (scanFailCount >= 3) {
      StorageManager.addFraudAlert('SCAN_FAILED', `3+ failed scans for Voter ID: ${resolvedVoter?.voterId}`, resolvedVoter?.id);
      Notify.error('Too many failed attempts. Session locked. Please contact an official.', 8000);
      clearInterval(sessionTimer);
      setTimeout(() => { window.location.href = 'index.html'; }, 4000);
    }
  });
}

// ── Biometric Confidence Score ────────────────────────────────────────────────
function startConfidenceScore() {
  const wrap  = Utils.$('#confidence-wrap');
  const fill  = Utils.$('#confidence-fill');
  const value = Utils.$('#confidence-value');
  const label = Utils.$('#confidence-label');
  if (!wrap) return;
  wrap.style.display = 'block';
  let score = 0, target = 88 + Math.floor(Math.random()*11);
  const t = setInterval(() => {
    score += Math.random()*12;
    if (score >= target) { score = target; clearInterval(t); if(label) { label.textContent = 'VERIFIED ✓'; label.style.color='var(--success)'; } }
    if (fill)  fill.style.width  = score + '%';
    if (fill)  fill.style.background = score > 80 ? 'linear-gradient(90deg,var(--success),#00aa55)' : score > 50 ? 'linear-gradient(90deg,var(--warning),#ff7700)' : 'linear-gradient(90deg,var(--danger),#cc0033)';
    if (value) value.textContent = Math.round(score) + '%';
  }, 80);
}

// ── Stage 3: Vote ─────────────────────────────────────────────────────────────
function showVoterBar() {
  const bar = Utils.$('#vote-voter-bar');
  if (bar && resolvedVoter) {
    Utils.$('#vbar-name').textContent    = resolvedVoter.name;
    Utils.$('#vbar-id').textContent      = resolvedVoter.voterId;
    Utils.$('#vbar-country').textContent = Utils.countryName(resolvedVoter.country);
    bar.style.display = 'flex';
  }
}

function loadCandidates() {
  const grid = Utils.$('#candidates-grid');
  if (!grid) return;
  const candidates = StorageManager.getCandidates();
  grid.innerHTML = candidates.map(c => `
    <div class="candidate-card" id="cand-${c.id}" onclick="selectCandidate('${c.id}')">
      <div class="candidate-check">✓</div>
      <div class="candidate-avatar" style="background:${c.color}22;border:2px solid ${c.color}44">
        <span style="font-size:2rem">${c.symbol}</span>
      </div>
      <div class="candidate-name">${c.name}</div>
      <div class="candidate-party" style="color:${c.color}">${c.party}</div>
      <div class="badge mt-sm" style="background:${c.color}18;color:${c.color};border:1px solid ${c.color}44">#{${c.number}}</div>
      <div class="candidate-platform mt-sm">${c.platform}</div>
    </div>`
  ).join('').replace(/#{(\d+)}/g, (_, n) => `#${n}`);
}

function selectCandidate(id) {
  selectedCandId = id;
  Utils.$$('.candidate-card').forEach(el => el.classList.toggle('selected', el.id === `cand-${id}`));
  const c = StorageManager.getCandidates().find(c => c.id === id);
  const btn = Utils.$('#btn-cast-vote');
  if (btn) { btn.disabled = false; if(c) btn.style.boxShadow = `0 0 30px ${c.color}66`; }
  if (c) Notify.info(`Selected: ${c.name} — ${c.party}`);
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function setupConfirmModal() {
  Utils.$('#btn-cast-vote')?.addEventListener('click', () => {
    if (!selectedCandId) { Notify.warning('Select a candidate first.'); return; }
    openConfirmModal();
  });
  Utils.$('#btn-confirm-vote')?.addEventListener('click', castVote);
  Utils.$('#btn-cancel-vote')?.addEventListener('click',  () => Utils.$('#confirm-modal').classList.remove('open'));
}

function openConfirmModal() {
  const c = StorageManager.getCandidates().find(c => c.id === selectedCandId);
  if (!c) return;
  Utils.$('#cfm-sym').textContent    = c.symbol;
  Utils.$('#cfm-name').textContent   = c.name;
  Utils.$('#cfm-party').textContent  = c.party;
  Utils.$('#cfm-voter').textContent  = resolvedVoter?.name || '—';
  Utils.$('#confirm-modal').classList.add('open');
}

async function castVote() {
  const btn = Utils.$('#btn-confirm-vote');
  btn.classList.add('loading'); btn.disabled = true;

  // Ballot animation
  showBallotAnimation();
  await new Promise(r => setTimeout(r, 1600));

  // Final guards
  const fresh = StorageManager.findVoterById(resolvedVoter.id);
  if (fresh?.hasVoted) {
    Notify.error('Vote already recorded.');
    StorageManager.addFraudAlert('ALREADY_VOTED', `Race condition double-vote: ${resolvedVoter.voterId}`, resolvedVoter.id);
    Utils.$('#confirm-modal').classList.remove('open');
    btn.classList.remove('loading'); btn.disabled = false;
    return;
  }
  if (StorageManager.getElectionState() !== ElectionState.ELECTION_ACTIVE) {
    Notify.error('Election is no longer active.');
    Utils.$('#confirm-modal').classList.remove('open');
    btn.classList.remove('loading'); btn.disabled = false;
    return;
  }

  // Record
  StorageManager.incrementVote(selectedCandId);
  StorageManager.updateVoter(resolvedVoter.id, { hasVoted: true, votedAt: new Date().toISOString(), votedFor: selectedCandId });
  const voteRecord = StorageManager.recordVote(resolvedVoter.voterId, selectedCandId);
  StorageManager.addLog('VOTE_CAST', `Vote cast for ${selectedCandId}`, resolvedVoter.id);

  Utils.$('#confirm-modal').classList.remove('open');
  clearInterval(sessionTimer);

  const c = StorageManager.getCandidates().find(c => c.id === selectedCandId);
  Utils.$('#suc-voter-name').textContent    = resolvedVoter.name;
  Utils.$('#suc-voter-name-r').textContent  = resolvedVoter.name;  // Bug 3 fix: populate receipt name directly
  Utils.$('#suc-cand-name').textContent     = c?.name  || '—';
  Utils.$('#suc-cand-party').textContent    = c?.party || '—';
  Utils.$('#suc-cand-sym').textContent      = c?.symbol|| '';
  Utils.$('#suc-timestamp').textContent     = Utils.formatDate(new Date().toISOString());
  Utils.$('#suc-receipt').textContent       = voteRecord.receipt;
  Utils.$('#suc-voter-id').textContent      = resolvedVoter.voterId;

  showStage('success');

  // 🎉 Confetti
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount:180, spread:80, origin:{y:.55}, colors:['#00d4ff','#7b2fff','#00ff88','#ffd700','#ffffff'] });
    setTimeout(()=>confetti({ particleCount:80, angle:60, spread:55, origin:{x:0,y:.6}, colors:['#00d4ff','#7b2fff'] }), 400);
    setTimeout(()=>confetti({ particleCount:80, angle:120, spread:55, origin:{x:1,y:.6}, colors:['#00ff88','#ffd700'] }), 700);
  }
  Notify.success('✅ Your vote has been securely recorded!', 6000);
}

// ── Ballot Animation ──────────────────────────────────────────────────────────
function showBallotAnimation() {
  const anim = document.createElement('div');
  anim.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center';
  anim.innerHTML = '<div style="font-size:4rem;animation:ballotFly 1.5s cubic-bezier(.34,1.56,.64,1) forwards">🗳️</div>';
  if (!document.getElementById('ballot-anim-style')) {
    const style = document.createElement('style');
    style.id = 'ballot-anim-style';
    style.textContent = '@keyframes ballotFly{0%{transform:translateY(0) scale(1) rotate(0deg);opacity:1}40%{transform:translateY(-120px) scale(1.4) rotate(-12deg);opacity:1}100%{transform:translateY(-350px) scale(0.3) rotate(15deg);opacity:0}}';
    document.head.appendChild(style);
  }
  document.body.appendChild(anim);
  setTimeout(() => anim.remove(), 1600);
}

// ── Print Receipt ─────────────────────────────────────────────────────────────
function printReceipt() { window.print(); }

// ── Session Timer ─────────────────────────────────────────────────────────────
function startSessionTimer() {
  let secs = 20 * 60;
  const el = Utils.$('#session-timer');
  sessionTimer = setInterval(() => {
    secs--;
    if (el) {
      const m = String(Math.floor(secs/60)).padStart(2,'0');
      const s = String(secs%60).padStart(2,'0');
      el.textContent = `${m}:${s}`;
      if (secs < 60) el.style.color = 'var(--danger)';
    }
    if (secs <= 0) {
      clearInterval(sessionTimer);
      Notify.warning('Session expired.');
      setTimeout(() => window.location.href = 'index.html', 2000);
    }
  }, 1000);
}
