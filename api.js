async function solveEuler(data) {
    try {
        const response = await fetch("/solve/euler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        let result;

        try {
            result = JSON.parse(text);
        } catch (parseError) {
            throw new Error("Invalid JSON response from server. Check backend logs or network response.");
        }

        if (!response.ok) {
            throw new Error(result.error || "Server error");
        }

        return result;
    } catch (error) {
        if (error.message.includes("Failed to fetch")) {
            throw new Error("Cannot reach backend. Make sure Flask is running on port 5000.");
        }
        throw error;
    }
}