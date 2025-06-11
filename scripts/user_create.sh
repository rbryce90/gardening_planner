curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "bryce",
    "lastName": "bond",
    "email": "bryce4@example.com",
    "password": "password", 
    "phoneNumber": "409-338-7520"
  }'

echo \\n



