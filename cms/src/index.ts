import type { Core } from '@strapi/strapi';

const initialModules = [
  {
    title: 'QA как инженер качества', status: 'В процессе', score: '4.0', order: 1,
    aiSummary: 'Учимся видеть риски до разработки и задавать вопросы, которые предотвращают дефекты.',
    description: 'Основа мышления Middle QA: качество — это соответствие продукта ожиданиям пользователя и бизнеса. Разберём роль QA, жизненный цикл задачи, SDLC и STLC.',
    program: ['Что такое качество и роль QA', 'Путь задачи от идеи до продакшена', 'SDLC и STLC', 'Verification и Validation', 'Severity и Priority'],
    homework: 'Составьте вопросы к требованию об изменении номера телефона в личном кабинете и сгруппируйте их по бизнес-логике, системе и интерфейсу.',
  },
  {
    title: 'Test Design', status: 'Далее', score: '—', order: 2,
    aiSummary: 'Техники, которые превращают хаотичное тестирование в продуманную стратегию.',
    description: 'Освоим классы эквивалентности, граничные значения, таблицы решений, переходы состояний, pairwise и исследовательское тестирование.',
    program: ['Классы эквивалентности и границы', 'Таблицы решений', 'Переходы состояний', 'Pairwise и error guessing'],
    homework: 'Для формы регистрации подготовьте чек-лист, тест-кейсы, таблицу решений и проверки граничных значений.',
  },
  {
    title: 'HTTP и Web', status: 'Запланирован', score: '—', order: 3,
    aiSummary: 'Разбираем запросы, статусы, заголовки, кэширование и авторизацию как на интервью.',
    description: 'Углубим понимание HTTP: методы, коды ответов, headers, cookies, JWT, OAuth и CORS.',
    program: ['HTTP-методы и коды ответов', 'Заголовки, cookies и кэширование', 'Basic, Bearer, JWT и OAuth', 'CORS и DevTools Network'],
    homework: 'Возьмите три запроса из проекта, опишите каждый заголовок и предложите негативные сценарии.',
  },
  {
    title: 'REST API', status: 'Запланирован', score: '—', order: 4,
    aiSummary: 'От CRUD к контрактам, идемпотентности, пагинации и качественной API-проверке.',
    description: 'Систематизируем REST constraints, OpenAPI, JSON Schema, авторизацию, валидацию и негативные проверки.',
    program: ['REST и идемпотентность', 'Пагинация, сортировка и фильтрация', 'OpenAPI и JSON Schema', 'Postman-коллекции'],
    homework: 'Для заданного endpoint составьте минимум 30 позитивных, негативных, авторизационных и граничных проверок.',
  },
  {
    title: 'SQL и PostgreSQL', status: 'Запланирован', score: '—', order: 5,
    aiSummary: 'Уверенные JOIN, CTE, оконные функции и чтение планов выполнения запросов.',
    description: 'Переходим от базовых запросов к аналитическому SQL, транзакциям, индексам и EXPLAIN ANALYZE.',
    program: ['JOIN, GROUP BY и HAVING', 'CTE и оконные функции', 'Транзакции и блокировки', 'Индексы и EXPLAIN ANALYZE'],
    homework: 'Решите пять задач на JOIN и три задачи на оконные функции. Объясните EXPLAIN ANALYZE одного запроса.',
  },
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register() {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const documents = strapi.documents('api::module.module');
    const existing = await documents.findMany({ limit: 1 });

    if (existing.length === 0) {
      for (const module of initialModules) {
        await documents.create({ data: module, status: 'published' });
      }
      strapi.log.info('Created the initial QA training modules');
    }
  },
};
