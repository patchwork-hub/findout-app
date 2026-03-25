---
sidebar_position: 7
---

# CI/CD

## Overview

This project uses **GitHub Actions** and **Fastlane** to automate testing and deployment.

### Android (`android/fastlane/Fastfile`)

- **Action**: `release`
- **Steps**:
  - Build Release Bundle (`bundleRelease`).
  - Upload to Play Store (`internal` track).
- **Required Env Vars**: `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

### iOS (`ios/fastlane/Fastfile`)

- **Action**: `release`
- **Steps**:
  - Increment build number.
  - Build App (`Patchwork` scheme).
  - Upload to App Store.

## GitHub Secrets

### Required for Deployment

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

> **Note:** For iOS automation, ensure you have set up `MATCH_PASSWORD` and `ASC_KEY_ID` / `ASC_ISSUER_ID` if using Match, or manually configured signing secrets.
