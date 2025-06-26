import cors from 'cors';

const configureCors = () =>
  cors({
    origin: process.env.URL,
    credentials: true,
  });

export default configureCors;
