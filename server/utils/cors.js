import cors from 'cors';

const configureCors = () =>
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

export default configureCors;
