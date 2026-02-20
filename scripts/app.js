var editing = null;

// Form submit — add or edit a task
document.getElementById('form-list').addEventListener('submit', function (e) {
    e.preventDefault();

    var title = document.getElementById('task-title').value;
    var date = document.getElementById('task-date').value;
    var time = document.getElementById('duration').value;
    var tag = document.getElementById('tags').value;
    var desc = document.getElementById('description').value;

    var err = validate('title', title) || validate('date', date) ||
        validate('time', time) || validate('tag', tag);

    if (err) {
        showToast(err, 'error');
        return;
    }

    var task = {
        id: 'rec_' + Date.now(),
        title: title,
        date: date,
        time: parseFloat(time),
        tag: tag,
        desc: desc,
        done: false,
        created: new Date().toISOString()
    };

    if (editing) {
        var i = tasks.findIndex(function (t) { return t.id === editing; });
        tasks[i] = Object.assign({}, tasks[i], task);
        editing = null;
        showToast('Task updated!', 'success');
    } else {
        tasks.push(task);
        showToast('Task created!', 'success');
    }

    save();
    this.reset();
    render();
});

function editTask(id) {
    var t = tasks.find(function (x) { return x.id === id; });
    if (!t) return;

    editing = id;
    document.getElementById('task-title').value = t.title;
    document.getElementById('task-date').value = t.date;
    document.getElementById('duration').value = t.time;
    document.getElementById('tags').value = t.tag;
    document.getElementById('description').value = t.desc || '';

    // Scroll to the form so user can see the pre-filled fields
    document.getElementById('add-new-section').scrollIntoView({ behavior: 'smooth' });
    showToast('Editing: ' + t.title, 'info');
}

function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
    showToast('Task deleted', 'success');
}

function toggleTask(id) {
    var t = tasks.find(function (x) { return x.id === id; });
    if (t) {
        t.done = !t.done;
        save();
        render();
        showToast(t.done ? 'Marked as done!' : 'Marked as pending', 'success');
    }
}

// Search & sort listeners
document.getElementById('search-input').addEventListener('input', render);
document.getElementById('sort-list').addEventListener('change', render);

// Settings form
document.getElementById('settings-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var target = document.getElementById('target-minutes').value;
    var cap = document.getElementById('cap-minutes').value;

    if (target && !regex.time.test(target)) {
        showToast('Invalid target value', 'error');
        return;
    }
    if (cap && !regex.time.test(cap)) {
        showToast('Invalid cap value', 'error');
        return;
    }

    config.target = target ? parseFloat(target) : 0;
    config.cap = cap ? parseFloat(cap) : 0;
    save();
    render();
    showToast('Settings saved!', 'success');
});

// Minutes converter
document.getElementById('minutes-time').addEventListener('input', function () {
    var mins = parseFloat(this.value) || 0;
    document.getElementById('conversion-result').textContent = mins
        ? mins + ' min = ' + (mins / 60).toFixed(2) + ' hrs'
        : '';
});

// Export / Import
document.getElementById('export-json').addEventListener('click', exportData);

document.getElementById('import-json').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;

    importData(file, function (err, count) {
        if (err) {
            showToast('Import failed: ' + (err.message || err), 'error');
        } else {
            showToast('Imported ' + count + ' tasks', 'success');
            render();
        }
    });

    e.target.value = '';
});

// Smooth scroll navigation
document.querySelectorAll('nav a').forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });

        // Close mobile nav
        var nav = document.getElementById('nav-list');
        var hamburger = document.getElementById('hamburger');
        if (nav) nav.classList.remove('open');
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
});

// Hamburger menu toggle
var hamburgerBtn = document.getElementById('hamburger');
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function () {
        var nav = document.getElementById('nav-list');
        this.classList.toggle('active');
        nav.classList.toggle('open');
        var expanded = this.classList.contains('active');
        this.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function (e) {
    var tag = document.activeElement.tagName;
    var isInput = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');

    // Ctrl/Cmd + K → Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        var searchInput = document.getElementById('search-input');
        document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () { searchInput.focus(); }, 300);
        return;
    }

    // Alt + N → Jump to Add Task form
    if (e.altKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('add-new-section').scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () { document.getElementById('task-title').focus(); }, 300);
        return;
    }

    // Escape → Close mobile menu / clear search
    if (e.key === 'Escape') {
        var nav = document.getElementById('nav-list');
        var hamburger = document.getElementById('hamburger');
        if (nav && nav.classList.contains('open')) {
            nav.classList.remove('open');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            return;
        }
        var searchInput = document.getElementById('search-input');
        if (document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.blur();
            render();
            return;
        }
    }

    // Number keys 1-6 to navigate sections (only when not typing)
    if (!isInput && !e.ctrlKey && !e.altKey && !e.metaKey) {
        var sections = {
            '1': '#welcome-section',
            '2': '#dashboard-section',
            '3': '#add-new-section',
            '4': '#search-section',
            '5': '#settings-section',
            '6': '#about-section'
        };
        if (sections[e.key]) {
            e.preventDefault();
            var target = document.querySelector(sections[e.key]);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            showToast('Section ' + e.key + ' of 6', 'info');
            return;
        }
    }
});

// Initialize settings fields and render
document.getElementById('target-minutes').value = config.target || '';
document.getElementById('cap-minutes').value = config.cap || '';

render();

// Expose actions for inline handlers
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;