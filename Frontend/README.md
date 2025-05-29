# BruinNav Frontend

BruinNav is a mobile app designed to help UCLA students navigate, understand, and connect with UCLA's complex and historic campus.

## Features

- **Interactive Map**: Google Maps integration with UCLA campus landmarks
- **Smart Search**: Find buildings, restrooms, study spots, and amenities
- **Community Notes**: Student-powered tips and information sharing
- **Building Details**: Hours, floor plans, and amenity information
- **User Profiles**: Personal accounts with post history and preferences

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (18 or newer)
- **React Native CLI**: `npm install -g @react-native-community/cli`
- **JDK 17** (for Android development)
- **Android Studio** with Android SDK (for Android development)
- **Xcode** (for iOS development, macOS only)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the Frontend directory:

```env
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API URL
API_BASE_URL=http://localhost:5050

# Firebase Configuration (if needed)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

### 3. Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps SDK for Android and iOS
4. Create credentials (API Key)
5. Add the API key to your `.env` file
6. For Android: Update `android/app/src/main/AndroidManifest.xml` with your API key:
   ```xml
   <meta-data
     android:name="com.google.android.geo.API_KEY"
     android:value="YOUR_ACTUAL_API_KEY_HERE" />
   ```

### 4. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 5. Android Setup

1. Open Android Studio
2. Open the `android` folder as an Android project
3. Let Gradle sync complete
4. Ensure you have an Android Virtual Device (AVD) set up

## Running the App

### Start Metro Bundler

```bash
npm start
```

### Run on iOS

```bash
npm run ios
```

### Run on Android

```bash
npm run android
```

## Project Structure

```
Frontend/
├── src/
│   ├── screens/          # App screens
│   │   ├── MapScreen.js
│   │   ├── PostsScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── LoginScreen.js
│   │   └── ...
│   ├── navigation/       # Navigation configuration
│   └── assets/          # Images and static assets
├── android/             # Android-specific code
├── ios/                 # iOS-specific code
└── package.json
```

## Key Dependencies

- **React Native**: 0.79.1
- **React Navigation**: Bottom tabs and stack navigation
- **React Native Maps**: Google Maps integration
- **React Native Vector Icons**: Icon library
- **AsyncStorage**: Local data storage
- **React Native Geolocation**: Location services

## Development Notes

### Android Permissions

The app requires the following permissions:
- `ACCESS_FINE_LOCATION`: For precise location tracking
- `ACCESS_COARSE_LOCATION`: For approximate location
- `INTERNET`: For API calls and map data

### iOS Permissions

Add location permissions to `ios/BruinNavFrontend/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>BruinNav needs location access to show your position on the map</string>
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **Android build failures**: Clean and rebuild with `cd android && ./gradlew clean && cd ..`
3. **iOS build failures**: Clean build folder in Xcode or run `cd ios && xcodebuild clean && cd ..`
4. **Maps not showing**: Verify your Google Maps API key is correct and has proper permissions

### Android Specific

- Ensure Android SDK is properly installed
- Check that ANDROID_HOME environment variable is set
- Verify emulator is running or device is connected

### iOS Specific

- Ensure Xcode command line tools are installed: `xcode-select --install`
- Check that iOS Simulator is available
- Verify CocoaPods is installed: `sudo gem install cocoapods`

## Backend Integration

The app is designed to work with a Node.js/Express backend. Update the `API_BASE_URL` in your `.env` file to point to your backend server.

Expected API endpoints:
- `GET /api/landmarks` - Fetch campus landmarks
- `GET /api/notes` - Fetch community posts
- `POST /api/notes` - Create new posts
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.
