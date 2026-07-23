const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let tasks=[

    {id:1,title:'buy groceries',completed:false},
    {id:2,title:'clean the house',completed:true},
    {id:3,title:'finish project',completed:false}
]

app.get('/tasks',(req,res)=>{
    res.json(tasks);

});


app.get('/tasks/:id',(req,res)=>
{
    try
    {
        const id=parseInt(req.params.id);
        const task=tasks.find(t=>t.id===id);
        if(!task)
        {
            return res.status(404).json({error:'Task not found'});
        }
        res.json(task);
    }
    catch(error)
    {
        res.status(500).json({error:'Internal server error'});
    }
});

app.get('/',(req,res)=> {
    res.json({
        name:'Task API',
        version:'1.0.0',
        endpoint:["/tasks"]
    });
});

app.get('/health',(req,res)=> {
    res.json({
        status:'ok'
    });
});

app.listen(port,()=> {
    console.log(`Server is running on port ${port}`);
});