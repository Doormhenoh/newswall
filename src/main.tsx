import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import App from './App'
import './index.css'

const DAY_MS = 24 * 60 * 60 * 1000

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      gcTime: DAY_MS, // must cover the persister maxAge so restored data survives
      refetchOnWindowFocus: false,
    },
  },
})

// Query cache persisted to localStorage: reloads paint instantly with the
// last-known data while fresh data is fetched in the background.
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'newswall-cache-v1',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: DAY_MS }}>
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
