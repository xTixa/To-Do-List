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


function addCategory() {
    const input = document.getElementById("categoryInput");
    const categoryText = input.value.trim();

    if (categoryText === "") {
        alert("Please enter a category.");
        return;
    }

    // Criar elementos
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category";

    const title = document.createElement("h4");
    title.textContent = "📁 " + categoryText;

    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.placeholder = "Enter a task for this category...";

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Task";

    const ul = document.createElement("ul");

    addBtn.onclick = function () {
        const taskText = taskInput.value.trim();
        if (taskText === "") {
            alert("Enter a task.");
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
        removeBtn.textContent = " ×";
        removeBtn.className = "remove";
        removeBtn.onclick = function (event) {
            event.stopPropagation();
            li.remove();
        };

        li.appendChild(checkbox);
        li.appendChild(spanText);
        li.appendChild(removeBtn);
        ul.appendChild(li);

        taskInput.value = "";
    };

    // Junta tudo
    categoryDiv.appendChild(title);
    categoryDiv.appendChild(taskInput);
    categoryDiv.appendChild(addBtn);
    categoryDiv.appendChild(ul);

    document.getElementById("categories").appendChild(categoryDiv);
    input.value = "";
}

