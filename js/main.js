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

    if (!description) {
        alert("Veuillez remplir la description.");
        return;
    }

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

// Localisation en temps réel
let userMarker = null;
const locateButton = document.getElementById('locateButton');

locateButton.addEventListener('click', () => {
    map.locate({ setView: true, watch: true, maxZoom: 16 });

    map.on('locationfound', (e) => {
        if (userMarker) {
            userMarker.setLatLng(e.latlng);
        } else {
            userMarker = L.marker(e.latlng).addTo(map)
                .bindPopup("Vous êtes ici !").openPopup();
        }
    });

    map.on('locationerror', (e) => {
        alert("Impossible de trouver votre position.");
    });
});


// Choix du fond de carte
const baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),
    "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google'
    }),
    "Carte Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap'
    })
};

// Ajouter le contrôle des couches
L.control.layers(baseLayers).addTo(map);
// Activer OpenStreetMap par défaut
baseLayers["OpenStreetMap"].addTo(map);

L.control.locate({
    position: 'topleft', // Position du bouton
    drawCircle: true, // Dessiner un cercle autour de la position
    follow: true, // Suivre la position de l'utilisateur
    setView: true, // Centrer la carte sur la position
    keepCurrentZoomLevel: true, // Conserver le niveau de zoom actuel
    markerClass: L.circleMarker, // Utiliser un cercle pour la position
    icon: 'fa fa-map-marker', // Icône Font Awesome
    metric: true, // Utiliser des unités métriques
    strings: {
        title: "Ma position", // Titre du bouton
        popup: "Vous êtes ici", // Message du popup
    }
}).addTo(map);


const geocoder = L.Control.Geocoder.nominatim(); // Utiliser Nominatim comme service de géocodage
L.Control.geocoder({
    position: 'topleft', // Position du contrôle/*  */
    geocoder: geocoder,
    defaultMarkGeocode: false, // Ne pas ajouter de marqueur par défaut
})
.on('markgeocode', (e) => {
    const { center } = e.geocode;
    map.setView(center, 13); // Centrer la carte sur le résultat de la recherche
})
.addTo(map);


// Enregistrement automatique
let autoSaveEnabled = false;
const autoSaveButton = document.getElementById('autoSaveButton');

autoSaveButton.addEventListener('click', () => {
    autoSaveEnabled = !autoSaveEnabled;
    autoSaveButton.textContent = autoSaveEnabled ? "Désactiver l'enregistrement" : "Enregistrement automatique";
    alert(autoSaveEnabled ? "Enregistrement automatique activé." : "Enregistrement automatique désactivé.");
});

// Thème sombre
const themeButton = document.getElementById('themeButton');

themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeButton.textContent = document.body.classList.contains('dark-mode') ? "Thème clair" : "Thème sombre";
});


document.querySelector('.leaflet-control-zoom-in').innerHTML = '<i class="fas fa-plus"></i>';
document.querySelector('.leaflet-control-zoom-out').innerHTML = '<i class="fas fa-minus"></i>';


const addPointButton = document.getElementById('addPointButton');

addPointButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

