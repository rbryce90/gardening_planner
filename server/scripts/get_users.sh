SESSION_ID=585c1b6e-ecfe-458a-b400-c64896731d6b

curl -X GET http://localhost:8000/api/users \
   --cookie "session_id=$SESSION_ID"