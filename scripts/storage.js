var tasks = [];
var config = { target: 0, cap: 0 };

function load() {
    try {
        var saved = localStorage.getItem('tasks');
        if (saved) tasks = JSON.parse(saved);

        var cfg = localStorage.getItem('config');
        if (cfg) config = JSON.parse(cfg);
    } catch (err) {
        console.error('Load error:', err);
    }
}

function save() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('config', JSON.stringify(config));
    } catch (err) {
        console.error('Save error:', err);
    }
}

function exportData() {
    var data = JSON.stringify(tasks, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tasks-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tasks exported!', 'success');
}

function importData(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error('File must contain a JSON array');

            var valid = data.filter(function (t) { return t.id && t.title && t.date && t.time && t.tag; });
            if (valid.length === 0) throw new Error('No valid tasks found');

            var existing = new Set(tasks.map(function (t) { return t.id; }));
            var added = 0;

            valid.forEach(function (t) {
                if (!existing.has(t.id)) {
                    tasks.push(t);
                    added++;
                }
            });

            save();
            callback(null, added);
        } catch (err) {
            callback(err);
        }
    };
    reader.readAsText(file);
}

load();