// ===== Helpers & State =====
const storeKey = "todo_data_v2";
const themeKey = "todo_theme";

const todayISO = () => new Date().toISOString().slice(0,10);
const isOverdue = (d) => d && d < todayISO();
const isToday = (d) => d && d === todayISO();

const uid = () => Math.random().toString(36).slice(2,9);

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = load() || init();
let currentView = "inbox"; // 'inbox' | 'today' | 'important' | 'cat:<id>'

// ===== Init / Persist =====
function init(){
  return { inbox: { id: "inbox", name: "Tasks", tasks: [] }, cats: [] };
}
function save(){ localStorage.setItem(storeKey, JSON.stringify(state)); }
function load(){ try{ return JSON.parse(localStorage.getItem(storeKey)); }catch{ return null; } }

// ===== Theme =====
function applyTheme(){
  const t = localStorage.getItem(themeKey) || "dark";
  document.body.classList.toggle("light", t === "light");
  updateThemeIcon();
}
function updateThemeIcon(){
  const isLight = document.body.classList.contains("light");
  const icon = document.querySelector("#themeBtn i");
  if(icon){
    icon.className = isLight ? "bi bi-sun-fill" : "bi bi-moon-stars";
  }
}
applyTheme();

// ===== Elements =====
const viewTitle = $("#viewTitle");
const leftCount = $("#leftCount");
const taskList = $("#taskList");
const searchInput = $("#searchInput");
const filterSelect = $("#filterSelect");
const clearDoneBtn = $("#clearDoneBtn");
const addForm = $("#addForm");
const taskText = $("#taskText");
const taskDate = $("#taskDate");
const taskPrio = $("#taskPrio");
const catList = $("#catList");
const newCatBtn = $("#newCatBtn");
const themeBtn = $("#themeBtn");

const listsToggleBtn = $("#listsToggleBtn");
let listsCollapsed = false;

const menuBtn = $("#menuBtn");
const nav = document.querySelector(".nav");
const mask = $("#mask");

const countToday = $("#countToday");
const countImportant = $("#countImportant");
const countInbox = $("#countInbox");

// Bootstrap Modals (cat + confirm)
const catModalEl = document.getElementById("catModal");
const catModal = new bootstrap.Modal(catModalEl);
const catForm = document.getElementById("catForm");
const catName = document.getElementById("catName");
const saveCatBtn = document.getElementById("saveCatBtn");

const confirmModalEl = document.getElementById("confirmModal");
const confirmModal = new bootstrap.Modal(confirmModalEl);
const confirmTitle = document.getElementById("confirmTitle");
const confirmMsg = document.getElementById("confirmMsg");
const confirmOk = document.getElementById("confirmOk");

// ===== Events =====
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  taskText.focus();
});

// Toggle categorias
listsToggleBtn.addEventListener("click", ()=>{
  listsCollapsed = !listsCollapsed;
  catList.classList.toggle("collapsed", listsCollapsed);
  listsToggleBtn.innerHTML = `<i class="bi ${listsCollapsed ? "bi-caret-right" : "bi-caret-down"}"></i>`;
});

// Tema
themeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");
  localStorage.setItem(themeKey, isLight ? "light":"dark");
  updateThemeIcon();
});

// Navegação
$$(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const v = btn.dataset.view;
    if(v==="today"||v==="important"||v==="inbox"){ currentView = v; }
    renderAll();
    closeNavIfMobile();
  });
});

// Novo categoria
newCatBtn.addEventListener("click", ()=>{
  catName.value = "";
  catModal.show();
  setTimeout(()=>catName.focus(), 80);
});

saveCatBtn.addEventListener("click", (e)=>{
  e.preventDefault();
  const name = catName.value.trim();
  if(!name) return;
  state.cats.push({ id: uid(), name, tasks: [] });
  save();
  catModal.hide();
  renderCats();
});

// Prevent default submit
catForm.addEventListener("submit", (e)=> e.preventDefault());

// Adicionar tarefa
addForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const text = taskText.value.trim();
  if(!text) return;
  const t = {
    id: uid(), text, done: false, star: false,
    date: taskDate.value || "", prio: ["low","med","high"].includes(taskPrio.value) ? taskPrio.value : "none",
    createdAt: Date.now()
  };
  listForCurrent().tasks.push(t);
  taskText.value = ""; taskDate.value = ""; taskPrio.value = "none";
  save();
  renderAll();
});

searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);
clearDoneBtn.addEventListener("click", ()=>{
  const list = listForCurrent();
  list.tasks = list.tasks.filter(t=>!t.done);
  save(); renderAll();
});

// Sidebar open/close (mobile)
menuBtn?.addEventListener("click", ()=>{
  const opened = nav.classList.toggle("open");
  mask.classList.toggle("show", opened);
});
mask.addEventListener("click", ()=>{
  nav.classList.remove("open"); mask.classList.remove("show");
});

// Logo navega para Tasks principais (inbox)
document.querySelector(".logo").addEventListener("click", () => {
  currentView = "inbox";
  renderAll();
  closeNavIfMobile();
});

function closeNavIfMobile(){
  if(window.matchMedia("(max-width: 900px)").matches){
    nav.classList.remove("open"); mask.classList.remove("show");
  }
}

// ===== Selectors =====
function listForCurrent(){
  if(currentView==="inbox") return state.inbox;
  if(currentView.startsWith("cat:")){ const id = currentView.split(":")[1]; return state.cats.find(c=>c.id===id); }
  return mergedList();
}
function mergedList(){
  const allTasks = [
    ...state.inbox.tasks.map(t=>({ ...t, __src:"inbox" })),
    ...state.cats.flatMap(c=> c.tasks.map(t=>({ ...t, __src:c.id })))
  ];
  return { id:"all", name:"All", tasks: allTasks };
}

// ===== Rendering =====
function renderAll(){ renderCats(); renderCounts(); renderHeader(); renderTasks(); }

function renderCats(){
  catList.innerHTML = "";
  state.cats.forEach(cat=>{
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <span class="list-name"><i class="bi bi-folder2"></i> ${escapeHTML(cat.name)}</span>
      <span class="list-actions">
        <button class="icon-btn" title="Rename" data-act="rename"><i class="bi bi-pencil"></i></button>
        <button class="icon-btn" title="Delete" data-act="del"><i class="bi bi-trash"></i></button>
      </span>
    `;
    row.addEventListener("click", (e)=>{
      if(e.target.closest("[data-act]")) return;
      currentView = `cat:${cat.id}`; renderAll(); closeNavIfMobile();
    });
    row.querySelector('[data-act="rename"]').addEventListener("click", (e)=>{
      e.stopPropagation();
      const name = prompt("New name", cat.name);
      if(name && name.trim()){ cat.name = name.trim(); save(); renderCats(); renderHeader(); }
    });
    row.querySelector('[data-act="del"]').addEventListener("click", (e)=>{
      e.stopPropagation();
      askConfirm({
        title: "Delete category",
        message: `Delete category “${cat.name}”? All its tasks will be removed.`,
        okText: "Delete"
      }).then(go=>{
        if(go){
          row.classList.add("removing");
          setTimeout(()=>{
            state.cats = state.cats.filter(c=>c.id!==cat.id);
            if(currentView===`cat:${cat.id}`) currentView="inbox";
            save(); renderAll();
            confirmModal.hide();
          }, 300);
        }
      });
    });
    catList.appendChild(row);
  });
}

function renderHeader(){
  if(currentView==="inbox"){ viewTitle.textContent = "Tasks"; }
  else if(currentView==="today"){ viewTitle.textContent = "My Day"; }
  else if(currentView==="important"){ viewTitle.textContent = "Important"; }
  else if(currentView.startsWith("cat:")){ const cat = listForCurrent(); viewTitle.textContent = cat?.name || "Category"; }
}

function renderCounts(){
  const all = mergedList().tasks;
  const today = all.filter(t=>!t.done && isToday(t.date)).length;
  const imp = all.filter(t=>!t.done && t.star).length;
  const inboxOpen = state.inbox.tasks.filter(t=>!t.done).length;

  countToday.textContent = today;
  countImportant.textContent = imp;
  countInbox.textContent = inboxOpen;

  const left = visibleTasks().filter(t=>!t.done).length;
  leftCount.textContent = `${left} left`;
}

function visibleTasks(){
  let items = [];
  if(currentView==="today"){ items = mergedList().tasks.filter(t=> isToday(t.date)); }
  else if(currentView==="important"){ items = mergedList().tasks.filter(t=> t.star); }
  else{ items = listForCurrent().tasks; }

  const q = searchInput.value.trim().toLowerCase();
  if(q) items = items.filter(t => t.text.toLowerCase().includes(q));

  const f = filterSelect.value;
  if(f==="open") items = items.filter(t=>!t.done);
  if(f==="done") items = items.filter(t=>t.done);
  if(f==="today") items = items.filter(t=> isToday(t.date));
  if(f==="overdue") items = items.filter(t=> isOverdue(t.date) && !t.done);

  // sort: overdue -> today -> prio high -> med -> low -> created
  const rank = { high:3, med:2, low:1, none:0 };
  items.sort((a,b)=>{
    const ao = isOverdue(a.date), bo = isOverdue(b.date);
    if(ao!==bo) return ao ? -1 : 1;
    const at = isToday(a.date), bt = isToday(b.date);
    if(at!==bt) return at ? -1 : 1;
    if(rank[b.prio]-rank[a.prio] !== 0) return rank[b.prio]-rank[a.prio];
    return a.createdAt - b.createdAt;
  });

  return items;
}

function renderTasks(){
  const items = visibleTasks();
  taskList.innerHTML = "";
  items.forEach(t=>{
    const li = document.createElement("li");
    li.className = "task";
    li.draggable = true;
    li.dataset.id = t.id;
    li.innerHTML = `
      <input class="mark" type="checkbox" ${t.done?"checked":""} aria-label="Mark done"/>
      <div class="task-text">
        <div class="task-row">
          <span class="task-name ${t.done?"done":""}" data-elt="name">${escapeHTML(t.text)}</span>
          ${t.prio!=="none" ? `<span class="chip ${t.prio}">${t.prio}</span>` : ""}
          ${isOverdue(t.date) && !t.done ? `<span class="chip overdue">overdue</span>` : ""}
          ${isToday(t.date) ? `<span class="chip today">today</span>` : ""}
        </div>
        <div class="task-meta">
          ${t.date ? `<span><i class="bi bi-calendar-event"></i>${t.date}</span>` : ""}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" title="Important" data-act="star">
          <i class="${t.star ? "bi bi-star-fill" : "bi bi-star"}"></i>
        </button>
        <button class="icon-btn" title="Edit" data-act="edit"><i class="bi bi-pencil"></i></button>
        <button class="icon-btn" title="Delete" data-act="del"><i class="bi bi-trash"></i></button>
      </div>
    `;

    li.querySelector(".mark").addEventListener("change", (e)=>{
      setTask(t.id, { done: e.target.checked }, t.__src);
      li.querySelector('[data-elt="name"]').classList.toggle("done", e.target.checked);
      renderCounts(); save();
    });

    li.querySelector('[data-act="star"]').addEventListener("click", (ev)=>{
      setTask(t.id, { star: !t.star }, t.__src);
      const i = ev.currentTarget.querySelector("i");
      i.className = t.star ? "bi bi-star" : "bi bi-star-fill";
      save(); renderCounts();
    });

    li.querySelector('[data-act="del"]').addEventListener("click", ()=>{
      askConfirm({
        title: "Delete task",
        message: `Are you sure you want to delete “${t.text}”?`,
        okText: "Delete"
      }).then(go=>{
        if(go){
          li.classList.add("removing");
          setTimeout(()=>{
            removeTask(t.id, t.__src);
            save(); renderAll();
            confirmModal.hide();
          }, 300);
        }
      });
    });

    li.querySelector('[data-act="edit"]').addEventListener("click", ()=> editInline(li, t));

    if(currentView==="inbox" || currentView.startsWith("cat:")){
      li.addEventListener("dragstart", ()=> li.classList.add("dragging"));
      li.addEventListener("dragend", ()=> li.classList.remove("dragging"));
      taskList.addEventListener("dragover", handleDragOver);
      taskList.addEventListener("drop", handleDrop);
    }

    taskList.appendChild(li);
  });

  renderCounts();
}

function editInline(li, t){
  const nameEl = li.querySelector('[data-elt="name"]');
  const old = t.text;
  const input = document.createElement("input");
  input.className = "input";
  input.value = old;
  input.style.height = "32px";
  input.addEventListener("keydown", (e)=>{
    if(e.key==="Enter"){ confirm(); }
    if(e.key==="Escape"){ cancel(); }
  });
  input.addEventListener("blur", confirm);
  nameEl.replaceWith(input);
  input.focus(); input.select();

  function confirm(){
    const v = input.value.trim();
    setTask(t.id, { text: v || old }, t.__src);
    save(); renderTasks();
  }
  function cancel(){ renderTasks(); }
}

// ===== Mutations =====
function setTask(id, patch, srcId){
  const lists = srcId ? [getListById(srcId)] : [state.inbox, ...state.cats];
  for(const list of lists){
    const t = list.tasks.find(x=>x.id===id);
    if(t){ Object.assign(t, patch); return; }
  }
}
function removeTask(id, srcId){
  const lists = srcId ? [getListById(srcId)] : [state.inbox, ...state.cats];
  for(const list of lists){
    const i = list.tasks.findIndex(x=>x.id===id);
    if(i>-1){ list.tasks.splice(i,1); return; }
  }
}
function getListById(id){
  if(id==="inbox") return state.inbox;
  return state.cats.find(c=>c.id===id);
}

// ===== Drag & Drop ordering =====
function handleDragOver(e){
  e.preventDefault();
  const after = getDragAfterElement(taskList, e.clientY);
  const dragging = $(".task.dragging");
  if(!dragging) return;
  if(after==null){ taskList.appendChild(dragging); }
  else { taskList.insertBefore(dragging, after); }
}
function handleDrop(){
  if(!(currentView==="inbox"||currentView.startsWith("cat:"))) return;
  const orderIds = $$("#taskList .task").map(li=>li.dataset.id);
  const list = listForCurrent();
  list.tasks.sort((a,b)=> orderIds.indexOf(a.id) - orderIds.indexOf(b.id));
  save();
}
function getDragAfterElement(container, y){
  const els = [...container.querySelectorAll(".task:not(.dragging)")];
  return els.reduce((closest, child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if(offset<0 && offset>closest.offset){ return { offset, element: child }; }
    else { return closest; }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ===== Utils =====
function escapeHTML(str){
  return str.replace(/[&<>"']/g, s=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}

// ===== Bootstrap Confirm helper =====
function askConfirm({ title="Delete", message="Are you sure?", okText="Delete" }={}){
  return new Promise((resolve)=>{
    confirmTitle.textContent = title;
    confirmMsg.textContent = message;
    confirmOk.textContent = okText;

    const onOk = (e)=>{ e.preventDefault(); cleanup(); resolve(true); };
    const onHidden = ()=>{ cleanup(); resolve(false); };

    function cleanup(){
      confirmOk.removeEventListener("click", onOk);
      confirmModalEl.removeEventListener("hidden.bs.modal", onHidden);
    }

    confirmOk.addEventListener("click", onOk);
    confirmModalEl.addEventListener("hidden.bs.modal", onHidden, { once:true });
    confirmModal.show();
  });
}
