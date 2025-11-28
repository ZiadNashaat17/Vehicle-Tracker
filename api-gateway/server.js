import app from './app.js';

const port = process.env.PORT || 5000;

(async () => {
  try {
    app.listen(port, () => {
      console.log(`API-Gateway service is up and running on port: ${port}`);
    });
  } catch (error) {
    console.error('API-Gateway service startup error: ', error);
  }
})();
