//Snackbar messages
const snackbar = document.getElementById('snackbar');

const checkSnackbar = () => {
    if (snackbar.classList.contains('displayed')) {
        return;
    }
    showSnackbar();
    snackbarTimeout();
}

const showSnackbar = () => {
    snackbar.classList.remove('display-none');
    snackbar.classList.add('displayed');
}
const hideSnackbar = () => {
    snackbar.classList.add('display-none');
}

const snackbarTimeout = () => {
    setTimeout(hideSnackbar, 5000);
}

const snackbarFunction = () => {
    if (!snackbar) {
        return;
    }
    checkSnackbar();
}

document.addEventListener('DOMContentLoaded', function () {
    snackbarFunction();
}, false);