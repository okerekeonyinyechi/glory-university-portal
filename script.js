
// GLORY UNIVERSITY STUDENT MANAGEMENT SYSTEM

const storageKey = "glory_university_students";
const themeKey = "glory_university_theme";

const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
const levelFilter = document.getElementById("levelFilter");
const formMessage = document.getElementById("formMessage");

let students = [];
let editingId = null;
let toastTimer;

// LOAD SAVED STUDENTS
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  students = Array.isArray(saved) ? saved : [];
} catch {
  students = [];
}

// SAVE STUDENTS
function saveStudents() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(students));
    return true;
  } catch {
    showToast("Unable to save records.");
    return false;
  }
}

// GENERATE UNIQUE STUDENT ID
function generateId() {
  let id;

  do {
    id = "GU-" + Date.now().toString(36).toUpperCase()
      + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  } while (students.some(student => student.id === id));

  return id;
}

// STUDENT INITIALS
function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
}

// CREATE HTML ELEMENTS SAFELY
function element(tag, className, text) {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);

  return node;
}

// NOTIFICATION
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// NAVIGATION
function showPage(page) {
  const validPages = ["dashboard", "register", "students"];

  if (!validPages.includes(page)) {
    page = "dashboard";
  }

  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("hidden", view.id !== page);
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.view === page);
  });

  const titles = {
    dashboard: "Dashboard",
    register: "Student Registration",
    students: "Student Directory"
  };

  document.getElementById("pageTitle").textContent = titles[page];

  document.getElementById("sidebar").classList.remove("open");

  if (page === "dashboard") updateDashboard();
  if (page === "students") displayStudents();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// SIDEBAR LINKS
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    showPage(link.dataset.view);
  });
});

// PAGE BUTTONS
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.go === "register") {
      clearForm();
    }

    showPage(button.dataset.go);
  });
});

// MOBILE MENU
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// DARK MODE
const themeToggle = document.getElementById("themeToggle");

function updateThemeIcon() {
  themeToggle.innerHTML = document.body.classList.contains("dark")
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

try {
  if (localStorage.getItem(themeKey) === "dark") {
    document.body.classList.add("dark");
  }
} catch {}

updateThemeIcon();

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const theme = document.body.classList.contains("dark")
    ? "dark"
    : "light";

  try {
    localStorage.setItem(themeKey, theme);
  } catch {}

  updateThemeIcon();
});

// CLEAR REGISTRATION FORM
function clearForm() {
  form.reset();
  editingId = null;
  formMessage.textContent = "";

  document.getElementById("formTitle").textContent = "New Student";
  document.getElementById("submitButton").textContent = "Register Student";
}

document.getElementById("resetForm").addEventListener("click", clearForm);

// REGISTER OR UPDATE STUDENT
form.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = Number(document.getElementById("age").value);
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value;
  const level = document.getElementById("level").value;

  if (
    !name ||
    !email ||
    !course ||
    !level ||
    !Number.isInteger(age) ||
    age < 1 ||
    age > 120 ||
    !form.checkValidity()
  ) {
    formMessage.style.color = "#dc2626";
    formMessage.textContent = "Please enter valid student details.";
    return;
  }

  const duplicate = students.some(student =>
    student.email.toLowerCase() === email.toLowerCase()
    && student.id !== editingId
  );

  if (duplicate) {
    formMessage.style.color = "#dc2626";
    formMessage.textContent = "This email is already registered.";
    return;
  }

  const previous = [...students];

  if (editingId !== null) {
    const index = students.findIndex(student => student.id === editingId);

    if (index === -1) {
      showToast("Student record not found.");
      return;
    }

    students[index] = {
      ...students[index],
      name,
      age,
      email,
      course,
      level
    };
  } else {
    students.push({
      id: generateId(),
      name,
      age,
      email,
      course,
      level,
      registeredAt: new Date().toISOString()
    });
  }

  if (!saveStudents()) {
    students = previous;
    return;
  }

  const wasEditing = editingId !== null;

  clearForm();
  updateDashboard();
  displayStudents();

  showToast(
    wasEditing
      ? "Student updated successfully!"
      : "Student registered successfully!"
  );

  showPage("students");
});

// EDIT STUDENT
function editStudent(id) {
  const student = students.find(student => student.id === id);

  if (!student) return;

  editingId = id;

  document.getElementById("name").value = student.name;
  document.getElementById("age").value = student.age;
  document.getElementById("email").value = student.email;
  document.getElementById("course").value = student.course;
  document.getElementById("level").value = student.level;

  document.getElementById("formTitle").textContent = "Edit Student";
  document.getElementById("submitButton").textContent = "Save Changes";

  showPage("register");
}

// DELETE STUDENT
function deleteStudent(id) {
  const student = students.find(student => student.id === id);

  if (!student) return;

  const confirmed = confirm(
    "Are you sure you want to delete " + student.name + "?"
  );

  if (!confirmed) return;

  const previous = [...students];

  students = students.filter(student => student.id !== id);

  if (!saveStudents()) {
    students = previous;
    return;
  }

  updateDashboard();
  displayStudents();
  showToast("Student deleted successfully.");
}

// CREATE STUDENT AVATAR
function createAvatar(name) {
  return element("div", "student-avatar", getInitials(name));
}

// DISPLAY STUDENT DIRECTORY
function displayStudents() {
  tableBody.replaceChildren();

  const search = searchInput.value.toLowerCase().trim();
  const selectedLevel = levelFilter.value;

  const filtered = students.filter(student => {
    const searchable = [
      student.name,
      student.email,
      student.id,
      student.course,
      student.level
    ].join(" ").toLowerCase();

    return searchable.includes(search)
      && (!selectedLevel || student.level === selectedLevel);
  });

  document.getElementById("resultCount").textContent =
    filtered.length + " student(s)";

  if (filtered.length === 0) {
    const row = element("tr");
    const cell = element("td", "", "No matching students found.");
    cell.colSpan = 6;
    cell.style.textAlign = "center";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  filtered.forEach(student => {
    const row = element("tr");

    // NAME AND EMAIL
    const nameCell = element("td");
    const studentInfo = element("div", "student-cell");
    const details = element("div");

    details.appendChild(element("strong", "", student.name));
    details.appendChild(element("small", "", student.email));

    studentInfo.appendChild(createAvatar(student.name));
    studentInfo.appendChild(details);
    nameCell.appendChild(studentInfo);

    row.appendChild(nameCell);

    // OTHER DETAILS
    [student.id, student.course, student.level, student.age]
      .forEach(value => {
        row.appendChild(element("td", "", value));
      });

    // ACTION BUTTONS
    const actions = element("td");

    const editButton = element("button", "action-btn edit-btn", "Edit");
    editButton.type = "button";
    editButton.addEventListener("click", () => editStudent(student.id));

    const deleteButton = element("button", "action-btn delete-btn", "Delete");
    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => deleteStudent(student.id));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    row.appendChild(actions);
    tableBody.appendChild(row);
  });
}

// SEARCH AND FILTER
searchInput.addEventListener("input", displayStudents);
levelFilter.addEventListener("change", displayStudents);

// DASHBOARD COUNTS
function updateDashboard() {
  document.getElementById("totalStudents").textContent = students.length;

  const courses = new Set(students.map(student => student.course));
  const levels = new Set(students.map(student => student.level));

  document.getElementById("totalCourses").textContent = courses.size;
  document.getElementById("totalLevels").textContent = levels.size;

  const sorted = [...students].sort((a, b) =>
    new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0)
  );

  const latest = sorted[0];

  document.getElementById("latestRegistration").textContent =
    latest && latest.registeredAt
      ? new Date(latest.registeredAt).toLocaleDateString()
      : "—";

  updateCharts();
  displayRecentStudents(sorted);
}

// COURSE AND LEVEL CHARTS
function updateCharts() {
  const courseChart = document.getElementById("courseChart");
  const levelChart = document.getElementById("levelChart");

  courseChart.replaceChildren();
  levelChart.replaceChildren();

  function drawChart(container, field) {
    if (students.length === 0) {
      container.appendChild(
        element("p", "", "No student data available yet.")
      );
      return;
    }

    const counts = {};

    students.forEach(student => {
      const value = student[field];
      counts[value] = (counts[value] || 0) + 1;
    });

    Object.entries(counts).forEach(([label, count]) => {
      const percentage = (count / students.length) * 100;

      const row = element("div", "chart-row");
      const heading = element("div", "chart-label");

      heading.appendChild(element("span", "", label));
      heading.appendChild(element("strong", "", count));

      const track = element("div", "chart-track");
      const fill = element("div", "chart-fill");

      fill.style.width = percentage + "%";

      track.appendChild(fill);
      row.appendChild(heading);
      row.appendChild(track);

      container.appendChild(row);
    });
  }

  drawChart(courseChart, "course");
  drawChart(levelChart, "level");
}

// RECENT REGISTRATIONS
function displayRecentStudents(sorted) {
  const container = document.getElementById("recentStudents");
  container.replaceChildren();

  if (sorted.length === 0) {
    container.appendChild(
      element("p", "", "No students registered yet.")
    );
    return;
  }

  sorted.slice(0, 5).forEach(student => {
    const item = element("div", "recent-item");
    const info = element("div", "recent-info");

    info.appendChild(element("strong", "", student.name));
    info.appendChild(
      element("small", "", student.course + " • " + student.level)
    );

    item.appendChild(createAvatar(student.name));
    item.appendChild(info);

    container.appendChild(item);
  });
}

// EXPORT STUDENT DATA AS CSV
document.getElementById("exportButton").addEventListener("click", () => {
  if (students.length === 0) {
    showToast("There are no students to export.");
    return;
  }

  const headers = [
    "Student ID",
    "Full Name",
    "Age",
    "Email",
    "Course",
    "Level",
    "Registration Date"
  ];

  const escapeCSV = value => {
    const text = String(value ?? "");
    return '"' + text.replace(/"/g, '""') + '"';
  };

  const rows = students.map(student => [
    student.id,
    student.name,
    student.age,
    student.email,
    student.course,
    student.level,
    student.registeredAt || ""
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "glory_university_students.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  showToast("Student records exported!");
});

// INITIALIZE WEBSITE
updateDashboard();
displayStudents();

const initialPage = window.location.hash.slice(1);
showPage(
  ["dashboard", "register", "students"].includes(initialPage)
    ? initialPage
    : "dashboard"
);
