//Core logic
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

function formatTabs(tabs, includeTitle, orderedList) {
    return tabs.map((tab, index) => {
        let line = '';
        if (orderedList) {
            line += `${index + 1}. `;
        }
        if (includeTitle && tab.title) {
            line += `${tab.title} - `;
        }
        line += tab.url;
        return line;
    }).join('\n');
}

function groupTabsByDomain(tabs) {
    return tabs.reduce((groups, tab) => {
        const domain = (new URL(tab.url)).hostname;
        if (!groups[domain]) {
            groups[domain] = []
        }
        groups[domain].push(tab);
        return groups;
    }, {});
}

function formatGroupedTabs(groupedTabs, includeTitle, orderedList) {
    let output = '';
    for (const domain in groupedTabs) {
        output += `Domain: ${domain}\n`;
        output += formatTabs(groupedTabs[domain], includeTitle, orderedList);
        output += '\n\n';
    }
    return output.trim();
}

async function handleClick() {
    try {
        const settings = await browser.storage.sync.get([
            'includeTitle',
            'orderedList',
            'filterDomain',
            'filterHttp',
            'filterActive',
            'filterPinned',
            'filterChoose',
            'groupDomain'
        ]);

        let queryOptions = {};
        if (settings.filterActive) {
            queryOptions.active = true;
        }

        const tabs = await browser.tabs.query(queryOptions);
        let filteredTabs = tabs;

        if (settings.filterPinned) {
            filteredTabs = filteredTabs.filter(tab => !tab.pinned);
        }

        if (settings.filterHttp) {
            filteredTabs = filteredTabs.filter(tab => tab.url.startsWith('http'));
        }

        let output;
        if (settings.groupDomain) {
            const groupedTabs = groupTabsByDomain(filteredTabs);
            output = formatGroupedTabs(groupedTabs, settings.includeTitle, settings.orderedList);
        } else {
            output = formatTabs(filteredTabs, settings.includeTitle, settings.orderedList);
        }
        
        copyToClipboard(output);
    } catch (err) {
        console.error('Error:', err);
    }
}

browser.browserAction.onClicked.addListener(handleClick);


// Theme logic
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
