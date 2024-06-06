const { execSync } = require('child_process');

const migrationName = process.argv[2];
if (!migrationName) {
  console.error('Please provide a migration name.');
  process.exit(1);
}

const command = `node node_modules/db-migrate/bin/db-migrate create ${migrationName} --sql-file`;
execSync(command, { stdio: 'inherit' });
