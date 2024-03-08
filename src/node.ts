import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';

console.log(randomBytes(16).toString('hex'));
hash('1234', 10).then(console.log);
