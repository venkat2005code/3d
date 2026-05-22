document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    const rtlBtn = document.getElementById('rtl-toggle');
    const body = document.body;
    const header = document.querySelector('header');

    // Theme Toggle
    themeBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        themeBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', newTheme);
    });

    // RTL/LTR Toggle
    rtlBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const currentDir = html.getAttribute('dir') || 'ltr';
        const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';

        html.setAttribute('dir', newDir);
        rtlBtn.textContent = newDir.toUpperCase();
        localStorage.setItem('dir', newDir);
    });

    // Scroll Header effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('glass');
            header.style.height = '70px';
        } else {
            header.classList.remove('glass');
            header.style.height = '80px';
        }
    });

    // Load saved preferences
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    const savedDir = localStorage.getItem('dir');
    if (savedDir) {
        document.documentElement.setAttribute('dir', savedDir);
        rtlBtn.textContent = savedDir.toUpperCase();
    } else {
        rtlBtn.textContent = 'LTR';
    }

    // Intersection Observer for reveal animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Bento Mouse Tracking
    document.querySelectorAll('.bento-item').forEach(item => {
        item.addEventListener('mousemove', e => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            item.style.setProperty('--mouse-x', `${x}px`);
            item.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // =============================================
    // MINI QUOTE ESTIMATOR CARD LOGIC
    // =============================================
    const dropZone = document.getElementById('quote-drop-zone');
    const fileInput = document.getElementById('quote-file-input');
    const fileInfoPanel = document.getElementById('quote-file-info-panel');
    const fileNameSpan = document.getElementById('quote-file-name');
    const fileRemoveBtn = document.getElementById('quote-file-remove');
    const materialSelect = document.getElementById('quote-material-select');
    const infillBtns = document.querySelectorAll('.quote-infill-btn');
    const priceDisplay = document.getElementById('quote-price-display');
    const priceTitle = document.getElementById('quote-price-title');
    const calcDetails = document.getElementById('quote-calc-details');
    const submitBtn = document.getElementById('quote-submit-btn');

    let selectedFile = null;
    let selectedWeight = 0;
    let infillDensity = 0.4; // 40% default
    let calculatedPrice = 0;

    function updateEstimation() {
        if (!selectedFile) {
            priceDisplay.textContent = '--';
            priceTitle.textContent = 'Upload design to estimate';
            calcDetails.textContent = 'Select file to calculate weight';
            submitBtn.textContent = 'Upload CAD File';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
            return;
        }

        const selectedOption = materialSelect.options[materialSelect.selectedIndex];
        const rate = parseFloat(selectedOption.getAttribute('data-rate')) || 0.45;
        
        // Dynamic Price Formula: base $5.00 + (weight * rate * (infill_percent + 0.6))
        calculatedPrice = 5.00 + (selectedWeight * rate * (infillDensity + 0.6));
        
        priceDisplay.textContent = `$${calculatedPrice.toFixed(2)}`;
        priceTitle.textContent = 'Estimated Price';
        calcDetails.textContent = `Weight: ~${selectedWeight}g | Infill: ${Math.round(infillDensity * 100)}%`;
        
        submitBtn.textContent = 'Configure & Print Now';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }

    if (dropZone && fileInput) {
        // Trigger click on file input
        dropZone.addEventListener('click', () => fileInput.click());

        // File Selection Change
        fileInput.addEventListener('change', (e) => {
            handleFileSelection(e.target.files[0]);
        });

        // Drag & Drop Handlers
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.background = 'rgba(99, 102, 241, 0.08)';
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border)';
                dropZone.style.background = 'rgba(0, 0, 0, 0.02)';
            });
        });

        dropZone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });
    }

    function handleFileSelection(file) {
        if (!file) return;
        selectedFile = file;
        fileNameSpan.textContent = file.name;
        
        // Simulating weight calculation based on file name characteristics
        selectedWeight = ((file.name.charCodeAt(0) || 75) % 120) + 20; // 20g to 140g
        
        // Toggle view
        dropZone.style.display = 'none';
        fileInfoPanel.classList.add('active');
        
        updateEstimation();
    }

    if (fileRemoveBtn) {
        fileRemoveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFile = null;
            selectedWeight = 0;
            fileInput.value = '';
            
            fileInfoPanel.classList.remove('active');
            dropZone.style.display = 'block';
            
            updateEstimation();
        });
    }

    if (materialSelect) {
        materialSelect.addEventListener('change', updateEstimation);
    }

    infillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            infillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            infillDensity = parseFloat(btn.getAttribute('data-infill'));
            updateEstimation();
        });
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (selectedFile) {
                const quoteData = {
                    filename: selectedFile.name,
                    material: materialSelect.value,
                    infill: infillDensity,
                    weight: selectedWeight,
                    price: calculatedPrice.toFixed(2)
                };
                sessionStorage.setItem('mini_quote', JSON.stringify(quoteData));
                window.location.href = 'login.html';
            }
        });
    }
});

