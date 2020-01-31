import path from 'path';
import yargs from 'yargs';
import { formatMigrations } from '../lib';

yargs
  .command(
    '$0 <migrations-dir>',
    'the default command',
    yargs =>
      yargs.positional('migrations-dir', {
        type: 'string',
        default: 'migrations',
        describe: 'relative path the migrations directory',
      }),
    async config => {
      const results = await formatMigrations(config['migrations-dir']);

      results
        .filter(({ didUpdate }) => didUpdate)
        .forEach(({ filePath }) => {
          console.log(`Updated ${path.relative(config['migrations-dir'], filePath)}`);
        });
    }
  )
  .help().argv;
