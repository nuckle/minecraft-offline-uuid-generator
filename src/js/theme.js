export const toggleColorMode = (e) => {
    // Switch to Light Mode
    if (e.currentTarget.classList.contains('light--hidden')) {
        // Sets the custom HTML attribute
        document.documentElement.setAttribute('color-mode', 'light');

        //Sets the user's preference in local storage
        localStorage.setItem('color-mode', 'light');
        return;
    }

    /* Switch to Dark Mode
        Sets the custom HTML attribute */
    document.documentElement.setAttribute('color-mode', 'dark');

    // Sets the user's preference in local storage
    localStorage.setItem('color-mode', 'dark');
};
