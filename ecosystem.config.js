module.exports = {
  apps: [
    {
      name: "rojgari",
      script: "./server.js",
      cwd: "/home/rojgariindia.com/app",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3010
      }
    }
  ]
}
