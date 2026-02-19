let editing = null;

document.getElementById('form-list').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let title = document.getElementById('task-title').value;
    let date = document.getElementById('task-date').value;
    let time = document.getElementById('duration').value;
    let tag = document.getElementById('tags').value;
    let desc = document.getElementById('description').value;
    
    let err = validate('title', title) || validate('date', date) || 
              validate('time', time) || validate('tag', tag);
    
    if (err) {
        alert(err);
        return;
    }
    
    let task = {
        id: editing || 'task_' + Date.now(),
        title: title,
        date: date,
        time: parseFloat(time),
        tag: tag,
        desc: desc,
        done: false,
        created: new Date().toISOString()
    };
    
    if (editing) {
        let i = tasks.findIndex(t => t.id === editing);
        tasks[i] = { ...tasks[i], ...task };
        editing = null;
    } else {
        tasks.push(task);
    }
    alert('task created')
    save();
    this.reset();
    render();
});

function editTask(id) {
    let t = tasks.find(x => x.id === id);
    if (!t) return;
    
    editing = id;
    document.getElementById('task-title').value = t.title;
    document.getElementById('task-date').value = t.date;
    document.getElementById('duration').value = t.time;
    document.getElementById('tags').value = t.tag;
    document.getElementById('description').value = t.desc || '';
    if (document.getElementById('task-list')) document.getElementById('task-list').scrollIntoView({behavior: 'smooth'});
}

function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
}

function toggleTask(id) {
    let t = tasks.find(x => x.id === id);
    if (t) {
        t.done = !t.done;
        save();
        render();
    }
}

document.getElementById('search-input').addEventListener('input', render);
document.getElementById('sort-list').addEventListener('change', render);

document.getElementById('settings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let target = document.getElementById('target-minutes').value;
    let cap = document.getElementById('cap-minutes').value;

    if (target && !regex.time.test(target)) {
        alert('invalid target');
        return;
    }
    if (cap && !regex.time.test(cap)) {
        alert('invalid cap');
        return;
    }

    config.target = target ? parseFloat(target) : 0;
    config.cap = cap ? parseFloat(cap) : 0;
    save();
    render();
    alert('setting saved')
});

document.getElementById('minutes-time').addEventListener('input', function() {
    let mins = parseFloat(this.value) || 0;
    document.getElementById('conversion-result').textContent = mins ? mins + ' min = ' + (mins/60).toFixed(2) + ' hrs' : '';
});

document.getElementById('export-json').addEventListener('click', exportData);

document.getElementById('import-json').addEventListener('change', function(e) {
    let file = e.target.files[0];
    if (!file) return;
    

    importData(file, function(err, count) {
        if (err) {
            alert('Import failed: ' + (err.message || err));
        } else {
            alert('Imported ' + count + ' tasks');
            render();
        }
    });

    e.target.value = '';
});

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({behavior: 'smooth'});
    });
});

document.getElementById('target-minutes').value = config.target || '';
document.getElementById('cap-minutes').value = config.cap || '';

render();
// expose actions for inline handlers
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;