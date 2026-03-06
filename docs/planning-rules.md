# Planning Rules

This document describes the business rules enforced by the Weekly Planner system.
All rules are validated server-side in the Domain / Application layers.

## Planning Week Lifecycle

1. **Draft** → Created by Team Lead (Tuesday-only enforcement)
2. **Active** → Category percentages set, members assigned
3. **Frozen** → Immutable snapshot, no further edits allowed
4. **Completed** → Archived for historical reference

## Core Rules

### Week Creation
- Planning weeks can **only** be created on Tuesdays (server-validated)
- Each week must have a unique start date

### Member Allocation
- Each member is allocated exactly **30 hours** per week
- Hours are distributed across categories based on the Team Lead's percentage allocation
- Category percentages **must sum to 100%** (±0.01 tolerance)

### Category Budget
- Three categories: `ClientFocused`, `TechDebt`, `RnD`
- Per-member budget = `(categoryPercent / 100) × 30` hours
- Members cannot exceed their category hour limit

### Task Assignment
- Tasks are pulled from the Backlog
- Each task has estimated hours and a category
- A member's total assigned hours per category ≤ category budget

### Freeze Rules
- All members must have submitted their plans
- All members must have exactly 30 hours planned
- Category budgets must match allocated percentages
- Once frozen, **no modifications** are allowed (immutable state)

### Backlog Items
- Items belong to one of three categories: `ClientFocused`, `TechDebt`, `RnD`
- Items have lifecycle states: `Active`, `Archived`
- Only the Team Lead can create/archive backlog items
