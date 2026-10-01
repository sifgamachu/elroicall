import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.elroicall.app",
  appName: "Elroi Calls",
  webDir: "../dist",
  backgroundColor: "#0b1918",
  server: { androidScheme: "https" },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    allowsLinkPreview: false,
  },
};
export default config;
