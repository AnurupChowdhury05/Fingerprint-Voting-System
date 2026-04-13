// ================================================================
// FINGERPRINT VOTING SYSTEM — Scanner Simulation Engine (scanner.js)
// ================================================================

'use strict';

class FingerprintScanner {
  /**
   * @param {string} canvasId   — ID of the <canvas> element
   * @param {object} [opts]     — options
   */
  constructor(canvasId, opts = {}) {
    this.canvas   = document.getElementById(canvasId);
    this.ctx      = this.canvas.getContext('2d');
    this.frame    = this.canvas.closest('.scanner-frame') || this.canvas.parentElement;
    this.opts     = Object.assign({
      width: 240, height: 300,
      autoGenSeed: true,    // generate a random seed each time
      matchHash: null,      // if set, scanner must match this hash
    }, opts);

    // Internal state
    this._state       = 'idle';
    this._seed        = this._newSeed();
    this._scanToken   = null;
    this._raf         = null;
    this._beamY       = 0;
    this._beamDir     = 1;
    this._scanFrames  = 0;
    this._callbacks   = { success: [], failure: [] };
    this._dataChars   = '0123456789ABCDEF';

    this.canvas.width  = this.opts.width;
    this.canvas.height = this.opts.height;

    this._drawIdle();
    this._setupBeam();
    this._bindEvents();
  }

  // ── Seed / Token ─────────────────────────────────────────────
  _newSeed() {
    const arr = new Uint32Array(4);
    crypto.getRandomValues(arr);
    return Array.from(arr).join('-');
  }

  async _generateToken() {
    const raw = this._seed + ':' + Date.now() + ':' + navigator.userAgent;
    return await CryptoUtils.generateHash(raw);
  }

  // ── Canvas Drawing ────────────────────────────────────────────
  _clear() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  _drawIdle() {
    this._clear();
    this._drawFingerprint(0.35, '#1a2a40', '#0f1e30');
    this._drawGrid();
  }

  _drawGrid() {
    const { ctx, canvas } = this;
    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  /**
   * Draw fingerprint ridges on canvas
   * @param {number} opacity     0–1
   * @param {string} ridgeColor  CSS color
   * @param {string} bgColor     CSS color for background
   */
  _drawFingerprint(opacity, ridgeColor, bgColor) {
    const { ctx, canvas } = this;
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2 + 10;

    ctx.save();
    ctx.globalAlpha = opacity;

    // Background ellipse (finger pad)
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 95);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 85, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ridges — concentric distorted ellipses
    // Use seed to deterministically vary the pattern
    const seedNum = this._seed.split('-').reduce((a, b) => a + parseInt(b), 0);
    const warp = (seedNum % 10) / 100;   // subtle shape variation per person

    ctx.strokeStyle = ridgeColor;
    ctx.lineWidth = 1.2;

    const ridgeCount = 14;
    for (let i = 1; i <= ridgeCount; i++) {
      const rx = 6  + i * 5.5 + (i % 3) * warp * 8;
      const ry = 8  + i * 7   + (i % 3) * warp * 6;
      const rot = warp * 0.3 * Math.sin(i * 0.8);

      ctx.beginPath();
      ctx.ellipse(cx + Math.sin(i) * warp * 6, cy + Math.cos(i) * warp * 4, rx, ry, rot, 0, Math.PI * 2);
      ctx.stroke();

      // Break lines occasionally (for realism)
      if ((seedNum + i) % 4 === 0) {
        const breakAngle = ((seedNum + i * 37) % 360) * Math.PI / 180;
        const gap = 0.18 + (i % 3) * 0.05;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, rot, breakAngle + gap, breakAngle + Math.PI * 2 - gap);
        ctx.stroke();
      }
    }

    // Core whorl
    for (let j = 1; j <= 4; j++) {
      ctx.beginPath();
      ctx.ellipse(cx + warp * 4, cy + warp * 3, j * 2.5, j * 3, warp * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Delta points
    ctx.fillStyle = ridgeColor;
    ctx.globalAlpha = opacity * 0.5;
    const deltaX = cx - 35 + (seedNum % 15);
    const deltaY = cy + 30 + (seedNum % 12);
    ctx.beginPath(); ctx.arc(deltaX, deltaY, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 38 - (seedNum % 12), deltaY - 4, 2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  _drawScanning(beamY, progress) {
    this._clear();
    this._drawFingerprint(0.7, 'rgba(0,212,255,0.6)', 'rgba(0,40,60,0.6)');
    this._drawGrid();

    const { ctx, canvas } = this;

    // Scanned portion highlight
    const scanGrad = ctx.createLinearGradient(0, 0, 0, beamY);
    scanGrad.addColorStop(0, 'rgba(0,212,255,0.12)');
    scanGrad.addColorStop(1, 'rgba(0,212,255,0.04)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, 0, canvas.width, beamY);

    // Data overlay dots
    ctx.fillStyle = 'rgba(0,212,255,0.4)';
    for (let i = 0; i < 6; i++) {
      const dot = {
        x: 15 + (i * 37 + progress * 0.5) % (canvas.width - 30),
        y: (i * 53 + progress * 2) % Math.max(beamY, 1)
      };
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawSuccess() {
    this._clear();
    const { ctx, canvas } = this;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    this._drawFingerprint(1, 'rgba(0,255,136,0.75)', 'rgba(0,40,20,0.7)');

    // Green glow ring
    const glow = ctx.createRadialGradient(cx, cy, 60, cx, cy, 130);
    glow.addColorStop(0, 'rgba(0,255,136,0.18)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Check mark
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,136,0.9)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 5);
    ctx.lineTo(cx - 5, cy + 20);
    ctx.lineTo(cx + 22, cy - 16);
    ctx.stroke();
    ctx.restore();
  }

  _drawFailure() {
    this._clear();
    const { ctx, canvas } = this;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    this._drawFingerprint(0.5, 'rgba(255,51,102,0.5)', 'rgba(40,0,10,0.7)');

    // Red X
    ctx.save();
    ctx.strokeStyle = 'rgba(255,51,102,0.9)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 18); ctx.lineTo(cx + 18, cy + 18);
    ctx.moveTo(cx + 18, cy - 18); ctx.lineTo(cx - 18, cy + 18);
    ctx.stroke();
    ctx.restore();
  }

  // ── Beam Setup ────────────────────────────────────────────────
  _setupBeam() {
    this._beamEl = document.createElement('div');
    this._beamEl.classList.add('scan-beam');
    this.frame.appendChild(this._beamEl);
  }

  // ── Bind Click ────────────────────────────────────────────────
  _bindEvents() {
    this.canvas.addEventListener('click', () => {
      if (this._state === 'idle' || this._state === 'failure') this.startScan();
    });
    this.canvas.style.cursor = 'pointer';
  }

  // ── State Machine ─────────────────────────────────────────────
  setState(state) {
    this._state = state;
    this.frame.dataset.state = state;

    const statusEl = document.querySelector(`[data-scanner-id="${this.canvas.id}"] .scanner-status-text`);
    const hintEl   = document.querySelector(`[data-scanner-id="${this.canvas.id}"] .scanner-hint`);

    const texts = {
      idle:       ['PLACE FINGER ON SENSOR', 'Click to scan'],
      scanning:   ['SCANNING BIOMETRICS…', 'Hold steady'],
      processing: ['PROCESSING DATA…', 'Analyzing fingerprint'],
      success:    ['AUTHENTICATION OK', 'Identity verified'],
      failure:    ['NO MATCH FOUND', 'Click to retry']
    };

    if (statusEl) statusEl.textContent = texts[state]?.[0] || '';
    if (hintEl)   hintEl.textContent   = texts[state]?.[1] || '';
  }

  // Update data stream display
  _tickDataStream() {
    const ds = document.getElementById('data-stream');
    if (!ds) return;
    const len = 32;
    ds.textContent = Array.from({ length: len }, () =>
      this._dataChars[Math.floor(Math.random() * this._dataChars.length)]
    ).join(' ');
  }

  // ── Public API ────────────────────────────────────────────────
  async startScan() {
    if (this._state === 'scanning' || this._state === 'processing') return;

    if (this.opts.autoGenSeed) this._seed = this._newSeed();

    this.setState('scanning');
    this.canvas.style.cursor = 'default';
    this._scanFrames = 0;
    this._beamY = 0;
    this._beamDir = 1;

    const stream = document.getElementById('data-stream');
    if (stream) { stream.classList.add('active'); }

    // Animate scan beam
    const totalFrames = 90; // ~1.5s at 60fps (beam goes top→bottom→top→bottom)
    const canvasH = this.canvas.height;

    const animate = () => {
      this._scanFrames++;
      const progress = this._scanFrames / totalFrames;
      // Beam oscillates twice
      const rawY = Math.sin(progress * Math.PI * 2.5) * 0.5 + 0.5;
      this._beamY = rawY * canvasH;

      if (this._beamEl) {
        this._beamEl.style.top = `${this._beamY}px`;
      }

      this._drawScanning(this._beamY, this._scanFrames);
      if (this._scanFrames % 4 === 0) this._tickDataStream();

      if (this._scanFrames < totalFrames) {
        this._raf = requestAnimationFrame(animate);
      } else {
        this._finalizeScan();
      }
    };

    this._raf = requestAnimationFrame(animate);
  }

  async _finalizeScan() {
    this.setState('processing');
    if (this._beamEl) this._beamEl.style.top = '-10px';

    const stream = document.getElementById('data-stream');

    // Draw processing pulse
    let pulseFrame = 0;
    const pulseAnim = setInterval(() => {
      pulseFrame++;
      this._drawScanning(this.canvas.height * (0.5 + Math.sin(pulseFrame * 0.3) * 0.4), pulseFrame * 3);
      if (stream) this._tickDataStream();
    }, 50);

    await new Promise(r => setTimeout(r, 900));
    clearInterval(pulseAnim);
    if (stream) stream.classList.remove('active');

    // Generate biometric token
    this._scanToken = await this._generateToken();

    // If a matchHash is provided, compare; otherwise always succeed
    const matched = !this.opts.matchHash || this.opts.matchHash === this._scanToken;

    if (matched) {
      this._drawSuccess();
      this.setState('success');
      this.canvas.style.cursor = 'default';
      this._callbacks.success.forEach(cb => cb(this._scanToken, this._seed));
    } else {
      this._drawFailure();
      this.setState('failure');
      this.canvas.style.cursor = 'pointer';
      this._callbacks.failure.forEach(cb => cb());
    }
  }

  /** Force-succeed the scan (used for registration: always succeed) */
  async forceScan() {
    return this.startScan();
  }

  /** Call with a known hash to test match */
  setMatchHash(hash) {
    this.opts.matchHash = hash;
    this.opts.autoGenSeed = false;
  }

  /** Fix the seed so repeated scans produce the same token */
  fixSeed(seed) {
    this._seed = seed;
    this.opts.autoGenSeed = false;
  }

  reset() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._scanToken  = null;
    this.setState('idle');
    this._drawIdle();
    this.canvas.style.cursor = 'pointer';
  }

  onSuccess(cb) { this._callbacks.success.push(cb); return this; }
  onFailure(cb) { this._callbacks.failure.push(cb); return this; }

  getToken() { return this._scanToken; }
  getSeed()  { return this._seed; }
}
