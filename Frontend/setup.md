# BruinNav Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the Frontend directory with the following content:

```env
# Google Maps API Key - Get from Google Cloud Console
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API URL - Update to your backend server URL
API_BASE_URL=http://localhost:5050

# Firebase Configuration (optional)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

### 3. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create an API Key
5. Add the API key to your `.env` file
6. For Android: Update `android/app/src/main/AndroidManifest.xml` line 16 with your actual API key

### 4. Android Setup

1. Install Android Studio
2. Set up Android SDK (API level 35)
3. Set ANDROID_HOME environment variable
4. Create an Android Virtual Device (AVD)

### 5. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 6. Run the App

Start Metro bundler:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS (macOS only):
```bash
npm run ios
```

## Features Implemented

✅ **Authentication System**
- Login/Register screens
- AsyncStorage for user session management
- Automatic navigation based on auth state

✅ **Bottom Tab Navigation**
- Map tab with Google Maps integration
- Posts tab for community notes
- Profile tab with user management

✅ **Map Screen**
- Google Maps integration with UCLA region
- Location permissions and user location
- Landmark markers with different colors by type
- Search functionality for landmarks
- Building detail navigation

✅ **Posts/Community Notes**
- View community posts with voting
- Search and filter posts
- Create new posts with categories
- Tags and location support

✅ **Building Details**
- Floor plan viewer (placeholder)
- Hours of operation
- Amenities by floor
- Contact information

✅ **Profile Management**
- User stats and information
- Settings navigation
- Logout functionality

✅ **Android Compatibility**
- Android permissions configured
- Google Maps Android setup
- Material Design icons

## Backend Integration

The app expects these API endpoints:

- `GET /api/landmarks` - Fetch campus landmarks
- `GET /api/notes` - Fetch community posts
- `POST /api/notes` - Create new posts
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `GET /api/landmarks/:id/details` - Building details

## Demo Mode

If the backend is not available, the app will offer to continue in demo mode with sample data.

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**:
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build failures**:
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

3. **Maps not showing**:
   - Verify Google Maps API key is correct
   - Check that Maps SDK is enabled in Google Cloud Console
   - Ensure API key is added to AndroidManifest.xml

4. **Location not working**:
   - Check location permissions are granted
   - Ensure device/emulator has location services enabled

### Android Specific

- Ensure ANDROID_HOME is set: `export ANDROID_HOME=$HOME/Android/Sdk`
- Add to PATH: `export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`
- Verify emulator is running: `adb devices`

### iOS Specific (macOS only)

- Install Xcode from App Store
- Install Xcode command line tools: `xcode-select --install`
- Install CocoaPods: `sudo gem install cocoapods`