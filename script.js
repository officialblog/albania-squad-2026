/**
 * ==========================================================================
 * ALBANIA SQUAD 2026 | KSAMIL & TIRANA — INTERACTIVE SCRIPTS v2
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initDayFilters();
    initBudgetCalculator();
    initCurrencyConverter();
    initChecklist();
    initScrollReveal();
    initNavHighlight();
    initMobileNav();
});

/* ──────────────────────────────────────────────────────────────────────────
   1. COUNTDOWN AL DECOLLO DA ROMA CIAMPINO (3 AGOSTO 2026, 07:40)
   ────────────────────────────────────────────────────────────────────────── */
function initCountdown() {
    const targetDate = new Date('2026-08-03T07:40:00+02:00').getTime();

    const daysEl    = document.getElementById('days');
    const hoursEl   = document.getElementById('hours');
    const minsEl    = document.getElementById('minutes');
    const secsEl    = document.getElementById('seconds');
    const titleEl   = document.querySelector('.countdown-title');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function updateTimer() {
        const now        = Date.now();
        const difference = targetDate - now;

        if (difference <= 0) {
            daysEl.textContent  = '00';
            hoursEl.textContent = '00';
            minsEl.textContent  = '00';
            secsEl.textContent  = '00';
            if (titleEl) {
                titleEl.innerHTML = '🇦🇱 SI VOLA IN ALBANIA! BUON VIAGGIO SQUAD!';
            }
            return;
        }

        const days    = Math.floor(difference / 86_400_000);
        const hours   = Math.floor((difference % 86_400_000) / 3_600_000);
        const minutes = Math.floor((difference % 3_600_000)  / 60_000);
        const seconds = Math.floor((difference % 60_000)     / 1_000);

        daysEl.textContent  = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent  = String(minutes).padStart(2, '0');
        secsEl.textContent  = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/* ──────────────────────────────────────────────────────────────────────────
   2. FILTRO GIORNO PER GIORNO NELL'ITINERARIO
      (con animazione smooth e scroll automatico al primo card)
   ────────────────────────────────────────────────────────────────────────── */
function initDayFilters() {
    const buttons = document.querySelectorAll('.day-btn');
    const cards   = document.querySelectorAll('.day-card');

    if (!buttons.length || !cards.length) return;

    // Click sul pulsante attivo già selezionato non fa nulla
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isAlreadyActive = btn.classList.contains('active');
            if (isAlreadyActive) return;

            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedDay = btn.getAttribute('data-day');
            let firstVisible  = null;

            cards.forEach(card => {
                const cardDay = card.getAttribute('data-day');
                const match   = selectedDay === 'all' || cardDay === selectedDay;

                if (match) {
                    card.style.display  = 'flex';
                    card.style.opacity  = '0';
                    card.style.transform = 'translateY(12px)';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                            card.style.opacity    = '1';
                            card.style.transform  = 'translateY(0)';
                        });
                    });
                    if (!firstVisible) firstVisible = card;
                } else {
                    card.style.display = 'none';
                }
            });

            // Scroll verso l'itinerary grid su mobile
            if (firstVisible && window.innerWidth < 860) {
                setTimeout(() => {
                    const top = firstVisible.parentElement.getBoundingClientRect().top + window.scrollY - 72;
                    window.scrollTo({ top, behavior: 'smooth' });
                }, 50);
            }
        });
    });
}

/* ──────────────────────────────────────────────────────────────────────────
   3. RIPARTITORE DI SPESE E BUDGET SQUAD
      Calcola in modo preciso tenendo conto dei 2 periodi (8 pers / 7 pers)
   ────────────────────────────────────────────────────────────────────────── */
function initBudgetCalculator() {
    const numPeopleSelect  = document.getElementById('num-people');
    const taxiInput        = document.getElementById('taxi-cost');
    const hotelInput       = document.getElementById('hotel-cost');
    const activitiesInput  = document.getElementById('activities-cost');
    const foodInput        = document.getElementById('food-budget');
    const resultValue      = document.getElementById('per-person-result');
    const breakdownText    = document.getElementById('breakdown-text');

    const inputs = [numPeopleSelect, taxiInput, hotelInput, activitiesInput, foodInput];
    if (!inputs.every(Boolean) || !resultValue || !breakdownText) return;

    // Valori default hotel per ciascun gruppo
    const HOTEL_DEFAULT = {
        7: 850,   // 700€ (Ksamil 7–9 ago) + 150€ (Tirana 9–10 ago)
        8: 1800   // 1800€ (Ksamil 3–7 ago)
    };

    // Aggiorna il campo hotel e il placeholder quando cambia il numero persone
    function updateHotelDefault() {
        const people = parseInt(numPeopleSelect.value, 10) || 7;
        const def    = HOTEL_DEFAULT[people] ?? HOTEL_DEFAULT[7];
        hotelInput.value       = def;
        hotelInput.placeholder = `Es. ${def}`;
    }

    function calculate() {
        const people              = parseInt(numPeopleSelect.value, 10) || 7;
        const taxiTotal           = parseFloat(taxiInput.value)        || 600;
        const hotelTotal          = parseFloat(hotelInput.value)       || HOTEL_DEFAULT[people] ?? 850;
        const activitiesPerPerson = parseFloat(activitiesInput.value)  || 0;
        const foodDaily           = parseFloat(foodInput.value)        || 0;

        let hotelSharePerPerson = 0;
        let taxiSharePerPerson  = 0;
        let daysCount           = 7;
        let hotelDetail         = '';

        if (people === 8) {
            // Amico che fa solo 3–7 agosto (4 notti a Ksamil, solo andata in taxi)
            daysCount           = 4;
            hotelSharePerPerson = hotelTotal / 8;           // es. 1800/8 = 225€
            taxiSharePerPerson  = (taxiTotal / 2) / 8;     // solo andata
            hotelDetail         = `Hotel 3–7 Ago Ksamil (${Math.round(hotelTotal / 8)}€/pers)`;
        } else {
            // 7 persone: viaggio completo 7 notti (3–10 agosto)
            daysCount           = 7;
            // Il campo hotel contiene 850 = 700+150 → quota per 7 persone
            hotelSharePerPerson = hotelTotal / 7;
            // Taxi A/R: andata (300/8) + ritorno (300/7)
            taxiSharePerPerson  = ((taxiTotal / 2) / 8) + ((taxiTotal / 2) / 7);
            hotelDetail         = `Hotel 7–10 Ago (700€ Ksamil + 150€ Tirana) → ${Math.round(hotelTotal / 7)}€/pers`;
        }

        const foodTotalPerPerson = foodDaily * daysCount;
        const totalPerPerson     = hotelSharePerPerson + taxiSharePerPerson + activitiesPerPerson + foodTotalPerPerson;

        resultValue.textContent = `~ ${Math.round(totalPerPerson)} €`;
        breakdownText.innerHTML = `
            <strong>Dettaglio (${daysCount} notti · ${people} persone):</strong><br>
            ${hotelDetail} + Taxi (${Math.round(taxiSharePerPerson)}€) +
            Attività (${activitiesPerPerson}€) + Cibo/Drink (${Math.round(foodTotalPerPerson)}€)
        `;

        // Aggiorna aria per screen reader
        const resultBox = resultValue.closest('[role="status"]');
        if (resultBox) resultBox.setAttribute('aria-label', `Quota stimata: circa ${Math.round(totalPerPerson)} euro`);
    }

    // Quando cambia il numero persone → aggiorna il campo hotel poi ricalcola
    numPeopleSelect.addEventListener('change', () => {
        updateHotelDefault();
        calculate();
    });

    // Per gli altri input basta ricalcolare
    [taxiInput, hotelInput, activitiesInput, foodInput].forEach(input => {
        input.addEventListener('input',  calculate);
        input.addEventListener('change', calculate);
    });

    // Inizializzazione
    updateHotelDefault();
    calculate();
}

/* ──────────────────────────────────────────────────────────────────────────
   4. CONVERTITORE ISTANTANEO EURO (€) ↔ LEK ALBANESE
   ────────────────────────────────────────────────────────────────────────── */
function initCurrencyConverter() {
    const euroInput = document.getElementById('euro-input');
    const lekInput  = document.getElementById('lek-input');
    const chipBtns  = document.querySelectorAll('.chip-btn');
    const swapBtn   = document.querySelector('.currency-swap-icon');

    const RATE = 100; // 1 EUR = 100 LEK (tasso standard in Albania)

    if (!euroInput || !lekInput) return;

    euroInput.addEventListener('input', () => {
        const v = parseFloat(euroInput.value) || 0;
        lekInput.value = Math.round(v * RATE);
    });

    lekInput.addEventListener('input', () => {
        const v = parseFloat(lekInput.value) || 0;
        euroInput.value = (v / RATE).toFixed(2);
    });

    // Chips conversioni rapide — con feedback visivo
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const eur = parseFloat(btn.getAttribute('data-eur')) || 0;
            euroInput.value = eur;
            lekInput.value  = Math.round(eur * RATE);

            // Pulse effect sull'input
            [euroInput, lekInput].forEach(el => {
                el.classList.add('pulse-once');
                el.addEventListener('animationend', () => el.classList.remove('pulse-once'), { once: true });
            });
        });
    });

    // Tasto swap — scambia i valori euro ↔ lek e anima il bottone
    if (swapBtn) {
        const doSwap = () => {
            const currentEur = parseFloat(euroInput.value) || 10;
            const newEur = currentEur === 10 ? 50 : (currentEur === 50 ? 100 : 10);
            euroInput.value = newEur;
            lekInput.value  = newEur * RATE;
        };

        swapBtn.addEventListener('click', doSwap);
        swapBtn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doSwap(); }
        });
    }
}

/* ──────────────────────────────────────────────────────────────────────────
   5. CHECKLIST INTERATTIVA CON SALVATAGGIO IN LOCALSTORAGE
   ────────────────────────────────────────────────────────────────────────── */
function initChecklist() {
    const checkboxes   = document.querySelectorAll('#checklist-items input[type="checkbox"]');
    const progressFill = document.getElementById('checklist-progress');
    const progressText = document.getElementById('progress-text');
    const progressWrap = progressFill?.parentElement;
    const resetBtn     = document.getElementById('reset-chk');

    if (!checkboxes.length || !progressFill || !progressText) return;

    const STORAGE_KEY = 'albania_squad_checklist_2026';

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            checkboxes.forEach(chk => {
                if (saved[chk.getAttribute('data-id')]) chk.checked = true;
            });
        } catch (e) {
            console.warn('localStorage non disponibile per la checklist', e);
        }
        updateProgress();
    }

    function saveState() {
        const state = {};
        checkboxes.forEach(chk => {
            state[chk.getAttribute('data-id')] = chk.checked;
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('localStorage non disponibile', e);
        }
        updateProgress();
    }

    function updateProgress() {
        const total      = checkboxes.length;
        const checked    = [...checkboxes].filter(c => c.checked).length;
        const percentage = Math.round((checked / total) * 100);

        progressFill.style.width = `${percentage}%`;

        if (progressWrap) progressWrap.setAttribute('aria-valuenow', percentage);

        if (percentage === 100) {
            progressText.innerHTML = '🎉 100% PRONTI PER PARTIRE! 🇦🇱';
        } else {
            progressText.textContent = `${percentage}% Completato (${checked}/${total})`;
        }
    }

    checkboxes.forEach(chk => chk.addEventListener('change', saveState));

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            checkboxes.forEach(chk => (chk.checked = false));
            saveState();
        });
    }

    loadState();
}

/* ──────────────────────────────────────────────────────────────────────────
   6. SCROLL REVEAL — anima le card e sezioni all'entrata nel viewport
   ────────────────────────────────────────────────────────────────────────── */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Passo 1: aggiungi js-loaded al body PRIMA di nascondere qualsiasi cosa.
    // Il CSS nasconde .reveal solo se body.js-loaded esiste — fallback sicuro.
    document.body.classList.add('js-loaded');

    // Passo 2: mostra subito gli elementi già nel viewport (critico su iOS al caricamento)
    function revealNow(el) {
        el.classList.add('visible');
    }

    // Passo 3: Failsafe — dopo 1.5s mostra tutto ciò che è ancora nascosto
    // (protegge da qualsiasi bug dell'Observer su Safari)
    const failsafe = setTimeout(() => {
        reveals.forEach(el => { if (!el.classList.contains('visible')) revealNow(el); });
    }, 1500);

    if (!('IntersectionObserver' in window)) {
        // Browser senza supporto → mostra tutto subito
        reveals.forEach(revealNow);
        clearTimeout(failsafe);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealNow(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0,
        // rootMargin positivo: inizia ad osservare 60px prima che l'elemento entri nel viewport
        rootMargin: '60px 0px 60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────────────────────
   7. NAVBAR SCROLL SHADOW — aggiunge un'ombra alla navbar quando si scrolla
   ────────────────────────────────────────────────────────────────────────── */
function initNavHighlight() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
        if (window.scrollY > 40) {
            navbar.style.boxShadow = '0 4px 32px rgba(0,0,0,0.5)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ──────────────────────────────────────────────────────────────────────────
   8. MOBILE BOTTOM NAV — evidenzia la voce attiva in base alla sezione visibile
   ────────────────────────────────────────────────────────────────────────── */
function initMobileNav() {
    const navLinks = document.querySelectorAll('.mobile-nav a');
    if (!navLinks.length) return;

    const sectionIds = ['info-rapide', 'itinerario', 'budget-tool', 'checklist'];
    const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(s => observer.observe(s));
}
