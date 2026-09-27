import request from 'supertest';
import 'dotenv/config';

export function api() {
    return request(process.env.BASE_URL || 'http://localhost:3000');
}