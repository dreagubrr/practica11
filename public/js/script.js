// Función para obtener y mostrar los alumnos de un curso
async function obtenerAlumnos(cursoId) {
    if (!cursoId) {
        alert("Debes ingresar un ID de curso válido.");
        return;
    }
    try {
        const respuesta = await fetch(`/cursos/${cursoId}/alumnos`);
        const alumnos = await respuesta.json();

        const listaAlumnos = document.getElementById('lista-alumnos');
        listaAlumnos.innerHTML = '';

        if (alumnos.length === 0) {
            listaAlumnos.innerHTML = '<li>No hay alumnos inscritos en este curso.</li>';
            return;
        }

        alumnos.forEach(alumno => {
            const elemento = document.createElement('li');
            elemento.innerHTML = `
                ${alumno.nombre} - Estado: ${alumno.estado}  
                <button onclick="borrarAlumno(${alumno.id}, ${cursoId})">Quitar</button>
            `;
            listaAlumnos.appendChild(elemento);
        });
    } catch (error) {
        console.error('Ocurrió un problema al obtener los alumnos:', error);
    }
}

// Función para eliminar un alumno de un curso específico
async function borrarAlumno(idAlumno, cursoId) {
    const confirmacion = confirm('¿Deseas eliminar este alumno de la lista?');
    if (!confirmacion) return;

    try {
        await fetch(`/alumnos/${idAlumno}`, { method: 'DELETE' });
        alert('Alumno eliminado con éxito');
        obtenerAlumnos(cursoId); // Actualiza la lista sin recargar la página
    } catch (error) {
        console.error('Error al intentar eliminar el alumno:', error);
    }
}



// Función para obtener los datos del curso según el ID ingresado
async function obtenerCurso() {
    const idCurso = document.getElementById('cursoId').value;
    const respuesta = await fetch(`/cursos/${idCurso}`);
    
    if (respuesta.ok) {
        const datosCurso = await respuesta.json();
        document.getElementById('cursoForm').style.display = 'block';
        document.getElementById('nombre').value = datosCurso.nombre;
        document.getElementById('descripcion').value = datosCurso.descripcion;
        document.getElementById('nivel').value = datosCurso.nivel;
        document.getElementById('lugar').value = datosCurso.lugar;
        document.getElementById('fecha_importacion').value = datosCurso.fecha_importacion;
    } else {
        alert('⚠️ Curso no encontrado. Verifica el ID ingresado.');
    }
}

// Función para actualizar los datos del curso en la base de datos
async function modificarCurso(event) {
    event.preventDefault();
    const idCurso = document.getElementById('cursoId').value;
    const datosActualizados = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        nivel: document.getElementById('nivel').value,
        lugar: document.getElementById('lugar').value,
        fecha_importacion: document.getElementById('fecha_importacion').value
    };

    const respuesta = await fetch(`/cursos/${idCurso}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
    });

    if (respuesta.ok) {
        alert('✅ Curso actualizado con éxito.');
    } else {
        alert('❌ Hubo un error al actualizar el curso.');
    }
}
