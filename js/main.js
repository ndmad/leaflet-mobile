// Initialiser la carte et la centrer sur une position (latitude, longitude)
const map = L.map('map', {
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    zoomControl: true,
    dragging: true
}).setView([14.6919, -17.4474], 13); // Paris, France

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

const addPointButton = document.getElementById('addPointButton');

addPointButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Localisation en temps réel
const locateButton = document.getElementById('locateButton');

locateButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
        return;
    }

    // Demander la localisation
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 16); // Centrer la carte sur la position

            // Ajouter un marqueur pour la position de l'utilisateur
            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]);
            } else {
                userMarker = L.marker([latitude, longitude]).addTo(map)
                    .bindPopup("Vous êtes ici !").openPopup();
            }
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("Vous avez refusé l'accès à la géolocalisation. Veuillez activer la géolocalisation dans les paramètres de votre navigateur.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("La position n'a pas pu être déterminée.");
                    break;
                case error.TIMEOUT:
                    alert("La demande de localisation a expiré.");
                    break;
                default:
                    alert("Une erreur inconnue s'est produite lors de la localisation.");
            }
        },
        {
            enableHighAccuracy: true, // Utiliser une précision élevée
            timeout: 10000, // Temps d'attente maximum (10 secondes)
            maximumAge: 0 // Ne pas utiliser de position en cache
        }
    );
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
baseLayers["OpenStreetMap"].addTo(map);

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

const locateControl = L.control.locate({
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
    },
    locateOptions: {
        enableHighAccuracy: true, // Utiliser une précision élevée
        timeout: 10000, // Temps d'attente maximum (10 secondes)
        maximumAge: 0 // Ne pas utiliser de position en cache
    }
}).addTo(map);

// Gérer les erreurs de géolocalisation
locateControl.on('locationerror', (e) => {
    alert("Impossible de trouver votre position. Veuillez vérifier les paramètres de géolocalisation de votre appareil.");
});

const geolocationMessage = document.getElementById('geolocationMessage');
const retryGeolocationButton = document.getElementById('retryGeolocation');

retryGeolocationButton.addEventListener('click', () => {
    geolocationMessage.style.display = 'none';
    locateControl.start(); // Réessayer la localisation
});

// Afficher le message en cas d'erreur
locateControl.on('locationerror', (e) => {
    geolocationMessage.style.display = 'block';
});

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


