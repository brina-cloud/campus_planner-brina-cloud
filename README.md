# RALLY

A task management web app for students to organize assignments, track deadlines, and manage study time.

**Author:** Kaliza Sabrina  
**Email:** sabrinakaliza8@gmail.com  
**GitHub:** brina-cloud

live link :'https://brina-cloud.github.io/campus_planner-brina-cloud/'

demo video: ### 🎥 Video Walkthrough
[![Video Demo](https://img.shields.io/badge/Video-Watch%20Demo-blue?style=for-the-badge&logo=youtube)](https://somup.com/cOnYFNWaTD)
---



## Theme

**Color Palette:**
- Cream: `#FFFBF0` — Page background
- Peach: `#FFCE99` — Accents, tags, card highlights
- Orange: `#FF9F43` — Buttons, links, progress bar
- Brown: `#5C3310` — Header, headings, text emphasis
- Success: `#27ae60` — Completed tasks
- Danger: `#e74c3c` — Errors, caps exceeded

**Typography:**
- Font: Inter (Google Fonts), system fallbacks
- Responsive scaling across all breakpoints

---

## Features

### Core Functionality
- ✅ Add, edit, delete tasks
- ✅ Mark tasks as done/undo
- ✅ Search with regex support
- ✅ Sort by 6 options (date, title, duration)
- ✅ Dashboard with 4 real-time metrics
- ✅ Weekly goal tracking with progress bar
- ✅ Weekly cap warning system
- ✅ 7-day activity trend chart
- ✅ Data persistence (localStorage)
- ✅ Import/export JSON
- ✅ Toast notifications (non-intrusive feedback)

### Advanced Features
- ✅ Regex validation (6 patterns, 2 advanced)
- ✅ Minutes to hours converter
- ✅ Duplicate task detection on import
- ✅ Real date validation (catches Feb 30)
- ✅ XSS protection via HTML escaping
- ✅ Modular JavaScript architecture

### Accessibility
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus visible states
- ✅ Semantic HTML structure
- ✅ High contrast colors
- ✅ Responsive design (mobile-first)

### Responsive Design
- ✅ Mobile hamburger navigation menu
- ✅ Breakpoints: 480px, 768px, 1024px
- ✅ Fluid grid layouts for dashboard cards
- ✅ Stacked forms and buttons on small screens
- ✅ Full-width toasts on mobile

---

## Regex Catalog

### Pattern 1: Title Validation
**Pattern:** `/^\S(?:.*\S)?$/`

**Purpose:** Ensures no leading/trailing spaces

**Examples:**
```
✅ "Study Math"
✅ "Complete homework"
✅ "a"
❌ " Study Math"    (leading space)
❌ "Study Math "    (trailing space)
❌ "  "             (only spaces)
```

---

### Pattern 2: Date Validation
**Pattern:** `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`

**Purpose:** Validates YYYY-MM-DD format

**Examples:**
```
✅ "2025-02-20"
✅ "2025-12-31"
❌ "2025-13-01"    (month 13 doesn't exist)
❌ "25-02-20"      (wrong year format)
❌ "2025-2-20"     (month needs leading zero)
```

**Additional Check:** Code also validates real calendar dates (rejects Feb 30, etc.)

---

### Pattern 3: Duration Validation
**Pattern:** `/^(0|[1-9]\d*)(\.\d{1,2})?$/`

**Purpose:** Validates numbers with optional decimals, no leading zeros

**Examples:**
```
✅ "60"
✅ "90.5"
✅ "0"
✅ "120.25"
❌ "01"            (leading zero)
❌ "abc"           (not a number)
❌ "12.345"        (3 decimal places)
```

**Additional Check:** Range validation (1-1440 minutes = 24 hours max)

---

### Pattern 4: Tag Validation
**Pattern:** `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`

**Purpose:** Letters, spaces, and hyphens only

**Examples:**
```
✅ "Homework"
✅ "Study Group"
✅ "Mid-Term"
✅ "Exam-Prep"
❌ "Homework123"   (contains numbers)
❌ "Study_Group"   (underscore not allowed)
❌ "Test!"         (special chars not allowed)
```

---

### Pattern 5: Duplicate Words (ADVANCED)
**Pattern:** `/\b(\w+)\s+\1\b/i`

**Purpose:** Detects repeated words using back-reference

**Examples:**
```
✅ Detects: "the the task"
✅ Detects: "is is ready"
✅ Detects: "study study guide"
❌ Allows: "the task"
❌ Allows: "to do"
```

**How it works:**
- `\b` = word boundary
- `(\w+)` = capture first word (group 1)
- `\s+` = one or more spaces
- `\1` = back-reference (same as group 1)
- `i` = case-insensitive

---

### Pattern 6: Time Tokens (ADVANCED)
**Pattern:** `/\b([01]\d|2[0-3]):([0-5]\d)\b/g`

**Purpose:** Finds HH:MM time patterns in text

**Examples:**
```
✅ Finds: "14:30" in "Meet at 14:30"
✅ Finds: "09:00" and "17:30" in "Class from 09:00 to 17:30"
❌ Skips: "25:00" (invalid hour)
❌ Skips: "14:70" (invalid minute)
```

**How it works:**
- `([01]\d|2[0-3])` = hours 00-23
- `:` = literal colon
- `([0-5]\d)` = minutes 00-59
- `g` = global (find all matches)

---

## Keyboard Navigation

### Global Shortcuts
| Key | Action |
|---|---|
| `Ctrl/Cmd + K` | Focus search box and scroll to it |
| `Alt + N` | Jump to Add Task form and focus title |
| `Escape` | Close mobile menu / clear search |
| `1` – `6` | Jump to section (Home, Dashboard, Add Task, Search, Settings, About) |

> **Note:** Number keys only work when you're not focused on an input field.

### Form Navigation
| Key | Action |
|---|---|
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Enter` | Submit form |

### Task Cards
| Key | Action |
|---|---|
| `Tab` | Focus next button |
| `Enter` | Activate focused button |

---

## Accessibility Features

### Screen Reader Support
- **Semantic HTML:** All sections use proper heading hierarchy (h1 → h2 → h3)
- **ARIA Labels:** All interactive elements labeled
- **Status Updates:** Dashboard uses `role="status"` for live updates
- **Progress Bar:** Proper `role="progressbar"` with `aria-valuenow`
- **Form Labels:** Every input has associated label

### Keyboard Users
- **Focus Visible:** All interactive elements show focus outline
- **Tab Order:** Logical, follows visual flow
- **No Keyboard Traps:** Can always escape modals/dialogs

### Visual Accessibility
- **High Contrast:** WCAG AA compliant color ratios
- **Text Sizing:** Responsive, scales with browser settings
- **Clear Focus:** 2px solid outline on focused elements

### Cognitive Accessibility
- **Clear Language:** Simple, direct instructions
- **Consistent Layout:** Same structure across all sections
- **Error Prevention:** Confirmation dialogs for destructive actions
- **Visual Feedback:** Toast notifications for all actions
- **Undo Support:** Can undo completed tasks

---

## Installation & Setup

### Basic Setup
1. Download all files to the same folder
2. Open `index.html` in a browser
3. Start adding tasks!

### File Structure
```
campus-planner/
├── index.html              # Main page
├── styles/
│   └── styles.css          # All styling (responsive)
├── scripts/
│   ├── validators.js       # Regex patterns & validation
│   ├── storage.js          # localStorage persistence
│   ├── ui.js               # Display logic & toast system
│   └── app.js              # Event handlers & navigation
├── seed.json               # Sample data (12 tasks)
├── tests.html              # Test suite
└── README.md               # This file
```

### Loading Sample Data
**Method 1:** Import via UI
- Go to Settings → Click "Import JSON" → Select `seed.json`

**Method 2:** Browser Console
```javascript
fetch('seed.json')
  .then(r => r.json())
  .then(data => {
    data.forEach(t => tasks.push(t));
    save();
    render();
  });
```

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 not supported (uses ES6)

---

## Data Privacy

- ✅ All data stored locally (localStorage)
- ✅ No server communication
- ✅ No analytics or tracking
- ✅ Import/export for backups
- ✅ Clear data by clearing browser storage

---

## Known Limitations

- localStorage limited to ~5-10MB per domain
- No cloud sync between devices
- No collaborative features
- No native mobile app (responsive web app)
- Requires JavaScript enabled

---

## Future Enhancements

- [ ] Dark mode theme
- [ ] Calendar view
- [ ] Recurring tasks
- [ ] Task categories
- [ ] Due date notifications
- [ ] Export to PDF
- [ ] Multiple sort combinations
- [ ] Task templates

---

## License

Educational project — Free to use and modify

---

## Credits

Built with:
- Vanilla JavaScript (ES6)
- CSS3 (Flexbox, Grid, Custom Properties, Animations)
- HTML5 (Semantic markup)
- Google Fonts (Inter)
- localStorage API
- FileReader API

No frameworks or libraries required!

---

## Contact

**Kaliza Sabrina**
- Email: sabrinakaliza8@gmail.com
- GitHub: brina-cloud

For bugs or suggestions, please reach out!

---

**Last Updated:** February 2026