async function saveOptions(e) {
    e.preventDefault();
    const includeTitle = document.querySelector("#option-include-title").checked;
    const orderedList = document.querySelector("#option-ordered-list").checked;
    const filterDomain = document.querySelector("#option-filter-domain").checked;
    const filterHttp = document.querySelector("#option-filter-http").checked;
    const filterActive = document.querySelector("#option-filter-active").checked;
    const filterPinned = document.querySelector("#option-filter-pinned").checked;
    const filterChoose = document.querySelector("#option-filter-choose").checked;
    const groupDomain = document.querySelector("#option-group-domain").checked;
    const plainText = document.querySelector("#option-plain-text").checked;
    const markdown = document.querySelector("#option-markdown").checked;
    const json = document.querySelector("#option-json").checked;
    const csv = document.querySelector("#option-csv").checked;
    const notifications = document.querySelector("#option-general-notifications").checked;
    const rememberPreferences = document.querySelector("#option-general-remember").checked;

    await browser.storage.sync.set({
        includeTitle,
        orderedList,
        filterDomain,
        filterHttp,
        filterActive,
        filterPinned,
        filterChoose,
        groupDomain,
        plainText,
        markdown,
        json,
        csv,
        notifications,
        rememberPreferences
    });
    alert('Options saved.');
}

async function restoreOptions() {
    let {
        includeTitle,
        orderedList,
        filterDomain,
        filterHttp,
        filterActive,
        filterPinned,
        filterChoose,
        groupDomain,
        plainText,
        markdown,
        json,
        csv,
        notifications,
        rememberPreferences
    } = await browser.storage.sync.get([
        'includeTitle',
        'orderedList',
        'filterDomain',
        'filterHttp',
        'filterActive',
        'filterPinned',
        'filterChoose',
        'groupDomain',
        'plainText',
        'markdown',
        'json',
        'csv',
        'notifications',
        'rememberPreferences'
    ]);

    document.querySelector("#option-include-title").checked = includeTitle || false;
    document.querySelector("#option-ordered-list").checked = orderedList || false;
    document.querySelector("#option-filter-domain").checked = filterDomain || false;
    document.querySelector("#option-filter-http").checked = filterHttp || false;
    document.querySelector("#option-filter-active").checked = filterActive || false;
    document.querySelector("#option-filter-pinned").checked = filterPinned || false;
    document.querySelector("#option-filter-choose").checked = filterChoose || false;
    document.querySelector("#option-group-domain").checked = groupDomain || false;
    document.querySelector("#option-plain-text").checked = plainText || false;
    document.querySelector("#option-markdown").checked = markdown || false;
    document.querySelector("#option-json").checked = json || false;
    document.querySelector("#option-csv").checked = csv || false;
    document.querySelector("#option-general-notifications").checked = notifications || false;
    document.querySelector("#option-general-remember").checked = rememberPreferences || false;
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#options-form").addEventListener("submit", saveOptions);
