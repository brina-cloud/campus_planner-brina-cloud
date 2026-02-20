function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast' + (type === 'success' ? ' success' : type === 'error' ? ' error' : '');
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
}

function render() {
    var search = document.getElementById('search-input').value;
    var sort = document.getElementById('sort-list').value;

    var list = tasks.slice();

    if (search) {
        try {
            var rx = new RegExp(search, 'i');
            list = list.filter(function (t) {
                return rx.test(t.title + ' ' + t.tag + ' ' + (t.desc || ''));
            });
        } catch (e) {
            var lower = search.toLowerCase();
            list = list.filter(function (t) {
                return (t.title + ' ' + t.tag + ' ' + (t.desc || '')).toLowerCase().includes(lower);
            });
        }
    }

    if (sort === 'date-desc') list.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    if (sort === 'date-asc') list.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    if (sort === 'title-asc') list.sort(function (a, b) { return a.title.localeCompare(b.title); });
    if (sort === 'title-desc') list.sort(function (a, b) { return b.title.localeCompare(a.title); });
    if (sort === 'duration-desc') list.sort(function (a, b) { return b.time - a.time; });
    if (sort === 'duration-asc') list.sort(function (a, b) { return a.time - b.time; });

    showTasks(list);
    updateStats();
}

function showTasks(list) {
    var html = '';
    list.forEach(function (t) {
        var cardClass = 'task-card ' + (t.done ? 'done' : 'pending');
        html += '<div class="' + cardClass + '">' +
            '<div class="task-header">' +
            '<span class="task-title">' + escapeHTML(t.title) + '</span>' +
            '<div class="task-buttons">' +
            '<button class="btn-edit" onclick="editTask(\'' + t.id + '\')">✏️ Edit</button>' +
            '<button class="btn-delete" onclick="deleteTask(\'' + t.id + '\')">🗑️ Delete</button>' +
            '<button class="btn-toggle" onclick="toggleTask(\'' + t.id + '\')">' + (t.done ? '↩️ Undo' : '✅ Done') + '</button>' +
            '</div>' +
            '</div>' +
            '<div class="task-info">' +
            '<div><strong>Due:</strong> ' + escapeHTML(t.date) + '</div>' +
            '<div><strong>Duration:</strong> ' + t.time + ' min</div>' +
            '<div><strong>Tag:</strong> <span class="task-tag">' + escapeHTML(t.tag) + '</span></div>' +
            (t.desc ? '<div><strong>Note:</strong> ' + escapeHTML(t.desc) + '</div>' : '') +
            '</div>' +
            '</div>';
    });

    var container = document.getElementById('task-list');
    if (container) container.innerHTML = html || '<p>No tasks found. Add one above!</p>';
}

function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function updateStats() {
    document.getElementById('status-total').textContent = tasks.length;
    document.getElementById('status-completed').textContent = tasks.filter(function (t) { return t.done; }).length;
    document.getElementById('status-pending').textContent = tasks.filter(function (t) { return !t.done; }).length;

    var tags = {};
    tasks.forEach(function (t) { tags[t.tag] = (tags[t.tag] || 0) + 1; });
    var entries = Object.entries(tags).sort(function (a, b) { return b[1] - a[1]; });
    var top = entries[0];
    document.getElementById('status-tag').textContent = top ? top[0] : '--';

    updateProgress();
    drawChart();
}

function updateProgress() {
    var now = new Date();
    var week = new Date(now - 7 * 24 * 60 * 60 * 1000);
    var weekTotal = 0;

    tasks.forEach(function (t) {
        if (new Date(t.date) >= week && new Date(t.date) <= now) {
            weekTotal += t.time;
        }
    });

    document.getElementById('target-display').textContent = config.target;
    document.getElementById('week-duration').textContent = weekTotal;

    var bar = document.getElementById('progress-fill');
    var status = document.getElementById('target-status');

    if (config.target > 0) {
        var pct = Math.min((weekTotal / config.target) * 100, 100);
        bar.style.width = pct + '%';

        if (config.cap > 0 && weekTotal > config.cap) {
            status.textContent = '⚠️ Over cap by ' + (weekTotal - config.cap) + ' min';
            status.style.color = '#e74c3c';
        } else if (weekTotal >= config.target) {
            status.textContent = '🎉 Goal met!';
            status.style.color = '#27ae60';
        } else {
            status.textContent = '📊 ' + (config.target - weekTotal) + ' min left to reach target';
            status.style.color = '#5C3310';
        }
    } else {
        bar.style.width = '0%';
        status.textContent = 'Set a target in Settings ⬇️';
        status.style.color = '#999';
    }
}

function drawChart() {
    var days = [];
    var now = new Date();

    for (var i = 6; i >= 0; i--) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        var key = d.toISOString().split('T')[0];
        var label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        var count = tasks.filter(function (t) { return t.created && t.created.startsWith(key); }).length;
        days.push({ label: label, count: count });
    }

    var max = Math.max.apply(null, days.map(function (d) { return d.count; }).concat([1]));
    var html = '';
    days.forEach(function (d) {
        var h = (d.count / max) * 100;
        html += '<div class="chart-day">' +
            '<span class="count">' + d.count + '</span>' +
            '<div class="bar" style="height:' + Math.max(h, 4) + '%"></div>' +
            '<span class="label">' + d.label + '</span>' +
            '</div>';
    });

    var chart = document.getElementById('trend-chart');
    if (chart) chart.innerHTML = html;
}
