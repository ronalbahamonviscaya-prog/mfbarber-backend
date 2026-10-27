const ROJO = '#A71925';
const ROJO_HOVER = '#C51F2C';

const BARBEROS = [
    { id: 5, nombre: 'James Mauricio Valencia', especialidad: 'Especialista en Fades y Diseños', foto: 'img/james.jpg' },
    { id: 15, nombre: 'Jordy', especialidad: 'Especialista en Cortes Modernos', foto: 'img/jordy.jpg' }
];

async function cargarServicios() {
    try {
        const servicios = await apiRequest('GET', '/servicios/');
        const contenedor = document.getElementById('serviciosContainer');
        if (!contenedor) return;
        contenedor.innerHTML = servicios.map(s => `
            <div class="col-md-4 mb-4">
                <div style="background:#151515;border:1px solid #292929;border-radius:8px;overflow:hidden;transition:all 0.3s;"
                     onmouseover="this.style.borderColor='${ROJO}';this.style.transform='translateY(-3px)'"
                     onmouseout="this.style.borderColor='#292929';this.style.transform='translateY(0)'">
                    <div style="overflow:hidden;">
                        <img src="img/${s.imagen}"
                             style="width:100%;height:200px;object-fit:cover;transition:transform 0.3s;"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'"
                             onerror="this.src='https://via.placeholder.com/400x200/151515/A71925?text=MF+BARBER'"
                             alt="${s.nombre}">
                    </div>
                    <div style="padding:1rem;text-align:center;">
                        <p style="font-family:'Oswald';color:#F5F5F5;letter-spacing:1px;font-size:13px;margin-bottom:3px;">${s.nombre}</p>
                        <p style="font-family:'Bebas Neue';font-size:1.8rem;color:${ROJO};margin-bottom:10px;">$${Number(s.precio).toLocaleString()}</p>
                        <button onclick="mostrarFormReserva(${s.id}, '${s.nombre.replace(/'/g, "\\'")}')"
                                style="background:${ROJO};color:#fff;font-family:'Oswald';letter-spacing:2px;padding:9px;border:none;border-radius:4px;width:100%;cursor:pointer;transition:all 0.3s;font-size:13px;"
                                onmouseover="this.style.background='${ROJO_HOVER}'"
                                onmouseout="this.style.background='${ROJO}'">
                            <i class="bi bi-calendar-check me-1"></i>RESERVAR
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarFormReserva(id_servicio, nombre_servicio) {
    const usuario = getUsuario();
    if (!usuario) { window.location.href = 'login.html'; return; }
    const anterior = document.getElementById('modalReserva');
    if (anterior) anterior.remove();

    // Fecha minima hoy y hora minima actual
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    const horaActual = ahora.getHours();

    // Filtrar horas disponibles — solo horas futuras
    const horasDisponibles = [10,11,12,13,14,15,16,17,18,19,20].filter(h => {
        const fechaInput = document.getElementById ? document.getElementById('fechaReserva') : null;
        return true; // se filtra dinamicamente al cambiar fecha
    });

    const modal = document.createElement('div');
    modal.id = 'modalReserva';
    modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;">
            <div style="background:#151515;border:1px solid ${ROJO};border-radius:8px;padding:2rem;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                    <h5 style="font-family:'Bebas Neue';letter-spacing:4px;color:#F5F5F5;margin:0;font-size:1.3rem;">RESERVAR CORTE</h5>
                    <button onclick="document.getElementById('modalReserva').remove();barberoSeleccionado=null;"
                            style="background:none;border:none;color:#A6A6A6;font-size:1.5rem;cursor:pointer;">✕</button>
                </div>

                <div style="background:rgba(167,25,37,0.1);border-left:3px solid ${ROJO};padding:10px 14px;margin-bottom:1.5rem;border-radius:0 4px 4px 0;">
                    <span style="font-family:'Oswald';color:${ROJO};font-size:11px;letter-spacing:3px;">CORTE SELECCIONADO</span><br>
                    <span style="color:#F5F5F5;font-family:'Oswald';">${nombre_servicio}</span>
                </div>

                <div style="margin-bottom:1.5rem;">
                    <label style="font-family:'Oswald';color:#A6A6A6;font-size:11px;letter-spacing:3px;display:block;margin-bottom:10px;">ELIGE TU BARBERO *</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        ${BARBEROS.map(b => `
                            <div onclick="seleccionarBarbero(${b.id})" id="barbero-${b.id}"
                                 style="background:#0D0D0D;border:1px solid #292929;border-radius:6px;padding:12px;text-align:center;cursor:pointer;transition:all 0.3s;">
                                <img src="${b.foto}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:8px;border:2px solid #292929;"
                                     onerror="this.src='https://via.placeholder.com/60/151515/A71925?text=${b.nombre.charAt(0)}'">
                                <p style="font-family:'Oswald';color:#F5F5F5;font-size:12px;margin:0;letter-spacing:1px;">${b.nombre}</p>
                                <p style="font-family:'Rajdhani';color:#A6A6A6;font-size:11px;margin:3px 0 0;">${b.especialidad}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-bottom:1rem;">
                    <label style="font-family:'Oswald';color:#A6A6A6;font-size:11px;letter-spacing:3px;display:block;margin-bottom:5px;">FECHA *</label>
                    <input type="date" id="fechaReserva" min="${hoy}"
                           onchange="actualizarHoras()"
                           style="width:100%;background:rgba(255,255,255,0.03);border:1px solid #292929;color:#F5F5F5;border-radius:4px;padding:10px 14px;font-family:'Oswald';">
                </div>

                <div style="margin-bottom:1rem;">
                    <label style="font-family:'Oswald';color:#A6A6A6;font-size:11px;letter-spacing:3px;display:block;margin-bottom:5px;">HORA *</label>
                    <select id="horaReserva"
                            style="width:100%;background:#151515;border:1px solid #292929;color:#F5F5F5;border-radius:4px;padding:10px 14px;font-family:'Oswald';">
                        <option value="">Selecciona una fecha primero</option>
                    </select>
                </div>

                <div style="margin-bottom:1.5rem;">
                    <label style="font-family:'Oswald';color:#A6A6A6;font-size:11px;letter-spacing:3px;display:block;margin-bottom:5px;">COMENTARIO (OPCIONAL)</label>
                    <textarea id="comentarioReserva" rows="2"
                              style="width:100%;background:rgba(255,255,255,0.03);border:1px solid #292929;color:#F5F5F5;border-radius:4px;padding:10px 14px;font-family:'Oswald';resize:none;"></textarea>
                </div>

                <div id="errorReserva" style="display:none;background:rgba(167,25,37,0.1);border:1px solid ${ROJO};color:#ff6b6b;border-radius:4px;padding:10px;font-family:'Oswald';font-size:13px;margin-bottom:1rem;"></div>

                <button onclick="confirmarReserva(${id_servicio})"
                        style="background:${ROJO};color:#fff;font-family:'Oswald';letter-spacing:3px;padding:12px;border:none;border-radius:4px;width:100%;cursor:pointer;transition:all 0.3s;font-size:14px;"
                        onmouseover="this.style.background='${ROJO_HOVER}'"
                        onmouseout="this.style.background='${ROJO}'">
                    <i class="bi bi-check-circle me-2"></i>CONFIRMAR RESERVA
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function actualizarHoras() {
    const fecha = document.getElementById('fechaReserva').value;
    const select = document.getElementById('horaReserva');
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    const horaActual = ahora.getHours();
    const horas = [10,11,12,13,14,15,16,17,18,19,20];
    select.innerHTML = horas
        .filter(h => fecha > hoy || (fecha === hoy && h > horaActual + 1))
        .map(h => `<option value="${String(h).padStart(2,'0')}:00">${h}:00 ${h < 12 ? 'AM' : 'PM'}</option>`)
        .join('');
    if (!select.innerHTML) {
        select.innerHTML = '<option value="">No hay horas disponibles para hoy</option>';
    }
}

let barberoSeleccionado = null;

function seleccionarBarbero(id) {
    barberoSeleccionado = id;
    BARBEROS.forEach(b => {
        const el = document.getElementById(`barbero-${b.id}`);
        if (el) {
            el.style.borderColor = b.id === id ? ROJO : '#292929';
            el.style.background = b.id === id ? 'rgba(167,25,37,0.1)' : '#0D0D0D';
            const img = el.querySelector('img');
            if (img) img.style.borderColor = b.id === id ? ROJO : '#292929';
        }
    });
}

async function confirmarReserva(id_servicio) {
    const usuario = getUsuario();
    const fecha = document.getElementById('fechaReserva').value;
    const hora = document.getElementById('horaReserva').value;
    const comentario = document.getElementById('comentarioReserva').value;
    const errorDiv = document.getElementById('errorReserva');

    errorDiv.style.display = 'none';

    if (!barberoSeleccionado) {
        errorDiv.textContent = 'Selecciona un barbero';
        errorDiv.style.display = 'block';
        return;
    }
    if (!fecha) {
        errorDiv.textContent = 'Selecciona una fecha';
        errorDiv.style.display = 'block';
        return;
    }
    if (!hora || hora === '') {
        errorDiv.textContent = 'Selecciona una hora valida';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        await apiRequest('POST', `/reservas/?id_cliente=${usuario.id}&id_barbero=${barberoSeleccionado}`, {
            id_servicio, fecha_reserva: fecha, hora_reserva: hora, comentario
        }, getToken());
        document.getElementById('modalReserva').remove();
        barberoSeleccionado = null;
        alert('Reserva creada exitosamente!');
        if (typeof mostrarTab === 'function') mostrarTab('reservas');
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

async function cargarMisReservas() {
    const usuario = getUsuario();
    if (!usuario) return;
    try {
        const reservas = await apiRequest('GET', `/reservas/cliente/${usuario.id}`, null, getToken());
        const contenedor = document.getElementById('misReservas');
        if (!contenedor) return;
        if (reservas.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align:center;padding:3rem;color:#A6A6A6;font-family:'Oswald';letter-spacing:2px;">
                    <i class="bi bi-calendar-x" style="font-size:3rem;color:#292929;display:block;margin-bottom:1rem;"></i>
                    No tienes reservas aun
                </div>`;
            return;
        }
        contenedor.innerHTML = `
            <div style="background:#151515;border:1px solid #292929;border-radius:8px;overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;min-width:600px;">
                    <thead>
                        <tr style="background:#0D0D0D;">
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">#</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">SERVICIO</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">BARBERO</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">ESTADO</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">FECHA</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">HORA</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">ACCION</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${reservas.map(r => {
                        const barbero = BARBEROS.find(b => b.id === r.id_barbero);
                        return `
                        <tr style="border-bottom:1px solid #1a1a1a;">
                            <td style="padding:12px 16px;color:#F5F5F5;font-family:'Rajdhani';">${r.id}</td>
                            <td style="padding:12px 16px;color:#F5F5F5;font-family:'Rajdhani';font-size:13px;">${r.id_servicio}</td>
                            <td style="padding:12px 16px;">
                                ${barbero ? `
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <img src="${barbero.foto}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1px solid ${ROJO};"
                                         onerror="this.src='https://via.placeholder.com/30/151515/A71925?text=${barbero.nombre.charAt(0)}'">
                                    <span style="font-family:'Oswald';color:#F5F5F5;font-size:12px;">${barbero.nombre}</span>
                                </div>` : `<span style="color:#A6A6A6;">${r.nombre_barbero || '—'}</span>`}
                            </td>
                            <td style="padding:12px 16px;">
                                <span style="background:${r.estado=='Listo'?'#1a4d2e':r.estado=='Cancelado'?'#4d1a1a':r.estado=='En Curso'?'rgba(167,25,37,0.2)':'#1a1a2e'};
                                             color:${r.estado=='Listo'?'#25D366':r.estado=='Cancelado'?'#ff6b6b':r.estado=='En Curso'?'#A71925':'#A6A6A6'};
                                             border:1px solid ${r.estado=='Listo'?'#25D366':r.estado=='Cancelado'?'#A71925':r.estado=='En Curso'?'#A71925':'#292929'};
                                             padding:3px 10px;border-radius:3px;font-family:'Oswald';font-size:11px;letter-spacing:2px;white-space:nowrap;">
                                    ${r.estado}
                                </span>
                            </td>
                            <td style="padding:12px 16px;color:#A6A6A6;font-family:'Rajdhani';white-space:nowrap;">${r.fecha_reserva}</td>
                            <td style="padding:12px 16px;color:#A6A6A6;font-family:'Rajdhani';white-space:nowrap;">${r.hora_reserva}</td>
                            <td style="padding:12px 16px;">
                                ${r.estado === 'Pendiente' ? `
                                <button onclick="cancelarReserva(${r.id})"
                                        style="background:transparent;border:1px solid ${ROJO};color:${ROJO};font-family:'Oswald';letter-spacing:1px;font-size:11px;padding:5px 12px;border-radius:3px;cursor:pointer;transition:all 0.3s;white-space:nowrap;"
                                        onmouseover="this.style.background='${ROJO}';this.style.color='#fff'"
                                        onmouseout="this.style.background='transparent';this.style.color='${ROJO}'">
                                    <i class="bi bi-x-circle me-1"></i>Cancelar
                                </button>` : '<span style="color:#292929;">—</span>'}
                            </td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cancelarReserva(id) {
    if (!confirm('Seguro que quieres cancelar esta reserva?')) return;
    try {
        await apiRequest('DELETE', `/reservas/${id}`, null, getToken());
        alert('Reserva cancelada');
        cargarMisReservas();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function cargarTodasReservas() {
    try {
        const usuario = getUsuario();
        let url = '/reservas/';
        if (usuario && usuario.rol === 'barbero') {
            url = `/reservas/barbero/${usuario.id}`;
        }
        const reservas = await apiRequest('GET', url, null, getToken());
        const contenedor = document.getElementById('todasReservas');
        if (!contenedor) return;
        if (reservas.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align:center;padding:3rem;color:#A6A6A6;font-family:'Oswald';letter-spacing:2px;">
                    <i class="bi bi-calendar-x" style="font-size:3rem;color:#292929;display:block;margin-bottom:1rem;"></i>
                    No hay reservas asignadas
                </div>`;
            return;
        }
        contenedor.innerHTML = `
            <div style="background:#151515;border:1px solid #292929;border-radius:8px;overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;min-width:700px;">
                    <thead>
                        <tr style="background:#0D0D0D;">
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">#</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">CLIENTE</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">SERVICIO</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">ESTADO</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">FECHA</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">HORA</th>
                            <th style="padding:12px 16px;font-family:'Oswald';color:${ROJO};letter-spacing:2px;font-size:12px;border-bottom:1px solid #292929;">CAMBIAR</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${reservas.map(r => `
                        <tr style="border-bottom:1px solid #1a1a1a;">
                            <td style="padding:12px 16px;color:#F5F5F5;font-family:'Rajdhani';">${r.id}</td>
                            <td style="padding:12px 16px;">
                                <span style="font-family:'Oswald';color:#F5F5F5;font-size:13px;">${r.nombre_cliente}</span>
                            </td>
                            <td style="padding:12px 16px;color:#F5F5F5;font-family:'Rajdhani';font-size:13px;">${r.id_servicio}</td>
                            <td style="padding:12px 16px;">
                                <span style="background:${r.estado=='Listo'?'#1a4d2e':r.estado=='Cancelado'?'#4d1a1a':r.estado=='En Curso'?'rgba(167,25,37,0.2)':'#1a1a2e'};
                                             color:${r.estado=='Listo'?'#25D366':r.estado=='Cancelado'?'#ff6b6b':r.estado=='En Curso'?'#A71925':'#A6A6A6'};
                                             border:1px solid ${r.estado=='Listo'?'#25D366':r.estado=='Cancelado'?'#A71925':r.estado=='En Curso'?'#A71925':'#292929'};
                                             padding:3px 10px;border-radius:3px;font-family:'Oswald';font-size:11px;letter-spacing:2px;white-space:nowrap;">
                                    ${r.estado}
                                </span>
                            </td>
                            <td style="padding:12px 16px;color:#A6A6A6;font-family:'Rajdhani';white-space:nowrap;">${r.fecha_reserva}</td>
                            <td style="padding:12px 16px;color:#A6A6A6;font-family:'Rajdhani';white-space:nowrap;">${r.hora_reserva}</td>
                            <td style="padding:12px 16px;">
                                <select onchange="cambiarEstado(${r.id}, this.value)"
                                        style="background:#0D0D0D;border:1px solid #292929;color:#F5F5F5;border-radius:3px;padding:5px 8px;font-family:'Oswald';font-size:11px;cursor:pointer;">
                                    <option ${r.estado=='Pendiente'?'selected':''}>Pendiente</option>
                                    <option ${r.estado=='En Curso'?'selected':''}>En Curso</option>
                                    <option ${r.estado=='Listo'?'selected':''}>Listo</option>
                                    <option ${r.estado=='Cancelado'?'selected':''}>Cancelado</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cambiarEstado(id, estado) {
    try {
        await apiRequest('PATCH', `/reservas/${id}/estado`, { estado }, getToken());
        cargarTodasReservas();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}