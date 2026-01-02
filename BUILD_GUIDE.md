# CHURCH APP BUILD ROADMAP
**Version:** 2.0 (Custom Design & Features)
**Author:** [Your Name]
**Tech Stack:** VS Code (React Native + Expo) + Google Sheets (Backend) + AI Assistant

---

## 🎨 DESIGN & PALETTE
*Copy this section. The AI needs these exact hex codes to style your app.*

*   **Primary Purple:** `#5e0c4a` (Main Background/Headers)
*   **Primary Gold:** `#f1bb65` (Buttons/Icons)
*   **Cream:** `#fff9e3` (Card Backgrounds)
*   **White:** `#ffffff` (Text on dark backgrounds)
*   **Darker Purple:** `#4a093d` (Pressed Button States)
*   **Darker Gold:** `#e0a84e` (Hover States)
*   **Accent Navy:** `#1a2132` (Footer/Special Sections)
*   **Hot Pink:** `#ff015b` (Devotional Highlights)
*   **Bright Blue:** `#1c64f2` (Zoom Button)
*   **Orange:** `#FFA725` (Links)
*   **Overlay:** `rgba(0, 0, 0, 0.7)` (For banners/images)

---

## PHASE 1: SETUP & CONFIGURATION

### Step 1: Initialize Project
Open your terminal and run:
```bash
npx create-expo-app church-app
cd church-app
npx expo start
```

### Step 2: Create Navigation Structure
Your app has 5 distinct tabs. We need a navigation system.

1.  **Install React Navigation:**
    Run these commands in your VS Code terminal:
    ```bash
    npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
    ```

2.  **Prompt the AI:**
    > "Set up React Navigation Bottom Tabs in my `App.js`. I need 5 tabs labeled: 'Home', 'Devotional', 'Announcements', 'Sermons', and 'Zoom'. Use the color palette provided: Primary Purple `#5e0c4a` for the active tab icon and Gold `#f1bb65` for the inactive tab icon. Use standard Material Community Icons for each tab."

3.  *The AI will generate the `App.js` code. Create a folder named `screens` and create empty files for each screen (e.g., `HomeScreen.js`, `DevotionalScreen.js`) to prevent errors.*

---

## PHASE 2: BACKEND SETUP (GOOGLE SHEETS)

### Step 3: The Master Database
We will use one Google Sheet with multiple Tabs (one for each feature).

1.  Create a Google Sheet named `ChurchMasterDB`.
2.  Create these Tabs at the bottom:
    *   **Tab 1: `Announcements`**
        *   Headers: `ID`, `Title`, `Date`, `Details`, `ImageURL`.
    *   **Tab 2: `Sermons`**
        *   Headers: `ID`, `Title`, `Date`, `Speaker`, `AudioURL`, `ThumbnailURL`.
    *   **Tab 3: `Devotionals`**
        *   Headers: `ID`, `Title`, `Verse`, `Content`, `Date`.
    *   **Tab 4: `Music`**
        *   Headers: `ID`, `Title`, `Artist`, `AudioURL`.
    *   **Tab 5: `Zoom`** (Optional if you want dynamic links, otherwise hardcode)
        *   Headers: `ID`, `MeetingName`, `Day`, `Time`, `Link`.

### Step 4: The Google Apps Script (Middleware)
1.  Open **Extensions > Apps Script** in the Sheet.
2.  **Prompt the AI:**
    > "I have a Google Sheet with 5 tabs: Announcements, Sermons, Devotionals, Music, Zoom. Write a Google Apps Script `doGet(e)` function. It should accept a parameter `type` (e.g., `?type=sermons`). If type is 'sermons', return the JSON data from the 'Sermons' tab. Do this for all 5 tabs. Return data as JSON with MimeType JSON."

3.  Paste the code, save, and Deploy as a Web App (**Access: Anyone**).
4.  **Copy the Web App URL.**

---

## PHASE 3: BUILDING SCREENS (FRONT END)

### Step 5: Screen 1 - Home
*   **Goal:** A welcoming dashboard with quick links.
*   **Prompt the AI:**
    > "Create `HomeScreen.js`. It should have a Cream background (`#fff9e3`). Add a welcome message 'Welcome to [Church Name]' in Primary Purple (`#5e0c4a`). Add a horizontal scroll section for 'Latest Announcements' that fetches data from `[YOUR_URL]?type=announcements`. Display them as cards with a white background and shadow."

### Step 6: Screen 2 - Devotionals
*   **Goal:** Read daily text.
*   **Prompt the AI:**
    > "Create `DevotionalScreen.js`. Fetch data from `[YOUR_URL]?type=devotionals`. Display a list of devotionals. Use the Hot Pink (`#ff015b`) color for the title. The 'Verse' should be in a styled quote box with a light border. The background should be Cream (`#fff9e3`)."

### Step 7: Screen 3 - Announcements
*   **Goal:** Detailed list of news.
*   **Prompt the AI:**
    > "Create `AnnouncementsScreen.js`. This is a full list view. Fetch `[YOUR_URL]?type=announcements`. Use a `FlatList`. Each item should have a title in Navy (`#1a2132`) and a date in gray text. When tapped, open a Modal (overlay) with `rgba(0,0,0,0.7)` background to show the full details."

### Step 8: Screen 4 - Sermons (The Complex One)
*   **Goal:** Download and Audio Play.
*   **Prompt the AI:**
    > "Create `SermonScreen.js`. Fetch `[YOUR_URL]?type=sermons`.
    > 1. Display the list of sermons.
    > 2. Add a 'Download' button (Gold `#f1bb65`) next to each item.
    > 3. When clicked, use `expo-file-system` to download the `AudioURL` to the local directory.
    > 4. Once downloaded, change the button text to 'Play' (Primary Purple).
    > 5. Use `expo-av` to play the audio.
    > 6. Style the cards with White background and Purple border."

### Step 9: Screen 5 - Zoom
*   **Goal:** One-click meeting access.
*   **Prompt the AI:**
    > "Create `ZoomScreen.js`. Fetch `[YOUR_URL]?type=zoom`. Display the meeting name, day, and time. Add a big button 'Join Meeting' using Bright Blue (`#1c64f2`). When pressed, it should open the `Link` using `Linking.openURL()`."

### Step 10: Screen 6 - Music Player
*   **Goal:** Background worship music.
*   **Prompt the AI:**
    > "Create `MusicScreen.js`. Fetch `[YOUR_URL]?type=music`. Display album artwork (use a placeholder image URL if empty) and the song title. Add a Play/Pause button using Gold (`#f1bb65`). Use `expo-av` to handle audio playback."

---

## PHASE 4: STYLING & POLISH

### Step 11: Global Styles
To ensure consistency, create a `theme.js` file.

*   **Prompt the AI:**
    > "Create a `theme.js` file that exports a constant object named `colors`. Add all my hex codes: primary purple, gold, cream, navy, hot pink, etc. Export a constant named `fonts` with sizes like `h1: 24`, `h2: 18`, `body: 14`."

*   *Update your AI prompts from now on:* "Import `colors` from `./theme` and use `colors.primary` instead of hardcoding hex codes."

---

## PHASE 5: ICONS & IMAGES

### Step 12: Adding Visuals
*   **Prompt the AI:**
    > "I am using `@expo/vector-icons`. In `App.js` (Navigation), assign the following icons to tabs:
    > Home: `home`
    > Devotional: `book-open-variant`
    > Announcements: `bullhorn`
    > Sermons: `microphone`
    > Zoom: `video`

---

## 🧪 AI PROMPT LIBRARY (Use for Updates)

*   **Fixing Colors:** "The background of `MusicScreen` is currently white. Please change it to Cream (`#fff9e3`) and change the text color to Navy (`#1a2132`)."
*   **Adding Images:** "In `DevotionalScreen`, add an `Image` component at the top of the card using the URL from the `ImageURL` column in the data."
*   **Zoom Logic:** "I want the Zoom meeting to open automatically at the specific time. Is this possible in React Native background tasks? (Note: AI will likely say it's hard for beginners, suggest keeping it manual for now)."

---

## 📋 FINAL CHECKLIST
- [ ] Navigation Bar works with correct colors (Purple/Gold).
- [ ] Home Screen shows announcements.
- [ ] Devotional Screen shows Hot Pink highlights.
- [ ] Sermon Screen can download and play audio offline.
- [ ] Zoom Screen opens the link.
- [ ] Music Screen plays tracks.
- [ ] All screens have Cream/White backgrounds consistent with palette.
