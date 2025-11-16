document.addEventListener('DOMContentLoaded', function () {
    const easyText = [
        "The quick brown fox jumps over the lazy dog.",
        "The cat sat on the warm windowsill and watched the birds.",
        "A bright red ball bounced down the quiet street.",
        "She opened the door, smiled, and waved hello to her friend.",
        "Put the cup on the table and close the small blue book.",
        "The sun rose slowly and filled the room with soft light."
    ];

    const mediumText = [
        "Typing is a fundamental skill that is essential for effective communication in the digital age.",
        "On cool mornings the baker sets out fresh bread, and neighbors stop by for a chat.",
        "The garden was filled with colorful flowers, buzzing bees, and the sweet scent of blooming roses.",
        "During the summer festival, children laughed as they chased bubbles and played games in the park.",
        "He checked his list twice, packed his bag, and stepped into the rainy afternoon with purpose.",
        "The library smelled of paper and coffee as students moved between stacks, whispering ideas."
    ];

    const hardText = [
        "In an increasingly interconnected world, the ability to type quickly and accurately can significantly enhance productivity and open up new opportunities for personal and professional growth.",
        "Beneath the vaulted ceiling, shafts of slanted light illuminated a mosaic of motes and dust, an ephemeral geometry that seemed to slow time itself.",
        "The biologist annotated the dataset, reconciling anomalous entries and cross-referencing specimen IDs with archived field notes from 1998.",
        "A labyrinthine argument unfolded in the lecture: premises nested inside premises, each contingent claim demanding careful qualification and counterexample."
    ];

    const startButton = document.querySelector('#startButton');
    const stopButton = document.querySelector('#stopButton');
    const retryButton = document.querySelector('#retryButton');
    const typeText = document.querySelector('#typeText');
    const typeTextHighlight = document.querySelector('#typeTextHighlight');
    const testText = document.querySelector('#testText');
    const difficulty = document.querySelector('#difficulty');

    const levelSpan = document.querySelector('#level');
    const timeSpan = document.querySelector('#time');
    const wpmSpan = document.querySelector('#wpm');
    const wpsSpan = document.querySelector('#wps');
    const errorsSpan = document.querySelector('#errors');

    let startTime = null;
    let timerId = null;
    let targetText = '';

    function getRandomTextForDifficulty(d) {
        if (d === '1') return easyText[Math.floor(Math.random() * easyText.length)];
        if (d === '2') return mediumText[Math.floor(Math.random() * mediumText.length)];
        return hardText[Math.floor(Math.random() * hardText.length)];
    }

    function updateStats() {
        if (!startTime) return;
        const now = Date.now();
        const elapsedSec = Math.max((now - startTime) / 1000, 0.001);
        const typed = typeText.value.trim();
        const wordCount = typed === '' ? 0 : typed.split(/\s+/).length;
        const wps = wordCount / elapsedSec;
        const wpm = wps * 60;

        timeSpan.textContent = elapsedSec.toFixed(1);
        wpsSpan.textContent = wps.toFixed(2);
        wpmSpan.textContent = Math.round(wpm);
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderHighlight(typed) {
        if (!typeTextHighlight) return;
        const targetWords = targetText.trim() === '' ? [] : targetText.split(/\s+/);
        const typedWords = typed.trim() === '' ? [] : typed.split(/\s+/);

        let html = '';
        let errors = 0;
        const total = Math.max(targetWords.length, typedWords.length);
        for (let i = 0; i < total; i++) {
            const tWord = targetWords[i] || '';
            const uWord = typedWords[i];
            if (typeof uWord === 'undefined') {
                html += `<span class="word upcoming">${escapeHtml(tWord)}</span>`;
            } else {
                if (uWord === tWord) {
                    html += `<span class="word correct">${escapeHtml(uWord)}</span>`;
                } else {
                    html += `<span class="word incorrect">${escapeHtml(uWord)}</span>`;
                    errors++;
                }
            }
            if (i < total - 1) html += ' ';
        }

        typeTextHighlight.innerHTML = html;
        if (errorsSpan) errorsSpan.textContent = errors;
       
    }

    function startTest() {
        // prepare
        const d = difficulty.value;
        levelSpan.textContent = d === '1' ? 'Easy' : d === '2' ? 'Medium' : 'Hard';
        testText.value = getRandomTextForDifficulty(d);
      
        
        
        typeText.value = '';
        typeText.disabled = false;
        typeText.focus();

        startButton.disabled = true;
        stopButton.disabled = false;
        retryButton.disabled = true;
        targetText = testText.value;
        if (typeTextHighlight) typeTextHighlight.innerHTML = '';
        if (errorsSpan) errorsSpan.textContent = '0';
    // update every 200ms
        timerId = setInterval(updateStats, 200);
    
}

    function stopTest() {
       
        updateStats(); // final update
        startTime = null; // stop timing
      startButton.disabled = true; // keep start disabled after stopping
        stopButton.disabled = true; // disable stop button
        retryButton.disabled = false; // enable retry
    }

    function retryTest() {
        if (timerId) { // clear timer if running
            clearInterval(timerId);
            timerId = null;
        }
        startTime = null; // reset start time
        typeText.value = '';
        testText.value = '';
        targetText = '';
        // reset stats
        if (typeTextHighlight) typeTextHighlight.innerHTML = ''; // clear highlight
        if (errorsSpan) errorsSpan.textContent = '0';
        timeSpan.textContent = '0';
        wpsSpan.textContent = '0.00';
        wpmSpan.textContent = '0';

        typeText.disabled = true;

        startButton.disabled = false;
        stopButton.disabled = true;
        retryButton.disabled = true;
    }

    startButton.addEventListener('click', startTest);
    stopButton.addEventListener('click', stopTest);
    retryButton.addEventListener('click', retryTest);

    // update highlight render and timing on user input
    typeText.addEventListener('input', function () {
        if (!startTime) startTime = Date.now();
        updateStats();
        renderHighlight(typeText.value);
        // time update
        timeSpan.textContent = ((Date.now() - startTime) / 1000).toFixed(1);
    });

    // keep highlight layer scrolled the same as the textarea
    typeText.addEventListener('scroll', function () {
        if (typeTextHighlight) {
            typeTextHighlight.scrollTop = typeText.scrollTop;
            typeTextHighlight.scrollLeft = typeText.scrollLeft;
        }
    });

    // Auto-start the timer and load a new test when difficulty is changed
    difficulty.addEventListener('change', function () {
        // restart the test with the newly selected difficulty
        retryTest();
        startTest();
    });

    // initialize state
    retryTest();
});