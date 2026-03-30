export type Translations = {
  // Common
  loading: string;
  unauthorized: string;
  loadError: string;
  subscriptionLoadError: string;
  openFromTelegram: string;
  openBot: string;
  retry: string;
  connectionError: string;
  back: string;
  backArrow: string;
  close: string;
  next: string;
  support: string;
  channel: string;
  user: string;

  // Months
  months: [string, string, string, string, string, string, string, string, string, string, string, string];

  // Tabs
  tabHome: string;
  tabProfile: string;

  // Subscription status
  active: string;
  inactive: string;
  subscriptionExpired: string;
  days: string;

  // Subscription card
  until: string;
  connect: string;
  connectVPN: string;
  comingSoon: string;
  buySubscription: string;
  buySubscriptionFrom: string;
  installAndSetup: string;
  addDevice: string;

  // Profile
  subscription: string;
  status: string;
  tariff: string;
  activeUntil: string;
  remaining: string;
  renewSubscription: string;
  copyKey: string;
  copied: string;
  inviteFriend: string;
  inviteShareText: string;

  // Referral stats
  referralStats: string;
  totalInvited: string;
  activeReferrals: string;
  totalCashback: string;
  currentLevel: string;
  nextLevel: string;
  referralsToNext: string;
  silverAccess: string;
  goldAccess: string;
  platinumAccess: string;
  cashbackPercent: string;
  invitedCount: string;

  // Setup flow
  setupIOS: string;
  setupAndroid: string;
  setupWindows: string;
  setupMacOS: string;
  setupGeneric: string;
  setupDescription: string;
  startSetupThisDevice: string;
  installOnOtherDevice: string;
  application: string;
  installAppAndReturn: (appName: string) => string;
  downloadApp: (appName: string) => string;
  installApp: (appName: string) => string;
  subscriptionStep: string;
  openV2RayN: string;
  clickAddSubscription: string;
  pasteLinkBelow: string;
  copyLink: string;
  addSubscriptionViaButton: (appName: string) => string;
  addConfig: string;
  done: string;
  connectV2RayN: string;
  clickVpnButton: (appName: string) => string;
  completeSetup: string;

  // Add device
  addDeviceTitle: string;
  activeSubscriptionRequired: string;
  copyAndPasteLink: string;
  addDeviceStep1: string;
  addDeviceStep2: string;
  addDeviceStep3: string;
  addDeviceOnSecondDevice: string;
  linkAfterActivation: string;
  linkCopied: string;
  copiedCheck: string;

  // Download
  downloadApplication: string;
  install: string;

  // Device selector
  selectDevice: string;
  yourDevice: string;
  pcLaptop: string;

  // Install prompt
  installV2RayTun: string;
  v2RayTunRequired: string;
  installForIOS: string;
  installForAndroid: string;

  // Setup banner
  bannerTitle: string;
  bannerDescription: string;
  bannerAction: string;

  // Guide tab
  tabGuide: string;
  guideTitle: string;
  guideSubtitle: string;
  guideLabel: string;


  // Payment
  paymentTitle: string;
  paymentChooseTariff: string;
  paymentChoosePeriod: string;
  paymentChooseMethod: string;
  paymentTariffBasic: string;
  paymentTariffBasicDesc: string;
  paymentTariffPlus: string;
  paymentTariffPlusDesc: string;
  paymentTariffBusiness: string;
  paymentTariffBusinessDesc: string;
  paymentMonths1: string;
  paymentMonths3: string;
  paymentMonths6: string;
  paymentMonths12: string;
  paymentClientsPerDay: (n: number) => string;
  paymentPerMonth: string;
  paymentStars: string;
  paymentStarsDesc: string;
  paymentCrypto: string;
  paymentCryptoDesc: string;
  paymentSBP: string;
  paymentSBPDesc: string;
  paymentCard: string;
  paymentCardDesc: string;
  paymentComingSoon: string;
  paymentComingSoonToast: string;
  paymentProcessing: string;
  paymentError: string;

  // Client setup screen
  deviceSelectTitle: string;
  deviceSelectSubtitle: string;
  androidTv: string;
  chooseClientApp: string;
  chooseClientAppSubtitle: string;
  setupAutomatically: string;
  copyKeyManually: string;
  addOtherDeviceByQR: string;
  hideQrCode: string;
  shareSubscription: string;
  scanQrToImport: string;
  scanQrHint: string;
  downloadClient: (name: string) => string;
  tariffDeviceLimit: string;

  // Guide — Happ per device
  guideHappIosStep1: string;
  guideHappIosStep2: string;
  guideHappIosStep3: string;
  guideHappIosStep4: string;
  guideHappAndroidStep1: string;
  guideHappAndroidStep2: string;
  guideHappAndroidStep3: string;
  guideHappAndroidStep4: string;
  guideHappMacStep1: string;
  guideHappMacStep2: string;
  guideHappMacStep3: string;
  guideHappMacStep4: string;
  guideHappWinStep1: string;
  guideHappWinStep2: string;
  guideHappWinStep3: string;
  guideHappWinStep4: string;

  // Guide — V2RayTun per device
  guideV2IosStep1: string;
  guideV2IosStep2: string;
  guideV2IosStep3: string;
  guideV2IosStep4: string;
  guideV2AndroidStep1: string;
  guideV2AndroidStep2: string;
  guideV2AndroidStep3: string;
  guideV2AndroidStep4: string;
  guideV2MacStep1: string;
  guideV2MacStep2: string;
  guideV2MacStep3: string;
  guideV2MacStep4: string;
  guideV2WinStep1: string;
  guideV2WinStep2: string;
  guideV2WinStep3: string;
  guideV2WinStep4: string;
  guideV2TvStep1: string;
  guideV2TvStep2: string;
  guideV2TvStep3: string;
  guideV2TvStep4: string;
};
