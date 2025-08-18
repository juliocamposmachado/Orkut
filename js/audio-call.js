// Sistema de Chamadas de Áudio - Orkut Retrô
// Simula chamadas de áudio com Web Audio API e interface realística

// Estado da chamada
let callState = {
    isActive: false,
    isMuted: false,
    speakerOn: false,
    startTime: null,
    timer: null,
    audioContext: null,
    oscillator: null,
    gainNode: null,
    volume: 0.7
};

// Sons da chamada (usando Web Audio API)
const callSounds = {
    ringtone: null,
    connectSound: null,
    endSound: null
};

// Inicializar sistema de áudio
function initializeAudioSystem() {
    try {
        // Criar contexto de áudio
        callState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Pré-carregar sons
        createCallSounds();
        
        console.log('Sistema de áudio inicializado com sucesso');
    } catch (error) {
        console.warn('Web Audio API não disponível:', error);
        // Fallback para notificações visuais apenas
    }
}

// Criar sons da chamada usando Web Audio API
function createCallSounds() {
    if (!callState.audioContext) return;
    
    // Som de toque (ring)
    callSounds.ringtone = createRingtone();
    
    // Sons de conectar/desconectar
    callSounds.connectSound = createBeep(800, 0.2);
    callSounds.endSound = createBeep(400, 0.5);
}

// Criar toque de chamada
function createRingtone() {
    if (!callState.audioContext) return null;
    
    const ringBuffer = callState.audioContext.createBuffer(1, callState.audioContext.sampleRate * 2, callState.audioContext.sampleRate);
    const data = ringBuffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
        const time = i / callState.audioContext.sampleRate;
        // Criar padrão de toque realístico
        const ring1 = Math.sin(2 * Math.PI * 440 * time) * (time < 0.5 ? 1 : 0);
        const ring2 = Math.sin(2 * Math.PI * 523 * time) * (time < 0.5 ? 1 : 0);
        data[i] = (ring1 + ring2) * 0.3 * Math.exp(-time * 2);
    }
    
    return ringBuffer;
}

// Criar beep
function createBeep(frequency, duration) {
    if (!callState.audioContext) return null;
    
    const buffer = callState.audioContext.createBuffer(1, callState.audioContext.sampleRate * duration, callState.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
        const time = i / callState.audioContext.sampleRate;
        data[i] = Math.sin(2 * Math.PI * frequency * time) * 0.5 * Math.exp(-time * 3);
    }
    
    return buffer;
}

// Reproduzir som
function playSound(soundBuffer, loop = false) {
    if (!callState.audioContext || !soundBuffer) return null;
    
    const source = callState.audioContext.createBufferSource();
    const gainNode = callState.audioContext.createGain();
    
    source.buffer = soundBuffer;
    source.loop = loop;
    gainNode.gain.value = callState.volume;
    
    source.connect(gainNode);
    gainNode.connect(callState.audioContext.destination);
    
    source.start();
    return source;
}

// Iniciar chamada de áudio
function startAudioCall(targetUser = null) {
    // Inicializar sistema de áudio se necessário
    if (!callState.audioContext) {
        initializeAudioSystem();
    }
    
    // Verificar permissões de microfone
    requestMicrophonePermission()
        .then(() => {
            // Abrir modal de chamada
            showCallInterface(targetUser);
            
            // Simular processo de chamada
            simulateCallProcess();
        })
        .catch(error => {
            console.warn('Permissão de microfone negada:', error);
            // Continuar sem microfone (apenas simulação)
            showCallInterface(targetUser);
            simulateCallProcess();
        });
}

// Solicitar permissão do microfone
function requestMicrophonePermission() {
    return new Promise((resolve, reject) => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    // Parar o stream imediatamente (só precisávamos da permissão)
                    stream.getTracks().forEach(track => track.stop());
                    resolve();
                })
                .catch(reject);
        } else {
            reject(new Error('getUserMedia não suportado'));
        }
    });
}

// Mostrar interface de chamada
function showCallInterface(targetUser = null) {
    const modal = document.getElementById('audioCallModal');
    if (!modal) return;
    
    // Configurar dados da chamada
    const user = targetUser || {
        name: currentProfile?.name || 'Usuário',
        photo: currentProfile?.photo || 'https://via.placeholder.com/120x120/a855c7/ffffff?text=User'
    };
    
    // Atualizar interface
    updateCallInterface(user);
    
    // Mostrar modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Adicionar classe de animação
    modal.classList.add('call-active');
}

// Atualizar interface de chamada
function updateCallInterface(user) {
    // Atualizar informações do usuário
    const callName = document.getElementById('callName');
    const callAvatar = document.getElementById('callAvatar');
    const callTitle = document.getElementById('callTitle');
    
    if (callName) callName.textContent = user.name;
    if (callAvatar) callAvatar.src = user.photo;
    if (callTitle) callTitle.textContent = `Chamando ${user.name.split(' ')[0]}...`;
    
    // Resetar timer
    updateCallTimer('00:00');
    
    // Resetar controles
    resetCallControls();
}

// Simular processo de chamada
function simulateCallProcess() {
    const callStatus = document.getElementById('callStatus');
    const callTitle = document.getElementById('callTitle');
    
    // Fase 1: Conectando (2-4 segundos)
    updateCallStatus('Conectando...', 'connecting');
    playRingtone();
    
    setTimeout(() => {
        // Fase 2: Chamando (3-6 segundos)
        updateCallStatus('Chamando...', 'calling');
        
        setTimeout(() => {
            // Fase 3: Conectado
            connectCall();
        }, Math.random() * 3000 + 3000); // 3-6 segundos
        
    }, Math.random() * 2000 + 2000); // 2-4 segundos
}

// Conectar chamada
function connectCall() {
    callState.isActive = true;
    callState.startTime = Date.now();
    
    // Parar toque e reproduzir som de conexão
    stopRingtone();
    if (callSounds.connectSound) {
        playSound(callSounds.connectSound);
    }
    
    // Atualizar interface
    updateCallStatus('Conectado', 'connected');
    document.getElementById('callTitle').textContent = 'Chamada em andamento';
    
    // Iniciar timer
    startCallTimer();
    
    // Iniciar animação de ondas sonoras
    startSoundWaveAnimation();
    
    // Simular ruído ambiente (opcional)
    startAmbientSound();
    
    // Notificar usuário
    showNotification('Chamada conectada!', 'A chamada foi estabelecida com sucesso.', '📞');
}

// Iniciar timer da chamada
function startCallTimer() {
    callState.timer = setInterval(() => {
        if (!callState.isActive) return;
        
        const elapsed = Date.now() - callState.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        updateCallTimer(timeString);
    }, 1000);
}

// Atualizar timer da chamada
function updateCallTimer(timeString) {
    const callTimer = document.getElementById('callTimer');
    if (callTimer) {
        callTimer.textContent = timeString;
    }
}

// Atualizar status da chamada
function updateCallStatus(status, className = '') {
    const callStatus = document.getElementById('callStatus');
    if (callStatus) {
        callStatus.textContent = status;
        callStatus.className = `call-status ${className}`;
    }
}

// Reproduzir toque
function playRingtone() {
    if (callSounds.ringtone && callState.audioContext) {
        callState.ringtoneSource = playSound(callSounds.ringtone, true);
    }
}

// Parar toque
function stopRingtone() {
    if (callState.ringtoneSource) {
        callState.ringtoneSource.stop();
        callState.ringtoneSource = null;
    }
}

// Iniciar animação de ondas sonoras
function startSoundWaveAnimation() {
    const soundWaves = document.querySelectorAll('.sound-wave');
    soundWaves.forEach((wave, index) => {
        wave.style.animationDelay = `${index * 0.2}s`;
        wave.classList.add('active');
    });
}

// Parar animação de ondas sonoras
function stopSoundWaveAnimation() {
    const soundWaves = document.querySelectorAll('.sound-wave');
    soundWaves.forEach(wave => {
        wave.classList.remove('active');
    });
}

// Iniciar som ambiente (simulação de conversa)
function startAmbientSound() {
    if (!callState.audioContext) return;
    
    // Criar ruído branco suave para simular ambiente de chamada
    const bufferSize = callState.audioContext.sampleRate * 0.1;
    const noiseBuffer = callState.audioContext.createBuffer(1, bufferSize, callState.audioContext.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.02; // Ruído muito baixo
    }
    
    callState.ambientSource = playSound(noiseBuffer, true);
}

// Parar som ambiente
function stopAmbientSound() {
    if (callState.ambientSource) {
        callState.ambientSource.stop();
        callState.ambientSource = null;
    }
}

// Alternar mute
function toggleMute() {
    callState.isMuted = !callState.isMuted;
    
    const muteBtn = document.getElementById('muteBtn');
    const icon = muteBtn.querySelector('.btn-icon');
    
    if (callState.isMuted) {
        muteBtn.classList.add('muted');
        icon.textContent = '🎤🚫';
        muteBtn.title = 'Ativar microfone';
        
        // Parar som ambiente
        stopAmbientSound();
        
        showNotification('Microfone silenciado', 'Seu microfone está desligado.', '🔇');
    } else {
        muteBtn.classList.remove('muted');
        icon.textContent = '🎤';
        muteBtn.title = 'Silenciar';
        
        // Reativar som ambiente
        if (callState.isActive) {
            startAmbientSound();
        }
        
        showNotification('Microfone ativado', 'Seu microfone está ligado.', '🎤');
    }
}

// Alternar alto-falante
function toggleSpeaker() {
    callState.speakerOn = !callState.speakerOn;
    
    const speakerBtn = document.getElementById('speakerBtn');
    const icon = speakerBtn.querySelector('.btn-icon');
    
    if (callState.speakerOn) {
        speakerBtn.classList.add('speaker-on');
        icon.textContent = '🔊';
        speakerBtn.title = 'Desativar alto-falante';
        
        // Aumentar volume
        callState.volume = Math.min(1.0, callState.volume * 1.5);
        
        showNotification('Alto-falante ativado', 'Áudio sendo reproduzido no alto-falante.', '🔊');
    } else {
        speakerBtn.classList.remove('speaker-on');
        icon.textContent = '🔉';
        speakerBtn.title = 'Ativar alto-falante';
        
        // Restaurar volume
        callState.volume = 0.7;
        
        showNotification('Alto-falante desativado', 'Áudio sendo reproduzido no fone.', '🔉');
    }
    
    // Atualizar volume do slider
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeLevel = document.getElementById('volumeLevel');
    if (volumeSlider && volumeLevel) {
        volumeSlider.value = Math.round(callState.volume * 100);
        volumeLevel.textContent = `${Math.round(callState.volume * 100)}%`;
    }
}

// Ajustar volume
function adjustVolume(value) {
    callState.volume = value / 100;
    
    const volumeLevel = document.getElementById('volumeLevel');
    if (volumeLevel) {
        volumeLevel.textContent = `${value}%`;
    }
    
    // Ajustar volume de todos os sons ativos
    if (callState.audioContext) {
        // Atualizar gain nodes se existirem
        // (implementação simplificada - em produção seria mais complexo)
    }
}

// Encerrar chamada
function endCall() {
    if (!callState.isActive && !document.getElementById('audioCallModal').classList.contains('call-active')) {
        // Se não há chamada ativa, apenas fechar modal
        closeCallModal();
        return;
    }
    
    // Confirmar encerramento se chamada está ativa
    if (callState.isActive) {
        const confirmEnd = confirm('Deseja realmente encerrar a chamada?');
        if (!confirmEnd) return;
    }
    
    // Parar todos os sons
    stopAllCallSounds();
    
    // Parar timer
    if (callState.timer) {
        clearInterval(callState.timer);
        callState.timer = null;
    }
    
    // Atualizar estado
    callState.isActive = false;
    callState.startTime = null;
    
    // Parar animações
    stopSoundWaveAnimation();
    
    // Reproduzir som de encerramento
    if (callSounds.endSound) {
        playSound(callSounds.endSound);
    }
    
    // Atualizar interface
    updateCallStatus('Chamada encerrada', 'ended');
    document.getElementById('callTitle').textContent = 'Chamada encerrada';
    
    // Notificar usuário
    showNotification('Chamada encerrada', 'A chamada foi finalizada.', '📞');
    
    // Fechar modal após delay
    setTimeout(() => {
        closeCallModal();
    }, 2000);
}

// Parar todos os sons da chamada
function stopAllCallSounds() {
    stopRingtone();
    stopAmbientSound();
    
    // Parar qualquer oscilador ativo
    if (callState.oscillator) {
        callState.oscillator.stop();
        callState.oscillator = null;
    }
}

// Fechar modal de chamada
function closeCallModal() {
    const modal = document.getElementById('audioCallModal');
    if (!modal) return;
    
    // Garantir que todos os sons foram parados
    stopAllCallSounds();
    
    // Fechar modal
    modal.classList.add('hidden');
    modal.classList.remove('call-active');
    document.body.style.overflow = '';
    
    // Resetar estado
    resetCallState();
}

// Resetar estado da chamada
function resetCallState() {
    callState.isActive = false;
    callState.isMuted = false;
    callState.speakerOn = false;
    callState.startTime = null;
    callState.volume = 0.7;
    
    if (callState.timer) {
        clearInterval(callState.timer);
        callState.timer = null;
    }
    
    resetCallControls();
}

// Resetar controles da chamada
function resetCallControls() {
    // Resetar botão mute
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        muteBtn.classList.remove('muted');
        muteBtn.querySelector('.btn-icon').textContent = '🎤';
        muteBtn.title = 'Silenciar';
    }
    
    // Resetar botão speaker
    const speakerBtn = document.getElementById('speakerBtn');
    if (speakerBtn) {
        speakerBtn.classList.remove('speaker-on');
        speakerBtn.querySelector('.btn-icon').textContent = '🔊';
        speakerBtn.title = 'Alto-falante';
    }
    
    // Resetar volume
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeLevel = document.getElementById('volumeLevel');
    if (volumeSlider && volumeLevel) {
        volumeSlider.value = 70;
        volumeLevel.textContent = '70%';
    }
}

// Gerenciar teclas de atalho durante chamada
document.addEventListener('keydown', function(e) {
    // Só responder a atalhos se modal de chamada estiver aberto
    if (document.getElementById('audioCallModal').classList.contains('hidden')) {
        return;
    }
    
    switch(e.key) {
        case 'm':
        case 'M':
            e.preventDefault();
            toggleMute();
            break;
            
        case 's':
        case 'S':
            e.preventDefault();
            toggleSpeaker();
            break;
            
        case 'Escape':
        case ' ':
            e.preventDefault();
            endCall();
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            const currentVolume = parseInt(document.getElementById('volumeSlider').value);
            adjustVolume(Math.min(100, currentVolume + 10));
            document.getElementById('volumeSlider').value = Math.min(100, currentVolume + 10);
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            const currentVolumeDown = parseInt(document.getElementById('volumeSlider').value);
            adjustVolume(Math.max(0, currentVolumeDown - 10));
            document.getElementById('volumeSlider').value = Math.max(0, currentVolumeDown - 10);
            break;
    }
});

// Fechar modal ao clicar fora (apenas se não estiver em chamada ativa)
document.addEventListener('click', function(e) {
    const modal = document.getElementById('audioCallModal');
    if (e.target === modal && !callState.isActive) {
        closeCallModal();
    }
});

// Inicializar sistema ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de áudio após interação do usuário
    // (necessário devido às políticas de autoplay dos browsers)
    document.addEventListener('click', function initAudioOnFirstClick() {
        initializeAudioSystem();
        document.removeEventListener('click', initAudioOnFirstClick);
    }, { once: true });
});

// Exportar funções para uso global
window.startAudioCall = startAudioCall;
window.toggleMute = toggleMute;
window.toggleSpeaker = toggleSpeaker;
window.adjustVolume = adjustVolume;
window.endCall = endCall;
