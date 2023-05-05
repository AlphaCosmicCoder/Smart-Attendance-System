const express = require('express');
const fs = require('fs')
const app = express();
const ejs = require('ejs');
const cors = require('cors');


function chooseCardId() {
    const cards = JSON.parse(fs.readFileSync('card.json'));

    // filter out cards where status is "assigned"
    const unassignedCards = cards.filter(card => card.status !== 'assigned');

    if (unassignedCards.length === 0) {
        return -1;
    }
    // choose a random card from the unassigned cards
    const randomIndex = Math.floor(Math.random() * unassignedCards.length);
    const randomCard = unassignedCards[randomIndex];

    // return the chosen card ID
    return randomCard.id;
}


function assignCard(cardId) {
    const cards = JSON.parse(fs.readFileSync('card.json'));

    // find the index of the card with the given ID
    const cardIndex = cards.findIndex(card => card.id === cardId);

    // if the card was found, update its status to "assigned"
    if (cardIndex !== -1) {
        cards[cardIndex].status = 'assigned';
        fs.writeFileSync('card.json', JSON.stringify(cards));
        console.log(`Card ${cardId} assigned.`);
    } else {
        console.log(`Card ${cardId} not found.`);
    }
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear().toString().padStart(4, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.use(cors());

app.get('/', (req, res) => {
    const name = 'John';
    res.render('index');
});

app.get('/dailyreport', (req, res) => {
    res.render('report', {
        title: "form"
    })
})

app.post('/dailyreport', (req, res) => {
    let currentDate = req.body.date
    const attendance = JSON.parse(fs.readFileSync('attendance.json'));
    const AttendanceRecord = attendance.filter(record => record.Date === currentDate);
    if (AttendanceRecord.length > 0) {
        // res.json(AttendanceRecord);
        res.render('report', {
            title: "Attendence Data",
            date: currentDate,
            attendence: AttendanceRecord[0].Record
        })
    } else {
        res.render('report', {
            title: "Attendence Data",
            date: currentDate,
            attendence: '404 not found'
        })
    }
})

app.get('/register', (req, res) => {
    res.render('studentRegister')
})

app.post('/register', (req, res) => {
    let student = req.body;
    let studentRecord = {
        "roll": student.roll,
        "fname": student.fname,
        "lname": student.lname,
        "department": student.department,
        "scode": student.scode,
        "card": chooseCardId()
    }

    if (studentRecord.card === -1) {
        res.status(404).send("nahi jagah hai")
    } else {
        assignCard(studentRecord.card)
        const cards = JSON.parse(fs.readFileSync('students.json'));
        cards.push(studentRecord);
        fs.writeFileSync('students.json', JSON.stringify(cards));
        res.send(`Card ${studentRecord.fname} ${studentRecord.lname} added.`)
    }
})



app.post('/', (req, res) => {
    console.log(req.body)
    console.log(req.body.rfid)
    let id = req.body.rfid;
    let card = {
        "id": id,
        "status": "notassigned"
    }
    const cards = JSON.parse(fs.readFileSync('card.json'));
    const recordedCards = cards.filter(card => card.id === id);
    if (recordedCards.length === 0) {
        cards.push(card);
        fs.writeFileSync('card.json', JSON.stringify(cards));
        res.send(`Card ${id} recorded.`)
    } else {
        res.send("Card Already Added")
    }

    /*  fs.writeFile('database.json', JSON.stringify(req.body), (err) => {
         if (err) {
             console.error(err);
             res.status(500).send('Error writing JSON data to file');
         } else {
             console.log('JSON data written to file');
             res.status(200).send('JSON data written to file');
         }
     }); */
})

app.post('/startattendance', (req, res) => {
    /* const attendancerecord = {
        "Date": getCurrentDate(),
        "Record": []
    }
    const records = JSON.parse(fs.readFileSync('attendance.json'));
    records.push(attendancerecord);
    fs.writeFileSync('attendance.json', JSON.stringify(records));
    res.send('attendance started') */
    const currentDate = getCurrentDate();
    const attendance = JSON.parse(fs.readFileSync('attendance.json'));
    const currentAttendanceRecord = attendance.find(record => record.Date === currentDate);
    if (currentAttendanceRecord) {
        res.send('Attendance for today has already been started');
    } else {
        const newAttendanceRecord = {
            "Date": currentDate,
            "Record": []
        }
        attendance.push(newAttendanceRecord);
        fs.writeFileSync('attendance.json', JSON.stringify(attendance));
        res.send('Attendance for today has been started');
    }
})

app.post('/addattendance', (req, res) => {
    const students = JSON.parse(fs.readFileSync('students.json'));
    const student = students.filter(student => student.card === req.body.rfid)
    if (Object.keys(student).length === 0) {
        res.send("denied");
    } else {
        console.log(student)
        const attendancerecord = {
            "roll": student[0].roll,
            "fname": student[0].fname,
            "lname": student[0].lname,
            "department": student[0].department,
            "scode": student[0].scode,
            "time": getCurrentTime()
        }

        const attendance = JSON.parse(fs.readFileSync('attendance.json'));
        const recordtoday = attendance.filter(attendance => attendance.Date === getCurrentDate())
        console.log(recordtoday)
        // recordtoday[0].Record.push(attendancerecord);
        // fs.writeFileSync('attendance.json', JSON.stringify(recordtoday));
        // res.send("attendence recorder");
        const studentRecordExists = recordtoday[0].Record.some(record => record.roll === student[0].roll);
        if (studentRecordExists) {
            res.send(`${student[0].fname} ${student[0].lname} has already been marked present for today`);
        } else {
            recordtoday[0].Record.push(attendancerecord);
            fs.writeFileSync('attendance.json', JSON.stringify(attendance));
            res.send("granted");
        }
    }
})

app.get('/addattendance', (req, res) => {
    const attendance = JSON.parse(fs.readFileSync('attendance.json'));
    const recordtoday = attendance.filter(attendance => attendance.Date === getCurrentDate());
    res.send(recordtoday);
})

app.listen(3000, () => {
    console.log(`http://192.168.221.134:3000`);
})