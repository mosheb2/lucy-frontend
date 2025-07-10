# Lucy Sounds Frontend

This is the frontend application for Lucy Sounds, a platform for musicians and music creators.

## Technologies Used

- React
- Vite
- TailwindCSS
- Shadcn UI
- React Router DOM
- Supabase for authentication

## Getting Started

### Prerequisites

- Node.js (v20.x or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mosheb2/lucy-frontend.git
cd lucy-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_api_url
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The application is deployed on Heroku at: https://lucy-frontend-de5a2f0c56c0.herokuapp.com/

### Heroku Deployment

To deploy to Heroku:

1. Ensure you have the Heroku CLI installed and are logged in
2. Add the Heroku remote:
```bash
heroku git:remote -a lucy-frontend
```
3. Push to Heroku:
```bash
git push heroku main
```

## Features

- User authentication and profile management
- Music track and release management
- Social features for musicians
- Analytics dashboard
- Web3 integration for NFT drops

## License

This project is proprietary and confidential. 