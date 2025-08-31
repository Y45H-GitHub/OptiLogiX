# Implementation Plan

- [x] 1. Add live shipment updates with simple timer-based changes





  - Modify `frontend/src/components/SmartChain360Dashboard.tsx` to include useEffect with setInterval
  - Create simple data rotation for shipment statuses (In Transit → Delayed → Delivered)
  - Add random ETA changes and risk level updates every 10 seconds
  - Use existing shipment data structure with minimal modifications
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Connect inventory alerts to notification system





  - Add "Send to Notifications" button on inventory alert cards
  - Use existing NotificationContext to create purchase order notifications
  - Map inventory alert data to existing PurchaseOrder interface
  - Add simple click handler that calls `createPurchaseOrder` from notification context
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Add compliance alert navigation





  - Add onClick handler to compliance alert cards
  - Use React Router's `useNavigate` to route to `/compliance-checker`
  - Pass compliance issue data via URL params or localStorage
  - Add simple "Resolve" button that removes alert from dashboard
  - _Requirements: 3.1, 3.2, 3.3_
-

- [x] 4. Add notification bell to main dashboard




  - Import existing NotificationBell and NotificationDropdown to Index.tsx
  - Position notification bell next to existing profile and wallet icons
  - Ensure inventory alerts from dashboard appear in notification dropdown
  - Test approve/reject workflow from notifications back to dashboard
  - _Requirements: 2.3, 2.4_