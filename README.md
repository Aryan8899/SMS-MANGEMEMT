 SMS Management System Backend

This is the backend for the **SMS Management System**, built with **FastAPI**. It allows managing SMS processes, controlling program sessions, storing country-operator data, and testing database connections. The backend integrates with **Twilio** for SMS, **Telegram Bot** for notifications, and both **MySQL** and **MongoDB** for data storage.

## Features

- **SMS Sending**: Send SMS messages via Twilio.
- **Process Control**: Start, stop, and restart server-side programs.
- **Country-Operator Management**: Manage country-operator pairs and priority settings.
- **Database Connection Test**: Check connections to MySQL and MongoDB.
- **Prometheus Integration**: Monitor system and process metrics.

## Prerequisites

- **Python 3.8+**
- **Twilio Account**: For sending SMS.
- **Telegram Bot**: For notifications.
- **MongoDB**: For country-operator data.
- **MySQL**: For storing SMS metrics.
- **Prometheus**: For monitoring.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sms-management-backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
```bash
# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# MongoDB
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=sms_management

# MySQL
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=sms_metrics_db
```

### 4.  Database Setup
MySQL: Ensure the `sms_metrics_db` database exists.

- Run the following in your MySQL shell to create the database:
 ```bash
 CREATE DATABASE sms_metrics_db;
```

- **MongoDB:** Ensure MongoDB is running locally and accessible at `mongodb://localhost:27017/`.

## Run the Application

```bash
uvicorn main:app --reload
```

## Prometheus Metrics
Prometheus metrics are exposed at `/metrics` and can be monitored using Prometheus.