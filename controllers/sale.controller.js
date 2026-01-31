import { db } from "../db.config.js";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
const saleCtrl = {};


saleCtrl.listSales = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query

        let user = req.user ? req.user : null;

        let filter = []
        let params = []

        if (user) {
            filter.push(`s.user_id = $${params.length + 1}`)
            params.push(user.id)
        }

        if (search) {
            filter.push(`(s.reference_code ILIKE  FACT-OJ-$${params.length + 1} OR u.document_number ILIKE $${params.length + 1})`)
            params.push(`${search}%`)
        }

        if (status) {
            filter.push(`s.status = $${params.length + 1}`)
            params.push(status)
        }

        let sql = `FROM sales s 
        LEFT JOIN users u ON u.id = s.user_id 
        LEFT JOIN sales_details sd ON sd.sale_id = s.id 
        LEFT JOIN products p ON p.id = sd.product_id `

        if (filter.length > 0) {
            sql += ` WHERE ` + filter.join(' AND ')
        }

        let totalRows = await db.query(`SELECT (COUNT(DISTINCT s.id)::INT) ${sql}`, params)


        sql += ` GROUP BY s.id, u.id`

        sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        const offset = (page - 1) * limit
        params.push(Number(limit), Number(offset))


        let sales = await db.query(`SELECT s.*, u.id,
            
            jsonb_build_object(
                'name', u.first_name,
                'phone', u.email,
                'email', u.phone,
                'document_number', u.document_number
                ) AS user,
            
            ARRAY_AGG(
            jsonb_build_object(
                'product', p.name,
                'quantity', sd.quantity,
                'price', sd.unit_price
                )) AS sale_details  
        
            ${sql}`, params)

        res.status(200).json({ msg: { sales: sales.rows, totalRows: totalRows.rows[0].count } })

    } catch (error) {
        console.log("error en sel seever", error);
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, intenta de nuevo mas tarde" })
    }

}

saleCtrl.generateSale = async (req, res) => {
    try {
        let { userId, products } = req.body;

        userId = req.user.id ? req.user : userId;
        let referenceCode = uuidv4();

        await db.query(`BEGIN`)

        let sale = await db.query('INSERT INTO sales (user_id,reference_code) VALUES ($1,$2) RETURNING id', [userId.id, referenceCode]);

        await db.query(`
        INSERT INTO sales_details (sale_id, product_id, quantity ,unit_price, subtotal)
        SELECT $1, p.product_id, p.quantity, pr.price, (((pr.tax_rate / 100) * pr.price) + pr.price) * p.quantity 
        FROM jsonb_to_recordset($2::jsonb) AS p(
            product_id INT,
            quantity INT
        )  
        LEFT JOIN products pr ON pr.id = p.product_id `, [sale.rows[0].id, JSON.stringify(products)]
        )

        let items = await db.query(`
            UPDATE products pr SET stock =pr.stock - p.quantity

            FROM jsonb_to_recordset($1::jsonb) AS p(
            product_id INT,
            quantity INT)

            WHERE pr.id = p.product_id  
            RETURNING *
            `,
            [JSON.stringify(products)]
        )

        let urlFactus = await generateSaleWithFactus(userId, items);

        if (urlFactus.ok == false) {
            await db.query("ROLLBACK")
            return res.status(500).json({ msg: urlFactus })
        }
        await db.query(`UPDATE sales SET total = (SELECT SUM(subtotal) FROM sales_details WHERE sale_id = $1), url_factus=$2 WHERE id = $1`,
            [sale.rows[0].id, urlFactus]
        );
        await db.query("COMMIT")
        res.status(200).json({ msg: "Venta generada con exito." });
    }
    catch (error) {
        await db.query("ROLLBACK")
        console.log(error);
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

const generateSaleWithFactus = async (customer, items) => {
    try {
        let codeSale = uuidv4();

        let payloadItems = items.rows.map(item => {
            return {
                code_reference: item.code_reference,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                tax_rate: item.tax_rate,
                unit_measure_id: item.unit_measure_id,
                discount_rate: 0,
                standard_code_id: item.standard_code_id,
                is_excluded: item.is_excluded,
                tribute_id: item.tribute_id,
            }
        });

        let response = await axios.post('https://api-sandbox.factus.com.co/v1/bills/validate', {
            // Datos de la factura a generar
            numbering_range_id: 8,
            reference_code: `FACT-OJ-${codeSale}`,
            observation: "Factura de prueba",
            payment_form: "1",
            payment_method_code: "10",
            operation_type: "10",
            send_email: true,
            customer: {
                identification_document_id: 3,
                identification: customer.document_number,
                names: customer.first_name + " " + customer.last_name,
                email: customer.email,
                phone: customer.phone,
                legal_organization_id: customer.legal_organization_id,
                tribute_id: customer.tribute_id,
                municipality_id: customer.municipality_id,
            },
            items: payloadItems

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customer.access_token}`
            }
        }
        );

        return response.data.data.bill.public_url;
    }
    catch (error) {
        return { ok: false, msg: "Ha ocurrido un error al generar la factura con factus." }
    }

}



export { saleCtrl };