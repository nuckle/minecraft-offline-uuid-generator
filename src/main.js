import createUUID from './js/uuid.js';
import { registerSW } from 'virtual:pwa-register';

document.addEventListener('DOMContentLoaded', function () {
	const button = document.querySelector('.form__button');
	const input = document.querySelector('.form__input');
	const result = document.querySelector('.form__result');
	const option = document.querySelector('.form__option-wrapper');
	const copyButton = document.querySelector('.form-btn--copy');
	const copyButtonIcon = document.querySelector('.form-btn__icon--copy use');
	const downloadButton = document.querySelector('.form-btn__icon--download');
	const uploadButton = document.querySelector('.form__uploader');

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

		result.value = format === 'json' ? JSON.stringify(generatedPairs, null, 2) : generatedPairs.join('\n');
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

	uploadButton.addEventListener('change', async (e) => {
		let file = e.target.files[0];
		let text = await file.text();
		console.log(text);

		input.value += input.textContent || text;
	});

	const toggleColorMode = (e) => {
		// Switch to Light Mode
		if (e.currentTarget.classList.contains('light--hidden')) {
			// Sets the custom HTML attribute
			document.documentElement.setAttribute('color-mode', 'light');

			//Sets the user's preference in local storage
			localStorage.setItem('color-mode', 'light');
			return;
		}

		/* Switch to Dark Mode
        Sets the custom HTML attribute */
		document.documentElement.setAttribute('color-mode', 'dark');

		// Sets the user's preference in local storage
		localStorage.setItem('color-mode', 'dark');
	};

	// Get the buttons in the DOM
	const toggleColorButtons = document.querySelectorAll('.color-mode-btn');

	// Set up event listeners
	toggleColorButtons.forEach((btn) => {
		btn.addEventListener('click', toggleColorMode);
	});

	if (
		/* This condition checks whether the user has set a site preference for dark mode OR a OS-level preference for Dark Mode AND no site preference */
		localStorage.getItem('color-mode') === 'dark' ||
		(window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('color-mode'))
	) {
		// if true, set the site to Dark Mode
		document.documentElement.setAttribute('color-mode', 'dark');
	}

	registerSW({
		immediate: true,
	});
});
