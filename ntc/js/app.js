let q = [];
let i = 0;
let score = 0;
let answers = {};

let timeLeft = 1800; // if you want to change time into 30 minutes ,then type 1800 as seconds , Why 1800?- 25 minutes × 60 seconds = 1500 seconds,like wise  30 minutes × 60 seconds = 1800 seconds
let timerInterval;

// Exam integrity controls
let examStarted = false;
let examSubmitted = false;
let violationCount = 0;
let lastViolationAt = 0;
const MAX_VIOLATIONS = 3;
const VIOLATION_DEBOUNCE_MS = 1800;

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
            "Warning " + violationCount + " of 2\n\n" +
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

// Change this code before publishing the portal.
// Note: a code stored in browser JavaScript is not secure against technical users.
const EXAM_ACCESS_CODE = "NTC2026";

function startTest() {
    const name = document.getElementById("name").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();

    if (name === "" || whatsapp === "") {
        alert("Please fill in your name and WhatsApp number first.");
        return;
    }

    const modal = document.getElementById("accessCodeModal");
    const codeInput = document.getElementById("accessCodeInput");
    const error = document.getElementById("accessCodeError");

    error.style.display = "none";
    codeInput.value = "";
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
    window.setTimeout(function () { codeInput.focus(); }, 50);
}

function closeAccessCodeModal() {
    const modal = document.getElementById("accessCodeModal");
    if (modal) modal.style.display = "none";
    document.body.classList.remove("modal-open");
}

async function verifyAccessCode() {
    const codeInput = document.getElementById("accessCodeInput");
    const error = document.getElementById("accessCodeError");
    const verifyBtn = document.getElementById("verifyAccessBtn");
    const enteredCode = codeInput.value.trim();

    if (!enteredCode) {
        error.textContent = "Please enter the exam access code.";
        error.style.display = "block";
        codeInput.focus();
        return;
    }

    if (enteredCode.toUpperCase() !== EXAM_ACCESS_CODE.toUpperCase()) {
        error.textContent = "Incorrect code. Please check with the exam administrator.";
        error.style.display = "block";
        codeInput.select();
        return;
    }

    error.style.display = "none";
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';

    try {
        await beginAuthorizedTest();
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fa-solid fa-unlock-keyhole"></i> Verify &amp; Start Test';
    }
}

async function beginAuthorizedTest() {
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

    closeAccessCodeModal();
    document.getElementById("formSection").style.display = "none";
    document.getElementById("quizSection").style.display = "block";

    startTimer();
    loadQ();
}

// Allow Enter to verify the code and close the popup by clicking the backdrop.
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" &&
        document.getElementById("accessCodeModal").style.display === "flex") {
        event.preventDefault();
        verifyAccessCode();
    }
});

document.addEventListener("click", function (event) {
    const modal = document.getElementById("accessCodeModal");
    if (modal && event.target === modal) closeAccessCodeModal();
});

function loadQ() {
    if (!q[i]) return;

    document.getElementById("questionBox").innerText =
        (i + 1) + ". " + q[i].question;

    ["A", "B", "C", "D"].forEach(function (key) {
        const option = document.getElementById(key);
        option.innerText = key + ". " + (q[i][key] ?? "");
        option.classList.toggle("selected", answers[i] === key);
        option.style.display = "";
        option.disabled = !isExamActive();
    });

    updateQuestionNavigation();
}

function updateQuestionNavigation() {
    const total = q.length;
    const current = i + 1;
    const answered = Object.keys(answers).filter(function (key) {
        return answers[key] !== undefined && answers[key] !== null && answers[key] !== "";
    }).length;

    const progress = document.getElementById("questionProgress");
    const progressBar = document.getElementById("progressBar");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const answerStatus = document.getElementById("answerStatus");
    const answeredCount = document.getElementById("answeredCount");

    if (progress) progress.textContent = "Question " + current + " of " + total;
    if (progressBar) progressBar.style.width = (total ? (current / total) * 100 : 0) + "%";
    if (prevBtn) prevBtn.disabled = i <= 0 || !isExamActive();
    if (nextBtn) {
        nextBtn.style.display = i >= total - 1 ? "none" : "inline-flex";
        nextBtn.disabled = !isExamActive();
    }
    if (submitBtn) {
        submitBtn.style.display = i >= total - 1 ? "inline-flex" : "none";
        submitBtn.disabled = !isExamActive();
    }
    if (answerStatus) {
        answerStatus.innerHTML = answers[i]
            ? '<i class="fa-solid fa-circle-check"></i> Answer selected: ' + answers[i]
            : '<i class="fa-regular fa-circle"></i> No answer selected';
    }
    if (answeredCount) answeredCount.textContent = answered + " of " + total + " answered";
}

function check(ans) {
    if (!isExamActive() || !q[i]) return;

    // Save the answer for this question. Students can revisit it and change it later.
    answers[i] = String(ans).trim().toUpperCase();

    ["A", "B", "C", "D"].forEach(function (key) {
        document.getElementById(key).classList.toggle("selected", key === answers[i]);
    });

    updateQuestionNavigation();
}

function previousQuestion() {
    if (!isExamActive() || i <= 0) return;
    i--;
    loadQ();
}

function nextQuestion() {
    if (!isExamActive() || i >= q.length - 1) return;
    i++;
    loadQ();
}

// Convert common answer formats into the option letter A/B/C/D.
// Supports values such as "B", "(B) CPU", "B. CPU", "Correct Answer: (B) CPU",
// or the option text itself (for example, "CPU").
function normalizeAnswer(value, question) {
    if (value === null || value === undefined) return "";

    const raw = String(value).trim();
    if (!raw) return "";

    const letterMatch = raw.match(/(?:^|[^A-Z])([ABCD])\s*(?:[.)\]:-]|\s|$)/i);
    if (letterMatch) return letterMatch[1].toUpperCase();

    const clean = text => String(text ?? "")
        .replace(/^\s*[ABCD]\s*[.)\]:-]\s*/i, "")
        .replace(/^\s*correct\s*answer\s*:\s*/i, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const target = clean(raw);
    if (question) {
        const optionKeys = ["A", "B", "C", "D"];
        for (const key of optionKeys) {
            if (target && target === clean(question[key])) return key;
        }
    }

    return target;
}

function calculateScore() {
    let totalCorrect = 0;

    q.forEach((question, index) => {
        const selected = normalizeAnswer(answers[index], question);
        const correct = normalizeAnswer(question.ans, question);
        if (selected && correct && selected === correct) {
            totalCorrect++;
        }
    });

    score = totalCorrect;
    return totalCorrect;
}

function check(ans) {
    if (!isExamActive() || !q[i]) return;

    // Store the chosen option; the final score is calculated from all recorded answers.
    answers[i] = String(ans).trim().toUpperCase();

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

    // Recalculate at submission so manual, timer and violation submissions use the same scoring logic.
    calculateScore();

    let data = {
        name: name,
        whatsapp: whatsapp,
        date: date,
        score: score,
        totalQuestions: q.length,
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

        // Stop further answering/navigation after submission.
        ["A", "B", "C", "D"].forEach(function (id) {
            const option = document.getElementById(id);
            if (option) option.style.display = "none";
        });
        ["prevBtn", "nextBtn", "submitBtn"].forEach(function (id) {
            const button = document.getElementById(id);
            if (button) button.style.display = "none";
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
