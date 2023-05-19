const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())

app.use(express.static('build'))

morgan.token('postData', (req) => {
  // Используем JSON.stringify для сериализации данных запроса в строку
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

const cors = require('cors')
app.use(cors())

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]
  
app.get('/api/persons', (request, response) => {
    response.json(persons)
})
app.get('/info',(request, response) =>{
  const count = persons.map(person => person.id).length
  const currentTime = new Date().toLocaleString(undefined, { timeZone: 'UTC' })
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  response.send(`Phonebook has info for ${count} people <br/> ${currentTime} (${timeZone})`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  response.json(person)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

/*const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}*/

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name is missing' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  }
  const existingPerson = persons.find(person => person.name === body.name)
  if (existingPerson) {
    return response.status(400).json({ 
      error: 'Name must be unique' 
    })
  }
  const existingNumber = persons.find(person => person.number === body.number)
  if (existingNumber) {
    return response.status(400).json({ 
      error: 'Number must be unique' 
    })
  }
  const id = Math.floor(Math.random() * 1000000)
  const person = {
    id: id,
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
  