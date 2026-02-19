function render() {
    let search = document.getElementById('search-input').value;
    let sort = document.getElementById('sort-list').value;

    let list = tasks.slice();

    if (search) {
        try {
            let rx = new RegExp(search, 'i');
            list = list.filter(t => rx.test(t.title + ' ' + t.tag + ' ' + (t.desc || '')));
        } catch {
            search = search.toLowerCase();
            list = list.filter(t => (t.title + ' ' + t.tag + ' ' + (t.desc || '')).toLowerCase().includes(search));
        }
    }

    if (sort === 'date-desc') list.sort((a,b) => new Date(b.date) - new Date(a.date));
    if (sort === 'date-asc') list.sort((a,b) => new Date(a.date) - new Date(b.date));
    if (sort === 'title-asc') list.sort((a,b) => a.title.localeCompare(b.title));
    if (sort === 'title-desc') list.sort((a,b) => b.title.localeCompare(a.title));
    if (sort === 'duration-desc') list.sort((a,b) => b.time - a.time);
    if (sort === 'duration-asc') list.sort((a,b) => a.time - b.time);

    showTasks(list);
    updateStats();
}

function showTasks(list) {
    let html = '';
    list.forEach(t => {
        html += `<div class="task-card">
            <div class="task-header">
                <div class="task-buttons" style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.8rem; margin-top:20px">
                    
                    <button onclick="editTask('${t.id}')">Edit</button>
                    <button onclick="deleteTask('${t.id}')">Delete</button>
                    <button onclick="toggleTask('${t.id}')">${t.done ? 'Undo' : 'Done'}</button>
                </div>
            </div>
            <div class="task-info" ">
                <div> Title: ${t.title}</div>
                <div>Due: ${t.date}</div>
                <div>Time: ${t.time} min</div>
                <div>Tag: ${t.tag}</div>
                ${t.desc ? '<div>Note: ' + t.desc + '</div>' : ''}
            </div>
        </div>`;
    });
    
    let container = document.getElementById('task-list');
    if (container) container.innerHTML = html || '<p>No tasks</p>';
}

function updateStats() {
    document.getElementById('status-total').textContent = tasks.length;
    document.getElementById('status-completed').textContent = tasks.filter(t => t.done).length;
    document.getElementById('status-pending').textContent = tasks.filter(t => !t.done).length;

    let tags = {};
    tasks.forEach(t => tags[t.tag] = (tags[t.tag] || 0) + 1);
    let top = Object.entries(tags).sort((a,b) => b[1] - a[1])[0];
    document.getElementById('status-tag').textContent = top ? top[0] : '--';

    updateProgress();
    drawChart();
}

function updateProgress() {
    let now = new Date();
    let week = new Date(now - 7 * 24 * 60 * 60 * 1000);
    let weekTotal = 0;
    
    tasks.forEach(t => {
        if (new Date(t.date) >= week && new Date(t.date) <= now) {
            weekTotal += t.time;
        }
    });
    
    document.getElementById('target-display').textContent = config.target;
    document.getElementById('week-duration').textContent = weekTotal;

    let bar = document.getElementById('progress-fill');
    let status = document.getElementById('target-status');
    
    if (config.target > 0) {
        let pct = Math.min((weekTotal / config.target) * 100, 100);
        bar.style.width = pct + '%';
        
        if (config.cap > 0 && weekTotal > config.cap) {
            status.textContent = 'Over cap by ' + (weekTotal - config.cap) + ' min';
            status.style.color = '#d9534f';
        } else if (weekTotal >= config.target) {
            status.textContent = 'Goal met!';
            status.style.color = '#27ae60';
        } else {
            status.textContent = (config.target - weekTotal) + ' min left';
            status.style.color = '#333';
        }
    } else {
        bar.style.width = '0%';
        status.textContent = 'Set target in settings';
        status.style.color = '#999';
    }
}

function drawChart() {
    let days = [];
    let now = new Date();
    
    for (let i = 6; i >= 0; i--) {
        let d = new Date(now);
        d.setDate(d.getDate() - i);
        let key = d.toISOString().split('T')[0];
        let count = tasks.filter(t => t.created && t.created.startsWith(key)).length;
        days.push(count);
    }
    
    let max = Math.max(...days, 1);
    let html = '';
    days.forEach(n => {
        let h = (n / max) * 100;
        html += `<div style="height:${h}%; width:10px;"></div>`;
    });
    
    let chart = document.getElementById('trend-chart');
    if (chart) chart.innerHTML = html;
}

