function updateIconBasedOnTheme() {
    browser.theme.getCurrent().then((theme) => {
        if (theme.colors && theme.colors.frame) {
            if (isDarkTheme(theme.colors.frame)) {
                browser.browserAction.setIcon({
                    path: "icons/copy_all_dark.png",
                });
            } else {
                browser.browserAction.setIcon({
                    path: "icons/copy_all_light.png",
                });
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
