module.exports = {
  apps: [{
    name: "KFT-systems-webui-alibaba",
    script: "npm",
    args: "start",
    cwd: "/home/KFT-systems-webui-alibaba",
    env: {
      NODE_ENV: "production",
      HOST: "0.0.0.0",
      PORT: 3001
    }
  }]
}