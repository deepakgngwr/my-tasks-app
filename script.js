const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Ask notification permission once
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Parse natural text like "tomorrow 6pm"
function parseTaskInput(input) {
  let now = new Date();
  let dueDate = null;
  let text = input.toLowerCase();

  if (text.includes("tomorrow")) {
    dueDate = new Date(now);
    dueDate.setDate(now.getDate() + 1);
  } else if (text.includes("today")) {
    dueDate = new Date(now);
  }

  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)?/);

  if (dueDate && timeMatch) {
    let hours = parseInt(timeMatch[1]);
    let minutes = parseInt(timeMatch[2] || "0");
    let period = timeMatch[3];

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    dueDate.setHours(hours, minutes, 0, 0);
  }

  let cleanText = input
    .replace(/tomorrow|today/gi, "")
    .replace(/\d{1,2}(:\d{2})?\s?(am|pm)?/gi, "")
    .trim();

  return { title: cleanText, due: dueDate };
}

// Add task
function addTask() {
  if (!taskInput.value.trim()) return;

  const parsed = parseTaskInput(taskInput.value);
  const task = {
    title: parsed.title,
    due: parsed.due ? parsed.due.getTime() : null
  };

  renderTask(task);

  if (task.due) scheduleNotification(task);

  taskInput.value = "";
}

// Show task in UI
function renderTask(task) {
  const li = document.createElement("li");
  li.textContent = task.title;

  if (task.due) {
    const time = document.createElement("small");
    time.textContent =
      " ⏰ " + new Date(task.due).toLocaleString();
    li.appendChild(time);
  }

  taskList.appendChild(li);
}

// Notification before deadline
function scheduleNotification(task) {
  const ALERT_BEFORE = 5 * 60 * 1000; // 5 minutes
  const CHECK_INTERVAL = 60 * 1000; // 1 minute

  const interval = setInterval(() => {
    const now = Date.now();

    if (task.due - now <= ALERT_BEFORE && task.due - now > 0) {
      showNotification(task.title);
      clearInterval(interval);
    }
  }, CHECK_INTERVAL);
}

// Show notification
function showNotification(title) {
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification("⏰ Task Reminder", {
      body: title,
      icon: "icon-192.png",
      vibrate: [200, 100, 200]
    });
  });
}
