export const logger = {
  info(message, ...args) {
    console.log(message, ...args);
  },
  error(error, ...args) {
    console.error(error, ...args);
  },
};
