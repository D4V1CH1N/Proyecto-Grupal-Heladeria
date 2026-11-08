let historialEventos = [];
let contadorEventos = 0;
let carrito = [];
let temporizadorCobro = null;
let segundosRestantes = 30;

function formatoTiempo(seg) {
  return '00:' + (seg < 10 ? '0' + seg : seg);
}

function iniciarTemporizador() {
  detenerTemporizador();
  segundosRestantes = 30;
  $('#temporizador-cuenta').text(formatoTiempo(segundosRestantes));
  temporizadorCobro = setInterval(function() {
    segundosRestantes--;
    $('#temporizador-cuenta').text(formatoTiempo(segundosRestantes));
    if (segundosRestantes <= 0) {
      detenerTemporizador();
      $('#modal-checkout').fadeOut('fast');
      mostrarToast('Tiempo expirado. El modal de cobro fue cerrado.', 'error');
    }
  }, 1000);
}

function detenerTemporizador() {
  if (temporizadorCobro) {
    clearInterval(temporizadorCobro);
    temporizadorCobro = null;
  }
}

function mostrarToast(mensaje, tipo) {
  let claseTipo = tipo === 'error' ? 'toast-error' : 'toast-exito';
  let nuevoToast = $('<div class="toast ' + claseTipo + '">' + mensaje + '</div>');
  $('#contenedor-toasts').append(nuevoToast);
  nuevoToast.slideDown('fast', function() {
    setTimeout(function() {
      nuevoToast.fadeOut('fast', function() {
        nuevoToast.remove();
      });
    }, 3000);
  });
}

function cambiarVista(idDestino) {
  let vistaVisible = $('.vista-seccion:visible');
  let nuevaVista = $('#' + idDestino);
  if (vistaVisible.attr('id') === idDestino) {
    return;
  }
  $('.enlace-menu').removeClass('activo');
  $('.enlace-menu[data-vista="' + idDestino + '"]').addClass('activo');

  if ($(window).width() <= 960) {
    $('#navegacion-principal').slideUp('fast');
    $('#btn-hamburguesa').removeClass('activo');
  }

  if (vistaVisible.length > 0) {
    vistaVisible.fadeOut('fast', function() {
      nuevaVista.fadeIn('fast');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else {
    nuevaVista.fadeIn('fast');
  }
}

function renderizarCarrito() {
  let contenedor = $('#lista-carrito');
  contenedor.empty();
  let subtotal = 0;
  let totalArticulos = 0;

  if (carrito.length === 0) {
    contenedor.append('<li class="item-vacio">El carrito esta vacio. Seleccione productos del catalogo.</li>');
    $('#monto-subtotal').text('0.00');
    $('#monto-impuesto').text('0.00');
    $('#monto-total').text('0.00');
    $('#contador-articulos').text('0 articulos');
    $('#badge-carrito').text('0');
    return;
  }

  $.each(carrito, function(indice, producto) {
    let subtotalProducto = producto.precio * producto.cantidad;
    subtotal += subtotalProducto;
    totalArticulos += producto.cantidad;

    let elementoFila = $(
      '<li class="item-carrito">' +
        '<div class="datos-item-carrito">' +
          '<span class="nombre-item-carrito">' + producto.nombre + '</span>' +
          '<span class="precio-unit-carrito">Bs ' + producto.precio.toFixed(2) + ' c/u</span>' +
        '</div>' +
        '<div class="controles-cantidad">' +
          '<button type="button" class="btn-cantidad btn-disminuir" data-id="' + producto.id + '">-</button>' +
          '<span class="valor-cantidad">' + producto.cantidad + '</span>' +
          '<button type="button" class="btn-cantidad btn-aumentar" data-id="' + producto.id + '">+</button>' +
        '</div>' +
        '<div class="subtotal-item-carrito">Bs ' + subtotalProducto.toFixed(2) + '</div>' +
        '<button type="button" class="btn-eliminar-item" data-id="' + producto.id + '">&times;</button>' +
      '</li>'
    );
    contenedor.append(elementoFila);
  });

  let impuesto = subtotal * 0.13;
  let total = subtotal + impuesto;

  $('#monto-subtotal').text(subtotal.toFixed(2));
  $('#monto-impuesto').text(impuesto.toFixed(2));
  $('#monto-total').text(total.toFixed(2));
  $('#contador-articulos').text(totalArticulos + (totalArticulos === 1 ? ' articulo' : ' articulos'));
  $('#badge-carrito').text(totalArticulos);

  $('#monto-total')
    .stop(true, true)
    .animate({ opacity: 0.15 }, 140)
    .animate({ opacity: 1 }, 140)
    .animate({ opacity: 0.15 }, 140)
    .animate({ opacity: 1 }, 140);
}

$(document).ready(function() {
  $('#btn-tema').on('click', function() {
    $('body').toggleClass('modo-oscuro');
    let esOscuro = $('body').hasClass('modo-oscuro');
    $('#btn-tema-texto').text(esOscuro ? 'Modo Claro' : 'Modo Oscuro');
  });

  $('#btn-hamburguesa').on('click', function() {
    $(this).toggleClass('activo');
    $('#navegacion-principal').slideToggle('fast');
  });

  $(document).on('click', '[data-vista]', function(e) {
    e.preventDefault();
    let destino = $(this).data('vista');
    cambiarVista(destino);
  });

  $('#btn-carrito-header').on('click', function() {
    $('#drawer-carrito').addClass('abierto');
    $('#cortina-drawer').fadeIn('fast');
  });

  $('#btn-cerrar-drawer, #cortina-drawer').on('click', function() {
    $('#drawer-carrito').removeClass('abierto');
    $('#cortina-drawer').fadeOut('fast');
  });

  $('.btn-filtro').on('click', function() {
    let filtro = $(this).data('filtro');
    $('.btn-filtro').removeClass('activo');
    $(this).addClass('activo');

    if (filtro === 'todos') {
      $('.tarjeta-producto').fadeIn('fast');
    } else {
      $('.tarjeta-producto').each(function() {
        if ($(this).data('categoria') === filtro) {
          $(this).fadeIn('fast');
        } else {
          $(this).fadeOut('fast');
        }
      });
    }
  });

  $('#buscador-producto').on('keyup', function() {
    let termino = $(this).val().toLowerCase().trim();
    let categoriaActiva = $('.btn-filtro.activo').data('filtro');

    if ($('#vista-catalogo').is(':hidden')) {
      cambiarVista('vista-catalogo');
    }

    $('.tarjeta-producto').each(function() {
      let tarjeta = $(this);
      let nombre = tarjeta.data('nombre').toString().toLowerCase();
      let coincideTexto = nombre.indexOf(termino) > -1;
      let coincideCat = (categoriaActiva === 'todos' || tarjeta.data('categoria') === categoriaActiva);

      if (coincideTexto && coincideCat) {
        tarjeta.fadeIn('fast');
      } else {
        tarjeta.fadeOut('fast');
      }
    });
  });

  $('#selector-ordenar').on('change', function() {
    let criterio = $(this).val();
    let contenedor = $('#cuadricula-productos');
    let items = contenedor.children('.tarjeta-producto').get();

    items.sort(function(a, b) {
      if (criterio === 'menor-precio') {
        return parseFloat($(a).data('precio')) - parseFloat($(b).data('precio'));
      } else if (criterio === 'mayor-precio') {
        return parseFloat($(b).data('precio')) - parseFloat($(a).data('precio'));
      } else if (criterio === 'alfabetico') {
        return $(a).data('nombre').localeCompare($(b).data('nombre'));
      } else {
        return parseInt($(a).data('id'), 10) - parseInt($(b).data('id'), 10);
      }
    });

    $.each(items, function(indice, elemento) {
      contenedor.append(elemento);
    });
  });

  $(document).on('click', '.btn-ver-detalle', function(e) {
    e.preventDefault();
    let tarjeta = $(this).closest('.tarjeta-producto');
    let id = tarjeta.data('id');
    let nombre = tarjeta.data('nombre');
    let precio = parseFloat(tarjeta.data('precio'));
    let categoria = tarjeta.data('categoria');
    let descripcion = tarjeta.find('.descripcion-producto').text();
    let claseIlustracion = tarjeta.find('.ilustracion-producto').attr('class');

    $('#detalle-titulo').text(nombre);
    $('#detalle-precio').text('Bs ' + precio.toFixed(2));
    $('#detalle-categoria-badge').text(categoria.toUpperCase());
    $('#detalle-descripcion').text(descripcion);
    $('#detalle-cantidad').val(1);
    $('#btn-detalle-agregar').data('id', id).data('nombre', nombre).data('precio', precio);

    let contenedorVisual = $('#detalle-imagen-visual');
    contenedorVisual.attr('class', claseIlustracion + ' detalle-grande');

    cambiarVista('vista-detalle');
  });

  $('#btn-volver-catalogo').on('click', function() {
    cambiarVista('vista-catalogo');
  });

  $('#btn-detalle-agregar').on('click', function() {
    let id = $(this).data('id');
    let nombre = $(this).data('nombre');
    let precio = parseFloat($(this).data('precio'));
    let cantidad = parseInt($('#detalle-cantidad').val(), 10) || 1;
    if (cantidad < 1) {
      cantidad = 1;
    }

    let productoExistente = carrito.find(function(item) {
      return item.id === id;
    });

    if (productoExistente) {
      productoExistente.cantidad += cantidad;
    } else {
      carrito.push({
        id: id,
        nombre: nombre,
        precio: precio,
        cantidad: cantidad
      });
    }

    renderizarCarrito();
    mostrarToast('Se agregaron ' + cantidad + ' unidades de ' + nombre + ' al carrito.', 'exito');
    $('#drawer-carrito').addClass('abierto');
    $('#cortina-drawer').fadeIn('fast');
  });

  $(document).on('click', '.btn-agregar', function() {
    let tarjeta = $(this).closest('.tarjeta-producto');
    let id = tarjeta.data('id');
    let nombre = tarjeta.data('nombre');
    let precio = parseFloat(tarjeta.data('precio'));

    let productoExistente = carrito.find(function(item) {
      return item.id === id;
    });

    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      carrito.push({
        id: id,
        nombre: nombre,
        precio: precio,
        cantidad: 1
      });
    }

    renderizarCarrito();
    mostrarToast('Producto añadido al carrito: ' + nombre, 'exito');
  });

  $(document).on('click', '.btn-aumentar', function() {
    let id = $(this).data('id');
    let producto = carrito.find(function(item) {
      return item.id === id;
    });
    if (producto) {
      producto.cantidad++;
      renderizarCarrito();
    }
  });

  $(document).on('click', '.btn-disminuir', function() {
    let id = $(this).data('id');
    let producto = carrito.find(function(item) {
      return item.id === id;
    });
    if (producto) {
      producto.cantidad--;
      if (producto.cantidad <= 0) {
        carrito = carrito.filter(function(item) {
          return item.id !== id;
        });
      }
      renderizarCarrito();
    }
  });

  $(document).on('click', '.btn-eliminar-item', function() {
    let id = $(this).data('id');
    carrito = carrito.filter(function(item) {
      return item.id !== id;
    });
    renderizarCarrito();
  });

  $('#btn-vaciar-carrito').on('click', function() {
    if (carrito.length === 0) {
      mostrarToast('El carrito ya esta vacio.', 'error');
      return;
    }
    carrito = [];
    renderizarCarrito();
    mostrarToast('Se vaciaron todos los productos del carrito.', 'exito');
  });

  $('#btn-abrir-checkout').on('click', function() {
    if (carrito.length === 0) {
      mostrarToast('No hay productos en el carrito para cobrar.', 'error');
      return;
    }
    $('#drawer-carrito').removeClass('abierto');
    $('#cortina-drawer').fadeOut('fast');

    let totalActual = $('#monto-total').text();
    $('#modal-monto-total').text('Bs ' + totalActual);
    $('#form-checkout')[0].reset();
    $('.msg-error').hide().text('');
    $('.input-texto, .control-select').removeClass('invalido');
    $('#modal-checkout').css('display', 'flex').hide().fadeIn('fast');
    iniciarTemporizador();
  });

  $('#btn-cerrar-modal, #btn-cancelar-checkout').on('click', function() {
    detenerTemporizador();
    $('#modal-checkout').fadeOut('fast');
  });

  $('#form-checkout').on('submit', function(e) {
    e.preventDefault();
    let esValido = true;
    $('.msg-error').hide().text('');
    $('.input-texto, .control-select').removeClass('invalido');

    let nombre = $('#cliente-nombre').val().trim();
    let documento = $('#cliente-documento').val().trim();
    let pago = $('#cliente-pago').val();

    if (!nombre) {
      $('#error-nombre').text('El nombre del cliente es obligatorio.').show();
      $('#cliente-nombre').addClass('invalido');
      esValido = false;
    }
    if (!documento) {
      $('#error-documento').text('El NIT o Carnet es obligatorio.').show();
      $('#cliente-documento').addClass('invalido');
      esValido = false;
    }
    if (!pago) {
      $('#error-pago').text('Seleccione un metodo de pago.').show();
      $('#cliente-pago').addClass('invalido');
      esValido = false;
    }

    if (!esValido) {
      mostrarToast('Por favor corrija los campos requeridos.', 'error');
      return;
    }

    detenerTemporizador();
    $('#modal-checkout').fadeOut('fast');
    carrito = [];
    renderizarCarrito();
    mostrarToast('Venta procesada con exito. Factura emitida.', 'exito');
  });

  $('#btn-exportar-log').on('click', function() {
    let jsonExportado = JSON.stringify(historialEventos, null, 2);
    console.log(jsonExportado);
    alert('HISTORIAL DE EVENTOS:\n\n' + jsonExportado);
  });

  $('#btn-limpiar-log').on('click', function() {
    $('#lista-auditoria').empty();
    mostrarToast('Vista de auditoria limpiada.', 'exito');
  });

  $('#filtro-tipo-evento').on('change', function() {
    let tipo = $(this).val();
    if (tipo === 'todos') {
      $('#lista-auditoria .item-log').show();
    } else {
      $('#lista-auditoria .item-log').each(function() {
        if ($(this).find('.item-log-tipo').hasClass(tipo)) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    }
  });

  $(document).on('keyup', function(e) {
    if (e.key === 'Escape') {
      if ($('#drawer-carrito').hasClass('abierto')) {
        $('#drawer-carrito').removeClass('abierto');
        $('#cortina-drawer').fadeOut('fast');
      }
      if ($('#modal-checkout').is(':visible')) {
        detenerTemporizador();
        $('#modal-checkout').fadeOut('fast');
      }
    }
  });
});

$(document).on('click change keyup', function(e) {
  let objetivo = $(e.target);
  let etiqueta = objetivo.prop('tagName') ? objetivo.prop('tagName').toLowerCase() : 'nodo';
  let identificador = objetivo.attr('id') ? '#' + objetivo.attr('id') : (objetivo.attr('class') ? '.' + String(objetivo.attr('class')).trim().split(' ')[0] : etiqueta);
  let detalle = '';

  if (e.type === 'keyup') {
    detalle = 'Tecla: ' + e.key + ' en ' + identificador + ' | Valor: ' + (objetivo.val() || '');
  } else if (e.type === 'change') {
    detalle = 'Selector ' + identificador + ' | Seleccion: ' + (objetivo.val() || '');
  } else {
    let texto = objetivo.text().replace(/\s+/g, ' ').trim().substring(0, 24);
    detalle = 'Clic en ' + identificador + (texto ? ' (' + texto + ')' : '');
  }

  contadorEventos++;
  let registroEvento = {
    id: contadorEventos,
    hora: new Date().toLocaleTimeString(),
    accion: e.type,
    detalle: detalle
  };

  historialEventos.push(registroEvento);
  $('#contador-eventos').text(historialEventos.length + ' eventos registrados');

  let elementoFila = $(
    '<li class="item-log">' +
      '<span class="item-log-id">#' + registroEvento.id + '</span>' +
      '<span class="item-log-hora">[' + registroEvento.hora + ']</span>' +
      '<span class="item-log-tipo ' + registroEvento.accion + '">' + registroEvento.accion + '</span>' +
      '<span class="item-log-detalle">' + registroEvento.detalle + '</span>' +
    '</li>'
  );

  let filtroActivo = $('#filtro-tipo-evento').val();
  if (filtroActivo && filtroActivo !== 'todos' && registroEvento.accion !== filtroActivo) {
    elementoFila.hide();
  }

  $('#lista-auditoria').prepend(elementoFila);
});
