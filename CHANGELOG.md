# Changelog

All notable changes to this project will be documented in this file.

### [1.18.1](https://github.com/dmitrijs/WorkLogIfy/compare/v1.18.0...v1.18.1) (2020-04-11)


### UI/UX

* **tasks:** animate tasks list ([327bffc](https://github.com/dmitrijs/WorkLogIfy/commit/327bffcdd29cbb96e6169f73ca162d72a4e7fad3))

## [1.18.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.17.4...v1.18.0) (2020-04-11)


### Features

* **tasks:** support task copy&paste ([72fb156](https://github.com/dmitrijs/WorkLogIfy/commit/72fb156385d8961642078ab2422ae97e200a16c0))
* **tasks:** support task cut&paste ([42daa53](https://github.com/dmitrijs/WorkLogIfy/commit/42daa535dbe175fe7ee814d35b7db822a77a51fb))


### Bug Fixes

* **tasks:** do not select the bottom task when right clicking on empty area ([32a58d7](https://github.com/dmitrijs/WorkLogIfy/commit/32a58d7765ed5f4bf40cb9a62889ca7e75f0c221))


### UI/UX

* **tasks:** clear selection when empty area is clicked ([f622215](https://github.com/dmitrijs/WorkLogIfy/commit/f62221524e0d9599aa57451e029f20520d0e4509))

### [1.17.4](https://github.com/dmitrijs/WorkLogIfy/compare/v1.17.3...v1.17.4) (2020-04-11)


### Features

* **calendar:** calculate overtime; show a warning if overtime exceeds 2 hours ([b5ddf88](https://github.com/dmitrijs/WorkLogIfy/commit/b5ddf886dc5014f15a165e32b4dae6f38645a7a0))

### [1.17.3](https://github.com/dmitrijs/WorkLogIfy/compare/v1.17.2...v1.17.3) (2020-04-09)


### UI/UX

* **tasks:** show full notes by default ([b9d923b](https://github.com/dmitrijs/WorkLogIfy/commit/b9d923ba3b248bf2ce3f1ca5286345793fb9c603))

### [1.17.2](https://github.com/dmitrijs/WorkLogIfy/compare/v1.17.1...v1.17.2) (2020-04-04)


### Features

* **drag&drop:** show progress bar in the ghost ([018e565](https://github.com/dmitrijs/WorkLogIfy/commit/018e565241a4c52ce2b376ade15b7b18ff71c82e))


### Bug Fixes

* **drag&drop:** drag the spent (not charge) time ([5064d0a](https://github.com/dmitrijs/WorkLogIfy/commit/5064d0af360063281f93dbdcdea3b3091684c229))
* **drag&drop:** ignore drag&drop of time from a task to itself ([8d9b647](https://github.com/dmitrijs/WorkLogIfy/commit/8d9b6473166d507801d0be7d254867f13d1f0a3c))


### UI/UX

* **drag&drop:** only show the moved time ([b363df3](https://github.com/dmitrijs/WorkLogIfy/commit/b363df3cb0989cac11b73ce5d8d2323401451362))

### [1.17.1](https://github.com/dmitrijs/WorkLogIfy/compare/v1.17.0...v1.17.1) (2020-04-01)


### UI/UX

* drag&drop improvements ([bc274e9](https://github.com/dmitrijs/WorkLogIfy/commit/bc274e9f12a15c396cd66dacbdab79ee2298203c))

## [1.17.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.16.0...v1.17.0) (2020-03-31)


### Features

* allow time drag&drop ([d841e76](https://github.com/dmitrijs/WorkLogIfy/commit/d841e761a890ed6556373634c3c7c25cf63859ca))

## [1.16.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.15.0...v1.16.0) (2020-03-31)


### Features

* added button that opens the following day ([9e46650](https://github.com/dmitrijs/WorkLogIfy/commit/9e46650fcc71b185813036f1df9258f379ded4b5))
* **tasks:** combined active tasks list and report into one screen ([01cdc84](https://github.com/dmitrijs/WorkLogIfy/commit/01cdc84aa67a7f6a9a58461309ec5351930a5f53))


### Bug Fixes

* debug mode toggling fixes ([dde61c8](https://github.com/dmitrijs/WorkLogIfy/commit/dde61c85ad6137c6fa6ba6de3314b8c70b38aa6a))


### UI/UX

* deprecated the 'List (report)' screen ([607467f](https://github.com/dmitrijs/WorkLogIfy/commit/607467fafd4e41463d3be6219f93451f64cfb0ab))

## [1.15.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.8...v1.15.0) (2020-03-30)


### Features

* **tasks:** allow specifying amount of time that was recorded to the time tracking system ([438ed1c](https://github.com/dmitrijs/WorkLogIfy/commit/438ed1c98e3d6812a54ddd22040e3890d83d7ace))
* **tasks:** show a line chart of the task timespan ([b09c94d](https://github.com/dmitrijs/WorkLogIfy/commit/b09c94df3ed1f53c872ff27e7e0a48d5ce1305eb))


### Bug Fixes

* **tasks:** fix charge extra seconds calculation ([8b9d58a](https://github.com/dmitrijs/WorkLogIfy/commit/8b9d58ac921e9db2804cc1dfd939273c34334ad5))

### [1.14.8](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.7...v1.14.8) (2020-03-29)


### UI/UX

* added app icon ([428a46b](https://github.com/dmitrijs/WorkLogIfy/commit/428a46bcd5eafb528bc839f9010f53eb1335f81b))

### [1.14.7](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.6...v1.14.7) (2020-03-11)


### Bug Fixes

* **templates:** do not overwrite the title or code with empty values when applying a template ([39d5818](https://github.com/dmitrijs/WorkLogIfy/commit/39d5818461db09d81d0669b879bc13e2a641afc6))

### [1.14.6](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.5...v1.14.6) (2020-03-02)


### Bug Fixes

* handle cases when task title is not defined ([32f5ccd](https://github.com/dmitrijs/WorkLogIfy/commit/32f5ccd21ae8819315e6ba0c0fcab7e4dc048859))

### [1.14.5](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.4...v1.14.5) (2020-02-27)


### Features

* **templates:** add 'title' and 'frozen' to the task templates ([b039c11](https://github.com/dmitrijs/WorkLogIfy/commit/b039c1102ac62a4c405fe6dccfb32ff881002483))

### [1.14.4](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.3...v1.14.4) (2020-02-21)


### Bug Fixes

* **menu:** terminate app properly on Quit menu click ([dd1b295](https://github.com/dmitrijs/WorkLogIfy/commit/dd1b295ea5c922b3580811f0ab23c4319babe109))
* **task edit:** ignore invalid adjustment time ([b100939](https://github.com/dmitrijs/WorkLogIfy/commit/b1009398c9f6eeda3f5277c13a1be3b1ce314ed5))

### [1.14.3](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.2...v1.14.3) (2020-02-17)


### Features

* allow changing templates order ([596d657](https://github.com/dmitrijs/WorkLogIfy/commit/596d657d2b22ed46a438b02f9f7b8b1a37b207c7))


### UI/UX

* combine "create" and "start" buttons into one ([67134f4](https://github.com/dmitrijs/WorkLogIfy/commit/67134f48a6fa99f35faca45f895ea8ea5137d1e5))
* indicate that task being edited is currently active ([f637920](https://github.com/dmitrijs/WorkLogIfy/commit/f637920b73bdf53df132443f9d5aff6d028623ad))

### [1.14.2](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.1...v1.14.2) (2020-02-15)

### [1.14.1](https://github.com/dmitrijs/WorkLogIfy/compare/v1.14.0...v1.14.1) (2020-02-15)


### Bug Fixes

* submit task edit form on "enter" key press ([a411fd1](https://github.com/dmitrijs/WorkLogIfy/commit/a411fd15846520b6501e9da5ea18be30fa970b32))

## [1.14.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.13.2...v1.14.0) (2020-02-15)


### Features

* enable spell checker ([bc05488](https://github.com/dmitrijs/WorkLogIfy/commit/bc054887fbf8f78085b3c5447ad576161a857a80))

### [1.13.2](https://github.com/dmitrijs/WorkLogIfy/compare/v1.13.1...v1.13.2) (2020-02-13)


### Features

* added button to create a task and start the timer immediately ([2778b45](https://github.com/dmitrijs/WorkLogIfy/commit/2778b454630b14a34d9fe3f07b9016779072f7f8))

### [1.13.1](https://github.com/dmitrijs/WorkLogIfy/compare/v1.13.0...v1.13.1) (2020-02-12)


### Features

* allow switching active (timer) task in one click ([884be5f](https://github.com/dmitrijs/WorkLogIfy/commit/884be5f65b95c564698693d6e4ae9d9c17dcd590))


### Bug Fixes

* clear task "Edit" form when "New" button is clicked ([0976130](https://github.com/dmitrijs/WorkLogIfy/commit/09761303028e29bc6375c3860199b856924fa9d3))

## [1.13.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.7...v1.13.0) (2020-02-10)


### Features

* task templates ([2b2198d](https://github.com/dmitrijs/WorkLogIfy/commit/2b2198dd0e60b124316eea3d093585a43db21602))

### [1.12.7](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.6...v1.12.7) (2020-02-10)


### Features

* extract task code from Jira URL ([304e555](https://github.com/dmitrijs/WorkLogIfy/commit/304e5551a50aaf301a78ff421f2195dfd30b33ed))


### Bug Fixes

* remove unneeded extra characters when combining task titles and descriptions ([e93e530](https://github.com/dmitrijs/WorkLogIfy/commit/e93e530ec687f0774556afdd1025f809a6589b21))

### [1.12.6](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.5...v1.12.6) (2020-02-08)


### Features

* added Quit menu item ([38b3064](https://github.com/dmitrijs/WorkLogIfy/commit/38b30649cc4bcd5e6665c2fc043e67b625052821))
* show timer status in the window title ([055459b](https://github.com/dmitrijs/WorkLogIfy/commit/055459b26534aeb8a3909ab66ebbb987f5b0c909))


### Bug Fixes

* ignore empty tasks when looking for duplicates ([e0c41aa](https://github.com/dmitrijs/WorkLogIfy/commit/e0c41aad3a059e13af871f41c840442a39d921cd))

### [1.12.5](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.4...v1.12.5) (2020-02-06)

### [1.12.4](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.3...v1.12.4) (2020-02-06)

### [1.12.3](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.2...v1.12.3) (2020-02-06)

### [1.12.2](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.1...v1.12.2) (2020-02-06)

### [1.12.1](https://github.com/dmitrijs/WorkLogIfy/compare/v1.12.0...v1.12.1) (2020-02-02)

## [1.12.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.11.0...v1.12.0) (2020-02-02)


### Features

* **calendar:** Show monthly charged ([7267d32](https://github.com/dmitrijs/WorkLogIfy/commit/7267d32b164fb32f3193dbca3c37a63dc6986f29))
* **dev:** Added Reload action to the main menu ([9dfb554](https://github.com/dmitrijs/WorkLogIfy/commit/9dfb554f9b6fbc1a5458c9867dbb0a0a256928b3))
