# Al-Hikmah Academy - Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- MongoDB (via Docker or external service)
- Node.js 20+ (for local development)
- Git

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://mongodb:27017/al-hikmah-academy

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload Limits (in bytes)
MAX_FILE_SIZE=52428800
```

### 2. Generate Secure JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Docker Deployment

### Development Environment

1. **Start all services:**
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

3. **Seed initial data:**
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### Production Environment

1. **Build production images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Check health:**
   ```bash
   curl http://localhost:5000/health
   ```

## Manual Deployment (Without Docker)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Start MongoDB

Ensure MongoDB is running locally or use a cloud service like MongoDB Atlas.

### 4. Seed Data

```bash
npm run seed
```

### 5. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Database Setup

### MongoDB Configuration

1. **Create Database:**
   ```javascript
   use al-hikmah-academy
   ```

2. **Create Admin User:**
   ```javascript
   db.users.insertOne({
     email: "admin@alhikmah.com",
     password: "$2b$10$...", // Use bcrypt to hash
     name: "Admin User",
     role: "admin",
     language: "ar",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

3. **Seed Adhkar:**
   ```bash
   npm run seed
   ```

## Cloud Deployment

### MongoDB Atlas

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

### Heroku Deployment

1. **Install Heroku CLI**

2. **Create Heroku App:**
   ```bash
   heroku create al-hikmah-academy-api
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set MONGODB_URI=your-mongodb-uri
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### AWS EC2 Deployment

1. **Launch EC2 Instance** (Ubuntu 20.04+)

2. **Install Docker:**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   ```

3. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd al-hikmah-academy/backend
   ```

4. **Configure Environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit variables
   ```

5. **Start Services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

6. **Configure Nginx (Optional):**
   ```nginx
   server {
       listen 80;
       server_name api.alhikmah.academy;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### DigitalOcean Deployment

1. **Create Droplet** (Docker on Ubuntu)

2. **SSH into Droplet:**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Clone and Deploy:**
   ```bash
   git clone <repository-url>
   cd al-hikmah-academy/backend
   docker-compose -f docker-compose.prod.yml up -d
   ```

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate:**
   ```bash
   sudo certbot --nginx -d api.alhikmah.academy
   ```

3. **Auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

## Monitoring and Logging

### View Logs

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f mongodb
```

**PM2 (for non-Docker):**
```bash
npm install -g pm2
pm2 start dist/server.js --name al-hikmah-api
pm2 logs al-hikmah-api
pm2 monit
```

### Health Checks

```bash
# Check API health
curl http://localhost:5000/health

# Check specific endpoint
curl http://localhost:5000/api/subjects
```

## Backup and Restore

### MongoDB Backup

```bash
# Backup
docker-compose exec mongodb mongodump --out /backup

# Restore
docker-compose exec mongodb mongorestore /backup
```

### File Uploads Backup

```bash
# Backup uploads directory
tar -czf uploads-backup.tar.gz uploads/

# Restore
tar -xzf uploads-backup.tar.gz
```

## Performance Optimization

### 1. Enable Compression

Already configured in the application with helmet and express.

### 2. Database Indexes

All necessary indexes are created automatically by Mongoose schemas.

### 3. Caching (Optional)

Consider adding Redis for caching:
```bash
docker-compose.yml:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### 4. CDN for Static Files

Consider using AWS S3 + CloudFront for uploaded files in production.

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB password
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting (already configured)
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup data regularly
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed

```bash
# Check MongoDB status
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

### File Upload Issues

```bash
# Check uploads directory permissions
ls -la uploads/

# Fix permissions
chmod -R 755 uploads/
```

### Out of Memory

```bash
# Increase Docker memory limit
# Edit docker-compose.yml:
services:
  backend:
    mem_limit: 1g
```

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Database Maintenance

```bash
# Compact database
docker-compose exec mongodb mongo al-hikmah-academy --eval "db.runCommand({compact: 'users'})"

# Rebuild indexes
docker-compose exec mongodb mongo al-hikmah-academy --eval "db.users.reIndex()"
```

### Clean Up Old Files

```bash
# Remove old logs
find logs/ -name "*.log" -mtime +30 -delete

# Clean Docker
docker system prune -a
```

## Scaling

### Horizontal Scaling

1. **Load Balancer:** Use Nginx or AWS ELB
2. **Multiple Instances:** Run multiple backend containers
3. **Shared Storage:** Use S3 or shared volume for uploads
4. **Database Replication:** MongoDB replica set

### Vertical Scaling

1. **Increase Resources:** More CPU/RAM for containers
2. **Optimize Queries:** Add indexes, optimize aggregations
3. **Connection Pooling:** Already configured in Mongoose

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review documentation: `/docs` directory
- API documentation: `http://localhost:5000/api-docs`

---

**Last Updated**: 2024
**Version**: 1.0.0
