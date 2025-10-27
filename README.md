Prerequisites
Before starting, ensure you have these installed:

Node.js (v20 or higher)
PostgreSQL (for the database)
Git (to clone the repository) 

Step-by-Step Setup Guide
1. Clone the Repository
    Or download the project as a ZIP file and extract it to your desired location.
2. Install Dependencies
Open a terminal in the project directory and run:

npm install
This will install all required packages listed in package.json.

3. Set Up Environment Variables
Create a .env file in the project root directory:

Add the following configuration to your .env file:

# Database connection (required)
DATABASE_URL=postgresql://username:password@localhost:5432/dhlstream
# Server configuration
PORT=5000
NODE_ENV=development
# Media paths - Update these to match your local directories
MOVIES_PATH=/path/to/your/Movies
SERIES_PATH=/path/to/your/Series
# TMDB API Key (for fetching movie/series posters)
TMDB_API_KEY=your_tmdb_api_key_here
Important: Replace the paths and credentials with your actual values:

DATABASE_URL: Your PostgreSQL connection string
MOVIES_PATH: Absolute path to your movies folder
SERIES_PATH: Absolute path to your TV series folder
TMDB_API_KEY: Get a free API key from The Movie Database (TMDB)
4. Set Up the PostgreSQL Database
Option A: Using Local PostgreSQL

Install PostgreSQL on your machine
Create a new database:
createdb dhlstream
Use the connection string in your .env:
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/dhlstream
Option B: Using Neon Database (Free Cloud PostgreSQL)

Go to Neon Database and create a free account
Create a new project
Copy the connection string and add it to your .env file
5. Run Database Migrations
Once your database is configured, run:

npm run db:push
This will create all necessary tables in your database.
6. Organize Your Media Files
Create or organize your media directories according to the paths you set in .env:

Movies Structure:

/your/movies/path/
├── Movie Name (2023).mp4
├── Another Movie (2022).mkv
└── Movie with Subtitles.mp4
    └── Movie with Subtitles.srt  (optional subtitle file)
Series Structure:

/your/series/path/
├── Series Name/
│   ├── Season 1/
│   │   ├── Episode 1.mp4
│   │   └── Episode 2.mp4
│   └── Season 2/
│       └── Episode 1.mp4
Supported video formats: .mp4, .mkv, .avi, .webm
Supported subtitle formats: .srt, .vtt

7. Get TMDB API Key (For Movie Posters)
Visit The Movie Database
Create a free account
Go to Settings → API → Create → Developer
Fill in the required information
Copy your API Key (v3 auth) and add it to your .env file
8. Start the Application
Run the development server:

npm run dev
You should see output like:

serving on port 5000
9. Access the Application
Open your browser and navigate to:

http://localhost:5000

#To access movies and series
10. Create Your Account
Click "Sign Up" on the login page
Enter a username and password
Click "Sign Up" to create your account
Log in with your credentials