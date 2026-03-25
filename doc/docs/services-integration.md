---
sidebar_position: 6
---

# Services Integration

## Push Notification Setup (iOS & Android with Firebase)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com).
2. Create **Patchwork Production** (disable Analytics unless needed).

### 2. Android Setup

1. Add Android app: **Project Settings → General**.
2. Package name: `com.patchwork.demo`.
3. Download `google-services.json` and place in `android/app/google-services.json`.
4. Rebuild Android app.

### 3. iOS Setup

1. Add iOS app: **Project Settings → General**.
2. Bundle ID: `com.qlub.social`.
3. Download `GoogleService-Info.plist` and place in `ios/GoogleService-Info.plist`.
4. Rebuild iOS app.

### 4. APNs Setup (iOS Push)

1. **Apple Developer → Certificates, Identifiers & Profiles → Keys**.
2. Create key with **Apple Push Notification service (APNs)** enabled.
3. Download `.p8` key.
4. Upload to **Firebase → Project Settings → Cloud Messaging**.

> **Note:** Firebase handles both Development & Production APNs with a single `.p8` key.

### 5. Backend Notification Key

1. **Project Settings → Service Accounts**.
2. Generate **Firebase Admin SDK** key (`project-admin-sdk.json`).
3. Upload to backend for triggering FCM pushes.

---

## Stallion and Sentry Setup

### Stallion (OTA Update)

1. Create project on Stallion Dashboard.
2. Get `project_id`.
3. Generate `app_token`.
4. Add to configuration:

**iOS (`Info.plist`)**:

```xml
<key>StallionProjectId</key>
<string>YOUR_PROJECT_ID</string>
<key>StallionAppToken</key>
<string>YOUR_APP_TOKEN</string>
```

**Android (`strings.xml`)**:

```xml
<string name="StallionProjectId">YOUR_PROJECT_ID</string>
<string name="StallionAppToken">YOUR_APP_TOKEN</string>
```

### Sentry (Monitoring)

1. Create **React Native** project on Sentry.
2. Get **DSN**.
3. Add to `.env`:

```
SENTRY_DSN=YOUR_SENTRY_DSN
```
