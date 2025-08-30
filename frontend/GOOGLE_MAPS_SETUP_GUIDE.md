# Google Maps API Setup Guide

## Issue
The current Google Maps API key is not working, causing the error: "Google Maps script failed to load."

## Solution Steps

### 1. Get a New Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Places API (optional)
4. Go to "Credentials" and create a new API key
5. Copy the new API key

### 2. Update the Environment File

Replace the current API key in `frontend/.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
```

### 3. Configure API Key Restrictions (Recommended)

In Google Cloud Console:
1. Click on your API key
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:*`, `yourdomain.com/*`)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose the APIs you enabled above

### 4. Test the Setup

1. Restart your development server: `npm run dev`
2. Navigate to the Route Optimizer page
3. You should see the map load successfully

## Fallback Testing

Even without Google Maps, you can test the optimization suggestions panel:

1. Go to the Route Optimizer Demo page
2. Look for the "Optimization Suggestions Demo" component on the right side
3. Click "Show Optimization Suggestions" to see the panel working
4. Enter source and destination in the main form to see suggestions appear

## Troubleshooting

### Common Issues:

1. **API Key Invalid**: Make sure you copied the key correctly
2. **APIs Not Enabled**: Ensure Maps JavaScript API and Directions API are enabled
3. **Billing Not Set Up**: Google Maps requires a billing account (free tier available)
4. **Domain Restrictions**: If testing locally, make sure `localhost:*` is in the referrer restrictions

### Testing Without Google Maps:

The optimization suggestions panel has been designed to work independently. You can:
- Use the demo component to test the UI
- Enter source/destination to trigger mock suggestions
- Test hover and click interactions

## Current Fallback Features

When Google Maps fails to load, the system will:
1. Show a mock route for testing purposes
2. Generate optimization suggestions based on demo facilities
3. Allow full testing of the suggestions panel functionality
4. Display appropriate error messages and guidance