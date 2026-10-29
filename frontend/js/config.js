const API_URL = 'https://mfbarber-backend.hostless.app';

async function apiRequest(method, endpoint, data = null, token = null) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };

    if (data instanceof FormData) {
        config.body = data;
    } else if (data) {
        headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(data);
    }

    const response = await fetch(API_URL + endpoint, config);
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Error en la peticion');
    return result;
}

async function apiUpload(method, endpoint, formData, token = null) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(API_URL + endpoint, {
        method,
        headers,
        body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Error en la peticion');
    return result;
}

function getToken() { return localStorage.getItem('token'); }
function getUsuario() { return JSON.parse(localStorage.getItem('usuario') || 'null'); }
function cerrarSesion() { localStorage.clear(); window.location.href = 'login.html'; }
function verificarAuth() {
    const token = getToken();
    if (!token) window.location.href = 'login.html';
    return token;
}