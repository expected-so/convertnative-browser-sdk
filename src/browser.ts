import Client from "./client";

if ('_convertNative' in window && Array.isArray(window._convertNative)) {
	window._convertNative.forEach((cb) => cb(Client))
	delete window._convertNative
}
