# Локальный запуск

## 1. Strapi CMS

В первом окне PowerShell из папки проекта выполните:

```powershell
npm.cmd run cms:dev
```

При первом запуске откройте http://localhost:1337/admin и создайте администратора.
Коллекция **Training module** и пять опубликованных модулей создаются автоматически.

## 2. Сайт

Во втором окне PowerShell выполните:

```powershell
cd C:\Projects\training_programm
npm.cmd start
```

Откройте в браузере: http://localhost:4173

Сайт получает модули из `http://localhost:1337`. Если CMS недоступна, он продолжает
работать на встроенных данных. Для другого адреса CMS задайте переменную перед запуском:

```powershell
$env:STRAPI_URL = 'https://cms.example.com'
npm.cmd start
```

Чтобы остановить сервер, нажмите `Ctrl+C` в том же окне терминала.
