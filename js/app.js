// ================================================================
// FINGERPRINT VOTING SYSTEM v2 — Core App Module
// ================================================================
'use strict';

// ── Countries ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code:'AFG',name:'Afghanistan' },{ code:'ALB',name:'Albania' },{ code:'DZA',name:'Algeria' },
  { code:'AND',name:'Andorra' },{ code:'AGO',name:'Angola' },{ code:'ATG',name:'Antigua and Barbuda' },
  { code:'ARG',name:'Argentina' },{ code:'ARM',name:'Armenia' },{ code:'AUS',name:'Australia' },
  { code:'AUT',name:'Austria' },{ code:'AZE',name:'Azerbaijan' },{ code:'BHS',name:'Bahamas' },
  { code:'BHR',name:'Bahrain' },{ code:'BGD',name:'Bangladesh' },{ code:'BRB',name:'Barbados' },
  { code:'BLR',name:'Belarus' },{ code:'BEL',name:'Belgium' },{ code:'BLZ',name:'Belize' },
  { code:'BEN',name:'Benin' },{ code:'BTN',name:'Bhutan' },{ code:'BOL',name:'Bolivia' },
  { code:'BIH',name:'Bosnia and Herzegovina' },{ code:'BWA',name:'Botswana' },{ code:'BRA',name:'Brazil' },
  { code:'BRN',name:'Brunei' },{ code:'BGR',name:'Bulgaria' },{ code:'BFA',name:'Burkina Faso' },
  { code:'BDI',name:'Burundi' },{ code:'CPV',name:'Cabo Verde' },{ code:'KHM',name:'Cambodia' },
  { code:'CMR',name:'Cameroon' },{ code:'CAN',name:'Canada' },{ code:'CAF',name:'Central African Republic' },
  { code:'TCD',name:'Chad' },{ code:'CHL',name:'Chile' },{ code:'CHN',name:'China' },
  { code:'COL',name:'Colombia' },{ code:'COM',name:'Comoros' },{ code:'COD',name:'Congo (DRC)' },
  { code:'COG',name:'Congo (Rep.)' },{ code:'CRI',name:'Costa Rica' },{ code:'CIV',name:"Côte d'Ivoire" },
  { code:'HRV',name:'Croatia' },{ code:'CUB',name:'Cuba' },{ code:'CYP',name:'Cyprus' },
  { code:'CZE',name:'Czech Republic' },{ code:'DNK',name:'Denmark' },{ code:'DJI',name:'Djibouti' },
  { code:'DOM',name:'Dominican Republic' },{ code:'ECU',name:'Ecuador' },{ code:'EGY',name:'Egypt' },
  { code:'SLV',name:'El Salvador' },{ code:'GNQ',name:'Equatorial Guinea' },{ code:'ERI',name:'Eritrea' },
  { code:'EST',name:'Estonia' },{ code:'SWZ',name:'Eswatini' },{ code:'ETH',name:'Ethiopia' },
  { code:'FJI',name:'Fiji' },{ code:'FIN',name:'Finland' },{ code:'FRA',name:'France' },
  { code:'GAB',name:'Gabon' },{ code:'GMB',name:'Gambia' },{ code:'GEO',name:'Georgia' },
  { code:'DEU',name:'Germany' },{ code:'GHA',name:'Ghana' },{ code:'GRC',name:'Greece' },
  { code:'GRD',name:'Grenada' },{ code:'GTM',name:'Guatemala' },{ code:'GIN',name:'Guinea' },
  { code:'GNB',name:'Guinea-Bissau' },{ code:'GUY',name:'Guyana' },{ code:'HTI',name:'Haiti' },
  { code:'HND',name:'Honduras' },{ code:'HUN',name:'Hungary' },{ code:'ISL',name:'Iceland' },
  { code:'IND',name:'India' },{ code:'IDN',name:'Indonesia' },{ code:'IRN',name:'Iran' },
  { code:'IRQ',name:'Iraq' },{ code:'IRL',name:'Ireland' },{ code:'ISR',name:'Israel' },
  { code:'ITA',name:'Italy' },{ code:'JAM',name:'Jamaica' },{ code:'JPN',name:'Japan' },
  { code:'JOR',name:'Jordan' },{ code:'KAZ',name:'Kazakhstan' },{ code:'KEN',name:'Kenya' },
  { code:'KIR',name:'Kiribati' },{ code:'PRK',name:'North Korea' },{ code:'KOR',name:'South Korea' },
  { code:'KWT',name:'Kuwait' },{ code:'KGZ',name:'Kyrgyzstan' },{ code:'LAO',name:'Laos' },
  { code:'LVA',name:'Latvia' },{ code:'LBN',name:'Lebanon' },{ code:'LSO',name:'Lesotho' },
  { code:'LBR',name:'Liberia' },{ code:'LBY',name:'Libya' },{ code:'LIE',name:'Liechtenstein' },
  { code:'LTU',name:'Lithuania' },{ code:'LUX',name:'Luxembourg' },{ code:'MDG',name:'Madagascar' },
  { code:'MWI',name:'Malawi' },{ code:'MYS',name:'Malaysia' },{ code:'MDV',name:'Maldives' },
  { code:'MLI',name:'Mali' },{ code:'MLT',name:'Malta' },{ code:'MHL',name:'Marshall Islands' },
  { code:'MRT',name:'Mauritania' },{ code:'MUS',name:'Mauritius' },{ code:'MEX',name:'Mexico' },
  { code:'FSM',name:'Micronesia' },{ code:'MDA',name:'Moldova' },{ code:'MCO',name:'Monaco' },
  { code:'MNG',name:'Mongolia' },{ code:'MNE',name:'Montenegro' },{ code:'MAR',name:'Morocco' },
  { code:'MOZ',name:'Mozambique' },{ code:'MMR',name:'Myanmar' },{ code:'NAM',name:'Namibia' },
  { code:'NRU',name:'Nauru' },{ code:'NPL',name:'Nepal' },{ code:'NLD',name:'Netherlands' },
  { code:'NZL',name:'New Zealand' },{ code:'NIC',name:'Nicaragua' },{ code:'NER',name:'Niger' },
  { code:'NGA',name:'Nigeria' },{ code:'MKD',name:'North Macedonia' },{ code:'NOR',name:'Norway' },
  { code:'OMN',name:'Oman' },{ code:'PAK',name:'Pakistan' },{ code:'PLW',name:'Palau' },
  { code:'PAN',name:'Panama' },{ code:'PNG',name:'Papua New Guinea' },{ code:'PRY',name:'Paraguay' },
  { code:'PER',name:'Peru' },{ code:'PHL',name:'Philippines' },{ code:'POL',name:'Poland' },
  { code:'PRT',name:'Portugal' },{ code:'QAT',name:'Qatar' },{ code:'ROU',name:'Romania' },
  { code:'RUS',name:'Russia' },{ code:'RWA',name:'Rwanda' },{ code:'KNA',name:'Saint Kitts and Nevis' },
  { code:'LCA',name:'Saint Lucia' },{ code:'VCT',name:'Saint Vincent and the Grenadines' },
  { code:'WSM',name:'Samoa' },{ code:'SMR',name:'San Marino' },{ code:'STP',name:'Sao Tome and Principe' },
  { code:'SAU',name:'Saudi Arabia' },{ code:'SEN',name:'Senegal' },{ code:'SRB',name:'Serbia' },
  { code:'SYC',name:'Seychelles' },{ code:'SLE',name:'Sierra Leone' },{ code:'SGP',name:'Singapore' },
  { code:'SVK',name:'Slovakia' },{ code:'SVN',name:'Slovenia' },{ code:'SLB',name:'Solomon Islands' },
  { code:'SOM',name:'Somalia' },{ code:'ZAF',name:'South Africa' },{ code:'SSD',name:'South Sudan' },
  { code:'ESP',name:'Spain' },{ code:'LKA',name:'Sri Lanka' },{ code:'SDN',name:'Sudan' },
  { code:'SUR',name:'Suriname' },{ code:'SWE',name:'Sweden' },{ code:'CHE',name:'Switzerland' },
  { code:'SYR',name:'Syria' },{ code:'TWN',name:'Taiwan' },{ code:'TJK',name:'Tajikistan' },
  { code:'TZA',name:'Tanzania' },{ code:'THA',name:'Thailand' },{ code:'TLS',name:'Timor-Leste' },
  { code:'TGO',name:'Togo' },{ code:'TON',name:'Tonga' },{ code:'TTO',name:'Trinidad and Tobago' },
  { code:'TUN',name:'Tunisia' },{ code:'TUR',name:'Turkey' },{ code:'TKM',name:'Turkmenistan' },
  { code:'TUV',name:'Tuvalu' },{ code:'UGA',name:'Uganda' },{ code:'UKR',name:'Ukraine' },
  { code:'ARE',name:'United Arab Emirates' },{ code:'GBR',name:'United Kingdom' },
  { code:'USA',name:'United States' },{ code:'URY',name:'Uruguay' },{ code:'UZB',name:'Uzbekistan' },
  { code:'VUT',name:'Vanuatu' },{ code:'VEN',name:'Venezuela' },{ code:'VNM',name:'Vietnam' },
  { code:'YEM',name:'Yemen' },{ code:'ZMB',name:'Zambia' },{ code:'ZWE',name:'Zimbabwe' },
];

// ── Election States ───────────────────────────────────────────────────────────
const ElectionState = {
  SETUP:             'setup',
  REGISTRATION_OPEN: 'registration_open',
  ELECTION_ACTIVE:   'election_active',
  ELECTION_ENDED:    'election_ended',

  label(s) {
    return { setup:'Setup', registration_open:'Registration Open',
             election_active:'Election Active', election_ended:'Election Ended' }[s] || s;
  },
  color(s) {
    return { setup:'var(--text-muted)', registration_open:'var(--primary)',
             election_active:'var(--success)', election_ended:'var(--accent)' }[s] || '#fff';
  },
  badgeClass(s) {
    return { setup:'badge-warning', registration_open:'badge-primary',
             election_active:'badge-success badge-pulse', election_ended:'badge-accent' }[s] || 'badge-primary';
  }
};

// ── Fraud Alert Types ─────────────────────────────────────────────────────────
const FraudType = {
  INVALID_VOTER_ID:       { label: 'Invalid Voter ID',       severity: 'medium'   },
  VOTER_NOT_APPROVED:     { label: 'Voter Not Approved',     severity: 'high'     },
  ALREADY_VOTED:          { label: 'Double Vote Attempt',    severity: 'critical' },
  ELECTION_NOT_ACTIVE:    { label: 'Voting Outside Window',  severity: 'low'      },
  SCAN_FAILED:            { label: 'Multiple Scan Failures', severity: 'low'      },
  REGISTRATION_DUPLICATE: { label: 'Registration Duplicate', severity: 'high'     },
};

// ── Default Candidates ────────────────────────────────────────────────────────
const DEFAULT_CANDIDATES = [
  { id:'cand-001', number:1, name:'Alexandra Chen',   party:'Progress Alliance',   partyCode:'PA', platform:'Technology innovation, climate action, and universal education reform.', color:'#00d4ff', symbol:'⚡', votes:0 },
  { id:'cand-002', number:2, name:'Marcus Rivera',    party:'Unity Coalition',     partyCode:'UC', platform:'Economic equality, healthcare access, and nationwide infrastructure.', color:'#7b2fff', symbol:'🤝', votes:0 },
  { id:'cand-003', number:3, name:'Priya Sharma',     party:'Innovation Forward',  partyCode:'IF', platform:'Digital transformation, startup ecosystem, and smart governance.',    color:'#00ff88', symbol:'🚀', votes:0 },
  { id:'cand-004', number:4, name:"James O'Brien",    party:'Citizens First',      partyCode:'CF', platform:'Community empowerment, traditional values, and fiscal responsibility.', color:'#ffd700', symbol:'🏛️', votes:0 },
];

const DEFAULT_ELECTION = {
  id: 'ELC-2026-001',
  title: 'General Presidential Election 2026',
  description: 'Exercise your democratic right. Your vote is your voice.',
  state: ElectionState.SETUP,
  registrationOpenedAt: null,
  electionStartedAt:    null,
  electionEndedAt:      null,
};

// ── Crypto Utilities ──────────────────────────────────────────────────────────
const CryptoUtils = {
  async generateHash(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    const encoded = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  },
  generateUID() {
    return 'VTR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,5).toUpperCase();
  },
  generateVoterId(country, name) {
    const code = country || 'INT';
    const year = new Date().getFullYear();
    // deterministic-ish but unique per registration
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${code}-${year}-${rand}`;
  },
  generateNonce() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
};

// ── Storage Manager ───────────────────────────────────────────────────────────
const StorageManager = {
  _k: k => `fpvs_${k}`,
  _get(key)      { try { return JSON.parse(localStorage.getItem(this._k(key))); } catch { return null; } },
  _set(key, val) {
    try { localStorage.setItem(this._k(key), JSON.stringify(val)); }
    catch(e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.error('localStorage quota exceeded for key:', key);
        if (typeof Notify !== 'undefined') Notify.error('Storage full! Please reduce ID proof file size (max 200KB).');
      }
    }
  },

  // ── ELECTION STATE ──
  getElection() {
    const s = this._get('election');
    if (!s) { this._set('election', DEFAULT_ELECTION); return DEFAULT_ELECTION; }
    return s;
  },
  updateElection(upd) { this._set('election', { ...this.getElection(), ...upd }); },
  getElectionState() { return this.getElection().state || ElectionState.SETUP; },
  setElectionState(state) {
    const upd = { state };
    if (state === ElectionState.REGISTRATION_OPEN) upd.registrationOpenedAt = new Date().toISOString();
    if (state === ElectionState.ELECTION_ACTIVE)   upd.electionStartedAt    = new Date().toISOString();
    if (state === ElectionState.ELECTION_ENDED)    upd.electionEndedAt      = new Date().toISOString();
    this.updateElection(upd);
    this.addLog('ELECTION_STATE_CHANGE', `Election state changed to: ${ElectionState.label(state)}`, 'admin');
  },

  // ── VOTERS ──
  getVoters()          { return this._get('voters') || []; },
  getPendingVoters()   { return this.getVoters().filter(v => v.status === 'pending'); },
  getApprovedVoters()  { return this.getVoters().filter(v => v.status === 'approved'); },
  getRejectedVoters()  { return this.getVoters().filter(v => v.status === 'rejected'); },

  addVoter(voter) {
    const voters = this.getVoters();
    voters.push(voter);
    this._set('voters', voters);
  },
  updateVoter(id, upd) {
    const voters = this.getVoters();
    const i = voters.findIndex(v => v.id === id);
    if (i !== -1) { voters[i] = { ...voters[i], ...upd }; this._set('voters', voters); }
  },
  approveVoter(id) {
    const voter = this.findVoterById(id);
    if (!voter) return null;
    const voterId = CryptoUtils.generateVoterId(voter.country, voter.name);
    this.updateVoter(id, { status: 'approved', voterId, approvedAt: new Date().toISOString() });
    this.addLog('VOTER_APPROVED', `Voter approved: ${voter.name} → ID: ${voterId}`, id);
    return voterId;
  },
  rejectVoter(id) {
    const voter = this.findVoterById(id);
    if (!voter) return;
    this.updateVoter(id, { status: 'rejected', rejectedAt: new Date().toISOString() });
    this.addLog('VOTER_REJECTED', `Voter rejected: ${voter.name}`, id);
  },
  deleteVoter(id) {
    const voters = this.getVoters().filter(v => v.id !== id);
    this._set('voters', voters);
    this.addLog('VOTER_DELETED', `Voter ${id} removed`, 'admin');
  },

  findVoterById(id)        { return this.getVoters().find(v => v.id === id) || null; },
  findVoterByVoterId(vid)  { return this.getVoters().find(v => v.voterId === vid) || null; },
  findVoterByHash(hash)    { return this.getVoters().find(v => v.biometricHash === hash) || null; },
  findVoterByNationalId(nid) { return this.getVoters().find(v => v.nationalId === nid) || null; },

  // ── CANDIDATES ──
  getCandidates() {
    const s = this._get('candidates');
    if (!s || !s.length) { this._set('candidates', DEFAULT_CANDIDATES); return DEFAULT_CANDIDATES; }
    return s;
  },
  setCandidates(list) { this._set('candidates', list); },
  addCandidate(c) {
    const list = this.getCandidates();
    list.push({ ...c, id: 'cand-' + Date.now(), votes: 0 });
    this._set('candidates', list);
  },
  updateCandidate(id, upd) {
    const list = this.getCandidates();
    const i = list.findIndex(c => c.id === id);
    if (i !== -1) { list[i] = { ...list[i], ...upd }; this._set('candidates', list); }
  },
  deleteCandidate(id) {
    this._set('candidates', this.getCandidates().filter(c => c.id !== id));
  },
  incrementVote(candidateId) {
    const list = this.getCandidates();
    const i = list.findIndex(c => c.id === candidateId);
    if (i !== -1) { list[i].votes = (list[i].votes || 0) + 1; this._set('candidates', list); }
  },

  // ── FRAUD ALERTS ──
  getFraudAlerts() { return this._get('fraud') || []; },
  addFraudAlert(type, details, voterId = null, extra = {}) {
    const alerts = this.getFraudAlerts();
    const meta = FraudType[type] || { label: type, severity: 'medium' };
    alerts.unshift({
      id:        'FRD-' + Date.now(),
      timestamp: new Date().toISOString(),
      type, ...meta, details, voterId,
      ip:        `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      ...extra
    });
    this._set('fraud', alerts.slice(0, 500));
    this.addLog(`FRAUD_${type}`, details, voterId);
  },
  clearFraudAlerts() { this._set('fraud', []); },

  // ── AUDIT LOG ──
  getLogs() { return this._get('logs') || []; },
  addLog(action, details, voterId = null) {
    const logs = this.getLogs();
    logs.unshift({
      id:        'LOG-' + Date.now() + '-' + Math.random().toString(36).substr(2,3).toUpperCase(),
      timestamp: new Date().toISOString(),
      action, details, voterId,
      ip:        `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
    });
    this._set('logs', logs.slice(0, 1000));
  },

  // ── VOTES ──
  recordVote(voterId, candidateId) {
    const votes = this._get('votes') || [];
    votes.push({
      id:          'VOTE-' + Date.now(),
      voterId,
      candidateId,
      timestamp:   new Date().toISOString(),
      receipt:     'RCP-' + Date.now().toString(36).toUpperCase()
    });
    this._set('votes', votes);
    return votes[votes.length - 1];
  },
  getVotes() { return this._get('votes') || []; },

  // ── RESET ──
  resetVotes() {
    const cands = this.getCandidates().map(c => ({ ...c, votes: 0 }));
    this._set('candidates', cands);
    const voters = this.getVoters().map(v => ({ ...v, hasVoted: false, votedAt: null, votedFor: null }));
    this._set('voters', voters);
    this._set('votes', []);
    this.updateElection({ state: ElectionState.SETUP, electionStartedAt: null, electionEndedAt: null, registrationOpenedAt: null });
    this.addLog('SYSTEM_RESET', 'Full election reset performed', 'admin');
  },
  clearAll() {
    ['voters','candidates','election','logs','fraud','votes'].forEach(k => localStorage.removeItem(this._k(k)));
  },

  // ── STATS ──
  getStats() {
    const voters    = this.getVoters();
    const candidates= this.getCandidates();
    const totalVotes= candidates.reduce((s,c) => s+(c.votes||0), 0);
    return {
      totalRegistered: voters.length,
      pending:   voters.filter(v=>v.status==='pending').length,
      approved:  voters.filter(v=>v.status==='approved').length,
      rejected:  voters.filter(v=>v.status==='rejected').length,
      voted:     voters.filter(v=>v.hasVoted).length,
      totalVotes,
      turnout:   voters.filter(v=>v.status==='approved').length
                   ? Utils.pct(voters.filter(v=>v.hasVoted).length, voters.filter(v=>v.status==='approved').length)
                   : 0,
      fraudAlerts: this.getFraudAlerts().length,
      electionState: this.getElectionState()
    };
  }
};

// ── Session Manager ───────────────────────────────────────────────────────────
const SessionManager = {
  setAdmin()   { sessionStorage.setItem('fpvs_admin','true'); },
  clearAdmin() { sessionStorage.removeItem('fpvs_admin'); },
  isAdmin()    { return sessionStorage.getItem('fpvs_admin')==='true'; },
};

// ── Notification System ───────────────────────────────────────────────────────
const Notify = {
  _c: null,
  _init() {
    if (this._c) return;
    this._c = Object.assign(document.createElement('div'), { id:'notify-container' });
    Object.assign(this._c.style, {
      position:'fixed', top:'24px', right:'24px', zIndex:'99999',
      display:'flex', flexDirection:'column', gap:'10px',
      pointerEvents:'none', maxWidth:'380px', width:'100%'
    });
    document.body.appendChild(this._c);
  },
  show(msg, type='info', dur=4000) {
    this._init();
    const cfg = {
      success:{ bg:'rgba(0,255,136,0.08)', border:'#00ff88', icon:'✓', ic:'#00ff88' },
      error:  { bg:'rgba(255,51,102,0.08)', border:'#ff3366', icon:'✕', ic:'#ff3366' },
      warning:{ bg:'rgba(255,157,0,0.08)',  border:'#ff9d00', icon:'⚠', ic:'#ff9d00' },
      info:   { bg:'rgba(0,212,255,0.08)',  border:'#00d4ff', icon:'ℹ', ic:'#00d4ff' }
    };
    const c = cfg[type]||cfg.info;
    const t = document.createElement('div');
    t.style.cssText = `background:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px;backdrop-filter:blur(20px);pointer-events:all;font-family:'Inter',sans-serif;color:#e2e8f0;font-size:14px;box-shadow:0 4px 24px rgba(0,0,0,0.5);transform:translateX(110%);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1)`;
    t.innerHTML = `<span style="color:${c.ic};font-size:1.1rem;font-weight:700;flex-shrink:0;width:20px;text-align:center">${c.icon}</span><span style="flex:1;line-height:1.5">${msg}</span><button style="background:none;border:none;color:#475569;cursor:pointer;font-size:1.2rem;padding:0;margin-left:4px" onclick="this.closest('div').remove()">×</button>`;
    this._c.appendChild(t);
    requestAnimationFrame(()=>{ t.style.transform='translateX(0)'; });
    if (dur>0) setTimeout(()=>{ t.style.transform='translateX(110%)'; setTimeout(()=>t.remove(),350); }, dur);
    return t;
  },
  success(m,d){ return this.show(m,'success',d); },
  error(m,d)  { return this.show(m,'error',d); },
  warning(m,d){ return this.show(m,'warning',d); },
  info(m,d)   { return this.show(m,'info',d); }
};

// ── Utils ─────────────────────────────────────────────────────────────────────
const Utils = {
  formatDate(iso)      { if(!iso) return '—'; return new Date(iso).toLocaleString('en-US',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}); },
  formatDateShort(iso) { if(!iso) return '—'; return new Date(iso).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); },
  pct(v,t)             { return (t && t > 0) ? Math.round((v/t)*100) : 0; },
  escapeHTML(str)      { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); },
  animateCounter(el, target, dur=1000) {
    if (!el) return;
    const start=parseInt(el.textContent)||0, t0=Date.now();
    const tick=()=>{ const p=Math.min((Date.now()-t0)/dur,1); el.textContent=Math.round(start+(target-start)*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  },
  $(s,ctx=document)  { return ctx.querySelector(s); },
  $$(s,ctx=document) { return [...ctx.querySelectorAll(s)]; },
  countryName(code)  { return COUNTRIES.find(c=>c.code===code)?.name || code; },
  buildCountrySelect(selectEl, selectedCode='') {
    selectEl.innerHTML = '<option value="">Select Country</option>' +
      COUNTRIES.map(c=>`<option value="${c.code}" ${c.code===selectedCode?'selected':''}>${c.name}</option>`).join('');
  },
  severityColor(s) {
    return { low:'var(--primary)', medium:'var(--warning)', high:'var(--danger)', critical:'#ff0055' }[s]||'var(--text-muted)';
  },
  severityBadge(s) {
    return { low:'badge-primary', medium:'badge-warning', high:'badge-danger', critical:'badge-danger' }[s]||'badge-primary';
  }
};

// ── Initialize ────────────────────────────────────────────────────────────────
StorageManager.getCandidates();
StorageManager.getElection();
