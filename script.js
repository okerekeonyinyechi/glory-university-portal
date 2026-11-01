
/* =================================
   GLORY UNIVERSITY
   Main JavaScript
================================= */

// DEMO STUDENT DATA

let currentStudent = null;

let registeredCourses = [];

let studentPhoto = "";

// SAMPLE ANNOUNCEMENTS

const announcements = [
    {
        title: "Welcome to Glory University",
        message: "Welcome to our student portal. We are glad to have you here."
    },
    {
        title: "Course Registration",
        message: "Students are encouraged to complete their course registration."
    },
    {
        title: "Academic Activities",
        message: "Keep checking the academic calendar for important dates."
    }
];

// HELPER: GET ELEMENT

function getElement(id) {
    return document.getElementById(id);
}

// SHOW HOMEPAGE

function showHome() {
    getElement("home").classList.remove("hidden");
    getElement("auth-section").classList.add("hidden");
    getElement("portal-section").classList.add("hidden");

    document.querySelector(".header").classList.remove("hidden");
    document.querySelector(".footer").classList.remove("hidden");

    window.scrollTo(0, 0);
}

// SHOW LOGIN OR REGISTRATION

function showAuth(type) {
    getElement("home").classList.add("hidden");
    getElement("auth-section").classList.remove("hidden");
    getElement("portal-section").classList.add("hidden");

    document.querySelector(".header").classList.add("hidden");
    document.querySelector(".footer").classList.add("hidden");

    getElement("login-form").classList.toggle("hidden", type !== "login");
    getElement("register-form").classList.toggle("hidden", type !== "register");

    window.scrollTo(0, 0);
}

// REGISTER NEW STUDENT

getElement("register-form").addEventListener("submit", function(event) {

    event.preventDefault();

    const name = getElement("register-name").value.trim();
    const email = getElement("register-email").value.trim().toLowerCase();
    const password = getElement("register-password").value;
    const department = getElement("register-department").value;

    if (!name || !email || !password || !department) {
        alert("Please complete all the fields.");
        return;
    }

    if (password.length < 6) {
        alert("Your password must contain at least 6 characters.");
        return;
    }

    const students = JSON.parse(localStorage.getItem("gloryStudents")) || [];

    const existingStudent = students.find(student => student.email === email);

    if (existingStudent) {
        alert("An account with this email already exists. Please log in.");
        showAuth("login");
        return;
    }

    const newStudent = {
        id: "GU/2026/" + String(students.length + 1).padStart(3, "0"),
        name: name,
        email: email,
        password: password,
        department: department,
        level: "300 Level",
        courses: []
    };

    students.push(newStudent);

    localStorage.setItem("gloryStudents", JSON.stringify(students));

    currentStudent = newStudent;

    registeredCourses = [];

    alert("Registration successful! Welcome to Glory University.");

    openPortal();
});

// STUDENT LOGIN

getElement("login-form").addEventListener("submit", function(event) {

    event.preventDefault();

    const email = getElement("login-email").value.trim().toLowerCase();
    const password = getElement("login-password").value;

    const students = JSON.parse(localStorage.getItem("gloryStudents")) || [];

    const student = students.find(function(item) {
        return item.email === email && item.password === password;
    });

    if (!student) {
        alert("Incorrect email or password. Please try again.");
        return;
    }

    currentStudent = student;

    registeredCourses = student.courses || [];

    studentPhoto = student.photo || "";

    alert("Login successful!");

    openPortal();
});

// OPEN STUDENT PORTAL

function openPortal() {

    if (!currentStudent) return;

    getElement("home").classList.add("hidden");
    getElement("auth-section").classList.add("hidden");
    getElement("portal-section").classList.remove("hidden");

    document.querySelector(".header").classList.add("hidden");
    document.querySelector(".footer").classList.add("hidden");

    updateStudentInformation();

    showPortalPage("dashboard");

    updateDashboard();

    window.scrollTo(0, 0);
}

// UPDATE STUDENT INFORMATION

function updateStudentInformation() {

    if (!currentStudent) return;

    const name = currentStudent.name;
    const initials = name.split(" ")
        .filter(Boolean)
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    getElement("sidebar-name").textContent = name;
    getElement("welcome-name").textContent = "Hello, " + name;
    getElement("header-student-name").textContent = name;

    getElement("sidebar-avatar").textContent = initials;
    getElement("header-avatar").textContent = initials;

    getElement("profile-name").value = name;
    getElement("profile-email").value = currentStudent.email;
    getElement("profile-department").value = currentStudent.department;
    getElement("profile-level").value = currentStudent.level || "300 Level";

    getElement("id-name").textContent = name;
    getElement("id-department").textContent = currentStudent.department;
    getElement("id-number").textContent = currentStudent.id;
    getElement("id-level").textContent = currentStudent.level || "300 Level";

    if (studentPhoto) {

        getElement("sidebar-avatar").innerHTML =
            `<img src="${studentPhoto}" alt="Student photo">`;

        getElement("header-avatar").innerHTML =
            `<img src="${studentPhoto}" alt="Student photo">`;

        getElement("id-photo").innerHTML =
            `<img src="${studentPhoto}" alt="Student photo">`;

    } else {

        getElement("id-photo").textContent = initials;
    }
}

// SHOW DIFFERENT PORTAL PAGES

function showPortalPage(page, button = null) {

    const pages = document.querySelectorAll(".portal-page");

    pages.forEach(function(item) {
        item.classList.add("hidden");
    });

    const selectedPage = getElement(page);

    if (!selectedPage) return;

    selectedPage.classList.remove("hidden");

    const pageNames = {
        "dashboard": "Student Dashboard",
        "courses": "Course Registration",
        "results": "Academic Results",
        "announcements": "Announcements",
        "calendar-page": "Academic Calendar",
        "profile": "My Profile",
        "student-id": "Student Identity Card"
    };

    getElement("portal-heading").textContent = pageNames[page] || "Student Portal";

    document.querySelectorAll(".sidebar-link").forEach(function(link) {
        link.classList.remove("active");
    });

    if (button && button.classList.contains("sidebar-link")) {
        button.classList.add("active");
    } else {
        document.querySelectorAll(".sidebar-link").forEach(function(link) {
            if (link.getAttribute("onclick")?.includes("'" + page + "'")) {
                link.classList.add("active");
            }
        });
    }

    if (page === "profile" || page === "student-id") {
        updateStudentInformation();
    }
}

// COURSE CREDIT UNIT CALCULATOR

const courseCheckboxes = document.querySelectorAll(
    '#course-list input[type="checkbox"]'
);

courseCheckboxes.forEach(function(checkbox) {

    checkbox.addEventListener("change", calculateUnits);

});

function calculateUnits() {

    let total = 0;

    courseCheckboxes.forEach(function(checkbox) {

        if (checkbox.checked) {
            total += Number(checkbox.dataset.unit);
        }

    });

    getElement("total-units").textContent = total;
}

// SAVE COURSE REGISTRATION

function registerCourses() {

    if (!currentStudent) return;

    registeredCourses = [];

    courseCheckboxes.forEach(function(checkbox) {

        if (checkbox.checked) {

            registeredCourses.push({
                code: checkbox.value,
                units: Number(checkbox.dataset.unit)
            });

        }

    });

    if (registeredCourses.length === 0) {
        alert("Please select at least one course.");
        return;
    }

    currentStudent.courses = registeredCourses;

    saveCurrentStudent();

    updateDashboard();

    alert("Your courses have been registered successfully!");
}

// UPDATE DASHBOARD

function updateDashboard() {

    if (!currentStudent) return;

    getElement("dashboard-courses").textContent = registeredCourses.length;

    let totalUnits = 0;

    registeredCourses.forEach(function(course) {
        totalUnits += Number(course.units);
    });

    getElement("dashboard-units").textContent = totalUnits;

    // Demonstration GPA, not an actual calculated academic result.
    getElement("dashboard-gpa").textContent = "4.50";

    const announcementContainer = getElement("dashboard-announcements");

    announcementContainer.innerHTML = "";

    announcements.slice(0, 2).forEach(function(item) {

        const announcement = document.createElement("div");

        announcement.className = "announcement-item";

        const icon = document.createElement("span");
        icon.textContent = "📢";

        const content = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = item.title;

        const message = document.createElement("p");
        message.textContent = item.message;

        content.appendChild(title);
        content.appendChild(message);

        announcement.appendChild(icon);
        announcement.appendChild(content);

        announcementContainer.appendChild(announcement);

    });
}

// SAVE PROFILE CHANGES

getElement("profile-form").addEventListener("submit", function(event) {

    event.preventDefault();

    if (!currentStudent) return;

    currentStudent.name = getElement("profile-name").value.trim();

    currentStudent.department = getElement("profile-department").value.trim();

    currentStudent.level = getElement("profile-level").value;

    saveCurrentStudent();

    updateStudentInformation();

    updateDashboard();

    alert("Your profile has been updated successfully!");

});

// UPLOAD PROFILE PICTURE

getElement("profile-photo").addEventListener("change", function(event) {

    if (!currentStudent) return;

    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image smaller than 2MB.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        studentPhoto = e.target.result;

        currentStudent.photo = studentPhoto;

        saveCurrentStudent();

        updateStudentInformation();

        alert("Profile picture updated!");

    };

    reader.readAsDataURL(file);

});

// SAVE UPDATED STUDENT DATA

function saveCurrentStudent() {

    if (!currentStudent) return;

    const students = JSON.parse(localStorage.getItem("gloryStudents")) || [];

    const index = students.findIndex(function(student) {
        return student.id === currentStudent.id;
    });

    if (index !== -1) {

        students[index] = currentStudent;

        localStorage.setItem("gloryStudents", JSON.stringify(students));

    }
}

// LOGOUT

function logout() {

    const confirmLogout = confirm("Are you sure you want to log out?");

    if (!confirmLogout) return;

    currentStudent = null;

    registeredCourses = [];

    studentPhoto = "";

    getElement("login-form").reset();

    getElement("register-form").reset();

    showHome();

    alert("You have successfully logged out.");

}

// INITIAL PAGE SETUP

document.addEventListener("DOMContentLoaded", function() {

    showHome();

});
