# Zync

Zync keeps shared code in sync with multiple projects in a monorepo.

## Why?

Sharing source between projects can be a pain in the \*\$\$. Zync simply copied the files to multiple projects within a repo so that it can be built with the configuration of each individual project.

## Quick start

Zync is opinionated to make its use simple. **ALL** files in the source directory are kept in sync.

1. Create a directory that contains the shared files.
1. Create the destination directories
1. Create a [config file](#config-file) at the root of the repo
1. Run `zync` anywhere within the repo
1. Use `zync check [project name]` as a pre-build check to ensure all files are in sync.

## Things to know

- Always edit the source files and never the files copied.
- Copied files will be overwritten by by running the `zync` command.
- `zync` will watch files for changes. Use `CTRL + C` to exit.
- Run `zync check` to ensure there are no extra files in either source or destination.

## Config file

- `baseSourcePath` and `baseDestinationPath` are relative to the location of `zync.config.json` which should be at the root of the repo.
- `source` and `destination` are relative to their respective `base*Path`.

```json
{
  "baseSourcePath": "packages",
  "projects": [
    {
      "name": "app",
      "baseDestinationPath": "app/shared-readonly",
      "paths": [
        {
          "source": "constants",
          "destination": "constants"
        },
        ...
      ]
    },
    {
      "name": "hosting",
      "baseDestinationPath": "server/shared-readonly",
      "paths": [
        {
          "source": "constants",
          "destination": "constants"
        },
        ...
      ]
    },
    ...
  ]
}
```

## Example

Before `zync`

```
.
└── monoreporoot
    ├── app
    │   ├── shared-readonly
    │   │   └── constants (*placeholder to sync)
    │   └── src
    │       └── index.ts
    ├── packages
    │   └── constants
    │       └── constants.ts
    ├── server
    │   ├── shared-readonly
    │   │   └── constants (*placeholder to sync)
    │   └── src
    │       └── index.ts
    └── zync.config.json
```

After `zync` (Files copied marked by \*)

```
.
└── monoreporoot
    ├── app
    │   ├── shared-readonly
    │   │   └── constants
    │   │       └── constants.ts *
    │   └── src
    │       └── index.ts
    ├── packages
    │   └── constants
    │       └── constants.ts
    ├── server
    │   ├── shared-readonly
    │   │   └── constants
    │   │       └── constants.ts *
    │   └── src
    │       └── index.ts
    └── zync.config.json
```
