// Clase principal para el manejo de estudiantes
class SistemaEstudiantes {
    constructor() {
        this.estudiantes = this.cargarEstudiantes();
        this.editandoIndice = -1;
        this.inicializarEventos();
        this.mostrarEstudiantes();
        this.actualizarContador();
    }

    // Expresiones regulares para validaciones
    validaciones = {
        cedula: /^\d{10}$/,
        apellidos: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/,
        nombres: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/,
        direccion: /^.{5,100}$/,
        telefono: /^0\d{9}$/,
        correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        facultad: /^.+$/,
        nivel: /^.+$/,
        paralelo: /^[A-E]$/
    };

    // Mensajes de error personalizados
    mensajesError = {
        cedula: 'La cédula debe tener exactamente 10 dígitos numéricos',
        apellidos: 'Los apellidos deben contener solo letras (3-50 caracteres)',
        nombres: 'Los nombres deben contener solo letras (3-50 caracteres)',
        direccion: 'La dirección debe tener entre 5 y 100 caracteres',
        telefono: 'El teléfono debe comenzar con 0 y tener 10 dígitos (ej: 0991234567)',
        correo: 'Ingrese un correo electrónico válido (ej: usuario@dominio.com)',
        facultad: 'Seleccione una facultad',
        nivel: 'Seleccione un nivel',
        paralelo: 'Seleccione un paralelo (A-E)'
    };

    inicializarEventos() {
        const self = this;
        
        // Evento submit del formulario
        const formulario = document.getElementById('formularioEstudiante');
        if (formulario) {
            formulario.addEventListener('submit', function(e) {
                e.preventDefault();
                self.manejarEnvio();
            });
        }

        // Botón de limpiar
        const btnLimpiar = document.getElementById('btnLimpiar');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', function() {
                self.limpiarFormulario();
            });
        }

        // Botón de exportar
        const btnExportar = document.getElementById('btnExportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', function() {
                self.exportarDatos();
            });
        }

        // Validación en tiempo real para campos de texto
        const campos = ['cedula', 'apellidos', 'nombres', 'direccion', 'telefono', 'correo'];
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.addEventListener('input', function() {
                    self.validarCampo(campo);
                });
            }
        });

        // Validación para selects
        const selects = ['facultad', 'nivel', 'paralelo'];
        selects.forEach(select => {
            const elemento = document.getElementById(select);
            if (elemento) {
                elemento.addEventListener('change', function() {
                    self.validarCampo(select);
                });
            }
        });
    }

    validarCampo(campo) {
        const elemento = document.getElementById(campo);
        if (!elemento) return false;
        
        const errorDiv = document.getElementById(`error-${campo}`);
        if (!errorDiv) return false;
        
        const valor = elemento.value;
        const regex = this.validaciones[campo];

        if (regex.test(valor)) {
            elemento.classList.remove('error');
            elemento.classList.add('valid');
            errorDiv.classList.remove('show');
            errorDiv.textContent = '';
            return true;
        } else {
            elemento.classList.remove('valid');
            elemento.classList.add('error');
            errorDiv.textContent = this.mensajesError[campo];
            errorDiv.classList.add('show');
            return false;
        }
    }

    validarFormularioCompleto() {
        const campos = ['cedula', 'apellidos', 'nombres', 'direccion', 'telefono', 'correo', 'facultad', 'nivel', 'paralelo'];
        let todoValido = true;

        campos.forEach(campo => {
            if (!this.validarCampo(campo)) {
                todoValido = false;
            }
        });

        return todoValido;
    }

    obtenerDatosFormulario() {
        return {
            cedula: document.getElementById('cedula')?.value || '',
            apellidos: document.getElementById('apellidos')?.value || '',
            nombres: document.getElementById('nombres')?.value || '',
            direccion: document.getElementById('direccion')?.value || '',
            telefono: document.getElementById('telefono')?.value || '',
            correo: document.getElementById('correo')?.value || '',
            facultad: document.getElementById('facultad')?.value || '',
            nivel: document.getElementById('nivel')?.value || '',
            paralelo: document.getElementById('paralelo')?.value || '',
            fechaRegistro: new Date().toLocaleString()
        };
    }

    manejarEnvio() {
        if (!this.validarFormularioCompleto()) {
            alert('Por favor, corrija los errores en el formulario');
            return;
        }

        const estudiante = this.obtenerDatosFormulario();

        // Verificar si la cédula ya existe (excepto cuando editamos)
        if (this.editandoIndice === -1) {
            const cedulaExiste = this.estudiantes.some(est => est.cedula === estudiante.cedula);
            if (cedulaExiste) {
                alert('Ya existe un estudiante registrado con esta cédula');
                return;
            }
        }

        if (this.editandoIndice >= 0) {
            // Modo edición
            this.estudiantes[this.editandoIndice] = estudiante;
            this.editandoIndice = -1;
            const btnRegistrar = document.querySelector('.btn-registrar');
            if (btnRegistrar) {
                btnRegistrar.textContent = '📝 Registrar Estudiante';
            }
        } else {
            // Nuevo registro
            this.estudiantes.push(estudiante);
        }

        this.guardarEstudiantes();
        this.mostrarEstudiantes();
        this.actualizarContador();
        this.limpiarFormulario();
        alert('✅ Estudiante registrado exitosamente');
    }

    eliminarEstudiante(indice) {
        if (confirm('¿Está seguro de eliminar este estudiante?')) {
            this.estudiantes.splice(indice, 1);
            this.guardarEstudiantes();
            this.mostrarEstudiantes();
            this.actualizarContador();
            alert('Estudiante eliminado correctamente');
        }
    }

    editarEstudiante(indice) {
        const estudiante = this.estudiantes[indice];
        if (!estudiante) return;
        
        const cedula = document.getElementById('cedula');
        const apellidos = document.getElementById('apellidos');
        const nombres = document.getElementById('nombres');
        const direccion = document.getElementById('direccion');
        const telefono = document.getElementById('telefono');
        const correo = document.getElementById('correo');
        const facultad = document.getElementById('facultad');
        const nivel = document.getElementById('nivel');
        const paralelo = document.getElementById('paralelo');
        
        if (cedula) cedula.value = estudiante.cedula;
        if (apellidos) apellidos.value = estudiante.apellidos;
        if (nombres) nombres.value = estudiante.nombres;
        if (direccion) direccion.value = estudiante.direccion;
        if (telefono) telefono.value = estudiante.telefono;
        if (correo) correo.value = estudiante.correo;
        if (facultad) facultad.value = estudiante.facultad;
        if (nivel) nivel.value = estudiante.nivel;
        if (paralelo) paralelo.value = estudiante.paralelo;

        this.editandoIndice = indice;
        const btnRegistrar = document.querySelector('.btn-registrar');
        if (btnRegistrar) {
            btnRegistrar.textContent = '✏️ Actualizar Estudiante';
        }
        
        // Scroll al formulario
        const formulario = document.getElementById('formularioEstudiante');
        if (formulario) {
            formulario.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Validar todos los campos después de cargar los datos
        const campos = ['cedula', 'apellidos', 'nombres', 'direccion', 'telefono', 'correo', 'facultad', 'nivel', 'paralelo'];
        campos.forEach(campo => this.validarCampo(campo));
    }

    mostrarEstudiantes() {
        const self = this;
        const tbody = document.getElementById('cuerpoTabla');
        
        if (!tbody) return;
        
        if (this.estudiantes.length === 0) {
            tbody.innerHTML = '<tr class="no-registros"><td colspan="7">No hay estudiantes registrados</td></tr>';
            return;
        }

        tbody.innerHTML = this.estudiantes.map((estudiante, indice) => `
            <tr>
                <td>${estudiante.cedula}</td>
                <td>${estudiante.apellidos}</td>
                <td>${estudiante.nombres}</td>
                <td>${estudiante.facultad}</td>
                <td>${estudiante.nivel}</td>
                <td>${estudiante.paralelo}</td>
                <td class="acciones">
                    <button class="btn-editar" onclick="sistema.editarEstudiante(${indice})">✏️</button>
                    <button class="btn-eliminar" onclick="sistema.eliminarEstudiante(${indice})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    actualizarContador() {
        const totalEstudiantes = document.getElementById('totalEstudiantes');
        if (totalEstudiantes) {
            totalEstudiantes.textContent = this.estudiantes.length;
        }
    }

    guardarEstudiantes() {
        try {
            localStorage.setItem('estudiantes', JSON.stringify(this.estudiantes));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    cargarEstudiantes() {
        try {
            const datos = localStorage.getItem('estudiantes');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar de localStorage:', error);
            return [];
        }
    }

    limpiarFormulario() {
        const formulario = document.getElementById('formularioEstudiante');
        if (formulario) {
            formulario.reset();
        }
        
        this.editandoIndice = -1;
        const btnRegistrar = document.querySelector('.btn-registrar');
        if (btnRegistrar) {
            btnRegistrar.textContent = '📝 Registrar Estudiante';
        }
        
        // Limpiar clases de validación
        const campos = document.querySelectorAll('input, select');
        campos.forEach(campo => {
            campo.classList.remove('valid', 'error');
        });
        
        // Limpiar mensajes de error
        const errores = document.querySelectorAll('.error-message');
        errores.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
    }

    exportarDatos() {
        if (this.estudiantes.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const datosExport = this.estudiantes.map(est => ({
            'Cédula': est.cedula,
            'Apellidos': est.apellidos,
            'Nombres': est.nombres,
            'Dirección': est.direccion,
            'Teléfono': est.telefono,
            'Correo': est.correo,
            'Facultad': est.facultad,
            'Nivel': est.nivel,
            'Paralelo': est.paralelo,
            'Fecha Registro': est.fechaRegistro
        }));

        // Crear archivo JSON
        const blob = new Blob([JSON.stringify(datosExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estudiantes_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('✅ Datos exportados exitosamente');
    }
}

// Inicializar el sistema cuando el DOM esté completamente cargado
let sistema;

// Usar DOMContentLoaded para asegurar que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaEstudiantes();
});