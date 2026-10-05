# QuickNotes System Design

QuickNotes System Design pairs a small browser API client with backend design documents for a notes service planned to support one million registered users. The client uses JSONPlaceholder as a practice API; the design documents describe the production QuickNotes API and PostgreSQL-backed architecture.

## Run the API client

From this repository directory, start a local static web server:

```sh
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser. Use **Load notes** to fetch ten sample posts, submit the form to create a sample post, and use a note's **Delete** button to send a DELETE request. The page needs an internet connection to reach JSONPlaceholder. That practice API simulates POST and DELETE responses but does not persist those changes; refresh restores its original sample data.

## Design documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- A reusable request helper can centralize HTTP error handling, while each user action owns its loading, success, and error feedback.
- A relational schema makes ownership, note-tag relationships, and transactional updates explicit through keys and constraints.
- Capacity estimates need stated assumptions; peak traffic, replica lag, cache invalidation, and failure recovery affect the design as much as average request volume.
- A transactional outbox keeps asynchronous work connected to committed database changes without making the user wait for downstream processing.