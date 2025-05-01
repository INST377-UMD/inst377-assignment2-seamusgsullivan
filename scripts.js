document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const audioStatusEl = document.getElementById('audio-status');

    setActiveNav(currentPage);
    setupAudioControls();

    const homeCommands = document.getElementById('home-commands');
    const stocksCommands = document.getElementById('stocks-commands');
    const dogsCommands = document.getElementById('dogs-commands');

    if (currentPage === 'home.html' && homeCommands) {
    } else if (currentPage === 'stocks.html' && stocksCommands) {
        stocksCommands.style.display = 'block';
    } else if (currentPage === 'dogs.html' && dogsCommands) {
        dogsCommands.style.display = 'block';
    }

    if (currentPage === 'home.html') {
        loadQuote();
    } else if (currentPage === 'stocks.html') {
        setupStocksPage();
    } else if (currentPage === 'dogs.html') {
        setupDogsPage();
    }

    if (typeof annyang === 'undefined') {
        console.error("Annyang library not loaded!");
        if (audioStatusEl) audioStatusEl.textContent = 'Error: Audio library failed to load.';
        return;
    }

    const commands = {
        'Hello': () => {
            alert('Hello World');
        },
        'Change the color to *color': (color) => {
            console.log(`Changing color to: ${color}`);
            document.body.style.backgroundColor = color;
            if (audioStatusEl) audioStatusEl.textContent = `Changed background color to ${color}.`;
        },
        'Navigate to *page': (page) => {
            const pageName = page.toLowerCase().trim();
            console.log(`Attempting navigation to: ${pageName}`);
            if (audioStatusEl) audioStatusEl.textContent = `Navigating to ${pageName}...`;
            if (pageName === 'home' || pageName === 'homepage') {
                window.location.href = 'home.html';
            } else if (pageName === 'stocks' || pageName === 'stock') {
                window.location.href = 'stocks.html';
            } else if (pageName === 'dogs' || pageName === 'dog') {
                window.location.href = 'dogs.html';
            } else {
                 if (audioStatusEl) audioStatusEl.textContent = `Sorry, I don't know the page "${page}". Try 'Home', 'Stocks', or 'Dogs'.`;
                 console.warn(`Navigation failed: Unknown page "${page}"`);
            }
        }
    };

    if (currentPage === 'stocks.html') {
        commands['Look up *stock'] = (stock) => {
            console.log(`Voice command: Look up ${stock}`);
            const tickerInput = document.getElementById('stock-ticker');
            const timeRangeSelect = document.getElementById('time-range');
            const statusMsg = document.getElementById('audio-status');

            if (tickerInput && timeRangeSelect) {
                tickerInput.value = stock.toUpperCase();
                timeRangeSelect.value = '30';
                 if (statusMsg) statusMsg.textContent = `Looking up ${stock.toUpperCase()} for 30 days...`;
                fetchStockData();
            } else {
                console.error("Stock page elements not found for voice command.");
                if (statusMsg) statusMsg.textContent = `Error: Could not find stock lookup elements.`;
            }
        };
    } else if (currentPage === 'dogs.html') {
         commands['Load Dog Breed *breedName'] = (breedName) => {
            console.log(`Voice command: Load Dog Breed ${breedName}`);
            const statusMsg = document.getElementById('audio-status');
            const breedButtonsContainer = document.getElementById('breed-buttons-container');
            if (!breedButtonsContainer) {
                console.error("Breed buttons container not found.");
                 if (statusMsg) statusMsg.textContent = `Error: Cannot find breed buttons.`;
                return;
            }

            const buttons = breedButtonsContainer.querySelectorAll('button');
            let found = false;
            buttons.forEach(button => {
                if (button.textContent.trim().toLowerCase() === breedName.trim().toLowerCase()) {
                    console.log(`Found button for ${breedName}, simulating click.`);
                     if (statusMsg) statusMsg.textContent = `Loading info for ${breedName}...`;
                    button.click();
                    found = true;
                }
            });

            if (!found) {
                console.warn(`Dog breed "${breedName}" not found among buttons.`);
                if (statusMsg) statusMsg.textContent = `Sorry, I couldn't find the breed "${breedName}". Please check the spelling or try another breed.`;
            }
        };
    }

    annyang.addCommands(commands);

    annyang.addCallback('result', (phrases) => {
        console.log('Annyang recognized:', phrases);
         if (audioStatusEl) audioStatusEl.textContent = `Heard: "${phrases[0]}"`;
    });
     annyang.addCallback('error', (err) => {
        console.error('Annyang error:', err);
         if (audioStatusEl) audioStatusEl.textContent = `Audio Error: ${err.error || 'Unknown error'}`;
    });
      annyang.addCallback('errorNetwork', () => {
        if (audioStatusEl) audioStatusEl.textContent = 'Audio Error: Network issue.';
    });
    annyang.addCallback('errorPermissionBlocked', () => {
        if (audioStatusEl) audioStatusEl.textContent = 'Audio Error: Permission denied by browser.';
        alert("Microphone permission denied. Please allow microphone access in your browser settings.");
    });
    annyang.addCallback('errorPermissionDenied', () => {
        if (audioStatusEl) audioStatusEl.textContent = 'Audio Error: Permission denied by user.';
         alert("You denied microphone permission.");
    });

});


function setActiveNav(page) {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.style.fontWeight = 'normal';
        link.style.textDecoration = 'none';
        if (link.getAttribute('href') === page) {
            link.style.fontWeight = 'bold';
            link.style.textDecoration = 'underline';
        }
    });
}

function setupAudioControls() {
    const startBtn = document.getElementById('start-audio');
    const stopBtn = document.getElementById('stop-audio');
    const audioStatusEl = document.getElementById('audio-status');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
             if (typeof annyang !== 'undefined' && annyang) {
                console.log("Starting Annyang...");
                annyang.start({ autoRestart: true, continuous: false });
                 if (audioStatusEl) audioStatusEl.textContent = 'Audio listening activated.';
             } else {
                  console.error("Cannot start: Annyang not available.");
                   if (audioStatusEl) audioStatusEl.textContent = 'Error: Cannot start audio.';
             }
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
             if (typeof annyang !== 'undefined' && annyang) {
                console.log("Stopping Annyang...");
                annyang.abort();
                 if (audioStatusEl) audioStatusEl.textContent = 'Audio listening deactivated.';
             } else {
                  console.error("Cannot stop: Annyang not available.");
                  if (audioStatusEl) audioStatusEl.textContent = 'Error: Cannot stop audio.';
             }
        });
    }
}


function loadQuote() {
    const quoteTextEl = document.getElementById('quote-text');
    const quoteAuthorEl = document.getElementById('quote-author');
    const apiUrl = 'https://zenquotes.io/api/random';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
         .then(quoteData => {
             if (quoteData && quoteData.length > 0) {
                quoteTextEl.textContent = `"${quoteData[0].q}"`;
                quoteAuthorEl.textContent = `- ${quoteData[0].a}`;
            } else {
                 throw new Error('No quote data received');
            }
        })
        .catch(error => {
            console.error('Error fetching quote:', error);
            if (quoteTextEl) quoteTextEl.textContent = 'Could not load quote.';
             if (quoteAuthorEl) quoteAuthorEl.textContent = '';
        });
}


let stockChartInstance = null;

function setupStocksPage() {
    const getChartBtn = document.getElementById('get-chart-btn');
    if (getChartBtn) {
        getChartBtn.addEventListener('click', fetchStockData);
    }
    fetchTopRedditStocks();
}

function fetchStockData() {
    const ticker = document.getElementById('stock-ticker').value.toUpperCase();
    const days = document.getElementById('time-range').value;
    const chartErrorEl = document.getElementById('chart-error');
    chartErrorEl.textContent = '';

    if (!ticker) {
        chartErrorEl.textContent = 'Please enter a stock ticker.';
        return;
    }

    console.log(`Workspacing data for ${ticker} for the last ${days} days.`);

    const apiKey = 'RSzGx97R8TghXa4LZSxYCYD7oAkkPYnw';
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - parseInt(days));

    const formatDate = (date) => date.toISOString().split('T')[0];

    const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${formatDate(pastDate)}/${formatDate(today)}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                if(response.status === 404) throw new Error(`Stock ticker "${ticker}" not found.`);
                if(response.status === 429) throw new Error(`API rate limit exceeded. Please wait.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.results || data.results.length === 0) {
                throw new Error(`No data found for ticker "${ticker}" in the selected range.`);
            }
            console.log("Polygon data:", data);
            processStockData(data.results, ticker);
        })
        .catch(error => {
            console.error('Error fetching stock data:', error);
            chartErrorEl.textContent = `Error: ${error.message}`;
            if (stockChartInstance) {
                stockChartInstance.destroy();
                stockChartInstance = null;
            }
        });
}

function processStockData(results, ticker) {
    const labels = results.map(item => {
        const date = new Date(item.t);
        return date.toLocaleDateString();
    });
    const dataPoints = results.map(item => item.c);

    displayStockChart(labels, dataPoints, ticker);
}

function displayStockChart(labels, dataPoints, ticker) {
    const ctx = document.getElementById('stockChart')?.getContext('2d');
    if (!ctx) {
        console.error("Stock chart canvas element not found");
        return;
    }

    if (stockChartInstance) {
        stockChartInstance.destroy();
    }

    const selectedDays = document.getElementById('time-range').value;
    const actualTradingDays = labels.length;
    const chartTitle = `${ticker} Stock Price (Last ${selectedDays} days = Last ${actualTradingDays} Trading Days)`;

    stockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${ticker} Closing Price`,
                data: dataPoints,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: chartTitle
                }
            }
        }
    });
}

function fetchTopRedditStocks() {
    const apiUrl = 'https://tradestie.com/api/v1/apps/reddit?date=2022-04-03';
    const errorEl = document.getElementById('reddit-error');
    if(errorEl) errorEl.textContent = '';

    fetch(apiUrl)
         .then(response => {
            if (!response.ok) {
                 throw new Error(`HTTP error fetching Reddit data! status: ${response.status}`);
            }
            return response.json();
         })
         .then(stockData => {
            if (!stockData || !Array.isArray(stockData)) {
                throw new Error('Invalid data format received from Reddit API.');
            }
             console.log("Reddit stock data:", stockData);
             displayTopRedditStocks(stockData.slice(0, 5));
         })
        .catch(error => {
            console.error('Error fetching Reddit stocks:', error);
            if (errorEl) errorEl.textContent = `Error loading Reddit stocks: ${error.message}`;
        });
}

function displayTopRedditStocks(topStocks) {
    const tableBody = document.querySelector('#reddit-stocks-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (topStocks.length === 0) {
         tableBody.innerHTML = '<tr><td colspan="3">No stock data available.</td></tr>';
        return;
    }

    topStocks.forEach(stock => {
        const row = tableBody.insertRow();

        const tickerCell = row.insertCell();
        const tickerLink = document.createElement('a');
        tickerLink.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
        tickerLink.textContent = stock.ticker;
        tickerLink.target = '_blank';
        tickerCell.appendChild(tickerLink);

        const commentsCell = row.insertCell();
        commentsCell.textContent = stock.no_of_comments;

        const sentimentCell = row.insertCell();
        const sentimentSpan = document.createElement('span');
        sentimentSpan.textContent = '';

        if (stock.sentiment === 'Bullish') {
            sentimentSpan.classList.add('sentiment-bullish');
            sentimentSpan.textContent = '📈';
        } else if (stock.sentiment === 'Bearish') {
            sentimentSpan.classList.add('sentiment-bearish');
            sentimentSpan.textContent = '📉';
        } else {
             sentimentSpan.textContent = stock.sentiment;
        }
        sentimentCell.appendChild(sentimentSpan);
    });
}


let dogSliderInstance = null;

function setupDogsPage() {
    fetchRandomDogImages(10);
    fetchDogBreeds();
}

async function fetchRandomDogImages(count) {
    const apiUrl = `https://dog.ceo/api/breeds/image/random/${count}`;
    const errorEl = document.getElementById('carousel-error');
    if (errorEl) errorEl.textContent = '';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error fetching random images! status: ${response.status}`);
        const data = await response.json();

        if (data.status !== 'success' || !data.message || data.message.length === 0) {
             throw new Error('Invalid or empty response from random dog image API.');
        }
        console.log("Dog image URLs fetched:", data.message);
        setupCarousel(data.message);
    } catch (error) {
         console.error('Error fetching random dog images:', error);
         if (errorEl) errorEl.textContent = `Error loading dog images: ${error.message}`;
    }
}

function setupCarousel(imageUrls) {
    const carouselContainer = document.getElementById('dog-carousel');
    const errorEl = document.getElementById('carousel-error');
    if (!carouselContainer) return;

    carouselContainer.innerHTML = '';
    if(errorEl) errorEl.textContent = '';

    imageUrls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Random Dog';
        img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            img.alt = 'Image failed to load';
        };
        carouselContainer.appendChild(img);
    });

    setTimeout(() => {
        try {
            if (typeof simpleslider === 'undefined') {
                console.error("Simple Slider library (simpleslider) is not loaded or not ready.");
                if (errorEl) errorEl.textContent = 'Error: Image slider library object not found.';
                return;
            }
            simpleslider.getSlider();
            console.log("Simple Slider Initialized via getSlider() (after delay)");

        } catch (e) {
            console.error("Failed to initialize simple-slider via getSlider() (after delay):", e);
            if (errorEl) errorEl.textContent = 'Error initializing image carousel.';
        }
    }, 150);
}

function fetchDogBreeds() {
    const apiUrl = 'https://dogapi.dog/api/v2/breeds';
    const errorEl = document.getElementById('breed-error');
    const buttonsContainer = document.getElementById('breed-buttons-container');
    if(errorEl) errorEl.textContent = '';
    if (buttonsContainer) buttonsContainer.innerHTML = '<p>Loading breeds...</p>';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(apiData => {
             if (!apiData || !apiData.data || !Array.isArray(apiData.data)) {
                 throw new Error('Invalid breed data format received (expected .data array).');
             }
            console.log("Dog breeds data (first page):", apiData.data);
            displayBreedButtons(apiData.data);
        })
        .catch(error => {
            console.error('Error fetching dog breeds:', error);
            if(errorEl) errorEl.textContent = `Error loading dog breeds: ${error.message}`;
             if (buttonsContainer) buttonsContainer.innerHTML = '<p>Could not load breeds.</p>';
        });
}

function displayBreedButtons(breeds) {
    const buttonsContainer = document.getElementById('breed-buttons-container');
    if(!buttonsContainer) return;
    buttonsContainer.innerHTML = '';

    if (!Array.isArray(breeds) || breeds.length === 0) {
        buttonsContainer.innerHTML = '<p>No breeds found.</p>';
        return;
    }

    breeds.forEach(breedData => {
        const attributes = breedData.attributes;
        if (!attributes || !attributes.name || !breedData.id || !attributes.life) {
             console.warn("Skipping breed due to missing data:", breedData);
             return;
        }

        const button = document.createElement('button');
        button.textContent = attributes.name;
        button.classList.add('button-style-dogs');

        button.setAttribute('data-breed-id', breedData.id);
        button.setAttribute('data-description', attributes.description || '');
        button.setAttribute('data-life-min', attributes.life.min);
        button.setAttribute('data-life-max', attributes.life.max);
        button.setAttribute('data-breed-name', attributes.name);

        button.addEventListener('click', () => {
            displayBreedInfo(button.dataset);
        });

        buttonsContainer.appendChild(button);
    });
}

function displayBreedInfo(breedData) {
    const infoContainer = document.getElementById('breed-info-container');
    if (!infoContainer) {
        console.error("Breed info container not found in HTML!");
        return;
    }

    const nameEl = document.getElementById('breed-name');
    const descriptionEl = document.getElementById('breed-description');
    const minLifeEl = document.getElementById('breed-life-min');
    const maxLifeEl = document.getElementById('breed-life-max');

    if (nameEl) nameEl.textContent = breedData.breedName || 'N/A';
    if (descriptionEl) descriptionEl.textContent = breedData.description || 'No description available.';
    if (minLifeEl) minLifeEl.textContent = breedData.lifeMin || '?';
    if (maxLifeEl) maxLifeEl.textContent = breedData.lifeMax || '?';

    infoContainer.style.display = 'block';
    infoContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
