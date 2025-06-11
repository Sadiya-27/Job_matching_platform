'use client';

import { SessionProvider } from 'next-auth/react';

const ClientSessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ClientSessionProvider;
