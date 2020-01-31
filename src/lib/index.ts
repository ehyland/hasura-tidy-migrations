import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import globby from 'globby';
import yaml from 'js-yaml';
import sqlFormatter from 'sql-formatter';
import { MigrationNode } from '../types';

export const readFile = promisify(fs.readFile);

export const writeFile = promisify(fs.writeFile);

export const getMigrationFilePaths = async (migrationsDir: string) => {
  const globPattern = path.resolve(process.cwd(), migrationsDir) + '/**/*.yaml';
  const files = await globby(globPattern);

  if (files.length === 0) {
    console.log(`No files found for path "${globPattern}"`);
  }

  return files;
};

export const parseYamlFile = (file: string) =>
  readFile(file, 'utf8').then(yamlString => ({
    yamlString,
    data: yaml.safeLoad(yamlString) as MigrationNode[],
  }));

export const writeYamlFile = (file: string, data: any) =>
  writeFile(file, yaml.safeDump(data), 'utf8');

export const formatMigrationSQL = (migration: MigrationNode) => {
  if (!migration.args.sql) {
    return migration;
  }

  return {
    ...migration,
    args: {
      ...migration.args,
      sql: sqlFormatter.format(migration.args.sql),
    },
  };
};

export const processMigrationFile = async (filePath: string) => {
  let didUpdate = false;
  const yamlString = await readFile(filePath, 'utf8');
  const data = yaml.safeLoad(yamlString) as MigrationNode[];
  const updatedData = data.map(migration => formatMigrationSQL(migration));
  const updatedYamlString = yaml.safeDump(updatedData);

  if (updatedYamlString !== yamlString) {
    await writeFile(filePath, updatedYamlString, 'utf8');
    didUpdate = true;
  }

  return { filePath, didUpdate };
};

export const formatMigrations = async (migrationsDir: string) => {
  const migrationFilePaths = await getMigrationFilePaths(migrationsDir);
  const migrationsUpdated = migrationFilePaths.map(filePath => processMigrationFile(filePath));
  return await Promise.all(migrationsUpdated);
};
