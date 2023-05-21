const { ACCESS_TOKEN_SECRET: accessTokenSecret } = process.env;

export default {
  accessTokenSecret,
  authorizationHeaderRegex: /^Bearer (.+)$/
};
