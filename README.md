# HopON

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
