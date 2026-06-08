const tg = window.Telegram?.WebApp;
const API_BASE = '/api';
const BOT_USERNAME = 'AstroGeniusGuruBot';

const ZODIAC_SIGNS = [
  'Овен','Телец','Близнецы','Рак','Лев','Дева',
  'Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы'
];
const ZODIAC_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_EMOJIS = {
  sun:'☀️',moon:'🌙',mercury:'☿',venus:'♀',mars:'♂',
  jupiter:'♃',saturn:'♄',uranus:'⛢',neptune:'♆',pluto:'♇',ascendant:'↑'
};
const PLANET_NAMES = {
  sun:'Солнце',moon:'Луна',mercury:'Меркурий',venus:'Венера',
  mars:'Марс',jupiter:'Юпитер',saturn:'Сатурн',uranus:'Уран',
  neptune:'Нептун',pluto:'Плутон',ascendant:'Асцендент'
};

class AstroGuruApp {
  constructor() {
    this.userData = null;
    this.currentTab = 'horoscope';
    this.initData = tg?.initData || '';
    const urlParams = new URLSearchParams(window.location.search);
    this.devId = urlParams.get('dev_id') || '';
    this.ascendantOffset = 0;
    this.init();
  }

  async init() {
    if (tg) {
      tg.ready(); tg.expand();
      tg.setHeaderColor('#1a0533'); tg.setBackgroundColor('#1a1a2e');
    }
    this.applyTheme();
    this.setupNavigation();
    this.populateSignSelectors();
    await this.loadUserData();
    this.loadMoonBanner();
    this.loadLuckyCard();
    setTimeout(() => {
      document.getElementById('loading-screen').classList.remove('active');
      document.getElementById('main-app').classList.add('active');
    }, 900);
  }

  applyTheme() {
    if (!tg?.themeParams) return;
    const p = tg.themeParams, r = document.documentElement;
    if (p.bg_color) r.style.setProperty('--tg-bg', p.bg_color);
    if (p.secondary_bg_color) r.style.setProperty('--tg-sec-bg', p.secondary_bg_color);
    if (p.text_color) r.style.setProperty('--tg-text', p.text_color);
    if (p.hint_color) r.style.setProperty('--tg-hint', p.hint_color);
    if (p.button_color) r.style.setProperty('--tg-btn', p.button_color);
  }

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
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
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === `tab-${tab}`));
    if (tab === 'chart' && (this.userData?.isPremium || this.userData?.hasNatalChart)) {
      this.loadNatalChart();
    }
  }

  async makeRequest(endpoint, method = 'GET') {
    const headers = { 'Content-Type': 'application/json' };
    if (this.initData) headers['x-init-data'] = this.initData;
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = (!this.initData && this.devId)
      ? `${API_BASE}${endpoint}${sep}dev_id=${this.devId}` : `${API_BASE}${endpoint}`;
    const response = await fetch(url, { method, headers });
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
      if (this.userData?.chart?.sunSign) {
        const s1 = document.getElementById('sign1-select');
        if (s1) s1.value = this.userData.chart.sunSign;
      }
    } catch (err) {
      console.warn('Failed to load user:', err);
      this.renderGuestMode();
    }
  }

  renderUserData() {
    const u = this.userData;
    if (!u) return;
    const price = u.prices?.subscription || 99;

    document.getElementById('header-sign-name').textContent = u.firstName || 'AstroGuru';

    if (u.chart) {
      const idx = ZODIAC_SIGNS.indexOf(u.chart.sunSign);
      document.getElementById('header-sign-name').textContent = u.chart.sunSign || '—';
      document.getElementById('header-sign-detail').textContent =
        `Луна: ${u.chart.moonSign || '—'} · ↑ ${u.chart.risingSign || '—'}`;
      document.querySelector('.sign-emoji').textContent = ZODIAC_EMOJI[idx] || '✨';
    } else if (u.birthDate) {
      document.getElementById('header-sign-name').textContent = 'Данные загружены';
      document.getElementById('header-sign-detail').textContent = u.birthDate;
    }

    if (u.isPremium) document.getElementById('premium-badge').style.display = 'flex';

    document.getElementById('profile-name').textContent = [u.firstName, u.lastName].filter(Boolean).join(' ');
    let statusText = '🆓 Бесплатный аккаунт';
    if (u.isAdmin) statusText = '👑 Админ · Premium бессрочно';
    else if (u.isPremium) statusText = '⭐ Premium активен';
    else if (u.hasNatalChart) statusText = '🌌 Натальная карта разблокирована';
    document.getElementById('profile-sub-status').textContent = statusText;

    const idx = u.chart ? ZODIAC_SIGNS.indexOf(u.chart.sunSign) : -1;
    document.getElementById('profile-avatar').textContent = idx >= 0 ? ZODIAC_EMOJI[idx] : '✨';
    document.getElementById('prof-birth-date').textContent = u.birthDate || '—';
    document.getElementById('prof-birth-time').textContent = u.birthTime || 'не указано';
    document.getElementById('prof-birth-city').textContent = u.birthCity || 'не указан';

    const subDetails = document.getElementById('sub-details');
    const subBtn = document.getElementById('sub-btn');
    const cancelBtn = document.getElementById('cancel-sub-btn');

    if (u.isAdmin) {
      subDetails.innerHTML = '👑 <strong>Бессрочный Premium</strong> (админ)';
      subBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
    } else if (u.isPremium) {
      const exp = u.subscriptionExpires
        ? new Date(u.subscriptionExpires).toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' })
        : 'бессрочно';
      subDetails.innerHTML = `✅ Premium до <strong>${exp}</strong><br>` +
        (u.autoRenew ? `🔄 Автопродление: ${price} ⭐/мес` : '⏸ Автопродление отключено');
      subBtn.textContent = `🔄 Продлить — ${price} ⭐`;
      subBtn.style.display = 'block';
      cancelBtn.style.display = u.autoRenew ? 'block' : 'none';
    } else {
      subBtn.style.display = 'block';
      subDetails.textContent = `Premium ${price} ⭐/мес — AI-гороскоп, натальная карта, транзиты`;
      subBtn.textContent = `⭐ Premium — ${price} ⭐/мес`;
      cancelBtn.style.display = 'none';
    }

    this.loadHoroscope('daily');

    const hasAccess = u.isPremium || u.hasNatalChart;
    document.getElementById('chart-locked').style.display = hasAccess ? 'none' : 'block';
    document.getElementById('chart-container').style.display = hasAccess ? 'block' : 'none';
    document.getElementById('upgrade-banner').style.display = u.isPremium ? 'none' : 'flex';
  }

  renderGuestMode() {
    document.getElementById('header-sign-name').textContent = 'AstroGuru';
    document.getElementById('header-sign-detail').textContent = 'Откройте бота → /start';
    document.getElementById('horoscope-content').innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--tg-hint)">Откройте бота и введите /start</div>';
  }

  async loadMoonBanner() {
    try {
      const moon = await this.makeRequest('/moon');
      const el = document.getElementById('moon-banner');
      el.style.display = 'block';
      el.innerHTML = `${moon.emoji} <strong>${moon.phase}</strong> · Луна в ${moon.sign} (${moon.illumination}%)`;
    } catch { /* skip */ }
  }

  async loadLuckyCard() {
    try {
      const lucky = await this.makeRequest('/lucky');
      const el = document.getElementById('lucky-card');
      el.style.display = 'block';
      el.innerHTML = `🍀 <strong>Счастливый день</strong> · Числа: ${lucky.numbers.join(', ')} · Цвет: ${lucky.color} · 💎 ${lucky.stone}`;
    } catch { /* skip */ }
  }

  async loadHoroscope(type) {
    const container = document.getElementById('horoscope-content');
    container.innerHTML = '<div class="skeleton-loading"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>';
    const endpoints = { daily:'/horoscope/daily', weekly:'/horoscope/weekly', monthly:'/horoscope/monthly' };
    try {
      const data = await this.makeRequest(endpoints[type] || endpoints.daily);
      container.innerHTML = this.renderMarkdown(data.content || '');
    } catch (err) {
      if (err.message?.includes('Premium')) {
        container.innerHTML = this.renderPremiumRequired();
      } else if (err.message?.includes('дату рождения') || err.message?.includes('Birth')) {
        container.innerHTML = `<div style="text-align:center;padding:24px">
          <div style="font-size:40px;margin-bottom:12px">📅</div>
          <div style="font-weight:600;margin-bottom:8px">Укажите дату рождения</div>
          <div style="color:var(--tg-hint);margin-bottom:16px">Для персонального гороскопа нужны ваши данные</div>
          <button class="btn-primary" onclick="app.openSettings()">⚙️ Указать в боте</button>
        </div>`;
      } else {
        container.innerHTML = `<div style="color:var(--tg-hint);text-align:center;padding:20px">${err.message}</div>`;
      }
    }
  }

  renderPremiumRequired() {
    const price = this.userData?.prices?.subscription || 99;
    return `<div style="text-align:center;padding:20px">
      <div style="font-size:48px;margin-bottom:12px">🔒</div>
      <div style="font-size:16px;font-weight:700;color:var(--gold);margin-bottom:8px">Доступно в Premium</div>
      <button class="btn-subscribe" onclick="app.openSubscribe()">⭐ Premium — ${price} ⭐/мес</button>
    </div>`;
  }

  renderMarkdown(text) {
    return text.replace(/\*\*(.*?)\*\*/g,'<strong class="md-bold">$1</strong>')
      .replace(/\*(.*?)\*/g,'<em class="md-italic">$1</em>')
      .replace(/_(.*?)_/g,'<em class="md-italic">$1</em>')
      .replace(/\n/g,'<br>');
  }

  async loadNatalChart() {
    if (!this.userData?.isPremium && !this.userData?.hasNatalChart) return;
    try {
      const chart = await this.makeRequest('/natal-chart');
      this.ascendantOffset = chart.ascendant?.longitude || 0;
      this.drawNatalChart(chart);
      this.renderPlanetsList(chart);
      const interp = document.getElementById('chart-interpretation');
      if (chart.interpretation) {
        interp.innerHTML = `<h3 style="margin-bottom:8px;color:var(--accent)">📖 Интерпретация (${chart.monthKey})</h3>` +
          this.renderMarkdown(chart.interpretation);
      }
    } catch (err) {
      console.error('Chart error:', err);
    }
  }

  drawNatalChart(chartData) {
    const canvas = document.getElementById('natal-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
    const outerR = W/2 - 12, zodiacR = outerR - 6, zodiacInnerR = zodiacR - 32, planetR = zodiacInnerR - 22;
    const ascOffset = this.ascendantOffset;

    ctx.clearRect(0, 0, W, H);
    const bgGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,outerR);
    bgGrad.addColorStop(0,'#0f0c29'); bgGrad.addColorStop(1,'#1a0533');
    ctx.fillStyle = bgGrad;
    ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2); ctx.fill();

    const signColors = ['#ef4444','#22c55e','#eab308','#06b6d4','#f97316','#84cc16',
      '#8b5cf6','#0ea5e9','#a855f7','#6366f1','#14b8a6','#ec4899'];

    // Zodiac ring — rotated so ascendant is at 9 o'clock (left)
    for (let i = 0; i < 12; i++) {
      const startAngle = ((i * 30 - ascOffset) - 90) * Math.PI / 180;
      const endAngle = (((i+1) * 30 - ascOffset) - 90) * Math.PI / 180;
      const midAngle = startAngle + Math.PI / 12;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,zodiacR,startAngle,endAngle); ctx.closePath();
      ctx.fillStyle = signColors[i] + '44'; ctx.fill();
      ctx.strokeStyle = signColors[i] + '88'; ctx.lineWidth = 1; ctx.stroke();
      ctx.save();
      ctx.translate(cx + (zodiacInnerR+20)*Math.cos(midAngle), cy + (zodiacInnerR+20)*Math.sin(midAngle));
      ctx.rotate(midAngle + Math.PI/2);
      ctx.fillStyle = signColors[i]; ctx.font = '13px Arial'; ctx.textAlign = 'center';
      ctx.fillText(ZODIAC_EMOJI[i], 0, 0); ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx,cy,zodiacInnerR,0,Math.PI*2);
    ctx.fillStyle = '#0f0c29ee'; ctx.fill();
    ctx.strokeStyle = 'rgba(167,139,250,0.4)'; ctx.stroke();

    // House cusps
    if (chartData.houses) {
      for (let i = 0; i < 12; i++) {
        const angle = ((chartData.houses[i] - ascOffset) - 90) * Math.PI / 180;
        const isAxis = i === 0 || i === 3 || i === 6 || i === 9;
        ctx.strokeStyle = isAxis ? 'rgba(167,139,250,0.6)' : 'rgba(167,139,250,0.15)';
        ctx.lineWidth = isAxis ? 1.5 : 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + 18*Math.cos(angle), cy + 18*Math.sin(angle));
        ctx.lineTo(cx + zodiacInnerR*Math.cos(angle), cy + zodiacInnerR*Math.sin(angle));
        ctx.stroke();
        if (isAxis) {
          ctx.fillStyle = 'rgba(167,139,250,0.7)'; ctx.font = '9px Inter';
          ctx.fillText(String(i+1), cx + (zodiacInnerR-8)*Math.cos(angle), cy + (zodiacInnerR-8)*Math.sin(angle));
        }
      }
    }

    // Planets
    const planets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
    const dots = [];
    for (const planet of planets) {
      if (!chartData[planet]) continue;
      const pos = chartData[planet];
      const totalDeg = pos.sign ? (ZODIAC_SIGNS.indexOf(pos.sign)*30 + pos.degree + pos.minute/60) : pos.longitude;
      const angle = ((totalDeg - ascOffset) - 90) * Math.PI / 180;
      let r = planetR - dots.filter(p => Math.abs(p.angle-angle)<0.25).length * 13;
      const px = cx + r*Math.cos(angle), py = cy + r*Math.sin(angle);
      dots.push({angle, px, py});
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2);
      ctx.fillStyle = signColors[ZODIAC_SIGNS.indexOf(pos.sign)] || '#a78bfa'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.fillText(PLANET_EMOJIS[planet]||'●', px, py+1);
    }

    // Ascendant marker at left (9 o'clock)
    ctx.beginPath(); ctx.arc(cx-planetR+5, cy, 4, 0, Math.PI*2);
    ctx.fillStyle = '#fbbf24'; ctx.fill();
    ctx.font = '10px Arial'; ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'left';
    ctx.fillText('ASC', cx-planetR+12, cy+4);

    ctx.font = '18px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#a78bfa';
    ctx.fillText('✦', cx, cy);
  }

  renderPlanetsList(chartData) {
    const container = document.getElementById('planets-list');
    if (!container) return;
    const planets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','ascendant'];
    container.innerHTML = '';
    for (const planet of planets) {
      if (!chartData[planet]) continue;
      const pos = chartData[planet];
      const signIdx = ZODIAC_SIGNS.indexOf(pos.sign);
      const item = document.createElement('div');
      item.className = 'planet-item';
      item.innerHTML = `<span class="planet-emoji">${PLANET_EMOJIS[planet]}</span>
        <div class="planet-details">
          <div class="planet-name">${PLANET_NAMES[planet]}</div>
          <div class="planet-sign">${ZODIAC_EMOJI[signIdx]} ${pos.sign}</div>
          <div class="planet-degree">${pos.degree}°${pos.minute}'${pos.retrograde?' <span class="retrograde-badge">℞</span>':''}</div>
        </div>`;
      container.appendChild(item);
    }
  }

  populateSignSelectors() {
    ['sign1-select','sign2-select'].forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      ZODIAC_SIGNS.forEach((sign,i) => {
        const opt = document.createElement('option');
        opt.value = sign; opt.textContent = `${ZODIAC_EMOJI[i]} ${sign}`;
        select.appendChild(opt);
      });
    });
  }

  async checkCompatibility() {
    const sign1 = document.getElementById('sign1-select').value;
    const sign2 = document.getElementById('sign2-select').value;
    if (!sign1 || !sign2) { tg?.showAlert('Выберите оба знака'); return; }
    const btn = document.getElementById('compat-btn');
    btn.disabled = true; btn.textContent = 'Считаю...';
    try {
      const result = await this.makeRequest(`/compatibility?sign1=${encodeURIComponent(sign1)}&sign2=${encodeURIComponent(sign2)}`);
      this.renderCompatibilityResult(result);
    } catch (err) { tg?.showAlert(err.message); }
    finally { btn.disabled = false; btn.textContent = 'Проверить совместимость'; }
  }

  renderCompatibilityResult(result) {
    const container = document.getElementById('compat-result');
    const e1 = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(result.sign1)] || '';
    const e2 = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(result.sign2)] || '';
    const areas = { love:'❤️ Любовь', friendship:'🤝 Дружба', work:'💼 Работа', communication:'💬 Общение' };
    let bars = '';
    for (const [k,l] of Object.entries(areas)) {
      const v = result.areas?.[k] || 0;
      bars += `<div class="compat-bar-row"><span class="compat-bar-label">${l}</span>
        <div class="compat-bar-track"><div class="compat-bar-fill" style="width:${v}%"></div></div>
        <span class="compat-bar-value">${v}%</span></div>`;
    }
    container.innerHTML = `<div class="compat-percentage"><div style="font-size:28px">${e1} 💕 ${e2}</div>
      <div class="compat-score">${result.percentage}%</div><div class="compat-label">совместимость</div></div>
      <div class="compat-bar-section">${bars}</div>
      <p class="compat-description">${result.description||''}</p>`;
    container.style.display = 'block';
  }

  async openSubscribe() {
    if (!tg) { alert('Откройте через Telegram'); return; }
    if (this.userData?.isPremium && !this.userData?.isAdmin) {
      tg.showAlert('✅ У вас уже есть Premium!\n\nОтменить автопродление — кнопка ниже.');
      return;
    }
    const price = this.userData?.prices?.subscription || 99;
    const agreed = confirm(
      `Условия подписки Premium:\n\n` +
      `• ${price} ⭐ в месяц\n` +
      `• Автосписание каждые 30 дней\n` +
      `• Отмена в любой момент\n` +
      `• После отмены Premium до конца оплаченного периода\n\n` +
      `Согласны?`
    );
    if (!agreed) return;
    try {
      const r = await this.makeRequest('/invoice/subscribe', 'POST');
      tg.showAlert(r.message || 'Счёт отправлен! Проверьте чат с ботом.');
      tg.close();
    } catch (err) {
      tg.showAlert(err.message || 'Ошибка. Попробуйте /subscribe в боте.');
    }
  }

  async buyNatalChart() {
    if (!tg) { alert('Откройте через Telegram'); return; }
    try {
      const r = await this.makeRequest('/invoice/natal-chart', 'POST');
      tg.showAlert(r.message || 'Счёт отправлен! Проверьте чат с ботом.');
      tg.close();
    } catch (err) {
      tg.showAlert(err.message || 'Ошибка. Попробуйте /buy_chart в боте.');
    }
  }

  async cancelSubscription() {
    if (!tg) return;
    const ok = confirm('Отключить автопродление? Подписка останется до конца оплаченного периода.');
    if (!ok) return;
    try {
      await this.makeRequest('/cancel-subscription', 'POST');
      tg.showAlert('✅ Автопродление отключено');
      await this.loadUserData();
    } catch (err) { tg.showAlert(err.message); }
  }

  openSettings() {
    const url = `https://t.me/${BOT_USERNAME}?start=settings`;
    if (tg) tg.openTelegramLink(url);
    else window.open(url, '_blank');
  }

  async sendBotCommand(command) {
    const cmd = command.replace('/', '');
    switch (cmd) {
      case 'today':
        this.switchTab('horoscope');
        document.querySelectorAll('.htab').forEach(b => b.classList.toggle('active', b.dataset.htype === 'daily'));
        await this.loadHoroscope('daily');
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'moon': {
        const moon = await this.makeRequest('/moon');
        if (tg) tg.showAlert(`${moon.emoji} ${moon.phase}\nЛуна в ${moon.sign}\n\n${moon.advice}`);
        break;
      }
      case 'lucky':
        await this.showLuckyDay();
        break;
      case 'transits':
        await this.showTransits();
        break;
      default:
        if (tg) tg.openTelegramLink(`https://t.me/${BOT_USERNAME}?start=${cmd}`);
    }
  }

  openPrivacy() {
    const url = window.location.origin + '/privacy';
    if (tg) tg.openLink(url); else window.open(url, '_blank');
  }

  showActionResult(html) {
    const el = document.getElementById('profile-action-result');
    if (!el) return;
    el.innerHTML = html;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async showLuckyDay() {
    try {
      const lucky = await this.makeRequest('/lucky');
      this.showActionResult(
        `<div style="font-size:16px;font-weight:700;margin-bottom:10px">🍀 Счастливый день — ${lucky.sign}</div>` +
        `<div>🔢 <strong>Числа:</strong> ${lucky.numbers.join(', ')}</div>` +
        `<div>🎨 <strong>Цвет:</strong> ${lucky.color}</div>` +
        `<div>💎 <strong>Камень:</strong> ${lucky.stone}</div>` +
        `<div>⏰ <strong>Лучшее время:</strong> ${lucky.bestTime}</div>` +
        `<div style="margin-top:8px;color:var(--tg-hint);font-size:12px">Используйте для важных дел сегодня</div>`
      );
      await this.loadLuckyCard();
    } catch (err) {
      if (tg) tg.showAlert(err.message);
    }
  }

  async showTransits() {
    try {
      const data = await this.makeRequest('/transits');
      if (!data.transits?.length) {
        this.showActionResult('🪐 <strong>Сегодня спокойный день</strong><br>Нет сильных транзитов к вашей карте.');
        return;
      }
      let html = `<div style="font-size:16px;font-weight:700;margin-bottom:6px">🪐 Влияние планет сегодня</div>` +
        `<div style="color:var(--tg-hint);font-size:12px;margin-bottom:12px">${data.description}</div>`;
      for (const t of data.transits) {
        const icon = t.energy === 'harmonious' ? '✅' : t.energy === 'challenging' ? '⚠️' : '➡️';
        html += `<div style="margin-bottom:10px">${icon} <strong>${t.text}</strong>` +
          (t.hint ? `<div style="color:var(--tg-hint);font-size:12px;margin-top:2px">${t.hint}</div>` : '') +
          `</div>`;
      }
      this.showActionResult(html);
    } catch (err) {
      if (err.message?.includes('дату')) {
        this.showActionResult('📅 <strong>Нужна дата рождения</strong><br><button class="btn-primary" style="margin-top:10px" onclick="app.openSettings()">Указать в боте</button>');
      } else if (tg) tg.showAlert(err.message);
    }
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => { app = new AstroGuruApp(); });
