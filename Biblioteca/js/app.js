// js/app.js

// Espera a que el DOM esté completamente cargado antes de inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Crea las instancias del Modelo, la Vista y el Controlador
    const model = new LibraryModel();
    const view = new LibraryView();
    const app = new LibraryController(model, view); // El controlador conecta el modelo y la vista

    console.log("Aplicación Biblioteca MVC inicializada.");
});