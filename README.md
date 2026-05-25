# HopON

HopON is a cross‑platform social networking and real‑time alert application for gamers. It lets users quickly notify their friends to join a game session with a single tap.

The app also provides a shared space where users can exchange memes, track anime, log movies, and share music playlists within private groups.

**Built with Antigravity AI.**

## Features

- **Instant group alerts** – Push notifications reach all squad members instantly.
- **Social feed** – View and interact with posts containing anime ratings, movie reviews, music tracks, and memes.
- **Friends management** – Search for users, send friend requests, and see online status.
- **Squad management** – Create, join, and chat within private squads.
- **Profile customization** – Update avatar, nickname, and preferences.

## Architecture

The application uses React Native with Expo, organized with a Bottom Tab Navigator for primary sections and a Stack Navigator for detailed screens.

- **Authentication** – Anonymous Firebase authentication.
- **Data storage** – Firebase Firestore for users, squads, and posts.
- **Notifications** – Expo Push Notifications for real‑time alerts.

## Screens Overview

- **LoginScreen** – Entry point to select a nickname and sign in anonymously.
- **HomeScreen** – Global feed showing posts from friends and squads.
- **FriendsScreen** – Search for users and manage friend connections.
- **DashboardScreen** – List of squads, with options to create or join.
- **SquadDetailScreen** – Squad‑specific feed and the **HOP ON** button to send alerts.
- **ProfileScreen** – User profile and settings.

## Tech Stack

- **Frontend**: React Native (Expo SDK 55)
- **Navigation**: `@react-navigation/bottom-tabs` and `@react-navigation/native-stack`
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth
- **Notifications**: Expo Push Notifications

## License

MIT

HopON is a cross‑platform social networking and real‑time alert application for gamers. It lets users quickly notify their friends to join a game session with a single tap.

The app also provides a shared space where users can exchange memes, track anime, log movies, and share music playlists within private groups.

**Built with Antigravity AI.**

## Features

- **Instant group alerts** – Push notifications reach all squad members instantly.
- **Social feed** – View and interact with posts containing anime ratings, movie reviews, music tracks, and memes.
- **Friends management** – Search for users, send friend requests, and see online status.
- **Squad management** – Create, join, and chat within private squads.
- **Profile customization** – Update avatar, nickname, and preferences.

## Architecture

The application uses React Native with Expo, organized with a Bottom Tab Navigator for primary sections and a Stack Navigator for detailed screens.

- **Authentication** – Anonymous Firebase authentication.
- **Data storage** – Firebase Firestore for users, squads, and posts.
- **Notifications** – Expo Push Notifications for real‑time alerts.

## Screens Overview

- **LoginScreen** – Entry point to select a nickname and sign in anonymously.
- **HomeScreen** – Global feed showing posts from friends and squads.
- **FriendsScreen** – Search for users and manage friend connections.
- **DashboardScreen** – List of squads, with options to create or join.
- **SquadDetailScreen** – Squad‑specific feed and the **HOP ON** button to send alerts.
- **ProfileScreen** – User profile and settings.

## Tech Stack

- **Frontend**: React Native (Expo SDK 55)
- **Navigation**: `@react-navigation/bottom-tabs` and `@react-navigation/native-stack`
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth
- **Notifications**: Expo Push Notifications

## Getting Started

### Prerequisites

- Node.js (>=18)
- npm or yarn
- Expo Go app (for testing on a physical device)

### Installation

```sh
git clone https://github.com/heavenlytalisman/HopON.git
cd HopON
npm install
npx expo start --android
```

Follow the on‑screen instructions to run the app in an emulator or on a device.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for bug fixes, features, or documentation improvements.

## License

MIT

HopON is a cross‑platform social networking and gaming alert application designed with a premium, dark‑mode aesthetic. It enables users to quickly rally their friends by sending high‑priority push notifications with a single tap.

Beyond real‑time alerts, HopON offers a social hub where gamers can share memes, track anime progress, log movies, and share Spotify tracks within their private groups.

**Developed with Antigravity AI.**

## Application Architecture & Screens

The app uses a nested routing structure with a Bottom Tab Navigator and a Stack Navigator.

### 1. Authentication
* **LoginScreen.js** – Entry point where users choose a nickname and authenticate anonymously via Firebase Auth.

### 2. Main Navigation (Bottom Tabs)
After logging in, users access three primary tabs:

* **HomeScreen.js** – A global social feed aggregating posts from friends. It features rich media cards for:
  - Anime ratings
  - Movie logs
  - Music tracks
  - High‑resolution memes and images
  - Social interactions (likes, comments, reposts)
* **FriendsScreen.js** – Manage connections, search for users, and send friend requests.
* **DashboardScreen.js** – Central hub for group management. Users can create or join private squads using a unique Group ID.

### 3. Nested Screens & Features
* **SquadDetailScreen.js** – Displays a squad‑specific feed and the **HOP ON** button, which broadcasts a push notification to all squad members.
* **ProfileScreen.js** – Accessed via the avatar in the header; handles user settings and profile customization.

## Tech Stack
- **Frontend**: React Native (Expo SDK 55)
- **UI/UX**: Custom dark‑mode styling, `@react-navigation/bottom-tabs`
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth with AsyncStorage persistence
- **Notifications**: Expo Push Notifications (`expo-notifications`)

## Getting Started

### Installation
1. Clone the repository.
2. Run `npm install`.
3. Run `npx expo start --localhost --android -c`.
4. Test the app using an Android emulator or the Expo Go app on a physical device.

## License
MIT

HopON is a cross-platform social networking and gaming alert application designed with a premium, dark-mode "Discord meets X (Twitter)" aesthetic. Its core mission is to solve the age-old problem of getting your squad online: with a single button press, it sends a high-priority push notification to your friends to "Hop On" and play. 

Beyond alerts, HopON serves as a social hub where gamers can share memes, track anime progress, log movies, and share Spotify tracks within their exclusive friend groups.

**Developed with Antigravity AI.**

## Application Architecture & Screens

The app utilizes a nested routing structure featuring a Bottom Tab Navigator and a Stack Navigator.

### 1. Authentication
* **LoginScreen.js**: The entry point of the application. It uses a sleek, Discord-inspired dark interface where users can choose a unique nickname and instantly authenticate anonymously via Firebase Auth. 

### 2. Main Navigation (Bottom Tabs)
Upon logging in, users are greeted with three primary tabs:

* **HomeScreen.js (Home Tab)**: A global, X-style (Twitter-like) social feed. This screen aggregates posts from all your friends. It features highly detailed, dynamic `FeedPost` components that render rich media cards for:
  - AniList-style anime ratings
  - Letterboxd-style movie logs
  - Spotify-style music tracks
  - High-res memes and image attachments
  - Social interactions (Likes, Comments, Reposts)

* **FriendsScreen.js (Friends Tab)**: A dedicated screen for managing individual connections. It displays a clean list of the user's online/offline friends with options to add new ones.

* **DashboardScreen.js (Squads Tab)**: The central hub for group management. Users can create new private squads or join existing ones using a unique Group ID. It lists all the squads the user is a member of using clean, Discord-channel-style UI cards.

### 3. Nested Screens & Features
* **SquadDetailScreen.js**: Tapping on a squad in the Squads tab opens this dedicated view. 
  - **Localized Feed**: It contains a private version of the social feed, showing only posts made by members of this specific squad.
  - **The "HOP ON" Button**: The crowning feature of the app. A massive, vibrant green button pinned to the bottom of the screen. When pressed, it broadcasts a high-priority Push Notification to every member of the squad's physical device, alerting them to get online immediately.

* **ProfileScreen.js**: Accessible by tapping the user's avatar in the top-right header of the main tabs. This screen handles user settings, profile customization, and preferences.

## Tech Stack
- **Frontend**: React Native (Expo SDK 55)
- **UI/UX**: Custom Discord-inspired styling, `@react-navigation/bottom-tabs`
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth (w/ AsyncStorage persistence)
- **Notifications**: Expo Push Notifications (`expo-notifications`)

## Getting Started

### Installation
1. Clone the repository.
2. Run `npm install`
3. Run `npx expo start --localhost --android -c`
4. Test the app using the Android Emulator or Expo Go.

## License
MIT
