Hi GitHub Copilot! 👋 This file allows you to sync with the "vibe" and technical standards of the **Patchwork** project. Please treat the instructions below as the **source of truth** for code generation, refactoring, and architectural decisions.

---

## 🚀 **Identity & Purpose**

**Patchwork** is a community-focused mobile application for **Patchwork**, built with **React Native**. It integrates with social protocols (likely **Mastodon/Fediverse**) and content platforms (**WordPress**) to bring local news and social interactions to users.

- **Vibe**: Community-driven, modern, performant, and reliable.

---

## 🛠 **Tech Stack & Standards**

### **Core Frameworks**

- **React Native**: v0.80+ (New Architecture enabled).
- **Language**: **TypeScript** (Strict mode).
- **Navigation**: **React Navigation v7** (Stack, Bottom Tabs, Native Stack).
- **State Management**:
  - **Zustand** (Global client state).
  - **TanStack Query (React Query) v5** (Server state & caching).
- **Networking**: **Axios** (configured in `src/services/instance.ts`).
- **Styling**: **NativeWind (v2)** / Tailwind CSS.
- **Storage**: `react-native-mmkv` & `react-native-encrypted-storage`.

### **Key Libraries**

- **Forms**: `react-hook-form` + `zod` (if applicable) or strict validation.
- **I18n**: `i18next` / `react-i18next` (Translations in `src/translations`).
- **Icons**: FontAwesome (`@fortawesome/react-native-fontawesome`).
- **Lists**: `@shopify/flash-list` (Preferred over FlatList for performance).

---

## 🧠 **Coding Rules ( The "Vibe" )**

### **1. Component Structure**

- Use **Functional Components** with **Hooks**.
- Keep components **small and atomic**. Complex UI should be broken down into sub-components in `src/components`.
- **Styling**: Use utility classes (NativeWind) via the `className` prop (or `tw` helper if configured). Avoid `StyleSheet.create` unless absolutely necessary for dynamic values not supported by Tailwind.

```tsx
// ✅ GOOD
const PulseCard = ({ title }: { title: string }) => (
	<View className="bg-white p-4 rounded-lg shadow-sm">
		<Text className="text-lg font-bold text-gray-900">{title}</Text>
	</View>
);
```

### **2. State Management**

- **Server Data**: Use `useQuery` or `useMutation` from `@tanstack/react-query`. Do not store API data in Zustand or Context unless it needs global manipulation/persisting beyond caching.
- **Global App State**: Use **Zustand** stores (located in `src/store/`).
- **Local State**: Use `useState` or `useReducer`.

### **3. Navigation (React Navigation v7)**

- All navigators are in `src/navigators/`.
- Use strict typing for routes and navigation props (`NativeStackScreenProps`, etc.).
- Centralize route names in an enum or constant object if possible.

### **4. API & Services**

- All API calls live in `src/services/`.
- Use the pre-configured `instance` from `src/services/instance.ts` to ensure auth headers are attached.
- Handle errors gracefully, possibly logging to **Sentry** or showing user-friendly toasts.

### **5. TypeScript Defaults**

- **No `any`**: Use `unknown` if unsure, or define proper interfaces.
- **Props Interfaces**: Explicitly define `Props` for every component.
- **Data Models**: Reuse types from `Patchwork.Account` (or relevant project types) where applicable.

---

## 📂 **Folder Structure Map**

| Path               | Purpose                                       |
| :----------------- | :-------------------------------------------- |
| `src/components`   | Reusable UI blocks (Buttons, Cards, Headers). |
| `src/screens`      | Full page views (Screen components).          |
| `src/navigators`   | Navigation configuration (Stacks, Tabs).      |
| `src/services`     | API handling (Axios, Endpoints).              |
| `src/store`        | Zustand stores (Auth, Feed, Settings).        |
| `src/hooks`        | Custom React hooks.                           |
| `src/translations` | I18n JSON files & config.                     |
| `src/util`         | Helper functions, constants.                  |

---

## 🤖 **Behavioral Instructions for AI**

1.  **Check `package.json`**: Always verify installed versions before suggesting code (e.g., ensure RNHookForm v7 syntax).
2.  **Tailwind First**: Always attempt to style with NativeWind classes before reverting to `styles` objects.
3.  **Safety First**: When modifying `src/store` or `src/services`, ensure you aren't breaking the authentication flow in `instance.ts`.
4.  **Ask for Context**: If a file imports a type like `Patchwork.Account` that isn't visible, ask to see the type definition definition before assuming its structure.

**End of Vibe-Check.**
