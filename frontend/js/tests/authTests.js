/**
 * Test: POST /api/auth/login
 * PARTE I: Corrección de tests de ejemplo
 */

testUtils.createTestButton("Test Login Correcto (Pepe y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '12345' })
    });
    
    const data = await response.json();
    testUtils.log(data);

    // Valida que la respuesta sea exitosa (Status 200 OK)
    if (response.status === 200 || response.ok) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Password Incorrecto (Pepe y 123)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '123' })
    });
    
    const data = await response.json();
    testUtils.log(data);

    // Corregido para evaluar el código de estado 401 Unauthorized
    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Usuario Incorrecto (Juan y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'juan', password: '12345' }) // Corregido con los datos correspondientes
    });
    
    const data = await response.json();
    testUtils.log(data);

    // Corregido para evaluar el código de estado 401 Unauthorized
    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});


/**
 * PARTE II: Creación de tests adicionales
 */

// 1. Pruebas de Autenticación: Registro de Usuarios
testUtils.createTestButton("Test Registro - Usuario Nuevo", async (btn) => {
   // Generamos un username dinámico basado en tiempo para evitar errores por duplicados
   const usernameDinamico = `user_${Date.now()}`;
   
   const response = await fetch('/api/auth/register', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username: usernameDinamico, password: 'Password123!' })
   });
  
   const data = await response.json();
   testUtils.log(data);

   // Validamos que el servidor responda con un código 201 (Creado)
   if (response.status === 201) {
       testUtils.setSuccess(btn);
   }
});

// 2. Pruebas de Seguridad: El Intruso (403 Forbidden)
testUtils.createTestButton("Test Seguridad - Productor accediendo a Admin", async (btn) => {
   // Aseguramos la sesión llamando a la función okLogin() de la tutoría
   await okLogin();
   
   // Recuperamos el token guardado en el localStorage bajo la clave correcta
   const token = localStorage.getItem('test_token'); 

   const response = await fetch('/api/admin/users', {
       method: 'GET',
       headers: { 
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json' 
       }
   });
  
   const data = await response.json();
   testUtils.log(data);

   // El test es exitoso si el status de la respuesta es 403 Forbidden
   if (response.status === 403) {
       testUtils.setSuccess(btn);
   }
});

// 3. Pruebas de Recursos: Eliminación Dinámica de Samples
testUtils.createTestButton("Test Eliminar Sample Dinámico", async (btn) => {
   // Asegurar Sesión
   await okLogin();
   const token = localStorage.getItem('test_token');

   // Obtener Identificador de la lista actual de samples
   const responseGet = await fetch('/api/samples/my-samples', {
       method: 'GET',
       headers: { 'Authorization': `Bearer ${token}` }
   });
   
   const samples = await responseGet.json();

   // Validar Existencia de elementos en la respuesta
   if (!samples || samples.length === 0) {
       console.warn("Se debe subir un sample primero: la lista está vacía.");
       testUtils.log("Lista vacía. Sube un sample manualmente primero.");
       return; 
   }

   // Extraemos el id usando la propiedad indicada en la tutoría
   const targetId = samples.id;
   testUtils.log(`Intentando borrar el ID específico: ${targetId}`);

   // Ejecutar Eliminación mediante verbo HTTP DELETE
   const responseDelete = await fetch(`/api/samples/${targetId}`, {
       method: 'DELETE',
       headers: { 'Authorization': `Bearer ${token}` }
   });

   // Validación: exitoso si la API responde con un código de estado 200 u ok
   if (responseDelete.ok || responseDelete.status === 200) {
       testUtils.setSuccess(btn);
   }
});

// 4. Pruebas de Validación: Carga Incompleta
testUtils.createTestButton("Test Subir Sample - Error por Datos Faltantes", async (btn) => {
   await okLogin();
   const token = localStorage.getItem('test_token');

   // Simulamos la subida de un archivo de audio falso usando un Blob en memoria
   const mockAudioBlob = new Blob(["Contenido de audio"], { type: 'audio/wav' });

   // Omitimos los campos obligatorios como category o display_name
   const formData = new FormData();
   formData.append('audioFile', mockAudioBlob, 'test.wav'); 

   const response = await fetch('/api/samples/upload', {
       method: 'POST',
       headers: { 
           'Authorization': `Bearer ${token}`
           // Nota: No se agrega Content-Type para que el navegador resuelva los boundaries del FormData
       },
       body: formData
   });

   const data = await response.json();
   testUtils.log(data);

   // Validación: el servidor debería rechazar la petición con un error de validación 400
   if (response.status === 400) {
       testUtils.setSuccess(btn);
   }
});
