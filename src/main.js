import createUUID from './js/uuid.js';

document.addEventListener('DOMContentLoaded', function() {
	const button = document.querySelector('.form__button');
	const input = document.querySelector('.form__input');
	const result = document.querySelector('.form__result');
	const option = document.querySelector('.form__option-wrapper');
	const copyButton = document.querySelector('.form-btn--copy');
	const copyButtonIcon = document.querySelector('.form-btn__icon--copy use');
	const downloadButton = document.querySelector('.form-btn__icon--download');

	function getOptionValue() {
		return document.querySelector('input[name="export"]:checked').value;
	}

	async function generatePairs(format) {
		const usernames = input.value.split('\n').filter((i) => i);
		let generatedPairs = [];

		for (const username of usernames) {
			const uuid = await createUUID(username);
			if (format === 'json') {
				generatedPairs.push({
					uuid: uuid,
					name: username,
				});
			} else if (format === 'txt') {
				generatedPairs.push(`${username} - ${uuid}`);
			}
		}

		format = (generatedPairs.length && format === 'json') == 0 ? 'text' : 'json';

		result.value =
			format === 'json'
				? JSON.stringify(generatedPairs)
				: generatedPairs.join('\n');
	}

	button.addEventListener('click', () => {
		generatePairs(getOptionValue());
	});

	option.addEventListener('click', () => {
		button.click();
	});

	copyButton.addEventListener('click', () => {
		if (result.value !== '') {
			navigator.clipboard.writeText(result.value);
			copyButtonIcon.setAttribute('href', './img/sprite.svg#check');
			setTimeout(() => {
				copyButtonIcon.removeAttribute('href', './img/sprite.svg#check');
			}, 350);
		}
	});

	function download(filename, data) {
		const blob = new Blob([data], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();

		URL.revokeObjectURL(url);
	}

	downloadButton.addEventListener('click', () => {
		if (result.value !== '') {
			const now = new Date();
			const fileName =
				'uuid' +
				'-' +
				now.getFullYear() +
				'-' +
				('0' + now.getDate()).slice(-2) +
				'-' +
				('0' + (now.getMonth() + 1)).slice(-2) +
				'-' +
				('0' + now.getHours()).slice(-2) +
				'-' +
				('0' + now.getMinutes()).slice(-2) +
				'-' +
				('0' + now.getSeconds()).slice(-2) +
				'.';
			download(fileName + getOptionValue(), result.value);
		}
	});

});
