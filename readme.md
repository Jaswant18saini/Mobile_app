Instrustions for installing React native app in windows:
 Use Chocolatey for Installation
 Java SE Development Kit (JDK), Node Lts ( if already installed node make sure it is Node 14 or newer)
 choco install -y nodejs-lts openjdk11
 Download and install Android Studio
 React Native app with native code,, requires the Android 12 (S) SDK in particular. Additional Android SDKs can be installed through the SDK Manager in Android Studio.
 Select the "SDK Platforms" tab from within the SDK Manager, then check the box next to "Show Package Details" in the bottom right corner. Look for and expand the Android 12 (S) entry
• Check the following items
Android SDK Platform 31
• Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image
 select the "SDK Tools" tab and check the box next to "Show Package Details" here as well. Look for and expand the Android SDK Build-Tools entry, then make sure that 31.0.0 is selected.
 click "Apply" to download and install the Android SDK and related build tools

 Configure the ANDROID_HOME environment variable

 Open the Windows Control Panel.
 Click on User Accounts, then click User Accounts again
 Click on Change my environment variables
 Click on New... to create a new ANDROID_HOME user variable that points to the path to your Android SDK:

Variable Name : ANDROID_HOME
Variable Value: You can find the actual location of the SDK in the Android Studio "Settings" dialog, under Appearance & Behavior → System Settings → Android SDK.
To verify

1. Copy and paste Get-ChildItem -Path Env:\ into powershell and Verify ANDROID_HOME has been added

Add platform-tools to Path

1. Open the Windows Control Panel.
2. Click on User Accounts, then click User Accounts again
3. Click on Change my environment variables
4. Select the Path variable.
5. Click Edit.
6. Click New and add the path to platform-tools to the list.

Default Location %LOCALAPPDATA%\Android\Sdk\platform-tools

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res




Commands for Apk  Testing (run on terminal)
 
-react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res 
-cd android
-./gradlew assembleDebug

Apk path that can be installed over mobile 
Mobile_app/android/app/build/outputs/apk/debug/app-debug.apk
