import type {Client} from "./index.ts";

export default class PushNotifications {
	constructor(private client: Client) {}

	async subscribe(): Promise<void> {
		if (!('Notification' in window)) {
			throw new PushNotificationsUnsupportedError()
		} else if (!this.client.serviceWorker) {
			throw new ServiceWorkerNotRegisteredError()
		}

		const { key } = await this.client.request({path: `/browser/v1/installations/${this.client.installationId}/vapid`})
		const applicationServerKey = new Uint8Array(key)
		const currentSubscription = await this.client.serviceWorker.pushManager.getSubscription()
		if (currentSubscription) {
			const currentApplicationServerKey = new Uint8Array(currentSubscription.options.applicationServerKey!)
			if (!this.isKeyEqual(currentApplicationServerKey, applicationServerKey)) {
				await currentSubscription.unsubscribe()
			}
		}

		const subscription = await this.client.serviceWorker.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey,
		})
		const jsonSubscription = subscription.toJSON()
		await this.client.request({
			method: 'PATCH',
			path: `/browser/v1/installations/${this.client.installationId}`,
			body: JSON.stringify({
				platform: 'web',
				push_provider: 'web_push',
				push_enabled: true,
				push_endpoint: jsonSubscription.endpoint,
				push_p256dh_key: jsonSubscription.keys?.p256dh,
				push_auth_key: jsonSubscription.keys?.auth,
			})
		})
	}

	private isKeyEqual(current: Uint8Array, expected: Uint8Array): boolean {
		if (current.length !== expected.length) {
			return false
		}

		for (let i = 0; i < current.length; i++) {
			if (current[i] !== expected[i]) {
				return false
			}
		}
		return true
	}
}

export class PushNotificationsUnsupportedError extends Error {
	constructor() {
		super('Notifications are not supported by this browser.');
	}
}

export class ServiceWorkerNotRegisteredError extends Error {
	constructor() {
		super('You must pass a service worker.');
	}
}
