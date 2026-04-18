# Cricket Auction Platform - Complete Documentation

**Date**: April 2026  
**Project Type**: Full-Stack Real-Time Web Application  
**Technology Stack**: MERN + WebSockets

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Understanding WebSockets](#understanding-websockets)
4. [Database Models & Relationships](#database-models--relationships)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Real-Time Communication Flow](#real-time-communication-flow)
8. [Key Features Explained](#key-features-explained)
9. [Authentication & Security](#authentication--security)
10. [Deployment & Best Practices](#deployment--best-practices)

---

## 1. Project Overview

### What is This Project?

This is a **Cricket Player Auction Platform** - a real-time collaborative web application where:

- **Organizers** set up auctions, add teams, add players, and control the auction flow
- **Team Owners** participate in live bidding for players within budget constraints
- **Players** are auctioned across 4 categories: Batsman, Bowler, All-Rounder, Wicket-Keeper
- **Real-time bidding** happens through WebSockets with automatic player sales

### Core Concepts

| Concept | Meaning |
|---------|---------|
| **Auction** | An event where multiple teams compete to buy players |
| **Bid** | A monetary offer made by a team to acquire a specific player |
| **Round/Ladder** | Bids must increase by at least 10% of the player's base price |
| **Priority Window** | Two-round bidding system where the previous leader gets first chance in round 2 |
| **Auto-Sell** | When the countdown timer expires, the player is automatically sold to the highest bidder |
| **Budget** | Total amount a team can spend; decreases with each purchase |
| **Category Limits** | Maximum number of players each team can buy from each category |

### User Roles

```
┌─────────────────────────────────────────┐
│          User Roles in System           │
├─────────────────────────────────────────┤
│ 1. Organizer                            │
│    - Create auctions                    │
│    - Add teams and players              │
│    - Control auction flow               │
│    - Start/Pause/Resume/Skip players    │
│                                         │
│ 2. Team Owner (also called "Owner")     │
│    - Create teams (assigned to auction) │
│    - Participate in bidding             │
│    - View team budget and players       │
│    - Cannot control auction             │
└─────────────────────────────────────────┘
```

---

## 2. Architecture Deep Dive

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│                  (localhost:5173)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pages: Login, Register, Organizer Dashboard, Auction Room     │
│  │                                                              │
│  ├─→ REST API Calls (Axios)                                    │
│  │   ├─ User authentication                                    │
│  │   ├─ Team/Player CRUD                                       │
│  │   └─ Auction management                                     │
│  │                                                              │
│  └─→ WebSocket Connection (Socket.io Client)                  │
│      ├─ Real-time bid updates                                  │
│      ├─ Live countdown timer                                   │
│      └─ Auction state changes                                  │
│                                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
    [HTTP]                      [WebSocket]
        │                             │
        ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                   │
│                    (localhost:3000)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ REST API Routes (Express)                                  │
│  │  ├─ /registeruser, /loginuser (Auth)                        │
│  │  ├─ /createteam, /createplayer, /createauction             │
│  │  ├─ /auctions/:id, /teams/:id, /players/:id                │
│  │  └─ Middleware: JWT auth, image upload                      │
│  │                                                              │
│  ├─ WebSocket Server (Socket.io)                               │
│  │  ├─ Connection: joinAuction, rejoinAuction                  │
│  │  ├─ Events: startAuction, placeBid, pauseAuction           │
│  │  ├─ Handlers: bid validation, timer management              │
│  │  └─ Broadcast: timerUpdate, bidUpdated, playerSold         │
│  │                                                              │
│  └─ Business Logic                                             │
│     ├─ Bid validation & increment                              │
│     ├─ Priority window logic                                   │
│     ├─ Auto-sell service                                       │
│     └─ Timer management                                        │
│                                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
              [MongoDB Driver]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB + Mongoose)                      │
├─────────────────────────────────────────────────────────────────┤
│ Collections:                                                    │
│ • users (Authentication, roles)                                │
│ • players (Player data, images)                                │
│ • teams (Team info, balance, players)                          │
│ • auctionrooms (Auction state, current bid, timer)             │
│ • bidhistories (Bid tracking audit log)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure & Responsibilities

```
Backend/
├── src/
│   ├── app.js                    // Express server entry point
│   └── sockets/
│       ├── index.js              // Socket.io initialization
│       ├── auction.socket.js      // Event dispatcher
│       ├── handlers/              // Business logic for each event
│       │   ├── bid.handler.js
│       │   ├── control.handler.js
│       │   └── startAuction.handler.js
│       ├── middlewares/
│       │   └── socketAuth.mw.js   // JWT auth for websockets
│       ├── services/
│       │   └── sell.service.js    // Auto-sell logic
│       └── utils/
│           └── timerManager.js    // Timer operations
│
├── config/
│   ├── connectDB.js              // MongoDB connection
│   └── cloudinary.js             // Image storage config
│
├── models/                       // Mongoose schemas
│   ├── user.model.js
│   ├── player.model.js
│   ├── team.model.js
│   ├── auctionRoom.model.js
│   └── bidHistory.model.js
│
├── controllers/                  // REST API endpoints logic
│   ├── auth.controller.js
│   ├── player.controller.js
│   ├── team.controller.js
│   └── auctionRoom.controller.js
│
├── routes/
│   └── auction.routes.js         // All Express routes
│
├── middlewares/                  // Reusable middleware
│   ├── auth.middleware.js        // JWT verification
│   └── multerImage.js            // Image upload
│
└── package.json

frontend/latest/
├── src/
│   ├── main.jsx                  // React entry point
│   ├── App.jsx                   // Main router
│   │
│   ├── pages/                    // Route components
│   │   ├── auth/
│   │   ├── organizer/
│   │   ├── teams/
│   │   └── auction/
│   │
│   ├── components/               // Reusable UI components
│   │   ├── common/
│   │   ├── auction/
│   │   ├── team/
│   │   ├── history/
│   │   └── helper/
│   │
│   ├── context/
│   │   └── AuctionContext.jsx    // Global state (auth, user)
│   │
│   ├── hooks/                    // Custom React hooks
│   │   ├── useAuction.js         // Access context
│   │   ├── useSocketConnection.js // Socket init/cleanup
│   │   └── useAuctionSocket.jsx   // Attach socket listeners
│   │
│   ├── sockets/
│   │   └── socket.js             // Socket.io client setup
│   │
│   ├── api/
│   │   └── auctionApi.js         // Axios HTTP client
│   │
│   └── utils/
│       ├── countdownSound.js     // Audio effects
│       └── formatCurrency.js     // Currency formatting
│
└── vite.config.js
```

---

## 3. Understanding WebSockets

### What Are WebSockets?

WebSockets are a protocol that enables **full-duplex (two-way) real-time communication** between client and server over a single TCP connection.

#### HTTP vs WebSockets

```
┌──────────────────────────────────────────────┐
│              HTTP Communication              │
├──────────────────────────────────────────────┤
│                                              │
│  Client: "Hello, give me player data"        │
│    ↓ (Request)                               │
│  Server receives & responds with data ↓      │
│  Client: Receives and closes connection      │
│                                              │
│  ❌ Problem: Must make new request for      │
│         every server update (inefficient)    │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          WebSocket Communication             │
├──────────────────────────────────────────────┤
│                                              │
│  Client: "Let me connect to auction room"    │
│    ↓ (Upgrades to WebSocket)                 │
│  Connection stays OPEN                       │
│    ↕ (Full-duplex: both send anytime)        │
│  Client: Sends bid                           │
│  Server: Instantly broadcasts to all         │
│  Client: Receives bid + timer update + ...   │
│                                              │
│  ✓ Benefit: Real-time, low latency,         │
│     efficient bandwidth usage                │
│                                              │
└──────────────────────────────────────────────┘
```

### Why WebSockets for This Project?

| Requirement | HTTP | WebSocket |
|-------------|------|-----------|
| Real-time bid updates | ❌ Polling needed | ✓ Instant |
| Live countdown timer | ❌ Lag, wasteful | ✓ Every 1 second |
| Emergency auto-sell | ❌ Delay | ✓ Immediate |
| User experience | ❌ Sluggish | ✓ Smooth & responsive |

### Socket.io Overview

This project uses **Socket.io**, a library that:

1. **Abstracts WebSockets** - Handles browser compatibility
2. **Adds Features** - Namespaces, rooms, acknowledgments
3. **Provides Fallbacks** - Uses polling if WebSocket fails
4. **Simplifies Events** - Like pub/sub messaging

#### Socket.io Concepts

```javascript
// 1. NAMESPACE: Separate communication channels
socket.on('connection', (socket) => {});  // Default namespace

// 2. ROOM: Broadcast to specific group
io.to(auctionId).emit('event', data);  // All sockets in room

// 3. MESSAGE PATTERN: Event-based
socket.emit('eventName', data);        // Send event
socket.on('eventName', callback);      // Listen for event

// 4. ACKNOWLEDGMENT: Confirmation
socket.emit('ask', data, (response) => { });

// 5. BROADCAST: Message from one socket
socket.broadcast.emit('event', data);  // To all except sender
io.emit('event', data);                // To all
```

---

## 4. Database Models & Relationships

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: String ("organizer" | "owner"),
  teamId: ObjectId (reference to Team, optional for owners),
  createdAt: Date
}
```

**Purpose**: Stores user accounts and authentication credentials

**Key Points**:
- Passwords are **hashed with bcryptjs** (never stored in plain text)
- `role` determines permissions (organizer controls auction, owner bids)
- `teamId` links owner to their team (if owner)

---

### Player Model

```javascript
{
  _id: ObjectId,
  playerName: String,
  category: String ("batsman" | "bowler" | "allrounder" | "wicketkeeper"),
  basePrice: Number,
  image: String (Cloudinary URL),
  sold: Boolean (default: false),
  soldPrice: Number (set when sold),
  assignedTeam: ObjectId (reference to Team, null before sale),
  createdBy: ObjectId (reference to User/Organizer),
  createdAt: Date
}
```

**Purpose**: Stores cricket player data

**Key Points**:
- Players exist independently until assigned to an auction
- `category` determines which team limit applies
- `image` is stored on Cloudinary (not MongoDB)
- `sold` tracks auction status; `soldPrice` records final bid amount

---

### Team Model

```javascript
{
  _id: ObjectId,
  teamName: String (unique),
  ownerId: ObjectId (reference to User/Owner),
  auctionId: ObjectId (reference to AuctionRoom),
  balance: Number (remaining budget),
  initialBalance: Number (starting budget),
  players: [
    {
      player: ObjectId (reference to Player),
      price: Number (purchase price),
      category: String
    }
  ],
  categoryCounts: {
    batsman: Number,
    bowler: Number,
    allrounder: Number,
    wicketkeeper: Number
  },
  createdBy: ObjectId (reference to Organizer),
  createdAt: Date
}
```

**Purpose**: Represents a team participating in an auction

**Key Points**:
- Each team has a **budget** that decreases with purchases
- `categoryCounts` enforces auction limits (e.g., max 5 batsmen)
- Team is created by organizer but owned by an owner
- Team is specific to an auction (one team per auction per owner)

---

### AuctionRoom Model (Most Complex)

```javascript
{
  _id: ObjectId,
  auctionName: String,
  status: String ("waiting" | "live" | "paused" | "completed"),
  
  teams: [
    { team: ObjectId (reference to Team) }
  ],
  
  players: [
    {
      player: ObjectId (reference to Player),
      basePrice: Number,
      category: String
    }
  ],
  
  categoryLimits: {
    batsman: 5,
    bowler: 3,
    allrounder: 2,
    wicketkeeper: 1
  },
  
  // CURRENT AUCTION STATE
  currentPlayer: ObjectId (reference to Player),
  playerIndex: Number (current position in players array),
  currentBid: Number (highest bid so far),
  currentLeader: ObjectId (reference to Team, who's winning),
  timerEndTime: Date (when bidding closes for this player),
  
  // PRIORITY WINDOW (Two-round bidding)
  priorityTeam: ObjectId (previous leader gets first chance),
  priorityEndTime: Date (when priority window ends),
  
  createdBy: ObjectId (reference to Organizer),
  createdAt: Date
}
```

**Purpose**: Represents auction session state

**Key Points**:
- `status` transitions: waiting → live → paused → live → completed
- `currentPlayer` + `currentBid` = what's being auctioned now
- `currentLeader` = team that will win if timer expires
- `timerEndTime` = when automatic sale happens

---

### BidHistory Model

```javascript
{
  _id: ObjectId,
  auctionId: ObjectId,
  playerId: ObjectId,
  teamId: ObjectId,
  bidAmount: Number,
  timestamp: Date
}
```

**Purpose**: Audit log of all bids for analytics

---

### Database Relationship Diagram

```
┌─────────────┐
│    User     │
│  (Organizer)│
└──────┬──────┘
       │ 1
       │ creates
       │
       ├─────────────────────────────┐
       │                             │
       ▼ 1                           ▼ 1
   ┌─────────────┐            ┌────────────────┐
   │   Player    │            │  AuctionRoom   │
   └──────┬──────┘            └────────┬───────┘
          │ N                          │ 1
          │ players                    │ teams
          │                            │
          │                            ▼
          │                       ┌─────────┐
          │ soldPrice             │  Team   │
          │ assignedTeam          └────┬────┘
          │                            │ 1
          │                            │ ownerId
          │                            │
          │                            ▼
          │                       ┌──────────┐
          │                       │User      │
          │                       │(Owner)   │
          │                       └──────────┘
          │
          ▼
   ┌────────────────┐
   │  BidHistory    │
   │  (audit log)   │
   └────────────────┘
```

---

## 5. Backend Implementation

### 5.1 Server Initialization (app.js)

```javascript
import express from "express";
import http from "http";
import cors from "cors";
import connectDB from "../config/connectDB.js";
import router from "../routes/auction.routes.js";
import { initSocket } from "./sockets/index.js";

const app = express();
const server = http.createServer(app);  // HTTP server
const io = initSocket(server);          // Layer Socket.io on top
app.set("io", io);                      // Make io accessible in routes

// MIDDLEWARE
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// ROUTES
app.use("/", router);

// START
const startServer = async () => {
  await connectDB();
  server.listen(3000, () => {
    console.log("Server running on port 3000");
  });
};

startServer();
```

**Key Points**:
- `http.createServer(app)` creates base HTTP server
- `initSocket(server)` upgrades connections to support WebSockets
- CORS allows frontend at localhost:5173 to connect
- Routes and socket initialization are separate concerns

---

### 5.2 Socket.io Server Setup (sockets/index.js)

```javascript
import { Server } from "socket.io";
import { auctionSocket } from "./auction.socket.js";
import { socketAuth } from "./middlewares/socketAuth.mw.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true
    }
  });

  // MIDDLEWARE: Authenticate all connections
  io.use(socketAuth);  // Verifies JWT in auth object

  // CONNECTION HANDLER
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // EVENT: Client joins specific auction room
    socket.on("joinAuction", async (auctionId) => {
      if (!auctionId) return;
      
      socket.join(auctionId);  // Add socket to room
      
      const auction = await AuctionRoom.findById(auctionId)
        .populate("currentPlayer")
        .populate("currentLeader");
      
      // Send current auction state to new client
      socket.emit("auctionState", auction);
    });

    // EVENT: Reconnected client rejoins room
    socket.on("rejoinAuction", (auctionId) => {
      socket.join(auctionId);
    });

    // REGISTER ALL AUCTION EVENTS
    auctionSocket(io, socket);

    // DISCONNECTION HANDLER
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // SECURITY: Disconnect non-authorized roles
    if (!["organizer", "owner"].includes(socket.user.role)) {
      socket.disconnect();
    }
  });

  return io;
};
```

**Workflow**:
```
Client connects (with JWT token)
        ↓
socketAuth middleware verifies token
        ↓
io.on("connection") fires
        ↓
socket.on("joinAuction") - client joins broadcast room
        ↓
socket.emit("auctionState") - server sends current state
        ↓
auctionSocket registers all events for bidding/controlling
```

---

### 5.3 Socket Authentication Middleware (socketAuth.mw.js)

```javascript
import jwt from "jsonwebtoken";

export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error("Auth token is required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;  // Attach user info to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};
```

**How It Works**:
1. Client handshake includes token in `auth` object
2. Middleware verifies JWT signature against backend secret
3. If valid, user data is attached to socket object
4. If invalid, connection rejected
5. All subsequent events have access to `socket.user`

---

### 5.4 Event Registration (auction.socket.js)

```javascript
import { placeBid } from "./handlers/bid.handler.js";
import { 
  pauseAuction, 
  resumeAuction, 
  skipPlayer, 
  forceSell 
} from "./handlers/control.handler.js";
import { startAuction } from "./handlers/startAuction.handler.js";

export const auctionSocket = (io, socket) => {
  // STARTAUCTION: Organizer starts auction
  socket.on("startAuction", (data) => 
    startAuction({ io, socket, data })
  );

  // BIDDING: Team owner places bid
  socket.on("placeBid", (data) => 
    placeBid({ io, socket, data })
  );

  // CONTROL: Organizer pauses auction
  socket.on("pauseAuction", (data) => 
    pauseAuction({ io, socket, data })
  );

  // CONTROL: Organizer resumes auction
  socket.on("resumeAuction", (data) => 
    resumeAuction({ io, socket, data })
  );

  // CONTROL: Organizer skips current player
  socket.on("skipPlayer", (data) => 
    skipPlayer({ io, socket, data })
  );

  // CONTROL: Organizer forces sale to current leader
  socket.on("forceSell", (data) => 
    forceSell({ io, socket, data })
  );
};
```

**Pattern**: Each event maps to a handler function that:
1. Receives `io` (broadcast to all)
2. Receives `socket` (send to individual)
3. Receives `data` (event payload)

---

### 5.5 Bid Handler Deep Dive (handlers/bid.handler.js)

This is the **core of the auction system**. Let's understand it step-by-step:

```javascript
export const placeBid = async ({ io, socket, data }) => {
  const { auctionId, bidAmount, teamId } = data;

  // STEP 1: FETCH AUCTION & VALIDATE
  const auction = await AuctionRoom.findById(auctionId);
  if (!auction) return socket.emit("bidError", { message: "Auction not found" });
  if (auction.status !== "live")
    return socket.emit("bidError", { message: "Auction is not live" });

  // STEP 2: CHECK TIMER (Bidding time expired?)
  if (!auction.timerEndTime || new Date() > auction.timerEndTime) {
    return socket.emit("bidError", { message: "Bidding time ended" });
  }

  // STEP 3: VALIDATE TEAM & BALANCE
  const team = await Team.findById(teamId);
  if (!team) return socket.emit("bidError", { message: "Team not found" });
  if (team.balance < bidAmount)
    return socket.emit("bidError", { message: "Insufficient balance" });

  const isTeamInAuction = auction.teams.some(
    (t) => t.team.toString() === teamId.toString()
  );
  if (!isTeamInAuction)
    return socket.emit("bidError", { message: "Team not part of auction" });

  // STEP 4: PRIORITY WINDOW LOGIC (Two-round bidding)
  const now = new Date();
  if (auction.priorityTeam && auction.priorityEndTime && auction.timerEndTime) {
    const pEnd = new Date(auction.priorityEndTime).getTime();
    const tEnd = new Date(auction.timerEndTime).getTime();
    const nowMs = now.getTime();

    const isFirstWindow = nowMs < pEnd;     // Before priority ends
    const isSecondWindow = nowMs >= pEnd && nowMs < tEnd;  // After priority

    if (isFirstWindow) {
      // Only priority team can bid
      if (team._id.toString() !== auction.priorityTeam.toString()) {
        return socket.emit("bidError", { message: "Priority window active" });
      }
    }

    if (isSecondWindow) {
      // Previous leader cannot bid in second window
      if (team._id.toString() === auction.priorityTeam.toString()) {
        return socket.emit("bidError", { 
          message: "Wait until next round to bid again" 
        });
      }
    }
  }

  // STEP 5: PREVENT DUPLICATE BIDDING
  if (
    auction.currentLeader &&
    auction.currentLeader.toString() === team._id.toString()
  ) {
    return socket.emit("bidError", { 
      message: "You are already the highest bidder" 
    });
  }

  // STEP 6: CATEGORY LIMITS CHECK
  const player = await Player.findById(auction.currentPlayer);
  const playerCategory = player.category;

  const maxAllowed = auction.categoryLimits[playerCategory];  // e.g., 5 for batsman
  const currentCount = team.categoryCounts[playerCategory] || 0;

  if (currentCount >= maxAllowed) {
    return socket.emit("bidError", { 
      message: `${playerCategory} category already filled` 
    });
  }

  // STEP 7: BID INCREMENT VALIDATION (10% rule)
  const increment = player.basePrice * 0.1;
  if (bidAmount < auction.currentBid + increment) {
    return socket.emit("bidError", { message: "Bid too low" });
  }

  // STEP 8: ATOMICALLY UPDATE AUCTION (prevent race conditions)
  const previousLeader = auction.currentLeader;

  const updatedAuction = await AuctionRoom.findOneAndUpdate(
    {
      _id: auctionId,
      currentBid: auction.currentBid,           // Must still be this amount
      currentPlayer: auction.currentPlayer,     // Must still be this player
      status: "live"
    },
    {
      currentBid: bidAmount,
      currentLeader: team._id,
      timerEndTime: new Date(Date.now() + 20000),  // Fresh 20 second timer
      priorityTeam: previousLeader || null,        // New leader gets priority next round
      priorityEndTime: previousLeader ? new Date(Date.now() + 10000) : null  // 10 sec priority
    },
    { new: true }
  );

  // If update failed, another bid won already
  if (!updatedAuction) {
    return socket.emit("bidError", { 
      message: "Another team placed higher bid" 
    });
  }

  // STEP 9: START/RESET TIMER WITH NEW END TIME
  startAuctionTimer(io, auctionId, updatedAuction.timerEndTime);

  // STEP 10: BROADCAST BID TO ALL USERS IN AUCTION
  io.to(auctionId).emit("bidUpdated", {
    bidAmount,
    teamName: team.teamName,
    leaderName: team.teamName,
    leader: team._id,
    timestamp: new Date(),
    timerEndTime: updatedAuction.timerEndTime
  });

  // STEP 11: LOG BID IN HISTORY
  await BidHistory.create({
    auctionId,
    playerId: auction.currentPlayer,
    teamId,
    bidAmount,
    timestamp: new Date()
  });
};
```

**Bid Rules Summary**:
```
┌─────────────────────────────────────────────────────────┐
│          BID VALIDATION CHECKLIST                       │
├─────────────────────────────────────────────────────────┤
│ ✓ Auction exists & is live                             │
│ ✓ Bidding time not expired (timerEndTime)              │
│ ✓ Team exists & in this auction                        │
│ ✓ Team has sufficient balance                          │
│ ✓ Respects priority window (two-round bidding)         │
│ ✓ Team not already highest bidder                      │
│ ✓ Team under category limit for this player            │
│ ✓ Bid amount >= current bid + 10% increment            │
│ ✓ Atomic update (no race condition)                    │
└─────────────────────────────────────────────────────────┘
```

#### Priority Window (Two-Round Bidding)

```
ROUND 1 (First 10 seconds):
┌────────────────────────────────────────────┐
│ Team A places bid of 1000                  │
│ → Team A becomes currentLeader             │
│ → Team A becomes priorityTeam              │
│ → priorityEndTime = now + 10 seconds       │
└────────────────────────────────────────────┘

ROUND 2 (Next 10 seconds):
┌────────────────────────────────────────────┐
│ Priority window closed after 10 sec        │
│ → Other teams can now bid                  │
│ → Team A CANNOT bid again in round 2       │
│ → Team B can outbid with 1100 (1000 + 10%) │
│ → Team B becomes new currentLeader         │
│ → Team B becomes new priorityTeam          │
└────────────────────────────────────────────┘

Benefits: Gives previous leader veto right, encourages competition
```

---

### 5.6 Start Auction Handler (handlers/startAuction.handler.js)

```javascript
export const startAuction = async ({ io, socket, data }) => {
  const { auctionId } = data;
  const userId = socket.user?.id;

  // ONLY ORGANIZER CAN START
  const auction = await AuctionRoom.findById(auctionId);
  if (auction.createdBy.toString() !== userId?.toString()) {
    return socket.emit("controlError", { message: "Unauthorized" });
  }

  if (auction.status !== "waiting") {
    return socket.emit("controlError", { message: "Auction already started" });
  }

  // GET FIRST PLAYER
  const firstPlayer = auction.players[0];
  const player = firstPlayer.player;
  const basePrice = firstPlayer.basePrice;
  const timerEndTime = new Date(Date.now() + 20000);  // 20 second countdown

  // UPDATE AUCTION STATE
  auction.currentPlayer = player._id;
  auction.currentBid = basePrice;
  auction.currentLeader = null;  // No one bid yet
  auction.timerEndTime = timerEndTime;
  auction.status = "live";

  await auction.save();

  // START COUNTDOWN TIMER
  startAuctionTimer(io, auctionId, timerEndTime);

  // BROADCAST TO ALL CONNECTED CLIENTS
  io.to(auctionId).emit("nextPlayer", {
    nextPlayer: player,
    nextBid: basePrice,
    timerEndTime
  });
};
```

**Transition**:
```
Status: "waiting"
        ↓
        (startAuction called by organizer)
        ↓
Status: "live"
Timer: 20 seconds countdown
Current player: First player
Current bid: Base price
```

---

### 5.7 Timer Manager (utils/timerManager.js)

```javascript
import { autoSellPlayer } from "../services/sell.service.js";

export const auctionTimers = {};  // Track timers by auctionId

export const startAuctionTimer = (io, auctionId, timerEndTime) => {
  // CLEANUP: Stop existing timer
  if (auctionTimers[auctionId]) {
    clearInterval(auctionTimers[auctionId]);
  }

  const endTime = new Date(timerEndTime).getTime();

  // CREATE NEW TIMER: Tick every 1 second
  auctionTimers[auctionId] = setInterval(async () => {
    // Calculate remaining time
    const remainingTime = Math.max(
      0,
      Math.ceil((endTime - Date.now()) / 1000)
    );

    // BROADCAST countdown to all in room
    io.to(auctionId).emit("timerUpdate", { remainingTime });

    // TIMER EXPIRED: Auto-sell player
    if (remainingTime === 0) {
      clearInterval(auctionTimers[auctionId]);
      delete auctionTimers[auctionId];

      await autoSellPlayer(io, auctionId);
      return;
    }

  }, 1000);  // 1000ms = 1 second
};
```

**Timer Flow**:
```
startAuctionTimer called with end time
        ↓
Every 1 second:
  ├─ Calculate remaining time
  ├─ Emit "timerUpdate" to all clients
  └─ Check if expired
        ↓
When remaining = 0:
  ├─ Clear interval
  └─ Call autoSellPlayer
```

---

### 5.8 Auto-Sell Service (services/sell.service.js)

```javascript
let processing = {};  // Prevent duplicate auto-sells

export const autoSellPlayer = async (io, auctionId) => {
  // Prevent race condition (multiple timers firing)
  if (processing[auctionId]) return;
  processing[auctionId] = true;

  try {
    const auction = await AuctionRoom.findById(auctionId);

    // IF SOMEONE BID: Sell to highest bidder
    if (auction.currentLeader) {
      const team = await Team.findById(auction.currentLeader);

      // Mark player as sold
      const soldPlayer = await Player.findOneAndUpdate(
        { _id: auction.currentPlayer, sold: false },
        {
          sold: true,
          assignedTeam: team._id,
          soldPrice: auction.currentBid
        },
        { new: true }
      );

      // Update team
      team.balance -= auction.currentBid;
      team.players.push({
        player: soldPlayer._id,
        price: auction.currentBid,
        category: soldPlayer.category
      });
      team.categoryCounts[soldPlayer.category] += 1;
      await team.save();

      // Broadcast sale
      io.to(auctionId).emit("playerSold", {
        soldPlayer,
        soldPrice: auction.currentBid,
        soldTeam: team.teamName
      });
    }
    // IF NO BID: Skip to next player

    // Move to next player
    auction.playerIndex += 1;
    const nextPlayerData = auction.players[auction.playerIndex];

    if (!nextPlayerData) {
      // AUCTION COMPLETE: No more players
      auction.status = "completed";
      auction.currentPlayer = null;
      await auction.save();
      io.to(auctionId).emit("auctionCompleted");
    } else {
      // NEXT PLAYER: Start bidding for next player
      const nextPlayer = await Player.findById(nextPlayerData.player);
      const nextBid = nextPlayerData.basePrice;
      const timerEndTime = new Date(Date.now() + 20000);

      auction.currentPlayer = nextPlayer._id;
      auction.currentBid = nextBid;
      auction.currentLeader = null;
      auction.priorityTeam = null;
      auction.timerEndTime = timerEndTime;
      await auction.save();

      startAuctionTimer(io, auctionId, timerEndTime);

      io.to(auctionId).emit("nextPlayer", {
        nextPlayer,
        nextBid,
        timerEndTime
      });
    }
  } finally {
    processing[auctionId] = false;
  }
};
```

**Auto-Sell Flow**:
```
Timer expires (count = 0)
        ↓
autoSellPlayer called
        ↓
    ┌───────────────────────────────────┐
    ▼                                   ▼
IF current leader exists         IF no bids received
(someone bid)                     (no leader)
    │                                  │
    ├─ Mark player sold               ├─ Skip player
    ├─ Deduct from team balance       └─ Keep unsold
    ├─ Add to team.players
    └─ Increment category count
    │
    ▼
Check for next player
    ├─ If exists: Start timer for it
    └─ If none: Mark auction completed

Broadcast new state to all clients
```

---

### 5.9 Control Handlers (pauseAuction, resumeAuction, skipPlayer, forceSell)

#### Pause Auction

```javascript
export const pauseAuction = async ({ io, socket, data }) => {
  const { auctionId } = data;
  const userId = socket.user?.id;

  // AUTHORIZATION
  const auction = await AuctionRoom.findById(auctionId);
  if (auction.createdBy.toString() !== userId?.toString()) {
    return socket.emit("controlError", { message: "Unauthorized" });
  }

  // STATE CHECK
  if (auction.status !== "live") {
    return socket.emit("controlError", { message: "Auction not live" });
  }

  // UPDATE STATE
  auction.status = "paused";
  await auction.save();

  // STOP TIMER
  if (auctionTimers[auctionId]) {
    clearInterval(auctionTimers[auctionId]);
    delete auctionTimers[auctionId];
  }

  // BROADCAST
  io.to(auctionId).emit("auctionPaused");
};
```

---

#### Resume Auction

```javascript
export const resumeAuction = async ({ io, socket, data }) => {
  const { auctionId } = data;
  const userId = socket.user?.id;

  const auction = await AuctionRoom.findById(auctionId);
  if (auction.createdBy.toString() !== userId?.toString()) {
    return socket.emit("controlError", { message: "Unauthorized" });
  }

  if (auction.status !== "paused") {
    return socket.emit("controlError", { message: "Auction not paused" });
  }

  // FRESH TIMER (20 seconds from now)
  auction.status = "live";
  auction.timerEndTime = new Date(Date.now() + 20000);
  auction.priorityTeam = null;      // Reset priority
  auction.priorityEndTime = null;

  await auction.save();

  startAuctionTimer(io, auctionId, auction.timerEndTime);

  io.to(auctionId).emit("auctionResumed", {
    timerEndTime: auction.timerEndTime
  });
};
```

---

#### Skip Player

```javascript
export const skipPlayer = async ({ io, socket, data }) => {
  const { auctionId } = data;

  // Stop current timer
  if (auctionTimers[auctionId]) {
    clearInterval(auctionTimers[auctionId]);
    delete auctionTimers[auctionId];
  }

  // Move to next player index
  auction.playerIndex += 1;
  const nextPlayerData = auction.players[auction.playerIndex];

  if (!nextPlayerData) {
    // AUCTION COMPLETE
    auction.status = "completed";
    await auction.save();
    io.to(auctionId).emit("auctionCompleted");
    return;
  }

  // PREPARE NEXT PLAYER
  const playerDoc = await Player.findById(nextPlayerData.player);
  const nextBid = nextPlayerData.basePrice;
  const timerEndTime = new Date(Date.now() + 20000);

  auction.currentPlayer = playerDoc._id;
  auction.currentBid = nextBid;
  auction.currentLeader = null;
  auction.priorityTeam = null;
  auction.timerEndTime = timerEndTime;
  await auction.save();

  startAuctionTimer(io, auctionId, timerEndTime);

  io.to(auctionId).emit("nextPlayer", {
    nextPlayer: playerDoc,
    nextBid,
    timerEndTime
  });
};
```

---

### 5.10 REST API Routes (routes/auction.routes.js)

These handle all HTTP requests (non-real-time operations):

```javascript
// AUTHENTICATION
POST   /registeruser      // Create new user account
POST   /loginuser         // Login, get JWT token

// TEAMS
POST   /createteam        // Create team (organizer)
GET    /teams             // Get all teams
GET    /my-teams          // Get current user's teams
GET    /team/:teamId      // Get specific team

// PLAYERS
POST   /createplayer      // Create player (organizer)
GET    /players           // Get all players
GET    /player/:playerId  // Get specific player

// AUCTIONS
POST   /createauction     // Create auction (organizer)
GET    /auctions          // Get all auctions
GET    /auction/:auctionId // Get auction details
GET    /auction/:auctionId/players  // Get players in auction
GET    /auction/:auctionId/teams    // Get teams in auction
GET    /auction/:auctionId/export   // Export as CSV

// USERS
GET    /users             // Get all users (with role filter)
```

---

## 6. Frontend Implementation

### 6.1 React Entry Point (main.jsx & App.jsx)

```javascript
// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuctionProvider } from './context/AuctionContext'

function App() {
  return (
    <AuctionProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          {/* Organizer Only */}
          <Route element={<RoleRoute allowedRoles={['organizer']} />}>
            <Route path="/organizer" element={<OrganizerDashboard />} />
          </Route>
          
          {/* Owner Only */}
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route path="/teams" element={<TeamDashboard />} />
          </Route>
          
          {/* All Authenticated */}
          <Route path="/auction/:auctionId" element={<AuctionRoom />} />
        </Route>
      </Routes>
    </AuctionProvider>
  )
}
```

---

### 6.2 Global State Management (context/AuctionContext.jsx)

```javascript
import React, { createContext, useState, useEffect } from 'react'

export const AuctionContext = createContext()

export function AuctionProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [user, setUser] = useState(localStorage.getItem('user'))
  const [userName, setUserName] = useState(localStorage.getItem('userName'))

  // LOGIN
  const login = (token, role, user, userName) => {
    setToken(token)
    setRole(role)
    setUser(user)
    setUserName(userName)

    // Persist to localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('user', user)
    localStorage.setItem('userName', userName)
  }

  // LOGOUT
  const logout = () => {
    setToken(null)
    setRole(null)
    setUser(null)
    setUserName(null)

    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    localStorage.removeItem('userName')
  }

  // CHECK IF AUTHENTICATED
  const isAuthenticated = !!token

  return (
    <AuctionContext.Provider value={{
      token,
      role,
      user,
      userName,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuctionContext.Provider>
  )
}
```

**Purpose**: 
- Stores authentication state globally
- Persists to localStorage (survives refresh)
- Accessed via `useContext(AuctionContext)` hook

---

### 6.3 API Integration (api/auctionApi.js)

```javascript
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

// Create Axios instance with auth interceptor
const auctionApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// REQUEST INTERCEPTOR: Add JWT token to every request
auctionApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR: Handle 401 errors
auctionApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AUTH APIs
export const registerUser = (userData) =>
  auctionApi.post('/registeruser', userData)

export const loginUser = (credentials) =>
  auctionApi.post('/loginuser', credentials)

// TEAM APIs
export const createTeam = (teamData) =>
  auctionApi.post('/createteam', teamData)

export const getTeamsByAuction = (auctionId) =>
  auctionApi.get(`/auction/${auctionId}/teams`)

// PLAYER APIs
export const createPlayer = (playerData) =>
  auctionApi.post('/createplayer', playerData)

export const getAllPlayers = () =>
  auctionApi.get('/players')

// AUCTION APIs
export const createAuction = (auctionData) =>
  auctionApi.post('/createauction', auctionData)

export const getAuctionById = (auctionId) =>
  auctionApi.get(`/auction/${auctionId}`)

export const getAuctionPlayers = (auctionId) =>
  auctionApi.get(`/auction/${auctionId}/players`)

// ... more APIs
```

**Pattern**: 
- Centralized API calls
- Automatic JWT injection
- Automatic logout on 401

---

### 6.4 Socket.io Client Setup (sockets/socket.js)

```javascript
import io from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

let socket = null
let currentAuctionId = null

// CONNECT SOCKET WITH JWT
export const initSocket = (token) => {
  if (socket) socket.disconnect()

  socket = io(SOCKET_URL, {
    auth: { token },  // Send JWT in handshake
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  })

  // Connection established
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  // Connection lost
  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  // Connection error
  socket.on('connect_error', (error) => {
    console.log('Socket error:', error)
  })

  // Auto-rejoin on reconnect
  socket.on('reconnect', () => {
    console.log('Reconnected')
    if (currentAuctionId) {
      socket.emit('joinAuction', currentAuctionId)
    }
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentAuctionId = null
  }
}

// EVENT LISTENERS: Return cleanup functions
export const onBidUpdated = (callback) => {
  if (!socket) return
  socket.on('bidUpdated', callback)
  return () => socket.off('bidUpdated', callback)
}

export const onTimerUpdate = (callback) => {
  if (!socket) return
  socket.on('timerUpdate', callback)
  return () => socket.off('timerUpdate', callback)
}

export const onPlayerSold = (callback) => {
  if (!socket) return
  socket.on('playerSold', callback)
  return () => socket.off('playerSold', callback)
}

export const onNextPlayer = (callback) => {
  if (!socket) return
  socket.on('nextPlayer', callback)
  return () => socket.off('nextPlayer', callback)
}

// ... more event listeners

// EVENT EMITTERS: Send events to server
export const joinAuction = (auctionId) => {
  currentAuctionId = auctionId
  socket?.emit('joinAuction', auctionId)
}

export const placeBid = (auctionId, teamId, bidAmount) => {
  socket?.emit('placeBid', { auctionId, teamId, bidAmount })
}

export const startAuction = (auctionId) => {
  socket?.emit('startAuction', { auctionId })
}

export const pauseAuction = (auctionId) => {
  socket?.emit('pauseAuction', { auctionId })
}

// ... more emitters
```

---

### 6.5 Custom Hooks for Socket Management

**useSocketConnection.js** - Manages socket lifecycle

```javascript
import { useEffect, useState } from 'react'
import { initSocket, disconnectSocket, getSocket } from '../sockets/socket'
import { useAuction } from './useAuction'

export const useSocketConnection = () => {
  const [socket, setSocket] = useState(null)
  const { token } = useAuction()

  useEffect(() => {
    if (!token) return

    // Initialize socket when token is available
    const newSocket = initSocket(token)
    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      disconnectSocket()
    }
  }, [token])

  return getSocket()
}
```

**useAuctionSocket.jsx** - Attach event listeners

```javascript
import { useEffect } from 'react'
import { useSocketConnection } from './useSocketConnection'
import {
  onBidUpdated,
  onPlayerSold,
  onNextPlayer,
  onTimerUpdate,
  // ... more imports
} from '../sockets/socket'

export const useAuctionSocket = ({
  onBid = () => {},
  onSold = () => {},
  onNext = () => {},
  onTimer = () => {},
  // ... more callbacks
} = {}) => {
  const socket = useSocketConnection()

  useEffect(() => {
    if (!socket) return

    // Attach listeners
    onBidUpdated(onBid)
    onPlayerSold(onSold)
    onNextPlayer(onNext)
    onTimerUpdate(onTimer)
    // ... more

    // Cleanup: Remove listeners on unmount
    return () => {
      if (socket) {
        socket.off('bidUpdated', onBid)
        socket.off('playerSold', onSold)
        socket.off('nextPlayer', onNext)
        socket.off('timerUpdate', onTimer)
        // ... more
      }
    }
  }, [socket, onBid, onSold, onNext, onTimer])
}
```

---

### 6.6 Auction Room Component (pages/auction/AuctionRoom.jsx)

This is the main real-time auction interface:

```javascript
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuctionSocket } from '../../hooks/useAuctionSocket'
import { joinAuction, placeBid } from '../../sockets/socket'
import PlayerCard from '../../components/auction/PlayerCard'
import Timer from '../../components/auction/Timer'
import BidPanel from '../../components/auction/BidPanel'

function AuctionRoom() {
  const { auctionId } = useParams()
  const [auction, setAuction] = useState(null)
  const [timer, setTimer] = useState(0)
  const [bids, setBids] = useState([])

  // Attach socket listeners
  useAuctionSocket({
    onState: (state) => {
      setAuction(state)
    },
    onNext: (data) => {
      setAuction(prev => ({
        ...prev,
        currentPlayer: data.nextPlayer,
        currentBid: data.nextBid
      }))
    },
    onBid: (data) => {
      setAuction(prev => ({
        ...prev,
        currentBid: data.bidAmount,
        currentLeader: data.leader
      }))
      setBids(prev => [data, ...prev].slice(0, 10))
    },
    onTimer: (data) => {
      setTimer(data.remainingTime)
    },
    onSold: (data) => {
      // Show sold banner
    }
  })

  // Join auction when loaded
  useEffect(() => {
    joinAuction(auctionId)
  }, [auctionId])

  const handleBid = (teamId, amount) => {
    placeBid(auctionId, teamId, amount)
  }

  return (
    <div className="auction-room">
      <div className="main-area">
        <PlayerCard player={auction?.currentPlayer} />
        <Timer remaining={timer} />
      </div>

      <div className="side-area">
        <BidPanel
          currentBid={auction?.currentBid}
          onBid={handleBid}
        />
        <BidHistory bids={bids} />
      </div>
    </div>
  )
}

export default AuctionRoom
```

---

## 7. Real-Time Communication Flow

### Complete Bid Flow (End-to-End)

```
USER ACTION: Team Owner clicks "Place Bid"
        ↓
FRONTEND:
├─ User enters bid amount (e.g., 1500)
├─ Validates (must be > current bid + 10%)
├─ Calls placeBid(auctionId, teamId, 1500)
└─ Emits "placeBid" event over WebSocket
        ↓
BACKEND:
├─ placeBid handler receives event
├─ Validates:
│  ├─ Auction exists & is live
│  ├─ Team has balance >= 1500
│  ├─ Respects priority window
│  ├─ Category limits not exceeded
│  └─ Bid increment validation
├─ Atomically updates:
│  ├─ auction.currentBid = 1500
│  ├─ auction.currentLeader = teamId
│  ├─ auction.timerEndTime = now + 20 sec
│  └─ auction.priorityTeam = old leader
├─ Starts/resets timer
├─ Saves BidHistory record
└─ Broadcasts "bidUpdated" to all clients
        ↓
FRONTEND (All Auction Participants):
├─ Receives "bidUpdated" with new bid info
├─ Updates UI:
│  ├─ currentBid display
│  ├─ Leader name
│  └─ Team status
├─ Receives "timerUpdate" every 1 second
├─ countdown: 20 → 19 → 18... with audio
└─ If timer reaches 0:
   ├─ Receives "playerSold" event
   ├─ Shows "Sold Banner" animation
   └─ Receives "nextPlayer" → moves to next
```

---

### Timer Broadcast Flow

```
Backend: startAuctionTimer(io, auctionId, endTime)
        ↓
Every 1 second:
        │
        ├─ Calculate: remaining = (endTime - now) / 1000
        │
        ├─ Broadcast: io.to(auctionId).emit("timerUpdate", {remainingTime})
        │                              ↓
        │                    All clients in this room
        │                         ↓
        │                  Frontend receives
        │                         ↓
        │                  setTimer(remainingTime)
        │                         ↓
        │                  <Timer> component re-renders
        │                         ↓
        │                  Display: "15 seconds left"
        │
        └─ After 20 seconds (when remaining = 0):
           ├─ Clear interval
           ├─ Call autoSellPlayer(io, auctionId)
           │         ↓
           │   If bid exists:
           │   ├─ Mark player sold
           │   ├─ Deduct from team balance
           │   └─ Broadcast "playerSold"
           │
           └─ Move to next player
               ├─ Emit "nextPlayer" with new player data
               └─ Restart timer
```

---

## 8. Key Features Explained

### 8.1 Two-Round Priority Bidding

**Why?** Encourages competition and gives previous leader a chance to respond.

**How It Works:**

```
Timeline for 20-second bidding window:

┌─────────────────────────────────────────┐
│  SECOND: 0  1  2  3  4  5  6  7  8  9   │  10  11  12  13  14  15  16  17  18  19  20
│                                          │
│  Round 1: Priority Window                │  Round 2: Open Bidding
│  ────────────────────────────────────    │  ──────────────────────────────────────
│  Only priorityTeam can bid               │  Anyone EXCEPT priorityTeam can bid
│  (Usually empty for first player)        │  priorityTeam CAN bid again here
│                                          │
└─────────────────────────────────────────┘
      10 seconds                    10 seconds
```

**Scenario:**

```
1. Base price: 5
   │
2. Team A bids 6 (> 1000 + 10%)
   │ → currentLeader = Team A
   │ → priorityTeam = Team A
   │ → priorityEndTime = now + 10 sec
   │ → timerEndTime = now + 20 sec
   │
3. For next 10 seconds after any team Outbids A, let team B BidAmount = 7
   │ → Only Team A can bid 
   │
4. After 10 seconds (second round):
   │ → Team B CAN now bid 
   │ → Team A CANNOT bid in this 10 sec window
   │ → Team B gets priority again if someone outbids
   │
5. Timer expires → Auto-sell to highest bidder
```

---

### 8.2 Category Limits (Squad Rules)

**Why?** Realistic cricket teams can't have all batsmen.

**Default Limits:**
- Batsman: 5 max
- Bowler: 3 max
- All-Rounder: 2 max
- Wicket-Keeper: 1 max

**How Enforced:**

```javascript
// Before accepting bid:

const currentCount = team.categoryCounts[playerCategory]  // 3 batsmen bought
const maxAllowed = auction.categoryLimits.batsman          // 5 batsmen allowed

if (currentCount >= maxAllowed) {
  socket.emit("bidError", { message: "Batsman quota filled" })
}

// If bid accepted:
team.categoryCounts.batsman += 1  // 3 → 4
```

---

### 8.3 Budget Management

```
SCENARIO:

┌──────────────────────────────────────────┐
│ Team A Initial Balance: 100              │
├──────────────────────────────────────────┤
│                                          │
│ Player 1: Batsman - Won for 20           │
│ Balance: 100 - 20 = 80                   │
│                                          │
│ Player 2: Bowler - Won for 15            │
│ Balance: 80 - 15 = 65                    │
│                                          │
│ Player 3: All-rounder - They bid 50    │
│ BUT: balance (6500) >= 5000 ✓ Allowed    │
│ Balance: 6500 - 5000 = 1500              │
│                                          │
│ Player 4: Wicket-keeper - Base: 2000     │
│ Team tries bid but balance = 1500        │
│ 1500 < 2000 ✗ Bid REJECTED              │
│   (TeamBalance < bidAmount )             │
└──────────────────────────────────────────┘
```

**Key Code:**
```javascript
if (team.balance < bidAmount) {
  socket.emit("bidError", { message: "Insufficient Balance" })
}
```

---

### 8.4 Atomic Updates (Race Condition Prevention)

**Problem**: What if two teams bid simultaneously?

```
Team A: Bid 2000
Team B: Bid 2050    ← Same time!
        ↓
        Backend receives both nearly simultaneously
        ├─ Should only accept higher bid
        └─ Lower bid should be rejected
```

**Solution**: MongoDB atomic update with conditions

```javascript
const updatedAuction = await AuctionRoom.findOneAndUpdate(
  {
    _id: auctionId,
    currentBid: auction.currentBid,        // Must STILL be this value
    currentPlayer: auction.currentPlayer,  // Must STILL be this player
    status: "live"
  },
  {
    currentBid: newBidAmount,
    currentLeader: newTeamId
  },
  { new: true }  // Return updated doc
)

if (!updatedAuction) {
  // Update failed: Another team already bid
  socket.emit("bidError", { message: "Another bid received first" })
}
```

**How It Works:**
- MongoDB checks **all conditions** before updating
- If another update changed `currentBid`, this update fails
- First-come-first-served naturally enforced

---

## 9. Authentication & Security

### 9.1 Password Hashing (bcryptjs)

```javascript
// REGISTRATION
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash(password, 10)
// 10 = salt rounds (higher = slower but more secure)

const user = new User({
  name,
  email,
  password: hashedPassword,  // Hash, not plain text
  role
})

// LOGIN
const user = await User.findOne({ email })
const isValid = await bcrypt.compare(inputPassword, user.password)
// Returns true/false
```

**Why Hash?**
- If database leaked, passwords not exposed
- Can't reverse hash → can't guess password
- Same password → different hashes (salt)

---

### 9.2 JWT Token Authentication

```javascript
// GENERATE TOKEN (on login)
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { id: user._id, role: user.role },  // Payload
  process.env.JWT_SECRET,              // Secret key
  { expiresIn: '24h' }                 // Expiry
)

// VERIFY TOKEN (on API requests)
const decoded = jwt.verify(token, process.env.JWT_SECRET)
// Returns: { id, role, iat, exp }

// If token expired or tampered: throws error
```

**Token Flow:**

```
1. User logs in with password
        ↓
2. Backend validates credentials
        ↓
3. Backend generates JWT containing:
   - User ID
   - Role (organizer/owner)
   - Expiry time (24 hours)
        ↓
4. Frontend stores token in localStorage
        ↓
5. For every HTTP request:
   - Frontend adds: Authorization: Bearer <token>
   - Backend verifies token signature
        ↓
6. For WebSocket connection:
   - Frontend sends token in handshake
   - Backend middleware verifies token
        ↓
7. If token invalid:
   - HTTP: Return 401, redirect to login
   - WebSocket: Deny connection
```

---

### 9.3 Role-Based Access Control

```javascript
// MIDDLEWARE: Check role on HTTP routes
export const isOrganizer = (req, res, next) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ message: "Forbidden" })
  }
  next()
}

export const isOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: "Forbidden" })
  }
  next()
}

// USAGE in routes
router.post('/createauction', isOrganizer, createAuction)
// Now only organizers can create auctions

// FRONTEND: Component routing
<Route element={<RoleRoute allowedRoles={['organizer']} />}>
  <Route path="/organizer" element={<OrganizerDashboard />} />
</Route>
```

---

### 9.4 Socket Authentication

```javascript
// FRONTEND: Send token in handshake
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
})

// BACKEND: Verify in middleware
export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded  // Attach to socket
    next()
  } catch (err) {
    next(new Error("No auth"))
  }
}

// USAGE: Every handler has access to socket.user
export const placeBid = async ({ socket, data }) => {
  const userId = socket.user.id  // ← Authenticated user
  // Can verify ownership, role, etc.
}
```

---

## 10. Deployment & Best Practices

### 10.1 Environment Variables (.env files)

**Backend (.env)**:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auction
JWT_SECRET=your-super-secret-key-here
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:3000
```

---

### 10.2 CORS Configuration

```javascript
// Backend
app.use(cors({
  origin: ["http://localhost:5173"],  // Frontend URL
  credentials: true                    // Allow cookies/auth
}))

// Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"]
  }
})
```

**Why?**
- Browser security prevents cross-origin requests
- Must explicitly allow frontend domain

---

### 10.3 Performance Tips

**Backend:**
```javascript
// Use indexes on frequently queried fields
userSchema.index({ email: 1 })
auctionSchema.index({ status: 1 })

// Limit population depth
AuctionRoom.findById(id)
  .populate("currentPlayer")  // OK
  .populate("currentLeader")  // OK
  // Don't do: .populate({ path: "currentLeader", populate: "ownerId" })

// Use lean() for read-only queries
const auctions = await AuctionRoom.find().lean()
// Faster, returns plain objects not Mongoose docs
```

**Frontend:**
```javascript
// Use memo to prevent unnecessary re-renders
const PlayerCard = memo(({ player }) => {
  return <div>{player.name}</div>
})

// Debounce bid submissions
const [canBid, setCanBid] = useState(true)
const handleBid = debounce((amount) => {
  if (!canBid) return
  setCanBid(false)
  placeBid(amount)
  setTimeout(() => setCanBid(true), 500)
}, 300)
```

---

### 10.4 Production Deployment Checklist

**Backend:**
- [x] Environment variables in .env
- [x] MongoDB Atlas (cloud) connection
- [x] Cloudinary account configured
- [x] JWT_SECRET as strong random string
- [x] CORS configured for production domain
- [x] Error handling on all endpoints
- [x] Logging setup (bunyan, winston)
- [x] Rate limiting on sensitive endpoints

**Frontend:**
- [x] Build: `npm run build`
- [x] Test dist/ folder works
- [x] API URL points to production backend
- [x] Remove console.logs (or filter)
- [x] Only load production dependencies
- [x] Serve as static files (no live reload)

**DevOps:**
- [x] Use Docker for consistency
- [x] CI/CD pipeline (GitHub Actions)
- [x] Database backups automated
- [x] SSL certificate (HTTPS)
- [x] Monitor for errors (Sentry)
- [x] Performance monitoring (New Relic)

---

## Conclusion

This Cricket Auction Platform demonstrates:

1. **Real-time Communication**: WebSockets for instant bidding updates
2. **Complex State Management**: Priority windows, budget tracking, category limits
3. **Security**: JWT authentication, role-based access, password hashing
4. **Scalability**: Atomic updates prevent race conditions, user isolation via socket rooms
5. **User Experience**: Live countdown, instant feedback, seamless reconnection

---

**Key Takeaways:**
- WebSockets enable blazing-fast real-time updates
- Bid validation is critical (race conditions, limits, priorities)
- Frontend and backend must work in harmony
- Authentication is paramount for security
- State transitions must be carefully managed

---

**For More Understanding:** Explore the codebase with these files as reference:
- Backend: `Backend/src/sockets/handlers/bid.handler.js` (core logic)
- Frontend: `frontend/latest/src/pages/auction/AuctionRoom.jsx` (UI logic)
- Database: `Backend/models/auctionRoom.model.js` (state schema)
