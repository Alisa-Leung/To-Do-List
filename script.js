/*
to-do:
- checkbox for each tasks that is stored in local storage
- maybe update api completed status
- css class that changes appearance based on completion
*/

//defines html elements
let taskButton = document.getElementById("taskButton");
let taskList = document.getElementById("taskList");
let taskInput = document.getElementById("taskInput");

//variables for editing tasks
let editingTask;
let editingTaskId;

let tasks = [];

//adds tasks from json file
loadTasks();

taskButton.addEventListener("click", updateUserTask);


function addTask(name){
    let newTask = document.createElement("li");

    //updates array
    //creates a unique id like: 36b8f84d-df4e-4d49-b662-bcde71a8764f
    let uuid = crypto.randomUUID();
    tasks.push({
        id: uuid,
        name
    });
    
    //updates html
    newTask.textContent = name + " ";
    newTask.append(...createButtons(newTask, uuid));
    taskList.appendChild(newTask);
}

//any changes to tasks
async function updateUserTask(){
    if (taskButton.innerHTML === "Add Task"){ 
        addTask(taskInput.value);
        await fetch("https://dummyjson.com/todos/add", {
            method: "POST",
            body: JSON.stringify({
                todo: taskInput.value,
                headers: { 'Content-Type': 'application/json' },
                completed: false,
                userId: 1
            })
        });
    } else if (taskButton.innerHTML === "Save Task"){
        editingTask.textContent = taskInput.value + " ";
        //checks task array for a task object with an id that matches the task we're
        //currently editing and sets the name of it to the task input value
        tasks.find(a => a.id === editingTaskId).name = taskInput.value;
        editingTask.append(...createButtons(editingTask, editingTaskId));
        taskButton.innerHTML = "Add Task";
    }
    taskInput.value = "";
    saveTasks();
}

//consolidates delete and edit button functionalities + their creation into one function
function createButtons(newTask, id){
    let editButton = document.createElement("button");
    editButton.addEventListener("click", () => {
        taskButton.innerHTML = "Save Task";
        editingTask = newTask;
        editingTaskId = id;
        taskInput.value = tasks.find(a => a.id === editingTaskId).name;
    });
    editButton.textContent = "Edit";

    let deleteButton = document.createElement("button");
    deleteButton.addEventListener("click", () => {
        //does the same as the line below
        /*let taskIndex = -1;
        for (let i = 0; i < tasks.length; i++){
            if (tasks[i].id === id){
                taskIndex = i;
                break;
            }
        }*/
        //.findIndex() returns the index, whereas .find() returns the object itself
        let taskIndex = tasks.findIndex(a => a.id === id);
        //removes 1 element starting from taskIndex in the tasks array
        tasks.splice(taskIndex, 1);
        newTask.remove();
        saveTasks();
    });
    deleteButton.textContent = "Delete";

    return [editButton, deleteButton];
}

function saveTasks(){
    let tasksJson = JSON.stringify(tasks);
    localStorage.tasks = tasksJson;
}

function loadTasks(){
    let currentTasks = localStorage.getItem("tasks");
    let newTasks = JSON.parse(currentTasks);
    if (newTasks != null){
        for (let task of newTasks){
            addTask(task.name);
        }
    }
}

let downloadButton = document.getElementById("download");
downloadButton.addEventListener("click", async () => {
    // Promise<Response>
    // GET
    // POST PUT
    let response = await fetch("https://dummyjson.com/todos", {
        method: "GET"
    });
    let responseJson = await response.json();
    for (let task of responseJson.todos){
        addTask(task.todo);
    }
});

