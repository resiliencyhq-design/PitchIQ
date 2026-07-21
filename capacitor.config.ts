import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.resiliencyhq.pitchiq',
  appName: 'PitchIQ',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https',
  },
};

export default config;
