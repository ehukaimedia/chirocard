---
description: How to run the app on a physical iPhone
---
# How to Run on iPhone

Follow these steps to deploy your Chirocard app to a physical iPhone for testing.

## Prerequisites
- A Mac with Xcode installed.
- An Apple ID (free or paid developer account).
- A USB cable to connect your iPhone.

## Steps

1.  **Build the Web App & Sync**
    Make sure your latest changes are built and synced to the iOS project.
    ```zsh
    npm run mobile:build
    ```

2.  **Open Xcode**
    Open the iOS project in Xcode.
    ```zsh
    npm run mobile:open:ios
    ```

3.  **Connect Your iPhone**
    - Plug your iPhone into your Mac using a USB cable.
    - Unlock your iPhone.
    - If asked, tap **"Trust This Computer"** on your iPhone.

4.  **Select Your Device in Xcode**
    - In the top toolbar of Xcode, look for the device selector (usually shows "Generic iOS Device" or a simulator name like "iPhone 15").
    - Click it and select your connected iPhone from the list.

5.  **Configure Signing (First Time Only)**
    - In the left sidebar (Project Navigator), click on **"App"** (the blue icon at the top).
    - Select the **"App"** target in the main view.
    - Go to the **"Signing & Capabilities"** tab.
    - Under the **"Team"** dropdown, select your Apple ID (Personal Team).
        - *Note: If you don't see your account, click "Add an Account..." and log in with your Apple ID.*
    - Ensure "Automatically manage signing" is checked.
    - Xcode will create a provisioning profile.

6.  **Run the App**
    - Click the **Play** button (▶️) in the top-left corner of Xcode context.
    - Xcode will build the app and install it on your phone.

7.  **Trust the App on iPhone (First Time Only)**
    - If you see an "Untrusted Developer" error on your phone:
        - Go to **Settings** > **General** > **VPN & Device Management** (or "Profiles & Device Management").
        - Tap on your Apple ID email under "Developer App".
        - Tap **"Trust [Your Email]"**.

8.  **Launch**
    - Tap the app icon on your home screen to launch it!

## Troubleshooting
- **Build Failed?** Check the errors in Xcode. Often it's a signing issue (Team not selected).
- **Device Not Found?** Unplug and replug the USB cable. Make sure to "Trust" the computer.
