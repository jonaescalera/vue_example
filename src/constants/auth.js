export default Object.freeze({
  tokenString: 'conductor_auth_token',
  // Following regex is made to conform to the password policy described in https://link-labs.atlassian.net/browse/NEX-1559
  passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!_~@$^=()\-.?[\]`;:#%&*+])(?=.{8,})^[a-zA-Z0-9][a-zA-Z0-9!_~@$^=()\-.?[\]`;:#%&*+]+$/,
});
