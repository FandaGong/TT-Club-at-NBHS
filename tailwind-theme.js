// tailwind-theme.js
tailwind.config = {
    theme: {
        extend: {
            colors: {
                red: {
                    50: '#fdf2f2',   // Very light red tint (Backgrounds)
                    100: '#fee2e2',  // Light red (Borders/Cards)
                    200: '#fecaca',  // Muted red (Subtext)
                    500: '#ef4444',  // Bright Red (Focus rings)
                    600: '#ef4444',  // Bright Red (Buttons/Hover)
                    700: '#b91c1c',  // Medium-dark red (Gradients)
                    800: '#991b1b',  // Deep Red (Primary Header)
                    900: '#7f1d1d',  // Very Dark Red (Headings)
                },
                slate: {
                    900: '#111827',  // Near Black (Main text)
                }
            }
        }
    }
}
