# LogicSolver

A grid for solving logic puzzles. The user enters clues and the app deduces the rest.

---

## Contents

- [Running it](#running-it)
- [The grid](#the-grid)
- [Controls](#controls)
- [Solving logic](#solving-logic)
- [Project structure](#project-structure)

---

## Running it

```
npm install --legacy-peer-deps
npm start
```

The app serves at `http://localhost:4200/` and reloads on save.

```
npm test           # vitest, via ng test
npm run build      # production bundle into dist/
npm run docs       # compodoc, generated into documentation/ and served
npm run docs:build # compodoc into documentation/, without the server
```

`--legacy-peer-deps` is required while `@angular-architects/ngrx-toolkit` declares Angular 21 peers.

Every PR into `master` runs the tests and the production build, and has its patch version bumped for it. A branch that already carries a minor or major bump is left alone. Merging to `master` publishes the compodoc output to GitHub Pages.

---

## The grid

A puzzle is a set of **features**, each holding the same number of **options**.

```
Pet:      Rabbit, Rat, Lion, ...
Vehicle:  Bike, Canoe, Tractor, ...
Name:     Alice, Bob, Carol, ...
```

Every option belongs to exactly one feature, and every option matches exactly one option in each of the other features. A **cell** sits where two options from different features cross and can hold an X or an O. An X means those two options are not a match. An O means they are.

---

## Controls

| Action | Result                                                                     |
|---|----------------------------------------------------------------------------|
| Click a cell | Opens O, X and clear                                                       |
| `x` on a selected cell | Cancels out of it                                                          |
| Type in a header | Renames the feature or option on enter or blur                             |
| `-` on a header | Deletes that feature, or the option in that number slot from every feature |
| `+` at the end of a row or column | Adds a feature or an option to every feature                               |
| Clear Cells | Empties the cells in the grid, keeping features and options                |
| Undo, or `ctrl` + `z` | Walks the grid back one move                                               |
| Redo, or `ctrl` + `shift` + `z` or `ctrl` + `y` | Makes the newest undone move again                                         |

On a Mac the shortcuts take `cmd` in place of `ctrl`. While a header is being typed in, `ctrl` + `z` undoes the typing rather than the move.

---

## Solving logic

Only the user's Xs and Os are stored. Everything the grid shows is derived from **candidate sets**: every option carries a set of the options it could still match in each other feature.

`LogicService` builds a fresh candidate map, applies the entered values, then repeats three rules until a full pass changes nothing:

1. An X removes an option from another's candidate set and vice versa.
2. An O, or a set that has come down to a single candidate, removes that candidate from every sibling option in the feature.
3. If an option's candidates in one feature all rule out some option in a third feature, that third option is ruled out too.

A cell reads as an O when one candidate is left, an X when the pairing is gone from the set, and stays empty otherwise.

---

## Project structure

| Path | Holds |
|---|---|
| `store/` | The signal store, its entity config, and the stacks of moves to undo and redo |
| `services/store.service.ts` | Adds and deletes features, options and cells, and hands back what an undo of that needs |
| `services/undo-redo.service.ts` | Walks the grid back and forward through the recorded moves |
| `services/logic.service.ts` | Candidate sets and the deduction rules |
| `services/tile.service.ts` | Builds the flat tile array the grid renders, row by row |
| `services/color.service.ts` | Every color the grid draws |
| `components/grid/` | The grid and its cell and header components |
| `constants/tile.const.ts` | The starting shape of each tile type, with a diagram of how they sit on the grid |
| `directives/base.directive.ts` | The services the grid components share |
| `types/` | Entities, tiles, moves, solver types and store state |

Entity relationships and collection methods come from [signalkin](https://www.npmjs.com/package/signalkin).
