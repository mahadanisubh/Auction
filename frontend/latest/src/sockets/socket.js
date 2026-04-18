import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket = null;
let currentAuctionId = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }
console.log("Socket token:", token);
  socket = io(SOCKET_URL, {
    auth: {token},
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error);
  });
  socket.on("reconnect", () => {
    console.log("Reconnected");

    if (currentAuctionId) {
      socket.emit("joinAuction", currentAuctionId);
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentAuctionId= null;
  }
};

// Auction event listeners
export const onBidUpdated = (callback) => {
  if(!socket) return ;
  socket.on('bidUpdated', callback);
  return () => socket.off('bidUpdated', callback);
};

export const onTimerUpdate = (callback) => {
  if(!socket) return;
  socket.on('timerUpdate', callback);
  return () => socket.off('timerUpdate', callback);
};

export const onPlayerSold = (callback) => {
  if(!socket) return;
  socket.on('playerSold', callback);
  return () => socket.off('playerSold', callback);
};

export const onNextPlayer = (callback) => {
  if(!socket) return;
  socket.on('nextPlayer', callback);
  return () => socket.off('nextPlayer', callback);
};

export const onAuctionPaused = (callback) => {
  if(!socket) return;
  socket.on('auctionPaused', callback);
  return () => socket.off('auctionPaused', callback);
};

export const onAuctionResumed = (callback) => {
  if(!socket) return;
  socket.on('auctionResumed', callback);
  return () => socket.off('auctionResumed', callback);
};

export const onAuctionCompleted = (callback) => {
  if(!socket) return;
  socket.on('auctionCompleted', callback);
  return () => socket.off('auctionCompleted', callback);
};

export const onTeamUpdated = (callback) => {
  if(!socket) return;
  socket.on('teamUpdated', callback);
  return () => socket.off('teamUpdated', callback);
};

export const onAuctionState = (callback) => {
  if(!socket) return;
  socket.on('auctionState', callback);
  return () => socket.off('auctionState', callback);
};

export const onBidError = (callback) => {
  if(!socket) return;
  socket.on('bidError', callback);
  return () => socket.off('bidError', callback);
};

export const onControlError = (callback) => {
  if(!socket) return;
  socket.on('controlError', callback);
  return () => socket.off('controlError', callback);
};

// Emit events

export const startAuction = (auctionId) => {
  if (!socket) return;

  socket.emit("startAuction", { auctionId });
};

export const joinAuction = (auctionId) => {
  if (!socket) return;
  currentAuctionId = auctionId;
  socket.emit('joinAuction', auctionId);
};

export const placeBid = (auctionId, bidAmount) => {
  if(!socket) return;
  const teamId = localStorage.getItem(`selectedTeam_${auctionId}`);
  socket.emit('placeBid', { auctionId,teamId, bidAmount});
};

export const pauseAuction = (auctionId) => {
  if (socket) socket.emit('pauseAuction', { auctionId });
};

export const resumeAuction = (auctionId ) => {
  if (socket) socket.emit('resumeAuction', { auctionId });
};

export const skipPlayer = (auctionId) => {
  if (socket) socket.emit('skipPlayer', { auctionId });
};

export const forceSell = (auctionId) => {
  if (socket) socket.emit('forceSell', { auctionId});
};
