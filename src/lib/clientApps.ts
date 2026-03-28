import type { DeviceType } from "./detectDevice";

export type ClientAppId = "streisand" | "hiddify" | "v2raytun" | "shadowrocket" | "happ" | "v2rayn";

export type ClientApp = {
  id: ClientAppId;
  name: string;
  subtitle: string;
  storeLabel: string;
  storeUrl: string;
  deeplink: ((subUrl: string) => string) | null;
  steps: string[];
};

// Client apps available per device type
export const CLIENT_APPS: Record<DeviceType, ClientApp[]> = {
  ios: [
    {
      id: "streisand",
      name: "Streisand",
      subtitle: "Популярный клиент для iOS",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/streisand/id6450534064",
      deeplink: (subUrl: string) => `streisand://import/${subUrl}`,
      steps: [
        "Откройте App Store на вашем iPhone или iPad. Найдите приложение «Streisand» и нажмите «Загрузить». Дождитесь установки.",
        "Скопируйте вашу ссылку подписки — она понадобится на следующем шаге.",
        "Откройте Streisand. На главном экране нажмите «+» или «Импорт», затем выберите «Импорт из буфера обмена». Конфигурация сервера будет добавлена автоматически.",
        "Выберите добавленный сервер в списке и нажмите кнопку подключения. При первом подключении iOS попросит разрешить конфигурацию — нажмите «Разрешить».",
        "Когда в верхней части экрана появится значок подключения — соединение активно. Весь трафик теперь защищён.",
      ],
    },
    {
      id: "hiddify",
      name: "Hiddify",
      subtitle: "Универсальный клиент",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/hiddify-proxy-vpn/id6596777532",
      deeplink: (subUrl: string) => `hiddify://import/${subUrl}`,
      steps: [
        "Откройте App Store на вашем iPhone или iPad. Найдите приложение «Hiddify» и нажмите «Загрузить». Дождитесь установки.",
        "Скопируйте вашу ссылку подписки — она понадобится на следующем шаге.",
        "Откройте Hiddify. Нажмите «+» → «Добавить из буфера обмена». Подписка будет добавлена автоматически.",
        "Выберите сервер и нажмите кнопку подключения. Разрешите создание VPN-конфигурации при первом запуске.",
        "Готово! Соединение установлено.",
      ],
    },
    {
      id: "v2raytun",
      name: "V2RayTun",
      subtitle: "Простой клиент для iOS",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/v2raytun/id6476628951",
      deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
      steps: [
        "Откройте App Store на вашем iPhone или iPad. Найдите приложение «V2RayTun» и нажмите «Загрузить». Дождитесь установки.",
        "Скопируйте вашу ссылку подписки — она понадобится на следующем шаге.",
        "Откройте V2RayTun. На главном экране нажмите «+» или «Импорт», затем выберите «Импорт из буфера обмена». Конфигурация сервера будет добавлена автоматически.",
        "Выберите добавленный сервер в списке и нажмите кнопку подключения. При первом подключении iOS попросит разрешить конфигурацию — нажмите «Разрешить».",
        "Когда в верхней части экрана появится значок подключения — соединение активно. Весь трафик теперь защищён.",
      ],
    },
    {
      id: "shadowrocket",
      name: "Shadowrocket",
      subtitle: "Продвинутый клиент (платный)",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/shadowrocket/id932747118",
      deeplink: (subUrl: string) => `shadowrocket://add/sub://${btoa(subUrl)}`,
      steps: [
        "Откройте App Store и найдите «Shadowrocket». Обратите внимание: приложение платное. Нажмите «Купить» и дождитесь установки.",
        "Скопируйте вашу ссылку подписки — она понадобится на следующем шаге.",
        "Откройте Shadowrocket. Нажмите «+» в правом верхнем углу, выберите тип «Subscribe» и вставьте скопированную ссылку.",
        "Выберите сервер из списка и включите переключатель подключения. Разрешите VPN-конфигурацию.",
        "Соединение установлено. Весь трафик теперь защищён.",
      ],
    },
    {
      id: "happ",
      name: "Happ",
      subtitle: "Лёгкий клиент",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/happ-proxy-utility/id6504287215",
      deeplink: null,
      steps: [
        "Откройте App Store и найдите «Happ». Нажмите «Загрузить» и дождитесь установки.",
        "Скопируйте вашу ссылку подписки — она понадобится на следующем шаге.",
        "Откройте Happ. Нажмите «+» и вставьте скопированную ссылку подписки.",
        "Выберите сервер и нажмите кнопку подключения. Разрешите VPN-конфигурацию.",
        "Готово! Соединение установлено.",
      ],
    },
  ],
  android: [
    {
      id: "hiddify",
      name: "Hiddify",
      subtitle: "Универсальный клиент",
      storeLabel: "Google Play",
      storeUrl: "https://play.google.com/store/apps/details?id=app.hiddify.com",
      deeplink: (subUrl: string) => `hiddify://import/${subUrl}`,
      steps: [
        "Откройте Google Play на вашем Android-устройстве. Найдите приложение «Hiddify» и нажмите «Установить».",
        "Скопируйте вашу ссылку подписки.",
        "Откройте Hiddify. Нажмите «+» → «Добавить из буфера обмена». Подписка будет добавлена автоматически.",
        "Выберите сервер и нажмите кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
    {
      id: "v2raytun",
      name: "V2RayTun",
      subtitle: "Простой клиент",
      storeLabel: "Google Play",
      storeUrl: "https://play.google.com/store/apps/details?id=com.v2raytun.android",
      deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
      steps: [
        "Откройте Google Play и найдите «V2RayTun». Нажмите «Установить».",
        "Скопируйте вашу ссылку подписки.",
        "Откройте V2RayTun. Нажмите «+» → «Импорт из буфера обмена».",
        "Выберите сервер и нажмите кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
  ],
  windows: [
    {
      id: "hiddify",
      name: "Hiddify",
      subtitle: "Универсальный клиент",
      storeLabel: "GitHub",
      storeUrl: "https://github.com/hiddify/hiddify-app/releases/latest",
      deeplink: null,
      steps: [
        "Скачайте Hiddify с GitHub и установите на ваш ПК.",
        "Скопируйте вашу ссылку подписки.",
        "Откройте Hiddify. Нажмите «+» → «Добавить из буфера обмена».",
        "Выберите сервер и нажмите кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
    {
      id: "v2rayn",
      name: "v2RayN",
      subtitle: "Популярный клиент для Windows",
      storeLabel: "GitHub",
      storeUrl: "https://github.com/2dust/v2rayN/releases/latest",
      deeplink: null,
      steps: [
        "Скачайте v2RayN с GitHub и распакуйте архив.",
        "Скопируйте вашу ссылку подписки.",
        "Откройте v2RayN. Нажмите «+» → «Add subscription». Вставьте скопированную ссылку.",
        "Выберите сервер из списка и нажмите «Enter» или кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
  ],
  macos: [
    {
      id: "streisand",
      name: "Streisand",
      subtitle: "Популярный клиент",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/streisand/id6450534064",
      deeplink: (subUrl: string) => `streisand://import/${subUrl}`,
      steps: [
        "Откройте App Store и найдите «Streisand». Нажмите «Загрузить».",
        "Скопируйте вашу ссылку подписки.",
        "Откройте Streisand. Нажмите «+» → «Импорт из буфера обмена».",
        "Выберите сервер и нажмите кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
    {
      id: "hiddify",
      name: "Hiddify",
      subtitle: "Универсальный клиент",
      storeLabel: "GitHub",
      storeUrl: "https://github.com/hiddify/hiddify-app/releases/latest",
      deeplink: null,
      steps: [
        "Скачайте Hiddify с GitHub и установите.",
        "Скопируйте вашу ссылку подписки.",
        "Откройте Hiddify. Нажмите «+» → «Добавить из буфера обмена».",
        "Выберите сервер и нажмите кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
    {
      id: "v2raytun",
      name: "V2RayTun",
      subtitle: "Простой клиент",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/v2raytun/id6476628951",
      deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
      steps: [
        "Откройте App Store и найдите «V2RayTun». Нажмите «Загрузить».",
        "Скопируйте вашу ссылку подписки.",
        "Откройте V2RayTun. Нажмите «+» → «Импорт из буфера обмена».",
        "Выберите сервер и нажмите кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
  ],
  unknown: [
    {
      id: "v2raytun",
      name: "V2RayTun",
      subtitle: "Универсальный клиент",
      storeLabel: "App Store",
      storeUrl: "https://apps.apple.com/app/v2raytun/id6476628951",
      deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
      steps: [
        "Установите V2RayTun из App Store или Google Play.",
        "Скопируйте вашу ссылку подписки.",
        "Откройте V2RayTun. Нажмите «+» → «Импорт из буфера обмена».",
        "Выберите сервер и нажмите кнопку подключения.",
        "Готово! Соединение установлено.",
      ],
    },
  ],
};
