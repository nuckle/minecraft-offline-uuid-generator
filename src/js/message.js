export const createMessageElement = () => {
	const messageBox = document.createElement('div');
	messageBox.classList.add('message-box');

	const messageText = document.createElement('p');
	messageText.classList.add('message-box__text');
	messageText.textContent = 'Failed to fetch some nicknames';
	messageBox.appendChild(messageText);

	const body = document.querySelector('body');
	body.appendChild(messageBox);

	setTimeout(() => messageBox.classList.add('message-box--animate'), 100);

	return messageBox;
};

export const removeMessageElement = (messageEl) => {
	setTimeout(() => {
		messageEl.classList.remove('message-box--animate');
		messageEl.addEventListener('transitioned', () => {
			messageEl.remove();
		});
	}, 2000);
};
