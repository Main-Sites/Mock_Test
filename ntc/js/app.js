let q = [];
let i = 0;
let score = 0;
let answers = {};

let timeLeft = 1200;
let timerInterval;

function startTimer(){
    timerInterval = setInterval(function(){

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById("timer").innerText =
        "Time: " + minutes + ":" + seconds;

        timeLeft--;

        if(timeLeft < 0){
            clearInterval(timerInterval);
            document.getElementById("timer").innerText = "Time Over ⛔";
            alert("Time is up! Test will be submitted.");
            submitData();
        }

    }, 1000);
}

async function loadQuestionsFromSheet() {
    const res = await fetch("https://script.google.com/macros/s/AKfycbw-1558uu1xXl76sWb46G0HHRmJAIYcl3RiePloyNSlvU_rQiSasCYodN8RkmK5owr1Eg/exec");
    q = await res.json();
}

async function startTest(){
    let name = document.getElementById("name").value;
    let whatsapp = document.getElementById("whatsapp").value;

    if(name == "" || whatsapp == ""){
        alert("Please fill all details");
        return;
    }

    await loadQuestionsFromSheet();

    document.getElementById("formSection").style.display = "none";
    document.getElementById("quizSection").style.display = "block";

    startTimer();
    loadQ();
}

function loadQ(){
    document.getElementById("questionBox").innerText = (i+1)+". "+q[i].question;

    document.getElementById("A").innerText = "A. "+q[i].A;
    document.getElementById("B").innerText = "B. "+q[i].B;
    document.getElementById("C").innerText = "C. "+q[i].C;
    document.getElementById("D").innerText = "D. "+q[i].D;
}

function check(ans){

    answers[i] = ans;

    if(ans == q[i].ans){
        score++;
    }

    i++;

    if(i < q.length){
        loadQ();
    } else {
        document.getElementById("submitBtn").style.display = "inline-block";
        document.getElementById("questionBox").innerText = "Test Completed!";
        document.getElementById("A").style.display="none";
        document.getElementById("B").style.display="none";
        document.getElementById("C").style.display="none";
        document.getElementById("D").style.display="none";
    }
}

function submitData(){
clearInterval(timerInterval);

let name = document.getElementById("name").value;
let whatsapp = document.getElementById("whatsapp").value;
let date = document.getElementById("date").value;

let data = {
    name: name,
    whatsapp: whatsapp,
    date: date,
    score: score,
    answers: answers
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
    "<h2>Score: "+score+" / "+q.length+"</h2>";

    document.getElementById("Textafterlink").innerText =
    "To know more about your Complete Response details , Click on the Button Click Me!! , then click on Whatsapp Chartbox at the bottom right, enter your Name,e-mail,Mobile no & Send it.";

    document.getElementById("nextLink").style.display = "inline";
});
}