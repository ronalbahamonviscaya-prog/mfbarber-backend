document.addEventListener('DOMContentLoaded', function() {

    // FORMULARIO LOGIN
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('btnLogin');
            const errorDiv = document.getElementById('errorLogin');

            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';
            btn.disabled = true;
            if (errorDiv) errorDiv.style.display = 'none';

            try {
                const respuesta = await apiRequest('POST', '/usuarios/login', { email, password });
                localStorage.setItem('token', respuesta.access_token);
                localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

                const rol = respuesta.usuario.rol;
                if (rol === 'admin') {
                    window.location.href = 'dashboard_admin.html';
                } else if (rol === 'barbero') {
                    window.location.href = 'dashboard_barbero.html';
                } else {
                    window.location.href = 'dashboard_cliente.html';
                }
            } catch (error) {
                let mensaje = error.message;
                if (mensaje.includes('401') || mensaje.includes('Credenciales')) {
                    mensaje = 'Correo o contraseña incorrectos. Verifica tus datos.';
                }
                if (errorDiv) {
                    errorDiv.textContent = mensaje;
                    errorDiv.style.display = 'block';
                }
                btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>ENTRAR';
                btn.disabled = false;
            }
        });
    }

    // FORMULARIO REGISTRO
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const datos = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                telefono: document.getElementById('telefono').value,
                rol: 'cliente'
            };

            const btn = document.getElementById('btnRegistro');
            const errorDiv = document.getElementById('errorRegistro');
            const successDiv = document.getElementById('successRegistro');

            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';
            btn.disabled = true;
            if (errorDiv) errorDiv.style.display = 'none';
            if (successDiv) successDiv.style.display = 'none';

            try {
                await apiRequest('POST', '/usuarios/registro', datos);
                if (successDiv) successDiv.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                let mensaje = error.message;
                if (mensaje.includes('400') || mensaje.includes('registrado')) {
                    mensaje = 'Este correo ya tiene una cuenta registrada. Intenta iniciar sesión.';
                }
                if (errorDiv) {
                    errorDiv.textContent = mensaje;
                    errorDiv.style.display = 'block';
                }
                btn.innerHTML = '<i class="bi bi-person-plus me-2"></i>REGISTRARME';
                btn.disabled = false;
            }
        });
    }
});