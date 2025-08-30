# Implementation Plan

- [x] 1. Create minimal facility data and types





  - Define basic SupplyChainFacility interface with essential properties (name, type, location, detour time)
  - Create hardcoded demo facility data for 2-3 strategic locations along popular demo routes
  - _Requirements: 2.1, 2.2, 2.3_


- [x] 2. Add facility markers to existing map




  - Extend current useGoogleMaps hook to render custom markers on existing map
  - Use simple colored markers (red=warehouse, blue=fuel, green=distribution) for facility types
  - Add basic info window on marker click showing facility name and type
  - _Requirements: 1.1, 2.4, 2.5_

- [x] 3. Implement simple route-based facility filtering




  - Create basic function to show facilities within 5km of calculated route
  - Filter facilities based on route coordinates using simple distance calculation
  - Display filtered facilities automatically when route is calculated
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Add basic optimization suggestions panel





  - Create simple suggestion card component showing "Fuel Stop Available" or "Warehouse Nearby"
  - Display 1-2 actionable suggestions with estimated time savings (hardcoded for demo)
  - Add visual highlight on map when suggestion is hovered
  - _Requirements: 3.1, 3.4_

- [x] 5. Integrate with existing RouteOptimizer without breaking functionality





  - Modify existing RouteOptimizer to include facility markers and suggestions panel
  - Ensure all current features (voice directions, transport modes, CO2) continue working
  - Add simple error handling to gracefully hide enhancements if they fail
  - _Requirements: 1.3, 4.1, 4.5_