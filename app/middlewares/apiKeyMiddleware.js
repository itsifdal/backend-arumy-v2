require('dotenv').config();

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key']; // Assuming API key is sent in headers

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // API key is valid, proceed to the next middleware or route handler
  next();
};

module.exports = apiKeyMiddleware;
