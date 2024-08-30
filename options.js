async function saveOptions(e) {
    e.preventDefault();
    const includeTitle = document.querySelector("#option-include-title").checked;
    const orderedList = document.querySelector("#option-ordered-list").checked;
    const filterHttp = document.querySelector("#option-filter-http").checked;
    const filterActive = document.querySelector("#option-filter-active").checked;
    const groupDomain = document.querySelector("#option-group-domain").checked;
    const notifications = document.querySelector("#option-general-notifications").checked;
    const rememberPreferences = document.querySelector("#option-general-remember").checked;

    const pinnedTabsOption = document.querySelector("#pinned-tabs-options").value;
    const outputFormat = document.querySelector("#output-format").value;

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
}

async function restoreOptions() {
    let {
        includeTitle,
        orderedList,
        filterHttp,
        filterActive,
        groupDomain,
        pinnedTabsOption,
        outputFormat,
        notifications,
        rememberPreferences
    } = await browser.storage.sync.get([
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

    document.querySelector("#option-include-title").checked = includeTitle || false;
    document.querySelector("#option-ordered-list").checked = orderedList || false;
    document.querySelector("#option-filter-http").checked = filterHttp || false;
    document.querySelector("#option-filter-active").checked = filterActive || false;
    document.querySelector("#option-group-domain").checked = groupDomain || false;
    document.querySelector("#option-general-notifications").checked = notifications || false;
    document.querySelector("#option-general-remember").checked = rememberPreferences || false;

    document.querySelector("#pinned-tabs-options").value = pinnedTabsOption || 'all-tabs';
    document.querySelector("#output-format").value = outputFormat || 'plain';
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#options-form").addEventListener("submit", saveOptions);
