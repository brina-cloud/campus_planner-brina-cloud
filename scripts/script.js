const storageKey = 'campus_tasks';
const settingsKey = 'campus_settings';

let tasks = [];
let settings = {
    weeklyTarget: 0,
    weeklyCap: 0
};
let editingId = null;

const regex = {
    titlePattern: /^\S(?:.*\S)?$/,
    dueDatePattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    durationPattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    tagPattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\s+\1\b/i,
    tagSearch: /^@tag:(\w+)/
};

function init() {
    loadData();
    updateDashboard();
    drawTasks();
    setupEventListeners();
}

function loadData() {
    try {
        const storedTasks = localStorage.getItem(storageKey);
        const storedSettings = localStorage.getItem(settingsKey);

        if (storedTasks) tasks = JSON.parse(storedTasks);
        if (storedSettings) settings = JSON.parse(storedSettings);
    } catch (error) {
        console.error(error);
    }
}

function saveData() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
        localStorage.setItem(settingsKey, JSON.stringify(settings));
    } catch (error) {
        console.error(error);
        alert('Failed to save data');
    }
}

function validateInput(key, value) {
    const text = value.trim();
    if (!text) return `${key} is required`;

    switch (key) {
        case 'title':
            if (!regex.titlePattern.test(text)) return 'Title cannot have leading/trailing spaces';
            if (regex.duplicateWords.test(text)) return 'Title contains duplicate words';
            break;
        case 'dueDate':
            if (!regex.dueDatePattern.test(text)) return 'Invalid date format (YYYY-MM-DD)';
            break;
        case 'duration':
            if (!regex.durationPattern.test(text)) return 'Duration must be a number';
            const num = parseFloat(text);
            if (num <= 0 || num > 1440) return 'Duration must be between 1 and 1440 minutes';
            break;
        case 'tag':
            if (!regex.tagPattern.test(text)) return 'Tags can only contain letters and hyphens';
            break;
    }
    return null;
}

function setupEventListeners() {
    const form = document.getElementById('form-list');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const sortList = document.getElementById('sort-list');

    if (searchBtn) searchBtn.addEventListener('click', drawTasks);
    if (searchInput) searchInput.addEventListener('input', drawTasks);
    if (sortList) sortList.addEventListener('change', drawTasks);

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        document.getElementById('target-minutes').value = settings.weeklyTarget || '';
        document.getElementById('cap-minutes').value = settings.weeklyCap || '';
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }

    const minutesInput = document.getElementById('minutes-time');
    if (minutesInput) {
        minutesInput.addEventListener('input', handleConverter);
    }

    const exportBtn = document.getElementById('export-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }

    const importInput = document.getElementById('import-json');
    if (importInput) {
        importInput.addEventListener('change', handleImport);
    }

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const dueDate = document.getElementById('task-date').value;
    const duration = document.getElementById('duration').value;
    const description = document.getElementById('description').value;
    const tag = document.getElementById('tags').value;

    const errors = [
        validateInput('title', title),
        validateInput('dueDate', dueDate),
        validateInput('duration', duration),
        validateInput('tag', tag)
    ].filter(err => err !== null);

    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    const newTask = {
        id: editingId || ("rec_" + Date.now()),
        title: title,
        dueDate: dueDate,
        duration: parseFloat(duration),
        description: description,
        tag: tag,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (editingId) {
        const index = tasks.findIndex(t => t.id === editingId);
        if (index !== -1) {
            newTask.createdAt = tasks[index].createdAt;
            newTask.completed = tasks[index].completed;
            tasks[index] = newTask;
            editingId = null;
            document.querySelector("#form-list button[type='submit']").textContent = "Add Task";
            alert('Task updated successfully');
        }
    } else {
        tasks.push(newTask);
        alert('Task added successfully');
    }

    saveData();
    e.target.reset();
    updateDashboard();
    drawTasks();
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    const targetVal = document.getElementById('target-minutes').value.trim();
    const capVal = document.getElementById('cap-minutes').value.trim();

    if (targetVal && !regex.durationPattern.test(targetVal)) {
        alert('Target must be a valid number');
        return;
    }
    if (capVal && !regex.durationPattern.test(capVal)) {
        alert('Cap must be a valid number');
        return;
    }

    settings.weeklyTarget = targetVal ? parseFloat(targetVal) : 0;
    settings.weeklyCap = capVal ? parseFloat(capVal) : 0;
    saveData();
    alert('Settings saved');
    updateDashboard();
}

function handleConverter(e) {
    const mins = parseFloat(e.target.value) || 0;
    const hours = (mins / 60).toFixed(2);
    document.getElementById('conversion-result').textContent = mins ? `${mins} min = ${hours} hrs` : '';
}

function handleExport() {
    const text = JSON.stringify(tasks, null, 2);
    const blob = new Blob([text], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campus-tasks-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (!Array.isArray(data)) throw new Error('Invalid file format');

            const validTasks = data.filter(t => t.id && t.title && t.dueDate && typeof t.duration === 'number');
            if (validTasks.length === 0) throw new Error('No valid tasks found');

            const existingIds = new Set(tasks.map(t => t.id));
            let addedCount = 0;

            validTasks.forEach(t => {
                if (!existingIds.has(t.id)) {
                    tasks.push(t);
                    addedCount++;
                }
            });

            saveData();
            alert(`Imported ${addedCount} tasks`);
            updateDashboard();
            drawTasks();
        } catch (err) {
            alert('Import failed: ' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function updateDashboard() {
    const totalTasks = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = totalTasks - completed;

    document.getElementById('status-total').textContent = totalTasks;
    document.getElementById('status-completed').textContent = completed;
    document.getElementById('status-pending').textContent = pending;

    const tagCount = {};
    tasks.forEach(t => {
        if (t.tag) tagCount[t.tag] = (tagCount[t.tag] || 0) + 1;
    });

    let topTag = '--';
    let maxCount = 0;
    for (let tag in tagCount) {
        if (tagCount[tag] > maxCount) {
            maxCount = tagCount[tag];
            topTag = tag;
        }
    }
    document.getElementById('status-tag').textContent = topTag;

    updateProgressBar();
    drawChart();
}

function updateProgressBar() {
    const target = settings.weeklyTarget || 0;
    const cap = settings.weeklyCap || 0;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let weekMin = 0;
    tasks.forEach(t => {
        const due = new Date(t.dueDate);
        if (due >= weekAgo && due <= now) {
            weekMin += t.duration;
        }
    });

    document.getElementById('target-display').textContent = target;
    document.getElementById('week-duration').textContent = weekMin;

    const bar = document.getElementById('progress-fill');
    const label = document.getElementById('target-status');

    if (target > 0) {
        const pct = Math.min((weekMin / target) * 100, 100);
        bar.style.width = pct + '%';
        bar.setAttribute('aria-valuenow', Math.round(pct));

        if (cap > 0 && weekMin > cap) {
            label.textContent = `Over cap by ${weekMin - cap} min`;
            label.style.color = '#d9534f';
            bar.style.backgroundColor = '#d9534f';
        } else if (weekMin >= target) {
            label.textContent = `Goal reached! ${weekMin - target} min extra`;
            label.style.color = '#27ae60';
            bar.style.backgroundColor = '#27ae60';
        } else {
            label.textContent = `${target - weekMin} min left`;
            label.style.color = '#333';
            bar.style.backgroundColor = '#2c5f9e';
        }
    } else {
        bar.style.width = '0%';
        label.textContent = 'Set a target in Settings';
        label.style.color = '#999';
    }
}

function drawChart() {
    const box = document.getElementById('trend-chart');
    if (!box) return;

    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', {
            weekday: 'short'
        });
        const count = tasks.filter(t => t.createdAt.startsWith(key)).length;
        days.push({
            label: label,
            count: count
        });
    }

    const max = Math.max(...days.map(d => d.count), 1);

    box.innerHTML = days.map(day => {
        const h = Math.round((day.count / max) * 100);
        return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:0.75rem; font-weight:600;">${day.count}</span>
                <div style="width:100%; height:${h}%; min-height:4px; background:#2c5f9e; border-radius:4px 4px 0 0; transition: height 0.3s ease;"></div>
                <span style="font-size:0.72rem; color:#666; margin-top:5px;">${day.label}</span>
            </div>
        `;
    }).join('');
}

function searchFilter(list, query) {
    if (!query) return list;

    const tagMatch = query.match(regex.tagSearch);
    if (tagMatch) {
        const want = tagMatch[1].toLowerCase();
        return list.filter(t => t.tag.toLowerCase().includes(want));
    }

    try {
        const rx = new RegExp(query, 'i');
        return list.filter(t => rx.test(t.title) || rx.test(t.tag) || rx.test(t.description));
    } catch (err) {
        const q = query.toLowerCase();
        return list.filter(t => (t.title + ' ' + t.tag + ' ' + t.description).toLowerCase().includes(q));
    }
}

function sortFilter(list, choice) {
    const out = list.slice();
    if (choice === 'date-desc') out.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    if (choice === 'date-asc') out.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    if (choice === 'title-asc') out.sort((a, b) => a.title.localeCompare(b.title));
    if (choice === 'title-desc') out.sort((a, b) => b.title.localeCompare(a.title));
    if (choice === 'duration-desc') out.sort((a, b) => b.duration - a.duration);
    if (choice === 'duration-asc') out.sort((a, b) => a.duration - b.duration);
    return out;
}

function drawTasks() {
    const searchInput = document.getElementById('search-input');
    const sortList = document.getElementById('sort-list');
    const container = document.getElementById('results-area');

    if (!container) return;

    const searchValue = searchInput ? searchInput.value.trim() : '';
    const sortChoice = sortList ? sortList.value : 'date-desc';

    let list = tasks.slice();
    list = searchFilter(list, searchValue);
    list = sortFilter(list, sortChoice);

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; padding:2rem; width:100%;">No tasks found.</p>';
        return;
    }

    container.innerHTML = list.map(task => {
        const doneStyle = task.completed ? 'opacity:0.6;' : '';
        const borderStyle = task.completed ? '6px solid #27ae60' : '6px solid #2c5f9e';
        const titleStyle = task.completed ? 'text-decoration:line-through; color:#666;' : 'color:#800000;';
        const btnText = task.completed ? 'Undo' : 'Done';
        const btnColor = task.completed ? '#6c757d' : '#27ae60';

        let displayTitle = task.title;
        if (searchValue) {
            try {
                const rx = new RegExp(`(${searchValue})`, 'gi');
                displayTitle = displayTitle.replace(rx, '<mark>$1</mark>');
            } catch (e) {}
        }

        return `
            <div class="task-card" style="background:#F5F5DC; border-left:${borderStyle}; border-radius:8px; padding:1.2rem; margin-bottom:1rem; box-shadow:0 3px 6px rgba(0,0,0,0.08); ${doneStyle}">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.8rem;">
                    <h4 style="margin:0; flex:1; ${titleStyle}">${displayTitle}</h4>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                        <button onclick="editTask('${task.id}')" style="background:#6c757d; color:white; padding:5px 12px; border:none; border-radius:4px; cursor:pointer;">Edit</button>
                        <button onclick="deleteTask('${task.id}')" style="background:#d9534f; color:white; padding:5px 12px; border:none; border-radius:4px; cursor:pointer;">Delete</button>
                        <button onclick="markDone('${task.id}')" style="background:${btnColor}; color:white; padding:5px 12px; border:none; border-radius:4px; cursor:pointer;">${btnText}</button>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px,1fr)); gap:0.8rem; font-size:0.88rem; padding-top:0.8rem; border-top:1px solid #ddd;">
                    <div><strong style="color:#666;">Due date</strong><br>${formatDate(task.dueDate)}</div>
                    <div><strong style="color:#666;">Duration</strong><br>${formatDuration(task.duration)}</div>
                    <div><strong style="color:#666;">Tag</strong><br><span style="background:#2c5f9e; color:white; padding:2px 8px; border-radius:10px; font-size:0.82rem;">${task.tag}</span></div>
                    ${task.description ? `<div><strong style="color:#666;">Note</strong><br>${task.description}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingId = id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-date').value = task.dueDate;
    document.getElementById('duration').value = task.duration;
    document.getElementById('description').value = task.description || '';
    document.getElementById('tags').value = task.tag;

    const formBtn = document.querySelector("#form-list button[type='submit']");
    if (formBtn) formBtn.textContent = "Save Changes";

    const formSection = document.getElementById('add-new-section');
    if (formSection) formSection.scrollIntoView({
        behavior: 'smooth'
    });
}

function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!confirm(`Delete "${task.title}"?`)) return;

    tasks = tasks.filter(t => t.id !== id);
    saveData();
    updateDashboard();
    drawTasks();
}

function markDone(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    saveData();
    updateDashboard();
    drawTasks();
}

function formatDate(str) {
    if (!str) return '';
    return new Date(str).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDuration(mins) {
    if (mins < 60) return mins + ' min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
}

window.onload = init;