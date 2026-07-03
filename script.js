document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('tracker-grid');
    const sortSelect = document.getElementById('sortSelect');
    
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

    const renderCards = (data) => {
        grid.innerHTML = '';
        data.forEach(company => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Using clearbit for high quality logos automatically based on domain
            const logoUrl = `https://logo.clearbit.com/${company.domain}?size=100`;

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
                        <span class="detail-label">Expected Opening</span>
                        <span class="detail-value highlight">${company.expectedOpening}</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Early Access Signals</span>
                        <span class="detail-value">${company.signals}</span>
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
    };

    const sortData = (method) => {
        let sorted = [...companies];
        if (method === 'expectedOpening') {
            sorted.sort((a, b) => a.sortMonth - b.sortMonth);
        } else if (method === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
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
});
