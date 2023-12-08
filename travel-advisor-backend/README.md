# Travel Advisor Backend

## Models

- `plan.js`: Defines the `TravelPlan` Mongoose schema and model for travel plans, including details like time cost, start point, spots, and the creation date.
- `spot.js`: Sets up the `Spot` Mongoose schema and model for tourist spots, encompassing attributes such as name, description, address, city, hours, rating, price, photos, tips, and website.
- `user.js`: Manages the `User` schema and model, containing fields like username, creation date, TOTP secret, favorite spots, and travel plans. It also defines the `TempUser` schema for handling temporary user data during the registration process and includes a function to clean up unverified users.


## Services

### Spot Discovery Microservice (`spotDiscoveryService.js`):

#### API Endpoints:

- `GET /popularSpotIn/:cityName/:preference?`: Uses ChatGPT API to determine if a location is a city and, if so, returns the names of popular tourist spots in that city based on user preference.
- `GET /spotInfo`: Fetches detailed information of a tourist spot based on its name and city using Foursquare API.
- `GET /spotDetails`: Retrieves detailed information of a spot from the database using its ID.

### Travel Plan Microservice (`travelPlanningService.js`):

#### API Endpoints:

- `GET /plans/:planId`: Retrieves a specific travel plan by its ID.
- `POST /plans`: Stores a new travel plan in the database.
- `DELETE /plans/:planId`: Deletes a specific travel plan by its ID.
- `POST /plans/createTravelGuide`: Generates a travel guide based on given travel parameters using ChatGPT.

### User Account Microservice (`userService.js`):

#### API Endpoints:

- `POST /users/register`: Registers a new user, generates and sends back a TOTP secret and QR code.
- `POST /users/validate-otp`: Validates OTP and completes user registration.
- `POST /users/login`: Sign in a user by validating username and TOTP secret.
- `GET /users/:userId`: Retrieves user data.
- `PUT /users/:userId/travelPlans`: Updates the user's travel plan list.
- `PUT /users/:userId/favoriteSpots`: Updates the user's list of favorite spots.
- `POST /users/refresh-token`: Re-issues a new token with a new expiration time for user authentication.


