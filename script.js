document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = L.map('map').setView([39.5501, -105.7821], 7); // Centered on Colorado

    // Add a tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Modal functionality
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");
    const modalDate = document.getElementById("modal-date");
    const modalTime = document.getElementById("modal-time");
    const span = document.getElementsByClassName("close")[0];

    span.onclick = () => {
        modal.style.display = "none";
    }

    // Fetch itinerary data, add markers, and build itinerary
    fetch('itinerary.json')
        .then(response => response.json())
        .then(data => {
            const itineraryContainer = document.getElementById('itinerary');
            const notesContainer = document.querySelector('#important-notes ul');

            // Define main locations for travel routes
            const mainLocations = {
                "Boulder": { lat: 40.0150, lon: -105.2705 },
                "Estes Park": { lat: 40.3772, lon: -105.5217 },
                "Denver": { lat: 39.7392, lon: -104.9903 },
                "Garden of the Gods": { lat: 38.8784, lon: -104.8704 },
                "Green Mountain Falls": { lat: 38.9328, lon: -105.0211 },
                "Paint Mines Interpretive Park": { lat: 39.0211, lon: -104.2755 },
                "Denver International Airport (DIA)": { lat: 39.8561, lon: -104.6737 }
            };
            const routeColors = ['#ff7800', '#3388ff', '#44a044', '#e32e2e', '#9370db', '#ff00ff'];

            // Populate Important Notes
            data.important_notes.forEach(note => {
                const li = document.createElement('li');
                li.textContent = note;
                notesContainer.appendChild(li);
            });

            // Populate Itinerary and Map Markers
            data.itinerary.forEach((day, index) => {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day';

                const dayHeader = document.createElement('h2');
                dayHeader.innerHTML = `${day.day}: <span>${day.theme}</span>`;
                dayDiv.appendChild(dayHeader);

                if (day.travel) {
                    day.travel.forEach(trip => {
                        const travelInfo = document.createElement('p');
                        travelInfo.className = 'travel-info';
                        travelInfo.innerHTML = `<strong>Travel:</strong> From ${trip.from} to ${trip.to} (${trip.duration})`;
                        dayDiv.appendChild(travelInfo);

                        const fromCoords = mainLocations[trip.from];
                        const toCoords = mainLocations[trip.to];

                        if (fromCoords && toCoords) {
                            const latlngs = [
                                [fromCoords.lat, fromCoords.lon],
                                [toCoords.lat, toCoords.lon]
                            ];
                            L.polyline(latlngs, { color: routeColors[index % routeColors.length], weight: 4, opacity: 0.8 }).addTo(map);
                        }
                    });
                }

                day.events.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event';

                    const eventTitle = document.createElement('h3');
                    eventTitle.textContent = event.time;
                    eventDiv.appendChild(eventTitle);

                    const eventDesc = document.createElement('p');
                    eventDesc.textContent = event.description;
                    eventDiv.appendChild(eventDesc);

                    if (event.notes) {
                        const eventNotes = document.createElement('p');
                        eventNotes.className = 'notes';
                        eventNotes.innerHTML = `<em>Note:</em> ${event.notes}`;
                        eventDiv.appendChild(eventNotes);
                    }

                    if (event.image) {
                        const img = document.createElement('img');
                        img.src = event.image;
                        img.alt = event.description;
                        img.className = 'event-image';
                        img.onclick = () => {
                            modal.style.display = "block";
                            modalImg.src = img.src;
                            captionText.innerHTML = img.alt;
                            modalDate.textContent = `Date: ${day.day}`;
                            modalTime.textContent = `Time: ${event.time}`;
                        }
                        eventDiv.appendChild(img);
                    }

                    dayDiv.appendChild(eventDiv);

                    // Function to open modal for a marker
                    const openModalForMarker = (imageSrc, caption, date, time) => {
                        modal.style.display = "block";
                        modalImg.src = imageSrc;
                        captionText.innerHTML = caption;
                        modalDate.textContent = `Date: ${date}`;
                        modalTime.textContent = `Time: ${time}`;
                    };

                    // Add markers to the map
                    if (event.location) {
                        const { name, lat, lon } = event.location;
                        const marker = L.marker([lat, lon]).addTo(map);
                        if (event.image) {
                            marker.on('click', () => openModalForMarker(event.image, event.description, day.day, event.time));
                        } else {
                            marker.bindPopup(`<b>${name}</b><br>${event.description}`);
                        }
                    }

                    if (event.locations) {
                        event.locations.forEach(location => {
                            const { name, lat, lon, image } = location;
                            const marker = L.marker([lat, lon]).addTo(map);
                            if (image) {
                                marker.on('click', () => openModalForMarker(image, name, day.day, event.time));
                            } else {
                                marker.bindPopup(`<b>${name}</b>`);
                            }
                        });
                    }
                });
                itineraryContainer.appendChild(dayDiv);
            });
        });
});