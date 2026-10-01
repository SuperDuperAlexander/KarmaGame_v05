# Begin Vertical Slice v0.1

The character rigging proof of concept was successful.

We are now ready to begin implementing the actual game.

Read `GAME_MASTER_SPEC.md` and `3D_ASSET_GENERATION_MASTER.md` before making architectural decisions.

## Important Asset Situation

The final optimized GLB assets are currently still being generated and optimized.

DO NOT wait for them.

Begin implementing the game now.

Use the existing player asset where available.

For every other missing asset, use either:

1. the currently available temporary GLB, or
2. a simple placeholder.

The architecture MUST allow every visual asset to be replaced later without changing gameplay code.

---

# Critical Architecture Rule

Separate gameplay entities from visual assets.

Gameplay logic must never depend directly on the internal structure of a temporary GLB unless explicitly required.

Use a structure conceptually similar to:

Game Entity
→ Transform
→ Collision
→ Interaction
→ State
→ Visual Component
→ GLB Asset

Movement and collisions must be controlled independently of the visual mesh.

For the player, use a collision capsule or equivalent gameplay collider.

The GLB character is only the visual representation attached to the player controller.

---

# Asset Registry

Create a centralized asset registry.

Each asset should be referenced through a stable logical ID such as:

Player

FinancePackage

CentralTreeOuter

CentralTreeInner

AttachmentBeetle

Merchant

MarketStallA

etc.

Store per-asset configuration such as:

- file path
- scale
- rotation
- positional offset
- optional LOD configuration
- collision configuration
- animation mapping where relevant

Replacing an asset later should ideally require changing only its asset configuration.

Do not scatter GLB file paths throughout the codebase.

---

# Current Objective

Build the first playable Vertical Slice defined in the Master Spec.

Implement:

Start Area

→ Player receives Finance Package

→ City Gate

→ Central Square

→ Central Tree

→ Look Within

→ transition to Inner World

→ Inner Tree / Roots / Source area

→ Finance Package

→ Reflection:

"What does money mean to you?"

→ save player's response

→ return to Outer World

→ Joy Market

→ Attachment event

→ "I want more..." Thought Wave

→ Look Within

→ Attachment Beetle appears

STOP THERE.

Do not continue into the complete Fear or final Exchange storyline yet.

---

# Systems to Establish

Build reusable foundations for:

- Player Controller
- Third-Person Camera
- Input
- Interaction System
- Asset Registry / Asset Loader
- World State
- Trait System
- Event + Condition System
- Outer World
- Inner World
- Look Within transition
- Reflection System
- Thought Wave System
- basic NPC system
- Save State
- Debug tools

Follow the architecture described in the Master Spec.

---

# World State

The world must be driven by shared state rather than a rigid quest script.

For example:

fear

attachment

trust

contentment

packageReceived

packageResolved

marketEventExperienced

attachmentDiscovered

financialReflectionStart

financialReflectionEnd

innerWorldVisited

etc.

Both Outer World and Inner World must react to this shared state.

Use events and conditions so the player can later explore areas in different orders.

---

# Temporary Assets

Temporary assets are acceptable.

Clearly mark them as temporary.

Do NOT spend significant time polishing placeholder geometry.

Focus development effort on:

- gameplay
- architecture
- interaction
- movement
- camera
- state
- transitions
- atmosphere systems

Final GLBs will be inserted later.

---

# Visual Direction

Even with placeholders, establish the core visual systems:

- lighting
- fog
- atmosphere
- basic particles
- color grading where appropriate
- Thought Waves
- Source Water prototype
- Inner World atmosphere

Do not attempt final visual polish yet.

---

# Performance

Maintain the mobile-first architecture defined in the Master Spec.

Avoid architectural choices that will become expensive when the final assets arrive.

Use:

- asset reuse
- instancing / thin instances where appropriate
- lazy loading
- scene/zone loading
- limited dynamic lighting
- controlled particles
- inexpensive distant scenery

Keep debug performance information available during development.

---

# Development Rule

Do not stop simply because a final GLB is unavailable.

Use a placeholder and continue.

Do not redesign final assets.

Do not generate replacement artwork unless necessary for a functional placeholder.

Document all placeholder assets so they can later be replaced systematically.

---

# First Milestone

The milestone is complete when I can:

1. launch the game
2. control the animated player
3. receive the package
4. enter the city
5. reach the Central Tree
6. activate Look Within
7. enter the Inner World
8. approach the package/root area
9. answer "What does money mean to you?"
10. return to the Outer World
11. enter the market
12. experience the Attachment event
13. encounter the "I want more..." Thought Wave
14. return to the Inner World
15. discover the Attachment Beetle

At this point STOP and report the result.

Do not continue implementing the rest of the game automatically.

Document important architectural decisions as you work.

Make reasonable implementation decisions independently and do not ask unnecessary questions.