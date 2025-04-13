// js/controller.js

class LibraryController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // --- Bind de eventos ---
        // Conectar acciones de la vista (botones) con los handlers del controlador
        this.view.bindAddMaterial(this.handleAddMaterial);
        this.view.bindAddPerson(this.handleAddPerson);
        this.view.bindDeletePerson(this.handleDeletePerson);
        this.view.bindAddLoan(this.handleAddLoan);
        this.view.bindAddReturn(this.handleAddReturn);
        this.view.bindIncrementQuantity(this.handleIncrementQuantity);

        // --- Mostrar datos iniciales al cargar ---
        this.displayInitialData();
    }

    // Método para cargar y mostrar datos al iniciar
    displayInitialData = () => {
        try {
            this.view.displayMaterials(this.model.getMaterials());
            this.view.displayHistory(this.model.getHistory());
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            this.view.showAlert('error', 'Error de Carga', 'No se pudieron cargar los datos iniciales.');
        }
    }

    // --- Handlers (manejadores de eventos) ---
    // Usamos arrow functions para mantener el contexto 'this' correcto del controlador

    handleAddMaterial = () => {
        const data = this.view.getMaterialData(); // Obtener datos validados por la vista
        if (data) { // Si la vista devolvió datos válidos
            try {
                this.model.addMaterial(data); // Intentar añadir al modelo
                this.view.showAlert('success', 'Éxito', 'Material registrado correctamente.');
                this.view.clearMaterialForm(); // Limpiar formulario
                this.view.displayMaterials(this.model.getMaterials()); // Actualizar lista de materiales
            } catch (error) { // Si el modelo lanza un error (e.g., ID duplicado)
                this.view.showAlert('error', 'Error del Modelo', error.message);
            }
        }
        // Si data es null, la vista ya mostró un error de validación básico
    }

    handleAddPerson = () => {
        const data = this.view.getPersonaData();
        if (data) {
            try {
                this.model.addPerson(data);
                this.view.showAlert('success', 'Éxito', 'Persona registrada correctamente.');
                this.view.clearPersonaForm();
                // Opcional: Podríamos tener una lista de personas para actualizar
                // this.view.displayPersons(this.model.getPersons());
            } catch (error) {
                this.view.showAlert('error', 'Error del Modelo', error.message);
            }
        }
    }

    handleDeletePerson = async () => { // async porque usamos showConfirm que es una promesa
        const cedula = this.view.getEliminarCedula();
        if (cedula) {
            try {
                // Primero, verificar si la persona existe y si tiene préstamos (lógica del modelo)
                const person = this.model.findPerson(cedula);
                if (!person) {
                    throw new Error('Persona no encontrada.'); // Lanzar error si no existe
                }
                if (person.prestados.length > 0) {
                     throw new Error('Esta persona tiene materiales prestados y no puede ser eliminada.');
                }

                // Si pasa las validaciones, pedir confirmación al usuario
                const result = await this.view.showConfirm(
                    '¿Estás seguro?',
                    `Se eliminará a la persona: ${person.nombre} (${cedula}). Esta acción no se puede deshacer.`
                 );

                if (result.isConfirmed) { // Si el usuario confirma
                    this.model.deletePerson(cedula); // Proceder a eliminar en el modelo
                    this.view.showAlert('success', 'Eliminado', 'Persona eliminada correctamente.');
                    this.view.clearEliminarForm();
                    // Opcional: Actualizar lista de personas si existiera
                    // this.view.displayPersons(this.model.getPersons());
                }
            } catch (error) { // Captura errores del findPerson, validación de préstamos, o deletePerson
                this.view.showAlert('error', 'Error al Eliminar', error.message);
            }
        }
    }

    handleAddLoan = () => {
        const data = this.view.getPrestamoData();
        if (data) {
            try {
                this.model.addLoan(data.cedula, data.identificador);
                this.view.showAlert('success', 'Éxito', 'Préstamo registrado correctamente.');
                this.view.clearPrestamoForm();
                // Actualizar tanto materiales (disponibilidad) como historial
                this.view.displayMaterials(this.model.getMaterials());
                this.view.displayHistory(this.model.getHistory());
            } catch (error) {
                this.view.showAlert('error', 'Error de Préstamo', error.message);
            }
        }
    }

     handleAddReturn = () => {
        const data = this.view.getDevolucionData();
        if (data) {
            try {
                this.model.addReturn(data.cedula, data.identificador);
                this.view.showAlert('success', 'Éxito', 'Devolución registrada correctamente.');
                this.view.clearDevolucionForm();
                // Actualizar tanto materiales (disponibilidad) como historial
                this.view.displayMaterials(this.model.getMaterials());
                this.view.displayHistory(this.model.getHistory());
            } catch (error) {
                this.view.showAlert('error', 'Error de Devolución', error.message);
            }
        }
    }

     handleIncrementQuantity = () => {
        const data = this.view.getIncrementarData();
        if (data) {
            try {
                this.model.incrementMaterialQuantity(data.identificador, data.cantidad);
                this.view.showAlert('success', 'Éxito', 'Cantidad incrementada correctamente.');
                this.view.clearIncrementarForm();
                // Actualizar materiales (disponibilidad) y historial
                this.view.displayMaterials(this.model.getMaterials());
                this.view.displayHistory(this.model.getHistory());
            } catch (error) {
                this.view.showAlert('error', 'Error al Incrementar', error.message);
            }
        }
     }
}