import { loadPly, loadSpz, serializePly, serializeSpz } from 'spz-js';
import L from 'leaflet';

document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const fileInput = document.getElementById('fileInput');
    const urlUser = document.getElementById('urlUser');
    const urlScan = document.getElementById('urlScan');
    const downloadUrlBtn = document.getElementById('downloadUrlBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('progressBar');
    const inputFileSizeDiv = document.getElementById('inputFileSize');
    const outputFileSizeDiv = document.getElementById('outputFileSize');
    const conversionTimeDiv = document.getElementById('conversionTime');
    const fileInfoDiv = document.getElementById('fileInfo');
    const targetUrlDisplay = document.getElementById('targetUrlDisplay');
    const infoUrlBtn = document.getElementById('infoUrlBtn');
    const mapBtn = document.getElementById('mapBtn');
    const mapContainer = document.getElementById('mapContainer');
    let mapInstance = null; // To hold the Leaflet map instance

    // Funzione simulatoria di progresso
    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        if (percent >= 100) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 500);
        }
    }

    async function convertFile(file) {
        try {
            statusDiv.textContent = 'Elaborazione file...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            fileInfoDiv.style.display = 'none';
            
            // Show input file size
            const inputSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            inputFileSizeDiv.textContent = `Dimensione file di input: ${inputSizeMB} MB`;
            
            // Start timer for conversion
            const startTime = performance.now();
            
            // Simula aggiornamenti di progresso
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 5;
                if (progress <= 90) {
                    updateProgress(progress);
                }
            }, 100);
            
            const extension = file.name.split('.').pop().toLowerCase();

            let geometryData, outputData;
            
            if (extension === 'spz') {
                // Converti SPZ -> PLY
                const buffer = await file.arrayBuffer();
                geometryData = await loadSpz(buffer);
                outputData = serializePly(geometryData);
            } else if (extension === 'ply') {
                // Converti PLY -> SPZ
                const stream = file.stream();
                geometryData = await loadPly(stream);
                outputData = await serializeSpz(geometryData);
            } else {
                throw new Error('Formato non supportato');
            }

            // Calculate conversion time
            const endTime = performance.now();
            const conversionTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
            conversionTimeDiv.textContent = `Tempo di conversione: ${conversionTimeSeconds} secondi`;

            // Completa la barra di progresso
            clearInterval(progressInterval);
            updateProgress(100);
            
            // Crea il file di output
            const blob = new Blob([outputData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            // Show output file size
            const outputSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            outputFileSizeDiv.textContent = `Dimensione file di output: ${outputSizeMB} MB`;
            
            // Display file info
            fileInfoDiv.style.display = 'block';

            downloadLink.href = url;
            downloadLink.download = file.name.replace(/\.[^.]+$/, '') +
                                  (extension === 'spz' ? '_converted.ply' : '_converted.spz');
            downloadLink.style.display = 'block';
            statusDiv.textContent = 'Conversion completata!';
        } catch (error) {
            progressContainer.style.display = 'none';
            fileInfoDiv.style.display = 'none';
            statusDiv.textContent = `Errore: ${error.message}`;
            console.error(error);
        }
    }

    //Funzione per estrarre le informazioni da Scaniverse
    async function fetchScaniverseInfo(url, displayInfo = true) {
        try {
            statusDiv.textContent = 'Scaricamento informazioni...';
            progressContainer.style.display = 'block';
            //mapContainer.style.display = 'none'; // Hide map when fetching info
            progressBar.style.width = '0%';
            if (displayInfo) {
                 targetUrlDisplay.innerHTML = ''; // Clear previous info if displaying new
            }

            const proxyUrl = `https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=${encodeURIComponent(url)}`;

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`Impossibile scaricare la pagina web (${response.status})`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const script = doc.querySelector('script#__NEXT_DATA__[type="application/json"]');

            if (!script) {
                throw new Error('Script __NEXT_DATA__ non trovato');
            }

            const jsonData = JSON.parse(script.textContent);
            if (!jsonData.props || !jsonData.props.pageProps || !jsonData.props.pageProps.scan) {
                 throw new Error('Dati scan non trovati nel JSON');
            }
            const scanData = jsonData.props.pageProps.scan;
            const caption = scanData.caption || 'No Caption'; // Default value
            const metadata = scanData.metadata || {}; // Default empty object
            const media = scanData.media || {}; // Default empty object
            const user = scanData.user || {}; // Default empty object


            if (displayInfo) {
                const infoDiv = document.createElement('div');
                infoDiv.style.textAlign = 'left'; // Align text left for info display
                infoDiv.innerHTML = `
                    <p><b>Caption:</b> ${caption}</p>
                    ${user.username ? `<p><b>User:</b> ${user.username} (ID: ${user.userID})</p>` : ''}
                    <p><b>Points:</b> ${metadata.points ? metadata.points.toLocaleString() : 'N/A'}</p>
                    <p><b>Pitch:</b> ${metadata.pitch ? (metadata.pitch.min * 180 / Math.PI).toFixed(2) + "&deg;, " + (metadata.pitch.max * 180 / Math.PI).toFixed(2) + "&deg;, " + (metadata.pitch.start * 180 / Math.PI).toFixed(2) + "&deg;" : 'N/A'}</p>
                    <p><b>Yaw:</b> ${metadata.yaw ? (metadata.yaw.min * 180 / Math.PI).toFixed(2) + "&deg;, " + (metadata.yaw.max * 180 / Math.PI).toFixed(2) + "&deg;, " + (metadata.yaw.start * 180 / Math.PI).toFixed(2) + "&deg;" : 'N/A'}</p>
                    <p><b>Radius:</b> ${metadata.radius ? metadata.radius.min.toFixed(2) + ", " + metadata.radius.max.toFixed(2) + ", " + metadata.radius.start.toFixed(2) : 'N/A'}</p>
                    <p><b>Center:</b> ${metadata.center ? metadata.center.map(c => c.toFixed(2)).join(', ') : 'N/A'}</p>
                    ${metadata.location ? `<p><b>Location:</b> Lat ${metadata.location.latitude.toFixed(6)}, Lon ${metadata.location.longitude.toFixed(6)} (Accuracy: ${metadata.location.horizontalAccuracy ? metadata.location.horizontalAccuracy.toFixed(1) + 'm' : 'N/A'})</p>` : ''}
                    ${media.thumbnail ? `<img src="${media.thumbnail}" alt="Thumbnail Preview" style="max-width:200px; display: block; margin: 10px 0;">` : ''}
                `;

                targetUrlDisplay.appendChild(infoDiv);
                statusDiv.textContent = 'Informazioni caricate.';
            }

            progressContainer.style.display = 'none';

            return {
                caption: caption.replace(/ /g, '_'),
                jsonData: jsonData,
                userId: user.userID // Return userId as well
            };
        } catch (error) {
            progressContainer.style.display = 'none';
            statusDiv.textContent = `Errore durante il recupero delle informazioni: ${error.message}`;
            targetUrlDisplay.innerHTML = `<span style="color: red;">Errore: ${error.message}</span>`;
            console.error(error);
            return null;
        }
    }


      async function fetchScaniverseInfo2(url, displayInfo = true) {
        try {
            statusDiv.textContent = 'Scaricamento elenco...';
            progressContainer.style.display = 'block';
            //mapContainer.style.display = 'none'; // Hide map when fetching info
            progressBar.style.width = '0%';
            if (displayInfo) {
                 targetUrlDisplay.innerHTML = ''; // Clear previous info if displaying new
            }

            const proxyUrl = `https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=${encodeURIComponent(url)}`;

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`Impossibile scaricare la pagina web (${response.status})`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const script = doc.querySelector('script#__NEXT_DATA__[type="application/json"]');

            if (!script) {
                throw new Error('Script __NEXT_DATA__ non trovato');
            }

            const jsonData = JSON.parse(script.textContent);        
          const userId =  jsonData.props.pageProps.user.userID; 
          return {userId : userId};
        } catch (error) {
            progressContainer.style.display = 'none';
            statusDiv.textContent = `Errore durante il recupero delle informazioni: ${error.message}`;
            targetUrlDisplay.innerHTML = `<span style="color: red;">Errore: ${error.message}</span>`;
            console.error(error);
            return null;
        }
    }


  
    // Function to display scans on a map
// Function to display scans on a map
function displayScanMap(scans) {
    mapContainer.style.display = 'block';
    statusDiv.textContent = 'Visualizzazione mappa...';

    // Initialize map or clear existing layers
    if (!mapInstance) {
        mapInstance = L.map(mapContainer).setView([0, 0], 2); // Default view
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);
    } else {
        // Clear previous markers if map already exists
        mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapInstance.removeLayer(layer);
            }
        });
    }

    // Clear existing table content
    const tableScans = document.getElementById('tableScans');
    tableScans.innerHTML = '<tr><th>Titolo</th><th>Data</th><th>Views</th><th>Likes</th><th>Visibilità</th><th>Link</th></tr>';

    const markers = [];
    let validLocations = 0;
    console.log("Scans:", scans);

    scans.forEach(scan => {
        if (scan.location && scan.location.lat && scan.location.lng) {
            const lat = scan.location.lat;
            const lon = scan.location.lng;
            const caption = scan.caption || 'Scan senza titolo';
            const thumbnail = scan.media.thumbnail;
            const numLikes = scan.numLikes;
            const views = scan.views;
            const visibility = scan.visibility;
            const rawDate = scan.createdAt;
            const realDate = formatTimestamp(rawDate);
            const scanUrl = `https://scaniverse.com/scan/${scan.scanID}`;
            
            // Definisci icone personalizzate in base alla visibilità
            const publicIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">👤</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            const privateIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #FF5252; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">⛔</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            // Seleziona l'icona appropriata in base alla visibilità
            const markerIcon = visibility === "public" ? publicIcon : privateIcon;
            
            const popupContent = `
                <b>${caption}</b><br>
                <a href="${scanUrl}" target="_blank">Vedi su Scaniverse</a><br>
                ${thumbnail ? `<img src="${thumbnail}" alt="Thumbnail">` : ''}
                Date: ${realDate}<br>
                Views: ${views}<br>
                Likes: ${numLikes}<br>
                Visibility: ${visibility}
            `;
            
            const marker = L.marker([lat, lon], {icon: markerIcon}).bindPopup(popupContent);
            markers.push(marker);
            validLocations++;

            // Add row to table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${caption}</td>
                <td>${realDate}</td>
                <td>${views}</td>
                <td>${numLikes}</td>
                <td>${visibility}</td>
                <td><a href="${scanUrl}" target="_blank">Apri</a></td>
            `;
            tableScans.appendChild(row);
        }
    });

    if (markers.length > 0) {
        const group = L.featureGroup(markers).addTo(mapInstance);
        mapInstance.fitBounds(group.getBounds().pad(0.1)); // Zoom to fit markers with padding
        statusDiv.textContent = `Mappa visualizzata con ${validLocations} scans con dati di posizione.`;
    } else {
        statusDiv.textContent = 'Nessuna scan trovata con dati di posizione validi per la mappa.';
        mapInstance.setView([0, 0], 2); // Reset to default view if no markers
    }
    // Ensure map resizes correctly if container size changed while hidden
    setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
    }, 100);
}


  

    // Function to fetch user scans and display them on the map
    async function fetchAndDisplayUserScanMap(userId) {
        try {
            statusDiv.textContent = `Recupero scans per l'utente ${userId}...`;
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            targetUrlDisplay.innerHTML = ''; // Clear info display
            updateProgress(10);

            const userScansUrl = `https://scaniverse.com/api/scans/user/${userId}?limit=100`;
console.log("Link elenco:", userScansUrl)          
            const proxyUrl = `https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=${encodeURIComponent(userScansUrl)}`;

            updateProgress(30);

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`Impossibile scaricare i dati utente (${response.status})`);
            }
            
            updateProgress(70);
            const userScansRaw = await response.text();
            const userScansData = extractJsonFromResponse(userScansRaw) ;      
            updateProgress(100);
            progressContainer.style.display = 'none';

            if (userScansData && userScansData.scans && userScansData.scans.length > 0) {
                console.log("User Scans Data:", userScansData);
                displayScanMap(userScansData.scans);
            } else {
                statusDiv.textContent = `Nessuna scan pubblica trovata per l'utente ${userId} o errore nei dati.`;
                 mapContainer.style.display = 'none'; // Hide map if no scans
                console.log("No scans found or empty data:", userScansData);
            }
        } catch (error) {
            progressContainer.style.display = 'none';
            mapContainer.style.display = 'none'; // Hide map on error
            statusDiv.textContent = `Errore durante il recupero delle scans utente: ${error.message}`;
            console.error(error);
        }
    }


function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}
  
    async function downloadAndConvertFile(url, filenameOverride = null) {
        try {
            let finalFilename = null;
            if (url.includes('scaniverse.com/scan/')) {
                const scanId = url.split('/').pop().split('?')[0];
                url = `https://scaniverse.com/api/media/${scanId}/gaussians.spz`;
                console.log("Scarico " ,url , "...");
                //urlScan.value = url;
            }

            targetUrlDisplay.innerHTML = `File da scaricare: <a href="${url}" target="_blank">${url}</a>`;

            statusDiv.textContent = 'Scaricamento file...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            fileInfoDiv.style.display = 'none';
            downloadLink.style.display = 'none';

            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 2;
                if (progress <= 40) {
                    updateProgress(progress);
                }
            }, 100);

            const proxyUrl = `https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=${encodeURIComponent(url)}`;

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error('Impossibile scaricare il file');
            }

            const fileBlob = await response.blob();
            clearInterval(progressInterval);
            updateProgress(50);

            let fileName = url.split('/').pop() || 'gaussians.spz';
            if (filenameOverride) {
                fileName = filenameOverride + ".spz";
            }
            const file = new File([fileBlob], fileName, { type: fileBlob.type });
            console.log("File scaricato: " , file);
            await convertFile(file);
        } catch (error) {
            progressContainer.style.display = 'none';
            fileInfoDiv.style.display = 'none';
            statusDiv.textContent = `Errore: ${error.message}`;
            console.error(error);
        }
    }


function extractJsonFromResponse(responseText) {

  // Trova l'indice dove inizia l'oggetto JSON (la prima parentesi graffa)
  const jsonStartIndex = responseText.indexOf('{');
  
  if (jsonStartIndex === -1) {
    throw new Error("Nessun contenuto JSON trovato nella risposta");
  }
  
  // Estrai la stringa JSON dal testo della risposta
  const jsonString = responseText.substring(jsonStartIndex);
  
  // Converti la stringa in oggetto JSON
  try {
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    console.error("Errore durante il parsing del JSON:", error);
    throw new Error("Il contenuto non è un JSON valido");
  }
}


  

    // --- Event Listeners ---

    infoUrlBtn.addEventListener('click', async () => {
        const url = urlScan.value.trim();
console.log("Scan url:", url)      ;
       // mapContainer.style.display = 'none'; // Hide map when showing info
        if (url && url.includes('scaniverse.com/scan/')) {
            await fetchScaniverseInfo(url, true);
        } else if (url) {
             statusDiv.textContent = 'Inserisci un URL Scaniverse valido (es. https://scaniverse.com/scan/...)';
             targetUrlDisplay.innerHTML = '<span style="color: orange;">URL non valido per Info. Inserire link a una specifica scan.</span>';
        } else {
            statusDiv.textContent = 'Inserisci un URL';
            targetUrlDisplay.textContent = '';
        }
    });

    mapBtn.addEventListener('click', async () => {
        const url = urlUser.value.trim();
        targetUrlDisplay.innerHTML = ''; // Clear info display
        fileInfoDiv.style.display = 'none'; // Hide file conversion info
        downloadLink.style.display = 'none'; // Hide download link

        if (url ) {
             statusDiv.textContent = 'Recupero UserID dalla pagina Scaniverse...';
             // First, fetch info from the given URL to extract the userId
             const userData = await fetchScaniverseInfo2(url, false); // Don't display info, just get data

             if (userData.userId) {
console.log("UserID trovato:", userData.userId);
                 // Now fetch all scans for this user and display the map
                 await fetchAndDisplayUserScanMap(userData.userId);
             } else  {
                 // Error already handled by fetchScaniverseInfo
                 statusDiv.textContent = 'Impossibile recuperare UserID dall\'URL fornito.';
                 mapContainer.style.display = 'none';
             }
        } else if (url) {
             statusDiv.textContent = 'Inserisci un URL Scaniverse valido per la funzione Mappa (es. https://scaniverse.com/scan/...)';
             mapContainer.style.display = 'none';
        } else {
            statusDiv.textContent = 'Inserisci un URL';
            mapContainer.style.display = 'none';
        }
    });

    fileInput.addEventListener('change', (e) => {
        if(e.target.files[0]) {
            targetUrlDisplay.textContent = '';
             //mapContainer.style.display = 'none'; // Hide map on file input change
            convertFile(e.target.files[0]);
        }
    });

    urlUser.addEventListener('input', () => {
        const url = urlUser.value.trim();
        mapContainer.style.display = 'none'; // Hide map when URL changes
        if (url) {
            let displayUrl = url;
            let isScaniverseScan = false;
            if (url.includes('scaniverse.com/scan/')) {
                const scanIdMatch = url.match(/scaniverse\.com\/scan\/([a-zA-Z0-9]+)/);
                if (scanIdMatch && scanIdMatch[1]) {
                     const scanId = scanIdMatch[1];
                    displayUrl = `https://scaniverse.com/api/media/${scanId}/gaussians.spz`;
                    isScaniverseScan = true;
                }
            }
            targetUrlDisplay.innerHTML = `Target: <a href="${displayUrl}" target="_blank" title="${isScaniverseScan ? 'Direct SPZ link for download' : 'User provided URL'}">${displayUrl}</a>`;
        } else {
            targetUrlDisplay.textContent = '';
        }
    });

    downloadUrlBtn.addEventListener('click', async () => {
        const url = urlScan.value.trim();
        targetUrlDisplay.innerHTML = ''; // Clear info display for conversion
        //mapContainer.style.display = 'none'; // Hide map for conversion
        if (url) {
            if (url.includes('scaniverse.com/scan/')) {
                // Fetch info first to get the caption for filename
                const scanInfo = await fetchScaniverseInfo(url, false); // Don't display info
                if (scanInfo && scanInfo.caption) {
                    await downloadAndConvertFile(url, scanInfo.caption);
                } else {
                     // If fetching info failed, proceed without custom name
                     console.warn("Impossibile recuperare il caption, procedo allo scaricamento con nome file generico.");
                     await downloadAndConvertFile(url);
                }
            } else {
                // Download directly if it's not a scaniverse scan page URL
                await downloadAndConvertFile(url);
            }
        } else {
            statusDiv.textContent = 'Inserisci un URL valido';
            targetUrlDisplay.textContent = '';
        }
    });
});