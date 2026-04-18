export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getCategoryBadgeColor = (category = '') => {
  const colors = {
    batsman: '#FF6B6B',
    bowler: '#4ECDC4',
    allrounder: '#FFE66D',
    wicketkeeper: '#95E1D3'
  };
  return colors[category.toLowerCase()] || '#888';
};
