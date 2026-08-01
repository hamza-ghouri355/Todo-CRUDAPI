const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const {open}=require('sqlite');
const app = express();
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const { error } = require('node:console');
const port = 3000;

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

let db;

async function initDB(){
    db=await open({
        filename:'./tasks.db',
        driver:sqlite3.Database
    })
    await db.exec(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0
    )`);

    const existing=await db.get('Select count(*) as count from tasks');
    if(existing.count===0)
    {
        await db.run('INSERT INTO tasks (title, completed) VALUES (?, ?)', ['buy groceries', 0]);
        await db.run('INSERT INTO tasks (title, completed) VALUES (?, ?)', ['play games', 1]);
        await db.run('INSERT INTO tasks (title, completed) VALUES (?, ?)', ['go sleep', 0]);

    }

};

app.get('/tasks',async (req,res)=>{
    const allTasks=await db.all('select * from tasks');
    res.json(allTasks);
});

app.get('/tasks/:id',async (req,res)=>{
    const task=await db.get('select * from tasks where id=?',[req.params.id]);
    if(!task)
    {
        return res.status(404).json({error:'Task not found'});
    }
    res.json(task);
})


app.post('/tasks',async (req,res)=>{
    const {title}=req.body;
    if(!title){
        return res.status(400).json({error:'Title is required'});
    }
    const result=await db.run('insert into tasks (title,completed) values(?,?)',[title,false]);
    const newTask={
        id:result.lastID,
        title:title,
        completed:false
    }
    res.status(201).json(newTask);
});


app.put('/tasks/:id',async (req,res)=>{
    const task=await db.get('select * from tasks where id=?',[req.params.id]);
    if(!task){
        return res.status(404).json({error :'Task not found'});
    }
    const {title,completed}=req.body;
    if(title!==undefined && title.trim()==''){
        return res.status(400).json({error:'title cannot be empty'})
    }
    const newTitle=title!==undefined?title:task.title;
    const newCompleted=completed!==undefined?completed:task.completed;
    await db.run('update tasks set title=?,completed=? where id=?',[newTitle,newCompleted,req.params.id]);
    res.json({id:parseInt(req.params.id),title:newTitle,completed:newCompleted});
});



app.delete('/tasks/:id',async (req,res)=>{
    const result=await db.run('delete from tasks where id = ?',[req.params.id]);
    if(result.changes==0){
        return res.status(404).json({error:'task not found'});
    }
    res.status(204).send();
})


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

initDB().then(()=>{
app.listen(port,()=> {
    console.log(`Server is running on port ${port}`);
});
});