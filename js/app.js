const app = document.getElementById('app');

function mostrarFeedback(el, msg, tipo) {
  el.className = `feedback ${tipo}`;
  el.textContent = msg;
  setTimeout(() => { el.className = 'feedback'; }, 4000);
}

async function renderHome() {
  app.innerHTML = '<div class="loading">Carregando...</div>';
  const [tutoresData, animaisData] = await Promise.all([
    getTutores(),
    getAnimais()
  ]);
  const totalTutores = tutoresData.total ?? 0;
  const totalAnimais = animaisData.total ?? 0;

  app.innerHTML = `
    <h4 class="mb-4 text-secondary">Painel de Controle</h4>
    <div class="row g-4">
      <div class="col-md-4">
        <a href="#tutores" class="dashboard-card card-tutores">
          <div class="counter">${totalTutores}</div>
          <div class="label">👥 Tutores cadastrados</div>
        </a>
      </div>
      <div class="col-md-4">
        <a href="#animais" class="dashboard-card card-animais">
          <div class="counter">${totalAnimais}</div>
          <div class="label">🐾 Animais pacientes</div>
        </a>
      </div>
      <div class="col-md-4">
        <a href="#consultas" class="dashboard-card card-consultas">
          <div class="counter">+</div>
          <div class="label">📋 Registrar consulta</div>
        </a>
      </div>
    </div>
  `;
}

async function render() {
  const hash = window.location.hash || '#home';
  if (hash === '#home' || hash === '#') return renderHome();
  if (hash === '#tutores') return renderTutores();
  if (hash === '#animais') return renderAnimais();
  if (hash === '#consultas') return renderConsultas();
  return renderHome();
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);

async function renderTutores() {
  app.innerHTML = '<div class="loading">Carregando tutores...</div>';
  const data = await getTutores();

  app.innerHTML = `
    <div class="section-header">
      <h4 class="mb-0">👥 Tutores</h4>
      <button class="btn btn-primary btn-sm" onclick="toggleForm('form-tutor')">+ Novo Tutor</button>
    </div>

    <div id="feedback-tutor" class="feedback"></div>

    <div class="form-inline-box" id="form-tutor">
      <h6 class="mb-3">Cadastrar Tutor</h6>
      <div class="row g-2">
        <div class="col-md-6">
          <input type="text" class="form-control form-control-sm" id="t-nome" placeholder="Nome *">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control form-control-sm" id="t-tel" placeholder="Telefone *">
        </div>
        <div class="col-md-6">
          <input type="email" class="form-control form-control-sm" id="t-email" placeholder="E-mail">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control form-control-sm" id="t-cpf" placeholder="CPF">
        </div>
      </div>
      <button class="btn btn-success btn-sm mt-3" onclick="salvarTutor()">Salvar</button>
    </div>

    <div id="lista-tutores">
      ${data.tutores.length === 0
        ? '<p class="text-muted">Nenhum tutor cadastrado.</p>'
        : data.tutores.map(t => renderTutorItem(t)).join('')}
    </div>
  `;
}

function renderTutorItem(t) {
  const inicial = t.nome.charAt(0).toUpperCase();
  return `
    <div class="tutor-item" id="tutor-${t.id}">
      <div class="tutor-avatar">${inicial}</div>
      <div class="tutor-info">
        <div class="nome">${t.nome}</div>
        <div class="detalhe">${t.telefone}${t.cpf ? ' · CPF: ' + t.cpf : ''}</div>
      </div>
      <div class="tutor-actions">
        <button class="btn btn-outline-primary btn-sm" onclick="verAnimaisTutor(${t.id})">Ver animais</button>
        <button class="btn btn-outline-danger btn-sm" onclick="excluirTutor(${t.id}, '${t.nome.replace(/'/g, "\\'")}')">Excluir</button>
      </div>
    </div>
    <div class="animais-expandidos" id="animais-tutor-${t.id}"></div>
  `;
}

function toggleForm(id) {
  const el = document.getElementById(id);
  el.classList.toggle('aberto');
}

async function salvarTutor() {
  const nome = document.getElementById('t-nome').value.trim();
  const telefone = document.getElementById('t-tel').value.trim();
  const email = document.getElementById('t-email').value.trim();
  const cpf = document.getElementById('t-cpf').value.trim();
  const fb = document.getElementById('feedback-tutor');

  if (!nome || !telefone) {
    return mostrarFeedback(fb, 'Nome e telefone são obrigatórios.', 'erro');
  }

  const dados = { nome, telefone };
  if (email) dados.email = email;
  if (cpf) dados.cpf = cpf;

  const res = await postTutor(dados);
  if (res.erro) return mostrarFeedback(fb, res.erro, 'erro');

  mostrarFeedback(fb, `Tutor "${res.tutor.nome}" cadastrado com sucesso!`, 'sucesso');
  renderTutores();
}

async function excluirTutor(id, nome) {
  if (!confirm(`Excluir tutor "${nome}" e todos os seus animais?`)) return;
  const res = await deleteTutor(id);
  if (res.erro) return alert(res.erro);
  renderTutores();
}

async function verAnimaisTutor(tutorId) {
  const container = document.getElementById(`animais-tutor-${tutorId}`);
  if (container.classList.contains('aberto')) {
    container.classList.remove('aberto');
    return;
  }
  container.innerHTML = 'Carregando...';
  container.classList.add('aberto');
  const data = await getAnimaisTutor(tutorId);
  if (!data.animais || data.animais.length === 0) {
    container.innerHTML = '<small class="text-muted">Nenhum animal cadastrado para este tutor.</small>';
    return;
  }
  container.innerHTML = data.animais.map(a =>
    `<span class="badge bg-primary me-1 mb-1">${a.nome} (${a.especie})</span>`
  ).join('');
}

async function renderAnimais(filtroEspecie = '') {
  app.innerHTML = '<div class="loading">Carregando animais...</div>';
  const data = await getAnimais(filtroEspecie);

  app.innerHTML = `
    <div class="section-header">
      <h4 class="mb-0">🐾 Animais</h4>
      <button class="btn btn-success btn-sm" onclick="toggleForm('form-animal')">+ Novo Animal</button>
    </div>

    <div id="feedback-animal" class="feedback"></div>

    <div class="form-inline-box" id="form-animal">
      <h6 class="mb-3">Cadastrar Animal</h6>
      <div class="row g-2">
        <div class="col-md-4">
          <input type="text" class="form-control form-control-sm" id="a-nome" placeholder="Nome *">
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control form-control-sm" id="a-especie" placeholder="Espécie *">
        </div>
        <div class="col-md-4">
          <input type="number" class="form-control form-control-sm" id="a-tutor" placeholder="ID do Tutor *">
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control form-control-sm" id="a-raca" placeholder="Raça">
        </div>
        <div class="col-md-2">
          <select class="form-select form-select-sm" id="a-sexo">
            <option value="">Sexo</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </div>
        <div class="col-md-3">
          <input type="number" step="0.1" class="form-control form-control-sm" id="a-peso" placeholder="Peso (kg)">
        </div>
        <div class="col-md-3">
          <input type="date" class="form-control form-control-sm" id="a-nasc">
        </div>
      </div>
      <button class="btn btn-success btn-sm mt-3" onclick="salvarAnimal()">Salvar</button>
    </div>

    <div class="d-flex gap-2 mb-3">
      <input type="text" class="form-control form-control-sm w-auto" id="filtro-especie"
             placeholder="Filtrar por espécie" value="${filtroEspecie}">
      <button class="btn btn-outline-secondary btn-sm" onclick="filtrarAnimais()">Buscar</button>
      ${filtroEspecie ? '<button class="btn btn-link btn-sm" onclick="renderAnimais()">Limpar</button>' : ''}
    </div>

    <div class="row g-3" id="lista-animais">
      ${data.animais.length === 0
        ? '<div class="col"><p class="text-muted">Nenhum animal encontrado.</p></div>'
        : data.animais.map(a => `
          <div class="col-md-4">
            <div class="animal-card">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <strong>${a.nome}</strong>
                <span class="especie-badge">${a.especie}</span>
              </div>
              ${a.raca ? `<div class="text-muted small">${a.raca}</div>` : ''}
              <div class="idade">${a.idade ?? ''} ${a.peso_kg ? '· ' + a.peso_kg + ' kg' : ''}</div>
              <div class="small text-muted mt-1">Tutor: ${a.tutor_nome}</div>
              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline-success btn-sm flex-fill" onclick="verConsultasAnimal(${a.id}, '${a.nome.replace(/'/g, "\\'")}')">Consultas</button>
                <button class="btn btn-outline-danger btn-sm" onclick="excluirAnimal(${a.id}, '${a.nome.replace(/'/g, "\\'")}')">✕</button>
              </div>
            </div>
          </div>
        `).join('')}
    </div>
  `;
}

function filtrarAnimais() {
  const especie = document.getElementById('filtro-especie').value.trim();
  renderAnimais(especie);
}

async function salvarAnimal() {
  const nome = document.getElementById('a-nome').value.trim();
  const especie = document.getElementById('a-especie').value.trim();
  const tutor_id = parseInt(document.getElementById('a-tutor').value);
  const fb = document.getElementById('feedback-animal');

  if (!nome || !especie || !tutor_id) {
    return mostrarFeedback(fb, 'Nome, espécie e ID do tutor são obrigatórios.', 'erro');
  }

  const dados = { nome, especie, tutor_id };
  const raca = document.getElementById('a-raca').value.trim();
  const sexo = document.getElementById('a-sexo').value;
  const peso = document.getElementById('a-peso').value;
  const nasc = document.getElementById('a-nasc').value;
  if (raca) dados.raca = raca;
  if (sexo) dados.sexo = sexo;
  if (peso) dados.peso_kg = parseFloat(peso);
  if (nasc) dados.data_nascimento = nasc;

  const res = await postAnimal(dados);
  if (res.erro) return mostrarFeedback(fb, res.erro, 'erro');

  mostrarFeedback(fb, `Animal "${res.animal.nome}" cadastrado com sucesso!`, 'sucesso');
  renderAnimais();
}

async function excluirAnimal(id, nome) {
  if (!confirm(`Excluir animal "${nome}"?`)) return;
  const res = await deleteAnimal(id);
  if (res.erro) return alert(res.erro);
  renderAnimais();
}

async function verConsultasAnimal(animalId, nomeAnimal) {
  const data = await getConsultasAnimal(animalId);
  const consultas = data.consultas ?? [];
  const msg = consultas.length === 0
    ? `${nomeAnimal} não tem consultas registradas.`
    : consultas.map(c =>
        `• ${c.data_consulta} — ${c.motivo}${c.veterinario ? ' (' + c.veterinario + ')' : ''}`
      ).join('\n');
  alert(msg);
}

async function renderConsultas() {
  app.innerHTML = '<div class="loading">Carregando...</div>';
  const animaisData = await getAnimais();

  app.innerHTML = `
    <div class="section-header">
      <h4 class="mb-0">📋 Registrar Consulta</h4>
    </div>

    <div id="feedback-consulta" class="feedback"></div>

    <div class="form-inline-box aberto" id="form-consulta">
      <div class="row g-2">
        <div class="col-md-4">
          <label class="form-label small">Animal *</label>
          <select class="form-select form-select-sm" id="c-animal">
            <option value="">Selecione...</option>
            ${animaisData.animais.map(a =>
              `<option value="${a.id}">${a.nome} (${a.especie})</option>`
            ).join('')}
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label small">Motivo *</label>
          <input type="text" class="form-control form-control-sm" id="c-motivo" placeholder="Motivo da consulta">
        </div>
        <div class="col-md-6">
          <label class="form-label small">Diagnóstico</label>
          <textarea class="form-control form-control-sm" id="c-diagnostico" rows="2"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Tratamento</label>
          <textarea class="form-control form-control-sm" id="c-tratamento" rows="2"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Veterinário</label>
          <input type="text" class="form-control form-control-sm" id="c-vet" placeholder="Nome do veterinário">
        </div>
      </div>
      <button class="btn btn-sm mt-3" style="background:#7e22ce;color:white" onclick="salvarConsulta()">
        Registrar Consulta
      </button>
    </div>

    <div id="lista-consultas-recentes"></div>
  `;

  if (animaisData.animais.length > 0) {
    carregarConsultasRecentes(animaisData.animais);
  }
}

async function carregarConsultasRecentes(animais) {
  const container = document.getElementById('lista-consultas-recentes');
  if (!container) return;
  container.innerHTML = '<h6 class="mt-4 mb-3 text-secondary">Consultas por animal:</h6>';

  for (const animal of animais.slice(0, 5)) {
    const data = await getConsultasAnimal(animal.id);
    if (data.consultas && data.consultas.length > 0) {
      data.consultas.slice(0, 2).forEach(c => {
        container.innerHTML += `
          <div class="consulta-card">
            <div class="d-flex justify-content-between">
              <strong>${animal.nome}</strong>
              <span class="data">${c.data_consulta}</span>
            </div>
            <div class="mt-1">${c.motivo}</div>
            ${c.veterinario ? `<div class="small text-muted">${c.veterinario}</div>` : ''}
            ${c.diagnostico ? `<div class="small mt-1 text-secondary">${c.diagnostico}</div>` : ''}
          </div>
        `;
      });
    }
  }

  if (container.children.length === 1) {
    container.innerHTML += '<p class="text-muted">Nenhuma consulta registrada ainda.</p>';
  }
}

async function salvarConsulta() {
  const animal_id = parseInt(document.getElementById('c-animal').value);
  const motivo = document.getElementById('c-motivo').value.trim();
  const fb = document.getElementById('feedback-consulta');

  if (!animal_id || !motivo) {
    return mostrarFeedback(fb, 'Animal e motivo são obrigatórios.', 'erro');
  }

  const dados = { animal_id, motivo };
  const diag = document.getElementById('c-diagnostico').value.trim();
  const trat = document.getElementById('c-tratamento').value.trim();
  const vet = document.getElementById('c-vet').value.trim();
  if (diag) dados.diagnostico = diag;
  if (trat) dados.tratamento = trat;
  if (vet) dados.veterinario = vet;

  const res = await postConsulta(dados);
  if (res.erro) return mostrarFeedback(fb, res.erro, 'erro');

  mostrarFeedback(fb, 'Consulta registrada com sucesso!', 'sucesso');
  document.getElementById('c-animal').value = '';
  document.getElementById('c-motivo').value = '';
  document.getElementById('c-diagnostico').value = '';
  document.getElementById('c-tratamento').value = '';
  document.getElementById('c-vet').value = '';
  carregarConsultasRecentes((await getAnimais()).animais);
}
