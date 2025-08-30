# Design Document

## Overview

The Surplus Rescue Network is designed as a comprehensive inventory redistribution system that integrates seamlessly into the existing OptiLogix platform. The system follows the established architectural patterns, utilizing React with TypeScript for the frontend, Express.js for the backend API, and MySQL for data persistence. The design maintains consistency with the existing emerald-teal-cyan gradient theme and shadcn/ui component library.

The system enables businesses to efficiently manage surplus inventory by creating a network-based marketplace where organizations can list excess stock and discover available inventory from other network participants. The architecture emphasizes real-time updates, mobile responsiveness, and seamless integration with existing logistics workflows.

## Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript following existing patterns
- **Routing**: React Router v6 integration with new `/surplus-rescue` route
- **State Management**: Context API for network state, React Query for server state
- **UI Components**: shadcn/ui components with consistent styling
- **Styling**: Tailwind CSS with existing design system variables
- **Real-time Updates**: WebSocket integration for live inventory updates

### Backend Architecture
- **API Server**: Express.js with RESTful endpoints
- **Database**: MySQL with normalized schema for network data
- **Authentication**: Integration with existing Firebase Auth
- **Real-time**: WebSocket server for live updates
- **File Storage**: Integration with existing storage for item images
- **Email Service**: Extension of existing emailService for notifications

### Database Schema
```sql
-- Network participants
CREATE TABLE network_participants (
    id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    verification_status ENUM('pending', 'verified', 'suspended') DEFAULT 'pending',
    reputation_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Surplus inventory listings
CREATE TABLE surplus_inventory (
    id VARCHAR(36) PRIMARY KEY,
    participant_id VARCHAR(36) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity_available INT NOT NULL,
    unit_price DECIMAL(10,2),
    condition_type ENUM('new', 'like_new', 'good', 'fair') DEFAULT 'new',
    expiration_date DATE,
    location VARCHAR(255),
    images JSON,
    status ENUM('available', 'reserved', 'transferred', 'expired') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES network_participants(id)
);

-- Inventory requests
CREATE TABLE inventory_requests (
    id VARCHAR(36) PRIMARY KEY,
    requester_id VARCHAR(36) NOT NULL,
    surplus_item_id VARCHAR(36) NOT NULL,
    requested_quantity INT NOT NULL,
    urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    delivery_preference VARCHAR(255),
    notes TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES network_participants(id),
    FOREIGN KEY (surplus_item_id) REFERENCES surplus_inventory(id)
);

-- Transfer tracking
CREATE TABLE inventory_transfers (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    status ENUM('initiated', 'in_transit', 'delivered', 'cancelled') DEFAULT 'initiated',
    estimated_delivery DATE,
    actual_delivery DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES inventory_requests(id)
);
```

## Components and Interfaces

### Core Components

#### SurplusRescueNetworkPage
- **Purpose**: Main page component following existing page patterns
- **Location**: `frontend/src/pages/SurplusRescueNetworkPage.tsx`
- **Features**: Navigation, user profile integration, responsive layout
- **Integration**: Uses existing header pattern with profile/wallet modals

#### SurplusRescueNetworkDashboard
- **Purpose**: Central dashboard for network overview
- **Location**: `frontend/src/components/SurplusRescueNetworkDashboard.tsx`
- **Features**: Network statistics, recent activity, quick actions
- **Design**: Follows SmartChain360Dashboard pattern with card-based layout

#### SurplusInventoryListing
- **Purpose**: Component for listing surplus inventory
- **Location**: `frontend/src/components/SurplusInventoryListing.tsx`
- **Features**: Form validation, image upload, category selection
- **Integration**: Uses existing form patterns and validation

#### NetworkMarketplace
- **Purpose**: Browse and search available surplus inventory
- **Location**: `frontend/src/components/NetworkMarketplace.tsx`
- **Features**: Advanced filtering, real-time search, pagination
- **Design**: Card-based layout with consistent styling

#### TransferTracker
- **Purpose**: Track inventory transfers in progress
- **Location**: `frontend/src/components/TransferTracker.tsx`
- **Features**: Status updates, timeline view, notifications
- **Integration**: Similar to existing shipment tracking patterns

#### NetworkAnalytics
- **Purpose**: Analytics dashboard for network participation
- **Location**: `frontend/src/components/NetworkAnalytics.tsx`
- **Features**: Charts, metrics, export functionality
- **Integration**: Uses existing chart components (recharts)

### Service Layer

#### SurplusNetworkService
```typescript
interface SurplusNetworkService {
  // Inventory management
  listSurplusInventory(item: SurplusInventoryItem): Promise<ApiResponse>;
  searchInventory(filters: InventoryFilters): Promise<SurplusInventoryItem[]>;
  updateInventoryStatus(id: string, status: InventoryStatus): Promise<ApiResponse>;
  
  // Request management
  createInventoryRequest(request: InventoryRequest): Promise<ApiResponse>;
  respondToRequest(requestId: string, response: RequestResponse): Promise<ApiResponse>;
  getMyRequests(): Promise<InventoryRequest[]>;
  
  // Transfer tracking
  initiateTransfer(requestId: string, transferDetails: TransferDetails): Promise<ApiResponse>;
  updateTransferStatus(transferId: string, status: TransferStatus): Promise<ApiResponse>;
  getTransferHistory(): Promise<Transfer[]>;
  
  // Analytics
  getNetworkAnalytics(timeRange: TimeRange): Promise<NetworkAnalytics>;
  getParticipantMetrics(): Promise<ParticipantMetrics>;
}
```

#### NotificationService Extension
```typescript
interface SurplusNetworkNotifications {
  // Request notifications
  notifyInventoryRequest(request: InventoryRequest): Promise<void>;
  notifyRequestResponse(response: RequestResponse): Promise<void>;
  
  // Transfer notifications
  notifyTransferUpdate(transfer: Transfer): Promise<void>;
  notifyDeliveryConfirmation(transfer: Transfer): Promise<void>;
  
  // Network notifications
  notifyNewSurplusListing(item: SurplusInventoryItem): Promise<void>;
  notifyNetworkAlert(alert: NetworkAlert): Promise<void>;
}
```

## Data Models

### Core Interfaces

```typescript
interface SurplusInventoryItem {
  id: string;
  participantId: string;
  sku: string;
  productName: string;
  description: string;
  category: string;
  quantityAvailable: number;
  unitPrice: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  expirationDate?: Date;
  location: string;
  images: string[];
  status: 'available' | 'reserved' | 'transferred' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryRequest {
  id: string;
  requesterId: string;
  surplusItemId: string;
  requestedQuantity: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  deliveryPreference: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface NetworkParticipant {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  address: string;
  verificationStatus: 'pending' | 'verified' | 'suspended';
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Transfer {
  id: string;
  requestId: string;
  trackingNumber?: string;
  carrier?: string;
  status: 'initiated' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Filter and Search Interfaces

```typescript
interface InventoryFilters {
  category?: string;
  location?: string;
  condition?: string[];
  priceRange?: { min: number; max: number };
  quantityRange?: { min: number; max: number };
  expirationDate?: { before: Date; after: Date };
  searchTerm?: string;
}

interface NetworkAnalytics {
  totalItemsShared: number;
  totalItemsReceived: number;
  totalCostSavings: number;
  averageResponseTime: number;
  successfulTransfers: number;
  networkReputationScore: number;
  monthlyTrends: {
    month: string;
    itemsShared: number;
    itemsReceived: number;
    costSavings: number;
  }[];
}
```

## Error Handling

### Frontend Error Handling
- **Toast Notifications**: Use existing Toast component for user feedback
- **Form Validation**: Zod schemas for client-side validation
- **API Error Handling**: Consistent error response format with user-friendly messages
- **Offline Support**: Cache critical data and sync when connection restored

### Backend Error Handling
- **HTTP Status Codes**: Standard REST API status codes
- **Error Response Format**: Consistent JSON error responses
- **Logging**: Comprehensive error logging for debugging
- **Validation**: Server-side validation for all inputs

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest and React Testing Library for components
- **Integration Tests**: Test component interactions and API calls
- **E2E Tests**: Cypress for critical user workflows
- **Visual Testing**: Storybook for component documentation

### Backend Testing
- **Unit Tests**: Jest for service layer and utilities
- **Integration Tests**: Test API endpoints with test database
- **Load Testing**: Performance testing for high-volume scenarios
- **Security Testing**: Input validation and authentication testing

### Test Coverage Goals
- **Frontend**: 80% code coverage minimum
- **Backend**: 85% code coverage minimum
- **Critical Paths**: 100% coverage for core workflows

## Security Considerations

### Authentication & Authorization
- **Firebase Integration**: Leverage existing Firebase Auth
- **Role-Based Access**: Participant roles and permissions
- **API Security**: JWT token validation for all endpoints
- **Rate Limiting**: Prevent abuse of API endpoints

### Data Protection
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **HTTPS Only**: Secure communication channels

### Privacy & Compliance
- **Data Minimization**: Collect only necessary information
- **Audit Trails**: Log all significant actions
- **Data Retention**: Configurable data retention policies
- **GDPR Compliance**: User data rights and deletion

## Performance Optimization

### Frontend Performance
- **Code Splitting**: Lazy load surplus network components
- **Image Optimization**: Compressed images with lazy loading
- **Caching Strategy**: React Query for server state caching
- **Bundle Optimization**: Tree shaking and minification

### Backend Performance
- **Database Indexing**: Optimize queries with proper indexes
- **Caching Layer**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **API Optimization**: Pagination and filtering at database level

### Real-time Performance
- **WebSocket Optimization**: Efficient message broadcasting
- **Connection Management**: Handle connection drops gracefully
- **Message Queuing**: Queue system for high-volume notifications
- **Scalability**: Horizontal scaling for WebSocket servers

## Integration Points

### Existing System Integration
- **Navigation**: Add to main navigation tabs in Index.tsx
- **Routing**: New route `/surplus-rescue` in App.tsx
- **Notifications**: Extend existing NotificationContext
- **Styling**: Use existing Tailwind configuration and design tokens
- **Authentication**: Integrate with existing Firebase Auth flow

### External Integrations
- **Email Service**: Extend existing emailService for network notifications
- **File Storage**: Use existing image upload patterns
- **Analytics**: Integrate with existing analytics tracking
- **Mobile**: Responsive design following existing mobile patterns

## Deployment Strategy

### Development Environment
- **Local Setup**: Docker containers for consistent development
- **Hot Reloading**: Vite dev server for frontend development
- **Database Seeding**: Mock data for development and testing
- **Environment Variables**: Separate configs for dev/staging/prod

### Production Deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Database Migration**: Versioned schema migrations
- **Feature Flags**: Gradual rollout of new features
- **Monitoring**: Application performance monitoring
- **Backup Strategy**: Regular database backups and recovery procedures