import { useContext } from 'react';
import { AuctionContext } from '../context/AuctionContext.jsx';

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within AuctionProvider');
  }
  return context;
};
