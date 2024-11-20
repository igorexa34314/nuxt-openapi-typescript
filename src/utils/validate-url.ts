/* eslint-disable */
// Private function
// Internal URI splitter method - direct from RFC 3986
function splitUri(uri: string) {
	return uri.match(/(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/);
}

export function isUri(value: string) {
	if (!value) return;

	// Check for illegal characters
	if (/[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i.test(value)) return;

	// Check for hex escapes that aren't complete
	if (/%[^0-9a-f]/i.test(value)) return;
	if (/%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) return;

	const splitted = splitUri(value)!;
	const scheme = splitted[1];
	const authority = splitted[2];
	const path = splitted[3];
	const query = splitted[4];
	const fragment = splitted[5];

	// Scheme and path are required, though the path can be empty
	if (!(scheme && scheme.length && path.length >= 0)) return;

	// If authority is present, the path must be empty or begin with a /
	if (authority && authority.length) {
		if (!(path.length === 0 || /^\//.test(path))) return;
	} else {
		// If authority is not present, the path must not start with //
		if (/^\/\//.test(path)) return;
	}

	// Scheme must begin with a letter, then consist of letters, digits, +, ., or -
	if (!/^[a-z][a-z0-9\+\-\.]*$/.test(scheme.toLowerCase())) return;

	// Re-assemble the URL per section 5.3 in RFC 3986
	let out = scheme + ':';
	if (authority && authority.length) {
		out += '//' + authority;
	}

	out += path;

	if (query && query.length) {
		out += '?' + query;
	}

	if (fragment && fragment.length) {
		out += '#' + fragment;
	}

	return out;
}

export function isHttpUri(value: string, allowHttps: boolean = false) {
	if (!isUri(value)) return;

	const splitted = splitUri(value)!;
	const scheme = splitted[1];
	const authority = splitted[2];
	const path = splitted[3];
	const query = splitted[4];
	const fragment = splitted[5];

	if (!scheme) return;

	if (allowHttps) {
		if (scheme.toLowerCase() !== 'https') return;
	} else {
		if (scheme.toLowerCase() !== 'http') return;
	}

	// Fully-qualified URIs must have an authority section that is a valid host
	if (!authority) return;

	let port = '';
	if (/:(\d+)$/.test(authority)) {
		port = authority.match(/:(\d+)$/)![0];
	}

	let out = scheme + '://' + authority.replace(/:\d+$/, '');
	if (port) out += port;

	out += path;
	if (query && query.length) out += '?' + query;
	if (fragment && fragment.length) out += '#' + fragment;

	return out;
}

export function isHttpsUri(value: string) {
	return isHttpUri(value, true);
}

export function isWebUri(value: string) {
	return isHttpUri(value) || isHttpsUri(value);
}
