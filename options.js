document.addEventListener('DOMContentLoaded', function() {
    const options = {
        includeTitle: document.getElementById('option-include-title'),
        orderedList: document.getElementById('option-ordered-list'),
        filterDomain: document.getElementById('option-filter-domain'),
        filterHttp: document.getElementById('option-filter-http'),
        filterActive: document.getElementById('option-filter-active'),
        filterPinned: document.getElementById('option-filter-pinned'),
        filterChoose: document.getElementById('option-filter-choose'),
        groupDomain: document.getElementById('option-group-domain'),
        plainText: document.getElementById('option-plain-text'),
        markdown: document.getElementById('option-markdown'),
        json: document.getElementById('option-json'),
        csv: document.getElementById('option-csv'),
        notifications: document.getElementById('option-general-notifications'),
        rememberPreferences: document.getElementById('option-general-remember')
    };

    const saveButton = document.getElementById('save');

    browser.storage.sync.get(Object.keys(options)).then(function(items) {
        for (let key in options) {
            if (options.hasOwnProperty(key)) {
                options[key].checked = items[key] || false;
            }
        }
    });

    saveButton.addEventListener('click', function() {
        const settings = {};
        for (let key in options) {
            if (options.hasOwnProperty(key)) {
                settings[key] = options[key].checked;
            }
        }
        browser.storage.sync.set(settings).then(function() {
            alert('Options saved.');
        });
    });
});
