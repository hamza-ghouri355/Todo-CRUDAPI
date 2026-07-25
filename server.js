const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const port = 3000;

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

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
    const task=tasks.find(t=>t.id==parseInt(req.params.id));
    if(!task)
    {
        return res.status(404).json({error:'Task not found'});
    }
    res.json(task);
});

app.post('/tasks',(req,res)=>{
    const{title}=req.body;
    if(!title)
    {
        return res.status(400).json({error:'Title is required'});
    }

    const NewID= tasks.length>0?tasks[tasks.length-1].id+1:1;

    const newTask={
        id:NewID,
        title:title,
        completed:false
    }
    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put('/tasks/:id',(req,res)=>{
    // Find the task by ID
    const task=tasks.find(t=>t.id==parseInt(req.params.id));
    if(!task)
    {
        return res.status(404).json({error:'Task not found'});
    }
    const {title,completed}=req.body;
if(title!==undefined&& title.trim()==''){
    return res.status(400).json({error:'Title cannot be empty'});
}
if(title!==undefined) task.title=title;
if(completed!==undefined) task.completed=completed;
res.json(task);
});

app.delete('/tasks/:id',(req,res)=>{
    const index=tasks.findIndex(t=>t.id==parseInt(req.params.id));
    if(index===-1)
    {
        return res.status(404).json({error:'Task not found'});
    }
    tasks.splice(index,1);
    res.status(204).send();
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