import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Client from "@convertnative/browser-sdk";
import serviceWorkerURL from "@convertnative/browser-sdk/dist/service-worker.js?url";
import './index.css'

async function getClient() {
  const client = new Client({
    endpoint: 'http://localhost:3000',
    workspaceId: '6d3f1d12-d06f-4b5c-92c8-16c640c338a4',
    publicKey: '54c7af657bf9375831366336a16b56b5',
  })
  await client.registerServiceWorker({ scriptURL: serviceWorkerURL, registrationOptions: { scope: '/' } })
  await client.pushNotifications().subscribe()
  console.log('subscribed!')
}

getClient().catch((error) => console.error(error))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
