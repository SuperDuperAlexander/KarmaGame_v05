# WP-19a decisions

- Read the existing test hook. Do not add test-only ways to change the game.
- Use real keys and Chromium touch input. Do not send page pointer events by hand.
- Renew held movement keys each steering step. A hot reload can otherwise clear the page input while the test still holds a key.
- Use browser touch IDs [identifiers] to keep the move stick and Run separate.
- Read camera direction for both worlds. The inner view can use a different angle.
- End each move and let it settle before the next action.
- Release input before each state read. A slow browser reply must not leave the player moving for many seconds.
- Run browser cases one at a time. Shared trace output and software rendering need one stable run.
