# 🚀 HeartCanvas Deployment Guide

This guide covers multiple deployment options without Docker.

## 🏠 Local Development

### Quick Start

```bash
# Start both frontend and backend
./dev.sh
```

### Manual Start

```bash
# Terminal 1: Start Socket.IO server
cd server-combined
npm install
npm run dev

# Terminal 2: Start frontend
npm install
npm run dev
```

## 🌐 Production Deployment

### Option 1: Single Server (Recommended)

```bash
# Build and deploy everything on one server
./deploy.sh
```

This will:

- Build the React frontend
- Copy files to server directory
- Start the Express server serving both frontend and Socket.IO

### Option 2: Manual Production Build

```bash
# Build frontend
npm run build

# Copy to server
cp -r dist server-combined/

# Start production server
cd server-combined
npm install
NODE_ENV=production npm start
```

## 🎯 Platform-Specific Deployments

### Heroku

1. Create a `Procfile` in the root directory:

```
web: cd server-combined && npm start
```

2. Add heroku buildpack:

```bash
heroku buildpacks:add heroku/nodejs
```

3. Set environment variables:

```bash
heroku config:set NODE_ENV=production
```

4. Deploy:

```bash
# Build before deploying
npm run build
cp -r dist server-combined/
git add .
git commit -m "Production build"
git push heroku main
```

### Railway

1. Connect your GitHub repository
2. Set build command: `npm run build && cp -r dist server-combined/`
3. Set start command: `cd server-combined && npm start`
4. Set environment variable: `NODE_ENV=production`

### Render

1. Create a new Web Service
2. Build command: `npm install && npm run build && cp -r dist server-combined/ && cd server-combined && npm install`
3. Start command: `cd server-combined && npm start`
4. Environment variable: `NODE_ENV=production`

### Vercel (Frontend + Serverless Functions)

1. Deploy frontend to Vercel
2. Add Socket.IO as a serverless function in `/api/socket.js`
3. Configure vercel.json for WebSocket support

### Netlify + Separate Backend

1. Deploy frontend to Netlify
2. Deploy backend to Heroku/Railway/Render
3. Update VITE_SOCKET_URL environment variable

### VPS/Dedicated Server

1. Install Node.js and npm
2. Clone your repository
3. Run the production build:

```bash
npm install
npm run build
cp -r dist server-combined/
cd server-combined
npm install
NODE_ENV=production npm start
```

4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name heartcanvas
pm2 startup
pm2 save
```

5. Setup Nginx reverse proxy (optional):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Development
VITE_SOCKET_URL=http://localhost:3001

# Production (usually not needed as it auto-detects)
# VITE_SOCKET_URL=https://your-domain.com
```

For server environment:

```env
NODE_ENV=production
PORT=3001
```

## 📊 Monitoring & Health Checks

- Health check endpoint: `/health`
- Room info endpoint: `/api/rooms/:roomCode`

Example health check response:

```json
{
  "status": "OK",
  "rooms": 3
}
```

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**

   - Check if server is running
   - Verify CORS settings
   - Check firewall/proxy settings

2. **Build Errors**

   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version (16+ recommended)

3. **Room Sync Issues**
   - App automatically falls back to local mode
   - Check browser console for errors
   - Verify room codes match exactly

### Deployment Checklist

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Server starts without errors
- [ ] Health check responds (`/health`)
- [ ] WebSocket connections work
- [ ] Room creation and joining works
- [ ] Drawing synchronization works
- [ ] Environment variables set correctly

## 🎯 Performance Tips

1. **Enable gzip compression** in your server
2. **Use CDN** for static assets in production
3. **Set up proper caching headers**
4. **Monitor server resources** and scale as needed
5. **Use Redis** for session storage in multi-server setup

## 📱 Testing Production Build Locally

```bash
# Build and test production locally
./deploy.sh

# Test in browser at http://localhost:3001
```

The application will serve both the frontend and handle Socket.IO connections on the same port, making deployment much simpler!
