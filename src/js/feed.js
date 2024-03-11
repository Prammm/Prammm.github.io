var btnInstall = document.querySelector('#install-button');

btnInstall.addEventListener('click', triggerInstallPrompt);

function triggerInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (result) {
      console.log(result.outcome);

      if (result.outcome === 'dismissed') {
        console.log('Installation aborted by the user');
      } else {
        console.log('Application successfully added to the home screen');
      }
    });

    deferredPrompt = null;
  }
}
