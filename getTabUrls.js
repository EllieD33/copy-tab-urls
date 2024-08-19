function updateIconBasedOnTheme() {
  browser.theme.getCurrent().then((theme) => {
    if (theme.colors && theme.colors.frame) {
      if (isDarkTheme(theme.colors.frame)) {
        browser.browserAction.setIcon({ path: "icons/copy_all_dark.png" });
      } else {
        browser.browserAction.setIcon({ path: "icons/copy_all_light.png" });
      }
    } else {
      browser.browserAction.setIcon({ path: "icons/copy_all_light.png" });
    }
  });
}

function isDarkTheme(frameColor) {
  let rgb = frameColor.match(/\d+/g).map(Number);
  let luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance < 0.5;
}

browser.theme.onUpdated.addListener(updateIconBasedOnTheme);
updateIconBasedOnTheme();


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

