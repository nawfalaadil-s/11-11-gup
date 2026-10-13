// Format date and time for display
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return 'Not set';
  
  const date = new Date(dateString);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return date.toLocaleString('en-IN', finalOptions);
};

// Format date only
export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
};

// Check if registration is currently open
export const isRegistrationOpen = (eventSettings) => {
  if (!eventSettings) return false;
  
  const now = new Date();
  
  // Check if explicitly closed
  if (!eventSettings.is_registration_open) return false;
  
  // Check deadline if set
  if (eventSettings.registration_deadline) {
    const deadline = new Date(eventSettings.registration_deadline);
    if (now > deadline) return false;
  }
  
  return true;
};

// Calculate remaining slots
export const getRemainingSlots = (totalEntries, maxParticipants = 50) => {
  return Math.max(0, maxParticipants - totalEntries);
};
