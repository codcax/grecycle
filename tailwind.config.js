module.exports = {
    content: ["./src/views/**/*.{html,js,ejs}"],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'primary-green': '#3F6A51',
                'header-green': '#071912',
                'secondary-green': '#4AD19D',
                'tertiary-green': '#e4f8f0',
                'dark-primary-green': '#081c15',
                'dark-secondary-green': '#95d5b2'
            },
            fontFamily: {
              'montserrat': ['Montserrat', 'san-serif']
            },
        },
    },
    plugins: [],
}
