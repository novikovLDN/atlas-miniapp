import type { Translations } from "./types";

export const en: Translations = {
  // Common
  loading: "Loading\u2026",
  unauthorized: "Unauthorized",
  loadError: "Failed to load",
  subscriptionLoadError: "Failed to load subscription",
  openFromTelegram: "Please open the app from Telegram",
  openBot: "Open Bot",
  back: "Back",
  backArrow: "\u2190 Back",
  close: "Close",
  next: "Next",
  support: "Support",
  channel: "Channel",
  user: "User",

  // Months
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  // Tabs
  tabHome: "Home",
  tabProfile: "Profile",

  // Subscription status
  active: "Active",
  inactive: "Inactive",
  subscriptionExpired: "subscription expired",
  days: "d",

  // Subscription card
  until: "until",
  connect: "Connect",
  buySubscription: "Buy Subscription",
  buySubscriptionFrom: "Subscribe from 149 \u20BD",
  installAndSetup: "Setup Guide",
  addDevice: "Add Device",

  // Profile
  subscription: "Subscription",
  status: "Status",
  tariff: "Plan",
  activeUntil: "Active until",
  remaining: "Remaining",
  renewSubscription: "Renew Subscription",
  copyKey: "Copy Key",
  copied: "Copied \u2713",
  inviteFriend: "Invite a Friend",
  inviteShareText: "Try Atlas VPN \u2014 fast and reliable!",

  // Referral stats
  referralStats: "Referral Program",
  totalInvited: "Invited",
  activeReferrals: "Active",
  totalCashback: "Earned",
  currentLevel: "Level",
  nextLevel: "Next level",
  referralsToNext: "to next level",
  silverAccess: "Silver Access",
  goldAccess: "Gold Access",
  platinumAccess: "Platinum Access",
  cashbackPercent: "cashback",
  invitedCount: "invited",

  // Language
  language: "Language",
  russian: "Русский",
  english: "English",

  // Setup flow
  setupIOS: "iOS Setup",
  setupAndroid: "Android Setup",
  setupWindows: "Windows Setup",
  setupMacOS: "macOS Setup",
  setupGeneric: "Setup",
  setupDescription: "VPN setup takes 3 quick steps and just a couple of minutes",
  startSetupThisDevice: "Set up on this device",
  installOnOtherDevice: "Set up on another device",
  application: "App",
  installAppAndReturn: (appName: string) =>
    `Install ${appName} and come back to this screen`,
  downloadApp: (appName: string) => `Download ${appName}`,
  installApp: (appName: string) => `Install ${appName}`,
  subscriptionStep: "Subscription",
  openV2RayN: "1. Open v2RayN",
  clickAddSubscription: "2. Click + \u2192 Add subscription",
  pasteLinkBelow: "3. Paste the link below:",
  copyLink: "Copy Link",
  addSubscriptionViaButton: (appName: string) =>
    `Add your subscription to ${appName} using the button below`,
  addConfig: "Add Config",
  done: "All Set!",
  connectV2RayN: "Connect the subscription in v2RayN and enable VPN",
  clickVpnButton: (appName: string) =>
    `Tap the round VPN button in ${appName} to connect`,
  completeSetup: "Finish Setup",

  // Add device
  addDeviceTitle: "Add Device",
  activeSubscriptionRequired: "An active subscription is required to connect a device.",
  copyAndPasteLink: "Connect VPN on another device in 3 steps:",
  addDeviceStep1: "Tap \"Copy Link\" below",
  addDeviceStep2: "Send the copied link to the other device — via messenger, notes, or any convenient way",
  addDeviceStep3: "On the second device, open V2RayTun, tap \"+\" in the top-right corner and paste the link",
  addDeviceOnSecondDevice: "On the second device",
  linkAfterActivation: "The link will appear after activating your subscription",
  linkCopied: "Link copied \u2713",
  copiedCheck: "Copied \u2713",

  // Download
  downloadApplication: "Download App",
  install: "Install",

  // Device selector
  selectDevice: "Select Your Device",
  yourDevice: "Your device",
  pcLaptop: "PC / Laptop",

  // Install prompt
  installV2RayTun: "Install v2RayTun",
  v2RayTunRequired: "The v2RayTun app is required to connect",
  installForIOS: "Install for iOS",
  installForAndroid: "Install for Android",

  // Setup banner
  bannerTitle: "First time here?",
  bannerDescription: "Let\u2019s set up VPN on this device — it only takes a couple of minutes",
  bannerAction: "Set up",

  // Guide tab
  tabGuide: "Guide",
  guideTitle: "How to set up VPN",
  guideSubtitle: "Step-by-step guides for all devices",
  guideLabel: "Guides",

  // Payment
  paymentTitle: "Subscribe",
  paymentChooseTariff: "Choose a plan",
  paymentChoosePeriod: "Choose period",
  paymentChooseMethod: "Choose payment method",
  paymentTariffBasic: "Basic",
  paymentTariffBasicDesc: "Basic VPN access",
  paymentTariffPlus: "Plus",
  paymentTariffPlusDesc: "Extended access + extra servers",
  paymentTariffBusiness: "Business",
  paymentTariffBusinessDesc: "For teams with multiple clients",
  paymentMonths1: "1 month",
  paymentMonths3: "3 months",
  paymentMonths6: "6 months",
  paymentMonths12: "12 months",
  paymentClientsPerDay: (n: number) => `Up to ${n} clients/day`,
  paymentPerMonth: "/ mo",
  paymentStars: "Telegram Stars",
  paymentStarsDesc: "Pay with Telegram Stars",
  paymentCrypto: "CryptoBot",
  paymentCryptoDesc: "Pay with cryptocurrency",
  paymentSBP: "SBP",
  paymentSBPDesc: "Fast Payment System",
  paymentCard: "Bank Card",
  paymentCardDesc: "Visa, Mastercard, MIR",
  paymentComingSoon: "Soon",
  paymentComingSoonToast: "This payment method will be available soon",
  paymentProcessing: "Processing payment\u2026",
  paymentError: "Payment error. Please try again",

  // Guide — TV
  guideTvTitle: "Setup on TV",
  guideTvStep1: "Install V2RayTun on your phone from the App Store or Google Play",
  guideTvStep2: "On your TV, open the app store and install V2RayTun",
  guideTvStep3: "Open V2RayTun on the TV and tap \"Add via QR\"",
  guideTvStep4: "On your phone in V2RayTun, tap + in the top-right corner → \"Scan QR\"",
  guideTvStep5: "Scan the QR code from the TV screen — the subscription will be added automatically",

  // Guide — PC
  guidePcTitle: "Setup on PC",
  guidePcOption1Title: "Via Telegram (quick method)",
  guidePcOption1Step1: "Open Telegram on your computer",
  guidePcOption1Step2: "Go to the Atlas bot and tap \"Connect\"",
  guidePcOption1Step3: "Tap \"Connect\" again — the config will be added to V2RayTun automatically",
  guidePcOption2Title: "Via app installation",
  guidePcOption2Step1: "Go to the Atlas bot → \"Instructions\" section",
  guidePcOption2Step2: "Download and install V2RayTun for your OS",
  guidePcOption2Step3: "Follow the bot instructions to add your subscription",

  // Guide — Second phone
  guidePhoneTitle: "Setup on another phone",
  guidePhoneStep1: "Install V2RayTun on the second phone from the App Store or Google Play",
  guidePhoneStep2: "On this device, open the Atlas mini app",
  guidePhoneStep3: "Tap \"Set up another device\" and copy the key",
  guidePhoneStep4: "Send the key to the second phone (messenger, notes, etc.)",
  guidePhoneStep5: "On the second phone, open V2RayTun, tap + → \"Paste from clipboard\" and allow pasting",
};
