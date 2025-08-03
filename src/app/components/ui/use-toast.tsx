'use client';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

// Simple toast function using alert for now
// In a real application, you might want to use a proper toast library
export const toast = (options: ToastOptions) => {
  const { title, description, variant = 'default' } = options;
  
  const message = description ? `${title}: ${description}` : title;
  
  // For now, using console log and alert as placeholder
  console.log(`Toast (${variant}):`, message);
  
  // You can replace this with a proper toast notification system
  if (variant === 'destructive') {
    alert(`Error: ${message}`);
  } else if (variant === 'success') {
    alert(`Success: ${message}`);
  } else {
    alert(message);
  }
};

export default toast;
