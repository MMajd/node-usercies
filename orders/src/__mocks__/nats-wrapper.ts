export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
  connect: () =>
    new Promise((resolve, _reject) => setImmediate(() => resolve(null))),
};
