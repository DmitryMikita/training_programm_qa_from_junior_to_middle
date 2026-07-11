const fallbackModules = [
  { id: 1, title: 'QA как инженер качества', status: 'В процессе', score: '4.0', summary: 'Учимся видеть риски до разработки и задавать вопросы, которые предотвращают дефекты.', description: 'Этот модуль формирует основу мышления Middle QA: качество — это не отсутствие багов, а соответствие продукта ожиданиям пользователя и бизнеса. Разберём роль QA в команде, жизненный цикл задачи, SDLC и STLC через реальные рабочие ситуации.', program: ['Что такое качество и роль QA', 'Путь задачи от идеи до продакшена', 'SDLC и STLC без зубрёжки', 'Verification vs Validation', 'Severity, Priority, Smoke, Sanity, Regression и Retest'], homework: 'Аналитик написал: «Пользователь может изменить номер телефона в личном кабинете». Составьте вопросы к требованию до начала разработки. Сгруппируйте их по бизнес-логике, системе и интерфейсу.' },
  { id: 2, title: 'Test Design', status: 'Далее', score: '—', summary: 'Техники, которые превращают хаотичное тестирование в продуманную стратегию.', description: 'Освоим эквивалентные классы, граничные значения, таблицы решений, переходы состояний, pairwise и исследовательское тестирование. Цель — выбирать технику осознанно, а не писать проверки наугад.', program: ['Эквивалентные классы и граничные значения', 'Таблицы решений и переходы состояний', 'Pairwise и error guessing', 'Чек-листы и исследовательское тестирование'], homework: 'Для формы регистрации подготовьте чек-лист, тест-кейсы, таблицу решений и набор проверок по границам.' },
  { id: 3, title: 'HTTP и Web', status: 'Запланирован', score: '—', summary: 'Разбираем запросы, статусы, заголовки, кэширование и авторизацию так, как это делают на интервью.', description: 'Углубим понимание HTTP: методы, коды ответов, headers, cookies, JWT, OAuth и CORS. Научимся читать сетевой запрос и замечать риски ещё до запуска тестов.', program: ['HTTP-методы и коды ответов', 'Заголовки, cookies и кэширование', 'Авторизация: Basic, Bearer, JWT и OAuth', 'CORS и работа с DevTools Network'], homework: 'Возьмите три запроса из своего проекта, опишите каждый заголовок и предложите негативные сценарии.' },
  { id: 4, title: 'REST API', status: 'Запланирован', score: '—', summary: 'От CRUD к контрактам, идемпотентности, пагинации и качественной API-проверке.', description: 'Систематизируем REST constraints, OpenAPI, JSON Schema и сценарии авторизации. Отдельно разберём валидацию, негативные кейсы и построение Postman-коллекции.', program: ['REST constraints и идемпотентность', 'Пагинация, сортировка и фильтрация', 'OpenAPI, Swagger и JSON Schema', 'Postman-коллекции и автопроверки'], homework: 'Для заданного endpoint составьте минимум 30 проверок: позитивных, негативных, авторизационных и граничных.' },
  { id: 5, title: 'SQL и PostgreSQL', status: 'Запланирован', score: '—', summary: 'Уверенные JOIN, CTE, оконные функции и чтение планов выполнения запросов.', description: 'Переходим от базовых запросов к аналитическому SQL: GROUP BY, HAVING, EXISTS, CTE, оконные функции, транзакции и индексы. Фокус — на задачах, которые QA решает в продукте.', program: ['JOIN, GROUP BY, HAVING и подзапросы', 'CTE и оконные функции', 'Транзакции, изоляция и блокировки', 'Индексы и EXPLAIN ANALYZE'], homework: 'Решите пять задач на JOIN и три задачи на оконные функции. Для одного запроса объясните EXPLAIN ANALYZE.' }
];

const PROGRAM_STATUS = Object.freeze({
  PLANNED: 0,
  NEXT: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
});

const PROGRAM_STATUS_LABEL = Object.freeze({
  [PROGRAM_STATUS.PLANNED]: 'Запланирован',
  [PROGRAM_STATUS.NEXT]: 'Далее',
  [PROGRAM_STATUS.IN_PROGRESS]: 'В процессе',
  [PROGRAM_STATUS.COMPLETED]: 'Завершён',
});

function mapSupabaseModule(row) {
  const summary = Array.isArray(row.ri_summary) ? row.ri_summary[0] : row.ri_summary;
  return {
    id: row.id,
    title: row.title,
    status: PROGRAM_STATUS_LABEL[row.status] ?? 'Неизвестно',
    score: row.score ?? '—',
    summary: summary?.content ?? '',
    description: row.description ?? '',
    program: Array.isArray(row.program) ? row.program : [],
    homework: row.ri_homework?.[0]?.homework ?? '',
  };
}

async function getModules() {
  const { url, publishableKey } = window.SUPABASE_CONFIG ?? {};
  if (!url || !publishableKey) return fallbackModules;

  try {
    const endpoint = new URL('/rest/v1/ri_programm', url);
    endpoint.searchParams.set('select', 'id,title,status,score,description,program,ri_homework(homework),ri_summary(content,status)');
    endpoint.searchParams.set('order', 'id.asc');

    const response = await fetch(endpoint, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
    });

    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('Supabase returned no modules');
    return rows.map(mapSupabaseModule);
  } catch (error) {
    console.warn('Не удалось загрузить программу из Supabase, используются встроенные данные.', error);
    return fallbackModules;
  }
}

let modules = [], active = 0, adminPin = null;
const app = document.querySelector('#app');
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
const supabaseFunction = (name) => new URL(`/functions/v1/${name}`, window.SUPABASE_CONFIG.url).toString();
const functionHeaders = () => ({
  apikey: window.SUPABASE_CONFIG.publishableKey,
  'Content-Type': 'application/json',
});
function cardStyle(i) {
  const n = modules.length, delta = ((i - active + n) % n); const positions = [ [50,51,1,1], [78,33,.76,.7], [68,78,.7,.55], [29,77,.7,.55], [18,31,.76,.7] ];
  const [x,y,s,o] = positions[delta % positions.length]; return `left:${x}%;top:${y}%;transform:translate(-50%,-50%) scale(${s});opacity:${o};z-index:${Math.round(s*10)}`;
}
function home() {
  app.innerHTML = `<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">Q</span> QA Progress</div><span class="chip">Путь к Middle · 2026</span></header><section class="hero"><div><div class="eyebrow">Персональная программа развития</div><h1>Тестируй осознанно.<br>Расти уверенно.</h1><p>Практический маршрут от Junior к Middle QA: модули, домашние задания, интервью и измеримый прогресс.</p></div><aside class="progress-box"><small>Пройдено программы</small><strong>1 из ${modules.length} модулей</strong><div class="progressbar"><i></i></div></aside></section><div class="section-head"><h2>Модули программы</h2><div class="controls"><button aria-label="Предыдущий модуль" id="prev">←</button><button aria-label="Следующий модуль" id="next">→</button></div></div><section class="carousel-wrap"><div class="orbit"></div>${modules.map((m,i) => `<button class="module-card ${i === active ? 'active':''}" data-id="${i}" style="${cardStyle(i)}"><div class="no">МОДУЛЬ ${String(i+1).padStart(2,'0')}</div><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="card-bottom"><span class="status">${esc(m.status)}</span><span class="score">${esc(m.score)} <span>/ 5</span></span></div></button>`).join('')}</section><p class="tip">Выберите модуль или листайте круг <b>← →</b></p><button class="quiet-add" id="add-module" aria-label="Добавить модуль" title="Добавить модуль">+</button></div>`;
  document.querySelector('#prev').onclick = () => { active = (active - 1 + modules.length) % modules.length; home(); };
  document.querySelector('#next').onclick = () => { active = (active + 1) % modules.length; home(); };
  document.querySelectorAll('.module-card').forEach(el => el.onclick = () => detail(+el.dataset.id));
  document.querySelector('#add-module').onclick = openPinModal;
}

function openPinModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<section class="pin-modal" role="dialog" aria-modal="true" aria-labelledby="pin-title"><div class="eyebrow">Проверка доступа</div><h2 id="pin-title">Введите код</h2><p>Четыре цифры для перехода к добавлению модуля.</p><input id="pin-input" class="pin-input" type="password" inputmode="numeric" autocomplete="one-time-code" maxlength="4" aria-describedby="pin-error"><div class="field-error" id="pin-error" aria-live="polite"></div></section>`;
  document.body.append(overlay);
  const input = overlay.querySelector('#pin-input');
  const error = overlay.querySelector('#pin-error');
  let checking = false;
  const close = () => overlay.remove();

  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  input.addEventListener('input', async () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 4);
    input.classList.remove('invalid'); error.textContent = '';
    if (input.value.length !== 4 || checking) return;
    checking = true; input.disabled = true;
    try {
      const response = await fetch(supabaseFunction('verify-admin-pin'), {
        method: 'POST', headers: functionHeaders(), body: JSON.stringify({ pin: input.value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось проверить код');
      if (result.valid) {
        adminPin = input.value; close(); createModulePage(); return;
      }
      input.classList.add('invalid'); error.textContent = 'Неверный код'; input.value = '';
    } catch (requestError) {
      input.classList.add('invalid'); error.textContent = requestError.message;
    } finally {
      checking = false; input.disabled = false; input.focus();
    }
  });
  input.focus();
}

function createModulePage() {
  if (!adminPin) return home();
  app.innerHTML = `<div class="shell create-view"><button class="back" id="cancel-create">← На главную</button><section class="create-banner"><div class="eyebrow">Новый модуль</div><h1>Добавить в программу</h1><p>Заполните содержание модуля. Саммари сформируется автоматически после сохранения.</p></section><form class="create-form" id="create-form" novalidate><label class="form-field"><span>Название модуля</span><input name="title" type="text" autocomplete="off"><small class="field-error"></small></label><label class="form-field"><span>Краткое описание</span><textarea name="description" rows="5"></textarea><small class="field-error"></small></label><fieldset class="program-fields"><legend>Программа</legend><div id="program-list"></div><button type="button" class="secondary-btn" id="add-program-item">+ Добавить пункт</button></fieldset><label class="form-field"><span>Домашнее задание <em>необязательно</em></span><textarea name="homework" rows="5"></textarea><small class="field-error"></small></label><div class="form-message" id="form-message" aria-live="polite"></div><div class="form-actions"><button type="button" class="secondary-btn" id="clear-form">Очистить</button><button type="submit" class="primary-btn" id="submit-module"><span>Добавить</span><i class="loader" aria-hidden="true"></i></button></div></form></div>`;

  const form = document.querySelector('#create-form');
  const list = document.querySelector('#program-list');
  const message = document.querySelector('#form-message');
  const submit = document.querySelector('#submit-module');
  const addProgramItem = (value = '') => {
    const row = document.createElement('div');
    row.className = 'program-row';
    row.innerHTML = `<label class="form-field"><span>Пункт программы</span><input type="text" class="program-input" value="${esc(value)}"><small class="field-error"></small></label><button type="button" class="remove-program" aria-label="Удалить пункт">×</button>`;
    row.querySelector('.remove-program').onclick = () => { if (list.children.length > 1) row.remove(); };
    list.append(row);
  };
  const clearForm = () => {
    form.reset(); list.innerHTML = ''; addProgramItem(); message.textContent = ''; message.className = 'form-message';
    form.querySelectorAll('.invalid').forEach(element => element.classList.remove('invalid'));
    form.querySelectorAll('.field-error').forEach(element => element.textContent = '');
  };
  const markInvalid = (input, text) => {
    input.classList.add('invalid'); input.closest('.form-field').querySelector('.field-error').textContent = text;
  };

  addProgramItem();
  document.querySelector('#add-program-item').onclick = () => addProgramItem();
  document.querySelector('#clear-form').onclick = clearForm;
  document.querySelector('#cancel-create').onclick = () => { adminPin = null; home(); };
  form.addEventListener('submit', async event => {
    event.preventDefault(); message.textContent = ''; message.className = 'form-message';
    form.querySelectorAll('.invalid').forEach(element => element.classList.remove('invalid'));
    form.querySelectorAll('.field-error').forEach(element => element.textContent = '');
    const titleInput = form.elements.title, descriptionInput = form.elements.description;
    const programInputs = [...form.querySelectorAll('.program-input')];
    let valid = true;
    if (!titleInput.value.trim()) { markInvalid(titleInput, 'Заполните название модуля'); valid = false; }
    if (!descriptionInput.value.trim()) { markInvalid(descriptionInput, 'Заполните краткое описание'); valid = false; }
    programInputs.forEach(input => { if (!input.value.trim()) { markInvalid(input, 'Заполните пункт программы'); valid = false; } });
    if (!valid) return;

    submit.disabled = true; submit.classList.add('loading');
    try {
      const response = await fetch(supabaseFunction('create-program'), {
        method: 'POST', headers: functionHeaders(), body: JSON.stringify({
          pin: adminPin,
          title: titleInput.value.trim(),
          description: descriptionInput.value.trim(),
          program: programInputs.map(input => ({ title: input.value.trim() })),
          homework: form.elements.homework.value.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось добавить модуль');
      clearForm(); message.textContent = 'Модуль успешно добавлен'; message.className = 'form-message success';
      setTimeout(() => window.location.reload(), 2000);
    } catch (requestError) {
      message.textContent = requestError.message; message.className = 'form-message error';
      submit.disabled = false; submit.classList.remove('loading');
    }
  });
}
function detail(index) {
  active = index; const m = modules[index];
  const program = Array.isArray(m.program) ? m.program : [];
  app.innerHTML = `<div class="shell module-view"><button class="back" id="back">← Все модули</button><section class="module-banner"><div class="eyebrow" style="color:var(--lime)">Модуль ${String(index+1).padStart(2,'0')} · программа развития</div><h1>${esc(m.title)}</h1><span class="status">${esc(m.status)} · оценка ${esc(m.score)} / 5</span></section><div class="content-grid"><div class="module-main"><article class="panel"><h2>О модуле</h2><p>${esc(m.description)}</p><h2>Результат</h2><p>Вы сможете применять изученные подходы в ежедневной работе, объяснять свои решения и уверенно проходить интервью по теме.</p></article><section class="panel module-program"><h2>Программа модуля</h2><ol>${program.map(item => `<li>${esc(typeof item === 'string' ? item : item.title)}</li>`).join('')}</ol></section></div><aside><section class="panel homework"><div class="eyebrow label">Домашнее задание</div><h2>Практика</h2><p>${esc(m.homework)}</p></section><section class="metrics" style="margin-top:22px"><div class="metric"><small>Статус</small><b>${esc(m.status)}</b></div><div class="metric"><small>Оценка</small><b>${esc(m.score)} / 5</b></div></section></aside></div><nav class="module-nav"><button class="nav-btn" id="previous" ${index===0?'disabled':''}>← Предыдущий</button><button class="nav-btn" id="following" ${index===modules.length-1?'disabled':''}>Следующий →</button></nav></div>`;
  document.querySelector('#back').onclick = home;
  document.querySelector('#previous').onclick = () => index && detail(index-1);
  document.querySelector('#following').onclick = () => index < modules.length-1 && detail(index+1);
}
getModules().then(data => { modules = data; home(); });
