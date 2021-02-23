const fs = require("fs")
const util = require("util")
const express = require('express');
const path = require('path');
// const db = require("./db/db.json");
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const getNotes = () => { return readFileAsync("./db/db.json", "utf-8") }
const postNotes = (data) => { return writeFileAsync("./db/db.json", JSON.stringify(data)) }

app.get('/api/notes', async (req, res) => {
    try {
        let allNotes = await getNotes();
        allNotes = JSON.parse(allNotes)
        return res.json(allNotes)
    } catch (error) {
        return res.json(error)
    }
    //     getNotes()
    //     .then(notes => {
    //         const allNotes = JSON.parse(notes)
    //         return res.json(allNotes)
    //     })
    //     .catch(error => res.json(error))

});

app.post('/api/notes', async (req, res) => {
    const { title, text } = req.body;

    const newNote = { title, text, id: uuidv4() }

    let allNotes = await getNotes();
    allNotes = allNotes ? JSON.parse(allNotes) : [];


    postNotes([...allNotes, newNote])
        .then(() => getNotes()
            .then(notes => {
                console.log(notes)
                const allNotes = JSON.parse(notes)
                return res.json(allNotes)
            }))
        .catch(error => res.json(error))
});

app.get('/api/notes/:idNumber', (req, res) => {
    const idNum = req.params.idNumber
    console.log(idNum)

    let allNotes = getNotes()
    allNotes = JSON.parse(allNotes)

    for (let i = 0; i < allNotes.length; i++) {
        if (idNum === allNotes[i].id) {
            return res.json(allNotes[i])
        }

    }
});

app.delete('/api/notes/:idNumber', async (req, res) => {
    const idNum = req.params.idNumber
    console.log(idNum)

    // const result = await deleteNote(idNum);
    let allNotes = await getNotes();

    console.log('all notes ---------------> ', allNotes);

    allNotes = JSON.parse(allNotes);

    const filteredNotes = allNotes.filter(note => note.id !== idNum);

    postNotes(filteredNotes).then(result => {
        return res.json(result);
    });
});

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, './public/notes.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));


app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));