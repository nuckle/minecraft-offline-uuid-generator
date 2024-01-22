import MD5 from 'crypto-js/md5';

function createUUID(name) {
	if (typeof name !== 'string') {
		throw new TypeError("'name' should be a string!");
	}

	return new Promise((res) => {
		setTimeout(() => {
			const input = 'OfflinePlayer:' + name;
			const hash = MD5(input);

			// https://www.rfc-editor.org/rfc/rfc4122#section-4.3
			const byteArray = [];
			for (let i = 0; i < 16; i++) {
				byteArray.push((hash.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
			}

			byteArray[6] = (byteArray[6] & 0x0f) | 0x30;
			byteArray[8] = (byteArray[8] & 0x3f) | 0x80;

			res(splittedUUID(toHexString(byteArray)));
		});
	});
}

function toHexString(byteArray) {
	return byteArray
		.map((byte) => ('0' + (byte & 0xff).toString(16)).slice(-2))
		.join('');
}

function splittedUUID(uuid) {
	return [
		uuid.substring(0, 8),
		uuid.substring(8, 12),
		uuid.substring(12, 16),
		uuid.substring(16, 20),
		uuid.substring(20, 32),
	].join('-');
}

export default createUUID;
