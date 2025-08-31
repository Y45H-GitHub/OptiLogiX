import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { emailService, EmailStatus } from '../services/emailService';

export interface Notification {
    id: string;
    type: 'approval_request' | 'approved' | 'rejected' | 'pending';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
    orderId: string;
    orderDetails: PurchaseOrder;
    actionBy?: string;
    actionDate?: Date;
    emailStatus?: EmailStatus;
}

export interface PurchaseOrder {
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

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
}

interface NotificationActions {
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    approveOrder: (orderId: string, approverName: string, comments?: string) => Promise<EmailStatus>;
    rejectOrder: (orderId: string, approverName: string, reason: string) => Promise<EmailStatus>;
    createPurchaseOrder: (order: PurchaseOrder) => Promise<EmailStatus>;
    resetNotifications: () => void;
}

type NotificationContextType = NotificationState & NotificationActions;

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock data for 3-4 pending orders
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
        requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'high',
        justification: 'Critical stockout risk - current inventory: 150 units, predicted demand: 340 units',
        status: 'pending'
    },
    {
        id: 'PO-002',
        sku: 'SM-002',
        productName: 'Smart Watches',
        quantity: 150,
        unitPrice: 199.99,
        totalCost: 29998.50,
        supplier: 'WearableTech Ltd.',
        requestedBy: 'Sarah Johnson',
        requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: 'medium',
        justification: 'Seasonal demand increase expected, current stock: 75 units',
        status: 'pending'
    },
    {
        id: 'PO-003',
        sku: 'TB-003',
        productName: 'Bluetooth Speakers',
        quantity: 100,
        unitPrice: 89.99,
        totalCost: 8999.00,
        supplier: 'AudioMax Inc.',
        requestedBy: 'Mike Chen',
        requestDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        priority: 'medium',
        justification: 'Restocking for upcoming promotion, current inventory: 45 units',
        status: 'pending'
    },
    {
        id: 'PO-004',
        sku: 'LP-004',
        productName: 'Laptop Accessories',
        quantity: 300,
        unitPrice: 25.99,
        totalCost: 7797.00,
        supplier: 'CompuParts Direct',
        requestedBy: 'Lisa Wang',
        requestDate: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        priority: 'low',
        justification: 'Regular restocking, current inventory: 120 units',
        status: 'pending'
    }
];

// Create some historical notifications for demo purposes
const mockHistoricalOrders: PurchaseOrder[] = [
    {
        id: 'PO-H001',
        sku: 'KB-001',
        productName: 'Mechanical Keyboards',
        quantity: 50,
        unitPrice: 129.99,
        totalCost: 6499.50,
        supplier: 'KeyTech Solutions',
        requestedBy: 'Alex Rodriguez',
        requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'medium',
        justification: 'Office equipment upgrade',
        status: 'approved'
    },
    {
        id: 'PO-H002',
        sku: 'MN-002',
        productName: 'Gaming Monitors',
        quantity: 25,
        unitPrice: 299.99,
        totalCost: 7499.75,
        supplier: 'DisplayPro Inc.',
        requestedBy: 'Emma Thompson',
        requestDate: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
        priority: 'low',
        justification: 'Budget exceeded for Q4',
        status: 'rejected'
    }
];

const mockNotifications: Notification[] = [
    // Current pending orders
    ...mockPurchaseOrders.map(order => ({
        id: `notif-${order.id}`,
        type: 'approval_request' as const,
        title: `Purchase Order Approval Required`,
        message: `${order.productName} - ${order.quantity} units - $${order.totalCost.toFixed(2)}`,
        timestamp: order.requestDate,
        isRead: false,
        priority: order.priority,
        orderId: order.id,
        orderDetails: order
    })),
    // Historical approved order
    {
        id: 'notif-PO-H001',
        type: 'approved' as const,
        title: 'Purchase Order Approved',
        message: `${mockHistoricalOrders[0].productName} - ${mockHistoricalOrders[0].quantity} units - $${mockHistoricalOrders[0].totalCost.toFixed(2)}`,
        timestamp: mockHistoricalOrders[0].requestDate,
        isRead: true,
        priority: mockHistoricalOrders[0].priority,
        orderId: mockHistoricalOrders[0].id,
        orderDetails: mockHistoricalOrders[0],
        actionBy: 'Sarah Johnson',
        actionDate: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
        emailStatus: {
            id: 'email-h001',
            status: 'sent' as const,
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
            recipient: 'yashchmckv@gmail.com'
        }
    },
    // Historical rejected order
    {
        id: 'notif-PO-H002',
        type: 'rejected' as const,
        title: 'Purchase Order Rejected',
        message: `${mockHistoricalOrders[1].productName} - ${mockHistoricalOrders[1].quantity} units - $${mockHistoricalOrders[1].totalCost.toFixed(2)}`,
        timestamp: mockHistoricalOrders[1].requestDate,
        isRead: true,
        priority: mockHistoricalOrders[1].priority,
        orderId: mockHistoricalOrders[1].id,
        orderDetails: mockHistoricalOrders[1],
        actionBy: 'Mike Chen',
        actionDate: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
        emailStatus: {
            id: 'email-h002',
            status: 'sent' as const,
            timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
            recipient: 'yashchmckv@gmail.com'
        }
    }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [isLoading, setIsLoading] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, isRead: true } : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );
    };

    const approveOrder = useCallback(async (orderId: string, approverName: string, comments?: string): Promise<EmailStatus> => {
        const notification = notifications.find(n => n.orderId === orderId);
        if (!notification) {
            throw new Error('Order not found');
        }

        // Send approval email
        const emailStatus = await emailService.sendApprovalConfirmation(
            notification.orderDetails,
            approverName
        );

        setNotifications(prev =>
            prev.map(notification => {
                if (notification.orderId === orderId) {
                    return {
                        ...notification,
                        type: 'approved',
                        actionBy: approverName,
                        actionDate: new Date(),
                        isRead: true,
                        emailStatus
                    };
                }
                return notification;
            })
        );

        return emailStatus;
    }, [notifications]);

    const rejectOrder = useCallback(async (orderId: string, approverName: string, reason: string): Promise<EmailStatus> => {
        const notification = notifications.find(n => n.orderId === orderId);
        if (!notification) {
            throw new Error('Order not found');
        }

        // Send rejection email
        const emailStatus = await emailService.sendRejectionNotification(
            notification.orderDetails,
            approverName,
            reason
        );

        setNotifications(prev =>
            prev.map(notification => {
                if (notification.orderId === orderId) {
                    return {
                        ...notification,
                        type: 'rejected',
                        actionBy: approverName,
                        actionDate: new Date(),
                        isRead: true,
                        emailStatus
                    };
                }
                return notification;
            })
        );

        return emailStatus;
    }, [notifications]);

    const createPurchaseOrder = async (order: PurchaseOrder): Promise<EmailStatus> => {
        // Send approval request email
        const emailStatus = await emailService.sendApprovalRequest(order);

        // Add notification for the new order
        const newNotification: Notification = {
            id: `notif-${order.id}`,
            type: 'approval_request',
            title: 'Purchase Order Approval Required',
            message: `${order.productName} - ${order.quantity} units - $${order.totalCost.toFixed(2)}`,
            timestamp: order.requestDate,
            isRead: false,
            priority: order.priority,
            orderId: order.id,
            orderDetails: order,
            emailStatus
        };

        setNotifications(prev => [newNotification, ...prev]);
        return emailStatus;
    };

    const resetNotifications = () => {
        setNotifications(mockNotifications);
    };

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isLoading,
        addNotification,
        markAsRead,
        markAllAsRead,
        approveOrder,
        rejectOrder,
        createPurchaseOrder,
        resetNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};