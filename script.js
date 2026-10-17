
/*
Name: Abdullah Khan
Date: 10.15.2026
Course: CSC 372-01
Description: JavaScript for the TVmaze Show Gallery.
*/

// Select HTML elements
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const showGallery = document.querySelector("#show-gallery");
const message = document.querySelector("#message");

// Remove HTML tags from show summaries
function cleanSummary(html) {

    if (!html) {
        return "Not available";
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    return doc.body.textContent.trim() || "Not available";
}

// Display TV shows in the gallery
function displayShows(data) {

    const shows = data.slice(0, 10);

    if (shows.length === 0) {
        message.textContent = "No TV shows found.";
        return;
    }

    message.textContent = "";

    shows.forEach(function (result) {

        const show = result.show;

        // Create a show card
        const card = document.createElement("article");
        card.classList.add("show-card");

        // Show name
        const title = document.createElement("h3");
        title.textContent = show.name || "Not available";

        // Show summary
        const summary = document.createElement("p");
        summary.textContent = cleanSummary(show.summary);

        // Add content to the card
        card.append(title);
        card.append(summary);

        // Add card to gallery
        showGallery.append(card);
    });
}

// Search for TV shows
function searchShows(searchText) {

    const apiUrl = "https://api.tvmaze.com/search/shows?q="
        + encodeURIComponent(searchText);

    message.textContent = "Loading TV shows...";
    showGallery.replaceChildren();

    fetch(apiUrl)
        .then(function (response) {

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            return response.json();
        })
        .then(function (data) {

            displayShows(data);

        })
        .catch(function (error) {

            message.textContent = "Unable to load TV shows.";
            console.error("Error:", error);

        });
}

// Handle search form submission
searchForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const searchText = searchInput.value.trim();

    if (searchText === "") {
        showGallery.replaceChildren();
        message.textContent = "Please enter a TV show name.";
        return;
    }

    searchShows(searchText);
});

// Load default shows when the page opens
searchInput.value = "Breaking Bad";
searchShows("Breaking Bad");
