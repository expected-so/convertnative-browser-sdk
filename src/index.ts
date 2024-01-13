import Client from "./client.ts";

export { default as Client } from './client.ts'

if ('_cnCallbacks' in window && Array.isArray(window._cnCallbacks)) {
	window._cnCallbacks.forEach((cb) => cb(Client))
	delete window._cnCallbacks
}
