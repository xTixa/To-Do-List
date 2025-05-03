function addTask() {
    const input = document.getElementById("taskInput");
    const taskText = input.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onclick = function () {
        li.classList.toggle("done");
    };

    const spanText = document.createElement("span");
    spanText.textContent = " " + taskText;

    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.className = "remove";
    removeBtn.onclick = function (event) {
        event.stopPropagation();
        li.remove();
    };

    li.appendChild(checkbox);
    li.appendChild(spanText);
    li.appendChild(removeBtn);

    document.getElementById("taskList").appendChild(li);
    input.value = "";
}
