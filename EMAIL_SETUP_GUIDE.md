# Email Setup Guide - Send Real Emails to Your Gmail

This guide will help you set up real email notifications using EmailJS.

## Step 1: Install EmailJS

```bash
cd frontend
npm install @emailjs/browser
```

## Step 2: Create EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 3: Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Follow the setup instructions to connect your Gmail account
5. Note down your **Service ID** (e.g., `service_abc123`)

## Step 4: Create Email Templates

Create 3 templates for different notification types:

### Template 1: Purchase Order Approval Request
- **Template Name:** `order_approval_request`
- **Subject:** `Purchase Order Approval Required - {{order_id}}`
- **Content:**
```html
<h2>Purchase Order Approval Required</h2>
<p><strong>Order ID:</strong> {{order_id}}</p>
<p><strong>Product:</strong> {{product_name}}</p>
<p><strong>Quantity:</strong> {{quantity}}</p>
<p><strong>Total Cost:</strong> ${{total_cost}}</p>
<p><strong>Supplier:</strong> {{supplier}}</p>
<p><strong>Requested By:</strong> {{requested_by}}</p>
<p><strong>Justification:</strong> {{justification}}</p>

<p>Please review and approve/reject this purchase order.</p>
```

### Template 2: Purchase Order Approved
- **Template Name:** `order_approved`
- **Subject:** `Purchase Order Approved - {{order_id}}`
- **Content:**
```html
<h2>Purchase Order Approved ✅</h2>
<p><strong>Order ID:</strong> {{order_id}}</p>
<p><strong>Product:</strong> {{product_name}}</p>
<p><strong>Quantity:</strong> {{quantity}}</p>
<p><strong>Total Cost:</strong> ${{total_cost}}</p>
<p><strong>Approved By:</strong> {{approver_name}}</p>

<p>Your purchase order has been approved and will be processed.</p>
```

### Template 3: Purchase Order Rejected
- **Template Name:** `order_rejected`
- **Subject:** `Purchase Order Rejected - {{order_id}}`
- **Content:**
```html
<h2>Purchase Order Rejected ❌</h2>
<p><strong>Order ID:</strong> {{order_id}}</p>
<p><strong>Product:</strong> {{product_name}}</p>
<p><strong>Quantity:</strong> {{quantity}}</p>
<p><strong>Total Cost:</strong> ${{total_cost}}</p>
<p><strong>Rejected By:</strong> {{approver_name}}</p>
<p><strong>Reason:</strong> {{rejection_reason}}</p>

<p>Please review the rejection reason and resubmit if necessary.</p>
```

Note down each **Template ID** (e.g., `template_xyz789`)

## Step 5: Get Your Public Key

1. In EmailJS dashboard, go to **Account** → **General**
2. Find your **Public Key** (e.g., `user_abc123def456`)

## Step 6: Update Environment Variables

Edit `frontend/.env` file and replace the placeholder values:

```env
# EmailJS Configuration - Replace with your actual values from emailjs.com
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abc123def456
VITE_YOUR_GMAIL=your.actual.email@gmail.com
```

**Important:** Replace `your.actual.email@gmail.com` with your real Gmail address where you want to receive notifications.

## Step 7: Test the Setup

1. Restart your development server:
```bash
npm run dev
```

2. Open the application and try creating a purchase order
3. Check your Gmail inbox for the notification email
4. Try approving/rejecting orders to test all email types

## Troubleshooting

### Common Issues:

1. **Emails not sending:**
   - Check browser console for errors
   - Verify all environment variables are set correctly
   - Make sure EmailJS service is active

2. **Template errors:**
   - Ensure template variable names match exactly (case-sensitive)
   - Check that template IDs are correct

3. **Gmail not receiving:**
   - Check spam folder
   - Verify Gmail address is correct in .env file
   - Ensure EmailJS service is connected to the right Gmail account

### EmailJS Free Tier Limits:
- 200 emails per month
- Perfect for testing and small projects

## Alternative Options

If you prefer other email services:

### Option 2: Nodemailer + Express Backend
- More control but requires backend server
- Good for production applications

### Option 3: SendGrid
- Professional email service
- Requires API key setup

### Option 4: AWS SES
- Amazon's email service
- Cost-effective for high volume

The current setup with EmailJS is the easiest to get started with and perfect for testing your notification system!