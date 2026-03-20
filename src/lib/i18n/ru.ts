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
  connectVPN: "Подключить VPN",
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
  copyAndPasteLink: "Подключите VPN на другом устройстве в 3 шага:",
  addDeviceStep1: "Нажмите «Скопировать ссылку» ниже",
  addDeviceStep2: "Передайте скопированную ссылку на нужное устройство — через мессенджер, заметки или любым удобным способом",
  addDeviceStep3: "На втором устройстве откройте приложение V2RayTun, нажмите «+» в правом верхнем углу и вставьте ссылку",
  addDeviceOnSecondDevice: "На втором устройстве",
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

  // Guide tab
  tabGuide: "Инструкция",
  guideTitle: "Как подключить VPN",
  guideSubtitle: "Пошаговые инструкции для всех устройств",
  guideLabel: "Инструкции",

  // Payment
  paymentTitle: "Оплата подписки",
  paymentChooseTariff: "Выберите тариф",
  paymentChoosePeriod: "Выберите период",
  paymentChooseMethod: "Выберите способ оплаты",
  paymentTariffBasic: "Basic",
  paymentTariffBasicDesc: "Базовый доступ к VPN",
  paymentTariffPlus: "Plus",
  paymentTariffPlusDesc: "Расширенный доступ + дополнительные серверы",
  paymentTariffBusiness: "Business",
  paymentTariffBusinessDesc: "Для команд с несколькими клиентами",
  paymentMonths1: "1 месяц",
  paymentMonths3: "3 месяца",
  paymentMonths6: "6 месяцев",
  paymentMonths12: "12 месяцев",
  paymentClientsPerDay: (n: number) => `До ${n} кл/день`,
  paymentPerMonth: "/ мес",
  paymentStars: "Telegram Stars",
  paymentStarsDesc: "Оплата звёздами Telegram",
  paymentCrypto: "CryptoBot",
  paymentCryptoDesc: "Оплата криптовалютой",
  paymentSBP: "СБП",
  paymentSBPDesc: "Система быстрых платежей",
  paymentCard: "Банковская карта",
  paymentCardDesc: "Visa, Mastercard, МИР",
  paymentComingSoon: "Скоро",
  paymentComingSoonToast: "Скоро добавим этот способ оплаты",
  paymentProcessing: "Обработка платежа\u2026",
  paymentError: "Ошибка оплаты. Попробуйте ещё раз",

  // Guide — TV
  guideTvTitle: "Установка на телевизор",
  guideTvStep1: "Установите приложение V2RayTun на телефон из App Store или Google Play",
  guideTvStep2: "На телевизоре откройте магазин приложений и установите V2RayTun",
  guideTvStep3: "Откройте V2RayTun на телевизоре и нажмите «Добавить по QR»",
  guideTvStep4: "На телефоне в приложении V2RayTun нажмите + в правом верхнем углу → «Сканировать QR»",
  guideTvStep5: "Отсканируйте QR-код с экрана телевизора — подписка добавится автоматически",

  // Guide — PC
  guidePcTitle: "Установка на компьютер",
  guidePcOption1Title: "Через Telegram (быстрый способ)",
  guidePcOption1Step1: "Откройте Telegram на компьютере",
  guidePcOption1Step2: "Перейдите в бот Atlas и нажмите «Подключиться»",
  guidePcOption1Step3: "Нажмите «Подключиться» ещё раз — конфигурация автоматически добавится в V2RayTun",
  guidePcOption2Title: "Через установку приложения",
  guidePcOption2Step1: "Перейдите в бот Atlas → раздел «Инструкция»",
  guidePcOption2Step2: "Скачайте и установите V2RayTun для вашей ОС",
  guidePcOption2Step3: "Следуйте инструкции в боте для добавления подписки",

  // Guide — Second phone
  guidePhoneTitle: "Установка на другой телефон",
  guidePhoneStep1: "Установите V2RayTun на втором телефоне из App Store или Google Play",
  guidePhoneStep2: "На этом устройстве откройте мини-приложение Atlas",
  guidePhoneStep3: "Нажмите «Настроить другое устройство» и скопируйте ключ",
  guidePhoneStep4: "Передайте ключ на второй телефон (мессенджер, заметки и т.д.)",
  guidePhoneStep5: "На втором телефоне откройте V2RayTun, нажмите + → «Вставить из буфера обмена» и разрешите вставку",
};
