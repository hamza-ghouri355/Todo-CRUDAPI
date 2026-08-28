
async function protectedProfile(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const access_token = authHeader.split(' ')[1];
  res.json({ message: 'Token received, not yet verified' });
}

module.exports = { protectedProfile };