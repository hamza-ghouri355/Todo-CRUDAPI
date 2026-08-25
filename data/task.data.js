// const sqlite3 = require('sqlite3').verbose();
// const { open } = require('sqlite');

const {Pool}=require('pg');
require('dotenv').config();

// let db;

const pool=new Pool({
    connectionString:process.env.DATABASE_URL
})

async function initDB() {
    await pool.query('Create table if not exists tasks(id SERIAL PRIMARY KEY, title TEXT, description TEXT, status TEXT)');
    const existing = await pool.query('Select count(*) as count from tasks');
    if (existing.rows[0].count == 0) {
        await pool.query('Insert into tasks(title, description, status) values($1, $2, $3)', ['Task 1', 'Description for Task 1', 'Pending']);
        await pool.query('Insert into tasks(title, description, status) values($1, $2, $3)', ['Task 2', 'Description for Task 2', 'In Progress']);
        await pool.query('Insert into tasks(title, description, status) values($1, $2, $3)', ['Task 3', 'Description for Task 3', 'Completed']);
    }
}



async function getall(){
    const task = await pool.query('select * from tasks');
    return task.rows;
}

async function getById(id){
    const task = await pool.query('select * from tasks where id=$1', [id]);
    return task.rows[0];
}

async function createTask(title, description, status) {
  const result = await pool.query('insert into tasks(title,description,status) values($1,$2,$3) returning *', [title, description, status]);
  return result.rows[0];
}

async function updateTask(id,title,description,status){
    const result = await pool.query('update tasks set title=$1, description=$2, status=$3 where id=$4 returning *', [title, description, status, id]);
    return result.rows[0];
}

async function deleteTask(id){
    const remove= await pool.query('delete from tasks where id=$1',[id]);
    return remove;
}

module.exports = { initDB, getall, getById, createTask, updateTask,deleteTask };