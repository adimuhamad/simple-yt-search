const searchBox = document.getElementById("searchQuery");
const suggestionsList = document.getElementById("suggestions");
const filterButtons = document.querySelectorAll(".filter-btn");
const loadingSpinner = document.querySelector(".loading-spinner");
let currentFilter = "";
let selectedSuggestionIndex = -1;

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

for (let i = 0; i < 60; i++) { // lebih banyak partikel
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 8 + 8;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDuration = `${Math.random() * 5 + 5}s`; // lebih cepat
    document.body.appendChild(p);
}

// Mode siang/malam
function setTheme() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
        document.body.style.background = "var(--bg-day)";
        searchBox.style.background = "var(--input-day)";
        searchBox.style.color = "black";
    } else {
        document.body.style.background = "var(--bg-night)";
        searchBox.style.background = "var(--input-night)";
        searchBox.style.color = "white";
    }
}
setTheme();

// Auto focus & tidak hilang fokus
window.onload = () => searchBox.focus();
document.addEventListener("click", (e) => {
    if (e.target.id !== "searchQuery" && e.target.tagName !== "LI") {
        suggestionsList.innerHTML = "";
        selectedSuggestionIndex = -1;
    }
    searchBox.focus();
});

// Auto-suggest via JSONP
function fetchSuggestions(query) {
    if (!query) {
        suggestionsList.innerHTML = "";
        loadingSpinner.classList.remove("visible");
        return;
    }

    loadingSpinner.classList.add("visible");
    
    const script = document.createElement("script");
    const callbackName = "ytSuggestCallback";
    window[callbackName] = function(data) {
        suggestionsList.innerHTML = "";
        
        data[1].forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item[0];
            li.id = `suggestion-${index}`; // Beri ID unik
            li.style.transitionDelay = `${index * 0.05}s`;
            suggestionsList.appendChild(li);

            setTimeout(() => {
                li.style.transform = "translateY(0)";
                li.style.opacity = "1";
            }, 10);
        });

        document.body.removeChild(script);
        loadingSpinner.classList.remove("visible");
        selectedSuggestionIndex = -1;
    };
    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&callback=${callbackName}`;
    document.body.appendChild(script);
}

const debouncedFetch = debounce(fetchSuggestions, 500);
searchBox.addEventListener("input", (e) => {
    // Efek getar
    searchBox.style.animation = "shake 0.3s";
    setTimeout(() => searchBox.style.animation = "", 300);

    // Konfeti 👍 🎵 🔥 🎬
    ["👍", "🎵", "🎬", "🔥"].forEach(symbol => {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.textContent = symbol;
        const rect = searchBox.getBoundingClientRect();
        confetti.style.left = `${rect.left + Math.random() * rect.width}px`;
        confetti.style.top = `${rect.bottom + 5}px`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1000);
    });

    debouncedFetch(e.target.value);
});

// Klik saran
suggestionsList.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        searchBox.value = e.target.textContent;
        suggestionsList.innerHTML = "";
        selectedSuggestionIndex = -1;
        suggestionsList.removeAttribute("aria-activedescendant"); // Hapus atribut
    }
});

// Pilih filter
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.type;
    });
});

// Navigasi papan tombol & Enter untuk cari
searchBox.addEventListener("keydown", function (e) {
    const suggestions = suggestionsList.querySelectorAll("li");

    if (e.key === "ArrowDown") {
        if (suggestions.length > 0) {
            e.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
            updateSelection(suggestions);
        }
    } else if (e.key === "ArrowUp") {
        if (suggestions.length > 0) {
            e.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
            updateSelection(suggestions);
        }
    } else if (e.key === "Enter") {
        if (selectedSuggestionIndex !== -1) {
            searchBox.value = suggestions[selectedSuggestionIndex].textContent;
            suggestionsList.innerHTML = "";
            selectedSuggestionIndex = -1;
            e.preventDefault();
        }
        
        const query = searchBox.value.trim();
        if (query) {
            let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            if (currentFilter) {
                url += `&sp=${filterCodes[currentFilter] || ''}`; // Ambil kode langsung dari objek
            }
            window.location.replace(url);
        }
    }
});

function updateSelection(suggestions) {
    suggestions.forEach((item, index) => {
        item.classList.remove("selected");
        item.removeAttribute("aria-selected");
    });
    if (selectedSuggestionIndex !== -1) {
        suggestions[selectedSuggestionIndex].classList.add("selected");
        suggestions[selectedSuggestionIndex].setAttribute("aria-selected", "true");
        suggestions[selectedSuggestionIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
        
        // Atur atribut aria-activedescendant
        suggestionsList.setAttribute("aria-activedescendant", suggestions[selectedSuggestionIndex].id);
    } else {
        suggestionsList.removeAttribute("aria-activedescendant");
    }
}

// Filter codes (Youtube parameters)
const filterCodes = {
    "shorts": "EgZzaG9ydHM%3D",
    "video": "EgIQAQ%3D%3D",
    "channel": "EgIQAg%3D%3D",
    "playlist": "EgIQAw%3D%3D",
    "film": "EgIQBA%253D%253D",
    "unwatched": "EgJ4AQ%3D%3D",
    "watched": "EgJ5AQ%3D%3D",
    "live": "EgJAAQ%3D%3D",
    "relevan": "CAASAhAB",
    "new": "CAISAhAB",
    "popular": "CAMSAhAB",
    "rating": "CAESAhAB",
};