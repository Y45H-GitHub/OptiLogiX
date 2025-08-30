# Implementation Plan

- [x] 1. Add notification bell to navbar with badge





  - Add bell icon next to user/wallet in DemandForecastingPage navbar
  - Create notification context with mock data (3-4 pending orders)
  - Show red badge with unread count
  - _Requirements: 2.2, 2.3_

- [x] 2. Create notification dropdown with approve/reject





  - Build dropdown that opens on bell click
  - Show pending orders with Approve/Reject buttons inline
  - Add one-click approval and rejection with simple reason input
  - _Requirements: 1.2, 1.3, 2.1_
-

- [x] 3. Connect "Create Purchase Order" button to notifications




  - Make existing button generate new approval request
  - Add new notification to bell badge instantly
  - Show success toast when order is created
  - _Requirements: 1.1, 1.5_
- [x] 4. Add email notification simulation








- [ ] 4. Add email notification simulation

  - Create simple email service that logs to console
  - Show "Email sent to [email]" toast when approving/rejecting
  - Display email status in notification (for demo purposes)
  - _Requirements: 3.1, 3.2_


- [x] 5. Add notification history tab


  - Simple "History" tab in dropdown showing approved/rejected orders
  - Show who approved/rejected and when
  - Basic styling to match existing UI
  - _Requirements: 2.4, 2.5_