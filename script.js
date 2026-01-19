let taskButton = document.getElementById("taskButton");
let taskList = document.getElementById("taskList");
let taskInput = document.getElementById("taskInput");
let listButtons = document.querySelectorAll("li button");
let editingTask;
let editingTaskId;

//save tasks with localstorage
//save tasks each time tasks are updated
let tasksJson = `[
"do homeworks",
"do chores"
]`;

let tasks = [];
let newTasks = JSON.parse(tasksJson);
JSON.stringify(tasksJson)
for (let task of newTasks){
    addTask(task);
}

taskButton.addEventListener("click", updateUserTask);

//add edit button to tasks

function addTask(name){
    let newTask = document.createElement("li");

    let uuid = crypto.randomUUID();
    // 36b8f84d-df4e-4d49-b662-bcde71a8764f

    newTask.textContent = name + " ";
    tasks.push({
        id: uuid,
        name
    });
    newTask.append(...createButtons(newTask, uuid));

    taskList.appendChild(newTask);
}

function updateUserTask(){
    if (taskButton.innerHTML === "Add Task"){ 
        addTask(taskInput.value);
    } else if (taskButton.innerHTML === "Save Task"){
        editingTask.textContent = taskInput.value + " ";
        tasks.find(a => a.id === editingTaskId).name = taskInput.value;
        editingTask.append(...createButtons(editingTask, editingTaskId));
        taskButton.innerHTML = "Add Task";
    }
    taskInput.value = "";
}

function removeTask(event){
    event.target.parentElement.remove();
}

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
        /*let taskIndex = -1;
        for (let i = 0; i < tasks.length; i++){
            if (tasks[i].id === id){
                taskIndex = i;
                break;
            }
        }*/
        let taskIndex = tasks.findIndex(a => a.id === id);
        tasks.splice(taskIndex, 1);
        newTask.remove();
    });
    deleteButton.textContent = "Delete";

    return [editButton, deleteButton];
}