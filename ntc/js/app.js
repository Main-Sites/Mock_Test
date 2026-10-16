let q = [];
let i = 0;
let score = 0;
let answers = {};

let timeLeft = 1500;
let timerInterval;

// Exam integrity controls
let examStarted = false;
let examSubmitted = false;
let violationCount = 0;
let lastViolationAt = 0;
const MAX_VIOLATIONS = 3;
const VIOLATION_DEBOUNCE_MS = 1500;

function isExamActive() {
    return examStarted && !examSubmitted;
}

function registerExamViolation(reason) {
    if (!isExamActive()) return;

    const now = Date.now();

    // Prevent one tab/app switch from being counted twice by blur + visibilitychange.
    if (now - lastViolationAt < VIOLATION_DEBOUNCE_MS) return;
    lastViolationAt = now;

    violationCount++;

    if (violationCount < MAX_VIOLATIONS) {
        const remaining = MAX_VIOLATIONS - violationCount;
        alert(
            "Warning " + violationCount + " of 2\\n\\n" +
            "You left the exam portal or switched to another tab/screen. " +
            "Please remain on the exam portal.\\n\\n" +
            "If this happens " + remaining + " more time(s), your exam will be submitted automatically."
        );
        return;
    }

    alert(
        "Final warning exceeded.\\n\\n" +
        "You have left the exam portal 3 times. Your exam will now be submitted automatically."
    );
    submitData(true);
}

// Detect browser tab changes, minimizing the page, and switching away from the portal.
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        registerExamViolation("visibilitychange");
    }
});

// Detect switching to another application/window.
window.addEventListener("blur", function () {
    registerExamViolation("blur");
});

// Count attempts to open a different page through links in the portal.
// Keep normal links usable before the exam and after submission.
document.addEventListener("click", function (event) {
    if (!isExamActive()) return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    const targetUrl = new URL(link.href, window.location.href);
    const currentUrl = new URL(window.location.href);

    if (targetUrl.href !== currentUrl.href) {
        event.preventDefault();
        registerExamViolation("navigation");
    }
});

function startTimer() {
    timerInterval = setInterval(function () {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById("timer").innerText =
            "Time: " + minutes + ":" + seconds;

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            document.getElementById("timer").innerText = "Time Over ⛔";
            alert("Time is up! Test will be submitted.");
            submitData(true);
        }
    }, 1000);
}

async function loadQuestionsFromSheet() {
    const res = await fetch("https://script.google.com/macros/s/AKfycbw-1558uu1xXl76sWb46G0HHRmJAIYcl3RiePloyNSlvU_rQiSasCYodN8RkmK5owr1Eg/exec");
    q = await res.json();
}

async function startTest() {
    let name = document.getElementById("name").value.trim();
    let whatsapp = document.getElementById("whatsapp").value.trim();

    if (name === "" || whatsapp === "") {
        alert("Please fill all details");
        return;
    }

    try {
        await loadQuestionsFromSheet();
        if (!Array.isArray(q) || q.length === 0) {
            alert("No questions were loaded. Please try again.");
            return;
        }
    } catch (error) {
        alert("Unable to load questions. Please check your internet connection and try again.");
        return;
    }

    // Reset exam state in case the page is reused without reloading.
    i = 0;
    score = 0;
    answers = {};
    timeLeft = 1500;
    violationCount = 0;
    lastViolationAt = 0;
    examSubmitted = false;
    examStarted = true;

    document.getElementById("formSection").style.display = "none";
    document.getElementById("quizSection").style.display = "block";

    startTimer();
    loadQ();
}

function loadQ() {
    if (!q[i]) return;

    document.getElementById("questionBox").innerText = (i + 1) + ". " + q[i].question;

    document.getElementById("A").innerText = "A. " + q[i].A;
    document.getElementById("B").innerText = "B. " + q[i].B;
    document.getElementById("C").innerText = "C. " + q[i].C;
    document.getElementById("D").innerText = "D. " + q[i].D;
}

function check(ans) {
    if (!isExamActive() || !q[i]) return;

    answers[i] = ans;

    if (ans === q[i].ans) {
        score++;
    }

    i++;

    if (i < q.length) {
        loadQ();
    } else {
        document.getElementById("submitBtn").style.display = "inline-block";
        document.getElementById("questionBox").innerText = "Test Completed!";
        document.getElementById("A").style.display = "none";
        document.getElementById("B").style.display = "none";
        document.getElementById("C").style.display = "none";
        document.getElementById("D").style.display = "none";
    }
}

function submitData(isAutomatic = false) {
    // Prevent duplicate submissions from timer, button, or violation events.
    if (examSubmitted) return;
    examSubmitted = true;
    examStarted = false;
    clearInterval(timerInterval);

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.disabled = true;

    let name = document.getElementById("name").value;
    let whatsapp = document.getElementById("whatsapp").value;
    let date = document.getElementById("date").value;

    let data = {
        name: name,
        whatsapp: whatsapp,
        date: date,
        score: score,
        answers: answers,
        submissionReason: isAutomatic ? "automatic" : "manual",
        examPortalViolations: violationCount
    };

    fetch("https://script.google.com/macros/s/AKfycbw-1558uu1xXl76sWb46G0HHRmJAIYcl3RiePloyNSlvU_rQiSasCYodN8RkmK5owr1Eg/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        document.getElementById("result").innerHTML =
            "<h2>Score: " + score + " / " + q.length + "</h2>";

        document.getElementById("Textafterlink").innerText =
            "To know more about your Complete Response details, click the button below, then click on the WhatsApp Chatbox at the bottom right, enter your Name, e-mail and Mobile Number, and send it.";

        document.getElementById("nextLink").style.display = "inline";

        // Stop further answering after submission.
        ["A", "B", "C", "D"].forEach(function (id) {
            const option = document.getElementById(id);
            if (option) option.style.display = "none";
        });

        document.getElementById("questionBox").innerText =
            isAutomatic ? "Exam submitted automatically." : "Exam submitted successfully.";
    })
    .catch(() => {
        // With mode:"no-cors", browsers may not expose a response; this is a fallback only.
        document.getElementById("result").innerHTML =
            "<h2>Your exam submission was attempted. Please contact the administrator if your result is not recorded.</h2>";
    });
}
