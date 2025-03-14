# BlueLoop

A TikTok-style video sharing platform leveraging the AT Protocol for decentralized social media interactions, with advanced video processing capabilities.

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

## Docker Development Setup

To run the application in a Docker development environment:

1. Make sure you have Docker and Docker Compose installed on your system.

2. Clone the repository:
   ```bash
   git clone https://github.com/DBragz/BlueLoop.git
   cd BlueLoop
   ```

3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

4. The application will be available at:
   - Frontend: http://localhost:5000
   - Database: PostgreSQL running on localhost:5432

5. To stop the containers:
   ```bash
   docker-compose down
   ```

6. To view logs:
   ```bash
   docker-compose logs -f
   ```

### Database Management

- Connect to the database:
  ```bash
  docker-compose exec db psql -U postgres -d blueloop
  ```

- Reset the database:
  ```bash
  docker-compose down -v  # This will remove the volume
  docker-compose up      # This will recreate everything
  ```

### Development Notes

- The application code is mounted as a volume, so changes will reflect immediately
- Node modules are in a separate volume to prevent overwriting the container's modules
- Hot reloading is enabled for development


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

## Production Deployment

### Prerequisites for Production
1. A PostgreSQL database instance
   - We recommend using managed services like Neon for better scalability
   - Minimum 2GB RAM, 10GB storage recommended
   - Enable connection pooling for better performance
   - Configure automatic backups
   - Set up read replicas for high-traffic scenarios

2. Environment Configuration
   ```env
   # Required
   DATABASE_URL=your_production_db_url
   NODE_ENV=production
   PORT=5000

   # Optional but recommended
   PGHOST=your_db_host
   PGPORT=5432
   PGUSER=your_db_user
   PGPASSWORD=your_db_password
   PGDATABASE=your_db_name
   ```

### Security Best Practices
1. Enable SSL/TLS for database connections
2. Use strong passwords and rotate them regularly
3. Configure rate limiting for API endpoints
4. Enable CORS with specific origins
5. Set secure HTTP headers
6. Keep dependencies updated

### Deployment Steps

1. Prepare for Production
   ```bash
   # Build the production Docker image
   docker-compose -f docker-compose.prod.yml build

   # Start the production containers
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. Database Setup
   ```bash
   # Push the schema to production database
   NODE_ENV=production npm run db:push

   # Verify database connection
   NODE_ENV=production npm run check
   ```

### Scaling Considerations

1. Database Scaling
   - Implement connection pooling
   - Use read replicas for heavy read operations
   - Consider sharding for large datasets
   - Enable query caching

2. Application Scaling
   - Use load balancers for multiple instances
   - Implement caching strategies
   - Optimize static asset delivery
   - Consider using CDN for media content

### Monitoring and Maintenance

The application includes detailed logging for:
- Server startup performance metrics
- Database connection status
- API request/response timing
- Error tracking with stack traces

Monitor these logs through:
```bash
# View container logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container health
docker-compose -f docker-compose.prod.yml ps
```

### Backup and Recovery

1. Database Backups
   - Set up automated daily backups
   - Store backups in multiple locations
   - Regular backup testing and validation
   - Document recovery procedures

2. Application State
   - Version control all configurations
   - Maintain deployment history
   - Document rollback procedures

### Troubleshooting Production Issues

1. Connection Issues
   ```bash
   # Check database connectivity
   npm run check

   # Verify environment variables
   echo $DATABASE_URL

   # Test network connectivity
   nc -zv $PGHOST $PGPORT
   ```

2. Performance Issues
   - Check server resource usage
   - Monitor database query performance
   - Review application logs for bottlenecks
   - Analyze slow API endpoints

3. Memory Leaks
   - Monitor Node.js heap usage
   - Check for connection leaks
   - Review resource cleanup

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
   - Verify network connectivity
   - Check firewall settings

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules`
   - Reinstall dependencies: `npm install`
   - Verify Node.js version
   - Check for TypeScript errors
   - Review build logs

3. **Video Upload Issues**
   - Check file size (max 50MB)
   - Verify supported formats (MP4 recommended)
   - Check browser console for errors
   - Verify storage permissions
   - Monitor upload progress

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Authors

- [Daniel Ribeirinha-Braga](https://github.com/DBragz)
- [Editor](https://github.com/replit) - AI Code Assistant

## License

MIT