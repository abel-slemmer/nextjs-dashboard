import { Database } from 'bun:sqlite';
import bcrypt from 'bcrypt';
import { invoices, customers, revenue, users } from 'app/lib/placeholder-data';

const db = new Database('db.sqlite', { strict: true });
db.loadExtension('sql/lib/uuid.so');

function seedUsers() {
    db.query(
        `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY DEFAULT (uuid4()),
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
            );
            `,
    ).run();

    const insertedUsers = users.map((user) => {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        return db
            .query(
                `
                INSERT INTO users ( name, email, password)
                VALUES ( "${user.name}", "${user.email}", "${hashedPassword}")
                ON CONFLICT (email) DO NOTHING`,
            )
            .run();
    });

    return insertedUsers;
}

function seedInvoices() {
    db.query(
        `
        CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY DEFAULT (uuid4()),
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL);
        `,
    ).run();

    const insertedInvoices = invoices.map((invoice) => {
        return db.query(
               `INSERT INTO invoices (customer_id, amount, status, date)
                VALUES ("${invoice.customer_id}", "${invoice.amount}", "${invoice.status}", "${invoice.date}")
                ON CONFLICT (id) DO NOTHING;
                  `,
        ).run();
    });

    return insertedInvoices;
}

seedUsers();
seedInvoices();
// async function seedCustomers() {
//   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await client.sql`
//     CREATE TABLE IF NOT EXISTS customers (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       image_url VARCHAR(255) NOT NULL
//     );
//   `;

//   const insertedCustomers = await Promise.all(
//     customers.map(
//       (customer) => client.sql`
//         INSERT INTO customers (id, name, email, image_url)
//         VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedCustomers;
// }

// async function seedRevenue() {
//   await client.sql`
//     CREATE TABLE IF NOT EXISTS revenue (
//       month VARCHAR(4) NOT NULL UNIQUE,
//       revenue INT NOT NULL
//     );
//   `;

//   const insertedRevenue = await Promise.all(
//     revenue.map(
//       (rev) => client.sql`
//         INSERT INTO revenue (month, revenue)
//         VALUES (${rev.month}, ${rev.revenue})
//         ON CONFLICT (month) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedRevenue;
// }

// export async function GET() {
//   try {
//     await client.sql`BEGIN`;
//     await seedUsers();
//     await seedCustomers();
//     await seedInvoices();
//     await seedRevenue();
//     await client.sql`COMMIT`;

//     return Response.json({ message: 'Database seeded successfully' });
//   } catch (error) {
//     await client.sql`ROLLBACK`;
//     return Response.json({ error }, { status: 500 });
//   }
// }
