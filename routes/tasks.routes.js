const express=require('express');
const router=express.Router();
const controller=require('../controllers/tasks.controller');

router.get('/',controller.getallTasks);
router.get('/:id',controller.getbyid);
router.post('/',controller.createTask);
router.put('/:id',controller.updateTask);
router.delete('/:id',controller.deleteTask);

module.exports=router;