function addVocabRow() {
  const container = document.getElementById('vocabInputsContainer');
  
  const newRow = document.createElement('div');
  newRow.classList.add('row', 'g-2', 'mb-3', 'vocab-row');
  
  newRow.innerHTML = `
    <div class="col">
      <input type="text" class="form-control word-input" placeholder="Wort / Begriff" required>
    </div>
    <div class="col">
      <input type="text" class="form-control translation-input" placeholder="Übersetzung" required>
    </div>
    <div class="col-auto">
      <button type="button" class="btn btn-outline-danger" onclick="removeRow(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
  
  container.appendChild(newRow);
}

function removeRow(button) {
  const row = button.closest('.vocab-row');
  const container = document.getElementById('vocabInputsContainer');
  
  if (container.querySelectorAll('.vocab-row').length > 1) {
    row.remove();
  } else {
    alert("Ein Set muss mindestens eine Vokabel enthalten!");
  }
}

function saveNewSet() {
  const title = document.getElementById('setTitle').value.trim();
  
  if (!title) {
    alert("Bitte gib einen Titel für das Set ein.");
    return;
  }

  const rows = document.querySelectorAll('.vocab-row');
  const vocabList = [];

  rows.forEach(row => {
    const word = row.querySelector('.word-input').value.trim();
    const translation = row.querySelector('.translation-input').value.trim();
    
    if (word && translation) {
      vocabList.push({
        word: word,
        def: translation
      });
    }
  });

  if (vocabList.length === 0) {
    alert("Bitte füge mindestens eine vollständige Vokabel hinzu.");
    return;
  }

  const newSetData = {
    title: title,
    vocab: vocabList
  };

  console.log("Sende an Server:", newSetData);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/sets");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = () => {
    if (xhr.status === 200 || xhr.status === 201) {
      alert("Set erfolgreich gespeichert!");
      window.location.href = "index.html"; 
    } else {
      alert("Fehler beim Speichern des Sets: " + xhr.status);
      console.error(xhr.responseText);
    }
  };

  xhr.onerror = () => {
    console.error("Netzwerkfehler beim Senden des Sets.");
  };

  xhr.send(JSON.stringify(newSetData));
}

function importCSV(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/);
    
    const container = document.getElementById('vocabInputsContainer');
    
    let firstRow = container.querySelector('.vocab-row');
    let isFirstRowEmpty = false;
    
    if (firstRow) {
      const firstWord = firstRow.querySelector('.word-input').value.trim();
      const firstTrans = firstRow.querySelector('.translation-input').value.trim();
      if (!firstWord && !firstTrans) {
        isFirstRowEmpty = true;
      }
    }

    let importedCount = 0;

    lines.forEach(line => {
      if (!line.trim()) return; 

      const parts = line.split(/[,;]/); 
      
      if (parts.length >= 2) {
        const word = parts[0].trim();
        const translation = parts[1].trim();

        if (word && translation) {
          if (isFirstRowEmpty) {
            firstRow.querySelector('.word-input').value = word;
            firstRow.querySelector('.translation-input').value = translation;
            isFirstRowEmpty = false;
          } else {
            const newRow = document.createElement('div');
            newRow.classList.add('row', 'g-2', 'mb-3', 'vocab-row');
            newRow.innerHTML = `
              <div class="col">
                <input type="text" class="form-control word-input" value="${word}" required>
              </div>
              <div class="col">
                <input type="text" class="form-control translation-input" value="${translation}" required>
              </div>
              <div class="col-auto">
                <button type="button" class="btn btn-outline-danger" onclick="removeRow(this)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            `;
            container.appendChild(newRow);
          }
          importedCount++;
        }
      }
    });

    if (importedCount > 0) {
      alert(`${importedCount} Vokabeln erfolgreich aus CSV geladen!`);
    } else {
      alert("Es konnten keine gültigen Vokabeln gefunden werden. Prüfe das Format (Wort,Übersetzung).");
    }
    
    input.value = "";
  };

  reader.onerror = function() {
    alert("Fehler beim Lesen der Datei.");
  };

  reader.readAsText(file);
}