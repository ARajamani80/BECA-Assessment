# Permission Editor - UI Guide & Mockups

## Overview

This guide provides visual walkthroughs of the Permission Visual Editor UI, showing how users interact with the interface and what to expect.

---

## Main Permission Editor Modal

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Permission Matrix Editor                                        [×] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ℹ️  SUPERADMIN ONLY: Customize role permissions by toggling        │
│     checkboxes. Changes are automatically saved to the audit log.   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Permission              │ Superadmin │ Admin │ Trainer │ ...   ││
│  ├─────────────────────────┼────────────┼───────┼─────────┼────────┤│
│  │ Create Assessment       │ ☑  [?]    │ ☑     │ ☑      │ ☐      ││
│  │ Edit Assessment         │ ☑  [?]    │ ☑     │ ☐      │ ☐      ││
│  │ Delete Assessment       │ ☑  [?]    │ ☐     │ ☐      │ ☐      ││
│  │ Publish Assessment      │ ☑  [?]    │ ☑     │ ☐      │ ☐      ││
│  │ View Results            │ ☑  [?]    │ ☑     │ ☑      │ ☑      ││
│  │ Manage Users            │ ☑  [?]    │ ☑     │ ☐      │ ☐      ││
│  │ Send to Trainees        │ ☑  [?]    │ ☑     │ ☑      │ ☐      ││
│  │ View Analytics          │ ☑  [?]    │ ☑     │ ☑      │ ☑      ││
│  │ Manage Roles            │ ☑  [?]    │ ☐     │ ☐      │ ☐      ││
│  │ Access Admin Dashboard  │ ☑  [?]    │ ☑     │ ☐      │ ☐      ││
│  └─────────────────────────┴────────────┴───────┴─────────┴────────┘│
│                                                                       │
│  [✓ Save Changes] [↻ Reset to Defaults] [📜 Audit Log] [✕ Close]   │
│                                                                       │
│  💡 LEGEND                                                            │
│  ☑ Permission Enabled  │  ☐ Permission Disabled  │  [?] Show desc  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Color Scheme

**Role Header Colors:**
- Superadmin: Red badge (#dc2626)
- Admin: Blue badge (#2563eb)
- Trainer: Green badge (#16a34a)
- Viewer: Gray badge (#6b7280)
- User: Purple badge (#9333ea)

**Status Indicators:**
- ✓ Green checkmark: Permission enabled
- ○ Empty circle: Permission disabled
- ℹ️ Blue info icon: Hover for description

---

## User Interaction Flow

### Scenario 1: Enable a Permission

**Steps:**
1. Superadmin opens User Management
2. Clicks "Permission Editor" button
3. Finds "Edit Assessment" row
4. Clicks checkbox in "Trainer" column (changes from ☐ to ☑)
5. Clicks "Save Changes" button
6. Sees success message: "Successfully saved 1 permission change(s)"

**Before:**
```
Edit Assessment  │ ☑  │ ☑  │ ☐  │ ☐  │ ☐
                 Superadmin, Admin: enabled
                 Trainer: DISABLED
```

**After:**
```
Edit Assessment  │ ☑  │ ☑  │ ☑  │ ☐  │ ☐
                 Superadmin, Admin, Trainer: enabled
```

### Scenario 2: Disable Multiple Permissions

**Steps:**
1. Open Permission Editor
2. Uncheck these boxes:
   - Admin → Delete Assessment
   - Trainer → Send to Trainees
   - Viewer → View Analytics
3. Click "Save Changes"
4. Success message shows: "Successfully saved 3 permission change(s)"
5. Review changes in Audit Log

### Scenario 3: Reset All to Defaults

**Steps:**
1. Open Permission Editor
2. Make several permission changes
3. Click "Reset to Defaults"
4. Confirm dialog: "Are you sure you want to reset all permissions..."
5. Permissions return to factory defaults
6. Success message: "Permissions reset to defaults successfully!"

---

## Audit Log Modal

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Permission Audit Log                                            [×] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Date/Time            Action           Role    Permission   Changed By
│  ─────────────────────────────────────────────────────────────────────
│  2024-01-15 10:30:45  permission_upd   admin   delete_ass   user@ex
│  2024-01-15 10:25:12  permission_upd   trainer send_to_tra  user@ex
│  2024-01-15 10:20:00  reset_to_def     admin   *            user@ex
│  2024-01-15 09:15:33  batch_update     *       *            user@ex
│  2024-01-14 14:45:22  permission_upd   viewer  manage_user  admin@ex
│                                                                        │
│                                                  [✕ Close]           │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Audit Log Columns

| Column | Content | Example |
|--------|---------|---------|
| Date/Time | Timestamp of change | 2024-01-15 10:30:45 |
| Action | Type of operation | permission_updated |
| Role | Affected role | admin |
| Permission | Changed permission | delete_assessment |
| Previous | Before state | Disabled |
| New | After state | Enabled |
| Changed By | User email | superadmin@example.com |

### Action Types

- `permission_updated` - Single permission toggled
- `batch_update` - Multiple permissions changed at once
- `permission_reset_to_default` - Permissions reset to defaults

---

## Status Messages

### Success Message

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ Successfully saved 3 permission change(s)                    │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Light green (#dcfce7)
- Border: Green (#16a34a)
- Text: Dark green (#166534)
- Icon: Green checkmark (✓)
- Duration: 5 seconds auto-dismiss

### Error Message

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕ Error saving permissions: Failed to update database          │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Light red (#fee2e2)
- Border: Red (#dc2626)
- Text: Dark red (#991b1b)
- Icon: Red exclamation (✕)
- Duration: Persistent (user must close)

### Loading Message

```
┌─────────────────────────────────────────────────────────────────┐
│  ⟳ Saving permissions...                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Light blue (#dbeafe)
- Border: Blue (#2563eb)
- Text: Dark blue (#1e40af)
- Icon: Spinning loader (⟳)
- Duration: Until operation completes

---

## Checkbox Interaction

### Checkbox States

**Enabled (Checked):**
```
☑ Checkbox is checked
✓ Green checkmark icon
Description: Permission is enabled for this role
```

**Disabled (Unchecked):**
```
☐ Checkbox is unchecked
○ Empty circle icon
Description: Permission is disabled for this role
```

### Hover Behavior

**On Permission Label:**
```
Hover over "?" icon → Tooltip appears
╔─────────────────────────────────┐
│ Edit existing assessments       │
│ (below checkbox, centered)       │
└─────────────────────────────────┘
```

**Tooltip Styling:**
- Background: Dark gray (#1e293b)
- Text: White
- Font size: 12px
- Position: Above element
- Delay: Show on hover
- Arrow: Pointing down to element

---

## Button States

### Normal State

```
[✓ Save Changes]      Green button with white text
[↻ Reset Defaults]    Amber button with white text
[📜 Audit Log]        Blue button with white text
[✕ Close]             Gray button with dark text
```

### Hover State

```
[✓ Save Changes]      Darker green background
                      Slight shadow effect
                      Cursor changes to pointer
```

### Disabled State (Future Enhancement)

```
[✓ Save Changes]      Grayed out
                      Cursor changes to not-allowed
                      No click response
                      Used when no changes made
```

### Loading State

```
[⟳ Saving Changes]    Shows spinner icon
                      Text changes to "Saving..."
                      Button disabled
                      Button disabled until operation completes
```

---

## Responsive Design

### Desktop View (1200px+)

```
┌─────────────────────────────────────────────────────┐
│  Full permission matrix table visible               │
│  All columns: Superadmin, Admin, Trainer, Viewer, User
│  Buttons arranged horizontally                      │
│  Modal width: 90% of screen                         │
└─────────────────────────────────────────────────────┘
```

### Tablet View (768px - 1200px)

```
┌──────────────────────────────┐
│  Permission matrix with      │
│  horizontal scroll if needed │
│  Buttons stack on smaller    │
│  gaps                        │
│  Modal width: 95% of screen  │
└──────────────────────────────┘
```

### Mobile View (<768px)

```
┌─────────────────────────┐
│ Permission Matrix       │
│ Horizontal scroll       │
│ Stacked buttons         │
│ Modal full width minus  │
│ 10px padding on each    │
│ side                    │
└─────────────────────────┘
```

---

## Color Codes

### Role Badge Colors

| Role | Color | Hex Code | Usage |
|------|-------|----------|-------|
| Superadmin | Red | #dc2626 | Headers, badges |
| Admin | Blue | #2563eb | Headers, badges |
| Trainer | Green | #16a34a | Headers, badges |
| Viewer | Gray | #6b7280 | Headers, badges |
| User | Purple | #9333ea | Headers, badges |

### Status Colors

| Status | Color | Hex Code | Usage |
|--------|-------|----------|-------|
| Enabled | Green | #10b981 | Checkmarks, success |
| Disabled | Red | #ef4444 | Empty circles, errors |
| Info | Blue | #3b82f6 | Info messages, tooltips |
| Warning | Amber | #f59e0b | Warning messages |
| Neutral | Gray | #6b7280 | Disabled states |

---

## Accessibility Features

### Keyboard Navigation

```
Tab        → Move between checkboxes and buttons
Space/Enter → Toggle checkbox or click button
Escape     → Close modal
```

### Screen Reader Support

```
<label>
  <input type="checkbox" aria-label="Edit Assessment for Admin" />
  Edit Assessment
</label>
```

### Color Contrast

- ✓ All text meets WCAG AA standard (4.5:1 ratio)
- ✓ Icons have descriptive tooltips
- ✓ Form labels associated with inputs
- ✓ Error messages clearly identified

### Focus Indicators

```
When focused:
□ Checkbox shows blue border
[Button] shows blue outline
Tooltip appears on focus (not just hover)
```

---

## Example Workflows

### Workflow 1: Grant Trainer Edit Permission

1. **Start:** User Management page open
2. **Action:** Click "Permission Editor"
3. **Result:** Modal opens, matrix loads
4. **Action:** Find "Edit Assessment" row
5. **Action:** Click checkbox in "Trainer" column
6. **Result:** Checkbox checked (☑)
7. **Action:** Click "Save Changes"
8. **Result:** Loading message appears
9. **Wait:** Operation completes (2-3 seconds)
10. **Result:** Success message displays
11. **Result:** Unsaved indicator (*) disappears from title

### Workflow 2: Audit Trail Review

1. **Start:** Permission Editor open
2. **Action:** Click "Audit Log"
3. **Result:** Audit Log modal opens
4. **Result:** Last 100 changes displayed
5. **Action:** Scroll down to see older changes
6. **Action:** Review who changed what and when
7. **Result:** Filter by role if needed
8. **Action:** Close audit log when done

### Workflow 3: Emergency Reset

1. **Start:** Discovered permissions misconfigured
2. **Action:** Open Permission Editor
3. **Action:** Click "Reset to Defaults"
4. **Result:** Confirmation dialog
5. **Action:** Click "Yes" to confirm
6. **Result:** All permissions reset to system defaults
7. **Result:** Audit log shows reset action
8. **Action:** Make targeted changes if needed

---

## Unsaved Changes Indicator

### Visual Feedback

**Normal Title:**
```
Permission Matrix Editor
```

**With Unsaved Changes:**
```
Permission Matrix Editor *
     ↑ Asterisk indicates unsaved changes
```

**Removal:**
```
After clicking "Save Changes" and success:
Asterisk automatically removed
New title: "Permission Matrix Editor"
```

---

## Tooltips & Help Text

### Permission Descriptions

When hovering over [?] icon:

```
Tooltip appears with permission description:

Create Assessment    → "Create new assessments"
Edit Assessment      → "Edit existing assessments"
Delete Assessment    → "Delete assessments"
Publish Assessment   → "Publish assessments for use"
View Results         → "View assessment results"
Manage Users         → "Manage user accounts"
Send to Trainees     → "Send assessments to trainees"
View Analytics       → "View analytics and reports"
Manage Roles         → "Manage roles and permissions"
Access Admin Dash    → "Access admin dashboard"
```

### Info Messages

**At top of modal:**
```
ℹ️  SUPERADMIN ONLY: Customize role permissions by toggling 
checkboxes. Changes are automatically saved to the audit log.
```

**At bottom (Legend):**
```
💡 LEGEND
☑ Permission Enabled    │ ☐ Permission Disabled  │ [?] Hover for description
```

---

## Error States

### Failed to Load Permissions

```
┌─────────────────────────────────────────────────────┐
│  Permission Matrix Editor                       [×] │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ✕ Error loading permissions: Connection timeout   │
│                                                       │
│  Please refresh the page or try again.              │
│                                                       │
│                          [↻ Retry] [✕ Close]        │
└─────────────────────────────────────────────────────┘
```

### Unauthorized Access

```
┌─────────────────────────────────────────────────────┐
│  Permission Matrix Editor                       [×] │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ✕ Access Denied                                   │
│                                                       │
│  Only superadmins can manage permissions.          │
│  Contact your administrator for assistance.        │
│                                                       │
│                                    [✕ Close]        │
└─────────────────────────────────────────────────────┘
```

---

## Animation & Transitions

### Checkbox Toggle

```
When clicking checkbox:
- Instant visual response
- No animation delay
- Smooth transition to new state (100ms)
- Focus indicator visible
```

### Modal Open/Close

```
Modal Opening:
- Fade in background (200ms)
- Slide down modal (300ms)
- Ease-out timing function

Modal Closing:
- Slide up modal (200ms)
- Fade out background (150ms)
- Ease-in timing function
```

### Status Message

```
Success Message:
- Fade in (300ms)
- Display for 5 seconds
- Fade out (300ms)

Error Message:
- Fade in (300ms)
- Stay visible until dismissed
```

---

## Performance Indicators

### Loading States

**Initial Load:**
```
⟳ Loading permissions...
(Shows spinner + text)
```

**Saving:**
```
⟳ Saving permissions...
(Button becomes loading state)
```

**Audit Log Loading:**
```
⟳ Loading audit log...
(Modal shows loading indicator)
```

---

## Summary

The Permission Visual Editor provides:

✓ **Intuitive Matrix UI** - Checkboxes for easy permission management
✓ **Real-time Feedback** - Instant save/error messages
✓ **Visual Indicators** - Color-coded roles, clear status badges
✓ **Audit Trail** - Complete history of all changes
✓ **Responsive Design** - Works on all screen sizes
✓ **Accessibility** - Keyboard navigation, screen reader support
✓ **Professional Polish** - Smooth animations, clear messaging

---

## Related Files

- Frontend Component: `PERMISSION_EDITOR_FRONTEND.html`
- Backend API: `PERMISSION_EDITOR_BACKEND_API.js`
- Database Schema: `PERMISSION_EDITOR_DATABASE.sql`
- Integration Guide: `PERMISSION_EDITOR_INTEGRATION_GUIDE.md`
- Technical Docs: `PERMISSION_EDITOR_TECHNICAL_DOCS.md`

Last Updated: 2024
Version: 1.0.0
