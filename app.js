/* ============================================
   StadiumAI — Smart Stadium Experience System
   Main Application Engine
   ============================================ */

// ============ DATA ============
const STADIUM_DATA = {
    name: "National Cricket Stadium",
    capacity: 68000,
    currentAttendees: 45230,
    avgWait: 2.4,
    safetyScore: 98.7,
    satisfaction: 4.8,
    zones: [
        { id: "north", name: "North Stand", capacity: 15000, current: 12400, color: "#6366f1" },
        { id: "south", name: "South Stand", capacity: 15000, current: 13200, color: "#06b6d4" },
        { id: "east", name: "East Pavilion", capacity: 12000, current: 8900, color: "#10b981" },
        { id: "west", name: "West Gallery", capacity: 12000, current: 7200, color: "#f59e0b" },
        { id: "vip", name: "VIP Lounge", capacity: 4000, current: 2100, color: "#a855f7" },
        { id: "ground", name: "Ground Floor", capacity: 10000, current: 6430, color: "#f43f5e" }
    ],
    gates: [
        { id: "A", name: "Gate A", status: "open", flow: 142, maxFlow: 200 },
        { id: "B", name: "Gate B", status: "open", flow: 98, maxFlow: 200 },
        { id: "C", name: "Gate C", status: "busy", flow: 187, maxFlow: 200 },
        { id: "D", name: "Gate D", status: "open", flow: 65, maxFlow: 200 },
        { id: "E", name: "Gate E", status: "open", flow: 112, maxFlow: 200 },
        { id: "F", name: "Gate F", status: "closed", flow: 0, maxFlow: 200 }
    ],
    foodStalls: [
        { id: 1, name: "Stadium Burgers", emoji: "🍔", type: "food", wait: 0, queue: 3, maxQueue: 20, items: ["Classic Burger", "Cheese Burger", "Veggie Burger"] },
        { id: 2, name: "Pizza Corner", emoji: "🍕", type: "food", wait: 2, queue: 8, maxQueue: 20, items: ["Margherita", "Pepperoni", "Veggie Supreme"] },
        { id: 3, name: "Desi Bites", emoji: "🍛", type: "food", wait: 5, queue: 14, maxQueue: 20, items: ["Samosa", "Pav Bhaji", "Vada Pav"] },
        { id: 4, name: "Fresh Juice Bar", emoji: "🥤", type: "drink", wait: 1, queue: 4, maxQueue: 15, items: ["Orange Juice", "Mango Lassi", "Cold Coffee"] },
        { id: 5, name: "Ice Cream Parlor", emoji: "🍦", type: "food", wait: 0, queue: 2, maxQueue: 15, items: ["Vanilla Cone", "Chocolate Sundae", "Mango Kulfi"] },
        { id: 6, name: "Coffee House", emoji: "☕", type: "drink", wait: 3, queue: 10, maxQueue: 15, items: ["Espresso", "Cappuccino", "Latte"] },
        { id: 7, name: "Noodle Station", emoji: "🍜", type: "food", wait: 7, queue: 16, maxQueue: 20, items: ["Hakka Noodles", "Chow Mein", "Fried Rice"] },
        { id: 8, name: "Snack Hub", emoji: "🍿", type: "food", wait: 0, queue: 1, maxQueue: 15, items: ["Popcorn", "Nachos", "French Fries"] },
        { id: 9, name: "Chai Point", emoji: "🍵", type: "drink", wait: 1, queue: 5, maxQueue: 15, items: ["Masala Chai", "Green Tea", "Hot Chocolate"] }
    ],
    restrooms: [
        { id: 1, name: "North Restroom A", floor: "Ground", occupancy: 30, capacity: 50, wait: 0 },
        { id: 2, name: "North Restroom B", floor: "Ground", occupancy: 45, capacity: 50, wait: 2 },
        { id: 3, name: "South Restroom A", floor: "Ground", occupancy: 20, capacity: 50, wait: 0 },
        { id: 4, name: "South Restroom B", floor: "Upper", occupancy: 38, capacity: 50, wait: 1 },
        { id: 5, name: "East Restroom", floor: "Ground", occupancy: 48, capacity: 50, wait: 5 },
        { id: 6, name: "West Restroom", floor: "Ground", occupancy: 15, capacity: 50, wait: 0 },
        { id: 7, name: "VIP Restroom", floor: "VIP", occupancy: 8, capacity: 20, wait: 0 },
        { id: 8, name: "Gate A Restroom", floor: "Ground", occupancy: 35, capacity: 40, wait: 2 }
    ],
    queueItems: [
        { name: "Gate C Entry", icon: "🚪", wait: 4, detail: "187 people in queue", pct: 85 },
        { name: "Desi Bites", icon: "🍛", wait: 5, detail: "14 in line", pct: 70 },
        { name: "Noodle Station", icon: "🍜", wait: 7, detail: "16 in line", pct: 90 },
        { name: "East Restroom", icon: "🚻", wait: 5, detail: "48/50 occupied", pct: 96 },
        { name: "Coffee House", icon: "☕", wait: 3, detail: "10 in line", pct: 55 },
        { name: "North Restroom B", icon: "🚻", wait: 2, detail: "45/50 occupied", pct: 88 },
        { name: "Pizza Corner", icon: "🍕", wait: 2, detail: "8 in line", pct: 40 },
        { name: "Stadium Burgers", icon: "🍔", wait: 0, detail: "3 in line", pct: 12 }
    ],
    alerts: [
        { type: "warning", icon: "⚠️", text: "Gate C approaching capacity — redirecting crowd to Gate D", time: "2 min ago" },
        { type: "info", icon: "📊", text: "AI predicts 15% crowd increase at food court during innings break", time: "5 min ago" },
        { type: "success", icon: "✅", text: "Smart routing activated for North Stand — avg wait reduced by 40%", time: "8 min ago" },
        { type: "info", icon: "🎯", text: "VIP section at 52% capacity — optimal comfort level maintained", time: "12 min ago" },
        { type: "warning", icon: "🌡️", text: "Temperature in East Pavilion rising — HVAC auto-adjusting", time: "15 min ago" },
        { type: "success", icon: "🛤️", text: "New shortest path calculated for Gate A → Section 14", time: "18 min ago" }
    ],
    insights: [
        { type: "Prediction", text: "Innings break in ~12 minutes. Food court queues expected to increase 3x. Recommend pre-ordering now.", confidence: "94%" },
        { type: "Optimization", text: "Redirecting 230 fans from Gate C to Gate D has reduced entry wait time by 62%.", confidence: "97%" },
        { type: "Anomaly", text: "Unusual crowd buildup detected near East Restroom. Dispatching housekeeping team.", confidence: "89%" },
        { type: "Suggestion", text: "Opening Gate F could reduce overall stadium entry time by 25%. Currently closed for maintenance.", confidence: "91%" }
    ],
    routes: [
        { badge: "fastest", from: "Your Seat (N-14)", to: "Food Court A", eta: "2 min" },
        { badge: "fastest", from: "Gate A", to: "Section 22", eta: "4 min" },
        { badge: "scenic", from: "VIP Lounge", to: "Merchandise Store", eta: "5 min" },
        { badge: "accessible", from: "Gate D", to: "Wheelchair Bay", eta: "3 min" }
    ],
    navLinks: [
        { icon: "🍔", name: "Nearest Food Court", dist: "45m away", time: "1 min" },
        { icon: "🚻", name: "Nearest Restroom", dist: "30m away", time: "45 sec" },
        { icon: "🚪", name: "Nearest Exit (Gate B)", dist: "90m away", time: "2 min" },
        { icon: "🏥", name: "Medical Bay", dist: "120m away", time: "3 min" },
        { icon: "🛍️", name: "Merchandise Store", dist: "60m away", time: "1.5 min" },
        { icon: "💺", name: "My Seat (N-14)", dist: "25m away", time: "30 sec" }
    ],
    recommendations: [
        { icon: "🍔", title: "Pre-order a Burger", desc: "Stadium Burgers has 0 min wait right now!", action: "Order →" },
        { icon: "💺", title: "Seat Upgrade Available", desc: "VIP lounge has open spots — ₹500 upgrade", action: "Upgrade →" },
        { icon: "📸", title: "Photo Opportunity Zone", desc: "Giant screen selfie spot near Gate B, no crowd", action: "Navigate →" },
        { icon: "🎁", title: "Limited Edition Jersey", desc: "Available at West Merchandise — 40% off today", action: "Shop →" },
        { icon: "🚻", title: "Best Restroom Now", desc: "West Restroom has only 30% occupancy", action: "Navigate →" }
    ],
    quests: [
        { name: "First Timer", desc: "Check in at the stadium", reward: "+100 XP", done: true },
        { name: "Foodie Explorer", desc: "Visit 3 different food stalls", reward: "+200 XP", done: true },
        { name: "Social Butterfly", desc: "Share on social media", reward: "+150 XP", done: false },
        { name: "Stadium Explorer", desc: "Visit all 4 stadium zones", reward: "+300 XP", done: false },
        { name: "Super Fan", desc: "Stay for the entire match", reward: "+500 XP", done: false }
    ],
    merchandise: [
        { emoji: "👕", name: "Team Jersey", price: "₹2,499", dist: "60m - West Store" },
        { emoji: "🧢", name: "Official Cap", price: "₹799", dist: "45m - North Kiosk" },
        { emoji: "🏏", name: "Mini Bat", price: "₹1,299", dist: "60m - West Store" },
        { emoji: "🎒", name: "Fan Backpack", price: "₹1,799", dist: "90m - East Store" }
    ],
    anomalies: [
        { level: "normal", title: "North Stand Movement", desc: "Normal crowd flow patterns detected", confidence: "99%" },
        { level: "normal", title: "Entry Gate Patterns", desc: "All gates operating within expected parameters", confidence: "97%" },
        { level: "watch", title: "East Corridor Density", desc: "Crowd density 15% above average — monitoring", confidence: "85%" },
        { level: "normal", title: "VIP Area", desc: "Low density, calm movement patterns", confidence: "98%" },
        { level: "watch", title: "Food Court Rush", desc: "Pre-innings break surge beginning — AI routing active", confidence: "91%" }
    ],
    evacRoutes: [
        { name: "Route Alpha — Gate A & B", color: "#10b981", capacity: "15,000/hr" },
        { name: "Route Beta — Gate C & D", color: "#3b82f6", capacity: "12,000/hr" },
        { name: "Route Gamma — Gate E (Emergency)", color: "#f59e0b", capacity: "8,000/hr" },
        { name: "Route Delta — VIP Exit", color: "#a855f7", capacity: "3,000/hr" }
    ],
    medicalCases: [
        { priority: "low", case: "Minor dehydration — Section 8", loc: "North Stand", time: "Treated" },
        { priority: "medium", case: "Sprained ankle — Stairs B", loc: "East Pavilion", time: "En route" },
        { priority: "low", case: "Heat exhaustion — Row 22", loc: "South Stand", time: "Monitoring" }
    ],
    notifications: [
        { icon: "⚠️", title: "Gate C Alert", desc: "Gate C reaching capacity, alternate routing active", time: "2m ago" },
        { icon: "🍔", title: "Pre-Order Ready", desc: "Your order at Stadium Burgers is ready for pickup!", time: "5m ago" },
        { icon: "🏏", title: "Match Update", desc: "Virat Kohli reaches his half-century! 🎉", time: "8m ago" }
    ]
};

// ============ STATE ============
const state = {
    currentView: 'command',
    activeOrders: [],
    orderCounter: 0,
    sidebarOpen: false,
    notifPanelOpen: false,
    evacSimulating: false
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
});

function initLoadingScreen() {
    const counters = { sensors: 0, cameras: 0, zones: 0 };
    const targets = { sensors: 2048, cameras: 384, zones: 48 };
    const duration = 2200;
    const startTime = Date.now();

    function animateCounters() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        document.getElementById('lsSensors').textContent = Math.floor(targets.sensors * ease).toLocaleString();
        document.getElementById('lsCameras').textContent = Math.floor(targets.cameras * ease);
        document.getElementById('lsZones').textContent = Math.floor(targets.zones * ease);

        if (progress < 1) requestAnimationFrame(animateCounters);
    }
    animateCounters();

    setTimeout(() => {
        const ls = document.getElementById('loadingScreen');
        ls.classList.add('fade-out');
        setTimeout(() => {
            ls.style.display = 'none';
            document.getElementById('app').classList.remove('hidden');
            initApp();
        }, 800);
    }, 2800);
}

function initApp() {
    initParticles();
    initNavigation();
    initSidebar();
    initClock();
    renderCommandCenter();
    renderCrowdFlow();
    renderZeroWait();
    renderNavigation();
    renderFanExperience();
    renderEmergency();
    initNotifications();
    startLiveUpdates();
    animateKPIs();

    // Initial toasts
    setTimeout(() => showToast('🏟️', 'Welcome to StadiumAI', 'All systems operational. Monitoring 45,230 attendees.'), 1000);
    setTimeout(() => showToast('🤖', 'AI Active', 'Smart routing & predictive queues enabled.'), 3000);
}

// ============ PARTICLES ============
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const count = 50;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.5 + 0.5,
            o: Math.random() * 0.3 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.o})`;
            ctx.fill();
        });

        // Connect nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ============ NAVIGATION ============
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

function switchView(viewId) {
    state.currentView = viewId;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navBtn = document.querySelector(`[data-view="${viewId}"]`);
    if (navBtn) navBtn.classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`view-${viewId}`);
    if (view) view.classList.add('active');

    // Update topbar
    const titles = {
        command: ['Command Center', 'Dashboard / Overview'],
        crowd: ['Crowd Flow', 'Monitoring / Real-time'],
        zerowait: ['Zero-Wait Experience', 'Queues / Food & Restrooms'],
        navigation: ['Stadium Navigator', 'AR Navigation / Maps'],
        fan: ['Fan Experience', 'Personalization / Gamification'],
        emergency: ['Emergency & Safety', 'Monitoring / Response']
    };

    document.getElementById('pageTitle').textContent = titles[viewId]?.[0] || 'Dashboard';
    document.getElementById('pageBreadcrumb').textContent = titles[viewId]?.[1] || '';

    // Render canvases on switch
    if (viewId === 'command') {
        setTimeout(() => drawHeatmap(), 100);
    }
    if (viewId === 'crowd') {
        setTimeout(() => drawStadiumMap(), 100);
    }
    if (viewId === 'navigation') {
        setTimeout(() => drawNavMap(), 100);
    }
    if (viewId === 'emergency') {
        setTimeout(() => drawEvacMap(), 100);
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
        state.sidebarOpen = false;
    }
}

// ============ SIDEBAR ============
function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    toggle?.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        state.sidebarOpen = !state.sidebarOpen;
        sidebar.classList.toggle('open', state.sidebarOpen);
    });
}

// ============ CLOCK ============
function initClock() {
    function update() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        const el = document.getElementById('sidebarTime');
        if (el) el.textContent = timeStr;
    }
    update();
    setInterval(update, 1000);
}

// ============ RENDER: COMMAND CENTER ============
function renderCommandCenter() {
    renderQueueList();
    renderAlertsFeed();
    renderZoneBars();
    renderInsights();
    setTimeout(() => drawHeatmap(), 200);
}

function animateKPIs() {
    animateValue('kpiAttendeesVal', 0, STADIUM_DATA.currentAttendees, 2000, true);
    animateValue('kpiAvgWaitVal', 0, STADIUM_DATA.avgWait, 2000, false, 1);
}

function animateValue(id, start, end, duration, format = false, decimals = 0) {
    const el = document.getElementById(id);
    if (!el) return;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * ease;

        if (format) {
            el.textContent = Math.floor(current).toLocaleString();
        } else if (decimals > 0) {
            el.textContent = current.toFixed(decimals);
        } else {
            el.textContent = Math.floor(current);
        }

        if (progress < 1) requestAnimationFrame(update);
    }
    update();
}

function renderQueueList() {
    const container = document.getElementById('queueList');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.queueItems.map(q => {
        const waitClass = q.wait <= 1 ? 'low' : q.wait <= 4 ? 'med' : 'high';
        const barColor = q.wait <= 1 ? '#10b981' : q.wait <= 4 ? '#f59e0b' : '#f43f5e';
        return `
            <div class="queue-item">
                <div class="queue-icon">${q.icon}</div>
                <div class="queue-info">
                    <div class="queue-name">${q.name}</div>
                    <div class="queue-detail">${q.detail}</div>
                    <div class="queue-bar"><div class="queue-bar-fill" style="width:${q.pct}%;background:${barColor}"></div></div>
                </div>
                <div class="queue-wait ${waitClass}">${q.wait === 0 ? '0 min ✨' : q.wait + ' min'}</div>
            </div>
        `;
    }).join('');
}

function renderAlertsFeed() {
    const container = document.getElementById('alertsFeed');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.alerts.map(a => `
        <div class="alert-item ${a.type}">
            <div class="alert-icon">${a.icon}</div>
            <div class="alert-content">
                <div class="alert-text">${a.text}</div>
                <div class="alert-time">${a.time}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('btnClearAlerts')?.addEventListener('click', () => {
        container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:20px;font-size:0.8rem;">All alerts cleared ✓</div>';
    });
}

function renderZoneBars() {
    const container = document.getElementById('zoneBars');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.zones.map(z => {
        const pct = Math.round((z.current / z.capacity) * 100);
        const cls = pct < 60 ? 'safe' : pct < 85 ? 'moderate' : 'critical';
        return `
            <div class="zone-bar-row">
                <div class="zone-bar-header">
                    <span class="zone-bar-name">${z.name}</span>
                    <span class="zone-bar-pct" style="color:${z.color}">${pct}%</span>
                </div>
                <div class="zone-bar-track">
                    <div class="zone-bar-fill ${cls}" style="width:0%" data-target="${pct}"></div>
                </div>
            </div>
        `;
    }).join('');

    // Animate bars
    setTimeout(() => {
        container.querySelectorAll('.zone-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.target + '%';
        });
    }, 100);
}

function renderInsights() {
    const container = document.getElementById('insightsList');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.insights.map(i => `
        <div class="insight-item">
            <div class="insight-header">
                <span class="insight-type">${i.type}</span>
                <span class="insight-confidence">Confidence: ${i.confidence}</span>
            </div>
            <p class="insight-text">${i.text}</p>
        </div>
    `).join('');
}

// ============ HEATMAP ============
function drawHeatmap() {
    const canvas = document.getElementById('heatmapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const w = canvas.width;
    const h = canvas.height;

    // Draw stadium outline
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, w, h);

    // Draw oval stadium
    const cx = w / 2, cy = h / 2;
    const rx = w * 0.42, ry = h * 0.42;

    // Outer ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99,102,241,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner ring (playing field)
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.5, ry * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16,185,129,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(16,185,129,0.05)';
    ctx.fill();

    // Pitch
    ctx.fillStyle = 'rgba(16,185,129,0.15)';
    ctx.fillRect(cx - 15, cy - 30, 30, 60);

    // Heat zones
    const heatPoints = [
        { x: cx - rx * 0.6, y: cy - ry * 0.3, r: 60, intensity: 0.8 }, // North
        { x: cx + rx * 0.5, y: cy + ry * 0.2, r: 55, intensity: 0.9 }, // South
        { x: cx + rx * 0.1, y: cy - ry * 0.7, r: 50, intensity: 0.6 }, // East
        { x: cx - rx * 0.3, y: cy + ry * 0.65, r: 45, intensity: 0.5 }, // West
        { x: cx + rx * 0.7, y: cy - ry * 0.5, r: 35, intensity: 0.7 }, // Gate C cluster
        { x: cx - rx * 0.5, y: cy + ry * 0.5, r: 30, intensity: 0.3 }, // VIP
    ];

    heatPoints.forEach(hp => {
        const gradient = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, hp.r);
        if (hp.intensity > 0.7) {
            gradient.addColorStop(0, `rgba(244,63,94,${hp.intensity * 0.5})`);
            gradient.addColorStop(0.5, `rgba(245,158,11,${hp.intensity * 0.3})`);
            gradient.addColorStop(1, 'rgba(245,158,11,0)');
        } else if (hp.intensity > 0.4) {
            gradient.addColorStop(0, `rgba(245,158,11,${hp.intensity * 0.4})`);
            gradient.addColorStop(0.5, `rgba(16,185,129,${hp.intensity * 0.2})`);
            gradient.addColorStop(1, 'rgba(16,185,129,0)');
        } else {
            gradient.addColorStop(0, `rgba(16,185,129,${hp.intensity * 0.4})`);
            gradient.addColorStop(1, 'rgba(16,185,129,0)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(hp.x - hp.r, hp.y - hp.r, hp.r * 2, hp.r * 2);
    });

    // Zone labels
    const labels = [
        { text: "North Stand", x: cx - rx * 0.6, y: cy - ry * 0.3 },
        { text: "South Stand", x: cx + rx * 0.5, y: cy + ry * 0.3 },
        { text: "East Pavilion", x: cx + rx * 0.15, y: cy - ry * 0.8 },
        { text: "West Gallery", x: cx - rx * 0.1, y: cy + ry * 0.8 },
        { text: "VIP", x: cx - rx * 0.55, y: cy + ry * 0.55 }
    ];

    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach(l => {
        // Background
        const metrics = ctx.measureText(l.text);
        const tw = metrics.width + 12;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(l.x - tw / 2, l.y - 8, tw, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#e0e1e5';
        ctx.fillText(l.text, l.x, l.y + 4);
    });

    // Gates
    const gatePositions = [
        { label: "A", x: cx - rx, y: cy },
        { label: "B", x: cx - rx * 0.7, y: cy - ry * 0.7 },
        { label: "C", x: cx + rx * 0.7, y: cy - ry * 0.7 },
        { label: "D", x: cx + rx, y: cy },
        { label: "E", x: cx + rx * 0.7, y: cy + ry * 0.7 },
        { label: "F", x: cx - rx * 0.7, y: cy + ry * 0.7 }
    ];

    gatePositions.forEach(g => {
        const gate = STADIUM_DATA.gates.find(gt => gt.id === g.label);
        const color = gate?.status === 'open' ? '#10b981' : gate?.status === 'busy' ? '#f59e0b' : '#f43f5e';

        ctx.beginPath();
        ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(g.label, g.x, g.y + 3);
    });
}

// ============ RENDER: CROWD FLOW ============
function renderCrowdFlow() {
    renderGatesGrid();
    renderRoutesList();
    setTimeout(() => drawStadiumMap(), 200);
}

function renderGatesGrid() {
    const container = document.getElementById('gatesGrid');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.gates.map(g => `
        <div class="gate-item">
            <div class="gate-dot ${g.status}"></div>
            <div class="gate-info">
                <div class="gate-name">${g.name}</div>
                <div class="gate-status-text">${g.status.charAt(0).toUpperCase() + g.status.slice(1)}</div>
            </div>
            <div class="gate-flow">${g.flow}/min</div>
        </div>
    `).join('');
}

function renderRoutesList() {
    const container = document.getElementById('routesList');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.routes.map(r => `
        <div class="route-item">
            <span class="route-badge ${r.badge}">${r.badge}</span>
            <span class="route-from-to">${r.from} → ${r.to}</span>
            <span class="route-eta-text">${r.eta}</span>
        </div>
    `).join('');
}

function drawStadiumMap() {
    const canvas = document.getElementById('stadiumMapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const rx = w * 0.4, ry = h * 0.4;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(99,102,241,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Stadium rings
    for (let i = 3; i >= 0; i--) {
        const scale = 1 - i * 0.15;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx * scale, ry * scale, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(99,102,241,${0.1 + i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Field
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16,185,129,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16,185,129,0.2)';
    ctx.stroke();

    // Crowd dots
    const dotCount = 200;
    for (let i = 0; i < dotCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.4 + Math.random() * 0.55;
        const x = cx + Math.cos(angle) * rx * dist;
        const y = cy + Math.sin(angle) * ry * dist;

        const density = Math.random();
        let color;
        if (density > 0.7) color = 'rgba(244,63,94,0.6)';
        else if (density > 0.4) color = 'rgba(245,158,11,0.5)';
        else color = 'rgba(16,185,129,0.4)';

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    // Flow arrows
    const arrows = [
        { x1: cx - rx * 0.9, y1: cy, x2: cx - rx * 0.6, y2: cy, color: '#10b981' },
        { x1: cx + rx * 0.6, y1: cy - ry * 0.6, x2: cx + rx * 0.3, y2: cy - ry * 0.3, color: '#f59e0b' },
    ];

    arrows.forEach(a => {
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.lineTo(a.x2, a.y2);
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
        ctx.beginPath();
        ctx.moveTo(a.x2, a.y2);
        ctx.lineTo(a.x2 - 8 * Math.cos(angle - 0.4), a.y2 - 8 * Math.sin(angle - 0.4));
        ctx.lineTo(a.x2 - 8 * Math.cos(angle + 0.4), a.y2 - 8 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = a.color;
        ctx.fill();
    });

    // Center label
    ctx.font = '10px Inter';
    ctx.fillStyle = 'rgba(16,185,129,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYING FIELD', cx, cy + 3);
}

// ============ RENDER: ZERO-WAIT ============
function renderZeroWait() {
    renderStallsGrid();
    renderRestroomGrid();
    initPreorderSystem();
}

function renderStallsGrid() {
    const container = document.getElementById('stallsGrid');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.foodStalls.map(s => {
        const badgeClass = s.wait === 0 ? 'zero' : s.wait <= 3 ? 'short' : 'long';
        const badgeText = s.wait === 0 ? '0 min ✨' : s.wait + ' min';
        const barColor = s.wait === 0 ? '#10b981' : s.wait <= 3 ? '#f59e0b' : '#f43f5e';
        const barPct = (s.queue / s.maxQueue) * 100;
        return `
            <div class="stall-card" data-stall="${s.id}">
                <div class="stall-header">
                    <span class="stall-emoji">${s.emoji}</span>
                    <span class="stall-name">${s.name}</span>
                </div>
                <div style="margin-bottom:6px">
                    <span class="stall-wait-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="stall-meta">
                    <span>${s.queue} in queue</span>
                    <span>${s.type}</span>
                </div>
                <div class="stall-queue-bar"><div class="stall-queue-fill" style="width:${barPct}%;background:${barColor}"></div></div>
            </div>
        `;
    }).join('');
}

function renderRestroomGrid() {
    const container = document.getElementById('restroomGrid');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.restrooms.map(r => {
        const pct = Math.round((r.occupancy / r.capacity) * 100);
        const statusClass = pct < 50 ? 'available' : pct < 80 ? 'moderate' : 'busy';
        const statusText = pct < 50 ? 'Available' : pct < 80 ? 'Moderate' : 'Busy';
        return `
            <div class="restroom-item">
                <div class="restroom-icon">🚻</div>
                <div class="restroom-info">
                    <div class="restroom-name">${r.name}</div>
                    <div class="restroom-occ">${r.occupancy}/${r.capacity} · ${r.floor} Floor</div>
                </div>
                <span class="restroom-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
}

function initPreorderSystem() {
    const stallSelect = document.getElementById('preorderStall');
    const itemSelect = document.getElementById('preorderItem');
    const suggestText = document.getElementById('aiSuggestText');
    const btnPreorder = document.getElementById('btnPreorder');

    if (!stallSelect) return;

    // Populate stalls
    STADIUM_DATA.foodStalls.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.emoji} ${s.name} (${s.wait} min wait)`;
        stallSelect.appendChild(opt);
    });

    stallSelect.addEventListener('change', () => {
        const stall = STADIUM_DATA.foodStalls.find(s => s.id == stallSelect.value);
        if (!stall) return;

        itemSelect.innerHTML = '<option value="">Select item...</option>';
        stall.items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            itemSelect.appendChild(opt);
        });

        const bestTime = stall.wait <= 1 ? 'Order now! Minimal wait.' : `Best pickup in ${5 + stall.wait} min (after current queue clears).`;
        suggestText.textContent = `${stall.name}: ${bestTime} AI estimated preparation: ${2 + Math.floor(Math.random() * 3)} min.`;
    });

    btnPreorder.addEventListener('click', () => {
        const stallId = stallSelect.value;
        const item = itemSelect.value;
        if (!stallId || !item) {
            showToast('⚠️', 'Incomplete Order', 'Please select a stall and item.');
            return;
        }

        const stall = STADIUM_DATA.foodStalls.find(s => s.id == stallId);
        state.orderCounter++;
        const eta = 2 + stall.wait + Math.floor(Math.random() * 3);

        const order = {
            id: state.orderCounter,
            stall: stall.name,
            item: item,
            eta: eta,
            status: 'preparing',
            time: Date.now()
        };

        state.activeOrders.push(order);
        renderActiveOrders();
        showToast('✅', 'Order Placed!', `${item} from ${stall.name} — Ready in ~${eta} min`);

        // Auto mark ready after some time
        setTimeout(() => {
            order.status = 'ready';
            renderActiveOrders();
            showToast('🔔', 'Order Ready!', `Your ${item} from ${stall.name} is ready for pickup!`);
        }, Math.min(eta * 3000, 15000));

        stallSelect.value = '';
        itemSelect.innerHTML = '<option value="">Select item...</option>';
    });
}

function renderActiveOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    if (state.activeOrders.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-tertiary);font-size:0.78rem;">No active orders</div>';
        return;
    }

    container.innerHTML = state.activeOrders.map(o => `
        <div class="order-item">
            <div class="order-status-dot ${o.status}"></div>
            <div class="order-info">
                <div class="order-name">${o.item}</div>
                <div class="order-detail">${o.stall}</div>
            </div>
            <div class="order-eta">${o.status === 'ready' ? '✅ Ready' : `~${o.eta} min`}</div>
        </div>
    `).join('');
}

// ============ RENDER: NAVIGATION ============
function renderNavigation() {
    renderNavQuickLinks();
    setTimeout(() => drawNavMap(), 200);
}

function renderNavQuickLinks() {
    const container = document.getElementById('navQuickLinks');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.navLinks.map(l => `
        <div class="nav-quick-link" onclick="navigateTo('${l.name}')">
            <span class="nql-icon">${l.icon}</span>
            <div class="nql-info">
                <div class="nql-name">${l.name}</div>
                <div class="nql-dist">${l.dist}</div>
            </div>
            <span class="nql-time">${l.time}</span>
        </div>
    `).join('');
}

function navigateTo(name) {
    const routeResult = document.getElementById('navRouteResult');
    if (routeResult) {
        routeResult.classList.remove('hidden');
        document.getElementById('routeDest').textContent = name;
        document.getElementById('routeEta').textContent = '~' + (Math.floor(Math.random() * 3) + 1) + ' min';

        const steps = [
            'Head straight for 15 meters',
            'Turn right at the corridor junction',
            'Continue past the food court',
            `Arrive at ${name}`
        ];

        document.getElementById('routeSteps').innerHTML = steps.map((s, i) => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-primary)">
                <span style="width:24px;height:24px;border-radius:50%;background:var(--accent-light);color:var(--accent-secondary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">${i + 1}</span>
                <span style="font-size:0.78rem">${s}</span>
            </div>
        `).join('');
    }

    // Update AR preview
    document.getElementById('arDestination').textContent = name;
    document.getElementById('arDistance').textContent = Math.floor(Math.random() * 80 + 20) + 'm ahead';

    showToast('🧭', 'Navigation Started', `Routing you to ${name}`);
}

function drawNavMap() {
    const canvas = document.getElementById('navMapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const w = canvas.width, h = canvas.height;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Floor plan grid
    ctx.strokeStyle = 'rgba(99,102,241,0.04)';
    for (let x = 0; x < w; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Stadium outline
    const cx = w / 2, cy = h / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99,102,241,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner corridors
    ctx.strokeStyle = 'rgba(99,102,241,0.1)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.32, h * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    // POI markers
    const pois = [
        { emoji: "🍔", x: cx - w * 0.25, y: cy - h * 0.15, label: "Food Court A" },
        { emoji: "🍕", x: cx + w * 0.2, y: cy - h * 0.25, label: "Food Court B" },
        { emoji: "🚻", x: cx - w * 0.15, y: cy + h * 0.28, label: "Restroom" },
        { emoji: "🏥", x: cx + w * 0.3, y: cy + h * 0.1, label: "Medical" },
        { emoji: "🛍️", x: cx - w * 0.32, y: cy + h * 0.05, label: "Merch Store" },
        { emoji: "📍", x: cx + w * 0.05, y: cy - h * 0.1, label: "You Are Here" },
    ];

    pois.forEach(p => {
        // Glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 20);
        glow.addColorStop(0, 'rgba(99,102,241,0.15)');
        glow.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - 20, p.y - 20, 40, 40);

        // Pin
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, p.x, p.y + 5);

        // Label
        ctx.font = '9px Inter';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(p.label, p.x, p.y + 20);
    });

    // You-are-here pulse
    const youX = cx + w * 0.05, youY = cy - h * 0.1;
    ctx.beginPath();
    ctx.arc(youX, youY - 12, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6,182,212,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Navigation path (dashed)
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(youX, youY);
    ctx.lineTo(cx - w * 0.1, cy);
    ctx.lineTo(cx - w * 0.25, cy - h * 0.15);
    ctx.strokeStyle = 'rgba(6,182,212,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // POI pins in overlay
    const poiList = document.getElementById('navPoiList');
    if (poiList) {
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#a855f7'];
        poiList.innerHTML = pois.map((p, i) => `
            <div class="poi-pin">
                <div class="poi-dot" style="background:${colors[i]}"></div>
                ${p.label}
            </div>
        `).join('');
    }
}

// ============ RENDER: FAN EXPERIENCE ============
function renderFanExperience() {
    renderRecommendations();
    renderQuests();
    renderMerchandise();
    startMatchUpdates();
}

function renderRecommendations() {
    const container = document.getElementById('recList');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.recommendations.map(r => `
        <div class="rec-item">
            <div class="rec-icon">${r.icon}</div>
            <div class="rec-info">
                <div class="rec-title">${r.title}</div>
                <div class="rec-desc">${r.desc}</div>
            </div>
            <span class="rec-action">${r.action}</span>
        </div>
    `).join('');
}

function renderQuests() {
    const container = document.getElementById('gamiQuests');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.quests.map(q => `
        <div class="quest-item">
            <div class="quest-check ${q.done ? 'done' : ''}">${q.done ? '✓' : ''}</div>
            <div class="quest-info">
                <div class="quest-name">${q.name}</div>
                <div class="quest-reward">${q.reward}</div>
            </div>
            <span class="quest-xp">${q.done ? 'Completed' : 'In Progress'}</span>
        </div>
    `).join('');
}

function renderMerchandise() {
    const container = document.getElementById('merchGrid');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.merchandise.map(m => `
        <div class="merch-item">
            <div class="merch-emoji">${m.emoji}</div>
            <div class="merch-name">${m.name}</div>
            <div class="merch-price">${m.price}</div>
            <div class="merch-dist">${m.dist}</div>
        </div>
    `).join('');
}

function startMatchUpdates() {
    const scores = [
        { score: "245 / 4", info: "35.2 Overs", status: "India batting" },
        { score: "251 / 4", info: "36.0 Overs", status: "India batting" },
        { score: "258 / 4", info: "36.4 Overs", status: "BOUNDARY! 4 runs" },
        { score: "264 / 5", info: "37.1 Overs", status: "WICKET! Caught behind" },
        { score: "270 / 5", info: "38.0 Overs", status: "India batting" },
        { score: "278 / 5", info: "38.3 Overs", status: "SIX! Over the stands! 🎉" },
    ];

    let idx = 0;
    setInterval(() => {
        idx = (idx + 1) % scores.length;
        const s = scores[idx];

        const scoreEl = document.getElementById('matchScore');
        const infoEl = document.getElementById('matchInfo');
        const statusEl = document.getElementById('matchStatus');

        if (scoreEl) scoreEl.textContent = s.score;
        if (infoEl) infoEl.textContent = s.info;
        if (statusEl) {
            statusEl.textContent = s.status;
            statusEl.style.color = s.status.includes('WICKET') ? '#f43f5e' :
                                     s.status.includes('SIX') || s.status.includes('BOUNDARY') ? '#10b981' :
                                     '#10b981';
        }
    }, 8000);
}

// ============ RENDER: EMERGENCY ============
function renderEmergency() {
    renderAnomalies();
    renderEvacRoutes();
    renderMedicalCases();
    initEmergencyActions();
    setTimeout(() => drawEvacMap(), 200);
}

function renderAnomalies() {
    const container = document.getElementById('anomalyList');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.anomalies.map(a => `
        <div class="anomaly-item ${a.level}">
            <div class="anomaly-level ${a.level}"></div>
            <div class="anomaly-info">
                <div class="anomaly-title">${a.title}</div>
                <div class="anomaly-desc">${a.desc}</div>
            </div>
            <span class="anomaly-confidence">${a.confidence}</span>
        </div>
    `).join('');
}

function renderEvacRoutes() {
    const container = document.getElementById('evacRoutes');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.evacRoutes.map(r => `
        <div class="evac-route">
            <div class="evac-route-color" style="background:${r.color}"></div>
            <span style="flex:1;font-size:0.78rem">${r.name}</span>
            <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-tertiary)">${r.capacity}</span>
        </div>
    `).join('');
}

function renderMedicalCases() {
    const container = document.getElementById('medicalList');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.medicalCases.map(m => `
        <div class="medical-item">
            <div class="medical-priority ${m.priority}"></div>
            <div class="medical-info">
                <div class="medical-case">${m.case}</div>
                <div class="medical-loc">${m.loc}</div>
            </div>
            <span class="medical-time">${m.time}</span>
        </div>
    `).join('');
}

function initEmergencyActions() {
    document.getElementById('btnSimEvac')?.addEventListener('click', () => {
        if (state.evacSimulating) return;
        state.evacSimulating = true;

        const statusEl = document.getElementById('emergencyStatus');
        statusEl.innerHTML = `
            <div class="em-status-icon danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="em-status-info">
                <h2 style="color:var(--rose)">⚠️ EVACUATION SIMULATION ACTIVE</h2>
                <p>All routes activated — Estimated full evacuation: 8 minutes</p>
            </div>
        `;

        showToast('🚨', 'Evacuation Simulation', 'All evacuation routes activated. Smart routing engaged.');

        setTimeout(() => {
            statusEl.innerHTML = `
                <div class="em-status-icon safe">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="em-status-info">
                    <h2>All Clear</h2>
                    <p>Evacuation simulation complete — All systems normal</p>
                </div>
            `;
            state.evacSimulating = false;
            showToast('✅', 'Simulation Complete', 'All zones cleared successfully in simulated time.');
        }, 8000);
    });

    document.getElementById('btnBroadcast')?.addEventListener('click', () => {
        const msg = document.getElementById('commsMessage').value;
        if (!msg.trim()) {
            showToast('⚠️', 'Empty Message', 'Please type a broadcast message.');
            return;
        }
        showToast('📢', 'Message Broadcast', `"${msg.substring(0, 50)}..." sent to all active channels.`);
        document.getElementById('commsMessage').value = '';
    });
}

function drawEvacMap() {
    const canvas = document.getElementById('evacMapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Stadium
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99,102,241,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Evacuation routes
    const routes = [
        { x: cx - w * 0.4, y: cy, color: '#10b981', label: 'A/B' },
        { x: cx + w * 0.4, y: cy, color: '#3b82f6', label: 'C/D' },
        { x: cx, y: cy + h * 0.38, color: '#f59e0b', label: 'E' },
        { x: cx, y: cy - h * 0.38, color: '#a855f7', label: 'VIP' }
    ];

    routes.forEach(r => {
        // Route line
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(r.x, r.y);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        // Exit marker
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        ctx.font = 'bold 7px Inter';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(r.label, r.x, r.y + 3);
    });

    // Center
    ctx.font = '9px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('EVACUATION MAP', cx, cy + 3);
}

// ============ NOTIFICATIONS ============
function initNotifications() {
    const btnNotif = document.getElementById('btnNotifications');
    const panel = document.getElementById('notifPanel');
    const closeBtn = document.getElementById('notifClose');

    btnNotif?.addEventListener('click', () => {
        state.notifPanelOpen = !state.notifPanelOpen;
        panel.classList.toggle('hidden', !state.notifPanelOpen);

        if (state.notifPanelOpen) {
            renderNotifList();
        }
    });

    closeBtn?.addEventListener('click', () => {
        state.notifPanelOpen = false;
        panel.classList.add('hidden');
    });
}

function renderNotifList() {
    const container = document.getElementById('notifList');
    if (!container) return;

    container.innerHTML = STADIUM_DATA.notifications.map(n => `
        <div class="notif-item">
            <div class="notif-icon">${n.icon}</div>
            <div class="notif-content">
                <div class="notif-title-text">${n.title}</div>
                <div class="notif-desc">${n.desc}</div>
                <div class="notif-time">${n.time}</div>
            </div>
        </div>
    `).join('');
}

// ============ TOASTS ============
function showToast(icon, title, message, duration = 5000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing');setTimeout(()=>this.parentElement.remove(),300)">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============ LIVE UPDATES ============
function startLiveUpdates() {
    // Update crowd numbers
    setInterval(() => {
        // Fluctuate attendees
        const delta = Math.floor(Math.random() * 200) - 80;
        STADIUM_DATA.currentAttendees = Math.max(40000, Math.min(65000, STADIUM_DATA.currentAttendees + delta));

        const el = document.getElementById('kpiAttendeesVal');
        if (el) el.textContent = STADIUM_DATA.currentAttendees.toLocaleString();

        // Update crowd flow numbers
        const entering = 100 + Math.floor(Math.random() * 60);
        const exiting = 30 + Math.floor(Math.random() * 40);
        const ent = document.getElementById('crowdEntering');
        const ext = document.getElementById('crowdExiting');
        const tot = document.getElementById('crowdTotal');
        if (ent) ent.textContent = '+' + entering;
        if (ext) ext.textContent = '-' + exiting;
        if (tot) tot.textContent = STADIUM_DATA.currentAttendees.toLocaleString();

        // Update density
        const density = Math.round((STADIUM_DATA.currentAttendees / STADIUM_DATA.capacity) * 100);
        const den = document.getElementById('crowdDensity');
        if (den) den.textContent = density + '%';
    }, 5000);

    // Update wait times
    setInterval(() => {
        STADIUM_DATA.foodStalls.forEach(s => {
            s.wait = Math.max(0, s.wait + Math.floor(Math.random() * 3) - 1);
            s.queue = Math.max(0, Math.min(s.maxQueue, s.queue + Math.floor(Math.random() * 5) - 2));
        });

        STADIUM_DATA.restrooms.forEach(r => {
            r.occupancy = Math.max(5, Math.min(r.capacity, r.occupancy + Math.floor(Math.random() * 7) - 3));
            r.wait = Math.max(0, Math.round((r.occupancy / r.capacity) * 5));
        });

        // Update avg wait
        const avgWait = STADIUM_DATA.foodStalls.reduce((a, s) => a + s.wait, 0) / STADIUM_DATA.foodStalls.length;
        STADIUM_DATA.avgWait = parseFloat(avgWait.toFixed(1));
        const el = document.getElementById('kpiAvgWaitVal');
        if (el) el.textContent = STADIUM_DATA.avgWait;

        // Update ZW summary
        const zwAvg = document.getElementById('zwAvgWait');
        if (zwAvg) zwAvg.textContent = STADIUM_DATA.avgWait;

        const zwOrders = document.getElementById('zwOrders');
        if (zwOrders) zwOrders.textContent = 300 + Math.floor(Math.random() * 100);

        // Re-render if visible
        if (state.currentView === 'zerowait') {
            renderStallsGrid();
            renderRestroomGrid();
        }

        if (state.currentView === 'command') {
            renderQueueList();
        }
    }, 7000);

    // Update zones
    setInterval(() => {
        STADIUM_DATA.zones.forEach(z => {
            const change = Math.floor(Math.random() * 400) - 150;
            z.current = Math.max(z.capacity * 0.3, Math.min(z.capacity * 0.95, z.current + change));
        });

        if (state.currentView === 'command') {
            renderZoneBars();
        }
    }, 10000);

    // Random alerts
    setInterval(() => {
        const randomAlerts = [
            { type: "info", icon: "📊", text: `Crowd density update: Zone ${['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)]} at ${60 + Math.floor(Math.random() * 30)}% capacity` },
            { type: "success", icon: "✅", text: `AI route optimization saved ${Math.floor(Math.random() * 200) + 100} fans an average of ${Math.floor(Math.random() * 3) + 1} minutes` },
            { type: "info", icon: "🍔", text: `Food stall "${STADIUM_DATA.foodStalls[Math.floor(Math.random() * STADIUM_DATA.foodStalls.length)].name}" queue clear — 0 min wait` },
            { type: "warning", icon: "⚠️", text: `Gate ${['A','B','C','D','E'][Math.floor(Math.random() * 5)]} flow increasing — Smart routing adjusting` }
        ];

        const alert = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
        alert.time = 'Just now';
        STADIUM_DATA.alerts.unshift(alert);
        if (STADIUM_DATA.alerts.length > 10) STADIUM_DATA.alerts.pop();

        if (state.currentView === 'command') {
            renderAlertsFeed();
        }
    }, 15000);

    // Redraw canvases periodically
    setInterval(() => {
        if (state.currentView === 'command') drawHeatmap();
        if (state.currentView === 'crowd') drawStadiumMap();
    }, 20000);
}
