'use client';

import { SessionProvider } from 'next-auth/react';
import { Component, ReactNode } from 'react';

// Error boundary to catch auth errors without breaking the app
class AuthErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Only log auth-related errors, don't break the app
    if (error.message?.includes('auth') || error.message?.includes('secret') || error.message?.includes('MissingSecret')) {
      console.warn('Auth configuration issue (only affects /newsadmin page):', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      // If auth fails, just render children without SessionProvider
      // Auth is only needed for /newsadmin page
      return <>{this.props.children}</>;
    }

    return (
      <SessionProvider 
        basePath="/api/auth" 
        refetchInterval={0}
      >
        {this.props.children}
      </SessionProvider>
    );
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  );
}

