# WP-B1 decisions

- Setter then presenter: one rule sets a fact once, the next rule opens the story step. Presenter conditions exclude each other.
- Rule IDs are `M-<signalId>`, with a letter for later rules of the same id. IDs of once-rules enter saves, so do not rename them.
- Facts guard every step. A prompt shows only when a rule can answer it. Leaving a story changes nothing.
- FINANCE_MVP_COMPLETE is set when the player sits at the water, not when the 6 facts are met. The finale image should not show before.
- The finale reflection is optional. It can be reopened at the water until saved or skipped.
- Declined gifts have no fact except GIFT_DECLINED. They can be offered again by the same person.
- Child coin return uses CHILD_LISTENED as "talk done". No new fact was added to the contract.
- Beetle release and transformation happen in one step. This keeps the player from a half state.
- Generic EXCHANGE_UNDERSTOOD rules run last in the rule list, so they see the facts from the same signal.
- Slice zones stay in the app. `zones` lists only new zones. Slice rules Z-city, Z-tree, Z-market also accept `zone-enter`.
- Counters start at 0 in the initial state and in old saves.
- Hints come from `nextHint(state, world)`. It uses state only. It never says "wrong" and never counts.
- Words: no score, no diagnosis, no reward promise, no karma fact, no kneeling. A content test scans all text.
