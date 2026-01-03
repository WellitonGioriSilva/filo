module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  MAX_AUTO_WAIT_MINUTES: Number(process.env.MAX_AUTO_WAIT_MINUTES || 120),
};
