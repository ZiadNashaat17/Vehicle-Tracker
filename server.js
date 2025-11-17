import { config } from 'dotenv';
import { connect } from 'mongoose';
import app from './app.js';

config({ path: './config.env' });

const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

connect(DB).then(con => {
  console.log('DB connected successfully.');
});

app.listen(PORT, err => {
  console.log(`App listening on port: ${PORT}`);
});
