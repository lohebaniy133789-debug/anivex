import React from 'react';

// Check if Clerk is available
const hasClerk = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Mock implementations for when Clerk is not available
const mockUser = null;
const mockSession = null;
const mockSignOut = () => Promise.resolve();

// Show component that works without Clerk
export function Show({ when, children }: { when: 'signed-in' | 'signed-out'; children: React.ReactNode }) {
  // Without Clerk, treat as signed out
  if (!hasClerk) {
    return when === 'signed-out' ? <>{children}</> : null;
  }
  
  // With Clerk, we'd need the actual state, but for now treat as signed out
  return when === 'signed-out' ? <>{children}</> : null;
}

// Export hooks that work without Clerk
export function useUser() {
  return { user: mockUser, isLoaded: true, isSignedIn: false };
}

export function useClerk() {
  return { signOut: mockSignOut, session: mockSession };
}
