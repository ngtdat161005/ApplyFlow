import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '../features/auth/auth.store.js';
import { queryClient } from './query-client.js';

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
