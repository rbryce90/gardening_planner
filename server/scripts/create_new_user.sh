echo creating new user 

curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Azura",
    "lastName": "bond",
    "email": "AzuraBond@example.com",
    "password": "password"
  }'

echo \\n
