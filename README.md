# Travel Advisor

Travel Advisor is a full-stack web application that leverages the power of OpenAI's ChatGPT and Foursquare's API to offer a unique travel experience.  Users can discover popular tourist spots tailored to their interests, create and manage detailed travel plans, and maintain a list of favorite spots. The application features an intuitive user interface for spot discovery based on user preferences, dynamic travel planning aided by AI, user authentication, and profile management.

<p align="center">
  <img src="[https://raw.githubusercontent.com/username/travel-advisor/main/image1.JPG](https://github.com/xiaoxinc97/travel-advisor/blob/367f0a573c5686a55c615fedf2230d96445440c7/image1.JPG)" width="45%" />
  <img src="[https://raw.githubusercontent.com/username/travel-advisor/main/image2.JPG](https://github.com/xiaoxinc97/travel-advisor/blob/367f0a573c5686a55c615fedf2230d96445440c7/image2.JPG)" width="45%" /> 
</p>




## Hosting app online

- Here is a link that travel advisor host
- [http://traveladvisor-2023.s3-website.us-east-2.amazonaws.com](http://traveladvisor-2023.s3-website.us-east-2.amazonaws.com)

## Getting Started

These instructions will guide you through setting up the project on your local machine for development and testing purposes.

### Prerequisites

- Node.js and npm
- MongoDB
- An API key for OpenAI (for chatGPT functionalities)
- An API key for Foursquare (for spot details)

### Installation

#### Backend

1. Navigate to the backend directory `travel-advisor-backend`

2. Install dependencies:
   ```sh
   npm install
   ```
3. Set environment variables in a .env file in the root of the backend directory:
    ```sh
    OpenAI_API_KEY=your-openai-api-key
    FSQ_API_KEY=your-foursquare-api-key
    MONGO_URI=your-mongodb-altas-url
    JWT_SECRET=your-jwt-secret
    ```
4. Start each microservice:
    ```sh
    node main.js
    ```

#### Frontend
1. Navigate to the frontend directory `travel-advisor-frontend`

2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend application:
    ```sh
    npm start
    ```
4. Open a web browser and navigate to http://localhost:3000 to view the application.

## Features

### Frontend
- User Authentication (Sign in/Sign up)
- Spot Discovery
- Travel Planning
- User Profile Management

### Backend
- User Account Management
- Spot Discovery and Information Retrieval
- Travel Plan Creation and Management
