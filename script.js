document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('tracker-grid');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    const chips = document.querySelectorAll('.filter-chip');
    
    // State Management
    let userStatuses = JSON.parse(localStorage.getItem('apmUserStatus')) || {};
    let marketChartInstance = null;
    let currentFilter = 'all';
    
    const updateTime = () => {
        const now = new Date();
        document.getElementById('lastUpdatedText').textContent = 
            `Last checked: ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-pending';
        if (status.toLowerCase().includes('open')) return 'status-open';
        if (status.toLowerCase().includes('closed')) return 'status-closed';
        return 'status-pending';
    };

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
        });

        document.getElementById('appliedCount').textContent = myApplied;
        document.getElementById('interviewCount').textContent = myInterviews;

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
                    backgroundColor: ['#10B981', '#94A3B8', '#EF4444'],
                    borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
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
        updateDashboard();
        if (currentFilter === 'my-apps') {
            applyFilters();
        }
    };

    const createCard = (company) => {
        const card = document.createElement('div');
        card.className = 'card';
        const currentMyStatus = userStatuses[company.name] || "To Do";
        const opt = (val) => `<option value="${val}" ${currentMyStatus === val ? 'selected' : ''}>${val}</option>`;

        card.innerHTML = `
            <div class="card-header">
                <div class="company-info">
                    <img loading="lazy" src="https://logo.clearbit.com/${company.domain}?size=100" class="company-logo" alt="${company.name} logo" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&color=fff';">
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
                    <span class="detail-value" style="color: var(--text-muted); font-size: 0.85rem;">Source: Industry Trend Projection (AI)</span>
                </div>

                <div class="personal-tracking">
                    <span class="detail-label">My Status:</span>
                    <select class="personal-status-select" data-id="${company.name}">
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
        const select = card.querySelector('.personal-status-select');
        select.addEventListener('change', handleStatusChange);
        return card;
    };

    const renderCards = (companiesToRender) => {
        grid.innerHTML = '';
        if (companiesToRender.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 1.1rem;">No companies found matching your criteria.</div>';
            return;
        }
        companiesToRender.forEach(company => {
            grid.appendChild(createCard(company));
        });
    };

    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        let filtered = companies.filter(c => c.name.toLowerCase().includes(searchTerm));
        
        if (currentFilter === 'open') {
            filtered = filtered.filter(c => c.status === 'Open');
        } else if (currentFilter === 'bigtech') {
            const bigTech = ["Google", "Meta", "Amazon", "Microsoft", "Salesforce", "Apple", "LinkedIn", "Yahoo", "Atlassian", "Roblox", "NVIDIA"];
            filtered = filtered.filter(c => bigTech.some(t => c.name.toLowerCase().includes(t.toLowerCase())));
        } else if (currentFilter === 'finance') {
            const finance = ["Capital One", "JPMorgan", "J.P. Morgan", "Goldman Sachs", "Morgan Stanley", "Visa", "Mastercard", "American Express", "Bloomberg", "Two Sigma", "Jane Street"];
            filtered = filtered.filter(c => finance.some(t => c.name.toLowerCase().includes(t.toLowerCase())));
        } else if (currentFilter === 'unicorns') {
            const unicorns = ["Stripe", "Plaid", "Dropbox", "Uber", "Lyft", "Airbnb", "Pinterest", "Spotify", "Datadog", "Snowflake", "Figma", "Canva"];
            filtered = filtered.filter(c => unicorns.some(t => c.name.toLowerCase().includes(t.toLowerCase())));
        } else if (currentFilter === 'my-apps') {
            filtered = filtered.filter(c => {
                const status = userStatuses[c.name];
                return status && status !== "To Do";
            });
        }
        
        const sortVal = sortSelect.value;
        filtered.sort((a, b) => {
            if (sortVal === 'expectedOpening') {
                return (a.expectedOpening || '2099-01-01').localeCompare(b.expectedOpening || '2099-01-01');
            } else if (sortVal === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortVal === 'myStatus') {
                const priority = { "Interviewing": 1, "To Do": 2, "Applied": 3, "Offer": 4, "Rejected": 5 };
                const sA = userStatuses[a.name] || "To Do";
                const sB = userStatuses[b.name] || "To Do";
                return priority[sA] - priority[sB];
            }
            return 0;
        });

        renderCards(filtered);
    };

    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            chips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            applyFilters();
        });
    });

    updateTime();
    applyFilters();
    updateDashboard();
});
