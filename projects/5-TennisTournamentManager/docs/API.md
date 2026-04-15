# API Documentation — Tennis Tournament Manager

This document describes the HTTP REST API endpoints used by the Tennis Tournament Manager application.

**Base URL**: `http://localhost:3000/api` (development)  
**Authentication**: JWT Bearer token in `Authorization` header  
**Content-Type**: `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Tournaments](#3-tournaments)
4. [Categories](#4-categories)
5. [Courts](#5-courts)
6. [Registrations](#6-registrations)
7. [Brackets](#7-brackets)
8. [Phases](#8-phases)
9. [Matches](#9-matches)
10. [Scores](#10-scores)
11. [Standings](#11-standings)
12. [Global Rankings](#12-global-rankings)
13. [Order of Play](#13-order-of-play)
14. [Notifications](#14-notifications)
15. [Announcements](#15-announcements)
16. [Statistics](#16-statistics)
17. [Payments](#17-payments)
18. [Sanctions](#18-sanctions)

---

## 1. Authentication

### POST `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response: 200 OK**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PLAYER"
  }
}
```

**Errors:**
- `401 Unauthorized` — Invalid credentials

---

### POST `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+34612345678",
  "role": "PLAYER"
}
```

**Response: 201 Created**
```json
{
  "id": "usr_456",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "PLAYER",
  "createdAt": "2026-03-16T10:00:00Z"
}
```

**Errors:**
- `400 Bad Request` — Validation failed or email already exists

---

### POST `/auth/refresh`

Refresh JWT token before expiration.

**Request Body:**
```json
{
  "refreshToken": "old_token_here"
}
```

**Response: 200 OK**
```json
{
  "token": "new_jwt_token_here",
  "expiresIn": 1800
}
```

**Errors:**
- `401 Unauthorized` — Invalid or expired refresh token

---

### POST `/auth/logout`

Invalidate user session.

**Headers:** `Authorization: Bearer <token>`

**Response: 204 No Content**

---

## 2. Users

### GET `/users/:id`

Retrieve user profile by ID.

**Headers:** `Authorization: Bearer <token>`

**Response: 200 OK**
```json
{
  "id": "usr_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+34612345678",
  "role": "PLAYER",
  "isActive": true,
  "createdAt": "2025-01-10T12:00:00Z"
}
```

**Errors:**
- `404 Not Found` — User not found
- `403 Forbidden` — Insufficient permissions

---

### PUT `/users/:id`

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+34699887766"
}
```

**Response: 200 OK**
```json
{
  "id": "usr_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+34699887766",
  "role": "PLAYER",
  "updatedAt": "2026-03-16T11:00:00Z"
}
```

**Errors:**
- `404 Not Found` — User not found
- `400 Bad Request` — Validation failed

---

### GET `/users`

List all users (admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role` (optional): Filter by role (SYSTEM_ADMIN, TOURNAMENT_ADMIN, REFEREE, PLAYER, SPECTATOR)
- `isActive` (optional): Filter by active status (true/false)

**Response: 200 OK**
```json
[
  {
    "id": "usr_123",
    "email": "user1@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PLAYER"
  },
  {
    "id": "usr_456",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "SYSTEM_ADMIN"
  }
]
```

---

## 3. Tournaments

### POST `/tournaments`

Create a new tournament.

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** TOURNAMENT_ADMIN or higher

**Request Body:**
```json
{
  "name": "Spring Open 2026",
  "location": "Tennis Club Madrid",
  "surface": "CLAY",
  "startDate": "2026-04-01",
  "endDate": "2026-04-07",
  "registrationDeadline": "2026-03-25",
  "maxParticipants": 64,
  "description": "Annual spring tournament for all levels"
}
```

**Response: 201 Created**
```json
{
  "id": "trn_789",
  "name": "Spring Open 2026",
  "location": "Tennis Club Madrid",
  "surface": "CLAY",
  "status": "DRAFT",
  "startDate": "2026-04-01",
  "endDate": "2026-04-07",
  "createdAt": "2026-03-16T10:00:00Z"
}
```

---

### GET `/tournaments/:id`

Get tournament details.

**Response: 200 OK**
```json
{
  "id": "trn_789",
  "name": "Spring Open 2026",
  "location": "Tennis Club Madrid",
  "surface": "CLAY",
  "status": "REGISTRATION_OPEN",
  "startDate": "2026-04-01",
  "endDate": "2026-04-07",
  "registrationDeadline": "2026-03-25",
  "maxParticipants": 64,
  "currentParticipants": 42,
  "description": "Annual spring tournament for all levels"
}
```

---

### GET `/tournaments`

List all tournaments.

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, REGISTRATION_OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
- `surface` (optional): Filter by surface type
- `location` (optional): Search by location name

**Response: 200 OK**
```json
[
  {
    "id": "trn_789",
    "name": "Spring Open 2026",
    "location": "Tennis Club Madrid",
    "surface": "CLAY",
    "status": "REGISTRATION_OPEN",
    "startDate": "2026-04-01",
    "endDate": "2026-04-07"
  }
]
```

---

### PUT `/tournaments/:id`

Update tournament details.

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** TOURNAMENT_ADMIN or higher

**Request Body:** (Same as POST, all fields optional)

**Response: 200 OK**
```json
{
  "id": "trn_789",
  "name": "Spring Open 2026 - Updated",
  "location": "Tennis Club Madrid",
  "surface": "CLAY",
  "status": "REGISTRATION_OPEN",
  "updatedAt": "2026-03-16T12:00:00Z"
}
```

---

### DELETE `/tournaments/:id`

Delete a tournament.

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** SYSTEM_ADMIN

**Response: 204 No Content**

**Errors:**
- `403 Forbidden` — Cannot delete tournament with enrolled participants
- `404 Not Found` — Tournament not found

---

## 4. Categories

### GET `/categories?tournamentId=:tournamentId`

List categories for a tournament.

**Response: 200 OK**
```json
[
  {
    "id": "cat_001",
    "tournamentId": "trn_789",
    "name": "Men's Singles",
    "gender": "MALE",
    "ageGroup": "ADULT",
    "maxParticipants": 32
  },
  {
    "id": "cat_002",
    "tournamentId": "trn_789",
    "name": "Women's Singles",
    "gender": "FEMALE",
    "ageGroup": "ADULT",
    "maxParticipants": 32
  }
]
```

---

## 5. Courts

### GET `/courts?tournamentId=:tournamentId`

List available courts for a tournament.

**Response: 200 OK**
```json
[
  {
    "id": "crt_001",
    "name": "Court 1",
    "surface": "CLAY",
    "isAvailable": true
  },
  {
    "id": "crt_002",
    "name": "Court 2",
    "surface": "HARD",
    "isAvailable": true
  }
]
```

---

## 6. Registrations

### POST `/registrations`

Register for a tournament.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "tournamentId": "trn_789",
  "categoryId": "cat_001",
  "participantId": "usr_123",
  "acceptanceType": "DIRECT_ACCEPTANCE"
}
```

**Response: 201 Created**
```json
{
  "id": "reg_001",
  "tournamentId": "trn_789",
  "participantId": "usr_123",
  "status": "PENDING",
  "registrationDate": "2026-03-16T10:00:00Z"
}
```

---

### GET `/registrations?tournamentId=:tournamentId`

List registrations for a tournament.

**Response: 200 OK**
```json
[
  {
    "id": "reg_001",
    "participant": {
      "id": "usr_123",
      "firstName": "John",
      "lastName": "Doe"
    },
    "status": "ACCEPTED",
    "acceptanceType": "DIRECT_ACCEPTANCE",
    "registrationDate": "2026-03-15T10:00:00Z"
  }
]
```

---

### PUT `/registrations/:id/status`

Update registration status (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** TOURNAMENT_ADMIN or higher

**Request Body:**
```json
{
  "status": "ACCEPTED"
}
```

**Response: 200 OK**

---

## 7. Brackets

### POST `/brackets`

Generate a bracket for a category.

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** TOURNAMENT_ADMIN or higher

**Request Body:**
```json
{
  "tournamentId": "trn_789",
  "categoryId": "cat_001",
  "bracketType": "SINGLE_ELIMINATION"
}
```

**Response: 201 Created**
```json
{
  "id": "brk_001",
  "tournamentId": "trn_789",
  "categoryId": "cat_001",
  "bracketType": "SINGLE_ELIMINATION",
  "size": 32,
  "totalRounds": 5,
  "isPublished": false,
  "createdAt": "2026-03-16T10:00:00Z"
}
```

---

### GET `/brackets/:id`

Get bracket details.

**Response: 200 OK**
```json
{
  "id": "brk_001",
  "tournamentId": "trn_789",
  "categoryId": "cat_001",
  "bracketType": "SINGLE_ELIMINATION",
  "size": 32,
  "totalRounds": 5,
  "structure": "{...}",
  "isPublished": true
}
```

---

### GET `/brackets?tournamentId=:tournamentId`

List brackets for a tournament.

**Response: 200 OK**
```json
[
  {
    "id": "brk_001",
    "categoryId": "cat_001",
    "bracketType": "SINGLE_ELIMINATION",
    "size": 32,
    "isPublished": true
  }
]
```

---

## 8. Phases

### GET `/phases?bracketId=:bracketId`

List phases for a bracket.

**Response: 200 OK**
```json
[
  {
    "id": "phs_001",
    "bracketId": "brk_001",
    "name": "Round of 32",
    "order": 1,
    "matchCount": 16,
    "isCompleted": true
  },
  {
    "id": "phs_002",
    "bracketId": "brk_001",
    "name": "Round of 16",
    "order": 2,
    "matchCount": 8,
    "isCompleted": false
  }
]
```

---

## 9. Matches

### GET `/matches?bracketId=:bracketId`

List matches for a bracket.

**Response: 200 OK**
```json
[
  {
    "id": "mch_001",
    "bracketId": "brk_001",
    "round": 1,
    "participant1Id": "usr_123",
    "participant2Id": "usr_456",
    "status": "COMPLETED",
    "winnerId": "usr_123",
    "scheduledTime": "2026-04-01T10:00:00Z",
    "courtId": "crt_001"
  }
]
```

---

### GET `/matches/:id`

Get match details with score.

**Response: 200 OK**
```json
{
  "id": "mch_001",
  "bracketId": "brk_001",
  "round": 1,
  "participant1": {
    "id": "usr_123",
    "name": "John Doe"
  },
  "participant2": {
    "id": "usr_456",
    "name": "Jane Smith"
  },
  "status": "COMPLETED",
  "winnerId": "usr_123",
  "score": "6-4, 6-3",
  "scheduledTime": "2026-04-01T10:00:00Z",
  "courtId": "crt_001"
}
```

---

### PUT `/matches/:id/score`

Record match score.

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** REFEREE or match participant

**Request Body:**
```json
{
  "set1Player1": 6,
  "set1Player2": 4,
  "set2Player1": 6,
  "set2Player2": 3,
  "winnerId": "usr_123"
}
```

**Response: 200 OK**

---

### PUT `/matches/:id/status`

Update match status.

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** TOURNAMENT_ADMIN or REFEREE

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Response: 200 OK**

---

## 10. Scores

### GET `/scores/:matchId`

Get score details for a match.

**Response: 200 OK**
```json
{
  "id": "scr_001",
  "matchId": "mch_001",
  "set1Player1": 6,
  "set1Player2": 4,
  "set2Player1": 6,
  "set2Player2": 3,
  "formattedScore": "6-4, 6-3",
  "isConfirmed": true
}
```

---

## 11. Standings

### GET `/standings?bracketId=:bracketId`

Get standings for a bracket.

**Response: 200 OK**
```json
[
  {
    "position": 1,
    "participantId": "usr_123",
    "participantName": "John Doe",
    "wins": 5,
    "losses": 0,
    "setsWon": 10,
    "setsLost": 2,
    "gamesWon": 63,
    "gamesLost": 42
  },
  {
    "position": 2,
    "participantId": "usr_456",
    "participantName": "Jane Smith",
    "wins": 4,
    "losses": 1,
    "setsWon": 9,
    "setsLost": 3,
    "gamesWon": 58,
    "gamesLost": 45
  }
]
```

---

## 12. Global Rankings

### GET `/rankings`

Get global player rankings.

**Query Parameters:**
- `system` (optional): Ranking system (ELO, POINTS, WTN)

**Response: 200 OK**
```json
[
  {
    "position": 1,
    "participantId": "usr_123",
    "participantName": "John Doe",
    "points": 1850,
    "tournamentsPlayed": 12,
    "systemType": "ELO"
  },
  {
    "position": 2,
    "participantId": "usr_456",
    "participantName": "Jane Smith",
    "points": 1780,
    "tournamentsPlayed": 10,
    "systemType": "ELO"
  }
]
```

---

## 13. Order of Play

### GET `/order-of-play?tournamentId=:tournamentId&date=:date`

Get match schedule for a specific date.

**Query Parameters:**
- `tournamentId` (required): Tournament ID
- `date` (required): Date in ISO format (YYYY-MM-DD)

**Response: 200 OK**
```json
{
  "date": "2026-04-01",
  "matches": [
    {
      "matchId": "mch_001",
      "scheduledTime": "10:00",
      "court": "Court 1",
      "participant1": "John Doe",
      "participant2": "Jane Smith",
      "round": "Round of 16",
      "estimatedDuration": 120
    },
    {
      "matchId": "mch_002",
      "scheduledTime": "12:00",
      "court": "Court 2",
      "participant1": "Alice Brown",
      "participant2": "Bob Wilson",
      "round": "Quarterfinals",
      "estimatedDuration": 120
    }
  ]
}
```

---

## 14. Notifications

### GET `/notifications`

Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Response: 200 OK**
```json
[
  {
    "id": "ntf_001",
    "recipientId": "usr_123",
    "type": "MATCH_START",
    "title": "Match Starting Soon",
    "message": "Your match starts in 30 minutes on Court 1",
    "isRead": false,
    "createdAt": "2026-04-01T09:30:00Z"
  }
]
```

---

### PUT `/notifications/:id/read`

Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response: 200 OK**

---

## 15. Announcements

### GET `/announcements?tournamentId=:tournamentId`

Get tournament announcements.

**Response: 200 OK**
```json
[
  {
    "id": "ann_001",
    "tournamentId": "trn_789",
    "title": "Tournament Schedule Update",
    "content": "Matches on Court 3 have been moved to Court 1 due to maintenance.",
    "author": "Tournament Director",
    "isPinned": true,
    "publishedAt": "2026-03-30T14:00:00Z"
  }
]
```

---

### POST `/announcements`

Create a new announcement (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** TOURNAMENT_ADMIN or higher

**Request Body:**
```json
{
  "tournamentId": "trn_789",
  "title": "Important Update",
  "content": "Please arrive 15 minutes before your scheduled match time.",
  "isPinned": false
}
```

**Response: 201 Created**

---

## 16. Statistics

### GET `/statistics/:participantId`

Get player statistics.

**Response: 200 OK**
```json
{
  "participantId": "usr_123",
  "totalMatches": 45,
  "wins": 38,
  "losses": 7,
  "winPercentage": 84.4,
  "setsWon": 78,
  "setsLost": 25,
  "gamesWon": 612,
  "gamesLost": 445,
  "currentWinStreak": 5,
  "longestWinStreak": 12
}
```

---

## 17. Payments

### POST `/payments`

Record a payment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "registrationId": "reg_001",
  "amount": 25.00,
  "currency": "EUR",
  "paymentMethod": "CREDIT_CARD"
}
```

**Response: 201 Created**
```json
{
  "id": "pmt_001",
  "registrationId": "reg_001",
  "amount": 25.00,
  "currency": "EUR",
  "status": "COMPLETED",
  "transactionId": "txn_xyz789",
  "processedAt": "2026-03-16T10:00:00Z"
}
```

---

### GET `/payments/:id`

Get payment details.

**Headers:** `Authorization: Bearer <token>`

**Response: 200 OK**

---

## 18. Sanctions

### GET `/sanctions?participantId=:participantId`

Get sanctions for a participant.

**Response: 200 OK**
```json
[
  {
    "id": "snc_001",
    "participantId": "usr_123",
    "matchId": "mch_001",
    "type": "WARNING",
    "reason": "Unsportsmanlike conduct",
    "issuedBy": "Referee Smith",
    "issuedAt": "2026-04-01T11:00:00Z"
  }
]
```

---

### POST `/sanctions`

Issue a sanction (referee/admin only).

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** REFEREE or higher

**Request Body:**
```json
{
  "participantId": "usr_123",
  "matchId": "mch_001",
  "type": "WARNING",
  "reason": "Code violation"
}
```

**Response: 201 Created**

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Authentication Flow

1. **Login**: POST `/auth/login` with credentials → receive JWT token
2. **Use Token**: Include `Authorization: Bearer <token>` in all protected requests
3. **Refresh**: POST `/auth/refresh` before token expires (30 minutes)
4. **Logout**: POST `/auth/logout` to invalidate session

---

## Rate Limiting

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

---

## WebSocket Events

The application also supports real-time updates via WebSocket (Socket.io) on `ws://localhost:3000`:

| Event                | Description                    |
|----------------------|--------------------------------|
| `match:updated`      | Match score or status changed  |
| `order-of-play:changed` | Schedule updated            |
| `notification:new`   | New notification for user      |

Connect with JWT token in query string: `ws://localhost:3000?token=<jwt_token>`

---

## Additional Notes

- All dates are in ISO 8601 format (UTC)
- Pagination is supported via `?page=1&limit=20` query parameters where applicable
- All write operations (POST, PUT, DELETE) require authentication
- Role-based access control applies to administrative endpoints
