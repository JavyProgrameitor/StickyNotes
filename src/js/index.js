import { DatabaseStickyNotes } from "./indexedDB.js";
const database = DatabaseStickyNotes.getInstance();

const noteColorInput = document.querySelector("#noteColor");
const addInput = document.querySelector("#addButton");
const mainElement = document.querySelector("main");

let counterID = 0;
let zIndexValue = 1;

openData().then(() => {
    uploadNotes();
    console.log("Data uploaded");
  });
  

addInput.addEventListener("click", (event) => {

    event.preventDefault();
    const color = noteColorInput.value;
    const text = ""
    const position = { x: 50, y: 50 };
    const data = { color, text, position };

    database.createData(data)
      .then((id) => { 
        createNote(id, position, text, color);
      })
      .catch((error) => {
        console.log(error);
      });
});

function createNote(id, position, text, color) {
  let newNote = document.createElement("div");
  newNote.classList = "note";
 // newNote.id = "note-" + counterID;
  newNote.id = `note-${id}`;
  newNote.style.left = position.x + "px";
  newNote.style.top = position.y + "px";
  newNote.style.zIndex = zIndexValue;

  let noteHeader = document.createElement("div");
  noteHeader.classList = "noteHeader";
  noteHeader.style.background = color;
  noteHeader.innerHTML = `<button class="delete" id="${id}">Close</button>`; 

  newNote.appendChild(noteHeader);

  let noteContent = document.createElement("div");
  noteContent.classList = "noteContent";
  noteContent.innerHTML = `<textarea name="noteText" id="noteText-${id}">${text}</textarea>`;

  newNote.appendChild(noteContent);

  const textarea = newNote.querySelector(`#noteText-${id}`);
  textarea.addEventListener("input", (event) => {
    const updatedText = event.target.value;
    updateNote(id, { text: updatedText });
  });

  mainElement.appendChild(newNote);
  counterID++;
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete")) {
    const noteId = parseInt(event.target.getAttribute("id"));
    deleteNote(noteId);
  }
});

let cursor = {
  x: null,
  y: null,
};

let note = {
  dom: null,
  x: null,
  y: null,
};

document.addEventListener("mousedown", (event) => {
  if (event.target.classList.contains("noteHeader")) {
    cursor = {
      x: event.clientX,
      y: event.clientY,
    };
    let current = event.target.closest(".note");
    note = {
      dom: current,
      x: current.getBoundingClientRect().left,
      y: current.getBoundingClientRect().top,
    };
    current.style.cursor = "grabbing";
    current.style.zIndex = zIndexValue;
    zIndexValue++;
  }
});

document.addEventListener("mousemove", (event) => {
  if (note.dom == null) {
    return;
  }
  let currentCursor = {
    x: event.clientX,
    y: event.clientY,
  };
  let distance = {
    x: currentCursor.x - cursor.x,
    y: currentCursor.y - cursor.y,
  };
  note.dom.style.left = note.x + distance.x + "px";
  note.dom.style.top = note.y + distance.y + "px";
});

document.addEventListener("mouseup", (event) => {
  if (note.dom) {
    const noteId = parseInt(note.dom.id.split("-")[1]);
    const newPosition = {
      x: parseInt(note.dom.style.left, 10),
      y: parseInt(note.dom.style.top, 10),
    };
    updateNote(noteId, { position: newPosition });
  }
  note.dom = null;
  event.target.parentNode.style.cursor = "grab";
});

async function openData() {
  await database.open().catch((error) => {
    console.error("Error open: " + error);
  });
}
async function uploadNotes() {
  try {
    const notes = await database.readAllData();
    notes.forEach((note) => {
      createNote(note.id, note.position, note.text, note.color);
    });
  } catch (error) {
    console.error("Error upload:", error);
  }
}
async function updateNote(id, data) {
  try {
    console.log(`Actualizando nota con ID: ${id}`, data); // Debug: 
    await database.updateData(id, data);
  } catch (error) {
    console.error("Error update:", error);
  }
}
async function deleteNote(id) {
  try {
    await database.deleteData(id);
    const noteElement = document.querySelector(`#note-${id}`);
    if (noteElement) {
      noteElement.remove();
    }
  } catch (error) {
    console.error("Error al eliminar la nota:", error);
  }
}
