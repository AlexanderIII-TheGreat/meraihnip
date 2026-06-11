module.exports = {
  apps: [
    {
      name: 'frontend-bimbel.asn',
      script: 'npm',
      autorestart: true,
      cwd: './temanasn-fe',
      args: 'run start',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'backend-bimbel.asn',
      script: 'npm',
      autorestart: true,
      cwd: './temanasn-be',
      args: 'run start',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
