# Rental Car Booking API

A REST API for a rental car booking system developed for the Software Development Practice course (Project #7).

The API lets customers find rental car providers and manage their bookings. Administrators can manage bookings across all customers.

## Getting started

### Prerequisites

- Git
- Node.js and npm
- A MongoDB Atlas database (or another MongoDB instance reachable from your machine)

### Install

Clone the team's repository and install its dependencies:

```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

## Project scope

- Register an account with a name, telephone number, email, and password.
- Log in and log out.
- Browse rental car providers. Each provider has a name, address, and telephone number.
- Create up to three car bookings per registered user by choosing a date and a rental car provider.
- View, edit, and delete the current user's bookings.
- Allow an administrator to view, edit, and delete any booking.

## Requirements and constraints

- The system is a web API built with REST principles.
- The frontend is outside the scope of this project.
- The API is tested with Postman.
- The database will use either MongoDB Atlas or PostgreSQL.
- The system should authenticate users with a username and password, keep user transactions confidential, and respond to requests within three seconds.

## Technology

- Node.js and Express for the REST API.
- MongoDB Atlas with Mongoose for data storage.
- Postman for API testing.

This stack follows the supplied backend example. The course also permits PostgreSQL if the team chooses to use it instead.

## API testing with Newman

The Postman collection is included at `sw-dev-prac-1-project.postman_collection.json`. Newman runs the collection from the command line, and the `htmlextra` reporter can generate an HTML test report.

### Prerequisites

- Install the project dependencies with `npm install`.
- Configure MongoDB and the API environment in `config/config.env`.
- Create an application admin account and know its email and password. These are API account credentials, not MongoDB credentials.
- Install Newman and its HTML reporter as development dependencies:

  ```bash
  npm install --save-dev newman newman-reporter-htmlextra
  ```

### Configure a Postman environment

In Postman, create and select an environment with these values:

| Variable | Value |
| --- | --- |
| `URL` | `http://localhost:5000` |
| `ADMIN_EMAIL` | Email address of the application's admin account |
| `ADMIN_PASSWORD` | Password of the application's admin account |

Export the environment as `local.postman_environment.json` in the project root. Keep this file private and do not commit it; it contains credentials. The collection creates test user data and captures user/admin tokens and resource IDs while it runs.

### Run the API tests

Start the API in one terminal:

```bash
npm run dev
```

In another terminal, run the collection and generate the HTML report:

```bash
npx newman run ./sw-dev-prac-1-project.postman_collection.json --environment ./local.postman_environment.json --reporters cli,htmlextra --reporter-htmlextra-export ./newman/newman-report.html
```

Newman prints the test results in the terminal and writes the HTML report to `newman/newman-report.html`. The `newman/` report directory and the local environment file should be excluded from Git. The collection creates test users, providers, and bookings in the configured database; use a development database for these runs.
