require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Note = require('./models/person')
const errorHandler = require('./middleware/errorHandler')


app.use(express.json())

app.use(express.static('build'))

morgan.token('postData', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

const cors = require('cors')
app.use(cors())

app.use(errorHandler)

const mongoose = require('mongoose')

const url =
  `mongodb+srv://mariashpir2509:${encodeURIComponent("Masha19081908!!")}@cluster0.39uqrin.mongodb.net/Phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

app.get('/api/persons', (request, response) => {
  Note.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Note.countDocuments({})
    .then(count => {
      const currentTime = new Date().toLocaleString(undefined, { timeZone: 'UTC' })
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      response.send(`Phonebook has info for ${count} people <br/> ${currentTime} (${timeZone})`)
    })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Note.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'Malformatted id' })
    })
})

app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const body = request.body

  const note = {
    name: body.name,
    number: body.number,
  }

  Note.findByIdAndUpdate(id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'Malformatted id' })
    })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || body.name.length < 3) {
    return response.status(400).json({ 
      error: 'Name should be at least 3 characters long' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: 'Number is missing' 
    })
  }

  // Phone number format validation
  const phoneNumberRegex = /^\d{2,3}-\d+$/
  if (!phoneNumberRegex.test(body.number)) {
    return response.status(400).json({ 
      error: 'Invalid phone number format(xx(x)-yyyyyyyy)' 
    })
  }

  const note = new Note({
    name: body.name,
    number: body.number
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch((error) => {
      if (error.response) {
        const errorMessage = error.response.data.error
        return response.status(400).json({ error: errorMessage })
      }
      console.log(error)
      response.status(500).end()
    })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Note.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'Malformatted id' })
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
