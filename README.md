# Steps to run this project

1. Run `npm i` command
2. Clone the `.env.example` file into .env and fill the environment variables
3. Run `npm run dev:start` command


# Endpoints to test

# Deployed API => https://bitespeed-f833.onrender.com 

1. Health check endpoint
    - Method: GET
    - URL: /health-check
    - Description: This endpoint is used to check the health of the application
    - Example: http://localhost:3000/health-check
    - Example: https://bitespeed-f833.onrender.com/health-check

2. Save Contacts
    - Method: POST
    - URL: /identify
    - Description: This endpoint is used to save contacts
    - Example: http://localhost:3000/contacts
    - Example: https://bitespeed-f833.onrender.com/contacts
    - Request Body:
        ```json
        {
            "email":"george@hillvalley.edu",
            "phoneNumber": "717171"
        }
        ```
    - Response:
        ```json
        {
            
            "message": "Custom message",
            "contact":{
                "primaryContatctId": "number",
                "emails": "string[]", // first element being email of primary contact 
                "phoneNumbers": "string[]", // first element being phoneNumber of primary contact
                "secondaryContactIds": "number[]" // Array of all Contact IDs that are "secondary" to the primary contact
            }
        }
        ```


