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
  copyAndPasteLink: "Copy the link and paste it into V2RayTun or Hiddify on another device.",
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
};
