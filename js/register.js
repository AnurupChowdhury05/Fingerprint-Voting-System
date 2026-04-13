// ================================================================
// FINGERPRINT VOTING SYSTEM v2 — Registration (register.js)
// FAANG-Level Edition
// ================================================================
'use strict';

let currentStep   = 1;
const TOTAL_STEPS = 5;
let scanner       = null;
let voterData     = {};
let biometricHash = null;
let scanSeed      = null;
let idProofBase64 = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check registration is open
  const state = StorageManager.getElectionState();
  if (state !== ElectionState.REGISTRATION_OPEN) {
    showStateBlock(state);
    return;
  }
  initScanner();
  setupCountrySelect();
  setupSteps();
  setupIdUpload();
});

function showStateBlock(state) {
  const main = Utils.$('#reg-main');
  if (!main) return;
  const msgs = {
    setup:           { icon:'⚙️', title:'Registration Not Yet Open', msg:'The administrator has not opened voter registration. Please check back later.' },
    election_active: { icon:'🗳️', title:'Election In Progress',       msg:'Voter registration is closed during an active election.' },
    election_ended:  { icon:'🏁', title:'Election Has Ended',         msg:'This election has concluded. Registration is now closed.' },
  };
  const m = msgs[state] || msgs.setup;
  main.innerHTML = `
    <div style="text-align:center;padding:4rem 2rem">
      <div style="font-size:4rem;margin-bottom:1.5rem">${m.icon}</div>
      <div class="eyebrow mb-md">Registration Unavailable</div>
      <h2 class="mb-md">${m.title}</h2>
      <p class="text-secondary mb-xl">${m.msg}</p>
      <a href="index.html" class="btn btn-outline">← Back to Home</a>
    </div>`;
}

// ── Country Select ────────────────────────────────────────────────────────────
function setupCountrySelect() {
  const sel = Utils.$('#f-country');
  if (sel) Utils.buildCountrySelect(sel);
}

// ── ID Proof Upload (with compression to prevent localStorage overflow) ────────
function compressImage(dataUrl, maxW=800, quality=0.7) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale  = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);  // fallback to original
    img.src = dataUrl;
  });
}

function setupIdUpload() {
  const input   = Utils.$('#f-id-file');
  const preview = Utils.$('#id-preview');
  if (!input) return;
  input.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { Notify.warning('File too large. Max 5MB.'); input.value=''; return; }
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await compressImage(ev.target.result);
      idProofBase64 = compressed;
      if (preview) {
        preview.src = idProofBase64;
        preview.style.display = 'block';
        Utils.$('#id-preview-wrap').style.display = 'block';
      }
      const kb = Math.round((compressed.length * 0.75) / 1024);
      Notify.success(`ID proof uploaded (${kb}KB — compressed for storage).`);
    };
    reader.readAsDataURL(file);
  });

  const dropZone = Utils.$('#id-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('click', () => input.click());
    dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.style.borderColor='var(--primary)'; });
    dropZone.addEventListener('dragleave', ()=> dropZone.style.borderColor='');
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.borderColor='';
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event('change'));
    });
  }
}

// ── Scanner ───────────────────────────────────────────────────────────────────
function initScanner() {
  scanner = new FingerprintScanner('reg-scan-canvas', { autoGenSeed: true });
  scanner.onSuccess(async (token, seed) => {
    scanSeed = seed;
    collectStep1Data();
    const hashInput = JSON.stringify({ name: voterData.name, dob: voterData.dob, nationalId: voterData.nationalId, scanToken: token });
    biometricHash = await CryptoUtils.generateHash(hashInput);
    showScanResult(true);
    Utils.$('#btn-step-next').disabled = false;
  });
  scanner.onFailure(() => {
    Notify.error('Scan failed. Please try again.');
  });
}

function showScanResult(success) {
  const el = Utils.$('#scan-result');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = success ? `
    <div class="alert alert-success">
      <span class="alert-icon">🔐</span>
      <div>
        <div class="fw-600 mb-xs">Fingerprint Captured</div>
        <div class="text-sm text-secondary mb-sm">Unique biometric hash generated.</div>
        <div class="hash-display">${biometricHash}</div>
      </div>
    </div>` : `<div class="alert alert-danger"><span class="alert-icon">✕</span><span>Scan failed. Please retry.</span></div>`;
}

// ── Step Navigation ───────────────────────────────────────────────────────────
function setupSteps() {
  Utils.$('#btn-step-next')?.addEventListener('click',  goNext);
  Utils.$('#btn-step-back')?.addEventListener('click',  goBack);
  Utils.$('#btn-submit')?.addEventListener('click',  submitRegistration);
  renderStep();
}

function goNext() {
  const validators = { 1: validateStep1, 2: validateStep2, 3: validateStep3 };
  if (validators[currentStep] && !validators[currentStep]()) return;
  if (currentStep === 3 && !biometricHash) { Notify.warning('Complete fingerprint scan first.'); return; }
  if (currentStep < TOTAL_STEPS) { currentStep++; renderStep(); }
  if (currentStep === 4) runDuplicateCheck();
}

function goBack() {
  if (currentStep > 1) { currentStep--; renderStep(); }
}

function renderStep() {
  Utils.$$('.step').forEach((el, i) => {
    const n = i + 1;
    el.classList.toggle('active', n === currentStep);
    el.classList.toggle('done',   n < currentStep);
    el.querySelector('.step-circle').textContent = n < currentStep ? '✓' : n;
  });
  Utils.$$('.step-connector').forEach((el, i) => el.classList.toggle('done', i < currentStep - 1));
  Utils.$$('.step-panel').forEach((p, i) => p.style.display = (i + 1 === currentStep) ? 'block' : 'none');

  const backBtn   = Utils.$('#btn-step-back');
  const nextBtn   = Utils.$('#btn-step-next');
  const submitBtn = Utils.$('#btn-submit');
  if (backBtn)   backBtn.style.display   = currentStep === 1 ? 'none' : 'inline-flex';
  if (nextBtn)   nextBtn.style.display   = currentStep >= TOTAL_STEPS - 1 ? 'none' : 'inline-flex'; // hide on 4,5
  if (submitBtn) submitBtn.style.display = currentStep === TOTAL_STEPS ? 'inline-flex' : 'none';

  // Disable next on step 3 until scan done
  if (currentStep === 3 && nextBtn) nextBtn.disabled = !biometricHash;
  if (currentStep !== 3 && nextBtn) nextBtn.disabled = false;

  if (currentStep === 5) buildConfirmSummary();

  // Top progress bar
  const prog = Utils.$('#top-prog');
  if (prog) prog.style.width = ((currentStep/TOTAL_STEPS)*100) + '%';
}

// ── Validators ────────────────────────────────────────────────────────────────
function collectStep1Data() {
  voterData.name       = Utils.$('#f-name')?.value.trim() || '';
  voterData.dob        = Utils.$('#f-dob')?.value || '';
  voterData.country    = Utils.$('#f-country')?.value || '';
  voterData.gender     = Utils.$('#f-gender')?.value || '';
  voterData.nationalId = Utils.$('#f-nid')?.value.trim() || '';
  voterData.email      = Utils.$('#f-email')?.value.trim() || '';
  voterData.phone      = Utils.$('#f-phone')?.value.trim() || '';
  voterData.address    = Utils.$('#f-address')?.value.trim() || '';
}

function validateStep1() {
  collectStep1Data();
  if (!voterData.name)        { Notify.warning('Full name is required.');      return false; }
  if (!voterData.dob)         { Notify.warning('Date of birth is required.');  return false; }
  if (!voterData.country)     { Notify.warning('Country is required.');        return false; }
  if (!voterData.nationalId)  { Notify.warning('National ID is required.');    return false; }
  if (!voterData.email || !voterData.email.includes('@')) { Notify.warning('Valid email required.'); return false; }
  return true;
}

function validateStep2() {
  if (!idProofBase64) { Notify.warning('Please upload your ID proof document.'); return false; }
  if (!Utils.$('#f-doc-type')?.value) { Notify.warning('Please select document type.'); return false; }
  voterData.docType = Utils.$('#f-doc-type')?.value;
  return true;
}

function validateStep3() {
  if (!biometricHash) { Notify.warning('Complete fingerprint scan first.'); return false; }
  return true;
}

// ── Duplicate Check (Step 4) ──────────────────────────────────────────────────
async function runDuplicateCheck() {
  const log   = Utils.$('#dup-check-log');
  const status= Utils.$('#dup-check-status');
  if (!log) return;

  log.innerHTML = '';
  const nextBtn   = Utils.$('#btn-step-next');
  if (nextBtn) { nextBtn.style.display = 'none'; }

  const appendLine = (icon, text, color='var(--text-secondary)') => {
    const li = document.createElement('div');
    li.style.cssText = `display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid var(--border-subtle);font-size:0.875rem;animation:fadeInUp 0.3s ease both;color:${color}`;
    li.innerHTML = `<span style="font-size:1rem;flex-shrink:0">${icon}</span><span>${text}</span>`;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  };

  const delay = ms => new Promise(r => setTimeout(r, ms));

  appendLine('🔄', 'Initializing verification system…');
  await delay(700);

  // Check National ID
  appendLine('🔍', `Checking National ID: <span class="font-mono" style="color:var(--primary)">${voterData.nationalId}</span>…`);
  await delay(1000);
  const dupNid = StorageManager.findVoterByNationalId(voterData.nationalId);
  if (dupNid) {
    appendLine('✕', 'DUPLICATE: National ID already registered!', 'var(--danger)');
    if (status) { status.textContent = 'DUPLICATE DETECTED'; status.style.color = 'var(--danger)'; }
    StorageManager.addFraudAlert('REGISTRATION_DUPLICATE', `Duplicate National ID: ${voterData.nationalId}`);
    showDuplicateError();
    return;
  }
  appendLine('✓', 'National ID check passed — No match found', 'var(--success)');
  await delay(600);

  // Check biometric
  appendLine('🔍', 'Scanning biometric database…');
  await delay(1200);
  const dupHash = StorageManager.findVoterByHash(biometricHash);
  if (dupHash) {
    appendLine('✕', 'DUPLICATE: Biometric hash already registered!', 'var(--danger)');
    if (status) { status.textContent = 'DUPLICATE DETECTED'; status.style.color = 'var(--danger)'; }
    StorageManager.addFraudAlert('REGISTRATION_DUPLICATE', 'Duplicate biometric hash detected');
    showDuplicateError();
    return;
  }
  appendLine('✓', 'Biometric check passed — No match found', 'var(--success)');
  await delay(600);

  appendLine('🔍', 'Verifying document authenticity…');
  await delay(900);
  appendLine('✓', `Document type verified: ${voterData.docType}`, 'var(--success)');
  await delay(500);

  appendLine('✅', 'ALL CHECKS PASSED — No duplicates found', 'var(--success)');
  if (status) { status.textContent = 'VERIFIED ✓'; status.style.color = 'var(--success)'; }

  // Move to step 5
  await delay(600);
  currentStep = 5;
  renderStep();
}

function showDuplicateError() {
  const el = Utils.$('#dup-error');
  if (el) el.style.display = 'block';
  Notify.error('Duplicate registration detected. This identity is already registered.', 7000);
}

// ── Step 5: Confirm ───────────────────────────────────────────────────────────
function buildConfirmSummary() {
  const wrap = Utils.$('#confirm-summary');
  if (!wrap) return;
  const countryName = Utils.countryName(voterData.country);
  const fields = [
    { l:'Full Name',       v: voterData.name },
    { l:'Date of Birth',   v: Utils.formatDateShort(voterData.dob) },
    { l:'Country',         v: countryName },
    { l:'Gender',          v: voterData.gender || '—' },
    { l:'National ID',     v: voterData.nationalId },
    { l:'Email',           v: voterData.email },
    { l:'Phone',           v: voterData.phone || '—' },
    { l:'Document Type',   v: voterData.docType },
    { l:'Biometric',       v: '✓ Captured', cls:'text-success' },
    { l:'ID Proof',        v: '✓ Uploaded', cls:'text-success' },
  ];
  wrap.innerHTML = `
    <div class="card">
      <div class="card-header mb-md">
        <h4 class="card-title">Registration Summary</h4>
        <span class="badge badge-warning badge-pulse">Pending Review</span>
      </div>
      ${fields.map(f=>`
        <div class="flex justify-between items-center py-sm" style="border-bottom:1px solid var(--border-subtle)">
          <span class="text-xs text-muted fw-600" style="letter-spacing:.06em;text-transform:uppercase">${f.l}</span>
          <span class="text-sm fw-600 ${f.cls||''}">${f.v}</span>
        </div>`).join('')}
      <div class="mt-md">
        <div class="text-xs text-muted mb-xs">Biometric Hash (SHA-256)</div>
        <div class="hash-display">${biometricHash}</div>
      </div>
    </div>
    <div class="alert alert-warning mt-md">
      <span class="alert-icon">⏳</span>
      <div>
        <div class="fw-600 mb-xs">Pending Admin Approval</div>
        Your registration will be reviewed by an administrator. Once approved, you will receive your Voter ID and can cast your vote.
      </div>
    </div>`;
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submitRegistration() {
  const btn = Utils.$('#btn-submit');
  btn.classList.add('loading'); btn.disabled = true;
  collectStep1Data();
  await new Promise(r => setTimeout(r, 1200));

  // Final duplicate guard
  if (StorageManager.findVoterByNationalId(voterData.nationalId)) {
    Notify.error('Duplicate National ID detected. Registration blocked.');
    btn.classList.remove('loading'); btn.disabled = false; return;
  }
  if (StorageManager.findVoterByHash(biometricHash)) {
    Notify.error('Duplicate biometric detected. Registration blocked.');
    btn.classList.remove('loading'); btn.disabled = false; return;
  }

  const voter = {
    id:            CryptoUtils.generateUID(),
    voterId:       null,          // assigned on approval
    status:        'pending',
    name:          voterData.name,
    dob:           voterData.dob,
    country:       voterData.country,
    gender:        voterData.gender,
    nationalId:    voterData.nationalId,
    email:         voterData.email,
    phone:         voterData.phone,
    address:       voterData.address,
    docType:       voterData.docType,
    idProof:       idProofBase64,
    biometricHash: biometricHash,
    scanSeed:      scanSeed,
    registeredAt:  new Date().toISOString(),
    approvedAt:    null,
    hasVoted:      false,
    votedAt:       null,
    votedFor:      null,
  };

  StorageManager.addVoter(voter);
  StorageManager.addLog('VOTER_REGISTERED', `New voter registered (pending approval): ${voter.name}`, voter.id);
  showRegistrationSuccess(voter);
}

function showRegistrationSuccess(voter) {
  Utils.$('#reg-main').style.display    = 'none';
  Utils.$('#reg-success').style.display = 'flex';
  Utils.$('#suc-name').textContent    = voter.name;
  Utils.$('#suc-nid').textContent     = voter.nationalId;
  Utils.$('#suc-country').textContent = Utils.countryName(voter.country);

  // 🎉 Confetti
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount:120, spread:70, origin:{y:.5}, colors:['#00d4ff','#7b2fff','#ffd700','#00ff88'] });
    setTimeout(()=>confetti({ particleCount:60, angle:60, spread:50, origin:{x:0,y:.5} }), 300);
    setTimeout(()=>confetti({ particleCount:60, angle:120, spread:50, origin:{x:1,y:.5} }), 600);
  }

  // QR Code (for National ID / registration reference)
  const qrEl = document.getElementById('reg-qr');
  if (qrEl && typeof QRCode !== 'undefined') {
    qrEl.innerHTML = '';
    new QRCode(qrEl, {
      text: `SecureVote Registration\nName: ${voter.name}\nNID: ${voter.nationalId}\nCountry: ${Utils.countryName(voter.country)}\nStatus: Pending Approval`,
      width:128, height:128,
      colorDark:'#00d4ff', colorLight:'#0a1628',
    });
  }

  Notify.success('Registration submitted! Awaiting admin approval.', 6000);
}
