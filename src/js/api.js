export async function getUUID(username) {
	try {
		const response = await fetch(`https://api.ashcon.app/mojang/v2/uuid/${username}`);

		if (response.ok) {
			return await response.text();
		} else {
			throw new Error('Error acces api.ashcon.app');
		}
	} catch (error) {
		throw new Error(error);
	}
}
