/*
to-do:
- update date span when task is updated
  * find the date span:
      .children
      .querySelector(:nth-child)
      add a custom class (.classList) to the dateSpan and use with querySelector

- look at docs for toLocaleString
  second parameter: "shorten" the string (leave out seconds)
  "lengthen" the string (spelling out the month, day of week)


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

function addTask(name, date, completed=false){
    let newTask = document.createElement("li");

    //updates array
    //creates a unique id like: 36b8f84d-df4e-4d49-b662-bcde71a8764f
    let uuid = crypto.randomUUID();
    tasks.push({
        id: uuid,
        name,
        completed,
        date
    });
    
    //updates html
    let taskSpan = document.createElement("span");
    newTask.appendChild(taskSpan)
    taskSpan.textContent = name + " ";

    let dateSpan = document.createElement("span");
    dateSpan.textContent = numToDate(date);
    newTask.appendChild(dateSpan);

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
    if (taskInput.value.trim() !== ""){
        if (taskButton.innerHTML === "Add Task"){ 
            addTask(taskInput.value, Date.now());
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
            let editingTaskObj = tasks.find(a => a.id === editingTaskId);
            editingTask.firstElementChild.textContent = taskInput.value + " ";
            //editingTask.querySelector("span").textContent
            // <li><input/> <span/> <button/></li> 
            //checks task array for a task object with an id that matches the task we're
            //currently editing and sets the name of it to the task input value
            editingTaskObj.name = taskInput.value;
            editingTaskObj.date = Date.now();
            taskButton.innerHTML = "Add Task"; 
        } else {
            alert("Please save your item to a valid task!")
        }
    } else{
        alert("Please enter a valid task!")
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
        let completedTaskObj = tasks.find(a => a.id === id);
        completedTaskObj.completed = checkbox.checked;
        completedTaskObj.date = Date.now();
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
            // let task = { name: "do chores", completed: false }
            // task.date
            addTask(task.name, task.date ?? Date.now(), task.completed);
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
        addTask(task.todo, 0, task.completed);
    }
});

function updateCompletedTasks() {
    tasks.reduce((accumulator, task) => {
        if (task.completed){
            accumulator++;
        }
        return accumulator;
    }, 0);
    let totalCompletedTasks = tasks.filter(task => task.completed).length;
    completedTaskElement.innerHTML = "Total Completed Tasks: " + totalCompletedTasks;
}

function sortTasks() {
    let ex = [1, 4, 2, 5, 6];
    ex.sort((a, b) => {
        // a = 1
        // b = 6
        // return 1 - 6 = return -5
        // < 0 == a before b
        // > 0 == b before a
        return a - b;
    });

    tasks.sort((a, b) => {
        if (a.completed && !b.completed){
            return 1;
        } else if (!a.completed && b.completed){
            return -1;
        } else{
            // a = "abc"
            // b = "bcd"
            // a.compareTo(b)   
            // < 0 if a before b
            // b.compareTo(a)
            // > 0 b after a
            
            return a.name.localeCompare(b.name);
            // "abc".localeCompare("bcd")
        }
    });

    tasks.sort((a, b) => {
        //sort by name, but use completed as a tie-breaker
        if (a.name === b.name){
            // true ~ 1
            // false ~ 0
            // true - true === 0
            // true - false === 1
            if (a.completed && !b.completed){
                return 1;
            } else if (!a.completed && b.completed){
                return -1;
            } else {
                return 0;
            }
        } else{
            return a.name.localeCompare(b.name);
        }
    });
}

function numToDate(num){
    let dateObj = new Date(num);
    // new Date(Date.now());
    // new Date().toLocaleString()
    return dateObj.toLocaleString();
}