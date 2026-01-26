// Script para limpar service workers antigos
// Execute no console do navegador se houver problemas com PWA

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker desregistrado:', registration.scope);
    }
  });
  
  // Limpa caches
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('Cache deletado:', name);
    }
  });
  
  console.log('✅ Limpeza de Service Workers e Caches concluída!');
  console.log('🔄 Recarregue a página para aplicar as mudanças.');
}
