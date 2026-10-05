# QuickNotes API Design

This contract describes the production QuickNotes service. It is separate from the JSONPlaceholder endpoints used by the browser practice client.

## Conventions

- Base URL: `https://api.quicknotes.example/v1`
- Requests and responses use JSON with `Content-Type: application/json` unless a response has no body.
- Protected routes require `Authorization: Bearer <access-token>` and are scoped to the authenticated user. Clients cannot choose another user's `userId`.
- Timestamps are UTC ISO 8601 strings. Note and tag IDs are UUIDs.
- List endpoints use cursor pagination with `limit` (default 20, maximum 100) and an opaque `cursor`.

## Endpoints

| Method | Path | Description | Success |
| --- | --- | --- | --- |
| `POST` | `/v1/auth/sessions` | Authenticate with email and password and issue an access token. | `201 Created` |
| `DELETE` | `/v1/auth/sessions/current` | Revoke the current refresh-token session. | `204 No Content` |
| `GET` | `/v1/notes` | List the signed-in user's active notes; supports `limit`, `cursor`, `q`, and `tagId`. | `200 OK` |
| `POST` | `/v1/notes` | Create a note and optionally associate existing tags. | `201 Created` |
| `GET` | `/v1/notes/{noteId}` | Read one active note owned by the signed-in user. | `200 OK` |
| `PATCH` | `/v1/notes/{noteId}` | Update supplied note fields and/or replace tag associations. | `200 OK` |
| `DELETE` | `/v1/notes/{noteId}` | Soft-delete an owned note. | `204 No Content` |
| `GET` | `/v1/tags` | List the signed-in user's tags. | `200 OK` |
| `POST` | `/v1/tags` | Create a tag for the signed-in user. | `201 Created` |

## Create a note

`POST /v1/notes`

Request:

```json
{
  "title": "Plan the launch",
  "body": "Review the checklist with the team.",
  "tagIds": ["0c5a5d20-29b9-4e23-b611-f95c5c9df3c4"]
}
```

Response (`201 Created`):

```json
{
  "data": {
    "id": "e88c164b-e412-4fc5-b1cc-8dbdbff6de17",
    "title": "Plan the launch",
    "body": "Review the checklist with the team.",
    "tags": [
      { "id": "0c5a5d20-29b9-4e23-b611-f95c5c9df3c4", "name": "work" }
    ],
    "createdAt": "2026-10-05T14:30:00Z",
    "updatedAt": "2026-10-05T14:30:00Z"
  }
}
```

The title is required, trimmed, non-empty, and at most 100 characters. The body is optional. `tagIds` is optional; every referenced tag must belong to the authenticated user. The server supplies the owner and timestamps.

## List notes

`GET /v1/notes?limit=2&cursor=eyJjcmVhdGVkQXQiOiIyMDI2LTEwLTA1In0`

Response (`200 OK`):

```json
{
  "data": [
    {
      "id": "e88c164b-e412-4fc5-b1cc-8dbdbff6de17",
      "title": "Plan the launch",
      "body": "Review the checklist with the team.",
      "tags": [{ "id": "0c5a5d20-29b9-4e23-b611-f95c5c9df3c4", "name": "work" }],
      "createdAt": "2026-10-05T14:30:00Z",
      "updatedAt": "2026-10-05T14:30:00Z"
    },
    {
      "id": "c97f7f53-71df-41bb-9d94-cab781b2e70b",
      "title": "Pick up groceries",
      "body": "Oats, tomatoes, and coffee.",
      "tags": [],
      "createdAt": "2026-10-04T09:10:00Z",
      "updatedAt": "2026-10-04T09:10:00Z"
    }
  ],
  "page": {
    "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTEwLTA0In0",
    "hasMore": true
  }
}
```

Notes are sorted by `createdAt` descending, then `id` descending for stable pagination. Search and tag filters are combined with AND semantics.

## Errors

Errors use `application/problem+json` and never expose stack traces or database details.

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Malformed JSON, invalid query parameter, or invalid path identifier. |
| `401 Unauthorized` | Missing, expired, or invalid access token. |
| `403 Forbidden` | Authenticated user lacks permission for the requested operation. |
| `404 Not Found` | Resource does not exist or is not visible to this user. |
| `409 Conflict` | A unique value, such as a tag name for this user, already exists. |
| `422 Unprocessable Content` | Well-formed input violates a field or business rule. |
| `429 Too Many Requests` | Rate limit exceeded; includes a `Retry-After` header. |
| `500 Internal Server Error` | Unexpected server failure. |
| `503 Service Unavailable` | A required dependency is temporarily unavailable. |

Example (`404 Not Found`):

```json
{
  "type": "https://api.quicknotes.example/problems/not-found",
  "title": "Note not found",
  "status": 404,
  "detail": "The requested note does not exist or is unavailable.",
  "requestId": "req_01J9W9QJ8XJQ4F3M6K2H"
}
```