const supabase=require('../data/supabase.client');

async function protectedProfile(req, res) {
  // const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return res.status(401).json({ error: 'Access token required' });
  // }
  // const access_token = authHeader.split(' ')[1];
  // const {data ,error}=await supabase.auth.getUser(access_token);
  // if(error || !data.user){
  //   return res.status(401).json({ error: 'Invalid access token' });
  // }
  // res.json({
  //   id: data.user.id,
  //   email: data.user.email,
  //   created_at: data.user.created_at,
  // })

  const {email,id ,created_at}=req.user;
  res.status(200).json({
    id,
    email,
    created_at,
  });
}

module.exports = { protectedProfile };