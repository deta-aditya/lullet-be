import express from "express";
import cors from 'cors';
import { readFile, writeFile } from "fs"

const app = express()

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentFormattedDate() {
  const now = new Date();
  const day = now.getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[now.getMonth()];
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];

  return `${day} ${monthName} [${dayName}]`;
}

app.use(express.json())
app.use(cors())

app.get('/daily-logs', (req, res) => {
  readFile('./data.json', (err, data) => {
    if (err) {
      res.status(500).json({ message: 'Error when getting data' })
      return
    }

    const currentDate = getCurrentDate()

    const jsonData = JSON.parse(data.toString())
    if (!jsonData.map(dailyLog => dailyLog.date).includes(currentDate)) {
      const biggestBulletPointId = jsonData.flatMap(dailyLog => dailyLog.bulletPoints).sort((a, b) => b.id - a.id)[0].id + 1
      jsonData.push({
        date: currentDate,
        dateFormatted: getCurrentFormattedDate(),
        bulletPoints: [{ id: biggestBulletPointId, type: "task-todo", value: "" }]
      })
    }
    
    jsonData.sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json(jsonData)
  })
})

app.post('/daily-logs', (req, res) => {
  readFile('./data.json', (err, data) => {
    if (err) {
      res.status(500).json({ message: 'Error when getting data' })
      return
    }

    const jsonData = JSON.parse(data.toString())
    const indexOfRequestedData = jsonData.findIndex(dailyLog => dailyLog.date === req.body.date);
    if (indexOfRequestedData >= 0) {
      jsonData[indexOfRequestedData] = req.body
    } else {
      jsonData.push(req.body)
    }

    writeFile('./data.json', JSON.stringify(jsonData), (err) => {
      if (err) {
        res.status(500).json({ message: 'Error when saving data' })
        return
      }

      res.status(201).end()
    })
  })
})


app.listen('8000', () => {
  console.log('Server is running at port 8000')
})