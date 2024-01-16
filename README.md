<div align="center">
  ⚡️ JavaScript library to track events and receive push notifications with ConvertNative. ⚡️
</div>

---

## Get started

### Option A. Install as npm package

1. Install the browser SDK package.
    ```bash
    npm install @convertnative/browser-sdk
    # or
    yarn add @convertnative/browser-sdk
    ```
2. Import and initialize the client.
    ```javascript
    import Client from "@convertnative/browser-sdk";

    const client = new Client({
      workspaceId: 'YOUR_WORKSPACE_ID',
      publicKey: 'YOUR_WORKSPACE_PUBLIC_KEY',
    })
   // use the client here
    ```

### Option B. Add the ConvertNative snippet
1. Add the script tag.
    ```html
    <script async src="https://cdn.convertnative.com/sdks/browser/v1/browser.js"></script>
    ```
2. Initialize the client.
   ```html
   <script>
    window._convertNative = []
    window._convertNative.push(function (ConvertNative) {
      const client = new ConvertNative({
        workspaceId: 'YOUR_WORKSPACE_ID',
        publicKey: 'YOUR_WORKSPACE_PUBLIC_KEY',
      })
      // use the client here
    })
   </script>
   ```

## Enabling push notifications

To enable push notifications you will need to setup a service worker.
If you need any assistance please contact your account manager.

1. Create the file sw.js with the content below.
   ```javascript
   importScripts('https://cdn.convertnative.com/sdks/browser/v1/service-worker.js')
   ```
2. Register the service worker through the ConvertNative client.
   ```javascript
   await client.registerServiceWorker({scriptURL: 'sw.js'})
   ```
3. Subscribe to push notifications.
   ```javascript
   await client.pushNotifications().subscribe()
   console.log('subscribed!')
   ```

## Tracking events

### List of trackable events

> [!TIP]
> [Don't hesitate to check event payload definitions here.](https://github.com/expected-so/convertnative-browser-sdk/blob/main/src/client/events.ts)

- `pageViewed`
- `productViewed`
- `searchSubmitted`
- `categoryViewed`
- `productAddedToCart`
- `productRemovedFromCart`
- `cartViewed`
- `checkoutStarted`
- `checkoutShippingInfoCompleted`
- `checkoutBillingInfoCompleted`
- `checkoutCompleted`

### Examples

```javascript
// Track a page view
client.events().pageViewed()

// Track search submitted
client.events().searchSubmitted({ query: 'Sneakers' })

// Track product added to cart
client.events().productAddedToCart({
   productID: '1',
   productName: 'Product A',
   productURL: 'https://...',
   variantID: '1-red',
   variantName: 'Red',
   quantity: 1,
   unitPrice: '12.43'
})
```

### Set user details

> [!NOTE]  
> User details are not stored and must be set on every ConvertNative client instantiation.

```javascript
// Set details
client.events().setUserDetails({
   id: 1,
   email: 'user@example.com',
   firstName: 'John',
   lastName: 'Doe',
})
// Clear user details
client.events().setUserDetails(null)
```
