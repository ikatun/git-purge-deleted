# Git Purge Deleted

## Delete unused local git branches

## Description
A handy tool to remove a bunch of local git branches that no longer exist on remote.

`git-purge-deleted` checks for local branch that don't exist on remote as `branch-name` or `origin/branch-name` and offers deletion for them.

## Important note
It always asks before deletion to avoid deleting a useful branch by accident. 

## Usage
```shell
npx git-purge-deleted
? git delete -D feature/old-branch-deleted-from-remote (Y/n) Yes
Deleted branch feature/old-branch-deleted-from-remote (was 6570573).
```

## Dry run
You can append the command with --run-run option to avoid making any changes to the repo.
