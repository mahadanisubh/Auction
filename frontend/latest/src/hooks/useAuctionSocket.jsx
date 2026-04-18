import { useEffect } from 'react';
import { useSocketConnection } from './useSocketConnection.js';
import {
  onBidUpdated,
  onPlayerSold,
  onNextPlayer,
  onAuctionPaused,
  onAuctionResumed,
  onAuctionCompleted,
  onTeamUpdated,
  onAuctionState,
  onBidError,
  onControlError,
  onTimerUpdate
} from '../sockets/socket.js';

export const useAuctionSocket = ({
  onBid = () => {},
  onSold = () => {},
  onNext = () => {},
  onPause = () => {},
  onResume = () => {},
  onComplete = () => {},
  onTeamUpdate = () => {},
  onState = () => {},
  onBidErr = () => {},
  onControlErr = () => {},
  onTimer = () => {}
} = {}) => {
  const socket = useSocketConnection();

  useEffect(() => {
    if (!socket) return;

    // Set up all socket event listeners
    onBidUpdated(onBid);
    onPlayerSold(onSold);
    onNextPlayer(onNext);
    onAuctionPaused(onPause);
    onAuctionResumed(onResume);
    onAuctionCompleted(onComplete);
    onTeamUpdated(onTeamUpdate);
    onAuctionState(onState);
    onBidError(onBidErr);
    onControlError(onControlErr);
    onTimerUpdate(onTimer);

    // Cleanup: Remove listeners on unmount
    return () => {
      if (socket) {
        socket.off('bidUpdated', onBid);
        socket.off('playerSold', onSold);
        socket.off('nextPlayer', onNext);
        socket.off('auctionPaused', onPause);
        socket.off('auctionResumed', onResume);
        socket.off('auctionCompleted', onComplete);
        socket.off('teamUpdated', onTeamUpdate);
        socket.off('auctionState', onState);
        socket.off('bidError', onBidErr);
        socket.off('controlError', onControlErr);
        socket.off('timerUpdate', onTimer);
      }
    };
  }, [socket, onBid, onSold, onNext, onPause, onResume, onComplete, onTeamUpdate, onState, onBidErr, onControlErr, onTimer]);
};
