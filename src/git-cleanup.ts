import { exec } from 'child_process';
import { prompt } from 'inquirer';
import { promisify } from 'util';

const execAsync = promisify(exec);

const [, , dryRunArg] = process.argv;

const dryRun = dryRunArg === '--dry-run';

function parseGitBranchResponse(output: string) {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !line.startsWith('*'))
    .filter((line) => !!line);
}

async function getLocalBranches() {
  const { stdout, stderr } = await execAsync('git branch');
  if (!stdout) {
    throw new Error(stderr || 'Could not get git branches');
  }

  return parseGitBranchResponse(stdout);
}

async function getRemoteBranches() {
  const { stdout, stderr } = await execAsync('git branch -r');
  if (!stdout) {
    throw new Error(stderr || 'Could not get git branches');
  }

  return parseGitBranchResponse(stdout);
}

function getDeletionCandidates(localBranches: string[], remoteBranches: string[]) {
  return localBranches.filter((b) => !remoteBranches.includes(b));
}

async function deleteBranch(branchName: string) {
  const command = `git branch -D ${branchName}`;
  if (dryRun) {
    return command;
  }

  const { stdout, stderr } = await execAsync(command);
  if (!stdout) {
    throw new Error(stderr);
  }

  return stdout;
}

async function offerDeletion(branchName: string): Promise<boolean> {
  const { confirm } = await prompt([
    { message: `git delete -D ${branchName}`, type: 'confirm', name: 'confirm', default: true },
  ]);

  return confirm;
}

async function main() {
  await execAsync('git remote prune origin');
  const localBranches = await getLocalBranches();
  const remoteBranches = await getRemoteBranches();

  const deletionCandidates = getDeletionCandidates(localBranches, remoteBranches);

  if (deletionCandidates.length === 0) {
    console.log('All local branches here exist on remote too. No deletion candidates.');
  }

  for (const deletionCandidate of deletionCandidates) {
    const confirmed = await offerDeletion(deletionCandidate);
    if (confirmed) {
      console.log(await deleteBranch(deletionCandidate));
    }
  }
}

main().catch(console.error);
