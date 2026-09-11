import Constants from "expo-constants";

/**
 * The product name is still open (PRD §11). It lives in exactly one place —
 * `expo.name` in app.json — and every wordmark, headline and share watermark
 * reads it from here. Renaming the product is a one-field change.
 */
export const APP_NAME = Constants.expoConfig?.name ?? "Progress";
