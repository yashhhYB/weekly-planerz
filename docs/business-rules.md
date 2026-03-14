# Business Rules

Core constraints are enforced server-side:

- Planning week creation allowed only on Tuesday
- Category allocations must total 100% (tolerance-aware)
- Member planning limited by the 30-hour policy
- Frozen plans cannot be modified
- Status transitions are controlled: `Setup -> InProgress -> Completed -> Archived`

These invariants prevent invalid state transitions and maintain consistent planning outcomes.
