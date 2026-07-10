const fallbackModules = [
  { id: 1, title: 'QA как инженер качества', status: 'В процессе', score: '4.0', summary: 'Учимся видеть риски до разработки и задавать вопросы, которые предотвращают дефекты.', description: 'Этот модуль формирует основу мышления Middle QA: качество — это не отсутствие багов, а соответствие продукта ожиданиям пользователя и бизнеса. Разберём роль QA в команде, жизненный цикл задачи, SDLC и STLC через реальные рабочие ситуации.', program: ['Что такое качество и роль QA', 'Путь задачи от идеи до продакшена', 'SDLC и STLC без зубрёжки', 'Verification vs Validation', 'Severity, Priority, Smoke, Sanity, Regression и Retest'], homework: 'Аналитик написал: «Пользователь может изменить номер телефона в личном кабинете». Составьте вопросы к требованию до начала разработки. Сгруппируйте их по бизнес-логике, системе и интерфейсу.' },
  { id: 2, title: 'Test Design', status: 'Далее', score: '—', summary: 'Техники, которые превращают хаотичное тестирование в продуманную стратегию.', description: 'Освоим эквивалентные классы, граничные значения, таблицы решений, переходы состояний, pairwise и исследовательское тестирование. Цель — выбирать технику осознанно, а не писать проверки наугад.', program: ['Эквивалентные классы и граничные значения', 'Таблицы решений и переходы состояний', 'Pairwise и error guessing', 'Чек-листы и исследовательское тестирование'], homework: 'Для формы регистрации подготовьте чек-лист, тест-кейсы, таблицу решений и набор проверок по границам.' },
  { id: 3, title: 'HTTP и Web', status: 'Запланирован', score: '—', summary: 'Разбираем запросы, статусы, заголовки, кэширование и авторизацию так, как это делают на интервью.', description: 'Углубим понимание HTTP: методы, коды ответов, headers, cookies, JWT, OAuth и CORS. Научимся читать сетевой запрос и замечать риски ещё до запуска тестов.', program: ['HTTP-методы и коды ответов', 'Заголовки, cookies и кэширование', 'Авторизация: Basic, Bearer, JWT и OAuth', 'CORS и работа с DevTools Network'], homework: 'Возьмите три запроса из своего проекта, опишите каждый заголовок и предложите негативные сценарии.' },
  { id: 4, title: 'REST API', status: 'Запланирован', score: '—', summary: 'От CRUD к контрактам, идемпотентности, пагинации и качественной API-проверке.', description: 'Систематизируем REST constraints, OpenAPI, JSON Schema и сценарии авторизации. Отдельно разберём валидацию, негативные кейсы и построение Postman-коллекции.', program: ['REST constraints и идемпотентность', 'Пагинация, сортировка и фильтрация', 'OpenAPI, Swagger и JSON Schema', 'Postman-коллекции и автопроверки'], homework: 'Для заданного endpoint составьте минимум 30 проверок: позитивных, негативных, авторизационных и граничных.' },
  { id: 5, title: 'SQL и PostgreSQL', status: 'Запланирован', score: '—', summary: 'Уверенные JOIN, CTE, оконные функции и чтение планов выполнения запросов.', description: 'Переходим от базовых запросов к аналитическому SQL: GROUP BY, HAVING, EXISTS, CTE, оконные функции, транзакции и индексы. Фокус — на задачах, которые QA решает в продукте.', program: ['JOIN, GROUP BY, HAVING и подзапросы', 'CTE и оконные функции', 'Транзакции, изоляция и блокировки', 'Индексы и EXPLAIN ANALYZE'], homework: 'Решите пять задач на JOIN и три задачи на оконные функции. Для одного запроса объясните EXPLAIN ANALYZE.' }
];

// Замените адрес CMS при подключении проекта. Поля Strapi: title, status, score,
// aiSummary, description, program, homework, order. Поле program — JSON-массив
// строк (компонент/повторяемое поле в Strapi). Суммаризацию безопаснее выполнять
// серверным webhook/cron и сохранять в aiSummary, а не вызывать ИИ из браузера.
async function getModules() {
  const url = window.STRAPI_URL?.replace(/\/$/, '');
  if (!url) return fallbackModules;
  try {
    const response = await fetch(`${url}/api/modules?populate=*&sort=order:asc`);
    if (!response.ok) throw new Error(`Strapi returned ${response.status}`);
    const json = await response.json();
    if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Strapi returned no modules');
    return json.data.map(entry => {
      const data = entry.attributes ? { id: entry.id, ...entry.attributes } : entry;
      return { ...data, summary: data.aiSummary };
    });
  } catch (error) {
    console.warn('Не удалось загрузить модули из Strapi, используются встроенные данные.', error);
    return fallbackModules;
  }
}

let modules = [], active = 0;
const app = document.querySelector('#app');
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
function cardStyle(i) {
  const n = modules.length, delta = ((i - active + n) % n); const positions = [ [50,51,1,1], [78,33,.76,.7], [68,78,.7,.55], [29,77,.7,.55], [18,31,.76,.7] ];
  const [x,y,s,o] = positions[delta % positions.length]; return `left:${x}%;top:${y}%;transform:translate(-50%,-50%) scale(${s});opacity:${o};z-index:${Math.round(s*10)}`;
}
function home() {
  app.innerHTML = `<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">Q</span> QA Progress</div><span class="chip">Путь к Middle · 2026</span></header><section class="hero"><div><div class="eyebrow">Персональная программа развития</div><h1>Тестируй осознанно.<br>Расти уверенно.</h1><p>Практический маршрут от Junior к Middle QA: модули, домашние задания, интервью и измеримый прогресс.</p></div><aside class="progress-box"><small>Пройдено программы</small><strong>1 из ${modules.length} модулей</strong><div class="progressbar"><i></i></div></aside></section><div class="section-head"><h2>Модули программы</h2><div class="controls"><button aria-label="Предыдущий модуль" id="prev">←</button><button aria-label="Следующий модуль" id="next">→</button></div></div><section class="carousel-wrap"><div class="orbit"></div>${modules.map((m,i) => `<button class="module-card ${i === active ? 'active':''}" data-id="${i}" style="${cardStyle(i)}"><div class="no">МОДУЛЬ ${String(i+1).padStart(2,'0')}</div><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="card-bottom"><span class="status">${esc(m.status)}</span><span class="score">${esc(m.score)} <span>/ 5</span></span></div></button>`).join('')}</section><p class="tip">Выберите модуль или листайте круг <b>← →</b></p></div>`;
  document.querySelector('#prev').onclick = () => { active = (active - 1 + modules.length) % modules.length; home(); };
  document.querySelector('#next').onclick = () => { active = (active + 1) % modules.length; home(); };
  document.querySelectorAll('.module-card').forEach(el => el.onclick = () => detail(+el.dataset.id));
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
