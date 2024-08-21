browser.browserAction.onClicked.addListener(() => {
    browser.tabs.query({}).then(tabs => {
        let urls = tabs.map(tab => tab.url);
        copyToClipboard(urls.join('\n'));
    });
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

