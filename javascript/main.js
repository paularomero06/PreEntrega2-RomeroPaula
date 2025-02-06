
if (!localStorage.getItem("inscripciones")) {
    localStorage.setItem("inscripciones", JSON.stringify([]));
}


async function cargarClases() {
    try {
        const response = await fetch("/javascript/classData.json");
        const clases = await response.json();
        return clases;
    } catch (error) {
        console.error("Error al cargar las clases:", error);
        return [];
    }
}


document.getElementById("mostrarClases").addEventListener("click", async () => {
    const clasesDisponibles = document.getElementById("clasesDisponibles");
    clasesDisponibles.innerHTML = "<h3 class='animate__animated animate__fadeIn'>Cargando clases...</h3>";

    const clases = await cargarClases();

    clasesDisponibles.innerHTML = "<h3>Opciones de clases disponibles:</h3>";

    clases.forEach((clase, index) => {
        clasesDisponibles.innerHTML += `
            <div class="animate__animated animate__fadeIn">
                <p>${index + 1}. ${clase.nombre} - Horario: ${clase.horario}, Profesora: ${clase.profesora}</p>
                <button onclick="inscribirse(${index})">Inscribirse</button>
            </div>
        `;
    });
});


async function inscribirse(index) {
    const clases = await cargarClases();
    const claseElegida = clases[index];

    let inscripciones = JSON.parse(localStorage.getItem("inscripciones")) || [];
    inscripciones.push(claseElegida);
    localStorage.setItem("inscripciones", JSON.stringify(inscripciones));

    Swal.fire({
        title: "Inscripción confirmada",
        text: `Te has inscripto en: ${claseElegida.nombre} - ${claseElegida.horario}`,
        icon: "success"
    });
}



// historial 
document.getElementById("verInscripciones").addEventListener("click", () => {
    const historial = document.getElementById("historialInscripciones");
    let inscripciones = JSON.parse(localStorage.getItem("inscripciones")) || [];

    if (inscripciones.length > 0) {
        historial.innerHTML = "<h3>Historial de Inscripciones:</h3>";
        inscripciones.forEach(inscripcion => {
            historial.innerHTML += `<p>${inscripcion.nombre} - Horario: ${inscripcion.horario}, Profesora: ${inscripcion.profesora}</p>`;
        });
    } else {
        historial.innerHTML = "<p>No tienes inscripciones registradas.</p>";
    }
});

// Encuesta
let opcionesEncuesta = [];
let seleccionUsuario = "";

async function cargarEncuesta() {
    try {
        const response = await fetch("javascript/encuesta.json");
        if (!response.ok) throw new Error("No se pudo cargar el JSON");
        opcionesEncuesta = await response.json();
        mostrarOpciones();
        inicializarGrafico();
    } catch (error) {
        console.error("Error:", error);
    }
}

function mostrarOpciones() {
    const contenedor = document.getElementById("encuestaOpciones");
    contenedor.innerHTML = "";
    opcionesEncuesta.forEach((opcion, index) => {
        contenedor.innerHTML += `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="tecnica" id="opcion${index}" value="${opcion.tecnica}">
                <label class="form-check-label" for="opcion${index}">${opcion.tecnica}</label>
            </div>
        `;
    });
    document.querySelectorAll('input[name="tecnica"]').forEach(input => {
        input.addEventListener("change", (event) => {
            seleccionUsuario = event.target.value;
        });
    });
}

document.getElementById("votar").addEventListener("click", () => {
    if (!seleccionUsuario) {
        Swal.fire({
            title: "Error",
            text: `Por favor elegir una opción`,
            icon: "error"
        });
        return;
    }
    let votosGuardados = JSON.parse(localStorage.getItem("votosEncuesta")) || opcionesEncuesta;
    votosGuardados = votosGuardados.map(opcion => opcion.tecnica === seleccionUsuario ? { ...opcion, votos: opcion.votos + 1 } : opcion);
    localStorage.setItem("votosEncuesta", JSON.stringify(votosGuardados));
    Swal.fire({
        title: "Voto confirmado",
        text: `Muchas Gracias! Has votado: ${seleccionUsuario}`,
        icon: "success"
    });
    actualizarGrafico();
});

let chart;
function inicializarGrafico() {
    let ctx = document.getElementById("graficoEncuesta").getContext("2d");
    chart = new Chart(ctx, {
        type: "bar",
        data: { labels: [], datasets: [{ label: "Votos", data: [], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"], borderColor: "#333", borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
}

function actualizarGrafico() {
    let votos = JSON.parse(localStorage.getItem("votosEncuesta")) || opcionesEncuesta;
    let etiquetas = votos.map(opcion => opcion.tecnica);
    let valores = votos.map(opcion => opcion.votos);
    if (chart) chart.destroy();
    let ctx = document.getElementById("graficoEncuesta").getContext("2d");
    chart = new Chart(ctx, {
        type: "bar",
        data: { labels: etiquetas, datasets: [{ label: "Votos", data: valores, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"], borderColor: "#333", borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
}

cargarEncuesta();
