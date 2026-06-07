/**
 * AstroGuru Mini App
 * Frontend JavaScript for Telegram Mini App
 */

const tg = window.Telegram?.WebApp;
const API_BASE = '/api';

const ZODIAC_SIGNS = [
  'Овен','Телец','Близнецы','Рак','Лев','Дева',
  'Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы'
];
const ZODIAC_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_EMOJIS = {
  sun: '☀️', moon: '🌙', mercury: '☿', venus: '♀',
  mars: '♂', jupiter: '♃', saturn: '♄', uranus: '⛢',
  neptune: '♆', pluto: '♇', ascendant: '↑'
};
const PLANET_NAMES = {
  sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера',
  mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн', uranus: 'Уран',
  neptune: 'Нептун', pluto: 'Плутон', ascendant: 'Асцендент'
};

class AstroGuruApp {
  constructor() {
    this.userData = null;
    this.currentTab = 'horoscope';
    this.initData = tg?.initData || '';
    // Dev mode: parse ?dev_id= from URL for local testing
    const urlParams = new URLSearchParams(window.location.search);
    this.devId = urlParams.get('dev_id') || '';
    this.init();
  }

  async init() {
    // Setup Telegram WebApp
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#1a0533');
      tg.setBackgroundColor('#1a1a2e');
    }

    // Apply Telegram theme
    this.applyTheme();

    // Setup navigation
    this.setupNavigation();

    // Populate sign selectors
    this.populateSignSelectors();

    // Load user data
    await this.loadUserData();

    // Show main app
    setTimeout(() => {
      document.getElementById('loading-screen').classList.remove('active');
      document.getElementById('main-app').classList.add('active');
    }, 1200);
  }

  applyTheme() {
    if (!tg?.themeParams) return;
    const params = tg.themeParams;
    const root = document.documentElement;
    if (params.bg_color) root.style.setProperty('--tg-bg', params.bg_color);
    if (params.secondary_bg_color) root.style.setProperty('--tg-sec-bg', params.secondary_bg_color);
    if (params.text_color) root.style.setProperty('--tg-text', params.text_color);
    if (params.hint_color) root.style.setProperty('--tg-hint', params.hint_color);
    if (params.button_color) root.style.setProperty('--tg-btn', params.button_color);
  }

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    document.querySelectorAll('.htab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.htab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadHoroscope(btn.dataset.htype);
      });
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(t => {
      t.classList.toggle('active', t.id === `tab-${tab}`);
    });

    if (tab === 'chart' && this.userData?.isPremium) {
      this.loadNatalChart();
    }
  }

  async makeRequest(endpoint) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.initData) headers['x-init-data'] = this.initData;

    // Dev mode: pass dev_id if running outside Telegram
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = (!this.initData && this.devId)
      ? `${API_BASE}${endpoint}${sep}dev_id=${this.devId}`
      : `${API_BASE}${endpoint}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async loadUserData() {
    try {
      this.userData = await this.makeRequest('/user');
      this.renderUserData();
    } catch (err) {
      console.warn('Failed to load user data:', err);
      this.renderGuestMode();
    }
  }

  renderUserData() {
    const u = this.userData;
    if (!u) return;

    // Header sign display
    if (u.chart) {
      const signIdx = ZODIAC_SIGNS.indexOf(u.chart.sunSign);
      document.getElementById('header-sign-name').textContent = u.chart.sunSign || '—';
      document.getElementById('header-sign-detail').textContent =
        `Луна: ${u.chart.moonSign || '—'} · Аск: ${u.chart.risingSign || '—'}`;
      document.querySelector('.sign-emoji').textContent = ZODIAC_EMOJI[signIdx] || '✨';
    } else if (u.birthDate) {
      document.getElementById('header-sign-name').textContent = 'Данные загружены';
      document.getElementById('header-sign-detail').textContent = u.birthDate;
    }

    // Premium badge
    if (u.isPremium) {
      document.getElementById('premium-badge').style.display = 'flex';
    }

    // Profile tab
    document.getElementById('profile-name').textContent =
      [u.firstName, u.lastName].filter(Boolean).join(' ');
    document.getElementById('profile-sub-status').textContent =
      u.isPremium ? '⭐ Premium подписка активна' : '🆓 Бесплатный аккаунт';

    const signIdx = u.chart ? ZODIAC_SIGNS.indexOf(u.chart.sunSign) : -1;
    document.getElementById('profile-avatar').textContent =
      signIdx >= 0 ? ZODIAC_EMOJI[signIdx] : '✨';

    document.getElementById('prof-birth-date').textContent = u.birthDate || '—';
    document.getElementById('prof-birth-time').textContent = u.birthTime || 'не указано';
    document.getElementById('prof-birth-city').textContent = u.birthCity || 'не указан';

    // Subscription section
    const subDetails = document.getElementById('sub-details');
    const subBtn = document.getElementById('sub-btn');
    if (u.isPremium) {
      const exp = u.subscriptionExpires
        ? new Date(u.subscriptionExpires).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'бессрочно';
      subDetails.innerHTML = `✅ Premium активен до: <strong>${exp}</strong>`;
      subBtn.textContent = '🔄 Продлить подписку';
    } else {
      subDetails.textContent = 'Получите доступ к персональным гороскопам, натальной карте и совместимости';
    }

    // Load initial horoscope
    this.loadHoroscope('daily');

    // Chart tab
    if (u.isPremium) {
      document.getElementById('chart-locked').style.display = 'none';
      document.getElementById('chart-container').style.display = 'block';
    } else {
      document.getElementById('chart-locked').style.display = 'block';
      document.getElementById('chart-container').style.display = 'none';
      document.getElementById('upgrade-banner').style.display = 'flex';
    }
  }

  renderGuestMode() {
    document.getElementById('header-sign-name').textContent = 'AstroGuru';
    document.getElementById('header-sign-detail').textContent = 'Настройте данные в боте';
    document.getElementById('horoscope-content').innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--tg-hint)">Откройте бота и введите /start для настройки</div>';
  }

  async loadHoroscope(type) {
    const container = document.getElementById('horoscope-content');
    container.innerHTML = '<div class="skeleton-loading"><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>';

    try {
      const endpoint = type === 'weekly' ? '/horoscope/weekly' : '/horoscope/daily';
      const data = await this.makeRequest(endpoint);
      container.innerHTML = this.renderMarkdown(data.content || '');
    } catch (err) {
      if (err.message?.includes('Premium')) {
        container.innerHTML = this.renderPremiumRequired();
      } else {
        container.innerHTML = `<div style="color:var(--tg-hint);text-align:center;padding:20px">${err.message || 'Ошибка загрузки'}</div>`;
      }
    }
  }

  renderPremiumRequired() {
    return `<div style="text-align:center;padding:20px">
      <div style="font-size:48px;margin-bottom:12px">🔒</div>
      <div style="font-size:16px;font-weight:700;color:var(--gold);margin-bottom:8px">Доступно в Premium</div>
      <div style="color:var(--tg-hint);margin-bottom:20px">Оформите подписку для получения полного прогноза</div>
      <button class="btn-subscribe" onclick="app.openSubscribe()">⭐ Premium — 49 Stars</button>
    </div>`;
  }

  renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="md-italic">$1</em>')
      .replace(/_(.*?)_/g, '<em class="md-italic">$1</em>')
      .replace(/\n/g, '<br>');
  }

  async loadNatalChart() {
    if (!this.userData?.isPremium) return;

    try {
      const chart = await this.makeRequest('/natal-chart');
      this.drawNatalChart(chart);
      this.renderPlanetsList(chart);
    } catch (err) {
      console.error('Failed to load natal chart:', err);
    }
  }

  drawNatalChart(chartData) {
    const canvas = document.getElementById('natal-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const outerR = W / 2 - 10;
    const zodiacR = outerR - 8;
    const zodiacInnerR = zodiacR - 30;
    const planetR = zodiacInnerR - 20;

    ctx.clearRect(0, 0, W, H);

    // Background
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
    bgGrad.addColorStop(0, '#0f0c29');
    bgGrad.addColorStop(1, '#1a0533');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fill();

    // Draw zodiac wheel
    const signColors = [
      '#ef4444','#22c55e','#eab308','#06b6d4',
      '#f97316','#84cc16','#8b5cf6','#0ea5e9',
      '#a855f7','#6366f1','#14b8a6','#ec4899'
    ];

    for (let i = 0; i < 12; i++) {
      const startAngle = (i * 30 - 90) * Math.PI / 180;
      const endAngle = ((i + 1) * 30 - 90) * Math.PI / 180;
      const midAngle = startAngle + Math.PI / 12;

      // Segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, zodiacR, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = signColors[i] + '33';
      ctx.fill();
      ctx.strokeStyle = signColors[i] + '66';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Zodiac symbol
      ctx.save();
      ctx.translate(
        cx + (zodiacInnerR + 18) * Math.cos(midAngle),
        cy + (zodiacInnerR + 18) * Math.sin(midAngle)
      );
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.fillStyle = signColors[i];
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ZODIAC_EMOJI[i], 0, 0);
      ctx.restore();
    }

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, zodiacInnerR, 0, Math.PI * 2);
    ctx.fillStyle = '#0f0c29ee';
    ctx.fill();
    ctx.strokeStyle = 'rgba(167,139,250,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // House lines
    if (chartData.houses) {
      ctx.strokeStyle = 'rgba(167,139,250,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const angle = (chartData.houses[i] - 90) * Math.PI / 180;
        const isMainAxis = i % 3 === 0;
        ctx.strokeStyle = isMainAxis ? 'rgba(167,139,250,0.5)' : 'rgba(167,139,250,0.15)';
        ctx.lineWidth = isMainAxis ? 1.5 : 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + 20 * Math.cos(angle), cy + 20 * Math.sin(angle));
        ctx.lineTo(cx + zodiacInnerR * Math.cos(angle), cy + zodiacInnerR * Math.sin(angle));
        ctx.stroke();
      }
    }

    // Planets
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    const planetDots = [];

    for (const planet of planets) {
      if (!chartData[planet]) continue;
      const pos = chartData[planet];
      const signIdx = ZODIAC_SIGNS.indexOf(pos.sign);
      const degInSign = pos.degree + pos.minute / 60;
      const totalDeg = signIdx * 30 + degInSign;
      const angle = (totalDeg - 90) * Math.PI / 180;

      // Avoid overlap
      let r = planetR;
      const existing = planetDots.filter(p => Math.abs(p.angle - angle) < 0.3);
      r -= existing.length * 14;

      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);

      planetDots.push({ angle, px, py });

      // Planet dot
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = signColors[signIdx] || '#a78bfa';
      ctx.fill();

      // Planet emoji
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(PLANET_EMOJIS[planet] || '●', px, py);
    }

    // Center dot
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
    centerGrad.addColorStop(0, '#a78bfa');
    centerGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', cx, cy);
  }

  renderPlanetsList(chartData) {
    const container = document.getElementById('planets-list');
    if (!container) return;

    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'ascendant'];
    container.innerHTML = '';

    for (const planet of planets) {
      if (!chartData[planet]) continue;
      const pos = chartData[planet];
      const signIdx = ZODIAC_SIGNS.indexOf(pos.sign);
      const emoji = ZODIAC_EMOJI[signIdx] || '';
      const planetEmoji = PLANET_EMOJIS[planet] || '';

      const item = document.createElement('div');
      item.className = 'planet-item';
      item.innerHTML = `
        <span class="planet-emoji">${planetEmoji}</span>
        <div class="planet-details">
          <div class="planet-name">${PLANET_NAMES[planet] || planet}</div>
          <div class="planet-sign">${emoji} ${pos.sign}</div>
          <div class="planet-degree">${pos.degree}°${pos.minute}'${pos.retrograde ? ' <span class="retrograde-badge">℞</span>' : ''}</div>
        </div>
      `;
      container.appendChild(item);
    }
  }

  populateSignSelectors() {
    const selects = ['sign1-select', 'sign2-select'];
    for (const id of selects) {
      const select = document.getElementById(id);
      if (!select) continue;
      ZODIAC_SIGNS.forEach((sign, i) => {
        const opt = document.createElement('option');
        opt.value = sign;
        opt.textContent = `${ZODIAC_EMOJI[i]} ${sign}`;
        select.appendChild(opt);
      });
    }

    // Pre-fill with user's sign
    if (this.userData?.chart?.sunSign) {
      document.getElementById('sign1-select').value = this.userData.chart.sunSign;
    }
  }

  async checkCompatibility() {
    const sign1 = document.getElementById('sign1-select').value;
    const sign2 = document.getElementById('sign2-select').value;

    if (!sign1 || !sign2) {
      tg?.showAlert('Выберите оба знака зодиака');
      return;
    }

    const btn = document.getElementById('compat-btn');
    btn.disabled = true;
    btn.textContent = 'Считаю...';

    try {
      const result = await this.makeRequest(`/compatibility?sign1=${encodeURIComponent(sign1)}&sign2=${encodeURIComponent(sign2)}`);
      this.renderCompatibilityResult(result);
    } catch (err) {
      tg?.showAlert(err.message || 'Ошибка загрузки');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Проверить совместимость';
    }
  }

  renderCompatibilityResult(result) {
    const container = document.getElementById('compat-result');
    const s1idx = ZODIAC_SIGNS.indexOf(result.sign1);
    const s2idx = ZODIAC_SIGNS.indexOf(result.sign2);
    const e1 = ZODIAC_EMOJI[s1idx] || '';
    const e2 = ZODIAC_EMOJI[s2idx] || '';

    const areaLabels = { love: '❤️ Любовь', friendship: '🤝 Дружба', work: '💼 Работа', communication: '💬 Общение' };

    let barsHtml = '';
    for (const [key, label] of Object.entries(areaLabels)) {
      const val = result.areas?.[key] || 0;
      barsHtml += `
        <div class="compat-bar-row">
          <span class="compat-bar-label">${label}</span>
          <div class="compat-bar-track">
            <div class="compat-bar-fill" style="width:${val}%"></div>
          </div>
          <span class="compat-bar-value">${val}%</span>
        </div>`;
    }

    container.innerHTML = `
      <div class="compat-percentage">
        <div style="font-size:28px;margin-bottom:8px">${e1} 💕 ${e2}</div>
        <div class="compat-score">${result.percentage}%</div>
        <div class="compat-label">совместимость</div>
      </div>
      <div class="compat-bar-section">${barsHtml}</div>
      <p class="compat-description">${result.description || ''}</p>
    `;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  openSubscribe() {
    if (tg) {
      // Send data to bot to trigger /subscribe flow
      tg.sendData(JSON.stringify({ action: 'subscribe' }));
    }
  }

  sendBotCommand(command) {
    if (tg) {
      tg.sendData(JSON.stringify({ action: 'command', command }));
    }
  }

  openPrivacy() {
    const privacyUrl = window.location.origin + '/privacy';
    if (tg) {
      tg.openLink(privacyUrl);
    } else {
      window.open(privacyUrl, '_blank');
    }
  }
}

// Start the app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new AstroGuruApp();
});
