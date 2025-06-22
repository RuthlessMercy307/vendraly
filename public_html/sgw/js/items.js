// items.js V2 - Refactorado con integración Kanban

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  carregarInventario();
  carregarProdutosSelects();
  carregarAlertasEstoque();

  document.getElementById('form-item').addEventListener('submit', salvarItem);
  document.getElementById('form-entrada').addEventListener('submit', registrarEntrada);
  document.getElementById('form-conversao').addEventListener('submit', registrarConversao);
  document.getElementById('form-receita').addEventListener('submit', adicionarIngrediente);

  const produtoSelect = document.querySelector('#form-receita select[name="producto_id"]');
  if (produtoSelect) {
    produtoSelect.addEventListener('change', carregarReceitaProduto);
  }
});

function auth() {
  return {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
    }
  };
}

function carregarInventario() {
  fetch('/api/inventario', auth())
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById('lista-inventario');
      lista.innerHTML = '';

      if (!Array.isArray(data.productos)) return;

      const tipos = ['combo', 'producto', 'insumo'];
      tipos.forEach(tipo => {
        const grupo = data.productos.filter(p => p.tipo === tipo);
        if (!grupo.length) return;

        const columna = document.createElement('div');
        columna.className = 'kanban-columna';

        const titulo = document.createElement('h3');
        titulo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1) + 's';
        columna.appendChild(titulo);

        grupo.forEach(prod => {
          const card = document.createElement('div');
          card.className = 'kanban-card';

          const alerta = prod.stock_actual < prod.stock_minimo ? '<span style="color:red"> (¡Bajo stock!)</span>' : '';

          card.innerHTML = `
            <div class="titulo">${prod.nombre} - <em>${prod.tipo}</em></div>
            <div class="detalle">
              ${prod.descripcion || '-'}<br>
              ${prod.tipo !== 'producto' ? `Stock: ${prod.stock_actual} ${prod.unidad_medida || ''}${alerta}` : ''}<br>
              ${prod.precio_venta ? `Venta: R$ ${prod.precio_venta}` : ''}
            </div>
            <div class="acciones">
              <button onclick="editarItem(${prod.id})">Editar</button>
              ${prod.tipo !== 'producto' ? `<button onclick="abrirEntrada(${prod.id})">Entrada</button>` : ''}
              ${prod.tipo === 'insumo' ? `<button onclick="abrirConversao(${prod.id})">Convertir</button>` : ''}
              ${prod.tipo !== 'insumo' ? `<button onclick="abrirReceita(${prod.id})">Receta</button>` : ''}
            </div>
          `;

          columna.appendChild(card);
        });

        lista.appendChild(columna);
      });
    })
    .catch(console.error);
}

function abrirModalNovoItem() {
  const form = document.getElementById('form-item');
  form.reset();
  form.id.value = '';
  document.getElementById('titulo-modal').innerText = 'Nuevo Producto';
  document.getElementById('modal-item').classList.remove('hidden');
}

function fecharModalItem() {
  document.getElementById('modal-item').classList.add('hidden');
}

function editarItem(id) {
  fetch(`/api/item?id=${id}`, auth())
    .then(res => res.json())
    .then(item => {
      const form = document.getElementById('form-item');
      if (!form) return;

      const map = {
        nombre: 'nome', descripcion: 'descripcion', unidad_medida: 'unidade', stock_actual: 'stock_atual',
        stock_minimo: 'stock_minimo', precio_costo: 'preco_custo', precio_venta: 'preco_venda',
        codigo_barras: 'codigo_barras', promocao_ativa: 'promocao_ativa', vencimiento: 'vencimento',
        tipo: 'tipo', desconto: 'desconto'
      };

      for (let key in item) {
        const campo = map[key] || key;
        const input = form[campo];
        if (!input) continue;

        if (key === 'vencimiento') input.value = item[key].split('T')[0];
        else if (key === 'promocao_ativa') input.value = item[key] ? '1' : '0';
        else input.value = item[key];
      }

      document.getElementById('titulo-modal').innerText = 'Editar Producto';
      document.getElementById('modal-item').classList.remove('hidden');
    })
    .catch(console.error);
}

function salvarItem(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  fetch('/api/salvar_item', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...auth().headers },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.erro) return alert('Error: ' + resp.erro);
      fecharModalItem();
      carregarInventario();
      carregarProdutosSelects();
    })
    .catch(console.error);
}

function carregarProdutosSelects() {
  fetch('/api/inventario', auth())
    .then(res => res.json())
    .then(data => {
      const produtos = data.productos || [];
      const produto = produtos.filter(p => p.tipo === 'producto' || p.tipo === 'combo');
      const insumos = produtos.filter(p => p.tipo === 'insumo');

      const selects = {
        producto_id: produto,
        insumo_resultado: insumos,
        insumo_origem: insumos,
        insumo_id: insumos
      };

      for (let name in selects) {
        const sel = document.querySelector(`select[name="${name}"]`);
        if (sel) sel.innerHTML = selects[name].map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
      }
    })
    .catch(console.error);
}

function registrarEntrada(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.usuario_id = localStorage.getItem('vendraly_user_id');

  fetch('/api/entrada_inventario', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...auth().headers },
    body: JSON.stringify(data)
  })
    .then(() => {
      e.target.reset();
      carregarInventario();
    })
    .catch(console.error);
}

function registrarConversao(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.usuario_id = localStorage.getItem('vendraly_user_id');

  fetch('/api/conversao_insumo', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...auth().headers },
    body: JSON.stringify(data)
  })
    .then(() => {
      e.target.reset();
      carregarInventario();
    })
    .catch(console.error);
}

function adicionarIngrediente(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  fetch('/api/receita_produto', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...auth().headers },
    body: JSON.stringify(data)
  })
    .then(() => {
      e.target.reset();
      carregarReceitaProduto();
    })
    .catch(console.error);
}

function carregarReceitaProduto() {
  const id = document.querySelector('#form-receita select[name="producto_id"]').value;
  fetch(`/api/receita_produto_lista?producto_id=${id}`, auth())
    .then(res => res.json())
    .then(data => {
      const div = document.getElementById('lista-receita');
      div.innerHTML = '<ul>' + data.map(ing => `
        <li>
          ${ing.nome_insumo} (${ing.quantidade_utilizada}${ing.unidade})
          <button onclick="removerIngrediente(${ing.id})">Remover</button>
        </li>
      `).join('') + '</ul>';
    })
    .catch(console.error);
}

function removerIngrediente(id) {
  fetch(`/api/remover_ingrediente?id=${id}`, {
    method: 'DELETE', headers: auth().headers
  })
    .then(() => carregarReceitaProduto())
    .catch(console.error);
}

function carregarAlertasEstoque() {
  fetch('/api/estoque_alerta', auth())
    .then(res => res.json())
    .then(data => {
      const alerta = document.getElementById('alerta-estoque');
      if (!data.length) return alerta.innerHTML = '';

      alerta.innerHTML = '<h3>Productos en Alerta de Stock</h3>' +
        '<ul>' + data.map(p => `<li>${p.nombre} (${p.stock_actual}/${p.stock_minimo})</li>`).join('') + '</ul>';
    })
    .catch(console.error);
}

function abrirEntrada(id) {
  document.querySelector('section.entrada-inventario select[name="producto_id"]').value = id;
  window.scrollTo(0, document.querySelector('section.entrada-inventario').offsetTop);
}

function abrirConversao(id) {
  document.querySelector('section.conversao-insumo select[name="insumo_origem"]').value = id;
  window.scrollTo(0, document.querySelector('section.conversao-insumo').offsetTop);
}

function abrirReceita(id) {
  document.querySelector('section.recetas-produto select[name="producto_id"]').value = id;
  carregarReceitaProduto();
  window.scrollTo(0, document.querySelector('section.recetas-produto').offsetTop);
}
