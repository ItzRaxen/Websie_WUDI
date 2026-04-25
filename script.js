document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       1. Custom Cursor & Trail Logic
       ========================================= */
    const cursorOuter = document.getElementById('cursor-outer');
    const cursorInner = document.getElementById('cursor-inner');
    const trailContainer = document.getElementById('cursor-trail-container');
    
    // Check if device supports touch (disable custom cursor if so)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (!isTouchDevice) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let outerX = mouseX;
        let outerY = mouseY;
        
        // Trail dots setup
        const numTrails = 8;
        const trails = [];
        for (let i = 0; i < numTrails; i++) {
            const dot = document.createElement('div');
            dot.classList.add('trail-dot');
            trailContainer.appendChild(dot);
            trails.push({ element: dot, x: mouseX, y: mouseY, opacity: 0 });
        }
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Move inner cursor instantly
            cursorInner.style.left = `${mouseX}px`;
            cursorInner.style.top = `${mouseY}px`;
        });
        
        const lerp = (start, end, factor) => start + (end - start) * factor;
        
        const renderCursor = () => {
            // Smooth follow for outer cursor
            outerX = lerp(outerX, mouseX, 0.12);
            outerY = lerp(outerY, mouseY, 0.12);
            cursorOuter.style.left = `${outerX}px`;
            cursorOuter.style.top = `${outerY}px`;
            
            // Trail follow logic
            let prevX = outerX;
            let prevY = outerY;
            
            // Check if mouse is moving to show/hide trails
            const dx = mouseX - outerX;
            const dy = mouseY - outerY;
            const isMoving = Math.sqrt(dx*dx + dy*dy) > 1;
            
            trails.forEach((trail, index) => {
                const targetX = prevX;
                const targetY = prevY;
                
                trail.x = lerp(trail.x, targetX, 0.25);
                trail.y = lerp(trail.y, targetY, 0.25);
                
                trail.element.style.left = `${trail.x}px`;
                trail.element.style.top = `${trail.y}px`;
                
                // Fade trails based on movement
                if (isMoving) {
                    trail.opacity = lerp(trail.opacity, 1 - (index / numTrails), 0.1);
                } else {
                    trail.opacity = lerp(trail.opacity, 0, 0.1);
                }
                trail.element.style.opacity = trail.opacity;
                
                prevX = trail.x;
                prevY = trail.y;
            });
            
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);
        
        // Hover States
        const addHoverEffect = (selector, className) => {
            document.querySelectorAll(selector).forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add(className));
                el.addEventListener('mouseleave', () => document.body.classList.remove(className));
            });
        };
        
        addHoverEffect('button, .btn, .nav-btn, .pill', 'cursor-hover-btn');
        addHoverEffect('.phone-mockup', 'cursor-hover-phone');
        addHoverEffect('h1, h2, h3, p', 'cursor-hover-text');
        addHoverEffect('.nav-link', 'cursor-hover-nav');
    }

    /* =========================================
       2. Sticky Navbar
       ========================================= */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    /* =========================================
       3. Intersection Observer (Scroll Triggers)
       ========================================= */
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -15% 0px', // Trigger when element is 15% from bottom
        threshold: 0
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Start counters if stats section
                if (entry.target.classList.contains('stats-bar') && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = "true";
                    startCounters(entry.target);
                }
            } else {
                // Remove to allow re-animation on scroll up/down
                const rect = entry.boundingClientRect;
                if (rect.top > 0) { // Only remove if scrolling back up above the element
                    entry.target.classList.remove('in-view');
                }
            }
        });
    }, observerOptions);

    // Elements to observe (excluding hero on-load animations)
    document.querySelectorAll('.scroll-trigger, .step-row, .step-text, .step-phone, .df-left, .phone-left, .phone-right').forEach(el => {
        scrollObserver.observe(el);
    });

    // Staggered lists
    document.querySelectorAll('.features-grid, .testi-grid, .cta-buttons, .f-right, .large-phone-container, .checkpoints').forEach(container => {
        const children = container.children;
        Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.1}s`;
            scrollObserver.observe(child);
        });
    });

    /* =========================================
       4. Initial Hero Entrance
       ========================================= */
    document.body.addEventListener('wudi-loaded-event', function() {
        document.querySelectorAll('.animate-on-load').forEach(el => el.classList.add('in-view'));
        document.querySelectorAll('.animate-clip').forEach(el => el.classList.add('in-view'));
        document.querySelectorAll('.animate-fade').forEach(el => el.classList.add('in-view'));
        document.querySelectorAll('.animate-fade-up').forEach(el => el.classList.add('in-view'));
        const phone = document.getElementById('hero-phone');
        if (phone) phone.classList.add('in-view');
        document.querySelectorAll('.floating-card').forEach(el => el.classList.add('in-view'));
    });

    /* =========================================
       5. Stats Counter Logic
       ========================================= */
    function startCounters(section) {
        const nums = section.querySelectorAll('.stat-num');
        nums.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'));
            const suffix = num.getAttribute('data-suffix');
            let current = 0;
            const duration = 1500; // 1.5s
            const stepTime = Math.abs(Math.floor(duration / 60)); // 60fps
            const increment = target / (duration / stepTime);
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    num.textContent = target + suffix;
                } else {
                    num.textContent = Math.ceil(current) + suffix;
                }
            }, stepTime);
        });
    }

    /* =========================================
       6. Parallax & Scroll Linked Animations
       ========================================= */
    const progressLine = document.getElementById('progress-line');
    const nodes = document.querySelectorAll('.progress-node');
    const stepsSection = document.getElementById('how-it-works');
    const teamSection = document.getElementById('team');
    const largePhone = document.querySelector('.large-phone');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Blob Parallax
        const blob = document.querySelector('.hero-bg-blob');
        if (blob) blob.style.transform = `translateY(${scrollY * 0.3}px)`;
        
        // Progress Line logic
        if (stepsSection && progressLine) {
            const rect = stepsSection.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
                const scrolledPast = windowHeight / 2 - sectionTop;
                let progress = (scrolledPast / sectionHeight) * 100;
                progress = Math.max(0, Math.min(100, progress));
                
                progressLine.style.setProperty('--scroll-progress', `${progress}%`);
                
                // Activate nodes
                nodes.forEach((node, i) => {
                    const nodePos = [15, 50, 85][i];
                    if (progress >= nodePos) {
                        node.classList.add('active');
                    } else {
                        node.classList.remove('active');
                    }
                });
            }
        }

        // Team Phone 3D Rotation based on scroll
        if (teamSection && largePhone) {
            const rect = teamSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const progress = 1 - (rect.bottom / (window.innerHeight + rect.height));
                // progress goes from 0 to 1 as we scroll past
                const rotation = -5 + (progress * 10); // -5deg to +5deg
                largePhone.style.transform = `rotateY(${rotation}deg)`;
            }
        }
    }, { passive: true });

});
