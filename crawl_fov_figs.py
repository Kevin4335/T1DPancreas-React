"""
Crawl /mnt/mountpoint/T1D_Cosmx_new/FOV_figs/ and produce a structured JSON
matching the shape of:
  conditionOptions, donorOptionsByCondition, fovOptionsByDonor

Assumed directory layout (adjust DEPTH_* comments if different):
  FOV_figs/
    <condition>/          e.g. CTRL, AB+LN-, AB+LN+, T1D
      <donor_slide>/      e.g. CTRL_ICRH153_Slide_2
        <files>           e.g. CTRL_ICRH153_Slide_2_100.png

The FOV number is parsed from the numeric suffix at the end of each filename
(before the extension).
"""

import os
import re
import json
from collections import defaultdict

ROOT = "/mnt/mountpoint/T1D_Cosmx_new/FOV_figs"

# --- helpers -----------------------------------------------------------------

def parse_fov(filename):
    """Return the trailing integer from a filename stem, or None."""
    stem = os.path.splitext(filename)[0]
    m = re.search(r'_(\d+)$', stem)
    return int(m.group(1)) if m else None

def parse_donor(dirname):
    """
    Extract a canonical donor ID from a donor/slide directory name.
    e.g. 'CTRL_ICRH153_Slide_2' -> 'ICRH153'
    Tries to grab the token right after the condition prefix.
    Falls back to the full dirname.
    """
    parts = dirname.split('_')
    # layout: <COND>_<DONOR>_Slide_<N>  or just <DONOR>
    # skip leading condition token if it looks like one (all caps, no digits)
    i = 0
    if parts and re.fullmatch(r'[A-Za-z+\-]+', parts[0]):
        i = 1
    if i < len(parts):
        return parts[i]
    return dirname

# --- main crawl --------------------------------------------------------------

condition_set = []                           # ordered list
donors_by_condition = defaultdict(list)      # condition -> [donor, ...]
fovs_by_donor = defaultdict(set)             # donor -> {fov, ...}
donor_to_condition = {}                      # for dedup

for condition_dir in sorted(os.scandir(ROOT), key=lambda e: e.name):
    if not condition_dir.is_dir():
        continue
    cond = condition_dir.name
    if cond not in condition_set:
        condition_set.append(cond)

    for donor_dir in sorted(os.scandir(condition_dir.path), key=lambda e: e.name):
        if not donor_dir.is_dir():
            continue
        donor = parse_donor(donor_dir.name)

        if donor not in donor_to_condition:
            donor_to_condition[donor] = cond
            donors_by_condition[cond].append(donor)

        for f in os.scandir(donor_dir.path):
            if f.is_file():
                fov = parse_fov(f.name)
                if fov is not None:
                    fovs_by_donor[donor].add(fov)

# convert sets -> sorted lists
fovs_by_donor_sorted = {d: sorted(fovs) for d, fovs in fovs_by_donor.items()}

out = {
    "conditionOptions": condition_set,
    "donorOptionsByCondition": dict(donors_by_condition),
    "fovOptionsByDonor": fovs_by_donor_sorted,
}

print(json.dumps(out, indent=2))