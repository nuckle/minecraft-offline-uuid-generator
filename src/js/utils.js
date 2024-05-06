export function copyTextFromInput(input, copyBtn) {
    if (input.value !== '') {
        navigator.clipboard.writeText(input.value);
        copyBtn.setAttribute('href', './img/sprite.svg#check');
        setTimeout(() => {
            copyBtn.removeAttribute('href', './img/sprite.svg#check');
        }, 350);
    }
}

export function downloadFile(filename, data) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

export async function handleTextFiles(files, fileCallback) {
    const promises = [...files].map(fileCallback);
    await Promise.all(promises);
}

export async function handleDrop(e, dropCallback) {
    e.preventDefault();
    let dt = e.dataTransfer;
    let files = dt.files;

    dropCallback(files)
}
