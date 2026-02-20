const regex = {
    title: /^\S(?:.*\S)?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    time: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    dupe: /\b(\w+)\s+\1\b/i,
    clock: /\b([01]\d|2[0-3]):([0-5]\d)\b/g
};

function validate(key, val) {
    val = val.trim();
    if (!val) return key + ' required';
    
    if (key === 'title') {
        if (!regex.title.test(val)) return 'extra spaces';
        if (regex.dupe.test(val)) return 'duplicate words';
        if (val.length < 3) return 'min 3 chars';
    }
    
    if (key === 'date') {
        if (!regex.date.test(val)) return 'use YYYY-MM-DD';
    }
    
    if (key === 'time') {
        if (!regex.time.test(val)) return 'invalid number';
        let n = parseFloat(val);
        if (n <= 0 || n > 1440) return 'must be 1-1440';
    }
    
    if (key === 'tag') {
        if (!regex.tag.test(val)) return 'letters/spaces/hyphens only';
    }
    
    return null;
}