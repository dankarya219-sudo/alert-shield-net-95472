# Geofencing & Safe Zones System

## Overview
The geofencing system allows parents to create safe zones and receive real-time alerts when their children enter or leave designated areas.

## Features Implemented

### 1. Safe Zone Management (`/safe-zones`)
Parents can:
- Create multiple safe zones for each child
- Define zone name, location (latitude/longitude), and radius
- Toggle entry and exit notifications independently
- View all active safe zones in a list
- Delete safe zones when no longer needed

### 2. Database Schema

**safe_zones table:**
- Stores safe zone definitions with coordinates and radius
- Configurable entry/exit notification preferences
- Active/inactive status toggle
- Linked to parent and child IDs

**geofence_events table:**
- Historical log of all entry/exit events
- Records exact location when event occurred
- Timestamped for tracking patterns

**geofence_alerts table:**
- Parent notifications for geofence events
- Read/unread status tracking
- Custom messages for each alert type

### 3. Real-Time Geofence Detection

**Edge Function: `check-geofence`**
- Automatically called when location updates
- Uses Haversine formula for accurate distance calculation
- Detects zone entry/exit events
- Creates alerts when notification settings are enabled
- Maintains state to prevent duplicate alerts

**How It Works:**
1. User's location is tracked via the Map page
2. Location is stored in `user_locations` table
3. Edge function checks distance to all active safe zones
4. Compares current position with last known state
5. Triggers entry/exit events and alerts as needed

### 4. Map Visualization
- Safe zones displayed as blue circles on the map
- Radius shown accurately in meters
- Interactive popups show zone details
- Real-time updates when zones are created/modified
- Separate display from danger zones (red/yellow markers)

### 5. Parent Alerts System
- Real-time notifications via Supabase Realtime
- Toast notifications when alerts are received
- Alert history viewable on Safe Zones page
- Mark alerts as read functionality
- Separate notifications for entry vs. exit events

### 6. Multi-Child Support
- Parents can create different safe zones for each child
- Child selector on Safe Zones page
- Independent zone configurations per child
- Bulk zone management capabilities

## Usage Flow

### For Parents:
1. Navigate to **Parent Dashboard** → **Geofencing** or directly to `/safe-zones`
2. Select which child to manage
3. Click **"Create Safe Zone"**
4. Enter zone details:
   - Name (e.g., "Home", "School", "Grandma's House")
   - Location coordinates (or use current location)
   - Radius in meters (50-5000m)
   - Toggle entry alerts on/off
   - Toggle exit alerts on/off
5. Save the zone
6. Zone appears on map as blue circle
7. Receive alerts when child enters/exits

### For Children:
- Location is tracked automatically via Map page
- Each location update triggers geofence check
- No child-facing UI required (runs in background)
- Can view their safe zones (read-only)

## Technical Details

### Distance Calculation
Uses the Haversine formula for accurate distance between two GPS coordinates:
```typescript
function calculateDistance(lat1, lon1, lat2, lon2): meters {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

### State Management
- Stores last event type (entry/exit) per zone
- Only triggers alert when state changes
- Prevents duplicate alerts for same zone
- Thread-safe via database transactions

### Real-Time Updates
- Supabase Realtime subscriptions for:
  - Safe zone changes
  - New geofence alerts
  - Event history
- Instant UI updates across all connected clients
- Toast notifications for new alerts

## Security

**Row-Level Security (RLS) Policies:**
- Parents can only manage zones for their children
- Children can view but not modify their zones
- Events are user-scoped (can only insert own events)
- Parents can view child's geofence events
- Alerts are parent-scoped with read access only

## Performance Considerations

1. **Efficient Distance Checks:**
   - Only checks active zones
   - Batch processing for multiple zones
   - Minimal database queries

2. **Event Deduplication:**
   - Tracks last event per zone
   - State-based triggering
   - Prevents alert spam

3. **Scalability:**
   - Indexed database queries
   - Optimized geospatial calculations
   - Real-time subscriptions with filters

## Limitations & Future Enhancements

### Current Limitations:
1. **Web-Based GPS:**
   - Requires browser permission for location
   - Less accurate than native GPS
   - Battery drain on continuous tracking
   - May not work in background

2. **Manual Location Updates:**
   - User must have Map page open
   - Not true background tracking
   - Dependent on user interaction

3. **Simple Circular Zones:**
   - Only supports radius-based circles
   - No polygon or complex shape support

### Future Enhancements:
1. **Native Mobile App:**
   - True background location tracking
   - Battery-efficient geofencing APIs
   - Push notifications even when app closed
   - More accurate GPS

2. **Advanced Zone Shapes:**
   - Polygon geofences
   - Multiple overlapping zones
   - Time-based zones (active only during certain hours)

3. **Smart Alerts:**
   - Configurable alert frequency
   - Quiet hours (no alerts during bedtime)
   - Batch notifications (daily summary)
   - Smart detection (ignore quick entry/exit)

4. **Enhanced Features:**
   - Historical heatmaps
   - Common routes detection
   - Predictive alerts
   - Multiple parent notifications
   - Emergency zone priorities

5. **Integration:**
   - School zone databases
   - Public safety alerts
   - Community shared zones
   - Integration with emergency system

## Testing Recommendations

1. **Manual Testing:**
   - Create safe zone at current location
   - Walk/drive outside radius
   - Verify exit alert received
   - Return to zone
   - Verify entry alert received

2. **Edge Cases:**
   - Multiple overlapping zones
   - Rapid entry/exit (driving past zone)
   - GPS signal loss
   - Browser permission denied
   - User offline scenarios

3. **Performance:**
   - Test with 10+ zones
   - Monitor edge function execution time
   - Check database query performance
   - Verify real-time update latency

## Configuration

### Default Values:
- Minimum radius: 50 meters
- Maximum radius: 5000 meters (5km)
- Default radius: 200 meters
- Entry alerts: Enabled by default
- Exit alerts: Enabled by default

### Customization:
All values can be adjusted in `SafeZoneDialog.tsx` component.

## API Reference

### Edge Function: `check-geofence`
**Endpoint:** `POST /functions/v1/check-geofence`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "latitude": 12.0022,
  "longitude": 8.5919
}
```

**Response:**
```json
{
  "message": "Geofence check completed",
  "events": 1,
  "alerts": 1
}
```

### Database Functions:
- `useSafeZones(parentId, childId)` - React hook for zone management
- `createSafeZone(zoneData)` - Create new safe zone
- `updateSafeZone(zoneId, updates)` - Update existing zone
- `deleteSafeZone(zoneId)` - Delete safe zone
- `markAlertAsRead(alertId)` - Mark alert as read

## Troubleshooting

**Alerts not triggering:**
- Verify zone is active (`is_active = true`)
- Check notification settings enabled
- Confirm user has moved outside/inside radius
- Review edge function logs

**Inaccurate detection:**
- GPS accuracy varies by device/environment
- Indoor locations less accurate
- Increase radius for more reliable detection
- Consider using 100m+ radius in urban areas

**Performance issues:**
- Reduce number of active zones
- Increase location update interval
- Check database indexes are present
- Monitor edge function execution time
