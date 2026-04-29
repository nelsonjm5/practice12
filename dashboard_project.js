function $(id) {
  return document.getElementById(id);
}

function formatDate(isoString) {
  return isoString.slice(0, 10);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createProfileManager() {
  let profile = {
    name: "Your Name",
    email: "you@example.com"
  };

  function getProfile() {
    return { ...profile };
  }

  function updateProfile(newName, newEmail) {
    profile = { name: newName, email: newEmail };
  }

  function resetProfile() {
    profile = { name: "Your Name", email: "you@example.com" };
  }

  return { getProfile, updateProfile, resetProfile };
}

function createTodoManager() {
  let tasks = [
    { id: 1, text: "Finish Project 3", done: false, createdAt: new Date().toISOString() },
    { id: 2, text: "Test the API section", done: true, createdAt: new Date().toISOString() }
  ];

  function getTasks() {
    return tasks.map(t => ({ ...t }));
  }

  function addTask(text) {
    const nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    tasks.push({
      id: nextId,
      text: text,
      done: false,
      createdAt: new Date().toISOString()
    });
  }

  function toggleTask(id) {
    tasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
  }

  function clearDone() {
    tasks = tasks.filter(t => !t.done);
  }

  function setTasks(newTasks) {
    tasks = newTasks;
  }

  return { getTasks, addTask, toggleTask, deleteTask, clearDone, setTasks };
}

const profileManager = createProfileManager();
const todoManager = createTodoManager();

const STORAGE_KEY = "dashboard_project_data_v2";
const THEME_KEY = "dashboard_theme_mode";
let fetchedItems = [];
let currentDataType = "";

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);

  const toggleBtn = $("themeToggleBtn");
  if (toggleBtn) {
    toggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
    toggleBtn.setAttribute("aria-pressed", String(isDark));
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark-mode");
  const nextTheme = isDark ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
}

function renderProfile() {
  const p = profileManager.getProfile();
  $("currentName").textContent = p.name;
  $("currentEmail").textContent = p.email;
  $("nameInput").value = p.name;
  $("emailInput").value = p.email;
}

function getVisibleTasks() {
  const filterValue = $("filterSelect").value;
  const sortValue = $("sortSelect").value;

  let list = todoManager.getTasks();

  if (filterValue === "open") {
    list = list.filter(t => !t.done);
  } else if (filterValue === "done") {
    list = list.filter(t => t.done);
  }

  if (sortValue === "alpha") {
    list.sort((a, b) => a.text.localeCompare(b.text));
  } else if (sortValue === "oldest") {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

function renderTasks() {
  const listEl = $("taskList");
  listEl.innerHTML = "";

  const visible = getVisibleTasks();

  visible.forEach(task => {
    const li = document.createElement("li");
    li.className = "item";

    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = task.text;

    const date = document.createElement("div");
    date.className = "date";
    date.textContent = "Created: " + formatDate(task.createdAt);

    const badge = document.createElement("span");
    badge.className = "badge" + (task.done ? " done" : "");
    badge.textContent = task.done ? "Done" : "Open";

    meta.appendChild(title);
    meta.appendChild(date);
    meta.appendChild(badge);

    const btnWrap = document.createElement("div");
    btnWrap.className = "button-stack";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "secondary";
    toggleBtn.textContent = task.done ? "Mark Open" : "Mark Done";
    toggleBtn.addEventListener("click", () => {
      todoManager.toggleTask(task.id);
      renderTasks();
      renderCount();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      todoManager.deleteTask(task.id);
      renderTasks();
      renderCount();
    });

    btnWrap.appendChild(toggleBtn);
    btnWrap.appendChild(deleteBtn);

    li.appendChild(meta);
    li.appendChild(btnWrap);
    listEl.appendChild(li);
  });

  renderCount();
}

function renderCount() {
  const all = todoManager.getTasks();
  const openCount = all.filter(t => !t.done).length;
  const doneCount = all.filter(t => t.done).length;
  $("countText").textContent = `${all.length} total • ${openCount} open • ${doneCount} done`;
}

function clearErrors() {
  $("nameError").textContent = "";
  $("emailError").textContent = "";
  $("taskError").textContent = "";
  $("jsonMsg").textContent = "";
  $("apiSaveError").textContent = "";
}

function validateProfile(name, email) {
  let ok = true;

  if (!name || name.trim().length < 2) {
    $("nameError").textContent = "Name should be at least 2 characters.";
    ok = false;
  }

  if (!email || !isValidEmail(email.trim())) {
    $("emailError").textContent = "Please enter a valid email.";
    ok = false;
  }

  return ok;
}

function validateTask(text) {
  if (!text || text.trim().length === 0) {
    $("taskError").textContent = "Task can't be empty.";
    return false;
  }

  if (text.trim().length > 60) {
    $("taskError").textContent = "Keep tasks under 60 characters.";
    return false;
  }

  return true;
}

function validateApiPost(title, body) {
  if (!title.trim() || !body.trim()) {
    $("apiSaveError").textContent = "Both title and body are required.";
    return false;
  }

  return true;
}

function buildDashboardData() {
  return {
    profile: profileManager.getProfile(),
    tasks: todoManager.getTasks()
  };
}

function saveToStorage() {
  const data = buildDashboardData();
  const json = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, json);
  $("jsonMsg").textContent = "Saved.";
}

function loadFromStorage() {
  const json = localStorage.getItem(STORAGE_KEY);

  if (!json) {
    $("jsonMsg").textContent = "Nothing saved yet.";
    return;
  }

  const data = JSON.parse(json);

  if (data.profile && data.profile.name && data.profile.email) {
    profileManager.updateProfile(data.profile.name, data.profile.email);
  }

  if (Array.isArray(data.tasks)) {
    todoManager.setTasks(data.tasks);
  }

  $("jsonMsg").textContent = "Loaded.";
  renderProfile();
  renderTasks();
}

function exportJsonToBox() {
  const json = JSON.stringify(buildDashboardData(), null, 2);
  $("jsonBox").value = json;
  $("jsonMsg").textContent = "Exported to the box.";
}

function importJsonFromBox() {
  const raw = $("jsonBox").value.trim();

  if (!raw) {
    $("jsonMsg").textContent = "Paste JSON first.";
    return;
  }

  try {
    const data = JSON.parse(raw);

    if (data.profile && typeof data.profile.name === "string" && typeof data.profile.email === "string") {
      profileManager.updateProfile(data.profile.name, data.profile.email);
    }

    if (Array.isArray(data.tasks)) {
      todoManager.setTasks(data.tasks);
    }

    $("jsonMsg").textContent = "Imported.";
    renderProfile();
    renderTasks();
  } catch (err) {
    $("jsonMsg").textContent = "That JSON doesn't look valid.";
  }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  $("jsonMsg").textContent = "Storage cleared.";
}

function setApiStatus(message, type) {
  const box = $("apiStatus");
  box.textContent = message;
  box.className = "status " + type;
}

function setSaveStatus(message, type) {
  const box = $("saveStatus");
  box.textContent = message;
  box.className = "status " + type;
}

async function fetchApiData(type) {
  const url = type === "users"
    ? "https://jsonplaceholder.typicode.com/users"
    : "https://jsonplaceholder.typicode.com/posts";

  currentDataType = type;
  setApiStatus("Loading data...", "loading");
  $("apiResults").innerHTML = "";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Request failed.");
    }

    const data = await response.json();
    fetchedItems = type === "posts" ? data.slice(0, 12) : data;

    if (fetchedItems.length === 0) {
      setApiStatus("No results found.", "error");
      renderApiResults();
      return;
    }

    setApiStatus(`Loaded ${fetchedItems.length} ${type}. Click See Details to expand a card.`, "success");
    renderApiResults();
  } catch (error) {
    fetchedItems = [];
    setApiStatus("Something went wrong while loading the API data.", "error");
    renderApiResults();
  }
}

function renderApiResults() {
  const wrap = $("apiResults");
  wrap.innerHTML = "";

  if (fetchedItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-box";
    empty.textContent = "No results found.";
    wrap.appendChild(empty);
    return;
  }

  fetchedItems.forEach(item => {
    const card = document.createElement("article");
    card.className = "api-card";

    const title = document.createElement("h3");
    title.textContent = currentDataType === "users" ? item.name : item.title;

    const subtitle = document.createElement("p");
    subtitle.className = "api-subtitle";
    subtitle.textContent = currentDataType === "users" ? item.email : "Post #" + item.id;

    const details = document.createElement("div");
    details.className = "api-details hidden";

    if (currentDataType === "users") {
      details.innerHTML = `
        <p><strong>Username:</strong> ${item.username}</p>
        <p><strong>Phone:</strong> ${item.phone}</p>
        <p><strong>Website:</strong> ${item.website}</p>
        <p><strong>Company:</strong> ${item.company.name}</p>
      `;
    } else {
      details.innerHTML = `
        <p><strong>User ID:</strong> ${item.userId}</p>
        <p><strong>Body:</strong> ${item.body}</p>
      `;
    }

    const btn = document.createElement("button");
    btn.className = "secondary";
    btn.textContent = "See Details";
    btn.title = "Click to show or hide more information";

    btn.addEventListener("click", () => {
      details.classList.toggle("hidden");
      btn.textContent = details.classList.contains("hidden") ? "See Details" : "Hide Details";
    });

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(btn);
    card.appendChild(details);
    wrap.appendChild(card);
  });
}

function clearApiResults() {
  fetchedItems = [];
  currentDataType = "";
  $("apiResults").innerHTML = "";
  setApiStatus("Results cleared.", "neutral");
}

async function sendMockPost() {
  const title = $("apiTitleInput").value.trim();
  const body = $("apiBodyInput").value.trim();

  if (!validateApiPost(title, body)) {
    setSaveStatus("Please fix the form before submitting.", "error");
    return;
  }

  setSaveStatus("Sending data to mock API...", "loading");
  $("apiResponseBox").value = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        body: body,
        userId: 1
      })
    });

    if (!response.ok) {
      throw new Error("Save failed.");
    }

    const data = await response.json();
    $("apiResponseBox").value = JSON.stringify(data, null, 2);
    setSaveStatus("Success. The mock API returned a new post object.", "success");
  } catch (error) {
    setSaveStatus("Something went wrong while sending the data.", "error");
  }
}

function wireEvents() {
  $("saveProfileBtn").addEventListener("click", () => {
    clearErrors();

    const name = $("nameInput").value;
    const email = $("emailInput").value;

    if (!validateProfile(name, email)) return;

    profileManager.updateProfile(name.trim(), email.trim());
    renderProfile();
  });

  $("resetProfileBtn").addEventListener("click", () => {
    clearErrors();
    profileManager.resetProfile();
    renderProfile();
  });

  $("addTaskBtn").addEventListener("click", () => {
    clearErrors();

    const text = $("taskInput").value;

    if (!validateTask(text)) return;

    todoManager.addTask(text.trim());
    $("taskInput").value = "";
    renderTasks();
  });

  $("clearDoneBtn").addEventListener("click", () => {
    clearErrors();
    todoManager.clearDone();
    renderTasks();
  });

  $("filterSelect").addEventListener("change", () => {
    renderTasks();
  });

  $("sortSelect").addEventListener("change", () => {
    renderTasks();
  });

  $("saveJsonBtn").addEventListener("click", () => {
    clearErrors();
    saveToStorage();
  });

  $("loadJsonBtn").addEventListener("click", () => {
    clearErrors();
    loadFromStorage();
  });

  $("exportJsonBtn").addEventListener("click", () => {
    clearErrors();
    exportJsonToBox();
  });

  $("importJsonBtn").addEventListener("click", () => {
    clearErrors();
    importJsonFromBox();
  });

  $("clearStorageBtn").addEventListener("click", () => {
    clearErrors();
    clearStorage();
  });

  $("loadUsersBtn").addEventListener("click", async () => {
    clearErrors();
    await fetchApiData("users");
  });

  $("loadPostsBtn").addEventListener("click", async () => {
    clearErrors();
    await fetchApiData("posts");
  });

  $("clearResultsBtn").addEventListener("click", () => {
    clearErrors();
    clearApiResults();
  });

  $("sendApiBtn").addEventListener("click", async () => {
    clearErrors();
    await sendMockPost();
  });

  $("themeToggleBtn").addEventListener("click", () => {
    toggleTheme();
  });
}

loadSavedTheme();
wireEvents();
renderProfile();
renderTasks();
