const mongoose = require('mongoose')

const url =
  `mongodb+srv://mariashpir2509:${encodeURIComponent("Masha19081908!!")}@cluster0.39uqrin.mongodb.net/Phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Note = mongoose.model('Note', noteSchema)

if (process.argv.length === 2) {
  Note.find({}).then((result) => {
    console.log('Phonebook:')
    result.forEach((note) => {
      console.log(note.name, note.number)
    })
    mongoose.connection.close()
  })
} 
else if (process.argv.length === 4) {
  const name = process.argv[2]
  const number = process.argv[3]

  const note = new Note({
    name,
    number,
  })

  note.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close();
  })
} 
else {
  console.log('Invalid arguments')
  mongoose.connection.close()
}
