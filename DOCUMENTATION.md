# FundIt - Crowdfunding Platform Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [User Roles & Features](#user-roles--features)
6. [Page Breakdown](#page-breakdown)
7. [API Endpoints Used](#api-endpoints-used)
8. [Authentication Flow](#authentication-flow)
9. [How to Run](#how-to-run)
10. [Test Accounts](#test-accounts)

---

## Project Overview

FundIt is a full-stack crowdfunding platform built with vanilla HTML5, CSS3, and JavaScript (ES6+). It uses JSON Server as a mock REST API backend. The platform supports three user roles: **Admin**, **Registered User**, and **Guest**, each with different access levels and capabilities.

---

## Technology Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend  | JSON Server v1.0.0-beta.12     |
| Database | `db.json` (flat-file JSON)     |
| Package Manager | npm                     |

**Reference:** `package.json` — defines the project dependencies and start script.

---

## Project Structure

```
crowdfunding/
├── db.json                          # Mock database (JSON Server data store)
├── package.json                     # Project config and dependencies
├── public/                          # Static files served by JSON Server
│   ├── index.html                   # Home page (campaign browsing)
│   ├── login.html                   # Login page
│   ├── register.html                # Registration page
│   ├── campaign.html                # Single campaign detail page
│   ├── create-campaign.html         # Campaign creation form
│   ├── dashboard.html               # Registered user dashboard
│   ├── admin.html                   # Admin panel
│   ├── css/
│   │   └── style.css                # All application styles
│   └── js/
│       ├── utils.js                 # Shared utilities (auth, navbar, helpers)
│       ├── home.js                  # Home page logic (browse, search, filter)
│       ├── login.js                 # Login form handling
│       ├── register.js              # Registration form handling
│       ├── campaign.js              # Campaign detail and pledge logic
│       ├── create-campaign.js       # Campaign creation logic
│       ├── dashboard.js             # User dashboard logic
│       └── admin.js                 # Admin panel logic
```

---

## Database Schema

Defined in `db.json` with three collections:

### users
| Field      | Type    | Description                          |
|------------|---------|--------------------------------------|
| id         | string  | Unique identifier (auto-generated)   |
| name       | string  | Full name                            |
| email      | string  | Email address (used for login)       |
| password   | string  | Plain text password                  |
| role       | string  | `"admin"` or `"user"`                |
| isActive   | boolean | `false` means the user is banned     |

### campaigns
| Field       | Type    | Description                                 |
|-------------|---------|---------------------------------------------|
| id          | string  | Unique identifier (auto-generated)          |
| title       | string  | Campaign title                              |
| description | string  | Campaign description                        |
| category    | string  | Category (technology, music, community, etc)|
| goal        | number  | Funding goal in dollars                     |
| raised      | number  | Total amount raised so far                  |
| deadline    | string  | Deadline in `dd-mm-yyyy` format             |
| creatorId   | number  | ID of the user who created the campaign     |
| isApproved  | boolean | Whether admin has approved the campaign     |
| isRejected  | boolean | Whether admin has rejected the campaign     |
| image       | string  | Base64-encoded image string (optional)      |

### pledges
| Field      | Type   | Description                        |
|------------|--------|------------------------------------|
| id         | string | Unique identifier (auto-generated) |
| campaignId | number | ID of the pledged campaign         |
| userId     | number | ID of the user who pledged         |
| amount     | number | Pledge amount in dollars           |

---

## User Roles & Features

### 1. Guest User
- Browse approved campaigns on the home page (`index.html`)
- Search campaigns by keyword (client-side filtering)
- Filter campaigns by category
- Sort campaigns by deadline or goal amount
- View individual campaign details (`campaign.html`)

**Reference:** `public/js/home.js` — fetches `GET /campaigns?isApproved=true` and handles client-side search/filter/sort.

### 2. Registered User
- Everything a Guest can do, plus:
- **Register** a new account via `POST /users` — `public/js/register.js`
- **Log in** by matching email/password against `GET /users?email=...` — `public/js/login.js`
- **Create campaigns** via `POST /campaigns` with title, description, category, goal, deadline, and optional Base64 image — `public/js/create-campaign.js`
- **Edit own campaigns** (deadline and description) via `PATCH /campaigns/:id` — `public/js/campaign.js` → `saveEdit()`
- **Pledge to campaigns** via `POST /pledges` with a mock payment confirmation dialog — `public/js/campaign.js` → `submitPledge()`
- **View personal dashboard** showing own campaigns and pledge history — `public/js/dashboard.js`
  - Own campaigns: `GET /campaigns?creatorId=:id`
  - Own pledges: `GET /pledges?userId=:id`

### 3. Admin
- **View all users** — `GET /users` — displayed in the Users tab
- **Ban/Unban users** — `PATCH /users/:id` with `{ isActive: false }` or `{ isActive: true }`
- **View all campaigns** — `GET /campaigns` — displayed in the Campaigns tab
- **Moderate campaigns** (only for pending campaigns):
  - Approve: `PATCH /campaigns/:id` with `{ isApproved: true, isRejected: false }`
  - Reject: `PATCH /campaigns/:id` with `{ isApproved: false, isRejected: true }`
  - Approved and Rejected are final states (no further actions available)
- **View all pledges** — `GET /pledges` — displayed in the Pledges tab

**Reference:** `public/js/admin.js` — all admin CRUD operations.

---

## Page Breakdown

### `index.html` → `home.js`
The landing page. Displays a hero section, search bar, category filter, sort dropdown, and a grid of approved campaign cards. Each card shows the title, description, category tag, progress bar, amount raised, percentage funded, and deadline. Clicking a card navigates to the campaign detail page.

### `login.html` → `login.js`
Login form with email and password fields. On submit, fetches users by email from the API, compares the password, checks if the account is active (not banned), and stores the user object in `sessionStorage`. Redirects admins to `/admin.html` and regular users to `/`.

### `register.html` → `register.js`
Registration form with name, email, and password. Checks for duplicate emails before creating a new user via `POST /users`. Automatically logs in the new user and redirects to home.

### `campaign.html` → `campaign.js`
Campaign detail view. Loads a single campaign by ID from the URL query string (`?id=`). Displays full campaign info, funding progress, and backer count. Logged-in users see a pledge form with a confirmation dialog (mock payment). Campaign owners see an edit form for deadline and description.

### `create-campaign.html` → `create-campaign.js`
Campaign creation form (requires login). Fields: title, description, category, goal, deadline (dd-mm-yyyy format), and optional image upload. Images are converted to Base64 using `FileReader.readAsDataURL()`. New campaigns are created with `isApproved: false` and must be approved by an admin to appear on the home page.

### `dashboard.html` → `dashboard.js`
User dashboard (requires login). Two tables:
- **My Campaigns** — shows all campaigns created by the user with their status (Approved/Pending).
- **My Pledges** — shows all pledges made by the user with campaign titles and amounts.

### `admin.html` → `admin.js`
Admin dashboard (requires admin role). Three tabs:
- **Users** — table of all users with ban/unban actions (admins cannot ban other admins).
- **Campaigns** — table of all campaigns with approve/reject actions for pending campaigns. Approved and rejected campaigns show no action buttons.
- **Pledges** — read-only table of all pledges.

---

## API Endpoints Used

All requests go to `http://localhost:5500` (JSON Server).

| Method | Endpoint                                  | Used In                | Purpose                          |
|--------|-------------------------------------------|------------------------|----------------------------------|
| GET    | `/campaigns?isApproved=true`              | `home.js`              | Browse approved campaigns        |
| GET    | `/campaigns/:id`                          | `campaign.js`          | View single campaign             |
| GET    | `/campaigns?creatorId=:id`                | `dashboard.js`         | User's own campaigns             |
| GET    | `/campaigns`                              | `admin.js`             | Admin views all campaigns        |
| POST   | `/campaigns`                              | `create-campaign.js`   | Create new campaign              |
| PATCH  | `/campaigns/:id`                          | `campaign.js`          | Edit campaign (deadline, desc)   |
| PATCH  | `/campaigns/:id`                          | `admin.js`             | Approve/reject campaign          |
| DELETE | `/campaigns/:id`                          | `admin.js`             | Delete campaign                  |
| GET    | `/users?email=:email`                     | `login.js`             | Find user by email               |
| GET    | `/users`                                  | `admin.js`             | Admin views all users            |
| GET    | `/users/:id`                              | `campaign.js`          | Get campaign creator name        |
| POST   | `/users`                                  | `register.js`          | Register new user                |
| PATCH  | `/users/:id`                              | `admin.js`             | Ban/unban user                   |
| GET    | `/pledges?campaignId=:id`                 | `campaign.js`          | Get pledges for a campaign       |
| GET    | `/pledges?userId=:id`                     | `dashboard.js`         | User's pledge history            |
| GET    | `/pledges`                                | `admin.js`             | Admin views all pledges          |
| POST   | `/pledges`                                | `campaign.js`          | Submit a pledge                  |

---

## Authentication Flow

Authentication is handled client-side using `sessionStorage`:

1. **Login** (`login.js`): Fetches the user by email, compares the password, checks `isActive` status, and stores the user object in `sessionStorage`.
2. **Session Check** (`utils.js` → `getCurrentUser()`): Every page reads from `sessionStorage` to determine the current user and role.
3. **Navbar Rendering** (`utils.js` → `renderNavbar()`): Dynamically renders navigation links based on the user's role (guest, user, or admin).
4. **Route Protection**: Pages like `create-campaign.html`, `dashboard.html`, and `admin.html` check for a valid session on load and redirect to `/login.html` if unauthorized.
5. **Logout** (`utils.js` → `logout()`): Clears `sessionStorage` and redirects to home.

---

## How to Run

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The application will be available at `http://localhost:5500`.

JSON Server serves both the REST API and the static files from the `public/` directory.

---

## Test Accounts

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@crowdfund.com | admin123  |
| User  | jane@example.com    | jane123   |
| User  | ahmed@example.com   | ahmed123  |
| User  | sara@example.com    | sara123   |
