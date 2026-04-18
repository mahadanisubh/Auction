# Real-Time Cricket Auction System

A full-stack real-time auction platform inspired by IPL player auctions. Built using MERN stack and Socket.IO, this system enables organizers to conduct live auctions while multiple team owners bid simultaneously with instant updates.

---

## Features

### 1. Core Auction Flow

* Live player auction with real-time bidding
* Automatic bid validation (minimum increment, balance check)
* Timer-based bidding system (20 seconds with priority windows)
* Automatic player sale when timer expires
* Seamless transition to next player

---

### 2. Real-Time (WebSockets)

* Instant bid updates across all connected clients
* Live timer synchronization
* Player sold notifications
* Real-time team balance and squad updates
* Auction state synchronization (pause, resume, complete)
* Auction Live Table updation

---

### 3. Roles

#### Organizer

* Create Players
* Create auction and teams setup the auctionRoom 
* Start auction
* Sees the progress of the auction
* Pause and resume auction
* Skip player
* Force sell player
* Export auction report after auction completes

#### Team Owner

* Select team
* Place bids
* View live balance
* Track squad composition

---

## Bidding Logic

### Priority Bidding System

* Last bidder becomes the priority team
* First 10 seconds: only the priority team can bid
* Next 10 seconds: other teams can bid
* Prevents bid spamming and ensures fairness

---

### Smart Validation

* Minimum bid increment is 10 percent of base price
* Balance validation before allowing bids
* Prevents duplicate bids from current highest bidder
* Ensures auction is in a valid state (live only)

---

### Auto Player Selling

* If timer expires:

  * Player is sold to the highest bidder
  * Team balance is updated
  * Player category count is updated

* If no bids:

  * Player is skipped
  * Next player is loaded automatically

* Auction completes when all players are processed

---

## Sound System (UX Enhancement)

* Dynamic countdown sound (speed increases as time reduces)
* Player sold sound effect (auction hammer style)
* Auction pause and resume sounds
* Auction completion sound
* Countdown sound stops automatically on any event (bid, sell, pause, complete)

---

## Live Team Dashboard

Displays real-time team statistics in a structured table format:

* Team Name
* Wicketkeepers
* Batsmen
* Bowlers
* All-rounders
* Remaining Balance

All values update instantly on:

* Bid placement
* Player sale
* Team updates

---

## Tech Stack

### Frontend

* React (Vite)
* CSS (custom styling)
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Socket.IO

---
