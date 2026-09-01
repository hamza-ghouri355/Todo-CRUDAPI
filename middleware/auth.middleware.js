const supabase = require('../data/supabase.client');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const access_token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(access_token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid access token' });
  }

  req.user = data.user;
  req.access_token = access_token;
  next();
}

module.exports = requireAuth;