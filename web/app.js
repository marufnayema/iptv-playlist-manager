// Sample channel data - In production, this would come from a backend API
const channelsData = [
    {
        id: 1,
        name: "BBC News",
        url: "http://stream.bbc.co.uk/news",
        category: "news",
        country: "UK",
        language: "English",
        emoji: "🇬🇧",
        quality: "HD"
    },
    {
        id: 2,
        name: "CNN International",
        url: "http://stream.cnn.com/international",
        category: "news",
        country: "USA",
        language: "English",
        emoji: "🇺🇸",
        quality: "HD"
    },
    {
        id: 3,
        name: "France 24 English",
        url: "http://stream.france24.com/en",
        category: "news",
        country: "France",
        language: "English",
        emoji: "🇫🇷",
        quality: "HD"
    },
    {
        id: 4,
        name: "DW English",
        url: "http://stream.dw.com/en",
        category: "news",
        country: "Germany",
        language: "English",
        emoji: "🇩🇪",
        quality: "HD"
    },
    {
        id: 5,
        name: "Al Jazeera English",
        url: "http://stream.aljazeera.com/en",
        category: "news",
        country: "Qatar",
        language: "English",
        emoji: "🇶🇦",
        quality: "HD"
    },
    {
        id: 6,
        name: "NDTV India",
        url: "http://stream.ndtv.com",
        category: "news",
        country: "India",
        language: "Hindi/English",
        emoji: "🇮🇳",
        quality: "HD"
    },
    {
        id: 7,
        name: "ESPN Sports",
        url: "http://stream.espn.com/main",
        category: "sports",
        country: "USA",
        language: "English",
        emoji: "⚽",
        quality: "HD"
    },
    {
        id: 8,
        name: "Sky Sports UK",
        url: "http://stream.skysports.com",
        category: "sports",
        country: "UK",
        language: "English",
        emoji: "🏆",
        quality: "4K"
    },
    {
        id: 9,
        name: "World Cup 2026",
        url: "http://stream.fifa.com/worldcup",
        category: "sports",
        country: "International",
        language: "Multiple",
        emoji: "🏆",
        quality: "4K"
    },
    {
        id: 10,
        name: "Premier League",
        url: "http://stream.premierleague.com",
        category: "sports",
        country: "UK",
        language: "English",
        emoji: "⚽",
        quality: "4K"
    },
    {
        id: 11,
        name: "Euronews",
        url: "http://stream.euronews.com",
        category: "news",
        country: "Europe",
        language: "Multiple",
        emoji: "📺",
        quality: "HD"
    },
    {
        id: 12,
        name: "Eurosport",
        url: "http://stream.eurosport.com",
        category: "sports",
        country: "Europe",
        language: "Multiple",
        emoji: "⚽",
        quality: "HD"
    }
];

let allChannels = [...channelsData];
let filteredChannels = [...channelsData];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderChannels();
    setupEventListeners();
});

function setupEventListeners() {
    // Navigation filter buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            applyFilters();
        });
    });

    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Quality filter
    document.getElementById('filterQuality').addEventListener('change', applyFilters);
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) {
        applyFilters();
        return;
    }
    
    filteredChannels = allChannels.filter(ch => 
        ch.name.toLowerCase().includes(query) ||
        ch.country.toLowerCase().includes(query)
    );
    
    renderChannels();
}

function applyFilters() {
    filteredChannels = allChannels.filter(ch => {
        // Category filter
        if (currentFilter !== 'all' && ch.category !== currentFilter) {
            return false;
        }
        
        // Quality filter
        const qualityFilter = document.getElementById('filterQuality').checked;
        if (qualityFilter && !ch.quality.includes('HD') && !ch.quality.includes('4K')) {
            return false;
        }
        
        return true;
    });
    
    renderChannels();
}

function renderChannels() {
    const container = document.getElementById('channelsList');
    
    if (filteredChannels.length === 0) {
        container.innerHTML = '<div class="empty-message">No channels found. Try adjusting your filters.</div>';
        return;
    }
    
    container.innerHTML = filteredChannels.map(channel => `
        <div class="channel-card" onclick="copyToClipboard('${channel.url}')">
            <div class="channel-logo">${channel.emoji}</div>
            <div class="channel-name">${channel.name}</div>
            <div class="channel-info">
                <strong>Country:</strong> ${channel.country}
            </div>
            <div class="channel-info">
                <strong>Language:</strong> ${channel.language}
            </div>
            <div class="channel-info">
                <strong>Quality:</strong> <span style="color: #667eea; font-weight: bold;">${channel.quality}</span>
            </div>
            <div class="channel-category">${channel.category.toUpperCase()}</div>
            <div class="channel-url">
                📡 ${channel.url.substring(0, 40)}...
            </div>
            <small style="color: #999;">Click to copy URL</small>
        </div>
    `).join('');
}

function updateStats() {
    const newsChannels = allChannels.filter(ch => ch.category === 'news').length;
    const sportsChannels = allChannels.filter(ch => 
        ch.category === 'sports' || ch.category === 'worldcup'
    ).length;
    const countries = new Set(allChannels.map(ch => ch.country)).size;
    
    document.getElementById('totalChannels').textContent = allChannels.length;
    document.getElementById('newsCount').textContent = newsChannels;
    document.getElementById('sportsCount').textContent = sportsChannels;
    document.getElementById('countriesCount').textContent = countries;
}

function copyToClipboard(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard!\n\n' + url);
    }).catch(() => {
        prompt('Copy this URL:', url);
    });
}