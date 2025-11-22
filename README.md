# Movie Recommendation System

An intelligent movie recommendation application based on user emotions and moods, using AI to analyze and suggest suitable movies.

**Live Demo**: [https://north2south-tech.lecambang.id.vn/](https://north2south-tech.lecambang.id.vn/)

## Key Features

-  **Emotion Analysis**: Uses AI (CLOVA) to analyze mood and suggest appropriate movies
-  **Speech-to-Text**: Converts voice to text for emotion input
-  **Personalized Recommendations**: Based on viewing history and user preferences
-  **Party Mode**: Analyzes group mood and suggests movies for multiple people
-  **Character Matching**: Finds movie characters that match user personality
-  **Movie Management**: Save favorite movies, view history
-  **Search & Filter**: Search movies by multiple criteria (year, genre, rating, etc.)

##  Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Hooks
- **Deployment**: Nginx (Docker)

### Backend
- **Framework**: NestJS 11 (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **AI Services**:
  - CLOVA AI (mood analysis, embeddings)
  - CLOVA Speech-to-Text
- **Authentication**: JWT (JOSE)
- **Deployment**: Docker


### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: Supabase (PostgreSQL with vector search)
- **API**: RESTful API

## Project Structure
```aiignore
Movie-Recommendation/
├── client/ # React Frontend
│ ├── src/
│ │ ├── features/ # Feature modules
│ │ │ ├── auth/ # Authentication
│ │ │ ├── emotion/ # Emotion analysis UI
│ │ │ └── movie/ # Movie browsing
│ │ ├── components/ # Shared components
│ │ └── lib/ # Utilities
│ └── Dockerfile
├── server/ # NestJS Backend
│ ├── src/
│ │ ├── ai/ # AI services (mood analysis, STT)
│ │ ├── auth/ # Authentication
│ │ ├── movie/ # Movie CRUD
│ │ ├── recommendation/# Recommendation engine
│ │ ├── user/ # User management
│ │ ├── common/ # Shared modules (AI, Supabase, JWT)
│ │ └── main.ts
│ ├── supabase/ # Database migrations & seeds
│ └── Dockerfile
└── docker-compose.yml # Docker orchestration
```

## Installation and Setup

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose (for production)
- Supabase account
- CLOVA API keys (Naver Cloud Platform)

### Method 1: Docker Compose (Recommended)

#### 1. Clone repository

```bash
git clone https://github.com/Vu-Quoc-Tuan/Movie-Recommendation
cd Movie-Recommendation
```

#### 2. Create `.env` file

Create a `.env` file in the root directory with the following content:

```env
# Supabase Configuration
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PUBLIC_ANON_KEY=your_anon_key

# AI Services
CLOVA_API_KEY=your_clova_api_key
CLOVA_CLIENT_ID=your_clova_client_id
CLOVA_STT_SECRET=your_clova_stt_secret

# Optional: TMDB API (for movie data)
TMDB_API_KEY=your_tmdb_api_key
```

#### 3. Run with Docker Compose

```bash
# Build and run containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

After successful startup:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/make-server/health

### Method 2: Development Mode (Manual)

#### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env.local file (optional, if not using Docker)
echo "VITE_API_URL=http://localhost:8000" > .env.local
echo "VITE_SUPABASE_PROJECT_ID=your_project_id" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=your_anon_key" >> .env.local

# Run development server
npm run dev
```

Frontend will run at: http://localhost:3000


#### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Run database migrations
cd supabase
npm install
npm run migrate

# Seed data (optional)
npm run seed

# Run development server
cd ..
npm run start:dev
```

Backend will run at: http://localhost:8000

## API Endpoints

### Authentication
- `POST /make-server/auth/register` - Register
- `POST /make-server/auth/login` - Login

### Movies
- `GET /make-server/movies` - Get movie list (with filters, search, pagination)
- `GET /make-server/movies/:id` - Get movie details

### AI & Recommendations
- `POST /make-server/analyze-emotional-journey` - Analyze emotional journey
- `POST /make-server/analyze-party-mood` - Analyze group mood
- `POST /make-server/analyze-character-match` - Find matching character
- `POST /make-server/stt` - Speech-to-Text (file upload)

### Recommendations
- `POST /make-server/recommend/personal` - Personal recommendations (requires auth)
- `GET /make-server/recommend/random` - Random recommendations

### User
- `GET /make-server/user/profile` - Get profile (requires auth)
- `POST /make-server/user/save` - Save movie (requires auth)
- `GET /make-server/user/saved` - Get saved movies list (requires auth)
- `POST /make-server/user/history` - Add to history (requires auth)
- `GET /make-server/user/history` - Get history (requires auth)

### Health Check
- `GET /make-server/health` - Health check endpoint

## Configuration

### Environment Variables

#### Frontend (.env.local)
```env
VITE_API_URL=/api
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_ANON_KEY=...
```


#### Backend (.env)
```env
NODE_ENV=production
PORT=8000
SUPABASE_PROJECT_ID=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PUBLIC_ANON_KEY=...
CLOVA_API_KEY=...
CLOVA_CLIENT_ID=...
CLOVA_STT_SECRET=...
TMDB_API_KEY=...
```

### Database Setup

1. Create a Supabase project
2. Run migrations:
```bash
cd server/supabase
npm run migrate
```
3. Seed data (optional):
```bash
npm run seed
```

## Docker Commands

```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f server
docker-compose logs -f client

# Rebuild a service
docker-compose build server
docker-compose up -d server

# View status
docker-compose ps

# Stop and remove containers
docker-compose down

# Stop and remove volumes (delete data)
docker-compose down -v
```


## Production Build


### Frontend
```bash
cd client
npm run build
# Output: client/build/
```

### Backend
```bash
cd server
npm run build
npm run start:prod
```


## Deployment

### With Docker Compose

1. Configure `.env` with production values
2. Build and deploy:
```bash
docker-compose up -d --build
```

### Manual Deployment

1. Build backend:
```bash
cd server
npm run build
```

2. Build frontend:
```bash
cd client
npm run build
```

3. Deploy:
  - Backend: Run `node dist/src/main.js` on server
  - Frontend: Serve `build/` folder with Nginx or CDN


## Authors

- North2South-Tech Team

## Acknowledgments

- CLOVA AI (Naver Cloud Platform) for AI services
- Supabase for database and authentication
- TMDB for movie data
- All open-source contributors

