export interface MigrationNode extends Record<string, any> {
  args: MigrationArgs;
  type: string;
}

interface MigrationArgs extends Record<string, any> {
  sql: string | undefined;
}
