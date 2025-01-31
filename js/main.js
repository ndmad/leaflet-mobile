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

/* 
const marker = L.marker([48.8566, 2.3522]).addTo(map);
marker.bindPopup("<b>Paris</b><br>La ville lumière.").openPopup();
 */

const locateButton = L.control({ position: 'topright' });

/* locateButton.onAdd = function () {
    const div = L.DomUtil.create('div', 'locate-button');
    div.innerHTML = '📍';
    div.style.fontSize = '24px';
    div.style.cursor = 'pointer';
    div.onclick = () => {
        map.locate({ setView: true, maxZoom: 16 });
    };
    return div;
};

locateButton.addTo(map);

map.on('locationfound', (e) => {
    L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
        .bindPopup("Vous êtes ici !").openPopup();
});
 */

/* const markers = L.markerClusterGroup();

for (let i = 0; i < 100; i++) {
    const lat = 48.8566 + (Math.random() - 0.5) * 0.1;
    const lng = 2.3522 + (Math.random() - 0.5) * 0.1;
    markers.addLayer(L.marker([lat, lng]).bindPopup(`Marqueur ${i}`));
}

map.addLayer(markers);
 */

const modal = document.getElementById('formModal');
const closeModal = document.querySelector('.close');

// Ouvrir le modal lors d'un clic sur la carte
map.on('click', (e) => {
    modal.style.display = 'block';
    // Enregistrer les coordonnées du clic
    const coords = e.latlng;
    console.log('Coordonnées :', coords);
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

const photoInput = document.getElementById('photo');
let photoFile = null;

photoInput.addEventListener('change', (e) => {
    photoFile = e.target.files[0];
    console.log('Photo sélectionnée :', photoFile);
});



const form = document.getElementById('dataForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const degradationType = document.getElementById('degradationType').value;
    const description = document.getElementById('description').value;
    const coords = map.getCenter(); // Ou utiliser les coordonnées du clic

    const data = {
        type: degradationType,
        description: description,
        coords: coords,
        photo: photoFile ? URL.createObjectURL(photoFile) : null
    };

    console.log('Données enregistrées :', data);

    // Ajouter un marqueur sur la carte avec les données
    const marker = L.marker(coords).addTo(map);
    marker.bindPopup(`
        <b>Type :</b> ${data.type}<br>
        <b>Description :</b> ${data.description}<br>
        ${data.photo ? `<img src="${data.photo}" alt="Photo" style="width:100%;">` : ''}
    `).openPopup();

    // Fermer le modal
    modal.style.display = 'none';
    form.reset();
});


map.locate({ setView: true, maxZoom: 16 });

map.on('locationfound', (e) => {
    L.marker(e.latlng).addTo(map)
        .bindPopup("Vous êtes ici !").openPopup();
});

map.on('locationerror', (e) => {
    alert("Impossible de trouver votre position.");
});

let collectedData = {
    type: "FeatureCollection",
    features: []
};

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const degradationType = document.getElementById('degradationType').value;
    const description = document.getElementById('description').value;
    const coords = map.getCenter(); // Récupérer les coordonnées du clic

    // Créer une Feature GeoJSON
    const feature = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [coords.lng, coords.lat] // GeoJSON utilise [longitude, latitude]
        },
        properties: {
            type: degradationType,
            description: description,
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


const exportData = () => {
    const dataStr = JSON.stringify(collectedData, null, 2); // Formater le JSON
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'donnees_terrain.geojson'; // Nom du fichier
    a.click();
};

// Ajouter un bouton pour exporter
const exportButton = L.control({ position: 'bottomright' });

exportButton.onAdd = function () {
    const div = L.DomUtil.create('div', 'export-button');
    div.innerHTML = '📥 Exporter GeoJSON';
    div.style.cursor = 'pointer';
    div.onclick = exportData;
    return div;
};

exportButton.addTo(map);