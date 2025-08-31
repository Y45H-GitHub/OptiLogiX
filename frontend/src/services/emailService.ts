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

    constructor() {
        // Simulate email sending with a delay
        setInterval(() => {
            if (this.emailQueue.length > 0) {
                const notification = this.emailQueue.shift();
                if (notification) {
                    this.processEmail(notification);
                }
            }
        }, 1000);
    }

    private async processEmail(notification: EmailNotification): Promise<void> {
        const emailId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let status: EmailStatus = {
            id: emailId,
            status: 'pending',
            timestamp: new Date(),
            recipient: notification.to.join(', '),
        };

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

            console.log(`
=== SIMULATING EMAIL SEND ===
To: ${notification.to.join(', ')}
Subject: ${notification.subject}
Content:
${this.generateEmailContent(notification)}
=============================
            `);

            status = {
                ...status,
                status: 'sent',
            };
        } catch (error: any) {
            console.error('Error simulating email send:', error);
            status = {
                ...status,
                status: 'failed',
                error: error.message,
            };
        }

        this.emailHistory.push(status);
    }

    async sendEmail(notification: EmailNotification): Promise<EmailStatus> {
        const emailId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const to = notification.to.join(', ');
        const subject = notification.subject;
        const body = this.generateEmailContent(notification);

        const emailData = {
            to: to,
            subject: subject,
            body: body
        };

        let status: EmailStatus;

        try {
            const response = await fetch('http://localhost:5002/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            const result = await response.json();

            if (response.ok) {
                status = {
                    id: emailId,
                    status: 'sent',
                    timestamp: new Date(),
                    recipient: to
                };
            } else {
                status = {
                    id: emailId,
                    status: 'failed',
                    timestamp: new Date(),
                    recipient: to,
                    error: result.message || 'Unknown error'
                };
            }
        } catch (error: any) {
            status = {
                id: emailId,
                status: 'failed',
                timestamp: new Date(),
                recipient: to,
                error: error.message || 'Network error'
            };
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
            'John Smith': 'yashchmckv@gmail.com',
            'Sarah Johnson': 'yashchmckv@gmail.com',
            'Mike Chen': 'yashchmckv@gmail.com',
            'Lisa Wang': 'yashchmckv@gmail.com'
        };

        return emailMap[requestorName] || `yashchmckv@gmail.com`;
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