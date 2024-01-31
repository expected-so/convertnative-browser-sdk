import { v4 as uuid } from 'uuid'
import Cookie from 'js-cookie'
import PushNotifications from "./push-notifications";
import Events from "./events";

export default class Client {
	public workspaceId: string
	public publicKey: string
	public endpoint: string
	public serviceWorker: ServiceWorkerRegistration | undefined
	private _pushNotifications: PushNotifications | undefined
	private _events: Events | undefined

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

	events() {
		if (!this._events) {
			this._events = new Events(this)
		}
		return this._events
	}

	async registerServiceWorker(opts: { registrationOptions?: RegistrationOptions, scriptURL: string | URL  }) {
		if (!('serviceWorker' in navigator)) {
			throw new ServiceWorkerUnsupportedError()
		}

		const scriptURL = opts.scriptURL.toString().split('?')[0]
		const searchParams = new URLSearchParams()
		searchParams.set('endpoint', this.endpoint)
		searchParams.set('workspace_id', this.workspaceId)
		searchParams.set('public_key', this.publicKey)
		searchParams.set('installation_id', this.installationId)
		const url = `${scriptURL}?${searchParams}`
		this.serviceWorker = await navigator.serviceWorker.register(url, opts.registrationOptions)
		if (this.serviceWorker?.active?.scriptURL) {
			const serviceWorkerURL = new URL(this.serviceWorker.active?.scriptURL)
			const hasValidConfiguration = Array.from(searchParams.entries())
				.every(([key, value]) => serviceWorkerURL.searchParams.get(key) === value)
			if (!hasValidConfiguration) {
				await this.serviceWorker.unregister()
				this.serviceWorker = await navigator.serviceWorker.register(url, opts.registrationOptions)
			}
		}
		return this.serviceWorker
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
