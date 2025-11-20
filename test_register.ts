
const response = await fetch('http://localhost:8000/make-server/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User'
  })
});

console.log('Status:', response.status);
const text = await response.text();
console.log('Body:', text);
