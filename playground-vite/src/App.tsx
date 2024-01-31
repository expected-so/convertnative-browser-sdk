import {useEffect, useState} from "react";
import Client from "@convertnative/browser-sdk";
import serviceWorkerURL from "@convertnative/browser-sdk/dist/service-worker.js?url";
import './App.css'

function App() {
  const [client, setClient] = useState<Client>()

  useEffect(() => {
    const client = new Client({
      endpoint: 'http://localhost:3000',
      workspaceId: '8ab4513c-846b-4478-8470-e65a023c3a1d',
      publicKey: '2b4ffe6060284751861eed5c51fe5a26',
    })
    client.registerServiceWorker({ scriptURL: serviceWorkerURL, registrationOptions: { scope: '/' } })
      .then(async () => {
        await client.pushNotifications().subscribe()
        console.log('subscribed!')
        setClient(client)
      })
  }, [])

  useEffect(() => {
    if (!client) {
      return
    }

    client.events().setUserDetails({
      id: 'TEST-1',
      email: 'test@example.co',
      firstName: 'John',
      lastName: 'Doe',
    })
  }, [client])

  return (
    <>
      <h1>Vite + React</h1>
      <div>
        <button onClick={() => client?.events().pageViewed()}>
          Send page view
        </button>
        <button onClick={() =>
          client?.events().checkoutCompleted({
            checkoutID: `C${Date.now().toString().slice(0, 10)}`,
            lines: [
              {
                productID: 'P-1',
                productName: 'T-Shirt',
                variantID: 'P-1-RED',
                variantName: 'Red',
                quantity: 1,
                unitPrice: '12.00',
              },
            ],
          })
        }>
          Send checkout completed
        </button>
      </div>
    </>
  )
}

export default App
