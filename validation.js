function validateInputs(data) {
    if (!data.equation || data.equation.trim() === "") {
        return "Equation is required!";
    }
    if (isNaN(data.x0) || isNaN(data.y0) || isNaN(data.h) || isNaN(data.xn)) {
        return "All numeric fields must be filled correctly!";
    }
    if (data.h <= 0) {
        return "Step size (h) must be a positive number!";
    }
    if (Math.abs(data.xn - data.x0) < 1e-10) {
        return "Target x cannot equal initial x₀!";
    }
    return null; // null = valid
}