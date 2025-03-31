# Postman API Documentation
## Base URL
http://localhost:5000/api
## Endpoints
**Register:** 
- POST /register
- Request Body (form-data)
  |key|Type|
  |-----|-------|
  |profilePicture|File|
  |email|Text|
  |name|Text|
  |password|Text|
  |address[addressLine1]|Text|
  |address[addressLine2]|Text|
  |address[city]|Text|
  |address[district]|Text|
  |address[state]|Text|
  |email[pin]|Text|
  

**Login:**
- POST /login
```JSON
{
  "email":"youremail",
  "password":"yourpassword"
}
```
**Logout:**
- GET /logout

**Get User Details:**
- GET /me

**Update User Details:**
- PUT /me/update
- Request Body (form-data)
  |key|Type|
  |-----|-------|
  |profilePicture|File|
  |email|Text|
  |name|Text|
  |password|Text|
  |address[addressLine1]|Text|
  |address[addressLine2]|Text|
  |address[city]|Text|
  |address[district]|Text|
  |address[state]|Text|
  |email[pin]|Text|
provide any field you want to change

**Forgot Password:** 
- POST /password/forgot
- Request body (JSON)
```JSON
{
  "email":""
}
```
Password Reset Link will be sent to the email

**Reset Password:** 
- PUT /password/reset/:token
- Request Body (JSON)
```JSON
{
  "newPassword":""
}
```

**Delete User:**
- DELETE /me/delete

