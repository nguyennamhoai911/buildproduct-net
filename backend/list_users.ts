
import { db } from './src/db';
import { users } from './src/db/schema';
import * as fs from 'fs';

async function listUsers() {
    try {
        const allUsers = await db.select().from(users);
        fs.writeFileSync('user_list.json', JSON.stringify(allUsers, null, 2));
        console.log('User list written to user_list.json');
    } catch (error: any) {
        fs.writeFileSync('user_list_error.txt', error.toString());
    }
}

listUsers();
