import cors from 'cors';

const configureCors = () =>
  cors({
    origin: process.env.URL_LOCALE,
    credentials: true,
  });

export default configureCors;
