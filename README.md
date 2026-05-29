# Educonnect
EduConnect is a localized, community-driven knowledge base and collaborative platform designed for students to crowdsource academic solutions, share resources, and participate in automated, gamified study groups.
EduConnect
EduConnect is a localized, community-driven knowledge base where students can crowdsource solutions to academic hurdles. By integrating real-time collaboration tools, automated meeting generation, and peer resource sharing, it transforms solitary studying into a gamified, social experience.
+1

🚀 Key Features

Peer-to-Peer Problem Solving: A forum-style interface where students post issues and others provide solutions.


Automated Study Groups: The system automatically forms groups based on shared academic interests and uses the Google Meet/Zoom API to generate unique meeting links.


Gamified Engagement: A "streak" system to reward students for daily participation, answering questions, or attending sessions.


Resource Repository: A dedicated section for students to recommend and rank textbooks or helpful study websites for specific subjects.


Real-time Notifications: Instant alerts for new answers to questions, group formation, and upcoming meeting reminders.

🛠 Technical Stack

Frontend: React.js 


Backend: Django (Python) 


Database: PostgreSQL 


Real-time: WebSockets 


Authentication: JWT (JSON Web Tokens) 

📋 Core Functionality (CRUD)

Create: Students can register accounts, post academic "problems," and list recommended study materials.


Read: Students can browse categorized feeds, search for resources, and view group schedules.


Update: Solvers can edit answers for clarity, and posters can mark the best solution to close a thread.


Delete: Students can remove their own posts, cancel scheduled meetings, or deactivate accounts.

👥 Contributors

Ian Kimathi Kitheka — 190118 


Mwai Komo — 170469



TECHNICAL DOCUMENTATION

# EduConnect Technical Documentation

**System Requirements Specification, Architecture Design & API Reference**

| Field | Details |
|---|---|
| Project | EduConnect – Peer-to-Peer and Collaborative Learning System |
| Authors | Ian Kimathi Kitheka (190118), Komo Mwai (170469) |
| Supervisor | Mrs. Juliet Kirui |
| Institution | School of Computing and Engineering Sciences (SCES) |
| Version | 1.0 |
| Date | May 2026 |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Stakeholders and User Roles](#3-stakeholders-and-user-roles)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture](#6-system-architecture)
7. [Database Design](#7-database-design)
8. [API Reference](#8-api-reference)
9. [Real-Time Communication (WebSocket)](#9-real-time-communication-websocket)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Third-Party Integrations](#11-third-party-integrations)
12. [Gamification Engine](#12-gamification-engine)
13. [Security Considerations](#13-security-considerations)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment](#15-deployment)
16. [Glossary](#16-glossary)

---

## 1. Introduction

### 1.1 Purpose

This document provides the complete technical specification for EduConnect, a web-based peer-to-peer academic collaboration platform. It covers system requirements, architectural design decisions, database schema, REST API endpoints, WebSocket events, and integration contracts. It is intended for developers, system architects, and technical reviewers involved in the implementation and maintenance of EduConnect.

### 1.2 Scope

EduConnect addresses the gap in existing academic support platforms by providing:

- A forum-style interface for structured academic Q&A
- Real-time live chat powered by WebSockets
- Automated study group formation linked to Google Meet / Zoom APIs
- A streak-based gamification engine to sustain engagement
- A community-ranked resource repository

The system targets students and expert solvers in higher education institutions. It does not include LMS features such as grading, course enrolment, or timetabling.

### 1.3 Definitions and Abbreviations

| Term | Definition |
|---|---|
| API | Application Programming Interface |
| DRF | Django REST Framework |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapper |
| REST | Representational State Transfer |
| WebSocket | Full-duplex TCP-based communication protocol |
| Expert Solver | A verified advanced student or teaching assistant with elevated platform privileges |
| Streak | A consecutive-days participation score used in the gamification engine |
| OAuth 2.0 | Open Authorization protocol used by Google Meet and Zoom integrations |
| SRS | System Requirements Specification |

### 1.4 References

- Django Software Foundation (2025). Django Documentation.
- React Documentation (2025). React.js Official Docs.
- PostgreSQL Global Development Group (2025). PostgreSQL Documentation.
- IJNRD (2024). Enhancing Real-Time Web Applications with WebSockets.
- DigitalOcean (2025). Build a to-do app with Django and React.

---

## 2. System Overview

EduConnect is a three-tier web application composed of:

1. **Presentation Layer** — A React.js single-page application (SPA) providing the student-facing UI.
2. **Application Layer** — A Django backend exposing RESTful API endpoints (via Django REST Framework) and WebSocket consumers (via Django Channels).
3. **Data Layer** — A PostgreSQL relational database persisting all application state.

The system integrates with Google Meet and Zoom APIs for automated meeting link generation, and uses JWT-based stateless authentication throughout.

```
┌─────────────────────┐       HTTPS / WSS       ┌──────────────────────────┐
│   React.js SPA      │ ◄──────────────────────► │   Django Application     │
│  (Presentation)     │                          │  REST API + WS Consumers │
└─────────────────────┘                          └──────────┬───────────────┘
                                                            │
                                              ┌─────────────▼──────────────┐
                                              │      PostgreSQL DB          │
                                              │      (Data Layer)           │
                                              └────────────────────────────┘
                                                            │
                                              ┌─────────────▼──────────────┐
                                              │  External APIs              │
                                              │  Google Meet / Zoom OAuth   │
                                              └────────────────────────────┘
```

---

## 3. Stakeholders and User Roles

### 3.1 User Roles

| Role | Description | Permissions |
|---|---|---|
| **Student** | General registered user | Post questions, answer, join study groups, submit resources, earn streaks |
| **Expert Solver** | Verified advanced student or TA | All student permissions + answer endorsement, question prioritization |
| **Administrator** | Platform operator | User management, content moderation, analytics access |

### 3.2 Role Assignment

- Students self-register via the registration endpoint.
- Expert Solver status is assigned by an Administrator after verification.
- Administrator accounts are created via Django's management CLI (`createsuperuser`).

---

## 4. Functional Requirements

### 4.1 User Management

| ID | Requirement |
|---|---|
| FR-UM-01 | The system shall allow users to register with email, name, and password. |
| FR-UM-02 | The system shall authenticate users via JWT access and refresh tokens. |
| FR-UM-03 | The system shall support role-based access control (Student, Expert Solver, Admin). |
| FR-UM-04 | The system shall allow users to update their profile, including subject interests. |
| FR-UM-05 | The system shall support password reset via email verification. |

### 4.2 Forum & Q&A

| ID | Requirement |
|---|---|
| FR-QA-01 | The system shall allow students to post academic questions tagged by subject. |
| FR-QA-02 | The system shall allow any registered user to submit answers to open questions. |
| FR-QA-03 | Expert Solvers shall be able to endorse (verify) answers. |
| FR-QA-04 | The question poster shall be able to mark an answer as accepted. |
| FR-QA-05 | The system shall support upvoting of questions and answers. |
| FR-QA-06 | The system shall send real-time notifications to the question owner when a new answer is posted. |

### 4.3 Real-Time Chat

| ID | Requirement |
|---|---|
| FR-RT-01 | The system shall provide a live chat channel within each study group. |
| FR-RT-02 | Chat messages shall be delivered to all group members in under 100ms under normal load. |
| FR-RT-03 | Chat history shall be persisted and retrievable on reconnect. |
| FR-RT-04 | The system shall display read receipts and typing indicators within chat. |

### 4.4 Automated Study Group Formation

| ID | Requirement |
|---|---|
| FR-SG-01 | The system shall automatically match students who share subject tags or have posted similar questions. |
| FR-SG-02 | Upon group formation, the system shall call the Google Meet or Zoom API to generate a unique meeting link. |
| FR-SG-03 | Meeting links shall be embedded in the study group page and distributed via notification. |
| FR-SG-04 | Students shall be able to manually create study groups and invite peers. |
| FR-SG-05 | Group size shall be configurable, defaulting to a maximum of 8 members. |

### 4.5 Resource Repository

| ID | Requirement |
|---|---|
| FR-RR-01 | Users shall be able to submit resource links (URLs, textbook references) tagged by subject. |
| FR-RR-02 | Users shall be able to upvote or downvote resources. |
| FR-RR-03 | Resources shall be displayed ranked by net community votes. |
| FR-RR-04 | The system shall support filtering resources by subject, type, and date. |

### 4.6 Gamification

| ID | Requirement |
|---|---|
| FR-GM-01 | The system shall track daily participation events: posting, answering, attending sessions. |
| FR-GM-02 | The system shall compute and display a consecutive-day activity streak per user. |
| FR-GM-03 | The system shall award points for each tracked participation event. |
| FR-GM-04 | The system shall display a leaderboard ranked by total points within selectable timeframes. |
| FR-GM-05 | Streaks shall reset if a user records no participation event for a calendar day. |

### 4.7 Notifications

| ID | Requirement |
|---|---|
| FR-NT-01 | The system shall deliver real-time in-app notifications via WebSocket. |
| FR-NT-02 | Notification triggers include: new answer, study group formation, meeting reminder (15 min before), resource upvote milestone. |
| FR-NT-03 | Users shall be able to configure which notification types they receive. |

### 4.8 Admin Dashboard

| ID | Requirement |
|---|---|
| FR-AD-01 | Administrators shall be able to view platform usage analytics (DAU, questions posted, groups formed). |
| FR-AD-02 | Administrators shall be able to moderate (edit, delete) any post or resource. |
| FR-AD-03 | Administrators shall be able to promote or demote users between roles. |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|---|---|
| NFR-PF-01 | REST API endpoints shall respond within 300ms for the 95th percentile of requests under normal load. |
| NFR-PF-02 | WebSocket message delivery shall achieve latency below 100ms under normal load. |
| NFR-PF-03 | The system shall support at least 500 concurrent WebSocket connections. |

### 5.2 Security

| ID | Requirement |
|---|---|
| NFR-SC-01 | All HTTP traffic shall be served over HTTPS (TLS 1.2+). |
| NFR-SC-02 | All WebSocket connections shall use WSS (WebSocket Secure). |
| NFR-SC-03 | JWT access tokens shall expire after 15 minutes; refresh tokens after 7 days. |
| NFR-SC-04 | Passwords shall be hashed using bcrypt with a minimum cost factor of 12. |
| NFR-SC-05 | API endpoints shall be protected against SQL injection via Django ORM parameterisation. |

### 5.3 Scalability

| ID | Requirement |
|---|---|
| NFR-SL-01 | The application layer shall be horizontally scalable via stateless JWT authentication. |
| NFR-SL-02 | Django Channels shall use a Redis channel layer to support multi-process WebSocket scaling. |

### 5.4 Usability

| ID | Requirement |
|---|---|
| NFR-UX-01 | The UI shall be fully responsive, supporting viewport widths from 320px to 1920px. |
| NFR-UX-02 | Core user flows (register, post question, join group) shall be completable in under 3 clicks. |

### 5.5 Maintainability

| ID | Requirement |
|---|---|
| NFR-MT-01 | All source code shall be version-controlled in GitHub with feature-branch workflow. |
| NFR-MT-02 | Backend modules shall have minimum 70% unit test coverage. |

---

## 6. System Architecture

### 6.1 High-Level Architecture

EduConnect follows a **client-server architecture** with a clear separation of concerns across three layers.

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                           │
│  React.js SPA                                              │
│  - Component-based UI (Hooks, Context API)                 │
│  - Axios for REST calls                                     │
│  - Native WebSocket API for real-time events               │
└──────────────────────┬─────────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼─────────────────────────────────────┐
│                   APPLICATION LAYER                        │
│  Django 4.x + Django REST Framework                        │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │   REST API Router    │  │   Django Channels (ASGI)     │ │
│  │   /api/v1/...        │  │   WebSocket Consumers        │ │
│  └────────┬────────────┘  └────────────┬─────────────────┘ │
│           │                            │                    │
│  ┌────────▼────────────────────────────▼─────────────────┐ │
│  │          Django ORM / Business Logic                   │ │
│  │  Auth, Forum, Groups, Resources, Gamification          │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────▼───────┐  ┌───────▼──────┐  ┌───────▼──────────┐
│  PostgreSQL    │  │  Redis        │  │  External APIs    │
│  (Primary DB)  │  │  (Channel     │  │  Google Meet API  │
│                │  │   Layer)      │  │  Zoom API         │
└────────────────┘  └──────────────┘  └──────────────────┘
```

### 6.2 Frontend Architecture (React.js)

The frontend is organized as a modular SPA:

```
src/
├── api/             # Axios instance and API call wrappers
├── components/      # Reusable UI components (Button, Card, Modal…)
├── pages/           # Route-level page components
│   ├── Auth/        # Login, Register
│   ├── Forum/       # Question list, Question detail, Ask question
│   ├── Groups/      # Study group list, Group detail, Chat
│   ├── Resources/   # Repository browse, Submit resource
│   └── Dashboard/   # User profile, Streak, Leaderboard
├── hooks/           # Custom React hooks (useWebSocket, useAuth…)
├── context/         # Global state (AuthContext, NotificationContext)
├── utils/           # Helpers (token management, date formatting)
└── App.jsx          # Root component and router
```

**State Management:** React Context API + `useReducer` for global auth and notification state. Local component state with `useState` for UI interactions.

### 6.3 Backend Architecture (Django)

Django apps are organized by domain:

```
backend/
├── config/               # Django project settings, URL root, ASGI config
├── users/                # Custom user model, JWT endpoints, role management
├── forum/                # Question, Answer, Tag models and views
├── groups/               # StudyGroup, Membership, MeetingLink models and views
├── resources/            # Resource, Vote models and views
├── gamification/         # Streak, Points, Leaderboard logic
├── notifications/        # Notification model, WebSocket consumer for notifications
├── chat/                 # ChatMessage model, WebSocket consumer for live chat
└── integrations/         # Google Meet and Zoom API service wrappers
```

### 6.4 Technology Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Frontend | React.js | 18.x |
| HTTP Client | Axios | 1.x |
| Backend Framework | Django | 4.x |
| REST API | Django REST Framework | 3.x |
| WebSocket | Django Channels | 4.x |
| Channel Layer | Redis (channels-redis) | 4.x |
| Database | PostgreSQL | 16.x |
| Authentication | djangorestframework-simplejwt | 5.x |
| IDE | Visual Studio Code | Latest |
| Version Control | GitHub | — |

---

## 7. Database Design

### 7.1 Entity Relationship Overview

The primary entities are: **User**, **Question**, **Answer**, **Tag**, **StudyGroup**, **Membership**, **MeetingLink**, **Resource**, **Vote**, **ChatMessage**, **Notification**, **StreakRecord**, **PointTransaction**.

### 7.2 Schema Definitions

#### 7.2.1 users_user

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| username | VARCHAR(100) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'student' — enum: student, expert_solver, admin |
| subject_interests | TEXT[] | NULLABLE |
| streak_count | INTEGER | NOT NULL, DEFAULT 0 |
| total_points | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.2 forum_question

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| author_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | NOT NULL |
| is_resolved | BOOLEAN | NOT NULL, DEFAULT FALSE |
| upvote_count | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.3 forum_answer

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| question_id | UUID | FOREIGN KEY → forum_question(id) ON DELETE CASCADE |
| author_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| body | TEXT | NOT NULL |
| is_endorsed | BOOLEAN | NOT NULL, DEFAULT FALSE |
| is_accepted | BOOLEAN | NOT NULL, DEFAULT FALSE |
| upvote_count | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.4 forum_tag

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(80) | UNIQUE, NOT NULL |

#### 7.2.5 forum_question_tags (Junction)

| Column | Type | Constraints |
|---|---|---|
| question_id | UUID | FOREIGN KEY → forum_question(id) |
| tag_id | UUID | FOREIGN KEY → forum_tag(id) |
| PRIMARY KEY | (question_id, tag_id) | — |

#### 7.2.6 groups_studygroup

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(150) | NOT NULL |
| subject_tag_id | UUID | FOREIGN KEY → forum_tag(id) NULLABLE |
| formation_type | VARCHAR(20) | NOT NULL — enum: automated, manual |
| max_members | INTEGER | NOT NULL, DEFAULT 8 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.7 groups_membership

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| group_id | UUID | FOREIGN KEY → groups_studygroup(id) ON DELETE CASCADE |
| user_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| UNIQUE | (group_id, user_id) | — |

#### 7.2.8 groups_meetinglink

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| group_id | UUID | FOREIGN KEY → groups_studygroup(id) ON DELETE CASCADE |
| provider | VARCHAR(20) | NOT NULL — enum: google_meet, zoom |
| meeting_url | TEXT | NOT NULL |
| scheduled_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.9 resources_resource

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| submitted_by_id | UUID | FOREIGN KEY → users_user(id) ON DELETE SET NULL |
| title | VARCHAR(255) | NOT NULL |
| url | TEXT | NOT NULL |
| resource_type | VARCHAR(50) | NULLABLE — e.g., textbook, article, video |
| tag_id | UUID | FOREIGN KEY → forum_tag(id) NULLABLE |
| net_votes | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.10 resources_vote

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| resource_id | UUID | FOREIGN KEY → resources_resource(id) ON DELETE CASCADE |
| user_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| value | SMALLINT | NOT NULL — +1 or -1 |
| UNIQUE | (resource_id, user_id) | — |

#### 7.2.11 chat_chatmessage

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| group_id | UUID | FOREIGN KEY → groups_studygroup(id) ON DELETE CASCADE |
| sender_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| content | TEXT | NOT NULL |
| sent_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.12 notifications_notification

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| recipient_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| notification_type | VARCHAR(50) | NOT NULL |
| payload | JSONB | NOT NULL |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

#### 7.2.13 gamification_streakrecord

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| date | DATE | NOT NULL |
| events_count | INTEGER | NOT NULL, DEFAULT 0 |
| UNIQUE | (user_id, date) | — |

#### 7.2.14 gamification_pointtransaction

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY → users_user(id) ON DELETE CASCADE |
| event_type | VARCHAR(50) | NOT NULL |
| points_awarded | INTEGER | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

---

## 8. API Reference

All REST endpoints are prefixed with `/api/v1/`. All requests and responses use `Content-Type: application/json`. Protected endpoints require the header `Authorization: Bearer <access_token>`.

### 8.1 Authentication

#### POST `/api/v1/auth/register/`

Register a new user account.

**Request Body**

```json
{
  "email": "student@university.ac.ke",
  "username": "ian_kitheka",
  "password": "SecurePass123!",
  "subject_interests": ["mathematics", "data-structures"]
}
```

**Response 201 Created**

```json
{
  "id": "uuid",
  "email": "student@university.ac.ke",
  "username": "ian_kitheka",
  "role": "student",
  "created_at": "2026-05-21T10:00:00Z"
}
```

---

#### POST `/api/v1/auth/login/`

Obtain JWT access and refresh tokens.

**Request Body**

```json
{
  "email": "student@university.ac.ke",
  "password": "SecurePass123!"
}
```

**Response 200 OK**

```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

---

#### POST `/api/v1/auth/token/refresh/`

Exchange a refresh token for a new access token.

**Request Body**

```json
{
  "refresh": "<jwt_refresh_token>"
}
```

**Response 200 OK**

```json
{
  "access": "<new_jwt_access_token>"
}
```

---

#### POST `/api/v1/auth/logout/`

🔒 Protected. Blacklist the refresh token.

**Request Body**

```json
{
  "refresh": "<jwt_refresh_token>"
}
```

**Response 205 Reset Content** (empty body)

---

### 8.2 Users

#### GET `/api/v1/users/me/`

🔒 Protected. Retrieve the authenticated user's profile.

**Response 200 OK**

```json
{
  "id": "uuid",
  "email": "student@university.ac.ke",
  "username": "ian_kitheka",
  "role": "student",
  "subject_interests": ["mathematics"],
  "streak_count": 5,
  "total_points": 230,
  "created_at": "2026-05-01T08:00:00Z"
}
```

---

#### PATCH `/api/v1/users/me/`

🔒 Protected. Update user profile fields.

**Request Body** (all fields optional)

```json
{
  "username": "ian_k",
  "subject_interests": ["mathematics", "algorithms"]
}
```

**Response 200 OK** — returns updated profile object.

---

#### GET `/api/v1/users/{user_id}/`

🔒 Protected. Retrieve a public profile for any user.

**Response 200 OK** — returns public profile (excludes email).

---

### 8.3 Forum – Questions

#### GET `/api/v1/forum/questions/`

🔒 Protected. List questions with optional filtering.

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| tag | string | Filter by tag name |
| is_resolved | boolean | Filter by resolution status |
| search | string | Full-text search on title and body |
| ordering | string | `-created_at` (default), `upvote_count` |
| page | integer | Pagination page number |

**Response 200 OK**

```json
{
  "count": 142,
  "next": "/api/v1/forum/questions/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "How does Dijkstra's algorithm handle negative weights?",
      "body": "...",
      "author": { "id": "uuid", "username": "ian_kitheka" },
      "tags": ["algorithms", "graphs"],
      "is_resolved": false,
      "upvote_count": 14,
      "answer_count": 3,
      "created_at": "2026-05-20T09:00:00Z"
    }
  ]
}
```

---

#### POST `/api/v1/forum/questions/`

🔒 Protected. Create a new question.

**Request Body**

```json
{
  "title": "How does Dijkstra's algorithm handle negative weights?",
  "body": "I understand the algorithm for non-negative graphs, but what happens when...",
  "tags": ["algorithms", "graphs"]
}
```

**Response 201 Created** — returns the created question object.

---

#### GET `/api/v1/forum/questions/{question_id}/`

🔒 Protected. Retrieve a single question with its answers.

**Response 200 OK** — returns full question object including answers array.

---

#### PATCH `/api/v1/forum/questions/{question_id}/`

🔒 Protected. Update question (author or admin only).

---

#### DELETE `/api/v1/forum/questions/{question_id}/`

🔒 Protected. Delete question (author or admin only). **Response 204 No Content.**

---

#### POST `/api/v1/forum/questions/{question_id}/upvote/`

🔒 Protected. Toggle upvote on a question.

**Response 200 OK**

```json
{ "upvote_count": 15, "user_has_upvoted": true }
```

---

### 8.4 Forum – Answers

#### POST `/api/v1/forum/questions/{question_id}/answers/`

🔒 Protected. Post an answer to a question.

**Request Body**

```json
{
  "body": "Dijkstra's algorithm assumes all edge weights are non-negative. For graphs with negative weights, you should use the Bellman-Ford algorithm instead, which..."
}
```

**Response 201 Created** — returns the created answer object.

---

#### PATCH `/api/v1/forum/answers/{answer_id}/`

🔒 Protected. Edit answer (author or admin only).

---

#### POST `/api/v1/forum/answers/{answer_id}/endorse/`

🔒 Protected. Expert Solver or Admin only. Toggle endorsement on an answer.

**Response 200 OK**

```json
{ "is_endorsed": true }
```

---

#### POST `/api/v1/forum/answers/{answer_id}/accept/`

🔒 Protected. Question author only. Mark answer as accepted.

**Response 200 OK**

```json
{ "is_accepted": true }
```

---

### 8.5 Study Groups

#### GET `/api/v1/groups/`

🔒 Protected. List study groups the user is a member of.

**Response 200 OK** — paginated list of group objects.

---

#### POST `/api/v1/groups/`

🔒 Protected. Manually create a study group.

**Request Body**

```json
{
  "name": "Algorithms Study Group – Week 3",
  "subject_tag": "algorithms",
  "max_members": 6
}
```

**Response 201 Created** — returns the group object including a generated meeting link.

---

#### GET `/api/v1/groups/{group_id}/`

🔒 Protected. Retrieve a group's details, members, and meeting links.

---

#### POST `/api/v1/groups/{group_id}/join/`

🔒 Protected. Join a group (if not at capacity).

**Response 200 OK** — returns updated membership count.

---

#### DELETE `/api/v1/groups/{group_id}/leave/`

🔒 Protected. Leave a group. **Response 204 No Content.**

---

#### POST `/api/v1/groups/{group_id}/meetings/`

🔒 Protected. Generate a new meeting link for a group.

**Request Body**

```json
{
  "provider": "google_meet",
  "scheduled_at": "2026-05-25T14:00:00Z"
}
```

**Response 201 Created**

```json
{
  "id": "uuid",
  "provider": "google_meet",
  "meeting_url": "https://meet.google.com/abc-defg-hij",
  "scheduled_at": "2026-05-25T14:00:00Z"
}
```

---

### 8.6 Resources

#### GET `/api/v1/resources/`

🔒 Protected. Browse the resource repository.

**Query Parameters:** `tag`, `resource_type`, `ordering` (`-net_votes` default, `-created_at`), `page`.

**Response 200 OK** — paginated list of resource objects.

---

#### POST `/api/v1/resources/`

🔒 Protected. Submit a new resource.

**Request Body**

```json
{
  "title": "Introduction to Algorithms (CLRS) – 4th Edition",
  "url": "https://mitpress.mit.edu/books/introduction-algorithms",
  "resource_type": "textbook",
  "tag": "algorithms"
}
```

**Response 201 Created** — returns created resource object.

---

#### POST `/api/v1/resources/{resource_id}/vote/`

🔒 Protected. Cast or change a vote on a resource.

**Request Body**

```json
{ "value": 1 }
```

*value must be `1` (upvote) or `-1` (downvote).*

**Response 200 OK**

```json
{ "net_votes": 42, "user_vote": 1 }
```

---

### 8.7 Gamification

#### GET `/api/v1/gamification/me/`

🔒 Protected. Retrieve the authenticated user's streak and points summary.

**Response 200 OK**

```json
{
  "streak_count": 7,
  "total_points": 460,
  "today_events": 3,
  "recent_transactions": [
    { "event_type": "answer_posted", "points_awarded": 10, "created_at": "2026-05-21T08:30:00Z" }
  ]
}
```

---

#### GET `/api/v1/gamification/leaderboard/`

🔒 Protected. Retrieve the points leaderboard.

**Query Parameters:** `timeframe` — `all_time` (default), `weekly`, `monthly`.

**Response 200 OK** — ordered list of `{ rank, user: { id, username }, total_points }`.

---

### 8.8 Notifications

#### GET `/api/v1/notifications/`

🔒 Protected. List the authenticated user's notifications, newest first.

**Query Parameters:** `is_read` — filter by read status.

---

#### POST `/api/v1/notifications/{notification_id}/read/`

🔒 Protected. Mark a notification as read. **Response 200 OK.**

---

#### POST `/api/v1/notifications/read-all/`

🔒 Protected. Mark all notifications as read. **Response 200 OK.**

---

### 8.9 Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human-readable summary.",
    "details": {
      "field_name": ["Field-specific error message."]
    }
  }
}
```

**Common HTTP Status Codes**

| Code | Meaning |
|---|---|
| 400 | Bad Request – validation error |
| 401 | Unauthorized – missing or invalid token |
| 403 | Forbidden – insufficient role/permissions |
| 404 | Not Found |
| 409 | Conflict – duplicate resource (e.g., already a group member) |
| 429 | Too Many Requests – rate limit exceeded |
| 500 | Internal Server Error |

---

## 9. Real-Time Communication (WebSocket)

EduConnect uses Django Channels with a Redis channel layer for all real-time features. Connections use the WSS protocol.

### 9.1 Connection

**Endpoint:** `wss://<host>/ws/<consumer_type>/<room_id>/`

The JWT access token is passed as a query parameter on connection:

```
wss://educonnect.example.com/ws/chat/group_uuid/?token=<access_token>
```

### 9.2 Consumer Types

| Consumer | URL Pattern | Purpose |
|---|---|---|
| Chat | `/ws/chat/{group_id}/` | Live group chat |
| Notifications | `/ws/notifications/` | Per-user notification stream |

### 9.3 Chat Consumer Events

All messages are JSON objects with a `type` field.

#### Client → Server: Send Message

```json
{
  "type": "chat.message",
  "content": "Has anyone worked through problem 3.4 yet?"
}
```

#### Server → Client: New Message

```json
{
  "type": "chat.message",
  "message_id": "uuid",
  "sender": { "id": "uuid", "username": "ian_kitheka" },
  "content": "Has anyone worked through problem 3.4 yet?",
  "sent_at": "2026-05-21T10:15:30Z"
}
```

#### Client → Server: Typing Indicator

```json
{
  "type": "chat.typing",
  "is_typing": true
}
```

#### Server → Client: Typing Indicator Broadcast

```json
{
  "type": "chat.typing",
  "user": { "id": "uuid", "username": "ian_kitheka" },
  "is_typing": true
}
```

### 9.4 Notification Consumer Events

#### Server → Client: New Notification

```json
{
  "type": "notification.new",
  "notification_id": "uuid",
  "notification_type": "new_answer",
  "payload": {
    "question_id": "uuid",
    "question_title": "How does Dijkstra's algorithm handle negative weights?",
    "answer_author": "komo_mwai"
  },
  "created_at": "2026-05-21T10:20:00Z"
}
```

**Notification Types**

| Type | Trigger |
|---|---|
| `new_answer` | A new answer is posted on a question the user authored |
| `answer_endorsed` | An Expert Solver endorses an answer the user submitted |
| `answer_accepted` | The question author marks the user's answer as accepted |
| `group_formed` | The system automatically forms a study group containing the user |
| `meeting_reminder` | 15 minutes before a scheduled meeting |
| `resource_upvote_milestone` | A resource the user submitted reaches 10, 25, 50 net votes |

---

## 10. Authentication & Authorization

### 10.1 JWT Configuration (Simple JWT)

```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
}
```

### 10.2 Token Flow

```
1. Client POST /auth/login/ with credentials
2. Server validates credentials → returns access_token + refresh_token
3. Client stores tokens (in-memory for access; httpOnly cookie for refresh)
4. Client includes `Authorization: Bearer <access_token>` on each protected request
5. When access token expires (401 response), client POST /auth/token/refresh/
6. Server validates refresh token → returns new access_token
7. On logout, client POST /auth/logout/ to blacklist refresh_token
```

### 10.3 Role-Based Access Control

DRF custom permission classes enforce role-based access:

| Permission Class | Grants Access To |
|---|---|
| `IsAuthenticated` | Any authenticated user |
| `IsExpertSolverOrAdmin` | Expert Solvers and Admins only |
| `IsAdminUser` | Admins only |
| `IsOwnerOrAdmin` | Object owner or Admin |

---

## 11. Third-Party Integrations

### 11.1 Google Meet API

**Trigger:** Automatic study group formation or manual meeting creation request.

**Auth:** OAuth 2.0. The application holds server-side credentials (service account or delegated access) stored as environment variables.

**Flow:**

```
1. Group formation event fires in Django backend
2. integrations/google_meet.py calls Google Calendar API
   POST https://www.googleapis.com/calendar/v3/calendars/primary/events
   with conferenceDataVersion=1 and createRequest for a Meet link
3. API returns event object containing hangoutLink
4. Backend stores hangoutLink in groups_meetinglink table
5. Meeting link pushed to group members via WebSocket notification
```

**Key Environment Variables:**

```
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GOOGLE_OAUTH_REFRESH_TOKEN
```

### 11.2 Zoom API

**Trigger:** Same as Google Meet — used when user preference or admin config selects Zoom.

**Auth:** OAuth 2.0 (Server-to-Server OAuth for backend-only calls).

**Flow:**

```
1. Backend calls POST https://api.zoom.us/v2/users/me/meetings
   Authorization: Bearer <zoom_access_token>
   Body: { "type": 2, "topic": "<group_name>", "start_time": "<ISO8601>" }
2. API returns meeting object containing join_url
3. Backend stores join_url in groups_meetinglink table
4. Meeting link distributed via WebSocket notification
```

**Key Environment Variables:**

```
ZOOM_ACCOUNT_ID
ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET
```

### 11.3 Provider Selection Logic

The meeting provider is determined by the following order of precedence:

1. Explicit `provider` field in the `POST /groups/{id}/meetings/` request body.
2. The study group creator's saved preference.
3. System-wide default configured in Django settings (`DEFAULT_MEETING_PROVIDER`).

---

## 12. Gamification Engine

### 12.1 Point Ledger

Points are awarded per qualifying event and recorded in `gamification_pointtransaction`. Point values are configurable in Django settings.

| Event | Default Points |
|---|---|
| Post a question | 5 |
| Submit an answer | 10 |
| Answer endorsed by Expert Solver | 20 |
| Answer accepted by question author | 30 |
| Submit a resource | 5 |
| Resource reaches 10 net votes | 15 |
| Attend a scheduled study group session | 10 |

### 12.2 Streak Algorithm

The streak is calculated on each login and each qualifying participation event:

```
1. Retrieve today's StreakRecord for the user (create if absent, events_count = 0)
2. Increment events_count by 1
3. Check yesterday's StreakRecord:
   - If exists AND events_count > 0 → streak_count += 1
   - If missing or events_count == 0 → streak_count = 1 (reset)
4. Persist updated streak_count to users_user.streak_count
```

A background Celery task runs daily at midnight to finalize streak records for users with no activity that day, ensuring proper resets.

### 12.3 Leaderboard Query

The leaderboard is computed with an aggregate query against `gamification_pointtransaction`, filtered by `created_at` for weekly/monthly timeframes, grouped by `user_id`, ordered by `SUM(points_awarded) DESC`.

---

## 13. Security Considerations

### 13.1 Input Validation

All inputs are validated through DRF serializers before reaching business logic. Rich-text fields (question body, answer body) are sanitized with `bleach` to strip disallowed HTML tags before persistence.

### 13.2 Rate Limiting

Django REST Framework throttling is configured as follows:

| Scope | Limit |
|---|---|
| Anonymous requests | 20 requests/minute |
| Authenticated requests | 100 requests/minute |
| Auth endpoints (login, register) | 10 requests/minute |

### 13.3 CORS

The `django-cors-headers` package restricts `Access-Control-Allow-Origin` to the production frontend domain. During development, `localhost:3000` is whitelisted.

### 13.4 Environment Variables

No secrets (secret keys, API credentials, database passwords) are stored in source code. All secrets are managed via environment variables loaded through `python-decouple` or a secrets manager in production.

### 13.5 CSRF

REST API endpoints are stateless (JWT-based) and exempt from Django's CSRF middleware. The WebSocket handshake is authenticated via the JWT query parameter validated in the Channels middleware.

---

## 14. Testing Strategy

### 14.1 Unit Testing

- **Tool:** Django's built-in `TestCase` + `pytest-django`
- **Scope:** Model methods, serializer validation, gamification logic, permission classes
- **Target coverage:** ≥ 70%

### 14.2 Integration Testing

- **Tool:** DRF's `APITestCase` + `pytest-django`
- **Scope:** All REST API endpoints — covers happy path, authentication failure, permission denial, and validation error cases
- WebSocket consumer tests using `channels.testing.WebsocketCommunicator`

### 14.3 System Testing

- End-to-end tests using **Playwright** or **Cypress** scripted against the full deployed stack in a staging environment.
- Key flows covered: registration → post question → receive answer notification → join study group → receive meeting link.

### 14.4 User Acceptance Testing (UAT)

- Conducted with a representative sample of real students from the target institution.
- Participants complete structured tasks; results recorded against acceptance criteria defined in the functional requirements.
- Bugs and usability findings fed back into the sprint backlog.

---

## 15. Deployment

### 15.1 Environment Overview

| Environment | Purpose |
|---|---|
| Development | Local developer machines, SQLite optional |
| Staging | Full-stack deployment mirroring production for testing |
| Production | Live system serving real users |

### 15.2 Production Stack

| Component | Technology |
|---|---|
| Web Server | Nginx (reverse proxy + static file serving) |
| Application Server | Gunicorn (WSGI for REST) + Daphne (ASGI for WebSockets) |
| Process Manager | Systemd or Docker Compose |
| Database | PostgreSQL 16 |
| Channel Layer | Redis 7 |
| Background Tasks | Celery + Redis broker |
| Static/Media Files | Served via Nginx or object storage (e.g., S3-compatible) |

### 15.3 Environment Variables Required for Deployment

```
SECRET_KEY
DEBUG=False
ALLOWED_HOSTS
DATABASE_URL
REDIS_URL
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GOOGLE_OAUTH_REFRESH_TOKEN
ZOOM_ACCOUNT_ID
ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET
DEFAULT_MEETING_PROVIDER   # google_meet | zoom
FRONTEND_ORIGIN            # CORS allowed origin
```

### 15.4 Deployment Steps

```bash
# 1. Clone repository and install dependencies
pip install -r requirements.txt

# 2. Apply database migrations
python manage.py migrate

# 3. Collect static files
python manage.py collectstatic --no-input

# 4. Start ASGI server (handles both HTTP and WebSocket)
daphne -b 0.0.0.0 -p 8000 config.asgi:application

# 5. Start Celery worker (streak finalization and background tasks)
celery -A config worker -l info

# 6. Start Celery beat scheduler (midnight streak reset cron)
celery -A config beat -l info
```

---

## 16. Glossary

| Term | Definition |
|---|---|
| ASGI | Asynchronous Server Gateway Interface — Django's async-capable server protocol |
| Channel Layer | Redis-backed message bus used by Django Channels for cross-process WebSocket communication |
| Celery | Distributed task queue for background/scheduled jobs in Django |
| DRF | Django REST Framework — toolkit for building REST APIs with Django |
| Expert Solver | A verified advanced student or teaching assistant with elevated EduConnect privileges |
| JWT | JSON Web Token — compact, stateless token used for authentication |
| ORM | Object-Relational Mapper — Django's database abstraction layer |
| Redis | In-memory data structure store used as channel layer and Celery broker |
| Streak | Consecutive calendar days on which a user has recorded at least one qualifying participation event |
| WebSocket | Full-duplex communication protocol over a single persistent TCP connection, used for real-time features |
| WSS | WebSocket Secure — WebSocket over TLS, analogous to HTTPS |

---

*EduConnect Technical Documentation v1.0 — Ian Kimathi Kitheka & Komo Mwai — May 2026*