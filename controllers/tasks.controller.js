const tasksService=require ('../service/tasks.service');

async function getallTasks(req,res){
    const result=await tasksService.listTasks();
    res.json(result);
}

async function getbyid(req,res){
    const id=req.params.id;
    try{
        const result=await tasksService.getTask(id);
        res.json(result);
    }
    catch (error){
        res.status(error.status).json({error:error.message});
    }
}

async function createTask(req,res){
    try{
        const {title,description,status}=req.body;
        const create=await tasksService.createTask(title,description,status);
        res.status(201).json(create);
    }
    catch(error){
        res.status(error.status).json({error:error.message});
    }
}

async function updateTask(req, res) {
  try {
    const id = req.params.id;
    const { title, description, status } = req.body;
    const result = await tasksService.updateTask(id, title, description, status);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
}

async function deleteTask(req, res) {
  try {
    const id = req.params.id;
    await tasksService.deleteTask(id);
    res.status(204).send();
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
}

module.exports={getallTasks,getbyid,createTask,updateTask,deleteTask};