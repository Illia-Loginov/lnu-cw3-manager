const { PORT: port, NODE_ENV: env } = process.env;

export default {
  env: env || 'development',
  port: port || 3002,
  frontendUrl:
    env === 'production' ? 'http://localhost:5173' : 'http://localhost:5173'
};
