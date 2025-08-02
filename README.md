# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/bb8fcf80-f827-426f-983b-6e42ab460ca0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

# 🎨 HeartCanvas - Collaborative Drawing App

A real-time collaborative drawing application built with React, TypeScript, Socket.IO, and Fabric.js. Draw together with your partner and create beautiful memories!

## ✨ Features

- **Real-time Collaboration**: Draw together in real-time with Socket.IO
- **Room System**: Create or join drawing rooms with unique codes
- **Multiple Drawing Tools**: Pen, brush, eraser, shapes, and more
- **Color Palette**: Wide selection of colors for creative expression
- **Emoji Stickers**: Add fun emoji stickers to your drawings
- **Fallback Mode**: Works offline or when server is unavailable
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Quick Start

### Development Mode (Both Frontend & Backend)

```bash
# Single command to start everything
./dev.sh
```

Or manually:

```bash
# Terminal 1: Start Socket.IO server
cd server-combined
npm install && npm run dev

# Terminal 2: Start frontend
npm install && npm run dev
```

### Production Deployment

```bash
# Single command deployment
./deploy.sh
```

This builds the frontend, copies it to the server, and starts everything on port 3001.

### Environment Variables

Create a `.env` file (optional):

```env
VITE_SOCKET_URL=http://localhost:3001  # Only needed in development
```

## 📱 How to Use

1. **Create a Room**:

   - Enter your name
   - Click "Create Drawing Room"
   - Share the generated room code with your partner

2. **Join a Room**:

   - Enter your name
   - Switch to "Join Room" tab
   - Enter the room code shared by your partner

3. **Start Drawing**:

   - Choose your drawing tool (pen, brush, eraser)
   - Select colors from the palette
   - Adjust brush size
   - Add emoji stickers for fun!

4. **Collaborate**:
   - See your partner's cursor in real-time
   - Watch drawings appear as they create them
   - Use undo/clear functions together

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Drawing Canvas**: Fabric.js
- **Real-time Communication**: Socket.IO
- **Backend**: Node.js, Express
- **State Management**: React Hooks
- **Animation**: Framer Motion

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication screens
│   ├── canvas/        # Drawing canvas components
│   ├── connection/    # Socket.IO management
│   ├── layout/        # Header and layout components
│   ├── shared/        # Shared UI components
│   ├── tools/         # Drawing tools and toolbar
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── pages/             # Main application pages
├── utils/             # Utility functions and local storage
└── lib/               # Library configurations

server/
├── server.js          # Socket.IO server
└── package.json       # Server dependencies
```

## 🔍 Features in Detail

### Real-time Synchronization

- Drawing paths sync instantly between users
- Cursor position tracking
- Undo/clear actions sync across users
- Automatic reconnection handling

### Fallback Mode

- Works without internet connection
- Local storage for cross-tab communication
- Seamless fallback when server is unavailable

### Drawing Tools

- **Pen**: Basic drawing tool
- **Brush**: Artistic brush with pressure sensitivity
- **Eraser**: Remove parts of drawings
- **Shapes**: Circles, rectangles, and more
- **Text**: Add text to drawings
- **Stickers**: Emoji stickers for decoration

### Room Management

- Unique room codes for privacy
- Real-time user presence
- Room persistence across sessions

## 🐛 Troubleshooting

### Common Issues

1. **Socket Connection Fails**:

   - Make sure the server is running on port 3001
   - Check firewall settings
   - The app will automatically fall back to local mode

2. **Drawing Not Syncing**:

   - Check network connection
   - Verify both users are in the same room
   - Refresh the page to reconnect

3. **Canvas Not Responding**:
   - Clear browser cache
   - Disable browser extensions
   - Check console for JavaScript errors

## 📦 Deployment

### Simple Production Deployment

```bash
./deploy.sh
```

### Platform-Specific Deployments

#### Heroku

```bash
# Add to Procfile
echo "web: cd server-combined && npm start" > Procfile

# Deploy
npm run build && cp -r dist server-combined/
git add . && git commit -m "Deploy" && git push heroku main
```

#### Railway/Render

- Build command: `npm run build && cp -r dist server-combined/ && cd server-combined && npm install`
- Start command: `cd server-combined && npm start`

#### VPS/Server

```bash
npm run build
cp -r dist server-combined/
cd server-combined && npm install
NODE_ENV=production npm start
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Server Deployment

```bash
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💖 Acknowledgments

- Built with love for couples and friends who want to create together
- Inspired by the joy of collaborative creativity
- Thanks to the open-source community for amazing tools

---

**Happy Drawing! 🎨💕**

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bb8fcf80-f827-426f-983b-6e42ab460ca0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
