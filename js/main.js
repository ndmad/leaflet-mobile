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


const marker = L.marker([48.8566, 2.3522]).addTo(map);
marker.bindPopup("<b>Paris</b><br>La ville lumière.").openPopup();


const locateButton = L.control({ position: 'topright' });

locateButton.onAdd = function () {
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


const markers = L.markerClusterGroup();

for (let i = 0; i < 100; i++) {
    const lat = 48.8566 + (Math.random() - 0.5) * 0.1;
    const lng = 2.3522 + (Math.random() - 0.5) * 0.1;
    markers.addLayer(L.marker([lat, lng]).bindPopup(`Marqueur ${i}`));
}

map.addLayer(markers);

