const supabase=require('../data/supabase.client');

async function signup(req,res){
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({error:"email and password are required"});
    }
    const {data,error}=await supabase.auth.signUp({email,password});
    if(error){
        return res.status(400).json({error:error.message});
    }
    return res.status(201).json(data.user);
}

async function login(req,res){
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({error:"email and password are required"});
    }
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error){
        return res.status(400).json({error:error.message});
    }

    res.status(200).json({
        access_token:data.session.access_token,
        refresh_token:data.session.refresh_token
    });
}

module.exports={signup,login};