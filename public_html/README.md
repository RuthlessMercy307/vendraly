# Vendraly

Este repositorio contiene un prototipo de plataforma de microinversiones colaborativas que conecta inversores con emprendedores locales.

deberia funcionar con WebSocket 

## Variables de entorno

El archivo `config.php` obtiene la configuración de la base de datos de las siguientes variables de entorno y se encuentra fuera de public.html, osea en ../ y se conectara a la base de datos vendraly, que contiene las siguientes tablas

-- 👤 USUARIOS
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('usuario', 'soporte', 'admin') DEFAULT 'usuario',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📄 PERFIL EXTENDIDO
CREATE TABLE perfil_usuario (
    usuario_id INT PRIMARY KEY,
    bio TEXT,
    direccion TEXT,
    estado ENUM('activo', 'suspendido', 'en_verificacion', 'rechazado', 'bloqueado') DEFAULT 'en_verificacion',
    saldo DECIMAL(12,2) DEFAULT 0.00,
    documento_numero VARCHAR(20),
    foto_documento TEXT,
    foto_selfie TEXT,
    foto_de_lado TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 🔍 AUDITORÍA DE ACCIONES
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion TEXT,
    entidad_afectada VARCHAR(50),
    id_entidad INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 💰 STAKES
CREATE TABLE stakes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    monto DECIMAL(12,2),
    fecha_inicio DATE,
    bloqueado_hasta DATE,
    interes_acumulado DECIMAL(12,2) DEFAULT 0.00,
    estado ENUM('activo', 'finalizado', 'cancelado') DEFAULT 'activo',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 💼 PROYECTOS
CREATE TABLE proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('prestamo', 'acciones') NOT NULL,
    titulo VARCHAR(200),
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    estado ENUM('en_verificacion', 'activo', 'completo', 'cerrado', 'rechazado', 'suspendido') DEFAULT 'en_verificacion',
    nombre_usuario VARCHAR(100),
    categoria VARCHAR(100),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderado_por INT,
    fecha_revision TIMESTAMP NULL,
    motivo_rechazo TEXT,
    acumulado DECIMAL(12,2),
    necesario DECIMAL(12,2),
    plazo INT,
    retorno DECIMAL(5,2),
    porcentaje_vendido DECIMAL(5,2),
    porcentaje_disponible DECIMAL(5,2),
    precio_porcentaje DECIMAL(10,2),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (moderado_por) REFERENCES usuarios(id)
);

-- 💸 INVERSIONES
CREATE TABLE inversiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('prestamo', 'acciones') NOT NULL,
    proyecto_id INT NOT NULL,
    monto DECIMAL(12,2),
    ganancia_esperada DECIMAL(12,2),
    fecha_inicio DATE,
    pago_mensual BOOLEAN,
    fecha_pago_final DATE,
    porcentaje_adquirido DECIMAL(5,2),
    total_pagado DECIMAL(12,2),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

-- 💬 CHAT
CREATE TABLE conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('privado', 'grupo') NOT NULL,
    nombre VARCHAR(100)
);
CREATE TABLE miembros_conversacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE TABLE mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    emisor_id INT NOT NULL,
    texto TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (emisor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE TABLE ultima_lectura (
    usuario_id INT NOT NULL,
    conversacion_id INT NOT NULL,
    ultimo_mensaje_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, conversacion_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (ultimo_mensaje_id) REFERENCES mensajes(id) ON DELETE CASCADE
);
CREATE TABLE comentarios_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    autor_id INT NOT NULL,
    texto TEXT NOT NULL,
    calificacion TINYINT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
);
CREATE TABLE accesos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    ip VARCHAR(45),
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE TABLE negocios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo ENUM('restaurante', 'tienda', 'distribuidor', 'otro') DEFAULT 'otro',
    estado ENUM('activo', 'inactivo', 'en_verificacion') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE relacion_usuario_negocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    negocio_id INT NOT NULL,
    rol ENUM('dueño', 'empleado', 'gerente', 'revendedor') NOT NULL,
    permisos JSON,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (negocio_id) REFERENCES negocios(id) ON DELETE CASCADE
);
CREATE TABLE planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    limite_negocios INT,
    limite_usuarios INT,
    precio_mensual DECIMAL(10,2)
);
CREATE TABLE suscripciones_negocio (
    negocio_id INT PRIMARY KEY,
    plan_id INT NOT NULL,
    fecha_inicio DATE,
    fecha_renovacion DATE,
    estado ENUM('activo', 'vencido') DEFAULT 'activo',
    FOREIGN KEY (negocio_id) REFERENCES negocios(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes(id)
);
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(10,2),
    precio_costo DECIMAL(10,2),
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    unidad_medida VARCHAR(50),
    codigo_barras VARCHAR(100) UNIQUE,
    vencimiento DATE,
    imagen TEXT,
    tipo ENUM('insumo', 'producto', 'combo') DEFAULT 'producto',
    categoria_id INT,
    subcategoria_id INT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (negocio_id) REFERENCES negocios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id)
);
CREATE TABLE entradas_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por INT,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT,
    total_venta DECIMAL(10,2),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);
CREATE TABLE promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    descripcion TEXT,
    descuento_porcentaje DECIMAL(5,2),
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
CREATE TABLE registros_financieros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT,
    tipo ENUM('ingreso', 'gasto', 'fiado', 'cortesia', 'otros') NOT NULL,
    descripcion TEXT,
    monto DECIMAL(10,2),
    origen VARCHAR(100),      -- ejemplo: 'venta', 'pago_empleado'
    referencia_id INT,        -- ID relacionado si aplica
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por INT,
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

CREATE TABLE caja_diaria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT,
    fecha DATE NOT NULL,
    apertura DECIMAL(10,2),
    cierre DECIMAL(10,2),
    observaciones TEXT,
    abierto_por INT,
    cerrado_por INT,
    FOREIGN KEY (negocio_id) REFERENCES negocios(id),
    FOREIGN KEY (abierto_por) REFERENCES usuarios(id),
    FOREIGN KEY (cerrado_por) REFERENCES usuarios(id)
);
CREATE TABLE comandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT,
    tipo ENUM('mesa', 'delivery', 'mostrador') NOT NULL,
    cliente_nombre VARCHAR(100),
    cliente_telefono VARCHAR(20),
    direccion TEXT,
    estado ENUM('pendiente', 'preparando', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
    observaciones TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    qr_mesa_codigo VARCHAR(10),
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);
CREATE TABLE items_comanda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT,
    producto_id INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    descripcion_extra TEXT,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE log_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    modulo VARCHAR(100), -- ej: 'ventas', 'comandas', 'inventario'
    accion VARCHAR(100), -- ej: 'editar producto', 'cancelar item'
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE TABLE impresiones_comanda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    impreso_por INT,
    motivo TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id),
    FOREIGN KEY (impreso_por) REFERENCES usuarios(id)
);
CREATE TABLE log_entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    repartidor_id INT,
    estado ENUM('asignado', 'en_camino', 'entregado', 'fallido') NOT NULL,
    observaciones TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id),
    FOREIGN KEY (repartidor_id) REFERENCES usuarios(id)
);
CREATE TABLE items_cancelados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    motivo_cancelacion TEXT,
    cancelado_por INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (cancelado_por) REFERENCES usuarios(id)
);
CREATE TABLE ajustes_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo ENUM('ajuste_manual', 'merma', 'vencido', 'robo', 'otros') NOT NULL,
    cantidad INT NOT NULL,
    motivo TEXT,
    registrado_por INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);
CREATE TABLE pagos_comanda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    metodo ENUM('efectivo', 'tarjeta', 'pix', 'vale', 'otro') NOT NULL,
    monto DECIMAL(10,2) NOT NULL, -- total recibido del cliente (final, con descuento aplicado)
    propina_sugerida DECIMAL(10,2), -- por ejemplo, el 10% sugerido automáticamente
    propina_pagada DECIMAL(10,2) DEFAULT 0.00, -- lo que realmente pagó el cliente (puede ser 0)
    descuento_aplicado DECIMAL(10,2) DEFAULT 0.00, -- rebaja antes de pagar
    motivo_descuento TEXT, -- opcional: "cliente amigo", "reclamación", etc.
    vuelto DECIMAL(10,2) DEFAULT 0.00, -- cambio entregado
    pagado BOOLEAN DEFAULT FALSE, -- estado final
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE
);

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    titulo VARCHAR(200),
    mensaje TEXT,
    tipo ENUM('sistema', 'alerta', 'recordatorio', 'soporte', 'chat') DEFAULT 'sistema',
    leida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE pagos_recibidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT,
    usuario_id INT, -- quién recibió el pago
    origen VARCHAR(100), -- cliente, proveedor, etc.
    metodo_pago ENUM('efectivo', 'tarjeta', 'pix', 'transferencia', 'vale', 'otro'),
    descripcion TEXT,
    monto DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

CREATE TABLE turnos_empleado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    negocio_id INT,
    fecha DATE,
    hora_entrada TIME,
    hora_salida TIME,
    notas TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

CREATE TABLE pagos_empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT,
    negocio_id INT,
    monto DECIMAL(10,2),
    descripcion TEXT,
    fecha_pago DATE,
    registrado_por INT,
    FOREIGN KEY (empleado_id) REFERENCES usuarios(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

CREATE TABLE pagos_programados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT,
    titulo VARCHAR(200),
    descripcion TEXT,
    monto DECIMAL(10,2),
    frecuencia ENUM('unico', 'diario', 'semanal', 'mensual', 'anual'),
    fecha_inicio DATE,
    fecha_fin DATE, -- puede ser NULL si es indefinido
    dia_semana ENUM('lunes','martes','miércoles','jueves','viernes','sábado','domingo'), -- opcional
    activo BOOLEAN DEFAULT TRUE,
    creado_por INT,
    FOREIGN KEY (negocio_id) REFERENCES negocios(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

CREATE TABLE historial_precios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    precio_anterior DECIMAL(10,2),
    precio_nuevo DECIMAL(10,2),
    cambiado_por INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (cambiado_por) REFERENCES usuarios(id)
);
CREATE TABLE historial_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    relacion_id INT,
    permisos_anteriores JSON,
    permisos_nuevos JSON,
    cambiado_por INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (relacion_id) REFERENCES relacion_usuario_negocio(id),
    FOREIGN KEY (cambiado_por) REFERENCES usuarios(id)
);
CREATE TABLE codigos_invitacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    creado_por INT,
    usado_por INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP NULL,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),
    FOREIGN KEY (usado_por) REFERENCES usuarios(id)
);
CREATE TABLE archivos_negocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT,
    nombre_archivo VARCHAR(255),
    ruta TEXT,
    tipo ENUM('logo', 'contrato', 'factura', 'otro'),
    subido_por INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (negocio_id) REFERENCES negocios(id),
    FOREIGN KEY (subido_por) REFERENCES usuarios(id)
);
CREATE TABLE accesos_negocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT,
    usuario_id INT,
    accion VARCHAR(100),
    ip VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (negocio_id) REFERENCES negocios(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE precios_sugeridos (
    producto_id INT PRIMARY KEY,
    precio_promedio DECIMAL(10,2),
    sugerencia TEXT,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE subcategorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);
CREATE TABLE recordatorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT NOT NULL,
    titulo VARCHAR(150),
    descripcion TEXT,
    fecha_programada DATE,
    recurrencia ENUM('una_vez', 'diario', 'semanal', 'mensual'),
    tipo ENUM('gasto_programado', 'evento', 'recordatorio_general') DEFAULT 'recordatorio_general',
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);
CREATE TABLE formas_entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_id INT NOT NULL,
    tipo ENUM('empleado', 'tercero', 'cliente_retiró', 'no_aplica') DEFAULT 'empleado',
    entregado_por INT, -- puede ser empleado o repartidor externo
    comision DECIMAL(10,2) DEFAULT 0.00,
    metodo_pago ENUM('diaria', 'por_envio', 'no_pagado') DEFAULT 'por_envio',
    observaciones TEXT,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id),
    FOREIGN KEY (entregado_por) REFERENCES usuarios(id)
);
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(150),
    telefono VARCHAR(30),
    email VARCHAR(100),
    direccion TEXT,
    observaciones TEXT,
    negocio_id INT, -- proveedor puede ser un negocio registrado en la plataforma
    FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

