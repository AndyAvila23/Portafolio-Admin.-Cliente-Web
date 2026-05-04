let pantalla = document.getElementById("pantalla");
let botones = document.querySelectorAll(".btn");

let num1 = "";
let num2 = "";
let usandoSegundoNumero = false;

botones.forEach(boton => {
    boton.addEventListener("click", () => {

        if (boton.dataset.num) {
            if (!usandoSegundoNumero) {
                num1 += boton.dataset.num;
                pantalla.textContent = num1 + " | ";
            } else {
                num2 += boton.dataset.num;
                pantalla.textContent = num1 + " | " + num2;
            }
        }

        if (boton.classList.contains("igual")) {

            if (!usandoSegundoNumero) {
                usandoSegundoNumero = true;
                pantalla.textContent = "Ingrese segundo número";
                return;
            }

            ejecutarOperaciones();
        }

        if (boton.classList.contains("limpiar")) {
            num1 = "";
            num2 = "";
            usandoSegundoNumero = false;
            pantalla.textContent = "Ingrese primer número";
        }

    });
});


function ejecutarOperaciones() {
    let a = parseFloat(num1);
    let b = parseFloat(num2);

    let resultado = "";

    for (let i = 1; i <= 5; i++) {

        switch (i) {
            case 1:
                resultado += `<div>1) ${a} + ${b} = ${a + b}</div>`;
                break;

            case 2:
                resultado += `<div>2) ${a} - ${b} = ${a - b}</div>`;
                break;

            case 3:
                resultado += `<div>3) ${a} × ${b} = ${a * b}</div>`;
                break;

            case 4:
                resultado += `<div>4) ${a} ÷ ${b} = ${b !== 0 ? (a / b).toFixed(2) : "Error"}</div>`;
                break;

            case 5:
                resultado += `<div>5) ${a} % ${b} = ${b !== 0 ? (a % b).toFixed(2) : "Error"}</div>`;
                break;
        }
    }

    pantalla.innerHTML = resultado;
}