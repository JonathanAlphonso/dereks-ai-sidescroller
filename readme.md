# Procedural Sidescroller Arena

A Phaser 3 prototype featuring a procedural arena filled with platforms. Defend yourself from waves of enemies that spill in from the left and right edges while chaining physics-based attacks and landing shockwave-inducing ground pounds.

## Getting started

This project does not require a build step. Launch a static file server from the repository root and open `index.html` in a browser that supports ES modules.

```bash
npx serve .
```

Then visit the URL printed in the terminal (typically http://localhost:3000).

## Controls

- **A / D** – Move left and right
- **W** or **Space** – Jump
- **S** (while airborne) – Ground pound to trigger a landing shockwave
- **J** – Jab (quick horizontal strike)
- **K** – Uppercut (strong vertical launcher)
- **L** – Spike (downward slam)
- **U** – Diagonal launcher (45° strike)
- **Enter / Space / R** (on Game Over) – Retry the run immediately

## Gameplay details

- The arena floor and elevated platforms are procedurally generated each session.
- Enemy waves spawn from both sides of the arena and immediately hunt the player.
- Every attack spawns a physics-driven hitbox that imparts directional knockback, stun, and damage.
- The ground pound cancels horizontal momentum, accelerates the player downward, and releases a radial shockwave upon landing.
- Taking rapid deceleration damage: both the player and enemies receive impact damage proportional to the velocity they lose when colliding with the ground or walls.
- Enemy behavior is simple but relentless: they sprint toward the player, jump to close vertical gaps, and swipe when in range.
- A neon-drenched backdrop, aurora sky, and reactive particles keep the arena visually alive between waves.
- A dedicated game-over panel with a Retry button (and Enter/Space/R shortcuts) lets you jump straight back into the action.

Survive as many waves as possible!
