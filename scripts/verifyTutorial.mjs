import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const articlePath = resolve(repositoryRoot, 'article/tutorial.md');
const canonicalBindings = new Map([
  ['SNIP-02', 'src/hooks/animationFramePolicy.js'],
  ['SNIP-03', 'src/hooks/useRequestAnimationFrame.js'],
  ['SNIP-04', 'src/hooks/usePrefersReducedMotion.js'],
  ['SNIP-05', 'src/components/BotBlock.jsx'],
  ['SNIP-06', 'src/App.jsx'],
]);
const excerptBindings = new Map([
  ['SNIP-08', 'src/hooks/useRequestAnimationFrame.test.jsx'],
]);
const expectedStepIds = [
  'STEP-01',
  'STEP-02',
  'STEP-03',
  'STEP-04',
  'STEP-05',
  'STEP-06',
  'STEP-07',
];
const expectedSnippetClasses = new Map([
  ['SNIP-01', 'command'],
  ['SNIP-02', 'canonical'],
  ['SNIP-03', 'canonical'],
  ['SNIP-04', 'canonical'],
  ['SNIP-05', 'canonical'],
  ['SNIP-06', 'canonical'],
  ['SNIP-07', 'command'],
  ['SNIP-08', 'excerpt'],
]);

function normalizeLineEndings(value) {
  return value.replaceAll('\r\n', '\n');
}

function assertExactIds(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} must be ${expected.join(', ')}; found ${actual.join(', ')}.`
    );
  }
}

const article = await readFile(articlePath, 'utf8');
const stepIds = [
  ...article.matchAll(
    /^<!-- twa:step id=([A-Za-z][A-Za-z0-9._-]*) -->\r?\n## [^\r\n]+$/gm
  ),
].map((match) => match[1]);
assertExactIds('Article step markers', stepIds, expectedStepIds);

const snippetMatches = [
  ...article.matchAll(
    /^<!-- twa:snippet id=([A-Za-z][A-Za-z0-9._-]*) class=(canonical|excerpt|command|output|conceptual) -->\r?\n```[^\r\n]*\r?\n([\s\S]*?)\r?\n```/gm
  ),
];
const snippetIds = snippetMatches.map((match) => match[1]);
assertExactIds('Article snippet markers', snippetIds, [
  ...expectedSnippetClasses.keys(),
]);

const snippets = new Map(
  snippetMatches.map((match) => [
    match[1],
    { className: match[2], content: match[3] },
  ])
);
for (const [snippetId, expectedClass] of expectedSnippetClasses) {
  if (snippets.get(snippetId)?.className !== expectedClass) {
    throw new Error(`${snippetId} must use the ${expectedClass} class.`);
  }
}

for (const [snippetId, sourcePath] of canonicalBindings) {
  const source = await readFile(resolve(repositoryRoot, sourcePath), 'utf8');
  const fenced = `${snippets.get(snippetId).content}\n`;

  if (normalizeLineEndings(fenced) !== normalizeLineEndings(source)) {
    throw new Error(`${snippetId} has drifted from ${sourcePath}.`);
  }
}

for (const [snippetId, sourcePath] of excerptBindings) {
  const source = normalizeLineEndings(
    await readFile(resolve(repositoryRoot, sourcePath), 'utf8')
  );
  const excerpt = normalizeLineEndings(snippets.get(snippetId).content);
  const occurrences = source.split(excerpt).length - 1;

  if (occurrences !== 1) {
    throw new Error(
      `${snippetId} must match one exact, unique excerpt from ${sourcePath}.`
    );
  }
}

if (snippets.get('SNIP-01').content !== 'npm ci\nnpm run dev') {
  throw new Error('SNIP-01 must document the clean install and dev scripts.');
}
if (snippets.get('SNIP-07').content !== 'npm run check') {
  throw new Error('SNIP-07 must document the composite repository gate.');
}

const packageManifest = JSON.parse(
  await readFile(resolve(repositoryRoot, 'package.json'), 'utf8')
);
for (const scriptName of ['dev', 'check']) {
  if (typeof packageManifest.scripts?.[scriptName] !== 'string') {
    throw new Error(`package.json must define the ${scriptName} script.`);
  }
}

console.log(
  `Verified ${stepIds.length} tutorial steps, ${snippetIds.length} snippet markers, ${canonicalBindings.size} canonical source bindings, and ${excerptBindings.size} exact excerpt.`
);
