import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundlePath = resolve(repositoryRoot, 'teaching-history.bundle');
const exampleAllowlist = [
  '.gitattributes',
  '.gitignore',
  '.prettierignore',
  '.prettierrc',
  'LICENSE',
  'eslint.config.js',
  'index.html',
  'package-lock.json',
  'package.json',
  'public/favicon.svg',
  'public/robots.txt',
  'src/App.css',
  'src/App.jsx',
  'src/App.test.jsx',
  'src/components/BotBlock.jsx',
  'src/hooks/animationFramePolicy.js',
  'src/hooks/usePrefersReducedMotion.js',
  'src/hooks/usePrefersReducedMotion.test.jsx',
  'src/hooks/useRequestAnimationFrame.js',
  'src/hooks/useRequestAnimationFrame.test.jsx',
  'src/index.css',
  'src/main.jsx',
  'src/setupTests.js',
  'vite.config.js',
].sort();
const expectedHistorySubjects = [
  'chore: establish the locked Vite example',
  'feat: define the animation frame policy',
  'feat: own the animation frame lifecycle',
  'feat: track live reduced motion',
  'feat: connect the observable animation interface',
];

function assertExact(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} must be ${expected.join(', ')}; found ${actual.join(', ')}.`
    );
  }
}

async function listFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.name !== '.git')
      .map(async (entry) => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory()
          ? listFiles(path, base)
          : [relative(base, path).replaceAll('\\', '/')];
      })
  );
  return nested.flat().sort();
}

for (const path of [
  'README.md',
  'article/tutorial.md',
  'design.md',
  'history.md',
  'pair.md',
  'sources.md',
  'verification.md',
  'teaching-history.bundle',
]) {
  await readFile(resolve(repositoryRoot, path));
}

for (const path of [
  'README.md',
  'article/tutorial.md',
  'design.md',
  'history.md',
  'pair.md',
  'sources.md',
  'verification.md',
]) {
  const content = await readFile(resolve(repositoryRoot, path), 'utf8');
  if (/\b(?:TODO|TBD)\b|[–—]/u.test(content)) {
    throw new Error(`${path} contains a placeholder or nonportable dash.`);
  }
}

const verificationRecord = await readFile(
  resolve(repositoryRoot, 'verification.md'),
  'utf8'
);
for (const path of [
  'article/tutorial.md',
  'README.md',
  'package-lock.json',
  'teaching-history.bundle',
]) {
  const digest = createHash('sha256')
    .update(await readFile(resolve(repositoryRoot, path)))
    .digest('hex');
  const digestRowExists = verificationRecord
    .split(/\r?\n/)
    .some(
      (line) => line.includes(`\`${path}\``) && line.includes(`\`${digest}\``)
    );
  if (!digestRowExists) {
    throw new Error(`verification.md has a stale SHA-256 value for ${path}.`);
  }
}
if (verificationRecord.includes('`not_run`')) {
  throw new Error(
    'verification.md still contains an unexecuted automated lane.'
  );
}
await run('git', ['bundle', 'verify', bundlePath], { cwd: repositoryRoot });
const { stdout: bundleHeads } = await run(
  'git',
  ['bundle', 'list-heads', bundlePath],
  { cwd: repositoryRoot }
);
const bundleRefs = bundleHeads.trim().split(/\r?\n/).filter(Boolean);
if (bundleRefs.length !== 1) {
  throw new Error('Teaching bundle must contain exactly one ref.');
}
const headMatch = bundleRefs[0].match(/^([0-9a-f]{40}) refs\/heads\/main$/);
if (!headMatch) {
  throw new Error('Teaching bundle must contain only refs/heads/main.');
}
const historyRecord = await readFile(
  resolve(repositoryRoot, 'history.md'),
  'utf8'
);
if (!historyRecord.includes(`**Bundle head:** \`${headMatch[1]}\``)) {
  throw new Error('history.md does not record the exact bundle head.');
}

const checkout = await mkdtemp(resolve(tmpdir(), 'animation-history-'));
try {
  await run('git', [
    'clone',
    '--quiet',
    '--branch',
    'main',
    bundlePath,
    checkout,
  ]);
  assertExact(
    'Teaching snapshot files',
    await listFiles(checkout),
    exampleAllowlist
  );
  for (const path of exampleAllowlist) {
    const [current, historical] = await Promise.all([
      readFile(resolve(repositoryRoot, path)),
      readFile(resolve(checkout, path)),
    ]);
    if (!current.equals(historical)) {
      throw new Error(`Teaching snapshot has drifted from ${path}.`);
    }
  }
  const { stdout: subjects } = await run(
    'git',
    ['log', '--reverse', '--format=%s', 'main'],
    { cwd: checkout }
  );
  assertExact(
    'Teaching commit subjects',
    subjects.trim().split(/\r?\n/),
    expectedHistorySubjects
  );
  const { stdout: metadata } = await run(
    'git',
    ['log', '--reverse', '--format=%H%x09%P%x09%an <%ae>%x09%cn <%ce>', 'main'],
    { cwd: checkout }
  );
  const commits = metadata
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split('\t'));
  if (commits.length !== expectedHistorySubjects.length) {
    throw new Error('Teaching history has an unexpected commit count.');
  }
  const expectedIdentity = 'Technical Writing Assistant <twa@example.invalid>';
  const introducedPaths = new Set();
  for (const [
    index,
    [commit, parents, author, committer],
  ] of commits.entries()) {
    const parentList = parents ? parents.split(' ') : [];
    const expectedParentCount = index === 0 ? 0 : 1;
    if (parentList.length !== expectedParentCount) {
      throw new Error('Teaching history must be linear from one root commit.');
    }
    if (author !== expectedIdentity || committer !== expectedIdentity) {
      throw new Error(
        'Teaching history contains an unexpected author or committer identity.'
      );
    }
    if (
      !historyRecord.includes(
        String.fromCharCode(96) + commit + String.fromCharCode(96)
      )
    ) {
      throw new Error('history.md does not record checkpoint ' + commit + '.');
    }
    const { stdout: changedPaths } = await run(
      'git',
      ['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', commit],
      { cwd: checkout }
    );
    for (const path of changedPaths.trim().split(/\r?\n/).filter(Boolean)) {
      if (introducedPaths.has(path)) {
        throw new Error(
          'Teaching path ' + path + ' changes in more than one checkpoint.'
        );
      }
      introducedPaths.add(path);
    }
  }
  assertExact(
    'Teaching checkpoint path ownership',
    [...introducedPaths].sort(),
    exampleAllowlist
  );
} finally {
  await rm(checkout, { recursive: true, force: true });
}

console.log(
  `Verified ${exampleAllowlist.length} teaching snapshot files at ${headMatch[1]} across ${expectedHistorySubjects.length} checkpoints.`
);
