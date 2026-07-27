/**
 * ==========================================================================
 * ALBANIA SQUAD 2026 | KSAMIL & TIRANA — INTERACTIVE SCRIPTS
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initDayFilters();
    initBudgetCalculator();
    initCurrencyConverter();
    initChecklist();
});

/**
 * 1. COUNTDOWN AL DECOLLO DA ROMA CIAMPINO (3 AGOSTO 2026, 07:40)
 */
function initCountdown() {
    // 3 Agosto 2026 ore 07:40:00 (orario italiano / albanese UTC+2)
    const targetDate = new Date('2026-08-03T07:40:00+02:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            const cardTitle = document.querySelector('.countdown-title');
            if (cardTitle) {
                cardTitle.innerHTML = '🇦🇱 SI VOLA IN ALBANIA! BUON VIAGGIO SQUAD!';
            }
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent = String(minutes).padStart(2, '0');
        secsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/**
 * 2. FILTRO GIORNO PER GIORNO NELL'ITINERARIO
 */
function initDayFilters() {
    const buttons = document.querySelectorAll('.day-btn');
    const cards = document.querySelectorAll('.day-card');

    if (!buttons.length || !cards.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Rimuovi active da tutti i bottoni
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedDay = btn.getAttribute('data-day');

            cards.forEach(card => {
                const cardDay = card.getAttribute('data-day');
                if (selectedDay === 'all' || cardDay === selectedDay) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/**
 * 3. RIPARTITORE DI SPESE E BUDGET SQUAD
 */
function initBudgetCalculator() {
    const numPeopleSelect = document.getElementById('num-people');
    const taxiInput = document.getElementById('taxi-cost');
    const hotelInput = document.getElementById('hotel-cost');
    const activitiesInput = document.getElementById('activities-cost');
    const foodInput = document.getElementById('food-budget');

    const resultValue = document.getElementById('per-person-result');
    const breakdownText = document.getElementById('breakdown-text');

    const inputs = [numPeopleSelect, taxiInput, hotelInput, activitiesInput, foodInput];
    if (!inputs.every(Boolean) || !resultValue || !breakdownText) return;

    function calculate() {
        const people = parseInt(numPeopleSelect.value, 10) || 8;
        const taxiTotal = parseFloat(taxiInput.value) || 0;
        const hotelTotal = parseFloat(hotelInput.value) || 0;
        const activitiesPerPerson = parseFloat(activitiesInput.value) || 0;
        const foodDaily = parseFloat(foodInput.value) || 0;

        // Ipotizziamo 7 giorni effettivi per vitto
        const foodTotalPerPerson = foodDaily * 7;

        // Quota fissa di gruppo divisa per i partecipanti
        const groupSharePerPerson = (taxiTotal + hotelTotal) / people;

        // Quota individuale
        const totalPerPerson = groupSharePerPerson + activitiesPerPerson + foodTotalPerPerson;

        resultValue.textContent = `~ ${Math.round(totalPerPerson)} €`;
        breakdownText.innerHTML = `
            <strong>Dettaglio a testa:</strong> 
            Taxi+Hotel (~${Math.round(groupSharePerPerson)}€) + 
            Attività (${activitiesPerPerson}€) + 
            Cibo/Drink 7 gg (~${foodTotalPerPerson}€)
        `;
    }

    inputs.forEach(input => {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
    });

    calculate();
}

/**
 * 4. CONVERTITORE ISTANTANEO EURO (€) <-> LEK ALBANESE
 */
function initCurrencyConverter() {
    const euroInput = document.getElementById('euro-input');
    const lekInput = document.getElementById('lek-input');
    const chipBtns = document.querySelectorAll('.chip-btn');
    const swapBtn = document.querySelector('.currency-swap-icon');

    const RATE = 100; // 1 EUR = 100 LEK (tasso standard in Albania)

    if (!euroInput || !lekInput) return;

    euroInput.addEventListener('input', () => {
        const eurVal = parseFloat(euroInput.value) || 0;
        lekInput.value = Math.round(eurVal * RATE);
    });

    lekInput.addEventListener('input', () => {
        const lekVal = parseFloat(lekInput.value) || 0;
        euroInput.value = (lekVal / RATE).toFixed(2);
    });

    // Clic sulle chips preimpostate
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const eur = parseFloat(btn.getAttribute('data-eur')) || 0;
            euroInput.value = eur;
            lekInput.value = Math.round(eur * RATE);
            
            // Animazione feedback
            euroInput.style.transform = 'scale(1.05)';
            lekInput.style.transform = 'scale(1.05)';
            setTimeout(() => {
                euroInput.style.transform = 'none';
                lekInput.style.transform = 'none';
            }, 200);
        });
    });

    // Tasto swap (resetta valori tondi rapidi)
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const currentEur = parseFloat(euroInput.value) || 10;
            const newEur = currentEur === 10 ? 50 : 10;
            euroInput.value = newEur;
            lekInput.value = newEur * RATE;
        });
    }
}

/**
 * 5. CHECKLIST INTERATTIVA CON SALVATAGGIO IN LOCALSTORAGE
 */
function initChecklist() {
    const checkboxes = document.querySelectorAll('#checklist-items input[type="checkbox"]');
    const progressFill = document.getElementById('checklist-progress');
    const progressText = document.getElementById('progress-text');
    const resetBtn = document.getElementById('reset-chk');

    if (!checkboxes.length || !progressFill || !progressText) return;

    const STORAGE_KEY = 'albania_squad_checklist_2026';

    // Carica stato salvato dal localStorage (se disponibile)
    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            checkboxes.forEach(chk => {
                const id = chk.getAttribute('data-id');
                if (saved[id]) {
                    chk.checked = true;
                }
            });
        } catch (e) {
            console.warn('Impossibile leggere localStorage per la checklist', e);
        }
        updateProgress();
    }

    // Salva stato e aggiorna barra
    function saveState() {
        const state = {};
        checkboxes.forEach(chk => {
            const id = chk.getAttribute('data-id');
            state[id] = chk.checked;
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Impossibile salvare localStorage per la checklist', e);
        }
        updateProgress();
    }

    function updateProgress() {
        const total = checkboxes.length;
        const checked = Array.from(checkboxes).filter(c => c.checked).length;
        const percentage = Math.round((checked / total) * 100);

        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% Completato (${checked}/${total})`;

        if (percentage === 100) {
            progressText.innerHTML = `🎉 100% PRONTI PER PARTIRE! 🇦🇱`;
        }
    }

    checkboxes.forEach(chk => {
        chk.addEventListener('change', saveState);
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            checkboxes.forEach(chk => (chk.checked = false));
            saveState();
        });
    }

    loadState();
}
