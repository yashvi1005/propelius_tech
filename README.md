

backend setup

 Navigate to the backend directory:
   cd backend


  Install dependencies:
   npm install

 Create a `.env` file in the backend directory:
   PORT=define-port-here
   MONGODB_URI=mongodb://localhost:27017/music-playlist-app
   JWT_SECRET=jwt-secret
   SPOTIFY_CLIENT_ID=spotify-client-id
   SPOTIFY_CLIENT_SECRET=spotify-client-secret
   

 Start the development server:
   npm run dev


Frontend setup

 Navigate to the client directory:
   cd frontend

 Install dependencies:
   npm install

Create a `.env` file in the frontend directory:
  REACT_APP_API_URI = http://localhost:5000/api

 Start the development server:
   npm start

API endpoints

Authentication
 `POST /api/auth/signup` - Create new account
 `POST /api/auth/signin` - Sign in to account

 `GET /api/collections` - Get user's collections
 `POST /api/collections` - Create new collection
 `GET /api/collections/:id` - Get specific collection
 `PUT /api/collections/:id` - Update collection
 `DELETE /api/collections/:id` - Delete collection


 `GET /api/search?q=query` - Search tracks on Spotify
 `POST /api/collections/:id/tracks` - Add track to collection
 `DELETE /api/collections/:id/tracks/:trackId` - Remove track from collection


Technology Stack

for fronend
 React
 TypeScript
 Material-UI
 React Router
 React Hook Form
 Zod 
 Axios

for backend
 Node.js
 Express.js
 TypeScript
 MongoDB with Mongoose
 JWT authentication
 Spotify Web API
 bcrypt for password hashing
