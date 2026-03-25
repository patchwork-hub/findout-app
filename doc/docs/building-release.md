---
sidebar_position: 5
---

# Building for Release

## Android

### 1. Generate Keystore (Once per project)

```bash
keytool -genkey -v -keystore app-release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

Move it to `android/app/app-release.keystore`.

### 2. Configure Keystore in `android/app/build.gradle`

```gradle
android {
  signingConfigs {
    release {
      storeFile file("app-release.keystore")
      storePassword "<YOUR_KEYSTORE_PASSWORD>"
      keyAlias "release"
      keyPassword "<YOUR_KEY_PASSWORD>"
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled false
      proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
    }
  }
}
```

### 3. Build Release APK

```bash
cd android
./gradlew assembleRelease
```

Path: `android/app/build/outputs/apk/release/app-release.apk`

### 4. Build AAB (Play Store)

```bash
./gradlew bundleRelease
```

Path: `android/app/build/outputs/bundle/release/app-release.aab`

## iOS

### Archive with Xcode

1. Open workspace: `open ios/Patchwork.xcworkspace`
2. Ensure correct **Apple Developer Account** is selected in **Xcode → Settings → Accounts**.
3. Select **Any iOS Device (arm64)** as build target.
4. Check signing settings in **Patchwork** target → **Signing & Capabilities**.
5. Archive: **Product → Archive**.
6. Export or Upload via Organizer.
