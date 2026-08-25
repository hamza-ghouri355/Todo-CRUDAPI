const tasksData = require('../data/task.data');

async function listTasks() {
  const result = await tasksData.getall();
  return result;
}

async function getTask(id) {
  const result = await tasksData.getById(id);
  if (!result) {
    throw { status: 404, message: 'Task not found' };
  }
  return result;
}

async function createTask(title, description, status) {
  if (!title || title.trim() === '') {
    throw { status: 400, message: 'Title is required' };
  }
  if (description == undefined || description.length == 0) {
    description = '';
  }
  const validStatus = ['Pending', 'In Progress', 'Completed'];
  if (status == undefined || !validStatus.includes(status)) {
    throw { status: 400, message: 'Invalid status' };
  }
  const create = await tasksData.createTask(title, description, status);
  return create;
}

async function updateTask(id, title, description, status) {
  const task = await tasksData.getById(id);
  if (!task) {
    throw { status: 404, message: 'Task not found' };
  }

  if (title !== undefined && title.trim() === '') {
    throw { status: 400, message: 'Title cannot be empty' };
  }

  const validStatus = ['Pending', 'In Progress', 'Completed'];
  if (status !== undefined && !validStatus.includes(status)) {
    throw { status: 400, message: 'Invalid status' };
  }

  const finalTitle = title !== undefined ? title : task.title;
  const finalDescription = description !== undefined ? description : task.description;
  const finalStatus = status !== undefined ? status : task.status;

  await tasksData.updateTask(id, finalTitle, finalDescription, finalStatus);
  return { id: parseInt(id), title: finalTitle, description: finalDescription, status: finalStatus };
}

async function deleteTask(id) {
  const remove = await tasksData.deleteTask(id);
  if (remove.rowCount == 0) {
    throw { status: 404, message: 'Task not found' };
  }
  return true;
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };