import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);

self.onmessage = (event) => {
    const { code, language } = event.data;

    const result = hljs.highlight(code, { language });

    // Post the result back to the main thread
    self.postMessage(result.value);
};
