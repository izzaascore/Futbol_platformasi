---
name: animation_and_taste
description: >
  Emil Kowalski animation guidelines, spring physics, and high-taste UI design.
  Use when designing, building, or refining frontend components, buttons, micro-interactions,
  modals, and transitions in React, Tailwind, and Framer Motion.
---

# Emil Kowalski Animation & High-Taste UI Skill

Use this skill whenever building or refining UI components in the football platform.

## 1. Physics Over Easing
- Use natural spring dynamics instead of arbitrary duration easings.
- Standard interactive spring: `{ type: "spring", stiffness: 400, damping: 30 }`
- Modal/Drawer entrance spring: `{ type: "spring", stiffness: 300, damping: 25 }`
- Snappy tab indicator transition: `{ type: "spring", stiffness: 500, damping: 35 }`

## 2. Hardware Acceleration
- Animate only `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.
- Use Framer Motion's `layout` and `layoutId` for smooth layout transitions without measuring DOM dimensions.

## 3. Tactile Responsiveness
- Add micro-feedback to every touchable element:
  - Button press: `whileTap={{ scale: 0.96 }}`
  - Card hover: `whileHover={{ y: -4, transition: { duration: 0.2 } }}`
  - Active state: `active:scale-95`

## 4. Visual Restraint & Polish
- Rely on rich contrast, obsidian depth (`#050505`), frosted borders (`border-stone-800`), and purposeful typography.
- Avoid cluttered interfaces. Generous spacing with tight typographic kerning.
