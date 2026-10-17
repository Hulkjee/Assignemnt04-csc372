
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

// Default shows for the homepage
const defaultShows = [
    "Breaking Bad",
    "Friends",
    "Stranger Things",
    "Game of Thrones",
    "The Walking Dead",
    "The Office",
    "Wednesday",
    "The Boys",
    "Dark",
    "Lost"
];

// Track the latest search
let searchNumber = 0;

// Remove HTML tags from summaries
function cleanSummary(html) {

    if (!html) {
        return "Not available";
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    return doc.body.textContent.trim() || "Not available";
}

// Format the last updated date and time
function formatUpdated(timestamp) {

    if (timestamp == null) {
        return "Not available";
    }

    const date = new Date(timestamp * 1000);

    if (isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString();
}

// Fetch cast members using the show ID
function getCast(showId) {

    const castUrl = "https://api.tvmaze.com/shows/"
        + showId + "/cast";

    return fetch(castUrl)
        .then(function (response) {

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            return response.json();
        });
}

// Display TV show cards
function displayShows(data, currentSearch) {

    const shows = data.slice(0, 10);

    if (shows.length === 0) {
        message.textContent = "No TV shows found.";
        return;
    }

    message.textContent = "";

    shows.forEach(function (result) {

        const show = result.show;

        // Create the show card
        const card = document.createElement("article");
        card.classList.add("show-card");

        // Show poster
        if (show.image && show.image.medium) {

            const poster = document.createElement("img");
            poster.src = show.image.medium;
            poster.alt = "Poster for " + (show.name || "TV show");
            poster.loading = "lazy";

            poster.addEventListener("error", function () {
                poster.remove();
            });

            card.append(poster);
        }

        // Show title
        const title = document.createElement("h3");
        title.textContent = show.name || "Not available";
        card.append(title);

        // Show summary
        const summary = document.createElement("p");
        const summaryText = cleanSummary(show.summary);

        if (summaryText.length > 200) {
            summary.textContent = summaryText.slice(0, 200) + "...";
        } else {
            summary.textContent = summaryText;
        }

        card.append(summary);

        // Premiere date
        const premiere = document.createElement("p");
        premiere.textContent = "Premiered: "
            + (show.premiered || "Not available");
        card.append(premiere);

        // Last updated date and time
        const updated = document.createElement("p");
        updated.textContent = "Last Updated: "
            + formatUpdated(show.updated);
        card.append(updated);

        // Genres
        const genres = document.createElement("p");

        if (show.genres && show.genres.length > 0) {
            genres.textContent = "Genres: " + show.genres.join(", ");
        } else {
            genres.textContent = "Genres: Not available";
        }

        card.append(genres);

        // Average rating
        const rating = document.createElement("p");

        if (show.rating && show.rating.average != null) {
            rating.textContent = "Rating: "
                + show.rating.average + "/10";
        } else {
            rating.textContent = "Rating: Not available";
        }

        card.append(rating);

        // Main cast information
        const castInfo = document.createElement("p");
        castInfo.textContent = "Main Cast: Loading...";
        card.append(castInfo);

        // Link to the show on TVmaze
        if (show.url) {

            const showLink = document.createElement("a");
            showLink.href = show.url;
            showLink.textContent = "View on TVmaze";
            showLink.target = "_blank";
            showLink.rel = "noopener noreferrer";

            card.append(showLink);
        }

        // Add card to gallery
        showGallery.append(card);

        // Fetch cast for this show
        getCast(show.id)
            .then(function (castData) {

                if (currentSearch !== searchNumber) {
                    return;
                }

                if (!castData || castData.length === 0) {
                    castInfo.textContent = "Main Cast: Not available";
                    return;
                }

                const castNames = castData.slice(0, 5)
                    .map(function (cast) {

                        if (cast.person && cast.person.name) {
                            return cast.person.name;
                        }

                        return null;
                    })
                    .filter(function (name) {
                        return name !== null;
                    });

                if (castNames.length > 0) {
                    castInfo.textContent = "Main Cast: "
                        + castNames.join(", ");
                } else {
                    castInfo.textContent = "Main Cast: Not available";
                }

            })
            .catch(function (error) {

                if (currentSearch !== searchNumber) {
                    return;
                }

                if (error.message.includes("429")) {
                    castInfo.textContent =
                        "Main Cast: Temporarily unavailable (rate limit)";
                } else {
                    castInfo.textContent = "Main Cast: Unable to load";
                }

                console.error("Cast error:", error);
            });
    });
}

// Search for TV shows
function searchShows(searchText) {

    searchNumber++;
    const currentSearch = searchNumber;

    const apiUrl = "https://api.tvmaze.com/search/shows?q="
        + encodeURIComponent(searchText);

    showGallery.replaceChildren();
    message.textContent = "Loading TV shows...";

    fetch(apiUrl)
        .then(function (response) {

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            return response.json();
        })
        .then(function (data) {

            if (currentSearch !== searchNumber) {
                return;
            }

            displayShows(data, currentSearch);
        })
        .catch(function (error) {

            if (currentSearch !== searchNumber) {
                return;
            }

            showGallery.replaceChildren();

            if (error.message.includes("429")) {
                message.textContent =
                    "Too many requests. Please wait and try again.";
            } else {
                message.textContent =
                    "Unable to load TV shows. Please try again.";
            }

            console.error("Search error:", error);
        });
}

// Load different TV shows on the homepage
function loadDefaultShows() {

    searchNumber++;
    const currentSearch = searchNumber;

    searchInput.value = "";
    showGallery.replaceChildren();
    message.textContent = "Loading TV shows...";

    // Search each default show
    const requests = defaultShows.map(function (showName) {

        const apiUrl = "https://api.tvmaze.com/search/shows?q="
            + encodeURIComponent(showName);

        return fetch(apiUrl)
            .then(function (response) {

                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }

                return response.json();
            })
            .then(function (data) {

                // Look for an exact title match
                const exactMatch = data.find(function (result) {
                    return result.show.name.toLowerCase()
                        === showName.toLowerCase();
                });

                if (exactMatch) {
                    return exactMatch;
                }

                // Otherwise use the first result
                return data.length > 0 ? data[0] : null;
            })
            .catch(function (error) {

                console.error("Default show error:", error);
                return null;
            });
    });

    Promise.all(requests)
        .then(function (results) {

            if (currentSearch !== searchNumber) {
                return;
            }

            // Remove unavailable results
            const validShows = results.filter(function (result) {
                return result !== null;
            });

            // Remove duplicate shows
            const uniqueShows = validShows.filter(function (result, index) {

                return validShows.findIndex(function (item) {
                    return item.show.id === result.show.id;
                }) === index;
            });

            if (uniqueShows.length === 0) {
                message.textContent =
                    "Unable to load shows. Please try searching.";
                return;
            }

            displayShows(uniqueShows, currentSearch);
        });
}

// Handle search form submission
searchForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const searchText = searchInput.value.trim();

    if (searchText === "") {

        searchNumber++;
        showGallery.replaceChildren();
        message.textContent = "Please enter a TV show name.";
        return;
    }

    searchShows(searchText);
});

// Load different shows when the page opens
loadDefaultShows();
