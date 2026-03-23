# FindOut Media

React Native repo for the **FindOut Media** Mastodon instance, an ongoing project designed to rebuild the place for honest, real conversations.

This documentation serves as a comprehensive guide for developers, covering environment setup, project structure, building and releasing for iOS and Android, and configuring essential services like Push Notifications and Sentry.

## 📑 Table of Contents

- [1. Prerequisites](#prerequisites)
- [2. Setup](#setup)
- [3. Running in Development](#running-in-development)
- [4. Useful Scripts](#useful-scripts)
- [5. Cleaning & Cache Reset](#cleaning-cache-reset)
- [6. Building Android (Release)](#building-android)
- [7. Building-iOS (Release / App Store)](#building-ios)
- [8. Push Notifications Setup](#push-notification-setup)
- [9. Stallion and Sentry Setup](#stallion-sentry)
- [10. Troubleshooting](#troubleshooting)
- [11. CI/CD Setup](#ci-cd-setup)
- [12. Further Reading](#further-reading)

---

<a id="prerequisites"></a>

## 📌 1. Prerequisites

### **System Requirements**

- **macOS** (recommended — supports iOS + Android)
- **Windows/Linux** (Android only)

### **Core Tools**

| Tool               | Version / Notes              |
| ------------------ | ---------------------------- |
| Node.js            | LTS (v18+ recommended)       |
| Yarn or npm        | Yarn preferred               |
| Git                | latest                       |
| Java JDK           | JDK 17 recommended           |
| Android Studio     | latest stable                |
| Xcode (macOS only) | latest stable                |
| Cocoapods          | `sudo gem install cocoapods` |

**Notice:** This project uses **Yarn** for all installation, setup, development, and scripts. Please prefer `yarn` commands instead of `npm` to avoid dependency inconsistencies.

---

### 📁 Project Structure (High-Level Overview)

```
- `src/` — All application code (screens, components, hooks, services)
- `src/components/` — Custom reusable components
- `src/context/` — Global state & providers
- `src/hooks/` — Custom reusable hooks
- `src/navigation/` — Navigation stacks, tabs, routes
- `src/serivces/` - Service files for API fetching
- `src/store/` - Global state
- `src/translations/` - Translations
- `src/types/` - Queries types, navigation types, project API response types
- `src/utils/` — Helper utilities
- `assets/` — Images, fonts, icons
- `android/` — Native Android project
- `ios/` — Native iOS project
```

### 📚 Project Folder Responsibilities (Detailed Explanation)

This section helps new developers understand **what each folder is responsible for** and where to place new code.

#### `src/`

Main application source code. All core logic lives here.

#### `src/components/`

Reusable UI components:

- Buttons
- Inputs
- Cards
- Shared layout elements  
  Keep components small and stateless when possible.

#### `src/context/`

React Context providers.  
Used for global state that must be accessible throughout the app.

#### `src/hooks/`

Custom reusable hooks:

- API hooks (ex: `useAccountInfo`)
- UI hooks (ex: `useGradualAnimation`)
- Logic hooks (ex: `useStatus`)

#### `src/navigation/`

All navigation setup:

- Stack navigators
- Tab navigators
- Navigation types
- App entry navigation flow

#### `src/services/`

Business logic modules:

- API service calls
- Formatting/parsing API data  
  Keep API functions organized by feature (ex: `auth.service.ts`, `profile.service.ts`).

#### `src/store/`

Global state management
Store files should contain:

- App-wide state
- Actions
- Selectors

#### `src/translations/`

All translation JSON files.  
Organized per language (ex: `en/translation.json`, `fr/translation.json`, etc.).

#### `src/types/`

TypeScript types:

- API response types
- Navigation types
- Shared utility types

#### `src/utils/`

Helper utilities, formatting functions:

- Date/time helpers
- String helpers
- Validation helpers

#### `assets/`

Static assets:

- Images
- Icons
- Fonts

#### `android/` & `ios/`

Native platform-specific code and build configuration.

---

<a id="setup"></a>

## 📦 2. Setup

Clone the repo:

```bash
git clone https://github.com/patchwork-hub/findout-app
cd findout-app
```

Install dependencies

```bash
yarn
```

Install iOS pods (macOS only):

```bash
cd ios
pod install
cd ..
```

Setup environment variables:

Create a `.env` file at the project root:

```
# URL of your Mastodon instance
# -----------------------
API_URL: https://findout-media.social

# URL of Patchwork Dashboard (optional)
# This key is optional if you haven’t set up Patchwork Dashboard.
# -----------------------
DASHBOARD_API_URL: https://dashboard.channel.org

# Environment
# -----------------------
ENV_TYPE: production

# Client key and secret of Mastodon application
# Log in with the instance owner account and go to the /settings/applications page of your Mastodon instance.
# Create a new application with the scopes: read, profile, write, follow, and push.
# The ‘Client key’ value is used as the CLIENT_ID.
# The ‘Client secret' value is used as the CLIENT_SECRET_TOKEN.
# -----------------------
CLIENT_ID: YOUR_CLIENT_ID
CLIENT_SECRET_TOKEN: YOUR_CLIENT_SECRET

# Application monitoring tool
# Create an account on sentry.io and retrieve your API key.
# -----------------------
SENTRY_DSN: https://07f1a2a85e@o43dd22288.ingest.us.sentry.io/13727228

# GIF keyboard
# Create an account on tenor.com and retrieve your API key.
# -----------------------
TENOR_API_KEY: AIdusk8k28339md89229kdskdh
```

Make sure to restart the app after editing environment variables.

```
yarn start --reset-cache
```

---

<a id="running-in-development"></a>

## 🧪 3. Running in Development

OS (macOS only)

Start Metro (if it doesn't auto-start):

```
yarn start
```

Run iOS app:

```
yarn ios
# or
npx react-native run-ios
```

Android

Run Android app:

```
yarn android
# or
npx react-native run-android
```

---

<a id="useful-scripts"></a>

## 🧭 4. Useful Scripts

```
yarn format        # Auto-format using Prettier
yarn clean:android # Custom script for Android cleanup
yarn clean:ios     # Custom script for iOS cleanup
```

---

<a id="cleaning-cache-reset"></a>

## 🧹 5. Cleaning & Cache Reset (Important)

Reset Metro cache

```
yarn start --reset-cache
```

Android clean build

```
cd android
./gradlew clean
cd ..
```

iOS clean

```
cd ios
xcodebuild clean
cd ..
```

Full cleanup

```
rm -rf node_modules
rm -rf android/.gradle android/app/build
rm -rf ios/Pods ios/Podfile.lock
yarn
cd ios && pod install && cd ..
```

> Note: You can also run cleaning commands directly from package.json scripts, such as:
>
> - `yarn clean:ios`
> - `yarn clean:android`
> - `yarn clean:gradle`
> - `yarn clean:yarn`
>
> Tip: Most build issues in React Native can be fixed by doing a full cleanup. Perform this especially after dependency or native module updates.

---

<a id="building-android"></a>

## 🛠 6. Building Android (Release)

1. Generate a Keystore (run once per project)

```
keytool -genkey -v -keystore app-release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

Move it to:

```
android/app/app-release.keystore
```

Add your keystore configuration inside **android/app/build.gradle** under `android { signingConfigs { release { ... } } }`:

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

2. Build Release APK

```
cd android
./gradlew assembleRelease
```

APK path:

```
android/app/build/outputs/apk/release/app-release.apk
```

3. Build AAB (Play Store)

```
./gradlew bundleRelease
```

AAB path:

```
android/app/build/outputs/bundle/release/app-release.aab
```

---

<a id="building-ios"></a>

## 🍏 7. Building iOS (Release / App Store)

Archive with Xcode

Open workspace:

```
open ios/FindOutMedia.xcworkspace
```

Make sure the correct **Apple Developer Account** is selected:

- Open **Xcode → Settings → Accounts**
- Add your Apple ID if not already added
- Select your **Team** for signing

Select **Any iOS Device (arm64)** as the build target.

Check signing settings:

- Go to `FindOutMedia` project (top of Project Navigator)
- Select `FindOutMedia` target → **Signing & Capabilities**
- Ensure the correct **Team** is selected
- Ensure the **Bundle Identifier** matches the one registered in Apple Developer Console
- Ensure **Automatically Manage Signing** is enabled (recommended)

Then archive:

Product → Archive

Export or Upload via Organizer

---

<a id="push-notification-setup"></a>

## 🔔 8. Push Notification Setup (iOS & Android with Firebase)

Steps for preparing push notifications, FCM integration, and backend-triggered notifications.

### ✅ 1. Create Firebase Project

1. Go to **Firebase Console** → https://console.firebase.google.com
2. Click **Add project**
3. Enter project name (ex: `FindOut Media Production`)
4. Disable Google Analytics unless required
5. Finish project creation

### ✅ 2. Add Android App in Firebase

1. In Firebase → **Project Settings → General**
2. Under **Your Apps**, choose **Android**
3. Add:
   - **Package name** → must match the app bundle id: **com.findoutmedia.social**
4. Download the generated `google-services.json`
5. Place it in:

```
android/app/google-services.json
```

6. Rebuild Android app

### ✅ 3. Add iOS App in Firebase

1. In Firebase → **Project Settings → General**
2. Choose **iOS**
3. Add:
   - **com.qlub.social** → must match Xcode → target → Signing & Capabilities
4. Download `GoogleService-Info.plist`
5. Place it in:

```
ios/GoogleService-Info.plist
```

6. Rebuild iOS app

### ✅ 4. Add APNs `.p8` Key (iOS Push)

1. Go to **Apple Developer → Certificates, Identifiers & Profiles**
2. Open **Keys**
3. Press **Create**
4. Enable **Apple Push Notification service (APNs)**
5. Download:
   - `AuthKey_XXXXXX.p8`
6. Go to Firebase → **Project Settings → Cloud Messaging**
7. Under **APNs Authentication Key**:
   - Upload `.p8`
   - Enter **Key ID**
   - Enter **Team ID**

Firebase will handle **both Development & Production APNs** using the single `.p8` key.

> Important: The `.p8` key is sensitive. Do **not** commit it to the repository.

### ✅ 5. Enable Cloud Messaging

1. Firebase → **Cloud Messaging**
2. Ensure FCM API is enabled inside **Google Cloud Console**

### ✅ 6. Create Firebase Admin SDK Key (Backend Notification)

> This key is used by backend to send notifications to FCM.  
> This is **sensitive**, do not share it with anyone.

Steps:

1. Firebase Console → **Project Settings**
2. Open **Service Accounts**
3. Choose **Firebase Admin SDK**
4. Click **Generate New Private Key**
5. Download `project-admin-sdk.json`
6. Upload this JSON to the backend system (server)

7. Backend uses:

   - **project_id**
   - **private_key**

   to trigger FCM push notifications

> ⚠️ **Note:**  
> The `project_id` used by the backend **must match the same Firebase project** that the frontend (Android/iOS apps) are using.  
> If the backend uses a different Firebase project, push notifications **will not be delivered** because FCM tokens from the frontend belong to a different project.

### Summary of Files Required

| Platform | File                       | Purpose                  |
| -------- | -------------------------- | ------------------------ |
| iOS      | `GoogleService-Info.plist` | Firebase iOS config      |
| iOS      | `AuthKey_XXXXXX.p8`        | APNs push key            |
| Android  | `google-services.json`     | Firebase Android config  |
| Backend  | `firebase-admin-sdk.json`  | Backend push trigger key |

---

<a id="stallion-sentry"></a>

## 🛡️ 9. Stallion and Sentry Setup

### 📌 Stallion (For OTA Update)

1. Create project on Stallion Dashboard.
2. Get projectID: On project info page, copy `project_id`.
3. Generate `app_token`: Navigate to Project > Project Settings > Access Tokens, and select Generate or Regenerate App Token to create a new token.
4. Add StallionProjectId & StallionAppToken as shown below (example) -

- iOS: Add the copied App Token and projectId to info.plist

```
<plist version="1.0">
  <dict>
    <!-- ...other configs... -->
    <key>StallionProjectId</key>
    <string>YOUR_STALLION_PROJECT_ID</string>
    <key>StallionAppToken</key>
    <string>YOUR_STALLION_APP_TOKEN</string>
    <!-- ...other configs... -->
  </dict>
</plist>
```

- Android: Add the copied App Token and projectId to strings.xml

```
<resources>
  <string name="app_name">my_app</string>
  <!-- make sure app token starts with spb_... and is 46 characters long -->
  <string name="StallionProjectId">YOUR_STALLION_PROJECT_ID</string>
  <string name="StallionAppToken">YOUR_STALLION_APP_TOKEN</string>
</resources>
```

> For ref:
> Installion: https://learn.stalliontech.io/docs/sdk/installation
> Publish Bundle Usage & API Reference: https://learn.stalliontech.io/docs/cli/usage-api-reference

### 📌 Sentry

#### Steps to a Sentry Project

1. Go to the Sentry Dashboard: https://sentry.io
2. Log in or create an account.
3. On the left sidebar, click **Projects**.
4. Click **Create Project**.
5. Select **React Native** as the platform. Set your alert frequency.
6. Enter the project name (example: `FindOut Media App`).
7. Choose or create an **Organization**.
8. Click **Create Project**.
9. After creating the project, Sentry will present two setup options: **Automatic Configuration** and **Manual Configuration**. For this project, continue with **Manual Configuration**, as other setup steps have already been completed.

Copy **DSN** value and inside `.env`, add your Sentry DSN

```
SENTRY_DSN=YOUR_SENTRY_DSN
```

> After changing values in `.env `, please always run `yarn start --reset-cache`.

<a id="troubleshooting"></a>

## 🚨 10. Troubleshooting (Common Issues)

### Metro stuck or not reloading:

- Run `yarn start --reset-cache`

### Android build fails:

- Try `cd android && ./gradlew clean`

### iOS pods failing:

- Run `sudo gem install cocoapods`
- Then run `cd ios && pod repo update && pod install`

### App crashes on launch:

- Ensure environment variables are set correctly
- Reinstall app after major changes (`yarn ios` / `yarn android`)

---

<a id="ci-cd-setup"></a>

## 🚀 11. CI/CD Setup

This project uses **GitHub Actions** and **Fastlane** to automate testing and deployment.

#### Android (`android/fastlane/Fastfile`)

- **Action**: `release`
- **Steps**:
  - Build Release Bundle (`bundleRelease`).
  - Upload to Play Store (`internal` track).
- **Required Env Vars**: `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

#### iOS (`ios/fastlane/Fastfile`)

- **Action**: `release`
- **Steps**:
  - Increment build number.
  - Build App (`FindOutMedia` scheme).
  - Upload to App Store.

### GitHub Secrets Required

To enable the CI/CD pipeline, the following secrets must be set in your GitHub repository:

| Secret Name                                    | Description                                            |
| :--------------------------------------------- | :----------------------------------------------------- |
| `ANDROID_KEYSTORE_FILE_BASE64`                 | Base64 encoded `release.keystore` file.                |
| `ANDROID_JSON_KEY_FILE_BASE64`                 | Base64 encoded Google Play Service Account JSON.       |
| `ANDROID_KEYSTORE_PASSWORD`                    | Password for the Android keystore.                     |
| `ANDROID_KEY_ALIAS`                            | Alias name for the key.                                |
| `ANDROID_KEY_PASSWORD`                         | Password for the key alias.                            |
| `APPLE_ID`                                     | Apple ID email address.                                |
| `ITC_TEAM_ID`                                  | iTunes Connect Team ID.                                |
| `TEAM_ID`                                      | Apple Developer Team ID.                               |
| `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` | App-specific password for Apple ID.                    |
| `MATCH_PASSWORD`                               | Password for the match repo (if using fastlane match). |
| `ASC_KEY_ID`                                   | App Store Connect API Key ID.                          |
| `ASC_ISSUER_ID`                                | App Store Connect API Issuer ID.                       |
| `ASC_KEY_CONTENT_BASE64`                       | App Store Connect API Key content (Base64).            |

> **Note**: For iOS automation, ensure you have set up `MATCH_PASSWORD` and `ASC_KEY_ID` / `ASC_ISSUER_ID` if using Match, or manually configured signing secrets if extending the workflow.

---

<a id="further-reading"></a>

## 📚 12. Further Reading

React Native CLI Docs
https://reactnative.dev/docs/environment-setup

Android Build System
https://developer.android.com/studio/build

Xcode App Distribution
https://developer.apple.com/documentation/xcode/distributing-your-app-for-testing-and-release

React Navigation
https://reactnavigation.org/
