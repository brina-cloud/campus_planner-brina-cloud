# Campus Planner

A task management web app for students to organize assignments, track deadlines, and manage study time.

**Author:** Kaliza Sabrina  
**Email:** sabrinakaliza8@gmail.com  
**GitHub:** brina-cloud

---

## Theme

**Color Palette:**
- Primary: `#800000` (Maroon) - Header, headings, accents
- Secondary: `#2c5f9e` (Blue) - Buttons, task borders
- Background: `#faf5e4` (Beige) - Page background
- Content: `#f5f5dc` (Cream) - Cards, sections
- Success: `#27ae60` (Green) - Completed tasks
- Warning: `#d9534f` (Red) - Errors, caps exceeded

**Typography:**
- Font: Arial, sans-serif
- Sizes: Responsive scaling from mobile to desktop

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

### Advanced Features
- ✅ Regex validation (6 patterns, 2 advanced)
- ✅ Special @tag: search syntax
- ✅ Minutes to hours converter
- ✅ Duplicate task detection on import
- ✅ Real date validation (catches Feb 30)
- ✅ State management pattern
- ✅ Modular JavaScript architecture

### Accessibility
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus visible states
- ✅ Semantic HTML structure
- ✅ High contrast colors
- ✅ Responsive design (mobile-first)

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

### Special Pattern: Tag Search
**Pattern:** `/^@tag:(\w+)$/i`

**Purpose:** Special search shortcut

**Examples:**
```
Search: "@tag:homework" → Shows only tasks tagged "Homework"
Search: "@tag:exam"     → Shows only tasks tagged "Exam"
Search: "homework"      → Normal search (searches title + tag)
```

---

## Keyboard Navigation

### Global Navigation
| Key | Action |
|---|---|
| `Tab` | Move to next focusable element |
| `Shift + Tab` | Move to previous element |
| `Enter` | Activate button/link |
| `Esc` | Cancel current action |

### Form Navigation
| Key | Action |
|---|---|
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Enter` | Submit form |
| `Esc` | Clear/cancel |

### Task Cards
| Key | Action |
|---|---|
| `Tab` | Focus next button |
| `Enter` | Activate focused button |
| `E` | Edit (when card focused) |
| `D` | Delete (when card focused) |
| `Space` | Toggle done |

### Search & Sort
| Key | Action |
|---|---|
| `Ctrl/Cmd + F` | Focus search box |
| `Arrow Down` | Open sort dropdown |
| `Arrow Up/Down` | Navigate options |
| `Enter` | Select option |

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
- **Skip Links:** Can skip to main content
- **Tab Order:** Logical, follows visual flow
- **No Keyboard Traps:** Can always escape modals/dialogs

### Visual Accessibility
- **High Contrast:** WCAG AA compliant color ratios
- **Text Sizing:** Responsive, scales with browser settings
- **No Color-Only:** Status indicated by icons + color
- **Clear Focus:** 2px solid outline on focused elements

### Motor Impairments
- **Large Click Targets:** Buttons minimum 44x44px
- **Spacing:** Adequate padding between elements
- **No Precise Timing:** No actions require speed
- **Sticky Header:** Navigation always accessible

### Cognitive Accessibility
- **Clear Language:** Simple, direct instructions
- **Consistent Layout:** Same structure on every page
- **Error Prevention:** Confirmation dialogs for destructive actions
- **Visual Feedback:** Clear success/error messages
- **Undo Support:** Can undo most actions

---

## Running Tests

### Option 1: Manual Testing
1. Open `tests.html` in browser
2. Click "Run All Tests"
3. View results (pass/fail for each test)

### Option 2: Console Testing
```javascript
// Open browser console (F12)
// Tests run automatically on page load
// Check console for detailed results
```

### Test Coverage
- ✅ Regex pattern validation (13 tests)
- ✅ Form validation (8 tests)
- ✅ CRUD operations (6 tests)
- ✅ Search functionality (5 tests)
- ✅ Sort functionality (6 tests)
- ✅ Dashboard calculations (7 tests)
- ✅ Utility functions (5 tests)

**Total: 50 automated tests**

---

## Installation & Setup

### Basic Setup
1. Download all files to same folder
2. Open `index.html` in browser
3. Start adding tasks!

### File Structure
```
campus-planner/
├── index.html          # Main page
├── styles.css          # All styling
├── validators.js       # Regex patterns
├── state.js            # State management
├── storage.js          # Persistence
├── ui.js               # Display logic
├── app.js              # Event handlers
├── seed.json           # Sample data
├── tests.html          # Test suite
└── README.md           # This file
```

### Loading Sample Data
**Method 1:** Import via UI
- Go to Settings → Import Data → Select `seed.json`

**Method 2:** Browser Console
```javascript
fetch('seed.json')
  .then(r => r.json())
  .then(data => {
    data.forEach(t => state.tasks.push(t));
    saveState();
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
- No mobile app (web only)
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

Educational project - Free to use and modify

---

## Credits

Built with:
- Vanilla JavaScript (ES6)
- CSS3 (Flexbox, Grid)
- HTML5 (Semantic markup)
- localStorage API
- FileReader API

No frameworks or libraries required!

---

## Contact

**Kaliza Sabrina**
- Email: s.kaliza1@alustudent.com
- GitHub: brina-cloud

For bugs or suggestions, please reach out!

---

**Last Updated:** February 2025