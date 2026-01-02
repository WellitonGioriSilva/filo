export const palette = {
  // Brand
  brand: {
    primary: "#E7B008", // warm yellow for primary actions
    primaryDark: "#E7B008",
  },

  // Surfaces
  surfaces: {
    appBackground: "#1F2733", // deep navy background
    card: "#FFFFFF",
  },

  // Content
  content: {
    textPrimary: "#0F172A",
    textOnDark: "#FFFFFF",
    textMuted: "#93A4B7",
    label: "#23262F",
  },

  // UI chrome
  ui: {
    border: "#E9E9ED",
    inputBg: "#FFFFFF",
    inputPlaceholder: "#9CA3AF",
    shadow: "#000000",
  },
} as const;

export type Palette = typeof palette;
