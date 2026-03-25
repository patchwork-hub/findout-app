# Calendar API Integration Spec (LAUTI / Eintopf)

## Base URL

- `https://eintopf.info`
- API prefix: `/api/v1`
- Mobile env override (optional): `LAUTI_BASE_URL`

## Screen Mapping

1. Dates (Upcoming List)
- Endpoint: `GET /api/v1/eventsearch`
- Default params:
  - `page=0`
  - `pageSize=20`
  - `sort=start`
  - `sortAscending=true`
- Notes:
  - Use this endpoint as the primary source for app list because response includes richer nested objects.
  - RSVP/Register action should call custom CSID backend endpoint (not provided by LAUTI API).

2. Event Details (In-Person / Virtual)
- Endpoint: `GET /api/v1/events/{uuid}`
- iCal download: `GET /events/{uuid}/ical` (web route)
- Image URL pattern: `/api/v1/media/{event.image}`
- Notes:
  - "Book Tickets" is external link or custom CSID backend flow.

3. Organisers List
- Endpoint: `GET /api/v1/groups/?limit=20&offset=0`
- Image URL pattern: `/api/v1/media/{group.image}`

4. Organiser Details
- Endpoint: `GET /api/v1/groups/{uuid}`
- Group events section:
  - Endpoint: `GET /api/v1/eventsearch`
  - Requirement: apply organizer filter by group id in event organizers array.
  - Open item: exact filter payload format to confirm with backend.

5. Places / Map
- Places: `GET /api/v1/places/?limit=500&offset=0`
- Event pins: `GET /api/v1/eventsearch?page=0&pageSize=100`
- Notes:
  - `places` gives static place markers.
  - `eventsearch` gives event-level location (`lat`, `lng`) for event pins.

## Supporting Endpoints

- Categories:
  - `GET /api/v1/categories/`
  - `GET /api/v1/categories/{uuid}`
- Topics:
  - `GET /api/v1/topics/`
  - `GET /api/v1/topics/{uuid}`
- Media:
  - `GET /api/v1/media/{hash}`

## Pagination Strategy

- `eventsearch` uses page-based pagination (`page`, `pageSize`).
- `groups` and `places` use offset pagination (`limit`, `offset`).

## Current Implementation Scope

- Implemented now:
  - `Calendar > Dates` uses `GET /api/v1/eventsearch` with infinite scroll.
- Deferred:
  - Organisers tab
  - Map tab
  - Event detail screen + iCal action
  - Register/RSVP backend integration
