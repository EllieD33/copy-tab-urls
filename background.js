// Core logic
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

function formatTabs(tabs, includeTitle, orderedList, outputFormat) {
    return tabs.map((tab, index) => {
        let line = '';
        const shouldIncludeTitle = outputFormat === 'markdown' || (includeTitle && tab.title);
        if (orderedList) {
            line += `${index + 1}. `;
        }
        if (shouldIncludeTitle) {
            line += `${tab.title} - `;
        }
        line += tab.url;
        return line;
    }).join('\n');
}

function groupTabsByDomain(tabs) {
    return tabs.reduce((groups, tab) => {
        let domain;
        try {
            domain = (new URL(tab.url)).hostname || 'internal URIs';
        } catch (e) {
            domain = 'internal URIs';
        }
        if (!groups[domain]) {
            groups[domain] = []
        }
        groups[domain].push(tab);
        return groups;
    }, {});
}

function formatGroupedTabs(groupedTabs, includeTitle, orderedList, outputFormat) {
    let output = '';
    for (const domain in groupedTabs) {
        output += `Domain: ${domain}\n`;
        output += formatTabs(groupedTabs[domain], includeTitle, orderedList, outputFormat);
        output += '\n\n';
    }
    return output.trim();
}

function convertToMarkdown(plaintext) {
    const lines = plaintext.trim().split('\n');
    const isOrderedList = /^\d+\.\s/.test(lines[0].trim());

    const markdownLines = lines.map((line, index) => {
        line = line.trim();

        let match = line.match(/^(.*?)(?:\s*-\s*(https?:\/\/[^\s]+|about:[^\s]+|chrome:[^\s]+|resource:[^\s]+|file:[^\s]+|data:[^\s]+|javascript:[^\s]+|moz-extension:[^\s]+))$/i);

        if (match) {
            let title = match[1].trim();
            let url = match[2].trim();

            const isHttpUrl = /^https?:\/\//i.test(url);
            if (isHttpUrl) {
                return isOrderedList ? `${index + 1}. [${title}](${url})` : `- [${title}](${url})`;
            } else {
                return isOrderedList ? `${index + 1}. ${url}` : `- ${url}`;
            }
        } 
    });

    return markdownLines.join('\n');
}

function convertToJSON(plaintext) {
    const lines = plaintext.trim().split('\n');
    const groupedEntries = {};
    let currentDomain = 'Unknown'; 

    const urlPattern = /^(.*?)(?:\s*-\s*(https?:\/\/[^\s]+|about:[^\s]+|chrome:[^\s]+|resource:[^\s]+|file:[^\s]+|data:[^\s]+|javascript:[^\s]+|moz-extension:[^\s]+))$/i;

    const createJsonObject = (title, url) => ({ title, url });

    lines.forEach(line => {
        line = line.trim();

        if (line.startsWith('Domain: ')) {
            currentDomain = line.substring(8).trim() || 'Unknown';
            if (!groupedEntries[currentDomain]) {
                groupedEntries[currentDomain] = [];
            }
        } else if (line) {
            const match = line.match(urlPattern);
            if (match) {
                const title = match[1].trim();
                const url = match[2].trim();
                groupedEntries[currentDomain].push(createJsonObject(title, url));
            } else {
                groupedEntries[currentDomain].push(createJsonObject(line));
            }
        }
    });

    return JSON.stringify(groupedEntries, null, 2);
}

function convertToCSV(plaintext) {
    const lines = plaintext.trim().split('\n');
    const csvLines = [];
    let currentDomain = 'Unknown';

    const urlPattern = /^(.*?)(?:\s*-\s*(https?:\/\/[^\s]+|about:[^\s]+|chrome:[^\s]+|resource:[^\s]+|file:[^\s]+|data:[^\s]+|javascript:[^\s]+|moz-extension:[^\s]+))$/i;
    const domainPattern = /^Domain:\s*(.*)$/;

    lines.forEach(line => {
        line = line.trim();

        if (domainPattern.test(line)) {
            if (csvLines.length > 0) {
                csvLines.push(''); 
            }
            currentDomain = line.replace(domainPattern, '$1').trim() || 'Unknown';
            csvLines.push(`Domain: "${currentDomain}"`);
        } else if (line) {
            const match = line.match(urlPattern);
            let title = '';
            let url = '';

            if (match) {
                title = match[1].trim();
                url = match[2].trim();
            } else {
                if (/^(https?:\/\/[^\s]+|about:[^\s]+|chrome:[^\s]+|resource:[^\s]+|file:[^\s]+|data:[^\s]+|javascript:[^\s]+|moz-extension:[^\s]+)$/i.test(line)) {
                    url = line.trim();
                } else {
                    title = line.trim();
                }
            }

            title = url ? title : line;

            title = `"${title.replace(/"/g, '""')}"`;
            url = url ? `"${url.replace(/"/g, '""')}"` : '';

            csvLines.push(`${title},${url}`);
        }
    });

    return csvLines.join('\n');
}

async function handleClick() {
    try {
        const settings = await browser.storage.sync.get([
            'includeTitle',
            'orderedList',
            'filterHttp',
            'filterActive',
            'groupDomain',
            'pinnedTabsOption',
            'outputFormat',
            'notifications'
        ]);

        let queryOptions = {};
        if (settings.filterActive) {
            queryOptions.active = true;
        }

        const tabs = await browser.tabs.query(queryOptions);
        let filteredTabs = tabs;

        if (settings.pinnedTabsOption === 'exclude-pinned') {
            filteredTabs = filteredTabs.filter(tab => !tab.pinned);
        } else if (settings.pinnedTabsOption === 'pinned-only') {
            filteredTabs = filteredTabs.filter(tab => tab.pinned);
        }

        if (settings.filterHttp) {
            filteredTabs = filteredTabs.filter(tab => tab.url.startsWith('http'));
        }

        let output;
        if (settings.groupDomain) {
            const groupedTabs = groupTabsByDomain(filteredTabs);
            output = formatGroupedTabs(groupedTabs, settings.includeTitle, settings.orderedList, settings.outputFormat);
        } else {
            output = formatTabs(filteredTabs, settings.includeTitle, settings.orderedList, settings.outputFormat);
        }

        if (settings.outputFormat === 'markdown') {
            output = convertToMarkdown(output);
        } else if (settings.outputFormat === 'json') {
            output = convertToJSON(output);
        } else if (settings.outputFormat === 'csv') {
            output = convertToCSV(output);
        }

        copyToClipboard(output);
        if (settings.notifications) {
            createNotification();
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

browser.browserAction.onClicked.addListener(handleClick);


// Notification logic
function createNotification() {
    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icon.png"),
        "title": "Success",
        "message": "Tab URLs copied to clipboard."
    });
}

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
