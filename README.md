# SMS Management System

An SMS Management System built with React and React Router, designed to manage SMS, monitor processes, handle country-operator data, and test database connections. The app has a user-friendly interface with intuitive navigation and responsive design using Tailwind CSS.

## Features

- `Send SMS:` Interface for sending SMS messages.
- `Process Control:` Start, stop, and restart server processes.
- `Country Operator Management: ` Add and view country-operator pairs with priority settings.
- `Database Connection Test:` Test the application’s database connectivity.

## Setup

1) Clone the repository:

``` bash
git clone <repository-url>
cd <repository-directory>

```
2) Install dependencies:

```bash
npm install

```

3) Start the app:

```bash

npm start

```

This will start the app on `http://localhost:3000.`




## Usage

Navigate to different routes within the app for various features:

- Send SMS: `/send-sms`
- Process Control: `/process-control`
- Country Operator Management: `/country-operator-management`
- DB Connection Test: `/db-connection-test`

## API Integration

he app uses an API service (`services/api.js`) to interact with backend functions. Ensure that the API server is running and endpoints are correctly defined.

- Send SMS: `sendSMS(data)`
- Process Control: `startSession(data)`, `stopSession(data)`, `restartSession(data)`
- Country Operator Management: `addCountryOperator(data)`, `getCountryOperators()`
- DB Connection Test: `DB Connection Test: `

## Components

- **SMSForm:** Form to input and send SMS messages.
- **ProcessControl:** Start, stop, and restart processes by session and program name.
- **CountryOperatorManagement:** Add and display operators for different countries, with a priority option.
- **DBConnectionTest:** Test and display the status of the database connection.

Each component is designed to interact with the API and update the UI based on the response.

## Styling

The app uses Tailwind CSS for styling, providing responsive and modern UI elements:

- `Background Gradient:` Main app background with a light blue gradient (bg-gradient-to-r from-blue-100 to-blue-300).
- `Responsive Navigation:` A responsive navbar with hover effects for navigation between features.
- `Status Feedback:` Conditional styling in components for success/error feedback.