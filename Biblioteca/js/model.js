// js/model.js

class LibraryModel {
    constructor() {
        // Cargar desde localStorage para persistencia simple o inicializar vacío
        this.materiales = JSON.parse(localStorage.getItem('materiales')) || [];
        this.personas = JSON.parse(localStorage.getItem('personas')) || [];
        this.historial = JSON.parse(localStorage.getItem('historial')) || [];
    }

    // --- Métodos para persistencia ---
    _commit() {
        // Guardar el estado actual en localStorage
        localStorage.setItem('materiales', JSON.stringify(this.materiales));
        localStorage.setItem('personas', JSON.stringify(this.personas));
        localStorage.setItem('historial', JSON.stringify(this.historial));
    }

    // --- Métodos de Materiales ---
    addMaterial(data) {
        if (!data.identificador || !data.titulo || !data.fechaRegistro || isNaN(data.cantidadRegistrada) || data.cantidadRegistrada <= 0) {
             throw new Error('Datos del material inválidos o incompletos.');
        }
        if (this.materiales.some(m => m.identificador === data.identificador)) {
            throw new Error('Ya existe un material con ese identificador.');
        }
        const nuevoMaterial = {
            identificador: data.identificador.trim(),
            titulo: data.titulo.trim(),
            fechaRegistro: data.fechaRegistro,
            cantidadRegistrada: data.cantidadRegistrada,
            cantidadActual: data.cantidadRegistrada // Inicialmente, la cantidad actual es la registrada
        };
        this.materiales.push(nuevoMaterial);
        this._commit(); // Guardar cambios
        return nuevoMaterial; // Devolver el objeto creado
    }

    findMaterial(identificador) {
        return this.materiales.find(m => m.identificador === identificador.trim());
    }

    getMaterials() {
        return [...this.materiales]; // Devuelve una copia para evitar mutaciones externas
    }

    incrementMaterialQuantity(identificador, cantidad) {
        const material = this.findMaterial(identificador);
        if (!material) {
            throw new Error('Material no encontrado.');
        }
        if (isNaN(cantidad) || cantidad <= 0) {
             throw new Error('La cantidad a incrementar debe ser un número positivo.');
        }
        material.cantidadActual += cantidad;
        material.cantidadRegistrada += cantidad; // También incrementamos la registrada total
        this._registrarHistorial('Incremento', material.titulo, `Cantidad añadida: ${cantidad}`);
        this._commit();
        return material;
    }

    // --- Métodos de Personas ---
    addPerson(data) {
         if (!data.nombre || !data.cedula || !data.rol) {
             throw new Error('Datos de la persona inválidos o incompletos.');
         }
         const cedulaTrimmed = data.cedula.trim();
        if (this.personas.some(p => p.cedula === cedulaTrimmed)) {
            throw new Error('Ya existe una persona con esa cédula.');
        }
        const nuevaPersona = {
            nombre: data.nombre.trim(),
            cedula: cedulaTrimmed,
            rol: data.rol,
            prestados: [] // Array para IDs de materiales prestados
        };
        this.personas.push(nuevaPersona);
        this._commit();
        return nuevaPersona;
    }

    findPerson(cedula) {
        return this.personas.find(p => p.cedula === cedula.trim());
    }

    deletePerson(cedula) {
        const cedulaTrimmed = cedula.trim();
        const index = this.personas.findIndex(p => p.cedula === cedulaTrimmed);
        if (index === -1) {
            throw new Error('Persona no encontrada.');
        }
        if (this.personas[index].prestados.length > 0) {
            // Esta validación debería hacerse en el controlador antes de llamar a deletePerson,
            // pero la dejamos aquí como una salvaguarda final.
            throw new Error('Esta persona tiene materiales prestados y no puede ser eliminada.');
        }
        const deletedPerson = this.personas.splice(index, 1)[0];
        this._commit();
        return deletedPerson; // Devuelve la persona eliminada por si es útil
    }

    getPersons() {
         return [...this.personas]; // Devuelve copia
    }

    // --- Métodos de Préstamos/Devoluciones ---
    addLoan(cedula, identificador) {
        const persona = this.findPerson(cedula);
        const material = this.findMaterial(identificador);

        // Validaciones de existencia
        if (!persona) throw new Error('Persona no encontrada.');
        if (!material) throw new Error('Material no encontrado.');

        // Validaciones de estado
        if (material.cantidadActual <= 0) throw new Error('No hay ejemplares disponibles de este material.');
        if (persona.prestados.includes(material.identificador)) {
             throw new Error('Esta persona ya tiene prestado este material.');
        }

        // Lógica de límite de préstamos por rol
        const limitePrestamos = {
             'estudiante': 5,
             'profesor': 3,
             'administrativo': 1
        }[persona.rol] || 0; // Default 0 si el rol no coincide

        if (persona.prestados.length >= limitePrestamos) {
            throw new Error(`Límite de préstamos (${limitePrestamos}) alcanzado para el rol ${persona.rol}.`);
        }

        // Realizar el préstamo
        persona.prestados.push(material.identificador);
        material.cantidadActual--;
        this._registrarHistorial('Préstamo', material.titulo, `Prestado a: ${persona.nombre} (${persona.cedula})`);
        this._commit(); // Guardar estado de persona, material e historial
    }

    addReturn(cedula, identificador) {
        const persona = this.findPerson(cedula);
        const material = this.findMaterial(identificador);

        // Validaciones de existencia
        if (!persona) throw new Error('Persona no encontrada.');
        if (!material) throw new Error('Material no encontrado.');

        // Validar que la persona realmente tuviera este material prestado
        const prestamoIndex = persona.prestados.indexOf(material.identificador);
        if (prestamoIndex === -1) {
             throw new Error('Este material no figura como prestado a esta persona.');
        }

        // Realizar la devolución
        persona.prestados.splice(prestamoIndex, 1); // Quitar el ID del material de la lista de prestados
        material.cantidadActual++;
        this._registrarHistorial('Devolución', material.titulo, `Devuelto por: ${persona.nombre} (${persona.cedula})`);
        this._commit(); // Guardar estado de persona, material e historial
    }

     // --- Métodos de Historial ---
     _registrarHistorial(tipo, materialTitulo, detalle) {
        const entrada = {
            fecha: new Date().toLocaleDateString('es-ES'), // Formato local español
            tipo: tipo,
            material: materialTitulo,
            persona: detalle // El detalle ya incluye persona o info de incremento
        };
        this.historial.push(entrada);
        // No llamamos a _commit aquí, se llama desde la función que invoca (addLoan, addReturn, etc.)
        // para asegurar que todos los cambios se guarden juntos.
    }

    getHistory() {
        // Devuelve el historial, quizás ordenado por fecha si se implementara timestamp
        return [...this.historial].reverse(); // Mostrar el más reciente primero (opcional)
    }
}