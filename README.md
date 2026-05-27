# HopON

HopON is a cross-platform companion application designed with a premium, dark-mode aesthetic. Its core mission is to solve the age-old problem of getting your squad online: with a single button press, it sends a high-priority push notification to your friends to "Hop On" and play. 

Beyond alerts, HopON serves as a social hub where you can share your gaming milestones, track media progress, log movies, and share music tracks within your exclusive friend groups.

## Application Architecture & Features

The app utilizes a nested routing structure featuring a modern and intuitive layout.

### 1. Main Navigation
Upon logging in anonymously, users are greeted with intuitive primary tabs:

* **Home**: A global social feed. This screen aggregates posts from all your friends. It features highly detailed, dynamic components that render rich media cards for:
  - Animation and show ratings
  - Movie logs
  - Music tracks
  - High-res image attachments
  - Social interactions (Likes, Comments, Reposts)
  - Recent activity feed showing your friends' latest posts

* **Squads**: The central hub for group management. Users can create new private squads or join existing ones. It lists all the squads the user is a member of using clean UI cards.
  - **Localized Feed**: It contains a private version of the social feed, showing only posts made by members of this specific squad.
  - **The "HOP ON" Button**: The crowning feature of the app. A massive, vibrant button pinned to the bottom of the screen. When pressed, it broadcasts a high-priority Push Notification to every member of the squad's physical device, alerting them to get online immediately.

* **Friends**: A dedicated screen for managing individual connections. It displays a clean list of the user's online and offline friends with options to add new ones and check their specific activity.

### 2. Additional Features & Screens
* **Recent Activity**: A dedicated list view to see all recent posts from your friends at a glance.
* **Profile & Settings**: Accessible by tapping the user's avatar. This screen handles user settings, profile customization, and preferences.
* **Push Notifications**: Receive alerts directly when your squad needs you.

## Tech Stack
- **Frontend**: React Native (Expo)
- **UI/UX**: Custom dark-mode styling, `@react-navigation`
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth
- **Notifications**: Expo Push Notifications
