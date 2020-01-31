import {
  setupWorkspace,
  cleanupWorkspace,
  runCli,
  RELATIVE_WORKSPACE_MIGRATIONS,
  stdoutToUpdatedMessages,
  FunctionResolveType,
  WORKSPACE_MIGRATIONS,
} from './helpers';

import path from 'path';
import fs from 'fs-extra';

const readWorkspaceMigration = (name: string) =>
  Promise.all([
    fs.readFile(path.resolve(WORKSPACE_MIGRATIONS, name, 'up.yaml'), 'utf8'),
    fs.readFile(path.resolve(WORKSPACE_MIGRATIONS, name, 'down.yaml'), 'utf8'),
  ]);

describe('integration', () => {
  beforeAll(async () => {
    await setupWorkspace();
  });

  afterAll(async () => {
    await cleanupWorkspace();
  });

  describe('when run on dirty migrations', () => {
    let out: FunctionResolveType<typeof runCli>;

    beforeAll(async () => {
      out = await runCli(RELATIVE_WORKSPACE_MIGRATIONS);
    });

    it('when called with <migrations-dir>', async () => {
      expect(out.stderr).toMatchInlineSnapshot(`""`);
      expect(stdoutToUpdatedMessages(out.stdout)).toEqual([
        'Updated 1579996071502_create_table_public_users/up.yaml',
        'Updated 1580088801913_create_table_public_todos/up.yaml',
        'Updated 1580089036643_set_fk_public_todos_user_id/down.yaml',
        'Updated 1580089036643_set_fk_public_todos_user_id/up.yaml',
        'Updated 1580089400009_run_sql_migration/up.yaml',
      ]);
    });

    it('formats sql in migrations', async () => {
      const setFkPublicTodosUserId = await readWorkspaceMigration(
        '1580089036643_set_fk_public_todos_user_id'
      );
      const createTablePublicTodos = await readWorkspaceMigration(
        '1580088801913_create_table_public_todos'
      );
      const runSqlMigration = await readWorkspaceMigration('1580089400009_run_sql_migration');
      const createTablePublicUsers = await readWorkspaceMigration(
        '1579996071502_create_table_public_users'
      );
      const addRelationshipTablePublicTodos = await readWorkspaceMigration(
        '1580089123700_add_relationship__table_public_todos'
      );

      [
        ...setFkPublicTodosUserId,
        ...createTablePublicTodos,
        ...runSqlMigration,
        ...createTablePublicUsers,
        ...addRelationshipTablePublicTodos,
      ].forEach(migration => {
        expect(migration).toMatchSnapshot();
      });
    });

    describe('when run on clean migrations', () => {
      beforeAll(async () => {
        out = await runCli(RELATIVE_WORKSPACE_MIGRATIONS);
      });

      it('does not update files', () => {
        expect(out.stderr).toMatchInlineSnapshot(`""`);
        expect(stdoutToUpdatedMessages(out.stdout)).toEqual([]);
      });
    });
  });
});
