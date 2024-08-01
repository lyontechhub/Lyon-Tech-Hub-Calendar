import express from 'express';

export const fakeStaticIcsServer = (port: number, ics: Record<string, string>) => {
  const app = express();
  Object.entries(ics).forEach(([name, content]) => app.get(`/${name}.ics`, (_, res) => res.send(content)));
  let close = async (): Promise<void> => {};

  return {
    start: async () => {
      await new Promise<void>((resolve) => {
        const server = app.listen(port, () => resolve());
        close = () => new Promise((resolve) => server.close(() => resolve()));
      });
    },
    stop: async () => {
      await close();
    },
  };
};
