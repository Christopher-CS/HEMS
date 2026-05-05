import React, { createContext, useContext, useMemo } from 'react';
import { createRepositories, type Repositories } from '../../services/repositories';
import { loadRuntimeConfig, type RuntimeConfig } from '../../services/config/runtime';

type RepositoriesContextValue = {
  repositories: Repositories;
  config: RuntimeConfig;
};

const RepositoriesContext = createContext<RepositoriesContextValue | null>(null);

export function RepositoriesProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const config = loadRuntimeConfig();
    return { config, repositories: createRepositories(config) };
  }, []);
  return <RepositoriesContext.Provider value={value}>{children}</RepositoriesContext.Provider>;
}

export function useRepositories(): RepositoriesContextValue {
  const ctx = useContext(RepositoriesContext);
  if (!ctx) throw new Error('useRepositories must be used within RepositoriesProvider');
  return ctx;
}
