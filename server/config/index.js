module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:5000/deploynexus',
  jwtSecret: process.env.JWT_SECRET || '628e6ef180c396333612950425dd0d6bf68616583d1510182ad038c1da62f10',
  jwtExpiration: '24h'
};