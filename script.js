let taskButton = document.getElementById("taskButton");
let taskList = document.getElementById("taskList");
let taskInput = document.getElementById("taskInput");

//add edit button to tasks

function addTask(name){
    let newTask = document.createElement("li");
    let deleteButton = document.createElement("button");
    deleteButton.addEventListener("click", removeTask);
    deleteButton.textContent = "Delete";
    newTask.textContent = name;
    newTask.appendChild(deleteButton);
    taskList.appendChild(newTask);
}

function addUserTask(){
    addTask(taskInput.value);
    taskInput.value = "";
}

function removeTask(event){
  event.target.parentElement.remove();
}

taskButton.addEventListener("click", addUserTask);

let listButtons = document.querySelectorAll("li button");
for (let button of listButtons){
    button.addEventListener("click", removeTask);
}