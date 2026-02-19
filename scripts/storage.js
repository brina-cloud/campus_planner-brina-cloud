let tasks = [];
let config = { target: 0, cap: 0 };


function load() {
    try {
        let saved = localStorage.getItem('tasks');
        if (saved) tasks = JSON.parse(saved);
        
        let cfg = localStorage.getItem('config');
        if (cfg) config = JSON.parse(cfg);
    
    } catch (err) {
        console.error('load error:', err);
    }
}


function save() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('config', JSON.stringify(config));
        console.log('saved data, tasks')
        alert('saved data')
    } catch (err) {
        console.error('save error:', err);
    }
}

function exportData() {
    let data = JSON.stringify(tasks, null, 2);
    let blob = new Blob([data], {type: 'application/json'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'tasks-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('exported tasks')
}

function importData(file, callback) {
    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error('not array');
            
            let valid = data.filter(t => t.id && t.title && t.date && t.time && t.tag);
            if (valid.length === 0) throw new Error('no valid tasks');
            
            let existing = new Set(tasks.map(t => t.id));
            let added = 0;
            
            valid.forEach(t => {
                if (!existing.has(t.id)) {
                    tasks.push(t);
                    added++;
                }
            });
            
            save();
            callback(null, added);
            alert('imported data')
        } catch (err) {
            callback(err);
        }
    };
    reader.readAsText(file);
}

load();