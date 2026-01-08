export default {
  expo: {
    name: "Band Manager",
    slug: "band-manager",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "band-manager",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FB8500",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.bandmanager",
      usesAppleSignIn: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FB8500",
      },
      package: "com.yourcompany.bandmanager",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router", 
      "expo-secure-store",
      "expo-apple-authentication",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      trpcUrl: process.env.EXPO_PUBLIC_TRPC_URL,
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
