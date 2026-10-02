# Plan: Finance MVP (Phase B) — the full story after the beetle

- Date: 2026-10-02. User instruction: implement the remaining story, all levels and mechanics. Delegate to Sonnet.
- This replaces the old scope stop "end at the attached beetle" for Phase B work. The user must update the scope line in `AGENTS.md`.
- Source of truth: `GAME_MASTER_SPEC.md` §1–§5, §7–§10, §21 content rules. Every rule in §1 and §4 stays: no score, no diagnosis, no money promise, no karma fact, lower position = active help, never kneeling, free choices never lock content.

## Contracts (lead, done in WP-B0)

- `src/contracts/state.ts`: new facts (`MvpEventFact`, `StoryFact`), `ActorId`, `ActAction`, `ReflectionPrompt`. `Signal.id`. New signal types `spot`, `zone-enter`, `choice`, `story-closed`. `Rule.signalId`. New effects `counter`, `story`, `story-end`, `act`; `wave` gets `actor` and `tone`; `panel` gets `prompt`.
- `src/contracts/story.ts`: `MicroStory`, `StoryStep`, `StoryChoice`, `SpotData`, `ZoneData`.
- `src/contracts/ui.ts`: `UiService.story(view)`, `StoryView`, `UiCommands.choose`, `UiCommands.leaveStory`, `reflection(text, question?)`.
- `src/contracts/visual.ts`: optional `Visual.play(action, loop?)`.
- `src/content/places.ts`: all story places (one table for rules and visuals).
- Rule engine: a rule with `signalId` fires only for a signal with the same `id`.

## Story design (open net, any order after the City Gate)

| Story | Place | Steps and free choices | Facts and counters |
|---|---|---|---|
| Merchant and the heavy crate | `serviceCrate` → `serviceCrateDrop`, then `merchant` | Merchant cannot lift a crate. Choices: "Lift the other side" / "Not now". Help = both carry the crate to the stall (act `carry`, no kneeling). Later the merchant offers a small gift: "Accept with thanks" / "Decline kindly". | `MERCHANT_MET`, `CRATE_CARRIED`, `SERVICE_OFFERED`, serviceActs +1; `GIFT_OFFERED`; `GIFT_ACCEPTED` → `RECEIVE_COMPLETED`, receiveCount +1; or `GIFT_DECLINED` |
| Fear Child and the missing coin | `fearChild`, `lostCoin` | Child is sure a lost coin makes everything unsafe. Choices: "Help search" / "Listen" / "Walk on". Search → coin found at `lostCoin` → return it. Listen → short talk. After either: optional "Give a coin from your package" / "Keep it". | `CHILD_MET`, `FEAR_TRIGGERED` (fear +0.2), `COIN_SEARCHED`, `COIN_FOUND`, `CHILD_LISTENED`; give → `CHILD_GIVEN`, `GIVE_COMPLETED`, giveCount +1 |
| Dark NPC and closed exchange | `darkNpc` in the west dark district (`zone-enter` id `dark-district`) | Short closed thought waves ("It always goes wrong."). Choices: "Listen for a while" / "Leave him be". Listening is giving time. He is not healed. | `DARK_MET`, `FEAR_TRIGGERED`; listen → `DARK_LISTENED`, `GIVE_COMPLETED`, giveCount +1 |
| Citizen who gives too much | `giver` | A tired person gives everything away. Choices: "Suggest a rest" / "Say nothing". Rest → she offers you a fruit: "Accept" / "Decline". Shows: giving needs limits. | `GIVER_MET`, `GIVER_RESTED`; accept → `GIVER_GIFT_ACCEPTED`, `RECEIVE_COMPLETED`, receiveCount +1 |
| Citizen who cannot receive | `receiver` | A person refuses help from shame. Choices: "Offer once more, gently" / "Respect the no". Offer → he accepts. Shows: receiving is an active skill. | `RECEIVER_MET`; offer → `RECEIVER_ACCEPTED`, `SERVICE_OFFERED`, serviceActs +1 |
| Exchange Guide | `exchangeDoor`, `guide` (north, new street) | The guide asks: "Can both sides leave with dignity?" Offers tea: "Accept" / "Decline". When give and receive were both lived, the guide opens the way to the end. | `EXCHANGE_HOUSE_ENTERED`, `GUIDE_MET`; tea → `GUIDE_TEA_ACCEPTED`, `RECEIVE_COMPLETED`; `EXCHANGE_UNDERSTOOD` when `GIVE_COMPLETED` and `RECEIVE_COMPLETED` |
| Beetle transformation (inner) | `beetleObserve` | After `ATTACHMENT_SEEN`: hold "Observe" → beetle `observed`; then choice "Let it go" / "Stay a while". Let go → beetle `released` → `transformed` (calm, soft warm glow, never killed). Chain goes loose. | `BEETLE_OBSERVED`, `BEETLE_RELEASED`, `ATTACHMENT_TRANSFORMED`, attachment −0.3 |
| Finale (outer) | `finale` at the Source Water | When tree, money reflection (saved or skipped), service, give, receive and transformation are all lived: hold "Sit by the water" → end image (water bright, tree glow, chain gone, light motes). Optional reflection "What is enough for you?" (save or skip). | `FINANCE_MVP_COMPLETE`, `FINALE_SEEN`, `ENOUGH_REFLECTION_SAVED` |

- No lockout: give has 3 ways (child, dark NPC, giver story via receive), receive has 3 ways (merchant gift, giver fruit, guide tea). Declining is never punished. The guide always offers tea, so receive is always reachable.
- Inner mirrors (spec §8.3), all from selectors: `FEAR_SEEN` (inner-active after `FEAR_TRIGGERED`) → cold dark root zone at `innerFearZone`; give/receive → water flows between `basinLeft` and `basinRight` (more with both counts); serviceActs → small plants rise at `servicePlants`; transformation → beetle calm, chain loose.
- Hints guide softly toward stories not yet seen. Never "wrong", never a score.

## Work packages

| WP | Name | Model | Wave | Owns |
|---|---|---|---|---|
| B0 | Contracts, places, plan | Opus (lead) | 0 | contracts, `src/content/places.ts`, rule engine `signalId` |
| B1 | Rules, story data, selectors, hints, strings, headless journeys | Sonnet | 1 | `src/narrative/`, `src/state/selectors.ts`, `src/content/strings.en.ts`, `src/reflection/`, tests |
| B2 | Story panel UI, data-driven spots and zones, app wiring of new effects | Sonnet | 1 | `src/ui/`, `src/interaction/`, `src/app/app.ts` (effect wiring grant), tests |
| B3 | Outer levels: north street + Exchange House, dark district, service corner, NPC placement, crate and coin props | Sonnet | 2 (after WP-43) | `src/world/outer/`, `src/npc/`, `src/assets/registry/outer.ts` |
| B4 | Inner mirrors, beetle states observed/released/transformed, finale image | Sonnet | 2 (after WP-43) | `src/world/inner/`, `src/creatures/`, `src/presentation/`, `src/props/` |
| B7 | Action clips: help, carry, give, receive, talk, listen, search, relief for the shared rig; `Visual.play` | Sonnet | 2 | `tools/rig/`, `src/assets/feature.ts`, `src/assets/registry/characters.ts` |
| B5 | Full MVP browser journeys (desktop + touch, two orders, reload) | Sonnet | 3 | `tests/e2e/` |
| B6 | Content and safety review | Haiku draft, Opus final | 3 | report only |
