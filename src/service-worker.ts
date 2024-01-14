/// <reference no-default-lib="true"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;

const workerURL = new URL(self.serviceWorker.scriptURL)
const endpoint = workerURL.searchParams.get('endpoint')
const workspaceId = workerURL.searchParams.get('workspace_id')
const publicKey = workerURL.searchParams.get('public_key')
const installationId = workerURL.searchParams.get('installation_id')
if (!endpoint || !workspaceId || !publicKey || !installationId) {
	throw new Error(`Invalid worker URL ${workerURL}`)
}

self.addEventListener('push', (event: PushEvent) => {
	const payload = event.data?.json()
	if (!payload) {
		return
	}

	self.registration.showNotification(payload.title, {
		icon: payload.icon,
		body: payload.body,
		tag: payload.id,
		data: payload,
	})
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
	const payload = event.notification.data
	if (!payload) {
		return
	}

	const request = fetch(`${endpoint}/browser/v1/push_notification_deliveries/${payload.id}/opened`, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${btoa(`${workspaceId}:${publicKey}`)}`,
			'content-type': 'application/json',
		},
	})
	const promises: Promise<any>[] = [request]
	if (payload.url) {
		promises.push(self.clients.openWindow(payload.url))
	}
	event.notification.close()
	event.waitUntil(Promise.all(promises))
})

// We need an export to force this file to act like a module, so TS will let us re-type `self`
export default null
