const solveBtn = document.getElementById("solveBtn");
const errorBox = document.getElementById("errorBox");

// Cursor ring element
const cursorRing = document.createElement('div');
cursorRing.className = 'cursor-ring hidden';
document.body.appendChild(cursorRing);

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorRing.classList.remove('hidden');
});

document.addEventListener('mouseleave', () => cursorRing.classList.add('hidden'));
document.addEventListener('mouseenter', () => cursorRing.classList.remove('hidden'));

document.addEventListener('mousedown', () => cursorRing.classList.add('pointer'));
document.addEventListener('mouseup', () => cursorRing.classList.remove('pointer'));

// Enlarge ring when hovering interactive elements
const interactiveSelector = 'a, button, input, textarea, select, label, .copy-btn, #solveBtn';
const textSelector = 'input, textarea, [contenteditable="true"]';

document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(interactiveSelector)) cursorRing.classList.add('pointer');
    if (e.target.closest && e.target.closest(textSelector)) cursorRing.classList.add('text');
});
document.addEventListener('mouseout', (e) => {
    if (e.target.closest && e.target.closest(interactiveSelector)) cursorRing.classList.remove('pointer');
    if (e.target.closest && e.target.closest(textSelector)) cursorRing.classList.remove('text');
});

// Keep text-mode when an element gains focus (keyboard navigation)
document.addEventListener('focusin', (e) => {
    if (e.target && (e.target.matches && e.target.matches(textSelector))) cursorRing.classList.add('text');
});
document.addEventListener('focusout', (e) => {
    if (e.target && (e.target.matches && e.target.matches(textSelector))) cursorRing.classList.remove('text');
});

function animateRing() {
    // increased follow responsiveness for better accuracy
    const ease = 0.4; // higher -> faster tracking
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
}
requestAnimationFrame(animateRing);

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
}

function hideError() {
    errorBox.classList.add("hidden");
}

function setLoading(on) {
    solveBtn.classList.toggle("loading", on);
    solveBtn.querySelector(".btn-text").textContent = on ? "Solving..." : "Solve";
}

solveBtn.addEventListener("click", async () => {
    hideError();

    const data = {
        equation: document.getElementById("equation").value,
        x0: parseFloat(document.getElementById("x0").value),
        y0: parseFloat(document.getElementById("y0").value),
        h: parseFloat(document.getElementById("h").value),
        xn: parseFloat(document.getElementById("xn").value)
    };

    const validationError = validateInputs(data);
    if (validationError) {
        showError(validationError);
        return;
    }

    setLoading(true);

    try {
        const result = await solveEuler(data);
        populateTable(result.x, result.y_euler, result.y_rk4);
        drawChart(result.x, result.y_euler, result.y_rk4);
        showSummary(result);
    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false);
    }
});

function showSummary(result) {
    const card = document.getElementById("summaryCard");
    card.classList.remove("hidden");
    document.getElementById("finalYEuler").textContent = result.final_y_euler.toFixed(6);
    document.getElementById("finalYRK4").textContent = result.final_y_rk4.toFixed(6);
    document.getElementById("finalDiff").textContent = Math.abs(result.final_y_euler - result.final_y_rk4).toFixed(6);
    document.getElementById("finalX").textContent = result.final_x.toFixed(4);
}

function populateTable(xValues, yEuler, yRk4) {
    const tbody = document.querySelector("#resultTable tbody");
    const tableSection = document.getElementById("tableSection");

    tbody.innerHTML = "";
    tableSection.classList.remove("hidden");

    for (let i = 0; i < xValues.length; i++) {
        const eulerValue = yEuler[i];
        const rk4Value = yRk4[i];
        const diff = Math.abs(eulerValue - rk4Value);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i}</td>
            <td>${xValues[i].toFixed(6)}</td>
            <td>${eulerValue.toFixed(6)}</td>
            <td>${rk4Value.toFixed(6)}</td>
            <td>${diff.toFixed(6)}</td>
        `;
        tbody.appendChild(row);
    }
}

// CSV export
document.getElementById("copyBtn").addEventListener("click", () => {
    const rows = document.querySelectorAll("#resultTable tbody tr");
    if (!rows.length) return;

    let csv = "step,x,euler_y,rk4_y,difference\n";
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const step = cells[0]?.textContent ?? "";
        const x = cells[1]?.textContent ?? "";
        const eulerY = cells[2]?.textContent ?? "";
        const rk4Y = cells[3]?.textContent ?? "";
        const diff = cells[4]?.textContent ?? "";
        csv += `${step},${x},${eulerY},${rk4Y},${diff}\n`;
    });

    navigator.clipboard.writeText(csv).then(() => {
        const btn = document.getElementById("copyBtn");
        btn.textContent = "Copied ✓";
        setTimeout(() => btn.textContent = "Copy CSV", 2000);
    });
});