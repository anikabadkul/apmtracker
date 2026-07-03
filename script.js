document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('tracker-grid');
    const sortSelect = document.getElementById('sortSelect');
    
    // State Management for Personal Tracking
    let userStatuses = JSON.parse(localStorage.getItem('apmUserStatus')) || {};

    let marketChartInstance = null;
    
    // Format the date nicely
    const updateTime = () => {
        const now = new Date();
        document.getElementById('lastUpdatedText').textContent = 
            `Last checked: ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    };

    const getStatusClass = (status) => {
        if (status.toLowerCase().includes('open')) return 'status-open';
        if (status.toLowerCase().includes('closed')) return 'status-closed';
        return 'status-pending';
    };

    // Calculate and Update Dashboard Metrics
    const updateDashboard = () => {
        document.getElementById('totalCount').textContent = companies.length;
        
        let marketOpen = 0;
        let marketPending = 0;
        let marketClosed = 0;
        
        companies.forEach(c => {
            if (c.status.toLowerCase().includes('open')) marketOpen++;
            else if (c.status.toLowerCase().includes('closed')) marketClosed++;
            else marketPending++;
        });

        document.getElementById('openCount').textContent = marketOpen;

        let myApplied = 0;
        let myInterviews = 0;

        Object.values(userStatuses).forEach(status => {
            if (status === 'Applied') myApplied++;
            if (status === 'Interviewing') myInterviews++;
            // Offer and Rejected are omitted from the top quick count, but can be tracked
        });

        document.getElementById('appliedCount').textContent = myApplied;
        document.getElementById('interviewCount').textContent = myInterviews;

        // Render Chart.js
        renderChart(marketOpen, marketPending, marketClosed);
    };

    const renderChart = (open, pending, closed) => {
        const ctx = document.getElementById('marketChart').getContext('2d');
        
        if (marketChartInstance) {
            marketChartInstance.destroy();
        }

        marketChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Open', 'Pending', 'Closed'],
                datasets: [{
                    data: [open, pending, closed],
                    backgroundColor: [
                        '#10B981', // Open - IoT Green
                        '#94A3B8', // Pending - Slate
                        '#EF4444'  // Closed - Red
                    ],
                    borderColor: [
                        '#FFFFFF',
                        '#FFFFFF',
                        '#FFFFFF'
                    ],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#475569',
                            font: { family: 'Inter', size: 12, weight: '500' }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    };

    const handleStatusChange = (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        userStatuses[id] = newStatus;
        localStorage.setItem('apmUserStatus', JSON.stringify(userStatuses));
        updateDashboard(); // Re-calc top metrics
    };

    const renderCards = (data) => {
        grid.innerHTML = '';
        data.forEach(company => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const logoUrl = `https://logo.clearbit.com/${company.domain}?size=100`;
            const currentMyStatus = userStatuses[company.id] || "To Do";

            // Helper to generate <option> with selected attribute
            const opt = (val) => `<option value="${val}" ${currentMyStatus === val ? 'selected' : ''}>${val}</option>`;

            card.innerHTML = `
                <div class="card-header">
                    <div class="company-info">
                        <img src="${logoUrl}" alt="${company.name} logo" class="company-logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UzZThlOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIGZpbGw9IiM2YjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+PzwvdGV4dD48L3N2Zz4='">
                        <span class="company-name">${company.name}</span>
                    </div>
                    <span class="status-badge ${getStatusClass(company.status)}">${company.status}</span>
                </div>
                
                <div class="card-body">
                    <div class="detail-group">
                        <span class="detail-label">Role</span>
                        <span class="detail-value">${company.program}</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Expected 2026 Opening</span>
                        <span class="detail-value highlight">${company.expectedOpening || 'Unknown'}</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Historical 2025 Opening</span>
                        <span class="detail-value" style="color: var(--text-muted); font-size: 0.85rem;">${company.lastYearOpened || 'Unknown'}</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Signals</span>
                        <span class="detail-value">${company.signals || 'None'}</span>
                    </div>

                    <div class="personal-tracking">
                        <span class="detail-label">My Status:</span>
                        <select class="personal-status-select" data-id="${company.id}">
                            ${opt("To Do")}
                            ${opt("Applied")}
                            ${opt("Interviewing")}
                            ${opt("Offer")}
                            ${opt("Rejected")}
                        </select>
                    </div>
                </div>

                <div class="card-footer">
                    <a href="${company.link}" target="_blank" rel="noopener noreferrer" class="apply-btn">
                        Go to Careers Page
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });

        // Attach listeners to all new select boxes
        document.querySelectorAll('.personal-status-select').forEach(select => {
            select.addEventListener('change', handleStatusChange);
        });
    };

    const sortData = (method) => {
        let sorted = [...companies];
        if (method === 'expectedOpening') {
            sorted.sort((a, b) => a.sortMonth - b.sortMonth);
        } else if (method === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (method === 'myStatus') {
            // Sort by priority of action: Interviewing > Applied > To Do > Offer > Rejected
            const priority = { "Interviewing": 1, "To Do": 2, "Applied": 3, "Offer": 4, "Rejected": 5 };
            sorted.sort((a, b) => {
                const statA = userStatuses[a.id] || "To Do";
                const statB = userStatuses[b.id] || "To Do";
                return priority[statA] - priority[statB];
            });
        }
        return sorted;
    };

    // Event Listeners
    sortSelect.addEventListener('change', (e) => {
        const sortedData = sortData(e.target.value);
        renderCards(sortedData);
    });

    // Initial Render
    updateTime();
    renderCards(sortData(sortSelect.value));
    updateDashboard();
});
