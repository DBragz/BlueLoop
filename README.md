# BlueLoop

A TikTok-style video sharing platform built on Bluesky's AT Protocol, allowing users to share and discover short-form videos while leveraging the decentralized social network capabilities of the AT Protocol.

## Features

- 🔐 Authentication with Bluesky credentials
- 📱 TikTok-style vertical video feed
- ♾️ Infinite scroll for continuous content discovery
- 🎥 Video upload functionality
- 👤 User profiles
- 💫 Smooth animations and transitions
- 🌙 Dark mode support

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20.x or later)
- PostgreSQL (v15.x or later)
- npm (v10.x or later)

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DBragz/BlueLoop.git
   cd BlueLoop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables by creating a `.env` file:
   ```env
   # Required: PostgreSQL Database URL
   DATABASE_URL=postgresql://username:password@localhost:5432/blueloop

   # Optional: Server port (defaults to 5000)
   PORT=5000
   ```

4. Create and initialize the database:
   ```bash
   # Create database in PostgreSQL
   createdb blueloop

   # Push the schema to the database
   npm run db:push
   ```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will:
- Start the Express server
- Initialize Vite's development server with HMR
- Watch for file changes
- Log detailed startup metrics

The application will be available at `http://localhost:5000`.

## Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Development Guidelines

- Backend routes are in `server/routes.ts`
- Frontend React components are in `client/src/components`
- Database schema is defined in `shared/schema.ts`
- New pages should be added to `client/src/pages`
- Use shadcn's components from `@/components/ui`

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules`
   - Reinstall dependencies: `npm install`
   - Verify Node.js version

3. **Video Upload Issues**
   - Check file size (max 50MB)
   - Verify supported formats (MP4 recommended)
   - Check browser console for errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Authors

- [Daniel Ribeirinha-Braga](https://github.com/DBragz)
- [Editor](https://github.com/replit) - AI Code Assistant

## License

MIT