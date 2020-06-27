# Changelog

All notable changes to this project will be documented in this file.

## [1.21.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.10...v1.21.0) (2020-06-27)


### Features

* support special day statuses (holiday, vacation) ([c123c1e](https://github.com/dmitrijs/WorkLogIfy/commit/c123c1eb7850611be79d0529ccd9828f4858bfc1))

### [1.20.10](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.9...v1.20.10) (2020-06-27)


### UI/UX

* **tasks:** improved sorting (put timered and recent tasks on top) ([3891f29](https://github.com/dmitrijs/WorkLogIfy/commit/3891f299a0a50a0bc4fcf8b5106b965e2c76de77))

### [1.20.9](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.8...v1.20.9) (2020-06-03)


### Bug Fixes

* fix task copy&paste ([84f6a10](https://github.com/dmitrijs/WorkLogIfy/commit/84f6a10f4f7ed09d178270b60cc10144a199b94a))


### UI/UX

* removed Delete context menu action ([38628df](https://github.com/dmitrijs/WorkLogIfy/commit/38628df98bb0f8ebb21996a4206b8266f40a174f))
* updated context menu items' text ([5d018e5](https://github.com/dmitrijs/WorkLogIfy/commit/5d018e5a2343a18908fe3d0a5a2d15c0d9d02c2d))

### [1.20.8](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.7...v1.20.8) (2020-06-02)


### UI/UX

* make sure only one task can be selected at a time ([76f9ec9](https://github.com/dmitrijs/WorkLogIfy/commit/76f9ec96a48b6cbaec4c23280525b3f9486c649b))
* mark task as done if it is distributed or unchargeable; remove "on hold" flag if task is worked on ([643a797](https://github.com/dmitrijs/WorkLogIfy/commit/643a79743f3b00b149c63ac83d446ebda535d1da))

### [1.20.7](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.6...v1.20.7) (2020-05-22)


### Features

* **records:** show links to jira work logs ([e56181d](https://github.com/dmitrijs/WorkLogIfy/commit/e56181d36b434c63310634329343dae5e0b669b6))

### [1.20.6](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.5...v1.20.6) (2020-05-21)


### UI/UX

* **tasks:** disable 'Record to JIRA' context menu item if task can not be recorded ([1ef5853](https://github.com/dmitrijs/WorkLogIfy/commit/1ef585389b3e497de08f80f7eca2331264412b7f))
* **tasks:** disable context menu items that are not available if task does not have an ID (Code) ([2cc2d6c](https://github.com/dmitrijs/WorkLogIfy/commit/2cc2d6cdca7e0055d62b6c8efbcc3f24192df9ea))
* **tasks:** show an alert if time to record to jira is too little ([d676715](https://github.com/dmitrijs/WorkLogIfy/commit/d6767150c8e96aaefab7fb81a6818aad942f9f36))

### [1.20.5](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.4...v1.20.5) (2020-05-21)


### Features

* **tasks:** added "Copy the ID" context menu item ([f0afdf4](https://github.com/dmitrijs/WorkLogIfy/commit/f0afdf447fe777959dec37e39afda83b6bab866d))
* **tasks:** auto start 'idle' task on inactivity ([6c09c1f](https://github.com/dmitrijs/WorkLogIfy/commit/6c09c1f0b2e14e16e1a4c208284bb87d468920b2))
* **tasks:** auto stop idle timer ([345d412](https://github.com/dmitrijs/WorkLogIfy/commit/345d4128df97d0b709d54c6cfa3c21f375c2dca2))
* **tasks:** mark task as done after time was recorded to jira ([81750db](https://github.com/dmitrijs/WorkLogIfy/commit/81750dbddfad4a8cac5ae4c5b7e1c8013156e8dc))

### [1.20.4](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.3...v1.20.4) (2020-05-19)


### Features

* **copy&paste:** remove sessions and records from duplicated tasks on paste ([f28f791](https://github.com/dmitrijs/WorkLogIfy/commit/f28f7914aefe745ebba603a60aff2d98f19285ae))
* **tasks:** disable context menu items that can not be used ([0b52742](https://github.com/dmitrijs/WorkLogIfy/commit/0b52742bf3f1966c9cf913cbfa3da76ef33c98ab))

### [1.20.3](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.2...v1.20.3) (2020-05-15)


### Bug Fixes

* **jira:** use correct time for work logs ([f1bdb16](https://github.com/dmitrijs/WorkLogIfy/commit/f1bdb1683130f925787fc982caf8ba4f1e2f71a8))

### [1.20.2](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.1...v1.20.2) (2020-05-14)


### Bug Fixes

* **jira:** record time with task date and first session time, not current date and time ([72e187e](https://github.com/dmitrijs/WorkLogIfy/commit/72e187e0751958241d482b33c6667db1a500b745))


### UI/UX

* **tasks:** show full notes by default ([adf010b](https://github.com/dmitrijs/WorkLogIfy/commit/adf010b5443cebbf79c607437437943163349b62))

### [1.20.1](https://github.com/dmitrijs/WorkLogIfy/compare/v1.20.0...v1.20.1) (2020-05-10)


### UI/UX

* **report:** show calendar below the tasks ([cf47541](https://github.com/dmitrijs/WorkLogIfy/commit/cf47541a05e69562073c2a165a5de93d916bc93a))
* **tasks:** changed task sorting order ([f9e2427](https://github.com/dmitrijs/WorkLogIfy/commit/f9e242704cf69e7a9fd8429d73a7ad2c43261b29))
* **tasks:** removed "full notes" view option ([9164f1f](https://github.com/dmitrijs/WorkLogIfy/commit/9164f1f7def55b8b64afe53d9bb6ecfcd66a8ad6))

## [1.20.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.19.3...v1.20.0) (2020-05-09)


### Features

* **report:** show current week calendar in the report ([882425a](https://github.com/dmitrijs/WorkLogIfy/commit/882425a0801ae2f933383a219235aa971fa3389b))

### [1.19.3](https://github.com/dmitrijs/WorkLogIfy/compare/v1.19.2...v1.19.3) (2020-05-05)


### UI/UX

* **tasks:** show recorded time in the group header ([2932cc0](https://github.com/dmitrijs/WorkLogIfy/commit/2932cc029293e52d2d560b21a0d123012c727048))

### [1.19.2](https://github.com/dmitrijs/WorkLogIfy/compare/v1.19.1...v1.19.2) (2020-05-05)


### Features

* **tasks:** support 'Done' and 'On Hold' task statuses ([ce8b5a9](https://github.com/dmitrijs/WorkLogIfy/commit/ce8b5a9ccdb9604126b62ea81d493087473a4916))

### [1.19.1](https://github.com/dmitrijs/WorkLogIfy/compare/v1.19.0...v1.19.1) (2020-05-01)


### Features

* **tasks:** added "Record To JIRA" action to the context menu ([de3638b](https://github.com/dmitrijs/WorkLogIfy/commit/de3638b2c118de185f176405989c6cd7b1fb6012))


### UI/UX

* **settings:** added link to "API tokens" page ([f7d01b8](https://github.com/dmitrijs/WorkLogIfy/commit/f7d01b87ef378fb84048ae1a12f7d2f3c110f847))
* **tasks:** bring recorded time charts to spotlight ([0ad9722](https://github.com/dmitrijs/WorkLogIfy/commit/0ad97224b4467762a13c7e317f8bdff9c1f6237e))

## [1.19.0](https://github.com/dmitrijs/WorkLogIfy/compare/v1.18.3...v1.19.0) (2020-04-24)


### Features

* **settings:** added Settings screen ([84cb281](https://github.com/dmitrijs/WorkLogIfy/commit/84cb281ac9bfc91d1750a260f1d316e4f345df55))
* **tasks:** added View in JIRA link to the task context menu ([d04b268](https://github.com/dmitrijs/WorkLogIfy/commit/d04b268cb39d0dd6a1b649fd1853351e133a1c09))

### [1.18.3](https://github.com/dmitrijs/WorkLogIfy/compare/v1.18.2...v1.18.3) (2020-04-14)


### Bug Fixes

* **task edit:** clear new task form after submit ([6907ca0](https://github.com/dmitrijs/WorkLogIfy/commit/6907ca0d155597cb4da4b93e04a30dece8515a35))

### [1.18.2](https://github.com/dmitrijs/WorkLogIfy/compare/v1.18.1...v1.18.2) (2020-04-12)


### UI/UX

* **tasks:** show an error message in the report if task has empty notes ([4e9bbd8](https://github.com/dmitrijs/WorkLogIfy/commit/4e9bbd8c9bdca6ef7f74b25b561f09f5fb69c53c))

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
