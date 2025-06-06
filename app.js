// Learning Map Application
class LearningMap {
    constructor() {
        this.data = {
            "territories": [
                {"name": "Foundations", "color": "#4285F4", "concepts": [
                    {"name": "Sets and Operations", "type": "landmark", "difficulty": "beginner", "status": "completed", "x": 300, "y": 200},
                    {"name": "Logic and Proofs", "type": "landmark", "difficulty": "beginner", "status": "current", "x": 350, "y": 250},
                    {"name": "Mathematical Induction", "type": "concept", "difficulty": "intermediate", "status": "locked", "x": 400, "y": 200}
                ]},
                {"name": "Graph Theory", "color": "#0F9D58", "concepts": [
                    {"name": "Graph Definitions", "type": "concept", "difficulty": "intermediate", "status": "available", "x": 500, "y": 150},
                    {"name": "Graph Traversal", "type": "concept", "difficulty": "intermediate", "status": "locked", "x": 550, "y": 200},
                    {"name": "Trees", "type": "concept", "difficulty": "advanced", "status": "locked", "x": 600, "y": 150}
                ]},
                {"name": "Combinatorics", "color": "#F4B400", "concepts": [
                    {"name": "Counting Principles", "type": "concept", "difficulty": "beginner", "status": "available", "x": 300, "y": 350},
                    {"name": "Permutations", "type": "concept", "difficulty": "intermediate", "status": "locked", "x": 350, "y": 400},
                    {"name": "Generating Functions", "type": "concept", "difficulty": "advanced", "status": "locked", "x": 400, "y": 450}
                ]},
                {"name": "Number Theory", "color": "#DB4437", "concepts": [
                    {"name": "Divisibility", "type": "concept", "difficulty": "intermediate", "status": "available", "x": 500, "y": 350},
                    {"name": "Modular Arithmetic", "type": "concept", "difficulty": "intermediate", "status": "locked", "x": 550, "y": 400},
                    {"name": "Cryptography", "type": "concept", "difficulty": "advanced", "status": "locked", "x": 600, "y": 450}
                ]}
            ],
            "pathways": [
                {"from": "Sets and Operations", "to": "Logic and Proofs", "type": "prerequisite"},
                {"from": "Logic and Proofs", "to": "Mathematical Induction", "type": "prerequisite"},
                {"from": "Mathematical Induction", "to": "Graph Definitions", "type": "prerequisite"},
                {"from": "Sets and Operations", "to": "Counting Principles", "type": "recommended"}
            ],
            "navigationModes": ["guided_tour", "free_exploration", "search_based"],
            "userProgress": {"completed": 1, "current": 1, "available": 3, "locked": 8, "totalConcepts": 13}
        };

        this.currentZoom = 1;
        this.currentPan = { x: 0, y: 0 };
        this.selectedConcept = null;
        this.breadcrumbTrail = ['Overview'];
        this.navigationMode = 'free_exploration';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTerritoryLegend();
        this.renderMap();
        this.updateProgress();
        this.updateBreadcrumb();
        this.setupMiniMap();
    }

    setupEventListeners() {
        // Navigation mode change
        document.getElementById('navigationMode').addEventListener('change', (e) => {
            this.navigationMode = e.target.value;
            this.handleNavigationModeChange();
        });

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });

        document.getElementById('resetView').addEventListener('click', () => {
            this.resetView();
        });

        // Concept panel close
        document.getElementById('closePanelBtn').addEventListener('click', () => {
            this.closeConceptPanel();
        });

        // Learning actions
        document.getElementById('startLearningBtn').addEventListener('click', () => {
            this.startLearning();
        });

        document.getElementById('viewPrereqBtn').addEventListener('click', () => {
            this.viewPrerequisites();
        });

        // Map dragging
        this.setupMapDragging();
    }

    setupMapDragging() {
        const mapContainer = document.getElementById('mapContainer');
        let isDragging = false;
        let startPos = { x: 0, y: 0 };

        mapContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startPos = { x: e.clientX - this.currentPan.x, y: e.clientY - this.currentPan.y };
            mapContainer.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.currentPan = {
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            };
            this.updateMapTransform();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            mapContainer.classList.remove('dragging');
        });

        // Mouse wheel zoom
        mapContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom(this.currentZoom + delta);
        });
    }

    renderTerritoryLegend() {
        const legendContainer = document.getElementById('territoryLegend');
        legendContainer.innerHTML = '';

        this.data.territories.forEach(territory => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${territory.color}"></div>
                <span class="legend-label">${territory.name}</span>
            `;
            legendItem.addEventListener('click', () => {
                this.focusOnTerritory(territory);
            });
            legendContainer.appendChild(legendItem);
        });
    }

    renderMap() {
        this.renderTerritories();
        this.renderPathways();
        this.renderConcepts();
    }

    renderTerritories() {
        const territoriesGroup = document.getElementById('territories');
        territoriesGroup.innerHTML = '';

        this.data.territories.forEach(territory => {
            const concepts = territory.concepts;
            const bounds = this.calculateTerritoryBounds(concepts);
            
            const territoryRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            territoryRect.setAttribute('class', 'territory-background');
            territoryRect.setAttribute('x', bounds.minX - 40);
            territoryRect.setAttribute('y', bounds.minY - 40);
            territoryRect.setAttribute('width', bounds.width + 80);
            territoryRect.setAttribute('height', bounds.height + 80);
            territoryRect.setAttribute('fill', territory.color);
            territoryRect.setAttribute('fill-opacity', '0.1');
            territoryRect.setAttribute('stroke', territory.color);
            territoryRect.setAttribute('stroke-opacity', '0.3');

            const territoryLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            territoryLabel.setAttribute('class', 'territory-label');
            territoryLabel.setAttribute('x', bounds.centerX);
            territoryLabel.setAttribute('y', bounds.minY - 10);
            territoryLabel.textContent = territory.name;
            territoryLabel.setAttribute('fill', territory.color);

            territoriesGroup.appendChild(territoryRect);
            territoriesGroup.appendChild(territoryLabel);
        });
    }

    calculateTerritoryBounds(concepts) {
        const xs = concepts.map(c => c.x);
        const ys = concepts.map(c => c.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        return {
            minX,
            maxX,
            minY,
            maxY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }

    renderPathways() {
        const pathwaysGroup = document.getElementById('pathways');
        pathwaysGroup.innerHTML = '';

        this.data.pathways.forEach(pathway => {
            const fromConcept = this.findConceptByName(pathway.from);
            const toConcept = this.findConceptByName(pathway.to);
            
            if (fromConcept && toConcept) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = this.createPathString(fromConcept, toConcept);
                
                path.setAttribute('d', d);
                path.setAttribute('class', `pathway ${pathway.type}`);
                path.setAttribute('marker-end', 'url(#arrowhead)');
                
                pathwaysGroup.appendChild(path);
            }
        });

        // Add arrow marker definition
        this.addArrowMarker();
    }

    addArrowMarker() {
        const svg = document.getElementById('learningMap');
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.insertBefore(defs, svg.firstChild);
        }

        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#4285F4');

        marker.appendChild(polygon);
        defs.appendChild(marker);
    }

    createPathString(fromConcept, toConcept) {
        const dx = toConcept.x - fromConcept.x;
        const dy = toConcept.y - fromConcept.y;
        const controlX1 = fromConcept.x + dx * 0.3;
        const controlY1 = fromConcept.y;
        const controlX2 = toConcept.x - dx * 0.3;
        const controlY2 = toConcept.y;

        return `M ${fromConcept.x} ${fromConcept.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toConcept.x} ${toConcept.y}`;
    }

    findConceptByName(name) {
        for (const territory of this.data.territories) {
            const concept = territory.concepts.find(c => c.name === name);
            if (concept) return concept;
        }
        return null;
    }

    renderConcepts() {
        const conceptsGroup = document.getElementById('concepts');
        conceptsGroup.innerHTML = '';

        this.data.territories.forEach(territory => {
            territory.concepts.forEach(concept => {
                const conceptGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                conceptGroup.setAttribute('class', `concept-node ${concept.type} ${concept.status}`);
                conceptGroup.setAttribute('data-concept', concept.name);

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('class', 'concept-circle');
                circle.setAttribute('cx', concept.x);
                circle.setAttribute('cy', concept.y);
                circle.setAttribute('r', concept.type === 'landmark' ? 25 : 20);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('class', 'concept-text');
                text.setAttribute('x', concept.x);
                text.setAttribute('y', concept.y);
                text.textContent = this.truncateText(concept.name, concept.type === 'landmark' ? 12 : 10);

                conceptGroup.appendChild(circle);
                conceptGroup.appendChild(text);

                conceptGroup.addEventListener('click', () => {
                    this.selectConcept(concept, territory);
                });

                conceptsGroup.appendChild(conceptGroup);
            });
        });
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    selectConcept(concept, territory) {
        this.selectedConcept = { ...concept, territory: territory.name };
        this.showConceptPanel(concept, territory);
        this.addToBreadcrumb(concept.name);
    }

    showConceptPanel(concept, territory) {
        const panel = document.getElementById('conceptPanel');
        const title = document.getElementById('conceptTitle');
        const difficulty = document.getElementById('conceptDifficulty');
        const status = document.getElementById('conceptStatus');
        const description = document.getElementById('conceptDescription');

        title.textContent = concept.name;
        difficulty.textContent = concept.difficulty;
        difficulty.className = `difficulty-badge ${concept.difficulty}`;
        status.textContent = concept.status;
        status.className = `status-badge ${concept.status}`;
        
        description.textContent = this.getConceptDescription(concept, territory);

        panel.classList.add('visible');

        // Update action buttons
        this.updateActionButtons(concept);
    }

    getConceptDescription(concept, territory) {
        const descriptions = {
            'Sets and Operations': 'Fundamental building blocks of mathematics. Learn about set notation, operations like union and intersection, and basic set theory principles.',
            'Logic and Proofs': 'Essential reasoning skills for mathematics. Covers propositional logic, predicate logic, and various proof techniques.',
            'Mathematical Induction': 'A powerful proof technique for statements involving natural numbers. Learn base cases and inductive steps.',
            'Graph Definitions': 'Introduction to graph theory concepts including vertices, edges, and basic graph properties.',
            'Counting Principles': 'Fundamental counting methods including the multiplication principle and addition principle.',
            'Divisibility': 'Properties of integers, divisibility rules, and the Euclidean algorithm for finding GCD.'
        };
        return descriptions[concept.name] || `Learn about ${concept.name} in the ${territory.name} domain. This ${concept.difficulty} level concept builds upon previous knowledge.`;
    }

    updateActionButtons(concept) {
        const startBtn = document.getElementById('startLearningBtn');
        const prereqBtn = document.getElementById('viewPrereqBtn');

        if (concept.status === 'locked') {
            startBtn.textContent = 'Unlock Prerequisites';
            startBtn.disabled = false;
        } else if (concept.status === 'available') {
            startBtn.textContent = 'Start Learning';
            startBtn.disabled = false;
        } else if (concept.status === 'current') {
            startBtn.textContent = 'Continue Learning';
            startBtn.disabled = false;
        } else {
            startBtn.textContent = 'Review';
            startBtn.disabled = false;
        }
    }

    closeConceptPanel() {
        document.getElementById('conceptPanel').classList.remove('visible');
        this.selectedConcept = null;
    }

    zoomIn() {
        this.zoom(this.currentZoom + 0.2);
    }

    zoomOut() {
        this.zoom(this.currentZoom - 0.2);
    }

    zoom(newZoom) {
        this.currentZoom = Math.max(0.5, Math.min(3, newZoom));
        this.updateMapTransform();
    }

    resetView() {
        this.currentZoom = 1;
        this.currentPan = { x: 0, y: 0 };
        this.updateMapTransform();
    }

    updateMapTransform() {
        const svg = document.getElementById('learningMap');
        svg.style.transform = `translate(${this.currentPan.x}px, ${this.currentPan.y}px) scale(${this.currentZoom})`;
        this.updateMiniMap();
    }

    setupMiniMap() {
        const miniMap = document.getElementById('miniMap');
        const viewport = document.getElementById('miniMapViewport');
        
        // Set initial viewport size and position
        this.updateMiniMap();
    }

    updateMiniMap() {
        const viewport = document.getElementById('miniMapViewport');
        const viewportSize = 100 / this.currentZoom;
        const viewportX = (-this.currentPan.x / 8) / this.currentZoom;
        const viewportY = (-this.currentPan.y / 6) / this.currentZoom;

        viewport.style.width = `${Math.min(viewportSize, 100)}%`;
        viewport.style.height = `${Math.min(viewportSize, 100)}%`;
        viewport.style.left = `${Math.max(0, Math.min(100 - viewportSize, viewportX))}%`;
        viewport.style.top = `${Math.max(0, Math.min(100 - viewportSize, viewportY))}%`;
    }

    focusOnTerritory(territory) {
        const bounds = this.calculateTerritoryBounds(territory.concepts);
        this.currentPan = {
            x: -bounds.centerX + 400,
            y: -bounds.centerY + 300
        };
        this.currentZoom = 1.5;
        this.updateMapTransform();
        this.addToBreadcrumb(territory.name);
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (!searchTerm) return;

        const foundConcept = this.findConceptBySearch(searchTerm);
        if (foundConcept) {
            this.currentPan = {
                x: -foundConcept.concept.x + 400,
                y: -foundConcept.concept.y + 300
            };
            this.currentZoom = 2;
            this.updateMapTransform();
            this.selectConcept(foundConcept.concept, foundConcept.territory);
        } else {
            alert('Concept not found. Try searching for: Sets, Logic, Induction, Graph, Counting, or Divisibility');
        }
    }

    findConceptBySearch(searchTerm) {
        for (const territory of this.data.territories) {
            const concept = territory.concepts.find(c => 
                c.name.toLowerCase().includes(searchTerm)
            );
            if (concept) {
                return { concept, territory };
            }
        }
        return null;
    }

    handleNavigationModeChange() {
        if (this.navigationMode === 'guided_tour') {
            this.startGuidedTour();
        }
    }

    startGuidedTour() {
        const availableConcepts = this.getAllConcepts().filter(c => 
            c.concept.status === 'available' || c.concept.status === 'current'
        );
        
        if (availableConcepts.length > 0) {
            const nextConcept = availableConcepts[0];
            this.focusOnConcept(nextConcept.concept);
            this.selectConcept(nextConcept.concept, nextConcept.territory);
        }
    }

    getAllConcepts() {
        const allConcepts = [];
        this.data.territories.forEach(territory => {
            territory.concepts.forEach(concept => {
                allConcepts.push({ concept, territory });
            });
        });
        return allConcepts;
    }

    focusOnConcept(concept) {
        this.currentPan = {
            x: -concept.x + 400,
            y: -concept.y + 300
        };
        this.currentZoom = 2;
        this.updateMapTransform();
    }

    addToBreadcrumb(item) {
        if (this.breadcrumbTrail[this.breadcrumbTrail.length - 1] !== item) {
            this.breadcrumbTrail.push(item);
            if (this.breadcrumbTrail.length > 5) {
                this.breadcrumbTrail = this.breadcrumbTrail.slice(-5);
            }
            this.updateBreadcrumb();
        }
    }

    updateBreadcrumb() {
        const breadcrumbContainer = document.getElementById('breadcrumbTrail');
        breadcrumbContainer.innerHTML = '';

        this.breadcrumbTrail.forEach((item, index) => {
            const breadcrumbItem = document.createElement('span');
            breadcrumbItem.className = 'breadcrumb-item';
            if (index === this.breadcrumbTrail.length - 1) {
                breadcrumbItem.classList.add('active');
            }
            breadcrumbItem.textContent = item;
            breadcrumbContainer.appendChild(breadcrumbItem);
        });
    }

    updateProgress() {
        const progress = this.data.userProgress;
        document.getElementById('completedCount').textContent = progress.completed;
        document.getElementById('currentCount').textContent = progress.current;
        document.getElementById('availableCount').textContent = progress.available;
        
        const progressPercentage = ((progress.completed + progress.current) / progress.totalConcepts) * 100;
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    }

    startLearning() {
        if (this.selectedConcept) {
            if (this.selectedConcept.status === 'locked') {
                this.showPrerequisites();
            } else {
                // Simulate starting learning
                alert(`Starting learning for: ${this.selectedConcept.name}`);
                this.closeConceptPanel();
            }
        }
    }

    viewPrerequisites() {
        if (this.selectedConcept) {
            const prerequisites = this.getPrerequisites(this.selectedConcept.name);
            if (prerequisites.length > 0) {
                alert(`Prerequisites for ${this.selectedConcept.name}:\n${prerequisites.join('\n')}`);
            } else {
                alert(`${this.selectedConcept.name} has no prerequisites.`);
            }
        }
    }

    showPrerequisites() {
        if (this.selectedConcept) {
            const prerequisites = this.getPrerequisites(this.selectedConcept.name);
            if (prerequisites.length > 0) {
                alert(`To unlock ${this.selectedConcept.name}, you need to complete:\n${prerequisites.join('\n')}`);
            }
        }
    }

    getPrerequisites(conceptName) {
        return this.data.pathways
            .filter(p => p.to === conceptName && p.type === 'prerequisite')
            .map(p => p.from);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LearningMap();
});