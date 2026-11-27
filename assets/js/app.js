/* ═══════════════════════════════════════════════════════════════
   قلموم — سازنده قرارداد طراحی | Application Logic
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ───────── Supabase (publishable key — safe for browser w/ RLS) ───────── */
const SUPABASE_URL = 'https://wtgtyvyvzxfvolixkkri.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HZ4WpF02Di71sPdo45XkbA_v1Z_Yq--';

async function supabaseInsert(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(row)
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Supabase ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  return true;
}

/* ───────── utilities ───────── */
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const faDigits = s => String(s).replace(/\d/g, d => FA_DIGITS[+d]);
const faNum = n => faDigits(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const $ = (s, ctx) => (ctx || document).querySelector(s);
const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));
const faOnly = s => String(s).replace(/[۰-۹]/g, d => String(FA_DIGITS.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const digitsOnly = s => faOnly(s).replace(/\D/g, '');
const md5ish = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const toastEl = $('#toast');
let toastTimer = null;
function toast(message, type) {
  toastEl.textContent = message;
  toastEl.classList.toggle('error', type === 'error');
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4200);
}

/* ───────── static option data ───────── */
const CONTRACT_TYPES = [
  { id: 'logo',        label: 'قرارداد طراحی لوگو' },
  { id: 'identity',    label: 'قرارداد طراحی هویت بصری' },
  { id: 'font',        label: 'قرارداد طراحی فونت' },
  { id: 'packaging',   label: 'قرارداد طراحی بسته‌بندی' },
  { id: 'poster',      label: 'قرارداد طراحی پوستر و بنر' },
  { id: 'catalog',     label: 'قرارداد طراحی کاتالوگ و بروشور' },
  { id: 'uiux',        label: 'قرارداد طراحی رابط کاربری' },
  { id: 'illustration',label: 'قرارداد تصویرسازی' },
  { id: 'motion',      label: 'قرارداد موشن‌گرافیک' },
  { id: 'stationery',  label: 'قرارداد طراحی ست اداری' }
];

const PAYMENT_OPTIONS = [
  { id: '50-50',     label: '۵۰٪ پیش‌پرداخت — ۵۰٪ هنگام تحویل' },
  { id: '30-40-30',  label: '۳۰٪ شروع — ۴۰٪ تأیید طرح — ۳۰٪ تحویل' },
  { id: '70-30',     label: '۷۰٪ پیش‌پرداخت — ۳۰٪ هنگام تحویل' },
  { id: 'full-before',   label: 'پرداخت کامل پیش از شروع کار' },
  { id: 'full-delivery', label: 'پرداخت کامل هنگام تحویل' }
];

const RIGHTS_OPTIONS = [
  { id: 'full-transfer',   label: 'انتقال کامل حقوق مادی پس از تسویه' },
  { id: 'limited-business',label: 'انتقال محدود به حوزه کسب‌وکار کارفرما' },
  { id: 'no-transfer',     label: 'بدون انتقال؛ فقط حق استفاده' }
];

const PORTFOLIO_OPTIONS = [
  { id: 'allowed',      label: 'طراح مجاز است اثر را در نمونه‌کار نمایش دهد' },
  { id: 'after-release',label: 'فقط پس از انتشار عمومی اثر' },
  { id: 'not-allowed',  label: 'نمایش در نمونه‌کار مجاز نیست' }
];

const DISPUTE_OPTIONS = [
  { id: 'negotiation-arbitration', label: 'مذاکره، سپس داوری انجمن صنفی طراحان گرافیک ایران' },
  { id: 'negotiation-council',     label: 'مذاکره، سپس شورای حل اختلاف' },
  { id: 'court',                   label: 'مراجعه مستقیم به مراجع قضایی' }
];

const DELIVERABLES = [
  'فایل برداری AI',
  'فایل برداری SVG',
  'PNG با پس‌زمینه شفاف',
  'JPG',
  'PDF',
  'EPS',
  'نسخه تکرنگ',
  'نسخه افقی و عمودی',
  'گایدلاین استفاده',
  'فایل‌های سورس'
];

const clauseTemplates = () => ([
  { id: 'clause-subject', enabled: true, title: 'موضوع قرارداد',
    body: 'موضوع این قرارداد، «{{business}}» در چارچوب «{{typeLabel}}» است. جزئیات اجرایی مطابق مشخصات اعلام‌شده توسط طرف اول و توافق کتبی طرفین انجام می‌شود.' },
  { id: 'clause-duration', enabled: true, title: 'مدت قرارداد و زمان‌بندی',
    body: 'مدت اجرای موضوع قرارداد {{duration}} روز کاری از تاریخ {{date}} (یا از تاریخ واریز پیش‌پرداخت، هر کدام مؤخر باشد) است. طرف اول موظف است اطلاعات و مصالح لازم را به‌موقع تحویل دهد. هرگونه تأخیر در پرداخت یا تحویل اطلاعات، به همان میزان به زمان اجرای تعهدات طرف دوم افزوده می‌شود. تعداد مراحل اصلاح رایگان در محدوده توافق: {{revisions}} نوبت.' },
  { id: 'clause-fee', enabled: true, title: 'مبلغ قرارداد و شیوه پرداخت',
    body: 'مبلغ کل قرارداد {{amount}} تومان است و مبلغ خالص دریافتی طرف دوم محسوب می‌شود؛ پرداخت هرگونه کسورات قانونی بر عهده طرف اول است. نحوه پرداخت: {{payment}}.' },
  { id: 'clause-delivery', enabled: true, title: 'تحویل و خروجی‌ها',
    body: 'طرف دوم پس از تأیید نهایی، خروجی‌های زیر را تحویل می‌دهد: {{deliverables}}. تحویل خارج از این فهرست منوط به توافق جداگانه و هزینه احتمالی است.' },
  { id: 'clause-employer', enabled: true, title: 'تعهدات طرف اول (کارفرما)',
    body: 'طرف اول متعهد است اطلاعات لازم را به‌موقع در اختیار طرف دوم قرار دهد، از میان پیش‌طرح‌ها یکی را انتخاب کند، بازبینی محتوا را بر عهده گیرد و در صورت درخواست تغییرات خارج از محدوده توافق یا پس از تأیید طرح، هزینه اعلام‌شده توسط طرف دوم را بپردازد. واگذاری موازی موضوع قرارداد به شخص دیگر بدون اطلاع طرف دوم، حق فسخ یک‌طرفه برای طرف دوم ایجاد می‌کند.' },
  { id: 'clause-designer', enabled: true, title: 'تعهدات طرف دوم (طراح)',
    body: 'طرف دوم موظف است اطلاعات ارائه‌شده را بررسی کند، موضوع قرارداد را با اصلاحات توافقی به اتمام برساند و طرح نهایی را تحویل دهد. طرف دوم موظف به حفظ اطلاعات محرمانه طرف اول است و حق افشای اسرار شغلی را ندارد.' },
  { id: 'clause-rights', enabled: true, title: 'مالکیت معنوی و نمونه‌کار',
    body: 'وضعیت حقوق مادی اثر: {{rights}}. {{portfolio}}. استفاده خارج از موضوع قرارداد بدون رضایت کتبی طرف دوم، مشمول خسارت طبق نرخ‌نامه رسمی انجمن صنفی طراحان گرافیک ایران است. طرف دوم حق دارد امضای خود را در محل مناسب اثر درج کند مگر خلاف آن توافق شود.' },
  { id: 'clause-termination', enabled: true, title: 'فسخ قرارداد',
    body: 'در صورت تمایل هر یک از طرفین به فسخ، باید با ذکر دلایل و پرداخت هزینه و خسارات مربوط، موضوع را کتباً اعلام کنند. فوت، حجر یا ورشکستگی هر یک از طرفین نیز از موجبات فسخ است.' },
  { id: 'clause-dispute', enabled: true, title: 'حل اختلاف و قوه قهریه',
    body: 'روش حل اختلاف: {{dispute}}. در صورت حدوث قوه قهریه، مدت قرارداد تا رفع مانع قابل تمدید است و در صورت تداوم بیش از شش ماه، هر یک از طرفین می‌توانند قرارداد را خاتمه دهند.' },
  { id: 'clause-execution', enabled: true, title: 'اجرای قرارداد',
    body: 'این قرارداد بر اساس ماده ۱۰ قانون مدنی و اصل حاکمیت اراده تنظیم شده و پس از امضای طرفین در دو نسخه هم‌ارزش، لازم‌الاجرا است. در مواردی که مبلغ یا شرح خدمات صراحتاً ذکر نشده باشد، تعهد پرداخت بر اساس نرخ‌نامه رسمی انجمن صنفی طراحان گرافیک ایران خواهد بود.' }
]);

/* ───────── state ───────── */
const LS_STATE = 'ghalamoom_state_v1';
const LS_THEME = 'ghalamoom_theme';
const LS_DEADLINE = 'ghalamoom_sale_deadline';
const LS_REGISTERED = 'ghalamoom_registered_hash';

const state = {
  step: 1,
  maxReached: 1,
  contractTypeId: 'logo',
  deliverables: ['PDF'],
  payment: '70-30',
  rights: 'full-transfer',
  portfolio: 'allowed',
  dispute: 'negotiation-arbitration',
  clauses: clauseTemplates(),
  logoDataUrl: null,
  logoName: null,
  registeredId: null
};

/* ───────── helpers to read form ───────── */
const field = id => $('#' + id);

function formData() {
  return {
    employerName: field('employerName').value.trim(),
    employerNationalId: digitsOnly(field('employerNationalId').value),
    employerPhone: faOnly(field('employerPhone').value).trim(),
    employerAddress: field('employerAddress').value.trim(),
    designerName: field('designerName').value.trim(),
    designerNationalId: digitsOnly(field('designerNationalId').value),
    designerPhone: faOnly(field('designerPhone').value).trim(),
    associationId: field('associationId').value.trim(),
    designerAddress: field('designerAddress').value.trim(),
    businessName: field('businessName').value.trim(),
    totalAmount: parseInt(digitsOnly(field('totalAmount').value) || '0', 10),
    durationDays: parseInt(faOnly(field('durationDays').value) || '0', 10),
    startDate: faOnly(field('startDate').value).trim(),
    revisions: parseInt(faOnly(field('revisions').value) || '0', 10)
  };
}

const typeLabel = id => (CONTRACT_TYPES.find(t => t.id === id) || CONTRACT_TYPES[0]).label;
const labelOf = (list, id) => (list.find(o => o.id === id) || list[0]).label;

/* ───────── countdown ───────── */
function initCountdown() {
  let deadline = Number(localStorage.getItem(LS_DEADLINE) || 0);
  if (!deadline || deadline < Date.now()) {
    deadline = Date.now() + ((1 * 86400 + 8 * 3600 + 15 * 60 + 22) * 1000);
    localStorage.setItem(LS_DEADLINE, String(deadline));
  }
  const dEl = $('#cd-days'), hEl = $('#cd-hours'), mEl = $('#cd-minutes'), sEl = $('#cd-seconds');
  const pad = n => faDigits(String(n).padStart(2, '0'));
  const tick = () => {
    let diff = Math.max(0, deadline - Date.now());
    dEl.textContent = pad(Math.floor(diff / 86400000)); diff %= 86400000;
    hEl.textContent = pad(Math.floor(diff / 3600000)); diff %= 3600000;
    mEl.textContent = pad(Math.floor(diff / 60000)); diff %= 60000;
    sEl.textContent = pad(Math.floor(diff / 1000));
  };
  tick();
  setInterval(tick, 1000);
}

/* ───────── theme ───────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(LS_THEME, theme);
  const isLight = theme === 'light';
  $$('.icon-moon').forEach(el => el.style.display = isLight ? 'none' : '');
  $$('.icon-sun').forEach(el => el.style.display = isLight ? '' : 'none');
}
function initTheme() {
  const saved = localStorage.getItem(LS_THEME) || 'dark';
  applyTheme(saved);
  $('#themeToggleBtn').addEventListener('click', () => {
    applyTheme((document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark');
  });
  const drawerBtn = $('#drawerThemeBtn');
  if (drawerBtn) drawerBtn.addEventListener('click', () => {
    applyTheme((document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark');
  });
}

/* ───────── option group builders ───────── */
function renderRadioGroup(containerId, options, selectedId, onChange) {
  const container = $('#' + containerId);
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt-row' + (opt.id === selectedId ? ' is-selected' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(opt.id === selectedId));
    btn.innerHTML = `<span class="radio" aria-hidden="true"></span><span class="opt-label">${escapeHtml(opt.label)}</span>`;
    btn.addEventListener('click', () => {
      $$('.opt-row', container).forEach(r => { r.classList.remove('is-selected'); r.setAttribute('aria-checked', 'false'); });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-checked', 'true');
      onChange(opt.id);
    });
    container.appendChild(btn);
  });
}

function renderContractTypes() {
  const container = $('#contractTypeList');
  container.innerHTML = '';
  CONTRACT_TYPES.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt-row' + (t.id === state.contractTypeId ? ' is-selected' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(t.id === state.contractTypeId));
    btn.dataset.typeId = t.id;
    btn.innerHTML = `<span class="radio" aria-hidden="true"></span><span class="opt-label">${escapeHtml(t.label)}</span>`;
    btn.addEventListener('click', () => selectContractType(t.id));
    container.appendChild(btn);
  });
}

function selectContractType(id) {
  state.contractTypeId = id;
  renderContractTypes();
  $('#step2TypeLabel').textContent = typeLabel(id);
  $('#step1Note').textContent = 'یک قرارداد انتخاب شد ✓';
  touchClauses();
  schedulePersist();
  renderPreview();
}

function renderDeliverables() {
  const container = $('#deliverablesGroup');
  container.innerHTML = '';
  DELIVERABLES.forEach(item => {
    const checked = state.deliverables.includes(item);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt-row opt-row-split' + (checked ? ' is-selected' : '');
    btn.setAttribute('aria-pressed', String(checked));
    btn.innerHTML = `<span class="row-label">${escapeHtml(item)}</span>
      <span class="opt-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5L19.5 6.5"/></svg></span>`;
    btn.addEventListener('click', () => {
      if (state.deliverables.includes(item)) state.deliverables = state.deliverables.filter(d => d !== item);
      else state.deliverables.push(item);
      btn.classList.toggle('is-selected');
      btn.setAttribute('aria-pressed', String(state.deliverables.includes(item)));
      touchClauses();
      schedulePersist();
      renderPreview();
    });
    container.appendChild(btn);
  });
}

/* ───────── validation ───────── */
function validateForm(showErrors) {
  const f = formData();
  const checks = [
    ['employerName', f.employerName.length >= 2],
    ['employerNationalId', /^\d{10,11}$/.test(f.employerNationalId)],
    ['designerName', f.designerName.length >= 2],
    ['designerNationalId', /^\d{10,11}$/.test(f.designerNationalId)],
    ['businessName', f.businessName.length >= 1],
    ['totalAmount', f.totalAmount > 0],
    ['durationDays', f.durationDays >= 1 && f.durationDays <= 365],
    ['startDate', /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(f.startDate)]
  ];
  const missing = checks.filter(c => !c[1]).length;
  checks.forEach(([id, ok]) => {
    const el = field(id);
    el.classList.toggle('is-invalid', showErrors && !ok);
    if (showErrors && ok) el.classList.remove('is-invalid');
  });
  return { valid: missing === 0, missing };
}

function updateStep2Note() {
  const { missing } = validateForm(false);
  const note = $('#step2Note');
  if (missing === 0) { note.textContent = 'همه‌ی فیلدهای الزامی کامل شد ✓'; note.classList.add('ok'); }
  else { note.textContent = `${faDigits(missing)} مورد الزامی باقی مانده است`; note.classList.remove('ok'); }
}

/* ───────── clause engine ───────── */
function clauseTokens() {
  const f = formData();
  const payment = labelOf(PAYMENT_OPTIONS, state.payment);
  return {
    '{{business}}': f.businessName || 'پروژه',
    '{{typeLabel}}': typeLabel(state.contractTypeId),
    '{{duration}}': f.durationDays ? faDigits(f.durationDays) : '…',
    '{{date}}': f.startDate || '…',
    '{{revisions}}': faDigits(f.revisions || 0),
    '{{amount}}': f.totalAmount ? faNum(f.totalAmount) : '…',
    '{{payment}}': payment,
    '{{deliverables}}': state.deliverables.length ? state.deliverables.join('، ') : '—',
    '{{rights}}': labelOf(RIGHTS_OPTIONS, state.rights),
    '{{portfolio}}': labelOf(PORTFOLIO_OPTIONS, state.portfolio),
    '{{dispute}}': labelOf(DISPUTE_OPTIONS, state.dispute)
  };
}

function resolveTokens(text) {
  let out = String(text);
  const tokens = clauseTokens();
  Object.keys(tokens).forEach(k => { out = out.split(k).join(tokens[k]); });
  return out;
}

/* regenerate bodies of clauses the user hasn't manually edited */
function touchClauses() {
  state.clauses.forEach(c => {
    if (!c.dirty) {
      const tpl = clauseTemplates().find(t => t.id === c.id);
      if (tpl) c.body = resolveTokens(tpl.body);
    }
  });
}

function renderClauseList() {
  const list = $('#clauseList');
  list.innerHTML = '';
  state.clauses.forEach((clause, index) => {
    const card = document.createElement('div');
    card.className = 'clause-card' + (clause.enabled ? ' is-active' : ' is-disabled');
    card.dataset.clauseId = clause.id;
    card.innerHTML = `
      <div class="clause-top">
        <label class="clause-toggle">
          <input type="checkbox" class="clause-enabled" ${clause.enabled ? 'checked' : ''} aria-label="فعال در قرارداد">
          فعال در قرارداد
        </label>
        <span class="clause-num">${faDigits(index + 1)}</span>
        <span class="clause-actions">
          <button type="button" class="clause-act" data-action="up" aria-label="بند را بالا ببر" ${index === 0 ? 'disabled' : ''}><svg><use href="#i-up"/></svg></button>
          <button type="button" class="clause-act" data-action="down" aria-label="بند را پایین ببر" ${index === state.clauses.length - 1 ? 'disabled' : ''}><svg><use href="#i-down"/></svg></button>
          <button type="button" class="clause-act danger" data-action="remove" aria-label="حذف بند"><svg><use href="#i-x"/></svg></button>
        </span>
      </div>
      <label>عنوان بند</label>
      <input type="text" class="clause-title" value="${escapeHtml(clause.title)}" aria-label="عنوان بند">
      <label>متن بند</label>
      <textarea class="clause-body" aria-label="متن بند">${escapeHtml(clause.body)}</textarea>`;

    card.querySelector('.clause-enabled').addEventListener('change', e => {
      clause.enabled = e.target.checked;
      card.classList.toggle('is-active', clause.enabled);
      card.classList.toggle('is-disabled', !clause.enabled);
      updateClauseCounter();
      schedulePersist();
      renderPreview();
    });
    card.querySelector('.clause-title').addEventListener('input', e => {
      clause.title = e.target.value;
      clause.dirty = true;
      schedulePersist();
      renderPreview();
    });
    card.querySelector('.clause-body').addEventListener('input', e => {
      clause.body = e.target.value;
      clause.dirty = true;
      schedulePersist();
      renderPreview();
    });
    card.querySelectorAll('.clause-act').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const i = state.clauses.findIndex(c => c.id === clause.id);
        if (action === 'up' && i > 0) [state.clauses[i - 1], state.clauses[i]] = [state.clauses[i], state.clauses[i - 1]];
        else if (action === 'down' && i < state.clauses.length - 1) [state.clauses[i + 1], state.clauses[i]] = [state.clauses[i], state.clauses[i + 1]];
        else if (action === 'remove') {
          state.clauses.splice(i, 1);
          toast('بند حذف شد');
        }
        renderClauseList();
        updateClauseCounter();
        schedulePersist();
        renderPreview();
      });
    });
    list.appendChild(card);
  });
  updateClauseCounter();
}

function updateClauseCounter() {
  const active = state.clauses.filter(c => c.enabled).length;
  $('#clauseCountNote').textContent = `${faDigits(active)} بند فعال`;
}

/* ───────── contract document builder (shared by preview / modal / word / pdf) ───────── */
function buildContractHTML(includeFooter) {
  const f = formData();
  const tLabel = typeLabel(state.contractTypeId);
  const enabled = state.clauses.filter(c => c.enabled);
  const activeClauses = enabled.map((c, i) => `
    <h3>ماده ${faDigits(i + 1)} – ${escapeHtml(resolveTokens(c.title))}</h3>
    <p>${escapeHtml(resolveTokens(c.body))}</p>`).join('');

  const headerMeta = `
    <div class="a4-meta">
      <div><b>طرف اول (کارفرما):</b> ${escapeHtml(f.employerName || '—')} — کد ملی / شناسه: <span dir="ltr">${escapeHtml(f.employerNationalId || '—')}</span>${f.employerPhone ? ` — تماس: <span dir="ltr">${escapeHtml(f.employerPhone)}</span>` : ''}${f.employerAddress ? `<br><span style="padding-inline-start:1.2em">${escapeHtml(f.employerAddress)}</span>` : ''}</div>
      <div><b>طرف دوم (طراح):</b> ${escapeHtml(f.designerName || '—')} — کد ملی: <span dir="ltr">${escapeHtml(f.designerNationalId || '—')}</span>${f.designerPhone ? ` — تماس: <span dir="ltr">${escapeHtml(f.designerPhone)}</span>` : ''}${f.associationId ? ` — عضویت انجمن: <span dir="ltr">${escapeHtml(f.associationId)}</span>` : ''}${f.designerAddress ? `<br><span style="padding-inline-start:1.2em">${escapeHtml(f.designerAddress)}</span>` : ''}</div>
      <div><b>موضوع:</b> ${escapeHtml(f.businessName || '—')}</div>
      <div><b>تاریخ قرارداد:</b> <span dir="ltr">${escapeHtml(f.startDate || '—')}</span></div>
    </div>`;

  const footer = includeFooter === false ? '' : `
    <div class="a4-footer">
      <span class="made">ساخته شده در ghalamoom.com</span>
      <span class="foot-logo">${state.logoDataUrl
        ? `<img class="a4-personal-logo" src="${state.logoDataUrl}" alt="لوگوی شخصی">`
        : `<svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M12 15l26 6M18 6l24 5.5" stroke="#d64f12" stroke-width="6" stroke-linecap="round"/><path d="M14 41c0-9.4 7.6-15 17-15s17 5.6 17 15c0 5.5-3.6 9-9.5 9-4.4 0-7.3-2.2-7.3-5.4" stroke="#d64f12" stroke-width="6.5" stroke-linecap="round" fill="none"/><circle cx="46.5" cy="47.5" r="4" fill="#d64f12"/></svg>
           <b style="color:#d64f12;font-size:17px">قلموم</b>`}
      </span>
    </div>`;

  return `<h1>${escapeHtml(tLabel)}</h1><hr class="a4-rule">${headerMeta}${activeClauses}${footer}`;
}

const renderPreview = debounce(function renderPreview() {
  const panel = $('#previewPanel');
  if (panel.hidden) return;
  $('#a4Preview').innerHTML = buildContractHTML(true);
  const modal = $('#a4Modal');
  if (modal) modal.innerHTML = buildContractHTML(true);
}, 120);

/* ───────── stepper & navigation ───────── */
const STEP_META = [
  { n: 1, label: 'نوع قرارداد' },
  { n: 2, label: 'اطلاعات' },
  { n: 3, label: 'پیش‌نویس' },
  { n: 4, label: 'دانلود' }
];
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="m4.5 12.5 5 5L19.5 6.5"/></svg>';

function renderStepper() {
  const container = $('#stepper');
  container.innerHTML = '';
  STEP_META.forEach(({ n, label }) => {
    const done = n < state.step;
    const clickable = n < state.step || n <= state.maxReached;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'step-chip' + (n === state.step ? ' is-active' : '') + (done ? ' is-done' : '') + (clickable ? ' is-clickable' : '');
    btn.setAttribute('aria-current', n === state.step ? 'step' : 'false');
    btn.disabled = !clickable;
    btn.innerHTML = `<span class="step-num">${done ? CHECK_SVG : faDigits(n)}</span> ${escapeHtml(label)}`;
    btn.addEventListener('click', () => { if (clickable) goToStep(n); });
    container.appendChild(btn);
  });
}

function goToStep(n) {
  state.step = n;
  state.maxReached = Math.max(state.maxReached, n);
  $$('.step-panel').forEach(p => { p.hidden = Number(p.dataset.step) !== n; });
  $('#previewPanel').hidden = n < 3;
  renderStepper();
  if (n >= 2) $('#step2TypeLabel').textContent = typeLabel(state.contractTypeId);
  if (n >= 3) { touchClauses(); renderClauseList(); renderPreview(); }
  if (n === 2) updateStep2Note();
  schedulePersist();
  const y = $('#wizard').getBoundingClientRect().top + window.scrollY - 84;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

/* ───────── persistence ───────── */
const persist = debounce(function persist() {
  try {
    const f = formData();
    const payload = { ...state, ...f, logoDataUrl: undefined, logoName: state.logoName, registeredId: undefined };
    localStorage.setItem(LS_STATE, JSON.stringify(payload));
  } catch (e) { /* quota: ignore */ }
}, 300);
const schedulePersist = persist;

function restoreState() {
  try {
    const raw = localStorage.getItem(LS_STATE);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.contractTypeId && CONTRACT_TYPES.some(t => t.id === s.contractTypeId)) state.contractTypeId = s.contractTypeId;
    if (Array.isArray(s.deliverables)) state.deliverables = s.deliverables.filter(d => DELIVERABLES.includes(d));
    if (s.payment) state.payment = s.payment;
    if (s.rights) state.rights = s.rights;
    if (s.portfolio) state.portfolio = s.portfolio;
    if (s.dispute) state.dispute = s.dispute;
    if (Array.isArray(s.clauses) && s.clauses.length) state.clauses = s.clauses;
    if (s.logoName) state.logoName = s.logoName;
    const setIf = (id, v) => { if (v !== undefined && v !== null) field(id).value = v; };
    setIf('employerName', s.employerName); setIf('employerNationalId', faDigits(s.employerNationalId || ''));
    setIf('employerPhone', faDigits(s.employerPhone || '')); setIf('employerAddress', s.employerAddress);
    setIf('designerName', s.designerName); setIf('designerNationalId', faDigits(s.designerNationalId || ''));
    setIf('designerPhone', faDigits(s.designerPhone || '')); setIf('associationId', s.associationId);
    setIf('designerAddress', s.designerAddress); setIf('businessName', s.businessName);
    setIf('totalAmount', s.totalAmount ? faNum(s.totalAmount) : '');
    setIf('durationDays', s.durationDays || ''); setIf('startDate', s.startDate); setIf('revisions', s.revisions ?? '');
    if (s.step >= 1 && s.step <= 4) { state.step = s.step; state.maxReached = Math.max(s.maxReached || s.step, s.step); }
  } catch (e) { /* corrupted state: start fresh */ }
}

/* ───────── amount helpers ───────── */
function initAmountField() {
  const input = field('totalAmount');
  input.addEventListener('input', () => {
    const raw = digitsOnly(input.value).slice(0, 12);
    input.value = raw ? Number(raw).toLocaleString('en-US') : '';
    const n = Number(raw || 0);
    $('#amountPreview').textContent = n > 0 ? `معادل: ${faNum(n)} تومان` : 'معادل: — تومان';
    touchClauses();
    updateStep2Note();
    schedulePersist();
    renderPreview();
  });
}

function initLiveValidation() {
  ['employerName','employerNationalId','designerName','designerNationalId','businessName','totalAmount','durationDays','startDate','revisions']
    .forEach(id => field(id).addEventListener('input', () => {
      field(id).classList.remove('is-invalid');
      touchClauses();
      updateStep2Note();
      schedulePersist();
      renderPreview();
    }));
}

/* ───────── jalali date helper ───────── */
function todayJalali() {
  try {
    const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const get = t => (parts.find(p => p.type === t) || {}).value || '';
    return `${get('year')}/${get('month')}/${get('day')}`;
  } catch (e) { return '۱۴۰۵/۰۹/۰۶'; }
}

/* ───────── word export ───────── */
function downloadWord() {
  const f = formData();
  const tLabel = typeLabel(state.contractTypeId);
  const fileSlug = (f.businessName || 'contract').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-');
  const docHtml = `<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8">
<title>${escapeHtml(tLabel)}</title>
<style>
body{font-family:'Vazirmatn',Tahoma,sans-serif;color:#2e2620;direction:rtl;text-align:justify;line-height:2;font-size:13px}
h1{text-align:center;font-size:20px}
.a4-meta{background:#eee9dd;border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:12px}
h3{border-top:1px dashed #bbb;padding-top:10px;font-size:14px}
.a4-footer{border-top:2px solid #d8d2c6;margin-top:20px;padding-top:10px;font-size:11px;color:#777;display:flex;justify-content:space-between}
</style></head><body>${buildContractHTML(true)}</body></html>`;
  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tLabel}-${fileSlug}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('فایل Word دانلود شد ✓');
}

function downloadPdf() {
  const f = formData();
  const originalTitle = document.title;
  document.title = `${typeLabel(state.contractTypeId)}${f.businessName ? ' — ' + f.businessName : ''}`;
  window.print();
  setTimeout(() => { document.title = originalTitle; }, 1500);
}

/* ───────── supabase registration ───────── */
function contractPayload() {
  const f = formData();
  return {
    contract_type: typeLabel(state.contractTypeId),
    business_name: f.businessName || null,
    employer_name: f.employerName || null,
    employer_national_id: f.employerNationalId || null,
    employer_phone: f.employerPhone || null,
    employer_address: f.employerAddress || null,
    designer_name: f.designerName || null,
    designer_national_id: f.designerNationalId || null,
    designer_phone: f.designerPhone || null,
    designer_association_id: f.associationId || null,
    designer_address: f.designerAddress || null,
    total_amount_toman: f.totalAmount || null,
    payment_method: labelOf(PAYMENT_OPTIONS, state.payment),
    duration_days: f.durationDays || null,
    start_date: f.startDate || null,
    revisions: Number.isFinite(f.revisions) ? f.revisions : null,
    deliverables: state.deliverables,
    rights_transfer: labelOf(RIGHTS_OPTIONS, state.rights),
    portfolio_permission: labelOf(PORTFOLIO_OPTIONS, state.portfolio),
    dispute_resolution: labelOf(DISPUTE_OPTIONS, state.dispute),
    clauses: state.clauses.filter(c => c.enabled).map((c, i) => ({ n: i + 1, title: c.title, body: resolveTokens(c.body) })),
    personal_logo_name: state.logoName || null,
    user_agent: navigator.userAgent
  };
}

async function registerContract() {
  const payload = contractPayload();
  const hash = md5ish(JSON.stringify(payload));
  const btn = $('#registerContractBtn');
  const badge = $('#registeredBadge');
  if (state.registeredId && localStorage.getItem(LS_REGISTERED) === hash) {
    toast('این نسخه قبلاً ثبت شده است ✓');
    return true;
  }
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="fa-digits">در حال ثبت…</span>';
  try {
    await supabaseInsert('contracts', payload);
    state.registeredId = hash;
    localStorage.setItem(LS_REGISTERED, hash);
    badge.style.display = 'flex';
    $('#registeredId').textContent = `#${hash.toUpperCase()}`;
    toast('قرارداد شما با موفقیت ثبت شد ✓');
    return true;
  } catch (err) {
    console.error(err);
    toast('ثبت در سرور انجام نشد — اتصال اینترنت را بررسی کن', 'error');
    return false;
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

/* ───────── chat assistant ───────── */
const CHAT_RULES = [
  { k: ['هزینه', 'رایگان', 'قیمت', 'پول'], a: 'کاملاً رایگانه! ساختن قرارداد، ویرایش بندها و دانلود PDF و Word هیچ هزینه‌ای ندارد. 🎉' },
  { k: ['pdf', 'چاپ', 'دانلود'], a: 'در گام چهارم («پیش‌نمایش و دانلود») دکمهٔ «دانلود PDF» را بزن؛ پنجرهٔ چاپ باز می‌شود و از مقصد «Save as PDF» را انتخاب کن. برای Word هم دکمهٔ «دانلود Word» آماده است.' },
  { k: ['اعتبار', 'حقوقی', 'وکیل', 'دادگاه'], a: 'این قالب بر پایهٔ نمونه قرارداد انجمن صنفی طراحان گرافیک ایران تنظیم شده، اما جایگزین مشاورهٔ حقوقی نیست. برای قراردادهای پیچیده یا مبالغ بالا، حتماً با وکیل مشورت کن.' },
  { k: ['بند', 'ماده', 'اضافه'], a: 'در گام سوم («پیش‌نویس») می‌توانی بندها را ویرایش، خاموش، حذف یا جابه‌جا کنی و با دکمهٔ «+ بند جدید» بند تازه اضافه کنی.' },
  { k: ['لوگو', 'فوتر'], a: 'در گام چهارم، در کارت «لوگوی شخصی» فایل PNG/JPG/WebP/SVG خود را انتخاب کن؛ لوگو در فوتر سمت راست سند می‌نشیند.' },
  { k: ['ثبت', 'ذخیره', 'دیتابیس', 'آرشیو'], a: 'دکمهٔ «ثبت قرارداد» در انتهای گام چهارم، یک نسخهٔ دیجیتالِ قرارداد را در سامانهٔ قلموم ثبت می‌کند تا همیشه آرشیو داشته باشی.' },
  { k: ['پرداخت', 'پیش‌پرداخت', 'تسویه'], a: 'در بخش «نحوه پرداخت» چهار حالت آماده داری: ۵۰/۵۰، ۳۰/۴۰/۳۰، ۷۰/۳۰، پرداخت کامل قبل یا بعد از کار. هر کدام را انتخاب کنی در متن قرارداد می‌نشیند.' },
  { k: ['سلام', 'درود'], a: 'سلام به تو! چطور می‌توانم کمکت کنم؟ دربارهٔ بندها، مبلغ، پرداخت یا خروجی PDF بپرس.' }
];
const CHAT_FALLBACK = 'سوال خوبی پرسیدی! پاسخ دقیقش را نمی‌دانم، اما می‌توانی از ghalamoom@gmail.com بپرسی یا بالای صفحه جستجو کنی. 🙏';

function chatReply(question) {
  const q = question.toLowerCase();
  const hit = CHAT_RULES.find(r => r.k.some(k => q.includes(k)));
  return hit ? hit.a : CHAT_FALLBACK;
}

function initChat() {
  const fab = $('#robotFab'), panel = $('#chatPanel'), log = $('#chatLog');
  const input = $('#chatInput'), form = $('#chatForm');
  const appendMsg = (text, who) => {
    const div = document.createElement('div');
    div.className = `chat-msg ${who}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  };
  const botSay = text => {
    const typing = appendMsg('…', 'bot');
    setTimeout(() => { typing.textContent = text; log.scrollTop = log.scrollHeight; }, 650 + Math.random() * 600);
  };
  fab.addEventListener('click', () => { panel.classList.toggle('open'); if (panel.classList.contains('open')) input.focus(); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    appendMsg(q, 'user');
    input.value = '';
    botSay(chatReply(q));
  });
  $$('#chatChips .chat-chip').forEach(chip => chip.addEventListener('click', () => {
    appendMsg(chip.dataset.q, 'user');
    botSay(chatReply(chip.dataset.q));
  }));
}

/* ───────── init ───────── */
let __booted = false;
document.addEventListener('DOMContentLoaded', () => {
  if (__booted) return; __booted = true;
  initCountdown();
  initTheme();
  restoreState();

  if (!field('startDate').value) field('startDate').value = todayJalali();
  if (!field('revisions').value && field('revisions').value !== '0') field('revisions').value = '2';

  renderContractTypes();
  renderRadioGroup('paymentMethodGroup', PAYMENT_OPTIONS, state.payment, id => { state.payment = id; touchClauses(); schedulePersist(); renderPreview(); });
  renderRadioGroup('rightsTransferGroup', RIGHTS_OPTIONS, state.rights, id => { state.rights = id; touchClauses(); schedulePersist(); renderPreview(); });
  renderRadioGroup('portfolioGroup', PORTFOLIO_OPTIONS, state.portfolio, id => { state.portfolio = id; touchClauses(); schedulePersist(); renderPreview(); });
  renderRadioGroup('disputeGroup', DISPUTE_OPTIONS, state.dispute, id => { state.dispute = id; touchClauses(); schedulePersist(); renderPreview(); });
  renderDeliverables();
  touchClauses();
  renderClauseList();
  initAmountField();
  initLiveValidation();
  if (field('totalAmount').value) field('totalAmount').dispatchEvent(new Event('input'));
  updateStep2Note();
  renderStepper();
  goToStep(state.step);

  /* step 1 */
  $('#step1NextBtn').addEventListener('click', () => {
    if (!state.contractTypeId) { toast('ابتدا نوع قرارداد را انتخاب کن', 'error'); return; }
    goToStep(2);
  });
  if (state.contractTypeId) $('#step1Note').textContent = 'یک قرارداد انتخاب شد ✓';

  /* step 2 */
  $('#step2NextBtn').addEventListener('click', () => {
    const result = validateForm(true);
    if (!result.valid) {
      toast(`${faDigits(result.missing)} مورد الزامی باقی مانده است`, 'error');
      const firstInvalid = $('.field input.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      updateStep2Note();
      return;
    }
    goToStep(3);
  });
  $('#step2BackBtn').addEventListener('click', () => goToStep(1));

  /* step 3 */
  $('#step3NextBtn').addEventListener('click', () => goToStep(4));
  $('#step3BackBtn').addEventListener('click', () => goToStep(2));
  $('#addClauseBtn').addEventListener('click', () => {
    state.clauses.push({ id: 'clause-' + Date.now().toString(36), title: 'بند جدید', body: 'متن بند جدید را اینجا بنویس…', enabled: true, dirty: true });
    renderClauseList();
    schedulePersist();
    renderPreview();
    toast('بند جدید اضافه شد');
  });

  /* step 4 */
  $('#step4BackBtn').addEventListener('click', () => goToStep(3));
  $('#downloadPdfBtn').addEventListener('click', downloadPdf);
  $('#downloadWordBtn').addEventListener('click', downloadWord);
  $('#registerContractBtn').addEventListener('click', registerContract);

  /* logo upload */
  const logoInput = $('#logoInput');
  $('#logoPickBtn').addEventListener('click', () => logoInput.click());
  $('#logoDropzone').addEventListener('click', e => { if (e.target.id === 'logoDropzone') logoInput.click(); });
  logoInput.addEventListener('change', () => {
    const file = logoInput.files && logoInput.files[0];
    if (!file) return;
    if (file.size > 800 * 1024) { toast('حجم لوگو باید کمتر از ۸۰۰KB باشد', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      state.logoDataUrl = String(reader.result);
      state.logoName = file.name;
      $('#logoChipImg').src = state.logoDataUrl;
      $('#logoChipName').textContent = file.name;
      $('#logoChip').style.display = 'flex';
      $('#logoRemoveBtn').style.display = 'inline-flex';
      renderPreview();
      toast('لوگو اضافه شد ✓');
    };
    reader.readAsDataURL(file);
  });
  $('#logoRemoveBtn').addEventListener('click', () => {
    state.logoDataUrl = null; state.logoName = null; logoInput.value = '';
    $('#logoChip').style.display = 'none';
    $('#logoRemoveBtn').style.display = 'none';
    renderPreview();
    toast('لوگو حذف شد');
  });

  /* hero CTA */
  $('#heroStartBtn').addEventListener('click', () => {
    $('#wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* full text modal */
  const modal = $('#fullTextModal');
  $('#openFullTextBtn').addEventListener('click', () => {
    $('#a4Modal').innerHTML = buildContractHTML(true);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  $('#closeFullTextBtn').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  /* article toggle */
  const artToggle = $('#articleToggle');
  artToggle.addEventListener('click', () => {
    const expanded = artToggle.getAttribute('aria-expanded') === 'true';
    artToggle.setAttribute('aria-expanded', String(!expanded));
    $('#articleFull').classList.toggle('open', !expanded);
    $('#articleToggleLabel').textContent = !expanded ? 'بستن متن' : 'مشاهده کامل متن';
  });

  /* newsletter */
  const nlForm = $('#newsletterForm');
  nlForm.addEventListener('submit', async e => {
    e.preventDefault();
    const emailInput = $('#newsletterEmail');
    const btn = $('#newsletterSubmit');
    const email = emailInput.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { toast('ایمیل معتبر وارد کن', 'error'); return; }
    btn.disabled = true;
    try {
      await supabaseInsert('newsletter_subscribers', { email, source: 'contract-builder' });
      $('#newsletterSuccess').style.display = 'flex';
      nlForm.style.display = 'none';
      toast('عضویت شما ثبت شد 🙌');
    } catch (err) {
      if (err.status === 409 || /duplicate|unique/i.test(String(err.message))) {
        $('#newsletterSuccess').style.display = 'flex';
        nlForm.style.display = 'none';
        toast('این ایمیل قبلاً عضو خبرنامه شده است ✓');
      } else {
        console.error(err);
        toast('ثبت عضویت انجام نشد — دوباره تلاش کن', 'error');
      }
    } finally {
      btn.disabled = false;
    }
  });

  /* cart / login placeholders */
  $('#cartBtn').addEventListener('click', () => toast('سبد خرید خالی است'));
  const showLoginToast = () => toast('ورود و داشبورد به‌زودی فعال می‌شود — فعلاً خروجی فایل رایگان است');
  $('#loginBtn').addEventListener('click', showLoginToast);
  $('#bottomNavLogin').addEventListener('click', e => { e.preventDefault(); showLoginToast(); });

  /* drawer */
  const drawer = $('#drawer'), overlay = $('#drawerOverlay');
  $('#hamburgerBtn').addEventListener('click', () => { drawer.classList.add('open'); overlay.classList.add('open'); });
  const closeDrawer = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };
  $('#closeDrawerBtn').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  $$('.drawer a').forEach(a => a.addEventListener('click', closeDrawer));

  /* search overlay */
  const searchOverlay = $('#searchOverlay'), searchInput = $('#searchInput'), searchResults = $('#searchResults');
  const renderSearchResults = query => {
    const q = query.trim();
    const hits = CONTRACT_TYPES.filter(t => !q || t.label.includes(q));
    searchResults.innerHTML = hits.length
      ? hits.map(t => `<button class="search-result" data-type="${t.id}"><span>${escapeHtml(t.label)}</span><span style="color:var(--text-3);font-size:11px">انتخاب ←</span></button>`).join('')
      : '<p style="color:var(--text-3);text-align:center;padding:18px">چیزی پیدا نشد؛ عبارت دیگری امتحان کن</p>';
    $$('.search-result', searchResults).forEach(btn => btn.addEventListener('click', () => {
      selectContractType(btn.dataset.type);
      closeSearch();
      goToStep(1);
      toast('نوع قرارداد انتخاب شد ✓');
    }));
  };
  const openSearch = () => { searchOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; renderSearchResults(''); setTimeout(() => searchInput.focus(), 60); };
  const closeSearch = () => { searchOverlay.classList.remove('open'); document.body.style.overflow = ''; };
  $('#searchOpenBtn').addEventListener('click', openSearch);
  $('#closeSearchBtn').addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
  searchInput.addEventListener('input', () => renderSearchResults(searchInput.value));

  /* esc closes overlays */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSearch(); closeDrawer(); closeModal(); $('#chatPanel').classList.remove('open'); }
  });

  /* chat */
  initChat();
});
