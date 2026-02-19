const storage = 'campus_tasks';
const setting = 'campus_settings';

let tasks = [];
let settings = {
    weeklyTarget: 0,
    weeklyCap: 0
};

let editingId = null;

addedData();

function addedData() {
    try {
        const addedTasks = localStorage.getItem(storage);
        if (addedTasks) {
            tasks = JSON.parse(addedTasks);
        }

        const addedSettings = localStorage.getItem(setting);
        if (addedSettings) {
            settings = JSON.parse(addedSettings);
        }
        console.log('Tasks loaded', tasks);
    } catch (error) {
        console.error(error);
        alert('error load data');
    }
}

function saveData() {
    try {
        localStorage.setItem(storage, JSON.stringify(tasks));
        localStorage.setItem(setting, JSON.stringify(settings));
        console.log('Data saved!');
    } catch (error) {
        console.error(error);
        alert('Error saving data!');
    }
}

const regex = {
    titlePattern: /^\S(?:.*\S)?$/,
    dueDatePattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    durationPattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    tagPattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\s+\1\b/i,
    timePattern: /\b([01]\d|2[0-3]):([0-5]\d)\b/g,
    tagSearch: /^@tag:(\w+)$/i
};

function validation(key, value) {
    const words = value.trim();

    if (!words) {
        return `${key} is required`;
    }

    switch (key) {
        case 'title':
            if (!regex.titlePattern.test(words)) {
                return 'double spaces!';
            }
            if (regex.duplicateWords.test(words)) {
                return 'title should contain no duplicats in task title';
            }
            break;
        case 'dueDate':
            if (!regex.dueDatePattern.test(words)) {
                return 'due date must be in yyyy-mm-dd format';
            }
          
            break;
        case 'duration':
            if (!regex.durationPattern.test(words)) {
                return ' duration must be a valid number';
            }
            const num = parseFloat(words);
            if (num <= 0 || num > 1440) {
                return 'invalid time must be more than 0 and max is 1440';
            }
            break;
        case 'tag':
            if (!regex.tagPattern.test(words)) {
                return 'invalid only letters, spaces, and hyphend allowed';
            }
            break;
    }
    return null;
}

const form = document.getElementById('form-list');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const dueDate = document.getElementById('task-date').value;
        const duration = document.getElementById('duration').value;
        const description = document.getElementById('description').value;
        const tag = document.getElementById('tags').value;

        const titleError = validation('title', title);
        const dateError = validation('dueDate', dueDate);
        const durationError = validation('duration', duration);
        const tagError = validation('tag', tag);

        if (titleError || dateError || durationError || tagError) {
            alert(titleError || dateError || durationError || tagError);
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
            newTask.createdAt = tasks[index].createdAt;
            newTask.completed = tasks[index].completed;
            tasks[index] = newTask;
            editingId = null;
            form.querySelector("button[type='submit']").textContent = "Add Task";
            alert('Task updated!');
        } else {
            tasks.push(newTask);
            alert('Task added!');
        }

        saveData();
        form.reset();
        dashboardMetric();
        drawTasks();
        console.log('Task saved:', newTask);
    });
}

function dashboardMetric() {
    const totalTasks = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = totalTasks - completed;

    document.getElementById('status-total').textContent = totalTasks;
    document.getElementById('status-completed').textContent = completed;
    document.getElementById('status-pending').textContent = pending;

    const tagCount = {};
    tasks.forEach(t => {
        tagCount[t.tag] = (tagCount[t.tag] || 0) + 1;
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
            label.textContent = 'Over cap by ' + (weekMin - cap) + ' min';
            label.style.color = '#d9534f';
        } else if (weekMin >= target) {
            label.textContent = 'Goal reached! ' + (weekMin - target) + ' min extra';
            label.style.color = '#27ae60';
        } else {
            label.textContent = (target - weekMin) + ' min left';
            label.style.color = '#333';
        }
    } else {
        bar.style.width = '0%';
        label.textContent = 'Set a target in Settings';
        label.style.color = '#999';
    }
}

function drawChart() {
    const box = document.getElementById('trend-chart');
    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });

        const count = tasks.filter(t => t.createdAt.startsWith(key)).length;
        days.push({ label: label, count: count });
    }

    const max = Math.max(...days.map(d => d.count), 1);

    box.innerHTML = days.map(day => {
        const h = Math.round((day.count / max) * 100);
        return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:0.75rem; font-weight:600;">${day.count}</span>
                <div style="width:100%; height:${h}%; min-height:4px; background:#2c5f9e; border-radius:4px 4px 0 0;"
                     onmouseover="this.style.background='#800000'"
                     onmouseout="this.style.background='#2c5f9e'"></div>
                <span style="font-size:0.72rem; color:#666; margin-top:5px;">${day.label}</span>
            </div>
        `;
    }).join('');
}

function searchTasks(list, query) {
    if (!query) return list;

    const tagMatch = query.match(regex.tagSearch);
    if (tagMatch) {
        const want = tagMatch[1].toLowerCase();
        return list.filter(t => t.tag.toLowerCase().includes(want));
    }

    try {
        const rx = new RegExp(query, 'i');
        return list.filter(t => rx.test(t.title + ' ' + t.tag + ' ' + t.description));
    } catch (err) {
        const q = query.toLowerCase();
        return list.filter(t => (t.title + ' ' + t.tag + ' ' + t.description).toLowerCase().includes(q));
    }
}

function sortTasks(list, choice) {
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

    const searchValue = searchInput ? searchInput.value.trim() : '';
    const sortChoice = sortList ? sortList.value : 'date-desc';

    let list = tasks.slice();

    if (searchValue) {
        list = searchTasks(list, searchValue);
    }

    list = sortTasks(list, sortChoice);

    let container = document.getElementById('task-cards');
    if (!container) {
        container = document.createElement('div');
        container.id = 'task-cards';
        document.getElementById('search-section').appendChild(container);
    }

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; padding:2rem;">No tasks found.</p>';
        return;
    }

    container.innerHTML = list.map(task => {
        const doneColor = task.completed ? '#27ae60' : '#2c5f9e';
        const btnLabel = task.completed ? 'Undo' : 'MarkDone';
        const btnColor = task.completed ? '#6c757d' : '#f0ad4e';

        return `
            <div style="background:#F5F5DC; border-left:6px solid ${doneColor}; border-radius:8px; padding:1.2rem; margin-bottom:1rem; box-shadow:0 3px 6px rgba(0,0,0,0.08);">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.8rem;">
                    <h4 style="color:#800000; margin:0; flex:1;">${task.title}</h4>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                        <button onclick="editTask('${task.id}')" style="background:#6c757d; color:white; padding:5px 12px; width:40px; height:20px; border:none; border-radius:4px; cursor:pointer;">Edit</button>
                        <button onclick="deleteTask('${task.id}')" style="background:#d9534f; color:white; padding:5px 12px;width:60px; height:20px; border:none; border-radius:4px; cursor:pointer;">Delete</button>
                        <button onclick="markDone('${task.id}')" style="background:${btnColor}; color:white; padding:5px 12px;width:80px; height:20px; border:none; border-radius:4px; cursor:pointer;">${btnLabel}</button>
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

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const sortList = document.getElementById('sort-list');

if (searchBtn) searchBtn.addEventListener('click', drawTasks);
if (searchInput) searchInput.addEventListener('input', drawTasks);
if (sortList) sortList.addEventListener('change', drawTasks);

function editTask(id) {
    var task = tasks.find(function(t) {
        return t.id === id;
    });
    if (!task) {
        return;
    }

    editingId = id;

    document.getElementById('task-title').value = task.title;
    document.getElementById('task-date').value = task.dueDate;
    document.getElementById('duration').value = task.duration;
    document.getElementById('description').value = task.description || '';
    document.getElementById('tags').value = task.tag;

    document.getElementById('form-list').querySelector("button[type='submit']").textContent = "Save Changes";

    document.getElementById('add-new-section').scrollIntoView({ behavior: "smooth" });
}

function deleteTask(id) {
    var task = tasks.find(function(t) {
        return t.id === id;
    });
    if (!task) return;

    if (!confirm("Delete \"" + task.title + "\"?")) return;

    tasks = tasks.filter(function(t) {
        return t.id !== id;
    });
    saveData();
    alert("Task deleted");
    dashboardMetric();
    drawTasks();
}

function markDone(id) {
    var task = tasks.find(function(t) {
        return t.id === id;
    });
    if (!task) return;

    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();

    saveData();
    dashboardMetric();
    drawTasks();
}

const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
    document.getElementById('target-minutes').value = settings.weeklyTarget || '';
    document.getElementById('cap-minutes').value = settings.weeklyCap || '';

    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const targetVal = document.getElementById('target-minutes').value.trim();
        const capVal = document.getElementById('cap-minutes').value.trim();

        if (targetVal && !regex.durationPattern.test(targetVal)) {
            alert('Target must be a number');
            return;
        }
        if (capVal && !regex.durationPattern.test(capVal)) {
            alert('Cap must be a number');
            return;
        }

        settings.weeklyTarget = targetVal ? parseFloat(targetVal) : 0;
        settings.weeklyCap = capVal ? parseFloat(capVal) : 0;
        saveData();

        alert('Settings saved!');
        dashboardMetric();
    });
}

const minutesInput = document.getElementById('minutes-time');
if (minutesInput) {
    minutesInput.addEventListener('input', function() {
        const mins = parseFloat(this.value) || 0;
        const hours = (mins / 60).toFixed(2);
        document.getElementById('conversion-result').textContent = mins ? `${mins} min = ${hours} hrs` : '';
    });
}

const exportBtn = document.getElementById('export-json');
if (exportBtn) {
    exportBtn.addEventListener('click', function() {
        const text = JSON.stringify(tasks, null, 2);
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'campus-tasks-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    });
}

const importInput = document.getElementById('import-json');
if (importInput) {
    importInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (!Array.isArray(data)) throw new Error('File must be an array');

                const valid = data.filter(t => t.id && t.title && t.dueDate && typeof t.duration === 'number' && t.tag);
                if (valid.length === 0) throw new Error('No valid tasks found');

                const existing = {};
                tasks.forEach(t => { existing[t.id] = true; });

                let added = 0;
                valid.forEach(t => {
                    if (!existing[t.id]) {
                        tasks.push(t);
                        added++;
                    }
                });

                saveData();
                alert('Imported ' + added + ' task(s)');
                dashboardMetric();
                drawTasks();
            } catch (err) {
                alert('Import failed: ' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}

function formatDate(str) {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(mins) {
    if (mins < 60) return mins + ' min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
}

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

dashboardMetric();
drawTasks();

console.log('Campus Planner ready - ' + tasks.length + ' tasks loaded');