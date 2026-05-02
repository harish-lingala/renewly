# Renewly Android App

This folder contains an Android wrapper for the Renewly MVP. The app loads the existing Renewly HTML/CSS/JavaScript from `app/src/main/assets` in an Android WebView.

## Build

Open `D:\ai-apps\renewly\android` in Android Studio, let Gradle sync, then run the `app` configuration on an emulator or device.

If Gradle is available on PATH later, the APK can be built with:

```powershell
gradle assembleDebug
```

For a signed release build, keep the keystore outside git and provide signing values through environment variables:

```powershell
$env:RENEWLY_KEYSTORE_FILE="D:\path\to\renewly-release.keystore"
$env:RENEWLY_KEYSTORE_PASSWORD="your-password"
$env:RENEWLY_KEY_ALIAS="renewly"
$env:RENEWLY_KEY_PASSWORD="your-password"
.\gradlew.bat assembleRelease
```

## Notes

- Data is local-first through WebView local storage.
- Image bill uploads can be previewed inside the app.
- PDF and non-image document uploads are tracked as metadata in this prototype.
