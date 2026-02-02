/*
to-do:
- checkbox for each tasks that is stored in local storage
- maybe update api completed status
Add a completed checkbox for each task
- Add a parameter to addTask to indicated whether completed
- Add a CSS class for completed that dims the element/applies a strikethrough
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

function addTask(name, checked=false){
    let newTask = document.createElement("li");

    //updates array
    //creates a unique id like: 36b8f84d-df4e-4d49-b662-bcde71a8764f
    let uuid = crypto.randomUUID();
    tasks.push({
        id: uuid,
        name,
        checked
    });
    
    //updates html
    let taskSpan = document.createElement("span");
    newTask.appendChild(taskSpan)
    taskSpan.textContent = name + " ";

    newTask.append(...createButtons(newTask, uuid));

    newTask.querySelector("input[type=checkbox]").checked = checked;

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
        editingTask.firstElementChild.textContent = taskInput.value + " ";
        //editingTask.querySelector("span").textContent
        // <li><input/> <span/> <button/></li> 
        //checks task array for a task object with an id that matches the task we're
        //currently editing and sets the name of it to the task input value
        tasks.find(a => a.id === editingTaskId).name = taskInput.value;
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

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
        tasks.find(a => a.id === id).checked = checkbox.checked;
        saveTasks();
    })

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

    return [editButton, deleteButton, checkbox];
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
            addTask(task.name, task.checked);
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
        addTask(task.todo, task.completed);
    }
});

