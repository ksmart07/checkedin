const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({
    origin: '*',
    credentials: false
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'Visitor Kiosk API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        port: port
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Directory search endpoint (using your existing data)
app.post('/api/directory/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ 
                error: 'Query must be at least 2 characters',
                users: [],
                count: 0
            });
        }

        // Use your existing staff directory from localStorage
        // This will be populated from your frontend
        const users = [
            {
                id: 'user1',
                displayName: 'John Smith',
                mail: 'john.smith@company.com',
                jobTitle: 'Software Developer',
                department: 'IT'
            },
            {
                id: 'user2', 
                displayName: 'Sarah Johnson',
                mail: 'sarah.johnson@company.com',
                jobTitle: 'Project Manager',
                department: 'Operations'
            }
        ];

        // Filter based on query
        const filteredUsers = users.filter(user => 
            user.displayName.toLowerCase().includes(query.toLowerCase()) ||
            user.mail.toLowerCase().includes(query.toLowerCase()) ||
            user.department.toLowerCase().includes(query.toLowerCase()) ||
            user.jobTitle.toLowerCase().includes(query.toLowerCase())
        );

        res.json({
            users: filteredUsers,
            count: filteredUsers.length,
            query: query
        });

    } catch (error) {
        console.error('Directory search error:', error);
        res.status(500).json({ 
            error: 'Directory search failed',
            message: error.message,
            users: [],
            count: 0
        });
    }
});

// Email endpoint (basic implementation)
app.post('/api/mail/send', async (req, res) => {
    try {
        const { to, subject, body } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ 
                error: 'Missing required fields: to, subject, body',
                success: false
            });
        }

        // Log email (in production, implement actual email sending)
        console.log('Email request:', { to, subject, body });

        res.json({
            success: true,
            messageId: 'email-' + Date.now(),
            timestamp: new Date().toISOString(),
            note: 'Email logged - configure SMTP for actual sending'
        });

    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ 
            error: 'Email send failed',
            message: error.message,
            success: false
        });
    }
});

// Token validation endpoint
app.post('/api/auth/token', async (req, res) => {
    try {
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            valid: true
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Token validation failed' 
        });
    }
});

// SharePoint upload endpoint
app.post('/api/sharepoint/upload', async (req, res) => {
    try {
        const { monthlyData, monthName, year } = req.body;

        console.log('SharePoint upload request:', { monthName, year });

        res.json({
            success: true,
            visitorsUploaded: monthlyData?.visitors?.length || 0,
            staffUploaded: monthlyData?.staff?.length || 0,
            month: monthName,
            year: year,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('SharePoint upload error:', error);
        res.status(500).json({ 
            error: 'SharePoint upload failed',
            message: error.message,
            success: false
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Visitor Kiosk Backend running on port ${port}`);
    console.log(`📊 Health check: /health`);
    console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
