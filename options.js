const defaultOptions = {
    includeTitle: false,
    orderedList: false,
    filterHttp: false,
    filterActive: false,
    groupDomain: false,
    pinnedTabsOption: 'all-tabs',
    outputFormat: 'plain',
    notifications: true,
    rememberPreferences: true, 
};

async function saveOptions(e) {
    e.preventDefault();
    const includeTitle = document.querySelector("#option-include-title").checked;
    let orderedList = document.querySelector("#option-ordered-list").checked;
    const filterHttp = document.querySelector("#option-filter-http").checked;
    const filterActive = document.querySelector("#option-filter-active").checked;
    const groupDomain = document.querySelector("#option-group-domain").checked;
    const notifications = document.querySelector("#option-general-notifications").checked;
    const rememberPreferences = document.querySelector("#option-general-remember").checked;

    const outputFormat = document.querySelector("#output-format").value;
    const pinnedTabsOption = document.querySelector("#pinned-tabs-options").value;

    if (outputFormat === 'json') {
        orderedList = false;
    }

    if (rememberPreferences) {
        await browser.storage.sync.set({
            includeTitle,
            orderedList,
            filterHttp,
            filterActive,
            groupDomain,
            pinnedTabsOption,
            outputFormat,
            notifications,
            rememberPreferences
        });
        alert('Options saved.');
    } else {
        await browser.storage.sync.clear();
        await browser.storage.sync.set(defaultOptions);
    }

}

async function restoreOptions() {
    let storedOptions = await browser.storage.sync.get([
        'includeTitle',
        'orderedList',
        'filterHttp',
        'filterActive',
        'groupDomain',
        'pinnedTabsOption',
        'outputFormat',
        'notifications',
        'rememberPreferences'
    ]);

    document.querySelector("#option-include-title").checked = storedOptions.includeTitle ?? defaultOptions.includeTitle;
    document.querySelector("#option-ordered-list").checked = storedOptions.orderedList ?? defaultOptions.orderedList;
    document.querySelector("#option-group-domain").checked = storedOptions.groupDomain ?? defaultOptions.groupDomain;
    document.querySelector("#option-filter-http").checked = storedOptions.filterHttp ?? defaultOptions.filterHttp;
    document.querySelector("#option-filter-active").checked = storedOptions.filterActive ?? defaultOptions.filterActive;
    document.querySelector("#pinned-tabs-options").value = storedOptions.pinnedTabsOption ?? defaultOptions.pinnedTabsOption;
    document.querySelector("#output-format").value = storedOptions.outputFormat ?? defaultOptions.outputFormat;
    document.querySelector("#option-general-notifications").checked = storedOptions.notifications ?? defaultOptions.notifications;
    document.querySelector("#option-general-remember").checked = storedOptions.rememberPreferences ?? defaultOptions.rememberPreferences;

}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#options-form").addEventListener("submit", saveOptions);
