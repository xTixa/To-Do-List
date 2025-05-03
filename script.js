function addTask() {
    const input = document.getElementById("taskInput");
    const taskText = input.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const li = document.createElement("li");
    li.textContent = taskText;

    const span = document.createElement("span");
    span.textContent = "×";
    span.onclick = function () {
        li.remove();
    };

    li.appendChild(span);
    document.getElementById("taskList").appendChild(li);

    input.value = "";
}
