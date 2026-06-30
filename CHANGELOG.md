## Changelog (v0.0.6)

### New Features & Fixes
- **Push Notifications on iOS**: Gracefully bypass push notification registration on iOS unsigned builds to prevent APNs entitlement errors.
- **Squad Security**: Restricted squad detail edits (avatar, name, wallpaper, ringtone) to squad owners only, securing against unauthorized modifications by general members.
- **Squad Alerts Sound**: Upgraded alert sound files from .ogg to .m4a format, enabling them to play flawlessly across both iOS and Android.
- **Followers Tracking**: Fixed an issue where reciprocal followers lists wouldn't update on accepting a friend request due to missing array initialization in the database.
- **UI Bug Fixes**: Corrected literal newline text rendering issues in the Calling Lobby screen and optimized navigation for the Quick Hop On menu to prevent animation race conditions.
- **Database Cleanup**: Wiped all guest/test data to provide a clean state.


## Changelog (v0.0.4)

### New Features & Fixes
- **Post Publishing Fix**: Resolved an issue where posts would fail to publish on iOS due to Firebase rejecting undefined values.
- **Friend Search Fix**: Improved the friend search functionality to be handle-only, case-insensitive, and correctly omit the '@' prefix, ensuring users (including guest accounts) can be easily found on both iOS and Android.

### Security Enhancements
- **Storage Lockdown**: Secured Firebase Storage rules with a strict default deny policy to prevent unauthorized file uploads (all legitimate media uploads now route securely through Cloudinary).
- **Profile Integrity**: Restricted Firestore `users` rules to prevent malicious modification of immutable properties (e.g., `uid`, `createdAt`).

### Under the Hood
- **Expo SDK 56 Upgrade**: Upgraded the project to Expo SDK 56 and React Native 0.85 to resolve Swift 6 concurrency issues in Xcode 16 on the iOS build pipeline.
- **Dependency Fixes**: Fixed missing `@expo/vector-icons` dependency that caused Metro bundler crashes during iOS IPA generation.
- **Android Build Fix**: Injected `google-services.json` into the CI/CD pipeline to ensure successful Android APK generation.


