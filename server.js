const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Middleware to disable caching
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Custom 404 handler
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

