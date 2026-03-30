import type { Translations } from "./types";

export const ru: Translations = {
  // Common
  loading: "Загрузка\u2026",
  unauthorized: "Не авторизован",
  loadError: "Ошибка загрузки",
  subscriptionLoadError: "Ошибка загрузки подписки",
  openFromTelegram: "Откройте приложение из Telegram",
  openBot: "Открыть бота",
  retry: "Повторить",
  connectionError: "Ошибка соединения. Проверьте интернет и попробуйте снова",
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
  connectVPN: "Подключиться",
  comingSoon: "Скоро",
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
  inviteShareText: "Попробуй Atlas Secure \u2014 быстрый и надёжный сервис!",

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

  // Setup flow
  setupIOS: "Настройка на iOS",
  setupAndroid: "Настройка на Android",
  setupWindows: "Настройка на Windows",
  setupMacOS: "Настройка на macOS",
  setupGeneric: "Настройка",
  setupDescription: "Настройка происходит в 3 шага и занимает пару минут",
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
  connectV2RayN: "Подключите подписку в v2RayN и включите соединение",
  clickVpnButton: (appName: string) =>
    `Нажмите на круглую кнопку включения в приложении ${appName}`,
  completeSetup: "Завершить настройку",

  // Add device
  addDeviceTitle: "Добавить устройство",
  activeSubscriptionRequired: "Для подключения устройства необходима активная подписка.",
  copyAndPasteLink: "Подключите на другом устройстве:",
  addDeviceOnSecondDevice: "Отсканируйте QR-код с другого устройства",
  addDeviceChooseApp: "Выберите приложение на другом устройстве:",
  addDeviceInstructionTitle: (appName: string) => `Инструкция для ${appName}`,
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
  bannerDescription: "Давайте настроим подключение на этом устройстве — это займёт пару минут",
  bannerAction: "Настроить",

  // Guide tab
  tabGuide: "Инструкция",
  guideTitle: "Как подключиться",
  guideSubtitle: "Пошаговые инструкции для всех устройств",
  guideLabel: "Инструкции",

  // Payment
  paymentTitle: "Оплата подписки",
  paymentChooseTariff: "Выберите тариф",
  paymentChoosePeriod: "Выберите период",
  paymentChooseMethod: "Выберите способ оплаты",
  paymentTariffBasic: "Basic",
  paymentTariffBasicDesc: "Базовый доступ к сервису",
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

  // Client setup screen
  deviceSelectTitle: "Выбор устройств",
  deviceSelectSubtitle: "Нажмите на кнопку с нужным устройством, чтобы продолжить настройку",
  androidTv: "Android/Google TV",
  chooseClientApp: "Нажмите на кнопку с нужным приложением-клиентом для инструкции:",
  chooseClientAppSubtitle: "Нажмите на кнопку с нужным приложением-клиентом для инструкции:",
  setupAutomatically: "Настроить автоматически",
  copyKeyManually: "Скопировать ключ вручную",
  addOtherDeviceByQR: "Добавить другое устройство по QR",
  hideQrCode: "Скрыть QR-код",
  shareSubscription: "Поделиться подпиской",
  scanQrToImport: "Отсканируйте этот QR-код камерой или из приложения на другом устройстве, чтобы импортировать подписку",
  scanQrHint: "В приложении: «+» → «Сканировать QR-код» или «Импорт из QR»",
  downloadClient: (name: string) => `Скачать ${name}`,
  tariffDeviceLimit: "Тариф Basic — до 5 устройств. Тариф Plus — до 7 устройств. Воспользуйтесь кнопкой «Поделиться ключом» для быстрого подключения дополнительных устройств.",

};
