function loadSets() {
  let filterString = getFilterString();
  let sortString = getSortString();
  console.log("/sets?"+filterString+sortString)
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/sets?"+filterString+sortString);
  xhr.onload = () => {
    handleSetsLoaded(xhr)
  }
  xhr.send()
}

function getFilterString() {
  const filterInput = document.getElementById("searchTitle").value;
  if (filterInput != "") {
    return "search=" + filterInput + "&";
  }
  return "";
}

function getSortString(){
  const sortInput = document.getElementById("filterSort").value;
  return "sort=" + sortInput + "&"
}

function handleSetsLoaded(xhr) {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log(data)
    displaySets(data);
  } else {
    console.error('Fehler beim Laden der Rezepte:', xhr.status);
    console.log(xhr.responseText)
  }
}


function displaySets(data) {
  const container = document.getElementById('setsList');
  const noResults = document.getElementById('noData');
  container.replaceChildren();

  if (data.length === 0) {
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';

  data.forEach(element => {
    container.appendChild(renderSet(element))
  });
}

function renderSet(sets) {
  const card = document.createElement('div');
  card.classList.add('col-md-4', 'col-sm-6', 'mb-4'); 

  const cardInner = document.createElement('div');
  cardInner.classList.add('card', 'h-100', 'shadow-sm', 'border-0', 'position-relative'); 

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body', 'd-flex', 'flex-column', 'justify-content-between');

  const cardTitle = document.createElement('h5');
  cardTitle.classList.add('card-title', 'fw-bold', 'text-dark', 'mb-3', 'pe-4');
  cardTitle.textContent = sets.title;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('btn', 'btn-link', 'text-muted', 'position-absolute', 'top-0', 'end-0', 'm-2', 'p-1', 'delete-set-btn');
  deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
  deleteBtn.title = "Set löschen";

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    
    if (confirm(`Möchtest du das Set "${sets.title}" wirklich löschen?`)) {
      deleteSetFromServer(sets.id, card);
    }
  });

  const cardFooterDiv = document.createElement('div');
  cardFooterDiv.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mt-auto');
  
  const cardText = document.createElement('span');
  cardText.classList.add('badge', 'px-2.5', 'py-1.5', 'fw-semibold', 'text-warning-emphasis', 'bg-warning-subtle', 'border', 'border-warning-subtle', 'rounded-2');
  cardText.textContent = `${sets.vocab.length} Vokabeln`;

  card.addEventListener("click", () => {
    localStorage.setItem("set", JSON.stringify(sets));
    window.location.href = "vocab.html";
  });

  cardFooterDiv.append(cardText);
  cardBody.append(cardTitle, cardFooterDiv);
  cardInner.append(cardBody, deleteBtn); 
  card.append(cardInner);

  return card;
}

function deleteSetFromServer(setId, cardElement) {
  const xhr = new XMLHttpRequest();
  xhr.open("DELETE", "/sets/" + setId);

  xhr.onload = () => {
    if (xhr.status === 200 || xhr.status === 204) {
      cardElement.remove();

      const container = document.getElementById('setsList');
      if (container.children.length === 0) {
        document.getElementById('noData').style.display = 'block';
      }
    } else {
      alert("Fehler beim Löschen des Sets: " + xhr.status);
    }
  };

  xhr.onerror = () => {
    console.error("Netzwerkfehler beim Löschen.");
  };

  xhr.send();
}


function resetFilter() {
  const catInput = document.getElementById("searchTitle");
  catInput.value="";
  loadSets()

}

document.getElementById('searchTitle').addEventListener('keydown', e => {
  if (e.key === 'Enter') loadSets();
});

document.getElementById('filterSort').addEventListener('change', e => {
  loadSets();
});

