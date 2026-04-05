module.exports = {
  '*.{ts,js}': ['prettier --write', 'eslint --fix'],
  '*.ts': () => 'tsc --noEmit',
  '*.{json,md,yml,yaml}': ['prettier --write'],
};