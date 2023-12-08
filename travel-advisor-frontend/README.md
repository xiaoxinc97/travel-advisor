# Travel Advisor Frontend - File Descriptions

## spotDiscovery

- `SpotDiscovery.js`: Main component for exploring travel spots. Allows users to search and view popular spots based on location and preferences.
- `SpotCard.js`: Displays information about individual travel spots, including images, ratings, and descriptions. Allow user to add the spot to their favorite spots.

## travelPlanning

- `TravelPlanning.js`: Central component for managing travel plans. It interfaces with creating, viewing, and editing travel plans.
- `CreateTravelPlan.js`: Provides a form for users to create new travel plans, including setting departure and dates, selecting favorite spots and fetching travel plan from chatGPT.
- `FavoriteSpots.js`: Lists the user's favorite spots.
- `SpotPopover.js`: Offers detailed information about a spot in a popover format.
- `TravelPlanDetails.js`: Shows detailed information about a specific travel plan.
- `TravelPlanList.js`: Displays a list of all travel plans created by the user, with functionalities to view or delete them.

## user

- `SignInModal.js`: Modal component that handles user sign-in, including form inputs and validation.
- `SignUpModal.js`: Handles new user registrations, providing form inputs for username and OTP, and QR code for authentication.
- `UserProfile.js`: Displays user's profile information, favorite spots, and enable user to edit favorite spots.
- `authService.js`: Used for token refresh.

## context

- `userContext.js`: Defines the React Context for managing global user data, including authentication state and user data.


