# Renewly Play Store Prototype Checklist

## Current Upload Build

- App name: Renewly
- Package name: `com.amateurlabs.renewly`
- Version: `1.0`
- Version code: `1`
- Play Store upload file: `android/app/build/outputs/bundle/release/app-release.aab`
- Share/install test file: `android/app/build/outputs/apk/release/app-release.apk`

## Prototype Features Ready

- Android-first WebView app shell.
- Local-first records for automobiles and electronics.
- Add, edit, renew, archive, and view records.
- Document/photo metadata attached to records.
- Dashboard, records, calendar, documents, settings, search, and notification views.
- Android notification permission request for Android 13 and newer.
- Local reminder scheduling for 90, 30, 7, and 1 day before expiry.
- Reminder schedules are refreshed after edits and restored after device reboot.

## Play Console Steps

1. Create a new Play Console app named `Renewly`.
2. Use package name `com.amateurlabs.renewly`.
3. Upload `android/app/build/outputs/bundle/release/app-release.aab`.
4. Start with an Internal testing release.
5. Add testers using email list or Google Group.
6. Complete App content sections:
   - Privacy policy
   - Data safety
   - Ads declaration
   - App access
   - Content rating
   - Target audience
7. Add store listing assets:
   - 512 x 512 app icon
   - 1024 x 500 feature graphic
   - Phone screenshots
   - Short description
   - Full description

## Data Safety Draft

- Data is stored locally on the device in this prototype.
- No cloud sync is enabled yet.
- Users may enter names, vehicle or device details, policy dates, provider names, amounts, notes, and document references.
- Attached bill or policy photos are used only for the user's own record reference in the prototype.
- Notifications are used only for renewal and service reminders.

## Before Wider Release

- Add a public privacy policy page.
- Add cloud backup only after selecting the storage provider and account model.
- Test notification behavior on a real Android 13+ device.
- Increment `versionCode` before every new Play Console upload after the first release.
