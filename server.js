const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const conexionDB = mysql.createConnection({
    host: 'bvajk5b2dmnxovpnemb3-mysql.services.clever-cloud.com',
    user: 'upxs6qtvurucn76y',
    password: 'azdpi6WtLUPKRVHUDUA6',
    database: 'bvajk5b2dmnxovpnemb3',
    port: 3306
});

conexionDB.connect((error) => {
    if (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
        return;
    }
    console.log('✅ Conectado exitosamente a la base de datos.');
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/editar_curso', (req, res) => res.sendFile(path.join(__dirname, 'public', 'editar_curso.html')));
app.get('/grafico', (req, res) => res.sendFile(path.join(__dirname, 'public', 'grafico.html')));
app.get('/api/grafico', (req, res) => {
    const consulta = `
        SELECT c.nombre AS nombreCurso, COUNT(ac.idAlumno) AS totalAlumnos
        FROM AlumnosCursos ac
        JOIN Cursos c ON ac.idCurso = c.idCurso
        GROUP BY c.nombre;
    `;

    conexionDB.query(consulta, (error, resultados) => {
        if (error) {
            console.error('Error obteniendo datos:', error);
            return res.status(500).json({ error: 'Error al obtener datos' });
        }
        res.json(resultados);
    });
});

app.get('/cursos/:id/alumnos', (req, res) => {
    const cursoId = req.params.id;
    const consulta = `
        SELECT a.idAlumno AS id, a.nombre, ac.estado 
        FROM AlumnosCursos ac
        JOIN Alumnos a ON ac.idAlumno = a.idAlumno
        WHERE ac.idCurso = ?;
    `;

    conexionDB.query(consulta, [cursoId], (error, resultados) => {
        if (error) {
            console.error('⚠️ Error al obtener los alumnos:', error);
            return res.status(500).send('No se pudieron recuperar los alumnos.');
        }
        res.json(resultados);
    });
});

app.delete('/alumnos/:id', (req, res) => {
    const alumnoId = req.params.id;
    const consulta = 'DELETE FROM AlumnosCursos WHERE idAlumno = ?';

    conexionDB.query(consulta, [alumnoId], (error, resultado) => {
        if (error) {
            console.error('⚠️ Error al eliminar al alumno del curso:', error);
            return res.status(500).send('No se pudo eliminar al alumno del curso.');
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send('No se encontró la relación alumno-curso.');
        }
        res.send('✅ Alumno eliminado correctamente del curso.');
    });
});

app.get('/cursos/:id', (req, res) => {
    const cursoId = req.params.id;
    const consulta = 'SELECT * FROM Cursos WHERE idCurso = ?';

    conexionDB.query(consulta, [cursoId], (error, resultado) => {
        if (error) {
            console.error('⚠️ Error al recuperar curso:', error);
            return res.status(500).send('No se encontró el curso.');
        }
        if (resultado.length === 0) {
            return res.status(404).send('Curso no encontrado.');
        }
        res.json(resultado[0]);
    });
});

app.put('/cursos/:id', (req, res) => {
    const cursoId = req.params.id;
    const { nombre, descripcion, nivel, lugar, fecha_importacion } = req.body;

    const consulta = `
        UPDATE Cursos 
        SET nombre = ?, descripcion = ?, nivel = ?, lugar = ?, fechaImportacion = ?
        WHERE idCurso = ?;
    `;

    conexionDB.query(consulta, [nombre, descripcion, nivel, lugar, fecha_importacion, cursoId], (error, resultado) => {
        if (error) {
            console.error('⚠️ Error al actualizar curso:', error);
            return res.status(500).send('No se pudo actualizar el curso.');
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send('Curso no encontrado.');
        }
        res.send('✅ Curso actualizado exitosamente.');
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}`);
});
