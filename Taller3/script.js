//Código javascript
document.getElementById('registroForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Evita que se envíe el formulario de forma tradicional

  // Limpiar errores previos
  limpiarErrores();
  document.getElementById('error').textContent = '';
  let disponible = true;

  // 1. Validar nombre
  //var + var = const
  const nombre = document.getElementById('nombre').value;
  const regexNombre = /^[a-zA-Z ]{1,30}$/;
  if (!regexNombre.test(nombre)) {
    avisoError('errorNombre');
    document.getElementById('errorNombre').innerText = "El nombre sólo debe contener letras";
    disponible = false;
  }

  // 2. Validar Email
  const email = document.getElementById('email1').value;
  const regexEmail = /^[\w.-]+@[\w.-]+\.\w+$/;
  if (!regexEmail.test(email)) {
    avisoError('email1');
    document.getElementById('errorEmail').innerText = "Ingrese un correo electrónico válido.";
    disponible = false;
  }

  // 3. Validar Contraseña
  const password = document.getElementById('password').value;
  //Contraseña: debe tener 8 caracteres, una mayúscula y un número
  const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regexPassword.test(password)) {
    avisoError('password');
    document.getElementById('errorPass').innerText = "La contraseña debe tener 8 caracteres, una mayúscula y un número.";
    disponible = false;
  }

  if (disponible) {
    alert("Formulario enviado con éxito!");
    this.reset(); // Reinicia el formulario
  }
});
