import express from 'express';
import routes from './routes';
import enventLoader from './utils/env';

// Load environment variables
enventLoader();

// initialize express just like we do for flask
const app = express();
const port = process.env.PORT || 5000;

// Use routes defined in routes/index.js
app.use('/', routes);

// Were are we going to be listening for requests
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Export the app
export default app;