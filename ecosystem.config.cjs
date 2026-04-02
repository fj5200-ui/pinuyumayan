module.exports = {
  apps: [
    {
      name: 'pinuyumayan-api',
      cwd: './apps/api',
      script: 'node',
      args: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '200M',
    },
    {
      name: 'pinuyumayan-web',
      cwd: './apps/web',
      script: 'npx',
      args: 'next start -p 3000 -H 0.0.0.0',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '250M',
    }
  ]
};
