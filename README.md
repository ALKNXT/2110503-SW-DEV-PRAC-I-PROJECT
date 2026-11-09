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