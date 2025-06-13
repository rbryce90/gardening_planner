# echo \\n
# echo "Wrong Password: "
# curl -X POST http://localhost:8000/api/auth/login\
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "bryce@example.com",
#     "password": "wrongpassword"
#   }'

# echo \\n

# echo "Wrong email: "
# curl -X POST http://localhost:8000/api/auth/login\
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "bryce2@example.com",
#     "password": "wrongpassword"
#   }'

# echo \\n
# echo "Right password: "
# curl -X POST http://localhost:8000/api/auth/login\
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "bryce@example.com",
#     "password": "password"
#   }' \
#   -c ./cookies.txt

# SESSION_ID=$(curl -s -X POST http://localhost:8000/api/auth/login \
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "bryce@example.com",
#     "password": "password"
#   }' | grep -o '"sessionId":"[^"]*' )
# echo hello
# echo $SESSION_ID
echo \\n
# Login and store session ID (assuming it's returned in JSON body as `sessionId`)
#!/bin/bash

# Step 1: Login and save cookies to a file
echo Logging in: 
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bryce@example.com",
    "password": "password"
  }' \
  -c cookies.txt
echo \\n
SESSION_ID=$(cat cookies.txt | grep session_id | awk '{print $NF}')

# # Check if SESSION_ID is empty
if [ -z "$SESSION_ID" ]; then
  echo "Session ID not found in cookies."
else
  echo "Extracted Session ID: $SESSION_ID"
fi

echo \\n
echo check endpoint after log in: 
curl -X GET http://localhost:8000/api/users \
   --cookie "session_id=$SESSION_ID"

echo \\n
echo logging out: 
curl -X POST http://localhost:8000/api/auth/logout \
   --cookie "session_id=$SESSION_ID"

echo \\n
echo "session id: $SESSION_ID should be deleted"

echo \\n
echo checking session id after log out
curl -X GET http://localhost:8000/api/users \
   --cookie "session_id=$SESSION_ID"

echo \\n