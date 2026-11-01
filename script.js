
// ======================================
// GLORY UNIVERSITY - MAIN JAVASCRIPT
// ======================================

const $ = id => document.getElementById(id);

const getData = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

let currentUser = getData("guCurrentUser", null);

const courses = [
  {code:"CSC 201",title:"Introduction to Computer Science",units:3},
  {code:"CSC 203",title:"Data Structures",units:3},
  {code:"CSC 205",title:"Computer Programming",units:3},
  {code:"MTH 201",title:"Mathematical Methods",units:3},
  {code:"GST 201",title:"Communication in English",units:2},
  {code:"IFT 201",title:"Information Technology",units:2},
  {code:"CSC 207",title:"Web Development",units:3},
  {code:"STA 201",title:"Introduction to Statistics",units:2}
];

const announcements = [
  {title:"Registration for the new semester",date:"November 2026",text:"Students are encouraged to complete their course registration before the semester deadline."},
  {title:"Academic orientation",date:"November 2026",text:"New students should check their departmental information for orientation arrangements."},
  {title:"Examination preparation",date:"December 2026",text:"Students should confirm their registered courses and prepare for upcoming examinations."}
];

const events = [
  {date:"November 09, 2026",title:"Resumption and registration",text:"Beginning of the academic registration period."},
  {date:"November 16, 2026",title:"Lectures commence",text:"First day of lectures for the semester."},
  {date:"December 14, 2026",title:"Revision period",text:"Academic revision and preparation."},
  {date:"January 11, 2027",title:"First semester examinations",text:"Tentative examination period."}
];

// ======================================
// GENERAL FUNCTIONS
// ======================================

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function initials(name) {
  return (name || "GU")
    .trim()
    .split(/\s+/)
    .slice(0,2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

function showHome() {
  $("homePage").classList.remove("hidden");
  $("authPage").classList.add("hidden");
  $("portalPage").classList.add("hidden");
  $("navLinks").classList.remove("open");
  window.scrollTo(0,0);
}

function openAuth(mode) {
  $("homePage").classList.add("hidden");
  $("portalPage").classList.add("hidden");
  $("authPage").classList.remove("hidden");

  const registering = mode === "register";

  $("authTitle").textContent = registering ? "Create Student Account" : "Student Login";
  $("authDescription").textContent = registering
    ? "Enter your information to create your account."
    : "Welcome back. Sign in to your student account.";

  $("registerFields").classList.toggle("hidden", !registering);
  $("loginFields").classList.toggle("hidden", registering);
  $("authSwitch").classList.toggle("hidden", registering);
  $("loginSwitch").classList.toggle("hidden", !registering);
  $("authSubmit").textContent = registering ? "Create Account" : "Sign In";

  $("authForm").dataset.mode = mode;
  $("password").value = "";
  window.scrollTo(0,0);
}

function toggleMenu() {
  $("navLinks").classList.toggle("open");
}

function toggleSidebar() {
  $("sidebar").classList.toggle("open");
}

function togglePassword() {
  const field = $("password");
  field.type = field.type === "password" ? "text" : "password";
}

// ======================================
// AUTHENTICATION
// ======================================

$("authForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const mode = this.dataset.mode;
  const password = $("password").value.trim();

  if (password.length < 6) {
    notify("Password must contain at least 6 characters.");
    return;
  }

  const students = getData("guStudents", []);

  if (mode === "register") {
    const name = $("fullName").value.trim();
    const email = $("registerEmail").value.trim().toLowerCase();
    const department = $("department").value;
    const level = $("level").value;

    if (!name || !email || !department || !level) {
      notify("Please complete all registration fields.");
      return;
    }

    if (students.some(student => student.email === email)) {
      notify("This email is already registered. Please log in.");
      return;
    }

    const matric = "GU/2026/" +
      String(students.length + 1).padStart(4,"0");

    const student = {
      name,
      email,
      password,
      department,
      level,
      matric,
      photo:"",
      selectedCourses:[],
      createdAt:new Date().toISOString()
    };

    students.push(student);
    saveData("guStudents", students);
    currentUser = student;
    saveData("guCurrentUser", currentUser);

    notify("Account created successfully!");
    openPortal();

  } else {
    const email = $("loginEmail").value.trim().toLowerCase();

    const student = students.find(
      item => item.email === email && item.password === password
    );

    if (!student) {
      notify("Incorrect email or password.");
      return;
    }

    currentUser = student;
    saveData("guCurrentUser", currentUser);

    notify("Welcome back!");
    openPortal();
  }
});

// ======================================
// PORTAL NAVIGATION
// ======================================

function openPortal() {
  if (!currentUser) return;

  $("homePage").classList.add("hidden");
  $("authPage").classList.add("hidden");
  $("portalPage").classList.remove("hidden");

  $("currentDate").textContent =
    new Date().toLocaleDateString("en-GB", {
      day:"numeric",
      month:"short",
      year:"numeric"
    });

  updateStudentInfo();
  showPortalPage("dashboard");
  window.scrollTo(0,0);
}

function showPortalPage(page) {
  document.querySelectorAll(".portal-view").forEach(section => {
    section.classList.add("hidden");
  });

  $("view-" + page).classList.remove("hidden");

  document.querySelectorAll(".side-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  const headings = {
    dashboard:"Overview",
    courses:"Course Registration",
    results:"Results & GPA",
    notices:"Announcements",
    calendar:"Academic Calendar",
    profile:"My Profile",
    idcard:"Student ID Card"
  };

  $("pageHeading").textContent = headings[page] || "Student Portal";

  if (page === "dashboard") renderDashboard();
  if (page === "courses") renderCourses();
  if (page === "results") renderResults();
  if (page === "notices") renderAnnouncements("allNotices");
  if (page === "calendar") renderCalendar("allCalendar");
  if (page === "profile") renderProfile();
  if (page === "idcard") renderIDCard();

  $("sidebar").classList.remove("open");
}

function logout() {
  currentUser = null;
  saveData("guCurrentUser", null);
  notify("You have signed out.");
  showHome();
}

// ======================================
// STUDENT INFORMATION
// ======================================

function updateStudentInfo() {
  const name = currentUser.name;
  const initialsText = initials(name);

  $("sideName").textContent = name;
  $("sideMatric").textContent = currentUser.matric;
  $("sideAvatar").textContent = initialsText;
  $("headerAvatar").textContent = initialsText;

  if (currentUser.photo) {
    $("sideAvatar").innerHTML =
      `<img src="${currentUser.photo}" alt="Profile">`;
    $("headerAvatar").innerHTML =
      `<img src="${currentUser.photo}" alt="Profile">`;
  }
}

function renderDashboard() {
  const selected = currentUser.selectedCourses || [];

  $("welcomeName").textContent = currentUser.name.split(" ")[0];
  $("dashMatric").textContent = currentUser.matric;
  $("dashLevel").textContent = currentUser.level;
  $("dashCourses").textContent = selected.length;

  $("dashGpa").textContent = calculateGPA().toFixed(2);

  $("academicInfo").innerHTML = `
    <div><span>Full Name</span><strong>${escapeHTML(currentUser.name)}</strong></div>
    <div><span>Email Address</span><strong>${escapeHTML(currentUser.email)}</strong></div>
    <div><span>Department</span><strong>${escapeHTML(currentUser.department)}</strong></div>
    <div><span>Academic Level</span><strong>${escapeHTML(currentUser.level)}</strong></div>
    <div><span>Matric Number</span><strong>${escapeHTML(currentUser.matric)}</strong></div>
    <div><span>Academic Session</span><strong>2026/2027</strong></div>
  `;

  $("dashboardNotices").innerHTML = announcements.slice(0,2).map(item => `
    <div class="announcement-item">
      <h3>${item.title}</h3>
      <small>${item.date}</small>
      <p>${item.text}</p>
    </div>
  `).join("");
}

// Escape user-supplied text before placing it in HTML.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  })[character]);
}

// ======================================
// COURSE REGISTRATION
// ======================================

function renderCourses() {
  const selected = currentUser.selectedCourses || [];

  $("courseOptions").innerHTML = courses.map(course => `
    <div class="course-option">
      <label>
        <input type="checkbox"
          value="${course.code}"
          ${selected.includes(course.code) ? "checked" : ""}
          onchange="updateTotalUnits()">
        <span><strong>${course.code}</strong> — ${course.title}</span>
      </label>
      <small>${course.units} Units</small>
    </div>
  `).join("");

  updateTotalUnits();
  renderRegisteredCourses();
}

function updateTotalUnits() {
  const selected = [...document.querySelectorAll(
    "#courseOptions input:checked"
  )].map(input => input.value);

  const total = courses
    .filter(course => selected.includes(course.code))
    .reduce((sum,course) => sum + course.units,0);

  $("totalUnits").textContent = total;
}

function saveCourses() {
  const selected = [...document.querySelectorAll(
    "#courseOptions input:checked"
  )].map(input => input.value);

  const total = courses
    .filter(course => selected.includes(course.code))
    .reduce((sum,course) => sum + course.units,0);

  if (selected.length === 0) {
    notify("Please select at least one course.");
    return;
  }

  if (total > 24) {
    notify("Maximum allowed demonstration units: 24.");
    return;
  }

  currentUser.selectedCourses = selected;
  updateCurrentStudent();

  $("courseMessage").textContent =
    "Your course registration has been saved successfully.";

  renderRegisteredCourses();
  notify("Courses saved successfully!");
}

function renderRegisteredCourses() {
  const selected = currentUser.selectedCourses || [];

  const registered = courses.filter(course =>
    selected.includes(course.code)
  );

  $("registeredCourses").innerHTML = registered.length
    ? registered.map(course => `
      <div class="course-option">
        <span><strong>${course.code}</strong> — ${course.title}</span>
        <small>${course.units} Units</small>
      </div>
    `).join("")
    : "<p class='small-note'>You have not registered any courses yet.</p>";
}

// ======================================
// RESULTS AND GPA
// ======================================

// Illustrative sample results. Replace with official results
// from a properly secured university database in a real system.

const sampleResults = [
  {code:"CSC 201",title:"Computer Science",units:3,score:82},
  {code:"CSC 203",title:"Data Structures",units:3,score:75},
  {code:"MTH 201",title:"Mathematical Methods",units:3,score:68},
  {code:"GST 201",title:"Communication in English",units:2,score:72},
  {code:"IFT 201",title:"Information Technology",units:2,score:60}
];

function getGrade(score) {
  if (score >= 70) return {grade:"A",point:5};
  if (score >= 60) return {grade:"B",point:4};
  if (score >= 50) return {grade:"C",point:3};
  if (score >= 45) return {grade:"D",point:2};
  if (score >= 40) return {grade:"E",point:1};
  return {grade:"F",point:0};
}

function calculateGPA() {
  let totalPoints = 0;
  let totalUnits = 0;

  sampleResults.forEach(result => {
    const grade = getGrade(result.score);
    totalPoints += grade.point * result.units;
    totalUnits += result.units;
  });

  return totalUnits ? totalPoints / totalUnits : 0;
}

function renderResults() {
  $("resultsBody").innerHTML = sampleResults.map(result => {
    const grade = getGrade(result.score);

    return `
      <tr>
        <td>${result.code}</td>
        <td>${result.title}</td>
        <td>${result.units}</td>
        <td>${result.score}</td>
        <td>${grade.grade}</td>
        <td>${grade.point}</td>
      </tr>
    `;
  }).join("");

  $("gpaResult").textContent =
    calculateGPA().toFixed(2) + " / 5.00";
}

// ======================================
// ANNOUNCEMENTS
// ======================================

function renderAnnouncements(elementId) {
  $(elementId).innerHTML = announcements.map(item => `
    <article class="announcement-item">
      <small>${item.date}</small>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

// ======================================
// ACADEMIC CALENDAR
// ======================================

function renderCalendar(elementId) {
  $(elementId).innerHTML = events.map(item => `
    <article class="calendar-item">
      <div class="calendar-date">📅<br>${item.date.split(" ")[1] || ""}</div>
      <div>
        <small>${item.date}</small>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>
    </article>
  `).join("");
}

// ======================================
// PROFILE MANAGEMENT
// ======================================

function renderProfile() {
  $("profileName").value = currentUser.name;
  $("profileEmail").value = currentUser.email;
  $("profileDepartment").value = currentUser.department;
  $("profileLevel").value = currentUser.level;
  $("profileMatric").value = currentUser.matric;

  $("profileAvatar").textContent = initials(currentUser.name);

  if (currentUser.photo) {
    $("profileAvatar").innerHTML =
      `<img src="${currentUser.photo}" alt="Student profile">`;
  }
}

$("profileForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("profileName").value.trim();
  const email = $("profileEmail").value.trim().toLowerCase();

  if (!name || !email) {
    notify("Please complete your profile.");
    return;
  }

  const students = getData("guStudents", []);

  const emailUsed = students.some(student =>
    student.email === email &&
    student.matric !== currentUser.matric
  );

  if (emailUsed) {
    notify("That email address is already in use.");
    return;
  }

  currentUser.name = name;
  currentUser.email = email;
  currentUser.level = $("profileLevel").value;

  updateCurrentStudent();
  updateStudentInfo();
  renderProfile();

  $("profileMessage").textContent =
    "Your profile has been updated.";

  notify("Profile updated successfully!");
});

function updateCurrentStudent() {
  const students = getData("guStudents", []);

  const index = students.findIndex(student =>
    student.matric === currentUser.matric
  );

  if (index !== -1) {
    students[index] = currentUser;
    saveData("guStudents", students);
  }

  saveData("guCurrentUser", currentUser);
}

// ======================================
// PROFILE PHOTO UPLOAD
// ======================================

function uploadPhoto(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    notify("Please select an image.");
    return;
  }

  if (file.size > 1024 * 1024) {
    notify("Please choose an image smaller than 1MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    currentUser.photo = reader.result;
    updateCurrentStudent();
    updateStudentInfo();
    renderProfile();
    notify("Profile photo updated!");
  };

  reader.readAsDataURL(file);
}

// ======================================
// DIGITAL STUDENT ID CARD
// ======================================

function renderIDCard() {
  const name = currentUser.name;

  $("idName").textContent = name;
  $("idMatric").textContent = currentUser.matric;
  $("idDepartment").textContent = currentUser.department;
  $("idLevel").textContent = currentUser.level;

  $("idPhoto").textContent = initials(name);

  if (currentUser.photo) {
    $("idPhoto").innerHTML =
      `<img src="${currentUser.photo}" alt="Student photo">`;
  }
}

// ======================================
// HOMEPAGE CONTENT
// ======================================

function renderPublicContent() {
  renderAnnouncements("publicAnnouncements");
  renderCalendar("publicCalendar");
}

// ======================================
// INITIALIZATION
// ======================================

renderPublicContent();

if (currentUser) {
  const students = getData("guStudents", []);
  const savedStudent = students.find(student =>
    student.matric === currentUser.matric
  );

  if (savedStudent) {
    currentUser = savedStudent;
    saveData("guCurrentUser", currentUser);
    openPortal();
  } else {
    currentUser = null;
    saveData("guCurrentUser", null);
  }
}
