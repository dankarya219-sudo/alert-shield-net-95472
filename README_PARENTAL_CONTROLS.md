# Parental Controls System

## Overview
This parental controls system provides parents with tools to monitor and manage their children's device usage, app access, and screen time.

## Features Implemented

### 1. Screen Time Tracking
- **Database Tables:**
  - `screen_time_sessions`: Tracks individual screen time sessions with start/end times
  - Automatically calculates daily usage in minutes
  - Real-time tracking with session start/end functionality

- **Components:**
  - `useScreenTime` hook: Manages screen time sessions and fetches daily usage
  - Parent dashboard shows total screen time used vs. limit
  - Child controls page shows remaining time with visual progress indicators

### 2. App Blocking
- **Database Tables:**
  - `blocked_apps`: Stores which apps are blocked for each child
  - `app_usage`: Tracks app usage duration and open frequency
  
- **Features:**
  - Parents can block/unblock specific apps
  - Real-time updates when app block status changes
  - Child view shows which apps are currently blocked
  - Tracks how many times apps are opened and for how long

### 3. Parental Controls Settings
- **Database Tables:**
  - `parental_controls`: Main settings table for each parent-child relationship
  
- **Settings:**
  - Screen time limits (in minutes)
  - School mode (with start/end times)
  - Bedtime mode (with start/end times)
  - Location tracking toggle
  - Social media blocking toggle

### 4. Schedule Management
- **School Mode:**
  - Restricts device usage during school hours
  - Customizable start and end times
  - Alerts child when school mode is active

- **Bedtime Mode:**
  - Limits device access during bedtime hours
  - Can span across midnight (e.g., 22:00 - 06:00)
  - Visual indicators when bedtime mode is active

### 5. Alerts System
- **Database Table:**
  - `screen_time_alerts`: Stores alerts for limit violations
  
- **Alert Types:**
  - Screen time limit exceeded
  - App restriction violations
  - Schedule mode notifications

### 6. Parent Dashboard (`/parent-dashboard`)
- View all connected children
- Switch between children to view their stats
- Quick stats: Status, Location, Screen Time, Battery
- Quick actions: Locate, Lock Device, Wipe Data
- Screen time progress with percentage indicator
- App usage list with block/unblock toggles
- Schedule management (School/Bedtime modes)
- Real-time updates for all parental control changes

### 7. Child Controls View (`/child-controls`)
- Shows remaining screen time with visual indicators
- Displays all blocked apps
- Shows app usage statistics for the day
- Active mode indicators (School/Bedtime mode)
- Schedule information
- Auto-tracks screen time sessions

## How It Works

### For Parents:
1. Navigate to `/parent-dashboard`
2. View connected children (must be connected via Family page first)
3. Select a child to view their stats
4. Toggle app blocks on/off
5. Enable/disable school and bedtime modes
6. Settings are saved automatically to the database

### For Children:
1. Navigate to `/child-controls`
2. View remaining screen time
3. See which apps are blocked
4. Check current restrictions (school/bedtime mode)
5. Screen time sessions are tracked automatically

## API Endpoints

### Edge Function: `check-parental-controls`
- **Purpose:** Validate if a child can access an app or continue using device
- **Input:** 
  - `appPackageName`: The package name of the app
  - `action`: The action being attempted (e.g., "open")
- **Output:**
  - `allowed`: Boolean indicating if action is permitted
  - `reason`: Why action was blocked (if applicable)
  - `screenTime`: Current usage stats

## Important Limitations

### Web App Limitations:
⚠️ **This is a web-based system with significant limitations:**

1. **Cannot Actually Block Apps:** 
   - Web apps cannot control or block native device apps
   - The blocking is "advisory only" - shows user which apps are blocked but cannot enforce it

2. **Cannot Track Native App Usage:**
   - Can only track usage within this web app
   - Cannot see or monitor usage of Instagram, TikTok, etc.
   - `app_usage` table would need to be populated by a native app

3. **Cannot Enforce Screen Time:**
   - Shows screen time limits but cannot lock the device
   - Users can close the browser and use other apps freely

4. **Cannot Control Device Features:**
   - Lock device, wipe data functions are UI-only
   - No actual device control possible from a web app

### For Real Enforcement:
To actually enforce these controls, you would need:

1. **Native Mobile App:**
   - Android: Device Administrator or Accessibility Service permissions
   - iOS: Screen Time API (limited) or MDM (Mobile Device Management)

2. **Capacitor/React Native:**
   - Could implement some controls using native plugins
   - Would require significant native code for each platform

3. **MDM Solution:**
   - Enterprise-grade device management
   - Requires company enrollment or complex setup

## Database Schema

### Key Tables:
- `parental_controls`: Main settings (1 per parent-child pair)
- `screen_time_sessions`: Individual usage sessions
- `app_usage`: Daily app usage aggregates
- `blocked_apps`: Apps blocked by parents
- `screen_time_alerts`: Alert history

### Security:
- All tables have Row-Level Security (RLS) enabled
- Parents can only manage their own children's controls
- Children can view but not modify their restrictions
- Real-time subscriptions for instant updates

## Future Enhancements

To make this production-ready, consider:

1. **Native App Development:**
   - Build actual native apps with device permissions
   - Implement real app blocking and screen time enforcement
   - Add device admin capabilities

2. **Content Filtering:**
   - Web filtering for browsers
   - Category-based app blocking
   - Age-appropriate content controls

3. **Advanced Analytics:**
   - Weekly/monthly usage reports
   - Usage trends and patterns
   - Productivity scoring

4. **Geofencing:**
   - Location-based app restrictions
   - School zone automatic controls
   - Safe zone notifications

5. **Communication:**
   - Parent-child messaging
   - Request more time feature
   - Override codes for emergencies
