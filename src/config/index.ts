// Environment configuration for FreelanceFlow
const isDevelopment =
  location?.hostname === "localhost" || location?.hostname === "127.0.0.1";

export const config = {
  // Stellar Network Configuration
  STELLAR_NETWORK: "TESTNET",
  HORIZON_URL: "https://horizon-testnet.stellar.org",
  NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",

  // Application Configuration
  APP_NAME: "FreelanceFlow",
  VERSION: "1.0.0",

  // Development vs Production
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: !isDevelopment,

  // Feature Flags
  ENABLE_DEBUG: isDevelopment,
  ENABLE_WALLET_DEBUGGER: isDevelopment,

  // External Links
  FREIGHTER_INSTALL_URL: "https://freighter.app/",
  STELLAR_FRIENDBOT_URL: "https://friendbot.stellar.org",
  STELLAR_TESTNET_EXPLORER: "https://stellar.expert/explorer/testnet",
};

export default config;
