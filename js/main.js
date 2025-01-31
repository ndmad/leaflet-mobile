// Initialiser la carte et la centrer sur une position (latitude, longitude)
const map = L.map('map', {
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    zoomControl: true,
    dragging: true
}).setView([48.8566, 2.3522], 13); // Paris, France

// Ajouter une couche de tuiles (par exemple, OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variables globales
const modal = document.getElementById('formModal');
const closeModal = document.querySelector('.close');
const photoInput = document.getElementById('photo');
let photoFile = null;
let collectedData = {
    type: "FeatureCollection",
    features: []
};

// Ouvrir le modal lors d'un clic sur la carte
map.on('click', (e) => {
    modal.style.display = 'block';
});

// Fermer le modal
closeModal.onclick = () => {
    modal.style.display = 'none';
};

// Fermer le modal si on clique en dehors
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Gérer la prise de photo
photoInput.addEventListener('change', (e) => {
    photoFile = e.target.files[0];
    console.log('Photo sélectionnée :', photoFile);
});

// Gérer la soumission du formulaire
const form = document.getElementById('dataForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const degradationType = document.getElementById('degradationType').value;
    const description = document.getElementById('description').value; // Récupérer la description
    const coords = map.getCenter(); // Récupérer les coordonnées du clic

    console.log("Description saisie :", description); // Afficher la description dans la console pour vérifier

    // Créer une Feature GeoJSON
    const feature = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [coords.lng, coords.lat] // GeoJSON utilise [longitude, latitude]
        },
        properties: {
            type: degradationType,
            description: description, // Ajouter la description
            photo: photoFile ? URL.createObjectURL(photoFile) : null
        }
    };

    // Ajouter la Feature à la collection
    collectedData.features.push(feature);

    // Ajouter un marqueur sur la carte
    const marker = L.marker(coords).addTo(map);
    marker.bindPopup(`
        <b>Type :</b> ${feature.properties.type}<br>
        <b>Description :</b> ${feature.properties.description}<br>
        ${feature.properties.photo ? `<img src="${feature.properties.photo}" alt="Photo" style="width:100%;">` : ''}
    `).openPopup();

    // Fermer le modal et réinitialiser le formulaire
    modal.style.display = 'none';
    form.reset();
    photoFile = null; // Réinitialiser la photo
});

// Exporter les données au format GeoJSON
const exportButton = document.getElementById('exportButton');

exportButton.addEventListener('click', () => {
    console.log("Données à exporter :", collectedData); // Afficher les données dans la console
    const dataStr = JSON.stringify(collectedData, null, 2); // Formater le JSON
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'donnees_terrain.geojson'; // Nom du fichier
    a.click();
});