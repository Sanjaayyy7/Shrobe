/**
 * This file contains mock data for the demo mode when Supabase credentials are not provided
 */

// Mock data for signups
export const mockSignups = [
  { id: 1, email: 'user1@example.com', created_at: new Date().toISOString() },
  { id: 2, email: 'user2@example.com', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, email: 'user3@example.com', created_at: new Date(Date.now() - 172800000).toISOString() },
];

// Generate a random ID
export const generateId = () => {
  return Math.floor(Math.random() * 100000) + 1;
}; 