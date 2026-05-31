# HopON

HopON is a cross-platform companion application designed with a premium, dark-mode aesthetic. Its core mission is to solve the age-old problem of getting your squad online: with a single button press, it sends a high-priority push notification to your friends to "Hop On" and play. 

Beyond alerts, HopON serves as a social hub where you can share your gaming milestones, track media progress, log movies, and share music tracks within your exclusive friend groups.

## Application Architecture & Features

The app utilizes a nested routing structure featuring a modern and intuitive layout.

### 1. Main Navigation
Upon logging in, users are greeted with intuitive primary tabs:

* **Home**: A dashboard giving you a quick overview of who's online, your onboarding progress, and a sneak peek into recent activity from your friends.
* **Squads**: The central hub for group management. Users can create new private squads or join existing ones using a clean, card-based interface.
* **HOP ON (Center FAB)**: The crowning feature of the app. A massive, vibrant floating action button pinned to the center of the tab bar. When pressed, it opens a quick-select menu to broadcast a high-priority Push Notification to your squad, alerting them to get online immediately.
* **Feed**: A dedicated global social feed. This screen aggregates posts from all your friends. It features a rich composer and detailed, dynamic components that render media cards for:
  - Anime and game attachments
  - Movie logs and ratings
  - Music tracks
  - GIF and image attachments
  - Social interactions (Likes, Comments)
* **Profile**: A dedicated tab for handling your personal settings, customizable avatar, and preferences.

### 2. Additional Features & Screens
* **Friends List**: A dedicated screen accessible from the Home tab for managing individual connections. It displays a clean list of the user's online and offline friends with options to search and add new ones.
* **Push Notifications**: Receive real-time alerts directly when your squad needs you.
* **Guest Authentication**: Frictionless entry using Firebase anonymous login to get you right into the action.

## Tech Stack
- **Frontend**: React Native (Expo)
- **UI/UX**: Custom dark-mode styling, `@react-navigation/bottom-tabs` & `@react-navigation/native-stack`
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth
- **Notifications**: Expo Push Notifications
