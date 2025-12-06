document.addEventListener('DOMContentLoaded', () => {
    // --- COSTANTI E STRUTTURE DATI ---

    // Mappa della Tabella Dati (Numeri per Riga)
    const DATA_GRID_NUMBERS = [
        [2, 1, 3, 36, 4, 34],
        [5, 4, 6, 1, 9, 3],
        [8, 9, 7, 4, 12, 6],
        [11, 12, 10, 9, 13, 7],
        [14, 13, 15, 12, 16, 10],
        [17, 16, 18, 13, 21, 15],
        [20, 21, 19, 16, 24, 18],
        [23, 24, 22, 21, 25, 19],
        [26, 25, 27, 24, 28, 22],
        [29, 28, 30, 25, 33, 27],
        [32, 33, 31, 28, 36, 30],
        [35, 36, 34, 33, 1, 31]
    ];

    // Mappa della Regola 2 di Bruciatura (Brucia se ENTRAMBI i numeri di Col. 2 & 3 sono usciti)
    const BURN_RULE_2_MAP = [
        [1, 3], [4, 6], [7, 9], [10, 12], [13, 15], [18, 16],
        [21, 19], [22, 24], [25, 27], [28, 30], [31, 33], [34, 36]
    ];

    // Progressioni (Valori base per 0.10€ - da adattare dinamicamente)
    const BASE_PROGRESSION = [
        {step: 1, big: 0.40, medio: 0.20, mini: 0.10},
        {step: 2, big: 0.40, medio: 0.20, mini: 0.10},
        {step: 3, big: 0.60, medio: 0.40, mini: 0.10},
        {step: 4, big: 0.60, medio: 0.40, mini: 0.10},
        {step: 5, big: 0.80, medio: 0.40, mini: 0.20},
        {step: 6, big: 1.00, medio: 0.80, mini: 0.40},
        {step: 7, big: 0.80, medio: 0.40, mini: 0.40},
        {step: 8, big: 0.80, medio: 0.50, mini: 0.50},
        {step: 9, big: 1.00, medio: 0.50, mini: 0.60},
        {step: 10, big: 1.00, medio: 0.60, mini: 0.60},
        {step: 11, big: 1.20, medio: 0.80, mini: 0.80},
        {step: 12, big: 1.20, medio: 0.80, mini: 0.80},
        {step: 13, big: 0.80, medio: 0.80, mini: 0.90},
        {step: 14, big: 0.90, medio: 0.90, mini: 0.90},
        {step: 15, big: 1.00, medio: 1.00, mini: 1.00},
        {step: 16, big: 1.10, medio: 1.10, mini: 1.10},
        {step: 17, big: 1.20, medio: 1.20, mini: 1.20},
        {step: 18, big: 1.20, medio: 1.20, mini: 1.20},
        {step: 19, big: 1.30, medio: 1.30, mini: 1.30},
        {step: 20, big: 1.50, medio: 1.50, mini: 1.50},
    ];

    const ROULETTE_COLORS = {
        0: 'r-zero', 1: 'r-red', 2: 'r-black', 3: 'r-red', 4: 'r-black', 5: 'r-red', 6: 'r-black',
        7: 'r-red', 8: 'r-black', 9: 'r-red', 10: 'r-black', 11: 'r-black', 12: 'r-red',
        13: 'r-black', 14: 'r-red', 15: 'r-black', 16: 'r-red', 17: 'r-black', 18: 'r-red',
        19: 'r-red', 20: 'r-black', 21: 'r-red', 22: 'r-black', 23: 'r-red', 24: 'r-black',
        25: 'r-red', 26: 'r-black', 27: 'r-red', 28: 'r-black', 29: 'r-black', 30: 'r-red',
        31: 'r-black', 32: 'r-red', 33: 'r-black', 34: 'r-red', 35: 'r-black', 36: 'r-red'
    };


    // --- VARIABILI DI STATO ---
    let extractedNumbers = []; // Numeri estratti finora
    let rowStatus = Array(12).fill(0).map(() => ({
        yellowCount: 0,
        isBurned: false,
        burnRule2Hits: new Set(),
    })); // Stato di ogni riga
    let isPlaying = false; // Stato di giocata attiva (dopo il trigger a 4 celle)
    let currentStep = 0; // Step corrente (0 = non in progressione)
    let currentBetDetails = null; // Dettagli della puntata attiva (numeri e importi)
    let realTimeSaldo = 0;
    let archivedSessions = [];

    // --- ELEMENTI DEL DOM ---
    const elements = {
        unitValue: document.getElementById('unit-value'),
        riskCash: document.getElementById('risk-cash'),
        realTimeSaldo: document.getElementById('real-time-saldo'),
        rouletteInput: document.getElementById('roulette-input'),
        dataTableBody: document.querySelector('#data-table tbody'),
        eventsTableBody: document.querySelector('#events-table tbody'),
        numbersToPlay: document.getElementById('numbers-to-play'),
        rouletteGrid: document.getElementById('roulette-grid'),
        resetNumeriBtn: document.getElementById('reset-numeri-btn'),
        resetProgressioneBtn: document.getElementById('reset-progressione-btn'),
        winMessage: document.getElementById('win-message'),
        mainInterface: document.getElementById('main-interface'),
        summaryInterface: document.getElementById('summary-interface'),
        homeBtn: document.getElementById('home-btn'),
        archivedDataBody: document.getElementById('archived-data-body'),
        statCassaTotale: document.getElementById('stat-cassa-totale'),
        statEventiTotali: document.getElementById('stat-eventi-totali'),
        statLose: document.getElementById('stat-lose'),
        statPercentLose: document.getElementById('stat-percent-lose'),
        statInvestimentoMedio: document.getElementById('stat-investimento-medio'),
        statMediaStep: document.getElementById('stat-media-step'),
        statWin: document.getElementById('stat-win'),
        statPercentWin: document.getElementById('stat-percent-win'),
        statVincitaMax: document.getElementById('stat-vincita-max'),
        statIncassoMedio: document.getElementById('stat-incasso-medio'),
        statPerditaMax: document.getElementById('stat-perdita-max'),
    };

    // --- FUNZIONI DI INIZIALIZZAZIONE ---

    /** Crea la Tabella Dati (Griglia 12x6) */
    function initializeDataTable() {
        elements.dataTableBody.innerHTML = '';
        DATA_GRID_NUMBERS.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            row.forEach((number, colIndex) => {
                const td = document.createElement('td');
                td.textContent = number;
                td.dataset.number = number;
                td.dataset.row = rowIndex;
                td.dataset.col = colIndex;
                tr.appendChild(td);
            });
            elements.dataTableBody.appendChild(tr);
        });
    }

    /** Crea la Tabella Eventi (Progressione 20 Step) e Input Data */
    function initializeEventsAndInputTables() {
        const inputDataBody = document.getElementById('input-data-body');
        inputDataBody.innerHTML = '';
        let stepHtml = '';

        // Genera le 20 righe per l'input (22 a 41)
        for (let i = 1; i <= 20; i++) {
            const inputRow = document.createElement('tr');
            inputRow.innerHTML = `<td class="input-cell input-bg">${21 + i}</td><td class="input-cell input-bg"></td>`;
            inputDataBody.appendChild(inputRow);
        }
        
        // Genera le 20 righe per gli STEP di progressione
        for (let i = 1; i <= 20; i++) {
            stepHtml += `<tr id="step-${i}-row" class="step-row">
                <td class="step-cell">STEP ${i}</td>
                <td data-bet-col="big"></td>
                <td data-bet-col="medio" colspan="2"></td>
                <td data-bet-col="mini" colspan="3"></td>
            </tr>`;
        }
        
        // Inserisce gli STEP DOPO la riga dei numeri giocati (?)
        const eventNumbersRow = document.getElementById('event-numbers-row');
        eventNumbersRow.insertAdjacentHTML('afterend', stepHtml);
    }

    /** Crea la riproduzione del tavolo Roulette (per l'highlight blu) */
    function initializeRouletteGrid() {
        elements.rouletteGrid.innerHTML = '';
        
        // Cella per lo 0 (occupa tutta la larghezza in alto)
        const zeroCell = document.createElement('div');
        zeroCell.textContent = 0;
        zeroCell.classList.add('roulette-cell', 'r-zero');
        zeroCell.style.gridColumn = '1 / span 12'; 
        elements.rouletteGrid.appendChild(zeroCell);

        // Celle per i numeri 1-36
        for (let i = 1; i <= 36; i++) {
            const cell = document.createElement('div');
            cell.textContent = i;
            cell.classList.add('roulette-cell', ROULETTE_COLORS[i]);
            cell.dataset.number = i;
            elements.rouletteGrid.appendChild(cell);
        }
    }

    // --- FUNZIONI DI CALCOLO E AGGIORNAMENTO ---

    /** Aggiorna la tabella degli eventi e la Cassa a Rischio */
    function updateBetValues() {
        const unitValue = parseFloat(elements.unitValue.value);
        if (isNaN(unitValue) || unitValue <= 0) return;

        let totalRisk = 0;

        BASE_PROGRESSION.forEach(progression => {
            const row = document.getElementById(`step-${progression.step}-row`);
            if (!row) return;

            // Calcola la puntata in base al Valore Unitario (0.10 è la base)
            const factor = unitValue / 0.10;
            const bigBet = progression.big * factor;
            const medioBet = progression.medio * factor;
            const miniBet = progression.mini * factor;

            // Arrotondamento per valuta
            const format = (val) => val.toFixed(2).replace('.', ',');

            row.querySelector('[data-bet-col="big"]').textContent = format(bigBet) + ' €';
            row.querySelector('[data-bet-col="medio"]').textContent = format(medioBet) + ' €';
            row.querySelector('[data-bet-col="mini"]').textContent = format(miniBet) + ' €';

            // Calcolo del rischio totale (somma di tutti i 20 step)
            totalRisk += (bigBet + medioBet + miniBet);
        });

        // Aggiorna Cassa a Rischio
        elements.riskCash.textContent = totalRisk.toFixed(2).replace('.', ',') + ' €';
    }

    /** Aggiorna il saldo Real Time */
    function updateRealTimeSaldo() {
        elements.realTimeSaldo.textContent = realTimeSaldo.toFixed(2).replace('.', ',') + ' €';
        // Colore per Real Time (negativo in rosso)
        elements.realTimeSaldo.style.color = realTimeSaldo < 0 ? 'red' : 'black';
    }

    // --- FUNZIONI DI GIOCO PRINCIPALI ---

    /** Gestisce l'estrazione di un nuovo numero */
    function processNewNumber(number) {
        if (number < 0 || number > 36) return;

        // Abbiamo rimosso il controllo sulla duplicazione per permettere l'inserimento
        // di numeri uguali consecutivi senza bloccare l'input.
        
        extractedNumbers.push(number);
        let rowToPlay = -1; // Indice della riga che attiva il trigger

        elements.winMessage.style.display = 'none';

        // 1. Tracciamento e Controllo Bruciatura
        DATA_GRID_NUMBERS.forEach((rowNumbers, rowIndex) => {
            if (rowStatus[rowIndex].isBurned) return;

            const cell = document.querySelector(`#data-table td[data-number="${number}"][data-row="${rowIndex}"]`);
            const numberIndex = rowNumbers.indexOf(number);

            if (numberIndex !== -1) {
                
                // A. Controllo Regola 1 (Bruciatura Immediata - Colonna 1)
                if (numberIndex === 0) {
                    burnRow(rowIndex);
                    return; 
                }

                // B. Controllo Regola 2 (Bruciatura Ritardata - Colonna 2 & 3)
                if (numberIndex === 1 || numberIndex === 2) {
                    rowStatus[rowIndex].burnRule2Hits.add(number);
                    const [n1, n2] = BURN_RULE_2_MAP[rowIndex];

                    // Brucia solo se ENTRAMBI i numeri (n1 E n2) sono stati estratti
                    if (rowStatus[rowIndex].burnRule2Hits.has(n1) && rowStatus[rowIndex].burnRule2Hits.has(n2)) {
                        burnRow(rowIndex);
                        return; 
                    }
                }

                // C. Tracciamento Giallo Tenue (se non bruciata e non in gioco)
                if (!isPlaying) {
                    cell.classList.add('cell-yellow');
                    rowStatus[rowIndex].yellowCount++;
                }

                // D. Controllo Trigger di Gioco (4 celle gialle per prima)
                if (!isPlaying && rowStatus[rowIndex].yellowCount === 4 && rowToPlay === -1) {
                    rowToPlay = rowIndex;
                }
            }
        });

        // 2. Controllo Vincita/Progressione (solo se stiamo già giocando)
        if (isPlaying) {
            handleBetResult(number);
        }

        // 3. Attivazione Giocata (Trigger 4 celle)
        if (rowToPlay !== -1) {
            activateBet(rowToPlay);
        }

        // 4. Aggiorna l'input data (solo per mostrare il numero estratto)
        const inputCell = document.querySelector(`#input-data-body tr:nth-child(${extractedNumbers.length}) td:last-child`);
        if(inputCell) inputCell.textContent = number;

        elements.rouletteInput.value = '';

        // Mantiene il focus sul campo di input dopo l'inserimento
        elements.rouletteInput.focus();
    }

    /** Brucia una riga (Regola 1 o 2) */
    function burnRow(rowIndex) {
        rowStatus[rowIndex].isBurned = true;
        const rowCells = document.querySelectorAll(`#data-table td[data-row="${rowIndex}"]`);
        rowCells.forEach(cell => {
            cell.classList.remove('cell-yellow');
            cell.classList.add('cell-burned'); // Rosso acceso
        });
        console.log(`Riga ${rowIndex + 1} bruciata!`);
    }

    /** Attiva la giocata dopo il trigger a 4 celle */
    function activateBet(rowIndex) {
        isPlaying = true;
        currentStep = 1;
        const rowNumbers = DATA_GRID_NUMBERS[rowIndex];
        const unitValue = parseFloat(elements.unitValue.value);
        const baseBet = BASE_PROGRESSION[0];
        
        // Calcola la puntata base dello STEP 1
        const factor = unitValue / 0.10;
        const bigBet = baseBet.big * factor;
        const medioBet = baseBet.medio * factor;
        const miniBet = baseBet.mini * factor;
        const totalBet = bigBet + medioBet + miniBet;

        const currentBet = {
            big: { amount: bigBet, numbers: [rowNumbers[0]] },
            medio: { amount: medioBet, numbers: [rowNumbers[1], rowNumbers[2]] },
            mini: { amount: miniBet, numbers: [rowNumbers[3], rowNumbers[4], rowNumbers[5]] },
            totalBet: totalBet,
            totalAccumulatedLoss: 0,
            playingRowIndex: rowIndex,
        };
        currentBetDetails = currentBet;

        // 1. Popola "Numeri da Giocare"
        elements.numbersToPlay.textContent = rowNumbers.join(', ');

        // 2. Popola la riga Eventi
        const eventNumbersRow = document.getElementById('event-numbers-row');
        eventNumbersRow.querySelector('.big-num-cell').textContent = currentBet.big.numbers.join(', ');
        eventNumbersRow.querySelector('.medio-num-cell').textContent = currentBet.medio.numbers.join(', ');
        eventNumbersRow.querySelector('.mini-num-cell').textContent = currentBet.mini.numbers.join(', ');

        // 3. Illuminiamo tavolo roulette in blu chiaro
        document.querySelectorAll('.roulette-cell').forEach(cell => cell.classList.remove('r-highlight'));
        rowNumbers.forEach(num => {
            const cell = document.querySelector(`#roulette-grid div[data-number="${num}"]`);
            if (cell) cell.classList.add('r-highlight'); // Blu chiaro
        });

        // 4. Illuminiamo STEP 1 e aggiorniamo Real Time
        highlightStep(1);
        updateRealTimeOnBet(totalBet);
    }

    /** Gestisce il risultato (vincita/perdita) durante la progressione */
    function handleBetResult(number) {
        if (currentStep === 0 || !currentBetDetails) return;

        currentBetDetails.winningNumber = number;
        const allPlayedNumbers = [
            ...currentBetDetails.big.numbers,
            ...currentBetDetails.medio.numbers,
            ...currentBetDetails.mini.numbers
        ];

        if (allPlayedNumbers.includes(number)) {
            // VINCITA (FINE PROGRESSIONE)
            
            // 1. Calcola la vincita netta (recupero perdite + 1 unità)
            const unitValue = parseFloat(elements.unitValue.value);
            // Il guadagno netto è l'ammontare delle perdite accumulate + 1 unità di base.
            const winNet = currentBetDetails.totalAccumulatedLoss + unitValue;
            
            // 2. Aggiorna il saldo Real Time con il guadagno netto
            realTimeSaldo += winNet; 

            elements.winMessage.textContent = `HAI VINTO ${winNet.toFixed(2).replace('.', ',')} € (Netto)`;
            elements.winMessage.style.display = 'block';
            updateRealTimeSaldo();
            
            // Suggerisci reset (visivo)
            elements.resetProgressioneBtn.style.backgroundColor = 'lime';
            elements.resetProgressioneBtn.textContent = 'RESET PROGRESSIONE (HAI VINTO!)';
            
            // Importante: La progressione rimane nello stato di 'vinto' fino all'archiviazione.

        } else {
            // PERDITA (CONTINUA PROGRESSIONE)
            if (currentStep < 20) {
                // Aggiorniamo la perdita totale accumulata
                currentBetDetails.totalAccumulatedLoss += currentBetDetails.totalBet;

                currentStep++;
                highlightStep(currentStep);

                const unitValue = parseFloat(elements.unitValue.value);
                const baseBet = BASE_PROGRESSION[currentStep - 1];

                const factor = unitValue / 0.10;
                const totalNextBet = (baseBet.big + baseBet.medio + baseBet.mini) * factor;
                
                currentBetDetails.totalBet = totalNextBet;
                updateRealTimeOnBet(totalNextBet); // Sottrae la nuova puntata dal Real Time

            } else {
                // Raggiunto STEP 20 (Perdita Massima)
                
                // Aggiorniamo la perdita totale accumulata per l'archiviazione
                currentBetDetails.totalAccumulatedLoss += currentBetDetails.totalBet;
                
                elements.winMessage.textContent = `PROGRESSIONE TERMINATA! Raggiunto STEP 20. Netto: ${realTimeSaldo.toFixed(2).replace('.', ',')} €`;
                elements.winMessage.style.display = 'block';

                elements.resetProgressioneBtn.style.backgroundColor = 'red';
                elements.resetProgressioneBtn.textContent = 'RESET PROGRESSIONE (PERDITA MASSIMA)';
            }
        }
    }

    /** Evidenzia lo step corrente */
    function highlightStep(step) {
        document.querySelectorAll('.step-row').forEach(row => row.classList.remove('event-row-active'));
        const newRow = document.getElementById(`step-${step}-row`);
        if (newRow) {
            newRow.classList.add('event-row-active'); // Verde tenue
        }
    }

    /** Aggiorna il saldo Real Time con la puntata corrente */
    function updateRealTimeOnBet(betAmount) {
        realTimeSaldo -= betAmount;
        updateRealTimeSaldo();
    }


    // --- FUNZIONI DI RESET E ARCHIVIAZIONE ---

    /** Reset dell'intera interfaccia di gioco */
    function resetMainInterface() {
        // Reset di tutte le variabili di stato
        extractedNumbers = [];
        rowStatus = Array(12).fill(0).map(() => ({
            yellowCount: 0,
            isBurned: false,
            burnRule2Hits: new Set(),
        }));
        isPlaying = false;
        currentStep = 0;
        currentBetDetails = null;
        realTimeSaldo = 0;

        // Reset Visivo
        initializeDataTable();
        updateRealTimeSaldo();
        updateBetValues();
        elements.numbersToPlay.textContent = '';
        elements.winMessage.style.display = 'none';

        // Reset Tabella Eventi
        document.querySelectorAll('.step-row').forEach(row => row.classList.remove('event-row-active'));
        const eventNumbersRow = document.getElementById('event-numbers-row');
        eventNumbersRow.querySelector('.big-num-cell').textContent = '?';
        eventNumbersRow.querySelector('.medio-num-cell').textContent = '?';
        eventNumbersRow.querySelector('.mini-num-cell').textContent = '?';
        elements.resetProgressioneBtn.style.backgroundColor = '#4682b4';
        elements.resetProgressioneBtn.textContent = 'RESET PROGRESSIONE';

        // Reset Tabella Roulette
        document.querySelectorAll('.roulette-cell').forEach(cell => cell.classList.remove('r-highlight'));

        // Reset Input Data
        const inputDataCells = document.querySelectorAll('#input-data-body td:last-child');
        inputDataCells.forEach(cell => cell.textContent = '');
    }

    /** Archivia i dati della sessione corrente e passa alla schermata di riepilogo */
    function archiveAndShowSummary() {
        if (!isPlaying && extractedNumbers.length === 0) {
             alert("Nessun dato di sessione da archiviare.");
             return;
        }

        const sessionData = {
            date: new Date().toLocaleDateString('it-IT'),
            investimento: parseFloat(elements.unitValue.value),
            // Se non in progressione, lo step è 0. Usiamo 1 se ci sono state estrazioni ma non ha triggerato.
            step: currentStep === 0 && extractedNumbers.length > 0 ? 1 : currentStep, 
            netto: realTimeSaldo,
        };

        archivedSessions.push(sessionData);
        resetMainInterface(); // Azzeramento della pagina principale

        // Passa alla schermata di Riepilogo
        elements.mainInterface.classList.add('hidden');
        elements.summaryInterface.classList.remove('hidden');

        updateSummaryTable();
    }

    /** Aggiorna la schermata di riepilogo e le statistiche */
    function updateSummaryTable() {
        elements.archivedDataBody.innerHTML = '';
        
        let cassaTotale = 0;
        let totalInvestimento = 0;
        let totalSteps = 0;
        let winCount = 0;
        let loseCount = 0;
        let vincitaMax = -Infinity;
        let perditaMax = Infinity;
        let totalWinNet = 0;
        let totalLossNet = 0;

        archivedSessions.forEach(session => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${session.date}</td>
                <td>${session.investimento.toFixed(2).replace('.', ',')} €</td>
                <td>${session.step}</td>
                <td>${session.netto.toFixed(2).replace('.', ',')} €</td>
            `;
            elements.archivedDataBody.appendChild(tr);

            cassaTotale += session.netto;
            totalInvestimento += session.investimento;
            totalSteps += session.step;

            if (session.netto >= 0) {
                winCount++;
                totalWinNet += session.netto;
                vincitaMax = Math.max(vincitaMax, session.netto);
            } else {
                loseCount++;
                totalLossNet += session.netto;
                perditaMax = Math.min(perditaMax, session.netto);
            }
        });

        const totalEvents = archivedSessions.length;
        
        // Calcoli statistici
        const mediaStep = totalEvents > 0 ? totalSteps / totalEvents : 0;
        const incassoMedio = winCount > 0 ? totalWinNet / winCount : 0;
        const perditaMedia = loseCount > 0 ? totalLossNet / loseCount : 0; 
        const investimentoMedio = totalEvents > 0 ? totalInvestimento / totalEvents : 0;

        // Popola le statistiche
        const formatStat = (val) => val.toFixed(2).replace('.', ',');
        elements.statCassaTotale.textContent = formatStat(cassaTotale) + ' €';
        elements.statEventiTotali.textContent = totalEvents;
        elements.statLose.textContent = loseCount;
        elements.statPercentLose.textContent = totalEvents > 0 ? formatStat((loseCount / totalEvents) * 100) + '%' : '0,00%';
        elements.statInvestimentoMedio.textContent = formatStat(investimentoMedio) + ' €';
        elements.statMediaStep.textContent = formatStat(mediaStep);
        elements.statWin.textContent = winCount;
        elements.statPercentWin.textContent = totalEvents > 0 ? formatStat((winCount / totalEvents) * 100) + '%' : '0,00%';
        elements.statVincitaMax.textContent = vincitaMax === -Infinity ? '0,00 €' : formatStat(vincitaMax) + ' €';
        elements.statIncassoMedio.textContent = formatStat(incassoMedio) + ' €';
        elements.statPerditaMax.textContent = perditaMax === Infinity ? '0,00 €' : formatStat(perditaMax) + ' €';
    }

    // --- EVENT LISTENERS ---

    // Input numero roulette (gestisce l'estrazione)
    elements.rouletteInput.addEventListener('change', (e) => {
        const number = parseInt(e.target.value);
        if (isNaN(number) || number < 0 || number > 36) {
            alert("Inserire un numero valido (0-36).");
            e.target.value = '';
            return;
        }
        processNewNumber(number);
    });

    // Cambiamento Valore Unitario (aggiorna progressione e Cassa a Rischio)
    elements.unitValue.addEventListener('change', updateBetValues);

    // Reset Numeri (Reset l'interfaccia principale)
    elements.resetNumeriBtn.addEventListener('click', resetMainInterface);

    // Reset Progressione (Archivia e mostra Riepilogo)
    document.querySelector('.archive-image-placeholder').addEventListener('click', archiveAndShowSummary);
    elements.resetProgressioneBtn.addEventListener('click', archiveAndShowSummary);

    // Tasto HOME (Torna alla pagina principale)
    elements.homeBtn.addEventListener('click', () => {
        elements.mainInterface.classList.remove('hidden');
        elements.summaryInterface.classList.add('hidden');
    });

    // **LISTENER CORRETTO per ripristinare il click sulla tabella Estrazioni**
    document.getElementById('input-data-body').addEventListener('click', (e) => {
        // Controlla se l'elemento cliccato è una cella TD e si trova nella seconda colonna (indice 1)
        if (e.target.tagName === 'TD' && e.target.cellIndex === 1 && e.target.classList.contains('input-bg')) {
            const cellText = e.target.textContent.trim();
            const number = parseInt(cellText);
            
            // Assicurati che il contenuto non sia vuoto e sia un numero valido
            if (cellText !== '' && !isNaN(number) && number >= 0 && number <= 36) {
                // Lo reinseriamo nel sistema
                processNewNumber(number); 
            }
        }
    });

    // --- AVVIO ---
    initializeDataTable();
    initializeEventsAndInputTables();
    initializeRouletteGrid();
    updateBetValues(); // Calcola i valori iniziali della progressione
    updateRealTimeSaldo();
});
