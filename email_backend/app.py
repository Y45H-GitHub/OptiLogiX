from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app) # Enable CORS for all origins

# Load email credentials from environment variables
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')
SENDER_PASSWORD = os.environ.get('SENDER_PASSWORD')

@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400

    receiver_email = data.get('receiver_email')
    subject = data.get('subject')
    body = data.get('body')

    if not all([receiver_email, subject, body]):
        return jsonify({'status': 'error', 'message': 'Missing required email parameters'}), 400

    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print(f"SENDER_EMAIL: {SENDER_EMAIL}")
        print(f"SENDER_PASSWORD: {SENDER_PASSWORD}")
        return jsonify({'status': 'error', 'message': 'Email sender credentials not configured on the server.'}), 500

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())
        print("Email sent successfully!")
        return jsonify({'status': 'success', 'message': 'Email sent successfully!'}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        if 'server' in locals() and server:
            server.quit()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)