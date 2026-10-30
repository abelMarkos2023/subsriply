# Subscriply Project Guide

This guide records the issues encountered while building authentication and the dashboard, explains the fixes, and gives a beginner-friendly path for understanding the project.

## Project Snapshot

- App: Expo / React Native with Expo Router and TypeScript
- Expo SDK: 54
- Routes: `app/`
- Authentication: Clerk Expo SDK (`@clerk/expo`)
- Styling: NativeWind plus React Native `StyleSheet`
- Package manager: npm (`package-lock.json` is present)
- App entry point: `expo-router/entry`

Useful commands from the project root:

```powershell
npm install
npx expo start
npx expo start --web
npx expo install <expo-package>
npx tsc --noEmit
npm run lint
npx expo-doctor
```

Use `npx expo install` for Expo and native packages. It selects versions compatible with this project's SDK. `npx expo doctor` is not the doctor command; use `npx expo-doctor`.

## Bugs We Encountered

### 1. Clerk CLI did not launch through `npx` on Windows

**Symptom:** `npx clerk@latest init` reported an unsupported or missing `win32-x64` platform package.

**Cause:** The CLI's platform package was not resolved correctly by the one-shot `npx` installation in this Windows environment.

**Fix used:** Install Clerk's CLI globally, then run its executable from the project directory:

```powershell
npm install -g clerk@latest
Set-Location 'E:\React Native Apps\subscriply\my-app'
clerk --version
```

The CLI then authenticated and linked the project to the already-selected Clerk application. Use `Set-Location` in PowerShell; `cd /d` is Command Prompt syntax and caused a separate PowerShell error.

**How to avoid it:** In PowerShell, use `Set-Location 'path'`. If `npx clerk@latest` fails on Windows with the platform-package error, install the CLI globally and use `clerk`. Authenticate before pulling application-level configuration. Do not initialize a second app when this project is already linked to Clerk.

### 2. Clerk sign-in code used the wrong API generation

**Symptoms:** TypeScript reported that `setActive` did not exist and that the `create()` result had no `status` or `createdSessionId` fields.

**Cause:** The implementation mixed Clerk's older resource API with this project's current Clerk Expo Future/signal API. Current methods such as `signIn.password()` return `{ error }`; progress is read from the `signIn` resource itself.

**Fix:** Use the installed SDK's API consistently:

- Sign in with `signIn.password({ identifier, password })`.
- Check `signIn.status` and `signIn.supportedSecondFactors`.
- Complete a successful sign-in with `signIn.finalize()`.
- Create accounts with `signUp.password(...)`, send/verify email codes with `signUp.verifications`, and complete with `signUp.finalize()`.

**How to avoid it:** Treat installed package declarations and docs for the installed SDK generation as authoritative. Do not copy examples for a different Clerk version. Run `npx tsc --noEmit` after changing an auth flow.

### 3. Mobile password sign-in could require another verification step

**Symptom:** After entering a correct password on a mobile device, the UI displayed “Additional steps are required to complete sign in.”

**Cause:** Clerk can require Device Trust verification on a new device (`needs_client_trust`) or account MFA (`needs_second_factor`). The password was accepted, but the flow had not finished.

**Fix:** The sign-in screen now handles available second-factor strategies, sends email/SMS codes when needed, accepts the verification code, and finalizes when `signIn.status === "complete"`.

**How to avoid it:** Never treat every non-complete Clerk state as a generic failure. Branch on documented status values, inspect available factors, and give the user the corresponding next step. Test on a new device/session as well as an already-trusted browser.

### 4. Clerk SSO could not load its Expo auth-session dependency

**Symptom:** Social sign-in reported that `expo-auth-session` or `expo-web-browser` could not be loaded.

**Cause:** Clerk's Expo SSO flow depends on Expo auth-session/browser packages. `expo-web-browser` was present, but `expo-auth-session` was missing.

**Fix:** Install through Expo's SDK-aware installer:

```powershell
npx expo install expo-auth-session expo-web-browser
```

The installed Expo SDK 54 versions are recorded in `package.json` and `package-lock.json`. Restart Expo after installing native or SSO dependencies; if the bundler has stale state, restart with `npx expo start -c`.

**How to avoid it:** Follow the current Clerk Expo setup guide and install the listed native dependencies with `npx expo install`. Verify resolution with:

```powershell
npm ls expo-auth-session expo-web-browser
```

### 5. Clerk avatar URL was not a valid React Native image source

**Symptom:** TypeScript said a `string` could not be used as `ImageSourcePropType`.

**Cause:** Clerk's `user.imageUrl` is a URL string; React Native's `<Image source>` expects either a bundled asset or an object containing a URI.

**Fix:** Convert it to `{ uri: user.imageUrl }` and use the bundled avatar when the profile URL is absent:

```tsx
const imageSource = user.imageUrl ? { uri: user.imageUrl } : images.avatar;

<Image source={imageSource} />;
```

**How to avoid it:** Distinguish remote images from local assets. Remote URLs use `{ uri: url }`; local `require()` or imported assets are passed directly. Keep a fallback because profile images may be missing.

### 6. Expo Router showed a header and warned about missing auth routes

**Symptom:** The auth screens showed a default navigation header, and the router warned that route names such as `sign-in` or `(auth)` did not exist.

**Cause:** Expo Router route groups organize routes but are not literal paths. The actual screen names in the root stack are `(auth)/sign-in` and `(auth)/sign-up`.

**Fix:** Register the actual route names and set `headerShown: false` for each because the auth screen already draws its own brand header. See `app/_layout.tsx`.

**How to avoid it:** Compare stack screen names with the files under `app/`. Route groups in parentheses are omitted from public URLs, but are still part of the layout's route name. Check the browser/Metro console after adding routes.

### 7. A vertical FlatList was nested inside a ScrollView

**Symptom:** React Native warned that a VirtualizedList should not be nested inside a same-orientation ScrollView.

**Cause:** The dashboard wrapped a vertical `FlatList` in a vertical `ScrollView`. Both tried to own vertical scrolling, which interferes with virtualization and list performance.

**Fix:** Make the active-subscription `FlatList` the screen's vertical scroller. Put the profile header, balance, upcoming-subscription horizontal carousel, and section heading in `ListHeaderComponent`; put the trailing heading in `ListFooterComponent`. See `app/(tabs)/index.tsx`.

**How to avoid it:** Use one vertical `FlatList` or `SectionList` for a screen with a long list. Put surrounding content into list header/footer components. A horizontal carousel inside a vertical list is a different scrolling direction and is a common supported pattern; avoid putting another vertical virtualized list inside the vertical list.

### 8. Expo doctor was invoked with the wrong command

**Symptom:** `npx expo doctor` said the command was unsupported by the local CLI.

**Cause:** Expo Doctor is distributed as a separate CLI command.

**Fix:** Run:

```powershell
npx expo-doctor
```

This project passed all 18 checks after Clerk setup.

**How to avoid it:** Use the command documented for this project and SDK. If a tool prompts to download `expo-doctor`, approve it when you intend to run the check.

### 9. Expo install printed peer-dependency warnings

**Symptom:** Installing Clerk-related packages printed React peer dependency warnings and npm audit vulnerability counts.

**Cause:** Package peer ranges and the existing dependency tree can produce warnings even when Expo installs a compatible package version. Warnings are not, by themselves, proof that the feature failed.

**Fix used:** Verify the actual installed versions and run the project's typecheck, lint, and Expo Doctor checks. Do not use `npm audit fix --force` as a reflex; it can introduce breaking upgrades.

**How to avoid it:** Review the full warning, check `npm ls <package>`, and run tests/diagnostics before deciding whether a dependency change is needed. Handle unrelated audit findings separately.

## Clerk Setup: Step by Step

This project is already linked to a Clerk development application. These steps document the working setup and how to reproduce it without replacing the existing application.

### 1. Choose or confirm the Clerk application

- For this project, keep using the application already linked by the Clerk CLI.
- Never run `init` against a new application to “repair” an existing Clerk integration.
- If you need a different application, confirm that choice first. Linking a different app changes which credentials and provider configuration the project uses.
- To authenticate the CLI from PowerShell, run `clerk auth login` and complete the browser flow.

### 2. Install the Clerk Expo SDK and required packages

This project uses npm and Expo SDK 54. For a fresh integration, use the existing project's package manager and let Expo select native-compatible versions:

```powershell
npx expo install @clerk/expo expo-secure-store expo-auth-session expo-web-browser
```

For this already-integrated project, Clerk is linked and `@clerk/expo` is installed. Do not rerun initialization just to add a missing dependency; install only the missing package.

### 3. Configure development keys

The app needs the Clerk **publishable key** at the client boundary:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<development-publishable-key>
```

The key value belongs in the local `.env`, not in source code or documentation. If the project is linked and the CLI is authenticated, `clerk env pull` retrieves the development environment values. Restart Expo after changing `.env`.

**Never import, render, or bundle `CLERK_SECRET_KEY` in React Native code.** A variable prefixed with `EXPO_PUBLIC_` is intended to be exposed to the client; a secret key is not. Keep `.env` out of commits and rotate credentials if a secret has been exposed.

### 4. Add Expo config plugins

The current `app.json` includes `expo-secure-store`, `@clerk/expo`, and `expo-web-browser`. Expo config plugins apply native configuration during prebuild/build. After changing plugins, restart the development server and create a new native build when required; an already-installed native binary does not automatically gain new native modules.

### 5. Wrap the app with ClerkProvider

`app/_layout.tsx` wraps the router with:

- `ClerkProvider` from `@clerk/expo`
- `tokenCache` from `@clerk/expo/token-cache`
- the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

The provider must be above routes that call Clerk hooks. The token cache persists session tokens using secure storage.

### 6. Set up Expo Router screens

Auth route files live in `app/(auth)/` and the signed-in tabs are in `app/(tabs)/`. The root `Stack` registers the actual auth screen names and hides native headers because the auth pages include their own header. Keep route names in sync with the files.

### 7. Build the auth flows

The current custom flow uses Clerk's Future API:

- Sign-in: `useAuth()` for session state, `useSignIn()` for email/password and verification, `signIn.finalize()` to activate a completed session.
- Sign-up: `useSignUp()`, `signUp.password()`, `signUp.verifications.sendEmailCode()`, `verifyEmailCode()`, then `signUp.finalize()`.
- Social sign-in: `useSSO()` from `@clerk/expo/experimental` in `components/AuthSocialProviders.tsx`.
- Current configured providers: Google, Facebook, and X. Provider buttons in code must match enabled connections in the linked Clerk Dashboard application.

The Native API and provider settings must be enabled/configured in the Clerk Dashboard for the methods you offer. Production OAuth providers may require provider-specific credentials and native application identifiers. Test the actual OAuth flow on each platform; rendering a button alone does not prove that the external provider setup is complete.

### 8. Read signed-in user details

Use `useUser()` in a component rendered under `ClerkProvider`:

```tsx
const { isLoaded, user } = useUser();
```

Check `isLoaded` before relying on user data and check whether `user` is present. Useful values include `user.fullName`, `user.firstName`, `user.username`, `user.primaryEmailAddress?.emailAddress`, and `user.imageUrl`. Remote image URLs must be passed to React Native as `{ uri: user.imageUrl }`, with a local fallback.

### 9. Validate setup

From the project root:

```powershell
npm ls @clerk/expo expo-auth-session expo-web-browser expo-secure-store
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo start
```

Then manually test sign-up, email verification, sign-in on a new device, sign-out, and each enabled social provider. Auth requires live Clerk configuration, so a successful typecheck is not a substitute for testing the full flow.

## Beginner Learning Path

### 1. Learn the app structure

- `app/` contains routes. A file under this directory is usually a screen.
- `_layout.tsx` files configure navigators and providers.
- `(auth)` and `(tabs)` are route groups. Parentheses organize routes without appearing in the public URL.
- `components/` contains UI pieces reused by screens.
- `constants/` contains shared data, icons, images, and colors.
- `hooks/` contains reusable React hooks.
- `lib/` contains utility functions.

Start with `app/_layout.tsx`, then `app/(tabs)/_layout.tsx`, then one screen such as `app/(tabs)/index.tsx`.

### 2. Learn the React Native screen pattern

A screen is a function component. It reads state and props, returns JSX, and uses hooks such as `useState` for local state. Event handlers update state; React rerenders the component with the new state. For example, expanding a subscription card stores its ID in state so only that card appears expanded.

### 3. Learn Expo Router navigation

Use `Link` for declarative navigation and `router.replace()` for programmatic redirects. `replace` changes the current route rather than leaving the previous auth screen in the back stack. Route group names used in hrefs should match files under `app/`.

### 4. Learn list virtualization

`FlatList` renders visible rows efficiently and recycles work for longer lists. It needs stable keys (`keyExtractor`), row rendering (`renderItem`), and optionally separators and header/footer components. Avoid wrapping a vertical list in a vertical `ScrollView`; use list headers/footers for content around the rows.

### 5. Learn TypeScript from the errors

Types catch mismatches before runtime: a URL string is not an image source object, and an auth method's returned `{ error }` is not the same thing as the sign-in resource's `status`. Read the type error, inspect the installed SDK version/API, make a narrow correction, and rerun `npx tsc --noEmit`.

### 6. Learn mobile constraints

Use safe-area insets, scrollable content when the keyboard appears, appropriate keyboard types, disabled/loading states during network requests, and accessible labels for controls. Test on both a small screen and web; responsive behavior can differ across platforms.

### 7. Learn the design system already in the app

The shared palette is in `constants/theme.ts`, and Plus Jakarta Sans font faces are loaded in `app/_layout.tsx`. Prefer these existing colors, fonts, and spacing values over introducing unrelated styling. NativeWind classes are used in many screens; `StyleSheet` is also used where explicit React Native styles help.

### 8. Build a safe debugging habit

1. Reproduce the issue and note the exact symptom.
2. Locate the component that owns the behavior.
3. Follow the relevant state or data from its source to the UI.
4. Change only that behavior.
5. Run `npx tsc --noEmit` and `npm run lint`.
6. Test the screen in the actual target platform.
7. Do not log passwords, tokens, secret keys, verification codes, or unnecessary personal user data.

## Practical Next Steps

- Verify sign-up and sign-in on a physical Android/iOS device, including a new-device verification challenge.
- Check provider settings in Clerk Dashboard whenever a social button is added or removed.
- Replace demo subscription data in `constants/data.ts` with a persistent data source before treating the dashboard as production-ready.
- Add deliberate loading, empty, and error states when subscription data becomes asynchronous.
- Keep this guide updated when SDK versions, route structure, auth methods, or provider configuration changes.
