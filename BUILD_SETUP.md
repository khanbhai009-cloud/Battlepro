# BattlePro APK Build Setup

## Overview
This project is configured to automatically build 3 separate APKs (User, Staff, Admin) via GitHub Actions workflow.

## Configuration Files

### JSON Configurations (Capacitor)
Each variant has its own configuration file:

- **`cap.user.json`**: User app
  - App ID: `com.battlepro.user`
  - Entry URL: `https://battlepro.vercel.app/home`

- **`cap.staff.json`**: Staff app
  - App ID: `com.battlepro.staff`
  - Entry URL: `https://battlepro.vercel.app/staff/matches`

- **`cap.admin.json`**: Admin app
  - App ID: `com.battlepro.admin`
  - Entry URL: `https://battlepro.vercel.app/admin/dashboard`

### Asset Files
Each variant has a unique icon/asset:
- `assets/user.jpg` - User app icon
- `assets/staff.png` - Staff app icon
- `assets/admin.png` - Admin app icon

## GitHub Actions Workflow

### File Location
`.github/workflows/build-all.yml`

### What It Does
1. **Triggers**: On every push to `main` branch or manual workflow dispatch
2. **Environment Setup**:
   - Checks out repository
   - Sets up Node.js 18 with npm caching
   - Sets up JDK 17 with gradle caching
   - Installs npm dependencies

3. **For Each Variant** (User, Staff, Admin in parallel):
   - Copies the appropriate `cap.*.json` to `capacitor.config.json`
   - Copies the appropriate asset as `assets/icon.png`
   - Generates Capacitor assets
   - Syncs Capacitor with Android project
   - Cleans gradle build cache (important for variant switching)
   - Builds release APK using `./gradlew assembleRelease`
   - Renames output: `BattlePro-User.apk`, `BattlePro-Staff.apk`, `BattlePro-Admin.apk`

4. **Artifacts**:
   - All 3 APKs are uploaded as a single artifact: `BattlePro-APKs`
   - Retention: 7 days
   - Accessible from workflow run details

## How to Build Locally

### Prerequisites
```bash
# Install dependencies
npm install

# Set up Android environment (if not already done)
npx cap init --web-dir dist
```

### Build User APK
```bash
cp cap.user.json capacitor.config.json
cp assets/user.jpg assets/icon.png
npx capacitor-assets generate --android
npx cap sync android
cd android && chmod +x gradlew && ./gradlew clean assembleRelease
cp app/build/outputs/apk/release/app-release-unsigned.apk ../BattlePro-User.apk
```

### Build Staff APK
```bash
cp cap.staff.json capacitor.config.json
cp assets/staff.png assets/icon.png
npx capacitor-assets generate --android
npx cap sync android
cd android && ./gradlew clean assembleRelease
cp app/build/outputs/apk/release/app-release-unsigned.apk ../BattlePro-Staff.apk
```

### Build Admin APK
```bash
cp cap.admin.json capacitor.config.json
cp assets/admin.png assets/icon.png
npx capacitor-assets generate --android
npx cap sync android
cd android && ./gradlew clean assembleRelease
cp app/build/outputs/apk/release/app-release-unsigned.apk ../BattlePro-Admin.apk
```

## Downloading APKs

### From GitHub Actions
1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Find the latest **Build 3 APKs** workflow run
4. Scroll down to **Artifacts** section
5. Download **BattlePro-APKs** (contains all 3 APKs)

## File Structure

```
/workspaces/Battlepro/
├── .github/
│   └── workflows/
│       └── build-all.yml          # CI/CD workflow
├── android/
│   ├── app/
│   │   └── build/
│   │       └── outputs/apk/release/  # Built APKs
│   └── gradlew                    # Gradle wrapper (must be executable)
├── assets/
│   ├── user.jpg                   # User app icon
│   ├── staff.png                  # Staff app icon
│   └── admin.png                  # Admin app icon
├── cap.user.json                  # User variant config
├── cap.staff.json                 # Staff variant config
├── cap.admin.json                 # Admin variant config
└── capacitor.config.json          # Active config (copied during build)
```

## Troubleshooting

### APK Build Fails in GitHub Actions
- **gradlew permission denied**: The workflow automatically chmod's gradlew, but if it fails, ensure `.gitattributes` contains the correct entries for script files
- **Build cache issues**: The workflow uses `./gradlew clean` between builds to ensure proper variant switching
- **Java version mismatch**: Workflow uses JDK 17, ensure local development uses same version

### Different APK IDs Don't Work
- Verify `cap.*.json` files have unique `appId` values
- The `appId` must be different for each variant to be installable simultaneously

### APKs Not Appearing in Artifacts
- Check workflow logs for build errors
- Ensure APK output path is correct: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Next Steps (Optional)

### Signing APKs
For production, you'll need to sign APKs. Update the workflow to:
1. Add signing keystore to GitHub Secrets
2. Configure `android/app/build.gradle` with signing config
3. Use `./gradlew assembleRelease` with signing credentials

### Versioning
Add version handling in the workflow to:
1. Increment build numbers from git tags
2. Include version in APK names: `BattlePro-User-v1.0.0.apk`

## Support
For issues related to:
- **Capacitor**: See [Capacitor Docs](https://capacitorjs.com/docs)
- **Gradle**: See [Gradle Docs](https://gradle.org/docs)
- **GitHub Actions**: See [GitHub Actions Docs](https://docs.github.com/en/actions)
