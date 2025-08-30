# Design Document

## Overview

The Smart Order Approval & Notification System integrates seamlessly with the existing demand forecasting page to create a complete procurement workflow. The system features a notification bell icon in the header, approval modals, and email integration for a professional hackathon demo.

## Architecture

### Component Structure
```
DemandForecastingPage
├── NotificationBell (new - in navbar)
├── NotificationDropdown (new - shows on bell click)
├── OrderApprovalModal (new)
├── DemandForecasting (enhanced)
└── EmailService (new)
```

### Data Flow
1. User clicks "Create Purchase Order" → Generates approval request
2. Approval request → Triggers notification + email
3. Approver receives notification → Opens approval modal
4. Approval/Rejection → Updates status + sends confirmations

## Components and Interfaces

### NotificationBell Component (Navbar)
```typescript
interface Notification {
  id: string;
  type: 'approval_request' | 'approved' | 'rejected' | 'pending';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  orderId: string;
  orderDetails: PurchaseOrder;
  actionBy?: string; // Who approved/rejected
  actionDate?: Date;
}

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}
```

### NotificationDropdown Component
```typescript
interface NotificationDropdownProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}
```

### OrderApprovalModal Component
```typescript
interface PurchaseOrder {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  supplier: string;
  requestedBy: string;
  requestDate: Date;
  priority: 'low' | 'medium' | 'high';
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface OrderApprovalModalProps {
  order: PurchaseOrder;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (orderId: string, comments?: string) => void;
  onReject: (orderId: string, reason: string) => void;
}
```

### Enhanced DemandForecasting Component
- Add "Create Purchase Order" button functionality
- Generate approval requests when clicked
- Show order status in forecast cards

### EmailService Integration
```typescript
interface EmailNotification {
  to: string[];
  subject: string;
  template: 'order_approval_request' | 'order_approved' | 'order_rejected';
  data: {
    orderDetails: PurchaseOrder;
    approverName?: string;
    rejectionReason?: string;
  };
}
```

## Data Models

### Notification Store (React Context)
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  approveOrder: (orderId: string, comments?: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
}
```

### Mock Data Structure
```typescript
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    sku: 'WH-001',
    productName: 'Wireless Headphones',
    quantity: 200,
    unitPrice: 45.99,
    totalCost: 9198.00,
    supplier: 'TechSupply Co.',
    requestedBy: 'John Smith',
    requestDate: new Date(),
    priority: 'high',
    justification: 'Critical stockout risk - current inventory: 150 units, predicted demand: 340 units',
    status: 'pending'
  }
];
```

## Error Handling

### Notification Errors
- Failed email delivery → Show warning icon in notification
- Network errors → Retry mechanism with exponential backoff
- Invalid approval attempts → Show error toast

### Email Service Errors
- SMTP failures → Log error and show in notification center
- Invalid email addresses → Validate before sending
- Rate limiting → Queue emails and process in batches

## Testing Strategy

### Unit Tests
- NotificationCenter component rendering and interactions
- OrderApprovalModal approval/rejection logic
- Email service mock integration
- Notification state management

### Integration Tests
- End-to-end approval workflow
- Email notification delivery
- Real-time notification updates
- Cross-component communication

### UI/UX Design

#### Notification Bell (Navbar)
- Position: Top-right navbar, next to user profile and wallet
- Badge: Red circle with unread count (max display: 9+)
- Icon: Bell icon with subtle animation for new notifications
- Dropdown: Opens below bell showing recent notifications

#### Notification Dropdown
- **Tabs**: "Pending" | "History" | "All"
- **Pending**: Active approval requests requiring action
- **History**: Past approvals/rejections with timestamps and actions taken
- **All**: Combined view with filters
- **Actions**: Mark as read, Mark all as read, View details
- **Empty State**: "No notifications" with relevant icon

### Demo Scenarios
1. **Happy Path**: Create order → Bell shows badge → Click bell → Approve → See in history
2. **Rejection Flow**: Create order → Bell notification → Reject with reason → Email sent → History updated
3. **Historical View**: Show past 30 days of approvals/rejections with search/filter
4. **Real-time Updates**: Bell badge updates instantly when new orders are created
5. **Email Integration**: Demonstrate actual email delivery (using test SMTP)