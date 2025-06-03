# 🚀 BruinNav - Next Steps to Run the App

## Immediate Actions Required

### 1. Get Google Maps API Key (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
4. Create an API Key
5. Replace `demo_key_replace_with_real_key` in `.env` file
6. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `android/app/src/main/AndroidManifest.xml` (line 16)

### 2. Set Up Development Environment

#### For Android Development:
```bash
# Install Android Studio from https://developer.android.com/studio
# Set environment variables (add to ~/.bashrc or ~/.zshrc):
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Create Android Virtual Device (AVD) in Android Studio
# API Level 35 recommended
```

#### For iOS Development (macOS only):
```bash
# Install Xcode from App Store
# Install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd ios
pod install
cd ..
```

### 3. Start the Backend (Optional)
```bash
# In a separate terminal, start the backend server
cd ../Backend
npm install
npm start
# Backend should run on http://localhost:5050
```

### 4. Run the App

#### Start Metro Bundler:
```bash
npm start
```

#### Run on Android:
```bash
# In a new terminal
npm run android
```

#### Run on iOS (macOS only):
```bash
# In a new terminal
npm run ios
```

## 🎯 What You'll See

1. **Login Screen**: Enter any email/password (demo mode available)
2. **Map Tab**: UCLA campus with landmarks (needs real API key for maps)
3. **Posts Tab**: Community notes with sample data
4. **Profile Tab**: User profile and settings

## 🔧 Troubleshooting Quick Fixes

### Maps Not Showing:
- Check Google Maps API key is correct
- Ensure Maps SDK is enabled in Google Cloud Console

### Build Errors:
```bash
# Clear cache and rebuild
npx react-native start --reset-cache
cd android && ./gradlew clean && cd ..
```

### Location Not Working:
- Grant location permissions when prompted
- Ensure device/emulator has location services enabled

## 📱 Demo Mode

If backend is not available, the app will offer demo mode with:
- Sample landmarks on the map
- Sample community posts
- Mock user data

## 🎉 Success Indicators

You'll know it's working when you see:
- Login screen with BruinNav logo
- Bottom navigation with 3 tabs
- Map centered on UCLA campus
- Sample posts in the Posts tab
- User profile in Profile tab

## 📞 Need Help?

Check these files for detailed information:
- `README.md` - Complete setup guide
- `setup.md` - Detailed configuration
- `IMPLEMENTATION_SUMMARY.md` - Technical details

---

**Ready to go!** The app is fully implemented and waiting for your Google Maps API key! 🗺️