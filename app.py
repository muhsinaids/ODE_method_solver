from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import ast
import math

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Allow requests from frontend during development

ALLOWED_NAMES = {
    "x", "y",
    "sin", "cos", "tan",
    "exp", "log", "sqrt",
    "pi", "e", "abs"
}

ALLOWED_FUNCTIONS = {
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "exp": math.exp,
    "log": math.log,
    "sqrt": math.sqrt,
    "abs": abs
}

ALLOWED_BINARY_OPS = {
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow
}

ALLOWED_UNARY_OPS = {ast.UAdd, ast.USub}


def safe_eval(expr, x, y):
    """Safely evaluate a math expression with x and y values."""
    try:
        node = ast.parse(expr, mode="eval")
    except SyntaxError as e:
        raise ValueError(f"Invalid equation syntax: {e}")

    def _eval(node):
        if isinstance(node, ast.Expression):
            return _eval(node.body)

        if isinstance(node, ast.BinOp):
            if type(node.op) not in ALLOWED_BINARY_OPS:
                raise ValueError("Invalid operator in equation")
            left = _eval(node.left)
            right = _eval(node.right)
            if isinstance(node.op, ast.Add):
                return left + right
            if isinstance(node.op, ast.Sub):
                return left - right
            if isinstance(node.op, ast.Mult):
                return left * right
            if isinstance(node.op, ast.Div):
                return left / right
            if isinstance(node.op, ast.Pow):
                return left ** right

        if isinstance(node, ast.UnaryOp):
            if type(node.op) not in ALLOWED_UNARY_OPS:
                raise ValueError("Invalid unary operator in equation")
            value = _eval(node.operand)
            return +value if isinstance(node.op, ast.UAdd) else -value

        if isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name):
                raise ValueError("Invalid function call")
            func_name = node.func.id
            if func_name not in ALLOWED_FUNCTIONS:
                raise ValueError(f"Unsupported function: {func_name}")
            if node.keywords:
                raise ValueError("Keyword arguments are not allowed")
            args = [_eval(arg) for arg in node.args]
            return ALLOWED_FUNCTIONS[func_name](*args)

        if isinstance(node, ast.Name):
            if node.id == "x":
                return x
            if node.id == "y":
                return y
            if node.id == "pi":
                return math.pi
            if node.id == "e":
                return math.e
            raise ValueError(f"Unsupported name: {node.id}")

        if isinstance(node, ast.Constant):
            if isinstance(node.value, (int, float)):
                return node.value
            raise ValueError("Invalid constant in equation")

        raise ValueError("Invalid expression in equation")

    try:
        return float(_eval(node))
    except ValueError as e:
        raise
    except Exception as e:
        raise ValueError(f"Invalid equation: {e}")


def runge_kutta4(equation, x0, y0, h, steps, direction):
    x = x0
    y = y0
    values = [round(y, 10)]

    for _ in range(steps):
        k1 = safe_eval(equation, x, y)
        k2 = safe_eval(equation, x + h / 2, y + (h / 2) * k1)
        k3 = safe_eval(equation, x + h / 2, y + (h / 2) * k2)
        k4 = safe_eval(equation, x + h, y + h * k3)
        y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
        x = x + h
        values.append(round(y, 10))

    return values


@app.route("/solve/euler", methods=["POST"])
def solve_euler():
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    try:
        equation = data["equation"]
        x = float(data["x0"])
        y = float(data["y0"])
        h = float(data["h"])
        xn = float(data["xn"])
    except (KeyError, ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

    if h <= 0:
        return jsonify({"error": "Step size must be positive"}), 400

    if abs(xn - x) < 1e-10:
        return jsonify({"error": "x0 and xn cannot be the same"}), 400

    # Safety: limit number of steps
    max_steps = 10000
    steps = round(abs(xn - x) / h)
    if steps > max_steps:
        return jsonify({"error": f"Too many steps ({steps}). Reduce range or increase step size."}), 400

    x_values = [round(x, 10)]
    y_euler_values = [round(y, 10)]

    direction = 1 if xn > x else -1
    h = abs(h) * direction

    try:
        for _ in range(steps):
            dydx = safe_eval(equation, x, y)
            y = y + h * dydx
            x = x + h

            x_values.append(round(x, 6))
            y_euler_values.append(round(y, 6))

        y_rk4_values = runge_kutta4(equation, float(data["x0"]), float(data["y0"]), h, steps, direction)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except OverflowError:
        return jsonify({"error": "Solution diverged — try a smaller step size"}), 400

    return jsonify({
        "x": x_values,
        "y_euler": y_euler_values,
        "y_rk4": y_rk4_values,
        "final_x": x_values[-1],
        "final_y_euler": y_euler_values[-1],
        "final_y_rk4": y_rk4_values[-1],
        "steps": steps
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)