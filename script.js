/*
to-do:
- find the total number of completed tasks

sorry i like completely avoided this
i did try out sort, but it wasnt working out how i wanted it to :(
- reduce
- findLastIndex
- sort  (with a custom function)
*/

//ok the game plan for how were gonna sort this out"
/*
prepend to the beginning of the html document when created
append to the end of the html document when checked off
what if i just like...dont sort localstorage. eheheh
when an element no longer exists, don't allow for editing (clear editing)
*/

//defines html elements
let taskButton = document.getElementById("taskButton");
let taskList = document.getElementById("taskList");
let taskInput = document.getElementById("taskInput");

//variables for editing tasks
let editingTask;
let editingTaskId;
let recentCompletedTaskIndex;

let completedTaskElement = document.getElementById("completedTasks");

let tasks = [];

//adds tasks from json file
loadTasks();

taskButton.addEventListener("click", updateUserTask);

function addTask(name, completed=false){
    let newTask = document.createElement("li");

    //updates array
    //creates a unique id like: 36b8f84d-df4e-4d49-b662-bcde71a8764f
    let uuid = crypto.randomUUID();
    tasks.push({
        id: uuid,
        name,
        completed
    });
    
    //updates html
    let taskSpan = document.createElement("span");
    newTask.appendChild(taskSpan)
    taskSpan.textContent = name + " ";

    newTask.append(...createButtons(newTask, uuid));

    newTask.querySelector("input[type=checkbox]").checked = completed;
    if (completed === false) {
        taskList.prepend(newTask);
    } else {
        taskList.append(newTask)
    }
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
    } else if (taskButton.innerHTML === "Save Task" && tasks.find(a => a.id === editingTaskId)){
        editingTask.firstElementChild.textContent = taskInput.value + " ";
        //editingTask.querySelector("span").textContent
        // <li><input/> <span/> <button/></li> 
        //checks task array for a task object with an id that matches the task we're
        //currently editing and sets the name of it to the task input value
        tasks.find(a => a.id === editingTaskId).name = taskInput.value;
        taskButton.innerHTML = "Add Task";
    } else {
        alert("Please save your item to a valid task!")
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
        tasks.find(a => a.id === id).completed = checkbox.checked;
        if (tasks.find(a => a.id === id).completed) {
            recentCompletedTaskIndex = tasks.findIndex(a => a.id === id);
            console.log(recentCompletedTaskIndex);
            taskList.append(newTask)
        } else {
            taskList.prepend(newTask);
        }
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
    updateCompletedTasks()
}

function loadTasks(){
    let currentTasks = localStorage.getItem("tasks");
    let newTasks = JSON.parse(currentTasks);
    if (newTasks != null){
        for (let task of newTasks){
            addTask(task.name, task.completed);
        }
    }
    updateCompletedTasks()
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

function updateCompletedTasks() {
    let totalCompletedTasks = tasks.filter(task => task.completed).length;
    completedTaskElement.innerHTML = "Total Completed Tasks: " + totalCompletedTasks;
}