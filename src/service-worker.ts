/// <reference no-default-lib="true"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;

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

	const request = fetch(`${payload.origin.endpoint}/browser/v1/push_notification_deliveries/${payload.id}/opened`, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${btoa(`${payload.origin.workspace_id}:${payload.origin.public_key}`)}`,
			'content-type': 'application/json',
		},
	})
	event.waitUntil(request)
})

// We need an export to force this file to act like a module, so TS will let us re-type `self`
export default null
