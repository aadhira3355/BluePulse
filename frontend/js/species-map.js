// Species Map Module
class SpeciesMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.heatmapVisible = false;
        this.speciesData = [];
        this.filteredData = [];

        this.init();
    }

    init() {
        this.setupControls();
        this.initializeMap();
        this.loadSpeciesData();
        this.updateRecentDetections();
        this.createBiodiversityChart();
    }

    setupControls() {
        const speciesFilter = document.getElementById('species-filter');
        const confidenceFilter = document.getElementById('confidence-filter');
        const toggleHeatmap = document.getElementById('toggle-heatmap');
        const refreshMap = document.getElementById('refresh-map');

        speciesFilter.addEventListener('change', () => this.applyFilters());
        confidenceFilter.addEventListener('change', () => this.applyFilters());
        toggleHeatmap.addEventListener('click', () => this.toggleHeatmap());
        refreshMap.addEventListener('click', () => this.refreshData());
    }

    initializeMap() {
        // Create mock map visualization
        const mapContainer = document.getElementById('main-map');
        if (!mapContainer) return;

        mapContainer.style.cssText = `
            height: 500px;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 15px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        mapContainer.innerHTML = `
            <div style="text-align: center; color: #0277bd;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                <h3>Interactive Species Distribution Map</h3>
                <p>Kerala Marine Biodiversity Mapping</p>
                <div id="map-markers" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></div>
            </div>
        `;
    }

    async loadSpeciesData() {
        // Mock species data with realistic coordinates for Kerala coast
        this.speciesData = [
            {
                id: 1,
                name: "Indian Oil Sardine",
                scientific: "Sardinella longiceps",
                lat: 9.9312,
                lon: 76.2673,
                confidence: 96,
                status: "LC",
                type: "fish",
                abundance: 1240,
                lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                id: 2,
                name: "Malabar Grouper",
                scientific: "Epinephelus malabaricus",
                lat: 8.5241,
                lon: 76.9366,
                confidence: 87,
                status: "EN",
                type: "fish",
                abundance: 45,
                lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
            },
            {
                id: 3,
                name: "Green Sawfish",
                scientific: "Pristis zijsron",
                lat: 11.2588,
                lon: 75.7804,
                confidence: 78,
                status: "CR",
                type: "fish",
                abundance: 3,
                lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
            },
            {
                id: 4,
                name: "Indian Mackerel",
                scientific: "Rastrelliger kanagurta",
                lat: 10.0889,
                lon: 76.0997,
                confidence: 94,
                status: "LC",
                type: "fish",
                abundance: 856,
                lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            },
            {
                id: 5,
                name: "Mud Crab",
                scientific: "Scylla serrata",
                lat: 9.4981,
                lon: 76.3388,
                confidence: 92,
                status: "LC",
                type: "crustaceans",
                abundance: 324,
                lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
            }
        ];

        this.filteredData = [...this.speciesData];
        this.renderMarkers();
    }

    renderMarkers() {
        const markersContainer = document.getElementById('map-markers');
        if (!markersContainer) return;

        markersContainer.innerHTML = '';

        this.filteredData.forEach(species => {
            const marker = document.createElement('div');
            marker.className = 'species-marker';

            // Position marker based on mock coordinates (simplified positioning)
            const x = ((species.lon - 75) / 2) * 100; // Normalize longitude to percentage
            const y = ((11.5 - species.lat) / 3) * 100; // Normalize latitude to percentage

            marker.style.cssText = `
                position: absolute;
                left: ${Math.max(5, Math.min(95, x))}%;
                top: ${Math.max(5, Math.min(95, y))}%;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                cursor: pointer;
                transform: translate(-50%, -50%);
                z-index: 10;
                transition: all 0.3s ease;
                background: ${this.getConfidenceColor(species.confidence)};
            `;

            // Hover effect
            marker.addEventListener('mouseenter', () => {
                marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
                this.showSpeciesPopup(species, marker);
            });

            marker.addEventListener('mouseleave', () => {
                marker.style.transform = 'translate(-50%, -50%) scale(1)';
                this.hideSpeciesPopup();
            });

            markersContainer.appendChild(marker);
        });
    }

    getConfidenceColor(confidence) {
        if (confidence >= 90) return '#4caf50'; // High confidence - green
        if (confidence >= 70) return '#ff9800'; // Medium confidence - orange
        return '#f44336'; // Low confidence - red
    }

    showSpeciesPopup(species, marker) {
        const popup = document.createElement('div');
        popup.id = 'species-popup';
        popup.style.cssText = `
            position: absolute;
            background: white;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 20;
            min-width: 200px;
            pointer-events: none;
        `;

        popup.innerHTML = `
            <div style="font-weight: 600; color: #00695c; margin-bottom: 4px;">${species.name}</div>
            <div style="font-style: italic; color: #666; font-size: 0.9rem; margin-bottom: 8px;">${species.scientific}</div>
            <div style="font-size: 0.85rem;">
                <div>Confidence: <strong>${species.confidence}%</strong></div>
                <div>Status: <span class="status-badge ${species.status.toLowerCase()}">${species.status}</span></div>
                <div>Abundance: ${species.abundance}</div>
                <div>Last seen: ${utils.formatDate(species.lastSeen)}</div>
            </div>
        `;

        // Position popup relative to marker
        const rect = marker.getBoundingClientRect();
        const mapRect = document.getElementById('main-map').getBoundingClientRect();

        popup.style.left = (rect.left - mapRect.left + 20) + 'px';
        popup.style.top = (rect.top - mapRect.top - 60) + 'px';

        document.getElementById('main-map').appendChild(popup);
    }

    hideSpeciesPopup() {
        const popup = document.getElementById('species-popup');
        if (popup) {
            popup.remove();
        }
    }

    applyFilters() {
        const speciesFilter = document.getElementById('species-filter').value;
        const confidenceFilter = document.getElementById('confidence-filter').value;

        this.filteredData = this.speciesData.filter(species => {
            // Species type filter
            if (speciesFilter !== 'all' && species.type !== speciesFilter) {
                return false;
            }

            // Status filter
            if (speciesFilter === 'endangered' && !['EN', 'CR'].includes(species.status)) {
                return false;
            }

            // Confidence filter
            if (confidenceFilter === 'high' && species.confidence < 90) {
                return false;
            }
            if (confidenceFilter === 'medium' && (species.confidence < 70 || species.confidence >= 90)) {
                return false;
            }
            if (confidenceFilter === 'low' && species.confidence >= 70) {
                return false;
            }

            return true;
        });

        this.renderMarkers();
        this.updateRecentDetections();
    }

    toggleHeatmap() {
        this.heatmapVisible = !this.heatmapVisible;

        const button = document.getElementById('toggle-heatmap');
        if (this.heatmapVisible) {
            button.style.background = '#ff9800';
            // Add heatmap overlay logic here
            this.showHeatmapOverlay();
        } else {
            button.style.background = '';
            this.hideHeatmapOverlay();
        }
    }

    showHeatmapOverlay() {
        const mapContainer = document.getElementById('main-map');
        const heatmapOverlay = document.createElement('div');
        heatmapOverlay.id = 'heatmap-overlay';
        heatmapOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 40%, rgba(76, 175, 80, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 70% 60%, rgba(255, 152, 0, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 50% 80%, rgba(33, 150, 243, 0.3) 0%, transparent 50%);
            pointer-events: none;
            z-index: 5;
        `;

        mapContainer.appendChild(heatmapOverlay);
    }

    hideHeatmapOverlay() {
        const overlay = document.getElementById('heatmap-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    refreshData() {
        const button = document.getElementById('refresh-map');
        button.style.transform = 'rotate(360deg)';
        button.style.transition = 'transform 0.5s ease';

        setTimeout(() => {
            button.style.transform = '';
            this.loadSpeciesData();
        }, 500);
    }

    updateRecentDetections() {
        const container = document.getElementById('recent-detections');
        if (!container) return;

        const recentData = this.filteredData
            .sort((a, b) => b.lastSeen - a.lastSeen)
            .slice(0, 5);

        container.innerHTML = recentData.map(species => `
            <div class="detection-item" style="padding: 0.75rem; background: #f8f9fa; border-radius: 6px; margin-bottom: 0.5rem;">
                <div style="font-weight: 600; color: #00695c;">${species.name}</div>
                <div style="font-size: 0.85rem; color: #666;">
                    ${species.confidence}% confidence • ${utils.formatDate(species.lastSeen)}
                </div>
            </div>
        `).join('');
    }

    createBiodiversityChart() {
        const canvas = document.getElementById('biodiversity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Aggregate data by location
        const locationData = {
            'Kochi': this.speciesData.filter(s => s.lat > 9.5 && s.lat < 10.5).length,
            'Trivandrum': this.speciesData.filter(s => s.lat < 9.5).length,
            'Calicut': this.speciesData.filter(s => s.lat > 10.5).length
        };

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(locationData),
                datasets: [{
                    label: 'Species Count',
                    data: Object.values(locationData),
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(255, 152, 0, 0.8)'
                    ],
                    borderColor: [
                        '#4caf50',
                        '#2196f3',
                        '#ff9800'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Species Distribution by Region'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Species'
                        }
                    }
                }
            }
        });
    }
}