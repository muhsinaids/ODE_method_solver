let eulerChart;

function drawChart(xValues, yEuler, yRk4) {
    const ctx = document.getElementById("solutionChart").getContext("2d");
    const placeholder = document.getElementById("chartPlaceholder");

    if (eulerChart) eulerChart.destroy();

    placeholder.classList.add("hidden");

    eulerChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: xValues.map(v => v.toFixed(4)),
            datasets: [
                {
                    label: "Euler Approximation",
                    data: yEuler,
                    borderColor: "#00ff80",
                    backgroundColor: "rgba(0, 255, 128, 0.12)",
                    pointBackgroundColor: "#00ff80",
                    pointRadius: xValues.length > 50 ? 0 : 3,
                    pointHoverRadius: 5,
                    fill: true,
                    tension: 0.25,
                    borderWidth: 2
                },
                {
                    label: "RK4 Approximation",
                    data: yRk4,
                    borderColor: "#7cffb1",
                    backgroundColor: "rgba(124, 255, 177, 0.08)",
                    pointBackgroundColor: "#7cffb1",
                    pointRadius: xValues.length > 50 ? 0 : 3,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.25,
                    borderDash: [6, 4],
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            animation: { duration: 600, easing: "easeOutQuart" },
            plugins: {
                legend: {
                    labels: {
                        color: "#8af3b8",
                        font: { family: "'Space Mono', monospace", size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: "#0d1526",
                    borderColor: "#1e3054",
                    borderWidth: 1,
                    titleColor: "#00ff80",
                    bodyColor: "#e2e8f0",
                    titleFont: { family: "'Space Mono', monospace", size: 11 },
                    bodyFont: { family: "'Space Mono', monospace", size: 12 },
                    callbacks: {
                        title: (items) => {
                            if (!items || !items.length || !items[0]) return "";
                            return `x = ${items[0].label ?? ''}`;
                        },
                        label: (item) => {
                            if (!item || item.raw == null) return "";
                            return `y = ${item.raw.toFixed(6)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(30, 48, 84, 0.5)" },
                    ticks: {
                        color: "#64748b",
                        font: { family: "'Space Mono', monospace", size: 10 },
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: { color: "rgba(30, 48, 84, 0.5)" },
                    ticks: {
                        color: "#64748b",
                        font: { family: "'Space Mono', monospace", size: 10 }
                    }
                }
            }
        }
    });
}