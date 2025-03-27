var JSONData = null;

const FUSEOptions = {
    includeScore: true, // Include the matching score (lower is better)
    includeMatches: true, // Include details about matched characters/indices
    // --- Tuning Parameters ---
    threshold: 0.3,   // How fuzzy? 0 = perfect match, 1 = match anything. Adjust this!
                        // 0.3-0.4 is often a good starting point.
    ignoreLocation: true, // Search the entire string, not just around an expected location.
                        // Crucial for finding matches anywhere.
    distance: 100,    // Maximum distance (in characters) from the expected location.
                        // Large value needed with ignoreLocation: true
    ignoreDiacritic: true, // Ignore diacritics (accents) when searching.
                        // --- Specify where to search ---
                        // The keys within our document object to search and the weight we assign to each
    keys: [
        {
            name: 'brand',
            weight: 100
        },
        {
            name: 'type',
            weight: 100
        },
        {
            name: 'description',
            weight: 50
        }
    ]
};

var fuseHandle = null;

async function SearchSetup() {
    const response = await fetch('./jsondb/fileDictionary.json');
    JSONData = await response.json();

    // Sort the JSON array by the 'type' attribute
    JSONData.sort((a, b) => {
        const typeComp = a.type.localeCompare(b.type)
        if (typeComp == 0) return a.brand.localeCompare(b.brand);
        return typeComp;
    });

    fuseHandle = new Fuse(JSONData, FUSEOptions);
}

// Function to add a new card
function AddCard(cardContainer, imgData) {
    // Create the card element
    const card = document.createElement('div');
    card.classList.add('card');

    // Create the image element
    const cardImage = document.createElement('img');
    cardImage.classList.add('card-image');
    cardImage.src = "./thumbs/" + imgData.file;
    cardImage.alt = imgData.brand + " - " +imgData.type;

    // Add a click event to the image
    cardImage.addEventListener('click', () => {

        const imagePath = cardImage.src;
        const segments = imagePath.split('/');
        const newPath = "./imgs/" + segments[segments.length - 1];

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Bottle Details</title>
                        <style>
                            body {
                                margin: 0;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                background-color: #f4f4f4;
                            }
                            img {
                                max-width: 100%;
                                max-height: 100%;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>${imgData.brand} - ${imgData.type}</h1>
                        <img src="${newPath}" alt="${cardImage.alt}"/>
                    </body>
                </html>
            `);
            newWindow.document.close();
        } else {
            alert('Unable to open a new window. Please check your browser settings.');
        }

    });

    // Create the card content container
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');

    // Create the title element
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = imgData.brand;

    // Create the subtitle element
    const cardSubtitle = document.createElement('h3');
    cardSubtitle.classList.add('card-subtitle');
    cardSubtitle.textContent = imgData.type;

    // Create the text element
    const cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.textContent = imgData.description;

    // Append elements to the card content
    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardSubtitle);
    cardContent.appendChild(cardText);

    // Append the image and content to the card
    card.appendChild(cardImage);
    card.appendChild(cardContent);

    // Append the card to the card container
    cardContainer.appendChild(card);
}

function UpdateCards() {
    // Select the card container
    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = ''; // Clear existing cards

    const searchTerm = document.querySelector('#searchInput').value.toLowerCase();

    if (searchTerm == "") {
        for (var bottle in JSONData) {
            AddCard(cardContainer, JSONData[bottle]);
        }
    } else {
        // Fuse will run a fuzzy search on the JSON data, and the response is sorted by matching score.
        const searchResults = fuseHandle.search(searchTerm);
        for (var result in searchResults) {
            AddCard(cardContainer, searchResults[result].item);
        }
    }
}

function ShowSpinner() {
    document.getElementById("spinner").style.display = "block";
}

function HideSpinner() {
    document.getElementById("spinner").style.display = "none";
}

async function OnPageLoad() {
    ShowSpinner();
    await SearchSetup();
    UpdateCards();
    HideSpinner();
}
