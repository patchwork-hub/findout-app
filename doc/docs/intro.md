---
sidebar_position: 1
---

# Introduction

**Patchwork** is a React Native repo for the Patchwork Mastodon instance, an ongoing project designed to rebuild the place for honest, real conversations.

This documentation serves as a comprehensive guide for developers, covering environment setup, project structure, building and releasing for iOS and Android, and configuring essential services like Push Notifications and Sentry.

## Prerequisites

### System Requirements

- **macOS** (recommended — supports iOS + Android)
- **Windows/Linux** (Android only)

### Core Tools

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
