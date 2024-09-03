import './sass/style.scss';

import pLimit from 'p-limit';

import { registerSW } from 'virtual:pwa-register';
import { toggleColorMode } from './js/theme.js';
import { copyTextFromInput, downloadFile, handleDrop, handleTextFiles } from './js/utils.js';
import { getUUID } from './js/api.js';
import createUUID from './js/uuid.js';

const highlightWorker = new Worker(new URL('./js/highlightWorker.js', import.meta.url), { type: 'module' });

document.addEventListener('DOMContentLoaded', async function () {
	const button = document.querySelector('.form__button');
	const input = document.querySelector('.form__input');
	const nicknamesOption = document.querySelector('.form__option-wrapper--nicknames');
	const resultWrapper = document.querySelector('.form__result-wrapper');
	const result = resultWrapper?.querySelector('.form__result code');
	const loader = resultWrapper?.querySelector('.loading');
	const resultOption = document.querySelector('.form__option-wrapper--result');
	const copyButton = document.querySelector('.form-btn--copy');
	const copyButtonIcon = document.querySelector('.form-btn__icon--copy use');
	const downloadButton = document.querySelector('.form-btn__icon--download');
	const uploadButton = document.querySelector('.form__uploader');
	const clearButton = document.querySelector('.form-btn--clear');

	function getResultOptionValue() {
		return resultOption?.querySelector('input[name="export"]:checked').value;
	}

	function displayLoader() {
		resultWrapper?.classList.add('form__result-wrapper--loading');
		loader?.classList.add('loading--visible');
	}

	function hideLoader() {
		resultWrapper?.classList.remove('form__result-wrapper--loading');
		loader?.classList.remove('loading--visible');
	}

	function getNicknamesOptionValue() {
		return nicknamesOption?.querySelector('input[name="import"]:checked').value;
	}

	function formatPair(username, uuid, format) {
		if (format === 'json') {
			return {
				uuid: uuid,
				name: username,
			};
		} else if (format === 'txt') {
			return `${username} - ${uuid}`;
		}
	}

	async function generatePairs(format, type) {
		const usernames = input.value.split('\n').filter((i) => i);
		let generatedPairs = [];

		let promises;

		if (type === 'online') {
			const limit = pLimit(10);
			displayLoader();

			promises = usernames.map(async (username) =>
				limit(async () => {
					try {
						const uuid = await getUUID(username);
						const formattedPair = formatPair(username, uuid, format);
						generatedPairs.push(formattedPair);
					} catch (error) {
						console.error(error);
					}
				}),
			);
		} else {
			promises = usernames.map(async (username) => {
				const uuid = await createUUID(username);
				const formattedPair = formatPair(username, uuid, format);
				generatedPairs.push(formattedPair);
			});
		}

		await Promise.all(promises);
		hideLoader();

		format = generatedPairs.length && format === 'json' ? 'json' : 'text';

		const codeToHighlight = format === 'json' ? JSON.stringify(generatedPairs, null, 2) : generatedPairs.join('\n');

		// Use the Web Worker to highlight the code
		highlightWorker.postMessage({ code: codeToHighlight, language: format === 'json' ? 'json' : 'plaintext' });

		highlightWorker.onmessage = (event) => {
			result.innerHTML = event.data;

			result?.classList.add('hljs');
			result?.classList.toggle('language-json', format === 'json');
			result?.classList.toggle('language-plaintext', format !== 'json');
		};
	}

	button?.addEventListener('click', async () => {
		await generatePairs(getResultOptionValue(), getNicknamesOptionValue());
	});

	const resultInputs = resultOption?.querySelectorAll('input');

	resultInputs?.forEach((resultInput) => {
		resultInput?.addEventListener('click', async () => {
			await generatePairs(getResultOptionValue(), getNicknamesOptionValue());
		});
	});

	copyButton?.addEventListener('click', () => {
		copyTextFromInput(result, copyButtonIcon);
	});

	downloadButton?.addEventListener('click', () => {
		const resultValue = result.innerText;
		if (resultValue !== '') {
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
			downloadFile(fileName + getResultOptionValue(), resultValue);
		}
	});

	async function updateInputFromFile(file) {
		let text = await file.text();
		input.value += input.textContent || text;
	}

	uploadButton?.addEventListener('change', async (e) => {
		let files = e.target.files;
		await handleTextFiles(files, updateInputFromFile);
		await generatePairs(getResultOptionValue(), getNicknamesOptionValue());
	});

	['dragenter', 'dragover'].forEach((e) => {
		input?.addEventListener(e, highlight, false);
	});
	['dragleave', 'drop'].forEach((e) => {
		input?.addEventListener(e, unhighlight, false);
	});

	input?.addEventListener(
		'drop',
		(e) => {
			handleDrop(e, async (files) => {
				await handleTextFiles(files, updateInputFromFile);
				await generatePairs(getResultOptionValue(), getNicknamesOptionValue());
			});
		},
		false,
	);

	function hideClearBtn() {
		clearButton?.classList.add('form-btn--hidden');
	}

	function showClearBtn() {
		clearButton?.classList.remove('form-btn--hidden');
	}

	clearButton?.addEventListener('click', function () {
		input.value = '';
		hideClearBtn();
	});

	input?.addEventListener('input', async function () {
		if (input.value === '') {
			hideClearBtn();
		} else if (input.value !== '') {
			showClearBtn();
		}
	});

	function highlight(e) {
		input?.classList.add('form__input--highlight');
	}

	function unhighlight(e) {
		input?.classList.remove('form__input--highlight');
	}

	// Get the buttons in the DOM
	const toggleColorButtons = document.querySelectorAll('.color-mode-btn');

	// Set up event listeners
	toggleColorButtons?.forEach((btn) => {
		btn?.addEventListener('click', toggleColorMode);
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
