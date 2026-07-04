# 🎯 Online Mock Test Portal

A lightweight **Online Mock Test System** built using **HTML, CSS, JavaScript, Google Apps Script, and Google Sheets**.

This project allows students to take online MCQ tests while automatically fetching questions from Google Sheets and storing student responses, scores, and answer selections back into Google Sheets.

---

# 📌 Features

- 📝 Candidate Registration
- 📖 Questions loaded dynamically from Google Sheets
- ⏱ 20 Minute Countdown Timer
- ✅ Automatic Score Calculation
- 📊 Stores Complete Student Responses
- ☁ Google Sheets as Database
- 📱 Responsive UI
- 🎨 Attractive Modern Design
- 🚀 No Backend Server Required

---

# 📂 Project Structure

```
project/
│
├── index.html      # Main webpage
├── style.css       # Complete styling
├── app.js          # Quiz Logic
│
├── img/
│   ├── logo.png
│   ├── Admopen.gif
│   └── joinnow.gif
│
└── README.md
```

---

# 🖥 Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Google Apps Script
- Google Sheets
- Fetch API

---

# ⚙ How It Works

The project works in **two directions**:

## 1. Reading Questions

When the student clicks **Start Test**, JavaScript sends a **GET Request** to Google Apps Script.

```
Student
      │
      ▼
JavaScript (Fetch API)
      │
      ▼
Google Apps Script
      │
      ▼
Google Sheet
      │
      ▼
JSON Questions
      │
      ▼
Quiz Starts
```

The Google Apps Script converts every row inside the Google Sheet into JSON and returns it to the browser.

Example JSON

```json
[
 {
   "question":"What is CPU?",
   "A":"Input Device",
   "B":"Processor",
   "C":"Monitor",
   "D":"Printer",
   "ans":"B"
 }
]
```

---

## 2. Saving Student Responses

After the test is completed (or time expires), JavaScript sends all candidate information back using a **POST Request**.

```
Student
      │
      ▼
JavaScript
      │
      ▼
Google Apps Script
      │
      ▼
Google Sheet
```

No traditional database is required.

Google Sheets acts as the database.

---

# 📝 Student Workflow

### Step 1

Student opens the website.

↓

### Step 2

Enters

- Name
- WhatsApp Number
- Date

↓

### Step 3

Clicks **Start Test**

↓

### Step 4

Questions are downloaded from Google Sheets.

↓

### Step 5

20-minute timer starts.

↓

### Step 6

Student answers every question.

↓

### Step 7

After completion (or timer expires)

↓

### Step 8

Data is automatically submitted.

↓

### Step 9

Score is displayed.

---

# ⏱ Timer

The application includes a built-in countdown timer.

Default Duration

```
20 Minutes
```

When the timer reaches **0**

- Quiz automatically stops
- Data automatically submits
- Student cannot continue

---

# 📊 Google Sheet Structure (Questions)

Example

| Question | A | B | C | D | Answer |
|-----------|---|---|---|---|--------|
| CPU stands for? | Processor | Printer | Mouse | Keyboard | A |

Every row represents one MCQ.

---

# 📈 Google Sheet Structure (Responses)

Each submission stores:

| Field | Description |
|--------|-------------|
| Name | Candidate Name |
| WhatsApp | Mobile Number |
| Date | Test Date |
| Score | Final Marks |
| Answers | Complete Answer Object |

---

# 💾 How Responses are Stored

The application sends the following object to Google Apps Script.

```javascript
{
   name: "Rahul",
   whatsapp: "9876543210",
   date: "2026-06-20",
   score: 18,
   answers: {
      0:"A",
      1:"D",
      2:"B",
      3:"C",
      4:"A"
   }
}
```

Explanation

| Property | Description |
|-----------|-------------|
| name | Student Name |
| whatsapp | Student Mobile Number |
| date | Test Date |
| score | Total Correct Answers |
| answers | Selected option for every question |

---

# 📥 Question Loading

Questions are **not hardcoded**.

Instead,

```
Google Sheet
      ↓
Apps Script
      ↓
JSON
      ↓
JavaScript
```

This allows administrators to add or remove questions without changing the website code.

---

# 📤 Data Submission

After submission, the application sends

```
Name

WhatsApp Number

Date

Score

Complete Answer Sheet
```

to Google Apps Script.

The Apps Script writes everything into Google Sheets automatically.

---

# 🧠 Quiz Logic

The JavaScript application performs the following tasks:

- Load questions
- Display one question at a time
- Store selected answers
- Calculate score
- Handle timer
- Submit responses
- Display final score

---

# 🎨 User Interface

The project includes

- Animated Logo
- Responsive Layout
- Gradient Background
- Interactive Buttons
- Hover Effects
- Animated Result Button
- Social Media Footer

---

# 🔄 Application Flow

```
Open Website
      │
      ▼
Enter Details
      │
      ▼
Load Questions
      │
      ▼
Start Timer
      │
      ▼
Display Questions
      │
      ▼
Store Answers
      │
      ▼
Calculate Score
      │
      ▼
Submit to Google Sheet
      │
      ▼
Display Result
```

---

# 🚀 Advantages

- No database installation
- Easy deployment on GitHub Pages
- Easy question management
- Fast loading
- Fully client-side
- Low maintenance
- Free hosting using Google Services

---

# 🔒 Notes

- Questions are fetched from Google Sheets using Google Apps Script.
- Student responses are stored in Google Sheets.
- The current implementation uses `mode: "no-cors"` during submission, so the browser cannot verify whether the request succeeded. For production use, consider returning proper JSON responses with CORS enabled from Apps Script.
- Client-side score calculation is convenient but can be modified by advanced users. For higher security, perform score calculation on the server (Apps Script) before storing results.

---

# 📌 Future Improvements

- Randomized Questions
- Negative Marking
- Login Authentication
- Admin Dashboard
- Leaderboard
- Question Categories
- Multiple Test Sets
- Certificate Generation
- Result Analytics
- Email Result
- PDF Report
- Review Incorrect Answers

---

# 👨‍💻 Author & ORGANISATIONS

**SARBAJIT SENAPATI**

**Nootech Computer Centre**

Developed as an online mock examination platform for students to practice MCQ-based tests with automatic evaluation and cloud-based response storage.

---

## ⭐ If you found this project useful, don't forget to Star this repository!
