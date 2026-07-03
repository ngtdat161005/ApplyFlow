import { AuthProvider } from '../features/auth/auth.store.js';

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
