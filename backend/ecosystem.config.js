module.exports = {
  apps: [
    {
      name: "vendraly",
      script: "server.js",
      cwd: "/home/vendraly/backend",
      env: {
        JWT_SECRET: "vendraly_super_secreto_123",
        EMAIL_FROM: "no-reply@vendraly.com",
        EMAIL_USER: "no-reply@vendraly.com",
        EMAIL_PASS: "wwUh8WyN70r7F3MK3n",
        EMAIL_HOST: "localhost",
        EMAIL_PORT: 587
      }
    }
  ]
};
