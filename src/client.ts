import { v4 as uuid } from 'uuid'
import Cookie from 'js-cookie'
import PushNotifications from "./push-notifications.ts";
import serviceWorkerURL from './service-worker.ts?url'

export default class Client {
	public workspaceId: string
	public publicKey: string
	public endpoint: string
	public serviceWorker: ServiceWorkerRegistration | undefined
	private _pushNotifications: PushNotifications | undefined

	constructor(opts: {
		workspaceId: string, publicKey: string, endpoint?: string, serviceWorker?: ServiceWorkerRegistration
	}) {
		this.workspaceId = opts.workspaceId
		this.publicKey = opts.publicKey
		this.endpoint = opts.endpoint || 'https://api.convertnative.com'
		this.serviceWorker = opts.serviceWorker
	}

	get installationId() {
		const found = Cookie.get('convertnative_installation_id')
		if (found) {
			return found
		}

		const installationId = uuid()
		const oneYearInSecond = 1000*60*60*24*365
		Cookie.set('convertnative_installation_id', installationId, {path: '/', expires: oneYearInSecond})
		return installationId
	}

	async request(opts: { path: string, method?: string, body?: FormData | string }) {
		const url = new URL(this.endpoint)
		url.pathname = opts.path
		return fetch(url, {
			method: opts.method || 'GET',
			body: opts.body,
			headers: {
				authorization: `Bearer ${btoa(`${this.workspaceId}:${this.publicKey}`)}`,
				'content-type': 'application/json',
			},
		})
			.then(async (res) => {
				if (!res.ok) {
					throw new InvalidResponseError(res)
				}
				return res.json()
			})
	}

	pushNotifications() {
		if (!this._pushNotifications) {
			this._pushNotifications = new PushNotifications(this)
		}
		return this._pushNotifications
	}

	async registerServiceWorker(opts?: RegistrationOptions) {
		if (!('serviceWorker' in navigator)) {
			throw new ServiceWorkerUnsupportedError()
		}
		this.serviceWorker = await navigator.serviceWorker.register(serviceWorkerURL, opts ?? { scope: '/' })
	}
}

export class ServiceWorkerUnsupportedError extends Error {
	constructor() {
		super('Service workers are not supported by this browser.');
	}
}

export class InvalidResponseError extends Error {
	constructor(res: Response) {
		super(`Invalid response ${res.status} (${res.statusText})`)
	}
}