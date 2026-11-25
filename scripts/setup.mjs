import {copyFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
if (!existsSync('.env')) copyFileSync('.env.example','.env');
for (const [script,...args] of [
 ['prisma/build/index.js','generate'], ['prisma/build/index.js','migrate','deploy'],
 ['tsx/dist/cli.mjs','prisma/seed.ts']
]) execFileSync(process.execPath,['node_modules/'+script,...args],{stdio:'inherit'});
