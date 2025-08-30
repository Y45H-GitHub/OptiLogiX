import { PurchaseOrder } from '../contexts/NotificationContext';

export interface EmailNotification {
    to: string[];
    subject: string;
    template: 'order_approval_request' | 'order_approved' | 'order_rejected';
    data: {
        orderDetails: PurchaseOrder;
        approverName?: string;
        rejectionReason?: string;
    };
}

export interface EmailStatus {
    id: string;
    status: 'pending' | 'sent' | 'failed';
    timestamp: Date;
    recipient: string;
    error?: string;
}

class EmailService {
    private emailQueue: EmailNotification[] = [];
    private emailHistory: EmailStatus[] = [];

    // Simulate email sending with enhanced console logging for demo
    async sendEmail(notification: EmailNotification): Promise<EmailStatus> {
        const emailId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log('🔄 Sending email notification...', {
            id: emailId,
            to: notification.to,
            subject: notification.subject,
            template: notification.template
        });

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // Simulate occasional failures (5% chance for demo)
        const shouldFail = Math.random() < 0.05;

        const status: EmailStatus = {
            id: emailId,
            status: shouldFail ? 'failed' : 'sent',
            timestamp: new Date(),
            recipient: notification.to.join(', '),
            error: shouldFail ? 'SMTP connection timeout - simulated failure' : undefined
        };

        // Enhanced console logging for demo purposes
        if (shouldFail) {
            console.error('❌ EMAIL DELIVERY FAILED:', {
                id: emailId,
                to: notification.to,
                subject: notification.subject,
                template: notification.template,
                error: status.error,
                timestamp: status.timestamp.toISOString()
            });
        } else {
            console.log('✅ EMAIL SENT SUCCESSFULLY:', {
                id: emailId,
                to: notification.to,
                subject: notification.subject,
                template: notification.template,
                orderDetails: {
                    orderId: notification.data.orderDetails.id,
                    productName: notification.data.orderDetails.productName,
                    quantity: notification.data.orderDetails.quantity,
                    totalCost: `$${notification.data.orderDetails.totalCost.toFixed(2)}`,
                    supplier: notification.data.orderDetails.supplier,
                    requestedBy: notification.data.orderDetails.requestedBy
                },
                emailContent: this.generateEmailContent(notification),
                timestamp: status.timestamp.toISOString()
            });
        }

        this.emailHistory.push(status);
        return status;
    }

    // Generate email content for demo logging
    private generateEmailContent(notification: EmailNotification): string {
        const { orderDetails, approverName, rejectionReason } = notification.data;

        switch (notification.template) {
            case 'order_approval_request':
                return `
=== PURCHASE ORDER APPROVAL REQUEST ===
Order ID: ${orderDetails.id}
Product: ${orderDetails.productName} (${orderDetails.sku})
Quantity: ${orderDetails.quantity} units
Unit Price: $${orderDetails.unitPrice.toFixed(2)}
Total Cost: $${orderDetails.totalCost.toFixed(2)}
Supplier: ${orderDetails.supplier}
Requested By: ${orderDetails.requestedBy}
Priority: ${orderDetails.priority.toUpperCase()}
Justification: ${orderDetails.justification}

Please review and approve/reject this purchase order.
                `;

            case 'order_approved':
                return `
=== PURCHASE ORDER APPROVED ===
Order ID: ${orderDetails.id}
Product: ${orderDetails.productName}
Total Cost: $${orderDetails.totalCost.toFixed(2)}
Approved By: ${approverName}
Approval Date: ${new Date().toISOString()}

Your purchase order has been approved and will be processed.
                `;

            case 'order_rejected':
                return `
=== PURCHASE ORDER REJECTED ===
Order ID: ${orderDetails.id}
Product: ${orderDetails.productName}
Total Cost: $${orderDetails.totalCost.toFixed(2)}
Rejected By: ${approverName}
Rejection Date: ${new Date().toISOString()}
Reason: ${rejectionReason}

Please review the rejection reason and resubmit if necessary.
                `;

            default:
                return 'Email content not available';
        }
    }

    // Send approval request email
    async sendApprovalRequest(order: PurchaseOrder): Promise<EmailStatus> {
        const notification: EmailNotification = {
            to: [this.getRequestorEmail(order.requestedBy)],
            subject: `Purchase Order Approval Required - ${order.id}`,
            template: 'order_approval_request',
            data: {
                orderDetails: order
            }
        };

        return this.sendEmail(notification);
    }

    // Send approval confirmation email
    async sendApprovalConfirmation(order: PurchaseOrder, approverName: string): Promise<EmailStatus> {
        const notification: EmailNotification = {
            to: [this.getRequestorEmail(order.requestedBy)],
            subject: `Purchase Order Approved - ${order.id}`,
            template: 'order_approved',
            data: {
                orderDetails: order,
                approverName
            }
        };

        return this.sendEmail(notification);
    }

    // Send rejection notification email
    async sendRejectionNotification(order: PurchaseOrder, approverName: string, rejectionReason: string): Promise<EmailStatus> {
        const notification: EmailNotification = {
            to: [this.getRequestorEmail(order.requestedBy)],
            subject: `Purchase Order Rejected - ${order.id}`,
            template: 'order_rejected',
            data: {
                orderDetails: order,
                approverName,
                rejectionReason
            }
        };

        return this.sendEmail(notification);
    }

    // Get email history for a specific order
    getEmailHistory(orderId?: string): EmailStatus[] {
        if (orderId) {
            return this.emailHistory.filter(email =>
                email.recipient.includes(orderId) ||
                email.id.includes(orderId)
            );
        }
        return this.emailHistory;
    }

    // Mock function to get requestor email
    private getRequestorEmail(requestorName: string): string {
        // In a real app, this would lookup the user's email from a database
        const emailMap: { [key: string]: string } = {
            'John Smith': 'john.smith@company.com',
            'Sarah Johnson': 'sarah.johnson@company.com',
            'Mike Chen': 'mike.chen@company.com',
            'Lisa Wang': 'lisa.wang@company.com'
        };

        return emailMap[requestorName] || `${requestorName.toLowerCase().replace(' ', '.')}@company.com`;
    }

    // Get email queue status
    getQueueStatus() {
        return {
            pending: this.emailQueue.length,
            sent: this.emailHistory.filter(e => e.status === 'sent').length,
            failed: this.emailHistory.filter(e => e.status === 'failed').length
        };
    }
}

// Export singleton instance
export const emailService = new EmailService();