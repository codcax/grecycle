//Dark mode toggle
const sunIcon = document.querySelector('.sun');
const moonIcon = document.querySelector('.moon')
const userTheme = localStorage.getItem('theme');

const darkModeToggle = () => {
    moonIcon.classList.toggle('display-none');
    sunIcon.classList.toggle('display-none')
};

const darkModeCheck = () => {
    if (userTheme === 'dark') {
        document.documentElement.classList.add('dark');
        moonIcon.classList.add('display-none');
        return;
    }

    sunIcon.classList.add('display-none');
};

const darkModeSwitch = () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        darkModeToggle();
        return
    }
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    darkModeToggle();
};

sunIcon.addEventListener('click', () => {
    darkModeSwitch();
});

moonIcon.addEventListener('click', () => {
    darkModeSwitch();
});

darkModeCheck();

//Hamburger Menu
const hamburgerIcon = document.getElementById('hamburger-icon');
const mobileMenu =document.getElementById('mobile-menu');
const hamburgerClose =document.getElementById('hamburger-close');

const mobileMenuToggle = () =>  {
    mobileMenu.classList.toggle('-translate-x-full');
};

hamburgerIcon.addEventListener('click', () => {
   mobileMenuToggle();
});

hamburgerClose.addEventListener('click', () => {
    mobileMenuToggle();
});