import type { Translations } from "./types";

export const ru: Translations = {
  // Common
  loading: "Загрузка\u2026",
  unauthorized: "Не авторизован",
  loadError: "Ошибка загрузки",
  subscriptionLoadError: "Ошибка загрузки подписки",
  openFromTelegram: "Откройте приложение из Telegram",
  openBot: "Открыть бота",
  back: "Назад",
  backArrow: "\u2190 Назад",
  close: "Закрыть",
  next: "Далее",
  support: "Поддержка",
  channel: "Канал",
  user: "Пользователь",

  // Months
  months: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],

  // Tabs
  tabHome: "Главная",
  tabProfile: "Профиль",

  // Subscription status
  active: "Активна",
  inactive: "Неактивна",
  subscriptionExpired: "подписка истекла",
  days: "дн.",

  // Subscription card
  until: "до",
  connect: "Подключиться",
  buySubscription: "Купить подписку",
  buySubscriptionFrom: "Купить подписку от 149 \u20BD",
  installAndSetup: "Установка и настройка",
  addDevice: "Добавить устройство",

  // Profile
  subscription: "Подписка",
  status: "Статус",
  tariff: "Тариф",
  activeUntil: "Активна до",
  remaining: "Осталось",
  renewSubscription: "Продлить подписку",
  copyKey: "Скопировать ключ",
  copied: "Скопировано \u2713",
  inviteFriend: "Пригласить друга",
  inviteShareText: "Попробуй Atlas VPN \u2014 быстрый и надёжный VPN!",

  // Referral stats
  referralStats: "Реферальная программа",
  totalInvited: "Приглашено",
  activeReferrals: "Активных",
  totalCashback: "Заработано",
  currentLevel: "Уровень",
  nextLevel: "Следующий уровень",
  referralsToNext: "до следующего уровня",
  silverAccess: "Silver Access",
  goldAccess: "Gold Access",
  platinumAccess: "Platinum Access",
  cashbackPercent: "кэшбэк",
  invitedCount: "приглашённых",

  // Language
  language: "Язык",
  russian: "Русский",
  english: "English",

  // Setup flow
  setupIOS: "Настройка на iOS",
  setupAndroid: "Настройка на Android",
  setupWindows: "Настройка на Windows",
  setupMacOS: "Настройка на macOS",
  setupGeneric: "Настройка",
  setupDescription: "Настройка VPN происходит в 3 шага и занимает пару минут",
  startSetupThisDevice: "Начать настройку на этом устройстве",
  installOnOtherDevice: "Установить на другом устройстве",
  application: "Приложение",
  installAppAndReturn: (appName: string) =>
    `Установите приложение ${appName} и вернитесь к этому экрану`,
  downloadApp: (appName: string) => `Скачать ${appName}`,
  installApp: (appName: string) => `Установить ${appName}`,
  subscriptionStep: "Подписка",
  openV2RayN: "1. Откройте v2RayN",
  clickAddSubscription: "2. Нажмите + \u2192 Add subscription",
  pasteLinkBelow: "3. Вставьте ссылку ниже:",
  copyLink: "Скопировать ссылку",
  addSubscriptionViaButton: (appName: string) =>
    `Добавьте подписку в приложение ${appName} с помощью кнопки ниже`,
  addConfig: "Добавить конфиг",
  done: "Готово!",
  connectV2RayN: "Подключите подписку в v2RayN и включите VPN",
  clickVpnButton: (appName: string) =>
    `Нажмите на круглую кнопку включения VPN в приложении ${appName}`,
  completeSetup: "Завершить настройку",

  // Add device
  addDeviceTitle: "Добавить устройство",
  activeSubscriptionRequired: "Для подключения устройства необходима активная подписка.",
  copyAndPasteLink: "Скопируйте ссылку и вставьте её в V2RayTun или Hiddify на другом устройстве.",
  linkAfterActivation: "Ссылка появится после активации подписки",
  linkCopied: "Ссылка скопирована \u2713",
  copiedCheck: "Скопировано \u2713",

  // Download
  downloadApplication: "Скачать приложение",
  install: "Установить",

  // Device selector
  selectDevice: "Выберите устройство",
  yourDevice: "Ваше устройство",
  pcLaptop: "ПК / Ноутбук",

  // Install prompt
  installV2RayTun: "Установите v2RayTun",
  v2RayTunRequired: "Для подключения необходимо приложение v2RayTun",
  installForIOS: "Установить для iOS",
  installForAndroid: "Установить для Android",

  // Setup banner
  bannerTitle: "Впервые здесь?",
  bannerDescription: "Давайте настроим VPN на этом устройстве — это займёт пару минут",
  bannerAction: "Настроить",
};
