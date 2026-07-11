# Webhook генерации саммари

После применения миграции и деплоя функции создайте Database Webhook в Supabase:

- Name: `generate-program-summary`
- Table: `public.ri_programm`
- Events: `INSERT`, `UPDATE`
- Method: `POST`
- URL: `https://ricfhnlqurfusvqbtryu.supabase.co/functions/v1/generate-program-summary`
- Header: `x-webhook-secret: <значение WEBHOOK_SECRET>`

Для Edge Function задайте secrets:

- `WEBHOOK_SECRET`
- `GROQ_API_KEY`
- `GROQ_MODEL` (необязательно, по умолчанию `llama-3.1-8b-instant`)

Функцию нужно развернуть без JWT-проверки, поскольку доступ защищён отдельным
случайным `WEBHOOK_SECRET`. Никогда не добавляйте значения secrets в Git.
