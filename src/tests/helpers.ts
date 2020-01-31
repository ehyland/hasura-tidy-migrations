import path from 'path';
import fs from 'fs-extra';
import childProcess from 'child_process';
import { promisify } from 'util';

export type FunctionResolveType<T> = T extends (...args: any[]) => Promise<infer X> ? X : never;

export const SOURCE_MIGRATIONS = path.resolve(__dirname, 'data/migrations');

export const WORKSPACE_MIGRATIONS = path.resolve(__dirname, 'tmp/migrations');

export const RELATIVE_WORKSPACE_MIGRATIONS = path.relative(process.cwd(), WORKSPACE_MIGRATIONS);

export const exec = promisify(childProcess.exec);

export const setupWorkspace = () =>
  fs.copy(SOURCE_MIGRATIONS, WORKSPACE_MIGRATIONS, { overwrite: true });

export const cleanupWorkspace = () => fs.emptyDir(WORKSPACE_MIGRATIONS);

export const runCli = (args: string = '') => exec(`bin/hasura-tidy-migrations.js ${args}`);

export const stdoutToUpdatedMessages = (stdout: string) =>
  stdout
    .split('\n')
    .filter(line => line.startsWith('Updated'))
    .sort();
