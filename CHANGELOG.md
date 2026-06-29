# Changelog

## [0.0.2] - 2026-06-29

### Added
- Real-time username/handle uniqueness checking during Profile Edit and Registration.
- Auto-sanitization of auto-generated handles (removes spaces from legacy accounts and guest accounts).

### Fixed
- Fixed fatal app crashes caused by accessing undefined profile properties (e.g., `uid`, `nickname`, `handle`) in `FeedPost`, `FriendProfileScreen`, and various Squad screens.
- Fixed inability to like or reply to posts when profile backend sync was delayed.
- Fixed HopON Room voice calls failing to connect for users missing standard UIDs.
- Fixed Squad Incoming Alert notifications crashing the app when `nickname` was undefined.
- Fixed Squad Edit screen crashing when a squad member's profile was missing a `handle` or `uid`.
- Fixed the "Share Post to Instagram Story" feature throwing errors when profile data was incomplete.

### Security
- **Notification Spoofing Patched**: Enforced strict `senderId` validation in Firebase rules so malicious actors can no longer forge notifications pretending to be someone else.
- **Post Metrics Hardened**: Enforced mathematical constraints on `likes` in Firestore to prevent artificial inflation/manipulation of post metrics.
- **Forced Friendships Blocked**: Enforced strict document existence checks to prevent attackers from arbitrarily creating or overwriting friendships without a corresponding friend request.
