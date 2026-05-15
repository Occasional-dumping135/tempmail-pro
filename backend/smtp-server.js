require('dotenv').config();
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const { Pool } = require('pg');
const { createClient } = require('redis');

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 50
});

// Redis client
let redisClient;
let pubClient;

(async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
      }
    });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
    
    pubClient = redisClient.duplicate();
    await pubClient.connect();
    
    console.log('Redis connected for SMTP');
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

// Valid domains
const VALID_DOMAINS = process.env.SUBDOMAINS.split(',').map(s => s + '.' + process.env.DOMAIN);

// Create SMTP server
const smtpServer = new SMTPServer({
  secure: false,
  authOptional: true,
  disabledCommands: ['AUTH'],
  allowInsecureAuth: true,
  size: 25 * 1024 * 1024,
  
  onConnect(session, callback) {
    console.log('SMTP Connection from ' + session.remoteAddress);
    return callback();
  },
  
  onMailFrom(address, session, callback) {
    console.log('Mail from: ' + address.address);
    return callback();
  },
  
  onRcptTo(address, session, callback) {
    const email = address.address.toLowerCase();
    const domain = email.split('@')[1];
    
    if (!VALID_DOMAINS.includes(domain)) {
      console.log('Rejected: Invalid domain ' + domain);
      return callback(new Error('Invalid recipient domain'));
    }
    
    console.log('Recipient accepted: ' + email);
    return callback();
  },
  
  async onData(stream, session, callback) {
    let emailData = '';
    
    stream.on('data', (chunk) => {
      emailData += chunk.toString();
    });
    
    stream.on('end', async () => {
      try {
        const parsed = await simpleParser(emailData);
        
        for (const recipient of session.envelope.rcptTo) {
          const recipientEmail = recipient.address.toLowerCase();
          
          const emailResult = await pool.query(
            'SELECT id, token_id FROM emails WHERE full_address = $1 AND expires_at > NOW()',
            [recipientEmail]
          );
          
          if (emailResult.rows.length === 0) {
            console.log('Email not found: ' + recipientEmail);
            continue;
          }
          
          const emailRecord = emailResult.rows[0];
          
          const messageResult = await pool.query(
            'INSERT INTO messages (email_id, sender, subject, body_text, body_html) VALUES ($1, $2, $3, $4, $5) RETURNING id, sender, subject, received_at',
            [
              emailRecord.id,
              parsed.from?.text || session.envelope.mailFrom.address,
              parsed.subject || '(No Subject)',
              parsed.text || '',
              parsed.html || ''
            ]
          );
          
          console.log('Message saved for ' + recipientEmail + ': ' + parsed.subject);
          
          if (pubClient) {
            await pubClient.publish('new_email', JSON.stringify({
              emailId: emailRecord.id,
              tokenId: emailRecord.token_id,
              message: messageResult.rows[0]
            }));
          }
        }
        
        callback();
      } catch (err) {
        console.error('Error processing email:', err);
        callback(err);
      }
    });
  }
});

const SMTP_PORT = process.env.SMTP_PORT || 25;
smtpServer.listen(SMTP_PORT, '0.0.0.0', () => {
  console.log('SMTP Server listening on port ' + SMTP_PORT);
});

smtpServer.on('error', (err) => {
  console.error('SMTP Server error:', err);
});
