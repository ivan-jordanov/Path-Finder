# PathFinder 🗺️

A React Native GPS activity tracking app built with **Expo** for recording, displaying, and exporting hiking routes and outdoor activities.

**Live Route Tracking** • **GPX Export** • **Route History** • **Map Visualization** • **Zoom Controls**

---

## 📱 Tech Stack

### Frontend
- **React Native 0.83.2** - Cross-platform mobile framework
- **Expo 55** - Managed workflow for React Native development
- **Expo Router** - File-based routing (Expo Router v55)
- **React 19.0.0** - Latest React features

### Maps & Location
- **react-native-maps 1.26.20** - Native map integration
- **MapTiler** - Custom outdoor map tiles (outdoor-v2 style)
- **expo-location** - High-accuracy GPS tracking (BestForNavigation)

### Data Storage & File Management
- **expo-sqlite** (~55.0.10) - Local SQLite database for route persistence
- **expo-file-system** - File I/O for GPX export
- **expo-sharing** - Native share sheet for GPX files

### Styling & UI
- **NativeWind** - Tailwind CSS for React Native
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **react-native-safe-area-context** - Safe area layout handling

### Development
- **Babel** - JavaScript transpiler
- **Metro** - React Native bundler

--

## 📱 Setup

### Prerequisites
- **Node.js** (v18+)
- **MapTiler API Key** (free at [maptiler.com](https://maptiler.com))

Create a `.env` file:
```env
EXPO_PUBLIC_MAPTILER_KEY=your_key_here
```

---

## 🤖 Android 

1. **Download APK**: [\[Link to APK\]](https://drive.google.com/file/d/1-4zO0bdx2ib1j9YDus9ROd-_-jFg9Uyb/view?usp=sharing)
2. **Install** on your device
3. **Start dev server** in your cloned repo:
   ```bash
   npm install
   npx expo start
   ```
4. Scan the QR code with the installed apk

---

## 🍎 iOS

> ⚠️ iOS builds are not supported in this release due to google maps API key restrictions, however if required I can implement one in a short amount of time.

---

## How AI helped me in this project

- In this project I utilized Claude for planning & architecture and github copilot for help with the coding itself. Claude was very useful during the planning stage where I was deciding my tech stack, such as choosing the most appropriate state management for this specific app, what DB would be appropriate for this use case by comparing pros and cons. On the other hand, github copilot handled the bulk of the implementation. From setting up the MapTiler integration to writing the SQLite persistence layer and the custom `useLocation` and `useTrackingActions` hooks, Copilot accelerated development considerably. Importantly, I made sure that I didn't blindly accept every prompt of AI-generated code, making sure to review, test, and adjust where needed.

- Below is a summary of optimizations Copilot helped me achieve, after reviewing potential improvements that could be made to the project and carefully prompting it without touching the functionality or UI.

### Core Improvements
- **Performance**: Memoization of polyline computations and components for smooth rendering with 1000+ GPS points
- **Memory Leaks**: Added cancellation tokens to prevent state updates after unmount
- **Error Handling**: Try/catch blocks for all async operations (database, file I/O, sharing)
- **React Hooks**: Fixed hook order violations and dependency arrays across all files

### Bug Fixes
- Fixed polyline disappearing during zoom (z-index management)
- Resolved Google Maps provider flickering on Android (`shouldReplaceMapContent` optimization)
- Fixed modal saving on first tap (removed blocking animation)
- Fixed other various errors

### Code Quality
- Extracted 30+ magic numbers into `constants/tracking.js`
- Added `React.memo()` to prevent unnecessary re-renders
- Implemented `useCallback` for stable function references

---

## 🎯 The Biggest Challenge

> **This was personally a very rewarding project to make, as I got a hands on experience planning & implementing relatively complex features with technologies I don't use on a daily basis. AI definitely helped me accelerate my workflow, especially after the initial planning period, though it also made it clear to me that there are some areas where humans definitely excel in & where 4 years of studying computer science play a huge role in helping.**
> **In particular, one of the biggest hurdles was with the map itself as it couldn't display properly initially. After some debugging I realised continuous prompts aren't enough to solve the issue of the map not displaying, so I took a thorough look in the react-native-maps docs & realised a google maps API key was required. This was not mentioned in the PDF of this assignment, however I think that was intentional. After generating an API key & experimenting with its implementation I built a developmental APK of this build as it was the only way for the key to be injected in the manifest(the API key is restricted to the SHA-1 of the APK). The issue still persisted regardless and after a lot of debugging and reviewing I discovered that the API key was somehow improperly configured, even though the UI on google suggested that everything was fine.**
> **Nevertheless I fixed the issue & it made me more aware of AI's weaknesses in certain areas, especially in implementation of specific libraries or using tools with version mismatches that can potentially cause issues in which the AI has a hard time reasoning out of.**

---

**Built with ❤️ using Expo, Claude & GitHub Copilot**
