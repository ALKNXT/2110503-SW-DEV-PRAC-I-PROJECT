const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const auth = require('./routes/auth');

dotenv.config({ path: './config/config.env' });

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ success: true, data: { id: 1 } });
});
app.use('/api/v1/auth', auth);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    const safeMessage = String(error.message || error).replace(
      process.env.MONGO_URI || '',
      '<MONGO_URI>',
    );
    console.error(
      `MongoDB connection failed (${error.name || 'Error'}): ${safeMessage}`,
    );
    process.exitCode = 1;
  }
};

startServer().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
