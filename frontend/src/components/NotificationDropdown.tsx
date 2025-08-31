import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Clock, User, Mail, MailX } from 'lucide-react';
import { useNotifications, Notification, PurchaseOrder } from '../contexts/NotificationContext';
import Toast from './Toast';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, markAllAsRead, approveOrder, rejectOrder } = useNotifications();
    const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'all'>('pending');
    const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
    const [showRejectInput, setShowRejectInput] = useState<{ [key: string]: boolean }>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const pendingNotifications = notifications.filter(n => n.type === 'approval_request');
    const historyNotifications = notifications.filter(n => n.type === 'approved' || n.type === 'rejected');

    const getDisplayNotifications = () => {
        switch (activeTab) {
            case 'pending':
                return pendingNotifications;
            case 'history':
                return historyNotifications;
            case 'all':
                return notifications;
            default:
                return notifications;
        }
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const handleApprove = async (orderId: string, notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) return;

        try {
            showToast('Processing approval...', 'info');
            // TODO: Replace 'Current User' with actual logged-in user's name
            const approverName = 'Current User'; 
            const emailStatus = await approveOrder(orderId, approverName, notification.orderDetails.justification);
            markAsRead(notificationId);

            showToast(`Order ${orderId} approved successfully!`, 'success');

            // Show detailed email status
            setTimeout(() => {
                if (emailStatus.status === 'sent') {
                    showToast(`📧 Email sent to ${emailStatus.recipient} - Order ${orderId} approval confirmation`, 'success');
                } else if (emailStatus.status === 'failed') {
                    showToast(`❌ Email delivery failed to ${emailStatus.recipient}: ${emailStatus.error}`, 'error');
                }
            }, 500);
        } catch (error) {
            showToast('Failed to approve order', 'error');
        }
    };

    const handleReject = async (orderId: string, notificationId: string) => {
        const reason = rejectionReason[orderId] || 'No reason provided';
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) return;

        try {
            showToast('Processing rejection...', 'info');
            // TODO: Replace 'Current User' with actual logged-in user's name
            const approverName = 'Current User'; 
            const emailStatus = await rejectOrder(orderId, approverName, reason);
            markAsRead(notificationId);
            setShowRejectInput(prev => ({ ...prev, [orderId]: false }));
            setRejectionReason(prev => ({ ...prev, [orderId]: '' }));

            showToast(`Order ${orderId} rejected: ${reason}`, 'error');

            // Show detailed email status
            setTimeout(() => {
                if (emailStatus.status === 'sent') {
                    showToast(`📧 Email sent to ${emailStatus.recipient} - Order ${orderId} rejection notice`, 'info');
                } else if (emailStatus.status === 'failed') {
                    showToast(`❌ Email delivery failed to ${emailStatus.recipient}: ${emailStatus.error}`, 'error');
                }
            }, 500);
        } catch (error) {
            showToast('Failed to reject order', 'error');
        }
    };

    const toggleRejectInput = (orderId: string) => {
        setShowRejectInput(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50';
            case 'low':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (type: string) => {
        switch (type) {
            case 'approved':
                return <Check className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <X className="w-4 h-4 text-red-600" />;
            case 'approval_request':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getEmailStatusIcon = (emailStatus?: any) => {
        if (!emailStatus) return null;

        switch (emailStatus.status) {
            case 'sent':
                return <Mail className="w-3 h-3 text-green-600" />;
            case 'failed':
                return <MailX className="w-3 h-3 text-red-600" />;
            case 'pending':
                return <Clock className="w-3 h-3 text-yellow-600" />;
            default:
                return null;
        }
    };

    return (
        <>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
            <div ref={dropdownRef} className="absolute top-12 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                        {notifications.some(n => !n.isRead) && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {[
                        { key: 'pending', label: 'Pending', count: pendingNotifications.length },
                        { key: 'history', label: 'History', count: historyNotifications.length },
                        { key: 'all', label: 'All', count: notifications.length }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === tab.key
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                    {getDisplayNotifications().length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        getDisplayNotifications().map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStatusIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                {notification.title}
                                            </h4>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                                                {notification.priority}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-2">
                                            <p className="font-medium">{notification.orderDetails.productName}</p>
                                            <p>Qty: {notification.orderDetails.quantity} | {formatCurrency(notification.orderDetails.totalCost)}</p>
                                            <p>Supplier: {notification.orderDetails.supplier}</p>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span className="flex items-center">
                                                <User className="w-3 h-3 mr-1" />
                                                {notification.orderDetails.requestedBy}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                {getEmailStatusIcon(notification.emailStatus)}
                                                <span>{formatDate(notification.timestamp)}</span>
                                            </div>
                                        </div>

                                        {/* Action buttons for pending notifications */}
                                        {notification.type === 'approval_request' && (
                                            <div className="space-y-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(notification.orderId, notification.id)}
                                                        className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRejectInput(notification.orderId)}
                                                        className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>

                                                {showRejectInput[notification.orderId] && (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Rejection reason..."
                                                            value={rejectionReason[notification.orderId] || ''}
                                                            onChange={(e) => setRejectionReason(prev => ({
                                                                ...prev,
                                                                [notification.orderId]: e.target.value
                                                            }))}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                                        />
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleReject(notification.orderId, notification.id)}
                                                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                            >
                                                                Confirm Reject
                                                            </button>
                                                            <button
                                                                onClick={() => toggleRejectInput(notification.orderId)}
                                                                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Status for completed notifications */}
                                        {(notification.type === 'approved' || notification.type === 'rejected') && (
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <p className="capitalize">
                                                    {notification.type} by {notification.actionBy}
                                                    {notification.actionDate && ` on ${formatDate(notification.actionDate)}`}
                                                </p>
                                                {notification.emailStatus && (
                                                    <p className="flex items-center space-x-1">
                                                        {getEmailStatusIcon(notification.emailStatus)}
                                                        <span>
                                                            Email {notification.emailStatus.status}
                                                            {notification.emailStatus.status === 'sent' && ` to ${notification.emailStatus.recipient}`}
                                                            {notification.emailStatus.status === 'failed' && ` - ${notification.emailStatus.error}`}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;