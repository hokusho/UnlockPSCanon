/**
 * Canon Picture Style Profile Unlocker
 * Visual Sólido, Bilíngue (PT / EN), Sem Gradientes ou Emojis
 */

const TRANSLATIONS = {
  pt: {
    badge: 'Picture Style Tool • Motor Oficial',
    titleMain: 'Picture Style Unlocker',
    subtitle: 'Remova a trava de "Disable subsequent editing" de arquivos <strong>.pf3</strong> e <strong>.pf2</strong>. Edite curvas, matrizes e tabelas 3D LUT no Picture Style Editor oficial da Canon.',
    dropTitle: 'Arraste seu arquivo Picture Style aqui',
    dropSubtitle: 'ou clique para selecionar do computador',
    privacyTag: 'Processamento local no seu computador',
    lockedBadge: 'Edição Bloqueada',
    btnUnlock: 'Desbloquear Perfil Agora',
    btnChange: 'Trocar Arquivo',
    processingTitle: 'Desbloqueando perfil Canon...',
    processingSub: 'Removendo travas e preservando curvas RGB e tabelas 3D LUT',
    step1: 'Arquivo carregado no sistema',
    step2: 'Processando com motor oficial da Canon...',
    step3: 'Assinando perfil desbloqueado',
    successTitle: 'Perfil Desbloqueado com Sucesso!',
    successSub: 'A trava foi removida preservando 100% das curvas e tabelas de cores originais.',
    metaOutput: 'Arquivo de Saída',
    metaFormat: 'Formato',
    metaSize: 'Tamanho',
    metaStatus: 'Status da Edição',
    statusUnlocked: 'Liberado para Edição no PSE',
    btnDownload: 'Baixar Arquivo Desbloqueado',
    btnAnother: 'Desbloquear Outro Perfil',
    errorTitle: 'Erro ao processar o arquivo',
    errorSub: 'Verifique se o arquivo enviado é um perfil Picture Style (.pf3 ou .pf2) válido.',
    btnRetry: 'Tentar Novamente',
    footer: 'Desenvolvido para fotógrafos e cineastas Canon • Ferramenta Local',
    invalidFormat: 'Formato inválido. Por favor, envie um arquivo .pf3 ou .pf2 da Canon.',
    serverError: 'Não foi possível conectar ao servidor local. Certifique-se de que o servidor está rodando na porta 5050.',
    formatPf3: 'Canon Picture Style (.pf3)',
    formatPf2: 'Canon Picture Style (.pf2)'
  },
  en: {
    badge: 'Picture Style Tool • Official Engine',
    titleMain: 'Picture Style Unlocker',
    subtitle: 'Remove the "Disable subsequent editing" lock from <strong>.pf3</strong> and <strong>.pf2</strong> files. Edit curves, matrices, and 3D LUT tables in official Canon Picture Style Editor.',
    dropTitle: 'Drag your Picture Style file here',
    dropSubtitle: 'or click to browse from your computer',
    privacyTag: 'Local processing on your machine',
    lockedBadge: 'Editing Locked',
    btnUnlock: 'Unlock Profile Now',
    btnChange: 'Change File',
    processingTitle: 'Unlocking Canon profile...',
    processingSub: 'Removing restrictions while preserving RGB curves and 3D LUT tables',
    step1: 'File loaded into system',
    step2: 'Processing with official Canon engine...',
    step3: 'Signing unlocked profile',
    successTitle: 'Profile Unlocked Successfully!',
    successSub: 'Lock removed while preserving 100% of original curves and color tables.',
    metaOutput: 'Output File',
    metaFormat: 'Format',
    metaSize: 'Size',
    metaStatus: 'Editing Status',
    statusUnlocked: 'Unlocked for Editing in PSE',
    btnDownload: 'Download Unlocked File',
    btnAnother: 'Unlock Another Profile',
    errorTitle: 'Error processing file',
    errorSub: 'Please make sure the uploaded file is a valid Canon Picture Style (.pf3 or .pf2).',
    btnRetry: 'Try Again',
    footer: 'Engineered for Canon photographers and filmmakers • Local Tool',
    invalidFormat: 'Invalid format. Please upload a Canon .pf3 or .pf2 file.',
    serverError: 'Unable to reach local server. Make sure the server is running on port 5050.',
    formatPf3: 'Canon Picture Style (.pf3)',
    formatPf2: 'Canon Picture Style (.pf2)'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  // States
  const readyToConvertState = document.getElementById('readyToConvertState');
  const processingState = document.getElementById('processingState');
  const resultState = document.getElementById('resultState');
  const errorState = document.getElementById('errorState');

  // Ready state details
  const readyFileName = document.getElementById('readyFileName');
  const readyFileSize = document.getElementById('readyFileSize');
  const readyFileFormat = document.getElementById('readyFileFormat');
  const convertBtn = document.getElementById('convertBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');

  // Result state details
  const metaFileName = document.getElementById('metaFileName');
  const metaFormat = document.getElementById('metaFormat');
  const metaSize = document.getElementById('metaSize');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Error state details
  const errorResetBtn = document.getElementById('errorResetBtn');
  const errorMessage = document.getElementById('errorMessage');

  // Language buttons
  const langPtBtn = document.getElementById('langPtBtn');
  const langEnBtn = document.getElementById('langEnBtn');

  let currentLang = localStorage.getItem('ps_unlocker_lang') || 'pt';
  let selectedFile = null;
  let currentUnlockedBlob = null;
  let currentOutputFileName = '';

  // Initialize Language
  setLanguage(currentLang);

  langPtBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setLanguage('pt');
  });

  langEnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setLanguage('en');
  });

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ps_unlocker_lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    if (lang === 'pt') {
      langPtBtn.classList.add('active');
      langEnBtn.classList.remove('active');
    } else {
      langEnBtn.classList.add('active');
      langPtBtn.classList.remove('active');
    }

    const dict = TRANSLATIONS[lang];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      readyFileFormat.textContent = ext === 'pf2' ? dict.formatPf2 : dict.formatPf3;
    }
  }

  // Prevent default drag behaviors on window
  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);

  fileInput.addEventListener('click', () => {
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      onFileChosen(dt.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChosen(e.target.files[0]);
    }
  });

  changeFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.value = '';
    fileInput.click();
  });

  convertBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedFile) {
      startConversion(selectedFile);
    }
  });

  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUnlockedBlob) return;
    const url = URL.createObjectURL(currentUnlockedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentOutputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetToInitial();
  });

  errorResetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetToInitial();
  });

  function resetToInitial() {
    selectedFile = null;
    currentUnlockedBlob = null;
    currentOutputFileName = '';
    fileInput.value = '';
    showOnly(dropzone);
  }

  function showOnly(elementToShow) {
    const states = [dropzone, readyToConvertState, processingState, resultState, errorState];
    states.forEach(el => {
      if (el === elementToShow) {
        el.classList.remove('hidden');
        el.style.display = (el === dropzone) ? 'block' : 'flex';
      } else {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    });
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function onFileChosen(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const dict = TRANSLATIONS[currentLang];

    if (ext !== 'pf3' && ext !== 'pf2') {
      showError(dict.invalidFormat);
      return;
    }

    selectedFile = file;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const suffix = currentLang === 'en' ? '_unlocked' : '_desbloqueado';
    currentOutputFileName = `${baseName}${suffix}.${ext}`;

    readyFileName.textContent = file.name;
    readyFileSize.textContent = formatBytes(file.size);
    readyFileFormat.textContent = ext === 'pf2' ? dict.formatPf2 : dict.formatPf3;

    showOnly(readyToConvertState);
  }

  async function startConversion(file) {
    showOnly(processingState);

    const endpointsToTry = [];
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      if (window.location.port === '5050') {
        endpointsToTry.push('/api/unlock');
      } else {
        endpointsToTry.push('http://localhost:5050/api/unlock');
        endpointsToTry.push('http://127.0.0.1:5050/api/unlock');
        endpointsToTry.push('/api/unlock');
      }
    } else {
      endpointsToTry.push('http://localhost:5050/api/unlock');
      endpointsToTry.push('http://127.0.0.1:5050/api/unlock');
    }

    let lastError = null;
    let success = false;

    for (const url of endpointsToTry) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          currentUnlockedBlob = await response.blob();
          const ext = file.name.split('.').pop().toUpperCase();
          showSuccessScreen(currentOutputFileName, currentUnlockedBlob.size, ext);
          success = true;
          break;
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.error || `HTTP error ${response.status}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!success) {
      const dict = TRANSLATIONS[currentLang];
      showError(lastError || dict.serverError);
    }
  }

  function showSuccessScreen(fileName, size, ext) {
    metaFileName.textContent = fileName;
    metaFormat.textContent = `Canon Picture Style (.${ext.toLowerCase()})`;
    metaSize.textContent = formatBytes(size);

    showOnly(resultState);
  }

  function showError(msg) {
    showOnly(errorState);
    errorMessage.textContent = msg || TRANSLATIONS[currentLang].errorTitle;
  }
});
