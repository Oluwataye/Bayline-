export const APP_CONFIG = {
  name: "Warehouse Dashboard",
  shortName: "WMS",
  description: "Enterprise Multi-Warehouse Management System",
  defaultCurrency: "NGN",
  defaultCurrencySymbol: "₦",
  defaultLocale: "en-NG",
  supportEmail: "support@warehousedashboard.io",
  version: "1.0.0",
  lastUpdatedLabel: "Last Updated",
  defaultTimestamp: "Nov 9, 2026 10:45 AM",
} as const;

export type AppConfig = typeof APP_CONFIG;

