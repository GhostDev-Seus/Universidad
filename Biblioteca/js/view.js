// js/view.js

class LibraryView {
    constructor() {
        // --- Referencias a elementos del DOM (Inputs) ---
        this.materialId = document.getElementById('materialIdentificador');
        this.materialTitulo = document.getElementById('materialTitulo');
        this.materialFecha = document.getElementById('materialFechaRegistro');
        this.materialCantidad = document.getElementById('materialCantidadRegistrada');
        this.personaNombre = document.getElementById('personaNombre');
        this.personaCedula = document.getElementById('personaCedula');
        this.personaRol = document.getElementById('personaRol');
        this.prestamoCedula = document.getElementById('prestamoCedula');
        this.prestamoId = document.getElementById('prestamoIdentificador');
        this.devolucionCedula = document.getElementById('devolucionCedula');
        this.devolucionId = document.getElementById('devolucionIdentificador');
        this.eliminarCedula = document.getElementById('eliminarCedula');
        this.incrementarId = document.getElementById('incrementarIdentificador');
        this.incrementarCantidad = document.getElementById('incrementarCantidad');

        // --- Referencias a áreas de display ---
        this.materialsList = document.getElementById('materialsList');
        this.historyBody = document.getElementById('historyBody');

        // --- Referencias a botones (para añadir listeners) ---
        this.btnRegistrarMaterial = document.getElementById('btnRegistrarMaterial');
        this.btnRegistrarPersona = document.getElementById('btnRegistrarPersona');
        this.btnEliminarPersona = document.getElementById('btnEliminarPersona');
        this.btnRegistrarPrestamo = document.getElementById('btnRegistrarPrestamo');
        this.btnRegistrarDevolucion = document.getElementById('btnRegistrarDevolucion');
        this.btnIncrementarCantidad = document.getElementById('btnIncrementarCantidad');
    }

    // --- Métodos para obtener datos de los formularios ---
    // Realizan una validación básica de presencia en la vista
    _validateInput(inputElement, message) {
        if (!inputElement.value.trim()) {
            this.showAlert('error', 'Campo Requerido', message);
            inputElement.focus(); // Poner foco en el campo faltante
            return false;
        }
        return true;
    }

    _validateNumberInput(inputElement, message, allowZero = false) {
        const value = parseInt(inputElement.value);
         if (isNaN(value) || (!allowZero && value <= 0)) {
             this.showAlert('error', 'Valor Inválido', message);
             inputElement.focus();
             return null; // Indicate failure specifically for number validation
         }
         return value; // Return the parsed number
    }

    getMaterialData() {
        if (!this._validateInput(this.materialId, 'El identificador del material es requerido.')) return null;
        if (!this._validateInput(this.materialTitulo, 'El título del material es requerido.')) return null;
        if (!this._validateInput(this.materialFecha, 'La fecha de registro es requerida.')) return null;
        const cantidad = this._validateNumberInput(this.materialCantidad, 'La cantidad debe ser un número positivo.', false);
        if (cantidad === null) return null;

        return {
            identificador: this.materialId.value.trim(),
            titulo: this.materialTitulo.value.trim(),
            fechaRegistro: this.materialFecha.value,
            cantidadRegistrada: cantidad
        };
    }

    getPersonaData() {
        if (!this._validateInput(this.personaNombre, 'El nombre de la persona es requerido.')) return null;
        if (!this._validateInput(this.personaCedula, 'La cédula de la persona es requerida.')) return null;
        if (!this._validateInput(this.personaRol, 'El rol de la persona es requerido.')) return null; // Aunque select, validar

        return {
            nombre: this.personaNombre.value.trim(),
            cedula: this.personaCedula.value.trim(),
            rol: this.personaRol.value
        };
    }

    getPrestamoData() {
        if (!this._validateInput(this.prestamoCedula, 'La cédula de la persona es requerida.')) return null;
        if (!this._validateInput(this.prestamoId, 'El identificador del material es requerido.')) return null;

        return {
            cedula: this.prestamoCedula.value.trim(),
            identificador: this.prestamoId.value.trim()
        };
    }

    getDevolucionData() {
        if (!this._validateInput(this.devolucionCedula, 'La cédula de la persona es requerida.')) return null;
        if (!this._validateInput(this.devolucionId, 'El identificador del material es requerido.')) return null;

        return {
            cedula: this.devolucionCedula.value.trim(),
            identificador: this.devolucionId.value.trim()
        };
    }

    getEliminarCedula() {
        if (!this._validateInput(this.eliminarCedula, 'Ingrese la cédula para eliminar.')) return null;
        return this.eliminarCedula.value.trim();
    }

     getIncrementarData() {
        if (!this._validateInput(this.incrementarId, 'El identificador del material es requerido.')) return null;
        const cantidad = this._validateNumberInput(this.incrementarCantidad, 'La cantidad a incrementar debe ser un número positivo.', false);
        if (cantidad === null) return null;

         return {
             identificador: this.incrementarId.value.trim(),
             cantidad: cantidad
         };
     }

    // --- Métodos para limpiar formularios ---
    clearMaterialForm() {
        this.materialId.value = '';
        this.materialTitulo.value = '';
        this.materialFecha.value = '';
        this.materialCantidad.value = '';
    }
     clearPersonaForm() {
        this.personaNombre.value = '';
        this.personaCedula.value = '';
        this.personaRol.value = 'estudiante'; // Reset a default
    }
     clearPrestamoForm() {
        this.prestamoCedula.value = '';
        this.prestamoId.value = '';
    }
     clearDevolucionForm() {
        this.devolucionCedula.value = '';
        this.devolucionId.value = '';
    }
     clearEliminarForm() {
        this.eliminarCedula.value = '';
    }
    clearIncrementarForm() {
        this.incrementarId.value = '';
        this.incrementarCantidad.value = '';
    }

    // --- Métodos para mostrar datos ---
    displayMaterials(materiales) {
        this.materialsList.innerHTML = ''; // Limpiar lista existente
        if (!materiales || materiales.length === 0) {
            this.materialsList.innerHTML = '<li class="list-group-item text-muted">No hay materiales registrados aún.</li>';
            return;
        }
        materiales.forEach(material => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-start'; // Bootstrap classes
            li.innerHTML = `
                <div class="ms-2 me-auto">
                  <div class="fw-bold">${material.titulo} <span class="badge bg-light text-dark">ID: ${material.identificador}</span></div>
                  <small class="text-muted">Registrado: ${material.fechaRegistro} | Total: ${material.cantidadRegistrada}</small>
                </div>
                <span class="badge ${material.cantidadActual > 0 ? 'bg-success' : 'bg-danger'} rounded-pill">
                    ${material.cantidadActual > 0 ? material.cantidadActual + ' Disponible(s)' : 'Agotado'}
                </span>
            `;
            this.materialsList.appendChild(li);
        });
    }

    displayHistory(historial) {
        this.historyBody.innerHTML = ''; // Limpiar tabla existente
        if (!historial || historial.length === 0) {
            this.historyBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay movimientos registrados aún.</td></tr>';
            return;
        }
        historial.forEach(mov => {
            const row = this.historyBody.insertRow();
            row.innerHTML = `
                <td>${mov.fecha}</td>
                <td><span class="badge bg-${this._getBadgeClass(mov.tipo)}">${mov.tipo}</span></td>
                <td>${mov.material}</td>
                <td>${mov.persona}</td>
            `;
        });
    }

    // Helper para asignar clases de badge según tipo de movimiento
    _getBadgeClass(tipo) {
        switch (tipo.toLowerCase()) {
            case 'préstamo': return 'primary';
            case 'devolución': return 'warning';
            case 'incremento': return 'info';
            default: return 'secondary';
        }
    }

    // --- Métodos para mostrar alertas/confirmaciones (Wrapper para SweetAlert2) ---
    showAlert(icon, title, text) {
        Swal.fire({ icon, title, text, timer: 2000, showConfirmButton: false }); // Auto-cierra success/error
    }

    showConfirm(title, text, confirmButtonText = 'Sí, confirmar', cancelButtonText = 'Cancelar') {
        return Swal.fire({ // Devuelve la promesa de SweetAlert
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText,
            cancelButtonText
        });
    }

    // --- Métodos para vincular eventos (Binding) ---
    // El controlador pasará sus funciones 'handler' a estos métodos
    bindAddMaterial(handler) {
        this.btnRegistrarMaterial.addEventListener('click', event => {
            event.preventDefault(); // Prevenir comportamiento por defecto si estuviera en un form
            handler();
        });
    }
    bindAddPerson(handler) {
        this.btnRegistrarPersona.addEventListener('click', event => {
             event.preventDefault();
             handler();
         });
    }
    bindDeletePerson(handler) {
        this.btnEliminarPersona.addEventListener('click', event => {
             event.preventDefault();
             handler();
         });
    }
    bindAddLoan(handler) {
        this.btnRegistrarPrestamo.addEventListener('click', event => {
             event.preventDefault();
             handler();
         });
    }
     bindAddReturn(handler) {
        this.btnRegistrarDevolucion.addEventListener('click', event => {
             event.preventDefault();
             handler();
         });
    }
     bindIncrementQuantity(handler) {
         this.btnIncrementarCantidad.addEventListener('click', event => {
             event.preventDefault();
             handler();
         });
     }
}