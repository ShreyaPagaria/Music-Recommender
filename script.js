const GENRES = ["Pop", "Rock", "Hip Hop", "Electronic", "Classical", "Jazz", "Country", "R&B", "Love", "Indie", "Blues", "Soul"];

const genreSelect = document.getElementById("genre");
const recommendBtn = document.getElementById("recommendBtn");
const errorDiv = document.getElementById("error");
const recommendationsDiv = document.getElementById("recommendations");

GENRES.forEach(genre => {
    let option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
});

async function fetchSpotifyRecommendations(genre) {
    const clientId = "cc21161c182a4f1cb4fa26de88cc96c0";
    const clientSecret = "cb29012fa2bc4e798ffa0bf438168e8b";
    
    try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(clientId + ":" + clientSecret)
            },
            body: "grant_type=client_credentials"
        });
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${genre}&type=track&limit=10`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch recommendations from Spotify");
        }
        
        return await response.json();
    } catch (err) {
        throw new Error("Error fetching Spotify recommendations: " + err.message);
    }
}

recommendBtn.addEventListener("click", async () => {
    const genre = genreSelect.value;
    
    if (!genre) {
        errorDiv.textContent = "Please select a genre";
        return;
    }
    
    errorDiv.textContent = "";
    recommendBtn.disabled = true;
    recommendBtn.textContent = "Loading...";
    
    try {
        const data = await fetchSpotifyRecommendations(genre);
        const tracks = data.tracks.items || [];
        
        recommendationsDiv.innerHTML = "<h2>Recommendations:</h2>";
        const ul = document.createElement("ul");
        tracks.forEach(track => {
            const title = track.name;
            const artist = track.artists.map(a => a.name).join(", ");
            const spotifyUrl = track.external_urls.spotify;
            
            const li = document.createElement("li");
            li.innerHTML = `🎧 <a href="${spotifyUrl}" target="_blank">${title} - ${artist}</a>`;
            ul.appendChild(li);
        });
        recommendationsDiv.appendChild(ul);
    } catch (err) {
        errorDiv.textContent = err.message;
    } finally {
        recommendBtn.disabled = false;
        recommendBtn.textContent = "Get Recommendations";
    }
});
